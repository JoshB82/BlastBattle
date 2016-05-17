// script.js - Code behind the game

// JavaScript/jQuery for HTML elements

$(function() {
	
	$("#createNewWorld").click(function() {
		// Hide new world button and display the form
		$("#createNewWorld").css("display","none");
		$("#newWorldForm").css("display","block");
	});

	$("#clear").click(function() {
		game.clear();
	});
	
	$("#newWorldForm").submit(function(e) {
		e.preventDefault();
	});
	
	game.init();
});

var game = {
	canvas: document.getElementById("screen"),
	init: function() {
		// Resize canvas to entire page
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		// Check to see if the window has been resized
		window.addEventListener("resize",function() {
			game.canvas.width = window.innerWidth;
			game.canvas.height = window.innerHeight;
			// Redraw the world if one has been generated
			if (typeof world != "undefined") world.draw();
		});
		// Check to see if the canvas has been clicked on
		this.canvas.addEventListener("click",function(e) {
			// Create a ball at the point where the user clicked
			var x = undefined?e.layerX:e.offsetX;
			var y = undefined?e.layerY:e.offsetY;
			world.balls.push(new ball(x,y,5));
			world.noBalls += 1;
		});
		// Necessary for drawing on canvas
		this.context = this.canvas.getContext("2d");
		// this.worlds = [];
		// Strength of gravity
		this.gravAcc = -9.81;
		// Load images
		this.dirt = new Image();
		this.dirt.src = "images/dirt.png";
		this.grass = new Image();
		this.grass.src = "images/grass.png";
	},
	clear: function() {
		// Clear the entire screen
		this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
	}
};

function ball(x,y,radius) {
	// Create a new ball object
	this.x = x;
	this.y = output(y);
	this.vx = 0;
	this.vy = 0;
	this.radius = radius;
	this.draw = function() {
		game.clear();
		// Display blue background
		game.context.beginPath();
		game.context.rect(0,0,game.canvas.width,game.canvas.height);
		game.context.fillStyle = "#89E3FF";
		game.context.fill();
		// Draw world
		world.draw();
		// Draw ball
		game.context.beginPath();
		game.context.arc(this.x,output(this.y),this.radius,0,2*Math.PI);
		game.context.fill();
		game.context.stroke();
	}
}

function createNewWorld(form) {
	// Hide and display things
	$("#progressBar").css("display","block");
	$("#progressBar").css("position","absolute");
	$("#createNewWorld").css("display","none");
	$("#newWorldForm").css("display","none");
	// Create a new world object
	world = new newWorld(form.worldName.value,form.worldSeed.value,5,0.25);
	// Display blue background
	game.context.beginPath();
	game.context.rect(0,0,game.canvas.width,game.canvas.height);
	game.context.fillStyle = "#89E3FF";
	game.context.fill();
	// Generate the coordinates of all the points on the ground
	world.generate();
	// Draw world
	world.draw();
	//$("#progressBar").css("display","none");
}

function newWorld(name,seed,noOctaves,persistence) {
	// Set name of world in tab text
	this.name = name;
	document.title = this.name+" - Blast Battle";
	// Convert seed from any string to a number
	this.seed = hashCode(seed);
	this.noOctaves = noOctaves;
	this.randomGenerator = [];
	// Create a new seeded random number generator for each octave so that they produce different results
	for (var o = 0; o < this.noOctaves; o++) this.randomGenerator.push(new MersenneTwister(this.seed+(o+1)/10));
	this.persistence = persistence;
	this.coordsY = [];
	// Gap between points
	this.step = 0.1;
	this.generate = function() {
		var currentPercentage = 0;
		// Generate points between 0 and 40 (x-axis) - they are "stretched" over the remaindere of the screen to make it smoother
		for (var x = 0; x <= 40; x+=this.step) {
			this.coordsY.push(findY(x,this));
			// Progreses bar stuff (not really working)
			currentPercentage += this.step/70*100;
			$("#progressBar").css("width",currentPercentage+"%");
			$("#progressBarLabel").text(currentPercentage+"%");
		}
	}
	this.draw = function() {
		// Draw ground
		game.context.save();
		game.context.beginPath();
		game.context.moveTo(0,output(this.coordsY[0]));
		var step = game.canvas.width/(this.coordsY.length-1);
		// Draw path around the ground bit and clip it off the main canvas so that,
		// when we draw the ground images, they will not appear like blocks on the
		// surface
		for (var x = 0; Math.floor(x) <= game.canvas.width; x+=step) {
			game.context.lineTo(x,output(this.coordsY[Math.floor(x/step)]));
		}
		game.context.lineTo(game.canvas.width,output(0));
		game.context.lineTo(0,output(0));
		game.context.clip();
		// Find the lowest y coordinate that the ground goes to (no point rendering
		// the ground any higher than this point)
		var highest = this.coordsY[0];
		for (var i = 1; i < this.coordsY.length; i++) {
			if (this.coordsY[i] > highest) highest = this.coordsY[i];
		}
		// Draw all the necessary ground images so that they fill the ground area
		for (var x = 0; x < game.canvas.width; x+=6) {
			for (var y = 0; y < highest+5; y+=6) {
				game.context.drawImage(game.dirt,x,output(y),6,6);
			}
		}
		
		// Draw rotated grass
		var oldX = 0;
		var oldY = output(this.coordsY[0]);
		for (var x = 0; Math.floor(x) <= game.canvas.width; x+=step) {
			// x1,y1 and x2,y2 are the coordinates of two adjacent points on the curve
			var x1 = oldX;
			var x2 = x;
			var y1 = oldY;
			var y2 = output(this.coordsY[Math.floor(x/step)]);
			
			// Calculate the angle that the canvas should be rotated to so the grass is displayed correctly
			var angle = Math.atan((y2-y1)/step);
			// Calculate the gradient of the line between the two points (used for determing what y position
			// they should be rendered at)
			var m = (y2-y1)/(x2-x1);
			for (var x3 = 0; x3 < step; x3+=6) {
				game.context.save();
				game.context.translate(x1+x3,m*x3+y1);
				game.context.rotate(angle);
				game.context.drawImage(game.grass,0,0,6,6);
				game.context.restore();
			}
			
			var oldX = x2;
			var oldY = y2;
		}
		game.context.restore();
	}
	this.balls = [];
	this.noBalls = 0;
	this.interval = setInterval(function() {
		for (var b = 0; b < world.balls.length; b++) {
			// Gravity calculations
			world.balls[b].vy += game.gravAcc;
			world.balls[b].y += world.balls[b].vy;
			world.balls[b].draw();
			// This bit not really working :(
			if (world.balls[b].y < 0) {
				world.balls[b].y *= -0.7;
			}
		}
	},1);
}

// See http://freespace.virgin.net/hugo.elias/models/m_perlin.htm for explanation
function findY(x,world) {
	var total = 0;
	for (var i = 0; i < world.noOctaves; i++) {
		var frequency = Math.pow(2,i);
		var amplitude = Math.pow(world.persistence,i);
		total += InterpolatedNoise(x*frequency,i,world)*amplitude;
	}
	return total+200;
}

function InterpolatedNoise(x,octave,world) {
	var integerX = Math.floor(x);
	var fractionalX = x-integerX;
	var v0 = SmoothNoise(integerX-1,octave,world);
	var v1 = SmoothNoise(integerX,octave,world);
	var v2 = SmoothNoise(integerX+1,octave,world);
	var v3 = SmoothNoise(integerX+2,octave,world);
	return cubicInterpolate(v0,v1,v2,v3,fractionalX);
}

function SmoothNoise(x,octave,world) {return noise(x,octave,world)/2+noise(x-1,octave,world)/4+noise(x+1,octave,world)/4}

function noise(x,octave,world) {
	var noiseY = 0;
	world.randomGenerator[octave] = new MersenneTwister(world.seed);
	for (var f = 1; f <= x; f++) {noiseY = world.randomGenerator[octave].next()}
	return convertRange(noiseY,[0,1E8],[-1,1]);
}

function convertRange(value,r1,r2) {return (value-r1[0])*(r2[1]-r2[0])/(r1[1]-r1[0])+r2[0]}

function cubicInterpolate(v0,v1,v2,v3,x) {
	var P = (v3-v2)-(v0-v1);
	var Q = (v0-v1)-P;
	var R = v2-v0;
	var S = v1;
	return P*Math.pow(x,3) + Q*Math.pow(x,2) + R*x + S;
}

function output(value) {
	// Change the y coordinate given in the parameter so that it works with the origin
	// in the bottom left rather than the top left
	return game.canvas.height-value;
}

// Obtained from http://mediocredeveloper.com/wp/?p=55
// Not entirely sure what everything does in this function :(
function hashCode(str) {
	var hash = 0;
	if (str.length == 0) return hash;
	for (i = 0; i < str.length; i++) {
		var c = str.charCodeAt(i);
		hash = ((hash << 5) - hash) + c;
		hash = hash & hash;
	}
	return hash;
}