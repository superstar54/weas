import * as THREE from "three";
import { Ray, Plane, MathUtils, EventDispatcher, Vector3, MOUSE, TOUCH, Spherical, Quaternion, Vector2, Matrix4, Object3D, Frustum, BufferGeometry, BufferAttribute, Line3, Triangle } from "three";
import { GUI } from "dat.gui";
import './index.css';const _changeEvent = { type: "change" }, _startEvent = { type: "start" }, _endEvent = { type: "end" }, _ray = new Ray(), _plane$1 = new Plane(), TILT_LIMIT = Math.cos(70 * MathUtils.DEG2RAD);
class OrbitControls extends EventDispatcher {
  constructor(e, t) {
    super(), this.object = e, this.domElement = t, this.domElement.style.touchAction = "none", this.enabled = !0, this.target = new Vector3(), this.cursor = new Vector3(), this.minDistance = 0, this.maxDistance = 1 / 0, this.minZoom = 0, this.maxZoom = 1 / 0, this.minTargetRadius = 0, this.maxTargetRadius = 1 / 0, this.minPolarAngle = 0, this.maxPolarAngle = Math.PI, this.minAzimuthAngle = -1 / 0, this.maxAzimuthAngle = 1 / 0, this.enableDamping = !1, this.dampingFactor = 0.05, this.enableZoom = !0, this.zoomSpeed = 1, this.enableRotate = !0, this.rotateSpeed = 1, this.enablePan = !0, this.panSpeed = 1, this.screenSpacePanning = !0, this.keyPanSpeed = 7, this.zoomToCursor = !1, this.autoRotate = !1, this.autoRotateSpeed = 2, this.keys = { LEFT: "ArrowLeft", UP: "ArrowUp", RIGHT: "ArrowRight", BOTTOM: "ArrowDown" }, this.mouseButtons = { LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN }, this.touches = { ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN }, this.target0 = this.target.clone(), this.position0 = this.object.position.clone(), this.zoom0 = this.object.zoom, this._domElementKeyEvents = null, this.getPolarAngle = function() {
      return o.phi;
    }, this.getAzimuthalAngle = function() {
      return o.theta;
    }, this.getDistance = function() {
      return this.object.position.distanceTo(this.target);
    }, this.listenToKeyEvents = function(b) {
      b.addEventListener("keydown", fe), this._domElementKeyEvents = b;
    }, this.stopListenToKeyEvents = function() {
      this._domElementKeyEvents.removeEventListener("keydown", fe), this._domElementKeyEvents = null;
    }, this.saveState = function() {
      s.target0.copy(s.target), s.position0.copy(s.object.position), s.zoom0 = s.object.zoom;
    }, this.reset = function() {
      s.target.copy(s.target0), s.object.position.copy(s.position0), s.object.zoom = s.zoom0, s.object.updateProjectionMatrix(), s.dispatchEvent(_changeEvent), s.update(), n = i.NONE;
    }, this.update = (function() {
      const b = new Vector3(), R = new Quaternion().setFromUnitVectors(e.up, new Vector3(0, 1, 0)), O = R.clone().invert(), k = new Vector3(), K = new Quaternion(), oe = new Vector3(), ee = 2 * Math.PI;
      return function(Le = null) {
        const Ee = s.object.position;
        b.copy(Ee).sub(s.target), b.applyQuaternion(R), o.setFromVector3(b), s.autoRotate && n === i.NONE && B(C(Le)), s.enableDamping ? (o.theta += l.theta * s.dampingFactor, o.phi += l.phi * s.dampingFactor) : (o.theta += l.theta, o.phi += l.phi);
        let ie = s.minAzimuthAngle, ne = s.maxAzimuthAngle;
        isFinite(ie) && isFinite(ne) && (ie < -Math.PI ? ie += ee : ie > Math.PI && (ie -= ee), ne < -Math.PI ? ne += ee : ne > Math.PI && (ne -= ee), ie <= ne ? o.theta = Math.max(ie, Math.min(ne, o.theta)) : o.theta = o.theta > (ie + ne) / 2 ? Math.max(ie, o.theta) : Math.min(ne, o.theta)), o.phi = Math.max(s.minPolarAngle, Math.min(s.maxPolarAngle, o.phi)), o.makeSafe(), s.enableDamping === !0 ? s.target.addScaledVector(h, s.dampingFactor) : s.target.add(h), s.target.sub(s.cursor), s.target.clampLength(s.minTargetRadius, s.maxTargetRadius), s.target.add(s.cursor), s.zoomToCursor && A || s.object.isOrthographicCamera ? o.radius = $(o.radius) : o.radius = $(o.radius * c), b.setFromSpherical(o), b.applyQuaternion(O), Ee.copy(s.target).add(b), s.object.lookAt(s.target), s.enableDamping === !0 ? (l.theta *= 1 - s.dampingFactor, l.phi *= 1 - s.dampingFactor, h.multiplyScalar(1 - s.dampingFactor)) : (l.set(0, 0, 0), h.set(0, 0, 0));
        let ge = !1;
        if (s.zoomToCursor && A) {
          let he = null;
          if (s.object.isPerspectiveCamera) {
            const de = b.length();
            he = $(de * c);
            const ue = de - he;
            s.object.position.addScaledVector(E, ue), s.object.updateMatrixWorld();
          } else if (s.object.isOrthographicCamera) {
            const de = new Vector3(x.x, x.y, 0);
            de.unproject(s.object), s.object.zoom = Math.max(s.minZoom, Math.min(s.maxZoom, s.object.zoom / c)), s.object.updateProjectionMatrix(), ge = !0;
            const ue = new Vector3(x.x, x.y, 0);
            ue.unproject(s.object), s.object.position.sub(ue).add(de), s.object.updateMatrixWorld(), he = b.length();
          } else
            console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."), s.zoomToCursor = !1;
          he !== null && (this.screenSpacePanning ? s.target.set(0, 0, -1).transformDirection(s.object.matrix).multiplyScalar(he).add(s.object.position) : (_ray.origin.copy(s.object.position), _ray.direction.set(0, 0, -1).transformDirection(s.object.matrix), Math.abs(s.object.up.dot(_ray.direction)) < TILT_LIMIT ? e.lookAt(s.target) : (_plane$1.setFromNormalAndCoplanarPoint(s.object.up, s.target), _ray.intersectPlane(_plane$1, s.target))));
        } else s.object.isOrthographicCamera && (s.object.zoom = Math.max(s.minZoom, Math.min(s.maxZoom, s.object.zoom / c)), s.object.updateProjectionMatrix(), ge = !0);
        return c = 1, A = !1, ge || k.distanceToSquared(s.object.position) > r || 8 * (1 - K.dot(s.object.quaternion)) > r || oe.distanceToSquared(s.target) > 0 ? (s.dispatchEvent(_changeEvent), k.copy(s.object.position), K.copy(s.object.quaternion), oe.copy(s.target), !0) : !1;
      };
    })(), this.dispose = function() {
      s.domElement.removeEventListener("contextmenu", Se), s.domElement.removeEventListener("pointerdown", ye), s.domElement.removeEventListener("pointercancel", ce), s.domElement.removeEventListener("wheel", we), s.domElement.removeEventListener("pointermove", pe), s.domElement.removeEventListener("pointerup", ce), s._domElementKeyEvents !== null && (s._domElementKeyEvents.removeEventListener("keydown", fe), s._domElementKeyEvents = null);
    };
    const s = this, i = {
      NONE: -1,
      ROTATE: 0,
      DOLLY: 1,
      PAN: 2,
      TOUCH_ROTATE: 3,
      TOUCH_PAN: 4,
      TOUCH_DOLLY_PAN: 5,
      TOUCH_DOLLY_ROTATE: 6
    };
    let n = i.NONE;
    const r = 1e-6, o = new Spherical(), l = new Spherical();
    let c = 1;
    const h = new Vector3(), d = new Vector2(), u = new Vector2(), p = new Vector2(), m = new Vector2(), g = new Vector2(), y = new Vector2(), f = new Vector2(), w = new Vector2(), S = new Vector2(), E = new Vector3(), x = new Vector2();
    let A = !1;
    const v = [], M = {};
    let T = !1;
    function C(b) {
      return b !== null ? 2 * Math.PI / 60 * s.autoRotateSpeed * b : 2 * Math.PI / 60 / 60 * s.autoRotateSpeed;
    }
    function P(b) {
      const R = Math.abs(b * 0.01);
      return Math.pow(0.95, s.zoomSpeed * R);
    }
    function B(b) {
      l.theta -= b;
    }
    function j(b) {
      l.phi -= b;
    }
    const _ = (function() {
      const b = new Vector3();
      return function(O, k) {
        b.setFromMatrixColumn(k, 0), b.multiplyScalar(-O), h.add(b);
      };
    })(), L = (function() {
      const b = new Vector3();
      return function(O, k) {
        s.screenSpacePanning === !0 ? b.setFromMatrixColumn(k, 1) : (b.setFromMatrixColumn(k, 0), b.crossVectors(s.object.up, b)), b.multiplyScalar(O), h.add(b);
      };
    })(), N = (function() {
      const b = new Vector3();
      return function(O, k) {
        const K = s.domElement;
        if (s.object.isPerspectiveCamera) {
          const oe = s.object.position;
          b.copy(oe).sub(s.target);
          let ee = b.length();
          ee *= Math.tan(s.object.fov / 2 * Math.PI / 180), _(2 * O * ee / K.clientHeight, s.object.matrix), L(2 * k * ee / K.clientHeight, s.object.matrix);
        } else s.object.isOrthographicCamera ? (_(O * (s.object.right - s.object.left) / s.object.zoom / K.clientWidth, s.object.matrix), L(k * (s.object.top - s.object.bottom) / s.object.zoom / K.clientHeight, s.object.matrix)) : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."), s.enablePan = !1);
      };
    })();
    function W(b) {
      s.object.isPerspectiveCamera || s.object.isOrthographicCamera ? c /= b : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."), s.enableZoom = !1);
    }
    function Y(b) {
      s.object.isPerspectiveCamera || s.object.isOrthographicCamera ? c *= b : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."), s.enableZoom = !1);
    }
    function Q(b, R) {
      if (!s.zoomToCursor)
        return;
      A = !0;
      const O = s.domElement.getBoundingClientRect(), k = b - O.left, K = R - O.top, oe = O.width, ee = O.height;
      x.x = k / oe * 2 - 1, x.y = -(K / ee) * 2 + 1, E.set(x.x, x.y, 1).unproject(s.object).sub(s.object.position).normalize();
    }
    function $(b) {
      return Math.max(s.minDistance, Math.min(s.maxDistance, b));
    }
    function q(b) {
      d.set(b.clientX, b.clientY);
    }
    function H(b) {
      Q(b.clientX, b.clientX), f.set(b.clientX, b.clientY);
    }
    function I(b) {
      m.set(b.clientX, b.clientY);
    }
    function Z(b) {
      u.set(b.clientX, b.clientY), p.subVectors(u, d).multiplyScalar(s.rotateSpeed);
      const R = s.domElement;
      B(2 * Math.PI * p.x / R.clientHeight), j(2 * Math.PI * p.y / R.clientHeight), d.copy(u), s.update();
    }
    function X(b) {
      w.set(b.clientX, b.clientY), S.subVectors(w, f), S.y > 0 ? W(P(S.y)) : S.y < 0 && Y(P(S.y)), f.copy(w), s.update();
    }
    function J(b) {
      g.set(b.clientX, b.clientY), y.subVectors(g, m).multiplyScalar(s.panSpeed), N(y.x, y.y), m.copy(g), s.update();
    }
    function F(b) {
      Q(b.clientX, b.clientY), b.deltaY < 0 ? Y(P(b.deltaY)) : b.deltaY > 0 && W(P(b.deltaY)), s.update();
    }
    function D(b) {
      let R = !1;
      switch (b.code) {
        case s.keys.UP:
          b.ctrlKey || b.metaKey || b.shiftKey ? j(2 * Math.PI * s.rotateSpeed / s.domElement.clientHeight) : N(0, s.keyPanSpeed), R = !0;
          break;
        case s.keys.BOTTOM:
          b.ctrlKey || b.metaKey || b.shiftKey ? j(-2 * Math.PI * s.rotateSpeed / s.domElement.clientHeight) : N(0, -s.keyPanSpeed), R = !0;
          break;
        case s.keys.LEFT:
          b.ctrlKey || b.metaKey || b.shiftKey ? B(2 * Math.PI * s.rotateSpeed / s.domElement.clientHeight) : N(s.keyPanSpeed, 0), R = !0;
          break;
        case s.keys.RIGHT:
          b.ctrlKey || b.metaKey || b.shiftKey ? B(-2 * Math.PI * s.rotateSpeed / s.domElement.clientHeight) : N(-s.keyPanSpeed, 0), R = !0;
          break;
      }
      R && (b.preventDefault(), s.update());
    }
    function V(b) {
      if (v.length === 1)
        d.set(b.pageX, b.pageY);
      else {
        const R = le(b), O = 0.5 * (b.pageX + R.x), k = 0.5 * (b.pageY + R.y);
        d.set(O, k);
      }
    }
    function G(b) {
      if (v.length === 1)
        m.set(b.pageX, b.pageY);
      else {
        const R = le(b), O = 0.5 * (b.pageX + R.x), k = 0.5 * (b.pageY + R.y);
        m.set(O, k);
      }
    }
    function U(b) {
      const R = le(b), O = b.pageX - R.x, k = b.pageY - R.y, K = Math.sqrt(O * O + k * k);
      f.set(0, K);
    }
    function se(b) {
      s.enableZoom && U(b), s.enablePan && G(b);
    }
    function re(b) {
      s.enableZoom && U(b), s.enableRotate && V(b);
    }
    function z(b) {
      if (v.length == 1)
        u.set(b.pageX, b.pageY);
      else {
        const O = le(b), k = 0.5 * (b.pageX + O.x), K = 0.5 * (b.pageY + O.y);
        u.set(k, K);
      }
      p.subVectors(u, d).multiplyScalar(s.rotateSpeed);
      const R = s.domElement;
      B(2 * Math.PI * p.x / R.clientHeight), j(2 * Math.PI * p.y / R.clientHeight), d.copy(u);
    }
    function te(b) {
      if (v.length === 1)
        g.set(b.pageX, b.pageY);
      else {
        const R = le(b), O = 0.5 * (b.pageX + R.x), k = 0.5 * (b.pageY + R.y);
        g.set(O, k);
      }
      y.subVectors(g, m).multiplyScalar(s.panSpeed), N(y.x, y.y), m.copy(g);
    }
    function ae(b) {
      const R = le(b), O = b.pageX - R.x, k = b.pageY - R.y, K = Math.sqrt(O * O + k * k);
      w.set(0, K), S.set(0, Math.pow(w.y / f.y, s.zoomSpeed)), W(S.y), f.copy(w);
      const oe = (b.pageX + R.x) * 0.5, ee = (b.pageY + R.y) * 0.5;
      Q(oe, ee);
    }
    function me(b) {
      s.enableZoom && ae(b), s.enablePan && te(b);
    }
    function ve(b) {
      s.enableZoom && ae(b), s.enableRotate && z(b);
    }
    function ye(b) {
      s.enabled !== !1 && (v.length === 0 && (s.domElement.setPointerCapture(b.pointerId), s.domElement.addEventListener("pointermove", pe), s.domElement.addEventListener("pointerup", ce)), He(b), b.pointerType === "touch" ? Re(b) : Me(b));
    }
    function pe(b) {
      s.enabled !== !1 && (b.pointerType === "touch" ? Pe(b) : Ae(b));
    }
    function ce(b) {
      _e(b), v.length === 0 && (s.domElement.releasePointerCapture(b.pointerId), s.domElement.removeEventListener("pointermove", pe), s.domElement.removeEventListener("pointerup", ce)), s.dispatchEvent(_endEvent), n = i.NONE;
    }
    function Me(b) {
      let R;
      switch (b.button) {
        case 0:
          R = s.mouseButtons.LEFT;
          break;
        case 1:
          R = s.mouseButtons.MIDDLE;
          break;
        case 2:
          R = s.mouseButtons.RIGHT;
          break;
        default:
          R = -1;
      }
      switch (R) {
        case MOUSE.DOLLY:
          if (s.enableZoom === !1) return;
          H(b), n = i.DOLLY;
          break;
        case MOUSE.ROTATE:
          if (b.ctrlKey || b.metaKey || b.shiftKey) {
            if (s.enablePan === !1) return;
            I(b), n = i.NONE;
          } else {
            if (s.enableRotate === !1) return;
            q(b), n = i.ROTATE;
          }
          break;
        case MOUSE.PAN:
          if (b.ctrlKey || b.metaKey || b.shiftKey) {
            if (s.enableRotate === !1) return;
            q(b), n = i.NONE;
          } else {
            if (s.enablePan === !1) return;
            I(b), n = i.PAN;
          }
          break;
        default:
          n = i.NONE;
      }
      n !== i.NONE && s.dispatchEvent(_startEvent);
    }
    function Ae(b) {
      switch (n) {
        case i.ROTATE:
          if (s.enableRotate === !1) return;
          Z(b);
          break;
        case i.DOLLY:
          if (s.enableZoom === !1) return;
          X(b);
          break;
        case i.PAN:
          if (s.enablePan === !1) return;
          J(b);
          break;
      }
    }
    function we(b) {
      s.enabled === !1 || s.enableZoom === !1 || n !== i.NONE || (b.preventDefault(), s.dispatchEvent(_startEvent), F(Ce(b)), s.dispatchEvent(_endEvent));
    }
    function Ce(b) {
      const R = b.deltaMode, O = {
        clientX: b.clientX,
        clientY: b.clientY,
        deltaY: b.deltaY
      };
      switch (R) {
        case 1:
          O.deltaY *= 16;
          break;
        case 2:
          O.deltaY *= 100;
          break;
      }
      return b.ctrlKey && !T && (O.deltaY *= 10), O;
    }
    function Te(b) {
      b.key === "Control" && (T = !0, document.addEventListener("keyup", be, { passive: !0, capture: !0 }));
    }
    function be(b) {
      b.key === "Control" && (T = !1, document.removeEventListener("keyup", be, { passive: !0, capture: !0 }));
    }
    function fe(b) {
      s.enabled === !1 || s.enablePan === !1 || D(b);
    }
    function Re(b) {
      switch (xe(b), v.length) {
        case 1:
          switch (s.touches.ONE) {
            case TOUCH.ROTATE:
              if (s.enableRotate === !1) return;
              V(b), n = i.TOUCH_ROTATE;
              break;
            case TOUCH.PAN:
              if (s.enablePan === !1) return;
              G(b), n = i.TOUCH_PAN;
              break;
            default:
              n = i.NONE;
          }
          break;
        case 2:
          switch (s.touches.TWO) {
            case TOUCH.DOLLY_PAN:
              if (s.enableZoom === !1 && s.enablePan === !1) return;
              se(b), n = i.TOUCH_DOLLY_PAN;
              break;
            case TOUCH.DOLLY_ROTATE:
              if (s.enableZoom === !1 && s.enableRotate === !1) return;
              re(b), n = i.TOUCH_DOLLY_ROTATE;
              break;
            default:
              n = i.NONE;
          }
          break;
        default:
          n = i.NONE;
      }
      n !== i.NONE && s.dispatchEvent(_startEvent);
    }
    function Pe(b) {
      switch (xe(b), n) {
        case i.TOUCH_ROTATE:
          if (s.enableRotate === !1) return;
          z(b), s.update();
          break;
        case i.TOUCH_PAN:
          if (s.enablePan === !1) return;
          te(b), s.update();
          break;
        case i.TOUCH_DOLLY_PAN:
          if (s.enableZoom === !1 && s.enablePan === !1) return;
          me(b), s.update();
          break;
        case i.TOUCH_DOLLY_ROTATE:
          if (s.enableZoom === !1 && s.enableRotate === !1) return;
          ve(b), s.update();
          break;
        default:
          n = i.NONE;
      }
    }
    function Se(b) {
      s.enabled !== !1 && b.preventDefault();
    }
    function He(b) {
      v.push(b.pointerId);
    }
    function _e(b) {
      delete M[b.pointerId];
      for (let R = 0; R < v.length; R++)
        if (v[R] == b.pointerId) {
          v.splice(R, 1);
          return;
        }
    }
    function xe(b) {
      let R = M[b.pointerId];
      R === void 0 && (R = new Vector2(), M[b.pointerId] = R), R.set(b.pageX, b.pageY);
    }
    function le(b) {
      const R = b.pointerId === v[0] ? v[1] : v[0];
      return M[R];
    }
    s.domElement.addEventListener("contextmenu", Se), s.domElement.addEventListener("pointerdown", ye), s.domElement.addEventListener("pointercancel", ce), s.domElement.addEventListener("wheel", we, { passive: !1 }), document.addEventListener("keydown", Te, { passive: !0, capture: !0 }), this.update();
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
    const o = {
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
        const S = {
          distanceToCameraSquared: d(y, m)
        };
        o.objects.set(m, S);
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
        const S = o.objects.get(f).distanceToCameraSquared, E = o.objects.get(w).distanceToCameraSquared;
        return S - E;
      }), y = g.length;
      for (let f = 0, w = g.length; f < w; f++)
        g[f].element.style.zIndex = y - f;
    }
  }
}
function toVector3(a, e = "value") {
  if (console.log("toVector3 called with value:", a), a instanceof THREE.Vector3)
    return a;
  if (Array.isArray(a) && a.length === 3)
    return new THREE.Vector3(a[0], a[1], a[2]);
  if (a && typeof a == "object" && "length" in a && a.length === 3)
    return new THREE.Vector3(...a);
  if (a && typeof a == "object" && "x" in a && "y" in a && "z" in a)
    return new THREE.Vector3(a.x, a.y, a.z);
  throw new Error(`${e} must be a THREE.Vector3, an [x,y,z] array, or an {x,y,z} object, got ${typeof a}`);
}
function toIndexArray(a, e = "indices") {
  if (a === null)
    throw new Error(`${e} must not be null`);
  return Array.isArray(a) ? a : [a];
}
function clearObjects(a, e = null) {
  [...a.children].forEach((s) => {
    e !== null && (!s.userData || s.userData.uuid !== e) || (s instanceof THREE.Group ? clearGroup(a, s) : !(s instanceof THREE.Camera) && !(s instanceof THREE.Light) && clearObject(a, s));
  });
}
function clearGroup(a, e) {
  e.children.forEach((t) => {
    t instanceof THREE.Group ? clearGroup(a, t) : clearObject(a, t);
  });
}
function clearObject(a, e) {
  e !== null && (e.children && e.remove(...e.children), e.geometry && e.geometry.dispose(), e.material && (Array.isArray(e.material) ? e.material.forEach((t) => t.dispose()) : e.material.dispose()), a.remove(e));
}
function getWorldPositionFromScreen(a, e, t) {
  const s = new THREE.Raycaster();
  s.setFromCamera(e, a);
  const i = new THREE.Vector3();
  return s.ray.intersectPlane(t, i), i;
}
function convertToMatrixFromABCAlphaBetaGamma(a) {
  const [e, t, s, i, n, r] = a, o = i * Math.PI / 180, l = n * Math.PI / 180, c = r * Math.PI / 180, h = e, d = 0, u = 0, p = t * Math.cos(c), m = t * Math.sin(c), g = 0, y = s * Math.cos(l), f = s * (Math.cos(o) - Math.cos(l) * Math.cos(c)) / Math.sin(c), w = Math.sqrt(s * s - y * y - f * f);
  return [
    [h, d, u],
    [p, m, g],
    [y, f, w]
  ];
}
function calculateCartesianCoordinates(a, e) {
  return a = a[0].map((t, s) => a.map((i) => i[s])), multiplyMatrixVector(a, e);
}
function multiplyMatrixVector(a, e) {
  const t = [];
  for (let s = 0; s < a.length; s++) {
    let i = 0;
    for (let n = 0; n < a[s].length; n++)
      i += a[s][n] * e[n];
    t.push(i);
  }
  return t;
}
function calculateInverseMatrix(a) {
  const e = a[0][0] * (a[1][1] * a[2][2] - a[1][2] * a[2][1]) - a[0][1] * (a[1][0] * a[2][2] - a[1][2] * a[2][0]) + a[0][2] * (a[1][0] * a[2][1] - a[1][1] * a[2][0]);
  if (e === 0)
    throw new Error("Matrix has zero determinant, cannot calculate inverse.");
  const t = 1 / e;
  return [
    [
      (a[1][1] * a[2][2] - a[1][2] * a[2][1]) * t,
      (a[0][2] * a[2][1] - a[0][1] * a[2][2]) * t,
      (a[0][1] * a[1][2] - a[0][2] * a[1][1]) * t
    ],
    [
      (a[1][2] * a[2][0] - a[1][0] * a[2][2]) * t,
      (a[0][0] * a[2][2] - a[0][2] * a[2][0]) * t,
      (a[0][2] * a[1][0] - a[0][0] * a[1][2]) * t
    ],
    [
      (a[1][0] * a[2][1] - a[1][1] * a[2][0]) * t,
      (a[0][1] * a[2][0] - a[0][0] * a[2][1]) * t,
      (a[0][0] * a[1][1] - a[0][1] * a[1][0]) * t
    ]
  ];
}
function calculateQuaternion(a, e) {
  const t = new THREE.Matrix4().lookAt(a, e, new THREE.Object3D().up), s = new THREE.Quaternion().setFromRotationMatrix(t), i = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
  return s.multiply(i), s;
}
function createLabel(a, e, t = "black", s = "14px", i = "axis-label") {
  const n = document.createElement("div");
  n.className = i, n.textContent = e, n.style.color = t, n.style.fontSize = s;
  const r = new CSS2DObject(n);
  return r.position.copy(a), r;
}
class WeasScene extends THREE.Scene {
  constructor(e) {
    super(), this.tjs = e;
  }
  add(e) {
    super.add(e), this.dispatchObjectEvent({
      data: e.toJSON(),
      action: "add",
      catalog: "object"
    });
  }
  remove(e) {
    if (typeof e == "string" && (e = this.getObjectByProperty("uuid", e), !e)) {
      console.warn("Object not found");
      return;
    }
    super.remove(e), this.dispatchObjectEvent({
      data: e.toJSON(),
      action: "remove",
      catalog: "object"
    });
  }
  dispatchObjectEvent(e) {
    const t = new CustomEvent("weas", { detail: e });
    this.tjs.containerElement.dispatchEvent(t);
  }
  clear() {
    clearObjects(this);
  }
}
class OrthographicCamera extends THREE.OrthographicCamera {
  constructor(e, t, s, i, n, r, o = null) {
    super(e, t, s, i, n, r), this.tjs = o;
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
};
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
    this.containerElement = e, this.tjsConfig = t.tjsConfig || defaultTjsConfig, this.weas = t, this.scene = new WeasScene(this), this.objects = {}, this.materials = {}, this.meshes = {}, this.lights = {}, this.renderers = {}, this._cameraType = "Orthographic", this.sceneView = { left: 0, bottom: 0, width: 1, height: 1 }, this.init();
  }
  createCoordScene() {
    this.coordScene = new THREE.Scene();
    const e = 0.3;
    this.coordSceneView = {
      left: 0,
      bottom: 0,
      width: this.sceneView.width * e,
      height: this.sceneView.height * e
    }, this.coordCamera = new THREE.OrthographicCamera(this.orthographicCamera.left, this.orthographicCamera.right, this.orthographicCamera.top, this.orthographicCamera.bottom, 1, 2e3), this.coordCamera.position.copy(this.camera.position);
    const t = new THREE.AmbientLight(16777215, 2);
    this.coordScene.add(t);
    const s = new THREE.DirectionalLight(16777215, 2);
    s.position.set(10, 10, 10), this.coordScene.add(s);
  }
  createLegendScene() {
    this.legendScene = new THREE.Scene();
    const e = 0.3;
    this.legendSceneView = {
      left: 0.8,
      bottom: 0,
      width: this.sceneView.width * e,
      height: this.sceneView.height * e
    }, this.legendCamera = new THREE.OrthographicCamera(this.orthographicCamera.left, this.orthographicCamera.right, this.orthographicCamera.top, this.orthographicCamera.bottom, 1, 2e3), this.legendCamera.position.set(0, 0, 100);
  }
  get cameraType() {
    return this._cameraType;
  }
  set cameraType(e) {
    this._cameraType = e, this.controls = new OrbitControls(this.camera, this.renderers.MainRenderer.renderer.domElement), this.updateCameraAndControls({});
  }
  get camera() {
    return this._cameraType === "Orthographic" ? this.orthographicCamera : this.perspectiveCamera;
  }
  init() {
    this.scene.background = new THREE.Color(16777215);
    const e = this?.tjsConfig?.renderConfig || defaultTjsConfig.renderConfig, t = new THREE.WebGLRenderer(e);
    t.autoClear = !1;
    const s = this.containerElement.getBoundingClientRect(), i = this.containerElement.clientWidth || s.width || 1, n = this.containerElement.clientHeight || s.height || 1;
    t.setSize(i, n), t.setPixelRatio(window.devicePixelRatio), this.addRenderer("MainRenderer", t);
    const r = new CSS2DRenderer();
    r.setSize(i, n), r.domElement.style.position = "absolute", r.domElement.style.top = "0px", r.domElement.style.pointerEvents = "none", this.addRenderer("LabelRenderer", r), this.perspectiveCamera = new THREE.PerspectiveCamera(50, i / n, 1, 500), this.perspectiveCamera.layers.enable(1);
    const o = 20, l = i / n, c = o / 2, h = c * l;
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
    this.addLight("AmbientLight", u), this.controls = new OrbitControls(this.camera, t.domElement), this.updateViewerRect(), this.observeContainerResize(), window.addEventListener("resize", this.onWindowResize.bind(this), !1), this.containerElement.addEventListener("mousemove", this.render.bind(this)), this.containerElement.addEventListener("pointerup", this.render.bind(this)), this.containerElement.addEventListener("pointerdown", this.render.bind(this)), this.containerElement.addEventListener("click", this.render.bind(this)), this.containerElement.addEventListener("wheel", this.render.bind(this)), this.containerElement.addEventListener("atomsUpdated", this.render.bind(this)), this.createCoordScene(), this.createLegendScene();
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
    if (!t || !s)
      return;
    if (this.camera.isOrthographicCamera) {
      const l = t / s, c = this.camera.top - this.camera.bottom;
      this.camera.left = -c * l / 2, this.camera.right = c * l / 2, this.coordCamera.left = this.camera.left, this.coordCamera.right = this.camera.right;
    } else
      this.camera.aspect = t / s, this.coordCamera.aspect = this.camera.aspect;
    this.camera.updateProjectionMatrix(), this.coordCamera.updateProjectionMatrix();
    const i = t * this.legendSceneView.width, n = s * this.legendSceneView.height, r = i / n, o = this.legendCamera.top - this.legendCamera.bottom;
    this.legendCamera.left = -o * r / 2, this.legendCamera.right = o * r / 2, this.legendCamera.updateProjectionMatrix(), Object.values(this.renderers).forEach((l) => {
      l.renderer.setSize(t, s);
    }), this.updateViewerRect(), this.render();
  }
  //
  updateCameraAndControls({ lookAt: e = null, direction: t = [0, 0, 1], distance: s = null, zoom: i = 1, fov: n = 50 }) {
    const r = this.containerElement.getBoundingClientRect(), o = this.containerElement.clientWidth || r.width, l = this.containerElement.clientHeight || r.height, c = this.renderers.MainRenderer?.renderer?.getSize(new THREE.Vector2()) || { x: 1, y: 1 }, h = o || c.x || 1, d = l || c.y || 1;
    t = new THREE.Vector3(...t).normalize();
    const u = this.getSceneBoundingBox();
    e === null ? e = u.getCenter(new THREE.Vector3()) : e = new THREE.Vector3(...e);
    const p = calculateBoundingBox(u, t);
    let m;
    this.camera.isOrthographicCamera ? m = h / d : m = this.camera.aspect;
    let g = 10, y = Math.max(p.x, p.y * m) + g, f = y / m;
    this.camera.left = -y / 2, this.camera.right = y / 2, this.camera.top = f / 2, this.camera.bottom = -f / 2, this.coordCamera.left = this.camera.left, this.coordCamera.right = this.camera.right, this.coordCamera.top = this.camera.top, this.coordCamera.bottom = this.camera.bottom, s === null && (s = p.z + g);
    let w = e.clone().add(t.multiplyScalar(s));
    this.camera.position.set(w.x, w.y, w.z), this.camera.lookAt(e), this.camera.isOrthographicCamera ? this.camera.updateZoom(i) : this.camera.fov = n, this.camera.updateProjectionMatrix(), this.controls.target.set(e.x, e.y, e.z), this.render(), this.weas.state && typeof this.weas.state.set == "function" && this.weas.state.set({ camera: this.weas._exportCameraState() });
  }
  getSceneBoundingBox() {
    let e = new THREE.Box3();
    return this.scene.traverse(function(t) {
      if (t.isMesh || t.isLineSegments || t.isInstancedMesh) {
        let s;
        if (t.isInstancedMesh) {
          if (t.count === 0)
            return;
          t.computeBoundingBox(), s = t.boundingBox;
        } else
          t.geometry.computeBoundingBox(), s = t.geometry.boundingBox;
        if (s = new THREE.Box3().copy(s).applyMatrix4(t.matrixWorld), isNaN(s.min.x) || isNaN(s.min.y) || isNaN(s.min.z))
          return;
        e.union(s);
      }
    }), e.isEmpty() && (e = new THREE.Box3(new THREE.Vector3(-10, -10, -10), new THREE.Vector3(10, 10, 10))), e;
  }
  renderSceneInfo(e, t, s, i, n, r, o) {
    const l = o.getSize(new THREE.Vector2());
    var c = Math.floor(l.width * s), h = Math.floor(l.height * i), d = Math.floor(l.width * n), u = Math.floor(l.height * r);
    o.setViewport(c, h, d, u), o.setScissor(c, h, d, u), o.setScissorTest(!1), o.render(e, t);
  }
  render() {
    this.renderers.MainRenderer.renderer.clear(), this.weas?.textManager?.updateLabelSizes?.(this.camera, this.renderers.MainRenderer.renderer), this.weas?.avr?.ALManager?.updateLabelSizes?.(this.camera, this.renderers.MainRenderer.renderer), this.weas?.avr?.highlightManager?.updateLabelSizes?.(this.camera, this.renderers.MainRenderer.renderer), this.renderers.LabelRenderer.renderer.render(this.scene, this.camera), this.renderSceneInfo(this.scene, this.camera, this.sceneView.left, this.sceneView.bottom, this.sceneView.width, this.sceneView.height, this.renderers.MainRenderer.renderer), this.coordCamera.position.copy(this.camera.position), this.coordCamera.position.sub(this.controls.target), this.coordCamera.lookAt(this.coordScene.position), this.renderSceneInfo(
      this.coordScene,
      this.coordCamera,
      this.coordSceneView.left,
      this.coordSceneView.bottom,
      this.coordSceneView.width,
      this.coordSceneView.height,
      this.renderers.MainRenderer.renderer
    ), this.renderSceneInfo(
      this.legendScene,
      this.legendCamera,
      this.legendSceneView.left,
      this.legendSceneView.bottom,
      this.legendSceneView.width,
      this.legendSceneView.height,
      this.renderers.MainRenderer.renderer
    ), this.controls.update();
  }
  exportImage(e = 2) {
    e = Math.min(e, 3);
    const t = this.renderers.MainRenderer.renderer, s = t.getPixelRatio(), i = e;
    t.setPixelRatio(i), this.render();
    const n = document.createElement("canvas");
    n.width = t.domElement.width, n.height = t.domElement.height;
    const r = n.getContext("2d");
    r.drawImage(t.domElement, 0, 0), this.drawLabelsToCanvas(r, n.width, n.height, i);
    var o = n.toDataURL("image/png");
    return t.setPixelRatio(s), this.render(), o;
  }
  drawLabelsToCanvas(e, t, s, i) {
    const n = [];
    if (this.scene.traverse((c) => {
      c && c.isCSS2DObject && c.element && n.push(c);
    }), n.length === 0)
      return;
    this.scene.updateMatrixWorld(!0), this.camera.updateMatrixWorld(!0);
    const r = e.textAlign, o = e.textBaseline;
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
    }), e.textAlign = r, e.textBaseline = o;
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
    frameCount: o = null,
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
    if (!Number.isFinite(o) || o <= 0)
      throw new Error("frameCount must be a positive number.");
    if (typeof l != "function")
      throw new Error("setFrame callback is required for animation export.");
    const p = this.renderers.MainRenderer.renderer, m = p.getPixelRatio(), g = Math.min(r, 3), y = p.getSize(new THREE.Vector2());
    p.setPixelRatio(g), p.setSize(y.x, y.y, !1);
    const f = p.domElement;
    if (!f.captureStream)
      throw p.setPixelRatio(m), p.setSize(y.x, y.y, !1), new Error("Canvas captureStream() is not supported in this browser.");
    const w = String(e || "webm").toLowerCase();
    if (w === "gif")
      throw new Error("GIF export is not supported without an external encoder. Use webm or mp4.");
    let S = this.getSupportedAnimationMimeTypes(w, n);
    w === "mp4" && !S && (S = this.getSupportedAnimationMimeTypes("webm"), console.warn("MP4 export is not supported in this browser. Falling back to WebM."));
    const E = Math.max(0, Math.min(s, o - 1)), x = Math.max(E, Math.min(i ?? o - 1, o - 1)), A = S ? { mimeType: S } : void 0, v = f.captureStream(t), M = A ? new MediaRecorder(v, A) : new MediaRecorder(v), T = [];
    M.ondataavailable = (_) => {
      _.data && _.data.size > 0 && T.push(_.data);
    };
    const C = typeof c == "function" ? c() : null, P = typeof h == "function" ? h() : !1;
    P && typeof d == "function" && d();
    const B = 1e3 / t;
    try {
      typeof l == "function" && l(E), await new Promise((L) => requestAnimationFrame(L)), await new Promise((L) => requestAnimationFrame(L)), M.start();
      for (let L = E; L <= x; L += 1)
        l(L), await new Promise((N) => setTimeout(N, B));
      const _ = new Promise((L) => {
        M.onstop = L;
      });
      M.stop(), await _, v.getTracks().forEach((L) => L.stop());
    } finally {
      p.setPixelRatio(m), p.setSize(y.x, y.y, !1), this.render();
    }
    C !== null && typeof l == "function" && l(C), P && typeof u == "function" && u();
    const j = M.mimeType || S || "video/webm";
    return new Blob(T, { type: j });
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
function calculateBoundingBox(a, e) {
  let t = new THREE.Vector3(), s = new THREE.Vector3(1 / 0, 1 / 0, 1 / 0), i = new THREE.Vector3(-1 / 0, -1 / 0, -1 / 0), n = new THREE.Matrix4();
  return n.lookAt(e, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0)), a.corners = [
    new THREE.Vector3(a.min.x, a.min.y, a.min.z),
    new THREE.Vector3(a.min.x, a.min.y, a.max.z),
    new THREE.Vector3(a.min.x, a.max.y, a.min.z),
    new THREE.Vector3(a.min.x, a.max.y, a.max.z),
    new THREE.Vector3(a.max.x, a.min.y, a.min.z),
    new THREE.Vector3(a.max.x, a.min.y, a.max.z),
    new THREE.Vector3(a.max.x, a.max.y, a.min.z),
    new THREE.Vector3(a.max.x, a.max.y, a.max.z)
  ], a.corners.forEach((r) => {
    let o = r.clone().applyMatrix4(n);
    s.x = Math.min(s.x, o.x), s.y = Math.min(s.y, o.y), i.x = Math.max(i.x, o.x), i.y = Math.max(i.y, o.y), s.z = Math.min(s.z, o.z), i.z = Math.max(i.z, o.z);
  }), t.x = i.x - s.x, t.y = i.y - s.y, t.z = i.z - s.z, t;
}
function setupCameraGUI(a, e, t) {
  const s = e.addFolder("Camera"), i = { x: t.position.x, y: t.position.y, z: t.position.z }, n = { type: t instanceof THREE.PerspectiveCamera ? "Perspective" : "Orthographic" };
  s.add(n, "type", ["Perspective", "Orthographic"]).name("Camera Type").onChange((o) => {
    a.cameraType = o, a.updateCameraAndControls({});
  });
  function r(o, l, c) {
    t.position.set(o, l, c), i.x = o, i.y = l, i.z = c;
  }
  s.add(i, "x", -100, 100).name("X Position").onChange((o) => r(o, i.y, i.z)), s.add(i, "y", -100, 100).name("Y Position").onChange((o) => r(i.x, o, i.z)), s.add(i, "z", -100, 100).name("Z Position").onChange((o) => r(i.x, i.y, o));
}
function createViewpointButtons(a, e) {
  const t = e.addFolder("Viewpoint"), s = {
    Top: () => {
      a.tjs.updateCameraAndControls({ direction: [0, 0, 100] });
    },
    Bottom: () => {
      a.tjs.updateCameraAndControls({ direction: [0, 0, -100] });
    },
    Left: () => {
      a.tjs.updateCameraAndControls({ direction: [-100, 0, 0] });
    },
    Right: () => {
      a.tjs.updateCameraAndControls({ direction: [100, 0, 0] });
    },
    Front: () => {
      a.tjs.updateCameraAndControls({ direction: [0, -100, 0] });
    },
    Back: () => {
      a.tjs.updateCameraAndControls({ direction: [0, 100, 0] });
    }
  };
  for (const i in s)
    t.add(s, i).name(i);
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
    }), this.setPBC({ pbc: i || [!1, !1, !1] }), this.isUndefinedCell() && this.pbc.some((o) => o))
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
      n[r] = n[r].filter((o) => o !== i);
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
      const o = r.filter((l) => l !== t);
      i += r.length - o.length, s[n] = o;
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
    const [e, t, s] = this.cell.map((o) => Math.sqrt(o[0] ** 2 + o[1] ** 2 + o[2] ** 2)), i = Math.acos((this.cell[1][0] * this.cell[2][0] + this.cell[1][1] * this.cell[2][1] + this.cell[1][2] * this.cell[2][2]) / (t * s)) * 180 / Math.PI, n = Math.acos((this.cell[0][0] * this.cell[2][0] + this.cell[0][1] * this.cell[2][1] + this.cell[0][2] * this.cell[2][2]) / (e * s)) * 180 / Math.PI, r = Math.acos((this.cell[0][0] * this.cell[1][0] + this.cell[0][1] * this.cell[1][1] + this.cell[0][2] * this.cell[1][2]) / (e * t)) * 180 / Math.PI;
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
    const [[r, o, l], [c, h, d], [u, p, m]] = this.cell;
    n.setCell({
      cell: [
        [r * i, o * i, l * i],
        [c * t, h * t, d * t],
        [u * s, p * s, m * s]
      ]
    });
    for (let g = 0; g < i; g++)
      for (let y = 0; y < t; y++)
        for (let f = 0; f < s; f++)
          for (let w = 0; w < this.positions.length; w++) {
            const [S, E, x] = this.positions[w], A = S + g * this.cell[0][0] + y * this.cell[1][0] + f * this.cell[2][0], v = E + g * this.cell[0][1] + y * this.cell[1][1] + f * this.cell[2][1], M = x + g * this.cell[0][2] + y * this.cell[1][2] + f * this.cell[2][2];
            n.symbols.push(this.symbols[w]), n.positions.push([A, v, M]);
          }
    for (const g in this.attributes.atom) {
      const y = this.attributes.atom[g], f = [];
      for (let w = 0; w < i; w++)
        for (let S = 0; S < t; S++)
          for (let E = 0; E < s; E++)
            for (let x = 0; x < y.length; x++)
              f.push(y[x]);
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
    const n = t * Math.PI / 180, r = Math.sqrt(i[0] ** 2 + i[1] ** 2 + i[2] ** 2), [o, l, c] = [i[0] / r, i[1] / r, i[2] / r], h = Math.cos(n), d = Math.sin(n), u = [
      h + o * o * (1 - h),
      o * l * (1 - h) - c * d,
      o * c * (1 - h) + l * d,
      l * o * (1 - h) + c * d,
      h + l * l * (1 - h),
      l * c * (1 - h) - o * d,
      c * o * (1 - h) - l * d,
      c * l * (1 - h) + o * d,
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
    const o = r.map((l, c) => l - n[c]);
    if (this.translate({ vector: o }), i !== null)
      for (let l = 0; l < 3; l++)
        t.includes(l) && (this.cell[l][l] += 2 * i);
  }
  deleteAtoms(e) {
    let t = e;
    e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "indices") && ({ indices: t } = e), Array.isArray(t) || (t = [t]);
    const s = new Set(t);
    this.positions = this.positions.filter((n, r) => !s.has(r)), this.symbols = this.symbols.filter((n, r) => !s.has(r));
    for (const n in this.attributes.atom)
      this.attributes.atom[n] = this.attributes.atom[n].filter((r, o) => !s.has(o));
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
    for (const o in this.attributes)
      for (const l in this.attributes[o])
        i[o][l] = o === "atom" ? [] : this.attributes[o][l];
    t.forEach((o) => {
      if (o < 0 || o >= this.positions.length)
        throw new Error("Index out of bounds.");
      s.symbols.push(this.symbols[o]), s.positions.push(this.positions[o]);
      for (const l in this.attributes.atom)
        i.atom[l].push(this.attributes.atom[l][o]);
    }), new Set(s.symbols).forEach((o) => {
      s.species[o] = this.species[o].element;
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
function unquote(a) {
  return a.startsWith('"') && a.endsWith('"') || a.startsWith("'") && a.endsWith("'") || a.startsWith("{") && a.endsWith("}") ? a.slice(1, -1) : a;
}
function parseExtHeader(a) {
  const e = {};
  let t;
  for (; (t = KV_PAIR.exec(a)) !== null; ) {
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
function parseXYZ(a) {
  const e = a.trim().split(`
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
    const r = e[t++].trim(), o = r.includes("=") ? parseExtHeader(r) : {}, l = { symbols: [], positions: [], attributes: { atom: {} } };
    let c = null;
    if (o.Lattice) {
      const u = Array.isArray(o.Lattice) ? o.Lattice : o.Lattice.split(/[ ,]+/).map(Number);
      c = [
        [u[0], u[1], u[2]],
        [u[3], u[4], u[5]],
        [u[6], u[7], u[8]]
      ];
    }
    if (c && (l.cell = c), o.pbc) {
      const u = Array.isArray(o.pbc) ? o.pbc : typeof o.pbc == "string" ? o.pbc.split(/[ ,]+/).map((p) => p === "T" || p === "true") : [!!o.pbc];
      l.pbc = u;
    }
    let h = ["species", "pos"];
    if (o.Properties) {
      const u = o.Properties.split(":");
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
      h.forEach((S) => {
        const E = p.slice(m, m + S.ncol);
        if (m += S.ncol, S.name === "species")
          g = E[0];
        else if (S.name === "pos")
          [y, f, w] = E.map(parseFloat);
        else {
          const x = E.map((A) => isNaN(A) ? A : +A);
          l.attributes.atom[S.name][u] = S.ncol === 1 ? x[0] : x;
        }
      }), l.symbols.push(g), l.positions.push([y, f, w]);
    }
    const d = new Atoms(l);
    s.push(d);
  }
  return s;
}
function parseCIF(a) {
  const e = {
    cell: [],
    pbc: [!0, !0, !0],
    species: {},
    positions: [],
    symbols: []
  }, t = CIFData.parseCIFBlock(a);
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
  static parseCIFBlock(a) {
    const e = new CIFData(), t = a.split(`
`).map((i) => i.trim());
    let s = null;
    for (let i = 0; i < t.length; i++) {
      const n = t[i];
      if (!(n === "" || n.startsWith("#"))) {
        if (n.startsWith("_")) {
          s && (e.loops.push(s), s = null);
          const [r, o] = CIFData.parseTag(n, t, i);
          e.tags[r.toLowerCase()] = CIFData.convertValue(o);
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
  static parseTag(a, e, t) {
    let [s, ...i] = a.split(" "), n = i.join(" ");
    if (n.startsWith(";"))
      for (n = n.substring(1).trim(), t++; t < e.length && !e[t].startsWith(";"); )
        n += `
` + e[t], t++;
    return [s, n];
  }
  getTagValue(a) {
    return this.tags[a] || null;
  }
  getAnyTagValue(a) {
    for (let e of a) {
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
    const a = this.getAnyTagValue(["_space_group_name_h-m_alt", "_symmetry_space_group_name_h-m", "_space_group.Patterson_name_h-m", "_space_group.patterson_name_h-m"]);
    return { Abm2: "Aem2", Aba2: "Aea2", Cmca: "Cmce", Cmma: "Cmme", Ccca: "Ccc1" }[a] || a;
  }
  static parseLoopRow(a) {
    let e = [];
    const t = /'([^']*)'|"([^"]*)"|(\S+)/g;
    let s;
    for (; (s = t.exec(a)) !== null; )
      e.push(s[1] || s[2] || s[3]);
    return e.map((i) => CIFData.convertValue(i));
  }
  static convertValue(a) {
    let e = Number(a);
    return isNaN(e) ? a : e;
  }
  parseUnitCell() {
    const a = ["_cell_length_a", "_cell_length_b", "_cell_length_c"], e = ["_cell_angle_alpha", "_cell_angle_beta", "_cell_angle_gamma"];
    a.every((t) => t in this.tags) && e.every((t) => t in this.tags) && (this.unitCell = {
      lengths: a.map((t) => parseFloat(this.tags[t])),
      angles: e.map((t) => parseFloat(this.tags[t]))
    });
  }
  parseAtoms() {
    const a = this.loops.find((e) => e.headers.includes("_atom_site_fract_x") || e.headers.includes("_atom_site_cartn_x"));
    a && a.rows.forEach((e) => {
      const t = {};
      a.headers.forEach((s, i) => {
        const n = s.replace("_atom_site_", "");
        t[n] = CIFData.convertValue(e[i]);
      }), this.atoms.push(t);
    });
  }
  parseSymmetryOperations() {
    const a = this.loops.find((t) => t.headers.includes("_symmetry_equiv_pos_as_xyz") || t.headers.includes("_space_group_symop_operation_xyz"));
    if (!a) return [];
    const e = a.headers.includes("_symmetry_equiv_pos_as_xyz") ? "_symmetry_equiv_pos_as_xyz" : "_space_group_symop_operation_xyz";
    return a.rows.map((t) => {
      const s = t[a.headers.indexOf(e)];
      return this.parseSymmetryOperation(s);
    });
  }
  parseSymmetryOperation(opString) {
    let matrix = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ], vector = [0, 0, 0];
    const components = opString.split(",").map((a) => a.trim());
    return components.forEach((component, index) => {
      const translationMatch = component.match(/[+-]\s*(\d+\/\d+|\d*\.\d+|\d+)$/);
      if (translationMatch) {
        const translationValue = eval(translationMatch[1]);
        vector[index] = translationValue;
      }
      component.includes("x") && (matrix[index][0] = component.startsWith("-") ? -1 : 1), component.includes("y") && (matrix[index][1] = component.startsWith("-") ? -1 : 1), component.includes("z") && (matrix[index][2] = component.startsWith("-") ? -1 : 1);
    }), { matrix, vector };
  }
  applySymmetryOperations(a = 1e-3, e = !0) {
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
        this.isUniqueSite(r, t, a) && (e && (r.fract_x = (r.fract_x + 1) % 1, r.fract_y = (r.fract_y + 1) % 1, r.fract_z = (r.fract_z + 1) % 1), t.push(r));
      });
    }), this.atoms = t;
  }
  applySymmetryOperation(a, e, t) {
    const s = [a.fract_x, a.fract_y, a.fract_z], i = [0, 0, 0];
    for (let r = 0; r < 3; r++)
      i[r] = s.reduce((o, l, c) => o + e[r][c] * l, 0);
    const n = i.map((r, o) => r + t[o]);
    return {
      ...a,
      fract_x: n[0],
      fract_y: n[1],
      fract_z: n[2]
    };
  }
  isUniqueSite(a, e, t) {
    for (const s of e)
      if (this.calculateDistance(a, s) < t)
        return !1;
    return !0;
  }
  calculateDistance(a, e) {
    const s = [0, 1, 2].map((i) => a[`fract_${"xyz"[i]}`] - e[`fract_${"xyz"[i]}`]).map((i) => i - Math.round(i));
    return Math.sqrt(s.reduce((i, n) => i + n * n, 0));
  }
}
function formatNumber(a) {
  return typeof a != "number" || Number.isNaN(a) ? "0" : a.toFixed(6);
}
function atomsToXYZ(a) {
  const e = Array.isArray(a) ? a : [a], t = [];
  return e.forEach((s) => {
    const i = s.positions.length;
    t.push(String(i));
    const n = [];
    if (!s.isUndefinedCell()) {
      const r = s.cell.flat().map((o) => formatNumber(o)).join(" ");
      n.push(`Lattice="${r}"`);
    }
    if (Array.isArray(s.pbc)) {
      const r = s.pbc.map((o) => o ? "T" : "F").join(" ");
      n.push(`pbc="${r}"`);
    }
    n.push("Properties=species:S:1:pos:R:3"), t.push(n.join(" "));
    for (let r = 0; r < i; r += 1) {
      const o = s.symbols[r], [l, c, h] = s.positions[r];
      t.push(`${o} ${formatNumber(l)} ${formatNumber(c)} ${formatNumber(h)}`);
    }
  }), t.join(`
`);
}
function atomsToCIF(a) {
  const e = !a.isUndefinedCell(), [t, s, i, n, r, o] = e ? a.getCellLengthsAndAngles() : [1, 1, 1, 90, 90, 90], l = e ? a.calculateFractionalCoordinates() : a.positions, c = [
    "data_weas",
    "_symmetry_space_group_name_H-M 'P 1'",
    "_symmetry_Int_Tables_number 1",
    `_cell_length_a ${formatNumber(t)}`,
    `_cell_length_b ${formatNumber(s)}`,
    `_cell_length_c ${formatNumber(i)}`,
    `_cell_angle_alpha ${formatNumber(n)}`,
    `_cell_angle_beta ${formatNumber(r)}`,
    `_cell_angle_gamma ${formatNumber(o)}`,
    "loop_",
    "_atom_site_label",
    "_atom_site_type_symbol"
  ];
  e ? c.push("_atom_site_fract_x", "_atom_site_fract_y", "_atom_site_fract_z") : c.push("_atom_site_Cartn_x", "_atom_site_Cartn_y", "_atom_site_Cartn_z");
  for (let h = 0; h < a.symbols.length; h += 1) {
    const d = a.symbols[h], [u, p, m] = l[h], g = `${d}${h + 1}`;
    c.push(`${g} ${d} ${formatNumber(u)} ${formatNumber(p)} ${formatNumber(m)}`);
  }
  return c.join(`
`);
}
function downloadText(a, e, t = "text/plain") {
  const s = new Blob([a], { type: t }), i = URL.createObjectURL(s), n = document.createElement("a");
  n.href = i, n.download = e, document.body.appendChild(n), n.click(), document.body.removeChild(n), URL.revokeObjectURL(i);
}
function parseStructureText(a, e) {
  const t = e.toLowerCase();
  if (t === ".xyz")
    return { kind: "atoms", data: parseXYZ(a) };
  if (t === ".cif")
    return { kind: "atoms", data: parseCIF(a) };
  if (t === "on")
    return { kind: "json", data: JSON.parse(a) };
  throw new Error(`Unsupported file extension: ${e}`);
}
function applyStructurePayload(a, e) {
  if (!e || typeof e != "object")
    throw new Error("Invalid structure payload.");
  if (e.version || e.atoms) {
    a.importState(e);
    return;
  }
  if (Array.isArray(e)) {
    const t = e.map((s) => s instanceof Atoms ? s : new Atoms(s));
    a.avr.atoms = t;
    return;
  }
  if (e instanceof Atoms) {
    a.avr.atoms = e;
    return;
  }
  if (e.symbols && e.positions) {
    a.avr.atoms = new Atoms(e);
    return;
  }
  throw new Error("Unrecognized structure payload.");
}
function buildExportPayload(a, e) {
  const t = String(e || "").toLowerCase();
  if (t === "html") {
    const s = a.exportState();
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
      text: JSON.stringify(a.exportState(), null, 2),
      filename: "weas-stateon",
      mimeType: "application/json"
    };
  if (t === "xyz") {
    const s = Array.isArray(a.avr.trajectory) && a.avr.trajectory.length > 1 ? a.avr.trajectory : a.avr.atoms;
    return {
      text: atomsToXYZ(s),
      filename: "structure.xyz",
      mimeType: "chemical/x-xyz"
    };
  }
  if (t === "cif")
    return {
      text: atomsToCIF(a.avr.atoms),
      filename: "structure.cif",
      mimeType: "chemical/x-cif"
    };
  throw new Error(`Unsupported export format: ${e}`);
}
function lockController(a) {
  a.__li.style.pointerEvents = "none", a.__li.style.opacity = 0.95;
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
    }, r = t?.atomLegend || t?.legend || {}, o = { ...defaultGuiConfig.atomLegend, ...r }, l = {
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
      atomLegend: o,
      legend: o,
      meshLegend: l,
      buttonStyle: c
    }, this.gui = new GUI(), this.gui.closed = !0, this.guiConfig.controls.enabled ? this.initGUI() : this.gui.hide(), this.guiConfig.buttons.enabled && this.addButtons();
  }
  initGUI() {
    this.createGUIContainer(), this.guiConfig.controls.cameraControls && this.addCameraControls(), this.weas.materialsRegistry && this.addMaterialsFolder(), this.addShapeOperationsFolder();
  }
  createGUIContainer() {
    const e = document.createElement("div");
    e.style.position = "absolute", e.style.top = "10px", e.style.left = "10px", this.weas.tjs.containerElement.appendChild(e), e.appendChild(this.gui.domElement);
    const t = (s) => s.stopPropagation();
    ["click", "keydown", "keyup", "keypress"].forEach((s) => {
      e.addEventListener(s, t, !1);
    });
  }
  /* ---------------- Materials Folder ---------------- */
  addMaterialsFolder() {
    const e = this.gui.addFolder("Materials"), t = this.weas.materialsRegistry, s = () => {
      const i = Object.entries(e.__folders).filter(([n, r]) => !r.closed).map(([n]) => n);
      for (let n in e.__folders)
        e.removeFolder(e.__folders[n]);
      for (const n of t.list()) {
        const r = t.getMaterial(n, !1), o = r.__builtIn ? `${n} (built-in)` : n, l = e.addFolder(o);
        i.includes(o) && l.open(), t.getSchema(n).forEach((h) => {
          const { prop: d, type: u, min: p, max: m, step: g } = h, y = { [d]: r[d] };
          let f;
          u === "number" ? f = l.add(y, d, p, m, g).name(d) : u === "color" && (f = l.addColor(y, d).name(d)), f && (f.onChange((w) => {
            u === "color" && r[d]?.isColor ? r[d].set(w) : r[d] = w, this.weas.tjs.requestRedraw();
          }), r.__builtIn && lockController(f));
        }), l.add(
          {
            copy: () => {
              let h = n + " Copy", d = 1, u = `${h} (${d})`;
              for (; t.list().includes(u); )
                d++, u = `${h} (${d})`;
              t.copyMaterial(n, u);
            }
          },
          "copy"
        ).name("Copy"), r.__builtIn || l.add(
          {
            rename: () => {
              const h = prompt("Rename material to:", n);
              if (!(!h || h === n)) {
                if (t.list().includes(h)) {
                  alert(`Material "${h}" already exists.`);
                  return;
                }
                t.renameMaterial(n, h);
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
  addCameraControls() {
    createViewpointButtons(this.weas, this.gui), setupCameraGUI(this.weas.tjs, this.gui, this.weas.tjs.camera);
  }
  addButtons() {
    this.ensureToolbarStyles();
    const e = document.createElement("div");
    e.className = "weas-toolbar", e.style.display = "flex", e.style.position = "absolute", e.style.background = "transparent", e.style.padding = "0", e.style.borderRadius = "0", e.style.border = "none", e.style.boxShadow = "none", e.style.backdropFilter = "none", e.style.right = "5px", e.style.top = "5px", e.style.gap = "5px";
    const t = (s) => s.stopPropagation();
    if (e.addEventListener("click", t), e.addEventListener("mousedown", t), e.addEventListener("mouseup", t), this.weas.tjs.containerElement.appendChild(e), this.guiConfig.buttons.fullscreen) {
      const s = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512">
            <path d="M32 32C14.3 32 0 46.3 0 64v96c0 17.7 14.3 32 32 32s32-14.3 32-32V96h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H32zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7 14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H64V352zM320 32c-17.7 0-32 14.3-32 32s14.3 32 32 32h64v64c0 17.7 14.3 32 32 32s32-14.3 32-32V64c0-17.7-14.3-32-32-32H320zM448 352c0-17.7-14.3-32-32-32s-32 14.3-32 32v64H320c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32V352z"/>
          </svg>
      `, i = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512">
            <path d="M160 64c0-17.7-14.3-32-32-32s-32 14.3-32 32v64H32c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32V64zM32 320c-17.7 0-32 14.3-32 32s14.3 32 32 32H96v64c0 17.7 14.3 32 32 32s32-14.3 32-32V352c0-17.7-14.3-32-32-32H32zM352 64c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7 14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H352V64zM320 320c-17.7 0-32 14.3-32 32v96c0 17.7 14.3 32 32 32s32-14.3 32-32V384h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H320z"/>
          </svg>
      `, n = this.createButton(s, "fullscreen");
      e.appendChild(n), n.addEventListener("click", () => {
        document.fullscreenElement ? (document.exitFullscreen(), n.innerHTML = s) : (this.weas.tjs.containerElement.requestFullscreen().catch((r) => {
          alert(
            `Error attempting to enable full-screen mode: ${r.message} (${r.name})`
          );
        }), n.innerHTML = i);
      });
    }
    if (this.guiConfig.buttons.undo) {
      const i = this.createButton(`
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512">
            <path d="M125.7 160H176c17.7 0 32 14.3 32 32s-14.3 32-32 32H48c-17.7 0-32-14.3-32-32V64c0-17.7 14.3-32 32-32s32 14.3 32 32v51.2L97.6 97.6c87.5-87.5 229.3-87.5 316.8 0s87.5 229.3 0 316.8s-229.3 87.5-316.8 0c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0c62.5 62.5 163.8 62.5 226.3 0s62.5-163.8 0-226.3s-163.8-62.5-226.3 0L125.7 160z"/>
          </svg>
      `, "undo");
      e.appendChild(i), i.addEventListener("click", () => {
        this.weas.ops.undo();
      });
    }
    if (this.guiConfig.buttons.redo) {
      const i = this.createButton(`
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512">
            <path d="M386.3 160H336c-17.7 0-32 14.3-32 32s14.3 32 32 32H464c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32s-32 14.3-32 32v51.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0s-87.5 229.3 0 316.8s229.3 87.5 316.8 0c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0c-62.5 62.5-163.8 62.5-226.3 0s-62.5-163.8 0-226.3s163.8-62.5 226.3 0L386.3 160z"/>
          </svg>
      `, "redo");
      e.appendChild(i), i.addEventListener("click", () => {
        this.weas.ops.redo();
      });
    }
    if (this.guiConfig.buttons.export) {
      const i = this.createButton(`
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512">
            <path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V274.7l-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7V32zM64 352c-35.3 0-64 28.7-64 64v32c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V416c0-35.3-28.7-64-64-64H346.5l-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352H64zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/>
          </svg>
      `, "export");
      e.appendChild(i);
      const n = document.createElement("div");
      n.className = "weas-toolbar-popup", n.style.position = "absolute", n.style.top = "38px", n.style.right = "5px", n.style.background = "linear-gradient(180deg, #ffffff 0%, #f8f9fb 100%)", n.style.borderRadius = "10px", n.style.border = "1px solid rgba(20, 23, 28, 0.12)", n.style.padding = "6px", n.style.display = "none", n.style.flexDirection = "column", n.style.gap = "4px", n.style.boxShadow = "0 10px 24px rgba(15, 23, 42, 0.18)", e.appendChild(n);
      const r = (l, c) => {
        const h = document.createElement("button");
        return h.textContent = l, h.className = "weas-toolbar-option", this.setStyle(h), h.style.textAlign = "left", h.style.padding = "4px 8px", h.addEventListener("click", () => {
          if (n.style.display = "none", c === "image") {
            this.weas.tjs.downloadImage();
            return;
          }
          if (c === "animation") {
            this.weas.downloadAnimation();
            return;
          }
          try {
            const d = buildExportPayload(this.weas, c);
            downloadText(d.text, d.filename, d.mimeType);
          } catch (d) {
            console.error("Failed to export structure:", d), alert(`Export failed: ${d.message || d}`);
          }
        }), n.appendChild(h), h;
      };
      r("Image", "image"), r("State (JSON)", "json"), r("Standalone HTML", "html"), r("Structure (XYZ)", "xyz"), r("Structure (CIF)", "cif");
      const o = r(
        "Animation (WebM)",
        "animation"
      );
      i.addEventListener("click", () => {
        if (o) {
          const l = Array.isArray(this.weas.avr?.trajectory) && this.weas.avr.trajectory.length > 1;
          o.style.display = l ? "" : "none";
        }
        n.style.display = n.style.display === "none" ? "flex" : "none";
      }), document.addEventListener("click", (l) => {
        !n.contains(l.target) && l.target !== i && (n.style.display = "none");
      });
    }
    if (this.guiConfig.buttons.import) {
      const i = this.createButton(`
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512">
            <path d="M256 496c-17.7 0-32-14.3-32-32V271.3l-73.4 73.4c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l128-128c12.5-12.5 32.8-12.5 45.3 0l128 128c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L288 271.3V464c0 17.7-14.3 32-32 32zM64 96C28.7 96 0 124.7 0 160v32c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V160c0-35.3-28.7-64-64-64H64z"/>
          </svg>
      `, "import");
      e.appendChild(i);
      const n = document.createElement("input");
      n.type = "file", n.id = "importInput", n.accept = ".json,.xyz,.cif", n.style.display = "none", e.appendChild(n), i.addEventListener("click", () => {
        n.value = "", n.click();
      }), n.addEventListener("change", async () => {
        const r = n.files && n.files[0];
        if (r)
          try {
            const o = await r.text(), l = r.name.slice(r.name.lastIndexOf(".")), c = parseStructureText(o, l);
            c.kind === "json" ? applyStructurePayload(this.weas, c.data) : applyStructurePayload(this.weas, c.data);
          } catch (o) {
            console.error("Failed to import structure:", o), alert(`Import failed: ${o.message || o}`);
          }
      });
    }
    if (this.guiConfig.buttons.measurement) {
      const i = this.createButton(
        `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512">
            <path d="M177.9 494.1c-18.7 18.7-49.1 18.7-67.9 0L17.9 401.9c-18.7-18.7-18.7-49.1 0-67.9l50.7-50.7 48 48c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-48-48 41.4-41.4 48 48c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-48-48 41.4-41.4 48 48c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-48-48 41.4-41.4 48 48c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-48-48 50.7-50.7c18.7-18.7 49.1-18.7 67.9 0l92.1 92.1c18.7 18.7 18.7 49.1 0 67.9L177.9 494.1z"/>
          </svg>
      `,
        "measurement"
      );
      e.appendChild(i), i.addEventListener("click", () => {
        this.weas.avr.Measurement.measure(this.weas.avr.selectedAtomsIndices);
      });
    }
  }
  createButton(e, t = "button") {
    const s = document.createElement("button");
    return s.id = t, s.innerHTML = e, s.className = "weas-toolbar-button", this.setStyle(s), s;
  }
  setStyle(e) {
    const t = this.guiConfig.buttonStyle || {};
    for (const [i, n] of Object.entries(t))
      e.style[i] = n;
    (e.textContent || "").trim().length === 0 && (t.width || (e.style.width = "28px"), t.height || (e.style.height = "28px"), t.display || (e.style.display = "inline-flex"), t.alignItems || (e.style.alignItems = "center"), t.justifyContent || (e.style.justifyContent = "center"), t.lineHeight || (e.style.lineHeight = "0"));
  }
  ensureToolbarStyles() {
    if (document.getElementById("weas-toolbar-styles"))
      return;
    const e = document.createElement("style");
    e.id = "weas-toolbar-styles", e.textContent = `
      .weas-toolbar button.weas-toolbar-button {
        background: #ffffff;
        border: 1px solid #dfe3eb;
        border-radius: 6px;
        color: #39424e;
        transition: background 120ms ease, border-color 120ms ease, box-shadow 120ms ease;
      }
      .weas-toolbar button.weas-toolbar-button:hover {
        background: #eef3ff;
        border-color: #5b7cfa;
        box-shadow: 0 4px 10px rgba(60, 90, 255, 0.28);
      }
      .weas-toolbar button.weas-toolbar-button:active {
        background: #e2e9ff;
        border-color: #4a6df5;
      }
      .weas-toolbar .weas-toolbar-option {
        background: #ffffff;
        border: 1px solid #e1e6f0;
        border-radius: 6px;
        color: #39424e;
        transition: background 120ms ease, border-color 120ms ease, box-shadow 120ms ease;
      }
      .weas-toolbar .weas-toolbar-option:hover {
        background: #f0f4ff;
        border-color: #5b7cfa;
        box-shadow: 0 3px 8px rgba(60, 90, 255, 0.2);
      }
    `, document.head.appendChild(e);
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
      const o = i[r];
      o.path ? n[r] = getByPath$1(this, o.path) : n[r] = this[r];
    }), Object.entries(i).forEach(([r, o]) => {
      const l = resolveOptions(o.options, this), c = addController(e, n, r, o, l);
      if (!c)
        return;
      o.step !== void 0 && c.step && c.step(o.step), (o.type === "text" && typeof c.onFinishChange == "function" ? c.onFinishChange : c.onChange).call(c, () => {
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
function renameFolder(a, e) {
  const t = a.domElement.querySelector(".title");
  t && (t.textContent = e);
}
function normalizeUISchema(a) {
  return a.fields ? { title: a.title || null, fields: a.fields } : { title: a.title || null, fields: a };
}
function resolveOptions(a, e) {
  return a ? typeof a == "function" ? a(e) : a : null;
}
function addController(a, e, t, s, i) {
  return s.type === "color" ? a.addColor(e, t) : s.type === "boolean" ? a.add(e, t) : s.type === "number" && s.min !== void 0 && s.max !== void 0 ? a.add(e, t, s.min, s.max) : s.type === "select" && i || i ? a.add(e, t, i) : a.add(e, t);
}
function getByPath$1(a, e) {
  const t = e.split(".");
  let s = a;
  for (const i of t) {
    if (!s)
      return;
    s = s[i];
  }
  return s;
}
function setByPath(a, e, t) {
  const s = e.split(".");
  let i = a;
  for (let n = 0; n < s.length - 1; n++) {
    const r = s[n];
    i[r] || (i[r] = {}), i = i[r];
  }
  i[s[s.length - 1]] = t;
}
function cloneValue$2(a) {
  return a === void 0 ? a : JSON.parse(JSON.stringify(a));
}
function buildStatePatch(a, e) {
  if (!a)
    return e;
  const t = a.split("."), s = {};
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
        const i = new THREE.Vector3(...s[e[0]]), n = new THREE.Vector3(...s[e[1]]), r = new THREE.Vector3(...s[e[2]]), o = n.clone().sub(i).cross(r.clone().sub(i));
        if (o.lengthSq() > 0) {
          const l = o.normalize();
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
        const i = new THREE.Vector3(...s[t[0]]), n = new THREE.Vector3(...s[t[1]]), r = new THREE.Vector3(...s[t[2]]), o = n.clone().sub(i).cross(r.clone().sub(i));
        if (o.lengthSq() > 0) {
          const l = o.normalize();
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
    const s = this.getNDC(e), i = getWorldPositionFromScreen(this.tjs.camera, s, this.translatePlane), n = this.getNDC(t), r = getWorldPositionFromScreen(this.tjs.camera, n, this.translatePlane), o = i.sub(r);
    if (this.translatePlanePending)
      return new THREE.Vector3(0, 0, 0);
    if (!this.translateConstraintType)
      return o;
    if (this.translateConstraintType === "axis")
      return this.translateAxis.clone().multiplyScalar(o.dot(this.translateAxis));
    if (this.translateConstraintType === "plane") {
      const l = this.translatePlaneNormal.clone().normalize();
      return o.sub(l.multiplyScalar(o.dot(l)));
    }
    if (this.translateConstraintType === "normal") {
      const l = this.translatePlaneNormal.clone().normalize();
      return l.multiplyScalar(o.dot(l));
    }
    return o;
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
    let o = new THREE.Vector2().subVectors(i, this.centroidNDC).length() / n.length();
    return new THREE.Vector3(o, o, o);
  }
  getRotationAngle(e, t) {
    const s = this.getNDC(t), i = this.getNDC(e);
    if (s.equals(i))
      return;
    const n = new THREE.Vector2().subVectors(s, this.centroidNDC), r = new THREE.Vector2().subVectors(i, this.centroidNDC);
    n.normalize(), r.normalize();
    let o = Math.acos(n.dot(r));
    return n.x * r.y - n.y * r.x < 0 && (o = -o), o = THREE.MathUtils.radToDeg(o), o;
  }
}
function matchKey$1(a, e) {
  const t = e[e.length - 1], s = e.slice(0, -1);
  if (a.key.toLowerCase() !== t.toLowerCase()) return !1;
  const i = s.includes("ctrl"), n = s.includes("shift"), r = s.includes("alt"), o = s.includes("meta");
  return !(i !== a.ctrlKey || n !== a.shiftKey || r !== a.altKey || o !== a.metaKey);
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
    camera1: () => this.weas.tjs.updateCameraAndControls({ direction: [0, -100, 0] }),
    camera2: () => this.weas.tjs.updateCameraAndControls({ direction: [-100, 0, 0] }),
    camera3: () => this.weas.tjs.updateCameraAndControls({ direction: [0, 0, 100] }),
    camera4: () => this.weas.tjs.updateCameraAndControls({ direction: [0, 100, 0] }),
    camera5: () => this.weas.tjs.updateCameraAndControls({ direction: [100, 0, 0] }),
    camera6: () => this.weas.tjs.updateCameraAndControls({ direction: [0, 0, -100] })
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
function createOutline(a, e = 1.1) {
  const t = new THREE.MeshBasicMaterial({ color: 16776960, side: THREE.BackSide, transparent: !0, opacity: 0.8 }), s = new THREE.Mesh(a.geometry, t);
  s.scale.multiplyScalar(e), s.layers.set(1), a.add(s), a.userData.outlineMesh = s;
}
function removeOutline(a) {
  a.userData.outlineMesh && (a.remove(a.userData.outlineMesh), a.userData.outlineMesh = void 0);
}
function initVertexIndicators(a) {
  const e = a.geometry.attributes.position, t = e.count, s = new THREE.PointsMaterial({ vertexColors: !0, size: 5, sizeAttenuation: !1 }), i = new THREE.BufferGeometry();
  i.setAttribute("position", e);
  const n = new Float32Array(t * 3);
  for (let o = 0; o < t; o++)
    n[o * 3] = 0, n[o * 3 + 1] = 0, n[o * 3 + 2] = 0;
  i.setAttribute("color", new THREE.BufferAttribute(n, 3));
  const r = new THREE.Points(i, s);
  a.add(r), r.layers.set(1), a.userData.vertexPoints = r;
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
      const o = _frustum.planes;
      o[0].setFromCoplanarPoints(_vecTopLeft, _vecFarTopLeft, _vecFarTopRight), o[1].setFromCoplanarPoints(_vecTopRight, _vecFarTopRight, _vecFarDownRight), o[2].setFromCoplanarPoints(_vecFarDownRight, _vecFarDownLeft, _vecDownLeft), o[3].setFromCoplanarPoints(_vecFarDownLeft, _vecFarTopLeft, _vecTopLeft), o[4].setFromCoplanarPoints(_vecTopRight, _vecDownRight, _vecDownLeft), o[5].setFromCoplanarPoints(_vecFarDownRight, _vecFarTopRight, _vecFarTopLeft), o[5].normal.multiplyScalar(-1);
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
    const n = s[0].face, r = s[0].point, o = i.parent?.isMesh ? i.parent : null;
    if (i.isLineSegments && i.userData?.type === "anyMesh" && o) {
      if (o.userData?.objectMode === "edit")
        return;
      i = o;
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
      for (let o = 0; o < n; o++)
        r[o * 3] = 0, r[o * 3 + 1] = 0, r[o * 3 + 2] = 0;
      i.forEach((o) => {
        r[o * 3] = 1, r[o * 3 + 1] = 0, r[o * 3 + 2] = 0;
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
    const i = new THREE.Vector3(...e[t]), n = new THREE.Vector3(...e[s]), r = n.clone().sub(i), o = r.length();
    if (o === 0)
      return;
    const l = r.normalize(), c = i.clone().add(n).multiplyScalar(0.5), h = o * this.axisLineExtendFactor, d = c.clone().addScaledVector(l, -h), u = c.clone().addScaledVector(l, h);
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
    const n = new THREE.Vector3(...e[t]), r = new THREE.Vector3(...e[s]), o = new THREE.Vector3(...e[i]), l = r.clone().sub(n).cross(o.clone().sub(n));
    if (l.lengthSq() === 0) {
      this.hidePlaneWithNormal({
        meshKey: "rotatePlaneMesh",
        lineKey: "rotateNormalLine"
      });
      return;
    }
    const c = n.clone().add(r).add(o).multiplyScalar(1 / 3);
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
  showPlaneWithNormal({ center: e, normal: t, size: s, color: i, lineLength: n, meshKey: r, lineKey: o }) {
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
    if (this[o])
      this[o].geometry.setFromPoints([h, d]), this[o].geometry.attributes.position.needsUpdate = !0, this[o].geometry.computeBoundingSphere(), this[o].computeLineDistances();
    else {
      const u = new THREE.BufferGeometry().setFromPoints([h, d]), p = new THREE.LineDashedMaterial({
        color: i,
        dashSize: 0.6,
        gapSize: 0.4,
        transparent: !0,
        opacity: 0.9,
        depthTest: !1
      });
      this[o] = new THREE.Line(u, p), this[o].computeLineDistances(), this[o].userData.notSelectable = !0, this[o].layers.set(1), this[o].renderOrder = 999, this.tjs.scene.add(this[o]);
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
    const o = e.clone().addScaledVector(r, -s), l = e.clone().addScaledVector(r, s);
    if (this[n])
      this[n].geometry.setFromPoints([o, l]), this[n].geometry.attributes.position.needsUpdate = !0, this[n].geometry.computeBoundingSphere(), this[n].computeLineDistances();
    else {
      const c = new THREE.BufferGeometry().setFromPoints([o, l]), h = new THREE.LineDashedMaterial({
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
    for (let o = 0; o < t.positions.length; o++) {
      if (r.set(...t.positions[o]).project(i), r.z < -1 || r.z > 1)
        continue;
      const l = (r.x + 1) * 0.5 * s.width, c = (-r.y + 1) * 0.5 * s.height;
      pointInPolygon$1(l, c, e) && n.push(o);
    }
    return n;
  }
}
function getClosestVertex(a, e, t) {
  const s = a.geometry.getAttribute("position"), i = new THREE.Vector3(), n = new THREE.Vector3(), r = new THREE.Vector3();
  return i.fromBufferAttribute(s, e.a).applyMatrix4(a.matrixWorld), n.fromBufferAttribute(s, e.b).applyMatrix4(a.matrixWorld), r.fromBufferAttribute(s, e.c).applyMatrix4(a.matrixWorld), [
    { vertexId: e.a, distance: i.distanceTo(t) },
    { vertexId: e.b, distance: n.distanceTo(t) },
    { vertexId: e.c, distance: r.distanceTo(t) }
  ].reduce((c, h) => c.distance < h.distance ? c : h);
}
function pointInPolygon$1(a, e, t) {
  let s = !1;
  for (let i = 0, n = t.length - 1; i < t.length; n = i++) {
    const r = t[i].x, o = t[i].y, l = t[n].x, c = t[n].y;
    o > e != c > e && a < (l - r) * (e - o) / (c - o) + r && (s = !s);
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
function matchKey(a, e) {
  const t = e[e.length - 1], s = e.slice(0, -1);
  if (a.key.toLowerCase() !== t.toLowerCase()) return !1;
  const i = s.includes("ctrl"), n = s.includes("shift"), r = s.includes("alt"), o = s.includes("meta");
  return !(i !== a.ctrlKey || n !== a.shiftKey || r !== a.altKey || o !== a.metaKey);
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
      const o = `${r.category}: ${r.description}`;
      n[o] = (n[o] || 0) + 1;
    }), s.forEach((r) => {
      if (!r.description) return;
      const o = document.createElement("li");
      o.tabIndex = 0;
      const l = `${r.category}: ${r.description}`, c = n[l] > 1 ? `${l} (${r.name})` : l;
      o.textContent = c, o.onclick = () => this.execute(r), o.onkeydown = (h) => {
        h.key === "Enter" && this.execute(r);
      }, t.appendChild(o);
    });
  }
  execute(e) {
    let t;
    e.category === "Shapes" ? t = new e.cls(this.weas, e.name, {}) : t = new e.cls({ weas: this.weas }), this.weas.ops.execute(t), this.hide(), this.weas.tjs.containerElement.focus();
  }
}
function AddKeyToDesc(a, e, t) {
  let s = a || "Operation";
  const i = e[t] || [];
  if (i.length > 0 && i[0].length > 0) {
    const n = i[0].map((r) => r.charAt(0).toUpperCase() + r.slice(1)).join("+");
    s += ` [${n}]`;
  }
  return s;
}
function getAllOperations(a, e) {
  const t = [];
  return Object.keys(a).forEach((s) => {
    Object.values(a[s]).forEach((i) => {
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
    Array.isArray(r) && this.indices.forEach((o) => {
      const l = r[o];
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
function pointsInsideMesh(a, e) {
  let t = new THREE.Raycaster(), s = new THREE.Vector3(0.23184, 0.413, 0.879), i;
  const n = [];
  for (let r = 0; r < a.length; r++)
    i = new THREE.Vector3(...a[r]), t.set(i, s), t.intersectObject(e).length % 2 === 1 && n.push(r);
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
function cloneValue$1(a) {
  return a === void 0 ? a : JSON.parse(JSON.stringify(a));
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
function normalizeValue(a) {
  if (a && typeof a.getHexString == "function")
    return `#${a.getHexString()}`;
  if (Array.isArray(a))
    return a.map((e) => normalizeValue(e));
  if (a && typeof a == "object") {
    const e = {};
    return Object.entries(a).forEach(([t, s]) => {
      e[t] = normalizeValue(s);
    }), e;
  }
  return a;
}
function cloneSettings(a) {
  return normalizeValue(a);
}
function addDefined(a, e, t) {
  t !== void 0 && (a[e] = t);
}
function addSettings(a, e, t) {
  t != null && (a[e] = t);
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
function cloneValue(a) {
  const e = JSON.stringify(a);
  if (e !== void 0)
    return JSON.parse(e);
}
function getByPath(a, e) {
  if (!e)
    return a;
  const t = e.split(".");
  let s = a;
  for (const i of t) {
    if (!s)
      return;
    s = s[i];
  }
  return s;
}
function mergeDeep(a, e) {
  return Object.entries(e || {}).forEach(([t, s]) => {
    s && typeof s == "object" && !Array.isArray(s) ? ((!a[t] || typeof a[t] != "object") && (a[t] = {}), mergeDeep(a[t], s)) : a[t] = s;
  }), a;
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
      i.opacity < 1 && (n.renderOrder = 2), e.instances.forEach((r, o) => {
        const l = new THREE.Object3D(), c = new THREE.Vector3(...r.position);
        l.position.copy(c);
        const h = r.scale || [1, 1, 1];
        l.scale.set(...h);
        const d = r.rotation || [0, 0, 0];
        l.rotation.set(...d), l.updateMatrix(), n.setMatrixAt(o, l.matrix);
        const u = r.color || "#bd0d87";
        n.setColorAt(o, new THREE.Color(u));
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
function mergeGeometries(a, e = !1) {
  const t = a[0].index !== null, s = new Set(Object.keys(a[0].attributes)), i = new Set(Object.keys(a[0].morphAttributes)), n = {}, r = {}, o = a[0].morphTargetsRelative, l = new BufferGeometry();
  let c = 0;
  for (let h = 0; h < a.length; ++h) {
    const d = a[h];
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
    if (o !== d.morphTargetsRelative)
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
    for (let u = 0; u < a.length; ++u) {
      const p = a[u].index;
      for (let m = 0; m < p.count; ++m)
        d.push(p.getX(m) + h);
      h += a[u].attributes.position.count;
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
function mergeAttributes(a) {
  let e, t, s, i = -1, n = 0;
  for (let c = 0; c < a.length; ++c) {
    const h = a[c];
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
  const r = new e(n), o = new BufferAttribute(r, t, s);
  let l = 0;
  for (let c = 0; c < a.length; ++c) {
    const h = a[c];
    if (h.isInterleavedBufferAttribute) {
      const d = l / t;
      for (let u = 0, p = h.count; u < p; u++)
        for (let m = 0; m < t; m++) {
          const g = h.getComponent(u, m);
          o.setComponent(u + d, m, g);
        }
    } else
      r.set(h.array, l);
    l += h.count * t;
  }
  return i !== void 0 && (o.gpuType = i), o;
}
function mergeVertices(a, e = 1e-4) {
  e = Math.max(e, Number.EPSILON);
  const t = {}, s = a.getIndex(), i = a.getAttribute("position"), n = s ? s.count : i.count;
  let r = 0;
  const o = Object.keys(a.attributes), l = {}, c = {}, h = [], d = ["getX", "getY", "getZ", "getW"], u = ["setX", "setY", "setZ", "setW"];
  for (let w = 0, S = o.length; w < S; w++) {
    const E = o[w], x = a.attributes[E];
    l[E] = new x.constructor(
      new x.array.constructor(x.count * x.itemSize),
      x.itemSize,
      x.normalized
    );
    const A = a.morphAttributes[E];
    A && (c[E] || (c[E] = []), A.forEach((v, M) => {
      const T = new v.array.constructor(v.count * v.itemSize);
      c[E][M] = new v.constructor(T, v.itemSize, v.normalized);
    }));
  }
  const p = e * 0.5, m = Math.log10(1 / e), g = Math.pow(10, m), y = p * g;
  for (let w = 0; w < n; w++) {
    const S = s ? s.getX(w) : w;
    let E = "";
    for (let x = 0, A = o.length; x < A; x++) {
      const v = o[x], M = a.getAttribute(v), T = M.itemSize;
      for (let C = 0; C < T; C++)
        E += `${~~(M[d[C]](S) * g + y)},`;
    }
    if (E in t)
      h.push(t[E]);
    else {
      for (let x = 0, A = o.length; x < A; x++) {
        const v = o[x], M = a.getAttribute(v), T = a.morphAttributes[v], C = M.itemSize, P = l[v], B = c[v];
        for (let j = 0; j < C; j++) {
          const _ = d[j], L = u[j];
          if (P[L](r, M[_](S)), T)
            for (let N = 0, W = T.length; N < W; N++)
              B[N][L](r, T[N][_](S));
        }
      }
      t[E] = r, h.push(r), r++;
    }
  }
  const f = a.clone();
  for (const w in a.attributes) {
    const S = l[w];
    if (f.setAttribute(w, new S.constructor(
      S.array.slice(0, r * S.itemSize),
      S.itemSize,
      S.normalized
    )), w in c)
      for (let E = 0; E < c[w].length; E++) {
        const x = c[w][E];
        f.morphAttributes[w][E] = new x.constructor(
          x.array.slice(0, r * x.itemSize),
          x.itemSize,
          x.normalized
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
    materialType: o = "Standard",
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
    layer: S = null,
    userData: E = null
  }) {
    this.name = e, this.vertices = t, this.faces = s, this.color = i, this.opacity = n, this.position = r, this.materialType = o, this.showEdges = l, this.edgeColor = c, this.depthWrite = h, this.depthTest = d, this.side = u, this.clearDepth = p, this.renderOrder = m, this.mergeVerticesTolerance = g, this.smoothNormals = y, this.visible = f, this.selectable = w, this.layer = S, this.userData = E;
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
    materialType: o,
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
    layer: S,
    userData: E
  }) {
    e || (e = `mesh-${this.settings.length + 1}`);
    const x = new Setting$a({
      name: e,
      vertices: t,
      faces: s,
      color: i,
      opacity: n,
      position: r,
      materialType: o,
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
      layer: S,
      userData: E
    });
    this.settings.push(x);
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
      const r = new THREE.BufferGeometry(), o = new Float32Array(e.vertices);
      r.setAttribute("position", new THREE.BufferAttribute(o, 3));
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
      const o = document.createElement("span");
      o.textContent = s.name || "mesh", o.style.fontSize = "12px", o.style.color = "#1f2933", i.appendChild(o), i.addEventListener("click", () => this.toggleMeshVisibility(s.name)), e.appendChild(i);
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
function resolveLegendColor(a) {
  const e = new THREE.Color();
  return Array.isArray(a) ? e.setRGB(a[0] ?? 1, a[1] ?? 0, a[2] ?? 0) : a ? e.set(a) : e.setRGB(1, 0, 0), `#${e.getHexString()}`;
}
let Setting$9 = class {
  constructor({ positions: e = [], texts: t = "+", color: s = "#111111", fontSize: i = "16px", className: n = "text-label text-label-cross", renderMode: r = "glyph", shift: o = [0, 0, 0] }) {
    this.positions = e, this.texts = t, this.color = s, this.fontSize = i, this.className = n, this.renderMode = r, this.shift = o;
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
  addSetting({ positions: e, texts: t = "+", color: s = "#111111", fontSize: i = "16px", className: n, renderMode: r = "glyph", shift: o = [0, 0, 0] }) {
    const l = new Setting$9({ positions: e, texts: t, color: s, fontSize: i, className: n, renderMode: r, shift: o });
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
      const s = new THREE.Vector3(...e.shift), i = Array.isArray(e.texts) ? e.texts : null, n = normalizeFontSize$1(e.fontSize), r = e.className || "text-label text-label-cross", o = e.renderMode || "glyph";
      t.forEach((l, c) => {
        const h = new THREE.Vector3(...l).add(s), d = i ? i[c] ?? "" : e.texts, { label: u } = this.createTextLabel(h, d, e.color, n, r, o);
        this.scene.add(u), this.labels.push(u);
      });
    }), this.weas?.requestRedraw?.("render");
  }
  createTextLabel(e, t, s, i, n, r = "glyph") {
    const o = t === "+", l = o && !n.includes("text-label-cross") ? `${n} text-label-cross` : n, c = createLabel(e, t, s, i, l), h = o && l.includes("text-label-cross") && r === "shape";
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
function resolveOrigins(a, e) {
  return Array.isArray(e.positions) ? e.positions : [];
}
function normalizeFontSize$1(a) {
  return typeof a == "number" ? `${a}px` : typeof a == "string" && a.trim() !== "" ? a : "14px";
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
      axisColors: t.axisColors ?? { a: 16711680, b: 65280, c: 255 }
      // RGB
    }, this._showCell = this.settings.showCell, this._showAxes = this.settings.showAxes;
    const s = this.viewer.state.get("cell") || {};
    Object.assign(this.settings, s), s.showCell !== void 0 && (this._showCell = s.showCell), s.showAxes !== void 0 && (this._showAxes = s.showAxes), this.viewer.state.subscribe("cell", (i, n) => {
      if (!i)
        return;
      const r = n || {}, { showCell: o, showAxes: l, ...c } = i, h = { ...r };
      delete h.showCell, delete h.showAxes, Object.assign(this.settings, c), o !== void 0 && (this.showCell = o), l !== void 0 && (this.showAxes = l), JSON.stringify(c) !== JSON.stringify(h) && (this.draw(), this.viewer.requestRedraw?.("render"));
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
    this.cellMesh && (this.viewer.tjs.scene.remove(this.cellMesh), this.cellMesh.geometry.dispose(), this.cellMesh.material.dispose(), this.cellMesh = null), this.cellVectors && (this.viewer.tjs.coordScene.remove(this.cellVectors), this.cellVectors = null);
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
    }), s = [], i = new THREE.Vector3(0, 0, 0), n = new THREE.Vector3(...e[0]), r = new THREE.Vector3(...e[1]), o = new THREE.Vector3().addVectors(n, r), l = new THREE.Vector3(...e[2]), c = new THREE.Vector3().addVectors(n, l), h = new THREE.Vector3().addVectors(r, l), d = new THREE.Vector3().addVectors(o, l);
    s.push(i, n, n, o, o, r, r, i), s.push(l, c, c, d, d, h, h, l), s.push(i, l, n, c, r, h, o, d);
    const u = new THREE.BufferGeometry().setFromPoints(s), p = new THREE.LineSegments(u, t);
    return p.userData = { type: "cell", uuid: this.viewer.uuid, objectMode: "edit", notSelectable: !0 }, p.layers.set(1), this.viewer.tjs.scene.add(p), p.visible = this.showCell, p;
  }
  drawUnitCellVectors() {
    const e = new THREE.Vector3(0, 0, 0), t = this.viewer.originalCell;
    if (!t || t.length !== 3) {
      console.warn("Invalid or missing unit cell data for vectors");
      return;
    }
    const s = new THREE.Group(), i = ["a", "b", "c"], n = this.settings.axisColors, r = 0.5;
    return t.forEach((o, l) => {
      const c = new THREE.Vector3(...o), h = this.shapeRegistry.create("Arrow", {
        color: n[i[l]],
        start: e.clone(),
        end: c.clone(),
        shaftRadius: 0.2,
        headRadius: 0.5,
        shaftRatio: 0.75
      });
      s.add(h);
      const d = c.clone().multiplyScalar(1 + r / c.length());
      s.add(
        createSpriteLabel(d, i[l], "black", "150px")
      );
      const u = this.shapeRegistry.create("Sphere", {
        color: "grey",
        position: e.clone(),
        scale: [
          this.settings.axisSphereRadius,
          this.settings.axisSphereRadius,
          this.settings.axisSphereRadius
        ]
      });
      s.add(u);
    }), this.viewer.tjs.coordScene.add(s), s.visible = this.showCell, s;
  }
  // This seems unused - perhaps in a clean up we can consider removing this.
  updateCellMesh(e) {
    if (!e || e.length !== 3) {
      console.warn("Invalid cell data for updating cell mesh");
      return;
    }
    if (!this.cellMesh && !this.currentCell) return;
    const t = 1e-5;
    if (!e.every((s, i) => s.every((n, r) => Math.abs(n - this.currentCell[i][r]) < t))) {
      if (this.cellMesh) {
        const s = new THREE.LineBasicMaterial({
          color: this.settings.cellColor,
          linewidth: this.settings.cellLineWidth
        }), i = [], n = new THREE.Vector3(0, 0, 0), r = new THREE.Vector3(...e[0]), o = new THREE.Vector3(...e[1]), l = new THREE.Vector3().addVectors(r, o), c = new THREE.Vector3(...e[2]), h = new THREE.Vector3().addVectors(r, c), d = new THREE.Vector3().addVectors(o, c), u = new THREE.Vector3().addVectors(l, c);
        i.push(n, r, r, l, l, o, o, n), i.push(c, h, h, u, u, d, d, c), i.push(n, c, r, h, o, d, l, u), this.cellMesh.geometry.setFromPoints(i), this.cellMesh.material = s;
      }
      if (this.cellVectors) {
        const s = [new THREE.Vector3(...e[0]).normalize(), new THREE.Vector3(...e[1]).normalize(), new THREE.Vector3(...e[2]).normalize()], i = new THREE.Vector3(0, 1, 0);
        for (let r = 0; r < 3; r++) {
          const o = new THREE.Quaternion().setFromUnitVectors(i, s[r]);
          this.cellVectors.children[r].setRotationFromQuaternion(o);
        }
        const n = 3.3;
        this.cellVectors.children[3].position.copy(s[0].multiplyScalar(n)), this.cellVectors.children[4].position.copy(s[1].multiplyScalar(n)), this.cellVectors.children[5].position.copy(s[2].multiplyScalar(n));
      }
    }
  }
}
function createSpriteLabel(a, e, t, s) {
  const n = document.createElement("canvas");
  n.width = 128, n.height = 128;
  const r = n.getContext("2d");
  r.font = `${parseInt(s) * (128 / 180)}px Arial`, r.fillStyle = t, r.textAlign = "center", r.textBaseline = "middle", r.fillText(e, n.width / 2, n.height / 2);
  const o = new THREE.CanvasTexture(n);
  o.minFilter = THREE.LinearFilter, o.generateMipmaps = !1, o.encoding = THREE.sRGBEncoding, o.anisotropy = 16;
  const l = new THREE.Sprite(new THREE.SpriteMaterial({ map: o }));
  l.position.copy(a);
  const c = 2.25;
  return l.scale.set(c, c, 1), l;
}
function getAtomColors(a, e, t) {
  let s = [], i;
  if (e === "Random")
    s = [], a.symbols.forEach((n, r) => {
      i = new THREE.Color(Math.random() * 16777215), s.push(i);
    });
  else if (e === "Uniform")
    s = [], a.symbols.forEach((n, r) => {
      i = new THREE.Color(t.colorRamp[0]), s.push(i);
    });
  else if (e === "Index") {
    s = [];
    const n = a.symbols.map((r, o) => o);
    return getColorsFromArray(n, t.colorRamp);
  } else if (e in a.attributes.atom) {
    const n = a.attributes.atom[e];
    if (n.length > 0 && n[0].length) {
      const r = n.map((o) => Math.sqrt(o.reduce((l, c) => l + c ** 2, 0)));
      return getColorsFromArray(r, t.colorRamp);
    }
    return getColorsFromArray(n, t.colorRamp);
  }
  return s;
}
function getColorsFromArray(a, e) {
  const t = [], s = Math.min(...a), n = Math.max(...a) - s, r = e.length - 1;
  return a.forEach((o) => {
    const l = (o - s) / n, c = Math.min(Math.floor(l * r), r - 1), h = (l - c / r) * r, d = new THREE.Color(e[c]), u = new THREE.Color(e[c + 1]), p = new THREE.Color(d.r, d.g, d.b).lerp(u, h);
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
  addSetting({ specie1: e, specie2: t, radius: s, min: i = 0, max: n = 3, color1: r = "#3d82ed", color2: o = "#3d82ed", order: l = 1 }) {
    const c = new Setting$8({ specie1: e, specie2: t, radius: s, min: i, max: n, color1: r, color2: o, order: l }), h = e + "-" + t;
    this.settings[h] = c;
  }
  getBoundaryAtoms() {
    this.viewer.boundaryList = searchBoundary(this.viewer.atoms, this.viewer._boundary), this.viewer.logger.debug("boundaryList: ", this.viewer.boundaryList), this.viewer.boundaryMap = createBoundaryMapping(this.viewer.boundaryList), this.viewer.logger.debug("boundaryMap: ", this.viewer.boundaryMap);
  }
}
function getImageAtoms(a, e) {
  const t = new Atoms();
  t.cell = a.cell, t.species = a.species;
  const s = e.map((i) => {
    const n = a.positions[i[0]], r = calculateCartesianCoordinates(a.cell, [i[1][0], i[1][1], i[1][2]]);
    return n.map((o, l) => o + r[l]);
  });
  return t.positions = s, t.symbols = e.map((i) => a.symbols[i[0]]), t.uuid = a.uuid, t;
}
function searchBoundary(a, e = [
  [-0.01, 1.01],
  [-0.01, 1.01],
  [-0.01, 1.01]
]) {
  if (a.isUndefinedCell())
    return [];
  let t = a.positions, s = a.species;
  typeof e == "number" && (e = [
    [-e, 1 + e],
    [-e, 1 + e],
    [-e, 1 + e]
  ]), e = e.map((g) => g.map(Number));
  const i = e.map((g) => Math.floor(g[0])), n = e.map((g) => Math.ceil(g[1])), r = [i, n.map((g, y) => g)], o = r[0].reduce((g, y, f) => g * (r[1][f] - y), 1);
  t = a.calculateFractionalCoordinates();
  const l = t.length;
  let c = repeatPositions(t, o - 1), h = 0, d = [], u = [];
  for (let g = r[0][0]; g < r[1][0]; g++)
    for (let y = r[0][1]; y < r[1][1]; y++)
      for (let f = r[0][2]; f < r[1][2]; f++) {
        if (g === 0 && y === 0 && f === 0)
          continue;
        let w = h + l;
        for (let S = h; S < w; S++)
          c[S] = c[S].map((E, x) => E + (x === 0 ? g : x === 1 ? y : f)), d.push([S % l, [g, y, f]]);
        u = u.concat(s), h = w;
      }
  let p = [];
  for (let g = 0; g < c.length; g++)
    c[g][0] > e[0][0] && c[g][0] < e[0][1] && c[g][1] > e[1][0] && c[g][1] < e[1][1] && c[g][2] > e[2][0] && c[g][2] < e[2][1] && p.push(g);
  return p.map((g) => d[g]);
}
function createBoundaryMapping(a) {
  const e = {};
  return a.forEach((t, s) => {
    const i = t[0], n = t[1];
    e[i] ? e[i].push({ index: s, offset: n }) : e[i] = [{ index: s, offset: n }];
  }), e;
}
function repeatPositions(a, e) {
  let t = [];
  for (let s = 0; s < e; s++)
    for (let i = 0; i < a.length; i++)
      t.push([...a[i]]);
  return t;
}
function convertColor$1(a) {
  return Array.isArray(a) ? a = new THREE.Color(...a) : a = new THREE.Color(a), a;
}
function drawAtoms({
  atoms: a,
  atomScales: e,
  settings: t,
  colors: s,
  materialType: i = "Standard",
  shapeType: n = "Sphere",
  data_type: r = "atom",
  shapeRegistry: o
}) {
  const c = [
    [1e5, 12],
    [1e4, 18],
    [1e3, 24],
    [100, 32]
  ].find(([S]) => a.symbols.length > S)?.[1] ?? 32, h = o.create(n, { materialType: i, widthSegments: c, heightSegments: c });
  let d, u;
  if (h instanceof THREE.Mesh)
    d = h.geometry.clone(), u = h.material.clone();
  else if (h instanceof THREE.Group) {
    const S = h.children.find((E) => E instanceof THREE.Mesh);
    if (!S) throw new Error("Shape group has no meshes");
    d = S.geometry.clone(), u = S.material.clone();
  } else
    throw new Error("Unsupported shape type for instancing");
  u = u.clone(), u.color.set(16777215), u.transparent = !0, u.side = THREE.DoubleSide;
  const p = a.symbols.length, m = new THREE.InstancedMesh(d, u, p);
  m.instanceColor = new THREE.InstancedBufferAttribute(
    new Float32Array(p * 3),
    3
  );
  const g = new THREE.Vector3(), y = new THREE.Quaternion(), f = new THREE.Vector3(), w = new THREE.Matrix4();
  return a.symbols.forEach((S, E) => {
    g.set(...a.positions[E]);
    const A = (S in t ? t[S].radius : 1) * e[E];
    f.set(A, A, A), w.compose(g, y, f), m.setMatrixAt(E, w);
    const v = s[E] instanceof THREE.Color ? s[E] : new THREE.Color(s[E]);
    m.setColorAt(E, v);
  }), m.instanceMatrix.needsUpdate = !0, m.instanceColor.needsUpdate = !0, m.userData = {
    type: r,
    uuid: a.uuid,
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
      for (let o = 0; o < s.getAtomsCount(); o++)
        i[o] = this.viewer.atomScales[this.viewer.imageAtomsList[o][0]];
      const n = this.viewer.imageAtomsList.map(([o]) => {
        const l = this.viewer.atomColors?.[o];
        if (l)
          return typeof l.clone == "function" ? l.clone() : new THREE.Color(l);
        const c = this.viewer.atoms.symbols[o];
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
      const i = s.index, n = this.viewer.atoms.positions[e].map((o, l) => o + calculateCartesianCoordinates(this.viewer.atoms.cell, s.offset)[l]), r = new THREE.Matrix4();
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
    const n = new THREE.Vector3(), r = new THREE.Quaternion(), o = new THREE.Vector3();
    t.forEach((l) => {
      const c = new THREE.Matrix4(), h = this.settings[s[l]].radius || 1;
      e.getMatrixAt(l, c), c.decompose(n, r, o), o.set(h * i, h * i, h * i), c.compose(n, r, o), e.setMatrixAt(l, c);
    }), e.instanceMatrix.needsUpdate = !0;
  }
}
function createImageAtomsMapping(a) {
  const e = {};
  return a.forEach((t, s) => {
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
    function n(o, l, c) {
      var h = l % s.length, d, u;
      return o.length === 0 ? null : o.length === 1 ? new Node(o[0], h, c) : (o.sort(function(p, m) {
        return p[s[h]] - m[s[h]];
      }), d = Math.floor(o.length / 2), u = new Node(o[d], h, c), u.left = n(o.slice(0, d), l + 1, u), u.right = n(o.slice(d + 1), l + 1, u), u);
    }
    function r(o) {
      i.root = o;
      function l(c) {
        c.left && (c.left.parent = c, l(c.left)), c.right && (c.right.parent = c, l(c.right));
      }
      l(i.root);
    }
    Array.isArray(e) ? this.root = n(e, 0, null) : r(e), this.toJSON = function(o) {
      o || (o = this.root);
      var l = new Node(o.obj, o.dimension, null);
      return o.left && (l.left = i.toJSON(o.left)), o.right && (l.right = i.toJSON(o.right)), l;
    }, this.insert = function(o) {
      function l(u, p) {
        if (u === null)
          return p;
        var m = s[u.dimension];
        return o[m] < u.obj[m] ? l(u.left, u) : l(u.right, u);
      }
      var c = l(this.root, null), h, d;
      if (c === null) {
        this.root = new Node(o, 0, null);
        return;
      }
      h = new Node(o, (c.dimension + 1) % s.length, c), d = s[c.dimension], o[d] < c.obj[d] ? c.left = h : c.right = h;
    }, this.remove = function(o) {
      var l;
      function c(d) {
        if (d === null)
          return null;
        if (d.obj === o)
          return d;
        var u = s[d.dimension];
        return o[u] < d.obj[u] ? c(d.left) : c(d.right);
      }
      function h(d) {
        var u, p, m;
        function g(y, f) {
          var w, S, E, x, A;
          return y === null ? null : (w = s[f], y.dimension === f ? y.left !== null ? g(y.left, f) : y : (S = y.obj[w], E = g(y.left, f), x = g(y.right, f), A = y, E !== null && E.obj[w] < S && (A = E), x !== null && x.obj[w] < A.obj[w] && (A = x), A));
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
    }, this.nearest = function(o, l, c) {
      var h, d, u;
      u = new BinaryHeap(function(m) {
        return -m[1];
      });
      function p(m) {
        var g, y = s[m.dimension], f = t(o, m.obj), w = {}, S, E, x;
        function A(v, M) {
          u.push([v, M]), u.size() > l && u.pop();
        }
        for (x = 0; x < s.length; x += 1)
          x === m.dimension ? w[s[x]] = o[s[x]] : w[s[x]] = m.obj[s[x]];
        if (S = t(w, m.obj), m.right === null && m.left === null) {
          (u.size() < l || f < u.peek()[1]) && A(m, f);
          return;
        }
        m.right === null ? g = m.left : m.left === null ? g = m.right : o[y] < m.obj[y] ? g = m.left : g = m.right, p(g), (u.size() < l || f < u.peek()[1]) && A(m, f), (u.size() < l || Math.abs(S) < u.peek()[1]) && (g === m.left ? E = m.right : E = m.left, E !== null && p(E));
      }
      if (c)
        for (h = 0; h < l; h += 1)
          u.push([null, c]);
      for (i.root && p(i.root), d = [], h = 0; h < Math.min(l, u.content.length); h += 1)
        u.content[h][0] && d.push([u.content[h][0].obj, u.content[h][1]]);
      return d;
    }, this.balanceFactor = function() {
      function o(c) {
        return c === null ? 0 : Math.max(o(c.left), o(c.right)) + 1;
      }
      function l(c) {
        return c === null ? 0 : l(c.left) + l(c.right) + 1;
      }
      return o(i.root) / (Math.log(l(i.root)) / Math.log(2));
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
      var n = (e + 1) * 2, r = n - 1, o = null;
      if (r < t) {
        var l = this.content[r], c = this.scoreFunction(l);
        c < i && (o = r);
      }
      if (n < t) {
        var h = this.content[n], d = this.scoreFunction(h);
        d < (o == null ? i : c) && (o = n);
      }
      if (o != null)
        this.content[e] = this.content[o], this.content[o] = s, e = o;
      else
        break;
    }
  }
}
const defaultBondRadius = 0.1;
let Setting$6 = class {
  constructor({ specie1: e, specie2: t, min: s = 0, max: i = 3, color1: n = "#3d82ed", color2: r = "#3d82ed", radius: o = defaultBondRadius, order: l = 1, type: c = 0 }) {
    this.specie1 = e, this.specie2 = t, this.min = s, this.max = i, this.color1 = convertColor$1(n), this.color2 = convertColor$1(r), this.radius = o, this.order = l, this.type = c;
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
    const o = this.viewer.atomManager.settings[e].radius, l = this.viewer.atomManager.settings[s].radius;
    let c = 0, h = (o + l) * 1.1;
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
  addSetting({ specie1: e, specie2: t, radius: s, min: i = 0, max: n = 3, color1: r = "#3d82ed", color2: o = "#3d82ed", order: l = 1, type: c = 0 }) {
    const h = new Setting$6({ specie1: e, specie2: t, radius: s, min: i, max: n, color1: r, color2: o, order: l, type: c }), d = e + "-" + t;
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
    }), { bondMesh: r, bondCap: o } = drawStick({
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
    return this.meshes = { stickBondMesh: n, stickCapBondMesh: r, stickCapBondCap: o, dashedBondLine: l, solidBondLine: c }, Object.values(this.meshes).forEach((h) => {
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
      const o = this.bondMap.bondMap[e];
      o && o[n].forEach((l) => {
        r.push(l[0]);
      });
    } else
      r = this.bondMap[n].map((o, l) => l);
    r.forEach((o) => {
      const l = this.bondList[this.bondMap[n][o]], c = l[0], h = l[1], d = l[2], u = l[3];
      let p = t.positions[c].map((v, M) => v + calculateCartesianCoordinates(t.cell, d)[M]), m = t.positions[h].map((v, M) => v + calculateCartesianCoordinates(t.cell, u)[M]);
      p = new THREE.Vector3(...p), m = new THREE.Vector3(...m);
      const g = new THREE.Vector3().lerpVectors(p, m, 0.25), y = t.symbols[c] + "-" + t.symbols[h];
      if (!this.viewer.cutoffs[y])
        return;
      const f = this.viewer.cutoffs[y].max, w = calculateQuaternion(p, m), S = calculateScale(p, m, this.bondRadius, f, this.hideLongBonds), E = new THREE.Matrix4().compose(g, w, S);
      s.setMatrixAt(o * 2, E);
      const x = new THREE.Vector3().lerpVectors(p, m, 0.75), A = new THREE.Matrix4().compose(x, w, S);
      if (s.setMatrixAt(o * 2 + 1, A), i) {
        const v = new THREE.Vector3(this.bondRadius, this.bondRadius, this.bondRadius), M = new THREE.Matrix4().compose(p, new THREE.Quaternion(), v);
        i.setMatrixAt(o * 2, M);
        const T = new THREE.Matrix4().compose(m, new THREE.Quaternion(), v);
        i.setMatrixAt(o * 2 + 1, T);
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
    const r = s.geometry.attributes.position, o = r.array;
    n.forEach((l) => {
      const c = this.bondList[this.bondMap[i][l]], h = c[0], d = c[1], u = c[2], p = c[3];
      let m = t.positions[h].map((w, S) => w + calculateCartesianCoordinates(t.cell, u)[S]), g = t.positions[d].map((w, S) => w + calculateCartesianCoordinates(t.cell, p)[S]);
      const y = t.symbols[h] + "-" + t.symbols[d];
      if (!this.settings[y])
        return;
      m = new THREE.Vector3(...m), g = new THREE.Vector3(...g);
      const f = m.distanceTo(g);
      f > this.settings[y].max | f < this.settings[y].min && g.copy(m), o[l * 6] = m.x, o[l * 6 + 1] = m.y, o[l * 6 + 2] = m.z, o[l * 6 + 3] = g.x, o[l * 6 + 4] = g.y, o[l * 6 + 5] = g.z;
    }), r.needsUpdate = !0, s.geometry.computeBoundingBox(), s.geometry.computeBoundingSphere();
  }
}
function drawStick({
  atoms: a,
  bondList: e,
  bondIndices: t,
  settings: s,
  radius: i = 0.1,
  materialType: n = "Standard",
  atomColors: r = null,
  withCap: o = !1,
  logger: l = console,
  shapeRegistry: c
}) {
  const d = [
    [1e4, 6],
    [2e3, 12],
    [500, 18],
    [100, 24]
  ].find(([C]) => t.length > C)?.[1] ?? 24, u = c.create("Cylinder", {
    materialType: n,
    segments: d
  }), p = o ? c.create("Sphere", { materialType: n }) : null;
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
  ), S = o ? new THREE.InstancedMesh(g, y, t.length * 2) : null, E = new THREE.Vector3(), x = new THREE.Vector3(), A = new THREE.Vector3(), v = new THREE.Vector3(), M = new THREE.Matrix4();
  for (let C = 0; C < t.length; C++) {
    const [P, B, j, _] = e[t[C]], L = a.positions[P].map((H, I) => H + calculateCartesianCoordinates(a.cell, j)[I]);
    E.set(...L);
    const N = a.positions[B].map((H, I) => H + calculateCartesianCoordinates(a.cell, _)[I]);
    x.set(...N);
    const W = a.symbols[P] + "-" + a.symbols[B], Y = r ? r[P] : s[W].color1, Q = r ? r[B] : s[W].color2;
    A.lerpVectors(E, x, 0.25), v.lerpVectors(E, x, 0.75);
    const $ = calculateQuaternion(E, x), q = calculateScale(E, x, i);
    if (M.compose(A, $, q), w.setMatrixAt(C * 2, M), w.setColorAt(C * 2, Y), M.compose(v, $, q), w.setMatrixAt(C * 2 + 1, M), w.setColorAt(C * 2 + 1, Q), o) {
      const H = new THREE.Vector3(i, i, i), I = new THREE.Matrix4().compose(E, new THREE.Quaternion(), H);
      S.setMatrixAt(C * 2, I), S.setColorAt(C * 2, Y);
      const Z = new THREE.Matrix4().compose(x, new THREE.Quaternion(), H);
      S.setMatrixAt(C * 2 + 1, Z), S.setColorAt(C * 2 + 1, Q);
    }
  }
  w.userData.type = "bond", w.userData.uuid = a.uuid, w.userData.objectMode = "edit", S && (S.userData.type = "bond", S.userData.uuid = a.uuid, S.userData.objectMode = "edit");
  const T = performance.now();
  return l.debug("drawStick Time: ", T - f), o ? { bondMesh: w, bondCap: S } : w;
}
function drawLine(a, e, t, s, i = "dashed", n = null) {
  if (t === void 0 || t.length === 0)
    return null;
  const r = [], o = [];
  t.forEach((d) => {
    const u = e[d], [p, m, g, y] = u;
    var f = a.positions[p].map((A, v) => A + calculateCartesianCoordinates(a.cell, g)[v]);
    f = new THREE.Vector3(...f);
    var w = a.positions[m].map((A, v) => A + calculateCartesianCoordinates(a.cell, y)[v]);
    w = new THREE.Vector3(...w), r.push(f.x, f.y, f.z), r.push(w.x, w.y, w.z);
    const S = a.symbols[p] + "-" + a.symbols[m], E = s[S].color1, x = s[S].color2;
    o.push(E.r, E.g, E.b), o.push(x.r, x.g, x.b);
  });
  const l = new THREE.BufferGeometry();
  l.setAttribute("position", new THREE.Float32BufferAttribute(r, 3)), l.setAttribute("color", new THREE.Float32BufferAttribute(o, 3));
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
  return h.computeLineDistances(), h.userData.type = "bond", h.userData.uuid = a.uuid, h.userData.objectMode = "edit", h;
}
function calculateScale(a, e, t, s = null, i = !0) {
  const n = a.distanceTo(e);
  return i && s !== null && n > s && (t = 0), new THREE.Vector3(t, n / 2, t);
}
function searchBondedAtoms(a, e, t, s) {
  let i = [], n = [];
  return e.forEach((r) => {
    const o = r[0];
    if (s[o] === 0 || !elementsWithPolyhedra.includes(a[o]))
      return;
    const l = r[1], c = t.map[o];
    c !== void 0 && c.forEach((h) => {
      const d = h[0], u = h[1];
      if (s[d] === 0)
        return;
      const p = [l[0] + u[0], l[1] + u[1], l[2] + u[2]];
      if (p[0] != 0 || p[1] != 0 || p[2] != 0) {
        const m = [d, p];
        i.push(m), n.push([o, d, l, p]), n.push([d, o, p, l]);
      }
    });
  }), { atoms: i, bonds: n };
}
function buildBonds(a, e, t, s, i, n = !1, r = console) {
  const o = performance.now(), l = [];
  if (a.isUndefinedCell())
    for (let h = 0; h < e.length; h++) {
      const d = e[h][0], u = e[h][1], p = t[d];
      if (!(i[d] === 0 | p === void 0))
        for (let m = 0; m < p.length; m++) {
          const g = p[m][0];
          if (i[g] === 0)
            continue;
          const y = p[m][1], f = u.map((w, S) => w + y[S]);
          l.push([d, g, u, f]);
        }
    }
  else {
    const h = a.calculateFractionalCoordinates();
    for (let d = 0; d < e.length; d++) {
      const u = e[d][0], p = e[d][1], m = t[u];
      if (!(i[u] === 0 | m === void 0))
        for (let g = 0; g < m.length; g++) {
          const y = m[g][0];
          if (i[y] === 0)
            continue;
          const f = m[g][1], w = p.map((E, x) => E + f[x]), S = h[y].map((E, x) => E + w[x]);
          if (n) {
            l.push([u, y, p, w]);
            continue;
          } else s[0][0] <= S[0] && S[0] <= s[0][1] && s[1][0] <= S[1] && S[1] <= s[1][1] && s[2][0] <= S[2] && S[2] <= s[2][1] && l.push([u, y, p, w]);
        }
    }
  }
  const c = performance.now();
  return r.debug("buildBonds Time: ", c - o), l;
}
function buildBondMap(a, e, t, s) {
  const i = {}, n = {}, r = [], o = [], l = [], c = [], h = [];
  for (let d = 0; d < a.length; d++) {
    const u = a[d], [p, m] = u;
    i[p] || (i[p] = { atomIndex: p, sticks: [], stickCaps: [], dashedLines: [], solidLines: [], springs: [] }), i[m] || (i[m] = { atomIndex: m, sticks: [], stickCaps: [], dashedLines: [], solidLines: [], springs: [] });
    const g = p + "-" + u[2].join("-");
    n[g] || (n[g] = { atomIndex: p, offset: u[2], sticks: [], stickCaps: [], dashedLines: [], solidLines: [], springs: [] });
    const y = m + "-" + u[3].join("-");
    n[y] || (n[y] = { atomIndex: m, offset: u[3], sticks: [], stickCaps: [], dashedLines: [], solidLines: [], springs: [] });
    const f = e.symbols[p] + "-" + e.symbols[m];
    let w;
    s[p] <= 2 ? w = t[f].type : w = s[p], w === 0 ? (r.push(d), i[p].sticks.push([r.length - 1, !0]), i[m].sticks.push([r.length - 1, !1]), n[g].sticks.push([r.length - 1, !0]), n[y].sticks.push([r.length - 1, !1])) : w === 1 ? (l.push(d), i[p].dashedLines.push([l.length - 1, !0]), i[m].dashedLines.push([l.length - 1, !1]), n[g].dashedLines.push([l.length - 1, !0]), n[y].dashedLines.push([l.length - 1, !1])) : w === 2 ? (h.push(d), i[p].springs.push([h.length - 1, !0]), i[m].springs.push([h.length - 1, !1]), n[g].springs.push([h.length - 1, !0]), n[y].springs.push([h.length - 1, !1])) : w === 3 ? (o.push(d), i[p].stickCaps.push([o.length - 1, !0]), i[m].stickCaps.push([o.length - 1, !1]), n[g].stickCaps.push([o.length - 1, !0]), n[y].stickCaps.push([o.length - 1, !1])) : w === 4 && (c.push(d), i[p].solidLines.push([c.length - 1, !0]), i[m].solidLines.push([c.length - 1, !1]), n[g].solidLines.push([c.length - 1, !0]), n[y].solidLines.push([c.length - 1, !1]));
  }
  return { bondMap: i, bondMapWithOffset: n, sticks: r, stickCaps: o, dashedLines: l, solidLines: c, springs: h };
}
function findNeighbors(a, e, t = !1, s = !0, i = console) {
  const n = performance.now();
  let r = a.positions.map((y, f) => [f, [0, 0, 0]]), o;
  const l = Math.max(...Object.values(e).map((y) => y.max));
  if (s) {
    const y = a.getCellLengthsAndAngles(), f = [
      [-l / y[0], 1 + l / y[0]],
      [-l / y[1], 1 + l / y[1]],
      [-l / y[2], 1 + l / y[2]]
    ];
    o = searchBoundary(a, f);
  }
  r = r.concat(o);
  const c = [], h = {};
  var d = function(y, f) {
    return Math.pow(y.x - f.x, 2) + Math.pow(y.y - f.y, 2) + Math.pow(y.z - f.z, 2);
  };
  const u = r.map((y) => {
    const f = a.positions[y[0]], w = calculateCartesianCoordinates(a.cell, y[1]);
    return [f[0] + w[0], f[1] + w[1], f[2] + w[2]];
  }), p = u.map((y, f) => ({
    x: y[0],
    y: y[1],
    z: y[2],
    index: f
  })), m = new kdTree(p, d, ["x", "y", "z"]);
  r.forEach(([y, f], w) => {
    const S = a.symbols[y], E = u[w], x = { x: u[w][0], y: u[w][1], z: u[w][2] };
    m.nearest(x, 24, l ** 2).forEach((v) => {
      const M = v[0].index;
      if (w == M) return;
      const T = r[M][1];
      if (f.some((_) => _ !== 0) && T.some((_) => _ !== 0))
        return;
      const C = r[M][0];
      if (!t && y == C) return;
      const P = S + "-" + a.symbols[C];
      if (!e[P]) return;
      const B = u[M], j = calculateDistance(E, B);
      if (j < e[P].max && j > e[P].min) {
        const _ = T.map((L, N) => L - f[N]);
        c.push([y, C, _]), h[y] ? h[y].some(([L, N]) => L === C && N.every((W, Y) => W === _[Y])) || h[y].push([C, _]) : h[y] = [[C, _]];
      }
    });
  });
  const g = performance.now();
  return i.info(`findNeighbors completed in ${(g - n).toFixed(2)} ms`), { list: c, map: h };
}
function calculateDistance(a, e) {
  return Math.sqrt(Math.pow(a[0] - e[0], 2) + Math.pow(a[1] - e[1], 2) + Math.pow(a[2] - e[2], 2));
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
          for (let r = 0, o = n.count; r < o; r++) {
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
    for (let r = 0, o = s.length; r < o; r++) {
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
          const o = e[r];
          if (o.mark === Visible) {
            const l = o.distanceToPoint(t.point);
            if (l > i && (i = l, n = o), i > 1e3 * this.tolerance) break;
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
      const o = this.vertices[n], l = o.point;
      for (let c = 0; c < 3; c++)
        l.getComponent(c) < e.getComponent(c) && (e.setComponent(c, l.getComponent(c)), s[c] = o);
      for (let c = 0; c < 3; c++)
        l.getComponent(c) > t.getComponent(c) && (t.setComponent(c, l.getComponent(c)), i[c] = o);
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
    const o = s[r], l = i[r];
    let c, h;
    n = 0, _line3.set(o.point, l.point);
    for (let u = 0, p = this.vertices.length; u < p; u++) {
      const m = e[u];
      if (m !== o && m !== l) {
        _line3.closestPointToPoint(m.point, !0, _closestPoint);
        const g = _closestPoint.distanceToSquared(m.point);
        g > n && (n = g, c = m);
      }
    }
    n = -1, _plane.setFromCoplanarPoints(o.point, l.point, c.point);
    for (let u = 0, p = this.vertices.length; u < p; u++) {
      const m = e[u];
      if (m !== o && m !== l && m !== c) {
        const g = Math.abs(_plane.distanceToPoint(m.point));
        g > n && (n = g, h = m);
      }
    }
    const d = [];
    if (_plane.distanceToPoint(h.point) < 0) {
      d.push(
        Face.create(o, l, c),
        Face.create(h, l, o),
        Face.create(h, c, l),
        Face.create(h, o, c)
      );
      for (let u = 0; u < 3; u++) {
        const p = (u + 1) % 3;
        d[u + 1].getEdge(2).setTwin(d[0].getEdge(p)), d[u + 1].getEdge(1).setTwin(d[p + 1].getEdge(0));
      }
    } else {
      d.push(
        Face.create(o, c, l),
        Face.create(h, o, l),
        Face.create(h, l, c),
        Face.create(h, c, o)
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
      if (m !== o && m !== l && m !== c && m !== h) {
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
      const r = n.twin, o = r.face;
      o.mark === Visible && (o.distanceToPoint(e) > this.tolerance ? this.computeHorizon(e, r, o, i) : i.push(n)), n = n.next;
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
      const r = t[n], o = this.addAdjoiningFace(e, r);
      s === null ? s = o : o.next.setTwin(i), this.newFaces.push(o.face), i = o;
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
    const i = new Face(), n = new HalfEdge(e, i), r = new HalfEdge(t, i), o = new HalfEdge(s, i);
    return n.next = o.prev = r, r.next = n.prev = o, o.next = r.prev = n, i.edge = n, i.compute();
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
    const r = [], o = [], l = [], c = {};
    for (const u of Object.keys(t)) {
      const p = t[u], m = [];
      let g;
      for (const y of p.sticks) {
        const f = s[y[0]];
        if (y[1])
          var h = f[1], d = f[3];
        else
          var h = f[0], d = f[2];
        g = e.positions[h].map((S, E) => S + calculateCartesianCoordinates(e.cell, d)[E]);
        const w = new THREE.Vector3(...g);
        w.atomIndex = h, w.offset = d, m.push(w);
      }
      if (m.length < 4) {
        console.warn(`Skipping polyhedron with key "${u}" due to insufficient vertices.`);
        continue;
      }
      try {
        const { hull: y, vertices: f, normals: w, indices: S, offsets: E } = calculateConvexHull(m);
        r.push(...f), o.push(...w);
        const x = e.symbols[p.atomIndex], A = elementColors[i][x] || defaultColor, v = new THREE.Color(A);
        for (let M = 0; M < f.length / 3; M++)
          l.push(v.r, v.g, v.b);
        S.forEach((M, T) => {
          const C = S[T], P = E[T];
          c[C] === void 0 && (c[C] = []), c[C].push([r.length / 3 - f.length / 3 + T, P]);
        });
      } catch (y) {
        console.warn(`Skipping polyhedron with key "${u}" due to ConvexGeometry error:`, y);
        continue;
      }
    }
    this.allVertices = r, this.allNormals = o, this.allColors = l, this.vertexAtomMap = c;
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
      n !== void 0 && n.forEach(([r, o]) => {
        const l = t.positions[i].map((c, h) => c + calculateCartesianCoordinates(t.cell, o)[h]);
        this.allVertices[r * 3] = l[0], this.allVertices[r * 3 + 1] = l[1], this.allVertices[r * 3 + 2] = l[2];
      });
    }), this.mesh.geometry.setAttribute("position", new THREE.Float32BufferAttribute(this.allVertices, 3)), this.mesh.geometry.attributes.position.needsUpdate = !0, this.mesh.geometry.computeVertexNormals();
  }
}
function filterBondMap(a, e, t, s) {
  const i = {};
  return Object.keys(a).forEach((n) => {
    const r = a[n].atomIndex, o = a[n].sticks.length, l = e[r];
    s[r] && o >= 4 && t.includes(l) && (i[n] = a[n]);
  }), i;
}
function calculateConvexHull(a) {
  for (var r = [], e = [], t = [], s = [], i = [], n = new ConvexHull().setFromPoints(a), r = n.faces, o = 0; o < r.length; o++) {
    var l = r[o], c = l.edge;
    do {
      var h = c.head().point;
      e.push(h.x, h.y, h.z), s.push(h.atomIndex), i.push(h.offset), t.push(l.normal.x, l.normal.y, l.normal.z), c = c.next;
    } while (c !== l.edge);
  }
  return { hull: n, vertices: e, normals: t, indices: s, offsets: i };
}
let Setting$4 = class {
  constructor({ origins: e = [], texts: t = [], selection: s = null, color: i = "#000000ff", fontSize: n = 0.05, className: r = "atom-label", renderMode: o = "glyph", shift: l = !1 }) {
    this.origins = e, this.texts = t, this.selection = s, this.color = i, this.fontSize = n, this.className = r, this.renderMode = o, this.shift = l;
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
  addSetting({ origins: e, texts: t, selection: s = null, color: i = "#000000ff", fontSize: n = 0.05, className: r = "atom-label", renderMode: o = "glyph", shift: l = [0, 0, 0] }) {
    if (typeof e == "string" && !this.viewer.atoms.getAttribute(e))
      throw new Error(`Attribute '${e}' is not defined. The available attributes are: ${Object.keys(this.viewer.atoms.attributes.atom)}`);
    const c = new Setting$4({ origins: e, texts: t, selection: s, color: i, fontSize: n, className: r, renderMode: o, shift: l });
    this.settings.push(c);
  }
  addOverlaySetting({ origins: e, texts: t, selection: s = null, color: i = "#000000ff", fontSize: n = 0.05, className: r = "atom-label", shift: o = [0, 0, 0] }) {
    const l = new Setting$4({ origins: e, texts: t, selection: s, color: i, fontSize: n, className: r, shift: o });
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
      const o = drawAtomLabels(t, s, e.fontSize, e.color, n, r, e.className, e.renderMode);
      for (let l = 0; l < o.length; l++)
        this.scene.add(o[l]);
      this.labels.push(...o);
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
      const o = r.element;
      if (!o)
        return;
      if (o.dataset?.cross === "true" && i) {
        const p = r.userData?.atomIndex, m = this.getAtomRadius(p);
        if (m) {
          const g = i.getSize(new THREE.Vector2()), y = new THREE.Vector3(), f = new THREE.Vector3(), w = new THREE.Vector3();
          s.matrixWorld.extractBasis(y, f, w);
          const S = this.viewer.atoms.positions[p];
          if (S) {
            const E = new THREE.Vector3(...S), x = E.clone().add(y.clone().multiplyScalar(m)), A = E.project(s), v = x.project(s), M = (v.x - A.x) * g.x * 0.5, T = (v.y - A.y) * g.y * 0.5, C = Math.sqrt(M * M + T * T), P = Math.max(1, Math.round(C * 2));
            o.style.setProperty("--cross-size", `${P}px`), o.style.fontSize = `${P}px`;
            return;
          }
        }
      }
      let c = r.userData?.baseFontPx, h = r.userData?.baseDistance, d = r.userData?.baseZoom;
      if (!r.element || !c || !h) {
        if (r.getWorldPosition(n), h = s.position.distanceTo(n), !c) {
          const p = parseFloat(o.style.fontSize || window.getComputedStyle(o).fontSize || "14px");
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
function clearLabels(a, e) {
  e.forEach((t) => {
    a.remove(t), t.remove();
  });
}
function drawAtomLabels(a, e, t, s, i = [], n, r = "atom-label", o = "glyph") {
  const l = [], c = normalizeFontSize(t), h = getBaseFontPx(c);
  for (let d = 0; d < a.length; d++) {
    const u = new THREE.Vector3(...a[d]), p = e[d], m = n(u, p, s, c, r, o), g = m && m.label ? m.label : m;
    g.userData.baseFontPx = h, g.userData.atomIndex = Array.isArray(i) ? i[d] : null, l.push(g);
  }
  return l;
}
function normalizeFontSize(a) {
  return typeof a == "number" ? a <= 1 ? "14px" : `${a}px` : typeof a == "string" && a.trim() !== "" ? a : "14px";
}
function getBaseFontPx(a) {
  const e = parseFloat(a);
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
function wrapIndex(a, e) {
  const t = a % e;
  return t < 0 ? t + e : t;
}
function clipTrianglesAgainstPlane(a, e, t, s, i) {
  if (!Array.isArray(e) || e.length === 0)
    return { positions: a, faces: e };
  const n = a.map((m) => [m[0], m[1], m[2]]), r = [], o = t[0], l = t[1], c = t[2], h = s[0], d = s[1], u = s[2], p = (m) => o * (m[0] - h) + l * (m[1] - d) + c * (m[2] - u);
  for (let m = 0; m < e.length; m += 3) {
    const g = e[m], y = e[m + 1], f = e[m + 2], w = [n[g], n[y], n[f]], S = p(w[0]), E = p(w[1]), x = p(w[2]), A = [S <= i, E <= i, x <= i];
    if (A[0] && A[1] && A[2]) {
      r.push(g, y, f);
      continue;
    }
    if (!A[0] && !A[1] && !A[2])
      continue;
    const v = w, M = [S, E, x], T = [];
    for (let P = 0; P < 3; P++) {
      const B = v[P], j = M[P], _ = v[(P + 1) % 3], L = M[(P + 1) % 3], N = j <= i, W = L <= i;
      if (N && T.push(B), N !== W) {
        const Y = j / (j - L);
        T.push([B[0] + Y * (_[0] - B[0]), B[1] + Y * (_[1] - B[1]), B[2] + Y * (_[2] - B[2])]);
      }
    }
    if (T.length < 3) continue;
    const C = n.length;
    for (let P = 0; P < T.length; P++)
      n.push(T[P]);
    for (let P = 1; P < T.length - 1; P++)
      r.push(C, C + P, C + P + 1);
  }
  return { positions: n, faces: r };
}
function clipMeshToPlanes(a, e, t, s = 1e-10) {
  if (!Array.isArray(t) || t.length === 0)
    return { positions: a, faces: e };
  let i = a, n = e;
  for (let r = 0; r < t.length; r++) {
    const o = t[r];
    if (!o || !o.normal || !o.point) continue;
    const l = clipTrianglesAgainstPlane(i, n, o.normal, o.point, s);
    if (i = l.positions, n = l.faces, !n.length) break;
  }
  return { positions: i, faces: n };
}
function marchingCubes(a, e, t, s, i = 1, n = null) {
  let r = n || {};
  typeof i == "object" && i !== null && (r = i, i = 1);
  const o = !!r.periodic, l = r.generateBoundaryMaterials !== !1 && !o;
  t || (t = [[0, 0, 0], a]);
  const c = [0, 0, 0], h = [0, 0, 0];
  for (let x = 0; x < 3; ++x)
    c[x] = (t[1][x] - t[0][x]) / a[x], h[x] = t[0][x];
  const d = [], u = [], p = [], m = new Array(8), g = new Array(12), y = [0, 0, 0], f = [], w = /* @__PURE__ */ new Map(), S = s - Math.sign(s || 1) * Number.MAX_VALUE;
  function E(x, A, v) {
    if (o) {
      const M = wrapIndex(x, a[0]), T = wrapIndex(A, a[1]), C = wrapIndex(v, a[2]), P = (M * a[1] + T) * a[2] + C;
      return e[P];
    }
    if (x >= 0 && x < a[0] && A >= 0 && A < a[1] && v >= 0 && v < a[2]) {
      const M = (x * a[1] + A) * a[2] + v;
      return e[M];
    } else
      return S;
  }
  for (y[0] = -i; y[0] < a[0] + i; y[0] += i)
    for (y[1] = -i; y[1] < a[1] + i; y[1] += i)
      for (y[2] = -i; y[2] < a[2] + i; y[2] += i) {
        let x = 0;
        for (let M = 0; M < 8; ++M) {
          const T = cubeVerts[M], C = y[0] + T[0] * i, P = y[1] + T[1] * i, B = y[2] + T[2] * i, j = E(C, P, B);
          m[M] = j, x |= j > s ? 1 << M : 0;
        }
        const A = edgeTable[x];
        if (A === 0) continue;
        for (let M = 0; M < 12; ++M) {
          if ((A & 1 << M) === 0) continue;
          const T = `${y[0]}_${y[1]}_${y[2]}_${M}`;
          if (w.has(T)) {
            g[M] = w.get(T).index;
            continue;
          }
          g[M] = d.length;
          const C = [0, 0, 0], P = edgeIndex[M], B = cubeVerts[P[0]], j = cubeVerts[P[1]], _ = m[P[0]], L = m[P[1]], N = L - _, Y = 1e-12 * Math.max(1, Math.abs(_), Math.abs(L), Math.abs(s)), Q = Math.abs(N) > Y ? (s - _) / N : 0.5, $ = [0, 0, 0];
          let q = !1;
          for (let H = 0; H < 3; ++H)
            $[H] = y[H] + B[H] * i + Q * (j[H] - B[H]) * i, l && ($[H] <= 0 && ($[H] = 0, q = !0), $[H] >= a[H] - 1 && ($[H] = a[H] - 1, q = !0)), C[H] = c[H] * $[H] + h[H];
          d.push(C), f.push(q), w.set(T, { index: g[M], onBoundary: q });
        }
        const v = triTable[x];
        for (let M = 0; M < v.length; M += 3) {
          const T = g[v[M]], C = g[v[M + 1]], P = g[v[M + 2]];
          if (u.push(T, C, P), l) {
            const B = f[T] && f[C] && f[P];
            p.push(B ? 1 : 0);
          }
        }
      }
  return { positions: d, cells: u, faceMaterials: l ? p : [] };
}
function normalizeHexColor(a) {
  return "#" + (a instanceof THREE.Color ? a : new THREE.Color(a)).getHexString();
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
    const { minValue: o, maxValue: l } = this.getIsovalueRange();
    t === null && (t = (o + l) / 2);
    const c = new Setting$3({ isovalue: t, color: s, mode: i, step_size: n, opacity: r });
    e === void 0 && (e = "iso-" + Object.keys(this.settings).length), this.settings[e] = c, this.createGui();
    const h = this.guiFolder.addFolder(e);
    h.add(c, "isovalue", o, l).name("Level").onFinishChange(this.drawIsosurfaces.bind(this)), h.addColor(c, "color").name("Color").onFinishChange(this.drawIsosurfaces.bind(this)), h.add(c, "opacity", 0, 1, 0.01).name("Opacity").onFinishChange(this.drawIsosurfaces.bind(this));
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
    ], o = [];
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
        p.positions = p.positions.map(function(v) {
          var M = v[0] * r[0][0] + v[1] * r[1][0] + v[2] * r[2][0] + n[0], T = v[0] * r[0][1] + v[1] * r[1][1] + v[2] * r[2][1] + n[1], C = v[0] * r[0][2] + v[1] * r[1][2] + v[2] * r[2][2] + n[2];
          return [M, T, C];
        });
        const y = p.positions.reduce((v, M) => (v.push(M[0], M[1], M[2]), v), []), f = Array.isArray(p.cells) ? p.cells : Array.from(p.cells || []), w = Array.isArray(p.faceMaterials) ? p.faceMaterials : [], S = splitFacesByMaterial(f, w), E = `${l}-${m}`, x = c.opacity ?? 0.8, A = S[0].length ? S[0] : f;
        o.push({
          name: `${E}`,
          vertices: y,
          faces: A,
          color: d[m],
          opacity: x,
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
        }), S[1].length && o.push({
          name: `${E}-cap`,
          vertices: y,
          faces: S[1],
          color: "#c2f542",
          opacity: x,
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
        }), this.meshes[E] = E;
      }
    }), this.updateAnyMeshSettings(o);
  }
  updateAnyMeshSettings(e) {
    const t = this.viewer?.weas?.anyMesh;
    if (!t || typeof t.setSettings != "function")
      return;
    const i = (Array.isArray(t.settings) ? t.settings : []).filter((n) => n?.userData?.source !== "isosurface");
    t.setSettings([...i, ...e]);
  }
}
function splitFacesByMaterial(a, e) {
  const t = [[], []];
  if (!Array.isArray(a) || a.length === 0)
    return t;
  if (!Array.isArray(e) || e.length === 0)
    return t[0] = a.slice(), t;
  for (let s = 0; s < a.length; s += 3) {
    const i = e[s / 3] === 1 ? 1 : 0;
    t[i].push(a[s], a[s + 1], a[s + 2]);
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
    clipPlanes: o = null,
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
    this.isovalue = e, this.color = t, this.step_size = s, this.opacity = Math.min(1, Math.max(0, i ?? 0.6)), this.periodic = !!n, this.clipToBZ = !!r, this.clipPlanes = Array.isArray(o) ? o : null, this.clipEps = typeof l == "number" ? l : 1e-10, this.datasets = Array.isArray(c) ? c : null, this.dataset = typeof h == "string" ? h : null, this.materialType = d || "Standard", this.mergeVerticesTolerance = u, this.smoothNormals = p, this.wrapFractional = m !== !1, this.tile = typeof g == "number" ? g : 1, this.bzCropMargin = Math.max(0, Math.floor(typeof y == "number" ? y : 1));
  }
}
function normalizeColor(a) {
  if (Array.isArray(a)) {
    const e = Math.max(0, Math.min(1, a[0] ?? 0)), t = Math.max(0, Math.min(1, a[1] ?? 0)), s = Math.max(0, Math.min(1, a[2] ?? 0)), i = (n) => Math.round(n * 255).toString(16).padStart(2, "0");
    return `#${i(e)}${i(t)}${i(s)}`;
  }
  return a;
}
function normalizeDatasets(a) {
  if (!a) return null;
  if (Array.isArray(a.datasets)) {
    const e = /* @__PURE__ */ new Map();
    return a.datasets.forEach((t, s) => {
      if (!t) return;
      const i = typeof t.name == "string" ? t.name : `dataset-${s}`;
      e.set(i, t);
    }), { map: e, meta: a };
  }
  if (Array.isArray(a.dims) && Array.isArray(a.values)) {
    const e = /* @__PURE__ */ new Map();
    return e.set("default", a), { map: e, meta: a };
  }
  return null;
}
function tileVolume(a, e, t) {
  const s = e[0], i = e[1], n = e[2], r = s * t, o = i * t, l = n * t, c = new Array(r * o * l);
  for (let h = 0; h < r; h++) {
    const d = h % s;
    for (let u = 0; u < o; u++) {
      const p = u % i;
      for (let m = 0; m < l; m++) {
        const g = m % n, y = (d * i + p) * n + g, f = (h * o + u) * l + m;
        c[f] = a[y];
      }
    }
  }
  return c;
}
function invert3x3(a) {
  const e = a[0][0], t = a[0][1], s = a[0][2], i = a[1][0], n = a[1][1], r = a[1][2], o = a[2][0], l = a[2][1], c = a[2][2], h = c * n - r * l, d = -c * i + r * o, u = l * i - n * o;
  let p = e * h + t * d + s * u;
  return p ? (p = 1 / p, [
    [h * p, (-c * t + s * l) * p, (r * t - s * n) * p],
    [d * p, (c * e - s * o) * p, (-r * e + s * i) * p],
    [u * p, (-l * e + t * o) * p, (n * e - t * i) * p]
  ]) : null;
}
function mulMatVec(a, e) {
  return [a[0][0] * e[0] + a[0][1] * e[1] + a[0][2] * e[2], a[1][0] * e[0] + a[1][1] * e[1] + a[1][2] * e[2], a[2][0] * e[0] + a[2][1] * e[1] + a[2][2] * e[2]];
}
function clamp(a, e, t) {
  return Math.min(t, Math.max(e, a));
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
        for (let o = 0; o < r.length; o++) {
          const l = r[o];
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
    clipToBZ: o = !0,
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
      clipToBZ: o,
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
    const { minValue: S, maxValue: E } = this.getIsovalueRange();
    (w.isovalue === null || typeof w.isovalue != "number") && (w.isovalue = (S + E) / 2);
    const x = this.guiFolder.addFolder(e);
    x.addColor(w, "color").name("Color").onFinishChange(this.drawFermiSurfaces.bind(this)), x.add(w, "opacity", 0, 1, 0.01).name("Opacity").onFinishChange(this.drawFermiSurfaces.bind(this)), x.add(w, "clipToBZ").name("Clip BZ").onFinishChange(this.drawFermiSurfaces.bind(this)), x.add(w, "step_size", 1, 4, 1).name("Step").onFinishChange(this.drawFermiSurfaces.bind(this));
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
    Object.entries(this.settings).forEach(([r, o]) => {
      const l = o.dataset ? [o.dataset] : Array.isArray(o.datasets) && o.datasets.length ? o.datasets : Array.from(s.keys()), c = [], h = [];
      let d = 0;
      if (l.forEach((p) => {
        const m = s.get(p);
        if (!m) return;
        const g = m.dims, y = m.values;
        if (!Array.isArray(g) || !Array.isArray(y)) return;
        const f = m.cell || e.cell, w = m.origin || e.origin || [0, 0, 0];
        if (!f || f.length !== 3) return;
        const S = g, E = 2, x = [S[0] * E, S[1] * E, S[2] * E], A = `${p}|${y.length}|${E}|${o.clipToBZ ? 1 : 0}|${o.bzCropMargin}|${n}`;
        let v = this.cache.get(A), M, T = [0, 0, 0], C = x;
        if (v)
          M = v.values, T = v.offset, C = v.dims;
        else {
          if (M = tileVolume(y, S, E), o.clipToBZ && e.bzMesh && e.bzMesh.vertices) {
            const H = invert3x3(f);
            if (H) {
              let I = [1 / 0, 1 / 0, 1 / 0], Z = [-1 / 0, -1 / 0, -1 / 0];
              const X = e.bzMesh.vertices;
              for (let V = 0; V < X.length; V += 3) {
                const G = mulMatVec(H, [X[V], X[V + 1], X[V + 2]]);
                for (let U = 0; U < 3; U++)
                  G[U] < I[U] && (I[U] = G[U]), G[U] > Z[U] && (Z[U] = G[U]);
              }
              const J = o.bzCropMargin || 1, F = [0, 0, 0], D = [0, 0, 0];
              for (let V = 0; V < 3; V++) {
                const G = Math.floor((I[V] + E / 2) * S[V]) - J, U = Math.ceil((Z[V] + E / 2) * S[V]) + J;
                F[V] = clamp(G, 0, x[V] - 1), D[V] = clamp(U, 0, x[V] - 1);
              }
              if (T = [F[0], F[1], F[2]], C = [D[0] - F[0] + 1, D[1] - F[1] + 1, D[2] - F[2] + 1], C[0] > 0 && C[1] > 0 && C[2] > 0) {
                const V = new Array(C[0] * C[1] * C[2]);
                for (let G = 0; G < C[0]; G++)
                  for (let U = 0; U < C[1]; U++)
                    for (let se = 0; se < C[2]; se++) {
                      const re = G + T[0], z = U + T[1], te = se + T[2], ae = (re * x[1] + z) * x[2] + te, me = (G * C[1] + U) * C[2] + se;
                      V[me] = M[ae];
                    }
                M = V;
              } else
                T = [0, 0, 0], C = x;
            }
          }
          this.cache.set(A, { values: M, offset: T, dims: C });
        }
        const P = o.isovalue !== null ? o.isovalue : 0, B = marchingCubes(C, M, null, P, o.step_size, { periodic: !1 }), j = Array.isArray(B.cells) ? B.cells : Array.from(B.cells || []);
        let _ = [], L = [];
        if (o.wrapFractional) {
          const H = B.positions.map((I) => [
            (I[0] + T[0]) / S[0] - E / 2,
            (I[1] + T[1]) / S[1] - E / 2,
            (I[2] + T[2]) / S[2] - E / 2
          ]);
          for (let I = 0; I < j.length; I += 3) {
            const Z = j[I], X = j[I + 1], J = j[I + 2], F = H[Z], D = H[X].slice(), V = H[J].slice();
            for (let z = 0; z < 3; z++) {
              let te = D[z] - F[z];
              te > 0.5 ? D[z] -= 1 : te < -0.5 && (D[z] += 1);
              let ae = V[z] - F[z];
              ae > 0.5 ? V[z] -= 1 : ae < -0.5 && (V[z] += 1);
            }
            const G = _.length, U = [
              F[0] * f[0][0] + F[1] * f[1][0] + F[2] * f[2][0] + w[0],
              F[0] * f[0][1] + F[1] * f[1][1] + F[2] * f[2][1] + w[1],
              F[0] * f[0][2] + F[1] * f[1][2] + F[2] * f[2][2] + w[2]
            ], se = [
              D[0] * f[0][0] + D[1] * f[1][0] + D[2] * f[2][0] + w[0],
              D[0] * f[0][1] + D[1] * f[1][1] + D[2] * f[2][1] + w[1],
              D[0] * f[0][2] + D[1] * f[1][2] + D[2] * f[2][2] + w[2]
            ], re = [
              V[0] * f[0][0] + V[1] * f[1][0] + V[2] * f[2][0] + w[0],
              V[0] * f[0][1] + V[1] * f[1][1] + V[2] * f[2][1] + w[1],
              V[0] * f[0][2] + V[1] * f[1][2] + V[2] * f[2][2] + w[2]
            ];
            _.push(U, se, re), L.push(G, G + 1, G + 2);
          }
        } else
          _ = B.positions.map((H) => {
            const I = (H[0] + T[0]) / S[0] - E / 2, Z = (H[1] + T[1]) / S[1] - E / 2, X = (H[2] + T[2]) / S[2] - E / 2, J = I * f[0][0] + Z * f[1][0] + X * f[2][0] + w[0], F = I * f[0][1] + Z * f[1][1] + X * f[2][1] + w[1], D = I * f[0][2] + Z * f[1][2] + X * f[2][2] + w[2];
            return [J, F, D];
          }), L = j;
        const N = Math.max(1, Math.floor(typeof o.tile == "number" ? o.tile : 1)), W = N, Y = N, Q = N;
        let $ = _, q = L;
        if (W > 1 || Y > 1 || Q > 1) {
          $ = [], q = [];
          const H = [], I = -Math.floor(W / 2), Z = -Math.floor(Y / 2), X = -Math.floor(Q / 2);
          for (let F = I; F < I + W; F++)
            for (let D = Z; D < Z + Y; D++)
              for (let V = X; V < X + Q; V++)
                H.push([F, D, V]);
          let J = 0;
          for (let F = 0; F < H.length; F++) {
            const [D, V, G] = H[F], U = D * f[0][0] + V * f[1][0] + G * f[2][0], se = D * f[0][1] + V * f[1][1] + G * f[2][1], re = D * f[0][2] + V * f[1][2] + G * f[2][2];
            for (let z = 0; z < _.length; z++) {
              const te = _[z];
              $.push([te[0] + U, te[1] + se, te[2] + re]);
            }
            for (let z = 0; z < L.length; z += 3)
              q.push(L[z] + J, L[z + 1] + J, L[z + 2] + J);
            J += _.length;
          }
        }
        if (o.clipToBZ) {
          const H = o.clipPlanes || m.bzPlanes || e.bzPlanes || null;
          if (H && H.length && q.length) {
            const I = clipMeshToPlanes($, q, H, o.clipEps);
            _ = I.positions, L = I.faces;
          } else
            _ = $, L = q;
        } else
          _ = $, L = q;
        if (_.length && L.length) {
          for (let H = 0; H < _.length; H++)
            c.push(_[H]);
          for (let H = 0; H < L.length; H += 3)
            h.push(L[H] + d, L[H + 1] + d, L[H + 2] + d);
          d += _.length;
        }
      }), !c.length || !h.length) return;
      const u = c.reduce((p, m) => (p.push(m[0], m[1], m[2]), p), []);
      i.push({
        name: r,
        vertices: u,
        faces: h,
        color: o.color,
        opacity: o.opacity,
        materialType: o.materialType,
        side: "DoubleSide",
        depthWrite: !0,
        depthTest: !0,
        mergeVerticesTolerance: o.mergeVerticesTolerance,
        smoothNormals: o.smoothNormals,
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
    const s = Array.isArray(t.settings) ? t.settings : [], i = s.filter((o) => o?.userData?.source !== "fermiSurface" && o?.userData?.source !== "brillouinZone");
    if (!Array.isArray(e) || e.length === 0) {
      if (!s.some((l) => l?.userData?.source === "fermiSurface" || l?.userData?.source === "brillouinZone"))
        return;
      t.setSettings([...i]);
      return;
    }
    const n = /* @__PURE__ */ new Map();
    s.forEach((o) => {
      o?.name && (o?.userData?.source === "fermiSurface" || o?.userData?.source === "brillouinZone") && n.set(o.name, o);
    });
    const r = e.map((o) => {
      const l = n.get(o.name);
      return l && typeof l.visible == "boolean" ? { ...o, visible: l.visible } : o;
    });
    t.setSettings([...i, ...r]);
  }
}
class SliceSetting {
  constructor({ method: e = "miller", h: t = 0, k: s = 0, l: i = 1, distance: n = 0, selectedAtomIndices: r = [], colorMap: o = "viridis", opacity: l = 1, samplingDistance: c = 0.2 }) {
    this.method = e, this.h = t, this.k = s, this.l = i, this.distance = n, this.selectedAtomIndices = r, this.colorMap = o, this.opacity = l, this.samplingDistance = c;
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
  addSetting(e, { method: t = "miller", h: s = 0, k: i = 0, l: n = 1, distance: r = 0, selectedAtomIndices: o = [], colorMap: l = "viridis", opacity: c = 1, samplingDistance: h = 0.2 }) {
    const d = new SliceSetting({
      method: t,
      h: s,
      k: i,
      l: n,
      distance: r,
      selectedAtomIndices: o,
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
    Object.entries(this.settings).forEach(([r, o]) => {
      let l, c;
      if (o.method === "miller")
        l = computePlaneNormalFromMillerIndices(o.h, o.k, o.l, i), c = l.clone().multiplyScalar(o.distance).add(n);
      else if (o.method === "bestFit") {
        const M = o.selectedAtomIndices.map((C) => new THREE.Vector3(...this.viewer.atoms.positions[C])), T = computeBestFitPlane(M);
        l = T.normal, c = T.point;
      } else {
        this.viewer.logger.error(`Unknown method: ${o.method}`);
        return;
      }
      const h = o.samplingDistance || 0.5, d = extractSliceArbitrary(t, s, i, n, l, c, h);
      if (!d) {
        this.viewer.logger.debug("Slice does not intersect the unit cell sufficiently");
        return;
      }
      const { sliceData: u, width: p, height: m, minX: g, maxX: y, minY: f, maxY: w, projectedPoints: S } = d, E = Math.max(...u.flat()), x = Math.min(...u.flat()), A = createTextureFromSlice(u, x, E, o.colorMap), v = createSlicePlaneArbitrary(S, l, c, A, o.opacity, g, y, f, w);
      v.userData.type = "slice", v.userData.uuid = this.viewer.uuid, v.userData.notSelectable = !0, v.layers.set(1), this.scene.add(v), this.slices[r] = v;
    }), this.viewer.requestRedraw?.("render");
  }
}
function computePlaneNormalFromMillerIndices(a, e, t, s) {
  const i = new THREE.Vector3(...s[0]), n = new THREE.Vector3(...s[1]), r = new THREE.Vector3(...s[2]), o = i.dot(n.clone().cross(r)), l = n.clone().cross(r).multiplyScalar(2 * Math.PI / o), c = r.clone().cross(i).multiplyScalar(2 * Math.PI / o), h = i.clone().cross(n).multiplyScalar(2 * Math.PI / o);
  return l.clone().multiplyScalar(a).add(c.clone().multiplyScalar(e)).add(h.clone().multiplyScalar(t)).normalize();
}
function computeBestFitPlane(a) {
  if (a.length < 3)
    throw new Error("At least three points are required to define a plane.");
  const e = new THREE.Vector3(0, 0, 0);
  a.forEach((m) => {
    e.add(m);
  }), e.divideScalar(a.length);
  let t = 0, s = 0, i = 0, n = 0, r = 0, o = 0;
  a.forEach((m) => {
    const g = m.x - e.x, y = m.y - e.y, f = m.z - e.z;
    t += g * g, s += g * y, i += g * f, n += y * y, r += y * f, o += f * f;
  });
  const l = [
    [t, s, i],
    [s, n, r],
    [i, r, o]
  ], { eigenvalues: c, eigenvectors: h } = computeEigenvaluesAndEigenvectors(l), d = c.findIndex((m) => m === Math.min(...c)), u = h[d];
  return { normal: new THREE.Vector3(...u).normalize(), point: e };
}
function extractSliceArbitrary(a, e, t, s, i, n, r) {
  const o = computePlaneUnitCellIntersections(t, s, i, n);
  if (o.length < 3)
    return null;
  const l = computePlaneBasis(i), c = o.map((x) => {
    const A = x.clone().sub(n), v = A.dot(l.u), M = A.dot(l.v);
    return new THREE.Vector2(v, M);
  }), h = computeConvexHull(c);
  let d = 1 / 0, u = 1 / 0, p = -1 / 0, m = -1 / 0;
  h.forEach((x) => {
    x.x < d && (d = x.x), x.y < u && (u = x.y), x.x > p && (p = x.x), x.y > m && (m = x.y);
  });
  const [g, y, f] = e, w = Math.ceil((p - d) / r) + 1, S = Math.ceil((m - u) / r) + 1, E = [];
  for (let x = 0; x < S; x++) {
    const A = [];
    for (let v = 0; v < w; v++) {
      const M = d + v * r, T = u + x * r, C = new THREE.Vector2(M, T);
      let P = 0;
      if (pointInPolygon(C, h)) {
        const j = n.clone().add(l.u.clone().multiplyScalar(M)).add(l.v.clone().multiplyScalar(T)).clone().sub(s), _ = cellToGridCoordinates(j, t, e);
        P = trilinearInterpolation(a, _, e);
      }
      A.push(P);
    }
    E.push(A);
  }
  return { sliceData: E, width: w, height: S, minX: d, maxX: p, minY: u, maxY: m, projectedPoints: h };
}
function cellToGridCoordinates(a, e, t) {
  const s = new THREE.Vector3(...e[0]), i = new THREE.Vector3(...e[1]), n = new THREE.Vector3(...e[2]), r = new THREE.Matrix3();
  r.set(s.x, i.x, n.x, s.y, i.y, n.y, s.z, i.z, n.z);
  const o = r.clone().invert(), l = a.clone().applyMatrix3(o), c = l.x * t[0], h = l.y * t[1], d = l.z * t[2];
  return { x: c, y: h, z: d };
}
function trilinearInterpolation(a, e, t) {
  const { x: s, y: i, z: n } = e, r = Math.floor(s), o = r + 1, l = Math.floor(i), c = l + 1, h = Math.floor(n), d = h + 1, u = s - r, p = i - l, m = n - h, g = getDataValue(a, r, l, h, t), y = getDataValue(a, o, l, h, t), f = getDataValue(a, r, c, h, t), w = getDataValue(a, r, l, d, t), S = getDataValue(a, o, l, d, t), E = getDataValue(a, r, c, d, t), x = getDataValue(a, o, c, h, t), A = getDataValue(a, o, c, d, t), v = g * (1 - u) + y * u, M = w * (1 - u) + S * u, T = f * (1 - u) + x * u, C = E * (1 - u) + A * u, P = v * (1 - p) + T * p, B = M * (1 - p) + C * p;
  return P * (1 - m) + B * m;
}
function getDataValue(a, e, t, s, i) {
  const [n, r, o] = i;
  if (e < 0 || e >= n || t < 0 || t >= r || s < 0 || s >= o)
    return 0;
  const l = (e * r + t) * o + s;
  return a[l];
}
function createTextureFromSlice(a, e, t, s) {
  const i = a[0].length, n = a.length, r = new Uint8Array(i * n * 4), o = getColorMapFunction(s);
  let l = 0;
  for (let h = 0; h < n; h++)
    for (let d = 0; d < i; d++) {
      const p = (a[h][d] - e) / (t - e), [m, g, y] = o(p);
      r[l++] = m * 255, r[l++] = g * 255, r[l++] = y * 255, r[l++] = 255;
    }
  const c = new THREE.DataTexture(r, i, n, THREE.RGBAFormat);
  return c.needsUpdate = !0, c.minFilter = THREE.LinearFilter, c.magFilter = THREE.LinearFilter, c;
}
function createSlicePlaneArbitrary(a, e, t, s, i, n, r, o, l) {
  const c = computePlaneBasis(e), h = new THREE.Shape(a), d = new THREE.ShapeGeometry(h);
  d.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(d.attributes.position.count * 2), 2));
  for (let w = 0; w < d.attributes.position.count; w++) {
    const S = d.attributes.position.getX(w), E = d.attributes.position.getY(w), x = (S - n) / (r - n), A = (E - o) / (l - o);
    d.attributes.uv.setXY(w, x, A);
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
function getColorMapFunction(a) {
  return a === "grayscale" ? function(e) {
    return [e, e, e];
  } : a === "viridis" ? function(e) {
    return e = Math.max(0, Math.min(1, e)), viridisColorMap(e);
  } : function(e) {
    return [e, e, e];
  };
}
function viridisColorMap(a) {
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
  ], t = e.length - 1, s = Math.floor(a * t), i = a * t - s, n = e[s], r = e[Math.min(s + 1, t)];
  return [n[0] + (r[0] - n[0]) * i, n[1] + (r[1] - n[1]) * i, n[2] + (r[2] - n[2]) * i];
}
function getUnitCellVertices(a, e) {
  const t = new THREE.Vector3(...a[0]), s = new THREE.Vector3(...a[1]), i = new THREE.Vector3(...a[2]), n = e.clone(), r = e.clone().add(t), o = e.clone().add(s), l = e.clone().add(i), c = e.clone().add(t).add(s), h = e.clone().add(t).add(i), d = e.clone().add(s).add(i), u = e.clone().add(t).add(s).add(i);
  return [n, r, o, l, c, h, d, u];
}
function getUnitCellEdges(a) {
  const [e, t, s, i, n, r, o, l] = a;
  return [
    [e, t],
    [e, s],
    [e, i],
    [t, n],
    [t, r],
    [s, n],
    [s, o],
    [i, r],
    [i, o],
    [n, l],
    [r, l],
    [o, l]
  ];
}
function computeLinePlaneIntersection(a, e, t, s) {
  const i = e.clone().sub(a), n = t.dot(i), r = t.dot(s.clone().sub(a));
  if (Math.abs(n) < 1e-6)
    return Math.abs(r) < 1e-6 ? [a.clone(), e.clone()] : null;
  {
    const o = r / n;
    return o < 0 || o > 1 ? null : a.clone().add(i.multiplyScalar(o));
  }
}
function computePlaneUnitCellIntersections(a, e, t, s) {
  const i = getUnitCellVertices(a, e), n = getUnitCellEdges(i), r = [];
  for (let c = 0; c < n.length; c++) {
    const [h, d] = n[c], u = computeLinePlaneIntersection(h, d, t, s);
    u && (Array.isArray(u) ? r.push(...u) : r.push(u));
  }
  const o = [], l = 1e-6;
  return r.forEach((c) => {
    o.some((d) => d.distanceToSquared(c) < l * l) || o.push(c);
  }), o;
}
function computePlaneBasis(a) {
  let e = new THREE.Vector3();
  Math.abs(a.z) > Math.abs(a.x) ? e.set(1, 0, 0).cross(a).normalize() : e.set(0, 0, 1).cross(a).normalize();
  const t = a.clone().cross(e).normalize();
  return { u: e, v: t };
}
function pointInPolygon(a, e) {
  let t = 0;
  const s = e.length;
  for (let i = 0; i < s; i++) {
    const n = e[i], r = e[(i + 1) % s];
    n.y <= a.y ? r.y > a.y && isLeft(n, r, a) > 0 && t++ : r.y <= a.y && isLeft(n, r, a) < 0 && t--;
  }
  return t !== 0;
}
function isLeft(a, e, t) {
  return (e.x - a.x) * (t.y - a.y) - (t.x - a.x) * (e.y - a.y);
}
function computeConvexHull(a) {
  a.sort((s, i) => s.x - i.x || s.y - i.y);
  const e = [];
  for (let s of a) {
    for (; e.length >= 2 && cross(e[e.length - 2], e[e.length - 1], s) <= 0; )
      e.pop();
    e.push(s);
  }
  const t = [];
  for (let s = a.length - 1; s >= 0; s--) {
    const i = a[s];
    for (; t.length >= 2 && cross(t[t.length - 2], t[t.length - 1], i) <= 0; )
      t.pop();
    t.push(i);
  }
  return e.pop(), t.pop(), e.concat(t);
}
function cross(a, e, t) {
  return (e.x - a.x) * (t.y - a.y) - (e.y - a.y) * (t.x - a.x);
}
function computeEigenvaluesAndEigenvectors(a) {
  let s = a.map((o) => o.slice());
  const i = s.length;
  let n = Array.from({ length: i }, (o, l) => Array.from({ length: i }, (c, h) => l === h ? 1 : 0));
  for (let o = 0; o < 100; o++) {
    let l = 0, c = 0, h = 0;
    for (let f = 0; f < i; f++)
      for (let w = f + 1; w < i; w++)
        Math.abs(s[f][w]) > Math.abs(l) && (l = s[f][w], c = f, h = w);
    if (Math.abs(l) < 1e-10)
      break;
    const d = 0.5 * Math.atan2(2 * l, s[c][c] - s[h][h]), u = Math.cos(d), p = Math.sin(d), m = u * u * s[c][c] - 2 * p * u * s[c][h] + p * p * s[h][h], g = p * p * s[c][c] + 2 * p * u * s[c][h] + u * u * s[h][h], y = 0;
    for (let f = 0; f < i; f++)
      if (f !== c && f !== h) {
        const w = u * s[c][f] - p * s[h][f], S = p * s[c][f] + u * s[h][f];
        s[c][f] = w, s[f][c] = w, s[h][f] = S, s[f][h] = S;
      }
    s[c][c] = m, s[h][h] = g, s[c][h] = y, s[h][c] = y;
    for (let f = 0; f < i; f++) {
      const w = u * n[f][c] - p * n[f][h], S = p * n[f][c] + u * n[f][h];
      n[f][c] = w, n[f][h] = S;
    }
  }
  return { eigenvalues: s.map((o, l) => o[l]), eigenvectors: n };
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
        const r = [0, 0, this.viewer.atoms.attributes.atom.moment[n] * 1.5], o = this.viewer.atoms.positions[n].map((l, c) => l - r[c] / 2);
        e.push(o), t.push(r);
      } else {
        const r = [0, 0, this.viewer.atoms.attributes.atom.moment[n] * 1.5], o = this.viewer.atoms.positions[n].map((l, c) => l - r[c] / 2);
        s.push(o), i.push(r);
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
  addSetting(e, { origins: t, vectors: s, factor: i = 1, color: n = "#3d82ed", radius: r = 0.05, centerOnAtoms: o = !1 }) {
    if (typeof t == "string" && !this.viewer.atoms.getAttribute(t))
      throw new Error(`Attribute '${t}' is not defined. The available attributes are: ${Object.keys(this.viewer.atoms.attributes.atom)}`);
    const l = new Setting$2({ origins: t, vectors: s, factor: i, color: n, radius: r, centerOnAtoms: o });
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
      const [n, r] = this.getData(i), o = this.meshes[s].arrow;
      if (!o) return;
      const l = n.length;
      (e !== null ? [e] : [...Array(l).keys()]).forEach((h) => {
        const d = new THREE.Vector3(...n[h]), u = new THREE.Vector3(...r[h]).multiplyScalar(
          i.factor
        ), p = d.clone().add(u), m = new THREE.Vector3().lerpVectors(d, p, 0), g = calculateQuaternion(d, p), y = new THREE.Vector3(
          10 * i.radius,
          d.distanceTo(p),
          10 * i.radius
        ), f = new THREE.Matrix4().compose(m, g, y);
        o.setMatrixAt(h, f);
      }), o.instanceMatrix.needsUpdate = !0;
    });
  }
}
function drawAtomArrows({
  length: a = 0,
  color: e = 0,
  materialType: t = "Standard",
  shapeRegistry: s
}) {
  const i = s.create("Arrow", { materialType: t });
  if (!(i instanceof THREE.Mesh))
    throw new Error("Arrow must return a THREE.Mesh");
  const n = i.geometry.clone(), r = i.material.clone();
  r.color.set(e);
  const o = new THREE.InstancedMesh(n, r, a);
  return o.userData.type = "arrow", o;
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
    const s = t[0], i = this.viewer.atoms.positions[s], r = `${this.viewer.atoms.symbols[s]} [${i[0].toFixed(3)}, ${i[1].toFixed(3)}, ${i[2].toFixed(3)}]`, o = createLabel(new THREE.Vector3(...i).add(new THREE.Vector3(1, 0, 0)), r, "black", "18px");
    this.scene.add(o), this.meshes[e] = [o];
  }
  showDistance(e, t) {
    const s = new THREE.Vector3(...this.viewer.atoms.positions[t[0]]), i = new THREE.Vector3(...this.viewer.atoms.positions[t[1]]), n = s.distanceTo(i), r = [s, i], o = new THREE.LineBasicMaterial({ color: 255 }), l = new THREE.BufferGeometry().setFromPoints(r), c = new THREE.LineSegments(l, o);
    this.scene.add(c);
    const h = createLabel(s.add(i).multiplyScalar(0.5), n.toFixed(3), "black", "18px");
    this.scene.add(h), this.meshes[e] = [c, h];
  }
  showAngle(e, t) {
    const s = new THREE.Vector3(...this.viewer.atoms.positions[t[0]]), i = new THREE.Vector3(...this.viewer.atoms.positions[t[1]]), n = new THREE.Vector3(...this.viewer.atoms.positions[t[2]]), r = s.clone().sub(i).normalize(), o = n.clone().sub(i).normalize(), l = r.angleTo(o) * 180 / Math.PI, c = new THREE.LineBasicMaterial({ color: 255 }), h = new THREE.BufferGeometry().setFromPoints([s, i]), d = new THREE.LineSegments(h, c);
    this.scene.add(d);
    const u = new THREE.BufferGeometry().setFromPoints([i, n]), p = new THREE.LineSegments(u, c);
    this.scene.add(p);
    const m = i.add(r.add(o).multiplyScalar(0.3)), g = createLabel(m, l.toFixed(3), "black", "18px");
    this.scene.add(g), this.meshes[e] = [d, p, g];
  }
  showDihedralAngle(e, t) {
    const s = new THREE.Vector3(...this.viewer.atoms.positions[t[0]]), i = new THREE.Vector3(...this.viewer.atoms.positions[t[1]]), n = new THREE.Vector3(...this.viewer.atoms.positions[t[2]]), r = new THREE.Vector3(...this.viewer.atoms.positions[t[3]]), o = s.clone().sub(i).normalize(), l = n.clone().sub(i).normalize(), c = r.clone().sub(n).normalize(), h = o.clone().cross(l).normalize(), d = l.clone().cross(c).normalize(), u = Math.acos(h.dot(d)), p = new THREE.BufferGeometry(), m = [];
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
    const o = new Setting({ indices: t, scale: s, type: i, color: n, opacity: r });
    this.settings[e] = o;
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
    }), o = this.createCrossGeometry(1);
    this.drawHighlightMesh("cross", o, r);
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
    const n = new THREE.InstancedMesh(t, s, i.count), r = new THREE.Vector3(), o = new THREE.Quaternion(), l = new THREE.Vector3(), c = new THREE.Matrix4(), h = new THREE.Matrix4();
    for (let d = 0; d < i.count; d++)
      i.getMatrixAt(d, c), c.decompose(r, o, l), l.multiplyScalar(0), h.compose(r, o, l), n.setMatrixAt(d, h);
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
  updateHighlightAtomsMesh({ indices: e = [], scale: t = 1.1, color: s = "yellow", type: i = "sphere", opacity: n = null, occlude: r = !0, offset: o = 1.0005, thickness: l = null }, c = null) {
    if (i === "crossView") {
      const h = c || "crossView";
      this._crossViewSettings[h] = { indices: e, scale: t, color: s, occlude: r, offset: o, thickness: l }, this.updateCrossViewMaterialOcclusion(), this._crossViewNeedsUpdate = !0;
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
      const { indices: o = [], scale: l = 1.1, color: c = "yellow", offset: h = 1.0005, thickness: d = null } = r || {}, u = Number.isFinite(d) ? d : this._crossViewThicknessDefault;
      o.forEach((p) => {
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
      const r = s[n], o = 16 + n;
      (!this._hasCameraSignature || Math.abs(this._cameraSignature[o] - r) > 1e-6) && (i = !0), this._cameraSignature[o] = r;
    }
    return this._hasCameraSignature = !0, i;
  }
}
class AtomsLegend {
  constructor(e, t) {
    this.viewer = e, this.guiConfig = t, this.legendSprites = [], this.getLegendConfig().enabled && this.addLegend();
  }
  addLegend() {
    this.removeLegend();
    let e, t;
    const s = 2, i = -2;
    switch (this.getLegendConfig().position || "top-right") {
      case "top-left":
        e = -0.9, t = 0.9;
        break;
      case "top-right":
        e = 0.7, t = 0.9;
        break;
      case "bottom-left":
        e = -0.9, t = -0.7;
        break;
      case "bottom-right":
        e = -5, t = -2;
        break;
      default:
        e = 0.7, t = 0.9;
        break;
    }
    let o = 0;
    this.viewer.atomManager.getMaxRadius(), this.viewer.atomManager.getMinRadius(), Object.entries(this.viewer.atomManager.settings).forEach(([l, c]) => {
      const h = `${l}`, d = createTextSprite(h, {
        fontsize: 96,
        // Adjust as needed
        fontface: "Arial",
        textColor: { r: 0, g: 0, b: 0, a: 1 },
        backgroundColor: { r: 255, g: 255, b: 255, a: 0 },
        scale: 1.5
      }), u = typeof c.color == "string" ? new THREE.Color(c.color) : c.color, p = Math.min(2, Math.max(1, c.radius)), m = createCircleSprite(u, { scale: p }), g = t - o * i;
      m.position.set(e, g, -1), d.position.set(e + s, g, -1), this.viewer.tjs.legendScene.add(m), this.viewer.tjs.legendScene.add(d), this.legendSprites.push(m, d), o += 1;
    });
  }
  removeLegend() {
    this.legendSprites.length > 0 && (this.legendSprites.forEach((e) => {
      this.viewer.tjs.legendScene.remove(e), e.material.map.dispose(), e.material.dispose();
    }), this.legendSprites = []);
  }
  updateLegend() {
    this.getLegendConfig().enabled ? this.addLegend() : this.removeLegend();
  }
  getLegendConfig() {
    return this.guiConfig.atomLegend || this.guiConfig.legend || { enabled: !1, position: "top-right" };
  }
}
function createCircleSprite(a, e = {}) {
  const t = e.radius || 32, s = e.outlineWidth ?? 3, i = e.outlineColor || getContrastColor(a), n = document.createElement("canvas"), r = t * 2;
  n.width = r, n.height = r;
  const o = n.getContext("2d");
  o.beginPath(), o.arc(t, t, t - 2, 0, 2 * Math.PI, !1), o.fillStyle = `#${a.getHexString()}`, o.fill(), s > 0 && (o.lineWidth = s, o.strokeStyle = i, o.stroke());
  const l = new THREE.CanvasTexture(n);
  l.minFilter = THREE.LinearFilter, l.generateMipmaps = !1;
  const c = new THREE.SpriteMaterial({ map: l }), h = new THREE.Sprite(c), d = e.scale || 0.1;
  return h.scale.set(d, d, 1), h;
}
function getContrastColor(a) {
  const e = a.r, t = a.g, s = a.b;
  return 0.2126 * e + 0.7152 * t + 0.0722 * s > 0.7 ? "rgba(34,34,34,0.9)" : "rgba(245,245,245,0.9)";
}
function createTextSprite(a, e = {}) {
  const t = e.fontface || "Arial", s = e.fontsize || 96, i = e.borderThickness || 0, n = e.borderColor || { r: 0, g: 0, b: 0, a: 1 }, r = e.backgroundColor || { r: 255, g: 255, b: 255, a: 0 }, o = e.textColor || { r: 0, g: 0, b: 0, a: 1 }, l = document.createElement("canvas"), c = l.getContext("2d");
  c.font = `${s}px ${t}`;
  const d = c.measureText(a).width, u = s;
  l.width = d + i * 2, l.height = u + i * 2, c.fillStyle = `rgba(${r.r},${r.g},${r.b},${r.a})`, c.fillRect(0, 0, l.width, l.height), i > 0 && (c.strokeStyle = `rgba(${n.r},${n.g},${n.b},${n.a})`, c.lineWidth = i, c.strokeRect(0, 0, l.width, l.height)), c.fillStyle = `rgba(${o.r},${o.g},${o.b},${o.a})`, c.font = `${s}px ${t}`, c.textBaseline = "top", c.fillText(a, i, i);
  const p = new THREE.CanvasTexture(l);
  p.minFilter = THREE.LinearFilter, p.generateMipmaps = !1;
  const m = new THREE.SpriteMaterial({ map: p }), g = new THREE.Sprite(m), y = e.scale || 1;
  return g.scale.set(y * l.width / l.height, y, 1), g;
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
    const o = { showAxes: this.viewer.cellManager.showAxes };
    this.showCellAxesController = e.add(o, "showAxes").name("Crystal Axes").onChange((l) => {
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
      const o = s.radius * 10;
      r.beginPath(), r.arc(10, 10, o, 0, Math.PI * 2), r.fill(), i.appendChild(n);
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
function vec_dot(a, e) {
  return a.reduce((t, s, i) => t + s * e[i], 0);
}
function complexPolar(a, e) {
  return {
    real: a * Math.cos(e),
    imag: a * Math.sin(e),
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
    let o = [];
    this.addatomphase ? o = n.map((l) => vec_dot(this.kpoint, l)) : o = new Array(r).fill(0);
    for (let l = 0; l < t; l++)
      for (let c = 0; c < s; c++)
        for (let h = 0; h < i; h++)
          for (let d = 0; d < r; d++) {
            let u = vec_dot(this.kpoint, [l, c, h]) + o[d], p = complexPolar(1, u * 2 * Math.PI);
            this.vibrations.push(this.eigenvectors[d].map((m) => p.mult({ real: m[0], imag: m[1] })));
          }
  }
  // Get the trajectory of the phonon mode
  getTrajectory(e, t, s = null, i = null, n = null, r = [1, 1, 1], o = null) {
    if (n && (this.atoms = n), s && (this.kpoint = s), i && (this.eigenvectors = i), this.kpoint === null || this.eigenvectors === null)
      throw new Error("kpoint and eigenvectors must be provided");
    o !== null && (this.addatomphase = o), this.calculateVibrations(r);
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
          const o = { ...i, ...s.settings };
          this.atomManager.applySettings(o), this.state.set({ plugins: { species: { settings: o } } });
        } else
          this.state.set({ plugins: { species: { settings: i } } });
        const n = this.state.get("bond") || {}, r = this.bondManager.toPlainSettings();
        if (n.settings && Object.keys(n.settings).length > 0) {
          const o = { ...r, ...n.settings };
          this.bondManager.applySettings(o), this.state.set({ bond: { settings: o } });
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
  fromPhononMode({ atoms: e, eigenvectors: t, amplitude: s = 1, factor: i = 1, nframes: n = 30, kpoint: r = [0, 0, 0], repeat: o = [1, 1, 1], color: l = "#ff0000", radius: c = 0.1 }) {
    this.logger.debug("--------------------------------------From Phonon Mode--------------------------------------");
    const d = new Phonon(e, r, t, !0).getTrajectory(s, n, null, null, null, o);
    this.atoms = d, this._cell = e.cell, this._atoms = e.multiply({ mx: o[0], my: o[1], mz: o[2] }), this._atoms.uuid = this.uuid, this.VFManager.addSetting("phonon", { origins: "positions", vectors: "movement", factor: i, color: l, radius: c }), this.bondManager.hideLongBonds = !1, this.drawModels(), this.play();
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
      s || this.state.set({ viewer: e }), Object.entries(e).forEach(([o, l]) => {
        if (!(o in this)) {
          this.logger.warn(`Unknown viewer state key: ${o}`);
          return;
        }
        const c = o === "modelStyle" ? normalizeModelStyle(l, this._modelStyle) : l;
        if (o === "selectedAtomsIndices") {
          const h = this._selectedAtomsIndices, d = Array.isArray(l) ? l : [], u = d.filter((m) => !h.includes(m)), p = h.filter((m) => !d.includes(m));
          if (d.length > 0 && !this.weas.eventHandlers?.transformControls?.mode && this.weas.selectionManager.setModeHint(""), (!this.highlightManager.settings || !this.highlightManager.settings.selection) && this.highlightManager.init(), (!this.highlightManager.meshes || !this.highlightManager.meshes.sphere) && this.highlightManager.drawHighlightAtoms(), this.highlightManager.settings.selection.indices = d, this._selectedAtomsIndices = d, this.weas.eventHandlers.dispatchViewerUpdated({ selectedAtomsIndices: d }), this.highlightManager.updateHighlightAtomsMesh({ indices: u, scale: 1.1, type: "sphere" }), this.highlightManager.updateHighlightAtomsMesh({ indices: p, scale: 0, type: "sphere" }), this.baseAtomLabelSettings = this.getAtomLabelSettingsFromType(this._atomLabelType), this.updateAtomLabels(), i) {
            const m = this.getRedrawEffectForKey(o);
            m && this.requestRedraw(m);
          }
          return;
        }
        if (this[o] = c, o === "radiusType" && (this.atomManager.init(), this.bondManager.init(), this.polyhedraManager.init()), o === "colorBy" && (this.atomManager.init(), this.bondManager.init(), this.polyhedraManager.init()), o === "colorType" && (this.atomManager.init(), this.guiManager.updateLegend(), this.bondManager.init(), this.polyhedraManager.init()), o === "atomScale" && (this.atomManager.updateAtomScale(l), Object.values(this.highlightManager.settings || {}).forEach((h) => {
          this.highlightManager.updateHighlightAtomsMesh(h);
        })), o === "backgroundColor" && (this.tjs.scene.background = new THREE.Color(l)), o === "atomLabelType" && (this.baseAtomLabelSettings = this.getAtomLabelSettingsFromType(l), this.updateAtomLabels()), o === "modelStyle" && r && this.updateModelStyles(c), i) {
          const h = this.getRedrawEffectForKey(o);
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
      const o = calculateCartesianCoordinates(t, n);
      return new THREE.Vector3(o[0], o[1], o[2]);
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
      const o = new THREE.Vector3(...this.atoms.positions[r]);
      o.sub(i).applyMatrix4(n).add(i), this.setAtomPosition({ index: r, position: o });
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
    const r = (o) => {
      e === 0 ? (t[o] = 1, s[o] = e, i[o] = 0) : e === 1 ? (t[o] = 0.4, s[o] = e, i[o] = 0) : e === 2 ? (t[o] = 0.4, s[o] = e, i[o] = 1) : (e === 3 || e === 4) && (t[o] = 0, s[o] = e, i[o] = 0);
    };
    n.forEach((o) => r(o));
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
function normalizeModelStyle(a, e) {
  if (typeof a == "number")
    return a;
  if (typeof a == "string") {
    if (Object.prototype.hasOwnProperty.call(MODEL_STYLE_MAP, a))
      return MODEL_STYLE_MAP[a];
    const t = parseInt(a, 10);
    if (!Number.isNaN(t))
      return t;
  }
  return e;
}
function createDefaultState() {
  const a = cloneValue(defaultViewerSettings);
  return {
    viewer: {
      modelStyle: a.modelStyle,
      colorBy: a.colorBy,
      colorType: a.colorType,
      colorRamp: a.colorRamp,
      radiusType: a.radiusType,
      materialType: a.materialType,
      atomLabelType: a.atomLabelType,
      showBondedAtoms: a.showBondedAtoms,
      boundary: a.boundary,
      atomScale: a.atomScale,
      wrapOnMove: a.wrapOnMove,
      atomScales: [],
      modelSticks: [],
      modelPolyhedras: [],
      backgroundColor: a.backgroundColor,
      continuousUpdate: a.continuousUpdate,
      selectedAtomsIndices: []
    },
    cell: cloneValue(a.cellSettings),
    bond: {
      settings: {},
      hideLongBonds: a.bondSettings.hideLongBonds,
      showHydrogenBonds: a.bondSettings.showHydrogenBonds,
      showOutBoundaryBonds: a.bondSettings.showOutBoundaryBonds
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
function applyDefined(a, e, t) {
  e && t.forEach((s) => {
    e[s] !== void 0 && (a[s] = cloneValue(e[s]));
  });
}
function fromWidgetSnapshot(a) {
  if (!a || typeof a != "object")
    throw new Error("Invalid widget snapshot payload.");
  const e = createDefaultState(), t = a.viewer || {}, s = a.plugins || {}, i = a.camera || {}, n = a.measurement || {}, r = a.animation || {};
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
  const o = typeof r.currentFrame == "number" ? r.currentFrame : typeof t.currentFrame == "number" ? t.currentFrame : void 0;
  return {
    version: "weas_state_v1",
    atoms: cloneValue(a.atoms),
    state: e,
    camera: cloneValue(e.camera),
    currentFrame: o
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
      MeshStandardMaterial: [
        {
          prop: "metalness",
          type: "number",
          min: 0,
          max: 1,
          step: 0.01,
          level: "editable"
        },
        {
          prop: "roughness",
          type: "number",
          min: 0,
          max: 1,
          step: 0.01,
          level: "editable"
        }
      ],
      MeshPhongMaterial: [
        {
          prop: "shininess",
          type: "number",
          min: 0,
          max: 300,
          step: 1,
          level: "editable"
        },
        {
          prop: "reflectivity",
          type: "number",
          min: 0,
          max: 1,
          step: 0.01,
          level: "advanced"
        }
      ],
      MeshBasicMaterial: []
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
    const o = e.getMaterial(s, !0);
    return "color" in o && (o.color = new THREE.Color(i)), o.transparent = !0, o.opacity = n, o.side = THREE.DoubleSide, o.wireframe = r, n < 1 && (o.depthWrite = !1), new THREE.Mesh(t, o);
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
      const i = s.shaftRatio ?? 0.75, n = s.length ?? 1, r = n * i, o = n - r, l = (s.shaftRadius ?? 0.075) * n, c = (s.headRadius ?? 0.15) * n, h = new THREE.CylinderGeometry(
        l,
        l,
        r,
        s.segments ?? 12
      );
      h.translate(0, r / 2, 0);
      const d = new THREE.ConeGeometry(
        c,
        o,
        s.segments ?? 12
      );
      d.translate(0, r + o / 2, 0);
      const u = mergeGeometries([h, d], !1), p = this._createBaseMesh(t, u, s);
      if (s.start && s.end) {
        const m = new THREE.Vector3(...s.start), g = new THREE.Vector3(...s.end), y = new THREE.Vector3().subVectors(g, m), f = y.length();
        y.normalize(), p.scale.set(1, f / n, 1);
        const w = new THREE.Vector3(0, 1, 0).cross(y), S = Math.acos(new THREE.Vector3(0, 1, 0).dot(y));
        w.lengthSq() > 0 && p.quaternion.setFromAxisAngle(w.normalize(), S), p.position.copy(m);
      }
      return p;
    }), this.register("Line", (t, s) => {
      const i = s.color || "#000000", n = s.start || [0, 0, 0], r = s.end || [0, 1, 0], o = [new THREE.Vector3(...n), new THREE.Vector3(...r)], l = new THREE.BufferGeometry().setFromPoints(o), c = new THREE.LineBasicMaterial({ color: i }), h = new THREE.Line(l, c);
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
      const [n, r, o] = t.rotation;
      i.rotation.set(
        THREE.MathUtils.degToRad(n),
        THREE.MathUtils.degToRad(r),
        THREE.MathUtils.degToRad(o)
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
    const e = this.tjs.controls;
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
    this.tjs.scene.clear(), this.state.reset(createDefaultState()), this.avr && (this.avr.atoms = new Atoms()), this._applyCameraState(this.state.get("camera"));
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
    const e = this.tjs.camera, t = this.tjs.controls, s = e?.position?.toArray?.() || null, i = t?.target?.toArray?.() || null;
    let n = null, r = null;
    if (Array.isArray(s) && Array.isArray(i) && s.length === 3 && i.length === 3) {
      const o = s[0] - i[0], l = s[1] - i[1], c = s[2] - i[2];
      r = Math.sqrt(o * o + l * l + c * c), r > 0 && (n = [o / r, l / r, c / r]);
    }
    return {
      type: this.tjs.cameraType,
      position: s,
      target: i,
      direction: n,
      distance: r,
      zoom: e?.zoom,
      fov: e?.fov
    };
  }
  _applyCameraState(e) {
    if (!e || typeof e != "object")
      return;
    e.type && (this.tjs.cameraType = e.type);
    const t = Array.isArray(e.direction) && e.direction.length === 3, s = Array.isArray(e.target) && e.target.length === 3, i = typeof e.distance == "number";
    if (t || s || i) {
      this.tjs.updateCameraAndControls({
        lookAt: s ? e.target : null,
        direction: t ? e.direction : [0, 0, 1],
        distance: i ? e.distance : null,
        zoom: typeof e.zoom == "number" ? e.zoom : 1,
        fov: typeof e.fov == "number" ? e.fov : 50
      });
      return;
    }
    const n = this.tjs.camera, r = this.tjs.controls;
    Array.isArray(e.position) && e.position.length === 3 && n.position.set(
      e.position[0],
      e.position[1],
      e.position[2]
    ), Array.isArray(e.target) && e.target.length === 3 && r && (r.target.set(e.target[0], e.target[1], e.target[2]), r.update()), typeof e.zoom == "number" && (typeof n.updateZoom == "function" ? n.updateZoom(e.zoom) : (n.zoom = e.zoom, n.updateProjectionMatrix())), typeof e.fov == "number" && n.isPerspectiveCamera && (n.fov = e.fov, n.updateProjectionMatrix()), n.updateProjectionMatrix(), this.requestRedraw("render");
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
function parseCube(a) {
  const e = a.trim().split(`
`);
  if (e.length < 6)
    throw new Error("Invalid cube file format");
  const t = parseInt(e[2].trim().split(/\s+/)[0]), s = e[2].trim().split(/\s+/).slice(1).map(Number), i = [e[3].trim().split(/\s+/).map(Number), e[4].trim().split(/\s+/).map(Number), e[5].trim().split(/\s+/).map(Number)], n = i.map((d) => Math.abs(d[0])), r = i.map((d, u) => ({
    cell: d.slice(1).map((p) => p * n[u] * Bohr),
    // Calculate the actual cell lengths
    stepSize: d.slice(1)
  })), o = {
    species: {},
    pbc: [!0, !0, !0],
    positions: [],
    symbols: []
  };
  for (let d = 6; d < 6 + t; d++) {
    const u = e[d].trim().split(/\s+/).map(Number), p = u[0], m = u.slice(2), g = Object.keys(elementAtomicNumbers).find((y) => elementAtomicNumbers[y] === p);
    o.species[g] || (o.species[g] = g), o.symbols.push(g), o.positions.push(m);
  }
  if (o.positions.length !== t)
    throw new Error("Atom count mismatch in cube file");
  const l = r.map((d) => d.cell);
  let c = new Atoms({
    ...o,
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
function parseXSF(a) {
  const e = a.trim().split(/\r?\n/), t = {
    species: {},
    pbc: [!0, !0, !0],
    positions: [],
    symbols: []
  };
  let s = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ], i = 0, n = null, r = -1, o = -1, l = -1, c = -1;
  for (let d = 0; d < e.length; d++) {
    const u = e[d].trim().toUpperCase();
    u.startsWith("PRIMVEC") && (r = d), u.startsWith("PRIMCOORD") && (o = d), u.startsWith("BEGIN_BLOCK_DATAGRID_3D") && (l = d), u.startsWith("END_BLOCK_DATAGRID_3D") && (c = d);
  }
  if (r >= 0)
    for (let d = 1; d <= 3; d++)
      s[d - 1] = e[r + d].trim().split(/\s+/).map(Number);
  if (o >= 0) {
    i = e[o + 1].trim().split(/\s+/).map(Number)[0];
    for (let u = 0; u < i; u++) {
      const p = e[o + 2 + u].trim().split(/\s+/), m = p[0];
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
    ], w = [], S = d + 6;
    for (let E = S; E < c; E++) {
      const x = e[E].trim().split(/\s+/).map(Number);
      x.some((A) => !isNaN(A)) && w.push(...x);
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
