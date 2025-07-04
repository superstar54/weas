import * as THREE from "three";
import { calculateCartesianCoordinates, calculateQuaternion } from "../../utils.js";
import { materials } from "../../tools/materials.js";
import { elementsWithPolyhedra, covalentRadii, elementColors, default_bond_pairs } from "../atoms_data.js";
import { convertColor } from "../utils.js";
import { kdTree } from "../../geometry/kdTree.js";
import { searchBoundary } from "./boundary.js";
import { clearObject } from "../../utils.js";

// default bond radius
export const defaultBondRadius = 0.1;

class Setting {
  constructor({ specie1, specie2, min = 0.0, max = 3.0, color1 = "#3d82ed", color2 = "#3d82ed", radius = defaultBondRadius, order = 1, type = 0 }) {
    this.specie1 = specie1;
    this.specie2 = specie2;
    this.min = min;
    this.max = max;
    this.color1 = convertColor(color1);
    this.color2 = convertColor(color2);
    this.radius = radius;
    this.order = order;
    this.type = type;
  }

  toDict() {
    return {
      specie1: this.specie1,
      specie2: this.specie2,
      min: this.min,
      max: this.max,
      color1: this.color1,
      color2: this.color2,
      radius: this.radius,
      order: this.order,
      type: this.type,
    };
  }
}

export class BondManager {
  constructor(viewer, settings = {}) {
    this.viewer = viewer;
    this.scene = this.viewer.tjs.scene;
    this.settings = {};
    this.meshes = {};
    this.hideLongBonds = settings.hideLongBonds ?? true;
    this.showHydrogenBonds = settings.showHydrogenBonds ?? false;
    this.showOutBoundaryBonds = settings.showOutBoundaryBonds ?? false;
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
    Object.entries(this.viewer.originalAtoms.species).forEach(([symbol1, specie1]) => {
      Object.entries(this.viewer.originalAtoms.species).forEach(([symbol2, specie2]) => {
        const elementPair = specie1.element + "-" + specie2.element;
        // if the elementPair is not in the default_bond_pairs, skip
        if (default_bond_pairs[elementPair] === undefined) {
          return;
        }
        const key = symbol1 + "-" + symbol2;
        this.settings[key] = this.getDefaultSetting(symbol1, specie1, symbol2, specie2);
      });
    });
  }

  reset() {
    this.meshes = {};
  }

  getDefaultSetting(symbol1, specie1, symbol2, specie2) {
    /* Get the default bond setting for the specie1 and specie2 */
    let color1 = this.viewer.atomManager.settings[symbol1].color;
    let color2 = this.viewer.atomManager.settings[symbol2].color;
    const radius1 = this.viewer.atomManager.settings[symbol1].radius;
    const radius2 = this.viewer.atomManager.settings[symbol2].radius;
    let min = 0.0;
    let max = (radius1 + radius2) * 1.1;
    const type = default_bond_pairs[specie1.element + "-" + specie2.element][2];
    // if type  is hydrogen bond, set the min as the max, and the max as the max + 1
    if (type === 1) {
      min = max + 0.4;
      max = min + 1;
      // set color to grey
      color1 = "#808080";
      color2 = "#808080";
    }
    const setting = new Setting({ specie1: symbol1, specie2: symbol2, min, max, color1, color2, type });
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
  addSetting({ specie1, specie2, radius, min = 0.0, max = 3.0, color1 = "#3d82ed", color2 = "#3d82ed", order = 1, type = 0 }) {
    /* Add a new setting to the bond */
    const setting = new Setting({ specie1, specie2, radius, min, max, color1, color2, order, type });
    const key = specie1 + "-" + specie2;
    this.settings[key] = setting;
  }

  buildBondDict() {
    /* Build a dictionary of cutoffs */
    const cutoffDict = {};
    Object.values(this.settings).forEach((setting) => {
      const specie1 = setting.specie1;
      const specie2 = setting.specie2;
      const key1 = specie1 + "-" + specie2;
      cutoffDict[key1] = setting.toDict();
    });
    this.viewer.logger.debug("cutoffDict: ", cutoffDict);
    this.viewer.cutoffs = cutoffDict;
  }

  buildNeighborList() {
    this.buildBondDict();
    // find neighbor atoms in the original cell
    this.viewer.neighbors = findNeighbors(this.viewer.originalAtoms, this.viewer.cutoffs, false, true, this.viewer.logger);
    this.viewer.logger.debug("neighbors: ", this.viewer.neighbors);
  }

  clearMeshes() {
    /* Remove highlighted atom meshes from the selectedAtomsMesh group */
    Object.values(this.meshes).forEach((mesh) => {
      if (mesh) {
        clearObject(this.scene, mesh);
      }
    });
    this.meshes = {};
  }

  drawBonds() {
    this.reset();
    const bondGroup = new THREE.Group();
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
    this.bondList = buildBonds(this.viewer.originalAtoms, offsets, this.viewer.neighbors["map"], this.viewer._boundary, this.viewer.modelSticks, this.showOutBoundaryBonds, this.viewer.logger);
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
    this.bondMap = buildBondMap(this.bondList, this.viewer.originalAtoms, this.settings, this.viewer.modelSticks);
    // this.viewer.logger.debug("bondMap: ", this.bondMap);
    let atomColors = null;
    if (this.viewer.colorBy !== "Element") {
      atomColors = this.viewer.atomColors;
    }

    const stickBondMesh = drawStick(
      this.viewer.originalAtoms,
      this.bondList,
      this.bondMap["sticks"],
      this.viewer.cutoffs,
      this.bondRadius,
      this.viewer._materialType,
      atomColors,
      false,
      this.viewer.logger,
    );
    const { bondMesh, bondCap } = drawStick(
      this.viewer.originalAtoms,
      this.bondList,
      this.bondMap["stickCaps"],
      this.viewer.cutoffs,
      this.bondRadius,
      this.viewer._materialType,
      atomColors,
      true,
      this.viewer.logger,
    );
    let dashedBondLine;
    if (this.showHydrogenBonds) {
      dashedBondLine = drawLine(this.viewer.originalAtoms, this.bondList, this.bondMap["dashedLines"], this.viewer.cutoffs, "dashed", atomColors);
    }
    const solidBondLine = drawLine(this.viewer.originalAtoms, this.bondList, this.bondMap["solidLines"], this.viewer.cutoffs, "solid", atomColors);
    this.meshes = { stickBondMesh: stickBondMesh, stickCapBondMesh: bondMesh, stickCapBondCap: bondCap, dashedBondLine: dashedBondLine, solidBondLine: solidBondLine };
    Object.values(this.meshes).forEach((mesh) => {
      if (mesh) {
        bondGroup.add(mesh);
      }
    });
    return bondGroup;
  }

  updateBondMesh(atomIndex = null, atoms = null) {
    /* When the atom is moved, the bonds should be moved as well.
    if atomIndex is null, update all bonds
    if atoms is null, use this.atoms, otherwise use the provided atoms to update the bonds, e.g. trajectory data
    */
    this.updateBondStick(atomIndex, atoms, this.meshes["stickBondMesh"], null, "sticks");
    this.updateBondStick(atomIndex, atoms, this.meshes["stickCapBondMesh"], this.meshes["stickCapBondCap"], "stickCaps");
    this.updateBondLine(atomIndex, atoms, this.meshes["dashedBondLine"], "dashedLines");
    this.updateBondLine(atomIndex, atoms, this.meshes["solidBondLine"], "solidLines");
  }

  updateBondStick(atomIndex = null, atoms = null, stickBondMesh, stickBondCap = null, name = "sticks") {
    /* When the atom is moved, the bonds should be moved as well.
    if atomIndex is null, update all bonds
    if atoms is null, use this.atoms, otherwise use the provided atoms to update the bonds, e.g., trajectory data
    */
    if (!stickBondMesh) {
      return;
    }
    if (atoms === null) {
      atoms = this.viewer.originalAtoms;
    }
    let bondIndices = [];
    if (atomIndex) {
      const bondMap = this.bondMap["bondMap"][atomIndex];
      if (bondMap) {
        bondMap[name].forEach((bondData) => {
          bondIndices.push(bondData[0]);
        });
      }
    } else {
      bondIndices = this.bondMap[name].map((_, index) => index);
    }

    bondIndices.forEach((i) => {
      const bond = this.bondList[this.bondMap[name][i]];
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
      if (!this.viewer.cutoffs[key]) {
        return;
      }
      const cutoff = this.viewer.cutoffs[key].max;
      const quaternion = calculateQuaternion(position1, position2);
      const scale = calculateScale(position1, position2, this.bondRadius, cutoff, this.hideLongBonds);
      const instanceMatrix = new THREE.Matrix4().compose(midpoint1, quaternion, scale);
      stickBondMesh.setMatrixAt(i * 2, instanceMatrix);

      const midpoint2 = new THREE.Vector3().lerpVectors(position1, position2, 0.75);
      const instanceMatrix2 = new THREE.Matrix4().compose(midpoint2, quaternion, scale);
      stickBondMesh.setMatrixAt(i * 2 + 1, instanceMatrix2);

      // Update bond caps if they exist
      if (stickBondCap) {
        const capScale = new THREE.Vector3(this.bondRadius, this.bondRadius, this.bondRadius);

        // Set the first cap at position1
        const capMatrix1 = new THREE.Matrix4().compose(position1, new THREE.Quaternion(), capScale);
        stickBondCap.setMatrixAt(i * 2, capMatrix1);

        // Set the second cap at position2
        const capMatrix2 = new THREE.Matrix4().compose(position2, new THREE.Quaternion(), capScale);
        stickBondCap.setMatrixAt(i * 2 + 1, capMatrix2);
      }
    });

    stickBondMesh.instanceMatrix.needsUpdate = true;

    if (stickBondCap) {
      stickBondCap.instanceMatrix.needsUpdate = true;
    }
  }

  updateBondLine(atomIndex = null, atoms = null, bondLine, name = "dashedLines") {
    /* When the atom is moved, the bonds should be moved as well.
    if atomIndex is null, update all bonds
    if atoms is null, use this.atoms, otherwise use the provided atoms to update the bonds, e.g. trajectory data
    */
    // this.viewer.logger.debug("updateBondStick: ", atomIndex);
    if (!bondLine) {
      return;
    }
    if (atoms === null) {
      atoms = this.viewer.originalAtoms;
    }
    let bondIndices = [];
    if (atomIndex) {
      const bondMap = this.bondMap["bondMap"][atomIndex];
      if (bondMap) {
        bondMap[name].forEach((bondData) => {
          bondIndices.push(bondData[0]);
        });
      }
    } else {
      bondIndices = this.bondMap[name].map((_, index) => index);
    }
    // Assuming lineSegments is already created
    const positionAttribute = bondLine.geometry.attributes.position;
    const array = positionAttribute.array; // Access the array storing positions

    // this.viewer.logger.debug("bondIndices: ", bondIndices);
    // loop all bond indices and update the bonds
    bondIndices.forEach((i) => {
      const bond = this.bondList[this.bondMap[name][i]];
      const atomIndex1 = bond[0];
      const atomIndex2 = bond[1];
      const offset1 = bond[2];
      const offset2 = bond[3];
      let position1 = atoms.positions[atomIndex1].map((value, index) => value + calculateCartesianCoordinates(atoms.cell, offset1)[index]);
      let position2 = atoms.positions[atomIndex2].map((value, index) => value + calculateCartesianCoordinates(atoms.cell, offset2)[index]);
      const key = atoms.symbols[atomIndex1] + "-" + atoms.symbols[atomIndex2];
      // if key is not in the cutoffs, skip. In principle, this should not happen
      if (!this.settings[key]) {
        return;
      }

      position1 = new THREE.Vector3(...position1);
      position2 = new THREE.Vector3(...position2);
      // if bond length > cutoff, hide the segment
      // Calculate the bond length
      const bondLength = position1.distanceTo(position2);
      // If bond length exceeds the cutoff, hide the line by collapsing the points
      if ((bondLength > this.settings[key].max) | (bondLength < this.settings[key].min)) {
        position2.copy(position1); // Collapse position2 to position1
      }

      // Update the position1 and end positions in the buffer
      array[i * 6] = position1.x; // x of position1
      array[i * 6 + 1] = position1.y; // y of position1
      array[i * 6 + 2] = position1.z; // z of position1
      array[i * 6 + 3] = position2.x; // x of position2
      array[i * 6 + 4] = position2.y; // y of position2
      array[i * 6 + 5] = position2.z; // z of position2
    });
    // Mark the position attribute as needing an update
    positionAttribute.needsUpdate = true;

    // If the length of lines or geometry changes, you might also need to call:
    bondLine.geometry.computeBoundingBox();
    bondLine.geometry.computeBoundingSphere();
  }
}

export function drawStick(atoms, bondList, bondIndices, settings, radius = 0.1, materialType = "standard", atomColors = null, withCap = false, logger = console) {
  /* Draw bonds between atoms.
  atoms: the atoms object
  bondList: list of bonds, each bond is a list of 4 elements:
  [atomIndex1, atomIndex2, offset1, offset2]
  radius: radius of the bond
  materialType: material type of the bond

  Returns:
  instancedMesh: the instancedMesh object of the bonds
  */
  const t0 = performance.now();

  const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 1, 8, 1); // Adjust segment count as needed
  const sphereGeometry = new THREE.SphereGeometry(1, 8, 8); // Sphere geometry for caps

  const material = materials[materialType].clone();
  const bondMesh = new THREE.InstancedMesh(cylinderGeometry, material, bondIndices.length * 2);
  const bondCap = withCap ? new THREE.InstancedMesh(sphereGeometry, material, bondIndices.length * 2) : null;

  for (let i = 0; i < bondIndices.length; i++) {
    const [index1, index2, offset1, offset2] = bondList[bondIndices[i]];
    var position1 = atoms.positions[index1].map((value, index) => value + calculateCartesianCoordinates(atoms.cell, offset1)[index]);
    position1 = new THREE.Vector3(...position1);

    var position2 = atoms.positions[index2].map((value, index) => value + calculateCartesianCoordinates(atoms.cell, offset2)[index]);
    position2 = new THREE.Vector3(...position2);

    const key = atoms.symbols[index1] + "-" + atoms.symbols[index2];
    const color1 = atomColors ? atomColors[index1] : settings[key].color1;
    const color2 = atomColors ? atomColors[index2] : settings[key].color2;

    // Midpoints and quaternion for cylinder placement
    const midpoint1 = new THREE.Vector3().lerpVectors(position1, position2, 0.25);
    const midpoint2 = new THREE.Vector3().lerpVectors(position1, position2, 0.75);
    const quaternion = calculateQuaternion(position1, position2);
    const scale = calculateScale(position1, position2, radius);

    // Set the first cylinder
    const instanceMatrix1 = new THREE.Matrix4().compose(midpoint1, quaternion, scale);
    bondMesh.setMatrixAt(i * 2, instanceMatrix1);
    bondMesh.setColorAt(i * 2, color1);

    // Set the second cylinder
    const instanceMatrix2 = new THREE.Matrix4().compose(midpoint2, quaternion, scale);
    bondMesh.setMatrixAt(i * 2 + 1, instanceMatrix2);
    bondMesh.setColorAt(i * 2 + 1, color2);

    // If withCap is true, add spheres at ends
    if (withCap) {
      const capScale = new THREE.Vector3(radius, radius, radius);

      // Cap at position1
      const capMatrix1 = new THREE.Matrix4().compose(position1, new THREE.Quaternion(), capScale);
      bondCap.setMatrixAt(i * 2, capMatrix1);
      bondCap.setColorAt(i * 2, color1);

      // Cap at position2
      const capMatrix2 = new THREE.Matrix4().compose(position2, new THREE.Quaternion(), capScale);
      bondCap.setMatrixAt(i * 2 + 1, capMatrix2);
      bondCap.setColorAt(i * 2 + 1, color2);
    }
  }

  bondMesh.userData.type = "bond";
  bondMesh.userData.uuid = atoms.uuid;
  bondMesh.userData.objectMode = "edit";

  if (bondCap) {
    bondCap.userData.type = "bond";
    bondCap.userData.uuid = atoms.uuid;
    bondCap.userData.objectMode = "edit";
  }

  const t1 = performance.now();
  logger.debug("drawStick Time: ", t1 - t0);

  return withCap ? { bondMesh, bondCap } : bondMesh;
}

export function drawLine(atoms, bondList, bondIndices, settings, lineType = "dashed", atomColors = null) {
  /* Draw dashed bonds between atoms.
  atoms: the atoms object
  bondList: list of bonds, each bond is a list of 4 elements:
  [atomIndex1, atomIndex2, offset1, offset2]
  lineType: material type of the bond

  Returns:
  lineSegments: the LineSegments object of the dashed bonds
  */
  if (bondIndices === undefined || bondIndices.length === 0) {
    return null;
  }

  const vertices = [];
  const colors = [];

  bondIndices.forEach((instanceId) => {
    const bond = bondList[instanceId];
    const [index1, index2, offset1, offset2] = bond;
    var position1 = atoms.positions[index1].map((value, index) => value + calculateCartesianCoordinates(atoms.cell, offset1)[index]);
    position1 = new THREE.Vector3(...position1);

    var position2 = atoms.positions[index2].map((value, index) => value + calculateCartesianCoordinates(atoms.cell, offset2)[index]);
    position2 = new THREE.Vector3(...position2);

    // Add the start and end positions to the vertices array
    vertices.push(position1.x, position1.y, position1.z);
    vertices.push(position2.x, position2.y, position2.z);
    // Setting color for each bond
    const key = atoms.symbols[index1] + "-" + atoms.symbols[index2];
    const color1 = settings[key].color1;
    const color2 = settings[key].color2;

    // Add the colors for both atoms
    colors.push(color1.r, color1.g, color1.b);
    colors.push(color2.r, color2.g, color2.b);
  });

  // Create the buffer geometry for the line segments
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  let material;
  if (lineType === "dashed") {
    material = new THREE.LineDashedMaterial({
      color: 0xffffff, // Set a default color if needed, but we'll use vertex colors
      vertexColors: true, // Use the colors provided by the geometry
      dashSize: 0.1, // Length of each dash
      gapSize: 0.1, // Length of each gap
      linewidth: 3, // Optional: adjust line thickness (supported in WebGL2 contexts)
    });
  } else {
    material = new THREE.LineBasicMaterial({
      color: 0xffffff, // Set a default color if needed, but we'll use vertex colors
      vertexColors: true, // Use the colors provided by the geometry
      linewidth: 3, // Optional: adjust line thickness (supported in WebGL2 contexts)
    });
  }

  // Create the LineSegments object
  const lineSegments = new THREE.LineSegments(geometry, material);

  // Compute line distances for dashes to work correctly
  lineSegments.computeLineDistances();

  // Store additional data in userData for tracking
  lineSegments.userData.type = "bond";
  lineSegments.userData.uuid = atoms.uuid;
  lineSegments.userData.objectMode = "edit";

  return lineSegments;
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
  let bondedAtomList = [];
  let bondList = [];
  atomsList.forEach((atom) => {
    const atomIndex = atom[0];
    if (modelSticks[atomIndex] === 0) {
      return;
    }
    // only find the atoms that are in the elementsWithPolyhedra
    if (!elementsWithPolyhedra.includes(symbols[atomIndex])) {
      return;
    }
    const offset = atom[1];
    const neighborsList = neighbors["map"][atomIndex];
    // skip if the atom has no neighbors
    if (neighborsList === undefined) {
      return;
    }
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
        bondedAtomList.push(bondedAtom);
        bondList.push([atomIndex, neighborIndex, offset, newOffset]);
        bondList.push([neighborIndex, atomIndex, newOffset, offset]);
      }
    });
  });
  return { atoms: bondedAtomList, bonds: bondList };
}

export function buildBonds(atoms, offsets, neighbors, boundary, modelSticks, showOutBoundaryBonds = false, logger = console) {
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
  const t0 = performance.now();
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
        // if offset1 is [0, 0, 0], the orginal atom is in the original cell
        // just add the bond
        // if (offset1[0] === 0 && offset1[1] === 0 && offset1[2] === 0) {
        //   bonds.push([atomIndex1, atomIndex2, offset1, offset2]);
        //   continue;
        // }
        // else, sum the two offsets, and check if the neighbor atom is inside the boundary
        const offsetSum = offset1.map((value, index) => value + offset2[index]);
        // check if the neighbor atom is inside the boundary
        const newPosition = fract_positions[atomIndex2].map((value, index) => value + offsetSum[index]);
        if (showOutBoundaryBonds) {
          bonds.push([atomIndex1, atomIndex2, offset1, offsetSum]);
          continue;
        } else if (
          boundary[0][0] <= newPosition[0] &&
          newPosition[0] <= boundary[0][1] &&
          boundary[1][0] <= newPosition[1] &&
          newPosition[1] <= boundary[1][1] &&
          boundary[2][0] <= newPosition[2] &&
          newPosition[2] <= boundary[2][1]
        ) {
          bonds.push([atomIndex1, atomIndex2, offset1, offsetSum]);
        }
      }
    }
  }
  const t1 = performance.now();
  logger.debug("buildBonds Time: ", t1 - t0);

  return bonds;
}

export function buildBondMap(bondList, atoms, settings, modelSticks) {
  /* find bond list for each atom, so that when the atoms are moved,
  the bonds can be updated.
  bondMap: {atomIndex, bonds: [[bondIndex, isStart]]}}
  bondMapWithOffset: {atomIndex-offset, bonds: [[bondIndex, isStart]]}}
  */
  const bondMap = {};
  const bondMapWithOffset = {};
  const sticks = [];
  const stickCaps = [];
  const dashedLines = [];
  const solidLines = [];
  const springs = [];

  for (let i = 0; i < bondList.length; i++) {
    const bond = bondList[i];
    const [index1, index2] = bond;
    // without offset
    if (!bondMap[index1]) {
      bondMap[index1] = { atomIndex: index1, sticks: [], stickCaps: [], dashedLines: [], solidLines: [], springs: [] };
    }
    if (!bondMap[index2]) {
      bondMap[index2] = { atomIndex: index2, sticks: [], stickCaps: [], dashedLines: [], solidLines: [], springs: [] };
    }
    // with offset
    const key1 = index1 + "-" + bond[2].join("-");
    if (!bondMapWithOffset[key1]) {
      bondMapWithOffset[key1] = { atomIndex: index1, offset: bond[2], sticks: [], stickCaps: [], dashedLines: [], solidLines: [], springs: [] };
    }
    const key2 = index2 + "-" + bond[3].join("-");
    if (!bondMapWithOffset[key2]) {
      bondMapWithOffset[key2] = { atomIndex: index2, offset: bond[3], sticks: [], stickCaps: [], dashedLines: [], solidLines: [], springs: [] };
    }
    // Split the bondList into three categories based on bond type
    const key = atoms.symbols[index1] + "-" + atoms.symbols[index2];
    let bondType;
    if (modelSticks[index1] <= 2) {
      bondType = settings[key].type;
    } else {
      bondType = modelSticks[index1];
    }
    // Split into stick, line (dashed), and spring bonds based on type
    if (bondType === 0) {
      // stick
      sticks.push(i);
      bondMap[index1]["sticks"].push([sticks.length - 1, true]);
      bondMap[index2]["sticks"].push([sticks.length - 1, false]);
      bondMapWithOffset[key1]["sticks"].push([sticks.length - 1, true]);
      bondMapWithOffset[key2]["sticks"].push([sticks.length - 1, false]);
    } else if (bondType === 1) {
      // dashed line
      dashedLines.push(i);
      bondMap[index1]["dashedLines"].push([dashedLines.length - 1, true]);
      bondMap[index2]["dashedLines"].push([dashedLines.length - 1, false]);
      bondMapWithOffset[key1]["dashedLines"].push([dashedLines.length - 1, true]);
      bondMapWithOffset[key2]["dashedLines"].push([dashedLines.length - 1, false]);
    } else if (bondType === 2) {
      // spring
      springs.push(i);
      bondMap[index1]["springs"].push([springs.length - 1, true]);
      bondMap[index2]["springs"].push([springs.length - 1, false]);
      bondMapWithOffset[key1]["springs"].push([springs.length - 1, true]);
      bondMapWithOffset[key2]["springs"].push([springs.length - 1, false]);
    } else if (bondType === 3) {
      // stick with cap
      stickCaps.push(i);
      bondMap[index1]["stickCaps"].push([stickCaps.length - 1, true]);
      bondMap[index2]["stickCaps"].push([stickCaps.length - 1, false]);
      bondMapWithOffset[key1]["stickCaps"].push([stickCaps.length - 1, true]);
      bondMapWithOffset[key2]["stickCaps"].push([stickCaps.length - 1, false]);
    } else if (bondType === 4) {
      // line
      solidLines.push(i);
      bondMap[index1]["solidLines"].push([solidLines.length - 1, true]);
      bondMap[index2]["solidLines"].push([solidLines.length - 1, false]);
      bondMapWithOffset[key1]["solidLines"].push([solidLines.length - 1, true]);
      bondMapWithOffset[key2]["solidLines"].push([solidLines.length - 1, false]);
    }
  }
  return { bondMap: bondMap, bondMapWithOffset: bondMapWithOffset, sticks, stickCaps, dashedLines, solidLines, springs };
}

export function findNeighbors(atoms, cutoffs, include_self = false, pbc = true, logger = console) {
  /* Function to find neighbors within a certain cutoff
  Args:
    atoms: Atoms object
    cutoffs: Dictionary of cutoffs for each specie pair, has min and max
    include_self: Include self in the neighbors list
    pbc: Periodic boundary conditions
  */
  const t0 = performance.now();
  // Create offsets for each atom
  let offsets = atoms.positions.map((_, index) => [index, [0, 0, 0]]);
  let offsets1;
  const maxCutoff = Math.max(...Object.values(cutoffs).map((cutoff) => cutoff.max));
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
    const specie1 = atoms.symbols[atomIndex1];
    const radius1 = covalentRadii[specie1] * 1.1 || 1;
    const pos1 = positions[idx1];
    const point = { x: positions[idx1][0], y: positions[idx1][1], z: positions[idx1][2] };

    // Find potential neighbors within the sum of radius1 and maximum possible radius2
    // max neighbors is 12*2, 12 is the number of nearest neighbors in a face-centered cubic lattice
    // the closest packed structure. We consider the nearest and second nearest neighbors
    const potentialNeighbors = tree.nearest(point, 24, maxCutoff ** 2);

    potentialNeighbors.forEach((neighbor) => {
      const idx2 = neighbor[0].index;
      if (idx1 == idx2) return;
      const offset2 = offsets[idx2][1];
      // skip the both atoms are not in the original cell
      if (offset1.some((v) => v !== 0) && offset2.some((v) => v !== 0)) {
        return;
      }
      const atomIndex2 = offsets[idx2][0];
      if (!include_self && atomIndex1 == atomIndex2) return;
      const key = specie1 + "-" + atoms.symbols[atomIndex2];
      // if key is not in cutoffs, skip
      if (!cutoffs[key]) return;
      const pos2 = positions[idx2];
      const distance = calculateDistance(pos1, pos2);
      if (distance < cutoffs[key].max && distance > cutoffs[key].min) {
        // we need shift the offset2 by offset1
        const offset = offset2.map((value, index) => value - offset1[index]);
        neighborsList.push([atomIndex1, atomIndex2, offset]);
        if (!neighborsMap[atomIndex1]) {
          neighborsMap[atomIndex1] = [[atomIndex2, offset]];
        } else {
          if (!neighborsMap[atomIndex1].some(([idx, off]) => idx === atomIndex2 && off.every((v, i) => v === offset[i]))) {
            neighborsMap[atomIndex1].push([atomIndex2, offset]);
          }
        }
      }
    });
  });
  const t1 = performance.now();
  logger.info(`findNeighbors completed in ${(t1 - t0).toFixed(2)} ms`);
  return { list: neighborsList, map: neighborsMap };
}

// Helper function to calculate distance between two points
function calculateDistance(point1, point2) {
  return Math.sqrt(Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2) + Math.pow(point1[2] - point2[2], 2));
}
