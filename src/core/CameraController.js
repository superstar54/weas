import { TrackballControls } from "three/examples/jsm/controls/TrackballControls.js";
import { Vector3, Quaternion } from "three";

/**
 * Extended TrackballControls with:
 * - Multi-camera support
 * - Saved camera views
 * - Parameter schema system
 * - Fit-to-scene utilities
 * - State serialization
 *
 * @class */
class CameraController extends TrackballControls {
  /**
   * @param {THREE.Camera} camera - Initial active camera
   * @param {HTMLElement} domElement - DOM element for input events
   * @param {Object} [params={}] - Optional initial control parameters
   */
  constructor(camera, domElement, params = {}) {
    super(camera, domElement);
    this.cameras = new Map();
    this.activeCamera = "default";

    this.cameras.set("default", camera);

    this._callbacks = new Set();

    this._views = {};
    this._builtInViews = new Set();

    // initialise a s.o.t schema - this 'can' be overridden and will be respected by reset
    this.paramSchema = {
      rotateSpeed: {
        type: "number",
        label: "Rotation speed",
        min: 0,
        max: 5,
        step: 0.01,
        default: 2.5,
      },
      zoomSpeed: {
        type: "number",
        label: "Zoom speed",
        min: 0,
        max: 5,
        step: 0.01,
        default: 1.2,
      },
      panSpeed: {
        type: "number",
        label: "Pan speed",
        min: 0,
        max: 50,
        step: 0.05,
        default: 15,
      },
      staticMoving: {
        type: "boolean",
        label: "Static moving",
        default: true,
      },
      minDistance: {
        type: "number",
        label: "Min Distance",
        min: 0,
        max: 1000,
        step: 0.1,
        default: 0.1,
        gui: false,
      },
      maxDistance: {
        type: "number",
        label: "Max Distance",
        min: 0,
        max: 5000,
        step: 0.1,
        default: 2500,
        gui: false,
      },
    };

    // init defaults
    for (const [key, info] of Object.entries(this.paramSchema)) {
      this[key] = info.default;
    }

    camera.near = -this.minDistance;
    camera.far = this.maxDistance;
    camera.updateProjectionMatrix();

    // TODO - move this to be controlled by keybinds
    // disable rotation on shift held.
    this._shiftDown = false;
    this._storedRotateSpeed = this.rotateSpeed;

    window.addEventListener("keydown", (e) => {
      if (e.key === "Shift" && !this._shiftDown) {
        this._shiftDown = true;
        this._storedRotateSpeed = this.rotateSpeed;
        this.rotateSpeed = 0;
      }
    });

    window.addEventListener("keyup", (e) => {
      if (e.key === "Shift" && this._shiftDown) {
        this._shiftDown = false;
        this.rotateSpeed = this._storedRotateSpeed;
      }
    });

    this.setParams(params);
    this._initDefaultViews();
  }

  onChange(cb) {
    this._callbacks.add(cb);
    return () => this._callbacks.delete(cb);
  }

  /**
   * Emits change event to subscribers.
   * @private
   */
  _emitChange() {
    this._callbacks.forEach((cb) => cb());
  }

  /**
   * Registers an additional camera.
   * @param {string} name
   * @param {THREE.Camera} camera
   */
  addCamera(name, camera) {
    this.cameras.set(name, camera);
  }

  /**
   * Switch active camera.
   * Copies transform state from current camera.
   *
   * @param {string} name
   */
  setCamera(name) {
    const newCam = this.cameras.get(name);
    if (!newCam || newCam === this.object) return;

    const oldCam = this.object;

    // copy pose
    newCam.position.copy(oldCam.position);
    newCam.quaternion.copy(oldCam.quaternion);
    newCam.up.copy(oldCam.up);

    if (newCam.isOrthographicCamera) newCam.zoom = oldCam.zoom;
    if (newCam.isPerspectiveCamera && oldCam.fov) newCam.fov = oldCam.fov;

    newCam.updateProjectionMatrix();

    this.object = newCam;
    this.activeCamera = name;

    this.update();
    this._emitChange();
  }

  /**
   * @returns {string[]} List of registered camera names
   */
  listCameras() {
    return [...this.cameras.keys()];
  }

  /**
   * Applies partial parameter overrides.
   * Only updates known controller properties.
   *
   * @param {Object} params
   */
  setParams(params = {}) {
    Object.assign(this, params);
  }

  /**
   * Returns current controller parameters
   * based on schema defaults.
   *
   * @returns {Object}
   */
  getParams() {
    const params = {};
    for (const [key, info] of Object.entries(this.paramSchema)) {
      params[key] = this[key];
    }
    return params;
  }

  /**
   * Resets all parameters to schema defaults.
   */
  resetSettings() {
    for (const [key, info] of Object.entries(this.paramSchema)) {
      this[key] = info.default;
    }
    this._emitChange();
    this.update();
  }

  /**
   * Initializes built-in orthographic views.
   * Called once in constructor.
   * @private
   */
  _initDefaultViews() {
    const dist = this.object.position.distanceTo(this.target);
    const original = {
      position: this.object.position.clone(),
      quaternion: this.object.quaternion.clone(),
      target: this.target.clone(),
      up: this.object.up.clone(),
      zoom: this.object.zoom,
    };

    const views = [
      { name: "front", pos: [0, 0, dist], up: [0, 1, 0] },
      { name: "back", pos: [0, 0, -dist], up: [0, 1, 0] },
      { name: "right", pos: [dist, 0, 0], up: [0, 1, 0] },
      { name: "left", pos: [-dist, 0, 0], up: [0, 1, 0] },
      { name: "top", pos: [0, dist, 0], up: [0, 0, 1] },
      { name: "bottom", pos: [0, -dist, 0], up: [0, 0, 1] },
    ];

    for (const { name, pos, up } of views) {
      this.object.position.set(...pos);
      this.object.up.set(...up);
      this.object.lookAt(this.target);
      this.saveView(name, true); // true = built-in
    }

    // restore original camera
    this.object.position.copy(original.position);
    this.object.quaternion.copy(original.quaternion);
    this.target.copy(original.target);
    this.object.up.copy(original.up);
    this.object.zoom = original.zoom;
    if (this.object.isOrthographicCamera) this.object.updateProjectionMatrix();
    this.update();
  }

  // TODO: move this to the keybind manager
  _updateShiftState() {
    const shiftPressed = window.event ? window.event.shiftKey : false;
    if (shiftPressed && !this._shiftDown) {
      this._shiftDown = true;
      this._storedRotateSpeed = this.rotateSpeed;
      this.rotateSpeed = 0;
    } else if (!shiftPressed && this._shiftDown) {
      this._shiftDown = false;
      this.rotateSpeed = this._storedRotateSpeed;
    }
  }

  /**
   * Internal update loop.
   * Handles shift-modified rotation locking.
   *
   * @param  {...any} args
   */
  update(...args) {
    this._updateShiftState();
    super.update(...args);
  }

  /**
   * Applies a saved camera view.
   *
   * Supports optional focus override.
   *
   * @param {string} name
   * @param {Object} [options]
   * @param {Array<number>} [options.focus] - Override target focus point
   * @param {number} [options.zoom] - Override zoom
   */
  view(name, options = {}) {
    const v = this._views[name];
    if (!v) return;

    this.object.position.copy(v.position);
    this.object.quaternion.copy(v.quaternion);
    this.object.up.copy(v.up);
    if (this.object.isOrthographicCamera) this.object.zoom = v.zoom;
    else this.object.fov = v.zoom;

    // If a focus point is provided, translate the camera so it orbits
    // around that point instead of the origin, preserving the view direction.
    if (options.focus) {
      const focus = new Vector3(...options.focus);
      const offset = this.object.position.clone().sub(v.target);
      this.object.position.copy(focus.clone().add(offset));
      this.target.copy(focus);
    } else {
      this.target.copy(v.target);
    }

    if (options.zoom !== undefined) {
      this.object.zoom = options.zoom;
    }

    this.object.updateProjectionMatrix();
    this.update();
    this._emitChange();
  }

  /**
   * Saves current camera state as a named view.
   *
   * @param {string} name
   * @param {boolean} [builtIn=false]
   */
  saveView(name, builtIn = false) {
    this._views[name] = {
      position: this.object.position.clone(),
      quaternion: this.object.quaternion.clone(),
      target: this.target.clone(),
      up: this.object.up.clone(),
      zoom: this.object.zoom,
      timestamp: builtIn ? undefined : Date.now(),
    };
    if (builtIn) this._builtInViews.add(name);
    this._emitChange();
  }

  /**
   * Removes a user-defined view.
   * Built-in views cannot be removed.
   *
   * @param {string} name
   */
  removeView(name) {
    if (this._builtInViews.has(name)) return;
    delete this._views[name];
    this._emitChange();
  }

  /**
   * @returns {string[]} List of available view names
   */
  list() {
    return Object.keys(this._views);
  }

  /**
   * Returns detailed view metadata.
   *
   * @returns {Array<Object>}
   */
  listDetails() {
    return Object.entries(this._views).map(([name, v]) => ({
      name,
      builtIn: this._builtInViews.has(name),
      position: v.position.clone(),
      quaternion: v.quaternion.clone(),
      target: v.target.clone(),
      up: v.up.clone(),
      zoom: v.zoom,
    }));
  }

  /**
   * Fits camera to a scene bounding box.
   *
   * @param {THREE.Object3D} scene
   * @param {Object} [options]
   * @param {Array<number>} [options.lookAt]
   * @param {Array<number>} [options.direction=[0,0,1]]
   * @param {number} [options.zoom=1]
   * @param {number} [options.fov]
   * @param {number} [options.padding=10]
   */
  fitToScene(scene, options = {}) {
    const {
      lookAt = null,
      direction = [0, 0, 1],
      zoom = 1,
      fov = this.object.fov,
      padding = 10,
    } = options;

    const dir = new Vector3(...direction).normalize();
    const bbox = scene.getBoundingBox();
    const center = lookAt
      ? new Vector3(...lookAt)
      : bbox.getCenter(new Vector3());
    const size = bbox.getSize(new Vector3()).length() + padding;

    let distance;
    if (this.object.isPerspectiveCamera) {
      distance = size / (2 * Math.tan((fov * Math.PI) / 360));
    } else {
      distance = size;
    }

    this.object.position.copy(center.clone().add(dir.multiplyScalar(distance)));
    this.target.copy(center);
    this.object.lookAt(center);

    if (this.object.isOrthographicCamera) this.object.zoom = zoom;
    else this.object.fov = fov;

    this.object.updateProjectionMatrix();
    this.update();
  }

  /**
   * Fits camera to a list of positions.
   *
   * @param {Array<Array<number>>} positions
   */
  fit(positions) {
    if (!positions || positions.length === 0) return;

    let minX = Infinity,
      minY = Infinity,
      minZ = Infinity;
    let maxX = -Infinity,
      maxY = -Infinity,
      maxZ = -Infinity;

    for (const p of positions) {
      const x = p[0],
        y = p[1],
        z = p[2];

      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (z < minZ) minZ = z;

      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      if (z > maxZ) maxZ = z;
    }

    const center = new Vector3(
      (minX + maxX) / 2,
      (minY + maxY) / 2,
      (minZ + maxZ) / 2,
    );

    const dx = maxX - minX;
    const dy = maxY - minY;
    const dz = maxZ - minZ;

    const size = Math.sqrt(dx * dx + dy * dy + dz * dz);

    const cam = this.object;

    let distance;

    if (cam.isPerspectiveCamera) {
      const fov = (cam.fov * Math.PI) / 180;
      distance = size / 2 / Math.tan(fov / 2);
    } else {
      distance = size;
    }
    // preserve viewing direction
    const dir = cam.position.clone().sub(this.target).normalize();

    this.target.copy(center);
    cam.position.copy(center.clone().add(dir.multiplyScalar(distance)));

    cam.updateProjectionMatrix();
    this.update();
  }

  reset() {
    if (this._views["default"]) this.view("default");
  }

  /**
   * Serializes full camera state.
   *
   * Includes:
   * - position
   * - target
   * - direction
   * - zoom / fov
   * - active camera type
   * - controller params
   *
   * @returns {Object}
   */ exportState() {
    const cam = this.object;

    const position = cam.position.toArray();
    const target = this.target.toArray();

    const dx = position[0] - target[0];
    const dy = position[1] - target[1];
    const dz = position[2] - target[2];

    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    const direction =
      distance > 0 ? [dx / distance, dy / distance, dz / distance] : [0, 0, 1];

    return {
      type: this.activeCamera,
      position,
      target,
      direction,
      distance,
      zoom: cam.zoom,
      fov: cam.fov,
      params: this.getParams(),
    };
  }

  /**
   * Restores camera state from exportState().
   *
   * @param {Object} state
   */
  importState(state) {
    if (!state) return;

    if (state.type) this.setCamera(state.type);

    const cam = this.object;

    if (state.position) cam.position.fromArray(state.position);
    if (state.target) this.target.fromArray(state.target);

    if (cam.isOrthographicCamera && state.zoom !== undefined)
      cam.zoom = state.zoom;

    if (cam.isPerspectiveCamera && state.fov !== undefined) cam.fov = state.fov;

    cam.updateProjectionMatrix();
    this.update();

    if (state.params) this.setParams(state.params);
  }

  /**
   * Serializes controller to minimal JSON representation.
   * Exports:
   * - All saved views (including current camera as a timestamped view)
   * - Controller parameters
   *
   * @param {Object} [options]
   * @param {boolean} [options.includeTimestamp=true] - Add timestamp to current view name
   * @param {string} [options.timestampFormat="readable"] - "iso", "unix", or "readable"
   * @returns {Object}
   */
  toJSON(options = {}) {
    const { includeTimestamp = true, timestampFormat = "readable" } = options;

    let currentViewName = "exported";

    if (includeTimestamp) {
      let timestamp;
      switch (timestampFormat) {
        case "unix":
          timestamp = Date.now();
          break;
        case "readable":
          timestamp = new Date().toLocaleString().replace(/[\/:, ]/g, "-");
          break;
        default: // "iso"
          timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      }
      currentViewName = `exported-${timestamp}`;
    }

    // Convert all existing views to array format
    const views = {};
    for (const [name, viewData] of Object.entries(this._views)) {
      // Skip built-in views to save space
      if (this._builtInViews.has(name)) continue;

      views[name] = {
        position: viewData.position.toArray(),
        quaternion: viewData.quaternion.toArray(),
        target: viewData.target.toArray(),
        up: viewData.up.toArray(),
        zoom: viewData.zoom,
        timestamp: viewData.timestamp,
      };
    }

    // Add current view as array format
    views[currentViewName] = {
      position: this.object.position.toArray(),
      quaternion: this.object.quaternion.toArray(),
      target: this.target.toArray(),
      up: this.object.up.toArray(),
      zoom: this.object.zoom,
      timestamp: Date.now(),
    };

    return {
      version: "1.0",
      exported: Date.now(),
      params: this.getParams(),
      views: views,
    };
  }

  /**
   * Restores controller from JSON data.
   *
   * @param {Object} data - Output from toJSON()
   * @param {Object} [options]
   * @param {boolean} [options.keepExistingViews=false] - Merge with existing views
   * @param {boolean} [options.restoreLatestView=true] - Restore the most recent timestamped view
   * @param {string} [options.specificView=null] - Restore a specific view by name
   */
  fromJSON(data, options = {}) {
    const {
      keepExistingViews = false,
      restoreLatestView = true,
      specificView = null,
    } = options;

    if (!data) return;

    // Restore parameters
    if (data.params) {
      this.setParams(data.params);
    }

    // Restore views
    if (data.views) {
      if (!keepExistingViews) {
        // Clear all non-built-in views
        for (const viewName of Object.keys(this._views)) {
          if (!this._builtInViews.has(viewName)) {
            delete this._views[viewName];
          }
        }
      }

      // Import saved views (all in array format)
      for (const [name, viewData] of Object.entries(data.views)) {
        this._views[name] = {
          position: new Vector3().fromArray(viewData.position),
          quaternion: new THREE.Quaternion().fromArray(viewData.quaternion),
          target: new Vector3().fromArray(viewData.target),
          up: new Vector3().fromArray(viewData.up),
          zoom: viewData.zoom,
          timestamp: viewData.timestamp,
        };
      }
    }

    // Determine which view to restore
    let viewToRestore = null;

    if (specificView) {
      viewToRestore = specificView;
    } else if (restoreLatestView && data.views) {
      // Find the most recent timestamped view
      const timestampedViews = Object.keys(data.views)
        .filter((name) => data.views[name]?.timestamp)
        .sort((a, b) => {
          const timestampA = data.views[a].timestamp || 0;
          const timestampB = data.views[b].timestamp || 0;
          return timestampB - timestampA;
        });

      if (timestampedViews.length > 0) {
        viewToRestore = timestampedViews[0];
      }
    }

    if (viewToRestore && data.views && data.views[viewToRestore]) {
      this.view(viewToRestore);
    }

    this._emitChange();
  }

  /**
   * Helper method to manually save current state as a timestamped view
   *
   * @param {string} [prefix="snapshot"]
   * @returns {string} The name of the saved view
   */
  saveTimestampedView(prefix = "snapshot") {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const viewName = `${prefix}_${timestamp}`;
    this.saveView(viewName);
    // Add timestamp metadata
    if (this._views[viewName]) {
      this._views[viewName].timestamp = Date.now();
    }
    return viewName;
  }

  /**
   * Get all timestamped views sorted by time
   *
   * @returns {Array<Object>} Sorted list of timestamped views
   */
  getTimestampedViews() {
    return Object.entries(this._views)
      .filter(([_, view]) => view?.timestamp)
      .map(([name, view]) => ({
        name,
        timestamp: view.timestamp,
        date: new Date(view.timestamp),
        view,
      }))
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Clean up old timestamped views, keeping only the most recent N
   *
   * @param {number} keepCount - Number of recent timestamped views to keep
   */
  pruneTimestampedViews(keepCount = 10) {
    const timestamped = this.getTimestampedViews();

    if (timestamped.length <= keepCount) return;

    const toRemove = timestamped.slice(keepCount);
    for (const { name } of toRemove) {
      this.removeView(name);
    }

    this._emitChange();
  }
}

export { CameraController };
