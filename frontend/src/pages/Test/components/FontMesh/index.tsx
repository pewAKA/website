import { Text3D } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import * as Three from 'three'
import type { TextGeometry } from 'three/examples/jsm/Addons.js'

export default function FontMesh() {
  const textRef = useRef<Three.Mesh<TextGeometry, Three.Material>>(null)
  //初始化位置
  useEffect(() => {
    if (!textRef.current) return
    textRef.current.geometry.computeBoundingBox()
    const textBoundingBox = textRef.current.geometry.boundingBox
    const xPos = -(textBoundingBox!.max.x - textBoundingBox!.min.x) / 2

    textRef.current.position.set(xPos, 1, 3)
  }, [])

  return (
    <Text3D
      receiveShadow
      castShadow
      ref={textRef}
      font={'/src/assets/threejs/fonts/GEORGIA.json'}
      size={1}
      curveSegments={2}
      bevelEnabled
      bevelThickness={0.01}
      bevelSize={0.01}
      bevelSegments={3}
    >
      Lynco Hub
      <meshStandardMaterial color={'#9d93ad'} metalness={1} roughness={0} />
    </Text3D>
  )
}
