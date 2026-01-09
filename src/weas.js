/*
The WEAS class should serve as the primary interface for users to interact with the package.
It manage the initialization of the Three.js scene and provide methods to interact with various functionalities like atoms viewing, adding mesh objects, and handling GUI interactions.
*/

import * as THREE from "three";
import { BlendJS } from "./core/blendjs.js";
import { GUIManager } from "./core/GUIManager.js";
import { EventHandlers } from "./core/EventHandlers.js";
import { SelectionManager } from "./core/SelectionManager.js";
import { ObjectManager } from "./core/ObjectManager.js";
import { OperationManager } from "./operation/operation.js";
import { InstancedMeshPrimitive } from "./plugins/InstancedMeshPrimitive.js";
import { AnyMesh } from "./plugins/AnyMesh.js";
import { TextManager } from "./plugins/TextManager.js";
import { AtomsViewer } from "./atoms/AtomsViewer.js";
import { Atoms } from "./atoms/atoms.js";
import { StateStore, cloneValue } from "./state/store.js";
import { createDefaultState } from "./state/defaultState.js";
import { fromWidgetSnapshot } from "./state/adapters.js";

class WEAS {
  constructor({ domElement, atoms = [new Atoms()], viewerConfig = {}, guiConfig = {} }) {
    this.uuid = THREE.MathUtils.generateUUID();
    // Initialize Three.js scene, camera, and renderer
    this.tjs = new BlendJS(domElement, this);
    this.tjs.weas = this;
    this.tjs.requestRedraw = this.requestRedraw.bind(this);
    this.guiManager = new GUIManager(this, guiConfig);
    this.eventHandlers = new EventHandlers(this);
    this.ops = new OperationManager(this);
    this.selectionManager = new SelectionManager(this);
    this.objectManager = new ObjectManager(this);
    this.state = new StateStore(createDefaultState());
    this.textManager = new TextManager(this);
    // Initialize AtomsViewer
    this.avr = new AtomsViewer({ weas: this, atoms: atoms, viewerConfig: viewerConfig });
    // Initialize other plugins
    this.instancedMeshPrimitive = new InstancedMeshPrimitive(this);
    this.anyMesh = new AnyMesh(this);
    this._initCameraStateSync();
    this.initialize();
  }

  initialize() {
    this.activeObject = null;
    this.render();
  }

  render() {
    // Render
    this.requestRedraw("render");
  }

  requestRedraw(kind = "render") {
    if (this.avr && typeof this.avr.requestRedraw === "function") {
      this.avr.requestRedraw(kind);
      return;
    }
    this.tjs.render();
  }

  _initCameraStateSync() {
    const controls = this.tjs.controls;
    if (!controls || typeof controls.addEventListener !== "function") {
      return;
    }
    const sync = () => {
      this.state.set({ camera: this._exportCameraState() });
    };
    controls.addEventListener("end", sync);
    sync();
  }

  clear() {
    this.reset();
  }

  reset() {
    this.tjs.scene.clear();
    this.state.reset(createDefaultState());
    if (this.avr) {
      this.avr.atoms = new Atoms();
    }
    this._applyCameraState(this.state.get("camera"));
  }

  async exportAnimation({ format = "webm", fps = 12, startFrame = 0, endFrame = null, mimeType = null } = {}) {
    if (!this.avr || !this.avr.trajectory || this.avr.trajectory.length === 0) {
      throw new Error("No trajectory data available for animation export.");
    }
    return this.tjs.exportAnimation({
      format,
      fps,
      startFrame,
      endFrame,
      mimeType,
      frameCount: this.avr.trajectory.length,
      setFrame: (frame) => {
        this.avr.currentFrame = frame;
      },
      getFrame: () => this.avr.currentFrame,
      isPlaying: () => this.avr.isPlaying,
      pause: () => this.avr.pause(),
      play: () => this.avr.play(),
    });
  }

  async downloadAnimation({ filename = "trajectory.webm", ...options } = {}) {
    if (!this.avr || !this.avr.trajectory || this.avr.trajectory.length === 0) {
      throw new Error("No trajectory data available for animation export.");
    }
    await this.tjs.downloadAnimation({
      filename,
      ...options,
      frameCount: this.avr.trajectory.length,
      setFrame: (frame) => {
        this.avr.currentFrame = frame;
      },
      getFrame: () => this.avr.currentFrame,
      isPlaying: () => this.avr.isPlaying,
      pause: () => this.avr.pause(),
      play: () => this.avr.play(),
    });
  }

  _buildAtomsFromSnapshot(payload) {
    if (!payload) {
      return null;
    }
    if (Array.isArray(payload)) {
      return payload.map((item) => new Atoms(item));
    }
    return new Atoms(payload);
  }

  _exportCameraState() {
    const camera = this.tjs.camera;
    const controls = this.tjs.controls;
    const position = camera?.position?.toArray?.() || null;
    const target = controls?.target?.toArray?.() || null;
    let direction = null;
    let distance = null;
    if (Array.isArray(position) && Array.isArray(target) && position.length === 3 && target.length === 3) {
      const dx = position[0] - target[0];
      const dy = position[1] - target[1];
      const dz = position[2] - target[2];
      distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (distance > 0) {
        direction = [dx / distance, dy / distance, dz / distance];
      }
    }
    return {
      type: this.tjs.cameraType,
      position,
      target,
      direction,
      distance,
      zoom: camera?.zoom,
      fov: camera?.fov,
    };
  }

  _applyCameraState(state) {
    if (!state || typeof state !== "object") {
      return;
    }
    if (state.type) {
      this.tjs.cameraType = state.type;
    }
    const hasDirection = Array.isArray(state.direction) && state.direction.length === 3;
    const hasTarget = Array.isArray(state.target) && state.target.length === 3;
    const hasDistance = typeof state.distance === "number";
    if (hasDirection || hasTarget || hasDistance) {
      this.tjs.updateCameraAndControls({
        lookAt: hasTarget ? state.target : null,
        direction: hasDirection ? state.direction : [0, 0, 1],
        distance: hasDistance ? state.distance : null,
        zoom: typeof state.zoom === "number" ? state.zoom : 1,
        fov: typeof state.fov === "number" ? state.fov : 50,
      });
      return;
    }
    const camera = this.tjs.camera;
    const controls = this.tjs.controls;
    if (Array.isArray(state.position) && state.position.length === 3) {
      camera.position.set(state.position[0], state.position[1], state.position[2]);
    }
    if (Array.isArray(state.target) && state.target.length === 3 && controls) {
      controls.target.set(state.target[0], state.target[1], state.target[2]);
      controls.update();
    }
    if (typeof state.zoom === "number") {
      if (typeof camera.updateZoom === "function") {
        camera.updateZoom(state.zoom);
      } else {
        camera.zoom = state.zoom;
        camera.updateProjectionMatrix();
      }
    }
    if (typeof state.fov === "number" && camera.isPerspectiveCamera) {
      camera.fov = state.fov;
      camera.updateProjectionMatrix();
    }
    camera.updateProjectionMatrix();
    this.requestRedraw("render");
  }

  exportState() {
    const atoms = Array.isArray(this.avr.trajectory) && this.avr.trajectory.length > 1 ? this.avr.trajectory.map((item) => item.toDict()) : this.avr.atoms.toDict();
    const state = cloneValue(this.state.get());
    const cameraState = this._exportCameraState();
    state.camera = cameraState;
    if (this.avr?.bondManager) {
      state.bond = {
        ...(state.bond || {}),
        hideLongBonds: this.avr.bondManager.hideLongBonds,
        showHydrogenBonds: this.avr.bondManager.showHydrogenBonds,
        showOutBoundaryBonds: this.avr.bondManager.showOutBoundaryBonds,
        settings: this.avr.bondManager.toPlainSettings(),
      };
    }
    if (state.plugins) {
      if (this.anyMesh) {
        state.plugins.anyMesh = { settings: cloneValue(this.anyMesh.settings || []) };
      }
      if (this.instancedMeshPrimitive) {
        state.plugins.instancedMeshPrimitive = { settings: cloneValue(this.instancedMeshPrimitive.settings || []) };
      }
    }
    return {
      version: "weas_state_v1",
      atoms,
      state,
      currentFrame: this.avr.currentFrame,
    };
  }

  importState(snapshot) {
    if (!snapshot || typeof snapshot !== "object") {
      throw new Error("Invalid snapshot payload.");
    }
    const normalized = snapshot.version === "weas_widget_state_v1" ? fromWidgetSnapshot(snapshot) : snapshot;
    const atoms = this._buildAtomsFromSnapshot(normalized.atoms);
    if (atoms) {
      this.avr.atoms = atoms;
    }
    if (normalized.state) {
      const mergedState = cloneValue(normalized.state);
      if (normalized.camera && !mergedState.camera) {
        mergedState.camera = cloneValue(normalized.camera);
      }
      this.state.transaction(() => {
        this.state.set(mergedState);
      });
    }
    const cameraState = normalized.state?.camera || normalized.camera || {};
    this._applyCameraState(cameraState);
    const animationState = normalized.state?.animation;
    if (animationState) {
      if (typeof animationState.frameDuration === "number") {
        this.avr.frameDuration = animationState.frameDuration;
      }
      if (typeof animationState.currentFrame === "number") {
        this.avr.currentFrame = animationState.currentFrame;
      }
      if (animationState.isPlaying) {
        this.avr.play();
      } else {
        this.avr.pause();
      }
    }
    if (typeof normalized.currentFrame === "number") {
      this.avr.currentFrame = normalized.currentFrame;
    }
  }
}

export { WEAS };
