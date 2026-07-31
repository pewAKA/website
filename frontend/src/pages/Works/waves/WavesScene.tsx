import waveVertexShader from './shaders/wave/vertex.glsl?raw'
import waveFragmentShader from './shaders/wave/fragment.glsl?raw'
import * as Three from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'

export default function WavesScene() {
  const materialRef = useRef<Three.ShaderMaterial>(null)
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDepth: { value: 0.3 },
      uFrequencey: { value: 2 },
      uSpeed: { value: 2 },
      uDeepColor: { value: '#020077' },
      uSurfaceColor: { value: '#94d4ff' },
    }),
    [],
  )
  useFrame((_, delta) => {
    if (!materialRef.current) return
    materialRef.current.uniforms.uTime.value += delta
  })

  useControls({
    uDepth: {
      value: 0.3,
      min: 0,
      max: 2,
      step: 0.01,
      onChange: (val) => {
        if (!materialRef.current) return
        materialRef.current.uniforms.uDepth.value = val
      },
    },
    uFrequencey: {
      value: 2,
      min: 0,
      max: 10,
      step: 0.01,
      onChange: (val) => {
        if (!materialRef.current) return
        materialRef.current.uniforms.uFrequencey.value = val
      },
    },
    uSpeed: {
      value: 2,
      min: 0,
      max: 10,
      step: 0.01,
      onChange: (val) => {
        if (!materialRef.current) return
        materialRef.current.uniforms.uSpeed.value = val
      },
    },
  })

  return (
    <mesh rotation-x={-(Math.PI / 2)}>
      <planeGeometry args={[10, 10, 128, 128]} />
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
