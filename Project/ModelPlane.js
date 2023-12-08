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


    // Cube variables
    var numCubes = 8; // Body, Wings, Horizontal Stabilizer, Vertical Stabilizer, Right Aileron, Left Aileron, Elevator, Rudder = 8 
    var cubeSize = 36;
    const epsilon = .0001;

    // Matrices, axes and angles for rotation of the whole plane
    var R = mat4();
    var obj_axis = vec4(1.0, 0.0, 0.0, 0.0);
    var obj_up = vec4(0.0, 1.0, 0.0, 0.0);
    var Rplane = mat4();
    var rotationX = 0; 
    var rotationY = 0;
    var rotationZ = 0;
    

    // Model and perspective matrices and start uploads
    var m = lookAt(vec3(1.0,1.0,-2.0), vec3(0.0,0.0,0.0), vec3(0,1,0));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "view"), false, flatten(m));

    var P = perspective(70, 1, 1, 5);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "perspective"), false, flatten(P));


    // Rudder stuff
    var transRudder = translate(0.0, 0.0, -0.9);
    var thetaRudder = 0;
    var RRudder = rotateY(thetaRudder);
    var untransRudder = translate(0.0, 0.0, 0.9);

    // Elevator stuff
    var transElevator = translate(0.0, 0.0, -0.9);
    var thetaElevator = 0;
    var RElevator = rotateX(thetaElevator);
    var untransElevator = translate(0.0, 0.0, 0.9);

    // Aileron stuff
    var transAileron = translate(0.0, 0.0, 0.0);
    var thetaAileron = 0;
    var RAileronRight = rotateX(thetaAileron);
    var RAileronLeft = rotateX(-thetaAileron);
    var untransAileron = translate(0.0, 0.0, 0.0);

    // Colors
    const bodyColor = [ 0.5, 0.5, 0.5, 1.0 ]; // dark gray
    const wingColor = [ 0.8, 0.8, 0.8, 1.0 ]; // light gray
    const flapColor = [ 0.0, 0.0, 0.0, 1.0 ]; // black
    
    // --------------------------------------------------------------------- //
    // The comments next to the vertices are based on the starting posititon //
    // --------------------------------------------------------------------- //
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
        -1+epsilon, -0.025, 0.1, 1, // back, bottom, left
        -1+epsilon, 0.025, 0.1, 1, // back, top, left
        0, 0.025, 0.1, 1, // back, top, right
        0, -0.025, 0.1, 1, // back, bottom, right
        -1+epsilon, -0.025, 0.0, 1, // front, bottom, left
        -1+epsilon, 0.025, 0.0, 1, // front, top, left
        0, 0.025, 0.0, 1, // front, top, right
        0, -0.025, 0.0, 1 // front, bottom, right
    ];

    const leftAileronVertices = [
        0, -0.025, 0.1, 1, // back, bottom, left
        0, 0.025, 0.1, 1, // back, top, left
        1-epsilon, 0.025, 0.1, 1, // back, top, right
        1-epsilon, -0.025, 0.1, 1, // back, bottom, right
        0, -0.025, 0.0, 1, // front, bottom, left
        0, 0.025, 0.0, 1, // front, top, left
        1-epsilon, 0.025, 0.0, 1, // front, top, right
        1-epsilon, -0.025, 0.0, 1 // front, bottom, right
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
        -0.4+epsilon, -0.025, 1-epsilon, 1, // back, bottom, left
        -0.4+epsilon, 0.025, 1-epsilon, 1, // back, top, left
        0.4-epsilon, 0.025, 1-epsilon, 1, // back, top, right
        0.4-epsilon, -0.025, 1-epsilon, 1, // back, bottom, right
        -0.4+epsilon, -0.025, 0.9, 1, // front, bottom, left
        -0.4+epsilon, 0.025, 0.9, 1, // front, top, left
        0.4-epsilon, 0.025, 0.9, 1, // front, top, right
        0.4-epsilon, -0.025, 0.9, 1 // front, bottom, right
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
        -0.025, 0.0, 1-epsilon, 1, // back, bottom, left
        -0.025, 0.4-epsilon, 1-epsilon, 1, // back, top, left
        0.025, 0.4-epsilon, 1-epsilon, 1, // back, top, right
        0.025, 0.0, 1-epsilon, 1, // back, bottom, right
        -0.025, 0.0, 0.9, 1, // front, bottom, left
        -0.025, 0.4-epsilon, 0.9, 1, // front, top, left
        0.025, 0.4-epsilon, 0.9, 1, // front, top, right
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
    indexArray = cubeIndicesIncrease(aIncrease(cubeIndices, numCubes), numCubes, cubeSize);
    
    // Event listeners
    var rudderSlider = document.getElementById("Rudder");
    rudderSlider.addEventListener("input", function(ev) {
        thetaRudder = ev.currentTarget.value;
        RRudder = rotateY(thetaRudder);
    });
    var elevatorSlider = document.getElementById("Elevator");
    elevatorSlider.addEventListener("input", function(ev) {
        thetaElevator = ev.currentTarget.value;
        RElevator = rotateX(thetaElevator);
    });
    var aileronSlider = document.getElementById("Aileron");
    aileronSlider.addEventListener("input", function(ev) {
        thetaAileron = ev.currentTarget.value;
        RAileronRight = rotateX(thetaAileron);
        RAileronLeft = rotateX(-thetaAileron);
    });

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
        // Clear
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Rotation of the whole plane
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "Rplane"), false, flatten(Rplane)); 
                        
        // Immovable objects
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "trans"), false, flatten(mat4()));
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "Rcube"), false, flatten(mat4()));
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "untrans"), false, flatten(mat4()));
        gl.drawElements(gl.TRIANGLES, cubeSize*4, gl.UNSIGNED_BYTE, 0);
        
        // Elevator
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "trans"), false, flatten(transElevator));        
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "Rcube"), false, flatten(RElevator));
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "untrans"), false, flatten(untransElevator));
        gl.drawElements(gl.TRIANGLES, cubeSize, gl.UNSIGNED_BYTE, cubeSize*6);
        
        // Rudder
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "trans"), false, flatten(transRudder));        
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "Rcube"), false, flatten(RRudder));
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "untrans"), false, flatten(untransRudder));
        gl.drawElements(gl.TRIANGLES, cubeSize, gl.UNSIGNED_BYTE, cubeSize*7);
        
        // Ailerons
        // Right
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "trans"), false, flatten(transAileron));        
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "Rcube"), false, flatten(RAileronRight));
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "untrans"), false, flatten(untransAileron));
        gl.drawElements(gl.TRIANGLES, cubeSize, gl.UNSIGNED_BYTE, cubeSize*4);
        
        // Left
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "Rcube"), false, flatten(RAileronLeft));
        gl.drawElements(gl.TRIANGLES, cubeSize, gl.UNSIGNED_BYTE, cubeSize*5);
    }
        
    function animate() 
    {
        // Update rotation angles based on elevator, rudder and ailerons
        rotationX = thetaElevator/45;
        rotationY = thetaRudder/45;
        rotationZ = thetaAileron/45;

        // Compute third basis vector
        var obj_right = cross(obj_axis, obj_up);

        // Compute entire rotation of local coordinate system
        R = mult(R, rotate(rotationX, obj_axis));
        R = mult(R, rotate(rotationY, obj_up));
        R = mult(R, rotate(rotationZ, obj_right));

        // Rotate local coordinate system
        obj_axis = mult(R, obj_axis);
        obj_up = mult(R, obj_up);
        obj_right = cross(obj_axis, obj_up);
        
        // Create matrix for change of basis
        Rplane = mat4(obj_axis[0], obj_up[0], obj_right[0], 0.0,
                     obj_axis[1], obj_up[1], obj_right[1], 0.0,
                     obj_axis[2], obj_up[2], obj_right[2], 0.0,
                     0.0, 0.0, 0.0, 1.0);
        
        // Reset rotation to counter act conservation of momentum
        R = mat4();

        render(); requestAnimationFrame(animate);
    }
    animate();
}   

// Create new array by duplicating specified array an amount of times
function aIncrease (array, amount) 
{
    temp = [];
    for (var i = 0; i < amount; i++) 
    { temp = temp.concat(array); }
    return temp;
}

// Helper function to reuse a single array of cube indices for each cube
function cubeIndicesIncrease (array, numCubes, cubeSize) 
{
    temp = [];
    for (var i = 0; i < numCubes; i++) 
    {
        for (var j = 0; j < cubeSize; j++) 
        {
            temp.push(array[(i*cubeSize)+j]+(i*8));
        }
    }
    return temp;
}