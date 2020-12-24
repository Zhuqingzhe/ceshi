/**
 * Created by wjh on 2017/11/1.
 */

var canvas,gl;
var numVertices = 36;
var points = [], colors = [];

var rotationMatrix;
var rotationMatrixLoc;

var angle = 0.0;
var axis = [0, 0, 1];

var trackingMouse = false;
var trackballMove = false;

var lastPos = [0, 0, 0];
var curx, cury;
var startX, startY;

function trackballView(x, y){
    var d, a;
    var v = [];
    v[0] = x;
    v[1] = y;
    d = v[0]*v[0] + v[1]* v[1];

    if(d<1.0){
        v[2] = Math.sqrt(d);
    } else{
        v[2] = 0.0;
        a = 1.0 / Math.sqrt(d);
        v[0] *= a;
        v[1] *= a;
    }

    return v;
}


function mouseMotion(x, y){
    var dx, dy, dz;

    var currentPos = trackballView(x,y);
    if(trackingMouse) {
        dx = currentPos[0] - lastPos[0];
        dy = currentPos[1] - lastPos[1];
        dz = currentPos[2] - lastPos[2];

        if( dx || dy || dz ){
            angle = -0.1 * Math.sqrt(dx*dx + dy*dy + dz*dz);

            axis[0] = lastPos[1]*currentPos[2] - lastPos[2]*currentPos[1];
            axis[1] = lastPos[2]*currentPos[0] - lastPos[0]*currentPos[2];
            axis[2] = lastPos[0]*currentPos[1] - lastPos[1]*currentPos[0];

            lastPos[0] = currentPos[0];
            lastPos[1] = currentPos[1];
            lastPos[2] = currentPos[2];

        }
    }

    render();
}

function startMotion(x, y){
    trackingMouse = true;
    startX = x;
    startY = y;
    curx = x;
    cury = y;

    lastPos = trackballView(x, y);
    trackballMove = true;

}

function stopMotion(x, y){
    trackingMouse = false;
    if (startX != x || startY != y){
    } else{
        angle = 0.0;
        trackballMove = false;
    }
}


window.onload = function cube () {

    canvas = document.getElementById('WebGL-trackballCube');
    gl = WebGLUtils.setupWebGL(canvas);
    colorCube();

    if (!gl) {
        console.log('浏览器不支持WebGL');
    }

    //设置视口大小
    gl.viewport(0, 0, canvas.width, canvas.height);
    //清除canvas
    gl.clearColor(0, 0, 0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    var program = initShaders(gl, "shader/cube/cubeVShader.glsl", "shader/cube/fragmentShader.glsl");
    gl.useProgram(program);//将着色器程序设置为有效


    var cBuffer = gl.createBuffer();//创建缓冲区对象
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);//绑定对象
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);//向缓冲区对象写入数据

    var vColor = gl.getAttribLocation(program, 'vColor');//获取着色器中的Attribute变量
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);//将缓冲区对象分配给attribute变量
    gl.enableVertexAttribArray(vColor);//建立attribute变量与缓冲区之间的连接

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, 'vPosition');
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    rotationMatrix = mat4();
    rotationMatrixLoc = gl.getUniformLocation(program, "r");
    gl.uniformMatrix4fv(rotationMatrixLoc, false, flatten(rotationMatrix));

    canvas.addEventListener("mousedown", function(event){
        var x = 2*event.clientX/canvas.width-1;
        var y = 2*event.clientY/canvas.height-1;
        startMotion(x,y);
    });

    canvas.addEventListener("mouseup",function(event){
        var x =2*event.clientX/canvas.width-1;
        var y =2*event.clientY/canvas.height-1;
        stopMotion(x,y);
    });

    canvas.addEventListener("mousemove",function (event) {
        var x = 2*event.clientX/canvas.width-1;
        var y = 2*event.clientY/canvas.height-1;
        mouseMotion(x,y);
    });

    render();
};

function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function quad(a, b, c, d)
{
    var vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5, -0.5, -0.5, 1.0 )
    ];

    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
        [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
        [ 1.0, 1.0, 1.0, 1.0 ]   // white
    ];


    var indices = [a,b,c,a,c,d];
    for (var i=0; i<indices.length;++i){
        points.push(vertices[indices[i]]);
        colors.push(vertexColors[a]);
    }

}


function render(){
   gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
   if(trackballMove){
       axis = normalize(axis);
       rotationMatrix = mult(rotationMatrix,rotate(angle,axis));
       gl.uniformMatrix4fv(rotationMatrixLoc,false,flatten(rotationMatrix));
   }

   gl.drawArrays(gl.TRIANGLES,0,numVertices);
    requestAnimFrame( render );
}
