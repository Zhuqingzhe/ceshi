
attribute vec4 vPosition;
attribute vec4 vColor;
varying vec4 fColor;
uniform mat4 vRotateMatrix;
uniform mat4 vTranslateMatrix;
uniform mat4 vScalingMatrix;
uniform vec3 theta;
void main() {

vec3 angles = radians( theta );
vec3 c = cos( angles );
vec3 s = sin( angles );

mat4 rx = mat4(1.0, 0.0, 0.0, 0.0,
          0.0, c.x, s.x, 0.0,
          0.0, -s.x, c.x, 0.0,
          0.0, 0.0, 0.0, 1.0
          );

mat4 ry = mat4(c.y, 0.0, -s.y, 0.0,
          0.0, 1.0, 0.0, 0.0,
          s.y, 0.0, c.y, 0.0,
          0.0, 0.0, 0.0, 1.0
          );

mat4 rz = mat4(c.z, s.z, 0.0, 0.0,
          -s.z, c.z, 0.0, 0.0,
          0.0, 0.0, 1.0, 0.0,
          0.0, 0.0, 0.0, 1.0
          );
 fColor = vColor;
 gl_Position =  vTranslateMatrix * vRotateMatrix * vScalingMatrix * rz * ry * rx * vPosition;
 gl_Position = vScalingMatrix * vTranslateMatrix * vRotateMatrix * rz * ry * rx * vPosition;
// gl_Position.x = -gl_Position.x;
// gl_Position.y = -gl_Position.y;
// gl_Position.z = -gl_Position.z;
}


