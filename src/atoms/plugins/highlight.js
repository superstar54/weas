import * as THREE from "three";
import { convertColor, drawAtoms } from "../utils.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js"; // Import BufferGeometryUtils
import { cloneValue } from "../../state/store.js";

class Setting {
  constructor({ indices, scale = 1.1, type = "sphere", color = "yellow", opacity = 0.6 }) {
    // type: sphere, box, cross
    this.indices = indices;
    this.color = convertColor(color);
    this.scale = scale;
    this.type = type;
    this.opacity = opacity;
  }

  toDict() {
    return {
      indices: this.indices,
      color: this.color,
      scale: this.scale,
      type: this.type,
      opacity: this.opacity,
    };
  }
}

export class HighlightManager {
  constructor(viewer) {
    this.viewer = viewer;
    this.scene = this.viewer.tjs.scene;
    this.settings = {};
    this.meshes = {};
    this.labels = {};
    this.init();

    const pluginState = this.viewer.state.get("plugins.highlight");
    if (pluginState && pluginState.settings) {
      this.applySettings(pluginState.settings);
      this.drawHighlightAtoms();
    }
    this.viewer.state.subscribe("plugins.highlight", (next) => {
      if (!next || !next.settings) {
        return;
      }
      this.applySettings(next.settings);
      if (this.viewer._initializingState) {
        return;
      }
      this.drawHighlightAtoms();
    });
  }

  init() {
    /* Initialize the specie settings from the viewer.atoms */
    this.viewer.logger.debug("init highlight settings");
    this.settings = {
      selection: new Setting({ indices: [], scale: 1.1, color: "#ffff00" }),
    };
  }

  setSettings(settings) {
    this.viewer.state.set({ plugins: { highlight: { settings: cloneValue(settings) } } });
  }

  applySettings(settings) {
    /* Set the highlight settings */
    this.settings = {};
    this.clearMeshes();
    this.clearLabels();
    // Loop over settings to add each setting
    Object.entries(settings).forEach(([name, setting]) => {
      this.addSetting(name, setting);
    });
  }

  addSetting(name, { indices, scale = 1.1, type = "sphere", color = "#3d82ed", opacity = 0.6 }) {
    /* Add a new setting to the highlights */
    const setting = new Setting({ indices, scale, type, color, opacity });
    this.settings[name] = setting;
  }

  toPlainSettings() {
    const result = {};
    Object.entries(this.settings).forEach(([name, setting]) => {
      result[name] = setting && typeof setting.toDict === "function" ? setting.toDict() : setting;
    });
    return result;
  }

  clearMeshes() {
    /* Remove highlight meshes from the scene */
    Object.values(this.meshes).forEach((mesh) => {
      if (mesh.parent) {
        mesh.parent.remove(mesh);
      }
    });
    this.meshes = {};
  }

  clearLabels() {
    Object.values(this.labels).forEach((labels) => {
      labels.forEach((label) => {
        if (label.parent) {
          label.parent.remove(label);
        }
        label.remove();
      });
    });
    this.labels = {};
  }

  drawHighlightAtoms() {
    this.clearMeshes();
    this.clearLabels();
    const baseMesh = this.viewer.atomManager.meshes["atom"];
    if (!baseMesh) {
      return;
    }
    const material = new THREE.MeshBasicMaterial({
      color: "yellow",
      opacity: 0.6,
      transparent: true,
    });
    // sphere
    const geometry = new THREE.SphereGeometry(1, 16, 16);
    this.drawHighlightMesh("sphere", geometry, material);
    //box
    const material1 = material.clone();
    material1.color = "green";
    const boxGeometry = new THREE.BoxGeometry(2, 2, 2);
    this.drawHighlightMesh("box", boxGeometry, material1);
    // cross
    const material2 = material.clone();
    material2.color = "black";
    material2.opacity = 1.0;
    const crossGeometry = this.createCrossGeometry(1);
    this.drawHighlightMesh("cross", crossGeometry, material2);
    Object.entries(this.settings).forEach(([name, setting]) => {
      if (setting.type === "cross2d") {
        this.updateHighlightAtomsMesh(setting, name);
      }
    });
    this.viewer.requestRedraw?.("render");
  }

  drawHighlightMesh(name, geometry, material) {
    /* Draw the highlight mesh based on the setting type */
    const baseMesh = this.viewer.atomManager.meshes["atom"];
    if (!baseMesh) {
      return;
    }

    const mesh = new THREE.InstancedMesh(geometry, material, baseMesh.count);

    const position = new THREE.Vector3();
    const rotation = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    const matrix = new THREE.Matrix4();
    const instanceMatrix = new THREE.Matrix4();

    for (let i = 0; i < baseMesh.count; i++) {
      baseMesh.getMatrixAt(i, matrix);
      matrix.decompose(position, rotation, scale);
      scale.multiplyScalar(0);
      instanceMatrix.compose(position, rotation, scale);
      mesh.setMatrixAt(i, instanceMatrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    // Add mesh to the scene
    baseMesh.add(mesh);
    mesh.layers.set(1); // Set the layer to 1 to make it not selectable
    this.meshes[name] = mesh;
    Object.values(this.settings).forEach((setting) => {
      this.updateHighlightAtomsMesh(setting);
    });
  }

  createCrossGeometry(size = 1) {
    /* Create a cross geometry for the highlight */
    const geometry1 = new THREE.TorusGeometry(size, 0.1, 16, 20);
    const geometry2 = new THREE.TorusGeometry(size, 0.1, 16, 20);
    // rotate the second torus
    geometry2.rotateX(Math.PI / 2);
    const geometry3 = new THREE.TorusGeometry(size, 0.1, 16, 20);
    geometry3.rotateY(Math.PI / 2);
    // Merge the two geometries
    const crossGeometry = mergeGeometries([geometry1, geometry2, geometry3]);

    return crossGeometry;
  }

  updateHighlightAtomsMesh({ indices = [], scale = 1.1, color = "yellow", type = "sphere", opacity = null }, name = null) {
    /* When the atom is moved, the boundary atoms should be moved as well.
     */
    if (type === "cross2d") {
      this.updateCross2DLabels(indices, color, name);
      return;
    }
    if (this.viewer.atoms.symbols.length > 0 && this.meshes[type]) {
      if (opacity !== null && opacity !== undefined) {
        const material = this.meshes[type].material;
        if (material) {
          material.transparent = true;
          material.opacity = opacity;
          material.needsUpdate = true;
        }
      }
      const position = new THREE.Vector3();
      const rotation = new THREE.Quaternion();
      const scaleVector = new THREE.Vector3();
      indices.forEach((index) => {
        // Update the atom position
        const matrix = new THREE.Matrix4();
        this.viewer.atomManager.meshes["atom"].getMatrixAt(index, matrix);
        // Decompose the original matrix into its components
        matrix.decompose(position, rotation, scaleVector);
        scaleVector.multiplyScalar(scale);
        // Recompose the matrix with the new scale
        matrix.compose(position, rotation, scaleVector);
        this.meshes[type].setMatrixAt(index, matrix);
        this.meshes[type].setColorAt(index, convertColor(color));
      });
      this.meshes[type].instanceMatrix.needsUpdate = true;
    }
  }

  updateCross2DLabels(indices = [], color = "black", name = null) {
    const key = name || "cross2d";
    const existing = this.labels[key] || [];
    existing.forEach((label) => {
      if (label.parent) {
        label.parent.remove(label);
      }
      label.remove();
    });
    this.labels[key] = [];
    if (!indices || indices.length === 0) {
      return;
    }
    const createLabel = this.viewer.weas?.textManager?.createTextLabel?.bind(this.viewer.weas.textManager);
    if (!createLabel) {
      return;
    }
    indices.forEach((index) => {
      const position = this.viewer.atoms.positions[index];
      if (!position) {
        return;
      }
      const labelData = createLabel(new THREE.Vector3(...position), "+", color, "14px", "text-label text-label-cross", "shape");
      const label = labelData && labelData.label ? labelData.label : labelData;
      label.userData.atomIndex = index;
      this.scene.add(label);
      this.labels[key].push(label);
    });
  }

  updateLabelSizes(camera = null, renderer = null) {
    const activeCamera = camera || this.viewer?.tjs?.camera;
    const activeRenderer = renderer || this.viewer?.tjs?.renderers?.MainRenderer?.renderer;
    if (!activeCamera || !activeRenderer) {
      return;
    }
    const size = activeRenderer.getSize(new THREE.Vector2());
    const right = new THREE.Vector3();
    const up = new THREE.Vector3();
    const forward = new THREE.Vector3();
    activeCamera.matrixWorld.extractBasis(right, up, forward);
    Object.values(this.labels).forEach((labels) => {
      labels.forEach((label) => {
        const atomIndex = label.userData?.atomIndex;
        if (atomIndex === null || atomIndex === undefined) {
          return;
        }
        const radius = this.getAtomRadius(atomIndex);
        if (!radius || radius <= 0) {
          return;
        }
        const position = this.viewer.atoms.positions[atomIndex];
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
        if (label.element) {
          label.element.style.setProperty("--cross-size", `${diameterPx}px`);
          label.element.style.fontSize = `${diameterPx}px`;
        }
      });
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
