/**
 * The content model for HowDoesItWork.
 *
 * A Machine is a pure-data description of a device: a list of Parts, each with
 * procedural geometry, a resting position, a direction it travels when the
 * assembly is exploded, and the teaching copy that explains it.
 *
 * Nothing here imports three.js or React. Adding a new machine means writing one
 * data file — no new components, no 3D asset to source or license.
 *
 * Units are arbitrary and self-consistent per machine (a phone is ~3 units tall).
 */

export type Vec3 = [number, number, number]

/** Primitive shapes a part can be built from. Composed, these cover most hardware. */
export type GeometryDef =
  | { type: 'box'; size: Vec3; radius?: number }
  | {
      type: 'cylinder'
      radius: number
      /** Defaults to `radius`. Differing values give a cone/frustum. */
      radiusBottom?: number
      height: number
      segments?: number
      /** Omit end caps — makes a tube you can see into. */
      openEnded?: boolean
      /** Radians. Use with `thetaLength` for curved shells like motor magnets. */
      thetaStart?: number
      thetaLength?: number
    }
  | { type: 'sphere'; radius: number }
  | { type: 'torus'; radius: number; tube: number; segments?: number }

/**
 * One primitive within a part. A part is a list of these, which is how a logic
 * board gets its chips and a midframe gets its four rails without any modelling.
 */
export interface ShapeNode {
  geometry: GeometryDef
  offset?: Vec3
  /** Euler angles in radians. */
  rotation?: Vec3
  /** Overrides the part's colour for this primitive. */
  color?: string
  metalness?: number
  roughness?: number
  emissive?: string
  emissiveIntensity?: number
  opacity?: number
  /** Stamp this primitive `count` times, advancing by `step` each time. */
  repeat?: { count: number; step: Vec3 }
}

export type PartCategory =
  | 'structure'
  | 'power'
  | 'compute'
  | 'display'
  | 'imaging'
  | 'audio'
  | 'haptics'
  | 'connectivity'
  | 'thermal'
  | 'mechanical'
  | 'magnetic'
  | 'electrical'

export interface PartSpec {
  label: string
  value: string
}

export interface Part {
  id: string
  name: string
  category: PartCategory
  /**
   * Teardown depth. 0 is the first thing a repair tech removes. Drives list
   * ordering and the "peel layers" control.
   */
  layer: number
  /** Resting position in the assembled machine. */
  position: Vec3
  rotation?: Vec3
  /** Offset applied at full explode. Direction and distance are authored per part. */
  explode: Vec3
  color: string
  metalness?: number
  roughness?: number
  /** < 1 renders the part translucent even when not ghosted (glass, housings). */
  opacity?: number
  shape: ShapeNode[]
  /** One line, shown in the part list. */
  tagline: string
  /** The explanation, as paragraphs. */
  body: string[]
  specs?: PartSpec[]
  /** A plain-language comparison. The thing people actually remember. */
  analogy?: string
}

export interface Machine {
  id: string
  name: string
  tagline: string
  description: string
  /** Camera framing used on load and on "reset view". */
  defaultCamera: { position: Vec3; target: Vec3 }
  parts: Part[]
}
