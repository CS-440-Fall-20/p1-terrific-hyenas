var gl;
var vertices = [];
var worldMatrix = new Float32Array(16);
var faces = [];
//these are the base colors to be used on the vertices
var base_colors = 	
[vec4(1.0, 0.0, 0.0, 1.0), vec4(0.0, 1.0, 0.0, 1.0), vec4(0.0, 0.0, 1.0, 1.0)]
var colors = [];
var verts = [];
var row_length = 0;
var col_length = 0;
var interval = 0.2
var flag_count = 1;



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
	
	get_patch(-12,12,-12,12,noise);
	

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
	var eye = vec3(0,4,3)
	var at = vec3(0,4,2)
	var up = vec3(0,5,3)
	
	viewMatrix = lookAt(eye,at,up);
	addEventListener("keypress",function (event) {
		if (event.key == 'w' || event.key == 'W')
		{
			//console.log("pressed")
			viewMatrix = mult(rotate(5, cross(up, at)), viewMatrix )
		    
		}
		else if (event.key == 's' || event.key == 'S')
		{
			viewMatrix = mult(rotate(-5, cross(up, at)), viewMatrix )
		}
		else if (event.key == 'a' || event.key == 'D')
		{
			viewMatrix = mult(rotate(-5, subtract(up, eye)), viewMatrix )
		}
		else if (event.key == 'd' || event.key == 'D')
		{
			viewMatrix = mult(rotate(5, subtract(up, eye)), viewMatrix )
		}
		else if (event.key == 'q' || event.key == 'Q')
		{
			viewMatrix = mult(rotate(5, subtract(at, eye)), viewMatrix )
		}
		else if (event.key == 'e' || event.key == 'e')
		{
			viewMatrix = mult(rotate(-5, subtract(at, eye)), viewMatrix )
		}
		if (event.key == 'v' || event.key == 'V')
		{
			flag_count++
			flag_count = flag_count % 3;
		}
		
	});

	viewMatrix = lookAt(eye,at,up);

	projectionMatrix = perspective(45,canvas.width/canvas.height,0.1,1000.0);
	
	
	gl.uniformMatrix4fv(worldM, gl.FALSE, flatten(worldMatrix));
	gl.uniformMatrix4fv(viewM, gl.FALSE, flatten(viewMatrix));
	gl.uniformMatrix4fv(projectionM, gl.FALSE, flatten(projectionMatrix));
	
	console.log("vertices", vertices);
	
	//by default the rotation is set to about the x axis
	
	
	var loop = function()
	{
		gl.clear(gl.COLOR_BUFFER_BIT||gl.DEPTH_BUFFER_BIT);
		if (flag_count == 2)
		{
			gl.drawElements(gl.TRIANGLES,faces.length, gl.UNSIGNED_SHORT,0); //Rendering the triangle
		}
		if (flag_count == 1)
		{
			gl.drawElements(gl.LINES,faces.length, gl.UNSIGNED_SHORT,0); //Rendering the triangle
		}
		if (flag_count == 0)
		{
			gl.drawElements(gl.POINTS,faces.length, gl.UNSIGNED_SHORT,0); //Rendering the triangle
		}
		
		gl.uniformMatrix4fv(viewM, gl.FALSE, flatten(viewMatrix));
		//console.log("here");
		requestAnimationFrame(loop);
	}
	requestAnimationFrame(loop);

	

    //render(worldM);
};

function get_patch(xmin,xmax,zmin,zmax,noise)
{
	make_vertices(xmin,xmax,zmin,zmax,noise)
	//var boxes = make_boxes(verts);
	make_faces(vertices);
	Make_colors(vertices);
}

//Setting the colors of the vertices.
function Make_colors(vertices)
{
	colors = [Color_interpolation(vertices[0][1])]
	for (var i = 1; i < vertices.length; i++)
	{
		//console.log(vertices[i][1]);
		colors = colors.concat([Color_interpolation(vertices[i][1])]);
	}
}

function Color_interpolation(y)
{
	var col = vec3();
	if (y <=  0)
	{
		col = vec4(0,0,1.0,1.0);
	}
	else if (y > 0 && y < 1)
	{
		a = y
		b = 1 - a
		r = 0*b + a*0.6
		g = 1*b + a*0.3
		b = 0*b + a*0
		col = vec4(r,g,b,1.0)
	}
	else if (y >= 1 && y <2)
	{
		a = y - 1
		b = 1 - a
		r = 1*b + a*0.6
		g = 1*b + a*0.3
		b = 1*b +a*0
		col = vec4(r,g,b,1.0)
	}
	return col;
}


function make_vertices(xmin,xmax,zmin,zmax,noise)
{
	var x;
	var z;
	var y;
	

	for (var i  = xmin; i <= xmax; i+= interval)
	{
		col_length++
		row_length = 0;
		for (var j = zmin; j <= zmax; j+= interval)
		{
			row_length++
			x = i;
			z = j;
			y = noise.perlin2(i/2,j/2)*2
			if (y < 0)
			{
				y = -0.1;
			}
			vertices.push(vec4(x,y,z,1))
		}
	}
	console.log(row_length)
	console.log(col_length)
	console.log(vertices);
}

function make_faces(vertices)
{

	for (var i = 0; i < col_length - 1; i++)
	{
		for (var j = 0; j < row_length - 1; j++)
		{
			faces.push(row_length* i + j)
			faces.push(row_length* i + j + 1)
			faces.push(row_length*(i + 1) + j)
			faces.push(row_length* i + j + 1)
			faces.push(row_length*(i + 1) +1 + j)
			faces.push(row_length*(i + 1) + j)
		}
	}
	
}
