import * as THREE from "three";
import { createLabel } from "../../utils.js";

class Setting {
  constructor({ origins = [], texts = [], color = "#3d82ed", fontSize = 0.05, shift = false }) {
    /* A class to store label settings */

    this.origins = origins;
    this.texts = texts;
    this.color = color;
    this.fontSize = fontSize;
    this.shift = shift;
  }
}

export class AtomLabelManager {
  constructor(viewer) {
    this.viewer = viewer;
    this.scene = this.viewer.tjs.scene;
    this.settings = [];
    this.labels = [];
  }

  fromSettings(settings) {
    /* Set the label settings */
    this.settings = [];
    clearLabels(this.scene, this.labels);
    // loop over settings to add each setting
    settings.forEach((setting) => {
      this.addSetting(setting);
    });
  }

  // Modify addSetting to accept a single object parameter
  addSetting({ origins, texts, color = "#3d82ed", fontSize = 0.05, shift = [0, 0, 0] }) {
    /* Add a new setting to the label */
    if (typeof origins === "string") {
      if (!this.viewer.atoms.getAttribute(origins)) {
        throw new Error(`Attribute '${origins}' is not defined. The available attributes are: ${Object.keys(this.viewer.atoms.attributes["atom"])}`);
      }
    }
    const setting = new Setting({ origins, texts, color, fontSize, shift });
    this.settings.push(setting);
  }

  clearLabels() {
    clearLabels(this.scene, this.labels);
  }

  drawAtomLabels() {
    /* Draw labels */
    console.log("drawAtomLabels:");
    this.clearLabels();
    // console.log("this.settings: ", this.settings);
    this.settings.forEach((setting) => {
      // if too many labels, skip
      if (setting.origins.length > 1000) {
        console.warn("Too many labels, skipping...");
        return;
      }

      // Generate label geometry
      // if origin and vector are string, which means they are from atoms attributes
      let origins;
      let texts;
      // if setting.selection is not defined, use all atoms
      const selection = setting.selection || [...Array(this.viewer.atoms.getAtomsCount()).keys()];
      if (typeof setting.origins === "string") {
        origins = this.viewer.atoms.getAttribute(setting.origins);
        origins = selection.map((i) => origins[i]);
      } else {
        origins = setting.origins;
      }
      if (typeof setting.texts === "string") {
        texts = this.viewer.atoms.getAttribute(setting.texts);
        texts = selection.map((i) => texts[i]);
      } else {
        texts = setting.texts;
      }
      this.labels = drawAtomLabels(origins, texts, setting.fontSize, setting.color, "Standard");
      // Add mesh to the scene
      for (let i = 0; i < this.labels.length; i++) {
        this.scene.add(this.labels[i]);
      }
    });
    // call the render function to update the scene
    this.viewer.tjs.render();
  }

  updateLabel(atomIndex = null, atoms = null) {
    /* When the atom is moved, the label created from the atom attribute will be updated.
    if atomIndex is null, update all bonds
    if atoms is null, use this.viewer.atoms, otherwise use the provided atoms to update the bonds, e.g. trajectory data
    */
    // console.log("updateBondMesh: ", atomIndex);
  }
}

function clearLabels(scene, labels) {
  // Clear existing labels
  labels.forEach((label) => {
    scene.remove(label);
    // Remove the HTML element
    label.remove();
  });
}

export function drawAtomLabels(origins, texts, fontSize, color) {
  const labels = [];
  // Iterate over positions and create labels
  for (let i = 0; i < origins.length; i++) {
    // Create or update the label for each atom
    const position = new THREE.Vector3(...origins[i]);
    const label = createLabel(position, texts[i], "black");
    labels.push(label); // Store the label for future reference
  }
  return labels;
}
