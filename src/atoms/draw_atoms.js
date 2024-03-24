import * as THREE from "three";
import { covalentRadii, vdwRadii } from "./atoms_data.js";
import { materials } from "../tools/materials.js";

const Radii = { Covalent: covalentRadii, VDW: vdwRadii };

export function drawAtoms({ atoms, atomScales, colors, radiusType = "Covalent", materialType = "Standard", data_type = "atom" }) {
  console.time("drawAtoms Time");
  // console.log("atomScales: ", atomScales);
  console.log("Draw Atoms: ", +atoms.symbols.length, " atoms");
  // Create a basic sphere geometry for all atoms
  let radiusSegment = 32;

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
  console.log("materialType: ", materialType);
  const material = materials[materialType].clone();
  // Create a single instanced mesh for all atoms
  // May be added in the future: allocating a sufficiently large amount of instances and temporarily and use updateRange
  // const instancedMesh = new THREE.InstancedMesh(atomGeometry, material, Math.max(1000, atoms.symbols.length));
  const instancedMesh = new THREE.InstancedMesh(atomGeometry, material, atoms.symbols.length);
  // Position, scale, and color each atom
  atoms.symbols.forEach((symbol, globalIndex) => {
    const radius = Radii[radiusType][symbol] || 1;

    // Set position and scale
    const position = new THREE.Vector3(...atoms.positions[globalIndex]);
    const dummy = new THREE.Object3D();
    dummy.position.copy(position);
    const scale = atomScales[globalIndex];
    dummy.scale.set(radius * scale, radius * scale, radius * scale);
    dummy.updateMatrix();
    instancedMesh.setMatrixAt(globalIndex, dummy.matrix);
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
