import { cloneValue } from "../../state/store";

import {
  getPosition,
  getDistance,
  getAngle,
  getDihedral,
} from "../../geometry/geometryMath";

import merge from "lodash.merge";

// some measurement keys will return the same response, this should group them correctly
function getMeasurementKey(indices) {
  if (indices.length === 1) {
    return indices.join("-");
  }

  if (indices.length === 2) {
    return [...indices].sort((a, b) => a - b).join("-");
  }

  if (indices.length === 3) {
    const forward = indices.join("-");
    const reverse = [indices[2], indices[1], indices[0]].join("-");

    return forward < reverse ? forward : reverse;
  }

  if (indices.length === 4) {
    const reverse = [...indices].reverse();

    const forwardKey = indices.join("-");
    const reverseKey = reverse.join("-");

    return forwardKey < reverseKey ? forwardKey : reverseKey;
  }

  return indices.join("-");
}

// TODO: Think if this even belongs here?
// I feel like measuring the distance between two objects
// might be a useful method to have at the weas core and hide alot of this logic away

// TODO: I think in retrospect a measurement is a fundamental feature of THREE objects.
// We should provide a nice set of utilities that allow this and this should become as thin as possible

/**
 * Default settings for the Measurement plugin.
 *
 * Structure:
 * - global defaults (color, fontSize, visibility)
 * - measurements: individual measurement entries keyed by name
 */
export const DEFAULT_MEASUREMENT_SETTINGS = {
  enabled: true,
  // global style defaults (used unless overridden per measurement)
  color: "black",
  fontSize: 16,

  // rendering options
  lineColor: 0x0000ff,
  lineWidth: 1,
  opacity: 0.9,
  measurements: {},

  showLabels: true,
  showLines: true,
};

/**
 * Measurement plugin for visualizing distances, angles, and dihedral angles
 * between atoms in a molecular viewer.
 *  Measurement
 * @class
 */
export class Measurement {
  /**
   * @param {Object} viewer - The molecular viewer instance.
   * @param {Object} [settings={}] - Optional initial settings to override defaults.
   */
  constructor(viewer, settings = {}) {
    this.viewer = viewer;
    this.scene = this.viewer.tjs.scene;

    this.textManager = this.viewer.weas.textManager;
    this.shapeRegistry = this.viewer.weas.shapeRegistry;

    this.meshes = {};

    // defaults → constructor overrides → state
    this.settings = merge({}, DEFAULT_MEASUREMENT_SETTINGS, settings);

    const pluginState = this.viewer.state.get("plugins.measurement") || {};
    merge(this.settings, pluginState);

    this._rebuild();

    this.viewer.state.subscribe("plugins.measurement", (next, prev) => {
      if (!next || this.viewer._initializingState) return;
      this._onStateChange(next, prev);
    });
  }

  /**
   * Reset all measurements and clear the scene.
   */
  reset() {
    /* Reset the measurements */
    this.clearMeshes();
    this.settings = {};
    this.viewer.requestRedraw?.("render");
  }

  /**
   * Add a new measurement for a given selection of atoms.
   * @param {number[]} indices - Array of atom indices (1-4 atoms).
   */
  measure(indices = []) {
    if (!indices.length) {
      this.viewer.state.set({ plugins: { measurement: null } });
      return;
    }

    const current = this.viewer.state.get("plugins.measurement") || {};
    const measurements = { ...(current.measurements || {}) };

    const name = `measurement-${getMeasurementKey(indices)}`;

    if (measurements[name]) {
      delete measurements[name];
    } else {
      measurements[name] = { indices };
    }

    this.viewer.state.replace("plugins.measurement.measurements", measurements);
  }

  /**
   * Update global or per-measurement settings.
   * @param {Object} settings - Settings to apply.
   */
  setSettings(settings) {
    this.viewer.state.replace(
      "plugins.measurement.settings",
      cloneValue(settings),
    );
  }

  /**
   * Apply per-measurement settings from an object.
   * @param {Object} settings - Measurements keyed by name.
   */
  applySettings(settings) {
    /* Set measurement settings */
    this.settings = {};
    this.clearMeshes();
    Object.entries(settings).forEach(([name, setting]) => {
      this.addSetting(name, setting);
    });
  }

  /**
   * Draw all current measurements in the scene.
   */
  drawMeasurements() {
    const measurements = this.settings.measurements || {};

    Object.entries(measurements).forEach(([name, setting]) => {
      this.drawMeasurement(name, setting);
    });
  }

  /**
   * Draw a single measurement based on the number of atoms.
   * @param {string} name - Name of the measurement.
   * @param {Object} setting - Measurement settings, including indices, color, fontSize.
   */
  drawMeasurement(name, setting) {
    // remove old measurement if it exists
    const indices = setting.indices;
    if (indices.length === 1) this.showPosition(name, indices, setting);
    else if (indices.length === 2) this.showDistance(name, indices, setting);
    else if (indices.length === 3) this.showAngle(name, indices, setting);
    else if (indices.length === 4)
      this.showDihedralAngle(name, indices, setting);

    this.viewer.requestRedraw?.("render");
  }

  /**
   * Remove a single measurement (lines + labels) from the scene.
   */
  removeMeasurement(name) {
    const objects = this.meshes[name];
    if (!objects) return;

    objects.forEach((obj) => {
      // try removing from textManager; if fails, remove from scene
      try {
        this.textManager.removeLabel(obj);
      } catch {
        this.scene.remove(obj);
      }
    });

    delete this.meshes[name];
  }

  /**
   * Display a single atom's position as a label using the textManager.
   * @param {string} name - Measurement name.
   * @param {number[]} indices - Atom indices (length 1).
   * @param {Object} setting - Measurement style settings.
   */
  showPosition(name, indices, setting) {
    const color = setting.color || this.settings.color;
    const fontSize = setting.fontSize || this.settings.fontSize;

    const atomIndex = indices[0];
    const positionArray = getPosition(this.viewer.atoms.positions[atomIndex]);

    const symbol = this.viewer.atoms.symbols[atomIndex];
    const text = `${symbol} [${positionArray.map((v) => v.toFixed(3)).join(", ")}]`;

    // Shift the label slightly in x for visibility
    const shiftedPosition = [
      positionArray[0] + 0.5,
      positionArray[1],
      positionArray[2],
    ];

    // Use textManager to render and manage the label
    const label = this.textManager.addLabel({
      position: shiftedPosition,
      text,
      color,
      fontSize,
    });

    // Store the label for future removal
    this.meshes[name] = [label];
  }

  /**
   * Display the distance between two atoms using textManager.
   * @param {string} name - Measurement name.
   * @param {number[]} indices - Atom indices (length 2).
   * @param {Object} setting - Measurement style settings.
   */
  showDistance(name, indices, setting) {
    const color = setting.color || this.settings.color;
    const fontSize = setting.fontSize || this.settings.fontSize;

    // Get atom positions as plain arrays
    const posA = getPosition(this.viewer.atoms.positions[indices[0]]);
    const posB = getPosition(this.viewer.atoms.positions[indices[1]]);

    const midpoint = [
      (posA[0] + posB[0]) / 2,
      (posA[1] + posB[1]) / 2,
      (posA[2] + posB[2]) / 2,
    ];

    const distance = getDistance(posA, posB);
    const lineShape = this.shapeRegistry.create("Line", {
      start: posA,
      end: posB,
      color: 0x0000ff,
      lineWidth: 1,
    });

    this.scene.add(lineShape);

    const label = this.textManager.addLabel({
      position: midpoint,
      text: distance.toFixed(3),
      color,
      fontSize,
    });

    this.meshes[name] = [lineShape, label];
  }

  /**
   * Display the angle between three atoms.
   * @param {string} name - Measurement name.
   * @param {number[]} indices - Atom indices (length 3).
   * @param {Object} setting - Measurement style settings.
   */
  showAngle(name, indices, setting) {
    const color = setting.color || this.settings.color;
    const fontSize = setting.fontSize || this.settings.fontSize;

    // get positions as plain arrays

    const posA = getPosition(this.viewer.atoms.positions[indices[0]]);
    const posB = getPosition(this.viewer.atoms.positions[indices[1]]);
    const posC = getPosition(this.viewer.atoms.positions[indices[2]]);

    const angle = getAngle(posA, posB, posC);

    const line1 = this.shapeRegistry.create("Line", {
      start: posA,
      end: posB,
      color: 0x0000ff,
      lineWidth: 1,
    });
    const line2 = this.shapeRegistry.create("Line", {
      start: posB,
      end: posC,
      color: 0x0000ff,
      lineWidth: 1,
    });

    this.scene.add(line1);
    this.scene.add(line2);

    const midVec = [
      posB[0] + (posA[0] - posB[0] + posC[0] - posB[0]) * 0.2,
      posB[1] + (posA[1] - posB[1] + posC[1] - posB[1]) * 0.2,
      posB[2] + (posA[2] - posB[2] + posC[2] - posB[2]) * 0.2,
    ];

    const label = this.textManager.addLabel({
      position: midVec,
      text: angle.toFixed(3),
      color,
      fontSize,
    });
    this.meshes[name] = [line1, line2, label];
  }

  /**
   * Display the dihedral angle between four atoms.
   * @param {string} name - Measurement name.
   * @param {number[]} indices - Atom indices (length 4).
   * @param {Object} setting - Measurement style settings.
   */
  showDihedralAngle(name, indices, setting) {
    const color = setting.color || this.settings.color;
    const fontSize = setting.fontSize || this.settings.fontSize;

    // get positions
    const posA = getPosition(this.viewer.atoms.positions[indices[0]]);
    const posB = getPosition(this.viewer.atoms.positions[indices[1]]);
    const posC = getPosition(this.viewer.atoms.positions[indices[2]]);
    const posD = getPosition(this.viewer.atoms.positions[indices[3]]);

    const angle = getDihedral(posA, posB, posC, posD);

    // create connecting lines using shapeRegistry
    const line1 = this.shapeRegistry.create("Line", {
      start: posA,
      end: posB,
      color: 0x0000ff,
    });
    const line2 = this.shapeRegistry.create("Line", {
      start: posB,
      end: posC,
      color: 0x0000ff,
    });
    const line3 = this.shapeRegistry.create("Line", {
      start: posC,
      end: posD,
      color: 0x0000ff,
    });

    this.scene.add(line1);
    this.scene.add(line2);
    this.scene.add(line3);

    // compute label position (rough midpoint + offset)
    const midVec = [
      (posB[0] + posC[0]) * 0.3 - 0.3,
      (posB[1] + posC[1]) * 0.3 - 0.3,
      (posB[2] + posC[2]) * 0.3 - 0.3,
    ];

    // create label via textManager
    const label = this.textManager.addLabel({
      position: midVec,
      text: angle.toFixed(3),
      color,
      fontSize,
    });

    // store all objects for removal later
    this.meshes[name] = [line1, line2, line3, label];
  }

  /**
   * Remove all measurement meshes from the scene.
   */
  clearMeshes() {
    Object.keys(this.meshes).forEach((name) => this.removeMeasurement(name));
  }

  /**
   * Add a measurement entry to the internal settings.
   * @param {string} name - Measurement name.
   * @param {Object} setting - Measurement settings (indices, color, fontSize).
   */
  addSetting(name, { indices = [], color, fontSize }) {
    this.settings.measurements[name] = {
      indices,
      color: color || this.settings.color,
      fontSize: fontSize || this.settings.fontSize,
    };
  }

  /**
   * Return a plain object representation of current measurements.
   * @returns {Object} Measurements keyed by name.
   */
  toPlainSettings() {
    return { ...this.settings.measurements };
  }

  /**
   * Handle changes from viewer state subscription.
   * @param {Object} next - New state to merge with defaults.
   */
  _onStateChange(next) {
    this.settings = merge({}, DEFAULT_MEASUREMENT_SETTINGS, next);
    this._rebuild();
  }

  /**
   * Rebuild all measurements in the scene.
   * Clears previous meshes and redraws.
   */
  _rebuild() {
    this.clearMeshes();
    this.drawMeasurements();
    this.viewer.requestRedraw?.("render");
  }
}
