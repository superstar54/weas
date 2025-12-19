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
import { AtomsViewer } from "./atoms/AtomsViewer.js";
import { Atoms } from "./atoms/atoms.js";

class WEAS {
  constructor({ domElement, atoms = [new Atoms()], viewerConfig = {}, guiConfig = {} }) {
    this.uuid = THREE.MathUtils.generateUUID();
    // Initialize Three.js scene, camera, and renderer
    this.tjs = new BlendJS(domElement);
    this.guiManager = new GUIManager(this, guiConfig);
    this.eventHandlers = new EventHandlers(this);
    this.ops = new OperationManager(this);
    this.selectionManager = new SelectionManager(this);
    this.objectManager = new ObjectManager(this);
    // Initialize AtomsViewer
    this.avr = new AtomsViewer({ weas: this, atoms: atoms, viewerConfig: viewerConfig });
    // Initialize other plugins
    this.instancedMeshPrimitive = new InstancedMeshPrimitive(this);
    this.anyMesh = new AnyMesh(this);
    this.initialize();
  }

  initialize() {
    this.activeObject = null;
    this.render();
  }

  render() {
    // Render
    this.tjs.render();
  }

  clear() {
    this.tjs.scene.clear();
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
}

export { WEAS };
