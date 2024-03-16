import { GUI } from "dat.gui";
import { OperationSearchManager } from "./OperationSearch.js";
import * as transform from "./transform.js";
import * as object from "./object.js";
import * as mesh from "./mesh.js";
import * as atoms from "./atoms.js";
import * as selection from "./selection.js";

// Organize them under namespaces
export const ops = {
  object: object,
  transform: transform,
  mesh: mesh,
  atoms: atoms,
  selection: selection,
};

export class OperationManager {
  constructor(weas) {
    this.weas = weas;
    this.operationSearchManager = new OperationSearchManager(weas, ops);
    this.undoStack = [];
    this.redoStack = [];
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
        this[category][operationName] = (args = {}) => {
          // Instantiate the operation with its arguments and execute it
          args.weas = this.weas;
          const operation = new ops[category][operationName](args);
          this.execute(operation);
        };
      }
    }
  }

  execute(operation, execute = true) {
    /* Execute the operation and add it to the undo stack.
    * If execute is false, the operation will not be executed, only added to the undo stack.
    This is useful for the operation that being executed by multiple steps, like the transform operation by mouse move.
    */
    if (execute) {
      operation.execute();
    }
    this.undoStack.push(operation);
    this.redoStack = []; // Clear redo stack on new operation
    this.updateAdjustLastOperationGUI();
    this.weas.eventHandlers.dispatchAtomsUpdated();
  }

  undo() {
    console.log("undo");
    console.log("undoStack: ", this.undoStack);
    if (this.undoStack.length > 0) {
      const operation = this.undoStack.pop();
      operation.undo();
      this.redoStack.push(operation);
      this.weas.eventHandlers.dispatchAtomsUpdated();
    }
  }

  redo() {
    console.log("redo");
    console.log("redoStack: ", this.redoStack);
    if (this.redoStack.length > 0) {
      const operation = this.redoStack.pop();
      operation.redo();
      this.undoStack.push(operation);
      this.updateAdjustLastOperationGUI();
      this.weas.eventHandlers.dispatchAtomsUpdated();
    }
  }

  createGUIContainer() {
    const guiContainer = document.createElement("div");
    Object.assign(guiContainer.style, {
      position: "absolute",
      bottom: "30px",
      left: "10px",
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

  hideGUI() {
    this.guiContainer.style.display = "none";
  }

  updateAdjustLastOperationGUI() {
    // Ensure the GUI container is shown when there are operations to adjust
    if (this.undoStack.length > 0) {
      this.guiContainer.style.display = "block";
      const lastOperation = this.undoStack[this.undoStack.length - 1];

      // Clear the existing GUI controls
      while (this.adjustLastOpFolder.__controllers.length > 0) {
        this.adjustLastOpFolder.remove(this.adjustLastOpFolder.__controllers[0]);
      }

      // Call the operation's setupGUI method if it exists
      if (typeof lastOperation.setupGUI === "function") {
        lastOperation.setupGUI(this.adjustLastOpFolder);
      }
    } else {
      // Hide the GUI container if there are no operations
      this.guiContainer.style.display = "none";
    }
  }
}
