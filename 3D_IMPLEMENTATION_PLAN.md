# Flooded museum: implementation and Blender handoff

The placeholder is now a playable Three.js museum inside the existing Next.js portfolio. Open `/museum`, or use **Enter 3D Museum** on the home page. The 3D code and model load when the museum is opened.

## What works

- Desktop: WASD or arrows, mouse look, Space to jump, Shift to move faster, Esc to pause, G for gallery. Click a painting or press E while aiming at it.
- Touch: thumbstick movement, drag to look, tap a painting or its prompt, and a jump button.
- Collision with architecture, stepping stones and rocks. Foliage has no collision. The pool has a shallow floor: visitors can wade through it and jump back onto the galleries. Return to entrance resets position.
- Six stable frame IDs map to the real projects in `lib/data.ts`. Displays show artwork and titles; plaques have labels. Project dialogs provide descriptions, technologies and real links.
- A gallery menu lets visitors read every project without walking, or move directly to a frame. Native dialogs trap keyboard focus. Loading errors offer a retry; the gallery remains usable.
- Warm sunlight, static shadows, sky reflections in glass, animated planar water reflections, fog, and lighter graphics. No camera bob or automatic camera travel. Reduced-motion preference stops water animation.
- GPU instancing for moss and runtime batching for repeated ferns and rocks.

## Which Blender file to edit

Keep editing **`flooded-museum-15-refined.blend`** in Downloads. It was read without saving over it. `public/museum/manifest.json` records its SHA-256 hash.

The separate **`museum-preparation/web/export/flooded-museum-15-browser.blend`** contains the baked export materials. It is generated; changes made there will be replaced when the pipeline runs again. All its images are packed.

The exporter creates `UV_WebColor` for 30 shared mesh assets and bakes procedural stone/rock base colours using Cycles Emission baking. Original normal maps retain their original UV layer. Existing colour/AO patterns in the source materials are captured; this is **not a Combined lighting bake**.

The optimizer creates `public/museum/museum.glb` with:

- WebP colour textures and lossless WebP normal textures, capped at 1024 pixels per dimension.
- MikkTSpace tangents generated after triangulation where Blender could not provide them.
- Meshopt geometry compression; the decoder ships locally with the app.
- 2,967 visible moss instances. Blender exported 3,681 particle slots; 714 had zero scale from density masking and were removed. This filter removes no visible moss.
- Archive geometry and the stray lantern outside the building excluded. Add-on metadata stripped; project IDs and roles retained.

The model is approximately **15.3 MB**, plus a 1.5 MB collision file, preview and project images. GPU memory use is larger than the compressed download.

## Re-export after editing Blender

Save the authoring file first. Run from the repository in PowerShell:

```powershell
& 'C:\Program Files (x86)\Steam\steamapps\common\Blender\blender.exe' -b '..\flooded-museum-15-refined.blend' --python scripts\export-museum.py -- --out '..\museum-preparation\web\export'
npm.cmd run museum:optimize
npm.cmd run test:museum:assets
npm.cmd run test:museum
```

The script uses a background Blender process and does not interact with the open Blender window. Do not run two copies of the pipeline simultaneously. The bake cache is keyed by the source file hash; use a fresh output directory if you modify the bake script itself.

For another export directory: `npm.cmd run museum:optimize -- C:\path\to\export`. The preview currently comes from the owner's `museum-preparation/v15/overview.png`; update that image or the optimizer's preview path after visible scene changes.

Keep `EXPORT_Museum` and the names `Project_01_Frame/Plaque/Display` through `Project_06_Frame/Plaque/Display`, with their `project_id` and `role` properties. `lib/museum/projects.ts` maps those IDs to project slugs. Re-export both model and collision when moving geometry. Frame viewpoints are calculated from the displays, with a floor height matched to this scene; tests check those viewpoints.

## Remaining Blender and visual work

There is no modelling or baking blocker for trying this version in the website. Remaining work is polish:

1. **Lighting match:** browser lighting is real time. For a closer Cycles match, add a dedicated indirect-light/AO bake workflow. Keep the original normal UVs; do not apply scene lighting a second time to a Combined bake. Putting everything into one shared material and baking once is insufficient for this scene.
2. **Materials:** rock base colours are baked, but procedural rock bump is not. Fern colour grading is approximated by a browser tint. Review stone/metal roughness and normal strength in the browser; arbitrary Blender node graphs do not transfer unchanged.
3. **Water access:** the stones have real gaps and the pool is below the gallery. Jumping and direct frame visits work. To allow continuous walking without jumping or wading, add visible connecting stones or shallow steps, then regenerate collision.
4. **Vegetation:** review moss thickness and fern silhouettes at walking height before adding more. Check browser performance after any additions.

For lighting in Blender use **Rendered**, the fourth viewport sphere. Material Preview uses a preview environment unless Scene Lights and Scene World are enabled. Use the browser to judge the exported result.

## Checks and publishing

With Node 22.18+ and npm:

```powershell
npm.cmd run lint
npm.cmd run test:museum
npm.cmd run test:museum:assets
npm.cmd run build
```

With a local server running, `npm.cmd run test:museum:browser` checks desktop movement, all frames, mouse/keyboard interaction, pause, reset, touch movement, dialogs, failure recovery and return to the portfolio. It uses installed Microsoft Edge on this Windows machine. Set `BROWSER_PATH` for a different Chromium executable, or `MUSEUM_URL` for a different local port. Reports and screenshots go to ignored `test-results/`.

The asset check reports zero glTF errors and warnings and separately verifies decoded coordinates, project IDs, UV separation, visible moss and the download budget. The Khronos validator does not itself validate the meshopt and GPU-instancing extensions, so those receive separate checks and browser loading tests.

Before publishing, review the look and movement on your desktop and a real phone, then push the finished branch through the existing GitHub/Vercel workflow. Touch emulation verifies controls and layout; it does not establish physical-phone performance. No universal frame-rate claim is made.

References: [Blender glTF material/UV export](https://docs.blender.org/manual/en/4.4/addons/import_export/scene_gltf2.html), [Three.js GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html), [Three.js Octree](https://threejs.org/docs/pages/Octree.html).
