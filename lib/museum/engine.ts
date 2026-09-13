import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { Sky } from "three/addons/objects/Sky.js";
import { collisionWorld, MuseumPlayer, SPAWN } from "./physics";
import { prepareModel, type Exhibit } from "./model";
import type { Water } from "three/addons/objects/Water.js";

const LOOK_SPEED = 0.0022;
// Seconds to cover ~63% of the remaining angle. Low enough to stay responsive,
// high enough to smooth jittery trackpad and touch deltas.
const LOOK_SMOOTHING = 0.045;

export type MuseumCallbacks = {
  progress: (percent: number) => void;
  ready: () => void;
  active: (active: boolean) => void;
  hover: (id: string | null) => void;
  open: (id: string) => void;
  gallery: () => void;
  error: (message: string) => void;
  position: (position: [number, number, number], yaw: number) => void;
};

function disposeObjects(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    geometries.add(object.geometry);
    (Array.isArray(object.material) ? object.material : [object.material]).forEach((m) => materials.add(m));
  });
  materials.forEach((m) => {
    Object.values(m).forEach((value) => { if (value instanceof THREE.Texture) textures.add(value); });
    m.dispose();
  });
  textures.forEach((t) => { t.dispose(); if (t.image instanceof ImageBitmap) t.image.close(); });
  geometries.forEach((g) => g.dispose());
}

export class MuseumEngine {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(65, 1, 0.08, 200);
  readonly touch = matchMedia("(pointer: coarse)").matches;
  private readonly callbacks: MuseumCallbacks;
  private readonly abort = new AbortController();
  private readonly resizeObserver: ResizeObserver;
  private readonly clock = new THREE.Timer();
  private readonly keys = new Set<string>();
  private readonly raycaster = new THREE.Raycaster();
  private readonly sun = new THREE.DirectionalLight(0xffdfb4, 3.8);
  private readonly environment: THREE.WebGLRenderTarget;
  private player?: MuseumPlayer;
  private world?: ReturnType<typeof collisionWorld>;
  private water?: Water;
  private waterReflect?: THREE.Mesh["onBeforeRender"];
  private exhibits: Exhibit[] = [];
  private pickables: THREE.Object3D[] = [];
  private yaw = 0;
  private pitch = -0.07;
  private targetYaw = 0;
  private targetPitch = -0.07;
  private elapsed = 0;
  private lastStatus = 0;
  private lastRay = 0;
  private hovered: string | null = null;
  private dragging?: { id: number; x: number; y: number; startX: number; startY: number };
  private stick = { x: 0, y: 0 };
  private jump = false;
  private disposed = false;
  private loaded = false;
  private active = false;
  private reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  private balanced = this.touch;

  constructor(container: HTMLElement, callbacks: MuseumCallbacks) {
    this.callbacks = callbacks;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, this.touch ? 1 : 1.5));
    this.renderer.toneMapping = THREE.AgXToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.shadowMap.autoUpdate = false;
    this.renderer.setClearColor(0xc2cfc6);
    this.renderer.domElement.setAttribute("aria-label", "Flooded museum. Use the gallery menu for a guided visit.");
    this.renderer.domElement.setAttribute("role", "img");
    container.appendChild(this.renderer.domElement);
    this.scene.fog = new THREE.FogExp2(0x9eb0a4, 0.004);
    this.scene.add(new THREE.HemisphereLight(0xd4e6ed, 0x35412c, 0.22));

    const sky = new Sky();
    sky.scale.setScalar(1000);
    sky.material.uniforms.turbidity.value = 5;
    sky.material.uniforms.rayleigh.value = 1.2;
    sky.material.uniforms.sunPosition.value.set(0.52, 0.59, 0.62);
    sky.material.uniforms.showSunDisc.value = false;
    const skyScene = new THREE.Scene();
    skyScene.add(sky);
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.environment = pmrem.fromScene(skyScene, 0.04, 0.1, 2000);
    this.scene.environment = this.environment.texture;
    this.scene.environmentIntensity = 0.1;
    this.scene.add(sky);
    pmrem.dispose();

    this.sun.position.set(52, 59, 62);
    this.sun.castShadow = true;
    Object.assign(this.sun.shadow.camera, { left: -44, right: 44, top: 44, bottom: -44, near: 1, far: 160 });
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.normalBias = 0.055;
    this.sun.shadow.bias = -0.00008;
    this.scene.add(this.sun, this.sun.target);
    this.camera.position.set(...SPAWN);
    this.camera.rotation.order = "YXZ";
    this.updateRotation();
    this.resizeObserver = new ResizeObserver(() => {
      const { width, height } = container.getBoundingClientRect();
      this.renderer.setSize(width, height);
      this.camera.aspect = width / Math.max(height, 1);
      this.camera.updateProjectionMatrix();
    });
    this.resizeObserver.observe(container);
    const options = { signal: this.abort.signal };
    document.addEventListener("keydown", this.keyDown, options);
    document.addEventListener("keyup", this.keyUp, options);
    document.addEventListener("pointerlockchange", this.lockChange, options);
    document.addEventListener("visibilitychange", this.visibilityChange, options);
    window.addEventListener("blur", this.pause, options);
    const canvas = this.renderer.domElement;
    canvas.addEventListener("pointerdown", this.pointerDown, options);
    canvas.addEventListener("pointermove", this.pointerMove, options);
    canvas.addEventListener("pointerup", this.pointerUp, options);
    canvas.addEventListener("pointercancel", this.pointerCancel, options);
    canvas.addEventListener("webglcontextlost", this.contextLost, options);
    this.renderer.setAnimationLoop(this.frame);
    void this.load();
  }

  private async load() {
    try {
      const geometryPromise = fetch("/museum/collision.json", { signal: this.abort.signal }).then(async (response) => {
        if (!response.ok) throw new Error("Collision file unavailable");
        return response.json() as Promise<{ triangles: number[] }>;
      });
      const modelPromise = (async () => {
        const response = await fetch("/museum/museum.glb", { signal: this.abort.signal });
        if (!response.ok) throw new Error("Museum file unavailable");
        const total = Number(response.headers.get("content-length")) || 0;
        const reader = response.body?.getReader();
        if (!reader) return response.arrayBuffer();
        const chunks: Uint8Array[] = [];
        let received = 0;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          received += value.byteLength;
          this.callbacks.progress(total ? Math.min(85, Math.round(received / total * 85)) : 20);
        }
        const bytes = new Uint8Array(received);
        let offset = 0;
        chunks.forEach((chunk) => { bytes.set(chunk, offset); offset += chunk.length; });
        return bytes.buffer;
      })();
      const [bytes, collision] = await Promise.all([modelPromise, geometryPromise]);
      const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(bytes, "/museum/");
      if (this.disposed) { disposeObjects(gltf.scene); return; }
      this.callbacks.progress(90);
      this.scene.add(gltf.scene);
      this.world = collisionWorld(collision.triangles);
      this.player = new MuseumPlayer(this.world);
      const model = await prepareModel(gltf.scene, this.scene, () => this.disposed);
      if (this.disposed) { disposeObjects(this.scene); return; }
      this.pickables = model.pickables;
      this.exhibits = model.exhibits;
      this.water = model.water;
      this.waterReflect = this.water?.onBeforeRender;
      this.setQuality(this.balanced);
      this.renderer.shadowMap.needsUpdate = true;
      await this.renderer.compileAsync(this.scene, this.camera);
      if (this.disposed) return;
      this.loaded = true;
      this.callbacks.progress(100);
      this.callbacks.ready();
    } catch (error) {
      if (this.disposed || (error instanceof DOMException && error.name === "AbortError")) return;
      console.error("Museum loading failed", error);
      this.callbacks.error("The museum could not load. Retry, or explore the projects in the gallery menu.");
    }
  }

  play = () => {
    if (!this.loaded || this.disposed) return;
    this.keys.clear();
    this.lastRay = 0;
    this.active = true;
    this.callbacks.active(true);
    if (!this.touch && document.pointerLockElement !== this.renderer.domElement) {
      // Drag-to-look remains available when pointer lock is blocked by the browser.
      try { this.renderer.domElement.requestPointerLock()?.catch(() => {}); } catch { /* drag fallback */ }
    }
  };

  pause = () => {
    this.active = false;
    this.keys.clear();
    this.stick = { x: 0, y: 0 };
    this.jump = false;
    this.dragging = undefined;
    this.hovered = null;
    this.player?.stop();
    if (document.pointerLockElement === this.renderer.domElement) document.exitPointerLock();
    if (!this.disposed) { this.callbacks.active(false); this.callbacks.hover(null); }
  };

  reset = () => {
    this.pause();
    this.player?.teleport(...SPAWN);
    this.yaw = this.targetYaw = 0;
    this.pitch = this.targetPitch = -0.07;
    this.camera.position.set(...SPAWN);
    this.updateRotation();
    this.reportPosition();
  };

  visit = (id: string) => {
    const exhibit = this.exhibits.find((e) => e.project.id === id);
    if (!exhibit || !this.player) return;
    this.pause();
    this.player.teleport(exhibit.visit.x, exhibit.visit.y, exhibit.visit.z);
    this.camera.position.copy(exhibit.visit);
    this.camera.lookAt(exhibit.position);
    this.yaw = this.targetYaw = this.camera.rotation.y;
    this.pitch = this.targetPitch = this.camera.rotation.x;
    this.reportPosition();
  };

  setStick = (x: number, y: number) => { this.stick = { x, y }; };
  requestJump = () => { this.jump = true; };
  interact = () => { if (this.hovered) this.open(this.hovered); };
  setQuality = (balanced: boolean) => {
    this.balanced = balanced;
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, balanced ? 1 : 1.5));
    if (this.water && this.waterReflect) {
      // Balanced mode reuses the reflection between updates; it keeps the same water.
      let previous = -Infinity;
      const renderReflection = this.waterReflect;
      this.water.onBeforeRender = (...args) => {
        if (balanced && this.elapsed - previous < 1 / 12) return;
        previous = this.elapsed;
        renderReflection.apply(this.water!, args);
      };
    }
  };

  private updateRotation() { this.camera.rotation.set(this.pitch, this.yaw, 0, "YXZ"); }
  private reportPosition() {
    this.callbacks.position(this.camera.position.toArray().map((n) => Math.round(n * 100) / 100) as [number, number, number], this.yaw);
  }
  private pick(x = 0, y = 0) {
    this.raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);
    this.raycaster.far = 15;
    const hit = this.raycaster.intersectObjects(this.pickables, false)[0];
    if (!hit) return null;
    const obstruction = this.world?.rayIntersect(this.raycaster.ray);
    if (obstruction && obstruction.distance + 0.08 < hit.distance) return null;
    return typeof hit.object.userData.project_id === "string" ? hit.object.userData.project_id : null;
  }
  private open(id: string) { this.pause(); this.callbacks.open(id); }

  private frame = () => {
    if (this.disposed) return;
    this.clock.update();
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.elapsed += dt;
    if (document.hidden || !this.loaded) return;
    // Ease the camera toward the pointer target instead of snapping to each event.
    // Frame-rate independent, so a phone at 30fps turns at the same speed as 120fps.
    const ease = 1 - Math.exp(-dt / LOOK_SMOOTHING);
    this.yaw += (this.targetYaw - this.yaw) * ease;
    this.pitch += (this.targetPitch - this.pitch) * ease;
    this.updateRotation();
    if (this.loaded && this.active && this.player) {
      const strafe = Number(this.keys.has("KeyD") || this.keys.has("ArrowRight")) - Number(this.keys.has("KeyA") || this.keys.has("ArrowLeft")) + this.stick.x;
      const forward = Number(this.keys.has("KeyW") || this.keys.has("ArrowUp")) - Number(this.keys.has("KeyS") || this.keys.has("ArrowDown")) - this.stick.y;
      this.player.step(dt, strafe, forward, this.yaw, this.jump, this.keys.has("ShiftLeft") || this.keys.has("ShiftRight"));
      this.jump = false;
      this.camera.position.copy(this.player.eye);
      if (this.elapsed - this.lastRay > 0.12) {
        this.lastRay = this.elapsed;
        const id = this.pick();
        if (id !== this.hovered) { this.hovered = id; this.callbacks.hover(id); }
      }
    }
    if (this.elapsed - this.lastStatus > 0.25) { this.lastStatus = this.elapsed; this.reportPosition(); }
    if (this.water && !this.reduced) this.water.material.uniforms.time.value = this.elapsed * 0.35;
    this.renderer.render(this.scene, this.camera);
  };

  private keyDown = (event: KeyboardEvent) => {
    if (!this.active) return;
    if (["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(event.code)) event.preventDefault();
    this.keys.add(event.code);
    if (event.code === "Space" && !event.repeat) this.jump = true;
    if (event.code === "KeyE" && !event.repeat) this.interact();
    if (event.code === "KeyG" && !event.repeat) { this.pause(); this.callbacks.gallery(); }
    if (event.code === "Escape") this.pause();
  };
  private keyUp = (event: KeyboardEvent) => { this.keys.delete(event.code); };
  private lockChange = () => { if (document.pointerLockElement !== this.renderer.domElement && this.active) this.pause(); };
  private visibilityChange = () => { if (document.hidden) this.pause(); };
  private contextLost = (event: Event) => {
    event.preventDefault(); this.pause();
    this.renderer.setAnimationLoop(null);
    this.callbacks.error("The graphics connection was interrupted. Retry to reopen the museum.");
  };
  private pointerDown = (event: PointerEvent) => {
    if (!this.active) return;
    if (document.pointerLockElement === this.renderer.domElement) { this.interact(); return; }
    if (this.dragging) return;
    this.dragging = { id: event.pointerId, x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY };
    this.renderer.domElement.setPointerCapture(event.pointerId);
  };
  private pointerMove = (event: PointerEvent) => {
    if (!this.active) return;
    const locked = document.pointerLockElement === this.renderer.domElement;
    if (!locked && this.dragging?.id !== event.pointerId) return;
    const dx = locked ? event.movementX : event.clientX - this.dragging!.x;
    const dy = locked ? event.movementY : event.clientY - this.dragging!.y;
    this.targetYaw -= dx * LOOK_SPEED;
    this.targetPitch = Math.max(-1.35, Math.min(1.35, this.targetPitch - dy * LOOK_SPEED));
    if (this.dragging) { this.dragging.x = event.clientX; this.dragging.y = event.clientY; }
  };
  private pointerUp = (event: PointerEvent) => {
    if (this.dragging?.id !== event.pointerId) return;
    if (Math.hypot(event.clientX - this.dragging.startX, event.clientY - this.dragging.startY) < 8) {
      const rect = this.renderer.domElement.getBoundingClientRect();
      const id = this.pick((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
      if (id) this.open(id);
    }
    this.pointerCancel();
  };
  private pointerCancel = () => { this.dragging = undefined; };

  dispose() {
    this.disposed = true;
    this.pause();
    this.abort.abort();
    this.resizeObserver.disconnect();
    this.clock.dispose();
    this.renderer.setAnimationLoop(null);
    this.environment.dispose();
    this.sun.shadow.map?.dispose();
    disposeObjects(this.scene);
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.renderer.domElement.remove();
  }
}
