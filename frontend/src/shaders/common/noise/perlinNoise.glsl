#include ./randomGradient.glsl

// 使用五次曲线平滑网格单元之间的插值。
vec2 perlinFade(vec2 value) {
    return value * value * value * (value * (value * 6.0 - 15.0) + 10.0);
}

float perlinNoise(vec2 position) {
    vec2 cell = floor(position);
    vec2 local = fract(position);

    vec2 g00 = randomGradient(cell + vec2(0.0, 0.0));
    vec2 g01 = randomGradient(cell + vec2(0.0, 1.0));
    vec2 g10 = randomGradient(cell + vec2(1.0, 0.0));
    vec2 g11 = randomGradient(cell + vec2(1.0, 1.0));

    vec2 d00 = local - vec2(0.0, 0.0);
    vec2 d01 = local - vec2(0.0, 1.0);
    vec2 d10 = local - vec2(1.0, 0.0);
    vec2 d11 = local - vec2(1.0, 1.0);

    float v00 = dot(g00, d00);
    float v01 = dot(g01, d01);
    float v10 = dot(g10, d10);
    float v11 = dot(g11, d11);

    vec2 weight = perlinFade(local);
    float bottom = mix(v00, v10, weight.x);
    float top = mix(v01, v11, weight.x);

    return mix(bottom, top, weight.y);
}
