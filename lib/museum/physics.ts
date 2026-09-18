import { Box3, Triangle, Vector3 } from "three";
import { Octree } from "three/addons/math/Octree.js";
import { Capsule } from "three/addons/math/Capsule.js";
import { bridgeGaps } from "./gapfill.ts";

// The museum is deliberately monumental. These scene units keep the viewpoint
// above the planting and make crossing the 60-unit courtyard comfortable.
export const EYE_HEIGHT = 2.6;
export const WALK_SPEED = 6.8;
export const SPRINT_SPEED = 10;
/** The height of the courtyard walkway: where a visitor's feet actually are. */
export const WALK_LEVEL = 0.74;
export const GALLERY_EYE_Y = WALK_LEVEL + EYE_HEIGHT;
// A surface up to 70 degrees from horizontal is ground you walk up. cos(70) is
// the smallest upward normal that still counts.
export const WALKABLE_NORMAL_Y = Math.cos(70 * Math.PI / 180);
// Anything steeper is a wall, but a wall this low is a ledge: the player is
// lifted onto it rather than stopped, the way Minecraft steps up a block.
export const STEP_HEIGHT = 1.2;
export const JUMP_SPEED = 7.8;
const GRAVITY = 20;
// The apex of a jump, minus a little. An obstacle too tall to step onto but low
// enough to clear is jumped automatically rather than simply blocking.
export const JUMP_REACH = (JUMP_SPEED * JUMP_SPEED) / (2 * GRAVITY) - 0.07;
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
  // Collision-only filler across the seams between walkway tiles. Added here so
  // it picks up the same double-sided treatment as the sculpted geometry.
  const solid = triangles.concat(bridgeGaps(triangles, WALK_LEVEL));
  for (let i = 0; i < solid.length; i += 9) {
    const a = new Vector3().fromArray(solid, i);
    const b = new Vector3().fromArray(solid, i + 3);
    const c = new Vector3().fromArray(solid, i + 6);
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
  private readonly restore = new Capsule(new Vector3(), new Vector3(), 0.3);
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
    if (jump && this.grounded) this.velocity.y = JUMP_SPEED;
    this.desired.set(strafe, 0, -forward);
    if (this.desired.lengthSq() > 1) this.desired.normalize();
    this.desired.applyAxisAngle(UP, yaw).multiplyScalar(sprint ? SPRINT_SPEED : WALK_SPEED);
    for (let s = 0; s < steps; s++) {
      const blend = 1 - Math.exp(-14 * h);
      this.velocity.x += (this.desired.x - this.velocity.x) * blend;
      this.velocity.z += (this.desired.z - this.velocity.z) * blend;
      this.velocity.y -= GRAVITY * h;
      const wantX = this.velocity.x * h, wantZ = this.velocity.z * h;
      const fromX = this.capsule.end.x, fromZ = this.capsule.end.z;
      const wasGrounded = this.grounded;
      this.capsule.translate(this.offset.copy(this.velocity).multiplyScalar(h));
      this.grounded = false;
      for (let pass = 0; pass < 3; pass++) {
        const hit = this.world.capsuleIntersect(this.capsule);
        if (!hit || hit.depth < 0.000001) break;
        if (hit.normal.y > WALKABLE_NORMAL_Y) this.grounded = true;
        const toward = this.velocity.dot(hit.normal);
        if (toward < 0) this.velocity.addScaledVector(hit.normal, -toward);
        this.capsule.translate(this.offset.copy(hit.normal).multiplyScalar(hit.depth + 0.00001));
      }
      // That blended normal is wall-dominated when you stand against one, which
      // read as "not grounded" and silently swallowed the jump. Ask the floor
      // directly instead.
      if (!this.grounded) this.grounded = this.grounding();
      // Octree.capsuleIntersect returns one blended normal for every surface at
      // once, so a wall hit while standing on a floor cannot be told apart by
      // its angle. Being stopped is the reliable signal that something is in
      // the way: intent went in, almost no movement came out.
      const want = Math.hypot(wantX, wantZ);
      const moved = Math.hypot(this.capsule.end.x - fromX, this.capsule.end.z - fromZ);
      if ((wasGrounded || this.grounded) && want > 0.0001 && moved < want * 0.5) {
        this.climb(wantX / want, wantZ / want, want);
      }
      // The sculpted facade has openings: keep visitors within the playable courtyard.
      const x = Math.max(-28.0, Math.min(28.4, this.capsule.end.x));
      const z = Math.max(-28.25, Math.min(28.55, this.capsule.end.z));
      this.capsule.translate(this.offset.set(x - this.capsule.end.x, 0, z - this.capsule.end.z));
    }
    this.updateEye();
    if (this.eye.y < -5 || !Number.isFinite(this.eye.lengthSq())) this.teleport(...SPAWN);
  }

  /** Get over whatever is in the way: step onto a low ledge, jump a taller one,
   *  or leave a genuine wall alone. */
  private climb(dirX: number, dirZ: number, want: number) {
    // Already on the way up: never touch a jump that is in progress.
    if (this.velocity.y > 0.5) return;
    const reach = Math.min(0.45, Math.max(0.2, want * 3));
    if (this.probe(dirX, dirZ, reach, STEP_HEIGHT, true)) return;
    // Too tall to step onto, low enough to clear: hop it, arc and all.
    if (this.probe(dirX, dirZ, reach, JUMP_REACH, false)) this.velocity.y = JUMP_SPEED;
  }

  /** Look for standable ground within `lift` above the capsule, just past the
   *  obstacle. With `settle` the capsule is placed on it; otherwise the capsule
   *  is left exactly where it was and only the answer comes back. */
  private probe(dirX: number, dirZ: number, reach: number, lift: number, settle: boolean) {
    this.restore.copy(this.capsule);
    this.capsule.translate(this.offset.set(0, lift, 0));
    // No headroom above, or the obstacle is still solid at that height.
    if (this.obstructed()) { this.revert(); return false; }
    this.capsule.translate(this.offset.set(dirX * reach, 0, dirZ * reach));
    if (this.obstructed()) { this.revert(); return false; }
    for (let drop = 0; drop < lift; drop += 0.05) {
      this.capsule.translate(this.offset.set(0, -0.05, 0));
      const hit = this.world.capsuleIntersect(this.capsule);
      if (!hit || hit.depth < 0.000001) continue;
      // Landed on something too steep to stand on: not a ledge after all.
      if (hit.normal.y <= WALKABLE_NORMAL_Y) { this.revert(); return false; }
      if (!settle) { this.revert(); return true; }
      this.capsule.translate(this.offset.copy(hit.normal).multiplyScalar(hit.depth + 0.00001));
      this.grounded = true;
      if (this.velocity.y < 0) this.velocity.y = 0;
      return true;
    }
    // Nothing to stand on up there: that was a gap, not a ledge.
    this.revert();
    return false;
  }

  /** Is there walkable ground immediately underfoot? */
  private grounding() {
    this.capsule.translate(this.offset.set(0, -0.08, 0));
    const hit = this.world.capsuleIntersect(this.capsule);
    this.capsule.translate(this.offset.set(0, 0.08, 0));
    return !!hit && hit.depth > 0.000001 && hit.normal.y > WALKABLE_NORMAL_Y;
  }

  private obstructed() {
    const hit = this.world.capsuleIntersect(this.capsule);
    return !!hit && hit.depth > 0.000001;
  }

  private revert() { this.capsule.copy(this.restore); }

  private updateEye() {
    this.eye.copy(this.capsule.end);
    this.eye.y += 0.3;
  }
}
