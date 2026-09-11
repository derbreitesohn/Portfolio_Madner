import * as THREE from "three";
import { Water } from "three/addons/objects/Water.js";
import { museumProjects, type MuseumProject } from "./projects";

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

function artwork(project: MuseumProject, image?: HTMLImageElement) {
  return canvasTexture(1024, 460, (ctx) => {
    ctx.fillStyle = "#e9e5d8";
    ctx.fillRect(0, 0, 1024, 460);
    if (image) {
      const fit = Math.min(984 / image.width, 380 / image.height);
      const w = image.width * fit, h = image.height * fit;
      ctx.drawImage(image, (1024 - w) / 2, 14 + (380 - h) / 2, w, h);
    } else {
      ctx.fillStyle = "#526a54";
      ctx.font = "80px Georgia";
      ctx.fillText(project.number, 60, 200);
    }
    ctx.fillStyle = "#24392e";
    ctx.font = "24px Georgia";
    ctx.fillText(project.title, 25, 433, 865);
    ctx.font = "18px sans-serif";
    ctx.fillText(project.number, 963, 432);
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
    const inward = center.x < 0 ? 1 : -1;
    display.visible = false;
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(size.z, size.y),
      new THREE.MeshBasicMaterial({ map: artwork(project), toneMapped: false }),
    );
    plane.name = `Artwork_${project.id}`;
    plane.position.copy(center);
    plane.position.x += inward * 0.012;
    plane.rotation.y = inward * Math.PI / 2;
    plane.userData.project_id = project.id;
    scene.add(plane);
    pickables.push(plane);
    exhibits.push({ project, position: center, visit: new THREE.Vector3(center.x + inward * 5.8, 2.44, center.z) });

    // Load only local project images. A titled canvas remains if an image is unavailable.
    const img = new Image();
    img.src = project.image;
    try {
      await img.decode();
      if (isDisposed()) break;
      plane.material.map?.dispose();
      plane.material.map = artwork(project, img);
      plane.material.needsUpdate = true;
    } catch { /* The title and modal remain fully usable without an image. */ }

    const plaque = root.getObjectByName(`Project_${project.number}_Plaque`);
    if (plaque) {
      const pb = new THREE.Box3().setFromObject(plaque);
      const label = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.31), new THREE.MeshBasicMaterial({
        map: canvasTexture(768, 250, (ctx) => {
          ctx.fillStyle = "#403423"; ctx.fillRect(0, 0, 768, 250);
          ctx.fillStyle = "#efe1b4";
          ctx.textAlign = "center";
          ctx.font = "27px sans-serif"; ctx.fillText(`EXHIBIT ${project.number}`, 384, 65);
          ctx.font = "40px Georgia"; ctx.fillText(project.title, 384, 140, 708);
          ctx.font = "24px sans-serif"; ctx.fillText("FLO MADNER", 384, 205);
        }), toneMapped: false,
      }));
      label.position.copy(pb.getCenter(new THREE.Vector3()));
      label.position.x = (inward > 0 ? pb.max.x : pb.min.x) + inward * 0.015;
      label.rotation.y = inward * Math.PI / 2;
      label.userData.project_id = project.id;
      scene.add(label);
      pickables.push(label);
    }
    const light = new THREE.SpotLight(0xffdfa7, 65, 14, 0.7, 0.8, 2);
    light.position.copy(center).add(new THREE.Vector3(inward * 3, 2.7, 0));
    light.target.position.copy(center);
    scene.add(light, light.target);
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
    water = new Water(new THREE.PlaneGeometry(dimensions.x, dimensions.z), {
      textureWidth: 512, textureHeight: 512, waterNormals: normalMap || undefined,
      sunDirection: new THREE.Vector3(0.52, 0.59, 0.62).normalize(),
      sunColor: 0xffe5bf, waterColor: 0x123d50, distortionScale: 0.55, fog: true,
    });
    water.position.copy(bounds.getCenter(new THREE.Vector3()));
    water.rotation.x = -Math.PI / 2;
    water.material.uniforms.size.value = 4;
    water.name = "Living_Water";
    waterSource.visible = false;
    scene.add(water);
  }
  return { pickables: pickables.filter((p) => p.visible), exhibits, water };
}
