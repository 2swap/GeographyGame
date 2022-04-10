//The following is threeGeoJSON.js

//download geojson here: http://geojson.xyz/

var x_values = [];
var y_values = [];
var z_values = [];

function drawThreeGeo(json, radius, shape) {
    var json_geom = createGeometryArray(json);    
    var convertCoordinates = getConversionFunctionName(shape);
    
    for (var geom_num = 0; geom_num < json_geom.length; geom_num++) {
        let col = getRainbowColor(geom_num);
        if (new Date().getTime() / 500 % 2 == 1 && geom_num == question && guesses > 3) col = "white";

        if (json_geom[geom_num].type == 'Point') {
            convertCoordinates(json_geom[geom_num].coordinates, radius);            
            drawParticle(y_values[0], z_values[0], x_values[0]);
            
        } else if (json_geom[geom_num].type == 'MultiPoint') {
            for (var point_num = 0; point_num < json_geom[geom_num].coordinates.length; point_num++) {
                convertCoordinates(json_geom[geom_num].coordinates[point_num], radius);            
                drawParticle(y_values[0], z_values[0], x_values[0]);                
            }
            
        } else if (json_geom[geom_num].type == 'LineString') {
            
            for (var point_num = 0; point_num < json_geom[geom_num].coordinates.length; point_num++) {
                convertCoordinates(json_geom[geom_num].coordinates[point_num], radius);
            }            
            drawLine(y_values, z_values, x_values, col);
            
        } else if (json_geom[geom_num].type == 'Polygon') {
            for (var segment_num = 0; segment_num < json_geom[geom_num].coordinates.length; segment_num++) {
                for (var point_num = 0; point_num < json_geom[geom_num].coordinates[segment_num].length; point_num++) {
                    convertCoordinates(json_geom[geom_num].coordinates[segment_num][point_num], radius); 
                }                
                drawLine(y_values, z_values, x_values, col);
            }
            
        } else if (json_geom[geom_num].type == 'MultiLineString') {
            for (var segment_num = 0; segment_num < json_geom[geom_num].coordinates.length; segment_num++) {
                for (var point_num = 0; point_num < json_geom[geom_num].coordinates[segment_num].length; point_num++) {
                    convertCoordinates(json_geom[geom_num].coordinates[segment_num][point_num], radius); 
                }                
                drawLine(y_values, z_values, x_values, col);                
            }
            
        } else if (json_geom[geom_num].type == 'MultiPolygon') {
            for (var polygon_num = 0; polygon_num < json_geom[geom_num].coordinates.length; polygon_num++) {
                for (var segment_num = 0; segment_num < json_geom[geom_num].coordinates[polygon_num].length; segment_num++) {
                    for (var point_num = 0; point_num < json_geom[geom_num].coordinates[polygon_num][segment_num].length; point_num++) {
                        convertCoordinates(json_geom[geom_num].coordinates[polygon_num][segment_num][point_num], radius); 
                    }                    
                    drawLine(y_values, z_values, x_values, col);                    
                }
            }
        } else {
            throw new Error('The geoJSON is not valid.');
        }        
    }
}       
function createGeometryArray(json) {
    var geometry_array = [];

    if (json.type == 'Feature') {
        geometry_array.push(json.geometry);        
    } else if (json.type == 'FeatureCollection') {
        for (var feature_num = 0; feature_num < json.features.length; feature_num++) { 
            geometry_array.push(json.features[feature_num].geometry);            
        }
    } else if (json.type == 'GeometryCollection') {
        for (var geom_num = 0; geom_num < json.geometries.length; geom_num++) { 
            geometry_array.push(json.geometries[geom_num]);
        }
    } else {
        throw new Error('The geoJSON is not valid.');
    }    
    //alert(geometry_array.length);
    return geometry_array;
}
function getConversionFunctionName(shape) {
    var conversionFunctionName;
    
    if (shape == 'sphere') {
        conversionFunctionName = convertToSphereCoords;
    } else if (shape == 'plane') {
        conversionFunctionName = convertToPlaneCoords;
    } else {
        throw new Error('The shape that you specified is not valid.');
    }
    return conversionFunctionName;
}


function convertToSphereCoords(coordinates_array, sphere_radius) {
    var lon = coordinates_array[0];
    var lat = coordinates_array[1];

    x_values.push(Math.cos(lat * Math.PI/180) * Math.cos(lon * Math.PI/180) * sphere_radius);
    y_values.push(Math.cos(lat * Math.PI/180) * Math.sin(lon * Math.PI/180) * sphere_radius);
    z_values.push(Math.sin(lat * Math.PI/180) * sphere_radius);    
}
function convertToPlaneCoords(coordinates_array, radius) {
    var lon = coordinates_array[0];
    var lat = coordinates_array[1];
    var plane_offset = radius / 2;
        
    z_values.push((lat/180) * radius);
    y_values.push((lon/180) * radius);
}

function drawParticle(x, y, z) {
    var particle_geom = new THREE.Geometry();
    particle_geom.vertices.push(new THREE.Vector3(x, y, z));
    
    var particle_material = new THREE.PointsMaterial({color:"red", size:.008});
    
    var particle = new THREE.Points(particle_geom, particle_material);
    scene.add(particle);
    
    clearArrays();
}
function drawLine(x_values, y_values, z_values, col) {
    var line_geom = new THREE.Geometry();
    createVertexForEachPoint(line_geom, x_values, y_values, z_values);
                
    var line_material = new THREE.LineBasicMaterial({color:"red", linewidth:1});
    var line = new THREE.Line(line_geom, line_material);
    scene.add(line);
    
    clearArrays();
}

function createVertexForEachPoint(object_geometry, values_axis1, values_axis2, values_axis3) {
    for (var i = 0; i < values_axis1.length; i++) {
        object_geometry.vertices.push(new THREE.Vector3(values_axis1[i],
                values_axis2[i], values_axis3[i]));
    }
}

function clearArrays() {
    x_values.length = 0;
    y_values.length = 0;
    z_values.length = 0;    
}

const getRainbowColor = (t) => {
	t *= 107.29937
    const r = Math.floor(16 * Math.sqrt(Math.sin(t) * 128 + 128));
    const g = Math.floor(16 * Math.sqrt(Math.sin(t + Math.PI * 2 / 3) * 128 + 128));
    const b = Math.floor(16 * Math.sqrt(Math.sin(t + Math.PI * 4 / 3) * 128 + 128));
    return `rgba(${r}, ${g}, ${b}, 1)`;
};









//import three.js
const THREE = require('three');
const d3 = require('d3-geo');

var hiRes = confirm("Press OK to use the high resolution maps, cancel for low-resolution. (Warning: hi-res may crash your computer!)");

alert("Using " + (hiRes?"high":"low") + " resolution maps. Remember to press space to toggle between the map types.");

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

var globes = {};
var globeImages = [hiRes?'nightearth.gif':'mini_night.jpg', hiRes?'earth.jpg':'mini_earth.jpg', 'political.png', 'coastline.jpg'];

for(var x = 0; x < globeImages.length; x++){
	globes[x] = new THREE.Group();
	scene.add(globes[x]);
	let loader = new THREE.TextureLoader();
	loader.load('textures/'+globeImages[x], function(x){ return function ( texture ) {
		var sphere = new THREE.SphereGeometry( RADIUS, SEGMENTS, RINGS );
		var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );
		var mesh = new THREE.Mesh( sphere, material );
		console.log([x, mesh])
		globes[x].add(mesh);
	} }(x));
	globes[x].rotation.y = -Math.PI/2;
	globes[x].visible = x == visibility;
}

//Region files
var filenames = [
"My Cities",
"Malaysia",
"Cities",
"Elevation Points",
"More Populated",
"Points of Interest",
"Populated Places Simple",

"Bodies of Water",
"Brazil",
"Canada",
"Canadian Islands",
"Chile",
"China",
"Continents",
"Countries",
"Deserts",
"Disputed Areas",
"Egypt",
"Germany",
"Hawaii",
"Highlands",
"India",
"Indonesian Islands",
"Islands",
"Japan",
"Mexico",
"Mountain Ranges",
"Nigeria",
"North American Lakes",
"Oceans",
"Overseas Territories",
"Parks and Protected Lands",
"Pakistan",
"Peninsulas",
"Philippine Islands",
"Philippines",
"Regions",
"Rivers",
//"Russia",
"South Africa",
"Spain",
"UK Counties",
"UK Regions",
"USA Counties",
"USA States",
];

var geojsons = {};
for(var i = 0; i < filenames.length; i++){
	geojsons[filenames[i]] = require("../../public/geojson/" + filenames[i] + ".geo.json");
}

let countries = 0;
let question = 0;
let gameType = 0;
let newKey = 0;
let guesses = 1;
const CITIES = 0;
const COUNTRIES = 1;

function setQuestion(){
	question = Math.random()*(countries.features.length) << 0;
	guesses = 0
}
function setCountries(){
	newKey = filenames[Math.floor(Math.random()*filenames.length)];
	console.log(newKey);
	countries = geojsons[newKey];
	gameType = countries.features[0].geometry.type === "Point"? CITIES : COUNTRIES;
	while(scene.children.length > globeImages.length + 1) scene.remove(scene.children[globeImages.length + 1]);
	drawThreeGeo(countries, 1.0002, 'sphere');
	if(gameType == CITIES)
		drawThreeGeo(geojsons["Countries"], 1.0005, 'sphere');
	setQuestion();
	var text = "Now playing " + newKey + "! Click on: " + qName() + ".";
	alert(text);
	console.log(text);
}
setCountries();



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
	camera.lookAt(globes[visibility].position);
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
	else if (e.keyCode == '13') setCountries();
	else if (e.keyCode == '32') { // space
		globes[visibility].visible = false;
		visibility = (visibility + 1) % globeImages.length;
		console.log(visibility);
		globes[visibility].visible = true;
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
	var intersects = raycaster.intersectObjects( globes[visibility].children );
	if(typeof intersects[0] === "undefined"){
		return;
	}
	var point = intersects[0].point;
	var x = point.x, y = point.y, z = point.z;

	var lla = [-Math.atan2(x,-z)*180/Math.PI+180, Math.asin(y)*180/Math.PI];
	var corr = isCorrect(lla, question);
	if(corr){
		setQuestion();
		alert("Correct! Now, click on: " + qName() + ".");
	}
	else{
		const wrong = gameType == COUNTRIES? getCountry(lla) : getPoint(lla);
		const text = "No, that was " + wrong + ". Try again.";
		alert(text);
		console.log(text);
		guesses++;
	}
});

function qName(){
	return countries.features[question].properties.name;
}





function getPoint(lla){
	var bestDist = 1000000000;
	var bestI = 0;
	for(var i in countries.features){
		var dist = d3.geoDistance(countries.features[i].geometry.coordinates, lla);
		if(dist < bestDist){
			bestDist = dist;
			bestI = i;
		}
	}
	return bestDist < .005 ? countries.features[bestI].properties.name : ("not a listed point (dist: " +d3.geoDistance(lla, countries.features[question].geometry.coordinates) * 50 + "%)");
}
function getCountry(lla){
	for(var i = 0; i < countries.features.length; i++)
		if(isCorrect(lla,i)) return countries.features[i].properties.name;
}
function isCorrect(lla, q){
	if(gameType == COUNTRIES){
		var cw = countries.features[q].properties["direction"] === "counterclockwise";
		if(countries["chirality"] === "flip")
			cw = !cw;
		var contains = d3.geoContains(countries.features[q], lla);
		return cw != contains;
	}else{
		return getPoint(lla) == countries.features[q].properties.name;
	}
}
function getArea(polygon) {
  var i = -1,
      n = polygon.length,
      a,
      b = polygon[n - 1],
      area = 0;

  while (++i < n) {
    a = b;
    b = polygon[i];
    area += a[1] * b[0] - a[0] * b[1];
  }

  return area / 2;
}