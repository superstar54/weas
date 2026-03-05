import { GUI } from "dat.gui";
import { OperationSearchManager } from "./OperationSearch";
import * as transform from "./transform";
import * as object from "./object";
import * as atoms from "./atoms";
import * as selection from "./selection";
import * as viewer from "./viewer";
import * as settings from "./settings";

import { ShapeOperation } from "./shape";

// Organize them under namespaces
export const ops = {
  object: object,
  transform: transform,
  atoms: atoms,
  selection: selection,
  viewer: viewer,
  settings: settings,
  Shapes: {
    ShapeOperation,
  },
};

export class OperationManager {
  constructor(weas) {
    this.weas = weas;
    this.operationSearchManager = new OperationSearchManager(weas, ops);
    this.undoStack = [];
    this.redoStack = [];
    this.isRestoring = false;
    this.gui = new GUI();
    this.gui.closed = false; // Set the GUI to be closed by default
    this.createGUIContainer();
    this.generateOperator();
  }

  generateOperator() {
    // Iterate over each category in the ops object
    for (const category in ops) {
      this[category] = {}; // Initialize category within the class instance

      // Iterate over each operation within the category
      for (const operationName in ops[category]) {
        // Dynamically create a function for each operation

        //
        this[category][operationName] = (args = {}) => {
          if (category === "Shapes") {
            const { shapeName, options } = args;
            const operation = new ops[category][operationName](
              this.weas,
              shapeName,
              options,
            );
            this.execute(operation);
          } else {
            // Instantiate the operation with its arguments and execute it
            args.weas = this.weas;
            const operation = new ops[category][operationName](args);
            this.execute(operation);
          }
        };
      }
    }
  }

  execute(operation, execute = true) {
    /* Execute the operation and add it to the undo stack.
    * If execute is false, the operation will not be executed, only added to the undo stack.
    This is useful for the operation that being executed by multiple steps, like the transform operation by mouse move.
    */
    if (this.isRestoring) {
      return;
    }
    if (execute) {
      operation.execute();
    }
    this.undoStack.push(operation);
    this.redoStack = []; // Clear redo stack on new operation
    this.updateAdjustLastOperationGUI();
    if (operation.affectsAtoms !== false) {
      this.weas.eventHandlers.dispatchAtomsUpdated();
    }
  }

  undo() {
    if (this.undoStack.length > 0) {
      const operation = this.undoStack.pop();
      this.isRestoring = true;
      operation.undo();
      this.endRestoreSoon();
      this.redoStack.push(operation);
      if (operation.affectsAtoms !== false) {
        this.weas.eventHandlers.dispatchAtomsUpdated();
      }
    }
  }

  redo() {
    if (this.redoStack.length > 0) {
      const operation = this.redoStack.pop();
      this.isRestoring = true;
      operation.redo();
      this.endRestoreSoon();
      this.undoStack.push(operation);
      this.updateAdjustLastOperationGUI();
      if (operation.affectsAtoms !== false) {
        this.weas.eventHandlers.dispatchAtomsUpdated();
      }
    }
  }

  endRestoreSoon() {
    // Keep isRestoring true across queued UI callbacks triggered by undo/redo.
    // This prevents those callbacks from recording new operations during restore.
    if (typeof queueMicrotask === "function") {
      queueMicrotask(() => {
        this.isRestoring = false;
      });
    } else {
      setTimeout(() => {
        this.isRestoring = false;
      }, 0);
    }
  }

  createGUIContainer() {
    const guiContainer = document.createElement("div");
    Object.assign(guiContainer.style, {
      position: "absolute",
      bottom: "30px",
      right: "10px",
      display: "none", // Hide by default
    });
    this.weas.tjs.containerElement.appendChild(guiContainer);
    guiContainer.appendChild(this.gui.domElement);
    this.preventEventPropagation(guiContainer);
    this.guiContainer = guiContainer;

    this.adjustLastOpFolder = this.gui.addFolder("Adjust Last Operation");
    this.adjustLastOpFolder.open();
  }

  preventEventPropagation(element) {
    const stopPropagation = (e) => e.stopPropagation();
    ["click", "keydown", "keyup", "keypress"].forEach((eventType) => {
      element.addEventListener(eventType, stopPropagation, false);
    });
  }

  onOperationAdjusted(operation) {
    // If the last operation is adjusted, redo history is no longer valid.
    const last = this.undoStack[this.undoStack.length - 1];
    if (last === operation) {
      this.redoStack = [];
      this.updateAdjustLastOperationGUI();
    }
  }

  hideGUI() {
    this.guiContainer.style.display = "none";
  }

  updateAdjustLastOperationGUI() {
    const lastOperation = this.undoStack[this.undoStack.length - 1];
    if (!lastOperation || !lastOperation.supportsAdjustGUI?.()) {
      this.guiContainer.style.display = "none";
      return;
    }

    this.guiContainer.style.display = "block";

    // Only rebuild if last operation changed
    if (this.lastAdjustedOperation !== lastOperation) {
      this.lastAdjustedOperation = lastOperation;

      // Clear previous GUI
      Object.values(this.adjustLastOpFolder.__controllers).forEach((c) =>
        this.adjustLastOpFolder.remove(c),
      );
      Object.values(this.adjustLastOpFolder.__folders).forEach((f) =>
        this.adjustLastOpFolder.removeFolder(f),
      );

      // Setup GUI for the new operation
      lastOperation.setupGUI(this.adjustLastOpFolder);
    }

    // Live update: call some method on the operation to refresh GUI values
    if (typeof lastOperation.refreshGUIValues === "function") {
      lastOperation.refreshGUIValues();
    }
  }
}
