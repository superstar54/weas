import { BaseOperation } from "./baseOperation.js";
import { elementAtomicNumbers } from "../atoms/atoms_data.js";
import { colorBys } from "../config.js";

class ReplaceOperation extends BaseOperation {
  static description = "Replace atoms";
  static category = "Edit";
  static ui = {
    title: "Replace",
    fields: {
      symbol: {
        type: "select",
        options: (op) => op.symbolOptions,
      },
    },
  };

  constructor({ weas, symbol = "C", indices = null }) {
    super(weas);
    this.indices = indices ? indices : Array.from(this.weas.avr.selectedAtomsIndices);
    this.symbol = symbol;
    this.symbolOptions = Object.keys(elementAtomicNumbers).concat(Object.keys(this.weas.avr.atoms.species || {}));
    // .copy() provides a fresh instance for restoration
    this.initialAtoms = weas.avr.atoms.copy();
  }

  execute() {
    this.weas.avr.replaceSelectedAtoms({ element: this.symbol, indices: this.indices });
  }

  undo() {
    this.weas.avr.atoms = this.initialAtoms.copy();
  }

  validateParams(params) {
    if (!(params.symbol in elementAtomicNumbers || params.symbol in this.weas.avr.atoms.species)) {
      return false;
    }
    return true;
  }
}

class AddAtomOperation extends BaseOperation {
  static description = "Add atom";
  static category = "Edit";
  static ui = {
    title: "Add",
    fields: {
      symbol: {
        type: "select",
        options: (op) => op.symbolOptions,
      },
      x: { type: "number", min: -10, max: 10, step: 0.1 },
      y: { type: "number", min: -10, max: 10, step: 0.1 },
      z: { type: "number", min: -10, max: 10, step: 0.1 },
    },
  };

  constructor({ weas, symbol = "C", position = { x: 0, y: 0, z: 0 } }) {
    super(weas);
    // this.weas.avr.selectedAtomsIndices is a set
    this.position = position;
    this.symbol = symbol;
    this.x = position.x;
    this.y = position.y;
    this.z = position.z;
    this.symbolOptions = Object.keys(elementAtomicNumbers).concat(Object.keys(this.weas.avr.atoms.species || {}));
    this.initialAtoms = weas.avr.atoms.copy();
  }

  execute() {
    this.position = { x: this.x, y: this.y, z: this.z };
    this.weas.avr.addAtom({ element: this.symbol, position: this.position });
  }

  undo() {
    this.weas.avr.atoms = this.initialAtoms.copy();
  }

  adjust(params) {
    if (!this.validateParams(params)) {
      return;
    }
    this.weas.avr.atoms = this.initialAtoms.copy();
    this.applyParams(params);
    this.execute();
  }

  applyParams(params) {
    if ("symbol" in params) {
      this.symbol = params.symbol;
    }
    if ("x" in params || "y" in params || "z" in params) {
      this.x = params.x ?? this.x;
      this.y = params.y ?? this.y;
      this.z = params.z ?? this.z;
      this.position = { x: this.x, y: this.y, z: this.z };
    }
  }

  validateParams(params) {
    if (!(params.symbol in elementAtomicNumbers || params.symbol in this.weas.avr.atoms.species)) {
      return false;
    }
    return true;
  }
}

class ColorByAttribute extends BaseOperation {
  static description = "Color by attribute";
  static category = "Color";
  static ui = {
    title: "Color by attribute",
    fields: {
      attribute: {
        type: "select",
        options: (op) => op.attributeKeys,
      },
      color1: { type: "color" },
      color2: { type: "color" },
    },
  };

  constructor({ weas, attribute = "Element", color1 = "#ff0000", color2 = "#0000ff" }) {
    super(weas);
    this.affectsAtoms = false;
    // weas.meshPrimitive.settings is a array of objects
    // deep copy it to avoid modifying the original settings
    this.attribute = attribute;
    this.color1 = color1;
    this.color2 = color2;
    // store previous colorBy attribute, and colorRamp
    this.previousAttribute = weas.avr.colorBy;
    this.previousColorRamp = weas.avr.colorRamp;
    // key of this.weas.avr.atoms.attributues['atom'] + colorBys
    this.attributeKeys = Object.keys(this.weas.avr.atoms.attributes["atom"]).concat(Object.keys(colorBys));
  }

  execute() {
    this.weas.avr.applyState(
      {
        colorRamp: [this.color1, this.color2],
        colorBy: this.attribute,
      },
      { redraw: "full" },
    );
  }

  undo() {
    this.weas.avr.applyState(
      {
        colorRamp: this.previousColorRamp,
        colorBy: this.previousAttribute,
      },
      { redraw: "full" },
    );
  }

  validateParams(params) {
    // if colorBy not in colorBys, and colorBy not in the atoms.attributes["atom"], return
    if (!(params.attribute in colorBys) && !(params.attribute in this.weas.avr.atoms.attributes["atom"])) {
      return false;
    }
    return true;
  }
}

export { ReplaceOperation, AddAtomOperation, ColorByAttribute };
