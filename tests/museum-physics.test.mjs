import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { collisionWorld, MuseumPlayer } from '../lib/museum/physics.ts';

const floor = [-50,0,-50, -50,0,50, 50,0,50, -50,0,-50, 50,0,50, 50,0,-50];
function advance(player, seconds, strafe = 0, forward = 0, yaw = 0, jump = false) {
  for (let i = 0; i < Math.round(seconds * 60); i++) player.step(1/60, strafe, forward, yaw, jump && i === 0, false);
}

test('player settles on a floor and moves at the same speed diagonally', () => {
  const world = collisionWorld(floor);
  const player = new MuseumPlayer(world);
  player.teleport(0, 2, 0);
  advance(player, 1);
  assert.ok(Math.abs(player.eye.y - 1.7) < 0.015);
  assert.ok(player.grounded);
  advance(player, 2, 0, 1);
  const straight = Math.hypot(player.eye.x, player.eye.z);
  player.teleport(0, 1.71, 0);
  advance(player, 1);
  advance(player, 2, 1, 1);
  assert.ok(Math.abs(Math.hypot(player.eye.x, player.eye.z) - straight) < 0.02);
});

test('outward facing wall blocks movement and allows sliding', () => {
  const wall = [-3,0,-3, 3,4,-3, 3,0,-3, -3,0,-3, -3,4,-3, 3,4,-3];
  const player = new MuseumPlayer(collisionWorld([...floor, ...wall]));
  player.teleport(0, 1.71, 0);
  advance(player, 2, 0, 1);
  assert.ok(player.eye.z > -2.71 && player.eye.z < -2.65);
  advance(player, 0.4, 1, 1);
  assert.ok(player.eye.x > 0.5);
  assert.ok(player.eye.z > -2.71);
});

test('jump returns to the floor; a long frame cannot tunnel through it', () => {
  const player = new MuseumPlayer(collisionWorld(floor));
  player.teleport(0, 1.71, 0);
  advance(player, 1);
  advance(player, .3, 0, 0, 0, true);
  assert.ok(player.eye.y > 2.7);
  advance(player, 2);
  assert.ok(Math.abs(player.eye.y - 1.7) < .02);
  player.teleport(0, 3, 0);
  player.step(5, 0, 0, 0, false, false);
  assert.ok(player.eye.y > 2.9);
});

test('actual museum entrance and all six frame visit positions have usable floors', () => {
  const { triangles } = JSON.parse(readFileSync(new URL('../public/museum/collision.json', import.meta.url)));
  const world = collisionWorld(triangles);
  const player = new MuseumPlayer(world);
  advance(player, 1);
  assert.ok(Math.abs(player.eye.y - 2.428) < .04, `Entrance y=${player.eye.y}`);
  for (const x of [-22.625, 23.0525]) for (const z of [19.62851, .34106, -18.94638]) {
    player.teleport(x, 2.44, z);
    advance(player, 1);
    assert.ok(Math.abs(player.eye.y - 2.428) < .06, `Frame floor at ${x},${z}: y=${player.eye.y}`);
    assert.ok(Math.abs(player.eye.x - x) < .1 && Math.abs(player.eye.z - z) < .1, 'Frame viewpoint overlaps architecture');
  }
});

test('actual museum walls contain the player and water has a shallow floor', () => {
  const { triangles } = JSON.parse(readFileSync(new URL('../public/museum/collision.json', import.meta.url)));
  const player = new MuseumPlayer(collisionWorld(triangles));
  player.teleport(-26, 2.44, .34106);
  advance(player, 3, -1, 0);
  assert.ok(player.eye.x >= -28.01 && player.eye.y > 2.3);
  player.teleport(10, 2, 4);
  advance(player, 2);
  assert.ok(player.eye.y > 1.1 && player.eye.y < 1.2, `Pool eye height: ${player.eye.y}`);
});
