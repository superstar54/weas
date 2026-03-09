/*
The WEAS class should serve as the primary interface for users to interact with the package.
It manage the initialization of the Three scene and provide methods to interact with various functionalities like atoms viewing, adding mesh objects, and handling GUI interactions.
*/

import * as THREE from "three";
import { BlendJS } from "./core/blendjs";
import { GUIManager } from "./core/GUIManager";
import { EventHandlers } from "./core/EventHandlers";
import { SelectionManager } from "./core/SelectionManager";
import { ObjectManager } from "./core/ObjectManager";
import { OperationManager } from "./operation/operation";
import { InstancedMeshPrimitive } from "./plugins/InstancedMeshPrimitive";
import { AnyMesh } from "./plugins/AnyMesh";
import { TextManager } from "./plugins/TextManager";
import { AtomsViewer } from "./atoms/AtomsViewer";
import { Atoms } from "./atoms/atoms";
import { StateStore, cloneValue } from "./state/store";
import { createDefaultState } from "./state/defaultState";
import { fromWidgetSnapshot } from "./state/adapters";

import MaterialsRegistry from "./core/MaterialsRegistry";
import ShapeRegistry from "./core/ShapeRegistry";

class WEAS {
  constructor({
    domElement,
    atoms = [new Atoms()],
    viewerConfig = {},
    guiConfig = {},
    tjsConfig = null,
    keybindConfig = null,
  }) {
    this.uuid = THREE.MathUtils.generateUUID();
    // Initialize Three scene, camera, and renderer
    this.tjsConfig = tjsConfig;
    this.tjs = new BlendJS(domElement, this);
    this.keybindConfig = keybindConfig;

    // initialise base materials with the MaterialRegistry
    this.materialsRegistry = new MaterialsRegistry();
    // initialise shapes using these materials
    this.shapeRegistry = new ShapeRegistry(this.materialsRegistry);

    this.tjs.requestRedraw = this.requestRedraw.bind(this);
    this.guiManager = new GUIManager(this, guiConfig);
    this.eventHandlers = new EventHandlers(this);
    this.ops = new OperationManager(this);
    this.selectionManager = new SelectionManager(this);
    this.objectManager = new ObjectManager(this);
    this.state = new StateStore(createDefaultState());
    this.textManager = new TextManager(this);
    // Initialize AtomsViewer
    this.avr = new AtomsViewer({
      weas: this,
      atoms: atoms,
      viewerConfig: viewerConfig,
    });
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
  }

  async exportAnimation({
    format = "webm",
    fps = 12,
    startFrame = 0,
    endFrame = null,
    mimeType = null,
  } = {}) {
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
    if (
      Array.isArray(position) &&
      Array.isArray(target) &&
      position.length === 3 &&
      target.length === 3
    ) {
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


  exportState() {
    const atoms =
      Array.isArray(this.avr.trajectory) && this.avr.trajectory.length > 1
        ? this.avr.trajectory.map((item) => item.toDict())
        : this.avr.atoms.toDict();
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
        state.plugins.anyMesh = {
          settings: cloneValue(this.anyMesh.settings || []),
        };
      }
      if (this.instancedMeshPrimitive) {
        state.plugins.instancedMeshPrimitive = {
          settings: cloneValue(this.instancedMeshPrimitive.settings || []),
        };
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
    const normalized =
      snapshot.version === "weas_widget_state_v1"
        ? fromWidgetSnapshot(snapshot)
        : snapshot;
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
