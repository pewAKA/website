import * as Three from 'three'

class MeshObject {
    geometry: Three.BufferGeometry
    material: Three.Material
    mesh: Three.Mesh
    constructor() {

        const textureLoader = new Three.TextureLoader()

        const colorTexture = textureLoader.load('/src/assets/threejs/textures/Tiles141_1K-JPG/Tiles141_1K-JPG_Color.jpg');
        colorTexture.colorSpace = Three.SRGBColorSpace
        colorTexture.wrapS = Three.RepeatWrapping
        colorTexture.wrapT = Three.RepeatWrapping
        colorTexture.repeat.set(10, 10)

        const displacementTextrue = textureLoader.load('/src/assets/threejs/textures/Tiles141_1K-JPG/Tiles141_1K-JPG_Displacement.jpg');
        displacementTextrue.wrapS = Three.RepeatWrapping
        displacementTextrue.wrapT = Three.RepeatWrapping
        displacementTextrue.repeat.set(10, 10)

        const normalTexture = textureLoader.load('/src/assets/threejs/textures/Tiles141_1K-JPG/Tiles141_1K-JPG_NormalGL.jpg');
        const roughnessTexture = textureLoader.load('/src/assets/threejs/textures/Tiles141_1K-JPG/Tiles141_1K-JPG_Roughness.jpg');

        this.geometry = new Three.PlaneGeometry(20, 20, 100, 100)
        this.material = new Three.MeshStandardMaterial({
            map: colorTexture,
            displacementMap: displacementTextrue,
            displacementScale: 0.2,
            normalMap: normalTexture,
            roughnessMap: roughnessTexture,
        })
        this.mesh = new Three.Mesh(this.geometry, this.material)
        this.mesh.receiveShadow = true
        this.mesh.castShadow = true
    }
    dispose() {
        this.geometry.dispose()
        this.material.dispose()
    }
}

export default MeshObject