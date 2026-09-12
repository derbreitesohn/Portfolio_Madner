# Flo Madner's portfolio

Next.js 16 / React 19 portfolio with a playable Blender museum rendered in Three.js.

## Run locally

Use Node 22.18+ and npm. In PowerShell use `npm.cmd` if script execution policy blocks `npm`.

```powershell
npm.cmd ci
npm.cmd run dev -- --hostname 127.0.0.1 --port 3000
```

Open [the museum](http://127.0.0.1:3000/museum) or [the portfolio](http://127.0.0.1:3000). On this prepared Windows copy, `START-MUSEUM.cmd` starts the server after dependencies have been installed.

Desktop: WASD/arrows, mouse look, Space to jump, Shift to move faster, Esc to pause, G for gallery, click/E to open a painting. Touch: thumbstick, drag to look, tap a painting. The gallery also gives direct access to every project.

## Edit and validate

- Project content: `lib/data.ts`.
- Frame mapping: `lib/museum/projects.ts`.
- Loading, lighting and controls: `lib/museum/engine.ts`.
- Materials and artwork: `lib/museum/model.ts`.
- Collision: `lib/museum/physics.ts`.
- Interface: `components/museum/`.

```powershell
npm.cmd run lint
npm.cmd run test:museum
npm.cmd run test:museum:assets
npm.cmd run build
```

With the server running: `npm.cmd run test:museum:browser`. See [the Blender/export guide](3D_IMPLEMENTATION_PLAN.md) for source files, the bake pipeline, tests and remaining polish.

The GLB, collision, images and decoders ship with the site. Visitors do not need Blender. Viewing only the 2D home page does not download the museum.

## Save, back up and reopen

The website is a folder of source files, not a separate Three.js save file. Open the entire `museum-portfolio` folder in VS Code. Save code edits with Ctrl+S; the development server updates the browser. Blender remains a separate authoring project: save `flooded-museum-15-refined.blend` in Blender, then run the export pipeline to update the website model.

- `lib/museum/`: Three.js scene, lighting, materials, water and movement/collision code.
- `components/museum/`: menus, project dialogs, touch controls, minimap and CSS.
- `public/museum/`: the exported model, collision, preview and local decoder.
- `app/`, `components/`, `lib/data.ts`, `public/`: the static portfolio and shared project content/assets.
- `scripts/`: Blender export, model optimization and asset checks.

To reopen this prepared copy, double-click `START-MUSEUM.cmd` and keep the server window open. Do not start a second server if port 3000 is already running.

The dated source ZIP contains all tracked website code, configuration and assets. It excludes installed dependencies, generated builds, Git history and the separate Blender authoring file. To use it on another computer, extract it, install Node 22.18+ and run `npm.cmd ci`, then `START-MUSEUM.cmd`. Keep a separate backup of your authoring blend and any external Blender textures.

This original Downloads checkout is a linked Git worktree. Its history is stored in `../museum-audit/portfolio-source`; keep that folder while using this checkout. The extracted ZIP works independently and can be initialized as a new Git repository. Local commits and ZIP backups do not publish to GitHub or Vercel.
