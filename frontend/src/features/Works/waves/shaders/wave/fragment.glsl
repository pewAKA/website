uniform vec3 uDeepColor;
uniform vec3 uSurfaceColor;
uniform float uDepth;

varying float vElevation;

void main() {
    float normalized = clamp((vElevation / max(uDepth, 0.001)) * 0.5 + 0.5, 0.0, 1.0);
    float strength = smoothstep(0.12, 0.92, normalized);
    vec3 mixColor = mix(uDeepColor, uSurfaceColor, pow(strength, 1.2));
    gl_FragColor = vec4(mixColor, 1.0);
}
