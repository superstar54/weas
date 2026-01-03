import * as THREE from "three";
import { cloneValue } from "../../state/store.js";

class Setting {
  constructor({ origins = [], texts = [], selection = null, color = "#000000ff", fontSize = 0.05, className = "atom-label", renderMode = "glyph", shift = false }) {
    /* A class to store label settings */

    this.origins = origins;
    this.texts = texts;
    this.selection = selection;
    this.color = color;
    this.fontSize = fontSize;
    this.className = className;
    this.renderMode = renderMode;
    this.shift = shift;
  }
}

export class AtomLabelManager {
  constructor(viewer) {
    this.viewer = viewer;
    this.scene = this.viewer.tjs.scene;
    this.settings = [];
    this.overlaySettings = [];
    this.labels = [];

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
      const overlaySettings = Array.isArray(next.overlaySettings) ? next.overlaySettings : [];
      this.applySettings(settings, overlaySettings);
      if (this.viewer._initializingState) {
        return;
      }
      this.drawAtomLabels();
    });
  }

  setSettings(settings) {
    const overlaySettings = this.viewer.state.get("plugins.atomLabel")?.overlaySettings || [];
    this.viewer.state.set({ plugins: { atomLabel: { settings: cloneValue(settings), overlaySettings: cloneValue(overlaySettings) } } });
  }

  setOverlaySettings(settings) {
    const baseSettings = this.viewer.state.get("plugins.atomLabel")?.settings || [];
    this.viewer.state.set({ plugins: { atomLabel: { settings: cloneValue(baseSettings), overlaySettings: cloneValue(settings) } } });
  }

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

  // Modify addSetting to accept a single object parameter
  addSetting({ origins, texts, selection = null, color = "#000000ff", fontSize = 0.05, className = "atom-label", renderMode = "glyph", shift = [0, 0, 0] }) {
    /* Add a new setting to the label */
    if (typeof origins === "string") {
      if (!this.viewer.atoms.getAttribute(origins)) {
        throw new Error(`Attribute '${origins}' is not defined. The available attributes are: ${Object.keys(this.viewer.atoms.attributes["atom"])}`);
      }
    }
    const setting = new Setting({ origins, texts, selection, color, fontSize, className, renderMode, shift });
    this.settings.push(setting);
  }

  addOverlaySetting({ origins, texts, selection = null, color = "#000000ff", fontSize = 0.05, className = "atom-label", shift = [0, 0, 0] }) {
    const setting = new Setting({ origins, texts, selection, color, fontSize, className, shift });
    this.overlaySettings.push(setting);
  }

  clearLabels() {
    clearLabels(this.scene, this.labels);
  }

  drawAtomLabels() {
    /* Draw labels */
    this.clearLabels();
    this.labels = [];
    [...this.settings, ...this.overlaySettings].forEach((setting) => {
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
      const labelFactory = this.viewer.weas?.textManager?.createTextLabel?.bind(this.viewer.weas.textManager);
      if (!labelFactory) {
        throw new Error("TextManager is not available for atom label rendering.");
      }
      const labels = drawAtomLabels(origins, texts, setting.fontSize, setting.color, indices, labelFactory, setting.className, setting.renderMode);
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

  updateLabelSizes(camera = null, renderer = null) {
    const activeCamera = camera || this.viewer?.tjs?.camera;
    const activeRenderer = renderer || this.viewer?.tjs?.renderers?.MainRenderer?.renderer;
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
      const isCross = element.dataset?.cross === "true";
      if (isCross && activeRenderer) {
        const atomIndex = label.userData?.atomIndex;
        const radius = this.getAtomRadius(atomIndex);
        if (radius) {
          const size = activeRenderer.getSize(new THREE.Vector2());
          const right = new THREE.Vector3();
          const up = new THREE.Vector3();
          const forward = new THREE.Vector3();
          activeCamera.matrixWorld.extractBasis(right, up, forward);
          const position = this.viewer.atoms.positions[atomIndex];
          if (position) {
            const center = new THREE.Vector3(...position);
            const edge = center.clone().add(right.clone().multiplyScalar(radius));
            const centerNdc = center.project(activeCamera);
            const edgeNdc = edge.project(activeCamera);
            const dx = (edgeNdc.x - centerNdc.x) * size.x * 0.5;
            const dy = (edgeNdc.y - centerNdc.y) * size.y * 0.5;
            const pixelRadius = Math.sqrt(dx * dx + dy * dy);
            const diameterPx = Math.max(1, Math.round(pixelRadius * 2));
            element.style.setProperty("--cross-size", `${diameterPx}px`);
            element.style.fontSize = `${diameterPx}px`;
            return;
          }
        }
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
        label.userData.baseZoom = 1;
      }
      label.getWorldPosition(worldPosition);
      let fontSizePx = baseFontPx;
      if (activeCamera.isOrthographicCamera) {
        baseZoom = baseZoom || 1;
        const currentZoom = activeCamera.zoom || 1;
        const scale = currentZoom / baseZoom;
        fontSizePx = Math.max(6, Math.min(96, baseFontPx * scale * 0.65));
      } else {
        const currentDistance = activeCamera.position.distanceTo(worldPosition);
        if (!currentDistance) {
          return;
        }
        const scale = baseDistance / currentDistance;
        fontSizePx = Math.max(6, Math.min(96, baseFontPx * scale * 0.65));
      }
      label.element.style.fontSize = `${fontSizePx}px`;
    });
  }

  getAtomRadius(atomIndex) {
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

function clearLabels(scene, labels) {
  // Clear existing labels
  labels.forEach((label) => {
    scene.remove(label);
    // Remove the HTML element
    label.remove();
  });
}

export function drawAtomLabels(origins, texts, fontSize, color, indices = [], labelFactory, className = "atom-label", renderMode = "glyph") {
  const labels = [];
  const normalizedFontSize = normalizeFontSize(fontSize);
  const baseFontPx = getBaseFontPx(normalizedFontSize);
  // Iterate over positions and create labels
  for (let i = 0; i < origins.length; i++) {
    // Create or update the label for each atom
    const position = new THREE.Vector3(...origins[i]);
    const text = texts[i];
    const result = labelFactory(position, text, color, normalizedFontSize, className, renderMode);
    const label = result && result.label ? result.label : result;
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
