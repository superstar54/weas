import { TrackballControls } from "three/examples/jsm/controls/TrackballControls.js";
import { Vector3 } from "three";

// TODO - make the hotkeys refire a reset so that you dont have to click to see snapping to position
// TODO - re-add perspective camera as i've bonked this in the migration of methods.
class CameraController extends TrackballControls {
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
      rotateSpeed: { min: 0, max: 5, step: 0.01, default: 2.5, gui: true },
      zoomSpeed: { min: 0, max: 5, step: 0.01, default: 1.2, gui: true },
      panSpeed: { min: 0, max: 50, step: 0.05, default: 15, gui: true },
      staticMoving: { default: true, gui: false },
      minDistance: { min: 0, max: 1000, step: 0.1, default: 0, gui: false },
      maxDistance: {
        min: 0,
        max: 5000,
        step: 0.1,
        default: Infinity,
        gui: false,
      },
    };

    // init defaults
    for (const [key, info] of Object.entries(this.paramSchema)) {
      this[key] = info.default;
    }

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

  _emitChange() {
    this._callbacks.forEach((cb) => cb());
  }

  // --- individual camera management
  addCamera(name, camera) {
    this.cameras.set(name, camera);
  }

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

  listCameras() {
    return [...this.cameras.keys()];
  }

  // --- Parameter management
  setParams(params = {}) {
    Object.assign(this, params);
  }

  getParams() {
    const params = {};
    for (const [key, info] of Object.entries(this.paramSchema)) {
      params[key] = this[key];
    }
    return params;
  }

  resetSettings() {
    for (const [key, info] of Object.entries(this.paramSchema)) {
      this[key] = info.default;
    }
    this._emitChange();
    this.update();
  }

  // --- Built-in views
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

  view(name) {
    const v = this._views[name];
    if (!v) return;

    this.object.position.copy(v.position);
    this.object.quaternion.copy(v.quaternion);
    this.target.copy(v.target);
    this.object.up.copy(v.up);
    if (this.object.isOrthographicCamera) this.object.zoom = v.zoom;
    else this.object.fov = v.zoom;

    this.update();
    this._emitChange();
  }

  saveView(name, builtIn = false) {
    this._views[name] = {
      position: this.object.position.clone(),
      quaternion: this.object.quaternion.clone(),
      target: this.target.clone(),
      up: this.object.up.clone(),
      zoom: this.object.zoom,
    };
    if (builtIn) this._builtInViews.add(name);
    this._emitChange();
  }

  removeView(name) {
    if (this._builtInViews.has(name)) return;
    delete this._views[name];
    this._emitChange();
  }

  // --- GUI helpers
  list() {
    return Object.keys(this._views);
  }

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

  // --- Fit to scene
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

  // --- Fit current camera positions
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

  // self contained state management
  exportState() {
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
}

export { CameraController };
