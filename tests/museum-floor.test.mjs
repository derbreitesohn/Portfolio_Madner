import test from 'node:test';
import assert from 'node:assert/strict';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import * as THREE from 'three';
import { prepareGalleryFloor } from '../lib/museum/floor.ts';

test('floor polish preserves authored texture atlases, normal UVs and geometry on both levels', async () => {
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
  const document = await io.read('public/museum/museum.glb');
  const root = new THREE.Group(), originals = [];
  for (const node of document.getRoot().listNodes()) for (const primitive of node.getMesh()?.listPrimitives() ?? []) {
    const source = primitive.getMaterial();
    if (!source.getName().startsWith('MAT_Base_WeatheredStone')) continue;
    const geometry = new THREE.BufferGeometry(), positions = primitive.getAttribute('POSITION');
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(Array.from({length:positions.getCount()}, (_, i) => positions.getElement(i, [])).flat(), 3));
    geometry.setIndex(Array.from(primitive.getIndices().getArray()));
    for (const channel of [0, 1]) {
      const uv = primitive.getAttribute(`TEXCOORD_${channel}`);
      geometry.setAttribute(channel ? 'uv1' : 'uv', new THREE.Float32BufferAttribute(Array.from({length:uv.getCount()}, (_, i) => uv.getElement(i, [])).flat(), 2));
    }
    const map = new THREE.Texture(), normalMap = new THREE.Texture();
    normalMap.image = { width: 800, height: 800 };
    map.channel = source.getBaseColorTextureInfo().getTexCoord();
    normalMap.channel = source.getNormalTextureInfo().getTexCoord();
    const material = new THREE.MeshStandardMaterial({ name: source.getName(), map, normalMap });
    const mesh = new THREE.Mesh(geometry, material), group = new THREE.Group();
    group.add(mesh); root.add(group);
    mesh.applyMatrix4(new THREE.Matrix4().fromArray(node.getWorldMatrix()));
    originals.push({ mesh, geometry, map, normalMap, matrix: mesh.matrix.clone(), colourUV: map.channel, normalUV: normalMap.channel });
  }
  assert.equal(originals.length, 2, 'The gallery and waterside step must both use the weathered material');
  prepareGalleryFloor(root);
  assert.equal(root.children.length, 2, 'A replacement floor was added');
  for (const { mesh, geometry, map, normalMap, matrix, colourUV, normalUV } of originals) {
    assert.equal(mesh.geometry, geometry, 'Floor geometry or UVs were replaced');
    assert.ok(mesh.matrix.equals(matrix), 'Floor moved relative to collision');
    assert.equal(mesh.material.map, map, 'Authored dirt/stone colour was replaced');
    assert.equal(mesh.material.normalMap.image, normalMap.image, 'Authored normal texture pixels were replaced');
    assert.equal(map.channel, colourUV); assert.equal(mesh.material.normalMap.channel, normalUV);
    assert.equal(normalMap.repeat.x, 1, 'Changing the floor sampler altered another material');
    assert.ok(mesh.material.normalMap.repeat.x > 6 && mesh.material.normalMap.repeat.x < 9, 'Stone pattern remains stretched across the building');
    assert.notEqual(colourUV, normalUV, 'Bake atlas and original normal UVs were conflated');
    assert.ok(mesh.material.normalScale.x > 0 && mesh.material.normalScale.x < 1 && mesh.material.roughness > 0.85);
  }
});
