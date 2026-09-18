import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { bridgeGaps } from '../lib/museum/gapfill.ts';
import { collisionWorld, MuseumPlayer, EYE_HEIGHT, GALLERY_EYE_Y, WALK_LEVEL } from '../lib/museum/physics.ts';

const { triangles } = JSON.parse(readFileSync(new URL('../public/museum/collision.json', import.meta.url)));

/** Each filler quad is two triangles over the same axis-aligned rectangle. */
function fillerRects() {
  const filler = bridgeGaps(triangles, WALK_LEVEL);
  const rects = [];
  for (let i = 0; i < filler.length; i += 18) {
    rects.push({
      y: filler[i + 1],
      x0: Math.min(filler[i], filler[i + 6]), x1: Math.max(filler[i], filler[i + 6]),
      z0: Math.min(filler[i + 2], filler[i + 5]), z1: Math.max(filler[i + 2], filler[i + 5]),
    });
  }
  return rects;
}

test('the filler never stacks two floors over the same spot', () => {
  const rects = fillerRects();
  assert.ok(rects.length > 50, `Expected the museum to need bridging, got ${rects.length} patches`);
  for (let a = 0; a < rects.length; a++) {
    for (let b = a + 1; b < rects.length; b++) {
      const A = rects[a], B = rects[b];
      if (Math.abs(A.y - B.y) < 0.05) continue;
      const overlapX = Math.min(A.x1, B.x1) - Math.max(A.x0, B.x0);
      const overlapZ = Math.min(A.z1, B.z1) - Math.max(A.z0, B.z0);
      assert.ok(overlapX <= 0.01 || overlapZ <= 0.01,
        `Filler at y=${A.y.toFixed(2)} and y=${B.y.toFixed(2)} overlap: the player gets wedged between them`);
    }
  }
});

test('the filler never lays a floor above the walking level', () => {
  for (const rect of fillerRects()) {
    assert.ok(rect.y <= WALK_LEVEL + 0.1,
      `Filler at y=${rect.y.toFixed(2)} is above the walkway: it would push the player upward`);
  }
});

test('crossing the courtyard never drops the visitor into the pool', () => {
  const player = new MuseumPlayer(collisionWorld(triangles));
  player.teleport(0, GALLERY_EYE_Y, 24);
  for (let i = 0; i < 60; i++) player.step(1 / 60, 0, 0, 0, false, false);
  let lowest = Infinity;
  for (let i = 0; i < 400; i++) {
    player.step(1 / 60, 0, 1, 0, false, false);
    lowest = Math.min(lowest, player.eye.y - EYE_HEIGHT);
  }
  assert.ok(player.eye.z < -15, `Should have crossed the courtyard, z=${player.eye.z}`);
  // The causeway sits near 0.16 and the pool floor at -0.55. Staying above zero
  // means every gap between the stones was bridged.
  assert.ok(lowest > 0, `Fell between the stones: lowest foot was ${lowest.toFixed(2)}`);
});

test('a visitor can climb out of the water without a jump button', () => {
  // This is what lets the touch controls ship without a jump button at all.
  const world = collisionWorld(triangles);
  for (const [label, x, z, yaw] of [
    ['east', 12, 0, -Math.PI / 2], ['west', -12, 0, Math.PI / 2],
    ['north', 0, 12, Math.PI], ['south', 0, -12, 0],
  ]) {
    const player = new MuseumPlayer(world);
    player.teleport(x, -0.545 + EYE_HEIGHT, z);
    for (let i = 0; i < 60; i++) player.step(1 / 60, 0, 0, 0, false, false);
    for (let i = 0; i < 300; i++) player.step(1 / 60, 0, 1, yaw, false, false);
    assert.ok(player.eye.y - EYE_HEIGHT > WALK_LEVEL - 0.05,
      `Walking ${label} out of the pool left the visitor at ${(player.eye.y - EYE_HEIGHT).toFixed(2)}`);
  }
});
