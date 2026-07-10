import * as THREE from "three";
import { CameraController } from "./CameraController";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer";
import { WeasScene } from "./SceneManager";
import { OrthographicCamera } from "./Camera";
import { defaultTjsConfig } from "../config";

import { HUDController } from "./HUDController";

class BlendJSObject {
  constructor(name, geometry, material) {
    this.name = name;
    this.geometry = geometry;
    this.material = material;
    this.object3D = new THREE.Mesh(geometry, material);
  }
}

class BlendJSMaterial {
  constructor(name, material) {
    this.name = name;
    this.material = material;
  }
}

class BlendJSMesh {
  constructor(name, geometry) {
    this.name = name;
    this.geometry = geometry;
  }
}

class BlendJSLight {
  constructor(name, light) {
    this.name = name;
    this.light = light;
  }
}

class BlendJSRenderer {
  constructor(name, renderer) {
    this.name = name;
    this.renderer = renderer;
  }
}

export class BlendJS {
  constructor(containerElement, weas) {
    this.containerElement = containerElement;
    this.tjsConfig = weas.tjsConfig || defaultTjsConfig;
    this.weas = weas;
    this.scene = new WeasScene(this);

    this.objects = {};
    this.materials = {};
    this.meshes = {};
    this.lights = {};
    this.renderers = {}; // New property to store renderers
    this._renderHooks = [];
    this._cameraType = "Orthographic"; //"Perspective"
    this.sceneView = { left: 0, bottom: 0, width: 1.0, height: 1.0 };
    this.init();

    // HUD setup
    this.hud = new HUDController(
      this.weas,
      this.containerElement,
      this.renderers["MainRenderer"].renderer,
    );

    this.hud.initCoordScene(this.camera);
  }

  get cameraType() {
    return this._cameraType;
  }

  set cameraType(value) {
    this._cameraType = value;
    if (this.cameraController) {
      this.cameraController.setCamera(value);
    }
  }

  get camera() {
    if (this._cameraType === "Orthographic") {
      return this.orthographicCamera;
    }
    return this.perspectiveCamera;
  }

  init() {
    this.scene.background = new THREE.Color(0xffffff); // init bg as white
    const renderConfig =
      this?.tjsConfig?.renderConfig || defaultTjsConfig.renderConfig;

    // Create a renderer
    const renderer = new THREE.WebGLRenderer(renderConfig);
    renderer.autoClear = false;
    const rect = this.containerElement.getBoundingClientRect();
    const clientWidth = this.containerElement.clientWidth || rect.width || 1;
    const clientHeight = this.containerElement.clientHeight || rect.height || 1;
    renderer.setSize(clientWidth, clientHeight);
    // For high DPI screens
    renderer.setPixelRatio(window.devicePixelRatio);

    this.addRenderer("MainRenderer", renderer);
    // Create a label renderer
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(clientWidth, clientHeight);
    labelRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.top = "0px";
    labelRenderer.domElement.style.pointerEvents = "none";
    this.addRenderer("LabelRenderer", labelRenderer);

    const frustumSize = 20; // This can be adjusted based on scene's scale
    const aspect = clientWidth / clientHeight;
    const frustumHalfHeight = frustumSize / 2;
    const frustumHalfWidth = frustumHalfHeight * aspect;

    this.orthographicCamera = new OrthographicCamera(
      -frustumHalfWidth, // left
      frustumHalfWidth, // right
      frustumHalfHeight, // top
      -frustumHalfHeight, // bottom
      1, // near clipping plane
      2000, // far clipping plane
      this,
    );
    this.orthographicCamera.layers.enable(1);

    this.perspectiveCamera = new THREE.PerspectiveCamera(
      50,
      clientWidth / clientHeight,
      1,
      500,
    );
    this.perspectiveCamera.layers.enable(1);

    // Set initial camera position
    this.camera.position.set(0, -100, 0);
    this.camera.lookAt(0, 0, 0);
    // Enable layer 1 for the camera
    // this layer will be used for vertex indicators

    this.scene.add(this.camera);
    // Create a light
    const light = new THREE.DirectionalLight(0xffffff, 2.0);
    light.position.set(50, 50, 100);
    // enabling casting shadows
    // light.castShadow = true;
    this.addLight("MainLight", light);
    // Parent the light to the camera
    this.camera.add(light);
    const ambientLight = new THREE.AmbientLight(0x404040, 20); // Soft white light
    this.addLight("AmbientLight", ambientLight);

    // set up camera controller (a thin wrapper around three.js orbit controls)
    this.cameraController = new CameraController(
      this.camera,
      renderer.domElement,
    );
    this.cameraController.addCamera("Perspective", this.perspectiveCamera);

    // auto pass changes to the controller
    this.cameraController.onChange(() => {
      this.render();
    });

    this.updateViewerRect();
    this.observeContainerResize();
    window.addEventListener("resize", this.onWindowResize.bind(this), false);
    // Add event listeners for mouse events
    this.containerElement.addEventListener("mousemove", this.render.bind(this));
    this.containerElement.addEventListener("pointerup", this.render.bind(this));
    this.containerElement.addEventListener(
      "pointerdown",
      this.render.bind(this),
    );
    this.containerElement.addEventListener("click", this.render.bind(this));
    this.containerElement.addEventListener("wheel", this.render.bind(this));
    this.containerElement.addEventListener(
      "atomsUpdated",
      this.render.bind(this),
    );
  }

  observeContainerResize() {
    console.log("Observing container resize");
    if (typeof ResizeObserver !== "function") {
      return;
    }
    this._lastObservedSize = { width: 0, height: 0 };
    this._resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }
      const { width, height } = entry.contentRect || {};
      if (!width || !height) {
        return;
      }
      if (
        width === this._lastObservedSize.width &&
        height === this._lastObservedSize.height
      ) {
        return;
      }
      this._lastObservedSize = { width, height };
      console.log("Container resized:", width, height);
      if (this._resizeRaf) {
        return;
      }
      this._resizeRaf = requestAnimationFrame(() => {
        this._resizeRaf = null;
        this.onWindowResize();
      });
    });
    this._resizeObserver.observe(this.containerElement);
  }

  updateViewerRect() {
    this.viewerRect = this.containerElement.getBoundingClientRect();
    return this.viewerRect;
  }

  addRenderHook(fn) {
    this._renderHooks.push(fn);
  }

  removeRenderHook(fn) {
    const idx = this._renderHooks.indexOf(fn);
    if (idx !== -1) this._renderHooks.splice(idx, 1);
  }

  addObject(name, geometry, material) {
    const object = new BlendJSObject(name, geometry, material);
    this.objects[name] = object;
    this.scene.add(object.object3D);
    return object;
  }

  // Methods for managing materials, meshes, lights, cameras
  addMaterial(name, material) {
    const mat = new BlendJSMaterial(name, material);
    this.materials[name] = mat;
    return mat;
  }

  addMesh(name, geometry) {
    const mesh = new BlendJSMesh(name, geometry);
    this.meshes[name] = mesh;
    return mesh;
  }

  addLight(name, light) {
    const lgt = new BlendJSLight(name, light);
    this.lights[name] = lgt;
    this.scene.add(lgt.light);
    return lgt;
  }

  // Method to add a renderer
  addRenderer(name, renderer) {
    this.containerElement.appendChild(renderer.domElement);
    const rndr = new BlendJSRenderer(name, renderer);
    this.renderers[name] = rndr;
    return rndr;
  }

  onWindowResize() {
    const rect = this.containerElement.getBoundingClientRect();
    const clientWidth = this.containerElement.clientWidth || rect.width;
    const clientHeight = this.containerElement.clientHeight || rect.height;
    if (!clientWidth || !clientHeight) {
      return;
    }
    // Update camera and renderer sizes based on the container element
    if (this.camera.isOrthographicCamera) {
      const aspect = clientWidth / clientHeight;
      const frustumHeight = this.camera.top - this.camera.bottom;
      this.camera.left = (-frustumHeight * aspect) / 2;
      this.camera.right = (frustumHeight * aspect) / 2;
    } else {
      this.camera.aspect = clientWidth / clientHeight;
    }
    this.camera.updateProjectionMatrix();

    // Resize all renderers
    Object.values(this.renderers).forEach((rndr) => {
      rndr.renderer.setSize(clientWidth, clientHeight);
    });
    this.updateViewerRect();
    this.render();
  }

  renderSceneInfo(scene, camera, left, bottom, width, height, renderer) {
    /*
     */
    // Use renderer size instead of container size, because the pixel ratio is taken into account
    const size = renderer.getSize(new THREE.Vector2());

    var nleft = Math.floor(size.width * left);
    var nbottom = Math.floor(size.height * bottom);
    var nwidth = Math.floor(size.width * width);
    var nheight = Math.floor(size.height * height);

    renderer.setViewport(nleft, nbottom, nwidth, nheight);
    renderer.setScissor(nleft, nbottom, nwidth, nheight);
    renderer.setScissorTest(false);
    renderer.render(scene, camera);
  }

  render() {
    this.cameraController.update();

    this.renderers["MainRenderer"].renderer.clear();
    for (const hook of this._renderHooks) {
      hook(this.camera, this.renderers["MainRenderer"].renderer);
    }
    // loop through renderers to render the scene
    this.renderers["LabelRenderer"].renderer.render(this.scene, this.camera);
    this.renderSceneInfo(
      this.scene,
      this.camera,
      this.sceneView.left,
      this.sceneView.bottom,
      this.sceneView.width,
      this.sceneView.height,
      this.renderers["MainRenderer"].renderer,
    );

    if (this.hud) {
      this.hud.render(this.camera);
    }

    this.cameraController.update();
  }

  exportImage(resolution = 2) {
    // Render the scene first if not already rendering
    // increasing the resolution significantly can cause the browser's canvas
    // to exceed the maximum allowable texture size
    // I set max resolution to 3, which works on my laptop
    resolution = Math.min(resolution, 3);
    const renderer = this.renderers["MainRenderer"].renderer;
    const originalPixelRatio = renderer.getPixelRatio();
    const highResPixelRatio = resolution; // Or higher for more resolution

    // Set renderer to high resolution
    renderer.setPixelRatio(highResPixelRatio);

    // Render the scene for high-res output
    this.render();

    const compositeCanvas = document.createElement("canvas");
    compositeCanvas.width = renderer.domElement.width;
    compositeCanvas.height = renderer.domElement.height;
    const compositeContext = compositeCanvas.getContext("2d");
    compositeContext.drawImage(renderer.domElement, 0, 0);
    this.drawLabelsToCanvas(
      compositeContext,
      compositeCanvas.width,
      compositeCanvas.height,
      highResPixelRatio,
    );
    // Get the image data URL
    var imgData = compositeCanvas.toDataURL("image/png");

    // Reset the pixel ratio to its original value
    renderer.setPixelRatio(originalPixelRatio);
    this.render();
    return imgData;
  }

  drawLabelsToCanvas(context, width, height, pixelRatio) {
    const labelObjects = [];
    this.scene.traverse((object) => {
      if (object && object.isCSS2DObject && object.element) {
        labelObjects.push(object);
      }
    });
    if (labelObjects.length === 0) {
      return;
    }

    this.scene.updateMatrixWorld(true);
    this.camera.updateMatrixWorld(true);

    const previousTextAlign = context.textAlign;
    const previousTextBaseline = context.textBaseline;
    context.textAlign = "center";
    context.textBaseline = "middle";

    const worldPosition = new THREE.Vector3();
    labelObjects.forEach((label) => {
      if (!label.visible) {
        return;
      }
      const element = label.element;
      const styles = window.getComputedStyle(element);
      if (
        styles.display === "none" ||
        styles.visibility === "hidden" ||
        styles.opacity === "0"
      ) {
        return;
      }

      label.getWorldPosition(worldPosition);
      worldPosition.project(this.camera);
      const x = (worldPosition.x * 0.5 + 0.5) * width;
      const y = (-worldPosition.y * 0.5 + 0.5) * height;

      const fontSize = parseFloat(styles.fontSize) || 14;
      const fontFamily = styles.fontFamily || "sans-serif";
      const fontWeight = styles.fontWeight || "normal";
      context.font = `${fontWeight} ${fontSize * pixelRatio}px ${fontFamily}`;
      context.fillStyle = styles.color || "#000";
      const text = element.textContent || "";
      if (text) {
        context.fillText(text, x, y);
      }
    });

    context.textAlign = previousTextAlign;
    context.textBaseline = previousTextBaseline;
  }

  downloadImage(filenmae = "atomistic-model.png") {
    // Create a link and set the URL as the href
    var imgData = this.exportImage();
    var link = document.createElement("a");
    link.href = imgData;
    link.download = filenmae;

    // Append the link to the document and trigger the download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async exportAnimation({
    format = "webm",
    fps = 12,
    startFrame = 0,
    endFrame = null,
    mimeType = null,
    resolution = 2,
    frameCount = null,
    setFrame = null,
    getFrame = null,
    isPlaying = null,
    pause = null,
    play = null,
  } = {}) {
    if (typeof MediaRecorder === "undefined") {
      throw new Error("MediaRecorder is not supported in this browser.");
    }
    if (!this.renderers || !this.renderers["MainRenderer"]) {
      throw new Error("Renderer is not initialized.");
    }
    if (!Number.isFinite(fps) || fps <= 0) {
      throw new Error("fps must be a positive number.");
    }
    if (!Number.isFinite(resolution) || resolution <= 0) {
      throw new Error("resolution must be a positive number.");
    }
    if (!Number.isFinite(frameCount) || frameCount <= 0) {
      throw new Error("frameCount must be a positive number.");
    }
    if (typeof setFrame !== "function") {
      throw new Error("setFrame callback is required for animation export.");
    }

    const renderer = this.renderers["MainRenderer"].renderer;
    const originalPixelRatio = renderer.getPixelRatio();
    const highResPixelRatio = Math.min(resolution, 3);
    const originalSize = renderer.getSize(new THREE.Vector2());
    renderer.setPixelRatio(highResPixelRatio);
    renderer.setSize(originalSize.x, originalSize.y, false);
    const canvas = renderer.domElement;
    if (!canvas.captureStream) {
      renderer.setPixelRatio(originalPixelRatio);
      renderer.setSize(originalSize.x, originalSize.y, false);
      throw new Error(
        "Canvas captureStream() is not supported in this browser.",
      );
    }

    const formatKey = String(format || "webm").toLowerCase();
    if (formatKey === "gif") {
      throw new Error(
        "GIF export is not supported without an external encoder. Use webm or mp4.",
      );
    }
    let supportedMimeTypes = this.getSupportedAnimationMimeTypes(
      formatKey,
      mimeType,
    );
    if (formatKey === "mp4" && !supportedMimeTypes) {
      supportedMimeTypes = this.getSupportedAnimationMimeTypes("webm");
      console.warn(
        "MP4 export is not supported in this browser. Falling back to WebM.",
      );
    }

    const start = Math.max(0, Math.min(startFrame, frameCount - 1));
    const end = Math.max(
      start,
      Math.min(endFrame ?? frameCount - 1, frameCount - 1),
    );

    const recorderOptions = supportedMimeTypes
      ? { mimeType: supportedMimeTypes }
      : undefined;
    const stream = canvas.captureStream(fps);
    const recorder = recorderOptions
      ? new MediaRecorder(stream, recorderOptions)
      : new MediaRecorder(stream);
    const chunks = [];

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    const previousFrame = typeof getFrame === "function" ? getFrame() : null;
    const wasPlaying = typeof isPlaying === "function" ? isPlaying() : false;
    if (wasPlaying && typeof pause === "function") {
      pause();
    }

    const frameDelay = 1000 / fps;
    try {
      if (typeof setFrame === "function") {
        setFrame(start);
      }
      await new Promise((resolve) => requestAnimationFrame(resolve));
      await new Promise((resolve) => requestAnimationFrame(resolve));

      recorder.start();
      for (let frame = start; frame <= end; frame += 1) {
        setFrame(frame);
        await new Promise((resolve) => setTimeout(resolve, frameDelay));
      }

      const recorderStopped = new Promise((resolve) => {
        recorder.onstop = resolve;
      });
      recorder.stop();
      await recorderStopped;
      stream.getTracks().forEach((track) => track.stop());
    } finally {
      renderer.setPixelRatio(originalPixelRatio);
      renderer.setSize(originalSize.x, originalSize.y, false);
      this.render();
    }

    if (previousFrame !== null && typeof setFrame === "function") {
      setFrame(previousFrame);
    }
    if (wasPlaying && typeof play === "function") {
      play();
    }

    const blobType = recorder.mimeType || supportedMimeTypes || "video/webm";
    return new Blob(chunks, { type: blobType });
  }

  async downloadAnimation({ filename = "trajectory.webm", ...options } = {}) {
    const blob = await this.exportAnimation(options);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  getSupportedAnimationMimeTypes(format, mimeType) {
    if (mimeType && MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }
    const formatKey = String(format || "webm").toLowerCase();
    if (formatKey === "gif") {
      return null;
    }
    const candidates =
      formatKey === "mp4"
        ? ["video/mp4;codecs=avc1.42E01E", "video/mp4"]
        : ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
    return (
      candidates.find((type) => MediaRecorder.isTypeSupported(type)) || null
    );
  }
}

function calculateBoundingBox(box, direction) {
  // project bounding box in the direction to get the size
  let size = new THREE.Vector3();

  // Create vectors to hold the min and max points of the projected bounding box
  let minProjected = new THREE.Vector3(Infinity, Infinity, Infinity);
  let maxProjected = new THREE.Vector3(-Infinity, -Infinity, -Infinity);

  // Create a matrix that will align the camera's direction with the Z axis
  let alignCameraMatrix = new THREE.Matrix4();
  alignCameraMatrix.lookAt(
    direction,
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 1, 0),
  );

  // For each corner of the bounding box
  box.corners = [
    new THREE.Vector3(box.min.x, box.min.y, box.min.z),
    new THREE.Vector3(box.min.x, box.min.y, box.max.z),
    new THREE.Vector3(box.min.x, box.max.y, box.min.z),
    new THREE.Vector3(box.min.x, box.max.y, box.max.z),
    new THREE.Vector3(box.max.x, box.min.y, box.min.z),
    new THREE.Vector3(box.max.x, box.min.y, box.max.z),
    new THREE.Vector3(box.max.x, box.max.y, box.min.z),
    new THREE.Vector3(box.max.x, box.max.y, box.max.z),
  ];

  box.corners.forEach((corner) => {
    // Transform the corner to align with the camera's perspective
    let projectedCorner = corner.clone().applyMatrix4(alignCameraMatrix);

    // Update the min and max projected points
    minProjected.x = Math.min(minProjected.x, projectedCorner.x);
    minProjected.y = Math.min(minProjected.y, projectedCorner.y);
    maxProjected.x = Math.max(maxProjected.x, projectedCorner.x);
    maxProjected.y = Math.max(maxProjected.y, projectedCorner.y);
    minProjected.z = Math.min(minProjected.z, projectedCorner.z);
    maxProjected.z = Math.max(maxProjected.z, projectedCorner.z);
  });

  size.x = maxProjected.x - minProjected.x;
  size.y = maxProjected.y - minProjected.y;
  size.z = maxProjected.z - minProjected.z;
  return size;
}
