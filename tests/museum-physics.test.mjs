import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { collisionWorld, MuseumPlayer, EYE_HEIGHT, GALLERY_EYE_Y, STEP_HEIGHT, JUMP_REACH } from '../lib/museum/physics.ts';

const floor = [-50,0,-50, -50,0,50, 50,0,50, -50,0,-50, 50,0,50, 50,0,-50];
function advance(player, seconds, strafe = 0, forward = 0, yaw = 0, jump = false) {
  for (let i = 0; i < Math.round(seconds * 60); i++) player.step(1/60, strafe, forward, yaw, jump && i === 0, false);
}

test('player settles on a floor and moves at the same speed diagonally', () => {
  const world = collisionWorld(floor);
  const player = new MuseumPlayer(world);
  player.teleport(0, EYE_HEIGHT + 0.3, 0);
  advance(player, 1);
  assert.ok(Math.abs(player.eye.y - EYE_HEIGHT) < 0.015);
  assert.ok(player.grounded);
  advance(player, 2, 0, 1);
  const straight = Math.hypot(player.eye.x, player.eye.z);
  assert.ok(straight > 12.5 && straight < 14, 'Courtyard walking pace is too slow or too fast');
  player.teleport(0, EYE_HEIGHT + 0.01, 0);
  advance(player, 1);
  advance(player, 2, 1, 1);
  assert.ok(Math.abs(Math.hypot(player.eye.x, player.eye.z) - straight) < 0.02);
});

test('outward facing wall blocks movement and allows sliding', () => {
  const wall = [-3,0,-3, 3,4,-3, 3,0,-3, -3,0,-3, -3,4,-3, 3,4,-3];
  const player = new MuseumPlayer(collisionWorld([...floor, ...wall]));
  player.teleport(0, EYE_HEIGHT + 0.01, 0);
  advance(player, 2, 0, 1);
  assert.ok(player.eye.z > -2.71 && player.eye.z < -2.65);
  advance(player, 0.4, 1, 1);
  assert.ok(player.eye.x > 0.5);
  assert.ok(player.eye.z > -2.71);
});

test('jump returns to the floor; a long frame cannot tunnel through it', () => {
  const player = new MuseumPlayer(collisionWorld(floor));
  player.teleport(0, EYE_HEIGHT + 0.01, 0);
  advance(player, 1);
  advance(player, .3, 0, 0, 0, true);
  assert.ok(player.eye.y > EYE_HEIGHT + 1);
  advance(player, 2);
  assert.ok(Math.abs(player.eye.y - EYE_HEIGHT) < .02);
  player.teleport(0, 3, 0);
  player.step(5, 0, 0, 0, false, false);
  assert.ok(player.eye.y > 2.9);
});

test('actual museum entrance and all six frame visit positions have usable floors', () => {
  const { triangles } = JSON.parse(readFileSync(new URL('../public/museum/collision.json', import.meta.url)));
  const world = collisionWorld(triangles);
  const player = new MuseumPlayer(world);
  advance(player, 1);
  assert.ok(Math.abs(player.eye.y - (0.728 + EYE_HEIGHT)) < .04, `Entrance y=${player.eye.y}`);
  for (const x of [-22.625, 23.0525]) for (const z of [19.62851, .34106, -18.94638]) {
    player.teleport(x, GALLERY_EYE_Y, z);
    advance(player, 1);
    assert.ok(Math.abs(player.eye.y - (0.728 + EYE_HEIGHT)) < .06, `Frame floor at ${x},${z}: y=${player.eye.y}`);
    assert.ok(Math.abs(player.eye.x - x) < .1 && Math.abs(player.eye.z - z) < .1, 'Frame viewpoint overlaps architecture');
  }
});

test('actual museum walls contain the player and water has a shallow floor', () => {
  const { triangles } = JSON.parse(readFileSync(new URL('../public/museum/collision.json', import.meta.url)));
  const player = new MuseumPlayer(collisionWorld(triangles));
  player.teleport(-26, GALLERY_EYE_Y, .34106);
  advance(player, 3, -1, 0);
  assert.ok(player.eye.x >= -28.01 && player.eye.y > 2.3);
  player.teleport(10, GALLERY_EYE_Y, 4);
  advance(player, 2);
  assert.ok(player.eye.y > 2 && player.eye.y < 2.1, `Pool eye height: ${player.eye.y}`);
});

test('raised viewpoint remains coupled to the collider, with faster sprinting', () => {
  const player = new MuseumPlayer(collisionWorld(floor));
  player.teleport(0, EYE_HEIGHT + .01, 0);
  advance(player, 1);
  assert.ok(Math.abs(player.capsule.start.y - player.capsule.radius) < .02);
  assert.ok(Math.abs(player.eye.y - player.capsule.end.y - player.capsule.radius) < 1e-6);
  for (let i = 0; i < 120; i++) player.step(1/60, 0, 1, 0, false, true);
  assert.ok(-player.eye.z > 18.5 && -player.eye.z < 20.1);
});

// --- Geometry helpers for the step-up and gap-bridging cases -----------------
/** An upward-facing rectangle at height y. Winding is irrelevant: the collision
 *  world adds both faces of every triangle it is given. */
const quad = (y, x0, z0, x1, z1) => [x0,y,z0, x0,y,z1, x1,y,z1, x0,y,z0, x1,y,z1, x1,y,z0];
/** A vertical face at constant z, spanning x0..x1 and rising y0..y1. */
const faceZ = (z, x0, x1, y0, y1) => [x0,y0,z, x0,y1,z, x1,y1,z, x0,y0,z, x1,y1,z, x1,y0,z];
/** A slope climbing from (z0,y0) to (z1,y1), followed by a long flat landing so
 *  the walker cannot simply run off the far end mid-assertion. */
const slope = (x0, x1, z0, y0, z1, y1) => [
  x0,y0,z0, x0,y1,z1, x1,y1,z1, x0,y0,z0, x1,y1,z1, x1,y0,z0,
  ...quad(y1, x0, z1, x1, -40),
];

test('obstacles are stepped onto, jumped over, or genuinely block', () => {
  // Walking forward (+forward is -z) into a platform whose face is at z = -3.
  const obstacle = (height) => [...floor, ...quad(height, -10, -3, 10, -40), ...faceZ(-3, -10, 10, 0, height)];
  const walkInto = (height) => {
    const player = new MuseumPlayer(collisionWorld(obstacle(height)));
    player.teleport(0, EYE_HEIGHT + 0.01, 0);
    advance(player, 1);
    advance(player, 3, 0, 1);
    return player;
  };

  for (const height of [0.6, 1.0, STEP_HEIGHT]) {
    const player = walkInto(height);
    assert.ok(Math.abs(player.eye.y - (height + EYE_HEIGHT)) < 0.08 && player.eye.z < -3.2,
      `A ${height} ledge should be stepped onto: y=${player.eye.y.toFixed(2)} z=${player.eye.z.toFixed(2)}`);
  }
  // Above stepping height but below the apex of a jump: taken automatically.
  for (const height of [STEP_HEIGHT + 0.15, JUMP_REACH]) {
    const player = walkInto(height);
    assert.ok(Math.abs(player.eye.y - (height + EYE_HEIGHT)) < 0.08 && player.eye.z < -3.2,
      `A ${height.toFixed(2)} ledge should be auto-jumped: y=${player.eye.y.toFixed(2)} z=${player.eye.z.toFixed(2)}`);
  }
  for (const height of [JUMP_REACH + 0.15, 2.5]) {
    const player = walkInto(height);
    assert.ok(Math.abs(player.eye.y - EYE_HEIGHT) < 0.05 && player.eye.z > -3.4,
      `A ${height.toFixed(2)} wall must still block: y=${player.eye.y.toFixed(2)} z=${player.eye.z.toFixed(2)}`);
  }
});

test('pressing against a wall does not swallow the jump', () => {
  // The blended collision normal is wall-dominated when you stand against one.
  // Reading grounded off it alone made Space do nothing exactly where a player
  // is most likely to press it.
  const wall = [...floor, ...quad(2.5, -10, -3, 10, -40), ...faceZ(-3, -10, 10, 0, 2.5)];
  const player = new MuseumPlayer(collisionWorld(wall));
  player.teleport(0, EYE_HEIGHT + 0.01, 0);
  advance(player, 1);
  advance(player, 0.7, 0, 1);
  assert.ok(player.grounded, 'Standing against a wall still counts as grounded');
  const before = player.eye.y;
  let peak = before;
  for (let i = 0; i < 60; i++) { player.step(1/60, 0, 1, 0, i === 0, false); peak = Math.max(peak, player.eye.y); }
  assert.ok(peak - before > 0.8, `Jump against a wall only rose ${(peak - before).toFixed(2)}`);
});

test('slopes up to 70 degrees count as ground and are climbed', () => {
  // 65 degrees is the case that matters: its upward normal is 0.42, which the
  // old 0.5 threshold rejected as a wall.
  for (const degrees of [45, 65]) {
    const run = 2, rise = run * Math.tan(degrees * Math.PI / 180);
    const player = new MuseumPlayer(collisionWorld([...floor, ...slope(-10, 10, -3, 0, -3 - run, rise)]));
    player.teleport(0, EYE_HEIGHT + 0.01, 0);
    advance(player, 1);
    // Grounded partway up the slope itself is the assertion that matters: an
    // upward normal of cos(65) = 0.42 was a wall under the old 0.5 threshold.
    let groundedOnSlope = false;
    for (let i = 0; i < 90; i++) {
      player.step(1/60, 0, 1, 0, false, false);
      const climbed = player.eye.y - EYE_HEIGHT;
      if (player.grounded && climbed > 0.2 && climbed < rise - 0.2) groundedOnSlope = true;
    }
    advance(player, 0.5);
    assert.ok(groundedOnSlope, `${degrees} degrees should count as ground while climbing it`);
    assert.ok(player.eye.z < -4, `${degrees} degrees: should have climbed, z=${player.eye.z}`);
    assert.ok(player.eye.y > EYE_HEIGHT + rise - 0.1, `${degrees} degrees: should be on top, y=${player.eye.y}`);
    assert.ok(player.grounded, `${degrees} degrees: should be standing on the landing`);
  }
});

test('narrow gaps between path tiles are bridged, wide openings are not', () => {
  const WALK = 0.74;
  // Four tiles two units deep with 0.6 unit seams, over a pit three units down.
  const tiles = [];
  for (let i = 0; i < 4; i++) tiles.push(...quad(WALK, -4, -i * 2.6, 4, -i * 2.6 - 2));
  const player = new MuseumPlayer(collisionWorld([...quad(-3, -40, -40, 40, 40), ...tiles]));
  player.teleport(0, WALK + EYE_HEIGHT, -0.5);
  advance(player, 1);
  let lowest = player.eye.y;
  // Far enough to cross two seams, not far enough to run off the last tile.
  for (let i = 0; i < 55; i++) { player.step(1/60, 0, 1, 0, false, false); lowest = Math.min(lowest, player.eye.y); }
  assert.ok(player.eye.z < -5.5, `Should have crossed two seams, z=${player.eye.z}`);
  assert.ok(lowest > WALK + EYE_HEIGHT - 0.25, `Fell into a seam: lowest eye was ${lowest}`);

  // A four unit opening is a hole in the floor, not a seam between tiles.
  const wide = [...quad(-3, -40, -40, 40, 40), ...quad(WALK, -4, 4, 4, 0), ...quad(WALK, -4, -4, 4, -8)];
  const faller = new MuseumPlayer(collisionWorld(wide));
  faller.teleport(0, WALK + EYE_HEIGHT, 2);
  advance(faller, 1);
  advance(faller, 2, 0, 1);
  assert.ok(faller.eye.y < WALK + EYE_HEIGHT - 1, `A wide opening must stay open, y=${faller.eye.y}`);
});
