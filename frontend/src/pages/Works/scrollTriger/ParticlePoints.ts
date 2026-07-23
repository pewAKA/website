import * as Three from 'three'
import vertexShader from './size.glsl?raw'

// 片元着色器负责绘制每个粒子的像素，并将粒子颜色与贴图颜色相乘。
const fragmentShader = `
uniform sampler2D uTexture;

varying vec3 vColor;

void main() {
    // gl_PointCoord 是点精灵内部的纹理坐标，范围为 0.0 到 1.0。
    vec4 textureColor = texture2D(uTexture, gl_PointCoord);

    // 保留贴图的透明度，同时使用每颗粒子独有的顶点颜色为贴图染色。
    gl_FragColor = vec4(vColor, 1.0) * textureColor;
}
`

interface ConstructParams {
    texture?: Three.Texture
}

interface CreateParams {
    count: number
    range: number,
}

export default class ParticlePoints extends Three.Points<Three.BufferGeometry, Three.ShaderMaterial> {
    constructor(params: ConstructParams) {
        super(
            new Three.BufferGeometry(),
            new Three.ShaderMaterial({
                // 外部顶点着色器读取 aSize 和 color 两个几何属性。
                vertexShader,
                fragmentShader,
                uniforms: {
                    // ShaderMaterial 不支持 map，贴图需通过 uniform 传给 GLSL。
                    uTexture: { value: params.texture },
                },
                blending: Three.AdditiveBlending,
                depthWrite: false,
                transparent: true,
            })
        )
    }

    create(params: Partial<CreateParams> = {}) {
        const { count = 10000, range = 10 } = params
        const vertices = new Float32Array(count * 3)
        const colors = new Float32Array(count * 3)
        const color = new Three.Color()
        const sizes = new Float32Array(count)

        for (let i = 0; i < count; i++) {
            vertices[i * 3] = Math.random() * (2 * range) - range
            vertices[i * 3 + 1] = Math.random() * (2 * range) - range
            vertices[i * 3 + 2] = Math.random() * (2 * range) - range

            color.setHSL(Math.random(), 0.8, 0.6)
            colors[i * 3] = color.r
            colors[i * 3 + 1] = color.g
            colors[i * 3 + 2] = color.b

            // 每颗粒子生成 4 到 16 像素的基础大小。
            sizes[i] = Math.random() * 0.32 + 0.08
        }

        if (this.geometry) {
            this.geometry.dispose()
        }
        this.geometry.setAttribute('position', new Three.BufferAttribute(vertices, 3))
        this.geometry.setAttribute('color', new Three.BufferAttribute(colors, 3))
        // aSize 名称须与顶点着色器中的 attribute float aSize 保持一致。
        this.geometry.setAttribute('aSize', new Three.BufferAttribute(sizes, 1))
    }

    dispose() {
        this.geometry.dispose()
        this.material.dispose()
    }
}
