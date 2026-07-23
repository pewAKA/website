import { useEffect } from 'react'
import * as Three from 'three'
import GeoGroup from './GeoGroup'
import CamController from './CamController'
import Particles from './Particles'
import { useThree } from '@react-three/fiber'

export default function Scene() {
  const { scene } = useThree()

  useEffect(() => {
    scene.background = new Three.Color('#000000')
  }, [])

  return (
    <>
      <directionalLight position={[3, 3, 3]} />
      <GeoGroup />
      <Particles />
      <CamController />
    </>
  )
}
