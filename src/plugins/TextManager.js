import * as THREE from "three";
import { createLabel } from "../utils.js";
import { cloneValue } from "../state/store.js";

class Setting {
  constructor({ positions = [], texts = "+", color = "#111111", fontSize = "16px", className = "text-label text-label-cross", renderMode = "glyph", shift = [0, 0, 0] }) {
    this.positions = positions;
    this.texts = texts;
    this.color = color;
    this.fontSize = fontSize;
    this.className = className;
    this.renderMode = renderMode;
    this.shift = shift;
  }
}

export class TextManager {
  constructor(target) {
    this.weas = target?.weas ? target.weas : target;
    this.viewer = target?.weas ? target : null;
    this.scene = this.weas?.tjs?.scene;
    this.state = this.weas?.state;
    this.settings = [];
    this.labels = [];

    const pluginState = this.state?.get("plugins.text");
    if (pluginState && Array.isArray(pluginState.settings)) {
      this.applySettings(pluginState.settings);
      this.drawTextLabels();
    }
    this.state?.subscribe("plugins.text", (next) => {
      if (!next) {
        return;
      }
      const settings = Array.isArray(next.settings) ? next.settings : [];
      this.applySettings(settings);
      const viewer = this.getViewer();
      if (viewer?._initializingState) {
        return;
      }
      this.drawTextLabels();
    });
  }

  setSettings(settings) {
    this.state.set({ plugins: { text: { settings: cloneValue(settings) } } });
  }

  applySettings(settings) {
    this.settings = [];
    this.clearLabels();
    settings.forEach((setting) => {
      this.addSetting(setting);
    });
  }

  addSetting({ positions, texts = "+", color = "#111111", fontSize = "16px", className, renderMode = "glyph", shift = [0, 0, 0] }) {
    const setting = new Setting({ positions, texts, color, fontSize, className, renderMode, shift });
    this.settings.push(setting);
  }

  clearLabels() {
    this.labels.forEach((label) => {
      this.scene.remove(label);
      label.remove();
    });
    this.labels = [];
  }

  redraw() {
    this.drawTextLabels();
  }

  drawTextLabels() {
    this.clearLabels();
    this.settings.forEach((setting) => {
      const origins = resolveOrigins(this.getAtoms(), setting);
      if (!origins.length) {
        return;
      }
      const shift = new THREE.Vector3(...setting.shift);
      const texts = Array.isArray(setting.texts) ? setting.texts : null;
      const fontSize = normalizeFontSize(setting.fontSize);
      const className = setting.className || "text-label text-label-cross";
      const renderMode = setting.renderMode || "glyph";
      origins.forEach((origin, index) => {
        const position = new THREE.Vector3(...origin).add(shift);
        const text = texts ? (texts[index] ?? "") : setting.texts;
        const { label } = this.createTextLabel(position, text, setting.color, fontSize, className, renderMode);
        this.scene.add(label);
        this.labels.push(label);
      });
    });
    this.weas?.requestRedraw?.("render");
  }

  createTextLabel(position, text, color, fontSize, className, renderMode = "glyph") {
    const wantsCross = text === "+";
    const normalizedClassName = wantsCross && !className.includes("text-label-cross") ? `${className} text-label-cross` : className;
    const label = createLabel(position, text, color, fontSize, normalizedClassName);
    const isCross = wantsCross && normalizedClassName.includes("text-label-cross") && renderMode === "shape";
    if (isCross) {
      label.element.textContent = "";
      label.element.dataset.cross = "true";
      label.element.style.setProperty("--cross-size", fontSize);
    }
    return { label, isCross };
  }

  updateLabelSizes() {}

  getAtoms() {
    const viewer = this.getViewer();
    if (viewer?.atoms) {
      return viewer.atoms;
    }
    return null;
  }

  getViewer() {
    return this.viewer || this.weas?.avr || null;
  }
}

function resolveOrigins(atoms, setting) {
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
