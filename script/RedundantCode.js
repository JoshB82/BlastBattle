// Redundant code

/* Block generation
for (var d = 0; d < this.coordsY[Math.floor(x*2)]; d+=6) {
	game.context.drawImage(game.dirt,(x1+x2)/2,output(d),6,6);
}
game.context.drawImage(game.grass,(x1+x2)/2,output(d),6,6);
*/

/* Grass (check +5)
for (var z = 0; z < game.canvas.width; z+=6) {
	game.context.drawImage(game.grass,z,output(y),6,6);
}
*/

//return cosineInterpolate(v1,v2,fractionalX);

function cosineInterpolate(a,b,x) {
	var f = (1-Math.cos(x))*0.5;
	return a*(1-f)+b*f;
}