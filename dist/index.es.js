import * as THREE from "three";
import { Vector2, Vector3, Quaternion, Controls, MOUSE, MathUtils, Matrix4, Object3D, Frustum, BufferGeometry, BufferAttribute, Line3, Plane, Triangle } from "three";
import { GUI } from "dat.gui";
import './index.css';const _changeEvent = { type: "change" }, _startEvent = { type: "start" }, _endEvent = { type: "end" }, _EPS = 1e-6, _STATE = { NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_ZOOM_PAN: 4 }, _v2 = new Vector2(), _mouseChange = new Vector2(), _objectUp = new Vector3(), _pan = new Vector3(), _axis = new Vector3(), _quaternion$1 = new Quaternion(), _eyeDirection = new Vector3(), _objectUpDirection = new Vector3(), _objectSidewaysDirection = new Vector3(), _moveDirection = new Vector3();
class TrackballControls extends Controls {
  constructor(e, t = null) {
    super(e, t), this.enabled = !0, this.screen = { left: 0, top: 0, width: 0, height: 0 }, this.rotateSpeed = 1, this.zoomSpeed = 1.2, this.panSpeed = 0.3, this.noRotate = !1, this.noZoom = !1, this.noPan = !1, this.staticMoving = !1, this.dynamicDampingFactor = 0.2, this.minDistance = 0, this.maxDistance = 1 / 0, this.minZoom = 0, this.maxZoom = 1 / 0, this.keys = [
      "KeyA",
      "KeyS",
      "KeyD"
      /*D*/
    ], this.mouseButtons = { LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN }, this.state = _STATE.NONE, this.keyState = _STATE.NONE, this.target = new Vector3(), this._lastPosition = new Vector3(), this._lastZoom = 1, this._touchZoomDistanceStart = 0, this._touchZoomDistanceEnd = 0, this._lastAngle = 0, this._eye = new Vector3(), this._movePrev = new Vector2(), this._moveCurr = new Vector2(), this._lastAxis = new Vector3(), this._zoomStart = new Vector2(), this._zoomEnd = new Vector2(), this._panStart = new Vector2(), this._panEnd = new Vector2(), this._pointers = [], this._pointerPositions = {}, this._onPointerMove = onPointerMove.bind(this), this._onPointerDown = onPointerDown.bind(this), this._onPointerUp = onPointerUp.bind(this), this._onPointerCancel = onPointerCancel.bind(this), this._onContextMenu = onContextMenu.bind(this), this._onMouseWheel = onMouseWheel.bind(this), this._onKeyDown = onKeyDown.bind(this), this._onKeyUp = onKeyUp.bind(this), this._onTouchStart = onTouchStart.bind(this), this._onTouchMove = onTouchMove.bind(this), this._onTouchEnd = onTouchEnd.bind(this), this._onMouseDown = onMouseDown.bind(this), this._onMouseMove = onMouseMove.bind(this), this._onMouseUp = onMouseUp.bind(this), this._target0 = this.target.clone(), this._position0 = this.object.position.clone(), this._up0 = this.object.up.clone(), this._zoom0 = this.object.zoom, t !== null && (this.connect(), this.handleResize()), this.update();
  }
  connect() {
    window.addEventListener("keydown", this._onKeyDown), window.addEventListener("keyup", this._onKeyUp), this.domElement.addEventListener("pointerdown", this._onPointerDown), this.domElement.addEventListener("pointercancel", this._onPointerCancel), this.domElement.addEventListener("wheel", this._onMouseWheel, { passive: !1 }), this.domElement.addEventListener("contextmenu", this._onContextMenu), this.domElement.style.touchAction = "none";
  }
  disconnect() {
    window.removeEventListener("keydown", this._onKeyDown), window.removeEventListener("keyup", this._onKeyUp), this.domElement.removeEventListener("pointerdown", this._onPointerDown), this.domElement.removeEventListener("pointermove", this._onPointerMove), this.domElement.removeEventListener("pointerup", this._onPointerUp), this.domElement.removeEventListener("pointercancel", this._onPointerCancel), this.domElement.removeEventListener("wheel", this._onMouseWheel), this.domElement.removeEventListener("contextmenu", this._onContextMenu), this.domElement.style.touchAction = "auto";
  }
  dispose() {
    this.disconnect();
  }
  handleResize() {
    const e = this.domElement.getBoundingClientRect(), t = this.domElement.ownerDocument.documentElement;
    this.screen.left = e.left + window.pageXOffset - t.clientLeft, this.screen.top = e.top + window.pageYOffset - t.clientTop, this.screen.width = e.width, this.screen.height = e.height;
  }
  update() {
    this._eye.subVectors(this.object.position, this.target), this.noRotate || this._rotateCamera(), this.noZoom || this._zoomCamera(), this.noPan || this._panCamera(), this.object.position.addVectors(this.target, this._eye), this.object.isPerspectiveCamera ? (this._checkDistances(), this.object.lookAt(this.target), this._lastPosition.distanceToSquared(this.object.position) > _EPS && (this.dispatchEvent(_changeEvent), this._lastPosition.copy(this.object.position))) : this.object.isOrthographicCamera ? (this.object.lookAt(this.target), (this._lastPosition.distanceToSquared(this.object.position) > _EPS || this._lastZoom !== this.object.zoom) && (this.dispatchEvent(_changeEvent), this._lastPosition.copy(this.object.position), this._lastZoom = this.object.zoom)) : console.warn("THREE.TrackballControls: Unsupported camera type.");
  }
  reset() {
    this.state = _STATE.NONE, this.keyState = _STATE.NONE, this.target.copy(this._target0), this.object.position.copy(this._position0), this.object.up.copy(this._up0), this.object.zoom = this._zoom0, this.object.updateProjectionMatrix(), this._eye.subVectors(this.object.position, this.target), this.object.lookAt(this.target), this.dispatchEvent(_changeEvent), this._lastPosition.copy(this.object.position), this._lastZoom = this.object.zoom;
  }
  _panCamera() {
    if (_mouseChange.copy(this._panEnd).sub(this._panStart), _mouseChange.lengthSq()) {
      if (this.object.isOrthographicCamera) {
        const e = (this.object.right - this.object.left) / this.object.zoom / this.domElement.clientWidth, t = (this.object.top - this.object.bottom) / this.object.zoom / this.domElement.clientWidth;
        _mouseChange.x *= e, _mouseChange.y *= t;
      }
      _mouseChange.multiplyScalar(this._eye.length() * this.panSpeed), _pan.copy(this._eye).cross(this.object.up).setLength(_mouseChange.x), _pan.add(_objectUp.copy(this.object.up).setLength(_mouseChange.y)), this.object.position.add(_pan), this.target.add(_pan), this.staticMoving ? this._panStart.copy(this._panEnd) : this._panStart.add(_mouseChange.subVectors(this._panEnd, this._panStart).multiplyScalar(this.dynamicDampingFactor));
    }
  }
  _rotateCamera() {
    _moveDirection.set(this._moveCurr.x - this._movePrev.x, this._moveCurr.y - this._movePrev.y, 0);
    let e = _moveDirection.length();
    e ? (this._eye.copy(this.object.position).sub(this.target), _eyeDirection.copy(this._eye).normalize(), _objectUpDirection.copy(this.object.up).normalize(), _objectSidewaysDirection.crossVectors(_objectUpDirection, _eyeDirection).normalize(), _objectUpDirection.setLength(this._moveCurr.y - this._movePrev.y), _objectSidewaysDirection.setLength(this._moveCurr.x - this._movePrev.x), _moveDirection.copy(_objectUpDirection.add(_objectSidewaysDirection)), _axis.crossVectors(_moveDirection, this._eye).normalize(), e *= this.rotateSpeed, _quaternion$1.setFromAxisAngle(_axis, e), this._eye.applyQuaternion(_quaternion$1), this.object.up.applyQuaternion(_quaternion$1), this._lastAxis.copy(_axis), this._lastAngle = e) : !this.staticMoving && this._lastAngle && (this._lastAngle *= Math.sqrt(1 - this.dynamicDampingFactor), this._eye.copy(this.object.position).sub(this.target), _quaternion$1.setFromAxisAngle(this._lastAxis, this._lastAngle), this._eye.applyQuaternion(_quaternion$1), this.object.up.applyQuaternion(_quaternion$1)), this._movePrev.copy(this._moveCurr);
  }
  _zoomCamera() {
    let e;
    this.state === _STATE.TOUCH_ZOOM_PAN ? (e = this._touchZoomDistanceStart / this._touchZoomDistanceEnd, this._touchZoomDistanceStart = this._touchZoomDistanceEnd, this.object.isPerspectiveCamera ? this._eye.multiplyScalar(e) : this.object.isOrthographicCamera ? (this.object.zoom = MathUtils.clamp(this.object.zoom / e, this.minZoom, this.maxZoom), this._lastZoom !== this.object.zoom && this.object.updateProjectionMatrix()) : console.warn("THREE.TrackballControls: Unsupported camera type")) : (e = 1 + (this._zoomEnd.y - this._zoomStart.y) * this.zoomSpeed, e !== 1 && e > 0 && (this.object.isPerspectiveCamera ? this._eye.multiplyScalar(e) : this.object.isOrthographicCamera ? (this.object.zoom = MathUtils.clamp(this.object.zoom / e, this.minZoom, this.maxZoom), this._lastZoom !== this.object.zoom && this.object.updateProjectionMatrix()) : console.warn("THREE.TrackballControls: Unsupported camera type")), this.staticMoving ? this._zoomStart.copy(this._zoomEnd) : this._zoomStart.y += (this._zoomEnd.y - this._zoomStart.y) * this.dynamicDampingFactor);
  }
  _getMouseOnScreen(e, t) {
    return _v2.set(
      (e - this.screen.left) / this.screen.width,
      (t - this.screen.top) / this.screen.height
    ), _v2;
  }
  _getMouseOnCircle(e, t) {
    return _v2.set(
      (e - this.screen.width * 0.5 - this.screen.left) / (this.screen.width * 0.5),
      (this.screen.height + 2 * (this.screen.top - t)) / this.screen.width
      // screen.width intentional
    ), _v2;
  }
  _addPointer(e) {
    this._pointers.push(e);
  }
  _removePointer(e) {
    delete this._pointerPositions[e.pointerId];
    for (let t = 0; t < this._pointers.length; t++)
      if (this._pointers[t].pointerId == e.pointerId) {
        this._pointers.splice(t, 1);
        return;
      }
  }
  _trackPointer(e) {
    let t = this._pointerPositions[e.pointerId];
    t === void 0 && (t = new Vector2(), this._pointerPositions[e.pointerId] = t), t.set(e.pageX, e.pageY);
  }
  _getSecondPointerPosition(e) {
    const t = e.pointerId === this._pointers[0].pointerId ? this._pointers[1] : this._pointers[0];
    return this._pointerPositions[t.pointerId];
  }
  _checkDistances() {
    (!this.noZoom || !this.noPan) && (this._eye.lengthSq() > this.maxDistance * this.maxDistance && (this.object.position.addVectors(this.target, this._eye.setLength(this.maxDistance)), this._zoomStart.copy(this._zoomEnd)), this._eye.lengthSq() < this.minDistance * this.minDistance && (this.object.position.addVectors(this.target, this._eye.setLength(this.minDistance)), this._zoomStart.copy(this._zoomEnd)));
  }
}
function onPointerDown(o) {
  this.enabled !== !1 && (this._pointers.length === 0 && (this.domElement.setPointerCapture(o.pointerId), this.domElement.addEventListener("pointermove", this._onPointerMove), this.domElement.addEventListener("pointerup", this._onPointerUp)), this._addPointer(o), o.pointerType === "touch" ? this._onTouchStart(o) : this._onMouseDown(o));
}
function onPointerMove(o) {
  this.enabled !== !1 && (o.pointerType === "touch" ? this._onTouchMove(o) : this._onMouseMove(o));
}
function onPointerUp(o) {
  this.enabled !== !1 && (o.pointerType === "touch" ? this._onTouchEnd(o) : this._onMouseUp(), this._removePointer(o), this._pointers.length === 0 && (this.domElement.releasePointerCapture(o.pointerId), this.domElement.removeEventListener("pointermove", this._onPointerMove), this.domElement.removeEventListener("pointerup", this._onPointerUp)));
}
function onPointerCancel(o) {
  this._removePointer(o);
}
function onKeyUp() {
  this.enabled !== !1 && (this.keyState = _STATE.NONE, window.addEventListener("keydown", this._onKeyDown));
}
function onKeyDown(o) {
  this.enabled !== !1 && (window.removeEventListener("keydown", this._onKeyDown), this.keyState === _STATE.NONE && (o.code === this.keys[_STATE.ROTATE] && !this.noRotate ? this.keyState = _STATE.ROTATE : o.code === this.keys[_STATE.ZOOM] && !this.noZoom ? this.keyState = _STATE.ZOOM : o.code === this.keys[_STATE.PAN] && !this.noPan && (this.keyState = _STATE.PAN)));
}
function onMouseDown(o) {
  let e;
  switch (o.button) {
    case 0:
      e = this.mouseButtons.LEFT;
      break;
    case 1:
      e = this.mouseButtons.MIDDLE;
      break;
    case 2:
      e = this.mouseButtons.RIGHT;
      break;
    default:
      e = -1;
  }
  switch (e) {
    case MOUSE.DOLLY:
      this.state = _STATE.ZOOM;
      break;
    case MOUSE.ROTATE:
      this.state = _STATE.ROTATE;
      break;
    case MOUSE.PAN:
      this.state = _STATE.PAN;
      break;
    default:
      this.state = _STATE.NONE;
  }
  const t = this.keyState !== _STATE.NONE ? this.keyState : this.state;
  t === _STATE.ROTATE && !this.noRotate ? (this._moveCurr.copy(this._getMouseOnCircle(o.pageX, o.pageY)), this._movePrev.copy(this._moveCurr)) : t === _STATE.ZOOM && !this.noZoom ? (this._zoomStart.copy(this._getMouseOnScreen(o.pageX, o.pageY)), this._zoomEnd.copy(this._zoomStart)) : t === _STATE.PAN && !this.noPan && (this._panStart.copy(this._getMouseOnScreen(o.pageX, o.pageY)), this._panEnd.copy(this._panStart)), this.dispatchEvent(_startEvent);
}
function onMouseMove(o) {
  const e = this.keyState !== _STATE.NONE ? this.keyState : this.state;
  e === _STATE.ROTATE && !this.noRotate ? (this._movePrev.copy(this._moveCurr), this._moveCurr.copy(this._getMouseOnCircle(o.pageX, o.pageY))) : e === _STATE.ZOOM && !this.noZoom ? this._zoomEnd.copy(this._getMouseOnScreen(o.pageX, o.pageY)) : e === _STATE.PAN && !this.noPan && this._panEnd.copy(this._getMouseOnScreen(o.pageX, o.pageY));
}
function onMouseUp() {
  this.state = _STATE.NONE, this.dispatchEvent(_endEvent);
}
function onMouseWheel(o) {
  if (this.enabled !== !1 && this.noZoom !== !0) {
    switch (o.preventDefault(), o.deltaMode) {
      case 2:
        this._zoomStart.y -= o.deltaY * 0.025;
        break;
      case 1:
        this._zoomStart.y -= o.deltaY * 0.01;
        break;
      default:
        this._zoomStart.y -= o.deltaY * 25e-5;
        break;
    }
    this.dispatchEvent(_startEvent), this.dispatchEvent(_endEvent);
  }
}
function onContextMenu(o) {
  this.enabled !== !1 && o.preventDefault();
}
function onTouchStart(o) {
  if (this._trackPointer(o), this._pointers.length === 1)
    this.state = _STATE.TOUCH_ROTATE, this._moveCurr.copy(this._getMouseOnCircle(this._pointers[0].pageX, this._pointers[0].pageY)), this._movePrev.copy(this._moveCurr);
  else {
    this.state = _STATE.TOUCH_ZOOM_PAN;
    const e = this._pointers[0].pageX - this._pointers[1].pageX, t = this._pointers[0].pageY - this._pointers[1].pageY;
    this._touchZoomDistanceEnd = this._touchZoomDistanceStart = Math.sqrt(e * e + t * t);
    const s = (this._pointers[0].pageX + this._pointers[1].pageX) / 2, i = (this._pointers[0].pageY + this._pointers[1].pageY) / 2;
    this._panStart.copy(this._getMouseOnScreen(s, i)), this._panEnd.copy(this._panStart);
  }
  this.dispatchEvent(_startEvent);
}
function onTouchMove(o) {
  if (this._trackPointer(o), this._pointers.length === 1)
    this._movePrev.copy(this._moveCurr), this._moveCurr.copy(this._getMouseOnCircle(o.pageX, o.pageY));
  else {
    const e = this._getSecondPointerPosition(o), t = o.pageX - e.x, s = o.pageY - e.y;
    this._touchZoomDistanceEnd = Math.sqrt(t * t + s * s);
    const i = (o.pageX + e.x) / 2, n = (o.pageY + e.y) / 2;
    this._panEnd.copy(this._getMouseOnScreen(i, n));
  }
}
function onTouchEnd(o) {
  switch (this._pointers.length) {
    case 0:
      this.state = _STATE.NONE;
      break;
    case 1:
      this.state = _STATE.TOUCH_ROTATE, this._moveCurr.copy(this._getMouseOnCircle(o.pageX, o.pageY)), this._movePrev.copy(this._moveCurr);
      break;
    case 2:
      this.state = _STATE.TOUCH_ZOOM_PAN;
      for (let e = 0; e < this._pointers.length; e++)
        if (this._pointers[e].pointerId !== o.pointerId) {
          const t = this._pointerPositions[this._pointers[e].pointerId];
          this._moveCurr.copy(this._getMouseOnCircle(t.x, t.y)), this._movePrev.copy(this._moveCurr);
          break;
        }
      break;
  }
  this.dispatchEvent(_endEvent);
}
class CameraController extends TrackballControls {
  constructor(e, t, s = {}) {
    super(e, t), this.cameras = /* @__PURE__ */ new Map(), this.activeCamera = "default", this.cameras.set("default", e), this._callbacks = /* @__PURE__ */ new Set(), this._views = {}, this._builtInViews = /* @__PURE__ */ new Set(), this.paramSchema = {
      rotateSpeed: { min: 0, max: 5, step: 0.01, default: 2.5, gui: !0 },
      zoomSpeed: { min: 0, max: 5, step: 0.01, default: 1.2, gui: !0 },
      panSpeed: { min: 0, max: 50, step: 0.05, default: 15, gui: !0 },
      staticMoving: { default: !0, gui: !1 },
      minDistance: { min: 0, max: 1e3, step: 0.1, default: 0, gui: !1 },
      maxDistance: {
        min: 0,
        max: 5e3,
        step: 0.1,
        default: 1 / 0,
        gui: !1
      }
    };
    for (const [i, n] of Object.entries(this.paramSchema))
      this[i] = n.default;
    this._shiftDown = !1, this._storedRotateSpeed = this.rotateSpeed, window.addEventListener("keydown", (i) => {
      i.key === "Shift" && !this._shiftDown && (this._shiftDown = !0, this._storedRotateSpeed = this.rotateSpeed, this.rotateSpeed = 0);
    }), window.addEventListener("keyup", (i) => {
      i.key === "Shift" && this._shiftDown && (this._shiftDown = !1, this.rotateSpeed = this._storedRotateSpeed);
    }), this.setParams(s), this._initDefaultViews();
  }
  onChange(e) {
    return this._callbacks.add(e), () => this._callbacks.delete(e);
  }
  _emitChange() {
    this._callbacks.forEach((e) => e());
  }
  // --- individual camera management
  addCamera(e, t) {
    this.cameras.set(e, t);
  }
  setCamera(e) {
    const t = this.cameras.get(e);
    if (!t || t === this.object) return;
    const s = this.object;
    t.position.copy(s.position), t.quaternion.copy(s.quaternion), t.up.copy(s.up), t.isOrthographicCamera && (t.zoom = s.zoom), t.isPerspectiveCamera && s.fov && (t.fov = s.fov), t.updateProjectionMatrix(), this.object = t, this.activeCamera = e, this.update(), this._emitChange();
  }
  listCameras() {
    return [...this.cameras.keys()];
  }
  // --- Parameter management
  setParams(e = {}) {
    Object.assign(this, e);
  }
  getParams() {
    const e = {};
    for (const [t, s] of Object.entries(this.paramSchema))
      e[t] = this[t];
    return e;
  }
  resetSettings() {
    for (const [e, t] of Object.entries(this.paramSchema))
      this[e] = t.default;
    this._emitChange(), this.update();
  }
  // --- Built-in views
  _initDefaultViews() {
    const e = this.object.position.distanceTo(this.target), t = {
      position: this.object.position.clone(),
      quaternion: this.object.quaternion.clone(),
      target: this.target.clone(),
      up: this.object.up.clone(),
      zoom: this.object.zoom
    }, s = [
      { name: "front", pos: [0, 0, e], up: [0, 1, 0] },
      { name: "back", pos: [0, 0, -e], up: [0, 1, 0] },
      { name: "right", pos: [e, 0, 0], up: [0, 1, 0] },
      { name: "left", pos: [-e, 0, 0], up: [0, 1, 0] },
      { name: "top", pos: [0, e, 0], up: [0, 0, 1] },
      { name: "bottom", pos: [0, -e, 0], up: [0, 0, 1] }
    ];
    for (const { name: i, pos: n, up: r } of s)
      this.object.position.set(...n), this.object.up.set(...r), this.object.lookAt(this.target), this.saveView(i, !0);
    this.object.position.copy(t.position), this.object.quaternion.copy(t.quaternion), this.target.copy(t.target), this.object.up.copy(t.up), this.object.zoom = t.zoom, this.object.isOrthographicCamera && this.object.updateProjectionMatrix(), this.update();
  }
  _updateShiftState() {
    const e = window.event ? window.event.shiftKey : !1;
    e && !this._shiftDown ? (this._shiftDown = !0, this._storedRotateSpeed = this.rotateSpeed, this.rotateSpeed = 0) : !e && this._shiftDown && (this._shiftDown = !1, this.rotateSpeed = this._storedRotateSpeed);
  }
  update(...e) {
    this._updateShiftState(), super.update(...e);
  }
  view(e) {
    const t = this._views[e];
    t && (this.object.position.copy(t.position), this.object.quaternion.copy(t.quaternion), this.target.copy(t.target), this.object.up.copy(t.up), this.object.isOrthographicCamera ? this.object.zoom = t.zoom : this.object.fov = t.zoom, this.update(), this._emitChange());
  }
  saveView(e, t = !1) {
    this._views[e] = {
      position: this.object.position.clone(),
      quaternion: this.object.quaternion.clone(),
      target: this.target.clone(),
      up: this.object.up.clone(),
      zoom: this.object.zoom
    }, t && this._builtInViews.add(e), this._emitChange();
  }
  removeView(e) {
    this._builtInViews.has(e) || (delete this._views[e], this._emitChange());
  }
  // --- GUI helpers
  list() {
    return Object.keys(this._views);
  }
  listDetails() {
    return Object.entries(this._views).map(([e, t]) => ({
      name: e,
      builtIn: this._builtInViews.has(e),
      position: t.position.clone(),
      quaternion: t.quaternion.clone(),
      target: t.target.clone(),
      up: t.up.clone(),
      zoom: t.zoom
    }));
  }
  // --- Fit to scene
  fitToScene(e, t = {}) {
    const {
      lookAt: s = null,
      direction: i = [0, 0, 1],
      zoom: n = 1,
      fov: r = this.object.fov,
      padding: a = 10
    } = t, l = new Vector3(...i).normalize(), c = e.getBoundingBox(), h = s ? new Vector3(...s) : c.getCenter(new Vector3()), d = c.getSize(new Vector3()).length() + a;
    let u;
    this.object.isPerspectiveCamera ? u = d / (2 * Math.tan(r * Math.PI / 360)) : u = d, this.object.position.copy(h.clone().add(l.multiplyScalar(u))), this.target.copy(h), this.object.lookAt(h), this.object.isOrthographicCamera ? this.object.zoom = n : this.object.fov = r, this.object.updateProjectionMatrix(), this.update();
  }
  // --- Fit current camera positions
  fit(e) {
    if (!e || e.length === 0) return;
    let t = 1 / 0, s = 1 / 0, i = 1 / 0, n = -1 / 0, r = -1 / 0, a = -1 / 0;
    for (const y of e) {
      const f = y[0], w = y[1], b = y[2];
      f < t && (t = f), w < s && (s = w), b < i && (i = b), f > n && (n = f), w > r && (r = w), b > a && (a = b);
    }
    const l = new Vector3(
      (t + n) / 2,
      (s + r) / 2,
      (i + a) / 2
    ), c = n - t, h = r - s, d = a - i, u = Math.sqrt(c * c + h * h + d * d), p = this.object;
    let m;
    if (p.isPerspectiveCamera) {
      const y = p.fov * Math.PI / 180;
      m = u / 2 / Math.tan(y / 2);
    } else
      m = u;
    const g = p.position.clone().sub(this.target).normalize();
    this.target.copy(l), p.position.copy(l.clone().add(g.multiplyScalar(m))), p.updateProjectionMatrix(), this.update();
  }
  reset() {
    this._views.default && this.view("default");
  }
  // self contained state management
  exportState() {
    const e = this.object, t = e.position.toArray(), s = this.target.toArray(), i = t[0] - s[0], n = t[1] - s[1], r = t[2] - s[2], a = Math.sqrt(i * i + n * n + r * r), l = a > 0 ? [i / a, n / a, r / a] : [0, 0, 1];
    return {
      type: this.activeCamera,
      position: t,
      target: s,
      direction: l,
      distance: a,
      zoom: e.zoom,
      fov: e.fov,
      params: this.getParams()
    };
  }
  importState(e) {
    if (!e) return;
    e.type && this.setCamera(e.type);
    const t = this.object;
    e.position && t.position.fromArray(e.position), e.target && this.target.fromArray(e.target), t.isOrthographicCamera && e.zoom !== void 0 && (t.zoom = e.zoom), t.isPerspectiveCamera && e.fov !== void 0 && (t.fov = e.fov), t.updateProjectionMatrix(), this.update(), e.params && this.setParams(e.params);
  }
}
class CSS2DObject extends Object3D {
  constructor(e = document.createElement("div")) {
    super(), this.isCSS2DObject = !0, this.element = e, this.element.style.position = "absolute", this.element.style.userSelect = "none", this.element.setAttribute("draggable", !1), this.center = new Vector2(0.5, 0.5), this.addEventListener("removed", function() {
      this.traverse(function(t) {
        t.element instanceof Element && t.element.parentNode !== null && t.element.parentNode.removeChild(t.element);
      });
    });
  }
  copy(e, t) {
    return super.copy(e, t), this.element = e.element.cloneNode(!0), this.center = e.center, this;
  }
}
const _vector = new Vector3(), _viewMatrix = new Matrix4(), _viewProjectionMatrix = new Matrix4(), _a = new Vector3(), _b = new Vector3();
class CSS2DRenderer {
  constructor(e = {}) {
    const t = this;
    let s, i, n, r;
    const a = {
      objects: /* @__PURE__ */ new WeakMap()
    }, l = e.element !== void 0 ? e.element : document.createElement("div");
    l.style.overflow = "hidden", this.domElement = l, this.getSize = function() {
      return {
        width: s,
        height: i
      };
    }, this.render = function(m, g) {
      m.matrixWorldAutoUpdate === !0 && m.updateMatrixWorld(), g.parent === null && g.matrixWorldAutoUpdate === !0 && g.updateMatrixWorld(), _viewMatrix.copy(g.matrixWorldInverse), _viewProjectionMatrix.multiplyMatrices(g.projectionMatrix, _viewMatrix), h(m, m, g), p(m);
    }, this.setSize = function(m, g) {
      s = m, i = g, n = s / 2, r = i / 2, l.style.width = m + "px", l.style.height = g + "px";
    };
    function c(m) {
      m.isCSS2DObject && (m.element.style.display = "none");
      for (let g = 0, y = m.children.length; g < y; g++)
        c(m.children[g]);
    }
    function h(m, g, y) {
      if (m.visible === !1) {
        c(m);
        return;
      }
      if (m.isCSS2DObject) {
        _vector.setFromMatrixPosition(m.matrixWorld), _vector.applyMatrix4(_viewProjectionMatrix);
        const f = _vector.z >= -1 && _vector.z <= 1 && m.layers.test(y.layers) === !0, w = m.element;
        w.style.display = f === !0 ? "" : "none", f === !0 && (m.onBeforeRender(t, g, y), w.style.transform = "translate(" + -100 * m.center.x + "%," + -100 * m.center.y + "%)translate(" + (_vector.x * n + n) + "px," + (-_vector.y * r + r) + "px)", w.parentNode !== l && l.appendChild(w), m.onAfterRender(t, g, y));
        const b = {
          distanceToCameraSquared: d(y, m)
        };
        a.objects.set(m, b);
      }
      for (let f = 0, w = m.children.length; f < w; f++)
        h(m.children[f], g, y);
    }
    function d(m, g) {
      return _a.setFromMatrixPosition(m.matrixWorld), _b.setFromMatrixPosition(g.matrixWorld), _a.distanceToSquared(_b);
    }
    function u(m) {
      const g = [];
      return m.traverseVisible(function(y) {
        y.isCSS2DObject && g.push(y);
      }), g;
    }
    function p(m) {
      const g = u(m).sort(function(f, w) {
        if (f.renderOrder !== w.renderOrder)
          return w.renderOrder - f.renderOrder;
        const b = a.objects.get(f).distanceToCameraSquared, x = a.objects.get(w).distanceToCameraSquared;
        return b - x;
      }), y = g.length;
      for (let f = 0, w = g.length; f < w; f++)
        g[f].element.style.zIndex = y - f;
    }
  }
}
function toVector3(o, e = "value") {
  if (console.log("toVector3 called with value:", o), o instanceof THREE.Vector3)
    return o;
  if (Array.isArray(o) && o.length === 3)
    return new THREE.Vector3(o[0], o[1], o[2]);
  if (o && typeof o == "object" && "length" in o && o.length === 3)
    return new THREE.Vector3(...o);
  if (o && typeof o == "object" && "x" in o && "y" in o && "z" in o)
    return new THREE.Vector3(o.x, o.y, o.z);
  throw new Error(`${e} must be a THREE.Vector3, an [x,y,z] array, or an {x,y,z} object, got ${typeof o}`);
}
function toIndexArray(o, e = "indices") {
  if (o === null)
    throw new Error(`${e} must not be null`);
  return Array.isArray(o) ? o : [o];
}
function clearObjects(o, e = null) {
  [...o.children].forEach((s) => {
    e !== null && (!s.userData || s.userData.uuid !== e) || (s instanceof THREE.Group ? clearGroup(o, s) : !(s instanceof THREE.Camera) && !(s instanceof THREE.Light) && clearObject(o, s));
  });
}
function clearGroup(o, e) {
  e.children.forEach((t) => {
    t instanceof THREE.Group ? clearGroup(o, t) : clearObject(o, t);
  });
}
function clearObject(o, e) {
  e !== null && (e.children && e.remove(...e.children), e.geometry && e.geometry.dispose(), e.material && (Array.isArray(e.material) ? e.material.forEach((t) => t.dispose()) : e.material.dispose()), o.remove(e));
}
function getWorldPositionFromScreen(o, e, t) {
  const s = new THREE.Raycaster();
  s.setFromCamera(e, o);
  const i = new THREE.Vector3();
  return s.ray.intersectPlane(t, i), i;
}
function convertToMatrixFromABCAlphaBetaGamma(o) {
  const [e, t, s, i, n, r] = o, a = i * Math.PI / 180, l = n * Math.PI / 180, c = r * Math.PI / 180, h = e, d = 0, u = 0, p = t * Math.cos(c), m = t * Math.sin(c), g = 0, y = s * Math.cos(l), f = s * (Math.cos(a) - Math.cos(l) * Math.cos(c)) / Math.sin(c), w = Math.sqrt(s * s - y * y - f * f);
  return [
    [h, d, u],
    [p, m, g],
    [y, f, w]
  ];
}
function calculateCartesianCoordinates(o, e) {
  return o = o[0].map((t, s) => o.map((i) => i[s])), multiplyMatrixVector(o, e);
}
function multiplyMatrixVector(o, e) {
  const t = [];
  for (let s = 0; s < o.length; s++) {
    let i = 0;
    for (let n = 0; n < o[s].length; n++)
      i += o[s][n] * e[n];
    t.push(i);
  }
  return t;
}
function calculateInverseMatrix(o) {
  const e = o[0][0] * (o[1][1] * o[2][2] - o[1][2] * o[2][1]) - o[0][1] * (o[1][0] * o[2][2] - o[1][2] * o[2][0]) + o[0][2] * (o[1][0] * o[2][1] - o[1][1] * o[2][0]);
  if (e === 0)
    throw new Error("Matrix has zero determinant, cannot calculate inverse.");
  const t = 1 / e;
  return [
    [
      (o[1][1] * o[2][2] - o[1][2] * o[2][1]) * t,
      (o[0][2] * o[2][1] - o[0][1] * o[2][2]) * t,
      (o[0][1] * o[1][2] - o[0][2] * o[1][1]) * t
    ],
    [
      (o[1][2] * o[2][0] - o[1][0] * o[2][2]) * t,
      (o[0][0] * o[2][2] - o[0][2] * o[2][0]) * t,
      (o[0][2] * o[1][0] - o[0][0] * o[1][2]) * t
    ],
    [
      (o[1][0] * o[2][1] - o[1][1] * o[2][0]) * t,
      (o[0][1] * o[2][0] - o[0][0] * o[2][1]) * t,
      (o[0][0] * o[1][1] - o[0][1] * o[1][0]) * t
    ]
  ];
}
function calculateQuaternion(o, e) {
  const t = new THREE.Matrix4().lookAt(o, e, new THREE.Object3D().up), s = new THREE.Quaternion().setFromRotationMatrix(t), i = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
  return s.multiply(i), s;
}
function createLabel(o, e, t = "black", s = "14px", i = "axis-label") {
  const n = document.createElement("div");
  n.className = i, n.textContent = e, n.style.color = t, n.style.fontSize = s;
  const r = new CSS2DObject(n);
  return r.position.copy(o), r;
}
class WeasScene extends THREE.Scene {
  constructor(e) {
    super(), this.tjs = e, this._boundingBox = new THREE.Box3(), this._center = new THREE.Vector3(), this._size = new THREE.Vector3(), this.objectGroups = {};
  }
  // --- Object management ---
  addObject(e, t = null) {
    return super.add(e), t && this.objectGroups[t] && this.objectGroups[t].push(e), this.dispatchObjectEvent({
      data: e.toJSON(),
      action: "add",
      catalog: "object",
      group: t
    }), this.updateBoundingBox(), e;
  }
  removeObject(e, t = null) {
    if (typeof e == "string" && (e = this.getObjectByProperty("uuid", e), !e)) {
      console.warn("Object not found");
      return;
    }
    if (super.remove(e), t && this.objectGroups[t]) {
      const s = this.objectGroups[t].indexOf(e);
      s > -1 && this.objectGroups[t].splice(s, 1);
    }
    return this.dispatchObjectEvent({
      data: e.toJSON(),
      action: "remove",
      catalog: "object",
      group: t
    }), this.updateBoundingBox(), e;
  }
  removeGroup(e) {
    if (!e) return;
    const t = [];
    this.traverse((s) => {
      s.group === e && t.push(s);
    }), t.forEach((s) => this.remove(s));
  }
  dispatchObjectEvent(e) {
    const t = new CustomEvent("weas", { detail: e });
    this.tjs.containerElement.dispatchEvent(t);
  }
  clear() {
    clearObjects(this), Object.keys(this.objectGroups).forEach(
      (e) => this.objectGroups[e] = []
    ), this.updateBoundingBox();
  }
  dispatchObjectEvent(e) {
    const t = new CustomEvent("weas", { detail: e });
    this.tjs.containerElement.dispatchEvent(t);
  }
  // --- Bounding box helpers ---
  updateBoundingBox() {
    this._boundingBox.makeEmpty(), this.traverse((e) => {
      if (e.isMesh || e.isLineSegments || e.isInstancedMesh) {
        let t = new THREE.Box3();
        if (e.isInstancedMesh) {
          if (e.count === 0) return;
          e.computeBoundingBox(), t.copy(e.boundingBox);
        } else
          e.geometry.computeBoundingBox(), t.copy(e.geometry.boundingBox);
        t.applyMatrix4(e.matrixWorld), this._boundingBox.union(t);
      }
    }), this._center.copy(this._boundingBox.getCenter(new THREE.Vector3())), this._size.copy(this._boundingBox.getSize(new THREE.Vector3()));
  }
  getBoundingBox() {
    return this._boundingBox.clone();
  }
  getCenter() {
    return this._center.clone();
  }
  getSize() {
    return this._size.clone();
  }
  getProjectedBoundingBox(e = [0, 0, 1]) {
    e = new THREE.Vector3(...e).normalize();
    const t = new THREE.Box3();
    if (this.traverse((l) => {
      if (l.isMesh || l.isLineSegments || l.isInstancedMesh) {
        l.geometry.computeBoundingBox();
        const c = l.geometry.boundingBox.clone().applyMatrix4(l.matrixWorld);
        t.union(c);
      }
    }), t.isEmpty()) return new THREE.Vector3(0, 0, 0);
    const s = [
      new THREE.Vector3(t.min.x, t.min.y, t.min.z),
      new THREE.Vector3(t.min.x, t.min.y, t.max.z),
      new THREE.Vector3(t.min.x, t.max.y, t.min.z),
      new THREE.Vector3(t.min.x, t.max.y, t.max.z),
      new THREE.Vector3(t.max.x, t.min.y, t.min.z),
      new THREE.Vector3(t.max.x, t.min.y, t.max.z),
      new THREE.Vector3(t.max.x, t.max.y, t.min.z),
      new THREE.Vector3(t.max.x, t.max.y, t.max.z)
    ], i = new THREE.Matrix4().lookAt(
      e,
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 1, 0)
    );
    let n = new THREE.Vector3(1 / 0, 1 / 0, 1 / 0), r = new THREE.Vector3(-1 / 0, -1 / 0, -1 / 0);
    s.forEach((l) => {
      const c = l.clone().applyMatrix4(i);
      n.min(c), r.max(c);
    });
    const a = new THREE.Vector3();
    return a.subVectors(r, n), a;
  }
}
class OrthographicCamera extends THREE.OrthographicCamera {
  constructor(e, t, s, i, n, r, a = null) {
    super(e, t, s, i, n, r), this.tjs = a;
  }
  // Custom method to update zoom
  updateZoom(e) {
    this.zoom !== e && (this.zoom = e, this.updateProjectionMatrix(), this.dispatchObjectEvent({
      data: e,
      action: "zoom",
      catalog: "camera"
    }));
  }
  // Custom method to update position
  updatePosition(e, t, s) {
    const i = new THREE.Vector3(e, t, s);
    this.position.equals(i) || (this.position.copy(i), this.updateProjectionMatrix(), this.dispatchObjectEvent({
      data: [e, t, s],
      action: "position",
      catalog: "camera"
    }));
  }
  dispatchObjectEvent(e) {
    const t = new CustomEvent("weas", { detail: e });
    this.tjs.containerElement.dispatchEvent(t), this.tjs && typeof this.tjs.requestRedraw == "function" ? this.tjs.requestRedraw("render") : this.tjs.render();
  }
}
const defaultViewerSettings = {
  modelStyle: 0,
  // Default viz type
  colorBy: "Element",
  // Default color by
  colorType: "JMOL",
  colorRamp: ["red", "blue"],
  radiusType: "Covalent",
  materialType: "Standard",
  atomLabelType: "None",
  showBondedAtoms: !1,
  bondSettings: {
    hideLongBonds: !0,
    showHydrogenBonds: !1,
    showOutBoundaryBonds: !1
  },
  cellSettings: {
    showCell: !0,
    // Show unit cell
    showAxes: !0,
    // Show cell axes
    cellColor: 0,
    // Default cell line color (black)
    cellLineWidth: 2,
    // Default line width
    axisColors: { a: 16711680, b: 65280, c: 255 },
    // RGB colors for axes
    axisRadius: 0.15,
    // Default axis cylinder radius
    axisConeHeight: 0.8,
    // Cone height for axis arrows
    axisConeRadius: 0.3,
    // Cone radius for axis arrows
    axisSphereRadius: 0.3
    // Sphere radius at the cell origin
  },
  boundary: [
    [0, 1],
    [0, 1],
    [0, 1]
  ],
  atomScale: 0.4,
  // Default atom scale
  wrapOnMove: !1,
  // Wrap atoms into the unit cell after moving
  backgroundColor: "#ffffff",
  // Default background color (white)
  logLevel: "warn",
  // Default log level
  continuousUpdate: !0,
  // Default continuous update
  autoResetCameraOnAtomsUpdate: !1
  // Default to preserving view on atoms updates
}, defaultTjsConfig = {
  renderConfig: {
    alpha: !0,
    antialias: !0,
    depth: !0,
    preserveDrawingBuffer: !0
  }
}, defaultKeyBindConfig = {
  // handler operations
  SearchOperation: [["ctrl", "f"]],
  exitMode: [["Escape"]],
  // history management
  undo: [["ctrl", "z"]],
  redo: [["ctrl", "y"]],
  adjustLastOperation: [["F9"], ["l"]],
  // transformation methods
  DeleteOperation: [["x"], ["Delete"]],
  enterObjectMode: [["o"]],
  enterEditMode: [["e"]],
  TranslateOperation: [["g"]],
  ScaleOperation: [["s"]],
  RotateOperation: [["r"]],
  CopyOperation: [["d"]],
  ReplaceOperation: [["c"]],
  // measuring
  measure: [["m"]],
  // camera methods
  camera1: [["1"]],
  camera2: [["2"]],
  camera3: [["3"]],
  camera4: [["4"]],
  camera5: [["5"]],
  camera6: [["6"]]
}, defaultGuiConfig = {
  controls: {
    enabled: !0,
    atomsControl: !0,
    colorControl: !0,
    cameraControls: !0,
    meshControls: !1
  },
  timeline: {
    enabled: !0
    // Added this line to control timeline visibility
  },
  atomLegend: {
    enabled: !1,
    position: "bottom-right"
    // Options: 'top-right', 'top-left', 'bottom-right', 'bottom-left'
  },
  meshLegend: {
    enabled: !0,
    position: "bottom-left"
    // Options: 'top-right', 'top-left', 'bottom-right', 'bottom-left'
  },
  buttons: {
    enabled: !0,
    fullscreen: !0,
    undo: !0,
    redo: !0,
    export: !0,
    import: !0,
    measurement: !0
  },
  buttonStyle: {
    // Added this object to allow button style customization
    fontSize: "12px",
    color: "#39424e",
    backgroundColor: "#ffffff",
    border: "1px solid #dfe3eb",
    padding: "2px 6px",
    cursor: "pointer",
    borderRadius: "6px"
  }
}, MODEL_STYLE_MAP = {
  Ball: 0,
  "Ball + Stick": 1,
  Polyhedra: 2,
  Stick: 3,
  Line: 4
}, colorTypes = {
  CPK: "CPK",
  VESTA: "VESTA",
  JMOL: "JMOL"
}, colorBys = {
  Element: "Element",
  Index: "Index",
  Random: "Random",
  Uniform: "Uniform"
}, radiusTypes = {
  Covalent: "Covalent",
  VDW: "VDW"
}, LEGEND_SHAPE_BASE_STYLE = {
  display: "block"
};
function applyStyle(o, e) {
  Object.assign(o.style, e);
}
class LegendHUD {
  static schema = {
    fontFamily: { type: "string", default: "sans-serif", label: "Font Family" },
    fontSize: {
      type: "number",
      min: 8,
      max: 36,
      step: 1,
      default: 20,
      label: "Label Font Size"
    },
    headingFontSize: {
      type: "number",
      min: 10,
      max: 48,
      step: 1,
      default: 24,
      label: "Heading Font Size"
    },
    iconSize: {
      type: "number",
      min: 4,
      max: 48,
      step: 1,
      default: 16,
      label: "Icon Size"
    },
    rowGap: {
      type: "number",
      min: 0,
      max: 20,
      step: 1,
      default: 6,
      label: "Row Gap"
    },
    columnGap: {
      type: "number",
      min: 0,
      max: 30,
      step: 1,
      default: 10,
      label: "Column Gap"
    },
    panelPadding: {
      type: "number",
      min: 0,
      max: 20,
      step: 1,
      default: 6,
      label: "Panel Padding"
    },
    panelBackground: {
      type: "color",
      default: "rgba(0,0,0,0.1)",
      label: "Color"
    },
    panelBorderRadius: {
      type: "number",
      min: 0,
      max: 20,
      step: 1,
      default: 5,
      label: "Panel Border Radius"
    },
    heading: { type: "string", default: "Legend", label: "Heading Text" }
  };
  constructor(e, t = {}) {
    this.hud = e, this.settings = {};
    for (const [s, i] of Object.entries(LegendHUD.schema))
      this.settings[s] = (t.settings && t.settings[s]) ?? i.default;
    this.config = Object.assign(
      {
        position: "bottom-right",
        panelKey: "legend"
      },
      t
    ), this.entries = /* @__PURE__ */ new Map(), this.container = document.createElement("div"), this._applyContainerStyle(), this.settings.heading && (this.headingEl = document.createElement("div"), this.headingEl.textContent = this.settings.heading, this.headingEl.style.fontSize = `${this.settings.headingFontSize}px`, this.headingEl.style.marginBottom = `${this.settings.rowGap}px`, this.container.appendChild(this.headingEl)), this.hud.addHTMLPanel(this.config.panelKey, this.container, {
      anchor: this.config.position,
      offset: { x: 0, y: 0 }
    });
  }
  _applyContainerStyle() {
    Object.assign(this.container.style, {
      display: "flex",
      flexDirection: "column",
      gap: `${this.settings.rowGap}px`,
      padding: `${this.settings.panelPadding}px`,
      backgroundColor: this.settings.panelBackground,
      borderRadius: `${this.settings.panelBorderRadius}px`,
      fontFamily: this.settings.fontFamily,
      fontSize: `${this.settings.fontSize}px`
    });
  }
  addEntry(e, { label: t, color: s = "#888", shape: i = "circle", size: n = 16 }) {
    this.entries.has(e) && this.removeEntry(e);
    const r = n * (this.settings.iconSize / 16), a = this._createShape(i, s, r);
    a.dataset.baseSize = n;
    const l = document.createElement("span");
    l.textContent = t;
    const c = document.createElement("div");
    Object.assign(c.style, {
      display: "flex",
      alignItems: "center",
      gap: `${this.settings.columnGap}px`
    }), c.appendChild(a), c.appendChild(l), this.container.appendChild(c), this.entries.set(e, c);
  }
  _createShape(e, t, s) {
    const i = document.createElement("div");
    switch (applyStyle(i, LEGEND_SHAPE_BASE_STYLE), i.style.width = `${s}px`, i.style.height = `${s}px`, e) {
      case "sphere":
        i.style.borderRadius = "50%", i.style.background = `radial-gradient(circle at 30% 30%, #ffffffaa, ${t} 65%, #00000044)`;
        break;
      case "cube":
        i.style.background = `linear-gradient(145deg, #ffffff55, ${t})`, i.style.boxShadow = "inset -2px -2px 3px rgba(0,0,0,0.4)";
        break;
      case "square":
        i.style.background = t, i.style.borderRadius = "2px";
        break;
      default:
        i.style.background = t, i.style.borderRadius = "50%";
    }
    return i;
  }
  removeEntry(e) {
    const t = this.entries.get(e);
    t && (t.remove(), this.entries.delete(e));
  }
  clear() {
    this.entries.forEach((e) => e.remove()), this.entries.clear();
  }
  updateSettings(e) {
    Object.assign(this.settings, e), this._applyContainerStyle(), this.entries.forEach((t) => {
      t.style.gap = `${this.settings.columnGap}px`;
      const s = t.querySelector("span");
      s && (s.style.fontSize = `${this.settings.fontSize}px`);
      const i = t.querySelector("div");
      if (i && i.dataset.baseSize) {
        const r = parseFloat(i.dataset.baseSize) * (this.settings.iconSize / 16);
        i.style.width = i.style.height = `${r}px`;
      }
    }), this.headingEl && (this.headingEl.style.fontSize = `${this.settings.headingFontSize}px`);
  }
  getSchema() {
    return LegendHUD.schema;
  }
}
const toolbarIcons = {
  undo: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" 
    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 14 4 9l5-5"/>
      <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/>
    </svg>
  `,
  redo: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m15 14 5-5-5-5"/>
      <path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13"/>
    </svg>`,
  fullscreen: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m15 15 6 6"/>
      <path d="m15 9 6-6"/>
      <path d="M21 16v5h-5"/>
      <path d="M21 8V3h-5"/>
      <path d="M3 16v5h5"/>
      <path d="m3 21 6-6"/>
      <path d="M3 8V3h5"/>
      <path d="M9 9 3 3"/>
    </svg>`,
  measure: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/>
      <path d="m14.5 12.5 2-2"/>
      <path d="m11.5 9.5 2-2"/>
      <path d="m8.5 6.5 2-2"/>
      <path d="m17.5 15.5 2-2"/>
    </svg>`
};
class ToolbarHUD {
  constructor(e, t, s = {}) {
    this.weas = e, this.hud = t, this.settings = Object.assign(
      {
        height: 40,
        panelBackground: "rgba(255, 255, 255, 0)",
        panelBorderRadius: 20,
        gap: 6,
        paddingX: "0px",
        paddingY: "0px",
        anchor: "top-right",
        offset: { x: 0, y: 0 }
      },
      s.settings || {}
    ), this.config = Object.assign({ panelKey: "toolbar" }, s), this.buttons = /* @__PURE__ */ new Map(), this.container = document.createElement("div"), Object.assign(this.container.style, {
      height: `${this.settings.height}px`,
      backgroundColor: this.settings.panelBackground,
      borderRadius: `${this.settings.panelBorderRadius}px`,
      display: "flex",
      alignItems: "center",
      padding: `${this.settings.paddingY} ${this.settings.paddingX}`,
      gap: `${this.settings.gap}px`,
      userSelect: "none",
      pointerEvents: "auto",
      zIndex: "200"
    }), this.hud.addHTMLPanel(this.config.panelKey, this.container, {
      anchor: this.settings.anchor,
      offset: this.settings.offset
    }), this._initDefaultButtons();
  }
  _initDefaultButtons() {
    this.addButton("undo", {
      label: "Undo",
      hint: "Undo last action",
      onClick: () => {
        this.weas?.ops?.undo && this.weas.ops.undo();
      }
    }), this.addButton("redo", {
      label: "Redo",
      hint: "Redo last action",
      onClick: () => {
        this.weas?.ops?.redo && this.weas.ops.redo();
      }
    }), this.addButton("fullscreen", {
      label: "Full",
      hint: "Toggle fullscreen",
      onClick: () => {
        const e = weas;
        e && (document.fullscreenElement ? document.exitFullscreen().catch((t) => {
          console.error("Exit fullscreen failed:", t);
        }) : e.requestFullscreen().catch((t) => {
          console.error("Fullscreen failed:", t);
        }));
      }
    }), this.addButton("measure", {
      hint: "Measure selection",
      onClick: () => {
        this.weas.avr.Measurement.measure(this.weas.avr.selectedAtomsIndices);
      }
    });
  }
  addButton(e, { label: t = "", hint: s = "", onClick: i } = {}) {
    this.buttons.has(e) && this.removeButton(e);
    const n = document.createElement("button");
    if (n.classList.add("weas-toolbar-button"), toolbarIcons[e]) {
      const r = document.createElement("span");
      r.innerHTML = toolbarIcons[e], n.appendChild(r);
    } else
      n.textContent = t || e;
    s && (n.title = s), Object.assign(n.style, {
      border: "solid 1px rgba(205, 205, 205, 0.75)",
      background: "rgba(239, 239, 239, 0.5)",
      borderRadius: "4px",
      padding: "4px 8px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }), i && n.addEventListener("click", i), n.addEventListener("pointerdown", (r) => r.stopPropagation()), n.addEventListener("pointerup", (r) => r.stopPropagation()), this.container.appendChild(n), this.buttons.set(e, n);
  }
  removeButton(e) {
    const t = this.buttons.get(e);
    t && (t.remove(), this.buttons.delete(e));
  }
  clear() {
    this.buttons.forEach((e) => e.remove()), this.buttons.clear();
  }
  setVisible(e) {
    this.container.style.display = e ? "flex" : "none";
  }
}
class HUDController {
  constructor(e, t, s) {
    this.weas = e, this.container = document.createElement("div"), this.container.style.position = "absolute", this.container.style.top = "0", this.container.style.left = "0", this.container.style.width = "100%", this.container.style.height = "100%", this.container.style.pointerEvents = "none", t.appendChild(this.container), this.htmlElements = /* @__PURE__ */ new Map(), this.miniScenes = /* @__PURE__ */ new Map(), this.renderer = s, this.legendHUD = new LegendHUD(this, { position: "bottom-right" }), this.ToolbarHUD = new ToolbarHUD(this.weas, this, {
      position: "top-right"
    }), window.addEventListener("resize", () => this.update()), this.ANCHORS = [
      "top-left",
      "top-right",
      "bottom-left",
      "bottom-right",
      "center"
    ];
  }
  // defines space cartesian axis, -- useful for rotational overlays
  initCoordScene() {
    const e = new THREE.Scene();
    e.add(new THREE.AmbientLight(16777215, 2));
    const t = new THREE.DirectionalLight(16777215, 2);
    t.position.set(10, 10, 10), e.add(t);
    const s = new THREE.AxesHelper(0.5), i = new THREE.Group();
    i.add(s), e.add(i);
    const n = new THREE.OrthographicCamera(-2.5, 2.5, 2.5, -2.5, 0.1, 100);
    n.position.set(0, 0, 5), n.lookAt(0, 0, 0), this.coordAxesGroup = i, this.addMiniScene(
      "coord",
      e,
      n,
      { width: 200, height: 200 },
      { bottom: 10, left: 10 },
      !0,
      !0
    );
  }
  addMiniScene(e, t, s, i = { width: 150, height: 150 }, n = { top: 10, left: 10 }, r = !1, a = !0) {
    const l = document.createElement("canvas");
    l.width = i.width, l.height = i.height, l.style.position = "absolute", l.style.pointerEvents = "none", this.container.appendChild(l), this.miniScenes.set(e, {
      scene: t,
      camera: s,
      canvas: l,
      width: i.width,
      height: i.height,
      position: { ...n },
      rotation: r,
      visible: a
    }), this.setMiniScenePosition(e, n);
  }
  // HTML handling
  addHTMLPanel(e, t, s = {}) {
    const {
      width: i,
      height: n,
      anchor: r = "top-left",
      // new default anchor
      offset: a = { x: 0, y: 0 },
      // x/y offsets from the anchor
      visible: l = !0
    } = s;
    t.style.position = "absolute", t.style.display = l ? "flex" : "none", i && (t.style.width = i + "px"), n && (t.style.height = n + "px"), this.container.appendChild(t), this.htmlElements.set(e, {
      element: t,
      width: i || t.offsetWidth,
      height: n || t.offsetHeight,
      anchor: r,
      offset: { ...a },
      visible: l
    }), this._updateHTMLPosition(e);
  }
  addPanel(e, t, s) {
    this.addHTMLPanel(e, t, s);
  }
  getPresetPosition(e, t = 10) {
    const s = this.container.clientWidth, i = this.container.clientHeight;
    switch (e) {
      case "top-left":
        return { top: t, left: t };
      case "top-right":
        return { top: t, left: s - t };
      case "bottom-left":
        return { top: i - t, left: t };
      case "bottom-right":
        return { top: i - t, left: s - t };
      default:
        return { top: t, left: t };
    }
  }
  setHTMLPosition(e, t) {
    const s = this.htmlElements.get(e);
    s && (s.position = { ...s.position, ...t }, this._applyPosition(s.element, s.position));
  }
  setHTMLPanelVisible(e, t) {
    const s = this.htmlElements.get(e);
    s && (s.visible = t, s.element.style.display = t ? "flex" : "none");
  }
  render(e) {
    this.miniScenes.forEach(({ scene: t, camera: s, canvas: i, rotation: n, visible: r }) => {
      if (!r || !i.width || !i.height) return;
      n && this.coordAxesGroup && this.coordAxesGroup.quaternion.copy(e.quaternion).invert();
      const a = i.getBoundingClientRect(), l = this.container.getBoundingClientRect(), c = a.left - l.left, h = l.height - (a.top - l.top) - i.height, d = this.renderer, u = new THREE.Vector4();
      d.getViewport(u), d.setViewport(c, h, i.width, i.height), d.setScissor(c, h, i.width, i.height), d.setScissorTest(!0), d.render(t, s), d.setViewport(
        u.x,
        u.y,
        u.z,
        u.w
      ), d.setScissorTest(!1);
    });
  }
  // TODO, make this pass a refire feedback to main three JS
  update() {
  }
  // List all mini-scenes and HTML elements by key
  list() {
    const e = Array.from(this.miniScenes.keys()), t = Array.from(this.htmlElements.keys());
    return { miniScenes: e, htmlElements: t };
  }
  // Detailed info about each HUD element
  listDetails() {
    const e = {};
    this.miniScenes.forEach((s, i) => {
      e[i] = {
        width: s.canvas.width,
        height: s.canvas.height,
        position: s.position || {
          top: parseInt(s.canvas.style.top || 0),
          left: parseInt(s.canvas.style.left || 0)
        },
        scene: s.scene,
        camera: s.camera
      };
    });
    const t = {};
    return this.htmlElements.forEach((s, i) => {
      t[i] = {
        width: s.offsetWidth,
        height: s.offsetHeight,
        position: {
          top: parseInt(s.style.top || 0),
          left: parseInt(s.style.left || 0)
        },
        element: s
      };
    }), { miniScenes: e, htmlElements: t };
  }
  getTopLeft(e) {
    const t = this.miniScenes.get(e);
    if (!t) return { top: 0, left: 0 };
    const s = this.container.clientHeight, i = t.position.top != null ? t.position.top : t.position.bottom != null ? s - t.position.bottom - t.height : 0, n = t.position.left != null ? t.position.left : 0;
    return { top: i, left: n };
  }
  getHTMLTopLeft(e) {
    const t = this.htmlElements.get(e);
    return t ? {
      top: t.position.top != null ? t.position.top : 0,
      left: t.position.left != null ? t.position.left : 0
    } : { top: 0, left: 0 };
  }
  // Move an existing mini-scene
  setMiniScenePosition(e, t) {
    const s = this.miniScenes.get(e);
    s && (s.position = { ...s.position, ...t }, this._applyPosition(s.canvas, s.position));
  }
  // Mini-scene visibility
  setMiniSceneVisible(e, t) {
    const s = this.miniScenes.get(e);
    s && (s.visible = t, s.canvas.style.display = t ? "" : "none");
  }
  // HTML element visibility
  setHTMLElementVisible(e, t) {
    const s = this.htmlElements.get(e);
    s && (s.visible = t, s.style.display = t ? "" : "none");
  }
  // Helper to apply CSS from position object
  _applyPosition(e, t) {
    t.top !== void 0 && (e.style.top = t.top + "px", e.style.bottom = ""), t.left !== void 0 && (e.style.left = t.left + "px", e.style.right = ""), t.bottom !== void 0 && (e.style.bottom = t.bottom + "px", e.style.top = ""), t.right !== void 0 && (e.style.right = t.right + "px", e.style.left = "");
  }
  _updateHTMLPosition(e) {
    const t = this.htmlElements.get(e);
    if (!t) return;
    const { element: s, anchor: i, offset: n } = t;
    switch (s.style.top = "", s.style.bottom = "", s.style.left = "", s.style.right = "", s.style.transform = "", i) {
      case "top-left":
        s.style.top = `${n.y}%`, s.style.left = `${n.x}%`;
        break;
      case "top-right":
        s.style.top = `${n.y}%`, s.style.right = `${n.x}%`;
        break;
      case "bottom-left":
        s.style.bottom = `${n.y}%`, s.style.left = `${n.x}%`;
        break;
      case "bottom-right":
        s.style.bottom = `${n.y}%`, s.style.right = `${n.x}%`;
        break;
      case "center":
        s.style.top = `calc(50% + ${n.y}%)`, s.style.left = `calc(50% + ${n.x}%)`, s.style.transform = "translate(-50%, -50%)";
        break;
    }
  }
}
class BlendJSObject {
  constructor(e, t, s) {
    this.name = e, this.geometry = t, this.material = s, this.object3D = new THREE.Mesh(t, s);
  }
}
class BlendJSMaterial {
  constructor(e, t) {
    this.name = e, this.material = t;
  }
}
class BlendJSMesh {
  constructor(e, t) {
    this.name = e, this.geometry = t;
  }
}
class BlendJSLight {
  constructor(e, t) {
    this.name = e, this.light = t;
  }
}
class BlendJSRenderer {
  constructor(e, t) {
    this.name = e, this.renderer = t;
  }
}
class BlendJS {
  constructor(e, t) {
    this.containerElement = e, this.tjsConfig = t.tjsConfig || defaultTjsConfig, this.weas = t, this.scene = new WeasScene(this), this.objects = {}, this.materials = {}, this.meshes = {}, this.lights = {}, this.renderers = {}, this._cameraType = "Orthographic", this.sceneView = { left: 0, bottom: 0, width: 1, height: 1 }, this.init(), this.hud = new HUDController(
      this.weas,
      this.containerElement,
      this.renderers.MainRenderer.renderer
    ), this.hud.initCoordScene(this.camera);
  }
  get cameraType() {
    return this._cameraType;
  }
  set cameraType(e) {
    this._cameraType = e, this.cameraController = new CameraController(
      this.camera,
      this.renderers.MainRenderer.renderer.domElement
    );
  }
  get camera() {
    if (this._cameraType === "Orthographic")
      return this.orthographicCamera;
  }
  init() {
    this.scene.background = new THREE.Color(16777215);
    const e = this?.tjsConfig?.renderConfig || defaultTjsConfig.renderConfig, t = new THREE.WebGLRenderer(e);
    t.autoClear = !1;
    const s = this.containerElement.getBoundingClientRect(), i = this.containerElement.clientWidth || s.width || 1, n = this.containerElement.clientHeight || s.height || 1;
    t.setSize(i, n), t.setPixelRatio(window.devicePixelRatio), this.addRenderer("MainRenderer", t);
    const r = new CSS2DRenderer();
    r.setSize(i, n), r.domElement.style.position = "absolute", r.domElement.style.top = "0px", r.domElement.style.pointerEvents = "none", this.addRenderer("LabelRenderer", r);
    const a = 20, l = i / n, c = a / 2, h = c * l;
    this.orthographicCamera = new OrthographicCamera(
      -h,
      // left
      h,
      // right
      c,
      // top
      -c,
      // bottom
      1,
      // near clipping plane
      2e3,
      // far clipping plane
      this
    ), this.orthographicCamera.layers.enable(1), this.camera.position.set(0, -100, 0), this.camera.lookAt(0, 0, 0), this.scene.add(this.camera);
    const d = new THREE.DirectionalLight(16777215, 2);
    d.position.set(50, 50, 100), this.addLight("MainLight", d), this.camera.add(d);
    const u = new THREE.AmbientLight(4210752, 20);
    this.addLight("AmbientLight", u), this.cameraController = new CameraController(
      this.camera,
      t.domElement
    ), this.cameraController.onChange(() => {
      this.render();
    }), this.updateViewerRect(), this.observeContainerResize(), window.addEventListener("resize", this.onWindowResize.bind(this), !1), this.containerElement.addEventListener("mousemove", this.render.bind(this)), this.containerElement.addEventListener("pointerup", this.render.bind(this)), this.containerElement.addEventListener(
      "pointerdown",
      this.render.bind(this)
    ), this.containerElement.addEventListener("click", this.render.bind(this)), this.containerElement.addEventListener("wheel", this.render.bind(this)), this.containerElement.addEventListener(
      "atomsUpdated",
      this.render.bind(this)
    );
  }
  observeContainerResize() {
    console.log("Observing container resize"), typeof ResizeObserver == "function" && (this._lastObservedSize = { width: 0, height: 0 }, this._resizeObserver = new ResizeObserver((e) => {
      const t = e[0];
      if (!t)
        return;
      const { width: s, height: i } = t.contentRect || {};
      !s || !i || s === this._lastObservedSize.width && i === this._lastObservedSize.height || (this._lastObservedSize = { width: s, height: i }, console.log("Container resized:", s, i), !this._resizeRaf && (this._resizeRaf = requestAnimationFrame(() => {
        this._resizeRaf = null, this.onWindowResize();
      })));
    }), this._resizeObserver.observe(this.containerElement));
  }
  updateViewerRect() {
    return this.viewerRect = this.containerElement.getBoundingClientRect(), this.viewerRect;
  }
  addObject(e, t, s) {
    const i = new BlendJSObject(e, t, s);
    return this.objects[e] = i, this.scene.add(i.object3D), i;
  }
  // Methods for managing materials, meshes, lights, cameras
  addMaterial(e, t) {
    const s = new BlendJSMaterial(e, t);
    return this.materials[e] = s, s;
  }
  addMesh(e, t) {
    const s = new BlendJSMesh(e, t);
    return this.meshes[e] = s, s;
  }
  addLight(e, t) {
    const s = new BlendJSLight(e, t);
    return this.lights[e] = s, this.scene.add(s.light), s;
  }
  // Method to add a renderer
  addRenderer(e, t) {
    this.containerElement.appendChild(t.domElement);
    const s = new BlendJSRenderer(e, t);
    return this.renderers[e] = s, s;
  }
  onWindowResize() {
    const e = this.containerElement.getBoundingClientRect(), t = this.containerElement.clientWidth || e.width, s = this.containerElement.clientHeight || e.height;
    if (!(!t || !s)) {
      if (this.camera.isOrthographicCamera) {
        const i = t / s, n = this.camera.top - this.camera.bottom;
        this.camera.left = -n * i / 2, this.camera.right = n * i / 2;
      } else
        this.camera.aspect = t / s;
      this.camera.updateProjectionMatrix(), Object.values(this.renderers).forEach((i) => {
        i.renderer.setSize(t, s);
      }), this.updateViewerRect(), this.render();
    }
  }
  // now managed fully inside cameraControls
  // TODO, this sort of thing should not be handled here
  updateCameraAndControls({
    lookAt: e = null,
    direction: t = [0, 0, 1],
    zoom: s = 1,
    fov: i = 50,
    padding: n = 10
  }) {
    this.cameraController.fitToScene(this.scene, {
      lookAt: e,
      direction: t,
      zoom: s,
      fov: i,
      padding: n
    });
  }
  renderSceneInfo(e, t, s, i, n, r, a) {
    const l = a.getSize(new THREE.Vector2());
    var c = Math.floor(l.width * s), h = Math.floor(l.height * i), d = Math.floor(l.width * n), u = Math.floor(l.height * r);
    a.setViewport(c, h, d, u), a.setScissor(c, h, d, u), a.setScissorTest(!1), a.render(e, t);
  }
  // I think this is managing text, labels, selection and highlighting
  // it also presumes the existence of avr, which is suggests a two-way binding
  // TODO - move this away and right some sort of hook pattern
  render() {
    this.cameraController.update(), this.renderers.MainRenderer.renderer.clear(), this.weas?.textManager?.updateLabelSizes?.(
      this.camera,
      this.renderers.MainRenderer.renderer
    ), this.weas?.avr?.ALManager?.updateLabelSizes?.(
      this.camera,
      this.renderers.MainRenderer.renderer
    ), this.weas?.avr?.highlightManager?.updateLabelSizes?.(
      this.camera,
      this.renderers.MainRenderer.renderer
    ), this.renderers.LabelRenderer.renderer.render(this.scene, this.camera), this.renderSceneInfo(
      this.scene,
      this.camera,
      this.sceneView.left,
      this.sceneView.bottom,
      this.sceneView.width,
      this.sceneView.height,
      this.renderers.MainRenderer.renderer
    ), this.hud && this.hud.render(this.camera), this.cameraController.update();
  }
  exportImage(e = 2) {
    e = Math.min(e, 3);
    const t = this.renderers.MainRenderer.renderer, s = t.getPixelRatio(), i = e;
    t.setPixelRatio(i), this.render();
    const n = document.createElement("canvas");
    n.width = t.domElement.width, n.height = t.domElement.height;
    const r = n.getContext("2d");
    r.drawImage(t.domElement, 0, 0), this.drawLabelsToCanvas(
      r,
      n.width,
      n.height,
      i
    );
    var a = n.toDataURL("image/png");
    return t.setPixelRatio(s), this.render(), a;
  }
  drawLabelsToCanvas(e, t, s, i) {
    const n = [];
    if (this.scene.traverse((c) => {
      c && c.isCSS2DObject && c.element && n.push(c);
    }), n.length === 0)
      return;
    this.scene.updateMatrixWorld(!0), this.camera.updateMatrixWorld(!0);
    const r = e.textAlign, a = e.textBaseline;
    e.textAlign = "center", e.textBaseline = "middle";
    const l = new THREE.Vector3();
    n.forEach((c) => {
      if (!c.visible)
        return;
      const h = c.element, d = window.getComputedStyle(h);
      if (d.display === "none" || d.visibility === "hidden" || d.opacity === "0")
        return;
      c.getWorldPosition(l), l.project(this.camera);
      const u = (l.x * 0.5 + 0.5) * t, p = (-l.y * 0.5 + 0.5) * s, m = parseFloat(d.fontSize) || 14, g = d.fontFamily || "sans-serif", y = d.fontWeight || "normal";
      e.font = `${y} ${m * i}px ${g}`, e.fillStyle = d.color || "#000";
      const f = h.textContent || "";
      f && e.fillText(f, u, p);
    }), e.textAlign = r, e.textBaseline = a;
  }
  downloadImage(e = "atomistic-model.png") {
    var t = this.exportImage(), s = document.createElement("a");
    s.href = t, s.download = e, document.body.appendChild(s), s.click(), document.body.removeChild(s);
  }
  async exportAnimation({
    format: e = "webm",
    fps: t = 12,
    startFrame: s = 0,
    endFrame: i = null,
    mimeType: n = null,
    resolution: r = 2,
    frameCount: a = null,
    setFrame: l = null,
    getFrame: c = null,
    isPlaying: h = null,
    pause: d = null,
    play: u = null
  } = {}) {
    if (typeof MediaRecorder > "u")
      throw new Error("MediaRecorder is not supported in this browser.");
    if (!this.renderers || !this.renderers.MainRenderer)
      throw new Error("Renderer is not initialized.");
    if (!Number.isFinite(t) || t <= 0)
      throw new Error("fps must be a positive number.");
    if (!Number.isFinite(r) || r <= 0)
      throw new Error("resolution must be a positive number.");
    if (!Number.isFinite(a) || a <= 0)
      throw new Error("frameCount must be a positive number.");
    if (typeof l != "function")
      throw new Error("setFrame callback is required for animation export.");
    const p = this.renderers.MainRenderer.renderer, m = p.getPixelRatio(), g = Math.min(r, 3), y = p.getSize(new THREE.Vector2());
    p.setPixelRatio(g), p.setSize(y.x, y.y, !1);
    const f = p.domElement;
    if (!f.captureStream)
      throw p.setPixelRatio(m), p.setSize(y.x, y.y, !1), new Error(
        "Canvas captureStream() is not supported in this browser."
      );
    const w = String(e || "webm").toLowerCase();
    if (w === "gif")
      throw new Error(
        "GIF export is not supported without an external encoder. Use webm or mp4."
      );
    let b = this.getSupportedAnimationMimeTypes(
      w,
      n
    );
    w === "mp4" && !b && (b = this.getSupportedAnimationMimeTypes("webm"), console.warn(
      "MP4 export is not supported in this browser. Falling back to WebM."
    ));
    const x = Math.max(0, Math.min(s, a - 1)), S = Math.max(
      x,
      Math.min(i ?? a - 1, a - 1)
    ), M = b ? { mimeType: b } : void 0, E = f.captureStream(t), v = M ? new MediaRecorder(E, M) : new MediaRecorder(E), C = [];
    v.ondataavailable = (R) => {
      R.data && R.data.size > 0 && C.push(R.data);
    };
    const A = typeof c == "function" ? c() : null, _ = typeof h == "function" ? h() : !1;
    _ && typeof d == "function" && d();
    const L = 1e3 / t;
    try {
      typeof l == "function" && l(x), await new Promise((P) => requestAnimationFrame(P)), await new Promise((P) => requestAnimationFrame(P)), v.start();
      for (let P = x; P <= S; P += 1)
        l(P), await new Promise((F) => setTimeout(F, L));
      const R = new Promise((P) => {
        v.onstop = P;
      });
      v.stop(), await R, E.getTracks().forEach((P) => P.stop());
    } finally {
      p.setPixelRatio(m), p.setSize(y.x, y.y, !1), this.render();
    }
    A !== null && typeof l == "function" && l(A), _ && typeof u == "function" && u();
    const j = v.mimeType || b || "video/webm";
    return new Blob(C, { type: j });
  }
  async downloadAnimation({ filename: e = "trajectory.webm", ...t } = {}) {
    const s = await this.exportAnimation(t), i = URL.createObjectURL(s), n = document.createElement("a");
    n.href = i, n.download = e, document.body.appendChild(n), n.click(), document.body.removeChild(n), URL.revokeObjectURL(i);
  }
  getSupportedAnimationMimeTypes(e, t) {
    if (t && MediaRecorder.isTypeSupported(t))
      return t;
    const s = String(e || "webm").toLowerCase();
    return s === "gif" ? null : (s === "mp4" ? ["video/mp4;codecs=avc1.42E01E", "video/mp4"] : ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"]).find((n) => MediaRecorder.isTypeSupported(n)) || null;
  }
}
const elementAtomicNumbers = {
  H: 1,
  He: 2,
  Li: 3,
  Be: 4,
  B: 5,
  C: 6,
  N: 7,
  O: 8,
  F: 9,
  Ne: 10,
  Na: 11,
  Mg: 12,
  Al: 13,
  Si: 14,
  P: 15,
  S: 16,
  Cl: 17,
  Ar: 18,
  K: 19,
  Ca: 20,
  Sc: 21,
  Ti: 22,
  V: 23,
  Cr: 24,
  Mn: 25,
  Fe: 26,
  Co: 27,
  Ni: 28,
  Cu: 29,
  Zn: 30,
  Ga: 31,
  Ge: 32,
  As: 33,
  Se: 34,
  Br: 35,
  Kr: 36,
  Rb: 37,
  Sr: 38,
  Y: 39,
  Zr: 40,
  Nb: 41,
  Mo: 42,
  Tc: 43,
  Ru: 44,
  Rh: 45,
  Pd: 46,
  Ag: 47,
  Cd: 48,
  In: 49,
  Sn: 50,
  Sb: 51,
  Te: 52,
  I: 53,
  Xe: 54,
  Cs: 55,
  Ba: 56,
  La: 57,
  Ce: 58,
  Pr: 59,
  Nd: 60,
  Pm: 61,
  Sm: 62,
  Eu: 63,
  Gd: 64,
  Tb: 65,
  Dy: 66,
  Ho: 67,
  Er: 68,
  Tm: 69,
  Yb: 70,
  Lu: 71,
  Hf: 72,
  Ta: 73,
  W: 74,
  Re: 75,
  Os: 76,
  Ir: 77,
  Pt: 78,
  Au: 79,
  Hg: 80,
  Tl: 81,
  Pb: 82,
  Bi: 83,
  Po: 84,
  At: 85,
  Rn: 86,
  Fr: 87,
  Ra: 88,
  Ac: 89,
  Th: 90,
  Pa: 91,
  U: 92,
  Np: 93,
  Pu: 94,
  Am: 95,
  Cm: 96,
  Bk: 97,
  Cf: 98,
  Es: 99,
  Fm: 100,
  Md: 101,
  No: 102,
  Lr: 103,
  Rf: 104,
  Db: 105,
  Sg: 106,
  Bh: 107,
  Hs: 108,
  Mt: 109,
  Ds: 110,
  Rg: 111,
  Cn: 112,
  Nh: 113,
  Fl: 114,
  Mc: 115,
  Lv: 116,
  Ts: 117,
  Og: 118
}, cpkColors = {
  H: 16777215,
  // Hydrogen - White
  He: 14286847,
  // Helium - Light Cyan
  Li: 13402367,
  // Lithium - Light Purple
  Be: 12779264,
  // Beryllium - Lime Green
  B: 16758197,
  // Boron - Light Salmon
  C: 13158600,
  // Carbon - Grey
  N: 255,
  // Nitrogen - Blue
  O: 16711680,
  // Oxygen - Red
  F: 16711935,
  // Fluorine - Magenta
  Ne: 11788530,
  // Neon - Light Blue
  Na: 11230450,
  // Sodium - Purple
  Mg: 9109248,
  // Magnesium - Bright Green
  Al: 12532282,
  // Aluminum - Dark Red
  Si: 16761024,
  // Silicon - Pink
  P: 16744448,
  // Phosphorus - Orange
  S: 16777008,
  // Sulfur - Yellow
  Cl: 2096896,
  // Chlorine - Bright Green
  K: 9388244,
  // Potassium - Violet
  Ar: 8442342,
  // Argon - Light Blue
  Ca: 4062976,
  // Calcium - Bright Green
  Sc: 15132390,
  // Scandium - Light Gray
  Ti: 12567239,
  // Titanium - Silver
  V: 10921643,
  // Vanadium - Gray
  Cr: 9083335,
  // Chromium - Light Blue
  Mn: 10255047,
  // Manganese - Purple-Blue
  Fe: 14706227,
  // Iron - Orange
  Ni: 16765219,
  // Nickel - Yellow-Orange
  Co: 16765219,
  // Cobalt - Yellow-Orange
  Cu: 13074483,
  // Copper - Orange-Red
  Zn: 8224944,
  // Zinc - Light Grayish Blue
  Ga: 12750735,
  // Gallium - Salmon
  Ge: 6721423,
  // Germanium - Grayish Blue-Green
  As: 12419299,
  // Arsenic - Lavender
  Se: 16752896,
  // Selenium - Bright Orange-Yellow
  Br: 10889513,
  // Bromine - Dark Reddish-Brown
  Kr: 6076625,
  // Krypton - Sky Blue
  Rb: 7351984,
  // Rubidium - Dark Purple
  Sr: 65280,
  // Strontium - Bright Green
  Y: 9764863,
  // Yttrium - Light Cyan
  Zr: 9756896,
  // Zirconium - Light Grayish Blue-Green
  Nb: 7586505,
  // Niobium - Grayish Blue
  Mo: 5551541,
  // Molybdenum - Dark Grayish Blue-Green
  Tc: 3907230,
  // Technetium - Dark Grayish Blue
  Ru: 2396047,
  // Ruthenium - Grayish Blue-Green
  Rh: 687500,
  // Rhodium - Dark Grayish Blue-Green
  Pd: 27013,
  // Palladium - Dark Blue-Green
  Ag: 12632256,
  // Silver - Silver
  Cd: 16767375,
  // Cadmium - Light Orange-Yellow
  In: 10909043,
  // Indium - Reddish-Brown
  Sn: 6717568,
  // Tin - Grayish Blue-Green
  Sb: 10380213,
  // Antimony - Purple-Blue
  Te: 13924864,
  // Tellurium - Dark Orange
  I: 9699476,
  // Iodine - Dark Magenta
  Xe: 4366e3,
  // Xenon - Blue-Green
  Cs: 5707663,
  // Cesium - Dark Purple
  Ba: 51456,
  // Barium - Bright Green
  La: 7394559,
  // Lanthanum - Light Blue
  Ce: 16777159,
  // Cerium - Light Yellow
  Pr: 14286592,
  // Praseodymium - Light Green-Yellow
  Nd: 13106944,
  // Neodymium - Bright Green-Yellow
  Pm: 10747648,
  // Promethium - Bright Green-Yellow
  Sm: 9240320,
  // Samarium - Bright Green-Yellow
  Eu: 6422272,
  // Europium - Bright Green-Yellow
  Gd: 4587264,
  // Gadolinium - Bright Green-Yellow
  Tb: 3211008,
  // Terbium - Bright Green-Yellow
  Dy: 2093068,
  // Dysprosium - Green
  Ho: 65290,
  // Holmium - Bright Green
  Er: 58997,
  // Erbium - Green-Blue
  Tm: 54354,
  // Thulium - Blue-Green
  Yb: 48952,
  // Ytterbium - Green-Blue
  Lu: 43812,
  // Lutetium - Blue-Green
  Hf: 5096191,
  // Hafnium - Light Blue
  Ta: 5089023,
  // Tantalum - Light Blue
  W: 2200790,
  // Tungsten - Blue
  Re: 2522539,
  // Rhenium - Dark Blue
  Os: 2516630,
  // Osmium - Dark Blue
  Ir: 1528967,
  // Iridium - Dark Blue
  Pt: 13684960,
  // Platinum - Light Grayish Blue
  Au: 16765219,
  // Gold - Yellow-Orange
  Hg: 12105936,
  // Mercury - Light Grayish Blue
  Tl: 10900557,
  // Thallium - Reddish-Brown
  Pb: 5724513,
  // Lead - Gray
  Bi: 10375093,
  // Bismuth - Purple
  Po: 11230208,
  // Polonium - Brown
  At: 7688005,
  // Astatine - Brown
  Rn: 4358806,
  // Radon - Dark Blue-Green
  Fr: 4325478,
  // Francium - Dark Purple
  Ra: 32e3,
  // Radium - Green
  Ac: 7384058,
  // Actinium - Light Blue
  Th: 41471,
  // Thorium - Blue
  Pa: 41471,
  // Protactinium - Blue
  U: 36863,
  // Uranium - Blue
  Np: 33023,
  // Neptunium - Blue
  Pu: 27647,
  // Plutonium - Dark Blue
  Am: 5528818,
  // Americium - Blue-Purple
  Cm: 7888099,
  // Curium - Purple
  Bk: 9064419,
  // Berkelium - Purple
  Cf: 10565332,
  // Californium - Purple
  Es: 11739092,
  // Einsteinium - Purple
  Fm: 11739066,
  // Fermium - Purple
  Md: 11739008,
  // Mendelevium - Purple
  No: 12386490,
  // Nobelium - Purple
  Lr: 12452010,
  // Lawrencium - Pink-Purple
  Rf: 13697160,
  // Rutherfordium - Pink
  Db: 14221422,
  // Dubnium - Pink
  Sg: 14680143,
  // Seaborgium - Pink
  Bh: 15073336,
  // Bohrium - Pink
  Hs: 15400998,
  // Hassium - Pink
  Mt: 15794194,
  // Meitnerium - Pink
  Ds: 16711906,
  // Darmstadtium - Pink
  Rg: 16711804,
  // Roentgenium - Pink
  Cn: 16711772,
  // Copernicium - Pink
  Nh: 16711749,
  // Nihonium - Pink
  Fl: 16711723,
  // Flerovium - Pink
  Mc: 16711709,
  // Moscovium - Pink
  Lv: 16711697,
  // Livermorium - Pink
  Ts: 16711685,
  // Tennessine - Pink
  Og: 16711680
  // Oganesson - Red
}, covalentRadii = {
  H: 0.31,
  He: 0.28,
  Li: 1.28,
  Be: 0.96,
  B: 0.84,
  C: 0.76,
  N: 0.71,
  O: 0.66,
  F: 0.57,
  Ne: 0.58,
  Na: 1.66,
  Mg: 1.41,
  Al: 1.21,
  Si: 1.11,
  P: 1.07,
  S: 1.05,
  Cl: 1.02,
  Ar: 1.06,
  K: 2.03,
  Ca: 1.76,
  Sc: 1.7,
  Ti: 1.6,
  V: 1.53,
  Cr: 1.39,
  Mn: 1.39,
  Fe: 1.32,
  Co: 1.26,
  Ni: 1.24,
  Cu: 1.32,
  Zn: 1.22,
  Ga: 1.22,
  Ge: 1.2,
  As: 1.19,
  Se: 1.2,
  Br: 1.2,
  Kr: 1.16,
  Rb: 2.2,
  Sr: 1.95,
  Y: 1.9,
  Zr: 1.75,
  Nb: 1.64,
  Mo: 1.54,
  Tc: 1.47,
  Ru: 1.46,
  Rh: 1.42,
  Pd: 1.39,
  Ag: 1.45,
  Cd: 1.44,
  In: 1.42,
  Sn: 1.39,
  Sb: 1.39,
  Te: 1.38,
  I: 1.39,
  Xe: 1.4,
  Cs: 2.44,
  Ba: 2.15,
  La: 2.07,
  Ce: 2.04,
  Pr: 2.03,
  Nd: 2.01,
  Pm: 1.99,
  Sm: 1.98,
  Eu: 1.98,
  Gd: 1.96,
  Tb: 1.94,
  Dy: 1.92,
  Ho: 1.92,
  Er: 1.89,
  Tm: 1.9,
  Yb: 1.87,
  Lu: 1.87,
  Hf: 1.75,
  Ta: 1.7,
  W: 1.62,
  Re: 1.51,
  Os: 1.44,
  Ir: 1.41,
  Pt: 1.36,
  Au: 1.36,
  Hg: 1.32,
  Tl: 1.45,
  Pb: 1.46,
  Bi: 1.48,
  Po: 1.4,
  At: 1.5,
  Rn: 1.5,
  Fr: 2.6,
  Ra: 2.21,
  Ac: 2.15,
  Th: 2.06,
  Pa: 2,
  U: 1.96,
  Np: 1.9,
  Pu: 1.87,
  Am: 1.8,
  Cm: 1.69
}, vdwRadii = {
  X: NaN,
  H: 1.2,
  He: 1.4,
  Li: 1.82,
  Be: 1.53,
  B: 1.92,
  C: 1.7,
  N: 1.55,
  O: 1.52,
  F: 1.47,
  Ne: 1.54,
  Na: 2.27,
  Mg: 1.73,
  Al: 1.84,
  Si: 2.1,
  P: 1.8,
  S: 1.8,
  Cl: 1.75,
  Ar: 1.88,
  K: 2.75,
  Ca: 2.31,
  Sc: NaN,
  Ti: NaN,
  V: NaN,
  Cr: NaN,
  Mn: NaN,
  Fe: NaN,
  Co: NaN,
  Ni: 1.63,
  Cu: 1.4,
  Zn: 1.39,
  Ga: 1.87,
  Ge: 2.11,
  As: 1.85,
  Se: 1.9,
  Br: 1.85,
  Kr: 2.02,
  Rb: 3.03,
  Sr: 2.49,
  Y: NaN,
  Zr: NaN,
  Nb: NaN,
  Mo: NaN,
  Tc: NaN,
  Ru: NaN,
  Rh: NaN,
  Pd: 1.63,
  Ag: 1.72,
  Cd: 1.58,
  In: 1.93,
  Sn: 2.17,
  Sb: 2.06,
  Te: 2.06,
  I: 1.98,
  Xe: 2.16,
  Cs: 3.43,
  Ba: 2.49,
  La: NaN,
  Ce: NaN,
  Pr: NaN,
  Nd: NaN,
  Pm: NaN,
  Sm: NaN,
  Eu: NaN,
  Gd: NaN,
  Tb: NaN,
  Dy: NaN,
  Ho: NaN,
  Er: NaN,
  Tm: NaN,
  Yb: NaN,
  Lu: NaN,
  Hf: NaN,
  Ta: NaN,
  W: NaN,
  Re: NaN,
  Os: NaN,
  Ir: NaN,
  Pt: 1.75,
  Au: 1.66,
  Hg: 1.55,
  Tl: 1.96,
  Pb: 2.02,
  Bi: 2.07,
  Po: 1.97,
  At: 2.02,
  Rn: 2.2,
  Fr: 3.48,
  Ra: 2.83,
  Ac: NaN,
  Th: NaN,
  Pa: NaN,
  U: 1.86,
  Np: NaN,
  Pu: NaN,
  Am: NaN,
  Cm: NaN,
  Bk: NaN,
  Cf: NaN,
  Es: NaN,
  Fm: NaN,
  Md: NaN,
  No: NaN,
  Lr: NaN
}, elementsWithPolyhedra = [
  "Ac",
  "Zr",
  "Pr",
  "Mo",
  "Li",
  "Ba",
  "Cd",
  "Es",
  "Al",
  "Os",
  "V",
  "Sm",
  "Dy",
  "Ti",
  "Pb",
  "Ni",
  "Sr",
  "Na",
  "Lu",
  "Y",
  "Tb",
  "Au",
  "Be",
  "Sn",
  "Xe",
  "As",
  "Cr",
  "Ru",
  "Re",
  "Yb",
  "I",
  "Ag",
  "Se",
  "Th",
  "In",
  "Pu",
  "Te",
  "W",
  "Ca",
  "Co",
  "Pd",
  "Tl",
  "B",
  "Br",
  "Rh",
  "Pa",
  "Tc",
  "Zn",
  "Eu",
  "Ta",
  "Cm",
  "Nb",
  "Hf",
  "La",
  "Ce",
  "Cf",
  "D",
  "U",
  "Mn",
  "Si",
  "Hg",
  "Cu",
  "Rb",
  "K",
  "Er",
  "NH",
  "Fe",
  "Ge",
  "Am",
  "P",
  "Tm",
  "Gd",
  "Ga",
  "Pm",
  "Bi",
  "Mg",
  "Sc",
  "Kr",
  "Sb",
  "Ir",
  "Po",
  "Bk",
  "F",
  "Ho",
  "Nd",
  "Cs",
  "Np",
  "Pt"
], vestaColors = {
  X: "#cc00cc",
  H: "#ffcccc",
  D: "#ccccff",
  He: "#fce9cf",
  Li: "#86e074",
  Be: "#5fd87b",
  B: "#20a20f",
  C: "#814929",
  N: "#b0bae6",
  O: "#ff0300",
  F: "#b0bae6",
  Ne: "#ff38b5",
  Na: "#fadd3d",
  Mg: "#fc7c16",
  Al: "#81b3d6",
  Si: "#1b3bfa",
  P: "#c19cc3",
  S: "#fffa00",
  Cl: "#32fc03",
  Ar: "#cffec5",
  K: "#a122f7",
  Ca: "#5b96be",
  Sc: "#b663ac",
  Ti: "#78caff",
  V: "#e61a00",
  Cr: "#00009e",
  Mn: "#a9099e",
  Fe: "#b57200",
  Co: "#0000af",
  Ni: "#b8bcbe",
  Cu: "#2247dd",
  Zn: "#8f9082",
  Ga: "#9fe474",
  Ge: "#7e6fa6",
  As: "#75d057",
  Se: "#9aef10",
  Br: "#7f3103",
  Kr: "#fac1f3",
  Rb: "#ff0099",
  Sr: "#00ff27",
  Y: "#67988e",
  Zr: "#00ff00",
  Nb: "#4cb376",
  Mo: "#b486b0",
  Tc: "#cdafcb",
  Ru: "#cfb8ae",
  Rh: "#ced2ab",
  Pd: "#c2c4b9",
  Ag: "#b8bcbe",
  Cd: "#f31fdc",
  In: "#d781bb",
  Sn: "#9b8fba",
  Sb: "#d88350",
  Te: "#ada252",
  I: "#8f1f8b",
  Xe: "#9ba1f8",
  Cs: "#0fffb9",
  Ba: "#1ef02d",
  La: "#5ac449",
  Ce: "#d1fd06",
  Pr: "#fde206",
  Nd: "#fc8e07",
  Pm: "#0000f5",
  Sm: "#fd067d",
  Eu: "#fb08d5",
  Gd: "#c004ff",
  Tb: "#7104fe",
  Dy: "#3106fd",
  Ho: "#0742fb",
  Er: "#49733b",
  Tm: "#0000e0",
  Yb: "#27fdf4",
  Lu: "#26fdb5",
  Hf: "#b4b459",
  Ta: "#b79b56",
  W: "#8e8a80",
  Re: "#b3b18e",
  Os: "#c9b179",
  Ir: "#c9cf73",
  Pt: "#ccc6bf",
  Au: "#feb338",
  Hg: "#d3b8cc",
  Tl: "#96896d",
  Pb: "#53535b",
  Bi: "#d230f8",
  Po: "#0000ff",
  At: "#0000ff",
  Rn: "#ffff00",
  Fr: "#000000",
  Ra: "#6eaa59",
  Ac: "#649e73",
  Th: "#26fe78",
  Pa: "#29fb35",
  U: "#7aa2aa",
  Np: "#4d4d4d",
  Pu: "#4d4d4d",
  Am: "#4d4d4d",
  XX: "#4d4d4d"
}, jmolColors = {
  None: "#ff0000",
  H: "#ffffff",
  He: "#d9ffff",
  Li: "#cc80ff",
  Be: "#c2ff00",
  B: "#ffb5b5",
  C: "#909090",
  N: "#3050f8",
  O: "#ff0d0d",
  F: "#90e050",
  Ne: "#b3e3f5",
  Na: "#ab5cf2",
  Mg: "#8aff00",
  Al: "#bfa6a6",
  Si: "#f0c8a0",
  P: "#ff8000",
  S: "#ffff30",
  Cl: "#1ff01f",
  Ar: "#80d1e3",
  K: "#8f40d4",
  Ca: "#3dff00",
  Sc: "#e6e6e6",
  Ti: "#bfc2c7",
  V: "#a6a6ab",
  Cr: "#8a99c7",
  Mn: "#9c7ac7",
  Fe: "#e06633",
  Co: "#f090a0",
  Ni: "#50d050",
  Cu: "#c88033",
  Zn: "#7d80b0",
  Ga: "#c28f8f",
  Ge: "#668f8f",
  As: "#bd80e3",
  Se: "#ffa100",
  Br: "#a62929",
  Kr: "#5cb8d1",
  Rb: "#702eb0",
  Sr: "#00ff00",
  Y: "#94ffff",
  Zr: "#94e0e0",
  Nb: "#73c2c9",
  Mo: "#54b5b5",
  Tc: "#3b9e9e",
  Ru: "#248f8f",
  Rh: "#0a7d8c",
  Pd: "#006985",
  Ag: "#c0c0c0",
  Cd: "#ffd98f",
  In: "#a67573",
  Sn: "#668080",
  Sb: "#9e63b5",
  Te: "#d47a00",
  I: "#940094",
  Xe: "#429eb0",
  Cs: "#57178f",
  Ba: "#00c900",
  La: "#70d4ff",
  Ce: "#ffffc7",
  Pr: "#d9ffc7",
  Nd: "#c7ffc7",
  Pm: "#a3ffc7",
  Sm: "#8fffc7",
  Eu: "#61ffc7",
  Gd: "#45ffc7",
  Tb: "#30ffc7",
  Dy: "#1fffc7",
  Ho: "#00ff9c",
  Er: "#00e675",
  Tm: "#00d452",
  Yb: "#00bf38",
  Lu: "#00ab24",
  Hf: "#4dc2ff",
  Ta: "#4da6ff",
  W: "#2194d6",
  Re: "#267dab",
  Os: "#266696",
  Ir: "#175487",
  Pt: "#d0d0e0",
  Au: "#ffd123",
  Hg: "#b8b8d0",
  Tl: "#a6544d",
  Pb: "#575961",
  Bi: "#9e4fb5",
  Po: "#ab5c00",
  At: "#754f45",
  Rn: "#428296",
  Fr: "#420066",
  Ra: "#007d00",
  Ac: "#70abfa",
  Th: "#00baff",
  Pa: "#00a1ff",
  U: "#008fff",
  Np: "#0080ff",
  Pu: "#006bff",
  Am: "#545cf2",
  Cm: "#785ce3",
  Bk: "#8a4fe3",
  Cf: "#a136d4",
  Es: "#b31fd4",
  Fm: "#b31fba",
  Md: "#b30da6",
  No: "#bd0d87",
  Lr: "#c70066",
  Rf: "#cc0059",
  Db: "#d1004f",
  Sg: "#d90045",
  Bh: "#e00038",
  Hs: "#e6002e",
  Mt: "#eb0026"
}, elementColors = {
  CPK: cpkColors,
  VESTA: vestaColors,
  JMOL: jmolColors
}, default_bond_pairs = {
  "Ac-O": [1, 1, 0],
  "Ac-F": [1, 1, 0],
  "Ac-Cl": [1, 1, 0],
  "Ac-Br": [1, 1, 0],
  "Ag-O": [1, 1, 0],
  "Ag-S": [1, 1, 0],
  "Ag-F": [1, 1, 0],
  "Ag-Cl": [1, 1, 0],
  "Ag-Br": [1, 1, 0],
  "Ag-I": [1, 1, 0],
  "Ag-Se": [1, 1, 0],
  "Ag-Te": [1, 1, 0],
  "Ag-N": [1, 1, 0],
  "Ag-P": [1, 1, 0],
  "Ag-As": [1, 1, 0],
  "Ag-H": [1, 1, 0],
  "Al-O": [1, 1, 0],
  "Al-S": [1, 1, 0],
  "Al-Se": [1, 1, 0],
  "Al-Te": [1, 1, 0],
  "Al-F": [1, 1, 0],
  "Al-Cl": [1, 1, 0],
  "Al-Br": [1, 1, 0],
  "Al-I": [1, 1, 0],
  "Al-N": [1, 1, 0],
  "Al-P": [1, 1, 0],
  "Al-As": [1, 1, 0],
  "Al-H": [1, 1, 0],
  "Am-O": [1, 1, 0],
  "Am-F": [1, 1, 0],
  "Am-Cl": [1, 1, 0],
  "Am-Br": [1, 1, 0],
  "As-S": [1, 1, 0],
  "As-Se": [1, 1, 0],
  "As-O": [1, 1, 0],
  "As-Te": [1, 1, 0],
  "As-F": [1, 1, 0],
  "As-Cl": [1, 1, 0],
  "As-Br": [1, 1, 0],
  "As-I": [1, 1, 0],
  "As-C": [1, 1, 0],
  "Au-Cl": [1, 1, 0],
  "Au-I": [1, 1, 0],
  "Au-O": [1, 1, 0],
  "Au-S": [1, 1, 0],
  "Au-F": [1, 1, 0],
  "Au-Br": [1, 1, 0],
  "Au-N": [1, 1, 0],
  "Au-Se": [1, 1, 0],
  "Au-Te": [1, 1, 0],
  "Au-P": [1, 1, 0],
  "Au-As": [1, 1, 0],
  "Au-H": [1, 1, 0],
  "B-O": [1, 1, 0],
  "B-S": [1, 1, 0],
  "B-Se": [1, 1, 0],
  "B-Te": [1, 1, 0],
  "B-F": [1, 1, 0],
  "B-Cl": [1, 1, 0],
  "B-Br": [1, 1, 0],
  "B-I": [1, 1, 0],
  "B-N": [1, 1, 0],
  "B-P": [1, 1, 0],
  "B-As": [1, 1, 0],
  "B-H": [1, 1, 0],
  "B-B": [1, 1, 0],
  "Ba-O": [1, 1, 0],
  "Ba-S": [1, 1, 0],
  "Ba-Se": [1, 1, 0],
  "Ba-Te": [1, 1, 0],
  "Ba-F": [1, 1, 0],
  "Ba-Cl": [1, 1, 0],
  "Ba-Br": [1, 1, 0],
  "Ba-I": [1, 1, 0],
  "Ba-N": [1, 1, 0],
  "Ba-P": [1, 1, 0],
  "Ba-As": [1, 1, 0],
  "Ba-H": [1, 1, 0],
  "Be-O": [1, 1, 0],
  "Be-S": [1, 1, 0],
  "Be-Se": [1, 1, 0],
  "Be-Te": [1, 1, 0],
  "Be-F": [1, 1, 0],
  "Be-Cl": [1, 1, 0],
  "Be-Br": [1, 1, 0],
  "Be-I": [1, 1, 0],
  "Be-N": [1, 1, 0],
  "Be-P": [1, 1, 0],
  "Be-As": [1, 1, 0],
  "Be-H": [1, 1, 0],
  "Bi-O": [1, 1, 0],
  "Bi-S": [1, 1, 0],
  "Bi-Se": [1, 1, 0],
  "Bi-F": [1, 1, 0],
  "Bi-Cl": [1, 1, 0],
  "Bi-Br": [1, 1, 0],
  "Bi-I": [1, 1, 0],
  "Bi-N": [1, 1, 0],
  "Bi-Te": [1, 1, 0],
  "Bi-P": [1, 1, 0],
  "Bi-As": [1, 1, 0],
  "Bi-H": [1, 1, 0],
  "Bk-O": [1, 1, 0],
  "Bk-F": [1, 1, 0],
  "Bk-Cl": [1, 1, 0],
  "Bk-Br": [1, 1, 0],
  "Br-O": [1, 1, 0],
  "Br-F": [1, 1, 0],
  "Br-Cl": [1, 1, 0],
  "C-Au": [1, 1, 0],
  "C-O": [2, 1, 0],
  "C-Cl": [2, 1, 0],
  "C-C": [2, 0, 0],
  "C-S": [2, 0, 0],
  "C-F": [2, 1, 0],
  "C-Br": [2, 1, 0],
  "C-N": [2, 1, 0],
  "C-Se": [2, 1, 0],
  "C-I": [2, 1, 0],
  "C-Te": [1, 1, 0],
  "C-P": [2, 1, 0],
  "C-Pt": [1, 1, 0],
  "C-H": [1, 0, 0],
  "Ca-O": [1, 1, 0],
  "Ca-S": [1, 1, 0],
  "Ca-Se": [1, 1, 0],
  "Ca-Te": [1, 1, 0],
  "Ca-F": [1, 1, 0],
  "Ca-Cl": [1, 1, 0],
  "Ca-Br": [1, 1, 0],
  "Ca-I": [1, 1, 0],
  "Ca-N": [1, 1, 0],
  "Ca-P": [1, 1, 0],
  "Ca-As": [1, 1, 0],
  "Ca-H": [1, 1, 0],
  "Cd-O": [1, 1, 0],
  "Cd-S": [1, 1, 0],
  "Cd-Se": [1, 1, 0],
  "Cd-Te": [1, 1, 0],
  "Cd-F": [1, 1, 0],
  "Cd-Cl": [1, 1, 0],
  "Cd-Br": [1, 1, 0],
  "Cd-I": [1, 1, 0],
  "Cd-N": [1, 1, 0],
  "Cd-P": [1, 1, 0],
  "Cd-As": [1, 1, 0],
  "Cd-H": [1, 1, 0],
  "Ce-O": [1, 1, 0],
  "Ce-S": [1, 1, 0],
  "Ce-F": [1, 1, 0],
  "Ce-Cl": [1, 1, 0],
  "Ce-Br": [1, 1, 0],
  "Ce-I": [1, 1, 0],
  "Ce-N": [1, 1, 0],
  "Ce-Se": [1, 1, 0],
  "Ce-Te": [1, 1, 0],
  "Ce-P": [1, 1, 0],
  "Ce-As": [1, 1, 0],
  "Ce-H": [1, 1, 0],
  "Cf-O": [1, 1, 0],
  "Cf-F": [1, 1, 0],
  "Cf-Cl": [1, 1, 0],
  "Cf-Br": [1, 1, 0],
  "Cl-H": [1, 0, 0],
  "Cl-O": [1, 1, 0],
  "Cl-F": [1, 1, 0],
  "Cl-Cl": [1, 1, 0],
  "Cm-O": [1, 1, 0],
  "Cm-F": [1, 1, 0],
  "Cm-Cl": [1, 1, 0],
  "Co-H": [1, 1, 0],
  "Co-O": [1, 1, 0],
  "Co-S": [1, 1, 0],
  "Co-F": [1, 1, 0],
  "Co-Cl": [1, 1, 0],
  "Co-N": [1, 1, 0],
  "Co-C": [1, 1, 0],
  "Co-Br": [1, 1, 0],
  "Co-I": [1, 1, 0],
  "Co-Se": [1, 1, 0],
  "Co-Te": [1, 1, 0],
  "Co-P": [1, 1, 0],
  "Co-As": [1, 1, 0],
  "Cr-O": [1, 1, 0],
  "Cr-F": [1, 1, 0],
  "Cr-Cl": [1, 1, 0],
  "Cr-Br": [1, 1, 0],
  "Cr-I": [1, 1, 0],
  "Cr-N": [1, 1, 0],
  "Cr-S": [1, 1, 0],
  "Cr-Se": [1, 1, 0],
  "Cr-Te": [1, 1, 0],
  "Cr-P": [1, 1, 0],
  "Cr-As": [1, 1, 0],
  "Cr-H": [1, 1, 0],
  "Cs-O": [1, 1, 0],
  "Cs-S": [1, 1, 0],
  "Cs-Se": [1, 1, 0],
  "Cs-Te": [1, 1, 0],
  "Cs-F": [1, 1, 0],
  "Cs-Cl": [1, 1, 0],
  "Cs-Br": [1, 1, 0],
  "Cs-I": [1, 1, 0],
  "Cs-N": [1, 1, 0],
  "Cs-P": [1, 1, 0],
  "Cs-As": [1, 1, 0],
  "Cs-H": [1, 1, 0],
  "Cu-O": [1, 1, 0],
  "Cu-S": [1, 1, 0],
  "Cu-Se": [1, 1, 0],
  "Cu-F": [1, 1, 0],
  "Cu-Cl": [1, 1, 0],
  "Cu-Br": [1, 1, 0],
  "Cu-I": [1, 1, 0],
  "Cu-N": [1, 1, 0],
  "Cu-P": [1, 1, 0],
  "Cu-As": [1, 1, 0],
  "Cu-C": [1, 1, 0],
  "Cu-Te": [1, 1, 0],
  "Cu-H": [1, 1, 0],
  "Dy-O": [1, 1, 0],
  "Dy-F": [1, 1, 0],
  "Dy-Cl": [1, 1, 0],
  "Dy-Br": [1, 1, 0],
  "Dy-I": [1, 1, 0],
  "Dy-S": [1, 1, 0],
  "Dy-Se": [1, 1, 0],
  "Dy-Te": [1, 1, 0],
  "Dy-N": [1, 1, 0],
  "Dy-P": [1, 1, 0],
  "Dy-As": [1, 1, 0],
  "Dy-H": [1, 1, 0],
  "Er-O": [1, 1, 0],
  "Er-S": [1, 1, 0],
  "Er-Se": [1, 1, 0],
  "Er-F": [1, 1, 0],
  "Er-Cl": [1, 1, 0],
  "Er-Br": [1, 1, 0],
  "Er-I": [1, 1, 0],
  "Er-Te": [1, 1, 0],
  "Er-N": [1, 1, 0],
  "Er-P": [1, 1, 0],
  "Er-As": [1, 1, 0],
  "Er-H": [1, 1, 0],
  "Es-O": [1, 1, 0],
  "Eu-O": [1, 1, 0],
  "Eu-S": [1, 1, 0],
  "Eu-F": [1, 1, 0],
  "Eu-Cl": [1, 1, 0],
  "Eu-Br": [1, 1, 0],
  "Eu-I": [1, 1, 0],
  "Eu-N": [1, 1, 0],
  "Eu-Se": [1, 1, 0],
  "Eu-Te": [1, 1, 0],
  "Eu-P": [1, 1, 0],
  "Eu-As": [1, 1, 0],
  "Eu-H": [1, 1, 0],
  "F-H": [1, 0, 0],
  "Fe-O": [1, 1, 0],
  "Fe-S": [1, 1, 0],
  "Fe-F": [1, 1, 0],
  "Fe-Cl": [1, 1, 0],
  "Fe-Br": [1, 1, 0],
  "Fe-I": [1, 1, 0],
  "Fe-N": [1, 1, 0],
  "Fe-C": [1, 1, 0],
  "Fe-Se": [1, 1, 0],
  "Fe-Te": [1, 1, 0],
  "Fe-P": [1, 1, 0],
  "Fe-As": [1, 1, 0],
  "Fe-H": [1, 1, 0],
  "Ga-Se": [1, 1, 0],
  "Ga-O": [1, 1, 0],
  "Ga-S": [1, 1, 0],
  "Ga-F": [1, 1, 0],
  "Ga-Cl": [1, 1, 0],
  "Ga-Br": [1, 1, 0],
  "Ga-I": [1, 1, 0],
  "Ga-Te": [1, 1, 0],
  "Ga-N": [1, 1, 0],
  "Ga-P": [1, 1, 0],
  "Ga-As": [1, 1, 0],
  "Ga-H": [1, 1, 0],
  "Gd-O": [1, 1, 0],
  "Gd-F": [1, 1, 0],
  "Gd-S": [1, 1, 0],
  "Gd-Cl": [1, 1, 0],
  "Gd-Br": [1, 1, 0],
  "Gd-I": [1, 1, 0],
  "Gd-Se": [1, 1, 0],
  "Gd-Te": [1, 1, 0],
  "Gd-N": [1, 1, 0],
  "Gd-P": [1, 1, 0],
  "Gd-As": [1, 1, 0],
  "Gd-H": [1, 1, 0],
  "Ge-O": [1, 1, 0],
  "Ge-S": [1, 1, 0],
  "Ge-Se": [1, 1, 0],
  "Ge-F": [1, 1, 0],
  "Ge-Cl": [1, 1, 0],
  "Ge-Br": [1, 1, 0],
  "Ge-I": [1, 1, 0],
  "Ge-Te": [1, 1, 0],
  "Ge-N": [1, 1, 0],
  "Ge-P": [1, 1, 0],
  "Ge-As": [1, 1, 0],
  "Ge-H": [1, 1, 0],
  "Ge-Ge": [1, 1, 0],
  "O-H": [1, 0, 0],
  "H-O": [0, 0, 1],
  "H-N": [0, 0, 1],
  "O-D": [1, 0, 0],
  "D-O": [0, 0, 0],
  "D-F": [1, 0, 0],
  "D-Cl": [1, 0, 0],
  "D-N": [1, 0, 0],
  "Hf-F": [1, 1, 0],
  "Hf-O": [1, 1, 0],
  "Hf-Cl": [1, 1, 0],
  "Hf-Br": [1, 1, 0],
  "Hf-S": [1, 1, 0],
  "Hf-Se": [1, 1, 0],
  "Hf-Te": [1, 1, 0],
  "Hf-I": [1, 1, 0],
  "Hf-N": [1, 1, 0],
  "Hf-P": [1, 1, 0],
  "Hf-As": [1, 1, 0],
  "Hf-H": [1, 1, 0],
  "Hg-O": [1, 1, 0],
  "Hg-F": [1, 1, 0],
  "Hg-Cl": [1, 1, 0],
  "Hg-S": [1, 1, 0],
  "Hg-Br": [1, 1, 0],
  "Hg-I": [1, 1, 0],
  "Hg-Se": [1, 1, 0],
  "Hg-Te": [1, 1, 0],
  "Hg-N": [1, 1, 0],
  "Hg-P": [1, 1, 0],
  "Hg-As": [1, 1, 0],
  "Hg-H": [1, 1, 0],
  "Hg-Hg": [1, 1, 0],
  "Ho-O": [1, 1, 0],
  "Ho-S": [1, 1, 0],
  "Ho-F": [1, 1, 0],
  "Ho-Cl": [1, 1, 0],
  "Ho-Br": [1, 1, 0],
  "Ho-I": [1, 1, 0],
  "Ho-Se": [1, 1, 0],
  "Ho-Te": [1, 1, 0],
  "Ho-N": [1, 1, 0],
  "Ho-P": [1, 1, 0],
  "Ho-As": [1, 1, 0],
  "Ho-H": [1, 1, 0],
  "I-I": [1, 1, 0],
  "I-F": [1, 1, 0],
  "I-Cl": [1, 1, 0],
  "I-O": [1, 1, 0],
  "In-Cl": [1, 1, 0],
  "In-O": [1, 1, 0],
  "In-S": [1, 1, 0],
  "In-F": [1, 1, 0],
  "In-Br": [1, 1, 0],
  "In-I": [1, 1, 0],
  "In-Co": [1, 1, 0],
  "In-Mn": [1, 1, 0],
  "In-Se": [1, 1, 0],
  "In-Te": [1, 1, 0],
  "In-N": [1, 1, 0],
  "In-P": [1, 1, 0],
  "In-As": [1, 1, 0],
  "In-H": [1, 1, 0],
  "Ir-O": [1, 1, 0],
  "Ir-F": [1, 1, 0],
  "Ir-Cl": [1, 1, 0],
  "Ir-S": [1, 1, 0],
  "Ir-Se": [1, 1, 0],
  "Ir-Te": [1, 1, 0],
  "Ir-Br": [1, 1, 0],
  "Ir-I": [1, 1, 0],
  "Ir-N": [1, 1, 0],
  "Ir-P": [1, 1, 0],
  "Ir-As": [1, 1, 0],
  "Ir-H": [1, 1, 0],
  "K-O": [1, 1, 0],
  "K-S": [1, 1, 0],
  "K-Se": [1, 1, 0],
  "K-Te": [1, 1, 0],
  "K-F": [1, 1, 0],
  "K-Cl": [1, 1, 0],
  "K-Br": [1, 1, 0],
  "K-I": [1, 1, 0],
  "K-N": [1, 1, 0],
  "K-P": [1, 1, 0],
  "K-As": [1, 1, 0],
  "K-H": [1, 1, 0],
  "Kr-F": [1, 1, 0],
  "La-O": [1, 1, 0],
  "La-S": [1, 1, 0],
  "La-Se": [1, 1, 0],
  "La-Te": [1, 1, 0],
  "La-F": [1, 1, 0],
  "La-Cl": [1, 1, 0],
  "La-Br": [1, 1, 0],
  "La-I": [1, 1, 0],
  "La-N": [1, 1, 0],
  "La-P": [1, 1, 0],
  "La-As": [1, 1, 0],
  "La-H": [1, 1, 0],
  "Li-O": [1, 1, 0],
  "Li-S": [1, 1, 0],
  "Li-Se": [1, 1, 0],
  "Li-Te": [1, 1, 0],
  "Li-F": [1, 1, 0],
  "Li-Cl": [1, 1, 0],
  "Li-Br": [1, 1, 0],
  "Li-I": [1, 1, 0],
  "Li-N": [1, 1, 0],
  "Lu-O": [1, 1, 0],
  "Lu-S": [1, 1, 0],
  "Lu-Se": [1, 1, 0],
  "Lu-Te": [1, 1, 0],
  "Lu-F": [1, 1, 0],
  "Lu-Cl": [1, 1, 0],
  "Lu-Br": [1, 1, 0],
  "Lu-I": [1, 1, 0],
  "Lu-N": [1, 1, 0],
  "Lu-P": [1, 1, 0],
  "Lu-As": [1, 1, 0],
  "Lu-H": [1, 1, 0],
  "Mg-O": [1, 1, 0],
  "Mg-S": [1, 1, 0],
  "Mg-Se": [1, 1, 0],
  "Mg-Te": [1, 1, 0],
  "Mg-F": [1, 1, 0],
  "Mg-Cl": [1, 1, 0],
  "Mg-Br": [1, 1, 0],
  "Mg-I": [1, 1, 0],
  "Mg-N": [1, 1, 0],
  "Mg-P": [1, 1, 0],
  "Mg-As": [1, 1, 0],
  "Mg-H": [1, 1, 0],
  "Mn-O": [1, 1, 0],
  "Mn-S": [1, 1, 0],
  "Mn-F": [1, 1, 0],
  "Mn-Cl": [1, 1, 0],
  "Mn-Br": [1, 1, 0],
  "Mn-I": [1, 1, 0],
  "Mn-N": [1, 1, 0],
  "Mn-Se": [1, 1, 0],
  "Mn-Te": [1, 1, 0],
  "Mn-P": [1, 1, 0],
  "Mn-As": [1, 1, 0],
  "Mn-H": [1, 1, 0],
  "Mo-S": [1, 1, 0],
  "Mo-Cl": [1, 1, 0],
  "Mo-O": [1, 1, 0],
  "Mo-F": [1, 1, 0],
  "Mo-Br": [1, 1, 0],
  "Mo-N": [1, 1, 0],
  "Mo-I": [1, 1, 0],
  "Mo-Se": [1, 1, 0],
  "Mo-Te": [1, 1, 0],
  "Mo-P": [1, 1, 0],
  "Mo-As": [1, 1, 0],
  "Mo-H": [1, 1, 0],
  "N-H": [1, 0, 0],
  "N-O": [1, 1, 0],
  "N-F": [1, 1, 0],
  "N-Cl": [1, 1, 0],
  "N-N": [1, 1, 0],
  "Na-O": [1, 1, 0],
  "Na-S": [1, 1, 0],
  "Na-Se": [1, 1, 0],
  "Na-Te": [1, 1, 0],
  "Na-F": [1, 1, 0],
  "Na-Cl": [1, 1, 0],
  "Na-Br": [1, 1, 0],
  "Na-I": [1, 1, 0],
  "Na-N": [1, 1, 0],
  "Na-P": [1, 1, 0],
  "Na-As": [1, 1, 0],
  "Na-H": [1, 1, 0],
  "Nb-O": [1, 1, 0],
  "Nb-F": [1, 1, 0],
  "Nb-Cl": [1, 1, 0],
  "Nb-Br": [1, 1, 0],
  "Nb-N": [1, 1, 0],
  "Nb-I": [1, 1, 0],
  "Nb-S": [1, 1, 0],
  "Nb-Se": [1, 1, 0],
  "Nb-Te": [1, 1, 0],
  "Nb-P": [1, 1, 0],
  "Nb-As": [1, 1, 0],
  "Nb-H": [1, 1, 0],
  "Nd-O": [1, 1, 0],
  "Nd-S": [1, 1, 0],
  "Nd-Se": [1, 1, 0],
  "Nd-Te": [1, 1, 0],
  "Nd-F": [1, 1, 0],
  "Nd-Cl": [1, 1, 0],
  "Nd-Br": [1, 1, 0],
  "Nd-I": [1, 1, 0],
  "Nd-N": [1, 1, 0],
  "NH-O": [1, 1, 0],
  "NH-F": [1, 1, 0],
  "NH-Cl": [1, 1, 0],
  "Ni-O": [1, 1, 0],
  "Ni-S": [1, 1, 0],
  "Ni-F": [1, 1, 0],
  "Ni-Cl": [1, 1, 0],
  "Ni-Br": [1, 1, 0],
  "Ni-I": [1, 1, 0],
  "Ni-N": [1, 1, 0],
  "Ni-Se": [1, 1, 0],
  "Ni-Te": [1, 1, 0],
  "Ni-P": [1, 1, 0],
  "Ni-As": [1, 1, 0],
  "Ni-H": [1, 1, 0],
  "Np-F": [1, 1, 0],
  "Np-Cl": [1, 1, 0],
  "Np-S": [1, 1, 0],
  "Np-Br": [1, 1, 0],
  "Np-I": [1, 1, 0],
  "Np-O": [1, 1, 0],
  "O-O": [1, 0, 0],
  "Os-O": [1, 1, 0],
  "Os-S": [1, 1, 0],
  "Os-F": [1, 1, 0],
  "Os-Cl": [1, 1, 0],
  "Os-Br": [1, 1, 0],
  "P-O": [1, 1, 0],
  "P-S": [1, 1, 0],
  "P-Se": [1, 1, 0],
  "P-F": [1, 1, 0],
  "P-Cl": [1, 1, 0],
  "P-Br": [1, 1, 0],
  "P-N": [1, 1, 0],
  "P-I": [1, 1, 0],
  "P-P": [1, 1, 0],
  "P-As": [1, 1, 0],
  "P-H": [1, 1, 0],
  "Pa-O": [1, 1, 0],
  "Pa-F": [1, 1, 0],
  "Pa-Cl": [1, 1, 0],
  "Pa-Br": [1, 1, 0],
  "Pb-O": [1, 1, 0],
  "Pb-S": [1, 1, 0],
  "Pb-Se": [1, 1, 0],
  "Pb-F": [1, 1, 0],
  "Pb-Cl": [1, 1, 0],
  "Pb-Br": [1, 1, 0],
  "Pb-I": [1, 1, 0],
  "Pb-N": [1, 1, 0],
  "Pb-Te": [1, 1, 0],
  "Pb-P": [1, 1, 0],
  "Pb-As": [1, 1, 0],
  "Pb-H": [1, 1, 0],
  "Pd-O": [1, 1, 0],
  "Pd-S": [1, 1, 0],
  "Pd-F": [1, 1, 0],
  "Pd-Cl": [1, 1, 0],
  "Pd-Br": [1, 1, 0],
  "Pd-I": [1, 1, 0],
  "Pd-N": [1, 1, 0],
  "Pd-C": [1, 1, 0],
  "Pd-Se": [1, 1, 0],
  "Pd-Te": [1, 1, 0],
  "Pd-P": [1, 1, 0],
  "Pd-As": [1, 1, 0],
  "Pd-H": [1, 1, 0],
  "Pm-F": [1, 1, 0],
  "Pm-Cl": [1, 1, 0],
  "Pm-Br": [1, 1, 0],
  "Po-O": [1, 1, 0],
  "Po-F": [1, 1, 0],
  "Pr-O": [1, 1, 0],
  "Pr-S": [1, 1, 0],
  "Pr-Se": [1, 1, 0],
  "Pr-Te": [1, 1, 0],
  "Pr-F": [1, 1, 0],
  "Pr-Cl": [1, 1, 0],
  "Pr-Br": [1, 1, 0],
  "Pr-I": [1, 1, 0],
  "Pr-N": [1, 1, 0],
  "Pr-P": [1, 1, 0],
  "Pr-As": [1, 1, 0],
  "Pr-H": [1, 1, 0],
  "Pt-O": [1, 1, 0],
  "Pt-S": [1, 1, 0],
  "Pt-F": [1, 1, 0],
  "Pt-Cl": [1, 1, 0],
  "Pt-Br": [1, 1, 0],
  "Pt-C": [1, 1, 0],
  "Pt-N": [1, 1, 0],
  "Pt-I": [1, 1, 0],
  "Pt-Se": [1, 1, 0],
  "Pt-Te": [1, 1, 0],
  "Pt-P": [1, 1, 0],
  "Pt-As": [1, 1, 0],
  "Pt-H": [1, 1, 0],
  "Pu-O": [1, 1, 0],
  "Pu-F": [1, 1, 0],
  "Pu-Cl": [1, 1, 0],
  "Pu-S": [1, 1, 0],
  "Pu-Br": [1, 1, 0],
  "Pu-I": [1, 1, 0],
  "Rb-O": [1, 1, 0],
  "Rb-S": [1, 1, 0],
  "Rb-Se": [1, 1, 0],
  "Rb-Te": [1, 1, 0],
  "Rb-F": [1, 1, 0],
  "Rb-Cl": [1, 1, 0],
  "Rb-Br": [1, 1, 0],
  "Rb-I": [1, 1, 0],
  "Rb-N": [1, 1, 0],
  "Rb-P": [1, 1, 0],
  "Rb-As": [1, 1, 0],
  "Rb-H": [1, 1, 0],
  "Re-Cl": [1, 1, 0],
  "Re-O": [1, 1, 0],
  "Re-F": [1, 1, 0],
  "Re-Br": [1, 1, 0],
  "Re-I": [1, 1, 0],
  "Re-S": [1, 1, 0],
  "Re-Se": [1, 1, 0],
  "Re-Te": [1, 1, 0],
  "Re-N": [1, 1, 0],
  "Re-P": [1, 1, 0],
  "Re-As": [1, 1, 0],
  "Re-H": [1, 1, 0],
  "Rh-O": [1, 1, 0],
  "Rh-F": [1, 1, 0],
  "Rh-Cl": [1, 1, 0],
  "Rh-Br": [1, 1, 0],
  "Rh-N": [1, 1, 0],
  "Rh-I": [1, 1, 0],
  "Rh-S": [1, 1, 0],
  "Rh-Se": [1, 1, 0],
  "Rh-Te": [1, 1, 0],
  "Rh-P": [1, 1, 0],
  "Rh-As": [1, 1, 0],
  "Rh-H": [1, 1, 0],
  "Ru-Se": [1, 1, 0],
  "Ru-F": [1, 1, 0],
  "Ru-O": [1, 1, 0],
  "Ru-S": [1, 1, 0],
  "Ru-Cl": [1, 1, 0],
  "Ru-N": [1, 1, 0],
  "Ru-Br": [1, 1, 0],
  "Ru-I": [1, 1, 0],
  "Ru-Te": [1, 1, 0],
  "Ru-P": [1, 1, 0],
  "Ru-As": [1, 1, 0],
  "Ru-H": [1, 1, 0],
  "S-O": [1, 1, 0],
  "S-S": [1, 1, 0],
  "S-N": [1, 1, 0],
  "S-F": [1, 1, 0],
  "S-Cl": [1, 1, 0],
  "S-Br": [1, 1, 0],
  "S-I": [1, 1, 0],
  "S-H": [1, 1, 0],
  "Sb-O": [1, 1, 0],
  "Sb-S": [1, 1, 0],
  "Sb-Se": [1, 1, 0],
  "Sb-F": [1, 1, 0],
  "Sb-Cl": [1, 1, 0],
  "Sb-Br": [1, 1, 0],
  "Sb-I": [1, 1, 0],
  "Sb-N": [1, 1, 0],
  "Sb-Te": [1, 1, 0],
  "Sb-P": [1, 1, 0],
  "Sb-As": [1, 1, 0],
  "Sb-H": [1, 1, 0],
  "Sc-O": [1, 1, 0],
  "Sc-S": [1, 1, 0],
  "Sc-Se": [1, 1, 0],
  "Sc-Te": [1, 1, 0],
  "Sc-F": [1, 1, 0],
  "Sc-Cl": [1, 1, 0],
  "Sc-Br": [1, 1, 0],
  "Sc-I": [1, 1, 0],
  "Sc-N": [1, 1, 0],
  "Sc-P": [1, 1, 0],
  "Sc-As": [1, 1, 0],
  "Sc-H": [1, 1, 0],
  "Se-S": [1, 1, 0],
  "Se-Se": [1, 1, 0],
  "Se-O": [1, 1, 0],
  "Se-F": [1, 1, 0],
  "Se-Cl": [1, 1, 0],
  "Se-Br": [1, 1, 0],
  "Se-N": [1, 1, 0],
  "Se-I": [1, 1, 0],
  "Se-H": [1, 1, 0],
  "Si-O": [1, 1, 0],
  "Si-S": [1, 1, 0],
  "Si-Se": [1, 1, 0],
  "Si-Te": [1, 1, 0],
  "Si-F": [1, 1, 0],
  "Si-Cl": [1, 1, 0],
  "Si-Br": [1, 1, 0],
  "Si-I": [1, 1, 0],
  "Si-C": [1, 1, 0],
  "Si-N": [1, 1, 0],
  "Si-P": [1, 1, 0],
  "Si-As": [1, 1, 0],
  "Si-H": [1, 1, 0],
  "Si-Si": [1, 1, 0],
  "Sm-O": [1, 1, 0],
  "Sm-N": [1, 1, 0],
  "Sm-S": [1, 1, 0],
  "Sm-Se": [1, 1, 0],
  "Sm-Te": [1, 1, 0],
  "Sm-F": [1, 1, 0],
  "Sm-Cl": [1, 1, 0],
  "Sm-Br": [1, 1, 0],
  "Sm-I": [1, 1, 0],
  "Sm-P": [1, 1, 0],
  "Sm-As": [1, 1, 0],
  "Sm-H": [1, 1, 0],
  "Sn-O": [1, 1, 0],
  "Sn-S": [1, 1, 0],
  "Sn-F": [1, 1, 0],
  "Sn-Cl": [1, 1, 0],
  "Sn-Br": [1, 1, 0],
  "Sn-I": [1, 1, 0],
  "Sn-N": [1, 1, 0],
  "Sn-Se": [1, 1, 0],
  "Sn-Te": [1, 1, 0],
  "Sn-P": [1, 1, 0],
  "Sn-As": [1, 1, 0],
  "Sn-H": [1, 1, 0],
  "Sr-O": [1, 1, 0],
  "Sr-S": [1, 1, 0],
  "Sr-Se": [1, 1, 0],
  "Sr-Te": [1, 1, 0],
  "Sr-F": [1, 1, 0],
  "Sr-Cl": [1, 1, 0],
  "Sr-Br": [1, 1, 0],
  "Sr-I": [1, 1, 0],
  "Sr-N": [1, 1, 0],
  "Sr-P": [1, 1, 0],
  "Sr-As": [1, 1, 0],
  "Sr-H": [1, 1, 0],
  "Ta-O": [1, 1, 0],
  "Ta-S": [1, 1, 0],
  "Ta-F": [1, 1, 0],
  "Ta-Cl": [1, 1, 0],
  "Ta-Br": [1, 1, 0],
  "Ta-I": [1, 1, 0],
  "Ta-Se": [1, 1, 0],
  "Ta-Te": [1, 1, 0],
  "Ta-N": [1, 1, 0],
  "Ta-P": [1, 1, 0],
  "Ta-As": [1, 1, 0],
  "Ta-H": [1, 1, 0],
  "Tb-O": [1, 1, 0],
  "Tb-S": [1, 1, 0],
  "Tb-Se": [1, 1, 0],
  "Tb-Te": [1, 1, 0],
  "Tb-F": [1, 1, 0],
  "Tb-Cl": [1, 1, 0],
  "Tb-Br": [1, 1, 0],
  "Tb-I": [1, 1, 0],
  "Tb-N": [1, 1, 0],
  "Tb-P": [1, 1, 0],
  "Tb-As": [1, 1, 0],
  "Tb-H": [1, 1, 0],
  "Tc-O": [1, 1, 0],
  "Tc-F": [1, 1, 0],
  "Tc-Cl": [1, 1, 0],
  "Te-O": [1, 1, 0],
  "Te-S": [1, 1, 0],
  "Te-F": [1, 1, 0],
  "Te-Cl": [1, 1, 0],
  "Te-Br": [1, 1, 0],
  "Te-I": [1, 1, 0],
  "Te-Se": [1, 1, 0],
  "Te-Te": [1, 1, 0],
  "Te-N": [1, 1, 0],
  "Te-P": [1, 1, 0],
  "Te-H": [1, 1, 0],
  "Th-O": [1, 1, 0],
  "Th-S": [1, 1, 0],
  "Th-Se": [1, 1, 0],
  "Th-Te": [1, 1, 0],
  "Th-F": [1, 1, 0],
  "Th-Cl": [1, 1, 0],
  "Th-Br": [1, 1, 0],
  "Th-I": [1, 1, 0],
  "Th-N": [1, 1, 0],
  "Th-P": [1, 1, 0],
  "Th-As": [1, 1, 0],
  "Th-H": [1, 1, 0],
  "Ti-F": [1, 1, 0],
  "Ti-Cl": [1, 1, 0],
  "Ti-Br": [1, 1, 0],
  "Ti-O": [1, 1, 0],
  "Ti-S": [1, 1, 0],
  "Ti-I": [1, 1, 0],
  "Ti-Se": [1, 1, 0],
  "Ti-Te": [1, 1, 0],
  "Ti-N": [1, 1, 0],
  "Ti-P": [1, 1, 0],
  "Ti-As": [1, 1, 0],
  "Ti-H": [1, 1, 0],
  "Tl-O": [1, 1, 0],
  "Tl-S": [1, 1, 0],
  "Tl-F": [1, 1, 0],
  "Tl-Cl": [1, 1, 0],
  "Tl-Br": [1, 1, 0],
  "Tl-I": [1, 1, 0],
  "Tl-Se": [1, 1, 0],
  "Tl-Te": [1, 1, 0],
  "Tl-N": [1, 1, 0],
  "Tl-P": [1, 1, 0],
  "Tl-As": [1, 1, 0],
  "Tl-H": [1, 1, 0],
  "Tm-O": [1, 1, 0],
  "Tm-S": [1, 1, 0],
  "Tm-Se": [1, 1, 0],
  "Tm-Te": [1, 1, 0],
  "Tm-F": [1, 1, 0],
  "Tm-Cl": [1, 1, 0],
  "Tm-Br": [1, 1, 0],
  "Tm-I": [1, 1, 0],
  "Tm-N": [1, 1, 0],
  "Tm-P": [1, 1, 0],
  "Tm-As": [1, 1, 0],
  "Tm-H": [1, 1, 0],
  "U-O": [1, 1, 0],
  "U-S": [1, 1, 0],
  "U-F": [1, 1, 0],
  "U-Cl": [1, 1, 0],
  "U-Br": [1, 1, 0],
  "U-I": [1, 1, 0],
  "U-N": [1, 1, 0],
  "U-Se": [1, 1, 0],
  "U-Te": [1, 1, 0],
  "U-P": [1, 1, 0],
  "U-As": [1, 1, 0],
  "U-H": [1, 1, 0],
  "V-O": [1, 1, 0],
  "V-Cl": [1, 1, 0],
  "V-S": [1, 1, 0],
  "V-F": [1, 1, 0],
  "V-Br": [1, 1, 0],
  "V-N": [1, 1, 0],
  "V-I": [1, 1, 0],
  "V-Se": [1, 1, 0],
  "V-Te": [1, 1, 0],
  "V-P": [1, 1, 0],
  "V-As": [1, 1, 0],
  "V-H": [1, 1, 0],
  "W-O": [1, 1, 0],
  "W-F": [1, 1, 0],
  "W-Cl": [1, 1, 0],
  "W-Br": [1, 1, 0],
  "W-I": [1, 1, 0],
  "W-S": [1, 1, 0],
  "W-Se": [1, 1, 0],
  "W-Te": [1, 1, 0],
  "W-N": [1, 1, 0],
  "W-P": [1, 1, 0],
  "W-As": [1, 1, 0],
  "W-H": [1, 1, 0],
  "Xe-O": [1, 1, 0],
  "Xe-F": [1, 1, 0],
  "Y-O": [1, 1, 0],
  "Y-S": [1, 1, 0],
  "Y-Se": [1, 1, 0],
  "Y-Te": [1, 1, 0],
  "Y-F": [1, 1, 0],
  "Y-Cl": [1, 1, 0],
  "Y-Br": [1, 1, 0],
  "Y-I": [1, 1, 0],
  "Y-N": [1, 1, 0],
  "Y-P": [1, 1, 0],
  "Y-As": [1, 1, 0],
  "Y-H": [1, 1, 0],
  "Yb-O": [1, 1, 0],
  "Yb-N": [1, 1, 0],
  "Yb-S": [1, 1, 0],
  "Yb-Se": [1, 1, 0],
  "Yb-Te": [1, 1, 0],
  "Yb-F": [1, 1, 0],
  "Yb-Cl": [1, 1, 0],
  "Yb-Br": [1, 1, 0],
  "Yb-I": [1, 1, 0],
  "Yb-P": [1, 1, 0],
  "Yb-As": [1, 1, 0],
  "Yb-H": [1, 1, 0],
  "Zn-O": [1, 1, 0],
  "Zn-S": [1, 1, 0],
  "Zn-Se": [1, 1, 0],
  "Zn-Te": [1, 1, 0],
  "Zn-F": [1, 1, 0],
  "Zn-Cl": [1, 1, 0],
  "Zn-Br": [1, 1, 0],
  "Zn-I": [1, 1, 0],
  "Zn-N": [1, 1, 0],
  "Zn-P": [1, 1, 0],
  "Zn-As": [1, 1, 0],
  "Zn-H": [1, 1, 0],
  "Zr-O": [1, 1, 0],
  "Zr-F": [1, 1, 0],
  "Zr-Cl": [1, 1, 0],
  "Zr-S": [1, 1, 0],
  "Zr-Se": [1, 1, 0],
  "Zr-Te": [1, 1, 0],
  "Zr-Br": [1, 1, 0],
  "Zr-I": [1, 1, 0],
  "Zr-N": [1, 1, 0],
  "Zr-P": [1, 1, 0],
  "Zr-As": [1, 1, 0],
  "Zr-H": [1, 1, 0]
}, radiiData = { Covalent: covalentRadii, VDW: vdwRadii };
class Specie {
  constructor(e) {
    if (!e)
      throw new Error("Element is required for Specie.");
    this.element = e;
  }
  get element() {
    return this._element;
  }
  set element(e) {
    if (!elementAtomicNumbers[e])
      throw new Error(`Element '${e}' is invalid.`);
    this._element = e;
  }
  get number() {
    return elementAtomicNumbers[this.element];
  }
}
class Atom {
  constructor(e, t) {
    this.symbol = e, this.position = [...t];
  }
}
class Atoms {
  constructor({ symbols: e = null, positions: t = null, cell: s = null, pbc: i = null, species: n = null, attributes: r = null } = {}) {
    if (this.uuid = null, this.symbols = e ? [...e] : [], this.positions = t ? [...t] : [], this.symbols.length !== this.positions.length)
      throw new Error("The length of symbols should be the same as positions.");
    if (this.setCell({
      cell: s || [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
      ]
    }), this.setPBC({ pbc: i || [!1, !1, !1] }), this.isUndefinedCell() && this.pbc.some((a) => a))
      throw new Error("Periodic boundary conditions (pbc) cannot be true when the cell dimensions are all zero.");
    this.setSpecies({ species: n || {}, symbols: this.symbols }), this.setAttributes({ attributes: r || { atom: {}, specie: {} } });
  }
  setSpecies(e, t = null) {
    let s = e;
    if (e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "species") && ({ species: s, symbols: t = null } = e), this.species = {}, typeof s != "object")
      throw new Error("Species should be a dictionary.");
    Object.entries(s).forEach(([i, n]) => {
      this.addSpecie({ symbol: i, element: n });
    }), t && new Set(t).forEach((n) => {
      this.species[n] || this.addSpecie({ symbol: n });
    });
  }
  setAttributes(e) {
    let t = e;
    e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "attributes") && ({ attributes: t } = e), t || (t = {}), this.attributes = { atom: {}, specie: {}, "inter-specie": {} };
    for (const s in t)
      for (const i in t[s])
        this.newAttribute({ name: i, values: t[s][i], domain: s });
  }
  _ensureAtomGroups() {
    const e = this.attributes.atom;
    let t = e.groups;
    if (Array.isArray(t) || (t = []), t.length !== this.positions.length)
      if (t.length < this.positions.length)
        for (; t.length < this.positions.length; )
          t.push([]);
      else
        t.length = this.positions.length;
    for (let s = 0; s < t.length; s++)
      Array.isArray(t[s]) || (t[s] = []);
    return e.groups = t, t;
  }
  listGroups() {
    const e = this.attributes.atom.groups;
    if (!Array.isArray(e))
      return [];
    const t = /* @__PURE__ */ new Set();
    return e.forEach((s) => {
      Array.isArray(s) && s.forEach((i) => t.add(String(i)));
    }), Array.from(t).sort();
  }
  getGroupIndices(e) {
    const t = String(e), s = this.attributes.atom.groups;
    if (!Array.isArray(s))
      return [];
    const i = [];
    for (let n = 0; n < s.length; n++) {
      const r = s[n];
      Array.isArray(r) && r.includes(t) && i.push(n);
    }
    return i;
  }
  addAtomsToGroup(e, t) {
    let s = e;
    e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "indices") && ({ indices: s, group: t } = e), Array.isArray(s) || (s = [s]);
    const i = String(t), n = this._ensureAtomGroups();
    s.forEach((r) => {
      if (r < 0 || r >= n.length)
        throw new Error("Index out of bounds.");
      n[r].includes(i) || n[r].push(i);
    });
  }
  removeAtomsFromGroup(e, t) {
    let s = e;
    e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "indices") && ({ indices: s, group: t } = e), Array.isArray(s) || (s = [s]);
    const i = String(t), n = this._ensureAtomGroups();
    s.forEach((r) => {
      if (r < 0 || r >= n.length)
        throw new Error("Index out of bounds.");
      n[r] = n[r].filter((a) => a !== i);
    });
  }
  clearGroup(e) {
    const t = String(e), s = this.attributes.atom.groups;
    if (!Array.isArray(s))
      return 0;
    let i = 0;
    for (let n = 0; n < s.length; n++) {
      const r = s[n];
      if (!Array.isArray(r))
        continue;
      const a = r.filter((l) => l !== t);
      i += r.length - a.length, s[n] = a;
    }
    return i;
  }
  newAttribute(e, t, s = "atom") {
    let i = e;
    if (e && typeof e == "object" && !Array.isArray(e) && ({ name: i, values: t, domain: s = "atom" } = e), s === "atom") {
      if (t.length !== this.positions.length)
        throw new Error("The number of values does not match the number of atoms.");
      this.attributes.atom[i] = JSON.parse(JSON.stringify(t));
    } else if (s === "specie") {
      for (const n of Object.keys(this.species))
        if (!(n in t))
          throw new Error(`Value for specie '${n}' is missing.`);
      this.attributes.specie[i] = JSON.parse(JSON.stringify(t));
    } else if (s === "inter-specie")
      this.attributes["inter-specie"][i] = JSON.parse(JSON.stringify(t));
    else
      throw new Error('Invalid domain. Must be either "atom", "specie", or "inter-specie".');
  }
  getAttribute(e, t = "atom") {
    let s = e;
    if (e && typeof e == "object" && !Array.isArray(e) && ({ name: s, domain: t = "atom" } = e), t === "atom") {
      if (s === "positions")
        return this.positions;
      if (s === "symbols")
        return this.symbols;
      if (s === "index")
        return Array.from({ length: this.positions.length }, (i, n) => n);
      if (!this.attributes.atom[s])
        throw new Error(`Attribute '${s}' is not defined. The available attributes are: ${Object.keys(this.attributes.atom)}`);
      return this.attributes.atom[s];
    } else if (t === "specie") {
      if (!this.attributes.specie[s])
        throw new Error(`Attribute '${s}' is not defined. The available attributes are: ${Object.keys(this.attributes.specie)}`);
      return this.attributes.specie[s];
    } else if (t === "inter-specie") {
      if (!this.attributes[t][s])
        throw new Error(`Attribute '${s}' is not defined in inter-specie domain. The available attributes are: ${Object.keys(this.attributes[t])}`);
      return this.attributes[t][s];
    } else
      throw new Error('Invalid domain. Must be either "atom", "specie", or "inter-specie".');
  }
  setCell(e) {
    let t = e;
    if (e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "cell") && ({ cell: t } = e), t.length === 9)
      this.cell = [
        [t[0], t[1], t[2]],
        [t[3], t[4], t[5]],
        [t[6], t[7], t[8]]
      ];
    else if (t.length === 6)
      this.cell = convertToMatrixFromABCAlphaBetaGamma(t);
    else if (t.length === 3)
      if (t[0].length === 3)
        this.cell = t;
      else {
        const [s, i, n] = t;
        this.cell = convertToMatrixFromABCAlphaBetaGamma([s, i, n, 90, 90, 90]);
      }
    else
      throw new Error("Invalid cell dimensions provided. Expected 3x3 matrix, 1x6, or 1x3 array.");
  }
  isUndefinedCell() {
    return this.cell.some((e) => e.every((t) => t === 0));
  }
  getCellLengthsAndAngles() {
    const [e, t, s] = this.cell.map((a) => Math.sqrt(a[0] ** 2 + a[1] ** 2 + a[2] ** 2)), i = Math.acos((this.cell[1][0] * this.cell[2][0] + this.cell[1][1] * this.cell[2][1] + this.cell[1][2] * this.cell[2][2]) / (t * s)) * 180 / Math.PI, n = Math.acos((this.cell[0][0] * this.cell[2][0] + this.cell[0][1] * this.cell[2][1] + this.cell[0][2] * this.cell[2][2]) / (e * s)) * 180 / Math.PI, r = Math.acos((this.cell[0][0] * this.cell[1][0] + this.cell[0][1] * this.cell[1][1] + this.cell[0][2] * this.cell[1][2]) / (e * t)) * 180 / Math.PI;
    return [e, t, s, i, n, r];
  }
  setPBC(e) {
    let t = e;
    e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "pbc") && ({ pbc: t } = e), typeof t == "boolean" && (t = [t, t, t]), this.pbc = t;
  }
  addSpecie(e, t = null) {
    let s = e;
    if (e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "symbol") && ({ symbol: s, element: t = null } = e), this.species[s])
      throw new Error(`Specie '${s}' is already defined.`);
    t || (t = s), t instanceof Specie ? this.species[s] = t : this.species[s] = new Specie(t);
  }
  getSymbols() {
    return this.symbols;
  }
  getElements() {
    return this.symbols.map((e) => this.species[e].element);
  }
  addAtom(e) {
    let t = e;
    if (e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "atom") && ({ atom: t } = e), !this.species[t.symbol])
      throw new Error(`Specie '${t.symbol}' is not defined.`);
    this.positions.push(t.position), this.symbols.push(t.symbol), this.attributes.atom.groups && this._ensureAtomGroups();
  }
  removeAtom(e) {
    let t = e;
    e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "index") && ({ index: t } = e), this.positions.splice(t, 1), this.symbols.splice(t, 1);
    for (const s in this.attributes.atom)
      this.attributes.atom[s].splice(t, 1);
  }
  getSpeciesCount() {
    return Object.keys(this.species).length;
  }
  getAtomsCount() {
    return this.positions.length;
  }
  add(e) {
    let t = e;
    e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "otherAtoms") && ({ otherAtoms: t } = e);
    for (const i in t.species)
      if (this.species[i] && this.species[i].element !== t.species[i].element)
        throw new Error(`Specie '${i}' is defined in both Atoms objects with different elements.`);
    (this.attributes.atom.groups || t.attributes && t.attributes.atom && t.attributes.atom.groups) && (this.attributes.atom.groups || (this.attributes.atom.groups = Array.from({ length: this.positions.length }, () => [])), typeof t._ensureAtomGroups == "function" && t._ensureAtomGroups()), this.species = { ...this.species, ...t.species }, this.positions = [...this.positions, ...t.positions], this.symbols = [...this.symbols, ...t.symbols];
    for (const i in this.attributes.atom)
      this.attributes.atom[i] = [...this.attributes.atom[i], ...t.attributes.atom[i]];
    for (const i in this.attributes.specie)
      this.attributes.specie[i] = {
        // the order is important, the attributes of the added atoms should not overwrite the original ones
        ...t.attributes.specie[i],
        ...this.attributes.specie[i]
      };
  }
  multiply(e, t, s) {
    let i = e;
    if (e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "mx") && ({ mx: i, my: t, mz: s } = e), this.isUndefinedCell())
      throw new Error("Cell matrix is not defined.");
    const n = new Atoms();
    n.species = { ...this.species };
    const [[r, a, l], [c, h, d], [u, p, m]] = this.cell;
    n.setCell({
      cell: [
        [r * i, a * i, l * i],
        [c * t, h * t, d * t],
        [u * s, p * s, m * s]
      ]
    });
    for (let g = 0; g < i; g++)
      for (let y = 0; y < t; y++)
        for (let f = 0; f < s; f++)
          for (let w = 0; w < this.positions.length; w++) {
            const [b, x, S] = this.positions[w], M = b + g * this.cell[0][0] + y * this.cell[1][0] + f * this.cell[2][0], E = x + g * this.cell[0][1] + y * this.cell[1][1] + f * this.cell[2][1], v = S + g * this.cell[0][2] + y * this.cell[1][2] + f * this.cell[2][2];
            n.symbols.push(this.symbols[w]), n.positions.push([M, E, v]);
          }
    for (const g in this.attributes.atom) {
      const y = this.attributes.atom[g], f = [];
      for (let w = 0; w < i; w++)
        for (let b = 0; b < t; b++)
          for (let x = 0; x < s; x++)
            for (let S = 0; S < y.length; S++)
              f.push(y[S]);
      n.newAttribute({ name: g, values: f, domain: "atom" });
    }
    for (const g in this.attributes.specie)
      n.newAttribute({ name: g, values: JSON.parse(JSON.stringify(this.attributes.specie[g])), domain: "specie" });
    return n;
  }
  translate(e) {
    let t = e;
    e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "vector") && ({ vector: t } = e), this.positions = this.positions.map(([s, i, n]) => [s + t[0], i + t[1], n + t[2]]);
  }
  rotate(e, t, s = !1) {
    let i = e;
    e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "axis") && ({ axis: i, angle: t, rotate_cell: s = !1 } = e);
    const n = t * Math.PI / 180, r = Math.sqrt(i[0] ** 2 + i[1] ** 2 + i[2] ** 2), [a, l, c] = [i[0] / r, i[1] / r, i[2] / r], h = Math.cos(n), d = Math.sin(n), u = [
      h + a * a * (1 - h),
      a * l * (1 - h) - c * d,
      a * c * (1 - h) + l * d,
      l * a * (1 - h) + c * d,
      h + l * l * (1 - h),
      l * c * (1 - h) - a * d,
      c * a * (1 - h) - l * d,
      c * l * (1 - h) + a * d,
      h + c * c * (1 - h)
    ];
    for (let p = 0; p < this.positions.length; p++) {
      const [m, g, y] = this.positions[p];
      this.positions[p][0] = u[0] * m + u[1] * g + u[2] * y, this.positions[p][1] = u[3] * m + u[4] * g + u[5] * y, this.positions[p][2] = u[6] * m + u[7] * g + u[8] * y;
    }
    if (s && this.cell) {
      const p = Array(3).fill(0).map(() => Array(3).fill(0));
      for (let m = 0; m < 3; m++)
        for (let g = 0; g < 3; g++)
          p[m][g] = u[0 + g] * this.cell[m][0] + u[3 + g] * this.cell[m][1] + u[6 + g] * this.cell[m][2];
      this.cell = p;
    }
  }
  center(e = 0, t = [0, 1, 2], s = null) {
    let i = e;
    if (e && typeof e == "object" && (Object.prototype.hasOwnProperty.call(e, "vacuum") || Object.prototype.hasOwnProperty.call(e, "axis") || Object.prototype.hasOwnProperty.call(e, "center")) && ({ vacuum: i = 0, axis: t = [0, 1, 2], center: s = null } = e), !this.cell)
      throw new Error("Cell is not defined.");
    let n = [0, 0, 0];
    for (let l = 0; l < this.positions.length; l++)
      n[0] += this.positions[l][0], n[1] += this.positions[l][1], n[2] += this.positions[l][2];
    n = n.map((l) => l / this.positions.length);
    let r = [0, 0, 0];
    if (s)
      r = s;
    else
      for (let l = 0; l < 3; l++)
        t.includes(l) && (r[l] = (this.cell[0][l] + this.cell[1][l] + this.cell[2][l]) / 2);
    const a = r.map((l, c) => l - n[c]);
    if (this.translate({ vector: a }), i !== null)
      for (let l = 0; l < 3; l++)
        t.includes(l) && (this.cell[l][l] += 2 * i);
  }
  deleteAtoms(e) {
    let t = e;
    e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "indices") && ({ indices: t } = e), Array.isArray(t) || (t = [t]);
    const s = new Set(t);
    this.positions = this.positions.filter((n, r) => !s.has(r)), this.symbols = this.symbols.filter((n, r) => !s.has(r));
    for (const n in this.attributes.atom)
      this.attributes.atom[n] = this.attributes.atom[n].filter((r, a) => !s.has(a));
    const i = new Set(this.symbols);
    for (const n in this.species)
      if (!i.has(n)) {
        delete this.species[n];
        for (const r in this.attributes.specie)
          delete this.attributes.specie[r][n];
      }
  }
  replaceAtoms(e, t, s = null) {
    let i = e;
    e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "indices") && ({ indices: i, newSpecieSymbol: t, newSpecieElement: s = null } = e), this.species[t] || this.addSpecie({ symbol: t, element: s });
    for (const n of i)
      if (n >= 0 && n < this.symbols.length)
        this.symbols[n] = t;
      else
        throw new Error("Index out of bounds.");
  }
  toDict() {
    const e = {
      uuid: this.uuid,
      species: {},
      positions: [],
      cell: Array.from(this.cell || []),
      pbc: Array.from(this.pbc),
      symbols: [],
      attributes: JSON.parse(JSON.stringify(this.attributes))
    };
    for (const [t, s] of Object.entries(this.species))
      e.species[t] = s.element;
    return e.positions = this.positions.map((t) => [...t]), e.symbols = [...this.symbols], e;
  }
  calculateFractionalCoordinates() {
    if (this.isUndefinedCell())
      throw new Error("Cell matrix is not defined.");
    let e = this.cell;
    e = e[0].map((s, i) => e.map((n) => n[i]));
    const t = calculateInverseMatrix(e);
    return this.positions.map((s) => {
      const i = t[0][0] * s[0] + t[0][1] * s[1] + t[0][2] * s[2], n = t[1][0] * s[0] + t[1][1] * s[1] + t[1][2] * s[2], r = t[2][0] * s[0] + t[2][1] * s[1] + t[2][2] * s[2];
      return [i, n, r];
    });
  }
  getAtomsByIndices(e) {
    let t = e;
    e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "indices") && ({ indices: t } = e);
    const s = {
      cell: JSON.parse(JSON.stringify(this.cell)),
      pbc: JSON.parse(JSON.stringify(this.pbc)),
      species: {},
      symbols: [],
      positions: []
    }, i = { atom: {}, specie: {} };
    for (const a in this.attributes)
      for (const l in this.attributes[a])
        i[a][l] = a === "atom" ? [] : this.attributes[a][l];
    t.forEach((a) => {
      if (a < 0 || a >= this.positions.length)
        throw new Error("Index out of bounds.");
      s.symbols.push(this.symbols[a]), s.positions.push(this.positions[a]);
      for (const l in this.attributes.atom)
        i.atom[l].push(this.attributes.atom[l][a]);
    }), new Set(s.symbols).forEach((a) => {
      s.species[a] = this.species[a].element;
    });
    const r = new Atoms(s);
    return r.attributes = i, r;
  }
  getCenterOfGeometry() {
    const e = [0, 0, 0];
    for (let t = 0; t < this.positions.length; t++)
      e[0] += this.positions[t][0], e[1] += this.positions[t][1], e[2] += this.positions[t][2];
    return e[0] /= this.positions.length, e[1] /= this.positions.length, e[2] /= this.positions.length, e;
  }
  copy() {
    const e = this.toDict(), t = new Atoms(e), s = { atom: {}, specie: {}, "inter-specie": {} };
    for (const i in this.attributes)
      for (const n in this.attributes[i])
        s[i][n] = JSON.parse(JSON.stringify(this.attributes[i][n]));
    return t.attributes = s, t;
  }
}
const KV_PAIR = /([A-Za-z_][A-Za-z0-9_-]*)\s*=\s*("[^"]*"|'[^']*'|\{[^}]*\}|\S+)/g;
function unquote(o) {
  return o.startsWith('"') && o.endsWith('"') || o.startsWith("'") && o.endsWith("'") || o.startsWith("{") && o.endsWith("}") ? o.slice(1, -1) : o;
}
function parseExtHeader(o) {
  const e = {};
  let t;
  for (; (t = KV_PAIR.exec(o)) !== null; ) {
    const s = t[1];
    let i = unquote(t[2]);
    if (/^[\d.+\-eE,\s]+$/.test(i)) {
      const n = i.split(/[ ,]+/).map(Number);
      i = n.length > 1 ? n : n[0];
    }
    e[s] = i;
  }
  return e;
}
function parseXYZ(o) {
  const e = o.trim().split(`
`);
  let t = 0;
  const s = [];
  for (; t < e.length; ) {
    const i = e[t].trim();
    if (!i) {
      t++;
      continue;
    }
    const n = parseInt(i);
    if (t++, isNaN(n) || t + n > e.length)
      throw new Error("Invalid XYZ file format");
    const r = e[t++].trim(), a = r.includes("=") ? parseExtHeader(r) : {}, l = { symbols: [], positions: [], attributes: { atom: {} } };
    let c = null;
    if (a.Lattice) {
      const u = Array.isArray(a.Lattice) ? a.Lattice : a.Lattice.split(/[ ,]+/).map(Number);
      c = [
        [u[0], u[1], u[2]],
        [u[3], u[4], u[5]],
        [u[6], u[7], u[8]]
      ];
    }
    if (c && (l.cell = c), a.pbc) {
      const u = Array.isArray(a.pbc) ? a.pbc : typeof a.pbc == "string" ? a.pbc.split(/[ ,]+/).map((p) => p === "T" || p === "true") : [!!a.pbc];
      l.pbc = u;
    }
    let h = ["species", "pos"];
    if (a.Properties) {
      const u = a.Properties.split(":");
      h = [];
      for (let p = 0; p < u.length; p += 3) {
        const m = u[p], g = parseInt(u[p + 2], 10);
        h.push({ name: m, ncol: g });
      }
    } else
      h = [
        { name: "species", ncol: 1 },
        { name: "pos", ncol: 3 }
      ];
    h.forEach((u) => {
      ["species", "pos"].includes(u.name) || (l.attributes.atom[u.name] = Array(n).fill(null).map(() => []));
    });
    for (let u = 0; u < n; u++, t++) {
      const p = e[t].trim().split(/\s+/);
      let m = 0, g, y, f, w;
      h.forEach((b) => {
        const x = p.slice(m, m + b.ncol);
        if (m += b.ncol, b.name === "species")
          g = x[0];
        else if (b.name === "pos")
          [y, f, w] = x.map(parseFloat);
        else {
          const S = x.map((M) => isNaN(M) ? M : +M);
          l.attributes.atom[b.name][u] = b.ncol === 1 ? S[0] : S;
        }
      }), l.symbols.push(g), l.positions.push([y, f, w]);
    }
    const d = new Atoms(l);
    s.push(d);
  }
  return s;
}
function parseCIF(o) {
  const e = {
    cell: [],
    pbc: [!0, !0, !0],
    species: {},
    positions: [],
    symbols: []
  }, t = CIFData.parseCIFBlock(o);
  return t.applySymmetryOperations(), e.cell = convertToMatrixFromABCAlphaBetaGamma([...t.unitCell.lengths, ...t.unitCell.angles]), e.symbols = t.atoms.map((i) => {
    const n = i.type_symbol.match(/[A-Z][a-z]?/);
    return n ? n[0] : null;
  }), e.positions = t.atoms.map((i) => {
    const n = [i.fract_x, i.fract_y, i.fract_z];
    return calculateCartesianCoordinates(e.cell, n);
  }), new Atoms(e);
}
class CIFData {
  constructor() {
    this.tags = {}, this.loops = [], this.unitCell = null, this.atoms = [];
  }
  static parseCIFBlock(o) {
    const e = new CIFData(), t = o.split(`
`).map((i) => i.trim());
    let s = null;
    for (let i = 0; i < t.length; i++) {
      const n = t[i];
      if (!(n === "" || n.startsWith("#"))) {
        if (n.startsWith("_")) {
          s && (e.loops.push(s), s = null);
          const [r, a] = CIFData.parseTag(n, t, i);
          e.tags[r.toLowerCase()] = CIFData.convertValue(a);
        } else if (n.toLowerCase() === "loop_") {
          for (s && e.loops.push(s), s = { headers: [], rows: [] }, i++; t[i] && t[i].startsWith("_"); )
            s.headers.push(t[i].split(" ")[0].toLowerCase()), i++;
          i--;
        } else if (s && !n.startsWith("#")) {
          const r = CIFData.parseLoopRow(n);
          r.length > 0 && s.rows.push(r);
        }
      }
    }
    return s && e.loops.push(s), e.parseUnitCell(), e.parseAtoms(), e;
  }
  static parseTag(o, e, t) {
    let [s, ...i] = o.split(" "), n = i.join(" ");
    if (n.startsWith(";"))
      for (n = n.substring(1).trim(), t++; t < e.length && !e[t].startsWith(";"); )
        n += `
` + e[t], t++;
    return [s, n];
  }
  getTagValue(o) {
    return this.tags[o] || null;
  }
  getAnyTagValue(o) {
    for (let e of o) {
      const t = this.getTagValue(e);
      if (t !== null)
        return t;
    }
    return null;
  }
  getSpaceGroupNumber() {
    return this.getAnyTagValue(["_space_group.it_number", "_space_group_it_number", "_symmetry_int_tables_number"]);
  }
  getSpaceGroupName() {
    const o = this.getAnyTagValue(["_space_group_name_h-m_alt", "_symmetry_space_group_name_h-m", "_space_group.Patterson_name_h-m", "_space_group.patterson_name_h-m"]);
    return { Abm2: "Aem2", Aba2: "Aea2", Cmca: "Cmce", Cmma: "Cmme", Ccca: "Ccc1" }[o] || o;
  }
  static parseLoopRow(o) {
    let e = [];
    const t = /'([^']*)'|"([^"]*)"|(\S+)/g;
    let s;
    for (; (s = t.exec(o)) !== null; )
      e.push(s[1] || s[2] || s[3]);
    return e.map((i) => CIFData.convertValue(i));
  }
  static convertValue(o) {
    let e = Number(o);
    return isNaN(e) ? o : e;
  }
  parseUnitCell() {
    const o = ["_cell_length_a", "_cell_length_b", "_cell_length_c"], e = ["_cell_angle_alpha", "_cell_angle_beta", "_cell_angle_gamma"];
    o.every((t) => t in this.tags) && e.every((t) => t in this.tags) && (this.unitCell = {
      lengths: o.map((t) => parseFloat(this.tags[t])),
      angles: e.map((t) => parseFloat(this.tags[t]))
    });
  }
  parseAtoms() {
    const o = this.loops.find((e) => e.headers.includes("_atom_site_fract_x") || e.headers.includes("_atom_site_cartn_x"));
    o && o.rows.forEach((e) => {
      const t = {};
      o.headers.forEach((s, i) => {
        const n = s.replace("_atom_site_", "");
        t[n] = CIFData.convertValue(e[i]);
      }), this.atoms.push(t);
    });
  }
  parseSymmetryOperations() {
    const o = this.loops.find((t) => t.headers.includes("_symmetry_equiv_pos_as_xyz") || t.headers.includes("_space_group_symop_operation_xyz"));
    if (!o) return [];
    const e = o.headers.includes("_symmetry_equiv_pos_as_xyz") ? "_symmetry_equiv_pos_as_xyz" : "_space_group_symop_operation_xyz";
    return o.rows.map((t) => {
      const s = t[o.headers.indexOf(e)];
      return this.parseSymmetryOperation(s);
    });
  }
  parseSymmetryOperation(opString) {
    let matrix = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ], vector = [0, 0, 0];
    const components = opString.split(",").map((o) => o.trim());
    return components.forEach((component, index) => {
      const translationMatch = component.match(/[+-]\s*(\d+\/\d+|\d*\.\d+|\d+)$/);
      if (translationMatch) {
        const translationValue = eval(translationMatch[1]);
        vector[index] = translationValue;
      }
      component.includes("x") && (matrix[index][0] = component.startsWith("-") ? -1 : 1), component.includes("y") && (matrix[index][1] = component.startsWith("-") ? -1 : 1), component.includes("z") && (matrix[index][2] = component.startsWith("-") ? -1 : 1);
    }), { matrix, vector };
  }
  applySymmetryOperations(o = 1e-3, e = !0) {
    if (this.symmetryOps = this.parseSymmetryOperations(), this.getSpaceGroupName && this.symmetryOps.length === 0)
      throw new Error("The space group is defined, but no symmetry operations are found. We cannot handle this case yet.");
    this.symmetryOps.length === 0 && this.symmetryOps.push({
      matrix: [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
      ],
      vector: [0, 0, 0]
    });
    let t = [];
    this.atoms.forEach((s) => {
      this.symmetryOps.forEach(({ matrix: i, vector: n }) => {
        const r = this.applySymmetryOperation(s, i, n);
        this.isUniqueSite(r, t, o) && (e && (r.fract_x = (r.fract_x + 1) % 1, r.fract_y = (r.fract_y + 1) % 1, r.fract_z = (r.fract_z + 1) % 1), t.push(r));
      });
    }), this.atoms = t;
  }
  applySymmetryOperation(o, e, t) {
    const s = [o.fract_x, o.fract_y, o.fract_z], i = [0, 0, 0];
    for (let r = 0; r < 3; r++)
      i[r] = s.reduce((a, l, c) => a + e[r][c] * l, 0);
    const n = i.map((r, a) => r + t[a]);
    return {
      ...o,
      fract_x: n[0],
      fract_y: n[1],
      fract_z: n[2]
    };
  }
  isUniqueSite(o, e, t) {
    for (const s of e)
      if (this.calculateDistance(o, s) < t)
        return !1;
    return !0;
  }
  calculateDistance(o, e) {
    const s = [0, 1, 2].map((i) => o[`fract_${"xyz"[i]}`] - e[`fract_${"xyz"[i]}`]).map((i) => i - Math.round(i));
    return Math.sqrt(s.reduce((i, n) => i + n * n, 0));
  }
}
function formatNumber(o) {
  return typeof o != "number" || Number.isNaN(o) ? "0" : o.toFixed(6);
}
function atomsToXYZ(o) {
  const e = Array.isArray(o) ? o : [o], t = [];
  return e.forEach((s) => {
    const i = s.positions.length;
    t.push(String(i));
    const n = [];
    if (!s.isUndefinedCell()) {
      const r = s.cell.flat().map((a) => formatNumber(a)).join(" ");
      n.push(`Lattice="${r}"`);
    }
    if (Array.isArray(s.pbc)) {
      const r = s.pbc.map((a) => a ? "T" : "F").join(" ");
      n.push(`pbc="${r}"`);
    }
    n.push("Properties=species:S:1:pos:R:3"), t.push(n.join(" "));
    for (let r = 0; r < i; r += 1) {
      const a = s.symbols[r], [l, c, h] = s.positions[r];
      t.push(`${a} ${formatNumber(l)} ${formatNumber(c)} ${formatNumber(h)}`);
    }
  }), t.join(`
`);
}
function atomsToCIF(o) {
  const e = !o.isUndefinedCell(), [t, s, i, n, r, a] = e ? o.getCellLengthsAndAngles() : [1, 1, 1, 90, 90, 90], l = e ? o.calculateFractionalCoordinates() : o.positions, c = [
    "data_weas",
    "_symmetry_space_group_name_H-M 'P 1'",
    "_symmetry_Int_Tables_number 1",
    `_cell_length_a ${formatNumber(t)}`,
    `_cell_length_b ${formatNumber(s)}`,
    `_cell_length_c ${formatNumber(i)}`,
    `_cell_angle_alpha ${formatNumber(n)}`,
    `_cell_angle_beta ${formatNumber(r)}`,
    `_cell_angle_gamma ${formatNumber(a)}`,
    "loop_",
    "_atom_site_label",
    "_atom_site_type_symbol"
  ];
  e ? c.push("_atom_site_fract_x", "_atom_site_fract_y", "_atom_site_fract_z") : c.push("_atom_site_Cartn_x", "_atom_site_Cartn_y", "_atom_site_Cartn_z");
  for (let h = 0; h < o.symbols.length; h += 1) {
    const d = o.symbols[h], [u, p, m] = l[h], g = `${d}${h + 1}`;
    c.push(`${g} ${d} ${formatNumber(u)} ${formatNumber(p)} ${formatNumber(m)}`);
  }
  return c.join(`
`);
}
function downloadText(o, e, t = "text/plain") {
  const s = new Blob([o], { type: t }), i = URL.createObjectURL(s), n = document.createElement("a");
  n.href = i, n.download = e, document.body.appendChild(n), n.click(), document.body.removeChild(n), URL.revokeObjectURL(i);
}
function parseStructureText(o, e) {
  const t = e.toLowerCase();
  if (t === ".xyz")
    return { kind: "atoms", data: parseXYZ(o) };
  if (t === ".cif")
    return { kind: "atoms", data: parseCIF(o) };
  if (t === "on")
    return { kind: "json", data: JSON.parse(o) };
  throw new Error(`Unsupported file extension: ${e}`);
}
function applyStructurePayload(o, e) {
  if (!e || typeof e != "object")
    throw new Error("Invalid structure payload.");
  if (e.version || e.atoms) {
    o.importState(e);
    return;
  }
  if (Array.isArray(e)) {
    const t = e.map((s) => s instanceof Atoms ? s : new Atoms(s));
    o.avr.atoms = t;
    return;
  }
  if (e instanceof Atoms) {
    o.avr.atoms = e;
    return;
  }
  if (e.symbols && e.positions) {
    o.avr.atoms = new Atoms(e);
    return;
  }
  throw new Error("Unrecognized structure payload.");
}
function buildExportPayload(o, e) {
  const t = String(e || "").toLowerCase();
  if (t === "html") {
    const s = o.exportState();
    return {
      text: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>WEAS Viewer</title>
  </head>
  <body>
    <div id="viewer" style="position: relative; width: 100%; height: 800px"></div>
    <script type="module">
      import { WEAS } from "https://unpkg.com/weas@0.2.10/dist/index.mjs";
      const domElement = document.getElementById("viewer");
      const editor = new WEAS({ domElement });
      const snapshot = ${JSON.stringify(s, null, 2).replace(/<\/(script)/gi, "<\\/$1")};
      editor.importState(snapshot);
      editor.render();
    <\/script>
  </body>
</html>
`,
      filename: "weas-viewer.html",
      mimeType: "text/html"
    };
  }
  if (t === "json")
    return {
      text: JSON.stringify(o.exportState(), null, 2),
      filename: "weas-stateon",
      mimeType: "application/json"
    };
  if (t === "xyz") {
    const s = Array.isArray(o.avr.trajectory) && o.avr.trajectory.length > 1 ? o.avr.trajectory : o.avr.atoms;
    return {
      text: atomsToXYZ(s),
      filename: "structure.xyz",
      mimeType: "chemical/x-xyz"
    };
  }
  if (t === "cif")
    return {
      text: atomsToCIF(o.avr.atoms),
      filename: "structure.cif",
      mimeType: "chemical/x-cif"
    };
  throw new Error(`Unsupported export format: ${e}`);
}
class GUIManager {
  constructor(e, t) {
    this.weas = e;
    const s = {
      ...defaultGuiConfig.buttons,
      ...t?.buttons || {}
    }, i = {
      ...defaultGuiConfig.controls,
      ...t?.controls || {}
    }, n = {
      ...defaultGuiConfig.timeline,
      ...t?.timeline || {}
    }, r = t?.atomLegend || t?.legend || {}, a = { ...defaultGuiConfig.atomLegend, ...r }, l = {
      ...defaultGuiConfig.meshLegend,
      ...t?.meshLegend || {}
    }, c = {
      ...defaultGuiConfig.buttonStyle,
      ...t?.buttonStyle || {}
    };
    this.guiConfig = {
      ...defaultGuiConfig,
      ...t,
      buttons: s,
      controls: i,
      timeline: n,
      atomLegend: a,
      legend: a,
      meshLegend: l,
      buttonStyle: c
    }, this.gui = new GUI(), this.gui.closed = !0, this.guiConfig.controls.enabled ? this.initGUI() : this.gui.hide();
  }
  initGUI() {
    this.createGUIContainer(), this.addMaterialsFolder(), this.addShapeOperationsFolder(), this.addCameraControlsFolder(), this.addCameraSettingsFolder(), this.addHUDSettingsFolder(), this.addLegendHUDFolder();
  }
  createGUIContainer() {
    const e = this.weas.tjs.hud;
    this.gui.domElement.parentElement && this.gui.domElement.parentElement.removeChild(this.gui.domElement), this.gui.domElement.style.pointerEvents = "auto";
    const t = this.gui.domElement.querySelector("ul");
    t && (t.style.paddingTop = "25px"), e.addPanel("controls", this.gui.domElement, {
      anchor: "top-left",
      offset: { x: 1, y: 1 }
      // 1% offset from top left
    });
    const s = (i) => i.stopPropagation();
    ["click", "keydown", "keyup", "keypress"].forEach((i) => {
      this.gui.domElement.addEventListener(i, s, !1);
    });
  }
  /* ---------------- Materials Folder ---------------- */
  addMaterialsFolder() {
    const e = this.gui.addFolder("Materials"), t = this.weas.materialsRegistry, s = () => {
      const i = Object.entries(e.__folders).filter(([n, r]) => !r.closed).map(([n]) => n);
      for (let n in e.__folders)
        e.removeFolder(e.__folders[n]);
      for (const n of t.list()) {
        const r = t.getMaterial(n, !1), a = r.__builtIn ? `${n} (built-in)` : n, l = e.addFolder(a);
        i.includes(a) && l.open(), this.addFolderFromSchema(l, r, t.getSchema(n), {
          lockBuiltIn: r.__builtIn
        }), l.add(
          {
            copy: () => {
              let c = n + " Copy", h = 1, d = `${c} (${h})`;
              for (; t.list().includes(d); )
                h++, d = `${c} (${h})`;
              t.copyMaterial(n, d);
            }
          },
          "copy"
        ).name("Copy"), r.__builtIn || l.add(
          {
            rename: () => {
              const c = prompt("Rename material to:", n);
              if (!(!c || c === n)) {
                if (t.list().includes(c)) {
                  alert(`Material "${c}" already exists.`);
                  return;
                }
                t.renameMaterial(n, c);
              }
            }
          },
          "rename"
        ).name("Rename");
      }
    };
    this.refreshMaterials = () => {
      s(), this.refreshShapes && this.refreshShapes();
    }, t.onChange && t.onChange(this.refreshMaterials), this.refreshMaterials();
  }
  /* ---------------- Shapes Folder (Operation-based) ---------------- */
  addShapeOperationsFolder() {
    const e = this.gui.addFolder("Shapes"), t = this.weas.shapeRegistry, s = () => {
      for (; e.__controllers.length > 0; )
        e.remove(e.__controllers[0]);
      for (const i of t.list())
        e.add(
          {
            create: () => {
              this.weas.ops.Shapes.ShapeOperation({ shapeName: i, options: {} });
            }
          },
          "create"
        ).name(i);
    };
    this.refreshShapeOperations = s, t.onChange && t.onChange(this.refreshShapeOperations), this.weas.materialsRegistry?.onChange && this.weas.materialsRegistry.onChange(this.refreshShapeOperations), this.refreshShapeOperations();
  }
  /* ---------------- Camera Folder (Camera-manager based) ---------------- */
  addCameraControlsFolder() {
    const e = this.gui.addFolder("Camera Views"), t = this.weas.tjs.cameraController, s = () => {
      for (; e.__controllers.length > 0; )
        e.remove(e.__controllers[0]);
      t.list().forEach((i) => {
        t._builtInViews.has(i), e.add({ load: () => t.view(i) }, "load").name(`View ${i}`);
      }), e.add(
        {
          save: () => {
            const i = prompt("Name of new camera view:");
            i && (t.saveView(i), s());
          }
        },
        "save"
      ).name("Save Current View");
    };
    s();
  }
  addCameraSettingsFolder() {
    const e = this.gui.addFolder("Camera Settings"), t = this.weas.tjs.cameraController;
    if (!t) return;
    const s = () => {
      for (; e.__controllers.length; )
        e.remove(e.__controllers[0]);
      for (const [i, n] of Object.entries(t.paramSchema))
        n.gui && (n.type === "select" ? e.add(t, i, n.options).onChange((r) => {
          typeof t.setCameraType == "function" && t.setCameraType(r);
        }) : typeof t[i] == "boolean" ? e.add(t, i) : e.add(t, i, n.min, n.max, n.step));
      e.add({ reset: () => t.resetSettings() }, "reset");
    };
    t.onChange(s), s();
  }
  // TODO - move this into the HUD Controller in a similar pattern to Camera
  addHUDSettingsFolder() {
    const e = this.gui.addFolder("HUD Settings"), t = this.weas.tjs.hud;
    if (!t) return;
    const s = () => {
      for (; e.__controllers.length; )
        e.remove(e.__controllers[0]);
      t.miniScenes.forEach((i, n) => {
        const r = e.addFolder(n);
        for (const a of ["top", "bottom", "left", "right"])
          i.position[a] != null && r.add(i.position, a, 0, 2500, 1).onChange((l) => t.setMiniScenePosition(n, { [a]: l }));
        r.add(i, "width", 50, 500, 1).onChange((a) => {
          i.width = a, i.canvas.width = a;
        }), r.add(i, "height", 50, 500, 1).onChange((a) => {
          i.height = a, i.canvas.height = a;
        }), r.add(i, "rotation").onChange((a) => i.rotation = a), r.add(i, "visible").onChange((a) => i.visible = a);
      });
      for (const [i, n] of t.htmlElements) {
        const r = e.addFolder(i + " (HTML)");
        r.add(n, "anchor", t.ANCHORS).onChange(() => t._updateHTMLPosition(i)), r.add(n.offset, "x", -51, 150, 1).name("Offset % X").onChange(() => t._updateHTMLPosition(i)), r.add(n.offset, "y", -51, 151, 1).name("Offset % Y").onChange(() => t._updateHTMLPosition(i)), r.add(n, "visible").name("Visible").onChange((a) => t.setHTMLPanelVisible(i, a));
      }
    };
    t.onChange?.(s), s();
  }
  addLegendHUDFolder() {
    const e = this.gui.addFolder("Legend Appearance"), t = this.weas.tjs.hud.legendHUD;
    t && this.addFolderFromSchema(
      e,
      t.settings,
      t.getSchema(),
      (s, i) => t.updateSettings({ [s]: i })
    );
  }
  // generic method to add a gui folder from a schema and
  // a callback function (if updates are required)
  addFolderFromSchema(e, t, s, i) {
    for (const [n, r] of Object.entries(s)) {
      let a;
      switch (r.type) {
        case "number":
          a = e.add(
            t,
            n,
            r.min,
            r.max,
            r.step
          );
          break;
        case "color":
          a = e.addColor(t, n);
          break;
        case "string":
          a = e.add(t, n);
          break;
        default:
          continue;
      }
      const l = r.label ?? n;
      typeof i == "function" ? a?.name(l).onChange(() => {
        i(n, t[n]);
      }) : a?.name(l);
    }
  }
}
class BaseOperation {
  constructor(e) {
    this.weas = e, this.affectsAtoms = !0;
  }
  execute() {
    throw new Error("Method 'execute()' must be implemented.");
  }
  undo() {
    throw new Error("Method 'undo()' must be implemented.");
  }
  redo() {
    this.redoStatePatch() || this.execute();
  }
  setupGUI(e) {
    const t = this.getUISchema();
    if (!t)
      return;
    const { title: s, fields: i } = normalizeUISchema(t);
    s && renameFolder(e, s);
    const n = {};
    Object.keys(i).forEach((r) => {
      const a = i[r];
      a.path ? n[r] = getByPath$1(this, a.path) : n[r] = this[r];
    }), Object.entries(i).forEach(([r, a]) => {
      const l = resolveOptions(a.options, this), c = addController(e, n, r, a, l);
      if (!c)
        return;
      a.step !== void 0 && c.step && c.step(a.step), (a.type === "text" && typeof c.onFinishChange == "function" ? c.onFinishChange : c.onChange).call(c, () => {
        this.adjust({ ...n });
      });
    });
  }
  validateParams() {
    return !0;
  }
  /*
   * Use adjustWithReset() when execute() is non-idempotent (e.g., add/remove/transform),
   * so GUI tweaks don't accumulate side-effects on each adjustment.
   */
  adjustWithReset(e, t) {
    this.validateParams(e) && (t(), this.applyParams(e), this.execute(), this.weas && this.weas.ops && typeof this.weas.ops.onOperationAdjusted == "function" && this.weas.ops.onOperationAdjusted(this));
  }
  applyParams(e) {
    const t = this.getUISchema();
    if (t) {
      const { fields: s } = normalizeUISchema(t);
      Object.entries(e).forEach(([i, n]) => {
        const r = s[i];
        if (r && r.path) {
          setByPath(this, r.path, n);
          return;
        }
        i in this && (this[i] = n);
      });
      return;
    }
    Object.entries(e).forEach(([s, i]) => {
      s in this && (this[s] = i);
    });
  }
  adjust(e) {
    this.validateParams(e) && (this.applyParams(e), this.execute(), this.weas && this.weas.ops && typeof this.weas.ops.onOperationAdjusted == "function" && this.weas.ops.onOperationAdjusted(this));
  }
  getUISchema() {
    return this.uiFields || this.constructor.ui || null;
  }
  supportsAdjustGUI() {
    const e = this.getUISchema();
    if (!e)
      return !1;
    const { fields: t } = normalizeUISchema(e);
    return t && Object.keys(t).length > 0;
  }
  ensureStateStore() {
    if (!this.weas || !this.weas.state)
      throw new Error("State store is required for this operation.");
  }
  stateGet(e, t = void 0) {
    this.ensureStateStore();
    const s = this.weas.state.get(e);
    return s === void 0 ? t : s;
  }
  stateSet(e, t) {
    this.ensureStateStore();
    const s = buildStatePatch(e, t);
    return this.weas.state.set(s), !0;
  }
  captureStatePatch(e, t, s) {
    const i = this.stateGet(e, {}), n = {};
    return Object.keys(t || {}).forEach((r) => {
      i && Object.prototype.hasOwnProperty.call(i, r) ? n[r] = cloneValue$2(i[r]) : s && (n[r] = cloneValue$2(s(r)));
    }), n;
  }
  applyStatePatch(e, t) {
    return this.stateSet(e, t);
  }
  applyStatePatchWithHistory(e, t, s) {
    this.ensureStateStore();
    const i = this.captureStatePatch(e, t, s);
    return this._stateHistory = { path: e, previous: i, next: cloneValue$2(t) }, this.stateSet(e, t), !0;
  }
  undoStatePatch() {
    return this._stateHistory ? (this.ensureStateStore(), this.stateSet(this._stateHistory.path, this._stateHistory.previous), !0) : !1;
  }
  redoStatePatch() {
    return this._stateHistory ? (this.ensureStateStore(), this.stateSet(this._stateHistory.path, this._stateHistory.next), !0) : !1;
  }
}
function renameFolder(o, e) {
  const t = o.domElement.querySelector(".title");
  t && (t.textContent = e);
}
function normalizeUISchema(o) {
  return o.fields ? { title: o.title || null, fields: o.fields } : { title: o.title || null, fields: o };
}
function resolveOptions(o, e) {
  return o ? typeof o == "function" ? o(e) : o : null;
}
function addController(o, e, t, s, i) {
  return s.type === "color" ? o.addColor(e, t) : s.type === "boolean" ? o.add(e, t) : s.type === "number" && s.min !== void 0 && s.max !== void 0 ? o.add(e, t, s.min, s.max) : s.type === "select" && i || i ? o.add(e, t, i) : o.add(e, t);
}
function getByPath$1(o, e) {
  const t = e.split(".");
  let s = o;
  for (const i of t) {
    if (!s)
      return;
    s = s[i];
  }
  return s;
}
function setByPath(o, e, t) {
  const s = e.split(".");
  let i = o;
  for (let n = 0; n < s.length - 1; n++) {
    const r = s[n];
    i[r] || (i[r] = {}), i = i[r];
  }
  i[s[s.length - 1]] = t;
}
function cloneValue$2(o) {
  return o === void 0 ? o : JSON.parse(JSON.stringify(o));
}
function buildStatePatch(o, e) {
  if (!o)
    return e;
  const t = o.split("."), s = {};
  let i = s;
  for (let n = 0; n < t.length - 1; n++)
    i[t[n]] = {}, i = i[t[n]];
  return i[t[t.length - 1]] = e, s;
}
class TranslateOperation extends BaseOperation {
  static description = "Translate";
  static category = "Edit";
  static ui = {
    title: "Translate",
    fields: {
      x: { type: "number", min: -10, max: 10, step: 0.1, path: "vector.x" },
      y: { type: "number", min: -10, max: 10, step: 0.1, path: "vector.y" },
      z: { type: "number", min: -10, max: 10, step: 0.1, path: "vector.z" }
    }
  };
  constructor({ weas: e, vector: t = new THREE.Vector3(), constraintType: s = null, axis: i = null, planeNormal: n = null }) {
    super(e), this.currentFrame = e.avr.currentFrame, this.selectedAtomsIndices = Array.from(this.stateGet("viewer.selectedAtomsIndices", []) || []), this.selectedObjects = e.selectionManager.selectedObjects, Array.isArray(t) && (t = new THREE.Vector3(t[0], t[1], t[2])), this.vector = t.clone(), this.constraintType = s || null, this.axis = i ? i.clone() : new THREE.Vector3(), this.normal = new THREE.Vector3(), this.planeNormal = new THREE.Vector3(), this.planeU = new THREE.Vector3(), this.planeV = new THREE.Vector3(), this.distance = 0, this.uDistance = 0, this.vDistance = 0, this.constraintType === "axis" && this.axis.lengthSq() === 0 && this.axis.set(1, 0, 0), this.constraintType === "normal" && n && this.normal.copy(n), this.constraintType === "plane" && n && this.planeNormal.copy(n), this.refreshConstraintStateFromVector(), this.uiFields = this.buildUISchema();
  }
  execute() {
    this.weas.avr.currentFrame = this.currentFrame, this.weas.selectionManager.selectedObjects = this.selectedObjects, this.weas.avr.translateSelectedAtoms({ translateVector: this.vector, indices: this.selectedAtomsIndices }), this.weas.objectManager.translateSelectedObjects({ translateVector: this.vector }), this.weas.selectionManager.refreshAxisLine();
  }
  undo() {
    this.weas.avr.currentFrame = this.currentFrame;
    const e = this.vector.clone().negate();
    this.weas.avr.translateSelectedAtoms({ translateVector: e, indices: this.selectedAtomsIndices }), this.weas.selectionManager.selectedObjects = this.selectedObjects, this.weas.objectManager.translateSelectedObjects({ translateVector: e }), this.weas.selectionManager.refreshAxisLine();
  }
  adjust(e) {
    this.adjustWithReset(e, () => {
      this.undo();
    });
  }
  buildUISchema() {
    return this.constraintType === "axis" ? {
      title: "Translate (Axis)",
      fields: {
        distance: { type: "number", min: -10, max: 10, step: 0.1 },
        axisX: { type: "number", min: -1, max: 1, step: 0.01, path: "axis.x" },
        axisY: { type: "number", min: -1, max: 1, step: 0.01, path: "axis.y" },
        axisZ: { type: "number", min: -1, max: 1, step: 0.01, path: "axis.z" }
      }
    } : this.constraintType === "normal" ? {
      title: "Translate (Normal)",
      fields: {
        distance: { type: "number", min: -10, max: 10, step: 0.1 },
        normalX: { type: "number", min: -1, max: 1, step: 0.01, path: "normal.x" },
        normalY: { type: "number", min: -1, max: 1, step: 0.01, path: "normal.y" },
        normalZ: { type: "number", min: -1, max: 1, step: 0.01, path: "normal.z" }
      }
    } : this.constraintType === "plane" ? {
      title: "Translate (Plane)",
      fields: {
        u: { type: "number", min: -10, max: 10, step: 0.1, path: "uDistance" },
        v: { type: "number", min: -10, max: 10, step: 0.1, path: "vDistance" },
        normalX: { type: "number", min: -1, max: 1, step: 0.01, path: "planeNormal.x" },
        normalY: { type: "number", min: -1, max: 1, step: 0.01, path: "planeNormal.y" },
        normalZ: { type: "number", min: -1, max: 1, step: 0.01, path: "planeNormal.z" }
      }
    } : this.constructor.ui || null;
  }
  applyParams(e) {
    super.applyParams(e), this.refreshVectorFromConstraint();
  }
  refreshConstraintStateFromVector() {
    if (this.constraintType === "axis") {
      this.normalizeAxis(this.axis), this.distance = this.vector.dot(this.axis);
      return;
    }
    if (this.constraintType === "normal") {
      this.normalizeAxis(this.normal, new THREE.Vector3(0, 0, 1)), this.distance = this.vector.dot(this.normal);
      return;
    }
    if (this.constraintType === "plane") {
      this.ensurePlaneBasis(), this.uDistance = this.vector.dot(this.planeU), this.vDistance = this.vector.dot(this.planeV);
      return;
    }
  }
  refreshVectorFromConstraint() {
    if (this.constraintType === "axis") {
      this.normalizeAxis(this.axis), this.vector.copy(this.axis).multiplyScalar(this.distance || 0);
      return;
    }
    if (this.constraintType === "normal") {
      this.normalizeAxis(this.normal, new THREE.Vector3(0, 0, 1)), this.vector.copy(this.normal).multiplyScalar(this.distance || 0);
      return;
    }
    this.constraintType === "plane" && (this.ensurePlaneBasis(), this.vector.copy(this.planeU).multiplyScalar(this.uDistance || 0).add(this.planeV.clone().multiplyScalar(this.vDistance || 0)));
  }
  normalizeAxis(e, t = new THREE.Vector3(1, 0, 0)) {
    (!e || e.lengthSq() === 0) && e.copy(t), e.normalize();
  }
  ensurePlaneBasis() {
    this.normalizeAxis(this.planeNormal, new THREE.Vector3(0, 0, 1));
    const e = this.planeNormal, t = Math.abs(e.x) < 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0), s = new THREE.Vector3().crossVectors(e, t);
    s.lengthSq() === 0 && s.crossVectors(e, new THREE.Vector3(0, 0, 1)), s.normalize();
    const i = new THREE.Vector3().crossVectors(e, s).normalize();
    this.planeU.copy(s), this.planeV.copy(i);
  }
}
class RotateOperation extends BaseOperation {
  static description = "Rotate";
  static category = "Edit";
  static ui = {
    title: "Rotate",
    fields: {
      angle: { type: "number", min: -360, max: 360, step: 1, path: "angle" },
      x: { type: "number", min: -1, max: 1, step: 0.01, path: "axis.x" },
      y: { type: "number", min: -1, max: 1, step: 0.01, path: "axis.y" },
      z: { type: "number", min: -1, max: 1, step: 0.01, path: "axis.z" }
    }
  };
  constructor({ weas: e, axis: t, angle: s, centroid: i = null }) {
    super(e), this.currentFrame = e.avr.currentFrame, this.selectedAtomsIndices = Array.from(this.stateGet("viewer.selectedAtomsIndices", []) || []), this.selectedObjects = e.selectionManager.selectedObjects, Array.isArray(t) && (t = new THREE.Vector3(t[0], t[1], t[2])), this.axis = t, this.angle = s, this.centroid = i;
  }
  execute() {
    this.weas.avr.currentFrame = this.currentFrame, this.weas.selectionManager.selectedObjects = this.selectedObjects, this.weas.avr.rotateSelectedAtoms({ cameraDirection: this.axis, rotationAngle: this.angle, indices: this.selectedAtomsIndices, centroid: this.centroid }), this.weas.objectManager.rotateSelectedObjects({ rotationAxis: this.axis, rotationAngle: this.angle }), this.weas.selectionManager.refreshAxisLine();
  }
  undo() {
    this.weas.avr.currentFrame = this.currentFrame, this.weas.selectionManager.selectedObjects = this.selectedObjects, this.weas.avr.rotateSelectedAtoms({ cameraDirection: this.axis, rotationAngle: -this.angle, indices: this.selectedAtomsIndices, centroid: this.centroid }), this.weas.objectManager.rotateSelectedObjects({ rotationAxis: this.axis, rotationAngle: -this.angle }), this.weas.selectionManager.refreshAxisLine();
  }
  adjust(e) {
    this.adjustWithReset(e, () => {
      this.undo();
    });
  }
}
class ScaleOperation extends BaseOperation {
  static description = "Scale";
  static category = "Edit";
  static ui = {
    title: "Scale",
    fields: {
      x: { type: "number", min: 1e-3, max: 10, step: 0.01, path: "scale.x" },
      y: { type: "number", min: 1e-3, max: 10, step: 0.01, path: "scale.y" },
      z: { type: "number", min: 1e-3, max: 10, step: 0.01, path: "scale.z" }
    }
  };
  constructor({ weas: e, scale: t = new THREE.Vector3() }) {
    super(e), this.currentFrame = e.avr.currentFrame, this.selectedAtomsIndices = Array.from(this.stateGet("viewer.selectedAtomsIndices", []) || []), this.selectedObjects = e.selectionManager.selectedObjects, Array.isArray(t) && (t = new THREE.Vector3(t[0], t[1], t[2])), this.scale = t.clone();
  }
  execute() {
    this.weas.avr.currentFrame = this.currentFrame, this.weas.selectionManager.selectedObjects = this.selectedObjects, this.weas.objectManager.scaleSelectedObjects({ scale: this.scale });
  }
  undo() {
    this.weas.avr.currentFrame = this.currentFrame, this.weas.selectionManager.selectedObjects = this.selectedObjects;
    const e = new THREE.Vector3(1 / this.scale.x, 1 / this.scale.y, 1 / this.scale.z);
    this.weas.objectManager.scaleSelectedObjects({ scale: e });
  }
  adjust(e) {
    this.adjustWithReset(e, () => {
      this.undo();
    });
  }
}
const transform = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  RotateOperation,
  ScaleOperation,
  TranslateOperation
}, Symbol.toStringTag, { value: "Module" }));
class TransformControls {
  constructor(e, t) {
    this.weas = e, this.eventHandler = t, this.tjs = e.tjs, this.objectMode = "edit", this.mode = null, this.init();
  }
  init() {
    this.translatePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), this.translateVector = new THREE.Vector3(), this.translateAxisLock = null, this.translateAxis = new THREE.Vector3(), this.translateConstraintType = null, this.translatePlaneNormal = new THREE.Vector3(), this.translatePlaneOrigin = new THREE.Vector3(), this.translatePlanePending = !1, this.rotationAxisLock = null, this.rotationAxis = new THREE.Vector3(), this.rotationAxisLockKey = null, this.rotationMatrix = new THREE.Matrix4(), this.centroid = new THREE.Vector3(), this.centroidNDC = new THREE.Vector2(), this.rotationAxis = new THREE.Vector3(), this.rotationCentroid = new THREE.Vector3(), this.initialAtomPositions = /* @__PURE__ */ new Map(), this.initialObjectState = /* @__PURE__ */ new Map(), this.cameraDirection = new THREE.Vector3(0, 0, -1);
  }
  attach(e) {
    this.controls.attach(e);
  }
  detach() {
    this.controls.detach();
  }
  enterMode(e, t) {
    if (this.mode = e, this.weas.avr.selectedAtomsIndices.length === 0 && this.weas.selectionManager.selectedObjects.length === 0) {
      this.mode = null, this.weas.selectionManager.hideAxisVisuals(), this.weas.selectionManager.setModeHint("Select atoms (or objects) first");
      return;
    }
    if (this.cameraDirection = new THREE.Vector3(0, 0, -1), this.cameraDirection.applyQuaternion(this.tjs.camera.quaternion), this.mode === "translate")
      this.translatePlane.normal.copy(this.cameraDirection), this.translateAxisLock = null, this.translateConstraintType = null, this.translatePlanePending = !1, this.weas.selectionManager.hideTranslateAxisLine(), this.weas.selectionManager.setModeHint("Translate mode: move mouse to translate, press A to set axis, X/Y/Z to lock"), this.weas.selectionManager.axisAtomIndices?.length === 3 ? this.setTranslatePlaneFromAtoms() : this.weas.selectionManager.axisAtomIndices?.length === 2 && this.setTranslateAxisFromAtoms();
    else if (this.mode === "rotate") {
      if (this.weas.selectionManager.showAxisVisuals(), this.rotationAxisLock = null, this.rotationAxisLockKey = null, this.weas.selectionManager.hideRotateAxisLine(), this.refreshRotationPivot(), !this.mode) {
        this.weas.selectionManager.hideAxisVisuals(), this.weas.selectionManager.setModeHint("");
        return;
      }
      this.weas.selectionManager.setModeHint("Rotate mode: move mouse to rotate, press A to set axis, X/Y/Z to lock");
    } else this.mode === "scale" && (this.getCentroidNDC(), this.weas.selectionManager.setModeHint("Scale mode: move mouse to scale, click to confirm"));
    this.initialMousePosition = t.clone(), this.storeInitialObjectState();
  }
  onMouseMove(e) {
    this.mode === "translate" ? this.translateSelectedObjects(e) : this.mode === "rotate" ? this.rotateSelectedObjects(e) : this.mode === "scale" && this.scaleSelectedObjects(e);
  }
  confirmOperation() {
    const e = this.mode;
    if (this.mode === "translate") {
      const t = this.getTranslateVector(this.eventHandler.currentMousePosition, this.initialMousePosition), s = this.translateConstraintType;
      let i = null, n = null;
      s === "axis" ? i = this.translateAxis.clone() : (s === "plane" || s === "normal") && (n = this.translatePlaneNormal.clone());
      const r = new TranslateOperation({
        weas: this.weas,
        vector: t,
        constraintType: s,
        axis: i,
        planeNormal: n
      });
      this.weas.ops.execute(r, !1);
    } else if (this.mode === "rotate") {
      const t = this.getRotationAngle(this.eventHandler.currentMousePosition, this.initialMousePosition), s = new RotateOperation({ weas: this.weas, axis: this.rotationAxis, angle: t, centroid: this.rotationCentroid });
      this.weas.ops.execute(s, !1);
    } else if (this.mode === "scale") {
      const t = this.getScaleVector(this.eventHandler.currentMousePosition, this.initialMousePosition), s = new ScaleOperation({ weas: this.weas, scale: t });
      this.weas.ops.execute(s, !1);
    }
    this.mode = null, e === "rotate" && (this.weas.selectionManager.hideAxisVisuals(), this.weas.selectionManager.stopAxisPicking(), this.weas.selectionManager.hideRotateAxisLine(), this.rotationAxisLock = null, this.rotationAxisLockKey = null), e === "translate" && (this.weas.selectionManager.hideTranslateAxisLine(), this.weas.selectionManager.hideAxisVisuals(), this.weas.selectionManager.stopAxisPicking("Translate mode: move mouse to translate, press A to set axis, X/Y/Z to lock"), this.weas.selectionManager.hideTranslatePlane(), this.translateAxisLock = null, this.translateConstraintType = null, this.translatePlaneNormal.set(0, 0, 0), this.translatePlaneOrigin.set(0, 0, 0), this.translatePlanePending = !1), this.weas.selectionManager.setModeHint(""), this.initialAtomPositions.clear(), this.weas.avr.selectedAtomsIndices.length > 0 && (this.weas.avr.drawModels(), this.weas.avr.selectedAtomsIndices = this.weas.avr.selectedAtomsIndices);
  }
  exitMode() {
    if (!this.mode)
      return;
    const e = this.mode;
    this.mode = null, this.weas.avr.resetSelectedAtomsPositions({ initialAtomPositions: this.initialAtomPositions }), this.weas.ops.hideGUI(), e === "rotate" && (this.weas.selectionManager.hideAxisVisuals(), this.weas.selectionManager.stopAxisPicking(), this.weas.selectionManager.hideRotateAxisLine(), this.rotationAxisLock = null, this.rotationAxisLockKey = null), e === "translate" && (this.weas.selectionManager.hideTranslateAxisLine(), this.weas.selectionManager.hideAxisVisuals(), this.weas.selectionManager.stopAxisPicking("Translate mode: move mouse to translate, press A to set axis, X/Y/Z to lock"), this.weas.selectionManager.hideTranslatePlane(), this.translateAxisLock = null, this.translateConstraintType = null, this.translatePlaneNormal.set(0, 0, 0), this.translatePlaneOrigin.set(0, 0, 0), this.translatePlanePending = !1), this.weas.selectionManager.setModeHint(""), this.weas.selectionManager.selectedObjects.forEach((t) => {
      const s = this.initialObjectState.get(t.uuid);
      t.position.copy(s.position), t.scale.copy(s.scale), t.rotation.copy(s.rotation);
    });
  }
  getCentroidNDC(e = null) {
    if (this.weas.avr.selectedAtomsIndices.length > 0)
      e || (e = new THREE.Vector3(0, 0, 0), this.weas.avr.selectedAtomsIndices.forEach((s) => {
        e.add(new THREE.Vector3(...this.weas.avr.atoms.positions[s]));
      }), e.divideScalar(this.weas.avr.selectedAtomsIndices.length));
    else if (this.weas.selectionManager.selectedObjects.length > 0)
      e || (e = new THREE.Vector3(0, 0, 0), this.weas.selectionManager.selectedObjects.forEach((s) => {
        e.add(s.position);
      }), e.divideScalar(this.weas.selectionManager.selectedObjects.length));
    else {
      this.mode = null;
      return;
    }
    const t = e.clone().project(this.tjs.camera);
    this.centroidNDC = new THREE.Vector2(t.x, t.y);
  }
  refreshRotationPivot() {
    this.updateRotationReference(), this.getCentroidNDC(this.rotationCentroid);
  }
  updateRotationReference() {
    if (this.rotationAxis.copy(this.cameraDirection), this.rotationCentroid.set(0, 0, 0), this.rotationAxisLock) {
      this.rotationAxis.copy(this.rotationAxisLock);
      const s = this.getSelectionCentroid();
      this.rotationCentroid.copy(s);
      return;
    }
    const e = this.weas.selectionManager.axisAtomIndices || [], t = this.weas.avr.selectedAtomsIndices;
    if (e.length === 3) {
      const s = this.weas?.avr?.atoms?.positions;
      if (s && s[e[0]] && s[e[1]] && s[e[2]]) {
        const i = new THREE.Vector3(...s[e[0]]), n = new THREE.Vector3(...s[e[1]]), r = new THREE.Vector3(...s[e[2]]), a = n.clone().sub(i).cross(r.clone().sub(i));
        if (a.lengthSq() > 0) {
          const l = a.normalize();
          l.dot(this.cameraDirection) < 0 && l.negate(), this.rotationAxis.copy(l), this.rotationCentroid.copy(
            i.clone().add(n).add(r).multiplyScalar(1 / 3)
          );
          return;
        }
      }
    } else if (e.length === 2) {
      const s = new THREE.Vector3(...this.weas.avr.atoms.positions[e[0]]), i = new THREE.Vector3(...this.weas.avr.atoms.positions[e[1]]), n = i.clone().sub(s);
      if (n.lengthSq() > 0) {
        this.rotationAxis.copy(n.normalize()), this.rotationCentroid.copy(s.clone().add(i).multiplyScalar(0.5));
        return;
      }
    } else if (e.length === 1) {
      this.rotationCentroid.copy(new THREE.Vector3(...this.weas.avr.atoms.positions[e[0]]));
      return;
    }
    if (t.length === 3) {
      const s = this.weas?.avr?.atoms?.positions;
      if (s && s[t[0]] && s[t[1]] && s[t[2]]) {
        const i = new THREE.Vector3(...s[t[0]]), n = new THREE.Vector3(...s[t[1]]), r = new THREE.Vector3(...s[t[2]]), a = n.clone().sub(i).cross(r.clone().sub(i));
        if (a.lengthSq() > 0) {
          const l = a.normalize();
          l.dot(this.cameraDirection) < 0 && l.negate(), this.rotationAxis.copy(l), this.rotationCentroid.copy(
            i.clone().add(n).add(r).multiplyScalar(1 / 3)
          );
          return;
        }
      }
    }
    t.length > 0 ? (t.forEach((s) => {
      this.rotationCentroid.add(new THREE.Vector3(...this.weas.avr.atoms.positions[s]));
    }), this.rotationCentroid.divideScalar(t.length)) : this.weas.selectionManager.selectedObjects.length > 0 && (this.weas.selectionManager.selectedObjects.forEach((s) => {
      this.rotationCentroid.add(s.position);
    }), this.rotationCentroid.divideScalar(this.weas.selectionManager.selectedObjects.length));
  }
  storeInitialObjectState() {
    this.weas.avr.selectedAtomsIndices.forEach((e) => {
      const t = new THREE.Matrix4();
      this.weas.avr.atomManager.meshes.atom.getMatrixAt(e, t);
      const s = new THREE.Vector3();
      t.decompose(s, new THREE.Quaternion(), new THREE.Vector3()), this.initialAtomPositions.set(e, s.clone());
    }), this.weas.selectionManager.selectedObjects.forEach((e) => {
      this.initialObjectState.set(e.uuid, {
        position: e.position.clone(),
        scale: e.scale.clone(),
        rotation: e.rotation.clone()
      });
    });
  }
  translateSelectedObjects(e) {
    const t = this.getTranslateVector(this.eventHandler.currentMousePosition, this.eventHandler.previousMousePosition);
    this.weas.avr.translateSelectedAtoms({ translateVector: t }), this.weas.objectManager.translateSelectedObjects({ translateVector: t }), this.weas.selectionManager.refreshAxisLine();
  }
  getNDC(e) {
    return new THREE.Vector2((e.x - this.tjs.viewerRect.left) / this.tjs.viewerRect.width * 2 - 1, -((e.y - this.tjs.viewerRect.top) / this.tjs.viewerRect.height) * 2 + 1);
  }
  getTranslateVector(e, t) {
    const s = this.getNDC(e), i = getWorldPositionFromScreen(this.tjs.camera, s, this.translatePlane), n = this.getNDC(t), r = getWorldPositionFromScreen(this.tjs.camera, n, this.translatePlane), a = i.sub(r);
    if (this.translatePlanePending)
      return new THREE.Vector3(0, 0, 0);
    if (!this.translateConstraintType)
      return a;
    if (this.translateConstraintType === "axis")
      return this.translateAxis.clone().multiplyScalar(a.dot(this.translateAxis));
    if (this.translateConstraintType === "plane") {
      const l = this.translatePlaneNormal.clone().normalize();
      return a.sub(l.multiplyScalar(a.dot(l)));
    }
    if (this.translateConstraintType === "normal") {
      const l = this.translatePlaneNormal.clone().normalize();
      return l.multiplyScalar(a.dot(l));
    }
    return a;
  }
  rotateSelectedObjects(e) {
    const t = this.getRotationAngle(this.eventHandler.currentMousePosition, this.eventHandler.previousMousePosition);
    Math.abs(t) > 1e-4 && (this.weas.avr.rotateSelectedAtoms({ cameraDirection: this.rotationAxis, rotationAngle: t, centroid: this.rotationCentroid }), this.weas.objectManager.rotateSelectedObjects({ rotationAxis: this.rotationAxis, rotationAngle: t }), this.weas.selectionManager.refreshAxisLine());
  }
  scaleSelectedObjects(e) {
    const t = this.getScaleVector(this.eventHandler.currentMousePosition, this.eventHandler.previousMousePosition);
    t && (this.weas.objectManager.scaleSelectedObjects({ scale: t }), this.weas.selectionManager.refreshAxisLine());
  }
  setTranslateAxisLock(e) {
    if (!e) {
      this.translateAxisLock = null, this.translateConstraintType = null, this.translatePlanePending = !1, this.weas.selectionManager.hideTranslateAxisLine(), this.weas.selectionManager.setModeHint("Translate mode: move mouse to translate, press A to set axis, X/Y/Z to lock");
      return;
    }
    this.translateAxisLock = e, this.translateConstraintType = "axis", this.weas.selectionManager.hideTranslatePlane(), e === "x" ? this.translateAxis.set(1, 0, 0) : e === "y" ? this.translateAxis.set(0, 1, 0) : this.translateAxis.set(0, 0, 1);
    const t = this.getSelectionCentroid();
    this.weas.selectionManager.showTranslateAxisLine(t, this.translateAxis), this.weas.selectionManager.setModeHint(`Translate mode: locked to ${e.toUpperCase()} axis`);
  }
  setTranslateAxisFromAtoms() {
    const e = this.weas.selectionManager.axisAtomIndices || [];
    if (e.length !== 2)
      return !1;
    const t = this.weas?.avr?.atoms?.positions;
    if (!t || !t[e[0]] || !t[e[1]])
      return !1;
    const s = new THREE.Vector3(...t[e[0]]), n = new THREE.Vector3(...t[e[1]]).clone().sub(s);
    return n.lengthSq() === 0 ? !1 : (this.translateAxis.copy(n.normalize()), this.translateAxisLock = "axis", this.translateConstraintType = "axis", this.translatePlaneNormal.set(0, 0, 0), this.translatePlaneOrigin.set(0, 0, 0), this.translatePlanePending = !1, this.weas.selectionManager.hideTranslatePlane(), this.weas.selectionManager.hideTranslateAxisLine(), this.weas.selectionManager.showAxisVisuals(), this.weas.selectionManager.setModeHint("Translate mode: locked to atom axis"), !0);
  }
  setTranslatePlaneFromAtoms() {
    const e = this.weas.selectionManager.axisAtomIndices || [];
    if (e.length !== 3)
      return !1;
    const t = this.weas?.avr?.atoms?.positions;
    if (!t || !t[e[0]] || !t[e[1]] || !t[e[2]])
      return !1;
    const s = new THREE.Vector3(...t[e[0]]), i = new THREE.Vector3(...t[e[1]]), n = new THREE.Vector3(...t[e[2]]), r = i.clone().sub(s).cross(n.clone().sub(s));
    return r.lengthSq() === 0 ? !1 : (this.translatePlaneNormal.copy(r.normalize()), this.translatePlaneOrigin.copy(
      s.clone().add(i).add(n).multiplyScalar(1 / 3)
    ), this.translateConstraintType = null, this.translateAxisLock = null, this.translatePlanePending = !0, this.weas.selectionManager.hideTranslateAxisLine(), this.weas.selectionManager.showAxisVisuals(), this.weas.selectionManager.showTranslatePlane(this.translatePlaneOrigin, this.translatePlaneNormal), this.weas.selectionManager.setModeHint("Translate mode: choose plane (P) or normal (N)"), !0);
  }
  setTranslatePlaneConstraint(e) {
    e !== "plane" && e !== "normal" || this.translatePlaneNormal.lengthSq() !== 0 && (this.translateConstraintType = e, this.translateAxisLock = null, this.translatePlanePending = !1, this.weas.selectionManager.hideTranslateAxisLine(), this.weas.selectionManager.setModeHint(`Translate mode: locked to ${e}`));
  }
  setRotateAxisLock(e) {
    if (!e) {
      this.rotationAxisLock = null, this.rotationAxisLockKey = null, this.weas.selectionManager.hideRotateAxisLine(), this.weas.selectionManager.setModeHint("Rotate mode: move mouse to rotate, press A to set axis, X/Y/Z to lock"), this.refreshRotationPivot(), this.eventHandler?.currentMousePosition && (this.initialMousePosition = this.eventHandler.currentMousePosition.clone());
      return;
    }
    this.rotationAxisLockKey = e, e === "x" ? this.rotationAxisLock = new THREE.Vector3(1, 0, 0) : e === "y" ? this.rotationAxisLock = new THREE.Vector3(0, 1, 0) : this.rotationAxisLock = new THREE.Vector3(0, 0, 1);
    const t = this.getSelectionCentroid();
    this.weas.selectionManager.showRotateAxisLine(t, this.rotationAxisLock), this.weas.selectionManager.setModeHint(`Rotate mode: locked to ${e.toUpperCase()} axis`), this.refreshRotationPivot(), this.eventHandler?.currentMousePosition && (this.initialMousePosition = this.eventHandler.currentMousePosition.clone());
  }
  getSelectionCentroid() {
    const e = new THREE.Vector3(0, 0, 0);
    return this.weas.avr.selectedAtomsIndices.length > 0 ? (this.weas.avr.selectedAtomsIndices.forEach((t) => {
      e.add(new THREE.Vector3(...this.weas.avr.atoms.positions[t]));
    }), e.divideScalar(this.weas.avr.selectedAtomsIndices.length), e) : (this.weas.selectionManager.selectedObjects.length > 0 && (this.weas.selectionManager.selectedObjects.forEach((t) => {
      e.add(t.position);
    }), e.divideScalar(this.weas.selectionManager.selectedObjects.length)), e);
  }
  getScaleVector(e, t) {
    const s = this.getNDC(t), i = this.getNDC(e);
    if (s.equals(i))
      return;
    const n = new THREE.Vector2().subVectors(s, this.centroidNDC);
    let a = new THREE.Vector2().subVectors(i, this.centroidNDC).length() / n.length();
    return new THREE.Vector3(a, a, a);
  }
  getRotationAngle(e, t) {
    const s = this.getNDC(t), i = this.getNDC(e);
    if (s.equals(i))
      return;
    const n = new THREE.Vector2().subVectors(s, this.centroidNDC), r = new THREE.Vector2().subVectors(i, this.centroidNDC);
    n.normalize(), r.normalize();
    let a = Math.acos(n.dot(r));
    return n.x * r.y - n.y * r.x < 0 && (a = -a), a = THREE.MathUtils.radToDeg(a), a;
  }
}
function matchKey$1(o, e) {
  const t = e[e.length - 1], s = e.slice(0, -1);
  if (o.key.toLowerCase() !== t.toLowerCase()) return !1;
  const i = s.includes("ctrl"), n = s.includes("shift"), r = s.includes("alt"), a = s.includes("meta");
  return !(i !== o.ctrlKey || n !== o.shiftKey || r !== o.altKey || a !== o.metaKey);
}
class EventHandlers {
  // map named actions to their respective operation.
  // this could be moved to a private controller somewhere.
  actionMap = {
    exitMode: () => this.transformControls.exitMode(),
    undo: () => this.weas.ops.undo(),
    redo: () => this.weas.ops.redo(),
    adjustLastOperation: () => this.weas.ops.updateAdjustLastOperationGUI(),
    DeleteOperation: () => this.weas.ops.object.DeleteOperation(),
    enterObjectMode: () => {
      this.weas.objectManager.enterMode("object");
    },
    enterEditMode: () => {
      this.weas.objectManager.enterMode("edit");
    },
    TranslateOperation: () => this.transformControls.enterMode(
      "translate",
      this.currentMousePosition
    ),
    ScaleOperation: () => this.transformControls.enterMode("scale", this.currentMousePosition),
    RotateOperation: () => this.transformControls.enterMode("rotate", this.currentMousePosition),
    CopyOperation: () => {
      this.weas.ops.object.CopyOperation(), this.transformControls.enterMode(
        "translate",
        this.currentMousePosition
      );
    },
    ReplaceOperation: () => this.weas.ops.atoms.ReplaceOperation(),
    measure: () => this.weas.avr.Measurement.measure(this.weas.avr.selectedAtomsIndices),
    camera1: () => this.weas.tjs.cameraController.view("top"),
    camera3: () => this.weas.tjs.cameraController.view("front"),
    camera2: () => this.weas.tjs.cameraController.view("left"),
    camera4: () => this.weas.tjs.cameraController.view("bottom"),
    camera5: () => this.weas.tjs.cameraController.view("right"),
    camera6: () => this.weas.tjs.cameraController.view("back")
  };
  constructor(e) {
    this.weas = e, this.tjs = e.tjs, this.init(), this.transformControls = new TransformControls(e, this), this.setupEventListeners(), this.keybindConfig = e.keybindConfig || defaultKeyBindConfig;
  }
  init() {
    this.isMouseDown = !1, this.mouseDownPosition = new THREE.Vector2(), this.mouseUpPosition = new THREE.Vector2(), this.currentMousePosition = new THREE.Vector2(), this.previousMousePosition = new THREE.Vector2(), this.boxselect = !1, this.dragMode = null, this.isDragging = !1;
  }
  setupEventListeners() {
    const e = this.weas.tjs.containerElement;
    e.addEventListener("pointerdown", this.onMouseDown.bind(this), !1), e.addEventListener("pointerup", this.onMouseUp.bind(this), !1), e.addEventListener("click", this.onMouseClick.bind(this), !1), e.addEventListener("mousemove", this.onMouseMove.bind(this), !1), e.setAttribute("tabindex", "0"), e.addEventListener("keydown", this.onKeyDown.bind(this), !1);
  }
  onMouseDown(e) {
    this.isMouseDown = !0, this.mouseDownPosition.set(e.clientX, e.clientY), e.shiftKey && e.altKey && this.transformControls.mode === null && this.weas.selectionManager.startLasso(e);
  }
  onMouseUp(e) {
    this.isMouseDown = !1, this.isDragging = !1, this.mouseUpPosition.set(e.clientX, e.clientY), this.weas.selectionManager.finishLasso();
  }
  onMouseMove(e) {
    if (this.previousMousePosition.copy(this.currentMousePosition), this.currentMousePosition.set(e.clientX, e.clientY), this.isMouseDown) {
      const t = e.clientX - this.mouseDownPosition.x, s = e.clientY - this.mouseDownPosition.y;
      Math.sqrt(t * t + s * s) > 5 && (this.isDragging = !0);
    }
    if (this.transformControls.mode !== null) {
      if ((this.transformControls.mode === "rotate" || this.transformControls.mode === "translate") && this.weas.selectionManager.isAxisPicking)
        return;
      this.transformControls.onMouseMove(e);
    } else this.isMouseDown && e.shiftKey && e.altKey ? this.weas.selectionManager.dragLasso(e) : this.isMouseDown && e.shiftKey && this.weas.selectionManager.dragSelection(e);
  }
  handleTransformModeKeys(e) {
    const t = e.key.toLowerCase();
    if (this.transformControls.mode === "translate") {
      if (["x", "y", "z"].includes(t))
        return this.transformControls.setTranslateAxisLock(
          this.transformControls.translateAxisLock === t ? null : t
        ), !0;
      if (["p", "n"].includes(t))
        return this.transformControls.setTranslatePlaneConstraint(
          t === "p" ? "plane" : "normal"
        ), this.transformControls.initialMousePosition = this.currentMousePosition.clone(), !0;
      if (t === "a")
        return this.weas.selectionManager.isAxisPicking ? (this.weas.selectionManager.stopAxisPicking(
          "Translate mode: move mouse to translate, press A to set axis, X/Y/Z to lock"
        ), this.weas.selectionManager.axisAtomIndices.length === 3 ? this.transformControls.setTranslatePlaneFromAtoms() : this.weas.selectionManager.axisAtomIndices.length === 2 && this.transformControls.setTranslateAxisFromAtoms(), this.transformControls.initialMousePosition = this.currentMousePosition.clone()) : (this.transformControls.setTranslateAxisLock(null), this.weas.selectionManager.hideTranslatePlane(), this.weas.selectionManager.startAxisPicking("translate"), this.weas.selectionManager.setModeHint(
          "Axis pick: click 2 or 3 atoms, press A to exit"
        )), !0;
    }
    if (this.transformControls.mode === "rotate") {
      if (["x", "y", "z"].includes(t))
        return this.transformControls.setRotateAxisLock(
          this.transformControls.rotationAxisLockKey === t ? null : t
        ), !0;
      if (t === "a")
        return this.weas.selectionManager.isAxisPicking ? (this.weas.selectionManager.stopAxisPicking(), this.transformControls.refreshRotationPivot(), this.transformControls.initialMousePosition = this.currentMousePosition.clone()) : this.weas.selectionManager.startAxisPicking("rotate"), !0;
    }
    return !1;
  }
  onKeyDown(e) {
    if (!this.handleTransformModeKeys(e)) {
      for (const [t, s] of Object.entries(this.keybindConfig))
        if (s.some((i) => matchKey$1(e, i))) {
          const i = this.actionMap[t];
          i && i();
          return;
        }
    }
  }
  onMouseClick(e) {
    if (this.transformControls.mode === "rotate" && this.weas.selectionManager.isAxisPicking) {
      this.weas.selectionManager.pickAxisAtom(e), this.transformControls.refreshRotationPivot(), this.transformControls.initialMousePosition = this.currentMousePosition.clone();
      return;
    }
    if (this.transformControls.mode === "translate" && this.weas.selectionManager.isAxisPicking) {
      this.weas.selectionManager.pickAxisAtom(e);
      return;
    }
    if (this.transformControls.mode === "translate" && this.transformControls.translatePlanePending)
      return;
    if (this.transformControls.mode) {
      this.transformControls.confirmOperation();
      return;
    }
    this.weas.ops.hideGUI();
    const t = e.clientX - this.mouseDownPosition.x, s = e.clientY - this.mouseDownPosition.y;
    Math.sqrt(t * t + s * s) > 5 || this.weas.selectionManager.pickSelection(e);
  }
  // Call this method after updating atoms
  dispatchAtomsUpdated() {
    this.weas.avr.trajectory.uuid = THREE.MathUtils.generateUUID();
    const e = new CustomEvent("atomsUpdated", { detail: this.weas.avr.trajectory });
    this.tjs.containerElement.dispatchEvent(e);
  }
  // Call this method after updating atoms
  dispatchViewerUpdated(e) {
    const t = new CustomEvent("viewerUpdated", { detail: e });
    this.tjs.containerElement.dispatchEvent(t);
  }
}
class ObjectManager {
  constructor(e) {
    this.weas = e, this.selectionManager = e.selectionManager, this.scene = e.tjs.scene;
  }
  translateSelectedObjects(e, t = null) {
    let s = e;
    e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "translateVector") && ({ translateVector: s, selectedObjects: t = null } = e), t === null && (t = this.selectionManager.selectedObjects), t.forEach((i) => {
      const n = i.position.clone();
      i.position.copy(n.add(s));
    });
  }
  rotateSelectedObjects(e, t, s = null) {
    let i = e;
    e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "rotationAxis") && ({ rotationAxis: i, rotationAngle: t, selectedObjects: s = null } = e), s === null && (s = this.selectionManager.selectedObjects), i = i.normalize(), t = THREE.MathUtils.degToRad(t), s.forEach((n) => {
      n.rotateOnAxis(i, -t);
    });
  }
  deleteSelectedObjects() {
    this.selectionManager.selectedObjects.forEach((e) => {
      clearObject(this.scene, e);
    }), this.selectionManager.clearSelection();
  }
  scaleSelectedObjects(e, t = null) {
    let s = e;
    e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "scale") && ({ scale: s, selectedObjects: t = null } = e), t === null && (t = this.selectionManager.selectedObjects), t.forEach((i) => {
      i.scale.multiply(s);
    });
  }
  copySelectedObjects() {
    const e = [];
    return this.selectionManager.selectedObjects.forEach((t) => {
      const s = t.clone();
      s.position.add(new THREE.Vector3(1, 1, 1)), this.scene.add(s), e.push(s);
    }), this.selectionManager.selectedObjects = e, e;
  }
  enterMode(e) {
    this.weas.activeObject !== null && (this.weas.activeObject.userData.objectMode = e, e === "edit" ? (this.weas.activeObject.userData.vertexPoints || initVertexIndicators(this.weas.activeObject), this.weas.activeObject.userData.vertexPoints.visible = !0) : this.weas.activeObject.userData.vertexPoints && (this.weas.activeObject.userData.vertexPoints.visible = !1));
  }
}
function createOutline(o, e = 1.1) {
  const t = new THREE.MeshBasicMaterial({ color: 16776960, side: THREE.BackSide, transparent: !0, opacity: 0.8 }), s = new THREE.Mesh(o.geometry, t);
  s.scale.multiplyScalar(e), s.layers.set(1), o.add(s), o.userData.outlineMesh = s;
}
function removeOutline(o) {
  o.userData.outlineMesh && (o.remove(o.userData.outlineMesh), o.userData.outlineMesh = void 0);
}
function initVertexIndicators(o) {
  const e = o.geometry.attributes.position, t = e.count, s = new THREE.PointsMaterial({ vertexColors: !0, size: 5, sizeAttenuation: !1 }), i = new THREE.BufferGeometry();
  i.setAttribute("position", e);
  const n = new Float32Array(t * 3);
  for (let a = 0; a < t; a++)
    n[a * 3] = 0, n[a * 3 + 1] = 0, n[a * 3 + 2] = 0;
  i.setAttribute("color", new THREE.BufferAttribute(n, 3));
  const r = new THREE.Points(i, s);
  o.add(r), r.layers.set(1), o.userData.vertexPoints = r;
}
const _frustum = new Frustum(), _center = new Vector3(), _tmpPoint = new Vector3(), _vecNear = new Vector3(), _vecTopLeft = new Vector3(), _vecTopRight = new Vector3(), _vecDownRight = new Vector3(), _vecDownLeft = new Vector3(), _vecFarTopLeft = new Vector3(), _vecFarTopRight = new Vector3(), _vecFarDownRight = new Vector3(), _vecFarDownLeft = new Vector3(), _vectemp1 = new Vector3(), _vectemp2 = new Vector3(), _vectemp3 = new Vector3(), _matrix = new Matrix4(), _quaternion = new Quaternion(), _scale = new Vector3();
class SelectionBox {
  constructor(e, t, s = Number.MAX_VALUE) {
    this.camera = e, this.scene = t, this.startPoint = new Vector3(), this.endPoint = new Vector3(), this.collection = [], this.instances = {}, this.deep = s;
  }
  select(e, t) {
    return this.startPoint = e || this.startPoint, this.endPoint = t || this.endPoint, this.collection = [], this.updateFrustum(this.startPoint, this.endPoint), this.searchChildInFrustum(_frustum, this.scene), this.collection;
  }
  updateFrustum(e, t) {
    if (e = e || this.startPoint, t = t || this.endPoint, e.x === t.x && (t.x += Number.EPSILON), e.y === t.y && (t.y += Number.EPSILON), this.camera.updateProjectionMatrix(), this.camera.updateMatrixWorld(), this.camera.isPerspectiveCamera) {
      _tmpPoint.copy(e), _tmpPoint.x = Math.min(e.x, t.x), _tmpPoint.y = Math.max(e.y, t.y), t.x = Math.max(e.x, t.x), t.y = Math.min(e.y, t.y), _vecNear.setFromMatrixPosition(this.camera.matrixWorld), _vecTopLeft.copy(_tmpPoint), _vecTopRight.set(t.x, _tmpPoint.y, 0), _vecDownRight.copy(t), _vecDownLeft.set(_tmpPoint.x, t.y, 0), _vecTopLeft.unproject(this.camera), _vecTopRight.unproject(this.camera), _vecDownRight.unproject(this.camera), _vecDownLeft.unproject(this.camera), _vectemp1.copy(_vecTopLeft).sub(_vecNear), _vectemp2.copy(_vecTopRight).sub(_vecNear), _vectemp3.copy(_vecDownRight).sub(_vecNear), _vectemp1.normalize(), _vectemp2.normalize(), _vectemp3.normalize(), _vectemp1.multiplyScalar(this.deep), _vectemp2.multiplyScalar(this.deep), _vectemp3.multiplyScalar(this.deep), _vectemp1.add(_vecNear), _vectemp2.add(_vecNear), _vectemp3.add(_vecNear);
      const s = _frustum.planes;
      s[0].setFromCoplanarPoints(_vecNear, _vecTopLeft, _vecTopRight), s[1].setFromCoplanarPoints(_vecNear, _vecTopRight, _vecDownRight), s[2].setFromCoplanarPoints(_vecDownRight, _vecDownLeft, _vecNear), s[3].setFromCoplanarPoints(_vecDownLeft, _vecTopLeft, _vecNear), s[4].setFromCoplanarPoints(_vecTopRight, _vecDownRight, _vecDownLeft), s[5].setFromCoplanarPoints(_vectemp3, _vectemp2, _vectemp1), s[5].normal.multiplyScalar(-1);
    } else if (this.camera.isOrthographicCamera) {
      const s = Math.min(e.x, t.x), i = Math.max(e.y, t.y), n = Math.max(e.x, t.x), r = Math.min(e.y, t.y);
      _vecTopLeft.set(s, i, -1), _vecTopRight.set(n, i, -1), _vecDownRight.set(n, r, -1), _vecDownLeft.set(s, r, -1), _vecFarTopLeft.set(s, i, 1), _vecFarTopRight.set(n, i, 1), _vecFarDownRight.set(n, r, 1), _vecFarDownLeft.set(s, r, 1), _vecTopLeft.unproject(this.camera), _vecTopRight.unproject(this.camera), _vecDownRight.unproject(this.camera), _vecDownLeft.unproject(this.camera), _vecFarTopLeft.unproject(this.camera), _vecFarTopRight.unproject(this.camera), _vecFarDownRight.unproject(this.camera), _vecFarDownLeft.unproject(this.camera);
      const a = _frustum.planes;
      a[0].setFromCoplanarPoints(_vecTopLeft, _vecFarTopLeft, _vecFarTopRight), a[1].setFromCoplanarPoints(_vecTopRight, _vecFarTopRight, _vecFarDownRight), a[2].setFromCoplanarPoints(_vecFarDownRight, _vecFarDownLeft, _vecDownLeft), a[3].setFromCoplanarPoints(_vecFarDownLeft, _vecFarTopLeft, _vecTopLeft), a[4].setFromCoplanarPoints(_vecTopRight, _vecDownRight, _vecDownLeft), a[5].setFromCoplanarPoints(_vecFarDownRight, _vecFarTopRight, _vecFarTopLeft), a[5].normal.multiplyScalar(-1);
    } else
      console.error("THREE.SelectionBox: Unsupported camera type.");
  }
  searchChildInFrustum(e, t) {
    if (t.isMesh || t.isLine || t.isPoints)
      if (t.isInstancedMesh) {
        this.instances[t.uuid] = [];
        for (let s = 0; s < t.count; s++)
          t.getMatrixAt(s, _matrix), _matrix.decompose(_center, _quaternion, _scale), _center.applyMatrix4(t.matrixWorld), e.containsPoint(_center) && this.instances[t.uuid].push(s);
      } else
        t.geometry.boundingSphere === null && t.geometry.computeBoundingSphere(), _center.copy(t.geometry.boundingSphere.center), _center.applyMatrix4(t.matrixWorld), e.containsPoint(_center) && this.collection.push(t);
    if (t.children.length > 0)
      for (let s = 0; s < t.children.length; s++)
        this.searchChildInFrustum(e, t.children[s]);
  }
}
class SelectionHelper {
  constructor(e, t) {
    this.element = document.createElement("div"), this.element.classList.add(t), this.element.style.pointerEvents = "none", this.element.style.position = "absolute", this.renderer = e, this.startPoint = new Vector2(), this.pointTopLeft = new Vector2(), this.pointBottomRight = new Vector2(), this.isDown = !1, this.enabled = !0, this.onPointerDown = (function(s) {
      this.enabled !== !1 && (this.isDown = !0, this.onSelectStart(s));
    }).bind(this), this.onPointerMove = (function(s) {
      !s.shiftKey || s.altKey || this.enabled !== !1 && this.isDown && this.onSelectMove(s);
    }).bind(this), this.onPointerUp = (function() {
      this.enabled !== !1 && (this.isDown = !1, this.onSelectOver());
    }).bind(this), this.renderer.domElement.addEventListener("pointerdown", this.onPointerDown), this.renderer.domElement.addEventListener("pointermove", this.onPointerMove), this.renderer.domElement.addEventListener("pointerup", this.onPointerUp);
  }
  dispose() {
    this.renderer.domElement.removeEventListener("pointerdown", this.onPointerDown), this.renderer.domElement.removeEventListener("pointermove", this.onPointerMove), this.renderer.domElement.removeEventListener("pointerup", this.onPointerUp);
  }
  onSelectStart(e) {
    this.element.style.display = "none", this.renderer.domElement.parentElement.appendChild(this.element);
    const t = this.renderer.domElement.parentElement.getBoundingClientRect();
    let s = e.clientX - t.left, i = e.clientY - t.top;
    this.element.style.left = s + "px", this.element.style.top = i + "px", this.element.style.width = "0px", this.element.style.height = "0px", this.startPoint.x = s, this.startPoint.y = i;
  }
  onSelectMove(e) {
    this.element.style.display = "block";
    const t = this.renderer.domElement.parentElement.getBoundingClientRect();
    let s = e.clientX - t.left, i = e.clientY - t.top;
    this.pointBottomRight.x = Math.max(this.startPoint.x, s), this.pointBottomRight.y = Math.max(this.startPoint.y, i), this.pointTopLeft.x = Math.min(this.startPoint.x, s), this.pointTopLeft.y = Math.min(this.startPoint.y, i), this.element.style.left = this.pointTopLeft.x + "px", this.element.style.top = this.pointTopLeft.y + "px", this.element.style.width = this.pointBottomRight.x - this.pointTopLeft.x + "px", this.element.style.height = this.pointBottomRight.y - this.pointTopLeft.y + "px";
  }
  onSelectOver() {
    this.element.parentElement.removeChild(this.element);
  }
}
class LassoHelper {
  constructor(e, t) {
    this.renderer = e, this.element = document.createElement("canvas"), this.element.classList.add(t), this.element.style.pointerEvents = "none", this.element.style.position = "absolute", this.element.style.left = "0", this.element.style.top = "0", this.element.style.display = "none", this.context = this.element.getContext("2d");
  }
  start(e, t) {
    this.ensureMounted(), this.resize(t), this.element.style.display = "block", this.draw(e);
  }
  update(e, t) {
    this.resize(t), this.draw(e);
  }
  finish() {
    this.element.parentElement && this.element.parentElement.removeChild(this.element), this.element.style.display = "none";
  }
  ensureMounted() {
    const e = this.renderer.domElement.parentElement;
    e && (this.element.parentElement || e.appendChild(this.element));
  }
  resize(e) {
    if (!e)
      return;
    const t = Math.max(1, Math.floor(e.width)), s = Math.max(1, Math.floor(e.height));
    (this.element.width !== t || this.element.height !== s) && (this.element.width = t, this.element.height = s);
  }
  draw(e) {
    if (this.context && (this.context.clearRect(0, 0, this.element.width, this.element.height), !(!e || e.length < 2))) {
      this.context.beginPath(), this.context.moveTo(e[0].x, e[0].y);
      for (let t = 1; t < e.length; t++)
        this.context.lineTo(e[t].x, e[t].y);
      this.context.closePath(), this.context.fillStyle = "rgba(75, 160, 255, 0.15)", this.context.strokeStyle = "rgba(85, 170, 255, 0.9)", this.context.lineWidth = 1, this.context.fill(), this.context.stroke();
    }
  }
}
class SelectionManager {
  constructor(e) {
    this.weas = e, this.tjs = e.tjs, this._selectedObjects = [], this.selectedInstances = {}, this.lassoPoints = [], this.isLassoing = !1, this.oldSelectedAtomsIndices = [], this.oldSelectedObjects = [], this.axisAtomIndices = [], this.axisLineExtendFactor = 3, this.axisLine = null, this.isAxisPicking = !1, this.axisPickMode = null, this.axisVisible = !1, this.modeHint = null, this.translateAxisLine = null, this.translateAxisLength = 20, this.translatePlaneMesh = null, this.translateNormalLine = null, this.translatePlaneSize = 30, this.rotateAxisLine = null, this.rotateAxisLength = 20, this.rotatePlaneMesh = null, this.rotateNormalLine = null, this.rotatePlaneSize = 30, this.raycaster = new THREE.Raycaster(), this.raycaster.layers.set(0), this.mouse = new THREE.Vector2(), this.init();
  }
  init() {
    this.selectionBox = new SelectionBox(this.tjs.camera, this.tjs.scene), this.helper = new SelectionHelper(this.tjs.renderers.MainRenderer.renderer, "selectBox"), this.lassoHelper = new LassoHelper(this.tjs.renderers.MainRenderer.renderer, "lassoSelect"), this.initModeHint(), window.addEventListener("pointerdown", this.onMouseDown.bind(this), !1);
  }
  get selectedObjects() {
    return this._selectedObjects;
  }
  set selectedObjects(e) {
    e = e.filter((t) => !t.userData.notSelectable), this._selectedObjects = e, this.highlightSelectedObjects(), e.length > 0 && !this.weas.eventHandlers?.transformControls?.mode && this.setModeHint("");
  }
  onMouseDown(e) {
    const t = this.tjs.updateViewerRect();
    let s = (e.clientX - t.left) / t.width * 2 - 1, i = -((e.clientY - t.top) / t.height) * 2 + 1;
    this.selectionBox.startPoint.set(s, i, 0.5), this.oldSelectedAtomsIndices = this.weas.avr.selectedAtomsIndices, this.oldSelectedObjects = this.selectedObjects;
  }
  pickSelection(e) {
    const t = this.tjs.updateViewerRect();
    this.mouse.x = (e.clientX - t.left) / t.width * 2 - 1, this.mouse.y = -((e.clientY - t.top) / t.height) * 2 + 1, this.raycaster.setFromCamera(this.mouse, this.tjs.camera);
    const s = this.raycaster.intersectObjects(this.tjs.scene.children, !0);
    if (s.length === 0) {
      this.clearSelection();
      return;
    }
    let i = s[0].object;
    const n = s[0].face, r = s[0].point, a = i.parent?.isMesh ? i.parent : null;
    if (i.isLineSegments && i.userData?.type === "anyMesh" && a) {
      if (a.userData?.objectMode === "edit")
        return;
      i = a;
    }
    if (this.weas.activeObject = i, !i.userData.notSelectable) {
      if (i.userData.objectMode === "edit") {
        let l;
        if (i.isInstancedMesh)
          l = {
            object: i,
            vertexId: s[0].instanceId
          };
        else {
          if (i.isLineSegments)
            return;
          {
            const c = getClosestVertex(i, n, r);
            l = {
              object: i,
              vertexId: c.vertexId,
              faceId: s[0].faceIndex
            };
          }
        }
        this.selectedInstances[i.uuid] ? this.selectedInstances[i.uuid].some((h) => h === l.vertexId) ? this.selectedInstances[i.uuid] = this.selectedInstances[i.uuid].filter((h) => h !== l.vertexId) : this.selectedInstances[i.uuid].push(l.vertexId) : this.selectedInstances[i.uuid] = [l.vertexId], i.userData.type === "atom" && (this.weas.avr.selectedAtomsIndices = [...this.selectedInstances[i.uuid]]);
      } else
        this.selectedObjects.some((c) => c === i) ? (removeOutline(i), this.selectedObjects = this.selectedObjects.filter((c) => c !== i)) : (this.selectedObjects.push(i), createOutline(i, 1.1));
      this.highlightSelectedVertex();
    }
  }
  dragSelection(e) {
    const t = this.tjs.updateViewerRect();
    let s = (e.clientX - t.left) / t.width * 2 - 1, i = -((e.clientY - t.top) / t.height) * 2 + 1;
    if (this.selectionBox.endPoint.set(s, i, 0.5), this.selectionBox.select(), this.selectionBox.instances[this.weas.avr.atomManager.meshes.atom.uuid]) {
      const n = this.selectionBox.instances[this.weas.avr.atomManager.meshes.atom.uuid];
      this.weas.avr.selectedAtomsIndices = [.../* @__PURE__ */ new Set([...this.oldSelectedAtomsIndices, ...n])];
    }
    this.selectedObjects = [.../* @__PURE__ */ new Set([...this.oldSelectedObjects, ...this.selectionBox.collection])];
  }
  startLasso(e) {
    const { point: t, rect: s } = this.getViewerPoint(e);
    this.lassoPoints = [t], this.isLassoing = !0, this.lassoHelper.start(this.lassoPoints, s);
  }
  dragLasso(e) {
    if (!this.isLassoing)
      return;
    const { point: t, rect: s } = this.getViewerPoint(e), i = this.lassoPoints[this.lassoPoints.length - 1], n = t.x - i.x, r = t.y - i.y;
    n * n + r * r < 4 || (this.lassoPoints.push(t), this.lassoHelper.update(this.lassoPoints, s));
  }
  finishLasso() {
    if (!this.isLassoing)
      return;
    this.isLassoing = !1, this.lassoHelper.finish();
    const e = this.lassoPoints;
    if (this.lassoPoints = [], e.length < 3)
      return;
    const t = this.getAtomsInsideLasso(e);
    this.weas.avr.selectedAtomsIndices = [.../* @__PURE__ */ new Set([...this.oldSelectedAtomsIndices, ...t])];
  }
  startAxisPicking(e = "rotate") {
    this.isAxisPicking = !0, this.axisPickMode = e, this.axisVisible = !0, this.updateAxisHighlight(), this.updateAxisLine(), e === "translate" ? this.setModeHint("Axis pick: click 2 or 3 atoms, press A to exit") : this.setModeHint("Axis pick: click 1, 2, or 3 atoms, press A to exit");
  }
  stopAxisPicking(e = "Rotate mode: move mouse to rotate, click to confirm") {
    this.isAxisPicking = !1, this.axisPickMode = null, this.setModeHint(e);
  }
  clearAxis() {
    this.axisAtomIndices = [], this.axisVisible = !1, this.updateAxisHighlight(), this.updateAxisLine(), this.hideRotatePlane();
  }
  pickAxisAtom(e) {
    const t = this.getAtomIndexFromEvent(e);
    return t == null ? !1 : (this.axisAtomIndices.includes(t) ? this.axisAtomIndices = this.axisAtomIndices.filter((s) => s !== t) : this.axisAtomIndices.length >= (this.axisPickMode === "translate", 3) ? this.axisAtomIndices = [t] : this.axisAtomIndices.push(t), this.updateAxisHighlight(), this.updateAxisLine(), !0);
  }
  clearSelection() {
    this.selectedObjects.forEach((e) => {
      removeOutline(e);
    }), this.selectedObjects = [], this.selectedInstances = {}, this.weas.avr.selectedAtomsIndices = [], this.highlightSelectedVertex();
  }
  highlightSelectedVertex() {
    Object.keys(this.selectedInstances).forEach((e) => {
      const t = this.tjs.scene.getObjectByProperty("uuid", e);
      if (!t || !t.userData.vertexPoints)
        return;
      const s = t.userData.vertexPoints, i = this.selectedInstances[e], n = t.geometry.attributes.position.count, r = new Float32Array(n * 3);
      for (let a = 0; a < n; a++)
        r[a * 3] = 0, r[a * 3 + 1] = 0, r[a * 3 + 2] = 0;
      i.forEach((a) => {
        r[a * 3] = 1, r[a * 3 + 1] = 0, r[a * 3 + 2] = 0;
      }), s.geometry.setAttribute("color", new THREE.BufferAttribute(r, 3)), s.geometry.attributes.color.needsUpdate = !0;
    });
  }
  highlightSelectedObjects() {
    this.selectedObjects.forEach((e) => {
      removeOutline(e), createOutline(e, 1.1);
    });
  }
  getAtomIndexFromEvent(e) {
    const t = this.tjs.updateViewerRect();
    this.mouse.x = (e.clientX - t.left) / t.width * 2 - 1, this.mouse.y = -((e.clientY - t.top) / t.height) * 2 + 1, this.raycaster.setFromCamera(this.mouse, this.tjs.camera);
    const s = this.weas.avr?.atomManager?.meshes?.atom;
    if (!s)
      return null;
    const i = this.raycaster.intersectObject(s, !0);
    if (i.length === 0)
      return null;
    const n = i.find((r) => Number.isInteger(r.instanceId));
    return n ? n.instanceId : null;
  }
  updateAxisHighlight() {
    const e = this.weas?.avr?.highlightManager;
    if (!e)
      return;
    (!e.settings || !e.settings.axis) && (e.addSetting("axis", {
      indices: [],
      scale: 1,
      type: "crossView",
      color: "#ff8800",
      opacity: 1,
      occlude: !1,
      offset: 1,
      thickness: 0.08
    }), e.drawHighlightAtoms()), e.settings.axisCenter || (e.addSetting("axisCenter", {
      indices: [],
      scale: 0.8,
      type: "cross",
      color: "#ff8800",
      opacity: 0.9
    }), e.drawHighlightAtoms());
    const t = this.axisVisible ? this.axisAtomIndices : [];
    e.settings.axis.indices = [...t];
    const s = this.axisVisible && this.axisAtomIndices.length === 1 ? [...this.axisAtomIndices] : [];
    e.settings.axisCenter.indices = [...s], e.updateHighlightAtomsMesh(
      {
        indices: t,
        scale: 1,
        type: "crossView",
        color: "#ff8800",
        opacity: 1,
        occlude: !1,
        offset: 1,
        thickness: 0.08
      },
      "axis"
    ), e.updateHighlightAtomsMesh(
      {
        indices: s,
        scale: 0.8,
        type: "cross",
        color: "#ff8800",
        opacity: 0.9
      },
      "axisCenter"
    ), e.updateLabelSizes?.(this.tjs.camera, this.tjs.renderers?.MainRenderer?.renderer), this.weas?.avr?.requestRedraw?.("render");
  }
  updateAxisLine() {
    if (!this.axisVisible) {
      this.axisLine && (this.tjs.scene.remove(this.axisLine), this.axisLine.geometry.dispose(), this.axisLine.material.dispose(), this.axisLine = null), this.hideRotatePlane();
      return;
    }
    if (this.axisAtomIndices.length === 3) {
      this.axisLine && (this.tjs.scene.remove(this.axisLine), this.axisLine.geometry.dispose(), this.axisLine.material.dispose(), this.axisLine = null), this.showRotatePlaneFromAxisAtoms();
      return;
    }
    if (this.hideRotatePlane(), this.axisAtomIndices.length !== 2) {
      this.axisLine && (this.tjs.scene.remove(this.axisLine), this.axisLine.geometry.dispose(), this.axisLine.material.dispose(), this.axisLine = null);
      return;
    }
    const e = this.weas?.avr?.atoms?.positions;
    if (!e)
      return;
    const t = this.axisAtomIndices[0], s = this.axisAtomIndices[1];
    if (!e[t] || !e[s])
      return;
    const i = new THREE.Vector3(...e[t]), n = new THREE.Vector3(...e[s]), r = n.clone().sub(i), a = r.length();
    if (a === 0)
      return;
    const l = r.normalize(), c = i.clone().add(n).multiplyScalar(0.5), h = a * this.axisLineExtendFactor, d = c.clone().addScaledVector(l, -h), u = c.clone().addScaledVector(l, h);
    if (this.axisLine)
      this.axisLine.geometry.setFromPoints([d, u]), this.axisLine.geometry.attributes.position.needsUpdate = !0, this.axisLine.geometry.computeBoundingSphere();
    else {
      const p = new THREE.BufferGeometry().setFromPoints([d, u]), m = new THREE.LineBasicMaterial({ color: 16746496, transparent: !0, opacity: 0.9, depthTest: !1 });
      this.axisLine = new THREE.Line(p, m), this.axisLine.userData.notSelectable = !0, this.axisLine.layers.set(1), this.axisLine.renderOrder = 999, this.tjs.scene.add(this.axisLine);
    }
  }
  refreshAxisLine() {
    this.updateAxisLine();
  }
  showAxisVisuals() {
    this.axisVisible = !0, this.updateAxisHighlight(), this.updateAxisLine(), this.weas?.avr?.requestRedraw?.("render");
  }
  hideAxisVisuals() {
    this.axisVisible = !1, this.updateAxisHighlight(), this.updateAxisLine(), this.hideRotatePlane(), this.weas?.avr?.requestRedraw?.("render");
  }
  showTranslateAxisLine(e, t) {
    this.showAxisLine({
      center: e,
      axis: t,
      length: this.translateAxisLength,
      color: 5614335,
      lineKey: "translateAxisLine"
    });
  }
  hideTranslateAxisLine() {
    this.hideAxisLine({ lineKey: "translateAxisLine" });
  }
  showTranslatePlane(e, t) {
    this.showPlaneWithNormal({
      center: e,
      normal: t,
      size: this.translatePlaneSize,
      color: 5614335,
      lineLength: this.translateAxisLength,
      meshKey: "translatePlaneMesh",
      lineKey: "translateNormalLine"
    });
  }
  hideTranslatePlane() {
    this.hidePlaneWithNormal({
      meshKey: "translatePlaneMesh",
      lineKey: "translateNormalLine"
    });
  }
  showRotateAxisLine(e, t) {
    this.hideRotatePlane(), this.showAxisLine({
      center: e,
      axis: t,
      length: this.rotateAxisLength,
      color: 16755285,
      lineKey: "rotateAxisLine"
    });
  }
  hideRotateAxisLine() {
    this.hideAxisLine({ lineKey: "rotateAxisLine" }), this.hideRotatePlane();
  }
  showRotatePlaneFromAxisAtoms() {
    const e = this.weas?.avr?.atoms?.positions;
    if (!e || this.axisAtomIndices.length !== 3) {
      this.hidePlaneWithNormal({
        meshKey: "rotatePlaneMesh",
        lineKey: "rotateNormalLine"
      });
      return;
    }
    const [t, s, i] = this.axisAtomIndices;
    if (!e[t] || !e[s] || !e[i]) {
      this.hidePlaneWithNormal({
        meshKey: "rotatePlaneMesh",
        lineKey: "rotateNormalLine"
      });
      return;
    }
    const n = new THREE.Vector3(...e[t]), r = new THREE.Vector3(...e[s]), a = new THREE.Vector3(...e[i]), l = r.clone().sub(n).cross(a.clone().sub(n));
    if (l.lengthSq() === 0) {
      this.hidePlaneWithNormal({
        meshKey: "rotatePlaneMesh",
        lineKey: "rotateNormalLine"
      });
      return;
    }
    const c = n.clone().add(r).add(a).multiplyScalar(1 / 3);
    this.showPlaneWithNormal({
      center: c,
      normal: l,
      size: this.rotatePlaneSize,
      color: 16755285,
      lineLength: this.rotateAxisLength,
      meshKey: "rotatePlaneMesh",
      lineKey: "rotateNormalLine"
    });
  }
  hideRotatePlane() {
    this.hidePlaneWithNormal({
      meshKey: "rotatePlaneMesh",
      lineKey: "rotateNormalLine"
    });
  }
  showPlaneWithNormal({ center: e, normal: t, size: s, color: i, lineLength: n, meshKey: r, lineKey: a }) {
    if (!e || !t)
      return;
    const l = t.clone().normalize();
    if (l.lengthSq() === 0)
      return;
    if (!this[r]) {
      const u = new THREE.PlaneGeometry(s, s), p = new THREE.MeshBasicMaterial({
        color: i,
        transparent: !0,
        opacity: 0.15,
        side: THREE.DoubleSide,
        depthTest: !1
      });
      this[r] = new THREE.Mesh(u, p), this[r].userData.notSelectable = !0, this[r].layers.set(1), this[r].renderOrder = 998, this.tjs.scene.add(this[r]);
    }
    const c = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), l);
    this[r].position.copy(e), this[r].quaternion.copy(c);
    const h = e.clone(), d = e.clone().addScaledVector(l, n);
    if (this[a])
      this[a].geometry.setFromPoints([h, d]), this[a].geometry.attributes.position.needsUpdate = !0, this[a].geometry.computeBoundingSphere(), this[a].computeLineDistances();
    else {
      const u = new THREE.BufferGeometry().setFromPoints([h, d]), p = new THREE.LineDashedMaterial({
        color: i,
        dashSize: 0.6,
        gapSize: 0.4,
        transparent: !0,
        opacity: 0.9,
        depthTest: !1
      });
      this[a] = new THREE.Line(u, p), this[a].computeLineDistances(), this[a].userData.notSelectable = !0, this[a].layers.set(1), this[a].renderOrder = 999, this.tjs.scene.add(this[a]);
    }
    this.weas?.avr?.requestRedraw?.("render");
  }
  hidePlaneWithNormal({ meshKey: e, lineKey: t }) {
    this[e] && (this.tjs.scene.remove(this[e]), this[e].geometry.dispose(), this[e].material.dispose(), this[e] = null), this[t] && (this.tjs.scene.remove(this[t]), this[t].geometry.dispose(), this[t].material.dispose(), this[t] = null), this.weas?.avr?.requestRedraw?.("render");
  }
  showAxisLine({ center: e, axis: t, length: s, color: i, lineKey: n }) {
    if (!e || !t)
      return;
    const r = t.clone().normalize();
    if (r.lengthSq() === 0)
      return;
    const a = e.clone().addScaledVector(r, -s), l = e.clone().addScaledVector(r, s);
    if (this[n])
      this[n].geometry.setFromPoints([a, l]), this[n].geometry.attributes.position.needsUpdate = !0, this[n].geometry.computeBoundingSphere(), this[n].computeLineDistances();
    else {
      const c = new THREE.BufferGeometry().setFromPoints([a, l]), h = new THREE.LineDashedMaterial({
        color: i,
        dashSize: 0.6,
        gapSize: 0.4,
        transparent: !0,
        opacity: 0.9,
        depthTest: !1
      });
      this[n] = new THREE.Line(c, h), this[n].computeLineDistances(), this[n].userData.notSelectable = !0, this[n].layers.set(1), this[n].renderOrder = 999, this.tjs.scene.add(this[n]);
    }
    this.weas?.avr?.requestRedraw?.("render");
  }
  hideAxisLine({ lineKey: e }) {
    this[e] && (this.tjs.scene.remove(this[e]), this[e].geometry.dispose(), this[e].material.dispose(), this[e] = null, this.weas?.avr?.requestRedraw?.("render"));
  }
  initModeHint() {
    const e = this.tjs.renderers?.MainRenderer?.renderer?.domElement?.parentElement;
    !e || this.modeHint || (this.modeHint = document.createElement("div"), this.modeHint.className = "weas-mode-hint", this.modeHint.style.display = "none", e.appendChild(this.modeHint));
  }
  setModeHint(e) {
    if (this.modeHint || this.initModeHint(), !!this.modeHint) {
      if (!e) {
        this.modeHint.style.display = "none", this.modeHint.textContent = "";
        return;
      }
      this.modeHint.textContent = e, this.modeHint.style.display = "block";
    }
  }
  getViewerPoint(e) {
    const t = this.tjs.updateViewerRect(), s = e.clientX - t.left, i = e.clientY - t.top;
    return { point: { x: s, y: i }, rect: t };
  }
  getAtomsInsideLasso(e) {
    const t = this.weas.avr.atoms;
    if (!t || !Array.isArray(t.positions))
      return [];
    const s = this.tjs.updateViewerRect(), i = this.tjs.camera, n = [], r = new THREE.Vector3();
    for (let a = 0; a < t.positions.length; a++) {
      if (r.set(...t.positions[a]).project(i), r.z < -1 || r.z > 1)
        continue;
      const l = (r.x + 1) * 0.5 * s.width, c = (-r.y + 1) * 0.5 * s.height;
      pointInPolygon$1(l, c, e) && n.push(a);
    }
    return n;
  }
}
function getClosestVertex(o, e, t) {
  const s = o.geometry.getAttribute("position"), i = new THREE.Vector3(), n = new THREE.Vector3(), r = new THREE.Vector3();
  return i.fromBufferAttribute(s, e.a).applyMatrix4(o.matrixWorld), n.fromBufferAttribute(s, e.b).applyMatrix4(o.matrixWorld), r.fromBufferAttribute(s, e.c).applyMatrix4(o.matrixWorld), [
    { vertexId: e.a, distance: i.distanceTo(t) },
    { vertexId: e.b, distance: n.distanceTo(t) },
    { vertexId: e.c, distance: r.distanceTo(t) }
  ].reduce((c, h) => c.distance < h.distance ? c : h);
}
function pointInPolygon$1(o, e, t) {
  let s = !1;
  for (let i = 0, n = t.length - 1; i < t.length; n = i++) {
    const r = t[i].x, a = t[i].y, l = t[n].x, c = t[n].y;
    a > e != c > e && o < (l - r) * (e - a) / (c - a) + r && (s = !s);
  }
  return s;
}
class ShapeOperation extends BaseOperation {
  static category = "Shapes";
  static abstract = !0;
  constructor(e, t, s = {}) {
    super(e), this.shapeName = t, this.options = s, this.options.position = this.options.position || [0, 0, 0], this.options.materialType = this.options.materialType || "Standard", this.options.color = this.options.color || "#bfbfbf", this.options.opacity = this.options.opacity ?? 1, this.options.scale = this.options.scale || [1, 1, 1], this.options.rotation = this.options.rotation || [0, 0, 0], this.options.wireframe = this.options.wireframe || !1, this.object = null, this.uiFields = {
      title: `Add ${t}`,
      fields: {
        positionX: { type: "number", path: "options.position.0" },
        positionY: { type: "number", path: "options.position.1" },
        positionZ: { type: "number", path: "options.position.2" },
        material: {
          type: "select",
          path: "options.materialType",
          options: Object.keys(this.weas.materialsRegistry.materials)
        },
        color: {
          type: "color",
          path: "options.color"
        },
        wireframe: {
          type: "boolean",
          path: "options.wireframe"
        },
        opacity: {
          type: "number",
          path: "options.opacity",
          min: 0,
          max: 1,
          step: 0.01
        },
        scaleX: {
          type: "number",
          path: "options.scale.0",
          min: 0.01,
          max: 10,
          step: 0.01
        },
        scaleY: {
          type: "number",
          path: "options.scale.1",
          min: 0.01,
          max: 10,
          step: 0.01
        },
        scaleZ: {
          type: "number",
          path: "options.scale.2",
          min: 0.01,
          max: 10,
          step: 0.01
        },
        rotationX: {
          type: "number",
          path: "options.rotation.0",
          min: 0,
          max: 360,
          step: 1
        },
        rotationY: {
          type: "number",
          path: "options.rotation.1",
          min: 0,
          max: 360,
          step: 0.01
        },
        rotationZ: {
          type: "number",
          path: "options.rotation.2",
          min: 0,
          max: 360,
          step: 0.01
        }
      }
    };
  }
  execute() {
    const e = this.weas.shapeRegistry;
    if (!e) throw new Error("ShapeRegistry not found");
    this.object = e.create(this.shapeName, this.options), this.object && (this.options.notSelectable && (this.object.userData.notSelectable = !0), this.options.type && (this.object.userData.type = this.options.type), this.options.customData && Object.entries(this.options.customData).forEach(([t, s]) => {
      this.object.userData[t] = s;
    })), (this.options.transparent || this.options.opacity < 1) && this.object.traverse((t) => {
      t.isMesh && (t.material.transparent = !0, t.renderOrder = this.options.renderOrder ?? 400, t.material.depthWrite = !1);
    }), this.object && (this.object.scale.set(
      this.options.scale[0],
      this.options.scale[1],
      this.options.scale[2]
    ), this.object.rotation.set(
      this.options.rotation[0] / (180 / Math.PI),
      this.options.rotation[1] / (180 / Math.PI),
      this.options.rotation[2] / (180 / Math.PI)
    )), this.weas.tjs.scene.add(this.object), this.weas.tjs.requestRedraw?.();
  }
  supportsAdjustGUI() {
    return !!this.object;
  }
  undo() {
    clearObject(this.weas.tjs.scene, this.object);
  }
  adjust(e) {
    this.adjustWithReset(e, () => this.undo());
  }
}
function matchKey(o, e) {
  const t = e[e.length - 1], s = e.slice(0, -1);
  if (o.key.toLowerCase() !== t.toLowerCase()) return !1;
  const i = s.includes("ctrl"), n = s.includes("shift"), r = s.includes("alt"), a = s.includes("meta");
  return !(i !== o.ctrlKey || n !== o.shiftKey || r !== o.altKey || a !== o.metaKey);
}
class OperationSearchManager {
  constructor(e, t) {
    this.weas = e, this.keybindConfig = this.weas.keybindConfig || defaultKeyBindConfig, this.operations = getAllOperations(t, this.keybindConfig), this.overlay = this.createOverlay(), this.bindEvents(), this.updateSearchResults("");
  }
  createOverlay() {
    const e = document.createElement("div");
    e.id = "operation-search", e.className = "search-overlay", e.style.display = "none", e.style.position = "absolute", e.style.top = "20%", e.style.left = "70%", e.style.width = "300px", e.style.height = "200px";
    const t = document.createElement("input");
    t.type = "text", t.id = "search-box", t.placeholder = "Search operation...", t.addEventListener("input", (i) => this.updateSearchResults(i.target.value));
    const s = document.createElement("ul");
    return s.id = "search-results", e.appendChild(t), e.appendChild(s), this.weas.tjs.containerElement.appendChild(e), e;
  }
  bindEvents() {
    const e = (t) => t.stopPropagation();
    ["click", "keydown", "keyup", "keypress"].forEach((t) => {
      this.overlay.addEventListener(t, e, !1);
    }), this.weas.tjs.containerElement.addEventListener("keydown", (t) => {
      if ((this.keybindConfig.SearchOperation || []).some((i) => matchKey(t, i))) {
        t.preventDefault(), this.show();
        return;
      }
      if (t.key === "Escape") {
        this.hide();
        return;
      }
    });
  }
  show() {
    this.overlay.style.display = "block", this.overlay.querySelector("#search-box").focus();
  }
  hide() {
    this.overlay.style.display = "none";
  }
  updateSearchResults(e) {
    const t = this.overlay.querySelector("#search-results");
    t.innerHTML = "";
    let s = this.operations;
    e && (s = s.filter(
      (r) => r.description && r.description.toLowerCase().includes(e.toLowerCase())
    )), this.weas.shapeRegistry.list().filter((r) => r.toLowerCase().includes(e.toLowerCase())).forEach((r) => {
      s.some(
        (l) => l.category === "Shapes" && l.name === r
      ) || s.push({
        cls: ShapeOperation,
        name: r,
        category: "Shapes",
        description: `Add ${r}`
      });
    }), e && (s = s.filter((r) => r.description && r.description.toLowerCase().includes(e.toLowerCase()))), s = s.slice(0, 10);
    const n = {};
    s.forEach((r) => {
      const a = `${r.category}: ${r.description}`;
      n[a] = (n[a] || 0) + 1;
    }), s.forEach((r) => {
      if (!r.description) return;
      const a = document.createElement("li");
      a.tabIndex = 0;
      const l = `${r.category}: ${r.description}`, c = n[l] > 1 ? `${l} (${r.name})` : l;
      a.textContent = c, a.onclick = () => this.execute(r), a.onkeydown = (h) => {
        h.key === "Enter" && this.execute(r);
      }, t.appendChild(a);
    });
  }
  execute(e) {
    let t;
    e.category === "Shapes" ? t = new e.cls(this.weas, e.name, {}) : t = new e.cls({ weas: this.weas }), this.weas.ops.execute(t), this.hide(), this.weas.tjs.containerElement.focus();
  }
}
function AddKeyToDesc(o, e, t) {
  let s = o || "Operation";
  const i = e[t] || [];
  if (i.length > 0 && i[0].length > 0) {
    const n = i[0].map((r) => r.charAt(0).toUpperCase() + r.slice(1)).join("+");
    s += ` [${n}]`;
  }
  return s;
}
function getAllOperations(o, e) {
  const t = [];
  return Object.keys(o).forEach((s) => {
    Object.values(o[s]).forEach((i) => {
      if (i.abstract) return;
      const n = i.description || i.name || "Operation";
      t.push({
        cls: i,
        name: i.name || "Operation",
        category: i.category || s,
        description: AddKeyToDesc(n, e, i.name)
      });
    });
  }), t;
}
class DeleteOperation extends BaseOperation {
  static description = "Delete";
  static category = "Edit";
  static ui = {
    title: "Delete",
    fields: {}
  };
  constructor({ weas: e, indices: t = null }) {
    super(e);
    const s = this.stateGet("viewer.selectedAtomsIndices", []) || [];
    this.indices = t || Array.from(s), this.initialAtoms = e.avr.atoms.copy(), this.initialObjectsState = this.weas.selectionManager.selectedObjects.map((i) => ({
      object: i.clone(),
      parent: i.parent
      // Keep track of the parent to reattach the object correctly
    }));
  }
  execute() {
    this.indices.length > 0 && this.weas.avr.deleteSelectedAtoms({ indices: this.indices }), this.weas.objectManager.deleteSelectedObjects();
  }
  undo() {
    this.indices.length > 0 && (this.weas.avr.atoms = this.initialAtoms.copy());
    const e = [];
    this.initialObjectsState.forEach(({ object: t, parent: s }) => {
      s ? s.add(t) : this.weas.tjs.scene.add(t), e.push(t);
    }), this.weas.selectionManager.selectedObjects = e;
  }
}
class CopyOperation extends BaseOperation {
  static description = "Copy";
  static category = "Edit";
  static ui = {
    title: "Copy",
    fields: {}
  };
  constructor({ weas: e, indices: t = null }) {
    super(e);
    const s = this.stateGet("viewer.selectedAtomsIndices", []) || [];
    this.indices = t || Array.from(s), this.initialAtoms = e.avr.atoms.copy(), this.newObjects = [];
  }
  execute() {
    this.indices.length > 0 && this.weas.avr.copyAtoms(this.indices), this.newObjects = this.weas.objectManager.copySelectedObjects();
  }
  undo() {
    this.indices.length > 0 && (this.weas.avr.atoms = this.initialAtoms.copy()), this.newObjects.forEach((e) => {
      clearObject(this.weas.tjs.scene, e);
    });
  }
  redo() {
    this.execute();
  }
  setupGUI(e) {
  }
}
const object = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  CopyOperation,
  DeleteOperation
}, Symbol.toStringTag, { value: "Module" }));
class ReplaceOperation extends BaseOperation {
  static description = "Replace atoms";
  static category = "Edit";
  static ui = {
    title: "Replace",
    fields: {
      symbol: {
        type: "select",
        options: (e) => e.symbolOptions
      }
    }
  };
  constructor({ weas: e, symbol: t = "C", indices: s = null }) {
    super(e);
    const i = this.stateGet("viewer.selectedAtomsIndices", []) || [];
    this.indices = s || Array.from(i), this.symbol = t, this.symbolOptions = Object.keys(elementAtomicNumbers).concat(Object.keys(this.weas.avr.atoms.species || {})), this.initialAtoms = e.avr.atoms.copy();
  }
  execute() {
    this.weas.avr.replaceSelectedAtoms({ element: this.symbol, indices: this.indices });
  }
  undo() {
    this.weas.avr.atoms = this.initialAtoms.copy();
  }
  validateParams(e) {
    return e.symbol in elementAtomicNumbers || e.symbol in this.weas.avr.atoms.species;
  }
}
class AddAtomOperation extends BaseOperation {
  static description = "Add atom";
  static category = "Edit";
  static ui = {
    title: "Add",
    fields: {
      symbol: {
        type: "select",
        options: (e) => e.symbolOptions
      },
      x: { type: "number", min: -10, max: 10, step: 0.1 },
      y: { type: "number", min: -10, max: 10, step: 0.1 },
      z: { type: "number", min: -10, max: 10, step: 0.1 }
    }
  };
  constructor({ weas: e, symbol: t = "C", position: s = { x: 0, y: 0, z: 0 } }) {
    super(e), this.position = s, this.symbol = t, this.x = s.x, this.y = s.y, this.z = s.z, this.symbolOptions = Object.keys(elementAtomicNumbers).concat(Object.keys(this.weas.avr.atoms.species || {})), this.initialAtoms = e.avr.atoms.copy();
  }
  execute() {
    this.position = { x: this.x, y: this.y, z: this.z }, this.weas.avr.addAtom({ element: this.symbol, position: this.position });
  }
  undo() {
    this.weas.avr.atoms = this.initialAtoms.copy();
  }
  adjust(e) {
    this.adjustWithReset(e, () => {
      this.weas.avr.atoms = this.initialAtoms.copy();
    });
  }
  applyParams(e) {
    "symbol" in e && (this.symbol = e.symbol), ("x" in e || "y" in e || "z" in e) && (this.x = e.x ?? this.x, this.y = e.y ?? this.y, this.z = e.z ?? this.z, this.position = { x: this.x, y: this.y, z: this.z });
  }
  validateParams(e) {
    return e.symbol in elementAtomicNumbers || e.symbol in this.weas.avr.atoms.species;
  }
}
class ColorByAttribute extends BaseOperation {
  static description = "Color by attribute";
  static category = "Color";
  static ui = {
    title: "Color by attribute",
    fields: {
      attribute: {
        type: "select",
        options: (e) => e.attributeKeys
      },
      color1: { type: "color" },
      color2: { type: "color" }
    }
  };
  constructor({ weas: e, attribute: t = "Element", color1: s = "#ff0000", color2: i = "#0000ff" }) {
    super(e), this.affectsAtoms = !1, this.attribute = t, this.color1 = s, this.color2 = i, this.attributeKeys = Object.keys(this.weas.avr.atoms.attributes.atom).concat(Object.keys(colorBys));
  }
  execute() {
    this.ensureStateStore();
    const e = {
      colorRamp: [this.color1, this.color2],
      colorBy: this.attribute
    };
    this.applyStatePatchWithHistory("viewer", e, (t) => this.weas.avr[t]);
  }
  undo() {
    this.ensureStateStore(), this.undoStatePatch();
  }
  redo() {
    this.ensureStateStore(), this.redoStatePatch();
  }
  validateParams(e) {
    return !(!(e.attribute in colorBys) && !(e.attribute in this.weas.avr.atoms.attributes.atom));
  }
}
class AddAtomsToGroupOperation extends BaseOperation {
  static description = "Add atoms to group";
  static category = "Group";
  static ui = {
    title: "Add to group",
    fields: {
      group: { type: "text" }
    }
  };
  constructor({ weas: e, group: t = "group", indices: s = null }) {
    super(e);
    const i = this.stateGet("viewer.selectedAtomsIndices", []) || [];
    this.indices = s || Array.from(i), this.group = t, this.initialAtoms = e.avr.atoms.copy();
  }
  execute() {
    this.weas.avr.atoms.addAtomsToGroup(this.indices, this.group);
  }
  undo() {
    this.weas.avr.atoms = this.initialAtoms.copy();
  }
  adjust(e) {
    this.adjustWithReset(e, () => {
      this.weas.avr.atoms = this.initialAtoms.copy();
    });
  }
  applyParams(e) {
    "group" in e && (this.group = e.group);
  }
  validateParams(e) {
    return !!(e.group && String(e.group).trim());
  }
}
class RemoveAtomsFromGroupOperation extends BaseOperation {
  static description = "Remove atoms from group";
  static category = "Group";
  static ui = {
    title: "Remove from group",
    fields: {
      group: {
        type: "select",
        options: (e) => e.groupOptions
      }
    }
  };
  constructor({ weas: e, group: t = "group", indices: s = null }) {
    super(e);
    const i = this.stateGet("viewer.selectedAtomsIndices", []) || [];
    this.indices = s || Array.from(i);
    const n = /* @__PURE__ */ new Set(), r = this.weas.avr.atoms.attributes?.atom?.groups;
    Array.isArray(r) && this.indices.forEach((a) => {
      const l = r[a];
      Array.isArray(l) && l.forEach((c) => n.add(String(c)));
    }), this.groupOptions = Array.from(n).sort(), this.groupOptions.length === 0 && (this.groupOptions = [t]), this.group = t === "group" && this.groupOptions.length > 0 ? this.groupOptions[0] : t, this.initialAtoms = e.avr.atoms.copy();
  }
  execute() {
    this.weas.avr.atoms.removeAtomsFromGroup(this.indices, this.group);
  }
  undo() {
    this.weas.avr.atoms = this.initialAtoms.copy();
  }
  adjust(e) {
    this.adjustWithReset(e, () => {
      this.weas.avr.atoms = this.initialAtoms.copy();
    });
  }
  applyParams(e) {
    "group" in e && (this.group = e.group);
  }
  validateParams(e) {
    return !!(e.group && String(e.group).trim());
  }
}
class ClearGroupOperation extends BaseOperation {
  static description = "Clear group";
  static category = "Group";
  static ui = {
    title: "Clear group",
    fields: {
      group: { type: "text" }
    }
  };
  constructor({ weas: e, group: t = "group" }) {
    super(e), this.group = t, this.initialAtoms = e.avr.atoms.copy();
  }
  execute() {
    this.weas.avr.atoms.clearGroup(this.group);
  }
  undo() {
    this.weas.avr.atoms = this.initialAtoms.copy();
  }
  adjust(e) {
    this.adjustWithReset(e, () => {
      this.weas.avr.atoms = this.initialAtoms.copy();
    });
  }
  applyParams(e) {
    "group" in e && (this.group = e.group);
  }
  validateParams(e) {
    return !!(e.group && String(e.group).trim());
  }
}
class ImportStructureOperation extends BaseOperation {
  static description = "Import structure file";
  static category = "IO";
  constructor({ weas: e }) {
    super(e), this.previousState = e.exportState(), this.nextState = null, this.affectsAtoms = !0;
  }
  execute() {
    const e = document.createElement("input");
    e.type = "file", e.accept = "on,.xyz,.cif", e.style.display = "none", document.body.appendChild(e), e.addEventListener(
      "change",
      async () => {
        const t = e.files && e.files[0];
        if (document.body.removeChild(e), !!t)
          try {
            const s = await t.text(), i = t.name.slice(t.name.lastIndexOf(".")), n = parseStructureText(s, i);
            applyStructurePayload(this.weas, n.data), this.nextState = this.weas.exportState();
          } catch (s) {
            console.error("Failed to import structure:", s), alert(`Import failed: ${s.message || s}`);
          }
      },
      { once: !0 }
    ), e.click();
  }
  undo() {
    this.previousState && this.weas.importState(this.previousState);
  }
  redo() {
    if (this.nextState) {
      this.weas.importState(this.nextState);
      return;
    }
    this.execute();
  }
}
class ExportStructureOperation extends BaseOperation {
  static description = "Export structure file";
  static category = "IO";
  static ui = {
    title: "Export",
    fields: {
      format: { type: "select", options: ["json", "html", "xyz", "cif"] },
      filename: { type: "text" }
    }
  };
  constructor({ weas: e, format: t = "json", filename: s = "" }) {
    super(e), this.affectsAtoms = !1, this.format = t, this.filename = s;
  }
  execute() {
    const e = buildExportPayload(this.weas, this.format), t = this.filename && this.filename.trim().length > 0 ? this.filename.trim() : e.filename;
    downloadText(e.text, t, e.mimeType);
  }
  undo() {
  }
}
const atoms = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AddAtomOperation,
  AddAtomsToGroupOperation,
  ClearGroupOperation,
  ColorByAttribute,
  ExportStructureOperation,
  ImportStructureOperation,
  RemoveAtomsFromGroupOperation,
  ReplaceOperation
}, Symbol.toStringTag, { value: "Module" }));
function pointsInsideMesh(o, e) {
  let t = new THREE.Raycaster(), s = new THREE.Vector3(0.23184, 0.413, 0.879), i;
  const n = [];
  for (let r = 0; r < o.length; r++)
    i = new THREE.Vector3(...o[r]), t.set(i, s), t.intersectObject(e).length % 2 === 1 && n.push(r);
  return n;
}
class SelectAll extends BaseOperation {
  static description = "Select all";
  static category = "Select";
  constructor({ weas: e }) {
    super(e);
  }
  execute() {
    const e = [...Array(this.weas.avr.atoms.getAtomsCount()).keys()];
    this.ensureStateStore(), this.applyStatePatchWithHistory("viewer", { selectedAtomsIndices: e }, (t) => this.weas.avr[t]);
  }
  undo() {
    this.ensureStateStore(), this.undoStatePatch();
  }
}
class InvertSelection extends BaseOperation {
  static description = "Invert selection";
  static category = "Select";
  constructor({ weas: e }) {
    super(e);
  }
  execute() {
    this.ensureStateStore();
    const e = this.stateGet("viewer.selectedAtomsIndices", []) || [], t = [...Array(this.weas.avr.atoms.getAtomsCount()).keys()].filter((s) => !e.includes(s));
    this.applyStatePatchWithHistory("viewer", { selectedAtomsIndices: t }, (s) => this.weas.avr[s]);
  }
  undo() {
    this.ensureStateStore(), this.undoStatePatch();
  }
}
class InsideSelection extends BaseOperation {
  static description = "Select inside";
  static category = "Select";
  constructor({ weas: e }) {
    super(e);
  }
  execute() {
    const e = [];
    for (let t = 0; t < this.weas.selectionManager.selectedObjects.length; t++) {
      const s = this.weas.selectionManager.selectedObjects[t], i = pointsInsideMesh(this.weas.avr.atoms.positions, s);
      e.push(...i);
    }
    this.ensureStateStore(), this.applyStatePatchWithHistory("viewer", { selectedAtomsIndices: e }, (t) => this.weas.avr[t]);
  }
  undo() {
    this.ensureStateStore(), this.undoStatePatch();
  }
}
class SelectByGroup extends BaseOperation {
  static description = "Select by group";
  static category = "Select";
  static ui = {
    title: "Select by group",
    fields: {
      group: {
        type: "select",
        options: (e) => e.groupOptions
      }
    }
  };
  constructor({ weas: e, group: t = "group" }) {
    super(e);
    const s = this.weas.avr.atoms.listGroups();
    this.groupOptions = s.length > 0 ? s : [t], this.group = t === "group" && this.groupOptions.length > 0 ? this.groupOptions[0] : t;
  }
  execute() {
    const e = this.weas.avr.atoms.getGroupIndices(this.group);
    this.ensureStateStore(), this.applyStatePatchWithHistory("viewer", { selectedAtomsIndices: e }, (t) => this.weas.avr[t]);
  }
  undo() {
    this.ensureStateStore(), this.undoStatePatch();
  }
  validateParams(e) {
    return !!(e.group && String(e.group).trim());
  }
}
const selection = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  InsideSelection,
  InvertSelection,
  SelectAll,
  SelectByGroup
}, Symbol.toStringTag, { value: "Module" }));
function cloneValue$1(o) {
  return o === void 0 ? o : JSON.parse(JSON.stringify(o));
}
class SetViewerState extends BaseOperation {
  static description = "Set viewer state";
  static category = "Viewer";
  constructor({ weas: e, patch: t = {}, redraw: s = "auto" }) {
    super(e), this.affectsAtoms = !1, this.weas = e, this.patch = cloneValue$1(t), this.redraw = s, this.colorByOptions = Object.keys(this.weas.avr.atoms.attributes.atom || {}).concat(["Element", "Index", "Random", "Uniform"]), this.colorTypeOptions = ["CPK", "VESTA", "JMOL"], this.radiusTypeOptions = ["Covalent", "VDW"], Object.keys(this.patch).length === 0 && (this.patch = this.buildDefaultPatch()), this.uiFields = {
      title: "Viewer state",
      fields: this.buildFieldsFromPatch(this.patch)
    }, Object.keys(this.uiFields.fields).forEach((i) => {
      this[i] = cloneValue$1(this.patch[i]);
    });
  }
  execute() {
    this.ensureStateStore(), this.applyStatePatchWithHistory("viewer", this.patch, (e) => this.weas.avr[e]);
  }
  undo() {
    this.ensureStateStore(), this.undoStatePatch();
  }
  redo() {
    this.ensureStateStore(), this.redoStatePatch();
  }
  applyParams(e) {
    Object.entries(e).forEach(([t, s]) => {
      t in this && (this[t] = s);
    }), this.patch = { ...this.patch }, Object.keys(this.uiFields.fields).forEach((t) => {
      this.patch[t] = cloneValue$1(this[t]);
    });
  }
  buildFieldsFromPatch(e) {
    const t = {
      modelStyle: { type: "select", options: MODEL_STYLE_MAP },
      colorBy: { type: "select", options: (i) => i.colorByOptions },
      colorType: { type: "select", options: (i) => i.colorTypeOptions },
      radiusType: { type: "select", options: (i) => i.radiusTypeOptions },
      materialType: { type: "select", options: ["Standard", "Phong", "Basic"] },
      atomLabelType: { type: "select", options: ["None", "Symbol", "Index"] },
      showBondedAtoms: { type: "boolean" },
      atomScale: { type: "number", min: 0.1, max: 2, step: 0.01 },
      backgroundColor: { type: "color" }
    }, s = {};
    return Object.entries(e).forEach(([i, n]) => {
      if (t[i]) {
        s[i] = t[i];
        return;
      }
      typeof n == "boolean" ? s[i] = { type: "boolean" } : typeof n == "number" ? s[i] = { type: "number" } : typeof n == "string" && (s[i] = { type: "text" });
    }), s;
  }
  buildDefaultPatch() {
    const e = ["modelStyle", "colorBy", "colorType", "radiusType", "materialType", "atomLabelType", "showBondedAtoms", "atomScale", "backgroundColor"], t = {}, s = this.stateGet("viewer", {});
    return e.forEach((i) => {
      i in s ? t[i] = cloneValue$1(s[i]) : t[i] = cloneValue$1(this.weas.avr[i]);
    }), t;
  }
}
const viewer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  SetViewerState
}, Symbol.toStringTag, { value: "Module" }));
function normalizeValue(o) {
  if (o && typeof o.getHexString == "function")
    return `#${o.getHexString()}`;
  if (Array.isArray(o))
    return o.map((e) => normalizeValue(e));
  if (o && typeof o == "object") {
    const e = {};
    return Object.entries(o).forEach(([t, s]) => {
      e[t] = normalizeValue(s);
    }), e;
  }
  return o;
}
function cloneSettings(o) {
  return normalizeValue(o);
}
function addDefined(o, e, t) {
  t !== void 0 && (o[e] = t);
}
function addSettings(o, e, t) {
  t != null && (o[e] = t);
}
class SetCellSettings extends BaseOperation {
  static description = "Cell settings";
  static category = "Viewer";
  static ui = {
    title: "Cell",
    fields: {
      showCell: { type: "boolean" },
      showAxes: { type: "boolean" }
    }
  };
  constructor({ weas: e, settings: t = {}, showCell: s = void 0, showAxes: i = void 0 }) {
    super(e), this.affectsAtoms = !1, this.settings = cloneSettings(t);
    const n = this.stateGet("cell", {});
    this.showCell = s !== void 0 ? s : n.showCell ?? this.weas.avr.cellManager.showCell, this.showAxes = i !== void 0 ? i : n.showAxes ?? this.weas.avr.cellManager.showAxes;
  }
  execute() {
    this.ensureStateStore();
    const e = { ...this.settings };
    addDefined(e, "showCell", this.showCell), addDefined(e, "showAxes", this.showAxes), this.applyStatePatchWithHistory("cell", e, (t) => this.weas.avr.cellManager[t]);
  }
  undo() {
    this.ensureStateStore(), this.undoStatePatch();
  }
  redo() {
    this.ensureStateStore(), this.redoStatePatch();
  }
}
class SetBondSettings extends BaseOperation {
  static description = "Bond settings";
  static category = "Viewer";
  static ui = {
    title: "Bond",
    fields: {
      hideLongBonds: { type: "boolean" },
      showHydrogenBonds: { type: "boolean" },
      showOutBoundaryBonds: { type: "boolean" }
    }
  };
  constructor({ weas: e, settings: t = null, hideLongBonds: s = void 0, showHydrogenBonds: i = void 0, showOutBoundaryBonds: n = void 0 }) {
    super(e), this.affectsAtoms = !1, this.settings = t ? cloneSettings(t) : null, this.hideLongBonds = s, this.showHydrogenBonds = i, this.showOutBoundaryBonds = n;
  }
  execute() {
    this.ensureStateStore();
    const e = {};
    addSettings(e, "settings", this.settings), addDefined(e, "hideLongBonds", this.hideLongBonds), addDefined(e, "showHydrogenBonds", this.showHydrogenBonds), addDefined(e, "showOutBoundaryBonds", this.showOutBoundaryBonds), this.applyStatePatchWithHistory("bond", e, (t) => this.weas.avr.bondManager[t]);
  }
  undo() {
    this.ensureStateStore(), this.undoStatePatch();
  }
  redo() {
    this.ensureStateStore(), this.redoStatePatch();
  }
}
class SetIsosurfaceSettings extends BaseOperation {
  static description = "Isosurface settings";
  static category = "Viewer";
  constructor({ weas: e, settings: t = {} }) {
    super(e), this.affectsAtoms = !1, this.settings = cloneSettings(t);
  }
  execute() {
    this.ensureStateStore(), this.applyStatePatchWithHistory("plugins.isosurface", { settings: this.settings }, () => this.weas.avr.isosurfaceManager.settings);
  }
  undo() {
    this.ensureStateStore(), this.undoStatePatch();
  }
  redo() {
    this.ensureStateStore(), this.redoStatePatch();
  }
}
class SetVolumeSliceSettings extends BaseOperation {
  static description = "Volume slice settings";
  static category = "Viewer";
  constructor({ weas: e, settings: t = {} }) {
    super(e), this.affectsAtoms = !1, this.settings = cloneSettings(t);
  }
  execute() {
    this.ensureStateStore(), this.applyStatePatchWithHistory("plugins.volumeSlice", { settings: this.settings }, () => this.weas.avr.volumeSliceManager.settings);
  }
  undo() {
    this.ensureStateStore(), this.undoStatePatch();
  }
  redo() {
    this.ensureStateStore(), this.redoStatePatch();
  }
}
class SetVectorFieldSettings extends BaseOperation {
  static description = "Vector field settings";
  static category = "Viewer";
  static ui = {
    title: "Vector field",
    fields: {
      show: { type: "boolean" }
    }
  };
  constructor({ weas: e, settings: t = {}, show: s = void 0 }) {
    super(e), this.affectsAtoms = !1, this.settings = cloneSettings(t), this.show = s;
  }
  execute() {
    this.ensureStateStore();
    const e = {};
    addSettings(e, "settings", this.settings), addDefined(e, "show", this.show), this.applyStatePatchWithHistory("plugins.vectorField", e, (t) => t === "settings" ? this.weas.avr.VFManager.settings : this.weas.avr.VFManager.show);
  }
  undo() {
    this.ensureStateStore(), this.undoStatePatch();
  }
  redo() {
    this.ensureStateStore(), this.redoStatePatch();
  }
}
class SetHighlightSettings extends BaseOperation {
  static description = "Highlight settings";
  static category = "Viewer";
  constructor({ weas: e, settings: t = {} }) {
    super(e), this.affectsAtoms = !1, this.settings = cloneSettings(t);
  }
  execute() {
    this.ensureStateStore(), this.applyStatePatchWithHistory("plugins.highlight", { settings: this.settings }, () => this.weas.avr.highlightManager.settings);
  }
  undo() {
    this.ensureStateStore(), this.undoStatePatch();
  }
  redo() {
    this.ensureStateStore(), this.redoStatePatch();
  }
}
const settings = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  SetBondSettings,
  SetCellSettings,
  SetHighlightSettings,
  SetIsosurfaceSettings,
  SetVectorFieldSettings,
  SetVolumeSliceSettings
}, Symbol.toStringTag, { value: "Module" })), ops = {
  object,
  transform,
  atoms,
  selection,
  viewer,
  settings,
  Shapes: {
    ShapeOperation
  }
};
class OperationManager {
  constructor(e) {
    this.weas = e, this.operationSearchManager = new OperationSearchManager(e, ops), this.undoStack = [], this.redoStack = [], this.isRestoring = !1, this.gui = new GUI(), this.gui.closed = !1, this.createGUIContainer(), this.generateOperator();
  }
  generateOperator() {
    for (const e in ops) {
      this[e] = {};
      for (const t in ops[e])
        this[e][t] = (s = {}) => {
          if (e === "Shapes") {
            const { shapeName: i, options: n } = s, r = new ops[e][t](
              this.weas,
              i,
              n
            );
            this.execute(r);
          } else {
            s.weas = this.weas;
            const i = new ops[e][t](s);
            this.execute(i);
          }
        };
    }
  }
  execute(e, t = !0) {
    this.isRestoring || (t && e.execute(), this.undoStack.push(e), this.redoStack = [], this.updateAdjustLastOperationGUI(), e.affectsAtoms !== !1 && this.weas.eventHandlers.dispatchAtomsUpdated());
  }
  undo() {
    if (this.undoStack.length > 0) {
      const e = this.undoStack.pop();
      this.isRestoring = !0, e.undo(), this.endRestoreSoon(), this.redoStack.push(e), e.affectsAtoms !== !1 && this.weas.eventHandlers.dispatchAtomsUpdated();
    }
  }
  redo() {
    if (this.redoStack.length > 0) {
      const e = this.redoStack.pop();
      this.isRestoring = !0, e.redo(), this.endRestoreSoon(), this.undoStack.push(e), this.updateAdjustLastOperationGUI(), e.affectsAtoms !== !1 && this.weas.eventHandlers.dispatchAtomsUpdated();
    }
  }
  endRestoreSoon() {
    typeof queueMicrotask == "function" ? queueMicrotask(() => {
      this.isRestoring = !1;
    }) : setTimeout(() => {
      this.isRestoring = !1;
    }, 0);
  }
  createGUIContainer() {
    const e = document.createElement("div");
    Object.assign(e.style, {
      position: "absolute",
      bottom: "30px",
      right: "10px",
      display: "none"
      // Hide by default
    }), this.weas.tjs.containerElement.appendChild(e), e.appendChild(this.gui.domElement), this.preventEventPropagation(e), this.guiContainer = e, this.adjustLastOpFolder = this.gui.addFolder("Adjust Last Operation"), this.adjustLastOpFolder.open();
  }
  preventEventPropagation(e) {
    const t = (s) => s.stopPropagation();
    ["click", "keydown", "keyup", "keypress"].forEach((s) => {
      e.addEventListener(s, t, !1);
    });
  }
  onOperationAdjusted(e) {
    this.undoStack[this.undoStack.length - 1] === e && (this.redoStack = [], this.updateAdjustLastOperationGUI());
  }
  hideGUI() {
    this.guiContainer.style.display = "none";
  }
  updateAdjustLastOperationGUI() {
    const e = this.undoStack[this.undoStack.length - 1];
    if (!e || !e.supportsAdjustGUI?.()) {
      this.guiContainer.style.display = "none";
      return;
    }
    this.guiContainer.style.display = "block", this.lastAdjustedOperation !== e && (this.lastAdjustedOperation = e, Object.values(this.adjustLastOpFolder.__controllers).forEach(
      (t) => this.adjustLastOpFolder.remove(t)
    ), Object.values(this.adjustLastOpFolder.__folders).forEach(
      (t) => this.adjustLastOpFolder.removeFolder(t)
    ), e.setupGUI(this.adjustLastOpFolder)), typeof e.refreshGUIValues == "function" && e.refreshGUIValues();
  }
}
function cloneValue(o) {
  const e = JSON.stringify(o);
  if (e !== void 0)
    return JSON.parse(e);
}
function getByPath(o, e) {
  if (!e)
    return o;
  const t = e.split(".");
  let s = o;
  for (const i of t) {
    if (!s)
      return;
    s = s[i];
  }
  return s;
}
function mergeDeep(o, e) {
  return Object.entries(e || {}).forEach(([t, s]) => {
    s && typeof s == "object" && !Array.isArray(s) ? ((!o[t] || typeof o[t] != "object") && (o[t] = {}), mergeDeep(o[t], s)) : o[t] = s;
  }), o;
}
class StateStore {
  constructor(e = {}) {
    this.state = cloneValue(e), this.subscribers = /* @__PURE__ */ new Set(), this.depth = 0, this.pending = !1;
  }
  get(e = "") {
    return getByPath(this.state, e);
  }
  set(e) {
    if (mergeDeep(this.state, e), this.depth > 0) {
      this.pending = !0;
      return;
    }
    this.emit();
  }
  reset(e = {}) {
    if (this.state = cloneValue(e), this.depth > 0) {
      this.pending = !0;
      return;
    }
    this.emit();
  }
  transaction(e) {
    this.depth += 1;
    try {
      e();
    } finally {
      this.depth -= 1, this.depth === 0 && this.pending && (this.pending = !1, this.emit());
    }
  }
  subscribe(e, t) {
    const s = {
      path: e,
      callback: t,
      last: cloneValue(getByPath(this.state, e))
    };
    return this.subscribers.add(s), () => {
      this.subscribers.delete(s);
    };
  }
  emit() {
    this.subscribers.forEach((e) => {
      const t = cloneValue(getByPath(this.state, e.path)), s = e.last;
      JSON.stringify(s) !== JSON.stringify(t) && (e.last = t, e.callback(t, s));
    });
  }
}
let Setting$b = class {
  constructor({ type: e, shape: t, instances: s, materialType: i = "Standard", opacity: n = 1 }) {
    this.type = e, this.shape = t, this.instances = s, this.materialType = i, this.opacity = n;
  }
};
class InstancedMeshPrimitive {
  constructor(e) {
    this.viewer = e, this.scene = this.viewer.tjs.scene, this.materialsRegistry = this.viewer.materialsRegistry, this.settings = [], this.meshes = [];
    const t = this.viewer.state.get("plugins.instancedMeshPrimitive");
    t && Array.isArray(t.settings) && (this.applySettings(t.settings), this.drawMesh()), this.viewer.state.subscribe("plugins.instancedMeshPrimitive", (s) => {
      !s || !Array.isArray(s.settings) || (this.applySettings(s.settings), this.drawMesh());
    });
  }
  setSettings(e) {
    this.viewer.state.set({ plugins: { instancedMeshPrimitive: { settings: cloneValue(e) } } });
  }
  applySettings(e) {
    this.settings = [], this.clearMeshes(), e.forEach((t) => {
      this.addSetting(t);
    });
  }
  // Modify addSetting to accept a single object parameter
  addSetting({ type: e, shape: t, instances: s, materialType: i = "Standard", opacity: n = 1 }) {
    const r = new Setting$b({ type: e, shape: t, instances: s, materialType: i, opacity: n });
    this.settings.push(r);
  }
  clearMeshes() {
    this.meshes.forEach((e) => {
      clearObject(this.scene, e);
    }), this.meshes = [];
  }
  drawMesh() {
    this.clearMeshes(), this.settings.forEach((e) => {
      const t = this.getGeometry(e), s = e.materialType || "Standard", i = this.materialsRegistry.getMaterial(s, !0);
      i.transparent = !0, i.opacity = e.opacity || 1;
      const n = new THREE.InstancedMesh(t, i, e.instances.length);
      i.opacity < 1 && (n.renderOrder = 2), e.instances.forEach((r, a) => {
        const l = new THREE.Object3D(), c = new THREE.Vector3(...r.position);
        l.position.copy(c);
        const h = r.scale || [1, 1, 1];
        l.scale.set(...h);
        const d = r.rotation || [0, 0, 0];
        l.rotation.set(...d), l.updateMatrix(), n.setMatrixAt(a, l.matrix);
        const u = r.color || "#bd0d87";
        n.setColorAt(a, new THREE.Color(u));
      }), n.instanceMatrix.needsUpdate = !0, n.instanceColor.needsUpdate = !0, this.meshes.push(n), this.scene.add(n);
    }), this.viewer.requestRedraw?.("render");
  }
  getGeometry(e) {
    let t, s, i;
    switch (e.type) {
      case "cube":
        s = { width: 1, height: 1, depth: 1 }, i = { ...s, ...e.shape }, t = new THREE.BoxGeometry(i.width, i.height, i.depth);
        break;
      case "cylinder":
        s = { radiusTop: 1, radiusBottom: 1, height: 1, radialSegments: 8, heightSegments: 1, openEnded: !1 }, i = { ...s, ...e.shape }, t = new THREE.CylinderGeometry(i.radiusTop, i.radiusBottom, i.height, i.radialSegments, i.heightSegments, i.openEnded);
        break;
      case "icosahedron":
        s = { radius: 1, detail: 0 }, i = { ...s, ...e.shape }, t = new THREE.IcosahedronGeometry(i.radius, i.detail);
        break;
      case "cone":
        s = { radius: 1, height: 1, radialSegments: 8, heightSegments: 1, openEnded: !1 }, i = { ...s, ...e.shape }, t = new THREE.ConeGeometry(i.radius, i.height, i.radialSegments, i.heightSegments, i.openEnded);
        break;
      case "plane":
        s = { width: 1, height: 1 }, i = { ...s, ...e.shape }, t = new THREE.PlaneGeometry(i.width, i.height);
        break;
      case "sphere":
        s = { radius: 1, widthSegments: 8, heightSegments: 6, phiStart: 0, phiLength: Math.PI * 2, thetaStart: 0, thetaLength: Math.PI }, i = { ...s, ...e.shape }, t = new THREE.SphereGeometry(i.radius, i.widthSegments, i.heightSegments, i.phiStart, i.phiLength, i.thetaStart, i.thetaLength);
        break;
      case "torus":
        s = { radius: 1, tube: 0.4, radialSegments: 8, tubularSegments: 6, arc: Math.PI * 2 }, i = { ...s, ...e.shape }, t = new THREE.TorusGeometry(i.radius, i.tube, i.radialSegments, i.tubularSegments, i.arc);
        break;
      default:
        console.error("Unknown setting type: ", type);
    }
    return t;
  }
}
function mergeGeometries(o, e = !1) {
  const t = o[0].index !== null, s = new Set(Object.keys(o[0].attributes)), i = new Set(Object.keys(o[0].morphAttributes)), n = {}, r = {}, a = o[0].morphTargetsRelative, l = new BufferGeometry();
  let c = 0;
  for (let h = 0; h < o.length; ++h) {
    const d = o[h];
    let u = 0;
    if (t !== (d.index !== null))
      return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + h + ". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."), null;
    for (const p in d.attributes) {
      if (!s.has(p))
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + h + '. All geometries must have compatible attributes; make sure "' + p + '" attribute exists among all geometries, or in none of them.'), null;
      n[p] === void 0 && (n[p] = []), n[p].push(d.attributes[p]), u++;
    }
    if (u !== s.size)
      return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + h + ". Make sure all geometries have the same number of attributes."), null;
    if (a !== d.morphTargetsRelative)
      return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + h + ". .morphTargetsRelative must be consistent throughout all geometries."), null;
    for (const p in d.morphAttributes) {
      if (!i.has(p))
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + h + ".  .morphAttributes must be consistent throughout all geometries."), null;
      r[p] === void 0 && (r[p] = []), r[p].push(d.morphAttributes[p]);
    }
    if (e) {
      let p;
      if (t)
        p = d.index.count;
      else if (d.attributes.position !== void 0)
        p = d.attributes.position.count;
      else
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + h + ". The geometry must have either an index or a position attribute"), null;
      l.addGroup(c, p, h), c += p;
    }
  }
  if (t) {
    let h = 0;
    const d = [];
    for (let u = 0; u < o.length; ++u) {
      const p = o[u].index;
      for (let m = 0; m < p.count; ++m)
        d.push(p.getX(m) + h);
      h += o[u].attributes.position.count;
    }
    l.setIndex(d);
  }
  for (const h in n) {
    const d = mergeAttributes(n[h]);
    if (!d)
      return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the " + h + " attribute."), null;
    l.setAttribute(h, d);
  }
  for (const h in r) {
    const d = r[h][0].length;
    if (d === 0) break;
    l.morphAttributes = l.morphAttributes || {}, l.morphAttributes[h] = [];
    for (let u = 0; u < d; ++u) {
      const p = [];
      for (let g = 0; g < r[h].length; ++g)
        p.push(r[h][g][u]);
      const m = mergeAttributes(p);
      if (!m)
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the " + h + " morphAttribute."), null;
      l.morphAttributes[h].push(m);
    }
  }
  return l;
}
function mergeAttributes(o) {
  let e, t, s, i = -1, n = 0;
  for (let c = 0; c < o.length; ++c) {
    const h = o[c];
    if (e === void 0 && (e = h.array.constructor), e !== h.array.constructor)
      return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."), null;
    if (t === void 0 && (t = h.itemSize), t !== h.itemSize)
      return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."), null;
    if (s === void 0 && (s = h.normalized), s !== h.normalized)
      return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."), null;
    if (i === -1 && (i = h.gpuType), i !== h.gpuType)
      return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."), null;
    n += h.count * t;
  }
  const r = new e(n), a = new BufferAttribute(r, t, s);
  let l = 0;
  for (let c = 0; c < o.length; ++c) {
    const h = o[c];
    if (h.isInterleavedBufferAttribute) {
      const d = l / t;
      for (let u = 0, p = h.count; u < p; u++)
        for (let m = 0; m < t; m++) {
          const g = h.getComponent(u, m);
          a.setComponent(u + d, m, g);
        }
    } else
      r.set(h.array, l);
    l += h.count * t;
  }
  return i !== void 0 && (a.gpuType = i), a;
}
function mergeVertices(o, e = 1e-4) {
  e = Math.max(e, Number.EPSILON);
  const t = {}, s = o.getIndex(), i = o.getAttribute("position"), n = s ? s.count : i.count;
  let r = 0;
  const a = Object.keys(o.attributes), l = {}, c = {}, h = [], d = ["getX", "getY", "getZ", "getW"], u = ["setX", "setY", "setZ", "setW"];
  for (let w = 0, b = a.length; w < b; w++) {
    const x = a[w], S = o.attributes[x];
    l[x] = new S.constructor(
      new S.array.constructor(S.count * S.itemSize),
      S.itemSize,
      S.normalized
    );
    const M = o.morphAttributes[x];
    M && (c[x] || (c[x] = []), M.forEach((E, v) => {
      const C = new E.array.constructor(E.count * E.itemSize);
      c[x][v] = new E.constructor(C, E.itemSize, E.normalized);
    }));
  }
  const p = e * 0.5, m = Math.log10(1 / e), g = Math.pow(10, m), y = p * g;
  for (let w = 0; w < n; w++) {
    const b = s ? s.getX(w) : w;
    let x = "";
    for (let S = 0, M = a.length; S < M; S++) {
      const E = a[S], v = o.getAttribute(E), C = v.itemSize;
      for (let A = 0; A < C; A++)
        x += `${~~(v[d[A]](b) * g + y)},`;
    }
    if (x in t)
      h.push(t[x]);
    else {
      for (let S = 0, M = a.length; S < M; S++) {
        const E = a[S], v = o.getAttribute(E), C = o.morphAttributes[E], A = v.itemSize, _ = l[E], L = c[E];
        for (let j = 0; j < A; j++) {
          const R = d[j], P = u[j];
          if (_[P](r, v[R](b)), C)
            for (let F = 0, $ = C.length; F < $; F++)
              L[F][P](r, C[F][R](b));
        }
      }
      t[x] = r, h.push(r), r++;
    }
  }
  const f = o.clone();
  for (const w in o.attributes) {
    const b = l[w];
    if (f.setAttribute(w, new b.constructor(
      b.array.slice(0, r * b.itemSize),
      b.itemSize,
      b.normalized
    )), w in c)
      for (let x = 0; x < c[w].length; x++) {
        const S = c[w][x];
        f.morphAttributes[w][x] = new S.constructor(
          S.array.slice(0, r * S.itemSize),
          S.itemSize,
          S.normalized
        );
      }
  }
  return f.setIndex(h), f;
}
let Setting$a = class {
  constructor({
    name: e,
    vertices: t,
    faces: s,
    color: i = [1, 0, 0],
    opacity: n = 1,
    position: r = [0, 0, 0],
    materialType: a = "Standard",
    showEdges: l = !1,
    edgeColor: c = [0, 0, 0, 1],
    depthWrite: h = !0,
    depthTest: d = !0,
    side: u = "DoubleSide",
    clearDepth: p = !1,
    renderOrder: m = 0,
    mergeVerticesTolerance: g = null,
    smoothNormals: y = !0,
    visible: f = !0,
    selectable: w = !0,
    layer: b = null,
    userData: x = null
  }) {
    this.name = e, this.vertices = t, this.faces = s, this.color = i, this.opacity = n, this.position = r, this.materialType = a, this.showEdges = l, this.edgeColor = c, this.depthWrite = h, this.depthTest = d, this.side = u, this.clearDepth = p, this.renderOrder = m, this.mergeVerticesTolerance = g, this.smoothNormals = y, this.visible = f, this.selectable = w, this.layer = b, this.userData = x;
  }
};
class AnyMesh {
  constructor(e) {
    this.viewer = e, this.scene = this.viewer.tjs.scene, this.settings = [], this.meshes = [], this.guiFolder = null, this.legendContainer = null, this.meshLegendConfig = this.getMeshLegendConfig(), this.materialsRegistry = this.viewer.materialsRegistry, this.createGui();
    const t = this.viewer.state.get("plugins.anyMesh");
    t && Array.isArray(t.settings) && (this.applySettings(t.settings), this.drawMesh()), this.viewer.state.subscribe("plugins.anyMesh", (s) => {
      !s || !Array.isArray(s.settings) || (this.applySettings(s.settings), this.drawMesh());
    });
  }
  setSettings(e) {
    this.viewer.state.set({ plugins: { anyMesh: { settings: cloneValue(e) } } });
  }
  applySettings(e) {
    this.settings = [], this.clearMeshes(), e.forEach((t) => {
      this.addSetting(t);
    });
  }
  // Modify addSetting to accept a single object parameter
  addSetting({
    name: e,
    vertices: t,
    faces: s,
    color: i,
    opacity: n,
    position: r,
    materialType: a,
    showEdges: l,
    edgeColor: c,
    depthWrite: h,
    depthTest: d,
    side: u,
    clearDepth: p,
    renderOrder: m,
    mergeVerticesTolerance: g,
    smoothNormals: y,
    visible: f,
    selectable: w,
    layer: b,
    userData: x
  }) {
    e || (e = `mesh-${this.settings.length + 1}`);
    const S = new Setting$a({
      name: e,
      vertices: t,
      faces: s,
      color: i,
      opacity: n,
      position: r,
      materialType: a,
      showEdges: l,
      edgeColor: c,
      depthWrite: h,
      depthTest: d,
      side: u,
      clearDepth: p,
      renderOrder: m,
      mergeVerticesTolerance: g,
      smoothNormals: y,
      visible: f,
      selectable: w,
      layer: b,
      userData: x
    });
    this.settings.push(S);
  }
  clearMeshes() {
    this.meshes.forEach((e) => {
      clearObject(this.scene, e);
    }), this.meshes = [];
  }
  drawMesh() {
    this.clearMeshes(), this.settings.forEach((e) => {
      e.clearDepth && this.viewer?.tjs?.renderer?.clearDepth && this.viewer.tjs.renderer.clearDepth();
      const t = e.materialType || "Standard", s = this.materialsRegistry.getMaterial(t, !0);
      Array.isArray(e.color) ? s.color.setRGB(e.color[0], e.color[1], e.color[2]) : s.color = new THREE.Color(e.color);
      const i = e.opacity ?? 1;
      s.transparent = !0, s.opacity = i;
      const n = {
        FrontSide: THREE.FrontSide,
        BackSide: THREE.BackSide,
        DoubleSide: THREE.DoubleSide
      };
      s.side = n[e.side] ?? THREE.DoubleSide, s.depthWrite = e.depthWrite ?? !0, s.depthTest = e.depthTest ?? !0;
      const r = new THREE.BufferGeometry(), a = new Float32Array(e.vertices);
      r.setAttribute("position", new THREE.BufferAttribute(a, 3));
      const l = new Uint32Array(e.faces);
      r.setIndex(new THREE.BufferAttribute(l, 1));
      let c = r;
      c = mergeVertices(r, e.mergeVerticesTolerance), e.mergeVerticesTolerance, (e.smoothNormals ?? !0) && c.computeVertexNormals();
      const h = new THREE.Mesh(c, s), d = e.selectable ?? !0, u = typeof e.layer == "number" ? e.layer : d ? 0 : 1;
      if (h.userData.anyMeshName = e.name, h.userData.type = "anyMesh", h.userData.uuid = this.viewer.uuid, h.userData.notSelectable = !d, e.userData && typeof e.userData == "object" && Object.assign(h.userData, e.userData), h.layers.set(u), h.visible = e.visible ?? !0, h.position.set(e.position[0], e.position[1], e.position[2]), typeof e.renderOrder == "number" && (h.renderOrder = e.renderOrder), this.meshes.push(h), this.scene.add(h), e.showEdges) {
        const p = e.edgeColor || [0, 0, 0, 1], m = p.length === 4 ? p[3] : 1, g = new THREE.LineBasicMaterial({
          color: new THREE.Color(p[0], p[1], p[2]),
          transparent: m < 1,
          opacity: m
        }), y = new THREE.EdgesGeometry(c), f = new THREE.LineSegments(y, g);
        f.userData.anyMeshName = e.name, f.userData.type = "anyMesh", f.userData.uuid = this.viewer.uuid, f.userData.notSelectable = !d, e.userData && typeof e.userData == "object" && Object.assign(f.userData, e.userData), f.layers.set(u), f.visible = e.visible ?? !0, f.position.set(0, 0, 0), f.renderOrder = (h.renderOrder ?? 0) + 0.1, this.meshes.push(f), h.add(f);
      }
    }), this.updateLegend(), this.viewer.requestRedraw?.("render");
  }
  getMeshLegendConfig() {
    return this.viewer?.guiManager?.guiConfig ? (this.viewer.guiManager.guiConfig.meshLegend || (this.viewer.guiManager.guiConfig.meshLegend = { enabled: !1, position: "bottom-left" }), this.viewer.guiManager.guiConfig.meshLegend) : { enabled: !1, position: "bottom-left" };
  }
  createGui() {
    const e = this.viewer?.guiManager?.guiConfig;
    !this.viewer?.guiManager?.gui || this.guiFolder || e && e.controls && e.controls.meshControls === !1 || (this.guiFolder = this.viewer.guiManager.gui.addFolder("Meshes"), this.legendToggleController = this.guiFolder.add(this.meshLegendConfig, "enabled").name("Show Mesh Legend").onChange((t) => {
      this.meshLegendConfig.enabled = t, this.updateLegend();
    }));
  }
  removeGui() {
    !this.guiFolder || !this.viewer?.guiManager?.gui || (this.viewer.guiManager.gui.removeFolder(this.guiFolder), this.guiFolder = null);
  }
  addLegend() {
    if (this.removeLegend(), this.settings.length === 0)
      return;
    const e = document.createElement("div");
    e.id = "mesh-legend-container", e.style.position = "absolute", e.style.backgroundColor = "rgba(255, 255, 255, 0.85)", e.style.padding = "8px 10px", e.style.borderRadius = "6px", e.style.zIndex = "1000", e.style.display = "flex", e.style.flexDirection = "column", e.style.gap = "6px", this.setLegendPosition(e);
    const t = (s) => s.stopPropagation();
    ["click", "mousedown", "mouseup", "pointerdown", "pointerup"].forEach((s) => {
      e.addEventListener(s, t, !1);
    }), this.settings.forEach((s) => {
      const i = document.createElement("div");
      i.style.display = "flex", i.style.alignItems = "center", i.style.cursor = "pointer", i.style.gap = "6px";
      const n = s.visible ?? !0;
      i.style.opacity = n ? "1" : "0.45", i.style.textDecoration = n ? "none" : "line-through";
      const r = document.createElement("span");
      r.style.width = "12px", r.style.height = "12px", r.style.borderRadius = "3px", r.style.backgroundColor = resolveLegendColor(s.color), r.style.border = "1px solid rgba(0, 0, 0, 0.2)", i.appendChild(r);
      const a = document.createElement("span");
      a.textContent = s.name || "mesh", a.style.fontSize = "12px", a.style.color = "#1f2933", i.appendChild(a), i.addEventListener("click", () => this.toggleMeshVisibility(s.name)), e.appendChild(i);
    }), this.legendContainer = e, this.viewer.tjs.containerElement.appendChild(e);
  }
  removeLegend() {
    const e = this.viewer.tjs.containerElement.querySelector("#mesh-legend-container");
    e && e.remove(), this.legendContainer = null;
  }
  updateLegend() {
    if (!this.meshLegendConfig?.enabled) {
      this.removeLegend();
      return;
    }
    this.addLegend();
  }
  setLegendPosition(e) {
    const t = this.meshLegendConfig.position || "bottom-left";
    e.style.top = t.includes("top") ? "10px" : "", e.style.bottom = t.includes("bottom") ? "10px" : "", e.style.left = t.includes("left") ? "10px" : "", e.style.right = t.includes("right") ? "10px" : "";
  }
  toggleMeshVisibility(e) {
    if (!e)
      return;
    const t = this.settings.map((s) => {
      if (s.name !== e)
        return { ...s };
      const i = s.visible ?? !0;
      return { ...s, visible: !i };
    });
    this.setSettings(t);
  }
}
function resolveLegendColor(o) {
  const e = new THREE.Color();
  return Array.isArray(o) ? e.setRGB(o[0] ?? 1, o[1] ?? 0, o[2] ?? 0) : o ? e.set(o) : e.setRGB(1, 0, 0), `#${e.getHexString()}`;
}
let Setting$9 = class {
  constructor({ positions: e = [], texts: t = "+", color: s = "#111111", fontSize: i = "16px", className: n = "text-label text-label-cross", renderMode: r = "glyph", shift: a = [0, 0, 0] }) {
    this.positions = e, this.texts = t, this.color = s, this.fontSize = i, this.className = n, this.renderMode = r, this.shift = a;
  }
};
class TextManager {
  constructor(e) {
    this.weas = e?.weas ? e.weas : e, this.viewer = e?.weas ? e : null, this.scene = this.weas?.tjs?.scene, this.state = this.weas?.state, this.settings = [], this.labels = [];
    const t = this.state?.get("plugins.text");
    t && Array.isArray(t.settings) && (this.applySettings(t.settings), this.drawTextLabels()), this.state?.subscribe("plugins.text", (s) => {
      if (!s)
        return;
      const i = Array.isArray(s.settings) ? s.settings : [];
      this.applySettings(i), !this.getViewer()?._initializingState && this.drawTextLabels();
    });
  }
  setSettings(e) {
    this.state.set({ plugins: { text: { settings: cloneValue(e) } } });
  }
  applySettings(e) {
    this.settings = [], this.clearLabels(), e.forEach((t) => {
      this.addSetting(t);
    });
  }
  addSetting({ positions: e, texts: t = "+", color: s = "#111111", fontSize: i = "16px", className: n, renderMode: r = "glyph", shift: a = [0, 0, 0] }) {
    const l = new Setting$9({ positions: e, texts: t, color: s, fontSize: i, className: n, renderMode: r, shift: a });
    this.settings.push(l);
  }
  clearLabels() {
    this.labels.forEach((e) => {
      this.scene.remove(e), e.remove();
    }), this.labels = [];
  }
  redraw() {
    this.drawTextLabels();
  }
  drawTextLabels() {
    this.clearLabels(), this.settings.forEach((e) => {
      const t = resolveOrigins(this.getAtoms(), e);
      if (!t.length)
        return;
      const s = new THREE.Vector3(...e.shift), i = Array.isArray(e.texts) ? e.texts : null, n = normalizeFontSize$1(e.fontSize), r = e.className || "text-label text-label-cross", a = e.renderMode || "glyph";
      t.forEach((l, c) => {
        const h = new THREE.Vector3(...l).add(s), d = i ? i[c] ?? "" : e.texts, { label: u } = this.createTextLabel(h, d, e.color, n, r, a);
        this.scene.add(u), this.labels.push(u);
      });
    }), this.weas?.requestRedraw?.("render");
  }
  createTextLabel(e, t, s, i, n, r = "glyph") {
    const a = t === "+", l = a && !n.includes("text-label-cross") ? `${n} text-label-cross` : n, c = createLabel(e, t, s, i, l), h = a && l.includes("text-label-cross") && r === "shape";
    return h && (c.element.textContent = "", c.element.dataset.cross = "true", c.element.style.setProperty("--cross-size", i)), { label: c, isCross: h };
  }
  updateLabelSizes() {
  }
  getAtoms() {
    const e = this.getViewer();
    return e?.atoms ? e.atoms : null;
  }
  getViewer() {
    return this.viewer || this.weas?.avr || null;
  }
}
function resolveOrigins(o, e) {
  return Array.isArray(e.positions) ? e.positions : [];
}
function normalizeFontSize$1(o) {
  return typeof o == "number" ? `${o}px` : typeof o == "string" && o.trim() !== "" ? o : "14px";
}
class CellManager {
  constructor(e, t = {}) {
    this.viewer = e, this.cellMesh = null, this.cellVectors = null, this.shapeRegistry = e.weas.shapeRegistry, this.settings = {
      showCell: t.showCell ?? !0,
      showAxes: t.showAxes ?? !0,
      cellColor: t.cellColor ?? 0,
      // Default black
      cellLineWidth: t.cellLineWidth ?? 2,
      // Default width
      axisColors: t.axisColors ?? {
        a: 16711680,
        b: 65280,
        c: 255
      }
      // RGB
    }, this._showCell = this.settings.showCell, this._showAxes = this.settings.showAxes;
    const s = this.viewer.state.get("cell") || {};
    Object.assign(this.settings, s), s.showCell !== void 0 && (this._showCell = s.showCell), s.showAxes !== void 0 && (this._showAxes = s.showAxes), this.viewer.state.subscribe("cell", (i, n) => {
      if (!i)
        return;
      const r = n || {}, {
        showCell: a,
        showAxes: l,
        ...c
      } = i, h = { ...r };
      delete h.showCell, delete h.showAxes, Object.assign(this.settings, c), a !== void 0 && (this.showCell = a), l !== void 0 && (this.showAxes = l), JSON.stringify(c) !== JSON.stringify(h) && (this.draw(), this.viewer.requestRedraw?.("render"));
    });
  }
  get showCell() {
    return this._showCell;
  }
  set showCell(e) {
    this._showCell = e, this.cellMesh && (this.cellMesh.visible = e), this.cellVectors && (this.cellVectors.visible = e), this.viewer.requestRedraw?.("render");
  }
  get showAxes() {
    return this._showAxes;
  }
  set showAxes(e) {
    this._showAxes = e, this.cellVectors && (this.cellVectors.visible = e), this.viewer.requestRedraw?.("render");
  }
  clear() {
    if (this.cellMesh && (this.viewer.tjs.scene.remove(this.cellMesh), this.cellMesh.geometry.dispose(), this.cellMesh.material.dispose(), this.cellMesh = null), this.cellVectors) {
      const e = this.viewer.tjs.hud.miniScenes.get("coord");
      e && e.scene.remove(this.cellVectors), this.cellVectors = null;
    }
  }
  draw() {
    this.clear(), this.viewer.originalCell.some((e) => e.every((t) => t === 0)) || (this.currentCell = this.viewer.originalCell.map((e) => e.slice()), this.cellMesh = this.drawUnitCell(), this.cellVectors = this.drawUnitCellVectors(), this.cellVectors.visible = this.showAxes);
  }
  drawUnitCell() {
    const e = this.viewer.originalCell;
    if (!e || e.length !== 3) {
      console.warn("Invalid or missing unit cell data");
      return;
    }
    const t = new THREE.LineBasicMaterial({
      color: this.settings.cellColor,
      linewidth: this.settings.cellLineWidth
    }), s = [], i = new THREE.Vector3(0, 0, 0), n = new THREE.Vector3(...e[0]), r = new THREE.Vector3(...e[1]), a = new THREE.Vector3().addVectors(n, r), l = new THREE.Vector3(...e[2]), c = new THREE.Vector3().addVectors(n, l), h = new THREE.Vector3().addVectors(r, l), d = new THREE.Vector3().addVectors(a, l);
    s.push(i, n, n, a, a, r, r, i), s.push(l, c, c, d, d, h, h, l), s.push(i, l, n, c, r, h, a, d);
    const u = new THREE.BufferGeometry().setFromPoints(s), p = new THREE.LineSegments(u, t);
    return p.userData = {
      type: "cell",
      uuid: this.viewer.uuid,
      objectMode: "edit",
      notSelectable: !0
    }, p.layers.set(1), this.viewer.tjs.scene.add(p), p.visible = this.showCell, p;
  }
  drawUnitCellVectors() {
    const e = new THREE.Vector3(0, 0, 0), t = this.viewer.originalCell, s = 1.5;
    if (!t || t.length !== 3) {
      console.warn("Invalid or missing unit cell data for vectors");
      return;
    }
    if (!this.viewer.tjs.hud.miniScenes.get("coord")) return;
    const n = this.viewer.tjs.hud.coordAxesGroup, r = new THREE.Group(), a = ["a", "b", "c"], l = this.settings.axisColors, c = 0.5;
    return t.forEach((h, d) => {
      const m = new THREE.Vector3(...h).clone().normalize().clone().multiplyScalar(s), g = this.shapeRegistry.create("Arrow", {
        color: l[a[d]],
        start: e.clone(),
        end: m.clone(),
        shaftRadius: 0.06,
        headRadius: 0.12,
        shaftRatio: 0.75
      });
      r.add(g);
      const y = m.clone().multiplyScalar(1 + c / s);
      r.add(
        createSpriteLabel(y, a[d], "black", "36px")
      );
      const f = this.shapeRegistry.create("Sphere", {
        color: "grey",
        position: e.clone(),
        scale: [0.22, 0.22, 0.22]
      });
      r.add(f);
    }), n.add(r), r.visible = this.showCell, r;
  }
  // This seems unused - perhaps in a clean up we can consider removing this.
  updateCellMesh(e) {
    if (!e || e.length !== 3) {
      console.warn("Invalid cell data for updating cell mesh");
      return;
    }
    if (!this.cellMesh && !this.currentCell) return;
    const t = 1e-5;
    if (!e.every(
      (s, i) => s.every(
        (n, r) => Math.abs(n - this.currentCell[i][r]) < t
      )
    )) {
      if (this.cellMesh) {
        const s = new THREE.LineBasicMaterial({
          color: this.settings.cellColor,
          linewidth: this.settings.cellLineWidth
        }), i = [], n = new THREE.Vector3(0, 0, 0), r = new THREE.Vector3(...e[0]), a = new THREE.Vector3(...e[1]), l = new THREE.Vector3().addVectors(r, a), c = new THREE.Vector3(...e[2]), h = new THREE.Vector3().addVectors(r, c), d = new THREE.Vector3().addVectors(a, c), u = new THREE.Vector3().addVectors(l, c);
        i.push(n, r, r, l, l, a, a, n), i.push(c, h, h, u, u, d, d, c), i.push(n, c, r, h, a, d, l, u), this.cellMesh.geometry.setFromPoints(i), this.cellMesh.material = s;
      }
      if (this.cellVectors) {
        const s = [
          new THREE.Vector3(...e[0]).normalize(),
          new THREE.Vector3(...e[1]).normalize(),
          new THREE.Vector3(...e[2]).normalize()
        ], i = new THREE.Vector3(0, 1, 0);
        for (let r = 0; r < 3; r++) {
          const a = new THREE.Quaternion().setFromUnitVectors(
            i,
            s[r]
          );
          this.cellVectors.children[r].setRotationFromQuaternion(a);
        }
        const n = 3.3;
        this.cellVectors.children[3].position.copy(
          s[0].multiplyScalar(n)
        ), this.cellVectors.children[4].position.copy(
          s[1].multiplyScalar(n)
        ), this.cellVectors.children[5].position.copy(
          s[2].multiplyScalar(n)
        );
      }
    }
  }
}
function createSpriteLabel(o, e, t, s) {
  const n = document.createElement("canvas");
  n.width = 128, n.height = 128;
  const r = n.getContext("2d");
  r.font = `${parseInt(s) * (128 / 180)}px Arial`, r.fillStyle = t, r.textAlign = "center", r.textBaseline = "middle", r.fillText(e, n.width / 2, n.height / 2);
  const a = new THREE.CanvasTexture(n);
  a.minFilter = THREE.LinearFilter, a.generateMipmaps = !1, a.encoding = THREE.sRGBEncoding, a.anisotropy = 16;
  const l = new THREE.Sprite(new THREE.SpriteMaterial({ map: a }));
  l.position.copy(o);
  const c = 2.25;
  return l.scale.set(c, c, 1), l;
}
function getAtomColors(o, e, t) {
  let s = [], i;
  if (e === "Random")
    s = [], o.symbols.forEach((n, r) => {
      i = new THREE.Color(Math.random() * 16777215), s.push(i);
    });
  else if (e === "Uniform")
    s = [], o.symbols.forEach((n, r) => {
      i = new THREE.Color(t.colorRamp[0]), s.push(i);
    });
  else if (e === "Index") {
    s = [];
    const n = o.symbols.map((r, a) => a);
    return getColorsFromArray(n, t.colorRamp);
  } else if (e in o.attributes.atom) {
    const n = o.attributes.atom[e];
    if (n.length > 0 && n[0].length) {
      const r = n.map((a) => Math.sqrt(a.reduce((l, c) => l + c ** 2, 0)));
      return getColorsFromArray(r, t.colorRamp);
    }
    return getColorsFromArray(n, t.colorRamp);
  }
  return s;
}
function getColorsFromArray(o, e) {
  const t = [], s = Math.min(...o), n = Math.max(...o) - s, r = e.length - 1;
  return o.forEach((a) => {
    const l = (a - s) / n, c = Math.min(Math.floor(l * r), r - 1), h = (l - c / r) * r, d = new THREE.Color(e[c]), u = new THREE.Color(e[c + 1]), p = new THREE.Color(d.r, d.g, d.b).lerp(u, h);
    t.push(p);
  }), t;
}
let Setting$8 = class {
  constructor({ element: e, symbol: t, radius: s = 2, color: i = "#3d82ed" }) {
    this.element = e, this.symbol = t, this.color = convertColor(i), this.radius = s;
  }
  toDict() {
    return {
      element: this.element,
      symbol: this.symbol,
      color: this.color,
      radius: this.radius
    };
  }
};
class BoundaryManager {
  constructor(e) {
    this.viewer = e, this.scene = this.viewer.tjs.scene, this.settings = {}, this.meshes = {}, this.init();
  }
  init() {
    this.viewer.logger.debug("init atom settings"), this.settings = {}, Object.entries(this.viewer.originalAtoms.species).forEach(([e, t]) => {
      this.settings[e] = this.getDefaultSetting(e, t);
    });
  }
  getDefaultSetting(e, t) {
    const s = elementColors[this.viewer.colorType][t.element], i = radiiData[this.viewer.radiusType][t.element];
    return new Setting$8({ element: t.element, symbol: e, radius: i, color: s });
  }
  addSetting({ specie1: e, specie2: t, radius: s, min: i = 0, max: n = 3, color1: r = "#3d82ed", color2: a = "#3d82ed", order: l = 1 }) {
    const c = new Setting$8({ specie1: e, specie2: t, radius: s, min: i, max: n, color1: r, color2: a, order: l }), h = e + "-" + t;
    this.settings[h] = c;
  }
  getBoundaryAtoms() {
    this.viewer.boundaryList = searchBoundary(this.viewer.atoms, this.viewer._boundary), this.viewer.logger.debug("boundaryList: ", this.viewer.boundaryList), this.viewer.boundaryMap = createBoundaryMapping(this.viewer.boundaryList), this.viewer.logger.debug("boundaryMap: ", this.viewer.boundaryMap);
  }
}
function getImageAtoms(o, e) {
  const t = new Atoms();
  t.cell = o.cell, t.species = o.species;
  const s = e.map((i) => {
    const n = o.positions[i[0]], r = calculateCartesianCoordinates(o.cell, [i[1][0], i[1][1], i[1][2]]);
    return n.map((a, l) => a + r[l]);
  });
  return t.positions = s, t.symbols = e.map((i) => o.symbols[i[0]]), t.uuid = o.uuid, t;
}
function searchBoundary(o, e = [
  [-0.01, 1.01],
  [-0.01, 1.01],
  [-0.01, 1.01]
]) {
  if (o.isUndefinedCell())
    return [];
  let t = o.positions, s = o.species;
  typeof e == "number" && (e = [
    [-e, 1 + e],
    [-e, 1 + e],
    [-e, 1 + e]
  ]), e = e.map((g) => g.map(Number));
  const i = e.map((g) => Math.floor(g[0])), n = e.map((g) => Math.ceil(g[1])), r = [i, n.map((g, y) => g)], a = r[0].reduce((g, y, f) => g * (r[1][f] - y), 1);
  t = o.calculateFractionalCoordinates();
  const l = t.length;
  let c = repeatPositions(t, a - 1), h = 0, d = [], u = [];
  for (let g = r[0][0]; g < r[1][0]; g++)
    for (let y = r[0][1]; y < r[1][1]; y++)
      for (let f = r[0][2]; f < r[1][2]; f++) {
        if (g === 0 && y === 0 && f === 0)
          continue;
        let w = h + l;
        for (let b = h; b < w; b++)
          c[b] = c[b].map((x, S) => x + (S === 0 ? g : S === 1 ? y : f)), d.push([b % l, [g, y, f]]);
        u = u.concat(s), h = w;
      }
  let p = [];
  for (let g = 0; g < c.length; g++)
    c[g][0] > e[0][0] && c[g][0] < e[0][1] && c[g][1] > e[1][0] && c[g][1] < e[1][1] && c[g][2] > e[2][0] && c[g][2] < e[2][1] && p.push(g);
  return p.map((g) => d[g]);
}
function createBoundaryMapping(o) {
  const e = {};
  return o.forEach((t, s) => {
    const i = t[0], n = t[1];
    e[i] ? e[i].push({ index: s, offset: n }) : e[i] = [{ index: s, offset: n }];
  }), e;
}
function repeatPositions(o, e) {
  let t = [];
  for (let s = 0; s < e; s++)
    for (let i = 0; i < o.length; i++)
      t.push([...o[i]]);
  return t;
}
function convertColor$1(o) {
  return Array.isArray(o) ? o = new THREE.Color(...o) : o = new THREE.Color(o), o;
}
function drawAtoms({
  atoms: o,
  atomScales: e,
  settings: t,
  colors: s,
  materialType: i = "Standard",
  shapeType: n = "Sphere",
  data_type: r = "atom",
  shapeRegistry: a
}) {
  const c = [
    [1e5, 12],
    [1e4, 18],
    [1e3, 24],
    [100, 32]
  ].find(([b]) => o.symbols.length > b)?.[1] ?? 32, h = a.create(n, { materialType: i, widthSegments: c, heightSegments: c });
  let d, u;
  if (h instanceof THREE.Mesh)
    d = h.geometry.clone(), u = h.material.clone();
  else if (h instanceof THREE.Group) {
    const b = h.children.find((x) => x instanceof THREE.Mesh);
    if (!b) throw new Error("Shape group has no meshes");
    d = b.geometry.clone(), u = b.material.clone();
  } else
    throw new Error("Unsupported shape type for instancing");
  u = u.clone(), u.color.set(16777215), u.transparent = !0, u.side = THREE.DoubleSide;
  const p = o.symbols.length, m = new THREE.InstancedMesh(d, u, p);
  m.instanceColor = new THREE.InstancedBufferAttribute(
    new Float32Array(p * 3),
    3
  );
  const g = new THREE.Vector3(), y = new THREE.Quaternion(), f = new THREE.Vector3(), w = new THREE.Matrix4();
  return o.symbols.forEach((b, x) => {
    g.set(...o.positions[x]);
    const M = (b in t ? t[b].radius : 1) * e[x];
    f.set(M, M, M), w.compose(g, y, f), m.setMatrixAt(x, w);
    const E = s[x] instanceof THREE.Color ? s[x] : new THREE.Color(s[x]);
    m.setColorAt(x, E);
  }), m.instanceMatrix.needsUpdate = !0, m.instanceColor.needsUpdate = !0, m.userData = {
    type: r,
    uuid: o.uuid,
    objectMode: "edit"
  }, m;
}
let Setting$7 = class {
  constructor({ element: e, symbol: t, radius: s = 2, color: i = "#3d82ed" }) {
    this.element = e, this.symbol = t, this.color = convertColor$1(i), this.radius = s;
  }
  toDict() {
    return {
      element: this.element,
      symbol: this.symbol,
      color: this.color,
      radius: this.radius
    };
  }
};
class AtomManager {
  constructor(e) {
    this.viewer = e, this.scene = this.viewer.tjs.scene, this.settings = {}, this.meshes = {}, this.materialsRegistry = this.viewer.weas.materialsRegistry, this.shapeRegistry = this.viewer.weas.shapeRegistry, this.init();
    const t = this.viewer.state.get("plugins.species");
    t && t.settings && this.applySettings(t.settings), this.viewer.state.subscribe("plugins.species", (s) => {
      !s || !s.settings || (this.applySettings(s.settings), this.viewer._initializingState || this.viewer.requestRedraw?.("full"));
    });
  }
  init() {
    this.viewer.logger.debug("init atom settings"), this.settings = {}, Object.entries(this.viewer.originalAtoms.species).forEach(([e, t]) => {
      this.settings[e] = this.getDefaultSetting(e, t.element);
    }), this.updateAtomColors();
  }
  updateAtomColors() {
    const e = [];
    this.viewer.atoms.symbols.forEach((t, s) => {
      this.settings[t] || (this.settings[t] = this.getDefaultSetting(t, this.viewer.atoms.species[t]?.element || t));
      const i = new THREE.Color(this.settings[t].color);
      e.push(i);
    }), this.viewer.atomColors = e, this.viewer.colorBy !== "Element" && (this.viewer.atomColors = getAtomColors(this.viewer.atoms, this.viewer.colorBy, { colorType: this.viewer.colorType, colorRamp: this.viewer._colorRamp }));
  }
  getDefaultSetting(e, t) {
    let s, i;
    return "color" in this.viewer.atoms.attributes.specie ? s = this.viewer.atoms.attributes.specie.color[e] || "#3d82ed" : s = elementColors[this.viewer.colorType][t], "radii" in this.viewer.atoms.attributes.specie ? i = this.viewer.atoms.attributes.specie.radii[e] || 1 : i = radiiData[this.viewer.radiusType][t] || 1, new Setting$7({ element: t, symbol: e, radius: i, color: s });
  }
  setSettings(e) {
    this.viewer.state.set({ plugins: { species: { settings: cloneValue(e) } } });
  }
  applySettings(e) {
    this.settings = {}, this.clearMeshes(), Object.values(e).forEach((t) => {
      this.addSetting(t);
    });
  }
  addSetting({ element: e, symbol: t, radius: s = 2, color: i = "#3d82ed" }) {
    const n = new Setting$7({ element: e, symbol: t, radius: s, color: i });
    this.settings[t] = n;
  }
  toPlainSettings() {
    const e = {};
    return Object.entries(this.settings).forEach(([t, s]) => {
      e[t] = s && typeof s.toDict == "function" ? s.toDict() : s;
    }), e;
  }
  getMaxRadius() {
    return Math.max(...Object.values(this.settings).map((e) => e.radius));
  }
  getMinRadius() {
    return Math.min(...Object.values(this.settings).map((e) => e.radius));
  }
  clearMeshes() {
    Object.values(this.meshes).forEach((e) => {
      clearObject(this.scene, e);
    }), this.meshes = {};
  }
  drawBalls() {
    this.updateAtomColors();
    const e = drawAtoms({
      scene: this.scene,
      atoms: this.viewer.atoms,
      atomScales: this.viewer.atomScales,
      settings: this.settings,
      colors: this.viewer.atomColors,
      materialType: this.viewer._materialType,
      shapeRegistry: this.shapeRegistry
    });
    this.scene.add(e);
    const t = this.viewer.boundaryList || [];
    if (this.viewer.imageAtomsList = this.viewer.bondedAtoms.atoms.concat(t), this.imageAtomMap = createImageAtomsMapping(this.viewer.imageAtomsList), this.viewer.imageAtomsList.length > 0) {
      const s = getImageAtoms(this.viewer.atoms, this.viewer.imageAtomsList);
      let i = new Array(s.getAtomsCount()).fill(1);
      for (let a = 0; a < s.getAtomsCount(); a++)
        i[a] = this.viewer.atomScales[this.viewer.imageAtomsList[a][0]];
      const n = this.viewer.imageAtomsList.map(([a]) => {
        const l = this.viewer.atomColors?.[a];
        if (l)
          return typeof l.clone == "function" ? l.clone() : new THREE.Color(l);
        const c = this.viewer.atoms.symbols[a];
        return this.settings[c] || (this.settings[c] = this.getDefaultSetting(c, s.species[c]?.element || c)), new THREE.Color(this.settings[c].color);
      }), r = drawAtoms({
        scene: this.scene,
        atoms: s,
        atomScales: i,
        settings: this.settings,
        colors: n,
        materialType: this.viewer._materialType,
        shapeRegistry: this.shapeRegistry,
        data_type: "image"
      });
      e.add(r), this.meshes.image = r;
    }
    return this.meshes.atom = e, e;
  }
  updateAtomMesh(e = null, t = null) {
    var s = new THREE.Matrix4();
    for (let i = 0; i < t.positions.length; i++)
      this.meshes.atom.getMatrixAt(i, s), s.setPosition(new THREE.Vector3(...t.positions[i])), this.meshes.atom.setMatrixAt(i, s), this.updateImageAtomsMesh(i);
    this.meshes.atom.instanceMatrix.needsUpdate = !0, this.meshes.image && (this.meshes.image.instanceMatrix.needsUpdate = !0);
  }
  updateImageAtomsMesh(e) {
    this.viewer.imageAtomsList.length > 0 && this.imageAtomMap[e] && this.imageAtomMap[e].forEach((s) => {
      const i = s.index, n = this.viewer.atoms.positions[e].map((a, l) => a + calculateCartesianCoordinates(this.viewer.atoms.cell, s.offset)[l]), r = new THREE.Matrix4();
      this.meshes.image.getMatrixAt(i, r), r.setPosition(new THREE.Vector3(...n)), this.meshes.image.setMatrixAt(i, r);
    });
  }
  // Method to update the scale of atoms
  updateAtomScale(e) {
    e === void 0 && (e = this.viewer.atomScale);
    let t = this.meshes.atom;
    const s = this.viewer.selectedAtomsIndices.length > 0 ? this.viewer.selectedAtomsIndices : [...Array(this.viewer.atoms.positions.length).keys()];
    if (this.updateMeshScale(t, s, this.viewer.atoms.symbols, e), t = this.meshes.image, t) {
      const i = [], n = [];
      for (let r = 0; r < this.viewer.imageAtomsList.length; r++)
        i.push(this.viewer.atoms.symbols[this.viewer.imageAtomsList[r][0]]), this.viewer.selectedAtomsIndices.includes(this.viewer.imageAtomsList[r][0]) && n.push(r);
      this.updateMeshScale(t, n, i, e);
    }
    this.viewer.requestRedraw?.("render");
  }
  updateMeshScale(e, t, s, i) {
    const n = new THREE.Vector3(), r = new THREE.Quaternion(), a = new THREE.Vector3();
    t.forEach((l) => {
      const c = new THREE.Matrix4(), h = this.settings[s[l]].radius || 1;
      e.getMatrixAt(l, c), c.decompose(n, r, a), a.set(h * i, h * i, h * i), c.compose(n, r, a), e.setMatrixAt(l, c);
    }), e.instanceMatrix.needsUpdate = !0;
  }
}
function createImageAtomsMapping(o) {
  const e = {};
  return o.forEach((t, s) => {
    const i = t[0], n = t[1];
    e[i] ? e[i].push({ index: s, offset: n }) : e[i] = [{ index: s, offset: n }];
  }), e;
}
class Node {
  constructor(e, t, s) {
    this.obj = e, this.left = null, this.right = null, this.parent = s, this.dimension = t;
  }
}
class kdTree {
  constructor(e, t, s) {
    var i = this;
    function n(a, l, c) {
      var h = l % s.length, d, u;
      return a.length === 0 ? null : a.length === 1 ? new Node(a[0], h, c) : (a.sort(function(p, m) {
        return p[s[h]] - m[s[h]];
      }), d = Math.floor(a.length / 2), u = new Node(a[d], h, c), u.left = n(a.slice(0, d), l + 1, u), u.right = n(a.slice(d + 1), l + 1, u), u);
    }
    function r(a) {
      i.root = a;
      function l(c) {
        c.left && (c.left.parent = c, l(c.left)), c.right && (c.right.parent = c, l(c.right));
      }
      l(i.root);
    }
    Array.isArray(e) ? this.root = n(e, 0, null) : r(e), this.toJSON = function(a) {
      a || (a = this.root);
      var l = new Node(a.obj, a.dimension, null);
      return a.left && (l.left = i.toJSON(a.left)), a.right && (l.right = i.toJSON(a.right)), l;
    }, this.insert = function(a) {
      function l(u, p) {
        if (u === null)
          return p;
        var m = s[u.dimension];
        return a[m] < u.obj[m] ? l(u.left, u) : l(u.right, u);
      }
      var c = l(this.root, null), h, d;
      if (c === null) {
        this.root = new Node(a, 0, null);
        return;
      }
      h = new Node(a, (c.dimension + 1) % s.length, c), d = s[c.dimension], a[d] < c.obj[d] ? c.left = h : c.right = h;
    }, this.remove = function(a) {
      var l;
      function c(d) {
        if (d === null)
          return null;
        if (d.obj === a)
          return d;
        var u = s[d.dimension];
        return a[u] < d.obj[u] ? c(d.left) : c(d.right);
      }
      function h(d) {
        var u, p, m;
        function g(y, f) {
          var w, b, x, S, M;
          return y === null ? null : (w = s[f], y.dimension === f ? y.left !== null ? g(y.left, f) : y : (b = y.obj[w], x = g(y.left, f), S = g(y.right, f), M = y, x !== null && x.obj[w] < b && (M = x), S !== null && S.obj[w] < M.obj[w] && (M = S), M));
        }
        if (d.left === null && d.right === null) {
          if (d.parent === null) {
            i.root = null;
            return;
          }
          m = s[d.parent.dimension], d.obj[m] < d.parent.obj[m] ? d.parent.left = null : d.parent.right = null;
          return;
        }
        d.right !== null ? (u = g(d.right, d.dimension), p = u.obj, h(u), d.obj = p) : (u = g(d.left, d.dimension), p = u.obj, h(u), d.right = d.left, d.left = null, d.obj = p);
      }
      l = c(i.root), l !== null && h(l);
    }, this.nearest = function(a, l, c) {
      var h, d, u;
      u = new BinaryHeap(function(m) {
        return -m[1];
      });
      function p(m) {
        var g, y = s[m.dimension], f = t(a, m.obj), w = {}, b, x, S;
        function M(E, v) {
          u.push([E, v]), u.size() > l && u.pop();
        }
        for (S = 0; S < s.length; S += 1)
          S === m.dimension ? w[s[S]] = a[s[S]] : w[s[S]] = m.obj[s[S]];
        if (b = t(w, m.obj), m.right === null && m.left === null) {
          (u.size() < l || f < u.peek()[1]) && M(m, f);
          return;
        }
        m.right === null ? g = m.left : m.left === null ? g = m.right : a[y] < m.obj[y] ? g = m.left : g = m.right, p(g), (u.size() < l || f < u.peek()[1]) && M(m, f), (u.size() < l || Math.abs(b) < u.peek()[1]) && (g === m.left ? x = m.right : x = m.left, x !== null && p(x));
      }
      if (c)
        for (h = 0; h < l; h += 1)
          u.push([null, c]);
      for (i.root && p(i.root), d = [], h = 0; h < Math.min(l, u.content.length); h += 1)
        u.content[h][0] && d.push([u.content[h][0].obj, u.content[h][1]]);
      return d;
    }, this.balanceFactor = function() {
      function a(c) {
        return c === null ? 0 : Math.max(a(c.left), a(c.right)) + 1;
      }
      function l(c) {
        return c === null ? 0 : l(c.left) + l(c.right) + 1;
      }
      return a(i.root) / (Math.log(l(i.root)) / Math.log(2));
    };
  }
}
class BinaryHeap {
  constructor(e) {
    this.content = [], this.scoreFunction = e;
  }
  push(e) {
    this.content.push(e), this.bubbleUp(this.content.length - 1);
  }
  pop() {
    var e = this.content[0], t = this.content.pop();
    return this.content.length > 0 && (this.content[0] = t, this.sinkDown(0)), e;
  }
  peek() {
    return this.content[0];
  }
  remove(e) {
    for (var t = this.content.length, s = 0; s < t; s++)
      if (this.content[s] == e) {
        var i = this.content.pop();
        s != t - 1 && (this.content[s] = i, this.scoreFunction(i) < this.scoreFunction(e) ? this.bubbleUp(s) : this.sinkDown(s));
        return;
      }
    throw new Error("Node not found.");
  }
  size() {
    return this.content.length;
  }
  bubbleUp(e) {
    for (var t = this.content[e]; e > 0; ) {
      var s = Math.floor((e + 1) / 2) - 1, i = this.content[s];
      if (this.scoreFunction(t) < this.scoreFunction(i))
        this.content[s] = t, this.content[e] = i, e = s;
      else
        break;
    }
  }
  sinkDown(e) {
    for (var t = this.content.length, s = this.content[e], i = this.scoreFunction(s); ; ) {
      var n = (e + 1) * 2, r = n - 1, a = null;
      if (r < t) {
        var l = this.content[r], c = this.scoreFunction(l);
        c < i && (a = r);
      }
      if (n < t) {
        var h = this.content[n], d = this.scoreFunction(h);
        d < (a == null ? i : c) && (a = n);
      }
      if (a != null)
        this.content[e] = this.content[a], this.content[a] = s, e = a;
      else
        break;
    }
  }
}
const defaultBondRadius = 0.1;
let Setting$6 = class {
  constructor({ specie1: e, specie2: t, min: s = 0, max: i = 3, color1: n = "#3d82ed", color2: r = "#3d82ed", radius: a = defaultBondRadius, order: l = 1, type: c = 0 }) {
    this.specie1 = e, this.specie2 = t, this.min = s, this.max = i, this.color1 = convertColor$1(n), this.color2 = convertColor$1(r), this.radius = a, this.order = l, this.type = c;
  }
  toDict() {
    return {
      specie1: this.specie1,
      specie2: this.specie2,
      min: this.min,
      max: this.max,
      color1: this.color1,
      color2: this.color2,
      radius: this.radius,
      order: this.order,
      type: this.type
    };
  }
};
class BondManager {
  constructor(e, t = {}) {
    this.viewer = e, this.scene = this.viewer.tjs.scene, this.settings = {}, this.meshes = {}, this.shapeRegistry = this.viewer.weas.shapeRegistry, this.hideLongBonds = t.hideLongBonds ?? !0, this.showHydrogenBonds = t.showHydrogenBonds ?? !1, this.showOutBoundaryBonds = t.showOutBoundaryBonds ?? !1, this.bondRadius = 0.1, this.init();
    const s = this.viewer.state.get("bond") || {};
    s.hideLongBonds !== void 0 && (this.hideLongBonds = s.hideLongBonds), s.showHydrogenBonds !== void 0 && (this.showHydrogenBonds = s.showHydrogenBonds), s.showOutBoundaryBonds !== void 0 && (this.showOutBoundaryBonds = s.showOutBoundaryBonds), s.settings && this.applySettings(s.settings), this.viewer.state.subscribe("bond", (i) => {
      if (!i) return;
      let n = !1;
      i.hideLongBonds !== void 0 && i.hideLongBonds !== this.hideLongBonds && (this.hideLongBonds = i.hideLongBonds, n = !0), i.showHydrogenBonds !== void 0 && i.showHydrogenBonds !== this.showHydrogenBonds && (this.showHydrogenBonds = i.showHydrogenBonds, n = !0), i.showOutBoundaryBonds !== void 0 && i.showOutBoundaryBonds !== this.showOutBoundaryBonds && (this.showOutBoundaryBonds = i.showOutBoundaryBonds, n = !0), i.settings && (this.applySettings(i.settings), n = !0), n && !this.viewer._initializingState && this.viewer.requestRedraw?.("full");
    });
  }
  init() {
    this.viewer.logger.debug("init bond settings"), this.settings = {}, Object.entries(this.viewer.originalAtoms.species).forEach(([e, t]) => {
      Object.entries(this.viewer.originalAtoms.species).forEach(([s, i]) => {
        const n = t.element + "-" + i.element;
        if (default_bond_pairs[n] === void 0)
          return;
        const r = e + "-" + s;
        this.settings[r] = this.getDefaultSetting(e, t, s, i);
      });
    });
  }
  reset() {
    this.meshes = {};
  }
  getDefaultSetting(e, t, s, i) {
    let n = this.viewer.atomManager.settings[e].color, r = this.viewer.atomManager.settings[s].color;
    const a = this.viewer.atomManager.settings[e].radius, l = this.viewer.atomManager.settings[s].radius;
    let c = 0, h = (a + l) * 1.1;
    const d = default_bond_pairs[t.element + "-" + i.element][2];
    return d === 1 && (c = h + 0.4, h = c + 1, n = "#808080", r = "#808080"), new Setting$6({ specie1: e, specie2: s, min: c, max: h, color1: n, color2: r, type: d });
  }
  setSettings(e) {
    this.viewer.state.set({ bond: { settings: cloneValue(e) } });
  }
  applySettings(e) {
    this.settings = {}, this.clearMeshes(), Object.values(e).forEach((t) => {
      this.addSetting(t);
    });
  }
  toPlainSettings() {
    const e = {};
    return Object.entries(this.settings).forEach(([t, s]) => {
      e[t] = s && typeof s.toDict == "function" ? s.toDict() : s;
    }), e;
  }
  // Modify addSetting to accept a single object parameter
  addSetting({ specie1: e, specie2: t, radius: s, min: i = 0, max: n = 3, color1: r = "#3d82ed", color2: a = "#3d82ed", order: l = 1, type: c = 0 }) {
    const h = new Setting$6({ specie1: e, specie2: t, radius: s, min: i, max: n, color1: r, color2: a, order: l, type: c }), d = e + "-" + t;
    this.settings[d] = h;
  }
  buildBondDict() {
    const e = {};
    Object.values(this.settings).forEach((t) => {
      const s = t.specie1, i = t.specie2, n = s + "-" + i;
      e[n] = t.toDict();
    }), this.viewer.logger.debug("cutoffDict: ", e), this.viewer.cutoffs = e;
  }
  buildNeighborList() {
    this.buildBondDict(), this.viewer.neighbors = findNeighbors(this.viewer.originalAtoms, this.viewer.cutoffs, !1, !0, this.viewer.logger), this.viewer.logger.debug("neighbors: ", this.viewer.neighbors);
  }
  clearMeshes() {
    Object.values(this.meshes).forEach((e) => {
      e && clearObject(this.scene, e);
    }), this.meshes = {};
  }
  drawBonds() {
    this.reset();
    const e = new THREE.Group(), t = [];
    for (let h = 0; h < this.viewer.modelSticks.length; h++)
      this.viewer.modelSticks[h] !== 0 && t.push([h, [0, 0, 0]]);
    const s = this.viewer.boundaryList || [];
    if (s.length > 0)
      for (let h = 0; h < s.length; h++)
        t.push(s[h]);
    this.bondList = buildBonds(this.viewer.originalAtoms, t, this.viewer.neighbors.map, this.viewer._boundary, this.viewer.modelSticks, this.showOutBoundaryBonds, this.viewer.logger), this.viewer.bondedAtoms.bonds.forEach((h) => {
      const d = this.viewer.originalAtoms.symbols[h[0]] + "-" + this.viewer.originalAtoms.symbols[h[1]];
      this.viewer.cutoffs[d] && this.bondList.push(h);
    }), this.viewer.debug && this.viewer.logger.debug("bondList: ", this.bondList), this.bondMap = buildBondMap(this.bondList, this.viewer.originalAtoms, this.settings, this.viewer.modelSticks);
    let i = null;
    this.viewer.colorBy !== "Element" && (i = this.viewer.atomColors);
    const n = drawStick({
      atoms: this.viewer.originalAtoms,
      bondList: this.bondList,
      bondIndices: this.bondMap.sticks,
      settings: this.viewer.cutoffs,
      radius: this.bondRadius,
      materialType: this.viewer._materialType,
      atomColors: i,
      withCap: !1,
      logger: this.viewer.logger,
      shapeRegistry: this.shapeRegistry
    }), { bondMesh: r, bondCap: a } = drawStick({
      atoms: this.viewer.originalAtoms,
      bondList: this.bondList,
      bondIndices: this.bondMap.stickCaps,
      settings: this.viewer.cutoffs,
      raiuds: this.bondRadius,
      materialType: this.viewer._materialType,
      atomColors: i,
      withCap: !0,
      logger: this.viewer.logger,
      shapeRegistry: this.shapeRegistry
    });
    let l;
    this.showHydrogenBonds && (l = drawLine(
      this.viewer.originalAtoms,
      this.bondList,
      this.bondMap.dashedLines,
      this.viewer.cutoffs,
      "dashed",
      i
    ));
    const c = drawLine(
      this.viewer.originalAtoms,
      this.bondList,
      this.bondMap.stickCaps,
      this.viewer.cutoffs,
      this.bondRadius,
      this.viewer._materialType
    );
    return this.meshes = { stickBondMesh: n, stickCapBondMesh: r, stickCapBondCap: a, dashedBondLine: l, solidBondLine: c }, Object.values(this.meshes).forEach((h) => {
      h && e.add(h);
    }), e;
  }
  updateBondMesh(e = null, t = null) {
    this.updateBondStick(e, t, this.meshes.stickBondMesh, null, "sticks"), this.updateBondStick(e, t, this.meshes.stickCapBondMesh, this.meshes.stickCapBondCap, "stickCaps"), this.updateBondLine(e, t, this.meshes.dashedBondLine, "dashedLines"), this.updateBondLine(e, t, this.meshes.solidBondLine, "solidLines");
  }
  updateBondStick(e = null, t = null, s, i = null, n = "sticks") {
    if (!s)
      return;
    t === null && (t = this.viewer.originalAtoms);
    let r = [];
    if (e) {
      const a = this.bondMap.bondMap[e];
      a && a[n].forEach((l) => {
        r.push(l[0]);
      });
    } else
      r = this.bondMap[n].map((a, l) => l);
    r.forEach((a) => {
      const l = this.bondList[this.bondMap[n][a]], c = l[0], h = l[1], d = l[2], u = l[3];
      let p = t.positions[c].map((E, v) => E + calculateCartesianCoordinates(t.cell, d)[v]), m = t.positions[h].map((E, v) => E + calculateCartesianCoordinates(t.cell, u)[v]);
      p = new THREE.Vector3(...p), m = new THREE.Vector3(...m);
      const g = new THREE.Vector3().lerpVectors(p, m, 0.25), y = t.symbols[c] + "-" + t.symbols[h];
      if (!this.viewer.cutoffs[y])
        return;
      const f = this.viewer.cutoffs[y].max, w = calculateQuaternion(p, m), b = calculateScale(p, m, this.bondRadius, f, this.hideLongBonds), x = new THREE.Matrix4().compose(g, w, b);
      s.setMatrixAt(a * 2, x);
      const S = new THREE.Vector3().lerpVectors(p, m, 0.75), M = new THREE.Matrix4().compose(S, w, b);
      if (s.setMatrixAt(a * 2 + 1, M), i) {
        const E = new THREE.Vector3(this.bondRadius, this.bondRadius, this.bondRadius), v = new THREE.Matrix4().compose(p, new THREE.Quaternion(), E);
        i.setMatrixAt(a * 2, v);
        const C = new THREE.Matrix4().compose(m, new THREE.Quaternion(), E);
        i.setMatrixAt(a * 2 + 1, C);
      }
    }), s.instanceMatrix.needsUpdate = !0, i && (i.instanceMatrix.needsUpdate = !0);
  }
  updateBondLine(e = null, t = null, s, i = "dashedLines") {
    if (!s)
      return;
    t === null && (t = this.viewer.originalAtoms);
    let n = [];
    if (e) {
      const l = this.bondMap.bondMap[e];
      l && l[i].forEach((c) => {
        n.push(c[0]);
      });
    } else
      n = this.bondMap[i].map((l, c) => c);
    const r = s.geometry.attributes.position, a = r.array;
    n.forEach((l) => {
      const c = this.bondList[this.bondMap[i][l]], h = c[0], d = c[1], u = c[2], p = c[3];
      let m = t.positions[h].map((w, b) => w + calculateCartesianCoordinates(t.cell, u)[b]), g = t.positions[d].map((w, b) => w + calculateCartesianCoordinates(t.cell, p)[b]);
      const y = t.symbols[h] + "-" + t.symbols[d];
      if (!this.settings[y])
        return;
      m = new THREE.Vector3(...m), g = new THREE.Vector3(...g);
      const f = m.distanceTo(g);
      f > this.settings[y].max | f < this.settings[y].min && g.copy(m), a[l * 6] = m.x, a[l * 6 + 1] = m.y, a[l * 6 + 2] = m.z, a[l * 6 + 3] = g.x, a[l * 6 + 4] = g.y, a[l * 6 + 5] = g.z;
    }), r.needsUpdate = !0, s.geometry.computeBoundingBox(), s.geometry.computeBoundingSphere();
  }
}
function drawStick({
  atoms: o,
  bondList: e,
  bondIndices: t,
  settings: s,
  radius: i = 0.1,
  materialType: n = "Standard",
  atomColors: r = null,
  withCap: a = !1,
  logger: l = console,
  shapeRegistry: c
}) {
  const d = [
    [1e4, 6],
    [2e3, 12],
    [500, 18],
    [100, 24]
  ].find(([A]) => t.length > A)?.[1] ?? 24, u = c.create("Cylinder", {
    materialType: n,
    segments: d
  }), p = a ? c.create("Sphere", { materialType: n }) : null;
  let m;
  if (u instanceof THREE.Mesh)
    m = u.geometry.clone(), u.material.clone();
  else
    throw new Error("Cylinder shape must be a mesh");
  let g;
  if (p)
    if (p instanceof THREE.Mesh)
      g = p.geometry.clone();
    else
      throw new Error("Sphere shape must be a mesh");
  const y = u.material.clone();
  y.color.set(16777215), y.transparent = !0;
  const f = performance.now(), w = new THREE.InstancedMesh(
    m,
    y,
    t.length * 2
  ), b = a ? new THREE.InstancedMesh(g, y, t.length * 2) : null, x = new THREE.Vector3(), S = new THREE.Vector3(), M = new THREE.Vector3(), E = new THREE.Vector3(), v = new THREE.Matrix4();
  for (let A = 0; A < t.length; A++) {
    const [_, L, j, R] = e[t[A]], P = o.positions[_].map((T, B) => T + calculateCartesianCoordinates(o.cell, j)[B]);
    x.set(...P);
    const F = o.positions[L].map((T, B) => T + calculateCartesianCoordinates(o.cell, R)[B]);
    S.set(...F);
    const $ = o.symbols[_] + "-" + o.symbols[L], z = r ? r[_] : s[$].color1, Z = r ? r[L] : s[$].color2;
    M.lerpVectors(x, S, 0.25), E.lerpVectors(x, S, 0.75);
    const k = calculateQuaternion(x, S), U = calculateScale(x, S, i);
    if (v.compose(M, k, U), w.setMatrixAt(A * 2, v), w.setColorAt(A * 2, z), v.compose(E, k, U), w.setMatrixAt(A * 2 + 1, v), w.setColorAt(A * 2 + 1, Z), a) {
      const T = new THREE.Vector3(i, i, i), B = new THREE.Matrix4().compose(x, new THREE.Quaternion(), T);
      b.setMatrixAt(A * 2, B), b.setColorAt(A * 2, z);
      const G = new THREE.Matrix4().compose(S, new THREE.Quaternion(), T);
      b.setMatrixAt(A * 2 + 1, G), b.setColorAt(A * 2 + 1, Z);
    }
  }
  w.userData.type = "bond", w.userData.uuid = o.uuid, w.userData.objectMode = "edit", b && (b.userData.type = "bond", b.userData.uuid = o.uuid, b.userData.objectMode = "edit");
  const C = performance.now();
  return l.debug("drawStick Time: ", C - f), a ? { bondMesh: w, bondCap: b } : w;
}
function drawLine(o, e, t, s, i = "dashed", n = null) {
  if (t === void 0 || t.length === 0)
    return null;
  const r = [], a = [];
  t.forEach((d) => {
    const u = e[d], [p, m, g, y] = u;
    var f = o.positions[p].map((M, E) => M + calculateCartesianCoordinates(o.cell, g)[E]);
    f = new THREE.Vector3(...f);
    var w = o.positions[m].map((M, E) => M + calculateCartesianCoordinates(o.cell, y)[E]);
    w = new THREE.Vector3(...w), r.push(f.x, f.y, f.z), r.push(w.x, w.y, w.z);
    const b = o.symbols[p] + "-" + o.symbols[m], x = s[b].color1, S = s[b].color2;
    a.push(x.r, x.g, x.b), a.push(S.r, S.g, S.b);
  });
  const l = new THREE.BufferGeometry();
  l.setAttribute("position", new THREE.Float32BufferAttribute(r, 3)), l.setAttribute("color", new THREE.Float32BufferAttribute(a, 3));
  let c;
  i === "dashed" ? c = new THREE.LineDashedMaterial({
    color: 16777215,
    // Set a default color if needed, but we'll use vertex colors
    vertexColors: !0,
    // Use the colors provided by the geometry
    dashSize: 0.1,
    // Length of each dash
    gapSize: 0.1,
    // Length of each gap
    linewidth: 3
    // Optional: adjust line thickness (supported in WebGL2 contexts)
  }) : c = new THREE.LineBasicMaterial({
    color: 16777215,
    // Set a default color if needed, but we'll use vertex colors
    vertexColors: !0,
    // Use the colors provided by the geometry
    linewidth: 3
    // Optional: adjust line thickness (supported in WebGL2 contexts)
  });
  const h = new THREE.LineSegments(l, c);
  return h.computeLineDistances(), h.userData.type = "bond", h.userData.uuid = o.uuid, h.userData.objectMode = "edit", h;
}
function calculateScale(o, e, t, s = null, i = !0) {
  const n = o.distanceTo(e);
  return i && s !== null && n > s && (t = 0), new THREE.Vector3(t, n / 2, t);
}
function searchBondedAtoms(o, e, t, s) {
  let i = [], n = [];
  return e.forEach((r) => {
    const a = r[0];
    if (s[a] === 0 || !elementsWithPolyhedra.includes(o[a]))
      return;
    const l = r[1], c = t.map[a];
    c !== void 0 && c.forEach((h) => {
      const d = h[0], u = h[1];
      if (s[d] === 0)
        return;
      const p = [l[0] + u[0], l[1] + u[1], l[2] + u[2]];
      if (p[0] != 0 || p[1] != 0 || p[2] != 0) {
        const m = [d, p];
        i.push(m), n.push([a, d, l, p]), n.push([d, a, p, l]);
      }
    });
  }), { atoms: i, bonds: n };
}
function buildBonds(o, e, t, s, i, n = !1, r = console) {
  const a = performance.now(), l = [];
  if (o.isUndefinedCell())
    for (let h = 0; h < e.length; h++) {
      const d = e[h][0], u = e[h][1], p = t[d];
      if (!(i[d] === 0 | p === void 0))
        for (let m = 0; m < p.length; m++) {
          const g = p[m][0];
          if (i[g] === 0)
            continue;
          const y = p[m][1], f = u.map((w, b) => w + y[b]);
          l.push([d, g, u, f]);
        }
    }
  else {
    const h = o.calculateFractionalCoordinates();
    for (let d = 0; d < e.length; d++) {
      const u = e[d][0], p = e[d][1], m = t[u];
      if (!(i[u] === 0 | m === void 0))
        for (let g = 0; g < m.length; g++) {
          const y = m[g][0];
          if (i[y] === 0)
            continue;
          const f = m[g][1], w = p.map((x, S) => x + f[S]), b = h[y].map((x, S) => x + w[S]);
          if (n) {
            l.push([u, y, p, w]);
            continue;
          } else s[0][0] <= b[0] && b[0] <= s[0][1] && s[1][0] <= b[1] && b[1] <= s[1][1] && s[2][0] <= b[2] && b[2] <= s[2][1] && l.push([u, y, p, w]);
        }
    }
  }
  const c = performance.now();
  return r.debug("buildBonds Time: ", c - a), l;
}
function buildBondMap(o, e, t, s) {
  const i = {}, n = {}, r = [], a = [], l = [], c = [], h = [];
  for (let d = 0; d < o.length; d++) {
    const u = o[d], [p, m] = u;
    i[p] || (i[p] = { atomIndex: p, sticks: [], stickCaps: [], dashedLines: [], solidLines: [], springs: [] }), i[m] || (i[m] = { atomIndex: m, sticks: [], stickCaps: [], dashedLines: [], solidLines: [], springs: [] });
    const g = p + "-" + u[2].join("-");
    n[g] || (n[g] = { atomIndex: p, offset: u[2], sticks: [], stickCaps: [], dashedLines: [], solidLines: [], springs: [] });
    const y = m + "-" + u[3].join("-");
    n[y] || (n[y] = { atomIndex: m, offset: u[3], sticks: [], stickCaps: [], dashedLines: [], solidLines: [], springs: [] });
    const f = e.symbols[p] + "-" + e.symbols[m];
    let w;
    s[p] <= 2 ? w = t[f].type : w = s[p], w === 0 ? (r.push(d), i[p].sticks.push([r.length - 1, !0]), i[m].sticks.push([r.length - 1, !1]), n[g].sticks.push([r.length - 1, !0]), n[y].sticks.push([r.length - 1, !1])) : w === 1 ? (l.push(d), i[p].dashedLines.push([l.length - 1, !0]), i[m].dashedLines.push([l.length - 1, !1]), n[g].dashedLines.push([l.length - 1, !0]), n[y].dashedLines.push([l.length - 1, !1])) : w === 2 ? (h.push(d), i[p].springs.push([h.length - 1, !0]), i[m].springs.push([h.length - 1, !1]), n[g].springs.push([h.length - 1, !0]), n[y].springs.push([h.length - 1, !1])) : w === 3 ? (a.push(d), i[p].stickCaps.push([a.length - 1, !0]), i[m].stickCaps.push([a.length - 1, !1]), n[g].stickCaps.push([a.length - 1, !0]), n[y].stickCaps.push([a.length - 1, !1])) : w === 4 && (c.push(d), i[p].solidLines.push([c.length - 1, !0]), i[m].solidLines.push([c.length - 1, !1]), n[g].solidLines.push([c.length - 1, !0]), n[y].solidLines.push([c.length - 1, !1]));
  }
  return { bondMap: i, bondMapWithOffset: n, sticks: r, stickCaps: a, dashedLines: l, solidLines: c, springs: h };
}
function findNeighbors(o, e, t = !1, s = !0, i = console) {
  const n = performance.now();
  let r = o.positions.map((y, f) => [f, [0, 0, 0]]), a;
  const l = Math.max(...Object.values(e).map((y) => y.max));
  if (s) {
    const y = o.getCellLengthsAndAngles(), f = [
      [-l / y[0], 1 + l / y[0]],
      [-l / y[1], 1 + l / y[1]],
      [-l / y[2], 1 + l / y[2]]
    ];
    a = searchBoundary(o, f);
  }
  r = r.concat(a);
  const c = [], h = {};
  var d = function(y, f) {
    return Math.pow(y.x - f.x, 2) + Math.pow(y.y - f.y, 2) + Math.pow(y.z - f.z, 2);
  };
  const u = r.map((y) => {
    const f = o.positions[y[0]], w = calculateCartesianCoordinates(o.cell, y[1]);
    return [f[0] + w[0], f[1] + w[1], f[2] + w[2]];
  }), p = u.map((y, f) => ({
    x: y[0],
    y: y[1],
    z: y[2],
    index: f
  })), m = new kdTree(p, d, ["x", "y", "z"]);
  r.forEach(([y, f], w) => {
    const b = o.symbols[y], x = u[w], S = { x: u[w][0], y: u[w][1], z: u[w][2] };
    m.nearest(S, 24, l ** 2).forEach((E) => {
      const v = E[0].index;
      if (w == v) return;
      const C = r[v][1];
      if (f.some((R) => R !== 0) && C.some((R) => R !== 0))
        return;
      const A = r[v][0];
      if (!t && y == A) return;
      const _ = b + "-" + o.symbols[A];
      if (!e[_]) return;
      const L = u[v], j = calculateDistance(x, L);
      if (j < e[_].max && j > e[_].min) {
        const R = C.map((P, F) => P - f[F]);
        c.push([y, A, R]), h[y] ? h[y].some(([P, F]) => P === A && F.every(($, z) => $ === R[z])) || h[y].push([A, R]) : h[y] = [[A, R]];
      }
    });
  });
  const g = performance.now();
  return i.info(`findNeighbors completed in ${(g - n).toFixed(2)} ms`), { list: c, map: h };
}
function calculateDistance(o, e) {
  return Math.sqrt(Math.pow(o[0] - e[0], 2) + Math.pow(o[1] - e[1], 2) + Math.pow(o[2] - e[2], 2));
}
const Visible = 0, Deleted = 1, _v1 = new Vector3(), _line3 = new Line3(), _plane = new Plane(), _closestPoint = new Vector3(), _triangle = new Triangle();
class ConvexHull {
  constructor() {
    this.tolerance = -1, this.faces = [], this.newFaces = [], this.assigned = new VertexList(), this.unassigned = new VertexList(), this.vertices = [];
  }
  setFromPoints(e) {
    if (e.length >= 4) {
      this.makeEmpty();
      for (let t = 0, s = e.length; t < s; t++)
        this.vertices.push(new VertexNode(e[t]));
      this.compute();
    }
    return this;
  }
  setFromObject(e) {
    const t = [];
    return e.updateMatrixWorld(!0), e.traverse(function(s) {
      const i = s.geometry;
      if (i !== void 0) {
        const n = i.attributes.position;
        if (n !== void 0)
          for (let r = 0, a = n.count; r < a; r++) {
            const l = new Vector3();
            l.fromBufferAttribute(n, r).applyMatrix4(s.matrixWorld), t.push(l);
          }
      }
    }), this.setFromPoints(t);
  }
  containsPoint(e) {
    const t = this.faces;
    for (let s = 0, i = t.length; s < i; s++)
      if (t[s].distanceToPoint(e) > this.tolerance) return !1;
    return !0;
  }
  intersectRay(e, t) {
    const s = this.faces;
    let i = -1 / 0, n = 1 / 0;
    for (let r = 0, a = s.length; r < a; r++) {
      const l = s[r], c = l.distanceToPoint(e.origin), h = l.normal.dot(e.direction);
      if (c > 0 && h >= 0) return null;
      const d = h !== 0 ? -c / h : 0;
      if (!(d <= 0) && (h > 0 ? n = Math.min(d, n) : i = Math.max(d, i), i > n))
        return null;
    }
    return i !== -1 / 0 ? e.at(i, t) : e.at(n, t), t;
  }
  intersectsRay(e) {
    return this.intersectRay(e, _v1) !== null;
  }
  makeEmpty() {
    return this.faces = [], this.vertices = [], this;
  }
  // Adds a vertex to the 'assigned' list of vertices and assigns it to the given face
  addVertexToFace(e, t) {
    return e.face = t, t.outside === null ? this.assigned.append(e) : this.assigned.insertBefore(t.outside, e), t.outside = e, this;
  }
  // Removes a vertex from the 'assigned' list of vertices and from the given face
  removeVertexFromFace(e, t) {
    return e === t.outside && (e.next !== null && e.next.face === t ? t.outside = e.next : t.outside = null), this.assigned.remove(e), this;
  }
  // Removes all the visible vertices that a given face is able to see which are stored in the 'assigned' vertex list
  removeAllVerticesFromFace(e) {
    if (e.outside !== null) {
      const t = e.outside;
      let s = e.outside;
      for (; s.next !== null && s.next.face === e; )
        s = s.next;
      return this.assigned.removeSubList(t, s), t.prev = s.next = null, e.outside = null, t;
    }
  }
  // Removes all the visible vertices that 'face' is able to see
  deleteFaceVertices(e, t) {
    const s = this.removeAllVerticesFromFace(e);
    if (s !== void 0)
      if (t === void 0)
        this.unassigned.appendChain(s);
      else {
        let i = s;
        do {
          const n = i.next;
          t.distanceToPoint(i.point) > this.tolerance ? this.addVertexToFace(i, t) : this.unassigned.append(i), i = n;
        } while (i !== null);
      }
    return this;
  }
  // Reassigns as many vertices as possible from the unassigned list to the new faces
  resolveUnassignedPoints(e) {
    if (this.unassigned.isEmpty() === !1) {
      let t = this.unassigned.first();
      do {
        const s = t.next;
        let i = this.tolerance, n = null;
        for (let r = 0; r < e.length; r++) {
          const a = e[r];
          if (a.mark === Visible) {
            const l = a.distanceToPoint(t.point);
            if (l > i && (i = l, n = a), i > 1e3 * this.tolerance) break;
          }
        }
        n !== null && this.addVertexToFace(t, n), t = s;
      } while (t !== null);
    }
    return this;
  }
  // Computes the extremes of a simplex which will be the initial hull
  computeExtremes() {
    const e = new Vector3(), t = new Vector3(), s = [], i = [];
    for (let n = 0; n < 3; n++)
      s[n] = i[n] = this.vertices[0];
    e.copy(this.vertices[0].point), t.copy(this.vertices[0].point);
    for (let n = 0, r = this.vertices.length; n < r; n++) {
      const a = this.vertices[n], l = a.point;
      for (let c = 0; c < 3; c++)
        l.getComponent(c) < e.getComponent(c) && (e.setComponent(c, l.getComponent(c)), s[c] = a);
      for (let c = 0; c < 3; c++)
        l.getComponent(c) > t.getComponent(c) && (t.setComponent(c, l.getComponent(c)), i[c] = a);
    }
    return this.tolerance = 3 * Number.EPSILON * (Math.max(Math.abs(e.x), Math.abs(t.x)) + Math.max(Math.abs(e.y), Math.abs(t.y)) + Math.max(Math.abs(e.z), Math.abs(t.z))), { min: s, max: i };
  }
  // Computes the initial simplex assigning to its faces all the points
  // that are candidates to form part of the hull
  computeInitialHull() {
    const e = this.vertices, t = this.computeExtremes(), s = t.min, i = t.max;
    let n = 0, r = 0;
    for (let u = 0; u < 3; u++) {
      const p = i[u].point.getComponent(u) - s[u].point.getComponent(u);
      p > n && (n = p, r = u);
    }
    const a = s[r], l = i[r];
    let c, h;
    n = 0, _line3.set(a.point, l.point);
    for (let u = 0, p = this.vertices.length; u < p; u++) {
      const m = e[u];
      if (m !== a && m !== l) {
        _line3.closestPointToPoint(m.point, !0, _closestPoint);
        const g = _closestPoint.distanceToSquared(m.point);
        g > n && (n = g, c = m);
      }
    }
    n = -1, _plane.setFromCoplanarPoints(a.point, l.point, c.point);
    for (let u = 0, p = this.vertices.length; u < p; u++) {
      const m = e[u];
      if (m !== a && m !== l && m !== c) {
        const g = Math.abs(_plane.distanceToPoint(m.point));
        g > n && (n = g, h = m);
      }
    }
    const d = [];
    if (_plane.distanceToPoint(h.point) < 0) {
      d.push(
        Face.create(a, l, c),
        Face.create(h, l, a),
        Face.create(h, c, l),
        Face.create(h, a, c)
      );
      for (let u = 0; u < 3; u++) {
        const p = (u + 1) % 3;
        d[u + 1].getEdge(2).setTwin(d[0].getEdge(p)), d[u + 1].getEdge(1).setTwin(d[p + 1].getEdge(0));
      }
    } else {
      d.push(
        Face.create(a, c, l),
        Face.create(h, a, l),
        Face.create(h, l, c),
        Face.create(h, c, a)
      );
      for (let u = 0; u < 3; u++) {
        const p = (u + 1) % 3;
        d[u + 1].getEdge(2).setTwin(d[0].getEdge((3 - u) % 3)), d[u + 1].getEdge(0).setTwin(d[p + 1].getEdge(1));
      }
    }
    for (let u = 0; u < 4; u++)
      this.faces.push(d[u]);
    for (let u = 0, p = e.length; u < p; u++) {
      const m = e[u];
      if (m !== a && m !== l && m !== c && m !== h) {
        n = this.tolerance;
        let g = null;
        for (let y = 0; y < 4; y++) {
          const f = this.faces[y].distanceToPoint(m.point);
          f > n && (n = f, g = this.faces[y]);
        }
        g !== null && this.addVertexToFace(m, g);
      }
    }
    return this;
  }
  // Removes inactive faces
  reindexFaces() {
    const e = [];
    for (let t = 0; t < this.faces.length; t++) {
      const s = this.faces[t];
      s.mark === Visible && e.push(s);
    }
    return this.faces = e, this;
  }
  // Finds the next vertex to create faces with the current hull
  nextVertexToAdd() {
    if (this.assigned.isEmpty() === !1) {
      let e, t = 0;
      const s = this.assigned.first().face;
      let i = s.outside;
      do {
        const n = s.distanceToPoint(i.point);
        n > t && (t = n, e = i), i = i.next;
      } while (i !== null && i.face === s);
      return e;
    }
  }
  // Computes a chain of half edges in CCW order called the 'horizon'.
  // For an edge to be part of the horizon it must join a face that can see
  // 'eyePoint' and a face that cannot see 'eyePoint'.
  computeHorizon(e, t, s, i) {
    this.deleteFaceVertices(s), s.mark = Deleted;
    let n;
    t === null ? n = t = s.getEdge(0) : n = t.next;
    do {
      const r = n.twin, a = r.face;
      a.mark === Visible && (a.distanceToPoint(e) > this.tolerance ? this.computeHorizon(e, r, a, i) : i.push(n)), n = n.next;
    } while (n !== t);
    return this;
  }
  // Creates a face with the vertices 'eyeVertex.point', 'horizonEdge.tail' and 'horizonEdge.head' in CCW order
  addAdjoiningFace(e, t) {
    const s = Face.create(e, t.tail(), t.head());
    return this.faces.push(s), s.getEdge(-1).setTwin(t.twin), s.getEdge(0);
  }
  //  Adds 'horizon.length' faces to the hull, each face will be linked with the
  //  horizon opposite face and the face on the left/right
  addNewFaces(e, t) {
    this.newFaces = [];
    let s = null, i = null;
    for (let n = 0; n < t.length; n++) {
      const r = t[n], a = this.addAdjoiningFace(e, r);
      s === null ? s = a : a.next.setTwin(i), this.newFaces.push(a.face), i = a;
    }
    return s.next.setTwin(i), this;
  }
  // Adds a vertex to the hull
  addVertexToHull(e) {
    const t = [];
    return this.unassigned.clear(), this.removeVertexFromFace(e, e.face), this.computeHorizon(e.point, null, e.face, t), this.addNewFaces(e, t), this.resolveUnassignedPoints(this.newFaces), this;
  }
  cleanup() {
    return this.assigned.clear(), this.unassigned.clear(), this.newFaces = [], this;
  }
  compute() {
    let e;
    for (this.computeInitialHull(); (e = this.nextVertexToAdd()) !== void 0; )
      this.addVertexToHull(e);
    return this.reindexFaces(), this.cleanup(), this;
  }
}
class Face {
  constructor() {
    this.normal = new Vector3(), this.midpoint = new Vector3(), this.area = 0, this.constant = 0, this.outside = null, this.mark = Visible, this.edge = null;
  }
  static create(e, t, s) {
    const i = new Face(), n = new HalfEdge(e, i), r = new HalfEdge(t, i), a = new HalfEdge(s, i);
    return n.next = a.prev = r, r.next = n.prev = a, a.next = r.prev = n, i.edge = n, i.compute();
  }
  getEdge(e) {
    let t = this.edge;
    for (; e > 0; )
      t = t.next, e--;
    for (; e < 0; )
      t = t.prev, e++;
    return t;
  }
  compute() {
    const e = this.edge.tail(), t = this.edge.head(), s = this.edge.next.head();
    return _triangle.set(e.point, t.point, s.point), _triangle.getNormal(this.normal), _triangle.getMidpoint(this.midpoint), this.area = _triangle.getArea(), this.constant = this.normal.dot(this.midpoint), this;
  }
  distanceToPoint(e) {
    return this.normal.dot(e) - this.constant;
  }
}
class HalfEdge {
  constructor(e, t) {
    this.vertex = e, this.prev = null, this.next = null, this.twin = null, this.face = t;
  }
  head() {
    return this.vertex;
  }
  tail() {
    return this.prev ? this.prev.vertex : null;
  }
  length() {
    const e = this.head(), t = this.tail();
    return t !== null ? t.point.distanceTo(e.point) : -1;
  }
  lengthSquared() {
    const e = this.head(), t = this.tail();
    return t !== null ? t.point.distanceToSquared(e.point) : -1;
  }
  setTwin(e) {
    return this.twin = e, e.twin = this, this;
  }
}
class VertexNode {
  constructor(e) {
    this.point = e, this.prev = null, this.next = null, this.face = null;
  }
}
class VertexList {
  constructor() {
    this.head = null, this.tail = null;
  }
  first() {
    return this.head;
  }
  last() {
    return this.tail;
  }
  clear() {
    return this.head = this.tail = null, this;
  }
  // Inserts a vertex before the target vertex
  insertBefore(e, t) {
    return t.prev = e.prev, t.next = e, t.prev === null ? this.head = t : t.prev.next = t, e.prev = t, this;
  }
  // Inserts a vertex after the target vertex
  insertAfter(e, t) {
    return t.prev = e, t.next = e.next, t.next === null ? this.tail = t : t.next.prev = t, e.next = t, this;
  }
  // Appends a vertex to the end of the linked list
  append(e) {
    return this.head === null ? this.head = e : this.tail.next = e, e.prev = this.tail, e.next = null, this.tail = e, this;
  }
  // Appends a chain of vertices where 'vertex' is the head.
  appendChain(e) {
    for (this.head === null ? this.head = e : this.tail.next = e, e.prev = this.tail; e.next !== null; )
      e = e.next;
    return this.tail = e, this;
  }
  // Removes a vertex from the linked list
  remove(e) {
    return e.prev === null ? this.head = e.next : e.prev.next = e.next, e.next === null ? this.tail = e.prev : e.next.prev = e.prev, this;
  }
  // Removes a list of vertices whose 'head' is 'a' and whose 'tail' is b
  removeSubList(e, t) {
    return e.prev === null ? this.head = t.next : e.prev.next = t.next, t.next === null ? this.tail = e.prev : t.next.prev = e.prev, this;
  }
  isEmpty() {
    return this.head === null;
  }
}
const defaultColor = 16777215;
let Setting$5 = class {
  constructor({ symbol: e, color: t = "#3d82ed", show_edge: s = !1 }) {
    this.symbol = e, this.color = convertColor$1(t), this.show_edge = s;
  }
  toDict() {
    return {
      symbol: this.symbol,
      color: this.color,
      show_edge: this.show_edge
    };
  }
};
class PolyhedraManager {
  constructor(e) {
    this.viewer = e, this.scene = this.viewer.tjs.scene, this.settings = [], this.mesh = null, this.allVertices = [], this.allNormals = [], this.allColors = [], this.init(), this.materialsRegistry = this.viewer.weas.materialsRegistry;
    const t = this.viewer.state.get("plugins.polyhedra");
    t && Array.isArray(t.settings) && t.settings.length > 0 && this.applySettings(t.settings), this.viewer.state.subscribe("plugins.polyhedra", (s) => {
      if (!s || this.viewer._initializingState)
        return;
      const i = Array.isArray(s.settings) ? s.settings : [];
      this.applySettings(i), this.refreshMesh();
    });
  }
  init() {
    this.viewer.logger.debug("init PolyhedraManager"), this.settings = [], this.viewer.atoms, Object.entries(this.viewer.originalAtoms.species).forEach(([e, t]) => {
      if (!elementsWithPolyhedra.includes(t.element))
        return;
      const s = elementColors[this.viewer.colorType][t.element], i = new Setting$5({ symbol: e, color: s });
      this.settings.push(i);
    });
  }
  setSettings(e) {
    this.viewer.state.set({ plugins: { polyhedra: { settings: cloneValue(e) } } });
  }
  applySettings(e) {
    this.settings = [], this.clearMeshes(), e.forEach((t) => {
      this.addSetting(t);
    });
  }
  toPlainSettings() {
    return this.settings.map((e) => e && typeof e.toDict == "function" ? e.toDict() : e);
  }
  // Modify addSetting to accept a single object parameter
  addSetting({ symbol: e, color: t = "#3d82ed", show_edge: s = !1 }) {
    const i = new Setting$5({ symbol: e, color: t, show_edge: s });
    this.settings.push(i);
  }
  buildPolyhedraDict() {
    const e = {};
    return this.settings.forEach((t) => {
      e[t.symbol] = t.toDict();
    }), e;
  }
  clearMeshes() {
    this.allVertices = [], this.allNormals = [], this.allColors = [], this.mesh && this.mesh.parent && this.mesh.parent.remove(this.mesh), clearObject(this.scene, this.mesh), this.mesh = null;
  }
  drawPolyhedras() {
    this.clearMeshes();
    const e = filterBondMap(this.viewer.bondManager.bondMap.bondMapWithOffset, this.viewer.atoms.symbols, elementsWithPolyhedra, this.viewer.modelPolyhedras);
    this.viewer.logger.debug("polyhedras: ", e), this.buildPolyhedras(this.viewer.atoms, e, this.viewer.bondManager.bondList, this.viewer._colorType, this.viewer._materialType);
    const t = this.drawPolyhedraMesh(this.viewer.atoms, this.viewer._materialType);
    return this.mesh = t, t;
  }
  refreshMesh() {
    const e = this.viewer.atomManager.meshes.atom;
    if (!e)
      return;
    const t = this.drawPolyhedras();
    t && (e.add(t), this.viewer.requestRedraw?.("render"));
  }
  buildPolyhedras(e, t, s, i = "CPK", n = "standard") {
    const r = [], a = [], l = [], c = {};
    for (const u of Object.keys(t)) {
      const p = t[u], m = [];
      let g;
      for (const y of p.sticks) {
        const f = s[y[0]];
        if (y[1])
          var h = f[1], d = f[3];
        else
          var h = f[0], d = f[2];
        g = e.positions[h].map((b, x) => b + calculateCartesianCoordinates(e.cell, d)[x]);
        const w = new THREE.Vector3(...g);
        w.atomIndex = h, w.offset = d, m.push(w);
      }
      if (m.length < 4) {
        console.warn(`Skipping polyhedron with key "${u}" due to insufficient vertices.`);
        continue;
      }
      try {
        const { hull: y, vertices: f, normals: w, indices: b, offsets: x } = calculateConvexHull(m);
        r.push(...f), a.push(...w);
        const S = e.symbols[p.atomIndex], M = elementColors[i][S] || defaultColor, E = new THREE.Color(M);
        for (let v = 0; v < f.length / 3; v++)
          l.push(E.r, E.g, E.b);
        b.forEach((v, C) => {
          const A = b[C], _ = x[C];
          c[A] === void 0 && (c[A] = []), c[A].push([r.length / 3 - f.length / 3 + C, _]);
        });
      } catch (y) {
        console.warn(`Skipping polyhedron with key "${u}" due to ConvexGeometry error:`, y);
        continue;
      }
    }
    this.allVertices = r, this.allNormals = a, this.allColors = l, this.vertexAtomMap = c;
  }
  drawPolyhedraMesh(e, t = "standard") {
    const s = this.materialsRegistry.getMaterial(t, !0);
    s.transparent = !0, s.opacity = 0.5, s.vertexColors = !0, s.side = THREE.DoubleSide, s.depthWrite = !1, s.depthTest = !0;
    const i = new THREE.BufferGeometry();
    i.setAttribute("position", new THREE.Float32BufferAttribute(this.allVertices, 3)), i.setAttribute("normal", new THREE.Float32BufferAttribute(this.allNormals, 3)), i.setAttribute("color", new THREE.Float32BufferAttribute(this.allColors, 3));
    const n = new THREE.Mesh(i, s);
    return n.userData.type = "polyhedra", n.userData.uuid = e.uuid, n.userData.objectMode = "edit", n.userData.notSelectable = !0, n.layers.set(1), n.renderOrder = 400, n;
  }
  updatePolyhedraMesh(e = null, t = null) {
    var s = [];
    e === null ? s = Object.keys(this.vertexAtomMap) : s = [e], t === null && (t = this.viewer.atoms), s.forEach((i) => {
      const n = this.vertexAtomMap[i];
      n !== void 0 && n.forEach(([r, a]) => {
        const l = t.positions[i].map((c, h) => c + calculateCartesianCoordinates(t.cell, a)[h]);
        this.allVertices[r * 3] = l[0], this.allVertices[r * 3 + 1] = l[1], this.allVertices[r * 3 + 2] = l[2];
      });
    }), this.mesh.geometry.setAttribute("position", new THREE.Float32BufferAttribute(this.allVertices, 3)), this.mesh.geometry.attributes.position.needsUpdate = !0, this.mesh.geometry.computeVertexNormals();
  }
}
function filterBondMap(o, e, t, s) {
  const i = {};
  return Object.keys(o).forEach((n) => {
    const r = o[n].atomIndex, a = o[n].sticks.length, l = e[r];
    s[r] && a >= 4 && t.includes(l) && (i[n] = o[n]);
  }), i;
}
function calculateConvexHull(o) {
  for (var r = [], e = [], t = [], s = [], i = [], n = new ConvexHull().setFromPoints(o), r = n.faces, a = 0; a < r.length; a++) {
    var l = r[a], c = l.edge;
    do {
      var h = c.head().point;
      e.push(h.x, h.y, h.z), s.push(h.atomIndex), i.push(h.offset), t.push(l.normal.x, l.normal.y, l.normal.z), c = c.next;
    } while (c !== l.edge);
  }
  return { hull: n, vertices: e, normals: t, indices: s, offsets: i };
}
let Setting$4 = class {
  constructor({ origins: e = [], texts: t = [], selection: s = null, color: i = "#000000ff", fontSize: n = 0.05, className: r = "atom-label", renderMode: a = "glyph", shift: l = !1 }) {
    this.origins = e, this.texts = t, this.selection = s, this.color = i, this.fontSize = n, this.className = r, this.renderMode = a, this.shift = l;
  }
};
class AtomLabelManager {
  constructor(e) {
    this.viewer = e, this.scene = this.viewer.tjs.scene, this.settings = [], this.overlaySettings = [], this.labels = [];
    const t = this.viewer.state.get("plugins.atomLabel");
    t && Array.isArray(t.settings) && (this.applySettings(t.settings, t.overlaySettings), this.drawAtomLabels()), this.viewer.state.subscribe("plugins.atomLabel", (s) => {
      if (!s)
        return;
      const i = Array.isArray(s.settings) ? s.settings : [], n = Array.isArray(s.overlaySettings) ? s.overlaySettings : [];
      this.applySettings(i, n), !this.viewer._initializingState && this.drawAtomLabels();
    });
  }
  setSettings(e) {
    const t = this.viewer.state.get("plugins.atomLabel")?.overlaySettings || [];
    this.viewer.state.set({ plugins: { atomLabel: { settings: cloneValue(e), overlaySettings: cloneValue(t) } } });
  }
  setOverlaySettings(e) {
    const t = this.viewer.state.get("plugins.atomLabel")?.settings || [];
    this.viewer.state.set({ plugins: { atomLabel: { settings: cloneValue(t), overlaySettings: cloneValue(e) } } });
  }
  applySettings(e, t = []) {
    this.settings = [], this.overlaySettings = [], clearLabels(this.scene, this.labels), e.forEach((s) => {
      this.addSetting(s);
    }), t.forEach((s) => {
      this.addOverlaySetting(s);
    });
  }
  // Modify addSetting to accept a single object parameter
  addSetting({ origins: e, texts: t, selection: s = null, color: i = "#000000ff", fontSize: n = 0.05, className: r = "atom-label", renderMode: a = "glyph", shift: l = [0, 0, 0] }) {
    if (typeof e == "string" && !this.viewer.atoms.getAttribute(e))
      throw new Error(`Attribute '${e}' is not defined. The available attributes are: ${Object.keys(this.viewer.atoms.attributes.atom)}`);
    const c = new Setting$4({ origins: e, texts: t, selection: s, color: i, fontSize: n, className: r, renderMode: a, shift: l });
    this.settings.push(c);
  }
  addOverlaySetting({ origins: e, texts: t, selection: s = null, color: i = "#000000ff", fontSize: n = 0.05, className: r = "atom-label", shift: a = [0, 0, 0] }) {
    const l = new Setting$4({ origins: e, texts: t, selection: s, color: i, fontSize: n, className: r, shift: a });
    this.overlaySettings.push(l);
  }
  clearLabels() {
    clearLabels(this.scene, this.labels);
  }
  drawAtomLabels() {
    this.clearLabels(), this.labels = [], [...this.settings, ...this.overlaySettings].forEach((e) => {
      if (e.origins.length > 1e3) {
        console.warn("Too many labels, skipping...");
        return;
      }
      let t, s;
      const i = e.selection || [...Array(this.viewer.atoms.getAtomsCount()).keys()];
      typeof e.origins == "string" ? (t = this.viewer.atoms.getAttribute(e.origins), t = i.map((l) => t[l])) : t = e.origins, typeof e.texts == "string" ? (s = this.viewer.atoms.getAttribute(e.texts), s = i.map((l) => s[l])) : s = e.texts;
      const n = typeof e.origins == "string" ? i : null, r = this.viewer.weas?.textManager?.createTextLabel?.bind(this.viewer.weas.textManager);
      if (!r)
        throw new Error("TextManager is not available for atom label rendering.");
      const a = drawAtomLabels(t, s, e.fontSize, e.color, n, r, e.className, e.renderMode);
      for (let l = 0; l < a.length; l++)
        this.scene.add(a[l]);
      this.labels.push(...a);
    }), this.updateLabelSizes(), this.viewer.requestRedraw?.("render");
  }
  updateLabel(e = null, t = null) {
  }
  updateLabelPositions(e = null) {
    const t = e || this.viewer.atoms;
    if (!(!t || !this.labels || this.labels.length === 0))
      for (let s = 0; s < this.labels.length; s++) {
        const i = this.labels[s], n = i.userData?.atomIndex;
        if (n == null)
          continue;
        const r = t.positions[n];
        r && i.position.set(r[0], r[1], r[2]);
      }
  }
  updateLabelSizes(e = null, t = null) {
    const s = e || this.viewer?.tjs?.camera, i = t || this.viewer?.tjs?.renderers?.MainRenderer?.renderer;
    if (!s || !this.labels || this.labels.length === 0)
      return;
    this.scene.updateMatrixWorld(!0);
    const n = new THREE.Vector3();
    this.labels.forEach((r) => {
      const a = r.element;
      if (!a)
        return;
      if (a.dataset?.cross === "true" && i) {
        const p = r.userData?.atomIndex, m = this.getAtomRadius(p);
        if (m) {
          const g = i.getSize(new THREE.Vector2()), y = new THREE.Vector3(), f = new THREE.Vector3(), w = new THREE.Vector3();
          s.matrixWorld.extractBasis(y, f, w);
          const b = this.viewer.atoms.positions[p];
          if (b) {
            const x = new THREE.Vector3(...b), S = x.clone().add(y.clone().multiplyScalar(m)), M = x.project(s), E = S.project(s), v = (E.x - M.x) * g.x * 0.5, C = (E.y - M.y) * g.y * 0.5, A = Math.sqrt(v * v + C * C), _ = Math.max(1, Math.round(A * 2));
            a.style.setProperty("--cross-size", `${_}px`), a.style.fontSize = `${_}px`;
            return;
          }
        }
      }
      let c = r.userData?.baseFontPx, h = r.userData?.baseDistance, d = r.userData?.baseZoom;
      if (!r.element || !c || !h) {
        if (r.getWorldPosition(n), h = s.position.distanceTo(n), !c) {
          const p = parseFloat(a.style.fontSize || window.getComputedStyle(a).fontSize || "14px");
          c = Number.isFinite(p) && p > 0 ? p : 14;
        }
        r.userData.baseFontPx = c, r.userData.baseDistance = h, r.userData.baseZoom = 1;
      }
      r.getWorldPosition(n);
      let u = c;
      if (s.isOrthographicCamera) {
        d = d || 1;
        const m = (s.zoom || 1) / d;
        u = Math.max(6, Math.min(96, c * m * 0.85));
      } else {
        const p = s.position.distanceTo(n);
        if (!p)
          return;
        const m = h / p;
        u = Math.max(6, Math.min(96, c * m * 0.85));
      }
      r.element.style.fontSize = `${u}px`;
    });
  }
  getAtomRadius(e) {
    if (e == null)
      return null;
    const t = this.viewer.atomManager?.meshes?.atom;
    if (!t || typeof t.getMatrixAt != "function")
      return null;
    const s = new THREE.Matrix4(), i = new THREE.Vector3(), n = new THREE.Quaternion(), r = new THREE.Vector3();
    return t.getMatrixAt(e, s), s.decompose(i, n, r), r.x || r.y || r.z || null;
  }
}
function clearLabels(o, e) {
  e.forEach((t) => {
    o.remove(t), t.remove();
  });
}
function drawAtomLabels(o, e, t, s, i = [], n, r = "atom-label", a = "glyph") {
  const l = [], c = normalizeFontSize(t), h = getBaseFontPx(c);
  for (let d = 0; d < o.length; d++) {
    const u = new THREE.Vector3(...o[d]), p = e[d], m = n(u, p, s, c, r, a), g = m && m.label ? m.label : m;
    g.userData.baseFontPx = h, g.userData.atomIndex = Array.isArray(i) ? i[d] : null, l.push(g);
  }
  return l;
}
function normalizeFontSize(o) {
  return typeof o == "number" ? o <= 1 ? "14px" : `${o}px` : typeof o == "string" && o.trim() !== "" ? o : "14px";
}
function getBaseFontPx(o) {
  const e = parseFloat(o);
  return Number.isFinite(e) && e >= 1 ? e : 14;
}
var edgeTable = new Uint32Array([
  0,
  265,
  515,
  778,
  1030,
  1295,
  1541,
  1804,
  2060,
  2309,
  2575,
  2822,
  3082,
  3331,
  3593,
  3840,
  400,
  153,
  915,
  666,
  1430,
  1183,
  1941,
  1692,
  2460,
  2197,
  2975,
  2710,
  3482,
  3219,
  3993,
  3728,
  560,
  825,
  51,
  314,
  1590,
  1855,
  1077,
  1340,
  2620,
  2869,
  2111,
  2358,
  3642,
  3891,
  3129,
  3376,
  928,
  681,
  419,
  170,
  1958,
  1711,
  1445,
  1196,
  2988,
  2725,
  2479,
  2214,
  4010,
  3747,
  3497,
  3232,
  1120,
  1385,
  1635,
  1898,
  102,
  367,
  613,
  876,
  3180,
  3429,
  3695,
  3942,
  2154,
  2403,
  2665,
  2912,
  1520,
  1273,
  2035,
  1786,
  502,
  255,
  1013,
  764,
  3580,
  3317,
  4095,
  3830,
  2554,
  2291,
  3065,
  2800,
  1616,
  1881,
  1107,
  1370,
  598,
  863,
  85,
  348,
  3676,
  3925,
  3167,
  3414,
  2650,
  2899,
  2137,
  2384,
  1984,
  1737,
  1475,
  1226,
  966,
  719,
  453,
  204,
  4044,
  3781,
  3535,
  3270,
  3018,
  2755,
  2505,
  2240,
  2240,
  2505,
  2755,
  3018,
  3270,
  3535,
  3781,
  4044,
  204,
  453,
  719,
  966,
  1226,
  1475,
  1737,
  1984,
  2384,
  2137,
  2899,
  2650,
  3414,
  3167,
  3925,
  3676,
  348,
  85,
  863,
  598,
  1370,
  1107,
  1881,
  1616,
  2800,
  3065,
  2291,
  2554,
  3830,
  4095,
  3317,
  3580,
  764,
  1013,
  255,
  502,
  1786,
  2035,
  1273,
  1520,
  2912,
  2665,
  2403,
  2154,
  3942,
  3695,
  3429,
  3180,
  876,
  613,
  367,
  102,
  1898,
  1635,
  1385,
  1120,
  3232,
  3497,
  3747,
  4010,
  2214,
  2479,
  2725,
  2988,
  1196,
  1445,
  1711,
  1958,
  170,
  419,
  681,
  928,
  3376,
  3129,
  3891,
  3642,
  2358,
  2111,
  2869,
  2620,
  1340,
  1077,
  1855,
  1590,
  314,
  51,
  825,
  560,
  3728,
  3993,
  3219,
  3482,
  2710,
  2975,
  2197,
  2460,
  1692,
  1941,
  1183,
  1430,
  666,
  915,
  153,
  400,
  3840,
  3593,
  3331,
  3082,
  2822,
  2575,
  2309,
  2060,
  1804,
  1541,
  1295,
  1030,
  778,
  515,
  265,
  0
]);
const triTable = [
  [],
  [0, 8, 3],
  [0, 1, 9],
  [1, 8, 3, 9, 8, 1],
  [1, 2, 10],
  [0, 8, 3, 1, 2, 10],
  [9, 2, 10, 0, 2, 9],
  [2, 8, 3, 2, 10, 8, 10, 9, 8],
  [3, 11, 2],
  [0, 11, 2, 8, 11, 0],
  [1, 9, 0, 2, 3, 11],
  [1, 11, 2, 1, 9, 11, 9, 8, 11],
  [3, 10, 1, 11, 10, 3],
  [0, 10, 1, 0, 8, 10, 8, 11, 10],
  [3, 9, 0, 3, 11, 9, 11, 10, 9],
  [9, 8, 10, 10, 8, 11],
  [4, 7, 8],
  [4, 3, 0, 7, 3, 4],
  [0, 1, 9, 8, 4, 7],
  [4, 1, 9, 4, 7, 1, 7, 3, 1],
  [1, 2, 10, 8, 4, 7],
  [3, 4, 7, 3, 0, 4, 1, 2, 10],
  [9, 2, 10, 9, 0, 2, 8, 4, 7],
  [2, 10, 9, 2, 9, 7, 2, 7, 3, 7, 9, 4],
  [8, 4, 7, 3, 11, 2],
  [11, 4, 7, 11, 2, 4, 2, 0, 4],
  [9, 0, 1, 8, 4, 7, 2, 3, 11],
  [4, 7, 11, 9, 4, 11, 9, 11, 2, 9, 2, 1],
  [3, 10, 1, 3, 11, 10, 7, 8, 4],
  [1, 11, 10, 1, 4, 11, 1, 0, 4, 7, 11, 4],
  [4, 7, 8, 9, 0, 11, 9, 11, 10, 11, 0, 3],
  [4, 7, 11, 4, 11, 9, 9, 11, 10],
  [9, 5, 4],
  [9, 5, 4, 0, 8, 3],
  [0, 5, 4, 1, 5, 0],
  [8, 5, 4, 8, 3, 5, 3, 1, 5],
  [1, 2, 10, 9, 5, 4],
  [3, 0, 8, 1, 2, 10, 4, 9, 5],
  [5, 2, 10, 5, 4, 2, 4, 0, 2],
  [2, 10, 5, 3, 2, 5, 3, 5, 4, 3, 4, 8],
  [9, 5, 4, 2, 3, 11],
  [0, 11, 2, 0, 8, 11, 4, 9, 5],
  [0, 5, 4, 0, 1, 5, 2, 3, 11],
  [2, 1, 5, 2, 5, 8, 2, 8, 11, 4, 8, 5],
  [10, 3, 11, 10, 1, 3, 9, 5, 4],
  [4, 9, 5, 0, 8, 1, 8, 10, 1, 8, 11, 10],
  [5, 4, 0, 5, 0, 11, 5, 11, 10, 11, 0, 3],
  [5, 4, 8, 5, 8, 10, 10, 8, 11],
  [9, 7, 8, 5, 7, 9],
  [9, 3, 0, 9, 5, 3, 5, 7, 3],
  [0, 7, 8, 0, 1, 7, 1, 5, 7],
  [1, 5, 3, 3, 5, 7],
  [9, 7, 8, 9, 5, 7, 10, 1, 2],
  [10, 1, 2, 9, 5, 0, 5, 3, 0, 5, 7, 3],
  [8, 0, 2, 8, 2, 5, 8, 5, 7, 10, 5, 2],
  [2, 10, 5, 2, 5, 3, 3, 5, 7],
  [7, 9, 5, 7, 8, 9, 3, 11, 2],
  [9, 5, 7, 9, 7, 2, 9, 2, 0, 2, 7, 11],
  [2, 3, 11, 0, 1, 8, 1, 7, 8, 1, 5, 7],
  [11, 2, 1, 11, 1, 7, 7, 1, 5],
  [9, 5, 8, 8, 5, 7, 10, 1, 3, 10, 3, 11],
  [5, 7, 0, 5, 0, 9, 7, 11, 0, 1, 0, 10, 11, 10, 0],
  [11, 10, 0, 11, 0, 3, 10, 5, 0, 8, 0, 7, 5, 7, 0],
  [11, 10, 5, 7, 11, 5],
  [10, 6, 5],
  [0, 8, 3, 5, 10, 6],
  [9, 0, 1, 5, 10, 6],
  [1, 8, 3, 1, 9, 8, 5, 10, 6],
  [1, 6, 5, 2, 6, 1],
  [1, 6, 5, 1, 2, 6, 3, 0, 8],
  [9, 6, 5, 9, 0, 6, 0, 2, 6],
  [5, 9, 8, 5, 8, 2, 5, 2, 6, 3, 2, 8],
  [2, 3, 11, 10, 6, 5],
  [11, 0, 8, 11, 2, 0, 10, 6, 5],
  [0, 1, 9, 2, 3, 11, 5, 10, 6],
  [5, 10, 6, 1, 9, 2, 9, 11, 2, 9, 8, 11],
  [6, 3, 11, 6, 5, 3, 5, 1, 3],
  [0, 8, 11, 0, 11, 5, 0, 5, 1, 5, 11, 6],
  [3, 11, 6, 0, 3, 6, 0, 6, 5, 0, 5, 9],
  [6, 5, 9, 6, 9, 11, 11, 9, 8],
  [5, 10, 6, 4, 7, 8],
  [4, 3, 0, 4, 7, 3, 6, 5, 10],
  [1, 9, 0, 5, 10, 6, 8, 4, 7],
  [10, 6, 5, 1, 9, 7, 1, 7, 3, 7, 9, 4],
  [6, 1, 2, 6, 5, 1, 4, 7, 8],
  [1, 2, 5, 5, 2, 6, 3, 0, 4, 3, 4, 7],
  [8, 4, 7, 9, 0, 5, 0, 6, 5, 0, 2, 6],
  [7, 3, 9, 7, 9, 4, 3, 2, 9, 5, 9, 6, 2, 6, 9],
  [3, 11, 2, 7, 8, 4, 10, 6, 5],
  [5, 10, 6, 4, 7, 2, 4, 2, 0, 2, 7, 11],
  [0, 1, 9, 4, 7, 8, 2, 3, 11, 5, 10, 6],
  [9, 2, 1, 9, 11, 2, 9, 4, 11, 7, 11, 4, 5, 10, 6],
  [8, 4, 7, 3, 11, 5, 3, 5, 1, 5, 11, 6],
  [5, 1, 11, 5, 11, 6, 1, 0, 11, 7, 11, 4, 0, 4, 11],
  [0, 5, 9, 0, 6, 5, 0, 3, 6, 11, 6, 3, 8, 4, 7],
  [6, 5, 9, 6, 9, 11, 4, 7, 9, 7, 11, 9],
  [10, 4, 9, 6, 4, 10],
  [4, 10, 6, 4, 9, 10, 0, 8, 3],
  [10, 0, 1, 10, 6, 0, 6, 4, 0],
  [8, 3, 1, 8, 1, 6, 8, 6, 4, 6, 1, 10],
  [1, 4, 9, 1, 2, 4, 2, 6, 4],
  [3, 0, 8, 1, 2, 9, 2, 4, 9, 2, 6, 4],
  [0, 2, 4, 4, 2, 6],
  [8, 3, 2, 8, 2, 4, 4, 2, 6],
  [10, 4, 9, 10, 6, 4, 11, 2, 3],
  [0, 8, 2, 2, 8, 11, 4, 9, 10, 4, 10, 6],
  [3, 11, 2, 0, 1, 6, 0, 6, 4, 6, 1, 10],
  [6, 4, 1, 6, 1, 10, 4, 8, 1, 2, 1, 11, 8, 11, 1],
  [9, 6, 4, 9, 3, 6, 9, 1, 3, 11, 6, 3],
  [8, 11, 1, 8, 1, 0, 11, 6, 1, 9, 1, 4, 6, 4, 1],
  [3, 11, 6, 3, 6, 0, 0, 6, 4],
  [6, 4, 8, 11, 6, 8],
  [7, 10, 6, 7, 8, 10, 8, 9, 10],
  [0, 7, 3, 0, 10, 7, 0, 9, 10, 6, 7, 10],
  [10, 6, 7, 1, 10, 7, 1, 7, 8, 1, 8, 0],
  [10, 6, 7, 10, 7, 1, 1, 7, 3],
  [1, 2, 6, 1, 6, 8, 1, 8, 9, 8, 6, 7],
  [2, 6, 9, 2, 9, 1, 6, 7, 9, 0, 9, 3, 7, 3, 9],
  [7, 8, 0, 7, 0, 6, 6, 0, 2],
  [7, 3, 2, 6, 7, 2],
  [2, 3, 11, 10, 6, 8, 10, 8, 9, 8, 6, 7],
  [2, 0, 7, 2, 7, 11, 0, 9, 7, 6, 7, 10, 9, 10, 7],
  [1, 8, 0, 1, 7, 8, 1, 10, 7, 6, 7, 10, 2, 3, 11],
  [11, 2, 1, 11, 1, 7, 10, 6, 1, 6, 7, 1],
  [8, 9, 6, 8, 6, 7, 9, 1, 6, 11, 6, 3, 1, 3, 6],
  [0, 9, 1, 11, 6, 7],
  [7, 8, 0, 7, 0, 6, 3, 11, 0, 11, 6, 0],
  [7, 11, 6],
  [7, 6, 11],
  [3, 0, 8, 11, 7, 6],
  [0, 1, 9, 11, 7, 6],
  [8, 1, 9, 8, 3, 1, 11, 7, 6],
  [10, 1, 2, 6, 11, 7],
  [1, 2, 10, 3, 0, 8, 6, 11, 7],
  [2, 9, 0, 2, 10, 9, 6, 11, 7],
  [6, 11, 7, 2, 10, 3, 10, 8, 3, 10, 9, 8],
  [7, 2, 3, 6, 2, 7],
  [7, 0, 8, 7, 6, 0, 6, 2, 0],
  [2, 7, 6, 2, 3, 7, 0, 1, 9],
  [1, 6, 2, 1, 8, 6, 1, 9, 8, 8, 7, 6],
  [10, 7, 6, 10, 1, 7, 1, 3, 7],
  [10, 7, 6, 1, 7, 10, 1, 8, 7, 1, 0, 8],
  [0, 3, 7, 0, 7, 10, 0, 10, 9, 6, 10, 7],
  [7, 6, 10, 7, 10, 8, 8, 10, 9],
  [6, 8, 4, 11, 8, 6],
  [3, 6, 11, 3, 0, 6, 0, 4, 6],
  [8, 6, 11, 8, 4, 6, 9, 0, 1],
  [9, 4, 6, 9, 6, 3, 9, 3, 1, 11, 3, 6],
  [6, 8, 4, 6, 11, 8, 2, 10, 1],
  [1, 2, 10, 3, 0, 11, 0, 6, 11, 0, 4, 6],
  [4, 11, 8, 4, 6, 11, 0, 2, 9, 2, 10, 9],
  [10, 9, 3, 10, 3, 2, 9, 4, 3, 11, 3, 6, 4, 6, 3],
  [8, 2, 3, 8, 4, 2, 4, 6, 2],
  [0, 4, 2, 4, 6, 2],
  [1, 9, 0, 2, 3, 4, 2, 4, 6, 4, 3, 8],
  [1, 9, 4, 1, 4, 2, 2, 4, 6],
  [8, 1, 3, 8, 6, 1, 8, 4, 6, 6, 10, 1],
  [10, 1, 0, 10, 0, 6, 6, 0, 4],
  [4, 6, 3, 4, 3, 8, 6, 10, 3, 0, 3, 9, 10, 9, 3],
  [10, 9, 4, 6, 10, 4],
  [4, 9, 5, 7, 6, 11],
  [0, 8, 3, 4, 9, 5, 11, 7, 6],
  [5, 0, 1, 5, 4, 0, 7, 6, 11],
  [11, 7, 6, 8, 3, 4, 3, 5, 4, 3, 1, 5],
  [9, 5, 4, 10, 1, 2, 7, 6, 11],
  [6, 11, 7, 1, 2, 10, 0, 8, 3, 4, 9, 5],
  [7, 6, 11, 5, 4, 10, 4, 2, 10, 4, 0, 2],
  [3, 4, 8, 3, 5, 4, 3, 2, 5, 10, 5, 2, 11, 7, 6],
  [7, 2, 3, 7, 6, 2, 5, 4, 9],
  [9, 5, 4, 0, 8, 6, 0, 6, 2, 6, 8, 7],
  [3, 6, 2, 3, 7, 6, 1, 5, 0, 5, 4, 0],
  [6, 2, 8, 6, 8, 7, 2, 1, 8, 4, 8, 5, 1, 5, 8],
  [9, 5, 4, 10, 1, 6, 1, 7, 6, 1, 3, 7],
  [1, 6, 10, 1, 7, 6, 1, 0, 7, 8, 7, 0, 9, 5, 4],
  [4, 0, 10, 4, 10, 5, 0, 3, 10, 6, 10, 7, 3, 7, 10],
  [7, 6, 10, 7, 10, 8, 5, 4, 10, 4, 8, 10],
  [6, 9, 5, 6, 11, 9, 11, 8, 9],
  [3, 6, 11, 0, 6, 3, 0, 5, 6, 0, 9, 5],
  [0, 11, 8, 0, 5, 11, 0, 1, 5, 5, 6, 11],
  [6, 11, 3, 6, 3, 5, 5, 3, 1],
  [1, 2, 10, 9, 5, 11, 9, 11, 8, 11, 5, 6],
  [0, 11, 3, 0, 6, 11, 0, 9, 6, 5, 6, 9, 1, 2, 10],
  [11, 8, 5, 11, 5, 6, 8, 0, 5, 10, 5, 2, 0, 2, 5],
  [6, 11, 3, 6, 3, 5, 2, 10, 3, 10, 5, 3],
  [5, 8, 9, 5, 2, 8, 5, 6, 2, 3, 8, 2],
  [9, 5, 6, 9, 6, 0, 0, 6, 2],
  [1, 5, 8, 1, 8, 0, 5, 6, 8, 3, 8, 2, 6, 2, 8],
  [1, 5, 6, 2, 1, 6],
  [1, 3, 6, 1, 6, 10, 3, 8, 6, 5, 6, 9, 8, 9, 6],
  [10, 1, 0, 10, 0, 6, 9, 5, 0, 5, 6, 0],
  [0, 3, 8, 5, 6, 10],
  [10, 5, 6],
  [11, 5, 10, 7, 5, 11],
  [11, 5, 10, 11, 7, 5, 8, 3, 0],
  [5, 11, 7, 5, 10, 11, 1, 9, 0],
  [10, 7, 5, 10, 11, 7, 9, 8, 1, 8, 3, 1],
  [11, 1, 2, 11, 7, 1, 7, 5, 1],
  [0, 8, 3, 1, 2, 7, 1, 7, 5, 7, 2, 11],
  [9, 7, 5, 9, 2, 7, 9, 0, 2, 2, 11, 7],
  [7, 5, 2, 7, 2, 11, 5, 9, 2, 3, 2, 8, 9, 8, 2],
  [2, 5, 10, 2, 3, 5, 3, 7, 5],
  [8, 2, 0, 8, 5, 2, 8, 7, 5, 10, 2, 5],
  [9, 0, 1, 5, 10, 3, 5, 3, 7, 3, 10, 2],
  [9, 8, 2, 9, 2, 1, 8, 7, 2, 10, 2, 5, 7, 5, 2],
  [1, 3, 5, 3, 7, 5],
  [0, 8, 7, 0, 7, 1, 1, 7, 5],
  [9, 0, 3, 9, 3, 5, 5, 3, 7],
  [9, 8, 7, 5, 9, 7],
  [5, 8, 4, 5, 10, 8, 10, 11, 8],
  [5, 0, 4, 5, 11, 0, 5, 10, 11, 11, 3, 0],
  [0, 1, 9, 8, 4, 10, 8, 10, 11, 10, 4, 5],
  [10, 11, 4, 10, 4, 5, 11, 3, 4, 9, 4, 1, 3, 1, 4],
  [2, 5, 1, 2, 8, 5, 2, 11, 8, 4, 5, 8],
  [0, 4, 11, 0, 11, 3, 4, 5, 11, 2, 11, 1, 5, 1, 11],
  [0, 2, 5, 0, 5, 9, 2, 11, 5, 4, 5, 8, 11, 8, 5],
  [9, 4, 5, 2, 11, 3],
  [2, 5, 10, 3, 5, 2, 3, 4, 5, 3, 8, 4],
  [5, 10, 2, 5, 2, 4, 4, 2, 0],
  [3, 10, 2, 3, 5, 10, 3, 8, 5, 4, 5, 8, 0, 1, 9],
  [5, 10, 2, 5, 2, 4, 1, 9, 2, 9, 4, 2],
  [8, 4, 5, 8, 5, 3, 3, 5, 1],
  [0, 4, 5, 1, 0, 5],
  [8, 4, 5, 8, 5, 3, 9, 0, 5, 0, 3, 5],
  [9, 4, 5],
  [4, 11, 7, 4, 9, 11, 9, 10, 11],
  [0, 8, 3, 4, 9, 7, 9, 11, 7, 9, 10, 11],
  [1, 10, 11, 1, 11, 4, 1, 4, 0, 7, 4, 11],
  [3, 1, 4, 3, 4, 8, 1, 10, 4, 7, 4, 11, 10, 11, 4],
  [4, 11, 7, 9, 11, 4, 9, 2, 11, 9, 1, 2],
  [9, 7, 4, 9, 11, 7, 9, 1, 11, 2, 11, 1, 0, 8, 3],
  [11, 7, 4, 11, 4, 2, 2, 4, 0],
  [11, 7, 4, 11, 4, 2, 8, 3, 4, 3, 2, 4],
  [2, 9, 10, 2, 7, 9, 2, 3, 7, 7, 4, 9],
  [9, 10, 7, 9, 7, 4, 10, 2, 7, 8, 7, 0, 2, 0, 7],
  [3, 7, 10, 3, 10, 2, 7, 4, 10, 1, 10, 0, 4, 0, 10],
  [1, 10, 2, 8, 7, 4],
  [4, 9, 1, 4, 1, 7, 7, 1, 3],
  [4, 9, 1, 4, 1, 7, 0, 8, 1, 8, 7, 1],
  [4, 0, 3, 7, 4, 3],
  [4, 8, 7],
  [9, 10, 8, 10, 11, 8],
  [3, 0, 9, 3, 9, 11, 11, 9, 10],
  [0, 1, 10, 0, 10, 8, 8, 10, 11],
  [3, 1, 10, 11, 3, 10],
  [1, 2, 11, 1, 11, 9, 9, 11, 8],
  [3, 0, 9, 3, 9, 11, 1, 2, 9, 2, 11, 9],
  [0, 2, 11, 8, 0, 11],
  [3, 2, 11],
  [2, 3, 8, 2, 8, 10, 10, 8, 9],
  [9, 10, 2, 0, 9, 2],
  [2, 3, 8, 2, 8, 10, 0, 1, 8, 1, 10, 8],
  [1, 10, 2],
  [1, 3, 8, 9, 1, 8],
  [0, 9, 1],
  [0, 3, 8],
  []
], cubeVerts = [
  [0, 0, 0],
  [1, 0, 0],
  [1, 1, 0],
  [0, 1, 0],
  [0, 0, 1],
  [1, 0, 1],
  [1, 1, 1],
  [0, 1, 1]
], edgeIndex = [
  [0, 1],
  [1, 2],
  [3, 2],
  [0, 3],
  [4, 5],
  [5, 6],
  [7, 6],
  [4, 7],
  [0, 4],
  [1, 5],
  [2, 6],
  [3, 7]
];
function wrapIndex(o, e) {
  const t = o % e;
  return t < 0 ? t + e : t;
}
function clipTrianglesAgainstPlane(o, e, t, s, i) {
  if (!Array.isArray(e) || e.length === 0)
    return { positions: o, faces: e };
  const n = o.map((m) => [m[0], m[1], m[2]]), r = [], a = t[0], l = t[1], c = t[2], h = s[0], d = s[1], u = s[2], p = (m) => a * (m[0] - h) + l * (m[1] - d) + c * (m[2] - u);
  for (let m = 0; m < e.length; m += 3) {
    const g = e[m], y = e[m + 1], f = e[m + 2], w = [n[g], n[y], n[f]], b = p(w[0]), x = p(w[1]), S = p(w[2]), M = [b <= i, x <= i, S <= i];
    if (M[0] && M[1] && M[2]) {
      r.push(g, y, f);
      continue;
    }
    if (!M[0] && !M[1] && !M[2])
      continue;
    const E = w, v = [b, x, S], C = [];
    for (let _ = 0; _ < 3; _++) {
      const L = E[_], j = v[_], R = E[(_ + 1) % 3], P = v[(_ + 1) % 3], F = j <= i, $ = P <= i;
      if (F && C.push(L), F !== $) {
        const z = j / (j - P);
        C.push([L[0] + z * (R[0] - L[0]), L[1] + z * (R[1] - L[1]), L[2] + z * (R[2] - L[2])]);
      }
    }
    if (C.length < 3) continue;
    const A = n.length;
    for (let _ = 0; _ < C.length; _++)
      n.push(C[_]);
    for (let _ = 1; _ < C.length - 1; _++)
      r.push(A, A + _, A + _ + 1);
  }
  return { positions: n, faces: r };
}
function clipMeshToPlanes(o, e, t, s = 1e-10) {
  if (!Array.isArray(t) || t.length === 0)
    return { positions: o, faces: e };
  let i = o, n = e;
  for (let r = 0; r < t.length; r++) {
    const a = t[r];
    if (!a || !a.normal || !a.point) continue;
    const l = clipTrianglesAgainstPlane(i, n, a.normal, a.point, s);
    if (i = l.positions, n = l.faces, !n.length) break;
  }
  return { positions: i, faces: n };
}
function marchingCubes(o, e, t, s, i = 1, n = null) {
  let r = n || {};
  typeof i == "object" && i !== null && (r = i, i = 1);
  const a = !!r.periodic, l = r.generateBoundaryMaterials !== !1 && !a;
  t || (t = [[0, 0, 0], o]);
  const c = [0, 0, 0], h = [0, 0, 0];
  for (let S = 0; S < 3; ++S)
    c[S] = (t[1][S] - t[0][S]) / o[S], h[S] = t[0][S];
  const d = [], u = [], p = [], m = new Array(8), g = new Array(12), y = [0, 0, 0], f = [], w = /* @__PURE__ */ new Map(), b = s - Math.sign(s || 1) * Number.MAX_VALUE;
  function x(S, M, E) {
    if (a) {
      const v = wrapIndex(S, o[0]), C = wrapIndex(M, o[1]), A = wrapIndex(E, o[2]), _ = (v * o[1] + C) * o[2] + A;
      return e[_];
    }
    if (S >= 0 && S < o[0] && M >= 0 && M < o[1] && E >= 0 && E < o[2]) {
      const v = (S * o[1] + M) * o[2] + E;
      return e[v];
    } else
      return b;
  }
  for (y[0] = -i; y[0] < o[0] + i; y[0] += i)
    for (y[1] = -i; y[1] < o[1] + i; y[1] += i)
      for (y[2] = -i; y[2] < o[2] + i; y[2] += i) {
        let S = 0;
        for (let v = 0; v < 8; ++v) {
          const C = cubeVerts[v], A = y[0] + C[0] * i, _ = y[1] + C[1] * i, L = y[2] + C[2] * i, j = x(A, _, L);
          m[v] = j, S |= j > s ? 1 << v : 0;
        }
        const M = edgeTable[S];
        if (M === 0) continue;
        for (let v = 0; v < 12; ++v) {
          if ((M & 1 << v) === 0) continue;
          const C = `${y[0]}_${y[1]}_${y[2]}_${v}`;
          if (w.has(C)) {
            g[v] = w.get(C).index;
            continue;
          }
          g[v] = d.length;
          const A = [0, 0, 0], _ = edgeIndex[v], L = cubeVerts[_[0]], j = cubeVerts[_[1]], R = m[_[0]], P = m[_[1]], F = P - R, z = 1e-12 * Math.max(1, Math.abs(R), Math.abs(P), Math.abs(s)), Z = Math.abs(F) > z ? (s - R) / F : 0.5, k = [0, 0, 0];
          let U = !1;
          for (let T = 0; T < 3; ++T)
            k[T] = y[T] + L[T] * i + Z * (j[T] - L[T]) * i, l && (k[T] <= 0 && (k[T] = 0, U = !0), k[T] >= o[T] - 1 && (k[T] = o[T] - 1, U = !0)), A[T] = c[T] * k[T] + h[T];
          d.push(A), f.push(U), w.set(C, { index: g[v], onBoundary: U });
        }
        const E = triTable[S];
        for (let v = 0; v < E.length; v += 3) {
          const C = g[E[v]], A = g[E[v + 1]], _ = g[E[v + 2]];
          if (u.push(C, A, _), l) {
            const L = f[C] && f[A] && f[_];
            p.push(L ? 1 : 0);
          }
        }
      }
  return { positions: d, cells: u, faceMaterials: l ? p : [] };
}
function normalizeHexColor(o) {
  return "#" + (o instanceof THREE.Color ? o : new THREE.Color(o)).getHexString();
}
let Setting$3 = class {
  constructor({ isovalue: e = null, color: t = "#3d82ed", mode: s = 1, step_size: i = 1, opacity: n = 0.8 }) {
    this.isovalue = e, this.color = normalizeHexColor(t), this.mode = s, this.step_size = i, this.opacity = Math.min(1, Math.max(0, n ?? 0.8));
  }
};
class Isosurface {
  constructor(e) {
    this.viewer = e, this.scene = e.tjs.scene, this.settings = {}, this.guiFolder = null, this.meshes = {};
    const t = this.viewer.state.get("plugins.isosurface");
    t && t.settings && (this.settings = {}, this.applySettings(t.settings), this.viewer.volumetricData && this.drawIsosurfaces()), this.viewer.state.subscribe("plugins.isosurface", (s) => {
      !s || !s.settings || (this.applySettings(s.settings), this.viewer.volumetricData && this.drawIsosurfaces());
    });
  }
  getIsovalueRange() {
    const e = this.viewer?.volumetricData?.values;
    if (!e || e.length === 0)
      return { minValue: -1, maxValue: 1 };
    const t = e.reduce((i, n) => Math.min(i, n), 1 / 0), s = e.reduce((i, n) => Math.max(i, n), -1 / 0);
    if (!isFinite(t) || !isFinite(s))
      return { minValue: -1, maxValue: 1 };
    if (Math.abs(s - t) < 1e-9) {
      const i = Math.max(Math.abs(t), 1) * 1e-3;
      return { minValue: t - i, maxValue: s + i };
    }
    return { minValue: t, maxValue: s };
  }
  createGui() {
    this.viewer.guiManager.gui && !this.guiFolder && (this.guiFolder = this.viewer.guiManager.gui.addFolder("Isosurface"));
  }
  removeGui() {
    this.guiFolder && (this.viewer.guiManager.gui.removeFolder(this.guiFolder), this.guiFolder = null);
  }
  reset() {
    this.removeGui(), this.meshes = {}, this.settings = {};
  }
  setSettings(e) {
    this.viewer.state.set({ plugins: { isosurface: { settings: cloneValue(e) } } });
  }
  applySettings(e) {
    this.settings = {}, this.removeGui(), this.createGui(), this.clearIossurfaces(), Object.entries(e).forEach(([t, s]) => {
      this.addSetting(t, s);
    });
  }
  addSetting(e, { isovalue: t = null, color: s = "#3d82ed", mode: i = 1, step_size: n = 1, opacity: r = 0.8 }) {
    const { minValue: a, maxValue: l } = this.getIsovalueRange();
    t === null && (t = (a + l) / 2);
    const c = new Setting$3({ isovalue: t, color: s, mode: i, step_size: n, opacity: r });
    e === void 0 && (e = "iso-" + Object.keys(this.settings).length), this.settings[e] = c, this.createGui();
    const h = this.guiFolder.addFolder(e);
    h.add(c, "isovalue", a, l).name("Level").onFinishChange(this.drawIsosurfaces.bind(this)), h.addColor(c, "color").name("Color").onFinishChange(this.drawIsosurfaces.bind(this)), h.add(c, "opacity", 0, 1, 0.01).name("Opacity").onFinishChange(this.drawIsosurfaces.bind(this));
  }
  clearIossurfaces() {
    this.meshes = {}, this.updateAnyMeshSettings([]);
  }
  drawIsosurfaces() {
    if (this.viewer.volumetricData === null) {
      this.viewer.logger.debug("No volumetric data is set");
      return;
    }
    this.viewer.logger.debug("drawIsosurfaces"), this.clearIossurfaces();
    const e = this.viewer.volumetricData, t = e.values, s = e.dims, i = e.cell, n = e.origin, r = [
      [i[0][0] / s[0], i[0][1] / s[0], i[0][2] / s[0]],
      [i[1][0] / s[1], i[1][1] / s[1], i[1][2] / s[1]],
      [i[2][0] / s[2], i[2][1] / s[2], i[2][2] / s[2]]
    ], a = [];
    Object.entries(this.settings).forEach(([l, c]) => {
      this.viewer.logger.debug("setting: ", c);
      let h, d;
      const u = normalizeHexColor(c.color);
      if (c.mode === 0) {
        h = [-c.isovalue, c.isovalue];
        const m = (16777215 - parseInt(u.substring(1), 16)).toString(16).padStart(6, "0");
        d = [u, "#" + m];
      } else
        h = [c.isovalue], d = [u];
      for (let m = 0; m < h.length; m++) {
        const g = h[m];
        this.viewer.logger.debug("isovalue: ", g);
        var p = marchingCubes(s, t, null, g, c.step_size);
        p.positions = p.positions.map(function(E) {
          var v = E[0] * r[0][0] + E[1] * r[1][0] + E[2] * r[2][0] + n[0], C = E[0] * r[0][1] + E[1] * r[1][1] + E[2] * r[2][1] + n[1], A = E[0] * r[0][2] + E[1] * r[1][2] + E[2] * r[2][2] + n[2];
          return [v, C, A];
        });
        const y = p.positions.reduce((E, v) => (E.push(v[0], v[1], v[2]), E), []), f = Array.isArray(p.cells) ? p.cells : Array.from(p.cells || []), w = Array.isArray(p.faceMaterials) ? p.faceMaterials : [], b = splitFacesByMaterial(f, w), x = `${l}-${m}`, S = c.opacity ?? 0.8, M = b[0].length ? b[0] : f;
        a.push({
          name: `${x}`,
          vertices: y,
          faces: M,
          color: d[m],
          opacity: S,
          materialType: "Standard",
          side: "DoubleSide",
          depthWrite: !0,
          depthTest: !0,
          mergeVerticesTolerance: 1e-5,
          smoothNormals: !0,
          selectable: !1,
          layer: 1,
          userData: {
            source: "isosurface",
            isosurface: l,
            modeIndex: m,
            materialIndex: 0
          }
        }), b[1].length && a.push({
          name: `${x}-cap`,
          vertices: y,
          faces: b[1],
          color: "#c2f542",
          opacity: S,
          materialType: "Standard",
          side: "DoubleSide",
          depthWrite: !0,
          depthTest: !0,
          mergeVerticesTolerance: 1e-5,
          smoothNormals: !0,
          selectable: !1,
          layer: 1,
          userData: {
            source: "isosurface",
            isosurface: l,
            modeIndex: m,
            materialIndex: 1
          }
        }), this.meshes[x] = x;
      }
    }), this.updateAnyMeshSettings(a);
  }
  updateAnyMeshSettings(e) {
    const t = this.viewer?.weas?.anyMesh;
    if (!t || typeof t.setSettings != "function")
      return;
    const i = (Array.isArray(t.settings) ? t.settings : []).filter((n) => n?.userData?.source !== "isosurface");
    t.setSettings([...i, ...e]);
  }
}
function splitFacesByMaterial(o, e) {
  const t = [[], []];
  if (!Array.isArray(o) || o.length === 0)
    return t;
  if (!Array.isArray(e) || e.length === 0)
    return t[0] = o.slice(), t;
  for (let s = 0; s < o.length; s += 3) {
    const i = e[s / 3] === 1 ? 1 : 0;
    t[i].push(o[s], o[s + 1], o[s + 2]);
  }
  return t;
}
class FermiSurfaceSetting {
  constructor({
    isovalue: e = null,
    color: t = "#00ff00",
    step_size: s = 1,
    opacity: i = 0.6,
    periodic: n = !1,
    clipToBZ: r = !0,
    clipPlanes: a = null,
    clipEps: l = 1e-10,
    datasets: c = null,
    dataset: h = null,
    materialType: d = "Standard",
    mergeVerticesTolerance: u = 0.1,
    smoothNormals: p = !0,
    wrapFractional: m = !1,
    tile: g = 1,
    bzCropMargin: y = 1
  }) {
    this.isovalue = e, this.color = t, this.step_size = s, this.opacity = Math.min(1, Math.max(0, i ?? 0.6)), this.periodic = !!n, this.clipToBZ = !!r, this.clipPlanes = Array.isArray(a) ? a : null, this.clipEps = typeof l == "number" ? l : 1e-10, this.datasets = Array.isArray(c) ? c : null, this.dataset = typeof h == "string" ? h : null, this.materialType = d || "Standard", this.mergeVerticesTolerance = u, this.smoothNormals = p, this.wrapFractional = m !== !1, this.tile = typeof g == "number" ? g : 1, this.bzCropMargin = Math.max(0, Math.floor(typeof y == "number" ? y : 1));
  }
}
function normalizeColor(o) {
  if (Array.isArray(o)) {
    const e = Math.max(0, Math.min(1, o[0] ?? 0)), t = Math.max(0, Math.min(1, o[1] ?? 0)), s = Math.max(0, Math.min(1, o[2] ?? 0)), i = (n) => Math.round(n * 255).toString(16).padStart(2, "0");
    return `#${i(e)}${i(t)}${i(s)}`;
  }
  return o;
}
function normalizeDatasets(o) {
  if (!o) return null;
  if (Array.isArray(o.datasets)) {
    const e = /* @__PURE__ */ new Map();
    return o.datasets.forEach((t, s) => {
      if (!t) return;
      const i = typeof t.name == "string" ? t.name : `dataset-${s}`;
      e.set(i, t);
    }), { map: e, meta: o };
  }
  if (Array.isArray(o.dims) && Array.isArray(o.values)) {
    const e = /* @__PURE__ */ new Map();
    return e.set("default", o), { map: e, meta: o };
  }
  return null;
}
function tileVolume(o, e, t) {
  const s = e[0], i = e[1], n = e[2], r = s * t, a = i * t, l = n * t, c = new Array(r * a * l);
  for (let h = 0; h < r; h++) {
    const d = h % s;
    for (let u = 0; u < a; u++) {
      const p = u % i;
      for (let m = 0; m < l; m++) {
        const g = m % n, y = (d * i + p) * n + g, f = (h * a + u) * l + m;
        c[f] = o[y];
      }
    }
  }
  return c;
}
function invert3x3(o) {
  const e = o[0][0], t = o[0][1], s = o[0][2], i = o[1][0], n = o[1][1], r = o[1][2], a = o[2][0], l = o[2][1], c = o[2][2], h = c * n - r * l, d = -c * i + r * a, u = l * i - n * a;
  let p = e * h + t * d + s * u;
  return p ? (p = 1 / p, [
    [h * p, (-c * t + s * l) * p, (r * t - s * n) * p],
    [d * p, (c * e - s * a) * p, (-r * e + s * i) * p],
    [u * p, (-l * e + t * a) * p, (n * e - t * i) * p]
  ]) : null;
}
function mulMatVec(o, e) {
  return [o[0][0] * e[0] + o[0][1] * e[1] + o[0][2] * e[2], o[1][0] * e[0] + o[1][1] * e[1] + o[1][2] * e[2], o[2][0] * e[0] + o[2][1] * e[1] + o[2][2] * e[2]];
}
function clamp(o, e, t) {
  return Math.min(t, Math.max(e, o));
}
class FermiSurface {
  constructor(e) {
    this.viewer = e, this.settings = {}, this.meshes = {}, this.guiFolder = null, this.globalFolder = null, this.globalIsovalue = null, this.cache = /* @__PURE__ */ new Map();
    const t = this.viewer.state.get("plugins.fermiSurface");
    t && t.settings && (this.settings = {}, this.applySettings(t.settings), this.viewer.fermiSurfaceData && this.drawFermiSurfaces()), this.viewer.state.subscribe("plugins.fermiSurface", (s) => {
      !s || !s.settings || (this.applySettings(s.settings), this.viewer.fermiSurfaceData && this.drawFermiSurfaces());
    });
  }
  getIsovalueRange() {
    const e = this.viewer?.fermiSurfaceData;
    if (!e)
      return { minValue: -1, maxValue: 1 };
    const t = Array.isArray(e.datasets) ? e.datasets : [];
    if (!t.length)
      return { minValue: -1, maxValue: 1 };
    let s = 1 / 0, i = -1 / 0;
    for (let n = 0; n < t.length; n++) {
      const r = t[n]?.values;
      if (Array.isArray(r))
        for (let a = 0; a < r.length; a++) {
          const l = r[a];
          l < s && (s = l), l > i && (i = l);
        }
    }
    if (!isFinite(s) || !isFinite(i))
      return { minValue: -1, maxValue: 1 };
    if (Math.abs(i - s) < 1e-9) {
      const n = Math.max(Math.abs(s), 1) * 0.1;
      return { minValue: s - n, maxValue: i + n };
    }
    return { minValue: s, maxValue: i };
  }
  createGui() {
    this.viewer.fermiSurfaceData && this.viewer.guiManager.gui && !this.guiFolder && (this.guiFolder = this.viewer.guiManager.gui.addFolder("FermiSurface"));
  }
  removeGui() {
    this.guiFolder && (this.viewer.guiManager.gui.removeFolder(this.guiFolder), this.guiFolder = null);
  }
  reset() {
    this.meshes = {}, this.settings = {}, this.removeGui(), this.cache.clear();
  }
  setSettings(e) {
    this.viewer.state.set({ plugins: { fermiSurface: { settings: cloneValue(e) } } });
  }
  applySettings(e) {
    this.settings = {}, this.clearFermiSurfaces(), this.removeGui(), this.viewer.fermiSurfaceData && (this.createGui(), Object.entries(e).forEach(([t, s]) => {
      this.addSetting(t, s);
    }), this.addGlobalControls());
  }
  addGlobalControls() {
    if (!this.guiFolder) return;
    this.globalFolder && (this.guiFolder.removeFolder(this.globalFolder), this.globalFolder = null);
    const { minValue: e, maxValue: t } = this.getIsovalueRange();
    (this.globalIsovalue === null || typeof this.globalIsovalue != "number") && (this.globalIsovalue = (e + t) / 2);
    const s = Math.abs(t - e), i = Math.min(0.1, Math.max(s / 2e3, 1e-3)), n = this.guiFolder.addFolder("Global");
    this.globalFolder = n, n.add(this, "globalIsovalue", e, t, i).name("Fermi Energy").onFinishChange(() => {
      Object.values(this.settings).forEach((r) => {
        r.isovalue = this.globalIsovalue;
      }), this.drawFermiSurfaces();
    });
  }
  addSetting(e, {
    isovalue: t = null,
    color: s = "#00ff00",
    step_size: i = 1,
    opacity: n = 0.6,
    periodic: r = !1,
    clipToBZ: a = !0,
    clipPlanes: l = null,
    clipEps: c = 1e-10,
    datasets: h = null,
    dataset: d = null,
    materialType: u = "Standard",
    mergeVerticesTolerance: p = 0.1,
    smoothNormals: m = !0,
    wrapFractional: g = !1,
    tile: y = 1,
    bzCropMargin: f = 1
  }) {
    const w = new FermiSurfaceSetting({
      isovalue: t,
      color: normalizeColor(s),
      step_size: i,
      opacity: n,
      periodic: r,
      clipToBZ: a,
      clipPlanes: l,
      clipEps: c,
      datasets: h,
      dataset: d,
      materialType: u,
      mergeVerticesTolerance: p,
      smoothNormals: m,
      wrapFractional: g,
      tile: y,
      bzCropMargin: f
    });
    e === void 0 && (e = "fermi-" + Object.keys(this.settings).length), this.settings[e] = w, this.createGui();
    const { minValue: b, maxValue: x } = this.getIsovalueRange();
    (w.isovalue === null || typeof w.isovalue != "number") && (w.isovalue = (b + x) / 2);
    const S = this.guiFolder.addFolder(e);
    S.addColor(w, "color").name("Color").onFinishChange(this.drawFermiSurfaces.bind(this)), S.add(w, "opacity", 0, 1, 0.01).name("Opacity").onFinishChange(this.drawFermiSurfaces.bind(this)), S.add(w, "clipToBZ").name("Clip BZ").onFinishChange(this.drawFermiSurfaces.bind(this)), S.add(w, "step_size", 1, 4, 1).name("Step").onFinishChange(this.drawFermiSurfaces.bind(this));
  }
  clearFermiSurfaces() {
    this.meshes = {}, this.updateAnyMeshSettings([]);
  }
  drawFermiSurfaces() {
    const e = this.viewer.fermiSurfaceData;
    if (!e) {
      this.removeGui();
      return;
    }
    this.lastDataRef !== e && (this.cache.clear(), this.lastDataRef = e);
    const t = normalizeDatasets(e);
    if (!t) return;
    const s = t.map, i = [], n = e?.version || 0;
    if (e.bzMesh && e.bzMesh.vertices && e.bzMesh.faces) {
      const r = {
        name: e.bzMesh.name || "Brillouin-zone",
        vertices: e.bzMesh.vertices,
        faces: e.bzMesh.faces,
        color: e.bzMesh.color || [0, 0, 0.5],
        opacity: typeof e.bzMesh.opacity == "number" ? e.bzMesh.opacity : 0.1,
        position: e.bzMesh.position || [0, 0, 0],
        materialType: e.bzMesh.materialType || "Standard",
        showEdges: !!e.bzMesh.showEdges,
        edgeColor: e.bzMesh.edgeColor || [0, 0, 0, 1],
        depthWrite: e.bzMesh.depthWrite !== !1 ? !!e.bzMesh.depthWrite : !1,
        depthTest: e.bzMesh.depthTest !== !1 ? !!e.bzMesh.depthTest : !1,
        side: e.bzMesh.side || "DoubleSide",
        clearDepth: !!e.bzMesh.clearDepth,
        renderOrder: typeof e.bzMesh.renderOrder == "number" ? e.bzMesh.renderOrder : 10,
        mergeVerticesTolerance: e.bzMesh.mergeVerticesTolerance ?? null,
        smoothNormals: e.bzMesh.smoothNormals ?? !1,
        selectable: !1,
        userData: { source: "brillouinZone" }
      };
      i.push(r);
    }
    Object.entries(this.settings).forEach(([r, a]) => {
      const l = a.dataset ? [a.dataset] : Array.isArray(a.datasets) && a.datasets.length ? a.datasets : Array.from(s.keys()), c = [], h = [];
      let d = 0;
      if (l.forEach((p) => {
        const m = s.get(p);
        if (!m) return;
        const g = m.dims, y = m.values;
        if (!Array.isArray(g) || !Array.isArray(y)) return;
        const f = m.cell || e.cell, w = m.origin || e.origin || [0, 0, 0];
        if (!f || f.length !== 3) return;
        const b = g, x = 2, S = [b[0] * x, b[1] * x, b[2] * x], M = `${p}|${y.length}|${x}|${a.clipToBZ ? 1 : 0}|${a.bzCropMargin}|${n}`;
        let E = this.cache.get(M), v, C = [0, 0, 0], A = S;
        if (E)
          v = E.values, C = E.offset, A = E.dims;
        else {
          if (v = tileVolume(y, b, x), a.clipToBZ && e.bzMesh && e.bzMesh.vertices) {
            const T = invert3x3(f);
            if (T) {
              let B = [1 / 0, 1 / 0, 1 / 0], G = [-1 / 0, -1 / 0, -1 / 0];
              const W = e.bzMesh.vertices;
              for (let H = 0; H < W.length; H += 3) {
                const N = mulMatVec(T, [W[H], W[H + 1], W[H + 2]]);
                for (let D = 0; D < 3; D++)
                  N[D] < B[D] && (B[D] = N[D]), N[D] > G[D] && (G[D] = N[D]);
              }
              const q = a.bzCropMargin || 1, V = [0, 0, 0], O = [0, 0, 0];
              for (let H = 0; H < 3; H++) {
                const N = Math.floor((B[H] + x / 2) * b[H]) - q, D = Math.ceil((G[H] + x / 2) * b[H]) + q;
                V[H] = clamp(N, 0, S[H] - 1), O[H] = clamp(D, 0, S[H] - 1);
              }
              if (C = [V[0], V[1], V[2]], A = [O[0] - V[0] + 1, O[1] - V[1] + 1, O[2] - V[2] + 1], A[0] > 0 && A[1] > 0 && A[2] > 0) {
                const H = new Array(A[0] * A[1] * A[2]);
                for (let N = 0; N < A[0]; N++)
                  for (let D = 0; D < A[1]; D++)
                    for (let Y = 0; Y < A[2]; Y++) {
                      const K = N + C[0], I = D + C[1], X = Y + C[2], J = (K * S[1] + I) * S[2] + X, Q = (N * A[1] + D) * A[2] + Y;
                      H[Q] = v[J];
                    }
                v = H;
              } else
                C = [0, 0, 0], A = S;
            }
          }
          this.cache.set(M, { values: v, offset: C, dims: A });
        }
        const _ = a.isovalue !== null ? a.isovalue : 0, L = marchingCubes(A, v, null, _, a.step_size, { periodic: !1 }), j = Array.isArray(L.cells) ? L.cells : Array.from(L.cells || []);
        let R = [], P = [];
        if (a.wrapFractional) {
          const T = L.positions.map((B) => [
            (B[0] + C[0]) / b[0] - x / 2,
            (B[1] + C[1]) / b[1] - x / 2,
            (B[2] + C[2]) / b[2] - x / 2
          ]);
          for (let B = 0; B < j.length; B += 3) {
            const G = j[B], W = j[B + 1], q = j[B + 2], V = T[G], O = T[W].slice(), H = T[q].slice();
            for (let I = 0; I < 3; I++) {
              let X = O[I] - V[I];
              X > 0.5 ? O[I] -= 1 : X < -0.5 && (O[I] += 1);
              let J = H[I] - V[I];
              J > 0.5 ? H[I] -= 1 : J < -0.5 && (H[I] += 1);
            }
            const N = R.length, D = [
              V[0] * f[0][0] + V[1] * f[1][0] + V[2] * f[2][0] + w[0],
              V[0] * f[0][1] + V[1] * f[1][1] + V[2] * f[2][1] + w[1],
              V[0] * f[0][2] + V[1] * f[1][2] + V[2] * f[2][2] + w[2]
            ], Y = [
              O[0] * f[0][0] + O[1] * f[1][0] + O[2] * f[2][0] + w[0],
              O[0] * f[0][1] + O[1] * f[1][1] + O[2] * f[2][1] + w[1],
              O[0] * f[0][2] + O[1] * f[1][2] + O[2] * f[2][2] + w[2]
            ], K = [
              H[0] * f[0][0] + H[1] * f[1][0] + H[2] * f[2][0] + w[0],
              H[0] * f[0][1] + H[1] * f[1][1] + H[2] * f[2][1] + w[1],
              H[0] * f[0][2] + H[1] * f[1][2] + H[2] * f[2][2] + w[2]
            ];
            R.push(D, Y, K), P.push(N, N + 1, N + 2);
          }
        } else
          R = L.positions.map((T) => {
            const B = (T[0] + C[0]) / b[0] - x / 2, G = (T[1] + C[1]) / b[1] - x / 2, W = (T[2] + C[2]) / b[2] - x / 2, q = B * f[0][0] + G * f[1][0] + W * f[2][0] + w[0], V = B * f[0][1] + G * f[1][1] + W * f[2][1] + w[1], O = B * f[0][2] + G * f[1][2] + W * f[2][2] + w[2];
            return [q, V, O];
          }), P = j;
        const F = Math.max(1, Math.floor(typeof a.tile == "number" ? a.tile : 1)), $ = F, z = F, Z = F;
        let k = R, U = P;
        if ($ > 1 || z > 1 || Z > 1) {
          k = [], U = [];
          const T = [], B = -Math.floor($ / 2), G = -Math.floor(z / 2), W = -Math.floor(Z / 2);
          for (let V = B; V < B + $; V++)
            for (let O = G; O < G + z; O++)
              for (let H = W; H < W + Z; H++)
                T.push([V, O, H]);
          let q = 0;
          for (let V = 0; V < T.length; V++) {
            const [O, H, N] = T[V], D = O * f[0][0] + H * f[1][0] + N * f[2][0], Y = O * f[0][1] + H * f[1][1] + N * f[2][1], K = O * f[0][2] + H * f[1][2] + N * f[2][2];
            for (let I = 0; I < R.length; I++) {
              const X = R[I];
              k.push([X[0] + D, X[1] + Y, X[2] + K]);
            }
            for (let I = 0; I < P.length; I += 3)
              U.push(P[I] + q, P[I + 1] + q, P[I + 2] + q);
            q += R.length;
          }
        }
        if (a.clipToBZ) {
          const T = a.clipPlanes || m.bzPlanes || e.bzPlanes || null;
          if (T && T.length && U.length) {
            const B = clipMeshToPlanes(k, U, T, a.clipEps);
            R = B.positions, P = B.faces;
          } else
            R = k, P = U;
        } else
          R = k, P = U;
        if (R.length && P.length) {
          for (let T = 0; T < R.length; T++)
            c.push(R[T]);
          for (let T = 0; T < P.length; T += 3)
            h.push(P[T] + d, P[T + 1] + d, P[T + 2] + d);
          d += R.length;
        }
      }), !c.length || !h.length) return;
      const u = c.reduce((p, m) => (p.push(m[0], m[1], m[2]), p), []);
      i.push({
        name: r,
        vertices: u,
        faces: h,
        color: a.color,
        opacity: a.opacity,
        materialType: a.materialType,
        side: "DoubleSide",
        depthWrite: !0,
        depthTest: !0,
        mergeVerticesTolerance: a.mergeVerticesTolerance,
        smoothNormals: a.smoothNormals,
        selectable: !1,
        layer: 1,
        userData: {
          source: "fermiSurface",
          fermiSurface: r
        }
      }), this.meshes[r] = r;
    }), this.updateAnyMeshSettings(i);
  }
  updateAnyMeshSettings(e) {
    const t = this.viewer?.weas?.anyMesh;
    if (!t || typeof t.setSettings != "function") return;
    const s = Array.isArray(t.settings) ? t.settings : [], i = s.filter((a) => a?.userData?.source !== "fermiSurface" && a?.userData?.source !== "brillouinZone");
    if (!Array.isArray(e) || e.length === 0) {
      if (!s.some((l) => l?.userData?.source === "fermiSurface" || l?.userData?.source === "brillouinZone"))
        return;
      t.setSettings([...i]);
      return;
    }
    const n = /* @__PURE__ */ new Map();
    s.forEach((a) => {
      a?.name && (a?.userData?.source === "fermiSurface" || a?.userData?.source === "brillouinZone") && n.set(a.name, a);
    });
    const r = e.map((a) => {
      const l = n.get(a.name);
      return l && typeof l.visible == "boolean" ? { ...a, visible: l.visible } : a;
    });
    t.setSettings([...i, ...r]);
  }
}
class SliceSetting {
  constructor({ method: e = "miller", h: t = 0, k: s = 0, l: i = 1, distance: n = 0, selectedAtomIndices: r = [], colorMap: a = "viridis", opacity: l = 1, samplingDistance: c = 0.2 }) {
    this.method = e, this.h = t, this.k = s, this.l = i, this.distance = n, this.selectedAtomIndices = r, this.colorMap = a, this.opacity = l, this.samplingDistance = c;
  }
}
class VolumeSlice {
  constructor(e) {
    this.viewer = e, this.scene = e.tjs.scene, this.settings = {}, this.guiFolder = null, this.slices = {};
    const t = this.viewer.state.get("plugins.volumeSlice");
    t && t.settings && (this.settings = {}, this.applySettings(t.settings), this.viewer.volumetricData && this.drawSlices()), this.viewer.state.subscribe("plugins.volumeSlice", (s) => {
      !s || !s.settings || (this.applySettings(s.settings), this.viewer.volumetricData && this.drawSlices());
    });
  }
  createGui() {
    this.viewer.guiManager.gui && !this.guiFolder && (this.guiFolder = this.viewer.guiManager.gui.addFolder("Slices"));
  }
  removeGui() {
    this.guiFolder && (this.viewer.guiManager.gui.removeFolder(this.guiFolder), this.guiFolder = null);
  }
  reset() {
    this.removeGui(), this.clearSlices(), this.settings = {};
  }
  setSettings(e) {
    this.viewer.state.set({ plugins: { volumeSlice: { settings: cloneValue(e) } } });
  }
  applySettings(e) {
    this.settings = {}, this.removeGui(), this.createGui(), this.clearSlices(), Object.entries(e).forEach(([t, s]) => {
      this.addSetting(t, s);
    });
  }
  addSetting(e, { method: t = "miller", h: s = 0, k: i = 0, l: n = 1, distance: r = 0, selectedAtomIndices: a = [], colorMap: l = "viridis", opacity: c = 1, samplingDistance: h = 0.2 }) {
    const d = new SliceSetting({
      method: t,
      h: s,
      k: i,
      l: n,
      distance: r,
      selectedAtomIndices: a,
      colorMap: l,
      opacity: c,
      samplingDistance: h
    });
    e === void 0 && (e = "slice-" + Object.keys(this.settings).length), this.settings[e] = d, this.createGui();
    const u = this.guiFolder.addFolder(e);
    u.add(d, "method", ["miller", "bestFit"]).name("Method").onChange(this.drawSlices.bind(this)), u.add(d, "samplingDistance", 0.1, 5).name("Sampling Distance").onChange(this.drawSlices.bind(this)), d.method === "miller" ? (u.add(d, "h").name("Miller h").onChange(this.drawSlices.bind(this)), u.add(d, "k").name("Miller k").onChange(this.drawSlices.bind(this)), u.add(d, "l").name("Miller l").onChange(this.drawSlices.bind(this)), u.add(d, "distance").name("Distance").onChange(this.drawSlices.bind(this))) : d.method, u.add(d, "opacity", 0, 1).name("Opacity").onChange(this.drawSlices.bind(this));
  }
  clearSlices() {
    Object.values(this.slices).forEach((e) => {
      clearObject(this.scene, e);
    });
  }
  drawSlices() {
    if (this.viewer.volumetricData === null) {
      this.viewer.logger.debug("No volumetric data is set");
      return;
    }
    this.viewer.logger.debug("drawSlices"), this.clearSlices();
    const e = this.viewer.volumetricData, t = e.values, s = e.dims, i = e.cell, n = new THREE.Vector3(...e.origin);
    Object.entries(this.settings).forEach(([r, a]) => {
      let l, c;
      if (a.method === "miller")
        l = computePlaneNormalFromMillerIndices(a.h, a.k, a.l, i), c = l.clone().multiplyScalar(a.distance).add(n);
      else if (a.method === "bestFit") {
        const v = a.selectedAtomIndices.map((A) => new THREE.Vector3(...this.viewer.atoms.positions[A])), C = computeBestFitPlane(v);
        l = C.normal, c = C.point;
      } else {
        this.viewer.logger.error(`Unknown method: ${a.method}`);
        return;
      }
      const h = a.samplingDistance || 0.5, d = extractSliceArbitrary(t, s, i, n, l, c, h);
      if (!d) {
        this.viewer.logger.debug("Slice does not intersect the unit cell sufficiently");
        return;
      }
      const { sliceData: u, width: p, height: m, minX: g, maxX: y, minY: f, maxY: w, projectedPoints: b } = d, x = Math.max(...u.flat()), S = Math.min(...u.flat()), M = createTextureFromSlice(u, S, x, a.colorMap), E = createSlicePlaneArbitrary(b, l, c, M, a.opacity, g, y, f, w);
      E.userData.type = "slice", E.userData.uuid = this.viewer.uuid, E.userData.notSelectable = !0, E.layers.set(1), this.scene.add(E), this.slices[r] = E;
    }), this.viewer.requestRedraw?.("render");
  }
}
function computePlaneNormalFromMillerIndices(o, e, t, s) {
  const i = new THREE.Vector3(...s[0]), n = new THREE.Vector3(...s[1]), r = new THREE.Vector3(...s[2]), a = i.dot(n.clone().cross(r)), l = n.clone().cross(r).multiplyScalar(2 * Math.PI / a), c = r.clone().cross(i).multiplyScalar(2 * Math.PI / a), h = i.clone().cross(n).multiplyScalar(2 * Math.PI / a);
  return l.clone().multiplyScalar(o).add(c.clone().multiplyScalar(e)).add(h.clone().multiplyScalar(t)).normalize();
}
function computeBestFitPlane(o) {
  if (o.length < 3)
    throw new Error("At least three points are required to define a plane.");
  const e = new THREE.Vector3(0, 0, 0);
  o.forEach((m) => {
    e.add(m);
  }), e.divideScalar(o.length);
  let t = 0, s = 0, i = 0, n = 0, r = 0, a = 0;
  o.forEach((m) => {
    const g = m.x - e.x, y = m.y - e.y, f = m.z - e.z;
    t += g * g, s += g * y, i += g * f, n += y * y, r += y * f, a += f * f;
  });
  const l = [
    [t, s, i],
    [s, n, r],
    [i, r, a]
  ], { eigenvalues: c, eigenvectors: h } = computeEigenvaluesAndEigenvectors(l), d = c.findIndex((m) => m === Math.min(...c)), u = h[d];
  return { normal: new THREE.Vector3(...u).normalize(), point: e };
}
function extractSliceArbitrary(o, e, t, s, i, n, r) {
  const a = computePlaneUnitCellIntersections(t, s, i, n);
  if (a.length < 3)
    return null;
  const l = computePlaneBasis(i), c = a.map((S) => {
    const M = S.clone().sub(n), E = M.dot(l.u), v = M.dot(l.v);
    return new THREE.Vector2(E, v);
  }), h = computeConvexHull(c);
  let d = 1 / 0, u = 1 / 0, p = -1 / 0, m = -1 / 0;
  h.forEach((S) => {
    S.x < d && (d = S.x), S.y < u && (u = S.y), S.x > p && (p = S.x), S.y > m && (m = S.y);
  });
  const [g, y, f] = e, w = Math.ceil((p - d) / r) + 1, b = Math.ceil((m - u) / r) + 1, x = [];
  for (let S = 0; S < b; S++) {
    const M = [];
    for (let E = 0; E < w; E++) {
      const v = d + E * r, C = u + S * r, A = new THREE.Vector2(v, C);
      let _ = 0;
      if (pointInPolygon(A, h)) {
        const j = n.clone().add(l.u.clone().multiplyScalar(v)).add(l.v.clone().multiplyScalar(C)).clone().sub(s), R = cellToGridCoordinates(j, t, e);
        _ = trilinearInterpolation(o, R, e);
      }
      M.push(_);
    }
    x.push(M);
  }
  return { sliceData: x, width: w, height: b, minX: d, maxX: p, minY: u, maxY: m, projectedPoints: h };
}
function cellToGridCoordinates(o, e, t) {
  const s = new THREE.Vector3(...e[0]), i = new THREE.Vector3(...e[1]), n = new THREE.Vector3(...e[2]), r = new THREE.Matrix3();
  r.set(s.x, i.x, n.x, s.y, i.y, n.y, s.z, i.z, n.z);
  const a = r.clone().invert(), l = o.clone().applyMatrix3(a), c = l.x * t[0], h = l.y * t[1], d = l.z * t[2];
  return { x: c, y: h, z: d };
}
function trilinearInterpolation(o, e, t) {
  const { x: s, y: i, z: n } = e, r = Math.floor(s), a = r + 1, l = Math.floor(i), c = l + 1, h = Math.floor(n), d = h + 1, u = s - r, p = i - l, m = n - h, g = getDataValue(o, r, l, h, t), y = getDataValue(o, a, l, h, t), f = getDataValue(o, r, c, h, t), w = getDataValue(o, r, l, d, t), b = getDataValue(o, a, l, d, t), x = getDataValue(o, r, c, d, t), S = getDataValue(o, a, c, h, t), M = getDataValue(o, a, c, d, t), E = g * (1 - u) + y * u, v = w * (1 - u) + b * u, C = f * (1 - u) + S * u, A = x * (1 - u) + M * u, _ = E * (1 - p) + C * p, L = v * (1 - p) + A * p;
  return _ * (1 - m) + L * m;
}
function getDataValue(o, e, t, s, i) {
  const [n, r, a] = i;
  if (e < 0 || e >= n || t < 0 || t >= r || s < 0 || s >= a)
    return 0;
  const l = (e * r + t) * a + s;
  return o[l];
}
function createTextureFromSlice(o, e, t, s) {
  const i = o[0].length, n = o.length, r = new Uint8Array(i * n * 4), a = getColorMapFunction(s);
  let l = 0;
  for (let h = 0; h < n; h++)
    for (let d = 0; d < i; d++) {
      const p = (o[h][d] - e) / (t - e), [m, g, y] = a(p);
      r[l++] = m * 255, r[l++] = g * 255, r[l++] = y * 255, r[l++] = 255;
    }
  const c = new THREE.DataTexture(r, i, n, THREE.RGBAFormat);
  return c.needsUpdate = !0, c.minFilter = THREE.LinearFilter, c.magFilter = THREE.LinearFilter, c;
}
function createSlicePlaneArbitrary(o, e, t, s, i, n, r, a, l) {
  const c = computePlaneBasis(e), h = new THREE.Shape(o), d = new THREE.ShapeGeometry(h);
  d.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(d.attributes.position.count * 2), 2));
  for (let w = 0; w < d.attributes.position.count; w++) {
    const b = d.attributes.position.getX(w), x = d.attributes.position.getY(w), S = (b - n) / (r - n), M = (x - a) / (l - a);
    d.attributes.uv.setXY(w, S, M);
  }
  const u = new THREE.Matrix4(), p = c.u, m = c.v, g = e;
  u.makeBasis(p, m, g), u.setPosition(t), d.applyMatrix4(u);
  const y = new THREE.MeshBasicMaterial({
    map: s,
    side: THREE.DoubleSide,
    transparent: i < 1,
    opacity: i
  });
  return new THREE.Mesh(d, y);
}
function getColorMapFunction(o) {
  return o === "grayscale" ? function(e) {
    return [e, e, e];
  } : o === "viridis" ? function(e) {
    return e = Math.max(0, Math.min(1, e)), viridisColorMap(e);
  } : function(e) {
    return [e, e, e];
  };
}
function viridisColorMap(o) {
  const e = [
    [0.267004, 4874e-6, 0.329415],
    [0.282327, 0.094955, 0.417331],
    [0.253935, 0.265254, 0.529983],
    [0.206756, 0.371758, 0.553117],
    [0.163625, 0.471133, 0.558148],
    [0.127568, 0.566949, 0.550556],
    [0.134692, 0.658636, 0.517649],
    [0.266941, 0.748751, 0.440573],
    [0.477504, 0.821444, 0.318195],
    [0.741388, 0.873449, 0.149561],
    [0.993248, 0.906157, 0.143936]
  ], t = e.length - 1, s = Math.floor(o * t), i = o * t - s, n = e[s], r = e[Math.min(s + 1, t)];
  return [n[0] + (r[0] - n[0]) * i, n[1] + (r[1] - n[1]) * i, n[2] + (r[2] - n[2]) * i];
}
function getUnitCellVertices(o, e) {
  const t = new THREE.Vector3(...o[0]), s = new THREE.Vector3(...o[1]), i = new THREE.Vector3(...o[2]), n = e.clone(), r = e.clone().add(t), a = e.clone().add(s), l = e.clone().add(i), c = e.clone().add(t).add(s), h = e.clone().add(t).add(i), d = e.clone().add(s).add(i), u = e.clone().add(t).add(s).add(i);
  return [n, r, a, l, c, h, d, u];
}
function getUnitCellEdges(o) {
  const [e, t, s, i, n, r, a, l] = o;
  return [
    [e, t],
    [e, s],
    [e, i],
    [t, n],
    [t, r],
    [s, n],
    [s, a],
    [i, r],
    [i, a],
    [n, l],
    [r, l],
    [a, l]
  ];
}
function computeLinePlaneIntersection(o, e, t, s) {
  const i = e.clone().sub(o), n = t.dot(i), r = t.dot(s.clone().sub(o));
  if (Math.abs(n) < 1e-6)
    return Math.abs(r) < 1e-6 ? [o.clone(), e.clone()] : null;
  {
    const a = r / n;
    return a < 0 || a > 1 ? null : o.clone().add(i.multiplyScalar(a));
  }
}
function computePlaneUnitCellIntersections(o, e, t, s) {
  const i = getUnitCellVertices(o, e), n = getUnitCellEdges(i), r = [];
  for (let c = 0; c < n.length; c++) {
    const [h, d] = n[c], u = computeLinePlaneIntersection(h, d, t, s);
    u && (Array.isArray(u) ? r.push(...u) : r.push(u));
  }
  const a = [], l = 1e-6;
  return r.forEach((c) => {
    a.some((d) => d.distanceToSquared(c) < l * l) || a.push(c);
  }), a;
}
function computePlaneBasis(o) {
  let e = new THREE.Vector3();
  Math.abs(o.z) > Math.abs(o.x) ? e.set(1, 0, 0).cross(o).normalize() : e.set(0, 0, 1).cross(o).normalize();
  const t = o.clone().cross(e).normalize();
  return { u: e, v: t };
}
function pointInPolygon(o, e) {
  let t = 0;
  const s = e.length;
  for (let i = 0; i < s; i++) {
    const n = e[i], r = e[(i + 1) % s];
    n.y <= o.y ? r.y > o.y && isLeft(n, r, o) > 0 && t++ : r.y <= o.y && isLeft(n, r, o) < 0 && t--;
  }
  return t !== 0;
}
function isLeft(o, e, t) {
  return (e.x - o.x) * (t.y - o.y) - (t.x - o.x) * (e.y - o.y);
}
function computeConvexHull(o) {
  o.sort((s, i) => s.x - i.x || s.y - i.y);
  const e = [];
  for (let s of o) {
    for (; e.length >= 2 && cross(e[e.length - 2], e[e.length - 1], s) <= 0; )
      e.pop();
    e.push(s);
  }
  const t = [];
  for (let s = o.length - 1; s >= 0; s--) {
    const i = o[s];
    for (; t.length >= 2 && cross(t[t.length - 2], t[t.length - 1], i) <= 0; )
      t.pop();
    t.push(i);
  }
  return e.pop(), t.pop(), e.concat(t);
}
function cross(o, e, t) {
  return (e.x - o.x) * (t.y - o.y) - (e.y - o.y) * (t.x - o.x);
}
function computeEigenvaluesAndEigenvectors(o) {
  let s = o.map((a) => a.slice());
  const i = s.length;
  let n = Array.from({ length: i }, (a, l) => Array.from({ length: i }, (c, h) => l === h ? 1 : 0));
  for (let a = 0; a < 100; a++) {
    let l = 0, c = 0, h = 0;
    for (let f = 0; f < i; f++)
      for (let w = f + 1; w < i; w++)
        Math.abs(s[f][w]) > Math.abs(l) && (l = s[f][w], c = f, h = w);
    if (Math.abs(l) < 1e-10)
      break;
    const d = 0.5 * Math.atan2(2 * l, s[c][c] - s[h][h]), u = Math.cos(d), p = Math.sin(d), m = u * u * s[c][c] - 2 * p * u * s[c][h] + p * p * s[h][h], g = p * p * s[c][c] + 2 * p * u * s[c][h] + u * u * s[h][h], y = 0;
    for (let f = 0; f < i; f++)
      if (f !== c && f !== h) {
        const w = u * s[c][f] - p * s[h][f], b = p * s[c][f] + u * s[h][f];
        s[c][f] = w, s[f][c] = w, s[h][f] = b, s[f][h] = b;
      }
    s[c][c] = m, s[h][h] = g, s[c][h] = y, s[h][c] = y;
    for (let f = 0; f < i; f++) {
      const w = u * n[f][c] - p * n[f][h], b = p * n[f][c] + u * n[f][h];
      n[f][c] = w, n[f][h] = b;
    }
  }
  return { eigenvalues: s.map((a, l) => a[l]), eigenvectors: n };
}
let Setting$2 = class {
  constructor({ origins: e = [], vectors: t = [], factor: s = 1, color: i = "#3d82ed", radius: n = 0.05, centerOnAtoms: r = !1 }) {
    this.origins = e, this.vectors = t, this.color = convertColor$1(i), this.radius = n, this.factor = s, this.centerOnAtoms = r;
  }
};
class VectorField {
  constructor(e) {
    this.viewer = e, this.scene = this.viewer.tjs.scene, this.shapeRegistry = this.viewer.weas.shapeRegistry, this._show = !0, this.init();
    const t = this.viewer.state.get("plugins.vectorField");
    t && (t.settings && this.applySettings(t.settings), t.show !== void 0 && (this.show = t.show)), this.viewer.state.subscribe("plugins.vectorField", (s) => {
      s && (s.settings && this.applySettings(s.settings), s.show !== void 0 && (this.show = s.show), this.drawVectorFields());
    });
  }
  get show() {
    return this._show;
  }
  set show(e) {
    this._show = e, Object.values(this.meshes).forEach((t) => {
      Object.values(t).forEach((s) => {
        s.visible = e;
      });
    }), this.viewer.requestRedraw?.("render");
  }
  init() {
    if (this.settings = {}, this.meshes = {}, this.viewer.logger.debug("init VectorField"), this.viewer.atoms.attributes.atom.moment === void 0)
      return;
    let e = [], t = [], s = [], i = [];
    for (let n = 0; n < this.viewer.atoms.getAtomsCount(); n++)
      if (this.viewer.atoms.attributes.atom.moment[n] > 0) {
        const r = [0, 0, this.viewer.atoms.attributes.atom.moment[n] * 1.5], a = this.viewer.atoms.positions[n].map((l, c) => l - r[c] / 2);
        e.push(a), t.push(r);
      } else {
        const r = [0, 0, this.viewer.atoms.attributes.atom.moment[n] * 1.5], a = this.viewer.atoms.positions[n].map((l, c) => l - r[c] / 2);
        s.push(a), i.push(r);
      }
    this.addSetting("up", { origins: e, vectors: t, color: "#3d82ed" }), this.addSetting("down", { origins: s, vectors: i, color: "#ff0000" });
  }
  setSettings(e) {
    this.viewer.state.set({ plugins: { vectorField: { settings: cloneValue(e) } } });
  }
  applySettings(e) {
    this.settings = [], this.clearMeshes(), Object.entries(e).forEach(([t, s]) => {
      this.addSetting(t, s);
    });
  }
  // Modify addSetting to accept a single object parameter
  addSetting(e, { origins: t, vectors: s, factor: i = 1, color: n = "#3d82ed", radius: r = 0.05, centerOnAtoms: a = !1 }) {
    if (typeof t == "string" && !this.viewer.atoms.getAttribute(t))
      throw new Error(`Attribute '${t}' is not defined. The available attributes are: ${Object.keys(this.viewer.atoms.attributes.atom)}`);
    const l = new Setting$2({ origins: t, vectors: s, factor: i, color: n, radius: r, centerOnAtoms: a });
    e === void 0 && (e = "vf-" + Object.keys(this.settings).length), this.settings[e] = l;
  }
  clearMeshes() {
    Object.values(this.meshes).forEach((e) => {
      Object.values(e).forEach((t) => {
        clearObject(this.scene, t);
      });
    }), this.meshes = {};
  }
  getData(e) {
    let t, s;
    return typeof e.origins == "string" ? t = this.viewer.atoms.getAttribute(e.origins) : t = e.origins, typeof e.vectors == "string" ? s = this.viewer.atoms.getAttribute(e.vectors) : s = e.vectors, [t, s];
  }
  // simple method that just loops over all vectors and renders an arrow for them
  drawVectorFields() {
    this.viewer.logger.debug("drawVectorFields"), this.clearMeshes(), Object.entries(this.settings).forEach(([e, t]) => {
      const [s, i] = this.getData(t), n = drawAtomArrows({
        length: i.length,
        color: t.color,
        materialType: "Standard",
        shapeRegistry: this.shapeRegistry
      });
      n.visible = this.show, this.scene.add(n), this.meshes[e] = { arrow: n };
    }), this.updateArrowMesh(), this.viewer.requestRedraw?.("render");
  }
  updateArrowMesh(e = null, t = null) {
    t === null && (t = this.viewer.atoms), Object.entries(this.settings).forEach(([s, i]) => {
      const [n, r] = this.getData(i), a = this.meshes[s].arrow;
      if (!a) return;
      const l = n.length;
      (e !== null ? [e] : [...Array(l).keys()]).forEach((h) => {
        const d = new THREE.Vector3(...n[h]), u = new THREE.Vector3(...r[h]).multiplyScalar(
          i.factor
        ), p = d.clone().add(u), m = new THREE.Vector3().lerpVectors(d, p, 0), g = calculateQuaternion(d, p), y = new THREE.Vector3(
          10 * i.radius,
          d.distanceTo(p),
          10 * i.radius
        ), f = new THREE.Matrix4().compose(m, g, y);
        a.setMatrixAt(h, f);
      }), a.instanceMatrix.needsUpdate = !0;
    });
  }
}
function drawAtomArrows({
  length: o = 0,
  color: e = 0,
  materialType: t = "Standard",
  shapeRegistry: s
}) {
  const i = s.create("Arrow", { materialType: t });
  if (!(i instanceof THREE.Mesh))
    throw new Error("Arrow must return a THREE.Mesh");
  const n = i.geometry.clone(), r = i.material.clone();
  r.color.set(e);
  const a = new THREE.InstancedMesh(n, r, o);
  return a.userData.type = "arrow", a;
}
let Setting$1 = class {
  constructor({ indices: e = [], color: t = "black", fontSize: s = 16 }) {
    this.indices = e, this.color = t, this.fontSize = s;
  }
  toDict() {
    return {
      indices: this.indices,
      color: this.color,
      fontSize: this.fontSize
    };
  }
};
class Measurement {
  constructor(e) {
    this.viewer = e, this.scene = this.viewer.tjs.scene, this.settings = {}, this.meshes = {};
    const t = this.viewer.state.get("plugins.measurement");
    t && t.settings && (this.applySettings(t.settings), this.drawMeasurements()), this.viewer.state.subscribe("plugins.measurement", (s) => {
      if (s && !this.viewer._initializingState) {
        if (!s.settings) {
          this.reset();
          return;
        }
        this.applySettings(s.settings), this.drawMeasurements();
      }
    });
  }
  reset() {
    this.clearMeshes(), this.settings = {}, this.viewer.requestRedraw?.("render");
  }
  measure(e = null) {
    const t = Array.isArray(e) ? e : [];
    if (t.length === 0)
      this.viewer.state.set({ plugins: { measurement: { settings: null } } });
    else {
      const s = { ...this.viewer.state.get("plugins.measurement")?.settings || {} }, i = `measurement-${Object.keys(s).length}`, n = new Setting$1({ indices: t });
      s[i] = n.toDict(), this.viewer.state.set({ plugins: { measurement: { settings: s } } });
    }
  }
  setSettings(e) {
    this.viewer.state.set({ plugins: { measurement: { settings: cloneValue(e) } } });
  }
  applySettings(e) {
    this.settings = {}, this.clearMeshes(), Object.entries(e).forEach(([t, s]) => {
      this.addSetting(t, s);
    });
  }
  drawMeasurements() {
    this.clearMeshes(), Object.entries(this.settings).forEach(([e, t]) => {
      this.drawMeasurement(e, t);
    });
  }
  drawMeasurement(e, t) {
    const s = t.indices;
    s.length === 1 ? this.showPosition(e, s) : s.length === 2 ? this.showDistance(e, s) : s.length === 3 ? this.showAngle(e, s) : s.length === 4 && this.showDihedralAngle(e, s), this.viewer.requestRedraw?.("render");
  }
  showPosition(e, t) {
    const s = t[0], i = this.viewer.atoms.positions[s], r = `${this.viewer.atoms.symbols[s]} [${i[0].toFixed(3)}, ${i[1].toFixed(3)}, ${i[2].toFixed(3)}]`, a = createLabel(new THREE.Vector3(...i).add(new THREE.Vector3(1, 0, 0)), r, "black", "18px");
    this.scene.add(a), this.meshes[e] = [a];
  }
  showDistance(e, t) {
    const s = new THREE.Vector3(...this.viewer.atoms.positions[t[0]]), i = new THREE.Vector3(...this.viewer.atoms.positions[t[1]]), n = s.distanceTo(i), r = [s, i], a = new THREE.LineBasicMaterial({ color: 255 }), l = new THREE.BufferGeometry().setFromPoints(r), c = new THREE.LineSegments(l, a);
    this.scene.add(c);
    const h = createLabel(s.add(i).multiplyScalar(0.5), n.toFixed(3), "black", "18px");
    this.scene.add(h), this.meshes[e] = [c, h];
  }
  showAngle(e, t) {
    const s = new THREE.Vector3(...this.viewer.atoms.positions[t[0]]), i = new THREE.Vector3(...this.viewer.atoms.positions[t[1]]), n = new THREE.Vector3(...this.viewer.atoms.positions[t[2]]), r = s.clone().sub(i).normalize(), a = n.clone().sub(i).normalize(), l = r.angleTo(a) * 180 / Math.PI, c = new THREE.LineBasicMaterial({ color: 255 }), h = new THREE.BufferGeometry().setFromPoints([s, i]), d = new THREE.LineSegments(h, c);
    this.scene.add(d);
    const u = new THREE.BufferGeometry().setFromPoints([i, n]), p = new THREE.LineSegments(u, c);
    this.scene.add(p);
    const m = i.add(r.add(a).multiplyScalar(0.3)), g = createLabel(m, l.toFixed(3), "black", "18px");
    this.scene.add(g), this.meshes[e] = [d, p, g];
  }
  showDihedralAngle(e, t) {
    const s = new THREE.Vector3(...this.viewer.atoms.positions[t[0]]), i = new THREE.Vector3(...this.viewer.atoms.positions[t[1]]), n = new THREE.Vector3(...this.viewer.atoms.positions[t[2]]), r = new THREE.Vector3(...this.viewer.atoms.positions[t[3]]), a = s.clone().sub(i).normalize(), l = n.clone().sub(i).normalize(), c = r.clone().sub(n).normalize(), h = a.clone().cross(l).normalize(), d = l.clone().cross(c).normalize(), u = Math.acos(h.dot(d)), p = new THREE.BufferGeometry(), m = [];
    m.push(s.x, s.y, s.z), m.push(i.x, i.y, i.z), m.push(n.x, n.y, n.z), m.push(i.x, i.y, i.z), m.push(n.x, n.y, n.z), m.push(r.x, r.y, r.z), p.setAttribute("position", new THREE.Float32BufferAttribute(m, 3)), p.setIndex([0, 1, 2, 3, 4, 5]);
    const g = new THREE.MeshBasicMaterial({
      color: 255,
      opacity: 0.9,
      side: THREE.DoubleSide,
      // Render both sides
      transparent: !0
    }), y = new THREE.Mesh(p, g);
    this.scene.add(y);
    const f = i.add(n).multiplyScalar(0.3).sub(h.add(d).multiplyScalar(0.3)), w = createLabel(f, u.toFixed(3), "black", "18px");
    this.scene.add(w), this.meshes[e] = [y, w];
  }
  clearMeshes() {
    Object.entries(this.meshes).forEach(([e, t]) => {
      t.forEach((s) => {
        this.scene.remove(s);
      });
    }), this.meshes = {};
  }
  addSetting(e, { indices: t = [], color: s = "black", fontSize: i = 16 }) {
    this.settings[e] = new Setting$1({ indices: t, color: s, fontSize: i });
  }
  toPlainSettings() {
    const e = {};
    return Object.entries(this.settings).forEach(([t, s]) => {
      e[t] = s instanceof Setting$1 ? { indices: s.indices, color: s.color, fontSize: s.fontSize } : s;
    }), e;
  }
}
class Setting {
  constructor({ indices: e, scale: t = 1.1, type: s = "sphere", color: i = "yellow", opacity: n = 0.6 }) {
    this.indices = e, this.color = convertColor$1(i), this.scale = t, this.type = s, this.opacity = n;
  }
  toDict() {
    return {
      indices: this.indices,
      color: this.color,
      scale: this.scale,
      type: this.type,
      opacity: this.opacity
    };
  }
}
class HighlightManager {
  constructor(e) {
    this.viewer = e, this.settings = {}, this.meshes = {}, this._tmpCenter = new THREE.Vector3(), this._tmpBillboardScale = new THREE.Vector3(), this._tmpBillboardScale2 = new THREE.Vector3(), this._tmpBillboardMatrix = new THREE.Matrix4(), this._tmpBillboardQuat = new THREE.Quaternion(), this._tmpBillboardZero = new THREE.Vector3(0, 0, 0), this._tmpBillboardAtomMatrix = new THREE.Matrix4(), this._tmpDecomposeQuat = new THREE.Quaternion(), this._tmpCameraDir = new THREE.Vector3(), this._tmpCameraPos = new THREE.Vector3(), this._tmpToCameraDir = new THREE.Vector3(), this._crossViewThicknessDefault = 0.05, this._crossViewSettings = {}, this._crossViewIndices = /* @__PURE__ */ new Set(), this._crossViewNeedsUpdate = !1, this._cameraSignature = new Float32Array(32), this._hasCameraSignature = !1, this.init();
    const t = this.viewer.state.get("plugins.highlight");
    t && t.settings && (this.applySettings(t.settings), this.drawHighlightAtoms()), this.viewer.state.subscribe("plugins.highlight", (s) => {
      !s || !s.settings || (this.applySettings(s.settings), !this.viewer._initializingState && this.drawHighlightAtoms());
    });
  }
  init() {
    this.viewer.logger.debug("init highlight settings"), this.settings = {
      selection: new Setting({ indices: [], scale: 1.1, color: "#ffff00" })
    };
  }
  setSettings(e) {
    this.viewer.state.set({ plugins: { highlight: { settings: cloneValue(e) } } });
  }
  applySettings(e) {
    this.settings = {}, this.clearMeshes(), this._crossViewSettings = {}, this._crossViewIndices = /* @__PURE__ */ new Set(), this._crossViewNeedsUpdate = !1, Object.entries(e).forEach(([t, s]) => {
      this.addSetting(t, s);
    });
  }
  addSetting(e, { indices: t, scale: s = 1.1, type: i = "sphere", color: n = "#3d82ed", opacity: r = 0.6 }) {
    const a = new Setting({ indices: t, scale: s, type: i, color: n, opacity: r });
    this.settings[e] = a;
  }
  toPlainSettings() {
    const e = {};
    return Object.entries(this.settings).forEach(([t, s]) => {
      e[t] = s && typeof s.toDict == "function" ? s.toDict() : s;
    }), e;
  }
  clearMeshes() {
    Object.values(this.meshes).forEach((e) => {
      e.parent && e.parent.remove(e);
    }), this.meshes = {};
  }
  drawHighlightAtoms() {
    if (this.clearMeshes(), !this.viewer.atomManager.meshes.atom)
      return;
    const t = new THREE.MeshBasicMaterial({
      color: "yellow",
      opacity: 0.6,
      transparent: !0
    });
    t.depthWrite = !1, t.depthTest = !0;
    const s = new THREE.SphereGeometry(1, 16, 16);
    this.drawHighlightMesh("sphere", s, t);
    const i = t.clone();
    i.color = "green";
    const n = new THREE.BoxGeometry(2, 2, 2);
    this.drawHighlightMesh("box", n, i);
    const r = new THREE.MeshBasicMaterial({
      color: 16777215,
      opacity: 1,
      transparent: !0,
      vertexColors: !0
    }), a = this.createCrossGeometry(1);
    this.drawHighlightMesh("cross", a, r);
    const l = new THREE.MeshBasicMaterial({
      color: 16777215,
      opacity: 1,
      transparent: !0,
      side: THREE.DoubleSide,
      depthWrite: !1,
      vertexColors: !0
    }), c = this.createCrossBillboardBarGeometry(), h = c.clone();
    h.rotateZ(Math.PI / 2), this.drawHighlightMesh("crossViewX", c, l), this.drawHighlightMesh("crossViewY", h, l), this.viewer.requestRedraw?.("render");
  }
  drawHighlightMesh(e, t, s) {
    const i = this.viewer.atomManager.meshes.atom;
    if (!i)
      return;
    const n = new THREE.InstancedMesh(t, s, i.count), r = new THREE.Vector3(), a = new THREE.Quaternion(), l = new THREE.Vector3(), c = new THREE.Matrix4(), h = new THREE.Matrix4();
    for (let d = 0; d < i.count; d++)
      i.getMatrixAt(d, c), c.decompose(r, a, l), l.multiplyScalar(0), h.compose(r, a, l), n.setMatrixAt(d, h);
    n.instanceMatrix.needsUpdate = !0, i.add(n), n.layers.set(1), this.meshes[e] = n, Object.values(this.settings).forEach((d) => {
      this.updateHighlightAtomsMesh(d);
    });
  }
  createCrossGeometry(e = 1) {
    const t = new THREE.TorusGeometry(e, 0.1, 16, 20), s = new THREE.TorusGeometry(e, 0.1, 16, 20);
    s.rotateX(Math.PI / 2);
    const i = new THREE.TorusGeometry(e, 0.1, 16, 20);
    return i.rotateY(Math.PI / 2), mergeGeometries([t, s, i]);
  }
  createCrossBillboardBarGeometry() {
    return new THREE.PlaneGeometry(2, 1);
  }
  updateHighlightAtomsMesh({ indices: e = [], scale: t = 1.1, color: s = "yellow", type: i = "sphere", opacity: n = null, occlude: r = !0, offset: a = 1.0005, thickness: l = null }, c = null) {
    if (i === "crossView") {
      const h = c || "crossView";
      this._crossViewSettings[h] = { indices: e, scale: t, color: s, occlude: r, offset: a, thickness: l }, this.updateCrossViewMaterialOcclusion(), this._crossViewNeedsUpdate = !0;
      return;
    }
    if (this.viewer.atoms.symbols.length > 0 && this.meshes[i]) {
      if (n != null) {
        const p = this.meshes[i].material;
        p && (p.transparent = !0, p.opacity = n, p.needsUpdate = !0);
      }
      const h = new THREE.Vector3(), d = new THREE.Quaternion(), u = new THREE.Vector3();
      e.forEach((p) => {
        const m = new THREE.Matrix4();
        this.viewer.atomManager.meshes.atom.getMatrixAt(p, m), m.decompose(h, d, u), u.multiplyScalar(t), m.compose(h, d, u), this.meshes[i].setMatrixAt(p, m), this.meshes[i].setColorAt(p, convertColor$1(s));
      }), this.meshes[i].instanceMatrix.needsUpdate = !0;
    }
  }
  updateLabelSizes(e = null, t = null) {
    const s = e || this.viewer?.tjs?.camera, i = t || this.viewer?.tjs?.renderers?.MainRenderer?.renderer;
    if (!s || !i)
      return;
    s.updateMatrixWorld(!0);
    const n = this.viewer.atomManager?.meshes?.atom;
    n && typeof n.updateMatrixWorld == "function" && n.updateMatrixWorld(!0);
    const r = this._cameraChanged(s);
    (this._crossViewNeedsUpdate || r) && (this.updateCrossViewInstances(s), this._crossViewNeedsUpdate = !1);
  }
  updateCrossViewInstances(e) {
    const t = this.meshes.crossViewX, s = this.meshes.crossViewY, i = this.viewer.atomManager?.meshes?.atom;
    if (!t || !s || !i || !e)
      return;
    e.getWorldQuaternion(this._tmpBillboardQuat), e.getWorldDirection(this._tmpCameraDir), e.getWorldPosition(this._tmpCameraPos);
    const n = /* @__PURE__ */ new Set();
    Object.values(this._crossViewSettings).forEach((r) => {
      const { indices: a = [], scale: l = 1.1, color: c = "yellow", offset: h = 1.0005, thickness: d = null } = r || {}, u = Number.isFinite(d) ? d : this._crossViewThicknessDefault;
      a.forEach((p) => {
        n.add(p), i.getMatrixAt(p, this._tmpBillboardAtomMatrix), this._tmpBillboardAtomMatrix.decompose(this._tmpCenter, this._tmpDecomposeQuat, this._tmpBillboardScale);
        const m = this._tmpBillboardScale.x || this._tmpBillboardScale.y || this._tmpBillboardScale.z || 1;
        this._tmpBillboardScale.set(m * l, u, 1), this._tmpBillboardScale2.set(u, m * l, 1), e.isOrthographicCamera ? this._tmpCenter.addScaledVector(this._tmpCameraDir, -m * h) : (this._tmpToCameraDir.copy(this._tmpCenter).sub(this._tmpCameraPos).normalize(), this._tmpCenter.addScaledVector(this._tmpToCameraDir, -m * h)), this._tmpBillboardMatrix.compose(this._tmpCenter, this._tmpBillboardQuat, this._tmpBillboardScale), t.setMatrixAt(p, this._tmpBillboardMatrix), t.setColorAt(p, convertColor$1(c)), this._tmpBillboardMatrix.compose(this._tmpCenter, this._tmpBillboardQuat, this._tmpBillboardScale2), s.setMatrixAt(p, this._tmpBillboardMatrix), s.setColorAt(p, convertColor$1(c));
      });
    }), this._crossViewIndices.forEach((r) => {
      n.has(r) || (i.getMatrixAt(r, this._tmpBillboardAtomMatrix), this._tmpBillboardAtomMatrix.decompose(this._tmpCenter, this._tmpDecomposeQuat, this._tmpBillboardScale), this._tmpBillboardMatrix.compose(this._tmpCenter, this._tmpBillboardQuat, this._tmpBillboardZero), t.setMatrixAt(r, this._tmpBillboardMatrix), s.setMatrixAt(r, this._tmpBillboardMatrix));
    }), this._crossViewIndices = n, t.instanceMatrix.needsUpdate = !0, s.instanceMatrix.needsUpdate = !0, t.instanceColor && (t.instanceColor.needsUpdate = !0), s.instanceColor && (s.instanceColor.needsUpdate = !0);
  }
  updateCrossViewMaterialOcclusion() {
    const e = this.meshes.crossViewX, t = this.meshes.crossViewY;
    if (!e || !e.material || !t || !t.material)
      return;
    const s = Object.values(this._crossViewSettings).some((i) => i?.occlude !== !1);
    e.material.depthTest = s, t.material.depthTest = s, e.material.needsUpdate = !0, t.material.needsUpdate = !0;
  }
  _cameraChanged(e) {
    const t = e.matrixWorld.elements, s = e.projectionMatrix.elements;
    let i = !1;
    for (let n = 0; n < 16; n++) {
      const r = t[n];
      (!this._hasCameraSignature || Math.abs(this._cameraSignature[n] - r) > 1e-6) && (i = !0), this._cameraSignature[n] = r;
    }
    for (let n = 0; n < 16; n++) {
      const r = s[n], a = 16 + n;
      (!this._hasCameraSignature || Math.abs(this._cameraSignature[a] - r) > 1e-6) && (i = !0), this._cameraSignature[a] = r;
    }
    return this._hasCameraSignature = !0, i;
  }
}
class AtomsLegend {
  constructor(e, t) {
    this.viewer = e, this.guiConfig = t, this.getLegendConfig().enabled && this.addLegend();
  }
  addLegend() {
    this.legendHUD || (this.legendHUD = this.viewer.tjs.hud.legendHUD);
    const e = this.viewer.atomManager.settings;
    Object.entries(e).forEach(([t, s]) => {
      const i = typeof s.color == "string" ? s.color : `#${s.color.getHexString()}`, n = `atoms:${t}`;
      this.legendHUD.addEntry(n, {
        label: t,
        color: i,
        shape: "sphere",
        size: this._radiusToLegendSize(s.radius)
      });
    });
  }
  removeLegend() {
    this.legendHUD || (this.legendHUD = this.viewer.tjs.hud.legendHUD), Array.from(this.legendHUD.entries.keys()).filter((e) => e.startsWith("atoms:")).forEach((e) => this.legendHUD.removeEntry(e));
  }
  updateLegend() {
    this.getLegendConfig().enabled ? (this.removeLegend(), this.addLegend()) : this.removeLegend();
  }
  getLegendConfig() {
    return this.guiConfig.atomLegend || this.guiConfig.legend || {
      enabled: !1
    };
  }
  _radiusToLegendSize(e) {
    return Math.min(30, Math.max(12, e * 24));
  }
}
class AtomsGUI {
  constructor(e, t, s) {
    this.viewer = e, this.gui = t, this.guiConfig = s, this.atomLegendConfig = this.getAtomLegendConfig(), this.isSyncing = !1, this.tempBoundary = this.viewer.boundary.map((i) => i.slice()), this.div = document.createElement("div"), this.viewer.tjs.containerElement.appendChild(this.div), this.viewer.tjs.containerElement.addEventListener("viewerUpdated", (i) => {
      this.updateViewerControl(i.detail);
    }), this.viewer.state.subscribe("cell", (i) => {
      i && (this.beginSync(), i.showCell !== void 0 && this.updateShowCell(i.showCell), i.showAxes !== void 0 && this.updateShowAxes(i.showAxes), this.endSync());
    }), this.guiConfig.controls.atomsControl && this.addAtomsControl(), this.guiConfig.controls.colorControl && this.addColorControl(), this.legend = new AtomsLegend(this.viewer, this.guiConfig);
  }
  beginSync() {
    this.isSyncing = !0;
  }
  endSync() {
    this.isSyncing = !1;
  }
  update(e) {
    this.guiConfig.timeline.enabled && e.length > 1 ? (this.addTimeline(), this.timeline.max = e.length - 1) : this.removeTimeline();
  }
  addAtomsControl() {
    const e = this.gui.addFolder("Atoms");
    this.modelStyleController = e.add({ modelStyle: this.viewer.modelStyle }, "modelStyle", MODEL_STYLE_MAP).onChange((l) => {
      this.isSyncing || this.viewer.weas.ops.isRestoring || this.viewer.setState({ modelStyle: l }, { record: !0, redraw: "full" });
    }).name("Model Style");
    const t = { radiusType: this.viewer.radiusType };
    this.radiusTypeController = e.add(t, "radiusType", radiusTypes).name("Radius Type").onChange((l) => {
      this.isSyncing || this.viewer.weas.ops.isRestoring || this.viewer.setState({ radiusType: l }, { record: !0, redraw: "full" });
    });
    const s = { atomLabelType: this.viewer.atomLabelType };
    this.atomLabelTypeController = e.add(s, "atomLabelType", ["None", "Symbol", "Index"]).onChange((l) => {
      this.isSyncing || this.viewer.weas.ops.isRestoring || this.viewer.setState({ atomLabelType: l }, { record: !0, redraw: "labels" });
    }).name("Atom Label");
    const i = { materialType: this.viewer.materialType };
    this.materialTypeController = e.add(i, "materialType", ["Standard", "Phong", "Basic"]).onChange((l) => {
      this.isSyncing || this.viewer.weas.ops.isRestoring || this.viewer.setState({ materialType: l }, { record: !0, redraw: "full" });
    }).name("Material Type");
    const n = { atomScale: this.viewer.atomScale };
    this.atomScaleController = e.add(n, "atomScale", 0.1, 2).name("Atom Scale").onChange((l) => {
      this.isSyncing || this.viewer.weas.ops.isRestoring || this.viewer.setState({ atomScale: l }, { record: !0, redraw: "render" });
    });
    const r = { showCell: this.viewer.cellManager.showCell };
    this.showCellController = e.add(r, "showCell").name("Unit Cell").onChange((l) => {
      this.isSyncing || this.viewer.weas.ops.isRestoring || this.viewer.weas.ops.settings.SetCellSettings({ showCell: l });
    });
    const a = { showAxes: this.viewer.cellManager.showAxes };
    this.showCellAxesController = e.add(a, "showAxes").name("Crystal Axes").onChange((l) => {
      this.isSyncing || this.viewer.weas.ops.isRestoring || this.viewer.weas.ops.settings.SetCellSettings({ showAxes: l });
    }), this.showBondedAtomsController = e.add({ showBondedAtoms: this.viewer.showBondedAtoms }, "showBondedAtoms").name("Bonded Atoms").onChange((l) => {
      this.isSyncing || this.viewer.weas.ops.isRestoring || this.viewer.setState({ showBondedAtoms: l }, { record: !0, redraw: "full" });
    }), this.legendToggleController = e.add(this.atomLegendConfig, "enabled").name("Show Legend").onChange((l) => {
      this.atomLegendConfig.enabled = l, this.updateLegend();
    }), this.addReplaceAtomControl(e), this.addAddAtomControl(e), this.addBoundaryControl(e);
  }
  addReplaceAtomControl(e) {
    const t = e.addFolder("Replace Atom"), s = { symbol: "C" };
    this.replaceAtomController = t.add(s, "symbol").name("New Element Symbol"), t.add(
      {
        replaceSelectedAtoms: () => {
          const i = s.symbol;
          if (this.viewer.selectedAtomsIndices && this.viewer.selectedAtomsIndices.length > 0) {
            const n = new ReplaceOperation({
              weas: this.viewer.weas,
              symbol: i
            });
            this.viewer.weas.ops.execute(n), this.viewer.weas.eventHandlers.dispatchAtomsUpdated();
          } else
            alert("No atoms selected for replacement.");
        }
      },
      "replaceSelectedAtoms"
    ).name("Replace Selected Atoms");
  }
  addAddAtomControl(e) {
    const t = e.addFolder("Add Atom"), s = { symbol: "C" };
    this.addAtomController = t.add(s, "symbol").name("New Element Symbol"), t.add(
      {
        addAtoms: () => {
          const i = new AddAtomOperation({
            weas: this.viewer.weas,
            symbol: s.symbol
          });
          this.viewer.weas.ops.execute(i), this.viewer.weas.eventHandlers.dispatchAtomsUpdated();
        }
      },
      "addAtoms"
    ).name("Add Selected Atoms");
  }
  addBoundaryControl(e) {
    const t = e.addFolder("Boundary");
    this.boundaryControllers = [[], [], []], ["X", "Y", "Z"].forEach((i, n) => {
      this.boundaryControllers[n].push(
        t.add({ [`min${i}`]: this.viewer.boundary[n][0] }, `min${i}`, -10, 10).onChange((r) => this.updateBoundaryValue(n, 0, r)).name(`Min ${i}`)
      ), this.boundaryControllers[n].push(
        t.add({ [`max${i}`]: this.viewer.boundary[n][1] }, `max${i}`, -10, 10).onChange((r) => this.updateBoundaryValue(n, 1, r)).name(`Max ${i}`)
      );
    }), t.add({ apply: () => this.applyBoundaryChanges() }, "apply").name("Apply Changes"), this.wrapOnMoveController = t.add({ wrapOnMove: this.viewer.wrapOnMove }, "wrapOnMove").name("Wrap On Move").onChange((i) => {
      this.isSyncing || this.viewer.weas.ops.isRestoring || this.viewer.setState({ wrapOnMove: i }, { record: !0, redraw: "none" });
    });
  }
  addColorControl() {
    const e = this.gui.addFolder("Color");
    this.backgroundColorController = e.addColor(this.viewer, "backgroundColor").name("Background").onChange((t) => {
      this.isSyncing || this.viewer.weas.ops.isRestoring || this.viewer.setState({ backgroundColor: t }, { record: !0, redraw: "render" });
    }), this.colorByController = e.add({ colorBy: this.viewer.colorBy }, "colorBy", colorBys).onChange((t) => {
      this.isSyncing || this.viewer.weas.ops.isRestoring || this.viewer.setState({ colorBy: t }, { record: !0, redraw: "full" });
    }).name("Color By"), this.colorTypeController = e.add({ colorType: this.viewer.colorType }, "colorType", colorTypes).onChange((t) => {
      this.isSyncing || this.viewer.weas.ops.isRestoring || this.viewer.setState({ colorType: t }, { record: !0, redraw: "full" });
    }).name("Color Type");
  }
  addTimeline() {
    if (this.div.querySelector("#animation-controls"))
      return;
    const e = document.createElement("div");
    e.id = "animation-controls", e.style.backgroundColor = "transparent";
    const t = (i) => {
      i.stopPropagation();
    };
    ["click", "pointerdown", "pointerup", "mousedown", "mouseup"].forEach((i) => {
      e.addEventListener(i, t);
    }), e.innerHTML = '<button id="play-pause-btn">Play</button><button id="reset-btn">Reset</button><input type="range" id="timeline" min="0" max="100" value="0"><span id="current-frame">0</span>', this.div.appendChild(e), this.playPauseBtn = this.div.querySelector("#play-pause-btn"), this.resetBtn = this.div.querySelector("#reset-btn"), this.timeline = this.div.querySelector("#timeline"), this.currentFrameDisplay = this.div.querySelector("#current-frame"), this.isPlaying = !1;
    const s = 100;
    this.timeline.max = s, this.playPauseBtn.addEventListener("click", () => {
      this.viewer.isPlaying = !this.viewer.isPlaying, this.playPauseBtn.textContent = this.viewer.isPlaying ? "Pause" : "Play", this.viewer.isPlaying && this.viewer.play();
    }), this.resetBtn.addEventListener("click", () => {
      this.viewer.currentFrame = 0;
    }), this.timeline.addEventListener("input", () => {
      this.viewer.weas.eventHandlers.isDragging & !this.viewer.continuousUpdate ? this.timelineIsDragging = !0 : (this.timelineIsDragging = !1, this.viewer.currentFrame = parseInt(this.timeline.value, 10));
    }), this.timeline.addEventListener("mouseup", () => {
      this.timelineIsDragging = !1, this.viewer.currentFrame = parseInt(this.timeline.value, 10);
    });
  }
  removeTimeline() {
    const e = this.div.querySelector("#animation-controls");
    e && e.remove();
  }
  updateBoundaryValue(e, t, s) {
    this.tempBoundary[e][t] = parseFloat(s);
  }
  applyBoundaryChanges() {
    this.isSyncing || this.viewer.weas.ops.isRestoring || this.viewer.setState({ boundary: this.tempBoundary }, { record: !0, redraw: "full" });
  }
  addLegend() {
    this.removeLegend();
    const e = document.createElement("div");
    e.id = "legend-container", e.style.position = "absolute", e.style.backgroundColor = "rgba(255, 255, 255, 0.8)", e.style.padding = "10px", e.style.borderRadius = "5px", e.style.zIndex = "1000", this.setLegendPosition(e), Object.entries(this.viewer.atomManager.settings).forEach(([t, s]) => {
      const i = document.createElement("div");
      i.style.display = "flex", i.style.alignItems = "center", i.style.marginBottom = "5px";
      const n = document.createElement("canvas");
      n.width = 20, n.height = 20;
      const r = n.getContext("2d");
      r.fillStyle = `#${s.color.getHexString()}`;
      const a = s.radius * 10;
      r.beginPath(), r.arc(10, 10, a, 0, Math.PI * 2), r.fill(), i.appendChild(n);
      const l = document.createElement("span");
      l.textContent = ` ${t}`, l.style.marginLeft = "5px", l.style.fontSize = "14px", i.appendChild(l), e.appendChild(i);
    }), this.viewer.tjs.containerElement.appendChild(e);
  }
  removeLegend() {
    const e = this.viewer.tjs.containerElement.querySelector("#legend-container");
    e && e.remove();
  }
  updateLegend() {
    this.legend.updateLegend();
  }
  getAtomLegendConfig() {
    return !this.guiConfig.atomLegend && this.guiConfig.legend && (this.guiConfig.atomLegend = this.guiConfig.legend), this.guiConfig.atomLegend || (this.guiConfig.atomLegend = { enabled: !1, position: "bottom-right" }), this.guiConfig.atomLegend;
  }
  setLegendPosition(e) {
    const t = this.getAtomLegendConfig().position || "top-right";
    e.style.top = t.includes("top") ? "10px" : "", e.style.bottom = t.includes("bottom") ? "10px" : "", e.style.left = t.includes("left") ? "10px" : "", e.style.right = t.includes("right") ? "10px" : "";
  }
  updateViewerControl(e) {
    this.isSyncing = !0, Object.entries(e).forEach(([t, s]) => {
      switch (t) {
        case "modelStyle":
          this.updateModelStyle(s);
          break;
        case "radiusType":
          this.updateRadiusType(s);
          break;
        case "atomLabelType":
          this.updateAtomLabelType(s);
          break;
        case "materialType":
          this.updateMaterialType(s);
          break;
        case "atomScale":
          this.updateAtomScale(s);
          break;
        case "showCell":
          this.updateShowCell(s);
          break;
        case "showBondedAtoms":
          this.updateShowBondedAtoms(s);
          break;
        case "colorBy":
          this.updateColorBy(s);
          break;
        case "colorType":
          this.updateColorType(s);
          break;
        case "backgroundColor":
          this.updateBackgroundColor(s);
          break;
        case "isPlaying":
          break;
        case "currentFrame":
          break;
        case "boundary":
          this.updateBoundary(s);
          break;
        case "wrapOnMove":
          this.updateWrapOnMove(s);
          break;
      }
    }), this.isSyncing = !1;
  }
  updateAtomScale(e) {
    this.atomScaleController && this.atomScaleController.getValue() !== e && this.atomScaleController.setValue(e);
  }
  updateAtomLabelType(e) {
    this.atomLabelTypeController && this.atomLabelTypeController.getValue() !== e && this.atomLabelTypeController.setValue(e);
  }
  updateMaterialType(e) {
    this.materialTypeController && this.materialTypeController.getValue() !== e && this.materialTypeController.setValue(e);
  }
  updateModelStyle(e) {
    this.modelStyleController && this.modelStyleController.getValue() !== e && this.modelStyleController.setValue(e);
  }
  updateRadiusType(e) {
    this.radiusTypeController && this.radiusTypeController.getValue() !== e && this.radiusTypeController.setValue(e);
  }
  updateShowBondedAtoms(e) {
    this.showBondedAtomsController && this.showBondedAtomsController.getValue() !== e && this.showBondedAtomsController.setValue(e);
  }
  updateShowCell(e) {
    this.showCellController && this.showCellController.getValue() !== e && this.showCellController.setValue(e);
  }
  updateShowAxes(e) {
    this.showCellAxesController && this.showCellAxesController.getValue() !== e && this.showCellAxesController.setValue(e);
  }
  updateColorBy(e) {
    this.colorByController && this.colorByController.getValue() !== e && this.colorByController.setValue(e);
  }
  updateColorType(e) {
    this.colorTypeController && this.colorTypeController.getValue() !== e && this.colorTypeController.setValue(e);
  }
  updateBackgroundColor(e) {
    this.backgroundColorController && this.backgroundColorController.getValue() !== e && this.backgroundColorController.setValue(e);
  }
  updateBoundary(e) {
    if (!(!this.boundaryControllers || !Array.isArray(e))) {
      this.tempBoundary = e.map((t) => t.slice());
      for (let t = 0; t < 3; t++)
        for (let s = 0; s < 2; s++) {
          const i = this.boundaryControllers[t][s];
          i && i.getValue() !== e[t][s] && i.setValue(e[t][s]);
        }
    }
  }
  updateWrapOnMove(e) {
    this.wrapOnMoveController && this.wrapOnMoveController.getValue() !== e && this.wrapOnMoveController.setValue(e);
  }
}
function vec_dot(o, e) {
  return o.reduce((t, s, i) => t + s * e[i], 0);
}
function complexPolar(o, e) {
  return {
    real: o * Math.cos(e),
    imag: o * Math.sin(e),
    mult(t) {
      return {
        real: this.real * t.real - this.imag * t.imag,
        imag: this.real * t.imag + this.imag * t.real
      };
    }
  };
}
class Phonon {
  constructor(e, t = null, s = null, i = !0) {
    this.atoms = e, this.kpoint = t, this.eigenvectors = s, this.addatomphase = i, this.vibrations = [];
  }
  // Compute initial phases and vibrations
  calculateVibrations(e = [1, 1, 1]) {
    const [t, s, i] = e, n = this.atoms.calculateFractionalCoordinates(), r = this.atoms.positions.length;
    let a = [];
    this.addatomphase ? a = n.map((l) => vec_dot(this.kpoint, l)) : a = new Array(r).fill(0);
    for (let l = 0; l < t; l++)
      for (let c = 0; c < s; c++)
        for (let h = 0; h < i; h++)
          for (let d = 0; d < r; d++) {
            let u = vec_dot(this.kpoint, [l, c, h]) + a[d], p = complexPolar(1, u * 2 * Math.PI);
            this.vibrations.push(this.eigenvectors[d].map((m) => p.mult({ real: m[0], imag: m[1] })));
          }
  }
  // Get the trajectory of the phonon mode
  getTrajectory(e, t, s = null, i = null, n = null, r = [1, 1, 1], a = null) {
    if (n && (this.atoms = n), s && (this.kpoint = s), i && (this.eigenvectors = i), this.kpoint === null || this.eigenvectors === null)
      throw new Error("kpoint and eigenvectors must be provided");
    a !== null && (this.addatomphase = a), this.calculateVibrations(r);
    const l = [];
    return Array.from({ length: t }, (h, d) => 2 * Math.PI * (d / t)).forEach((h) => {
      const d = this.atoms.multiply({ mx: r[0], my: r[1], mz: r[2] });
      let u = complexPolar(e, h);
      const p = [];
      for (let m = 0; m < d.positions.length; m++) {
        let g = this.vibrations[m].map((y) => u.mult(y).real);
        d.positions[m] = d.positions[m].map((y, f) => y + g[f] / 5), p.push(g);
      }
      d.newAttribute({ name: "movement", values: p }), l.push(d);
    }), l;
  }
}
class Logger {
  constructor(e = "warn") {
    this.level = e, this.levels = {
      none: 0,
      error: 1,
      warn: 2,
      info: 3,
      debug: 4
    }, this.timers = {};
  }
  getCallerInfo() {
    const t = new Error().stack.split(`
`)[4], s = t.match(/at (.*?) \((.*?):(\d+):(\d+)\)/) || t.match(/at (.*?):(\d+):(\d+)/);
    return s ? `${s[1]}` : "Unknown location";
  }
  log(e, ...t) {
    if (this.levels[this.level] >= this.levels[e]) {
      const s = this.getCallerInfo();
      console.log(`[${e.toUpperCase()}] [${s}]`, ...t);
    }
  }
  setLevel(e) {
    this.levels[e] !== void 0 && (this.level = e);
  }
  debug(...e) {
    this.log("debug", ...e);
  }
  info(...e) {
    this.log("info", ...e);
  }
  warn(...e) {
    this.log("warn", ...e);
  }
  error(...e) {
    this.log("error", ...e);
  }
  time(e) {
    this.levels[this.level] >= this.levels.info && (this.timers[e] = Date.now());
  }
  timeEnd(e) {
    if (this.levels[this.level] >= this.levels.info && this.timers[e] !== void 0) {
      const t = Date.now() - this.timers[e];
      console.info(`INFO: ${e}: ${t}ms`), delete this.timers[e];
    }
  }
}
class AtomsViewer {
  constructor({ weas: e, atoms: t = [new Atoms()], viewerConfig: s = {} }) {
    this.uuid = THREE.MathUtils.generateUUID(), this.weas = e, this.tjs = e.tjs, this.state = e.state;
    const i = { ...defaultViewerSettings, ...s };
    this._ready = !1, this._modelStyle = i.modelStyle, this._colorBy = i.colorBy, this._colorType = i.colorType, this._colorRamp = i.colorRamp, this._radiusType = i.radiusType, this._materialType = i.materialType, this._atomLabelType = i.atomLabelType, this._showBondedAtoms = i.showBondedAtoms, this._boundary = i.boundary, this._atomScale = i.atomScale, this._wrapOnMove = i.wrapOnMove, this._backgroundColor = i.backgroundColor, this.tjs.scene.background = new THREE.Color(this._backgroundColor), this._selectedAtomsIndices = new Array(), this.baseAtomLabelSettings = [], this.debug = i.debug, this._continuousUpdate = i.continuousUpdate, this._autoResetCameraOnAtomsUpdate = i.autoResetCameraOnAtomsUpdate, this._hasInitializedCamera = !1, this._currentFrame = 0, this._updateDepth = 0, this._pendingRedraw = null, this._syncingState = !1, this._initializingState = !1, this._atomScales = [], this._modelSticks = [], this._modelPolyhedras = [], this.logger = new Logger(i.logLevel || "warn"), this.trajectory = [new Atoms()], this.isPlaying = !1, this.frameDuration = 100, this.atomManager = new AtomManager(this), this.cellManager = new CellManager(this, i.cellSettings), this.highlightManager = new HighlightManager(this), this.guiManager = new AtomsGUI(this, this.weas.guiManager.gui, this.weas.guiManager.guiConfig), this.bondManager = new BondManager(this, i.bondSettings), this.boundaryManager = new BoundaryManager(this), this.polyhedraManager = new PolyhedraManager(this), this.isosurfaceManager = new Isosurface(this), this.fermiSurfaceManager = new FermiSurface(this), this.volumeSliceManager = new VolumeSlice(this), this.ALManager = new AtomLabelManager(this), this.Measurement = new Measurement(this), this.VFManager = new VectorField(this), this.animate = this.animate.bind(this), this._atoms = null, this._cell = null, this._frameSignature = null, this.init(t), this.initializeStateStore(i), this.setupStateSubscriptions();
  }
  initializeStateStore(e) {
    this.state.transaction(() => {
      this.state.set({
        viewer: {
          ...e,
          atomScales: this._atomScales,
          modelSticks: this._modelSticks,
          modelPolyhedras: this._modelPolyhedras,
          selectedAtomsIndices: []
        }
      }), e.cellSettings && this.state.set({ cell: { ...e.cellSettings } }), e.bondSettings && this.state.set({ bond: { ...e.bondSettings } });
    });
  }
  setupStateSubscriptions() {
    this.state.subscribe("viewer", (e, t) => {
      if (!e || this._syncingState || this._initializingState)
        return;
      const s = t || {}, i = {};
      Object.keys(e).forEach((n) => {
        JSON.stringify(e[n]) !== JSON.stringify(s[n]) && (i[n] = e[n]);
      }), Object.keys(i).length !== 0 && this.applyState(i, { redraw: "auto", skipStore: !0 });
    });
  }
  init(e) {
    this.volumetricData = null, this.fermiSurfaceData = null, this.lastFrameTime = Date.now(), this.selectedAtomsLabelElement = document.createElement("div"), this.selectedAtomsLabelElement.id = "selectedAtomSymbol", this.tjs.containerElement.appendChild(this.selectedAtomsLabelElement), this.updateAtoms(e), this.logger.debug("init AtomsViewer successfully");
  }
  setVolumetricData(e) {
    this.volumetricData = e, this.isosurfaceManager && this.isosurfaceManager.drawIsosurfaces(), this.volumeSliceManager && this.volumeSliceManager.drawSlices(), this.requestRedraw("render");
  }
  setFermiSurfaceData(e) {
    this.fermiSurfaceData = e, this.fermiSurfaceManager && this.fermiSurfaceManager.drawFermiSurfaces(), this.requestRedraw("render");
  }
  reset() {
    this.volumetricData = null, this.fermiSurfaceData = null, this.atomLabels = [], this.atomArrows = null, this.atomColors = new Array(), this._atomScales = new Array(), this._modelSticks = new Array(), this._modelPolyhedras = new Array(), this.boundary = [
      [0, 1],
      [0, 1],
      [0, 1]
    ], this.boundaryList = [], this.boundaryMap = {}, this._autoResetCameraOnAtomsUpdate && (this._hasInitializedCamera = !1);
  }
  play() {
    this.isPlaying = !0, this._syncAnimationState(), this.animate(), this.guiManager.timeline && (this.guiManager.playPauseBtn.textContent = "Pause");
  }
  pause() {
    this.isPlaying = !1, this._syncAnimationState(), this.guiManager.timeline && (this.guiManager.playPauseBtn.textContent = "Play");
  }
  animate() {
    const e = Date.now();
    this.isPlaying && this.trajectory.length > 0 && e - this.lastFrameTime > this.frameDuration && (this.currentFrame = (this.currentFrame + 1) % this.trajectory.length, this.lastFrameTime = e), this.isPlaying && requestAnimationFrame(this.animate);
  }
  updateFrame(e) {
    if (this.trajectory.length <= 1)
      return;
    const t = this.trajectory[e % this.trajectory.length];
    this.guiManager.timeline && (this.guiManager.timeline.value = e, this.guiManager.currentFrameDisplay.textContent = e);
    const s = this.getFrameSignature(t), i = this.atomManager.meshes.atom;
    if (!i || i.count !== t.getAtomsCount() || this._frameSignature !== s) {
      this._frameSignature = s, this.rebuildForFrame(t);
      return;
    }
    this.atomManager.updateAtomMesh(null, t), this.ALManager.updateLabelPositions(t), this.isPlaying ? (this.bondManager.updateBondMesh(null, t), this.polyhedraManager.updatePolyhedraMesh(null, t)) : this.drawModels(), this.VFManager.updateArrowMesh(null, t), this.cellManager.updateCellMesh(this.originalCell), this.updateAtomLabels(), Object.values(this.highlightManager.settings).forEach((n) => {
      this.highlightManager.updateHighlightAtomsMesh(n);
    });
  }
  get currentFrame() {
    return this._currentFrame;
  }
  set currentFrame(e) {
    this.currentFrame !== e && (this._currentFrame = e, this.lastFrameTime = Date.now(), this._syncAnimationState(), this.updateFrame(e), this.requestRedraw("render"));
  }
  _syncAnimationState() {
    this.state && this.state.set({
      animation: {
        currentFrame: this._currentFrame,
        isPlaying: this.isPlaying,
        frameDuration: this.frameDuration
      }
    });
  }
  get originalCell() {
    return this._cell ? this._cell : this.originalAtoms.cell;
  }
  get originalAtoms() {
    return this._atoms ? this._atoms : this.atoms;
  }
  get atoms() {
    const e = this.trajectory[this.currentFrame];
    return e.uuid = this.uuid, e;
  }
  set atoms(e) {
    this.ready = !1, this.dispose(), this.reset(), this.updateAtoms(e);
  }
  updateAtoms(e) {
    this._initializingState = !0;
    try {
      Array.isArray(e) && e.length > 1 ? this.trajectory = e : Array.isArray(e) && e.length === 1 ? this.trajectory = e : this.trajectory = [e], this._cell = null, this._atoms = null, this._currentFrame = 0, this._frameSignature = this.getFrameSignature(this.atoms), this.selectedAtomsIndices = [], this.cellManager.cell = this.atoms.cell, this.atomManager.init(), this.highlightManager.init(), this.bondManager.init(), this.state.transaction(() => {
        const t = this.state.get("plugins.highlight") || {};
        !t.settings || Object.keys(t.settings).length === 0 ? this.state.set({ plugins: { highlight: { settings: this.highlightManager.toPlainSettings() } } }) : this.highlightManager.applySettings(t.settings);
        const s = this.state.get("plugins.species") || {}, i = this.atomManager.toPlainSettings();
        if (s.settings && Object.keys(s.settings).length > 0) {
          const a = { ...i, ...s.settings };
          this.atomManager.applySettings(a), this.state.set({ plugins: { species: { settings: a } } });
        } else
          this.state.set({ plugins: { species: { settings: i } } });
        const n = this.state.get("bond") || {}, r = this.bondManager.toPlainSettings();
        if (n.settings && Object.keys(n.settings).length > 0) {
          const a = { ...r, ...n.settings };
          this.bondManager.applySettings(a), this.state.set({ bond: { settings: a } });
        } else
          this.state.set({ bond: { settings: r } });
      }), this.polyhedraManager.init(), this.state.transaction(() => {
        const t = this.state.get("plugins.polyhedra") || {};
        Array.isArray(t.settings) && t.settings.length > 0 ? this.polyhedraManager.applySettings(t.settings) : this.state.set({ plugins: { polyhedra: { settings: this.polyhedraManager.toPlainSettings() } } });
      }), this.VFManager.init(), this.isosurfaceManager.reset(), this.volumeSliceManager.reset(), this.Measurement.reset(), this.state.set({ plugins: { measurement: { settings: null } } }), this.guiManager.update(this.trajectory), this.guiManager.updateLegend(), this._syncingState = !0;
      try {
        const t = this.getStateModelArrays(this.atoms.getAtomsCount());
        t ? (this.atomScales = t.atomScales, this.modelSticks = t.modelSticks, this.modelPolyhedras = t.modelPolyhedras) : this.updateModelStyles(this._modelStyle), this.atomLabelType = this._atomLabelType;
      } finally {
        this._syncingState = !1;
      }
      this._syncingState = !0;
      try {
        this.state.set({
          viewer: {
            atomScales: this._atomScales,
            modelSticks: this._modelSticks,
            modelPolyhedras: this._modelPolyhedras
          }
        });
      } finally {
        this._syncingState = !1;
      }
      this.baseAtomLabelSettings = this.getAtomLabelSettingsFromType(this._atomLabelType), this.updateAtomLabels(), this.weas.textManager?.redraw?.(), this.drawModels(), (this._autoResetCameraOnAtomsUpdate || !this._hasInitializedCamera) && (this.tjs.updateCameraAndControls({ direction: [0, 0, 100] }), this.atoms && this.atoms.getAtomsCount() > 0 && (this._hasInitializedCamera = !0)), this.logger.debug("Set atoms successfullly");
    } finally {
      this._initializingState = !1;
    }
  }
  getStateModelArrays(e) {
    const t = this.state.get("viewer") || {}, { atomScales: s, modelSticks: i, modelPolyhedras: n } = t;
    return Array.isArray(s) && Array.isArray(i) && Array.isArray(n) && s.length === e && i.length === e && n.length === e ? {
      atomScales: s.slice(),
      modelSticks: i.slice(),
      modelPolyhedras: n.slice()
    } : null;
  }
  // set atoms from phonon trajectory
  fromPhononMode({ atoms: e, eigenvectors: t, amplitude: s = 1, factor: i = 1, nframes: n = 30, kpoint: r = [0, 0, 0], repeat: a = [1, 1, 1], color: l = "#ff0000", radius: c = 0.1 }) {
    this.logger.debug("--------------------------------------From Phonon Mode--------------------------------------");
    const d = new Phonon(e, r, t, !0).getTrajectory(s, n, null, null, null, a);
    this.atoms = d, this._cell = e.cell, this._atoms = e.multiply({ mx: a[0], my: a[1], mz: a[2] }), this._atoms.uuid = this.uuid, this.VFManager.addSetting("phonon", { origins: "positions", vectors: "movement", factor: i, color: l, radius: c }), this.bondManager.hideLongBonds = !1, this.drawModels(), this.play();
  }
  get ready() {
    return this._ready;
  }
  set ready(e) {
    this._ready = e, this.weas.eventHandlers.dispatchViewerUpdated({ ready: e });
  }
  get modelStyle() {
    return this._modelStyle;
  }
  set modelStyle(e) {
    const t = normalizeModelStyle(e, this._modelStyle);
    if (this._syncingState) {
      this._modelStyle = t, this.weas.eventHandlers.dispatchViewerUpdated({ modelStyle: t });
      return;
    }
    this.applyState({ modelStyle: t }, { redraw: "full" });
  }
  get radiusType() {
    return this._radiusType;
  }
  set radiusType(e) {
    if (this._syncingState) {
      this._radiusType = e, this.weas.eventHandlers.dispatchViewerUpdated({ radiusType: e });
      return;
    }
    this.applyState({ radiusType: e }, { redraw: "full" });
  }
  get colorBy() {
    return this._colorBy;
  }
  set colorBy(e) {
    if (this._syncingState) {
      this._colorBy = e, this.weas.eventHandlers.dispatchViewerUpdated({ colorBy: e });
      return;
    }
    this.applyState({ colorBy: e }, { redraw: "full" });
  }
  get colorType() {
    return this._colorType;
  }
  set colorType(e) {
    if (this._syncingState) {
      this._colorType = e, this.weas.eventHandlers.dispatchViewerUpdated({ colorType: e });
      return;
    }
    this.applyState({ colorType: e }, { redraw: "full" });
  }
  get materialType() {
    return this._materialType;
  }
  set materialType(e) {
    if (this._syncingState) {
      this._materialType = e, this.weas.eventHandlers.dispatchViewerUpdated({ materialType: e });
      return;
    }
    this.applyState({ materialType: e }, { redraw: "full" });
  }
  get colorRamp() {
    return this._colorRamp;
  }
  set colorRamp(e) {
    if (this._syncingState) {
      this._colorRamp = e, this.weas.eventHandlers.dispatchViewerUpdated({ colorRamp: e });
      return;
    }
    this.applyState({ colorRamp: e }, { redraw: "full" });
  }
  get backgroundColor() {
    return this._backgroundColor;
  }
  set backgroundColor(e) {
    if (this._syncingState) {
      this._backgroundColor = e, this.weas.eventHandlers.dispatchViewerUpdated({ backgroundColor: e });
      return;
    }
    this.applyState({ backgroundColor: e }, { redraw: "render" });
  }
  get atomLabelType() {
    return this._atomLabelType;
  }
  set atomLabelType(e) {
    if (this._syncingState) {
      this._atomLabelType = e, this.weas.eventHandlers.dispatchViewerUpdated({ atomLabelType: e });
      return;
    }
    this.applyState({ atomLabelType: e }, { redraw: "labels" });
  }
  get boundary() {
    return this._boundary;
  }
  set boundary(e) {
    if (this._syncingState) {
      this._boundary = e, this.weas.eventHandlers.dispatchViewerUpdated({ boundary: e });
      return;
    }
    this.applyState({ boundary: e }, { redraw: "full" });
  }
  get showBondedAtoms() {
    return this._showBondedAtoms;
  }
  set showBondedAtoms(e) {
    if (this._syncingState) {
      this._showBondedAtoms = e, this.weas.eventHandlers.dispatchViewerUpdated({ showBondedAtoms: e });
      return;
    }
    this.applyState({ showBondedAtoms: e }, { redraw: "full" });
  }
  get continuousUpdate() {
    return this._continuousUpdate;
  }
  set continuousUpdate(e) {
    if (this._syncingState) {
      this._continuousUpdate = e, this.weas.eventHandlers.dispatchViewerUpdated({ continuousUpdate: e });
      return;
    }
    this.applyState({ continuousUpdate: e }, { redraw: "render" });
  }
  get autoResetCameraOnAtomsUpdate() {
    return this._autoResetCameraOnAtomsUpdate;
  }
  set autoResetCameraOnAtomsUpdate(e) {
    if (this._syncingState) {
      this._autoResetCameraOnAtomsUpdate = e, this.weas.eventHandlers.dispatchViewerUpdated({ autoResetCameraOnAtomsUpdate: e });
      return;
    }
    this.applyState({ autoResetCameraOnAtomsUpdate: e }, { redraw: "render" });
  }
  get atomScale() {
    return this._atomScale;
  }
  set atomScale(e) {
    if (this._syncingState) {
      this._atomScale = e, this.weas.eventHandlers.dispatchViewerUpdated({ atomScale: e });
      return;
    }
    this.applyState({ atomScale: e }, { redraw: "render" });
  }
  get wrapOnMove() {
    return this._wrapOnMove;
  }
  set wrapOnMove(e) {
    if (this._syncingState) {
      this._wrapOnMove = e, this.weas.eventHandlers.dispatchViewerUpdated({ wrapOnMove: e });
      return;
    }
    this.applyState({ wrapOnMove: e }, { redraw: "none" });
  }
  get atomScales() {
    return this._atomScales;
  }
  set atomScales(e) {
    if (this._syncingState) {
      this._atomScales = e, this.weas.eventHandlers.dispatchViewerUpdated({ atomScales: e });
      return;
    }
    this.applyState({ atomScales: e }, { redraw: "full" });
  }
  get modelSticks() {
    return this._modelSticks;
  }
  set modelSticks(e) {
    if (this._syncingState) {
      this._modelSticks = e, this.weas.eventHandlers.dispatchViewerUpdated({ modelSticks: e });
      return;
    }
    this.applyState({ modelSticks: e }, { redraw: "full" });
  }
  get modelPolyhedras() {
    return this._modelPolyhedras;
  }
  set modelPolyhedras(e) {
    if (this._syncingState) {
      this._modelPolyhedras = e, this.weas.eventHandlers.dispatchViewerUpdated({ modelPolyhedras: e });
      return;
    }
    this.applyState({ modelPolyhedras: e }, { redraw: "full" });
  }
  get selectedAtomsIndices() {
    return this._selectedAtomsIndices;
  }
  set selectedAtomsIndices(e) {
    if (this._syncingState) {
      this._selectedAtomsIndices = e, this.weas.eventHandlers.dispatchViewerUpdated({ selectedAtomsIndices: e });
      return;
    }
    this.applyState({ selectedAtomsIndices: e }, { redraw: "render" });
  }
  beginUpdate() {
    this._updateDepth += 1;
  }
  endUpdate({ redraw: e = !0 } = {}) {
    this._updateDepth > 0 && (this._updateDepth -= 1), this._updateDepth === 0 && e && this.flushRedraw();
  }
  transaction(e, { redraw: t = !0 } = {}) {
    this.beginUpdate();
    try {
      e();
    } finally {
      this.endUpdate({ redraw: t });
    }
  }
  requestRedraw(e = "full") {
    const t = { render: 1, labels: 2, full: 3 };
    !e || !t[e] || ((!this._pendingRedraw || t[e] > t[this._pendingRedraw]) && (this._pendingRedraw = e), this._updateDepth === 0 && this.flushRedraw());
  }
  flushRedraw() {
    const e = this._pendingRedraw;
    this._pendingRedraw = null, e && (e === "full" ? this.drawModels() : e === "labels" ? this.updateAtomLabels() : this.tjs.render());
  }
  applyState(e, { redraw: t = "auto", skipStore: s = !1 } = {}) {
    if (!e || Object.keys(e).length === 0)
      return;
    const i = t === "auto", n = t !== "auto" && t !== "none", r = "modelStyle" in e && !("atomScales" in e || "modelSticks" in e || "modelPolyhedras" in e);
    this.beginUpdate(), this._syncingState = !0;
    try {
      s || this.state.set({ viewer: e }), Object.entries(e).forEach(([a, l]) => {
        if (!(a in this)) {
          this.logger.warn(`Unknown viewer state key: ${a}`);
          return;
        }
        const c = a === "modelStyle" ? normalizeModelStyle(l, this._modelStyle) : l;
        if (a === "selectedAtomsIndices") {
          const h = this._selectedAtomsIndices, d = Array.isArray(l) ? l : [], u = d.filter((m) => !h.includes(m)), p = h.filter((m) => !d.includes(m));
          if (d.length > 0 && !this.weas.eventHandlers?.transformControls?.mode && this.weas.selectionManager.setModeHint(""), (!this.highlightManager.settings || !this.highlightManager.settings.selection) && this.highlightManager.init(), (!this.highlightManager.meshes || !this.highlightManager.meshes.sphere) && this.highlightManager.drawHighlightAtoms(), this.highlightManager.settings.selection.indices = d, this._selectedAtomsIndices = d, this.weas.eventHandlers.dispatchViewerUpdated({ selectedAtomsIndices: d }), this.highlightManager.updateHighlightAtomsMesh({ indices: u, scale: 1.1, type: "sphere" }), this.highlightManager.updateHighlightAtomsMesh({ indices: p, scale: 0, type: "sphere" }), this.baseAtomLabelSettings = this.getAtomLabelSettingsFromType(this._atomLabelType), this.updateAtomLabels(), i) {
            const m = this.getRedrawEffectForKey(a);
            m && this.requestRedraw(m);
          }
          return;
        }
        if (this[a] = c, a === "radiusType" && (this.atomManager.init(), this.bondManager.init(), this.polyhedraManager.init()), a === "colorBy" && (this.atomManager.init(), this.bondManager.init(), this.polyhedraManager.init()), a === "colorType" && (this.atomManager.init(), this.guiManager.updateLegend(), this.bondManager.init(), this.polyhedraManager.init()), a === "atomScale" && (this.atomManager.updateAtomScale(l), Object.values(this.highlightManager.settings || {}).forEach((h) => {
          this.highlightManager.updateHighlightAtomsMesh(h);
        })), a === "backgroundColor" && (this.tjs.scene.background = new THREE.Color(l)), a === "atomLabelType" && (this.baseAtomLabelSettings = this.getAtomLabelSettingsFromType(l), this.updateAtomLabels()), a === "modelStyle" && r && this.updateModelStyles(c), i) {
          const h = this.getRedrawEffectForKey(a);
          h && this.requestRedraw(h);
        }
      }), n && this.requestRedraw(t === !0 ? "full" : t), !s && r && this.state.set({
        viewer: {
          atomScales: this._atomScales,
          modelSticks: this._modelSticks,
          modelPolyhedras: this._modelPolyhedras
        }
      });
    } finally {
      this._syncingState = !1, this.endUpdate({ redraw: !0 });
    }
  }
  setState(e, { record: t = !1, redraw: s = "auto" } = {}) {
    if (t) {
      if (this.weas.ops && this.weas.ops.isRestoring) {
        this.applyState(e, { redraw: s });
        return;
      }
      this.weas.ops.viewer.SetViewerState({ patch: e, redraw: s });
      return;
    }
    this.applyState(e, { redraw: s });
  }
  getRedrawEffectForKey(e) {
    return {
      modelStyle: "full",
      radiusType: "full",
      colorBy: "full",
      colorType: "full",
      colorRamp: "full",
      materialType: "full",
      boundary: "full",
      showBondedAtoms: "full",
      atomScales: "full",
      modelSticks: "full",
      modelPolyhedras: "full",
      atomLabelType: "render",
      atomScale: "render",
      selectedAtomsIndices: "render",
      backgroundColor: "render"
    }[e] || null;
  }
  getAtomLabelSettingsFromType(e) {
    const t = String(e || "None").toUpperCase();
    return t === "SYMBOL" ? [{ origins: "positions", texts: "symbols", fontSize: "24px" }] : t === "INDEX" ? [{ origins: "positions", texts: "index", fontSize: "24px" }] : [];
  }
  updateAtomLabels() {
    const e = [...this.baseAtomLabelSettings];
    this._selectedAtomsIndices.length > 0 && e.push({
      origins: "positions",
      texts: "index",
      selection: this._selectedAtomsIndices,
      fontSize: "24px"
    });
    const t = this.state.get("plugins.atomLabel")?.overlaySettings || [];
    this.state.set({ plugins: { atomLabel: { settings: e, overlaySettings: t } } });
  }
  drawModels() {
    this.logger.debug("-----------------drawModels-----------------"), this.dispose(), this.cellManager.draw(), this.bondManager.buildNeighborList(), this.boundaryManager.getBoundaryAtoms();
    const t = this.atoms.positions.map((n, r) => [r, [0, 0, 0]]).concat(this.boundaryList || []);
    this._showBondedAtoms ? this.bondedAtoms = searchBondedAtoms(this.atoms.getSymbols(), t, this.neighbors, this.modelSticks) : this.bondedAtoms = { atoms: [], bonds: [] }, this.logger.debug("bondedAtoms: ", this.bondedAtoms), this.atomManager.meshes.atom = this.atomManager.drawBalls();
    const s = this.bondManager.drawBonds();
    this.atomManager.meshes.atom.add(s);
    const i = this.polyhedraManager.drawPolyhedras();
    this.atomManager.meshes.atom.add(i), this.isosurfaceManager.drawIsosurfaces(), this.volumeSliceManager.drawSlices(), this.VFManager.drawVectorFields(), this.highlightManager.drawHighlightAtoms(), this.ALManager.drawAtomLabels(), this.guiManager.updateLegend(), this.ready = !0, this.requestRedraw("render");
  }
  dispose() {
    this.atomManager.meshes.atom && this.atomManager.meshes.atom.dispose(), this.atomManager.meshes.image && this.atomManager.meshes.image.dispose(), clearObjects(this.tjs.scene, this.uuid);
  }
  // Method to delete selected atoms
  deleteSelectedAtoms({ indices: e = null }) {
    e === null && (e = this.selectedAtomsIndices), this.atoms.deleteAtoms({ indices: e }), this.atomScales = this.atomScales.filter((t, s) => !e.includes(s)), this.modelSticks = this.modelSticks.filter((t, s) => !e.includes(s)), this.modelPolyhedras = this.modelPolyhedras.filter((t, s) => !e.includes(s)), this.selectedAtomsIndices = this.selectedAtomsIndices.filter((t) => !e.includes(t)), this.drawModels();
  }
  // Method to replace selected atoms
  replaceSelectedAtoms({ element: e, indices: t = null }) {
    t === null && (t = this.selectedAtomsIndices), this.atoms.replaceAtoms({ indices: Array.from(t), newSpecieSymbol: e }), this.atomManager.init(), this.bondManager.init(), this.drawModels();
  }
  // Method to add atoms
  addAtom({ element: e, position: t = { x: 0, y: 0, z: 0 } }) {
    const s = new Atom(e, [t.x, t.y, t.z]);
    this.atoms.species[e] || this.atoms.addSpecie({ symbol: e }), this.atoms.addAtom({ atom: s }), this.atomScales = this.atomScales.concat([this.atomScale]), this.modelSticks = this.modelSticks.concat([0]), this.modelPolyhedras = this.modelPolyhedras.concat([0]), this.atomManager.init(), this.bondManager.init(), this.drawModels();
  }
  // Method to copy atoms
  copyAtoms({ indices: e = null }) {
    e === null && (e = this.selectedAtomsIndices);
    const t = this.atoms.getAtomsByIndices({ indices: e });
    this.logger.debug("copied_atoms: ", t), this.atoms.add({ otherAtoms: t }), this.logger.debug("atoms: ", this.atoms), this.atomScales = this.atomScales.concat(e.map((s) => this.atomScales[s])), this.modelSticks = this.modelSticks.concat(e.map((s) => this.modelSticks[s])), this.modelPolyhedras = this.modelPolyhedras.concat(e.map((s) => this.modelPolyhedras[s])), this.drawModels(), this.selectedAtomsIndices = Array.from({ length: t.getAtomsCount() }, (s, i) => i + this.atoms.getAtomsCount() - t.getAtomsCount());
  }
  setAtomPosition({ index: e, position: t }) {
    const s = this.wrapPositionIfNeeded(t), i = new THREE.Matrix4();
    this.atomManager.meshes.atom.getMatrixAt(e, i), i.setPosition(s), this.atomManager.meshes.atom.setMatrixAt(e, i), this.atoms.positions[e] = [s.x, s.y, s.z], this.atomManager.updateImageAtomsMesh(e), this.bondManager.updateBondMesh(e), this.polyhedraManager.updatePolyhedraMesh(e);
  }
  wrapPositionIfNeeded(e) {
    if (!this._wrapOnMove || !this.atoms || !Array.isArray(this.atoms.pbc) || !this.atoms.pbc.some(Boolean) || typeof this.atoms.isUndefinedCell == "function" && this.atoms.isUndefinedCell())
      return e;
    const t = this.atoms.cell;
    if (!Array.isArray(t) || t.length !== 3)
      return e;
    try {
      const s = t[0].map((l, c) => t.map((h) => h[c])), i = calculateInverseMatrix(s), n = multiplyMatrixVector(i, [e.x, e.y, e.z]);
      let r = !1;
      for (let l = 0; l < 3; l++) {
        if (!this.atoms.pbc[l])
          continue;
        const c = n[l], h = c - Math.floor(c);
        h !== c && (r = !0), n[l] = h;
      }
      if (!r)
        return e;
      const a = calculateCartesianCoordinates(t, n);
      return new THREE.Vector3(a[0], a[1], a[2]);
    } catch (s) {
      return this.logger.debug("wrapPositionIfNeeded failed:", s), e;
    }
  }
  resetSelectedAtomsPositions(e, t = null) {
    let s = e;
    e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "initialAtomPositions") && ({ initialAtomPositions: s, indices: t = null } = e), t === null && (t = this.selectedAtomsIndices), t.length !== 0 && (t.forEach((i) => {
      const n = s.get(i);
      this.setAtomPosition({ index: i, position: n });
    }), this.atomManager.meshes.atom.instanceMatrix.needsUpdate = !0);
  }
  translateSelectedAtoms({ translateVector: e, indices: t = null }) {
    t === null && (t = this.selectedAtomsIndices), t = toIndexArray(t), t.length !== 0 && (e = toVector3(e, "translateVector"), t.forEach((s) => {
      const n = new THREE.Vector3(...this.atoms.positions[s]).clone().add(e);
      this.setAtomPosition({ index: s, position: n });
    }), this.atomManager.meshes.atom.instanceMatrix.needsUpdate = !0, this.atomManager.meshes.image && (this.atomManager.meshes.image.instanceMatrix.needsUpdate = !0), this.bondManager.bondMesh && (this.bondManager.bondMesh.instanceMatrix.needsUpdate = !0));
  }
  rotateSelectedAtoms({ cameraDirection: e, rotationAngle: t, indices: s = null, centroid: i = null }) {
    e = toVector3(e, "cameraDirection"), e = e.normalize(), t = THREE.MathUtils.degToRad(t);
    const n = new THREE.Matrix4().makeRotationAxis(e, -t);
    s === null && (s = this.selectedAtomsIndices), s = toIndexArray(s), s.length !== 0 && (i === null && (i = new THREE.Vector3(0, 0, 0), s.forEach((r) => {
      i.add(new THREE.Vector3(...this.atoms.positions[r]));
    }), i.divideScalar(s.length)), i = toVector3(i, "centroid"), s.forEach((r) => {
      const a = new THREE.Vector3(...this.atoms.positions[r]);
      a.sub(i).applyMatrix4(n).add(i), this.setAtomPosition({ index: r, position: a });
    }), this.atomManager.meshes.atom.instanceMatrix.needsUpdate = !0, this.atomManager.meshes.image && (this.atomManager.meshes.image.instanceMatrix.needsUpdate = !0));
  }
  setAttribute(e, t, s = "atom") {
    let i = e;
    e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "name") && ({ name: i, values: t, domain: s = "atom" } = e), this.trajectory.forEach((n) => {
      n.newAttribute({ name: i, values: t, domain: s });
    });
  }
  updateModelStyles(e) {
    const { atomScales: t, modelSticks: s, modelPolyhedras: i, appliesToAll: n } = this.getModelArraysForStyle(e);
    n && (this._modelStyle = e), this.atomScales = t, this.modelSticks = s, this.modelPolyhedras = i;
  }
  getDefaultModelArrays(e, t) {
    const s = new Array(t).fill(0.4), i = new Array(t).fill(0), n = new Array(t).fill(0);
    return e === 0 ? s.fill(1) : e === 1 ? i.fill(1) : e === 2 ? (i.fill(2), n.fill(1)) : e === 3 ? (s.fill(0), i.fill(3)) : e === 4 && (s.fill(0), i.fill(4)), { atomScales: s, modelSticks: i, modelPolyhedras: n };
  }
  applyModelStyleToArrays(e, t, s, i, n) {
    const r = (a) => {
      e === 0 ? (t[a] = 1, s[a] = e, i[a] = 0) : e === 1 ? (t[a] = 0.4, s[a] = e, i[a] = 0) : e === 2 ? (t[a] = 0.4, s[a] = e, i[a] = 1) : (e === 3 || e === 4) && (t[a] = 0, s[a] = e, i[a] = 0);
    };
    n.forEach((a) => r(a));
  }
  getModelArraysForStyle(e) {
    const t = this.atoms.getAtomsCount(), s = Array.isArray(this._atomScales) && Array.isArray(this._modelSticks) && Array.isArray(this._modelPolyhedras) && this._atomScales.length === t && this._modelSticks.length === t && this._modelPolyhedras.length === t;
    let i, n, r;
    if (s)
      i = this._atomScales.slice(), n = this._modelSticks.slice(), r = this._modelPolyhedras.slice();
    else {
      const l = this.getDefaultModelArrays(this._modelStyle, t);
      i = l.atomScales, n = l.modelSticks, r = l.modelPolyhedras;
    }
    return this.selectedAtomsIndices.length > 0 ? (this.applyModelStyleToArrays(e, i, n, r, this.selectedAtomsIndices), { atomScales: i, modelSticks: n, modelPolyhedras: r, appliesToAll: !1 }) : { ...this.getDefaultModelArrays(e, t), appliesToAll: !0 };
  }
  getFrameSignature(e) {
    const t = e.getAtomsCount(), s = this.hashSymbols(e.symbols);
    return `${t}:${s}`;
  }
  hashSymbols(e) {
    let t = 0;
    for (let s = 0; s < e.length; s++) {
      const i = e[s];
      for (let n = 0; n < i.length; n++)
        t = t * 31 + i.charCodeAt(n) | 0;
      t = t * 31 + 124 | 0;
    }
    return t >>> 0;
  }
  rebuildForFrame(e) {
    this._atoms = null, this._cell = null, this.selectedAtomsIndices = [], this.cellManager.cell = e.cell, this.atomManager.init(), this.highlightManager.init(), this.bondManager.init(), this.polyhedraManager.init(), this.VFManager.init(), this.isosurfaceManager.reset(), this.volumeSliceManager.reset(), this.Measurement.reset(), this.updateModelStyles(this._modelStyle), this.drawModels();
  }
}
function normalizeModelStyle(o, e) {
  if (typeof o == "number")
    return o;
  if (typeof o == "string") {
    if (Object.prototype.hasOwnProperty.call(MODEL_STYLE_MAP, o))
      return MODEL_STYLE_MAP[o];
    const t = parseInt(o, 10);
    if (!Number.isNaN(t))
      return t;
  }
  return e;
}
function createDefaultState() {
  const o = cloneValue(defaultViewerSettings);
  return {
    viewer: {
      modelStyle: o.modelStyle,
      colorBy: o.colorBy,
      colorType: o.colorType,
      colorRamp: o.colorRamp,
      radiusType: o.radiusType,
      materialType: o.materialType,
      atomLabelType: o.atomLabelType,
      showBondedAtoms: o.showBondedAtoms,
      boundary: o.boundary,
      atomScale: o.atomScale,
      wrapOnMove: o.wrapOnMove,
      atomScales: [],
      modelSticks: [],
      modelPolyhedras: [],
      backgroundColor: o.backgroundColor,
      continuousUpdate: o.continuousUpdate,
      selectedAtomsIndices: []
    },
    cell: cloneValue(o.cellSettings),
    bond: {
      settings: {},
      hideLongBonds: o.bondSettings.hideLongBonds,
      showHydrogenBonds: o.bondSettings.showHydrogenBonds,
      showOutBoundaryBonds: o.bondSettings.showOutBoundaryBonds
    },
    plugins: {
      isosurface: { settings: {} },
      volumeSlice: { settings: {} },
      vectorField: { settings: {}, show: !0 },
      highlight: {
        settings: {
          selection: { indices: [], scale: 1.1, type: "sphere", color: "#ffff00" }
        }
      },
      atomLabel: { settings: [] },
      text: { settings: [] },
      polyhedra: { settings: [] },
      measurement: { settings: {} },
      species: { settings: {} },
      anyMesh: { settings: [] },
      instancedMeshPrimitive: { settings: [] }
    },
    camera: {
      type: "Orthographic",
      position: null,
      target: null,
      direction: null,
      distance: null,
      zoom: 1,
      fov: 50
    },
    animation: {
      currentFrame: 0,
      isPlaying: !1,
      frameDuration: 100
    }
  };
}
function applyDefined(o, e, t) {
  e && t.forEach((s) => {
    e[s] !== void 0 && (o[s] = cloneValue(e[s]));
  });
}
function fromWidgetSnapshot(o) {
  if (!o || typeof o != "object")
    throw new Error("Invalid widget snapshot payload.");
  const e = createDefaultState(), t = o.viewer || {}, s = o.plugins || {}, i = o.camera || {}, n = o.measurement || {}, r = o.animation || {};
  if (applyDefined(e.viewer, t, [
    "modelStyle",
    "colorBy",
    "colorType",
    "colorRamp",
    "radiusType",
    "materialType",
    "atomLabelType",
    "showBondedAtoms",
    "boundary",
    "atomScale",
    "atomScales",
    "modelSticks",
    "modelPolyhedras",
    "continuousUpdate",
    "selectedAtomsIndices",
    "backgroundColor"
  ]), applyDefined(e.bond, t, ["hideLongBonds", "showHydrogenBonds", "showOutBoundaryBonds"]), s.cellSettings && (e.cell = cloneValue(s.cellSettings)), s.bondSettings && (e.bond.settings = cloneValue(s.bondSettings)), s.isoSettings && (e.plugins.isosurface.settings = cloneValue(s.isoSettings)), s.sliceSettings && (e.plugins.volumeSlice.settings = cloneValue(s.sliceSettings)), s.vectorField && (e.plugins.vectorField.settings = cloneValue(s.vectorField)), typeof s.showVectorField == "boolean" && (e.plugins.vectorField.show = s.showVectorField), s.highlightSettings && (e.plugins.highlight.settings = cloneValue(s.highlightSettings)), s.speciesSettings && (e.plugins.species.settings = cloneValue(s.speciesSettings)), s.anyMesh && (e.plugins.anyMesh.settings = cloneValue(s.anyMesh)), s.instancedMeshPrimitive && (e.plugins.instancedMeshPrimitive.settings = cloneValue(s.instancedMeshPrimitive)), n && typeof n == "object") {
    const l = n.settings && typeof n.settings == "object" ? n.settings : n;
    e.plugins.measurement.settings = cloneValue(l);
  }
  r && typeof r == "object" && applyDefined(e.animation, r, ["currentFrame", "isPlaying", "frameDuration"]), i.cameraSetting && (applyDefined(e.camera, i.cameraSetting, ["direction", "distance", "zoom"]), i.cameraSetting.lookAt && (e.camera.target = cloneValue(i.cameraSetting.lookAt))), applyDefined(e.camera, i, ["cameraType"]), i.cameraType && (e.camera.type = i.cameraType), i.cameraZoom !== void 0 && (e.camera.zoom = i.cameraZoom), i.cameraPosition && (e.camera.position = cloneValue(i.cameraPosition)), i.cameraLookAt && (e.camera.target = cloneValue(i.cameraLookAt));
  const a = typeof r.currentFrame == "number" ? r.currentFrame : typeof t.currentFrame == "number" ? t.currentFrame : void 0;
  return {
    version: "weas_state_v1",
    atoms: cloneValue(o.atoms),
    state: e,
    camera: cloneValue(e.camera),
    currentFrame: a
  };
}
class MaterialsRegistry {
  constructor() {
    this._builtIn = /* @__PURE__ */ new Set(["Standard", "Phong", "Basic"]), this.materials = {
      Standard: new THREE.MeshStandardMaterial({
        metalness: 0.2,
        roughness: 0.5
      }),
      Phong: new THREE.MeshPhongMaterial({
        specular: 2236962,
        shininess: 100,
        reflectivity: 0.9
      }),
      Basic: new THREE.MeshBasicMaterial({ color: 16776960 })
    }, this.materialSchemas = {
      MeshStandardMaterial: {
        metalness: {
          type: "number",
          min: 0,
          max: 1,
          step: 0.01,
          label: "Metalness",
          hide: !1
        },
        roughness: {
          type: "number",
          min: 0,
          max: 1,
          step: 0.01,
          label: "Roughness",
          hide: !1
        }
      },
      MeshPhongMaterial: {
        shininess: {
          type: "number",
          min: 0,
          max: 300,
          step: 1,
          label: "Shininess",
          hide: !1
        },
        reflectivity: {
          type: "number",
          min: 0,
          max: 1,
          step: 0.01,
          label: "Reflectivity",
          hide: !0
        }
      },
      MeshBasicMaterial: {
        // empty
      }
    }, Object.values(this.materials).forEach((e) => e.__builtIn = !0), this._callbacks = /* @__PURE__ */ new Set();
  }
  _emitChange() {
    this._callbacks.forEach((e) => e());
  }
  onChange(e) {
    return this._callbacks.add(e), () => this._callbacks.delete(e);
  }
  /** Get a material instance by name. Optionally clone it. */
  getMaterial(e, t = !1) {
    if (!(e in this.materials))
      throw new Error(`Material "${e}" not found`);
    return t ? this.materials[e].clone() : this.materials[e];
  }
  /** Get the schema (editable properties) for a material */
  getSchema(e) {
    const t = this.getMaterial(e);
    return this.materialSchemas[t.type] || [];
  }
  /** Rename a user-defined material */
  renameMaterial(e, t) {
    if (!(e in this.materials))
      throw new Error(`Material "${e}" not found`);
    if (this._builtIn.has(e))
      throw new Error(`Cannot rename built-in material "${e}"`);
    t in this.materials && console.warn(`Material "${t}" will overwrite existing`), this.materials[t] = this.materials[e], delete this.materials[e], this._emitChange();
  }
  /** Update user-defined material in place */
  updateMaterial(e, t) {
    if (!(e in this.materials))
      throw new Error(`Material "${e}" not found`);
    if (this._builtIn.has(e))
      throw new Error(`Cannot modify built-in material "${e}"`);
    Object.assign(this.materials[e], t), this._emitChange();
  }
  /** Copy a material (built-in or user-defined) */
  copyMaterial(e, t, s = {}) {
    if (!(e in this.materials))
      throw new Error(`Material "${e}" not found`);
    t in this.materials && console.warn(`Material "${t}" will overwrite existing`);
    const i = this.materials[e].clone();
    Object.assign(i, s), i.__userDefined = !0, this.materials[t] = i, this._emitChange();
  }
  /** List material names */
  list() {
    return Object.keys(this.materials);
  }
  /** List detailed info for all materials */
  listDetails() {
    return Object.entries(this.materials).map(([e, t]) => ({
      name: e,
      type: t.type,
      builtIn: !!t.__builtIn,
      userDefined: !!t.__userDefined,
      schema: this.getSchema(e)
    }));
  }
}
class ShapeRegistry {
  constructor(e) {
    this.shapes = {}, this.materials = e, this._callbacks = /* @__PURE__ */ new Set(), this._registerBuiltIns();
  }
  _emitChange() {
    this._callbacks.forEach((e) => e());
  }
  onChange(e) {
    return this._callbacks.add(e), () => this._callbacks.delete(e);
  }
  _createBaseMesh(e, t, {
    materialType: s = "Standard",
    color: i = "#bd0d87",
    opacity: n = 1,
    wireframe: r = !1
  } = {}) {
    const a = e.getMaterial(s, !0);
    return "color" in a && (a.color = new THREE.Color(i)), a.transparent = !0, a.opacity = n, a.side = THREE.DoubleSide, a.wireframe = r, n < 1 && (a.depthWrite = !1), new THREE.Mesh(t, a);
  }
  _registerBuiltIns() {
    this.register(
      "Cube",
      (t, s) => this._createBaseMesh(
        t,
        new THREE.BoxGeometry(2, 2, 2),
        s
      )
    ), this.register("Sphere", (t, s) => {
      const i = s.widthSegments ?? 32, n = s.heightSegments ?? 32;
      return this._createBaseMesh(
        t,
        new THREE.SphereGeometry(1, i, n),
        s
      );
    }), this.register(
      "Plane",
      (t, s) => this._createBaseMesh(
        t,
        new THREE.PlaneGeometry(2, 2),
        s
      )
    ), this.register("Cylinder", (t, s) => {
      const i = s.segments ?? 24;
      return this._createBaseMesh(
        t,
        new THREE.CylinderGeometry(1, 1, 1, i),
        s
      );
    }), this.register(
      "Cone",
      (t, s) => this._createBaseMesh(
        t,
        new THREE.ConeGeometry(1, 2, 16),
        s
      )
    ), this.register(
      "Torus",
      (t, s) => this._createBaseMesh(
        t,
        new THREE.TorusGeometry(1 * 0.75, 1 * 0.25, 16, 32),
        s
      )
    ), this.register("Arrow", (t, s) => {
      const i = s.shaftRatio ?? 0.75, n = s.length ?? 1, r = n * i, a = n - r, l = (s.shaftRadius ?? 0.075) * n, c = (s.headRadius ?? 0.15) * n, h = new THREE.CylinderGeometry(
        l,
        l,
        r,
        s.segments ?? 12
      );
      h.translate(0, r / 2, 0);
      const d = new THREE.ConeGeometry(
        c,
        a,
        s.segments ?? 12
      );
      d.translate(0, r + a / 2, 0);
      const u = mergeGeometries([h, d], !1), p = this._createBaseMesh(t, u, s);
      if (s.start && s.end) {
        const m = new THREE.Vector3(...s.start), g = new THREE.Vector3(...s.end), y = new THREE.Vector3().subVectors(g, m), f = y.length();
        y.normalize(), p.scale.set(1, f / n, 1);
        const w = new THREE.Vector3(0, 1, 0).cross(y), b = Math.acos(new THREE.Vector3(0, 1, 0).dot(y));
        w.lengthSq() > 0 && p.quaternion.setFromAxisAngle(w.normalize(), b), p.position.copy(m);
      }
      return p;
    }), this.register("Line", (t, s) => {
      const i = s.color || "#000000", n = s.start || [0, 0, 0], r = s.end || [0, 1, 0], a = [new THREE.Vector3(...n), new THREE.Vector3(...r)], l = new THREE.BufferGeometry().setFromPoints(a), c = new THREE.LineBasicMaterial({ color: i }), h = new THREE.Line(l, c);
      if (s.position && h.position.set(...s.position), s.scale && h.scale.set(...s.scale), s.rotation) {
        const [d, u, p] = s.rotation;
        h.rotation.set(
          THREE.MathUtils.degToRad(d),
          THREE.MathUtils.degToRad(u),
          THREE.MathUtils.degToRad(p)
        );
      }
      return s.notSelectable && (h.userData.notSelectable = !0), s.type && (h.userData.type = s.type), h;
    });
  }
  // Register a custom shape
  register(e, t) {
    this.shapes[e] && console.warn(`Shape "${e}" is being overwritten`), this.shapes[e] = t, this._emitChange();
  }
  // Create a shape (returns a new mesh or group)
  create(e, t = {}) {
    const s = this.shapes[e];
    if (!s) throw new Error(`Shape "${e}" not registered`);
    const i = s(this.materials, t);
    if (i instanceof THREE.Object3D && (t.position && i.position.set(...t.position), t.scale && i.scale.set(...t.scale), t.rotation)) {
      const [n, r, a] = t.rotation;
      i.rotation.set(
        THREE.MathUtils.degToRad(n),
        THREE.MathUtils.degToRad(r),
        THREE.MathUtils.degToRad(a)
      );
    }
    return t.notSelectable && (i.userData.notSelectable = !0), t.type && (i.userData.type = t.type), t.customData && Object.entries(t.customData).forEach(
      ([n, r]) => i.userData[n] = r
    ), i;
  }
  list() {
    return Object.keys(this.shapes);
  }
}
class WEAS {
  constructor({
    domElement: e,
    atoms: t = [new Atoms()],
    viewerConfig: s = {},
    guiConfig: i = {},
    tjsConfig: n = null,
    keybindConfig: r = null
  }) {
    this.uuid = THREE.MathUtils.generateUUID(), this.tjsConfig = n, this.tjs = new BlendJS(e, this), this.keybindConfig = r, this.materialsRegistry = new MaterialsRegistry(), this.shapeRegistry = new ShapeRegistry(this.materialsRegistry), this.tjs.requestRedraw = this.requestRedraw.bind(this), this.guiManager = new GUIManager(this, i), this.eventHandlers = new EventHandlers(this), this.ops = new OperationManager(this), this.selectionManager = new SelectionManager(this), this.objectManager = new ObjectManager(this), this.state = new StateStore(createDefaultState()), this.textManager = new TextManager(this), this.avr = new AtomsViewer({
      weas: this,
      atoms: t,
      viewerConfig: s
    }), this.instancedMeshPrimitive = new InstancedMeshPrimitive(this), this.anyMesh = new AnyMesh(this), this._initCameraStateSync(), this.initialize();
  }
  initialize() {
    this.activeObject = null, this.render();
  }
  render() {
    this.requestRedraw("render");
  }
  requestRedraw(e = "render") {
    if (this.avr && typeof this.avr.requestRedraw == "function") {
      this.avr.requestRedraw(e);
      return;
    }
    this.tjs.render();
  }
  _initCameraStateSync() {
    const e = this.tjs.cameraController;
    if (!e || typeof e.addEventListener != "function")
      return;
    const t = () => {
      this.state.set({ camera: this._exportCameraState() });
    };
    e.addEventListener("end", t), t();
  }
  clear() {
    this.reset();
  }
  reset() {
    this.tjs.scene.clear(), this.state.reset(createDefaultState()), this.avr && (this.avr.atoms = new Atoms());
  }
  async exportAnimation({
    format: e = "webm",
    fps: t = 12,
    startFrame: s = 0,
    endFrame: i = null,
    mimeType: n = null
  } = {}) {
    if (!this.avr || !this.avr.trajectory || this.avr.trajectory.length === 0)
      throw new Error("No trajectory data available for animation export.");
    return this.tjs.exportAnimation({
      format: e,
      fps: t,
      startFrame: s,
      endFrame: i,
      mimeType: n,
      frameCount: this.avr.trajectory.length,
      setFrame: (r) => {
        this.avr.currentFrame = r;
      },
      getFrame: () => this.avr.currentFrame,
      isPlaying: () => this.avr.isPlaying,
      pause: () => this.avr.pause(),
      play: () => this.avr.play()
    });
  }
  async downloadAnimation({ filename: e = "trajectory.webm", ...t } = {}) {
    if (!this.avr || !this.avr.trajectory || this.avr.trajectory.length === 0)
      throw new Error("No trajectory data available for animation export.");
    await this.tjs.downloadAnimation({
      filename: e,
      ...t,
      frameCount: this.avr.trajectory.length,
      setFrame: (s) => {
        this.avr.currentFrame = s;
      },
      getFrame: () => this.avr.currentFrame,
      isPlaying: () => this.avr.isPlaying,
      pause: () => this.avr.pause(),
      play: () => this.avr.play()
    });
  }
  _buildAtomsFromSnapshot(e) {
    return e ? Array.isArray(e) ? e.map((t) => new Atoms(t)) : new Atoms(e) : null;
  }
  _exportCameraState() {
    const e = this.tjs.controls;
    return e ? e.exportState() : null;
  }
  exportState() {
    const e = Array.isArray(this.avr.trajectory) && this.avr.trajectory.length > 1 ? this.avr.trajectory.map((i) => i.toDict()) : this.avr.atoms.toDict(), t = cloneValue(this.state.get()), s = this._exportCameraState();
    return t.camera = s, this.avr?.bondManager && (t.bond = {
      ...t.bond || {},
      hideLongBonds: this.avr.bondManager.hideLongBonds,
      showHydrogenBonds: this.avr.bondManager.showHydrogenBonds,
      showOutBoundaryBonds: this.avr.bondManager.showOutBoundaryBonds,
      settings: this.avr.bondManager.toPlainSettings()
    }), t.plugins && (this.anyMesh && (t.plugins.anyMesh = {
      settings: cloneValue(this.anyMesh.settings || [])
    }), this.instancedMeshPrimitive && (t.plugins.instancedMeshPrimitive = {
      settings: cloneValue(this.instancedMeshPrimitive.settings || [])
    })), {
      version: "weas_state_v1",
      atoms: e,
      state: t,
      currentFrame: this.avr.currentFrame
    };
  }
  importState(e) {
    if (!e || typeof e != "object")
      throw new Error("Invalid snapshot payload.");
    const t = e.version === "weas_widget_state_v1" ? fromWidgetSnapshot(e) : e, s = this._buildAtomsFromSnapshot(t.atoms);
    if (s && (this.avr.atoms = s), t.state) {
      const r = cloneValue(t.state);
      t.camera && !r.camera && (r.camera = cloneValue(t.camera)), this.state.transaction(() => {
        this.state.set(r);
      });
    }
    const i = t.state?.camera || t.camera || {};
    this._applyCameraState(i);
    const n = t.state?.animation;
    n && (typeof n.frameDuration == "number" && (this.avr.frameDuration = n.frameDuration), typeof n.currentFrame == "number" && (this.avr.currentFrame = n.currentFrame), n.isPlaying ? this.avr.play() : this.avr.pause()), typeof t.currentFrame == "number" && (this.avr.currentFrame = t.currentFrame);
  }
}
const Bohr = 0.52917721092;
function parseCube(o) {
  const e = o.trim().split(`
`);
  if (e.length < 6)
    throw new Error("Invalid cube file format");
  const t = parseInt(e[2].trim().split(/\s+/)[0]), s = e[2].trim().split(/\s+/).slice(1).map(Number), i = [e[3].trim().split(/\s+/).map(Number), e[4].trim().split(/\s+/).map(Number), e[5].trim().split(/\s+/).map(Number)], n = i.map((d) => Math.abs(d[0])), r = i.map((d, u) => ({
    cell: d.slice(1).map((p) => p * n[u] * Bohr),
    // Calculate the actual cell lengths
    stepSize: d.slice(1)
  })), a = {
    species: {},
    pbc: [!0, !0, !0],
    positions: [],
    symbols: []
  };
  for (let d = 6; d < 6 + t; d++) {
    const u = e[d].trim().split(/\s+/).map(Number), p = u[0], m = u.slice(2), g = Object.keys(elementAtomicNumbers).find((y) => elementAtomicNumbers[y] === p);
    a.species[g] || (a.species[g] = g), a.symbols.push(g), a.positions.push(m);
  }
  if (a.positions.length !== t)
    throw new Error("Atom count mismatch in cube file");
  const l = r.map((d) => d.cell);
  let c = new Atoms({
    ...a,
    cell: l
  });
  const h = [];
  for (let d = 6 + t; d < e.length; d++) {
    const u = e[d].trim().split(/\s+/).map(Number);
    h.push(...u);
  }
  return c.positions = c.positions.map((d) => d.map((u) => u * Bohr)), {
    atoms: c,
    volumetricData: { dims: n, values: h, origin: s, cell: l }
  };
}
function parseXSF(o) {
  const e = o.trim().split(/\r?\n/), t = {
    species: {},
    pbc: [!0, !0, !0],
    positions: [],
    symbols: []
  };
  let s = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ], i = 0, n = null, r = -1, a = -1, l = -1, c = -1;
  for (let d = 0; d < e.length; d++) {
    const u = e[d].trim().toUpperCase();
    u.startsWith("PRIMVEC") && (r = d), u.startsWith("PRIMCOORD") && (a = d), u.startsWith("BEGIN_BLOCK_DATAGRID_3D") && (l = d), u.startsWith("END_BLOCK_DATAGRID_3D") && (c = d);
  }
  if (r >= 0)
    for (let d = 1; d <= 3; d++)
      s[d - 1] = e[r + d].trim().split(/\s+/).map(Number);
  if (a >= 0) {
    i = e[a + 1].trim().split(/\s+/).map(Number)[0];
    for (let u = 0; u < i; u++) {
      const p = e[a + 2 + u].trim().split(/\s+/), m = p[0];
      let g;
      isNaN(parseFloat(m)) ? g = m.charAt(0).toUpperCase() + m.slice(1).toLowerCase() : g = Object.keys(elementAtomicNumbers).find((f) => elementAtomicNumbers[f] === parseInt(m, 10)) || `X${m}`;
      const y = p.slice(1, 4).map(Number);
      t.species[g] || (t.species[g] = g), t.symbols.push(g), t.positions.push(y);
    }
  }
  let h = new Atoms({
    ...t,
    cell: s
  });
  if (l >= 0 && c > l) {
    let d = l + 1;
    for (; d < c && !e[d].toUpperCase().includes("DATAGRID_3D"); )
      d++;
    const u = e[d + 1].trim().split(/\s+/).map(Number), [p, m, g] = u, y = e[d + 2].trim().split(/\s+/).map(Number), f = [
      e[d + 3].trim().split(/\s+/).map(Number),
      e[d + 4].trim().split(/\s+/).map(Number),
      e[d + 5].trim().split(/\s+/).map(Number)
    ], w = [], b = d + 6;
    for (let x = b; x < c; x++) {
      const S = e[x].trim().split(/\s+/).map(Number);
      S.some((M) => !isNaN(M)) && w.push(...S);
    }
    w.length < p * m * g && console.warn(`Volumetric data mismatch: got ${w.length}, expected ${p * m * g}`), n = {
      dims: [p, m, g],
      values: w,
      origin: y,
      cell: f
    };
  }
  return {
    atoms: h,
    volumetricData: n
  };
}
export {
  Atom,
  Atoms,
  AtomsViewer,
  Specie,
  WEAS,
  applyStructurePayload,
  atomsToCIF,
  atomsToXYZ,
  buildExportPayload,
  downloadText,
  elementAtomicNumbers,
  fromWidgetSnapshot,
  parseCIF,
  parseCube,
  parseStructureText,
  parseXSF,
  parseXYZ
};
