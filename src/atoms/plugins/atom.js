import * as THREE from "three";
import { calculateCartesianCoordinates } from "../../utils.js";
import { materials } from "../../tools/materials.js";
import { radiiData, elementColors } from "../atoms_data.js";
import { getAtomColors } from "../color.js";
import { getImageAtoms } from "./boundary.js";
import { convertColor } from "../utils.js";
import { clearObject } from "../../utils.js";

class Setting {
  constructor({ element, symbol, radius = 2.0, color = "#3d82ed" }) {
    this.element = element;
    this.symbol = symbol;
    this.color = convertColor(color);
    this.radius = radius;
  }

  toDict() {
    return {
      element: this.element,
      symbol: this.symbol,
      color: this.color,
      radius: this.radius,
    };
  }
}

export class AtomManager {
  constructor(viewer) {
    this.viewer = viewer;
    this.scene = this.viewer.tjs.scene;
    this.settings = {};
    this.meshes = {};
    this.init();
  }

  init() {
    /* Initialize the species settings from the viewer.atoms
     */
    this.viewer.logger.debug("init atom settings");
    this.settings = {};
    const speciesSet = new Set(this.viewer.originalAtoms.symbols);
    const speciesList = Array.from(speciesSet);
    for (let i = 0; i < speciesList.length; i++) {
      const species = speciesList[i];
      this.settings[species] = this.getDefaultSetting(species);
    }
    this.updateAtomColors();
  }

  updateAtomColors() {
    const colors = [];
    this.viewer.atoms.symbols.forEach((symbol, globalIndex) => {
      // if this.viewer.atoms has color attribute in the species domain, use it
      const color = new THREE.Color(this.settings[symbol].color);
      colors.push(color);
    });
    this.viewer.atomColors = colors;
    if (this.viewer.colorBy !== "Element") {
      this.viewer.atomColors = getAtomColors(this.viewer.atoms, this.viewer.colorBy, { colorType: this.viewer.colorType, colorRamp: this.viewer._colorRamp });
    }
  }

  getDefaultSetting(species) {
    /* Get the default bond setting for the species1 and species2 */
    const color = elementColors[this.viewer.colorType][species];
    let radius;
    // if atoms has radii attribute in the species domain, use it
    if ("radii" in this.viewer.atoms.attributes["species"]) {
      radius = this.viewer.atoms.attributes["species"]["radii"][symbol] || 1;
    } else {
      radius = radiiData[this.viewer.radiusType][species] || 1;
    }
    const setting = new Setting({ element: species, symbol: species, radius, color });
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

  addSetting({ element, symbol, radius = 2.0, color = "#3d82ed" }) {
    /* Add a new setting to the bond */
    const setting = new Setting({ element, symbol, radius, color });
    this.settings[symbol] = setting;
  }

  clearMeshes() {
    /* Remove highlighted atom meshes from the selectedAtomsMesh group */
    Object.values(this.meshes).forEach((mesh) => {
      console.log("mesh: ", mesh);
      clearObject(this.scene, mesh);
    });
    this.meshes = {};
  }

  drawBalls() {
    this.updateAtomColors();
    // draw atoms
    const atomsMesh = drawAtoms({
      scene: this.scene,
      atoms: this.viewer.atoms,
      atomScales: this.viewer.atomScales,
      settings: this.settings,
      colors: this.viewer.atomColors,
      materialType: this.viewer._materialType,
    });
    this.scene.add(atomsMesh);
    // atoms to be drawn, boundary atoms, and the bonded atoms
    // merge the boundaryList and the bondedAtoms
    this.viewer.imageAtomsList = this.viewer.bondedAtoms["atoms"].concat(this.viewer.boundaryList);
    // if boundaryList length > 0, draw boundary atoms
    if (this.viewer.imageAtomsList.length > 0) {
      // draw boundary atoms
      const imageAtomsList = getImageAtoms(this.viewer.atoms, this.viewer.imageAtomsList);
      // get the models, the indices and scales should read from this.viewer.atomScales
      let atomScales = new Array(imageAtomsList.getAtomsCount()).fill(1);
      // update the models indices and scales
      for (let i = 0; i < imageAtomsList.getAtomsCount(); i++) {
        atomScales[i] = this.viewer.atomScales[this.viewer.imageAtomsList[i][0]];
      }
      const atomColors = [];
      imageAtomsList.symbols.forEach((symbol, globalIndex) => {
        // if this.viewer.atoms has color attribute in the species domain, use it
        const color = new THREE.Color(this.settings[symbol].color);
        atomColors.push(color);
      });
      const boundaryAtomsMesh = drawAtoms({
        scene: this.scene,
        atoms: imageAtomsList,
        atomScales: atomScales,
        settings: this.settings,
        colors: atomColors,
        materialType: this.viewer._materialType,
        data_type: "boundary",
      });
      atomsMesh.add(boundaryAtomsMesh);
      this.meshes["boundary"] = boundaryAtomsMesh;
    }
    this.meshes["atom"] = atomsMesh;
    return atomsMesh;
  }
  updateAtomMesh(atomIndex = null, atoms = null) {
    var matrix = new THREE.Matrix4();
    for (let i = 0; i < atoms.positions.length; i++) {
      this.meshes["atom"].getMatrixAt(i, matrix);
      matrix.setPosition(new THREE.Vector3(...atoms.positions[i]));
      this.meshes["atom"].setMatrixAt(i, matrix);
      this.updateBoundaryAtomsMesh(i);
    }
    this.meshes["atom"].instanceMatrix.needsUpdate = true;
    // if boundaryAtomsMesh has instanceMatrix, update it
    if (this.meshes["boundary"]) {
      this.meshes["boundary"].instanceMatrix.needsUpdate = true;
    }
  }

  updateBoundaryAtomsMesh(atomIndex) {
    /* When the atom is moved, the boundary atoms should be moved as well.
     */
    // this.logger.debug("this.viewer.boundaryList: ", this.viewer.boundaryList);
    // this.logger.debug("updateBoundaryAtomsMesh: ", atomIndex);
    // this.logger.debug("this.viewer.boundaryMap[atomIndex]:", this.viewer.boundaryMap[atomIndex]);
    if (this.viewer.boundaryList.length > 0 && this.viewer.boundaryMap[atomIndex]) {
      // this.logger.debug("updateBoundaryAtomsMesh: ", atomIndex);
      const atomList = this.viewer.boundaryMap[atomIndex];
      // loop all atomList and update the boundary atoms
      atomList.forEach((atom) => {
        const boundaryAtomIndex = atom.index;
        const newPosition = this.viewer.atoms.positions[atomIndex].map((value, index) => value + calculateCartesianCoordinates(this.viewer.atoms.cell, atom.offset)[index]);
        // Update the atom position
        const matrix = new THREE.Matrix4();
        this.meshes["boundary"].getMatrixAt(boundaryAtomIndex, matrix);
        matrix.setPosition(new THREE.Vector3(...newPosition));
        this.meshes["boundary"].setMatrixAt(boundaryAtomIndex, matrix);
      });
    }
  }
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
  atoms.symbols.forEach((symbol, globalIndex) => {
    // Set position and scale
    const position = new THREE.Vector3(...atoms.positions[globalIndex]);
    const dummy = new THREE.Object3D();
    dummy.position.copy(position);
    const scale = atomScales[globalIndex];
    // if symbol in settings, use the radius and color from settings
    if (symbol in settings) {
      radius = settings[symbol].radius;
    } else {
      radius = 1;
    }
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
