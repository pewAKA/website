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
      uDepth: { value: 2 },
      uFrequencey: { value: 0.3 },
      uSpeed: { value: 0 },
      uDeepColor: { value: new Three.Color('#00049d') },
      uSurfaceColor: { value: new Three.Color('#94d4ff') },
    }),
    [],
  )
  useFrame((_, delta) => {
    if (!materialRef.current) return
    materialRef.current.uniforms.uTime.value += delta
  })

  useControls({
    uDepth: {
      value: 2,
      min: 0,
      max: 10,
      step: 0.01,
      onChange: (val) => {
        if (!materialRef.current) return
        materialRef.current.uniforms.uDepth.value = val
      },
    },
    uFrequencey: {
      value: 0.3,
      min: 0,
      max: 10,
      step: 0.01,
      onChange: (val) => {
        if (!materialRef.current) return
        materialRef.current.uniforms.uFrequencey.value = val
      },
    },
    uSpeed: {
      value: 0,
      min: 0,
      max: 10,
      step: 0.01,
      onChange: (val) => {
        if (!materialRef.current) return
        materialRef.current.uniforms.uSpeed.value = val
      },
    },
    uDeepColor: {
      value: '#00049d',
      onChange: (val) => {
        if (!materialRef.current) return
        materialRef.current.uniforms.uDeepColor.value = new Three.Color(val)
      },
    },
    uSurfaceColor: {
      value: '#94d4ff',
      onChange: (val) => {
        if (!materialRef.current) return
        materialRef.current.uniforms.uSurfaceColor.value = new Three.Color(val)
      },
    },
  })

  return (
    <mesh rotation-x={-(Math.PI / 2)}>
      <planeGeometry args={[20, 20, 1024, 1024]} />
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
