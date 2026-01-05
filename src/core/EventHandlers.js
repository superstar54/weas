/*
Object mode:
- "edit": select vertex
- "object": select objects
*/

import * as THREE from "three";
import { TransformControls } from "../controls/TransformControls.js";

class EventHandlers {
  constructor(weas) {
    this.weas = weas;
    this.tjs = weas.tjs;
    this.init();
    this.transformControls = new TransformControls(weas, this);
    this.setupEventListeners();
  }

  init() {
    // Add mouse state tracking
    this.isMouseDown = false;
    this.mouseDownPosition = new THREE.Vector2();
    this.mouseUpPosition = new THREE.Vector2();
    this.currentMousePosition = new THREE.Vector2();
    this.previousMousePosition = new THREE.Vector2();
    this.boxselect = false;
    this.dragMode = null; // 'move' or 'rotate'
    this.isDragging = false;
  }

  setupEventListeners() {
    const container = this.weas.tjs.containerElement;

    container.addEventListener("pointerdown", this.onMouseDown.bind(this), false);
    container.addEventListener("pointerup", this.onMouseUp.bind(this), false);
    container.addEventListener("click", this.onMouseClick.bind(this), false);
    container.addEventListener("mousemove", this.onMouseMove.bind(this), false);
    container.setAttribute("tabindex", "0"); // '0' means it can be focused
    container.addEventListener("keydown", this.onKeyDown.bind(this), false);
  }

  onMouseDown(event) {
    // Implement the logic for mouse down events
    this.isMouseDown = true;
    this.mouseDownPosition.set(event.clientX, event.clientY);
    if (event.shiftKey && event.altKey && this.transformControls.mode === null) {
      this.weas.selectionManager.startLasso(event);
    }
  }

  onMouseUp(event) {
    // Implement the logic for mouse up events
    this.isMouseDown = false;
    this.isDragging = false;
    this.mouseUpPosition.set(event.clientX, event.clientY);
    this.weas.selectionManager.finishLasso();
  }

  onMouseMove(event) {
    // Implement the logic for mouse move events
    this.previousMousePosition.copy(this.currentMousePosition);
    this.currentMousePosition.set(event.clientX, event.clientY);
    // check if the mouse is dragging
    if (this.isMouseDown) {
      // calculate the distance the mouse moved
      const dx = event.clientX - this.mouseDownPosition.x;
      const dy = event.clientY - this.mouseDownPosition.y;
      const distanceMoved = Math.sqrt(dx * dx + dy * dy);
      if (distanceMoved > 5) {
        // customize the threshold as needed)
        this.isDragging = true;
      }
    }

    if (this.transformControls.mode !== null) {
      if (this.transformControls.mode === "rotate" && this.weas.selectionManager.isAxisPicking) {
        return;
      }
      this.transformControls.onMouseMove(event);
    } else if (this.isMouseDown && event.shiftKey && event.altKey) {
      this.weas.selectionManager.dragLasso(event);
    } else if (this.isMouseDown && event.shiftKey) {
      this.weas.selectionManager.dragSelection(event);
    }
  }

  onKeyDown(event) {
    // Implement the logic for key down events
    if (this.transformControls.mode === "rotate" && event.key === "a") {
      this.weas.selectionManager.startAxisPicking();
      return;
    }
    if (event.ctrlKey || event.metaKey) {
      // metaKey is for MacOS
      switch (event.key) {
        case "z":
          this.weas.ops.undo();
          break;
        case "y":
          this.weas.ops.redo();
          break;
      }
    } else {
      switch (event.key) {
        case "Delete":
        case "x":
          this.weas.ops.object.DeleteOperation();
          break;
        case "Escape":
          this.transformControls.exitMode();
          break;
        case "o":
          this.weas.objectManager.enterMode("object");
          break;
        case "e":
          this.weas.objectManager.enterMode("edit");
          break;
        case "g":
          this.transformControls.enterMode("translate", this.currentMousePosition);
          break;
        case "s":
          this.transformControls.enterMode("scale", this.currentMousePosition);
          break;
        case "r":
          this.transformControls.enterMode("rotate", this.currentMousePosition);
          break;
        case "d":
          this.weas.ops.object.CopyOperation();
          this.transformControls.enterMode("translate", this.currentMousePosition);
          break;
        case "c":
          this.weas.ops.atoms.ReplaceOperation();
          break;
        case "1":
          this.weas.tjs.updateCameraAndControls({ direction: [0, -100, 0] });
          break;
        case "2":
          this.weas.tjs.updateCameraAndControls({ direction: [-100, 0, 0] });
          break;
        case "3":
          this.weas.tjs.updateCameraAndControls({ direction: [0, 0, 100] });
          break;
        case "4":
          this.weas.tjs.updateCameraAndControls({ direction: [0, 100, 0] });
          break;
        case "5":
          this.weas.tjs.updateCameraAndControls({ direction: [100, 0, 0] });
          break;
        case "6":
          this.weas.tjs.updateCameraAndControls({ direction: [0, 0, -100] });
          break;
        case "F9":
          this.weas.ops.updateAdjustLastOperationGUI();
          break;
        // In jupyter notebook, the F9 key is not available
        case "l":
          this.weas.ops.updateAdjustLastOperationGUI();
          break;
        case "m":
          // measure the distance, angle, or dihedral angle between atoms
          this.weas.avr.Measurement.measure(this.weas.avr.selectedAtomsIndices);
          break;
      }
    }
  }

  onMouseClick(event) {
    // Handle mouse click to confirm the operation and exit the current transform mode.
    if (this.transformControls.mode === "rotate" && this.weas.selectionManager.isAxisPicking) {
      const picked = this.weas.selectionManager.pickAxisAtom(event);
      if (picked && this.weas.selectionManager.axisAtomIndices.length === 2) {
        this.transformControls.refreshRotationPivot();
        this.transformControls.initialMousePosition = this.currentMousePosition.clone();
      }
      return;
    }
    if (this.transformControls.mode) {
      this.transformControls.confirmOperation();
      return;
    }
    // hdie the operation last operation GUI
    this.weas.ops.hideGUI();
    const dx = event.clientX - this.mouseDownPosition.x;
    const dy = event.clientY - this.mouseDownPosition.y;
    const distanceMoved = Math.sqrt(dx * dx + dy * dy);
    if (distanceMoved > 5) {
      return; // Ignore clicks that involve dragging
    }
    this.weas.selectionManager.pickSelection(event);
  }

  // Call this method after updating atoms
  dispatchAtomsUpdated() {
    //Every time the atoms are updated, a new UUID is generated, and the event is dispatched
    // Later we can compare the UUIDs to check if the atoms are the same or not
    this.weas.avr.trajectory.uuid = THREE.MathUtils.generateUUID();
    const event = new CustomEvent("atomsUpdated", { detail: this.weas.avr.trajectory });
    this.tjs.containerElement.dispatchEvent(event);
  }

  // Call this method after updating atoms
  dispatchViewerUpdated(data) {
    // create a list of picked atoms from the selectedAtomsIndices set
    const event = new CustomEvent("viewerUpdated", { detail: data });
    this.tjs.containerElement.dispatchEvent(event);
  }
}

export { EventHandlers };
