/**
 * Created by wjh on 2017/11/3.
 */

var canvas, gl;
var numVertices = 36;
var points = [], normals = [] ;

var lightPosition = vec4(1.0, 5.0,5.0, 0.0 );//光位置
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );//环境光
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );//漫反射光
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );//镜面反射光

var materialAmbient = vec4( 1.0, 1.0, 1.0, 0.0 );
var materialDiffuse = vec4( 1.0, 1.0, 1.0, 1.0);
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 10.0;//光亮
var projection;

var xAixs = 0;
var yAixs = 1;
var zAixs = 2;
var axis = 0;
var theta = [0,0,0];
var rotate = false;

var thetaLoc;


var vertices = [
    vec4( -0.25, -0.25,  0.25, 1.0 ),
    vec4( -0.25,  0.25,  0.25, 1.0 ),
    vec4(  0.25,  0.25,  0.25, 1.0 ),
    vec4(  0.25, -0.25,  0.25, 1.0 ),
    vec4( -0.25, -0.25, -0.25, 1.0 ),
    vec4( -0.25,  0.25, -0.25, 1.0 ),
    vec4(  0.25,  0.25, -0.25, 1.0 ),
    vec4(  0.25, -0.25, -0.25, 1.0 )
];

function quad(a, b, c, d)
{

    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal1 = cross(t1, t2);
    var normal2 = vec3(normal1);

    points.push(vertices[a]);
    normals.push(normal2);
    points.push(vertices[b]);
    normals.push(normal2);
    points.push(vertices[c]);
    normals.push(normal2);
    points.push(vertices[a]);
    normals.push(normal2);
    points.push(vertices[c]);
    normals.push(normal2);
    points.push(vertices[d]);
    normals.push(normal2);
}

function colorCube(){

    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

window.onload = function cube (){

    canvas = document.getElementById("light1-cube");
    gl = WebGLUtils.setupWebGL(canvas);
    colorCube();

    if(!gl){
        console.log('浏览器不支持WebGL');
    }

    //设置视口大小
    gl.viewport(0,0,canvas.width,canvas.height);
    //清除canvas
    gl.clearColor(0, 0, 0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    var program = initShaders(gl,"shader/light/ddrLightVshader.glsl","shader/light/ddrLightFshader.glsl");
    gl.useProgram(program);//将着色器程序设置为有效



    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation(program, 'vNormal');
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);


    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,flatten(points),gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, 'vPosition');
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false,0,0);
    gl.enableVertexAttribArray(vPosition);

    thetaLoc = gl.getUniformLocation(program, 'theta');
    projection = ortho(-1, 1, -1, 1, -100, 100);

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(gl.getUniformLocation(program, 'ambientProduct'), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, 'diffuseProduct'), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, 'specularProduct'), flatten(materialSpecular));
    gl.uniform4fv(gl.getUniformLocation(program, 'lightPosition'), flatten(lightPosition));

    gl.uniform1f(gl.getUniformLocation(program, 'shininess'), materialShininess);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'projectionMatrix'), false,flatten(projection));



    //添加交互按钮的函数功能
    document.getElementById('xRotate').onclick = function (){
        axis = xAixs;
    };
    document.getElementById('yRotate').onclick = function (){
        axis = yAixs;
    };
    document.getElementById('zRotate').onclick = function (){
        axis = zAixs;
    };
    document.getElementById("stopRotate").onclick = function(){
        rotate = !rotate;
    };

    render();
};

function render(){

    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    if(rotate) theta[axis] += 1.0;
    gl.uniform3fv(thetaLoc, theta);
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    requestAnimFrame( render );

}










