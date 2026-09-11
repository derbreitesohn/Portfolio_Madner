import { Box3, BufferGeometry, DoubleSide, Float32BufferAttribute, Matrix4, Mesh, MeshBasicMaterial, Raycaster, Vector3 } from 'three';

// Run before compression. Origins in this export are not necessarily stem bases,
// so find the low central vertices instead of snapping object origins to y=0.
export function groundMuseumPlants(document) {
  const nodes = document.getRoot().listNodes(), supports = [], changes = [];
  const material = new MeshBasicMaterial({ side: DoubleSide });
  for (const node of nodes) {
    if (!node.getMesh() || node.getExtension('EXT_mesh_gpu_instancing') ||
        !/^(Museum_Base|Gazebo_Base|Rock_|Walkway_)/.test(node.getName())) continue;
    for (const primitive of node.getMesh().listPrimitives()) {
      const positions = primitive.getAttribute('POSITION'), vertices = [];
      for (let i = 0; i < positions.getCount(); i++) vertices.push(...positions.getElement(i, []));
      const geometry = new BufferGeometry().setAttribute('position', new Float32BufferAttribute(vertices, 3));
      if (primitive.getIndices()) geometry.setIndex(Array.from(primitive.getIndices().getArray()));
      geometry.applyMatrix4(new Matrix4().fromArray(node.getWorldMatrix()));
      const mesh = new Mesh(geometry, material);
      mesh.name = node.getName();
      supports.push(mesh);
    }
  }
  const ray = new Raycaster(), down = new Vector3(0, -1, 0);
  const surface = (point) => {
    ray.set(new Vector3(point.x, Math.min(point.y + 0.5, 3.5), point.z), down);
    return ray.intersectObjects(supports, false).find((hit) => hit.face.normal.y > 0.25);
  };
  for (const node of nodes) {
    if (!/^Fern/.test(node.getName()) || !node.getMesh()) continue;
    const world = new Matrix4().fromArray(node.getWorldMatrix()), vertices = [];
    for (const primitive of node.getMesh().listPrimitives()) {
      const positions = primitive.getAttribute('POSITION');
      for (let i = 0; i < positions.getCount(); i++) vertices.push(new Vector3().fromArray(positions.getElement(i, [])).applyMatrix4(world));
    }
    const bounds = new Box3().setFromPoints(vertices);
    // Ferns attached to the roof/columns are intentional hanging vegetation.
    if (bounds.min.y > 3) continue;
    const center = bounds.getCenter(new Vector3()), size = bounds.getSize(new Vector3());
    const radius = Math.min(size.x, size.z) * 0.2;
    const central = vertices.filter((p) => Math.hypot(p.x - center.x, p.z - center.z) < radius);
    if (!central.length) continue;
    const low = Math.min(...central.map((p) => p.y));
    const bottom = central.filter((p) => p.y < low + 0.01);
    const root = bottom.reduce((sum, p) => sum.add(p), new Vector3()).divideScalar(bottom.length);
    let hit = surface(root);
    if (!hit || root.y - hit.point.y <= 0.035) continue;
    const target = root.clone();
    // A fern near a rock edge can otherwise be lowered beneath the water.
    // Move it a short distance onto the same rock's dry top when needed.
    if (hit.point.y < 0.08) {
      const candidates = [];
      for (const distance of [0.25, 0.5, 0.75]) for (let i = 0; i < 12; i++) {
        const point = root.clone().add(new Vector3(Math.cos(i * Math.PI / 6) * distance, 0, Math.sin(i * Math.PI / 6) * distance));
        const candidate = surface(point);
        if (candidate?.object === hit.object && candidate.point.y >= 0.08) candidates.push({ point, hit: candidate, distance });
      }
      candidates.sort((a, b) => a.distance - b.distance || b.hit.point.y - a.hit.point.y);
      if (!candidates.length) continue;
      target.copy(candidates[0].point); hit = candidates[0].hit;
    }
    const originalGap = root.y - hit.point.y;
    target.y = hit.point.y - 0.018; // Bury the stem very slightly into the stone.
    const delta = target.clone().sub(root);
    const parent = node.getParentNode();
    if (parent) {
      const inverse = new Matrix4().fromArray(parent.getWorldMatrix()).invert();
      delta.applyMatrix4(inverse).sub(new Vector3().applyMatrix4(inverse));
    }
    node.setTranslation(new Vector3().fromArray(node.getTranslation()).add(delta).toArray());
    // Recover this attachment after meshopt's geometry rebasing for validation.
    const localRoot = root.clone().applyMatrix4(world.clone().invert());
    const positions = node.getMesh().listPrimitives()[0].getAttribute('POSITION');
    const min = positions.getMin([]), max = positions.getMax([]);
    node.setExtras({ ...node.getExtras(), plantRootInBounds: localRoot.toArray().map((v, axis) => (v - min[axis]) / (max[axis] - min[axis])) });
    changes.push({ name: node.getName(), support: hit.object.name, originalGap, root: target.toArray() });
  }
  supports.forEach((mesh) => mesh.geometry.dispose()); material.dispose();
  return changes;
}
