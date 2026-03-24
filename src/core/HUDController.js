import * as THREE from "three";

import { LegendHUD } from "./ui/LegendHUD";
import { ToolbarHUD } from "./ui/ToolbarHUD";

/**
 * HUDController manages overlay elements and mini 3D scenes on top of a main Three.js renderer.
 * Allows arbitrary HTML overlays and mini-scenes
 */
export default class HUDController {
  constructor(weas, container, mainRenderer) {
    this._listeners = new Set();

    this.weas = weas;
    this.container = document.createElement("div");
    this.container.style.position = "absolute";
    this.container.style.top = "0";
    this.container.style.left = "0";
    this.container.style.width = "100%";
    this.container.style.height = "100%";
    this.container.style.pointerEvents = "none";

    container.appendChild(this.container);

    this.htmlElements = new Map();
    this.miniScenes = new Map();
    this.renderer = mainRenderer;

    this.legendHUD = new LegendHUD(this, { position: "bottom-right" });

    this.ToolbarHUD = new ToolbarHUD(this.weas, this, {
      position: "top-right",
    });

    window.addEventListener("resize", () => this.update());

    this.ANCHORS = [
      "top-left",
      "top-right",
      "bottom-left",
      "bottom-right",
      "center",
    ];
  }

  onChange(cb) {
    this._listeners.add(cb);
  }

  _emitChange() {
    this._listeners.forEach((cb) => cb());
  }

  // defines space cartesian axis, -- useful for rotational overlays
  initCoordScene() {
    const scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0xffffff, 2.0));

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Axes helper inside a group for rotation
    const axes = new THREE.AxesHelper(0.5);
    const axesGroup = new THREE.Group();
    axesGroup.add(axes);
    scene.add(axesGroup);

    // Fixed mini camera
    const camera = new THREE.OrthographicCamera(-2.5, 2.5, 2.5, -2.5, 0.1, 100);
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);

    // Store the axes group for rotation sync
    this.coordAxesGroup = axesGroup;

    this.addMiniScene(
      "coord",
      scene,
      camera,
      { width: 200, height: 200 },
      { bottom: 10, left: 10 },
      true,
      true,
    );
  }

  addMiniScene(
    key,
    scene,
    camera,
    size = { width: 150, height: 150 },
    position = { top: 10, left: 10 },
    rotation = false, // whether to rotate with the main camera.
    visible = true,
  ) {
    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;
    canvas.style.position = "absolute";
    canvas.style.pointerEvents = "none";

    this.container.appendChild(canvas);

    this.miniScenes.set(key, {
      scene,
      camera,
      canvas,
      width: size.width,
      height: size.height,
      position: { ...position },
      rotation: rotation,
      visible: visible,
    });

    // Apply the position using the helper
    this.setMiniScenePosition(key, position);
  }

  // HTML handling
  addHTMLPanel(key, element, options = {}) {
    const {
      width,
      height,
      anchor = "top-left", // new default anchor
      offset = { x: 0, y: 0 }, // x/y offsets from the anchor
      visible = true,
    } = options;

    element.style.position = "absolute";
    element.style.display = visible ? "flex" : "none";
    if (width) element.style.width = width + "px";
    if (height) element.style.height = height + "px";

    this.container.appendChild(element);

    this.htmlElements.set(key, {
      element,
      width: width || element.offsetWidth,
      height: height || element.offsetHeight,
      anchor,
      offset: { ...offset },
      visible,
    });

    this._updateHTMLPosition(key);
    this._emitChange();
  }

  addPanel(key, element, position) {
    this.addHTMLPanel(key, element, position);
  }

  getPresetPosition(preset, padding = 10) {
    const cW = this.container.clientWidth;
    const cH = this.container.clientHeight;

    switch (preset) {
      case "top-left":
        return { top: padding, left: padding };
      case "top-right":
        return { top: padding, left: cW - padding };
      case "bottom-left":
        return { top: cH - padding, left: padding };
      case "bottom-right":
        return { top: cH - padding, left: cW - padding };
      default:
        return { top: padding, left: padding };
    }
  }

  setHTMLPosition(key, newPosition) {
    const panel = this.htmlElements.get(key);
    if (!panel) return;
    panel.position = { ...panel.position, ...newPosition };
    this._applyPosition(panel.element, panel.position);
  }

  setHTMLPanelVisible(key, visible) {
    const panel = this.htmlElements.get(key);
    if (!panel) return;

    panel.visible = visible;
    // FIXME: May be buggy if panel original disp is something other than flex
    panel.element.style.display = visible ? "flex" : "none";
  }

  render(mainCamera) {
    this.miniScenes.forEach(({ scene, camera, canvas, rotation, visible }) => {
      if (!visible || !canvas.width || !canvas.height) return;

      // take the mainCamera and pin it to the coordAxes...
      if (rotation && this.coordAxesGroup) {
        this.coordAxesGroup.quaternion.copy(mainCamera.quaternion).invert();
      }

      const rect = canvas.getBoundingClientRect();
      const containerRect = this.container.getBoundingClientRect();

      const x = rect.left - containerRect.left;
      const y =
        containerRect.height - (rect.top - containerRect.top) - canvas.height;

      const renderer = this.renderer;
      const oldViewport = new THREE.Vector4();
      renderer.getViewport(oldViewport);

      renderer.setViewport(x, y, canvas.width, canvas.height);
      renderer.setScissor(x, y, canvas.width, canvas.height);
      renderer.setScissorTest(true);
      renderer.render(scene, camera);

      renderer.setViewport(
        oldViewport.x,
        oldViewport.y,
        oldViewport.z,
        oldViewport.w,
      );
      renderer.setScissorTest(false);
    });
  }

  // TODO, make this pass a refire feedback to main three JS
  update() {}

  // List all mini-scenes and HTML elements by key
  list() {
    const miniScenes = Array.from(this.miniScenes.keys());
    const htmlElements = Array.from(this.htmlElements.keys());
    return { miniScenes, htmlElements };
  }

  // Detailed info about each HUD element
  listDetails() {
    const miniScenes = {};
    this.miniScenes.forEach((value, key) => {
      miniScenes[key] = {
        width: value.canvas.width,
        height: value.canvas.height,
        position: value.position || {
          top: parseInt(value.canvas.style.top || 0),
          left: parseInt(value.canvas.style.left || 0),
        },
        scene: value.scene,
        camera: value.camera,
      };
    });

    const htmlElements = {};
    this.htmlElements.forEach((el, key) => {
      htmlElements[key] = {
        width: el.offsetWidth,
        height: el.offsetHeight,
        position: {
          top: parseInt(el.style.top || 0),
          left: parseInt(el.style.left || 0),
        },
        element: el,
      };
    });

    return { miniScenes, htmlElements };
  }

  getTopLeft(key) {
    const mini = this.miniScenes.get(key);
    if (!mini) return { top: 0, left: 0 };
    // If 'top' is null, compute it from bottom
    const containerHeight = this.container.clientHeight;
    const top =
      mini.position.top != null
        ? mini.position.top
        : mini.position.bottom != null
          ? containerHeight - mini.position.bottom - mini.height
          : 0;
    const left = mini.position.left != null ? mini.position.left : 0;
    return { top, left };
  }

  getHTMLTopLeft(key) {
    const panel = this.htmlElements.get(key);
    if (!panel) return { top: 0, left: 0 };
    return {
      top: panel.position.top != null ? panel.position.top : 0,
      left: panel.position.left != null ? panel.position.left : 0,
    };
  }

  // Move an existing mini-scene
  setMiniScenePosition(key, newPosition) {
    const mini = this.miniScenes.get(key);
    if (!mini) return;
    mini.position = { ...mini.position, ...newPosition };
    this._applyPosition(mini.canvas, mini.position);
  }

  // Mini-scene visibility
  setMiniSceneVisible(key, visible) {
    const mini = this.miniScenes.get(key);
    if (!mini) return;
    mini.visible = visible;
    mini.canvas.style.display = visible ? "" : "none";
  }

  // HTML element visibility
  setHTMLElementVisible(key, visible) {
    const el = this.htmlElements.get(key);
    if (!el) return;
    el.visible = visible;
    el.style.display = visible ? "" : "none";
  }

  // Helper to apply CSS from position object
  _applyPosition(el, pos) {
    if (pos.top !== undefined) {
      el.style.top = pos.top + "px";
      el.style.bottom = "";
    }
    if (pos.left !== undefined) {
      el.style.left = pos.left + "px";
      el.style.right = "";
    }
    if (pos.bottom !== undefined) {
      el.style.bottom = pos.bottom + "px";
      el.style.top = "";
    }
    if (pos.right !== undefined) {
      el.style.right = pos.right + "px";
      el.style.left = "";
    }
  }

  _updateHTMLPosition(key) {
    const panel = this.htmlElements.get(key);
    if (!panel) return;

    const { element, anchor, offset } = panel;

    // reset previous positioning
    element.style.top = "";
    element.style.bottom = "";
    element.style.left = "";
    element.style.right = "";
    element.style.transform = "";

    // TODO - i dont like this strategy of positioning like this, it seems to scale poorly but its okay
    switch (anchor) {
      case "top-left":
        element.style.top = `${offset.y}%`;
        element.style.left = `${offset.x}%`;
        break;
      case "top-right":
        element.style.top = `${offset.y}%`;
        element.style.right = `${offset.x}%`;
        break;
      case "bottom-left":
        element.style.bottom = `${offset.y}%`;
        element.style.left = `${offset.x}%`;
        break;
      case "bottom-right":
        element.style.bottom = `${offset.y}%`;
        element.style.right = `${offset.x}%`;
        break;
      case "center":
        element.style.top = `calc(50% + ${offset.y}%)`;
        element.style.left = `calc(50% + ${offset.x}%)`;
        element.style.transform = "translate(-50%, -50%)";
        break;
    }
  }
}
