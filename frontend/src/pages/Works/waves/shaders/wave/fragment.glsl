uniform vec3 uDeepColor;
uniform vec3 uSurfaceColor;
uniform float uDepth;

varying vec3 vPosition;
varying float vElevation;

void main() {
    float strength = clamp(vElevation * 2.0 + 0.5, 0.0, 1.0);
    strength = pow(strength, 1.35);
    vec3 mixColor = mix(uDeepColor, uSurfaceColor, strength);
    gl_FragColor = vec4(mixColor, 1.0);
}
