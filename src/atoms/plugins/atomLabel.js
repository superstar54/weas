import * as THREE from "three";
import merge from "lodash.merge";

import { cloneValue } from "../../state/store";


const DEFAULT_LABEL_SETTING = {
  origins: [],
  texts: [],
  selection: null,
  color: "#000000ff",
  fontSize: 0.05,
  className: "atom-label",
  renderMode: "glyph",
  shift: [0, 0, 0],
};

/**
 * Manages labels attached to atoms in a molecular viewer.
 */
export class AtomLabelManager {
  constructor(viewer) {
    this.viewer = viewer;
    this.scene = this.viewer.tjs.scene;
    this.settings = [];
    // TODO: what is this used for - can we remove it?
    this.overlaySettings = [];
    this.labels = [];

    this.textManager = this.viewer.weas.textManager;

    const pluginState = this.viewer.state.get("plugins.atomLabel");
    if (pluginState && Array.isArray(pluginState.settings)) {
      this.applySettings(pluginState.settings, pluginState.overlaySettings);
      this.drawAtomLabels();
    }
    this.viewer.state.subscribe("plugins.atomLabel", (next) => {
      if (!next) {
        return;
      }
      const settings = Array.isArray(next.settings) ? next.settings : [];
      const overlaySettings = Array.isArray(next.overlaySettings)
        ? next.overlaySettings
        : [];
      this.applySettings(settings, overlaySettings);
      if (this.viewer._initializingState) {
        return;
      }
      this.drawAtomLabels();
    });
  }

  /**
   * Updates the settings.
   * @param {Array<Object>} settings
   */
  setSettings(settings) {
    const overlaySettings =
      this.viewer.state.get("plugins.atomLabel")?.overlaySettings || [];
    this.viewer.state.set({
      plugins: {
        atomLabel: {
          settings: cloneValue(settings),
          overlaySettings: cloneValue(overlaySettings),
        },
      },
    });
  }

  /**
   * Updates overlay-specific label settings.
   * @param {Array<Object>} settings
   */
  setOverlaySettings(settings) {
    const baseSettings =
      this.viewer.state.get("plugins.atomLabel")?.settings || [];
    this.viewer.state.set({
      plugins: {
        atomLabel: {
          settings: cloneValue(baseSettings),
          overlaySettings: cloneValue(settings),
        },
      },
    });
  }

  /**
   * Applies label settings and clears any previous labels.
   * @param {Array<Object>} settings
   * @param {Array<Object>} overlaySettings
   */
  applySettings(settings, overlaySettings = []) {
    /* Set the label settings */
    this.settings = [];
    this.overlaySettings = [];
    clearLabels(this.scene, this.labels);
    // loop over settings to add each setting
    settings.forEach((setting) => {
      this.addSetting(setting);
    });
    overlaySettings.forEach((setting) => {
      this.addOverlaySetting(setting);
    });
  }

  /**
   * Adds a label setting to the base settings array.
   * @param {Object} options
   */
  addSetting(options) {
    this.settings.push(merge({}, DEFAULT_LABEL_SETTING, options));
  }

  /**
   * Adds a label setting to the overlay settings array.
   * @param {Object} options
   */
  addOverlaySetting(options) {
    this.overlaySettings.push(merge({}, DEFAULT_LABEL_SETTING, options));
  }

  /**
   * Removes all labels from the scene.
   */
  clearLabels() {
    clearLabels(this.scene, this.labels);
  }

  /**
   * Draws all labels in the scene based on current settings.
   */
  drawAtomLabels() {
    this.clearLabels();

    const allSettings = [...this.settings, ...this.overlaySettings];

    for (let s = 0; s < allSettings.length; s++) {
      const setting = allSettings[s];

      const selection =
        setting.selection ||
        Array.from({ length: this.viewer.atoms.getAtomsCount() }, (_, i) => i);

      let origins = setting.origins;
      let texts = setting.texts;

      // TODO: This cant be the best way to restore from a save;
      // Think of a nice interface for saving and restoring.
      if (typeof origins === "string") {
        const attr = this.viewer.atoms.getAttribute(origins);
        origins = selection.map((i) => attr[i]);
      }
      if (typeof texts === "string") {
        const attr = this.viewer.atoms.getAttribute(texts);
        texts = selection.map((i) => attr[i]);
      }

      for (let i = 0; i < origins.length; i++) {
        const fS = this.getAtomRadiusScale(i);

        const label = this.textManager.addLabel({
          text: texts[i],
          position: origins[i],
          color: setting.color,
          fontSize: fS * 50,
          className: setting.className,
          renderMode: setting.renderMode,
        });

        label.userData.atomIndex = selection[i];
        this.labels.push(label);
      }
    }
  }

  /**
   * Updates the positions of all labels to match the atom positions.
   * @param {Object|null} atoms - Optional atom object containing positions.
   */
  updateLabelPositions(atoms = null) {
    const activeAtoms = atoms || this.viewer.atoms;
    if (!activeAtoms || !this.labels || this.labels.length === 0) {
      return;
    }
    for (let i = 0; i < this.labels.length; i++) {
      const label = this.labels[i];
      const atomIndex = label.userData?.atomIndex;
      if (atomIndex === null || atomIndex === undefined) {
        continue;
      }
      const position = activeAtoms.positions[atomIndex];
      if (!position) {
        continue;
      }
      label.position.set(position[0], position[1], position[2]);
    }
  }

  /**
   * Gets the radius of an atom from its mesh scaling. Used for fontsize scaling
   * @param {number} atomIndex - Index of the atom.
   * @returns {number|null} - Atom radius or null if unavailable.
   */
  getAtomRadiusScale(atomIndex) {
    if (atomIndex === null || atomIndex === undefined) {
      return null;
    }
    const mesh = this.viewer.atomManager?.meshes?.["atom"];
    if (!mesh || typeof mesh.getMatrixAt !== "function") {
      return null;
    }
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const rotation = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    mesh.getMatrixAt(atomIndex, matrix);
    matrix.decompose(position, rotation, scale);
    return scale.x || scale.y || scale.z || null;
  }
}

/**
 * Clears labels from the scene and removes their DOM elements.
 * @param {THREE.Scene} scene
 * @param {Array<Object>} labels
 */
function clearLabels(scene, labels) {
  // Clear existing labels
  labels.forEach((label) => {
    scene.remove(label);
    // Remove the HTML element
    label.remove();
  });
}
