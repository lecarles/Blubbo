'use strict';

Physijs.scripts.worker = '/js/physijs_worker.js';
Physijs.scripts.ammo = '/js/ammo.js';

var initScene, render, renderer, scene, camera, sphere, physGround, physGroundMaterial, ground, groundMaterial, ballMaterial, raycaster, ballMaterialWhite;
var radius = 100, theta = 0;

var selected = null;
var mouse = new THREE.Vector3;
var force = new THREE.Vector3;
var offset = new THREE.Vector3;

var startbutton = document.getElementById('viewport');

initScene = function () {
	
	//RENDERER
	renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.getElementById('viewport').appendChild(renderer.domElement);
	renderer.setClearColor(0x04f5fd, 1);

	//SCENE AND CAMERA
	scene = new Physijs.Scene;
	scene.setGravity(new THREE.Vector3(0, -35, 0));
	camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.z = 16;
	scene.add(camera);

	//TODO: LIGHTS HERE
	var am_light = new THREE.AmbientLight(0xB1B1B1, 0.3);
	scene.add(am_light);
	var light = new THREE.DirectionalLight(0x9D9D9D);
	light.position.set(0, 5, 5);
	scene.add(light);

	//MATERIALS
	groundMaterial = Physijs.createMaterial(
		new THREE.MeshLambertMaterial({ 
			color: 0x04f5fd, 
		
		}), //THREE.JS MATERIAL
		.9, // high friction
		.2 // low restitution
	);

	physGroundMaterial = Physijs.createMaterial(
		new THREE.MeshBasicMaterial({ 
			color: 0xff0000,
			opacity: 0,
			transparent: true, 
		
		}), //THREE.JS MATERIAL
		.9, // high friction
		.2 // low restitution
	);
	

	ballMaterial = Physijs.createMaterial(
		new THREE.MeshLambertMaterial({ color: 0x8dffb3 }), //THREE.JS MATERIAL
		0.5, 
		4
	);

	

	//OBJECT CREATING AND POSITIONING
	physGround = new Physijs.BoxMesh(
		new THREE.BoxGeometry(40, 3, 3),
		groundMaterial,
		0
	);

	physGround.position.y = -3.7;
	scene.add(physGround);

/* 	ground = new Physijs.PlaneMesh(
		new THREE.PlaneGeometry(40, 3, 32),
		groundMaterial,
		0
	);
	ground.position.y = -3.7;
	scene.add(ground); */

	sphere = new Physijs.SphereMesh(
		new THREE.SphereGeometry(0.7, 16, 16),
		ballMaterial,
		0.5
	);


	//RAYCAST+EVENT LISTENERS
	raycaster = new THREE.Raycaster(); //setup raycast
	document.addEventListener('mousemove', handleMouseMove, false); //raycast mousmove event
	document.addEventListener('mousedown', handleMouseDown, false);
	document.addEventListener('mouseup', handleMouseUp, false);
	document.addEventListener('keydown', onKeyDown, false);

	scene.addEventListener(
		'update',
		function () {

			if (selected !== null) {
				//blocks actually move here
				force.copy(mouse).sub(selected.position).multiplyScalar(8);
				force.z = 0;
				console.log(force);
				selected.setLinearVelocity(force);
				force.set(0, 0, 0);
				selected.applyCentralImpulse(force);
			}

			scene.simulate();
		}
	);


	scene.simulate(); // run physics
	scene.add(sphere);
	requestAnimationFrame(render);
};


//EVENT HANDLERS
function handleMouseMove(event) {
	event.preventDefault();
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

function handleMouseUp(event) {
	selected = null;
}


function handleMouseDown() {
	raycaster.setFromCamera(mouse, camera);
	var intersects = raycaster.intersectObject(sphere, false);

	if (intersects.length > 0) {
		selected = intersects[0].object;
	}
	console.log(mouse.x, mouse.y);

}

function changeColor(object, color) {
	object.material.color.setHex(color);
}


var onKeyDown = function (event) {
	if (event.keyCode == 13) { // enter
		var action = document.getElementById('cmd').value;

		if (action == "red") {
			changeColor(sphere, 0xff0000);
		}

		if (action == "blue") {
			changeColor(sphere, 0x0000ff);
		}

		if (action == "green") {
			changeColor(sphere, 0x8dffb3);
		}

		if (action == "chameleon") {
			var color = renderer.getClearColor();
			sphere.material.color.setRGB(color);
		}

		if (action == "80s Mode") {
			console.log("80");
			sphere.material.wireframe = true;
			physGround.material.wireframe = true;
			changeColor(sphere, 0xc542f4);
			changeColor(physGround, 0x5c4af9);
			renderer.setClearColor(0x000000, 1);
		}

		if (action == "space") {
			scene.setGravity(new THREE.Vector3(0, 0.5, 0));
			console.log("low gravity");
			requestAnimationFrame(render);
			scene.simulate();
		}
	}
};



render = function () {

	renderer.render(scene, camera); // render the scene
	requestAnimationFrame(render);
};

window.onload = initScene();




//UI CODE
//RESET
var reset = document.getElementById("reset-button");
reset.onclick = function () {
	scene.clear();
	initScene();
}
//HELP
var modal = document.getElementById('help-modal');
var btn = document.getElementById("help-button");
var span = document.getElementsByClassName("close")[0];
btn.onclick = function () {
	modal.style.display = "block";
}
span.onclick = function () {
	modal.style.display = "none";
}
window.onclick = function (event) {
	if (event.target == modal) {
		modal.style.display = "none";
	}
}