'use client'

import { Canvas } from '@react-three/fiber'
import styles from './index.module.scss'

export default function SmokeShaderPage() {
  return (
    <div className={styles.pageContainer}>
      <Canvas className={styles.canvasContainer}>
        <mesh>
          <cylinderGeometry args={[3, 3, 5, 8]} />
          <meshBasicMaterial color={'#808080'} />
        </mesh>
      </Canvas>
    </div>
  )
}
