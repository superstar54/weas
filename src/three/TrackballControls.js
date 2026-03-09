import { EventDispatcher, Vector2, Vector3, Quaternion } from "three";

class TrackballControls extends EventDispatcher {
  constructor(camera, domElement, params = {}) {
    super();

    this.camera = camera;
    this.domElement = domElement;
    this.target = new Vector3();

    // Initialize parameters with defaults
    this._initParams(params);

    // State enums
    this.STATE = { NONE: -1, ROTATE: 0, PAN: 1, ZOOM: 2 };
    this.state = this.STATE.NONE;

    // Mouse positions
    this.start = new Vector2();
    this.end = new Vector2();

    // Vectors for math
    this.vStart = new Vector3();
    this.vEnd = new Vector3();
    this.offset = new Vector3();
    this.quat = new Quaternion();

    // Bind event handlers
    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    this._onWheel = this._onWheel.bind(this);

    // Event listeners
    domElement.addEventListener("pointerdown", this._onPointerDown);
    domElement.addEventListener("wheel", this._onWheel, { passive: false });

    // Disable right-click menu
    domElement.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  // --- Parameter initialization
  _initParams(params) {
    this.rotateSpeed = params.rotateSpeed ?? 1.2;
    this.zoomSpeed = params.zoomSpeed ?? 1.0;
    this.panSpeed = params.panSpeed ?? 0.8;
    this.minDistance = params.minDistance ?? 0.1;
    this.maxDistance = params.maxDistance ?? 100;
    this.minZoom = params.minZoom ?? 0.01;
    this.maxZoom = params.maxZoom ?? 100;
  }

  // Update parameters after initialization
  setParams(params) {
    Object.assign(this, {
      rotateSpeed: params.rotateSpeed ?? this.rotateSpeed,
      zoomSpeed: params.zoomSpeed ?? this.zoomSpeed,
      panSpeed: params.panSpeed ?? this.panSpeed,
      minDistance: params.minDistance ?? this.minDistance,
      maxDistance: params.maxDistance ?? this.maxDistance,
      minZoom: params.minZoom ?? this.minZoom,
      maxZoom: params.maxZoom ?? this.maxZoom,
    });
  }

  // --- Helpers
  _getMouse(event, vec) {
    const rect = this.domElement.getBoundingClientRect();
    vec.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
  }

  _project(vec, out) {
    const x = vec.x;
    const y = vec.y;
    const d = x * x + y * y;

    if (d <= 1) out.set(x, y, Math.sqrt(1 - d));
    else {
      const s = 1 / Math.sqrt(d);
      out.set(x * s, y * s, 0);
    }
  }

  _rotateCamera() {
    this._project(this.start, this.vStart);
    this._project(this.end, this.vEnd);

    const axis = new Vector3().crossVectors(this.vStart, this.vEnd);
    if (axis.lengthSq() < 1e-10) return;
    axis.normalize();

    const angle = this.vStart.angleTo(this.vEnd) * this.rotateSpeed;
    this.quat.setFromAxisAngle(axis, angle);

    this.offset.copy(this.camera.position).sub(this.target);
    this.offset.applyQuaternion(this.quat);

    this.camera.position.copy(this.target).add(this.offset);
    this.camera.up.applyQuaternion(this.quat);
    this.camera.lookAt(this.target);
  }

  _zoomCamera(delta) {
    if (this.camera.isPerspectiveCamera) {
      const dir = new Vector3().subVectors(this.camera.position, this.target);
      const distance = dir.length();
      const factor = Math.exp(delta * this.zoomSpeed);
      const newDistance = distance * factor;
      if (newDistance < this.minDistance || newDistance > this.maxDistance)
        return;
      dir.normalize().multiplyScalar(newDistance);
      this.camera.position.copy(this.target).add(dir);
    } else if (this.camera.isOrthographicCamera) {
      this.camera.zoom *= Math.exp(-delta * this.zoomSpeed);
      this.camera.zoom = Math.max(
        this.minZoom,
        Math.min(this.maxZoom, this.camera.zoom),
      );
      this.camera.updateProjectionMatrix();
    } else {
      console.warn("TrackballControls: Unknown camera type, zoom disabled.");
    }
  }

  _panCamera(dx, dy) {
    this.offset.copy(this.camera.position).sub(this.target);
    const distance = this.offset.length();

    const dir = new Vector3();
    this.camera.getWorldDirection(dir);

    const panX = new Vector3()
      .crossVectors(this.camera.up, dir)
      .normalize()
      .multiplyScalar(dx * distance * this.panSpeed);
    const panY = new Vector3()
      .copy(this.camera.up)
      .normalize()
      .multiplyScalar(-dy * distance * this.panSpeed);

    const pan = panX.add(panY);

    this.camera.position.add(pan);
    this.target.add(pan);
  }

  // --- Event handlers
  _onPointerDown(event) {
    this._getMouse(event, this.start);

    if (event.button === 0) this.state = this.STATE.ROTATE;
    else if (event.button === 1) this.state = this.STATE.ZOOM;
    else if (event.button === 2) this.state = this.STATE.PAN;

    this.domElement.setPointerCapture(event.pointerId);
    this.domElement.addEventListener("pointermove", this._onPointerMove);
    this.domElement.addEventListener("pointerup", this._onPointerUp);
  }

  _onPointerMove(event) {
    this._getMouse(event, this.end);
    const dx = this.end.x - this.start.x;
    const dy = this.end.y - this.start.y;

    if (this.state === this.STATE.ROTATE) this._rotateCamera();
    if (this.state === this.STATE.PAN) this._panCamera(dx * 0.05, dy * 0.05);
    if (this.state === this.STATE.ZOOM) this._zoomCamera(dy * 0.01);

    this.start.copy(this.end);
  }

  _onPointerUp(event) {
    this.domElement.releasePointerCapture(event.pointerId);
    this.domElement.removeEventListener("pointermove", this._onPointerMove);
    this.domElement.removeEventListener("pointerup", this._onPointerUp);
    this.state = this.STATE.NONE;
  }

  _onWheel(event) {
    event.preventDefault();
    this._zoomCamera(event.deltaY * 0.001);
  }

  update() {}
}

export { TrackballControls };
