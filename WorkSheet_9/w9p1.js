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

    var textureReady = 0;
    
    var lightPos = vec4(0,1.5,1,0);
    gl.uniform4fv(gl.getUniformLocation(gl.program, "lightPos"), lightPos);

    var Le = vec4(1,1,1,1);
    gl.uniform4fv(gl.getUniformLocation(gl.program, "Le"), Le);

    var kd = 0.5;
    gl.uniform1f(gl.getUniformLocation(gl.program, "kd"), kd);

    var ka = 0.5;
    gl.uniform1f(gl.getUniformLocation(gl.program, "ka"), ka);

    var ks = 0.5;
    gl.uniform1f(gl.getUniformLocation(gl.program, "ks"), ks);

    var s = 100.0;
    gl.uniform1f(gl.getUniformLocation(gl.program, "s"), s);

    var view = mat4();
    gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, "view"), false, flatten(view));

    var P = perspective(90, 1, 0.1, 100);
    gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, "projection"), false, flatten(P));
    
    var T = translate(0, -1, -3);
    gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, "translate"), false, flatten(T));
    

    var image = document.createElement('img');
    image.crossorigin = 'anonymous';
    image.onload = function () { 
        var texture0 = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture0);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
        
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        textureReady = 1;
    };
    image.src = '../Assets/xamp23.png';
    
    var quadVertices = [
        vec3(-2, -1, -1),
        vec3(2, -1, -1),
        vec3(2, -1, -5),
        vec3(-2, -1, -5),
    ];

    var texCoords = [
        vec2(0.0, 0.0),
        vec2(1.0, 0.0),
        vec2(1.0, 1.0),
        vec2(0.0, 1.0)
    ];
    
    var filename = "../Assets/teapot.obj";
    var scale = 0.25;
    var model = initObject(gl, filename, scale);
    
    var texBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoords), gl.STATIC_DRAW);

    var vTexCoord = gl.getAttribLocation(gl.program, "a_Tex_Coord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);

    function tick() {
        if (textureReady > 0) {
            render(gl, model, quadVertices, T);
        }
        if(!g_drawingInfo || !(textureReady > 0)) {
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
    gl.bufferData(gl.ARRAY_BUFFER, (drawingInfo.vertices.length + 4)*sizeof['vec3'], gl.STATIC_DRAW);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, drawingInfo.vertices);
    gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.normals, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, model.colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.colors, gl.STATIC_DRAW);

    // Write the indices to the buffer object
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, drawingInfo.indices, gl.STATIC_DRAW);
    
    return drawingInfo;
}

function render(gl, model, quadVertices, T)
{
    if (!g_drawingInfo && g_objDoc && g_objDoc.isMTLComplete()) {
        // OBJ and all MTLs are available
        g_drawingInfo = onReadComplete(gl, model, g_objDoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, g_drawingInfo.vertices.length*sizeof['vec3'], flatten(quadVertices));
    }   
    if (!g_drawingInfo) { 
        return;
    }
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniform1i(gl.getUniformLocation(gl.program, "texMap"), 0);
    gl.uniform1i(gl.getUniformLocation(gl.program, "marmor"), 1);
    gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, "translate"), false, flatten(mat4()));
    gl.drawArrays(gl.TRIANGLE_FAN, g_drawingInfo.vertices.length, 4);
    
    gl.uniform1i(gl.getUniformLocation(gl.program, "marmor"), 0);
    gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, "translate"), false, flatten(T));
    gl.drawElements(gl.TRIANGLES, g_drawingInfo.indices.length, gl.UNSIGNED_SHORT, 0);
}