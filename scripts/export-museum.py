"""Run with Blender background mode on the saved authoring file. Never saves over it.

blender -b source.blend --python scripts/export-museum.py -- --out ../museum-export
Creates a browser-only .blend, a GLB, collision triangles, and provenance.
"""
import bpy
import hashlib
import json
import math
import sys
from pathlib import Path
from mathutils import Vector

OUT = Path(sys.argv[sys.argv.index('--out') + 1]).resolve()
OUT.mkdir(parents=True, exist_ok=True)
SOURCE = Path(bpy.data.filepath)
SOURCE_HASH = hashlib.sha256(SOURCE.read_bytes()).hexdigest()
CACHE = OUT / ('bakes-' + SOURCE_HASH[:12])
CACHE.mkdir(exist_ok=True)
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 8
scene.cycles.device = 'CPU'
scene.render.bake.margin = 12
scene.render.bake.use_clear = True
scene.render.bake.use_selected_to_active = False

# Export only public geometry and the small, intentional application metadata.
root = bpy.data.collections['EXPORT_Museum']
visible = [o for o in root.all_objects if o.visible_get() and not o.hide_render]
lantern = bpy.data.objects.get('Museum_Lantern')
if lantern:
    lantern.hide_render = True
    lantern.hide_set(True)
visible = [o for o in visible if o != lantern]
allowed = {'project_id', 'role', 'cast_shadow'}
for datablocks in (bpy.data.objects, bpy.data.meshes, bpy.data.materials, bpy.data.scenes):
    for block in datablocks:
        for key in list(block.keys()):
            if key not in allowed:
                del block[key]

# Physics uses architecture, the real stone paths, and rocks. Leaves and moss
# never become colliders. The underlay is the shallow pool's floor.
colliders = []
collision_names = []
deps = bpy.context.evaluated_depsgraph_get()
for obj in visible:
    if obj.type != 'MESH' or not obj.name.startswith(('Museum_', 'Gazebo_', 'Walkway_', 'Rock_')):
        continue
    if any(s in obj.name for s in ('Glass', 'Lantern', 'Arches', 'Dome', 'Finial')):
        continue
    mesh = obj.evaluated_get(deps).to_mesh()
    mesh.calc_loop_triangles()
    count = 0
    for tri in mesh.loop_triangles:
        points = [obj.matrix_world @ mesh.vertices[i].co for i in tri.vertices]
        if min(p.z for p in points) > 4.5:
            continue
        # Blender Z up -> glTF Y up. Keep full precision near the floor.
        colliders.extend(round(v, 5) for p in points for v in (p.x, p.z, -p.y))
        count += 1
    obj.evaluated_get(deps).to_mesh_clear()
    if count:
        collision_names.append(obj.name)
(OUT / 'collision.json').write_text(json.dumps({'triangles': colliders}, separators=(',', ':')))

bake_mats = {'MAT_Base_WeatheredStone', 'MAT_Stone_Inner', 'MAT_Stone_Outer',
             'MAT_Gazebo_Floor', 'MAT_Ground_Underlay', 'MAT_Rock_Procedural'}
targets = []
seen = set()
for obj in visible:
    if obj.type == 'MESH' and obj.data.as_pointer() not in seen and any(m and m.name in bake_mats for m in obj.data.materials):
        seen.add(obj.data.as_pointer())
        targets.append(obj)

# Particle geometry need not participate in the colour bake. Restore it before export.
particles = [(m, m.show_render, m.show_viewport) for o in visible for m in o.modifiers if m.type == 'PARTICLE_SYSTEM']
for m, _, _ in particles:
    m.show_render = False
    m.show_viewport = False
baked = []
for index, obj in enumerate(targets):
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    mesh = obj.data
    old_uv = mesh.uv_layers.active.name if mesh.uv_layers else 'UVMap'
    if not mesh.uv_layers:
        mesh.uv_layers.new(name=old_uv)
    uv = mesh.uv_layers.new(name='UV_WebColor')
    bake_uv_name = uv.name
    mesh.uv_layers.active = uv
    uv.active_render = True
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.015, correct_aspect=True)
    bpy.ops.object.mode_set(mode='OBJECT')
    size = 512 if obj.name.startswith('Rock_') else 1024
    if obj.name in ('Museum_Walls_MossEmitter', 'Museum_Base_MossEmitter'):
        size = 2048
    path = CACHE / (obj.name + '.png')
    cached = path.exists()
    img = bpy.data.images.load(str(path), check_existing=False) if cached else bpy.data.images.new('Baked_' + obj.name, width=size, height=size, alpha=False)
    img.colorspace_settings.name = 'sRGB'
    entries = []
    for slot, original in enumerate(list(mesh.materials)):
        if not original:
            continue
        mat = original.copy()
        mat.name = original.name + '_Web_' + obj.name
        mesh.materials[slot] = mat
        tree = mat.node_tree
        bsdf = next((n for n in tree.nodes if n.type == 'BSDF_PRINCIPLED'), None)
        if not bsdf:
            raise RuntimeError('Missing Principled BSDF: ' + mat.name)
        # Freeze the existing normal/image UVs before changing the active bake UV.
        original_uv = tree.nodes.new('ShaderNodeUVMap')
        original_uv.uv_map = old_uv
        for node in list(tree.nodes):
            if node.type == 'TEX_IMAGE' and not node.inputs['Vector'].is_linked:
                tree.links.new(original_uv.outputs['UV'], node.inputs['Vector'])
            if node.type == 'NORMAL_MAP':
                node.uv_map = old_uv
        output = next(n for n in tree.nodes if n.type == 'OUTPUT_MATERIAL' and n.is_active_output)
        emission = tree.nodes.new('ShaderNodeEmission')
        base = bsdf.inputs['Base Color']
        if base.is_linked:
            tree.links.new(base.links[0].from_socket, emission.inputs['Color'])
        else:
            emission.inputs['Color'].default_value = base.default_value
        tree.links.new(emission.outputs[0], output.inputs['Surface'])
        target = tree.nodes.new('ShaderNodeTexImage')
        target.image = img
        for n in tree.nodes:
            n.select = False
        target.select = True
        tree.nodes.active = target
        entries.append((tree, bsdf, output, emission, target))
    print('BAKE', index + 1, '/', len(targets), obj.name, size, 'cached' if cached else 'new', flush=True)
    if not cached:
        bpy.ops.object.bake(type='EMIT', uv_layer=bake_uv_name)
        img.filepath_raw = str(path)
        img.file_format = 'PNG'
        img.save()
    img.pack()
    for tree, bsdf, output, emission, target in entries:
        tree.links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
        tree.nodes.remove(emission)
        uvnode = tree.nodes.new('ShaderNodeUVMap')
        uvnode.uv_map = bake_uv_name
        tree.links.new(uvnode.outputs['UV'], target.inputs['Vector'])
        tree.links.new(target.outputs['Color'], bsdf.inputs['Base Color'])
        # A browser stone surface uses a dielectric IOR and no metallic response.
        bsdf.inputs['IOR'].default_value = 1.5
        bsdf.inputs['Metallic'].default_value = 0.0
    mesh.uv_layers.active = mesh.uv_layers[old_uv]
    mesh.uv_layers[old_uv].active_render = True
    baked.append({'object': obj.name, 'resolution': size, 'image': path.name})

for m, render, viewport in particles:
    m.show_render = render
    m.show_viewport = viewport

# Remove non-exportable colour grading on cutouts, retaining actual textures.
for mat in bpy.data.materials:
    if not mat.node_tree:
        continue
    if mat.name.startswith(('MAT_Fern', 'MAT_Moss_Cutout')):
        tree = mat.node_tree
        bsdf = next((n for n in tree.nodes if n.type == 'BSDF_PRINCIPLED'), None)
        if bsdf:
            bsdf.inputs['Metallic'].default_value = 0
            bsdf.inputs['Roughness'].default_value = 0.78

settings = dict(filepath=str(OUT / 'museum.raw.glb'), export_format='GLB',
    use_selection=False, use_visible=True, use_renderable=True, use_active_scene=True,
    export_apply=True, export_extras=True, export_yup=True,
    export_texcoords=True, export_normals=True, export_tangents=True,
    export_gpu_instances=True, export_gn_mesh=False, export_animations=False,
    export_cameras=False, export_lights=False, export_materials='EXPORT')
bpy.ops.export_scene.gltf(**settings)
bpy.ops.wm.save_as_mainfile(filepath=str(OUT / 'flooded-museum-15-browser.blend'))
manifest = {'source': SOURCE.name, 'sourceSha256': SOURCE_HASH, 'blender': bpy.app.version_string,
    'bakes': baked, 'collisionObjects': collision_names, 'collisionTriangles': len(colliders) // 9,
    'sourceUnchanged': hashlib.sha256(SOURCE.read_bytes()).hexdigest() == SOURCE_HASH,
    'notes': ['Base colour bakes, not a full lighting bake.', 'Existing normal maps retain their original UV layer.',
              'Shallow water is walkable; use jump to climb from pool to the gallery.']}
(OUT / 'export-report.json').write_text(json.dumps(manifest, indent=2))
print('EXPORT_READY', json.dumps(manifest), flush=True)
