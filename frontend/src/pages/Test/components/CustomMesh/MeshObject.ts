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
        this.geometry = new Three.SphereGeometry(0.5, 4, 2)
        this.material = new Three.MeshStandardMaterial({
            color: '#db6666',
            metalness: 1
        })
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