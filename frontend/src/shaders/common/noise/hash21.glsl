// 根据二维坐标生成 [0.0, 1.0) 范围内的伪随机数。
float hash21(vec2 position) {
    float value = dot(position, vec2(127.1, 311.7));
    return fract(sin(value) * 43758.5453123);
}
