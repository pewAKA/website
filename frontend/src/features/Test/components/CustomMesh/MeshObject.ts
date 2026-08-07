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
        this.geometry = new Three.SphereGeometry(1, 24, 24)
        this.material = new Three.MeshPhysicalMaterial({
            color: '#db6666',
            roughness: 0,
            transmission: 1,
            thickness: 0.9,
            ior: 1.5,
        })
        this.mesh = new Three.Mesh(this.geometry, this.material)
        this.mesh.castShadow = true
        this.mesh.receiveShadow = true
        this.geometry.computeBoundingBox()
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