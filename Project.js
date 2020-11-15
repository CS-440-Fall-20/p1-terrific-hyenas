var gl;
var vertices = [];
var worldMatrix = new Float32Array(16);
var faces = [];
//these are the base colors to be used on the vertices
var base_colors = 	
[vec4(1.0, 0.0, 0.0, 1.0), vec4(0.0, 1.0, 0.0, 1.0), vec4(0.0, 0.0, 1.0, 1.0)]
var colors = [];
var verts = [];




window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");
	
	var X = document.getElementById("Xrotate");
	var Y = document.getElementById("Yrotate");
	var Z = document.getElementById("Zrotate");
	noise.seed(Math.random());
	


    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    //  Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

    //  Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
	
	get_patch(-10,10,-10,10,noise);
	

	console.log(colors);
	console.log("colorlength",colors.length);
	console.log("num faces",faces.length);
	console.log("faces",faces);
	

    var vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
	
	var vertex_index_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertex_index_buffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(faces),gl.STATIC_DRAW)

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
	

    var color_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);
	

	var viewM = gl.getUniformLocation(program, "viewM");
	var projectionM = gl.getUniformLocation(program, "projectionM");
	var worldM = gl.getUniformLocation(program, "worldM");
	

	var viewMatrix = new Float32Array(16);
	var projectionMatrix = new Float32Array(16);
	
	//calculating the angle of the rotation based on the time elapsed
	angle = performance.now() / 1000 / 6 * 2 * Math.PI;
	
	worldMatrix = rotateY(angle);
	var eye = [0,4,3]
	var at = [0,4,2]
	var up = [0,5,3]
	

	viewMatrix = lookAt(eye,at,up);

	projectionMatrix = perspective(90,canvas.width/canvas.height,0.1,1000.0);
	
	
	//Setting the Matrices
	gl.uniformMatrix4fv(worldM, gl.FALSE, flatten(worldMatrix));
	gl.uniformMatrix4fv(viewM, gl.FALSE, flatten(viewMatrix));
	gl.uniformMatrix4fv(projectionM, gl.FALSE, flatten(projectionMatrix));
	
	console.log("vertices", vertices);
	
	//by default the rotation is set to about the x axis
	
	
	var loop = function()
	{
		gl.clear(gl.COLOR_BUFFER_BIT||gl.DEPTH_BUFFER_BIT);
		gl.drawElements(gl.POINTS,faces.length, gl.UNSIGNED_SHORT,0); //Rendering the triangle
		viewMatrix = lookAt([0,3,3],[0,0,0],[0,0,1]);
		//console.log("here");
		requestAnimationFrame(loop);
	}
	requestAnimationFrame(loop);

	

    //render(worldM);
};

function get_patch(xmin,xmax,zmin,zmax,noise)
{
	make_vertices(xmin,xmax,zmin,zmax,noise)
	var boxes = make_boxes(verts);
	make_faces(boxes);
	Make_colors(vertices);
}

//Setting the colors of the vertices.
function Make_colors(vertices)
{
	for (var i = 0; i < faces.length; i++)
	{
		colors.push(base_colors);
	}
}

function make_vertices(xmin,xmax,zmin,zmax,noise)
{
	var x;
	var z;
	var y;
	
	for (var i  = xmin; i <= xmax; i+= 0.2)
	{
		innerarray = new Array();
		for (var j = zmin; j <= zmax; j+= 0.2)
		{
			x = i;
			z = j;
			y = noise.perlin2(i/2,j/2)*4 - 2
			innerarray.push(vec4(x,y,z,1))
		}
		verts.push(innerarray);
	}
	console.log(verts);
}


function make_boxes(verts)
{
	var boxes = new Array()
	for (var i = 0; i < verts.length - 1; i++)
	{
		for (var j = 0; j < verts.length - 1; j++)
		{
			boxes.push([verts[i][j],verts[i+1][j],verts[i][j+1],verts[i+1][j+1]])
		}
	}
	console.log("boxes: ",boxes.length);
	return boxes;
}

function make_faces(boxes)
{
	for (var i = 0; i < boxes.length; i++)
	{
		vertices.push(boxes[i][0],boxes[i][1],boxes[i][2]);
		vertices.push(boxes[i][1],boxes[i][2],boxes[i][3]);
	}
	for (var i = 0; i < vertices.length; i++)
	{
		faces.push(i);
	}
	console.log(faces.length);
}
