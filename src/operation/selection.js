import { BaseOperation } from "./baseOperation.js";
import { pointsInsideMesh } from "../geometry/utils.js";

class SelectAll extends BaseOperation {
  static description = "Select all";
  static category = "Select";

  constructor({ weas }) {
    super(weas);
    this.previousSelectedAtomsIndices = [...weas.avr.selectedAtomsIndices];
  }

  execute() {
    // add cube to settings
    this.weas.avr.selectedAtomsIndices = [...Array(this.weas.avr.atoms.getAtomsCount()).keys()];
  }

  undo() {
    this.weas.avr.selectedAtomsIndices = this.previousSelectedAtomsIndices;
  }
}

class InvertSelection extends BaseOperation {
  static description = "Invert selection";
  static category = "Select";

  constructor({ weas }) {
    super(weas);
    this.previousSelectedAtomsIndices = [...weas.avr.selectedAtomsIndices];
  }

  execute() {
    // add cube to settings
    this.weas.avr.selectedAtomsIndices = [...Array(this.weas.avr.atoms.getAtomsCount()).keys()].filter((i) => !this.previousSelectedAtomsIndices.includes(i));
  }

  undo() {
    this.weas.avr.selectedAtomsIndices = this.previousSelectedAtomsIndices;
  }
}

class InsideSelection extends BaseOperation {
  static description = "Select inside";
  static category = "Select";

  constructor({ weas }) {
    super(weas);
    this.previousSelectedAtomsIndices = [...weas.avr.selectedAtomsIndices];
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
    this.weas.avr.selectedAtomsIndices = indices;
  }

  undo() {
    this.weas.avr.selectedAtomsIndices = this.previousSelectedAtomsIndices;
  }
}

export { SelectAll, InvertSelection, InsideSelection };
