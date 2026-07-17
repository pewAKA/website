import { useManagedTexture } from '@/three/assets'

export default function GroundMesh() {
  const colorTexture = useManagedTexture('test.tiles.color-repeat-10')
  const displacementTexture = useManagedTexture('test.tiles.displacement-repeat-10')
  const normalTexture = useManagedTexture('test.tiles.normal')
  const roughnessTexture = useManagedTexture('test.tiles.roughness')

  return (
    <mesh receiveShadow castShadow rotation-x={-Math.PI / 2}>
      <planeGeometry args={[20, 20, 100, 100]} />
      <meshStandardMaterial
        displacementMap={displacementTexture}
        displacementScale={0.2}
        map={colorTexture}
        normalMap={normalTexture}
        roughnessMap={roughnessTexture}
      />
    </mesh>
  )
}
