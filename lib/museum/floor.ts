import * as THREE from "three";

const RESOLUTION = 512;
const REPEAT_METERS = 3.2;

function hash(x: number, y: number) {
  let n = Math.imul(x + 17, 374761393) + Math.imul(y + 31, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}

// Periodic noise makes the procedural stone repeat without texture seams.
function noise(x: number, y: number, cells: number) {
  const px = x * cells, py = y * cells;
  const ix = Math.floor(px), iy = Math.floor(py);
  const fx = px - ix, fy = py - iy;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const a = hash(ix % cells, iy % cells), b = hash((ix + 1) % cells, iy % cells);
  const c = hash(ix % cells, (iy + 1) % cells), d = hash((ix + 1) % cells, (iy + 1) % cells);
  return THREE.MathUtils.lerp(THREE.MathUtils.lerp(a, b, sx), THREE.MathUtils.lerp(c, d, sx), sy);
}

function texture(data: Uint8Array, name: string, colour = false) {
  const result = new THREE.DataTexture(data, RESOLUTION, RESOLUTION, THREE.RGBAFormat);
  result.name = name;
  result.colorSpace = colour ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  result.wrapS = result.wrapT = THREE.RepeatWrapping;
  result.magFilter = THREE.LinearFilter;
  result.minFilter = THREE.LinearMipmapLinearFilter;
  result.generateMipmaps = true;
  result.anisotropy = 8;
  result.needsUpdate = true;
  return result;
}

function stoneMaterial() {
  const colour = new Uint8Array(RESOLUTION * RESOLUTION * 4);
  const roughness = new Uint8Array(colour.length);
  const normal = new Uint8Array(colour.length);
  const height = new Float32Array(RESOLUTION * RESOLUTION);
  for (let y = 0; y < RESOLUTION; y++) for (let x = 0; x < RESOLUTION; x++) {
    const u = x / RESOLUTION, v = y / RESOLUTION;
    const row = Math.floor(v * 6), across = u * 4 + (row % 2) * 0.5;
    const column = Math.floor(across) % 4;
    const fx = across % 1, fy = (v * 6) % 1;
    const edge = Math.min(fx, 1 - fx) * 0.8;
    const rowEdge = Math.min(fy, 1 - fy) * (REPEAT_METERS / 6);
    const variation = noise(u, v, 32), grain = hash(x, y) - 0.5;
    const wear = noise(u, v, 128);
    const distance = Math.min(edge, rowEdge) + (wear - 0.5) * 0.003;
    const stone = THREE.MathUtils.smoothstep(distance, 0.002, 0.008);
    const tone = (hash(column, row) - 0.5) * 14 + (variation - 0.5) * 15 + grain * 8;
    const i = (y * RESOLUTION + x) * 4;
    for (let c = 0; c < 3; c++) {
      colour[i + c] = Math.round(THREE.MathUtils.lerp([92, 94, 87][c], [151, 149, 137][c] + tone, stone));
      roughness[i + c] = Math.round(THREE.MathUtils.lerp(244, 209 + wear * 22, stone));
    }
    colour[i + 3] = roughness[i + 3] = 255;
    // Millimetres of relief, not the source map's broad inflated waves.
    height[y * RESOLUTION + x] = stone * 0.004 + (variation - 0.5) * 0.001 + grain * 0.00025;
  }
  const sample = (x: number, y: number) => height[((y + RESOLUTION) % RESOLUTION) * RESOLUTION + (x + RESOLUTION) % RESOLUTION];
  const texel = REPEAT_METERS / RESOLUTION;
  for (let y = 0; y < RESOLUTION; y++) for (let x = 0; x < RESOLUTION; x++) {
    const dx = (sample(x + 1, y) - sample(x - 1, y)) / (2 * texel);
    const dy = (sample(x, y + 1) - sample(x, y - 1)) / (2 * texel);
    const length = Math.hypot(dx, dy, 1), i = (y * RESOLUTION + x) * 4;
    normal[i] = Math.round((-dx / length * 0.5 + 0.5) * 255);
    normal[i + 1] = Math.round((-dy / length * 0.5 + 0.5) * 255);
    normal[i + 2] = Math.round((1 / length * 0.5 + 0.5) * 255);
    normal[i + 3] = 255;
  }
  return new THREE.MeshStandardMaterial({
    name: "MAT_Gallery_Stone",
    map: texture(colour, "Gallery_Stone_Colour", true),
    normalMap: texture(normal, "Gallery_Stone_Normal"),
    normalScale: new THREE.Vector2(0.55, 0.55),
    roughnessMap: texture(roughness, "Gallery_Stone_Roughness"),
    roughness: 1, metalness: 0,
  });
}

export function prepareGalleryFloor(root: THREE.Group, scene: THREE.Scene) {
  const emitter = root.getObjectByName("Museum_Base_MossEmitter");
  const surfaces: THREE.Mesh[] = [];
  // GLTFLoader wraps an emitter's stone mesh and instanced children in a Group.
  emitter?.traverse((object) => {
    if (object instanceof THREE.Mesh && !(object instanceof THREE.InstancedMesh)) surfaces.push(object);
  });
  const base = surfaces.find((mesh) => (Array.isArray(mesh.material) ? mesh.material : [mesh.material])
    .some((material) => material.name.includes("MAT_Base_WeatheredStone")));
  if (!base) throw new Error("Gallery floor mesh was not found in the export");
  const positions = base.geometry.getAttribute("position"), indices = base.geometry.index;
  const stone: number[] = [], uv: number[] = [], remaining: number[] = [];
  const triangle = new THREE.Triangle(), normal = new THREE.Vector3();
  for (let i = 0; i < (indices?.count ?? positions.count); i += 3) {
    const ids = [0, 1, 2].map((j) => indices ? indices.getX(i + j) : i + j);
    const points = ids.map((id) => new THREE.Vector3().fromBufferAttribute(positions, id).applyMatrix4(base.matrixWorld));
    triangle.set(points[0], points[1], points[2]).getNormal(normal);
    const walkingSurface = normal.y > 0.98 && points.every((p) => p.y > 0.65 && p.y < 0.8);
    if (walkingSurface) for (const p of points) {
      stone.push(p.x, p.y, p.z);
      uv.push(p.x / REPEAT_METERS, -p.z / REPEAT_METERS);
    } else remaining.push(...ids);
  }
  if (!stone.length) throw new Error("Gallery floor surface was not found in the export");
  // Replace just the top faces, preserving the authored step edges, transforms,
  // particle children, silhouette and exact collision surface. No overlay/z-fighting.
  base.geometry = base.geometry.clone();
  base.geometry.setIndex(remaining);
  base.geometry.clearGroups();
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(stone, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  const floor = new THREE.Mesh(geometry, stoneMaterial());
  floor.name = "Museum_Gallery_Floor";
  floor.castShadow = floor.receiveShadow = true;
  scene.add(floor);
}
