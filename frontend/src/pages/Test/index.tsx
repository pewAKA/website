import { Canvas } from '@react-three/fiber'
import {
  AccumulativeShadows,
  Environment,
  GizmoHelper,
  GizmoViewport,
  MeshTransmissionMaterial,
  OrbitControls,
  RandomizedLight,
  useEnvironment,
} from '@react-three/drei'
import './index.scss'

const HDR_ENV_URL = 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/dancing_hall_1k.hdr'

function TestPage() {
  return (
    <div className="test-page">
      {/* 外层容器负责控制 Canvas 在屏幕上的尺寸和位置 */}
      <Canvas shadows className="test-canvas" camera={{ position: [5, 5, 5] }}>
        <Scene />
      </Canvas>
    </div>
  )
}

function Scene() {
  // 通过 useEnvironment 先拿到贴图实例，再同时给 Environment 和折射材质复用。
  const envMap = useEnvironment({ files: HDR_ENV_URL })

  return (
    <>
      {/* <ambientLight intensity={1} /> */}
      <pointLight position={[0, 5, 0]} intensity={80} />
      <Cube />
      <Sphere />
      <Environment map={envMap} background backgroundBlurriness={0.5} />
      <AccumulativeShadows
        temporal
        frames={100}
        alphaTest={0.9}
        color="#3ead5d"
        colorBlend={1}
        opacity={0.8}
        scale={20}
      >
        <RandomizedLight
          radius={10}
          ambient={0.5}
          intensity={Math.PI}
          position={[2.5, 8, -2.5]}
          bias={0.001}
        />
      </AccumulativeShadows>
      <OrbitControls enableDamping />
      {/* 交互式坐标系组件 */}
      <GizmoHelper
        alignment="bottom-right" // 位置可以设为 top-right, bottom-right 等
        margin={[80, 80]} // 距离画布边缘的边距
      >
        <GizmoViewport axisColors={['red', 'green', 'blue']} labelColor="white" />
      </GizmoHelper>
    </>
  )
}

function Cube() {
  return (
    <mesh position={[-5, 0, 0]}>
      <coneGeometry />
      <meshStandardMaterial color="#e2ad71" />
    </mesh>
  )
}

function Sphere() {
  return (
    <mesh position={[5, 0, 0]}>
      <torusKnotGeometry args={[2, 1, 128, 128]} />
      <MeshTransmissionMaterial thickness={0.2} ior={3} chromaticAberration={0.2} />
    </mesh>
  )
}

export default TestPage
