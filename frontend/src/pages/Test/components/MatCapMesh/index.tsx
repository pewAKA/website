import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as Three from 'three'

const textureLoader = new Three.TextureLoader()
const matcapTexture = textureLoader.load(
  '/src/assets/threejs/matcap/80726C_DCDBD7_9AA6C2_B7BFCA-64px.png',
)

export default function MatCapMesh() {
  const count = 500
  const meshRef = useRef<Three.InstancedMesh>(null)
  const geometry = useMemo(() => new Three.TorusGeometry(0.2, 0.1, 10), [])
  const material = useMemo(() => new Three.MeshMatcapMaterial({ matcap: matcapTexture }), [])

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
  }, [])

  useEffect(() => {
    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [])

  return <instancedMesh ref={meshRef} args={[geometry, material, count]} />
}
