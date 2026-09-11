import { readFile, writeFile, mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import validator from 'gltf-validator';
import { BufferGeometry, Float32BufferAttribute, Matrix4, Mesh, Quaternion, Vector3 } from 'three';
import { plaqueSurface } from '../lib/museum/plaque.ts';

await mkdir('test-results', {recursive:true});
const bytes = await readFile('public/museum/museum.glb');
const manifest = JSON.parse(await readFile('public/museum/manifest.json', 'utf8'));
const result = await validator.validateBytes(new Uint8Array(bytes), { maxIssues: 1000 });
await writeFile('test-results/gltf-validator.json', JSON.stringify(result, null, 2));
assert.equal(result.issues.numErrors, 0, 'glTF structural validation failed');
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder': MeshoptDecoder});
const document = await io.read('public/museum/museum.glb');
const root = document.getRoot();
for (let i = 1; i <= 6; i++) {
  const n = String(i).padStart(2, '0');
  for (const suffix of ['Frame', 'Plaque', 'Display']) {
    const node = root.listNodes().find((node) => node.getName() === `Project_${n}_${suffix}`);
    assert.ok(node, `Missing Project_${n}_${suffix}`);
    assert.equal(node.getExtras().project_id, `project_${n}`);
    if (suffix === 'Plaque') {
      const primitive = node.getMesh().listPrimitives()[0];
      const positions = primitive.getAttribute('POSITION');
      const vertices = [];
      for (let j = 0; j < positions.getCount(); j++) vertices.push(...positions.getElement(j, []));
      const geometry = new BufferGeometry().setAttribute('position', new Float32BufferAttribute(vertices, 3));
      geometry.setIndex(Array.from(primitive.getIndices().getArray()));
      const mesh = new Mesh(geometry);
      mesh.applyMatrix4(new Matrix4().fromArray(node.getWorldMatrix()));
      const inward = i <= 3 ? 1 : -1;
      const surface = plaqueSurface(mesh, inward);
      assert.ok(surface.normal.x * inward > .90 && surface.normal.y > .39 && surface.normal.y < .42,
        'Plaque lettering lost the actual upward tilt');
      assert.ok(Math.abs(surface.width - 1.05) < .01 && Math.abs(surface.height - .594) < .01);
      assert.ok(Math.abs(surface.center.y - 3.295) < .01, 'Label fitted to the back or edge of the plaque');
      geometry.dispose(); mesh.material.dispose();
    }
  }
}
const instances = root.listNodes().filter((node) => node.getExtension('EXT_mesh_gpu_instancing'));
const mossCount = instances.reduce((total, node) => total + node.getExtension('EXT_mesh_gpu_instancing').getAttribute('TRANSLATION').getCount(), 0);
assert.equal(mossCount, manifest.visibleMossInstances, 'Moss export lost or duplicated visible instances');
assert.ok(mossCount > 2000 && mossCount <= manifest.sourceParticleSlots);
assert.equal(mossCount + manifest.maskedMossInstances + manifest.floodedMossInstances, manifest.sourceParticleSlots);
for (const node of instances) {
  const inst = node.getExtension('EXT_mesh_gpu_instancing');
  const positions = inst.getAttribute('TRANSLATION');
  const world = new Matrix4().fromArray(node.getWorldMatrix());
  const vertices = node.getMesh().listPrimitives()[0].getAttribute('POSITION');
  const min = vertices.getMinNormalized([]), max = vertices.getMaxNormalized([]);
  const attachment = new Vector3().fromArray(node.getExtras().mossRootInBounds.map((v, axis) => min[axis] + v * (max[axis] - min[axis])));
  for (let i = 0; i < positions.getCount(); i++) {
    const matrix = new Matrix4().compose(new Vector3().fromArray(positions.getElement(i, [])),
      new Quaternion().fromArray(inst.getAttribute('ROTATION').getElement(i, [])),
      new Vector3().fromArray(inst.getAttribute('SCALE').getElement(i, [])));
    const p = attachment.clone().applyMatrix4(matrix).applyMatrix4(world);
    assert.ok(p.y >= .11, 'Moss is rooted below the waterline');
    if (node.getName().startsWith('Museum_Base_')) {
      assert.ok(p.y >= 2 || Math.abs(p.x) >= 19.79 || Math.abs(p.z) >= 19.79, 'Moss spawned in the open pool');
    }
  }
}
assert.ok(!root.listNodes().some((n) => /Archive|Museum_Lantern|^Moss_Patch_Source$/.test(n.getName())), 'Archive or standalone particle source leaked into export');
let nonfinite = 0;
for (const accessor of root.listAccessors()) {
  const array = accessor.getArray();
  if (array) for (const n of array) if (!Number.isFinite(n)) nonfinite++;
}
assert.equal(nonfinite, 0, 'Compressed geometry decoded to invalid coordinates');
const bakedMaterials = root.listMaterials().filter((m) => m.getName().includes('_Web_'));
assert.ok(bakedMaterials.length >= 30);
const imageBakes = bakedMaterials.filter((m) => m.getBaseColorTexture());
assert.ok(imageBakes.length >= 25, 'Procedural colour bakes were lost');
assert.ok(imageBakes.some((m) => m.getName().includes('Museum_Walls_MossEmitter')));
for (const material of bakedMaterials) {
  // Uniform-colour bake images may be folded into a colour factor by prune().
  if (material.getNormalTexture() && material.getBaseColorTexture()) assert.notEqual(material.getBaseColorTextureInfo().getTexCoord(), material.getNormalTextureInfo().getTexCoord(), 'Colour bake overwrote original normal UVs');
}
assert.ok(bytes.length < 20_000_000, 'Museum download exceeds budget');
const report = { bytes: bytes.length, frames: 6, mossInstances: mossCount, bakedMaterials: bakedMaterials.length,
  meshes: root.listMeshes().length, textures: root.listTextures().length,
  validatorErrors: result.issues.numErrors, validatorWarnings: result.issues.numWarnings,
  validatorLimitations: ['EXT_meshopt_compression and EXT_mesh_gpu_instancing are not checked by this validator; decoded data and instance counts are checked separately.'] };
await writeFile('test-results/asset-check.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
