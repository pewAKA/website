'use client'

import ExperimentCanvas from '@/components/ExperimentCanvas'
import ExperimentFrame from '@/components/ExperimentFrame'
import WavesScene from './WavesScene'

export default function WavesPage() {
  return (
    <ExperimentFrame
      title="Wave Shader"
      description="顶点位移负责塑造波面，片元颜色负责表现深度与光感。"
      technologies={['GLSL', 'ShaderMaterial', 'R3F']}
    >
      <ExperimentCanvas
        posterSrc="/works/waves.webp"
        posterAlt="金属数字波面的实验海报"
        camera={{ position: [0, 3.7, 6.4], fov: 44, near: 0.1, far: 40 }}
      >
        <WavesScene />
      </ExperimentCanvas>
    </ExperimentFrame>
  )
}
