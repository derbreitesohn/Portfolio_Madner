import * as THREE from "three";

export function prepareGalleryFloor(root: THREE.Group) {
  const materials = new Map<THREE.MeshStandardMaterial, number[]>();
  root.updateMatrixWorld(true);
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      if (material instanceof THREE.MeshStandardMaterial && material.name.startsWith("MAT_Base_WeatheredStone")) {
        const densities = materials.get(material) ?? [];
        materials.set(material, densities);
        const positions = object.geometry.getAttribute("position"), indices = object.geometry.index;
        const channel = material.normalMap?.channel ?? 0;
        const uv = object.geometry.getAttribute(channel ? `uv${channel}` : "uv");
        if (!uv) continue;
        const triangle = new THREE.Triangle(), normal = new THREE.Vector3();
        for (let i = 0; i < (indices?.count ?? positions.count); i += 3) {
          const ids = [0, 1, 2].map((j) => indices ? indices.getX(i + j) : i + j);
          const points = ids.map((id) => new THREE.Vector3().fromBufferAttribute(positions, id).applyMatrix4(object.matrixWorld));
          triangle.set(points[0], points[1], points[2]).getNormal(normal);
          if (normal.y < 0.98) continue;
          const texcoords = ids.map((id) => new THREE.Vector2().fromBufferAttribute(uv, id));
          const uvArea = Math.abs(texcoords[1].sub(texcoords[0]).cross(texcoords[2].sub(texcoords[0]))) / 2;
          if (uvArea > 1e-8) densities.push(Math.sqrt(triangle.getArea() / uvArea));
        }
      }
    }
  });
  // Both gallery levels use the artist's weathered dirt/stone material. Their
  // colour bakes have separate atlases: keep each map and its authored UVs.
  // Keep visible stone relief while softening the source's swollen shading.
  for (const [material, densities] of materials) {
    material.normalScale.setScalar(0.3);
    material.roughness = 0.92;
    material.metalness = 0;
    material.envMapIntensity = 0.35;
    if (material.map) material.map.anisotropy = 8;
    if (material.normalMap) {
      // The source image has 16 stones across. Repeat it over eight metres,
      // giving half-metre stones on both levels despite their different UV scales.
      // Clone only its sampler: preserve the original pixels and colour atlas.
      densities.sort((a, b) => a - b);
      const metersPerUV = densities[Math.floor(densities.length / 2)];
      material.normalMap = material.normalMap.clone();
      if (metersPerUV) material.normalMap.repeat.setScalar(metersPerUV / 8);
      material.normalMap.wrapS = material.normalMap.wrapT = THREE.RepeatWrapping;
      material.normalMap.anisotropy = 8;
      material.normalMap.needsUpdate = true;
    }
  }
}
