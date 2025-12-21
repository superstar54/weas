import { BaseOperation } from "./baseOperation.js";
import { clearObject } from "../utils.js";

class DeleteOperation extends BaseOperation {
  static description = "Delete";
  static category = "Edit";
  static ui = {
    title: "Delete",
    fields: {},
  };

  constructor({ weas, indices = null }) {
    super(weas);
    this.indices = indices ? indices : Array.from(this.weas.avr.selectedAtomsIndices);
    this.initialAtoms = weas.avr.atoms.copy();
    // Capture the state of the selected objects
    this.initialObjectsState = this.weas.selectionManager.selectedObjects.map((object) => ({
      object: object.clone(),
      parent: object.parent, // Keep track of the parent to reattach the object correctly
    }));
  }

  execute() {
    if (this.indices.length > 0) {
      this.weas.avr.deleteSelectedAtoms({ indices: this.indices });
    }
    this.weas.objectManager.deleteSelectedObjects();
  }

  undo() {
    if (this.indices.length > 0) {
      this.weas.avr.atoms = this.initialAtoms.copy();
    }
    // Restore the deleted objects
    const selectedObjects = [];
    this.initialObjectsState.forEach(({ object, parent }) => {
      if (parent) {
        // If the object had a parent, reattach it to ensure proper scene graph structure
        parent.add(object);
      } else {
        // If no parent was recorded, add it directly to the scene
        this.weas.tjs.scene.add(object);
      }
      selectedObjects.push(object);
    });
    // update some selection after undoing
    this.weas.selectionManager.selectedObjects = selectedObjects;
  }
}

class CopyOperation extends BaseOperation {
  static description = "Copy";
  static category = "Edit";
  static ui = {
    title: "Copy",
    fields: {},
  };

  constructor({ weas, indices = null }) {
    super(weas);
    this.indices = indices ? indices : Array.from(this.weas.avr.selectedAtomsIndices);
    this.initialAtoms = weas.avr.atoms.copy(); // Save the initial state for undo
    // Capture the state of the selected objects
    this.newObjects = [];
  }

  execute() {
    if (this.indices.length > 0) {
      this.weas.avr.copyAtoms(this.indices);
    }
    this.newObjects = this.weas.objectManager.copySelectedObjects();
  }

  undo() {
    if (this.indices.length > 0) {
      this.weas.avr.atoms = this.initialAtoms.copy();
    }
    // Remove the new objects
    this.newObjects.forEach((object) => {
      clearObject(this.weas.tjs.scene, object);
    });
  }

  redo() {
    this.execute();
  }

  setupGUI(guiFolder) {}
}

export { DeleteOperation, CopyOperation };
