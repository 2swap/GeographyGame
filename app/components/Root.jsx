//import three.js
const THREE = require('three');
const d3 = require('d3-geo');

var hiRes = confirm("Press OK to use the high resolution maps, cancel for low-resolution. (Warning: hi-res may crash your computer!)");

alert("Using " + (hiRes?"high":"low") + " resolution maps. Remember to press space to toggle between the map types.");

var countries = require("../../public/geojson/countries.geo.json");
var cities = require("../../public/geojson/cities.geo.json");

var question = 0;
var questionType = 0;
setQuestion();
function setQuestion(){
	questionType = Math.random()*2 << 0;
	question = Math.random()*((questionType == 0?countries:cities).features.length) << 0;
}

alert("Click on: " + qName() + ".");

//export stateless React component
export default function Root() {
	return null;
}

//Setup:
var w = window.innerWidth;
var h = window.innerHeight;

var gz = 2, dist = 2;
var ry = 0;
var rx = 0;
var raycaster = new THREE.Raycaster();

//get the DOM element in which you want to attach the scene
const container = document.querySelector('#container');

//create a WebGL renderer
const renderer = new THREE.WebGLRenderer();

//set the renderer size
renderer.setSize(w,h);

//Adding a Camera
const VIEW_ANGLE = 45;
const ASPECT = w/h;
const NEAR = 0.01;
const FAR = 10000;
const camera =
new THREE.PerspectiveCamera(
	VIEW_ANGLE,
	ASPECT,
	NEAR,
	FAR
);
camera.position.set( 0, 0, 0 );

const scene = new THREE.Scene();
scene.background = new THREE.Color( 0x000 );
scene.add(camera);
container.appendChild(renderer.domElement);

const RADIUS = 1;
const SEGMENTS = 50;
const RINGS = 50;

var visibility = 0;

const globe = new THREE.Group();
scene.add(globe);
var loader = new THREE.TextureLoader();
loader.load( hiRes?'earth.jpg':'mini_earth.jpg', function ( texture ) {
	var sphere = new THREE.SphereGeometry( RADIUS, SEGMENTS, RINGS );
	var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );
	var mesh = new THREE.Mesh( sphere, material );
	globe.add(mesh);
} );
globe.rotation.y = Math.PI/2;
globe.visible = false;

const polglobe = new THREE.Group();
scene.add(polglobe);
var loader = new THREE.TextureLoader();
loader.load( 'political.png', function ( texture ) {
	var sphere = new THREE.SphereGeometry( RADIUS, SEGMENTS, RINGS );
	var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );
	var mesh = new THREE.Mesh( sphere, material );
	polglobe.add(mesh);
} );
polglobe.rotation.y = Math.PI/2;
polglobe.visible = false;

const cityglobe = new THREE.Group();
scene.add(cityglobe);
var loader = new THREE.TextureLoader();
loader.load( hiRes?'nightearth.gif':'mini_night.jpg', function ( texture ) {
	var sphere = new THREE.SphereGeometry( RADIUS, SEGMENTS, RINGS );
	var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );
	var mesh = new THREE.Mesh( sphere, material );
	cityglobe.add(mesh);
} );
cityglobe.rotation.y = Math.PI/2;
cityglobe.visible = true;







function approach(a,b){
	return (a*5+b)/6;
}
var loaded = false;
window.onload = function(){loaded = true;};
setInterval(function(){
	dist = approach(dist, (gz+1));
	camera.position.x = approach(camera.position.x, dist*Math.cos(rx)*Math.sin(ry));
	camera.position.y = approach(camera.position.y, dist*Math.sin(rx));
	camera.position.z = approach(camera.position.z,-dist*Math.cos(rx)*Math.cos(ry));
	camera.lookAt(globe.position);
	renderer.render(scene, camera);
	if(loaded) document.getElementById("q").innerHTML = qName();
},20);














//callback function for key press event listener
function checkKey(e) {
	e = e || window.event;
	e.preventDefault();
	     if (e.keyCode == '38') rx+=0.2;
	else if (e.keyCode == '40') rx-=0.2;
	else if (e.keyCode == '37') ry+=0.2;
	else if (e.keyCode == '39') ry-=0.2;
	else if (e.keyCode == '32') {
		visibility++;
		globe.visible = visibility%3==0;
		cityglobe.visible = visibility%3==1;
		polglobe.visible = visibility%3==2;
	}
}

//on key down, call checkKey
document.onkeydown = checkKey;

//callback function for mouse move event listener
function rotateOnMouseMove(e) {
	e = e || window.event;
	
	gz *= e.deltaY>0?1.25:0.8;
	var mult = Math.sign(e.deltaY);
	
	var dx = ( (e.clientX-w/2) * .0002 * gz * mult);
	var dy = ( (e.clientY-h/2) * .0002 * gz * mult);
	
	dx = Math.min(dx,.3);
	dy = Math.min(dy,.3);
	dx = Math.max(dx,-.3);
	dy = Math.max(dy,-.3);
	
	ry += dx;
	rx += dy;
	
	//put in proper ranges
	rx = Math.max(Math.min(Math.PI/2, rx),-Math.PI/2);
	gz = Math.min(5, Math.max(.03, gz));
}

//on mousemove, call rotateOnMouseMove
document.addEventListener("wheel", rotateOnMouseMove);
document.addEventListener("click", function(e){
	var mouse = {x:0,y:0};
	mouse.x =  (e.clientX / w) * 2 - 1;
	mouse.y = -(e.clientY / h) * 2 + 1;
	raycaster.setFromCamera( mouse, camera );
	
	//find point of intersection
	var intersects = raycaster.intersectObjects( globe.children );
	var point = intersects[0].point;
	var x = point.x, y = point.y, z = point.z;

	var lla = [-Math.atan2(x,-z)*180/Math.PI, Math.asin(y)*180/Math.PI];
	var corr = isCorrect(lla, question);
	if(corr){
		setQuestion();
		alert("Correct! Now, click on: " + qName() + ".");
	}
	else{
		var wrong = questionType == 0? getCountry(lla) : getCity(lla);
		alert("No, that was " + wrong + ". Try again.");
	}
});

function qName(){
	return (questionType == 0?countries:cities).features[question].properties.name;
}





function getCity(lla){
	var bestDist = 1000000000;
	var bestI = 0;
	for(var i in cities.features){
		var dist = d3.geoDistance(cities.features[i].geometry.coordinates, lla);
		if(dist < bestDist){
			bestDist = dist;
			bestI = i;
		}
	}
	return bestDist < .005 ? cities.features[bestI].properties.name : ("not a listed city (dist: " +d3.geoDistance(lla, cities.features[question].geometry.coordinates) * 50 + "%)");
}
function getCountry(lla){
	for(var i = 0; i < countries.features.length; i++)
		if(isCorrect(lla,i)) return countries.features[i].properties.name;
}
function isCorrect(lla, q){
	if(questionType==0){
		var cw = countries.features[q].properties.direction == "clockwise";//q > 176 && q < 481;
		var contains = d3.geoContains(countries.features[q], lla);
		return cw == contains;
	}else{
		return getCity(lla) == cities.features[q].properties.name;
	}
}
