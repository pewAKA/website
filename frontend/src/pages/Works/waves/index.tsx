import { Canvas } from '@react-three/fiber'
import WavesScene from './WavesScene'
import { GizmoHelper, GizmoViewport, OrbitControls } from '@react-three/drei'

import styles from './index.module.scss'

export default function WavesPage() {
  return (
    <div className={styles.pageContainer}>
      <Canvas className={styles.pageCanvas} camera={{ position: [5, 5, 5] }}>
        <directionalLight />
        <WavesScene />
        <OrbitControls enableDamping />
        <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
          <GizmoViewport axisColors={['red', 'green', 'blue']} labelColor="white" />
        </GizmoHelper>
      </Canvas>
    </div>
  )
}
