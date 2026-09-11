import test from 'node:test';
import assert from 'node:assert/strict';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import * as THREE from 'three';
import { prepareGalleryFloor } from '../lib/museum/floor.ts';

function worldCoordinates(mesh) {
  const position = mesh.geometry.getAttribute('position'), index = mesh.geometry.index;
  return Array.from({ length: index?.count ?? position.count }, (_, i) =>
    new THREE.Vector3().fromBufferAttribute(position, index ? index.getX(i) : i)
      .applyMatrix4(mesh.matrixWorld).toArray()).flat();
}

test('gallery material replacement preserves the exported floor and its particle parent', async () => {
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
  const document = await io.read('public/museum/museum.glb');
  const node = document.getRoot().listNodes().find((node) => node.getName() === 'Museum_Base_MossEmitter');
  const surfaceNode = node.listChildren().find((child) => child.getMesh()?.listPrimitives()
    .some((primitive) => primitive.getMaterial()?.getName().includes('MAT_Base_WeatheredStone')));
  const primitive = surfaceNode.getMesh().listPrimitives()[0], accessor = primitive.getAttribute('POSITION');
  const vertices = Array.from({ length: accessor.getCount() }, (_, i) => accessor.getElement(i, [])).flat();
  const geometry = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(Array.from(primitive.getIndices().getArray()));
  const material = new THREE.MeshStandardMaterial({ name: primitive.getMaterial().getName() });
  const base = new THREE.Mesh(geometry, material);
  base.applyMatrix4(new THREE.Matrix4().fromArray(surfaceNode.getMatrix()));
  // Match GLTFLoader's Group for nodes with both a mesh and particle children.
  const emitter = new THREE.Group();
  emitter.name = node.getName();
  emitter.applyMatrix4(new THREE.Matrix4().fromArray(node.getWorldMatrix()));
  const particles = new THREE.InstancedMesh(new THREE.PlaneGeometry(), new THREE.MeshBasicMaterial(), 1);
  emitter.add(base, particles);
  const root = new THREE.Group(), scene = new THREE.Scene();
  root.add(emitter); scene.add(root); scene.updateMatrixWorld(true);
  const before = worldCoordinates(base).sort((a, b) => a - b);
  const particleMatrix = particles.matrixWorld.clone();
  prepareGalleryFloor(root, scene);
  scene.updateMatrixWorld(true);
  const floor = scene.getObjectByName('Museum_Gallery_Floor');
  assert.ok(floor instanceof THREE.Mesh, 'No detailed walking surface was created');
  assert.ok(floor.geometry.getAttribute('position').count > 100);
  const after = [...worldCoordinates(base), ...worldCoordinates(floor)].sort((a, b) => a - b);
  assert.equal(after.length, before.length, 'Floor faces were lost or duplicated');
  for (let i = 0; i < before.length; i++) assert.ok(Math.abs(before[i] - after[i]) < 0.00001, 'Walking surface moved');
  assert.equal(particles.parent, emitter);
  assert.ok(particles.matrixWorld.equals(particleMatrix), 'Floor replacement moved its vegetation');
  const normals = floor.geometry.getAttribute('normal');
  for (let i = 0; i < normals.count; i++) assert.ok(normals.getY(i) > 0.98, 'A wall/underside received the walking material');
  const uv = floor.geometry.getAttribute('uv');
  assert.ok(Math.max(...uv.array) - Math.min(...uv.array) > 10, 'Stone detail is stretched across the entire building');
});
