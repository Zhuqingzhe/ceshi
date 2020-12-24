/**
 * Created by wjh on 2017/11/14.
 */
var canvas, gl, program, prog;
var g_stlDoc, g_drawingInfo;//stl文件和画图信息

var modelViewMatrix;
var projectionMatrix;
var normalMatrix;

window.onload = function readStl() {
    //获取canvas元素及webgl上下文
    canvas = document.getElementById("read_stl");
    gl = WebGLUtils.setupWebGL(canvas0);
    if(!gl){
        console.log('获取WebGL失败！');
    }

    //设置窗口尺寸、背景颜色及消除隐藏面
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    //初始化着色器
    program = initShaders(gl, "shader/read_stl/readStlVshader", "shader/read_stl/readStlFshadr");
    gl.useProgram(program);
    prog = program;


    //获取顶点着色器中attribute变量和uniform变量
    prog.vPosition = gl.getAttribLocation(program,"vPosition");
    prog.vNormal = gl.getAttribLocation(program, "vNormal");
    prog.modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    prog.projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    prog.normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );

    //给顶点坐标和法向量创建空缓冲区
    var model = initVertexBuffers(gl, prog);
    if(!model){
        console.log('设置顶点信息失败！');
        return;
    }

    readSTLFile("", gl, model, 10, true);
    render(gl, program, model);
};

//创建缓冲区对象
function initVertexBuffers(gl, program){
    var obj = new Object();
    obj.vertexBuffer = createEmptyArrayBuffer(gl, prog.vPosition, 3, gl.FLOAT);
    obj.normalBuffer = createEmptyArrayBuffer(gl, prog.vNormal, 3, gl.FLOAT);
    obj.indexBuffer = gl.createBuffer();
    if(!obj.vertexBuffer||!obj.normalBuffer||!obj.indexBuffer){
        return null;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return obj;
}
function createEmptyArrayBuffer(gl, attribute, num, type){
    var buffer = gl.createBuffer();
    if(!buffer){
        console.log("创建缓冲区对象失败！");
        return null;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(attribute, num, type, false, 0, 0);
    gl.enableVertexAttribArray(attribute);

    return buffer;
}


//stl读取本地文件
function readSTLFile(fileName, gl, model, scale, reverse){
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if(xhr.readyState == 4 && xhr.status !== 404){
            onReadSTLFlie(xhr.responseText, fileName, gl, model, scale, reverse);
        }
    };
    xhr.open('GET', fileName, true);
    xhr.send();
}

//stl文件读取完毕
function  onReadSTLFlie(string, fileName, gl, model, scale, reverse){

    var stlDoc = new STLDoc(fileName);
    var result = stlDoc.parse(string, scale, reverse);
    if(!result){
        g_stlDoc = null;
        g_drawingInfo = null;
        console.log("STL文件解析错误！");
        return;
    }
    g_stlDoc = stlDoc;
}

//绘制
function render(gl, prog, model){
    if(g_stlDoc !== null){
        g_drawingInfo = onReadComplete(gl, model, g_stlDoc);
        g_stlDoc = null;
    }

    if(!g_drawingInfo) return;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    modelViewMatrix = lookAt(0.0,400.0,200.0, 0,0,0, 0,1,0);
    projectionMatrix = perspective(45, canvas.width/canvas.height, 0.1, 10000);

    var nor = inverse4(modelViewMatrix);
    normalMatrix = transpose(nor);

    gl.uniformMatrix4fv(prog.modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(prog.projectionMatrixLoc, false, flatten(projectionMatrix));
    gl.uniformMatrix4fv(prog.normalMatrixLoc, false, flatten(normalMatrix));

    gl.drawElements(gl.TRIANGLES, g_drawingInfo.indices.length, gl.UNSIGNED_SHORT, 0);

}

function onReadComplete(gl, model, stlDoc){
    //获取模型顶点坐标和法矢量
    var drawingInfo = stlDoc.getDrawingInfo();

    //将数据写入缓冲区
    gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.vertices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.normals, gl.STATIC_DRAW);

    //将索引绑定到缓冲区对象
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, drawingInfo.indices, gl.STATIC_DRAW);

    return drawingInfo;
}

//###############################################################################
//STLParser
var STLDoc = function (fileName){
    this.fileName = fileName;
    this.objects = [];
    this.vertices = [];
    this.normals = [];
};

//解析STL文件
STLDoc.prototype.parse = function(str, scale, reverse){
    var lines = str.split('\n');//将文本拆解为一行一行，存于lines中
    lines.push(null);//数组结尾
    var index = 0;//初始化索引，index为文本行数

    var line;
    var sp = new StringParser();

    while((line = lines[index++]) !== null){
        sp.init(line);
        var command = sp.getWord();
        if (command==null) continue;

        switch (command) {
            case 'solid':
                continue;
            case 'outer':
                continue;
            case 'facet':
            case 'normal':
                var normal = this.parseNormal(sp);
                this.normals.push(normal);
                continue;
            case 'vertex':
                var vertex = this.parseVertex(sp, scale);
                this.vertices.push(vertex);
                continue;
            case 'endloop':
            case 'endfacet':
                continue;
        }
    }

};

STLDoc.prototype.parseObjectName = function(sp) {
    var name = sp.getWord();
    return (new STLObject(name));
};

STLDoc.prototype.parseNormal = function(sp){
    var x = sp.getFloat();
    var y = sp.getFloat();
    var z = sp.getFloat();

    return (new Normal(x, y, z));
};

STLDoc.prototype.parseVertex = function(sp, scale){
    var x = sp.getFloat() * scale;
    var y = sp.getFloat() * scale;
    var z = sp.getFloat() * scale;

    return (new Vertex(x, y, z));
};


var Normal = function (x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
};

var Vertex = function (x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
}

//########################################################################
//STLObject object
var STLObject = function(name){
    this.name = name;
    this.faces = [];
    this.numIndices = 0;
};

STLObject.prototype.addFace = function(face){
    this.faces.push(face);
    this.numIndices += face.numIndices;
};

//########################################################################
//Face Object
var Face = function(objectName) {
    this.objectName = objectName;
    if(objectName == null) this.objectName = "";
    this.vIndices = [];
    this.nIndices = [];
};

//DrawingInfo object

var DrawingInfo = function(vertices, normals, indices) {
    this.vertices = vertices;
    this.normals = normals;
    this.indices = indices;
};




//########################################################################
//constructor
function StringParser(str){
    this.str;
    this.index;
    this.init(str);
}

StringParser.prototype.init = function(str){
    this.str = str;
    this.index = 0;
};
//忽略分隔符
StringParser.prototype.skipDelimiters = function(){
    for(var i = this.index, len = this.str.length; i<len; i++){
        var c = this.str.charAt(i);
        if(c=='\t' || c==' ' || c=='(' || c==')' || c=='"') continue;
        break;
    }
    this.index = i;
};

StringParser.prototype.skipToNextWord = function(){
    this.skipDelimiters();
    var n = getWordLength(this.str, this.index);
    this.index += (n + 1);
};

StringParser.prototype.getWord = function(){
    this.skipDelimiters();
    var n = getWordLength(this.str, this.index);
    if(n == 0) return null;

    //str.substr(s, l)方法可在字符串中抽取从s下标开始的指定数目的字符
    var word = this.str.substr(this.index, n);
    this.index += (n+1);

    return word;
};

//获取整数
StringParser.prototype.getInt = function(){
    return parseInt(this.getWord());
};
//获取浮点数
StringParser.prototype.getFloat = function(){
    return parseFloat(this.getWord());
};

function getWordLength(str, start){
    for(var i = start, len = str.length; i < len; i++){
        var c = str.charAt(i);
        if (c == '\t'|| c == ' ' || c == '(' || c == ')' || c == '"')
            break;
    }
    return i-start;
}
