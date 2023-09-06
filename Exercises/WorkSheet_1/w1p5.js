window.onload = function init()
{
    var canvas = document.getElementById("webgl-canvas");
    var gl = canvas.getContext("webgl");
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var pVertices = [ vec2(0.0, 0.0) ];
    var cVertices = [ vec3(0.0, 0.0, 0.0) ];
    var r = 0.5;
    var n = 50;
    
    for (let i = 0; i <= n; i++) {
        theta = (2*Math.PI*i)/n;
        perifey = vec2(r*Math.cos(theta), r*Math.sin(theta));
        pVertices.push(perifey);
        cVertices.push(vec3(Math.random(), Math.random(), Math.random()));
    }
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

    var trans = gl.getUniformLocation(program, "translation");
    var v = vec2(0.0, 0.0);
    var w = vec2(0.0, 0.01);
    function animate() {
        v = add(v,w);
        w = mult(vec2(0, Math.sign(1-r-length(v))), w);
        gl.uniform2f(trans, v[0], v[1]);
        render(gl, pVertices.length); requestAnimationFrame(animate);
    }
    animate();
}
function render(gl, numPoints)
{
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, numPoints);
}