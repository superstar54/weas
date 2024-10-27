import * as THREE from "three";
import { materials } from "../../tools/materials.js";
import { radiiData, elementColors } from "../atoms_data.js";
import { getAtomColors } from "../color.js";
import { convertColor, drawAtoms } from "../utils.js";
import { clearObject } from "../../utils.js";
import { color } from "dat.gui";

class Setting {
  constructor({ indices, scale = 1.1, type = "sphere", color = "#3d82ed" }) {
    this.indices = indices;
    this.color = convertColor(color);
    this.scale = scale;
    this.type = type;
  }

  toDict() {
    return {
      indices: this.indices,
      color: this.color,
      scale: this.scale,
      type: this.type,
    };
  }
}

export class HighlightManager {
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
    this.settings = {
      selection: new Setting({ indices: [], scale: 2.0, color: "#ffff00" }),
    };
  }

  fromSettings(settings) {
    /* Set the bond settings */
    this.settings = {};
    this.clearMeshes();
    // loop over settings to add each setting
    Object.entries(settings).forEach(([name, setting]) => {
      this.addSetting(name, setting);
    });
  }

  addSetting(name, { indices, radius = 2.0, color = "#3d82ed" }) {
    /* Add a new setting to the bond */
    const setting = new Setting({ indices, radius, color });
    this.settings[name] = setting;
  }

  clearMeshes() {
    /* Remove highlighted atom meshes from the selectedAtomsMesh group */
    Object.values(this.meshes).forEach((mesh) => {
      // if this.viewer.atomManager.meshes["atom"] is not null
      if (this.viewer.atomManager.meshes["atom"]) {
        // remove the mesh from the children of this.viewer.atomManager.meshes["atom"]
        this.viewer.atomManager.meshes["atom"].remove(mesh);
      }
    });
    this.meshes = {};
  }

  drawHighlightAtoms() {
    this.clearMeshes();
    // set all the atomScales to 0 to hide the atoms
    const atomScales = new Array(this.viewer.atoms.getAtomsCount()).fill(0);
    // use yellow color to highlight the selected atoms
    const atomColors = new Array(this.viewer.atoms.getAtomsCount()).fill(new THREE.Color(0xffff00));
    this.highlightAtomsMesh = drawAtoms({
      scene: this.viewer.tjs.scene,
      atoms: this.viewer.atoms,
      atomScales: atomScales,
      settings: {},
      colors: atomColors,
      radiusType: this.viewer.radiusType,
      materialType: "Basic",
      data_type: "highlight",
    });
    this.viewer.atomManager.meshes["atom"].add(this.highlightAtomsMesh);
    this.highlightAtomsMesh.material.opacity = 0.6;
    this.highlightAtomsMesh.layers.set(1); // Set the layer to 1 to make it not selectable
    Object.values(this.settings).forEach((setting) => {
      this.updateHighlightAtomsMesh(setting.indices, setting.scale, setting.color);
    });
    this.meshes["atoms"] = this.highlightAtomsMesh;
  }

  updateHighlightAtomsMesh(indices = [], factor = 1.1, color = "#3d82ed") {
    /* When the atom is moved, the boundary atoms should be moved as well.
     */
    if (this.viewer.atoms.symbols.length > 0) {
      const position = new THREE.Vector3();
      const rotation = new THREE.Quaternion();
      const scale = new THREE.Vector3();
      indices.forEach((index) => {
        // Update the atom position
        const matrix = new THREE.Matrix4();
        this.viewer.atomManager.meshes["atom"].getMatrixAt(index, matrix);
        // Decompose the original matrix into its components
        matrix.decompose(position, rotation, scale);
        // scale by factor
        scale.multiplyScalar(factor);
        // Recompose the matrix with the new scale
        matrix.compose(position, rotation, scale);
        this.highlightAtomsMesh.setMatrixAt(index, matrix);
        this.highlightAtomsMesh.setColorAt(index, convertColor(color));
      });
      this.highlightAtomsMesh.instanceMatrix.needsUpdate = true;
    }
  }
}
