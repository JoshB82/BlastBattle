// script.js - Code behind the game

// JavaScript/jQuery for HTML elements

$(function() {
	
	$("#createNewWorld").click(function() {
		$("#newWorldForm").css("visibility","visible");
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
		});
		this.context = this.canvas.getContext("2d");
		this.context.strokeStyle = "#007B0C";
		// this.worlds = [];
	},
	clear: function() {
		this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
	}
};

function createNewWorld(form) {
	$("#newWorldForm").css("visibility","hidden");
	$("#loading").css("visibility","visible");
	game.clear();
	world = new newWorld(form.worldName.value,parseInt(form.worldSeed.value,10),parseInt(form.worldX1.value,10),parseInt(form.worldX2.value,10),5,0.25);
	world.generate();
	world.draw();
	$("#loading").css("visibility","hidden");
}

function newWorld(name,seed,X1,X2,noOctaves,persistence) {
	this.name = name;
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
			this.coordsY.push(findY(x,this));
		}
	}
	this.draw = function() {
		for (var x = this.x1; x <= this.x2-0.5; x+=0.5) {
			game.context.beginPath();
			game.context.moveTo(convertRange(x,[this.x1,this.x2],[this.x1,this.x2*10]),this.coordsY[Math.floor(x*2)]);
			game.context.lineTo(convertRange(x+0.5,[this.x1,this.x2],[this.x1,this.x2*10]),this.coordsY[Math.floor((x+0.5)*2)]);
			game.context.stroke();
		}
	}
}

/*
this.generate = function() {
		for (var x = this.x1; x <= this.x2; x+=100) {
			this.coordsY.push(findY(x,this));
		}
	}
	this.draw = function() {
		for (var x = this.x1; x <= this.x2; x+=100) {
			game.context.beginPath();
			game.context.moveTo(x,this.coordsY[x/100]);
			game.context.lineTo(x+100,this.coordsY[(x+100)/100]);
			game.context.stroke();
		}
	}
*/

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
	var integerX = parseInt(x,10);
	var fractionalX = x-integerX;
	var v1 = SmoothNoise(integerX,octave,world);
	var v2 = SmoothNoise(integerX+1,octave,world);
	return cosineInterpolate(v1,v2,fractionalX,octave);
}

function SmoothNoise(x,octave,world) {return noise(x,octave,world)/2+noise(x-1,octave,world)/4+noise(x+1,octave,world)/4}

function noise(x,octave,world) {
	var noiseY = 0;
	world.randomGenerator[octave] = new MersenneTwister(world.seed);
	for (var f = 1; f <= x; f++) {
		noiseY = convertRange(world.randomGenerator[octave].next(),[0,1E8],[-1,1]);
	}
	return noiseY;
}

function convertRange(value,r1,r2) { 
	return (value-r1[0])*(r2[1]-r2[0])/(r1[1]-r1[0])+r2[0];
}

function cosineInterpolate(a,b,x) {
	var f = (1-Math.cos(x*Math.PI))*0.5;
	return a*(1-f)+b*f;
}