import * as THREE from "three";
import { calculateCartesianCoordinates, calculateQuaternion } from "../../utils.js";
import { materials } from "../../tools/materials.js";
import { elementsWithPolyhedra, covalentRadii, elementColors } from "../atoms_data.js";

class Setting {
  constructor({ species1, species2, min = 0.0, max = 3.0, color1 = "#3d82ed", color2 = "#3d82ed", radius = 0.1, order = 1 }) {
    this.species1 = species1;
    this.species2 = species2;
    this.min = min;
    this.max = max;
    this.color1 = color1;
    this.color2 = color2;
    this.radius = radius;
    this.order = order;
  }

  toDict() {
    return {
      species1: this.species1,
      species2: this.species2,
      min: this.min,
      max: this.max,
      color1: this.color1,
      color2: this.color2,
      radius: this.radius,
      order: this.order,
    };
  }
}

export class BondManager {
  constructor(viewer) {
    this.viewer = viewer;
    this.scene = this.viewer.tjs.scene;
    this.settings = [];
    this.meshes = [];
    this.hideLongBonds = true;
    this.init();
  }

  init() {
    /* Initialize the bond settings from the viewer.atoms
    The default max is the sum of two radius of the species.
    The default color is from the elementColors.
    */
    console.log("init bond settings");
    this.settings = [];
    const atoms = this.viewer.originalAtoms;
    const symbols = atoms.symbols;
    const speciesSet = new Set(symbols);
    const speciesList = Array.from(speciesSet);
    for (let i = 0; i < speciesList.length; i++) {
      for (let j = 0; j < speciesList.length; j++) {
        const species1 = speciesList[i];
        const species2 = speciesList[j];
        const color1 = elementColors[this.viewer.colorType][species1];
        const color2 = elementColors[this.viewer.colorType][species2];
        const min = 0.0;
        const max = (covalentRadii[species1] + covalentRadii[species2]) * 1.1;
        const setting = new Setting({ species1, species2, min, max, color1, color2 });
        this.settings.push(setting);
      }
    }
  }

  fromSettings(settings) {
    /* Set the bond settings */
    this.settings = [];
    this.clearMeshes();
    // loop over settings to add each setting
    settings.forEach((setting) => {
      this.addSetting(setting);
    });
  }

  // Modify addSetting to accept a single object parameter
  addSetting({ species1, species2, radius, min = 0.0, max = 3.0, color1 = "#3d82ed", color2 = "#3d82ed", order = 1 }) {
    /* Add a new setting to the bond */
    const setting = new Setting({ species1, species2, radius, min, max, color1, color2, order });
    this.settings.push(setting);
  }

  buildBondDict() {
    /* Build a dictionary of cutoffs */
    const cutoffDict = {};
    this.settings.forEach((setting) => {
      const species1 = setting.species1;
      const species2 = setting.species2;
      const key1 = species1 + "-" + species2;
      const key2 = species2 + "-" + species1;
      cutoffDict[key1] = setting.toDict();
    });
    console.log("cutoffDict: ", cutoffDict);
    return cutoffDict;
  }

  clearMeshes() {
    /* Remove highlighted atom meshes from the selectedAtomsMesh group */
    this.meshes.forEach((mesh) => {
      clearObject(this.scene, mesh);
    });
  }

  drawBonds() {
    const offsets = [];
    for (let i = 0; i < this.viewer.modelSticks.length; i++) {
      if (this.viewer.modelSticks[i] !== 0) {
        offsets.push([i, [0, 0, 0]]);
      }
    }
    // add boundary atoms to offsets
    // console.log("boundaryList: ", this.viewer.boundaryList);
    if (this.viewer.boundaryList.length > 0) {
      for (let i = 0; i < this.viewer.boundaryList.length; i++) {
        offsets.push(this.viewer.boundaryList[i]);
      }
    }
    // I don't add bonded atoms to offsets, because the bondlist will add them through the bondedAtoms["bonds"]
    // console.log("offsets: ", offsets);
    this.bondList = buildBonds(this.viewer.originalAtoms, offsets, this.viewer.neighbors["map"], this.viewer._boundary, this.viewer.modelSticks);
    // merge the bondList and the bondedAtoms["bonds"]
    this.bondList = this.bondList.concat(this.viewer.bondedAtoms["bonds"]);
    if (this.viewer.debug) {
      console.log("bondList: ", this.bondList);
    }
    this.bondMap = buildBondMap(this.bondList);
    // console.log("bondMap: ", this.bondMap);
    let atomColors = null;
    if (this.viewer.colorBy !== "Element") {
      atomColors = this.viewer.atomColors;
    }
    this.bondMesh = drawStick(this.viewer.originalAtoms, this.bondList, this.buildBondDict(), this.viewer.bondRadius, this.viewer._materialType, atomColors);
    return this.bondMesh;
  }

  updateBondMesh(atomIndex = null, atoms = null) {
    /* When the atom is moved, the bonds should be moved as well.
    if atomIndex is null, update all bonds
    if atoms is null, use this.atoms, otherwise use the provided atoms to update the bonds, e.g. trajectory data
    */
    // console.log("updateBondMesh: ", atomIndex);
    if (atoms === null) {
      atoms = this.viewer.originalAtoms;
    }
    let bondIndices = [];
    if (atomIndex) {
      const bondMap = this.bondMap["bondMap"][atomIndex];
      if (bondMap) {
        bondMap.bonds.forEach((bondData) => {
          bondIndices.push(bondData[0]);
        });
      }
    } else {
      bondIndices = this.bondList.map((_, index) => index);
    }
    // console.log("bondIndices: ", bondIndices);
    // loop all bond indices and update the bonds
    bondIndices.forEach((i) => {
      const bond = this.bondList[i];
      const atomIndex1 = bond[0];
      const atomIndex2 = bond[1];
      const offset1 = bond[2];
      const offset2 = bond[3];
      let position1 = atoms.positions[atomIndex1].map((value, index) => value + calculateCartesianCoordinates(atoms.cell, offset1)[index]);
      let position2 = atoms.positions[atomIndex2].map((value, index) => value + calculateCartesianCoordinates(atoms.cell, offset2)[index]);
      position1 = new THREE.Vector3(...position1);
      position2 = new THREE.Vector3(...position2);
      const midpoint = new THREE.Vector3().lerpVectors(position1, position2, 0.25);
      const key = atoms.symbols[atomIndex1] + "-" + atoms.symbols[atomIndex2];
      // if key is not in the cutoffs, skip. In principle, this should not happen
      if (!this.viewer.cutoffs[key]) {
        return;
      }
      const cutoff = this.viewer.cutoffs[key].max;
      const quaternion = calculateQuaternion(position1, position2);
      const scale = calculateScale(position1, position2, this.viewer.bondRadius, cutoff, this.hideLongBonds);
      const instanceMatrix = new THREE.Matrix4().compose(midpoint, quaternion, scale);
      this.bondMesh.setMatrixAt(i, instanceMatrix);
      // this.bondMesh.setMatrixAt(2 * bondIndex + 1, instanceMatrixs[1]);
    });
    this.bondMesh.instanceMatrix.needsUpdate = true;
  }
}

export function drawStick(atoms, bondList, settings, radius = 0.1, materialType = "standard", atomColors = null) {
  /* Draw bonds between atoms.
  atoms: the atoms object
  bondList: list of bonds, each bond is a list of 4 elements:
  [atomIndex1, atomIndex2, offset1, offset2]
  radius: radius of the bond
  materialType: material type of the bond

  Returns:
  instancedMesh: the instancedMesh object of the bonds
  */
  console.time("drawBonds Time");
  // console.log("bondList: ", bondList);
  // console.log("settings: ", settings);
  console.log("atomColors: ", atomColors);

  const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 1, 8, 1); // Adjust segment count as needed

  const material = materials[materialType].clone();
  const instancedMesh = new THREE.InstancedMesh(cylinderGeometry, material, bondList.length);

  bondList.forEach(([index1, index2, offset1, offset2], instanceId) => {
    // console.log(index1, index2, offset1, offset2);
    var position1 = atoms.positions[index1].map((value, index) => value + calculateCartesianCoordinates(atoms.cell, offset1)[index]);
    position1 = new THREE.Vector3(...position1);
    // update position2 to include offset, dot product with cell
    var position2 = atoms.positions[index2].map((value, index) => value + calculateCartesianCoordinates(atoms.cell, offset2)[index]);
    position2 = new THREE.Vector3(...position2);
    // Setting color for each material
    const key = atoms.species[atoms.symbols[index1]].symbol + "-" + atoms.species[atoms.symbols[index2]].symbol;
    // if atomColors is not null, use the atomColors, otherwise use the settings
    const color1 = atomColors ? atomColors[index1] : new THREE.Color(settings[key].color1);
    const midpoint = new THREE.Vector3().lerpVectors(position1, position2, 0.25);
    const quaternion = calculateQuaternion(position1, position2);
    const scale = calculateScale(position1, position2, radius);
    const instanceMatrix = new THREE.Matrix4().compose(midpoint, quaternion, scale);
    instancedMesh.setMatrixAt(instanceId, instanceMatrix);
    instancedMesh.setColorAt(instanceId, color1);
  });

  instancedMesh.userData.type = "bond";
  instancedMesh.userData.uuid = atoms.uuid;
  instancedMesh.userData.objectMode = "edit";

  console.timeEnd("drawBonds Time");
  return instancedMesh;
}

export function calculateScale(position1, position2, radius, cutoff = null, hideLongBonds = true) {
  /* Calculate scale for the transformation
  position1: position of the first atom
  position2: position of the second atom
  radius: radius of the bond
  cutoff: cutoff for the bond length
  hideLongBonds: if true, hide the bonds that are longer than the cutoff

  Returns:
  scale: scale for the transformation
  */
  const length = position1.distanceTo(position2);
  // If the bond is large than the bond length cutoff, set the radius to 0 to avoid drawing it
  // This is a temporary fix, the bond should be removed from the bond list
  if (hideLongBonds && cutoff !== null && length > cutoff) {
    radius = 0;
  }
  const scale = new THREE.Vector3(radius, length / 2, radius);
  // Apply transformation to each instance
  // const instanceMatrix1 = new THREE.Matrix4().compose(midpoint1, quaternion, scale);
  return scale;
}

export function searchBondedAtoms(symbols, atomsList, neighbors, modelSticks) {
  /* search atoms bonded to atoms to be drawn
  symbols: list of symbols for each atom
  atomsList: list of atoms to be drawn
  neighbors: list of neighbors for each atom
  modelSticks: list of sticks for each atom

  Returns:
  atoms: list of atoms bonded to atoms to be drawn
  bonds: list of bonds, each bond is a list of 4 elements:
  [atomIndex1, atomIndex2, offset1, offset2]
  */
  // search atoms bonded to atoms to be drawn
  console.time("searchBondedAtoms Time");
  // console.log("modelSticks: ", modelSticks);
  let bondedAtomList = [];
  let bondList = [];
  atomsList.forEach((atom) => {
    const atomIndex = atom[0];
    if (modelSticks[atomIndex] === 0) {
      return;
    }
    // only find the atoms that are in the elementsWithPolyhedra
    if (!elementsWithPolyhedra.includes(symbols[atomIndex])) {
      // console.log("skip :", symbols[atomIndex])
      return;
    }
    // console.log("Atom: ", atomIndex, symbols[atomIndex], atom[1]);
    const offset = atom[1];
    const neighborsList = neighbors["map"][atomIndex];
    // skip if the atom has no neighbors
    if (neighborsList === undefined) {
      return;
    }
    // console.log("neighborsList: ", neighborsList)
    // loop neighborsList and find the atoms bonded to the boundary atoms
    neighborsList.forEach((neighbor) => {
      const neighborIndex = neighbor[0];
      const neighborOffset = neighbor[1];
      if (modelSticks[neighborIndex] === 0) {
        return;
      }
      // offset should be the sum of the original offset and the neighbor offset
      const newOffset = [offset[0] + neighborOffset[0], offset[1] + neighborOffset[1], offset[2] + neighborOffset[2]];
      // check if the neighbor atom is not in the original cell
      if (newOffset[0] != 0 || newOffset[1] != 0 || newOffset[2] != 0) {
        const bondedAtom = [neighborIndex, newOffset];
        // console.log("Add atom : ", bondedAtom);
        bondedAtomList.push(bondedAtom);
        bondList.push([atomIndex, neighborIndex, offset, newOffset]);
        bondList.push([neighborIndex, atomIndex, newOffset, offset]);
      }
    });
  });
  console.timeEnd("searchBondedAtoms Time");
  return { atoms: bondedAtomList, bonds: bondList };
}

export function buildBonds(atoms, offsets, neighbors, boundary, modelSticks) {
  /* build bonds between atoms
  atoms: list of atoms to be drawn
  offsets: list of offsets for each atom
  neighbors: list of neighbors for each atom
  boundary: boundary of the cell
  modelSticks: list of sticks for each atom

  Returns:
  bonds: list of bonds, each bond is a list of 4 elements:
  [atomIndex1, atomIndex2, offset1, offset2]
  */
  // Start timer for buildBonds
  console.time("buildBonds Time");
  // console.log("neighbors: ", neighbors);
  // console.log("buildBond, offsets: ", offsets);
  // console.log("boundary: ", boundary);
  // console.log("modelSticks: ", modelSticks);
  const bonds = [];
  // if the cell is undefined,
  // no boundary condition, just loop all offsets and find the neighbors
  if (atoms.isUndefinedCell()) {
    for (let i = 0; i < offsets.length; i++) {
      const atomIndex1 = offsets[i][0];
      const offset1 = offsets[i][1];
      const neighborsList = neighbors[atomIndex1];
      // skip if the atom stick is 0, or atom has no neighbors
      if ((modelSticks[atomIndex1] === 0) | (neighborsList === undefined)) {
        continue;
      }
      for (let j = 0; j < neighborsList.length; j++) {
        const atomIndex2 = neighborsList[j][0];
        if (modelSticks[atomIndex2] === 0) {
          continue;
        }
        const offset2 = neighborsList[j][1];
        // sum the two offsets
        const offsetSum = offset1.map((value, index) => value + offset2[index]);
        bonds.push([atomIndex1, atomIndex2, offset1, offsetSum]);
      }
    }
  } else {
    // loop all offsets and find the neighbors
    const fract_positions = atoms.calculateFractionalCoordinates();
    // console.log("fract_positions: ", fract_positions)
    for (let i = 0; i < offsets.length; i++) {
      const atomIndex1 = offsets[i][0];
      const offset1 = offsets[i][1];
      const neighborsList = neighbors[atomIndex1];
      // skip if the atom stick is 0, or atom has no neighbors
      if ((modelSticks[atomIndex1] === 0) | (neighborsList === undefined)) {
        continue;
      }
      for (let j = 0; j < neighborsList.length; j++) {
        const atomIndex2 = neighborsList[j][0];
        if (modelSticks[atomIndex2] === 0) {
          continue;
        }
        const offset2 = neighborsList[j][1];
        // if offset2 is [0, 0, 0], the neighbor atom is in the original cell
        // just add the bond
        // if (offset2[0] === 0 && offset2[1] === 0 && offset2[2] === 0) {
        //   bonds.push([atomIndex1, atomIndex2, offset1, offset1]);
        //   continue;
        // }
        // else, sum the two offsets, and check if the neighbor atom is inside the boundary
        const offsetSum = offset1.map((value, index) => value + offset2[index]);
        // check if the neighbor atom is inside the boundary
        const newPosition = fract_positions[atomIndex2].map((value, index) => value + offsetSum[index]);
        // console.log("newPosition: ", newPosition);
        if (
          boundary[0][0] <= newPosition[0] &&
          newPosition[0] <= boundary[0][1] &&
          boundary[1][0] <= newPosition[1] &&
          newPosition[1] <= boundary[1][1] &&
          boundary[2][0] <= newPosition[2] &&
          newPosition[2] <= boundary[2][1]
        ) {
          bonds.push([atomIndex1, atomIndex2, offset1, offsetSum]);
          // console.log(atomIndex1, atomIndex2, offset1, offsetSum);
        }
      }
    }
  }
  // End timer for buildBonds
  console.timeEnd("buildBonds Time");

  return bonds;
}

export function buildBondMap(bondList) {
  /* find bond list for each atom, so that when the atoms are moved,
  the bonds can be updated.
  bondMap: {atomIndex, bonds: [[bondIndex, isStart]]}}
  bondMapWithOffset: {atomIndex-offset, bonds: [[bondIndex, isStart]]}}
  */
  const bondMap = {};
  const bondMapWithOffset = {};
  for (let i = 0; i < bondList.length; i++) {
    // without offset
    const bond = bondList[i];
    if (bondMap[bond[0]]) {
      bondMap[bond[0]]["bonds"].push([i, true]);
    } else {
      bondMap[bond[0]] = { atomIndex: bond[0], bonds: [[i, true]] };
    }
    if (bondMap[bond[1]]) {
      bondMap[bond[1]]["bonds"].push([i, false]);
    } else {
      bondMap[bond[1]] = { atomIndex: bond[1], bonds: [[i, false]] };
    }
    // with offset
    const key1 = bond[0] + "-" + bond[2].join("-");
    if (bondMapWithOffset[key1]) {
      bondMapWithOffset[key1]["bonds"].push([i, true]);
    } else {
      bondMapWithOffset[key1] = { atomIndex: bond[0], bonds: [[i, true]] };
    }
    const key2 = bond[1] + "-" + bond[3].join("-");
    if (bondMapWithOffset[key2]) {
      bondMapWithOffset[key2]["bonds"].push([i, false]);
    } else {
      bondMapWithOffset[key2] = { atomIndex: bond[1], bonds: [[i, false]] };
    }
  }
  return { bondMap: bondMap, bondMapWithOffset: bondMapWithOffset };
}
