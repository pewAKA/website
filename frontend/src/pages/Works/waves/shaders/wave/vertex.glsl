uniform float uTime;
uniform float uDepth;
uniform float uFrequencey;
uniform float uSpeed;

varying vec2 vUv;
varying vec3 vPosition;

void main() {
    vUv = uv;

    vec4 worldPosition = modelMatrix * vec4(position, 1.0);

    float wave1 = sin(dot(worldPosition.xz, normalize(vec2(-1.0, -0.22))) * uFrequencey * 1.1 - uTime * uSpeed * 0.85) * uDepth * 0.5;
    float wave2 = sin(dot(worldPosition.xz, normalize(vec2(-0.35, -1.0))) * uFrequencey * 0.9 - uTime * uSpeed * 1.21) * uDepth * 0.7;
    float wave3 = sin(dot(worldPosition.xz, normalize(vec2(-0.86, 0.65))) * uFrequencey * 0.6 - uTime * uSpeed * 0.55) * uDepth * 0.9;

    worldPosition.y += (wave1 + wave2 + wave3);

    vec4 viewPosition = viewMatrix * worldPosition;

    gl_Position = projectionMatrix * viewPosition;

    vPosition = worldPosition.xyz;
}