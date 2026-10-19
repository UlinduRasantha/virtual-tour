# Current model: house2.glb

The default house view loads `public/models/house2.glb` with walking enabled. Click Enter House; use WASD + mouse, Escape to pause, Resume and Reset, or select touch controls. The starting point is a visually inspected clear indoor position facing the kitchen, not a claimed main entrance. The floor is normalized from raw Y=-1.168. Raw scale is provisionally treated as meters.

975 collision proxies are derived from this scan using `node tools/build-house2-colliders.mjs`: a 4 cm occupancy grid over surfaces 0.22–1.65 units above the floor, with barriers where floor coverage is missing. This conservative flat-floor demo may block narrow or damaged passages; it is not survey-certified and does not support stairs. Model geometry is unchanged and no old-house doorway cleanup is used. The previous public `house.glb` was removed. Office demos remain at `?mode=sample` and `?mode=demo`.

The previous house configuration and browser scenarios are archived under `docs/house/house-v1.*` for reference. The older house-demo sections below describe that previous model.

# Office Explorer

A React 19 / Vite walkthrough prototype. **The default is now the house scan demo using the user-supplied `house.glb`.** It is a bounded entrance-room demo with provisional scale and simplified collisions, not a finished whole-house digital twin. Read `design.md` for the full specification.

## Start

Requires Node 22.14+ and npm. Run `npm install`, then `npm run dev`; open the printed localhost URL. Use `npm ci` for the committed lockfile. On Windows environments missing ComSpec, append `--script-shell=C:\Windows\System32\cmd.exe` to npm commands (or restore the normal OS ComSpec setting).

Commands: `npm run lint`, `npm test`, `npm run build`, `npm run preview`, `npm run test:e2e`. Browser tests use installed Chrome and Edge. They start Vite automatically when needed. No environment variables or secrets are required.

## Controls

- Enter House captures the mouse on desktop. W/S move forward/back; A/D strafe; arrows also work. Movement follows camera heading, ignores pitch, and normalizes diagonals. H opens help and L opens Locations.
- Mouse looks; Escape releases the mouse and pauses. Resume captures only from a user click. Reset returns to the configured entrance and heading.
- Blue markers: aim and click within the configured range. Walls occlude markers. Locations offers a keyboard-accessible text route without motion.
- Touch/coarse-pointer devices: left pad moves; right pad looks; Inspect activates the aimed nearby marker. Desktop users can select this fallback too. Use Pause to open menus.
- Reduced graphics is available in Pause / Controls. No camera bob or automatic travel; UI respects reduced motion.
- `?debug=colliders` displays Rapier collision shapes plus world axes and floor grid. `?mode=real` explicitly selects real import mode.

## Image-inspired sample walkthrough

Open `/?mode=sample` for the office GLB with WASD, mouse look, 38 collision proxies, four hotspots, pause/resume, reset and touch navigation. Follow the right aisle toward the lounge, turn left along the back of the desks, then walk through the back-left doorway into the vestibule. All dimensions and contents are explicitly sample data. The sample model and its generated collision manifest remain separate from OFFICE's real scan configuration.

## House scan demo

Open `/` or `/?mode=house`, click Enter House and walk forward through the confirmed narrow entrance in the white wall. The doorway uses the user's 1 m reference (provisional factor 1.10821); a grounded capsule climbs and descends the approximately 20 cm threshold. Reset returns just outside this entrance. Two hotspots describe the entrance and adjoining room, with the same pause/resume and touch controls as the office demos.

`src/config/house.config.js` contains the transform, collision boxes, entrance spawn and bounded demo route. Walls were located by raycasts; conservative furniture proxies keep the aisle walkable. Adjacent rooms and the wider exterior are deliberately blocked and described as outside this demo. `HouseModel.jsx` displays captured textures unlit and removes triangles intersecting a configured entrance volume in an in-memory copy, so the source GLB is unchanged. Visible scan defects remain elsewhere. This is a demo cleanup, not a faithful repaired architectural export.

The user supplied `public/models/house.glb` and explicitly requested its use in the local demo. It matches the original private scan's SHA-256. No public deployment has been performed or approved; a production build includes this public asset, so review/sanitize it before deploying. The original backup remains under ignored `source-scans/house/`.

Use the welcome screen to switch to the original procedural collision demo (`?mode=demo`). The asset-only orbit viewer at `/tools/sample-office-preview.html` also links to the walkthrough. Both pages must be opened through the Vite localhost URL, not directly from disk.

## Real scan import

1. Keep raw files in ignored `source-scans/`, including original photos and `.blend` files. Follow [capture](docs/CAPTURE_GUIDE.md) and [Blender](docs/BLENDER_PIPELINE.md) guides.
2. Only copy an approved, sanitized GLB into `public/models/real-office.glb`. Everything in `public/` will be downloadable if deployed. No source scans are uploaded by this project.
3. Choose **Set up real office → Inspect installed GLB**, or open `?mode=real`. Missing/malformed assets show errors without silently substituting demo geometry. The inspector reports file size, bounds, mesh and triangle counts; it fits a static view to the model without claiming a valid entrance.
4. In `src/config/office.config.js`, fill OFFICE's `player.spawn` (capsule center), `initialYaw` (radians), measured `colliders`, and approved `hotspots` in `src/data/hotspots.js`. Real values are intentionally null/empty. One unit is one meter, Y-up, flat floor at Y=0; no runtime scale/rotation fixes.
5. Compare measured dimensions, confirm orientation/materials and safe paths, then set `approved: true` and `calibrated: true`. Set `sceneMode: 'real'` for the default. Validation refuses unsafe or incomplete config. These flags record your review; they do not automatically certify the scan.
6. Record approval and measurements in [asset manifest](docs/ASSET_MANIFEST.md). Use the [collider guide](docs/COLLIDER_GUIDE.md) and [acceptance checklist](docs/TEST_CHECKLIST.md).

The import architecture uses a cached `useGLTF` scene, Suspense progress, retry/error handling, and an isolated demo renderer. Draco, Meshopt and KTX2 are disabled until tested with a real export. The byte/header preflight and model loader currently read the asset separately; revisit this for large files. Preflight does not replace full GLTFLoader validation.

## Architecture and milestones

- Phase 0: React/Vite scaffold, lockfile, lint/tests and private-source exclusions.
- Phase 1: fixed 60 Hz Rapier kinematic capsule, collision-aware movement, demo walls/furniture/open doorway, pointer lock, welcome/pause/reset/help.
- Phase 2: explicit real import, config validation, bounds/size inspector, loading/errors and documentation.
- Phase 3: pending the real scan, measured reference wall/door, approved entrance/heading, room restrictions and actual collider calibration. No real coordinates are invented.
- Phase 4: shared touch controls, hotspot/info and accessible Locations implemented. Actual branding, room descriptions, calibrated floorplan and room quick navigation await supplied assets. Map stays hidden.
- Phase 5: lint/unit/physics/browser checks and build are provided. Real GLB optimization, representative device profiling, privacy signoff and deployment remain pending real assets.

Movement runs only in `useBeforePhysicsStep`; camera follow runs in `useFrame`. React state is reserved for overlays/settings. Character controllers are freed on unmount. Office demos hold capsule height on a flat floor. The house demo adds downward ground contact, snapping and autostep for its tested threshold; this is not general staircase support.

## Deployment and limitations

Build static output with `npm run build`; publish only `dist/` to an HTTPS static host after explicit real-office approval. Never deploy the project root. Confidential tours require authenticated asset delivery; a client password overlay cannot protect GLBs. No analytics or external content services are configured.

WebGL2 and hardware acceleration are needed. Pointer lock requires a user gesture and may be denied by embedded browsers; use a standalone browser or the drag controls. Browser tests exercise Chromium implementations; Firefox, Safari and physical mobile devices still need manual checks. Performance goals (50–60 desktop / 30 mobile FPS) are targets, not verified device benchmarks. The Three.js + Rapier payload includes a sizeable physics engine; profile the actual scanned room before expanding.

Doorway fix (2026-10-15): the 4 cm collision grid and 0.22 m capsule radius preserve narrow openings (capsule height remains 1.60 m). Two inspected doorway exceptions in `docs/house/house2-doorways.json` prevent hanging scan fragments from creating full-height barriers, only where scanned floor exists. The garage, blue room, bedroom and right-hand office have bidirectional physics regression tests; adjacent wall blocking is also tested. Stored GLB geometry is unchanged.
