window.onload = function init()
{
    var canvas = document.getElementById("webgl-canvas");
    var gl = canvas.getContext("webgl");
    gl.clearColor(0, 0, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    gl.vBuffer = null;
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.frontFace(gl.CW);

    var lightPos = vec4(0,0,-1,0);
    //var Le = vec4(0,0,-1,1);
    var Ld = vec4(1,1,1,1);

    var orbitingRadius = -3.5;
    var orbitingAlpha = 0;
    var toggle = false;

    var numSubdivs = 7;
    var numVertices = initSphere(gl, numSubdivs);

    var view = lookAt(vec3(orbitingRadius * Math.sin(orbitingAlpha), 0, orbitingRadius * Math.cos(orbitingAlpha)), vec3(0.0,0.0,0.0), vec3(0,1,0));

    var P = perspective(45, 1, 1, 5);

    var R0 = mat4();

    function initSphere(gl, numSubdivs) 
    {
        var va = vec4(0.0, 0.0, 1.0, 1);
        var vb = vec4(0.0, 0.942809, -0.333333, 1);
        var vc = vec4(-0.816497, -0.471405, -0.333333, 1);
        var vd = vec4(0.816497, -0.471405, -0.333333, 1);
        var pointsArray = [];
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

    var image = document.createElement('img');
    image.crossorigin = 'anonymous';
    image.onload = function () { 
        /* Insert WebGL texture initialization here */ 
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    };
    image.src = '../pine/earth.jpg';




    var rotatenButton = document.getElementById("Rotaten");
    rotatenButton.addEventListener("click", function(ev) {
        toggle = !toggle;
    });



    gl.uniformMatrix4fv(gl.getUniformLocation(program, "view"), false, flatten(view));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "perspective"), false, flatten(P));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "rotation"), false, flatten(R0));
    gl.uniform4fv(gl.getUniformLocation(program, "lightPos"), lightPos);
    gl.uniform4fv(gl.getUniformLocation(program, "Ld"), Ld);
    gl.uniform1i(gl.getUniformLocation(program, "texMap"), 0);
    
    
    
    
    
    
    
    
    /*
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vec4(1,1,1,1)), gl.STATIC_DRAW);

    var cPosition = gl.getAttribLocation(program, "a_Color");
    gl.vertexAttribPointer(cPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(cPosition);
    */


    function tick() 
    {
        if (toggle) 
        {
            orbitingAlpha += 0.05;
            view = lookAt(vec3(orbitingRadius * Math.sin(orbitingAlpha), 0, orbitingRadius * Math.cos(orbitingAlpha)), vec3(0.0,0.0,0.0), vec3(0,1,0));
            gl.uniformMatrix4fv(gl.getUniformLocation(program, "view"), false, flatten(view));
        }
        render(); requestAnimationFrame(tick);
    }

    function render() 
    {
        var vPosition = gl.getAttribLocation(program, "a_Position");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    }
    
    tick();
}   