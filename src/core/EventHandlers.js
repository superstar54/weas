import * as THREE from "three";
import { TransformControls } from "../controls/TransformControls";

/*
Object mode:
- "edit": select vertex
- "object": select objects
*/

/**
 * Central input and interaction controller for the 3D viewer.
 *
 * Responsibilities:
 * - Mouse interaction (selection, lasso, dragging)
 * - Keyboard shortcuts and keybind routing
 * - TransformControls integration (translate / rotate / scale)
 * - SelectionManager interaction
 * - Dispatching viewer-wide events
 *
 * Acts as the main bridge between UI input and engine operations.
 *
 * @class
 */
class EventHandlers {
  /**
   * Mapping of named actions to engine operations.
   * These are triggered via keybind configuration.
   *
   * @type {Object<string, Function>}
   */
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
    TranslateOperation: () =>
      this.transformControls.enterMode("translate", this.currentMousePosition),
    ScaleOperation: () =>
      this.transformControls.enterMode("scale", this.currentMousePosition),
    RotateOperation: () =>
      this.transformControls.enterMode("rotate", this.currentMousePosition),
    CopyOperation: () => {
      this.weas.ops.object.CopyOperation();
      this.transformControls.enterMode("translate", this.currentMousePosition);
    },
    ReplaceOperation: () => this.weas.ops.atoms.ReplaceOperation(),
    measure: () =>
      this.weas.avr.Measurement.measure(this.weas.avr.selectedAtomsIndices),

    camera1: () => this.weas.tjs.cameraController.view("top"),
    camera3: () => this.weas.tjs.cameraController.view("front"),
    camera2: () => this.weas.tjs.cameraController.view("left"),
    camera4: () => this.weas.tjs.cameraController.view("bottom"),
    camera5: () => this.weas.tjs.cameraController.view("right"),
    camera6: () => this.weas.tjs.cameraController.view("back"),
  };

  /**
   * @param {Object} weas
   */
  constructor(weas) {
    this.weas = weas;
    this.tjs = weas.tjs;
    this.init();
    this.transformControls = new TransformControls(weas, this);
    this.setupEventListeners();
    this._registerKeybinds();
  }

  _registerKeybinds() {
    const km = this.weas.keybindManager;
    if (!km) return;

    km.beforeDispatch = (event) => this.handleTransformModeKeys(event);

    const config = km.getConfig();
    for (const [action, handler] of Object.entries(this.actionMap)) {
      km.register(action, handler, config[action] || null);
    }
  }

  /**
   * Initializes internal mouse and interaction state.
   * @private
   */
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

  /**
   * Registers DOM event listeners for pointer, keyboard, and click input.
   * @private
   */
  setupEventListeners() {
    const container = this.weas.tjs.containerElement;

    container.addEventListener(
      "pointerdown",
      this.onMouseDown.bind(this),
      false,
    );
    container.addEventListener("pointerup", this.onMouseUp.bind(this), false);
    container.addEventListener("click", this.onMouseClick.bind(this), false);
    container.addEventListener("mousemove", this.onMouseMove.bind(this), false);
    container.setAttribute("tabindex", "0");
  }

  /**
   * Pointer down handler (selection start / lasso start).
   * @param {PointerEvent} event
   */
  onMouseDown(event) {
    // Implement the logic for mouse down events
    this.isMouseDown = true;
    this.mouseDownPosition.set(event.clientX, event.clientY);
    if (
      event.shiftKey &&
      event.altKey &&
      this.transformControls.mode === null
    ) {
      this.weas.selectionManager.startLasso(event);
    }
  }

  /**
   * Pointer up handler (finalizes drag/lasso operations).
   * @param {PointerEvent} event
   */
  onMouseUp(event) {
    // Implement the logic for mouse up events
    this.isMouseDown = false;
    this.isDragging = false;
    this.mouseUpPosition.set(event.clientX, event.clientY);
    this.weas.selectionManager.finishLasso();
  }

  /**
   * Pointer move handler (selection, transform updates, lasso updates).
   * @param {PointerEvent} event
   */
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
      if (
        (this.transformControls.mode === "rotate" ||
          this.transformControls.mode === "translate") &&
        this.weas.selectionManager.isAxisPicking
      ) {
        return;
      }
      this.transformControls.onMouseMove(event);
    } else if (this.isMouseDown && event.shiftKey && event.altKey) {
      this.weas.selectionManager.dragLasso(event);
    } else if (this.isMouseDown && event.shiftKey) {
      this.weas.selectionManager.dragSelection(event);
    }
  }

  /**
   * Handles transform-mode-specific key interactions (X/Y/Z locking, axis picking).
   *
   * @param {KeyboardEvent} event
   * @returns {boolean} whether event was handled
   */
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

  /**
   * Click handler for selection confirmation and transform finalization.
   * @param {PointerEvent} event
   */
  onMouseClick(event) {
    // Handle mouse click to confirm the operation and exit the current transform mode.
    if (
      this.transformControls.mode === "rotate" &&
      this.weas.selectionManager.isAxisPicking
    ) {
      this.weas.selectionManager.pickAxisAtom(event);
      this.transformControls.refreshRotationPivot();
      this.transformControls.initialMousePosition =
        this.currentMousePosition.clone();
      return;
    }
    if (
      this.transformControls.mode === "translate" &&
      this.weas.selectionManager.isAxisPicking
    ) {
      this.weas.selectionManager.pickAxisAtom(event);
      return;
    }
    if (
      this.transformControls.mode === "translate" &&
      this.transformControls.translatePlanePending
    ) {
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

  /**
   * Dispatch event after atom data changes.
   * Used to synchronize external listeners.
   */
  dispatchAtomsUpdated() {
    //Every time the atoms are updated, a new UUID is generated, and the event is dispatched
    // Later we can compare the UUIDs to check if the atoms are the same or not
    this.weas.avr.trajectory.uuid = THREE.MathUtils.generateUUID();
    const event = new CustomEvent("atomsUpdated", {
      detail: this.weas.avr.trajectory,
    });
    this.tjs.containerElement.dispatchEvent(event);
  }

  /**
   * Dispatch event when viewer state updates.
   *
   * @param {any} data
   */
  dispatchViewerUpdated(data) {
    // create a list of picked atoms from the selectedAtomsIndices set
    const event = new CustomEvent("viewerUpdated", { detail: data });
    this.tjs.containerElement.dispatchEvent(event);
  }
}

export { EventHandlers };
