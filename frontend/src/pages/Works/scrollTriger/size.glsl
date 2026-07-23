attribute float aSize;
attribute vec3 color;

varying vec3 vColor;

void main() {
    // 将每颗粒子的颜色传递给片元着色器。
    vColor = color;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    // 透视缩放：离相机远的粒子会更小，并避免距离过小时除以零。
    gl_PointSize = aSize * (500.0 / max(-mvPosition.z, 0.001));

    gl_Position = projectionMatrix * mvPosition;
}
