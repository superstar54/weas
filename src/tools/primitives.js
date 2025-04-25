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

function drawArrow({
  position = [0, 0, 0],
  direction = [0, 0, 1],
  arrowLength = 1,
  arrowRadius = 0.05,
  coneHeight = 0.2,
  coneRadius = 0.1,
  color = "#bd0d87",
  opacity = 1.0,
  materialType = "Standard",
}) {
  const material = materials[materialType].clone();
  material.color = new THREE.Color(color);
  material.transparent = true;
  material.opacity = opacity;
  material.side = THREE.DoubleSide;
  const group = new THREE.Group();
  // change direction to Vector3
  direction = new THREE.Vector3(...direction);

  // Create the cylinder (arrow shaft)
  const shaftGeometry = new THREE.CylinderGeometry(arrowRadius, arrowRadius, arrowLength - coneHeight, 12);
  const shaft = new THREE.Mesh(shaftGeometry, material);
  // Position the shaft along the arrow direction
  shaft.position.set(0, (arrowLength - coneHeight) / 2, 0);
  group.add(shaft);
  // Create the cone (arrow head)
  const coneGeometry = new THREE.ConeGeometry(coneRadius, coneHeight, 12);
  const cone = new THREE.Mesh(coneGeometry, material);
  // Position the cone at the tip of the arrow
  cone.position.set(0, arrowLength - coneHeight / 2, 0);
  group.add(cone);
  // Rotate the entire group so that it points in the direction
  const axis = new THREE.Vector3(0, 1, 0); // Default arrow direction is along Y-axis
  const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, direction.clone().normalize());
  group.applyQuaternion(quaternion);
  group.position.set(...position);
  return group;
}

export { drawCube, drawCylinder, drawIcosahedron, drawCone, drawPlane, drawSphere, drawTorus, drawArrow };
