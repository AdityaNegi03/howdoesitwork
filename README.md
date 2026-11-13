# HowDoesItWork

Take machines apart in 3D. Pick a machine, open it up, pull out any component, and
read what it actually does.

Three machines ship today, each a deliberately different teardown topology:

| Machine | Category | Parts | Topology |
| --- | --- | --- | --- |
| Smartphone | Electronics | 16 | Flat layer stack |
| Graphics Card | Computer Accessories | 13 | PCB + stacked cooler, with sub-assemblies on the board |
| Brushed DC Motor | Machines | 9 | Rotational / axial |

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production build
```

## The core idea

Every part is **procedural geometry described in data**, not a downloaded 3D model.
A part is a list of primitives (boxes, cylinders, spheres, toruses) with offsets,
rotations and materials. Composed, those cover most hardware: a logic board gets its
chips, a midframe gets its four rails, a motor armature gets its copper windings.

This matters because sourcing teardown-accurate, separable 3D models is the expensive
part of a product like this — a model where the battery, logic board and camera module
are genuinely separate correctly-named meshes is something you buy, commission or model
yourself, and you pay again for every new machine. Describing generic parts in code
removes that cost entirely, at the price of stylised rather than photoreal geometry.

The viewer never needs to know what machine it is showing. Adding a machine is one data
file and one line in `src/content/index.ts` — no new components.

## Layout

```
src/
  content/
    types.ts              # the content model — no three.js, no React
    categories.ts         # part-category labels + colours
    machine-categories.ts # top-level catalogue categories
    smartphone.ts         # one machine = one data file
    gpu.ts
    dc-motor.ts
    index.ts              # machine registry + grouping
  scene/
    geometry.ts     # geometry construction, caching, bounds
    PartObject.tsx  # one part: primitives, hover/select, explode damping
    MachineModel.tsx
    CameraRig.tsx   # framing, focus-on-part, follow-while-exploding
    Viewer.tsx      # Canvas, lighting, environment
  ui/
    Catalogue.tsx         # home view, machines grouped by category
    MachineSwitcher.tsx   # in-viewer dropdown, grouped
    PartList.tsx          # left panel, teardown order
    InfoPanel.tsx         # right panel, the explanation
    Toolbar.tsx           # explode / isolate / labels / reset
  store.ts          # zustand app state
```

## Navigation

The app opens on a **catalogue** grouping machines into four categories —
Electronics, Computer Accessories, Machines, Software — defined in
`src/content/machine-categories.ts`. Picking one opens the viewer; the topbar then
carries a back link, a category breadcrumb and a grouped switcher for jumping
between machines without returning to the catalogue.

Empty categories still render, showing what is planned rather than being hidden.
**Software** is currently empty: the content model handles it without changes
(layers of a browser or a compiler explode exactly like layers of a phone), but no
software machine has been authored yet.

## Adding a machine

Copy `src/content/dc-motor.ts`, set its `category`, then register it:

```ts
// src/content/index.ts
export const MACHINES: Machine[] = [smartphone, dcMotor, yourMachine]
```

Per part you author:

| Field      | What it does                                                        |
| ---------- | ------------------------------------------------------------------- |
| `shape`    | List of primitives. Use `repeat` for arrays of screws, chips, LEDs.  |
| `position` | Resting position in the assembled machine.                          |
| `explode`  | Offset applied at full explode — direction *and* distance.          |
| `layer`    | Teardown depth. 0 = removed first. Drives list ordering.            |
| `body`     | The explanation, as paragraphs.                                     |
| `analogy`  | A plain-language comparison. The bit people remember.               |

The machine itself needs a `category` from `MachineCategory`, which places it in the
catalogue.

Units are arbitrary but must be self-consistent within a machine (the phone is ~3 units
tall). Camera distance is computed from the machine's real bounds, so scale is free —
`defaultCamera.position` only sets the viewing *angle*.

### Authoring explode vectors

This is the only part that takes taste. Two patterns that read well:

- **Layer stacks** (phone, TV, laptop): explode along the thickness axis, magnitude
  increasing with distance from the middle of the stack. Give small parts a lateral
  nudge so they clear the big plates.
- **Rotational assemblies** (motor, pump, gearbox): spread the rotating group along the
  shaft axis in assembly order, and lift the enclosing shells clear perpendicular to it.

Two traps worth knowing, both hit while authoring the GPU:

- **Parts sharing a footprint need different directions.** The heat pipes run through
  the fin stack, so exploding both along +Z left the pipes permanently hidden behind
  the fins. One of them has to move sideways.
- **Set `defaultCamera` so the view is not down the explode axis.** Looking along the
  direction parts travel collapses the whole separation into nothing. An oblique
  three-quarter angle reads best.

## Notable implementation details

- **Rounded plates** are extruded rounded-rectangle profiles, not `RoundedBoxGeometry`,
  which clamps its radius to half the smallest dimension — useless for a 0.012-thick
  sheet of cover glass needing a large in-plane corner radius. See `roundedPlate()`.
- **Bounds use real geometry bounding boxes**, not a radius approximation. A sphere
  around a 3-unit display panel claims 1.5 units of depth that a 0.012-thick plate does
  not occupy, which wrecks camera framing.
- **Open-ended and partial cylinders** (a motor can, a curved magnet) are zero-thickness
  shells, so they get `DoubleSide` automatically or they vanish when seen from inside.
- **`Outlines` with `screenspace`** treats `thickness` as a fraction of screen height.
  Values above ~0.05 engulf the viewport. We use `0.008`.
- **`repeat` only steps linearly**, which cannot place fan blades around a hub. Machine
  files are TypeScript, so `gpu.ts` just generates those `ShapeNode`s with a helper —
  the data model composes rather than needing a new primitive.
- **Nothing animates through React state.** Explode position, opacity and emissive are
  damped per-frame in `useFrame` against material and object refs.
- **No network assets.** The environment map is generated at runtime from `Lightformer`
  planes rather than fetching an HDRI, so the app works fully offline.

## Stack

three 0.187 · @react-three/fiber 9.8 · @react-three/drei 10.7 · zustand 5.1 ·
React 19.3 · Vite 8 · TypeScript

Deliberately WebGL2, not WebGPU: R3F v10 (where `WebGPURenderer` becomes the default)
has been in alpha since January 2026, drei 11 is alpha alongside it, and
`@react-three/postprocessing` is WebGL-only. This workload is lit PBR over ~100 parts,
not a compute problem.

## Known gaps

- No deep links yet — neither the machine nor the selected part is in the URL, so no
  view can be shared and the browser back button does not move between catalogue and
  viewer.
- No cross-section / cutaway control.
- No guided tour or quiz mode; the content model has room for both.
- No authoring tool. Explode vectors and camera poses are hand-tuned numbers in the data
  files, which is tolerable at two machines and will not be at twenty.
- Single ~370 kB gzip bundle. Worth code-splitting per machine before adding many more.
- The **Software** category is empty.
- Accessibility: the part list is keyboard-navigable, the 3D canvas is not.
