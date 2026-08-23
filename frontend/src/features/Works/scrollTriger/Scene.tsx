import { Sparkles } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as Three from 'three'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

export default function Scene({ activeIndex }: { activeIndex: number }) {
  const groupRef = useRef<Three.Group>(null)
  const reducedMotion = usePrefersReducedMotion()

  useFrame((_, delta) => {
    if (!groupRef.current) {
      return
    }

    const targetY = activeIndex * 6
    groupRef.current.position.y = reducedMotion
      ? targetY
      : Three.MathUtils.damp(groupRef.current.position.y, targetY, 5, delta)

    if (!reducedMotion) {
      groupRef.current.rotation.y = Three.MathUtils.damp(
        groupRef.current.rotation.y,
        activeIndex * 0.42,
        4,
        delta,
      )
      groupRef.current.rotation.z = Three.MathUtils.damp(
        groupRef.current.rotation.z,
        activeIndex * 0.08,
        4,
        delta,
      )
    }
  })

  return (
    <>
      <ambientLight intensity={0.95} />
      <directionalLight intensity={4.2} position={[4, 5, 7]} />
      <pointLight color="#2856d8" intensity={26} position={[-3, -2, 4]} />

      <group ref={groupRef}>
        <mesh position={[0.8, 0, 0]} rotation={[0.35, 0.2, -0.2]}>
          <torusGeometry args={[1.35, 0.32, 32, 128]} />
          <meshStandardMaterial color="#c7cbc8" metalness={0.88} roughness={0.2} />
        </mesh>

        <mesh position={[-0.65, -6, 0]} rotation={[0.25, -0.45, 0.1]}>
          <icosahedronGeometry args={[1.55, 1]} />
          <meshPhysicalMaterial color="#cdd1ce" clearcoat={1} metalness={0.74} roughness={0.2} />
        </mesh>

        <mesh position={[0.45, -12, 0]} rotation={[0.1, 0.2, -0.35]}>
          <coneGeometry args={[1.4, 3.4, 32]} />
          <meshPhysicalMaterial color="#2856d8" metalness={0.62} roughness={0.22} />
        </mesh>
      </group>

      <Sparkles
        color="#aebce9"
        count={90}
        scale={[9, 18, 5]}
        size={1.4}
        speed={reducedMotion ? 0 : 0.18}
      />
    </>
  )
}
