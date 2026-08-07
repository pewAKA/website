#include ./perlinNoise.glsl

// 通过 time 参数控制流动，避免公共函数依赖特定着色器的 uniform。
float fbm(vec2 position, float time) {
    float value = 0.0;
    float frequency = 1.0;
    float amplitude = 0.5;
    vec2 flow = vec2(0.17, 0.11);

    for (int i = 0; i < 5; i++) {
        // 各层噪声使用不同的运动速度和方向。
        float octaveSpeed = 0.8 + float(i) * 0.35;
        value += perlinNoise(
            position * frequency + flow * time * octaveSpeed
        ) * amplitude;

        frequency *= 2.0;
        amplitude *= 0.5;

        // 每层旋转水流方向，避免所有细节同向平移。
        flow = mat2(0.8, -0.6, 0.6, 0.8) * flow;
    }

    return value;
}
