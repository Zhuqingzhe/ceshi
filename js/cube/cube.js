/**
 * Created by wjh on 2017/10/31.
 */


var canvas, gl;
var numVertices = 36;
var points = [], colors = [];

var xAixs = 0;
var yAixs = 1;
var zAixs = 2;
var axis = 0;
var theta = [0,0,0];
var rotate = false;

var thetaLoc;

window.onload = function cube (){

   canvas = document.getElementById('WebGL-cube');
   // gl = WebGLUtils.setupWebGL(canvas);
    gl = canvas.getContext('experimental-webgl',{antialias:true});
   colorCube();

   if(!gl){
       console.log('浏览器不支持WebGL');
   }

   //设置视口大小
   gl.viewport(0,0,canvas.width,canvas.height);
   //清除canvas
   gl.clearColor(0, 0, 0, 1.0);
   gl.enable(gl.DEPTH_TEST);

   var program = initShaders(gl,"shader/cube/vertexShader.glsl","shader/cube/fragmentShader.glsl");
   gl.useProgram(program);//将着色器程序设置为有效


   var cBuffer = gl.createBuffer();//创建缓冲区对象
   gl.bindBuffer(gl.ARRAY_BUFFER,cBuffer);//绑定对象
   gl.bufferData(gl.ARRAY_BUFFER,flatten(colors),gl.STATIC_DRAW);//向缓冲区对象写入数据

   var vColor = gl.getAttribLocation(program, 'vColor');//获取着色器中的Attribute变量
   gl.vertexAttribPointer(vColor, 4, gl.FLOAT,false,0,0);//将缓冲区对象分配给attribute变量
   gl.enableVertexAttribArray(vColor);//建立attribute变量与缓冲区之间的连接

   var vBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER,vBuffer);
   gl.bufferData(gl.ARRAY_BUFFER,flatten(points),gl.STATIC_DRAW);

   var vPosition = gl.getAttribLocation(program, 'vPosition');
   gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false,0,0);
   gl.enableVertexAttribArray(vPosition);

   thetaLoc = gl.getUniformLocation(program, 'theta');


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

function colorCube(){

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
        vec4( -0.25, -0.25,  0.25, 1.0 ),
        vec4( -0.25,  0.25,  0.25, 1.0 ),
        vec4(  0.25,  0.25,  0.25, 1.0 ),
        vec4(  0.25, -0.25,  0.25, 1.0 ),
        vec4( -0.25, -0.25, -0.25, 1.0 ),
        vec4( -0.25,  0.25, -0.25, 1.0 ),
        vec4(  0.25,  0.25, -0.25, 1.0 ),
        vec4(  0.25, -0.25, -0.25, 1.0 )
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
    if(rotate) theta[axis] += 0.8;
    gl.uniform3fv(thetaLoc, theta);
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    requestAnimFrame( render );
}










