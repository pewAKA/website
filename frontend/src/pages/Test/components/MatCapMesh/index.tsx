import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as Three from 'three'
import { useManagedTexture } from '@/three/assets'

export default function MatCapMesh() {
  const count = 500
  const meshRef = useRef<Three.InstancedMesh>(null)
  const matcapTexture = useManagedTexture('test.matcap.soft-clay')
  const geometry = useMemo(() => new Three.TorusGeometry(0.2, 0.1, 10), [])
  const material = useMemo(
    () => new Three.MeshMatcapMaterial({ matcap: matcapTexture }),
    [matcapTexture],
  )

  useLayoutEffect(() => {
    if (!meshRef.current) return
    const dummy = new Three.Object3D()
    for (let i = 0; i < count; i++) {
      dummy.position.x = (Math.random() - 0.5) * 2 * 10
      dummy.position.y = (Math.random() - 0.5) * 2 * 10
      dummy.position.z = (Math.random() - 0.5) * 2 * 10

      const scaleOffset = Math.random() + 0.5
      dummy.scale.set(scaleOffset, scaleOffset, scaleOffset)

      const rotationOffset = Math.random() * Math.PI
      dummy.rotation.x = rotationOffset
      dummy.rotation.y = rotationOffset

      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [count])

  useEffect(() => {
    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [geometry, material])

  return <instancedMesh dispose={null} ref={meshRef} args={[geometry, material, count]} />
}
