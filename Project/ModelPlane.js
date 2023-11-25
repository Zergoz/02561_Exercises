window.onload = function init()
{   
    // Initialization of canvas
    var canvas = document.getElementById("webgl-canvas");
    var gl = canvas.getContext("webgl");
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.frontFace(gl.CCW);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);


    // Variables
    var numCubes = 8; // Body, Wings, Horizontal Stabilizer, Vertical Stabilizer, Right Aileron, Left Aileron, Elevator, Rudder = 8 
    var numVertices = (36*numCubes); // 36 vertices for each cube
    var rotationY = 0;
    

    // Matrices
    var T = translate(0.5, 0.5, 0.5);

    var m = lookAt(vec3(0,0,-2), vec3(0.0,0.0,0.0), vec3(0,1,0));

    var P = perspective(90, 1, 1, 5);

    var Ry = rotateY(rotationY);

    var Rx = mult(rotateX(45), Ry);

    var R0 = mat4();
    
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "view"), false, flatten(m));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "perspective"), false, flatten(P));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "rotation"), false, flatten(R0));
    

    // Colors
    const bodyColor = [ 0.5, 0.5, 0.5, 1.0 ]; // dark gray
    const wingColor = [ 0.8, 0.8, 0.8, 1.0 ]; // light gray
    const flapColor = [ 0.0, 0.0, 0.0, 1.0 ]; // black
    
    // ----------------------------------------------------------------- //
    // The comments next to the vertices refer to the starting posititon //
    // ----------------------------------------------------------------- //
    // Body
    const bodyVertices = [
        -0.125, -0.125, 1, 1, // back, bottom, left
        -0.125, 0.125, 1, 1, // back, top, left
        0.125, 0.125, 1, 1, // back, top, right
        0.125, -0.125, 1, 1, // back, bottom, right
        -0.125, -0.125, -1, 1, // front, bottom, left
        -0.125, 0.125, -1, 1, // front, top, left
        0.125, 0.125, -1, 1, // front, top, right
        0.125, -0.125, -1, 1 // front, bottom, right
    ];

    // Wings
    const wingVertices = [
        -1, -0.025, 0.0, 1, // back, bottom, left
        -1, 0.025, 0.0, 1, // back, top, left
        1, 0.025, 0.0, 1, // back, top, right
        1, -0.025, 0.0, 1, // back, bottom, right
        -1, -0.025, -0.4, 1, // front, bottom, left
        -1, 0.025, -0.4, 1, // front, top, left
        1, 0.025, -0.4, 1, // front, top, right
        1, -0.025, -0.4, 1 // front, bottom, right
    ];

    const rightAileronVertices = [
        -1, -0.025, 0.1, 1, // back, bottom, left
        -1, 0.025, 0.1, 1, // back, top, left
        0, 0.025, 0.1, 1, // back, top, right
        0, -0.025, 0.1, 1, // back, bottom, right
        -1, -0.025, 0.0, 1, // front, bottom, left
        -1, 0.025, 0.0, 1, // front, top, left
        0, 0.025, 0.0, 1, // front, top, right
        0, -0.025, 0.0, 1 // front, bottom, right
    ];

    const leftAileronVertices = [
        0, -0.025, 0.1, 1, // back, bottom, left
        0, 0.025, 0.1, 1, // back, top, left
        1, 0.025, 0.1, 1, // back, top, right
        1, -0.025, 0.1, 1, // back, bottom, right
        0, -0.025, 0.0, 1, // front, bottom, left
        0, 0.025, 0.0, 1, // front, top, left
        1, 0.025, 0.0, 1, // front, top, right
        1, -0.025, 0.0, 1 // front, bottom, right
    ];

    // Stabilizers
    const horiStabVertices = [
        -0.4, -0.025, 0.9, 1, // back, bottom, left
        -0.4, 0.025, 0.9, 1, // back, top, left
        0.4, 0.025, 0.9, 1, // back, top, right
        0.4, -0.025, 0.9, 1, // back, bottom, right
        -0.4, -0.025, 0.8, 1, // front, bottom, left
        -0.4, 0.025, 0.8, 1, // front, top, left
        0.4, 0.025, 0.8, 1, // front, top, right
        0.4, -0.025, 0.8, 1 // front, bottom, right
    ];

    const elevatorVertices = [
        -0.4, -0.025, 0.99, 1, // back, bottom, left
        -0.4, 0.025, 0.99, 1, // back, top, left
        0.4, 0.025, 0.99, 1, // back, top, right
        0.4, -0.025, 0.99, 1, // back, bottom, right
        -0.4, -0.025, 0.9, 1, // front, bottom, left
        -0.4, 0.025, 0.9, 1, // front, top, left
        0.4, 0.025, 0.9, 1, // front, top, right
        0.4, -0.025, 0.9, 1 // front, bottom, right
    ];

    const vertiStabVertices = [
        -0.025, 0.0, 0.9, 1, // back, bottom, left
        -0.025, 0.4, 0.9, 1, // back, top, left
        0.025, 0.4, 0.9, 1, // back, top, right
        0.025, 0.0, 0.9, 1, // back, bottom, right
        -0.025, 0.0, 0.8, 1, // front, bottom, left
        -0.025, 0.4, 0.8, 1, // front, top, left
        0.025, 0.4, 0.8, 1, // front, top, right
        0.025, 0.0, 0.8, 1 // front, bottom, right
    ];

    const rudderVertices = [
        -0.025, 0.0, 0.99, 1, // back, bottom, left
        -0.025, 0.4, 0.99, 1, // back, top, left
        0.025, 0.4, 0.99, 1, // back, top, right
        0.025, 0.0, 0.99, 1, // back, bottom, right
        -0.025, 0.0, 0.9, 1, // front, bottom, left
        -0.025, 0.4, 0.9, 1, // front, top, left
        0.025, 0.4, 0.9, 1, // front, top, right
        0.025, 0.0, 0.9, 1 // front, bottom, right
    ];

    // General indicies for a cube
    const cubeIndices = [
        1, 0, 3,
        3, 2, 1,
        2, 3, 7,
        7, 6, 2,
        3, 0, 4,
        4, 7, 3,
        6, 5, 1,
        1, 2, 6,
        4, 5, 6,
        6, 7, 4,
        5, 4, 0,
        0, 1, 5
    ];
    
    // Making big array for vertices
    vertexArray = bodyVertices.concat(wingVertices);
    vertexArray = vertexArray.concat(horiStabVertices);
    vertexArray = vertexArray.concat(vertiStabVertices);
    vertexArray = vertexArray.concat(rightAileronVertices);
    vertexArray = vertexArray.concat(leftAileronVertices);
    vertexArray = vertexArray.concat(elevatorVertices);
    vertexArray = vertexArray.concat(rudderVertices);

    // Making big array for colors
    colorArray = aIncrease(bodyColor, 8).concat(aIncrease(wingColor, 24));
    colorArray = colorArray.concat(aIncrease(flapColor, 32));

    // Making big array for indices
    indexArray = cubeIndicesIncrease(aIncrease(cubeIndices, numCubes), numCubes);
    
    
    // Buffer stuff
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "a_Position");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorArray), gl.STATIC_DRAW);

    var cPosition = gl.getAttribLocation(program, "a_Color");
    gl.vertexAttribPointer(cPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(cPosition);
    
    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indexArray), gl.STATIC_DRAW);
    
    function render() 
    {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "rotation"), false, flatten(Rx));
        gl.drawElements(gl.TRIANGLES, numVertices, gl.UNSIGNED_BYTE, 0);
    }
    
    animate();
    
    function animate() 
    {
        rotationY++;
        Ry = rotateY(rotationY);
        Rx = mult(rotateX(45), Ry);
        render(); requestAnimationFrame(animate);
    }
}   


function aIncrease (array, amount) 
{
    temp = [];
    for (var i = 0; i < amount; i++) 
    { temp = temp.concat(array); }
    return temp;
}

function cubeIndicesIncrease (array, numCubes) 
{
    temp = [];
    for (var i = 0; i < numCubes; i++) 
    {
        for (var j = 0; j < 36; j++) 
        {
            temp.push(array[(i*36)+j]+(i*8));
        }
    }
    return temp;
}