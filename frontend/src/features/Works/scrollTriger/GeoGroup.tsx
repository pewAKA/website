import { useGSAP } from '@gsap/react'
import { useContext, useRef } from 'react'
import * as Three from 'three'
import gsap from 'gsap'
import { ScrollTargetContext } from './context'

export default function GeoGroup() {
  const scrolltargetContext = useContext(ScrollTargetContext)
  return (
    <group ref={scrolltargetContext?.geoGroupRef} position={[0, 0, 0]}>
      <RotatingTorus />
      <SphereGeometry />
      <ConeGeometry />
    </group>
  )
}

function RotatingTorus() {
  const torusRef = useRef<Three.Mesh | null>(null)
  const scrolltargetContext = useContext(ScrollTargetContext)

  useGSAP(() => {
    if (!torusRef.current) return
    const pageContainerRef = scrolltargetContext?.pageContainerRef
    if (!pageContainerRef?.current) return
    gsap.to(torusRef.current?.rotation, {
      y: Math.PI,
      x: Math.PI * 2,
      scrollTrigger: {
        trigger: pageContainerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
      },
    })
  })

  return (
    <mesh ref={torusRef} position={[3, 0, 0]}>
      <torusGeometry args={[1, 0.5]} />
      <meshToonMaterial color={'#7cffbe'} />
    </mesh>
  )
}

function SphereGeometry() {
  const geoRef = useRef<Three.Mesh | null>(null)
  const scrolltargetContext = useContext(ScrollTargetContext)

  useGSAP(() => {
    if (!geoRef.current) return
    const pageContainerRef = scrolltargetContext?.pageContainerRef
    if (!pageContainerRef?.current) return
    gsap.to(geoRef.current?.rotation, {
      y: Math.PI,
      x: Math.PI * 2,
      scrollTrigger: {
        trigger: pageContainerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
      },
    })
  })

  return (
    <mesh ref={geoRef} position={[-3, -10, 0]}>
      <sphereGeometry args={[2, 2, 2]} />
      <meshToonMaterial color={'rgb(227, 255, 103)'} />
    </mesh>
  )
}

function ConeGeometry() {
  const geoRef = useRef<Three.Mesh | null>(null)
  const scrolltargetContext = useContext(ScrollTargetContext)

  useGSAP(() => {
    if (!geoRef.current) return
    const pageContainerRef = scrolltargetContext?.pageContainerRef
    if (!pageContainerRef?.current) return
    gsap.to(geoRef.current?.rotation, {
      x: Math.PI,
      z: Math.PI * 2,
      scrollTrigger: {
        trigger: pageContainerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
      },
    })
  })

  return (
    <mesh ref={geoRef} position={[3, -20, 0]}>
      <coneGeometry args={[1, 3]} />
      <meshToonMaterial color={'rgb(128, 99, 255)'} />
    </mesh>
  )
}
