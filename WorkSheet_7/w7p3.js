window.onload = function init()
{
    var canvas = document.getElementById("webgl-canvas");
    var gl = canvas.getContext("webgl");
    gl.clearColor(0, 0, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    gl.vBuffer = null;
    //gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.frontFace(gl.CCW);

    var lightPos = vec4(0,0,-1,0);
    //var Le = vec4(0,0,-1,1);
    var Ld = vec4(1,1,1,1);

    var orbitingRadius = -3;
    var orbitingAlpha = 0;
    var toggle = false;
    
    var numSubdivs = 7;
    var sphereVertices = initSphere();
    
    
    var eye = vec3(orbitingRadius * Math.sin(orbitingAlpha), 0, orbitingRadius * Math.cos(orbitingAlpha));

    var view = lookAt(eye, vec3(0.0,0.0,0.0), vec3(0,1,0));
    
    var P = perspective(90, 1, 1, 10);
    
    var R0 = mat4();

    var invView = inverse(view);

    var M_tex = mult(mat4(invView[0][0], invView[0][1], invView[0][2], 0, invView[1][0], invView[1][1], invView[1][2], 0, invView[2][0], invView[2][1], invView[2][2], 0, 0, 0, 0, 0), inverse(P));
     
    var sut = "ged";

    function initQuad(pointsArray) {
        var quadVertices = [
            vec4(-1, -1, 0.999, 1),
            vec4(1, -1, 0.999, 1),
            vec4(-1, 1, 0.999, 1),
            vec4(1, 1, 0.999, 1),
        ];
        for (var i = 0; i < quadVertices.length; ++i) {
            pointsArray.push(quadVertices[i]);
        }
    }
    
    
    function initSphere() 
    {
        var va = vec4(0.0, 0.0, 1.0, 1);
        var vb = vec4(0.0, 0.942809, -0.333333, 1);
        var vc = vec4(-0.816497, -0.471405, -0.333333, 1);
        var vd = vec4(0.816497, -0.471405, -0.333333, 1);
        var pointsArray = [];
        initQuad(pointsArray);
        tetrahedron(pointsArray, va, vb, vc, vd, numSubdivs);
        gl.deleteBuffer(gl.vBuffer);
        gl.vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
        return pointsArray.length
    }

    function tetrahedron(pointsArray, a, b, c, d, n)
    {
        divideTriangle(pointsArray, a, b, c, n);
        divideTriangle(pointsArray, d, c, b, n);
        divideTriangle(pointsArray, a, d, b, n);
        divideTriangle(pointsArray, a, c, d, n);
    }

    function divideTriangle(pointsArray, a, b, c, count)
    {
        if (count > 0) {
            var ab = normalize(mix(a, b, 0.5), true);
            var ac = normalize(mix(a, c, 0.5), true);
            var bc = normalize(mix(b, c, 0.5), true);
            divideTriangle(pointsArray, a, ab, ac, count - 1);
            divideTriangle(pointsArray, ab, b, bc, count - 1);
            divideTriangle(pointsArray, bc, c, ac, count - 1);
            divideTriangle(pointsArray, ab, bc, ac, count - 1);
        }
        else {
            triangle(pointsArray, a, b, c);
        }
    }

    function triangle(pointsArray, a, b, c)
    {
        pointsArray.push(a);
        pointsArray.push(b);
        pointsArray.push(c);
    }

    var g_tex_ready = 0;
    function initTexture()
    {
        var cubemap = ['../pine/cm_left.png', // POSITIVE_X
                       '../pine/cm_right.png', // NEGATIVE_X
                       '../pine/cm_top.png', // POSITIVE_Y
                       '../pine/cm_bottom.png', // NEGATIVE_Y
                       '../pine/cm_back.png', // POSITIVE_Z
                       '../pine/cm_front.png']; // NEGATIVE_Z

        gl.activeTexture(gl.TEXTURE0);
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        for(var i = 0; i < 6; ++i) 
        {
            var image = document.createElement('img');
            image.crossorigin = 'anonymous';
            image.textarget = gl.TEXTURE_CUBE_MAP_POSITIVE_X + i;
            image.onload = function(event)
            {
            var image = event.target;
            gl.activeTexture(gl.TEXTURE0);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(image.textarget, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
            ++g_tex_ready;
            };
        image.src = cubemap[i];
        }
    }


    var rotatenButton = document.getElementById("Rotaten");
    rotatenButton.addEventListener("click", function(ev) {
        toggle = !toggle;
    });

    gl.uniform4fv(gl.getUniformLocation(program, "lightPos"), lightPos);
    gl.uniform4fv(gl.getUniformLocation(program, "Ld"), Ld);
    gl.uniform1i(gl.getUniformLocation(program, "texMap"), 0);

    function tick() 
    {
        if (toggle) 
        {
            orbitingAlpha += 0.01;
            eye = vec3(orbitingRadius * Math.sin(orbitingAlpha), 0, orbitingRadius * Math.cos(orbitingAlpha));
            view = lookAt(eye, vec3(0.0,0.0,0.0), vec3(0,1,0));
            invView = inverse(view);
            M_tex = mult(mat4(invView[0][0], invView[0][1], invView[0][2], 0, invView[1][0], invView[1][1], invView[1][2], 0, invView[2][0], invView[2][1], invView[2][2], 0, 0, 0, 0, 0), inverse(P));
        }
        if (g_tex_ready > 5) {
            render();
        }
        requestAnimationFrame(tick);
    }

    function render() 
    {
        var vPosition = gl.getAttribLocation(program, "a_Position");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.uniform3fv(gl.getUniformLocation(program, "eye"), flatten(eye));
        
        gl.uniform1f(gl.getUniformLocation(program, "reflective"), 0.0);
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "M_tex"), false, flatten(M_tex));
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "view"), false, flatten(mat4()));
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "perspective"), false, flatten(mat4()));
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "rotation"), false, flatten(mat4()));
        
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        
        gl.uniform1f(gl.getUniformLocation(program, "reflective"), 1.0);
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "M_tex"), false, flatten(mat4()));
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "view"), false, flatten(view));
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "perspective"), false, flatten(P));
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "rotation"), false, flatten(R0));

        gl.drawArrays(gl.TRIANGLES, 4, sphereVertices);

    }
    initTexture();
    tick();
}   