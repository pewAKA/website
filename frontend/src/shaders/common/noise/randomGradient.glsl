#include ./hash21.glsl

// 根据二维坐标生成随机的二维单位方向。
vec2 randomGradient(vec2 position) {
    float randomValue = hash21(position);
    float angle = 6.28318530718 * randomValue;

    return vec2(cos(angle), sin(angle));
}
