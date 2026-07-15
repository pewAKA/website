import { useEffect, useMemo } from 'react'
import MeshObject from './MeshObject'

export default function GroundMesh() {
  const meshObject = useMemo(() => new MeshObject(), [])
  useEffect(() => {
    meshObject.mesh.rotation.x = -Math.PI / 2
    return () => {
      meshObject.dispose()
    }
  }, [])
  return <primitive object={meshObject.mesh} />
}
