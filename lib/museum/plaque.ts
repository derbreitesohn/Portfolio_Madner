import { Matrix4, Mesh, Object3D, Quaternion, Triangle, Vector3 } from "three";

// Find the largest coplanar face that points into the gallery. Use the exported
// vertices rather than an axis-aligned bounding box: the plaques are wedges.
export function plaqueSurface(plaque: Object3D, inward: number) {
  const faces: { normal: Vector3; points: Vector3[]; area: number }[] = [];
  plaque.updateWorldMatrix(true, true);
  plaque.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    const positions = object.geometry.getAttribute("position");
    const index = object.geometry.index;
    for (let i = 0; i < (index?.count ?? positions.count); i += 3) {
      const points = [0, 1, 2].map((j) => new Vector3()
        .fromBufferAttribute(positions, index ? index.getX(i + j) : i + j)
        .applyMatrix4(object.matrixWorld));
      const triangle = new Triangle(...points as [Vector3, Vector3, Vector3]);
      const normal = triangle.getNormal(new Vector3());
      if (normal.x * inward < 0.75 || triangle.getArea() < 1e-6) continue;
      const face = faces.find((f) => f.normal.dot(normal) > 0.9999 &&
        Math.abs(normal.dot(points[0].clone().sub(f.points[0]))) < 0.003);
      if (face) { face.points.push(...points); face.area += triangle.getArea(); }
      else faces.push({ normal, points, area: triangle.getArea() });
    }
  });
  const face = faces.sort((a, b) => b.area - a.area)[0];
  if (!face) throw new Error(`Cannot fit lettering to ${plaque.name}`);
  const right = new Vector3(0, 1, 0).cross(face.normal).normalize();
  const up = face.normal.clone().cross(right).normalize();
  const x = face.points.map((p) => p.dot(right));
  const y = face.points.map((p) => p.dot(up));
  const minX = Math.min(...x), maxX = Math.max(...x);
  const minY = Math.min(...y), maxY = Math.max(...y);
  const center = right.clone().multiplyScalar((minX + maxX) / 2)
    .addScaledVector(up, (minY + maxY) / 2)
    .addScaledVector(face.normal, face.points[0].dot(face.normal));
  return { center, normal: face.normal, width: maxX - minX, height: maxY - minY,
    rotation: new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(right, up, face.normal)) };
}
