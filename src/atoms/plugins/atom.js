import * as THREE from "three";
import { calculateCartesianCoordinates } from "../../utils.js";
import { radiiData, elementColors } from "../atoms_data.js";
import { getAtomColors } from "../color.js";
import { getImageAtoms } from "./boundary.js";
import { convertColor, drawAtoms } from "../utils.js";
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

    Object.entries(this.viewer.originalAtoms.species).forEach(([symbol, species]) => {
      this.settings[symbol] = this.getDefaultSetting(symbol, species.element);
    });
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

  getDefaultSetting(symbol, element) {
    /* Get the default bond setting for the species1 and species2 */
    let color;
    let radius;
    // if species has color attribute in the species domain, use it
    if ("color" in this.viewer.atoms.attributes["species"]) {
      color = this.viewer.atoms.attributes["species"]["color"][symbol] || "#3d82ed";
    } else {
      color = elementColors[this.viewer.colorType][element];
    }
    // if atoms has radii attribute in the species domain, use it
    if ("radii" in this.viewer.atoms.attributes["species"]) {
      radius = this.viewer.atoms.attributes["species"]["radii"][symbol] || 1;
    } else {
      radius = radiiData[this.viewer.radiusType][element] || 1;
    }
    const setting = new Setting({ element: element, symbol: symbol, radius, color });
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
  // Method to update the scale of atoms
  updateAtomScale() {
    let mesh = this.meshes["atom"];
    this.updateMeshScale(mesh, this.viewer.atoms.symbols, this.viewer.atomScale);
    // update the boundary atoms
    mesh = this.meshes["boundary"];
    if (mesh) {
      const symbols = [];
      for (let i = 0; i < this.viewer.boundaryList.length; i++) {
        symbols.push(this.viewer.atoms.symbols[this.viewer.boundaryList[i][0]]);
      }
      this.updateMeshScale(mesh, symbols, this.viewer.atomScale);
    }
  }

  updateMeshScale(mesh, symbols, atomScale) {
    const position = new THREE.Vector3();
    const rotation = new THREE.Quaternion();
    const scale = new THREE.Vector3();

    for (let i = 0; i < mesh.count; i++) {
      const instanceMatrix = new THREE.Matrix4();
      const radius = this.settings[symbols[i]].radius || 1;
      mesh.getMatrixAt(i, instanceMatrix); // Get the original matrix of the instance
      // Decompose the original matrix into its components
      instanceMatrix.decompose(position, rotation, scale);
      // Set the scale to the new value
      scale.set(radius * atomScale, radius * atomScale, radius * atomScale);
      console.log("scale: ", scale);
      // Recompose the matrix with the new scale
      instanceMatrix.compose(position, rotation, scale);
      mesh.setMatrixAt(i, instanceMatrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }
}
