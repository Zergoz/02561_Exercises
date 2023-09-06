window.onload = function init()
{
    var canvas = document.getElementById("webgl-canvas");
    var gl = canvas.getContext("webgl");
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var vertices = [ vec2(0.0, 0.0), vec2(1.0, 0.0), vec2(1, 1) ];
    //var vBuffer = gl.createBuffer();
    //gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    //gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    var max_verts = 1000;
    var index = 0; var numPoints = 0;
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, max_verts*sizeof['vec2'], gl.STATIC_DRAW);


    var vPosition = gl.getAttribLocation(program, "a_Position");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.drawArrays(gl.POINTS, 0, vertices.length);
    
    canvas.addEventListener("click", function(ev) {
        var t = vec2(-1 + 2*ev.clientX/canvas.width,
        -1 + 2*(canvas.height-ev.clientY)/canvas.height);
        gl.bufferSubData(gl.ARRAY_BUFFER, index*sizeof['vec2'], t);
        numPoints = Math.max(numPoints, ++index); index %= max_verts;
    });

    render(gl, index, canvas)
    
        // mousepos = vec2(2*ev.clientX/canvas.width - 1, 2*(canvas.height - ev.clientY - 1)/canvas.height - 1);
}   
function render(gl, index, canvas) {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, index);
    window.requestAnimationFrame(render, canvas);
}