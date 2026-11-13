import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Html, Outlines } from '@react-three/drei'
import { easing } from 'maath'
import type { ThreeEvent } from '@react-three/fiber'
import type { Part } from '../content/types'
import { CATEGORY_META } from '../content/categories'
import { expandNode, getGeometry, partPosition } from './geometry'

const GHOST_OPACITY = 0.06

interface MaterialEntry {
  material: THREE.MeshStandardMaterial
  baseOpacity: number
  baseEmissiveIntensity: number
  /** Parts with their own emissive colour (a lit screen) keep it when highlighted. */
  ownsEmissive: boolean
}

interface Props {
  part: Part
  explode: number
  selected: boolean
  hovered: boolean
  dimmed: boolean
  labelled: boolean
  onSelect: (id: string) => void
  onHover: (id: string | null) => void
}

export function PartObject({ part, explode, selected, hovered, dimmed, labelled, onSelect, onHover }: Props) {
  const group = useRef<THREE.Group>(null)
  const accent = CATEGORY_META[part.category].color

  // One material per ShapeNode, shared by all of that node's repeats.
  const entries = useMemo<MaterialEntry[]>(() => {
    return part.shape.map((node) => {
      const baseOpacity = node.opacity ?? part.opacity ?? 1
      const ownsEmissive = Boolean(node.emissive)
      const baseEmissiveIntensity = node.emissiveIntensity ?? 0

      // Open-ended or partial cylinders are zero-thickness shells — a motor can,
      // a curved magnet. Backface culling would make them vanish from inside.
      const geo = node.geometry
      const isShell =
        geo.type === 'cylinder' &&
        (geo.openEnded === true || (geo.thetaLength !== undefined && geo.thetaLength < Math.PI * 2 - 1e-6))

      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(node.color ?? part.color),
        metalness: node.metalness ?? part.metalness ?? 0.3,
        roughness: node.roughness ?? part.roughness ?? 0.5,
        emissive: new THREE.Color(node.emissive ?? '#000000'),
        emissiveIntensity: baseEmissiveIntensity,
        transparent: baseOpacity < 1,
        opacity: baseOpacity,
        depthWrite: baseOpacity >= 1,
        side: isShell ? THREE.DoubleSide : THREE.FrontSide,
      })
      return { material, baseOpacity, baseEmissiveIntensity, ownsEmissive }
    })
  }, [part])

  const target = useMemo(() => new THREE.Vector3(), [])
  const highlight = useMemo(() => new THREE.Color(accent), [accent])
  const black = useMemo(() => new THREE.Color('#000000'), [])

  useFrame((_, dt) => {
    if (!group.current) return

    const [x, y, z] = partPosition(part, explode)
    target.set(x, y, z)
    easing.damp3(group.current.position, target, 0.22, dt)

    // A selected part lifts very slightly toward the viewer so its outline reads
    // cleanly against whatever is behind it.
    const scale = selected ? 1.012 : 1
    easing.damp3(group.current.scale, [scale, scale, scale], 0.2, dt)

    // Kept subtle: the outline carries the selection signal, this just lifts the
    // part off the background. Higher values recolour the part instead.
    // A selected part already reads via its outline and the ghosted surroundings,
    // so it needs almost no emissive. Hover has no outline, so it gets more.
    const boost = selected ? 0.05 : hovered ? 0.15 : 0
    const opacityTarget = dimmed ? GHOST_OPACITY : 1

    for (const entry of entries) {
      const { material, baseOpacity, baseEmissiveIntensity, ownsEmissive } = entry

      easing.damp(material, 'opacity', baseOpacity * opacityTarget, 0.22, dt)
      easing.damp(material, 'emissiveIntensity', baseEmissiveIntensity + boost, 0.18, dt)

      if (!ownsEmissive) {
        easing.dampC(material.emissive, boost > 0 ? highlight : black, 0.18, dt)
      }

      // Only pay for alpha blending while the material is actually translucent.
      const translucent = material.opacity < 0.995
      if (material.transparent !== translucent) {
        material.transparent = translucent
        material.depthWrite = !translucent
        material.needsUpdate = true
      }
    }
  })

  const handleOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    onHover(part.id)
  }
  const handleOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    onHover(null)
  }
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    onSelect(part.id)
  }

  return (
    <group
      ref={group}
      rotation={part.rotation}
      onPointerOver={handleOver}
      onPointerOut={handleOut}
      onClick={handleClick}
    >
      {part.shape.map((node, nodeIndex) =>
        expandNode(node).map((offset, repeatIndex) => (
          <mesh
            key={`${nodeIndex}-${repeatIndex}`}
            geometry={getGeometry(node.geometry)}
            material={entries[nodeIndex].material}
            position={offset}
            rotation={node.rotation}
            castShadow
            receiveShadow
          >
            {/* `screenspace` makes thickness a fraction of screen height, so this
                stays ~a few pixels at any distance. Values above ~0.05 engulf the view. */}
            {selected && <Outlines thickness={0.008} color={accent} screenspace transparent opacity={0.95} />}
          </mesh>
        )),
      )}

      {labelled && (
        <Html center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
          <div className="part-label" style={{ borderColor: accent }}>
            <span className="part-label__dot" style={{ background: accent }} />
            {part.name}
          </div>
        </Html>
      )}
    </group>
  )
}
