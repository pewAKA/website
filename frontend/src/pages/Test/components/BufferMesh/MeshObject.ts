import * as Three from 'three'

export default class MeshObject {
    geometry: Three.BufferGeometry
    material: Three.PointsMaterial
    points: Three.Points
    constructor() {
        this.geometry = new Three.BufferGeometry()

        const count = 1000
        const verties = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            verties[i * 3] = (Math.random() - 0.5) * 2 + 4 //x轴
            verties[i * 3 + 1] = (Math.random() - 0.5) * 2 + 1 //y轴
            verties[i * 3 + 2] = (Math.random() - 0.5) * 2 //z轴
        }

        const positionAttribute = new Three.BufferAttribute(verties, 3)
        this.geometry.setAttribute('position', positionAttribute)

        this.material = new Three.PointsMaterial({ color: '#77be65', size: 0.05 })
        this.points = new Three.Points(this.geometry, this.material)
    }
    dispose() {
        this.geometry.dispose()
        this.material.dispose()
    }
}