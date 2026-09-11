import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, meshopt, prune, tangents, textureCompress, unweld, weld } from '@gltf-transform/functions';
import { MeshoptEncoder } from 'meshoptimizer';
import * as MikkTSpace from 'three/addons/libs/mikktspace.module.js';
import sharp from 'sharp';
import { copyFile, mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';

const source = path.resolve(process.argv[2] || '../museum-preparation/web/export');
const target = path.resolve('public/museum');
await mkdir(target, { recursive: true });
await Promise.all([MeshoptEncoder.ready, MikkTSpace.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder': MeshoptEncoder});
const document = await io.read(path.join(source, 'museum.raw.glb'));
let sourceParticleSlots = 0, visibleMossInstances = 0;
for (const node of document.getRoot().listNodes()) {
  const instances = node.getExtension('EXT_mesh_gpu_instancing');
  if (!instances) continue;
  const scale = instances.getAttribute('SCALE');
  const count = instances.getAttribute('TRANSLATION').getCount();
  sourceParticleSlots += count;
  const kept = [];
  for (let i = 0; i < count; i++) {
    const s = scale ? scale.getElement(i, []) : [1, 1, 1];
    if (s.every((v) => Math.abs(v) > 1e-8)) kept.push(i);
  }
  visibleMossInstances += kept.length;
  // Density-masked legacy particles are exported with zero scale. They are
  // invisible, and rebasing their singular matrices during quantization creates NaNs.
  for (const semantic of instances.listSemantics()) {
    const accessor = instances.getAttribute(semantic);
    const array = accessor.getArray(), size = accessor.getElementSize();
    const filtered = new array.constructor(kept.length * size);
    kept.forEach((index, i) => filtered.set(array.subarray(index * size, (index + 1) * size), i * size));
    accessor.setArray(filtered);
  }
}
// Blender cannot provide tangents for a few original n-gons. Generate them after
// export triangulation, against the normal texture's own UV channel.
await document.transform(unweld(), tangents({generateTangents: MikkTSpace.generateTangents}), weld());
// Preserve named project nodes, UV channels and existing moss GPU instances.
// Lossless WebP for normal maps keeps tangent vectors clean; colour uses WebP q86.
await document.transform(dedup(), prune(), textureCompress({
  encoder: sharp, targetFormat: 'webp', resize: [1024, 1024], quality: 86,
  slots: /^(?!normalTexture)/,
}));
await document.transform(textureCompress({
  encoder: sharp, targetFormat: 'webp', resize: [1024, 1024], lossless: true,
  slots: /^normalTexture$/,
}));
await document.transform(meshopt({encoder: MeshoptEncoder, level: 'medium', quantizePosition: 16, quantizeTexcoord: 16}));
await io.write(path.join(target, 'museum.glb'), document);
await copyFile(path.join(source, 'collision.json'), path.join(target, 'collision.json'));
const report = JSON.parse(await readFile(path.join(source, 'export-report.json'), 'utf8'));
report.rawBytes = (await stat(path.join(source, 'museum.raw.glb'))).size;
report.webBytes = (await stat(path.join(target, 'museum.glb'))).size;
report.textureLimit = 1024;
report.sourceParticleSlots = sourceParticleSlots;
report.visibleMossInstances = visibleMossInstances;
await writeFile(path.join(target, 'manifest.json'), JSON.stringify(report, null, 2));
// This preview is the owner's rendered museum, also the portfolio frame's artwork.
await sharp(path.resolve('../museum-preparation/v15/overview.png')).resize(1440).webp({quality:85}).toFile(path.join(target, 'preview.webp'));
console.log(JSON.stringify({ rawBytes: report.rawBytes, webBytes: report.webBytes, sourceUnchanged: report.sourceUnchanged }, null, 2));
