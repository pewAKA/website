import * as Three from 'three'

export interface GalaxyParams {
    count: number,
    radius: number,
    branch: number,
    spinOffset: number,
    spreadPow: number,
    innerColor: string,
    outterColor: string
}

export default class GalaxyPoints extends Three.Points<Three.BufferGeometry, Three.PointsMaterial> {
    constructor() {
        super(
            new Three.BufferGeometry(),
            new Three.PointsMaterial({
                color: 'white',
                size: 0.05,
                blending: Three.AdditiveBlending,
                depthWrite: false,
                transparent: true,
                vertexColors: true
            })
        )
    }

    generate(params: GalaxyParams) {

        const verties = new Float32Array(params.count * 3)
        const colors = new Float32Array(params.count * 3)

        const innerColor = new Three.Color(params.innerColor)
        const outterColor = new Three.Color(params.outterColor)
        const mixedColor = new Three.Color()

        //positons
        for (let i = 0; i < params.count; i++) {
            //position
            const radius = Math.random() * params.radius
            const branchAngle = (i % params.branch) / params.branch * Math.PI * 2
            const spinAngle = params.spinOffset * radius

            const spreadX = Math.pow(Math.random(), params.spreadPow) * (Math.random() < 0.5 ? -1 : 1)
            const spreadY = Math.pow(Math.random(), params.spreadPow) * (Math.random() < 0.5 ? -1 : 1)
            const spreadZ = Math.pow(Math.random(), params.spreadPow) * (Math.random() < 0.5 ? -1 : 1)

            verties[i * 3] = Math.cos(branchAngle + spinAngle) * radius + spreadX
            verties[i * 3 + 1] = 0 + spreadY
            verties[i * 3 + 2] = Math.sin(branchAngle + spinAngle) * radius + spreadZ

            //color
            mixedColor.copy(innerColor).lerp(outterColor, radius / params.radius)
            colors[i * 3] = mixedColor.r
            colors[i * 3 + 1] = mixedColor.g
            colors[i * 3 + 2] = mixedColor.b
        }

        const nextBufferGeometry = new Three.BufferGeometry()
        const positionAttribute = new Three.BufferAttribute(verties, 3)
        const colorAttribute = new Three.BufferAttribute(colors, 3)
        nextBufferGeometry.setAttribute('position', positionAttribute)
        nextBufferGeometry.setAttribute('color', colorAttribute)

        this.geometry.dispose()
        this.geometry = nextBufferGeometry
    }

    dispose() {
        this.geometry.dispose()
        this.material.dispose()
    }
}