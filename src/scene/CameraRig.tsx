import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { CameraControls } from '@react-three/drei'
import type CameraControlsImpl from 'camera-controls'
import type { Machine, Part } from '../content/types'
import { machineBounds, partPosition, partRadius } from './geometry'

interface Props {
  machine: Machine
  selectedPart: Part | undefined
  explode: number
  resetNonce: number
}

/**
 * Owns the camera.
 *
 * With nothing selected the whole machine stays framed, so opening the assembly
 * pulls the camera back instead of letting parts fly off screen. Selecting a part
 * frames just that part, keeping the user's current viewing angle. Reset restores
 * the machine's authored angle.
 */
export function CameraRig({ machine, selectedPart, explode, resetNonce }: Props) {
  const controls = useRef<CameraControlsImpl>(null)
  const selectedId = selectedPart?.id

  // Restores the viewing *angle*. The framing effect below then sets distance,
  // and fitToSphere preserves whatever angle this left behind.
  useEffect(() => {
    const c = controls.current
    if (!c) return
    const [px, py, pz] = machine.defaultCamera.position
    const [tx, ty, tz] = machine.defaultCamera.target
    c.setLookAt(px, py, pz, tx, ty, tz, true)
  }, [machine, resetNonce])

  useEffect(() => {
    const c = controls.current
    if (!c) return

    if (selectedPart) {
      const [x, y, z] = partPosition(selectedPart, explode)
      const sphere = new THREE.Sphere(new THREE.Vector3(x, y, z), partRadius(selectedPart) * 1.6)
      c.fitToSphere(sphere, true)
      return
    }

    const { center, radius } = machineBounds(machine, explode)
    const sphere = new THREE.Sphere(new THREE.Vector3(center[0], center[1], center[2]), radius * 1.05)
    c.fitToSphere(sphere, true)
  }, [machine, selectedPart, selectedId, explode, resetNonce])

  return (
    <CameraControls
      ref={controls}
      makeDefault
      smoothTime={0.3}
      minDistance={0.6}
      maxDistance={40}
      dollyToCursor
    />
  )
}
