import * as THREE from "three";
import { TransformControls } from "../controls/TransformControls";
import { defaultKeyBindConfig } from "../config";

/*
Object mode:
- "edit": select vertex
- "object": select objects
*/


// pattern to determine if a keycombo is being pressed
function matchKey(event, combo) {
  const key = combo[combo.length - 1];
  const modifiers = combo.slice(0, -1); 
  // Check main key
  if (event.key.toLowerCase() !== key.toLowerCase()) return false;

  // Check modifiers
  const ctrl = modifiers.includes("ctrl");
  const shift = modifiers.includes("shift");
  const alt = modifiers.includes("alt");
  const meta = modifiers.includes("meta");

  if (ctrl !== event.ctrlKey) return false;
  if (shift !== event.shiftKey) return false;
  if (alt !== event.altKey) return false;
  if (meta !== event.metaKey) return false;
  return true;
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
      enterObjectMode: () => {this.weas.objectManager.enterMode("object");
      },
      enterEditMode: () => {this.weas.objectManager.enterMode("edit");
      },
      TranslateOperation: () =>
        this.transformControls.enterMode(
          "translate",
          this.currentMousePosition,
        ),
      ScaleOperation: () =>
        this.transformControls.enterMode("scale", this.currentMousePosition),
      RotateOperation: () =>
        this.transformControls.enterMode("rotate", this.currentMousePosition),
      CopyOperation: () => {
        this.weas.ops.object.CopyOperation();
        this.transformControls.enterMode(
          "translate",
          this.currentMousePosition,
        );
      },      
      ReplaceOperation: () => this.weas.ops.atoms.ReplaceOperation(),
      measure: () =>
        this.weas.avr.Measurement.measure(this.weas.avr.selectedAtomsIndices),
      camera1: () =>
        this.weas.tjs.updateCameraAndControls({ direction: [0, -100, 0] }),
      camera2: () =>
        this.weas.tjs.updateCameraAndControls({ direction: [-100, 0, 0] }),
      camera3: () =>
        this.weas.tjs.updateCameraAndControls({ direction: [0, 0, 100] }),
      camera4: () =>
        this.weas.tjs.updateCameraAndControls({ direction: [0, 100, 0] }),
      camera5: () =>
        this.weas.tjs.updateCameraAndControls({ direction: [100, 0, 0] }),
      camera6: () =>
        this.weas.tjs.updateCameraAndControls({ direction: [0, 0, -100] }),

    };

  constructor(weas) {
    this.weas = weas;
    this.tjs = weas.tjs;
    this.init();
    this.transformControls = new TransformControls(weas, this);
    this.setupEventListeners();
    this.keybindConfig = weas.keybindConfig || defaultKeyBindConfig
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
      if ((this.transformControls.mode === "rotate" || this.transformControls.mode === "translate") && this.weas.selectionManager.isAxisPicking) {
        return;
      }
      this.transformControls.onMouseMove(event);
    } else if (this.isMouseDown && event.shiftKey && event.altKey) {
      this.weas.selectionManager.dragLasso(event);
    } else if (this.isMouseDown && event.shiftKey) {
      this.weas.selectionManager.dragSelection(event);
    }
  }

  handleTransformModeKeys(event) {
    const key = event.key.toLowerCase();

    if (this.transformControls.mode === "translate") {
      if (["x", "y", "z"].includes(key)) {
        this.transformControls.setTranslateAxisLock(
          this.transformControls.translateAxisLock === key ? null : key,
        );
        return true;
      }
      if (["p", "n"].includes(key)) {
        this.transformControls.setTranslatePlaneConstraint(
          key === "p" ? "plane" : "normal",
        );
        this.transformControls.initialMousePosition =
          this.currentMousePosition.clone();
        return true;
      }
      if (key === "a") {
        if (this.weas.selectionManager.isAxisPicking) {
          this.weas.selectionManager.stopAxisPicking(
            "Translate mode: move mouse to translate, press A to set axis, X/Y/Z to lock",
          );
          if (this.weas.selectionManager.axisAtomIndices.length === 3) {
            this.transformControls.setTranslatePlaneFromAtoms();
          } else if (this.weas.selectionManager.axisAtomIndices.length === 2) {
            this.transformControls.setTranslateAxisFromAtoms();
          }
          this.transformControls.initialMousePosition =
            this.currentMousePosition.clone();
        } else {
          this.transformControls.setTranslateAxisLock(null);
          this.weas.selectionManager.hideTranslatePlane();
          this.weas.selectionManager.startAxisPicking("translate");
          this.weas.selectionManager.setModeHint(
            "Axis pick: click 2 or 3 atoms, press A to exit",
          );
        }
        return true;
      }
    }

    if (this.transformControls.mode === "rotate") {
      if (["x", "y", "z"].includes(key)) {
        this.transformControls.setRotateAxisLock(
          this.transformControls.rotationAxisLockKey === key ? null : key,
        );
        return true;
      }
      if (key === "a") {
        if (this.weas.selectionManager.isAxisPicking) {
          this.weas.selectionManager.stopAxisPicking();
          this.transformControls.refreshRotationPivot();
          this.transformControls.initialMousePosition =
            this.currentMousePosition.clone();
        } else {
          this.weas.selectionManager.startAxisPicking("rotate");
        }
        return true;
      }
    }

    return false;
  }

  onKeyDown(event) {
    if (this.handleTransformModeKeys(event)) return;

    for (const [action, combos] of Object.entries(this.keybindConfig)) {
      if (combos.some((combo) => matchKey(event, combo))) {
        const fn = this.actionMap[action];
        if (fn) fn();
        return;
      }
    }
  }

  onMouseClick(event) {
    // Handle mouse click to confirm the operation and exit the current transform mode.
    if (this.transformControls.mode === "rotate" && this.weas.selectionManager.isAxisPicking) {
      this.weas.selectionManager.pickAxisAtom(event);
      this.transformControls.refreshRotationPivot();
      this.transformControls.initialMousePosition = this.currentMousePosition.clone();
      return;
    }
    if (this.transformControls.mode === "translate" && this.weas.selectionManager.isAxisPicking) {
      this.weas.selectionManager.pickAxisAtom(event);
      return;
    }
    if (this.transformControls.mode === "translate" && this.transformControls.translatePlanePending) {
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
