import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import * as Three from 'three'

export default class MeshObject {
    fontLoader: FontLoader
    geometry: TextGeometry
    material: Three.Material
    mesh: Three.Mesh
    constructor() {
        this.fontLoader = new FontLoader()
        // const font = this.fontLoader.loadAsync('/src/assets/threejs/fonts/GEORGIA.json')
        this.geometry = new TextGeometry('Linco Hub')
        this.fontLoader.load('/src/assets/threejs/fonts/GEORGIA.json', (font) => {
            this.geometry = new TextGeometry('Linco Hub', {
                font,
                size: 80
            })
        })
        this.material = new Three.MeshStandardMaterial({ color: '#dddddd' })
        this.mesh = new Three.Mesh(this.geometry, this.material)
    }
    dispose() {
        this.geometry.dispose()
        this.material.dispose()
    }
}