'use client'

import { AdaptiveDpr, ContactShadows } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as Three from 'three'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

type HeroArtifactSceneProps = {
  onReady: () => void
  onContextLost: () => void
}

function ContextMonitor({ onContextLost }: Pick<HeroArtifactSceneProps, 'onContextLost'>) {
  const { gl } = useThree()

  useEffect(() => {
    const canvas = gl.domElement
    const handleLost = (event: Event) => {
      event.preventDefault()
      onContextLost()
    }

    canvas.addEventListener('webglcontextlost', handleLost)
    return () => canvas.removeEventListener('webglcontextlost', handleLost)
  }, [gl, onContextLost])

  return null
}

function Artifact() {
  const groupRef = useRef<Three.Group>(null)
  const reducedMotion = usePrefersReducedMotion()

  useFrame((state, delta) => {
    if (!groupRef.current || reducedMotion) {
      return
    }

    const targetX = state.pointer.y * 0.12
    const targetY = state.pointer.x * 0.18 + state.clock.elapsedTime * 0.06
    groupRef.current.rotation.x = Three.MathUtils.damp(
      groupRef.current.rotation.x,
      targetX,
      3.5,
      delta,
    )
    groupRef.current.rotation.y = Three.MathUtils.damp(
      groupRef.current.rotation.y,
      targetY,
      3.5,
      delta,
    )
  })

  return (
    <group ref={groupRef} rotation={[0.12, -0.35, -0.08]} scale={0.92}>
      <mesh castShadow>
        <icosahedronGeometry args={[1.28, 1]} />
        <meshPhysicalMaterial
          color="#c9cdcb"
          clearcoat={1}
          clearcoatRoughness={0.14}
          flatShading
          metalness={0.46}
          roughness={0.24}
        />
      </mesh>

      <mesh scale={1.015}>
        <icosahedronGeometry args={[1.28, 2]} />
        <meshBasicMaterial color="#111311" opacity={0.22} transparent wireframe />
      </mesh>

      <mesh rotation={[Math.PI / 2.35, 0.2, 0.2]}>
        <torusGeometry args={[2.06, 0.075, 18, 160]} />
        <meshStandardMaterial color="#717874" metalness={0.52} roughness={0.2} />
      </mesh>

      <mesh rotation={[0.15, Math.PI / 2.1, -0.45]}>
        <torusGeometry args={[2.06, 0.045, 16, 160]} />
        <meshStandardMaterial color="#e5e8e5" metalness={0.38} roughness={0.18} />
      </mesh>

      <mesh position={[1.72, 0.24, 0.55]} rotation={[0.4, 0.2, 0.3]}>
        <boxGeometry args={[0.22, 0.22, 0.22]} />
        <meshPhysicalMaterial color="#2856d8" emissive="#142a68" emissiveIntensity={0.08} />
      </mesh>
    </group>
  )
}

export default function HeroArtifactScene({ onReady, onContextLost }: HeroArtifactSceneProps) {
  const reducedMotion = usePrefersReducedMotion()

  return (
    <Canvas
      camera={{ position: [0, 0.1, 7.4], fov: 40 }}
      dpr={[1, 1.5]}
      frameloop={reducedMotion ? 'demand' : 'always'}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0)
        onReady()
      }}
    >
      <ContextMonitor onContextLost={onContextLost} />
      <AdaptiveDpr pixelated />
      <ambientLight intensity={1.65} />
      <hemisphereLight color="#ffffff" groundColor="#4b504d" intensity={1.5} />
      <directionalLight intensity={4.2} position={[4, 5, 6]} />
      <pointLight color="#2856d8" intensity={8} position={[-3, -1, 3]} />
      <Artifact />
      <ContactShadows position={[0, -2.35, 0]} opacity={0.22} scale={7} blur={3.5} far={4.5} />
    </Canvas>
  )
}
