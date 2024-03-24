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
    this.initialize();
  }

  initialize() {
    this.activeObject = null;
    this.render();
  }

  render() {
    // Render loop
    const frameDuration = 100; // Duration in milliseconds between frames

    const animate = () => {
      requestAnimationFrame(animate);

      this.tjs.controls.update();
      this.avr.animate();

      Object.values(this.tjs.renderers).forEach((rndr) => {
        rndr.renderer.render(this.tjs.scene, this.tjs.camera);
      });
    };

    animate();
  }

  clear() {
    this.tjs.scene.clear();
  }
}

export { WEAS };
