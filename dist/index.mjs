(function(){try{if(typeof document<`u`){var e=document.createElement(`style`);e.appendChild(document.createTextNode(`.selectBox{background-color:#4ba0ff4d;border:1px solid #5af;position:fixed}.weas-mode-hint{color:#fff;pointer-events:none;z-index:20;-webkit-user-select:none;user-select:none;background:#0009;border-radius:4px;padding:6px 10px;font-size:12px;line-height:1.3;position:absolute;top:56px;left:50%;transform:translate(-50%)}.lassoSelect{position:absolute;top:0;left:0}.search-overlay{color:#fff;z-index:1000;background:#2c3e50;border-radius:4px;flex-direction:column;align-items:center;width:300px;display:flex;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);box-shadow:0 8px 16px #00000040}.search-overlay input{color:#fff;background:0 0;border:none;width:90%;margin:5px;padding:10px;font-size:14px}.search-overlay ul{margin:0;padding:0;font-size:14px;list-style:none}.search-overlay ul li{cursor:pointer;padding:5px}.search-overlay ul li:hover{background:#34495e}#search-box{width:90%;margin-bottom:5px}#search-results{max-height:150px;overflow-y:auto}.text-label{-webkit-user-select:none;user-select:none;pointer-events:none;line-height:1}.text-label-cross{width:var(--cross-size,1em);height:var(--cross-size,1em);position:relative}.text-label-cross[data-cross=true]:before,.text-label-cross[data-cross=true]:after{content:"";background:currentColor;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)}.text-label-cross[data-cross=true]:before{width:100%;height:calc(var(--cross-size,1em) * .04);min-height:1px}.text-label-cross[data-cross=true]:after{width:calc(var(--cross-size,1em) * .04);min-width:1px;height:100%}.weas-toolbar-button:hover{scale:1.05;box-shadow:0 4px 16px #0000001a}
/*$vite$:1*/`)),document.head.appendChild(e)}}catch(e){console.error(`vite-plugin-css-injected-by-js`,e)}})();import * as THREE$1 from "three";
import { BufferAttribute, BufferGeometry, Controls, Float32BufferAttribute, Frustum, Line3, MOUSE, MathUtils, Matrix4, Object3D, Plane, Quaternion, Triangle, Vector2, Vector3 } from "three";
import { GUI } from "dat.gui";
//#region \0rolldown/runtime.js
var __create = Object.create, __defProp = Object.defineProperty, __getOwnPropDesc = Object.getOwnPropertyDescriptor, __getOwnPropNames = Object.getOwnPropertyNames, __getProtoOf = Object.getPrototypeOf, __hasOwnProp = Object.prototype.hasOwnProperty, __commonJSMin = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports), __exportAll = (e, t) => {
	let n = {};
	for (var r in e) __defProp(n, r, {
		get: e[r],
		enumerable: !0
	});
	return t || __defProp(n, Symbol.toStringTag, { value: "Module" }), n;
}, __copyProps = (e, t, n, r) => {
	if (t && typeof t == "object" || typeof t == "function") for (var i = __getOwnPropNames(t), a = 0, o = i.length, s; a < o; a++) s = i[a], !__hasOwnProp.call(e, s) && s !== n && __defProp(e, s, {
		get: ((e) => t[e]).bind(null, s),
		enumerable: !(r = __getOwnPropDesc(t, s)) || r.enumerable
	});
	return e;
}, __toESM = (e, t, n) => (n = e == null ? {} : __create(__getProtoOf(e)), __copyProps(t || !e || !e.__esModule ? __defProp(n, "default", {
	value: e,
	enumerable: !0
}) : n, e)), _changeEvent = { type: "change" }, _startEvent = { type: "start" }, _endEvent = { type: "end" }, _EPS = 1e-6, _STATE = {
	NONE: -1,
	ROTATE: 0,
	ZOOM: 1,
	PAN: 2,
	TOUCH_ROTATE: 3,
	TOUCH_ZOOM_PAN: 4
}, _v2 = new Vector2(), _mouseChange = new Vector2(), _objectUp = new Vector3(), _pan = new Vector3(), _axis = new Vector3(), _quaternion$1 = new Quaternion(), _eyeDirection = new Vector3(), _objectUpDirection = new Vector3(), _objectSidewaysDirection = new Vector3(), _moveDirection = new Vector3(), TrackballControls = class extends Controls {
	constructor(e, t = null) {
		super(e, t), this.enabled = !0, this.screen = {
			left: 0,
			top: 0,
			width: 0,
			height: 0
		}, this.rotateSpeed = 1, this.zoomSpeed = 1.2, this.panSpeed = .3, this.noRotate = !1, this.noZoom = !1, this.noPan = !1, this.staticMoving = !1, this.dynamicDampingFactor = .2, this.minDistance = 0, this.maxDistance = Infinity, this.minZoom = 0, this.maxZoom = Infinity, this.keys = [
			"KeyA",
			"KeyS",
			"KeyD"
		], this.mouseButtons = {
			LEFT: MOUSE.ROTATE,
			MIDDLE: MOUSE.DOLLY,
			RIGHT: MOUSE.PAN
		}, this.state = _STATE.NONE, this.keyState = _STATE.NONE, this.target = new Vector3(), this._lastPosition = new Vector3(), this._lastZoom = 1, this._touchZoomDistanceStart = 0, this._touchZoomDistanceEnd = 0, this._lastAngle = 0, this._eye = new Vector3(), this._movePrev = new Vector2(), this._moveCurr = new Vector2(), this._lastAxis = new Vector3(), this._zoomStart = new Vector2(), this._zoomEnd = new Vector2(), this._panStart = new Vector2(), this._panEnd = new Vector2(), this._pointers = [], this._pointerPositions = {}, this._onPointerMove = onPointerMove.bind(this), this._onPointerDown = onPointerDown.bind(this), this._onPointerUp = onPointerUp.bind(this), this._onPointerCancel = onPointerCancel.bind(this), this._onContextMenu = onContextMenu.bind(this), this._onMouseWheel = onMouseWheel.bind(this), this._onKeyDown = onKeyDown.bind(this), this._onKeyUp = onKeyUp.bind(this), this._onTouchStart = onTouchStart.bind(this), this._onTouchMove = onTouchMove.bind(this), this._onTouchEnd = onTouchEnd.bind(this), this._onMouseDown = onMouseDown.bind(this), this._onMouseMove = onMouseMove.bind(this), this._onMouseUp = onMouseUp.bind(this), this._target0 = this.target.clone(), this._position0 = this.object.position.clone(), this._up0 = this.object.up.clone(), this._zoom0 = this.object.zoom, t !== null && (this.connect(), this.handleResize()), this.update();
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
		let e = this.domElement.getBoundingClientRect(), t = this.domElement.ownerDocument.documentElement;
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
				let e = (this.object.right - this.object.left) / this.object.zoom / this.domElement.clientWidth, t = (this.object.top - this.object.bottom) / this.object.zoom / this.domElement.clientWidth;
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
		return _v2.set((e - this.screen.left) / this.screen.width, (t - this.screen.top) / this.screen.height), _v2;
	}
	_getMouseOnCircle(e, t) {
		return _v2.set((e - this.screen.width * .5 - this.screen.left) / (this.screen.width * .5), (this.screen.height + 2 * (this.screen.top - t)) / this.screen.width), _v2;
	}
	_addPointer(e) {
		this._pointers.push(e);
	}
	_removePointer(e) {
		delete this._pointerPositions[e.pointerId];
		for (let t = 0; t < this._pointers.length; t++) if (this._pointers[t].pointerId == e.pointerId) {
			this._pointers.splice(t, 1);
			return;
		}
	}
	_trackPointer(e) {
		let t = this._pointerPositions[e.pointerId];
		t === void 0 && (t = new Vector2(), this._pointerPositions[e.pointerId] = t), t.set(e.pageX, e.pageY);
	}
	_getSecondPointerPosition(e) {
		let t = e.pointerId === this._pointers[0].pointerId ? this._pointers[1] : this._pointers[0];
		return this._pointerPositions[t.pointerId];
	}
	_checkDistances() {
		(!this.noZoom || !this.noPan) && (this._eye.lengthSq() > this.maxDistance * this.maxDistance && (this.object.position.addVectors(this.target, this._eye.setLength(this.maxDistance)), this._zoomStart.copy(this._zoomEnd)), this._eye.lengthSq() < this.minDistance * this.minDistance && (this.object.position.addVectors(this.target, this._eye.setLength(this.minDistance)), this._zoomStart.copy(this._zoomEnd)));
	}
};
function onPointerDown(e) {
	this.enabled !== !1 && (this._pointers.length === 0 && (this.domElement.setPointerCapture(e.pointerId), this.domElement.addEventListener("pointermove", this._onPointerMove), this.domElement.addEventListener("pointerup", this._onPointerUp)), this._addPointer(e), e.pointerType === "touch" ? this._onTouchStart(e) : this._onMouseDown(e));
}
function onPointerMove(e) {
	this.enabled !== !1 && (e.pointerType === "touch" ? this._onTouchMove(e) : this._onMouseMove(e));
}
function onPointerUp(e) {
	this.enabled !== !1 && (e.pointerType === "touch" ? this._onTouchEnd(e) : this._onMouseUp(), this._removePointer(e), this._pointers.length === 0 && (this.domElement.releasePointerCapture(e.pointerId), this.domElement.removeEventListener("pointermove", this._onPointerMove), this.domElement.removeEventListener("pointerup", this._onPointerUp)));
}
function onPointerCancel(e) {
	this._removePointer(e);
}
function onKeyUp() {
	this.enabled !== !1 && (this.keyState = _STATE.NONE, window.addEventListener("keydown", this._onKeyDown));
}
function onKeyDown(e) {
	this.enabled !== !1 && (window.removeEventListener("keydown", this._onKeyDown), this.keyState === _STATE.NONE && (e.code === this.keys[_STATE.ROTATE] && !this.noRotate ? this.keyState = _STATE.ROTATE : e.code === this.keys[_STATE.ZOOM] && !this.noZoom ? this.keyState = _STATE.ZOOM : e.code === this.keys[_STATE.PAN] && !this.noPan && (this.keyState = _STATE.PAN)));
}
function onMouseDown(e) {
	let t;
	switch (e.button) {
		case 0:
			t = this.mouseButtons.LEFT;
			break;
		case 1:
			t = this.mouseButtons.MIDDLE;
			break;
		case 2:
			t = this.mouseButtons.RIGHT;
			break;
		default: t = -1;
	}
	switch (t) {
		case MOUSE.DOLLY:
			this.state = _STATE.ZOOM;
			break;
		case MOUSE.ROTATE:
			this.state = _STATE.ROTATE;
			break;
		case MOUSE.PAN:
			this.state = _STATE.PAN;
			break;
		default: this.state = _STATE.NONE;
	}
	let n = this.keyState === _STATE.NONE ? this.state : this.keyState;
	n === _STATE.ROTATE && !this.noRotate ? (this._moveCurr.copy(this._getMouseOnCircle(e.pageX, e.pageY)), this._movePrev.copy(this._moveCurr)) : n === _STATE.ZOOM && !this.noZoom ? (this._zoomStart.copy(this._getMouseOnScreen(e.pageX, e.pageY)), this._zoomEnd.copy(this._zoomStart)) : n === _STATE.PAN && !this.noPan && (this._panStart.copy(this._getMouseOnScreen(e.pageX, e.pageY)), this._panEnd.copy(this._panStart)), this.dispatchEvent(_startEvent);
}
function onMouseMove(e) {
	let t = this.keyState === _STATE.NONE ? this.state : this.keyState;
	t === _STATE.ROTATE && !this.noRotate ? (this._movePrev.copy(this._moveCurr), this._moveCurr.copy(this._getMouseOnCircle(e.pageX, e.pageY))) : t === _STATE.ZOOM && !this.noZoom ? this._zoomEnd.copy(this._getMouseOnScreen(e.pageX, e.pageY)) : t === _STATE.PAN && !this.noPan && this._panEnd.copy(this._getMouseOnScreen(e.pageX, e.pageY));
}
function onMouseUp() {
	this.state = _STATE.NONE, this.dispatchEvent(_endEvent);
}
function onMouseWheel(e) {
	if (this.enabled !== !1 && this.noZoom !== !0) {
		switch (e.preventDefault(), e.deltaMode) {
			case 2:
				this._zoomStart.y -= e.deltaY * .025;
				break;
			case 1:
				this._zoomStart.y -= e.deltaY * .01;
				break;
			default:
				this._zoomStart.y -= e.deltaY * 25e-5;
				break;
		}
		this.dispatchEvent(_startEvent), this.dispatchEvent(_endEvent);
	}
}
function onContextMenu(e) {
	this.enabled !== !1 && e.preventDefault();
}
function onTouchStart(e) {
	switch (this._trackPointer(e), this._pointers.length) {
		case 1:
			this.state = _STATE.TOUCH_ROTATE, this._moveCurr.copy(this._getMouseOnCircle(this._pointers[0].pageX, this._pointers[0].pageY)), this._movePrev.copy(this._moveCurr);
			break;
		default:
			this.state = _STATE.TOUCH_ZOOM_PAN;
			let e = this._pointers[0].pageX - this._pointers[1].pageX, t = this._pointers[0].pageY - this._pointers[1].pageY;
			this._touchZoomDistanceEnd = this._touchZoomDistanceStart = Math.sqrt(e * e + t * t);
			let n = (this._pointers[0].pageX + this._pointers[1].pageX) / 2, r = (this._pointers[0].pageY + this._pointers[1].pageY) / 2;
			this._panStart.copy(this._getMouseOnScreen(n, r)), this._panEnd.copy(this._panStart);
			break;
	}
	this.dispatchEvent(_startEvent);
}
function onTouchMove(e) {
	switch (this._trackPointer(e), this._pointers.length) {
		case 1:
			this._movePrev.copy(this._moveCurr), this._moveCurr.copy(this._getMouseOnCircle(e.pageX, e.pageY));
			break;
		default:
			let t = this._getSecondPointerPosition(e), n = e.pageX - t.x, r = e.pageY - t.y;
			this._touchZoomDistanceEnd = Math.sqrt(n * n + r * r);
			let i = (e.pageX + t.x) / 2, a = (e.pageY + t.y) / 2;
			this._panEnd.copy(this._getMouseOnScreen(i, a));
			break;
	}
}
function onTouchEnd(e) {
	switch (this._pointers.length) {
		case 0:
			this.state = _STATE.NONE;
			break;
		case 1:
			this.state = _STATE.TOUCH_ROTATE, this._moveCurr.copy(this._getMouseOnCircle(e.pageX, e.pageY)), this._movePrev.copy(this._moveCurr);
			break;
		case 2:
			this.state = _STATE.TOUCH_ZOOM_PAN;
			for (let t = 0; t < this._pointers.length; t++) if (this._pointers[t].pointerId !== e.pointerId) {
				let e = this._pointerPositions[this._pointers[t].pointerId];
				this._moveCurr.copy(this._getMouseOnCircle(e.x, e.y)), this._movePrev.copy(this._moveCurr);
				break;
			}
			break;
	}
	this.dispatchEvent(_endEvent);
}
//#endregion
//#region src/core/CameraController.js
var CameraController = class extends TrackballControls {
	constructor(e, t, n = {}) {
		super(e, t), this.cameras = /* @__PURE__ */ new Map(), this.activeCamera = "default", this.cameras.set("default", e), this._callbacks = /* @__PURE__ */ new Set(), this._views = {}, this._builtInViews = /* @__PURE__ */ new Set(), this.paramSchema = {
			rotateSpeed: {
				type: "number",
				label: "Rotation speed",
				min: 0,
				max: 5,
				step: .01,
				default: 2.5
			},
			zoomSpeed: {
				type: "number",
				label: "Zoom speed",
				min: 0,
				max: 5,
				step: .01,
				default: 1.2
			},
			panSpeed: {
				type: "number",
				label: "Pan speed",
				min: 0,
				max: 50,
				step: .05,
				default: 15
			},
			staticMoving: {
				type: "boolean",
				label: "Static moving",
				default: !0
			},
			minDistance: {
				type: "number",
				label: "Min Distance",
				min: 0,
				max: 1e3,
				step: .1,
				default: .1,
				gui: !1
			},
			maxDistance: {
				type: "number",
				label: "Max Distance",
				min: 0,
				max: 5e3,
				step: .1,
				default: 2500,
				gui: !1
			}
		};
		for (let [e, t] of Object.entries(this.paramSchema)) this[e] = t.default;
		e.near = -this.minDistance, e.far = this.maxDistance, e.updateProjectionMatrix(), this._storedRotateSpeed = this.rotateSpeed, this.setParams(n), this._initDefaultViews();
	}
	onChange(e) {
		return this._callbacks.add(e), () => this._callbacks.delete(e);
	}
	_emitChange() {
		this._callbacks.forEach((e) => e());
	}
	addCamera(e, t) {
		this.cameras.set(e, t);
	}
	_registerKeybinds() {
		let e = this.weas?.keybindManager;
		e?.registerHold && e.registerHold("rotateLock", {
			onPress: () => {
				this._storedRotateSpeed = this.rotateSpeed, this.rotateSpeed = 0;
			},
			onRelease: () => {
				this.rotateSpeed = this._storedRotateSpeed;
			}
		}, [["Shift"]]);
	}
	setCamera(e) {
		let t = this.cameras.get(e);
		if (!t || t === this.object) return;
		let n = this.object;
		t.position.copy(n.position), t.quaternion.copy(n.quaternion), t.up.copy(n.up), t.isOrthographicCamera && (t.zoom = n.zoom), t.isPerspectiveCamera && n.fov && (t.fov = n.fov), t.updateProjectionMatrix(), this.object = t, this.activeCamera = e, this.update(), this._emitChange();
	}
	listCameras() {
		return [...this.cameras.keys()];
	}
	setParams(e = {}) {
		Object.assign(this, e);
	}
	getParams() {
		let e = {};
		for (let [t, n] of Object.entries(this.paramSchema)) e[t] = this[t];
		return e;
	}
	resetSettings() {
		for (let [e, t] of Object.entries(this.paramSchema)) this[e] = t.default;
		this._emitChange(), this.update();
	}
	_initDefaultViews() {
		let e = this.object.position.distanceTo(this.target), t = {
			position: this.object.position.clone(),
			quaternion: this.object.quaternion.clone(),
			target: this.target.clone(),
			up: this.object.up.clone(),
			zoom: this.object.zoom
		}, n = [
			{
				name: "front",
				pos: [
					0,
					0,
					e
				],
				up: [
					0,
					1,
					0
				]
			},
			{
				name: "back",
				pos: [
					0,
					0,
					-e
				],
				up: [
					0,
					1,
					0
				]
			},
			{
				name: "right",
				pos: [
					e,
					0,
					0
				],
				up: [
					0,
					1,
					0
				]
			},
			{
				name: "left",
				pos: [
					-e,
					0,
					0
				],
				up: [
					0,
					1,
					0
				]
			},
			{
				name: "top",
				pos: [
					0,
					e,
					0
				],
				up: [
					0,
					0,
					1
				]
			},
			{
				name: "bottom",
				pos: [
					0,
					-e,
					0
				],
				up: [
					0,
					0,
					1
				]
			}
		];
		for (let { name: e, pos: t, up: r } of n) this.object.position.set(...t), this.object.up.set(...r), this.object.lookAt(this.target), this.saveView(e, !0);
		this.object.position.copy(t.position), this.object.quaternion.copy(t.quaternion), this.target.copy(t.target), this.object.up.copy(t.up), this.object.zoom = t.zoom, this.object.isOrthographicCamera && this.object.updateProjectionMatrix(), this.update();
	}
	update(...e) {
		super.update(...e);
	}
	view(e, t = {}) {
		let n = this._views[e];
		if (n) {
			if (this.object.position.copy(n.position), this.object.quaternion.copy(n.quaternion), this.object.up.copy(n.up), this.object.isOrthographicCamera ? this.object.zoom = n.zoom : this.object.fov = n.zoom, t.focus) {
				let e = new Vector3(...t.focus), r = this.object.position.clone().sub(n.target);
				this.object.position.copy(e.clone().add(r)), this.target.copy(e);
			} else this.target.copy(n.target);
			t.zoom !== void 0 && (this.object.zoom = t.zoom), this.object.updateProjectionMatrix(), this.update(), this._emitChange();
		}
	}
	saveView(e, t = !1) {
		this._views[e] = {
			position: this.object.position.clone(),
			quaternion: this.object.quaternion.clone(),
			target: this.target.clone(),
			up: this.object.up.clone(),
			zoom: this.object.zoom,
			timestamp: t ? void 0 : Date.now()
		}, t && this._builtInViews.add(e), this._emitChange();
	}
	removeView(e) {
		this._builtInViews.has(e) || (delete this._views[e], this._emitChange());
	}
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
	fitToScene(e, t = {}) {
		let { lookAt: n = null, direction: r = [
			0,
			0,
			1
		], zoom: i = 1, fov: a = this.object.fov, padding: o = 10 } = t, s = new Vector3(...r).normalize(), c = e.getBoundingBox(), l = n ? new Vector3(...n) : c.getCenter(new Vector3()), u = c.getSize(new Vector3()).length() + o, d;
		d = this.object.isPerspectiveCamera ? u / (2 * Math.tan(a * Math.PI / 360)) : u, this.object.position.copy(l.clone().add(s.multiplyScalar(d))), this.target.copy(l), this.object.lookAt(l), this.object.isOrthographicCamera ? this.object.zoom = i : this.object.fov = a, this.object.updateProjectionMatrix(), this.update();
	}
	fit(e) {
		if (!e || e.length === 0) return;
		let t = Infinity, n = Infinity, r = Infinity, i = -Infinity, a = -Infinity, o = -Infinity;
		for (let s of e) {
			let e = s[0], c = s[1], l = s[2];
			e < t && (t = e), c < n && (n = c), l < r && (r = l), e > i && (i = e), c > a && (a = c), l > o && (o = l);
		}
		let s = new Vector3((t + i) / 2, (n + a) / 2, (r + o) / 2), c = i - t, l = a - n, u = o - r, d = Math.sqrt(c * c + l * l + u * u), f = this.object, p;
		if (f.isPerspectiveCamera) {
			let e = f.fov * Math.PI / 180;
			p = d / 2 / Math.tan(e / 2);
		} else p = d;
		let m = f.position.clone().sub(this.target).normalize();
		this.target.copy(s), f.position.copy(s.clone().add(m.multiplyScalar(p))), f.updateProjectionMatrix(), this.update();
	}
	reset() {
		this._views.default && this.view("default");
	}
	exportState() {
		let e = this.object, t = e.position.toArray(), n = this.target.toArray(), r = t[0] - n[0], i = t[1] - n[1], a = t[2] - n[2], o = Math.sqrt(r * r + i * i + a * a), s = o > 0 ? [
			r / o,
			i / o,
			a / o
		] : [
			0,
			0,
			1
		];
		return {
			type: this.activeCamera,
			position: t,
			target: n,
			direction: s,
			distance: o,
			zoom: e.zoom,
			fov: e.fov,
			params: this.getParams()
		};
	}
	importState(e) {
		if (!e) return;
		e.type && this.setCamera(e.type);
		let t = this.object;
		e.position && t.position.fromArray(e.position), e.target && this.target.fromArray(e.target), t.isOrthographicCamera && e.zoom !== void 0 && (t.zoom = e.zoom), t.isPerspectiveCamera && e.fov !== void 0 && (t.fov = e.fov), t.updateProjectionMatrix(), this.update(), e.params && this.setParams(e.params);
	}
	toJSON(e = {}) {
		let { includeTimestamp: t = !0, timestampFormat: n = "readable" } = e, r = "exported";
		if (t) {
			let e;
			switch (n) {
				case "unix":
					e = Date.now();
					break;
				case "readable":
					e = (/* @__PURE__ */ new Date()).toLocaleString().replace(/[\/:, ]/g, "-");
					break;
				default: e = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
			}
			r = `exported-${e}`;
		}
		let i = {};
		for (let [e, t] of Object.entries(this._views)) this._builtInViews.has(e) || (i[e] = {
			position: t.position.toArray(),
			quaternion: t.quaternion.toArray(),
			target: t.target.toArray(),
			up: t.up.toArray(),
			zoom: t.zoom,
			timestamp: t.timestamp
		});
		return i[r] = {
			position: this.object.position.toArray(),
			quaternion: this.object.quaternion.toArray(),
			target: this.target.toArray(),
			up: this.object.up.toArray(),
			zoom: this.object.zoom,
			timestamp: Date.now()
		}, {
			version: "1.0",
			exported: Date.now(),
			params: this.getParams(),
			views: i
		};
	}
	fromJSON(e, t = {}) {
		let { keepExistingViews: n = !1, restoreLatestView: r = !0, specificView: i = null } = t;
		if (!e) return;
		if (e.params && this.setParams(e.params), e.views) {
			if (!n) for (let e of Object.keys(this._views)) this._builtInViews.has(e) || delete this._views[e];
			for (let [t, n] of Object.entries(e.views)) this._views[t] = {
				position: new Vector3().fromArray(n.position),
				quaternion: new THREE.Quaternion().fromArray(n.quaternion),
				target: new Vector3().fromArray(n.target),
				up: new Vector3().fromArray(n.up),
				zoom: n.zoom,
				timestamp: n.timestamp
			};
		}
		let a = null;
		if (i) a = i;
		else if (r && e.views) {
			let t = Object.keys(e.views).filter((t) => e.views[t]?.timestamp).sort((t, n) => {
				let r = e.views[t].timestamp || 0;
				return (e.views[n].timestamp || 0) - r;
			});
			t.length > 0 && (a = t[0]);
		}
		a && e.views && e.views[a] && this.view(a), this._emitChange();
	}
	saveTimestampedView(e = "snapshot") {
		let t = `${e}_${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}`;
		return this.saveView(t), this._views[t] && (this._views[t].timestamp = Date.now()), t;
	}
	getTimestampedViews() {
		return Object.entries(this._views).filter(([e, t]) => t?.timestamp).map(([e, t]) => ({
			name: e,
			timestamp: t.timestamp,
			date: new Date(t.timestamp),
			view: t
		})).sort((e, t) => t.timestamp - e.timestamp);
	}
	pruneTimestampedViews(e = 10) {
		let t = this.getTimestampedViews();
		if (t.length <= e) return;
		let n = t.slice(e);
		for (let { name: e } of n) this.removeView(e);
		this._emitChange();
	}
}, CSS2DObject = class extends Object3D {
	constructor(e = document.createElement("div")) {
		super(), this.isCSS2DObject = !0, this.element = e, this.element.style.position = "absolute", this.element.style.userSelect = "none", this.element.setAttribute("draggable", !1), this.center = new Vector2(.5, .5), this.addEventListener("removed", function() {
			this.traverse(function(e) {
				e.element instanceof Element && e.element.parentNode !== null && e.element.parentNode.removeChild(e.element);
			});
		});
	}
	copy(e, t) {
		return super.copy(e, t), this.element = e.element.cloneNode(!0), this.center = e.center, this;
	}
}, _vector = new Vector3(), _viewMatrix = new Matrix4(), _viewProjectionMatrix = new Matrix4(), _a = new Vector3(), _b = new Vector3(), CSS2DRenderer = class {
	constructor(e = {}) {
		let t = this, n, r, i, a, o = { objects: /* @__PURE__ */ new WeakMap() }, s = e.element === void 0 ? document.createElement("div") : e.element;
		s.style.overflow = "hidden", this.domElement = s, this.getSize = function() {
			return {
				width: n,
				height: r
			};
		}, this.render = function(e, t) {
			e.matrixWorldAutoUpdate === !0 && e.updateMatrixWorld(), t.parent === null && t.matrixWorldAutoUpdate === !0 && t.updateMatrixWorld(), _viewMatrix.copy(t.matrixWorldInverse), _viewProjectionMatrix.multiplyMatrices(t.projectionMatrix, _viewMatrix), l(e, e, t), f(e);
		}, this.setSize = function(e, t) {
			n = e, r = t, i = n / 2, a = r / 2, s.style.width = e + "px", s.style.height = t + "px";
		};
		function c(e) {
			e.isCSS2DObject && (e.element.style.display = "none");
			for (let t = 0, n = e.children.length; t < n; t++) c(e.children[t]);
		}
		function l(e, n, r) {
			if (e.visible === !1) {
				c(e);
				return;
			}
			if (e.isCSS2DObject) {
				_vector.setFromMatrixPosition(e.matrixWorld), _vector.applyMatrix4(_viewProjectionMatrix);
				let c = _vector.z >= -1 && _vector.z <= 1 && e.layers.test(r.layers) === !0, l = e.element;
				l.style.display = c === !0 ? "" : "none", c === !0 && (e.onBeforeRender(t, n, r), l.style.transform = "translate(" + -100 * e.center.x + "%," + -100 * e.center.y + "%)translate(" + (_vector.x * i + i) + "px," + (-_vector.y * a + a) + "px)", l.parentNode !== s && s.appendChild(l), e.onAfterRender(t, n, r));
				let d = { distanceToCameraSquared: u(r, e) };
				o.objects.set(e, d);
			}
			for (let t = 0, i = e.children.length; t < i; t++) l(e.children[t], n, r);
		}
		function u(e, t) {
			return _a.setFromMatrixPosition(e.matrixWorld), _b.setFromMatrixPosition(t.matrixWorld), _a.distanceToSquared(_b);
		}
		function d(e) {
			let t = [];
			return e.traverseVisible(function(e) {
				e.isCSS2DObject && t.push(e);
			}), t;
		}
		function f(e) {
			let t = d(e).sort(function(e, t) {
				return e.renderOrder === t.renderOrder ? o.objects.get(e).distanceToCameraSquared - o.objects.get(t).distanceToCameraSquared : t.renderOrder - e.renderOrder;
			}), n = t.length;
			for (let e = 0, r = t.length; e < r; e++) t[e].element.style.zIndex = n - e;
		}
	}
};
//#endregion
//#region node_modules/@babel/runtime/helpers/esm/extends.js
function _extends() {
	return _extends = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, _extends.apply(null, arguments);
}
//#endregion
//#region node_modules/mathjs/lib/esm/core/config.js
var DEFAULT_CONFIG = {
	relTol: 1e-12,
	absTol: 1e-15,
	matrix: "Matrix",
	number: "number",
	numberFallback: "number",
	precision: 64,
	predictable: !1,
	randomSeed: null,
	legacySubset: !1
};
//#endregion
//#region node_modules/mathjs/lib/esm/utils/customs.js
function getSafeProperty(e, t) {
	if (isSafeProperty(e, t)) return e[t];
	throw typeof e[t] == "function" && isSafeMethod(e, t) ? Error("Cannot access method \"" + t + "\" as a property") : Error("No access to property \"" + t + "\"");
}
function setSafeProperty(e, t, n) {
	if (isSafeProperty(e, t)) return e[t] = n, n;
	throw Error("No access to property \"" + t + "\"");
}
function isSafeProperty(e, t) {
	return !isPlainObject(e) && !Array.isArray(e) ? !1 : hasOwnProperty(safeNativeProperties, t) ? !0 : !(t in Object.prototype || t in Function.prototype);
}
function isSafeMethod(e, t) {
	return e == null || typeof e[t] != "function" || hasOwnProperty(e, t) && Object.getPrototypeOf && t in Object.getPrototypeOf(e) ? !1 : hasOwnProperty(safeNativeMethods, t) ? !0 : !(t in Object.prototype || t in Function.prototype);
}
function isPlainObject(e) {
	return typeof e == "object" && e && e.constructor === Object;
}
var safeNativeProperties = {
	length: !0,
	name: !0
}, safeNativeMethods = {
	toString: !0,
	valueOf: !0,
	toLocaleString: !0
}, ObjectWrappingMap = class {
	constructor(e) {
		this.wrappedObject = e, this[Symbol.iterator] = this.entries;
	}
	keys() {
		return Object.keys(this.wrappedObject).filter((e) => this.has(e)).values();
	}
	get(e) {
		return getSafeProperty(this.wrappedObject, e);
	}
	set(e, t) {
		return setSafeProperty(this.wrappedObject, e, t), this;
	}
	has(e) {
		return isSafeProperty(this.wrappedObject, e) && e in this.wrappedObject;
	}
	entries() {
		return mapIterator(this.keys(), (e) => [e, this.get(e)]);
	}
	forEach(e) {
		for (var t of this.keys()) e(this.get(t), t, this);
	}
	delete(e) {
		isSafeProperty(this.wrappedObject, e) && delete this.wrappedObject[e];
	}
	clear() {
		for (var e of this.keys()) this.delete(e);
	}
	get size() {
		return Object.keys(this.wrappedObject).length;
	}
};
function mapIterator(e, t) {
	return { next: () => {
		var n = e.next();
		return n.done ? n : {
			value: t(n.value),
			done: !1
		};
	} };
}
//#endregion
//#region node_modules/mathjs/lib/esm/utils/is.js
function isNumber(e) {
	return typeof e == "number";
}
function isBigNumber(e) {
	return !e || typeof e != "object" || typeof e.constructor != "function" ? !1 : e.isBigNumber === !0 && typeof e.constructor.prototype == "object" && e.constructor.prototype.isBigNumber === !0 || typeof e.constructor.isDecimal == "function" && e.constructor.isDecimal(e) === !0;
}
function isBigInt(e) {
	return typeof e == "bigint";
}
function isComplex(e) {
	return e && typeof e == "object" && Object.getPrototypeOf(e).isComplex === !0 || !1;
}
function isFraction(e) {
	return e && typeof e == "object" && Object.getPrototypeOf(e).isFraction === !0 || !1;
}
function isUnit(e) {
	return e && e.constructor.prototype.isUnit === !0 || !1;
}
function isString(e) {
	return typeof e == "string";
}
var isArray = Array.isArray;
function isMatrix(e) {
	return e && e.constructor.prototype.isMatrix === !0 || !1;
}
function isCollection(e) {
	return Array.isArray(e) || isMatrix(e);
}
function isDenseMatrix(e) {
	return e && e.isDenseMatrix && e.constructor.prototype.isMatrix === !0 || !1;
}
function isSparseMatrix(e) {
	return e && e.isSparseMatrix && e.constructor.prototype.isMatrix === !0 || !1;
}
function isRange(e) {
	return e && e.constructor.prototype.isRange === !0 || !1;
}
function isIndex(e) {
	return e && e.constructor.prototype.isIndex === !0 || !1;
}
function isBoolean(e) {
	return typeof e == "boolean";
}
function isResultSet(e) {
	return e && e.constructor.prototype.isResultSet === !0 || !1;
}
function isHelp(e) {
	return e && e.constructor.prototype.isHelp === !0 || !1;
}
function isFunction(e) {
	return typeof e == "function";
}
function isDate(e) {
	return e instanceof Date;
}
function isRegExp(e) {
	return e instanceof RegExp;
}
function isObject(e) {
	return !!(e && typeof e == "object" && e.constructor === Object && !isComplex(e) && !isFraction(e));
}
function isMap(e) {
	return e ? e instanceof Map || e instanceof ObjectWrappingMap || typeof e.set == "function" && typeof e.get == "function" && typeof e.keys == "function" && typeof e.has == "function" : !1;
}
function isNull(e) {
	return e === null;
}
function isUndefined(e) {
	return e === void 0;
}
function isAccessorNode(e) {
	return e && e.isAccessorNode === !0 && e.constructor.prototype.isNode === !0 || !1;
}
function isArrayNode(e) {
	return e && e.isArrayNode === !0 && e.constructor.prototype.isNode === !0 || !1;
}
function isAssignmentNode(e) {
	return e && e.isAssignmentNode === !0 && e.constructor.prototype.isNode === !0 || !1;
}
function isBlockNode(e) {
	return e && e.isBlockNode === !0 && e.constructor.prototype.isNode === !0 || !1;
}
function isConditionalNode(e) {
	return e && e.isConditionalNode === !0 && e.constructor.prototype.isNode === !0 || !1;
}
function isConstantNode(e) {
	return e && e.isConstantNode === !0 && e.constructor.prototype.isNode === !0 || !1;
}
function isFunctionAssignmentNode(e) {
	return e && e.isFunctionAssignmentNode === !0 && e.constructor.prototype.isNode === !0 || !1;
}
function isFunctionNode(e) {
	return e && e.isFunctionNode === !0 && e.constructor.prototype.isNode === !0 || !1;
}
function isIndexNode(e) {
	return e && e.isIndexNode === !0 && e.constructor.prototype.isNode === !0 || !1;
}
function isNode(e) {
	return e && e.isNode === !0 && e.constructor.prototype.isNode === !0 || !1;
}
function isObjectNode(e) {
	return e && e.isObjectNode === !0 && e.constructor.prototype.isNode === !0 || !1;
}
function isOperatorNode(e) {
	return e && e.isOperatorNode === !0 && e.constructor.prototype.isNode === !0 || !1;
}
function isParenthesisNode(e) {
	return e && e.isParenthesisNode === !0 && e.constructor.prototype.isNode === !0 || !1;
}
function isRangeNode(e) {
	return e && e.isRangeNode === !0 && e.constructor.prototype.isNode === !0 || !1;
}
function isRelationalNode(e) {
	return e && e.isRelationalNode === !0 && e.constructor.prototype.isNode === !0 || !1;
}
function isSymbolNode(e) {
	return e && e.isSymbolNode === !0 && e.constructor.prototype.isNode === !0 || !1;
}
function isChain(e) {
	return e && e.constructor.prototype.isChain === !0 || !1;
}
function typeOf(e) {
	var t = typeof e;
	return t === "object" ? e === null ? "null" : isBigNumber(e) ? "BigNumber" : e.constructor && e.constructor.name ? e.constructor.name : "Object" : t;
}
//#endregion
//#region node_modules/mathjs/lib/esm/utils/object.js
function clone$2(e) {
	var t = typeof e;
	if (t === "number" || t === "bigint" || t === "string" || t === "boolean" || e == null) return e;
	if (typeof e.clone == "function") return e.clone();
	if (Array.isArray(e)) return e.map(function(e) {
		return clone$2(e);
	});
	if (e instanceof Date) return new Date(e.valueOf());
	if (isBigNumber(e)) return e;
	if (isObject(e)) return mapObject(e, clone$2);
	if (t === "function") return e;
	throw TypeError(`Cannot clone: unknown type of value (value: ${e})`);
}
function mapObject(e, t) {
	var n = {};
	for (var r in e) hasOwnProperty(e, r) && (n[r] = t(e[r]));
	return n;
}
function extend(e, t) {
	for (var n in t) hasOwnProperty(t, n) && (e[n] = t[n]);
	return e;
}
function deepStrictEqual(e, t) {
	var n, r, i;
	if (Array.isArray(e)) {
		if (!Array.isArray(t) || e.length !== t.length) return !1;
		for (r = 0, i = e.length; r < i; r++) if (!deepStrictEqual(e[r], t[r])) return !1;
		return !0;
	} else if (typeof e == "function") return e === t;
	else if (e instanceof Object) {
		if (Array.isArray(t) || !(t instanceof Object)) return !1;
		for (n in e) if (!(n in t) || !deepStrictEqual(e[n], t[n])) return !1;
		for (n in t) if (!(n in e)) return !1;
		return !0;
	} else return e === t;
}
function hasOwnProperty(e, t) {
	return e && Object.hasOwnProperty.call(e, t);
}
function pickShallow(e, t) {
	for (var n = {}, r = 0; r < t.length; r++) {
		var i = t[r], a = e[i];
		a !== void 0 && (n[i] = a);
	}
	return n;
}
//#endregion
//#region node_modules/mathjs/lib/esm/core/function/config.js
var MATRIX_OPTIONS = ["Matrix", "Array"], NUMBER_OPTIONS = [
	"number",
	"BigNumber",
	"bigint",
	"Fraction"
], config$1 = function(e) {
	if (e) throw Error("The global config is readonly. \nPlease create a mathjs instance if you want to change the default configuration. \nExample:\n\n  import { create, all } from 'mathjs';\n  const mathjs = create(all);\n  mathjs.config({ number: 'BigNumber' });\n");
	return Object.freeze(DEFAULT_CONFIG);
};
_extends(config$1, DEFAULT_CONFIG, {
	MATRIX_OPTIONS,
	NUMBER_OPTIONS
});
//#endregion
//#region node_modules/typed-function/lib/umd/typed-function.js
var require_typed_function = /* @__PURE__ */ __commonJSMin(((e, t) => {
	(function(n, r) {
		typeof e == "object" && t !== void 0 ? t.exports = r() : typeof define == "function" && define.amd ? define(r) : (n = typeof globalThis < "u" ? globalThis : n || self, n.typed = r());
	})(e, (function() {
		function e() {
			return !0;
		}
		function t() {
			return !1;
		}
		function n() {}
		let r = "Argument is not a typed-function.";
		function i() {
			function a(e) {
				return typeof e == "object" && !!e && e.constructor === Object;
			}
			let o = [
				{
					name: "number",
					test: function(e) {
						return typeof e == "number";
					}
				},
				{
					name: "string",
					test: function(e) {
						return typeof e == "string";
					}
				},
				{
					name: "boolean",
					test: function(e) {
						return typeof e == "boolean";
					}
				},
				{
					name: "Function",
					test: function(e) {
						return typeof e == "function";
					}
				},
				{
					name: "Array",
					test: Array.isArray
				},
				{
					name: "Date",
					test: function(e) {
						return e instanceof Date;
					}
				},
				{
					name: "RegExp",
					test: function(e) {
						return e instanceof RegExp;
					}
				},
				{
					name: "Object",
					test: a
				},
				{
					name: "null",
					test: function(e) {
						return e === null;
					}
				},
				{
					name: "undefined",
					test: function(e) {
						return e === void 0;
					}
				}
			], s = {
				name: "any",
				test: e,
				isAny: !0
			}, c, l, u = 0, d = { createCount: 0 };
			function f(e) {
				let t = c.get(e);
				if (t) return t;
				let n = "Unknown type \"" + e + "\"", r = e.toLowerCase(), i;
				for (i of l) if (i.toLowerCase() === r) {
					n += ". Did you mean \"" + i + "\" ?";
					break;
				}
				throw TypeError(n);
			}
			function p(e) {
				let t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "any", n = t ? f(t).index : l.length, r = [];
				for (let t = 0; t < e.length; ++t) {
					if (!e[t] || typeof e[t].name != "string" || typeof e[t].test != "function") throw TypeError("Object with properties {name: string, test: function} expected");
					let i = e[t].name;
					if (c.has(i)) throw TypeError("Duplicate type name \"" + i + "\"");
					r.push(i), c.set(i, {
						name: i,
						test: e[t].test,
						isAny: e[t].isAny,
						index: n + t,
						conversionsTo: []
					});
				}
				let i = l.slice(n);
				l = l.slice(0, n).concat(r).concat(i);
				for (let e = n + r.length; e < l.length; ++e) c.get(l[e]).index = e;
			}
			function m() {
				c = /* @__PURE__ */ new Map(), l = [], u = 0, p([s], !1);
			}
			m(), p(o);
			function h() {
				let e;
				for (e of l) c.get(e).conversionsTo = [];
				u = 0;
			}
			function g(e) {
				let t = l.filter((t) => {
					let n = c.get(t);
					return !n.isAny && n.test(e);
				});
				return t.length ? t : ["any"];
			}
			function _(e) {
				return e && typeof e == "function" && "_typedFunctionData" in e;
			}
			function v(e, t, n) {
				if (!_(e)) throw TypeError(r);
				let i = n && n.exact, a = k(Array.isArray(t) ? t.join(",") : t), o = x(a);
				if (!i || o in e.signatures) {
					let t = e._typedFunctionData.signatureMap.get(o);
					if (t) return t;
				}
				let s = a.length, c;
				if (i) {
					c = [];
					let t;
					for (t in e.signatures) c.push(e._typedFunctionData.signatureMap.get(t));
				} else c = e._typedFunctionData.signatures;
				for (let e = 0; e < s; ++e) {
					let t = a[e], n = [], r;
					for (r of c) {
						let i = L(r.params, e);
						if (!(!i || t.restParam && !i.restParam)) {
							if (!i.hasAny) {
								let e = E(i);
								if (t.types.some((t) => !e.has(t.name))) continue;
							}
							n.push(r);
						}
					}
					if (c = n, c.length === 0) break;
				}
				let l;
				for (l of c) if (l.params.length <= s) return l;
				throw TypeError("Signature not found (signature: " + (e.name || "unnamed") + "(" + x(a, ", ") + "))");
			}
			function y(e, t, n) {
				return v(e, t, n).implementation;
			}
			function b(e, t) {
				let n = f(t);
				if (n.test(e)) return e;
				let r = n.conversionsTo;
				if (r.length === 0) throw Error("There are no conversions to " + t + " defined.");
				for (let t = 0; t < r.length; t++) if (f(r[t].from).test(e)) return r[t].convert(e);
				throw Error("Cannot convert " + e + " to " + t);
			}
			function x(e) {
				let t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : ",";
				return e.map((e) => e.name).join(t);
			}
			function w(e) {
				let t = e.indexOf("...") === 0, n = (t ? e.length > 3 ? e.slice(3) : "any" : e).split("|").map((e) => f(e.trim())), r = !1, i = t ? "..." : "";
				return {
					types: n.map(function(e) {
						return r = e.isAny || r, i += e.name + "|", {
							name: e.name,
							typeIndex: e.index,
							test: e.test,
							isAny: e.isAny,
							conversion: null,
							conversionIndex: -1
						};
					}),
					name: i.slice(0, -1),
					hasAny: r,
					hasConversion: !1,
					restParam: t
				};
			}
			function T(e) {
				let t = te(e.types.map((e) => e.name)), n = e.hasAny, r = e.name, i = t.map(function(e) {
					let t = f(e.from);
					return n = t.isAny || n, r += "|" + e.from, {
						name: e.from,
						typeIndex: t.index,
						test: t.test,
						isAny: t.isAny,
						conversion: e,
						conversionIndex: e.index
					};
				});
				return {
					types: e.types.concat(i),
					name: r,
					hasAny: n,
					hasConversion: i.length > 0,
					restParam: e.restParam
				};
			}
			function E(e) {
				return e.typeSet || (e.typeSet = /* @__PURE__ */ new Set(), e.types.forEach((t) => e.typeSet.add(t.name))), e.typeSet;
			}
			function k(e) {
				let t = [];
				if (typeof e != "string") throw TypeError("Signatures must be strings");
				let n = e.trim();
				if (n === "") return t;
				let r = n.split(",");
				for (let e = 0; e < r.length; ++e) {
					let n = w(r[e].trim());
					if (n.restParam && e !== r.length - 1) throw SyntaxError("Unexpected rest parameter \"" + r[e] + "\": only allowed for the last parameter");
					if (n.types.length === 0) return null;
					t.push(n);
				}
				return t;
			}
			function A(e) {
				let t = pe(e);
				return t ? t.restParam : !1;
			}
			function j(t) {
				if (!t || t.types.length === 0) return e;
				if (t.types.length === 1) return f(t.types[0].name).test;
				if (t.types.length === 2) {
					let e = f(t.types[0].name).test, n = f(t.types[1].name).test;
					return function(t) {
						return e(t) || n(t);
					};
				} else {
					let e = t.types.map(function(e) {
						return f(e.name).test;
					});
					return function(t) {
						for (let n = 0; n < e.length; n++) if (e[n](t)) return !0;
						return !1;
					};
				}
			}
			function M(e) {
				let t, n, r;
				if (A(e)) {
					t = fe(e).map(j);
					let n = t.length, r = j(pe(e)), i = function(e) {
						for (let t = n; t < e.length; t++) if (!r(e[t])) return !1;
						return !0;
					};
					return function(e) {
						for (let n = 0; n < t.length; n++) if (!t[n](e[n])) return !1;
						return i(e) && e.length >= n + 1;
					};
				} else if (e.length === 0) return function(e) {
					return e.length === 0;
				};
				else if (e.length === 1) return n = j(e[0]), function(e) {
					return n(e[0]) && e.length === 1;
				};
				else if (e.length === 2) return n = j(e[0]), r = j(e[1]), function(e) {
					return n(e[0]) && r(e[1]) && e.length === 2;
				};
				else return t = e.map(j), function(e) {
					for (let n = 0; n < t.length; n++) if (!t[n](e[n])) return !1;
					return e.length === t.length;
				};
			}
			function L(e, t) {
				return t < e.length ? e[t] : A(e) ? pe(e) : null;
			}
			function R(e, t) {
				let n = L(e, t);
				return n ? E(n) : /* @__PURE__ */ new Set();
			}
			function z(e) {
				return e.conversion === null || e.conversion === void 0;
			}
			function G(e, t) {
				let n = /* @__PURE__ */ new Set();
				return e.forEach((e) => {
					let r = R(e.params, t), i;
					for (i of r) n.add(i);
				}), n.has("any") ? ["any"] : Array.from(n);
			}
			function q(e, t, n) {
				let r, i, a = e || "unnamed", o = n, s;
				for (s = 0; s < t.length; s++) {
					let e = [];
					if (o.forEach((n) => {
						let r = j(L(n.params, s));
						(s < n.params.length || A(n.params)) && r(t[s]) && e.push(n);
					}), e.length === 0) {
						if (i = G(o, s), i.length > 0) {
							let e = g(t[s]);
							return r = /* @__PURE__ */ TypeError("Unexpected type of argument in function " + a + " (expected: " + i.join(" or ") + ", actual: " + e.join(" | ") + ", index: " + s + ")"), r.data = {
								category: "wrongType",
								fn: a,
								index: s,
								actual: e,
								expected: i
							}, r;
						}
					} else o = e;
				}
				let c = o.map(function(e) {
					return A(e.params) ? Infinity : e.params.length;
				});
				if (t.length < Math.min.apply(null, c)) return i = G(o, s), r = /* @__PURE__ */ TypeError("Too few arguments in function " + a + " (expected: " + i.join(" or ") + ", index: " + t.length + ")"), r.data = {
					category: "tooFewArgs",
					fn: a,
					index: t.length,
					expected: i
				}, r;
				let l = Math.max.apply(null, c);
				if (t.length > l) return r = /* @__PURE__ */ TypeError("Too many arguments in function " + a + " (expected: " + l + ", actual: " + t.length + ")"), r.data = {
					category: "tooManyArgs",
					fn: a,
					index: t.length,
					expectedLength: l
				}, r;
				let u = [];
				for (let e = 0; e < t.length; ++e) u.push(g(t[e]).join("|"));
				return r = /* @__PURE__ */ TypeError("Arguments of type \"" + u.join(", ") + "\" do not match any of the defined signatures of function " + a + "."), r.data = {
					category: "mismatch",
					actual: u
				}, r;
			}
			function J(e) {
				let t = l.length + 1;
				for (let n = 0; n < e.types.length; n++) t = Math.min(t, e.types[n].typeIndex);
				return t;
			}
			function Z(e) {
				let t = u + 1;
				for (let n = 0; n < e.types.length; n++) z(e.types[n]) || (t = Math.min(t, e.types[n].conversionIndex));
				return t;
			}
			function Q(e, t) {
				if (e.hasAny) {
					if (!t.hasAny) return .1;
				} else if (t.hasAny) return -.1;
				if (e.restParam) {
					if (!t.restParam) return .01;
				} else if (t.restParam) return -.01;
				let n = J(e) - J(t);
				if (n < 0) return -.001;
				if (n > 0) return .001;
				let r = Z(e), i = Z(t);
				if (e.hasConversion) {
					if (!t.hasConversion) return (1 + r) * 1e-6;
				} else if (t.hasConversion) return -(1 + i) * 1e-6;
				let a = r - i;
				return a < 0 ? -1e-7 : a > 0 ? 1e-7 : 0;
			}
			function ee(e, t) {
				let n = e.params, r = t.params, i = pe(n), a = pe(r), o = A(n), s = A(r);
				if (o && i.hasAny) {
					if (!s || !a.hasAny) return 1e7;
				} else if (s && a.hasAny) return -1e7;
				let c = 0, l = 0, u;
				for (u of n) u.hasAny && ++c, u.hasConversion && ++l;
				let d = 0, f = 0;
				for (u of r) u.hasAny && ++d, u.hasConversion && ++f;
				if (c !== d) return (c - d) * 1e6;
				if (o && i.hasConversion) {
					if (!s || !a.hasConversion) return 1e5;
				} else if (s && a.hasConversion) return -1e5;
				if (l !== f) return (l - f) * 1e4;
				if (o) {
					if (!s) return 1e3;
				} else if (s) return -1e3;
				let p = (n.length - r.length) * (o ? -100 : 100);
				if (p !== 0) return p;
				let m = [], h = 0;
				for (let e = 0; e < n.length; ++e) {
					let t = Q(n[e], r[e]);
					m.push(t), h += t;
				}
				if (h !== 0) return (h < 0 ? -10 : 10) + h;
				let g, _ = 9, v = _ / (m.length + 1);
				for (g of m) {
					if (g !== 0) return (g < 0 ? -_ : _) + g;
					_ -= v;
				}
				return 0;
			}
			function te(e) {
				if (e.length === 0) return [];
				let t = e.map(f);
				if (e.length === 1) return t[0].conversionsTo;
				let n = new Set(e), r = /* @__PURE__ */ new Set();
				for (let e = 0; e < t.length; ++e) for (let i of t[e].conversionsTo) n.has(i.from) || r.add(i.from);
				let i = [];
				for (let e of r) {
					let n = u + 1, r = null;
					for (let i = 0; i < t.length; ++i) for (let a of t[i].conversionsTo) a.from === e && a.index < n && (n = a.index, r = a);
					i.push(r);
				}
				return i;
			}
			function $(e, t) {
				let n = t, r = "";
				if (e.some((e) => e.hasConversion)) {
					let i = A(e), a = e.map(ne);
					r = a.map((e) => e.name).join(";"), n = function() {
						let e = [], n = i ? arguments.length - 1 : arguments.length;
						for (let t = 0; t < n; t++) e[t] = a[t](arguments[t]);
						return i && (e[n] = arguments[n].map(a[n])), t.apply(this, e);
					};
				}
				let i = n;
				if (A(e)) {
					let t = e.length - 1;
					i = function() {
						return n.apply(this, me(arguments, 0, t).concat([me(arguments, t)]));
					};
				}
				return r && Object.defineProperty(i, "name", { value: r }), i;
			}
			function ne(e) {
				let t, n, r, i, a = [], o = [], s = "";
				e.types.forEach(function(e) {
					e.conversion && (s += e.conversion.from + "~>" + e.conversion.to + ",", a.push(f(e.conversion.from).test), o.push(e.conversion.convert));
				}), s = s ? s.slice(0, -1) : "pass";
				let c = (e) => e;
				switch (o.length) {
					case 0: break;
					case 1:
						t = a[0], r = o[0], c = function(e) {
							return t(e) ? r(e) : e;
						};
						break;
					case 2:
						t = a[0], n = a[1], r = o[0], i = o[1], c = function(e) {
							return t(e) ? r(e) : n(e) ? i(e) : e;
						};
						break;
					default: c = function(e) {
						for (let t = 0; t < o.length; t++) if (a[t](e)) return o[t](e);
						return e;
					};
				}
				return Object.defineProperty(c, "name", { value: s }), c;
			}
			function ie(e) {
				function t(e, n, r) {
					if (n < e.length) {
						let i = e[n], a = [];
						if (i.restParam) {
							let e = i.types.filter(z);
							e.length < i.types.length && a.push({
								types: e,
								name: "..." + e.map((e) => e.name).join("|"),
								hasAny: e.some((e) => e.isAny),
								hasConversion: !1,
								restParam: !0
							}), a.push(i);
						} else a = i.types.map(function(e) {
							return {
								types: [e],
								name: e.name,
								hasAny: e.isAny,
								hasConversion: e.conversion,
								restParam: !1
							};
						});
						return ge(a, function(i) {
							return t(e, n + 1, r.concat([i]));
						});
					} else return [r];
				}
				return t(e, 0, []);
			}
			function ae(e, t) {
				let n = Math.max(e.length, t.length);
				for (let r = 0; r < n; r++) {
					let n = R(e, r), i = R(t, r), a = !1, o;
					for (o of i) if (n.has(o)) {
						a = !0;
						break;
					}
					if (!a) return !1;
				}
				let r = e.length, i = t.length, a = A(e), o = A(t);
				return a ? o ? r === i : i >= r : o ? r >= i : r === i;
			}
			function oe(e) {
				return e.map((e) => xe(e) ? ye(e.referToSelf.callback) : be(e) ? ve(e.referTo.references, e.referTo.callback) : e);
			}
			function se(e, t, n) {
				let r = [], i;
				for (i of e) {
					let e = n[i];
					if (typeof e != "number") throw TypeError("No definition for referenced signature \"" + i + "\"");
					if (e = t[e], typeof e != "function") return !1;
					r.push(e);
				}
				return r;
			}
			function ce(e, t, n) {
				let r = oe(e), i = Array(r.length).fill(!1), a = !0;
				for (; a;) {
					a = !1;
					let e = !0;
					for (let o = 0; o < r.length; ++o) {
						if (i[o]) continue;
						let s = r[o];
						if (xe(s)) r[o] = s.referToSelf.callback(n), r[o].referToSelf = s.referToSelf, i[o] = !0, e = !1;
						else if (be(s)) {
							let n = se(s.referTo.references, r, t);
							n ? (r[o] = s.referTo.callback.apply(this, n), r[o].referTo = s.referTo, i[o] = !0, e = !1) : a = !0;
						}
					}
					if (e && a) throw SyntaxError("Circular reference detected in resolving typed.referTo");
				}
				return r;
			}
			function le(e) {
				let t = /\bthis(\(|\.signatures\b)/;
				Object.keys(e).forEach((n) => {
					let r = e[n];
					if (t.test(r.toString())) throw SyntaxError("Using `this` to self-reference a function is deprecated since typed-function@3. Use typed.referTo and typed.referToSelf instead.");
				});
			}
			function ue(e, r) {
				if (d.createCount++, Object.keys(r).length === 0) throw SyntaxError("No signatures provided");
				d.warnAgainstDeprecatedThis && le(r);
				let i = [], a = [], o = {}, s = [], c;
				for (c in r) {
					if (!Object.prototype.hasOwnProperty.call(r, c)) continue;
					let e = k(c);
					if (!e) continue;
					i.forEach(function(t) {
						if (ae(t, e)) throw TypeError("Conflicting signatures \"" + x(t) + "\" and \"" + x(e) + "\".");
					}), i.push(e);
					let t = a.length;
					a.push(r[c]);
					let n = e.map(T), l;
					for (l of ie(n)) {
						let e = x(l);
						s.push({
							params: l,
							name: e,
							fn: t
						}), l.every((e) => !e.hasConversion) && (o[e] = t);
					}
				}
				s.sort(ee);
				let l = ce(a, o, Oe), u;
				for (u in o) Object.prototype.hasOwnProperty.call(o, u) && (o[u] = l[o[u]]);
				let f = [], p = /* @__PURE__ */ new Map();
				for (u of s) p.has(u.name) || (u.fn = l[u.fn], f.push(u), p.set(u.name, u));
				let m = f[0] && f[0].params.length <= 2 && !A(f[0].params), h = f[1] && f[1].params.length <= 2 && !A(f[1].params), g = f[2] && f[2].params.length <= 2 && !A(f[2].params), _ = f[3] && f[3].params.length <= 2 && !A(f[3].params), v = f[4] && f[4].params.length <= 2 && !A(f[4].params), y = f[5] && f[5].params.length <= 2 && !A(f[5].params), b = m && h && g && _ && v && y;
				for (let e = 0; e < f.length; ++e) f[e].test = M(f[e].params);
				let w = m ? j(f[0].params[0]) : t, E = h ? j(f[1].params[0]) : t, L = g ? j(f[2].params[0]) : t, R = _ ? j(f[3].params[0]) : t, z = v ? j(f[4].params[0]) : t, G = y ? j(f[5].params[0]) : t, q = m ? j(f[0].params[1]) : t, J = h ? j(f[1].params[1]) : t, Z = g ? j(f[2].params[1]) : t, Q = _ ? j(f[3].params[1]) : t, te = v ? j(f[4].params[1]) : t, ne = y ? j(f[5].params[1]) : t;
				for (let e = 0; e < f.length; ++e) f[e].implementation = $(f[e].params, f[e].fn);
				let oe = m ? f[0].implementation : n, se = h ? f[1].implementation : n, ue = g ? f[2].implementation : n, de = _ ? f[3].implementation : n, fe = v ? f[4].implementation : n, pe = y ? f[5].implementation : n, me = m ? f[0].params.length : -1, he = h ? f[1].params.length : -1, ge = g ? f[2].params.length : -1, _e = _ ? f[3].params.length : -1, ve = v ? f[4].params.length : -1, ye = y ? f[5].params.length : -1, be = b ? 6 : 0, xe = f.length, we = f.map((e) => e.test), Ee = f.map((e) => e.implementation), De = function() {
					for (let e = be; e < xe; e++) if (we[e](arguments)) return Ee[e].apply(this, arguments);
					return d.onMismatch(e, arguments, f);
				};
				function Oe(e, t) {
					return arguments.length === me && w(e) && q(t) ? oe.apply(this, arguments) : arguments.length === he && E(e) && J(t) ? se.apply(this, arguments) : arguments.length === ge && L(e) && Z(t) ? ue.apply(this, arguments) : arguments.length === _e && R(e) && Q(t) ? de.apply(this, arguments) : arguments.length === ve && z(e) && te(t) ? fe.apply(this, arguments) : arguments.length === ye && G(e) && ne(t) ? pe.apply(this, arguments) : De.apply(this, arguments);
				}
				try {
					Object.defineProperty(Oe, "name", { value: e });
				} catch {}
				return Oe.signatures = o, Oe._typedFunctionData = {
					signatures: f,
					signatureMap: p
				}, Oe;
			}
			function de(e, t, n) {
				throw q(e, t, n);
			}
			function fe(e) {
				return me(e, 0, e.length - 1);
			}
			function pe(e) {
				return e[e.length - 1];
			}
			function me(e, t, n) {
				return Array.prototype.slice.call(e, t, n);
			}
			function he(e, t) {
				for (let n = 0; n < e.length; n++) if (t(e[n])) return e[n];
			}
			function ge(e, t) {
				return Array.prototype.concat.apply([], e.map(t));
			}
			function _e() {
				let e = fe(arguments).map((e) => x(k(e))), t = pe(arguments);
				if (typeof t != "function") throw TypeError("Callback function expected as last argument");
				return ve(e, t);
			}
			function ve(e, t) {
				return { referTo: {
					references: e,
					callback: t
				} };
			}
			function ye(e) {
				if (typeof e != "function") throw TypeError("Callback function expected as first argument");
				return { referToSelf: { callback: e } };
			}
			function be(e) {
				return e && typeof e.referTo == "object" && Array.isArray(e.referTo.references) && typeof e.referTo.callback == "function";
			}
			function xe(e) {
				return e && typeof e.referToSelf == "object" && typeof e.referToSelf.callback == "function";
			}
			function we(e, t) {
				if (!e) return t;
				if (t && t !== e) {
					let n = /* @__PURE__ */ Error("Function names do not match (expected: " + e + ", actual: " + t + ")");
					throw n.data = {
						actual: t,
						expected: e
					}, n;
				}
				return e;
			}
			function Ee(e) {
				let t;
				for (let n in e) Object.prototype.hasOwnProperty.call(e, n) && (_(e[n]) || typeof e[n].signature == "string") && (t = we(t, e[n].name));
				return t;
			}
			function De(e, t) {
				let n;
				for (n in t) if (Object.prototype.hasOwnProperty.call(t, n)) {
					if (n in e && t[n] !== e[n]) {
						let r = /* @__PURE__ */ Error("Signature \"" + n + "\" is defined twice");
						throw r.data = {
							signature: n,
							sourceFunction: t[n],
							destFunction: e[n]
						}, r;
					}
					e[n] = t[n];
				}
			}
			let Oe = d;
			d = function(e) {
				let t = typeof e == "string", n = t ? 1 : 0, r = t ? e : "", i = {};
				for (let e = n; e < arguments.length; ++e) {
					let n = arguments[e], o = {}, s;
					if (typeof n == "function" ? (s = n.name, typeof n.signature == "string" ? o[n.signature] = n : _(n) && (o = n.signatures)) : a(n) && (o = n, t || (s = Ee(n))), Object.keys(o).length === 0) {
						let t = /* @__PURE__ */ TypeError("Argument to 'typed' at index " + e + " is not a (typed) function, nor an object with signatures as keys and functions as values.");
						throw t.data = {
							index: e,
							argument: n
						}, t;
					}
					t || (r = we(r, s)), De(i, o);
				}
				return ue(r || "", i);
			}, d.create = i, d.createCount = Oe.createCount, d.onMismatch = de, d.throwMismatchError = de, d.createError = q, d.clear = m, d.clearConversions = h, d.addTypes = p, d._findType = f, d.referTo = _e, d.referToSelf = ye, d.convert = b, d.findSignature = v, d.find = y, d.isTypedFunction = _, d.warnAgainstDeprecatedThis = !0, d.addType = function(e, t) {
				let n = "any";
				t !== !1 && c.has("Object") && (n = "Object"), d.addTypes([e], n);
			};
			function ke(e) {
				if (!e || typeof e.from != "string" || typeof e.to != "string" || typeof e.convert != "function") throw TypeError("Object with properties {from: string, to: string, convert: function} expected");
				if (e.to === e.from) throw SyntaxError("Illegal to define conversion from \"" + e.from + "\" to itself.");
			}
			return d.addConversion = function(e) {
				let t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : { override: !1 };
				ke(e);
				let n = f(e.to), r = n.conversionsTo.find((t) => t.from === e.from);
				if (r) if (t && t.override) d.removeConversion({
					from: r.from,
					to: e.to,
					convert: r.convert
				});
				else throw Error("There is already a conversion from \"" + e.from + "\" to \"" + n.name + "\"");
				n.conversionsTo.push({
					from: e.from,
					to: n.name,
					convert: e.convert,
					index: u++
				});
			}, d.addConversions = function(e, t) {
				e.forEach((e) => d.addConversion(e, t));
			}, d.removeConversion = function(e) {
				ke(e);
				let t = f(e.to), n = he(t.conversionsTo, (t) => t.from === e.from);
				if (!n) throw Error("Attempt to remove nonexistent conversion from " + e.from + " to " + e.to);
				if (n.convert !== e.convert) throw Error("Conversion to remove does not match existing conversion");
				let r = t.conversionsTo.indexOf(n);
				t.conversionsTo.splice(r, 1);
			}, d.resolve = function(e, t) {
				if (!_(e)) throw TypeError(r);
				let n = e._typedFunctionData.signatures;
				for (let e = 0; e < n.length; ++e) if (n[e].test(t)) return n[e];
				return null;
			}, d;
		}
		return i();
	}));
}));
//#endregion
//#region node_modules/mathjs/lib/esm/utils/factory.js
function factory(e, t, n, r) {
	function i(r) {
		var i = pickShallow(r, t.map(stripOptionalNotation));
		return assertDependencies(e, t, r), n(i);
	}
	return i.isFactory = !0, i.fn = e, i.dependencies = t.slice().sort(), r && (i.meta = r), i;
}
function assertDependencies(e, t, n) {
	if (!t.filter((e) => !isOptionalDependency(e)).every((e) => n[e] !== void 0)) {
		var r = t.filter((e) => n[e] === void 0);
		throw Error(`Cannot create function "${e}", some dependencies are missing: ${r.map((e) => `"${e}"`).join(", ")}.`);
	}
}
function isOptionalDependency(e) {
	return e && e[0] === "?";
}
function stripOptionalNotation(e) {
	return e && e[0] === "?" ? e.slice(1) : e;
}
//#endregion
//#region node_modules/mathjs/lib/esm/utils/number.js
function isInteger$1(e) {
	return typeof e == "boolean" ? !0 : Number.isFinite(e) ? e === Math.round(e) : !1;
}
var sign$2 = Math.sign || function(e) {
	return e > 0 ? 1 : e < 0 ? -1 : 0;
}, log2$1 = Math.log2 || function(e) {
	return Math.log(e) / Math.LN2;
}, log10$1 = Math.log10 || function(e) {
	return Math.log(e) / Math.LN10;
}, log1p = Math.log1p || function(e) {
	return Math.log(e + 1);
}, cbrt$1 = Math.cbrt || function(e) {
	if (e === 0) return e;
	var t = e < 0, n;
	return t && (e = -e), Number.isFinite(e) ? (n = Math.exp(Math.log(e) / 3), n = (e / (n * n) + 2 * n) / 3) : n = e, t ? -n : n;
}, expm1 = Math.expm1 || function(e) {
	return e >= 2e-4 || e <= -2e-4 ? Math.exp(e) - 1 : e + e * e / 2 + e * e * e / 6;
};
function formatNumberToBase(e, t, n) {
	var r = {
		2: "0b",
		8: "0o",
		16: "0x"
	}[t], i = "";
	if (n) {
		if (n < 1) throw Error("size must be in greater than 0");
		if (!isInteger$1(n)) throw Error("size must be an integer");
		if (e > 2 ** (n - 1) - 1 || e < -(2 ** (n - 1))) throw Error(`Value must be in range [-2^${n - 1}, 2^${n - 1}-1]`);
		if (!isInteger$1(e)) throw Error("Value must be an integer");
		e < 0 && (e += 2 ** n), i = `i${n}`;
	}
	var a = "";
	return e < 0 && (e = -e, a = "-"), `${a}${r}${e.toString(t)}${i}`;
}
function format$2(e, t) {
	if (typeof t == "function") return t(e);
	if (e === Infinity) return "Infinity";
	if (e === -Infinity) return "-Infinity";
	if (isNaN(e)) return "NaN";
	var { notation: n, precision: r, wordSize: i } = normalizeFormatOptions(t);
	switch (n) {
		case "fixed": return toFixed$1(e, r);
		case "exponential": return toExponential$1(e, r);
		case "engineering": return toEngineering$1(e, r);
		case "bin": return formatNumberToBase(e, 2, i);
		case "oct": return formatNumberToBase(e, 8, i);
		case "hex": return formatNumberToBase(e, 16, i);
		case "auto": return toPrecision(e, r, t).replace(/((\.\d*?)(0+))($|e)/, function() {
			var e = arguments[2], t = arguments[4];
			return e === "." ? t : e + t;
		});
		default: throw Error("Unknown notation \"" + n + "\". Choose \"auto\", \"exponential\", \"fixed\", \"bin\", \"oct\", or \"hex.");
	}
}
function normalizeFormatOptions(e) {
	var t = "auto", n, r;
	if (e !== void 0) if (isNumber(e)) n = e;
	else if (isBigNumber(e)) n = e.toNumber();
	else if (isObject(e)) e.precision !== void 0 && (n = _toNumberOrThrow(e.precision, () => {
		throw Error("Option \"precision\" must be a number or BigNumber");
	})), e.wordSize !== void 0 && (r = _toNumberOrThrow(e.wordSize, () => {
		throw Error("Option \"wordSize\" must be a number or BigNumber");
	})), e.notation && (t = e.notation);
	else throw Error("Unsupported type of options, number, BigNumber, or object expected");
	return {
		notation: t,
		precision: n,
		wordSize: r
	};
}
function splitNumber(e) {
	var t = String(e).toLowerCase().match(/^(-?)(\d+\.?\d*)(e([+-]?\d+))?$/);
	if (!t) throw SyntaxError("Invalid number " + e);
	var n = t[1], r = t[2], i = parseFloat(t[4] || "0"), a = r.indexOf(".");
	i += a === -1 ? r.length - 1 : a - 1;
	var o = r.replace(".", "").replace(/^0*/, function(e) {
		return i -= e.length, "";
	}).replace(/0*$/, "").split("").map(function(e) {
		return parseInt(e);
	});
	return o.length === 0 && (o.push(0), i++), {
		sign: n,
		coefficients: o,
		exponent: i
	};
}
function toEngineering$1(e, t) {
	if (isNaN(e) || !Number.isFinite(e)) return String(e);
	var n = roundDigits(splitNumber(e), t), r = n.exponent, i = n.coefficients, a = r % 3 == 0 ? r : r < 0 ? r - 3 - r % 3 : r - r % 3;
	if (isNumber(t)) for (; t > i.length || r - a + 1 > i.length;) i.push(0);
	else for (var o = Math.abs(r - a) - (i.length - 1), s = 0; s < o; s++) i.push(0);
	for (var c = Math.abs(r - a), l = 1; c > 0;) l++, c--;
	var u = i.slice(l).join(""), d = isNumber(t) && u.length || u.match(/[1-9]/) ? "." + u : "", f = i.slice(0, l).join("") + d + "e" + (r >= 0 ? "+" : "") + a.toString();
	return n.sign + f;
}
function toFixed$1(e, t) {
	if (isNaN(e) || !Number.isFinite(e)) return String(e);
	var n = splitNumber(e), r = typeof t == "number" ? roundDigits(n, n.exponent + 1 + t) : n, i = r.coefficients, a = r.exponent + 1, o = a + (t || 0);
	return i.length < o && (i = i.concat(zeros$1(o - i.length))), a < 0 && (i = zeros$1(-a + 1).concat(i), a = 1), a < i.length && i.splice(a, 0, a === 0 ? "0." : "."), r.sign + i.join("");
}
function toExponential$1(e, t) {
	if (isNaN(e) || !Number.isFinite(Number(e))) return String(e);
	var n = splitNumber(e), r = t ? roundDigits(n, t) : n, i = r.coefficients, a = r.exponent;
	i.length < t && (i = i.concat(zeros$1(t - i.length)));
	var o = i.shift();
	return r.sign + o + (i.length > 0 ? "." + i.join("") : "") + "e" + (a >= 0 ? "+" : "") + a;
}
function toPrecision(e, t, n) {
	if (isNaN(e) || !Number.isFinite(e)) return String(e);
	var r = _toNumberOrDefault$1(n?.lowerExp, -3), i = _toNumberOrDefault$1(n?.upperExp, 5), a = splitNumber(e), o = t ? roundDigits(a, t) : a;
	if (o.exponent < r || o.exponent >= i) return toExponential$1(e, t);
	var s = o.coefficients, c = o.exponent;
	s.length < t && (s = s.concat(zeros$1(t - s.length))), s = s.concat(zeros$1(c - s.length + 1 + (s.length < t ? t - s.length : 0))), s = zeros$1(-c).concat(s);
	var l = c > 0 ? c : 0;
	return l < s.length - 1 && s.splice(l + 1, 0, "."), o.sign + s.join("");
}
function roundDigits(e, t) {
	for (var n = {
		sign: e.sign,
		coefficients: e.coefficients,
		exponent: e.exponent
	}, r = n.coefficients; t <= 0;) r.unshift(0), n.exponent++, t++;
	if (r.length > t && r.splice(t, r.length - t)[0] >= 5) {
		var i = t - 1;
		for (r[i]++; r[i] === 10;) r.pop(), i === 0 && (r.unshift(0), n.exponent++, i++), i--, r[i]++;
	}
	return n;
}
function zeros$1(e) {
	for (var t = [], n = 0; n < e; n++) t.push(0);
	return t;
}
function digits(e) {
	return e.toExponential().replace(/e.*$/, "").replace(/^0\.?0*|\./, "").length;
}
function nearlyEqual$1(e, t) {
	var n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 1e-8, r = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0;
	if (n <= 0) throw Error("Relative tolerance must be greater than 0");
	if (r < 0) throw Error("Absolute tolerance must be at least 0");
	return isNaN(e) || isNaN(t) ? !1 : !Number.isFinite(e) || !Number.isFinite(t) ? e === t : e === t ? !0 : Math.abs(e - t) <= Math.max(n * Math.max(Math.abs(e), Math.abs(t)), r);
}
function _toNumberOrThrow(e, t) {
	if (isNumber(e)) return e;
	if (isBigNumber(e)) return e.toNumber();
	t();
}
function _toNumberOrDefault$1(e, t) {
	return isNumber(e) ? e : isBigNumber(e) ? e.toNumber() : t;
}
//#endregion
//#region node_modules/mathjs/lib/esm/core/function/typed.js
var import_typed_function = /* @__PURE__ */ __toESM(require_typed_function(), 1), _createTyped2 = function() {
	return _createTyped2 = import_typed_function.default.create, import_typed_function.default;
}, dependencies$76 = [
	"?BigNumber",
	"?Complex",
	"?DenseMatrix",
	"?Fraction"
], createTyped = /* @__PURE__ */ factory("typed", dependencies$76, function(e) {
	var { BigNumber: t, Complex: n, DenseMatrix: r, Fraction: i } = e, a = _createTyped2();
	return a.clear(), a.addTypes([
		{
			name: "number",
			test: isNumber
		},
		{
			name: "Complex",
			test: isComplex
		},
		{
			name: "BigNumber",
			test: isBigNumber
		},
		{
			name: "bigint",
			test: isBigInt
		},
		{
			name: "Fraction",
			test: isFraction
		},
		{
			name: "Unit",
			test: isUnit
		},
		{
			name: "identifier",
			test: (e) => isString && /^(?:[A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u0870-\u0887\u0889-\u088F\u08A0-\u08C9\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C5C\u0C5D\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDC-\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u1711\u171F-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4C\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C8A\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BF\u31F0-\u31FF\u3400-\u4DBF\u4E00-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7DC\uA7F1-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF40\uDF42-\uDF49\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDD70-\uDD7A\uDD7C-\uDD8A\uDD8C-\uDD92\uDD94\uDD95\uDD97-\uDDA1\uDDA3-\uDDB1\uDDB3-\uDDB9\uDDBB\uDDBC\uDDC0-\uDDF3\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67\uDF80-\uDF85\uDF87-\uDFB0\uDFB2-\uDFBA]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD40-\uDD59\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDD00-\uDD23\uDD4A-\uDD65\uDD6F-\uDD85\uDE80-\uDEA9\uDEB0\uDEB1\uDEC2-\uDEC7\uDF00-\uDF1C\uDF27\uDF30-\uDF45\uDF70-\uDF81\uDFB0-\uDFC4\uDFE0-\uDFF6]|\uD804[\uDC03-\uDC37\uDC71\uDC72\uDC75\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD44\uDD47\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE3F\uDE40\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61\uDF80-\uDF89\uDF8B\uDF8E\uDF90-\uDFB5\uDFB7\uDFD1\uDFD3]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC5F-\uDC61\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDEB8\uDF00-\uDF1A\uDF40-\uDF46]|\uD806[\uDC00-\uDC2B\uDCA0-\uDCDF\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD2F\uDD3F\uDD41\uDDA0-\uDDA7\uDDAA-\uDDD0\uDDE1\uDDE3\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE89\uDE9D\uDEB0-\uDEF8\uDFC0-\uDFE0]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDDB0-\uDDDB\uDEE0-\uDEF2\uDF02\uDF04-\uDF10\uDF12-\uDF33\uDFB0]|\uD808[\uDC00-\uDF99]|\uD809[\uDC80-\uDD43]|\uD80B[\uDF90-\uDFF0]|[\uD80C\uD80E\uD80F\uD81C-\uD822\uD840-\uD868\uD86A-\uD86D\uD86F-\uD872\uD874-\uD879\uD880-\uD883\uD885-\uD88C][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2F\uDC41-\uDC46\uDC60-\uDFFF]|\uD810[\uDC00-\uDFFA]|\uD811[\uDC00-\uDE46]|\uD818[\uDD00-\uDD1D]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE70-\uDEBE\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDD40-\uDD6C\uDE40-\uDE7F\uDEA0-\uDEB8\uDEBB-\uDED3\uDF00-\uDF4A\uDF50\uDF93-\uDF9F\uDFE0\uDFE1\uDFE3\uDFF2\uDFF3]|\uD823[\uDC00-\uDCD5\uDCFF-\uDD1E\uDD80-\uDDF2]|\uD82B[\uDFF0-\uDFF3\uDFF5-\uDFFB\uDFFD\uDFFE]|\uD82C[\uDC00-\uDD22\uDD32\uDD50-\uDD52\uDD55\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD837[\uDF00-\uDF1E\uDF25-\uDF2A]|\uD838[\uDC30-\uDC6D\uDD00-\uDD2C\uDD37-\uDD3D\uDD4E\uDE90-\uDEAD\uDEC0-\uDEEB]|\uD839[\uDCD0-\uDCEB\uDDD0-\uDDED\uDDF0\uDEC0-\uDEDE\uDEE0-\uDEE2\uDEE4\uDEE5\uDEE7-\uDEED\uDEF0-\uDEF4\uDEFE\uDEFF\uDFE0-\uDFE6\uDFE8-\uDFEB\uDFED\uDFEE\uDFF0-\uDFFE]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43\uDD4B]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDEDF\uDF00-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEAD\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0\uDFF0-\uDFFF]|\uD87B[\uDC00-\uDE5D]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A\uDF50-\uDFFF]|\uD88D[\uDC00-\uDC79])(?:[0-9A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u0870-\u0887\u0889-\u088F\u08A0-\u08C9\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C5C\u0C5D\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDC-\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u1711\u171F-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4C\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C8A\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BF\u31F0-\u31FF\u3400-\u4DBF\u4E00-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7DC\uA7F1-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF40\uDF42-\uDF49\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDD70-\uDD7A\uDD7C-\uDD8A\uDD8C-\uDD92\uDD94\uDD95\uDD97-\uDDA1\uDDA3-\uDDB1\uDDB3-\uDDB9\uDDBB\uDDBC\uDDC0-\uDDF3\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67\uDF80-\uDF85\uDF87-\uDFB0\uDFB2-\uDFBA]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD40-\uDD59\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDD00-\uDD23\uDD4A-\uDD65\uDD6F-\uDD85\uDE80-\uDEA9\uDEB0\uDEB1\uDEC2-\uDEC7\uDF00-\uDF1C\uDF27\uDF30-\uDF45\uDF70-\uDF81\uDFB0-\uDFC4\uDFE0-\uDFF6]|\uD804[\uDC03-\uDC37\uDC71\uDC72\uDC75\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD44\uDD47\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE3F\uDE40\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61\uDF80-\uDF89\uDF8B\uDF8E\uDF90-\uDFB5\uDFB7\uDFD1\uDFD3]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC5F-\uDC61\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDEB8\uDF00-\uDF1A\uDF40-\uDF46]|\uD806[\uDC00-\uDC2B\uDCA0-\uDCDF\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD2F\uDD3F\uDD41\uDDA0-\uDDA7\uDDAA-\uDDD0\uDDE1\uDDE3\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE89\uDE9D\uDEB0-\uDEF8\uDFC0-\uDFE0]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDDB0-\uDDDB\uDEE0-\uDEF2\uDF02\uDF04-\uDF10\uDF12-\uDF33\uDFB0]|\uD808[\uDC00-\uDF99]|\uD809[\uDC80-\uDD43]|\uD80B[\uDF90-\uDFF0]|[\uD80C\uD80E\uD80F\uD81C-\uD822\uD840-\uD868\uD86A-\uD86D\uD86F-\uD872\uD874-\uD879\uD880-\uD883\uD885-\uD88C][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2F\uDC41-\uDC46\uDC60-\uDFFF]|\uD810[\uDC00-\uDFFA]|\uD811[\uDC00-\uDE46]|\uD818[\uDD00-\uDD1D]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE70-\uDEBE\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDD40-\uDD6C\uDE40-\uDE7F\uDEA0-\uDEB8\uDEBB-\uDED3\uDF00-\uDF4A\uDF50\uDF93-\uDF9F\uDFE0\uDFE1\uDFE3\uDFF2\uDFF3]|\uD823[\uDC00-\uDCD5\uDCFF-\uDD1E\uDD80-\uDDF2]|\uD82B[\uDFF0-\uDFF3\uDFF5-\uDFFB\uDFFD\uDFFE]|\uD82C[\uDC00-\uDD22\uDD32\uDD50-\uDD52\uDD55\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD837[\uDF00-\uDF1E\uDF25-\uDF2A]|\uD838[\uDC30-\uDC6D\uDD00-\uDD2C\uDD37-\uDD3D\uDD4E\uDE90-\uDEAD\uDEC0-\uDEEB]|\uD839[\uDCD0-\uDCEB\uDDD0-\uDDED\uDDF0\uDEC0-\uDEDE\uDEE0-\uDEE2\uDEE4\uDEE5\uDEE7-\uDEED\uDEF0-\uDEF4\uDEFE\uDEFF\uDFE0-\uDFE6\uDFE8-\uDFEB\uDFED\uDFEE\uDFF0-\uDFFE]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43\uDD4B]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDEDF\uDF00-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEAD\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0\uDFF0-\uDFFF]|\uD87B[\uDC00-\uDE5D]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A\uDF50-\uDFFF]|\uD88D[\uDC00-\uDC79])*$/.test(e)
		},
		{
			name: "string",
			test: isString
		},
		{
			name: "Chain",
			test: isChain
		},
		{
			name: "Array",
			test: isArray
		},
		{
			name: "Matrix",
			test: isMatrix
		},
		{
			name: "DenseMatrix",
			test: isDenseMatrix
		},
		{
			name: "SparseMatrix",
			test: isSparseMatrix
		},
		{
			name: "Range",
			test: isRange
		},
		{
			name: "Index",
			test: isIndex
		},
		{
			name: "boolean",
			test: isBoolean
		},
		{
			name: "ResultSet",
			test: isResultSet
		},
		{
			name: "Help",
			test: isHelp
		},
		{
			name: "function",
			test: isFunction
		},
		{
			name: "Date",
			test: isDate
		},
		{
			name: "RegExp",
			test: isRegExp
		},
		{
			name: "null",
			test: isNull
		},
		{
			name: "undefined",
			test: isUndefined
		},
		{
			name: "AccessorNode",
			test: isAccessorNode
		},
		{
			name: "ArrayNode",
			test: isArrayNode
		},
		{
			name: "AssignmentNode",
			test: isAssignmentNode
		},
		{
			name: "BlockNode",
			test: isBlockNode
		},
		{
			name: "ConditionalNode",
			test: isConditionalNode
		},
		{
			name: "ConstantNode",
			test: isConstantNode
		},
		{
			name: "FunctionNode",
			test: isFunctionNode
		},
		{
			name: "FunctionAssignmentNode",
			test: isFunctionAssignmentNode
		},
		{
			name: "IndexNode",
			test: isIndexNode
		},
		{
			name: "Node",
			test: isNode
		},
		{
			name: "ObjectNode",
			test: isObjectNode
		},
		{
			name: "OperatorNode",
			test: isOperatorNode
		},
		{
			name: "ParenthesisNode",
			test: isParenthesisNode
		},
		{
			name: "RangeNode",
			test: isRangeNode
		},
		{
			name: "RelationalNode",
			test: isRelationalNode
		},
		{
			name: "SymbolNode",
			test: isSymbolNode
		},
		{
			name: "Map",
			test: isMap
		},
		{
			name: "Object",
			test: isObject
		}
	]), a.addConversions([
		{
			from: "number",
			to: "BigNumber",
			convert: function(e) {
				if (t || throwNoBignumber(e), digits(e) > 15) throw TypeError("Cannot implicitly convert a number with >15 significant digits to BigNumber (value: " + e + "). Use function bignumber(x) to convert to BigNumber.");
				return new t(e);
			}
		},
		{
			from: "number",
			to: "Complex",
			convert: function(e) {
				return n || throwNoComplex(e), new n(e, 0);
			}
		},
		{
			from: "BigNumber",
			to: "Complex",
			convert: function(e) {
				return n || throwNoComplex(e), new n(e.toNumber(), 0);
			}
		},
		{
			from: "bigint",
			to: "number",
			convert: function(e) {
				if (e > 2 ** 53 - 1) throw TypeError("Cannot implicitly convert bigint to number: value exceeds the max safe integer value (value: " + e + ")");
				return Number(e);
			}
		},
		{
			from: "bigint",
			to: "BigNumber",
			convert: function(e) {
				return t || throwNoBignumber(e), new t(e.toString());
			}
		},
		{
			from: "bigint",
			to: "Fraction",
			convert: function(e) {
				return i || throwNoFraction(e), new i(e);
			}
		},
		{
			from: "Fraction",
			to: "BigNumber",
			convert: function(e) {
				throw TypeError("Cannot implicitly convert a Fraction to BigNumber or vice versa. Use function bignumber(x) to convert to BigNumber or fraction(x) to convert to Fraction.");
			}
		},
		{
			from: "Fraction",
			to: "Complex",
			convert: function(e) {
				return n || throwNoComplex(e), new n(e.valueOf(), 0);
			}
		},
		{
			from: "number",
			to: "Fraction",
			convert: function(e) {
				i || throwNoFraction(e);
				var t = new i(e);
				if (t.valueOf() !== e) throw TypeError("Cannot implicitly convert a number to a Fraction when there will be a loss of precision (value: " + e + "). Use function fraction(x) to convert to Fraction.");
				return t;
			}
		},
		{
			from: "string",
			to: "number",
			convert: function(e) {
				var t = Number(e);
				if (isNaN(t)) throw Error("Cannot convert \"" + e + "\" to a number");
				return t;
			}
		},
		{
			from: "string",
			to: "BigNumber",
			convert: function(e) {
				t || throwNoBignumber(e);
				try {
					return new t(e);
				} catch {
					throw Error("Cannot convert \"" + e + "\" to BigNumber");
				}
			}
		},
		{
			from: "string",
			to: "bigint",
			convert: function(e) {
				try {
					return BigInt(e);
				} catch {
					throw Error("Cannot convert \"" + e + "\" to BigInt");
				}
			}
		},
		{
			from: "string",
			to: "Fraction",
			convert: function(e) {
				i || throwNoFraction(e);
				try {
					return new i(e);
				} catch {
					throw Error("Cannot convert \"" + e + "\" to Fraction");
				}
			}
		},
		{
			from: "string",
			to: "Complex",
			convert: function(e) {
				n || throwNoComplex(e);
				try {
					return new n(e);
				} catch {
					throw Error("Cannot convert \"" + e + "\" to Complex");
				}
			}
		},
		{
			from: "boolean",
			to: "number",
			convert: function(e) {
				return +e;
			}
		},
		{
			from: "boolean",
			to: "BigNumber",
			convert: function(e) {
				return t || throwNoBignumber(e), new t(+e);
			}
		},
		{
			from: "boolean",
			to: "bigint",
			convert: function(e) {
				return BigInt(+e);
			}
		},
		{
			from: "boolean",
			to: "Fraction",
			convert: function(e) {
				return i || throwNoFraction(e), new i(+e);
			}
		},
		{
			from: "boolean",
			to: "string",
			convert: function(e) {
				return String(e);
			}
		},
		{
			from: "Array",
			to: "Matrix",
			convert: function(e) {
				return r || throwNoMatrix(), new r(e);
			}
		},
		{
			from: "Matrix",
			to: "Array",
			convert: function(e) {
				return e.valueOf();
			}
		}
	]), a.onMismatch = (e, t, n) => {
		var r = a.createError(e, t, n);
		if (["wrongType", "mismatch"].includes(r.data.category) && t.length === 1 && isCollection(t[0]) && n.some((e) => !e.params.includes(","))) {
			var i = TypeError(`Function '${e}' doesn't apply to matrices. To call it elementwise on a matrix 'M', try 'map(M, ${e})'.`);
			throw i.data = r.data, i;
		}
		throw r;
	}, a.onMismatch = (e, t, n) => {
		var r = a.createError(e, t, n);
		if (["wrongType", "mismatch"].includes(r.data.category) && t.length === 1 && isCollection(t[0]) && n.some((e) => !e.params.includes(","))) {
			var i = TypeError(`Function '${e}' doesn't apply to matrices. To call it elementwise on a matrix 'M', try 'map(M, ${e})'.`);
			throw i.data = r.data, i;
		}
		throw r;
	}, a;
});
function throwNoBignumber(e) {
	throw Error(`Cannot convert value ${e} into a BigNumber: no class 'BigNumber' provided`);
}
function throwNoComplex(e) {
	throw Error(`Cannot convert value ${e} into a Complex number: no class 'Complex' provided`);
}
function throwNoMatrix() {
	throw Error("Cannot convert array into a Matrix: no class 'DenseMatrix' provided");
}
function throwNoFraction(e) {
	throw Error(`Cannot convert value ${e} into a Fraction, no class 'Fraction' provided.`);
}
//#endregion
//#region node_modules/decimal.js/decimal.mjs
var EXP_LIMIT = 9e15, MAX_DIGITS = 1e9, NUMERALS = "0123456789abcdef", LN10 = "2.3025850929940456840179914546843642076011014886287729760333279009675726096773524802359972050895982983419677840422862486334095254650828067566662873690987816894829072083255546808437998948262331985283935053089653777326288461633662222876982198867465436674744042432743651550489343149393914796194044002221051017141748003688084012647080685567743216228355220114804663715659121373450747856947683463616792101806445070648000277502684916746550586856935673420670581136429224554405758925724208241314695689016758940256776311356919292033376587141660230105703089634572075440370847469940168269282808481184289314848524948644871927809676271275775397027668605952496716674183485704422507197965004714951050492214776567636938662976979522110718264549734772662425709429322582798502585509785265383207606726317164309505995087807523710333101197857547331541421808427543863591778117054309827482385045648019095610299291824318237525357709750539565187697510374970888692180205189339507238539205144634197265287286965110862571492198849978748873771345686209167058", PI = "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989380952572010654858632789", DEFAULTS = {
	precision: 20,
	rounding: 4,
	modulo: 1,
	toExpNeg: -7,
	toExpPos: 21,
	minE: -EXP_LIMIT,
	maxE: EXP_LIMIT,
	crypto: !1
}, inexact, quadrant, external = !0, decimalError = "[DecimalError] ", invalidArgument = decimalError + "Invalid argument: ", precisionLimitExceeded = decimalError + "Precision limit exceeded", cryptoUnavailable = decimalError + "crypto unavailable", tag = "[object Decimal]", mathfloor = Math.floor, mathpow = Math.pow, isBinary = /^0b([01]+(\.[01]*)?|\.[01]+)(p[+-]?\d+)?$/i, isHex = /^0x([0-9a-f]+(\.[0-9a-f]*)?|\.[0-9a-f]+)(p[+-]?\d+)?$/i, isOctal = /^0o([0-7]+(\.[0-7]*)?|\.[0-7]+)(p[+-]?\d+)?$/i, isDecimal = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i, BASE = 1e7, LOG_BASE = 7, MAX_SAFE_INTEGER = 9007199254740991, LN10_PRECISION = LN10.length - 1, PI_PRECISION = PI.length - 1, P$8 = { toStringTag: tag };
P$8.absoluteValue = P$8.abs = function() {
	var e = new this.constructor(this);
	return e.s < 0 && (e.s = 1), finalise(e);
}, P$8.ceil = function() {
	return finalise(new this.constructor(this), this.e + 1, 2);
}, P$8.clampedTo = P$8.clamp = function(e, t) {
	var n, r = this, i = r.constructor;
	if (e = new i(e), t = new i(t), !e.s || !t.s) return new i(NaN);
	if (e.gt(t)) throw Error(invalidArgument + t);
	return n = r.cmp(e), n < 0 ? e : r.cmp(t) > 0 ? t : new i(r);
}, P$8.comparedTo = P$8.cmp = function(e) {
	var t, n, r, i, a = this, o = a.d, s = (e = new a.constructor(e)).d, c = a.s, l = e.s;
	if (!o || !s) return !c || !l ? NaN : c === l ? o === s ? 0 : !o ^ c < 0 ? 1 : -1 : c;
	if (!o[0] || !s[0]) return o[0] ? c : s[0] ? -l : 0;
	if (c !== l) return c;
	if (a.e !== e.e) return a.e > e.e ^ c < 0 ? 1 : -1;
	for (r = o.length, i = s.length, t = 0, n = r < i ? r : i; t < n; ++t) if (o[t] !== s[t]) return o[t] > s[t] ^ c < 0 ? 1 : -1;
	return r === i ? 0 : r > i ^ c < 0 ? 1 : -1;
}, P$8.cosine = P$8.cos = function() {
	var e, t, n = this, r = n.constructor;
	return n.d ? n.d[0] ? (e = r.precision, t = r.rounding, r.precision = e + Math.max(n.e, n.sd()) + LOG_BASE, r.rounding = 1, n = cosine(r, toLessThanHalfPi(r, n)), r.precision = e, r.rounding = t, finalise(quadrant == 2 || quadrant == 3 ? n.neg() : n, e, t, !0)) : new r(1) : new r(NaN);
}, P$8.cubeRoot = P$8.cbrt = function() {
	var e, t, n, r, i, a, o, s, c, l, u = this, d = u.constructor;
	if (!u.isFinite() || u.isZero()) return new d(u);
	for (external = !1, a = u.s * mathpow(u.s * u, 1 / 3), !a || Math.abs(a) == Infinity ? (n = digitsToString(u.d), e = u.e, (a = (e - n.length + 1) % 3) && (n += a == 1 || a == -2 ? "0" : "00"), a = mathpow(n, 1 / 3), e = mathfloor((e + 1) / 3) - (e % 3 == (e < 0 ? -1 : 2)), a == Infinity ? n = "5e" + e : (n = a.toExponential(), n = n.slice(0, n.indexOf("e") + 1) + e), r = new d(n), r.s = u.s) : r = new d(a.toString()), o = (e = d.precision) + 3;;) if (s = r, c = s.times(s).times(s), l = c.plus(u), r = divide$1(l.plus(u).times(s), l.plus(c), o + 2, 1), digitsToString(s.d).slice(0, o) === (n = digitsToString(r.d)).slice(0, o)) if (n = n.slice(o - 3, o + 1), n == "9999" || !i && n == "4999") {
		if (!i && (finalise(s, e + 1, 0), s.times(s).times(s).eq(u))) {
			r = s;
			break;
		}
		o += 4, i = 1;
	} else {
		(!+n || !+n.slice(1) && n.charAt(0) == "5") && (finalise(r, e + 1, 1), t = !r.times(r).times(r).eq(u));
		break;
	}
	return external = !0, finalise(r, e, d.rounding, t);
}, P$8.decimalPlaces = P$8.dp = function() {
	var e, t = this.d, n = NaN;
	if (t) {
		if (e = t.length - 1, n = (e - mathfloor(this.e / LOG_BASE)) * LOG_BASE, e = t[e], e) for (; e % 10 == 0; e /= 10) n--;
		n < 0 && (n = 0);
	}
	return n;
}, P$8.dividedBy = P$8.div = function(e) {
	return divide$1(this, new this.constructor(e));
}, P$8.dividedToIntegerBy = P$8.divToInt = function(e) {
	var t = this, n = t.constructor;
	return finalise(divide$1(t, new n(e), 0, 1, 1), n.precision, n.rounding);
}, P$8.equals = P$8.eq = function(e) {
	return this.cmp(e) === 0;
}, P$8.floor = function() {
	return finalise(new this.constructor(this), this.e + 1, 3);
}, P$8.greaterThan = P$8.gt = function(e) {
	return this.cmp(e) > 0;
}, P$8.greaterThanOrEqualTo = P$8.gte = function(e) {
	var t = this.cmp(e);
	return t == 1 || t === 0;
}, P$8.hyperbolicCosine = P$8.cosh = function() {
	var e, t, n, r, i, a = this, o = a.constructor, s = new o(1);
	if (!a.isFinite()) return new o(a.s ? Infinity : NaN);
	if (a.isZero()) return s;
	n = o.precision, r = o.rounding, o.precision = n + Math.max(a.e, a.sd()) + 4, o.rounding = 1, i = a.d.length, i < 32 ? (e = Math.ceil(i / 3), t = (1 / tinyPow(4, e)).toString()) : (e = 16, t = "2.3283064365386962890625e-10"), a = taylorSeries(o, 1, a.times(t), new o(1), !0);
	for (var c, l = e, u = new o(8); l--;) c = a.times(a), a = s.minus(c.times(u.minus(c.times(u))));
	return finalise(a, o.precision = n, o.rounding = r, !0);
}, P$8.hyperbolicSine = P$8.sinh = function() {
	var e, t, n, r, i = this, a = i.constructor;
	if (!i.isFinite() || i.isZero()) return new a(i);
	if (t = a.precision, n = a.rounding, a.precision = t + Math.max(i.e, i.sd()) + 4, a.rounding = 1, r = i.d.length, r < 3) i = taylorSeries(a, 2, i, i, !0);
	else {
		e = 1.4 * Math.sqrt(r), e = e > 16 ? 16 : e | 0, i = i.times(1 / tinyPow(5, e)), i = taylorSeries(a, 2, i, i, !0);
		for (var o, s = new a(5), c = new a(16), l = new a(20); e--;) o = i.times(i), i = i.times(s.plus(o.times(c.times(o).plus(l))));
	}
	return a.precision = t, a.rounding = n, finalise(i, t, n, !0);
}, P$8.hyperbolicTangent = P$8.tanh = function() {
	var e, t, n = this, r = n.constructor;
	return n.isFinite() ? n.isZero() ? new r(n) : (e = r.precision, t = r.rounding, r.precision = e + 7, r.rounding = 1, divide$1(n.sinh(), n.cosh(), r.precision = e, r.rounding = t)) : new r(n.s);
}, P$8.inverseCosine = P$8.acos = function() {
	var e = this, t = e.constructor, n = e.abs().cmp(1), r = t.precision, i = t.rounding;
	return n === -1 ? e.isZero() ? getPi(t, r + 4, i).times(.5) : (t.precision = r + 6, t.rounding = 1, e = new t(1).minus(e).div(e.plus(1)).sqrt().atan(), t.precision = r, t.rounding = i, e.times(2)) : n === 0 ? e.isNeg() ? getPi(t, r, i) : new t(0) : new t(NaN);
}, P$8.inverseHyperbolicCosine = P$8.acosh = function() {
	var e, t, n = this, r = n.constructor;
	return n.lte(1) ? new r(n.eq(1) ? 0 : NaN) : n.isFinite() ? (e = r.precision, t = r.rounding, r.precision = e + Math.max(Math.abs(n.e), n.sd()) + 4, r.rounding = 1, external = !1, n = n.times(n).minus(1).sqrt().plus(n), external = !0, r.precision = e, r.rounding = t, n.ln()) : new r(n);
}, P$8.inverseHyperbolicSine = P$8.asinh = function() {
	var e, t, n = this, r = n.constructor;
	return !n.isFinite() || n.isZero() ? new r(n) : (e = r.precision, t = r.rounding, r.precision = e + 2 * Math.max(Math.abs(n.e), n.sd()) + 6, r.rounding = 1, external = !1, n = n.times(n).plus(1).sqrt().plus(n), external = !0, r.precision = e, r.rounding = t, n.ln());
}, P$8.inverseHyperbolicTangent = P$8.atanh = function() {
	var e, t, n, r, i = this, a = i.constructor;
	return i.isFinite() ? i.e >= 0 ? new a(i.abs().eq(1) ? i.s / 0 : i.isZero() ? i : NaN) : (e = a.precision, t = a.rounding, r = i.sd(), Math.max(r, e) < 2 * -i.e - 1 ? finalise(new a(i), e, t, !0) : (a.precision = n = r - i.e, i = divide$1(i.plus(1), new a(1).minus(i), n + e, 1), a.precision = e + 4, a.rounding = 1, i = i.ln(), a.precision = e, a.rounding = t, i.times(.5))) : new a(NaN);
}, P$8.inverseSine = P$8.asin = function() {
	var e, t, n, r, i = this, a = i.constructor;
	return i.isZero() ? new a(i) : (t = i.abs().cmp(1), n = a.precision, r = a.rounding, t === -1 ? (a.precision = n + 6, a.rounding = 1, i = i.div(new a(1).minus(i.times(i)).sqrt().plus(1)).atan(), a.precision = n, a.rounding = r, i.times(2)) : t === 0 ? (e = getPi(a, n + 4, r).times(.5), e.s = i.s, e) : new a(NaN));
}, P$8.inverseTangent = P$8.atan = function() {
	var e, t, n, r, i, a, o, s, c, l = this, u = l.constructor, d = u.precision, f = u.rounding;
	if (!l.isFinite()) {
		if (!l.s) return new u(NaN);
		if (d + 4 <= PI_PRECISION) return o = getPi(u, d + 4, f).times(.5), o.s = l.s, o;
	} else if (l.isZero()) return new u(l);
	else if (l.abs().eq(1) && d + 4 <= PI_PRECISION) return o = getPi(u, d + 4, f).times(.25), o.s = l.s, o;
	for (u.precision = s = d + 10, u.rounding = 1, n = Math.min(28, s / LOG_BASE + 2 | 0), e = n; e; --e) l = l.div(l.times(l).plus(1).sqrt().plus(1));
	for (external = !1, t = Math.ceil(s / LOG_BASE), r = 1, c = l.times(l), o = new u(l), i = l; e !== -1;) if (i = i.times(c), a = o.minus(i.div(r += 2)), i = i.times(c), o = a.plus(i.div(r += 2)), o.d[t] !== void 0) for (e = t; o.d[e] === a.d[e] && e--;);
	return n && (o = o.times(2 << n - 1)), external = !0, finalise(o, u.precision = d, u.rounding = f, !0);
}, P$8.isFinite = function() {
	return !!this.d;
}, P$8.isInteger = P$8.isInt = function() {
	return !!this.d && mathfloor(this.e / LOG_BASE) > this.d.length - 2;
}, P$8.isNaN = function() {
	return !this.s;
}, P$8.isNegative = P$8.isNeg = function() {
	return this.s < 0;
}, P$8.isPositive = P$8.isPos = function() {
	return this.s > 0;
}, P$8.isZero = function() {
	return !!this.d && this.d[0] === 0;
}, P$8.lessThan = P$8.lt = function(e) {
	return this.cmp(e) < 0;
}, P$8.lessThanOrEqualTo = P$8.lte = function(e) {
	return this.cmp(e) < 1;
}, P$8.logarithm = P$8.log = function(e) {
	var t, n, r, i, a, o, s, c, l = this, u = l.constructor, d = u.precision, f = u.rounding, p = 5;
	if (e == null) e = new u(10), t = !0;
	else {
		if (e = new u(e), n = e.d, e.s < 0 || !n || !n[0] || e.eq(1)) return new u(NaN);
		t = e.eq(10);
	}
	if (n = l.d, l.s < 0 || !n || !n[0] || l.eq(1)) return new u(n && !n[0] ? -Infinity : l.s == 1 ? n ? 0 : Infinity : NaN);
	if (t) if (n.length > 1) a = !0;
	else {
		for (i = n[0]; i % 10 == 0;) i /= 10;
		a = i !== 1;
	}
	if (external = !1, s = d + p, o = naturalLogarithm(l, s), r = t ? getLn10(u, s + 10) : naturalLogarithm(e, s), c = divide$1(o, r, s, 1), checkRoundingDigits(c.d, i = d, f)) do
		if (s += 10, o = naturalLogarithm(l, s), r = t ? getLn10(u, s + 10) : naturalLogarithm(e, s), c = divide$1(o, r, s, 1), !a) {
			+digitsToString(c.d).slice(i + 1, i + 15) + 1 == 0x5af3107a4000 && (c = finalise(c, d + 1, 0));
			break;
		}
	while (checkRoundingDigits(c.d, i += 10, f));
	return external = !0, finalise(c, d, f);
}, P$8.minus = P$8.sub = function(e) {
	var t, n, r, i, a, o, s, c, l, u, d, f, p = this, m = p.constructor;
	if (e = new m(e), !p.d || !e.d) return !p.s || !e.s ? e = new m(NaN) : p.d ? e.s = -e.s : e = new m(e.d || p.s !== e.s ? p : NaN), e;
	if (p.s != e.s) return e.s = -e.s, p.plus(e);
	if (l = p.d, f = e.d, s = m.precision, c = m.rounding, !l[0] || !f[0]) {
		if (f[0]) e.s = -e.s;
		else if (l[0]) e = new m(p);
		else return new m(c === 3 ? -0 : 0);
		return external ? finalise(e, s, c) : e;
	}
	if (n = mathfloor(e.e / LOG_BASE), u = mathfloor(p.e / LOG_BASE), l = l.slice(), a = u - n, a) {
		for (d = a < 0, d ? (t = l, a = -a, o = f.length) : (t = f, n = u, o = l.length), r = Math.max(Math.ceil(s / LOG_BASE), o) + 2, a > r && (a = r, t.length = 1), t.reverse(), r = a; r--;) t.push(0);
		t.reverse();
	} else {
		for (r = l.length, o = f.length, d = r < o, d && (o = r), r = 0; r < o; r++) if (l[r] != f[r]) {
			d = l[r] < f[r];
			break;
		}
		a = 0;
	}
	for (d && (t = l, l = f, f = t, e.s = -e.s), o = l.length, r = f.length - o; r > 0; --r) l[o++] = 0;
	for (r = f.length; r > a;) {
		if (l[--r] < f[r]) {
			for (i = r; i && l[--i] === 0;) l[i] = BASE - 1;
			--l[i], l[r] += BASE;
		}
		l[r] -= f[r];
	}
	for (; l[--o] === 0;) l.pop();
	for (; l[0] === 0; l.shift()) --n;
	return l[0] ? (e.d = l, e.e = getBase10Exponent(l, n), external ? finalise(e, s, c) : e) : new m(c === 3 ? -0 : 0);
}, P$8.modulo = P$8.mod = function(e) {
	var t, n = this, r = n.constructor;
	return e = new r(e), !n.d || !e.s || e.d && !e.d[0] ? new r(NaN) : !e.d || n.d && !n.d[0] ? finalise(new r(n), r.precision, r.rounding) : (external = !1, r.modulo == 9 ? (t = divide$1(n, e.abs(), 0, 3, 1), t.s *= e.s) : t = divide$1(n, e, 0, r.modulo, 1), t = t.times(e), external = !0, n.minus(t));
}, P$8.naturalExponential = P$8.exp = function() {
	return naturalExponential(this);
}, P$8.naturalLogarithm = P$8.ln = function() {
	return naturalLogarithm(this);
}, P$8.negated = P$8.neg = function() {
	var e = new this.constructor(this);
	return e.s = -e.s, finalise(e);
}, P$8.plus = P$8.add = function(e) {
	var t, n, r, i, a, o, s, c, l, u, d = this, f = d.constructor;
	if (e = new f(e), !d.d || !e.d) return !d.s || !e.s ? e = new f(NaN) : d.d || (e = new f(e.d || d.s === e.s ? d : NaN)), e;
	if (d.s != e.s) return e.s = -e.s, d.minus(e);
	if (l = d.d, u = e.d, s = f.precision, c = f.rounding, !l[0] || !u[0]) return u[0] || (e = new f(d)), external ? finalise(e, s, c) : e;
	if (a = mathfloor(d.e / LOG_BASE), r = mathfloor(e.e / LOG_BASE), l = l.slice(), i = a - r, i) {
		for (i < 0 ? (n = l, i = -i, o = u.length) : (n = u, r = a, o = l.length), a = Math.ceil(s / LOG_BASE), o = a > o ? a + 1 : o + 1, i > o && (i = o, n.length = 1), n.reverse(); i--;) n.push(0);
		n.reverse();
	}
	for (o = l.length, i = u.length, o - i < 0 && (i = o, n = u, u = l, l = n), t = 0; i;) t = (l[--i] = l[i] + u[i] + t) / BASE | 0, l[i] %= BASE;
	for (t && (l.unshift(t), ++r), o = l.length; l[--o] == 0;) l.pop();
	return e.d = l, e.e = getBase10Exponent(l, r), external ? finalise(e, s, c) : e;
}, P$8.precision = P$8.sd = function(e) {
	var t, n = this;
	if (e !== void 0 && e !== !!e && e !== 1 && e !== 0) throw Error(invalidArgument + e);
	return n.d ? (t = getPrecision(n.d), e && n.e + 1 > t && (t = n.e + 1)) : t = NaN, t;
}, P$8.round = function() {
	var e = this, t = e.constructor;
	return finalise(new t(e), e.e + 1, t.rounding);
}, P$8.sine = P$8.sin = function() {
	var e, t, n = this, r = n.constructor;
	return n.isFinite() ? n.isZero() ? new r(n) : (e = r.precision, t = r.rounding, r.precision = e + Math.max(n.e, n.sd()) + LOG_BASE, r.rounding = 1, n = sine(r, toLessThanHalfPi(r, n)), r.precision = e, r.rounding = t, finalise(quadrant > 2 ? n.neg() : n, e, t, !0)) : new r(NaN);
}, P$8.squareRoot = P$8.sqrt = function() {
	var e, t, n, r, i, a, o = this, s = o.d, c = o.e, l = o.s, u = o.constructor;
	if (l !== 1 || !s || !s[0]) return new u(!l || l < 0 && (!s || s[0]) ? NaN : s ? o : Infinity);
	for (external = !1, l = Math.sqrt(+o), l == 0 || l == Infinity ? (t = digitsToString(s), (t.length + c) % 2 == 0 && (t += "0"), l = Math.sqrt(t), c = mathfloor((c + 1) / 2) - (c < 0 || c % 2), l == Infinity ? t = "5e" + c : (t = l.toExponential(), t = t.slice(0, t.indexOf("e") + 1) + c), r = new u(t)) : r = new u(l.toString()), n = (c = u.precision) + 3;;) if (a = r, r = a.plus(divide$1(o, a, n + 2, 1)).times(.5), digitsToString(a.d).slice(0, n) === (t = digitsToString(r.d)).slice(0, n)) if (t = t.slice(n - 3, n + 1), t == "9999" || !i && t == "4999") {
		if (!i && (finalise(a, c + 1, 0), a.times(a).eq(o))) {
			r = a;
			break;
		}
		n += 4, i = 1;
	} else {
		(!+t || !+t.slice(1) && t.charAt(0) == "5") && (finalise(r, c + 1, 1), e = !r.times(r).eq(o));
		break;
	}
	return external = !0, finalise(r, c, u.rounding, e);
}, P$8.tangent = P$8.tan = function() {
	var e, t, n = this, r = n.constructor;
	return n.isFinite() ? n.isZero() ? new r(n) : (e = r.precision, t = r.rounding, r.precision = e + 10, r.rounding = 1, n = n.sin(), n.s = 1, n = divide$1(n, new r(1).minus(n.times(n)).sqrt(), e + 10, 0), r.precision = e, r.rounding = t, finalise(quadrant == 2 || quadrant == 4 ? n.neg() : n, e, t, !0)) : new r(NaN);
}, P$8.times = P$8.mul = function(e) {
	var t, n, r, i, a, o, s, c, l, u = this, d = u.constructor, f = u.d, p = (e = new d(e)).d;
	if (e.s *= u.s, !f || !f[0] || !p || !p[0]) return new d(!e.s || f && !f[0] && !p || p && !p[0] && !f ? NaN : !f || !p ? e.s / 0 : e.s * 0);
	for (n = mathfloor(u.e / LOG_BASE) + mathfloor(e.e / LOG_BASE), c = f.length, l = p.length, c < l && (a = f, f = p, p = a, o = c, c = l, l = o), a = [], o = c + l, r = o; r--;) a.push(0);
	for (r = l; --r >= 0;) {
		for (t = 0, i = c + r; i > r;) s = a[i] + p[r] * f[i - r - 1] + t, a[i--] = s % BASE | 0, t = s / BASE | 0;
		a[i] = (a[i] + t) % BASE | 0;
	}
	for (; !a[--o];) a.pop();
	return t ? ++n : a.shift(), e.d = a, e.e = getBase10Exponent(a, n), external ? finalise(e, d.precision, d.rounding) : e;
}, P$8.toBinary = function(e, t) {
	return toStringBinary(this, 2, e, t);
}, P$8.toDecimalPlaces = P$8.toDP = function(e, t) {
	var n = this, r = n.constructor;
	return n = new r(n), e === void 0 ? n : (checkInt32(e, 0, MAX_DIGITS), t === void 0 ? t = r.rounding : checkInt32(t, 0, 8), finalise(n, e + n.e + 1, t));
}, P$8.toExponential = function(e, t) {
	var n, r = this, i = r.constructor;
	return e === void 0 ? n = finiteToString(r, !0) : (checkInt32(e, 0, MAX_DIGITS), t === void 0 ? t = i.rounding : checkInt32(t, 0, 8), r = finalise(new i(r), e + 1, t), n = finiteToString(r, !0, e + 1)), r.isNeg() && !r.isZero() ? "-" + n : n;
}, P$8.toFixed = function(e, t) {
	var n, r, i = this, a = i.constructor;
	return e === void 0 ? n = finiteToString(i) : (checkInt32(e, 0, MAX_DIGITS), t === void 0 ? t = a.rounding : checkInt32(t, 0, 8), r = finalise(new a(i), e + i.e + 1, t), n = finiteToString(r, !1, e + r.e + 1)), i.isNeg() && !i.isZero() ? "-" + n : n;
}, P$8.toFraction = function(e) {
	var t, n, r, i, a, o, s, c, l, u, d, f, p = this, m = p.d, h = p.constructor;
	if (!m) return new h(p);
	if (l = n = new h(1), r = c = new h(0), t = new h(r), a = t.e = getPrecision(m) - p.e - 1, o = a % LOG_BASE, t.d[0] = mathpow(10, o < 0 ? LOG_BASE + o : o), e == null) e = a > 0 ? t : l;
	else {
		if (s = new h(e), !s.isInt() || s.lt(l)) throw Error(invalidArgument + s);
		e = s.gt(t) ? a > 0 ? t : l : s;
	}
	for (external = !1, s = new h(digitsToString(m)), u = h.precision, h.precision = a = m.length * LOG_BASE * 2; d = divide$1(s, t, 0, 1, 1), i = n.plus(d.times(r)), i.cmp(e) != 1;) n = r, r = i, i = l, l = c.plus(d.times(i)), c = i, i = t, t = s.minus(d.times(i)), s = i;
	return i = divide$1(e.minus(n), r, 0, 1, 1), c = c.plus(i.times(l)), n = n.plus(i.times(r)), c.s = l.s = p.s, f = divide$1(l, r, a, 1).minus(p).abs().cmp(divide$1(c, n, a, 1).minus(p).abs()) < 1 ? [l, r] : [c, n], h.precision = u, external = !0, f;
}, P$8.toHexadecimal = P$8.toHex = function(e, t) {
	return toStringBinary(this, 16, e, t);
}, P$8.toNearest = function(e, t) {
	var n = this, r = n.constructor;
	if (n = new r(n), e == null) {
		if (!n.d) return n;
		e = new r(1), t = r.rounding;
	} else {
		if (e = new r(e), t === void 0 ? t = r.rounding : checkInt32(t, 0, 8), !n.d) return e.s ? n : e;
		if (!e.d) return e.s &&= n.s, e;
	}
	return e.d[0] ? (external = !1, n = divide$1(n, e, 0, t, 1).times(e), external = !0, finalise(n)) : (e.s = n.s, n = e), n;
}, P$8.toNumber = function() {
	return +this;
}, P$8.toOctal = function(e, t) {
	return toStringBinary(this, 8, e, t);
}, P$8.toPower = P$8.pow = function(e) {
	var t, n, r, i, a, o, s = this, c = s.constructor, l = +(e = new c(e));
	if (!s.d || !e.d || !s.d[0] || !e.d[0]) return new c(mathpow(+s, l));
	if (s = new c(s), s.eq(1)) return s;
	if (r = c.precision, a = c.rounding, e.eq(1)) return finalise(s, r, a);
	if (t = mathfloor(e.e / LOG_BASE), t >= e.d.length - 1 && (n = l < 0 ? -l : l) <= MAX_SAFE_INTEGER) return i = intPow(c, s, n, r), e.s < 0 ? new c(1).div(i) : finalise(i, r, a);
	if (o = s.s, o < 0) {
		if (t < e.d.length - 1) return new c(NaN);
		if (e.d[t] & 1 || (o = 1), s.e == 0 && s.d[0] == 1 && s.d.length == 1) return s.s = o, s;
	}
	return n = mathpow(+s, l), t = n == 0 || !isFinite(n) ? mathfloor(l * (Math.log("0." + digitsToString(s.d)) / Math.LN10 + s.e + 1)) : new c(n + "").e, t > c.maxE + 1 || t < c.minE - 1 ? new c(t > 0 ? o / 0 : 0) : (external = !1, c.rounding = s.s = 1, n = Math.min(12, (t + "").length), i = naturalExponential(e.times(naturalLogarithm(s, r + n)), r), i.d && (i = finalise(i, r + 5, 1), checkRoundingDigits(i.d, r, a) && (t = r + 10, i = finalise(naturalExponential(e.times(naturalLogarithm(s, t + n)), t), t + 5, 1), +digitsToString(i.d).slice(r + 1, r + 15) + 1 == 0x5af3107a4000 && (i = finalise(i, r + 1, 0)))), i.s = o, external = !0, c.rounding = a, finalise(i, r, a));
}, P$8.toPrecision = function(e, t) {
	var n, r = this, i = r.constructor;
	return e === void 0 ? n = finiteToString(r, r.e <= i.toExpNeg || r.e >= i.toExpPos) : (checkInt32(e, 1, MAX_DIGITS), t === void 0 ? t = i.rounding : checkInt32(t, 0, 8), r = finalise(new i(r), e, t), n = finiteToString(r, e <= r.e || r.e <= i.toExpNeg, e)), r.isNeg() && !r.isZero() ? "-" + n : n;
}, P$8.toSignificantDigits = P$8.toSD = function(e, t) {
	var n = this, r = n.constructor;
	return e === void 0 ? (e = r.precision, t = r.rounding) : (checkInt32(e, 1, MAX_DIGITS), t === void 0 ? t = r.rounding : checkInt32(t, 0, 8)), finalise(new r(n), e, t);
}, P$8.toString = function() {
	var e = this, t = e.constructor, n = finiteToString(e, e.e <= t.toExpNeg || e.e >= t.toExpPos);
	return e.isNeg() && !e.isZero() ? "-" + n : n;
}, P$8.truncated = P$8.trunc = function() {
	return finalise(new this.constructor(this), this.e + 1, 1);
}, P$8.valueOf = P$8.toJSON = function() {
	var e = this, t = e.constructor, n = finiteToString(e, e.e <= t.toExpNeg || e.e >= t.toExpPos);
	return e.isNeg() ? "-" + n : n;
};
function digitsToString(e) {
	var t, n, r, i = e.length - 1, a = "", o = e[0];
	if (i > 0) {
		for (a += o, t = 1; t < i; t++) r = e[t] + "", n = LOG_BASE - r.length, n && (a += getZeroString(n)), a += r;
		o = e[t], r = o + "", n = LOG_BASE - r.length, n && (a += getZeroString(n));
	} else if (o === 0) return "0";
	for (; o % 10 == 0;) o /= 10;
	return a + o;
}
function checkInt32(e, t, n) {
	if (e !== ~~e || e < t || e > n) throw Error(invalidArgument + e);
}
function checkRoundingDigits(e, t, n, r) {
	var i, a, o, s;
	for (a = e[0]; a >= 10; a /= 10) --t;
	return --t < 0 ? (t += LOG_BASE, i = 0) : (i = Math.ceil((t + 1) / LOG_BASE), t %= LOG_BASE), a = mathpow(10, LOG_BASE - t), s = e[i] % a | 0, r == null ? t < 3 ? (t == 0 ? s = s / 100 | 0 : t == 1 && (s = s / 10 | 0), o = n < 4 && s == 99999 || n > 3 && s == 49999 || s == 5e4 || s == 0) : o = (n < 4 && s + 1 == a || n > 3 && s + 1 == a / 2) && (e[i + 1] / a / 100 | 0) == mathpow(10, t - 2) - 1 || (s == a / 2 || s == 0) && (e[i + 1] / a / 100 | 0) == 0 : t < 4 ? (t == 0 ? s = s / 1e3 | 0 : t == 1 ? s = s / 100 | 0 : t == 2 && (s = s / 10 | 0), o = (r || n < 4) && s == 9999 || !r && n > 3 && s == 4999) : o = ((r || n < 4) && s + 1 == a || !r && n > 3 && s + 1 == a / 2) && (e[i + 1] / a / 1e3 | 0) == mathpow(10, t - 3) - 1, o;
}
function convertBase(e, t, n) {
	for (var r, i = [0], a, o = 0, s = e.length; o < s;) {
		for (a = i.length; a--;) i[a] *= t;
		for (i[0] += NUMERALS.indexOf(e.charAt(o++)), r = 0; r < i.length; r++) i[r] > n - 1 && (i[r + 1] === void 0 && (i[r + 1] = 0), i[r + 1] += i[r] / n | 0, i[r] %= n);
	}
	return i.reverse();
}
function cosine(e, t) {
	var n, r, i;
	if (t.isZero()) return t;
	r = t.d.length, r < 32 ? (n = Math.ceil(r / 3), i = (1 / tinyPow(4, n)).toString()) : (n = 16, i = "2.3283064365386962890625e-10"), e.precision += n, t = taylorSeries(e, 1, t.times(i), new e(1));
	for (var a = n; a--;) {
		var o = t.times(t);
		t = o.times(o).minus(o).times(8).plus(1);
	}
	return e.precision -= n, t;
}
var divide$1 = (function() {
	function e(e, t, n) {
		var r, i = 0, a = e.length;
		for (e = e.slice(); a--;) r = e[a] * t + i, e[a] = r % n | 0, i = r / n | 0;
		return i && e.unshift(i), e;
	}
	function t(e, t, n, r) {
		var i, a;
		if (n != r) a = n > r ? 1 : -1;
		else for (i = a = 0; i < n; i++) if (e[i] != t[i]) {
			a = e[i] > t[i] ? 1 : -1;
			break;
		}
		return a;
	}
	function n(e, t, n, r) {
		for (var i = 0; n--;) e[n] -= i, i = e[n] < t[n] ? 1 : 0, e[n] = i * r + e[n] - t[n];
		for (; !e[0] && e.length > 1;) e.shift();
	}
	return function(r, i, a, o, s, c) {
		var l, u, d, f, p, m, h, g, _, v, y, b, x, w, T, E, k, A, j, M, L = r.constructor, R = r.s == i.s ? 1 : -1, z = r.d, G = i.d;
		if (!z || !z[0] || !G || !G[0]) return new L(!r.s || !i.s || (z ? G && z[0] == G[0] : !G) ? NaN : z && z[0] == 0 || !G ? R * 0 : R / 0);
		for (c ? (p = 1, u = r.e - i.e) : (c = BASE, p = LOG_BASE, u = mathfloor(r.e / p) - mathfloor(i.e / p)), j = G.length, k = z.length, _ = new L(R), v = _.d = [], d = 0; G[d] == (z[d] || 0); d++);
		if (G[d] > (z[d] || 0) && u--, a == null ? (w = a = L.precision, o = L.rounding) : w = s ? a + (r.e - i.e) + 1 : a, w < 0) v.push(1), m = !0;
		else {
			if (w = w / p + 2 | 0, d = 0, j == 1) {
				for (f = 0, G = G[0], w++; (d < k || f) && w--; d++) T = f * c + (z[d] || 0), v[d] = T / G | 0, f = T % G | 0;
				m = f || d < k;
			} else {
				for (f = c / (G[0] + 1) | 0, f > 1 && (G = e(G, f, c), z = e(z, f, c), j = G.length, k = z.length), E = j, y = z.slice(0, j), b = y.length; b < j;) y[b++] = 0;
				M = G.slice(), M.unshift(0), A = G[0], G[1] >= c / 2 && ++A;
				do
					f = 0, l = t(G, y, j, b), l < 0 ? (x = y[0], j != b && (x = x * c + (y[1] || 0)), f = x / A | 0, f > 1 ? (f >= c && (f = c - 1), h = e(G, f, c), g = h.length, b = y.length, l = t(h, y, g, b), l == 1 && (f--, n(h, j < g ? M : G, g, c))) : (f == 0 && (l = f = 1), h = G.slice()), g = h.length, g < b && h.unshift(0), n(y, h, b, c), l == -1 && (b = y.length, l = t(G, y, j, b), l < 1 && (f++, n(y, j < b ? M : G, b, c))), b = y.length) : l === 0 && (f++, y = [0]), v[d++] = f, l && y[0] ? y[b++] = z[E] || 0 : (y = [z[E]], b = 1);
				while ((E++ < k || y[0] !== void 0) && w--);
				m = y[0] !== void 0;
			}
			v[0] || v.shift();
		}
		if (p == 1) _.e = u, inexact = m;
		else {
			for (d = 1, f = v[0]; f >= 10; f /= 10) d++;
			_.e = d + u * p - 1, finalise(_, s ? a + _.e + 1 : a, o, m);
		}
		return _;
	};
})();
function finalise(e, t, n, r) {
	var i, a, o, s, c, l, u, d, f, p = e.constructor;
	out: if (t != null) {
		if (d = e.d, !d) return e;
		for (i = 1, s = d[0]; s >= 10; s /= 10) i++;
		if (a = t - i, a < 0) a += LOG_BASE, o = t, u = d[f = 0], c = u / mathpow(10, i - o - 1) % 10 | 0;
		else if (f = Math.ceil((a + 1) / LOG_BASE), s = d.length, f >= s) if (r) {
			for (; s++ <= f;) d.push(0);
			u = c = 0, i = 1, a %= LOG_BASE, o = a - LOG_BASE + 1;
		} else break out;
		else {
			for (u = s = d[f], i = 1; s >= 10; s /= 10) i++;
			a %= LOG_BASE, o = a - LOG_BASE + i, c = o < 0 ? 0 : u / mathpow(10, i - o - 1) % 10 | 0;
		}
		if (r = r || t < 0 || d[f + 1] !== void 0 || (o < 0 ? u : u % mathpow(10, i - o - 1)), l = n < 4 ? (c || r) && (n == 0 || n == (e.s < 0 ? 3 : 2)) : c > 5 || c == 5 && (n == 4 || r || n == 6 && (a > 0 ? o > 0 ? u / mathpow(10, i - o) : 0 : d[f - 1]) % 10 & 1 || n == (e.s < 0 ? 8 : 7)), t < 1 || !d[0]) return d.length = 0, l ? (t -= e.e + 1, d[0] = mathpow(10, (LOG_BASE - t % LOG_BASE) % LOG_BASE), e.e = -t || 0) : d[0] = e.e = 0, e;
		if (a == 0 ? (d.length = f, s = 1, f--) : (d.length = f + 1, s = mathpow(10, LOG_BASE - a), d[f] = o > 0 ? (u / mathpow(10, i - o) % mathpow(10, o) | 0) * s : 0), l) for (;;) if (f == 0) {
			for (a = 1, o = d[0]; o >= 10; o /= 10) a++;
			for (o = d[0] += s, s = 1; o >= 10; o /= 10) s++;
			a != s && (e.e++, d[0] == BASE && (d[0] = 1));
			break;
		} else {
			if (d[f] += s, d[f] != BASE) break;
			d[f--] = 0, s = 1;
		}
		for (a = d.length; d[--a] === 0;) d.pop();
	}
	return external && (e.e > p.maxE ? (e.d = null, e.e = NaN) : e.e < p.minE && (e.e = 0, e.d = [0])), e;
}
function finiteToString(e, t, n) {
	if (!e.isFinite()) return nonFiniteToString(e);
	var r, i = e.e, a = digitsToString(e.d), o = a.length;
	return t ? (n && (r = n - o) > 0 ? a = a.charAt(0) + "." + a.slice(1) + getZeroString(r) : o > 1 && (a = a.charAt(0) + "." + a.slice(1)), a = a + (e.e < 0 ? "e" : "e+") + e.e) : i < 0 ? (a = "0." + getZeroString(-i - 1) + a, n && (r = n - o) > 0 && (a += getZeroString(r))) : i >= o ? (a += getZeroString(i + 1 - o), n && (r = n - i - 1) > 0 && (a = a + "." + getZeroString(r))) : ((r = i + 1) < o && (a = a.slice(0, r) + "." + a.slice(r)), n && (r = n - o) > 0 && (i + 1 === o && (a += "."), a += getZeroString(r))), a;
}
function getBase10Exponent(e, t) {
	var n = e[0];
	for (t *= LOG_BASE; n >= 10; n /= 10) t++;
	return t;
}
function getLn10(e, t, n) {
	if (t > LN10_PRECISION) throw external = !0, n && (e.precision = n), Error(precisionLimitExceeded);
	return finalise(new e(LN10), t, 1, !0);
}
function getPi(e, t, n) {
	if (t > PI_PRECISION) throw Error(precisionLimitExceeded);
	return finalise(new e(PI), t, n, !0);
}
function getPrecision(e) {
	var t = e.length - 1, n = t * LOG_BASE + 1;
	if (t = e[t], t) {
		for (; t % 10 == 0; t /= 10) n--;
		for (t = e[0]; t >= 10; t /= 10) n++;
	}
	return n;
}
function getZeroString(e) {
	for (var t = ""; e--;) t += "0";
	return t;
}
function intPow(e, t, n, r) {
	var i, a = new e(1), o = Math.ceil(r / LOG_BASE + 4);
	for (external = !1;;) {
		if (n % 2 && (a = a.times(t), truncate(a.d, o) && (i = !0)), n = mathfloor(n / 2), n === 0) {
			n = a.d.length - 1, i && a.d[n] === 0 && ++a.d[n];
			break;
		}
		t = t.times(t), truncate(t.d, o);
	}
	return external = !0, a;
}
function isOdd(e) {
	return e.d[e.d.length - 1] & 1;
}
function maxOrMin(e, t, n) {
	for (var r, i, a = new e(t[0]), o = 0; ++o < t.length;) {
		if (i = new e(t[o]), !i.s) {
			a = i;
			break;
		}
		r = a.cmp(i), (r === n || r === 0 && a.s === n) && (a = i);
	}
	return a;
}
function naturalExponential(e, t) {
	var n, r, i, a, o, s, c, l = 0, u = 0, d = 0, f = e.constructor, p = f.rounding, m = f.precision;
	if (!e.d || !e.d[0] || e.e > 17) return new f(e.d ? e.d[0] ? e.s < 0 ? 0 : Infinity : 1 : e.s ? e.s < 0 ? 0 : e : NaN);
	for (t == null ? (external = !1, c = m) : c = t, s = new f(.03125); e.e > -2;) e = e.times(s), d += 5;
	for (r = Math.log(mathpow(2, d)) / Math.LN10 * 2 + 5 | 0, c += r, n = a = o = new f(1), f.precision = c;;) {
		if (a = finalise(a.times(e), c, 1), n = n.times(++u), s = o.plus(divide$1(a, n, c, 1)), digitsToString(s.d).slice(0, c) === digitsToString(o.d).slice(0, c)) {
			for (i = d; i--;) o = finalise(o.times(o), c, 1);
			if (t == null) if (l < 3 && checkRoundingDigits(o.d, c - r, p, l)) f.precision = c += 10, n = a = s = new f(1), u = 0, l++;
			else return finalise(o, f.precision = m, p, external = !0);
			else return f.precision = m, o;
		}
		o = s;
	}
}
function naturalLogarithm(e, t) {
	var n, r, i, a, o, s, c, l, u, d, f, p = 1, m = 10, h = e, g = h.d, _ = h.constructor, v = _.rounding, y = _.precision;
	if (h.s < 0 || !g || !g[0] || !h.e && g[0] == 1 && g.length == 1) return new _(g && !g[0] ? -Infinity : h.s == 1 ? g ? 0 : h : NaN);
	if (t == null ? (external = !1, u = y) : u = t, _.precision = u += m, n = digitsToString(g), r = n.charAt(0), Math.abs(a = h.e) < 0x5543df729c000) {
		for (; r < 7 && r != 1 || r == 1 && n.charAt(1) > 3;) h = h.times(e), n = digitsToString(h.d), r = n.charAt(0), p++;
		a = h.e, r > 1 ? (h = new _("0." + n), a++) : h = new _(r + "." + n.slice(1));
	} else return l = getLn10(_, u + 2, y).times(a + ""), h = naturalLogarithm(new _(r + "." + n.slice(1)), u - m).plus(l), _.precision = y, t == null ? finalise(h, y, v, external = !0) : h;
	for (d = h, c = o = h = divide$1(h.minus(1), h.plus(1), u, 1), f = finalise(h.times(h), u, 1), i = 3;;) {
		if (o = finalise(o.times(f), u, 1), l = c.plus(divide$1(o, new _(i), u, 1)), digitsToString(l.d).slice(0, u) === digitsToString(c.d).slice(0, u)) if (c = c.times(2), a !== 0 && (c = c.plus(getLn10(_, u + 2, y).times(a + ""))), c = divide$1(c, new _(p), u, 1), t == null) if (checkRoundingDigits(c.d, u - m, v, s)) _.precision = u += m, l = o = h = divide$1(d.minus(1), d.plus(1), u, 1), f = finalise(h.times(h), u, 1), i = s = 1;
		else return finalise(c, _.precision = y, v, external = !0);
		else return _.precision = y, c;
		c = l, i += 2;
	}
}
function nonFiniteToString(e) {
	return String(e.s * e.s / 0);
}
function parseDecimal(e, t) {
	var n, r, i;
	for ((n = t.indexOf(".")) > -1 && (t = t.replace(".", "")), (r = t.search(/e/i)) > 0 ? (n < 0 && (n = r), n += +t.slice(r + 1), t = t.substring(0, r)) : n < 0 && (n = t.length), r = 0; t.charCodeAt(r) === 48; r++);
	for (i = t.length; t.charCodeAt(i - 1) === 48; --i);
	if (t = t.slice(r, i), t) {
		if (i -= r, e.e = n = n - r - 1, e.d = [], r = (n + 1) % LOG_BASE, n < 0 && (r += LOG_BASE), r < i) {
			for (r && e.d.push(+t.slice(0, r)), i -= LOG_BASE; r < i;) e.d.push(+t.slice(r, r += LOG_BASE));
			t = t.slice(r), r = LOG_BASE - t.length;
		} else r -= i;
		for (; r--;) t += "0";
		e.d.push(+t), external && (e.e > e.constructor.maxE ? (e.d = null, e.e = NaN) : e.e < e.constructor.minE && (e.e = 0, e.d = [0]));
	} else e.e = 0, e.d = [0];
	return e;
}
function parseOther(e, t) {
	var n, r, i, a, o, s, c, l, u;
	if (t.indexOf("_") > -1) {
		if (t = t.replace(/(\d)_(?=\d)/g, "$1"), isDecimal.test(t)) return parseDecimal(e, t);
	} else if (t === "Infinity" || t === "NaN") return +t || (e.s = NaN), e.e = NaN, e.d = null, e;
	if (isHex.test(t)) n = 16, t = t.toLowerCase();
	else if (isBinary.test(t)) n = 2;
	else if (isOctal.test(t)) n = 8;
	else throw Error(invalidArgument + t);
	for (a = t.search(/p/i), a > 0 ? (c = +t.slice(a + 1), t = t.substring(2, a)) : t = t.slice(2), a = t.indexOf("."), o = a >= 0, r = e.constructor, o && (t = t.replace(".", ""), s = t.length, a = s - a, i = intPow(r, new r(n), a, a * 2)), l = convertBase(t, n, BASE), u = l.length - 1, a = u; l[a] === 0; --a) l.pop();
	return a < 0 ? new r(e.s * 0) : (e.e = getBase10Exponent(l, u), e.d = l, external = !1, o && (e = divide$1(e, i, s * 4)), c && (e = e.times(Math.abs(c) < 54 ? mathpow(2, c) : Decimal.pow(2, c))), external = !0, e);
}
function sine(e, t) {
	var n, r = t.d.length;
	if (r < 3) return t.isZero() ? t : taylorSeries(e, 2, t, t);
	n = 1.4 * Math.sqrt(r), n = n > 16 ? 16 : n | 0, t = t.times(1 / tinyPow(5, n)), t = taylorSeries(e, 2, t, t);
	for (var i, a = new e(5), o = new e(16), s = new e(20); n--;) i = t.times(t), t = t.times(a.plus(i.times(o.times(i).minus(s))));
	return t;
}
function taylorSeries(e, t, n, r, i) {
	var a, o, s, c, l = 1, u = e.precision, d = Math.ceil(u / LOG_BASE);
	for (external = !1, c = n.times(n), s = new e(r);;) {
		if (o = divide$1(s.times(c), new e(t++ * t++), u, 1), s = i ? r.plus(o) : r.minus(o), r = divide$1(o.times(c), new e(t++ * t++), u, 1), o = s.plus(r), o.d[d] !== void 0) {
			for (a = d; o.d[a] === s.d[a] && a--;);
			if (a == -1) break;
		}
		a = s, s = r, r = o, o = a, l++;
	}
	return external = !0, o.d.length = d + 1, o;
}
function tinyPow(e, t) {
	for (var n = e; --t;) n *= e;
	return n;
}
function toLessThanHalfPi(e, t) {
	var n, r = t.s < 0, i = getPi(e, e.precision, 1), a = i.times(.5);
	if (t = t.abs(), t.lte(a)) return quadrant = r ? 4 : 1, t;
	if (n = t.divToInt(i), n.isZero()) quadrant = r ? 3 : 2;
	else {
		if (t = t.minus(n.times(i)), t.lte(a)) return quadrant = isOdd(n) ? r ? 2 : 3 : r ? 4 : 1, t;
		quadrant = isOdd(n) ? r ? 1 : 4 : r ? 3 : 2;
	}
	return t.minus(i).abs();
}
function toStringBinary(e, t, n, r) {
	var i, a, o, s, c, l, u, d, f, p = e.constructor, m = n !== void 0;
	if (m ? (checkInt32(n, 1, MAX_DIGITS), r === void 0 ? r = p.rounding : checkInt32(r, 0, 8)) : (n = p.precision, r = p.rounding), !e.isFinite()) u = nonFiniteToString(e);
	else {
		for (u = finiteToString(e), o = u.indexOf("."), m ? (i = 2, t == 16 ? n = n * 4 - 3 : t == 8 && (n = n * 3 - 2)) : i = t, o >= 0 && (u = u.replace(".", ""), f = new p(1), f.e = u.length - o, f.d = convertBase(finiteToString(f), 10, i), f.e = f.d.length), d = convertBase(u, 10, i), a = c = d.length; d[--c] == 0;) d.pop();
		if (!d[0]) u = m ? "0p+0" : "0";
		else {
			if (o < 0 ? a-- : (e = new p(e), e.d = d, e.e = a, e = divide$1(e, f, n, r, 0, i), d = e.d, a = e.e, l = inexact), o = d[n], s = i / 2, l ||= d[n + 1] !== void 0, l = r < 4 ? (o !== void 0 || l) && (r === 0 || r === (e.s < 0 ? 3 : 2)) : o > s || o === s && (r === 4 || l || r === 6 && d[n - 1] & 1 || r === (e.s < 0 ? 8 : 7)), d.length = n, l) for (; ++d[--n] > i - 1;) d[n] = 0, n || (++a, d.unshift(1));
			for (c = d.length; !d[c - 1]; --c);
			for (o = 0, u = ""; o < c; o++) u += NUMERALS.charAt(d[o]);
			if (m) {
				if (c > 1) if (t == 16 || t == 8) {
					for (o = t == 16 ? 4 : 3, --c; c % o; c++) u += "0";
					for (d = convertBase(u, i, t), c = d.length; !d[c - 1]; --c);
					for (o = 1, u = "1."; o < c; o++) u += NUMERALS.charAt(d[o]);
				} else u = u.charAt(0) + "." + u.slice(1);
				u = u + (a < 0 ? "p" : "p+") + a;
			} else if (a < 0) {
				for (; ++a;) u = "0" + u;
				u = "0." + u;
			} else if (++a > c) for (a -= c; a--;) u += "0";
			else a < c && (u = u.slice(0, a) + "." + u.slice(a));
		}
		u = (t == 16 ? "0x" : t == 2 ? "0b" : t == 8 ? "0o" : "") + u;
	}
	return e.s < 0 ? "-" + u : u;
}
function truncate(e, t) {
	if (e.length > t) return e.length = t, !0;
}
function abs$1(e) {
	return new this(e).abs();
}
function acos$1(e) {
	return new this(e).acos();
}
function acosh(e) {
	return new this(e).acosh();
}
function add$1(e, t) {
	return new this(e).plus(t);
}
function asin(e) {
	return new this(e).asin();
}
function asinh(e) {
	return new this(e).asinh();
}
function atan$1(e) {
	return new this(e).atan();
}
function atanh(e) {
	return new this(e).atanh();
}
function atan2(e, t) {
	e = new this(e), t = new this(t);
	var n, r = this.precision, i = this.rounding, a = r + 4;
	return !e.s || !t.s ? n = new this(NaN) : !e.d && !t.d ? (n = getPi(this, a, 1).times(t.s > 0 ? .25 : .75), n.s = e.s) : !t.d || e.isZero() ? (n = t.s < 0 ? getPi(this, r, i) : new this(0), n.s = e.s) : !e.d || t.isZero() ? (n = getPi(this, a, 1).times(.5), n.s = e.s) : t.s < 0 ? (this.precision = a, this.rounding = 1, n = this.atan(divide$1(e, t, a, 1)), t = getPi(this, a, 1), this.precision = r, this.rounding = i, n = e.s < 0 ? n.minus(t) : n.plus(t)) : n = this.atan(divide$1(e, t, a, 1)), n;
}
function cbrt(e) {
	return new this(e).cbrt();
}
function ceil(e) {
	return finalise(e = new this(e), e.e + 1, 2);
}
function clamp$1(e, t, n) {
	return new this(e).clamp(t, n);
}
function config(e) {
	if (!e || typeof e != "object") throw Error(decimalError + "Object expected");
	var t, n, r, i = e.defaults === !0, a = [
		"precision",
		1,
		MAX_DIGITS,
		"rounding",
		0,
		8,
		"toExpNeg",
		-EXP_LIMIT,
		0,
		"toExpPos",
		0,
		EXP_LIMIT,
		"maxE",
		0,
		EXP_LIMIT,
		"minE",
		-EXP_LIMIT,
		0,
		"modulo",
		0,
		9
	];
	for (t = 0; t < a.length; t += 3) if (n = a[t], i && (this[n] = DEFAULTS[n]), (r = e[n]) !== void 0) if (mathfloor(r) === r && r >= a[t + 1] && r <= a[t + 2]) this[n] = r;
	else throw Error(invalidArgument + n + ": " + r);
	if (n = "crypto", i && (this[n] = DEFAULTS[n]), (r = e[n]) !== void 0) if (r === !0 || r === !1 || r === 0 || r === 1) if (r) if (typeof crypto < "u" && crypto && (crypto.getRandomValues || crypto.randomBytes)) this[n] = !0;
	else throw Error(cryptoUnavailable);
	else this[n] = !1;
	else throw Error(invalidArgument + n + ": " + r);
	return this;
}
function cos$1(e) {
	return new this(e).cos();
}
function cosh$1(e) {
	return new this(e).cosh();
}
function clone$1(e) {
	var t, n, r;
	function i(e) {
		var t, n, r, a = this;
		if (!(a instanceof i)) return new i(e);
		if (a.constructor = i, isDecimalInstance(e)) {
			a.s = e.s, external ? !e.d || e.e > i.maxE ? (a.e = NaN, a.d = null) : e.e < i.minE ? (a.e = 0, a.d = [0]) : (a.e = e.e, a.d = e.d.slice()) : (a.e = e.e, a.d = e.d ? e.d.slice() : e.d);
			return;
		}
		if (r = typeof e, r === "number") {
			if (e === 0) {
				a.s = 1 / e < 0 ? -1 : 1, a.e = 0, a.d = [0];
				return;
			}
			if (e < 0 ? (e = -e, a.s = -1) : a.s = 1, e === ~~e && e < 1e7) {
				for (t = 0, n = e; n >= 10; n /= 10) t++;
				external ? t > i.maxE ? (a.e = NaN, a.d = null) : t < i.minE ? (a.e = 0, a.d = [0]) : (a.e = t, a.d = [e]) : (a.e = t, a.d = [e]);
				return;
			}
			if (e * 0 != 0) {
				e || (a.s = NaN), a.e = NaN, a.d = null;
				return;
			}
			return parseDecimal(a, e.toString());
		}
		if (r === "string") return (n = e.charCodeAt(0)) === 45 ? (e = e.slice(1), a.s = -1) : (n === 43 && (e = e.slice(1)), a.s = 1), isDecimal.test(e) ? parseDecimal(a, e) : parseOther(a, e);
		if (r === "bigint") return e < 0 ? (e = -e, a.s = -1) : a.s = 1, parseDecimal(a, e.toString());
		throw Error(invalidArgument + e);
	}
	if (i.prototype = P$8, i.ROUND_UP = 0, i.ROUND_DOWN = 1, i.ROUND_CEIL = 2, i.ROUND_FLOOR = 3, i.ROUND_HALF_UP = 4, i.ROUND_HALF_DOWN = 5, i.ROUND_HALF_EVEN = 6, i.ROUND_HALF_CEIL = 7, i.ROUND_HALF_FLOOR = 8, i.EUCLID = 9, i.config = i.set = config, i.clone = clone$1, i.isDecimal = isDecimalInstance, i.abs = abs$1, i.acos = acos$1, i.acosh = acosh, i.add = add$1, i.asin = asin, i.asinh = asinh, i.atan = atan$1, i.atanh = atanh, i.atan2 = atan2, i.cbrt = cbrt, i.ceil = ceil, i.clamp = clamp$1, i.cos = cos$1, i.cosh = cosh$1, i.div = div, i.exp = exp, i.floor = floor, i.hypot = hypot$1, i.ln = ln, i.log = log, i.log10 = log10, i.log2 = log2, i.max = max, i.min = min, i.mod = mod, i.mul = mul, i.pow = pow$1, i.random = random, i.round = round, i.sign = sign$1, i.sin = sin$1, i.sinh = sinh$1, i.sqrt = sqrt$1, i.sub = sub, i.sum = sum, i.tan = tan, i.tanh = tanh, i.trunc = trunc, e === void 0 && (e = {}), e && e.defaults !== !0) for (r = [
		"precision",
		"rounding",
		"toExpNeg",
		"toExpPos",
		"maxE",
		"minE",
		"modulo",
		"crypto"
	], t = 0; t < r.length;) e.hasOwnProperty(n = r[t++]) || (e[n] = this[n]);
	return i.config(e), i;
}
function div(e, t) {
	return new this(e).div(t);
}
function exp(e) {
	return new this(e).exp();
}
function floor(e) {
	return finalise(e = new this(e), e.e + 1, 3);
}
function hypot$1() {
	var e, t, n = new this(0);
	for (external = !1, e = 0; e < arguments.length;) if (t = new this(arguments[e++]), t.d) n.d && (n = n.plus(t.times(t)));
	else {
		if (t.s) return external = !0, new this(Infinity);
		n = t;
	}
	return external = !0, n.sqrt();
}
function isDecimalInstance(e) {
	return e instanceof Decimal || e && e.toStringTag === tag || !1;
}
function ln(e) {
	return new this(e).ln();
}
function log(e, t) {
	return new this(e).log(t);
}
function log2(e) {
	return new this(e).log(2);
}
function log10(e) {
	return new this(e).log(10);
}
function max() {
	return maxOrMin(this, arguments, -1);
}
function min() {
	return maxOrMin(this, arguments, 1);
}
function mod(e, t) {
	return new this(e).mod(t);
}
function mul(e, t) {
	return new this(e).mul(t);
}
function pow$1(e, t) {
	return new this(e).pow(t);
}
function random(e) {
	var t, n, r, i, a = 0, o = new this(1), s = [];
	if (e === void 0 ? e = this.precision : checkInt32(e, 1, MAX_DIGITS), r = Math.ceil(e / LOG_BASE), !this.crypto) for (; a < r;) s[a++] = Math.random() * 1e7 | 0;
	else if (crypto.getRandomValues) for (t = crypto.getRandomValues(new Uint32Array(r)); a < r;) i = t[a], i >= 429e7 ? t[a] = crypto.getRandomValues(new Uint32Array(1))[0] : s[a++] = i % 1e7;
	else if (crypto.randomBytes) {
		for (t = crypto.randomBytes(r *= 4); a < r;) i = t[a] + (t[a + 1] << 8) + (t[a + 2] << 16) + ((t[a + 3] & 127) << 24), i >= 214e7 ? crypto.randomBytes(4).copy(t, a) : (s.push(i % 1e7), a += 4);
		a = r / 4;
	} else throw Error(cryptoUnavailable);
	for (r = s[--a], e %= LOG_BASE, r && e && (i = mathpow(10, LOG_BASE - e), s[a] = (r / i | 0) * i); s[a] === 0; a--) s.pop();
	if (a < 0) n = 0, s = [0];
	else {
		for (n = -1; s[0] === 0; n -= LOG_BASE) s.shift();
		for (r = 1, i = s[0]; i >= 10; i /= 10) r++;
		r < LOG_BASE && (n -= LOG_BASE - r);
	}
	return o.e = n, o.d = s, o;
}
function round(e) {
	return finalise(e = new this(e), e.e + 1, this.rounding);
}
function sign$1(e) {
	return e = new this(e), e.d ? e.d[0] ? e.s : 0 * e.s : e.s || NaN;
}
function sin$1(e) {
	return new this(e).sin();
}
function sinh$1(e) {
	return new this(e).sinh();
}
function sqrt$1(e) {
	return new this(e).sqrt();
}
function sub(e, t) {
	return new this(e).sub(t);
}
function sum() {
	var e = 0, t = arguments, n = new this(t[e]);
	for (external = !1; n.s && ++e < t.length;) n = n.plus(t[e]);
	return external = !0, finalise(n, this.precision, this.rounding);
}
function tan(e) {
	return new this(e).tan();
}
function tanh(e) {
	return new this(e).tanh();
}
function trunc(e) {
	return finalise(e = new this(e), e.e + 1, 1);
}
P$8[Symbol.for("nodejs.util.inspect.custom")] = P$8.toString, P$8[Symbol.toStringTag] = "Decimal";
var Decimal = P$8.constructor = clone$1(DEFAULTS);
LN10 = new Decimal(LN10), PI = new Decimal(PI);
//#endregion
//#region node_modules/mathjs/lib/esm/type/bignumber/BigNumber.js
var name$75 = "BigNumber", dependencies$75 = ["?on", "config"], createBigNumberClass = /* @__PURE__ */ factory(name$75, dependencies$75, (e) => {
	var { on: t, config: n } = e, r = Decimal.clone({
		precision: n.precision,
		modulo: Decimal.EUCLID
	});
	return r.prototype = Object.create(r.prototype), r.prototype.type = "BigNumber", r.prototype.isBigNumber = !0, r.prototype.toJSON = function() {
		return {
			mathjs: "BigNumber",
			value: this.toString()
		};
	}, r.fromJSON = function(e) {
		return new r(e.value);
	}, t && t("config", function(e, t) {
		e.precision !== t.precision && r.config({ precision: e.precision });
	}), r;
}, { isClass: !0 }), cosh = Math.cosh || function(e) {
	return Math.abs(e) < 1e-9 ? 1 - e : (Math.exp(e) + Math.exp(-e)) * .5;
}, sinh = Math.sinh || function(e) {
	return Math.abs(e) < 1e-9 ? e : (Math.exp(e) - Math.exp(-e)) * .5;
}, cosm1 = (e) => {
	let t = Math.sin(.5 * e);
	return -2 * t * t;
}, hypot = function(e, t) {
	return e = Math.abs(e), t = Math.abs(t), e < t && ([e, t] = [t, e]), e < 1e8 ? Math.sqrt(e * e + t * t) : (t /= e, e * Math.sqrt(1 + t * t));
}, parser_exit = function() {
	throw SyntaxError("Invalid Param");
};
function logHypot(e, t) {
	let n = Math.abs(e), r = Math.abs(t);
	return e === 0 ? Math.log(r) : t === 0 ? Math.log(n) : n < 3e3 && r < 3e3 ? Math.log(e * e + t * t) * .5 : (e *= .5, t *= .5, .5 * Math.log(e * e + t * t) + Math.LN2);
}
var P$7 = {
	re: 0,
	im: 0
}, parse$1 = function(e, t) {
	let n = P$7;
	if (e == null) n.re = n.im = 0;
	else if (t !== void 0) n.re = e, n.im = t;
	else switch (typeof e) {
		case "object":
			if ("im" in e && "re" in e) n.re = e.re, n.im = e.im;
			else if ("abs" in e && "arg" in e) {
				if (!isFinite(e.abs) && isFinite(e.arg)) return Complex$1.INFINITY;
				n.re = e.abs * Math.cos(e.arg), n.im = e.abs * Math.sin(e.arg);
			} else if ("r" in e && "phi" in e) {
				if (!isFinite(e.r) && isFinite(e.phi)) return Complex$1.INFINITY;
				n.re = e.r * Math.cos(e.phi), n.im = e.r * Math.sin(e.phi);
			} else e.length === 2 ? (n.re = e[0], n.im = e[1]) : parser_exit();
			break;
		case "string":
			n.im = n.re = 0;
			let t = e.replace(/_/g, "").match(/\d+\.?\d*e[+-]?\d+|\d+\.?\d*|\.\d+|./g), r = 1, i = 0;
			t === null && parser_exit();
			for (let e = 0; e < t.length; e++) {
				let a = t[e];
				a === " " || a === "	" || a === "\n" || (a === "+" ? r++ : a === "-" ? i++ : a === "i" || a === "I" ? (r + i === 0 && parser_exit(), t[e + 1] !== " " && !isNaN(t[e + 1]) ? (n.im += parseFloat((i % 2 ? "-" : "") + t[e + 1]), e++) : n.im += parseFloat((i % 2 ? "-" : "") + "1"), r = i = 0) : ((r + i === 0 || isNaN(a)) && parser_exit(), t[e + 1] === "i" || t[e + 1] === "I" ? (n.im += parseFloat((i % 2 ? "-" : "") + a), e++) : n.re += parseFloat((i % 2 ? "-" : "") + a), r = i = 0));
			}
			r + i > 0 && parser_exit();
			break;
		case "number":
			n.im = 0, n.re = e;
			break;
		default: parser_exit();
	}
	return isNaN(n.re) || isNaN(n.im), n;
};
function Complex$1(e, t) {
	if (!(this instanceof Complex$1)) return new Complex$1(e, t);
	let n = parse$1(e, t);
	this.re = n.re, this.im = n.im;
}
Complex$1.prototype = {
	re: 0,
	im: 0,
	sign: function() {
		let e = hypot(this.re, this.im);
		return new Complex$1(this.re / e, this.im / e);
	},
	add: function(e, t) {
		let n = parse$1(e, t), r = this.isInfinite(), i = !(isFinite(n.re) && isFinite(n.im));
		return r || i ? r && i ? Complex$1.NAN : Complex$1.INFINITY : new Complex$1(this.re + n.re, this.im + n.im);
	},
	sub: function(e, t) {
		let n = parse$1(e, t), r = this.isInfinite(), i = !(isFinite(n.re) && isFinite(n.im));
		return r || i ? r && i ? Complex$1.NAN : Complex$1.INFINITY : new Complex$1(this.re - n.re, this.im - n.im);
	},
	mul: function(e, t) {
		let n = parse$1(e, t), r = this.isInfinite(), i = !(isFinite(n.re) && isFinite(n.im)), a = this.re === 0 && this.im === 0, o = n.re === 0 && n.im === 0;
		return r && o || i && a ? Complex$1.NAN : r || i ? Complex$1.INFINITY : n.im === 0 && this.im === 0 ? new Complex$1(this.re * n.re, 0) : new Complex$1(this.re * n.re - this.im * n.im, this.re * n.im + this.im * n.re);
	},
	div: function(e, t) {
		let n = parse$1(e, t), r = this.isInfinite(), i = !(isFinite(n.re) && isFinite(n.im)), a = this.re === 0 && this.im === 0, o = n.re === 0 && n.im === 0;
		if (a && o || r && i) return Complex$1.NAN;
		if (o || r) return Complex$1.INFINITY;
		if (a || i) return Complex$1.ZERO;
		if (n.im === 0) return new Complex$1(this.re / n.re, this.im / n.re);
		if (Math.abs(n.re) < Math.abs(n.im)) {
			let e = n.re / n.im, t = n.re * e + n.im;
			return new Complex$1((this.re * e + this.im) / t, (this.im * e - this.re) / t);
		} else {
			let e = n.im / n.re, t = n.im * e + n.re;
			return new Complex$1((this.re + this.im * e) / t, (this.im - this.re * e) / t);
		}
	},
	pow: function(e, t) {
		let n = parse$1(e, t), r = this.re === 0 && this.im === 0;
		if (n.re === 0 && n.im === 0) return Complex$1.ONE;
		if (n.im === 0) {
			if (this.im === 0 && this.re > 0) return new Complex$1(this.re ** +n.re, 0);
			if (this.re === 0) switch ((n.re % 4 + 4) % 4) {
				case 0: return new Complex$1(this.im ** +n.re, 0);
				case 1: return new Complex$1(0, this.im ** +n.re);
				case 2: return new Complex$1(-(this.im ** +n.re), 0);
				case 3: return new Complex$1(0, -(this.im ** +n.re));
			}
		}
		if (r && n.re > 0) return Complex$1.ZERO;
		let i = Math.atan2(this.im, this.re), a = logHypot(this.re, this.im), o = Math.exp(n.re * a - n.im * i), s = n.im * a + n.re * i;
		return new Complex$1(o * Math.cos(s), o * Math.sin(s));
	},
	sqrt: function() {
		let e = this.re, t = this.im;
		if (t === 0) return e >= 0 ? new Complex$1(Math.sqrt(e), 0) : new Complex$1(0, Math.sqrt(-e));
		let n = hypot(e, t), r = Math.sqrt(.5 * (n + Math.abs(e))), i = Math.abs(t) / (2 * r);
		return e >= 0 ? new Complex$1(r, t < 0 ? -i : i) : new Complex$1(i, t < 0 ? -r : r);
	},
	exp: function() {
		let e = Math.exp(this.re);
		return this.im === 0 ? new Complex$1(e, 0) : new Complex$1(e * Math.cos(this.im), e * Math.sin(this.im));
	},
	expm1: function() {
		let e = this.re, t = this.im;
		return new Complex$1(Math.expm1(e) * Math.cos(t) + cosm1(t), Math.exp(e) * Math.sin(t));
	},
	log: function() {
		let e = this.re, t = this.im;
		return t === 0 && e > 0 ? new Complex$1(Math.log(e), 0) : new Complex$1(logHypot(e, t), Math.atan2(t, e));
	},
	abs: function() {
		return hypot(this.re, this.im);
	},
	arg: function() {
		return Math.atan2(this.im, this.re);
	},
	sin: function() {
		let e = this.re, t = this.im;
		return new Complex$1(Math.sin(e) * cosh(t), Math.cos(e) * sinh(t));
	},
	cos: function() {
		let e = this.re, t = this.im;
		return new Complex$1(Math.cos(e) * cosh(t), -Math.sin(e) * sinh(t));
	},
	tan: function() {
		let e = 2 * this.re, t = 2 * this.im, n = Math.cos(e) + cosh(t);
		return new Complex$1(Math.sin(e) / n, sinh(t) / n);
	},
	cot: function() {
		let e = 2 * this.re, t = 2 * this.im, n = Math.cos(e) - cosh(t);
		return new Complex$1(-Math.sin(e) / n, sinh(t) / n);
	},
	sec: function() {
		let e = this.re, t = this.im, n = .5 * cosh(2 * t) + .5 * Math.cos(2 * e);
		return new Complex$1(Math.cos(e) * cosh(t) / n, Math.sin(e) * sinh(t) / n);
	},
	csc: function() {
		let e = this.re, t = this.im, n = .5 * cosh(2 * t) - .5 * Math.cos(2 * e);
		return new Complex$1(Math.sin(e) * cosh(t) / n, -Math.cos(e) * sinh(t) / n);
	},
	asin: function() {
		let e = this.re, t = this.im, n = new Complex$1(t * t - e * e + 1, -2 * e * t).sqrt(), r = new Complex$1(n.re - t, n.im + e).log();
		return new Complex$1(r.im, -r.re);
	},
	acos: function() {
		let e = this.re, t = this.im, n = new Complex$1(t * t - e * e + 1, -2 * e * t).sqrt(), r = new Complex$1(n.re - t, n.im + e).log();
		return new Complex$1(Math.PI / 2 - r.im, r.re);
	},
	atan: function() {
		let e = this.re, t = this.im;
		if (e === 0) {
			if (t === 1) return new Complex$1(0, Infinity);
			if (t === -1) return new Complex$1(0, -Infinity);
		}
		let n = e * e + (1 - t) * (1 - t), r = new Complex$1((1 - t * t - e * e) / n, -2 * e / n).log();
		return new Complex$1(-.5 * r.im, .5 * r.re);
	},
	acot: function() {
		let e = this.re, t = this.im;
		if (t === 0) return new Complex$1(Math.atan2(1, e), 0);
		let n = e * e + t * t;
		return n === 0 ? new Complex$1(e === 0 ? 0 : e / 0, t === 0 ? 0 : -t / 0).atan() : new Complex$1(e / n, -t / n).atan();
	},
	asec: function() {
		let e = this.re, t = this.im;
		if (e === 0 && t === 0) return new Complex$1(0, Infinity);
		let n = e * e + t * t;
		return n === 0 ? new Complex$1(e === 0 ? 0 : e / 0, t === 0 ? 0 : -t / 0).acos() : new Complex$1(e / n, -t / n).acos();
	},
	acsc: function() {
		let e = this.re, t = this.im;
		if (e === 0 && t === 0) return new Complex$1(Math.PI / 2, Infinity);
		let n = e * e + t * t;
		return n === 0 ? new Complex$1(e === 0 ? 0 : e / 0, t === 0 ? 0 : -t / 0).asin() : new Complex$1(e / n, -t / n).asin();
	},
	sinh: function() {
		let e = this.re, t = this.im;
		return new Complex$1(sinh(e) * Math.cos(t), cosh(e) * Math.sin(t));
	},
	cosh: function() {
		let e = this.re, t = this.im;
		return new Complex$1(cosh(e) * Math.cos(t), sinh(e) * Math.sin(t));
	},
	tanh: function() {
		let e = 2 * this.re, t = 2 * this.im, n = cosh(e) + Math.cos(t);
		return new Complex$1(sinh(e) / n, Math.sin(t) / n);
	},
	coth: function() {
		let e = 2 * this.re, t = 2 * this.im, n = cosh(e) - Math.cos(t);
		return new Complex$1(sinh(e) / n, -Math.sin(t) / n);
	},
	csch: function() {
		let e = this.re, t = this.im, n = Math.cos(2 * t) - cosh(2 * e);
		return new Complex$1(-2 * sinh(e) * Math.cos(t) / n, 2 * cosh(e) * Math.sin(t) / n);
	},
	sech: function() {
		let e = this.re, t = this.im, n = Math.cos(2 * t) + cosh(2 * e);
		return new Complex$1(2 * cosh(e) * Math.cos(t) / n, -2 * sinh(e) * Math.sin(t) / n);
	},
	asinh: function() {
		let e = this.re, t = this.im;
		if (t === 0) {
			if (e === 0) return new Complex$1(0, 0);
			let t = Math.abs(e), n = Math.log(t + Math.sqrt(t * t + 1));
			return new Complex$1(e < 0 ? -n : n, 0);
		}
		let n = new Complex$1(e * e - t * t + 1, 2 * e * t).sqrt();
		return new Complex$1(e + n.re, t + n.im).log();
	},
	acosh: function() {
		let e = this.re, t = this.im;
		if (t === 0) {
			if (e > 1) return new Complex$1(Math.log(e + Math.sqrt(e - 1) * Math.sqrt(e + 1)), 0);
			if (e < -1) {
				let t = Math.sqrt(e * e - 1);
				return new Complex$1(Math.log(-e + t), Math.PI);
			}
			return new Complex$1(0, Math.acos(e));
		}
		let n = new Complex$1(e - 1, t).sqrt(), r = new Complex$1(e + 1, t).sqrt();
		return new Complex$1(e + n.re * r.re - n.im * r.im, t + n.re * r.im + n.im * r.re).log();
	},
	atanh: function() {
		let e = this.re, t = this.im;
		if (t === 0) {
			if (e === 0) return new Complex$1(0, 0);
			if (e === 1) return new Complex$1(Infinity, 0);
			if (e === -1) return new Complex$1(-Infinity, 0);
			if (-1 < e && e < 1) return new Complex$1(.5 * Math.log((1 + e) / (1 - e)), 0);
			if (e > 1) {
				let t = (e + 1) / (e - 1);
				return new Complex$1(.5 * Math.log(t), -Math.PI / 2);
			}
			let t = (1 + e) / (1 - e);
			return new Complex$1(.5 * Math.log(-t), Math.PI / 2);
		}
		let n = 1 - e, r = 1 + e, i = n * n + t * t;
		if (i === 0) return new Complex$1(e === -1 ? 0 : e / 0, t === 0 ? 0 : t / 0);
		let a = (r * n - t * t) / i, o = (t * n + r * t) / i;
		return new Complex$1(logHypot(a, o) / 2, Math.atan2(o, a) / 2);
	},
	acoth: function() {
		let e = this.re, t = this.im;
		if (e === 0 && t === 0) return new Complex$1(0, Math.PI / 2);
		let n = e * e + t * t;
		return n === 0 ? new Complex$1(e === 0 ? 0 : e / 0, t === 0 ? 0 : -t / 0).atanh() : new Complex$1(e / n, -t / n).atanh();
	},
	acsch: function() {
		let e = this.re, t = this.im;
		if (t === 0) {
			if (e === 0) return new Complex$1(Infinity, 0);
			let t = 1 / e;
			return new Complex$1(Math.log(t + Math.sqrt(t * t + 1)), 0);
		}
		let n = e * e + t * t;
		return n === 0 ? new Complex$1(e === 0 ? 0 : e / 0, t === 0 ? 0 : -t / 0).asinh() : new Complex$1(e / n, -t / n).asinh();
	},
	asech: function() {
		let e = this.re, t = this.im;
		if (this.isZero()) return Complex$1.INFINITY;
		let n = e * e + t * t;
		return n === 0 ? new Complex$1(e === 0 ? 0 : e / 0, t === 0 ? 0 : -t / 0).acosh() : new Complex$1(e / n, -t / n).acosh();
	},
	inverse: function() {
		if (this.isZero()) return Complex$1.INFINITY;
		if (this.isInfinite()) return Complex$1.ZERO;
		let e = this.re, t = this.im, n = e * e + t * t;
		return new Complex$1(e / n, -t / n);
	},
	conjugate: function() {
		return new Complex$1(this.re, -this.im);
	},
	neg: function() {
		return new Complex$1(-this.re, -this.im);
	},
	ceil: function(e) {
		return e = 10 ** (e || 0), new Complex$1(Math.ceil(this.re * e) / e, Math.ceil(this.im * e) / e);
	},
	floor: function(e) {
		return e = 10 ** (e || 0), new Complex$1(Math.floor(this.re * e) / e, Math.floor(this.im * e) / e);
	},
	round: function(e) {
		return e = 10 ** (e || 0), new Complex$1(Math.round(this.re * e) / e, Math.round(this.im * e) / e);
	},
	equals: function(e, t) {
		let n = parse$1(e, t);
		return Math.abs(n.re - this.re) <= Complex$1.EPSILON && Math.abs(n.im - this.im) <= Complex$1.EPSILON;
	},
	clone: function() {
		return new Complex$1(this.re, this.im);
	},
	toString: function() {
		let e = this.re, t = this.im, n = "";
		return this.isNaN() ? "NaN" : this.isInfinite() ? "Infinity" : (Math.abs(e) < Complex$1.EPSILON && (e = 0), Math.abs(t) < Complex$1.EPSILON && (t = 0), t === 0 ? n + e : (e === 0 ? t < 0 && (t = -t, n += "-") : (n += e, n += " ", t < 0 ? (t = -t, n += "-") : n += "+", n += " "), t !== 1 && (n += t), n + "i"));
	},
	toVector: function() {
		return [this.re, this.im];
	},
	valueOf: function() {
		return this.im === 0 ? this.re : null;
	},
	isNaN: function() {
		return isNaN(this.re) || isNaN(this.im);
	},
	isZero: function() {
		return this.im === 0 && this.re === 0;
	},
	isFinite: function() {
		return isFinite(this.re) && isFinite(this.im);
	},
	isInfinite: function() {
		return !this.isFinite();
	}
}, Complex$1.ZERO = new Complex$1(0, 0), Complex$1.ONE = new Complex$1(1, 0), Complex$1.I = new Complex$1(0, 1), Complex$1.PI = new Complex$1(Math.PI, 0), Complex$1.E = new Complex$1(Math.E, 0), Complex$1.INFINITY = new Complex$1(Infinity, Infinity), Complex$1.NAN = new Complex$1(NaN, NaN), Complex$1.EPSILON = 1e-15;
//#endregion
//#region node_modules/mathjs/lib/esm/type/complex/Complex.js
var name$74 = "Complex", dependencies$74 = [], createComplexClass = /* @__PURE__ */ factory(name$74, dependencies$74, () => (Object.defineProperty(Complex$1, "name", { value: "Complex" }), Complex$1.prototype.constructor = Complex$1, Complex$1.prototype.type = "Complex", Complex$1.prototype.isComplex = !0, Complex$1.prototype.toJSON = function() {
	return {
		mathjs: "Complex",
		re: this.re,
		im: this.im
	};
}, Complex$1.prototype.toPolar = function() {
	return {
		r: this.abs(),
		phi: this.arg()
	};
}, Complex$1.prototype.format = function(e) {
	var t = "", n = this.im, r = this.re, i = format$2(this.re, e), a = format$2(this.im, e), o = isNumber(e) ? e : e ? e.precision : null;
	if (o !== null) {
		var s = 10 ** -o;
		Math.abs(r / n) < s && (r = 0), Math.abs(n / r) < s && (n = 0);
	}
	return t = n === 0 ? i : r === 0 ? n === 1 ? "i" : n === -1 ? "-i" : a + "i" : n < 0 ? n === -1 ? i + " - i" : i + " - " + a.substring(1) + "i" : n === 1 ? i + " + i" : i + " + " + a + "i", t;
}, Complex$1.fromPolar = function(e) {
	switch (arguments.length) {
		case 1:
			var t = arguments[0];
			if (typeof t == "object") return Complex$1(t);
			throw TypeError("Input has to be an object with r and phi keys.");
		case 2:
			var n = arguments[0], r = arguments[1];
			if (isNumber(n)) {
				if (isUnit(r) && r.hasBase("ANGLE") && (r = r.toNumber("rad")), isNumber(r)) return new Complex$1({
					r: n,
					phi: r
				});
				throw TypeError("Phi is not a number nor an angle unit.");
			} else throw TypeError("Radius r is not a number.");
		default: throw SyntaxError("Wrong number of arguments in function fromPolar");
	}
}, Complex$1.prototype.valueOf = Complex$1.prototype.toString, Complex$1.fromJSON = function(e) {
	return new Complex$1(e);
}, Complex$1.compare = function(e, t) {
	return e.re > t.re ? 1 : e.re < t.re ? -1 : e.im > t.im ? 1 : e.im < t.im ? -1 : 0;
}, Complex$1), { isClass: !0 });
//#endregion
//#region node_modules/fraction.js/dist/fraction.mjs
typeof BigInt > "u" && (BigInt = function(e) {
	if (isNaN(e)) throw Error("");
	return e;
});
var C_ZERO = BigInt(0), C_ONE = BigInt(1), C_TWO = BigInt(2), C_THREE = BigInt(3), C_FIVE = BigInt(5), C_TEN = BigInt(10);
BigInt(2 ** 53 - 1);
var MAX_CYCLE_LEN = 2e3, P$6 = {
	s: C_ONE,
	n: C_ZERO,
	d: C_ONE
};
function assign(e, t) {
	try {
		e = BigInt(e);
	} catch {
		throw InvalidParameter();
	}
	return e * t;
}
function ifloor(e) {
	return typeof e == "bigint" ? e : Math.floor(e);
}
function newFraction(e, t) {
	if (t === C_ZERO) throw DivisionByZero();
	let n = Object.create(Fraction$1.prototype);
	n.s = e < C_ZERO ? -C_ONE : C_ONE, e = e < C_ZERO ? -e : e;
	let r = gcd(e, t);
	return n.n = e / r, n.d = t / r, n;
}
var FACTORSTEPS = [
	C_TWO * C_TWO,
	C_TWO,
	C_TWO * C_TWO,
	C_TWO,
	C_TWO * C_TWO,
	C_TWO * C_THREE,
	C_TWO,
	C_TWO * C_THREE
];
function factorize(e) {
	let t = Object.create(null);
	if (e <= C_ONE) return t[e] = C_ONE, t;
	let n = (e) => {
		t[e] = (t[e] || C_ZERO) + C_ONE;
	};
	for (; e % C_TWO === C_ZERO;) n(C_TWO), e /= C_TWO;
	for (; e % C_THREE === C_ZERO;) n(C_THREE), e /= C_THREE;
	for (; e % C_FIVE === C_ZERO;) n(C_FIVE), e /= C_FIVE;
	for (let t = 0, r = C_TWO + C_FIVE; r * r <= e;) {
		for (; e % r === C_ZERO;) n(r), e /= r;
		r += FACTORSTEPS[t], t = t + 1 & 7;
	}
	return e > C_ONE && n(e), t;
}
var parse = function(e, t) {
	let n = C_ZERO, r = C_ONE, i = C_ONE;
	if (e != null) if (t !== void 0) {
		if (typeof e == "bigint") n = e;
		else if (isNaN(e)) throw InvalidParameter();
		else if (e % 1 != 0) throw NonIntegerParameter();
		else n = BigInt(e);
		if (typeof t == "bigint") r = t;
		else if (isNaN(t)) throw InvalidParameter();
		else if (t % 1 != 0) throw NonIntegerParameter();
		else r = BigInt(t);
		i = n * r;
	} else if (typeof e == "object") {
		if ("d" in e && "n" in e) n = BigInt(e.n), r = BigInt(e.d), "s" in e && (n *= BigInt(e.s));
		else if (0 in e) n = BigInt(e[0]), 1 in e && (r = BigInt(e[1]));
		else if (typeof e == "bigint") n = e;
		else throw InvalidParameter();
		i = n * r;
	} else if (typeof e == "number") {
		if (isNaN(e)) throw InvalidParameter();
		if (e < 0 && (i = -C_ONE, e = -e), e % 1 == 0) n = BigInt(e);
		else {
			let t = 1, i = 0, a = 1, o = 1, s = 1, c = 1e7;
			for (e >= 1 && (t = 10 ** Math.floor(1 + Math.log10(e)), e /= t); a <= c && s <= c;) {
				let t = (i + o) / (a + s);
				if (e === t) {
					a + s <= c ? (n = i + o, r = a + s) : s > a ? (n = o, r = s) : (n = i, r = a);
					break;
				} else e > t ? (i += o, a += s) : (o += i, s += a), a > c ? (n = o, r = s) : (n = i, r = a);
			}
			n = BigInt(n) * BigInt(t), r = BigInt(r);
		}
	} else if (typeof e == "string") {
		let t = 0, a = C_ZERO, o = C_ZERO, s = C_ZERO, c = C_ONE, l = C_ONE, u = e.replace(/_/g, "").match(/\d+|./g);
		if (u === null) throw InvalidParameter();
		if (u[t] === "-" ? (i = -C_ONE, t++) : u[t] === "+" && t++, u.length === t + 1 ? o = assign(u[t++], i) : u[t + 1] === "." || u[t] === "." ? (u[t] !== "." && (a = assign(u[t++], i)), t++, (t + 1 === u.length || u[t + 1] === "(" && u[t + 3] === ")" || u[t + 1] === "'" && u[t + 3] === "'") && (o = assign(u[t], i), c = C_TEN ** BigInt(u[t].length), t++), (u[t] === "(" && u[t + 2] === ")" || u[t] === "'" && u[t + 2] === "'") && (s = assign(u[t + 1], i), l = C_TEN ** BigInt(u[t + 1].length) - C_ONE, t += 3)) : u[t + 1] === "/" || u[t + 1] === ":" ? (o = assign(u[t], i), c = assign(u[t + 2], C_ONE), t += 3) : u[t + 3] === "/" && u[t + 1] === " " && (a = assign(u[t], i), o = assign(u[t + 2], i), c = assign(u[t + 4], C_ONE), t += 5), u.length <= t) r = c * l, i = n = s + r * a + l * o;
		else throw InvalidParameter();
	} else if (typeof e == "bigint") n = e, i = e, r = C_ONE;
	else throw InvalidParameter();
	if (r === C_ZERO) throw DivisionByZero();
	P$6.s = i < C_ZERO ? -C_ONE : C_ONE, P$6.n = n < C_ZERO ? -n : n, P$6.d = r < C_ZERO ? -r : r;
};
function modpow(e, t, n) {
	let r = C_ONE;
	for (; t > C_ZERO; e = e * e % n, t >>= C_ONE) t & C_ONE && (r = r * e % n);
	return r;
}
function cycleLen(e, t) {
	for (; t % C_TWO === C_ZERO; t /= C_TWO);
	for (; t % C_FIVE === C_ZERO; t /= C_FIVE);
	if (t === C_ONE) return C_ZERO;
	let n = C_TEN % t, r = 1;
	for (; n !== C_ONE; r++) if (n = n * C_TEN % t, r > MAX_CYCLE_LEN) return C_ZERO;
	return BigInt(r);
}
function cycleStart(e, t, n) {
	let r = C_ONE, i = modpow(C_TEN, n, t);
	for (let e = 0; e < 300; e++) {
		if (r === i) return BigInt(e);
		r = r * C_TEN % t, i = i * C_TEN % t;
	}
	return 0;
}
function gcd(e, t) {
	if (!e) return t;
	if (!t) return e;
	for (;;) {
		if (e %= t, !e) return t;
		if (t %= e, !t) return e;
	}
}
function Fraction$1(e, t) {
	if (parse(e, t), this instanceof Fraction$1) e = gcd(P$6.d, P$6.n), this.s = P$6.s, this.n = P$6.n / e, this.d = P$6.d / e;
	else return newFraction(P$6.s * P$6.n, P$6.d);
}
var DivisionByZero = function() {
	return /* @__PURE__ */ Error("Division by Zero");
}, InvalidParameter = function() {
	return /* @__PURE__ */ Error("Invalid argument");
}, NonIntegerParameter = function() {
	return /* @__PURE__ */ Error("Parameters must be integer");
};
Fraction$1.prototype = {
	s: C_ONE,
	n: C_ZERO,
	d: C_ONE,
	abs: function() {
		return newFraction(this.n, this.d);
	},
	neg: function() {
		return newFraction(-this.s * this.n, this.d);
	},
	add: function(e, t) {
		return parse(e, t), newFraction(this.s * this.n * P$6.d + P$6.s * this.d * P$6.n, this.d * P$6.d);
	},
	sub: function(e, t) {
		return parse(e, t), newFraction(this.s * this.n * P$6.d - P$6.s * this.d * P$6.n, this.d * P$6.d);
	},
	mul: function(e, t) {
		return parse(e, t), newFraction(this.s * P$6.s * this.n * P$6.n, this.d * P$6.d);
	},
	div: function(e, t) {
		return parse(e, t), newFraction(this.s * P$6.s * this.n * P$6.d, this.d * P$6.n);
	},
	clone: function() {
		return newFraction(this.s * this.n, this.d);
	},
	mod: function(e, t) {
		if (e === void 0) return newFraction(this.s * this.n % this.d, C_ONE);
		if (parse(e, t), C_ZERO === P$6.n * this.d) throw DivisionByZero();
		return newFraction(this.s * (P$6.d * this.n) % (P$6.n * this.d), P$6.d * this.d);
	},
	gcd: function(e, t) {
		return parse(e, t), newFraction(gcd(P$6.n, this.n) * gcd(P$6.d, this.d), P$6.d * this.d);
	},
	lcm: function(e, t) {
		return parse(e, t), P$6.n === C_ZERO && this.n === C_ZERO ? newFraction(C_ZERO, C_ONE) : newFraction(P$6.n * this.n, gcd(P$6.n, this.n) * gcd(P$6.d, this.d));
	},
	inverse: function() {
		return newFraction(this.s * this.d, this.n);
	},
	pow: function(e, t) {
		if (parse(e, t), P$6.d === C_ONE) return P$6.s < C_ZERO ? newFraction((this.s * this.d) ** P$6.n, this.n ** P$6.n) : newFraction((this.s * this.n) ** P$6.n, this.d ** P$6.n);
		if (this.s < C_ZERO) return null;
		let n = factorize(this.n), r = factorize(this.d), i = C_ONE, a = C_ONE;
		for (let e in n) if (e !== "1") {
			if (e === "0") {
				i = C_ZERO;
				break;
			}
			if (n[e] *= P$6.n, n[e] % P$6.d === C_ZERO) n[e] /= P$6.d;
			else return null;
			i *= BigInt(e) ** n[e];
		}
		for (let e in r) if (e !== "1") {
			if (r[e] *= P$6.n, r[e] % P$6.d === C_ZERO) r[e] /= P$6.d;
			else return null;
			a *= BigInt(e) ** r[e];
		}
		return P$6.s < C_ZERO ? newFraction(a, i) : newFraction(i, a);
	},
	log: function(e, t) {
		if (parse(e, t), this.s <= C_ZERO || P$6.s <= C_ZERO) return null;
		let n = Object.create(null), r = factorize(P$6.n), i = factorize(P$6.d), a = factorize(this.n), o = factorize(this.d);
		for (let e in i) r[e] = (r[e] || C_ZERO) - i[e];
		for (let e in o) a[e] = (a[e] || C_ZERO) - o[e];
		for (let e in r) e !== "1" && (n[e] = !0);
		for (let e in a) e !== "1" && (n[e] = !0);
		let s = null, c = null;
		for (let e in n) {
			let t = r[e] || C_ZERO, n = a[e] || C_ZERO;
			if (t === C_ZERO) {
				if (n !== C_ZERO) return null;
				continue;
			}
			let i = n, o = t, l = gcd(i, o);
			if (i /= l, o /= l, s === null && c === null) s = i, c = o;
			else if (i * c !== s * o) return null;
		}
		return s !== null && c !== null ? newFraction(s, c) : null;
	},
	equals: function(e, t) {
		return parse(e, t), this.s * this.n * P$6.d === P$6.s * P$6.n * this.d;
	},
	lt: function(e, t) {
		return parse(e, t), this.s * this.n * P$6.d < P$6.s * P$6.n * this.d;
	},
	lte: function(e, t) {
		return parse(e, t), this.s * this.n * P$6.d <= P$6.s * P$6.n * this.d;
	},
	gt: function(e, t) {
		return parse(e, t), this.s * this.n * P$6.d > P$6.s * P$6.n * this.d;
	},
	gte: function(e, t) {
		return parse(e, t), this.s * this.n * P$6.d >= P$6.s * P$6.n * this.d;
	},
	compare: function(e, t) {
		parse(e, t);
		let n = this.s * this.n * P$6.d - P$6.s * P$6.n * this.d;
		return (C_ZERO < n) - (n < C_ZERO);
	},
	ceil: function(e) {
		return e = C_TEN ** BigInt(e || 0), newFraction(ifloor(this.s * e * this.n / this.d) + (e * this.n % this.d > C_ZERO && this.s >= C_ZERO ? C_ONE : C_ZERO), e);
	},
	floor: function(e) {
		return e = C_TEN ** BigInt(e || 0), newFraction(ifloor(this.s * e * this.n / this.d) - (e * this.n % this.d > C_ZERO && this.s < C_ZERO ? C_ONE : C_ZERO), e);
	},
	round: function(e) {
		return e = C_TEN ** BigInt(e || 0), newFraction(ifloor(this.s * e * this.n / this.d) + this.s * ((this.s >= C_ZERO ? C_ONE : C_ZERO) + C_TWO * (e * this.n % this.d) > this.d ? C_ONE : C_ZERO), e);
	},
	roundTo: function(e, t) {
		parse(e, t);
		let n = this.n * P$6.d, r = this.d * P$6.n, i = n % r, a = ifloor(n / r);
		return i + i >= r && a++, newFraction(this.s * a * P$6.n, P$6.d);
	},
	divisible: function(e, t) {
		return parse(e, t), P$6.n === C_ZERO ? !1 : this.n * P$6.d % (P$6.n * this.d) === C_ZERO;
	},
	valueOf: function() {
		return Number(this.s * this.n) / Number(this.d);
	},
	toString: function(e = 15) {
		let t = this.n, n = this.d, r = cycleLen(t, n), i = cycleStart(t, n, r), a = this.s < C_ZERO ? "-" : "";
		if (a += ifloor(t / n), t %= n, t *= C_TEN, t && (a += "."), r) {
			for (let e = i; e--;) a += ifloor(t / n), t %= n, t *= C_TEN;
			a += "(";
			for (let e = r; e--;) a += ifloor(t / n), t %= n, t *= C_TEN;
			a += ")";
		} else for (let r = e; t && r--;) a += ifloor(t / n), t %= n, t *= C_TEN;
		return a;
	},
	toFraction: function(e = !1) {
		let t = this.n, n = this.d, r = this.s < C_ZERO ? "-" : "";
		if (n === C_ONE) r += t;
		else {
			let i = ifloor(t / n);
			e && i > C_ZERO && (r += i, r += " ", t %= n), r += t, r += "/", r += n;
		}
		return r;
	},
	toLatex: function(e = !1) {
		let t = this.n, n = this.d, r = this.s < C_ZERO ? "-" : "";
		if (n === C_ONE) r += t;
		else {
			let i = ifloor(t / n);
			e && i > C_ZERO && (r += i, t %= n), r += "\\frac{", r += t, r += "}{", r += n, r += "}";
		}
		return r;
	},
	toContinued: function() {
		let e = this.n, t = this.d, n = [];
		for (; t;) {
			n.push(ifloor(e / t));
			let r = e % t;
			e = t, t = r;
		}
		return n;
	},
	simplify: function(e = .001) {
		let t = BigInt(Math.ceil(1 / e)), n = this.abs(), r = n.toContinued();
		for (let e = 1; e < r.length; e++) {
			let i = newFraction(r[e - 1], C_ONE);
			for (let t = e - 2; t >= 0; t--) i = i.inverse().add(r[t]);
			let a = i.sub(n);
			if (a.n * t < a.d) return i.mul(this.s);
		}
		return this;
	}
};
//#endregion
//#region node_modules/mathjs/lib/esm/type/fraction/Fraction.js
var name$73 = "Fraction", dependencies$73 = [], createFractionClass = /* @__PURE__ */ factory(name$73, dependencies$73, () => (Object.defineProperty(Fraction$1, "name", { value: "Fraction" }), Fraction$1.prototype.constructor = Fraction$1, Fraction$1.prototype.type = "Fraction", Fraction$1.prototype.isFraction = !0, Fraction$1.prototype.toJSON = function() {
	return {
		mathjs: "Fraction",
		n: String(this.s * this.n),
		d: String(this.d)
	};
}, Fraction$1.fromJSON = function(e) {
	return new Fraction$1(e);
}, Fraction$1), { isClass: !0 }), name$72 = "Matrix", dependencies$72 = [], createMatrixClass = /* @__PURE__ */ factory(name$72, dependencies$72, () => {
	function e() {
		if (!(this instanceof e)) throw SyntaxError("Constructor must be called with the new operator");
	}
	return e.prototype.type = "Matrix", e.prototype.isMatrix = !0, e.prototype.storage = function() {
		throw Error("Cannot invoke storage on a Matrix interface");
	}, e.prototype.datatype = function() {
		throw Error("Cannot invoke datatype on a Matrix interface");
	}, e.prototype.create = function(e, t) {
		throw Error("Cannot invoke create on a Matrix interface");
	}, e.prototype.subset = function(e, t, n) {
		throw Error("Cannot invoke subset on a Matrix interface");
	}, e.prototype.get = function(e) {
		throw Error("Cannot invoke get on a Matrix interface");
	}, e.prototype.set = function(e, t, n) {
		throw Error("Cannot invoke set on a Matrix interface");
	}, e.prototype.resize = function(e, t) {
		throw Error("Cannot invoke resize on a Matrix interface");
	}, e.prototype.reshape = function(e, t) {
		throw Error("Cannot invoke reshape on a Matrix interface");
	}, e.prototype.clone = function() {
		throw Error("Cannot invoke clone on a Matrix interface");
	}, e.prototype.size = function() {
		throw Error("Cannot invoke size on a Matrix interface");
	}, e.prototype.map = function(e, t) {
		throw Error("Cannot invoke map on a Matrix interface");
	}, e.prototype.forEach = function(e) {
		throw Error("Cannot invoke forEach on a Matrix interface");
	}, e.prototype[Symbol.iterator] = function() {
		throw Error("Cannot iterate a Matrix interface");
	}, e.prototype.toArray = function() {
		throw Error("Cannot invoke toArray on a Matrix interface");
	}, e.prototype.valueOf = function() {
		throw Error("Cannot invoke valueOf on a Matrix interface");
	}, e.prototype.format = function(e) {
		throw Error("Cannot invoke format on a Matrix interface");
	}, e.prototype.toString = function() {
		throw Error("Cannot invoke toString on a Matrix interface");
	}, e;
}, { isClass: !0 });
//#endregion
//#region node_modules/mathjs/lib/esm/utils/bignumber/formatter.js
function formatBigNumberToBase(e, t, n) {
	var r = e.constructor, i = new r(2), a = "";
	if (n) {
		if (n < 1) throw Error("size must be in greater than 0");
		if (!isInteger$1(n)) throw Error("size must be an integer");
		if (e.greaterThan(i.pow(n - 1).sub(1)) || e.lessThan(i.pow(n - 1).mul(-1))) throw Error(`Value must be in range [-2^${n - 1}, 2^${n - 1}-1]`);
		if (!e.isInteger()) throw Error("Value must be an integer");
		e.lessThan(0) && (e = e.add(i.pow(n))), a = `i${n}`;
	}
	switch (t) {
		case 2: return `${e.toBinary()}${a}`;
		case 8: return `${e.toOctal()}${a}`;
		case 16: return `${e.toHexadecimal()}${a}`;
		default: throw Error(`Base ${t} not supported `);
	}
}
function format$1(e, t) {
	if (typeof t == "function") return t(e);
	if (!e.isFinite()) return e.isNaN() ? "NaN" : e.gt(0) ? "Infinity" : "-Infinity";
	var { notation: n, precision: r, wordSize: i } = normalizeFormatOptions(t);
	switch (n) {
		case "fixed": return toFixed(e, r);
		case "exponential": return toExponential(e, r);
		case "engineering": return toEngineering(e, r);
		case "bin": return formatBigNumberToBase(e, 2, i);
		case "oct": return formatBigNumberToBase(e, 8, i);
		case "hex": return formatBigNumberToBase(e, 16, i);
		case "auto":
			var a = _toNumberOrDefault(t?.lowerExp, -3), o = _toNumberOrDefault(t?.upperExp, 5);
			if (e.isZero()) return "0";
			var s, c = e.toSignificantDigits(r), l = c.e;
			return s = l >= a && l < o ? c.toFixed() : toExponential(e, r), s.replace(/((\.\d*?)(0+))($|e)/, function() {
				var e = arguments[2], t = arguments[4];
				return e === "." ? t : e + t;
			});
		default: throw Error("Unknown notation \"" + n + "\". Choose \"auto\", \"exponential\", \"fixed\", \"bin\", \"oct\", or \"hex.");
	}
}
function toEngineering(e, t) {
	var n = e.e, r = n % 3 == 0 ? n : n < 0 ? n - 3 - n % 3 : n - n % 3, i = e.mul(10 ** -r).toPrecision(t);
	if (i.includes("e")) {
		var a = e.constructor;
		i = new a(i).toFixed();
	}
	return i + "e" + (n >= 0 ? "+" : "") + r.toString();
}
function toExponential(e, t) {
	return t === void 0 ? e.toExponential() : e.toExponential(t - 1);
}
function toFixed(e, t) {
	return e.toFixed(t);
}
function _toNumberOrDefault(e, t) {
	return isNumber(e) ? e : isBigNumber(e) ? e.toNumber() : t;
}
//#endregion
//#region node_modules/mathjs/lib/esm/utils/string.js
function format(e, t) {
	var n = _format(e, t);
	return t && typeof t == "object" && "truncate" in t && n.length > t.truncate ? n.substring(0, t.truncate - 3) + "..." : n;
}
function _format(e, t) {
	return typeof e == "number" ? format$2(e, t) : isBigNumber(e) ? format$1(e, t) : looksLikeFraction(e) ? !t || t.fraction !== "decimal" ? `${e.s * e.n}/${e.d}` : e.toString() : Array.isArray(e) ? formatArray(e, t) : isString(e) ? stringify(e) : typeof e == "function" ? e.syntax ? String(e.syntax) : "function" : e && typeof e == "object" ? typeof e.format == "function" ? e.format(t) : e && e.toString(t) !== {}.toString() ? e.toString(t) : "{" + Object.keys(e).map((n) => stringify(n) + ": " + format(e[n], t)).join(", ") + "}" : String(e);
}
function stringify(e) {
	for (var t = String(e), n = "", r = 0; r < t.length;) {
		var i = t.charAt(r);
		n += i in controlCharacters ? controlCharacters[i] : i, r++;
	}
	return "\"" + n + "\"";
}
var controlCharacters = {
	"\"": "\\\"",
	"\\": "\\\\",
	"\b": "\\b",
	"\f": "\\f",
	"\n": "\\n",
	"\r": "\\r",
	"	": "\\t"
};
function formatArray(e, t) {
	if (Array.isArray(e)) {
		for (var n = "[", r = e.length, i = 0; i < r; i++) i !== 0 && (n += ", "), n += formatArray(e[i], t);
		return n += "]", n;
	} else return format(e, t);
}
function looksLikeFraction(e) {
	return e && typeof e == "object" && typeof e.s == "bigint" && typeof e.n == "bigint" && typeof e.d == "bigint" || !1;
}
//#endregion
//#region node_modules/mathjs/lib/esm/error/DimensionError.js
function DimensionError(e, t, n) {
	if (!(this instanceof DimensionError)) throw SyntaxError("Constructor must be called with the new operator");
	this.actual = e, this.expected = t, this.relation = n, this.message = "Dimension mismatch (" + (Array.isArray(e) ? "[" + e.join(", ") + "]" : e) + " " + (this.relation || "!=") + " " + (Array.isArray(t) ? "[" + t.join(", ") + "]" : t) + ")", this.stack = (/* @__PURE__ */ Error()).stack;
}
DimensionError.prototype = /* @__PURE__ */ RangeError(), DimensionError.prototype.constructor = RangeError, DimensionError.prototype.name = "DimensionError", DimensionError.prototype.isDimensionError = !0;
//#endregion
//#region node_modules/mathjs/lib/esm/error/IndexError.js
function IndexError(e, t, n) {
	if (!(this instanceof IndexError)) throw SyntaxError("Constructor must be called with the new operator");
	this.index = e, arguments.length < 3 ? (this.min = 0, this.max = t) : (this.min = t, this.max = n), this.min !== void 0 && this.index < this.min ? this.message = "Index out of range (" + this.index + " < " + this.min + ")" : this.max !== void 0 && this.index >= this.max ? this.message = "Index out of range (" + this.index + " > " + (this.max - 1) + ")" : this.message = "Index out of range (" + this.index + ")", this.stack = (/* @__PURE__ */ Error()).stack;
}
IndexError.prototype = /* @__PURE__ */ RangeError(), IndexError.prototype.constructor = RangeError, IndexError.prototype.name = "IndexError", IndexError.prototype.isIndexError = !0;
//#endregion
//#region node_modules/mathjs/lib/esm/utils/array.js
function arraySize(e) {
	for (var t = []; Array.isArray(e);) t.push(e.length), e = e[0];
	return t;
}
function _validate(e, t, n) {
	var r, i = e.length;
	if (i !== t[n]) throw new DimensionError(i, t[n]);
	if (n < t.length - 1) {
		var a = n + 1;
		for (r = 0; r < i; r++) {
			var o = e[r];
			if (!Array.isArray(o)) throw new DimensionError(t.length - 1, t.length, "<");
			_validate(e[r], t, a);
		}
	} else for (r = 0; r < i; r++) if (Array.isArray(e[r])) throw new DimensionError(t.length + 1, t.length, ">");
}
function validate(e, t) {
	if (t.length === 0) {
		if (Array.isArray(e)) throw new DimensionError(e.length, 0);
	} else _validate(e, t, 0);
}
function validateIndex(e, t) {
	if (e !== void 0) {
		if (!isNumber(e) || !isInteger$1(e)) throw TypeError("Index must be an integer (value: " + e + ")");
		if (e < 0 || typeof t == "number" && e >= t) throw new IndexError(e, t);
	}
}
function resize(e, t, n) {
	if (!Array.isArray(t)) throw TypeError("Array expected");
	if (t.length === 0) throw Error("Resizing to scalar is not supported");
	return t.forEach(function(e) {
		if (!isNumber(e) || !isInteger$1(e) || e < 0) throw TypeError("Invalid size, must contain positive integers (size: " + format(t) + ")");
	}), (isNumber(e) || isBigNumber(e)) && (e = [e]), _resize(e, t, 0, n === void 0 ? 0 : n), e;
}
function _resize(e, t, n, r) {
	var i, a, o = e.length, s = t[n], c = Math.min(o, s);
	if (e.length = s, n < t.length - 1) {
		var l = n + 1;
		for (i = 0; i < c; i++) a = e[i], Array.isArray(a) || (a = [a], e[i] = a), _resize(a, t, l, r);
		for (i = c; i < s; i++) a = [], e[i] = a, _resize(a, t, l, r);
	} else {
		for (i = 0; i < c; i++) for (; Array.isArray(e[i]);) e[i] = e[i][0];
		for (i = c; i < s; i++) e[i] = r;
	}
}
function reshape$1(e, t) {
	var n = flatten$1(e, !0), r = n.length;
	if (!Array.isArray(e) || !Array.isArray(t)) throw TypeError("Array expected");
	if (t.length === 0) throw new DimensionError(0, r, "!=");
	t = processSizesWildcard(t, r);
	var i = product(t);
	if (r !== i) throw new DimensionError(i, r, "!=");
	try {
		return _reshape(n, t);
	} catch (e) {
		throw e instanceof DimensionError ? new DimensionError(i, r, "!=") : e;
	}
}
function processSizesWildcard(e, t) {
	var n = product(e), r = e.slice(), i = -1, a = e.indexOf(i);
	if (e.indexOf(i, a + 1) >= 0) throw Error("More than one wildcard in sizes");
	var o = a >= 0, s = t % n === 0;
	if (o) if (s) r[a] = -t / n;
	else throw Error("Could not replace wildcard, since " + t + " is no multiple of " + -n);
	return r;
}
function product(e) {
	return e.reduce((e, t) => e * t, 1);
}
function _reshape(e, t) {
	for (var n = e, r, i = t.length - 1; i > 0; i--) {
		var a = t[i];
		r = [];
		for (var o = n.length / a, s = 0; s < o; s++) r.push(n.slice(s * a, (s + 1) * a));
		n = r;
	}
	return n;
}
function squeeze(e, t) {
	for (var n = t || arraySize(e); Array.isArray(e) && e.length === 1;) e = e[0], n.shift();
	for (var r = n.length; n[r - 1] === 1;) r--;
	return r < n.length && (e = _squeeze(e, r, 0), n.length = r), e;
}
function _squeeze(e, t, n) {
	var r, i;
	if (n < t) {
		var a = n + 1;
		for (r = 0, i = e.length; r < i; r++) e[r] = _squeeze(e[r], t, a);
	} else for (; Array.isArray(e);) e = e[0];
	return e;
}
function unsqueeze(e, t, n, r) {
	var i = r || arraySize(e);
	if (n) for (var a = 0; a < n; a++) e = [e], i.unshift(1);
	for (e = _unsqueeze(e, t, 0); i.length < t;) i.push(1);
	return e;
}
function _unsqueeze(e, t, n) {
	var r, i;
	if (Array.isArray(e)) {
		var a = n + 1;
		for (r = 0, i = e.length; r < i; r++) e[r] = _unsqueeze(e[r], t, a);
	} else for (var o = n; o < t; o++) e = [e];
	return e;
}
function flatten$1(e) {
	var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
	if (!Array.isArray(e)) return e;
	if (typeof t != "boolean") throw TypeError("Boolean expected for second argument of flatten");
	var n = [];
	return t ? i(e) : r(e), n;
	function r(e) {
		for (var t = 0; t < e.length; t++) {
			var i = e[t];
			Array.isArray(i) ? r(i) : n.push(i);
		}
	}
	function i(e) {
		if (Array.isArray(e[0])) for (var t = 0; t < e.length; t++) i(e[t]);
		else for (var r = 0; r < e.length; r++) n.push(e[r]);
	}
}
function getArrayDataType(e, t) {
	for (var n, r = 0, i = 0; i < e.length; i++) {
		var a = e[i], o = Array.isArray(a);
		if (i === 0 && o && (r = a.length), o && a.length !== r) return;
		var s = o ? getArrayDataType(a, t) : t(a);
		if (n === void 0) n = s;
		else if (n !== s) return "mixed";
	}
	return n;
}
function concatRecursive(e, t, n, r) {
	if (r < n) {
		if (e.length !== t.length) throw new DimensionError(e.length, t.length);
		for (var i = [], a = 0; a < e.length; a++) i[a] = concatRecursive(e[a], t[a], n, r + 1);
		return i;
	} else return e.concat(t);
}
function concat$1() {
	var e = Array.prototype.slice.call(arguments, 0, -1), t = Array.prototype.slice.call(arguments, -1);
	if (e.length === 1) return e[0];
	if (e.length > 1) return e.slice(1).reduce(function(e, n) {
		return concatRecursive(e, n, t, 0);
	}, e[0]);
	throw Error("Wrong number of arguments in function concat");
}
function broadcastSizes() {
	for (var e = [...arguments], t = e.map((e) => e.length), n = Math.max(...t), r = Array(n).fill(null), i = 0; i < e.length; i++) for (var a = e[i], o = t[i], s = 0; s < o; s++) {
		var c = n - o + s;
		a[s] > r[c] && (r[c] = a[s]);
	}
	for (var l = 0; l < e.length; l++) checkBroadcastingRules(e[l], r);
	return r;
}
function checkBroadcastingRules(e, t) {
	for (var n = t.length, r = e.length, i = 0; i < r; i++) {
		var a = n - r + i;
		if (e[i] < t[a] && e[i] > 1 || e[i] > t[a]) throw Error(`shape mismatch: mismatch is found in arg with shape (${e}) not possible to broadcast dimension ${r} with size ${e[i]} to size ${t[a]}`);
	}
}
function broadcastTo(e, t) {
	var n = arraySize(e);
	if (deepStrictEqual(n, t)) return e;
	checkBroadcastingRules(n, t);
	var r = broadcastSizes(n, t), i = r.length, a = [...Array(i - n.length).fill(1), ...n], o = clone(e);
	n.length < i && (o = reshape$1(o, a), n = arraySize(o));
	for (var s = 0; s < i; s++) n[s] < r[s] && (o = stretch(o, r[s], s), n = arraySize(o));
	return o;
}
function stretch(e, t, n) {
	return concat$1(...Array(t).fill(e), n);
}
function get(e, t) {
	if (!Array.isArray(e)) throw Error("Array expected");
	var n = arraySize(e);
	if (t.length !== n.length) throw new DimensionError(t.length, n.length);
	for (var r = 0; r < t.length; r++) validateIndex(t[r], n[r]);
	return t.reduce((e, t) => e[t], e);
}
function deepMap$1(e, t) {
	var n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !1;
	if (e.length === 0) return [];
	if (n) return a(e);
	var r = [];
	return i(e, 0);
	function i(n, a) {
		if (Array.isArray(n)) {
			for (var o = n.length, s = Array(o), c = 0; c < o; c++) r[a] = c, s[c] = i(n[c], a + 1);
			return s;
		} else return t(n, r.slice(0, a), e);
	}
	function a(e) {
		if (Array.isArray(e)) {
			for (var n = e.length, r = Array(n), i = 0; i < n; i++) r[i] = a(e[i]);
			return r;
		} else return t(e);
	}
}
function clone(e) {
	return _extends([], e);
}
//#endregion
//#region node_modules/mathjs/lib/esm/utils/optimizeCallback.js
function optimizeCallback(e, t, n, r) {
	if (import_typed_function.default.isTypedFunction(e)) {
		var i;
		if (r) i = 1;
		else {
			var a = t.isMatrix ? t.size() : arraySize(t);
			if (!a.length || a[a.length - 1] === 0) return {
				isUnary: r,
				fn: e
			};
			var o = a.map(() => 0);
			i = _findNumberOfArgumentsTyped(e, t.isMatrix ? t.get(o) : get(t, o), o, t);
		}
		var s;
		if (t.isMatrix && t.dataType !== "mixed" && t.dataType !== void 0) {
			var c = _findSingleSignatureWithArity(e, i);
			s = c === void 0 ? e : c;
		} else s = e;
		return i >= 1 && i <= 3 ? {
			isUnary: i === 1,
			fn: function() {
				return _tryFunctionWithArgs(s, [...arguments].slice(0, i), n, e.name);
			}
		} : {
			isUnary: !1,
			fn: function() {
				return _tryFunctionWithArgs(s, [...arguments], n, e.name);
			}
		};
	}
	return r === void 0 ? {
		isUnary: _findIfCallbackIsUnary(e),
		fn: e
	} : {
		isUnary: r,
		fn: e
	};
}
function _findSingleSignatureWithArity(e, t) {
	var n = [];
	if (Object.entries(e.signatures).forEach((e) => {
		var [r, i] = e;
		r.split(",").length === t && n.push(i);
	}), n.length === 1) return n[0];
}
function _findIfCallbackIsUnary(e) {
	if (e.length !== 1) return !1;
	var t = e.toString();
	if (/arguments/.test(t)) return !1;
	var n = t.match(/\(.*?\)/);
	return !/\.\.\./.test(n);
}
function _findNumberOfArgumentsTyped(e, t, n, r) {
	for (var i = [
		t,
		n,
		r
	], a = 3; a > 0; a--) {
		var o = i.slice(0, a);
		if (import_typed_function.default.resolve(e, o) !== null) return a;
	}
}
function _tryFunctionWithArgs(e, t, n, r) {
	try {
		return e(...t);
	} catch (e) {
		_createCallbackError(e, t, n, r);
	}
}
function _createCallbackError(e, t, n, r) {
	var i;
	if (e instanceof TypeError && e.data?.category === "wrongType") {
		var a = [];
		throw a.push(`value: ${typeOf(t[0])}`), t.length >= 2 && a.push(`index: ${typeOf(t[1])}`), t.length >= 3 && a.push(`array: ${typeOf(t[2])}`), TypeError(`Function ${n} cannot apply callback arguments ${r}(${a.join(", ")}) at index ${JSON.stringify(t[1])}`);
	} else throw TypeError(`Function ${n} cannot apply callback arguments to function ${r}: ${e.message}`);
}
//#endregion
//#region node_modules/mathjs/lib/esm/type/matrix/DenseMatrix.js
var name$71 = "DenseMatrix", dependencies$71 = ["Matrix", "config"], createDenseMatrixClass = /* @__PURE__ */ factory(name$71, dependencies$71, (e) => {
	var { Matrix: t, config: n } = e;
	function r(e, t) {
		if (!(this instanceof r)) throw SyntaxError("Constructor must be called with the new operator");
		if (t && !isString(t)) throw Error("Invalid datatype: " + t);
		if (isMatrix(e)) e.type === "DenseMatrix" ? (this._data = clone$2(e._data), this._size = clone$2(e._size), this._datatype = t || e._datatype) : (this._data = e.toArray(), this._size = e.size(), this._datatype = t || e._datatype);
		else if (e && isArray(e.data) && isArray(e.size)) this._data = e.data, this._size = e.size, validate(this._data, this._size), this._datatype = t || e.datatype;
		else if (isArray(e)) this._data = u(e), this._size = arraySize(this._data), validate(this._data, this._size), this._datatype = t;
		else if (e) throw TypeError("Unsupported type of data (" + typeOf(e) + ")");
		else this._data = [], this._size = [0], this._datatype = t;
	}
	r.prototype = new t(), r.prototype.createDenseMatrix = function(e, t) {
		return new r(e, t);
	}, Object.defineProperty(r, "name", { value: "DenseMatrix" }), r.prototype.constructor = r, r.prototype.type = "DenseMatrix", r.prototype.isDenseMatrix = !0, r.prototype.getDataType = function() {
		return getArrayDataType(this._data, typeOf);
	}, r.prototype.storage = function() {
		return "dense";
	}, r.prototype.datatype = function() {
		return this._datatype;
	}, r.prototype.create = function(e, t) {
		return new r(e, t);
	}, r.prototype.subset = function(e, t, n) {
		switch (arguments.length) {
			case 1: return i(this, e);
			case 2:
			case 3: return o(this, e, t, n);
			default: throw SyntaxError("Wrong number of arguments");
		}
	}, r.prototype.get = function(e) {
		return get(this._data, e);
	}, r.prototype.set = function(e, t, n) {
		if (!isArray(e)) throw TypeError("Array expected");
		if (e.length < this._size.length) throw new DimensionError(e.length, this._size.length, "<");
		var r, i, a, o = e.map(function(e) {
			return e + 1;
		});
		l(this, o, n);
		var s = this._data;
		for (r = 0, i = e.length - 1; r < i; r++) a = e[r], validateIndex(a, s.length), s = s[a];
		return a = e[e.length - 1], validateIndex(a, s.length), s[a] = t, this;
	};
	function i(e, t) {
		if (!isIndex(t)) throw TypeError("Invalid index");
		if (n.legacySubset ? t.size().every((e) => e === 1) : t.isScalar()) return e.get(t.min());
		var i = t.size();
		if (i.length !== e._size.length) throw new DimensionError(i.length, e._size.length);
		for (var o = t.min(), s = t.max(), c = 0, l = e._size.length; c < l; c++) validateIndex(o[c], e._size[c]), validateIndex(s[c], e._size[c]);
		var u = new r(), d = a(e._data, t);
		return u._size = d.size, u._datatype = e._datatype, u._data = d.data, n.legacySubset ? u.reshape(t.size()) : u;
	}
	function a(e, t) {
		var n = t.size().length - 1, r = Array(n);
		return {
			data: i(e),
			size: r.filter((e) => e !== null)
		};
		function i(e) {
			var a = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0, o = t.dimension(a);
			function s(e, t) {
				return isNumber(e) ? t(e) : e.map(t).valueOf();
			}
			return isNumber(o) ? r[a] = null : r[a] = o.size()[0], a < n ? s(o, (t) => (validateIndex(t, e.length), i(e[t], a + 1))) : s(o, (t) => (validateIndex(t, e.length), e[t]));
		}
	}
	function o(e, t, n, r) {
		if (!t || t.isIndex !== !0) throw TypeError("Invalid index");
		var i = t.size(), a = t.isScalar(), o;
		if (isMatrix(n) ? (o = n.size(), n = n.valueOf()) : o = arraySize(n), a) {
			if (o.length !== 0) throw TypeError("Scalar expected");
			e.set(t.min(), n, r);
		} else {
			if (!deepStrictEqual(o, i)) {
				if (o.length === 0) n = broadcastTo([n], i);
				else try {
					n = broadcastTo(n, i);
				} catch {}
				o = arraySize(n);
			}
			if (i.length < e._size.length) throw new DimensionError(i.length, e._size.length, "<");
			if (o.length < i.length) {
				for (var c = 0, u = 0; i[c] === 1 && o[c] === 1;) c++;
				for (; i[c] === 1;) u++, c++;
				n = unsqueeze(n, i.length, u, o);
			}
			if (!deepStrictEqual(i, o)) throw new DimensionError(i, o, ">");
			l(e, t.max().map(function(e) {
				return e + 1;
			}), r), s(e._data, t, n);
		}
		return e;
	}
	function s(e, t, n) {
		var r = t.size().length - 1;
		i(e, n);
		function i(e, n) {
			var a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0, o = t.dimension(a), s = (t, r) => {
				validateIndex(t, e.length), i(e[t], n[r[0]], a + 1);
			}, c = (t, r) => {
				validateIndex(t, e.length), e[t] = n[r[0]];
			};
			a < r ? isNumber(o) ? s(o, [0]) : o.forEach(s) : isNumber(o) ? c(o, [0]) : o.forEach(c);
		}
	}
	r.prototype.resize = function(e, t, n) {
		if (!isCollection(e)) throw TypeError("Array or Matrix expected");
		var r = e.valueOf().map((e) => Array.isArray(e) && e.length === 1 ? e[0] : e);
		return c(n ? this.clone() : this, r, t);
	};
	function c(e, t, n) {
		if (t.length === 0) {
			for (var r = e._data; isArray(r);) r = r[0];
			return r;
		}
		return e._size = t.slice(0), e._data = resize(e._data, e._size, n), e;
	}
	r.prototype.reshape = function(e, t) {
		var n = t ? this.clone() : this;
		return n._data = reshape$1(n._data, e), n._size = processSizesWildcard(e, n._size.reduce((e, t) => e * t)), n;
	};
	function l(e, t, n) {
		for (var r = e._size.slice(0), i = !1; r.length < t.length;) r.push(0), i = !0;
		for (var a = 0, o = t.length; a < o; a++) t[a] > r[a] && (r[a] = t[a], i = !0);
		i && c(e, r, n);
	}
	r.prototype.clone = function() {
		return new r({
			data: clone$2(this._data),
			size: clone$2(this._size),
			datatype: this._datatype
		});
	}, r.prototype.size = function() {
		return this._size.slice(0);
	}, r.prototype.map = function(e) {
		arguments.length > 1 && arguments[1] !== void 0 && arguments[1];
		var t = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !1, n = this, r = n._size.length - 1;
		if (r < 0) return n.clone();
		var i = optimizeCallback(e, n, "map", t), a = i.fn, o = n.create(void 0, n._datatype);
		if (o._size = n._size, t || i.isUnary) return o._data = f(n._data), o;
		if (r === 0) {
			for (var s = n.valueOf(), c = Array(s.length), l = 0; l < s.length; l++) c[l] = a(s[l], [l], n);
			return o._data = c, o;
		}
		var u = [];
		return o._data = d(n._data), o;
		function d(e) {
			var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0, i = Array(e.length);
			if (t < r) for (var o = 0; o < e.length; o++) u[t] = o, i[o] = d(e[o], t + 1);
			else for (var s = 0; s < e.length; s++) u[t] = s, i[s] = a(e[s], u.slice(), n);
			return i;
		}
		function f(e) {
			var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0, n = Array(e.length);
			if (t < r) for (var i = 0; i < e.length; i++) n[i] = f(e[i], t + 1);
			else for (var o = 0; o < e.length; o++) n[o] = a(e[o]);
			return n;
		}
	}, r.prototype.forEach = function(e) {
		arguments.length > 1 && arguments[1] !== void 0 && arguments[1];
		var t = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !1, n = this, r = n._size.length - 1;
		if (r < 0) return;
		var i = optimizeCallback(e, n, "map", t), a = i.fn;
		if (t || i.isUnary) {
			l(n._data);
			return;
		}
		if (r === 0) {
			for (var o = 0; o < n._data.length; o++) a(n._data[o], [o], n);
			return;
		}
		var s = [];
		c(n._data);
		function c(e) {
			var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
			if (t < r) for (var i = 0; i < e.length; i++) s[t] = i, c(e[i], t + 1);
			else for (var o = 0; o < e.length; o++) s[t] = o, a(e[o], s.slice(), n);
		}
		function l(e) {
			var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
			if (t < r) for (var n = 0; n < e.length; n++) l(e[n], t + 1);
			else for (var i = 0; i < e.length; i++) a(e[i]);
		}
	}, r.prototype[Symbol.iterator] = function* () {
		var e = this._size.length - 1;
		if (!(e < 0)) {
			if (e === 0) {
				for (var t = 0; t < this._data.length; t++) yield {
					value: this._data[t],
					index: [t]
				};
				return;
			}
			for (var n = Array(e + 1).fill(0), r = this._size.reduce((e, t) => e * t, 1), i = 0; i < r; i++) {
				for (var a = this._data, o = 0; o < e; o++) a = a[n[o]];
				yield {
					value: a[n[e]],
					index: n.slice()
				};
				for (var s = e; s >= 0 && (n[s]++, !(n[s] < this._size[s])); s--) n[s] = 0;
			}
		}
	}, r.prototype.rows = function() {
		var e = [];
		if (this.size().length !== 2) throw TypeError("Rows can only be returned for a 2D matrix.");
		for (var t of this._data) e.push(new r([t], this._datatype));
		return e;
	}, r.prototype.columns = function() {
		var e = this, t = [], n = this.size();
		if (n.length !== 2) throw TypeError("Rows can only be returned for a 2D matrix.");
		for (var i = this._data, a = function(n) {
			var a = i.map((e) => [e[n]]);
			t.push(new r(a, e._datatype));
		}, o = 0; o < n[1]; o++) a(o);
		return t;
	}, r.prototype.toArray = function() {
		return clone$2(this._data);
	}, r.prototype.valueOf = function() {
		return this._data;
	}, r.prototype.format = function(e) {
		return format(this._data, e);
	}, r.prototype.toString = function() {
		return format(this._data);
	}, r.prototype.toJSON = function() {
		return {
			mathjs: "DenseMatrix",
			data: this._data,
			size: this._size,
			datatype: this._datatype
		};
	}, r.prototype.diagonal = function(e) {
		if (e) {
			if (isBigNumber(e) && (e = e.toNumber()), !isNumber(e) || !isInteger$1(e)) throw TypeError("The parameter k must be an integer number");
		} else e = 0;
		for (var t = e > 0 ? e : 0, n = e < 0 ? -e : 0, i = this._size[0], a = this._size[1], o = Math.min(i - n, a - t), s = [], c = 0; c < o; c++) s[c] = this._data[c + n][c + t];
		return new r({
			data: s,
			size: [o],
			datatype: this._datatype
		});
	}, r.diagonal = function(e, t, n, i) {
		if (!isArray(e)) throw TypeError("Array expected, size parameter");
		if (e.length !== 2) throw Error("Only two dimensions matrix are supported");
		if (e = e.map(function(e) {
			if (isBigNumber(e) && (e = e.toNumber()), !isNumber(e) || !isInteger$1(e) || e < 1) throw Error("Size values must be positive integers");
			return e;
		}), n) {
			if (isBigNumber(n) && (n = n.toNumber()), !isNumber(n) || !isInteger$1(n)) throw TypeError("The parameter k must be an integer number");
		} else n = 0;
		var a = n > 0 ? n : 0, o = n < 0 ? -n : 0, s = e[0], c = e[1], l = Math.min(s - o, c - a), u;
		if (isArray(t)) {
			if (t.length !== l) throw Error("Invalid value array length");
			u = function(e) {
				return t[e];
			};
		} else if (isMatrix(t)) {
			var d = t.size();
			if (d.length !== 1 || d[0] !== l) throw Error("Invalid matrix length");
			u = function(e) {
				return t.get([e]);
			};
		} else u = function() {
			return t;
		};
		i ||= isBigNumber(u(0)) ? u(0).mul(0) : 0;
		var f = [];
		if (e.length > 0) {
			f = resize(f, e, i);
			for (var p = 0; p < l; p++) f[p + o][p + a] = u(p);
		}
		return new r({
			data: f,
			size: [s, c]
		});
	}, r.fromJSON = function(e) {
		return new r(e);
	}, r.prototype.swapRows = function(e, t) {
		if (!isNumber(e) || !isInteger$1(e) || !isNumber(t) || !isInteger$1(t)) throw Error("Row index must be positive integers");
		if (this._size.length !== 2) throw Error("Only two dimensional matrix is supported");
		return validateIndex(e, this._size[0]), validateIndex(t, this._size[0]), r._swapRows(e, t, this._data), this;
	}, r._swapRows = function(e, t, n) {
		var r = n[e];
		n[e] = n[t], n[t] = r;
	};
	function u(e) {
		return isMatrix(e) ? u(e.valueOf()) : isArray(e) ? e.map(u) : e;
	}
	return r;
}, { isClass: !0 });
//#endregion
//#region node_modules/mathjs/lib/esm/utils/collection.js
function deepMap(e, t, n) {
	if (!n) return isMatrix(e) ? e.map((e) => t(e), !1, !0) : deepMap$1(e, t, !0);
	var r = (e) => e === 0 ? e : t(e);
	return isMatrix(e) ? e.map((e) => r(e), !1, !0) : deepMap$1(e, r, !0);
}
//#endregion
//#region node_modules/mathjs/lib/esm/function/utils/isInteger.js
var name$70 = "isInteger", dependencies$70 = ["typed", "equal"], createIsInteger = /* @__PURE__ */ factory(name$70, dependencies$70, (e) => {
	var { typed: t, equal: n } = e;
	return t(name$70, {
		number: (e) => Number.isFinite(e) ? n(e, Math.round(e)) : !1,
		BigNumber: (e) => e.isFinite() ? n(e.round(), e) : !1,
		bigint: (e) => !0,
		Fraction: (e) => e.d === 1n,
		"Array | Matrix": t.referToSelf((e) => (t) => deepMap(t, e))
	});
}), n1$1 = "number", n2 = "number, number";
function absNumber(e) {
	return Math.abs(e);
}
absNumber.signature = n1$1;
function addNumber(e, t) {
	return e + t;
}
addNumber.signature = n2;
function subtractNumber(e, t) {
	return e - t;
}
subtractNumber.signature = n2;
function multiplyNumber(e, t) {
	return e * t;
}
multiplyNumber.signature = n2;
function divideNumber(e, t) {
	return e / t;
}
divideNumber.signature = n2;
function unaryMinusNumber(e) {
	return -e;
}
unaryMinusNumber.signature = n1$1;
function unaryPlusNumber(e) {
	return e;
}
unaryPlusNumber.signature = n1$1;
function cbrtNumber(e) {
	return cbrt$1(e);
}
cbrtNumber.signature = n1$1;
function cubeNumber(e) {
	return e * e * e;
}
cubeNumber.signature = n1$1;
function expNumber(e) {
	return Math.exp(e);
}
expNumber.signature = n1$1;
function expm1Number(e) {
	return expm1(e);
}
expm1Number.signature = n1$1;
function gcdNumber(e, t) {
	if (!isInteger$1(e) || !isInteger$1(t)) throw Error("Parameters in function gcd must be integer numbers");
	for (var n; t !== 0;) n = e % t, e = t, t = n;
	return e < 0 ? -e : e;
}
gcdNumber.signature = n2;
function lcmNumber(e, t) {
	if (!isInteger$1(e) || !isInteger$1(t)) throw Error("Parameters in function lcm must be integer numbers");
	if (e === 0 || t === 0) return 0;
	for (var n, r = e * t; t !== 0;) n = t, t = e % n, e = n;
	return Math.abs(r / e);
}
lcmNumber.signature = n2;
function log10Number(e) {
	return log10$1(e);
}
log10Number.signature = n1$1;
function log2Number(e) {
	return log2$1(e);
}
log2Number.signature = n1$1;
function log1pNumber(e) {
	return log1p(e);
}
log1pNumber.signature = n1$1;
function modNumber(e, t) {
	return t === 0 ? e : e - t * Math.floor(e / t);
}
modNumber.signature = n2;
function signNumber(e) {
	return sign$2(e);
}
signNumber.signature = n1$1;
function sqrtNumber(e) {
	return Math.sqrt(e);
}
sqrtNumber.signature = n1$1;
function squareNumber(e) {
	return e * e;
}
squareNumber.signature = n1$1;
function xgcdNumber(e, t) {
	var n, r, i, a = 0, o = 1, s = 1, c = 0;
	if (!isInteger$1(e) || !isInteger$1(t)) throw Error("Parameters in function xgcd must be integer numbers");
	for (; t;) r = Math.floor(e / t), i = e - r * t, n = a, a = o - r * a, o = n, n = s, s = c - r * s, c = n, e = t, t = i;
	return e < 0 ? [
		-e,
		-o,
		-c
	] : [
		e,
		e ? o : 0,
		c
	];
}
xgcdNumber.signature = n2;
function powNumber(e, t) {
	return e * e < 1 && t === Infinity || e * e > 1 && t === -Infinity ? 0 : e ** +t;
}
powNumber.signature = n2;
function normNumber(e) {
	return Math.abs(e);
}
normNumber.signature = n1$1;
//#endregion
//#region node_modules/mathjs/lib/esm/plain/number/utils.js
var n1 = "number";
function isIntegerNumber(e) {
	return isInteger$1(e);
}
isIntegerNumber.signature = n1;
function isNegativeNumber(e) {
	return e < 0;
}
isNegativeNumber.signature = n1;
function isPositiveNumber(e) {
	return e > 0;
}
isPositiveNumber.signature = n1;
function isZeroNumber(e) {
	return e === 0;
}
isZeroNumber.signature = n1;
function isNaNNumber(e) {
	return Number.isNaN(e);
}
isNaNNumber.signature = n1;
//#endregion
//#region node_modules/mathjs/lib/esm/utils/bignumber/nearlyEqual.js
function nearlyEqual(e, t) {
	var n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 1e-9, r = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0;
	if (n <= 0) throw Error("Relative tolerance must be greater than 0");
	if (r < 0) throw Error("Absolute tolerance must be at least 0");
	return e.isNaN() || t.isNaN() ? !1 : !e.isFinite() || !t.isFinite() ? e.eq(t) : e.eq(t) ? !0 : e.minus(t).abs().lte(e.constructor.max(e.constructor.max(e.abs(), t.abs()).mul(n), r));
}
//#endregion
//#region node_modules/mathjs/lib/esm/function/utils/isPositive.js
var name$69 = "isPositive", dependencies$69 = ["typed", "config"], createIsPositive = /* @__PURE__ */ factory(name$69, dependencies$69, (e) => {
	var { typed: t, config: n } = e;
	return t(name$69, {
		number: (e) => nearlyEqual$1(e, 0, n.relTol, n.absTol) ? !1 : isPositiveNumber(e),
		BigNumber: (e) => nearlyEqual(e, new e.constructor(0), n.relTol, n.absTol) ? !1 : !e.isNeg() && !e.isZero() && !e.isNaN(),
		bigint: (e) => e > 0n,
		Fraction: (e) => e.s > 0n && e.n > 0n,
		Unit: t.referToSelf((e) => (n) => t.find(e, n.valueType())(n.value)),
		"Array | Matrix": t.referToSelf((e) => (t) => deepMap(t, e))
	});
}), name$68 = "isZero", dependencies$68 = ["typed", "equalScalar"], createIsZero = /* @__PURE__ */ factory(name$68, dependencies$68, (e) => {
	var { typed: t, equalScalar: n } = e;
	return t(name$68, {
		"number | BigNumber | Complex | Fraction": (e) => n(e, 0),
		bigint: (e) => e === 0n,
		Unit: t.referToSelf((e) => (n) => t.find(e, n.valueType())(n.value)),
		"Array | Matrix": t.referToSelf((e) => (t) => deepMap(t, e))
	});
});
//#endregion
//#region node_modules/mathjs/lib/esm/utils/complex.js
function complexEquals(e, t, n, r) {
	return nearlyEqual$1(e.re, t.re, n, r) && nearlyEqual$1(e.im, t.im, n, r);
}
//#endregion
//#region node_modules/mathjs/lib/esm/function/relational/compareUnits.js
var createCompareUnits = /* @__PURE__ */ factory("compareUnits", ["typed"], (e) => {
	var { typed: t } = e;
	return { "Unit, Unit": t.referToSelf((e) => (n, r) => {
		if (!n.equalBase(r)) throw Error("Cannot compare units with different base");
		return t.find(e, [n.valueType(), r.valueType()])(n.value, r.value);
	}) };
}), name$67 = "equalScalar", dependencies$67 = ["typed", "config"], createEqualScalar = /* @__PURE__ */ factory(name$67, dependencies$67, (e) => {
	var { typed: t, config: n } = e, r = createCompareUnits({ typed: t });
	return t(name$67, {
		"boolean, boolean": function(e, t) {
			return e === t;
		},
		"number, number": function(e, t) {
			return nearlyEqual$1(e, t, n.relTol, n.absTol);
		},
		"BigNumber, BigNumber": function(e, t) {
			return e.eq(t) || nearlyEqual(e, t, n.relTol, n.absTol);
		},
		"bigint, bigint": function(e, t) {
			return e === t;
		},
		"Fraction, Fraction": function(e, t) {
			return e.equals(t);
		},
		"Complex, Complex": function(e, t) {
			return complexEquals(e, t, n.relTol, n.absTol);
		}
	}, r);
}), createEqualScalarNumber = factory(name$67, ["typed", "config"], (e) => {
	var { typed: t, config: n } = e;
	return t(name$67, { "number, number": function(e, t) {
		return nearlyEqual$1(e, t, n.relTol, n.absTol);
	} });
}), name$66 = "SparseMatrix", dependencies$66 = [
	"typed",
	"equalScalar",
	"Matrix"
], createSparseMatrixClass = /* @__PURE__ */ factory(name$66, dependencies$66, (e) => {
	var { typed: t, equalScalar: n, Matrix: r } = e;
	function i(e, t) {
		if (!(this instanceof i)) throw SyntaxError("Constructor must be called with the new operator");
		if (t && !isString(t)) throw Error("Invalid datatype: " + t);
		if (isMatrix(e)) a(this, e, t);
		else if (e && isArray(e.index) && isArray(e.ptr) && isArray(e.size)) this._values = e.values, this._index = e.index, this._ptr = e.ptr, this._size = e.size, this._datatype = t || e.datatype;
		else if (isArray(e)) o(this, e, t);
		else if (e) throw TypeError("Unsupported type of data (" + typeOf(e) + ")");
		else this._values = [], this._index = [], this._ptr = [0], this._size = [0, 0], this._datatype = t;
	}
	function a(e, t, n) {
		t.type === "SparseMatrix" ? (e._values = t._values ? clone$2(t._values) : void 0, e._index = clone$2(t._index), e._ptr = clone$2(t._ptr), e._size = clone$2(t._size), e._datatype = n || t._datatype) : o(e, t.valueOf(), n || t._datatype);
	}
	function o(e, r, i) {
		e._values = [], e._index = [], e._ptr = [], e._datatype = i;
		var a = r.length, o = 0, s = n, c = 0;
		if (isString(i) && (s = t.find(n, [i, i]) || n, c = t.convert(0, i)), a > 0) {
			var l = 0;
			do {
				e._ptr.push(e._index.length);
				for (var u = 0; u < a; u++) {
					var d = r[u];
					if (isArray(d)) {
						if (l === 0 && o < d.length && (o = d.length), l < d.length) {
							var f = d[l];
							s(f, c) || (e._values.push(f), e._index.push(u));
						}
					} else l === 0 && o < 1 && (o = 1), s(d, c) || (e._values.push(d), e._index.push(u));
				}
				l++;
			} while (l < o);
		}
		for (; e._ptr.length <= o;) e._ptr.push(e._index.length);
		e._size = [a, o];
	}
	i.prototype = new r(), i.prototype.createSparseMatrix = function(e, t) {
		return new i(e, t);
	}, Object.defineProperty(i, "name", { value: "SparseMatrix" }), i.prototype.constructor = i, i.prototype.type = "SparseMatrix", i.prototype.isSparseMatrix = !0, i.prototype.getDataType = function() {
		return getArrayDataType(this._values, typeOf);
	}, i.prototype.storage = function() {
		return "sparse";
	}, i.prototype.datatype = function() {
		return this._datatype;
	}, i.prototype.create = function(e, t) {
		return new i(e, t);
	}, i.prototype.density = function() {
		var e = this._size[0], t = this._size[1];
		return e !== 0 && t !== 0 ? this._index.length / (e * t) : 0;
	}, i.prototype.subset = function(e, t, n) {
		if (!this._values) throw Error("Cannot invoke subset on a Pattern only matrix");
		switch (arguments.length) {
			case 1: return s(this, e);
			case 2:
			case 3: return c(this, e, t, n);
			default: throw SyntaxError("Wrong number of arguments");
		}
	};
	function s(e, t) {
		if (!isIndex(t)) throw TypeError("Invalid index");
		if (t.isScalar()) return e.get(t.min());
		var n = t.size();
		if (n.length !== e._size.length) throw new DimensionError(n.length, e._size.length);
		var r, a, o, s, c = t.min(), l = t.max();
		for (r = 0, a = e._size.length; r < a; r++) validateIndex(c[r], e._size[r]), validateIndex(l[r], e._size[r]);
		var u = e._values, d = e._index, f = e._ptr, p = t.dimension(0), m = t.dimension(1), h = [], g = [];
		function _(e, t) {
			g[e] = t[0], h[e] = !0;
		}
		Number.isInteger(p) ? _(p, [0]) : p.forEach(_);
		var v = u ? [] : void 0, y = [], b = [];
		function x(e) {
			for (b.push(y.length), o = f[e], s = f[e + 1]; o < s; o++) r = d[o], h[r] === !0 && (y.push(g[r]), v && v.push(u[o]));
		}
		return Number.isInteger(m) ? x(m) : m.forEach(x), b.push(y.length), new i({
			values: v,
			index: y,
			ptr: b,
			size: n,
			datatype: e._datatype
		});
	}
	function c(e, t, n, r) {
		if (!t || t.isIndex !== !0) throw TypeError("Invalid index");
		var i = t.size(), a = t.isScalar(), o;
		if (isMatrix(n) ? (o = n.size(), n = n.toArray()) : o = arraySize(n), a) {
			if (o.length !== 0) throw TypeError("Scalar expected");
			e.set(t.min(), n, r);
		} else {
			if (i.length !== 1 && i.length !== 2) throw new DimensionError(i.length, e._size.length, "<");
			if (o.length < i.length) {
				for (var s = 0, c = 0; i[s] === 1 && o[s] === 1;) s++;
				for (; i[s] === 1;) c++, s++;
				n = unsqueeze(n, i.length, c, o);
			}
			if (!deepStrictEqual(i, o)) throw new DimensionError(i, o, ">");
			if (i.length === 1) d(t.dimension(0), (t, i) => {
				validateIndex(t), e.set([t, 0], n[i[0]], r);
			});
			else {
				var l = t.dimension(0), u = t.dimension(1);
				d(l, (t, i) => {
					validateIndex(t), d(u, (a, o) => {
						validateIndex(a), e.set([t, a], n[i[0]][o[0]], r);
					});
				});
			}
		}
		return e;
		function d(e, t) {
			isNumber(e) ? t(e, [0]) : e.forEach(t);
		}
	}
	i.prototype.get = function(e) {
		if (!isArray(e)) throw TypeError("Array expected");
		if (e.length !== this._size.length) throw new DimensionError(e.length, this._size.length);
		if (!this._values) throw Error("Cannot invoke get on a Pattern only matrix");
		var t = e[0], n = e[1];
		validateIndex(t, this._size[0]), validateIndex(n, this._size[1]);
		var r = l(t, this._ptr[n], this._ptr[n + 1], this._index);
		return r < this._ptr[n + 1] && this._index[r] === t ? this._values[r] : 0;
	}, i.prototype.set = function(e, r, i) {
		if (!isArray(e)) throw TypeError("Array expected");
		if (e.length !== this._size.length) throw new DimensionError(e.length, this._size.length);
		if (!this._values) throw Error("Cannot invoke set on a Pattern only matrix");
		var a = e[0], o = e[1], s = this._size[0], c = this._size[1], p = n, m = 0;
		isString(this._datatype) && (p = t.find(n, [this._datatype, this._datatype]) || n, m = t.convert(0, this._datatype)), (a > s - 1 || o > c - 1) && (f(this, Math.max(a + 1, s), Math.max(o + 1, c), i), s = this._size[0], c = this._size[1]), validateIndex(a, s), validateIndex(o, c);
		var h = l(a, this._ptr[o], this._ptr[o + 1], this._index);
		return h < this._ptr[o + 1] && this._index[h] === a ? p(r, m) ? u(h, o, this._values, this._index, this._ptr) : this._values[h] = r : p(r, m) || d(h, a, o, r, this._values, this._index, this._ptr), this;
	};
	function l(e, t, n, r) {
		if (n - t === 0) return n;
		for (var i = t; i < n; i++) if (r[i] === e) return i;
		return t;
	}
	function u(e, t, n, r, i) {
		n.splice(e, 1), r.splice(e, 1);
		for (var a = t + 1; a < i.length; a++) i[a]--;
	}
	function d(e, t, n, r, i, a, o) {
		i.splice(e, 0, r), a.splice(e, 0, t);
		for (var s = n + 1; s < o.length; s++) o[s]++;
	}
	i.prototype.resize = function(e, t, n) {
		if (!isCollection(e)) throw TypeError("Array or Matrix expected");
		var r = e.valueOf().map((e) => Array.isArray(e) && e.length === 1 ? e[0] : e);
		if (r.length !== 2) throw Error("Only two dimensions matrix are supported");
		return r.forEach(function(e) {
			if (!isNumber(e) || !isInteger$1(e) || e < 0) throw TypeError("Invalid size, must contain positive integers (size: " + format(r) + ")");
		}), f(n ? this.clone() : this, r[0], r[1], t);
	};
	function f(e, r, i, a) {
		var o = a || 0, s = n, c = 0;
		isString(e._datatype) && (s = t.find(n, [e._datatype, e._datatype]) || n, c = t.convert(0, e._datatype), o = t.convert(o, e._datatype));
		var l = !s(o, c), u = e._size[0], d = e._size[1], f, p, m;
		if (i > d) {
			for (p = d; p < i; p++) if (e._ptr[p] = e._values.length, l) for (f = 0; f < u; f++) e._values.push(o), e._index.push(f);
			e._ptr[i] = e._values.length;
		} else i < d && (e._ptr.splice(i + 1, d - i), e._values.splice(e._ptr[i], e._values.length), e._index.splice(e._ptr[i], e._index.length));
		if (d = i, r > u) {
			if (l) {
				var h = 0;
				for (p = 0; p < d; p++) {
					e._ptr[p] = e._ptr[p] + h, m = e._ptr[p + 1] + h;
					var g = 0;
					for (f = u; f < r; f++, g++) e._values.splice(m + g, 0, o), e._index.splice(m + g, 0, f), h++;
				}
				e._ptr[d] = e._values.length;
			}
		} else if (r < u) {
			var _ = 0;
			for (p = 0; p < d; p++) {
				e._ptr[p] = e._ptr[p] - _;
				var v = e._ptr[p], y = e._ptr[p + 1] - _;
				for (m = v; m < y; m++) f = e._index[m], f > r - 1 && (e._values.splice(m, 1), e._index.splice(m, 1), _++);
			}
			e._ptr[p] = e._values.length;
		}
		return e._size[0] = r, e._size[1] = i, e;
	}
	i.prototype.reshape = function(e, t) {
		if (!isArray(e)) throw TypeError("Array expected");
		if (e.length !== 2) throw Error("Sparse matrices can only be reshaped in two dimensions");
		e.forEach(function(t) {
			if (!isNumber(t) || !isInteger$1(t) || t <= -2 || t === 0) throw TypeError("Invalid size, must contain positive integers or -1 (size: " + format(e) + ")");
		});
		var n = this._size[0] * this._size[1];
		if (e = processSizesWildcard(e, n), n !== e[0] * e[1]) throw Error("Reshaping sparse matrix will result in the wrong number of elements");
		var r = t ? this.clone() : this;
		if (this._size[0] === e[0] && this._size[1] === e[1]) return r;
		for (var i = [], a = 0; a < r._ptr.length; a++) for (var o = 0; o < r._ptr[a + 1] - r._ptr[a]; o++) i.push(a);
		for (var s = r._values.slice(), c = r._index.slice(), u = 0; u < r._index.length; u++) {
			var f = c[u], p = i[u], m = f * r._size[1] + p;
			i[u] = m % e[1], c[u] = Math.floor(m / e[1]);
		}
		r._values.length = 0, r._index.length = 0, r._ptr.length = e[1] + 1, r._size = e.slice();
		for (var h = 0; h < r._ptr.length; h++) r._ptr[h] = 0;
		for (var g = 0; g < s.length; g++) {
			var _ = c[g], v = i[g], y = s[g];
			d(l(_, r._ptr[v], r._ptr[v + 1], r._index), _, v, y, r._values, r._index, r._ptr);
		}
		return r;
	}, i.prototype.clone = function() {
		return new i({
			values: this._values ? clone$2(this._values) : void 0,
			index: clone$2(this._index),
			ptr: clone$2(this._ptr),
			size: clone$2(this._size),
			datatype: this._datatype
		});
	}, i.prototype.size = function() {
		return this._size.slice(0);
	}, i.prototype.map = function(e, t) {
		if (!this._values) throw Error("Cannot invoke map on a Pattern only matrix");
		var n = this, r = this._size[0], i = this._size[1], a = optimizeCallback(e, n, "map");
		return p(this, 0, r - 1, 0, i - 1, function(e, t, r) {
			return a.fn(e, [t, r], n);
		}, t);
	};
	function p(e, r, a, o, s, c, l) {
		var u = [], d = [], f = [], p = n, m = 0;
		isString(e._datatype) && (p = t.find(n, [e._datatype, e._datatype]) || n, m = t.convert(0, e._datatype));
		for (var h = function(e, t, n) {
			var r = c(e, t, n);
			p(r, m) || (u.push(r), d.push(t));
		}, g = o; g <= s; g++) {
			f.push(u.length);
			var _ = e._ptr[g], v = e._ptr[g + 1];
			if (l) for (var y = _; y < v; y++) {
				var b = e._index[y];
				b >= r && b <= a && h(e._values[y], b - r, g - o);
			}
			else {
				for (var x = {}, w = _; w < v; w++) {
					var T = e._index[w];
					x[T] = e._values[w];
				}
				for (var E = r; E <= a; E++) h(E in x ? x[E] : 0, E - r, g - o);
			}
		}
		return f.push(u.length), new i({
			values: u,
			index: d,
			ptr: f,
			size: [a - r + 1, s - o + 1]
		});
	}
	i.prototype.forEach = function(e, t) {
		if (!this._values) throw Error("Cannot invoke forEach on a Pattern only matrix");
		for (var n = this, r = this._size[0], i = this._size[1], a = optimizeCallback(e, n, "forEach"), o = 0; o < i; o++) {
			var s = this._ptr[o], c = this._ptr[o + 1];
			if (t) for (var l = s; l < c; l++) {
				var u = this._index[l];
				a.fn(this._values[l], [u, o], n);
			}
			else {
				for (var d = {}, f = s; f < c; f++) {
					var p = this._index[f];
					d[p] = this._values[f];
				}
				for (var m = 0; m < r; m++) {
					var h = m in d ? d[m] : 0;
					a.fn(h, [m, o], n);
				}
			}
		}
	}, i.prototype[Symbol.iterator] = function* () {
		if (!this._values) throw Error("Cannot iterate a Pattern only matrix");
		for (var e = this._size[1], t = 0; t < e; t++) for (var n = this._ptr[t], r = this._ptr[t + 1], i = n; i < r; i++) {
			var a = this._index[i];
			yield {
				value: this._values[i],
				index: [a, t]
			};
		}
	}, i.prototype.toArray = function() {
		return m(this._values, this._index, this._ptr, this._size, !0);
	}, i.prototype.valueOf = function() {
		return m(this._values, this._index, this._ptr, this._size, !1);
	};
	function m(e, t, n, r, i) {
		var a = r[0], o = r[1], s = [], c, l;
		for (c = 0; c < a; c++) for (s[c] = [], l = 0; l < o; l++) s[c][l] = 0;
		for (l = 0; l < o; l++) for (var u = n[l], d = n[l + 1], f = u; f < d; f++) c = t[f], s[c][l] = e ? i ? clone$2(e[f]) : e[f] : 1;
		return s;
	}
	return i.prototype.format = function(e) {
		for (var t = this._size[0], n = this._size[1], r = this.density(), i = "Sparse Matrix [" + format(t, e) + " x " + format(n, e) + "] density: " + format(r, e) + "\n", a = 0; a < n; a++) for (var o = this._ptr[a], s = this._ptr[a + 1], c = o; c < s; c++) {
			var l = this._index[c];
			i += "\n    (" + format(l, e) + ", " + format(a, e) + ") ==> " + (this._values ? format(this._values[c], e) : "X");
		}
		return i;
	}, i.prototype.toString = function() {
		return format(this.toArray());
	}, i.prototype.toJSON = function() {
		return {
			mathjs: "SparseMatrix",
			values: this._values,
			index: this._index,
			ptr: this._ptr,
			size: this._size,
			datatype: this._datatype
		};
	}, i.prototype.diagonal = function(e) {
		if (e) {
			if (isBigNumber(e) && (e = e.toNumber()), !isNumber(e) || !isInteger$1(e)) throw TypeError("The parameter k must be an integer number");
		} else e = 0;
		var t = e > 0 ? e : 0, n = e < 0 ? -e : 0, r = this._size[0], a = this._size[1], o = Math.min(r - n, a - t), s = [], c = [], l = [];
		l[0] = 0;
		for (var u = t; u < a && s.length < o; u++) for (var d = this._ptr[u], f = this._ptr[u + 1], p = d; p < f; p++) {
			var m = this._index[p];
			if (m === u - t + n) {
				s.push(this._values[p]), c[s.length - 1] = m - n;
				break;
			}
		}
		return l.push(s.length), new i({
			values: s,
			index: c,
			ptr: l,
			size: [o, 1]
		});
	}, i.fromJSON = function(e) {
		return new i(e);
	}, i.diagonal = function(e, r, a, o, s) {
		if (!isArray(e)) throw TypeError("Array expected, size parameter");
		if (e.length !== 2) throw Error("Only two dimensions matrix are supported");
		if (e = e.map(function(e) {
			if (isBigNumber(e) && (e = e.toNumber()), !isNumber(e) || !isInteger$1(e) || e < 1) throw Error("Size values must be positive integers");
			return e;
		}), a) {
			if (isBigNumber(a) && (a = a.toNumber()), !isNumber(a) || !isInteger$1(a)) throw TypeError("The parameter k must be an integer number");
		} else a = 0;
		var c = n, l = 0;
		isString(s) && (c = t.find(n, [s, s]) || n, l = t.convert(0, s));
		var u = a > 0 ? a : 0, d = a < 0 ? -a : 0, f = e[0], p = e[1], m = Math.min(f - d, p - u), h;
		if (isArray(r)) {
			if (r.length !== m) throw Error("Invalid value array length");
			h = function(e) {
				return r[e];
			};
		} else if (isMatrix(r)) {
			var g = r.size();
			if (g.length !== 1 || g[0] !== m) throw Error("Invalid matrix length");
			h = function(e) {
				return r.get([e]);
			};
		} else h = function() {
			return r;
		};
		for (var _ = [], v = [], y = [], b = 0; b < p; b++) {
			y.push(_.length);
			var x = b - u;
			if (x >= 0 && x < m) {
				var w = h(x);
				c(w, l) || (v.push(x + d), _.push(w));
			}
		}
		return y.push(_.length), new i({
			values: _,
			index: v,
			ptr: y,
			size: [f, p]
		});
	}, i.prototype.swapRows = function(e, t) {
		if (!isNumber(e) || !isInteger$1(e) || !isNumber(t) || !isInteger$1(t)) throw Error("Row index must be positive integers");
		if (this._size.length !== 2) throw Error("Only two dimensional matrix is supported");
		return validateIndex(e, this._size[0]), validateIndex(t, this._size[0]), i._swapRows(e, t, this._size[1], this._values, this._index, this._ptr), this;
	}, i._forEachRow = function(e, t, n, r, i) {
		for (var a = r[e], o = r[e + 1], s = a; s < o; s++) i(n[s], t[s]);
	}, i._swapRows = function(e, t, n, r, i, a) {
		for (var o = 0; o < n; o++) {
			var s = a[o], c = a[o + 1], u = l(e, s, c, i), d = l(t, s, c, i);
			if (u < c && d < c && i[u] === e && i[d] === t) {
				if (r) {
					var f = r[u];
					r[u] = r[d], r[d] = f;
				}
				continue;
			}
			if (u < c && i[u] === e && (d >= c || i[d] !== t)) {
				var p = r ? r[u] : void 0;
				i.splice(d, 0, t), r && r.splice(d, 0, p), i.splice(d <= u ? u + 1 : u, 1), r && r.splice(d <= u ? u + 1 : u, 1);
				continue;
			}
			if (d < c && i[d] === t && (u >= c || i[u] !== e)) {
				var m = r ? r[d] : void 0;
				i.splice(u, 0, e), r && r.splice(u, 0, m), i.splice(u <= d ? d + 1 : d, 1), r && r.splice(u <= d ? d + 1 : d, 1);
			}
		}
	}, i;
}, { isClass: !0 }), name$65 = "number", dependencies$65 = ["typed"];
function getNonDecimalNumberParts(e) {
	var t = e.match(/(0[box])([0-9a-fA-F]*)\.([0-9a-fA-F]*)/);
	return t ? {
		input: e,
		radix: {
			"0b": 2,
			"0o": 8,
			"0x": 16
		}[t[1]],
		integerPart: t[2],
		fractionalPart: t[3]
	} : null;
}
function makeNumberFromNonDecimalParts(e) {
	for (var t = parseInt(e.integerPart, e.radix), n = 0, r = 0; r < e.fractionalPart.length; r++) {
		var i = parseInt(e.fractionalPart[r], e.radix);
		n += i / e.radix ** +(r + 1);
	}
	var a = t + n;
	if (isNaN(a)) throw SyntaxError("String \"" + e.input + "\" is not a valid number");
	return a;
}
var createNumber = /* @__PURE__ */ factory(name$65, dependencies$65, (e) => {
	var { typed: t } = e, n = t("number", {
		"": function() {
			return 0;
		},
		number: function(e) {
			return e;
		},
		string: function(e) {
			if (e === "NaN") return NaN;
			var t = getNonDecimalNumberParts(e);
			if (t) return makeNumberFromNonDecimalParts(t);
			var n = 0, r = e.match(/(0[box][0-9a-fA-F]*)i([0-9]*)/);
			r && (n = Number(r[2]), e = r[1]);
			var i = Number(e);
			if (isNaN(i)) throw SyntaxError("String \"" + e + "\" is not a valid number");
			if (r) {
				if (i > 2 ** n - 1) throw SyntaxError(`String "${e}" is out of range`);
				i >= 2 ** (n - 1) && (i -= 2 ** n);
			}
			return i;
		},
		BigNumber: function(e) {
			return e.toNumber();
		},
		bigint: function(e) {
			return Number(e);
		},
		Fraction: function(e) {
			return e.valueOf();
		},
		Unit: t.referToSelf((e) => (t) => {
			var n = t.clone();
			return n.value = e(t.value), n;
		}),
		null: function(e) {
			return 0;
		},
		"Unit, string | Unit": function(e, t) {
			return e.toNumber(t);
		},
		"Array | Matrix": t.referToSelf((e) => (t) => deepMap(t, e))
	});
	return n.fromJSON = function(e) {
		return parseFloat(e.value);
	}, n;
}), name$64 = "bignumber", dependencies$64 = ["typed", "BigNumber"], createBignumber = /* @__PURE__ */ factory(name$64, dependencies$64, (e) => {
	var { typed: t, BigNumber: n } = e;
	return t("bignumber", {
		"": function() {
			return new n(0);
		},
		number: function(e) {
			return new n(e + "");
		},
		string: function(e) {
			var t = e.match(/(0[box][0-9a-fA-F]*)i([0-9]*)/);
			if (t) {
				var r = t[2], i = n(t[1]), a = new n(2).pow(Number(r));
				if (i.gt(a.sub(1))) throw SyntaxError(`String "${e}" is out of range`);
				var o = new n(2).pow(Number(r) - 1);
				return i.gte(o) ? i.sub(a) : i;
			}
			return new n(e);
		},
		BigNumber: function(e) {
			return e;
		},
		bigint: function(e) {
			return new n(e.toString());
		},
		Unit: t.referToSelf((e) => (t) => {
			var n = t.clone();
			return n.value = e(t.value), n;
		}),
		Fraction: function(e) {
			return new n(String(e.n)).div(String(e.d)).times(String(e.s));
		},
		null: function(e) {
			return new n(0);
		},
		"Array | Matrix": t.referToSelf((e) => (t) => deepMap(t, e))
	});
}), name$63 = "complex", dependencies$63 = ["typed", "Complex"], createComplex = /* @__PURE__ */ factory(name$63, dependencies$63, (e) => {
	var { typed: t, Complex: n } = e;
	return t("complex", {
		"": function() {
			return n.ZERO;
		},
		number: function(e) {
			return new n(e, 0);
		},
		"number, number": function(e, t) {
			return new n(e, t);
		},
		"BigNumber, BigNumber": function(e, t) {
			return new n(e.toNumber(), t.toNumber());
		},
		Fraction: function(e) {
			return new n(e.valueOf(), 0);
		},
		Complex: function(e) {
			return e.clone();
		},
		string: function(e) {
			return n(e);
		},
		null: function(e) {
			return n(0);
		},
		Object: function(e) {
			if ("re" in e && "im" in e) return new n(e.re, e.im);
			if ("r" in e && "phi" in e || "abs" in e && "arg" in e) return new n(e);
			throw Error("Expected object with properties (re and im) or (r and phi) or (abs and arg)");
		},
		"Array | Matrix": t.referToSelf((e) => (t) => deepMap(t, e))
	});
}), name$62 = "fraction", dependencies$62 = ["typed", "Fraction"], createFraction = /* @__PURE__ */ factory(name$62, dependencies$62, (e) => {
	var { typed: t, Fraction: n } = e;
	return t("fraction", {
		number: function(e) {
			if (!Number.isFinite(e) || isNaN(e)) throw Error(e + " cannot be represented as a fraction");
			return new n(e);
		},
		string: function(e) {
			return new n(e);
		},
		"number, number": function(e, t) {
			return new n(e, t);
		},
		"bigint, bigint": function(e, t) {
			return new n(e, t);
		},
		null: function(e) {
			return new n(0);
		},
		BigNumber: function(e) {
			return new n(e.toString());
		},
		bigint: function(e) {
			return new n(e.toString());
		},
		Fraction: function(e) {
			return e;
		},
		Unit: t.referToSelf((e) => (t) => {
			var n = t.clone();
			return n.value = e(t.value), n;
		}),
		Object: function(e) {
			return new n(e);
		},
		"Array | Matrix": t.referToSelf((e) => (t) => deepMap(t, e))
	});
}), name$61 = "matrix", dependencies$61 = [
	"typed",
	"Matrix",
	"DenseMatrix",
	"SparseMatrix"
], createMatrix = /* @__PURE__ */ factory(name$61, dependencies$61, (e) => {
	var { typed: t, Matrix: n, DenseMatrix: r, SparseMatrix: i } = e;
	return t(name$61, {
		"": function() {
			return a([]);
		},
		string: function(e) {
			return a([], e);
		},
		"string, string": function(e, t) {
			return a([], e, t);
		},
		Array: function(e) {
			return a(e);
		},
		Matrix: function(e) {
			return a(e, e.storage());
		},
		"Array | Matrix, string": a,
		"Array | Matrix, string, string": a
	});
	function a(e, t, n) {
		if (t === "dense" || t === "default" || t === void 0) return new r(e, n);
		if (t === "sparse") return new i(e, n);
		throw TypeError("Unknown matrix type " + JSON.stringify(t) + ".");
	}
}), name$60 = "matrixFromColumns", dependencies$60 = [
	"typed",
	"matrix",
	"flatten",
	"size"
], createMatrixFromColumns = /* @__PURE__ */ factory(name$60, dependencies$60, (e) => {
	var { typed: t, matrix: n, flatten: r, size: i } = e;
	return t(name$60, {
		"...Array": function(e) {
			return a(e);
		},
		"...Matrix": function(e) {
			return n(a(e.map((e) => e.toArray())));
		}
	});
	function a(e) {
		if (e.length === 0) throw TypeError("At least one column is needed to construct a matrix.");
		for (var t = o(e[0]), n = [], i = 0; i < t; i++) n[i] = [];
		for (var a of e) {
			var s = o(a);
			if (s !== t) throw TypeError("The vectors had different length: " + (t | 0) + " ≠ " + (s | 0));
			for (var c = r(a), l = 0; l < t; l++) n[l].push(c[l]);
		}
		return n;
	}
	function o(e) {
		var t = i(e);
		if (t.length === 1) return t[0];
		if (t.length === 2) {
			if (t[0] === 1) return t[1];
			if (t[1] === 1) return t[0];
			throw TypeError("At least one of the arguments is not a vector.");
		} else throw TypeError("Only one- or two-dimensional vectors are supported.");
	}
}), name$59 = "unaryMinus", dependencies$59 = ["typed"], createUnaryMinus = /* @__PURE__ */ factory(name$59, dependencies$59, (e) => {
	var { typed: t } = e;
	return t(name$59, {
		number: unaryMinusNumber,
		"Complex | BigNumber | Fraction": (e) => e.neg(),
		bigint: (e) => -e,
		Unit: t.referToSelf((e) => (n) => {
			var r = n.clone();
			return r.value = t.find(e, r.valueType())(n.value), r;
		}),
		"Array | Matrix": t.referToSelf((e) => (t) => deepMap(t, e, !0))
	});
}), name$58 = "abs", dependencies$58 = ["typed"], createAbs = /* @__PURE__ */ factory(name$58, dependencies$58, (e) => {
	var { typed: t } = e;
	return t(name$58, {
		number: absNumber,
		"Complex | BigNumber | Fraction | Unit": (e) => e.abs(),
		bigint: (e) => e < 0n ? -e : e,
		"Array | Matrix": t.referToSelf((e) => (t) => deepMap(t, e, !0))
	});
}), name$57 = "addScalar", dependencies$57 = ["typed"], createAddScalar = /* @__PURE__ */ factory(name$57, dependencies$57, (e) => {
	var { typed: t } = e;
	return t(name$57, {
		"number, number": addNumber,
		"Complex, Complex": function(e, t) {
			return e.add(t);
		},
		"BigNumber, BigNumber": function(e, t) {
			return e.plus(t);
		},
		"bigint, bigint": function(e, t) {
			return e + t;
		},
		"Fraction, Fraction": function(e, t) {
			return e.add(t);
		},
		"Unit, Unit": t.referToSelf((e) => (n, r) => {
			if (n.value === null || n.value === void 0) throw Error("Parameter x contains a unit with undefined value");
			if (r.value === null || r.value === void 0) throw Error("Parameter y contains a unit with undefined value");
			if (!n.equalBase(r)) throw Error("Units do not match");
			var i = n.clone();
			return i.value = t.find(e, [i.valueType(), r.valueType()])(i.value, r.value), i.fixPrefix = !1, i;
		})
	});
}), name$56 = "subtractScalar", dependencies$56 = ["typed"], createSubtractScalar = /* @__PURE__ */ factory(name$56, dependencies$56, (e) => {
	var { typed: t } = e;
	return t(name$56, {
		"number, number": subtractNumber,
		"Complex, Complex": function(e, t) {
			return e.sub(t);
		},
		"BigNumber, BigNumber": function(e, t) {
			return e.minus(t);
		},
		"bigint, bigint": function(e, t) {
			return e - t;
		},
		"Fraction, Fraction": function(e, t) {
			return e.sub(t);
		},
		"Unit, Unit": t.referToSelf((e) => (n, r) => {
			if (n.value === null || n.value === void 0) throw Error("Parameter x contains a unit with undefined value");
			if (r.value === null || r.value === void 0) throw Error("Parameter y contains a unit with undefined value");
			if (!n.equalBase(r)) throw Error("Units do not match");
			var i = n.clone();
			return i.value = t.find(e, [i.valueType(), r.valueType()])(i.value, r.value), i.fixPrefix = !1, i;
		})
	});
}), name$55 = "matAlgo11xS0s", dependencies$55 = ["typed", "equalScalar"], createMatAlgo11xS0s = /* @__PURE__ */ factory(name$55, dependencies$55, (e) => {
	var { typed: t, equalScalar: n } = e;
	return function(e, r, i, a) {
		var o = e._values, s = e._index, c = e._ptr, l = e._size, u = e._datatype;
		if (!o) throw Error("Cannot perform operation on Pattern Sparse Matrix and Scalar value");
		var d = l[0], f = l[1], p, m = n, h = 0, g = i;
		typeof u == "string" && (p = u, m = t.find(n, [p, p]), h = t.convert(0, p), r = t.convert(r, p), g = t.find(i, [p, p]));
		for (var _ = [], v = [], y = [], b = 0; b < f; b++) {
			y[b] = v.length;
			for (var x = c[b], w = c[b + 1], T = x; T < w; T++) {
				var E = s[T], k = a ? g(r, o[T]) : g(o[T], r);
				m(k, h) || (v.push(E), _.push(k));
			}
		}
		return y[f] = v.length, e.createSparseMatrix({
			values: _,
			index: v,
			ptr: y,
			size: [d, f],
			datatype: p
		});
	};
}), name$54 = "matAlgo12xSfs", dependencies$54 = ["typed", "DenseMatrix"], createMatAlgo12xSfs = /* @__PURE__ */ factory(name$54, dependencies$54, (e) => {
	var { typed: t, DenseMatrix: n } = e;
	return function(e, r, i, a) {
		var o = e._values, s = e._index, c = e._ptr, l = e._size, u = e._datatype;
		if (!o) throw Error("Cannot perform operation on Pattern Sparse Matrix and Scalar value");
		var d = l[0], f = l[1], p, m = i;
		typeof u == "string" && (p = u, r = t.convert(r, p), m = t.find(i, [p, p]));
		for (var h = [], g = [], _ = [], v = 0; v < f; v++) {
			for (var y = v + 1, b = c[v], x = c[v + 1], w = b; w < x; w++) {
				var T = s[w];
				g[T] = o[w], _[T] = y;
			}
			for (var E = 0; E < d; E++) v === 0 && (h[E] = []), _[E] === y ? h[E][v] = a ? m(r, g[E]) : m(g[E], r) : h[E][v] = a ? m(r, 0) : m(0, r);
		}
		return new n({
			data: h,
			size: [d, f],
			datatype: p
		});
	};
}), name$53 = "matAlgo14xDs", dependencies$53 = ["typed"], createMatAlgo14xDs = /* @__PURE__ */ factory(name$53, dependencies$53, (e) => {
	var { typed: t } = e;
	return function(e, r, i, a) {
		var o = e._data, s = e._size, c = e._datatype, l, u = i;
		typeof c == "string" && (l = c, r = t.convert(r, l), u = t.find(i, [l, l]));
		var d = s.length > 0 ? n(u, 0, s, s[0], o, r, a) : [];
		return e.createDenseMatrix({
			data: d,
			size: clone$2(s),
			datatype: l
		});
	};
	function n(e, t, r, i, a, o, s) {
		var c = [];
		if (t === r.length - 1) for (var l = 0; l < i; l++) c[l] = s ? e(o, a[l]) : e(a[l], o);
		else for (var u = 0; u < i; u++) c[u] = n(e, t + 1, r, r[t + 1], a[u], o, s);
		return c;
	}
}), name$52 = "matAlgo03xDSf", dependencies$52 = ["typed"], createMatAlgo03xDSf = /* @__PURE__ */ factory(name$52, dependencies$52, (e) => {
	var { typed: t } = e;
	return function(e, n, r, i) {
		var a = e._data, o = e._size, s = e._datatype || e.getDataType(), c = n._values, l = n._index, u = n._ptr, d = n._size, f = n._datatype || n._data === void 0 ? n._datatype : n.getDataType();
		if (o.length !== d.length) throw new DimensionError(o.length, d.length);
		if (o[0] !== d[0] || o[1] !== d[1]) throw RangeError("Dimension mismatch. Matrix A (" + o + ") must match Matrix B (" + d + ")");
		if (!c) throw Error("Cannot perform operation on Dense Matrix and Pattern Sparse Matrix");
		var p = o[0], m = o[1], h, g = 0, _ = r;
		typeof s == "string" && s === f && s !== "mixed" && (h = s, g = t.convert(0, h), _ = t.find(r, [h, h]));
		for (var v = [], y = 0; y < p; y++) v[y] = [];
		for (var b = [], x = [], w = 0; w < m; w++) {
			for (var T = w + 1, E = u[w], k = u[w + 1], A = E; A < k; A++) {
				var j = l[A];
				b[j] = i ? _(c[A], a[j][w]) : _(a[j][w], c[A]), x[j] = T;
			}
			for (var M = 0; M < p; M++) x[M] === T ? v[M][w] = b[M] : v[M][w] = i ? _(g, a[M][w]) : _(a[M][w], g);
		}
		return e.createDenseMatrix({
			data: v,
			size: [p, m],
			datatype: s === e._datatype && f === n._datatype ? h : void 0
		});
	};
}), name$51 = "matAlgo05xSfSf", dependencies$51 = ["typed", "equalScalar"], createMatAlgo05xSfSf = /* @__PURE__ */ factory(name$51, dependencies$51, (e) => {
	var { typed: t, equalScalar: n } = e;
	return function(e, r, i) {
		var a = e._values, o = e._index, s = e._ptr, c = e._size, l = e._datatype || e._data === void 0 ? e._datatype : e.getDataType(), u = r._values, d = r._index, f = r._ptr, p = r._size, m = r._datatype || r._data === void 0 ? r._datatype : r.getDataType();
		if (c.length !== p.length) throw new DimensionError(c.length, p.length);
		if (c[0] !== p[0] || c[1] !== p[1]) throw RangeError("Dimension mismatch. Matrix A (" + c + ") must match Matrix B (" + p + ")");
		var h = c[0], g = c[1], _, v = n, y = 0, b = i;
		typeof l == "string" && l === m && l !== "mixed" && (_ = l, v = t.find(n, [_, _]), y = t.convert(0, _), b = t.find(i, [_, _]));
		var x = a && u ? [] : void 0, w = [], T = [], E = x ? [] : void 0, k = x ? [] : void 0, A = [], j = [], M, L, R, z;
		for (L = 0; L < g; L++) {
			T[L] = w.length;
			var G = L + 1;
			for (R = s[L], z = s[L + 1]; R < z; R++) M = o[R], w.push(M), A[M] = G, E && (E[M] = a[R]);
			for (R = f[L], z = f[L + 1]; R < z; R++) M = d[R], A[M] !== G && w.push(M), j[M] = G, k && (k[M] = u[R]);
			if (x) for (R = T[L]; R < w.length;) {
				M = w[R];
				var q = A[M], J = j[M];
				if (q === G || J === G) {
					var Z = q === G ? E[M] : y, Q = J === G ? k[M] : y, ee = b(Z, Q);
					v(ee, y) ? w.splice(R, 1) : (x.push(ee), R++);
				}
			}
		}
		return T[g] = w.length, e.createSparseMatrix({
			values: x,
			index: w,
			ptr: T,
			size: [h, g],
			datatype: l === e._datatype && m === r._datatype ? _ : void 0
		});
	};
}), name$50 = "matAlgo13xDD", dependencies$50 = ["typed"], createMatAlgo13xDD = /* @__PURE__ */ factory(name$50, dependencies$50, (e) => {
	var { typed: t } = e;
	return function(e, r, i) {
		var a = e._data, o = e._size, s = e._datatype, c = r._data, l = r._size, u = r._datatype, d = [];
		if (o.length !== l.length) throw new DimensionError(o.length, l.length);
		for (var f = 0; f < o.length; f++) {
			if (o[f] !== l[f]) throw RangeError("Dimension mismatch. Matrix A (" + o + ") must match Matrix B (" + l + ")");
			d[f] = o[f];
		}
		var p, m = i;
		typeof s == "string" && s === u && (p = s, m = t.find(i, [p, p]));
		var h = d.length > 0 ? n(m, 0, d, d[0], a, c) : [];
		return e.createDenseMatrix({
			data: h,
			size: d,
			datatype: p
		});
	};
	function n(e, t, r, i, a, o) {
		var s = [];
		if (t === r.length - 1) for (var c = 0; c < i; c++) s[c] = e(a[c], o[c]);
		else for (var l = 0; l < i; l++) s[l] = n(e, t + 1, r, r[t + 1], a[l], o[l]);
		return s;
	}
});
//#endregion
//#region node_modules/mathjs/lib/esm/type/matrix/utils/broadcast.js
function broadcast(e, t) {
	if (deepStrictEqual(e.size(), t.size())) return [e, t];
	var n = broadcastSizes(e.size(), t.size());
	return [e, t].map((e) => _broadcastTo(e, n));
}
function _broadcastTo(e, t) {
	return deepStrictEqual(e.size(), t) ? e : e.create(broadcastTo(e.valueOf(), t), e.datatype());
}
//#endregion
//#region node_modules/mathjs/lib/esm/type/matrix/utils/matrixAlgorithmSuite.js
var name$49 = "matrixAlgorithmSuite", dependencies$49 = ["typed", "matrix"], createMatrixAlgorithmSuite = /* @__PURE__ */ factory(name$49, dependencies$49, (e) => {
	var { typed: t, matrix: n } = e, r = createMatAlgo13xDD({ typed: t }), i = createMatAlgo14xDs({ typed: t });
	return function(e) {
		var a = e.elop, o = e.SD || e.DS, s;
		a ? (s = {
			"DenseMatrix, DenseMatrix": (e, t) => r(...broadcast(e, t), a),
			"Array, Array": (e, t) => r(...broadcast(n(e), n(t)), a).valueOf(),
			"Array, DenseMatrix": (e, t) => r(...broadcast(n(e), t), a),
			"DenseMatrix, Array": (e, t) => r(...broadcast(e, n(t)), a)
		}, e.SS && (s["SparseMatrix, SparseMatrix"] = (t, n) => e.SS(...broadcast(t, n), a, !1)), e.DS && (s["DenseMatrix, SparseMatrix"] = (t, n) => e.DS(...broadcast(t, n), a, !1), s["Array, SparseMatrix"] = (t, r) => e.DS(...broadcast(n(t), r), a, !1)), o && (s["SparseMatrix, DenseMatrix"] = (e, t) => o(...broadcast(t, e), a, !0), s["SparseMatrix, Array"] = (e, t) => o(...broadcast(n(t), e), a, !0))) : (s = {
			"DenseMatrix, DenseMatrix": t.referToSelf((e) => (t, n) => r(...broadcast(t, n), e)),
			"Array, Array": t.referToSelf((e) => (t, i) => r(...broadcast(n(t), n(i)), e).valueOf()),
			"Array, DenseMatrix": t.referToSelf((e) => (t, i) => r(...broadcast(n(t), i), e)),
			"DenseMatrix, Array": t.referToSelf((e) => (t, i) => r(...broadcast(t, n(i)), e))
		}, e.SS && (s["SparseMatrix, SparseMatrix"] = t.referToSelf((t) => (n, r) => e.SS(...broadcast(n, r), t, !1))), e.DS && (s["DenseMatrix, SparseMatrix"] = t.referToSelf((t) => (n, r) => e.DS(...broadcast(n, r), t, !1)), s["Array, SparseMatrix"] = t.referToSelf((t) => (r, i) => e.DS(...broadcast(n(r), i), t, !1))), o && (s["SparseMatrix, DenseMatrix"] = t.referToSelf((e) => (t, n) => o(...broadcast(n, t), e, !0)), s["SparseMatrix, Array"] = t.referToSelf((e) => (t, r) => o(...broadcast(n(r), t), e, !0))));
		var c = e.scalar || "any";
		(e.Ds || e.Ss) && (a ? (s["DenseMatrix," + c] = (e, t) => i(e, t, a, !1), s[c + ", DenseMatrix"] = (e, t) => i(t, e, a, !0), s["Array," + c] = (e, t) => i(n(e), t, a, !1).valueOf(), s[c + ", Array"] = (e, t) => i(n(t), e, a, !0).valueOf()) : (s["DenseMatrix," + c] = t.referToSelf((e) => (t, n) => i(t, n, e, !1)), s[c + ", DenseMatrix"] = t.referToSelf((e) => (t, n) => i(n, t, e, !0)), s["Array," + c] = t.referToSelf((e) => (t, r) => i(n(t), r, e, !1).valueOf()), s[c + ", Array"] = t.referToSelf((e) => (t, r) => i(n(r), t, e, !0).valueOf())));
		var l = e.sS === void 0 ? e.Ss : e.sS;
		return a ? (e.Ss && (s["SparseMatrix," + c] = (t, n) => e.Ss(t, n, a, !1)), l && (s[c + ", SparseMatrix"] = (e, t) => l(t, e, a, !0))) : (e.Ss && (s["SparseMatrix," + c] = t.referToSelf((t) => (n, r) => e.Ss(n, r, t, !1))), l && (s[c + ", SparseMatrix"] = t.referToSelf((e) => (t, n) => l(n, t, e, !0)))), a && a.signatures && extend(s, a.signatures), s;
	};
}), name$48 = "matAlgo01xDSid", dependencies$48 = ["typed"], createMatAlgo01xDSid = /* @__PURE__ */ factory(name$48, dependencies$48, (e) => {
	var { typed: t } = e;
	return function(e, n, r, i) {
		var a = e._data, o = e._size, s = e._datatype || e.getDataType(), c = n._values, l = n._index, u = n._ptr, d = n._size, f = n._datatype || n._data === void 0 ? n._datatype : n.getDataType();
		if (o.length !== d.length) throw new DimensionError(o.length, d.length);
		if (o[0] !== d[0] || o[1] !== d[1]) throw RangeError("Dimension mismatch. Matrix A (" + o + ") must match Matrix B (" + d + ")");
		if (!c) throw Error("Cannot perform operation on Dense Matrix and Pattern Sparse Matrix");
		var p = o[0], m = o[1], h = typeof s == "string" && s !== "mixed" && s === f ? s : void 0, g = h ? t.find(r, [h, h]) : r, _, v, y = [];
		for (_ = 0; _ < p; _++) y[_] = [];
		var b = [], x = [];
		for (v = 0; v < m; v++) {
			for (var w = v + 1, T = u[v], E = u[v + 1], k = T; k < E; k++) _ = l[k], b[_] = i ? g(c[k], a[_][v]) : g(a[_][v], c[k]), x[_] = w;
			for (_ = 0; _ < p; _++) x[_] === w ? y[_][v] = b[_] : y[_][v] = a[_][v];
		}
		return e.createDenseMatrix({
			data: y,
			size: [p, m],
			datatype: s === e._datatype && f === n._datatype ? h : void 0
		});
	};
}), name$47 = "matAlgo04xSidSid", dependencies$47 = ["typed", "equalScalar"], createMatAlgo04xSidSid = /* @__PURE__ */ factory(name$47, dependencies$47, (e) => {
	var { typed: t, equalScalar: n } = e;
	return function(e, r, i) {
		var a = e._values, o = e._index, s = e._ptr, c = e._size, l = e._datatype || e._data === void 0 ? e._datatype : e.getDataType(), u = r._values, d = r._index, f = r._ptr, p = r._size, m = r._datatype || r._data === void 0 ? r._datatype : r.getDataType();
		if (c.length !== p.length) throw new DimensionError(c.length, p.length);
		if (c[0] !== p[0] || c[1] !== p[1]) throw RangeError("Dimension mismatch. Matrix A (" + c + ") must match Matrix B (" + p + ")");
		var h = c[0], g = c[1], _, v = n, y = 0, b = i;
		typeof l == "string" && l === m && l !== "mixed" && (_ = l, v = t.find(n, [_, _]), y = t.convert(0, _), b = t.find(i, [_, _]));
		var x = a && u ? [] : void 0, w = [], T = [], E = a && u ? [] : void 0, k = a && u ? [] : void 0, A = [], j = [], M, L, R, z, G;
		for (L = 0; L < g; L++) {
			T[L] = w.length;
			var q = L + 1;
			for (z = s[L], G = s[L + 1], R = z; R < G; R++) M = o[R], w.push(M), A[M] = q, E && (E[M] = a[R]);
			for (z = f[L], G = f[L + 1], R = z; R < G; R++) if (M = d[R], A[M] === q) {
				if (E) {
					var J = b(E[M], u[R]);
					v(J, y) ? A[M] = null : E[M] = J;
				}
			} else w.push(M), j[M] = q, k && (k[M] = u[R]);
			if (E && k) for (R = T[L]; R < w.length;) M = w[R], A[M] === q ? (x[R] = E[M], R++) : j[M] === q ? (x[R] = k[M], R++) : w.splice(R, 1);
		}
		return T[g] = w.length, e.createSparseMatrix({
			values: x,
			index: w,
			ptr: T,
			size: [h, g],
			datatype: l === e._datatype && m === r._datatype ? _ : void 0
		});
	};
}), name$46 = "matAlgo10xSids", dependencies$46 = ["typed", "DenseMatrix"], createMatAlgo10xSids = /* @__PURE__ */ factory(name$46, dependencies$46, (e) => {
	var { typed: t, DenseMatrix: n } = e;
	return function(e, r, i, a) {
		var o = e._values, s = e._index, c = e._ptr, l = e._size, u = e._datatype;
		if (!o) throw Error("Cannot perform operation on Pattern Sparse Matrix and Scalar value");
		var d = l[0], f = l[1], p, m = i;
		typeof u == "string" && (p = u, r = t.convert(r, p), m = t.find(i, [p, p]));
		for (var h = [], g = [], _ = [], v = 0; v < f; v++) {
			for (var y = v + 1, b = c[v], x = c[v + 1], w = b; w < x; w++) {
				var T = s[w];
				g[T] = o[w], _[T] = y;
			}
			for (var E = 0; E < d; E++) v === 0 && (h[E] = []), _[E] === y ? h[E][v] = a ? m(r, g[E]) : m(g[E], r) : h[E][v] = r;
		}
		return new n({
			data: h,
			size: [d, f],
			datatype: p
		});
	};
}), name$45 = "multiplyScalar", dependencies$45 = ["typed"], createMultiplyScalar = /* @__PURE__ */ factory(name$45, dependencies$45, (e) => {
	var { typed: t } = e;
	return t("multiplyScalar", {
		"number, number": multiplyNumber,
		"Complex, Complex": function(e, t) {
			return e.mul(t);
		},
		"BigNumber, BigNumber": function(e, t) {
			return e.times(t);
		},
		"bigint, bigint": function(e, t) {
			return e * t;
		},
		"Fraction, Fraction": function(e, t) {
			return e.mul(t);
		},
		"number | Fraction | BigNumber | Complex, Unit": (e, t) => t.multiply(e),
		"Unit, number | Fraction | BigNumber | Complex | Unit": (e, t) => e.multiply(t)
	});
}), name$44 = "multiply", dependencies$44 = [
	"typed",
	"matrix",
	"addScalar",
	"multiplyScalar",
	"equalScalar",
	"dot"
], createMultiply = /* @__PURE__ */ factory(name$44, dependencies$44, (e) => {
	var { typed: t, matrix: n, addScalar: r, multiplyScalar: i, equalScalar: a, dot: o } = e, s = createMatAlgo11xS0s({
		typed: t,
		equalScalar: a
	}), c = createMatAlgo14xDs({ typed: t });
	function l(e, t) {
		switch (e.length) {
			case 1:
				switch (t.length) {
					case 1:
						if (e[0] !== t[0]) throw RangeError("Dimension mismatch in multiplication. Vectors must have the same length");
						break;
					case 2:
						if (e[0] !== t[0]) throw RangeError("Dimension mismatch in multiplication. Vector length (" + e[0] + ") must match Matrix rows (" + t[0] + ")");
						break;
					default: throw Error("Can only multiply a 1 or 2 dimensional matrix (Matrix B has " + t.length + " dimensions)");
				}
				break;
			case 2:
				switch (t.length) {
					case 1:
						if (e[1] !== t[0]) throw RangeError("Dimension mismatch in multiplication. Matrix columns (" + e[1] + ") must match Vector length (" + t[0] + ")");
						break;
					case 2:
						if (e[1] !== t[0]) throw RangeError("Dimension mismatch in multiplication. Matrix A columns (" + e[1] + ") must match Matrix B rows (" + t[0] + ")");
						break;
					default: throw Error("Can only multiply a 1 or 2 dimensional matrix (Matrix B has " + t.length + " dimensions)");
				}
				break;
			default: throw Error("Can only multiply a 1 or 2 dimensional matrix (Matrix A has " + e.length + " dimensions)");
		}
	}
	function u(e, t, n) {
		if (n === 0) throw Error("Cannot multiply two empty vectors");
		return o(e, t);
	}
	function d(e, t) {
		if (t.storage() !== "dense") throw Error("Support for SparseMatrix not implemented");
		return f(e, t);
	}
	function f(e, n) {
		var a = e._data, o = e._size, s = e._datatype || e.getDataType(), c = n._data, l = n._size, u = n._datatype || n.getDataType(), d = o[0], f = l[1], p, m = r, h = i;
		s && u && s === u && typeof s == "string" && s !== "mixed" && (p = s, m = t.find(r, [p, p]), h = t.find(i, [p, p]));
		for (var g = [], _ = 0; _ < f; _++) {
			for (var v = h(a[0], c[0][_]), y = 1; y < d; y++) v = m(v, h(a[y], c[y][_]));
			g[_] = v;
		}
		return e.createDenseMatrix({
			data: g,
			size: [f],
			datatype: s === e._datatype && u === n._datatype ? p : void 0
		});
	}
	var p = t("_multiplyMatrixVector", {
		"DenseMatrix, any": h,
		"SparseMatrix, any": v
	}), m = t("_multiplyMatrixMatrix", {
		"DenseMatrix, DenseMatrix": g,
		"DenseMatrix, SparseMatrix": _,
		"SparseMatrix, DenseMatrix": y,
		"SparseMatrix, SparseMatrix": b
	});
	function h(e, n) {
		var a = e._data, o = e._size, s = e._datatype || e.getDataType(), c = n._data, l = n._datatype || n.getDataType(), u = o[0], d = o[1], f, p = r, m = i;
		s && l && s === l && typeof s == "string" && s !== "mixed" && (f = s, p = t.find(r, [f, f]), m = t.find(i, [f, f]));
		for (var h = [], g = 0; g < u; g++) {
			for (var _ = a[g], v = m(_[0], c[0]), y = 1; y < d; y++) v = p(v, m(_[y], c[y]));
			h[g] = v;
		}
		return e.createDenseMatrix({
			data: h,
			size: [u],
			datatype: s === e._datatype && l === n._datatype ? f : void 0
		});
	}
	function g(e, n) {
		var a = e._data, o = e._size, s = e._datatype || e.getDataType(), c = n._data, l = n._size, u = n._datatype || n.getDataType(), d = o[0], f = o[1], p = l[1], m, h = r, g = i;
		s && u && s === u && typeof s == "string" && s !== "mixed" && s !== "mixed" && (m = s, h = t.find(r, [m, m]), g = t.find(i, [m, m]));
		for (var _ = [], v = 0; v < d; v++) {
			var y = a[v];
			_[v] = [];
			for (var b = 0; b < p; b++) {
				for (var x = g(y[0], c[0][b]), w = 1; w < f; w++) x = h(x, g(y[w], c[w][b]));
				_[v][b] = x;
			}
		}
		return e.createDenseMatrix({
			data: _,
			size: [d, p],
			datatype: s === e._datatype && u === n._datatype ? m : void 0
		});
	}
	function _(e, n) {
		var o = e._data, s = e._size, c = e._datatype || e.getDataType(), l = n._values, u = n._index, d = n._ptr, f = n._size, p = n._datatype || n._data === void 0 ? n._datatype : n.getDataType();
		if (!l) throw Error("Cannot multiply Dense Matrix times Pattern only Matrix");
		var m = s[0], h = f[1], g, _ = r, v = i, y = a, b = 0;
		c && p && c === p && typeof c == "string" && c !== "mixed" && (g = c, _ = t.find(r, [g, g]), v = t.find(i, [g, g]), y = t.find(a, [g, g]), b = t.convert(0, g));
		for (var x = [], w = [], T = [], E = n.createSparseMatrix({
			values: x,
			index: w,
			ptr: T,
			size: [m, h],
			datatype: c === e._datatype && p === n._datatype ? g : void 0
		}), k = 0; k < h; k++) {
			T[k] = w.length;
			var A = d[k], j = d[k + 1];
			if (j > A) for (var M = 0, L = 0; L < m; L++) {
				for (var R = L + 1, z = void 0, G = A; G < j; G++) {
					var q = u[G];
					M === R ? z = _(z, v(o[L][q], l[G])) : (z = v(o[L][q], l[G]), M = R);
				}
				M === R && !y(z, b) && (w.push(L), x.push(z));
			}
		}
		return T[h] = w.length, E;
	}
	function v(e, n) {
		var o = e._values, s = e._index, c = e._ptr, l = e._datatype || e._data === void 0 ? e._datatype : e.getDataType();
		if (!o) throw Error("Cannot multiply Pattern only Matrix times Dense Matrix");
		var u = n._data, d = n._datatype || n.getDataType(), f = e._size[0], p = n._size[0], m = [], h = [], g = [], _, v = r, y = i, b = a, x = 0;
		l && d && l === d && typeof l == "string" && l !== "mixed" && (_ = l, v = t.find(r, [_, _]), y = t.find(i, [_, _]), b = t.find(a, [_, _]), x = t.convert(0, _));
		var w = [], T = [];
		g[0] = 0;
		for (var E = 0; E < p; E++) {
			var k = u[E];
			if (!b(k, x)) for (var A = c[E], j = c[E + 1], M = A; M < j; M++) {
				var L = s[M];
				T[L] ? w[L] = v(w[L], y(k, o[M])) : (T[L] = !0, h.push(L), w[L] = y(k, o[M]));
			}
		}
		for (var R = h.length, z = 0; z < R; z++) m[z] = w[h[z]];
		return g[1] = h.length, e.createSparseMatrix({
			values: m,
			index: h,
			ptr: g,
			size: [f, 1],
			datatype: l === e._datatype && d === n._datatype ? _ : void 0
		});
	}
	function y(e, n) {
		var o = e._values, s = e._index, c = e._ptr, l = e._datatype || e._data === void 0 ? e._datatype : e.getDataType();
		if (!o) throw Error("Cannot multiply Pattern only Matrix times Dense Matrix");
		var u = n._data, d = n._datatype || n.getDataType(), f = e._size[0], p = n._size[0], m = n._size[1], h, g = r, _ = i, v = a, y = 0;
		l && d && l === d && typeof l == "string" && l !== "mixed" && (h = l, g = t.find(r, [h, h]), _ = t.find(i, [h, h]), v = t.find(a, [h, h]), y = t.convert(0, h));
		for (var b = [], x = [], w = [], T = e.createSparseMatrix({
			values: b,
			index: x,
			ptr: w,
			size: [f, m],
			datatype: l === e._datatype && d === n._datatype ? h : void 0
		}), E = [], k = [], A = 0; A < m; A++) {
			w[A] = x.length;
			for (var j = A + 1, M = 0; M < p; M++) {
				var L = u[M][A];
				if (!v(L, y)) for (var R = c[M], z = c[M + 1], G = R; G < z; G++) {
					var q = s[G];
					k[q] === j ? E[q] = g(E[q], _(L, o[G])) : (k[q] = j, x.push(q), E[q] = _(L, o[G]));
				}
			}
			for (var J = w[A], Z = x.length, Q = J; Q < Z; Q++) b[Q] = E[x[Q]];
		}
		return w[m] = x.length, T;
	}
	function b(e, n) {
		var a = e._values, o = e._index, s = e._ptr, c = e._datatype || e._data === void 0 ? e._datatype : e.getDataType(), l = n._values, u = n._index, d = n._ptr, f = n._datatype || n._data === void 0 ? n._datatype : n.getDataType(), p = e._size[0], m = n._size[1], h = a && l, g, _ = r, v = i;
		c && f && c === f && typeof c == "string" && c !== "mixed" && (g = c, _ = t.find(r, [g, g]), v = t.find(i, [g, g]));
		for (var y = h ? [] : void 0, b = [], x = [], w = e.createSparseMatrix({
			values: y,
			index: b,
			ptr: x,
			size: [p, m],
			datatype: c === e._datatype && f === n._datatype ? g : void 0
		}), T = h ? [] : void 0, E = [], k, A, j, M, L, R, z, G, q = 0; q < m; q++) {
			x[q] = b.length;
			var J = q + 1;
			for (L = d[q], R = d[q + 1], M = L; M < R; M++) if (G = u[M], h) for (A = s[G], j = s[G + 1], k = A; k < j; k++) z = o[k], E[z] === J ? T[z] = _(T[z], v(l[M], a[k])) : (E[z] = J, b.push(z), T[z] = v(l[M], a[k]));
			else for (A = s[G], j = s[G + 1], k = A; k < j; k++) z = o[k], E[z] !== J && (E[z] = J, b.push(z));
			if (h) for (var Z = x[q], Q = b.length, ee = Z; ee < Q; ee++) y[ee] = T[b[ee]];
		}
		return x[m] = b.length, w;
	}
	return t(name$44, i, {
		"Array, Array": t.referTo("Matrix, Matrix", (e) => (t, r) => {
			l(arraySize(t), arraySize(r));
			var i = e(n(t), n(r));
			return isMatrix(i) ? i.valueOf() : i;
		}),
		"Matrix, Matrix": function(e, t) {
			var n = e.size(), r = t.size();
			return l(n, r), n.length === 1 ? r.length === 1 ? u(e, t, n[0]) : d(e, t) : r.length === 1 ? p(e, t) : m(e, t);
		},
		"Matrix, Array": t.referTo("Matrix,Matrix", (e) => (t, r) => e(t, n(r))),
		"Array, Matrix": t.referToSelf((e) => (t, r) => e(n(t, r.storage()), r)),
		"SparseMatrix, any": function(e, t) {
			return s(e, t, i, !1);
		},
		"DenseMatrix, any": function(e, t) {
			return c(e, t, i, !1);
		},
		"any, SparseMatrix": function(e, t) {
			return s(t, e, i, !0);
		},
		"any, DenseMatrix": function(e, t) {
			return c(t, e, i, !0);
		},
		"Array, any": function(e, t) {
			return c(n(e), t, i, !1).valueOf();
		},
		"any, Array": function(e, t) {
			return c(n(t), e, i, !0).valueOf();
		},
		"any, any": i,
		"any, any, ...any": t.referToSelf((e) => (t, n, r) => {
			for (var i = e(t, n), a = 0; a < r.length; a++) i = e(i, r[a]);
			return i;
		})
	});
}), name$43 = "sign", dependencies$43 = [
	"typed",
	"BigNumber",
	"Fraction",
	"complex"
], createSign = /* @__PURE__ */ factory(name$43, dependencies$43, (e) => {
	var { typed: t, BigNumber: n, complex: r, Fraction: i } = e;
	return t(name$43, {
		number: signNumber,
		Complex: function(e) {
			return e.im === 0 ? r(signNumber(e.re)) : e.sign();
		},
		BigNumber: function(e) {
			return new n(e.cmp(0));
		},
		bigint: function(e) {
			return e > 0n ? 1n : e < 0n ? -1n : 0n;
		},
		Fraction: function(e) {
			return e.n === 0n ? new i(0) : new i(e.s);
		},
		"Array | Matrix": t.referToSelf((e) => (t) => deepMap(t, e, !0)),
		Unit: t.referToSelf((e) => (n) => {
			if (!n._isDerived() && n.units[0].unit.offset !== 0) throw TypeError("sign is ambiguous for units with offset");
			return t.find(e, n.valueType())(n.value);
		})
	});
}), name$42 = "sqrt", dependencies$42 = [
	"config",
	"typed",
	"Complex"
], createSqrt = /* @__PURE__ */ factory(name$42, dependencies$42, (e) => {
	var { config: t, typed: n, Complex: r } = e;
	return n("sqrt", {
		number: i,
		Complex: function(e) {
			return e.sqrt();
		},
		BigNumber: function(e) {
			return !e.isNegative() || t.predictable ? e.sqrt() : i(e.toNumber());
		},
		Unit: function(e) {
			return e.pow(.5);
		}
	});
	function i(e) {
		return isNaN(e) ? NaN : e >= 0 || t.predictable ? Math.sqrt(e) : new r(e, 0).sqrt();
	}
}), name$41 = "subtract", dependencies$41 = [
	"typed",
	"matrix",
	"equalScalar",
	"subtractScalar",
	"unaryMinus",
	"DenseMatrix",
	"concat"
], createSubtract = /* @__PURE__ */ factory(name$41, dependencies$41, (e) => {
	var { typed: t, matrix: n, equalScalar: r, subtractScalar: i, unaryMinus: a, DenseMatrix: o, concat: s } = e, c = createMatAlgo01xDSid({ typed: t }), l = createMatAlgo03xDSf({ typed: t }), u = createMatAlgo05xSfSf({
		typed: t,
		equalScalar: r
	}), d = createMatAlgo10xSids({
		typed: t,
		DenseMatrix: o
	}), f = createMatAlgo12xSfs({
		typed: t,
		DenseMatrix: o
	}), p = createMatrixAlgorithmSuite({
		typed: t,
		matrix: n,
		concat: s
	});
	return t(name$41, { "any, any": i }, p({
		elop: i,
		SS: u,
		DS: c,
		SD: l,
		Ss: f,
		sS: d
	}));
}), name$40 = "matAlgo07xSSf", dependencies$40 = ["typed", "SparseMatrix"], createMatAlgo07xSSf = /* @__PURE__ */ factory(name$40, dependencies$40, (e) => {
	var { typed: t, SparseMatrix: n } = e;
	return function(e, i, a) {
		var o = e._size, s = e._datatype || e._data === void 0 ? e._datatype : e.getDataType(), c = i._size, l = i._datatype || i._data === void 0 ? i._datatype : i.getDataType();
		if (o.length !== c.length) throw new DimensionError(o.length, c.length);
		if (o[0] !== c[0] || o[1] !== c[1]) throw RangeError("Dimension mismatch. Matrix A (" + o + ") must match Matrix B (" + c + ")");
		var u = o[0], d = o[1], f, p = 0, m = a;
		typeof s == "string" && s === l && s !== "mixed" && (f = s, p = t.convert(0, f), m = t.find(a, [f, f]));
		for (var h = [], g = [], _ = Array(d + 1).fill(0), v = [], y = [], b = [], x = [], w = 0; w < d; w++) {
			var T = w + 1, E = 0;
			r(e, w, b, v, T), r(i, w, x, y, T);
			for (var k = 0; k < u; k++) {
				var A = b[k] === T ? v[k] : p, j = x[k] === T ? y[k] : p, M = m(A, j);
				M !== 0 && M !== !1 && (g.push(k), h.push(M), E++);
			}
			_[w + 1] = _[w] + E;
		}
		return new n({
			values: h,
			index: g,
			ptr: _,
			size: [u, d],
			datatype: s === e._datatype && l === i._datatype ? f : void 0
		});
	};
	function r(e, t, n, r, i) {
		for (var a = e._values, o = e._index, s = e._ptr, c = s[t], l = s[t + 1]; c < l; c++) {
			var u = o[c];
			n[u] = i, r[u] = a[c];
		}
	}
}), name$39 = "conj", dependencies$39 = ["typed"], createConj = /* @__PURE__ */ factory(name$39, dependencies$39, (e) => {
	var { typed: t } = e;
	return t(name$39, {
		"number | BigNumber | Fraction": (e) => e,
		Complex: (e) => e.conjugate(),
		Unit: t.referToSelf((e) => (t) => new t.constructor(e(t.toNumeric()), t.formatUnits())),
		"Array | Matrix": t.referToSelf((e) => (t) => deepMap(t, e))
	});
}), name$38 = "im", dependencies$38 = ["typed"], createIm = /* @__PURE__ */ factory(name$38, dependencies$38, (e) => {
	var { typed: t } = e;
	return t(name$38, {
		number: () => 0,
		"BigNumber | Fraction": (e) => e.mul(0),
		Complex: (e) => e.im,
		"Array | Matrix": t.referToSelf((e) => (t) => deepMap(t, e))
	});
}), name$37 = "re", dependencies$37 = ["typed"], createRe = /* @__PURE__ */ factory(name$37, dependencies$37, (e) => {
	var { typed: t } = e;
	return t(name$37, {
		"number | BigNumber | Fraction": (e) => e,
		Complex: (e) => e.re,
		"Array | Matrix": t.referToSelf((e) => (t) => deepMap(t, e))
	});
}), name$36 = "concat", dependencies$36 = [
	"typed",
	"matrix",
	"isInteger"
], createConcat = /* @__PURE__ */ factory(name$36, dependencies$36, (e) => {
	var { typed: t, matrix: n, isInteger: r } = e;
	return t(name$36, {
		"...Array | Matrix | number | BigNumber": function(e) {
			var t, i = e.length, a = -1, o, s = !1, c = [];
			for (t = 0; t < i; t++) {
				var l = e[t];
				if (isMatrix(l) && (s = !0), isNumber(l) || isBigNumber(l)) {
					if (t !== i - 1) throw Error("Dimension must be specified as last argument");
					if (o = a, a = l.valueOf(), !r(a)) throw TypeError("Integer number expected for dimension");
					if (a < 0 || t > 0 && a > o) throw new IndexError(a, o + 1);
				} else {
					var u = clone$2(l).valueOf(), d = arraySize(u);
					if (c[t] = u, o = a, a = d.length - 1, t > 0 && a !== o) throw new DimensionError(o + 1, a + 1);
				}
			}
			if (c.length === 0) throw SyntaxError("At least one matrix expected");
			for (var f = c.shift(); c.length;) f = concat$1(f, c.shift(), a);
			return s ? n(f) : f;
		},
		"...string": function(e) {
			return e.join("");
		}
	});
}), name$35 = "column", dependencies$35 = [
	"typed",
	"Index",
	"matrix",
	"range"
], createColumn = /* @__PURE__ */ factory(name$35, dependencies$35, (e) => {
	var { typed: t, Index: n, matrix: r, range: i } = e;
	return t(name$35, {
		"Matrix, number": a,
		"Array, number": function(e, t) {
			return a(r(clone$2(e)), t).valueOf();
		}
	});
	function a(e, t) {
		if (e.size().length !== 2) throw Error("Only two dimensional matrix is supported");
		validateIndex(t, e.size()[1]);
		var a = new n(i(0, e.size()[0]), [t]), o = e.subset(a);
		return isMatrix(o) ? o : r([[o]]);
	}
}), name$34 = "cross", dependencies$34 = [
	"typed",
	"matrix",
	"subtract",
	"multiply"
], createCross = /* @__PURE__ */ factory(name$34, dependencies$34, (e) => {
	var { typed: t, matrix: n, subtract: r, multiply: i } = e;
	return t(name$34, {
		"Matrix, Matrix": function(e, t) {
			return n(a(e.toArray(), t.toArray()));
		},
		"Matrix, Array": function(e, t) {
			return n(a(e.toArray(), t));
		},
		"Array, Matrix": function(e, t) {
			return n(a(e, t.toArray()));
		},
		"Array, Array": a
	});
	function a(e, t) {
		var n = Math.max(arraySize(e).length, arraySize(t).length);
		e = squeeze(e), t = squeeze(t);
		var a = arraySize(e), o = arraySize(t);
		if (a.length !== 1 || o.length !== 1 || a[0] !== 3 || o[0] !== 3) throw RangeError("Vectors with length 3 expected (Size A = [" + a.join(", ") + "], B = [" + o.join(", ") + "])");
		var s = [
			r(i(e[1], t[2]), i(e[2], t[1])),
			r(i(e[2], t[0]), i(e[0], t[2])),
			r(i(e[0], t[1]), i(e[1], t[0]))
		];
		return n > 1 ? [s] : s;
	}
}), name$33 = "diag", dependencies$33 = [
	"typed",
	"matrix",
	"DenseMatrix",
	"SparseMatrix"
], createDiag = /* @__PURE__ */ factory(name$33, dependencies$33, (e) => {
	var { typed: t, matrix: n, DenseMatrix: r, SparseMatrix: i } = e;
	return t(name$33, {
		Array: function(e) {
			return a(e, 0, arraySize(e), null);
		},
		"Array, number": function(e, t) {
			return a(e, t, arraySize(e), null);
		},
		"Array, BigNumber": function(e, t) {
			return a(e, t.toNumber(), arraySize(e), null);
		},
		"Array, string": function(e, t) {
			return a(e, 0, arraySize(e), t);
		},
		"Array, number, string": function(e, t, n) {
			return a(e, t, arraySize(e), n);
		},
		"Array, BigNumber, string": function(e, t, n) {
			return a(e, t.toNumber(), arraySize(e), n);
		},
		Matrix: function(e) {
			return a(e, 0, e.size(), e.storage());
		},
		"Matrix, number": function(e, t) {
			return a(e, t, e.size(), e.storage());
		},
		"Matrix, BigNumber": function(e, t) {
			return a(e, t.toNumber(), e.size(), e.storage());
		},
		"Matrix, string": function(e, t) {
			return a(e, 0, e.size(), t);
		},
		"Matrix, number, string": function(e, t, n) {
			return a(e, t, e.size(), n);
		},
		"Matrix, BigNumber, string": function(e, t, n) {
			return a(e, t.toNumber(), e.size(), n);
		}
	});
	function a(e, t, n, r) {
		if (!isInteger$1(t)) throw TypeError("Second parameter in function diag must be an integer");
		var i = t > 0 ? t : 0, a = t < 0 ? -t : 0;
		switch (n.length) {
			case 1: return o(e, t, r, n[0], a, i);
			case 2: return s(e, t, r, n, a, i);
		}
		throw RangeError("Matrix for function diag must be 2 dimensional");
	}
	function o(e, t, n, a, o, s) {
		var c = [a + o, a + s];
		if (n && n !== "sparse" && n !== "dense") throw TypeError(`Unknown matrix type ${n}"`);
		var l = n === "sparse" ? i.diagonal(c, e, t) : r.diagonal(c, e, t);
		return n === null ? l.valueOf() : l;
	}
	function s(e, t, r, i, a, o) {
		if (isMatrix(e)) {
			var s = e.diagonal(t);
			return r === null ? s.valueOf() : r === s.storage() ? s : n(s, r);
		}
		for (var c = Math.min(i[0] - a, i[1] - o), l = [], u = 0; u < c; u++) l[u] = e[u + a][u + o];
		return r === null ? l : n(l);
	}
}), name$32 = "flatten", dependencies$32 = ["typed"], createFlatten = /* @__PURE__ */ factory(name$32, dependencies$32, (e) => {
	var { typed: t } = e;
	return t(name$32, {
		Array: function(e) {
			return flatten$1(e);
		},
		DenseMatrix: function(e) {
			return e.create(flatten$1(e.valueOf(), !0), e.datatype());
		},
		SparseMatrix: function(e) {
			throw TypeError("SparseMatrix is not supported by function flatten because it does not support 1D vectors. Convert to a DenseMatrix or Array first. Example: flatten(x.toArray())");
		}
	});
}), name$31 = "getMatrixDataType", dependencies$31 = ["typed"], createGetMatrixDataType = /* @__PURE__ */ factory(name$31, dependencies$31, (e) => {
	var { typed: t } = e;
	return t(name$31, {
		Array: function(e) {
			return getArrayDataType(e, typeOf);
		},
		Matrix: function(e) {
			return e.getDataType();
		}
	});
}), name$30 = "identity", dependencies$30 = [
	"typed",
	"config",
	"matrix",
	"BigNumber",
	"DenseMatrix",
	"SparseMatrix"
], createIdentity = /* @__PURE__ */ factory(name$30, dependencies$30, (e) => {
	var { typed: t, config: n, matrix: r, BigNumber: i, DenseMatrix: a, SparseMatrix: o } = e;
	return t(name$30, {
		"": function() {
			return n.matrix === "Matrix" ? r([]) : [];
		},
		string: function(e) {
			return r(e);
		},
		"number | BigNumber": function(e) {
			return c(e, e, n.matrix === "Matrix" ? "dense" : void 0);
		},
		"number | BigNumber, string": function(e, t) {
			return c(e, e, t);
		},
		"number | BigNumber, number | BigNumber": function(e, t) {
			return c(e, t, n.matrix === "Matrix" ? "dense" : void 0);
		},
		"number | BigNumber, number | BigNumber, string": function(e, t, n) {
			return c(e, t, n);
		},
		Array: function(e) {
			return s(e);
		},
		"Array, string": function(e, t) {
			return s(e, t);
		},
		Matrix: function(e) {
			return s(e.valueOf(), e.storage());
		},
		"Matrix, string": function(e, t) {
			return s(e.valueOf(), t);
		}
	});
	function s(e, t) {
		switch (e.length) {
			case 0: return t ? r(t) : [];
			case 1: return c(e[0], e[0], t);
			case 2: return c(e[0], e[1], t);
			default: throw Error("Vector containing two values expected");
		}
	}
	function c(e, t, n) {
		var r = isBigNumber(e) || isBigNumber(t) ? i : null;
		if (isBigNumber(e) && (e = e.toNumber()), isBigNumber(t) && (t = t.toNumber()), !isInteger$1(e) || e < 1 || !isInteger$1(t) || t < 1) throw Error("Parameters in function identity must be positive integers");
		var s = r ? new i(1) : 1, c = r ? new r(0) : 0, l = [e, t];
		if (n) {
			if (n === "sparse") return o.diagonal(l, s, 0, c);
			if (n === "dense") return a.diagonal(l, s, 0, c);
			throw TypeError(`Unknown matrix type "${n}"`);
		}
		for (var u = resize([], l, c), d = e < t ? e : t, f = 0; f < d; f++) u[f][f] = s;
		return u;
	}
});
//#endregion
//#region node_modules/mathjs/lib/esm/utils/noop.js
function noBignumber() {
	throw Error("No \"bignumber\" implementation available");
}
function noFraction() {
	throw Error("No \"fraction\" implementation available");
}
function noMatrix() {
	throw Error("No \"matrix\" implementation available");
}
//#endregion
//#region node_modules/mathjs/lib/esm/function/matrix/range.js
var name$29 = "range", dependencies$29 = [
	"typed",
	"config",
	"?matrix",
	"?bignumber",
	"equal",
	"smaller",
	"smallerEq",
	"larger",
	"largerEq",
	"add",
	"isZero",
	"isPositive"
], createRange = /* @__PURE__ */ factory(name$29, dependencies$29, (e) => {
	var { typed: t, config: n, matrix: r, bignumber: i, smaller: a, smallerEq: o, larger: s, largerEq: c, add: l, isZero: u, isPositive: d } = e;
	return t(name$29, {
		string: p,
		"string, boolean": p,
		number: function(e) {
			throw TypeError(`Too few arguments to function range(): ${e}`);
		},
		boolean: function(e) {
			throw TypeError(`Unexpected type of argument 1 to function range(): ${e}, number|bigint|BigNumber|Fraction`);
		},
		"number, number": function(e, t) {
			return f(m(e, t, 1, !1));
		},
		"number, number, number": function(e, t, n) {
			return f(m(e, t, n, !1));
		},
		"number, number, boolean": function(e, t, n) {
			return f(m(e, t, 1, n));
		},
		"number, number, number, boolean": function(e, t, n, r) {
			return f(m(e, t, n, r));
		},
		"bigint, bigint|number": function(e, t) {
			return f(m(e, t, 1n, !1));
		},
		"number, bigint": function(e, t) {
			return f(m(BigInt(e), t, 1n, !1));
		},
		"bigint, bigint|number, bigint|number": function(e, t, n) {
			return f(m(e, t, BigInt(n), !1));
		},
		"number, bigint, bigint|number": function(e, t, n) {
			return f(m(BigInt(e), t, BigInt(n), !1));
		},
		"bigint, bigint|number, boolean": function(e, t, n) {
			return f(m(e, t, 1n, n));
		},
		"number, bigint, boolean": function(e, t, n) {
			return f(m(BigInt(e), t, 1n, n));
		},
		"bigint, bigint|number, bigint|number, boolean": function(e, t, n, r) {
			return f(m(e, t, BigInt(n), r));
		},
		"number, bigint, bigint|number, boolean": function(e, t, n, r) {
			return f(m(BigInt(e), t, BigInt(n), r));
		},
		"BigNumber, BigNumber": function(e, t) {
			var n = e.constructor;
			return f(m(e, t, new n(1), !1));
		},
		"BigNumber, BigNumber, BigNumber": function(e, t, n) {
			return f(m(e, t, n, !1));
		},
		"BigNumber, BigNumber, boolean": function(e, t, n) {
			var r = e.constructor;
			return f(m(e, t, new r(1), n));
		},
		"BigNumber, BigNumber, BigNumber, boolean": function(e, t, n, r) {
			return f(m(e, t, n, r));
		},
		"Fraction, Fraction": function(e, t) {
			return f(m(e, t, 1, !1));
		},
		"Fraction, Fraction, Fraction": function(e, t, n) {
			return f(m(e, t, n, !1));
		},
		"Fraction, Fraction, boolean": function(e, t, n) {
			return f(m(e, t, 1, n));
		},
		"Fraction, Fraction, Fraction, boolean": function(e, t, n, r) {
			return f(m(e, t, n, r));
		},
		"Unit, Unit, Unit": function(e, t, n) {
			return f(m(e, t, n, !1));
		},
		"Unit, Unit, Unit, boolean": function(e, t, n, r) {
			return f(m(e, t, n, r));
		}
	});
	function f(e) {
		return n.matrix === "Matrix" ? r ? r(e) : noMatrix() : e;
	}
	function p(e, t) {
		var r = h(e);
		if (!r) throw SyntaxError("String \"" + e + "\" is no valid range");
		return n.number === "BigNumber" ? (i === void 0 && noBignumber(), f(m(i(r.start), i(r.end), i(r.step)), t)) : f(m(r.start, r.end, r.step, t));
	}
	function m(e, t, n, r) {
		var i = [];
		if (u(n)) throw Error("Step must be non-zero");
		for (var f = d(n) ? r ? o : a : r ? c : s, p = e; f(p, t);) i.push(p), p = l(p, n);
		return i;
	}
	function h(e) {
		var t = e.split(":").map(function(e) {
			return Number(e);
		});
		if (t.some(function(e) {
			return isNaN(e);
		})) return null;
		switch (t.length) {
			case 2: return {
				start: t[0],
				end: t[1],
				step: 1
			};
			case 3: return {
				start: t[0],
				end: t[2],
				step: t[1]
			};
			default: return null;
		}
	}
}), name$28 = "reshape", dependencies$28 = [
	"typed",
	"isInteger",
	"matrix"
], createReshape = /* @__PURE__ */ factory(name$28, dependencies$28, (e) => {
	var { typed: t, isInteger: n } = e;
	return t(name$28, {
		"Matrix, Array": function(e, t) {
			return e.reshape(t, !0);
		},
		"Array, Array": function(e, t) {
			return t.forEach(function(e) {
				if (!n(e)) throw TypeError("Invalid size for dimension: " + e);
			}), reshape$1(e, t);
		}
	});
}), name$27 = "size", dependencies$27 = ["typed"], createSize = /* @__PURE__ */ factory(name$27, dependencies$27, (e) => {
	var { typed: t } = e;
	return t(name$27, {
		Matrix: (e) => e.size(),
		Array: arraySize,
		string: (e) => [e.length],
		"number | Complex | BigNumber | Unit | boolean | null": (e) => []
	});
}), name$26 = "transpose", dependencies$26 = ["typed", "matrix"], createTranspose = /* @__PURE__ */ factory(name$26, dependencies$26, (e) => {
	var { typed: t, matrix: n } = e;
	return t(name$26, {
		Array: (e) => r(n(e)).valueOf(),
		Matrix: r,
		any: clone$2
	});
	function r(e) {
		var t = e.size(), n;
		switch (t.length) {
			case 1:
				n = e.clone();
				break;
			case 2:
				var r = t[0], o = t[1];
				if (o === 0) throw RangeError("Cannot transpose a 2D matrix with no columns (size: " + format(t) + ")");
				switch (e.storage()) {
					case "dense":
						n = i(e, r, o);
						break;
					case "sparse":
						n = a(e, r, o);
						break;
				}
				break;
			default: throw RangeError("Matrix must be a vector or two dimensional (size: " + format(t) + ")");
		}
		return n;
	}
	function i(e, t, n) {
		for (var r = e._data, i = [], a, o = 0; o < n; o++) {
			a = i[o] = [];
			for (var s = 0; s < t; s++) a[s] = clone$2(r[s][o]);
		}
		return e.createDenseMatrix({
			data: i,
			size: [n, t],
			datatype: e._datatype
		});
	}
	function a(e, t, n) {
		for (var r = e._values, i = e._index, a = e._ptr, o = r ? [] : void 0, s = [], c = [], l = [], u = 0; u < t; u++) l[u] = 0;
		var d, f, p;
		for (d = 0, f = i.length; d < f; d++) l[i[d]]++;
		for (var m = 0, h = 0; h < t; h++) c.push(m), m += l[h], l[h] = c[h];
		for (c.push(m), p = 0; p < n; p++) for (var g = a[p], _ = a[p + 1], v = g; v < _; v++) {
			var y = l[i[v]]++;
			s[y] = p, r && (o[y] = clone$2(r[v]));
		}
		return e.createSparseMatrix({
			values: o,
			index: s,
			ptr: c,
			size: [n, t],
			datatype: e._datatype
		});
	}
}), name$25 = "ctranspose", dependencies$25 = [
	"typed",
	"transpose",
	"conj"
], createCtranspose = /* @__PURE__ */ factory(name$25, dependencies$25, (e) => {
	var { typed: t, transpose: n, conj: r } = e;
	return t(name$25, { any: function(e) {
		return r(n(e));
	} });
}), name$24 = "zeros", dependencies$24 = [
	"typed",
	"config",
	"matrix",
	"BigNumber"
], createZeros = /* @__PURE__ */ factory(name$24, dependencies$24, (e) => {
	var { typed: t, config: n, matrix: r, BigNumber: i } = e;
	return t(name$24, {
		"": function() {
			return n.matrix === "Array" ? a([]) : a([], "default");
		},
		"...number | BigNumber | string": function(e) {
			return typeof e[e.length - 1] == "string" ? a(e, e.pop()) : n.matrix === "Array" ? a(e) : a(e, "default");
		},
		Array: a,
		Matrix: function(e) {
			var t = e.storage();
			return a(e.valueOf(), t);
		},
		"Array | Matrix, string": function(e, t) {
			return a(e.valueOf(), t);
		}
	});
	function a(e, t) {
		var n = o(e) ? new i(0) : 0;
		if (s(e), t) {
			var a = r(t);
			return e.length > 0 ? a.resize(e, n) : a;
		} else {
			var c = [];
			return e.length > 0 ? resize(c, e, n) : c;
		}
	}
	function o(e) {
		var t = !1;
		return e.forEach(function(e, n, r) {
			isBigNumber(e) && (t = !0, r[n] = e.toNumber());
		}), t;
	}
	function s(e) {
		e.forEach(function(e) {
			if (typeof e != "number" || !isInteger$1(e) || e < 0) throw Error("Parameters in function zeros must be positive integers");
		});
	}
}), name$23 = "numeric", dependencies$23 = [
	"number",
	"?bignumber",
	"?fraction"
], createNumeric = /* @__PURE__ */ factory(name$23, dependencies$23, (e) => {
	var { number: t, bignumber: n, fraction: r } = e, i = {
		string: !0,
		number: !0,
		BigNumber: !0,
		Fraction: !0
	}, a = {
		number: (e) => t(e),
		BigNumber: n ? (e) => n(e) : noBignumber,
		bigint: (e) => BigInt(e),
		Fraction: r ? (e) => r(e) : noFraction
	};
	return function(e) {
		var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "number";
		if ((arguments.length > 2 ? arguments[2] : void 0) !== void 0) throw SyntaxError("numeric() takes one or two arguments");
		var n = typeOf(e);
		if (!(n in i)) throw TypeError("Cannot convert " + e + " of type \"" + n + "\"; valid input types are " + Object.keys(i).join(", "));
		if (!(t in a)) throw TypeError("Cannot convert " + e + " to type \"" + t + "\"; valid output types are " + Object.keys(a).join(", "));
		return t === n ? e : a[t](e);
	};
}), name$22 = "divideScalar", dependencies$22 = ["typed", "numeric"], createDivideScalar = /* @__PURE__ */ factory(name$22, dependencies$22, (e) => {
	var { typed: t, numeric: n } = e;
	return t(name$22, {
		"number, number": function(e, t) {
			return e / t;
		},
		"Complex, Complex": function(e, t) {
			return e.div(t);
		},
		"BigNumber, BigNumber": function(e, t) {
			return e.div(t);
		},
		"bigint, bigint": function(e, t) {
			return e / t;
		},
		"Fraction, Fraction": function(e, t) {
			return e.div(t);
		},
		"Unit, number | Complex | Fraction | BigNumber | Unit": (e, t) => e.divide(t),
		"number | Fraction | Complex | BigNumber, Unit": (e, t) => t.divideInto(e)
	});
}), name$21 = "pow", dependencies$21 = [
	"typed",
	"config",
	"identity",
	"multiply",
	"matrix",
	"inv",
	"fraction",
	"number",
	"Complex"
], createPow = /* @__PURE__ */ factory(name$21, dependencies$21, (e) => {
	var { typed: t, config: n, identity: r, multiply: i, matrix: a, inv: o, number: s, fraction: c, Complex: l } = e;
	return t(name$21, {
		"number, number": u,
		"Complex, Complex": function(e, t) {
			return e.pow(t);
		},
		"BigNumber, BigNumber": function(e, t) {
			return t.isInteger() || e >= 0 || n.predictable ? e.pow(t) : new l(e.toNumber(), 0).pow(t.toNumber(), 0);
		},
		"bigint, bigint": (e, t) => e ** t,
		"Fraction, Fraction": function(e, t) {
			var r = e.pow(t);
			if (r != null) return r;
			if (n.predictable) throw Error("Result of pow is non-rational and cannot be expressed as a fraction");
			return u(e.valueOf(), t.valueOf());
		},
		"Array, number": d,
		"Array, BigNumber": function(e, t) {
			return d(e, t.toNumber());
		},
		"Matrix, number": f,
		"Matrix, BigNumber": function(e, t) {
			return f(e, t.toNumber());
		},
		"Unit, number | BigNumber": function(e, t) {
			return e.pow(t);
		}
	});
	function u(e, t) {
		if (n.predictable && !isInteger$1(t) && e < 0) try {
			var r = c(t), i = s(r);
			if ((t === i || Math.abs((t - i) / t) < 1e-14) && r.d % 2n == 1n) return (r.n % 2n == 0n ? 1 : -1) * (-e) ** +t;
		} catch {}
		return n.predictable && (e < -1 && t === Infinity || e > -1 && e < 0 && t === -Infinity) ? NaN : isInteger$1(t) || e >= 0 || n.predictable ? powNumber(e, t) : e * e < 1 && t === Infinity || e * e > 1 && t === -Infinity ? 0 : new l(e, 0).pow(t, 0);
	}
	function d(e, t) {
		if (!isInteger$1(t)) throw TypeError("For A^b, b must be an integer (value is " + t + ")");
		var n = arraySize(e);
		if (n.length !== 2) throw Error("For A^b, A must be 2 dimensional (A has " + n.length + " dimensions)");
		if (n[0] !== n[1]) throw Error("For A^b, A must be square (size is " + n[0] + "x" + n[1] + ")");
		if (t < 0) try {
			return d(o(e), -t);
		} catch (e) {
			throw e.message === "Cannot calculate inverse, determinant is zero" ? TypeError("For A^b, when A is not invertible, b must be a positive integer (value is " + t + ")") : e;
		}
		for (var a = r(n[0]).valueOf(), s = e; t >= 1;) (t & 1) == 1 && (a = i(s, a)), t >>= 1, s = i(s, s);
		return a;
	}
	function f(e, t) {
		return a(d(e.valueOf(), t));
	}
});
//#endregion
//#region node_modules/mathjs/lib/esm/function/algebra/solver/utils/solveValidation.js
function createSolveValidation(e) {
	var { DenseMatrix: t } = e;
	return function(e, n, r) {
		var i = e.size();
		if (i.length !== 2) throw RangeError("Matrix must be two dimensional (size: " + format(i) + ")");
		var a = i[0];
		if (a !== i[1]) throw RangeError("Matrix must be square (size: " + format(i) + ")");
		var o = [];
		if (isMatrix(n)) {
			var s = n.size(), c = n._data;
			if (s.length === 1) {
				if (s[0] !== a) throw RangeError("Dimension mismatch. Matrix columns must match vector length.");
				for (var l = 0; l < a; l++) o[l] = [c[l]];
				return new t({
					data: o,
					size: [a, 1],
					datatype: n._datatype
				});
			}
			if (s.length === 2) {
				if (s[0] !== a || s[1] !== 1) throw RangeError("Dimension mismatch. Matrix columns must match vector length.");
				if (isDenseMatrix(n)) {
					if (r) {
						o = [];
						for (var u = 0; u < a; u++) o[u] = [c[u][0]];
						return new t({
							data: o,
							size: [a, 1],
							datatype: n._datatype
						});
					}
					return n;
				}
				if (isSparseMatrix(n)) {
					for (var d = 0; d < a; d++) o[d] = [0];
					for (var f = n._values, p = n._index, m = n._ptr, h = m[1], g = m[0]; g < h; g++) {
						var _ = p[g];
						o[_][0] = f[g];
					}
					return new t({
						data: o,
						size: [a, 1],
						datatype: n._datatype
					});
				}
			}
			throw RangeError("Dimension mismatch. The right side has to be either 1- or 2-dimensional vector.");
		}
		if (isArray(n)) {
			var v = arraySize(n);
			if (v.length === 1) {
				if (v[0] !== a) throw RangeError("Dimension mismatch. Matrix columns must match vector length.");
				for (var y = 0; y < a; y++) o[y] = [n[y]];
				return new t({
					data: o,
					size: [a, 1]
				});
			}
			if (v.length === 2) {
				if (v[0] !== a || v[1] !== 1) throw RangeError("Dimension mismatch. Matrix columns must match vector length.");
				for (var b = 0; b < a; b++) o[b] = [n[b][0]];
				return new t({
					data: o,
					size: [a, 1]
				});
			}
			throw RangeError("Dimension mismatch. The right side has to be either 1- or 2-dimensional vector.");
		}
	};
}
//#endregion
//#region node_modules/mathjs/lib/esm/function/algebra/solver/usolve.js
var name$20 = "usolve", dependencies$20 = [
	"typed",
	"matrix",
	"divideScalar",
	"multiplyScalar",
	"subtractScalar",
	"equalScalar",
	"DenseMatrix"
], createUsolve = /* @__PURE__ */ factory(name$20, dependencies$20, (e) => {
	var { typed: t, matrix: n, divideScalar: r, multiplyScalar: i, subtractScalar: a, equalScalar: o, DenseMatrix: s } = e, c = createSolveValidation({ DenseMatrix: s });
	return t(name$20, {
		"SparseMatrix, Array | Matrix": function(e, t) {
			return u(e, t);
		},
		"DenseMatrix, Array | Matrix": function(e, t) {
			return l(e, t);
		},
		"Array, Array | Matrix": function(e, t) {
			return l(n(e), t).valueOf();
		}
	});
	function l(e, t) {
		t = c(e, t, !0);
		for (var n = t._data, l = e._size[0], u = e._size[1], d = [], f = e._data, p = u - 1; p >= 0; p--) {
			var m = n[p][0] || 0, h = void 0;
			if (o(m, 0)) h = 0;
			else {
				var g = f[p][p];
				if (o(g, 0)) throw Error("Linear system cannot be solved since matrix is singular");
				h = r(m, g);
				for (var _ = p - 1; _ >= 0; _--) n[_] = [a(n[_][0] || 0, i(h, f[_][p]))];
			}
			d[p] = [h];
		}
		return new s({
			data: d,
			size: [l, 1]
		});
	}
	function u(e, t) {
		t = c(e, t, !0);
		for (var n = t._data, l = e._size[0], u = e._size[1], d = e._values, f = e._index, p = e._ptr, m = [], h = u - 1; h >= 0; h--) {
			var g = n[h][0] || 0;
			if (o(g, 0)) m[h] = [0];
			else {
				for (var _ = 0, v = [], y = [], b = p[h], x = p[h + 1] - 1; x >= b; x--) {
					var w = f[x];
					w === h ? _ = d[x] : w < h && (v.push(d[x]), y.push(w));
				}
				if (o(_, 0)) throw Error("Linear system cannot be solved since matrix is singular");
				for (var T = r(g, _), E = 0, k = y.length; E < k; E++) {
					var A = y[E];
					n[A] = [a(n[A][0], i(T, v[E]))];
				}
				m[h] = [T];
			}
		}
		return new s({
			data: m,
			size: [l, 1]
		});
	}
}), name$19 = "usolveAll", dependencies$19 = [
	"typed",
	"matrix",
	"divideScalar",
	"multiplyScalar",
	"subtractScalar",
	"equalScalar",
	"DenseMatrix"
], createUsolveAll = /* @__PURE__ */ factory(name$19, dependencies$19, (e) => {
	var { typed: t, matrix: n, divideScalar: r, multiplyScalar: i, subtractScalar: a, equalScalar: o, DenseMatrix: s } = e, c = createSolveValidation({ DenseMatrix: s });
	return t(name$19, {
		"SparseMatrix, Array | Matrix": function(e, t) {
			return u(e, t);
		},
		"DenseMatrix, Array | Matrix": function(e, t) {
			return l(e, t);
		},
		"Array, Array | Matrix": function(e, t) {
			return l(n(e), t).map((e) => e.valueOf());
		}
	});
	function l(e, t) {
		for (var n = [c(e, t, !0)._data.map((e) => e[0])], l = e._data, u = e._size[0], d = e._size[1] - 1; d >= 0; d--) for (var f = n.length, p = 0; p < f; p++) {
			var m = n[p];
			if (!o(l[d][d], 0)) {
				m[d] = r(m[d], l[d][d]);
				for (var h = d - 1; h >= 0; h--) m[h] = a(m[h], i(m[d], l[h][d]));
			} else if (!o(m[d], 0)) {
				if (p === 0) return [];
				n.splice(p, 1), --p, --f;
			} else if (p === 0) {
				var g = [...m];
				g[d] = 1;
				for (var _ = d - 1; _ >= 0; _--) g[_] = a(g[_], l[_][d]);
				n.push(g);
			}
		}
		return n.map((e) => new s({
			data: e.map((e) => [e]),
			size: [u, 1]
		}));
	}
	function u(e, t) {
		for (var n = [c(e, t, !0)._data.map((e) => e[0])], l = e._size[0], u = e._size[1], d = e._values, f = e._index, p = e._ptr, m = u - 1; m >= 0; m--) for (var h = n.length, g = 0; g < h; g++) {
			for (var _ = n[g], v = [], y = [], b = p[m], x = p[m + 1], w = 0, T = x - 1; T >= b; T--) {
				var E = f[T];
				E === m ? w = d[T] : E < m && (v.push(d[T]), y.push(E));
			}
			if (!o(w, 0)) {
				_[m] = r(_[m], w);
				for (var k = 0, A = y.length; k < A; k++) {
					var j = y[k];
					_[j] = a(_[j], i(_[m], v[k]));
				}
			} else if (!o(_[m], 0)) {
				if (g === 0) return [];
				n.splice(g, 1), --g, --h;
			} else if (g === 0) {
				var M = [..._];
				M[m] = 1;
				for (var L = 0, R = y.length; L < R; L++) {
					var z = y[L];
					M[z] = a(M[z], v[L]);
				}
				n.push(M);
			}
		}
		return n.map((e) => new s({
			data: e.map((e) => [e]),
			size: [l, 1]
		}));
	}
}), name$18 = "equal", dependencies$18 = [
	"typed",
	"matrix",
	"equalScalar",
	"DenseMatrix",
	"SparseMatrix"
], createEqual = /* @__PURE__ */ factory(name$18, dependencies$18, (e) => {
	var { typed: t, matrix: n, equalScalar: r, DenseMatrix: i, concat: a, SparseMatrix: o } = e, s = createMatAlgo03xDSf({ typed: t }), c = createMatAlgo07xSSf({
		typed: t,
		SparseMatrix: o
	}), l = createMatAlgo12xSfs({
		typed: t,
		DenseMatrix: i
	}), u = createMatrixAlgorithmSuite({
		typed: t,
		matrix: n
	});
	return t(name$18, createEqualNumber({
		typed: t,
		equalScalar: r
	}), u({
		elop: r,
		SS: c,
		DS: s,
		Ss: l
	}));
}), createEqualNumber = factory(name$18, ["typed", "equalScalar"], (e) => {
	var { typed: t, equalScalar: n } = e;
	return t(name$18, { "any, any": function(e, t) {
		return e === null ? t === null : t === null ? e === null : e === void 0 ? t === void 0 : t === void 0 ? e === void 0 : n(e, t);
	} });
}), name$17 = "smaller", dependencies$17 = [
	"typed",
	"config",
	"bignumber",
	"matrix",
	"DenseMatrix",
	"concat",
	"SparseMatrix"
], createSmaller = /* @__PURE__ */ factory(name$17, dependencies$17, (e) => {
	var { typed: t, config: n, bignumber: r, matrix: i, DenseMatrix: a, concat: o, SparseMatrix: s } = e, c = createMatAlgo03xDSf({ typed: t }), l = createMatAlgo07xSSf({
		typed: t,
		SparseMatrix: s
	}), u = createMatAlgo12xSfs({
		typed: t,
		DenseMatrix: a
	}), d = createMatrixAlgorithmSuite({
		typed: t,
		matrix: i,
		concat: o
	}), f = createCompareUnits({ typed: t });
	function p(e, t) {
		return e.lt(t) && !nearlyEqual(e, t, n.relTol, n.absTol);
	}
	return t(name$17, createSmallerNumber({
		typed: t,
		config: n
	}), {
		"boolean, boolean": (e, t) => e < t,
		"BigNumber, BigNumber": p,
		"bigint, bigint": (e, t) => e < t,
		"Fraction, Fraction": (e, t) => e.compare(t) === -1,
		"Fraction, BigNumber": function(e, t) {
			return p(r(e), t);
		},
		"BigNumber, Fraction": function(e, t) {
			return p(e, r(t));
		},
		"Complex, Complex": function(e, t) {
			throw TypeError("No ordering relation is defined for complex numbers");
		}
	}, f, d({
		SS: l,
		DS: c,
		Ss: u
	}));
}), createSmallerNumber = /* @__PURE__ */ factory(name$17, ["typed", "config"], (e) => {
	var { typed: t, config: n } = e;
	return t(name$17, { "number, number": function(e, t) {
		return e < t && !nearlyEqual$1(e, t, n.relTol, n.absTol);
	} });
}), name$16 = "smallerEq", dependencies$16 = [
	"typed",
	"config",
	"matrix",
	"DenseMatrix",
	"concat",
	"SparseMatrix"
], createSmallerEq = /* @__PURE__ */ factory(name$16, dependencies$16, (e) => {
	var { typed: t, config: n, matrix: r, DenseMatrix: i, concat: a, SparseMatrix: o } = e, s = createMatAlgo03xDSf({ typed: t }), c = createMatAlgo07xSSf({
		typed: t,
		SparseMatrix: o
	}), l = createMatAlgo12xSfs({
		typed: t,
		DenseMatrix: i
	}), u = createMatrixAlgorithmSuite({
		typed: t,
		matrix: r,
		concat: a
	}), d = createCompareUnits({ typed: t });
	return t(name$16, createSmallerEqNumber({
		typed: t,
		config: n
	}), {
		"boolean, boolean": (e, t) => e <= t,
		"BigNumber, BigNumber": function(e, t) {
			return e.lte(t) || nearlyEqual(e, t, n.relTol, n.absTol);
		},
		"bigint, bigint": (e, t) => e <= t,
		"Fraction, Fraction": (e, t) => e.compare(t) !== 1,
		"Complex, Complex": function() {
			throw TypeError("No ordering relation is defined for complex numbers");
		}
	}, d, u({
		SS: c,
		DS: s,
		Ss: l
	}));
}), createSmallerEqNumber = /* @__PURE__ */ factory(name$16, ["typed", "config"], (e) => {
	var { typed: t, config: n } = e;
	return t(name$16, { "number, number": function(e, t) {
		return e <= t || nearlyEqual$1(e, t, n.relTol, n.absTol);
	} });
}), name$15 = "larger", dependencies$15 = [
	"typed",
	"config",
	"bignumber",
	"matrix",
	"DenseMatrix",
	"concat",
	"SparseMatrix"
], createLarger = /* @__PURE__ */ factory(name$15, dependencies$15, (e) => {
	var { typed: t, config: n, bignumber: r, matrix: i, DenseMatrix: a, concat: o, SparseMatrix: s } = e, c = createMatAlgo03xDSf({ typed: t }), l = createMatAlgo07xSSf({
		typed: t,
		SparseMatrix: s
	}), u = createMatAlgo12xSfs({
		typed: t,
		DenseMatrix: a
	}), d = createMatrixAlgorithmSuite({
		typed: t,
		matrix: i,
		concat: o
	}), f = createCompareUnits({ typed: t });
	function p(e, t) {
		return e.gt(t) && !nearlyEqual(e, t, n.relTol, n.absTol);
	}
	return t(name$15, createLargerNumber({
		typed: t,
		config: n
	}), {
		"boolean, boolean": (e, t) => e > t,
		"BigNumber, BigNumber": p,
		"bigint, bigint": (e, t) => e > t,
		"Fraction, Fraction": (e, t) => e.compare(t) === 1,
		"Fraction, BigNumber": function(e, t) {
			return p(r(e), t);
		},
		"BigNumber, Fraction": function(e, t) {
			return p(e, r(t));
		},
		"Complex, Complex": function() {
			throw TypeError("No ordering relation is defined for complex numbers");
		}
	}, f, d({
		SS: l,
		DS: c,
		Ss: u
	}));
}), createLargerNumber = /* @__PURE__ */ factory(name$15, ["typed", "config"], (e) => {
	var { typed: t, config: n } = e;
	return t(name$15, { "number, number": function(e, t) {
		return e > t && !nearlyEqual$1(e, t, n.relTol, n.absTol);
	} });
}), name$14 = "largerEq", dependencies$14 = [
	"typed",
	"config",
	"matrix",
	"DenseMatrix",
	"concat",
	"SparseMatrix"
], createLargerEq = /* @__PURE__ */ factory(name$14, dependencies$14, (e) => {
	var { typed: t, config: n, matrix: r, DenseMatrix: i, concat: a, SparseMatrix: o } = e, s = createMatAlgo03xDSf({ typed: t }), c = createMatAlgo07xSSf({
		typed: t,
		SparseMatrix: o
	}), l = createMatAlgo12xSfs({
		typed: t,
		DenseMatrix: i
	}), u = createMatrixAlgorithmSuite({
		typed: t,
		matrix: r,
		concat: a
	}), d = createCompareUnits({ typed: t });
	return t(name$14, createLargerEqNumber({
		typed: t,
		config: n
	}), {
		"boolean, boolean": (e, t) => e >= t,
		"BigNumber, BigNumber": function(e, t) {
			return e.gte(t) || nearlyEqual(e, t, n.relTol, n.absTol);
		},
		"bigint, bigint": function(e, t) {
			return e >= t;
		},
		"Fraction, Fraction": (e, t) => e.compare(t) !== -1,
		"Complex, Complex": function() {
			throw TypeError("No ordering relation is defined for complex numbers");
		}
	}, d, u({
		SS: c,
		DS: s,
		Ss: l
	}));
}), createLargerEqNumber = /* @__PURE__ */ factory(name$14, ["typed", "config"], (e) => {
	var { typed: t, config: n } = e;
	return t(name$14, { "number, number": function(e, t) {
		return e >= t || nearlyEqual$1(e, t, n.relTol, n.absTol);
	} });
}), name$13 = "ImmutableDenseMatrix", dependencies$13 = ["smaller", "DenseMatrix"], createImmutableDenseMatrixClass = /* @__PURE__ */ factory(name$13, dependencies$13, (e) => {
	var { smaller: t, DenseMatrix: n } = e;
	function r(e, t) {
		if (!(this instanceof r)) throw SyntaxError("Constructor must be called with the new operator");
		if (t && !isString(t)) throw Error("Invalid datatype: " + t);
		if (isMatrix(e) || isArray(e)) {
			var i = new n(e, t);
			this._data = i._data, this._size = i._size, this._datatype = i._datatype, this._min = null, this._max = null;
		} else if (e && isArray(e.data) && isArray(e.size)) this._data = e.data, this._size = e.size, this._datatype = e.datatype, this._min = e.min === void 0 ? null : e.min, this._max = e.max === void 0 ? null : e.max;
		else if (e) throw TypeError("Unsupported type of data (" + typeOf(e) + ")");
		else this._data = [], this._size = [0], this._datatype = t, this._min = null, this._max = null;
	}
	return r.prototype = new n(), r.prototype.type = "ImmutableDenseMatrix", r.prototype.isImmutableDenseMatrix = !0, r.prototype.subset = function(e) {
		switch (arguments.length) {
			case 1:
				var t = n.prototype.subset.call(this, e);
				return isMatrix(t) ? new r({
					data: t._data,
					size: t._size,
					datatype: t._datatype
				}) : t;
			case 2:
			case 3: throw Error("Cannot invoke set subset on an Immutable Matrix instance");
			default: throw SyntaxError("Wrong number of arguments");
		}
	}, r.prototype.set = function() {
		throw Error("Cannot invoke set on an Immutable Matrix instance");
	}, r.prototype.resize = function() {
		throw Error("Cannot invoke resize on an Immutable Matrix instance");
	}, r.prototype.reshape = function() {
		throw Error("Cannot invoke reshape on an Immutable Matrix instance");
	}, r.prototype.clone = function() {
		return new r({
			data: clone$2(this._data),
			size: clone$2(this._size),
			datatype: this._datatype
		});
	}, r.prototype.toJSON = function() {
		return {
			mathjs: "ImmutableDenseMatrix",
			data: this._data,
			size: this._size,
			datatype: this._datatype
		};
	}, r.fromJSON = function(e) {
		return new r(e);
	}, r.prototype.swapRows = function() {
		throw Error("Cannot invoke swapRows on an Immutable Matrix instance");
	}, r.prototype.min = function() {
		if (this._min === null) {
			var e = null;
			this.forEach(function(n) {
				(e === null || t(n, e)) && (e = n);
			}), this._min = e === null ? void 0 : e;
		}
		return this._min;
	}, r.prototype.max = function() {
		if (this._max === null) {
			var e = null;
			this.forEach(function(n) {
				(e === null || t(e, n)) && (e = n);
			}), this._max = e === null ? void 0 : e;
		}
		return this._max;
	}, r;
}, { isClass: !0 }), name$12 = "Index", dependencies$12 = ["ImmutableDenseMatrix", "getMatrixDataType"], createIndexClass = /* @__PURE__ */ factory(name$12, dependencies$12, (e) => {
	var { ImmutableDenseMatrix: t, getMatrixDataType: n } = e;
	function r() {
		if (!(this instanceof r)) throw SyntaxError("Constructor must be called with the new operator");
		this._dimensions = [], this._sourceSize = [], this._isScalar = !0;
		for (var e = 0, t = arguments.length; e < t; e++) {
			var a = e < 0 || arguments.length <= e ? void 0 : arguments[e], o = isArray(a), s = isMatrix(a), c = typeof a, l = null;
			if (isRange(a)) this._dimensions.push(a), this._isScalar = !1;
			else if (o || s) {
				var u = void 0;
				this._isScalar = !1, n(a) === "boolean" ? (o && (u = i(_booleansArrayToNumbersForIndex(a).valueOf())), s && (u = i(_booleansArrayToNumbersForIndex(a._data).valueOf())), l = a.valueOf().length) : u = i(a.valueOf()), this._dimensions.push(u);
			} else if (c === "number") this._dimensions.push(a);
			else if (c === "bigint") this._dimensions.push(Number(a));
			else if (c === "string") this._dimensions.push(a);
			else throw TypeError("Dimension must be an Array, Matrix, number, bigint, string, or Range");
			this._sourceSize.push(l);
		}
	}
	r.prototype.type = "Index", r.prototype.isIndex = !0;
	function i(e) {
		for (var n = 0, r = e.length; n < r; n++) if (!isNumber(e[n]) || !isInteger$1(e[n])) throw TypeError("Index parameters must be positive integer numbers");
		var i = new t();
		return i._data = e, i._size = [e.length], i;
	}
	return r.prototype.clone = function() {
		var e = new r();
		return e._dimensions = clone$2(this._dimensions), e._isScalar = this._isScalar, e._sourceSize = this._sourceSize, e;
	}, r.create = function(e) {
		var t = new r();
		return r.apply(t, e), t;
	}, r.prototype.size = function() {
		for (var e = [], t = 0, n = this._dimensions.length; t < n; t++) {
			var r = this._dimensions[t];
			e[t] = isString(r) || isNumber(r) ? 1 : r.size()[0];
		}
		return e;
	}, r.prototype.max = function() {
		for (var e = [], t = 0, n = this._dimensions.length; t < n; t++) {
			var r = this._dimensions[t];
			e[t] = isString(r) || isNumber(r) ? r : r.max();
		}
		return e;
	}, r.prototype.min = function() {
		for (var e = [], t = 0, n = this._dimensions.length; t < n; t++) {
			var r = this._dimensions[t];
			e[t] = isString(r) || isNumber(r) ? r : r.min();
		}
		return e;
	}, r.prototype.forEach = function(e) {
		for (var t = 0, n = this._dimensions.length; t < n; t++) e(this._dimensions[t], t, this);
	}, r.prototype.dimension = function(e) {
		var t;
		return isNumber(e) ? this._dimensions[e] ?? null : null;
	}, r.prototype.isObjectProperty = function() {
		return this._dimensions.length === 1 && isString(this._dimensions[0]);
	}, r.prototype.getObjectProperty = function() {
		return this.isObjectProperty() ? this._dimensions[0] : null;
	}, r.prototype.isScalar = function() {
		return this._isScalar;
	}, r.prototype.toArray = function() {
		for (var e = [], t = 0, n = this._dimensions.length; t < n; t++) {
			var r = this._dimensions[t];
			e.push(isString(r) || isNumber(r) ? r : r.toArray());
		}
		return e;
	}, r.prototype.valueOf = r.prototype.toArray, r.prototype.toString = function() {
		for (var e = [], t = 0, n = this._dimensions.length; t < n; t++) {
			var r = this._dimensions[t];
			isString(r) ? e.push(JSON.stringify(r)) : e.push(r.toString());
		}
		return "[" + e.join(", ") + "]";
	}, r.prototype.toJSON = function() {
		return {
			mathjs: "Index",
			dimensions: this._dimensions
		};
	}, r.fromJSON = function(e) {
		return r.create(e.dimensions);
	}, r;
}, { isClass: !0 });
function _booleansArrayToNumbersForIndex(e) {
	var t = [];
	return e.forEach((e, n) => {
		e && t.push(n);
	}), t;
}
//#endregion
//#region node_modules/mathjs/lib/esm/function/trigonometry/acos.js
var name$11 = "acos", dependencies$11 = [
	"typed",
	"config",
	"Complex"
], createAcos = /* @__PURE__ */ factory(name$11, dependencies$11, (e) => {
	var { typed: t, config: n, Complex: r } = e;
	return t(name$11, {
		number: function(e) {
			return e >= -1 && e <= 1 || n.predictable ? Math.acos(e) : new r(e, 0).acos();
		},
		Complex: function(e) {
			return e.acos();
		},
		BigNumber: function(e) {
			return e.acos();
		}
	});
}), name$10 = "atan", dependencies$10 = ["typed"], createAtan = /* @__PURE__ */ factory(name$10, dependencies$10, (e) => {
	var { typed: t } = e;
	return t("atan", {
		number: function(e) {
			return Math.atan(e);
		},
		Complex: function(e) {
			return e.atan();
		},
		BigNumber: function(e) {
			return e.atan();
		}
	});
}), createTrigUnit = /* @__PURE__ */ factory("trigUnit", ["typed"], (e) => {
	var { typed: t } = e;
	return { Unit: t.referToSelf((e) => (n) => {
		if (!n.hasBase(n.constructor.BASE_UNITS.ANGLE)) throw TypeError("Unit in function cot is no angle");
		return t.find(e, n.valueType())(n.value);
	}) };
}), name$9 = "cos", dependencies$9 = ["typed"], createCos = /* @__PURE__ */ factory(name$9, dependencies$9, (e) => {
	var { typed: t } = e, n = createTrigUnit({ typed: t });
	return t(name$9, {
		number: Math.cos,
		"Complex | BigNumber": (e) => e.cos()
	}, n);
}), name$8 = "sin", dependencies$8 = ["typed"], createSin = /* @__PURE__ */ factory(name$8, dependencies$8, (e) => {
	var { typed: t } = e, n = createTrigUnit({ typed: t });
	return t(name$8, {
		number: Math.sin,
		"Complex | BigNumber": (e) => e.sin()
	}, n);
}), name$7 = "add", dependencies$7 = [
	"typed",
	"matrix",
	"addScalar",
	"equalScalar",
	"DenseMatrix",
	"SparseMatrix",
	"concat"
], createAdd = /* @__PURE__ */ factory(name$7, dependencies$7, (e) => {
	var { typed: t, matrix: n, addScalar: r, equalScalar: i, DenseMatrix: a, SparseMatrix: o, concat: s } = e, c = createMatAlgo01xDSid({ typed: t }), l = createMatAlgo04xSidSid({
		typed: t,
		equalScalar: i
	}), u = createMatAlgo10xSids({
		typed: t,
		DenseMatrix: a
	}), d = createMatrixAlgorithmSuite({
		typed: t,
		matrix: n,
		concat: s
	});
	return t(name$7, {
		"any, any": r,
		"any, any, ...any": t.referToSelf((e) => (t, n, r) => {
			for (var i = e(t, n), a = 0; a < r.length; a++) i = e(i, r[a]);
			return i;
		})
	}, d({
		elop: r,
		DS: c,
		SS: l,
		Ss: u
	}));
}), name$6 = "norm", dependencies$6 = [
	"typed",
	"abs",
	"add",
	"pow",
	"conj",
	"sqrt",
	"multiply",
	"equalScalar",
	"larger",
	"smaller",
	"matrix",
	"ctranspose",
	"eigs"
], createNorm = /* @__PURE__ */ factory(name$6, dependencies$6, (e) => {
	var { typed: t, abs: n, add: r, pow: i, conj: a, sqrt: o, multiply: s, equalScalar: c, larger: l, smaller: u, matrix: d, ctranspose: f, eigs: p } = e;
	return t(name$6, {
		number: Math.abs,
		Complex: function(e) {
			return e.abs();
		},
		BigNumber: function(e) {
			return e.abs();
		},
		boolean: function(e) {
			return Math.abs(e);
		},
		Array: function(e) {
			return w(d(e), 2);
		},
		Matrix: function(e) {
			return w(e, 2);
		},
		"Array, number | BigNumber | string": function(e, t) {
			return w(d(e), t);
		},
		"Matrix, number | BigNumber | string": function(e, t) {
			return w(e, t);
		}
	});
	function m(e) {
		var t = 0;
		return e.forEach(function(e) {
			var r = n(e);
			l(r, t) && (t = r);
		}, !0), t;
	}
	function h(e) {
		var t;
		return e.forEach(function(e) {
			var r = n(e);
			(!t || u(r, t)) && (t = r);
		}, !0), t || 0;
	}
	function g(e, t) {
		if (t === Infinity || t === "inf") return m(e);
		if (t === -Infinity || t === "-inf") return h(e);
		if (t === "fro") return w(e, 2);
		if (typeof t == "number" && !isNaN(t)) {
			if (!c(t, 0)) {
				var a = 0;
				return e.forEach(function(e) {
					a = r(i(n(e), t), a);
				}, !0), i(a, 1 / t);
			}
			return Infinity;
		}
		throw Error("Unsupported parameter value");
	}
	function _(e) {
		var t = 0;
		return e.forEach(function(e, n) {
			t = r(t, s(e, a(e)));
		}), n(o(t));
	}
	function v(e) {
		var t = [], i = 0;
		return e.forEach(function(e, a) {
			var o = a[1], s = r(t[o] || 0, n(e));
			l(s, i) && (i = s), t[o] = s;
		}, !0), i;
	}
	function y(e) {
		var t = e.size();
		if (t[0] !== t[1]) throw RangeError("Invalid matrix dimensions");
		var r = p(s(f(e), e)).values.toArray(), i = r[r.length - 1];
		return n(o(i));
	}
	function b(e) {
		var t = [], i = 0;
		return e.forEach(function(e, a) {
			var o = a[0], s = r(t[o] || 0, n(e));
			l(s, i) && (i = s), t[o] = s;
		}, !0), i;
	}
	function x(e, t) {
		if (t === 1) return v(e);
		if (t === Infinity || t === "inf") return b(e);
		if (t === "fro") return _(e);
		if (t === 2) return y(e);
		throw Error("Unsupported parameter value " + t);
	}
	function w(e, t) {
		var n = e.size();
		if (n.length === 1) return g(e, t);
		if (n.length === 2) {
			if (n[0] && n[1]) return x(e, t);
			throw RangeError("Invalid matrix dimensions");
		}
	}
}), name$5 = "dot", dependencies$5 = [
	"typed",
	"addScalar",
	"multiplyScalar",
	"conj",
	"size"
], createDot = /* @__PURE__ */ factory(name$5, dependencies$5, (e) => {
	var { typed: t, addScalar: n, multiplyScalar: r, conj: i, size: a } = e;
	return t(name$5, {
		"Array | DenseMatrix, Array | DenseMatrix": s,
		"SparseMatrix, SparseMatrix": c
	});
	function o(e, t) {
		var n = a(e), r = a(t), i, o;
		if (n.length === 1) i = n[0];
		else if (n.length === 2 && n[1] === 1) i = n[0];
		else throw RangeError("Expected a column vector, instead got a matrix of size (" + n.join(", ") + ")");
		if (r.length === 1) o = r[0];
		else if (r.length === 2 && r[1] === 1) o = r[0];
		else throw RangeError("Expected a column vector, instead got a matrix of size (" + r.join(", ") + ")");
		if (i !== o) throw RangeError("Vectors must have equal length (" + i + " != " + o + ")");
		if (i === 0) throw RangeError("Cannot calculate the dot product of empty vectors");
		return i;
	}
	function s(e, s) {
		var c = o(e, s), l = isMatrix(e) ? e._data : e, u = isMatrix(e) ? e._datatype || e.getDataType() : void 0, d = isMatrix(s) ? s._data : s, f = isMatrix(s) ? s._datatype || s.getDataType() : void 0, p = a(e).length === 2, m = a(s).length === 2, h = n, g = r;
		if (u && f && u === f && typeof u == "string" && u !== "mixed") {
			var _ = u;
			h = t.find(n, [_, _]), g = t.find(r, [_, _]);
		}
		if (!p && !m) {
			for (var v = g(i(l[0]), d[0]), y = 1; y < c; y++) v = h(v, g(i(l[y]), d[y]));
			return v;
		}
		if (!p && m) {
			for (var b = g(i(l[0]), d[0][0]), x = 1; x < c; x++) b = h(b, g(i(l[x]), d[x][0]));
			return b;
		}
		if (p && !m) {
			for (var w = g(i(l[0][0]), d[0]), T = 1; T < c; T++) w = h(w, g(i(l[T][0]), d[T]));
			return w;
		}
		if (p && m) {
			for (var E = g(i(l[0][0]), d[0][0]), k = 1; k < c; k++) E = h(E, g(i(l[k][0]), d[k][0]));
			return E;
		}
	}
	function c(e, t) {
		o(e, t);
		for (var i = e._index, a = e._values, s = t._index, c = t._values, l = 0, u = n, d = r, f = 0, p = 0; f < i.length && p < s.length;) {
			var m = i[f], h = s[p];
			if (m < h) {
				f++;
				continue;
			}
			if (m > h) {
				p++;
				continue;
			}
			m === h && (l = u(l, d(a[f], c[p])), f++, p++);
		}
		return l;
	}
}), name$4 = "qr", dependencies$4 = [
	"typed",
	"matrix",
	"zeros",
	"identity",
	"isZero",
	"equal",
	"sign",
	"sqrt",
	"conj",
	"unaryMinus",
	"addScalar",
	"divideScalar",
	"multiplyScalar",
	"subtractScalar",
	"complex"
], createQr = /* @__PURE__ */ factory(name$4, dependencies$4, (e) => {
	var { typed: t, matrix: n, zeros: r, identity: i, isZero: a, equal: o, sign: s, sqrt: c, conj: l, unaryMinus: u, addScalar: d, divideScalar: f, multiplyScalar: p, subtractScalar: m, complex: h } = e;
	return _extends(t(name$4, {
		DenseMatrix: function(e) {
			return _(e);
		},
		SparseMatrix: function(e) {
			return v(e);
		},
		Array: function(e) {
			var t = _(n(e));
			return {
				Q: t.Q.valueOf(),
				R: t.R.valueOf()
			};
		}
	}), { _denseQRimpl: g });
	function g(e) {
		var t = e._size[0], n = e._size[1], h = i([t], "dense"), g = h._data, _ = e.clone(), v = _._data, y, b, x, w = r([t], "");
		for (x = 0; x < Math.min(n, t); ++x) {
			var T = v[x][x], E = u(o(T, 0) ? 1 : s(T)), k = l(E), A = 0;
			for (y = x; y < t; y++) A = d(A, p(v[y][x], l(v[y][x])));
			var j = p(E, c(A));
			if (!a(j)) {
				var M = m(T, j);
				for (w[x] = 1, y = x + 1; y < t; y++) w[y] = f(v[y][x], M);
				var L = u(l(f(M, j))), R = void 0;
				for (b = x; b < n; b++) {
					for (R = 0, y = x; y < t; y++) R = d(R, p(l(w[y]), v[y][b]));
					for (R = p(R, L), y = x; y < t; y++) v[y][b] = p(m(v[y][b], p(w[y], R)), k);
				}
				for (y = 0; y < t; y++) {
					for (R = 0, b = x; b < t; b++) R = d(R, p(g[y][b], w[b]));
					for (R = p(R, L), b = x; b < t; ++b) g[y][b] = f(m(g[y][b], p(R, l(w[b]))), k);
				}
			}
		}
		return {
			Q: h,
			R: _,
			toString: function() {
				return "Q: " + this.Q.toString() + "\nR: " + this.R.toString();
			}
		};
	}
	function _(e) {
		var t = g(e), n = t.R._data;
		if (e._data.length > 0) for (var r = n[0][0].type === "Complex" ? h(0) : 0, i = 0; i < n.length; ++i) for (var a = 0; a < i && a < (n[0] || []).length; ++a) n[i][a] = r;
		return t;
	}
	function v(e) {
		throw Error("qr not implemented for sparse matrices yet");
	}
}), name$3 = "det", dependencies$3 = [
	"typed",
	"matrix",
	"subtractScalar",
	"multiply",
	"divideScalar",
	"isZero",
	"unaryMinus"
], createDet = /* @__PURE__ */ factory(name$3, dependencies$3, (e) => {
	var { typed: t, matrix: n, subtractScalar: r, multiply: i, divideScalar: a, isZero: o, unaryMinus: s } = e;
	return t(name$3, {
		any: function(e) {
			return clone$2(e);
		},
		"Array | Matrix": function(e) {
			var t;
			switch (isMatrix(e) ? t = e.size() : Array.isArray(e) ? (e = n(e), t = e.size()) : t = [], t.length) {
				case 0: return clone$2(e);
				case 1:
					if (t[0] === 1) return clone$2(e.valueOf()[0]);
					if (t[0] === 0) return 1;
					throw RangeError("Matrix must be square (size: " + format(t) + ")");
				case 2:
					var r = t[0], i = t[1];
					if (r === i) return c(e.clone().valueOf(), r, i);
					if (i === 0) return 1;
					throw RangeError("Matrix must be square (size: " + format(t) + ")");
				default: throw RangeError("Matrix must be two dimensional (size: " + format(t) + ")");
			}
		}
	});
	function c(e, t, n) {
		if (t === 1) return clone$2(e[0][0]);
		if (t === 2) return r(i(e[0][0], e[1][1]), i(e[1][0], e[0][1]));
		for (var c = !1, l = Array(t).fill(0).map((e, t) => t), u = 0; u < t; u++) {
			var d = l[u];
			if (o(e[d][u])) {
				var f = void 0;
				for (f = u + 1; f < t; f++) if (!o(e[l[f]][u])) {
					d = l[f], l[f] = l[u], l[u] = d, c = !c;
					break;
				}
				if (f === t) return e[d][u];
			}
			for (var p = e[d][u], m = u === 0 ? 1 : e[l[u - 1]][u - 1], h = u + 1; h < t; h++) for (var g = l[h], _ = u + 1; _ < t; _++) e[g][_] = a(r(i(e[g][_], p), i(e[g][u], e[d][_])), m);
		}
		var v = e[l[t - 1]][t - 1];
		return c ? s(v) : v;
	}
}), name$2 = "inv", dependencies$2 = [
	"typed",
	"matrix",
	"divideScalar",
	"addScalar",
	"multiply",
	"unaryMinus",
	"det",
	"identity",
	"abs"
], createInv = /* @__PURE__ */ factory(name$2, dependencies$2, (e) => {
	var { typed: t, matrix: n, divideScalar: r, addScalar: i, multiply: a, unaryMinus: o, det: s, identity: c, abs: l } = e;
	return t(name$2, {
		"Array | Matrix": function(e) {
			var t = isMatrix(e) ? e.size() : arraySize(e);
			switch (t.length) {
				case 1:
					if (t[0] === 1) return isMatrix(e) ? n([r(1, e.valueOf()[0])]) : [r(1, e[0])];
					throw RangeError("Matrix must be square (size: " + format(t) + ")");
				case 2:
					var i = t[0], a = t[1];
					if (i === a) return isMatrix(e) ? n(u(e.valueOf(), i, a), e.storage()) : u(e, i, a);
					throw RangeError("Matrix must be square (size: " + format(t) + ")");
				default: throw RangeError("Matrix must be two dimensional (size: " + format(t) + ")");
			}
		},
		any: function(e) {
			return r(1, e);
		}
	});
	function u(e, t, n) {
		var u, d, f, p, m;
		if (t === 1) {
			if (p = e[0][0], p === 0) throw Error("Cannot calculate inverse, determinant is zero");
			return [[r(1, p)]];
		} else if (t === 2) {
			var h = s(e);
			if (h === 0) throw Error("Cannot calculate inverse, determinant is zero");
			return [[r(e[1][1], h), r(o(e[0][1]), h)], [r(o(e[1][0]), h), r(e[0][0], h)]];
		} else {
			var g = e.concat();
			for (u = 0; u < t; u++) g[u] = g[u].concat();
			for (var _ = c(t).valueOf(), v = 0; v < n; v++) {
				var y = l(g[v][v]), b = v;
				for (u = v + 1; u < t;) l(g[u][v]) > y && (y = l(g[u][v]), b = u), u++;
				if (y === 0) throw Error("Cannot calculate inverse, determinant is zero");
				u = b, u !== v && (m = g[v], g[v] = g[u], g[u] = m, m = _[v], _[v] = _[u], _[u] = m);
				var x = g[v], w = _[v];
				for (u = 0; u < t; u++) {
					var T = g[u], E = _[u];
					if (u !== v) {
						if (T[v] !== 0) {
							for (f = r(o(T[v]), x[v]), d = v; d < n; d++) T[d] = i(T[d], a(f, x[d]));
							for (d = 0; d < n; d++) E[d] = i(E[d], a(f, w[d]));
						}
					} else {
						for (f = x[v], d = v; d < n; d++) T[d] = r(T[d], f);
						for (d = 0; d < n; d++) E[d] = r(E[d], f);
					}
				}
			}
			return _;
		}
	}
});
//#endregion
//#region node_modules/mathjs/lib/esm/function/matrix/eigs/complexEigs.js
function createComplexEigs(e) {
	var { addScalar: t, subtract: n, flatten: r, multiply: i, multiplyScalar: a, divideScalar: o, sqrt: s, abs: c, bignumber: l, diag: u, size: d, reshape: f, inv: p, qr: m, usolve: h, usolveAll: g, equal: _, complex: v, larger: y, smaller: b, matrixFromColumns: x, dot: w } = e;
	function T(e, t, n, r) {
		var i = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, a = E(e, t, n, r, i);
		k(e, t, n, r, i, a);
		var { values: o, C: s } = A(e, t, n, r, i);
		return i ? {
			values: o,
			eigenvectors: j(e, t, s, a, o, n, r)
		} : { values: o };
	}
	function E(e, n, r, i, s) {
		var d = i === "BigNumber", f = i === "Complex", p = d ? l(0) : 0, m = d ? l(1) : f ? v(1) : 1, h = d ? l(1) : 1, g = d ? l(10) : 2, x = a(g, g), w;
		s && (w = Array(n).fill(m));
		for (var T = !1; !T;) {
			T = !0;
			for (var E = 0; E < n; E++) {
				for (var k = p, A = p, j = 0; j < n; j++) E !== j && (k = t(k, c(e[j][E])), A = t(A, c(e[E][j])));
				if (!_(k, 0) && !_(A, 0)) {
					for (var M = h, L = k, R = o(A, g), z = a(A, g); b(L, R);) L = a(L, x), M = a(M, g);
					for (; y(L, z);) L = o(L, x), M = o(M, g);
					if (b(o(t(L, A), M), a(t(k, A), .95))) {
						T = !1;
						for (var G = o(1, M), q = 0; q < n; q++) E !== q && (e[E][q] = a(e[E][q], G), e[q][E] = a(e[q][E], M));
						s && (w[E] = a(w[E], G));
					}
				}
			}
		}
		return s ? u(w) : null;
	}
	function k(e, r, i, s, u, d) {
		var f = s === "BigNumber", p = f ? l(0) : s === "Complex" ? v(0) : 0;
		f && (i = l(i));
		for (var m = 0; m < r - 2; m++) {
			for (var h = 0, g = p, _ = m + 1; _ < r; _++) {
				var y = e[_][m];
				b(c(g), c(y)) && (g = y, h = _);
			}
			if (!b(c(g), i)) {
				if (h !== m + 1) {
					var x = e[h];
					e[h] = e[m + 1], e[m + 1] = x;
					for (var w = 0; w < r; w++) {
						var T = e[w][h];
						e[w][h] = e[w][m + 1], e[w][m + 1] = T;
					}
					if (u) {
						var E = d[h];
						d[h] = d[m + 1], d[m + 1] = E;
					}
				}
				for (var k = m + 2; k < r; k++) {
					var A = o(e[k][m], g);
					if (A !== 0) {
						for (var j = 0; j < r; j++) e[k][j] = n(e[k][j], a(A, e[m + 1][j]));
						for (var M = 0; M < r; M++) e[M][m + 1] = t(e[M][m + 1], a(A, e[M][k]));
						if (u) for (var L = 0; L < r; L++) d[k][L] = n(d[k][L], a(A, d[m + 1][L]));
					}
				}
			}
		}
		return d;
	}
	function A(e, r, a, o, s) {
		var d = o === "BigNumber", f = d ? l(1) : o === "Complex" ? v(1) : 1;
		d && (a = l(a));
		for (var p = clone$2(e), h = [], g = r, _ = [], y = s ? u(Array(r).fill(f)) : void 0, x = s ? u(Array(g).fill(f)) : void 0, w = 0; w <= 100;) {
			w += 1;
			for (var T = p[g - 1][g - 1], E = 0; E < g; E++) p[E][E] = n(p[E][E], T);
			var { Q: k, R: A } = m(p);
			p = i(A, k);
			for (var j = 0; j < g; j++) p[j][j] = t(p[j][j], T);
			if (s && (x = i(x, k)), g === 1 || b(c(p[g - 1][g - 2]), a)) {
				w = 0, h.push(p[g - 1][g - 1]), s && (_.unshift([[1]]), R(x, r), y = i(y, x), g > 1 && (x = u(Array(g - 1).fill(f)))), --g, p.pop();
				for (var G = 0; G < g; G++) p[G].pop();
			} else if (g === 2 || b(c(p[g - 2][g - 3]), a)) {
				w = 0;
				var q = M(p[g - 2][g - 2], p[g - 2][g - 1], p[g - 1][g - 2], p[g - 1][g - 1]);
				h.push(...q), s && (_.unshift(L(p[g - 2][g - 2], p[g - 2][g - 1], p[g - 1][g - 2], p[g - 1][g - 1], q[0], q[1], a, o)), R(x, r), y = i(y, x), g > 2 && (x = u(Array(g - 2).fill(f)))), g -= 2, p.pop(), p.pop();
				for (var J = 0; J < g; J++) p[J].pop(), p[J].pop();
			}
			if (g === 0) break;
		}
		if (h.sort((e, t) => +n(c(e), c(t))), w > 100) {
			var Z = Error("The eigenvalues failed to converge. Only found these eigenvalues: " + h.join(", "));
			throw Z.values = h, Z.vectors = [], Z;
		}
		return {
			values: h,
			C: s ? i(y, z(_, r)) : void 0
		};
	}
	function j(e, t, a, o, s, c, d) {
		var f = i(p(a), e, a), m = d === "BigNumber", h = d === "Complex", y = m ? l(0) : h ? v(0) : 0, b = m ? l(1) : h ? v(1) : 1, x = [], w = [];
		for (var T of s) {
			var E = G(x, T, _);
			E === -1 ? (x.push(T), w.push(1)) : w[E] += 1;
		}
		for (var k = [], A = x.length, j = Array(t).fill(y), M = u(Array(t).fill(b)), L = function() {
			var e = x[R], s = n(f, i(e, M)), l = g(s, j);
			for (l.shift(); l.length < w[R];) {
				var u = q(s, t, l, c, d);
				if (u === null) break;
				l.push(u);
			}
			var m = i(p(o), a);
			l = l.map((e) => i(m, e)), k.push(...l.map((t) => ({
				value: e,
				vector: r(t)
			})));
		}, R = 0; R < A; R++) L();
		return k;
	}
	function M(e, r, i, o) {
		var c = t(e, o), l = n(a(e, o), a(r, i)), u = a(c, .5), d = a(s(n(a(c, c), a(4, l))), .5);
		return [t(u, d), n(u, d)];
	}
	function L(e, t, r, i, a, o, s, u) {
		var d = u === "BigNumber", f = u === "Complex", p = d ? l(0) : f ? v(0) : 0, m = d ? l(1) : f ? v(1) : 1;
		if (b(c(r), s)) return [[m, p], [p, m]];
		if (y(c(n(a, o)), s)) return [[n(a, i), n(o, i)], [r, r]];
		var h = n(e, a), g = n(i, a);
		return b(c(t), s) && b(c(g), s) ? [[h, m], [r, p]] : [[t, p], [g, m]];
	}
	function R(e, t) {
		for (var n = 0; n < e.length; n++) e[n].push(...Array(t - e[n].length).fill(0));
		for (var r = e.length; r < t; r++) e.push(Array(t).fill(0)), e[r][r] = 1;
		return e;
	}
	function z(e, t) {
		for (var n = [], r = 0; r < t; r++) n[r] = Array(t).fill(0);
		var i = 0;
		for (var a of e) {
			for (var o = a.length, s = 0; s < o; s++) for (var c = 0; c < o; c++) n[i + s][i + c] = a[s][c];
			i += o;
		}
		return n;
	}
	function G(e, t, n) {
		for (var r = 0; r < e.length; r++) if (n(e[r], t)) return r;
		return -1;
	}
	function q(e, t, n, r, i) {
		for (var a = i === "BigNumber" ? l(1e3) : 1e3, o, s = 0; s < 5; ++s) {
			o = J(t, n, i);
			try {
				o = h(e, o);
			} catch {
				continue;
			}
			if (y(Q(o), a)) break;
		}
		if (s >= 5) return null;
		for (s = 0;;) {
			var c = h(e, o);
			if (b(Q(Z(o, [c])), r)) break;
			if (++s >= 10) return null;
			o = ee(c);
		}
		return o;
	}
	function J(e, t, n) {
		var r = n === "BigNumber", i = n === "Complex", a = Array(e).fill(0).map((e) => 2 * Math.random() - 1);
		return r && (a = a.map((e) => l(e))), i && (a = a.map((e) => v(e))), a = Z(a, t), ee(a, n);
	}
	function Z(e, t) {
		var r = d(e);
		for (var a of t) a = f(a, r), e = n(e, i(o(w(a, e), w(a, a)), a));
		return e;
	}
	function Q(e) {
		return c(s(w(e, e)));
	}
	function ee(e, t) {
		return i(o(t === "BigNumber" ? l(1) : t === "Complex" ? v(1) : 1, Q(e)), e);
	}
	return T;
}
//#endregion
//#region node_modules/mathjs/lib/esm/function/matrix/eigs/realSymmetric.js
function createRealSymmetric(e) {
	var { config: t, addScalar: n, subtract: r, abs: i, atan: a, cos: o, sin: s, multiplyScalar: c, inv: l, bignumber: u, multiply: d, add: f } = e;
	function p(e, n) {
		var r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : t.relTol, i = arguments.length > 3 ? arguments[3] : void 0, a = arguments.length > 4 ? arguments[4] : void 0;
		if (i === "number") return m(e, r, a);
		if (i === "BigNumber") return h(e, r, a);
		throw TypeError("Unsupported data type: " + i);
	}
	function m(e, t, n) {
		var r = e.length, i = Math.abs(t / r), a, o;
		if (n) {
			o = Array(r);
			for (var s = 0; s < r; s++) o[s] = Array(r).fill(0), o[s][s] = 1;
		}
		for (var c = w(e); Math.abs(c[1]) >= Math.abs(i);) {
			var l = c[0][0], u = c[0][1];
			a = g(e[l][l], e[u][u], e[l][u]), e = x(e, a, l, u), n && (o = v(o, a, l, u)), c = w(e);
		}
		for (var d = Array(r).fill(0), f = 0; f < r; f++) d[f] = e[f][f];
		return E(clone$2(d), o, n);
	}
	function h(e, t, n) {
		var r = e.length, a = i(t / r), o, s;
		if (n) {
			s = Array(r);
			for (var c = 0; c < r; c++) s[c] = Array(r).fill(0), s[c][c] = 1;
		}
		for (var l = T(e); i(l[1]) >= i(a);) {
			var u = l[0][0], d = l[0][1];
			o = _(e[u][u], e[d][d], e[u][d]), e = b(e, o, u, d), n && (s = y(s, o, u, d)), l = T(e);
		}
		for (var f = Array(r).fill(0), p = 0; p < r; p++) f[p] = e[p][p];
		return E(clone$2(f), s, n);
	}
	function g(e, n, r) {
		var i = n - e;
		return Math.abs(i) <= t.relTol ? Math.PI / 4 : .5 * Math.atan(2 * r / (n - e));
	}
	function _(e, n, o) {
		var s = r(n, e);
		return i(s) <= t.relTol ? u(-1).acos().div(4) : c(.5, a(d(2, o, l(s))));
	}
	function v(e, t, n, r) {
		for (var i = e.length, a = Math.cos(t), o = Math.sin(t), s = Array(i).fill(0), c = Array(i).fill(0), l = 0; l < i; l++) s[l] = a * e[l][n] - o * e[l][r], c[l] = o * e[l][n] + a * e[l][r];
		for (var u = 0; u < i; u++) e[u][n] = s[u], e[u][r] = c[u];
		return e;
	}
	function y(e, t, i, a) {
		for (var l = e.length, d = o(t), f = s(t), p = Array(l).fill(u(0)), m = Array(l).fill(u(0)), h = 0; h < l; h++) p[h] = r(c(d, e[h][i]), c(f, e[h][a])), m[h] = n(c(f, e[h][i]), c(d, e[h][a]));
		for (var g = 0; g < l; g++) e[g][i] = p[g], e[g][a] = m[g];
		return e;
	}
	function b(e, t, i, a) {
		for (var l = e.length, p = u(o(t)), m = u(s(t)), h = c(p, p), g = c(m, m), _ = Array(l).fill(u(0)), v = Array(l).fill(u(0)), y = d(u(2), p, m, e[i][a]), b = n(r(c(h, e[i][i]), y), c(g, e[a][a])), x = f(c(g, e[i][i]), y, c(h, e[a][a])), w = 0; w < l; w++) _[w] = r(c(p, e[i][w]), c(m, e[a][w])), v[w] = n(c(m, e[i][w]), c(p, e[a][w]));
		e[i][i] = b, e[a][a] = x, e[i][a] = u(0), e[a][i] = u(0);
		for (var T = 0; T < l; T++) T !== i && T !== a && (e[i][T] = _[T], e[T][i] = _[T], e[a][T] = v[T], e[T][a] = v[T]);
		return e;
	}
	function x(e, t, n, r) {
		for (var i = e.length, a = Math.cos(t), o = Math.sin(t), s = a * a, c = o * o, l = Array(i).fill(0), u = Array(i).fill(0), d = s * e[n][n] - 2 * a * o * e[n][r] + c * e[r][r], f = c * e[n][n] + 2 * a * o * e[n][r] + s * e[r][r], p = 0; p < i; p++) l[p] = a * e[n][p] - o * e[r][p], u[p] = o * e[n][p] + a * e[r][p];
		e[n][n] = d, e[r][r] = f, e[n][r] = 0, e[r][n] = 0;
		for (var m = 0; m < i; m++) m !== n && m !== r && (e[n][m] = l[m], e[m][n] = l[m], e[r][m] = u[m], e[m][r] = u[m]);
		return e;
	}
	function w(e) {
		for (var t = e.length, n = 0, r = [0, 1], i = 0; i < t; i++) for (var a = i + 1; a < t; a++) Math.abs(n) < Math.abs(e[i][a]) && (n = Math.abs(e[i][a]), r = [i, a]);
		return [r, n];
	}
	function T(e) {
		for (var t = e.length, n = 0, r = [0, 1], a = 0; a < t; a++) for (var o = a + 1; o < t; o++) i(n) < i(e[a][o]) && (n = i(e[a][o]), r = [a, o]);
		return [r, n];
	}
	function E(e, t, n) {
		var r = e.length, a = Array(r), o;
		if (n) {
			o = Array(r);
			for (var s = 0; s < r; s++) o[s] = Array(r);
		}
		for (var c = 0; c < r; c++) {
			for (var l = 0, u = e[0], d = 0; d < e.length; d++) i(e[d]) < i(u) && (l = d, u = e[l]);
			if (a[c] = e.splice(l, 1)[0], n) for (var f = 0; f < r; f++) o[c][f] = t[f][l], t[f].splice(l, 1);
		}
		return n ? {
			values: a,
			eigenvectors: o.map((e, t) => ({
				value: a[t],
				vector: e
			}))
		} : { values: a };
	}
	return p;
}
//#endregion
//#region node_modules/mathjs/lib/esm/function/matrix/eigs.js
var name$1 = "eigs", dependencies$1 = /* @__PURE__ */ "config.typed.matrix.addScalar.equal.subtract.abs.atan.cos.sin.multiplyScalar.divideScalar.inv.bignumber.multiply.add.larger.column.flatten.number.complex.sqrt.diag.size.reshape.qr.usolve.usolveAll.im.re.smaller.matrixFromColumns.dot".split("."), createEigs = /* @__PURE__ */ factory(name$1, dependencies$1, (e) => {
	var { config: t, typed: n, matrix: r, addScalar: i, subtract: a, equal: o, abs: s, atan: c, cos: l, sin: u, multiplyScalar: d, divideScalar: f, inv: p, bignumber: m, multiply: h, add: g, larger: _, column: v, flatten: y, number: b, complex: x, sqrt: w, diag: T, size: E, reshape: k, qr: A, usolve: j, usolveAll: M, im: L, re: R, smaller: z, matrixFromColumns: G, dot: q } = e, J = createRealSymmetric({
		config: t,
		addScalar: i,
		subtract: a,
		column: v,
		flatten: y,
		equal: o,
		abs: s,
		atan: c,
		cos: l,
		sin: u,
		multiplyScalar: d,
		inv: p,
		bignumber: m,
		complex: x,
		multiply: h,
		add: g
	}), Z = createComplexEigs({
		config: t,
		addScalar: i,
		subtract: a,
		multiply: h,
		multiplyScalar: d,
		flatten: y,
		divideScalar: f,
		sqrt: w,
		abs: s,
		bignumber: m,
		diag: T,
		size: E,
		reshape: k,
		qr: A,
		inv: p,
		usolve: j,
		usolveAll: M,
		equal: o,
		complex: x,
		larger: _,
		smaller: z,
		matrixFromColumns: G,
		dot: q
	});
	return n("eigs", {
		Array: function(e) {
			return Q(r(e));
		},
		"Array, number|BigNumber": function(e, t) {
			return Q(r(e), { precision: t });
		},
		"Array, Object"(e, t) {
			return Q(r(e), t);
		},
		Matrix: function(e) {
			return Q(e, { matricize: !0 });
		},
		"Matrix, number|BigNumber": function(e, t) {
			return Q(e, {
				precision: t,
				matricize: !0
			});
		},
		"Matrix, Object": function(e, t) {
			var n = { matricize: !0 };
			return _extends(n, t), Q(e, n);
		}
	});
	function Q(e) {
		var n, i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, a = "eigenvectors" in i ? i.eigenvectors : !0, o = ee(e, i.precision ?? t.relTol, a);
		return i.matricize && (o.values = r(o.values), a && (o.eigenvectors = o.eigenvectors.map((e) => {
			var { value: t, vector: n } = e;
			return {
				value: t,
				vector: r(n)
			};
		}))), a && Object.defineProperty(o, "vectors", {
			enumerable: !1,
			get: () => {
				throw Error("eigs(M).vectors replaced with eigs(M).eigenvectors");
			}
		}), o;
	}
	function ee(e, t, n) {
		var r = e.toArray(), i = e.size();
		if (i.length !== 2 || i[0] !== i[1]) throw RangeError(`Matrix must be square (size: ${format(i)})`);
		var a = i[0];
		return $(r, a, t) && (ne(r, a), te(r, a, t)) ? J(r, a, t, ie(e, r, a), n) : Z(r, a, t, ie(e, r, a), n);
	}
	function te(e, t, n) {
		for (var r = 0; r < t; r++) for (var i = r; i < t; i++) if (_(m(s(a(e[r][i], e[i][r]))), n)) return !1;
		return !0;
	}
	function $(e, t, n) {
		for (var r = 0; r < t; r++) for (var i = 0; i < t; i++) if (_(m(s(L(e[r][i]))), n)) return !1;
		return !0;
	}
	function ne(e, t) {
		for (var n = 0; n < t; n++) for (var r = 0; r < t; r++) e[n][r] = R(e[n][r]);
	}
	function ie(e, t, n) {
		var r = e.datatype();
		if (r === "number" || r === "BigNumber" || r === "Complex") return r;
		for (var i = !1, a = !1, o = !1, s = 0; s < n; s++) for (var c = 0; c < n; c++) {
			var l = t[s][c];
			if (isNumber(l) || isFraction(l)) i = !0;
			else if (isBigNumber(l)) a = !0;
			else if (isComplex(l)) o = !0;
			else throw TypeError("Unsupported type in Matrix: " + typeOf(l));
		}
		if (a && o && console.warn("Complex BigNumbers not supported, this operation will lose precission."), o) {
			for (var u = 0; u < n; u++) for (var d = 0; d < n; d++) t[u][d] = x(t[u][d]);
			return "Complex";
		}
		if (a) {
			for (var f = 0; f < n; f++) for (var p = 0; p < n; p++) t[f][p] = m(t[f][p]);
			return "BigNumber";
		}
		if (i) {
			for (var h = 0; h < n; h++) for (var g = 0; g < n; g++) t[h][g] = b(t[h][g]);
			return "number";
		} else throw TypeError("Matrix contains unsupported types only.");
	}
}), name = "divide", dependencies = [
	"typed",
	"matrix",
	"multiply",
	"equalScalar",
	"divideScalar",
	"inv"
], createDivide = /* @__PURE__ */ factory(name, dependencies, (e) => {
	var { typed: t, matrix: n, multiply: r, equalScalar: i, divideScalar: a, inv: o } = e, s = createMatAlgo11xS0s({
		typed: t,
		equalScalar: i
	}), c = createMatAlgo14xDs({ typed: t });
	return t("divide", extend({
		"Array | Matrix, Array | Matrix": function(e, t) {
			return r(e, o(t));
		},
		"DenseMatrix, any": function(e, t) {
			return c(e, t, a, !1);
		},
		"SparseMatrix, any": function(e, t) {
			return s(e, t, a, !1);
		},
		"Array, any": function(e, t) {
			return c(n(e), t, a, !1).valueOf();
		},
		"any, Array | Matrix": function(e, t) {
			return r(e, o(t));
		}
	}, a.signatures));
}), BigNumber = /* @__PURE__ */ createBigNumberClass({ config: config$1 }), Complex = /* @__PURE__ */ createComplexClass({}), Fraction = /* @__PURE__ */ createFractionClass({}), Matrix = /* @__PURE__ */ createMatrixClass({}), DenseMatrix = /* @__PURE__ */ createDenseMatrixClass({
	Matrix,
	config: config$1
}), typed = /* @__PURE__ */ createTyped({
	BigNumber,
	Complex,
	DenseMatrix,
	Fraction
}), abs = /* @__PURE__ */ createAbs({ typed }), acos = /* @__PURE__ */ createAcos({
	Complex,
	config: config$1,
	typed
}), addScalar = /* @__PURE__ */ createAddScalar({ typed }), atan = /* @__PURE__ */ createAtan({ typed }), complex = /* @__PURE__ */ createComplex({
	Complex,
	typed
}), conj = /* @__PURE__ */ createConj({ typed }), cos = /* @__PURE__ */ createCos({ typed }), equalScalar = /* @__PURE__ */ createEqualScalar({
	config: config$1,
	typed
}), flatten = /* @__PURE__ */ createFlatten({ typed }), getMatrixDataType = /* @__PURE__ */ createGetMatrixDataType({ typed }), im = /* @__PURE__ */ createIm({ typed }), multiplyScalar = /* @__PURE__ */ createMultiplyScalar({ typed }), number = /* @__PURE__ */ createNumber({ typed }), re = /* @__PURE__ */ createRe({ typed }), sign = /* @__PURE__ */ createSign({
	BigNumber,
	Fraction,
	complex,
	typed
}), sin = /* @__PURE__ */ createSin({ typed }), size = /* @__PURE__ */ createSize({ typed }), SparseMatrix = /* @__PURE__ */ createSparseMatrixClass({
	Matrix,
	equalScalar,
	typed
}), subtractScalar = /* @__PURE__ */ createSubtractScalar({ typed }), bignumber = /* @__PURE__ */ createBignumber({
	BigNumber,
	typed
}), dot = /* @__PURE__ */ createDot({
	addScalar,
	conj,
	multiplyScalar,
	size,
	typed
}), isZero = /* @__PURE__ */ createIsZero({
	equalScalar,
	typed
}), matrix = /* @__PURE__ */ createMatrix({
	DenseMatrix,
	Matrix,
	SparseMatrix,
	typed
}), multiply = /* @__PURE__ */ createMultiply({
	addScalar,
	dot,
	equalScalar,
	matrix,
	multiplyScalar,
	typed
}), sqrt = /* @__PURE__ */ createSqrt({
	Complex,
	config: config$1,
	typed
}), transpose = /* @__PURE__ */ createTranspose({
	matrix,
	typed
}), zeros = /* @__PURE__ */ createZeros({
	BigNumber,
	config: config$1,
	matrix,
	typed
}), ctranspose = /* @__PURE__ */ createCtranspose({
	conj,
	transpose,
	typed
}), diag = /* @__PURE__ */ createDiag({
	DenseMatrix,
	SparseMatrix,
	matrix,
	typed
}), equal = /* @__PURE__ */ createEqual({
	DenseMatrix,
	SparseMatrix,
	equalScalar,
	matrix,
	typed
}), fraction = /* @__PURE__ */ createFraction({
	Fraction,
	typed
}), identity = /* @__PURE__ */ createIdentity({
	BigNumber,
	DenseMatrix,
	SparseMatrix,
	config: config$1,
	matrix,
	typed
}), isInteger = /* @__PURE__ */ createIsInteger({
	equal,
	typed
}), matrixFromColumns = /* @__PURE__ */ createMatrixFromColumns({
	flatten,
	matrix,
	size,
	typed
}), numeric = /* @__PURE__ */ createNumeric({
	bignumber,
	fraction,
	number
}), reshape = /* @__PURE__ */ createReshape({
	isInteger,
	matrix,
	typed
}), unaryMinus = /* @__PURE__ */ createUnaryMinus({ typed }), concat = /* @__PURE__ */ createConcat({
	isInteger,
	matrix,
	typed
}), divideScalar = /* @__PURE__ */ createDivideScalar({
	numeric,
	typed
}), isPositive = /* @__PURE__ */ createIsPositive({
	config: config$1,
	typed
}), larger = /* @__PURE__ */ createLarger({
	DenseMatrix,
	SparseMatrix,
	bignumber,
	concat,
	config: config$1,
	matrix,
	typed
}), qr = /* @__PURE__ */ createQr({
	addScalar,
	complex,
	conj,
	divideScalar,
	equal,
	identity,
	isZero,
	matrix,
	multiplyScalar,
	sign,
	sqrt,
	subtractScalar,
	typed,
	unaryMinus,
	zeros
}), smaller = /* @__PURE__ */ createSmaller({
	DenseMatrix,
	SparseMatrix,
	bignumber,
	concat,
	config: config$1,
	matrix,
	typed
}), subtract = /* @__PURE__ */ createSubtract({
	DenseMatrix,
	concat,
	equalScalar,
	matrix,
	subtractScalar,
	typed,
	unaryMinus
}), usolve = /* @__PURE__ */ createUsolve({
	DenseMatrix,
	divideScalar,
	equalScalar,
	matrix,
	multiplyScalar,
	subtractScalar,
	typed
}), add = /* @__PURE__ */ createAdd({
	DenseMatrix,
	SparseMatrix,
	addScalar,
	concat,
	equalScalar,
	matrix,
	typed
}), cross$1 = /* @__PURE__ */ createCross({
	matrix,
	multiply,
	subtract,
	typed
}), det = /* @__PURE__ */ createDet({
	divideScalar,
	isZero,
	matrix,
	multiply,
	subtractScalar,
	typed,
	unaryMinus
}), ImmutableDenseMatrix = /* @__PURE__ */ createImmutableDenseMatrixClass({
	DenseMatrix,
	smaller
}), Index = /* @__PURE__ */ createIndexClass({
	ImmutableDenseMatrix,
	getMatrixDataType
}), largerEq = /* @__PURE__ */ createLargerEq({
	DenseMatrix,
	SparseMatrix,
	concat,
	config: config$1,
	matrix,
	typed
}), usolveAll = /* @__PURE__ */ createUsolveAll({
	DenseMatrix,
	divideScalar,
	equalScalar,
	matrix,
	multiplyScalar,
	subtractScalar,
	typed
}), inv = /* @__PURE__ */ createInv({
	abs,
	addScalar,
	det,
	divideScalar,
	identity,
	matrix,
	multiply,
	typed,
	unaryMinus
}), pow = /* @__PURE__ */ createPow({
	Complex,
	config: config$1,
	fraction,
	identity,
	inv,
	matrix,
	multiply,
	number,
	typed
}), smallerEq = /* @__PURE__ */ createSmallerEq({
	DenseMatrix,
	SparseMatrix,
	concat,
	config: config$1,
	matrix,
	typed
}), divide = /* @__PURE__ */ createDivide({
	divideScalar,
	equalScalar,
	inv,
	matrix,
	multiply,
	typed
}), range = /* @__PURE__ */ createRange({
	bignumber,
	matrix,
	add,
	config: config$1,
	equal,
	isPositive,
	isZero,
	larger,
	largerEq,
	smaller,
	smallerEq,
	typed
}), column = /* @__PURE__ */ createColumn({
	Index,
	matrix,
	range,
	typed
}), eigs = /* @__PURE__ */ createEigs({
	abs,
	add,
	addScalar,
	atan,
	bignumber,
	column,
	complex,
	config: config$1,
	cos,
	diag,
	divideScalar,
	dot,
	equal,
	flatten,
	im,
	inv,
	larger,
	matrix,
	matrixFromColumns,
	multiply,
	multiplyScalar,
	number,
	qr,
	re,
	reshape,
	sin,
	size,
	smaller,
	sqrt,
	subtract,
	typed,
	usolve,
	usolveAll
}), norm = /* @__PURE__ */ createNorm({
	abs,
	add,
	conj,
	ctranspose,
	eigs,
	equalScalar,
	larger,
	matrix,
	multiply,
	pow,
	smaller,
	sqrt,
	typed
});
//#endregion
//#region src/utils.js
function toVector3(e, t = "value") {
	if (console.log("toVector3 called with value:", e), e instanceof THREE$1.Vector3) return e;
	if (Array.isArray(e) && e.length === 3) return new THREE$1.Vector3(e[0], e[1], e[2]);
	if (e && typeof e == "object" && "length" in e && e.length === 3) return new THREE$1.Vector3(...e);
	if (e && typeof e == "object" && "x" in e && "y" in e && "z" in e) return new THREE$1.Vector3(e.x, e.y, e.z);
	throw Error(`${t} must be a THREE.Vector3, an [x,y,z] array, or an {x,y,z} object, got ${typeof e}`);
}
function toIndexArray(e, t = "indices") {
	if (e === null) throw Error(`${t} must not be null`);
	return Array.isArray(e) ? e : [e];
}
function clearObjects(e, t = null) {
	[...e.children].forEach((n) => {
		t !== null && (!n.userData || n.userData.uuid !== t) || (n instanceof THREE$1.Group ? clearGroup(e, n) : !(n instanceof THREE$1.Camera) && !(n instanceof THREE$1.Light) && clearObject(e, n));
	});
}
function clearGroup(e, t) {
	t.children.forEach((t) => {
		t instanceof THREE$1.Group ? clearGroup(e, t) : clearObject(e, t);
	});
}
function clearObject(e, t) {
	t !== null && (t.children && t.remove(...t.children), t.geometry && t.geometry.dispose(), t.material && (Array.isArray(t.material) ? t.material.forEach((e) => e.dispose()) : t.material.dispose()), e.remove(t));
}
function getWorldPositionFromScreen(e, t, n) {
	let r = new THREE$1.Raycaster();
	r.setFromCamera(t, e);
	let i = new THREE$1.Vector3();
	return r.ray.intersectPlane(n, i), i;
}
function convertToMatrixFromABCAlphaBetaGamma(e) {
	let [t, n, r, i, a, o] = e, s = i * Math.PI / 180, c = a * Math.PI / 180, l = o * Math.PI / 180, u = t, d = 0, f = 0, p = n * Math.cos(l), m = n * Math.sin(l), h = 0, g = r * Math.cos(c), _ = r * (Math.cos(s) - Math.cos(c) * Math.cos(l)) / Math.sin(l), v = Math.sqrt(r * r - g * g - _ * _);
	return [
		[
			u,
			0,
			0
		],
		[
			p,
			m,
			0
		],
		[
			g,
			_,
			v
		]
	];
}
function calculateCartesianCoordinates(e, t) {
	return multiply(transpose(e), t);
}
function calculateQuaternion(e, t) {
	let n = new THREE$1.Matrix4().lookAt(e, t, new THREE$1.Vector3(0, 1, 0)), r = new THREE$1.Quaternion().setFromRotationMatrix(n), i = new THREE$1.Quaternion().setFromAxisAngle(new THREE$1.Vector3(1, 0, 0), Math.PI / 2);
	return r.multiply(i), r;
}
function createLabel(e, t, n = "black", r = "14px", i = "axis-label") {
	let a = document.createElement("div");
	a.className = i, a.textContent = t, a.style.color = n, a.style.fontSize = r;
	let o = new CSS2DObject(a);
	return o.position.copy(e), o;
}
function fnv1aHash(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n++) {
		let r = Array.isArray(e[n]) ? e[n].join(",") : e[n];
		for (let e = 0; e < r.length; e++) t ^= r.charCodeAt(e), t += (t << 1) + (t << 4) + (t << 7) + (t << 8) + (t << 24);
	}
	return t >>> 0;
}
//#endregion
//#region src/core/SceneManager.js
var WeasScene = class extends THREE$1.Scene {
	constructor(e) {
		super(), this.tjs = e, this._boundingBox = new THREE$1.Box3(), this._center = new THREE$1.Vector3(), this._size = new THREE$1.Vector3(), this.objectGroups = {};
	}
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
			let n = this.objectGroups[t].indexOf(e);
			n > -1 && this.objectGroups[t].splice(n, 1);
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
		let t = [];
		this.traverse((n) => {
			n.group === e && t.push(n);
		}), t.forEach((e) => this.remove(e));
	}
	dispatchObjectEvent(e) {
		let t = new CustomEvent("weas", { detail: e });
		this.tjs.containerElement.dispatchEvent(t);
	}
	clear() {
		clearObjects(this), Object.keys(this.objectGroups).forEach((e) => this.objectGroups[e] = []), this.updateBoundingBox();
	}
	dispatchObjectEvent(e) {
		let t = new CustomEvent("weas", { detail: e });
		this.tjs.containerElement.dispatchEvent(t);
	}
	updateBoundingBox() {
		this._boundingBox.makeEmpty(), this.traverse((e) => {
			if (e.isMesh || e.isLineSegments || e.isInstancedMesh) {
				let t = new THREE$1.Box3();
				if (e.isInstancedMesh) {
					if (e.count === 0) return;
					e.computeBoundingBox(), t.copy(e.boundingBox);
				} else e.geometry.computeBoundingBox(), t.copy(e.geometry.boundingBox);
				t.applyMatrix4(e.matrixWorld), this._boundingBox.union(t);
			}
		}), this._center.copy(this._boundingBox.getCenter(new THREE$1.Vector3())), this._size.copy(this._boundingBox.getSize(new THREE$1.Vector3()));
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
	getProjectedBoundingBox(e = [
		0,
		0,
		1
	]) {
		e = new THREE$1.Vector3(...e).normalize();
		let t = new THREE$1.Box3();
		if (this.traverse((e) => {
			if (e.isMesh || e.isLineSegments || e.isInstancedMesh) {
				e.geometry.computeBoundingBox();
				let n = e.geometry.boundingBox.clone().applyMatrix4(e.matrixWorld);
				t.union(n);
			}
		}), t.isEmpty()) return new THREE$1.Vector3(0, 0, 0);
		let n = [
			new THREE$1.Vector3(t.min.x, t.min.y, t.min.z),
			new THREE$1.Vector3(t.min.x, t.min.y, t.max.z),
			new THREE$1.Vector3(t.min.x, t.max.y, t.min.z),
			new THREE$1.Vector3(t.min.x, t.max.y, t.max.z),
			new THREE$1.Vector3(t.max.x, t.min.y, t.min.z),
			new THREE$1.Vector3(t.max.x, t.min.y, t.max.z),
			new THREE$1.Vector3(t.max.x, t.max.y, t.min.z),
			new THREE$1.Vector3(t.max.x, t.max.y, t.max.z)
		], r = new THREE$1.Matrix4().lookAt(e, new THREE$1.Vector3(0, 0, 0), new THREE$1.Vector3(0, 1, 0)), i = new THREE$1.Vector3(Infinity, Infinity, Infinity), a = new THREE$1.Vector3(-Infinity, -Infinity, -Infinity);
		n.forEach((e) => {
			let t = e.clone().applyMatrix4(r);
			i.min(t), a.max(t);
		});
		let o = new THREE$1.Vector3();
		return o.subVectors(a, i), o;
	}
}, OrthographicCamera = class extends THREE$1.OrthographicCamera {
	constructor(e, t, n, r, i, a, o = null) {
		super(e, t, n, r, i, a), this.tjs = o;
	}
	updateZoom(e) {
		this.zoom !== e && (this.zoom = e, this.updateProjectionMatrix(), this.dispatchObjectEvent({
			data: e,
			action: "zoom",
			catalog: "camera"
		}));
	}
	updatePosition(e, t, n) {
		let r = new THREE$1.Vector3(e, t, n);
		this.position.equals(r) || (this.position.copy(r), this.updateProjectionMatrix(), this.dispatchObjectEvent({
			data: [
				e,
				t,
				n
			],
			action: "position",
			catalog: "camera"
		}));
	}
	dispatchObjectEvent(e) {
		let t = new CustomEvent("weas", { detail: e });
		this.tjs.containerElement.dispatchEvent(t), this.tjs && typeof this.tjs.requestRedraw == "function" ? this.tjs.requestRedraw("render") : this.tjs.render();
	}
}, defaultViewerSettings = {
	modelStyle: 0,
	colorBy: "Element",
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
		showAxes: !0,
		cellColor: 0,
		cellLineWidth: 2,
		axisColors: {
			a: 16711680,
			b: 65280,
			c: 255
		},
		axisRadius: .15,
		axisConeHeight: .8,
		axisConeRadius: .3,
		axisSphereRadius: .3
	},
	boundary: [
		[0, 1],
		[0, 1],
		[0, 1]
	],
	atomScale: .4,
	wrapOnMove: !1,
	backgroundColor: "#ffffff",
	logLevel: "warn",
	continuousUpdate: !0,
	autoResetCameraOnAtomsUpdate: !1
}, defaultTjsConfig = { renderConfig: {
	alpha: !0,
	antialias: !0,
	depth: !0,
	preserveDrawingBuffer: !0
} }, defaultKeyBindConfig = {
	SearchOperation: [["ctrl", "f"]],
	exitMode: [["Escape"]],
	undo: [["ctrl", "z"]],
	redo: [["ctrl", "y"]],
	adjustLastOperation: [["F9"], ["l"]],
	DeleteOperation: [["x"], ["Delete"]],
	enterObjectMode: [["o"]],
	enterEditMode: [["e"]],
	TranslateOperation: [["g"]],
	ScaleOperation: [["s"]],
	RotateOperation: [["r"]],
	CopyOperation: [["d"]],
	ReplaceOperation: [["c"]],
	measure: [["m"]],
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
	timeline: { enabled: !0 },
	atomLegend: {
		enabled: !1,
		position: "bottom-right"
	},
	meshLegend: {
		enabled: !0,
		position: "bottom-left"
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
}, LEGEND_SHAPE_BASE_STYLE = { display: "block" };
function applyStyle(e, t) {
	Object.assign(e.style, t);
}
var LegendHUD = class {
	constructor(e, t = {}) {
		this.hud = e, this.paramsSchema = {
			fontFamily: {
				type: "string",
				default: "sans-serif",
				label: "Font Family"
			},
			fontSize: {
				type: "number",
				min: 8,
				max: 36,
				step: 1,
				default: 13,
				label: "Label Font Size"
			},
			headingFontSize: {
				type: "number",
				min: 10,
				max: 48,
				step: 1,
				default: 11,
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
				default: 4,
				label: "Row Gap"
			},
			columnGap: {
				type: "number",
				min: 0,
				max: 30,
				step: 1,
				default: 8,
				label: "Column Gap"
			},
			panelPadding: {
				type: "number",
				min: 0,
				max: 20,
				step: 1,
				default: 8,
				label: "Panel Padding"
			},
			panelBackground: {
				type: "color",
				default: "rgba(221, 221, 221, 0.92)",
				label: "Background"
			},
			panelBorderRadius: {
				type: "number",
				min: 0,
				max: 20,
				step: 1,
				default: 6,
				label: "Border radius"
			},
			heading: {
				type: "string",
				default: "Legend",
				label: "Heading Text"
			}
		}, this.initDefaults(), t.settings && this.setParams(t.settings), this.config = Object.assign({
			position: "bottom-right",
			panelKey: "legend"
		}, t), this.entries = /* @__PURE__ */ new Map(), this.container = document.createElement("div"), this._applyContainerStyle(), this.settings.heading && (this.headingEl = document.createElement("div"), this.headingEl.textContent = this.settings.heading, this.headingEl.style.fontSize = `${this.settings.headingFontSize}px`, this.headingEl.style.fontWeight = "600", this.headingEl.style.textTransform = "uppercase", this.headingEl.style.letterSpacing = "1px", this.headingEl.style.color = "rgba(40, 40, 40, 0.5)", this.headingEl.style.marginBottom = `${this.settings.rowGap}px`, this.container.appendChild(this.headingEl)), this.hud.addHTMLPanel(this.config.panelKey, this.container, {
			anchor: this.config.position,
			offset: {
				x: 0,
				y: 0
			}
		});
	}
	initDefaults() {
		this.settings = {};
		for (let [e, t] of Object.entries(this.paramsSchema)) this.settings[e] = t.default;
	}
	setParams(e = {}) {
		Object.assign(this.settings, e), this.updateSettings({});
	}
	getParams() {
		let e = {};
		for (let t of Object.keys(this.paramsSchema)) e[t] = this.settings[t];
		return e;
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
			fontSize: `${this.settings.fontSize}px`,
			color: "rgba(51, 51, 51, 0.85)",
			border: "1px solid rgba(255,255,255,0.12)",
			backdropFilter: "blur(6px)",
			WebkitBackdropFilter: "blur(6px)"
		});
	}
	addEntry(e, { label: t, color: n = "#888", shape: r = "circle", size: i = 16 }) {
		this.entries.has(e) && this.removeEntry(e);
		let a = i * (this.settings.iconSize / 16), o = this._createShape(r, n, a);
		o.dataset.baseSize = i;
		let s = document.createElement("span");
		s.textContent = t;
		let c = document.createElement("div");
		Object.assign(c.style, {
			display: "flex",
			alignItems: "center",
			gap: `${this.settings.columnGap}px`
		}), c.appendChild(o), c.appendChild(s), this.container.appendChild(c), this.entries.set(e, c);
	}
	_createShape(e, t, n) {
		let r = document.createElement("div");
		switch (applyStyle(r, LEGEND_SHAPE_BASE_STYLE), r.style.width = `${n}px`, r.style.height = `${n}px`, e) {
			case "sphere":
				r.style.borderRadius = "50%", r.style.border = "#00000030 solid 1px", r.style.background = `radial-gradient(circle at 30% 30%, #ffffffaa, ${t} 65%, #00000044)`;
				break;
			case "cube":
				r.style.background = `linear-gradient(145deg, #ffffff55, ${t})`, r.style.boxShadow = "inset -2px -2px 3px rgba(0,0,0,0.4)";
				break;
			case "square":
				r.style.background = t, r.style.borderRadius = "2px";
				break;
			default: r.style.background = t, r.style.borderRadius = "50%";
		}
		return r;
	}
	removeEntry(e) {
		let t = this.entries.get(e);
		t && (t.remove(), this.entries.delete(e));
	}
	clear() {
		this.entries.forEach((e) => e.remove()), this.entries.clear();
	}
	updateSettings(e) {
		Object.assign(this.settings, e), this._applyContainerStyle(), this.entries.forEach((e) => {
			e.style.gap = `${this.settings.columnGap}px`;
			let t = e.querySelector("span");
			t && (t.style.fontSize = `${this.settings.fontSize}px`);
			let n = e.querySelector("div");
			if (n && n.dataset.baseSize) {
				let e = parseFloat(n.dataset.baseSize) * (this.settings.iconSize / 16);
				n.style.width = n.style.height = `${e}px`;
			}
		}), this.headingEl && (this.headingEl.style.fontSize = `${this.settings.headingFontSize}px`, this.headingEl.style.fontWeight = "600", this.headingEl.style.textTransform = "uppercase", this.headingEl.style.letterSpacing = "1px", this.headingEl.style.color = "rgba(37, 37, 37, 0.5)", "heading" in e && (this.headingEl.textContent = this.settings.heading));
	}
	getSchema() {
		return this.paramsSchema;
	}
}, toolbarIcons = {
	undo: "\n    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" \n    fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n      <path d=\"M9 14 4 9l5-5\"/>\n      <path d=\"M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11\"/>\n    </svg>\n  ",
	redo: "\n    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"\n    fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n      <path d=\"m15 14 5-5-5-5\"/>\n      <path d=\"M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13\"/>\n    </svg>",
	fullscreen: "\n    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"\n    fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n      <path d=\"m15 15 6 6\"/>\n      <path d=\"m15 9 6-6\"/>\n      <path d=\"M21 16v5h-5\"/>\n      <path d=\"M21 8V3h-5\"/>\n      <path d=\"M3 16v5h5\"/>\n      <path d=\"m3 21 6-6\"/>\n      <path d=\"M3 8V3h5\"/>\n      <path d=\"M9 9 3 3\"/>\n    </svg>",
	measure: "\n    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"\n    fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n      <path d=\"M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z\"/>\n      <path d=\"m14.5 12.5 2-2\"/>\n      <path d=\"m11.5 9.5 2-2\"/>\n      <path d=\"m8.5 6.5 2-2\"/>\n      <path d=\"m17.5 15.5 2-2\"/>\n    </svg>"
}, ToolbarHUD = class {
	constructor(e, t, n = {}) {
		this.weas = e, this.hud = t, this.hud.onHUDResize && this.hud.onHUDResize((e, t) => {
			console.log("ToolbarHUD detected HUD resize:", e, t);
		}), this.settings = Object.assign({
			height: 40,
			panelBackground: "rgba(255, 255, 255, 0)",
			panelBorderRadius: 20,
			gap: 6,
			paddingX: "0px",
			paddingY: "0px",
			anchor: "top-center"
		}, n.settings || {}), this.config = Object.assign({ panelKey: "toolbar" }, n), this.buttons = /* @__PURE__ */ new Map(), this.container = document.createElement("div"), Object.assign(this.container.style, {
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
				let e = this.weas.tjs.containerElement;
				e && (document.fullscreenElement ? document.exitFullscreen().catch((e) => {
					console.error("Exit fullscreen failed:", e);
				}) : e.requestFullscreen().catch((e) => {
					console.error("Fullscreen failed:", e);
				}));
			}
		}), this.addButton("measure", {
			hint: "Measure selection",
			onClick: () => {
				this.weas.avr.Measurement.measure(this.weas.avr.selectedAtomsIndices);
			}
		});
	}
	addButton(e, { label: t = "", hint: n = "", onClick: r } = {}) {
		this.buttons.has(e) && this.removeButton(e);
		let i = document.createElement("button");
		if (i.classList.add("weas-toolbar-button"), toolbarIcons[e]) {
			let t = document.createElement("span");
			t.innerHTML = toolbarIcons[e], i.appendChild(t);
		} else i.textContent = t || e;
		n && (i.title = n), Object.assign(i.style, {
			width: "32px",
			height: "32px",
			borderRadius: "50%",
			border: "1px solid rgba(255,255,255,0.25)",
			background: "rgba(30,30,40,0.65)",
			cursor: "pointer",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			color: "rgba(255,255,255,0.85)",
			transition: "background 0.15s",
			padding: "0"
		}), i.addEventListener("mouseenter", () => {
			i.style.background = "rgba(60,60,80,0.85)";
		}), i.addEventListener("mouseleave", () => {
			i.style.background = "rgba(30,30,40,0.65)";
		});
		let a = i.querySelector("svg");
		a && (a.style.display = "block", a.style.width = "18px", a.style.height = "18px"), r && i.addEventListener("click", r), i.addEventListener("pointerdown", (e) => e.stopPropagation()), i.addEventListener("pointerup", (e) => e.stopPropagation()), this.container.appendChild(i), this.buttons.set(e, i);
	}
	removeButton(e) {
		let t = this.buttons.get(e);
		t && (t.remove(), this.buttons.delete(e));
	}
	clear() {
		this.buttons.forEach((e) => e.remove()), this.buttons.clear();
	}
	setVisible(e) {
		this.container.style.display = e ? "flex" : "none";
	}
}, HUDController = class {
	constructor(e, t, n) {
		this._listeners = /* @__PURE__ */ new Set(), this._resizeListeners = /* @__PURE__ */ new Set(), this.weas = e, this.container = document.createElement("div"), this.container.style.position = "absolute", this.container.style.top = "0", this.container.style.left = "0", this.container.style.width = "100%", this.container.style.height = "100%", this.container.style.pointerEvents = "none", t.appendChild(this.container), this.htmlElements = /* @__PURE__ */ new Map(), this.miniScenes = /* @__PURE__ */ new Map(), this.renderer = n, this.legendHUD = new LegendHUD(this, { position: "bottom-right" }), this.ToolbarHUD = new ToolbarHUD(this.weas, this, { position: "top-right" }), this._resizeObserver = new ResizeObserver(() => this._onResize()), this._resizeObserver.observe(this.container), this.ANCHORS = [
			"top-left",
			"top-center",
			"top-right",
			"bottom-left",
			"bottom-center",
			"bottom-right",
			"center-left",
			"center",
			"center-right"
		];
	}
	onChange(e) {
		this._listeners.add(e);
	}
	_emitChange() {
		this._listeners.forEach((e) => e());
	}
	initCoordScene() {
		let e = new THREE$1.Scene();
		e.add(new THREE$1.AmbientLight(16777215, 2));
		let t = new THREE$1.DirectionalLight(16777215, 2);
		t.position.set(10, 10, 10), e.add(t);
		let n = new THREE$1.AxesHelper(.5), r = new THREE$1.Group();
		r.add(n), e.add(r);
		let i = new THREE$1.OrthographicCamera(-2.5, 2.5, 2.5, -2.5, .1, 100);
		i.position.set(0, 0, 5), i.lookAt(0, 0, 0), this.coordAxesGroup = r, this.addMiniScene("coord", e, i, {
			width: 200,
			height: 200
		}, {
			bottom: 10,
			left: 10
		}, !0, !0);
	}
	addMiniScene(e, t, n, r = {
		width: 150,
		height: 150
	}, i = {
		top: 10,
		left: 10
	}, a = !1, o = !0) {
		let s = document.createElement("canvas");
		s.width = r.width, s.height = r.height, s.style.position = "absolute", s.style.pointerEvents = "none", this.container.appendChild(s), this.miniScenes.set(e, {
			scene: t,
			camera: n,
			canvas: s,
			width: r.width,
			height: r.height,
			position: { ...i },
			rotation: a,
			visible: o
		}), this.setMiniScenePosition(e, i);
	}
	addHTMLPanel(e, t, n = {}) {
		let { width: r, height: i, anchor: a = "top-left", offset: o = {
			x: 0,
			y: 0
		}, visible: s = !0 } = n;
		t.style.position = "absolute", t.style.display = s ? "flex" : "none", r && (t.style.width = r + "px"), i && (t.style.height = i + "px"), this.container.appendChild(t), this.htmlElements.set(e, {
			element: t,
			width: r || t.offsetWidth,
			height: i || t.offsetHeight,
			anchor: a,
			offset: { ...o },
			visible: s
		}), this._updateHTMLPosition(e), this._emitChange();
	}
	getPresetPosition(e, t = 10) {
		let n = this.container.clientWidth, r = this.container.clientHeight;
		switch (e) {
			case "top-left": return {
				top: t,
				left: t
			};
			case "top-right": return {
				top: t,
				left: n - t
			};
			case "bottom-left": return {
				top: r - t,
				left: t
			};
			case "bottom-right": return {
				top: r - t,
				left: n - t
			};
			default: return {
				top: t,
				left: t
			};
		}
	}
	setHTMLPosition(e, t) {
		let n = this.htmlElements.get(e);
		n && (n.position = {
			...n.position,
			...t
		}, this._applyPosition(n.element, n.position));
	}
	setHTMLPanelVisible(e, t) {
		let n = this.htmlElements.get(e);
		n && (n.visible = t, t ? n.element.style.display = n._origDisplay || "flex" : (n._origDisplay === void 0 && (n._origDisplay = n.element.style.display || ""), n.element.style.display = "none"));
	}
	render(e) {
		this.miniScenes.forEach(({ scene: t, camera: n, canvas: r, rotation: i, visible: a }) => {
			if (!a || !r.width || !r.height) return;
			i && this.coordAxesGroup && this.coordAxesGroup.quaternion.copy(e.quaternion).invert();
			let o = r.getBoundingClientRect(), s = this.container.getBoundingClientRect(), c = o.left - s.left, l = s.height - (o.top - s.top) - r.height, u = this.renderer, d = new THREE$1.Vector4();
			u.getViewport(d), u.setViewport(c, l, r.width, r.height), u.setScissor(c, l, r.width, r.height), u.setScissorTest(!0), u.render(t, n), u.setViewport(d.x, d.y, d.z, d.w), u.setScissorTest(!1);
		});
	}
	update() {}
	list() {
		return {
			miniScenes: Array.from(this.miniScenes.keys()),
			htmlElements: Array.from(this.htmlElements.keys())
		};
	}
	listDetails() {
		let e = {};
		this.miniScenes.forEach((t, n) => {
			e[n] = {
				width: t.canvas.width,
				height: t.canvas.height,
				position: t.position || {
					top: parseInt(t.canvas.style.top || 0),
					left: parseInt(t.canvas.style.left || 0)
				},
				scene: t.scene,
				camera: t.camera
			};
		});
		let t = {};
		return this.htmlElements.forEach((e, n) => {
			t[n] = {
				width: e.offsetWidth,
				height: e.offsetHeight,
				position: {
					top: parseInt(e.style.top || 0),
					left: parseInt(e.style.left || 0)
				},
				element: e
			};
		}), {
			miniScenes: e,
			htmlElements: t
		};
	}
	getTopLeft(e) {
		let t = this.miniScenes.get(e);
		if (!t) return {
			top: 0,
			left: 0
		};
		let n = this.container.clientHeight;
		return {
			top: t.position.top == null ? t.position.bottom == null ? 0 : n - t.position.bottom - t.height : t.position.top,
			left: t.position.left == null ? 0 : t.position.left
		};
	}
	getHTMLTopLeft(e) {
		let t = this.htmlElements.get(e);
		return t ? {
			top: t.position.top == null ? 0 : t.position.top,
			left: t.position.left == null ? 0 : t.position.left
		} : {
			top: 0,
			left: 0
		};
	}
	setMiniScenePosition(e, t) {
		let n = this.miniScenes.get(e);
		n && (n.position = {
			...n.position,
			...t
		}, this._applyPosition(n.canvas, n.position));
	}
	setMiniSceneVisible(e, t) {
		let n = this.miniScenes.get(e);
		n && (n.visible = t, n.canvas.style.display = t ? "" : "none");
	}
	setHTMLElementVisible(e, t) {
		let n = this.htmlElements.get(e);
		n && (n.visible = t, n.style.display = t ? "" : "none");
	}
	_applyPosition(e, t) {
		t.top !== void 0 && (e.style.top = t.top + "px", e.style.bottom = ""), t.left !== void 0 && (e.style.left = t.left + "px", e.style.right = ""), t.bottom !== void 0 && (e.style.bottom = t.bottom + "px", e.style.top = ""), t.right !== void 0 && (e.style.right = t.right + "px", e.style.left = "");
	}
	_updateHTMLPosition(e) {
		let t = this.htmlElements.get(e);
		if (!t) return;
		let { element: n, anchor: r, offset: i } = t;
		switch (n.style.top = "", n.style.bottom = "", n.style.left = "", n.style.right = "", n.style.transform = "", r) {
			case "top-left":
				n.style.top = `${i.y}%`, n.style.left = `${i.x}%`;
				break;
			case "top-right":
				n.style.top = `${i.y}%`, n.style.right = `${i.x}%`;
				break;
			case "bottom-left":
				n.style.bottom = `${i.y}%`, n.style.left = `${i.x}%`;
				break;
			case "bottom-right":
				n.style.bottom = `${i.y}%`, n.style.right = `${i.x}%`;
				break;
			case "center":
				n.style.top = `calc(50% + ${i.y}%)`, n.style.left = `calc(50% + ${i.x}%)`, n.style.transform = "translate(-50%, -50%)";
				break;
			case "top-center":
				n.style.top = `${i.y}%`, n.style.left = "50%", n.style.transform = "translateX(-50%)";
				break;
			case "bottom-center":
				n.style.bottom = `${i.y}%`, n.style.left = "50%", n.style.transform = "translateX(-50%)";
				break;
			case "center-left":
				n.style.top = "50%", n.style.left = `${i.x}%`, n.style.transform = "translateY(-50%)";
				break;
			case "center-right":
				n.style.top = "50%", n.style.right = `${i.x}%`, n.style.transform = "translateY(-50%)";
				break;
		}
	}
	onHUDResize(e) {
		this._resizeListeners.add(e), e(this.getCurrentHUDWidth(), this.getCurrentHUDHeight());
	}
	offHUDResize(e) {
		this._resizeListeners.delete(e);
	}
	getCurrentHUDWidth() {
		return this.container.clientWidth;
	}
	getCurrentHUDHeight() {
		return this.container.clientHeight;
	}
	_onResize() {
		let e = this.getCurrentHUDWidth(), t = this.getCurrentHUDHeight();
		this._resizeListeners.forEach((n) => n(e, t)), this._emitChange();
	}
}, BlendJSObject = class {
	constructor(e, t, n) {
		this.name = e, this.geometry = t, this.material = n, this.object3D = new THREE$1.Mesh(t, n);
	}
}, BlendJSMaterial = class {
	constructor(e, t) {
		this.name = e, this.material = t;
	}
}, BlendJSMesh = class {
	constructor(e, t) {
		this.name = e, this.geometry = t;
	}
}, BlendJSLight = class {
	constructor(e, t) {
		this.name = e, this.light = t;
	}
}, BlendJSRenderer = class {
	constructor(e, t) {
		this.name = e, this.renderer = t;
	}
}, BlendJS = class {
	constructor(e, t) {
		this.containerElement = e, this.tjsConfig = t.tjsConfig || defaultTjsConfig, this.weas = t, this.scene = new WeasScene(this), this.objects = {}, this.materials = {}, this.meshes = {}, this.lights = {}, this.renderers = {}, this._renderHooks = [], this._cameraType = "Orthographic", this.sceneView = {
			left: 0,
			bottom: 0,
			width: 1,
			height: 1
		}, this.init(), this.hud = new HUDController(this.weas, this.containerElement, this.renderers.MainRenderer.renderer), this.hud.initCoordScene(this.camera);
	}
	get cameraType() {
		return this._cameraType;
	}
	set cameraType(e) {
		this._cameraType = e, this.cameraController && this.cameraController.setCamera(e);
	}
	get camera() {
		return this._cameraType === "Orthographic" ? this.orthographicCamera : this.perspectiveCamera;
	}
	init() {
		this.scene.background = new THREE$1.Color(16777215);
		let e = this?.tjsConfig?.renderConfig || defaultTjsConfig.renderConfig, t = new THREE$1.WebGLRenderer(e);
		t.autoClear = !1;
		let n = this.containerElement.getBoundingClientRect(), r = this.containerElement.clientWidth || n.width || 1, i = this.containerElement.clientHeight || n.height || 1;
		t.setSize(r, i), t.setPixelRatio(window.devicePixelRatio), this.addRenderer("MainRenderer", t);
		let a = new CSS2DRenderer();
		a.setSize(r, i), a.domElement.style.position = "absolute", a.domElement.style.top = "0px", a.domElement.style.pointerEvents = "none", this.addRenderer("LabelRenderer", a);
		let o = 20, s = r / i, c = 20 / 2, l = 10 * s;
		this.orthographicCamera = new OrthographicCamera(-l, l, 10, -10, 1, 2e3, this), this.orthographicCamera.layers.enable(1), this.perspectiveCamera = new THREE$1.PerspectiveCamera(50, r / i, 1, 500), this.perspectiveCamera.layers.enable(1), this.camera.position.set(0, -100, 0), this.camera.lookAt(0, 0, 0), this.scene.add(this.camera);
		let u = new THREE$1.DirectionalLight(16777215, 2);
		u.position.set(50, 50, 100), this.addLight("MainLight", u), this.camera.add(u);
		let d = new THREE$1.AmbientLight(4210752, 20);
		this.addLight("AmbientLight", d), this.cameraController = new CameraController(this.camera, t.domElement), this.cameraController.weas = this.weas, this.cameraController._registerKeybinds(), this.cameraController.addCamera("Perspective", this.perspectiveCamera), this.cameraController.onChange(() => {
			this.render();
		}), this.updateViewerRect(), this.observeContainerResize(), window.addEventListener("resize", this.onWindowResize.bind(this), !1), this.containerElement.addEventListener("mousemove", this.render.bind(this)), this.containerElement.addEventListener("pointerup", this.render.bind(this)), this.containerElement.addEventListener("pointerdown", this.render.bind(this)), this.containerElement.addEventListener("click", this.render.bind(this)), this.containerElement.addEventListener("wheel", this.render.bind(this)), this.containerElement.addEventListener("atomsUpdated", this.render.bind(this));
	}
	observeContainerResize() {
		console.log("Observing container resize"), typeof ResizeObserver == "function" && (this._lastObservedSize = {
			width: 0,
			height: 0
		}, this._resizeObserver = new ResizeObserver((e) => {
			let t = e[0];
			if (!t) return;
			let { width: n, height: r } = t.contentRect || {};
			!n || !r || n === this._lastObservedSize.width && r === this._lastObservedSize.height || (this._lastObservedSize = {
				width: n,
				height: r
			}, console.log("Container resized:", n, r), !this._resizeRaf && (this._resizeRaf = requestAnimationFrame(() => {
				this._resizeRaf = null, this.onWindowResize();
			})));
		}), this._resizeObserver.observe(this.containerElement));
	}
	updateViewerRect() {
		return this.viewerRect = this.containerElement.getBoundingClientRect(), this.viewerRect;
	}
	addRenderHook(e) {
		this._renderHooks.push(e);
	}
	removeRenderHook(e) {
		let t = this._renderHooks.indexOf(e);
		t !== -1 && this._renderHooks.splice(t, 1);
	}
	addObject(e, t, n) {
		let r = new BlendJSObject(e, t, n);
		return this.objects[e] = r, this.scene.add(r.object3D), r;
	}
	addMaterial(e, t) {
		let n = new BlendJSMaterial(e, t);
		return this.materials[e] = n, n;
	}
	addMesh(e, t) {
		let n = new BlendJSMesh(e, t);
		return this.meshes[e] = n, n;
	}
	addLight(e, t) {
		let n = new BlendJSLight(e, t);
		return this.lights[e] = n, this.scene.add(n.light), n;
	}
	addRenderer(e, t) {
		this.containerElement.appendChild(t.domElement);
		let n = new BlendJSRenderer(e, t);
		return this.renderers[e] = n, n;
	}
	onWindowResize() {
		let e = this.containerElement.getBoundingClientRect(), t = this.containerElement.clientWidth || e.width, n = this.containerElement.clientHeight || e.height;
		if (!(!t || !n)) {
			if (this.camera.isOrthographicCamera) {
				let e = t / n, r = this.camera.top - this.camera.bottom;
				this.camera.left = -r * e / 2, this.camera.right = r * e / 2;
			} else this.camera.aspect = t / n;
			this.camera.updateProjectionMatrix(), Object.values(this.renderers).forEach((e) => {
				e.renderer.setSize(t, n);
			}), this.updateViewerRect(), this.render();
		}
	}
	renderSceneInfo(e, t, n, r, i, a, o) {
		let s = o.getSize(new THREE$1.Vector2());
		var c = Math.floor(s.width * n), l = Math.floor(s.height * r), u = Math.floor(s.width * i), d = Math.floor(s.height * a);
		o.setViewport(c, l, u, d), o.setScissor(c, l, u, d), o.setScissorTest(!1), o.render(e, t);
	}
	render() {
		this.cameraController.update(), this.renderers.MainRenderer.renderer.clear();
		for (let e of this._renderHooks) e(this.camera, this.renderers.MainRenderer.renderer);
		this.renderers.LabelRenderer.renderer.render(this.scene, this.camera), this.renderSceneInfo(this.scene, this.camera, this.sceneView.left, this.sceneView.bottom, this.sceneView.width, this.sceneView.height, this.renderers.MainRenderer.renderer), this.hud && this.hud.render(this.camera), this.cameraController.update();
	}
	exportImage(e = 2) {
		e = Math.min(e, 3);
		let t = this.renderers.MainRenderer.renderer, n = t.getPixelRatio(), r = e;
		t.setPixelRatio(r), this.render();
		let i = document.createElement("canvas");
		i.width = t.domElement.width, i.height = t.domElement.height;
		let a = i.getContext("2d");
		a.drawImage(t.domElement, 0, 0), this.drawLabelsToCanvas(a, i.width, i.height, r);
		var o = i.toDataURL("image/png");
		return t.setPixelRatio(n), this.render(), o;
	}
	drawLabelsToCanvas(e, t, n, r) {
		let i = [];
		if (this.scene.traverse((e) => {
			e && e.isCSS2DObject && e.element && i.push(e);
		}), i.length === 0) return;
		this.scene.updateMatrixWorld(!0), this.camera.updateMatrixWorld(!0);
		let a = e.textAlign, o = e.textBaseline;
		e.textAlign = "center", e.textBaseline = "middle";
		let s = new THREE$1.Vector3();
		i.forEach((i) => {
			if (!i.visible) return;
			let a = i.element, o = window.getComputedStyle(a);
			if (o.display === "none" || o.visibility === "hidden" || o.opacity === "0") return;
			i.getWorldPosition(s), s.project(this.camera);
			let c = (s.x * .5 + .5) * t, l = (-s.y * .5 + .5) * n, u = parseFloat(o.fontSize) || 14, d = o.fontFamily || "sans-serif";
			e.font = `${o.fontWeight || "normal"} ${u * r}px ${d}`, e.fillStyle = o.color || "#000";
			let f = a.textContent || "";
			f && e.fillText(f, c, l);
		}), e.textAlign = a, e.textBaseline = o;
	}
	downloadImage(e = "atomistic-model.png") {
		var t = this.exportImage(), n = document.createElement("a");
		n.href = t, n.download = e, document.body.appendChild(n), n.click(), document.body.removeChild(n);
	}
	async exportAnimation({ format: e = "webm", fps: t = 12, startFrame: n = 0, endFrame: r = null, mimeType: i = null, resolution: a = 2, frameCount: o = null, setFrame: s = null, getFrame: c = null, isPlaying: l = null, pause: u = null, play: d = null } = {}) {
		if (typeof MediaRecorder > "u") throw Error("MediaRecorder is not supported in this browser.");
		if (!this.renderers || !this.renderers.MainRenderer) throw Error("Renderer is not initialized.");
		if (!Number.isFinite(t) || t <= 0) throw Error("fps must be a positive number.");
		if (!Number.isFinite(a) || a <= 0) throw Error("resolution must be a positive number.");
		if (!Number.isFinite(o) || o <= 0) throw Error("frameCount must be a positive number.");
		if (typeof s != "function") throw Error("setFrame callback is required for animation export.");
		let f = this.renderers.MainRenderer.renderer, p = f.getPixelRatio(), m = Math.min(a, 3), h = f.getSize(new THREE$1.Vector2());
		f.setPixelRatio(m), f.setSize(h.x, h.y, !1);
		let g = f.domElement;
		if (!g.captureStream) throw f.setPixelRatio(p), f.setSize(h.x, h.y, !1), Error("Canvas captureStream() is not supported in this browser.");
		let _ = String(e || "webm").toLowerCase();
		if (_ === "gif") throw Error("GIF export is not supported without an external encoder. Use webm or mp4.");
		let v = this.getSupportedAnimationMimeTypes(_, i);
		_ === "mp4" && !v && (v = this.getSupportedAnimationMimeTypes("webm"), console.warn("MP4 export is not supported in this browser. Falling back to WebM."));
		let y = Math.max(0, Math.min(n, o - 1)), b = Math.max(y, Math.min(r ?? o - 1, o - 1)), x = v ? { mimeType: v } : void 0, w = g.captureStream(t), T = x ? new MediaRecorder(w, x) : new MediaRecorder(w), E = [];
		T.ondataavailable = (e) => {
			e.data && e.data.size > 0 && E.push(e.data);
		};
		let k = typeof c == "function" ? c() : null, A = typeof l == "function" ? l() : !1;
		A && typeof u == "function" && u();
		let j = 1e3 / t;
		try {
			typeof s == "function" && s(y), await new Promise((e) => requestAnimationFrame(e)), await new Promise((e) => requestAnimationFrame(e)), T.start();
			for (let e = y; e <= b; e += 1) s(e), await new Promise((e) => setTimeout(e, j));
			let e = new Promise((e) => {
				T.onstop = e;
			});
			T.stop(), await e, w.getTracks().forEach((e) => e.stop());
		} finally {
			f.setPixelRatio(p), f.setSize(h.x, h.y, !1), this.render();
		}
		k !== null && typeof s == "function" && s(k), A && typeof d == "function" && d();
		let M = T.mimeType || v || "video/webm";
		return new Blob(E, { type: M });
	}
	async downloadAnimation({ filename: e = "trajectory.webm", ...t } = {}) {
		let n = await this.exportAnimation(t), r = URL.createObjectURL(n), i = document.createElement("a");
		i.href = r, i.download = e, document.body.appendChild(i), i.click(), document.body.removeChild(i), URL.revokeObjectURL(r);
	}
	getSupportedAnimationMimeTypes(e, t) {
		if (t && MediaRecorder.isTypeSupported(t)) return t;
		let n = String(e || "webm").toLowerCase();
		return n === "gif" ? null : (n === "mp4" ? ["video/mp4;codecs=avc1.42E01E", "video/mp4"] : [
			"video/webm;codecs=vp9",
			"video/webm;codecs=vp8",
			"video/webm"
		]).find((e) => MediaRecorder.isTypeSupported(e)) || null;
	}
};
//#endregion
//#region src/core/schemaGUI.js
function createGUIFromSchema(e, t, n, r) {
	for (let [i, a] of Object.entries(n)) {
		if (a.hidden || a.gui === !1) continue;
		let n = {};
		a.path ? n[i] = getByPath$1(t, a.path) : n[i] = t[i];
		let o = addController(e, n, i, a, resolveOptions(a.options, t));
		if (!o) continue;
		let s = a.label ?? i;
		o.name(s), typeof a.onChange == "function" ? o.onChange(() => {
			a.path && setByPath(t, a.path, n[i]), a.onChange(i, n[i]);
		}) : typeof r == "function" && o.onChange(() => r(i, n[i]));
	}
	return e;
}
function addController(e, t, n, r, i) {
	switch (r.type) {
		case "color": return e.addColor(t, n);
		case "boolean": return e.add(t, n);
		case "number": {
			let i = r.min ?? 0, a = r.max ?? 100;
			return r.step === void 0 ? e.add(t, n, i, a) : e.add(t, n, i, a, r.step);
		}
		case "select": return i ? e.add(t, n, i) : null;
		default: return e.add(t, n);
	}
}
function addControllerFromSchema(e, t, n, r, i) {
	return addController(e, t, n, r, i);
}
function normalizeUISchema(e) {
	return e.fields ? {
		title: e.title || null,
		fields: e.fields
	} : {
		title: e.title || null,
		fields: e
	};
}
function resolveOptions(e, t) {
	return e ? typeof e == "function" ? e(t) : e : null;
}
function getByPath$1(e, t) {
	let n = t.split("."), r = e;
	for (let e of n) {
		if (!r) return;
		r = r[e];
	}
	return r;
}
function setByPath(e, t, n) {
	let r = t.split("."), i = e;
	for (let e = 0; e < r.length - 1; e++) {
		let t = r[e];
		i[t] || (i[t] = {}), i = i[t];
	}
	i[r[r.length - 1]] = n;
}
function cloneValue$2(e) {
	return e === void 0 ? e : JSON.parse(JSON.stringify(e));
}
function buildStatePatch(e, t) {
	if (!e) return t;
	let n = e.split("."), r = {}, i = r;
	for (let e = 0; e < n.length - 1; e++) i[n[e]] = {}, i = i[n[e]];
	return i[n[n.length - 1]] = t, r;
}
//#endregion
//#region src/core/GUIManager.js
function lockController(e) {
	e.__li.style.pointerEvents = "none", e.__li.style.opacity = .95;
}
var GUIManager = class {
	constructor(e, t) {
		this.weas = e;
		let n = {
			...defaultGuiConfig.buttons,
			...t?.buttons || {}
		}, r = {
			...defaultGuiConfig.controls,
			...t?.controls || {}
		}, i = {
			...defaultGuiConfig.timeline,
			...t?.timeline || {}
		}, a = t?.atomLegend || t?.legend || {}, o = {
			...defaultGuiConfig.atomLegend,
			...a
		}, s = {
			...defaultGuiConfig.meshLegend,
			...t?.meshLegend || {}
		}, c = {
			...defaultGuiConfig.buttonStyle,
			...t?.buttonStyle || {}
		};
		this.guiConfig = {
			...defaultGuiConfig,
			...t,
			buttons: n,
			controls: r,
			timeline: i,
			atomLegend: o,
			legend: o,
			meshLegend: s,
			buttonStyle: c
		}, this.gui = new GUI(), this.gui.closed = !0, this.guiConfig.controls.enabled || this.gui.hide(), this._folderBuilders = [];
	}
	registerFolder(e, t) {
		this._folderBuilders.push({
			name: e,
			builder: t
		});
	}
	initGUI() {
		this.createGUIContainer();
		for (let { name: e, builder: t } of this._folderBuilders) t(this.gui.addFolder(e), this);
	}
	createGUIContainer() {
		let e = this.weas.tjs.hud;
		this.gui.domElement.parentElement && this.gui.domElement.parentElement.removeChild(this.gui.domElement), this.gui.domElement.style.pointerEvents = "auto";
		let t = this.gui.domElement.querySelector("ul");
		t && (t.style.paddingTop = "25px"), e.addHTMLPanel("controls", this.gui.domElement, {
			anchor: "top-left",
			offset: {
				x: 1,
				y: 1
			}
		});
		let n = (e) => e.stopPropagation();
		[
			"click",
			"keydown",
			"keyup",
			"keypress"
		].forEach((e) => {
			this.gui.domElement.addEventListener(e, n, !1);
		});
	}
	addMaterialsFolder(e) {
		let t = this.weas.materialsRegistry, n = () => {
			let n = Object.entries(e.__folders).filter(([e, t]) => !t.closed).map(([e]) => e);
			for (let t in e.__folders) e.removeFolder(e.__folders[t]);
			for (let r of t.list()) {
				let i = t.getMaterial(r, !1), a = i.__builtIn ? `${r} (built-in)` : r, o = e.addFolder(a);
				n.includes(a) && o.open(), this.addFolderFromSchema(o, i, t.getSchema(r), {}), i.__builtIn && Object.values(o.__controllers).forEach(lockController), o.add({ copy: () => {
					let e = r + " Copy", n = 1, i = `${e} (${n})`;
					for (; t.list().includes(i);) n++, i = `${e} (${n})`;
					t.copyMaterial(r, i);
				} }, "copy").name("Copy"), i.__builtIn || o.add({ rename: () => {
					let e = prompt("Rename material to:", r);
					if (!(!e || e === r)) {
						if (t.list().includes(e)) {
							alert(`Material "${e}" already exists.`);
							return;
						}
						t.renameMaterial(r, e);
					}
				} }, "rename").name("Rename");
			}
		};
		this.refreshMaterials = () => {
			n(), this.refreshShapeOperations && this.refreshShapeOperations();
		}, t.onChange && t.onChange(this.refreshMaterials), this.refreshMaterials();
	}
	addShapeOperationsFolder(e) {
		let t = this.weas.shapeRegistry;
		this.refreshShapeOperations = () => {
			for (; e.__controllers.length > 0;) e.remove(e.__controllers[0]);
			for (let n of t.list()) t.isGUIVisible(n) && e.add({ create: () => {
				this.weas.ops.Shapes.ShapeOperation({
					shapeName: n,
					options: {}
				});
			} }, "create").name(n);
		}, t.onChange && t.onChange(this.refreshShapeOperations), this.weas.materialsRegistry?.onChange && this.weas.materialsRegistry.onChange(this.refreshShapeOperations), this.refreshShapeOperations();
	}
	addCameraControlsFolder(e) {
		let t = this.weas.tjs.cameraController, n = () => {
			for (; e.__controllers.length > 0;) e.remove(e.__controllers[0]);
			t.list().forEach((n) => {
				e.add({ load: () => t.view(n) }, "load").name(`View ${n}`);
			}), e.add({ save: () => {
				let e = prompt("Name of new camera view:");
				e && t.saveView(e);
			} }, "save").name("Save Current View");
		};
		n(), t.onChange(n);
	}
	addCameraSettingsFolder(e) {
		let t = this.weas.tjs.cameraController;
		t && (this.addFolderFromSchema(e, t, t.paramSchema, (e, n) => {
			t[e] = n, t.update(), t._emitChange();
		}), e.add({ reset: () => {
			t.resetSettings(), e.__controllers.forEach((e) => e.updateDisplay()), Object.values(e.__folders).forEach((e) => e.__controllers.forEach((e) => e.updateDisplay()));
		} }, "reset"));
	}
	addHUDSettingsFolder(e) {
		let t = this.weas.tjs.hud;
		if (!t) return;
		let n = () => {
			for (; e.__controllers.length;) e.remove(e.__controllers[0]);
			for (let t in e.__folders) e.removeFolder(e.__folders[t]);
			t.miniScenes.forEach((n, r) => {
				let i = e.addFolder(r);
				for (let e of [
					"top",
					"bottom",
					"left",
					"right"
				]) n.position[e] != null && i.add(n.position, e, 0, 2500, 1).onChange((n) => t.setMiniScenePosition(r, { [e]: n }));
				i.add(n, "width", 50, 500, 1).onChange((e) => {
					n.width = e, n.canvas.width = e;
				}), i.add(n, "height", 50, 500, 1).onChange((e) => {
					n.height = e, n.canvas.height = e;
				}), i.add(n, "rotation").onChange((e) => n.rotation = e), i.add(n, "visible").onChange((e) => n.visible = e);
			});
			for (let [n, r] of t.htmlElements) {
				let i = e.addFolder(n + " (HTML)");
				i.add(r, "anchor", t.ANCHORS).onChange(() => t._updateHTMLPosition(n)), i.add(r.offset, "x", -51, 150, 1).name("Offset % X").onChange(() => t._updateHTMLPosition(n)), i.add(r.offset, "y", -51, 151, 1).name("Offset % Y").onChange(() => t._updateHTMLPosition(n)), i.add(r, "visible").name("Visible").onChange((e) => t.setHTMLPanelVisible(n, e));
			}
		};
		t.onChange?.(n), n();
	}
	addLegendHUDFolder(e) {
		let t = this.weas.tjs.hud.legendHUD;
		t && this.addFolderFromSchema(e, t.settings, t.getSchema(), (e, n) => t.updateSettings({ [e]: n }));
	}
	addFolderFromSchema(e, t, n, r) {
		return createGUIFromSchema(e, t, n, r);
	}
}, BaseOperation = class {
	constructor(e) {
		this.weas = e, this.affectsAtoms = !0;
	}
	execute() {
		throw Error("Method 'execute()' must be implemented.");
	}
	undo() {
		throw Error("Method 'undo()' must be implemented.");
	}
	redo() {
		this.redoStatePatch() || this.execute();
	}
	setupGUI(e) {
		let t = this.getUISchema();
		if (!t) return;
		let { title: n, fields: r } = normalizeUISchema(t);
		n && renameFolder(e, n);
		let i = {};
		Object.keys(r).forEach((e) => {
			let t = r[e];
			t.path ? i[e] = getByPath$1(this, t.path) : i[e] = this[e];
		}), Object.entries(r).forEach(([t, n]) => {
			let r = addControllerFromSchema(e, i, t, n, resolveOptions(n.options, this));
			r && (n.step !== void 0 && r.step && r.step(n.step), (n.type === "text" && typeof r.onFinishChange == "function" ? r.onFinishChange : r.onChange).call(r, () => {
				this.adjust({ ...i });
			}));
		});
	}
	validateParams() {
		return !0;
	}
	adjustWithReset(e, t) {
		this.validateParams(e) && (t(), this.applyParams(e), this.execute(), this.weas && this.weas.ops && typeof this.weas.ops.onOperationAdjusted == "function" && this.weas.ops.onOperationAdjusted(this));
	}
	applyParams(e) {
		let t = this.getUISchema();
		if (t) {
			let { fields: n } = normalizeUISchema(t);
			Object.entries(e).forEach(([e, t]) => {
				let r = n[e];
				if (r && r.path) {
					setByPath(this, r.path, t);
					return;
				}
				e in this && (this[e] = t);
			});
			return;
		}
		Object.entries(e).forEach(([e, t]) => {
			e in this && (this[e] = t);
		});
	}
	adjust(e) {
		this.validateParams(e) && (this.applyParams(e), this.execute(), this.weas && this.weas.ops && typeof this.weas.ops.onOperationAdjusted == "function" && this.weas.ops.onOperationAdjusted(this));
	}
	getUISchema() {
		return this.uiFields || this.constructor.ui || null;
	}
	supportsAdjustGUI() {
		let e = this.getUISchema();
		if (!e) return !1;
		let { fields: t } = normalizeUISchema(e);
		return t && Object.keys(t).length > 0;
	}
	ensureStateStore() {
		if (!this.weas || !this.weas.state) throw Error("State store is required for this operation.");
	}
	stateGet(e, t = void 0) {
		this.ensureStateStore();
		let n = this.weas.state.get(e);
		return n === void 0 ? t : n;
	}
	stateSet(e, t) {
		this.ensureStateStore();
		let n = buildStatePatch(e, t);
		return this.weas.state.set(n), !0;
	}
	captureStatePatch(e, t, n) {
		let r = this.stateGet(e, {}), i = {};
		return Object.keys(t || {}).forEach((e) => {
			r && Object.prototype.hasOwnProperty.call(r, e) ? i[e] = cloneValue$2(r[e]) : n && (i[e] = cloneValue$2(n(e)));
		}), i;
	}
	applyStatePatch(e, t) {
		return this.stateSet(e, t);
	}
	applyStatePatchWithHistory(e, t, n) {
		return this.ensureStateStore(), this._stateHistory = {
			path: e,
			previous: this.captureStatePatch(e, t, n),
			next: cloneValue$2(t)
		}, this.stateSet(e, t), !0;
	}
	undoStatePatch() {
		return this._stateHistory ? (this.ensureStateStore(), this.stateSet(this._stateHistory.path, this._stateHistory.previous), !0) : !1;
	}
	redoStatePatch() {
		return this._stateHistory ? (this.ensureStateStore(), this.stateSet(this._stateHistory.path, this._stateHistory.next), !0) : !1;
	}
};
function renameFolder(e, t) {
	let n = e.domElement.querySelector(".title");
	n && (n.textContent = t);
}
//#endregion
//#region src/operation/transform.js
var transform_exports = /* @__PURE__ */ __exportAll({
	RotateOperation: () => RotateOperation,
	ScaleOperation: () => ScaleOperation,
	TranslateOperation: () => TranslateOperation
}), TranslateOperation = class extends BaseOperation {
	static description = "Translate";
	static category = "Edit";
	static ui = {
		title: "Translate",
		fields: {
			x: {
				type: "number",
				min: -10,
				max: 10,
				step: .1,
				path: "vector.x"
			},
			y: {
				type: "number",
				min: -10,
				max: 10,
				step: .1,
				path: "vector.y"
			},
			z: {
				type: "number",
				min: -10,
				max: 10,
				step: .1,
				path: "vector.z"
			}
		}
	};
	constructor({ weas: e, vector: t = new THREE$1.Vector3(), constraintType: n = null, axis: r = null, planeNormal: i = null }) {
		super(e), this.currentFrame = e.avr.currentFrame, this.selectedAtomsIndices = Array.from(this.stateGet("viewer.selectedAtomsIndices", []) || []), this.selectedObjects = e.selectionManager.selectedObjects, Array.isArray(t) && (t = new THREE$1.Vector3(t[0], t[1], t[2])), this.vector = t.clone(), this.constraintType = n || null, this.axis = r ? r.clone() : new THREE$1.Vector3(), this.normal = new THREE$1.Vector3(), this.planeNormal = new THREE$1.Vector3(), this.planeU = new THREE$1.Vector3(), this.planeV = new THREE$1.Vector3(), this.distance = 0, this.uDistance = 0, this.vDistance = 0, this.constraintType === "axis" && this.axis.lengthSq() === 0 && this.axis.set(1, 0, 0), this.constraintType === "normal" && i && this.normal.copy(i), this.constraintType === "plane" && i && this.planeNormal.copy(i), this.refreshConstraintStateFromVector(), this.uiFields = this.buildUISchema();
	}
	execute() {
		this.weas.avr.currentFrame = this.currentFrame, this.weas.selectionManager.selectedObjects = this.selectedObjects, this.weas.avr.translateSelectedAtoms({
			translateVector: this.vector,
			indices: this.selectedAtomsIndices
		}), this.weas.objectManager.translateSelectedObjects({ translateVector: this.vector }), this.weas.selectionManager.refreshAxisLine();
	}
	undo() {
		this.weas.avr.currentFrame = this.currentFrame;
		let e = this.vector.clone().negate();
		this.weas.avr.translateSelectedAtoms({
			translateVector: e,
			indices: this.selectedAtomsIndices
		}), this.weas.selectionManager.selectedObjects = this.selectedObjects, this.weas.objectManager.translateSelectedObjects({ translateVector: e }), this.weas.selectionManager.refreshAxisLine();
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
				distance: {
					type: "number",
					min: -10,
					max: 10,
					step: .1
				},
				axisX: {
					type: "number",
					min: -1,
					max: 1,
					step: .01,
					path: "axis.x"
				},
				axisY: {
					type: "number",
					min: -1,
					max: 1,
					step: .01,
					path: "axis.y"
				},
				axisZ: {
					type: "number",
					min: -1,
					max: 1,
					step: .01,
					path: "axis.z"
				}
			}
		} : this.constraintType === "normal" ? {
			title: "Translate (Normal)",
			fields: {
				distance: {
					type: "number",
					min: -10,
					max: 10,
					step: .1
				},
				normalX: {
					type: "number",
					min: -1,
					max: 1,
					step: .01,
					path: "normal.x"
				},
				normalY: {
					type: "number",
					min: -1,
					max: 1,
					step: .01,
					path: "normal.y"
				},
				normalZ: {
					type: "number",
					min: -1,
					max: 1,
					step: .01,
					path: "normal.z"
				}
			}
		} : this.constraintType === "plane" ? {
			title: "Translate (Plane)",
			fields: {
				u: {
					type: "number",
					min: -10,
					max: 10,
					step: .1,
					path: "uDistance"
				},
				v: {
					type: "number",
					min: -10,
					max: 10,
					step: .1,
					path: "vDistance"
				},
				normalX: {
					type: "number",
					min: -1,
					max: 1,
					step: .01,
					path: "planeNormal.x"
				},
				normalY: {
					type: "number",
					min: -1,
					max: 1,
					step: .01,
					path: "planeNormal.y"
				},
				normalZ: {
					type: "number",
					min: -1,
					max: 1,
					step: .01,
					path: "planeNormal.z"
				}
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
			this.normalizeAxis(this.normal, new THREE$1.Vector3(0, 0, 1)), this.distance = this.vector.dot(this.normal);
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
			this.normalizeAxis(this.normal, new THREE$1.Vector3(0, 0, 1)), this.vector.copy(this.normal).multiplyScalar(this.distance || 0);
			return;
		}
		this.constraintType === "plane" && (this.ensurePlaneBasis(), this.vector.copy(this.planeU).multiplyScalar(this.uDistance || 0).add(this.planeV.clone().multiplyScalar(this.vDistance || 0)));
	}
	normalizeAxis(e, t = new THREE$1.Vector3(1, 0, 0)) {
		(!e || e.lengthSq() === 0) && e.copy(t), e.normalize();
	}
	ensurePlaneBasis() {
		this.normalizeAxis(this.planeNormal, new THREE$1.Vector3(0, 0, 1));
		let e = this.planeNormal, t = Math.abs(e.x) < .9 ? new THREE$1.Vector3(1, 0, 0) : new THREE$1.Vector3(0, 1, 0), n = new THREE$1.Vector3().crossVectors(e, t);
		n.lengthSq() === 0 && n.crossVectors(e, new THREE$1.Vector3(0, 0, 1)), n.normalize();
		let r = new THREE$1.Vector3().crossVectors(e, n).normalize();
		this.planeU.copy(n), this.planeV.copy(r);
	}
}, RotateOperation = class extends BaseOperation {
	static description = "Rotate";
	static category = "Edit";
	static ui = {
		title: "Rotate",
		fields: {
			angle: {
				type: "number",
				min: -360,
				max: 360,
				step: 1,
				path: "angle"
			},
			x: {
				type: "number",
				min: -1,
				max: 1,
				step: .01,
				path: "axis.x"
			},
			y: {
				type: "number",
				min: -1,
				max: 1,
				step: .01,
				path: "axis.y"
			},
			z: {
				type: "number",
				min: -1,
				max: 1,
				step: .01,
				path: "axis.z"
			}
		}
	};
	constructor({ weas: e, axis: t, angle: n, centroid: r = null }) {
		super(e), this.currentFrame = e.avr.currentFrame, this.selectedAtomsIndices = Array.from(this.stateGet("viewer.selectedAtomsIndices", []) || []), this.selectedObjects = e.selectionManager.selectedObjects, Array.isArray(t) && (t = new THREE$1.Vector3(t[0], t[1], t[2])), this.axis = t, this.angle = n, this.centroid = r;
	}
	execute() {
		this.weas.avr.currentFrame = this.currentFrame, this.weas.selectionManager.selectedObjects = this.selectedObjects, this.weas.avr.rotateSelectedAtoms({
			cameraDirection: this.axis,
			rotationAngle: this.angle,
			indices: this.selectedAtomsIndices,
			centroid: this.centroid
		}), this.weas.objectManager.rotateSelectedObjects({
			rotationAxis: this.axis,
			rotationAngle: this.angle
		}), this.weas.selectionManager.refreshAxisLine();
	}
	undo() {
		this.weas.avr.currentFrame = this.currentFrame, this.weas.selectionManager.selectedObjects = this.selectedObjects, this.weas.avr.rotateSelectedAtoms({
			cameraDirection: this.axis,
			rotationAngle: -this.angle,
			indices: this.selectedAtomsIndices,
			centroid: this.centroid
		}), this.weas.objectManager.rotateSelectedObjects({
			rotationAxis: this.axis,
			rotationAngle: -this.angle
		}), this.weas.selectionManager.refreshAxisLine();
	}
	adjust(e) {
		this.adjustWithReset(e, () => {
			this.undo();
		});
	}
}, ScaleOperation = class extends BaseOperation {
	static description = "Scale";
	static category = "Edit";
	static ui = {
		title: "Scale",
		fields: {
			x: {
				type: "number",
				min: .001,
				max: 10,
				step: .01,
				path: "scale.x"
			},
			y: {
				type: "number",
				min: .001,
				max: 10,
				step: .01,
				path: "scale.y"
			},
			z: {
				type: "number",
				min: .001,
				max: 10,
				step: .01,
				path: "scale.z"
			}
		}
	};
	constructor({ weas: e, scale: t = new THREE$1.Vector3() }) {
		super(e), this.currentFrame = e.avr.currentFrame, this.selectedAtomsIndices = Array.from(this.stateGet("viewer.selectedAtomsIndices", []) || []), this.selectedObjects = e.selectionManager.selectedObjects, Array.isArray(t) && (t = new THREE$1.Vector3(t[0], t[1], t[2])), this.scale = t.clone();
	}
	execute() {
		this.weas.avr.currentFrame = this.currentFrame, this.weas.selectionManager.selectedObjects = this.selectedObjects, this.weas.objectManager.scaleSelectedObjects({ scale: this.scale });
	}
	undo() {
		this.weas.avr.currentFrame = this.currentFrame, this.weas.selectionManager.selectedObjects = this.selectedObjects;
		let e = new THREE$1.Vector3(1 / this.scale.x, 1 / this.scale.y, 1 / this.scale.z);
		this.weas.objectManager.scaleSelectedObjects({ scale: e });
	}
	adjust(e) {
		this.adjustWithReset(e, () => {
			this.undo();
		});
	}
}, TransformControls = class {
	constructor(e, t) {
		this.weas = e, this.eventHandler = t, this.tjs = e.tjs, this.objectMode = "edit", this.mode = null, this.init();
	}
	init() {
		this.translatePlane = new THREE$1.Plane(new THREE$1.Vector3(0, 0, 1), 0), this.translateVector = new THREE$1.Vector3(), this.translateAxisLock = null, this.translateAxis = new THREE$1.Vector3(), this.translateConstraintType = null, this.translatePlaneNormal = new THREE$1.Vector3(), this.translatePlaneOrigin = new THREE$1.Vector3(), this.translatePlanePending = !1, this.rotationAxisLock = null, this.rotationAxis = new THREE$1.Vector3(), this.rotationAxisLockKey = null, this.rotationMatrix = new THREE$1.Matrix4(), this.centroid = new THREE$1.Vector3(), this.centroidNDC = new THREE$1.Vector2(), this.rotationAxis = new THREE$1.Vector3(), this.rotationCentroid = new THREE$1.Vector3(), this.initialAtomPositions = /* @__PURE__ */ new Map(), this.initialObjectState = /* @__PURE__ */ new Map(), this.cameraDirection = new THREE$1.Vector3(0, 0, -1);
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
		if (this.cameraDirection = new THREE$1.Vector3(0, 0, -1), this.cameraDirection.applyQuaternion(this.tjs.camera.quaternion), this.mode === "translate") this.translatePlane.normal.copy(this.cameraDirection), this.translateAxisLock = null, this.translateConstraintType = null, this.translatePlanePending = !1, this.weas.selectionManager.hideTranslateAxisLine(), this.weas.selectionManager.setModeHint("Translate mode: move mouse to translate, press A to set axis, X/Y/Z to lock"), this.weas.selectionManager.axisAtomIndices?.length === 3 ? this.setTranslatePlaneFromAtoms() : this.weas.selectionManager.axisAtomIndices?.length === 2 && this.setTranslateAxisFromAtoms();
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
		let e = this.mode;
		if (this.mode === "translate") {
			let e = this.getTranslateVector(this.eventHandler.currentMousePosition, this.initialMousePosition), t = this.translateConstraintType, n = null, r = null;
			t === "axis" ? n = this.translateAxis.clone() : (t === "plane" || t === "normal") && (r = this.translatePlaneNormal.clone());
			let i = new TranslateOperation({
				weas: this.weas,
				vector: e,
				constraintType: t,
				axis: n,
				planeNormal: r
			});
			this.weas.ops.execute(i, !1);
		} else if (this.mode === "rotate") {
			let e = this.getRotationAngle(this.eventHandler.currentMousePosition, this.initialMousePosition), t = new RotateOperation({
				weas: this.weas,
				axis: this.rotationAxis,
				angle: e,
				centroid: this.rotationCentroid
			});
			this.weas.ops.execute(t, !1);
		} else if (this.mode === "scale") {
			let e = this.getScaleVector(this.eventHandler.currentMousePosition, this.initialMousePosition), t = new ScaleOperation({
				weas: this.weas,
				scale: e
			});
			this.weas.ops.execute(t, !1);
		}
		this.mode = null, e === "rotate" && (this.weas.selectionManager.hideAxisVisuals(), this.weas.selectionManager.stopAxisPicking(), this.weas.selectionManager.hideRotateAxisLine(), this.rotationAxisLock = null, this.rotationAxisLockKey = null), e === "translate" && (this.weas.selectionManager.hideTranslateAxisLine(), this.weas.selectionManager.hideAxisVisuals(), this.weas.selectionManager.stopAxisPicking("Translate mode: move mouse to translate, press A to set axis, X/Y/Z to lock"), this.weas.selectionManager.hideTranslatePlane(), this.translateAxisLock = null, this.translateConstraintType = null, this.translatePlaneNormal.set(0, 0, 0), this.translatePlaneOrigin.set(0, 0, 0), this.translatePlanePending = !1), this.weas.selectionManager.setModeHint(""), this.initialAtomPositions.clear(), this.weas.avr.selectedAtomsIndices.length > 0 && (this.weas.avr.drawModels(), this.weas.avr.selectedAtomsIndices = this.weas.avr.selectedAtomsIndices);
	}
	exitMode() {
		if (!this.mode) return;
		let e = this.mode;
		this.mode = null, this.weas.avr.resetSelectedAtomsPositions({ initialAtomPositions: this.initialAtomPositions }), this.weas.ops.hideGUI(), e === "rotate" && (this.weas.selectionManager.hideAxisVisuals(), this.weas.selectionManager.stopAxisPicking(), this.weas.selectionManager.hideRotateAxisLine(), this.rotationAxisLock = null, this.rotationAxisLockKey = null), e === "translate" && (this.weas.selectionManager.hideTranslateAxisLine(), this.weas.selectionManager.hideAxisVisuals(), this.weas.selectionManager.stopAxisPicking("Translate mode: move mouse to translate, press A to set axis, X/Y/Z to lock"), this.weas.selectionManager.hideTranslatePlane(), this.translateAxisLock = null, this.translateConstraintType = null, this.translatePlaneNormal.set(0, 0, 0), this.translatePlaneOrigin.set(0, 0, 0), this.translatePlanePending = !1), this.weas.selectionManager.setModeHint(""), this.weas.selectionManager.selectedObjects.forEach((e) => {
			let t = this.initialObjectState.get(e.uuid);
			e.position.copy(t.position), e.scale.copy(t.scale), e.rotation.copy(t.rotation);
		});
	}
	getCentroidNDC(e = null) {
		if (this.weas.avr.selectedAtomsIndices.length > 0) e || (e = new THREE$1.Vector3(0, 0, 0), this.weas.avr.selectedAtomsIndices.forEach((t) => {
			e.add(new THREE$1.Vector3(...this.weas.avr.atoms.positions[t]));
		}), e.divideScalar(this.weas.avr.selectedAtomsIndices.length));
		else if (this.weas.selectionManager.selectedObjects.length > 0) e || (e = new THREE$1.Vector3(0, 0, 0), this.weas.selectionManager.selectedObjects.forEach((t) => {
			e.add(t.position);
		}), e.divideScalar(this.weas.selectionManager.selectedObjects.length));
		else {
			this.mode = null;
			return;
		}
		let t = e.clone().project(this.tjs.camera);
		this.centroidNDC = new THREE$1.Vector2(t.x, t.y);
	}
	refreshRotationPivot() {
		this.updateRotationReference(), this.getCentroidNDC(this.rotationCentroid);
	}
	updateRotationReference() {
		if (this.rotationAxis.copy(this.cameraDirection), this.rotationCentroid.set(0, 0, 0), this.rotationAxisLock) {
			this.rotationAxis.copy(this.rotationAxisLock);
			let e = this.getSelectionCentroid();
			this.rotationCentroid.copy(e);
			return;
		}
		let e = this.weas.selectionManager.axisAtomIndices || [], t = this.weas.avr.selectedAtomsIndices;
		if (e.length === 3) {
			let t = this.weas?.avr?.atoms?.positions;
			if (t && t[e[0]] && t[e[1]] && t[e[2]]) {
				let n = new THREE$1.Vector3(...t[e[0]]), r = new THREE$1.Vector3(...t[e[1]]), i = new THREE$1.Vector3(...t[e[2]]), a = r.clone().sub(n).cross(i.clone().sub(n));
				if (a.lengthSq() > 0) {
					let e = a.normalize();
					e.dot(this.cameraDirection) < 0 && e.negate(), this.rotationAxis.copy(e), this.rotationCentroid.copy(n.clone().add(r).add(i).multiplyScalar(1 / 3));
					return;
				}
			}
		} else if (e.length === 2) {
			let t = new THREE$1.Vector3(...this.weas.avr.atoms.positions[e[0]]), n = new THREE$1.Vector3(...this.weas.avr.atoms.positions[e[1]]), r = n.clone().sub(t);
			if (r.lengthSq() > 0) {
				this.rotationAxis.copy(r.normalize()), this.rotationCentroid.copy(t.clone().add(n).multiplyScalar(.5));
				return;
			}
		} else if (e.length === 1) {
			this.rotationCentroid.copy(new THREE$1.Vector3(...this.weas.avr.atoms.positions[e[0]]));
			return;
		}
		if (t.length === 3) {
			let e = this.weas?.avr?.atoms?.positions;
			if (e && e[t[0]] && e[t[1]] && e[t[2]]) {
				let n = new THREE$1.Vector3(...e[t[0]]), r = new THREE$1.Vector3(...e[t[1]]), i = new THREE$1.Vector3(...e[t[2]]), a = r.clone().sub(n).cross(i.clone().sub(n));
				if (a.lengthSq() > 0) {
					let e = a.normalize();
					e.dot(this.cameraDirection) < 0 && e.negate(), this.rotationAxis.copy(e), this.rotationCentroid.copy(n.clone().add(r).add(i).multiplyScalar(1 / 3));
					return;
				}
			}
		}
		t.length > 0 ? (t.forEach((e) => {
			this.rotationCentroid.add(new THREE$1.Vector3(...this.weas.avr.atoms.positions[e]));
		}), this.rotationCentroid.divideScalar(t.length)) : this.weas.selectionManager.selectedObjects.length > 0 && (this.weas.selectionManager.selectedObjects.forEach((e) => {
			this.rotationCentroid.add(e.position);
		}), this.rotationCentroid.divideScalar(this.weas.selectionManager.selectedObjects.length));
	}
	storeInitialObjectState() {
		this.weas.avr.selectedAtomsIndices.forEach((e) => {
			let t = new THREE$1.Matrix4();
			this.weas.avr.atomManager.meshes.atom.getMatrixAt(e, t);
			let n = new THREE$1.Vector3();
			t.decompose(n, new THREE$1.Quaternion(), new THREE$1.Vector3()), this.initialAtomPositions.set(e, n.clone());
		}), this.weas.selectionManager.selectedObjects.forEach((e) => {
			this.initialObjectState.set(e.uuid, {
				position: e.position.clone(),
				scale: e.scale.clone(),
				rotation: e.rotation.clone()
			});
		});
	}
	translateSelectedObjects(e) {
		let t = this.getTranslateVector(this.eventHandler.currentMousePosition, this.eventHandler.previousMousePosition);
		this.weas.avr.translateSelectedAtoms({ translateVector: t }), this.weas.objectManager.translateSelectedObjects({ translateVector: t }), this.weas.selectionManager.refreshAxisLine();
	}
	getNDC(e) {
		return new THREE$1.Vector2((e.x - this.tjs.viewerRect.left) / this.tjs.viewerRect.width * 2 - 1, -((e.y - this.tjs.viewerRect.top) / this.tjs.viewerRect.height) * 2 + 1);
	}
	getTranslateVector(e, t) {
		let n = this.getNDC(e), r = getWorldPositionFromScreen(this.tjs.camera, n, this.translatePlane), i = this.getNDC(t), a = getWorldPositionFromScreen(this.tjs.camera, i, this.translatePlane), o = r.sub(a);
		if (this.translatePlanePending) return new THREE$1.Vector3(0, 0, 0);
		if (!this.translateConstraintType) return o;
		if (this.translateConstraintType === "axis") return this.translateAxis.clone().multiplyScalar(o.dot(this.translateAxis));
		if (this.translateConstraintType === "plane") {
			let e = this.translatePlaneNormal.clone().normalize();
			return o.sub(e.multiplyScalar(o.dot(e)));
		}
		if (this.translateConstraintType === "normal") {
			let e = this.translatePlaneNormal.clone().normalize();
			return e.multiplyScalar(o.dot(e));
		}
		return o;
	}
	rotateSelectedObjects(e) {
		let t = this.getRotationAngle(this.eventHandler.currentMousePosition, this.eventHandler.previousMousePosition);
		Math.abs(t) > 1e-4 && (this.weas.avr.rotateSelectedAtoms({
			cameraDirection: this.rotationAxis,
			rotationAngle: t,
			centroid: this.rotationCentroid
		}), this.weas.objectManager.rotateSelectedObjects({
			rotationAxis: this.rotationAxis,
			rotationAngle: t
		}), this.weas.selectionManager.refreshAxisLine());
	}
	scaleSelectedObjects(e) {
		let t = this.getScaleVector(this.eventHandler.currentMousePosition, this.eventHandler.previousMousePosition);
		t && (this.weas.objectManager.scaleSelectedObjects({ scale: t }), this.weas.selectionManager.refreshAxisLine());
	}
	setTranslateAxisLock(e) {
		if (!e) {
			this.translateAxisLock = null, this.translateConstraintType = null, this.translatePlanePending = !1, this.weas.selectionManager.hideTranslateAxisLine(), this.weas.selectionManager.setModeHint("Translate mode: move mouse to translate, press A to set axis, X/Y/Z to lock");
			return;
		}
		this.translateAxisLock = e, this.translateConstraintType = "axis", this.weas.selectionManager.hideTranslatePlane(), e === "x" ? this.translateAxis.set(1, 0, 0) : e === "y" ? this.translateAxis.set(0, 1, 0) : this.translateAxis.set(0, 0, 1);
		let t = this.getSelectionCentroid();
		this.weas.selectionManager.showTranslateAxisLine(t, this.translateAxis), this.weas.selectionManager.setModeHint(`Translate mode: locked to ${e.toUpperCase()} axis`);
	}
	setTranslateAxisFromAtoms() {
		let e = this.weas.selectionManager.axisAtomIndices || [];
		if (e.length !== 2) return !1;
		let t = this.weas?.avr?.atoms?.positions;
		if (!t || !t[e[0]] || !t[e[1]]) return !1;
		let n = new THREE$1.Vector3(...t[e[0]]), r = new THREE$1.Vector3(...t[e[1]]).clone().sub(n);
		return r.lengthSq() === 0 ? !1 : (this.translateAxis.copy(r.normalize()), this.translateAxisLock = "axis", this.translateConstraintType = "axis", this.translatePlaneNormal.set(0, 0, 0), this.translatePlaneOrigin.set(0, 0, 0), this.translatePlanePending = !1, this.weas.selectionManager.hideTranslatePlane(), this.weas.selectionManager.hideTranslateAxisLine(), this.weas.selectionManager.showAxisVisuals(), this.weas.selectionManager.setModeHint("Translate mode: locked to atom axis"), !0);
	}
	setTranslatePlaneFromAtoms() {
		let e = this.weas.selectionManager.axisAtomIndices || [];
		if (e.length !== 3) return !1;
		let t = this.weas?.avr?.atoms?.positions;
		if (!t || !t[e[0]] || !t[e[1]] || !t[e[2]]) return !1;
		let n = new THREE$1.Vector3(...t[e[0]]), r = new THREE$1.Vector3(...t[e[1]]), i = new THREE$1.Vector3(...t[e[2]]), a = r.clone().sub(n).cross(i.clone().sub(n));
		return a.lengthSq() === 0 ? !1 : (this.translatePlaneNormal.copy(a.normalize()), this.translatePlaneOrigin.copy(n.clone().add(r).add(i).multiplyScalar(1 / 3)), this.translateConstraintType = null, this.translateAxisLock = null, this.translatePlanePending = !0, this.weas.selectionManager.hideTranslateAxisLine(), this.weas.selectionManager.showAxisVisuals(), this.weas.selectionManager.showTranslatePlane(this.translatePlaneOrigin, this.translatePlaneNormal), this.weas.selectionManager.setModeHint("Translate mode: choose plane (P) or normal (N)"), !0);
	}
	setTranslatePlaneConstraint(e) {
		e !== "plane" && e !== "normal" || this.translatePlaneNormal.lengthSq() !== 0 && (this.translateConstraintType = e, this.translateAxisLock = null, this.translatePlanePending = !1, this.weas.selectionManager.hideTranslateAxisLine(), this.weas.selectionManager.setModeHint(`Translate mode: locked to ${e}`));
	}
	setRotateAxisLock(e) {
		if (!e) {
			this.rotationAxisLock = null, this.rotationAxisLockKey = null, this.weas.selectionManager.hideRotateAxisLine(), this.weas.selectionManager.setModeHint("Rotate mode: move mouse to rotate, press A to set axis, X/Y/Z to lock"), this.refreshRotationPivot(), this.eventHandler?.currentMousePosition && (this.initialMousePosition = this.eventHandler.currentMousePosition.clone());
			return;
		}
		this.rotationAxisLockKey = e, e === "x" ? this.rotationAxisLock = new THREE$1.Vector3(1, 0, 0) : e === "y" ? this.rotationAxisLock = new THREE$1.Vector3(0, 1, 0) : this.rotationAxisLock = new THREE$1.Vector3(0, 0, 1);
		let t = this.getSelectionCentroid();
		this.weas.selectionManager.showRotateAxisLine(t, this.rotationAxisLock), this.weas.selectionManager.setModeHint(`Rotate mode: locked to ${e.toUpperCase()} axis`), this.refreshRotationPivot(), this.eventHandler?.currentMousePosition && (this.initialMousePosition = this.eventHandler.currentMousePosition.clone());
	}
	getSelectionCentroid() {
		let e = new THREE$1.Vector3(0, 0, 0);
		return this.weas.avr.selectedAtomsIndices.length > 0 ? (this.weas.avr.selectedAtomsIndices.forEach((t) => {
			e.add(new THREE$1.Vector3(...this.weas.avr.atoms.positions[t]));
		}), e.divideScalar(this.weas.avr.selectedAtomsIndices.length), e) : (this.weas.selectionManager.selectedObjects.length > 0 && (this.weas.selectionManager.selectedObjects.forEach((t) => {
			e.add(t.position);
		}), e.divideScalar(this.weas.selectionManager.selectedObjects.length)), e);
	}
	getScaleVector(e, t) {
		let n = this.getNDC(t), r = this.getNDC(e);
		if (n.equals(r)) return;
		let i = new THREE$1.Vector2().subVectors(n, this.centroidNDC), a = new THREE$1.Vector2().subVectors(r, this.centroidNDC).length() / i.length();
		return new THREE$1.Vector3(a, a, a);
	}
	getRotationAngle(e, t) {
		let n = this.getNDC(t), r = this.getNDC(e);
		if (n.equals(r)) return;
		let i = new THREE$1.Vector2().subVectors(n, this.centroidNDC), a = new THREE$1.Vector2().subVectors(r, this.centroidNDC);
		i.normalize(), a.normalize();
		let o = Math.acos(i.dot(a));
		return i.x * a.y - i.y * a.x < 0 && (o = -o), o = THREE$1.MathUtils.radToDeg(o), o;
	}
}, EventHandlers = class {
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
		TranslateOperation: () => this.transformControls.enterMode("translate", this.currentMousePosition),
		ScaleOperation: () => this.transformControls.enterMode("scale", this.currentMousePosition),
		RotateOperation: () => this.transformControls.enterMode("rotate", this.currentMousePosition),
		CopyOperation: () => {
			this.weas.ops.object.CopyOperation(), this.transformControls.enterMode("translate", this.currentMousePosition);
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
		this.weas = e, this.tjs = e.tjs, this.init(), this.transformControls = new TransformControls(e, this), this.setupEventListeners(), this._registerKeybinds();
	}
	_registerKeybinds() {
		let e = this.weas.keybindManager;
		if (!e) return;
		e.beforeDispatch = (e) => this.handleTransformModeKeys(e);
		let t = e.getConfig();
		for (let [n, r] of Object.entries(this.actionMap)) e.register(n, r, t[n] || null);
	}
	init() {
		this.isMouseDown = !1, this.mouseDownPosition = new THREE$1.Vector2(), this.mouseUpPosition = new THREE$1.Vector2(), this.currentMousePosition = new THREE$1.Vector2(), this.previousMousePosition = new THREE$1.Vector2(), this.boxselect = !1, this.dragMode = null, this.isDragging = !1;
	}
	setupEventListeners() {
		let e = this.weas.tjs.containerElement;
		e.addEventListener("pointerdown", this.onMouseDown.bind(this), !1), e.addEventListener("pointerup", this.onMouseUp.bind(this), !1), e.addEventListener("click", this.onMouseClick.bind(this), !1), e.addEventListener("mousemove", this.onMouseMove.bind(this), !1), e.setAttribute("tabindex", "0");
	}
	onMouseDown(e) {
		this.isMouseDown = !0, this.mouseDownPosition.set(e.clientX, e.clientY), e.shiftKey && e.altKey && this.transformControls.mode === null && this.weas.selectionManager.startLasso(e);
	}
	onMouseUp(e) {
		this.isMouseDown = !1, this.isDragging = !1, this.mouseUpPosition.set(e.clientX, e.clientY), this.weas.selectionManager.finishLasso();
	}
	onMouseMove(e) {
		if (this.previousMousePosition.copy(this.currentMousePosition), this.currentMousePosition.set(e.clientX, e.clientY), this.isMouseDown) {
			let t = e.clientX - this.mouseDownPosition.x, n = e.clientY - this.mouseDownPosition.y;
			Math.sqrt(t * t + n * n) > 5 && (this.isDragging = !0);
		}
		if (this.transformControls.mode !== null) {
			if ((this.transformControls.mode === "rotate" || this.transformControls.mode === "translate") && this.weas.selectionManager.isAxisPicking) return;
			this.transformControls.onMouseMove(e);
		} else this.isMouseDown && e.shiftKey && e.altKey ? this.weas.selectionManager.dragLasso(e) : this.isMouseDown && e.shiftKey && this.weas.selectionManager.dragSelection(e);
	}
	handleTransformModeKeys(e) {
		let t = e.key.toLowerCase();
		if (this.transformControls.mode === "translate") {
			if ([
				"x",
				"y",
				"z"
			].includes(t)) return this.transformControls.setTranslateAxisLock(this.transformControls.translateAxisLock === t ? null : t), !0;
			if (["p", "n"].includes(t)) return this.transformControls.setTranslatePlaneConstraint(t === "p" ? "plane" : "normal"), this.transformControls.initialMousePosition = this.currentMousePosition.clone(), !0;
			if (t === "a") return this.weas.selectionManager.isAxisPicking ? (this.weas.selectionManager.stopAxisPicking("Translate mode: move mouse to translate, press A to set axis, X/Y/Z to lock"), this.weas.selectionManager.axisAtomIndices.length === 3 ? this.transformControls.setTranslatePlaneFromAtoms() : this.weas.selectionManager.axisAtomIndices.length === 2 && this.transformControls.setTranslateAxisFromAtoms(), this.transformControls.initialMousePosition = this.currentMousePosition.clone()) : (this.transformControls.setTranslateAxisLock(null), this.weas.selectionManager.hideTranslatePlane(), this.weas.selectionManager.startAxisPicking("translate"), this.weas.selectionManager.setModeHint("Axis pick: click 2 or 3 atoms, press A to exit")), !0;
		}
		if (this.transformControls.mode === "rotate") {
			if ([
				"x",
				"y",
				"z"
			].includes(t)) return this.transformControls.setRotateAxisLock(this.transformControls.rotationAxisLockKey === t ? null : t), !0;
			if (t === "a") return this.weas.selectionManager.isAxisPicking ? (this.weas.selectionManager.stopAxisPicking(), this.transformControls.refreshRotationPivot(), this.transformControls.initialMousePosition = this.currentMousePosition.clone()) : this.weas.selectionManager.startAxisPicking("rotate"), !0;
		}
		return !1;
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
		if (this.transformControls.mode === "translate" && this.transformControls.translatePlanePending) return;
		if (this.transformControls.mode) {
			this.transformControls.confirmOperation();
			return;
		}
		this.weas.ops.hideGUI();
		let t = e.clientX - this.mouseDownPosition.x, n = e.clientY - this.mouseDownPosition.y;
		Math.sqrt(t * t + n * n) > 5 || this.weas.selectionManager.pickSelection(e);
	}
	dispatchAtomsUpdated() {
		this.weas.avr.trajectory.uuid = THREE$1.MathUtils.generateUUID();
		let e = new CustomEvent("atomsUpdated", { detail: this.weas.avr.trajectory });
		this.tjs.containerElement.dispatchEvent(e);
	}
	dispatchViewerUpdated(e) {
		let t = new CustomEvent("viewerUpdated", { detail: e });
		this.tjs.containerElement.dispatchEvent(t);
	}
}, ObjectManager = class {
	constructor(e) {
		this.weas = e, this.selectionManager = e.selectionManager, this.scene = e.tjs.scene;
	}
	translateSelectedObjects(e, t = null) {
		let n = e;
		e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "translateVector") && ({translateVector: n, selectedObjects: t = null} = e), t === null && (t = this.selectionManager.selectedObjects), t.forEach((e) => {
			let t = e.position.clone();
			e.position.copy(t.add(n));
		});
	}
	rotateSelectedObjects(e, t, n = null) {
		let r = e;
		e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "rotationAxis") && ({rotationAxis: r, rotationAngle: t, selectedObjects: n = null} = e), n === null && (n = this.selectionManager.selectedObjects), r = r.normalize(), t = THREE$1.MathUtils.degToRad(t), n.forEach((e) => {
			e.rotateOnAxis(r, -t);
		});
	}
	deleteSelectedObjects() {
		this.selectionManager.selectedObjects.forEach((e) => {
			clearObject(this.scene, e);
		}), this.selectionManager.clearSelection();
	}
	scaleSelectedObjects(e, t = null) {
		let n = e;
		e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "scale") && ({scale: n, selectedObjects: t = null} = e), t === null && (t = this.selectionManager.selectedObjects), t.forEach((e) => {
			e.scale.multiply(n);
		});
	}
	copySelectedObjects() {
		let e = [];
		return this.selectionManager.selectedObjects.forEach((t) => {
			let n = t.clone();
			n.position.add(new THREE$1.Vector3(1, 1, 1)), this.scene.add(n), e.push(n);
		}), this.selectionManager.selectedObjects = e, e;
	}
	enterMode(e) {
		this.weas.activeObject !== null && (this.weas.activeObject.userData.objectMode = e, e === "edit" ? (this.weas.activeObject.userData.vertexPoints || initVertexIndicators(this.weas.activeObject), this.weas.activeObject.userData.vertexPoints.visible = !0) : this.weas.activeObject.userData.vertexPoints && (this.weas.activeObject.userData.vertexPoints.visible = !1));
	}
};
function createOutline(e, t = 1.1) {
	let n = new THREE$1.MeshBasicMaterial({
		color: 16776960,
		side: THREE$1.BackSide,
		transparent: !0,
		opacity: .8
	}), r = new THREE$1.Mesh(e.geometry, n);
	r.scale.multiplyScalar(t), r.layers.set(1), e.add(r), e.userData.outlineMesh = r;
}
function removeOutline(e) {
	e.userData.outlineMesh && (e.remove(e.userData.outlineMesh), e.userData.outlineMesh = void 0);
}
function initVertexIndicators(e) {
	let t = e.geometry.attributes.position, n = t.count, r = new THREE$1.PointsMaterial({
		vertexColors: !0,
		size: 5,
		sizeAttenuation: !1
	}), i = new THREE$1.BufferGeometry();
	i.setAttribute("position", t);
	let a = new Float32Array(n * 3);
	for (let e = 0; e < n; e++) a[e * 3] = 0, a[e * 3 + 1] = 0, a[e * 3 + 2] = 0;
	i.setAttribute("color", new THREE$1.BufferAttribute(a, 3));
	let o = new THREE$1.Points(i, r);
	e.add(o), o.layers.set(1), e.userData.vertexPoints = o;
}
//#endregion
//#region node_modules/three/examples/jsm/interactive/SelectionBox.js
var _frustum = new Frustum(), _center = new Vector3(), _tmpPoint = new Vector3(), _vecNear = new Vector3(), _vecTopLeft = new Vector3(), _vecTopRight = new Vector3(), _vecDownRight = new Vector3(), _vecDownLeft = new Vector3(), _vecFarTopLeft = new Vector3(), _vecFarTopRight = new Vector3(), _vecFarDownRight = new Vector3(), _vecFarDownLeft = new Vector3(), _vectemp1 = new Vector3(), _vectemp2 = new Vector3(), _vectemp3 = new Vector3(), _matrix = new Matrix4(), _quaternion = new Quaternion(), _scale = new Vector3(), SelectionBox = class {
	constructor(e, t, n = Number.MAX_VALUE) {
		this.camera = e, this.scene = t, this.startPoint = new Vector3(), this.endPoint = new Vector3(), this.collection = [], this.instances = {}, this.deep = n;
	}
	select(e, t) {
		return this.startPoint = e || this.startPoint, this.endPoint = t || this.endPoint, this.collection = [], this.updateFrustum(this.startPoint, this.endPoint), this.searchChildInFrustum(_frustum, this.scene), this.collection;
	}
	updateFrustum(e, t) {
		if (e ||= this.startPoint, t ||= this.endPoint, e.x === t.x && (t.x += 2 ** -52), e.y === t.y && (t.y += 2 ** -52), this.camera.updateProjectionMatrix(), this.camera.updateMatrixWorld(), this.camera.isPerspectiveCamera) {
			_tmpPoint.copy(e), _tmpPoint.x = Math.min(e.x, t.x), _tmpPoint.y = Math.max(e.y, t.y), t.x = Math.max(e.x, t.x), t.y = Math.min(e.y, t.y), _vecNear.setFromMatrixPosition(this.camera.matrixWorld), _vecTopLeft.copy(_tmpPoint), _vecTopRight.set(t.x, _tmpPoint.y, 0), _vecDownRight.copy(t), _vecDownLeft.set(_tmpPoint.x, t.y, 0), _vecTopLeft.unproject(this.camera), _vecTopRight.unproject(this.camera), _vecDownRight.unproject(this.camera), _vecDownLeft.unproject(this.camera), _vectemp1.copy(_vecTopLeft).sub(_vecNear), _vectemp2.copy(_vecTopRight).sub(_vecNear), _vectemp3.copy(_vecDownRight).sub(_vecNear), _vectemp1.normalize(), _vectemp2.normalize(), _vectemp3.normalize(), _vectemp1.multiplyScalar(this.deep), _vectemp2.multiplyScalar(this.deep), _vectemp3.multiplyScalar(this.deep), _vectemp1.add(_vecNear), _vectemp2.add(_vecNear), _vectemp3.add(_vecNear);
			let n = _frustum.planes;
			n[0].setFromCoplanarPoints(_vecNear, _vecTopLeft, _vecTopRight), n[1].setFromCoplanarPoints(_vecNear, _vecTopRight, _vecDownRight), n[2].setFromCoplanarPoints(_vecDownRight, _vecDownLeft, _vecNear), n[3].setFromCoplanarPoints(_vecDownLeft, _vecTopLeft, _vecNear), n[4].setFromCoplanarPoints(_vecTopRight, _vecDownRight, _vecDownLeft), n[5].setFromCoplanarPoints(_vectemp3, _vectemp2, _vectemp1), n[5].normal.multiplyScalar(-1);
		} else if (this.camera.isOrthographicCamera) {
			let n = Math.min(e.x, t.x), r = Math.max(e.y, t.y), i = Math.max(e.x, t.x), a = Math.min(e.y, t.y);
			_vecTopLeft.set(n, r, -1), _vecTopRight.set(i, r, -1), _vecDownRight.set(i, a, -1), _vecDownLeft.set(n, a, -1), _vecFarTopLeft.set(n, r, 1), _vecFarTopRight.set(i, r, 1), _vecFarDownRight.set(i, a, 1), _vecFarDownLeft.set(n, a, 1), _vecTopLeft.unproject(this.camera), _vecTopRight.unproject(this.camera), _vecDownRight.unproject(this.camera), _vecDownLeft.unproject(this.camera), _vecFarTopLeft.unproject(this.camera), _vecFarTopRight.unproject(this.camera), _vecFarDownRight.unproject(this.camera), _vecFarDownLeft.unproject(this.camera);
			let o = _frustum.planes;
			o[0].setFromCoplanarPoints(_vecTopLeft, _vecFarTopLeft, _vecFarTopRight), o[1].setFromCoplanarPoints(_vecTopRight, _vecFarTopRight, _vecFarDownRight), o[2].setFromCoplanarPoints(_vecFarDownRight, _vecFarDownLeft, _vecDownLeft), o[3].setFromCoplanarPoints(_vecFarDownLeft, _vecFarTopLeft, _vecTopLeft), o[4].setFromCoplanarPoints(_vecTopRight, _vecDownRight, _vecDownLeft), o[5].setFromCoplanarPoints(_vecFarDownRight, _vecFarTopRight, _vecFarTopLeft), o[5].normal.multiplyScalar(-1);
		} else console.error("THREE.SelectionBox: Unsupported camera type.");
	}
	searchChildInFrustum(e, t) {
		if (t.isMesh || t.isLine || t.isPoints) if (t.isInstancedMesh) {
			this.instances[t.uuid] = [];
			for (let n = 0; n < t.count; n++) t.getMatrixAt(n, _matrix), _matrix.decompose(_center, _quaternion, _scale), _center.applyMatrix4(t.matrixWorld), e.containsPoint(_center) && this.instances[t.uuid].push(n);
		} else t.geometry.boundingSphere === null && t.geometry.computeBoundingSphere(), _center.copy(t.geometry.boundingSphere.center), _center.applyMatrix4(t.matrixWorld), e.containsPoint(_center) && this.collection.push(t);
		if (t.children.length > 0) for (let n = 0; n < t.children.length; n++) this.searchChildInFrustum(e, t.children[n]);
	}
}, SelectionHelper = class {
	constructor(e, t) {
		this.element = document.createElement("div"), this.element.classList.add(t), this.element.style.pointerEvents = "none", this.element.style.position = "absolute", this.renderer = e, this.startPoint = new Vector2(), this.pointTopLeft = new Vector2(), this.pointBottomRight = new Vector2(), this.isDown = !1, this.enabled = !0, this.onPointerDown = function(e) {
			this.enabled !== !1 && (this.isDown = !0, this.onSelectStart(e));
		}.bind(this), this.onPointerMove = function(e) {
			!e.shiftKey || e.altKey || this.enabled !== !1 && this.isDown && this.onSelectMove(e);
		}.bind(this), this.onPointerUp = function() {
			this.enabled !== !1 && (this.isDown = !1, this.onSelectOver());
		}.bind(this), this.renderer.domElement.addEventListener("pointerdown", this.onPointerDown), this.renderer.domElement.addEventListener("pointermove", this.onPointerMove), this.renderer.domElement.addEventListener("pointerup", this.onPointerUp);
	}
	dispose() {
		this.renderer.domElement.removeEventListener("pointerdown", this.onPointerDown), this.renderer.domElement.removeEventListener("pointermove", this.onPointerMove), this.renderer.domElement.removeEventListener("pointerup", this.onPointerUp);
	}
	onSelectStart(e) {
		this.element.style.display = "none", this.renderer.domElement.parentElement.appendChild(this.element);
		let t = this.renderer.domElement.parentElement.getBoundingClientRect(), n = e.clientX - t.left, r = e.clientY - t.top;
		this.element.style.left = n + "px", this.element.style.top = r + "px", this.element.style.width = "0px", this.element.style.height = "0px", this.startPoint.x = n, this.startPoint.y = r;
	}
	onSelectMove(e) {
		this.element.style.display = "block";
		let t = this.renderer.domElement.parentElement.getBoundingClientRect(), n = e.clientX - t.left, r = e.clientY - t.top;
		this.pointBottomRight.x = Math.max(this.startPoint.x, n), this.pointBottomRight.y = Math.max(this.startPoint.y, r), this.pointTopLeft.x = Math.min(this.startPoint.x, n), this.pointTopLeft.y = Math.min(this.startPoint.y, r), this.element.style.left = this.pointTopLeft.x + "px", this.element.style.top = this.pointTopLeft.y + "px", this.element.style.width = this.pointBottomRight.x - this.pointTopLeft.x + "px", this.element.style.height = this.pointBottomRight.y - this.pointTopLeft.y + "px";
	}
	onSelectOver() {
		this.element.parentElement.removeChild(this.element);
	}
}, LassoHelper = class {
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
		let e = this.renderer.domElement.parentElement;
		e && (this.element.parentElement || e.appendChild(this.element));
	}
	resize(e) {
		if (!e) return;
		let t = Math.max(1, Math.floor(e.width)), n = Math.max(1, Math.floor(e.height));
		(this.element.width !== t || this.element.height !== n) && (this.element.width = t, this.element.height = n);
	}
	draw(e) {
		if (this.context && (this.context.clearRect(0, 0, this.element.width, this.element.height), !(!e || e.length < 2))) {
			this.context.beginPath(), this.context.moveTo(e[0].x, e[0].y);
			for (let t = 1; t < e.length; t++) this.context.lineTo(e[t].x, e[t].y);
			this.context.closePath(), this.context.fillStyle = "rgba(75, 160, 255, 0.15)", this.context.strokeStyle = "rgba(85, 170, 255, 0.9)", this.context.lineWidth = 1, this.context.fill(), this.context.stroke();
		}
	}
}, SelectionManager = class {
	constructor(e) {
		this.weas = e, this.tjs = e.tjs, this._selectedObjects = [], this.selectedInstances = {}, this.lassoPoints = [], this.isLassoing = !1, this.oldSelectedAtomsIndices = [], this.oldSelectedObjects = [], this.axisAtomIndices = [], this.axisLineExtendFactor = 3, this.axisLine = null, this.isAxisPicking = !1, this.axisPickMode = null, this.axisVisible = !1, this.modeHint = null, this.translateAxisLine = null, this.translateAxisLength = 20, this.translatePlaneMesh = null, this.translateNormalLine = null, this.translatePlaneSize = 30, this.rotateAxisLine = null, this.rotateAxisLength = 20, this.rotatePlaneMesh = null, this.rotateNormalLine = null, this.rotatePlaneSize = 30, this.raycaster = new THREE$1.Raycaster(), this.raycaster.layers.set(0), this.mouse = new THREE$1.Vector2(), this.init();
	}
	init() {
		this.selectionBox = new SelectionBox(this.tjs.camera, this.tjs.scene), this.helper = new SelectionHelper(this.tjs.renderers.MainRenderer.renderer, "selectBox"), this.lassoHelper = new LassoHelper(this.tjs.renderers.MainRenderer.renderer, "lassoSelect"), this.initModeHint(), window.addEventListener("pointerdown", this.onMouseDown.bind(this), !1);
	}
	get selectedObjects() {
		return this._selectedObjects;
	}
	set selectedObjects(e) {
		e = e.filter((e) => !e.userData.notSelectable), this._selectedObjects = e, this.highlightSelectedObjects(), e.length > 0 && !this.weas.eventHandlers?.transformControls?.mode && this.setModeHint("");
	}
	onMouseDown(e) {
		let t = this.tjs.updateViewerRect(), n = (e.clientX - t.left) / t.width * 2 - 1, r = -((e.clientY - t.top) / t.height) * 2 + 1;
		this.selectionBox.startPoint.set(n, r, .5), this.oldSelectedAtomsIndices = this.weas.avr.selectedAtomsIndices, this.oldSelectedObjects = this.selectedObjects;
	}
	pickSelection(e) {
		let t = this.tjs.updateViewerRect();
		this.mouse.x = (e.clientX - t.left) / t.width * 2 - 1, this.mouse.y = -((e.clientY - t.top) / t.height) * 2 + 1, this.raycaster.setFromCamera(this.mouse, this.tjs.camera);
		let n = this.raycaster.intersectObjects(this.tjs.scene.children, !0);
		if (n.length === 0) {
			this.clearSelection();
			return;
		}
		let r = n[0].object, i = n[0].face, a = n[0].point, o = r.parent?.isMesh ? r.parent : null;
		if (r.isLineSegments && r.userData?.type === "anyMesh" && o) {
			if (o.userData?.objectMode === "edit") return;
			r = o;
		}
		if (this.weas.activeObject = r, !r.userData.notSelectable) {
			if (r.userData.objectMode === "edit") {
				let e;
				if (r.isInstancedMesh) e = {
					object: r,
					vertexId: n[0].instanceId
				};
				else if (r.isLineSegments) return;
				else {
					let t = getClosestVertex(r, i, a);
					e = {
						object: r,
						vertexId: t.vertexId,
						faceId: n[0].faceIndex
					};
				}
				this.selectedInstances[r.uuid] ? this.selectedInstances[r.uuid].some((t) => t === e.vertexId) ? this.selectedInstances[r.uuid] = this.selectedInstances[r.uuid].filter((t) => t !== e.vertexId) : this.selectedInstances[r.uuid].push(e.vertexId) : this.selectedInstances[r.uuid] = [e.vertexId], r.userData.type === "atom" && (this.weas.avr.selectedAtomsIndices = [...this.selectedInstances[r.uuid]]);
			} else this.selectedObjects.some((e) => e === r) ? (removeOutline(r), this.selectedObjects = this.selectedObjects.filter((e) => e !== r)) : (this.selectedObjects.push(r), createOutline(r, 1.1));
			this.highlightSelectedVertex();
		}
	}
	dragSelection(e) {
		let t = this.tjs.updateViewerRect(), n = (e.clientX - t.left) / t.width * 2 - 1, r = -((e.clientY - t.top) / t.height) * 2 + 1;
		if (this.selectionBox.endPoint.set(n, r, .5), this.selectionBox.select(), this.selectionBox.instances[this.weas.avr.atomManager.meshes.atom.uuid]) {
			let e = this.selectionBox.instances[this.weas.avr.atomManager.meshes.atom.uuid];
			this.weas.avr.selectedAtomsIndices = [...new Set([...this.oldSelectedAtomsIndices, ...e])];
		}
		this.selectedObjects = [...new Set([...this.oldSelectedObjects, ...this.selectionBox.collection])];
	}
	startLasso(e) {
		let { point: t, rect: n } = this.getViewerPoint(e);
		this.lassoPoints = [t], this.isLassoing = !0, this.lassoHelper.start(this.lassoPoints, n);
	}
	dragLasso(e) {
		if (!this.isLassoing) return;
		let { point: t, rect: n } = this.getViewerPoint(e), r = this.lassoPoints[this.lassoPoints.length - 1], i = t.x - r.x, a = t.y - r.y;
		i * i + a * a < 4 || (this.lassoPoints.push(t), this.lassoHelper.update(this.lassoPoints, n));
	}
	finishLasso() {
		if (!this.isLassoing) return;
		this.isLassoing = !1, this.lassoHelper.finish();
		let e = this.lassoPoints;
		if (this.lassoPoints = [], e.length < 3) return;
		let t = this.getAtomsInsideLasso(e);
		this.weas.avr.selectedAtomsIndices = [...new Set([...this.oldSelectedAtomsIndices, ...t])];
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
		let t = this.getAtomIndexFromEvent(e);
		return t == null ? !1 : (this.axisAtomIndices.includes(t) ? this.axisAtomIndices = this.axisAtomIndices.filter((e) => e !== t) : this.axisAtomIndices.length >= (this.axisPickMode, 3) ? this.axisAtomIndices = [t] : this.axisAtomIndices.push(t), this.updateAxisHighlight(), this.updateAxisLine(), !0);
	}
	clearSelection() {
		this.selectedObjects.forEach((e) => {
			removeOutline(e);
		}), this.selectedObjects = [], this.selectedInstances = {}, this.weas.avr.selectedAtomsIndices = [], this.highlightSelectedVertex();
	}
	highlightSelectedVertex() {
		Object.keys(this.selectedInstances).forEach((e) => {
			let t = this.tjs.scene.getObjectByProperty("uuid", e);
			if (!t || !t.userData.vertexPoints) return;
			let n = t.userData.vertexPoints, r = this.selectedInstances[e], i = t.geometry.attributes.position.count, a = new Float32Array(i * 3);
			for (let e = 0; e < i; e++) a[e * 3] = 0, a[e * 3 + 1] = 0, a[e * 3 + 2] = 0;
			r.forEach((e) => {
				a[e * 3] = 1, a[e * 3 + 1] = 0, a[e * 3 + 2] = 0;
			}), n.geometry.setAttribute("color", new THREE$1.BufferAttribute(a, 3)), n.geometry.attributes.color.needsUpdate = !0;
		});
	}
	highlightSelectedObjects() {
		this.selectedObjects.forEach((e) => {
			removeOutline(e), createOutline(e, 1.1);
		});
	}
	getAtomIndexFromEvent(e) {
		let t = this.tjs.updateViewerRect();
		this.mouse.x = (e.clientX - t.left) / t.width * 2 - 1, this.mouse.y = -((e.clientY - t.top) / t.height) * 2 + 1, this.raycaster.setFromCamera(this.mouse, this.tjs.camera);
		let n = this.weas.avr?.atomManager?.meshes?.atom;
		if (!n) return null;
		let r = this.raycaster.intersectObject(n, !0);
		if (r.length === 0) return null;
		let i = r.find((e) => Number.isInteger(e.instanceId));
		return i ? i.instanceId : null;
	}
	updateAxisHighlight() {
		let e = this.weas?.avr?.highlightManager;
		if (!e) return;
		(!e.settings || !e.settings.axis) && (e.addSetting("axis", {
			indices: [],
			scale: 1,
			type: "crossView",
			color: "#ff8800",
			opacity: 1,
			occlude: !1,
			offset: 1,
			thickness: .08
		}), e.drawHighlightAtoms()), e.settings.axisCenter || (e.addSetting("axisCenter", {
			indices: [],
			scale: .8,
			type: "cross",
			color: "#ff8800",
			opacity: .9
		}), e.drawHighlightAtoms());
		let t = this.axisVisible ? this.axisAtomIndices : [];
		e.settings.axis.indices = [...t];
		let n = this.axisVisible && this.axisAtomIndices.length === 1 ? [...this.axisAtomIndices] : [];
		e.settings.axisCenter.indices = [...n], e.updateHighlightAtomsMesh({
			indices: t,
			scale: 1,
			type: "crossView",
			color: "#ff8800",
			opacity: 1,
			occlude: !1,
			offset: 1,
			thickness: .08
		}, "axis"), e.updateHighlightAtomsMesh({
			indices: n,
			scale: .8,
			type: "cross",
			color: "#ff8800",
			opacity: .9
		}, "axisCenter"), e.updateLabelSizes?.(this.tjs.camera, this.tjs.renderers?.MainRenderer?.renderer), this.weas?.avr?.requestRedraw?.("render");
	}
	updateAxisLine() {
		if (!this.axisVisible) {
			this.axisLine &&= (this.tjs.scene.remove(this.axisLine), this.axisLine.geometry.dispose(), this.axisLine.material.dispose(), null), this.hideRotatePlane();
			return;
		}
		if (this.axisAtomIndices.length === 3) {
			this.axisLine &&= (this.tjs.scene.remove(this.axisLine), this.axisLine.geometry.dispose(), this.axisLine.material.dispose(), null), this.showRotatePlaneFromAxisAtoms();
			return;
		}
		if (this.hideRotatePlane(), this.axisAtomIndices.length !== 2) {
			this.axisLine &&= (this.tjs.scene.remove(this.axisLine), this.axisLine.geometry.dispose(), this.axisLine.material.dispose(), null);
			return;
		}
		let e = this.weas?.avr?.atoms?.positions;
		if (!e) return;
		let t = this.axisAtomIndices[0], n = this.axisAtomIndices[1];
		if (!e[t] || !e[n]) return;
		let r = new THREE$1.Vector3(...e[t]), i = new THREE$1.Vector3(...e[n]), a = i.clone().sub(r), o = a.length();
		if (o === 0) return;
		let s = a.normalize(), c = r.clone().add(i).multiplyScalar(.5), l = o * this.axisLineExtendFactor, u = c.clone().addScaledVector(s, -l), d = c.clone().addScaledVector(s, l);
		if (this.axisLine) this.axisLine.geometry.setFromPoints([u, d]), this.axisLine.geometry.attributes.position.needsUpdate = !0, this.axisLine.geometry.computeBoundingSphere();
		else {
			let e = new THREE$1.BufferGeometry().setFromPoints([u, d]), t = new THREE$1.LineBasicMaterial({
				color: 16746496,
				transparent: !0,
				opacity: .9,
				depthTest: !1
			});
			this.axisLine = new THREE$1.Line(e, t), this.axisLine.userData.notSelectable = !0, this.axisLine.layers.set(1), this.axisLine.renderOrder = 999, this.tjs.scene.add(this.axisLine);
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
		let e = this.weas?.avr?.atoms?.positions;
		if (!e || this.axisAtomIndices.length !== 3) {
			this.hidePlaneWithNormal({
				meshKey: "rotatePlaneMesh",
				lineKey: "rotateNormalLine"
			});
			return;
		}
		let [t, n, r] = this.axisAtomIndices;
		if (!e[t] || !e[n] || !e[r]) {
			this.hidePlaneWithNormal({
				meshKey: "rotatePlaneMesh",
				lineKey: "rotateNormalLine"
			});
			return;
		}
		let i = new THREE$1.Vector3(...e[t]), a = new THREE$1.Vector3(...e[n]), o = new THREE$1.Vector3(...e[r]), s = a.clone().sub(i).cross(o.clone().sub(i));
		if (s.lengthSq() === 0) {
			this.hidePlaneWithNormal({
				meshKey: "rotatePlaneMesh",
				lineKey: "rotateNormalLine"
			});
			return;
		}
		let c = i.clone().add(a).add(o).multiplyScalar(1 / 3);
		this.showPlaneWithNormal({
			center: c,
			normal: s,
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
	showPlaneWithNormal({ center: e, normal: t, size: n, color: r, lineLength: i, meshKey: a, lineKey: o }) {
		if (!e || !t) return;
		let s = t.clone().normalize();
		if (s.lengthSq() === 0) return;
		if (!this[a]) {
			let e = new THREE$1.PlaneGeometry(n, n), t = new THREE$1.MeshBasicMaterial({
				color: r,
				transparent: !0,
				opacity: .15,
				side: THREE$1.DoubleSide,
				depthTest: !1
			});
			this[a] = new THREE$1.Mesh(e, t), this[a].userData.notSelectable = !0, this[a].layers.set(1), this[a].renderOrder = 998, this.tjs.scene.add(this[a]);
		}
		let c = new THREE$1.Quaternion().setFromUnitVectors(new THREE$1.Vector3(0, 0, 1), s);
		this[a].position.copy(e), this[a].quaternion.copy(c);
		let l = e.clone(), u = e.clone().addScaledVector(s, i);
		if (this[o]) this[o].geometry.setFromPoints([l, u]), this[o].geometry.attributes.position.needsUpdate = !0, this[o].geometry.computeBoundingSphere(), this[o].computeLineDistances();
		else {
			let e = new THREE$1.BufferGeometry().setFromPoints([l, u]), t = new THREE$1.LineDashedMaterial({
				color: r,
				dashSize: .6,
				gapSize: .4,
				transparent: !0,
				opacity: .9,
				depthTest: !1
			});
			this[o] = new THREE$1.Line(e, t), this[o].computeLineDistances(), this[o].userData.notSelectable = !0, this[o].layers.set(1), this[o].renderOrder = 999, this.tjs.scene.add(this[o]);
		}
		this.weas?.avr?.requestRedraw?.("render");
	}
	hidePlaneWithNormal({ meshKey: e, lineKey: t }) {
		this[e] && (this.tjs.scene.remove(this[e]), this[e].geometry.dispose(), this[e].material.dispose(), this[e] = null), this[t] && (this.tjs.scene.remove(this[t]), this[t].geometry.dispose(), this[t].material.dispose(), this[t] = null), this.weas?.avr?.requestRedraw?.("render");
	}
	showAxisLine({ center: e, axis: t, length: n, color: r, lineKey: i }) {
		if (!e || !t) return;
		let a = t.clone().normalize();
		if (a.lengthSq() === 0) return;
		let o = e.clone().addScaledVector(a, -n), s = e.clone().addScaledVector(a, n);
		if (this[i]) this[i].geometry.setFromPoints([o, s]), this[i].geometry.attributes.position.needsUpdate = !0, this[i].geometry.computeBoundingSphere(), this[i].computeLineDistances();
		else {
			let e = new THREE$1.BufferGeometry().setFromPoints([o, s]), t = new THREE$1.LineDashedMaterial({
				color: r,
				dashSize: .6,
				gapSize: .4,
				transparent: !0,
				opacity: .9,
				depthTest: !1
			});
			this[i] = new THREE$1.Line(e, t), this[i].computeLineDistances(), this[i].userData.notSelectable = !0, this[i].layers.set(1), this[i].renderOrder = 999, this.tjs.scene.add(this[i]);
		}
		this.weas?.avr?.requestRedraw?.("render");
	}
	hideAxisLine({ lineKey: e }) {
		this[e] && (this.tjs.scene.remove(this[e]), this[e].geometry.dispose(), this[e].material.dispose(), this[e] = null, this.weas?.avr?.requestRedraw?.("render"));
	}
	initModeHint() {
		let e = this.tjs.renderers?.MainRenderer?.renderer?.domElement?.parentElement;
		!e || this.modeHint || (this.modeHint = document.createElement("div"), this.modeHint.className = "weas-mode-hint", this.modeHint.style.display = "none", e.appendChild(this.modeHint));
	}
	setModeHint(e) {
		if (this.modeHint || this.initModeHint(), this.modeHint) {
			if (!e) {
				this.modeHint.style.display = "none", this.modeHint.textContent = "";
				return;
			}
			this.modeHint.textContent = e, this.modeHint.style.display = "block";
		}
	}
	getViewerPoint(e) {
		let t = this.tjs.updateViewerRect();
		return {
			point: {
				x: e.clientX - t.left,
				y: e.clientY - t.top
			},
			rect: t
		};
	}
	getAtomsInsideLasso(e) {
		let t = this.weas.avr.atoms;
		if (!t || !Array.isArray(t.positions)) return [];
		let n = this.tjs.updateViewerRect(), r = this.tjs.camera, i = [], a = new THREE$1.Vector3();
		for (let o = 0; o < t.positions.length; o++) a.set(...t.positions[o]).project(r), !(a.z < -1 || a.z > 1) && pointInPolygon$1((a.x + 1) * .5 * n.width, (-a.y + 1) * .5 * n.height, e) && i.push(o);
		return i;
	}
};
function getClosestVertex(e, t, n) {
	let r = e.geometry.getAttribute("position"), i = new THREE$1.Vector3(), a = new THREE$1.Vector3(), o = new THREE$1.Vector3();
	return i.fromBufferAttribute(r, t.a).applyMatrix4(e.matrixWorld), a.fromBufferAttribute(r, t.b).applyMatrix4(e.matrixWorld), o.fromBufferAttribute(r, t.c).applyMatrix4(e.matrixWorld), [
		{
			vertexId: t.a,
			distance: i.distanceTo(n)
		},
		{
			vertexId: t.b,
			distance: a.distanceTo(n)
		},
		{
			vertexId: t.c,
			distance: o.distanceTo(n)
		}
	].reduce((e, t) => e.distance < t.distance ? e : t);
}
function pointInPolygon$1(e, t, n) {
	let r = !1;
	for (let i = 0, a = n.length - 1; i < n.length; a = i++) {
		let o = n[i].x, s = n[i].y, c = n[a].x, l = n[a].y;
		s > t != l > t && e < (c - o) * (t - s) / (l - s) + o && (r = !r);
	}
	return r;
}
//#endregion
//#region src/operation/shape.js
var ShapeOperation = class extends BaseOperation {
	static category = "Shapes";
	static abstract = !0;
	constructor(e, t, n = {}) {
		super(e), this.shapeName = t, this.options = n, this.options.position = this.options.position || [
			0,
			0,
			0
		], this.options.materialType = this.options.materialType || "Standard", this.options.color = this.options.color || "#bfbfbf", this.options.opacity = this.options.opacity ?? 1, this.options.scale = this.options.scale || [
			1,
			1,
			1
		], this.options.rotation = this.options.rotation || [
			0,
			0,
			0
		], this.options.wireframe = this.options.wireframe || !1, this.object = null, this.uiFields = {
			title: `Add ${t}`,
			fields: {
				positionX: {
					type: "number",
					path: "options.position.0"
				},
				positionY: {
					type: "number",
					path: "options.position.1"
				},
				positionZ: {
					type: "number",
					path: "options.position.2"
				},
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
					step: .01
				},
				scaleX: {
					type: "number",
					path: "options.scale.0",
					min: .01,
					max: 10,
					step: .01
				},
				scaleY: {
					type: "number",
					path: "options.scale.1",
					min: .01,
					max: 10,
					step: .01
				},
				scaleZ: {
					type: "number",
					path: "options.scale.2",
					min: .01,
					max: 10,
					step: .01
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
					step: .01
				},
				rotationZ: {
					type: "number",
					path: "options.rotation.2",
					min: 0,
					max: 360,
					step: .01
				}
			}
		};
	}
	execute() {
		let e = this.weas.shapeRegistry;
		if (!e) throw Error("ShapeRegistry not found");
		this.object = e.create(this.shapeName, this.options), this.object && (this.options.notSelectable && (this.object.userData.notSelectable = !0), this.options.type && (this.object.userData.type = this.options.type), this.options.customData && Object.entries(this.options.customData).forEach(([e, t]) => {
			this.object.userData[e] = t;
		})), (this.options.transparent || this.options.opacity < 1) && this.object.traverse((e) => {
			e.isMesh && (e.material.transparent = !0, e.renderOrder = this.options.renderOrder ?? 400, e.material.depthWrite = !1);
		}), this.object && (this.object.scale.set(this.options.scale[0], this.options.scale[1], this.options.scale[2]), this.object.rotation.set(this.options.rotation[0] / (180 / Math.PI), this.options.rotation[1] / (180 / Math.PI), this.options.rotation[2] / (180 / Math.PI))), this.weas.tjs.scene.add(this.object), this.weas.tjs.requestRedraw?.();
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
}, OperationSearchManager = class e {
	constructor(e, t, n) {
		this.weas = e, this.ops = t, this.hud = n, this.keybindConfig = this.weas.keybindConfig || {}, this.operations = getAllOperations(t, this.keybindConfig), this.overlay = this.createOverlay(), this._addScrollbarStyles(), this._addClickOutsideHandler(), this.bindEvents(), this.registerKeybinds(), this.updateSearchResults("");
	}
	createOverlay() {
		let e = document.createElement("div");
		e.id = "operation-search", e.style.display = "none", e.style.width = "300px", e.style.maxHeight = "280px", e.style.backgroundColor = "rgba(20,20,28,0.92)", e.style.border = "1px solid rgba(255,255,255,0.12)", e.style.borderRadius = "6px", e.style.backdropFilter = "blur(6px)", e.style.WebkitBackdropFilter = "blur(6px)", e.style.padding = "6px", e.style.boxSizing = "border-box", e.style.pointerEvents = "auto";
		let t = document.createElement("input");
		t.type = "text", t.id = "search-box", t.placeholder = "Search operation...", t.style.width = "100%", t.style.boxSizing = "border-box", t.style.padding = "6px 8px", t.style.border = "1px solid rgba(255,255,255,0.15)", t.style.borderRadius = "4px", t.style.backgroundColor = "rgba(0,0,0,0.3)", t.style.color = "rgba(255,255,255,0.85)", t.style.fontSize = "13px", t.style.outline = "none", t.style.fontFamily = "sans-serif", t.addEventListener("focus", () => {
			t.style.borderColor = "rgba(255,255,255,0.35)";
		}), t.addEventListener("blur", () => {
			t.style.borderColor = "rgba(255,255,255,0.15)";
		}), t.addEventListener("input", (e) => this.updateSearchResults(e.target.value));
		let n = document.createElement("ul");
		return n.id = "search-results", n.style.listStyle = "none", n.style.margin = "6px 0 0 0", n.style.padding = "0", n.style.maxHeight = "230px", n.style.overflowY = "auto", e.appendChild(t), e.appendChild(n), this.hud.addHTMLPanel("search", e, {
			anchor: "center",
			offset: {
				x: 0,
				y: -10
			},
			visible: !1
		}), e;
	}
	_addClickOutsideHandler() {
		this._clickOutside = (e) => {
			this.overlay.style.display !== "none" && !this.overlay.contains(e.target) && this.hide();
		}, document.addEventListener("click", this._clickOutside);
	}
	_addScrollbarStyles() {
		if (e._scrollStylesAdded) return;
		e._scrollStylesAdded = !0;
		let t = document.createElement("style");
		t.textContent = "#search-box::placeholder { color: rgba(255,255,255,0.35); }#search-box:focus { border-color: rgba(255,255,255,0.35); }#search-results li:focus { background: rgba(255,255,255,0.12); outline: none; }#search-results::-webkit-scrollbar { width: 5px; }#search-results::-webkit-scrollbar-track { background: transparent; }#search-results::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px; }#search-results::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.25); }", document.head.appendChild(t);
	}
	bindEvents() {
		let e = (e) => e.stopPropagation();
		[
			"click",
			"keydown",
			"keyup",
			"keypress"
		].forEach((t) => {
			this.overlay.addEventListener(t, e, !1);
		}), this.overlay.addEventListener("keydown", (e) => {
			e.key === "Escape" && (this.hide(), this.weas.tjs.containerElement.focus());
		});
	}
	registerKeybinds() {
		let e = this.weas.keybindManager;
		if (!e) return;
		let t = this.keybindConfig.SearchOperation || defaultKeyBindConfig.SearchOperation || null;
		e.register("SearchOperation", () => this.show(), t);
	}
	show() {
		this.overlay.style.display = "block", this.overlay.querySelector("#search-box").focus();
	}
	hide() {
		this.overlay.style.display = "none";
	}
	updateSearchResults(e) {
		let t = this.overlay.querySelector("#search-results");
		t.innerHTML = "";
		let n = this.operations;
		e && (n = n.filter((t) => t.description && t.description.toLowerCase().includes(e.toLowerCase()))), this.weas.shapeRegistry.list().filter((t) => t.toLowerCase().includes(e.toLowerCase())).forEach((e) => {
			n.some((t) => t.category === "Shapes" && t.name === e) || n.push({
				cls: ShapeOperation,
				name: e,
				category: "Shapes",
				description: `Add ${e}`
			});
		}), e && (n = n.filter((t) => t.description && t.description.toLowerCase().includes(e.toLowerCase()))), n = n.slice(0, 10);
		let r = {};
		n.forEach((e) => {
			let t = `${e.category}: ${e.description}`;
			r[t] = (r[t] || 0) + 1;
		}), n.forEach((e) => {
			if (!e.description) return;
			let n = document.createElement("li");
			n.tabIndex = 0, n.style.padding = "4px 8px", n.style.cursor = "pointer", n.style.borderRadius = "4px", n.style.color = "rgba(255,255,255,0.75)", n.style.fontSize = "12px", n.style.fontFamily = "sans-serif", n.style.transition = "background 0.15s", n.addEventListener("mouseenter", () => {
				n.style.backgroundColor = "rgba(255,255,255,0.08)";
			}), n.addEventListener("mouseleave", () => {
				n.style.backgroundColor = "transparent";
			});
			let i = `${e.category}: ${e.description}`;
			n.textContent = r[i] > 1 ? `${i} (${e.name})` : i, n.onclick = () => this.execute(e), n.onkeydown = (t) => {
				t.key === "Enter" && this.execute(e);
			}, t.appendChild(n);
		});
	}
	execute(e) {
		let t;
		t = e.category === "Shapes" ? new e.cls(this.weas, e.name, {}) : new e.cls({ weas: this.weas }), this.weas.ops.execute(t), this.hide(), this.weas.tjs.containerElement.focus();
	}
};
function AddKeyToDesc(e, t, n) {
	let r = e || "Operation", i = t[n] || [];
	if (i.length > 0 && i[0].length > 0) {
		let e = i[0].map((e) => e.charAt(0).toUpperCase() + e.slice(1)).join("+");
		r += ` [${e}]`;
	}
	return r;
}
function getAllOperations(e, t) {
	let n = [];
	return Object.keys(e).forEach((r) => {
		Object.values(e[r]).forEach((e) => {
			if (e.abstract) return;
			let i = e.description || e.name || "Operation";
			n.push({
				cls: e,
				name: e.name || "Operation",
				category: e.category || r,
				description: AddKeyToDesc(i, t, e.name)
			});
		});
	}), n;
}
//#endregion
//#region src/operation/object.js
var object_exports = /* @__PURE__ */ __exportAll({
	CopyOperation: () => CopyOperation,
	DeleteOperation: () => DeleteOperation
}), DeleteOperation = class extends BaseOperation {
	static description = "Delete";
	static category = "Edit";
	static ui = {
		title: "Delete",
		fields: {}
	};
	constructor({ weas: e, indices: t = null }) {
		super(e);
		let n = this.stateGet("viewer.selectedAtomsIndices", []) || [];
		this.indices = t || Array.from(n), this.initialAtoms = e.avr.atoms.copy(), this.initialObjectsState = this.weas.selectionManager.selectedObjects.map((e) => ({
			object: e.clone(),
			parent: e.parent
		}));
	}
	execute() {
		this.indices.length > 0 && this.weas.avr.deleteSelectedAtoms({ indices: this.indices }), this.weas.objectManager.deleteSelectedObjects();
	}
	undo() {
		this.indices.length > 0 && (this.weas.avr.atoms = this.initialAtoms.copy());
		let e = [];
		this.initialObjectsState.forEach(({ object: t, parent: n }) => {
			n ? n.add(t) : this.weas.tjs.scene.add(t), e.push(t);
		}), this.weas.selectionManager.selectedObjects = e;
	}
}, CopyOperation = class extends BaseOperation {
	static description = "Copy";
	static category = "Edit";
	static ui = {
		title: "Copy",
		fields: {}
	};
	constructor({ weas: e, indices: t = null }) {
		super(e);
		let n = this.stateGet("viewer.selectedAtomsIndices", []) || [];
		this.indices = t || Array.from(n), this.initialAtoms = e.avr.atoms.copy(), this.newObjects = [];
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
	setupGUI(e) {}
}, H$5 = 1, He$5 = 2, Li$5 = 3, Be$5 = 4, B$5 = 5, C$5 = 6, N$5 = 7, O$5 = 8, F$5 = 9, Ne$5 = 10, Na$5 = 11, Mg$5 = 12, Al$5 = 13, Si$5 = 14, P$5 = 15, S$5 = 16, Cl$5 = 17, Ar$5 = 18, K$5 = 19, Ca$5 = 20, Sc$5 = 21, Ti$5 = 22, V$5 = 23, Cr$5 = 24, Mn$5 = 25, Fe$5 = 26, Co$5 = 27, Ni$5 = 28, Cu$5 = 29, Zn$5 = 30, Ga$5 = 31, Ge$5 = 32, As$5 = 33, Se$5 = 34, Br$5 = 35, Kr$5 = 36, Rb$5 = 37, Sr$5 = 38, Y$5 = 39, Zr$5 = 40, Nb$5 = 41, Mo$5 = 42, Tc$5 = 43, Ru$5 = 44, Rh$5 = 45, Pd$5 = 46, Ag$5 = 47, Cd$5 = 48, In$5 = 49, Sn$5 = 50, Sb$5 = 51, Te$5 = 52, I$5 = 53, Xe$5 = 54, Cs$5 = 55, Ba$5 = 56, La$5 = 57, Ce$5 = 58, Pr$5 = 59, Nd$5 = 60, Pm$5 = 61, Sm$5 = 62, Eu$5 = 63, Gd$5 = 64, Tb$5 = 65, Dy$5 = 66, Ho$5 = 67, Er$5 = 68, Tm$5 = 69, Yb$5 = 70, Lu$5 = 71, Hf$5 = 72, Ta$5 = 73, W$5 = 74, Re$5 = 75, Os$5 = 76, Ir$5 = 77, Pt$5 = 78, Au$5 = 79, Hg$5 = 80, Tl$5 = 81, Pb$5 = 82, Bi$5 = 83, Po$5 = 84, At$5 = 85, Rn$5 = 86, Fr$5 = 87, Ra$5 = 88, Ac$5 = 89, Th$5 = 90, Pa$5 = 91, U$5 = 92, Np$5 = 93, Pu$5 = 94, Am$5 = 95, Cm$4 = 96, Bk$3 = 97, Cf$3 = 98, Es$3 = 99, Fm$3 = 100, Md$3 = 101, No$3 = 102, Lr$3 = 103, Rf$2 = 104, Db$2 = 105, Sg$2 = 106, Bh$2 = 107, Hs$2 = 108, Mt$2 = 109, Ds$1 = 110, Rg$1 = 111, Cn$1 = 112, Nh$1 = 113, Fl$1 = 114, Mc$1 = 115, Lv$1 = 116, Ts$1 = 117, Og$1 = 118, ATOMIC_NUMBERS_default = {
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
}, H$4 = .31, He$4 = .28, Li$4 = 1.28, Be$4 = .96, B$4 = .84, C$4 = .76, N$4 = .71, O$4 = .66, F$4 = .57, Ne$4 = .58, Na$4 = 1.66, Mg$4 = 1.41, Al$4 = 1.21, Si$4 = 1.11, P$4 = 1.07, S$4 = 1.05, Cl$4 = 1.02, Ar$4 = 1.06, K$4 = 2.03, Ca$4 = 1.76, Sc$4 = 1.7, Ti$4 = 1.6, V$4 = 1.53, Cr$4 = 1.39, Mn$4 = 1.39, Fe$4 = 1.32, Co$4 = 1.26, Ni$4 = 1.24, Cu$4 = 1.32, Zn$4 = 1.22, Ga$4 = 1.22, Ge$4 = 1.2, As$4 = 1.19, Se$4 = 1.2, Br$4 = 1.2, Kr$4 = 1.16, Rb$4 = 2.2, Sr$4 = 1.95, Y$4 = 1.9, Zr$4 = 1.75, Nb$4 = 1.64, Mo$4 = 1.54, Tc$4 = 1.47, Ru$4 = 1.46, Rh$4 = 1.42, Pd$4 = 1.39, Ag$4 = 1.45, Cd$4 = 1.44, In$4 = 1.42, Sn$4 = 1.39, Sb$4 = 1.39, Te$4 = 1.38, I$4 = 1.39, Xe$4 = 1.4, Cs$4 = 2.44, Ba$4 = 2.15, La$4 = 2.07, Ce$4 = 2.04, Pr$4 = 2.03, Nd$4 = 2.01, Pm$4 = 1.99, Sm$4 = 1.98, Eu$4 = 1.98, Gd$4 = 1.96, Tb$4 = 1.94, Dy$4 = 1.92, Ho$4 = 1.92, Er$4 = 1.89, Tm$4 = 1.9, Yb$4 = 1.87, Lu$4 = 1.87, Hf$4 = 1.75, Ta$4 = 1.7, W$4 = 1.62, Re$4 = 1.51, Os$4 = 1.44, Ir$4 = 1.41, Pt$4 = 1.36, Au$4 = 1.36, Hg$4 = 1.32, Tl$4 = 1.45, Pb$4 = 1.46, Bi$4 = 1.48, Po$4 = 1.4, At$4 = 1.5, Rn$4 = 1.5, Fr$4 = 2.6, Ra$4 = 2.21, Ac$4 = 2.15, Th$4 = 2.06, Pa$4 = 2, U$4 = 1.96, Np$4 = 1.9, Pu$4 = 1.87, Am$4 = 1.8, Cm$3 = 1.69, COVALENT_RADII_default = {
	H: H$4,
	He: He$4,
	Li: Li$4,
	Be: Be$4,
	B: B$4,
	C: C$4,
	N: N$4,
	O: O$4,
	F: F$4,
	Ne: Ne$4,
	Na: Na$4,
	Mg: Mg$4,
	Al: Al$4,
	Si: Si$4,
	P: P$4,
	S: S$4,
	Cl: Cl$4,
	Ar: Ar$4,
	K: K$4,
	Ca: Ca$4,
	Sc: Sc$4,
	Ti: Ti$4,
	V: V$4,
	Cr: Cr$4,
	Mn: Mn$4,
	Fe: Fe$4,
	Co: Co$4,
	Ni: Ni$4,
	Cu: Cu$4,
	Zn: Zn$4,
	Ga: Ga$4,
	Ge: Ge$4,
	As: As$4,
	Se: Se$4,
	Br: Br$4,
	Kr: Kr$4,
	Rb: Rb$4,
	Sr: Sr$4,
	Y: Y$4,
	Zr: Zr$4,
	Nb: Nb$4,
	Mo: Mo$4,
	Tc: Tc$4,
	Ru: Ru$4,
	Rh: Rh$4,
	Pd: Pd$4,
	Ag: Ag$4,
	Cd: Cd$4,
	In: In$4,
	Sn: Sn$4,
	Sb: Sb$4,
	Te: Te$4,
	I: I$4,
	Xe: Xe$4,
	Cs: Cs$4,
	Ba: Ba$4,
	La: La$4,
	Ce: Ce$4,
	Pr: Pr$4,
	Nd: Nd$4,
	Pm: Pm$4,
	Sm: Sm$4,
	Eu: Eu$4,
	Gd: Gd$4,
	Tb: Tb$4,
	Dy: Dy$4,
	Ho: Ho$4,
	Er: Er$4,
	Tm: Tm$4,
	Yb: Yb$4,
	Lu: Lu$4,
	Hf: Hf$4,
	Ta: Ta$4,
	W: W$4,
	Re: Re$4,
	Os: Os$4,
	Ir: Ir$4,
	Pt: Pt$4,
	Au: Au$4,
	Hg: Hg$4,
	Tl: Tl$4,
	Pb: Pb$4,
	Bi: Bi$4,
	Po: Po$4,
	At: At$4,
	Rn: Rn$4,
	Fr: Fr$4,
	Ra: Ra$4,
	Ac: Ac$4,
	Th: Th$4,
	Pa: 2,
	U: U$4,
	Np: Np$4,
	Pu: Pu$4,
	Am: Am$4,
	Cm: Cm$3
}, X$1 = null, H$3 = 1.2, He$3 = 1.4, Li$3 = 1.82, Be$3 = 1.53, B$3 = 1.92, C$3 = 1.7, N$3 = 1.55, O$3 = 1.52, F$3 = 1.47, Ne$3 = 1.54, Na$3 = 2.27, Mg$3 = 1.73, Al$3 = 1.84, Si$3 = 2.1, P$3 = 1.8, S$3 = 1.8, Cl$3 = 1.75, Ar$3 = 1.88, K$3 = 2.75, Ca$3 = 2.31, Sc$3 = null, Ti$3 = null, V$3 = null, Cr$3 = null, Mn$3 = null, Fe$3 = null, Co$3 = null, Ni$3 = 1.63, Cu$3 = 1.4, Zn$3 = 1.39, Ga$3 = 1.87, Ge$3 = 2.11, As$3 = 1.85, Se$3 = 1.9, Br$3 = 1.85, Kr$3 = 2.02, Rb$3 = 3.03, Sr$3 = 2.49, Y$3 = null, Zr$3 = null, Nb$3 = null, Mo$3 = null, Tc$3 = null, Ru$3 = null, Rh$3 = null, Pd$3 = 1.63, Ag$3 = 1.72, Cd$3 = 1.58, In$3 = 1.93, Sn$3 = 2.17, Sb$3 = 2.06, Te$3 = 2.06, I$3 = 1.98, Xe$3 = 2.16, Cs$3 = 3.43, Ba$3 = 2.49, La$3 = null, Ce$3 = null, Pr$3 = null, Nd$3 = null, Pm$3 = null, Sm$3 = null, Eu$3 = null, Gd$3 = null, Tb$3 = null, Dy$3 = null, Ho$3 = null, Er$3 = null, Tm$3 = null, Yb$3 = null, Lu$3 = null, Hf$3 = null, Ta$3 = null, W$3 = null, Re$3 = null, Os$3 = null, Ir$3 = null, Pt$3 = 1.75, Au$3 = 1.66, Hg$3 = 1.55, Tl$3 = 1.96, Pb$3 = 2.02, Bi$3 = 2.07, Po$3 = 1.97, At$3 = 2.02, Rn$3 = 2.2, Fr$3 = 3.48, Ra$3 = 2.83, Ac$3 = null, Th$3 = null, Pa$3 = null, U$3 = 1.86, Np$3 = null, Pu$3 = null, Am$3 = null, Cm$2 = null, Bk$2 = null, Cf$2 = null, Es$2 = null, Fm$2 = null, Md$2 = null, No$2 = null, Lr$2 = null, VDW_RADII_default = {
	X: null,
	H: H$3,
	He: He$3,
	Li: Li$3,
	Be: Be$3,
	B: B$3,
	C: C$3,
	N: N$3,
	O: O$3,
	F: F$3,
	Ne: Ne$3,
	Na: Na$3,
	Mg: Mg$3,
	Al: Al$3,
	Si: Si$3,
	P: P$3,
	S: S$3,
	Cl: Cl$3,
	Ar: Ar$3,
	K: K$3,
	Ca: Ca$3,
	Sc: null,
	Ti: null,
	V: null,
	Cr: null,
	Mn: null,
	Fe: null,
	Co: null,
	Ni: Ni$3,
	Cu: Cu$3,
	Zn: Zn$3,
	Ga: Ga$3,
	Ge: Ge$3,
	As: As$3,
	Se: Se$3,
	Br: Br$3,
	Kr: Kr$3,
	Rb: Rb$3,
	Sr: Sr$3,
	Y: null,
	Zr: null,
	Nb: null,
	Mo: null,
	Tc: null,
	Ru: null,
	Rh: null,
	Pd: Pd$3,
	Ag: Ag$3,
	Cd: Cd$3,
	In: In$3,
	Sn: Sn$3,
	Sb: Sb$3,
	Te: Te$3,
	I: I$3,
	Xe: Xe$3,
	Cs: Cs$3,
	Ba: Ba$3,
	La: null,
	Ce: null,
	Pr: null,
	Nd: null,
	Pm: null,
	Sm: null,
	Eu: null,
	Gd: null,
	Tb: null,
	Dy: null,
	Ho: null,
	Er: null,
	Tm: null,
	Yb: null,
	Lu: null,
	Hf: null,
	Ta: null,
	W: null,
	Re: null,
	Os: null,
	Ir: null,
	Pt: Pt$3,
	Au: Au$3,
	Hg: Hg$3,
	Tl: Tl$3,
	Pb: Pb$3,
	Bi: Bi$3,
	Po: Po$3,
	At: At$3,
	Rn: Rn$3,
	Fr: Fr$3,
	Ra: Ra$3,
	Ac: null,
	Th: null,
	Pa: null,
	U: U$3,
	Np: null,
	Pu: null,
	Am: null,
	Cm: null,
	Bk: null,
	Cf: null,
	Es: null,
	Fm: null,
	Md: null,
	No: null,
	Lr: null
}, DEFAULT_BOND_PAIRS_default = {
	"Ac-O": [
		1,
		1,
		0
	],
	"Ac-F": [
		1,
		1,
		0
	],
	"Ac-Cl": [
		1,
		1,
		0
	],
	"Ac-Br": [
		1,
		1,
		0
	],
	"Ag-O": [
		1,
		1,
		0
	],
	"Ag-S": [
		1,
		1,
		0
	],
	"Ag-F": [
		1,
		1,
		0
	],
	"Ag-Cl": [
		1,
		1,
		0
	],
	"Ag-Br": [
		1,
		1,
		0
	],
	"Ag-I": [
		1,
		1,
		0
	],
	"Ag-Se": [
		1,
		1,
		0
	],
	"Ag-Te": [
		1,
		1,
		0
	],
	"Ag-N": [
		1,
		1,
		0
	],
	"Ag-P": [
		1,
		1,
		0
	],
	"Ag-As": [
		1,
		1,
		0
	],
	"Ag-H": [
		1,
		1,
		0
	],
	"Al-O": [
		1,
		1,
		0
	],
	"Al-S": [
		1,
		1,
		0
	],
	"Al-Se": [
		1,
		1,
		0
	],
	"Al-Te": [
		1,
		1,
		0
	],
	"Al-F": [
		1,
		1,
		0
	],
	"Al-Cl": [
		1,
		1,
		0
	],
	"Al-Br": [
		1,
		1,
		0
	],
	"Al-I": [
		1,
		1,
		0
	],
	"Al-N": [
		1,
		1,
		0
	],
	"Al-P": [
		1,
		1,
		0
	],
	"Al-As": [
		1,
		1,
		0
	],
	"Al-H": [
		1,
		1,
		0
	],
	"Am-O": [
		1,
		1,
		0
	],
	"Am-F": [
		1,
		1,
		0
	],
	"Am-Cl": [
		1,
		1,
		0
	],
	"Am-Br": [
		1,
		1,
		0
	],
	"As-S": [
		1,
		1,
		0
	],
	"As-Se": [
		1,
		1,
		0
	],
	"As-O": [
		1,
		1,
		0
	],
	"As-Te": [
		1,
		1,
		0
	],
	"As-F": [
		1,
		1,
		0
	],
	"As-Cl": [
		1,
		1,
		0
	],
	"As-Br": [
		1,
		1,
		0
	],
	"As-I": [
		1,
		1,
		0
	],
	"As-C": [
		1,
		1,
		0
	],
	"Au-Cl": [
		1,
		1,
		0
	],
	"Au-I": [
		1,
		1,
		0
	],
	"Au-O": [
		1,
		1,
		0
	],
	"Au-S": [
		1,
		1,
		0
	],
	"Au-F": [
		1,
		1,
		0
	],
	"Au-Br": [
		1,
		1,
		0
	],
	"Au-N": [
		1,
		1,
		0
	],
	"Au-Se": [
		1,
		1,
		0
	],
	"Au-Te": [
		1,
		1,
		0
	],
	"Au-P": [
		1,
		1,
		0
	],
	"Au-As": [
		1,
		1,
		0
	],
	"Au-H": [
		1,
		1,
		0
	],
	"B-O": [
		1,
		1,
		0
	],
	"B-S": [
		1,
		1,
		0
	],
	"B-Se": [
		1,
		1,
		0
	],
	"B-Te": [
		1,
		1,
		0
	],
	"B-F": [
		1,
		1,
		0
	],
	"B-Cl": [
		1,
		1,
		0
	],
	"B-Br": [
		1,
		1,
		0
	],
	"B-I": [
		1,
		1,
		0
	],
	"B-N": [
		1,
		1,
		0
	],
	"B-P": [
		1,
		1,
		0
	],
	"B-As": [
		1,
		1,
		0
	],
	"B-H": [
		1,
		1,
		0
	],
	"B-B": [
		1,
		1,
		0
	],
	"Ba-O": [
		1,
		1,
		0
	],
	"Ba-S": [
		1,
		1,
		0
	],
	"Ba-Se": [
		1,
		1,
		0
	],
	"Ba-Te": [
		1,
		1,
		0
	],
	"Ba-F": [
		1,
		1,
		0
	],
	"Ba-Cl": [
		1,
		1,
		0
	],
	"Ba-Br": [
		1,
		1,
		0
	],
	"Ba-I": [
		1,
		1,
		0
	],
	"Ba-N": [
		1,
		1,
		0
	],
	"Ba-P": [
		1,
		1,
		0
	],
	"Ba-As": [
		1,
		1,
		0
	],
	"Ba-H": [
		1,
		1,
		0
	],
	"Be-O": [
		1,
		1,
		0
	],
	"Be-S": [
		1,
		1,
		0
	],
	"Be-Se": [
		1,
		1,
		0
	],
	"Be-Te": [
		1,
		1,
		0
	],
	"Be-F": [
		1,
		1,
		0
	],
	"Be-Cl": [
		1,
		1,
		0
	],
	"Be-Br": [
		1,
		1,
		0
	],
	"Be-I": [
		1,
		1,
		0
	],
	"Be-N": [
		1,
		1,
		0
	],
	"Be-P": [
		1,
		1,
		0
	],
	"Be-As": [
		1,
		1,
		0
	],
	"Be-H": [
		1,
		1,
		0
	],
	"Bi-O": [
		1,
		1,
		0
	],
	"Bi-S": [
		1,
		1,
		0
	],
	"Bi-Se": [
		1,
		1,
		0
	],
	"Bi-F": [
		1,
		1,
		0
	],
	"Bi-Cl": [
		1,
		1,
		0
	],
	"Bi-Br": [
		1,
		1,
		0
	],
	"Bi-I": [
		1,
		1,
		0
	],
	"Bi-N": [
		1,
		1,
		0
	],
	"Bi-Te": [
		1,
		1,
		0
	],
	"Bi-P": [
		1,
		1,
		0
	],
	"Bi-As": [
		1,
		1,
		0
	],
	"Bi-H": [
		1,
		1,
		0
	],
	"Bk-O": [
		1,
		1,
		0
	],
	"Bk-F": [
		1,
		1,
		0
	],
	"Bk-Cl": [
		1,
		1,
		0
	],
	"Bk-Br": [
		1,
		1,
		0
	],
	"Br-O": [
		1,
		1,
		0
	],
	"Br-F": [
		1,
		1,
		0
	],
	"Br-Cl": [
		1,
		1,
		0
	],
	"C-Au": [
		1,
		1,
		0
	],
	"C-O": [
		2,
		1,
		0
	],
	"C-Cl": [
		2,
		1,
		0
	],
	"C-C": [
		2,
		0,
		0
	],
	"C-S": [
		2,
		0,
		0
	],
	"C-F": [
		2,
		1,
		0
	],
	"C-Br": [
		2,
		1,
		0
	],
	"C-N": [
		2,
		1,
		0
	],
	"C-Se": [
		2,
		1,
		0
	],
	"C-I": [
		2,
		1,
		0
	],
	"C-Te": [
		1,
		1,
		0
	],
	"C-P": [
		2,
		1,
		0
	],
	"C-Pt": [
		1,
		1,
		0
	],
	"C-H": [
		1,
		0,
		0
	],
	"Ca-O": [
		1,
		1,
		0
	],
	"Ca-S": [
		1,
		1,
		0
	],
	"Ca-Se": [
		1,
		1,
		0
	],
	"Ca-Te": [
		1,
		1,
		0
	],
	"Ca-F": [
		1,
		1,
		0
	],
	"Ca-Cl": [
		1,
		1,
		0
	],
	"Ca-Br": [
		1,
		1,
		0
	],
	"Ca-I": [
		1,
		1,
		0
	],
	"Ca-N": [
		1,
		1,
		0
	],
	"Ca-P": [
		1,
		1,
		0
	],
	"Ca-As": [
		1,
		1,
		0
	],
	"Ca-H": [
		1,
		1,
		0
	],
	"Cd-O": [
		1,
		1,
		0
	],
	"Cd-S": [
		1,
		1,
		0
	],
	"Cd-Se": [
		1,
		1,
		0
	],
	"Cd-Te": [
		1,
		1,
		0
	],
	"Cd-F": [
		1,
		1,
		0
	],
	"Cd-Cl": [
		1,
		1,
		0
	],
	"Cd-Br": [
		1,
		1,
		0
	],
	"Cd-I": [
		1,
		1,
		0
	],
	"Cd-N": [
		1,
		1,
		0
	],
	"Cd-P": [
		1,
		1,
		0
	],
	"Cd-As": [
		1,
		1,
		0
	],
	"Cd-H": [
		1,
		1,
		0
	],
	"Ce-O": [
		1,
		1,
		0
	],
	"Ce-S": [
		1,
		1,
		0
	],
	"Ce-F": [
		1,
		1,
		0
	],
	"Ce-Cl": [
		1,
		1,
		0
	],
	"Ce-Br": [
		1,
		1,
		0
	],
	"Ce-I": [
		1,
		1,
		0
	],
	"Ce-N": [
		1,
		1,
		0
	],
	"Ce-Se": [
		1,
		1,
		0
	],
	"Ce-Te": [
		1,
		1,
		0
	],
	"Ce-P": [
		1,
		1,
		0
	],
	"Ce-As": [
		1,
		1,
		0
	],
	"Ce-H": [
		1,
		1,
		0
	],
	"Cf-O": [
		1,
		1,
		0
	],
	"Cf-F": [
		1,
		1,
		0
	],
	"Cf-Cl": [
		1,
		1,
		0
	],
	"Cf-Br": [
		1,
		1,
		0
	],
	"Cl-H": [
		1,
		0,
		0
	],
	"Cl-O": [
		1,
		1,
		0
	],
	"Cl-F": [
		1,
		1,
		0
	],
	"Cl-Cl": [
		1,
		1,
		0
	],
	"Cm-O": [
		1,
		1,
		0
	],
	"Cm-F": [
		1,
		1,
		0
	],
	"Cm-Cl": [
		1,
		1,
		0
	],
	"Co-H": [
		1,
		1,
		0
	],
	"Co-O": [
		1,
		1,
		0
	],
	"Co-S": [
		1,
		1,
		0
	],
	"Co-F": [
		1,
		1,
		0
	],
	"Co-Cl": [
		1,
		1,
		0
	],
	"Co-N": [
		1,
		1,
		0
	],
	"Co-C": [
		1,
		1,
		0
	],
	"Co-Br": [
		1,
		1,
		0
	],
	"Co-I": [
		1,
		1,
		0
	],
	"Co-Se": [
		1,
		1,
		0
	],
	"Co-Te": [
		1,
		1,
		0
	],
	"Co-P": [
		1,
		1,
		0
	],
	"Co-As": [
		1,
		1,
		0
	],
	"Cr-O": [
		1,
		1,
		0
	],
	"Cr-F": [
		1,
		1,
		0
	],
	"Cr-Cl": [
		1,
		1,
		0
	],
	"Cr-Br": [
		1,
		1,
		0
	],
	"Cr-I": [
		1,
		1,
		0
	],
	"Cr-N": [
		1,
		1,
		0
	],
	"Cr-S": [
		1,
		1,
		0
	],
	"Cr-Se": [
		1,
		1,
		0
	],
	"Cr-Te": [
		1,
		1,
		0
	],
	"Cr-P": [
		1,
		1,
		0
	],
	"Cr-As": [
		1,
		1,
		0
	],
	"Cr-H": [
		1,
		1,
		0
	],
	"Cs-O": [
		1,
		1,
		0
	],
	"Cs-S": [
		1,
		1,
		0
	],
	"Cs-Se": [
		1,
		1,
		0
	],
	"Cs-Te": [
		1,
		1,
		0
	],
	"Cs-F": [
		1,
		1,
		0
	],
	"Cs-Cl": [
		1,
		1,
		0
	],
	"Cs-Br": [
		1,
		1,
		0
	],
	"Cs-I": [
		1,
		1,
		0
	],
	"Cs-N": [
		1,
		1,
		0
	],
	"Cs-P": [
		1,
		1,
		0
	],
	"Cs-As": [
		1,
		1,
		0
	],
	"Cs-H": [
		1,
		1,
		0
	],
	"Cu-O": [
		1,
		1,
		0
	],
	"Cu-S": [
		1,
		1,
		0
	],
	"Cu-Se": [
		1,
		1,
		0
	],
	"Cu-F": [
		1,
		1,
		0
	],
	"Cu-Cl": [
		1,
		1,
		0
	],
	"Cu-Br": [
		1,
		1,
		0
	],
	"Cu-I": [
		1,
		1,
		0
	],
	"Cu-N": [
		1,
		1,
		0
	],
	"Cu-P": [
		1,
		1,
		0
	],
	"Cu-As": [
		1,
		1,
		0
	],
	"Cu-C": [
		1,
		1,
		0
	],
	"Cu-Te": [
		1,
		1,
		0
	],
	"Cu-H": [
		1,
		1,
		0
	],
	"Dy-O": [
		1,
		1,
		0
	],
	"Dy-F": [
		1,
		1,
		0
	],
	"Dy-Cl": [
		1,
		1,
		0
	],
	"Dy-Br": [
		1,
		1,
		0
	],
	"Dy-I": [
		1,
		1,
		0
	],
	"Dy-S": [
		1,
		1,
		0
	],
	"Dy-Se": [
		1,
		1,
		0
	],
	"Dy-Te": [
		1,
		1,
		0
	],
	"Dy-N": [
		1,
		1,
		0
	],
	"Dy-P": [
		1,
		1,
		0
	],
	"Dy-As": [
		1,
		1,
		0
	],
	"Dy-H": [
		1,
		1,
		0
	],
	"Er-O": [
		1,
		1,
		0
	],
	"Er-S": [
		1,
		1,
		0
	],
	"Er-Se": [
		1,
		1,
		0
	],
	"Er-F": [
		1,
		1,
		0
	],
	"Er-Cl": [
		1,
		1,
		0
	],
	"Er-Br": [
		1,
		1,
		0
	],
	"Er-I": [
		1,
		1,
		0
	],
	"Er-Te": [
		1,
		1,
		0
	],
	"Er-N": [
		1,
		1,
		0
	],
	"Er-P": [
		1,
		1,
		0
	],
	"Er-As": [
		1,
		1,
		0
	],
	"Er-H": [
		1,
		1,
		0
	],
	"Es-O": [
		1,
		1,
		0
	],
	"Eu-O": [
		1,
		1,
		0
	],
	"Eu-S": [
		1,
		1,
		0
	],
	"Eu-F": [
		1,
		1,
		0
	],
	"Eu-Cl": [
		1,
		1,
		0
	],
	"Eu-Br": [
		1,
		1,
		0
	],
	"Eu-I": [
		1,
		1,
		0
	],
	"Eu-N": [
		1,
		1,
		0
	],
	"Eu-Se": [
		1,
		1,
		0
	],
	"Eu-Te": [
		1,
		1,
		0
	],
	"Eu-P": [
		1,
		1,
		0
	],
	"Eu-As": [
		1,
		1,
		0
	],
	"Eu-H": [
		1,
		1,
		0
	],
	"F-H": [
		1,
		0,
		0
	],
	"Fe-O": [
		1,
		1,
		0
	],
	"Fe-S": [
		1,
		1,
		0
	],
	"Fe-F": [
		1,
		1,
		0
	],
	"Fe-Cl": [
		1,
		1,
		0
	],
	"Fe-Br": [
		1,
		1,
		0
	],
	"Fe-I": [
		1,
		1,
		0
	],
	"Fe-N": [
		1,
		1,
		0
	],
	"Fe-C": [
		1,
		1,
		0
	],
	"Fe-Se": [
		1,
		1,
		0
	],
	"Fe-Te": [
		1,
		1,
		0
	],
	"Fe-P": [
		1,
		1,
		0
	],
	"Fe-As": [
		1,
		1,
		0
	],
	"Fe-H": [
		1,
		1,
		0
	],
	"Ga-Se": [
		1,
		1,
		0
	],
	"Ga-O": [
		1,
		1,
		0
	],
	"Ga-S": [
		1,
		1,
		0
	],
	"Ga-F": [
		1,
		1,
		0
	],
	"Ga-Cl": [
		1,
		1,
		0
	],
	"Ga-Br": [
		1,
		1,
		0
	],
	"Ga-I": [
		1,
		1,
		0
	],
	"Ga-Te": [
		1,
		1,
		0
	],
	"Ga-N": [
		1,
		1,
		0
	],
	"Ga-P": [
		1,
		1,
		0
	],
	"Ga-As": [
		1,
		1,
		0
	],
	"Ga-H": [
		1,
		1,
		0
	],
	"Gd-O": [
		1,
		1,
		0
	],
	"Gd-F": [
		1,
		1,
		0
	],
	"Gd-S": [
		1,
		1,
		0
	],
	"Gd-Cl": [
		1,
		1,
		0
	],
	"Gd-Br": [
		1,
		1,
		0
	],
	"Gd-I": [
		1,
		1,
		0
	],
	"Gd-Se": [
		1,
		1,
		0
	],
	"Gd-Te": [
		1,
		1,
		0
	],
	"Gd-N": [
		1,
		1,
		0
	],
	"Gd-P": [
		1,
		1,
		0
	],
	"Gd-As": [
		1,
		1,
		0
	],
	"Gd-H": [
		1,
		1,
		0
	],
	"Ge-O": [
		1,
		1,
		0
	],
	"Ge-S": [
		1,
		1,
		0
	],
	"Ge-Se": [
		1,
		1,
		0
	],
	"Ge-F": [
		1,
		1,
		0
	],
	"Ge-Cl": [
		1,
		1,
		0
	],
	"Ge-Br": [
		1,
		1,
		0
	],
	"Ge-I": [
		1,
		1,
		0
	],
	"Ge-Te": [
		1,
		1,
		0
	],
	"Ge-N": [
		1,
		1,
		0
	],
	"Ge-P": [
		1,
		1,
		0
	],
	"Ge-As": [
		1,
		1,
		0
	],
	"Ge-H": [
		1,
		1,
		0
	],
	"Ge-Ge": [
		1,
		1,
		0
	],
	"O-H": [
		1,
		0,
		0
	],
	"H-O": [
		0,
		0,
		1
	],
	"H-N": [
		0,
		0,
		1
	],
	"O-D": [
		1,
		0,
		0
	],
	"D-O": [
		0,
		0,
		0
	],
	"D-F": [
		1,
		0,
		0
	],
	"D-Cl": [
		1,
		0,
		0
	],
	"D-N": [
		1,
		0,
		0
	],
	"Hf-F": [
		1,
		1,
		0
	],
	"Hf-O": [
		1,
		1,
		0
	],
	"Hf-Cl": [
		1,
		1,
		0
	],
	"Hf-Br": [
		1,
		1,
		0
	],
	"Hf-S": [
		1,
		1,
		0
	],
	"Hf-Se": [
		1,
		1,
		0
	],
	"Hf-Te": [
		1,
		1,
		0
	],
	"Hf-I": [
		1,
		1,
		0
	],
	"Hf-N": [
		1,
		1,
		0
	],
	"Hf-P": [
		1,
		1,
		0
	],
	"Hf-As": [
		1,
		1,
		0
	],
	"Hf-H": [
		1,
		1,
		0
	],
	"Hg-O": [
		1,
		1,
		0
	],
	"Hg-F": [
		1,
		1,
		0
	],
	"Hg-Cl": [
		1,
		1,
		0
	],
	"Hg-S": [
		1,
		1,
		0
	],
	"Hg-Br": [
		1,
		1,
		0
	],
	"Hg-I": [
		1,
		1,
		0
	],
	"Hg-Se": [
		1,
		1,
		0
	],
	"Hg-Te": [
		1,
		1,
		0
	],
	"Hg-N": [
		1,
		1,
		0
	],
	"Hg-P": [
		1,
		1,
		0
	],
	"Hg-As": [
		1,
		1,
		0
	],
	"Hg-H": [
		1,
		1,
		0
	],
	"Hg-Hg": [
		1,
		1,
		0
	],
	"Ho-O": [
		1,
		1,
		0
	],
	"Ho-S": [
		1,
		1,
		0
	],
	"Ho-F": [
		1,
		1,
		0
	],
	"Ho-Cl": [
		1,
		1,
		0
	],
	"Ho-Br": [
		1,
		1,
		0
	],
	"Ho-I": [
		1,
		1,
		0
	],
	"Ho-Se": [
		1,
		1,
		0
	],
	"Ho-Te": [
		1,
		1,
		0
	],
	"Ho-N": [
		1,
		1,
		0
	],
	"Ho-P": [
		1,
		1,
		0
	],
	"Ho-As": [
		1,
		1,
		0
	],
	"Ho-H": [
		1,
		1,
		0
	],
	"I-I": [
		1,
		1,
		0
	],
	"I-F": [
		1,
		1,
		0
	],
	"I-Cl": [
		1,
		1,
		0
	],
	"I-O": [
		1,
		1,
		0
	],
	"In-Cl": [
		1,
		1,
		0
	],
	"In-O": [
		1,
		1,
		0
	],
	"In-S": [
		1,
		1,
		0
	],
	"In-F": [
		1,
		1,
		0
	],
	"In-Br": [
		1,
		1,
		0
	],
	"In-I": [
		1,
		1,
		0
	],
	"In-Co": [
		1,
		1,
		0
	],
	"In-Mn": [
		1,
		1,
		0
	],
	"In-Se": [
		1,
		1,
		0
	],
	"In-Te": [
		1,
		1,
		0
	],
	"In-N": [
		1,
		1,
		0
	],
	"In-P": [
		1,
		1,
		0
	],
	"In-As": [
		1,
		1,
		0
	],
	"In-H": [
		1,
		1,
		0
	],
	"Ir-O": [
		1,
		1,
		0
	],
	"Ir-F": [
		1,
		1,
		0
	],
	"Ir-Cl": [
		1,
		1,
		0
	],
	"Ir-S": [
		1,
		1,
		0
	],
	"Ir-Se": [
		1,
		1,
		0
	],
	"Ir-Te": [
		1,
		1,
		0
	],
	"Ir-Br": [
		1,
		1,
		0
	],
	"Ir-I": [
		1,
		1,
		0
	],
	"Ir-N": [
		1,
		1,
		0
	],
	"Ir-P": [
		1,
		1,
		0
	],
	"Ir-As": [
		1,
		1,
		0
	],
	"Ir-H": [
		1,
		1,
		0
	],
	"K-O": [
		1,
		1,
		0
	],
	"K-S": [
		1,
		1,
		0
	],
	"K-Se": [
		1,
		1,
		0
	],
	"K-Te": [
		1,
		1,
		0
	],
	"K-F": [
		1,
		1,
		0
	],
	"K-Cl": [
		1,
		1,
		0
	],
	"K-Br": [
		1,
		1,
		0
	],
	"K-I": [
		1,
		1,
		0
	],
	"K-N": [
		1,
		1,
		0
	],
	"K-P": [
		1,
		1,
		0
	],
	"K-As": [
		1,
		1,
		0
	],
	"K-H": [
		1,
		1,
		0
	],
	"Kr-F": [
		1,
		1,
		0
	],
	"La-O": [
		1,
		1,
		0
	],
	"La-S": [
		1,
		1,
		0
	],
	"La-Se": [
		1,
		1,
		0
	],
	"La-Te": [
		1,
		1,
		0
	],
	"La-F": [
		1,
		1,
		0
	],
	"La-Cl": [
		1,
		1,
		0
	],
	"La-Br": [
		1,
		1,
		0
	],
	"La-I": [
		1,
		1,
		0
	],
	"La-N": [
		1,
		1,
		0
	],
	"La-P": [
		1,
		1,
		0
	],
	"La-As": [
		1,
		1,
		0
	],
	"La-H": [
		1,
		1,
		0
	],
	"Li-O": [
		1,
		1,
		0
	],
	"Li-S": [
		1,
		1,
		0
	],
	"Li-Se": [
		1,
		1,
		0
	],
	"Li-Te": [
		1,
		1,
		0
	],
	"Li-F": [
		1,
		1,
		0
	],
	"Li-Cl": [
		1,
		1,
		0
	],
	"Li-Br": [
		1,
		1,
		0
	],
	"Li-I": [
		1,
		1,
		0
	],
	"Li-N": [
		1,
		1,
		0
	],
	"Lu-O": [
		1,
		1,
		0
	],
	"Lu-S": [
		1,
		1,
		0
	],
	"Lu-Se": [
		1,
		1,
		0
	],
	"Lu-Te": [
		1,
		1,
		0
	],
	"Lu-F": [
		1,
		1,
		0
	],
	"Lu-Cl": [
		1,
		1,
		0
	],
	"Lu-Br": [
		1,
		1,
		0
	],
	"Lu-I": [
		1,
		1,
		0
	],
	"Lu-N": [
		1,
		1,
		0
	],
	"Lu-P": [
		1,
		1,
		0
	],
	"Lu-As": [
		1,
		1,
		0
	],
	"Lu-H": [
		1,
		1,
		0
	],
	"Mg-O": [
		1,
		1,
		0
	],
	"Mg-S": [
		1,
		1,
		0
	],
	"Mg-Se": [
		1,
		1,
		0
	],
	"Mg-Te": [
		1,
		1,
		0
	],
	"Mg-F": [
		1,
		1,
		0
	],
	"Mg-Cl": [
		1,
		1,
		0
	],
	"Mg-Br": [
		1,
		1,
		0
	],
	"Mg-I": [
		1,
		1,
		0
	],
	"Mg-N": [
		1,
		1,
		0
	],
	"Mg-P": [
		1,
		1,
		0
	],
	"Mg-As": [
		1,
		1,
		0
	],
	"Mg-H": [
		1,
		1,
		0
	],
	"Mn-O": [
		1,
		1,
		0
	],
	"Mn-S": [
		1,
		1,
		0
	],
	"Mn-F": [
		1,
		1,
		0
	],
	"Mn-Cl": [
		1,
		1,
		0
	],
	"Mn-Br": [
		1,
		1,
		0
	],
	"Mn-I": [
		1,
		1,
		0
	],
	"Mn-N": [
		1,
		1,
		0
	],
	"Mn-Se": [
		1,
		1,
		0
	],
	"Mn-Te": [
		1,
		1,
		0
	],
	"Mn-P": [
		1,
		1,
		0
	],
	"Mn-As": [
		1,
		1,
		0
	],
	"Mn-H": [
		1,
		1,
		0
	],
	"Mo-S": [
		1,
		1,
		0
	],
	"Mo-Cl": [
		1,
		1,
		0
	],
	"Mo-O": [
		1,
		1,
		0
	],
	"Mo-F": [
		1,
		1,
		0
	],
	"Mo-Br": [
		1,
		1,
		0
	],
	"Mo-N": [
		1,
		1,
		0
	],
	"Mo-I": [
		1,
		1,
		0
	],
	"Mo-Se": [
		1,
		1,
		0
	],
	"Mo-Te": [
		1,
		1,
		0
	],
	"Mo-P": [
		1,
		1,
		0
	],
	"Mo-As": [
		1,
		1,
		0
	],
	"Mo-H": [
		1,
		1,
		0
	],
	"N-H": [
		1,
		0,
		0
	],
	"N-O": [
		1,
		1,
		0
	],
	"N-F": [
		1,
		1,
		0
	],
	"N-Cl": [
		1,
		1,
		0
	],
	"N-N": [
		1,
		1,
		0
	],
	"Na-O": [
		1,
		1,
		0
	],
	"Na-S": [
		1,
		1,
		0
	],
	"Na-Se": [
		1,
		1,
		0
	],
	"Na-Te": [
		1,
		1,
		0
	],
	"Na-F": [
		1,
		1,
		0
	],
	"Na-Cl": [
		1,
		1,
		0
	],
	"Na-Br": [
		1,
		1,
		0
	],
	"Na-I": [
		1,
		1,
		0
	],
	"Na-N": [
		1,
		1,
		0
	],
	"Na-P": [
		1,
		1,
		0
	],
	"Na-As": [
		1,
		1,
		0
	],
	"Na-H": [
		1,
		1,
		0
	],
	"Nb-O": [
		1,
		1,
		0
	],
	"Nb-F": [
		1,
		1,
		0
	],
	"Nb-Cl": [
		1,
		1,
		0
	],
	"Nb-Br": [
		1,
		1,
		0
	],
	"Nb-N": [
		1,
		1,
		0
	],
	"Nb-I": [
		1,
		1,
		0
	],
	"Nb-S": [
		1,
		1,
		0
	],
	"Nb-Se": [
		1,
		1,
		0
	],
	"Nb-Te": [
		1,
		1,
		0
	],
	"Nb-P": [
		1,
		1,
		0
	],
	"Nb-As": [
		1,
		1,
		0
	],
	"Nb-H": [
		1,
		1,
		0
	],
	"Nd-O": [
		1,
		1,
		0
	],
	"Nd-S": [
		1,
		1,
		0
	],
	"Nd-Se": [
		1,
		1,
		0
	],
	"Nd-Te": [
		1,
		1,
		0
	],
	"Nd-F": [
		1,
		1,
		0
	],
	"Nd-Cl": [
		1,
		1,
		0
	],
	"Nd-Br": [
		1,
		1,
		0
	],
	"Nd-I": [
		1,
		1,
		0
	],
	"Nd-N": [
		1,
		1,
		0
	],
	"NH-O": [
		1,
		1,
		0
	],
	"NH-F": [
		1,
		1,
		0
	],
	"NH-Cl": [
		1,
		1,
		0
	],
	"Ni-O": [
		1,
		1,
		0
	],
	"Ni-S": [
		1,
		1,
		0
	],
	"Ni-F": [
		1,
		1,
		0
	],
	"Ni-Cl": [
		1,
		1,
		0
	],
	"Ni-Br": [
		1,
		1,
		0
	],
	"Ni-I": [
		1,
		1,
		0
	],
	"Ni-N": [
		1,
		1,
		0
	],
	"Ni-Se": [
		1,
		1,
		0
	],
	"Ni-Te": [
		1,
		1,
		0
	],
	"Ni-P": [
		1,
		1,
		0
	],
	"Ni-As": [
		1,
		1,
		0
	],
	"Ni-H": [
		1,
		1,
		0
	],
	"Np-F": [
		1,
		1,
		0
	],
	"Np-Cl": [
		1,
		1,
		0
	],
	"Np-S": [
		1,
		1,
		0
	],
	"Np-Br": [
		1,
		1,
		0
	],
	"Np-I": [
		1,
		1,
		0
	],
	"Np-O": [
		1,
		1,
		0
	],
	"O-O": [
		1,
		0,
		0
	],
	"Os-O": [
		1,
		1,
		0
	],
	"Os-S": [
		1,
		1,
		0
	],
	"Os-F": [
		1,
		1,
		0
	],
	"Os-Cl": [
		1,
		1,
		0
	],
	"Os-Br": [
		1,
		1,
		0
	],
	"P-O": [
		1,
		1,
		0
	],
	"P-S": [
		1,
		1,
		0
	],
	"P-Se": [
		1,
		1,
		0
	],
	"P-F": [
		1,
		1,
		0
	],
	"P-Cl": [
		1,
		1,
		0
	],
	"P-Br": [
		1,
		1,
		0
	],
	"P-N": [
		1,
		1,
		0
	],
	"P-I": [
		1,
		1,
		0
	],
	"P-P": [
		1,
		1,
		0
	],
	"P-As": [
		1,
		1,
		0
	],
	"P-H": [
		1,
		1,
		0
	],
	"Pa-O": [
		1,
		1,
		0
	],
	"Pa-F": [
		1,
		1,
		0
	],
	"Pa-Cl": [
		1,
		1,
		0
	],
	"Pa-Br": [
		1,
		1,
		0
	],
	"Pb-O": [
		1,
		1,
		0
	],
	"Pb-S": [
		1,
		1,
		0
	],
	"Pb-Se": [
		1,
		1,
		0
	],
	"Pb-F": [
		1,
		1,
		0
	],
	"Pb-Cl": [
		1,
		1,
		0
	],
	"Pb-Br": [
		1,
		1,
		0
	],
	"Pb-I": [
		1,
		1,
		0
	],
	"Pb-N": [
		1,
		1,
		0
	],
	"Pb-Te": [
		1,
		1,
		0
	],
	"Pb-P": [
		1,
		1,
		0
	],
	"Pb-As": [
		1,
		1,
		0
	],
	"Pb-H": [
		1,
		1,
		0
	],
	"Pd-O": [
		1,
		1,
		0
	],
	"Pd-S": [
		1,
		1,
		0
	],
	"Pd-F": [
		1,
		1,
		0
	],
	"Pd-Cl": [
		1,
		1,
		0
	],
	"Pd-Br": [
		1,
		1,
		0
	],
	"Pd-I": [
		1,
		1,
		0
	],
	"Pd-N": [
		1,
		1,
		0
	],
	"Pd-C": [
		1,
		1,
		0
	],
	"Pd-Se": [
		1,
		1,
		0
	],
	"Pd-Te": [
		1,
		1,
		0
	],
	"Pd-P": [
		1,
		1,
		0
	],
	"Pd-As": [
		1,
		1,
		0
	],
	"Pd-H": [
		1,
		1,
		0
	],
	"Pm-F": [
		1,
		1,
		0
	],
	"Pm-Cl": [
		1,
		1,
		0
	],
	"Pm-Br": [
		1,
		1,
		0
	],
	"Po-O": [
		1,
		1,
		0
	],
	"Po-F": [
		1,
		1,
		0
	],
	"Pr-O": [
		1,
		1,
		0
	],
	"Pr-S": [
		1,
		1,
		0
	],
	"Pr-Se": [
		1,
		1,
		0
	],
	"Pr-Te": [
		1,
		1,
		0
	],
	"Pr-F": [
		1,
		1,
		0
	],
	"Pr-Cl": [
		1,
		1,
		0
	],
	"Pr-Br": [
		1,
		1,
		0
	],
	"Pr-I": [
		1,
		1,
		0
	],
	"Pr-N": [
		1,
		1,
		0
	],
	"Pr-P": [
		1,
		1,
		0
	],
	"Pr-As": [
		1,
		1,
		0
	],
	"Pr-H": [
		1,
		1,
		0
	],
	"Pt-O": [
		1,
		1,
		0
	],
	"Pt-S": [
		1,
		1,
		0
	],
	"Pt-F": [
		1,
		1,
		0
	],
	"Pt-Cl": [
		1,
		1,
		0
	],
	"Pt-Br": [
		1,
		1,
		0
	],
	"Pt-C": [
		1,
		1,
		0
	],
	"Pt-N": [
		1,
		1,
		0
	],
	"Pt-I": [
		1,
		1,
		0
	],
	"Pt-Se": [
		1,
		1,
		0
	],
	"Pt-Te": [
		1,
		1,
		0
	],
	"Pt-P": [
		1,
		1,
		0
	],
	"Pt-As": [
		1,
		1,
		0
	],
	"Pt-H": [
		1,
		1,
		0
	],
	"Pu-O": [
		1,
		1,
		0
	],
	"Pu-F": [
		1,
		1,
		0
	],
	"Pu-Cl": [
		1,
		1,
		0
	],
	"Pu-S": [
		1,
		1,
		0
	],
	"Pu-Br": [
		1,
		1,
		0
	],
	"Pu-I": [
		1,
		1,
		0
	],
	"Rb-O": [
		1,
		1,
		0
	],
	"Rb-S": [
		1,
		1,
		0
	],
	"Rb-Se": [
		1,
		1,
		0
	],
	"Rb-Te": [
		1,
		1,
		0
	],
	"Rb-F": [
		1,
		1,
		0
	],
	"Rb-Cl": [
		1,
		1,
		0
	],
	"Rb-Br": [
		1,
		1,
		0
	],
	"Rb-I": [
		1,
		1,
		0
	],
	"Rb-N": [
		1,
		1,
		0
	],
	"Rb-P": [
		1,
		1,
		0
	],
	"Rb-As": [
		1,
		1,
		0
	],
	"Rb-H": [
		1,
		1,
		0
	],
	"Re-Cl": [
		1,
		1,
		0
	],
	"Re-O": [
		1,
		1,
		0
	],
	"Re-F": [
		1,
		1,
		0
	],
	"Re-Br": [
		1,
		1,
		0
	],
	"Re-I": [
		1,
		1,
		0
	],
	"Re-S": [
		1,
		1,
		0
	],
	"Re-Se": [
		1,
		1,
		0
	],
	"Re-Te": [
		1,
		1,
		0
	],
	"Re-N": [
		1,
		1,
		0
	],
	"Re-P": [
		1,
		1,
		0
	],
	"Re-As": [
		1,
		1,
		0
	],
	"Re-H": [
		1,
		1,
		0
	],
	"Rh-O": [
		1,
		1,
		0
	],
	"Rh-F": [
		1,
		1,
		0
	],
	"Rh-Cl": [
		1,
		1,
		0
	],
	"Rh-Br": [
		1,
		1,
		0
	],
	"Rh-N": [
		1,
		1,
		0
	],
	"Rh-I": [
		1,
		1,
		0
	],
	"Rh-S": [
		1,
		1,
		0
	],
	"Rh-Se": [
		1,
		1,
		0
	],
	"Rh-Te": [
		1,
		1,
		0
	],
	"Rh-P": [
		1,
		1,
		0
	],
	"Rh-As": [
		1,
		1,
		0
	],
	"Rh-H": [
		1,
		1,
		0
	],
	"Ru-Se": [
		1,
		1,
		0
	],
	"Ru-F": [
		1,
		1,
		0
	],
	"Ru-O": [
		1,
		1,
		0
	],
	"Ru-S": [
		1,
		1,
		0
	],
	"Ru-Cl": [
		1,
		1,
		0
	],
	"Ru-N": [
		1,
		1,
		0
	],
	"Ru-Br": [
		1,
		1,
		0
	],
	"Ru-I": [
		1,
		1,
		0
	],
	"Ru-Te": [
		1,
		1,
		0
	],
	"Ru-P": [
		1,
		1,
		0
	],
	"Ru-As": [
		1,
		1,
		0
	],
	"Ru-H": [
		1,
		1,
		0
	],
	"S-O": [
		1,
		1,
		0
	],
	"S-S": [
		1,
		1,
		0
	],
	"S-N": [
		1,
		1,
		0
	],
	"S-F": [
		1,
		1,
		0
	],
	"S-Cl": [
		1,
		1,
		0
	],
	"S-Br": [
		1,
		1,
		0
	],
	"S-I": [
		1,
		1,
		0
	],
	"S-H": [
		1,
		1,
		0
	],
	"Sb-O": [
		1,
		1,
		0
	],
	"Sb-S": [
		1,
		1,
		0
	],
	"Sb-Se": [
		1,
		1,
		0
	],
	"Sb-F": [
		1,
		1,
		0
	],
	"Sb-Cl": [
		1,
		1,
		0
	],
	"Sb-Br": [
		1,
		1,
		0
	],
	"Sb-I": [
		1,
		1,
		0
	],
	"Sb-N": [
		1,
		1,
		0
	],
	"Sb-Te": [
		1,
		1,
		0
	],
	"Sb-P": [
		1,
		1,
		0
	],
	"Sb-As": [
		1,
		1,
		0
	],
	"Sb-H": [
		1,
		1,
		0
	],
	"Sc-O": [
		1,
		1,
		0
	],
	"Sc-S": [
		1,
		1,
		0
	],
	"Sc-Se": [
		1,
		1,
		0
	],
	"Sc-Te": [
		1,
		1,
		0
	],
	"Sc-F": [
		1,
		1,
		0
	],
	"Sc-Cl": [
		1,
		1,
		0
	],
	"Sc-Br": [
		1,
		1,
		0
	],
	"Sc-I": [
		1,
		1,
		0
	],
	"Sc-N": [
		1,
		1,
		0
	],
	"Sc-P": [
		1,
		1,
		0
	],
	"Sc-As": [
		1,
		1,
		0
	],
	"Sc-H": [
		1,
		1,
		0
	],
	"Se-S": [
		1,
		1,
		0
	],
	"Se-Se": [
		1,
		1,
		0
	],
	"Se-O": [
		1,
		1,
		0
	],
	"Se-F": [
		1,
		1,
		0
	],
	"Se-Cl": [
		1,
		1,
		0
	],
	"Se-Br": [
		1,
		1,
		0
	],
	"Se-N": [
		1,
		1,
		0
	],
	"Se-I": [
		1,
		1,
		0
	],
	"Se-H": [
		1,
		1,
		0
	],
	"Si-O": [
		1,
		1,
		0
	],
	"Si-S": [
		1,
		1,
		0
	],
	"Si-Se": [
		1,
		1,
		0
	],
	"Si-Te": [
		1,
		1,
		0
	],
	"Si-F": [
		1,
		1,
		0
	],
	"Si-Cl": [
		1,
		1,
		0
	],
	"Si-Br": [
		1,
		1,
		0
	],
	"Si-I": [
		1,
		1,
		0
	],
	"Si-C": [
		1,
		1,
		0
	],
	"Si-N": [
		1,
		1,
		0
	],
	"Si-P": [
		1,
		1,
		0
	],
	"Si-As": [
		1,
		1,
		0
	],
	"Si-H": [
		1,
		1,
		0
	],
	"Si-Si": [
		1,
		1,
		0
	],
	"Sm-O": [
		1,
		1,
		0
	],
	"Sm-N": [
		1,
		1,
		0
	],
	"Sm-S": [
		1,
		1,
		0
	],
	"Sm-Se": [
		1,
		1,
		0
	],
	"Sm-Te": [
		1,
		1,
		0
	],
	"Sm-F": [
		1,
		1,
		0
	],
	"Sm-Cl": [
		1,
		1,
		0
	],
	"Sm-Br": [
		1,
		1,
		0
	],
	"Sm-I": [
		1,
		1,
		0
	],
	"Sm-P": [
		1,
		1,
		0
	],
	"Sm-As": [
		1,
		1,
		0
	],
	"Sm-H": [
		1,
		1,
		0
	],
	"Sn-O": [
		1,
		1,
		0
	],
	"Sn-S": [
		1,
		1,
		0
	],
	"Sn-F": [
		1,
		1,
		0
	],
	"Sn-Cl": [
		1,
		1,
		0
	],
	"Sn-Br": [
		1,
		1,
		0
	],
	"Sn-I": [
		1,
		1,
		0
	],
	"Sn-N": [
		1,
		1,
		0
	],
	"Sn-Se": [
		1,
		1,
		0
	],
	"Sn-Te": [
		1,
		1,
		0
	],
	"Sn-P": [
		1,
		1,
		0
	],
	"Sn-As": [
		1,
		1,
		0
	],
	"Sn-H": [
		1,
		1,
		0
	],
	"Sr-O": [
		1,
		1,
		0
	],
	"Sr-S": [
		1,
		1,
		0
	],
	"Sr-Se": [
		1,
		1,
		0
	],
	"Sr-Te": [
		1,
		1,
		0
	],
	"Sr-F": [
		1,
		1,
		0
	],
	"Sr-Cl": [
		1,
		1,
		0
	],
	"Sr-Br": [
		1,
		1,
		0
	],
	"Sr-I": [
		1,
		1,
		0
	],
	"Sr-N": [
		1,
		1,
		0
	],
	"Sr-P": [
		1,
		1,
		0
	],
	"Sr-As": [
		1,
		1,
		0
	],
	"Sr-H": [
		1,
		1,
		0
	],
	"Ta-O": [
		1,
		1,
		0
	],
	"Ta-S": [
		1,
		1,
		0
	],
	"Ta-F": [
		1,
		1,
		0
	],
	"Ta-Cl": [
		1,
		1,
		0
	],
	"Ta-Br": [
		1,
		1,
		0
	],
	"Ta-I": [
		1,
		1,
		0
	],
	"Ta-Se": [
		1,
		1,
		0
	],
	"Ta-Te": [
		1,
		1,
		0
	],
	"Ta-N": [
		1,
		1,
		0
	],
	"Ta-P": [
		1,
		1,
		0
	],
	"Ta-As": [
		1,
		1,
		0
	],
	"Ta-H": [
		1,
		1,
		0
	],
	"Tb-O": [
		1,
		1,
		0
	],
	"Tb-S": [
		1,
		1,
		0
	],
	"Tb-Se": [
		1,
		1,
		0
	],
	"Tb-Te": [
		1,
		1,
		0
	],
	"Tb-F": [
		1,
		1,
		0
	],
	"Tb-Cl": [
		1,
		1,
		0
	],
	"Tb-Br": [
		1,
		1,
		0
	],
	"Tb-I": [
		1,
		1,
		0
	],
	"Tb-N": [
		1,
		1,
		0
	],
	"Tb-P": [
		1,
		1,
		0
	],
	"Tb-As": [
		1,
		1,
		0
	],
	"Tb-H": [
		1,
		1,
		0
	],
	"Tc-O": [
		1,
		1,
		0
	],
	"Tc-F": [
		1,
		1,
		0
	],
	"Tc-Cl": [
		1,
		1,
		0
	],
	"Te-O": [
		1,
		1,
		0
	],
	"Te-S": [
		1,
		1,
		0
	],
	"Te-F": [
		1,
		1,
		0
	],
	"Te-Cl": [
		1,
		1,
		0
	],
	"Te-Br": [
		1,
		1,
		0
	],
	"Te-I": [
		1,
		1,
		0
	],
	"Te-Se": [
		1,
		1,
		0
	],
	"Te-Te": [
		1,
		1,
		0
	],
	"Te-N": [
		1,
		1,
		0
	],
	"Te-P": [
		1,
		1,
		0
	],
	"Te-H": [
		1,
		1,
		0
	],
	"Th-O": [
		1,
		1,
		0
	],
	"Th-S": [
		1,
		1,
		0
	],
	"Th-Se": [
		1,
		1,
		0
	],
	"Th-Te": [
		1,
		1,
		0
	],
	"Th-F": [
		1,
		1,
		0
	],
	"Th-Cl": [
		1,
		1,
		0
	],
	"Th-Br": [
		1,
		1,
		0
	],
	"Th-I": [
		1,
		1,
		0
	],
	"Th-N": [
		1,
		1,
		0
	],
	"Th-P": [
		1,
		1,
		0
	],
	"Th-As": [
		1,
		1,
		0
	],
	"Th-H": [
		1,
		1,
		0
	],
	"Ti-F": [
		1,
		1,
		0
	],
	"Ti-Cl": [
		1,
		1,
		0
	],
	"Ti-Br": [
		1,
		1,
		0
	],
	"Ti-O": [
		1,
		1,
		0
	],
	"Ti-S": [
		1,
		1,
		0
	],
	"Ti-I": [
		1,
		1,
		0
	],
	"Ti-Se": [
		1,
		1,
		0
	],
	"Ti-Te": [
		1,
		1,
		0
	],
	"Ti-N": [
		1,
		1,
		0
	],
	"Ti-P": [
		1,
		1,
		0
	],
	"Ti-As": [
		1,
		1,
		0
	],
	"Ti-H": [
		1,
		1,
		0
	],
	"Tl-O": [
		1,
		1,
		0
	],
	"Tl-S": [
		1,
		1,
		0
	],
	"Tl-F": [
		1,
		1,
		0
	],
	"Tl-Cl": [
		1,
		1,
		0
	],
	"Tl-Br": [
		1,
		1,
		0
	],
	"Tl-I": [
		1,
		1,
		0
	],
	"Tl-Se": [
		1,
		1,
		0
	],
	"Tl-Te": [
		1,
		1,
		0
	],
	"Tl-N": [
		1,
		1,
		0
	],
	"Tl-P": [
		1,
		1,
		0
	],
	"Tl-As": [
		1,
		1,
		0
	],
	"Tl-H": [
		1,
		1,
		0
	],
	"Tm-O": [
		1,
		1,
		0
	],
	"Tm-S": [
		1,
		1,
		0
	],
	"Tm-Se": [
		1,
		1,
		0
	],
	"Tm-Te": [
		1,
		1,
		0
	],
	"Tm-F": [
		1,
		1,
		0
	],
	"Tm-Cl": [
		1,
		1,
		0
	],
	"Tm-Br": [
		1,
		1,
		0
	],
	"Tm-I": [
		1,
		1,
		0
	],
	"Tm-N": [
		1,
		1,
		0
	],
	"Tm-P": [
		1,
		1,
		0
	],
	"Tm-As": [
		1,
		1,
		0
	],
	"Tm-H": [
		1,
		1,
		0
	],
	"U-O": [
		1,
		1,
		0
	],
	"U-S": [
		1,
		1,
		0
	],
	"U-F": [
		1,
		1,
		0
	],
	"U-Cl": [
		1,
		1,
		0
	],
	"U-Br": [
		1,
		1,
		0
	],
	"U-I": [
		1,
		1,
		0
	],
	"U-N": [
		1,
		1,
		0
	],
	"U-Se": [
		1,
		1,
		0
	],
	"U-Te": [
		1,
		1,
		0
	],
	"U-P": [
		1,
		1,
		0
	],
	"U-As": [
		1,
		1,
		0
	],
	"U-H": [
		1,
		1,
		0
	],
	"V-O": [
		1,
		1,
		0
	],
	"V-Cl": [
		1,
		1,
		0
	],
	"V-S": [
		1,
		1,
		0
	],
	"V-F": [
		1,
		1,
		0
	],
	"V-Br": [
		1,
		1,
		0
	],
	"V-N": [
		1,
		1,
		0
	],
	"V-I": [
		1,
		1,
		0
	],
	"V-Se": [
		1,
		1,
		0
	],
	"V-Te": [
		1,
		1,
		0
	],
	"V-P": [
		1,
		1,
		0
	],
	"V-As": [
		1,
		1,
		0
	],
	"V-H": [
		1,
		1,
		0
	],
	"W-O": [
		1,
		1,
		0
	],
	"W-F": [
		1,
		1,
		0
	],
	"W-Cl": [
		1,
		1,
		0
	],
	"W-Br": [
		1,
		1,
		0
	],
	"W-I": [
		1,
		1,
		0
	],
	"W-S": [
		1,
		1,
		0
	],
	"W-Se": [
		1,
		1,
		0
	],
	"W-Te": [
		1,
		1,
		0
	],
	"W-N": [
		1,
		1,
		0
	],
	"W-P": [
		1,
		1,
		0
	],
	"W-As": [
		1,
		1,
		0
	],
	"W-H": [
		1,
		1,
		0
	],
	"Xe-O": [
		1,
		1,
		0
	],
	"Xe-F": [
		1,
		1,
		0
	],
	"Y-O": [
		1,
		1,
		0
	],
	"Y-S": [
		1,
		1,
		0
	],
	"Y-Se": [
		1,
		1,
		0
	],
	"Y-Te": [
		1,
		1,
		0
	],
	"Y-F": [
		1,
		1,
		0
	],
	"Y-Cl": [
		1,
		1,
		0
	],
	"Y-Br": [
		1,
		1,
		0
	],
	"Y-I": [
		1,
		1,
		0
	],
	"Y-N": [
		1,
		1,
		0
	],
	"Y-P": [
		1,
		1,
		0
	],
	"Y-As": [
		1,
		1,
		0
	],
	"Y-H": [
		1,
		1,
		0
	],
	"Yb-O": [
		1,
		1,
		0
	],
	"Yb-N": [
		1,
		1,
		0
	],
	"Yb-S": [
		1,
		1,
		0
	],
	"Yb-Se": [
		1,
		1,
		0
	],
	"Yb-Te": [
		1,
		1,
		0
	],
	"Yb-F": [
		1,
		1,
		0
	],
	"Yb-Cl": [
		1,
		1,
		0
	],
	"Yb-Br": [
		1,
		1,
		0
	],
	"Yb-I": [
		1,
		1,
		0
	],
	"Yb-P": [
		1,
		1,
		0
	],
	"Yb-As": [
		1,
		1,
		0
	],
	"Yb-H": [
		1,
		1,
		0
	],
	"Zn-O": [
		1,
		1,
		0
	],
	"Zn-S": [
		1,
		1,
		0
	],
	"Zn-Se": [
		1,
		1,
		0
	],
	"Zn-Te": [
		1,
		1,
		0
	],
	"Zn-F": [
		1,
		1,
		0
	],
	"Zn-Cl": [
		1,
		1,
		0
	],
	"Zn-Br": [
		1,
		1,
		0
	],
	"Zn-I": [
		1,
		1,
		0
	],
	"Zn-N": [
		1,
		1,
		0
	],
	"Zn-P": [
		1,
		1,
		0
	],
	"Zn-As": [
		1,
		1,
		0
	],
	"Zn-H": [
		1,
		1,
		0
	],
	"Zr-O": [
		1,
		1,
		0
	],
	"Zr-F": [
		1,
		1,
		0
	],
	"Zr-Cl": [
		1,
		1,
		0
	],
	"Zr-S": [
		1,
		1,
		0
	],
	"Zr-Se": [
		1,
		1,
		0
	],
	"Zr-Te": [
		1,
		1,
		0
	],
	"Zr-Br": [
		1,
		1,
		0
	],
	"Zr-I": [
		1,
		1,
		0
	],
	"Zr-N": [
		1,
		1,
		0
	],
	"Zr-P": [
		1,
		1,
		0
	],
	"Zr-As": [
		1,
		1,
		0
	],
	"Zr-H": [
		1,
		1,
		0
	]
}, POLYHEDRA_default = /* @__PURE__ */ "Ac.Zr.Pr.Mo.Li.Ba.Cd.Es.Al.Os.V.Sm.Dy.Ti.Pb.Ni.Sr.Na.Lu.Y.Tb.Au.Be.Sn.Xe.As.Cr.Ru.Re.Yb.I.Ag.Se.Th.In.Pu.Te.W.Ca.Co.Pd.Tl.B.Br.Rh.Pa.Tc.Zn.Eu.Ta.Cm.Nb.Hf.La.Ce.Cf.D.U.Mn.Si.Hg.Cu.Rb.K.Er.NH.Fe.Ge.Am.P.Tm.Gd.Ga.Pm.Bi.Mg.Sc.Kr.Sb.Ir.Po.Bk.F.Ho.Nd.Cs.Np.Pt".split("."), X = "#cc00cc", H$2 = "#ffcccc", D = "#ccccff", He$2 = "#fce9cf", Li$2 = "#86e074", Be$2 = "#5fd87b", B$2 = "#20a20f", C$2 = "#814929", N$2 = "#b0bae6", O$2 = "#ff0300", F$2 = "#b0bae6", Ne$2 = "#ff38b5", Na$2 = "#fadd3d", Mg$2 = "#fc7c16", Al$2 = "#81b3d6", Si$2 = "#1b3bfa", P$2 = "#c19cc3", S$2 = "#fffa00", Cl$2 = "#32fc03", Ar$2 = "#cffec5", K$2 = "#a122f7", Ca$2 = "#5b96be", Sc$2 = "#b663ac", Ti$2 = "#78caff", V$2 = "#e61a00", Cr$2 = "#00009e", Mn$2 = "#a9099e", Fe$2 = "#b57200", Co$2 = "#0000af", Ni$2 = "#b8bcbe", Cu$2 = "#2247dd", Zn$2 = "#8f9082", Ga$2 = "#9fe474", Ge$2 = "#7e6fa6", As$2 = "#75d057", Se$2 = "#9aef10", Br$2 = "#7f3103", Kr$2 = "#fac1f3", Rb$2 = "#ff0099", Sr$2 = "#00ff27", Y$2 = "#67988e", Zr$2 = "#00ff00", Nb$2 = "#4cb376", Mo$2 = "#b486b0", Tc$2 = "#cdafcb", Ru$2 = "#cfb8ae", Rh$2 = "#ced2ab", Pd$2 = "#c2c4b9", Ag$2 = "#b8bcbe", Cd$2 = "#f31fdc", In$2 = "#d781bb", Sn$2 = "#9b8fba", Sb$2 = "#d88350", Te$2 = "#ada252", I$2 = "#8f1f8b", Xe$2 = "#9ba1f8", Cs$2 = "#0fffb9", Ba$2 = "#1ef02d", La$2 = "#5ac449", Ce$2 = "#d1fd06", Pr$2 = "#fde206", Nd$2 = "#fc8e07", Pm$2 = "#0000f5", Sm$2 = "#fd067d", Eu$2 = "#fb08d5", Gd$2 = "#c004ff", Tb$2 = "#7104fe", Dy$2 = "#3106fd", Ho$2 = "#0742fb", Er$2 = "#49733b", Tm$2 = "#0000e0", Yb$2 = "#27fdf4", Lu$2 = "#26fdb5", Hf$2 = "#b4b459", Ta$2 = "#b79b56", W$2 = "#8e8a80", Re$2 = "#b3b18e", Os$2 = "#c9b179", Ir$2 = "#c9cf73", Pt$2 = "#ccc6bf", Au$2 = "#feb338", Hg$2 = "#d3b8cc", Tl$2 = "#96896d", Pb$2 = "#53535b", Bi$2 = "#d230f8", Po$2 = "#0000ff", At$2 = "#0000ff", Rn$2 = "#ffff00", Fr$2 = "#000000", Ra$2 = "#6eaa59", Ac$2 = "#649e73", Th$2 = "#26fe78", Pa$2 = "#29fb35", U$2 = "#7aa2aa", Np$2 = "#4d4d4d", Pu$2 = "#4d4d4d", Am$2 = "#4d4d4d", XX = "#4d4d4d", VESTA_default = {
	X,
	H: H$2,
	D,
	He: He$2,
	Li: Li$2,
	Be: Be$2,
	B: B$2,
	C: C$2,
	N: N$2,
	O: O$2,
	F: F$2,
	Ne: Ne$2,
	Na: Na$2,
	Mg: Mg$2,
	Al: Al$2,
	Si: Si$2,
	P: P$2,
	S: S$2,
	Cl: Cl$2,
	Ar: Ar$2,
	K: K$2,
	Ca: Ca$2,
	Sc: Sc$2,
	Ti: Ti$2,
	V: V$2,
	Cr: Cr$2,
	Mn: Mn$2,
	Fe: Fe$2,
	Co: Co$2,
	Ni: Ni$2,
	Cu: Cu$2,
	Zn: Zn$2,
	Ga: Ga$2,
	Ge: Ge$2,
	As: As$2,
	Se: Se$2,
	Br: Br$2,
	Kr: Kr$2,
	Rb: Rb$2,
	Sr: Sr$2,
	Y: Y$2,
	Zr: Zr$2,
	Nb: Nb$2,
	Mo: Mo$2,
	Tc: Tc$2,
	Ru: Ru$2,
	Rh: Rh$2,
	Pd: Pd$2,
	Ag: Ag$2,
	Cd: Cd$2,
	In: In$2,
	Sn: Sn$2,
	Sb: Sb$2,
	Te: Te$2,
	I: I$2,
	Xe: Xe$2,
	Cs: Cs$2,
	Ba: Ba$2,
	La: La$2,
	Ce: Ce$2,
	Pr: Pr$2,
	Nd: Nd$2,
	Pm: Pm$2,
	Sm: Sm$2,
	Eu: Eu$2,
	Gd: Gd$2,
	Tb: Tb$2,
	Dy: Dy$2,
	Ho: Ho$2,
	Er: Er$2,
	Tm: Tm$2,
	Yb: Yb$2,
	Lu: Lu$2,
	Hf: Hf$2,
	Ta: Ta$2,
	W: W$2,
	Re: Re$2,
	Os: Os$2,
	Ir: Ir$2,
	Pt: Pt$2,
	Au: Au$2,
	Hg: Hg$2,
	Tl: Tl$2,
	Pb: Pb$2,
	Bi: Bi$2,
	Po: Po$2,
	At: At$2,
	Rn: Rn$2,
	Fr: Fr$2,
	Ra: Ra$2,
	Ac: Ac$2,
	Th: Th$2,
	Pa: Pa$2,
	U: U$2,
	Np: Np$2,
	Pu: Pu$2,
	Am: Am$2,
	XX
}, H$1 = 16777215, He$1 = 14286847, Li$1 = 13402367, Be$1 = 12779264, B$1 = 16758197, C$1 = 13158600, N$1 = 255, O$1 = 16711680, F$1 = 16711935, Ne$1 = 11788530, Na$1 = 11230450, Mg$1 = 9109248, Al$1 = 12532282, Si$1 = 16761024, P$1 = 16744448, S$1 = 16777008, Cl$1 = 2096896, K$1 = 9388244, Ar$1 = 8442342, Ca$1 = 4062976, Sc$1 = 15132390, Ti$1 = 12567239, V$1 = 10921643, Cr$1 = 9083335, Mn$1 = 10255047, Fe$1 = 14706227, Ni$1 = 16765219, Co$1 = 16765219, Cu$1 = 13074483, Zn$1 = 8224944, Ga$1 = 12750735, Ge$1 = 6721423, As$1 = 12419299, Se$1 = 16752896, Br$1 = 10889513, Kr$1 = 6076625, Rb$1 = 7351984, Sr$1 = 65280, Y$1 = 9764863, Zr$1 = 9756896, Nb$1 = 7586505, Mo$1 = 5551541, Tc$1 = 3907230, Ru$1 = 2396047, Rh$1 = 687500, Pd$1 = 27013, Ag$1 = 12632256, Cd$1 = 16767375, In$1 = 10909043, Sn$1 = 6717568, Sb$1 = 10380213, Te$1 = 13924864, I$1 = 9699476, Xe$1 = 4366e3, Cs$1 = 5707663, Ba$1 = 51456, La$1 = 7394559, Ce$1 = 16777159, Pr$1 = 14286592, Nd$1 = 13106944, Pm$1 = 10747648, Sm$1 = 9240320, Eu$1 = 6422272, Gd$1 = 4587264, Tb$1 = 3211008, Dy$1 = 2093068, Ho$1 = 65290, Er$1 = 58997, Tm$1 = 54354, Yb$1 = 48952, Lu$1 = 43812, Hf$1 = 5096191, Ta$1 = 5089023, W$1 = 2200790, Re$1 = 2522539, Os$1 = 2516630, Ir$1 = 1528967, Pt$1 = 13684960, Au$1 = 16765219, Hg$1 = 12105936, Tl$1 = 10900557, Pb$1 = 5724513, Bi$1 = 10375093, Po$1 = 11230208, At$1 = 7688005, Rn$1 = 4358806, Fr$1 = 4325478, Ra$1 = 32e3, Ac$1 = 7384058, Th$1 = 41471, Pa$1 = 41471, U$1 = 36863, Np$1 = 33023, Pu$1 = 27647, Am$1 = 5528818, Cm$1 = 7888099, Bk$1 = 9064419, Cf$1 = 10565332, Es$1 = 11739092, Fm$1 = 11739066, Md$1 = 11739008, No$1 = 12386490, Lr$1 = 12452010, Rf$1 = 13697160, Db$1 = 14221422, Sg$1 = 14680143, Bh$1 = 15073336, Hs$1 = 15400998, Mt$1 = 15794194, Ds = 16711906, Rg = 16711804, Cn = 16711772, Nh = 16711749, Fl = 16711723, Mc = 16711709, Lv = 16711697, Ts = 16711685, Og = 16711680, CPK_default = {
	H: H$1,
	He: He$1,
	Li: Li$1,
	Be: Be$1,
	B: B$1,
	C: C$1,
	N: 255,
	O: O$1,
	F: F$1,
	Ne: Ne$1,
	Na: Na$1,
	Mg: Mg$1,
	Al: Al$1,
	Si: Si$1,
	P: P$1,
	S: S$1,
	Cl: Cl$1,
	K: K$1,
	Ar: Ar$1,
	Ca: Ca$1,
	Sc: Sc$1,
	Ti: Ti$1,
	V: V$1,
	Cr: Cr$1,
	Mn: Mn$1,
	Fe: Fe$1,
	Ni: Ni$1,
	Co: Co$1,
	Cu: Cu$1,
	Zn: Zn$1,
	Ga: Ga$1,
	Ge: Ge$1,
	As: As$1,
	Se: Se$1,
	Br: Br$1,
	Kr: Kr$1,
	Rb: Rb$1,
	Sr: Sr$1,
	Y: Y$1,
	Zr: Zr$1,
	Nb: Nb$1,
	Mo: Mo$1,
	Tc: Tc$1,
	Ru: Ru$1,
	Rh: Rh$1,
	Pd: Pd$1,
	Ag: Ag$1,
	Cd: Cd$1,
	In: In$1,
	Sn: Sn$1,
	Sb: Sb$1,
	Te: Te$1,
	I: I$1,
	Xe: Xe$1,
	Cs: Cs$1,
	Ba: Ba$1,
	La: La$1,
	Ce: Ce$1,
	Pr: Pr$1,
	Nd: Nd$1,
	Pm: Pm$1,
	Sm: Sm$1,
	Eu: Eu$1,
	Gd: Gd$1,
	Tb: Tb$1,
	Dy: Dy$1,
	Ho: Ho$1,
	Er: Er$1,
	Tm: Tm$1,
	Yb: Yb$1,
	Lu: Lu$1,
	Hf: Hf$1,
	Ta: Ta$1,
	W: W$1,
	Re: Re$1,
	Os: Os$1,
	Ir: Ir$1,
	Pt: Pt$1,
	Au: Au$1,
	Hg: Hg$1,
	Tl: Tl$1,
	Pb: Pb$1,
	Bi: Bi$1,
	Po: Po$1,
	At: At$1,
	Rn: Rn$1,
	Fr: Fr$1,
	Ra: Ra$1,
	Ac: Ac$1,
	Th: Th$1,
	Pa: Pa$1,
	U: U$1,
	Np: Np$1,
	Pu: Pu$1,
	Am: Am$1,
	Cm: Cm$1,
	Bk: Bk$1,
	Cf: Cf$1,
	Es: Es$1,
	Fm: Fm$1,
	Md: Md$1,
	No: No$1,
	Lr: Lr$1,
	Rf: Rf$1,
	Db: Db$1,
	Sg: Sg$1,
	Bh: Bh$1,
	Hs: Hs$1,
	Mt: Mt$1,
	Ds,
	Rg,
	Cn,
	Nh,
	Fl,
	Mc,
	Lv,
	Ts,
	Og
}, None = "#ff0000", H = "#ffffff", He = "#d9ffff", Li = "#cc80ff", Be = "#c2ff00", B = "#ffb5b5", C = "#909090", N = "#3050f8", O = "#ff0d0d", F = "#90e050", Ne = "#b3e3f5", Na = "#ab5cf2", Mg = "#8aff00", Al = "#bfa6a6", Si = "#f0c8a0", P = "#ff8000", S = "#ffff30", Cl = "#1ff01f", Ar = "#80d1e3", K = "#8f40d4", Ca = "#3dff00", Sc = "#e6e6e6", Ti = "#bfc2c7", V = "#a6a6ab", Cr = "#8a99c7", Mn = "#9c7ac7", Fe = "#e06633", Co = "#f090a0", Ni = "#50d050", Cu = "#c88033", Zn = "#7d80b0", Ga = "#c28f8f", Ge = "#668f8f", As = "#bd80e3", Se = "#ffa100", Br = "#a62929", Kr = "#5cb8d1", Rb = "#702eb0", Sr = "#00ff00", Y = "#94ffff", Zr = "#94e0e0", Nb = "#73c2c9", Mo = "#54b5b5", Tc = "#3b9e9e", Ru = "#248f8f", Rh = "#0a7d8c", Pd = "#006985", Ag = "#c0c0c0", Cd = "#ffd98f", In = "#a67573", Sn = "#668080", Sb = "#9e63b5", Te = "#d47a00", I = "#940094", Xe = "#429eb0", Cs = "#57178f", Ba = "#00c900", La = "#70d4ff", Ce = "#ffffc7", Pr = "#d9ffc7", Nd = "#c7ffc7", Pm = "#a3ffc7", Sm = "#8fffc7", Eu = "#61ffc7", Gd = "#45ffc7", Tb = "#30ffc7", Dy = "#1fffc7", Ho = "#00ff9c", Er = "#00e675", Tm = "#00d452", Yb = "#00bf38", Lu = "#00ab24", Hf = "#4dc2ff", Ta = "#4da6ff", W = "#2194d6", Re = "#267dab", Os = "#266696", Ir = "#175487", Pt = "#d0d0e0", Au = "#ffd123", Hg = "#b8b8d0", Tl = "#a6544d", Pb = "#575961", Bi = "#9e4fb5", Po = "#ab5c00", At = "#754f45", Rn = "#428296", Fr = "#420066", Ra = "#007d00", Ac = "#70abfa", Th = "#00baff", Pa = "#00a1ff", U = "#008fff", Np = "#0080ff", Pu = "#006bff", Am = "#545cf2", Cm = "#785ce3", Bk = "#8a4fe3", Cf = "#a136d4", Es = "#b31fd4", Fm = "#b31fba", Md = "#b30da6", No = "#bd0d87", Lr = "#c70066", Rf = "#cc0059", Db = "#d1004f", Sg = "#d90045", Bh = "#e00038", Hs = "#e6002e", Mt = "#eb0026", JMOL_default = {
	None,
	H,
	He,
	Li,
	Be,
	B,
	C,
	N,
	O,
	F,
	Ne,
	Na,
	Mg,
	Al,
	Si,
	P,
	S,
	Cl,
	Ar,
	K,
	Ca,
	Sc,
	Ti,
	V,
	Cr,
	Mn,
	Fe,
	Co,
	Ni,
	Cu,
	Zn,
	Ga,
	Ge,
	As,
	Se,
	Br,
	Kr,
	Rb,
	Sr,
	Y,
	Zr,
	Nb,
	Mo,
	Tc,
	Ru,
	Rh,
	Pd,
	Ag,
	Cd,
	In,
	Sn,
	Sb,
	Te,
	I,
	Xe,
	Cs,
	Ba,
	La,
	Ce,
	Pr,
	Nd,
	Pm,
	Sm,
	Eu,
	Gd,
	Tb,
	Dy,
	Ho,
	Er,
	Tm,
	Yb,
	Lu,
	Hf,
	Ta,
	W,
	Re,
	Os,
	Ir,
	Pt,
	Au,
	Hg,
	Tl,
	Pb,
	Bi,
	Po,
	At,
	Rn,
	Fr,
	Ra,
	Ac,
	Th,
	Pa,
	U,
	Np,
	Pu,
	Am,
	Cm,
	Bk,
	Cf,
	Es,
	Fm,
	Md,
	No,
	Lr,
	Rf,
	Db,
	Sg,
	Bh,
	Hs,
	Mt
}, elementAtomicNumbers = ATOMIC_NUMBERS_default, covalentRadii = COVALENT_RADII_default, vdwRadii = VDW_RADII_default, elementsWithPolyhedra = POLYHEDRA_default, default_bond_pairs = DEFAULT_BOND_PAIRS_default, cpkColors = CPK_default, vestaColors = VESTA_default, jmolColors = JMOL_default, elementColors = {
	CPK: cpkColors,
	VESTA: vestaColors,
	JMOL: jmolColors
}, radiiData = {
	Covalent: covalentRadii,
	VDW: vdwRadii
}, Specie = class {
	constructor(e) {
		if (!e) throw Error("Element is required for Specie.");
		this.element = e;
	}
	get element() {
		return this._element;
	}
	set element(e) {
		if (!elementAtomicNumbers[e]) throw Error(`Element '${e}' is invalid.`);
		this._element = e;
	}
	get number() {
		return elementAtomicNumbers[this.element];
	}
}, Atom = class {
	constructor(e, t) {
		this.symbol = e, this.position = [...t];
	}
}, Atoms = class e {
	constructor({ symbols: e = null, positions: t = null, cell: n = null, pbc: r = null, species: i = null, attributes: a = null } = {}) {
		if (this.uuid = null, this.symbols = e ? [...e] : [], this.positions = t ? [...t] : [], this.symbols.length !== this.positions.length) throw Error("The length of symbols should be the same as positions.");
		if (this.setCell({ cell: n || [
			[
				0,
				0,
				0
			],
			[
				0,
				0,
				0
			],
			[
				0,
				0,
				0
			]
		] }), this.setPBC({ pbc: r || [
			!1,
			!1,
			!1
		] }), this.isUndefinedCell() && this.pbc.some((e) => e)) throw Error("Periodic boundary conditions (pbc) cannot be true when the cell dimensions are all zero.");
		this.setSpecies({
			species: i || {},
			symbols: this.symbols
		}), this.setAttributes({ attributes: a || {
			atom: {},
			specie: {}
		} });
	}
	setSpecies(e, t = null) {
		let n = e;
		if (e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "species") && ({species: n, symbols: t = null} = e), this.species = {}, typeof n != "object") throw Error("Species should be a dictionary.");
		Object.entries(n).forEach(([e, t]) => {
			this.addSpecie({
				symbol: e,
				element: t
			});
		}), t && new Set(t).forEach((e) => {
			this.species[e] || this.addSpecie({ symbol: e });
		});
	}
	setAttributes(e) {
		let t = e;
		e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "attributes") && ({attributes: t} = e), t ||= {}, this.attributes = {
			atom: {},
			specie: {},
			"inter-specie": {}
		};
		for (let e in t) for (let n in t[e]) this.newAttribute({
			name: n,
			values: t[e][n],
			domain: e
		});
	}
	_ensureAtomGroups() {
		let e = this.attributes.atom, t = e.groups;
		if (Array.isArray(t) || (t = []), t.length !== this.positions.length) if (t.length < this.positions.length) for (; t.length < this.positions.length;) t.push([]);
		else t.length = this.positions.length;
		for (let e = 0; e < t.length; e++) Array.isArray(t[e]) || (t[e] = []);
		return e.groups = t, t;
	}
	listGroups() {
		let e = this.attributes.atom.groups;
		if (!Array.isArray(e)) return [];
		let t = /* @__PURE__ */ new Set();
		return e.forEach((e) => {
			Array.isArray(e) && e.forEach((e) => t.add(String(e)));
		}), Array.from(t).sort();
	}
	getGroupIndices(e) {
		let t = String(e), n = this.attributes.atom.groups;
		if (!Array.isArray(n)) return [];
		let r = [];
		for (let e = 0; e < n.length; e++) {
			let i = n[e];
			Array.isArray(i) && i.includes(t) && r.push(e);
		}
		return r;
	}
	addAtomsToGroup(e, t) {
		let n = e;
		e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "indices") && ({indices: n, group: t} = e), Array.isArray(n) || (n = [n]);
		let r = String(t), i = this._ensureAtomGroups();
		n.forEach((e) => {
			if (e < 0 || e >= i.length) throw Error("Index out of bounds.");
			i[e].includes(r) || i[e].push(r);
		});
	}
	removeAtomsFromGroup(e, t) {
		let n = e;
		e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "indices") && ({indices: n, group: t} = e), Array.isArray(n) || (n = [n]);
		let r = String(t), i = this._ensureAtomGroups();
		n.forEach((e) => {
			if (e < 0 || e >= i.length) throw Error("Index out of bounds.");
			i[e] = i[e].filter((e) => e !== r);
		});
	}
	clearGroup(e) {
		let t = String(e), n = this.attributes.atom.groups;
		if (!Array.isArray(n)) return 0;
		let r = 0;
		for (let e = 0; e < n.length; e++) {
			let i = n[e];
			if (!Array.isArray(i)) continue;
			let a = i.filter((e) => e !== t);
			r += i.length - a.length, n[e] = a;
		}
		return r;
	}
	newAttribute(e, t, n = "atom") {
		let r = e;
		if (e && typeof e == "object" && !Array.isArray(e) && ({name: r, values: t, domain: n = "atom"} = e), n === "atom") {
			if (t.length !== this.positions.length) throw Error("The number of values does not match the number of atoms.");
			this.attributes.atom[r] = JSON.parse(JSON.stringify(t));
		} else if (n === "specie") {
			for (let e of Object.keys(this.species)) if (!(e in t)) throw Error(`Value for specie '${e}' is missing.`);
			this.attributes.specie[r] = JSON.parse(JSON.stringify(t));
		} else if (n === "inter-specie") this.attributes["inter-specie"][r] = JSON.parse(JSON.stringify(t));
		else throw Error("Invalid domain. Must be either \"atom\", \"specie\", or \"inter-specie\".");
	}
	getAttribute(e, t = "atom") {
		let n = e;
		if (e && typeof e == "object" && !Array.isArray(e) && ({name: n, domain: t = "atom"} = e), t === "atom") {
			if (n === "positions") return this.positions;
			if (n === "symbols") return this.symbols;
			if (n === "index") return Array.from({ length: this.positions.length }, (e, t) => t);
			if (!this.attributes.atom[n]) throw Error(`Attribute '${n}' is not defined. The available attributes are: ${Object.keys(this.attributes.atom)}`);
			return this.attributes.atom[n];
		} else if (t === "specie") {
			if (!this.attributes.specie[n]) throw Error(`Attribute '${n}' is not defined. The available attributes are: ${Object.keys(this.attributes.specie)}`);
			return this.attributes.specie[n];
		} else if (t === "inter-specie") {
			if (!this.attributes[t][n]) throw Error(`Attribute '${n}' is not defined in inter-specie domain. The available attributes are: ${Object.keys(this.attributes[t])}`);
			return this.attributes[t][n];
		} else throw Error("Invalid domain. Must be either \"atom\", \"specie\", or \"inter-specie\".");
	}
	setCell(e) {
		let t = e;
		if (e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "cell") && ({cell: t} = e), t.length === 9) this.cell = [
			[
				t[0],
				t[1],
				t[2]
			],
			[
				t[3],
				t[4],
				t[5]
			],
			[
				t[6],
				t[7],
				t[8]
			]
		];
		else if (t.length === 6) this.cell = convertToMatrixFromABCAlphaBetaGamma(t);
		else if (t.length === 3) if (t[0].length === 3) this.cell = t;
		else {
			let [e, n, r] = t;
			this.cell = convertToMatrixFromABCAlphaBetaGamma([
				e,
				n,
				r,
				90,
				90,
				90
			]);
		}
		else throw Error("Invalid cell dimensions provided. Expected 3x3 matrix, 1x6, or 1x3 array.");
	}
	isUndefinedCell() {
		return this.cell.some((e) => e.every((e) => e === 0));
	}
	getCellLengthsAndAngles() {
		let [e, t, n] = this.cell.map((e) => Math.sqrt(e[0] ** 2 + e[1] ** 2 + e[2] ** 2));
		return [
			e,
			t,
			n,
			Math.acos((this.cell[1][0] * this.cell[2][0] + this.cell[1][1] * this.cell[2][1] + this.cell[1][2] * this.cell[2][2]) / (t * n)) * 180 / Math.PI,
			Math.acos((this.cell[0][0] * this.cell[2][0] + this.cell[0][1] * this.cell[2][1] + this.cell[0][2] * this.cell[2][2]) / (e * n)) * 180 / Math.PI,
			Math.acos((this.cell[0][0] * this.cell[1][0] + this.cell[0][1] * this.cell[1][1] + this.cell[0][2] * this.cell[1][2]) / (e * t)) * 180 / Math.PI
		];
	}
	setPBC(e) {
		let t = e;
		e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "pbc") && ({pbc: t} = e), typeof t == "boolean" && (t = [
			t,
			t,
			t
		]), this.pbc = t;
	}
	addSpecie(e, t = null) {
		let n = e;
		if (e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "symbol") && ({symbol: n, element: t = null} = e), this.species[n]) throw Error(`Specie '${n}' is already defined.`);
		t ||= n, t instanceof Specie ? this.species[n] = t : this.species[n] = new Specie(t);
	}
	getSymbols() {
		return this.symbols;
	}
	getElements() {
		return this.symbols.map((e) => this.species[e].element);
	}
	addAtom(e) {
		let t = e;
		if (e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "atom") && ({atom: t} = e), !this.species[t.symbol]) throw Error(`Specie '${t.symbol}' is not defined.`);
		this.positions.push(t.position), this.symbols.push(t.symbol), this.attributes.atom.groups && this._ensureAtomGroups();
	}
	removeAtom(e) {
		let t = e;
		e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "index") && ({index: t} = e), this.positions.splice(t, 1), this.symbols.splice(t, 1);
		for (let e in this.attributes.atom) this.attributes.atom[e].splice(t, 1);
	}
	getSpeciesCount() {
		return Object.keys(this.species).length;
	}
	getAtomsCount() {
		return this.positions.length;
	}
	add(e) {
		let t = e;
		e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "otherAtoms") && ({otherAtoms: t} = e);
		for (let e in t.species) if (this.species[e] && this.species[e].element !== t.species[e].element) throw Error(`Specie '${e}' is defined in both Atoms objects with different elements.`);
		(this.attributes.atom.groups || t.attributes && t.attributes.atom && t.attributes.atom.groups) && (this.attributes.atom.groups || (this.attributes.atom.groups = Array.from({ length: this.positions.length }, () => [])), typeof t._ensureAtomGroups == "function" && t._ensureAtomGroups()), this.species = {
			...this.species,
			...t.species
		}, this.positions = [...this.positions, ...t.positions], this.symbols = [...this.symbols, ...t.symbols];
		for (let e in this.attributes.atom) this.attributes.atom[e] = [...this.attributes.atom[e], ...t.attributes.atom[e]];
		for (let e in this.attributes.specie) this.attributes.specie[e] = {
			...t.attributes.specie[e],
			...this.attributes.specie[e]
		};
	}
	multiply(t, n, r) {
		let i = t;
		if (t && typeof t == "object" && Object.prototype.hasOwnProperty.call(t, "mx") && ({mx: i, my: n, mz: r} = t), this.isUndefinedCell()) throw Error("Cell matrix is not defined.");
		let a = new e();
		a.species = { ...this.species };
		let [[o, s, c], [l, u, d], [f, p, m]] = this.cell;
		a.setCell({ cell: [
			[
				o * i,
				s * i,
				c * i
			],
			[
				l * n,
				u * n,
				d * n
			],
			[
				f * r,
				p * r,
				m * r
			]
		] });
		for (let e = 0; e < i; e++) for (let t = 0; t < n; t++) for (let n = 0; n < r; n++) for (let r = 0; r < this.positions.length; r++) {
			let [i, o, s] = this.positions[r], c = i + e * this.cell[0][0] + t * this.cell[1][0] + n * this.cell[2][0], l = o + e * this.cell[0][1] + t * this.cell[1][1] + n * this.cell[2][1], u = s + e * this.cell[0][2] + t * this.cell[1][2] + n * this.cell[2][2];
			a.symbols.push(this.symbols[r]), a.positions.push([
				c,
				l,
				u
			]);
		}
		for (let e in this.attributes.atom) {
			let t = this.attributes.atom[e], o = [];
			for (let e = 0; e < i; e++) for (let e = 0; e < n; e++) for (let e = 0; e < r; e++) for (let e = 0; e < t.length; e++) o.push(t[e]);
			a.newAttribute({
				name: e,
				values: o,
				domain: "atom"
			});
		}
		for (let e in this.attributes.specie) a.newAttribute({
			name: e,
			values: JSON.parse(JSON.stringify(this.attributes.specie[e])),
			domain: "specie"
		});
		return a;
	}
	translate(e) {
		let t = e;
		e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "vector") && ({vector: t} = e), this.positions = this.positions.map(([e, n, r]) => [
			e + t[0],
			n + t[1],
			r + t[2]
		]);
	}
	rotate(e, t, n = !1) {
		let r = e;
		e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "axis") && ({axis: r, angle: t, rotate_cell: n = !1} = e);
		let i = t * Math.PI / 180, a = Math.sqrt(r[0] ** 2 + r[1] ** 2 + r[2] ** 2), [o, s, c] = [
			r[0] / a,
			r[1] / a,
			r[2] / a
		], l = Math.cos(i), u = Math.sin(i), d = [
			l + o * o * (1 - l),
			o * s * (1 - l) - c * u,
			o * c * (1 - l) + s * u,
			s * o * (1 - l) + c * u,
			l + s * s * (1 - l),
			s * c * (1 - l) - o * u,
			c * o * (1 - l) - s * u,
			c * s * (1 - l) + o * u,
			l + c * c * (1 - l)
		];
		for (let e = 0; e < this.positions.length; e++) {
			let [t, n, r] = this.positions[e];
			this.positions[e][0] = d[0] * t + d[1] * n + d[2] * r, this.positions[e][1] = d[3] * t + d[4] * n + d[5] * r, this.positions[e][2] = d[6] * t + d[7] * n + d[8] * r;
		}
		if (n && this.cell) {
			let e = [
				,
				,
				,
			].fill(0).map(() => [
				,
				,
				,
			].fill(0));
			for (let t = 0; t < 3; t++) for (let n = 0; n < 3; n++) e[t][n] = d[0 + n] * this.cell[t][0] + d[3 + n] * this.cell[t][1] + d[6 + n] * this.cell[t][2];
			this.cell = e;
		}
	}
	center(e = 0, t = [
		0,
		1,
		2
	], n = null) {
		let r = e;
		if (e && typeof e == "object" && (Object.prototype.hasOwnProperty.call(e, "vacuum") || Object.prototype.hasOwnProperty.call(e, "axis") || Object.prototype.hasOwnProperty.call(e, "center")) && ({vacuum: r = 0, axis: t = [
			0,
			1,
			2
		], center: n = null} = e), !this.cell) throw Error("Cell is not defined.");
		let i = [
			0,
			0,
			0
		];
		for (let e = 0; e < this.positions.length; e++) i[0] += this.positions[e][0], i[1] += this.positions[e][1], i[2] += this.positions[e][2];
		i = i.map((e) => e / this.positions.length);
		let a = [
			0,
			0,
			0
		];
		if (n) a = n;
		else for (let e = 0; e < 3; e++) t.includes(e) && (a[e] = (this.cell[0][e] + this.cell[1][e] + this.cell[2][e]) / 2);
		let o = a.map((e, t) => e - i[t]);
		if (this.translate({ vector: o }), r !== null) for (let e = 0; e < 3; e++) t.includes(e) && (this.cell[e][e] += 2 * r);
	}
	deleteAtoms(e) {
		let t = e;
		e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "indices") && ({indices: t} = e), Array.isArray(t) || (t = [t]);
		let n = new Set(t);
		this.positions = this.positions.filter((e, t) => !n.has(t)), this.symbols = this.symbols.filter((e, t) => !n.has(t));
		for (let e in this.attributes.atom) this.attributes.atom[e] = this.attributes.atom[e].filter((e, t) => !n.has(t));
		let r = new Set(this.symbols);
		for (let e in this.species) if (!r.has(e)) {
			delete this.species[e];
			for (let t in this.attributes.specie) delete this.attributes.specie[t][e];
		}
	}
	replaceAtoms(e, t, n = null) {
		let r = e;
		e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "indices") && ({indices: r, newSpecieSymbol: t, newSpecieElement: n = null} = e), this.species[t] || this.addSpecie({
			symbol: t,
			element: n
		});
		for (let e of r) if (e >= 0 && e < this.symbols.length) this.symbols[e] = t;
		else throw Error("Index out of bounds.");
	}
	toDict() {
		let e = {
			uuid: this.uuid,
			species: {},
			positions: [],
			cell: Array.from(this.cell || []),
			pbc: Array.from(this.pbc),
			symbols: [],
			attributes: JSON.parse(JSON.stringify(this.attributes))
		};
		for (let [t, n] of Object.entries(this.species)) e.species[t] = n.element;
		return e.positions = this.positions.map((e) => [...e]), e.symbols = [...this.symbols], e;
	}
	calculateFractionalCoordinates() {
		if (this.isUndefinedCell()) throw Error("Cell matrix is not defined.");
		let e = this.cell;
		e = e[0].map((t, n) => e.map((e) => e[n]));
		let t = inv(e);
		return this.positions.map((e) => [
			t[0][0] * e[0] + t[0][1] * e[1] + t[0][2] * e[2],
			t[1][0] * e[0] + t[1][1] * e[1] + t[1][2] * e[2],
			t[2][0] * e[0] + t[2][1] * e[1] + t[2][2] * e[2]
		]);
	}
	getAtomsByIndices(t) {
		let n = t;
		t && typeof t == "object" && Object.prototype.hasOwnProperty.call(t, "indices") && ({indices: n} = t);
		let r = {
			cell: JSON.parse(JSON.stringify(this.cell)),
			pbc: JSON.parse(JSON.stringify(this.pbc)),
			species: {},
			symbols: [],
			positions: []
		}, i = {
			atom: {},
			specie: {}
		};
		for (let e in this.attributes) for (let t in this.attributes[e]) i[e][t] = e === "atom" ? [] : this.attributes[e][t];
		n.forEach((e) => {
			if (e < 0 || e >= this.positions.length) throw Error("Index out of bounds.");
			r.symbols.push(this.symbols[e]), r.positions.push(this.positions[e]);
			for (let t in this.attributes.atom) i.atom[t].push(this.attributes.atom[t][e]);
		}), new Set(r.symbols).forEach((e) => {
			r.species[e] = this.species[e].element;
		});
		let a = new e(r);
		return a.attributes = i, a;
	}
	getCenterOfGeometry() {
		let e = [
			0,
			0,
			0
		];
		for (let t = 0; t < this.positions.length; t++) e[0] += this.positions[t][0], e[1] += this.positions[t][1], e[2] += this.positions[t][2];
		return e[0] /= this.positions.length, e[1] /= this.positions.length, e[2] /= this.positions.length, e;
	}
	copy() {
		let t = new e(this.toDict()), n = {
			atom: {},
			specie: {},
			"inter-specie": {}
		};
		for (let e in this.attributes) for (let t in this.attributes[e]) n[e][t] = JSON.parse(JSON.stringify(this.attributes[e][t]));
		return t.attributes = n, t;
	}
}, KV_PAIR = /([A-Za-z_][A-Za-z0-9_-]*)\s*=\s*("[^"]*"|'[^']*'|\{[^}]*\}|\S+)/g;
function unquote(e) {
	return e.startsWith("\"") && e.endsWith("\"") || e.startsWith("'") && e.endsWith("'") || e.startsWith("{") && e.endsWith("}") ? e.slice(1, -1) : e;
}
function parseExtHeader(e) {
	let t = {}, n;
	for (; (n = KV_PAIR.exec(e)) !== null;) {
		let e = n[1], r = unquote(n[2]);
		if (/^[\d.+\-eE,\s]+$/.test(r)) {
			let e = r.split(/[ ,]+/).map(Number);
			r = e.length > 1 ? e : e[0];
		}
		t[e] = r;
	}
	return t;
}
function parseXYZ(e) {
	let t = e.trim().split("\n"), n = 0, r = [];
	for (; n < t.length;) {
		let e = t[n].trim();
		if (!e) {
			n++;
			continue;
		}
		let i = parseInt(e);
		if (n++, isNaN(i) || n + i > t.length) throw Error("Invalid XYZ file format");
		let a = t[n++].trim(), o = a.includes("=") ? parseExtHeader(a) : {}, s = {
			symbols: [],
			positions: [],
			attributes: { atom: {} }
		}, c = null;
		if (o.Lattice) {
			let e = Array.isArray(o.Lattice) ? o.Lattice : o.Lattice.split(/[ ,]+/).map(Number);
			c = [
				[
					e[0],
					e[1],
					e[2]
				],
				[
					e[3],
					e[4],
					e[5]
				],
				[
					e[6],
					e[7],
					e[8]
				]
			];
		}
		c && (s.cell = c), o.pbc && (s.pbc = Array.isArray(o.pbc) ? o.pbc : typeof o.pbc == "string" ? o.pbc.split(/[ ,]+/).map((e) => e === "T" || e === "true") : [!!o.pbc]);
		let l = ["species", "pos"];
		if (o.Properties) {
			let e = o.Properties.split(":");
			l = [];
			for (let t = 0; t < e.length; t += 3) {
				let n = e[t], r = parseInt(e[t + 2], 10);
				l.push({
					name: n,
					ncol: r
				});
			}
		} else l = [{
			name: "species",
			ncol: 1
		}, {
			name: "pos",
			ncol: 3
		}];
		l.forEach((e) => {
			["species", "pos"].includes(e.name) || (s.attributes.atom[e.name] = Array(i).fill(null).map(() => []));
		});
		for (let e = 0; e < i; e++, n++) {
			let r = t[n].trim().split(/\s+/), i = 0, a, o, c, u;
			l.forEach((t) => {
				let n = r.slice(i, i + t.ncol);
				if (i += t.ncol, t.name === "species") a = n[0];
				else if (t.name === "pos") [o, c, u] = n.map(parseFloat);
				else {
					let r = n.map((e) => isNaN(e) ? e : +e);
					s.attributes.atom[t.name][e] = t.ncol === 1 ? r[0] : r;
				}
			}), s.symbols.push(a), s.positions.push([
				o,
				c,
				u
			]);
		}
		let u = new Atoms(s);
		r.push(u);
	}
	return r;
}
//#endregion
//#region src/io/parserCif.js
function parseCIF(e) {
	let t = {
		cell: [],
		pbc: [
			!0,
			!0,
			!0
		],
		species: {},
		positions: [],
		symbols: []
	}, n = CIFData.parseCIFBlock(e);
	return n.applySymmetryOperations(), t.cell = convertToMatrixFromABCAlphaBetaGamma([...n.unitCell.lengths, ...n.unitCell.angles]), t.symbols = n.atoms.map((e) => {
		let t = e.type_symbol.match(/[A-Z][a-z]?/);
		return t ? t[0] : null;
	}), t.positions = n.atoms.map((e) => {
		let n = [
			e.fract_x,
			e.fract_y,
			e.fract_z
		];
		return calculateCartesianCoordinates(t.cell, n);
	}), new Atoms(t);
}
var CIFData = class CIFData {
	constructor() {
		this.tags = {}, this.loops = [], this.unitCell = null, this.atoms = [];
	}
	static parseCIFBlock(e) {
		let t = new CIFData(), n = e.split("\n").map((e) => e.trim()), r = null;
		for (let e = 0; e < n.length; e++) {
			let i = n[e];
			if (!(i === "" || i.startsWith("#"))) {
				if (i.startsWith("_")) {
					r &&= (t.loops.push(r), null);
					let [a, o] = CIFData.parseTag(i, n, e);
					t.tags[a.toLowerCase()] = CIFData.convertValue(o);
				} else if (i.toLowerCase() === "loop_") {
					for (r && t.loops.push(r), r = {
						headers: [],
						rows: []
					}, e++; n[e] && n[e].startsWith("_");) r.headers.push(n[e].split(" ")[0].toLowerCase()), e++;
					e--;
				} else if (r && !i.startsWith("#")) {
					let e = CIFData.parseLoopRow(i);
					e.length > 0 && r.rows.push(e);
				}
			}
		}
		return r && t.loops.push(r), t.parseUnitCell(), t.parseAtoms(), t;
	}
	static parseTag(e, t, n) {
		let [r, ...i] = e.split(" "), a = i.join(" ");
		if (a.startsWith(";")) for (a = a.substring(1).trim(), n++; n < t.length && !t[n].startsWith(";");) a += "\n" + t[n], n++;
		return [r, a];
	}
	getTagValue(e) {
		return this.tags[e] || null;
	}
	getAnyTagValue(e) {
		for (let t of e) {
			let e = this.getTagValue(t);
			if (e !== null) return e;
		}
		return null;
	}
	getSpaceGroupNumber() {
		return this.getAnyTagValue([
			"_space_group.it_number",
			"_space_group_it_number",
			"_symmetry_int_tables_number"
		]);
	}
	getSpaceGroupName() {
		let e = this.getAnyTagValue([
			"_space_group_name_h-m_alt",
			"_symmetry_space_group_name_h-m",
			"_space_group.Patterson_name_h-m",
			"_space_group.patterson_name_h-m"
		]);
		return {
			Abm2: "Aem2",
			Aba2: "Aea2",
			Cmca: "Cmce",
			Cmma: "Cmme",
			Ccca: "Ccc1"
		}[e] || e;
	}
	static parseLoopRow(e) {
		let t = [], n = /'([^']*)'|"([^"]*)"|(\S+)/g, r;
		for (; (r = n.exec(e)) !== null;) t.push(r[1] || r[2] || r[3]);
		return t.map((e) => CIFData.convertValue(e));
	}
	static convertValue(e) {
		let t = Number(e);
		return isNaN(t) ? e : t;
	}
	parseUnitCell() {
		let e = [
			"_cell_length_a",
			"_cell_length_b",
			"_cell_length_c"
		], t = [
			"_cell_angle_alpha",
			"_cell_angle_beta",
			"_cell_angle_gamma"
		];
		e.every((e) => e in this.tags) && t.every((e) => e in this.tags) && (this.unitCell = {
			lengths: e.map((e) => parseFloat(this.tags[e])),
			angles: t.map((e) => parseFloat(this.tags[e]))
		});
	}
	parseAtoms() {
		let e = this.loops.find((e) => e.headers.includes("_atom_site_fract_x") || e.headers.includes("_atom_site_cartn_x"));
		e && e.rows.forEach((t) => {
			let n = {};
			e.headers.forEach((e, r) => {
				let i = e.replace("_atom_site_", "");
				n[i] = CIFData.convertValue(t[r]);
			}), this.atoms.push(n);
		});
	}
	parseSymmetryOperations() {
		let e = this.loops.find((e) => e.headers.includes("_symmetry_equiv_pos_as_xyz") || e.headers.includes("_space_group_symop_operation_xyz"));
		if (!e) return [];
		let t = e.headers.includes("_symmetry_equiv_pos_as_xyz") ? "_symmetry_equiv_pos_as_xyz" : "_space_group_symop_operation_xyz";
		return e.rows.map((n) => {
			let r = n[e.headers.indexOf(t)];
			return this.parseSymmetryOperation(r);
		});
	}
	parseSymmetryOperation(opString) {
		let matrix = [
			[
				0,
				0,
				0
			],
			[
				0,
				0,
				0
			],
			[
				0,
				0,
				0
			]
		], vector = [
			0,
			0,
			0
		];
		const components = opString.split(",").map((e) => e.trim());
		return components.forEach((component, index) => {
			const translationMatch = component.match(/[+-]\s*(\d+\/\d+|\d*\.\d+|\d+)$/);
			if (translationMatch) {
				const translationValue = eval(translationMatch[1]);
				vector[index] = translationValue;
			}
			component.includes("x") && (matrix[index][0] = component.startsWith("-") ? -1 : 1), component.includes("y") && (matrix[index][1] = component.startsWith("-") ? -1 : 1), component.includes("z") && (matrix[index][2] = component.startsWith("-") ? -1 : 1);
		}), {
			matrix,
			vector
		};
	}
	applySymmetryOperations(e = .001, t = !0) {
		if (this.symmetryOps = this.parseSymmetryOperations(), this.getSpaceGroupName && this.symmetryOps.length === 0) throw Error("The space group is defined, but no symmetry operations are found. We cannot handle this case yet.");
		this.symmetryOps.length === 0 && this.symmetryOps.push({
			matrix: [
				[
					1,
					0,
					0
				],
				[
					0,
					1,
					0
				],
				[
					0,
					0,
					1
				]
			],
			vector: [
				0,
				0,
				0
			]
		});
		let n = [];
		this.atoms.forEach((r) => {
			this.symmetryOps.forEach(({ matrix: i, vector: a }) => {
				let o = this.applySymmetryOperation(r, i, a);
				this.isUniqueSite(o, n, e) && (t && (o.fract_x = (o.fract_x + 1) % 1, o.fract_y = (o.fract_y + 1) % 1, o.fract_z = (o.fract_z + 1) % 1), n.push(o));
			});
		}), this.atoms = n;
	}
	applySymmetryOperation(e, t, n) {
		let r = [
			e.fract_x,
			e.fract_y,
			e.fract_z
		], i = [
			0,
			0,
			0
		];
		for (let e = 0; e < 3; e++) i[e] = r.reduce((n, r, i) => n + t[e][i] * r, 0);
		let a = i.map((e, t) => e + n[t]);
		return {
			...e,
			fract_x: a[0],
			fract_y: a[1],
			fract_z: a[2]
		};
	}
	isUniqueSite(e, t, n) {
		for (let r of t) if (this.calculateDistance(e, r) < n) return !1;
		return !0;
	}
	calculateDistance(e, t) {
		let n = [
			0,
			1,
			2
		].map((n) => e[`fract_${"xyz"[n]}`] - t[`fract_${"xyz"[n]}`]).map((e) => e - Math.round(e));
		return Math.sqrt(n.reduce((e, t) => e + t * t, 0));
	}
};
//#endregion
//#region src/io/structure.js
function formatNumber(e) {
	return typeof e != "number" || Number.isNaN(e) ? "0" : e.toFixed(6);
}
function atomsToXYZ(e) {
	let t = Array.isArray(e) ? e : [e], n = [];
	return t.forEach((e) => {
		let t = e.positions.length;
		n.push(String(t));
		let r = [];
		if (!e.isUndefinedCell()) {
			let t = e.cell.flat().map((e) => formatNumber(e)).join(" ");
			r.push(`Lattice="${t}"`);
		}
		if (Array.isArray(e.pbc)) {
			let t = e.pbc.map((e) => e ? "T" : "F").join(" ");
			r.push(`pbc="${t}"`);
		}
		r.push("Properties=species:S:1:pos:R:3"), n.push(r.join(" "));
		for (let r = 0; r < t; r += 1) {
			let t = e.symbols[r], [i, a, o] = e.positions[r];
			n.push(`${t} ${formatNumber(i)} ${formatNumber(a)} ${formatNumber(o)}`);
		}
	}), n.join("\n");
}
function atomsToCIF(e) {
	let t = !e.isUndefinedCell(), [n, r, i, a, o, s] = t ? e.getCellLengthsAndAngles() : [
		1,
		1,
		1,
		90,
		90,
		90
	], c = t ? e.calculateFractionalCoordinates() : e.positions, l = [
		"data_weas",
		"_symmetry_space_group_name_H-M 'P 1'",
		"_symmetry_Int_Tables_number 1",
		`_cell_length_a ${formatNumber(n)}`,
		`_cell_length_b ${formatNumber(r)}`,
		`_cell_length_c ${formatNumber(i)}`,
		`_cell_angle_alpha ${formatNumber(a)}`,
		`_cell_angle_beta ${formatNumber(o)}`,
		`_cell_angle_gamma ${formatNumber(s)}`,
		"loop_",
		"_atom_site_label",
		"_atom_site_type_symbol"
	];
	t ? l.push("_atom_site_fract_x", "_atom_site_fract_y", "_atom_site_fract_z") : l.push("_atom_site_Cartn_x", "_atom_site_Cartn_y", "_atom_site_Cartn_z");
	for (let t = 0; t < e.symbols.length; t += 1) {
		let n = e.symbols[t], [r, i, a] = c[t], o = `${n}${t + 1}`;
		l.push(`${o} ${n} ${formatNumber(r)} ${formatNumber(i)} ${formatNumber(a)}`);
	}
	return l.join("\n");
}
function downloadText(e, t, n = "text/plain") {
	let r = new Blob([e], { type: n }), i = URL.createObjectURL(r), a = document.createElement("a");
	a.href = i, a.download = t, document.body.appendChild(a), a.click(), document.body.removeChild(a), URL.revokeObjectURL(i);
}
function parseStructureText(e, t) {
	let n = t.toLowerCase();
	if (n === ".xyz") return {
		kind: "atoms",
		data: parseXYZ(e)
	};
	if (n === ".cif") return {
		kind: "atoms",
		data: parseCIF(e)
	};
	if (n === "on") return {
		kind: "json",
		data: JSON.parse(e)
	};
	throw Error(`Unsupported file extension: ${t}`);
}
function applyStructurePayload(e, t) {
	if (!t || typeof t != "object") throw Error("Invalid structure payload.");
	if (t.version || t.atoms) {
		e.importState(t);
		return;
	}
	if (Array.isArray(t)) {
		let n = t.map((e) => e instanceof Atoms ? e : new Atoms(e));
		e.avr.atoms = n;
		return;
	}
	if (t instanceof Atoms) {
		e.avr.atoms = t;
		return;
	}
	if (t.symbols && t.positions) {
		e.avr.atoms = new Atoms(t);
		return;
	}
	throw Error("Unrecognized structure payload.");
}
function buildExportPayload(e, t) {
	let n = String(t || "").toLowerCase();
	if (n === "html") {
		let t = e.exportState();
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
      const snapshot = ${JSON.stringify(t, null, 2).replace(/<\/(script)/gi, "<\\/$1")};
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
	if (n === "json") return {
		text: JSON.stringify(e.exportState(), null, 2),
		filename: "weas-stateon",
		mimeType: "application/json"
	};
	if (n === "xyz") return {
		text: atomsToXYZ(Array.isArray(e.avr.trajectory) && e.avr.trajectory.length > 1 ? e.avr.trajectory : e.avr.atoms),
		filename: "structure.xyz",
		mimeType: "chemical/x-xyz"
	};
	if (n === "cif") return {
		text: atomsToCIF(e.avr.atoms),
		filename: "structure.cif",
		mimeType: "chemical/x-cif"
	};
	throw Error(`Unsupported export format: ${t}`);
}
//#endregion
//#region src/operation/atoms.js
var atoms_exports = /* @__PURE__ */ __exportAll({
	AddAtomOperation: () => AddAtomOperation,
	AddAtomsToGroupOperation: () => AddAtomsToGroupOperation,
	ClearGroupOperation: () => ClearGroupOperation,
	ColorByAttribute: () => ColorByAttribute,
	ExportStructureOperation: () => ExportStructureOperation,
	ImportStructureOperation: () => ImportStructureOperation,
	RemoveAtomsFromGroupOperation: () => RemoveAtomsFromGroupOperation,
	ReplaceOperation: () => ReplaceOperation
}), ReplaceOperation = class extends BaseOperation {
	static description = "Replace atoms";
	static category = "Edit";
	static ui = {
		title: "Replace",
		fields: { symbol: {
			type: "select",
			options: (e) => e.symbolOptions
		} }
	};
	constructor({ weas: e, symbol: t = "C", indices: n = null }) {
		super(e);
		let r = this.stateGet("viewer.selectedAtomsIndices", []) || [];
		this.indices = n || Array.from(r), this.symbol = t, this.symbolOptions = Object.keys(elementAtomicNumbers).concat(Object.keys(this.weas.avr.atoms.species || {})), this.initialAtoms = e.avr.atoms.copy();
	}
	execute() {
		this.weas.avr.replaceSelectedAtoms({
			element: this.symbol,
			indices: this.indices
		});
	}
	undo() {
		this.weas.avr.atoms = this.initialAtoms.copy();
	}
	validateParams(e) {
		return e.symbol in elementAtomicNumbers || e.symbol in this.weas.avr.atoms.species;
	}
}, AddAtomOperation = class extends BaseOperation {
	static description = "Add atom";
	static category = "Edit";
	static ui = {
		title: "Add",
		fields: {
			symbol: {
				type: "select",
				options: (e) => e.symbolOptions
			},
			x: {
				type: "number",
				min: -10,
				max: 10,
				step: .1
			},
			y: {
				type: "number",
				min: -10,
				max: 10,
				step: .1
			},
			z: {
				type: "number",
				min: -10,
				max: 10,
				step: .1
			}
		}
	};
	constructor({ weas: e, symbol: t = "C", position: n = {
		x: 0,
		y: 0,
		z: 0
	} }) {
		super(e), this.position = n, this.symbol = t, this.x = n.x, this.y = n.y, this.z = n.z, this.symbolOptions = Object.keys(elementAtomicNumbers).concat(Object.keys(this.weas.avr.atoms.species || {})), this.initialAtoms = e.avr.atoms.copy();
	}
	execute() {
		this.position = {
			x: this.x,
			y: this.y,
			z: this.z
		}, this.weas.avr.addAtom({
			element: this.symbol,
			position: this.position
		});
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
		"symbol" in e && (this.symbol = e.symbol), ("x" in e || "y" in e || "z" in e) && (this.x = e.x ?? this.x, this.y = e.y ?? this.y, this.z = e.z ?? this.z, this.position = {
			x: this.x,
			y: this.y,
			z: this.z
		});
	}
	validateParams(e) {
		return e.symbol in elementAtomicNumbers || e.symbol in this.weas.avr.atoms.species;
	}
}, ColorByAttribute = class extends BaseOperation {
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
	constructor({ weas: e, attribute: t = "Element", color1: n = "#ff0000", color2: r = "#0000ff" }) {
		super(e), this.affectsAtoms = !1, this.attribute = t, this.color1 = n, this.color2 = r, this.attributeKeys = Object.keys(this.weas.avr.atoms.attributes.atom).concat(Object.keys(colorBys));
	}
	execute() {
		this.ensureStateStore();
		let e = {
			colorRamp: [this.color1, this.color2],
			colorBy: this.attribute
		};
		this.applyStatePatchWithHistory("viewer", e, (e) => this.weas.avr[e]);
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
}, AddAtomsToGroupOperation = class extends BaseOperation {
	static description = "Add atoms to group";
	static category = "Group";
	static ui = {
		title: "Add to group",
		fields: { group: { type: "text" } }
	};
	constructor({ weas: e, group: t = "group", indices: n = null }) {
		super(e);
		let r = this.stateGet("viewer.selectedAtomsIndices", []) || [];
		this.indices = n || Array.from(r), this.group = t, this.initialAtoms = e.avr.atoms.copy();
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
}, RemoveAtomsFromGroupOperation = class extends BaseOperation {
	static description = "Remove atoms from group";
	static category = "Group";
	static ui = {
		title: "Remove from group",
		fields: { group: {
			type: "select",
			options: (e) => e.groupOptions
		} }
	};
	constructor({ weas: e, group: t = "group", indices: n = null }) {
		super(e);
		let r = this.stateGet("viewer.selectedAtomsIndices", []) || [];
		this.indices = n || Array.from(r);
		let i = /* @__PURE__ */ new Set(), a = this.weas.avr.atoms.attributes?.atom?.groups;
		Array.isArray(a) && this.indices.forEach((e) => {
			let t = a[e];
			Array.isArray(t) && t.forEach((e) => i.add(String(e)));
		}), this.groupOptions = Array.from(i).sort(), this.groupOptions.length === 0 && (this.groupOptions = [t]), this.group = t === "group" && this.groupOptions.length > 0 ? this.groupOptions[0] : t, this.initialAtoms = e.avr.atoms.copy();
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
}, ClearGroupOperation = class extends BaseOperation {
	static description = "Clear group";
	static category = "Group";
	static ui = {
		title: "Clear group",
		fields: { group: { type: "text" } }
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
}, ImportStructureOperation = class extends BaseOperation {
	static description = "Import structure file";
	static category = "IO";
	constructor({ weas: e }) {
		super(e), this.previousState = e.exportState(), this.nextState = null, this.affectsAtoms = !0;
	}
	execute() {
		let e = document.createElement("input");
		e.type = "file", e.accept = "on,.xyz,.cif", e.style.display = "none", document.body.appendChild(e), e.addEventListener("change", async () => {
			let t = e.files && e.files[0];
			if (document.body.removeChild(e), t) try {
				let e = parseStructureText(await t.text(), t.name.slice(t.name.lastIndexOf(".")));
				applyStructurePayload(this.weas, e.data), this.nextState = this.weas.exportState();
			} catch (e) {
				console.error("Failed to import structure:", e), alert(`Import failed: ${e.message || e}`);
			}
		}, { once: !0 }), e.click();
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
}, ExportStructureOperation = class extends BaseOperation {
	static description = "Export structure file";
	static category = "IO";
	static ui = {
		title: "Export",
		fields: {
			format: {
				type: "select",
				options: [
					"json",
					"html",
					"xyz",
					"cif"
				]
			},
			filename: { type: "text" }
		}
	};
	constructor({ weas: e, format: t = "json", filename: n = "" }) {
		super(e), this.affectsAtoms = !1, this.format = t, this.filename = n;
	}
	execute() {
		let e = buildExportPayload(this.weas, this.format), t = this.filename && this.filename.trim().length > 0 ? this.filename.trim() : e.filename;
		downloadText(e.text, t, e.mimeType);
	}
	undo() {}
}, _rayDirections = [
	new THREE$1.Vector3(.23184, .413, .879),
	new THREE$1.Vector3(-.754, .285, -.592),
	new THREE$1.Vector3(.124, -.812, .57)
];
function pointsInsideMesh(e, t) {
	let n = new THREE$1.Raycaster(), r = [];
	for (let i = 0; i < e.length; i++) {
		let a = new THREE$1.Vector3(...e[i]), o = 0;
		for (let e of _rayDirections) n.set(a, e), n.intersectObject(t).length % 2 == 1 && o++;
		o >= 2 && r.push(i);
	}
	return r;
}
//#endregion
//#region src/operation/selection.js
var selection_exports = /* @__PURE__ */ __exportAll({
	InsideSelection: () => InsideSelection,
	InvertSelection: () => InvertSelection,
	SelectAll: () => SelectAll,
	SelectByGroup: () => SelectByGroup
}), SelectAll = class extends BaseOperation {
	static description = "Select all";
	static category = "Select";
	constructor({ weas: e }) {
		super(e);
	}
	execute() {
		let e = [...Array(this.weas.avr.atoms.getAtomsCount()).keys()];
		this.ensureStateStore(), this.applyStatePatchWithHistory("viewer", { selectedAtomsIndices: e }, (e) => this.weas.avr[e]);
	}
	undo() {
		this.ensureStateStore(), this.undoStatePatch();
	}
}, InvertSelection = class extends BaseOperation {
	static description = "Invert selection";
	static category = "Select";
	constructor({ weas: e }) {
		super(e);
	}
	execute() {
		this.ensureStateStore();
		let e = this.stateGet("viewer.selectedAtomsIndices", []) || [], t = [...Array(this.weas.avr.atoms.getAtomsCount()).keys()].filter((t) => !e.includes(t));
		this.applyStatePatchWithHistory("viewer", { selectedAtomsIndices: t }, (e) => this.weas.avr[e]);
	}
	undo() {
		this.ensureStateStore(), this.undoStatePatch();
	}
}, InsideSelection = class extends BaseOperation {
	static description = "Select inside";
	static category = "Select";
	constructor({ weas: e }) {
		super(e);
	}
	execute() {
		let e = [];
		for (let t = 0; t < this.weas.selectionManager.selectedObjects.length; t++) {
			let n = this.weas.selectionManager.selectedObjects[t], r = pointsInsideMesh(this.weas.avr.atoms.positions, n);
			e.push(...r);
		}
		this.ensureStateStore(), this.applyStatePatchWithHistory("viewer", { selectedAtomsIndices: e }, (e) => this.weas.avr[e]);
	}
	undo() {
		this.ensureStateStore(), this.undoStatePatch();
	}
}, SelectByGroup = class extends BaseOperation {
	static description = "Select by group";
	static category = "Select";
	static ui = {
		title: "Select by group",
		fields: { group: {
			type: "select",
			options: (e) => e.groupOptions
		} }
	};
	constructor({ weas: e, group: t = "group" }) {
		super(e);
		let n = this.weas.avr.atoms.listGroups();
		this.groupOptions = n.length > 0 ? n : [t], this.group = t === "group" && this.groupOptions.length > 0 ? this.groupOptions[0] : t;
	}
	execute() {
		let e = this.weas.avr.atoms.getGroupIndices(this.group);
		this.ensureStateStore(), this.applyStatePatchWithHistory("viewer", { selectedAtomsIndices: e }, (e) => this.weas.avr[e]);
	}
	undo() {
		this.ensureStateStore(), this.undoStatePatch();
	}
	validateParams(e) {
		return !!(e.group && String(e.group).trim());
	}
}, viewer_exports = /* @__PURE__ */ __exportAll({ SetViewerState: () => SetViewerState });
function cloneValue$1(e) {
	return e === void 0 ? e : JSON.parse(JSON.stringify(e));
}
var SetViewerState = class extends BaseOperation {
	static description = "Set viewer state";
	static category = "Viewer";
	constructor({ weas: e, patch: t = {}, redraw: n = "auto" }) {
		super(e), this.affectsAtoms = !1, this.weas = e, this.patch = cloneValue$1(t), this.redraw = n, this.colorByOptions = Object.keys(this.weas.avr.atoms.attributes.atom || {}).concat([
			"Element",
			"Index",
			"Random",
			"Uniform"
		]), this.colorTypeOptions = [
			"CPK",
			"VESTA",
			"JMOL"
		], this.radiusTypeOptions = ["Covalent", "VDW"], Object.keys(this.patch).length === 0 && (this.patch = this.buildDefaultPatch()), this.uiFields = {
			title: "Viewer state",
			fields: this.buildFieldsFromPatch(this.patch)
		}, Object.keys(this.uiFields.fields).forEach((e) => {
			this[e] = cloneValue$1(this.patch[e]);
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
		Object.entries(e).forEach(([e, t]) => {
			e in this && (this[e] = t);
		}), this.patch = { ...this.patch }, Object.keys(this.uiFields.fields).forEach((e) => {
			this.patch[e] = cloneValue$1(this[e]);
		});
	}
	buildFieldsFromPatch(e) {
		let t = {
			modelStyle: {
				type: "select",
				options: MODEL_STYLE_MAP
			},
			colorBy: {
				type: "select",
				options: (e) => e.colorByOptions
			},
			colorType: {
				type: "select",
				options: (e) => e.colorTypeOptions
			},
			radiusType: {
				type: "select",
				options: (e) => e.radiusTypeOptions
			},
			materialType: {
				type: "select",
				options: [
					"Standard",
					"Phong",
					"Basic"
				]
			},
			atomLabelType: {
				type: "select",
				options: [
					"None",
					"Symbol",
					"Index"
				]
			},
			showBondedAtoms: { type: "boolean" },
			atomScale: {
				type: "number",
				min: .1,
				max: 2,
				step: .01
			},
			backgroundColor: { type: "color" }
		}, n = {};
		return Object.entries(e).forEach(([e, r]) => {
			if (t[e]) {
				n[e] = t[e];
				return;
			}
			typeof r == "boolean" ? n[e] = { type: "boolean" } : typeof r == "number" ? n[e] = { type: "number" } : typeof r == "string" && (n[e] = { type: "text" });
		}), n;
	}
	buildDefaultPatch() {
		let e = [
			"modelStyle",
			"colorBy",
			"colorType",
			"radiusType",
			"materialType",
			"atomLabelType",
			"showBondedAtoms",
			"atomScale",
			"backgroundColor"
		], t = {}, n = this.stateGet("viewer", {});
		return e.forEach((e) => {
			e in n ? t[e] = cloneValue$1(n[e]) : t[e] = cloneValue$1(this.weas.avr[e]);
		}), t;
	}
}, settings_exports = /* @__PURE__ */ __exportAll({
	SetBondSettings: () => SetBondSettings,
	SetCellSettings: () => SetCellSettings,
	SetHighlightSettings: () => SetHighlightSettings,
	SetIsosurfaceSettings: () => SetIsosurfaceSettings,
	SetVectorFieldSettings: () => SetVectorFieldSettings,
	SetVolumeSliceSettings: () => SetVolumeSliceSettings
});
function normalizeValue(e) {
	if (e && typeof e.getHexString == "function") return `#${e.getHexString()}`;
	if (Array.isArray(e)) return e.map((e) => normalizeValue(e));
	if (e && typeof e == "object") {
		let t = {};
		return Object.entries(e).forEach(([e, n]) => {
			t[e] = normalizeValue(n);
		}), t;
	}
	return e;
}
function cloneSettings(e) {
	return normalizeValue(e);
}
function addDefined(e, t, n) {
	n !== void 0 && (e[t] = n);
}
function addSettings(e, t, n) {
	n != null && (e[t] = n);
}
var SetCellSettings = class extends BaseOperation {
	static description = "Cell settings";
	static category = "Viewer";
	static ui = {
		title: "Cell",
		fields: {
			showCell: { type: "boolean" },
			showAxes: { type: "boolean" }
		}
	};
	constructor({ weas: e, settings: t = {}, showCell: n = void 0, showAxes: r = void 0 }) {
		super(e), this.affectsAtoms = !1, this.settings = cloneSettings(t);
		let i = this.stateGet("cell", {});
		this.showCell = n === void 0 ? i.showCell ?? this.weas.avr.cellManager.showCell : n, this.showAxes = r === void 0 ? i.showAxes ?? this.weas.avr.cellManager.showAxes : r;
	}
	execute() {
		this.ensureStateStore();
		let e = { ...this.settings };
		addDefined(e, "showCell", this.showCell), addDefined(e, "showAxes", this.showAxes), this.applyStatePatchWithHistory("cell", e, (e) => this.weas.avr.cellManager[e]);
	}
	undo() {
		this.ensureStateStore(), this.undoStatePatch();
	}
	redo() {
		this.ensureStateStore(), this.redoStatePatch();
	}
}, SetBondSettings = class extends BaseOperation {
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
	constructor({ weas: e, settings: t = null, hideLongBonds: n = void 0, showHydrogenBonds: r = void 0, showOutBoundaryBonds: i = void 0 }) {
		super(e), this.affectsAtoms = !1, this.settings = t ? cloneSettings(t) : null, this.hideLongBonds = n, this.showHydrogenBonds = r, this.showOutBoundaryBonds = i;
	}
	execute() {
		this.ensureStateStore();
		let e = {};
		addSettings(e, "settings", this.settings), addDefined(e, "hideLongBonds", this.hideLongBonds), addDefined(e, "showHydrogenBonds", this.showHydrogenBonds), addDefined(e, "showOutBoundaryBonds", this.showOutBoundaryBonds), this.applyStatePatchWithHistory("bond", e, (e) => this.weas.avr.bondManager[e]);
	}
	undo() {
		this.ensureStateStore(), this.undoStatePatch();
	}
	redo() {
		this.ensureStateStore(), this.redoStatePatch();
	}
}, SetIsosurfaceSettings = class extends BaseOperation {
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
}, SetVolumeSliceSettings = class extends BaseOperation {
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
}, SetVectorFieldSettings = class extends BaseOperation {
	static description = "Vector field settings";
	static category = "Viewer";
	static ui = {
		title: "Vector field",
		fields: { show: { type: "boolean" } }
	};
	constructor({ weas: e, settings: t = {}, show: n = void 0 }) {
		super(e), this.affectsAtoms = !1, this.settings = cloneSettings(t), this.show = n;
	}
	execute() {
		this.ensureStateStore();
		let e = {};
		addSettings(e, "settings", this.settings), addDefined(e, "show", this.show), this.applyStatePatchWithHistory("plugins.vectorField", e, (e) => e === "settings" ? this.weas.avr.VFManager.settings : this.weas.avr.VFManager.show);
	}
	undo() {
		this.ensureStateStore(), this.undoStatePatch();
	}
	redo() {
		this.ensureStateStore(), this.redoStatePatch();
	}
}, SetHighlightSettings = class extends BaseOperation {
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
}, ops = {
	object: object_exports,
	transform: transform_exports,
	atoms: atoms_exports,
	selection: selection_exports,
	viewer: viewer_exports,
	settings: settings_exports,
	Shapes: { ShapeOperation }
}, OperationManager = class {
	constructor(e) {
		this.weas = e, this.operationSearchManager = new OperationSearchManager(e, ops, e.tjs.hud), this.undoStack = [], this.redoStack = [], this.isRestoring = !1, this.gui = new GUI(), this.gui.closed = !1, this.createGUIContainer(), this.generateOperator();
	}
	generateOperator() {
		for (let e in ops) {
			this[e] = {};
			for (let t in ops[e]) this[e][t] = (n = {}) => {
				if (e === "Shapes") {
					let { shapeName: r, options: i } = n, a = new ops[e][t](this.weas, r, i);
					this.execute(a);
				} else {
					n.weas = this.weas;
					let r = new ops[e][t](n);
					this.execute(r);
				}
			};
		}
	}
	execute(e, t = !0) {
		this.isRestoring || (t && e.execute(), this.undoStack.push(e), this.redoStack = [], this.updateAdjustLastOperationGUI(), e.affectsAtoms !== !1 && this.weas.eventHandlers.dispatchAtomsUpdated());
	}
	undo() {
		if (this.undoStack.length > 0) {
			let e = this.undoStack.pop();
			this.isRestoring = !0, e.undo(), this.endRestoreSoon(), this.redoStack.push(e), e.affectsAtoms !== !1 && this.weas.eventHandlers.dispatchAtomsUpdated();
		}
	}
	redo() {
		if (this.redoStack.length > 0) {
			let e = this.redoStack.pop();
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
		let e = document.createElement("div");
		Object.assign(e.style, {
			position: "absolute",
			bottom: "30px",
			right: "10px",
			display: "none"
		}), this.weas.tjs.containerElement.appendChild(e), e.appendChild(this.gui.domElement), this.preventEventPropagation(e), this.guiContainer = e, this.adjustLastOpFolder = this.gui.addFolder("Adjust Last Operation"), this.adjustLastOpFolder.open();
	}
	preventEventPropagation(e) {
		let t = (e) => e.stopPropagation();
		[
			"click",
			"keydown",
			"keyup",
			"keypress"
		].forEach((n) => {
			e.addEventListener(n, t, !1);
		});
	}
	onOperationAdjusted(e) {
		this.undoStack[this.undoStack.length - 1] === e && (this.redoStack = [], this.updateAdjustLastOperationGUI());
	}
	hideGUI() {
		this.guiContainer.style.display = "none";
	}
	updateAdjustLastOperationGUI() {
		let e = this.undoStack[this.undoStack.length - 1];
		if (!e || !e.supportsAdjustGUI?.()) {
			this.guiContainer.style.display = "none";
			return;
		}
		this.guiContainer.style.display = "block", this.lastAdjustedOperation !== e && (this.lastAdjustedOperation = e, Object.values(this.adjustLastOpFolder.__controllers).forEach((e) => this.adjustLastOpFolder.remove(e)), Object.values(this.adjustLastOpFolder.__folders).forEach((e) => this.adjustLastOpFolder.removeFolder(e)), e.setupGUI(this.adjustLastOpFolder)), typeof e.refreshGUIValues == "function" && e.refreshGUIValues();
	}
};
//#endregion
//#region src/state/store.js
function cloneValue(e) {
	let t = JSON.stringify(e);
	if (t !== void 0) return JSON.parse(t);
}
function getByPath(e, t) {
	if (!t) return e;
	let n = t.split("."), r = e;
	for (let e of n) {
		if (!r) return;
		r = r[e];
	}
	return r;
}
function mergeDeep(e, t) {
	return Object.entries(t || {}).forEach(([t, n]) => {
		n && typeof n == "object" && !Array.isArray(n) ? ((!e[t] || typeof e[t] != "object") && (e[t] = {}), mergeDeep(e[t], n)) : e[t] = n;
	}), e;
}
var StateStore = class {
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
			--this.depth, this.depth === 0 && this.pending && (this.pending = !1, this.emit());
		}
	}
	subscribe(e, t) {
		let n = {
			path: e,
			callback: t,
			last: cloneValue(getByPath(this.state, e))
		};
		return this.subscribers.add(n), () => {
			this.subscribers.delete(n);
		};
	}
	emit() {
		this.subscribers.forEach((e) => {
			let t = cloneValue(getByPath(this.state, e.path)), n = e.last;
			JSON.stringify(n) !== JSON.stringify(t) && (e.last = t, e.callback(t, n));
		});
	}
}, Setting$8 = class {
	constructor({ type: e, shape: t, instances: n, materialType: r = "Standard", opacity: i = 1 }) {
		this.type = e, this.shape = t, this.instances = n, this.materialType = r, this.opacity = i;
	}
}, InstancedMeshPrimitive = class {
	constructor(e) {
		this.viewer = e, this.scene = this.viewer.tjs.scene, this.materialsRegistry = this.viewer.materialsRegistry, this.settings = [], this.meshes = [];
		let t = this.viewer.state.get("plugins.instancedMeshPrimitive");
		t && Array.isArray(t.settings) && (this.applySettings(t.settings), this.drawMesh()), this.viewer.state.subscribe("plugins.instancedMeshPrimitive", (e) => {
			!e || !Array.isArray(e.settings) || (this.applySettings(e.settings), this.drawMesh());
		});
	}
	setSettings(e) {
		this.viewer.state.set({ plugins: { instancedMeshPrimitive: { settings: cloneValue(e) } } });
	}
	applySettings(e) {
		this.settings = [], this.clearMeshes(), e.forEach((e) => {
			this.addSetting(e);
		});
	}
	addSetting({ type: e, shape: t, instances: n, materialType: r = "Standard", opacity: i = 1 }) {
		let a = new Setting$8({
			type: e,
			shape: t,
			instances: n,
			materialType: r,
			opacity: i
		});
		this.settings.push(a);
	}
	clearMeshes() {
		this.meshes.forEach((e) => {
			clearObject(this.scene, e);
		}), this.meshes = [];
	}
	drawMesh() {
		this.clearMeshes(), this.settings.forEach((e) => {
			let t = this.getGeometry(e), n = e.materialType || "Standard", r = this.materialsRegistry.getMaterial(n, !0);
			r.transparent = !0, r.opacity = e.opacity || 1;
			let i = new THREE$1.InstancedMesh(t, r, e.instances.length);
			r.opacity < 1 && (i.renderOrder = 2), e.instances.forEach((e, t) => {
				let n = new THREE$1.Object3D(), r = new THREE$1.Vector3(...e.position);
				n.position.copy(r);
				let a = e.scale || [
					1,
					1,
					1
				];
				n.scale.set(...a);
				let o = e.rotation || [
					0,
					0,
					0
				];
				n.rotation.set(...o), n.updateMatrix(), i.setMatrixAt(t, n.matrix);
				let s = e.color || "#bd0d87";
				i.setColorAt(t, new THREE$1.Color(s));
			}), i.instanceMatrix.needsUpdate = !0, i.instanceColor.needsUpdate = !0, this.meshes.push(i), this.scene.add(i);
		}), this.viewer.requestRedraw?.("render");
	}
	getGeometry(e) {
		let t, n, r;
		switch (e.type) {
			case "cube":
				n = {
					width: 1,
					height: 1,
					depth: 1
				}, r = {
					...n,
					...e.shape
				}, t = new THREE$1.BoxGeometry(r.width, r.height, r.depth);
				break;
			case "cylinder":
				n = {
					radiusTop: 1,
					radiusBottom: 1,
					height: 1,
					radialSegments: 8,
					heightSegments: 1,
					openEnded: !1
				}, r = {
					...n,
					...e.shape
				}, t = new THREE$1.CylinderGeometry(r.radiusTop, r.radiusBottom, r.height, r.radialSegments, r.heightSegments, r.openEnded);
				break;
			case "icosahedron":
				n = {
					radius: 1,
					detail: 0
				}, r = {
					...n,
					...e.shape
				}, t = new THREE$1.IcosahedronGeometry(r.radius, r.detail);
				break;
			case "cone":
				n = {
					radius: 1,
					height: 1,
					radialSegments: 8,
					heightSegments: 1,
					openEnded: !1
				}, r = {
					...n,
					...e.shape
				}, t = new THREE$1.ConeGeometry(r.radius, r.height, r.radialSegments, r.heightSegments, r.openEnded);
				break;
			case "plane":
				n = {
					width: 1,
					height: 1
				}, r = {
					...n,
					...e.shape
				}, t = new THREE$1.PlaneGeometry(r.width, r.height);
				break;
			case "sphere":
				n = {
					radius: 1,
					widthSegments: 8,
					heightSegments: 6,
					phiStart: 0,
					phiLength: Math.PI * 2,
					thetaStart: 0,
					thetaLength: Math.PI
				}, r = {
					...n,
					...e.shape
				}, t = new THREE$1.SphereGeometry(r.radius, r.widthSegments, r.heightSegments, r.phiStart, r.phiLength, r.thetaStart, r.thetaLength);
				break;
			case "torus":
				n = {
					radius: 1,
					tube: .4,
					radialSegments: 8,
					tubularSegments: 6,
					arc: Math.PI * 2
				}, r = {
					...n,
					...e.shape
				}, t = new THREE$1.TorusGeometry(r.radius, r.tube, r.radialSegments, r.tubularSegments, r.arc);
				break;
			default: console.error("Unknown setting type: ", type);
		}
		return t;
	}
};
//#endregion
//#region node_modules/three/examples/jsm/utils/BufferGeometryUtils.js
function mergeGeometries(e, t = !1) {
	let n = e[0].index !== null, r = new Set(Object.keys(e[0].attributes)), i = new Set(Object.keys(e[0].morphAttributes)), a = {}, o = {}, s = e[0].morphTargetsRelative, c = new BufferGeometry(), l = 0;
	for (let u = 0; u < e.length; ++u) {
		let d = e[u], f = 0;
		if (n !== (d.index !== null)) return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + u + ". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."), null;
		for (let e in d.attributes) {
			if (!r.has(e)) return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + u + ". All geometries must have compatible attributes; make sure \"" + e + "\" attribute exists among all geometries, or in none of them."), null;
			a[e] === void 0 && (a[e] = []), a[e].push(d.attributes[e]), f++;
		}
		if (f !== r.size) return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + u + ". Make sure all geometries have the same number of attributes."), null;
		if (s !== d.morphTargetsRelative) return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + u + ". .morphTargetsRelative must be consistent throughout all geometries."), null;
		for (let e in d.morphAttributes) {
			if (!i.has(e)) return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + u + ".  .morphAttributes must be consistent throughout all geometries."), null;
			o[e] === void 0 && (o[e] = []), o[e].push(d.morphAttributes[e]);
		}
		if (t) {
			let e;
			if (n) e = d.index.count;
			else if (d.attributes.position !== void 0) e = d.attributes.position.count;
			else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + u + ". The geometry must have either an index or a position attribute"), null;
			c.addGroup(l, e, u), l += e;
		}
	}
	if (n) {
		let t = 0, n = [];
		for (let r = 0; r < e.length; ++r) {
			let i = e[r].index;
			for (let e = 0; e < i.count; ++e) n.push(i.getX(e) + t);
			t += e[r].attributes.position.count;
		}
		c.setIndex(n);
	}
	for (let e in a) {
		let t = mergeAttributes(a[e]);
		if (!t) return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the " + e + " attribute."), null;
		c.setAttribute(e, t);
	}
	for (let e in o) {
		let t = o[e][0].length;
		if (t === 0) break;
		c.morphAttributes = c.morphAttributes || {}, c.morphAttributes[e] = [];
		for (let n = 0; n < t; ++n) {
			let t = [];
			for (let r = 0; r < o[e].length; ++r) t.push(o[e][r][n]);
			let r = mergeAttributes(t);
			if (!r) return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the " + e + " morphAttribute."), null;
			c.morphAttributes[e].push(r);
		}
	}
	return c;
}
function mergeAttributes(e) {
	let t, n, r, i = -1, a = 0;
	for (let o = 0; o < e.length; ++o) {
		let s = e[o];
		if (t === void 0 && (t = s.array.constructor), t !== s.array.constructor) return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."), null;
		if (n === void 0 && (n = s.itemSize), n !== s.itemSize) return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."), null;
		if (r === void 0 && (r = s.normalized), r !== s.normalized) return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."), null;
		if (i === -1 && (i = s.gpuType), i !== s.gpuType) return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."), null;
		a += s.count * n;
	}
	let o = new t(a), s = new BufferAttribute(o, n, r), c = 0;
	for (let t = 0; t < e.length; ++t) {
		let r = e[t];
		if (r.isInterleavedBufferAttribute) {
			let e = c / n;
			for (let t = 0, i = r.count; t < i; t++) for (let i = 0; i < n; i++) {
				let n = r.getComponent(t, i);
				s.setComponent(t + e, i, n);
			}
		} else o.set(r.array, c);
		c += r.count * n;
	}
	return i !== void 0 && (s.gpuType = i), s;
}
function mergeVertices(e, t = 1e-4) {
	t = Math.max(t, 2 ** -52);
	let n = {}, r = e.getIndex(), i = e.getAttribute("position"), a = r ? r.count : i.count, o = 0, s = Object.keys(e.attributes), c = {}, l = {}, u = [], d = [
		"getX",
		"getY",
		"getZ",
		"getW"
	], f = [
		"setX",
		"setY",
		"setZ",
		"setW"
	];
	for (let t = 0, n = s.length; t < n; t++) {
		let n = s[t], r = e.attributes[n];
		c[n] = new r.constructor(new r.array.constructor(r.count * r.itemSize), r.itemSize, r.normalized);
		let i = e.morphAttributes[n];
		i && (l[n] || (l[n] = []), i.forEach((e, t) => {
			let r = new e.array.constructor(e.count * e.itemSize);
			l[n][t] = new e.constructor(r, e.itemSize, e.normalized);
		}));
	}
	let p = t * .5, m = 10 ** Math.log10(1 / t), h = p * m;
	for (let t = 0; t < a; t++) {
		let i = r ? r.getX(t) : t, a = "";
		for (let t = 0, n = s.length; t < n; t++) {
			let n = s[t], r = e.getAttribute(n), o = r.itemSize;
			for (let e = 0; e < o; e++) a += `${~~(r[d[e]](i) * m + h)},`;
		}
		if (a in n) u.push(n[a]);
		else {
			for (let t = 0, n = s.length; t < n; t++) {
				let n = s[t], r = e.getAttribute(n), a = e.morphAttributes[n], u = r.itemSize, p = c[n], m = l[n];
				for (let e = 0; e < u; e++) {
					let t = d[e], n = f[e];
					if (p[n](o, r[t](i)), a) for (let e = 0, r = a.length; e < r; e++) m[e][n](o, a[e][t](i));
				}
			}
			n[a] = o, u.push(o), o++;
		}
	}
	let g = e.clone();
	for (let t in e.attributes) {
		let e = c[t];
		if (g.setAttribute(t, new e.constructor(e.array.slice(0, o * e.itemSize), e.itemSize, e.normalized)), t in l) for (let e = 0; e < l[t].length; e++) {
			let n = l[t][e];
			g.morphAttributes[t][e] = new n.constructor(n.array.slice(0, o * n.itemSize), n.itemSize, n.normalized);
		}
	}
	return g.setIndex(u), g;
}
//#endregion
//#region src/plugins/AnyMesh.js
var Setting$7 = class {
	constructor({ name: e, vertices: t, faces: n, color: r = [
		1,
		0,
		0
	], opacity: i = 1, position: a = [
		0,
		0,
		0
	], materialType: o = "Standard", showEdges: s = !1, edgeColor: c = [
		0,
		0,
		0,
		1
	], depthWrite: l = !0, depthTest: u = !0, side: d = "DoubleSide", clearDepth: f = !1, renderOrder: p = 0, mergeVerticesTolerance: m = null, smoothNormals: h = !0, visible: g = !0, selectable: _ = !0, layer: v = null, userData: y = null }) {
		this.name = e, this.vertices = t, this.faces = n, this.color = r, this.opacity = i, this.position = a, this.materialType = o, this.showEdges = s, this.edgeColor = c, this.depthWrite = l, this.depthTest = u, this.side = d, this.clearDepth = f, this.renderOrder = p, this.mergeVerticesTolerance = m, this.smoothNormals = h, this.visible = g, this.selectable = _, this.layer = v, this.userData = y;
	}
}, AnyMesh = class {
	constructor(e) {
		this.viewer = e, this.hud = this.viewer.tjs.hud, this.scene = this.viewer.tjs.scene, this.settings = [], this.meshes = [], this.guiFolder = null, this.legendContainer = null, this.materialsRegistry = this.viewer.materialsRegistry;
		let t = this.viewer.state.get("plugins.anyMesh");
		t && Array.isArray(t.settings) && (this.applySettings(t.settings), this.drawMesh()), this.viewer.state.subscribe("plugins.anyMesh", (e) => {
			!e || !Array.isArray(e.settings) || (this.applySettings(e.settings), this.drawMesh());
		}), this.legendEntries = {};
	}
	setSettings(e) {
		this.viewer.state.set({ plugins: { anyMesh: { settings: cloneValue(e) } } });
	}
	applySettings(e) {
		this.settings = [], this.clearMeshes(), e.forEach((e) => {
			this.addSetting(e);
		});
	}
	addSetting({ name: e, vertices: t, faces: n, color: r, opacity: i, position: a, materialType: o, showEdges: s, edgeColor: c, depthWrite: l, depthTest: u, side: d, clearDepth: f, renderOrder: p, mergeVerticesTolerance: m, smoothNormals: h, visible: g, selectable: _, layer: v, userData: y }) {
		e ||= `mesh-${this.settings.length + 1}`;
		let b = new Setting$7({
			name: e,
			vertices: t,
			faces: n,
			color: r,
			opacity: i,
			position: a,
			materialType: o,
			showEdges: s,
			edgeColor: c,
			depthWrite: l,
			depthTest: u,
			side: d,
			clearDepth: f,
			renderOrder: p,
			mergeVerticesTolerance: m,
			smoothNormals: h,
			visible: g,
			selectable: _,
			layer: v,
			userData: y
		});
		this.settings.push(b);
	}
	clearMeshes() {
		this.meshes.forEach((e) => {
			clearObject(this.scene, e);
		}), this.meshes = [];
	}
	drawMesh() {
		this.clearMeshes(), this.settings.forEach((e) => {
			e.clearDepth && this.viewer?.tjs?.renderer?.clearDepth && this.viewer.tjs.renderer.clearDepth();
			let t = e.materialType || "Standard", n = this.materialsRegistry.getMaterial(t, !0);
			Array.isArray(e.color) ? n.color.setRGB(e.color[0], e.color[1], e.color[2]) : n.color = new THREE$1.Color(e.color);
			let r = e.opacity ?? 1;
			n.transparent = !0, n.opacity = r, n.side = {
				FrontSide: THREE$1.FrontSide,
				BackSide: THREE$1.BackSide,
				DoubleSide: THREE$1.DoubleSide
			}[e.side] ?? THREE$1.DoubleSide, n.depthWrite = e.depthWrite ?? !0, n.depthTest = e.depthTest ?? !0;
			let i = new THREE$1.BufferGeometry(), a = new Float32Array(e.vertices);
			i.setAttribute("position", new THREE$1.BufferAttribute(a, 3));
			let o = new Uint32Array(e.faces);
			i.setIndex(new THREE$1.BufferAttribute(o, 1));
			let s = i;
			s = mergeVertices(i, e.mergeVerticesTolerance), e.mergeVerticesTolerance, (e.smoothNormals ?? !0) && s.computeVertexNormals();
			let c = new THREE$1.Mesh(s, n), l = e.selectable ?? !0, u = typeof e.layer == "number" ? e.layer : l ? 0 : 1;
			if (c.userData.anyMeshName = e.name, c.userData.type = "anyMesh", c.userData.uuid = this.viewer.uuid, c.userData.notSelectable = !l, e.userData && typeof e.userData == "object" && Object.assign(c.userData, e.userData), c.layers.set(u), c.visible = e.visible ?? !0, c.position.set(e.position[0], e.position[1], e.position[2]), typeof e.renderOrder == "number" && (c.renderOrder = e.renderOrder), this.meshes.push(c), this.scene.add(c), e.showEdges) {
				let t = e.edgeColor || [
					0,
					0,
					0,
					1
				], n = t.length === 4 ? t[3] : 1, r = new THREE$1.LineBasicMaterial({
					color: new THREE$1.Color(t[0], t[1], t[2]),
					transparent: n < 1,
					opacity: n
				}), i = new THREE$1.EdgesGeometry(s), a = new THREE$1.LineSegments(i, r);
				a.userData.anyMeshName = e.name, a.userData.type = "anyMesh", a.userData.uuid = this.viewer.uuid, a.userData.notSelectable = !l, e.userData && typeof e.userData == "object" && Object.assign(a.userData, e.userData), a.layers.set(u), a.visible = e.visible ?? !0, a.position.set(0, 0, 0), a.renderOrder = (c.renderOrder ?? 0) + .1, this.meshes.push(a), c.add(a);
			}
		}), this.updateLegend(), this.viewer.requestRedraw?.("render");
	}
	addLegend() {
		if (this.settings.length === 0 || this.legendContainer) return;
		let e = document.createElement("div");
		e.id = "mesh-legend-container", e.style.padding = "8px 10px", e.style.display = "flex", e.style.flexDirection = "column", e.style.gap = "6px", e.style.backgroundColor = "rgba(255, 255, 255, 0.85)", e.style.borderRadius = "6px";
		let t = (e) => e.stopPropagation();
		[
			"click",
			"mousedown",
			"mouseup",
			"pointerdown",
			"pointerup"
		].forEach((n) => {
			e.addEventListener(n, t, !1);
		});
		let n = document.createDocumentFragment();
		this.settings.forEach((e) => {
			let t = document.createElement("div");
			t.style.display = "flex", t.style.alignItems = "center", t.style.cursor = "pointer", t.style.gap = "6px";
			let r = e.visible ?? !0;
			t.style.opacity = r ? "1" : "0.45", t.style.textDecoration = r ? "none" : "line-through";
			let i = document.createElement("span");
			i.style.width = "12px", i.style.height = "12px", i.style.borderRadius = "3px", i.style.backgroundColor = resolveLegendColor(e.color), i.style.border = "1px solid rgba(0,0,0,0.2)", t.appendChild(i);
			let a = document.createElement("span");
			a.textContent = e.name || "mesh", a.style.userSelect = "none", a.style.fontSize = "12px", a.style.color = "#0d0d0d", t.appendChild(a), this.legendEntries[e.name] = t, t.addEventListener("click", () => this.toggleMeshVisibility(e.name)), n.appendChild(t);
		}), e.appendChild(n);
		let r = "AnyMeshLegend";
		this.hud.addHTMLPanel(r, e, {
			anchor: "top-right",
			offset: {
				x: 0,
				y: 0
			},
			visible: !0
		}), this.panelKey = r, this.legendContainer = e, this.viewer.tjs.containerElement.appendChild(e);
	}
	removeLegend() {
		let e = this.viewer.tjs.containerElement.querySelector("#mesh-legend-container");
		e && e.remove(), this.legendContainer = null;
	}
	updateLegend() {
		this.removeLegend(), this.addLegend();
	}
	toggleMeshVisibility(e) {
		if (!e) return;
		let t = this.settings.map((t) => {
			if (t.name !== e) return { ...t };
			let n = t.visible ?? !0, r = {
				...t,
				visible: !n
			}, i = this.legendEntries[e];
			return i && (i.style.opacity = r.visible ? "1" : "0.45", i.style.textDecoration = r.visible ? "none" : "line-through"), r;
		});
		this.setSettings(t);
	}
};
function resolveLegendColor(e) {
	let t = new THREE$1.Color();
	return Array.isArray(e) ? t.setRGB(e[0] ?? 1, e[1] ?? 0, e[2] ?? 0) : e ? t.set(e) : t.setRGB(1, 0, 0), `#${t.getHexString()}`;
}
//#endregion
//#region src/plugins/TextManager.js
var DEFAULT_TEXT_SETTINGS = {
	text: "",
	position: [
		0,
		0,
		0
	],
	color: "#000000",
	fontSize: "14px",
	className: "text-label",
	renderMode: "glyph"
}, TextManager = class {
	constructor(e, { sceneName: t = "MainScene", maxLabels: n = 2e3 } = {}) {
		if (!e) throw Error("A WEAS instance is required");
		if (this.weas = e, this.scene = e.tjs?.scenes?.[t] || e.tjs?.scene, !this.scene) throw Error(`Scene "${t}" not found`);
		this.labels = [], this.maxLabels = n, this._updateHooks = [];
	}
	onChange(e) {
		typeof e == "function" && this._updateHooks.push(e);
	}
	_emitChange() {
		this._updateHooks.forEach((e) => e(this.labels));
	}
	addLabel(e = {}) {
		if (this.labels.length >= this.maxLabels) return console.warn(`TextManager: maxLabels (${this.maxLabels}) reached`), null;
		let { text: t, position: n, color: r, fontSize: i, className: a, renderMode: o, clampFont: s = !0 } = {
			...DEFAULT_TEXT_SETTINGS,
			...e
		}, c = createLabel(new THREE$1.Vector3(...n), t, r, normalizeFontSize(i, s), a);
		return this.scene.add(c), this.labels.push(c), this._emitChange(), c;
	}
	removeLabel(e) {
		e && (this.scene.remove(e), e.remove?.(), this.labels = this.labels.filter((t) => t !== e), this._emitChange());
	}
	clearLabels(e = this.labels) {
		if (console.log("clearing"), !e || e.length === 0) return;
		let t = this.scene;
		for (let n = 0; n < e.length; n++) {
			let r = e[n];
			if (!r) continue;
			t.remove(r);
			let i = r.element;
			i?.parentNode && i.parentNode.removeChild(i), r.remove?.();
			let a = this.labels.indexOf(r);
			a !== -1 && this.labels.splice(a, 1);
		}
		e === this.labels && (this.labels.length = 0), this._emitChange();
	}
	updateLabelPosition(e, t) {
		!e || !t || (e.position.set(...t), this._emitChange());
	}
	updateLabelText(e, t) {
		!e || t === void 0 || (e.element && (e.element.textContent = t), this._emitChange());
	}
	setSettings(e = []) {
		this.clearLabels(), e.forEach((e) => {
			let { positions: t = [], texts: n = "", ...r } = e;
			t.forEach((e, t) => {
				this.addLabel({
					position: e,
					text: Array.isArray(n) ? n[t] : n,
					...r
				});
			});
		});
	}
};
function normalizeFontSize(e, t = !0, n = 14, r = 28) {
	let i;
	if (typeof e == "number") i = e;
	else if (typeof e == "string") {
		let t = parseFloat(e);
		i = Number.isFinite(t) ? t : n;
	} else i = n;
	return t && (i = Math.max(n, Math.min(r, i))), `${i}px`;
}
//#endregion
//#region node_modules/lodash.merge/index.js
var require_lodash_merge = /* @__PURE__ */ __commonJSMin(((e, t) => {
	var n = 200, r = "__lodash_hash_undefined__", i = 800, a = 16, o = 9007199254740991, s = "[object Arguments]", c = "[object Array]", l = "[object AsyncFunction]", u = "[object Boolean]", d = "[object Date]", f = "[object Error]", p = "[object Function]", m = "[object GeneratorFunction]", h = "[object Map]", g = "[object Number]", _ = "[object Null]", v = "[object Object]", y = "[object Proxy]", b = "[object RegExp]", x = "[object Set]", w = "[object String]", T = "[object Undefined]", E = "[object WeakMap]", k = "[object ArrayBuffer]", A = "[object DataView]", j = "[object Float32Array]", M = "[object Float64Array]", L = "[object Int8Array]", R = "[object Int16Array]", z = "[object Int32Array]", G = "[object Uint8Array]", q = "[object Uint8ClampedArray]", J = "[object Uint16Array]", Z = "[object Uint32Array]", Q = /[\\^$.*+?()[\]{}|]/g, ee = /^\[object .+?Constructor\]$/, te = /^(?:0|[1-9]\d*)$/, $ = {};
	$[j] = $[M] = $[L] = $[R] = $[z] = $[G] = $[q] = $[J] = $[Z] = !0, $[s] = $[c] = $[k] = $[u] = $[A] = $[d] = $[f] = $[p] = $[h] = $[g] = $[v] = $[b] = $[x] = $[w] = $[E] = !1;
	var ne = typeof global == "object" && global && global.Object === Object && global, ie = typeof self == "object" && self && self.Object === Object && self, ae = ne || ie || Function("return this")(), oe = typeof e == "object" && e && !e.nodeType && e, se = oe && typeof t == "object" && t && !t.nodeType && t, ce = se && se.exports === oe, le = ce && ne.process, ue = function() {
		try {
			return se && se.require && se.require("util").types || le && le.binding && le.binding("util");
		} catch {}
	}(), de = ue && ue.isTypedArray;
	function fe(e, t, n) {
		switch (n.length) {
			case 0: return e.call(t);
			case 1: return e.call(t, n[0]);
			case 2: return e.call(t, n[0], n[1]);
			case 3: return e.call(t, n[0], n[1], n[2]);
		}
		return e.apply(t, n);
	}
	function pe(e, t) {
		for (var n = -1, r = Array(e); ++n < e;) r[n] = t(n);
		return r;
	}
	function me(e) {
		return function(t) {
			return e(t);
		};
	}
	function he(e, t) {
		return e?.[t];
	}
	function ge(e, t) {
		return function(n) {
			return e(t(n));
		};
	}
	var _e = Array.prototype, ve = Function.prototype, ye = Object.prototype, be = ae["__core-js_shared__"], xe = ve.toString, we = ye.hasOwnProperty, Ee = function() {
		var e = /[^.]+$/.exec(be && be.keys && be.keys.IE_PROTO || "");
		return e ? "Symbol(src)_1." + e : "";
	}(), De = ye.toString, Oe = xe.call(Object), ke = RegExp("^" + xe.call(we).replace(Q, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"), Ae = ce ? ae.Buffer : void 0, je = ae.Symbol, Me = ae.Uint8Array, Pe = Ae ? Ae.allocUnsafe : void 0, Ie = ge(Object.getPrototypeOf, Object), Le = Object.create, ze = ye.propertyIsEnumerable, Ve = _e.splice, Ue = je ? je.toStringTag : void 0, We = function() {
		try {
			var e = Yt(Object, "defineProperty");
			return e({}, "", {}), e;
		} catch {}
	}(), Ke = Ae ? Ae.isBuffer : void 0, qe = Math.max, Je = Date.now, Ye = Yt(ae, "Map"), Ze = Yt(Object, "create"), Qe = function() {
		function e() {}
		return function(t) {
			if (!bn(t)) return {};
			if (Le) return Le(t);
			e.prototype = t;
			var n = new e();
			return e.prototype = void 0, n;
		};
	}();
	function $e(e) {
		var t = -1, n = e == null ? 0 : e.length;
		for (this.clear(); ++t < n;) {
			var r = e[t];
			this.set(r[0], r[1]);
		}
	}
	function et() {
		this.__data__ = Ze ? Ze(null) : {}, this.size = 0;
	}
	function tt(e) {
		var t = this.has(e) && delete this.__data__[e];
		return this.size -= t ? 1 : 0, t;
	}
	function nt(e) {
		var t = this.__data__;
		if (Ze) {
			var n = t[e];
			return n === r ? void 0 : n;
		}
		return we.call(t, e) ? t[e] : void 0;
	}
	function rt(e) {
		var t = this.__data__;
		return Ze ? t[e] !== void 0 : we.call(t, e);
	}
	function it(e, t) {
		var n = this.__data__;
		return this.size += this.has(e) ? 0 : 1, n[e] = Ze && t === void 0 ? r : t, this;
	}
	$e.prototype.clear = et, $e.prototype.delete = tt, $e.prototype.get = nt, $e.prototype.has = rt, $e.prototype.set = it;
	function at(e) {
		var t = -1, n = e == null ? 0 : e.length;
		for (this.clear(); ++t < n;) {
			var r = e[t];
			this.set(r[0], r[1]);
		}
	}
	function ot() {
		this.__data__ = [], this.size = 0;
	}
	function st(e) {
		var t = this.__data__, n = Et(t, e);
		return n < 0 ? !1 : (n == t.length - 1 ? t.pop() : Ve.call(t, n, 1), --this.size, !0);
	}
	function ct(e) {
		var t = this.__data__, n = Et(t, e);
		return n < 0 ? void 0 : t[n][1];
	}
	function lt(e) {
		return Et(this.__data__, e) > -1;
	}
	function ut(e, t) {
		var n = this.__data__, r = Et(n, e);
		return r < 0 ? (++this.size, n.push([e, t])) : n[r][1] = t, this;
	}
	at.prototype.clear = ot, at.prototype.delete = st, at.prototype.get = ct, at.prototype.has = lt, at.prototype.set = ut;
	function dt(e) {
		var t = -1, n = e == null ? 0 : e.length;
		for (this.clear(); ++t < n;) {
			var r = e[t];
			this.set(r[0], r[1]);
		}
	}
	function ft() {
		this.size = 0, this.__data__ = {
			hash: new $e(),
			map: new (Ye || at)(),
			string: new $e()
		};
	}
	function pt(e) {
		var t = Jt(this, e).delete(e);
		return this.size -= t ? 1 : 0, t;
	}
	function mt(e) {
		return Jt(this, e).get(e);
	}
	function ht(e) {
		return Jt(this, e).has(e);
	}
	function gt(e, t) {
		var n = Jt(this, e), r = n.size;
		return n.set(e, t), this.size += n.size == r ? 0 : 1, this;
	}
	dt.prototype.clear = ft, dt.prototype.delete = pt, dt.prototype.get = mt, dt.prototype.has = ht, dt.prototype.set = gt;
	function _t(e) {
		this.size = (this.__data__ = new at(e)).size;
	}
	function vt() {
		this.__data__ = new at(), this.size = 0;
	}
	function yt(e) {
		var t = this.__data__, n = t.delete(e);
		return this.size = t.size, n;
	}
	function bt(e) {
		return this.__data__.get(e);
	}
	function xt(e) {
		return this.__data__.has(e);
	}
	function St(e, t) {
		var r = this.__data__;
		if (r instanceof at) {
			var i = r.__data__;
			if (!Ye || i.length < n - 1) return i.push([e, t]), this.size = ++r.size, this;
			r = this.__data__ = new dt(i);
		}
		return r.set(e, t), this.size = r.size, this;
	}
	_t.prototype.clear = vt, _t.prototype.delete = yt, _t.prototype.get = bt, _t.prototype.has = xt, _t.prototype.set = St;
	function Ct(e, t) {
		var n = mn(e), r = !n && pn(e), i = !n && !r && _n(e), a = !n && !r && !i && Tn(e), o = n || r || i || a, s = o ? pe(e.length, String) : [], c = s.length;
		for (var l in e) (t || we.call(e, l)) && !(o && (l == "length" || i && (l == "offset" || l == "parent") || a && (l == "buffer" || l == "byteLength" || l == "byteOffset") || Qt(l, c))) && s.push(l);
		return s;
	}
	function wt(e, t, n) {
		(n !== void 0 && !fn(e[t], n) || n === void 0 && !(t in e)) && Dt(e, t, n);
	}
	function Tt(e, t, n) {
		var r = e[t];
		(!(we.call(e, t) && fn(r, n)) || n === void 0 && !(t in e)) && Dt(e, t, n);
	}
	function Et(e, t) {
		for (var n = e.length; n--;) if (fn(e[n][0], t)) return n;
		return -1;
	}
	function Dt(e, t, n) {
		t == "__proto__" && We ? We(e, t, {
			configurable: !0,
			enumerable: !0,
			value: n,
			writable: !0
		}) : e[t] = n;
	}
	var Ot = qt();
	function kt(e) {
		return e == null ? e === void 0 ? T : _ : Ue && Ue in Object(e) ? Xt(e) : an(e);
	}
	function jt(e) {
		return xn(e) && kt(e) == s;
	}
	function Nt(e) {
		return !bn(e) || tn(e) ? !1 : (vn(e) ? ke : ee).test(dn(e));
	}
	function Ft(e) {
		return xn(e) && yn(e.length) && !!$[kt(e)];
	}
	function It(e) {
		if (!bn(e)) return rn(e);
		var t = nn(e), n = [];
		for (var r in e) r == "constructor" && (t || !we.call(e, r)) || n.push(r);
		return n;
	}
	function Lt(e, t, n, r, i) {
		e !== t && Ot(t, function(a, o) {
			if (i ||= new _t(), bn(a)) Rt(e, t, o, n, Lt, r, i);
			else {
				var s = r ? r(sn(e, o), a, o + "", e, t, i) : void 0;
				s === void 0 && (s = a), wt(e, o, s);
			}
		}, Dn);
	}
	function Rt(e, t, n, r, i, a, o) {
		var s = sn(e, n), c = sn(t, n), l = o.get(c);
		if (l) {
			wt(e, n, l);
			return;
		}
		var u = a ? a(s, c, n + "", e, t, o) : void 0, d = u === void 0;
		if (d) {
			var f = mn(c), p = !f && _n(c), m = !f && !p && Tn(c);
			u = c, f || p || m ? mn(s) ? u = s : gn(s) ? u = Wt(s) : p ? (d = !1, u = Vt(c, !0)) : m ? (d = !1, u = Ut(c, !0)) : u = [] : wn(c) || pn(c) ? (u = s, pn(s) ? u = En(s) : (!bn(s) || vn(s)) && (u = Zt(c))) : d = !1;
		}
		d && (o.set(c, u), i(u, c, r, a, o), o.delete(c)), wt(e, n, u);
	}
	function zt(e, t) {
		return cn(on(e, t, An), e + "");
	}
	var Bt = We ? function(e, t) {
		return We(e, "toString", {
			configurable: !0,
			enumerable: !1,
			value: kn(t),
			writable: !0
		});
	} : An;
	function Vt(e, t) {
		if (t) return e.slice();
		var n = e.length, r = Pe ? Pe(n) : new e.constructor(n);
		return e.copy(r), r;
	}
	function Ht(e) {
		var t = new e.constructor(e.byteLength);
		return new Me(t).set(new Me(e)), t;
	}
	function Ut(e, t) {
		var n = t ? Ht(e.buffer) : e.buffer;
		return new e.constructor(n, e.byteOffset, e.length);
	}
	function Wt(e, t) {
		var n = -1, r = e.length;
		for (t ||= Array(r); ++n < r;) t[n] = e[n];
		return t;
	}
	function Gt(e, t, n, r) {
		var i = !n;
		n ||= {};
		for (var a = -1, o = t.length; ++a < o;) {
			var s = t[a], c = r ? r(n[s], e[s], s, n, e) : void 0;
			c === void 0 && (c = e[s]), i ? Dt(n, s, c) : Tt(n, s, c);
		}
		return n;
	}
	function Kt(e) {
		return zt(function(t, n) {
			var r = -1, i = n.length, a = i > 1 ? n[i - 1] : void 0, o = i > 2 ? n[2] : void 0;
			for (a = e.length > 3 && typeof a == "function" ? (i--, a) : void 0, o && $t(n[0], n[1], o) && (a = i < 3 ? void 0 : a, i = 1), t = Object(t); ++r < i;) {
				var s = n[r];
				s && e(t, s, r, a);
			}
			return t;
		});
	}
	function qt(e) {
		return function(t, n, r) {
			for (var i = -1, a = Object(t), o = r(t), s = o.length; s--;) {
				var c = o[e ? s : ++i];
				if (n(a[c], c, a) === !1) break;
			}
			return t;
		};
	}
	function Jt(e, t) {
		var n = e.__data__;
		return en(t) ? n[typeof t == "string" ? "string" : "hash"] : n.map;
	}
	function Yt(e, t) {
		var n = he(e, t);
		return Nt(n) ? n : void 0;
	}
	function Xt(e) {
		var t = we.call(e, Ue), n = e[Ue];
		try {
			e[Ue] = void 0;
			var r = !0;
		} catch {}
		var i = De.call(e);
		return r && (t ? e[Ue] = n : delete e[Ue]), i;
	}
	function Zt(e) {
		return typeof e.constructor == "function" && !nn(e) ? Qe(Ie(e)) : {};
	}
	function Qt(e, t) {
		var n = typeof e;
		return t ??= o, !!t && (n == "number" || n != "symbol" && te.test(e)) && e > -1 && e % 1 == 0 && e < t;
	}
	function $t(e, t, n) {
		if (!bn(n)) return !1;
		var r = typeof t;
		return (r == "number" ? hn(n) && Qt(t, n.length) : r == "string" && t in n) ? fn(n[t], e) : !1;
	}
	function en(e) {
		var t = typeof e;
		return t == "string" || t == "number" || t == "symbol" || t == "boolean" ? e !== "__proto__" : e === null;
	}
	function tn(e) {
		return !!Ee && Ee in e;
	}
	function nn(e) {
		var t = e && e.constructor;
		return e === (typeof t == "function" && t.prototype || ye);
	}
	function rn(e) {
		var t = [];
		if (e != null) for (var n in Object(e)) t.push(n);
		return t;
	}
	function an(e) {
		return De.call(e);
	}
	function on(e, t, n) {
		return t = qe(t === void 0 ? e.length - 1 : t, 0), function() {
			for (var r = arguments, i = -1, a = qe(r.length - t, 0), o = Array(a); ++i < a;) o[i] = r[t + i];
			i = -1;
			for (var s = Array(t + 1); ++i < t;) s[i] = r[i];
			return s[t] = n(o), fe(e, this, s);
		};
	}
	function sn(e, t) {
		if (!(t === "constructor" && typeof e[t] == "function") && t != "__proto__") return e[t];
	}
	var cn = un(Bt);
	function un(e) {
		var t = 0, n = 0;
		return function() {
			var r = Je(), o = a - (r - n);
			if (n = r, o > 0) {
				if (++t >= i) return arguments[0];
			} else t = 0;
			return e.apply(void 0, arguments);
		};
	}
	function dn(e) {
		if (e != null) {
			try {
				return xe.call(e);
			} catch {}
			try {
				return e + "";
			} catch {}
		}
		return "";
	}
	function fn(e, t) {
		return e === t || e !== e && t !== t;
	}
	var pn = jt(function() {
		return arguments;
	}()) ? jt : function(e) {
		return xn(e) && we.call(e, "callee") && !ze.call(e, "callee");
	}, mn = Array.isArray;
	function hn(e) {
		return e != null && yn(e.length) && !vn(e);
	}
	function gn(e) {
		return xn(e) && hn(e);
	}
	var _n = Ke || jn;
	function vn(e) {
		if (!bn(e)) return !1;
		var t = kt(e);
		return t == p || t == m || t == l || t == y;
	}
	function yn(e) {
		return typeof e == "number" && e > -1 && e % 1 == 0 && e <= o;
	}
	function bn(e) {
		var t = typeof e;
		return e != null && (t == "object" || t == "function");
	}
	function xn(e) {
		return typeof e == "object" && !!e;
	}
	function wn(e) {
		if (!xn(e) || kt(e) != v) return !1;
		var t = Ie(e);
		if (t === null) return !0;
		var n = we.call(t, "constructor") && t.constructor;
		return typeof n == "function" && n instanceof n && xe.call(n) == Oe;
	}
	var Tn = de ? me(de) : Ft;
	function En(e) {
		return Gt(e, Dn(e));
	}
	function Dn(e) {
		return hn(e) ? Ct(e, !0) : It(e);
	}
	var On = Kt(function(e, t, n) {
		Lt(e, t, n);
	});
	function kn(e) {
		return function() {
			return e;
		};
	}
	function An(e) {
		return e;
	}
	function jn() {
		return !1;
	}
	t.exports = On;
})), import_lodash_merge = /* @__PURE__ */ __toESM(require_lodash_merge(), 1), DEFAULT_CELL_SETTINGS = {
	showCell: !0,
	showAxes: !0,
	cellColor: 0,
	cellLineWidth: 2,
	hudAxisColors: {
		a: 16711680,
		b: 65280,
		c: 255
	}
}, CellManager = class {
	constructor(e, t = {}) {
		this.viewer = e, this.shapeRegistry = e.weas.shapeRegistry, this.settings = (0, import_lodash_merge.default)({}, DEFAULT_CELL_SETTINGS, t), this._showCell = this.settings.showCell, this._showAxes = this.settings.showAxes;
		let n = this.viewer.state.get("cell") || {};
		(0, import_lodash_merge.default)(this.settings, n), n.showCell !== void 0 && (this._showCell = n.showCell), n.showAxes !== void 0 && (this._showAxes = n.showAxes), this.viewer.state.subscribe("cell", (e, t) => this._onCellStateChange(e, t));
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
		if (this.cellMesh &&= (this.viewer.tjs.scene.remove(this.cellMesh), this.cellMesh.geometry.dispose(), this.cellMesh.material.dispose(), null), this.cellVectors) {
			let e = this.viewer.tjs.hud.coordAxesGroup;
			e && e.remove(this.cellVectors), this.cellVectors = null;
		}
	}
	draw() {
		this.clear(), this.viewer.originalCell.some((e) => e.every((e) => e === 0)) || (this.currentCell = this.viewer.originalCell.map((e) => e.slice()), this.cellMesh = this.drawUnitCell(), this.cellVectors = this.drawUnitCellVectors(), this.cellVectors.visible = this.showAxes);
	}
	drawUnitCell() {
		let e = this.viewer.originalCell;
		if (!e || e.length !== 3) {
			console.warn("Invalid or missing unit cell data");
			return;
		}
		let t = this.shapeRegistry.create("ConvexShape", {
			corners: getCellCorners(e),
			edges: !0,
			color: this.settings.cellColor
		});
		return t.userData = {
			type: "cell",
			uuid: this.viewer.uuid,
			objectMode: "edit",
			notSelectable: !0
		}, t.layers.set(1), t.visible = this.showCell, this.viewer.tjs.scene.add(t), t;
	}
	drawUnitCellVectors() {
		let e = new THREE$1.Vector3(0, 0, 0), t = this.viewer.originalCell, n = 1.5;
		if (!t || t.length !== 3) {
			console.warn("Invalid or missing unit cell data for vectors");
			return;
		}
		if (!this.viewer.tjs.hud.miniScenes.get("coord")) return;
		let r = this.viewer.tjs.hud.coordAxesGroup, i = new THREE$1.Group(), a = [
			"a",
			"b",
			"c"
		], o = this.settings.hudAxisColors, s = .5;
		return t.forEach((t, r) => {
			let s = new THREE$1.Vector3(...t).clone().normalize().clone().multiplyScalar(n), c = this.shapeRegistry.create("Arrow", {
				color: o[a[r]],
				start: e.clone(),
				end: s.clone(),
				shaftRadius: .06,
				headRadius: .12,
				shaftRatio: .75
			});
			i.add(c);
			let l = s.clone().multiplyScalar(1 + .5 / n);
			i.add(createSpriteLabel(l, a[r], "black", "36px"));
			let u = this.shapeRegistry.create("Sphere", {
				color: "grey",
				position: e.clone(),
				scale: [
					.22,
					.22,
					.22
				]
			});
			i.add(u);
		}), r.add(i), i.visible = this.showCell, i;
	}
	updateCellMesh(e) {
		let t = 1e-5;
		!e || e.length !== 3 || !this.cellMesh || !this.currentCell || e.every((e, t) => e.every((e, n) => Math.abs(e - this.currentCell[t][n]) < 1e-5)) || (this.currentCell = e.map((e) => e.slice()), this.cellMesh.updateCorners(getCellCorners(this.currentCell)));
	}
	_onCellStateChange(e, t) {
		if (!e) return;
		let { showCell: n, showAxes: r, ...i } = e, { showCell: a, showAxes: o, ...s } = t || {};
		(0, import_lodash_merge.default)(this.settings, i), n !== void 0 && (this.showCell = n), r !== void 0 && (this.showAxes = r), JSON.stringify(i) !== JSON.stringify(s) && (this.draw(), this.viewer.requestRedraw?.("render"));
	}
};
function getCellCorners(e) {
	let [t, n, r] = e, i = [
		0,
		0,
		0
	], a = (e, t) => [
		e[0] + t[0],
		e[1] + t[1],
		e[2] + t[2]
	];
	return [
		i,
		t,
		n,
		r,
		a(t, n),
		a(t, r),
		a(n, r),
		a(a(t, n), r)
	];
}
function createSpriteLabel(e, t, n, r) {
	let i = 128, a = document.createElement("canvas");
	a.width = 128, a.height = 128;
	let o = a.getContext("2d");
	o.font = `${128 / 180 * parseInt(r)}px Arial`, o.fillStyle = n, o.textAlign = "center", o.textBaseline = "middle", o.fillText(t, a.width / 2, a.height / 2);
	let s = new THREE$1.CanvasTexture(a);
	s.minFilter = THREE$1.LinearFilter, s.generateMipmaps = !1, s.encoding = THREE$1.sRGBEncoding, s.anisotropy = 16;
	let c = new THREE$1.Sprite(new THREE$1.SpriteMaterial({ map: s }));
	c.position.copy(e);
	let l = 2.25;
	return c.scale.set(l, l, 1), c;
}
//#endregion
//#region src/atoms/color.js
function getAtomColors(e, t, n) {
	let r = [], i;
	if (t === "Random") r = [], e.symbols.forEach((e, t) => {
		i = new THREE$1.Color(Math.random() * 16777215), r.push(i);
	});
	else if (t === "Uniform") r = [], e.symbols.forEach((e, t) => {
		i = new THREE$1.Color(n.colorRamp[0]), r.push(i);
	});
	else if (t === "Index") return r = [], getColorsFromArray(e.symbols.map((e, t) => t), n.colorRamp);
	else if (t in e.attributes.atom) {
		let r = e.attributes.atom[t];
		return r.length > 0 && r[0].length ? getColorsFromArray(r.map((e) => Math.sqrt(e.reduce((e, t) => e + t ** 2, 0))), n.colorRamp) : getColorsFromArray(r, n.colorRamp);
	}
	return r;
}
function getColorsFromArray(e, t) {
	let n = [], r = Math.min(...e), i = Math.max(...e) - r, a = t.length - 1;
	return e.forEach((e) => {
		let o = (e - r) / i, s = Math.min(Math.floor(o * a), a - 1), c = (o - s / a) * a, l = new THREE$1.Color(t[s]), u = new THREE$1.Color(t[s + 1]), d = new THREE$1.Color(l.r, l.g, l.b).lerp(u, c);
		n.push(d);
	}), n;
}
//#endregion
//#region src/atoms/plugins/boundary.js
var Setting$6 = class {
	constructor({ element: e, symbol: t, radius: n = 2, color: r = "#3d82ed" }) {
		this.element = e, this.symbol = t, this.color = convertColor(r), this.radius = n;
	}
	toDict() {
		return {
			element: this.element,
			symbol: this.symbol,
			color: this.color,
			radius: this.radius
		};
	}
}, BoundaryManager = class {
	constructor(e) {
		this.viewer = e, this.scene = this.viewer.tjs.scene, this.settings = {}, this.meshes = {}, this.init();
	}
	init() {
		this.viewer.logger.debug("init atom settings"), this.settings = {}, Object.entries(this.viewer.originalAtoms.species).forEach(([e, t]) => {
			this.settings[e] = this.getDefaultSetting(e, t);
		});
	}
	getDefaultSetting(e, t) {
		let n = elementColors[this.viewer.colorType][t.element], r = radiiData[this.viewer.radiusType][t.element];
		return new Setting$6({
			element: t.element,
			symbol: e,
			radius: r,
			color: n
		});
	}
	addSetting({ specie1: e, specie2: t, radius: n, min: r = 0, max: i = 3, color1: a = "#3d82ed", color2: o = "#3d82ed", order: s = 1 }) {
		let c = new Setting$6({
			specie1: e,
			specie2: t,
			radius: n,
			min: r,
			max: i,
			color1: a,
			color2: o,
			order: s
		}), l = e + "-" + t;
		this.settings[l] = c;
	}
	getBoundaryAtoms() {
		this.viewer.boundaryList = searchBoundary(this.viewer.atoms, this.viewer._boundary), this.viewer.logger.debug("boundaryList: ", this.viewer.boundaryList), this.viewer.boundaryMap = createBoundaryMapping(this.viewer.boundaryList), this.viewer.logger.debug("boundaryMap: ", this.viewer.boundaryMap);
	}
};
function getImageAtoms(e, t) {
	let n = new Atoms();
	return n.cell = e.cell, n.species = e.species, n.positions = t.map((t) => {
		let n = e.positions[t[0]], r = calculateCartesianCoordinates(e.cell, [
			t[1][0],
			t[1][1],
			t[1][2]
		]);
		return n.map((e, t) => e + r[t]);
	}), n.symbols = t.map((t) => e.symbols[t[0]]), n.uuid = e.uuid, n;
}
function searchBoundary(e, t = [
	[-.01, 1.01],
	[-.01, 1.01],
	[-.01, 1.01]
]) {
	if (e.isUndefinedCell()) return [];
	let n = e.positions, r = e.species;
	typeof t == "number" && (t = [
		[-t, 1 + t],
		[-t, 1 + t],
		[-t, 1 + t]
	]), t = t.map((e) => e.map(Number));
	let i = [t.map((e) => Math.floor(e[0])), t.map((e) => Math.ceil(e[1])).map((e, t) => e)], a = i[0].reduce((e, t, n) => e * (i[1][n] - t), 1);
	n = e.calculateFractionalCoordinates();
	let o = n.length, s = repeatPositions(n, a - 1), c = 0, l = [], u = [];
	for (let e = i[0][0]; e < i[1][0]; e++) for (let t = i[0][1]; t < i[1][1]; t++) for (let n = i[0][2]; n < i[1][2]; n++) {
		if (e === 0 && t === 0 && n === 0) continue;
		let i = c + o;
		for (let r = c; r < i; r++) s[r] = s[r].map((r, i) => r + (i === 0 ? e : i === 1 ? t : n)), l.push([r % o, [
			e,
			t,
			n
		]]);
		u = u.concat(r), c = i;
	}
	let d = [];
	for (let e = 0; e < s.length; e++) s[e][0] > t[0][0] && s[e][0] < t[0][1] && s[e][1] > t[1][0] && s[e][1] < t[1][1] && s[e][2] > t[2][0] && s[e][2] < t[2][1] && d.push(e);
	return d.map((e) => l[e]);
}
function createBoundaryMapping(e) {
	let t = {};
	return e.forEach((e, n) => {
		let r = e[0], i = e[1];
		t[r] ? t[r].push({
			index: n,
			offset: i
		}) : t[r] = [{
			index: n,
			offset: i
		}];
	}), t;
}
function repeatPositions(e, t) {
	let n = [];
	for (let r = 0; r < t; r++) for (let t = 0; t < e.length; t++) n.push([...e[t]]);
	return n;
}
//#endregion
//#region src/atoms/utils.js
function convertColor$1(e) {
	return e = Array.isArray(e) ? new THREE$1.Color(...e) : new THREE$1.Color(e), e;
}
function drawAtoms({ atoms: e, atomScales: t, settings: n, colors: r, materialType: i = "Standard", shapeType: a = "Sphere", data_type: o = "atom", shapeRegistry: s }) {
	let c = [
		[Infinity, 10],
		[2e4, 12],
		[1e4, 18],
		[1e3, 24],
		[100, 32]
	].slice().reverse().find(([t]) => e.symbols.length <= t)?.[1] ?? 32, l = s.create(a, {
		materialType: i,
		widthSegments: c,
		heightSegments: c
	}), u, d;
	if (l instanceof THREE$1.Mesh) u = l.geometry.clone(), d = l.material.clone();
	else if (l instanceof THREE$1.Group) {
		let e = l.children.find((e) => e instanceof THREE$1.Mesh);
		if (!e) throw Error("Shape group has no meshes");
		u = e.geometry.clone(), d = e.material.clone();
	} else throw Error("Unsupported shape type for instancing");
	d = d.clone(), d.color.set(16777215);
	let f = e.symbols.length, p = new THREE$1.InstancedMesh(u, d, f);
	p.instanceColor = new THREE$1.InstancedBufferAttribute(new Float32Array(f * 3), 3);
	let m = new THREE$1.Vector3(), h = new THREE$1.Quaternion(), g = new THREE$1.Vector3(), _ = new THREE$1.Matrix4();
	return e.symbols.forEach((i, a) => {
		m.set(...e.positions[a]);
		let o = (i in n ? n[i].radius : 1) * t[a];
		g.set(o, o, o), _.compose(m, h, g), p.setMatrixAt(a, _);
		let s = r[a] instanceof THREE$1.Color ? r[a] : new THREE$1.Color(r[a]);
		p.setColorAt(a, s);
	}), p.instanceMatrix.needsUpdate = !0, p.instanceColor.needsUpdate = !0, p.userData = {
		type: o,
		uuid: e.uuid,
		objectMode: "edit"
	}, p;
}
//#endregion
//#region src/atoms/plugins/atom.js
var Setting$5 = class {
	constructor({ element: e, symbol: t, radius: n = 2, color: r = "#3d82ed" }) {
		this.element = e, this.symbol = t, this.color = convertColor$1(r), this.radius = n;
	}
	toDict() {
		return {
			element: this.element,
			symbol: this.symbol,
			color: this.color,
			radius: this.radius
		};
	}
}, AtomManager = class {
	constructor(e) {
		this.viewer = e, this.scene = this.viewer.tjs.scene, this.settings = {}, this.meshes = {}, this.materialsRegistry = this.viewer.weas.materialsRegistry, this.shapeRegistry = this.viewer.weas.shapeRegistry, this.init();
		let t = this.viewer.state.get("plugins.species");
		t && t.settings && this.applySettings(t.settings), this.viewer.state.subscribe("plugins.species", (e) => {
			!e || !e.settings || (this.applySettings(e.settings), this.viewer._initializingState || this.viewer.requestRedraw?.("full"));
		});
	}
	init() {
		this.viewer.logger.debug("init atom settings"), this.settings = {}, Object.entries(this.viewer.originalAtoms.species).forEach(([e, t]) => {
			this.settings[e] = this.getDefaultSetting(e, t.element);
		}), this.updateAtomColors();
	}
	updateAtomColors() {
		let e = [];
		this.viewer.atoms.symbols.forEach((t, n) => {
			this.settings[t] || (this.settings[t] = this.getDefaultSetting(t, this.viewer.atoms.species[t]?.element || t));
			let r = new THREE$1.Color(this.settings[t].color);
			e.push(r);
		}), this.viewer.atomColors = e, this.viewer.colorBy !== "Element" && (this.viewer.atomColors = getAtomColors(this.viewer.atoms, this.viewer.colorBy, {
			colorType: this.viewer.colorType,
			colorRamp: this.viewer._colorRamp
		}));
	}
	getDefaultSetting(e, t) {
		let n, r;
		return n = "color" in this.viewer.atoms.attributes.specie ? this.viewer.atoms.attributes.specie.color[e] || "#3d82ed" : elementColors[this.viewer.colorType][t], r = "radii" in this.viewer.atoms.attributes.specie ? this.viewer.atoms.attributes.specie.radii[e] || 1 : radiiData[this.viewer.radiusType][t] || 1, new Setting$5({
			element: t,
			symbol: e,
			radius: r,
			color: n
		});
	}
	setSettings(e) {
		this.viewer.state.set({ plugins: { species: { settings: cloneValue(e) } } });
	}
	applySettings(e) {
		this.settings = {}, this.clearMeshes(), Object.values(e).forEach((e) => {
			this.addSetting(e);
		});
	}
	addSetting({ element: e, symbol: t, radius: n = 2, color: r = "#3d82ed" }) {
		let i = new Setting$5({
			element: e,
			symbol: t,
			radius: n,
			color: r
		});
		this.settings[t] = i;
	}
	toPlainSettings() {
		let e = {};
		return Object.entries(this.settings).forEach(([t, n]) => {
			e[t] = n && typeof n.toDict == "function" ? n.toDict() : n;
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
		let e = drawAtoms({
			scene: this.scene,
			atoms: this.viewer.atoms,
			atomScales: this.viewer.atomScales,
			settings: this.settings,
			colors: this.viewer.atomColors,
			materialType: this.viewer._materialType,
			shapeRegistry: this.shapeRegistry
		});
		this.scene.add(e);
		let t = this.viewer.boundaryList || [];
		if (this.viewer.imageAtomsList = this.viewer.bondedAtoms.atoms.concat(t), this.imageAtomMap = createImageAtomsMapping(this.viewer.imageAtomsList), this.viewer.imageAtomsList.length > 0) {
			let t = getImageAtoms(this.viewer.atoms, this.viewer.imageAtomsList), n = Array(t.getAtomsCount()).fill(1);
			for (let e = 0; e < t.getAtomsCount(); e++) n[e] = this.viewer.atomScales[this.viewer.imageAtomsList[e][0]];
			let r = this.viewer.imageAtomsList.map(([e]) => {
				let n = this.viewer.atomColors?.[e];
				if (n) return typeof n.clone == "function" ? n.clone() : new THREE$1.Color(n);
				let r = this.viewer.atoms.symbols[e];
				return this.settings[r] || (this.settings[r] = this.getDefaultSetting(r, t.species[r]?.element || r)), new THREE$1.Color(this.settings[r].color);
			}), i = drawAtoms({
				scene: this.scene,
				atoms: t,
				atomScales: n,
				settings: this.settings,
				colors: r,
				materialType: this.viewer._materialType,
				shapeRegistry: this.shapeRegistry,
				data_type: "image"
			});
			e.add(i), this.meshes.image = i;
		}
		return this.meshes.atom = e, e;
	}
	updateAtomMesh(e = null, t = null) {
		var n = new THREE$1.Matrix4();
		for (let e = 0; e < t.positions.length; e++) this.meshes.atom.getMatrixAt(e, n), n.setPosition(new THREE$1.Vector3(...t.positions[e])), this.meshes.atom.setMatrixAt(e, n), this.updateImageAtomsMesh(e);
		this.meshes.atom.instanceMatrix.needsUpdate = !0, this.meshes.image && (this.meshes.image.instanceMatrix.needsUpdate = !0);
	}
	updateImageAtomsMesh(e) {
		this.viewer.imageAtomsList.length > 0 && this.imageAtomMap[e] && this.imageAtomMap[e].forEach((t) => {
			let n = t.index, r = this.viewer.atoms.positions[e].map((e, n) => e + calculateCartesianCoordinates(this.viewer.atoms.cell, t.offset)[n]), i = new THREE$1.Matrix4();
			this.meshes.image.getMatrixAt(n, i), i.setPosition(new THREE$1.Vector3(...r)), this.meshes.image.setMatrixAt(n, i);
		});
	}
	updateAtomScale(e) {
		e === void 0 && (e = this.viewer.atomScale);
		let t = this.meshes.atom, n = this.viewer.selectedAtomsIndices.length > 0 ? this.viewer.selectedAtomsIndices : [...Array(this.viewer.atoms.positions.length).keys()];
		if (this.updateMeshScale(t, n, this.viewer.atoms.symbols, e), t = this.meshes.image, t) {
			let n = [], r = [];
			for (let e = 0; e < this.viewer.imageAtomsList.length; e++) n.push(this.viewer.atoms.symbols[this.viewer.imageAtomsList[e][0]]), this.viewer.selectedAtomsIndices.includes(this.viewer.imageAtomsList[e][0]) && r.push(e);
			this.updateMeshScale(t, r, n, e);
		}
		this.viewer.requestRedraw?.("render");
	}
	updateMeshScale(e, t, n, r) {
		let i = new THREE$1.Vector3(), a = new THREE$1.Quaternion(), o = new THREE$1.Vector3();
		t.forEach((t) => {
			let s = new THREE$1.Matrix4(), c = this.settings[n[t]].radius || 1;
			e.getMatrixAt(t, s), s.decompose(i, a, o), o.set(c * r, c * r, c * r), s.compose(i, a, o), e.setMatrixAt(t, s);
		}), e.instanceMatrix.needsUpdate = !0;
	}
};
function createImageAtomsMapping(e) {
	let t = {};
	return e.forEach((e, n) => {
		let r = e[0], i = e[1];
		t[r] ? t[r].push({
			index: n,
			offset: i
		}) : t[r] = [{
			index: n,
			offset: i
		}];
	}), t;
}
//#endregion
//#region src/geometry/kdTree.js
var Node = class {
	constructor(e, t, n) {
		this.obj = e, this.left = null, this.right = null, this.parent = n, this.dimension = t;
	}
}, kdTree = class {
	constructor(e, t, n) {
		var r = this;
		function i(e, t, r) {
			var a = t % n.length, o, s;
			return e.length === 0 ? null : e.length === 1 ? new Node(e[0], a, r) : (e.sort(function(e, t) {
				return e[n[a]] - t[n[a]];
			}), o = Math.floor(e.length / 2), s = new Node(e[o], a, r), s.left = i(e.slice(0, o), t + 1, s), s.right = i(e.slice(o + 1), t + 1, s), s);
		}
		function a(e) {
			r.root = e;
			function t(e) {
				e.left && (e.left.parent = e, t(e.left)), e.right && (e.right.parent = e, t(e.right));
			}
			t(r.root);
		}
		Array.isArray(e) ? this.root = i(e, 0, null) : a(e, t, n), this.toJSON = function(e) {
			e ||= this.root;
			var t = new Node(e.obj, e.dimension, null);
			return e.left && (t.left = r.toJSON(e.left)), e.right && (t.right = r.toJSON(e.right)), t;
		}, this.insert = function(e) {
			function t(r, i) {
				if (r === null) return i;
				var a = n[r.dimension];
				return e[a] < r.obj[a] ? t(r.left, r) : t(r.right, r);
			}
			var r = t(this.root, null), i, a;
			if (r === null) {
				this.root = new Node(e, 0, null);
				return;
			}
			i = new Node(e, (r.dimension + 1) % n.length, r), a = n[r.dimension], e[a] < r.obj[a] ? r.left = i : r.right = i;
		}, this.remove = function(e) {
			var t;
			function i(t) {
				if (t === null) return null;
				if (t.obj === e) return t;
				var r = n[t.dimension];
				return e[r] < t.obj[r] ? i(t.left, t) : i(t.right, t);
			}
			function a(e) {
				var t, i, o;
				function s(e, t) {
					var r, i, a, o, c;
					return e === null ? null : (r = n[t], e.dimension === t ? e.left === null ? e : s(e.left, t) : (i = e.obj[r], a = s(e.left, t), o = s(e.right, t), c = e, a !== null && a.obj[r] < i && (c = a), o !== null && o.obj[r] < c.obj[r] && (c = o), c));
				}
				if (e.left === null && e.right === null) {
					if (e.parent === null) {
						r.root = null;
						return;
					}
					o = n[e.parent.dimension], e.obj[o] < e.parent.obj[o] ? e.parent.left = null : e.parent.right = null;
					return;
				}
				e.right === null ? (t = s(e.left, e.dimension), i = t.obj, a(t), e.right = e.left, e.left = null, e.obj = i) : (t = s(e.right, e.dimension), i = t.obj, a(t), e.obj = i);
			}
			t = i(r.root), t !== null && a(t);
		}, this.nearest = function(e, i, a) {
			var o, s, c = new BinaryHeap(function(e) {
				return -e[1];
			});
			function l(r) {
				var a, o = n[r.dimension], s = t(e, r.obj), u = {}, d, f, p;
				function m(e, t) {
					c.push([e, t]), c.size() > i && c.pop();
				}
				for (p = 0; p < n.length; p += 1) p === r.dimension ? u[n[p]] = e[n[p]] : u[n[p]] = r.obj[n[p]];
				if (d = t(u, r.obj), r.right === null && r.left === null) {
					(c.size() < i || s < c.peek()[1]) && m(r, s);
					return;
				}
				a = r.right === null ? r.left : r.left === null ? r.right : e[o] < r.obj[o] ? r.left : r.right, l(a), (c.size() < i || s < c.peek()[1]) && m(r, s), (c.size() < i || Math.abs(d) < c.peek()[1]) && (f = a === r.left ? r.right : r.left, f !== null && l(f));
			}
			if (a) for (o = 0; o < i; o += 1) c.push([null, a]);
			for (r.root && l(r.root), s = [], o = 0; o < Math.min(i, c.content.length); o += 1) c.content[o][0] && s.push([c.content[o][0].obj, c.content[o][1]]);
			return s;
		}, this.balanceFactor = function() {
			function e(t) {
				return t === null ? 0 : Math.max(e(t.left), e(t.right)) + 1;
			}
			function t(e) {
				return e === null ? 0 : t(e.left) + t(e.right) + 1;
			}
			return e(r.root) / (Math.log(t(r.root)) / Math.log(2));
		};
	}
}, BinaryHeap = class {
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
		for (var t = this.content.length, n = 0; n < t; n++) if (this.content[n] == e) {
			var r = this.content.pop();
			n != t - 1 && (this.content[n] = r, this.scoreFunction(r) < this.scoreFunction(e) ? this.bubbleUp(n) : this.sinkDown(n));
			return;
		}
		throw Error("Node not found.");
	}
	size() {
		return this.content.length;
	}
	bubbleUp(e) {
		for (var t = this.content[e]; e > 0;) {
			var n = Math.floor((e + 1) / 2) - 1, r = this.content[n];
			if (this.scoreFunction(t) < this.scoreFunction(r)) this.content[n] = t, this.content[e] = r, e = n;
			else break;
		}
	}
	sinkDown(e) {
		for (var t = this.content.length, n = this.content[e], r = this.scoreFunction(n);;) {
			var i = (e + 1) * 2, a = i - 1, o = null;
			if (a < t) {
				var s = this.content[a], c = this.scoreFunction(s);
				c < r && (o = a);
			}
			if (i < t) {
				var l = this.content[i];
				this.scoreFunction(l) < (o == null ? r : c) && (o = i);
			}
			if (o != null) this.content[e] = this.content[o], this.content[o] = n, e = o;
			else break;
		}
	}
}, defaultBondRadius = .1, Setting$4 = class {
	constructor({ specie1: e, specie2: t, min: n = 0, max: r = 3, color1: i = "#3d82ed", color2: a = "#3d82ed", radius: o = defaultBondRadius, order: s = 1, type: c = 0 }) {
		this.specie1 = e, this.specie2 = t, this.min = n, this.max = r, this.color1 = convertColor$1(i), this.color2 = convertColor$1(a), this.radius = o, this.order = s, this.type = c;
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
}, BondManager = class {
	constructor(e, t = {}) {
		this.viewer = e, this.scene = this.viewer.tjs.scene, this.settings = {}, this.meshes = {}, this.shapeRegistry = this.viewer.weas.shapeRegistry, this.hideLongBonds = t.hideLongBonds ?? !0, this.showHydrogenBonds = t.showHydrogenBonds ?? !1, this.showOutBoundaryBonds = t.showOutBoundaryBonds ?? !1, this.bondRadius = .1, this.init();
		let n = this.viewer.state.get("bond") || {};
		n.hideLongBonds !== void 0 && (this.hideLongBonds = n.hideLongBonds), n.showHydrogenBonds !== void 0 && (this.showHydrogenBonds = n.showHydrogenBonds), n.showOutBoundaryBonds !== void 0 && (this.showOutBoundaryBonds = n.showOutBoundaryBonds), n.settings && this.applySettings(n.settings), this.viewer.state.subscribe("bond", (e) => {
			if (!e) return;
			let t = !1;
			e.hideLongBonds !== void 0 && e.hideLongBonds !== this.hideLongBonds && (this.hideLongBonds = e.hideLongBonds, t = !0), e.showHydrogenBonds !== void 0 && e.showHydrogenBonds !== this.showHydrogenBonds && (this.showHydrogenBonds = e.showHydrogenBonds, t = !0), e.showOutBoundaryBonds !== void 0 && e.showOutBoundaryBonds !== this.showOutBoundaryBonds && (this.showOutBoundaryBonds = e.showOutBoundaryBonds, t = !0), e.settings && (this.applySettings(e.settings), t = !0), t && !this.viewer._initializingState && this.viewer.requestRedraw?.("full");
		});
	}
	init() {
		this.viewer.logger.debug("init bond settings"), this.settings = {}, Object.entries(this.viewer.originalAtoms.species).forEach(([e, t]) => {
			Object.entries(this.viewer.originalAtoms.species).forEach(([n, r]) => {
				if (default_bond_pairs[t.element + "-" + r.element] === void 0) return;
				let i = e + "-" + n;
				this.settings[i] = this.getDefaultSetting(e, t, n, r);
			});
		});
	}
	reset() {
		this.meshes = {};
	}
	getDefaultSetting(e, t, n, r) {
		let i = this.viewer.atomManager.settings[e].color, a = this.viewer.atomManager.settings[n].color, o = this.viewer.atomManager.settings[e].radius, s = this.viewer.atomManager.settings[n].radius, c = 0, l = (o + s) * 1.1, u = default_bond_pairs[t.element + "-" + r.element][2];
		return u === 1 && (c = l + .4, l = c + 1, i = "#808080", a = "#808080"), new Setting$4({
			specie1: e,
			specie2: n,
			min: c,
			max: l,
			color1: i,
			color2: a,
			type: u
		});
	}
	setSettings(e) {
		this.viewer.state.set({ bond: { settings: cloneValue(e) } });
	}
	applySettings(e) {
		this.settings = {}, this.clearMeshes(), Object.values(e).forEach((e) => {
			this.addSetting(e);
		});
	}
	toPlainSettings() {
		let e = {};
		return Object.entries(this.settings).forEach(([t, n]) => {
			e[t] = n && typeof n.toDict == "function" ? n.toDict() : n;
		}), e;
	}
	addSetting({ specie1: e, specie2: t, radius: n, min: r = 0, max: i = 3, color1: a = "#3d82ed", color2: o = "#3d82ed", order: s = 1, type: c = 0 }) {
		let l = new Setting$4({
			specie1: e,
			specie2: t,
			radius: n,
			min: r,
			max: i,
			color1: a,
			color2: o,
			order: s,
			type: c
		}), u = e + "-" + t;
		this.settings[u] = l;
	}
	buildBondDict() {
		let e = {};
		Object.values(this.settings).forEach((t) => {
			let n = t.specie1, r = t.specie2, i = n + "-" + r;
			e[i] = t.toDict();
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
		let e = new THREE$1.Group(), t = [];
		for (let e = 0; e < this.viewer.modelSticks.length; e++) this.viewer.modelSticks[e] !== 0 && t.push([e, [
			0,
			0,
			0
		]]);
		let n = this.viewer.boundaryList || [];
		if (n.length > 0) for (let e = 0; e < n.length; e++) t.push(n[e]);
		this.bondList = buildBonds(this.viewer.originalAtoms, t, this.viewer.neighbors.map, this.viewer._boundary, this.viewer.modelSticks, this.showOutBoundaryBonds, this.viewer.logger), this.viewer.bondedAtoms.bonds.forEach((e) => {
			let t = this.viewer.originalAtoms.symbols[e[0]] + "-" + this.viewer.originalAtoms.symbols[e[1]];
			this.viewer.cutoffs[t] && this.bondList.push(e);
		}), this.viewer.debug && this.viewer.logger.debug("bondList: ", this.bondList), this.bondMap = buildBondMap(this.bondList, this.viewer.originalAtoms, this.settings, this.viewer.modelSticks);
		let r = null;
		this.viewer.colorBy !== "Element" && (r = this.viewer.atomColors);
		let i = drawStick({
			atoms: this.viewer.originalAtoms,
			bondList: this.bondList,
			bondIndices: this.bondMap.sticks,
			settings: this.viewer.cutoffs,
			radius: this.bondRadius,
			materialType: this.viewer._materialType,
			atomColors: r,
			withCap: !1,
			logger: this.viewer.logger,
			shapeRegistry: this.shapeRegistry
		}), { bondMesh: a, bondCap: o } = drawStick({
			atoms: this.viewer.originalAtoms,
			bondList: this.bondList,
			bondIndices: this.bondMap.stickCaps,
			settings: this.viewer.cutoffs,
			radius: this.bondRadius,
			materialType: this.viewer._materialType,
			atomColors: r,
			withCap: !0,
			logger: this.viewer.logger,
			shapeRegistry: this.shapeRegistry
		}), s;
		this.showHydrogenBonds && (s = drawLine(this.viewer.originalAtoms, this.bondList, this.bondMap.dashedLines, this.viewer.cutoffs, "dashed", r));
		let c = drawLine(this.viewer.originalAtoms, this.bondList, this.bondMap.stickCaps, this.viewer.cutoffs, "solid", r);
		return this.meshes = {
			stickBondMesh: i,
			stickCapBondMesh: a,
			stickCapBondCap: o,
			dashedBondLine: s,
			solidBondLine: c
		}, Object.values(this.meshes).forEach((t) => {
			t && e.add(t);
		}), e;
	}
	updateBondMesh(e = null, t = null) {
		this.updateBondStick(e, t, this.meshes.stickBondMesh, null, "sticks"), this.updateBondStick(e, t, this.meshes.stickCapBondMesh, this.meshes.stickCapBondCap, "stickCaps"), this.updateBondLine(e, t, this.meshes.dashedBondLine, "dashedLines"), this.updateBondLine(e, t, this.meshes.solidBondLine, "solidLines");
	}
	updateBondStick(e = null, t = null, n, r = null, i = "sticks") {
		if (!n) return;
		t === null && (t = this.viewer.originalAtoms);
		let a = [];
		if (e) {
			let t = this.bondMap.bondMap[e];
			t && t[i].forEach((e) => {
				a.push(e[0]);
			});
		} else a = this.bondMap[i].map((e, t) => t);
		a.forEach((e) => {
			let a = this.bondList[this.bondMap[i][e]], o = a[0], s = a[1], c = a[2], l = a[3], u = t.positions[o].map((e, n) => e + calculateCartesianCoordinates(t.cell, c)[n]), d = t.positions[s].map((e, n) => e + calculateCartesianCoordinates(t.cell, l)[n]);
			u = new THREE$1.Vector3(...u), d = new THREE$1.Vector3(...d);
			let f = new THREE$1.Vector3().lerpVectors(u, d, .25), p = t.symbols[o] + "-" + t.symbols[s];
			if (!this.viewer.cutoffs[p]) return;
			let m = this.viewer.cutoffs[p].max, h = calculateQuaternion(u, d), g = calculateScale(u, d, this.bondRadius, m, this.hideLongBonds), _ = new THREE$1.Matrix4().compose(f, h, g);
			n.setMatrixAt(e * 2, _);
			let v = new THREE$1.Vector3().lerpVectors(u, d, .75), y = new THREE$1.Matrix4().compose(v, h, g);
			if (n.setMatrixAt(e * 2 + 1, y), r) {
				let t = new THREE$1.Vector3(this.bondRadius, this.bondRadius, this.bondRadius), n = new THREE$1.Matrix4().compose(u, new THREE$1.Quaternion(), t);
				r.setMatrixAt(e * 2, n);
				let i = new THREE$1.Matrix4().compose(d, new THREE$1.Quaternion(), t);
				r.setMatrixAt(e * 2 + 1, i);
			}
		}), n.instanceMatrix.needsUpdate = !0, r && (r.instanceMatrix.needsUpdate = !0);
	}
	updateBondLine(e = null, t = null, n, r = "dashedLines") {
		if (!n) return;
		t === null && (t = this.viewer.originalAtoms);
		let i = [];
		if (e) {
			let t = this.bondMap.bondMap[e];
			t && t[r].forEach((e) => {
				i.push(e[0]);
			});
		} else i = this.bondMap[r].map((e, t) => t);
		let a = n.geometry.attributes.position, o = a.array;
		i.forEach((e) => {
			let n = this.bondList[this.bondMap[r][e]], i = n[0], a = n[1], s = n[2], c = n[3], l = t.positions[i].map((e, n) => e + calculateCartesianCoordinates(t.cell, s)[n]), u = t.positions[a].map((e, n) => e + calculateCartesianCoordinates(t.cell, c)[n]), d = t.symbols[i] + "-" + t.symbols[a];
			if (!this.settings[d]) return;
			l = new THREE$1.Vector3(...l), u = new THREE$1.Vector3(...u);
			let f = l.distanceTo(u);
			(f > this.settings[d].max || f < this.settings[d].min) && u.copy(l), o[e * 6] = l.x, o[e * 6 + 1] = l.y, o[e * 6 + 2] = l.z, o[e * 6 + 3] = u.x, o[e * 6 + 4] = u.y, o[e * 6 + 5] = u.z;
		}), a.needsUpdate = !0, n.geometry.computeBoundingBox(), n.geometry.computeBoundingSphere();
	}
};
function drawStick({ atoms: e, bondList: t, bondIndices: n, settings: r, radius: i = .1, materialType: a = "Standard", atomColors: o = null, withCap: s = !1, logger: c = console, shapeRegistry: l }) {
	let u = [
		[Infinity, 3],
		[1e4, 6],
		[2e3, 12],
		[500, 18],
		[100, 24]
	].find(([t]) => e.symbols.length > t)?.[1] ?? 24, d = l.create("Cylinder", {
		materialType: a,
		segments: u
	}), f = s ? l.create("Sphere", { materialType: a }) : null, p;
	if (d instanceof THREE$1.Mesh) p = d.geometry.clone(), d.material.clone();
	else throw Error("Cylinder shape must be a mesh");
	let m;
	if (f) if (f instanceof THREE$1.Mesh) m = f.geometry.clone();
	else throw Error("Sphere shape must be a mesh");
	let h = d.material.clone();
	h.color.set(16777215), h.transparent = !0;
	let g = performance.now(), _ = new THREE$1.InstancedMesh(p, h, n.length * 2), v = s ? new THREE$1.InstancedMesh(m, h, n.length * 2) : null, y = new THREE$1.Vector3(), b = new THREE$1.Vector3(), x = new THREE$1.Vector3(), w = new THREE$1.Vector3(), T = new THREE$1.Matrix4();
	for (let a = 0; a < n.length; a++) {
		let [c, l, u, d] = t[n[a]], f = e.positions[c].map((t, n) => t + calculateCartesianCoordinates(e.cell, u)[n]);
		y.set(...f);
		let p = e.positions[l].map((t, n) => t + calculateCartesianCoordinates(e.cell, d)[n]);
		b.set(...p);
		let m = e.symbols[c] + "-" + e.symbols[l], h = o ? o[c] : r[m].color1, g = o ? o[l] : r[m].color2;
		x.lerpVectors(y, b, .25), w.lerpVectors(y, b, .75);
		let E = calculateQuaternion(y, b), k = calculateScale(y, b, i);
		if (T.compose(x, E, k), _.setMatrixAt(a * 2, T), _.setColorAt(a * 2, h), T.compose(w, E, k), _.setMatrixAt(a * 2 + 1, T), _.setColorAt(a * 2 + 1, g), s) {
			let e = new THREE$1.Vector3(i, i, i), t = new THREE$1.Matrix4().compose(y, new THREE$1.Quaternion(), e);
			v.setMatrixAt(a * 2, t), v.setColorAt(a * 2, h);
			let n = new THREE$1.Matrix4().compose(b, new THREE$1.Quaternion(), e);
			v.setMatrixAt(a * 2 + 1, n), v.setColorAt(a * 2 + 1, g);
		}
	}
	_.userData.type = "bond", _.userData.uuid = e.uuid, _.userData.objectMode = "edit", v && (v.userData.type = "bond", v.userData.uuid = e.uuid, v.userData.objectMode = "edit");
	let E = performance.now();
	return c.debug("drawStick Time: ", E - g), s ? {
		bondMesh: _,
		bondCap: v
	} : _;
}
function drawLine(e, t, n, r, i = "dashed", a = null) {
	if (n === void 0 || n.length === 0) return null;
	let o = [], s = [];
	n.forEach((n) => {
		let [i, a, c, l] = t[n];
		var u = e.positions[i].map((t, n) => t + calculateCartesianCoordinates(e.cell, c)[n]);
		u = new THREE$1.Vector3(...u);
		var d = e.positions[a].map((t, n) => t + calculateCartesianCoordinates(e.cell, l)[n]);
		d = new THREE$1.Vector3(...d), o.push(u.x, u.y, u.z), o.push(d.x, d.y, d.z);
		let f = e.symbols[i] + "-" + e.symbols[a], p = r[f].color1, m = r[f].color2;
		s.push(p.r, p.g, p.b), s.push(m.r, m.g, m.b);
	});
	let c = new THREE$1.BufferGeometry();
	c.setAttribute("position", new THREE$1.Float32BufferAttribute(o, 3)), c.setAttribute("color", new THREE$1.Float32BufferAttribute(s, 3));
	let l;
	l = i === "dashed" ? new THREE$1.LineDashedMaterial({
		color: 16777215,
		vertexColors: !0,
		dashSize: .1,
		gapSize: .1,
		linewidth: 3
	}) : new THREE$1.LineBasicMaterial({
		color: 16777215,
		vertexColors: !0,
		linewidth: 3
	});
	let u = new THREE$1.LineSegments(c, l);
	return u.computeLineDistances(), u.userData.type = "bond", u.userData.uuid = e.uuid, u.userData.objectMode = "edit", u;
}
function calculateScale(e, t, n, r = null, i = !0) {
	let a = e.distanceTo(t);
	return i && r !== null && a > r && (n = 0), new THREE$1.Vector3(n, a / 2, n);
}
function searchBondedAtoms(e, t, n, r) {
	let i = [], a = [];
	return t.forEach((t) => {
		let o = t[0];
		if (r[o] === 0 || !elementsWithPolyhedra.includes(e[o])) return;
		let s = t[1], c = n.map[o];
		c !== void 0 && c.forEach((e) => {
			let t = e[0], n = e[1];
			if (r[t] === 0) return;
			let c = [
				s[0] + n[0],
				s[1] + n[1],
				s[2] + n[2]
			];
			if (c[0] != 0 || c[1] != 0 || c[2] != 0) {
				let e = [t, c];
				i.push(e), a.push([
					o,
					t,
					s,
					c
				]), a.push([
					t,
					o,
					c,
					s
				]);
			}
		});
	}), {
		atoms: i,
		bonds: a
	};
}
function buildBonds(e, t, n, r, i, a = !1, o = console) {
	let s = performance.now(), c = [];
	if (e.isUndefinedCell()) for (let e = 0; e < t.length; e++) {
		let r = t[e][0], a = t[e][1], o = n[r];
		if (!(i[r] === 0 || o === void 0)) for (let e = 0; e < o.length; e++) {
			let t = o[e][0];
			if (i[t] === 0) continue;
			let n = o[e][1], s = a.map((e, t) => e + n[t]);
			c.push([
				r,
				t,
				a,
				s
			]);
		}
	}
	else {
		let o = e.calculateFractionalCoordinates();
		for (let e = 0; e < t.length; e++) {
			let s = t[e][0], l = t[e][1], u = n[s];
			if (!(i[s] === 0 || u === void 0)) for (let e = 0; e < u.length; e++) {
				let t = u[e][0];
				if (i[t] === 0) continue;
				let n = u[e][1], d = l.map((e, t) => e + n[t]), f = o[t].map((e, t) => e + d[t]);
				if (a) {
					c.push([
						s,
						t,
						l,
						d
					]);
					continue;
				} else r[0][0] <= f[0] && f[0] <= r[0][1] && r[1][0] <= f[1] && f[1] <= r[1][1] && r[2][0] <= f[2] && f[2] <= r[2][1] && c.push([
					s,
					t,
					l,
					d
				]);
			}
		}
	}
	let l = performance.now();
	return o.debug("buildBonds Time: ", l - s), c;
}
function buildBondMap(e, t, n, r) {
	let i = {}, a = {}, o = [], s = [], c = [], l = [], u = [];
	for (let d = 0; d < e.length; d++) {
		let f = e[d], [p, m] = f;
		i[p] || (i[p] = {
			atomIndex: p,
			sticks: [],
			stickCaps: [],
			dashedLines: [],
			solidLines: [],
			springs: []
		}), i[m] || (i[m] = {
			atomIndex: m,
			sticks: [],
			stickCaps: [],
			dashedLines: [],
			solidLines: [],
			springs: []
		});
		let h = p + "-" + f[2].join("-");
		a[h] || (a[h] = {
			atomIndex: p,
			offset: f[2],
			sticks: [],
			stickCaps: [],
			dashedLines: [],
			solidLines: [],
			springs: []
		});
		let g = m + "-" + f[3].join("-");
		a[g] || (a[g] = {
			atomIndex: m,
			offset: f[3],
			sticks: [],
			stickCaps: [],
			dashedLines: [],
			solidLines: [],
			springs: []
		});
		let _ = t.symbols[p] + "-" + t.symbols[m], v;
		v = r[p] <= 2 ? n[_].type : r[p], v === 0 ? (o.push(d), i[p].sticks.push([o.length - 1, !0]), i[m].sticks.push([o.length - 1, !1]), a[h].sticks.push([o.length - 1, !0]), a[g].sticks.push([o.length - 1, !1])) : v === 1 ? (c.push(d), i[p].dashedLines.push([c.length - 1, !0]), i[m].dashedLines.push([c.length - 1, !1]), a[h].dashedLines.push([c.length - 1, !0]), a[g].dashedLines.push([c.length - 1, !1])) : v === 2 ? (u.push(d), i[p].springs.push([u.length - 1, !0]), i[m].springs.push([u.length - 1, !1]), a[h].springs.push([u.length - 1, !0]), a[g].springs.push([u.length - 1, !1])) : v === 3 ? (s.push(d), i[p].stickCaps.push([s.length - 1, !0]), i[m].stickCaps.push([s.length - 1, !1]), a[h].stickCaps.push([s.length - 1, !0]), a[g].stickCaps.push([s.length - 1, !1])) : v === 4 && (l.push(d), i[p].solidLines.push([l.length - 1, !0]), i[m].solidLines.push([l.length - 1, !1]), a[h].solidLines.push([l.length - 1, !0]), a[g].solidLines.push([l.length - 1, !1]));
	}
	return {
		bondMap: i,
		bondMapWithOffset: a,
		sticks: o,
		stickCaps: s,
		dashedLines: c,
		solidLines: l,
		springs: u
	};
}
function findNeighbors(e, t, n = !1, r = !0, i = console) {
	let a = performance.now(), o = e.positions.map((e, t) => [t, [
		0,
		0,
		0
	]]), s, c = Math.max(...Object.values(t).map((e) => e.max));
	if (r) {
		let t = e.getCellLengthsAndAngles();
		s = searchBoundary(e, [
			[-c / t[0], 1 + c / t[0]],
			[-c / t[1], 1 + c / t[1]],
			[-c / t[2], 1 + c / t[2]]
		]);
	}
	o = o.concat(s);
	let l = [], u = {};
	var d = function(e, t) {
		return (e.x - t.x) ** 2 + (e.y - t.y) ** 2 + (e.z - t.z) ** 2;
	};
	let f = o.map((t) => {
		let n = e.positions[t[0]], r = calculateCartesianCoordinates(e.cell, t[1]);
		return [
			n[0] + r[0],
			n[1] + r[1],
			n[2] + r[2]
		];
	}), p = new kdTree(f.map((e, t) => ({
		x: e[0],
		y: e[1],
		z: e[2],
		index: t
	})), d, [
		"x",
		"y",
		"z"
	]);
	o.forEach(([r, i], a) => {
		let s = e.symbols[r];
		covalentRadii[s] * 1.1;
		let d = f[a], m = {
			x: f[a][0],
			y: f[a][1],
			z: f[a][2]
		};
		p.nearest(m, 24, c ** 2).forEach((c) => {
			let p = c[0].index;
			if (a == p) return;
			let m = o[p][1];
			if (i.some((e) => e !== 0) && m.some((e) => e !== 0)) return;
			let h = o[p][0];
			if (!n && r == h) return;
			let g = s + "-" + e.symbols[h];
			if (!t[g]) return;
			let _ = f[p], v = calculateDistance(d, _);
			if (v < t[g].max && v > t[g].min) {
				let e = m.map((e, t) => e - i[t]);
				l.push([
					r,
					h,
					e
				]), u[r] ? u[r].some(([t, n]) => t === h && n.every((t, n) => t === e[n])) || u[r].push([h, e]) : u[r] = [[h, e]];
			}
		});
	});
	let m = performance.now();
	return i.info(`findNeighbors completed in ${(m - a).toFixed(2)} ms`), {
		list: l,
		map: u
	};
}
function calculateDistance(e, t) {
	return Math.sqrt((e[0] - t[0]) ** 2 + (e[1] - t[1]) ** 2 + (e[2] - t[2]) ** 2);
}
//#endregion
//#region node_modules/three/examples/jsm/math/ConvexHull.js
var Visible = 0, Deleted = 1, _v1 = new Vector3(), _line3 = new Line3(), _plane = new Plane(), _closestPoint = new Vector3(), _triangle = new Triangle(), ConvexHull = class {
	constructor() {
		this.tolerance = -1, this.faces = [], this.newFaces = [], this.assigned = new VertexList(), this.unassigned = new VertexList(), this.vertices = [];
	}
	setFromPoints(e) {
		if (e.length >= 4) {
			this.makeEmpty();
			for (let t = 0, n = e.length; t < n; t++) this.vertices.push(new VertexNode(e[t]));
			this.compute();
		}
		return this;
	}
	setFromObject(e) {
		let t = [];
		return e.updateMatrixWorld(!0), e.traverse(function(e) {
			let n = e.geometry;
			if (n !== void 0) {
				let r = n.attributes.position;
				if (r !== void 0) for (let n = 0, i = r.count; n < i; n++) {
					let i = new Vector3();
					i.fromBufferAttribute(r, n).applyMatrix4(e.matrixWorld), t.push(i);
				}
			}
		}), this.setFromPoints(t);
	}
	containsPoint(e) {
		let t = this.faces;
		for (let n = 0, r = t.length; n < r; n++) if (t[n].distanceToPoint(e) > this.tolerance) return !1;
		return !0;
	}
	intersectRay(e, t) {
		let n = this.faces, r = -Infinity, i = Infinity;
		for (let t = 0, a = n.length; t < a; t++) {
			let a = n[t], o = a.distanceToPoint(e.origin), s = a.normal.dot(e.direction);
			if (o > 0 && s >= 0) return null;
			let c = s === 0 ? 0 : -o / s;
			if (!(c <= 0) && (s > 0 ? i = Math.min(c, i) : r = Math.max(c, r), r > i)) return null;
		}
		return r === -Infinity ? e.at(i, t) : e.at(r, t), t;
	}
	intersectsRay(e) {
		return this.intersectRay(e, _v1) !== null;
	}
	makeEmpty() {
		return this.faces = [], this.vertices = [], this;
	}
	addVertexToFace(e, t) {
		return e.face = t, t.outside === null ? this.assigned.append(e) : this.assigned.insertBefore(t.outside, e), t.outside = e, this;
	}
	removeVertexFromFace(e, t) {
		return e === t.outside && (e.next !== null && e.next.face === t ? t.outside = e.next : t.outside = null), this.assigned.remove(e), this;
	}
	removeAllVerticesFromFace(e) {
		if (e.outside !== null) {
			let t = e.outside, n = e.outside;
			for (; n.next !== null && n.next.face === e;) n = n.next;
			return this.assigned.removeSubList(t, n), t.prev = n.next = null, e.outside = null, t;
		}
	}
	deleteFaceVertices(e, t) {
		let n = this.removeAllVerticesFromFace(e);
		if (n !== void 0) if (t === void 0) this.unassigned.appendChain(n);
		else {
			let e = n;
			do {
				let n = e.next;
				t.distanceToPoint(e.point) > this.tolerance ? this.addVertexToFace(e, t) : this.unassigned.append(e), e = n;
			} while (e !== null);
		}
		return this;
	}
	resolveUnassignedPoints(e) {
		if (this.unassigned.isEmpty() === !1) {
			let t = this.unassigned.first();
			do {
				let n = t.next, r = this.tolerance, i = null;
				for (let n = 0; n < e.length; n++) {
					let a = e[n];
					if (a.mark === Visible) {
						let e = a.distanceToPoint(t.point);
						if (e > r && (r = e, i = a), r > 1e3 * this.tolerance) break;
					}
				}
				i !== null && this.addVertexToFace(t, i), t = n;
			} while (t !== null);
		}
		return this;
	}
	computeExtremes() {
		let e = new Vector3(), t = new Vector3(), n = [], r = [];
		for (let e = 0; e < 3; e++) n[e] = r[e] = this.vertices[0];
		e.copy(this.vertices[0].point), t.copy(this.vertices[0].point);
		for (let i = 0, a = this.vertices.length; i < a; i++) {
			let a = this.vertices[i], o = a.point;
			for (let t = 0; t < 3; t++) o.getComponent(t) < e.getComponent(t) && (e.setComponent(t, o.getComponent(t)), n[t] = a);
			for (let e = 0; e < 3; e++) o.getComponent(e) > t.getComponent(e) && (t.setComponent(e, o.getComponent(e)), r[e] = a);
		}
		return this.tolerance = 3 * 2 ** -52 * (Math.max(Math.abs(e.x), Math.abs(t.x)) + Math.max(Math.abs(e.y), Math.abs(t.y)) + Math.max(Math.abs(e.z), Math.abs(t.z))), {
			min: n,
			max: r
		};
	}
	computeInitialHull() {
		let e = this.vertices, t = this.computeExtremes(), n = t.min, r = t.max, i = 0, a = 0;
		for (let e = 0; e < 3; e++) {
			let t = r[e].point.getComponent(e) - n[e].point.getComponent(e);
			t > i && (i = t, a = e);
		}
		let o = n[a], s = r[a], c, l;
		i = 0, _line3.set(o.point, s.point);
		for (let t = 0, n = this.vertices.length; t < n; t++) {
			let n = e[t];
			if (n !== o && n !== s) {
				_line3.closestPointToPoint(n.point, !0, _closestPoint);
				let e = _closestPoint.distanceToSquared(n.point);
				e > i && (i = e, c = n);
			}
		}
		i = -1, _plane.setFromCoplanarPoints(o.point, s.point, c.point);
		for (let t = 0, n = this.vertices.length; t < n; t++) {
			let n = e[t];
			if (n !== o && n !== s && n !== c) {
				let e = Math.abs(_plane.distanceToPoint(n.point));
				e > i && (i = e, l = n);
			}
		}
		let u = [];
		if (_plane.distanceToPoint(l.point) < 0) {
			u.push(Face.create(o, s, c), Face.create(l, s, o), Face.create(l, c, s), Face.create(l, o, c));
			for (let e = 0; e < 3; e++) {
				let t = (e + 1) % 3;
				u[e + 1].getEdge(2).setTwin(u[0].getEdge(t)), u[e + 1].getEdge(1).setTwin(u[t + 1].getEdge(0));
			}
		} else {
			u.push(Face.create(o, c, s), Face.create(l, o, s), Face.create(l, s, c), Face.create(l, c, o));
			for (let e = 0; e < 3; e++) {
				let t = (e + 1) % 3;
				u[e + 1].getEdge(2).setTwin(u[0].getEdge((3 - e) % 3)), u[e + 1].getEdge(0).setTwin(u[t + 1].getEdge(1));
			}
		}
		for (let e = 0; e < 4; e++) this.faces.push(u[e]);
		for (let t = 0, n = e.length; t < n; t++) {
			let n = e[t];
			if (n !== o && n !== s && n !== c && n !== l) {
				i = this.tolerance;
				let e = null;
				for (let t = 0; t < 4; t++) {
					let r = this.faces[t].distanceToPoint(n.point);
					r > i && (i = r, e = this.faces[t]);
				}
				e !== null && this.addVertexToFace(n, e);
			}
		}
		return this;
	}
	reindexFaces() {
		let e = [];
		for (let t = 0; t < this.faces.length; t++) {
			let n = this.faces[t];
			n.mark === Visible && e.push(n);
		}
		return this.faces = e, this;
	}
	nextVertexToAdd() {
		if (this.assigned.isEmpty() === !1) {
			let e, t = 0, n = this.assigned.first().face, r = n.outside;
			do {
				let i = n.distanceToPoint(r.point);
				i > t && (t = i, e = r), r = r.next;
			} while (r !== null && r.face === n);
			return e;
		}
	}
	computeHorizon(e, t, n, r) {
		this.deleteFaceVertices(n), n.mark = Deleted;
		let i;
		i = t === null ? t = n.getEdge(0) : t.next;
		do {
			let t = i.twin, n = t.face;
			n.mark === Visible && (n.distanceToPoint(e) > this.tolerance ? this.computeHorizon(e, t, n, r) : r.push(i)), i = i.next;
		} while (i !== t);
		return this;
	}
	addAdjoiningFace(e, t) {
		let n = Face.create(e, t.tail(), t.head());
		return this.faces.push(n), n.getEdge(-1).setTwin(t.twin), n.getEdge(0);
	}
	addNewFaces(e, t) {
		this.newFaces = [];
		let n = null, r = null;
		for (let i = 0; i < t.length; i++) {
			let a = t[i], o = this.addAdjoiningFace(e, a);
			n === null ? n = o : o.next.setTwin(r), this.newFaces.push(o.face), r = o;
		}
		return n.next.setTwin(r), this;
	}
	addVertexToHull(e) {
		let t = [];
		return this.unassigned.clear(), this.removeVertexFromFace(e, e.face), this.computeHorizon(e.point, null, e.face, t), this.addNewFaces(e, t), this.resolveUnassignedPoints(this.newFaces), this;
	}
	cleanup() {
		return this.assigned.clear(), this.unassigned.clear(), this.newFaces = [], this;
	}
	compute() {
		let e;
		for (this.computeInitialHull(); (e = this.nextVertexToAdd()) !== void 0;) this.addVertexToHull(e);
		return this.reindexFaces(), this.cleanup(), this;
	}
}, Face = class e {
	constructor() {
		this.normal = new Vector3(), this.midpoint = new Vector3(), this.area = 0, this.constant = 0, this.outside = null, this.mark = Visible, this.edge = null;
	}
	static create(t, n, r) {
		let i = new e(), a = new HalfEdge(t, i), o = new HalfEdge(n, i), s = new HalfEdge(r, i);
		return a.next = s.prev = o, o.next = a.prev = s, s.next = o.prev = a, i.edge = a, i.compute();
	}
	getEdge(e) {
		let t = this.edge;
		for (; e > 0;) t = t.next, e--;
		for (; e < 0;) t = t.prev, e++;
		return t;
	}
	compute() {
		let e = this.edge.tail(), t = this.edge.head(), n = this.edge.next.head();
		return _triangle.set(e.point, t.point, n.point), _triangle.getNormal(this.normal), _triangle.getMidpoint(this.midpoint), this.area = _triangle.getArea(), this.constant = this.normal.dot(this.midpoint), this;
	}
	distanceToPoint(e) {
		return this.normal.dot(e) - this.constant;
	}
}, HalfEdge = class {
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
		let e = this.head(), t = this.tail();
		return t === null ? -1 : t.point.distanceTo(e.point);
	}
	lengthSquared() {
		let e = this.head(), t = this.tail();
		return t === null ? -1 : t.point.distanceToSquared(e.point);
	}
	setTwin(e) {
		return this.twin = e, e.twin = this, this;
	}
}, VertexNode = class {
	constructor(e) {
		this.point = e, this.prev = null, this.next = null, this.face = null;
	}
}, VertexList = class {
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
	insertBefore(e, t) {
		return t.prev = e.prev, t.next = e, t.prev === null ? this.head = t : t.prev.next = t, e.prev = t, this;
	}
	insertAfter(e, t) {
		return t.prev = e, t.next = e.next, t.next === null ? this.tail = t : t.next.prev = t, e.next = t, this;
	}
	append(e) {
		return this.head === null ? this.head = e : this.tail.next = e, e.prev = this.tail, e.next = null, this.tail = e, this;
	}
	appendChain(e) {
		for (this.head === null ? this.head = e : this.tail.next = e, e.prev = this.tail; e.next !== null;) e = e.next;
		return this.tail = e, this;
	}
	remove(e) {
		return e.prev === null ? this.head = e.next : e.prev.next = e.next, e.next === null ? this.tail = e.prev : e.next.prev = e.prev, this;
	}
	removeSubList(e, t) {
		return e.prev === null ? this.head = t.next : e.prev.next = t.next, t.next === null ? this.tail = e.prev : t.next.prev = e.prev, this;
	}
	isEmpty() {
		return this.head === null;
	}
}, defaultColor = 16777215, Setting$3 = class {
	constructor({ symbol: e, color: t = "#3d82ed", show_edge: n = !1 }) {
		this.symbol = e, this.color = convertColor$1(t), this.show_edge = n;
	}
	toDict() {
		return {
			symbol: this.symbol,
			color: this.color,
			show_edge: this.show_edge
		};
	}
}, PolyhedraManager = class {
	constructor(e) {
		this.viewer = e, this.scene = this.viewer.tjs.scene, this.settings = [], this.mesh = null, this.allVertices = [], this.allNormals = [], this.allColors = [], this.init(), this.materialsRegistry = this.viewer.weas.materialsRegistry;
		let t = this.viewer.state.get("plugins.polyhedra");
		t && Array.isArray(t.settings) && t.settings.length > 0 && this.applySettings(t.settings), this.viewer.state.subscribe("plugins.polyhedra", (e) => {
			if (!e || this.viewer._initializingState) return;
			let t = Array.isArray(e.settings) ? e.settings : [];
			this.applySettings(t), this.refreshMesh();
		});
	}
	init() {
		this.viewer.logger.debug("init PolyhedraManager"), this.settings = [], this.viewer.atoms, Object.entries(this.viewer.originalAtoms.species).forEach(([e, t]) => {
			if (!elementsWithPolyhedra.includes(t.element)) return;
			let n = elementColors[this.viewer.colorType][t.element], r = new Setting$3({
				symbol: e,
				color: n
			});
			this.settings.push(r);
		});
	}
	setSettings(e) {
		this.viewer.state.set({ plugins: { polyhedra: { settings: cloneValue(e) } } });
	}
	applySettings(e) {
		this.settings = [], this.clearMeshes(), e.forEach((e) => {
			this.addSetting(e);
		});
	}
	toPlainSettings() {
		return this.settings.map((e) => e && typeof e.toDict == "function" ? e.toDict() : e);
	}
	addSetting({ symbol: e, color: t = "#3d82ed", show_edge: n = !1 }) {
		let r = new Setting$3({
			symbol: e,
			color: t,
			show_edge: n
		});
		this.settings.push(r);
	}
	buildPolyhedraDict() {
		let e = {};
		return this.settings.forEach((t) => {
			e[t.symbol] = t.toDict();
		}), e;
	}
	clearMeshes() {
		this.allVertices = [], this.allNormals = [], this.allColors = [], this.mesh && this.mesh.parent && this.mesh.parent.remove(this.mesh), clearObject(this.scene, this.mesh), this.mesh = null;
	}
	drawPolyhedras() {
		this.clearMeshes();
		let e = filterBondMap(this.viewer.bondManager.bondMap.bondMapWithOffset, this.viewer.atoms.symbols, elementsWithPolyhedra, this.viewer.modelPolyhedras);
		this.viewer.logger.debug("polyhedras: ", e), this.buildPolyhedras(this.viewer.atoms, e, this.viewer.bondManager.bondList, this.viewer._colorType, this.viewer._materialType);
		let t = this.drawPolyhedraMesh(this.viewer.atoms, this.viewer._materialType);
		return this.mesh = t, t;
	}
	refreshMesh() {
		let e = this.viewer.atomManager.meshes.atom;
		if (!e) return;
		let t = this.drawPolyhedras();
		t && (e.add(t), this.viewer.requestRedraw?.("render"));
	}
	buildPolyhedras(e, t, n, r = "CPK", i = "standard") {
		let a = [], o = [], s = [], c = {};
		for (let i of Object.keys(t)) {
			let d = t[i], f = [], p;
			for (let t of d.sticks) {
				let r = n[t[0]];
				if (t[1]) var l = r[1], u = r[3];
				else var l = r[0], u = r[2];
				p = e.positions[l].map((t, n) => t + calculateCartesianCoordinates(e.cell, u)[n]);
				let i = new THREE$1.Vector3(...p);
				i.atomIndex = l, i.offset = u, f.push(i);
			}
			if (f.length < 4) {
				console.warn(`Skipping polyhedron with key "${i}" due to insufficient vertices.`);
				continue;
			}
			try {
				let { hull: t, vertices: n, normals: i, indices: l, offsets: u } = calculateConvexHull(f);
				a.push(...n), o.push(...i);
				let p = e.symbols[d.atomIndex], m = elementColors[r][p] || defaultColor, h = new THREE$1.Color(m);
				for (let e = 0; e < n.length / 3; e++) s.push(h.r, h.g, h.b);
				l.forEach((e, t) => {
					let r = l[t], i = u[t];
					c[r] === void 0 && (c[r] = []), c[r].push([a.length / 3 - n.length / 3 + t, i]);
				});
			} catch (e) {
				console.warn(`Skipping polyhedron with key "${i}" due to ConvexGeometry error:`, e);
				continue;
			}
		}
		this.allVertices = a, this.allNormals = o, this.allColors = s, this.vertexAtomMap = c;
	}
	drawPolyhedraMesh(e, t = "standard") {
		let n = this.materialsRegistry.getMaterial(t, !0);
		n.transparent = !0, n.opacity = .5, n.vertexColors = !0, n.side = THREE$1.DoubleSide, n.depthWrite = !1, n.depthTest = !0;
		let r = new THREE$1.BufferGeometry();
		r.setAttribute("position", new THREE$1.Float32BufferAttribute(this.allVertices, 3)), r.setAttribute("normal", new THREE$1.Float32BufferAttribute(this.allNormals, 3)), r.setAttribute("color", new THREE$1.Float32BufferAttribute(this.allColors, 3));
		let i = new THREE$1.Mesh(r, n);
		return i.userData.type = "polyhedra", i.userData.uuid = e.uuid, i.userData.objectMode = "edit", i.userData.notSelectable = !0, i.layers.set(1), i.renderOrder = 400, i;
	}
	updatePolyhedraMesh(e = null, t = null) {
		var n = [];
		n = e === null ? Object.keys(this.vertexAtomMap) : [e], t === null && (t = this.viewer.atoms), n.forEach((e) => {
			let n = this.vertexAtomMap[e];
			n !== void 0 && n.forEach(([n, r]) => {
				let i = t.positions[e].map((e, n) => e + calculateCartesianCoordinates(t.cell, r)[n]);
				this.allVertices[n * 3] = i[0], this.allVertices[n * 3 + 1] = i[1], this.allVertices[n * 3 + 2] = i[2];
			});
		}), this.mesh.geometry.setAttribute("position", new THREE$1.Float32BufferAttribute(this.allVertices, 3)), this.mesh.geometry.attributes.position.needsUpdate = !0, this.mesh.geometry.computeVertexNormals();
	}
};
function filterBondMap(e, t, n, r) {
	let i = {};
	return Object.keys(e).forEach((a) => {
		let o = e[a].atomIndex, s = e[a].sticks.length, c = t[o];
		r[o] && s >= 4 && n.includes(c) && (i[a] = e[a]);
	}), i;
}
function calculateConvexHull(e) {
	for (var t = [], n = [], r = [], i = [], a = [], o = new ConvexHull().setFromPoints(e), t = o.faces, s = 0; s < t.length; s++) {
		var c = t[s], l = c.edge;
		do {
			var u = l.head().point;
			n.push(u.x, u.y, u.z), i.push(u.atomIndex), a.push(u.offset), r.push(c.normal.x, c.normal.y, c.normal.z), l = l.next;
		} while (l !== c.edge);
	}
	return {
		hull: o,
		vertices: n,
		normals: r,
		indices: i,
		offsets: a
	};
}
//#endregion
//#region src/atoms/plugins/atomLabel.js
var DEFAULT_LABEL_SETTING = {
	origins: [],
	texts: [],
	selection: null,
	color: "#000000ff",
	fontSize: .05,
	className: "atom-label",
	renderMode: "glyph",
	shift: [
		0,
		0,
		0
	]
}, AtomLabelManager = class {
	constructor(e) {
		this.viewer = e, this.scene = this.viewer.tjs.scene, this.settings = [], this.overlaySettings = [], this.labels = [], this.textManager = this.viewer.weas.textManager;
		let t = this.viewer.state.get("plugins.atomLabel");
		t && Array.isArray(t.settings) && (this.applySettings(t.settings, t.overlaySettings), this.drawAtomLabels()), this.viewer.state.subscribe("plugins.atomLabel", (e) => {
			if (!e) return;
			let t = Array.isArray(e.settings) ? e.settings : [], n = Array.isArray(e.overlaySettings) ? e.overlaySettings : [];
			this.applySettings(t, n), !this.viewer._initializingState && this.drawAtomLabels();
		});
	}
	setSettings(e) {
		let t = this.viewer.state.get("plugins.atomLabel")?.overlaySettings || [];
		this.viewer.state.set({ plugins: { atomLabel: {
			settings: cloneValue(e),
			overlaySettings: cloneValue(t)
		} } });
	}
	setOverlaySettings(e) {
		let t = this.viewer.state.get("plugins.atomLabel")?.settings || [];
		this.viewer.state.set({ plugins: { atomLabel: {
			settings: cloneValue(t),
			overlaySettings: cloneValue(e)
		} } });
	}
	applySettings(e, t = []) {
		this.settings = [], this.overlaySettings = [], this.clearLabels(this.labels), e.forEach((e) => {
			this.addSetting(e);
		}), t.forEach((e) => {
			this.addOverlaySetting(e);
		});
	}
	addSetting(e) {
		this.settings.push((0, import_lodash_merge.default)({}, DEFAULT_LABEL_SETTING, e));
	}
	addOverlaySetting(e) {
		this.overlaySettings.push((0, import_lodash_merge.default)({}, DEFAULT_LABEL_SETTING, e));
	}
	clearLabels(e) {
		let t = e || this.labels;
		this.textManager.clearLabels(t), this.labels = [];
	}
	drawAtomLabels() {
		this.clearLabels();
		let e = [...this.settings, ...this.overlaySettings];
		for (let t = 0; t < e.length; t++) {
			let n = e[t], r = n.selection || Array.from({ length: this.viewer.atoms.getAtomsCount() }, (e, t) => t), i = n.origins, a = n.texts;
			if (typeof i == "string") {
				let e = this.viewer.atoms.getAttribute(i);
				i = r.map((t) => e[t]);
			}
			if (typeof a == "string") {
				let e = this.viewer.atoms.getAttribute(a);
				a = r.map((t) => e[t]);
			}
			for (let e = 0; e < i.length; e++) {
				let t = this.getAtomRadiusScale(e), o = this.textManager.addLabel({
					text: a[e],
					position: i[e],
					color: n.color,
					fontSize: t * 30,
					className: n.className,
					renderMode: n.renderMode
				});
				o.userData.atomIndex = r[e], this.labels.push(o);
			}
		}
	}
	updateLabelPositions(e = null) {
		let t = e || this.viewer.atoms;
		if (!(!t || !this.labels || this.labels.length === 0)) for (let e = 0; e < this.labels.length; e++) {
			let n = this.labels[e], r = n.userData?.atomIndex;
			if (r == null) continue;
			let i = t.positions[r];
			i && n.position.set(i[0], i[1], i[2]);
		}
	}
	getAtomRadiusScale(e) {
		if (e == null) return null;
		let t = this.viewer.atomManager?.meshes?.atom;
		if (!t || typeof t.getMatrixAt != "function") return null;
		let n = new THREE$1.Matrix4(), r = new THREE$1.Vector3(), i = new THREE$1.Quaternion(), a = new THREE$1.Vector3();
		return t.getMatrixAt(e, n), n.decompose(r, i, a), a.x || a.y || a.z || null;
	}
}, edgeTable = new Uint32Array([
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
]), triTable = [
	[],
	[
		0,
		8,
		3
	],
	[
		0,
		1,
		9
	],
	[
		1,
		8,
		3,
		9,
		8,
		1
	],
	[
		1,
		2,
		10
	],
	[
		0,
		8,
		3,
		1,
		2,
		10
	],
	[
		9,
		2,
		10,
		0,
		2,
		9
	],
	[
		2,
		8,
		3,
		2,
		10,
		8,
		10,
		9,
		8
	],
	[
		3,
		11,
		2
	],
	[
		0,
		11,
		2,
		8,
		11,
		0
	],
	[
		1,
		9,
		0,
		2,
		3,
		11
	],
	[
		1,
		11,
		2,
		1,
		9,
		11,
		9,
		8,
		11
	],
	[
		3,
		10,
		1,
		11,
		10,
		3
	],
	[
		0,
		10,
		1,
		0,
		8,
		10,
		8,
		11,
		10
	],
	[
		3,
		9,
		0,
		3,
		11,
		9,
		11,
		10,
		9
	],
	[
		9,
		8,
		10,
		10,
		8,
		11
	],
	[
		4,
		7,
		8
	],
	[
		4,
		3,
		0,
		7,
		3,
		4
	],
	[
		0,
		1,
		9,
		8,
		4,
		7
	],
	[
		4,
		1,
		9,
		4,
		7,
		1,
		7,
		3,
		1
	],
	[
		1,
		2,
		10,
		8,
		4,
		7
	],
	[
		3,
		4,
		7,
		3,
		0,
		4,
		1,
		2,
		10
	],
	[
		9,
		2,
		10,
		9,
		0,
		2,
		8,
		4,
		7
	],
	[
		2,
		10,
		9,
		2,
		9,
		7,
		2,
		7,
		3,
		7,
		9,
		4
	],
	[
		8,
		4,
		7,
		3,
		11,
		2
	],
	[
		11,
		4,
		7,
		11,
		2,
		4,
		2,
		0,
		4
	],
	[
		9,
		0,
		1,
		8,
		4,
		7,
		2,
		3,
		11
	],
	[
		4,
		7,
		11,
		9,
		4,
		11,
		9,
		11,
		2,
		9,
		2,
		1
	],
	[
		3,
		10,
		1,
		3,
		11,
		10,
		7,
		8,
		4
	],
	[
		1,
		11,
		10,
		1,
		4,
		11,
		1,
		0,
		4,
		7,
		11,
		4
	],
	[
		4,
		7,
		8,
		9,
		0,
		11,
		9,
		11,
		10,
		11,
		0,
		3
	],
	[
		4,
		7,
		11,
		4,
		11,
		9,
		9,
		11,
		10
	],
	[
		9,
		5,
		4
	],
	[
		9,
		5,
		4,
		0,
		8,
		3
	],
	[
		0,
		5,
		4,
		1,
		5,
		0
	],
	[
		8,
		5,
		4,
		8,
		3,
		5,
		3,
		1,
		5
	],
	[
		1,
		2,
		10,
		9,
		5,
		4
	],
	[
		3,
		0,
		8,
		1,
		2,
		10,
		4,
		9,
		5
	],
	[
		5,
		2,
		10,
		5,
		4,
		2,
		4,
		0,
		2
	],
	[
		2,
		10,
		5,
		3,
		2,
		5,
		3,
		5,
		4,
		3,
		4,
		8
	],
	[
		9,
		5,
		4,
		2,
		3,
		11
	],
	[
		0,
		11,
		2,
		0,
		8,
		11,
		4,
		9,
		5
	],
	[
		0,
		5,
		4,
		0,
		1,
		5,
		2,
		3,
		11
	],
	[
		2,
		1,
		5,
		2,
		5,
		8,
		2,
		8,
		11,
		4,
		8,
		5
	],
	[
		10,
		3,
		11,
		10,
		1,
		3,
		9,
		5,
		4
	],
	[
		4,
		9,
		5,
		0,
		8,
		1,
		8,
		10,
		1,
		8,
		11,
		10
	],
	[
		5,
		4,
		0,
		5,
		0,
		11,
		5,
		11,
		10,
		11,
		0,
		3
	],
	[
		5,
		4,
		8,
		5,
		8,
		10,
		10,
		8,
		11
	],
	[
		9,
		7,
		8,
		5,
		7,
		9
	],
	[
		9,
		3,
		0,
		9,
		5,
		3,
		5,
		7,
		3
	],
	[
		0,
		7,
		8,
		0,
		1,
		7,
		1,
		5,
		7
	],
	[
		1,
		5,
		3,
		3,
		5,
		7
	],
	[
		9,
		7,
		8,
		9,
		5,
		7,
		10,
		1,
		2
	],
	[
		10,
		1,
		2,
		9,
		5,
		0,
		5,
		3,
		0,
		5,
		7,
		3
	],
	[
		8,
		0,
		2,
		8,
		2,
		5,
		8,
		5,
		7,
		10,
		5,
		2
	],
	[
		2,
		10,
		5,
		2,
		5,
		3,
		3,
		5,
		7
	],
	[
		7,
		9,
		5,
		7,
		8,
		9,
		3,
		11,
		2
	],
	[
		9,
		5,
		7,
		9,
		7,
		2,
		9,
		2,
		0,
		2,
		7,
		11
	],
	[
		2,
		3,
		11,
		0,
		1,
		8,
		1,
		7,
		8,
		1,
		5,
		7
	],
	[
		11,
		2,
		1,
		11,
		1,
		7,
		7,
		1,
		5
	],
	[
		9,
		5,
		8,
		8,
		5,
		7,
		10,
		1,
		3,
		10,
		3,
		11
	],
	[
		5,
		7,
		0,
		5,
		0,
		9,
		7,
		11,
		0,
		1,
		0,
		10,
		11,
		10,
		0
	],
	[
		11,
		10,
		0,
		11,
		0,
		3,
		10,
		5,
		0,
		8,
		0,
		7,
		5,
		7,
		0
	],
	[
		11,
		10,
		5,
		7,
		11,
		5
	],
	[
		10,
		6,
		5
	],
	[
		0,
		8,
		3,
		5,
		10,
		6
	],
	[
		9,
		0,
		1,
		5,
		10,
		6
	],
	[
		1,
		8,
		3,
		1,
		9,
		8,
		5,
		10,
		6
	],
	[
		1,
		6,
		5,
		2,
		6,
		1
	],
	[
		1,
		6,
		5,
		1,
		2,
		6,
		3,
		0,
		8
	],
	[
		9,
		6,
		5,
		9,
		0,
		6,
		0,
		2,
		6
	],
	[
		5,
		9,
		8,
		5,
		8,
		2,
		5,
		2,
		6,
		3,
		2,
		8
	],
	[
		2,
		3,
		11,
		10,
		6,
		5
	],
	[
		11,
		0,
		8,
		11,
		2,
		0,
		10,
		6,
		5
	],
	[
		0,
		1,
		9,
		2,
		3,
		11,
		5,
		10,
		6
	],
	[
		5,
		10,
		6,
		1,
		9,
		2,
		9,
		11,
		2,
		9,
		8,
		11
	],
	[
		6,
		3,
		11,
		6,
		5,
		3,
		5,
		1,
		3
	],
	[
		0,
		8,
		11,
		0,
		11,
		5,
		0,
		5,
		1,
		5,
		11,
		6
	],
	[
		3,
		11,
		6,
		0,
		3,
		6,
		0,
		6,
		5,
		0,
		5,
		9
	],
	[
		6,
		5,
		9,
		6,
		9,
		11,
		11,
		9,
		8
	],
	[
		5,
		10,
		6,
		4,
		7,
		8
	],
	[
		4,
		3,
		0,
		4,
		7,
		3,
		6,
		5,
		10
	],
	[
		1,
		9,
		0,
		5,
		10,
		6,
		8,
		4,
		7
	],
	[
		10,
		6,
		5,
		1,
		9,
		7,
		1,
		7,
		3,
		7,
		9,
		4
	],
	[
		6,
		1,
		2,
		6,
		5,
		1,
		4,
		7,
		8
	],
	[
		1,
		2,
		5,
		5,
		2,
		6,
		3,
		0,
		4,
		3,
		4,
		7
	],
	[
		8,
		4,
		7,
		9,
		0,
		5,
		0,
		6,
		5,
		0,
		2,
		6
	],
	[
		7,
		3,
		9,
		7,
		9,
		4,
		3,
		2,
		9,
		5,
		9,
		6,
		2,
		6,
		9
	],
	[
		3,
		11,
		2,
		7,
		8,
		4,
		10,
		6,
		5
	],
	[
		5,
		10,
		6,
		4,
		7,
		2,
		4,
		2,
		0,
		2,
		7,
		11
	],
	[
		0,
		1,
		9,
		4,
		7,
		8,
		2,
		3,
		11,
		5,
		10,
		6
	],
	[
		9,
		2,
		1,
		9,
		11,
		2,
		9,
		4,
		11,
		7,
		11,
		4,
		5,
		10,
		6
	],
	[
		8,
		4,
		7,
		3,
		11,
		5,
		3,
		5,
		1,
		5,
		11,
		6
	],
	[
		5,
		1,
		11,
		5,
		11,
		6,
		1,
		0,
		11,
		7,
		11,
		4,
		0,
		4,
		11
	],
	[
		0,
		5,
		9,
		0,
		6,
		5,
		0,
		3,
		6,
		11,
		6,
		3,
		8,
		4,
		7
	],
	[
		6,
		5,
		9,
		6,
		9,
		11,
		4,
		7,
		9,
		7,
		11,
		9
	],
	[
		10,
		4,
		9,
		6,
		4,
		10
	],
	[
		4,
		10,
		6,
		4,
		9,
		10,
		0,
		8,
		3
	],
	[
		10,
		0,
		1,
		10,
		6,
		0,
		6,
		4,
		0
	],
	[
		8,
		3,
		1,
		8,
		1,
		6,
		8,
		6,
		4,
		6,
		1,
		10
	],
	[
		1,
		4,
		9,
		1,
		2,
		4,
		2,
		6,
		4
	],
	[
		3,
		0,
		8,
		1,
		2,
		9,
		2,
		4,
		9,
		2,
		6,
		4
	],
	[
		0,
		2,
		4,
		4,
		2,
		6
	],
	[
		8,
		3,
		2,
		8,
		2,
		4,
		4,
		2,
		6
	],
	[
		10,
		4,
		9,
		10,
		6,
		4,
		11,
		2,
		3
	],
	[
		0,
		8,
		2,
		2,
		8,
		11,
		4,
		9,
		10,
		4,
		10,
		6
	],
	[
		3,
		11,
		2,
		0,
		1,
		6,
		0,
		6,
		4,
		6,
		1,
		10
	],
	[
		6,
		4,
		1,
		6,
		1,
		10,
		4,
		8,
		1,
		2,
		1,
		11,
		8,
		11,
		1
	],
	[
		9,
		6,
		4,
		9,
		3,
		6,
		9,
		1,
		3,
		11,
		6,
		3
	],
	[
		8,
		11,
		1,
		8,
		1,
		0,
		11,
		6,
		1,
		9,
		1,
		4,
		6,
		4,
		1
	],
	[
		3,
		11,
		6,
		3,
		6,
		0,
		0,
		6,
		4
	],
	[
		6,
		4,
		8,
		11,
		6,
		8
	],
	[
		7,
		10,
		6,
		7,
		8,
		10,
		8,
		9,
		10
	],
	[
		0,
		7,
		3,
		0,
		10,
		7,
		0,
		9,
		10,
		6,
		7,
		10
	],
	[
		10,
		6,
		7,
		1,
		10,
		7,
		1,
		7,
		8,
		1,
		8,
		0
	],
	[
		10,
		6,
		7,
		10,
		7,
		1,
		1,
		7,
		3
	],
	[
		1,
		2,
		6,
		1,
		6,
		8,
		1,
		8,
		9,
		8,
		6,
		7
	],
	[
		2,
		6,
		9,
		2,
		9,
		1,
		6,
		7,
		9,
		0,
		9,
		3,
		7,
		3,
		9
	],
	[
		7,
		8,
		0,
		7,
		0,
		6,
		6,
		0,
		2
	],
	[
		7,
		3,
		2,
		6,
		7,
		2
	],
	[
		2,
		3,
		11,
		10,
		6,
		8,
		10,
		8,
		9,
		8,
		6,
		7
	],
	[
		2,
		0,
		7,
		2,
		7,
		11,
		0,
		9,
		7,
		6,
		7,
		10,
		9,
		10,
		7
	],
	[
		1,
		8,
		0,
		1,
		7,
		8,
		1,
		10,
		7,
		6,
		7,
		10,
		2,
		3,
		11
	],
	[
		11,
		2,
		1,
		11,
		1,
		7,
		10,
		6,
		1,
		6,
		7,
		1
	],
	[
		8,
		9,
		6,
		8,
		6,
		7,
		9,
		1,
		6,
		11,
		6,
		3,
		1,
		3,
		6
	],
	[
		0,
		9,
		1,
		11,
		6,
		7
	],
	[
		7,
		8,
		0,
		7,
		0,
		6,
		3,
		11,
		0,
		11,
		6,
		0
	],
	[
		7,
		11,
		6
	],
	[
		7,
		6,
		11
	],
	[
		3,
		0,
		8,
		11,
		7,
		6
	],
	[
		0,
		1,
		9,
		11,
		7,
		6
	],
	[
		8,
		1,
		9,
		8,
		3,
		1,
		11,
		7,
		6
	],
	[
		10,
		1,
		2,
		6,
		11,
		7
	],
	[
		1,
		2,
		10,
		3,
		0,
		8,
		6,
		11,
		7
	],
	[
		2,
		9,
		0,
		2,
		10,
		9,
		6,
		11,
		7
	],
	[
		6,
		11,
		7,
		2,
		10,
		3,
		10,
		8,
		3,
		10,
		9,
		8
	],
	[
		7,
		2,
		3,
		6,
		2,
		7
	],
	[
		7,
		0,
		8,
		7,
		6,
		0,
		6,
		2,
		0
	],
	[
		2,
		7,
		6,
		2,
		3,
		7,
		0,
		1,
		9
	],
	[
		1,
		6,
		2,
		1,
		8,
		6,
		1,
		9,
		8,
		8,
		7,
		6
	],
	[
		10,
		7,
		6,
		10,
		1,
		7,
		1,
		3,
		7
	],
	[
		10,
		7,
		6,
		1,
		7,
		10,
		1,
		8,
		7,
		1,
		0,
		8
	],
	[
		0,
		3,
		7,
		0,
		7,
		10,
		0,
		10,
		9,
		6,
		10,
		7
	],
	[
		7,
		6,
		10,
		7,
		10,
		8,
		8,
		10,
		9
	],
	[
		6,
		8,
		4,
		11,
		8,
		6
	],
	[
		3,
		6,
		11,
		3,
		0,
		6,
		0,
		4,
		6
	],
	[
		8,
		6,
		11,
		8,
		4,
		6,
		9,
		0,
		1
	],
	[
		9,
		4,
		6,
		9,
		6,
		3,
		9,
		3,
		1,
		11,
		3,
		6
	],
	[
		6,
		8,
		4,
		6,
		11,
		8,
		2,
		10,
		1
	],
	[
		1,
		2,
		10,
		3,
		0,
		11,
		0,
		6,
		11,
		0,
		4,
		6
	],
	[
		4,
		11,
		8,
		4,
		6,
		11,
		0,
		2,
		9,
		2,
		10,
		9
	],
	[
		10,
		9,
		3,
		10,
		3,
		2,
		9,
		4,
		3,
		11,
		3,
		6,
		4,
		6,
		3
	],
	[
		8,
		2,
		3,
		8,
		4,
		2,
		4,
		6,
		2
	],
	[
		0,
		4,
		2,
		4,
		6,
		2
	],
	[
		1,
		9,
		0,
		2,
		3,
		4,
		2,
		4,
		6,
		4,
		3,
		8
	],
	[
		1,
		9,
		4,
		1,
		4,
		2,
		2,
		4,
		6
	],
	[
		8,
		1,
		3,
		8,
		6,
		1,
		8,
		4,
		6,
		6,
		10,
		1
	],
	[
		10,
		1,
		0,
		10,
		0,
		6,
		6,
		0,
		4
	],
	[
		4,
		6,
		3,
		4,
		3,
		8,
		6,
		10,
		3,
		0,
		3,
		9,
		10,
		9,
		3
	],
	[
		10,
		9,
		4,
		6,
		10,
		4
	],
	[
		4,
		9,
		5,
		7,
		6,
		11
	],
	[
		0,
		8,
		3,
		4,
		9,
		5,
		11,
		7,
		6
	],
	[
		5,
		0,
		1,
		5,
		4,
		0,
		7,
		6,
		11
	],
	[
		11,
		7,
		6,
		8,
		3,
		4,
		3,
		5,
		4,
		3,
		1,
		5
	],
	[
		9,
		5,
		4,
		10,
		1,
		2,
		7,
		6,
		11
	],
	[
		6,
		11,
		7,
		1,
		2,
		10,
		0,
		8,
		3,
		4,
		9,
		5
	],
	[
		7,
		6,
		11,
		5,
		4,
		10,
		4,
		2,
		10,
		4,
		0,
		2
	],
	[
		3,
		4,
		8,
		3,
		5,
		4,
		3,
		2,
		5,
		10,
		5,
		2,
		11,
		7,
		6
	],
	[
		7,
		2,
		3,
		7,
		6,
		2,
		5,
		4,
		9
	],
	[
		9,
		5,
		4,
		0,
		8,
		6,
		0,
		6,
		2,
		6,
		8,
		7
	],
	[
		3,
		6,
		2,
		3,
		7,
		6,
		1,
		5,
		0,
		5,
		4,
		0
	],
	[
		6,
		2,
		8,
		6,
		8,
		7,
		2,
		1,
		8,
		4,
		8,
		5,
		1,
		5,
		8
	],
	[
		9,
		5,
		4,
		10,
		1,
		6,
		1,
		7,
		6,
		1,
		3,
		7
	],
	[
		1,
		6,
		10,
		1,
		7,
		6,
		1,
		0,
		7,
		8,
		7,
		0,
		9,
		5,
		4
	],
	[
		4,
		0,
		10,
		4,
		10,
		5,
		0,
		3,
		10,
		6,
		10,
		7,
		3,
		7,
		10
	],
	[
		7,
		6,
		10,
		7,
		10,
		8,
		5,
		4,
		10,
		4,
		8,
		10
	],
	[
		6,
		9,
		5,
		6,
		11,
		9,
		11,
		8,
		9
	],
	[
		3,
		6,
		11,
		0,
		6,
		3,
		0,
		5,
		6,
		0,
		9,
		5
	],
	[
		0,
		11,
		8,
		0,
		5,
		11,
		0,
		1,
		5,
		5,
		6,
		11
	],
	[
		6,
		11,
		3,
		6,
		3,
		5,
		5,
		3,
		1
	],
	[
		1,
		2,
		10,
		9,
		5,
		11,
		9,
		11,
		8,
		11,
		5,
		6
	],
	[
		0,
		11,
		3,
		0,
		6,
		11,
		0,
		9,
		6,
		5,
		6,
		9,
		1,
		2,
		10
	],
	[
		11,
		8,
		5,
		11,
		5,
		6,
		8,
		0,
		5,
		10,
		5,
		2,
		0,
		2,
		5
	],
	[
		6,
		11,
		3,
		6,
		3,
		5,
		2,
		10,
		3,
		10,
		5,
		3
	],
	[
		5,
		8,
		9,
		5,
		2,
		8,
		5,
		6,
		2,
		3,
		8,
		2
	],
	[
		9,
		5,
		6,
		9,
		6,
		0,
		0,
		6,
		2
	],
	[
		1,
		5,
		8,
		1,
		8,
		0,
		5,
		6,
		8,
		3,
		8,
		2,
		6,
		2,
		8
	],
	[
		1,
		5,
		6,
		2,
		1,
		6
	],
	[
		1,
		3,
		6,
		1,
		6,
		10,
		3,
		8,
		6,
		5,
		6,
		9,
		8,
		9,
		6
	],
	[
		10,
		1,
		0,
		10,
		0,
		6,
		9,
		5,
		0,
		5,
		6,
		0
	],
	[
		0,
		3,
		8,
		5,
		6,
		10
	],
	[
		10,
		5,
		6
	],
	[
		11,
		5,
		10,
		7,
		5,
		11
	],
	[
		11,
		5,
		10,
		11,
		7,
		5,
		8,
		3,
		0
	],
	[
		5,
		11,
		7,
		5,
		10,
		11,
		1,
		9,
		0
	],
	[
		10,
		7,
		5,
		10,
		11,
		7,
		9,
		8,
		1,
		8,
		3,
		1
	],
	[
		11,
		1,
		2,
		11,
		7,
		1,
		7,
		5,
		1
	],
	[
		0,
		8,
		3,
		1,
		2,
		7,
		1,
		7,
		5,
		7,
		2,
		11
	],
	[
		9,
		7,
		5,
		9,
		2,
		7,
		9,
		0,
		2,
		2,
		11,
		7
	],
	[
		7,
		5,
		2,
		7,
		2,
		11,
		5,
		9,
		2,
		3,
		2,
		8,
		9,
		8,
		2
	],
	[
		2,
		5,
		10,
		2,
		3,
		5,
		3,
		7,
		5
	],
	[
		8,
		2,
		0,
		8,
		5,
		2,
		8,
		7,
		5,
		10,
		2,
		5
	],
	[
		9,
		0,
		1,
		5,
		10,
		3,
		5,
		3,
		7,
		3,
		10,
		2
	],
	[
		9,
		8,
		2,
		9,
		2,
		1,
		8,
		7,
		2,
		10,
		2,
		5,
		7,
		5,
		2
	],
	[
		1,
		3,
		5,
		3,
		7,
		5
	],
	[
		0,
		8,
		7,
		0,
		7,
		1,
		1,
		7,
		5
	],
	[
		9,
		0,
		3,
		9,
		3,
		5,
		5,
		3,
		7
	],
	[
		9,
		8,
		7,
		5,
		9,
		7
	],
	[
		5,
		8,
		4,
		5,
		10,
		8,
		10,
		11,
		8
	],
	[
		5,
		0,
		4,
		5,
		11,
		0,
		5,
		10,
		11,
		11,
		3,
		0
	],
	[
		0,
		1,
		9,
		8,
		4,
		10,
		8,
		10,
		11,
		10,
		4,
		5
	],
	[
		10,
		11,
		4,
		10,
		4,
		5,
		11,
		3,
		4,
		9,
		4,
		1,
		3,
		1,
		4
	],
	[
		2,
		5,
		1,
		2,
		8,
		5,
		2,
		11,
		8,
		4,
		5,
		8
	],
	[
		0,
		4,
		11,
		0,
		11,
		3,
		4,
		5,
		11,
		2,
		11,
		1,
		5,
		1,
		11
	],
	[
		0,
		2,
		5,
		0,
		5,
		9,
		2,
		11,
		5,
		4,
		5,
		8,
		11,
		8,
		5
	],
	[
		9,
		4,
		5,
		2,
		11,
		3
	],
	[
		2,
		5,
		10,
		3,
		5,
		2,
		3,
		4,
		5,
		3,
		8,
		4
	],
	[
		5,
		10,
		2,
		5,
		2,
		4,
		4,
		2,
		0
	],
	[
		3,
		10,
		2,
		3,
		5,
		10,
		3,
		8,
		5,
		4,
		5,
		8,
		0,
		1,
		9
	],
	[
		5,
		10,
		2,
		5,
		2,
		4,
		1,
		9,
		2,
		9,
		4,
		2
	],
	[
		8,
		4,
		5,
		8,
		5,
		3,
		3,
		5,
		1
	],
	[
		0,
		4,
		5,
		1,
		0,
		5
	],
	[
		8,
		4,
		5,
		8,
		5,
		3,
		9,
		0,
		5,
		0,
		3,
		5
	],
	[
		9,
		4,
		5
	],
	[
		4,
		11,
		7,
		4,
		9,
		11,
		9,
		10,
		11
	],
	[
		0,
		8,
		3,
		4,
		9,
		7,
		9,
		11,
		7,
		9,
		10,
		11
	],
	[
		1,
		10,
		11,
		1,
		11,
		4,
		1,
		4,
		0,
		7,
		4,
		11
	],
	[
		3,
		1,
		4,
		3,
		4,
		8,
		1,
		10,
		4,
		7,
		4,
		11,
		10,
		11,
		4
	],
	[
		4,
		11,
		7,
		9,
		11,
		4,
		9,
		2,
		11,
		9,
		1,
		2
	],
	[
		9,
		7,
		4,
		9,
		11,
		7,
		9,
		1,
		11,
		2,
		11,
		1,
		0,
		8,
		3
	],
	[
		11,
		7,
		4,
		11,
		4,
		2,
		2,
		4,
		0
	],
	[
		11,
		7,
		4,
		11,
		4,
		2,
		8,
		3,
		4,
		3,
		2,
		4
	],
	[
		2,
		9,
		10,
		2,
		7,
		9,
		2,
		3,
		7,
		7,
		4,
		9
	],
	[
		9,
		10,
		7,
		9,
		7,
		4,
		10,
		2,
		7,
		8,
		7,
		0,
		2,
		0,
		7
	],
	[
		3,
		7,
		10,
		3,
		10,
		2,
		7,
		4,
		10,
		1,
		10,
		0,
		4,
		0,
		10
	],
	[
		1,
		10,
		2,
		8,
		7,
		4
	],
	[
		4,
		9,
		1,
		4,
		1,
		7,
		7,
		1,
		3
	],
	[
		4,
		9,
		1,
		4,
		1,
		7,
		0,
		8,
		1,
		8,
		7,
		1
	],
	[
		4,
		0,
		3,
		7,
		4,
		3
	],
	[
		4,
		8,
		7
	],
	[
		9,
		10,
		8,
		10,
		11,
		8
	],
	[
		3,
		0,
		9,
		3,
		9,
		11,
		11,
		9,
		10
	],
	[
		0,
		1,
		10,
		0,
		10,
		8,
		8,
		10,
		11
	],
	[
		3,
		1,
		10,
		11,
		3,
		10
	],
	[
		1,
		2,
		11,
		1,
		11,
		9,
		9,
		11,
		8
	],
	[
		3,
		0,
		9,
		3,
		9,
		11,
		1,
		2,
		9,
		2,
		11,
		9
	],
	[
		0,
		2,
		11,
		8,
		0,
		11
	],
	[
		3,
		2,
		11
	],
	[
		2,
		3,
		8,
		2,
		8,
		10,
		10,
		8,
		9
	],
	[
		9,
		10,
		2,
		0,
		9,
		2
	],
	[
		2,
		3,
		8,
		2,
		8,
		10,
		0,
		1,
		8,
		1,
		10,
		8
	],
	[
		1,
		10,
		2
	],
	[
		1,
		3,
		8,
		9,
		1,
		8
	],
	[
		0,
		9,
		1
	],
	[
		0,
		3,
		8
	],
	[]
], cubeVerts = [
	[
		0,
		0,
		0
	],
	[
		1,
		0,
		0
	],
	[
		1,
		1,
		0
	],
	[
		0,
		1,
		0
	],
	[
		0,
		0,
		1
	],
	[
		1,
		0,
		1
	],
	[
		1,
		1,
		1
	],
	[
		0,
		1,
		1
	]
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
function wrapIndex(e, t) {
	let n = e % t;
	return n < 0 ? n + t : n;
}
function clipTrianglesAgainstPlane(e, t, n, r, i) {
	if (!Array.isArray(t) || t.length === 0) return {
		positions: e,
		faces: t
	};
	let a = e.map((e) => [
		e[0],
		e[1],
		e[2]
	]), o = [], s = n[0], c = n[1], l = n[2], u = r[0], d = r[1], f = r[2], p = (e) => s * (e[0] - u) + c * (e[1] - d) + l * (e[2] - f);
	for (let e = 0; e < t.length; e += 3) {
		let n = t[e], r = t[e + 1], s = t[e + 2], c = [
			a[n],
			a[r],
			a[s]
		], l = p(c[0]), u = p(c[1]), d = p(c[2]), f = [
			l <= i,
			u <= i,
			d <= i
		];
		if (f[0] && f[1] && f[2]) {
			o.push(n, r, s);
			continue;
		}
		if (!f[0] && !f[1] && !f[2]) continue;
		let m = c, h = [
			l,
			u,
			d
		], g = [];
		for (let e = 0; e < 3; e++) {
			let t = m[e], n = h[e], r = m[(e + 1) % 3], a = h[(e + 1) % 3], o = n <= i, s = a <= i;
			if (o && g.push(t), o !== s) {
				let e = n / (n - a);
				g.push([
					t[0] + e * (r[0] - t[0]),
					t[1] + e * (r[1] - t[1]),
					t[2] + e * (r[2] - t[2])
				]);
			}
		}
		if (g.length < 3) continue;
		let _ = a.length;
		for (let e = 0; e < g.length; e++) a.push(g[e]);
		for (let e = 1; e < g.length - 1; e++) o.push(_, _ + e, _ + e + 1);
	}
	return {
		positions: a,
		faces: o
	};
}
function clipMeshToPlanes(e, t, n, r = 1e-10) {
	if (!Array.isArray(n) || n.length === 0) return {
		positions: e,
		faces: t
	};
	let i = e, a = t;
	for (let e = 0; e < n.length; e++) {
		let t = n[e];
		if (!t || !t.normal || !t.point) continue;
		let o = clipTrianglesAgainstPlane(i, a, t.normal, t.point, r);
		if (i = o.positions, a = o.faces, !a.length) break;
	}
	return {
		positions: i,
		faces: a
	};
}
function marchingCubes(e, t, n, r, i = 1, a = null) {
	let o = a || {};
	typeof i == "object" && i && (o = i, i = 1);
	let s = !!o.periodic, c = o.generateBoundaryMaterials !== !1 && !s;
	n ||= [[
		0,
		0,
		0
	], e];
	let l = [
		0,
		0,
		0
	], u = [
		0,
		0,
		0
	];
	for (let t = 0; t < 3; ++t) l[t] = (n[1][t] - n[0][t]) / e[t], u[t] = n[0][t];
	let d = [], f = [], p = [], m = Array(8), h = Array(12), g = [
		0,
		0,
		0
	], _ = [], v = /* @__PURE__ */ new Map(), y = r - Math.sign(r || 1) * Number.MAX_VALUE;
	function b(n, r, i) {
		if (s) {
			let a = wrapIndex(n, e[0]), o = wrapIndex(r, e[1]), s = wrapIndex(i, e[2]);
			return t[(a * e[1] + o) * e[2] + s];
		}
		return n >= 0 && n < e[0] && r >= 0 && r < e[1] && i >= 0 && i < e[2] ? t[(n * e[1] + r) * e[2] + i] : y;
	}
	for (g[0] = -i; g[0] < e[0] + i; g[0] += i) for (g[1] = -i; g[1] < e[1] + i; g[1] += i) for (g[2] = -i; g[2] < e[2] + i; g[2] += i) {
		let t = 0;
		for (let e = 0; e < 8; ++e) {
			let n = cubeVerts[e], a = b(g[0] + n[0] * i, g[1] + n[1] * i, g[2] + n[2] * i);
			m[e] = a, t |= a > r ? 1 << e : 0;
		}
		let n = edgeTable[t];
		if (n === 0) continue;
		for (let t = 0; t < 12; ++t) {
			if (!(n & 1 << t)) continue;
			let a = `${g[0]}_${g[1]}_${g[2]}_${t}`;
			if (v.has(a)) {
				h[t] = v.get(a).index;
				continue;
			}
			h[t] = d.length;
			let o = [
				0,
				0,
				0
			], s = edgeIndex[t], f = cubeVerts[s[0]], p = cubeVerts[s[1]], y = m[s[0]], b = m[s[1]], x = b - y, w = 1e-12 * Math.max(1, Math.abs(y), Math.abs(b), Math.abs(r)), T = Math.abs(x) > w ? (r - y) / x : .5, E = [
				0,
				0,
				0
			], k = !1;
			for (let t = 0; t < 3; ++t) E[t] = g[t] + f[t] * i + T * (p[t] - f[t]) * i, c && (E[t] <= 0 && (E[t] = 0, k = !0), E[t] >= e[t] - 1 && (E[t] = e[t] - 1, k = !0)), o[t] = l[t] * E[t] + u[t];
			d.push(o), _.push(k), v.set(a, {
				index: h[t],
				onBoundary: k
			});
		}
		let a = triTable[t];
		for (let e = 0; e < a.length; e += 3) {
			let t = h[a[e]], n = h[a[e + 1]], r = h[a[e + 2]];
			if (f.push(t, n, r), c) {
				let e = _[t] && _[n] && _[r];
				p.push(e ? 1 : 0);
			}
		}
	}
	return {
		positions: d,
		cells: f,
		faceMaterials: c ? p : []
	};
}
//#endregion
//#region src/atoms/plugins/isosurface.js
function normalizeHexColor(e) {
	return "#" + (e instanceof THREE$1.Color ? e : new THREE$1.Color(e)).getHexString();
}
var Setting$2 = class {
	constructor({ isovalue: e = null, color: t = "#3d82ed", mode: n = 1, step_size: r = 1, opacity: i = .8 }) {
		this.isovalue = e, this.color = normalizeHexColor(t), this.mode = n, this.step_size = r, this.opacity = Math.min(1, Math.max(0, i ?? .8));
	}
}, Isosurface = class {
	constructor(e) {
		this.viewer = e, this.scene = e.tjs.scene, this.settings = {}, this.guiFolder = null, this.meshes = {};
		let t = this.viewer.state.get("plugins.isosurface");
		t && t.settings && (this.settings = {}, this.applySettings(t.settings), this.viewer.volumetricData && this.drawIsosurfaces()), this.viewer.state.subscribe("plugins.isosurface", (e) => {
			!e || !e.settings || (this.applySettings(e.settings), this.viewer.volumetricData && this.drawIsosurfaces());
		});
	}
	getIsovalueRange() {
		let e = this.viewer?.volumetricData?.values;
		if (!e || e.length === 0) return {
			minValue: -1,
			maxValue: 1
		};
		let t = e.reduce((e, t) => Math.min(e, t), Infinity), n = e.reduce((e, t) => Math.max(e, t), -Infinity);
		if (!isFinite(t) || !isFinite(n)) return {
			minValue: -1,
			maxValue: 1
		};
		if (Math.abs(n - t) < 1e-9) {
			let e = Math.max(Math.abs(t), 1) * .001;
			return {
				minValue: t - e,
				maxValue: n + e
			};
		}
		return {
			minValue: t,
			maxValue: n
		};
	}
	createGui() {
		this.viewer.guiManager.gui && !this.guiFolder && (this.guiFolder = this.viewer.guiManager.gui.addFolder("Isosurface"));
	}
	removeGui() {
		this.guiFolder &&= (this.viewer.guiManager.gui.removeFolder(this.guiFolder), null);
	}
	reset() {
		this.removeGui(), this.meshes = {}, this.settings = {};
	}
	setSettings(e) {
		this.viewer.state.set({ plugins: { isosurface: { settings: cloneValue(e) } } });
	}
	applySettings(e) {
		this.settings = {}, this.removeGui(), this.createGui(), this.clearIossurfaces(), Object.entries(e).forEach(([e, t]) => {
			this.addSetting(e, t);
		});
	}
	addSetting(e, { isovalue: t = null, color: n = "#3d82ed", mode: r = 1, step_size: i = 1, opacity: a = .8 }) {
		let { minValue: o, maxValue: s } = this.getIsovalueRange();
		t === null && (t = (o + s) / 2);
		let c = new Setting$2({
			isovalue: t,
			color: n,
			mode: r,
			step_size: i,
			opacity: a
		});
		e === void 0 && (e = "iso-" + Object.keys(this.settings).length), this.settings[e] = c, this.createGui();
		let l = this.guiFolder.addFolder(e);
		l.add(c, "isovalue", o, s).name("Level").onFinishChange(this.drawIsosurfaces.bind(this)), l.addColor(c, "color").name("Color").onFinishChange(this.drawIsosurfaces.bind(this)), l.add(c, "opacity", 0, 1, .01).name("Opacity").onFinishChange(this.drawIsosurfaces.bind(this));
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
		let e = this.viewer.volumetricData, t = e.values, n = e.dims, r = e.cell, i = e.origin, a = [
			[
				r[0][0] / n[0],
				r[0][1] / n[0],
				r[0][2] / n[0]
			],
			[
				r[1][0] / n[1],
				r[1][1] / n[1],
				r[1][2] / n[1]
			],
			[
				r[2][0] / n[2],
				r[2][1] / n[2],
				r[2][2] / n[2]
			]
		], o = [];
		Object.entries(this.settings).forEach(([e, r]) => {
			this.viewer.logger.debug("setting: ", r);
			let s, c, l = normalizeHexColor(r.color);
			r.mode === 0 ? (s = [-r.isovalue, r.isovalue], c = [l, "#" + (16777215 - parseInt(l.substring(1), 16)).toString(16).padStart(6, "0")]) : (s = [r.isovalue], c = [l]);
			for (let l = 0; l < s.length; l++) {
				let d = s[l];
				this.viewer.logger.debug("isovalue: ", d);
				var u = marchingCubes(n, t, null, d, r.step_size);
				u.positions = u.positions.map(function(e) {
					return [
						e[0] * a[0][0] + e[1] * a[1][0] + e[2] * a[2][0] + i[0],
						e[0] * a[0][1] + e[1] * a[1][1] + e[2] * a[2][1] + i[1],
						e[0] * a[0][2] + e[1] * a[1][2] + e[2] * a[2][2] + i[2]
					];
				});
				let f = u.positions.reduce((e, t) => (e.push(t[0], t[1], t[2]), e), []), p = Array.isArray(u.cells) ? u.cells : Array.from(u.cells || []), m = splitFacesByMaterial(p, Array.isArray(u.faceMaterials) ? u.faceMaterials : []), h = `${e}-${l}`, g = r.opacity ?? .8, _ = m[0].length ? m[0] : p;
				o.push({
					name: `${h}`,
					vertices: f,
					faces: _,
					color: c[l],
					opacity: g,
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
						isosurface: e,
						modeIndex: l,
						materialIndex: 0
					}
				}), m[1].length && o.push({
					name: `${h}-cap`,
					vertices: f,
					faces: m[1],
					color: "#c2f542",
					opacity: g,
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
						isosurface: e,
						modeIndex: l,
						materialIndex: 1
					}
				}), this.meshes[h] = h;
			}
		}), this.updateAnyMeshSettings(o);
	}
	updateAnyMeshSettings(e) {
		let t = this.viewer?.weas?.anyMesh;
		if (!t || typeof t.setSettings != "function") return;
		let n = (Array.isArray(t.settings) ? t.settings : []).filter((e) => e?.userData?.source !== "isosurface");
		t.setSettings([...n, ...e]);
	}
};
function splitFacesByMaterial(e, t) {
	let n = [[], []];
	if (!Array.isArray(e) || e.length === 0) return n;
	if (!Array.isArray(t) || t.length === 0) return n[0] = e.slice(), n;
	for (let r = 0; r < e.length; r += 3) n[t[r / 3] === 1 ? 1 : 0].push(e[r], e[r + 1], e[r + 2]);
	return n;
}
//#endregion
//#region src/atoms/plugins/fermiSurface.js
var FermiSurfaceSetting = class {
	constructor({ isovalue: e = null, color: t = "#00ff00", step_size: n = 1, opacity: r = .6, periodic: i = !1, clipToBZ: a = !0, clipPlanes: o = null, clipEps: s = 1e-10, datasets: c = null, dataset: l = null, materialType: u = "Standard", mergeVerticesTolerance: d = .1, smoothNormals: f = !0, wrapFractional: p = !1, tile: m = 1, bzCropMargin: h = 1 }) {
		this.isovalue = e, this.color = t, this.step_size = n, this.opacity = Math.min(1, Math.max(0, r ?? .6)), this.periodic = !!i, this.clipToBZ = !!a, this.clipPlanes = Array.isArray(o) ? o : null, this.clipEps = typeof s == "number" ? s : 1e-10, this.datasets = Array.isArray(c) ? c : null, this.dataset = typeof l == "string" ? l : null, this.materialType = u || "Standard", this.mergeVerticesTolerance = d, this.smoothNormals = f, this.wrapFractional = p !== !1, this.tile = typeof m == "number" ? m : 1, this.bzCropMargin = Math.max(0, Math.floor(typeof h == "number" ? h : 1));
	}
};
function normalizeColor(e) {
	if (Array.isArray(e)) {
		let t = Math.max(0, Math.min(1, e[0] ?? 0)), n = Math.max(0, Math.min(1, e[1] ?? 0)), r = Math.max(0, Math.min(1, e[2] ?? 0)), i = (e) => Math.round(e * 255).toString(16).padStart(2, "0");
		return `#${i(t)}${i(n)}${i(r)}`;
	}
	return e;
}
function normalizeDatasets(e) {
	if (!e) return null;
	if (Array.isArray(e.datasets)) {
		let t = /* @__PURE__ */ new Map();
		return e.datasets.forEach((e, n) => {
			if (!e) return;
			let r = typeof e.name == "string" ? e.name : `dataset-${n}`;
			t.set(r, e);
		}), {
			map: t,
			meta: e
		};
	}
	if (Array.isArray(e.dims) && Array.isArray(e.values)) {
		let t = /* @__PURE__ */ new Map();
		return t.set("default", e), {
			map: t,
			meta: e
		};
	}
	return null;
}
function tileVolume(e, t, n) {
	let r = t[0], i = t[1], a = t[2], o = r * n, s = i * n, c = a * n, l = Array(o * s * c);
	for (let t = 0; t < o; t++) {
		let n = t % r;
		for (let r = 0; r < s; r++) {
			let o = r % i;
			for (let u = 0; u < c; u++) {
				let d = u % a, f = (n * i + o) * a + d, p = (t * s + r) * c + u;
				l[p] = e[f];
			}
		}
	}
	return l;
}
function clamp(e, t, n) {
	return Math.min(n, Math.max(t, e));
}
var FermiSurface = class {
	constructor(e) {
		this.viewer = e, this.settings = {}, this.meshes = {}, this.guiFolder = null, this.globalFolder = null, this.globalIsovalue = null, this.cache = /* @__PURE__ */ new Map();
		let t = this.viewer.state.get("plugins.fermiSurface");
		t && t.settings && (this.settings = {}, this.applySettings(t.settings), this.viewer.fermiSurfaceData && this.drawFermiSurfaces()), this.viewer.state.subscribe("plugins.fermiSurface", (e) => {
			!e || !e.settings || (this.applySettings(e.settings), this.viewer.fermiSurfaceData && this.drawFermiSurfaces());
		});
	}
	getIsovalueRange() {
		let e = this.viewer?.fermiSurfaceData;
		if (!e) return {
			minValue: -1,
			maxValue: 1
		};
		let t = Array.isArray(e.datasets) ? e.datasets : [];
		if (!t.length) return {
			minValue: -1,
			maxValue: 1
		};
		let n = Infinity, r = -Infinity;
		for (let e = 0; e < t.length; e++) {
			let i = t[e]?.values;
			if (Array.isArray(i)) for (let e = 0; e < i.length; e++) {
				let t = i[e];
				t < n && (n = t), t > r && (r = t);
			}
		}
		if (!isFinite(n) || !isFinite(r)) return {
			minValue: -1,
			maxValue: 1
		};
		if (Math.abs(r - n) < 1e-9) {
			let e = Math.max(Math.abs(n), 1) * .1;
			return {
				minValue: n - e,
				maxValue: r + e
			};
		}
		return {
			minValue: n,
			maxValue: r
		};
	}
	createGui() {
		this.viewer.fermiSurfaceData && this.viewer.guiManager.gui && !this.guiFolder && (this.guiFolder = this.viewer.guiManager.gui.addFolder("FermiSurface"));
	}
	removeGui() {
		this.guiFolder &&= (this.viewer.guiManager.gui.removeFolder(this.guiFolder), null);
	}
	reset() {
		this.meshes = {}, this.settings = {}, this.removeGui(), this.cache.clear();
	}
	setSettings(e) {
		this.viewer.state.set({ plugins: { fermiSurface: { settings: cloneValue(e) } } });
	}
	applySettings(e) {
		this.settings = {}, this.clearFermiSurfaces(), this.removeGui(), this.viewer.fermiSurfaceData && (this.createGui(), Object.entries(e).forEach(([e, t]) => {
			this.addSetting(e, t);
		}), this.addGlobalControls());
	}
	addGlobalControls() {
		if (!this.guiFolder) return;
		this.globalFolder &&= (this.guiFolder.removeFolder(this.globalFolder), null);
		let { minValue: e, maxValue: t } = this.getIsovalueRange();
		(this.globalIsovalue === null || typeof this.globalIsovalue != "number") && (this.globalIsovalue = (e + t) / 2);
		let n = Math.abs(t - e), r = Math.min(.1, Math.max(n / 2e3, .001)), i = this.guiFolder.addFolder("Global");
		this.globalFolder = i, i.add(this, "globalIsovalue", e, t, r).name("Fermi Energy").onFinishChange(() => {
			Object.values(this.settings).forEach((e) => {
				e.isovalue = this.globalIsovalue;
			}), this.drawFermiSurfaces();
		});
	}
	addSetting(e, { isovalue: t = null, color: n = "#00ff00", step_size: r = 1, opacity: i = .6, periodic: a = !1, clipToBZ: o = !0, clipPlanes: s = null, clipEps: c = 1e-10, datasets: l = null, dataset: u = null, materialType: d = "Standard", mergeVerticesTolerance: f = .1, smoothNormals: p = !0, wrapFractional: m = !1, tile: h = 1, bzCropMargin: g = 1 }) {
		let _ = new FermiSurfaceSetting({
			isovalue: t,
			color: normalizeColor(n),
			step_size: r,
			opacity: i,
			periodic: a,
			clipToBZ: o,
			clipPlanes: s,
			clipEps: c,
			datasets: l,
			dataset: u,
			materialType: d,
			mergeVerticesTolerance: f,
			smoothNormals: p,
			wrapFractional: m,
			tile: h,
			bzCropMargin: g
		});
		e === void 0 && (e = "fermi-" + Object.keys(this.settings).length), this.settings[e] = _, this.createGui();
		let { minValue: v, maxValue: y } = this.getIsovalueRange();
		(_.isovalue === null || typeof _.isovalue != "number") && (_.isovalue = (v + y) / 2);
		let b = this.guiFolder.addFolder(e);
		b.addColor(_, "color").name("Color").onFinishChange(this.drawFermiSurfaces.bind(this)), b.add(_, "opacity", 0, 1, .01).name("Opacity").onFinishChange(this.drawFermiSurfaces.bind(this)), b.add(_, "clipToBZ").name("Clip BZ").onFinishChange(this.drawFermiSurfaces.bind(this)), b.add(_, "step_size", 1, 4, 1).name("Step").onFinishChange(this.drawFermiSurfaces.bind(this));
	}
	clearFermiSurfaces() {
		this.meshes = {}, this.updateAnyMeshSettings([]);
	}
	drawFermiSurfaces() {
		let e = this.viewer.fermiSurfaceData;
		if (!e) {
			this.removeGui();
			return;
		}
		this.lastDataRef !== e && (this.cache.clear(), this.lastDataRef = e);
		let t = normalizeDatasets(e);
		if (!t) return;
		let n = t.map, r = [], i = e?.version || 0;
		if (e.bzMesh && e.bzMesh.vertices && e.bzMesh.faces) {
			let t = {
				name: e.bzMesh.name || "Brillouin-zone",
				vertices: e.bzMesh.vertices,
				faces: e.bzMesh.faces,
				color: e.bzMesh.color || [
					0,
					0,
					.5
				],
				opacity: typeof e.bzMesh.opacity == "number" ? e.bzMesh.opacity : .1,
				position: e.bzMesh.position || [
					0,
					0,
					0
				],
				materialType: e.bzMesh.materialType || "Standard",
				showEdges: !!e.bzMesh.showEdges,
				edgeColor: e.bzMesh.edgeColor || [
					0,
					0,
					0,
					1
				],
				depthWrite: e.bzMesh.depthWrite === !1 ? !1 : !!e.bzMesh.depthWrite,
				depthTest: e.bzMesh.depthTest === !1 ? !1 : !!e.bzMesh.depthTest,
				side: e.bzMesh.side || "DoubleSide",
				clearDepth: !!e.bzMesh.clearDepth,
				renderOrder: typeof e.bzMesh.renderOrder == "number" ? e.bzMesh.renderOrder : 10,
				mergeVerticesTolerance: e.bzMesh.mergeVerticesTolerance ?? null,
				smoothNormals: e.bzMesh.smoothNormals ?? !1,
				selectable: !1,
				userData: { source: "brillouinZone" }
			};
			r.push(t);
		}
		Object.entries(this.settings).forEach(([t, a]) => {
			let o = a.dataset ? [a.dataset] : Array.isArray(a.datasets) && a.datasets.length ? a.datasets : Array.from(n.keys()), s = [], c = [], l = 0;
			if (o.forEach((t) => {
				let r = n.get(t);
				if (!r) return;
				let o = r.dims, u = r.values;
				if (!Array.isArray(o) || !Array.isArray(u)) return;
				let d = r.cell || e.cell, f = r.origin || e.origin || [
					0,
					0,
					0
				];
				if (!d || d.length !== 3) return;
				let p = o, m = 2, h = [
					p[0] * 2,
					p[1] * 2,
					p[2] * 2
				], g = `${t}|${u.length}|2|${a.clipToBZ ? 1 : 0}|${a.bzCropMargin}|${i}`, _ = this.cache.get(g), v, y = [
					0,
					0,
					0
				], b = h;
				if (_) v = _.values, y = _.offset, b = _.dims;
				else {
					if (v = tileVolume(u, p, 2), a.clipToBZ && e.bzMesh && e.bzMesh.vertices) {
						let t = inv(d);
						if (t) {
							let n = [
								Infinity,
								Infinity,
								Infinity
							], r = [
								-Infinity,
								-Infinity,
								-Infinity
							], i = e.bzMesh.vertices;
							for (let e = 0; e < i.length; e += 3) {
								let a = multiply(t, [
									i[e],
									i[e + 1],
									i[e + 2]
								]);
								for (let e = 0; e < 3; e++) a[e] < n[e] && (n[e] = a[e]), a[e] > r[e] && (r[e] = a[e]);
							}
							let o = a.bzCropMargin || 1, s = [
								0,
								0,
								0
							], c = [
								0,
								0,
								0
							];
							for (let e = 0; e < 3; e++) {
								let t = Math.floor((n[e] + 2 / 2) * p[e]) - o, i = Math.ceil((r[e] + 2 / 2) * p[e]) + o;
								s[e] = clamp(t, 0, h[e] - 1), c[e] = clamp(i, 0, h[e] - 1);
							}
							if (y = [
								s[0],
								s[1],
								s[2]
							], b = [
								c[0] - s[0] + 1,
								c[1] - s[1] + 1,
								c[2] - s[2] + 1
							], b[0] > 0 && b[1] > 0 && b[2] > 0) {
								let e = Array(b[0] * b[1] * b[2]);
								for (let t = 0; t < b[0]; t++) for (let n = 0; n < b[1]; n++) for (let r = 0; r < b[2]; r++) {
									let i = t + y[0], a = n + y[1], o = r + y[2], s = (i * h[1] + a) * h[2] + o, c = (t * b[1] + n) * b[2] + r;
									e[c] = v[s];
								}
								v = e;
							} else y = [
								0,
								0,
								0
							], b = h;
						}
					}
					this.cache.set(g, {
						values: v,
						offset: y,
						dims: b
					});
				}
				let x = a.isovalue === null ? 0 : a.isovalue, w = marchingCubes(b, v, null, x, a.step_size, { periodic: !1 }), T = Array.isArray(w.cells) ? w.cells : Array.from(w.cells || []), E = [], k = [];
				if (a.wrapFractional) {
					let e = w.positions.map((e) => [
						(e[0] + y[0]) / p[0] - 2 / 2,
						(e[1] + y[1]) / p[1] - 2 / 2,
						(e[2] + y[2]) / p[2] - 2 / 2
					]);
					for (let t = 0; t < T.length; t += 3) {
						let n = T[t], r = T[t + 1], i = T[t + 2], a = e[n], o = e[r].slice(), s = e[i].slice();
						for (let e = 0; e < 3; e++) {
							let t = o[e] - a[e];
							t > .5 ? --o[e] : t < -.5 && (o[e] += 1);
							let n = s[e] - a[e];
							n > .5 ? --s[e] : n < -.5 && (s[e] += 1);
						}
						let c = E.length, l = [
							a[0] * d[0][0] + a[1] * d[1][0] + a[2] * d[2][0] + f[0],
							a[0] * d[0][1] + a[1] * d[1][1] + a[2] * d[2][1] + f[1],
							a[0] * d[0][2] + a[1] * d[1][2] + a[2] * d[2][2] + f[2]
						], u = [
							o[0] * d[0][0] + o[1] * d[1][0] + o[2] * d[2][0] + f[0],
							o[0] * d[0][1] + o[1] * d[1][1] + o[2] * d[2][1] + f[1],
							o[0] * d[0][2] + o[1] * d[1][2] + o[2] * d[2][2] + f[2]
						], p = [
							s[0] * d[0][0] + s[1] * d[1][0] + s[2] * d[2][0] + f[0],
							s[0] * d[0][1] + s[1] * d[1][1] + s[2] * d[2][1] + f[1],
							s[0] * d[0][2] + s[1] * d[1][2] + s[2] * d[2][2] + f[2]
						];
						E.push(l, u, p), k.push(c, c + 1, c + 2);
					}
				} else E = w.positions.map((e) => {
					let t = (e[0] + y[0]) / p[0] - 2 / 2, n = (e[1] + y[1]) / p[1] - 2 / 2, r = (e[2] + y[2]) / p[2] - 2 / 2;
					return [
						t * d[0][0] + n * d[1][0] + r * d[2][0] + f[0],
						t * d[0][1] + n * d[1][1] + r * d[2][1] + f[1],
						t * d[0][2] + n * d[1][2] + r * d[2][2] + f[2]
					];
				}), k = T;
				let A = Math.max(1, Math.floor(typeof a.tile == "number" ? a.tile : 1)), j = A, M = A, L = A, R = E, z = k;
				if (j > 1 || M > 1 || L > 1) {
					R = [], z = [];
					let e = [], t = -Math.floor(j / 2), n = -Math.floor(M / 2), r = -Math.floor(L / 2);
					for (let i = t; i < t + j; i++) for (let t = n; t < n + M; t++) for (let n = r; n < r + L; n++) e.push([
						i,
						t,
						n
					]);
					let i = 0;
					for (let t = 0; t < e.length; t++) {
						let [n, r, a] = e[t], o = n * d[0][0] + r * d[1][0] + a * d[2][0], s = n * d[0][1] + r * d[1][1] + a * d[2][1], c = n * d[0][2] + r * d[1][2] + a * d[2][2];
						for (let e = 0; e < E.length; e++) {
							let t = E[e];
							R.push([
								t[0] + o,
								t[1] + s,
								t[2] + c
							]);
						}
						for (let e = 0; e < k.length; e += 3) z.push(k[e] + i, k[e + 1] + i, k[e + 2] + i);
						i += E.length;
					}
				}
				if (a.clipToBZ) {
					let t = a.clipPlanes || r.bzPlanes || e.bzPlanes || null;
					if (t && t.length && z.length) {
						let e = clipMeshToPlanes(R, z, t, a.clipEps);
						E = e.positions, k = e.faces;
					} else E = R, k = z;
				} else E = R, k = z;
				if (E.length && k.length) {
					for (let e = 0; e < E.length; e++) s.push(E[e]);
					for (let e = 0; e < k.length; e += 3) c.push(k[e] + l, k[e + 1] + l, k[e + 2] + l);
					l += E.length;
				}
			}), !s.length || !c.length) return;
			let u = s.reduce((e, t) => (e.push(t[0], t[1], t[2]), e), []);
			r.push({
				name: t,
				vertices: u,
				faces: c,
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
					fermiSurface: t
				}
			}), this.meshes[t] = t;
		}), this.updateAnyMeshSettings(r);
	}
	updateAnyMeshSettings(e) {
		let t = this.viewer?.weas?.anyMesh;
		if (!t || typeof t.setSettings != "function") return;
		let n = Array.isArray(t.settings) ? t.settings : [], r = n.filter((e) => e?.userData?.source !== "fermiSurface" && e?.userData?.source !== "brillouinZone");
		if (!Array.isArray(e) || e.length === 0) {
			if (!n.some((e) => e?.userData?.source === "fermiSurface" || e?.userData?.source === "brillouinZone")) return;
			t.setSettings([...r]);
			return;
		}
		let i = /* @__PURE__ */ new Map();
		n.forEach((e) => {
			e?.name && (e?.userData?.source === "fermiSurface" || e?.userData?.source === "brillouinZone") && i.set(e.name, e);
		});
		let a = e.map((e) => {
			let t = i.get(e.name);
			return t && typeof t.visible == "boolean" ? {
				...e,
				visible: t.visible
			} : e;
		});
		t.setSettings([...r, ...a]);
	}
}, SliceSetting = class {
	constructor({ method: e = "miller", h: t = 0, k: n = 0, l: r = 1, distance: i = 0, selectedAtomIndices: a = [], colorMap: o = "viridis", opacity: s = 1, samplingDistance: c = .2 }) {
		this.method = e, this.h = t, this.k = n, this.l = r, this.distance = i, this.selectedAtomIndices = a, this.colorMap = o, this.opacity = s, this.samplingDistance = c;
	}
}, VolumeSlice = class {
	constructor(e) {
		this.viewer = e, this.scene = e.tjs.scene, this.settings = {}, this.guiFolder = null, this.slices = {};
		let t = this.viewer.state.get("plugins.volumeSlice");
		t && t.settings && (this.settings = {}, this.applySettings(t.settings), this.viewer.volumetricData && this.drawSlices()), this.viewer.state.subscribe("plugins.volumeSlice", (e) => {
			!e || !e.settings || (this.applySettings(e.settings), this.viewer.volumetricData && this.drawSlices());
		});
	}
	createGui() {
		this.viewer.guiManager.gui && !this.guiFolder && (this.guiFolder = this.viewer.guiManager.gui.addFolder("Slices"));
	}
	removeGui() {
		this.guiFolder &&= (this.viewer.guiManager.gui.removeFolder(this.guiFolder), null);
	}
	reset() {
		this.removeGui(), this.clearSlices(), this.settings = {};
	}
	setSettings(e) {
		this.viewer.state.set({ plugins: { volumeSlice: { settings: cloneValue(e) } } });
	}
	applySettings(e) {
		this.settings = {}, this.removeGui(), this.createGui(), this.clearSlices(), Object.entries(e).forEach(([e, t]) => {
			this.addSetting(e, t);
		});
	}
	addSetting(e, { method: t = "miller", h: n = 0, k: r = 0, l: i = 1, distance: a = 0, selectedAtomIndices: o = [], colorMap: s = "viridis", opacity: c = 1, samplingDistance: l = .2 }) {
		let u = new SliceSetting({
			method: t,
			h: n,
			k: r,
			l: i,
			distance: a,
			selectedAtomIndices: o,
			colorMap: s,
			opacity: c,
			samplingDistance: l
		});
		e === void 0 && (e = "slice-" + Object.keys(this.settings).length), this.settings[e] = u, this.createGui();
		let d = this.guiFolder.addFolder(e);
		d.add(u, "method", ["miller", "bestFit"]).name("Method").onChange(this.drawSlices.bind(this)), d.add(u, "samplingDistance", .1, 5).name("Sampling Distance").onChange(this.drawSlices.bind(this)), u.method === "miller" ? (d.add(u, "h").name("Miller h").onChange(this.drawSlices.bind(this)), d.add(u, "k").name("Miller k").onChange(this.drawSlices.bind(this)), d.add(u, "l").name("Miller l").onChange(this.drawSlices.bind(this)), d.add(u, "distance").name("Distance").onChange(this.drawSlices.bind(this))) : u.method, d.add(u, "opacity", 0, 1).name("Opacity").onChange(this.drawSlices.bind(this));
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
		let e = this.viewer.volumetricData, t = e.values, n = e.dims, r = e.cell, i = new THREE$1.Vector3(...e.origin);
		Object.entries(this.settings).forEach(([e, a]) => {
			let o, s;
			if (a.method === "miller") o = computePlaneNormalFromMillerIndices(a.h, a.k, a.l, r), s = o.clone().multiplyScalar(a.distance).add(i);
			else if (a.method === "bestFit") {
				let e = computeBestFitPlane(a.selectedAtomIndices.map((e) => new THREE$1.Vector3(...this.viewer.atoms.positions[e])));
				o = e.normal, s = e.point;
			} else {
				this.viewer.logger.error(`Unknown method: ${a.method}`);
				return;
			}
			let c = a.samplingDistance || .5, l = extractSliceArbitrary(t, n, r, i, o, s, c);
			if (!l) {
				this.viewer.logger.debug("Slice does not intersect the unit cell sufficiently");
				return;
			}
			let { sliceData: u, width: d, height: f, minX: p, maxX: m, minY: h, maxY: g, projectedPoints: _ } = l, v = Math.max(...u.flat()), y = createTextureFromSlice(u, Math.min(...u.flat()), v, a.colorMap), b = createSlicePlaneArbitrary(_, o, s, y, a.opacity, p, m, h, g);
			b.userData.type = "slice", b.userData.uuid = this.viewer.uuid, b.userData.notSelectable = !0, b.layers.set(1), this.scene.add(b), this.slices[e] = b;
		}), this.viewer.requestRedraw?.("render");
	}
};
function computePlaneNormalFromMillerIndices(e, t, n, r) {
	let i = new THREE$1.Vector3(...r[0]), a = new THREE$1.Vector3(...r[1]), o = new THREE$1.Vector3(...r[2]), s = i.dot(a.clone().cross(o)), c = a.clone().cross(o).multiplyScalar(2 * Math.PI / s), l = o.clone().cross(i).multiplyScalar(2 * Math.PI / s), u = i.clone().cross(a).multiplyScalar(2 * Math.PI / s);
	return c.clone().multiplyScalar(e).add(l.clone().multiplyScalar(t)).add(u.clone().multiplyScalar(n)).normalize();
}
function computeBestFitPlane(e) {
	if (e.length < 3) throw Error("At least three points are required to define a plane.");
	let t = new THREE$1.Vector3(0, 0, 0);
	e.forEach((e) => {
		t.add(e);
	}), t.divideScalar(e.length);
	let n = 0, r = 0, i = 0, a = 0, o = 0, s = 0;
	e.forEach((e) => {
		let c = e.x - t.x, l = e.y - t.y, u = e.z - t.z;
		n += c * c, r += c * l, i += c * u, a += l * l, o += l * u, s += u * u;
	});
	let { eigenvalues: c, eigenvectors: l } = computeEigenvaluesAndEigenvectors([
		[
			n,
			r,
			i
		],
		[
			r,
			a,
			o
		],
		[
			i,
			o,
			s
		]
	]), u = l[c.findIndex((e) => e === Math.min(...c))];
	return {
		normal: new THREE$1.Vector3(...u).normalize(),
		point: t
	};
}
function extractSliceArbitrary(e, t, n, r, i, a, o) {
	let s = computePlaneUnitCellIntersections(n, r, i, a);
	if (s.length < 3) return null;
	let c = computePlaneBasis(i), l = computeConvexHull(s.map((e) => {
		let t = e.clone().sub(a), n = t.dot(c.u), r = t.dot(c.v);
		return new THREE$1.Vector2(n, r);
	})), u = Infinity, d = Infinity, f = -Infinity, p = -Infinity;
	l.forEach((e) => {
		e.x < u && (u = e.x), e.y < d && (d = e.y), e.x > f && (f = e.x), e.y > p && (p = e.y);
	});
	let [m, h, g] = t, _ = Math.ceil((f - u) / o) + 1, v = Math.ceil((p - d) / o) + 1, y = [];
	for (let i = 0; i < v; i++) {
		let s = [];
		for (let f = 0; f < _; f++) {
			let p = u + f * o, m = d + i * o, h = new THREE$1.Vector2(p, m), g = 0;
			pointInPolygon(h, l) && (g = trilinearInterpolation(e, cellToGridCoordinates(a.clone().add(c.u.clone().multiplyScalar(p)).add(c.v.clone().multiplyScalar(m)).clone().sub(r), n, t), t)), s.push(g);
		}
		y.push(s);
	}
	return {
		sliceData: y,
		width: _,
		height: v,
		minX: u,
		maxX: f,
		minY: d,
		maxY: p,
		projectedPoints: l
	};
}
function cellToGridCoordinates(e, t, n) {
	let r = new THREE$1.Vector3(...t[0]), i = new THREE$1.Vector3(...t[1]), a = new THREE$1.Vector3(...t[2]), o = new THREE$1.Matrix3();
	o.set(r.x, i.x, a.x, r.y, i.y, a.y, r.z, i.z, a.z);
	let s = o.clone().invert(), c = e.clone().applyMatrix3(s);
	return {
		x: c.x * n[0],
		y: c.y * n[1],
		z: c.z * n[2]
	};
}
function trilinearInterpolation(e, t, n) {
	let { x: r, y: i, z: a } = t, o = Math.floor(r), s = o + 1, c = Math.floor(i), l = c + 1, u = Math.floor(a), d = u + 1, f = r - o, p = i - c, m = a - u, h = getDataValue(e, o, c, u, n), g = getDataValue(e, s, c, u, n), _ = getDataValue(e, o, l, u, n), v = getDataValue(e, o, c, d, n), y = getDataValue(e, s, c, d, n), b = getDataValue(e, o, l, d, n), x = getDataValue(e, s, l, u, n), w = getDataValue(e, s, l, d, n), T = h * (1 - f) + g * f, E = v * (1 - f) + y * f, k = _ * (1 - f) + x * f, A = b * (1 - f) + w * f, j = T * (1 - p) + k * p, M = E * (1 - p) + A * p;
	return j * (1 - m) + M * m;
}
function getDataValue(e, t, n, r, i) {
	let [a, o, s] = i;
	return t < 0 || t >= a || n < 0 || n >= o || r < 0 || r >= s ? 0 : e[(t * o + n) * s + r];
}
function createTextureFromSlice(e, t, n, r) {
	let i = e[0].length, a = e.length, o = new Uint8Array(i * a * 4), s = getColorMapFunction(r), c = 0;
	for (let r = 0; r < a; r++) for (let a = 0; a < i; a++) {
		let [i, l, u] = s((e[r][a] - t) / (n - t));
		o[c++] = i * 255, o[c++] = l * 255, o[c++] = u * 255, o[c++] = 255;
	}
	let l = new THREE$1.DataTexture(o, i, a, THREE$1.RGBAFormat);
	return l.needsUpdate = !0, l.minFilter = THREE$1.LinearFilter, l.magFilter = THREE$1.LinearFilter, l;
}
function createSlicePlaneArbitrary(e, t, n, r, i, a, o, s, c) {
	let l = computePlaneBasis(t), u = new THREE$1.Shape(e), d = new THREE$1.ShapeGeometry(u);
	d.setAttribute("uv", new THREE$1.BufferAttribute(new Float32Array(d.attributes.position.count * 2), 2));
	for (let e = 0; e < d.attributes.position.count; e++) {
		let t = d.attributes.position.getX(e), n = d.attributes.position.getY(e), r = (t - a) / (o - a), i = (n - s) / (c - s);
		d.attributes.uv.setXY(e, r, i);
	}
	let f = new THREE$1.Matrix4(), p = l.u, m = l.v, h = t;
	f.makeBasis(p, m, h), f.setPosition(n), d.applyMatrix4(f);
	let g = new THREE$1.MeshBasicMaterial({
		map: r,
		side: THREE$1.DoubleSide,
		transparent: i < 1,
		opacity: i
	});
	return new THREE$1.Mesh(d, g);
}
function getColorMapFunction(e) {
	return e === "grayscale" ? function(e) {
		return [
			e,
			e,
			e
		];
	} : e === "viridis" ? function(e) {
		return e = Math.max(0, Math.min(1, e)), viridisColorMap(e);
	} : function(e) {
		return [
			e,
			e,
			e
		];
	};
}
function viridisColorMap(e) {
	let t = [
		[
			.267004,
			.004874,
			.329415
		],
		[
			.282327,
			.094955,
			.417331
		],
		[
			.253935,
			.265254,
			.529983
		],
		[
			.206756,
			.371758,
			.553117
		],
		[
			.163625,
			.471133,
			.558148
		],
		[
			.127568,
			.566949,
			.550556
		],
		[
			.134692,
			.658636,
			.517649
		],
		[
			.266941,
			.748751,
			.440573
		],
		[
			.477504,
			.821444,
			.318195
		],
		[
			.741388,
			.873449,
			.149561
		],
		[
			.993248,
			.906157,
			.143936
		]
	], n = t.length - 1, r = Math.floor(e * n), i = e * n - r, a = t[r], o = t[Math.min(r + 1, n)];
	return [
		a[0] + (o[0] - a[0]) * i,
		a[1] + (o[1] - a[1]) * i,
		a[2] + (o[2] - a[2]) * i
	];
}
function getUnitCellVertices(e, t) {
	let n = new THREE$1.Vector3(...e[0]), r = new THREE$1.Vector3(...e[1]), i = new THREE$1.Vector3(...e[2]);
	return [
		t.clone(),
		t.clone().add(n),
		t.clone().add(r),
		t.clone().add(i),
		t.clone().add(n).add(r),
		t.clone().add(n).add(i),
		t.clone().add(r).add(i),
		t.clone().add(n).add(r).add(i)
	];
}
function getUnitCellEdges(e) {
	let [t, n, r, i, a, o, s, c] = e;
	return [
		[t, n],
		[t, r],
		[t, i],
		[n, a],
		[n, o],
		[r, a],
		[r, s],
		[i, o],
		[i, s],
		[a, c],
		[o, c],
		[s, c]
	];
}
function computeLinePlaneIntersection(e, t, n, r) {
	let i = t.clone().sub(e), a = n.dot(i), o = n.dot(r.clone().sub(e));
	if (Math.abs(a) < 1e-6) return Math.abs(o) < 1e-6 ? [e.clone(), t.clone()] : null;
	{
		let t = o / a;
		return t < 0 || t > 1 ? null : e.clone().add(i.multiplyScalar(t));
	}
}
function computePlaneUnitCellIntersections(e, t, n, r) {
	let i = getUnitCellEdges(getUnitCellVertices(e, t)), a = [];
	for (let e = 0; e < i.length; e++) {
		let [t, o] = i[e], s = computeLinePlaneIntersection(t, o, n, r);
		s && (Array.isArray(s) ? a.push(...s) : a.push(s));
	}
	let o = [], s = 1e-6;
	return a.forEach((e) => {
		o.some((t) => t.distanceToSquared(e) < s * s) || o.push(e);
	}), o;
}
function computePlaneBasis(e) {
	let t = new THREE$1.Vector3();
	return Math.abs(e.z) > Math.abs(e.x) ? t.set(1, 0, 0).cross(e).normalize() : t.set(0, 0, 1).cross(e).normalize(), {
		u: t,
		v: e.clone().cross(t).normalize()
	};
}
function pointInPolygon(e, t) {
	let n = 0, r = t.length;
	for (let i = 0; i < r; i++) {
		let a = t[i], o = t[(i + 1) % r];
		a.y <= e.y ? o.y > e.y && isLeft(a, o, e) > 0 && n++ : o.y <= e.y && isLeft(a, o, e) < 0 && n--;
	}
	return n !== 0;
}
function isLeft(e, t, n) {
	return (t.x - e.x) * (n.y - e.y) - (n.x - e.x) * (t.y - e.y);
}
function computeConvexHull(e) {
	e.sort((e, t) => e.x - t.x || e.y - t.y);
	let t = [];
	for (let n of e) {
		for (; t.length >= 2 && cross(t[t.length - 2], t[t.length - 1], n) <= 0;) t.pop();
		t.push(n);
	}
	let n = [];
	for (let t = e.length - 1; t >= 0; t--) {
		let r = e[t];
		for (; n.length >= 2 && cross(n[n.length - 2], n[n.length - 1], r) <= 0;) n.pop();
		n.push(r);
	}
	return t.pop(), n.pop(), t.concat(n);
}
function cross(e, t, n) {
	return (t.x - e.x) * (n.y - e.y) - (t.y - e.y) * (n.x - e.x);
}
function computeEigenvaluesAndEigenvectors(e) {
	let t = 1e-10, n = 100, r = e.map((e) => e.slice()), i = r.length, a = Array.from({ length: i }, (e, t) => Array.from({ length: i }, (e, n) => t === n ? 1 : 0));
	for (let e = 0; e < 100; e++) {
		let e = 0, t = 0, n = 0;
		for (let a = 0; a < i; a++) for (let o = a + 1; o < i; o++) Math.abs(r[a][o]) > Math.abs(e) && (e = r[a][o], t = a, n = o);
		if (Math.abs(e) < 1e-10) break;
		let o = .5 * Math.atan2(2 * e, r[t][t] - r[n][n]), s = Math.cos(o), c = Math.sin(o), l = s * s * r[t][t] - 2 * c * s * r[t][n] + c * c * r[n][n], u = c * c * r[t][t] + 2 * c * s * r[t][n] + s * s * r[n][n], d = 0;
		for (let e = 0; e < i; e++) if (e !== t && e !== n) {
			let i = s * r[t][e] - c * r[n][e], a = c * r[t][e] + s * r[n][e];
			r[t][e] = i, r[e][t] = i, r[n][e] = a, r[e][n] = a;
		}
		r[t][t] = l, r[n][n] = u, r[t][n] = 0, r[n][t] = 0;
		for (let e = 0; e < i; e++) {
			let r = s * a[e][t] - c * a[e][n], i = c * a[e][t] + s * a[e][n];
			a[e][t] = r, a[e][n] = i;
		}
	}
	return {
		eigenvalues: r.map((e, t) => e[t]),
		eigenvectors: a
	};
}
//#endregion
//#region src/atoms/plugins/vectorField.js
var Setting$1 = class {
	constructor({ origins: e = [], vectors: t = [], factor: n = 1, color: r = "#3d82ed", radius: i = .05, centerOnAtoms: a = !1 }) {
		this.origins = e, this.vectors = t, this.color = convertColor$1(r), this.radius = i, this.factor = n, this.centerOnAtoms = a;
	}
}, VectorField = class {
	constructor(e) {
		this.viewer = e, this.scene = this.viewer.tjs.scene, this.shapeRegistry = this.viewer.weas.shapeRegistry, this._show = !0, this.init();
		let t = this.viewer.state.get("plugins.vectorField");
		t && (t.settings && this.applySettings(t.settings), t.show !== void 0 && (this.show = t.show)), this.viewer.state.subscribe("plugins.vectorField", (e) => {
			e && (e.settings && this.applySettings(e.settings), e.show !== void 0 && (this.show = e.show), this.drawVectorFields());
		});
	}
	get show() {
		return this._show;
	}
	set show(e) {
		this._show = e, Object.values(this.meshes).forEach((t) => {
			Object.values(t).forEach((t) => {
				t.visible = e;
			});
		}), this.viewer.requestRedraw?.("render");
	}
	init() {
		if (this.settings = {}, this.meshes = {}, this.viewer.logger.debug("init VectorField"), this.viewer.atoms.attributes.atom.moment === void 0) return;
		let e = [], t = [], n = [], r = [];
		for (let i = 0; i < this.viewer.atoms.getAtomsCount(); i++) if (this.viewer.atoms.attributes.atom.moment[i] > 0) {
			let n = [
				0,
				0,
				this.viewer.atoms.attributes.atom.moment[i] * 1.5
			], r = this.viewer.atoms.positions[i].map((e, t) => e - n[t] / 2);
			e.push(r), t.push(n);
		} else {
			let e = [
				0,
				0,
				this.viewer.atoms.attributes.atom.moment[i] * 1.5
			], t = this.viewer.atoms.positions[i].map((t, n) => t - e[n] / 2);
			n.push(t), r.push(e);
		}
		this.addSetting("up", {
			origins: e,
			vectors: t,
			color: "#3d82ed"
		}), this.addSetting("down", {
			origins: n,
			vectors: r,
			color: "#ff0000"
		});
	}
	setSettings(e) {
		this.viewer.state.set({ plugins: { vectorField: { settings: cloneValue(e) } } });
	}
	applySettings(e) {
		this.settings = [], this.clearMeshes(), Object.entries(e).forEach(([e, t]) => {
			this.addSetting(e, t);
		});
	}
	addSetting(e, { origins: t, vectors: n, factor: r = 1, color: i = "#3d82ed", radius: a = .05, centerOnAtoms: o = !1 }) {
		if (typeof t == "string" && !this.viewer.atoms.getAttribute(t)) throw Error(`Attribute '${t}' is not defined. The available attributes are: ${Object.keys(this.viewer.atoms.attributes.atom)}`);
		let s = new Setting$1({
			origins: t,
			vectors: n,
			factor: r,
			color: i,
			radius: a,
			centerOnAtoms: o
		});
		e === void 0 && (e = "vf-" + Object.keys(this.settings).length), this.settings[e] = s;
	}
	clearMeshes() {
		Object.values(this.meshes).forEach((e) => {
			Object.values(e).forEach((e) => {
				clearObject(this.scene, e);
			});
		}), this.meshes = {};
	}
	getData(e) {
		let t, n;
		return t = typeof e.origins == "string" ? this.viewer.atoms.getAttribute(e.origins) : e.origins, n = typeof e.vectors == "string" ? this.viewer.atoms.getAttribute(e.vectors) : e.vectors, [t, n];
	}
	drawVectorFields() {
		this.viewer.logger.debug("drawVectorFields"), this.clearMeshes(), Object.entries(this.settings).forEach(([e, t]) => {
			let [n, r] = this.getData(t), i = drawAtomArrows({
				length: r.length,
				color: t.color,
				materialType: "Standard",
				shapeRegistry: this.shapeRegistry
			});
			i.visible = this.show, this.scene.add(i), this.meshes[e] = { arrow: i };
		}), this.updateArrowMesh(), this.viewer.requestRedraw?.("render");
	}
	updateArrowMesh(e = null, t = null) {
		t === null && (t = this.viewer.atoms), Object.entries(this.settings).forEach(([t, n]) => {
			let [r, i] = this.getData(n), a = this.meshes[t].arrow;
			if (!a) return;
			let o = r.length;
			(e === null ? [...Array(o).keys()] : [e]).forEach((e) => {
				let t = new THREE$1.Vector3(...r[e]), o = new THREE$1.Vector3(...i[e]).multiplyScalar(n.factor), s = t.clone().add(o), c = new THREE$1.Vector3().lerpVectors(t, s, 0), l = calculateQuaternion(t, s), u = new THREE$1.Quaternion().setFromAxisAngle(new THREE$1.Vector3(1, 0, 0), Math.PI);
				l.multiply(u);
				let d = new THREE$1.Vector3(10 * n.radius, t.distanceTo(s), 10 * n.radius), f = new THREE$1.Matrix4().compose(c, l, d);
				a.setMatrixAt(e, f);
			}), a.instanceMatrix.needsUpdate = !0;
		});
	}
};
function drawAtomArrows({ length: e = 0, color: t = 0, materialType: n = "Standard", shapeRegistry: r }) {
	let i = r.create("Arrow", { materialType: n });
	if (!(i instanceof THREE$1.Mesh)) throw Error("Arrow must return a THREE.Mesh");
	let a = i.geometry.clone(), o = i.material.clone();
	o.color.set(t);
	let s = new THREE$1.InstancedMesh(a, o, e);
	return s.userData.type = "arrow", s;
}
//#endregion
//#region src/geometry/geometryMath.js
function getPosition(e) {
	return e.slice();
}
function getDistance(e, t) {
	let n = [
		t[0] - e[0],
		t[1] - e[1],
		t[2] - e[2]
	];
	return sqrt(dot(n, n));
}
function getAngle(e, t, n) {
	let r = [
		e[0] - t[0],
		e[1] - t[1],
		e[2] - t[2]
	], i = [
		n[0] - t[0],
		n[1] - t[1],
		n[2] - t[2]
	], a = dot(r, i) / (norm(r) * norm(i));
	return acos(Math.min(Math.max(a, -1), 1)) * 180 / Math.PI;
}
function getDihedral(e, t, n, r) {
	let i = subtract(t, e), a = subtract(n, t), o = subtract(r, n), s = divide(a, norm(a)), c = cross$1(i, a), l = cross$1(a, o), u = cross$1(c, s), d = dot(c, l), f = dot(u, l);
	return Math.atan2(f, d) * 180 / Math.PI;
}
//#endregion
//#region src/atoms/plugins/measurement.js
var DEFAULT_MEASUREMENT_SETTINGS = {
	enabled: !0,
	color: "black",
	fontSize: 16,
	lineColor: 255,
	lineWidth: 1,
	opacity: .9,
	measurements: {},
	showLabels: !0,
	showLines: !0
}, Measurement = class {
	constructor(e, t = {}) {
		this.viewer = e, this.scene = this.viewer.tjs.scene, this.textManager = this.viewer.weas.textManager, this.shapeRegistry = this.viewer.weas.shapeRegistry, this.meshes = {}, this.settings = (0, import_lodash_merge.default)({}, DEFAULT_MEASUREMENT_SETTINGS, t);
		let n = this.viewer.state.get("plugins.measurement") || {};
		(0, import_lodash_merge.default)(this.settings, n), this._rebuild(), this.viewer.state.subscribe("plugins.measurement", (e, t) => {
			!e || this.viewer._initializingState || this._onStateChange(e, t);
		});
	}
	reset() {
		this.clearMeshes(), this.settings = {}, this.viewer.requestRedraw?.("render");
	}
	measure(e = []) {
		if (!e.length) {
			this.viewer.state.set({ plugins: { measurement: null } });
			return;
		}
		let t = this.viewer.state.get("plugins.measurement") || {}, n = { ...t.measurements || {} }, r = `measurement-${e.join("-")}`;
		n[r] = { indices: e }, this.viewer.state.set({ plugins: { measurement: {
			...t,
			measurements: n
		} } });
	}
	setSettings(e) {
		this.viewer.state.set({ plugins: { measurement: { settings: cloneValue(e) } } });
	}
	applySettings(e) {
		this.settings = {}, this.clearMeshes(), Object.entries(e).forEach(([e, t]) => {
			this.addSetting(e, t);
		});
	}
	drawMeasurements() {
		let e = this.settings.measurements || {};
		Object.entries(e).forEach(([e, t]) => {
			this.drawMeasurement(e, t);
		});
	}
	drawMeasurement(e, t) {
		let n = t.indices;
		n.length === 1 ? this.showPosition(e, n, t) : n.length === 2 ? this.showDistance(e, n, t) : n.length === 3 ? this.showAngle(e, n, t) : n.length === 4 && this.showDihedralAngle(e, n, t), this.viewer.requestRedraw?.("render");
	}
	removeMeasurement(e) {
		let t = this.meshes[e];
		t && (t.forEach((e) => {
			try {
				this.textManager.removeLabel(e);
			} catch {
				this.scene.remove(e);
			}
		}), delete this.meshes[e]);
	}
	showPosition(e, t, n) {
		let r = n.color || this.settings.color, i = n.fontSize || this.settings.fontSize, a = t[0], o = getPosition(this.viewer.atoms.positions[a]), s = `${this.viewer.atoms.symbols[a]} [${o.map((e) => e.toFixed(3)).join(", ")}]`, c = [
			o[0] + .5,
			o[1],
			o[2]
		], l = this.textManager.addLabel({
			position: c,
			text: s,
			color: r,
			fontSize: i
		});
		this.meshes[e] = [l];
	}
	showDistance(e, t, n) {
		let r = n.color || this.settings.color, i = n.fontSize || this.settings.fontSize, a = getPosition(this.viewer.atoms.positions[t[0]]), o = getPosition(this.viewer.atoms.positions[t[1]]), s = [
			(a[0] + o[0]) / 2,
			(a[1] + o[1]) / 2,
			(a[2] + o[2]) / 2
		], c = getDistance(a, o), l = this.shapeRegistry.create("Line", {
			start: a,
			end: o,
			color: 255,
			lineWidth: 1
		});
		this.scene.add(l);
		let u = this.textManager.addLabel({
			position: s,
			text: c.toFixed(3),
			color: r,
			fontSize: i
		});
		this.meshes[e] = [l, u];
	}
	showAngle(e, t, n) {
		let r = n.color || this.settings.color, i = n.fontSize || this.settings.fontSize, a = getPosition(this.viewer.atoms.positions[t[0]]), o = getPosition(this.viewer.atoms.positions[t[1]]), s = getPosition(this.viewer.atoms.positions[t[2]]), c = getAngle(a, o, s), l = this.shapeRegistry.create("Line", {
			start: a,
			end: o,
			color: 255,
			lineWidth: 1
		}), u = this.shapeRegistry.create("Line", {
			start: o,
			end: s,
			color: 255,
			lineWidth: 1
		});
		this.scene.add(l), this.scene.add(u);
		let d = [
			o[0] + (a[0] - o[0] + s[0] - o[0]) * .2,
			o[1] + (a[1] - o[1] + s[1] - o[1]) * .2,
			o[2] + (a[2] - o[2] + s[2] - o[2]) * .2
		], f = this.textManager.addLabel({
			position: d,
			text: c.toFixed(3),
			color: r,
			fontSize: i
		});
		this.meshes[e] = [
			l,
			u,
			f
		];
	}
	showDihedralAngle(e, t, n) {
		let r = n.color || this.settings.color, i = n.fontSize || this.settings.fontSize, a = getPosition(this.viewer.atoms.positions[t[0]]), o = getPosition(this.viewer.atoms.positions[t[1]]), s = getPosition(this.viewer.atoms.positions[t[2]]), c = getPosition(this.viewer.atoms.positions[t[3]]), l = getDihedral(a, o, s, c), u = this.shapeRegistry.create("Line", {
			start: a,
			end: o,
			color: 255
		}), d = this.shapeRegistry.create("Line", {
			start: o,
			end: s,
			color: 255
		}), f = this.shapeRegistry.create("Line", {
			start: s,
			end: c,
			color: 255
		});
		this.scene.add(u), this.scene.add(d), this.scene.add(f);
		let p = [
			(o[0] + s[0]) * .3 - .3,
			(o[1] + s[1]) * .3 - .3,
			(o[2] + s[2]) * .3 - .3
		], m = this.textManager.addLabel({
			position: p,
			text: l.toFixed(3),
			color: r,
			fontSize: i
		});
		this.meshes[e] = [
			u,
			d,
			f,
			m
		];
	}
	clearMeshes() {
		Object.keys(this.meshes).forEach((e) => this.removeMeasurement(e));
	}
	addSetting(e, { indices: t = [], color: n, fontSize: r }) {
		this.settings.measurements[e] = {
			indices: t,
			color: n || this.settings.color,
			fontSize: r || this.settings.fontSize
		};
	}
	toPlainSettings() {
		return { ...this.settings.measurements };
	}
	_onStateChange(e) {
		this.settings = (0, import_lodash_merge.default)({}, DEFAULT_MEASUREMENT_SETTINGS, e), this._rebuild();
	}
	_rebuild() {
		this.clearMeshes(), this.drawMeasurements(), this.viewer.requestRedraw?.("render");
	}
}, Setting = class {
	constructor({ indices: e, scale: t = 1.1, type: n = "sphere", color: r = "yellow", opacity: i = .6 }) {
		this.indices = e, this.color = convertColor$1(r), this.scale = t, this.type = n, this.opacity = i;
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
}, HighlightManager = class {
	constructor(e) {
		this.viewer = e, this.settings = {}, this.meshes = {}, this._tmpCenter = new THREE$1.Vector3(), this._tmpBillboardScale = new THREE$1.Vector3(), this._tmpBillboardScale2 = new THREE$1.Vector3(), this._tmpBillboardMatrix = new THREE$1.Matrix4(), this._tmpBillboardQuat = new THREE$1.Quaternion(), this._tmpBillboardZero = new THREE$1.Vector3(0, 0, 0), this._tmpBillboardAtomMatrix = new THREE$1.Matrix4(), this._tmpDecomposeQuat = new THREE$1.Quaternion(), this._tmpCameraDir = new THREE$1.Vector3(), this._tmpCameraPos = new THREE$1.Vector3(), this._tmpToCameraDir = new THREE$1.Vector3(), this._crossViewThicknessDefault = .05, this._crossViewSettings = {}, this._crossViewIndices = /* @__PURE__ */ new Set(), this._crossViewNeedsUpdate = !1, this._cameraSignature = new Float32Array(32), this._hasCameraSignature = !1, this.init();
		let t = this.viewer.state.get("plugins.highlight");
		t && t.settings && (this.applySettings(t.settings), this.drawHighlightAtoms()), this.viewer.state.subscribe("plugins.highlight", (e) => {
			!e || !e.settings || (this.applySettings(e.settings), !this.viewer._initializingState && this.drawHighlightAtoms());
		});
	}
	init() {
		this.viewer.logger.debug("init highlight settings"), this.settings = { selection: new Setting({
			indices: [],
			scale: 1.1,
			color: "#ffff00"
		}) };
	}
	setSettings(e) {
		this.viewer.state.set({ plugins: { highlight: { settings: cloneValue(e) } } });
	}
	applySettings(e) {
		this.settings = {}, this.clearMeshes(), this._crossViewSettings = {}, this._crossViewIndices = /* @__PURE__ */ new Set(), this._crossViewNeedsUpdate = !1, Object.entries(e).forEach(([e, t]) => {
			this.addSetting(e, t);
		});
	}
	addSetting(e, { indices: t, scale: n = 1.1, type: r = "sphere", color: i = "#3d82ed", opacity: a = .6 }) {
		let o = new Setting({
			indices: t,
			scale: n,
			type: r,
			color: i,
			opacity: a
		});
		this.settings[e] = o;
	}
	toPlainSettings() {
		let e = {};
		return Object.entries(this.settings).forEach(([t, n]) => {
			e[t] = n && typeof n.toDict == "function" ? n.toDict() : n;
		}), e;
	}
	clearMeshes() {
		Object.values(this.meshes).forEach((e) => {
			e.parent && e.parent.remove(e);
		}), this.meshes = {};
	}
	drawHighlightAtoms() {
		if (this.clearMeshes(), !this.viewer.atomManager.meshes.atom) return;
		let e = new THREE$1.MeshBasicMaterial({
			color: "yellow",
			opacity: .6,
			transparent: !0
		});
		e.depthWrite = !1, e.depthTest = !0;
		let t = new THREE$1.SphereGeometry(1, 16, 16);
		this.drawHighlightMesh("sphere", t, e);
		let n = e.clone();
		n.color = "green";
		let r = new THREE$1.BoxGeometry(2, 2, 2);
		this.drawHighlightMesh("box", r, n);
		let i = new THREE$1.MeshBasicMaterial({
			color: 16777215,
			opacity: 1,
			transparent: !0,
			vertexColors: !0
		}), a = this.createCrossGeometry(1);
		this.drawHighlightMesh("cross", a, i);
		let o = new THREE$1.MeshBasicMaterial({
			color: 16777215,
			opacity: 1,
			transparent: !0,
			side: THREE$1.DoubleSide,
			depthWrite: !1,
			vertexColors: !0
		}), s = this.createCrossBillboardBarGeometry(), c = s.clone();
		c.rotateZ(Math.PI / 2), this.drawHighlightMesh("crossViewX", s, o), this.drawHighlightMesh("crossViewY", c, o), this.viewer.requestRedraw?.("render");
	}
	drawHighlightMesh(e, t, n) {
		let r = this.viewer.atomManager.meshes.atom;
		if (!r) return;
		let i = new THREE$1.InstancedMesh(t, n, r.count);
		i.renderOrder = 10;
		let a = new THREE$1.Vector3(), o = new THREE$1.Quaternion(), s = new THREE$1.Vector3(), c = new THREE$1.Matrix4(), l = new THREE$1.Matrix4();
		for (let e = 0; e < r.count; e++) r.getMatrixAt(e, c), c.decompose(a, o, s), s.multiplyScalar(0), l.compose(a, o, s), i.setMatrixAt(e, l);
		i.instanceMatrix.needsUpdate = !0, r.add(i), i.layers.set(1), this.meshes[e] = i, Object.values(this.settings).forEach((e) => {
			this.updateHighlightAtomsMesh(e);
		});
	}
	createCrossGeometry(e = 1) {
		let t = new THREE$1.TorusGeometry(e, .1, 16, 20), n = new THREE$1.TorusGeometry(e, .1, 16, 20);
		n.rotateX(Math.PI / 2);
		let r = new THREE$1.TorusGeometry(e, .1, 16, 20);
		return r.rotateY(Math.PI / 2), mergeGeometries([
			t,
			n,
			r
		]);
	}
	createCrossBillboardBarGeometry() {
		return new THREE$1.PlaneGeometry(2, 1);
	}
	updateHighlightAtomsMesh({ indices: e = [], scale: t = 1.1, color: n = "yellow", type: r = "sphere", opacity: i = null, occlude: a = !0, offset: o = 1.0005, thickness: s = null }, c = null) {
		if (r === "crossView") {
			let r = c || "crossView";
			this._crossViewSettings[r] = {
				indices: e,
				scale: t,
				color: n,
				occlude: a,
				offset: o,
				thickness: s
			}, this.updateCrossViewMaterialOcclusion(), this._crossViewNeedsUpdate = !0;
			return;
		}
		if (this.viewer.atoms.symbols.length > 0 && this.meshes[r]) {
			if (i != null) {
				let e = this.meshes[r].material;
				e && (e.transparent = !0, e.opacity = i, e.needsUpdate = !0);
			}
			let a = new THREE$1.Vector3(), o = new THREE$1.Quaternion(), s = new THREE$1.Vector3();
			e.forEach((e) => {
				let i = new THREE$1.Matrix4();
				this.viewer.atomManager.meshes.atom.getMatrixAt(e, i), i.decompose(a, o, s), s.multiplyScalar(t), i.compose(a, o, s), this.meshes[r].setMatrixAt(e, i), this.meshes[r].setColorAt(e, convertColor$1(n));
			}), this.meshes[r].instanceMatrix.needsUpdate = !0;
		}
	}
	updateLabelSizes(e = null, t = null) {
		let n = e || this.viewer?.tjs?.camera, r = t || this.viewer?.tjs?.renderers?.MainRenderer?.renderer;
		if (!n || !r) return;
		n.updateMatrixWorld(!0);
		let i = this.viewer.atomManager?.meshes?.atom;
		i && typeof i.updateMatrixWorld == "function" && i.updateMatrixWorld(!0);
		let a = this._cameraChanged(n);
		(this._crossViewNeedsUpdate || a) && (this.updateCrossViewInstances(n), this._crossViewNeedsUpdate = !1);
	}
	updateCrossViewInstances(e) {
		let t = this.meshes.crossViewX, n = this.meshes.crossViewY, r = this.viewer.atomManager?.meshes?.atom;
		if (!t || !n || !r || !e) return;
		e.getWorldQuaternion(this._tmpBillboardQuat), e.getWorldDirection(this._tmpCameraDir), e.getWorldPosition(this._tmpCameraPos);
		let i = /* @__PURE__ */ new Set();
		Object.values(this._crossViewSettings).forEach((a) => {
			let { indices: o = [], scale: s = 1.1, color: c = "yellow", offset: l = 1.0005, thickness: u = null } = a || {}, d = Number.isFinite(u) ? u : this._crossViewThicknessDefault;
			o.forEach((a) => {
				i.add(a), r.getMatrixAt(a, this._tmpBillboardAtomMatrix), this._tmpBillboardAtomMatrix.decompose(this._tmpCenter, this._tmpDecomposeQuat, this._tmpBillboardScale);
				let o = this._tmpBillboardScale.x || this._tmpBillboardScale.y || this._tmpBillboardScale.z || 1;
				this._tmpBillboardScale.set(o * s, d, 1), this._tmpBillboardScale2.set(d, o * s, 1), e.isOrthographicCamera ? this._tmpCenter.addScaledVector(this._tmpCameraDir, -o * l) : (this._tmpToCameraDir.copy(this._tmpCenter).sub(this._tmpCameraPos).normalize(), this._tmpCenter.addScaledVector(this._tmpToCameraDir, -o * l)), this._tmpBillboardMatrix.compose(this._tmpCenter, this._tmpBillboardQuat, this._tmpBillboardScale), t.setMatrixAt(a, this._tmpBillboardMatrix), t.setColorAt(a, convertColor$1(c)), this._tmpBillboardMatrix.compose(this._tmpCenter, this._tmpBillboardQuat, this._tmpBillboardScale2), n.setMatrixAt(a, this._tmpBillboardMatrix), n.setColorAt(a, convertColor$1(c));
			});
		}), this._crossViewIndices.forEach((e) => {
			i.has(e) || (r.getMatrixAt(e, this._tmpBillboardAtomMatrix), this._tmpBillboardAtomMatrix.decompose(this._tmpCenter, this._tmpDecomposeQuat, this._tmpBillboardScale), this._tmpBillboardMatrix.compose(this._tmpCenter, this._tmpBillboardQuat, this._tmpBillboardZero), t.setMatrixAt(e, this._tmpBillboardMatrix), n.setMatrixAt(e, this._tmpBillboardMatrix));
		}), this._crossViewIndices = i, t.instanceMatrix.needsUpdate = !0, n.instanceMatrix.needsUpdate = !0, t.instanceColor && (t.instanceColor.needsUpdate = !0), n.instanceColor && (n.instanceColor.needsUpdate = !0);
	}
	updateCrossViewMaterialOcclusion() {
		let e = this.meshes.crossViewX, t = this.meshes.crossViewY;
		if (!e || !e.material || !t || !t.material) return;
		let n = Object.values(this._crossViewSettings).some((e) => e?.occlude !== !1);
		e.material.depthTest = n, t.material.depthTest = n, e.material.needsUpdate = !0, t.material.needsUpdate = !0;
	}
	_cameraChanged(e) {
		let t = e.matrixWorld.elements, n = e.projectionMatrix.elements, r = !1;
		for (let e = 0; e < 16; e++) {
			let n = t[e];
			(!this._hasCameraSignature || Math.abs(this._cameraSignature[e] - n) > 1e-6) && (r = !0), this._cameraSignature[e] = n;
		}
		for (let e = 0; e < 16; e++) {
			let t = n[e], i = 16 + e;
			(!this._hasCameraSignature || Math.abs(this._cameraSignature[i] - t) > 1e-6) && (r = !0), this._cameraSignature[i] = t;
		}
		return this._hasCameraSignature = !0, r;
	}
}, AtomsLegend = class {
	constructor(e, t) {
		this.viewer = e, this.legendHUD = this.viewer.tjs.hud.legendHUD, this.guiConfig = t, this.addLegend();
	}
	addLegend() {
		this.legendHUD ||= this.viewer.tjs.hud.legendHUD;
		let e = this.viewer.atomManager.settings;
		Object.entries(e).forEach(([e, t]) => {
			let n = typeof t.color == "string" ? t.color : `#${t.color.getHexString()}`, r = `atoms:${e}`;
			this.legendHUD.addEntry(r, {
				label: e,
				color: n,
				shape: "sphere",
				size: this._radiusToLegendSize(t.radius)
			});
		});
	}
	removeLegend() {
		this.legendHUD ||= this.viewer.tjs.hud.legendHUD, Array.from(this.legendHUD.entries.keys()).filter((e) => e.startsWith("atoms:")).forEach((e) => this.legendHUD.removeEntry(e));
	}
	updateLegend() {
		this.removeLegend(), this.addLegend();
	}
	getLegendConfig() {
		return {
			enabled: !0,
			...this.guiConfig.legend,
			...this.guiConfig.atomLegend
		};
	}
	_radiusToLegendSize(e) {
		return Math.min(30, Math.max(12, e * 24));
	}
}, AtomsGUI = class {
	constructor(e, t, n) {
		this.viewer = e, this.gui = t, this.guiConfig = n, this.atomLegendConfig = this.getAtomLegendConfig(), this.isSyncing = !1, this.tempBoundary = this.viewer.boundary.map((e) => e.slice()), this.div = document.createElement("div"), this.viewer.tjs.containerElement.appendChild(this.div), this.viewer.tjs.containerElement.addEventListener("viewerUpdated", (e) => {
			this.updateViewerControl(e.detail);
		}), this.viewer.state.subscribe("cell", (e) => {
			e && (this.beginSync(), e.showCell !== void 0 && this.updateShowCell(e.showCell), e.showAxes !== void 0 && this.updateShowAxes(e.showAxes), this.endSync());
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
		let e = this.gui.addFolder("Atoms");
		this.modelStyleController = e.add({ modelStyle: this.viewer.modelStyle }, "modelStyle", MODEL_STYLE_MAP).onChange((e) => {
			this.isSyncing || this.viewer.weas.ops.isRestoring || this.viewer.setState({ modelStyle: e }, {
				record: !0,
				redraw: "full"
			});
		}).name("Model Style");
		let t = { radiusType: this.viewer.radiusType };
		this.radiusTypeController = e.add(t, "radiusType", radiusTypes).name("Radius Type").onChange((e) => {
			this.isSyncing || this.viewer.weas.ops.isRestoring || this.viewer.setState({ radiusType: e }, {
				record: !0,
				redraw: "full"
			});
		});
		let n = { atomLabelType: this.viewer.atomLabelType };
		this.atomLabelTypeController = e.add(n, "atomLabelType", [
			"None",
			"Symbol",
			"Index"
		]).onChange((e) => {
			this.isSyncing || this.viewer.weas.ops.isRestoring || this.viewer.setState({ atomLabelType: e }, {
				record: !0,
				redraw: "labels"
			});
		}).name("Atom Label");
		let r = { materialType: this.viewer.materialType };
		this.materialTypeController = e.add(r, "materialType", [
			"Standard",
			"Phong",
			"Basic"
		]).onChange((e) => {
			this.isSyncing || this.viewer.weas.ops.isRestoring || this.viewer.setState({ materialType: e }, {
				record: !0,
				redraw: "full"
			});
		}).name("Material Type");
		let i = { atomScale: this.viewer.atomScale };
		this.atomScaleController = e.add(i, "atomScale", .1, 2).name("Atom Scale").onChange((e) => {
			this.isSyncing || this.viewer.weas.ops.isRestoring || this.viewer.setState({ atomScale: e }, {
				record: !0,
				redraw: "render"
			});
		});
		let a = { showCell: this.viewer.cellManager.showCell };
		this.showCellController = e.add(a, "showCell").name("Unit Cell").onChange((e) => {
			this.isSyncing || this.viewer.weas.ops.isRestoring || this.viewer.weas.ops.settings.SetCellSettings({ showCell: e });
		});
		let o = { showAxes: this.viewer.cellManager.showAxes };
		this.showCellAxesController = e.add(o, "showAxes").name("Crystal Axes").onChange((e) => {
			this.isSyncing || this.viewer.weas.ops.isRestoring || this.viewer.weas.ops.settings.SetCellSettings({ showAxes: e });
		}), this.showBondedAtomsController = e.add({ showBondedAtoms: this.viewer.showBondedAtoms }, "showBondedAtoms").name("Bonded Atoms").onChange((e) => {
			this.isSyncing || this.viewer.weas.ops.isRestoring || this.viewer.setState({ showBondedAtoms: e }, {
				record: !0,
				redraw: "full"
			});
		}), this.legendToggleController = e.add(this.atomLegendConfig, "enabled").name("Show Legend").onChange((e) => {
			this.atomLegendConfig.enabled = e, this.updateLegend();
		}), this.addReplaceAtomControl(e), this.addAddAtomControl(e), this.addBoundaryControl(e);
	}
	addReplaceAtomControl(e) {
		let t = e.addFolder("Replace Atom"), n = { symbol: "C" };
		this.replaceAtomController = t.add(n, "symbol").name("New Element Symbol"), t.add({ replaceSelectedAtoms: () => {
			let e = n.symbol;
			if (this.viewer.selectedAtomsIndices && this.viewer.selectedAtomsIndices.length > 0) {
				let t = new ReplaceOperation({
					weas: this.viewer.weas,
					symbol: e
				});
				this.viewer.weas.ops.execute(t), this.viewer.weas.eventHandlers.dispatchAtomsUpdated();
			} else alert("No atoms selected for replacement.");
		} }, "replaceSelectedAtoms").name("Replace Selected Atoms");
	}
	addAddAtomControl(e) {
		let t = e.addFolder("Add Atom"), n = { symbol: "C" };
		this.addAtomController = t.add(n, "symbol").name("New Element Symbol"), t.add({ addAtoms: () => {
			let e = new AddAtomOperation({
				weas: this.viewer.weas,
				symbol: n.symbol
			});
			this.viewer.weas.ops.execute(e), this.viewer.weas.eventHandlers.dispatchAtomsUpdated();
		} }, "addAtoms").name("Add Selected Atoms");
	}
	addBoundaryControl(e) {
		let t = e.addFolder("Boundary");
		this.boundaryControllers = [
			[],
			[],
			[]
		], [
			"X",
			"Y",
			"Z"
		].forEach((e, n) => {
			this.boundaryControllers[n].push(t.add({ [`min${e}`]: this.viewer.boundary[n][0] }, `min${e}`, -10, 10).onChange((e) => this.updateBoundaryValue(n, 0, e)).name(`Min ${e}`)), this.boundaryControllers[n].push(t.add({ [`max${e}`]: this.viewer.boundary[n][1] }, `max${e}`, -10, 10).onChange((e) => this.updateBoundaryValue(n, 1, e)).name(`Max ${e}`));
		}), t.add({ apply: () => this.applyBoundaryChanges() }, "apply").name("Apply Changes"), this.wrapOnMoveController = t.add({ wrapOnMove: this.viewer.wrapOnMove }, "wrapOnMove").name("Wrap On Move").onChange((e) => {
			this.isSyncing || this.viewer.weas.ops.isRestoring || this.viewer.setState({ wrapOnMove: e }, {
				record: !0,
				redraw: "none"
			});
		});
	}
	addColorControl() {
		let e = this.gui.addFolder("Color");
		this.backgroundColorController = e.addColor(this.viewer, "backgroundColor").name("Background").onChange((e) => {
			this.isSyncing || this.viewer.weas.ops.isRestoring || this.viewer.setState({ backgroundColor: e }, {
				record: !0,
				redraw: "render"
			});
		}), this.colorByController = e.add({ colorBy: this.viewer.colorBy }, "colorBy", colorBys).onChange((e) => {
			this.isSyncing || this.viewer.weas.ops.isRestoring || this.viewer.setState({ colorBy: e }, {
				record: !0,
				redraw: "full"
			});
		}).name("Color By"), this.colorTypeController = e.add({ colorType: this.viewer.colorType }, "colorType", colorTypes).onChange((e) => {
			this.isSyncing || this.viewer.weas.ops.isRestoring || this.viewer.setState({ colorType: e }, {
				record: !0,
				redraw: "full"
			});
		}).name("Color Type");
	}
	addTimeline() {
		if (this.timelineKey) return;
		let e = (e) => e.stopPropagation(), t = document.createElement("div");
		t.id = "animation-controls", Object.assign(t.style, {
			pointerEvents: "auto",
			fontFamily: "monospace",
			display: "inline-flex",
			alignItems: "center",
			gap: "8px",
			padding: "6px 8px",
			background: "rgba(20, 20, 20, 0.6)",
			borderRadius: "8px",
			color: "#ffffff",
			fontSize: "12px",
			flex: "0 0 auto"
		}), [
			"click",
			"pointerdown",
			"pointerup",
			"mousedown",
			"mouseup"
		].forEach((n) => {
			t.addEventListener(n, e);
		}), t.innerHTML = "\n      <button id=\"play-pause-btn\">Play</button>\n      <button id=\"reset-btn\">Reset</button>\n      <input type=\"range\" id=\"timeline\" min=\"0\" max=\"100\" value=\"0\">\n      <span id=\"current-frame\">0</span>\n    ", this.timelineKey = "atoms:timeline-controls", this.viewer.tjs.hud.addHTMLPanel(this.timelineKey, t, {
			anchor: "bottom-center",
			visible: !0
		}), this.playPauseBtn = t.querySelector("#play-pause-btn"), this.resetBtn = t.querySelector("#reset-btn"), this.timeline = t.querySelector("#timeline"), this.currentFrameDisplay = t.querySelector("#current-frame");
		let n = (e) => {
			Object.assign(e.style, {
				background: "rgba(255,255,255,0.1)",
				border: "1px solid rgba(197, 197, 197, 0.2)",
				color: "#eee",
				padding: "4px 8px",
				borderRadius: "4px",
				cursor: "pointer",
				transition: "all 0.15s ease",
				minWidth: "55px",
				textAlign: "center"
			}), e.addEventListener("mouseenter", () => {
				e.style.background = "rgba(255,255,255,0.2)";
			}), e.addEventListener("mouseleave", () => {
				e.style.background = "rgba(255,255,255,0.1)";
			});
		};
		n(this.playPauseBtn), n(this.resetBtn), Object.assign(this.timeline.style, {
			cursor: "pointer",
			height: "4px",
			accentColor: "#4cc9f0",
			minWidth: "300px",
			maxWidth: "800px",
			maxHeight: "50px"
		}), Object.assign(this.currentFrameDisplay.style, {
			minWidth: "24px",
			textAlign: "right",
			opacity: "0.9",
			fontVariantNumeric: "tabular-nums"
		}), this.playPauseBtn.addEventListener("click", () => {
			this.viewer.isPlaying = !this.viewer.isPlaying, this.playPauseBtn.textContent = this.viewer.isPlaying ? "Pause" : "Play", this.viewer.isPlaying && this.viewer.play();
		}), this.resetBtn.addEventListener("click", () => {
			this.viewer.currentFrame = 0;
		}), this.timeline.addEventListener("input", () => {
			let e = parseInt(this.timeline.value, 10);
			this.viewer.weas.eventHandlers.isDragging && !this.viewer.continuousUpdate ? this.timelineIsDragging = !0 : (this.timelineIsDragging = !1, this.viewer.currentFrame = e), this.currentFrameDisplay.textContent = e;
		}), this.timeline.addEventListener("mouseup", () => {
			this.timelineIsDragging = !1, this.viewer.currentFrame = parseInt(this.timeline.value, 10);
		});
	}
	removeTimeline() {
		if (!this.timelineKey) return;
		let e = this.viewer.tjs.hud.htmlElements.get(this.timelineKey);
		e && (e.element.remove(), this.viewer.tjs.hud.htmlElements.delete(this.timelineKey)), this.timelineKey = null;
	}
	updateBoundaryValue(e, t, n) {
		this.tempBoundary[e][t] = parseFloat(n);
	}
	applyBoundaryChanges() {
		this.isSyncing || this.viewer.weas.ops.isRestoring || this.viewer.setState({ boundary: this.tempBoundary }, {
			record: !0,
			redraw: "full"
		});
	}
	removeLegend() {
		this.legend.removeLegend();
	}
	updateLegend() {
		this.atomLegendConfig.enabled ? this.legend.updateLegend() : this.removeLegend();
	}
	getAtomLegendConfig() {
		return !this.guiConfig.atomLegend && this.guiConfig.legend && (this.guiConfig.atomLegend = this.guiConfig.legend), this.guiConfig.atomLegend || (this.guiConfig.atomLegend = {
			enabled: !1,
			position: "bottom-right"
		}), this.guiConfig.atomLegend;
	}
	updateViewerControl(e) {
		this.isSyncing = !0, Object.entries(e).forEach(([e, t]) => {
			switch (e) {
				case "modelStyle":
					this.updateModelStyle(t);
					break;
				case "radiusType":
					this.updateRadiusType(t);
					break;
				case "atomLabelType":
					this.updateAtomLabelType(t);
					break;
				case "materialType":
					this.updateMaterialType(t);
					break;
				case "atomScale":
					this.updateAtomScale(t);
					break;
				case "showCell":
					this.updateShowCell(t);
					break;
				case "showBondedAtoms":
					this.updateShowBondedAtoms(t);
					break;
				case "colorBy":
					this.updateColorBy(t);
					break;
				case "colorType":
					this.updateColorType(t);
					break;
				case "backgroundColor":
					this.updateBackgroundColor(t);
					break;
				case "isPlaying": break;
				case "currentFrame": break;
				case "boundary":
					this.updateBoundary(t);
					break;
				case "wrapOnMove":
					this.updateWrapOnMove(t);
					break;
				default: break;
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
			this.tempBoundary = e.map((e) => e.slice());
			for (let t = 0; t < 3; t++) for (let n = 0; n < 2; n++) {
				let r = this.boundaryControllers[t][n];
				r && r.getValue() !== e[t][n] && r.setValue(e[t][n]);
			}
		}
	}
	updateWrapOnMove(e) {
		this.wrapOnMoveController && this.wrapOnMoveController.getValue() !== e && this.wrapOnMoveController.setValue(e);
	}
};
//#endregion
//#region src/atoms/plugins/phonon.js
function vec_dot(e, t) {
	return e.reduce((e, n, r) => e + n * t[r], 0);
}
function complexPolar(e, t) {
	return {
		real: e * Math.cos(t),
		imag: e * Math.sin(t),
		mult(e) {
			return {
				real: this.real * e.real - this.imag * e.imag,
				imag: this.real * e.imag + this.imag * e.real
			};
		}
	};
}
var Phonon = class {
	constructor(e, t = null, n = null, r = !0) {
		this.atoms = e, this.kpoint = t, this.eigenvectors = n, this.addatomphase = r, this.vibrations = [];
	}
	calculateVibrations(e = [
		1,
		1,
		1
	]) {
		let [t, n, r] = e, i = this.atoms.calculateFractionalCoordinates(), a = this.atoms.positions.length, o = [];
		o = this.addatomphase ? i.map((e) => vec_dot(this.kpoint, e)) : Array(a).fill(0);
		for (let e = 0; e < t; e++) for (let t = 0; t < n; t++) for (let n = 0; n < r; n++) for (let r = 0; r < a; r++) {
			let i = complexPolar(1, (vec_dot(this.kpoint, [
				e,
				t,
				n
			]) + o[r]) * 2 * Math.PI);
			this.vibrations.push(this.eigenvectors[r].map((e) => i.mult({
				real: e[0],
				imag: e[1]
			})));
		}
	}
	getTrajectory(e, t, n = null, r = null, i = null, a = [
		1,
		1,
		1
	], o = null) {
		if (i && (this.atoms = i), n && (this.kpoint = n), r && (this.eigenvectors = r), this.kpoint === null || this.eigenvectors === null) throw Error("kpoint and eigenvectors must be provided");
		o !== null && (this.addatomphase = o), this.calculateVibrations(a);
		let s = [];
		return Array.from({ length: t }, (e, n) => 2 * Math.PI * (n / t)).forEach((t) => {
			let n = this.atoms.multiply({
				mx: a[0],
				my: a[1],
				mz: a[2]
			}), r = complexPolar(e, t), i = [];
			for (let e = 0; e < n.positions.length; e++) {
				let t = this.vibrations[e].map((e) => r.mult(e).real);
				n.positions[e] = n.positions[e].map((e, n) => e + t[n] / 5), i.push(t);
			}
			n.newAttribute({
				name: "movement",
				values: i
			}), s.push(n);
		}), s;
	}
}, Logger = class {
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
		let e = (/* @__PURE__ */ Error()).stack.split("\n")[4], t = e.match(/at (.*?) \((.*?):(\d+):(\d+)\)/) || e.match(/at (.*?):(\d+):(\d+)/);
		return t ? `${t[1]}` : "Unknown location";
	}
	log(e, ...t) {
		if (this.levels[this.level] >= this.levels[e]) {
			let n = this.getCallerInfo();
			console.log(`[${e.toUpperCase()}] [${n}]`, ...t);
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
			let t = Date.now() - this.timers[e];
			console.info(`INFO: ${e}: ${t}ms`), delete this.timers[e];
		}
	}
}, AtomsViewer = class {
	constructor({ weas: e, atoms: t = [new Atoms()], viewerConfig: n = {} }) {
		this.uuid = THREE$1.MathUtils.generateUUID(), this.weas = e, this.tjs = e.tjs, this.state = e.state;
		let r = {
			...defaultViewerSettings,
			...n
		};
		this._ready = !1, this._modelStyle = r.modelStyle, this._colorBy = r.colorBy, this._colorType = r.colorType, this._colorRamp = r.colorRamp, this._radiusType = r.radiusType, this._materialType = r.materialType, this._atomLabelType = r.atomLabelType, this._showBondedAtoms = r.showBondedAtoms, this._boundary = r.boundary, this._atomScale = r.atomScale, this._wrapOnMove = r.wrapOnMove, this._backgroundColor = r.backgroundColor, this.tjs.scene.background = new THREE$1.Color(this._backgroundColor), this._selectedAtomsIndices = [], this.baseAtomLabelSettings = [], this.debug = r.debug, this._continuousUpdate = r.continuousUpdate, this._autoResetCameraOnAtomsUpdate = r.autoResetCameraOnAtomsUpdate, this._hasInitializedCamera = !1, this._currentFrame = 0, this._updateDepth = 0, this._pendingRedraw = null, this._syncingState = !1, this._initializingState = !1, this._atomScales = [], this._modelSticks = [], this._modelPolyhedras = [], this.logger = new Logger(r.logLevel || "warn"), this.trajectory = [new Atoms()], this.isPlaying = !1, this.frameDuration = 100, this.atomManager = new AtomManager(this), this.cellManager = new CellManager(this, r.cellSettings), this.highlightManager = new HighlightManager(this), this.guiManager = new AtomsGUI(this, this.weas.guiManager.gui, this.weas.guiManager.guiConfig), this.bondManager = new BondManager(this, r.bondSettings), this.boundaryManager = new BoundaryManager(this), this.polyhedraManager = new PolyhedraManager(this), this.isosurfaceManager = new Isosurface(this), this.fermiSurfaceManager = new FermiSurface(this), this.volumeSliceManager = new VolumeSlice(this), this.ALManager = new AtomLabelManager(this), this.Measurement = new Measurement(this), this.VFManager = new VectorField(this), this.animate = this.animate.bind(this), this._atoms = null, this._cell = null, this._frameSignature = null, this.init(t), this.initializeStateStore(r), this.setupStateSubscriptions();
	}
	initializeStateStore(e) {
		this.state.transaction(() => {
			this.state.set({ viewer: {
				...e,
				atomScales: this._atomScales,
				modelSticks: this._modelSticks,
				modelPolyhedras: this._modelPolyhedras,
				selectedAtomsIndices: []
			} }), e.cellSettings && this.state.set({ cell: { ...e.cellSettings } }), e.bondSettings && this.state.set({ bond: { ...e.bondSettings } });
		});
	}
	setupStateSubscriptions() {
		this.state.subscribe("viewer", (e, t) => {
			if (!e || this._syncingState || this._initializingState) return;
			let n = t || {}, r = {};
			Object.keys(e).forEach((t) => {
				JSON.stringify(e[t]) !== JSON.stringify(n[t]) && (r[t] = e[t]);
			}), Object.keys(r).length !== 0 && this.applyState(r, {
				redraw: "auto",
				skipStore: !0
			});
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
		this.volumetricData = null, this.fermiSurfaceData = null, this.atomLabels = [], this.atomArrows = null, this.atomColors = [], this._atomScales = [], this._modelSticks = [], this._modelPolyhedras = [], this.boundary = [
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
		let e = Date.now();
		this.isPlaying && this.trajectory.length > 0 && e - this.lastFrameTime > this.frameDuration && (this.currentFrame = (this.currentFrame + 1) % this.trajectory.length, this.lastFrameTime = e), this.isPlaying && requestAnimationFrame(this.animate);
	}
	updateFrame(e) {
		if (this.trajectory.length <= 1) return;
		let t = this.trajectory[e % this.trajectory.length];
		this.guiManager.timeline && (this.guiManager.timeline.value = e, this.guiManager.currentFrameDisplay.textContent = e);
		let n = this.getFrameSignature(t), r = this.atomManager.meshes.atom;
		if (!r || r.count !== t.getAtomsCount() || this._frameSignature !== n) {
			this._frameSignature = n, this.rebuildForFrame(t);
			return;
		}
		this.atomManager.updateAtomMesh(null, t), this.ALManager.updateLabelPositions(t), this.isPlaying ? (this.bondManager.updateBondMesh(null, t), this.polyhedraManager.updatePolyhedraMesh(null, t)) : this.drawModels(), this.VFManager.updateArrowMesh(null, t), this.cellManager.updateCellMesh(this.originalCell), this.updateAtomLabels(), Object.values(this.highlightManager.settings).forEach((e) => {
			this.highlightManager.updateHighlightAtomsMesh(e);
		});
	}
	get currentFrame() {
		return this._currentFrame;
	}
	set currentFrame(e) {
		this.currentFrame !== e && (this._currentFrame = e, this.lastFrameTime = Date.now(), this._syncAnimationState(), this.updateFrame(e), this.requestRedraw("render"));
	}
	_syncAnimationState() {
		this.state && this.state.set({ animation: {
			currentFrame: this._currentFrame,
			isPlaying: this.isPlaying,
			frameDuration: this.frameDuration
		} });
	}
	get originalCell() {
		return this._cell ? this._cell : this.originalAtoms.cell;
	}
	get originalAtoms() {
		return this._atoms ? this._atoms : this.atoms;
	}
	get atoms() {
		let e = this.trajectory[this.currentFrame];
		return e.uuid = this.uuid, e;
	}
	set atoms(e) {
		this.ready = !1, this.dispose(), this.reset(), this.updateAtoms(e);
	}
	updateAtoms(e) {
		this._initializingState = !0;
		try {
			Array.isArray(e) && e.length > 1 || Array.isArray(e) && e.length === 1 ? this.trajectory = e : this.trajectory = [e], this._cell = null, this._atoms = null, this._currentFrame = 0, this._frameSignature = this.getFrameSignature(this.atoms), this.selectedAtomsIndices = [], this.cellManager.cell = this.atoms.cell, this.atomManager.init(), this.highlightManager.init(), this.bondManager.init(), this.state.transaction(() => {
				let e = this.state.get("plugins.highlight") || {};
				!e.settings || Object.keys(e.settings).length === 0 ? this.state.set({ plugins: { highlight: { settings: this.highlightManager.toPlainSettings() } } }) : this.highlightManager.applySettings(e.settings);
				let t = this.state.get("plugins.species") || {}, n = this.atomManager.toPlainSettings();
				if (t.settings && Object.keys(t.settings).length > 0) {
					let e = {
						...n,
						...t.settings
					};
					this.atomManager.applySettings(e), this.state.set({ plugins: { species: { settings: e } } });
				} else this.state.set({ plugins: { species: { settings: n } } });
				let r = this.state.get("bond") || {}, i = this.bondManager.toPlainSettings();
				if (r.settings && Object.keys(r.settings).length > 0) {
					let e = {
						...i,
						...r.settings
					};
					this.bondManager.applySettings(e), this.state.set({ bond: { settings: e } });
				} else this.state.set({ bond: { settings: i } });
			}), this.polyhedraManager.init(), this.state.transaction(() => {
				let e = this.state.get("plugins.polyhedra") || {};
				Array.isArray(e.settings) && e.settings.length > 0 ? this.polyhedraManager.applySettings(e.settings) : this.state.set({ plugins: { polyhedra: { settings: this.polyhedraManager.toPlainSettings() } } });
			}), this.VFManager.init(), this.isosurfaceManager.reset(), this.volumeSliceManager.reset(), this.Measurement.reset(), this.state.set({ plugins: { measurement: { settings: null } } }), this.guiManager.update(this.trajectory), this.guiManager.updateLegend(), this._syncingState = !0;
			try {
				let e = this.getStateModelArrays(this.atoms.getAtomsCount());
				e ? (this.atomScales = e.atomScales, this.modelSticks = e.modelSticks, this.modelPolyhedras = e.modelPolyhedras) : this.updateModelStyles(this._modelStyle), this.atomLabelType = this._atomLabelType;
			} finally {
				this._syncingState = !1;
			}
			this._syncingState = !0;
			try {
				this.state.set({ viewer: {
					atomScales: this._atomScales,
					modelSticks: this._modelSticks,
					modelPolyhedras: this._modelPolyhedras
				} });
			} finally {
				this._syncingState = !1;
			}
			if (this.baseAtomLabelSettings = this.getAtomLabelSettingsFromType(this._atomLabelType), this.updateAtomLabels(), this.weas.textManager?.redraw?.(), this.drawModels(), (this._autoResetCameraOnAtomsUpdate || !this._hasInitializedCamera) && this.atoms && this.atoms.getAtomsCount() > 0) {
				this._hasInitializedCamera = !0;
				let e;
				if (this.atoms.pbc && this.atoms.pbc.some(Boolean) && !this.atoms.isUndefinedCell()) {
					let t = this.atoms.cell;
					e = [
						(t[0][0] + t[1][0] + t[2][0]) / 2,
						(t[0][1] + t[1][1] + t[2][1]) / 2,
						(t[0][2] + t[1][2] + t[2][2]) / 2
					];
				} else e = this.atoms.getCenterOfGeometry();
				this.weas.tjs.cameraController.view("front", { focus: e }), this.weas.tjs.cameraController.saveView("avr:center-front");
			}
			this.logger.debug("Set atoms successfullly");
		} finally {
			this._initializingState = !1;
		}
	}
	getStateModelArrays(e) {
		let { atomScales: t, modelSticks: n, modelPolyhedras: r } = this.state.get("viewer") || {};
		return Array.isArray(t) && Array.isArray(n) && Array.isArray(r) && t.length === e && n.length === e && r.length === e ? {
			atomScales: t.slice(),
			modelSticks: n.slice(),
			modelPolyhedras: r.slice()
		} : null;
	}
	fromPhononMode({ atoms: e, eigenvectors: t, amplitude: n = 1, factor: r = 1, nframes: i = 30, kpoint: a = [
		0,
		0,
		0
	], repeat: o = [
		1,
		1,
		1
	], color: s = "#ff0000", radius: c = .1 }) {
		this.logger.debug("--------------------------------------From Phonon Mode--------------------------------------"), this.atoms = new Phonon(e, a, t, !0).getTrajectory(n, i, null, null, null, o), this._cell = e.cell, this._atoms = e.multiply({
			mx: o[0],
			my: o[1],
			mz: o[2]
		}), this._atoms.uuid = this.uuid, this.VFManager.addSetting("phonon", {
			origins: "positions",
			vectors: "movement",
			factor: r,
			color: s,
			radius: c
		}), this.bondManager.hideLongBonds = !1, this.drawModels(), this.play();
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
		let t = normalizeModelStyle(e, this._modelStyle);
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
		this._updateDepth > 0 && --this._updateDepth, this._updateDepth === 0 && e && this.flushRedraw();
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
		let t = {
			render: 1,
			labels: 2,
			full: 3
		};
		!e || !t[e] || ((!this._pendingRedraw || t[e] > t[this._pendingRedraw]) && (this._pendingRedraw = e), this._updateDepth === 0 && this.flushRedraw());
	}
	flushRedraw() {
		let e = this._pendingRedraw;
		this._pendingRedraw = null, e && (e === "full" ? this.drawModels() : e === "labels" ? this.updateAtomLabels() : this.tjs.render());
	}
	applyState(e, { redraw: t = "auto", skipStore: n = !1 } = {}) {
		if (!e || Object.keys(e).length === 0) return;
		let r = t === "auto", i = t !== "auto" && t !== "none", a = "modelStyle" in e && !("atomScales" in e || "modelSticks" in e || "modelPolyhedras" in e);
		this.beginUpdate(), this._syncingState = !0;
		try {
			n || this.state.set({ viewer: e }), Object.entries(e).forEach(([e, t]) => {
				if (!(e in this)) {
					this.logger.warn(`Unknown viewer state key: ${e}`);
					return;
				}
				let n = e === "modelStyle" ? normalizeModelStyle(t, this._modelStyle) : t;
				if (e === "selectedAtomsIndices") {
					let n = this._selectedAtomsIndices, i = Array.isArray(t) ? t : [], a = i.filter((e) => !n.includes(e)), o = n.filter((e) => !i.includes(e));
					if (i.length > 0 && !this.weas.eventHandlers?.transformControls?.mode && this.weas.selectionManager.setModeHint(""), (!this.highlightManager.settings || !this.highlightManager.settings.selection) && this.highlightManager.init(), (!this.highlightManager.meshes || !this.highlightManager.meshes.sphere) && this.highlightManager.drawHighlightAtoms(), this.highlightManager.settings.selection.indices = i, this._selectedAtomsIndices = i, this.weas.eventHandlers.dispatchViewerUpdated({ selectedAtomsIndices: i }), this.highlightManager.updateHighlightAtomsMesh({
						indices: a,
						scale: 1.1,
						type: "sphere"
					}), this.highlightManager.updateHighlightAtomsMesh({
						indices: o,
						scale: 0,
						type: "sphere"
					}), this.baseAtomLabelSettings = this.getAtomLabelSettingsFromType(this._atomLabelType), this.updateAtomLabels(), r) {
						let t = this.getRedrawEffectForKey(e);
						t && this.requestRedraw(t);
					}
					return;
				}
				if (this[e] = n, e === "radiusType" && (this.atomManager.init(), this.bondManager.init(), this.polyhedraManager.init()), e === "colorBy" && (this.atomManager.init(), this.bondManager.init(), this.polyhedraManager.init()), e === "colorType" && (this.atomManager.init(), this.guiManager.updateLegend(), this.bondManager.init(), this.polyhedraManager.init()), e === "atomScale" && (this.atomManager.updateAtomScale(t), Object.values(this.highlightManager.settings || {}).forEach((e) => {
					this.highlightManager.updateHighlightAtomsMesh(e);
				})), e === "backgroundColor" && (this.tjs.scene.background = new THREE$1.Color(t)), e === "atomLabelType" && (this.baseAtomLabelSettings = this.getAtomLabelSettingsFromType(t), this.updateAtomLabels()), e === "modelStyle" && a && this.updateModelStyles(n), r) {
					let t = this.getRedrawEffectForKey(e);
					t && this.requestRedraw(t);
				}
			}), i && this.requestRedraw(t === !0 ? "full" : t), !n && a && this.state.set({ viewer: {
				atomScales: this._atomScales,
				modelSticks: this._modelSticks,
				modelPolyhedras: this._modelPolyhedras
			} });
		} finally {
			this._syncingState = !1, this.endUpdate({ redraw: !0 });
		}
	}
	setState(e, { record: t = !1, redraw: n = "auto" } = {}) {
		if (t) {
			if (this.weas.ops && this.weas.ops.isRestoring) {
				this.applyState(e, { redraw: n });
				return;
			}
			this.weas.ops.viewer.SetViewerState({
				patch: e,
				redraw: n
			});
			return;
		}
		this.applyState(e, { redraw: n });
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
		let t = String(e || "None").toUpperCase();
		return t === "SYMBOL" ? [{
			origins: "positions",
			texts: "symbols",
			fontSize: "24px"
		}] : t === "INDEX" ? [{
			origins: "positions",
			texts: "index",
			fontSize: "24px"
		}] : [];
	}
	updateAtomLabels() {
		let e = [...this.baseAtomLabelSettings];
		this._selectedAtomsIndices.length > 0 && e.push({
			origins: "positions",
			texts: "index",
			selection: this._selectedAtomsIndices,
			fontSize: "24px"
		});
		let t = this.state.get("plugins.atomLabel")?.overlaySettings || [];
		this.state.set({ plugins: { atomLabel: {
			settings: e,
			overlaySettings: t
		} } });
	}
	drawModels() {
		this.logger.debug("-----------------drawModels-----------------"), this.dispose(), this.cellManager.draw(), this.bondManager.buildNeighborList(), this.boundaryManager.getBoundaryAtoms();
		let e = this.atoms.positions.map((e, t) => [t, [
			0,
			0,
			0
		]]).concat(this.boundaryList || []);
		this._showBondedAtoms ? this.bondedAtoms = searchBondedAtoms(this.atoms.getSymbols(), e, this.neighbors, this.modelSticks) : this.bondedAtoms = {
			atoms: [],
			bonds: []
		}, this.logger.debug("bondedAtoms: ", this.bondedAtoms), this.atomManager.meshes.atom = this.atomManager.drawBalls();
		let t = this.bondManager.drawBonds();
		this.atomManager.meshes.atom.add(t);
		let n = this.polyhedraManager.drawPolyhedras();
		this.atomManager.meshes.atom.add(n), this.isosurfaceManager.drawIsosurfaces(), this.volumeSliceManager.drawSlices(), this.VFManager.drawVectorFields(), this.highlightManager.drawHighlightAtoms(), this.ALManager.drawAtomLabels(), this._hashes = this._hashes || {}, this._hashes.speciesHash = fnv1aHash(this.atoms.species), this._hashes.positionsHash = fnv1aHash(this.atoms.positions.flat()), this._hashes.symbolsHash = fnv1aHash(this.atoms.symbols), this._prevSpeciesHash === this._hashes.speciesHash ? this._atomsChanged = !1 : (this._atomsChanged = !0, this._prevSpeciesHash = this._hashes.speciesHash, this.guiManager.updateLegend()), this._atomsChanged && this.guiManager.updateLegend(), this.ready = !0, this.requestRedraw("render");
	}
	dispose() {
		this.atomManager.meshes.atom && this.atomManager.meshes.atom.dispose(), this.atomManager.meshes.image && this.atomManager.meshes.image.dispose(), clearObjects(this.tjs.scene, this.uuid);
	}
	deleteSelectedAtoms({ indices: e = null }) {
		e === null && (e = this.selectedAtomsIndices), this.atoms.deleteAtoms({ indices: e }), this.atomScales = this.atomScales.filter((t, n) => !e.includes(n)), this.modelSticks = this.modelSticks.filter((t, n) => !e.includes(n)), this.modelPolyhedras = this.modelPolyhedras.filter((t, n) => !e.includes(n)), this.selectedAtomsIndices = this.selectedAtomsIndices.filter((t) => !e.includes(t)), this.drawModels();
	}
	replaceSelectedAtoms({ element: e, indices: t = null }) {
		t === null && (t = this.selectedAtomsIndices), this.atoms.replaceAtoms({
			indices: Array.from(t),
			newSpecieSymbol: e
		}), this.atomManager.init(), this.bondManager.init(), this.drawModels();
	}
	addAtom({ element: e, position: t = {
		x: 0,
		y: 0,
		z: 0
	} }) {
		let n = new Atom(e, [
			t.x,
			t.y,
			t.z
		]);
		this.atoms.species[e] || this.atoms.addSpecie({ symbol: e }), this.atoms.addAtom({ atom: n }), this.atomScales = this.atomScales.concat([this.atomScale]), this.modelSticks = this.modelSticks.concat([0]), this.modelPolyhedras = this.modelPolyhedras.concat([0]), this.atomManager.init(), this.bondManager.init(), this.drawModels();
	}
	copyAtoms({ indices: e = null }) {
		e === null && (e = this.selectedAtomsIndices);
		let t = this.atoms.getAtomsByIndices({ indices: e });
		this.logger.debug("copied_atoms: ", t), this.atoms.add({ otherAtoms: t }), this.logger.debug("atoms: ", this.atoms), this.atomScales = this.atomScales.concat(e.map((e) => this.atomScales[e])), this.modelSticks = this.modelSticks.concat(e.map((e) => this.modelSticks[e])), this.modelPolyhedras = this.modelPolyhedras.concat(e.map((e) => this.modelPolyhedras[e])), this.drawModels(), this.selectedAtomsIndices = Array.from({ length: t.getAtomsCount() }, (e, n) => n + this.atoms.getAtomsCount() - t.getAtomsCount());
	}
	setAtomPosition({ index: e, position: t }) {
		let n = this.wrapPositionIfNeeded(t), r = new THREE$1.Matrix4();
		this.atomManager.meshes.atom.getMatrixAt(e, r), r.setPosition(n), this.atomManager.meshes.atom.setMatrixAt(e, r), this.atoms.positions[e] = [
			n.x,
			n.y,
			n.z
		], this.atomManager.updateImageAtomsMesh(e), this.bondManager.updateBondMesh(e), this.polyhedraManager.updatePolyhedraMesh(e);
	}
	wrapPositionIfNeeded(e) {
		if (!this._wrapOnMove || !this.atoms || !Array.isArray(this.atoms.pbc) || !this.atoms.pbc.some(Boolean) || typeof this.atoms.isUndefinedCell == "function" && this.atoms.isUndefinedCell()) return e;
		let t = this.atoms.cell;
		if (!Array.isArray(t) || t.length !== 3) return e;
		try {
			let n = multiply(inv(t[0].map((e, n) => t.map((e) => e[n]))), [
				e.x,
				e.y,
				e.z
			]), r = !1;
			for (let e = 0; e < 3; e++) {
				if (!this.atoms.pbc[e]) continue;
				let t = n[e], i = t - Math.floor(t);
				i !== t && (r = !0), n[e] = i;
			}
			if (!r) return e;
			let i = calculateCartesianCoordinates(t, n);
			return new THREE$1.Vector3(i[0], i[1], i[2]);
		} catch (t) {
			return this.logger.debug("wrapPositionIfNeeded failed:", t), e;
		}
	}
	resetSelectedAtomsPositions(e, t = null) {
		let n = e;
		e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "initialAtomPositions") && ({initialAtomPositions: n, indices: t = null} = e), t === null && (t = this.selectedAtomsIndices), t.length !== 0 && (t.forEach((e) => {
			let t = n.get(e);
			this.setAtomPosition({
				index: e,
				position: t
			});
		}), this.atomManager.meshes.atom.instanceMatrix.needsUpdate = !0);
	}
	translateSelectedAtoms({ translateVector: e, indices: t = null }) {
		t === null && (t = this.selectedAtomsIndices), t = toIndexArray(t), t.length !== 0 && (e = toVector3(e, "translateVector"), t.forEach((t) => {
			let n = new THREE$1.Vector3(...this.atoms.positions[t]).clone().add(e);
			this.setAtomPosition({
				index: t,
				position: n
			});
		}), this.atomManager.meshes.atom.instanceMatrix.needsUpdate = !0, this.atomManager.meshes.image && (this.atomManager.meshes.image.instanceMatrix.needsUpdate = !0), this.bondManager.bondMesh && (this.bondManager.bondMesh.instanceMatrix.needsUpdate = !0));
	}
	rotateSelectedAtoms({ cameraDirection: e, rotationAngle: t, indices: n = null, centroid: r = null }) {
		e = toVector3(e, "cameraDirection"), e = e.normalize(), t = THREE$1.MathUtils.degToRad(t);
		let i = new THREE$1.Matrix4().makeRotationAxis(e, -t);
		n === null && (n = this.selectedAtomsIndices), n = toIndexArray(n), n.length !== 0 && (r === null && (r = new THREE$1.Vector3(0, 0, 0), n.forEach((e) => {
			r.add(new THREE$1.Vector3(...this.atoms.positions[e]));
		}), r.divideScalar(n.length)), r = toVector3(r, "centroid"), n.forEach((e) => {
			let t = new THREE$1.Vector3(...this.atoms.positions[e]);
			t.sub(r).applyMatrix4(i).add(r), this.setAtomPosition({
				index: e,
				position: t
			});
		}), this.atomManager.meshes.atom.instanceMatrix.needsUpdate = !0, this.atomManager.meshes.image && (this.atomManager.meshes.image.instanceMatrix.needsUpdate = !0));
	}
	setAttribute(e, t, n = "atom") {
		let r = e;
		e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "name") && ({name: r, values: t, domain: n = "atom"} = e), this.trajectory.forEach((e) => {
			e.newAttribute({
				name: r,
				values: t,
				domain: n
			});
		});
	}
	updateModelStyles(e) {
		let { atomScales: t, modelSticks: n, modelPolyhedras: r, appliesToAll: i } = this.getModelArraysForStyle(e);
		i && (this._modelStyle = e), this.atomScales = t, this.modelSticks = n, this.modelPolyhedras = r;
	}
	getDefaultModelArrays(e, t) {
		let n = Array(t).fill(.4), r = Array(t).fill(0), i = Array(t).fill(0);
		return e === 0 ? n.fill(1) : e === 1 ? r.fill(1) : e === 2 ? (r.fill(2), i.fill(1)) : e === 3 ? (n.fill(0), r.fill(3)) : e === 4 && (n.fill(0), r.fill(4)), {
			atomScales: n,
			modelSticks: r,
			modelPolyhedras: i
		};
	}
	applyModelStyleToArrays(e, t, n, r, i) {
		let a = (i) => {
			e === 0 ? (t[i] = 1, n[i] = e, r[i] = 0) : e === 1 ? (t[i] = .4, n[i] = e, r[i] = 0) : e === 2 ? (t[i] = .4, n[i] = e, r[i] = 1) : (e === 3 || e === 4) && (t[i] = 0, n[i] = e, r[i] = 0);
		};
		i.forEach((e) => a(e));
	}
	getModelArraysForStyle(e) {
		let t = this.atoms.getAtomsCount(), n = Array.isArray(this._atomScales) && Array.isArray(this._modelSticks) && Array.isArray(this._modelPolyhedras) && this._atomScales.length === t && this._modelSticks.length === t && this._modelPolyhedras.length === t, r, i, a;
		if (n) r = this._atomScales.slice(), i = this._modelSticks.slice(), a = this._modelPolyhedras.slice();
		else {
			let e = this.getDefaultModelArrays(this._modelStyle, t);
			r = e.atomScales, i = e.modelSticks, a = e.modelPolyhedras;
		}
		return this.selectedAtomsIndices.length > 0 ? (this.applyModelStyleToArrays(e, r, i, a, this.selectedAtomsIndices), {
			atomScales: r,
			modelSticks: i,
			modelPolyhedras: a,
			appliesToAll: !1
		}) : {
			...this.getDefaultModelArrays(e, t),
			appliesToAll: !0
		};
	}
	getFrameSignature(e) {
		return `${e.getAtomsCount()}:${this.hashSymbols(e.symbols)}`;
	}
	hashSymbols(e) {
		let t = 0;
		for (let n = 0; n < e.length; n++) {
			let r = e[n];
			for (let e = 0; e < r.length; e++) t = t * 31 + r.charCodeAt(e) | 0;
			t = t * 31 + 124 | 0;
		}
		return t >>> 0;
	}
	rebuildForFrame(e) {
		this._atoms = null, this._cell = null, this.selectedAtomsIndices = [], this.cellManager.cell = e.cell, this.atomManager.init(), this.highlightManager.init(), this.bondManager.init(), this.polyhedraManager.init(), this.VFManager.init(), this.isosurfaceManager.reset(), this.volumeSliceManager.reset(), this.Measurement.reset(), this.updateModelStyles(this._modelStyle), this.drawModels();
	}
};
function normalizeModelStyle(e, t) {
	if (typeof e == "number") return e;
	if (typeof e == "string") {
		if (Object.prototype.hasOwnProperty.call(MODEL_STYLE_MAP, e)) return MODEL_STYLE_MAP[e];
		let t = parseInt(e, 10);
		if (!Number.isNaN(t)) return t;
	}
	return t;
}
//#endregion
//#region src/state/defaultState.js
function createDefaultState() {
	let e = cloneValue(defaultViewerSettings);
	return {
		viewer: {
			modelStyle: e.modelStyle,
			colorBy: e.colorBy,
			colorType: e.colorType,
			colorRamp: e.colorRamp,
			radiusType: e.radiusType,
			materialType: e.materialType,
			atomLabelType: e.atomLabelType,
			showBondedAtoms: e.showBondedAtoms,
			boundary: e.boundary,
			atomScale: e.atomScale,
			wrapOnMove: e.wrapOnMove,
			atomScales: [],
			modelSticks: [],
			modelPolyhedras: [],
			backgroundColor: e.backgroundColor,
			continuousUpdate: e.continuousUpdate,
			selectedAtomsIndices: []
		},
		cell: cloneValue(e.cellSettings),
		bond: {
			settings: {},
			hideLongBonds: e.bondSettings.hideLongBonds,
			showHydrogenBonds: e.bondSettings.showHydrogenBonds,
			showOutBoundaryBonds: e.bondSettings.showOutBoundaryBonds
		},
		plugins: {
			isosurface: { settings: {} },
			volumeSlice: { settings: {} },
			vectorField: {
				settings: {},
				show: !0
			},
			highlight: { settings: { selection: {
				indices: [],
				scale: 1.1,
				type: "sphere",
				color: "#ffff00"
			} } },
			atomLabel: { settings: [] },
			text: { settings: [] },
			polyhedra: { settings: [] },
			measurement: { settings: {} },
			species: { settings: {} },
			anyMesh: { settings: [] },
			instancedMeshPrimitive: { settings: [] }
		},
		materials: null,
		shapes: null,
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
//#endregion
//#region src/state/adapters.js
function applyDefined(e, t, n) {
	t && n.forEach((n) => {
		t[n] !== void 0 && (e[n] = cloneValue(t[n]));
	});
}
function fromWidgetSnapshot(e) {
	if (!e || typeof e != "object") throw Error("Invalid widget snapshot payload.");
	let t = createDefaultState(), n = e.viewer || {}, r = e.plugins || {}, i = e.camera || {}, a = e.measurement || {}, o = e.animation || {};
	if (applyDefined(t.viewer, n, [
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
	]), applyDefined(t.bond, n, [
		"hideLongBonds",
		"showHydrogenBonds",
		"showOutBoundaryBonds"
	]), r.cellSettings && (t.cell = cloneValue(r.cellSettings)), r.bondSettings && (t.bond.settings = cloneValue(r.bondSettings)), r.isoSettings && (t.plugins.isosurface.settings = cloneValue(r.isoSettings)), r.sliceSettings && (t.plugins.volumeSlice.settings = cloneValue(r.sliceSettings)), r.vectorField && (t.plugins.vectorField.settings = cloneValue(r.vectorField)), typeof r.showVectorField == "boolean" && (t.plugins.vectorField.show = r.showVectorField), r.highlightSettings && (t.plugins.highlight.settings = cloneValue(r.highlightSettings)), r.speciesSettings && (t.plugins.species.settings = cloneValue(r.speciesSettings)), r.anyMesh && (t.plugins.anyMesh.settings = cloneValue(r.anyMesh)), r.instancedMeshPrimitive && (t.plugins.instancedMeshPrimitive.settings = cloneValue(r.instancedMeshPrimitive)), a && typeof a == "object") {
		let e = a.settings && typeof a.settings == "object" ? a.settings : a;
		t.plugins.measurement.settings = cloneValue(e);
	}
	o && typeof o == "object" && applyDefined(t.animation, o, [
		"currentFrame",
		"isPlaying",
		"frameDuration"
	]), i.cameraSetting && (applyDefined(t.camera, i.cameraSetting, [
		"direction",
		"distance",
		"zoom"
	]), i.cameraSetting.lookAt && (t.camera.target = cloneValue(i.cameraSetting.lookAt))), applyDefined(t.camera, i, ["cameraType"]), i.cameraType && (t.camera.type = i.cameraType), i.cameraZoom !== void 0 && (t.camera.zoom = i.cameraZoom), i.cameraPosition && (t.camera.position = cloneValue(i.cameraPosition)), i.cameraLookAt && (t.camera.target = cloneValue(i.cameraLookAt));
	let s = typeof o.currentFrame == "number" ? o.currentFrame : typeof n.currentFrame == "number" ? n.currentFrame : void 0;
	return {
		version: "weas_state_v1",
		atoms: cloneValue(e.atoms),
		state: t,
		camera: cloneValue(t.camera),
		currentFrame: s
	};
}
//#endregion
//#region src/core/MaterialsRegistry.js
var MaterialsRegistry = class e {
	constructor(e = null) {
		this._builtIn = new Set([
			"Standard",
			"Phong",
			"Basic"
		]), this.materials = {}, this.materialSchemas = {
			MeshStandardMaterial: {
				metalness: {
					type: "number",
					min: 0,
					max: 1,
					step: .01,
					label: "Metalness",
					hide: !1
				},
				roughness: {
					type: "number",
					min: 0,
					max: 1,
					step: .01,
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
					step: .01,
					label: "Reflectivity",
					hide: !0
				}
			},
			MeshBasicMaterial: { color: {
				type: "color",
				label: "Color",
				hide: !1
			} }
		}, this._initBuiltInMaterials(), this._callbacks = /* @__PURE__ */ new Set(), e && this.fromJSON(e);
	}
	_initBuiltInMaterials() {
		this.materials.Standard = new THREE$1.MeshStandardMaterial({
			metalness: .2,
			roughness: .5
		}), this.materials.Phong = new THREE$1.MeshPhongMaterial({
			specular: 2236962,
			shininess: 100,
			reflectivity: .9
		}), this.materials.Basic = new THREE$1.MeshBasicMaterial({ color: 16776960 }), Object.values(this.materials).forEach((e) => e.__builtIn = !0);
	}
	_emitChange() {
		this._callbacks.forEach((e) => e());
	}
	onChange(e) {
		return this._callbacks.add(e), () => this._callbacks.delete(e);
	}
	getMaterial(e, t = !1) {
		if (!(e in this.materials)) throw Error(`Material "${e}" not found`);
		return t ? this.materials[e].clone() : this.materials[e];
	}
	getSchema(e) {
		let t = this.getMaterial(e);
		return this.materialSchemas[t.type] || {};
	}
	renameMaterial(e, t) {
		if (!(e in this.materials)) throw Error(`Material "${e}" not found`);
		if (this._builtIn.has(e)) throw Error(`Cannot rename built-in material "${e}"`);
		t in this.materials && console.warn(`Material "${t}" will overwrite existing`), this.materials[t] = this.materials[e], delete this.materials[e], this._emitChange();
	}
	updateMaterial(e, t) {
		if (!(e in this.materials)) throw Error(`Material "${e}" not found`);
		if (this._builtIn.has(e)) throw Error(`Cannot modify built-in material "${e}"`);
		Object.assign(this.materials[e], t), this._emitChange();
	}
	copyMaterial(e, t, n = {}) {
		if (!(e in this.materials)) throw Error(`Material "${e}" not found`);
		t in this.materials && console.warn(`Material "${t}" will overwrite existing`);
		let r = this.materials[e].clone();
		Object.assign(r, n), r.__userDefined = !0, this.materials[t] = r, this._emitChange();
	}
	list() {
		return Object.keys(this.materials);
	}
	listDetails() {
		return Object.entries(this.materials).map(([e, t]) => ({
			name: e,
			type: t.type,
			builtIn: !!t.__builtIn,
			userDefined: !!t.__userDefined,
			schema: this.getSchema(e)
		}));
	}
	toJSON() {
		let e = {};
		for (let [t, n] of Object.entries(this.materials)) n.__builtIn || (e[t] = this._serializeMaterial(n));
		return {
			version: "1.0",
			userMaterials: e,
			customSchemas: this._getCustomSchemas()
		};
	}
	fromJSON(e) {
		if (!(!e || typeof e != "object")) {
			if (this._initBuiltInMaterials(), e.userMaterials && typeof e.userMaterials == "object") for (let [t, n] of Object.entries(e.userMaterials)) try {
				let e = this._deserializeMaterial(n);
				e && (e.__userDefined = !0, delete e.__builtIn, this.materials[t] = e);
			} catch (e) {
				console.warn(`Failed to restore material "${t}":`, e);
			}
			e.customSchemas && this._restoreCustomSchemas(e.customSchemas), this._emitChange();
		}
	}
	_serializeMaterial(e) {
		let t = {
			type: e.type,
			properties: {}
		};
		switch (e.type) {
			case "MeshStandardMaterial":
				t.properties = {
					color: e.color.getHex(),
					metalness: e.metalness,
					roughness: e.roughness,
					emissive: e.emissive?.getHex() || 0,
					emissiveIntensity: e.emissiveIntensity || 0,
					transparent: e.transparent || !1,
					opacity: e.opacity || 1
				};
				break;
			case "MeshPhongMaterial":
				t.properties = {
					color: e.color.getHex(),
					specular: e.specular?.getHex() || 1118481,
					shininess: e.shininess,
					reflectivity: e.reflectivity || 0,
					emissive: e.emissive?.getHex() || 0,
					transparent: e.transparent || !1,
					opacity: e.opacity || 1
				};
				break;
			case "MeshBasicMaterial":
				t.properties = {
					color: e.color.getHex(),
					transparent: e.transparent || !1,
					opacity: e.opacity || 1
				};
				break;
			case "MeshLambertMaterial":
				t.properties = {
					color: e.color.getHex(),
					emissive: e.emissive?.getHex() || 0,
					transparent: e.transparent || !1,
					opacity: e.opacity || 1
				};
				break;
			default: t.properties = {
				color: e.color?.getHex?.() || 16777215,
				transparent: e.transparent || !1,
				opacity: e.opacity || 1
			}, typeof e.metalness == "number" && (t.properties.metalness = e.metalness), typeof e.roughness == "number" && (t.properties.roughness = e.roughness), typeof e.shininess == "number" && (t.properties.shininess = e.shininess);
		}
		return t;
	}
	_deserializeMaterial(e) {
		let t, n = e.properties;
		switch (e.type) {
			case "MeshStandardMaterial":
				t = new THREE$1.MeshStandardMaterial({
					color: n.color,
					metalness: n.metalness,
					roughness: n.roughness,
					emissive: n.emissive,
					emissiveIntensity: n.emissiveIntensity,
					transparent: n.transparent,
					opacity: n.opacity
				});
				break;
			case "MeshPhongMaterial":
				t = new THREE$1.MeshPhongMaterial({
					color: n.color,
					specular: n.specular,
					shininess: n.shininess,
					reflectivity: n.reflectivity,
					emissive: n.emissive,
					transparent: n.transparent,
					opacity: n.opacity
				});
				break;
			case "MeshBasicMaterial":
				t = new THREE$1.MeshBasicMaterial({
					color: n.color,
					transparent: n.transparent,
					opacity: n.opacity
				});
				break;
			case "MeshLambertMaterial":
				t = new THREE$1.MeshLambertMaterial({
					color: n.color,
					emissive: n.emissive,
					transparent: n.transparent,
					opacity: n.opacity
				});
				break;
			default: console.warn(`Unknown material type: ${e.type}, falling back to Standard`), t = new THREE$1.MeshStandardMaterial({
				color: n.color,
				metalness: n.metalness || .5,
				roughness: n.roughness || .5
			});
		}
		return t;
	}
	_getCustomSchemas() {
		let e = {}, t = new Set([
			"MeshStandardMaterial",
			"MeshPhongMaterial",
			"MeshBasicMaterial"
		]);
		for (let [n, r] of Object.entries(this.materialSchemas)) t.has(n) || (e[n] = r);
		return e;
	}
	_restoreCustomSchemas(e) {
		for (let [t, n] of Object.entries(e)) this.materialSchemas[t] = n;
	}
	clone() {
		let t = new e();
		return t.fromJSON(this.toJSON()), t;
	}
}, ConvexGeometry = class extends BufferGeometry {
	constructor(e = []) {
		super();
		let t = [], n = [], r = new ConvexHull().setFromPoints(e).faces;
		for (let e = 0; e < r.length; e++) {
			let i = r[e], a = i.edge;
			do {
				let e = a.head().point;
				t.push(e.x, e.y, e.z), n.push(i.normal.x, i.normal.y, i.normal.z), a = a.next;
			} while (a !== i.edge);
		}
		this.setAttribute("position", new Float32BufferAttribute(t, 3)), this.setAttribute("normal", new Float32BufferAttribute(n, 3));
	}
}, ShapeRegistry = class {
	constructor(e) {
		this.shapes = {}, this.meta = {}, this.materials = e, this._callbacks = /* @__PURE__ */ new Set(), this._registerBuiltIns();
	}
	_emitChange() {
		this._callbacks.forEach((e) => e());
	}
	onChange(e) {
		return this._callbacks.add(e), () => this._callbacks.delete(e);
	}
	_createBaseMesh(e, t, { materialType: n = "Standard", color: r = "#bd0d87", opacity: i = 1, wireframe: a = !1 } = {}) {
		let o = e.getMaterial(n, !0);
		return "color" in o && (o.color = new THREE$1.Color(r)), o.transparent = !0, o.opacity = i, o.side = THREE$1.DoubleSide, o.wireframe = a, i < 1 && (o.depthWrite = !1), new THREE$1.Mesh(t, o);
	}
	_registerBuiltIns() {
		let e = 1;
		this.register("Cube", (e, t) => this._createBaseMesh(e, new THREE$1.BoxGeometry(2, 2, 2), t)), this.register("Sphere", (e, t) => {
			let n = t.widthSegments ?? 32, r = t.heightSegments ?? 32;
			return this._createBaseMesh(e, new THREE$1.SphereGeometry(1, n, r), t);
		}), this.register("Plane", (e, t) => this._createBaseMesh(e, new THREE$1.PlaneGeometry(2, 2), t)), this.register("Cylinder", (e, t) => {
			let n = t.segments ?? 24;
			return this._createBaseMesh(e, new THREE$1.CylinderGeometry(1, 1, 1, n), t);
		}), this.register("Cone", (e, t) => this._createBaseMesh(e, new THREE$1.ConeGeometry(1, 2, 16), t)), this.register("Torus", (e, t) => this._createBaseMesh(e, new THREE$1.TorusGeometry(1 * .75, 1 * .25, 16, 32), t)), this.register("Line", (e, t) => {
			let n = t.color || "#000000", r = t.start || [
				0,
				0,
				0
			], i = t.end || [
				0,
				1,
				0
			], a = [new THREE$1.Vector3(...r), new THREE$1.Vector3(...i)], o = new THREE$1.BufferGeometry().setFromPoints(a), s = new THREE$1.LineBasicMaterial({ color: n });
			return new THREE$1.Line(o, s);
		}), this.register("Arrow", (e, t) => {
			let n = t.shaftRatio ?? .75, r = t.length ?? 1, i = r * n, a = r - i, o = (t.shaftRadius ?? .075) * r, s = (t.headRadius ?? .15) * r, c = new THREE$1.CylinderGeometry(o, o, i, t.segments ?? 12);
			c.translate(0, i / 2, 0);
			let l = new THREE$1.ConeGeometry(s, a, t.segments ?? 12);
			l.translate(0, i + a / 2, 0);
			let u = mergeGeometries([c, l], !1), d = this._createBaseMesh(e, u, t);
			if (t.start && t.end) {
				let e = new THREE$1.Vector3(...t.start), n = new THREE$1.Vector3(...t.end), i = new THREE$1.Vector3().subVectors(n, e), a = i.length();
				i.normalize(), d.scale.set(1, a / r, 1);
				let o = new THREE$1.Vector3(0, 1, 0).cross(i), s = Math.acos(new THREE$1.Vector3(0, 1, 0).dot(i));
				o.lengthSq() > 0 && d.quaternion.setFromAxisAngle(o.normalize(), s), d.position.copy(e);
			}
			return d;
		}), this.registerProgrammatic("ConvexShape", (e, t) => {
			if (!t.corners?.length) throw Error("ConvexShape requires at least 4 corners as [x,y,z] arrays");
			let n = new ConvexGeometry(t.corners.map((e) => e.isVector3 ? e : new THREE$1.Vector3(...e)));
			if (t.edges) {
				let e = new THREE$1.EdgesGeometry(n), r = new THREE$1.LineBasicMaterial({ color: t.color ?? 16777215 }), i = new THREE$1.LineSegments(e, r);
				return i.updateCorners = (e) => {
					let t = e.map((e) => e.isVector3 ? e : new THREE$1.Vector3(...e));
					i.geometry.dispose(), i.geometry = new THREE$1.EdgesGeometry(new ConvexGeometry(t));
				}, i;
			}
			let r = this._createBaseMesh(e, n, t);
			return r.updateCorners = (e) => {
				let t = e.map((e) => e.isVector3 ? e : new THREE$1.Vector3(...e));
				r.geometry.dispose(), r.geometry = new ConvexGeometry(t);
			}, r;
		});
	}
	register(e, t) {
		this.shapes[e] && console.warn(`Shape "${e}" is being overwritten`), this.shapes[e] = t, this._emitChange();
	}
	registerProgrammatic(e, t) {
		this.register(e, t), this.meta[e] = { programmatic: !0 };
	}
	isGUIVisible(e) {
		return !this.meta[e]?.programmatic;
	}
	create(e, t = {}) {
		let n = this.shapes[e];
		if (!n) throw Error(`Shape "${e}" not registered`);
		let r = n(this.materials, t);
		if (r instanceof THREE$1.Object3D && (t.position && r.position.set(...t.position), t.scale && r.scale.set(...t.scale), t.rotation)) {
			let [e, n, i] = t.rotation;
			r.rotation.set(THREE$1.MathUtils.degToRad(e), THREE$1.MathUtils.degToRad(n), THREE$1.MathUtils.degToRad(i));
		}
		return t.notSelectable && (r.userData.notSelectable = !0), t.type && (r.userData.type = t.type), t.customData && Object.entries(t.customData).forEach(([e, t]) => r.userData[e] = t), r;
	}
	list() {
		return Object.keys(this.shapes);
	}
}, KeybindManager = class {
	constructor({ container: e, keybindConfig: t } = {}) {
		this._container = e, this._config = t || defaultKeyBindConfig, this._actions = /* @__PURE__ */ new Map(), this._heldActions = /* @__PURE__ */ new Set(), this._keyDownHandler = this._onKeyDown.bind(this), this._keyUpHandler = this._onKeyUp.bind(this), this._container && (this._container.addEventListener("keydown", this._keyDownHandler), this._container.addEventListener("keyup", this._keyUpHandler));
	}
	beforeDispatch = null;
	register(e, t, n = null) {
		this._actions.set(e, {
			handler: t,
			combos: n,
			isHold: !1
		});
	}
	registerHold(e, { onPress: t, onRelease: n }, r = null) {
		this._actions.set(e, {
			onPress: t,
			onRelease: n,
			combos: r,
			isHold: !0
		});
	}
	unregister(e) {
		this._actions.delete(e), this._heldActions.delete(e);
	}
	isHeld(e) {
		return this._heldActions.has(e);
	}
	getCombos(e) {
		return this._actions.get(e)?.combos ?? null;
	}
	getConfig() {
		return this._config;
	}
	listActions() {
		return Array.from(this._actions.entries()).map(([e, t]) => ({
			name: e,
			combos: t.combos,
			isHold: t.isHold
		}));
	}
	destroy() {
		this._container && (this._container.removeEventListener("keydown", this._keyDownHandler), this._container.removeEventListener("keyup", this._keyUpHandler)), this._actions.clear(), this._heldActions.clear();
	}
	_onKeyDown(e) {
		if (!this.beforeDispatch?.(e)) {
			for (let [t, n] of this._actions) if (n.combos && this._matchesAnyCombo(e, n.combos)) {
				n.isHold ? this._heldActions.has(t) || (this._heldActions.add(t), n.onPress?.(e)) : n.handler?.(e), e.preventDefault();
				return;
			}
		}
	}
	_onKeyUp(e) {
		for (let t of this._heldActions) {
			let n = this._actions.get(t);
			if (!(!n?.isHold || !n.combos) && this._matchesAnyCombo(e, n.combos)) {
				this._heldActions.delete(t), n.onRelease?.(e);
				return;
			}
		}
	}
	_matchesAnyCombo(e, t) {
		return t.some((t) => this._matchCombo(e, t));
	}
	_matchCombo(e, t) {
		let n = t[t.length - 1].toLowerCase();
		if (e.key.toLowerCase() !== n) return !1;
		let r = t.slice(0, -1);
		for (let t of [
			"ctrl",
			"shift",
			"alt",
			"meta"
		]) if (t !== n && r.includes(t) !== e[t + "Key"]) return !1;
		return !0;
	}
}, COMBO_SEPARATOR = "+";
function formatCombo(e) {
	return e.map((e) => e === "ctrl" ? "Ctrl" : e === "shift" ? "Shift" : e === "alt" ? "Alt" : e === "meta" ? "Meta" : e.charAt(0).toUpperCase() + e.slice(1)).join(COMBO_SEPARATOR);
}
function style(e, t) {
	Object.assign(e.style, t);
}
var KeybindHUD = class {
	constructor(e, t) {
		this._km = e, this._hud = t, this._visible = !1, this._build(), this._registerToggle();
	}
	_build() {
		this._container = document.createElement("div"), style(this._container, {
			position: "relative",
			fontFamily: "sans-serif",
			fontSize: "13px",
			color: "#ccc",
			userSelect: "none",
			pointerEvents: "auto"
		}), this._badge = document.createElement("div"), style(this._badge, {
			width: "28px",
			height: "28px",
			borderRadius: "50%",
			background: "rgba(30,30,40,0.75)",
			border: "1px solid rgba(255,255,255,0.35)",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			cursor: "pointer",
			fontSize: "15px",
			fontWeight: "700",
			lineHeight: "1",
			color: "#eee",
			transition: "background 0.15s"
		}), this._badge.textContent = "?", this._badge.addEventListener("mouseenter", () => {
			this._badge.style.background = "rgba(60,60,80,0.85)";
		}), this._badge.addEventListener("mouseleave", () => {
			this._badge.style.background = "rgba(30,30,40,0.75)";
		}), this._badge.addEventListener("click", (e) => {
			e.stopPropagation(), this.toggle();
		}), this._panel = document.createElement("div"), style(this._panel, {
			position: "absolute",
			top: "32px",
			right: "0",
			background: "rgba(20,20,28,0.92)",
			border: "1px solid rgba(255,255,255,0.15)",
			borderRadius: "6px",
			padding: "8px 12px",
			minWidth: "200px",
			display: "none",
			backdropFilter: "blur(6px)",
			pointerEvents: "auto"
		});
		let e = document.createElement("div");
		style(e, {
			fontSize: "11px",
			fontWeight: "600",
			textTransform: "uppercase",
			letterSpacing: "0.5px",
			color: "rgba(255,255,255,0.6)",
			marginBottom: "6px",
			paddingBottom: "4px",
			borderBottom: "1px solid rgba(255,255,255,0.15)"
		}), e.textContent = "Keybinds", this._panel.appendChild(e);
		let t = this._km.listActions().filter((e) => e.combos && e.combos.length > 0);
		t.sort((e, t) => e.name.localeCompare(t.name));
		for (let e of t) {
			let t = document.createElement("div");
			style(t, {
				display: "flex",
				justifyContent: "space-between",
				gap: "16px",
				padding: "2px 0",
				lineHeight: "1.6"
			});
			let n = document.createElement("span");
			n.textContent = this._friendlyName(e.name), style(n, { color: "rgba(255,255,255,0.85)" });
			let r = document.createElement("span");
			r.textContent = e.combos.map(formatCombo).join(", "), style(r, {
				color: "rgba(255,255,255,0.55)",
				fontFamily: "monospace",
				fontSize: "12px",
				textAlign: "right",
				whiteSpace: "nowrap"
			}), t.appendChild(n), t.appendChild(r), this._panel.appendChild(t);
		}
		if (t.length === 0) {
			let e = document.createElement("div");
			e.textContent = "No keybinds registered", style(e, {
				color: "rgba(255,255,255,0.3)",
				fontStyle: "italic"
			}), this._panel.appendChild(e);
		}
		this._container.appendChild(this._badge), this._container.appendChild(this._panel), this._hud.addHTMLPanel("keybinds", this._container, {
			anchor: "top-right",
			offset: {
				x: 25,
				y: 1
			}
		});
	}
	_friendlyName(e) {
		return e.replace(/([A-Z])/g, " $1").replace(/^./, (e) => e.toUpperCase()).trim() || e;
	}
	_registerToggle() {
		this._km.register("toggleKeybinds", () => this.toggle(), [["?"]]), this._clickOutside = (e) => {
			this._visible && !this._container.contains(e.target) && this.hide();
		}, document.addEventListener("click", this._clickOutside);
	}
	toggle() {
		this._visible = !this._visible, this._panel.style.display = this._visible ? "block" : "none";
	}
	show() {
		this._visible = !0, this._panel.style.display = "block";
	}
	hide() {
		this._visible = !1, this._panel.style.display = "none";
	}
	destroy() {
		this._km.unregister("toggleKeybinds"), document.removeEventListener("click", this._clickOutside);
	}
}, WEAS = class {
	constructor({ domElement: e, atoms: t = [new Atoms()], viewerConfig: n = {}, guiConfig: r = {}, tjsConfig: i = null, keybindConfig: a = null }) {
		if (this.uuid = THREE$1.MathUtils.generateUUID(), this.keybindConfig = a, this.keybindManager = new KeybindManager({
			container: e,
			keybindConfig: this.keybindConfig
		}), this.tjsConfig = i, this.tjs = new BlendJS(e, this), this.materialsRegistry = new MaterialsRegistry(), this.shapeRegistry = new ShapeRegistry(this.materialsRegistry), this.tjs.requestRedraw = this.requestRedraw.bind(this), this.guiManager = new GUIManager(this, r), this.eventHandlers = new EventHandlers(this), this.ops = new OperationManager(this), this.selectionManager = new SelectionManager(this), this.objectManager = new ObjectManager(this), this.state = new StateStore(createDefaultState()), this.textManager = new TextManager(this.tjs.scene), this.avr = new AtomsViewer({
			weas: this,
			atoms: t,
			viewerConfig: n
		}), this.instancedMeshPrimitive = new InstancedMeshPrimitive(this), this.anyMesh = new AnyMesh(this), this.tjs.addRenderHook && this.tjs.addRenderHook((e, t) => this.avr?.highlightManager?.updateLabelSizes?.(e, t)), this.keybindManager && this.tjs?.hud && (this._keybindHUD = new KeybindHUD(this.keybindManager, this.tjs.hud)), this.guiManager?.registerFolder) {
			let e = this.guiManager;
			e.registerFolder("Materials", (t) => e.addMaterialsFolder(t)), e.registerFolder("Shapes", (t) => e.addShapeOperationsFolder(t)), e.registerFolder("Camera Views", (t) => e.addCameraControlsFolder(t)), e.registerFolder("Camera Settings", (t) => e.addCameraSettingsFolder(t)), e.registerFolder("HUD Settings", (t) => e.addHUDSettingsFolder(t)), e.registerFolder("Legend Appearance", (t) => e.addLegendHUDFolder(t)), e.initGUI();
		}
		this._initCameraStateSync(), this.initialize();
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
		let e = this.tjs.cameraController;
		if (!e || typeof e.addEventListener != "function") return;
		let t = () => {
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
	async exportAnimation({ format: e = "webm", fps: t = 12, startFrame: n = 0, endFrame: r = null, mimeType: i = null } = {}) {
		if (!this.avr || !this.avr.trajectory || this.avr.trajectory.length === 0) throw Error("No trajectory data available for animation export.");
		return this.tjs.exportAnimation({
			format: e,
			fps: t,
			startFrame: n,
			endFrame: r,
			mimeType: i,
			frameCount: this.avr.trajectory.length,
			setFrame: (e) => {
				this.avr.currentFrame = e;
			},
			getFrame: () => this.avr.currentFrame,
			isPlaying: () => this.avr.isPlaying,
			pause: () => this.avr.pause(),
			play: () => this.avr.play()
		});
	}
	async downloadAnimation({ filename: e = "trajectory.webm", ...t } = {}) {
		if (!this.avr || !this.avr.trajectory || this.avr.trajectory.length === 0) throw Error("No trajectory data available for animation export.");
		await this.tjs.downloadAnimation({
			filename: e,
			...t,
			frameCount: this.avr.trajectory.length,
			setFrame: (e) => {
				this.avr.currentFrame = e;
			},
			getFrame: () => this.avr.currentFrame,
			isPlaying: () => this.avr.isPlaying,
			pause: () => this.avr.pause(),
			play: () => this.avr.play()
		});
	}
	_buildAtomsFromSnapshot(e) {
		return e ? Array.isArray(e) ? e.map((e) => new Atoms(e)) : new Atoms(e) : null;
	}
	_exportCameraState() {
		let e = this.tjs.cameraController;
		return e ? e.exportState() : null;
	}
	_applyCameraState(e) {
		let t = this.tjs.cameraController;
		!t || !e || t.importState(e);
	}
	exportState() {
		let e = Array.isArray(this.avr.trajectory) && this.avr.trajectory.length > 1 ? this.avr.trajectory.map((e) => e.toDict()) : this.avr.atoms.toDict(), t = cloneValue(this.state.get());
		return t.camera = this._exportCameraState(), this.avr?.bondManager && (t.bond = {
			...t.bond || {},
			hideLongBonds: this.avr.bondManager.hideLongBonds,
			showHydrogenBonds: this.avr.bondManager.showHydrogenBonds,
			showOutBoundaryBonds: this.avr.bondManager.showOutBoundaryBonds,
			settings: this.avr.bondManager.toPlainSettings()
		}), t.plugins && (this.anyMesh && (t.plugins.anyMesh = { settings: cloneValue(this.anyMesh.settings || []) }), this.instancedMeshPrimitive && (t.plugins.instancedMeshPrimitive = { settings: cloneValue(this.instancedMeshPrimitive.settings || []) })), t.materials = this.materialsRegistry?.toJSON?.() || null, {
			version: "weas_state_v1",
			atoms: e,
			state: t,
			currentFrame: this.avr.currentFrame
		};
	}
	importState(e) {
		if (!e || typeof e != "object") throw Error("Invalid snapshot payload.");
		let t = e.version === "weas_widget_state_v1" ? fromWidgetSnapshot(e) : e, n = this._buildAtomsFromSnapshot(t.atoms);
		if (n && (this.avr.atoms = n), t.state) {
			let e = cloneValue(t.state);
			t.camera && !e.camera && (e.camera = cloneValue(t.camera)), this.state.transaction(() => {
				this.state.set(e);
			});
		}
		t.state?.materials && this.materialsRegistry?.fromJSON && this.materialsRegistry.fromJSON(t.state.materials);
		let r = t.state?.camera || t.camera || {};
		this._applyCameraState(r);
		let i = t.state?.animation;
		i && (typeof i.frameDuration == "number" && (this.avr.frameDuration = i.frameDuration), typeof i.currentFrame == "number" && (this.avr.currentFrame = i.currentFrame), i.isPlaying ? this.avr.play() : this.avr.pause()), typeof t.currentFrame == "number" && (this.avr.currentFrame = t.currentFrame);
	}
}, Bohr = .52917721092;
function parseCube(e) {
	let t = e.trim().split("\n");
	if (t.length < 6) throw Error("Invalid cube file format");
	let n = parseInt(t[2].trim().split(/\s+/)[0]), r = t[2].trim().split(/\s+/).slice(1).map(Number), i = [
		t[3].trim().split(/\s+/).map(Number),
		t[4].trim().split(/\s+/).map(Number),
		t[5].trim().split(/\s+/).map(Number)
	], a = i.map((e) => Math.abs(e[0])), o = i.map((e, t) => ({
		cell: e.slice(1).map((e) => e * a[t] * Bohr),
		stepSize: e.slice(1)
	})), s = {
		species: {},
		pbc: [
			!0,
			!0,
			!0
		],
		positions: [],
		symbols: []
	};
	for (let e = 6; e < 6 + n; e++) {
		let n = t[e].trim().split(/\s+/).map(Number), r = n[0], i = n.slice(2), a = Object.keys(elementAtomicNumbers).find((e) => elementAtomicNumbers[e] === r);
		s.species[a] || (s.species[a] = a), s.symbols.push(a), s.positions.push(i);
	}
	if (s.positions.length !== n) throw Error("Atom count mismatch in cube file");
	let c = o.map((e) => e.cell), l = new Atoms({
		...s,
		cell: c
	}), u = [];
	for (let e = 6 + n; e < t.length; e++) {
		let n = t[e].trim().split(/\s+/).map(Number);
		u.push(...n);
	}
	return l.positions = l.positions.map((e) => e.map((e) => e * Bohr)), {
		atoms: l,
		volumetricData: {
			dims: a,
			values: u,
			origin: r,
			cell: c
		}
	};
}
//#endregion
//#region src/io/parserXsf.js
function parseXSF(e) {
	let t = e.trim().split(/\r?\n/), n = {
		species: {},
		pbc: [
			!0,
			!0,
			!0
		],
		positions: [],
		symbols: []
	}, r = [
		[
			0,
			0,
			0
		],
		[
			0,
			0,
			0
		],
		[
			0,
			0,
			0
		]
	], i = 0, a = null, o = -1, s = -1, c = -1, l = -1;
	for (let e = 0; e < t.length; e++) {
		let n = t[e].trim().toUpperCase();
		n.startsWith("PRIMVEC") && (o = e), n.startsWith("PRIMCOORD") && (s = e), n.startsWith("BEGIN_BLOCK_DATAGRID_3D") && (c = e), n.startsWith("END_BLOCK_DATAGRID_3D") && (l = e);
	}
	if (o >= 0) for (let e = 1; e <= 3; e++) r[e - 1] = t[o + e].trim().split(/\s+/).map(Number);
	if (s >= 0) {
		i = t[s + 1].trim().split(/\s+/).map(Number)[0];
		for (let e = 0; e < i; e++) {
			let r = t[s + 2 + e].trim().split(/\s+/), i = r[0], a;
			a = isNaN(parseFloat(i)) ? i.charAt(0).toUpperCase() + i.slice(1).toLowerCase() : Object.keys(elementAtomicNumbers).find((e) => elementAtomicNumbers[e] === parseInt(i, 10)) || `X${i}`;
			let o = r.slice(1, 4).map(Number);
			n.species[a] || (n.species[a] = a), n.symbols.push(a), n.positions.push(o);
		}
	}
	let u = new Atoms({
		...n,
		cell: r
	});
	if (c >= 0 && l > c) {
		let e = c + 1;
		for (; e < l && !t[e].toUpperCase().includes("DATAGRID_3D");) e++;
		let [n, r, i] = t[e + 1].trim().split(/\s+/).map(Number), o = t[e + 2].trim().split(/\s+/).map(Number), s = [
			t[e + 3].trim().split(/\s+/).map(Number),
			t[e + 4].trim().split(/\s+/).map(Number),
			t[e + 5].trim().split(/\s+/).map(Number)
		], u = [], d = e + 6;
		for (let e = d; e < l; e++) {
			let n = t[e].trim().split(/\s+/).map(Number);
			n.some((e) => !isNaN(e)) && u.push(...n);
		}
		u.length < n * r * i && console.warn(`Volumetric data mismatch: got ${u.length}, expected ${n * r * i}`), a = {
			dims: [
				n,
				r,
				i
			],
			values: u,
			origin: o,
			cell: s
		};
	}
	return {
		atoms: u,
		volumetricData: a
	};
}
//#endregion
export { Atom, Atoms, AtomsViewer, Specie, WEAS, applyStructurePayload, atomsToCIF, atomsToXYZ, buildExportPayload, downloadText, elementAtomicNumbers, fromWidgetSnapshot, parseCIF, parseCube, parseStructureText, parseXSF, parseXYZ };
