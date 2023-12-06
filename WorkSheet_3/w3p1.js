window.onload = function init()
{
    var canvas = document.getElementById("webgl-canvas");
    var gl = canvas.getContext("webgl");
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var numVertices = 36;

    var m = lookAt(vec3(0,0,0), vec3(0.5,0.5,-0.5), vec3(-0.5,0.5,-0.5));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "view"), false, flatten(m));

    var cubeColors = [
        [ 0.0, 0.0, 0.0, 1.0 ], // black
        [ 1.0, 0.0, 0.0, 1.0 ], // red
        [ 1.0, 1.0, 0.0, 1.0 ], // yellow
        [ 0.0, 1.0, 0.0, 1.0 ], // green
        [ 0.0, 0.0, 1.0, 1.0 ], // blue
        [ 1.0, 0.0, 1.0, 1.0 ], // magenta
        [ 1.0, 1.0, 1.0, 1.0 ], // white
        [ 0.0, 1.0, 1.0, 1.0 ] // cyan
    ];

    var cubeVertices = [
        vec4(-0.5, -0.5, 0.5, 1),
        vec4(-0.5, 0.5, 0.5, 1),
        vec4(0.5, 0.5, 0.5, 1),
        vec4(0.5, -0.5, 0.5, 1),
        vec4(-0.5, -0.5, -0.5, 1),
        vec4(-0.5, 0.5, -0.5, 1),
        vec4(0.5, 0.5, -0.5, 1),
        vec4(0.5, -0.5, -0.5, 1)
    ];
    
    var wireIndices = new Uint32Array([
        0, 1, 1, 2, 2, 3, 3, 0, // front
        2, 3, 3, 7, 7, 6, 6, 2, // right
        0, 3, 3, 7, 7, 4, 4, 0, // down
        1, 2, 2, 6, 6, 5, 5, 1, // up
        4, 5, 5, 6, 6, 7, 7, 4, // back
        0, 1, 1, 5, 5, 4, 4, 0 // left
    ]);
    
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cubeVertices), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "a_Position");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cubeColors), gl.STATIC_DRAW);

    var cPosition = gl.getAttribLocation(program, "a_Color");
    gl.vertexAttribPointer(cPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(cPosition);
    
    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);    
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(wireIndices), gl.STATIC_DRAW);

    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawElements(gl.LINES, numVertices, gl.UNSIGNED_BYTE, 0);
    }
    
    render();
}   