import { useEffect } from 'react'
import * as Three from 'three'
import GeoGroup from './GeoGroup'
import CamController from './CamController'
import Particles from './Particles'
import { useThree } from '@react-three/fiber'

export default function Scene() {
  const { scene } = useThree()

  useEffect(() => {
    const previousBackground = scene.background
    scene.background = new Three.Color('#000000')
    return () => {
      scene.background = previousBackground
    }
  }, [scene])

  return (
    <>
      <directionalLight position={[3, 3, 3]} />
      <GeoGroup />
      <Particles />
      <CamController />
    </>
  )
}
