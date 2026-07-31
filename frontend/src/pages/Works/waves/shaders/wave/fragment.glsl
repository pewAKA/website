uniform vec4 uDeepColor;
uniform vec4 uSurfaceColor;

varying vec3 vPosition;

void main() {
    vec3 normalizedPositon = normalize(vPosition);
    gl_FragColor = vec4(normalizedPositon.y, normalizedPositon.y, normalizedPositon.y, 1.0);
}