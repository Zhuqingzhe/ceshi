/**
 * Created by wjh on 2017/10/31.
 */

//用AJAX以字符串的方式得到着色器文件
function loadFileAJAX(fileName){
    var xhr = new XMLHttpRequest(),
        okStatus = document.location.protocol === 'file'? 0 : 200;
    xhr.async = true;
    xhr.open('GET',fileName,false);
    xhr.send(null);
    return xhr.status == okStatus ? xhr.responseText : null;
}

function initShaders(gl, vShaderName, fShaderName){

    function getShader(gl,shaderName,type){
        var shader = gl.createShader(type),//创建着色器
            shaderScript = loadFileAJAX(shaderName);//加载着色器文件

        if(!shaderScript){
            console.log("找不到着色器文件：" + shaderName);
        }

        gl.shaderSource(shader,shaderScript);//附加着色器源文件到Shader
        gl.compileShader(shader);//编译着色器程序

        //判断着色器是是否编译成功
        if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){

            console.log(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }

    var vertexShader = getShader(gl, vShaderName, gl.VERTEX_SHADER),
        fragmentShader = getShader(gl, fShaderName, gl.FRAGMENT_SHADER),

        program = gl.createProgram(); //  生成程序对象

    //向程序对象分配着色器
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    //链接着色器
    gl.linkProgram(program);

    //判断着色器是否连接成功
    if(!gl.getProgramParameter(program,gl.LINK_STATUS)){
        console.log("初始化着色器失败");
        return null;
    }
   // gl.useProgram(program);程序设置为有效

    //返回程序对象
    return program;

}


