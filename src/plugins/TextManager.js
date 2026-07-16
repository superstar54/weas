import * as THREE from "three";
import { createLabel } from "../utils";
import { cloneValue } from "../state/store";

// TODO, switch to  batch updating addLabel -> addLabels for potential performance reasons
// Also would require rewriting the createLabel util to be batched maybe

/**
 * Default settings for text labels.
 * @type {Object}
 * @property {string} text - Label content.
 * @property {number[]} position - 3D position [x, y, z].
 * @property {string} color - CSS color string.
 * @property {string|number} fontSize - Font size in px or numeric.
 * @property {string} className - CSS class applied to label div.
 * @property {string} renderMode - Rendering mode, e.g., "glyph".
 */
export const DEFAULT_TEXT_SETTINGS = {
  text: "",
  position: [0, 0, 0],
  color: "#000000",
  fontSize: "14px",
  className: "text-label",
  renderMode: "glyph",
};

/**
 * Manages CSS2D/3D text labels in a Three.js scene.
 *  TextManager
 * @class
 */
export class TextManager {
  /**
   * @param {Object} weas - The WEAS instance.
   * @param {Object} [options] - Optional parameters.
   * @param {string} [options.sceneName="MainScene"] - Scene to attach labels to.
   */
  constructor(weas, { sceneName = "MainScene", maxLabels = 2000 } = {}) {
    if (!weas) throw new Error("A WEAS instance is required");
    this.weas = weas;
    this.scene = weas.tjs?.scenes?.[sceneName] || weas.tjs?.scene;
    if (!this.scene) throw new Error(`Scene "${sceneName}" not found`);
    this.labels = [];
    this.maxLabels = maxLabels;

    this._updateHooks = [];
  }

  /**
   * Registers a callback to be called whenever labels are updated.
   * @param {Function} callback - Callback receiving the labels array.
   */
  onChange(callback) {
    if (typeof callback === "function") this._updateHooks.push(callback);
  }

  /**
   * Calls all registered update hooks.
   * @private
   */
  _emitChange() {
    this._updateHooks.forEach((fn) => fn(this.labels));
  }

  /**
   * Adds a new label to the scene.
   * @param {Object} options - Label options.
   * @param {string} [options.text] - Label text.
   * @param {number[]} [options.position] - Label position [x, y, z].
   * @param {string} [options.color] - Label color.
   * @param {string|number} [options.fontSize] - Label font size.
   * @param {string} [options.className] - CSS class for the label.
   * @param {string} [options.renderMode] - Rendering mode.
   * @param {boolean} [options.clampFont=true] - Clamp font size to min/max.
   * @returns {THREE.Object3D} The created label object.
   */
  addLabel(options = {}) {
    // Hard cap protection
    if (this.labels.length >= this.maxLabels) {
      console.warn(`TextManager: maxLabels (${this.maxLabels}) reached`);
      return null;
    }

    const {
      text,
      position,
      color,
      fontSize,
      className,
      renderMode,
      clampFont = true,
    } = {
      ...DEFAULT_TEXT_SETTINGS,
      ...options,
    };

    const posVec = new THREE.Vector3(...position);
    const fontSizeStr = normalizeFontSize(fontSize, clampFont);

    const label = createLabel(posVec, text, color, fontSizeStr, className);
    this.scene.add(label);
    this.labels.push(label);
    this._emitChange();
    return label;
  }

  /**
   * Removes a label from the scene.
   * @param {THREE.Object3D} label - The label to remove.
   */
  removeLabel(label) {
    if (!label) return;
    this.scene.remove(label);
    label.remove?.();
    this.labels = this.labels.filter((l) => l !== label);
    this._emitChange();
  }

  /**
   * Removes an array of labels from the scene, defaults to all labels
   */
  clearLabels(labels = this.labels) {
    if (!labels || labels.length === 0) return;

    const scene = this.scene;

    for (let i = 0; i < labels.length; i++) {
      const label = labels[i];
      if (!label) continue;

      scene.remove(label);

      const el = label.element;
      if (el?.parentNode) {
        el.parentNode.removeChild(el);
      }

      label.remove?.();

      // 👇 IMPORTANT: keep registry consistent
      const idx = this.labels.indexOf(label);
      if (idx !== -1) this.labels.splice(idx, 1);
    }

    // safety reset if full clear
    if (labels === this.labels) {
      this.labels.length = 0;
    }

    this._emitChange();
  }

  /**
   * Updates the position of a label.
   * @param {THREE.Object3D} label - The label to update.
   * @param {number[]} newPosition - New position [x, y, z].
   */
  updateLabelPosition(label, newPosition) {
    if (!label || !newPosition) return;
    label.position.set(...newPosition);
    this._emitChange();
  }

  /**
   * Updates the text content of a label.
   * @param {THREE.Object3D} label - The label to update.
   * @param {string} newText - New text content.
   */
  updateLabelText(label, newText) {
    if (!label || newText === undefined) return;
    if (label.element) {
      label.element.textContent = newText;
    }
    this._emitChange();
  }

  /**
   * Adds multiple labels at once, using the old API style.
   *
   * **Purpose:** This is a backward-compatible wrapper to mimic the
   * previous `setSettings` behavior for batch label creation.
   *
   * @param {Array<Object>} settingsArray - Array of label configs.
   * @param {Array<number[]>} settingsArray[].positions - List of 3D positions for the label(s).
   * @param {string|Array<string>} settingsArray[].texts - Text content, either a single string
   *     for all positions, or an array matching positions.
   * @param {string} [settingsArray[].color] - Label color (CSS string).
   * @param {string|number} [settingsArray[].fontSize] - Font size (px or number).
   * @param {string} [settingsArray[].className] - CSS class for the label.
   * @param {string} [settingsArray[].renderMode] - Rendering mode, e.g., "glyph".
   *
   * @example
   * textManager.setSettings([
   *   {
   *     positions: [[0,0,0], [1,0,0]],
   *     texts: ["A", "B"],
   *     color: "#ff0000",
   *     fontSize: "20px",
   *   },
   * ]);
   *
   * @see {@link TextManager#addLabel} for the underlying single-label API.
   */ setSettings(settingsArray = []) {
    this.clearLabels();

    settingsArray.forEach((config) => {
      const { positions = [], texts = "", ...rest } = config;

      positions.forEach((pos, i) => {
        this.addLabel({
          position: pos,
          text: Array.isArray(texts) ? texts[i] : texts,
          ...rest,
        });
      });
    });
  }
}

/**
 * Normalizes a font size value and optionally clamps it to min/max.
 * Ensures the returned value is a valid CSS px string.
 * @param {number|string} fontSize - Font size as number or string.
 * @param {boolean} [clamp=true] - Whether to clamp the value.
 * @param {number} [min=18] - Minimum font size.
 * @param {number} [max=36] - Maximum font size.
 * @returns {string} Font size string with "px" units.
 */
function normalizeFontSize(fontSize, clamp = true, min = 14, max = 28) {
  let size;

  if (typeof fontSize === "number") {
    size = fontSize;
  } else if (typeof fontSize === "string") {
    const parsed = parseFloat(fontSize);
    size = Number.isFinite(parsed) ? parsed : min;
  } else {
    size = min;
  }

  if (clamp) {
    size = Math.max(min, Math.min(max, size));
  }

  return `${size}px`;
}
