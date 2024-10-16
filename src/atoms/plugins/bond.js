import * as THREE from "three";
import { calculateCartesianCoordinates, calculateQuaternion } from "../../utils.js";
import { materials } from "../../tools/materials.js";
import { elementsWithPolyhedra, covalentRadii, elementColors, default_bond_pairs } from "../atoms_data.js";
import { convertColor } from "../utils.js";
import { kdTree } from "../../geometry/kdTree.js";
import { searchBoundary } from "./boundary.js";

class Setting {
  constructor({ species1, species2, min = 0.0, max = 3.0, color1 = "#3d82ed", color2 = "#3d82ed", radius = 0.1, order = 1 }) {
    this.species1 = species1;
    this.species2 = species2;
    this.min = min;
    this.max = max;
    this.color1 = convertColor(color1);
    this.color2 = convertColor(color2);
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
  constructor(viewer, hideLongBonds = true) {
    this.viewer = viewer;
    this.scene = this.viewer.tjs.scene;
    this.settings = {};
    this.meshes = [];
    this.hideLongBonds = hideLongBonds;
    this.bondRadius = 0.1;
    this.init();
  }

  init() {
    /* Initialize the bond settings from the viewer.atoms
    The default max is the sum of two radius of the species.
    The default color is from the elementColors.
    */
    this.viewer.logger.debug("init bond settings");
    this.settings = {};
    Object.entries(this.viewer.originalAtoms.species).forEach(([symbol1, species1]) => {
      Object.entries(this.viewer.originalAtoms.species).forEach(([symbol2, species2]) => {
        const key = JSON.stringify([symbol1, symbol2]);
        const elementPair = species1.element + "-" + species2.element;
        // if the elementPair is not in the default_bond_pairs, skip
        if (default_bond_pairs[elementPair] === undefined) {
          return;
        }
        this.settings[key] = this.getDefaultSetting(species1, species2);
      });
    });
  }

  getDefaultSetting(species1, species2) {
    /* Get the default bond setting for the species1 and species2 */
    const color1 = this.viewer.atomManager.settings[species1.symbol].color;
    const color2 = this.viewer.atomManager.settings[species2.symbol].color;
    const radius1 = this.viewer.atomManager.settings[species1.symbol].radius;
    const radius2 = this.viewer.atomManager.settings[species2.symbol].radius;
    const min = 0.0;
    const max = (radius1 + radius2) * 1.1;
    const symbol1 = species1.symbol;
    const symbol2 = species2.symbol;
    const setting = new Setting({ species1: symbol1, species2: symbol2, min, max, color1, color2 });
    return setting;
  }

  fromSettings(settings) {
    /* Set the bond settings */
    this.settings = {};
    this.clearMeshes();
    // loop over settings to add each setting
    Object.values(settings).forEach((setting) => {
      this.addSetting(setting);
    });
  }

  // Modify addSetting to accept a single object parameter
  addSetting({ species1, species2, radius, min = 0.0, max = 3.0, color1 = "#3d82ed", color2 = "#3d82ed", order = 1 }) {
    /* Add a new setting to the bond */
    const setting = new Setting({ species1, species2, radius, min, max, color1, color2, order });
    const key = JSON.stringify([species1, species2]);
    this.settings[key] = setting;
  }

  buildBondDict() {
    /* Build a dictionary of cutoffs */
    const cutoffDict = {};
    Object.values(this.settings).forEach((setting) => {
      const species1 = setting.species1;
      const species2 = setting.species2;
      const key1 = species1 + "-" + species2;
      cutoffDict[key1] = setting.toDict();
    });
    this.viewer.logger.debug("cutoffDict: ", cutoffDict);
    this.viewer.cutoffs = cutoffDict;
  }

  buildNeighborList() {
    this.buildBondDict();
    // find neighbor atoms in the original cell
    this.viewer.neighbors = findNeighbors(this.viewer.originalAtoms, this.viewer.cutoffs);
    this.viewer.logger.debug("neighbors: ", this.viewer.neighbors);
  }

  clearMeshes() {
    /* Remove highlighted atom meshes from the selectedAtomsMesh group */
    this.meshes.forEach((mesh) => {
      clearObject(this.scene, mesh);
    });
    this.meshes = [];
  }

  drawBonds() {
    const offsets = [];
    for (let i = 0; i < this.viewer.modelSticks.length; i++) {
      if (this.viewer.modelSticks[i] !== 0) {
        offsets.push([i, [0, 0, 0]]);
      }
    }
    // add boundary atoms to offsets
    // this.viewer.logger.debug("boundaryList: ", this.viewer.boundaryList);
    if (this.viewer.boundaryList.length > 0) {
      for (let i = 0; i < this.viewer.boundaryList.length; i++) {
        offsets.push(this.viewer.boundaryList[i]);
      }
    }
    // I don't add bonded atoms to offsets, because the bondlist will add them through the bondedAtoms["bonds"]
    // this.viewer.logger.debug("offsets: ", offsets);
    this.bondList = buildBonds(this.viewer.originalAtoms, offsets, this.viewer.neighbors["map"], this.viewer._boundary, this.viewer.modelSticks);
    // loop the bondedAtoms["bonds"] and add the bonds to the bondList
    this.viewer.bondedAtoms["bonds"].forEach((bond) => {
      // if key not in the settings, skip
      const key = this.viewer.originalAtoms.symbols[bond[0]] + "-" + this.viewer.originalAtoms.symbols[bond[1]];
      if (this.viewer.cutoffs[key]) {
        this.bondList.push(bond);
      }
    });
    if (this.viewer.debug) {
      this.viewer.logger.debug("bondList: ", this.bondList);
    }
    this.bondMap = buildBondMap(this.bondList);
    // this.viewer.logger.debug("bondMap: ", this.bondMap);
    let atomColors = null;
    if (this.viewer.colorBy !== "Element") {
      atomColors = this.viewer.atomColors;
    }
    this.bondMesh = drawStick(this.viewer.originalAtoms, this.bondList, this.viewer.cutoffs, this.bondRadius, this.viewer._materialType, atomColors);
    return this.bondMesh;
  }

  updateBondMesh(atomIndex = null, atoms = null) {
    /* When the atom is moved, the bonds should be moved as well.
    if atomIndex is null, update all bonds
    if atoms is null, use this.atoms, otherwise use the provided atoms to update the bonds, e.g. trajectory data
    */
    // this.viewer.logger.debug("updateBondMesh: ", atomIndex);
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
    // this.viewer.logger.debug("bondIndices: ", bondIndices);
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
      const midpoint1 = new THREE.Vector3().lerpVectors(position1, position2, 0.25);
      const key = atoms.symbols[atomIndex1] + "-" + atoms.symbols[atomIndex2];
      // if key is not in the cutoffs, skip. In principle, this should not happen
      if (!this.viewer.cutoffs[key]) {
        return;
      }
      const cutoff = this.viewer.cutoffs[key].max;
      const quaternion = calculateQuaternion(position1, position2);
      const scale = calculateScale(position1, position2, this.bondRadius, cutoff, this.hideLongBonds);
      const instanceMatrix = new THREE.Matrix4().compose(midpoint1, quaternion, scale);
      this.bondMesh.setMatrixAt(i * 2, instanceMatrix);
      // set the second bond
      const midpoint2 = new THREE.Vector3().lerpVectors(position1, position2, 0.75);
      const instanceMatrix2 = new THREE.Matrix4().compose(midpoint2, quaternion, scale);
      this.bondMesh.setMatrixAt(i * 2 + 1, instanceMatrix2);
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
  console.log("settings: ", settings);
  // console.log("atomColors: ", atomColors);

  const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 1, 8, 1); // Adjust segment count as needed

  const material = materials[materialType].clone();
  const instancedMesh = new THREE.InstancedMesh(cylinderGeometry, material, bondList.length * 2);

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
    const color1 = atomColors ? atomColors[index1] : settings[key].color1;
    const midpoint1 = new THREE.Vector3().lerpVectors(position1, position2, 0.25);
    const quaternion = calculateQuaternion(position1, position2);
    const scale = calculateScale(position1, position2, radius);
    const instanceMatrix = new THREE.Matrix4().compose(midpoint1, quaternion, scale);
    instancedMesh.setMatrixAt(instanceId * 2, instanceMatrix);
    instancedMesh.setColorAt(instanceId * 2, color1);
    // set the second bond
    const color2 = atomColors ? atomColors[index2] : settings[key].color2;
    const midpoint2 = new THREE.Vector3().lerpVectors(position1, position2, 0.75);
    const instanceMatrix2 = new THREE.Matrix4().compose(midpoint2, quaternion, scale);
    instancedMesh.setMatrixAt(instanceId * 2 + 1, instanceMatrix2);
    instancedMesh.setColorAt(instanceId * 2 + 1, color2);
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

export function findNeighbors(atoms, cutoffs, include_self = false, pbc = true) {
  /* Function to find neighbors within a certain cutoff
  Args:
    atoms: Atoms object
    cutoffs: Dictionary of cutoffs for each species pair, has min and max
    include_self: Include self in the neighbors list
    pbc: Periodic boundary conditions
  */
  console.time("findNeighbors Time");
  // Create offsets for each atom
  let offsets = atoms.positions.map((_, index) => [index, [0, 0, 0]]);
  let offsets1;
  const maxCutoff = Math.max(...Object.values(cutoffs).map((cutoff) => cutoff.max));
  // console.log("maxCutoff: ", maxCutoff);
  // if pbc is true, include the atoms just outside the boundary with maxCutoff
  if (pbc) {
    // calculate the boundary using max cutoff
    // scaled the maxCutoff by unit cell
    const cellData = atoms.getCellLengthsAndAngles();
    const boundary = [
      [-maxCutoff / cellData[0], 1 + maxCutoff / cellData[0]],
      [-maxCutoff / cellData[1], 1 + maxCutoff / cellData[1]],
      [-maxCutoff / cellData[2], 1 + maxCutoff / cellData[2]],
    ];
    offsets1 = searchBoundary(atoms, boundary);
  }
  // merge the offsets
  offsets = offsets.concat(offsets1);

  // Initialize neighbors array and map
  const neighborsList = [];
  const neighborsMap = {};

  // Function to calculate distance
  var distance = function (a, b) {
    return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2);
  };

  // Calculate positions with offsets
  const positions = offsets.map((offset) => {
    const originalPos = atoms.positions[offset[0]];
    const shift = calculateCartesianCoordinates(atoms.cell, offset[1]);

    return [originalPos[0] + shift[0], originalPos[1] + shift[1], originalPos[2] + shift[2]];
  });
  // Create k-d tree from adjusted positions
  const points = positions.map((position, index) => {
    return {
      x: position[0],
      y: position[1],
      z: position[2],
      index: index,
    };
  });
  const tree = new kdTree(points, distance, ["x", "y", "z"]);
  // Iterate over each atom with offset
  offsets.forEach(([atomIndex1, offset1], idx1) => {
    // skip the atoms not in the original cell
    if (offset1[0] != 0 || offset1[1] != 0 || offset1[2] != 0) return;
    const species1 = atoms.species[atoms.symbols[atomIndex1]].symbol;
    const radius1 = covalentRadii[species1] * 1.1 || 1;
    const pos1 = positions[idx1];
    const point = { x: positions[idx1][0], y: positions[idx1][1], z: positions[idx1][2] };

    // Find potential neighbors within the sum of radius1 and maximum possible radius2
    // max neighbors is 12*2, 12 is the number of nearest neighbors in a face-centered cubic lattice
    // the closest packed structure. We consider the nearest and second nearest neighbors
    const potentialNeighbors = tree.nearest(point, 24, maxCutoff ** 2);

    potentialNeighbors.forEach((neighbor) => {
      const idx2 = neighbor[0].index;
      if (idx1 == idx2) return;
      const atomIndex2 = offsets[idx2][0];
      if (!include_self && atomIndex1 == atomIndex2) return;
      const key = species1 + "-" + atoms.species[atoms.symbols[atomIndex2]].symbol;
      // if key is not in cutoffs, skip
      if (!cutoffs[key]) return;
      const pos2 = positions[idx2];
      const distance = calculateDistance(pos1, pos2);
      // console.log(atomIndex1, atomIndex2, distance, cutoff);
      if (distance < cutoffs[key].max && distance > cutoffs[key].min) {
        neighborsList.push([atomIndex1, atomIndex2, offsets[idx2][1]]);
        if (!neighborsMap[atomIndex1]) {
          neighborsMap[atomIndex1] = [[atomIndex2, offsets[idx2][1]]];
        } else {
          neighborsMap[atomIndex1].push([atomIndex2, offsets[idx2][1]]);
        }
      }
    });
  });

  console.timeEnd("findNeighbors Time");
  return { list: neighborsList, map: neighborsMap };
}

// Helper function to calculate distance between two points
function calculateDistance(point1, point2) {
  return Math.sqrt(Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2) + Math.pow(point1[2] - point2[2], 2));
}
