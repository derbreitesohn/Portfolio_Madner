# 3D Museum Implementation Plan

This plan details how we will integrate your Blender models into the portfolio and set up a first-person interactive experience using React Three Fiber.

## User Review Required
> [!IMPORTANT]
> Please review the workflow below. If you approve, I will set up the placeholder scene and the first-person walking controls right now. 

## 1. How to Prepare Your Blender Model (Baking Lighting)

Since computing shadows and lighting in the browser is very expensive, we want to pre-calculate (bake) it in Blender so the web version runs flawlessly at 60+ FPS on any device.

> [!TIP]
> **Quick Guide to Baking in Blender:**
> 1. Set your render engine to **Cycles**.
> 2. Select all objects in your scene, unwrap their UVs (Smart UV Project works well), and ensure they share a single material (or texture atlas) if possible.
> 3. Create a new Image Texture node in your material (don't connect it to anything, just keep it selected).
> 4. Go to the **Render Properties** tab -> **Bake** section.
> 5. Set **Bake Type** to **Combined** (this includes color + lighting + shadows).
> 6. Hit **Bake**. 
> 7. Save the resulting image.
> 8. Re-assign this baked image texture to a simple `Principled BSDF` (with Specular/Roughness tweaked) or `Emission` node so the model is fully lit without scene lights.
> 9. Export as **glTF 2.0 (.glb)**.

## 2. Setting up the 3D Environment (React Three Fiber)

We already have `@react-three/fiber`, `@react-three/drei`, and `three` installed. Here is how we will structure the code:

### Proposed Changes

#### [NEW] `components/ThreeScene.tsx`
- Sets up the `<Canvas>` element.
- Adds `dpr={[1, 1.5]}` to ensure good performance on high-res displays.
- Hosts the environment, lights, and models.

#### [NEW] `components/Player.tsx`
- We will build a basic First-Person controller.
- It will use keyboard inputs (`WASD` or arrows) to calculate movement.
- It will use `@react-three/drei`'s `<PointerLockControls />` to allow you to look around using the mouse.

#### [NEW] `components/MuseumModel.tsx`
- A placeholder component that uses `useGLTF('/placeholder.glb')` to load your 3D environment.
- When you export your final Blender model, you will simply replace `placeholder.glb` with your actual file, and this component will automatically render it!

#### [MODIFY] `app/page.tsx`
- We will hook up the "ENTER 3D EXPERIENCE" button. 
- When clicked, the 2D UI will fade out, the Pointer Lock will engage (hiding the mouse), and the user will be dropped directly into the 3D `<ThreeScene />`.

## 3. Verification Plan
Once built, you can export a simple box or room from Blender as `placeholder.glb`, place it in the `public` folder, and test walking around locally. Once your full museum is baked and exported, you simply overwrite the file!
