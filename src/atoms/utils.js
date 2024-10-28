import * as THREE from "three";
import { materials } from "../tools/materials.js";

export const generatePhononTrajectory = (atoms, eigenvectors, amplitude, nframes) => {
  const trajectory = [];
  const times = Array.from({ length: nframes }, (_, i) => 2 * Math.PI * (i / nframes));
  times.forEach((t) => {
    const vectors = eigenvectors.map((vec) => vec.map((val) => val * amplitude * Math.sin(t)));
    const newAtoms = atoms.copy();
    for (let i = 0; i < newAtoms.positions.length; i++) {
      newAtoms.positions[i] = newAtoms.positions[i].map((pos, j) => pos + vectors[i][j] / 5);
    }
    newAtoms.newAttribute("movement", vectors);
    trajectory.push(newAtoms);
  });
  return trajectory;
};

// convert color to THREE.Color, the color can be a string or an array
export function convertColor(color) {
  if (Array.isArray(color)) {
    color = new THREE.Color(...color);
  } else {
    color = new THREE.Color(color);
  }
  return color;
}

export function drawAtoms({ atoms, atomScales, settings, colors, materialType = "Standard", data_type = "atom" }) {
  console.time("drawAtoms Time");
  // Create a basic sphere geometry for all atoms
  let radiusSegment = 32;
  let radius = 1;

  // change radiusSegment based on number of atoms
  if (atoms.symbols.length > 100000) {
    radiusSegment = 12;
  } else if (atoms.symbols.length > 10000) {
    radiusSegment = 18;
  } else if (atoms.symbols.length > 1000) {
    radiusSegment = 24;
  } else if (atoms.symbols.length > 100) {
    radiusSegment = 32;
  } else {
    radiusSegment = 32;
  }
  const atomGeometry = new THREE.SphereGeometry(1, radiusSegment, radiusSegment); // Unit sphere
  // console.log("materialType: ", materialType);
  const material = materials[materialType].clone();
  // Create a single instanced mesh for all atoms
  // May be added in the future: allocating a sufficiently large amount of instances and temporarily and use updateRange
  // const instancedMesh = new THREE.InstancedMesh(atomGeometry, material, Math.max(1000, atoms.symbols.length));
  const instancedMesh = new THREE.InstancedMesh(atomGeometry, material, atoms.symbols.length);
  // Position, scale, and color each atom
  let position = new THREE.Vector3();
  const rotation = new THREE.Quaternion();
  let scale = new THREE.Vector3();
  const instanceMatrix = new THREE.Matrix4();
  atoms.symbols.forEach((symbol, globalIndex) => {
    // Set position and scale
    position = new THREE.Vector3(...atoms.positions[globalIndex]);
    // if symbol in settings, use the radius and color from settings
    if (symbol in settings) {
      radius = settings[symbol].radius;
    } else {
      radius = 1;
    }
    //scale is radius * atomScales[globalIndex], radius * atomScales[globalIndex], radius * atomScales[globalIndex]
    scale.set(radius * atomScales[globalIndex], radius * atomScales[globalIndex], radius * atomScales[globalIndex]);
    // Set rotation
    instanceMatrix.compose(position, rotation, scale);
    instancedMesh.setMatrixAt(globalIndex, instanceMatrix);
    // Set color
    instancedMesh.setColorAt(globalIndex, colors[globalIndex]);
  });
  instancedMesh.userData.type = data_type;
  instancedMesh.userData.uuid = atoms.uuid;
  // the default objectMode for atoms is "edit"
  instancedMesh.userData.objectMode = "edit";

  // Update instance
  instancedMesh.instanceMatrix.needsUpdate = true;
  // if instancedMesh has instanceColor, update it
  if (instancedMesh.instanceColor) {
    instancedMesh.instanceColor.needsUpdate = true;
  }

  console.timeEnd("drawAtoms Time");
  return instancedMesh;
}
