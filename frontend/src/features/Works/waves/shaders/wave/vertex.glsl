uniform float uTime;
uniform float uDepth;
uniform float uFrequency;
uniform float uSpeed;

varying vec2 vUv;
varying float vElevation;

void main() {
    vUv = uv;
    vec3 displaced = position;
    float primaryWave = sin(position.x * uFrequency + uTime * uSpeed);
    float crossWave = cos(position.y * (uFrequency * 1.45) - uTime * uSpeed * 0.72);
    float detailWave = sin((position.x + position.y) * 1.7 + uTime * 0.34) * 0.22;
    float elevation = (primaryWave * 0.58 + crossWave * 0.32 + detailWave) * uDepth;

    displaced.z += elevation;
    vElevation = elevation;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
