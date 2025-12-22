import { BaseOperation } from "./baseOperation.js";
import { pointsInsideMesh } from "../geometry/utils.js";

class SelectAll extends BaseOperation {
  static description = "Select all";
  static category = "Select";

  constructor({ weas }) {
    super(weas);
  }

  execute() {
    // add cube to settings
    const indices = [...Array(this.weas.avr.atoms.getAtomsCount()).keys()];
    this.ensureStateStore();
    this.applyStatePatchWithHistory("viewer", { selectedAtomsIndices: indices }, (key) => this.weas.avr[key]);
  }

  undo() {
    this.ensureStateStore();
    this.undoStatePatch();
  }
}

class InvertSelection extends BaseOperation {
  static description = "Invert selection";
  static category = "Select";

  constructor({ weas }) {
    super(weas);
  }

  execute() {
    // add cube to settings
    this.ensureStateStore();
    const previousSelectedAtomsIndices = this.stateGet("viewer.selectedAtomsIndices", []) || [];
    const indices = [...Array(this.weas.avr.atoms.getAtomsCount()).keys()].filter((i) => !previousSelectedAtomsIndices.includes(i));
    this.applyStatePatchWithHistory("viewer", { selectedAtomsIndices: indices }, (key) => this.weas.avr[key]);
  }

  undo() {
    this.ensureStateStore();
    this.undoStatePatch();
  }
}

class InsideSelection extends BaseOperation {
  static description = "Select inside";
  static category = "Select";

  constructor({ weas }) {
    super(weas);
  }

  execute() {
    const indices = [];
    // measure the time
    // loop mesh in the this.weas.selectionManager.selectedObjects, and check if the position is inside the mesh
    for (let j = 0; j < this.weas.selectionManager.selectedObjects.length; j++) {
      const mesh = this.weas.selectionManager.selectedObjects[j];
      const indices1 = pointsInsideMesh(this.weas.avr.atoms.positions, mesh);
      indices.push(...indices1);
    }
    this.ensureStateStore();
    this.applyStatePatchWithHistory("viewer", { selectedAtomsIndices: indices }, (key) => this.weas.avr[key]);
  }

  undo() {
    this.ensureStateStore();
    this.undoStatePatch();
  }
}

export { SelectAll, InvertSelection, InsideSelection };
