import waveVertexShader from './shaders/wave/vertex.glsl'
import waveFragmentShader from './shaders/wave/fragment.glsl'
import * as Three from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

export default function WavesScene() {
  const materialRef = useRef<Three.ShaderMaterial>(null)
  const reducedMotion = usePrefersReducedMotion()
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDepth: { value: 0.72 },
      uFrequency: { value: 0.62 },
      uSpeed: { value: 0.55 },
      uDeepColor: { value: new Three.Color('#07101e') },
      uSurfaceColor: { value: new Three.Color('#7f9bf2') },
    }),
    [],
  )

  useFrame((_, delta) => {
    if (!materialRef.current || reducedMotion) return
    materialRef.current.uniforms.uTime.value += delta
  })

  return (
    <mesh position={[0, -0.8, 0]} rotation-x={-(Math.PI / 2)}>
      <planeGeometry args={[13, 13, 256, 256]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={waveVertexShader}
        fragmentShader={waveFragmentShader}
        uniforms={uniforms}
        side={Three.DoubleSide}
      />
    </mesh>
  )
}
