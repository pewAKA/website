import { useEffect, useMemo } from 'react'
import MeshObject from './MeshObject'
import { useFrame } from '@react-three/fiber'

interface CustomMeshProps {
  position?: [number, number, number]
}

function CustomMesh({ position }: CustomMeshProps) {
  const meshObject = useMemo(() => new MeshObject(), [])

  //设置初始位置
  useEffect(() => {
    meshObject.setPosition(position)
  }, [position])

  //   定义动画
  useFrame((state, delta) => {
    meshObject.mesh.rotation.y += Math.PI * delta
    meshObject.mesh.position.y = Math.sin((Math.PI / 2) * state.clock.elapsedTime) + 4
  })

  //清理内存
  useEffect(() => {
    return () => {
      meshObject.dispose()
    }
  }, [meshObject])
  return <primitive object={meshObject.mesh} />
}

export default CustomMesh
