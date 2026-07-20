import { Canvas } from '@react-three/fiber'
import { GizmoHelper, GizmoViewport, OrbitControls } from '@react-three/drei'
import './index.scss'
import { useEffect, useMemo } from 'react'
import { useControls } from 'leva'
import GalaxyPoints from './GalaxyPoints'

export default function GalaxyScene() {
  return (
    <section className="galaxy-page">
      <Canvas className="galaxy-canvas" camera={{ position: [5, 5, 5], near: 0.1, far: 100 }}>
        <Scene />
      </Canvas>
    </section>
  )
}

function Scene() {
  return (
    <>
      <GalaxyBody />

      <OrbitControls enableDamping />
      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport axisColors={['red', 'green', 'blue']} labelColor="white" />
      </GizmoHelper>
    </>
  )
}

function GalaxyBody() {
  const { count, radius, branch, spinOffset, spreadPow, innerColor, outterColor } = useControls({
    count: {
      label: '恒星数量',
      value: 30000,
      min: 100,
      max: 100000,
      step: 1,
    },
    radius: {
      label: '星系半径',
      value: 15,
      min: 5,
      max: 50,
      step: 0.01,
    },
    branch: {
      label: '旋臂数量',
      value: 3,
      min: 1,
      max: 15,
      step: 1,
    },
    spinOffset: {
      label: '旋转偏移',
      value: 1,
      min: -5,
      max: 5,
      step: 0.1,
    },
    spreadPow: {
      label: '散布指数',
      value: 5,
      min: 1,
      max: 10,
      step: 1,
    },
    innerColor: {
      label: '内部颜色',
      value: '#eb6666',
    },
    outterColor: {
      label: '外部颜色',
      value: '#4949ef',
    },
  })

  const galaxyPoints = useMemo(() => new GalaxyPoints(), [])

  //清理内存
  useEffect(() => {
    return () => {
      galaxyPoints.dispose()
    }
  }, [])

  //构建
  useEffect(() => {
    galaxyPoints.generate({
      count,
      radius,
      branch,
      spinOffset,
      spreadPow,
      innerColor,
      outterColor,
    })
  }, [count, radius, branch, spinOffset, spreadPow, innerColor, outterColor])

  return <primitive object={galaxyPoints} />
}
