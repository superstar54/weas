import * as THREE from "three";
import { clearObject, createLabel } from "../../utils.js";
import { cloneValue } from "../../state/store.js";

class Setting {
  constructor({ indices = [], color = "black", fontSize = 16 }) {
    /* A class to store label settings.
    indices: the indices of the atoms to measure
      no atoms: clear the previous measurements
      single atom: xyz position and atomic symbol
      two atoms: interatomic distance
      three atoms: the angle between bonds 12 and 23
      four atoms: the dihedral angle between bonds 12 and 34
    */

    this.indices = indices;
    this.color = color;
    this.fontSize = fontSize;
  }

  toDict() {
    return {
      indices: this.indices,
      color: this.color,
      fontSize: this.fontSize,
    };
  }
}

export class Measurement {
  constructor(viewer) {
    this.viewer = viewer;
    this.scene = this.viewer.tjs.scene;
    this.settings = {};
    this.meshes = {};

    const pluginState = this.viewer.state.get("plugins.measurement");
    if (pluginState && pluginState.settings) {
      this.applySettings(pluginState.settings);
      this.drawMeasurements();
    }
    this.viewer.state.subscribe("plugins.measurement", (next) => {
      if (!next) {
        return;
      }
      if (this.viewer._initializingState) {
        return;
      }
      if (!next.settings) {
        this.reset();
        return;
      }
      this.applySettings(next.settings);
      this.drawMeasurements();
    });
  }

  reset() {
    /* Reset the measurements */
    this.clearMeshes();
    this.settings = {};
    this.viewer.requestRedraw?.("render");
  }

  measure(indices = null) {
    /* Measures the distance, angle, or dihedral angle between atoms.*/
    const selection = Array.isArray(indices) ? indices : [];
    if (selection.length === 0) {
      this.viewer.state.set({ plugins: { measurement: { settings: null } } });
    } else {
      const settings = { ...(this.viewer.state.get("plugins.measurement")?.settings || {}) };
      const name = `measurement-${Object.keys(settings).length}`;
      const setting = new Setting({ indices: selection });
      settings[name] = setting.toDict();
      this.viewer.state.set({ plugins: { measurement: { settings } } });
    }
  }

  setSettings(settings) {
    this.viewer.state.set({ plugins: { measurement: { settings: cloneValue(settings) } } });
  }

  applySettings(settings) {
    /* Set measurement settings */
    this.settings = {};
    this.clearMeshes();
    Object.entries(settings).forEach(([name, setting]) => {
      this.addSetting(name, setting);
    });
  }

  drawMeasurements() {
    this.clearMeshes();
    Object.entries(this.settings).forEach(([name, setting]) => {
      this.drawMeasurement(name, setting);
    });
  }

  drawMeasurement(name, setting) {
    /* Draw the measurements */
    const indices = setting.indices;
    if (indices.length === 1) {
      this.showPosition(name, indices);
    } else if (indices.length === 2) {
      this.showDistance(name, indices);
    } else if (indices.length === 3) {
      this.showAngle(name, indices);
    } else if (indices.length === 4) {
      this.showDihedralAngle(name, indices);
    } else {
    }
    // call the render function to update the scene
    this.viewer.requestRedraw?.("render");
  }

  showPosition(name, indices) {
    const atomIndex = indices[0];
    const position = this.viewer.atoms.positions[atomIndex];
    const symbol = this.viewer.atoms.symbols[atomIndex];
    // Construct and return the formatted string
    const text = `${symbol} [${position[0].toFixed(3)}, ${position[1].toFixed(3)}, ${position[2].toFixed(3)}]`;
    // lable shift by 1.0 in x direction
    const label = createLabel(new THREE.Vector3(...position).add(new THREE.Vector3(1, 0, 0)), text, "black", "18px");
    this.scene.add(label);
    this.meshes[name] = [label];
  }
  showDistance(name, indices) {
    const position1 = new THREE.Vector3(...this.viewer.atoms.positions[indices[0]]);
    const position2 = new THREE.Vector3(...this.viewer.atoms.positions[indices[1]]);
    const distance = position1.distanceTo(position2);
    const points = [position1, position2];
    // create a line between the two atoms, and display the distance
    const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.LineSegments(geometry, material);
    this.scene.add(line);
    // add distance to the line
    const label = createLabel(position1.add(position2).multiplyScalar(0.5), distance.toFixed(3), "black", "18px");
    this.scene.add(label);
    this.meshes[name] = [line, label];
  }
  showAngle(name, indices) {
    const position1 = new THREE.Vector3(...this.viewer.atoms.positions[indices[0]]);
    const position2 = new THREE.Vector3(...this.viewer.atoms.positions[indices[1]]);
    const position3 = new THREE.Vector3(...this.viewer.atoms.positions[indices[2]]);
    const vector1 = position1.clone().sub(position2).normalize();
    const vector2 = position3.clone().sub(position2).normalize();
    const angle = (vector1.angleTo(vector2) * 180) / Math.PI;
    // create a line between the two atoms, and display the distance
    const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
    const geometry = new THREE.BufferGeometry().setFromPoints([position1, position2]);
    const line1 = new THREE.LineSegments(geometry, material);
    this.scene.add(line1);
    const geometry2 = new THREE.BufferGeometry().setFromPoints([position2, position3]);
    const line2 = new THREE.LineSegments(geometry2, material);
    this.scene.add(line2);
    // add angle to the angle
    const position = position2.add(vector1.add(vector2).multiplyScalar(0.3));
    const label = createLabel(position, angle.toFixed(3), "black", "18px");
    this.scene.add(label);
    this.meshes[name] = [line1, line2, label];
  }
  showDihedralAngle(name, indices) {
    const position1 = new THREE.Vector3(...this.viewer.atoms.positions[indices[0]]);
    const position2 = new THREE.Vector3(...this.viewer.atoms.positions[indices[1]]);
    const position3 = new THREE.Vector3(...this.viewer.atoms.positions[indices[2]]);
    const position4 = new THREE.Vector3(...this.viewer.atoms.positions[indices[3]]);
    const vector1 = position1.clone().sub(position2).normalize();
    const vector2 = position3.clone().sub(position2).normalize();
    const vector3 = position4.clone().sub(position3).normalize();
    const normal1 = vector1.clone().cross(vector2).normalize();
    const normal2 = vector2.clone().cross(vector3).normalize();
    const angle = Math.acos(normal1.dot(normal2));
    // create mesh with two planes and display the angle
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    vertices.push(position1.x, position1.y, position1.z);
    vertices.push(position2.x, position2.y, position2.z);
    vertices.push(position3.x, position3.y, position3.z);
    vertices.push(position2.x, position2.y, position2.z);
    vertices.push(position3.x, position3.y, position3.z);
    vertices.push(position4.x, position4.y, position4.z);
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex([0, 1, 2, 3, 4, 5]);
    const material = new THREE.MeshBasicMaterial({
      color: 0x0000ff,
      opacity: 0.9,
      side: THREE.DoubleSide, // Render both sides
      transparent: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);
    const position = position2.add(position3).multiplyScalar(0.3).sub(normal1.add(normal2).multiplyScalar(0.3));
    const label = createLabel(position, angle.toFixed(3), "black", "18px");
    this.scene.add(label);
    this.meshes[name] = [mesh, label];
  }

  clearMeshes() {
    Object.entries(this.meshes).forEach(([name, data]) => {
      data.forEach((mesh) => {
        this.scene.remove(mesh);
      });
    });
    this.meshes = {};
  }

  addSetting(name, { indices = [], color = "black", fontSize = 16 }) {
    this.settings[name] = new Setting({ indices, color, fontSize });
  }

  toPlainSettings() {
    const result = {};
    Object.entries(this.settings).forEach(([name, setting]) => {
      result[name] = setting instanceof Setting ? { indices: setting.indices, color: setting.color, fontSize: setting.fontSize } : setting;
    });
    return result;
  }
}
