window.onload = function init()
{
    var canvas = document.getElementById("webgl-canvas");
    var gl = canvas.getContext("webgl");
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var pVertices = [ vec2(0.5, -0.5), vec2(-0.5, -0.5), vec2(0.5, 0.5), vec2(-0.5, 0.5) ];
    var cVertices = [ vec3(1.0, 0.0, 0.0), vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0), vec3(0.0, 0.0, 1.0) ]
    var pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pVertices), gl.STATIC_DRAW);

    var pPosition = gl.getAttribLocation(program, "a_Position");
    gl.vertexAttribPointer(pPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(pPosition);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cVertices), gl.STATIC_DRAW);

    var cPosition = gl.getAttribLocation(program, "a_Color");
    gl.vertexAttribPointer(cPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(cPosition);

    var betaLoc = gl.getUniformLocation(program, "beta");
    var beta = 0.0;
    function animate() {
    beta -= 0.01; gl.uniform1f(betaLoc, beta);
    render(gl, pVertices.length); requestAnimationFrame(animate);
    }
    animate();
}
function render(gl, numPoints)
{
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, numPoints);
}