#include /common/noise/fbm.glsl

uniform float uTime;
uniform float uDepth;
uniform float uFrequencey;
uniform float uSpeed;

varying vec2 vUv;
varying vec3 vPosition;
varying float vElevation;

void main() {
    vUv = uv;

    vec4 worldPosition = modelMatrix * vec4(position, 1.0);

    float wave = fbm(
        worldPosition.xz * uFrequencey + vec2(uTime * uSpeed),
        uTime
    );
    worldPosition.y += wave * uDepth;

    vec4 viewPosition = viewMatrix * worldPosition;

    gl_Position = projectionMatrix * viewPosition;

    vPosition = worldPosition.xyz;
    vElevation = wave;
}
