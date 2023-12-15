window.onload = function init()
{
    var canvas = document.getElementById("webgl-canvas");
    var gl = canvas.getContext("webgl");
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    gl.frontFace(gl.CCW);
    gl.enable(gl.DEPTH_TEST);
    
    var lightPos = vec3(0,2,0);
    var lightRot = 0.0;
    var toggle = 0;
    var numVertices = 4;
    var textureReady = 0;
    const epsilon = .001;
 
    var view = mat4();
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "view"), false, flatten(view));

    var P = perspective(90, 1, 1, 100);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "perspective"), false, flatten(P));

    var d = -3.0;
    var Mp = mat4(1,0,0,0,0,1,0,0,0,0,1,0,0,1.0/d,0,0);
    var T = translate(lightPos[0], lightPos[1], lightPos[2]);
    var nT = translate(-lightPos[0], -lightPos[1], -lightPos[2]);

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
        vec4(-2, -1, -1, 1),
        vec4(2, -1, -1, 1),
        vec4(2, -1, -5, 1),
        vec4(-2, -1, -5, 1),
        vec4(-1, -1, -2.5, 1),
        vec4(-1, 0, -2.5, 1),
        vec4(-1, 0, -3.5, 1),
        vec4(-1, -1, -3.5, 1),
        vec4(0.25, -0.5, -1.25, 1),
        vec4(0.75, -0.5, -1.25, 1),
        vec4(0.75, -0.5, -1.75, 1),
        vec4(0.25, -0.5, -1.75, 1),
    ];
    
    var texCoords = [
        vec2(0.0, 0.0),
        vec2(1.0, 0.0),
        vec2(1.0, 1.0),
        vec2(0.0, 1.0)
    ];

    // Texture stuff
    var texture1 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0]));

    // Buttons
    var rotateButton = document.getElementById("Rotate");
    rotateButton.addEventListener("click", function(ev) {
        toggle = !toggle;
    });

    // Buffer stuff
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(quadVertices), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "a_Position");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var texBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoords), gl.STATIC_DRAW);

    var vTexCoord = gl.getAttribLocation(program, "a_Tex_Coord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);
    
    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Floor
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "view"), false, flatten(view));
        gl.uniform1f(gl.getUniformLocation(program, "visibility"), 1.0);
        gl.depthFunc(gl.LESS);
        
        gl.uniform1i(gl.getUniformLocation(program, "texMap"), 0);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, numVertices);
        
        // Shadows
        var modView = mat4();
        modView = mult(modView, T);
        modView = mult(modView, Mp);
        modView = mult(modView, nT);
        modView[1][1] += epsilon;
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "view"), false, flatten(modView));
        gl.uniform1f(gl.getUniformLocation(program, "visibility"), 0.0);
        gl.depthFunc(gl.GREATER);
        
        gl.uniform1i(gl.getUniformLocation(program, "texMap"), 1);
        gl.drawArrays(gl.TRIANGLE_FAN, numVertices, numVertices);
        
        gl.drawArrays(gl.TRIANGLE_FAN, numVertices*2, numVertices);
        
        // Red quads
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "view"), false, flatten(view));
        gl.uniform1f(gl.getUniformLocation(program, "visibility"), 1.0);
        gl.depthFunc(gl.LESS);

        gl.uniform1i(gl.getUniformLocation(program, "texMap"), 1);
        gl.drawArrays(gl.TRIANGLE_FAN, numVertices, numVertices);
        
        gl.drawArrays(gl.TRIANGLE_FAN, numVertices*2, numVertices);
    }
    
    function tick() 
    {
        if (toggle) 
        {
            lightRot += 0.02;
            lightPos[0] = Math.sin(lightRot)*2
            lightPos[2] = Math.cos(lightRot)*2-2;

            T = translate(lightPos[0], lightPos[1], lightPos[2]);
            nT = translate(-lightPos[0], -lightPos[1], -lightPos[2]);
        }
        if (textureReady) {
            render();
        }
        requestAnimationFrame(tick);
    }
    tick();
}  

