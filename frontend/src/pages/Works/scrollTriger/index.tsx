import { Canvas } from '@react-three/fiber'
import styles from './index.module.scss'
import { useRef } from 'react'
import Scene from './Scene'
import { ScrollTargetContext } from './context'
import * as Three from 'three'
import { SplitText } from 'gsap/all'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

export default function TestScene() {
  const line1Ref = useRef<HTMLDivElement | null>(null)
  const line2Ref = useRef<HTMLDivElement | null>(null)
  const line3Ref = useRef<HTMLDivElement | null>(null)

  const pageContainerRef = useRef<HTMLDivElement | null>(null)
  const geoGroupRef = useRef<Three.Group | null>(null)

  useGSAP(() => {
    if (!line1Ref.current) return
    const line1Split = SplitText.create(line1Ref.current, {
      type: 'chars',
    })
    gsap.from(line1Split.chars.reverse(), {
      x: -100,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power1.inOut',
    })
  })

  return (
    <ScrollTargetContext.Provider value={{ pageContainerRef, geoGroupRef }}>
      {/* 页面 */}
      <div className={styles.pageContainer} ref={pageContainerRef}>
        <div className={styles.segmentCard}>
          <div className={`${styles.text} ${styles.text1}`} ref={line1Ref}>
            Welcome
          </div>
        </div>
        <div className={styles.segmentCard}>
          <div className={`${styles.text} ${styles.text2}`} ref={line2Ref}>
            Lynco Hub
          </div>
        </div>
        <div className={styles.segmentCard}>
          <div className={`${styles.text} ${styles.text3}`} ref={line3Ref}>
            Just Do It
          </div>
        </div>
      </div>

      {/* 场景 */}
      <div className={styles.sceneContainer}>
        <Canvas className={styles.sceneCanvas}>
          <Scene />
        </Canvas>
      </div>
    </ScrollTargetContext.Provider>
  )
}
