import { Box3, Triangle, Vector3 } from "three";
import { Octree } from "three/addons/math/Octree.js";
import { Capsule } from "three/addons/math/Capsule.js";

// The museum is deliberately monumental. These scene units keep the viewpoint
// above the planting and make crossing the 60-unit courtyard comfortable.
export const EYE_HEIGHT = 2.6;
export const WALK_SPEED = 6.8;
export const SPRINT_SPEED = 10;
export const GALLERY_EYE_Y = 0.74 + EYE_HEIGHT;
export const SPAWN = [0, GALLERY_EYE_Y, 24] as const;
const UP = new Vector3(0, 1, 0);

// Large coplanar floor triangles make the stock Octree subdivide excessively.
// Bound subdivision explicitly at every child, keeping startup and memory predictable.
function partition(node: Octree, depth = 0) {
  if (!node.box || node.triangles.length <= 64 || depth >= 6) {
    // Octree queries inspect children, so even an unsplit root needs a leaf child.
    if (depth === 0) {
      const leaf = new Octree(node.box);
      leaf.triangles = node.triangles;
      node.triangles = [];
      node.subTrees.push(leaf);
    }
    return;
  }
  const center = node.box.getCenter(new Vector3());
  for (let x = 0; x < 2; x++) for (let y = 0; y < 2; y++) for (let z = 0; z < 2; z++) {
    const box = new Box3(
      new Vector3(x ? center.x : node.box.min.x, y ? center.y : node.box.min.y, z ? center.z : node.box.min.z),
      new Vector3(x ? node.box.max.x : center.x, y ? node.box.max.y : center.y, z ? node.box.max.z : center.z),
    );
    const child = new Octree(box);
    child.triangles = node.triangles.filter((t) => box.intersectsTriangle(t));
    if (!child.triangles.length) continue;
    partition(child, depth + 1);
    node.subTrees.push(child);
  }
  node.triangles = [];
}

export function collisionWorld(triangles: number[]) {
  if (triangles.length % 9 || triangles.some((n) => !Number.isFinite(n))) {
    throw new Error("Invalid museum collision geometry");
  }
  const world = new Octree();
  for (let i = 0; i < triangles.length; i += 9) {
    const a = new Vector3().fromArray(triangles, i);
    const b = new Vector3().fromArray(triangles, i + 3);
    const c = new Vector3().fromArray(triangles, i + 6);
    if (new Triangle(a, b, c).getArea() < 0.000001) continue;
    world.addTriangle(new Triangle(a, b, c));
    // Blender's single-sided walls face outward. Physics must work on both sides.
    world.addTriangle(new Triangle(c.clone(), b.clone(), a.clone()));
  }
  world.calcBox();
  partition(world);
  return world;
}

export class MuseumPlayer {
  readonly capsule = new Capsule(new Vector3(), new Vector3(), 0.3);
  readonly velocity = new Vector3();
  readonly eye = new Vector3();
  grounded = false;
  private readonly offset = new Vector3();
  private readonly desired = new Vector3();
  private readonly world: Octree;

  constructor(world: Octree) {
    this.world = world;
    this.teleport(...SPAWN);
  }

  teleport(x: number, eyeY: number, z: number) {
    const foot = eyeY - EYE_HEIGHT;
    this.capsule.start.set(x, foot + 0.3, z);
    this.capsule.end.set(x, foot + EYE_HEIGHT - this.capsule.radius, z);
    this.velocity.set(0, 0, 0);
    this.grounded = false;
    this.updateEye();
  }

  stop() { this.velocity.set(0, 0, 0); }

  step(dt: number, strafe: number, forward: number, yaw: number, jump: boolean, sprint: boolean) {
    // Small substeps prevent tunnelling even if a browser frame arrives late.
    const elapsed = Math.min(Math.max(dt, 0), 0.05);
    const steps = Math.max(1, Math.ceil(elapsed / (1 / 120)));
    const h = elapsed / steps;
    if (jump && this.grounded) this.velocity.y = 7.8;
    this.desired.set(strafe, 0, -forward);
    if (this.desired.lengthSq() > 1) this.desired.normalize();
    this.desired.applyAxisAngle(UP, yaw).multiplyScalar(sprint ? SPRINT_SPEED : WALK_SPEED);
    for (let s = 0; s < steps; s++) {
      const blend = 1 - Math.exp(-14 * h);
      this.velocity.x += (this.desired.x - this.velocity.x) * blend;
      this.velocity.z += (this.desired.z - this.velocity.z) * blend;
      this.velocity.y -= 20 * h;
      this.capsule.translate(this.offset.copy(this.velocity).multiplyScalar(h));
      this.grounded = false;
      for (let pass = 0; pass < 3; pass++) {
        const hit = this.world.capsuleIntersect(this.capsule);
        if (!hit || hit.depth < 0.000001) break;
        if (hit.normal.y > 0.5) this.grounded = true;
        const toward = this.velocity.dot(hit.normal);
        if (toward < 0) this.velocity.addScaledVector(hit.normal, -toward);
        this.capsule.translate(this.offset.copy(hit.normal).multiplyScalar(hit.depth + 0.00001));
      }
      // The sculpted facade has openings: keep visitors within the playable courtyard.
      const x = Math.max(-28.0, Math.min(28.4, this.capsule.end.x));
      const z = Math.max(-28.25, Math.min(28.55, this.capsule.end.z));
      this.capsule.translate(this.offset.set(x - this.capsule.end.x, 0, z - this.capsule.end.z));
    }
    this.updateEye();
    if (this.eye.y < -5 || !Number.isFinite(this.eye.lengthSq())) this.teleport(...SPAWN);
  }

  private updateEye() {
    this.eye.copy(this.capsule.end);
    this.eye.y += 0.3;
  }
}
