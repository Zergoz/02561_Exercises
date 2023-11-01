window.onload = function init()
{
    var canvas = document.getElementById("webgl-canvas");
    var gl = canvas.getContext("webgl");
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(gl.program);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.frontFace(gl.CCW);
    
    var view = lookAt(vec3(0,0,2), vec3(0,0,0), vec3(0,1,0));
    var P = perspective(90, 1, 0.1, 100);
    
    var filename = "../pine/Suzanne.obj";
    var scale = 1;
    var model = initObject(gl, filename, scale);
    
    gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, "projection"), false, flatten(P));
    gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, "view"), false, flatten(view));
    


    function tick() {
        render(gl, view, model);
        if(!g_drawingInfo) {
            requestAnimationFrame(tick);
        }
    }
    tick();

}

function initObject(gl, obj_filename, scale) {
    if (!initShaders(gl, "vertex-shader", "fragment-shader")) {
        console.log('Failed to initialize shaders.');
        return;
    }
    
    // Get the storage locations of attribute and uniform variables

    gl.program.a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    gl.program.a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    gl.program.a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    
    // Prepare empty buffer objects for vertex coordinates, colors, and normals
    var model = initVertexBuffers(gl);
    
    // Start reading the OBJ file
    readOBJFile(obj_filename, gl, model, scale, true);
    
    return model;
}

// Create a buffer object and perform the initial configuration
function initVertexBuffers(gl, program) {
    var o = new Object();
    o.vertexBuffer = createEmptyArrayBuffer(gl, gl.program.a_Position, 3, gl.FLOAT);
    o.normalBuffer = createEmptyArrayBuffer(gl, gl.program.a_Normal, 3, gl.FLOAT);
    o.colorBuffer = createEmptyArrayBuffer(gl, gl.program.a_Color, 4, gl.FLOAT);
    o.indexBuffer = gl.createBuffer();
    return o;
}

// Create a buffer object, assign it to attribute variables, and enable the assignment
function createEmptyArrayBuffer(gl, a_attribute, num, type) {
    var buffer = gl.createBuffer(); // Create a buffer object
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute); // Enable the assignment
    
    return buffer;
}

// Read a file
function readOBJFile(fileName, gl, model, scale, reverse) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.readyState === 4 && request.status !== 404) {
            onReadOBJFile(request.responseText, fileName, gl, model, scale, reverse);
        }
    }
    request.open('GET', fileName, true); // Create a request to get file
    request.send(); // Send the request
}

var g_objDoc = null; // The information of OBJ file
var g_drawingInfo = null; // The information for drawing 3D model

// OBJ file has been read
function onReadOBJFile(fileString, fileName, gl, o, scale, reverse) {
    var objDoc = new OBJDoc(fileName); // Create a OBJDoc object
    var result = objDoc.parse(fileString, scale, reverse);
    if (!result) {
        g_objDoc = null; g_drawingInfo = null;
        console.log("OBJ file parsing error.");
        return;
    }
    g_objDoc = objDoc;
} 

// OBJ File has been read completely
function onReadComplete(gl, model, objDoc) {
    // Acquire the vertex coordinates and colors from OBJ file
    var drawingInfo = objDoc.getDrawingInfo();

    // Write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.vertices,gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.normals, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, model.colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.colors, gl.STATIC_DRAW);

    // Write the indices to the buffer object
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, drawingInfo.indices, gl.STATIC_DRAW);
    
    return drawingInfo;
}

function render(gl, view, model)
{
    if (!g_drawingInfo && g_objDoc && g_objDoc.isMTLComplete()) {
        // OBJ and all MTLs are available
        g_drawingInfo = onReadComplete(gl, model, g_objDoc);
    }
    if (!g_drawingInfo) { 
        return;
    }
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);    
    gl.drawElements(gl.TRIANGLES, g_drawingInfo.indices.length, gl.UNSIGNED_SHORT, 0);
}