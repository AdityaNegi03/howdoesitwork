import * as THREE from 'three'
import type { GeometryDef, Machine, Part, ShapeNode, Vec3 } from '../content/types'

/**
 * Turns the content model's geometry descriptions into real BufferGeometries.
 *
 * Geometries are cached by their definition, so the 60-odd screws in a teardown
 * share one geometry object rather than allocating one each.
 */
const cache = new Map<string, THREE.BufferGeometry>()

/**
 * A box with rounded corners in the XY plane and softened front/back edges.
 * Built by extruding a rounded-rectangle profile, because RoundedBoxGeometry
 * clamps its radius to half the smallest dimension — useless for thin plates
 * like a sheet of cover glass that need a large in-plane corner radius.
 */
function roundedPlate(w: number, h: number, d: number, r: number): THREE.BufferGeometry {
  const radius = Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4)
  const shape = new THREE.Shape()
  const x = w / 2 - radius
  const y = h / 2 - radius

  shape.absarc(x, y, radius, 0, Math.PI / 2, false)
  shape.absarc(-x, y, radius, Math.PI / 2, Math.PI, false)
  shape.absarc(-x, -y, radius, Math.PI, Math.PI * 1.5, false)
  shape.absarc(x, -y, radius, Math.PI * 1.5, Math.PI * 2, false)
  shape.closePath()

  // Keep the bevel small enough that the plate never loses its nominal depth.
  const bevel = Math.min(d * 0.2, radius * 0.5)
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(d - bevel * 2, 1e-4),
    bevelEnabled: bevel > 1e-5,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    curveSegments: 10,
  })
  geo.center()
  return geo
}

function build(def: GeometryDef): THREE.BufferGeometry {
  switch (def.type) {
    case 'box':
      return def.radius && def.radius > 0
        ? roundedPlate(def.size[0], def.size[1], def.size[2], def.radius)
        : new THREE.BoxGeometry(def.size[0], def.size[1], def.size[2])

    case 'cylinder':
      return new THREE.CylinderGeometry(
        def.radius,
        def.radiusBottom ?? def.radius,
        def.height,
        def.segments ?? 24,
        1,
        def.openEnded ?? false,
        def.thetaStart ?? 0,
        def.thetaLength ?? Math.PI * 2,
      )

    case 'sphere':
      return new THREE.SphereGeometry(def.radius, 32, 16)

    case 'torus':
      return new THREE.TorusGeometry(def.radius, def.tube, 12, def.segments ?? 32)
  }
}

export function getGeometry(def: GeometryDef): THREE.BufferGeometry {
  const key = JSON.stringify(def)
  let geo = cache.get(key)
  if (!geo) {
    geo = build(def)
    cache.set(key, geo)
  }
  return geo
}

/** Every instance a ShapeNode expands to, accounting for `repeat`. */
export function expandNode(node: ShapeNode): Vec3[] {
  const base = node.offset ?? [0, 0, 0]
  if (!node.repeat) return [base]
  const { count, step } = node.repeat
  return Array.from({ length: count }, (_, i): Vec3 => [
    base[0] + step[0] * i,
    base[1] + step[1] * i,
    base[2] + step[2] * i,
  ])
}

// Keyed on the part object, not its id — ids are only unique within a machine.
const boxCache = new WeakMap<Part, THREE.Box3>()
const _euler = new THREE.Euler()
const _matrix = new THREE.Matrix4()

/**
 * Exact axis-aligned bounds of a part in its own local space.
 *
 * Uses the real geometry bounding boxes rather than a radius approximation —
 * a sphere around a 3-unit-tall display panel would claim 1.5 units of depth
 * that a 0.016-thick plate does not occupy, which wrecks camera framing.
 */
export function partLocalBox(part: Part): THREE.Box3 {
  const cached = boxCache.get(part)
  if (cached) return cached

  const box = new THREE.Box3().makeEmpty()
  const partRotation = part.rotation ?? [0, 0, 0]

  for (const node of part.shape) {
    const geo = getGeometry(node.geometry)
    if (!geo.boundingBox) geo.computeBoundingBox()
    const base = geo.boundingBox
    if (!base) continue

    const rot = node.rotation ?? [0, 0, 0]
    for (const offset of expandNode(node)) {
      _euler.set(rot[0], rot[1], rot[2])
      _matrix.makeRotationFromEuler(_euler)
      _matrix.setPosition(offset[0], offset[1], offset[2])
      box.union(base.clone().applyMatrix4(_matrix))
    }
  }

  if (box.isEmpty()) {
    box.set(new THREE.Vector3(-0.05, -0.05, -0.05), new THREE.Vector3(0.05, 0.05, 0.05))
  }

  // Fold in the part's own rotation, so rotated assemblies still frame correctly.
  if (partRotation[0] || partRotation[1] || partRotation[2]) {
    _euler.set(partRotation[0], partRotation[1], partRotation[2])
    _matrix.makeRotationFromEuler(_euler)
    _matrix.setPosition(0, 0, 0)
    box.applyMatrix4(_matrix)
  }

  boxCache.set(part, box)
  return box
}

const _sphere = new THREE.Sphere()

/** Radius used to decide how far the camera pulls back when focusing a part. */
export function partRadius(part: Part): number {
  partLocalBox(part).getBoundingSphere(_sphere)
  return Math.max(_sphere.radius, 0.08)
}

/** Where a part sits for a given explode amount. */
export function partPosition(part: Part, explode: number): Vec3 {
  return [
    part.position[0] + part.explode[0] * explode,
    part.position[1] + part.explode[1] * explode,
    part.position[2] + part.explode[2] * explode,
  ]
}

/**
 * Bounding sphere of the whole machine at a given explode amount, so the camera
 * can pull back as the assembly opens and keep everything in frame.
 */
export function machineBounds(machine: Machine, explode: number): { center: Vec3; radius: number } {
  const total = new THREE.Box3().makeEmpty()
  const translated = new THREE.Box3()

  for (const part of machine.parts) {
    const [px, py, pz] = partPosition(part, explode)
    const local = partLocalBox(part)
    translated.copy(local)
    translated.min.add(new THREE.Vector3(px, py, pz))
    translated.max.add(new THREE.Vector3(px, py, pz))
    total.union(translated)
  }

  const center = total.getCenter(new THREE.Vector3())
  const size = total.getSize(new THREE.Vector3())
  const radius = Math.max(0.4, Math.hypot(size.x, size.y, size.z) / 2)

  return { center: [center.x, center.y, center.z], radius }
}
