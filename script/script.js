// script.js - Code behind the game

// JavaScript/jQuery for HTML elements

$(function() {
	
	$("#createNewWorld").click(function() {
		$("#createNewWorld").css("display","none");
		$("#newWorldForm").css("display","block");
	});

	$("#clear").click(function() {
		game.clear();
	});
	
	$("#newWorldForm").submit(function(e) {
		e.preventDefault();
	});
	
	$("#randomSeed").change(function() {
		if ($("#randomSeed").is(":checked")) {
			$("input[name='worldSeed']").prop('disabled',true);
		} else {
			$("input[name='worldSeed']").prop('disabled',false);
		}
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
			var x = undefined ? e.layerX : e.offsetX;
			var y = undefined ? e.layerY : e.offsetY;
			world.balls.push(new ball(x,output(y),5));
			world.noBalls += 1;
		});
		this.context = this.canvas.getContext("2d");
		// this.worlds = [];
		this.gravAcc = -9.81;
		this.dirt = new Image();
		this.dirt.src = "images/dirt.png";
		this.grass = new Image();
		this.grass.src = "images/grass.png";
	},
	clear: function() {
		this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
	}
};

function ball(x,y,radius) {
	this.x = x;
	this.y = y;
	this.vx = 0;
	this.vy = 0;
	this.radius = radius;
	this.draw = function() {
		game.clear();
		game.context.beginPath();
		game.context.rect(0,0,game.canvas.width,game.canvas.height);
		game.context.fillStyle = "#89E3FF";
		game.context.fill();
		world.draw();
		game.context.beginPath();
		game.context.arc(this.x,output(this.y),this.radius,0,2*Math.PI);
		game.context.fillStyle = "#F71713";
		game.context.fill();
		game.context.stroke();
		// NOTE: Redraw the background after updating the balls!
	}
}

function createNewWorld(form) {
	$("#newWorldForm").css("display","none");
	$("#progress").css("display","block");
	if ($("#randomSeed").is(":checked")) {
		world = new newWorld(form.worldName.value,String(Math.random()*2E8+1E8),5,0.25);
	} else {
		world = new newWorld(form.worldName.value,form.worldSeed.value,5,0.25);
	}
	game.context.beginPath();
	game.context.rect(0,0,game.canvas.width,game.canvas.height);
	game.context.fillStyle = "#89E3FF";
	game.context.fill();
	world.generate();
	world.draw();
	$("#progress").css("display","none");
}

function newWorld(name,seed,noOctaves,persistence) {
	this.name = name;
	document.title = this.name+" - Blast Battle";
	this.seed = hashCode(seed);
	this.noOctaves = noOctaves;
	this.randomGenerator = [];
	for (var o = 0; o < this.noOctaves; o++) this.randomGenerator.push(new MersenneTwister(this.seed+(o+1)/10));
	this.persistence = persistence;
	this.coordsY = [];
	this.step = 0.1;
	this.generate = function() {
		// check for loop limits
		for (var x = 0; x <= 40; x+=this.step) {
			$("#progress progress").val(x*2.5);
			this.coordsY.push(findY(x,this));
		}
	}
	this.draw = function() {
		// Draw ground
		game.context.save();
		game.context.beginPath();
		game.context.moveTo(0,output(this.coordsY[0]));
		var step = game.canvas.width/(this.coordsY.length-1);
		// WHY MATH.FLOOR IN FOR LOOP! (AND BELOW)
		for (var x = 0; Math.floor(x) <= game.canvas.width; x+=step) {
			game.context.lineTo(x,output(this.coordsY[Math.floor(x/step)]));
		}
		game.context.lineTo(game.canvas.width,output(0));
		game.context.lineTo(0,output(0));
		game.context.clip();
		var max = Math.max(...this.coordsY);
		// Check lack of +5
		for (var x = 0; x < game.canvas.width; x+=6) {
			for (var y = 0; y < max; y+=6) {
				game.context.drawImage(game.dirt,x,output(y),6,6);
			}
		}
		
		// Draw rotated grass
		var oldX = 0;
		var oldY = output(this.coordsY[0]);
		for (var x = 0; Math.floor(x) <= game.canvas.width; x+=step) {
			var x1 = oldX;
			var x2 = x;
			var y1 = oldY;
			// Do you need the 2 coordinates?; x2-x1 would be step?
			var y2 = output(this.coordsY[Math.floor(x/step)]);
			
			var angle = Math.atan((y2-y1)/step); // ??
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
		game.context.restore(); // ??
	}
	this.balls = [];
	this.noBalls = 0;
	// Remove property
	this.interval = setInterval(function() {
		var step = game.canvas.width/(world.coordsY.length-1);
		for (var b = 0; b < world.balls.length; b++) {
			world.balls[b].vy += game.gravAcc;
			world.balls[b].y += world.balls[b].vy;
			var x1 = world.balls[b].x - world.balls[b].x % step;
			var x2 = x1+step;
			var y1 = world.coordsY[Math.floor(x1/step)];
			var y2 = world.coordsY[Math.floor(x2/step)];
			var yBoundary = ((y2-y1)/(x2-x1))*(world.balls[b].x-x1)+y1;
			if (world.balls[b].y < yBoundary) {
				world.balls[b].y = yBoundary;
				world.balls[b].vy *= -0.7;
				// world.balls.splice(b,1)
			}
			world.balls[b].draw();
		}
	},1);
}

function output(value) {
	return game.canvas.height-value;
}

// http://mediocredeveloper.com/wp/?p=55
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