import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, meshopt, prune, tangents, textureCompress, unweld, weld } from '@gltf-transform/functions';
import { MeshoptEncoder } from 'meshoptimizer';
import * as MikkTSpace from 'three/addons/libs/mikktspace.module.js';
import sharp from 'sharp';
import { copyFile, mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { Matrix4, Quaternion, Vector3 } from 'three';

const source = path.resolve(process.argv[2] || '../museum-preparation/web/polished-export');
const target = path.resolve('public/museum');
await mkdir(target, { recursive: true });
await Promise.all([MeshoptEncoder.ready, MikkTSpace.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder': MeshoptEncoder});
const document = await io.read(path.join(source, 'museum.raw.glb'));
// The particle template is needed during Blender export, but is not a placed
// exhibit plant. Remove only its standalone node; instances keep its shared mesh.
for (const node of document.getRoot().listNodes()) {
  if (node.getName() === 'Moss_Patch_Source') node.dispose();
}
const mossSnapshot = JSON.parse(await readFile(path.join(source, 'moss-instances.json'), 'utf8'));
let sourceParticleSlots = 0, visibleMossInstances = 0, maskedMossInstances = 0, floodedMossInstances = 0;
const mossGroups = [];
for (const node of document.getRoot().listNodes()) {
  const instances = node.getExtension('EXT_mesh_gpu_instancing');
  if (!instances) continue;
  const scale = instances.getAttribute('SCALE');
  const count = instances.getAttribute('TRANSLATION').getCount();
  const saved = mossSnapshot[node.getName()];
  if (!saved || saved.length !== count) throw new Error(`Missing Blender particle snapshot: ${node.getName()}`);
  const inverseWorld = new Matrix4().fromArray(node.getWorldMatrix()).invert();
  const local = new Matrix4(), t = new Vector3(), q = new Quaternion(), s = new Vector3();
  saved.forEach((matrix, i) => {
    local.fromArray(matrix).premultiply(inverseWorld);
    // Singular density-masked matrices must not be decomposed to a quaternion.
    if (Math.abs(local.determinant()) < 1e-12) {
      instances.getAttribute('SCALE').setElement(i, [0, 0, 0]);
      return;
    }
    local.decompose(t, q, s);
    // Keep the artist's rotation and proportions. These are upright alpha
    // cards, not a flat decal: rotating and squashing them exposes their edges.
    instances.getAttribute('TRANSLATION').setElement(i, t.toArray());
    instances.getAttribute('ROTATION').setElement(i, q.toArray());
    instances.getAttribute('SCALE').setElement(i, s.toArray());
  });
  sourceParticleSlots += count;
  const kept = [];
  const world = new Matrix4().fromArray(node.getWorldMatrix());
  const position = new Vector3();
  const isBase = node.getName().startsWith('Museum_Base_');
  const scaleFactor = isBase ? 0.62 : 0.75;
  const sourcePositions = node.getMesh().listPrimitives()[0].getAttribute('POSITION');
  const min = sourcePositions.getMin([]), max = sourcePositions.getMax([]);
  // Compression can rebase a mesh around its bounds. Record where the original
  // attachment point lies within those bounds so validation can recover it.
  node.setExtras({...node.getExtras(), mossRootInBounds: min.map((v, axis) => -v / (max[axis] - v))});
  for (let i = 0; i < count; i++) {
    const s = scale ? scale.getElement(i, []) : [1, 1, 1];
    if (s.some((v) => Math.abs(v) <= 1e-8)) { maskedMossInstances++; continue; }
    position.fromArray(instances.getAttribute('TRANSLATION').getElement(i, [])).applyMatrix4(world);
    // The base emitter includes submerged geometry. Moss belongs to dry stone;
    // the clear pool and its stepping route must remain readable at eye level.
    const inPool = Math.abs(position.x) < 19.8 && Math.abs(position.z) < 19.8;
    if (position.y < 0.12 || (isBase && inPool && position.y < 2)) {
      floodedMossInstances++;
      continue;
    }
    kept.push(i);
  }
  visibleMossInstances += kept.length;
  mossGroups.push({name: node.getName(), source: count, kept: kept.length, scaleFactor});
  // Density-masked legacy particles are exported with zero scale. They are
  // invisible, and rebasing their singular matrices during quantization creates NaNs.
  for (const semantic of instances.listSemantics()) {
    const accessor = instances.getAttribute(semantic);
    const array = accessor.getArray(), size = accessor.getElementSize();
    const filtered = new array.constructor(kept.length * size);
    kept.forEach((index, i) => filtered.set(array.subarray(index * size, (index + 1) * size), i * size));
    accessor.setArray(filtered);
    if (semantic === 'SCALE') for (let i = 0; i < filtered.length; i++) filtered[i] *= scaleFactor;
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
report.maskedMossInstances = maskedMossInstances;
report.floodedMossInstances = floodedMossInstances;
report.mossGroups = mossGroups;
report.mossPlacement = 'Evaluated Blender world transforms captured before UV baking';
report.mossShape = 'Original Blender rotations and proportions; uniform scale reduction only';
report.excludedSourceObjects = ['Moss_Patch_Source'];
await writeFile(path.join(target, 'manifest.json'), JSON.stringify(report, null, 2));
// This preview is the owner's rendered museum, also the portfolio frame's artwork.
await sharp(path.resolve('../museum-preparation/v15/overview.png')).resize(1440).webp({quality:85}).toFile(path.join(target, 'preview.webp'));
console.log(JSON.stringify({ rawBytes: report.rawBytes, webBytes: report.webBytes, sourceUnchanged: report.sourceUnchanged }, null, 2));
