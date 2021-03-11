//The following is threeGeoJSON.js

var x_values = [];
var y_values = [];
var z_values = [];

function drawThreeGeo(json, radius, shape, options) {
    var json_geom = createGeometryArray(json);    
    var convertCoordinates = getConversionFunctionName(shape);    
    
    for (var geom_num = 0; geom_num < json_geom.length; geom_num++) {
                
        if (json_geom[geom_num].type == 'Point') {
            convertCoordinates(json_geom[geom_num].coordinates, radius);            
            drawParticle(y_values[0], z_values[0], x_values[0], options);
            
        } else if (json_geom[geom_num].type == 'MultiPoint') {
            for (var point_num = 0; point_num < json_geom[geom_num].coordinates.length; point_num++) {
                convertCoordinates(json_geom[geom_num].coordinates[point_num], radius);            
                drawParticle(y_values[0], z_values[0], x_values[0], options);                
            }
            
        } else if (json_geom[geom_num].type == 'LineString') {
            
            for (var point_num = 0; point_num < json_geom[geom_num].coordinates.length; point_num++) {
                convertCoordinates(json_geom[geom_num].coordinates[point_num], radius);
            }            
            drawLine(y_values, z_values, x_values, options);
            
        } else if (json_geom[geom_num].type == 'Polygon') {
            for (var segment_num = 0; segment_num < json_geom[geom_num].coordinates.length; segment_num++) {
                for (var point_num = 0; point_num < json_geom[geom_num].coordinates[segment_num].length; point_num++) {
                    convertCoordinates(json_geom[geom_num].coordinates[segment_num][point_num], radius); 
                }                
                drawLine(y_values, z_values, x_values, options);
            }
            
        } else if (json_geom[geom_num].type == 'MultiLineString') {
            for (var segment_num = 0; segment_num < json_geom[geom_num].coordinates.length; segment_num++) {
                for (var point_num = 0; point_num < json_geom[geom_num].coordinates[segment_num].length; point_num++) {
                    convertCoordinates(json_geom[geom_num].coordinates[segment_num][point_num], radius); 
                }                
                drawLine(y_values, z_values, x_values);                
            }
            
        } else if (json_geom[geom_num].type == 'MultiPolygon') {
            for (var polygon_num = 0; polygon_num < json_geom[geom_num].coordinates.length; polygon_num++) {
                for (var segment_num = 0; segment_num < json_geom[geom_num].coordinates[polygon_num].length; segment_num++) {
                    for (var point_num = 0; point_num < json_geom[geom_num].coordinates[polygon_num][segment_num].length; point_num++) {
                        convertCoordinates(json_geom[geom_num].coordinates[polygon_num][segment_num][point_num], radius); 
                    }                    
                    drawLine(y_values, z_values, x_values, options);                    
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

function drawParticle(x, y, z, options) {
    var particle_geom = new THREE.Geometry();
    particle_geom.vertices.push(new THREE.Vector3(x, y, z));
    
    var particle_material = new THREE.ParticleSystemMaterial(options);
    
    var particle = new THREE.ParticleSystem(particle_geom, particle_material);
    scene.add(particle);
    
    clearArrays();
}
function drawLine(x_values, y_values, z_values, options) {
    var line_geom = new THREE.Geometry();
    createVertexForEachPoint(line_geom, x_values, y_values, z_values);
                
    var line_material = new THREE.LineBasicMaterial(options);
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

const globe = new THREE.Group();
scene.add(globe);
var loader = new THREE.TextureLoader();
loader.load( hiRes?'textures/earth.jpg':'textures/mini_earth.jpg', function ( texture ) {
	var sphere = new THREE.SphereGeometry( RADIUS, SEGMENTS, RINGS );
	var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );
	var mesh = new THREE.Mesh( sphere, material );
	globe.add(mesh);
} );
globe.rotation.y = -Math.PI/2;
globe.visible = true;

const cityglobe = new THREE.Group();
scene.add(cityglobe);
var loader = new THREE.TextureLoader();
loader.load( hiRes?'textures/nightearth.gif':'textures/mini_night.jpg', function ( texture ) {
	var sphere = new THREE.SphereGeometry( RADIUS, SEGMENTS, RINGS );
	var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );
	var mesh = new THREE.Mesh( sphere, material );
	cityglobe.add(mesh);
} );
cityglobe.rotation.y = -Math.PI/2;
cityglobe.visible = false;

//Region files
var regions = {
	bodiesofwater : require("../../public/geojson/bodiesofwater.geo.json"),
	canadianislands : require("../../public/geojson/canadianislands.geo.json"),
	canary : require("../../public/geojson/canary.geo.json"),
	countries : require("../../public/geojson/countries.geo.json"),
	deserts : require("../../public/geojson/deserts.geo.json"),
	disputed : require("../../public/geojson/disputed.geo.json"),
	features : require("../../public/geojson/features.geo.json"),
	hawaiianislands : require("../../public/geojson/hawaiianislands.geo.json"),
	indonesianislands : require("../../public/geojson/indonesianislands.geo.json"),
	islands : require("../../public/geojson/islands.geo.json"),
	mountainranges : require("../../public/geojson/mountainranges.geo.json"),
	peninsulas : require("../../public/geojson/peninsulas.geo.json"),
	philippineislands : require("../../public/geojson/philippineislands.geo.json"),
	rivers : require("../../public/geojson/rivers.geo.json"),
	ukregions : require("../../public/geojson/ukregions.geo.json"),
}
var countries = 0;
setCountries();
//Point files
var cities = require("../../public/geojson/cities.geo.json");

function setCountries(){
	var keys = Object.keys(regions);
	var regionslen = keys.length;
	var newKey = keys[Math.floor(Math.random()*regionslen)];
	countries = regions[newKey];
	while(scene.children.length > 2) scene.remove(scene.children[2]);
	drawThreeGeo(countries, 1.0003, 'sphere', {color: 'red'});
	console.log("Now playing " + newKey + "!");
}


var question = 0;
var questionType = 0;
setQuestion();
function setQuestion(){
	questionType = Math.random()<1;
	question = Math.random()*((questionType?countries:cities).features.length) << 0;
}

alert("Click on: " + qName() + ".");



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
	else if (e.keyCode == '13') setCountries();
	else if (e.keyCode == '32') {
		visibility++;
		globe.visible = visibility%2==0;
		cityglobe.visible = visibility%2==1;
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

	var lla = [-Math.atan2(x,-z)*180/Math.PI+180, Math.asin(y)*180/Math.PI];
	var corr = isCorrect(lla, question);
	if(corr){
		setQuestion();
		alert("Correct! Now, click on: " + qName() + ".");
	}
	else{
		var wrong = questionType? getCountry(lla) : getCity(lla);
		alert("No, that was " + wrong + ". Try again.");
	}
});

function qName(){
	return (questionType?countries:cities).features[question].properties.name;
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
	if(questionType){
		var cw = countries.features[q].properties.direction == "clockwise";//q > 176 && q < 481;
		var contains = d3.geoContains(countries.features[q], lla);
		return cw == contains;
	}else{
		return getCity(lla) == cities.features[q].properties.name;
	}
}
