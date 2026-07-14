import * as Three from 'three'

interface GeneralMesh {
    geometry: Three.BufferGeometry
    material: Three.Material
    mesh: Three.Mesh
}

export default class MeshObject implements GeneralMesh {
    geometry
    material
    mesh
    constructor() {
        this.geometry = new Three.BoxGeometry(1, 1, 1)
        this.material = new Three.MeshStandardMaterial({ color: '#7289b4' })
        this.mesh = new Three.Mesh(this.geometry, this.material)
        this.mesh.castShadow = true
        this.mesh.receiveShadow = true
    }
    setPosition(position: [number, number, number] | undefined) {
        if (!position) return
        this.mesh.position.set(...position)
    }
    dispose() {
        this.geometry.dispose()
        this.material.dispose()
    }
}