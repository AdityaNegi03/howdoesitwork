# HowDoesItWork

Take machines apart in 3D. Pick a machine, open it up, pull out any component, and
read what it actually does.

Two machines ship today: a generic **smartphone** (16 parts, a flat layer stack) and a
generic **brushed DC motor** (9 parts, a rotational/axial assembly).

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
    types.ts        # the content model — no three.js, no React
    categories.ts   # category labels + colours
    smartphone.ts   # one machine = one data file
    dc-motor.ts
    index.ts        # machine registry
  scene/
    geometry.ts     # geometry construction, caching, bounds
    PartObject.tsx  # one part: primitives, hover/select, explode damping
    MachineModel.tsx
    CameraRig.tsx   # framing, focus-on-part, follow-while-exploding
    Viewer.tsx      # Canvas, lighting, environment
  ui/
    PartList.tsx    # left panel, teardown order
    InfoPanel.tsx   # right panel, the explanation
    Toolbar.tsx     # explode / isolate / labels / reset
  store.ts          # zustand app state
```

## Adding a machine

Copy `src/content/dc-motor.ts`, then register it:

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

- No deep links yet — selecting a part does not change the URL, so a view can't be shared.
- No cross-section / cutaway control.
- No guided tour or quiz mode; the content model has room for both.
- No authoring tool. Explode vectors and camera poses are hand-tuned numbers in the data
  files, which is tolerable at two machines and will not be at twenty.
- Single ~365 kB gzip bundle. Worth code-splitting per machine before adding many more.
- Accessibility: the part list is keyboard-navigable, the 3D canvas is not.
