import * as Three from 'three'

export interface GalaxyParams {
  count: number
  radius: number
  branch: number
  spinOffset: number
  spreadPow: number
  innerColor: string
  outerColor: string
}

export default class GalaxyPoints extends Three.Points<Three.BufferGeometry, Three.PointsMaterial> {
  constructor() {
    super(
      new Three.BufferGeometry(),
      new Three.PointsMaterial({
        size: 0.055,
        blending: Three.AdditiveBlending,
        depthWrite: false,
        opacity: 0.92,
        transparent: true,
        vertexColors: true,
      }),
    )
    this.frustumCulled = false
  }

  generate(params: GalaxyParams) {
    const vertices = new Float32Array(params.count * 3)
    const colors = new Float32Array(params.count * 3)
    const innerColor = new Three.Color(params.innerColor)
    const outerColor = new Three.Color(params.outerColor)
    const mixedColor = new Three.Color()
    let seed = 2749

    // 固定种子确保每次进入页面时得到同一座星系，海报与实时画面不会随机跳变。
    const random = () => {
      seed = (seed * 16807) % 2147483647
      return (seed - 1) / 2147483646
    }

    for (let i = 0; i < params.count; i += 1) {
      const radius = Math.pow(random(), 0.82) * params.radius
      const branchAngle = ((i % params.branch) / params.branch) * Math.PI * 2
      const spinAngle = params.spinOffset * radius
      const direction = () => (random() < 0.5 ? -1 : 1)
      const spreadX = Math.pow(random(), params.spreadPow) * direction() * 1.4
      const spreadY = Math.pow(random(), params.spreadPow) * direction() * 0.7
      const spreadZ = Math.pow(random(), params.spreadPow) * direction() * 1.4

      vertices[i * 3] = Math.cos(branchAngle + spinAngle) * radius + spreadX
      vertices[i * 3 + 1] = spreadY
      vertices[i * 3 + 2] = Math.sin(branchAngle + spinAngle) * radius + spreadZ

      mixedColor.copy(innerColor).lerp(outerColor, radius / params.radius)
      colors[i * 3] = mixedColor.r
      colors[i * 3 + 1] = mixedColor.g
      colors[i * 3 + 2] = mixedColor.b
    }

    const nextGeometry = new Three.BufferGeometry()
    nextGeometry.setAttribute('position', new Three.BufferAttribute(vertices, 3))
    nextGeometry.setAttribute('color', new Three.BufferAttribute(colors, 3))
    nextGeometry.computeBoundingSphere()

    this.geometry.dispose()
    this.geometry = nextGeometry
  }

  dispose() {
    this.geometry.dispose()
    this.material.dispose()
  }
}
