// script.js - Code behind the game

// JavaScript/jQuery for HTML elements

$(function() {
	
	$("#createNewWorld").click(function() {
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
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		window.addEventListener("resize",function() {
			game.canvas.width = window.innerWidth;
			game.canvas.height = window.innerHeight;
			if (typeof world != "undefined") world.draw();
		});
		this.canvas.addEventListener("click",function(e) {
			var x = undefined?e.layerX:e.offsetX;
			var y = undefined?e.layerY:e.offsetY;
			world.balls.push(new ball(x,y,5));
			world.noBalls += 1;
		});
		this.context = this.canvas.getContext("2d");
		this.context.strokeStyle = "#007B0C";
		// this.worlds = [];
		this.gravAcc = -9.81;
	},
	clear: function() {
		this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
	}
};

function ball(x,y,radius) {
	this.x = x;
	this.y = output(y);
	this.vx = 0;
	this.vy = 0;
	this.radius = radius;
	this.draw = function() {
		game.clear();
		world.draw();
		game.context.beginPath();
		game.context.arc(this.x,output(this.y),this.radius,0,2*Math.PI);
		game.context.fill();
		game.context.stroke();
	}
}

function createNewWorld(form) {
	$("#loading").css("visibility","visible");
	$("#createNewWorld").css("display","none");
	$("#newWorldForm").css("display","none");
	game.clear();
	world = new newWorld(form.worldName.value,parseInt(form.worldSeed.value,10),parseInt(form.worldX1.value,10),parseInt(form.worldX2.value,10),5,0.25);
	world.generate();
	world.draw();
	$("#loading").css("visibility","hidden");
}

function newWorld(name,seed,X1,X2,noOctaves,persistence) {
	this.name = name;
	document.title = this.name;
	this.seed = seed;
	this.x1 = X1;
	this.x2 = X2;
	this.noOctaves = noOctaves;
	this.randomGenerator = [];
	for (var o = 0; o < this.noOctaves; o++) {
		this.randomGenerator.push(new MersenneTwister(this.seed+(o+1)/10));
	}
	this.persistence = persistence;
	this.coordsY = [];
	this.generate = function() {
		for (var x = this.x1; x <= this.x2; x+=0.5) {
			this.coordsY.push(output(findY(x,this)));
		}
	}
	this.draw = function() {
		for (var x = this.x1; x <= this.x2-0.5; x+=0.5) {
			game.context.beginPath();
			game.context.moveTo(convertRange(x,[this.x1,this.x2],[0,1000]),this.coordsY[Math.floor(x*2)]);
			game.context.lineTo(convertRange(x+0.5,[this.x1,this.x2],[0,1000]),this.coordsY[Math.floor((x+0.5)*2)]);
			game.context.stroke();
		}
		game.context.save();
	}
	this.balls = [];
	this.noBalls = 0;
	this.interval = setInterval(function() {
		for (var b = 0; b < world.balls.length; b++) {
			world.balls[b].vy += game.gravAcc;
			world.balls[b].y += world.balls[b].vy;
			world.balls[b].draw();
		}
	},1);
}

function findY(x,world) {
	var total = 0;
	for (var i = 0; i < world.noOctaves; i++) {
		var frequency = Math.pow(2,i);
		var amplitude = Math.pow(world.persistence,i);
		total += InterpolatedNoise(x*frequency,i,world)*amplitude;
	}
	return total;
}

function InterpolatedNoise(x,octave,world) {
	var integerX = Math.floor(x);
	var fractionalX = x-integerX;
	var v0 = SmoothNoise(integerX-1,octave,world);
	var v1 = SmoothNoise(integerX,octave,world);
	var v2 = SmoothNoise(integerX+1,octave,world);
	var v3 = SmoothNoise(integerX+2,octave,world);
	//return cosineInterpolate(v1,v2,fractionalX);
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

// Function not used
function cosineInterpolate(a,b,x) {
	var f = (1-Math.cos(x))*0.5;
	return a*(1-f)+b*f;
}

function cubicInterpolate(v0,v1,v2,v3,x) {
	var P = (v3-v2)-(v0-v1);
	var Q = (v0-v1)-P;
	var R = v2-v0;
	var S = v1;
	return P*Math.pow(x,3) + Q*Math.pow(x,2) + R*x + S;
}

function output(value) {
	//alert(game.canvas.height-value);
	return game.canvas.height-value;
}