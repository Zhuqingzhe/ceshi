

attribute vec4 vPosition;
attribute vec3 vNormal;
uniform vec3 theta;
uniform mat4 projectionMatrix;
uniform vec4 ambientProduct, diffuseProduct, specularProduct;
uniform vec4 lightPosition;
uniform float shininess;
varying vec4 fColor;

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
//旋转矩阵
mat4 modelViewMatrix = rz * ry * rx;

vec3 pos = -(modelViewMatrix * vPosition).xyz;

vec3 light = lightPosition.xyz;
vec3 L = normalize(light - pos);

vec3 E = normalize(-pos);
vec3 H = normalize(L + E);

vec4 NN = vec4(vNormal,0);

vec3 N = normalize((modelViewMatrix * NN).xyz);
vec4 ambient = ambientProduct;
float Kd = max(dot(L, N), 0.0);//漫反射光系数
vec4 diffuse = Kd * diffuseProduct;

float Ks = pow(max(dot(N, H), 0.0), shininess);//镜面反射系数pow(x,y),表示x的y次幂
vec4 specular = Ks * specularProduct;

if(dot(L, N)<0.0){
specular = vec4(0.0, 0.0, 0.0, 1.0);
}

 gl_Position = projectionMatrix * modelViewMatrix * vPosition;
 fColor = ambient + diffuse + specular;
 fColor.a = 1.0;
}
