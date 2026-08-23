'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import ExperimentCanvas from '@/components/ExperimentCanvas'
import ExperimentFrame from '@/components/ExperimentFrame'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import GalaxyPoints from './GalaxyPoints'

function GalaxyBody() {
  const reducedMotion = usePrefersReducedMotion()
  const galaxyPoints = useMemo(() => new GalaxyPoints(), [])

  useEffect(() => {
    galaxyPoints.generate({
      count: 26000,
      radius: 7,
      branch: 4,
      spinOffset: 0.82,
      spreadPow: 4,
      innerColor: '#eff1ed',
      outerColor: '#2856d8',
    })

    // 手动创建的 Three.js 对象必须在页面离开时释放 GPU 资源。
    return () => galaxyPoints.dispose()
  }, [galaxyPoints])

  useFrame((_, delta) => {
    if (!reducedMotion) {
      galaxyPoints.rotation.y += delta * 0.035
    }
  })

  return <primitive object={galaxyPoints} rotation-x={0.16} />
}

export default function GalaxyPage() {
  return (
    <ExperimentFrame
      title="Galaxy Systems"
      description="程序化生成粒子位置，并以距离控制色彩与旋臂结构。"
      technologies={['Three.js', 'BufferGeometry', 'R3F']}
    >
      <ExperimentCanvas
        posterSrc="/works/galaxy.webp"
        posterAlt="粒子星系的实验海报"
        camera={{ position: [0, 4.6, 10.5], fov: 48, near: 0.1, far: 60 }}
      >
        <GalaxyBody />
      </ExperimentCanvas>
    </ExperimentFrame>
  )
}
