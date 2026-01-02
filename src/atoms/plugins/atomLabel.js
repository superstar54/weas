import * as THREE from "three";
import { createLabel } from "../../utils.js";
import { cloneValue } from "../../state/store.js";

class Setting {
  constructor({ origins = [], texts = [], selection = null, color = "#3d82ed", fontSize = 0.05, shift = false }) {
    /* A class to store label settings */

    this.origins = origins;
    this.texts = texts;
    this.selection = selection;
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

    const pluginState = this.viewer.state.get("plugins.atomLabel");
    if (pluginState && Array.isArray(pluginState.settings)) {
      this.applySettings(pluginState.settings);
      this.drawAtomLabels();
    }
    this.viewer.state.subscribe("plugins.atomLabel", (next) => {
      if (!next) {
        return;
      }
      const settings = Array.isArray(next.settings) ? next.settings : [];
      this.applySettings(settings);
      if (this.viewer._initializingState) {
        return;
      }
      this.drawAtomLabels();
    });
  }

  setSettings(settings) {
    this.viewer.state.set({ plugins: { atomLabel: { settings: cloneValue(settings) } } });
  }

  applySettings(settings) {
    /* Set the label settings */
    this.settings = [];
    clearLabels(this.scene, this.labels);
    // loop over settings to add each setting
    settings.forEach((setting) => {
      this.addSetting(setting);
    });
  }

  // Modify addSetting to accept a single object parameter
  addSetting({ origins, texts, selection = null, color = "#3d82ed", fontSize = 0.05, shift = [0, 0, 0] }) {
    /* Add a new setting to the label */
    if (typeof origins === "string") {
      if (!this.viewer.atoms.getAttribute(origins)) {
        throw new Error(`Attribute '${origins}' is not defined. The available attributes are: ${Object.keys(this.viewer.atoms.attributes["atom"])}`);
      }
    }
    const setting = new Setting({ origins, texts, selection, color, fontSize, shift });
    this.settings.push(setting);
  }

  clearLabels() {
    clearLabels(this.scene, this.labels);
  }

  drawAtomLabels() {
    /* Draw labels */
    this.clearLabels();
    this.labels = [];
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
      const indices = typeof setting.origins === "string" ? selection : null;
      const labels = drawAtomLabels(origins, texts, setting.fontSize, setting.color, indices);
      // Add mesh to the scene
      for (let i = 0; i < labels.length; i++) {
        this.scene.add(labels[i]);
      }
      this.labels.push(...labels);
    });
    this.updateLabelSizes();
    // call the render function to update the scene
    this.viewer.requestRedraw?.("render");
  }

  updateLabel(atomIndex = null, atoms = null) {
    /* When the atom is moved, the label created from the atom attribute will be updated.
    if atomIndex is null, update all bonds
    if atoms is null, use this.viewer.atoms, otherwise use the provided atoms to update the bonds, e.g. trajectory data
    */
  }

  updateLabelSizes(camera = null) {
    const activeCamera = camera || this.viewer?.tjs?.camera;
    if (!activeCamera || !this.labels || this.labels.length === 0) {
      return;
    }
    this.scene.updateMatrixWorld(true);
    const worldPosition = new THREE.Vector3();
    this.labels.forEach((label) => {
      const element = label.element;
      if (!element) {
        return;
      }
      let baseFontPx = label.userData?.baseFontPx;
      let baseDistance = label.userData?.baseDistance;
      let baseZoom = label.userData?.baseZoom;
      if (!label.element || !baseFontPx || !baseDistance) {
        label.getWorldPosition(worldPosition);
        baseDistance = activeCamera.position.distanceTo(worldPosition);
        if (!baseFontPx) {
          const parsed = parseFloat(element.style.fontSize || window.getComputedStyle(element).fontSize || "14px");
          baseFontPx = Number.isFinite(parsed) && parsed > 0 ? parsed : 14;
        }
        label.userData.baseFontPx = baseFontPx;
        label.userData.baseDistance = baseDistance;
        label.userData.baseZoom = activeCamera.zoom || 1;
      }
      label.getWorldPosition(worldPosition);
      let fontSizePx = baseFontPx;
      if (activeCamera.isOrthographicCamera) {
        baseZoom = baseZoom || activeCamera.zoom || 1;
        const currentZoom = activeCamera.zoom || 1;
        const scale = currentZoom / baseZoom;
        fontSizePx = Math.max(6, Math.min(96, baseFontPx * scale * 0.85));
      } else {
        const currentDistance = activeCamera.position.distanceTo(worldPosition);
        if (!currentDistance) {
          return;
        }
        const scale = baseDistance / currentDistance;
        fontSizePx = Math.max(6, Math.min(96, baseFontPx * scale * 0.85));
      }
      label.element.style.fontSize = `${fontSizePx}px`;
    });
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

export function drawAtomLabels(origins, texts, fontSize, color, indices = []) {
  const labels = [];
  const normalizedFontSize = normalizeFontSize(fontSize);
  const baseFontPx = getBaseFontPx(normalizedFontSize);
  // Iterate over positions and create labels
  for (let i = 0; i < origins.length; i++) {
    // Create or update the label for each atom
    const position = new THREE.Vector3(...origins[i]);
    const label = createLabel(position, texts[i], color, normalizedFontSize, "atom-label");
    label.userData.baseFontPx = baseFontPx;
    label.userData.atomIndex = Array.isArray(indices) ? indices[i] : null;
    labels.push(label); // Store the label for future reference
  }
  return labels;
}

function normalizeFontSize(fontSize) {
  if (typeof fontSize === "number") {
    if (fontSize <= 1) {
      return "14px";
    }
    return `${fontSize}px`;
  }
  if (typeof fontSize === "string" && fontSize.trim() !== "") {
    return fontSize;
  }
  return "14px";
}

function getBaseFontPx(fontSize) {
  const parsed = parseFloat(fontSize);
  if (Number.isFinite(parsed) && parsed >= 1) {
    return parsed;
  }
  return 14;
}
