import { Suspense, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, ContactShadows, Environment, Lightformer, PerformanceMonitor } from '@react-three/drei'
import { useState } from 'react'
import type { Machine } from '../content/types'
import { useApp } from '../store'
import { MachineModel } from './MachineModel'
import { CameraRig } from './CameraRig'

function Lights() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 7, 6]} intensity={2.1} />
      <directionalLight position={[-6, 2, -5]} intensity={0.8} color="#7aa6ff" />
      <directionalLight position={[0, -4, 3]} intensity={0.35} color="#ffb37a" />
      {/*
        A procedural environment map: generated from these emissive planes at
        runtime rather than fetched, so metals get real reflections with no
        HDRI download and no network dependency.
      */}
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} position={[0, 4, 3]} scale={[8, 4, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={1.6} position={[-5, 1, 2]} scale={[4, 6, 1]} color="#8fb5ff" />
        <Lightformer form="rect" intensity={1.2} position={[5, -1, 1]} scale={[4, 6, 1]} color="#ffd9a8" />
        <Lightformer form="ring" intensity={1.4} position={[0, 0, -6]} scale={6} color="#ffffff" />
      </Environment>
    </>
  )
}

export function Viewer({ machine }: { machine: Machine }) {
  const select = useApp((s) => s.select)
  const hoveredPartId = useApp((s) => s.hoveredPartId)
  const explode = useApp((s) => s.explode)
  const resetNonce = useApp((s) => s.resetNonce)
  const selectedPartId = useApp((s) => s.selectedPartId)
  const [degraded, setDegraded] = useState(false)

  const selectedPart = machine.parts.find((p) => p.id === selectedPartId)

  // Pointer feedback: parts are clickable, so say so.
  useEffect(() => {
    document.body.style.cursor = hoveredPartId ? 'pointer' : 'auto'
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [hoveredPartId])

  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false }}
      camera={{ position: machine.defaultCamera.position, fov: 38, near: 0.05, far: 100 }}
      onPointerMissed={() => select(null)}
    >
      <color attach="background" args={['#0a0c10']} />

      <PerformanceMonitor onDecline={() => setDegraded(true)} />

      <Suspense fallback={null}>
        <Lights />
        <group key={machine.id}>
          <MachineModel machine={machine} />
        </group>
        {!degraded && (
          <ContactShadows
            position={[0, -2.1, 0]}
            opacity={0.45}
            scale={14}
            blur={2.6}
            far={5}
            resolution={512}
            color="#000000"
          />
        )}
      </Suspense>

      <CameraRig machine={machine} selectedPart={selectedPart} explode={explode} resetNonce={resetNonce} />
      <AdaptiveDpr pixelated />
    </Canvas>
  )
}
