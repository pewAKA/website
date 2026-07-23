import { useEffect, useMemo } from 'react'
import ParticlePoints from './ParticlePoints'
import { useFrame } from '@react-three/fiber'
import { useManagedTexture } from '@/three/assets'

export default function Particles() {
  const particleTextrue = useManagedTexture('work.scroll.particle')
  // 构造函数接收配置对象，纹理变化时同步创建对应的粒子材质。
  const particlePoints = useMemo(
    () => new ParticlePoints({ texture: particleTextrue }),
    [particleTextrue],
  )

  useFrame((_, delta) => {
    particlePoints.rotateY(Math.PI * delta * 0.01)
  })

  useEffect(() => {
    particlePoints.create()
    // 仅在组件卸载或粒子对象替换时释放 GPU 资源。
    return () => particlePoints.dispose()
  }, [particlePoints])
  return <primitive object={particlePoints} />
}
