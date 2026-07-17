import { useEffect, useMemo } from 'react'
import MeshObject from './MeshObject'
// import { useFrame } from '@react-three/fiber'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { folder, useControls } from 'leva'

interface CustomMeshProps {
  position?: [number, number, number]
}

function CustomMesh({ position }: CustomMeshProps) {
  const meshObject = useMemo(() => new MeshObject(), [])

  const { color, transmission, thickness, ior } = useControls({
    基础设置: folder({
      color: '#3d6962',
    }),
    transmission: { value: 1, min: 0, max: 1, step: 0.01 },
    thickness: { value: 1, min: 0, max: 2, step: 0.01 },
    ior: { value: 1.5, min: 1, max: 2, step: 0.01 },
  })

  //监听leva参数
  useEffect(() => {
    meshObject.material.color.set(color)
    meshObject.material.transmission = transmission
    meshObject.material.thickness = thickness
    meshObject.material.ior = ior
  }, [color, transmission, thickness, ior])

  //设置初始位置
  useEffect(() => {
    meshObject.setPosition(position)
  }, [position])

  //   定义动画
  // useFrame((state, delta) => {
  //   meshObject.mesh.rotation.y += Math.PI * delta
  //   meshObject.mesh.position.y = Math.sin((Math.PI / 2) * state.clock.elapsedTime) + 4
  // })

  useGSAP(() => {
    gsap.to(meshObject.mesh.rotation, {
      y: '+=' + Math.PI,
      duration: 2,
      ease: 'none',
      repeat: -1,
    })

    meshObject.mesh.position.y = 4

    gsap.to(meshObject.mesh.position, {
      duration: 2,
      y: 5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })
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
