import * as THREE from "three";
import { convertColor } from "../utils.js";
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
    this.settings = {};
    this.meshes = {};
    this._tmpCenter = new THREE.Vector3();
    this._tmpBillboardScale = new THREE.Vector3();
    this._tmpBillboardScale2 = new THREE.Vector3();
    this._tmpBillboardMatrix = new THREE.Matrix4();
    this._tmpBillboardQuat = new THREE.Quaternion();
    this._tmpBillboardZero = new THREE.Vector3(0, 0, 0);
    this._tmpBillboardAtomMatrix = new THREE.Matrix4();
    this._tmpDecomposeQuat = new THREE.Quaternion();
    this._tmpCameraDir = new THREE.Vector3();
    this._tmpCameraPos = new THREE.Vector3();
    this._tmpToCameraDir = new THREE.Vector3();
    this._crossViewThicknessDefault = 0.05;
    this._crossViewSettings = {};
    this._crossViewIndices = new Set();
    this._crossViewNeedsUpdate = false;
    this._cameraSignature = new Float32Array(32);
    this._hasCameraSignature = false;
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
    this._crossViewSettings = {};
    this._crossViewIndices = new Set();
    this._crossViewNeedsUpdate = false;
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

  drawHighlightAtoms() {
    this.clearMeshes();
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
    const material3 = material2.clone();
    material3.side = THREE.DoubleSide;
    material3.depthWrite = false;
    const crossViewGeometryX = this.createCrossBillboardBarGeometry();
    const crossViewGeometryY = crossViewGeometryX.clone();
    crossViewGeometryY.rotateZ(Math.PI / 2);
    this.drawHighlightMesh("crossViewX", crossViewGeometryX, material3);
    this.drawHighlightMesh("crossViewY", crossViewGeometryY, material3);
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

  createCrossBillboardBarGeometry() {
    return new THREE.PlaneGeometry(2, 1);
  }

  updateHighlightAtomsMesh({ indices = [], scale = 1.1, color = "yellow", type = "sphere", opacity = null, occlude = true, offset = 1.0005, thickness = null }, name = null) {
    /* When the atom is moved, the boundary atoms should be moved as well.
     */
    if (type === "crossView") {
      const key = name || "crossView";
      this._crossViewSettings[key] = { indices, scale, color, occlude, offset, thickness };
      this.updateCrossViewMaterialOcclusion();
      this._crossViewNeedsUpdate = true;
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

  updateLabelSizes(camera = null, renderer = null) {
    const activeCamera = camera || this.viewer?.tjs?.camera;
    const activeRenderer = renderer || this.viewer?.tjs?.renderers?.MainRenderer?.renderer;
    if (!activeCamera || !activeRenderer) {
      return;
    }
    activeCamera.updateMatrixWorld(true);
    const atomMesh = this.viewer.atomManager?.meshes?.["atom"];
    if (atomMesh && typeof atomMesh.updateMatrixWorld === "function") {
      atomMesh.updateMatrixWorld(true);
    }
    const cameraChanged = this._cameraChanged(activeCamera);
    if (this._crossViewNeedsUpdate || cameraChanged) {
      this.updateCrossViewInstances(activeCamera);
      this._crossViewNeedsUpdate = false;
    }
  }

  updateCrossViewInstances(camera) {
    const meshX = this.meshes["crossViewX"];
    const meshY = this.meshes["crossViewY"];
    const atomMesh = this.viewer.atomManager?.meshes?.["atom"];
    if (!meshX || !meshY || !atomMesh || !camera) {
      return;
    }
    camera.getWorldQuaternion(this._tmpBillboardQuat);
    camera.getWorldDirection(this._tmpCameraDir);
    camera.getWorldPosition(this._tmpCameraPos);
    const nextIndices = new Set();
    Object.values(this._crossViewSettings).forEach((setting) => {
      const { indices = [], scale = 1.1, color = "yellow", offset = 1.0005, thickness = null } = setting || {};
      const thicknessWorld = Number.isFinite(thickness) ? thickness : this._crossViewThicknessDefault;
      indices.forEach((index) => {
        nextIndices.add(index);
        atomMesh.getMatrixAt(index, this._tmpBillboardAtomMatrix);
        this._tmpBillboardAtomMatrix.decompose(this._tmpCenter, this._tmpDecomposeQuat, this._tmpBillboardScale);
        const radius = this._tmpBillboardScale.x || this._tmpBillboardScale.y || this._tmpBillboardScale.z || 1;
        this._tmpBillboardScale.set(radius * scale, thicknessWorld, 1);
        this._tmpBillboardScale2.set(thicknessWorld, radius * scale, 1);
        if (camera.isOrthographicCamera) {
          this._tmpCenter.addScaledVector(this._tmpCameraDir, -radius * offset);
        } else {
          this._tmpToCameraDir.copy(this._tmpCenter).sub(this._tmpCameraPos).normalize();
          this._tmpCenter.addScaledVector(this._tmpToCameraDir, -radius * offset);
        }
        this._tmpBillboardMatrix.compose(this._tmpCenter, this._tmpBillboardQuat, this._tmpBillboardScale);
        meshX.setMatrixAt(index, this._tmpBillboardMatrix);
        meshX.setColorAt(index, convertColor(color));
        this._tmpBillboardMatrix.compose(this._tmpCenter, this._tmpBillboardQuat, this._tmpBillboardScale2);
        meshY.setMatrixAt(index, this._tmpBillboardMatrix);
        meshY.setColorAt(index, convertColor(color));
      });
    });
    this._crossViewIndices.forEach((index) => {
      if (!nextIndices.has(index)) {
        atomMesh.getMatrixAt(index, this._tmpBillboardAtomMatrix);
        this._tmpBillboardAtomMatrix.decompose(this._tmpCenter, this._tmpDecomposeQuat, this._tmpBillboardScale);
        this._tmpBillboardMatrix.compose(this._tmpCenter, this._tmpBillboardQuat, this._tmpBillboardZero);
        meshX.setMatrixAt(index, this._tmpBillboardMatrix);
        meshY.setMatrixAt(index, this._tmpBillboardMatrix);
      }
    });
    this._crossViewIndices = nextIndices;
    meshX.instanceMatrix.needsUpdate = true;
    meshY.instanceMatrix.needsUpdate = true;
    if (meshX.instanceColor) {
      meshX.instanceColor.needsUpdate = true;
    }
    if (meshY.instanceColor) {
      meshY.instanceColor.needsUpdate = true;
    }
  }

  updateCrossViewMaterialOcclusion() {
    const meshX = this.meshes["crossViewX"];
    const meshY = this.meshes["crossViewY"];
    if (!meshX || !meshX.material || !meshY || !meshY.material) {
      return;
    }
    const anyOcclude = Object.values(this._crossViewSettings).some((setting) => setting?.occlude !== false);
    meshX.material.depthTest = anyOcclude;
    meshY.material.depthTest = anyOcclude;
    meshX.material.needsUpdate = true;
    meshY.material.needsUpdate = true;
  }

  _cameraChanged(camera) {
    const elements = camera.matrixWorld.elements;
    const proj = camera.projectionMatrix.elements;
    let changed = false;
    for (let i = 0; i < 16; i++) {
      const value = elements[i];
      if (!this._hasCameraSignature || Math.abs(this._cameraSignature[i] - value) > 1e-6) {
        changed = true;
      }
      this._cameraSignature[i] = value;
    }
    for (let i = 0; i < 16; i++) {
      const value = proj[i];
      const idx = 16 + i;
      if (!this._hasCameraSignature || Math.abs(this._cameraSignature[idx] - value) > 1e-6) {
        changed = true;
      }
      this._cameraSignature[idx] = value;
    }
    this._hasCameraSignature = true;
    return changed;
  }
}
