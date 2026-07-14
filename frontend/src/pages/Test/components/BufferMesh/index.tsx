import { useEffect, useMemo } from 'react'
import MeshObject from './MeshObject'

function BufferMesh() {
  const meshObject = useMemo(() => new MeshObject(), [])

  //清理内存
  useEffect(() => {
    return () => {
      meshObject.dispose()
    }
  }, [meshObject])
  return <primitive object={meshObject.points} />
}

export default BufferMesh
