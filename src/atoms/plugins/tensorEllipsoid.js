import * as THREE from "three";
import { clearObject, calculateCartesianCoordinates } from "../../utils.js";
import { materials } from "../../tools/materials.js";
import { convertColor } from "../utils.js";
import { cloneValue } from "../../state/store.js";

/**
 * Normalized tensor-ellipsoid settings used by {@link TensorEllipsoid}.
 *
 * A tensor ellipsoid is the geometric representation of a symmetric rank-2
 * tensor after diagonalization into principal values and principal axes.
 * WEAS expects that diagonalization to be done upstream: each site must supply
 * three eigenvalues and three matching orthonormal eigenvectors.
 *
 * The rendered semi-axis lengths are
 * |eigenvalue_i| * scale in absolute mode, or normalized by the largest
 * |eigenvalue| in the setting before applying scale in normalized mode,
 * then clamped by minRadius.
 * This means the ellipsoid shows anisotropy magnitude and orientation, but not
 * the sign of a principal value by itself. If your workflow depends on sign
 * conventions, encode that in preprocessing or styling around the ellipsoid.
 */
class TensorEllipsoidSetting {
  constructor({
    trajectory = false,
    origins = "positions",
    eigenvalues = [],
    eigenvectors = [],
    selection = null,
    scale = 1,
    scaleMode = "setNormalized",
    color = "#4f81ff",
    opacity = 0.35,
    resolution = 24,
    minRadius = 0.05,
    visible = true,
    coordinateSystem = "cartesian",
    renderMode = "solid",
    showPrincipalAxes = false,
    principalAxisColors = ["#ff0000", "#00ff00", "#0000ff"],
    principalAxisLength = 1.0,
    principalAxisRadius = 0.02,
  }) {
    this.trajectory = trajectory;
    this.origins = origins;
    this.eigenvalues = eigenvalues;
    this.eigenvectors = eigenvectors;
    this.selection = selection;
    this.scale = scale;
    this.scaleMode = scaleMode;
    this.color = convertColor(color);
    this.opacity = opacity;
    this.resolution = resolution;
    this.minRadius = minRadius;
    this.visible = visible;
    this.coordinateSystem = coordinateSystem;
    this.renderMode = renderMode;
    this.showPrincipalAxes = showPrincipalAxes;
    this.principalAxisColors = principalAxisColors.map(c => convertColor(c));
    this.principalAxisLength = principalAxisLength;
    this.principalAxisRadius = principalAxisRadius;
  }
}

function colorToHex(color) {
  if (color instanceof THREE.Color) {
    return "#" + color.getHexString();
  }
  return color;
}

/**
 * Draw ellipsoids that represent per-site symmetric tensors.
 *
 * Typical scientific uses include:
 * - magnetic shielding tensors in NMR,
 * - electric field gradient tensors for quadrupolar nuclei,
 * - atomic or molecular polarizability tensors.
 *
 * Data requirements and assumptions:
 * - eigenvalues must be shaped as [nSites][3] or [nFrames][nSites][3] when
 *   trajectory is enabled.
 * - eigenvectors must be shaped as [nSites][3][3] or
 *   [nFrames][nSites][3][3], with principal-axis vectors stored as the
 *   columns of each 3x3 matrix and paired to the eigenvalues.
 * - origins can be literal positions or an atom attribute name.
 * - coordinateSystem only affects origins; eigenvectors are interpreted in the
 *   viewer's Cartesian frame.
 * - if the supplied eigenvector triad is left-handed, the third vector is
 *   flipped to build a proper rotation matrix.
 * - scaleMode can use raw principal values ("absolute") or normalize against
 *   the largest absolute principal value in the current setting
 *   ("setNormalized").
 *
 * Example:
 * const manager = editor.avr.tensorEllipsoidManager;
 * manager.addSetting("shielding", {
 *   origins: "positions",
 *   eigenvalues: shieldingEigenvalues,
 *   eigenvectors: shieldingEigenvectors,
 *   scaleMode: "setNormalized",
 *   scale: 1.2,
 *   color: "#ff6b35",
 *   showPrincipalAxes: true,
 * });
 * manager.drawTensorEllipsoids();
 */
export class TensorEllipsoid {
  constructor(viewer) {
    this.viewer = viewer;
    this.scene = this.viewer.tjs.scene;
    this._show = true;
    this.settings = {};
    this.meshes = {};
    this.guiFolder = null;
    // When true, the state subscription skips applySettings (GUI rebuild) and
    // only redraws. Set while a GUI onChange/onFinishChange is routing a change
    // through the operation system to avoid destroying the live GUI folder.
    this._suppressGuiRebuild = false;
    // True only while applySettings is iterating, so addSetting skips the
    // state-store sync (the store is already correct in that code path).
    this._isApplyingSettings = false;
    this.init();

    const pluginState = this.viewer.state.get("plugins.tensorEllipsoid");
    if (pluginState) {
      if (pluginState.settings) {
        this.applySettings(pluginState.settings);
      }
      if (pluginState.show !== undefined) {
        this.show = pluginState.show;
      }
    }

    this.viewer.state.subscribe("plugins.tensorEllipsoid", (next) => {
      if (!next) return;
      // Skip redraws that fire while the viewer is building its initial state
      // (mirrors the _initializingState guard used in AtomsViewer).
      if (this.viewer._initializingState) return;
      if (next.settings) {
        if (!this._suppressGuiRebuild) {
          // External change (undo/redo, importState, setSettings): rebuild the
          // GUI and settings map from the new state.
          this.applySettings(next.settings);
        }
        // Always redraw, regardless of whether the GUI was rebuilt.
        this.drawTensorEllipsoids();
      }
      if (next.show !== undefined) {
        this.show = next.show;
      }
    });
  }

  get show() {
    return this._show;
  }

  set show(value) {
    this._show = value;
    Object.values(this.meshes).forEach((data) => {
      if (data.ellipsoid) {
        data.ellipsoid.visible = value;
      }
      if (data.axes) {
        data.axes.forEach((axis) => (axis.visible = value));
      }
    });
    this.viewer.requestRedraw?.("render");
  }

  init() {
    this.clearMeshes();
    this.removeGui();
    this.viewer.logger.debug("init TensorEllipsoid");
  }

  createGui() {
    if (this.viewer.guiManager.gui && !this.guiFolder) {
      this.guiFolder = this.viewer.guiManager.gui.addFolder("Tensor Ellipsoids");
    }
  }

  removeGui() {
    if (this.guiFolder) {
      this.viewer.guiManager.gui.removeFolder(this.guiFolder);
      this.guiFolder = null;
    }
  }

  setSettings(settings) {
    this.viewer.state.set({ plugins: { tensorEllipsoid: { settings: cloneValue(settings) } } });
  }

  applySettings(settings) {
    this.settings = {};
    this.clearMeshes();
    this.removeGui();
    this.createGui();
    this._isApplyingSettings = true;
    try {
      Object.entries(settings).forEach(([name, setting]) => {
        this.addSetting(name, setting);
      });
    } finally {
      this._isApplyingSettings = false;
    }
  }

  addSetting(name, setting) {
    if (!name || typeof name !== "string") {
      throw new Error("Tensor ellipsoid setting name must be a non-empty string.");
    }
    const s = new TensorEllipsoidSetting(setting);
    this._validateSetting(s);
    this.settings[name] = s;

    // Create GUI controls for this setting
    this.createGui();
    const settingFolder = this.guiFolder.addFolder(name);
    const hexColor = colorToHex(s.color);
    const guiState = {
      visible: s.visible,
      scale: s.scale,
      scaleMode: s.scaleMode,
      opacity: s.opacity,
      renderMode: s.renderMode,
      showPrincipalAxes: s.showPrincipalAxes,
      principalAxisLength: s.principalAxisLength,
      principalAxisRadius: s.principalAxisRadius,
      color: hexColor,
    };

    // Discrete controls (boolean/dropdown): fire exactly once per interaction,
    // so we record to the undo stack immediately in onChange.
    const recordDiscreteChange = (mutate) => (value) => {
      mutate(value);
      this._recordGuiChange();
    };
    // Continuous controls (sliders, color picker): onChange fires many times
    // during a drag for smooth live preview. We only push to the undo stack in
    // onFinishChange, which fires once when the user releases.
    const livePreview = (mutate) => (value) => {
      mutate(value);
      this.drawTensorEllipsoids();
    };
    const recordContinuousChange = () => this._recordGuiChange();

    settingFolder.add(guiState, "visible").name("Visible")
      .onChange(recordDiscreteChange((v) => { s.visible = v; }));
    settingFolder.add(guiState, "scale", 0.1, 5.0, 0.1).name("Scale")
      .onChange(livePreview((v) => { s.scale = v; }))
      .onFinishChange(recordContinuousChange);
    settingFolder.add(guiState, "scaleMode", ["absolute", "setNormalized"]).name("Scale Mode")
      .onChange(recordDiscreteChange((v) => { s.scaleMode = v; }));
    settingFolder.add(guiState, "opacity", 0, 1, 0.01).name("Opacity")
      .onChange(livePreview((v) => { s.opacity = v; }))
      .onFinishChange(recordContinuousChange);
    settingFolder.add(guiState, "renderMode", ["solid", "wireframe"]).name("Render Mode")
      .onChange(recordDiscreteChange((v) => { s.renderMode = v; }));
    settingFolder.addColor(guiState, "color").name("Color")
      .onChange(livePreview((v) => { s.color = new THREE.Color(v); }))
      .onFinishChange(recordContinuousChange);
    settingFolder.add(guiState, "showPrincipalAxes").name("Show Axes")
      .onChange(recordDiscreteChange((v) => { s.showPrincipalAxes = v; }));
    settingFolder.add(guiState, "principalAxisLength", 0.1, 3.0, 0.1).name("Axis Length")
      .onChange(livePreview((v) => { s.principalAxisLength = v; }))
      .onFinishChange(recordContinuousChange);
    settingFolder.add(guiState, "principalAxisRadius", 0.001, 0.1, 0.001).name("Axis Radius")
      .onChange(livePreview((v) => { s.principalAxisRadius = v; }))
      .onFinishChange(recordContinuousChange);

    // Sync the state store so _recordGuiChange captures correct undo snapshots.
    // Skipped during applySettings, where the store is already up-to-date.
    if (!this._isApplyingSettings) {
      this._syncStateStore();
    }
  }

  // Run fn with _suppressGuiRebuild set, so the state-subscription skips
  // applySettings and only redraws. The flag is cleared even if fn throws.
  _withSuppressedRebuild(fn) {
    this._suppressGuiRebuild = true;
    try {
      fn();
    } finally {
      this._suppressGuiRebuild = false;
    }
  }

  // Sync the state store to match in-memory settings without touching the
  // undo stack. This ensures captureStatePatch reads the correct "previous"
  // value on the next _recordGuiChange call.
  _syncStateStore() {
    this._withSuppressedRebuild(() => {
      this.viewer.state.set({
        plugins: { tensorEllipsoid: { settings: this.toPlainSettings() } },
      });
    });
  }

  // Push the current settings to the undo stack via the operation system.
  _recordGuiChange() {
    this._withSuppressedRebuild(() => {
      this.viewer.weas.ops.settings.SetTensorEllipsoidSettings({ settings: this.toPlainSettings() });
    });
  }

  removeSetting(name) {
    if (this.meshes[name]) {
      if (this.meshes[name].ellipsoid) {
        clearObject(this.scene, this.meshes[name].ellipsoid);
      }
      if (this.meshes[name].axes) {
        this.meshes[name].axes.forEach((axis) => clearObject(this.scene, axis));
      }
      delete this.meshes[name];
    }
    delete this.settings[name];
    this.viewer.requestRedraw?.("render");
  }

  clearMeshes() {
    Object.values(this.meshes).forEach((data) => {
      if (data.ellipsoid) {
        clearObject(this.scene, data.ellipsoid);
      }
      if (data.axes) {
        data.axes.forEach((axis) => clearObject(this.scene, axis));
      }
    });
    this.meshes = {};
  }

  toPlainSettings() {
    const result = {};
    Object.entries(this.settings).forEach(([name, setting]) => {
      result[name] = {
        trajectory: setting.trajectory,
        origins: setting.origins,
        eigenvalues: setting.eigenvalues,
        eigenvectors: setting.eigenvectors,
        selection: setting.selection,
        scale: setting.scale,
        scaleMode: setting.scaleMode,
        color: colorToHex(setting.color),
        opacity: setting.opacity,
        resolution: setting.resolution,
        minRadius: setting.minRadius,
        visible: setting.visible,
        coordinateSystem: setting.coordinateSystem,
        renderMode: setting.renderMode,
        showPrincipalAxes: setting.showPrincipalAxes,
        principalAxisColors: setting.principalAxisColors.map(c => colorToHex(c)),
        principalAxisLength: setting.principalAxisLength,
        principalAxisRadius: setting.principalAxisRadius,
      };
    });
    return result;
  }

  dispose() {
    this.clearMeshes();
    this.removeGui();
  }

  _validateSetting(setting) {
    if (setting.selection !== null && !Array.isArray(setting.selection)) {
      throw new Error("Selection must be null or an array of integers.");
    }
    if (setting.selection !== null) {
      setting.selection.forEach((idx) => {
        if (!Number.isInteger(idx)) {
          throw new Error(`Selection index ${idx} is not an integer.`);
        }
      });
    }
    if (setting.opacity < 0 || setting.opacity > 1) {
      throw new Error("Opacity must be in [0, 1].");
    }
    if (!Number.isInteger(setting.resolution) || setting.resolution < 8) {
      throw new Error("Resolution must be an integer >= 8.");
    }
    if (setting.scale <= 0) {
      throw new Error("Scale must be > 0.");
    }
    if (setting.scaleMode !== "absolute" && setting.scaleMode !== "setNormalized") {
      throw new Error("ScaleMode must be 'absolute' or 'setNormalized'.");
    }
    if (setting.minRadius < 0) {
      throw new Error("MinRadius must be >= 0.");
    }
    if (setting.coordinateSystem !== "cartesian" && setting.coordinateSystem !== "fractional") {
      throw new Error("CoordinateSystem must be 'cartesian' or 'fractional'.");
    }
    if (setting.renderMode !== "solid" && setting.renderMode !== "wireframe") {
      throw new Error("RenderMode must be 'solid' or 'wireframe'.");
    }
    if (typeof setting.showPrincipalAxes !== "boolean") {
      throw new Error("ShowPrincipalAxes must be a boolean.");
    }
    if (!Array.isArray(setting.principalAxisColors) || setting.principalAxisColors.length !== 3) {
      throw new Error("PrincipalAxisColors must be an array of 3 colors.");
    }
    if (setting.principalAxisLength <= 0) {
      throw new Error("PrincipalAxisLength must be > 0.");
    }
    if (setting.principalAxisRadius < 0) {
      throw new Error("PrincipalAxisRadius must be >= 0.");
    }
  }

  _resolveArrayOrAttribute(value, atoms) {
    if (typeof value === "string") {
      return (atoms || this.viewer.atoms).getAttribute(value);
    }
    return value;
  }

  _resolveOrigins(setting, atoms) {
    let origins = setting.origins;
    if (typeof origins === "string") {
      if (origins === "positions") {
        origins = atoms.positions;
      } else {
        origins = atoms.getAttribute(origins);
      }
    }
    if (setting.coordinateSystem === "fractional") {
      const cell = atoms.cell;
      if (!cell || !Array.isArray(cell) || cell.length !== 3) {
        throw new Error("Fractional origins require a valid 3x3 cell.");
      }
      origins = origins.map((origin) => calculateCartesianCoordinates(cell, origin));
    }
    return origins;
  }

  _resolveTensorData(setting, frameIndex, atoms) {
    let eigenvalues = this._resolveArrayOrAttribute(setting.eigenvalues, atoms);
    let eigenvectors = this._resolveArrayOrAttribute(setting.eigenvectors, atoms);

    if (setting.trajectory) {
      // When trajectory data is passed directly, distinguish [nSites][3] from
      // [nFrames][nSites][3] without forcing callers to wrap a separate type.
      // Guard against empty arrays before probing the nested structure.
      const isNested3D =
        eigenvalues.length > 0 &&
        eigenvalues[0] != null &&
        eigenvalues[0].length > 0 &&
        Array.isArray(eigenvalues[0][0]) &&
        typeof eigenvalues[0][0][0] === "number";
      if (isNested3D) {
        // Expected trajectory shape: [nFrames][nSites][3]. Eigenvectors follow
        // the analogous [nFrames][nSites][3][3] layout.
        if (frameIndex < 0 || frameIndex >= eigenvalues.length) {
          throw new Error(`Frame index ${frameIndex} out of bounds for trajectory eigenvalues.`);
        }
        eigenvalues = eigenvalues[frameIndex];
        eigenvectors = eigenvectors[frameIndex];
      }
      // else: assume per-frame data (e.g. resolved from atoms attribute)
    }

    return { eigenvalues, eigenvectors };
  }

  _validateData({ eigenvalues, eigenvectors, origins, selection }, nSites) {
    if (!Array.isArray(eigenvalues) || eigenvalues.length !== nSites) {
      throw new Error(`Eigenvalues length (${eigenvalues?.length}) does not match number of sites (${nSites}).`);
    }
    if (!Array.isArray(eigenvectors) || eigenvectors.length !== nSites) {
      throw new Error(`Eigenvectors length (${eigenvectors?.length}) does not match number of sites (${nSites}).`);
    }
    if (!Array.isArray(origins) || origins.length !== nSites) {
      throw new Error(`Origins length (${origins?.length}) does not match number of sites (${nSites}).`);
    }

    for (let i = 0; i < nSites; i++) {
      if (!Array.isArray(eigenvalues[i]) || eigenvalues[i].length !== 3) {
        throw new Error(`Eigenvalues for site ${i} must be an array of length 3.`);
      }
      if (!Array.isArray(eigenvectors[i]) || eigenvectors[i].length !== 3) {
        throw new Error(`Eigenvectors for site ${i} must be an array of length 3.`);
      }
      for (let j = 0; j < 3; j++) {
        if (!Array.isArray(eigenvectors[i][j]) || eigenvectors[i][j].length !== 3) {
          throw new Error(`Eigenvector[${i}][${j}] must be a 3-vector.`);
        }
      }
      if (!Array.isArray(origins[i]) || origins[i].length !== 3) {
        throw new Error(`Origin for site ${i} must be an array of length 3.`);
      }
    }

    if (selection !== null) {
      selection.forEach((idx) => {
        if (!Number.isInteger(idx) || idx < 0 || idx >= nSites) {
          throw new Error(`Selection index ${idx} is out of bounds [0, ${nSites}).`);
        }
      });
    }

  }

  _getScaleNormalizer(setting, eigenvalues, indices) {
    if (setting.scaleMode === "absolute") {
      return 1;
    }

    let maxAbsEigenvalue = 0;
    indices.forEach((siteIndex) => {
      eigenvalues[siteIndex].forEach((value) => {
        maxAbsEigenvalue = Math.max(maxAbsEigenvalue, Math.abs(value));
      });
    });

    return maxAbsEigenvalue > 0 ? maxAbsEigenvalue : 1;
  }

  _computeRadii(setting, vals, normalizer = 1) {
    return vals.map((value) => Math.max(setting.minRadius, (Math.abs(value) / normalizer) * setting.scale));
  }

  /**
   * Extract and orthonormalize the three principal-axis vectors from the
   * column-major eigenvector matrix supplied by the caller.
   *
   * Returns { a1, a2, a3 } if the basis is valid, or null if any vector is
   * zero or non-finite (e.g. from a degenerate site).
   * Emits debug warnings when the input vectors are not orthogonal, or when
   * the frame is left-handed and a3 must be negated.
   */
  _buildOrthonormalBasis(vecs) {
    // Columns of the 3×3 matrix are the principal axes.
    const a1 = new THREE.Vector3(vecs[0][0], vecs[1][0], vecs[2][0]).normalize();
    const a2 = new THREE.Vector3(vecs[0][1], vecs[1][1], vecs[2][1]).normalize();
    const a3 = new THREE.Vector3(vecs[0][2], vecs[1][2], vecs[2][2]).normalize();

    const isFiniteVec = (v) => Number.isFinite(v.x) && Number.isFinite(v.y) && Number.isFinite(v.z);
    if (!isFiniteVec(a1) || !isFiniteVec(a2) || !isFiniteVec(a3) ||
        a1.lengthSq() === 0 || a2.lengthSq() === 0 || a3.lengthSq() === 0) {
      return null;
    }

    // Warn when the input axes are not mutually orthogonal — this usually
    // indicates an upstream diagonalization issue.
    const dot12 = Math.abs(a1.dot(a2));
    const dot13 = Math.abs(a1.dot(a3));
    const dot23 = Math.abs(a2.dot(a3));
    if (dot12 > 1e-4 || dot13 > 1e-4 || dot23 > 1e-4) {
      this.viewer.logger.debug(
        `TensorEllipsoid: eigenvectors are not orthogonal ` +
        `(max |dot| = ${Math.max(dot12, dot13, dot23).toFixed(5)}); ` +
        `check upstream diagonalization.`
      );
    }

    // Repair left-handed frames: negate a3 to build a proper rotation matrix.
    // Note: this changes the direction of the third principal axis — if you
    // rely on its sign (e.g. for the EFG Vzz convention) pre-correct the frame
    // before passing it to WEAS.
    if (new THREE.Vector3().crossVectors(a1, a2).dot(a3) < 0) {
      this.viewer.logger.debug(
        "TensorEllipsoid: left-handed eigenvector frame detected; a3 has been negated to build a proper rotation matrix."
      );
      a3.negate();
    }

    return { a1, a2, a3 };
  }

  _computeInstanceMatrix(setting, origin, vals, vecs, normalizer = 1) {
    const position = new THREE.Vector3(...origin);
    const [r0, r1, r2] = this._computeRadii(setting, vals, normalizer);
    const scale = new THREE.Vector3(r0, r1, r2);

    const basis3 = this._buildOrthonormalBasis(vecs);
    if (!basis3) return null;
    const { a1, a2, a3 } = basis3;

    const basis = new THREE.Matrix4();
    basis.set(
      a1.x, a2.x, a3.x, 0,
      a1.y, a2.y, a3.y, 0,
      a1.z, a2.z, a3.z, 0,
      0,    0,    0,    1
    );

    const quaternion = new THREE.Quaternion().setFromRotationMatrix(basis);
    const matrix = new THREE.Matrix4();
    matrix.compose(position, quaternion, scale);
    return matrix;
  }

  drawTensorEllipsoids() {
    this.clearMeshes();
    const atoms = this.viewer.atoms;
    const frameIndex = this.viewer.currentFrame;

    Object.entries(this.settings).forEach(([name, setting]) => {
      if (!setting.visible) {
        return;
      }
      try {
        const { eigenvalues, eigenvectors } = this._resolveTensorData(setting, frameIndex, atoms);
        const origins = this._resolveOrigins(setting, atoms);
        const nSites = atoms.getAtomsCount();
        this._validateData({ eigenvalues, eigenvectors, origins, selection: setting.selection }, nSites);

        const indices = setting.selection !== null ? setting.selection : Array.from({ length: nSites }, (_, i) => i);
        const normalizer = this._getScaleNormalizer(setting, eigenvalues, indices);
        const instanceCount = indices.length;

        const geometry = new THREE.SphereGeometry(1, setting.resolution, setting.resolution);
        const material = materials["Standard"].clone();
        material.color = setting.color;
        material.transparent = true;
        material.opacity = setting.opacity;
        // Disable depth writes only for transparent objects. Keeping depthWrite
        // enabled for near-opaque solids prevents painter's-order artifacts when
        // multiple ellipsoids overlap.
        material.depthWrite = setting.opacity >= 0.99;
        material.wireframe = setting.renderMode === "wireframe";

        const mesh = new THREE.InstancedMesh(geometry, material, instanceCount);
        mesh.visible = this.show;
        mesh.userData.type = "tensorEllipsoid";

        const axisMeshes = [];

        for (let i = 0; i < instanceCount; i++) {
          const siteIndex = indices[i];
          const matrix = this._computeInstanceMatrix(setting, origins[siteIndex], eigenvalues[siteIndex], eigenvectors[siteIndex], normalizer);
          if (matrix) {
            mesh.setMatrixAt(i, matrix);

            if (setting.showPrincipalAxes) {
              const axes = this._createPrincipalAxes(setting, origins[siteIndex], eigenvalues[siteIndex], eigenvectors[siteIndex], normalizer);
              if (axes) {
                axes.forEach((axis) => {
                  this.scene.add(axis);
                  axisMeshes.push(axis);
                });
              }
            }
          } else {
            this.viewer.logger.warn(`TensorEllipsoid setting "${name}" site ${siteIndex} has invalid eigenvectors, hiding instance.`);
            mesh.setMatrixAt(i, new THREE.Matrix4().makeScale(0, 0, 0));
          }
        }

        mesh.instanceMatrix.needsUpdate = true;
        this.scene.add(mesh);

        this.meshes[name] = {
          ellipsoid: mesh,
          geometry,
          material,
          instanceCount,
          axes: axisMeshes,
        };
      } catch (err) {
        this.viewer.logger.warn(`TensorEllipsoid setting "${name}" failed to draw: ${err.message}`);
      }
    });

    this.viewer.requestRedraw?.("render");
  }

  _createPrincipalAxes(setting, origin, vals, vecs, normalizer = 1) {
    const position = new THREE.Vector3(...origin);
    const [r0, r1, r2] = this._computeRadii(setting, vals, normalizer);

    const basis3 = this._buildOrthonormalBasis(vecs);
    if (!basis3) return null;
    const { a1, a2, a3 } = basis3;

    const axes = [];
    const axisLength = setting.principalAxisLength;
    const axisRadius = setting.principalAxisRadius;
    const axisVectors = [a1, a2, a3];
    const radii = [r0, r1, r2];

    for (let i = 0; i < 3; i++) {
      const dir = axisVectors[i];
      const len = radii[i] * axisLength;
      const start = position.clone().sub(dir.clone().multiplyScalar(len));
      const end = position.clone().add(dir.clone().multiplyScalar(len));
      const mid = new THREE.Vector3().lerpVectors(start, end, 0.5);
      const height = start.distanceTo(end);

      if (height === 0) continue;

      const axisGeom = new THREE.CylinderGeometry(axisRadius, axisRadius, height, 8);
      const axisMat = materials["Standard"].clone();
      axisMat.color = setting.principalAxisColors[i];
      axisMat.transparent = true;
      axisMat.opacity = setting.opacity;

      const axisMesh = new THREE.Mesh(axisGeom, axisMat);

      // Orient cylinder to align with direction
      const quaternion = new THREE.Quaternion();
      quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      axisMesh.position.copy(mid);
      axisMesh.setRotationFromQuaternion(quaternion);

      axisMesh.userData.type = "tensorEllipsoidAxis";
      axisMesh.visible = this.show;
      axes.push(axisMesh);
    }

    return axes;
  }

  updateTensorMesh(atomIndex = null, atoms = null) {
    if (atoms === null) {
      atoms = this.viewer.atoms;
    }
    const frameIndex = this.viewer.currentFrame;

    Object.entries(this.settings).forEach(([name, setting]) => {
      const meshData = this.meshes[name];
      if (!meshData || !meshData.ellipsoid) {
        return;
      }

      if (meshData.axes) {
        meshData.axes.forEach((axis) => clearObject(this.scene, axis));
        meshData.axes = [];
      }

      if (!setting.visible) {
        meshData.ellipsoid.visible = false;
        return;
      }
      meshData.ellipsoid.visible = this.show;

      try {
        const { eigenvalues, eigenvectors } = this._resolveTensorData(setting, frameIndex, atoms);
        const origins = this._resolveOrigins(setting, atoms);
        const nSites = atoms.getAtomsCount();
        // _validateData is intentionally omitted here: updateTensorMesh is the
        // lightweight fast path (used during trajectory scrubbing). Full
        // validation runs once in drawTensorEllipsoids when the layer is built.

        const indices = setting.selection !== null ? setting.selection : Array.from({ length: nSites }, (_, i) => i);
        const normalizer = this._getScaleNormalizer(setting, eigenvalues, indices);

        for (let i = 0; i < indices.length; i++) {
          const siteIndex = indices[i];
          if (atomIndex !== null && siteIndex !== atomIndex) {
            continue;
          }
          const matrix = this._computeInstanceMatrix(setting, origins[siteIndex], eigenvalues[siteIndex], eigenvectors[siteIndex], normalizer);
          if (matrix) {
            meshData.ellipsoid.setMatrixAt(i, matrix);

            if (setting.showPrincipalAxes) {
              const axes = this._createPrincipalAxes(setting, origins[siteIndex], eigenvalues[siteIndex], eigenvectors[siteIndex], normalizer);
              if (axes) {
                axes.forEach((axis) => {
                  this.scene.add(axis);
                  meshData.axes.push(axis);
                });
              }
            }
          } else {
            meshData.ellipsoid.setMatrixAt(i, new THREE.Matrix4().makeScale(0, 0, 0));
          }
        }

        meshData.ellipsoid.instanceMatrix.needsUpdate = true;
      } catch (err) {
        this.viewer.logger.warn(`TensorEllipsoid update failed for "${name}": ${err.message}`);
      }
    });

    this.viewer.requestRedraw?.("render");
  }
}
