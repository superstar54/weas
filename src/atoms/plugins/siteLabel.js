import * as THREE from "three";
import { createLabel } from "../../utils.js";
import { cloneValue } from "../../state/store.js";

class Setting {
  constructor({ positions = [], indices = [], texts = "+", color = "#111111", fontSize = "16px", className = "site-label site-label-cross", sizeMode = "auto", shift = [0, 0, 0] }) {
    this.positions = positions;
    this.indices = indices;
    this.texts = texts;
    this.color = color;
    this.fontSize = fontSize;
    this.className = className;
    this.sizeMode = sizeMode;
    this.shift = shift;
  }
}

export class SiteLabelManager {
  constructor(viewer) {
    this.viewer = viewer;
    this.scene = this.viewer.tjs.scene;
    this.settings = [];
    this.labels = [];

    const pluginState = this.viewer.state.get("plugins.siteLabel");
    if (pluginState && Array.isArray(pluginState.settings)) {
      this.applySettings(pluginState.settings);
      this.drawSiteLabels();
    }
    this.viewer.state.subscribe("plugins.siteLabel", (next) => {
      if (!next) {
        return;
      }
      const settings = Array.isArray(next.settings) ? next.settings : [];
      this.applySettings(settings);
      if (this.viewer._initializingState) {
        return;
      }
      this.drawSiteLabels();
    });
  }

  setSettings(settings) {
    this.viewer.state.set({ plugins: { siteLabel: { settings: cloneValue(settings) } } });
  }

  applySettings(settings) {
    this.settings = [];
    this.clearLabels();
    settings.forEach((setting) => {
      this.addSetting(setting);
    });
  }

  addSetting({ positions, indices = [], texts = "+", color = "#111111", fontSize = "16px", className, shift = [0, 0, 0] }) {
    const setting = new Setting({ positions, indices, texts, color, fontSize, className, shift });
    this.settings.push(setting);
  }

  clearLabels() {
    this.labels.forEach((label) => {
      this.scene.remove(label);
      label.remove();
    });
    this.labels = [];
    this.labelEntries = [];
  }

  redraw() {
    this.drawSiteLabels();
  }

  drawSiteLabels() {
    this.clearLabels();
    this.settings.forEach((setting) => {
      const origins = resolveOrigins(this.viewer.atoms, setting);
      if (!origins.length) {
        return;
      }
      const shift = new THREE.Vector3(...setting.shift);
      const texts = Array.isArray(setting.texts) ? setting.texts : null;
      const fontSize = normalizeFontSize(setting.fontSize);
      const className = setting.className || "site-label site-label-cross";
      const sizeMode = resolveSizeMode(setting);
      origins.forEach((origin, index) => {
        const position = new THREE.Vector3(...origin).add(shift);
        const text = texts ? (texts[index] ?? "") : setting.texts;
        const label = createLabel(position, text, setting.color, fontSize, className);
        const isCross = className.includes("site-label-cross") && text === "+";
        if (isCross) {
          label.element.textContent = "";
          label.element.dataset.cross = "true";
          label.element.style.setProperty("--cross-size", fontSize);
        }
        this.scene.add(label);
        this.labels.push(label);
        this.labelEntries.push({
          label,
          atomIndex: setting.indices && setting.indices.length ? setting.indices[index] : null,
          sizeMode,
          baseFontSize: fontSize,
          isCross,
        });
      });
    });
    this.updateLabelSizes();
    this.viewer.requestRedraw?.("render");
  }

  updateLabelSizes(camera = null, renderer = null) {
    const activeCamera = camera || this.viewer?.tjs?.camera;
    const activeRenderer = renderer || this.viewer?.tjs?.renderers?.MainRenderer?.renderer;
    if (!activeCamera || !activeRenderer) {
      return;
    }
    if (!this.labelEntries || this.labelEntries.length === 0) {
      return;
    }
    const size = activeRenderer.getSize(new THREE.Vector2());
    const right = new THREE.Vector3();
    const up = new THREE.Vector3();
    const forward = new THREE.Vector3();
    activeCamera.matrixWorld.extractBasis(right, up, forward);
    this.labelEntries.forEach((entry) => {
      if (!entry.label || !entry.label.element) {
        return;
      }
      if (entry.sizeMode !== "atom" || entry.atomIndex === null || entry.atomIndex === undefined) {
        return;
      }
      const radius = this.getAtomRadius(entry.atomIndex);
      if (!radius || radius <= 0) {
        return;
      }
      const position = this.viewer.atoms.positions[entry.atomIndex];
      if (!position) {
        return;
      }
      const center = new THREE.Vector3(...position);
      const edge = center.clone().add(right.clone().multiplyScalar(radius));
      const centerNdc = center.project(activeCamera);
      const edgeNdc = edge.project(activeCamera);
      const dx = (edgeNdc.x - centerNdc.x) * size.x * 0.5;
      const dy = (edgeNdc.y - centerNdc.y) * size.y * 0.5;
      const pixelRadius = Math.sqrt(dx * dx + dy * dy);
      const diameterPx = Math.max(1, Math.round(pixelRadius * 2));
      entry.label.element.style.fontSize = `${diameterPx}px`;
      if (entry.isCross) {
        entry.label.element.style.setProperty("--cross-size", `${diameterPx}px`);
      }
    });
  }

  getAtomRadius(atomIndex) {
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

function resolveOrigins(atoms, setting) {
  if (Array.isArray(setting.indices) && setting.indices.length > 0) {
    return setting.indices.map((index) => atoms.positions[index]).filter(Boolean);
  }
  if (Array.isArray(setting.positions)) {
    return setting.positions;
  }
  return [];
}

function normalizeFontSize(fontSize) {
  if (typeof fontSize === "number") {
    return `${fontSize}px`;
  }
  if (typeof fontSize === "string" && fontSize.trim() !== "") {
    return fontSize;
  }
  return "14px";
}

function resolveSizeMode(setting) {
  if (setting.sizeMode === "atom" || setting.sizeMode === "screen") {
    return setting.sizeMode;
  }
  if (Array.isArray(setting.indices) && setting.indices.length > 0) {
    return "atom";
  }
  return "screen";
}
