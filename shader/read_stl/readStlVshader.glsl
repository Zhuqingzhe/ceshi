
attribute vec4 vPosition;
attribute vec4 vNormal;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 normalMatrix;
uniform vec4 lightPosition;
varying vec4 fColor;
varying vec3 N, L, E;
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vPosition;
  fColor = vec4(0.3, 0.6, 0.5, 1.0);
}
