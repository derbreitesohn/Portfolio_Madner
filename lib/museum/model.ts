import * as THREE from "three";
import { Water } from "three/addons/objects/Water.js";
import { museumProjects, type MuseumProject } from "./projects";
import { GALLERY_EYE_Y } from "./physics";
import { plaqueSurface } from "./plaque";

export type Exhibit = {
  project: MuseumProject;
  position: THREE.Vector3;
  visit: THREE.Vector3;
};

function canvasTexture(width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas drawing is unavailable");
  draw(ctx);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function artwork(project: MuseumProject, aspect: number, image?: HTMLImageElement) {
  const width = 1024, height = Math.round(width / aspect);
  return canvasTexture(width, height, (ctx) => {
    if (image) {
      // Cover the opening without stretching or adding a mount/title strip.
      const fit = Math.max(width / image.width, height / image.height);
      const w = image.width * fit, h = image.height * fit;
      ctx.drawImage(image, (width - w) / 2, (height - h) / 2, w, h);
    } else {
      ctx.fillStyle = "#526a54";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#efe1b4";
      ctx.textAlign = "center";
      ctx.font = "60px Georgia";
      ctx.fillText(project.title, width / 2, height / 2, width - 80);
    }
  });
}

export async function prepareModel(root: THREE.Group, scene: THREE.Scene, isDisposed: () => boolean) {
  const pickables: THREE.Object3D[] = [];
  const exhibits: Exhibit[] = [];
  const originals: THREE.Mesh[] = [];
  const seenMaterials = new Set<THREE.Material>();
  root.updateMatrixWorld(true);
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    originals.push(object);
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    const foliage = materials.some((m) => /Fern|Moss|Vine_Leaves|WaterLily|Weed/.test(m.name));
    object.castShadow = !foliage && !/Glass|Water_Surface/.test(object.name);
    object.receiveShadow = true;
    for (const material of materials) {
      if (!(material instanceof THREE.MeshStandardMaterial) || seenMaterials.has(material)) continue;
      seenMaterials.add(material);
      material.envMapIntensity = 0.7;
      if (/MAT_(Stone_|Base_WeatheredStone)/.test(material.name)) {
        material.normalScale.setScalar(0.48);
        material.roughness = 0.78;
      }
      if (/MAT_Fern/.test(material.name)) {
        material.color.multiply(new THREE.Color("#d6e6bf"));
        material.alphaTest = 0.25;
        material.transparent = false;
        material.roughness = 0.8;
        material.metalness = 0;
      }
      if (/MAT_Moss/.test(material.name)) {
        material.color.multiply(new THREE.Color("#bacb96"));
        material.alphaTest = 0.25;
        material.transparent = false;
        material.roughness = 0.88;
      }
      if (/MAT_Weed/.test(material.name) && material instanceof THREE.MeshPhysicalMaterial) {
        material.transmission = 0;
        material.roughness = 0.8;
      }
      if (/MAT_WaterLily/.test(material.name)) {
        material.normalScale.setScalar(0.35);
        material.roughness = 0.72;
        material.alphaTest = 0.25;
        material.transparent = false;
        material.depthWrite = true;
        // A little transmitted sky fill keeps the very dark leaf scan legible.
        material.emissiveMap = material.map;
        material.emissive.set("#a4bc84");
        material.emissiveIntensity = 0.45;
      }
      if (/MAT_Plaque_NormalDetail/.test(material.name)) {
        material.color.set("#635039");
        material.metalness = 0.45;
        material.roughness = 0.8;
        material.normalScale.setScalar(0.12);
      }
      if (/Roof_Glass/.test(material.name) && material instanceof THREE.MeshPhysicalMaterial) {
        material.transmission = 1;
        material.roughness = 0.07;
        material.thickness = 0;
        material.ior = 1.45;
        material.envMapIntensity = 1.2;
        material.envMap = scene.environment;
        material.side = THREE.DoubleSide;
      }
      if (/MAT_Frame_Gold/.test(material.name)) {
        material.color.set("#b18a46");
        material.metalness = 0.85;
        material.roughness = 0.58;
        material.envMap = scene.environment;
        material.envMapIntensity = 0.25;
        material.normalScale.setScalar(0.3);
      }
      for (const value of Object.values(material)) {
        if (value instanceof THREE.Texture) value.anisotropy = 4;
      }
    }
    const match = object.name.match(/Project_(\d{2})_(?:Frame|Plaque|Display)/);
    if (match) {
      object.userData.project_id = `project_${match[1]}`;
      pickables.push(object);
    }
  });

  for (const project of museumProjects) {
    const display = root.getObjectByName(`Project_${project.number}_Display`);
    if (!(display instanceof THREE.Mesh)) throw new Error(`Missing display for ${project.title}`);
    const box = new THREE.Box3().setFromObject(display);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const frame = root.getObjectByName(`Project_${project.number}_Frame`);
    if (frame) {
      const frameSize = new THREE.Box3().setFromObject(frame).getSize(new THREE.Vector3());
      // The v15 frame relief is a normal map on a solid panel. Its inner rim
      // surrounds 80% of the panel width and 73% of its height; the original
      // Display marker was smaller and left a wide empty mount around it.
      size.z = frameSize.z * 0.8;
      size.y = frameSize.y * 0.73;
    }
    const aspect = size.z / size.y;
    const inward = center.x < 0 ? 1 : -1;
    display.visible = false;
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(size.z, size.y),
      new THREE.MeshBasicMaterial({ map: artwork(project, aspect), toneMapped: false }),
    );
    plane.name = `Artwork_${project.id}`;
    plane.position.copy(center);
    plane.position.x += inward * 0.012;
    plane.rotation.y = inward * Math.PI / 2;
    plane.userData.project_id = project.id;
    scene.add(plane);
    pickables.push(plane);
    exhibits.push({ project, position: center, visit: new THREE.Vector3(center.x + inward * 5.8, GALLERY_EYE_Y, center.z) });

    // Load only local project images. A titled canvas remains if an image is unavailable.
    const img = new Image();
    img.src = project.image;
    try {
      await img.decode();
      if (isDisposed()) break;
      plane.material.map?.dispose();
      plane.material.map = artwork(project, aspect, img);
      plane.material.needsUpdate = true;
    } catch { /* The title and modal remain fully usable without an image. */ }

    const plaque = root.getObjectByName(`Project_${project.number}_Plaque`);
    if (plaque) {
      const surface = plaqueSurface(plaque, inward);
      const label = new THREE.Mesh(new THREE.PlaneGeometry(surface.width * 0.9, surface.height * 0.88), new THREE.MeshStandardMaterial({
        map: canvasTexture(768, 430, (ctx) => {
          // Only lettering: the real bronze plaque remains the background.
          ctx.fillStyle = "#ffffff";
          ctx.textAlign = "center";
          ctx.font = "30px sans-serif"; ctx.fillText(`EXHIBIT ${project.number}`, 384, 112);
          ctx.font = "48px Georgia"; ctx.fillText(project.title, 384, 226, 708);
          ctx.font = "26px sans-serif"; ctx.fillText("FLO MADNER", 384, 333);
        }), color: "#efe1b4", roughness: 0.8, metalness: 0,
        emissive: "#635236", emissiveIntensity: 0.18,
        transparent: true, alphaTest: 0.05, depthWrite: false,
        polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1,
      }));
      label.name = `Plaque_Lettering_${project.id}`;
      label.position.copy(surface.center).addScaledVector(surface.normal, 0.0008);
      label.quaternion.copy(surface.rotation);
      label.receiveShadow = true;
      label.userData.project_id = project.id;
      scene.add(label);
      pickables.push(label);
    }
  }

  // Linked ferns and rocks become GPU batches. Interactive named objects stay individual.
  const batches = new Map<string, THREE.Mesh[]>();
  for (const mesh of originals) {
    if (mesh instanceof THREE.InstancedMesh || Array.isArray(mesh.material) ||
        !/Fern|Rock_/.test(mesh.name) || !mesh.visible) continue;
    const key = mesh.geometry.uuid + ":" + mesh.material.uuid;
    const group = batches.get(key) || [];
    group.push(mesh);
    batches.set(key, group);
  }
  for (const meshes of batches.values()) {
    if (meshes.length < 2) continue;
    const first = meshes[0];
    const batch = new THREE.InstancedMesh(first.geometry, first.material, meshes.length);
    batch.name = `Batch_${first.name}`;
    batch.castShadow = first.castShadow;
    batch.receiveShadow = true;
    meshes.forEach((mesh, i) => { batch.setMatrixAt(i, mesh.matrixWorld); mesh.visible = false; });
    batch.instanceMatrix.needsUpdate = true;
    batch.computeBoundingSphere();
    scene.add(batch);
  }

  let water: Water | undefined;
  const waterSource = root.getObjectByName("Water_Surface");
  if (waterSource instanceof THREE.Mesh && waterSource.material instanceof THREE.MeshStandardMaterial) {
    const normalMap = waterSource.material.normalMap;
    if (normalMap) {
      normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
      normalMap.needsUpdate = true;
    }
    const bounds = new THREE.Box3().setFromObject(waterSource);
    const dimensions = bounds.getSize(new THREE.Vector3());
    for (const leaf of originals.filter((mesh) => /^WaterLily_/.test(mesh.name))) {
      // The source leaf cards crossed the water plane. As transparent objects
      // they appeared as dark silhouettes over the reflection. Let the pads
      // float just above the surface, with a small amount of natural curl.
      const leafBounds = new THREE.Box3().setFromObject(leaf);
      const flatten = new THREE.Matrix4().makeScale(1, 0.08, 1);
      flatten.elements[13] = bounds.max.y + 0.035 - leafBounds.min.y * 0.08;
      leaf.geometry = leaf.geometry.clone();
      // Meshopt positions/normals are normalized integers. Convert them before
      // editing, otherwise writing world coordinates into those arrays wraps.
      for (const name of ["position", "normal", "tangent"]) {
        const attribute = leaf.geometry.getAttribute(name);
        if (!attribute) continue;
        const values = new Float32Array(attribute.count * attribute.itemSize);
        for (let i = 0; i < attribute.count; i++) {
          values[i * attribute.itemSize] = attribute.getX(i);
          values[i * attribute.itemSize + 1] = attribute.getY(i);
          values[i * attribute.itemSize + 2] = attribute.getZ(i);
          if (attribute.itemSize === 4) values[i * 4 + 3] = attribute.getW(i);
        }
        leaf.geometry.setAttribute(name, new THREE.BufferAttribute(values, attribute.itemSize));
      }
      leaf.geometry.applyMatrix4(leaf.matrixWorld.clone().invert().multiply(flatten).multiply(leaf.matrixWorld));
      leaf.geometry.computeBoundingSphere();
    }
    water = new Water(new THREE.PlaneGeometry(dimensions.x, dimensions.z), {
      textureWidth: 512, textureHeight: 512, waterNormals: normalMap || undefined,
      sunDirection: new THREE.Vector3(0.52, 0.59, 0.62).normalize(),
      sunColor: 0xffe5bf, waterColor: 0x1c6886, distortionScale: 0.35, fog: true,
    });
    water.position.copy(bounds.getCenter(new THREE.Vector3()));
    water.rotation.x = -Math.PI / 2;
    water.material.uniforms.size.value = 4;
    // Water's stock warm diffuse term overpowers its very small blue scatter
    // term. Give this still pool a blue body colour while retaining Fresnel
    // reflections, animated ripples and the existing warm sun glints.
    const stockAlbedo = "vec3 albedo = mix( ( sunColor * diffuseLight * 0.3 + scatter ) * getShadowMask(), reflectionSample + specularLight, reflectance );";
    if (!water.material.fragmentShader.includes(stockAlbedo)) throw new Error("Water shader changed; pool colour needs review");
    water.material.fragmentShader = water.material.fragmentShader
      .replace("noise.xzy * vec3( 1.5, 1.0, 1.5 )", "noise.xzy * vec3( 0.35, 1.0, 0.35 )")
      .replace(stockAlbedo, `
        float sunlight = max(dot(surfaceNormal, sunDirection), 0.0);
        vec3 bodyColour = waterColor * (0.75 + 0.25 * sunlight) * mix(0.7, 1.0, getShadowMask());
        vec3 albedo = mix(bodyColour, reflectionSample, reflectance * 0.88)
          + specularLight * reflectance * 0.35;
      `);
    water.name = "Living_Water";
    waterSource.visible = false;
    scene.add(water);
  }
  return { pickables: pickables.filter((p) => p.visible), exhibits, water };
}
