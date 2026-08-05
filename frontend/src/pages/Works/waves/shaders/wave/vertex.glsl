uniform float uTime;
uniform float uDepth;
uniform float uFrequencey;
uniform float uSpeed;

varying vec2 vUv;
varying vec3 vPosition;
varying float vElevation;

#define PI 3.14159265359
#define TWO_PI 6.28318530718

//0.0-0.1
float hash21(vec2 position) {
    float value = dot(position, vec2(127.1, 311.7));
    return fract(sin(value) * 43758.5453123);
}

vec2 randomGradient(vec2 position) {
    float randomValue = hash21(position);
    float angle = TWO_PI * randomValue;
    return vec2(cos(angle), sin(angle));
}

vec2 fade(vec2 t) {
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
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

    vec2 u = fade(local);

    float bottom = mix(v00, v10, u.x);
    float top = mix(v01, v11, u.x);

    return mix(bottom, top, u.y);
}

float fbm(vec2 position) {
    float value = 0.0;
    float frequency = 1.0;
    float amplitude = 0.5;
    vec2 flow = vec2(0.17, 0.11);

    for(int i = 0; i < 5; i++) {
       // 各层噪声使用不同的运动速度和方向
        float octaveSpeed = 0.8 + float(i) * 0.35;
        value += perlinNoise(position * frequency + flow * uTime * octaveSpeed) * amplitude;

        frequency *= 2.0;
        amplitude *= 0.5;
        // 每层旋转水流方向，避免所有细节同向平移
        flow = mat2(0.8, -0.6, 0.6, 0.8) * flow;
    }

    return value;
}

void main() {
    vUv = uv;

    vec4 worldPosition = modelMatrix * vec4(position, 1.0);

    float wave = fbm(worldPosition.xz * uFrequencey + uTime * uSpeed);
    worldPosition.y += wave * uDepth;

    vec4 viewPosition = viewMatrix * worldPosition;

    gl_Position = projectionMatrix * viewPosition;

    vPosition = worldPosition.xyz;
    vElevation = wave;
}