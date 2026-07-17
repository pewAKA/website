import { Canvas, useThree } from '@react-three/fiber'
import { GizmoHelper, GizmoViewport, OrbitControls } from '@react-three/drei'
import { Suspense, useEffect } from 'react'
import { useSceneEnvironment } from '@/three/assets'
import CustomMesh from './components/CustomMesh'
import './index.scss'
import BufferMesh from './components/BufferMesh'
import GroundMesh from './components/GroundMesh'
import FontMesh from './components/FontMesh'
import MatCapMesh from './components/MatCapMesh'

function TestPage() {
  return (
    <div className="test-page">
      <Canvas shadows className="test-canvas" camera={{ position: [5, 5, 5], near: 0.1, far: 100 }}>
        {/* useLoader 内部会触发 Promise，需要用 Suspense 包裹以等待资源加载 */}
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}

function Scene() {
  // 1. 获取当前 Three.js 的 scene 对象
  const { scene } = useThree()
  const texture = useSceneEnvironment('test.environment.historic-cloister')

  // 3. 使用 useEffect 在贴图加载完成后应用到场景中
  useEffect(() => {
    if (texture) {
      // 赋值给场景背景和环境光照
      scene.background = texture
      scene.environment = texture

      // 设置背景模糊度（Three.js 原生属性）
      scene.backgroundBlurriness = 0

      scene.environmentIntensity = 0.3
    }

    // 4. 组件卸载时的清理工作，避免内存泄漏或污染其他场景
    return () => {
      scene.background = null
      scene.environment = null
      scene.backgroundBlurriness = 0
    }
  }, [texture, scene])

  return (
    <>
      <directionalLight castShadow position={[5, 5, 5]} />
      {/* <pointLight castShadow position={[4, 6, 3]} intensity={80} /> */}

      <GroundMesh />
      <Cube />
      <CustomMesh position={[0, 4, 0]} />
      <BufferMesh />
      <FontMesh />
      <MatCapMesh />

      <OrbitControls enableDamping />
      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport axisColors={['red', 'green', 'blue']} labelColor="white" />
      </GizmoHelper>
    </>
  )
}

function Cube() {
  return (
    <mesh receiveShadow castShadow position={[0, 0, 0]}>
      <boxGeometry args={[5, 5, 5, 10, 10, 10]} />
      <meshStandardMaterial color="#797979" metalness={0.1} roughness={0.5} />
    </mesh>
  )
}

export default TestPage
