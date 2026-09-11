import { readFile, writeFile, mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import validator from 'gltf-validator';

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
  }
}
const instances = root.listNodes().filter((node) => node.getExtension('EXT_mesh_gpu_instancing'));
const mossCount = instances.reduce((total, node) => total + node.getExtension('EXT_mesh_gpu_instancing').getAttribute('TRANSLATION').getCount(), 0);
assert.equal(mossCount, manifest.visibleMossInstances, 'Moss export lost or duplicated visible instances');
assert.ok(mossCount > 2000 && mossCount <= manifest.sourceParticleSlots);
assert.ok(!root.listNodes().some((n) => /Archive|Museum_Lantern/.test(n.getName())), 'Archive geometry leaked into export');
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
