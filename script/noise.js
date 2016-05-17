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