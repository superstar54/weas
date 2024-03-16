import * as THREE from "three";
import { materials } from "./materials.js";

// A base function for creating and configuring a mesh
function createMesh(geometry, { position = [0, 0, 0], scale = [1, 1, 1], rotation = [0, 0, 0], color = "#bd0d87", opacity = 1.0, materialType = "Standard" }) {
  const material = materials[materialType].clone();
  material.color = new THREE.Color(color);
  material.transparent = true;
  material.opacity = opacity;
  material.side = THREE.DoubleSide;

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  mesh.rotation.set(...rotation);

  return mesh;
}

// Use the base function within specific shape functions
function drawCube(options) {
  console.log("options", options);
  const geometry = new THREE.BoxGeometry(options.size, options.size, options.size);
  return createMesh(geometry, options);
}

function drawCylinder(options) {
  const geometry = new THREE.CylinderGeometry(options.radius, options.radius, options.depth, options.segments);
  return createMesh(geometry, options);
}

function drawIcosahedron(options) {
  const geometry = new THREE.IcosahedronGeometry(options.radius, options.detail);
  return createMesh(geometry, options);
}

function drawCone(options) {
  const geometry = new THREE.ConeGeometry(options.radius, options.height, options.segments);
  return createMesh(geometry, options);
}

function drawPlane(options) {
  const geometry = new THREE.PlaneGeometry(options.width, options.height, options.widthSegments, options.heightSegments);
  return createMesh(geometry, options);
}

function drawSphere(options) {
  const geometry = new THREE.SphereGeometry(options.radius, options.widthSegments, options.heightSegments);
  return createMesh(geometry, options);
}

function drawTorus(options) {
  const geometry = new THREE.TorusGeometry(options.radius, options.tube, options.radialSegments, options.tubularSegments);
  return createMesh(geometry, options);
}

function drawArrow({ position = [0, 0, 0], direction = [0, 0, 1], length = 4, radius = 0.2, color = "#bd0d87", opacity = 1.0, materialType = "Standard" }) {
  const origin = new THREE.Vector3(...position);
  const dir = new THREE.Vector3(...direction);
  // Arrow Shaft (Cylinder)
  const cylinderGeometry = new THREE.CylinderGeometry(radius, radius, length, 8, 1); // Adjust segment count as needed
  // set scale
  // Arrowhead (Cone)
  const coneGeometry = new THREE.ConeGeometry(radius * 2, 6 * radius, 8); // 0.5 is the base radius, 2 is the height
  // align cone to point up
  coneGeometry.rotateY(Math.PI);
  // combine into a single mesh
  const arrow = new THREE.Object3D();
  const shaft = new THREE.Mesh(cylinderGeometry, material);
  shaft.scale.set(1, 1, 1);
  const cone = new THREE.Mesh(coneGeometry, material);
  cone.position.y = length / 2;
  arrow.add(shaft);
  arrow.add(cone);
  // set position and direction
  arrow.position.copy(origin);
  arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());

  return arrow;
}

export { drawCube, drawCylinder, drawIcosahedron, drawCone, drawPlane, drawSphere, drawTorus, drawArrow };
