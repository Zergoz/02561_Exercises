window.onload = function init()
{
    var canvas = document.getElementById("webgl-canvas");
    var gl = canvas.getContext("webgl");
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    gl.vBuffer = null;
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.frontFace(gl.CW);

    var lightPos = vec4(0,0,-1,0);
    gl.uniform4fv(gl.getUniformLocation(program, "lightPos"), lightPos);
    
    var Le = vec4(1,1,1,1);
    var kd = 0.5;
    var ka = 0.5;
    var ks = 0.5;
    var s = 100.0;

    var orbitingRadius = -3.5;
    var orbitingAlpha = 0;
    var toggle = false;

    var numSubdivs = 2;
    var numVertices = initSphere(gl, numSubdivs);

    var m = lookAt(vec3(orbitingRadius * Math.sin(orbitingAlpha), 0, orbitingRadius * Math.cos(orbitingAlpha)), vec3(0.0,0.0,0.0), vec3(0,1,0));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "view"), false, flatten(m));

    var P = perspective(45, 1, 1, 5);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "perspective"), false, flatten(P));

    var coarsenButton = document.getElementById("Coarsen");
    coarsenButton.addEventListener("click", function(ev) {
        if (numSubdivs > 0) {
            numSubdivs -= 1;
        }
        numVertices = initSphere(gl, numSubdivs);
    });
    
    var smoothenButton = document.getElementById("Smoothen");
    smoothenButton.addEventListener("click", function(ev) {
        if (numSubdivs < 8) {
            numSubdivs += 1;
        }
        numVertices = initSphere(gl, numSubdivs);
    });

    var rotateButton = document.getElementById("Rotate");
    rotateButton.addEventListener("click", function(ev) {
        toggle = !toggle;
    });
    
    var LeSlide = document.getElementById("LeSlide");
    LeSlide.addEventListener("input", function(ev) {
        Le[0] = ev.currentTarget.value;
        Le[1] = ev.currentTarget.value;
        Le[2] = ev.currentTarget.value;
    });
    
    var kaSlide = document.getElementById("kaSlide");
    kaSlide.addEventListener("input", function(ev) {
        ka = ev.currentTarget.value;
    });

    var kdSlide = document.getElementById("kdSlide");
    kdSlide.addEventListener("input", function(ev) {
        kd = ev.currentTarget.value;
    });

    var ksSlide = document.getElementById("ksSlide");
    ksSlide.addEventListener("input", function(ev) {
        ks = ev.currentTarget.value;
    });

    var sSlide = document.getElementById("sSlide");
    sSlide.addEventListener("input", function(ev) {
        s = ev.currentTarget.value;
    });    
    
    function render() 
    {
        var vPosition = gl.getAttribLocation(program, "a_Position");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    }

    function tick() 
    {
        if (toggle)
        {
            orbitingAlpha += 0.05;
            m = lookAt(vec3(orbitingRadius * Math.sin(orbitingAlpha), 0, orbitingRadius * Math.cos(orbitingAlpha)), vec3(0.0,0.0,0.0), vec3(0,1,0));
            gl.uniformMatrix4fv(gl.getUniformLocation(program, "view"), false, flatten(m));
        }

        gl.uniform4fv(gl.getUniformLocation(program, "Le"), Le);
        gl.uniform1f(gl.getUniformLocation(program, "kd"), kd);
        gl.uniform1f(gl.getUniformLocation(program, "ka"), ka);
        gl.uniform1f(gl.getUniformLocation(program, "ks"), ks);
        gl.uniform1f(gl.getUniformLocation(program, "s"), s);
        
        render(); requestAnimationFrame(tick);
    }    
    tick();
}

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