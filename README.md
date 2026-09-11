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
