/**
 * Created by wjh on 2017/11/9.
 */

var canvas, gl, program;
var n;
var points = [], indices = [];
var SPHERE_DIV = 30;//球经纬度数


var eye;
var at = vec3(0, 0, 0);
var up = vec3(0, 1.0, 0);
var theta =  0.0;
var dr = 5.0 * Math.PI/180.0;


var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
var lightAmbient = vec4(0.1, 0.1, 0.1, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 20.0;

var modelViewMatrix, modelViewMatrixLoc;
var projectionMatrix, projectionMatrixLoc;
var normalMatrix, normalMatrixLoc;

window.onload = function init(){
    canvas = document.getElementById("WebGL-sphere");
    gl = WebGLUtils.setupWebGL(canvas);
    if(!gl){
        console.log("不支持WebGL!");
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.2, 0.3, 0.6, 1.0);

    gl.enable(gl.DEPTH_TEST);

    program = initShaders(gl, "shader/sphere/sphereVshader.glsl", "shader/sphere/sphereFshader.glsl");
    gl.useProgram(program);

    n = initVertexBuffers(gl);

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    normalMatrixLoc = gl.getUniformLocation(program, "normalMatrix");


    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
        flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
        flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
        flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
        flatten(lightPosition));
    gl.uniform1f(gl.getUniformLocation(program, "shininess"),
        materialShininess);

    document.getElementById("B1").onclick = function (){
        theta += dr;
    };

    console.log(points);
    console.log(indices);


    render();

};

function initVertexBuffers(gl){

    var i, ai, si, ci;
    var j, aj, sj, cj;
    var p1, p2;

    for (j = 0; j <= SPHERE_DIV; j++){
        aj = j * Math.PI/SPHERE_DIV;
        sj = Math.sin(aj);
        cj = Math.cos(aj);
        for(i = 0; i <= SPHERE_DIV; i++){
            ai = i * 2 * Math.PI/SPHERE_DIV;
            si = Math.sin(ai);
            ci = Math.cos(ai);

            points.push(si * sj);
            points.push(cj);
            points.push(ci * sj);
        }
    }

    for(j = 0; j < SPHERE_DIV; j++){
        for(i = 0; i < SPHERE_DIV; i++){
            p1 = j * (SPHERE_DIV+1) + i;
            p2 = p1 + (SPHERE_DIV+1);

            indices.push(p1);
            indices.push(p2);
            indices.push(p1 + 1);

            indices.push(p1 + 1);
            indices.push(p2);
            indices.push(p2 + 1);
        }
    }

    if(!initArrayBuffer(gl, "vPosition", new Float32Array(points), gl.FLOAT, 3)) return -1;
    if(!initArrayBuffer(gl, "vNormal", new Float32Array(points), gl.FLOAT, 3)) return -1;

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    return indices.length;
}


function initArrayBuffer(gl, attribute, data, type, num) {

    var buffer = gl.createBuffer();
    if (!buffer) {
        console.log('Failed to create the buffer object');
        return false;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    var a_attribute = gl.getAttribLocation(program, attribute);
    if (a_attribute < 0) {
        console.log('Failed to get the storage location of ' + attribute);
        return false;
    }
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute);

    //gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return true;
}

function render(){

    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

    eye = vec3(Math.sin(theta),
        Math.sin(theta), 6 * Math.cos(theta));
    modelViewMatrix = lookAt(eye, at, up);
    projectionMatrix = perspective(45, canvas.width/canvas.height, 1, 10000);

    var normalMatrix1 = inverse4(modelViewMatrix);
    normalMatrix = transpose(normalMatrix1);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    gl.uniformMatrix4fv(normalMatrixLoc, false, flatten(normalMatrix));
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
    window.requestAnimFrame(render);
}


