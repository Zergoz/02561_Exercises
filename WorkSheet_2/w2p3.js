window.onload = function init()
{
    var canvas = document.getElementById("webgl-canvas");
    var gl = canvas.getContext("webgl");
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    
    // Variables (somewhat primitive)
    var max_verts = 1000;
    var index = 0; var numTriangles = 0; var start = [ 0 ];
    var drawMode = 0;
    var record = [ 0 ];

    var clickBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, clickBuffer);    
    gl.bufferData(gl.ARRAY_BUFFER, max_verts*sizeof['vec2'], gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "a_Position");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, max_verts*sizeof['vec4'], gl.STATIC_DRAW);
    
    var colorPosition = gl.getAttribLocation(program, "a_Color");
    gl.vertexAttribPointer(colorPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorPosition);
    
    var colorMenu = document.getElementById("ColorMenu");
    var clearMenu = document.getElementById("ClearMenu");
    var colors = [
        vec4(0, 0, 0, 1), // Black
        vec4(0.953, 0.973, 1, 1), // AliceBlue
        vec4(0.71, 0.984, 0.243, 1), // Chartreuse
        vec4(0.663, 0.525, 0.13, 1), // DarkGoldenRod
        vec4(0.733, 0.714, 0.44, 1), // DarkKhaki
        vec4(0.843, 0.188, 0.565, 1), // DeepPink
        vec4(0.863, 0.408, 0.29, 1), // Tomato
        vec4(0.392, 0.584, 0.929, 1) // CornFlowerBlue
    ];

    var clearButton = document.getElementById("ClearButton");
    clearButton.addEventListener("click", function(ev) {
        var bgcolor = colors[clearMenu.selectedIndex];
        gl.clearColor(bgcolor[0], bgcolor[1], bgcolor[2], bgcolor[3]);
        numTriangles = 0; index = 0;
        render(gl, numTriangles, start);
    });

    var pointButton = document.getElementById("PointButton");
    pointButton.addEventListener("click", function(ev) {
        drawMode = 0;
    });

    var triangleButton = document.getElementById("TriangleButton");
    triangleButton.addEventListener("click", function(ev) {
        drawMode = 1;
    });

    canvas.addEventListener("click", function(ev) {
        switch (drawMode) {
            case 0:
                // Color stuff
                gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
                var t = flatten(vec4(colors[colorMenu.selectedIndex]));
                for (var i = 0; i < 4; ++i) {
                    gl.bufferSubData(gl.ARRAY_BUFFER, (index+i)*sizeof['vec4'], t);
                }
                
                // Position stuff
                gl.bindBuffer(gl.ARRAY_BUFFER, clickBuffer);
                var bbox = ev.target.getBoundingClientRect();
                var tl = vec2(2*(ev.clientX - bbox.left)/canvas.width - 1.02, 2*(canvas.height - ev.clientY + bbox.top - 1)/canvas.height - 0.98);
                gl.bufferSubData(gl.ARRAY_BUFFER, (index)*sizeof['vec2'], flatten(tl));
                var tr = vec2(2*(ev.clientX - bbox.left)/canvas.width - 0.98, 2*(canvas.height - ev.clientY + bbox.top - 1)/canvas.height - 0.98);
                gl.bufferSubData(gl.ARRAY_BUFFER, (index+1)*sizeof['vec2'], flatten(tr));
                var bl = vec2(2*(ev.clientX - bbox.left)/canvas.width - 1.02, 2*(canvas.height - ev.clientY + bbox.top - 1)/canvas.height - 1.02);
                gl.bufferSubData(gl.ARRAY_BUFFER, (index+2)*sizeof['vec2'], flatten(bl));
                var br = vec2(2*(ev.clientX - bbox.left)/canvas.width - 0.98, 2*(canvas.height - ev.clientY + bbox.top - 1)/canvas.height - 1.02);
                gl.bufferSubData(gl.ARRAY_BUFFER, (index+3)*sizeof['vec2'], flatten(br));

                start[numTriangles] = index;
                start[numTriangles + 1] = index + 1;
                index += 4;
                numTriangles += 2;
            case 1:
                /*
                // Color stuff
                gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
                var t = flatten(vec4(colors[colorMenu.selectedIndex]));
                gl.bufferSubData(gl.ARRAY_BUFFER, (index)*sizeof['vec4'], t);
                
                // Position stuff
                gl.bindBuffer(gl.ARRAY_BUFFER, clickBuffer);
                var bbox = ev.target.getBoundingClientRect();
                var tl = vec2(2*(ev.clientX - bbox.left)/canvas.width - 1.02, 2*(canvas.height - ev.clientY + bbox.top - 1)/canvas.height - 0.98);
                gl.bufferSubData(gl.ARRAY_BUFFER, (index)*sizeof['vec2'], flatten(tl));
                var tr = vec2(2*(ev.clientX - bbox.left)/canvas.width - 0.98, 2*(canvas.height - ev.clientY + bbox.top - 1)/canvas.height - 0.98);
                gl.bufferSubData(gl.ARRAY_BUFFER, (index+1)*sizeof['vec2'], flatten(tr));
                var bl = vec2(2*(ev.clientX - bbox.left)/canvas.width - 1.02, 2*(canvas.height - ev.clientY + bbox.top - 1)/canvas.height - 1.02);
                gl.bufferSubData(gl.ARRAY_BUFFER, (index+2)*sizeof['vec2'], flatten(bl));
                var br = vec2(2*(ev.clientX - bbox.left)/canvas.width - 0.98, 2*(canvas.height - ev.clientY + bbox.top - 1)/canvas.height - 1.02);
                gl.bufferSubData(gl.ARRAY_BUFFER, (index+3)*sizeof['vec2'], flatten(br));
                
                start[numTriangles] = index;
                start[numTriangles + 1] = index + 1;
                index += 4;
                numTriangles += 2;
                */
        }
        render(gl, numTriangles, start);
        });
    
}
function render(gl, numTriangles, start) {
    gl.clear(gl.COLOR_BUFFER_BIT);
    for (var i = 0; i < numTriangles; ++i) {
        gl.drawArrays(gl.TRIANGLES, start[i], 3);
    }
}
