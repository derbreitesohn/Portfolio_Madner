import * as THREE from "three";

export function prepareGalleryFloor(root: THREE.Group) {
  const materials = new Set<THREE.MeshStandardMaterial>();
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      if (material instanceof THREE.MeshStandardMaterial && material.name.startsWith("MAT_Base_WeatheredStone")) {
        materials.add(material);
      }
    }
  });
  // Both gallery levels use the artist's weathered dirt/stone material. Their
  // colour bakes have separate atlases: keep each map and its authored UVs.
  // Only soften the swollen normal-map shading and make the stone matte.
  for (const material of materials) {
    material.normalScale.setScalar(0.12);
    material.roughness = 0.92;
    material.metalness = 0;
    material.envMapIntensity = 0.35;
    if (material.map) material.map.anisotropy = 8;
    if (material.normalMap) material.normalMap.anisotropy = 8;
  }
}
