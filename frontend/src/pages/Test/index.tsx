import { Canvas, useLoader, useThree } from '@react-three/fiber'
import { GizmoHelper, GizmoViewport, OrbitControls } from '@react-three/drei'
import { Suspense, useEffect } from 'react'
import { EquirectangularReflectionMapping } from 'three'
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js'
import './index.scss'

const HDR_ENV_URL = 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/dancing_hall_1k.hdr'

function TestPage() {
  return (
    <div className="test-page">
      <Canvas shadows className="test-canvas" camera={{ position: [5, 5, 5] }}>
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

  // 2. 使用 R3F 的 useLoader 结合 Three.js 的 HDRLoader 加载 HDR
  const texture = useLoader(HDRLoader, HDR_ENV_URL)

  // 3. 使用 useEffect 在贴图加载完成后应用到场景中
  useEffect(() => {
    if (texture) {
      // 必须设置等距圆柱投影映射，否则 HDR 贴图会显示异常/变形
      texture.mapping = EquirectangularReflectionMapping

      // 赋值给场景背景和环境光照
      scene.background = texture
      scene.environment = texture

      // 设置背景模糊度（Three.js 原生属性）
      scene.backgroundBlurriness = 0.5
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
      <ambientLight intensity={0.5} />
      <pointLight
        castShadow
        position={[4, 6, 3]}
        intensity={80}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
      <Cube />
      <Ground />
      <OrbitControls enableDamping />
      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport axisColors={['red', 'green', 'blue']} labelColor="white" />
      </GizmoHelper>
    </>
  )
}

function Cube() {
  return (
    <mesh castShadow position={[0, 0, 0]}>
      <boxGeometry args={[5, 5, 5]} />
      <meshStandardMaterial color="#e2ad71" />
    </mesh>
  )
}

function Ground() {
  return (
    <mesh receiveShadow rotation-x={-Math.PI / 2} position={[0, -2.5, 0]}>
      <planeGeometry args={[16, 16]} />
      <meshStandardMaterial color={'#f1f1f1'} />
    </mesh>
  )
}

export default TestPage
