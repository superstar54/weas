import { BaseOperation } from "./baseOperation.js";
import { elementAtomicNumbers } from "../atoms/atoms_data.js";
import { colorBys } from "../config.js";
import { parseStructureText, applyStructurePayload, buildExportPayload, downloadText } from "../io/structure.js";

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
    const selectedIndices = this.stateGet("viewer.selectedAtomsIndices", []) || [];
    this.indices = indices ? indices : Array.from(selectedIndices);
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
    this.adjustWithReset(params, () => {
      this.weas.avr.atoms = this.initialAtoms.copy();
    });
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
    // key of this.weas.avr.atoms.attributues['atom'] + colorBys
    this.attributeKeys = Object.keys(this.weas.avr.atoms.attributes["atom"]).concat(Object.keys(colorBys));
  }

  execute() {
    this.ensureStateStore();
    const patch = {
      colorRamp: [this.color1, this.color2],
      colorBy: this.attribute,
    };
    this.applyStatePatchWithHistory("viewer", patch, (key) => this.weas.avr[key]);
  }

  undo() {
    this.ensureStateStore();
    this.undoStatePatch();
  }

  redo() {
    this.ensureStateStore();
    this.redoStatePatch();
  }

  validateParams(params) {
    // if colorBy not in colorBys, and colorBy not in the atoms.attributes["atom"], return
    if (!(params.attribute in colorBys) && !(params.attribute in this.weas.avr.atoms.attributes["atom"])) {
      return false;
    }
    return true;
  }
}

class AddAtomsToGroupOperation extends BaseOperation {
  static description = "Add atoms to group";
  static category = "Group";
  static ui = {
    title: "Add to group",
    fields: {
      group: { type: "text" },
    },
  };

  constructor({ weas, group = "group", indices = null }) {
    super(weas);
    const selectedIndices = this.stateGet("viewer.selectedAtomsIndices", []) || [];
    this.indices = indices ? indices : Array.from(selectedIndices);
    this.group = group;
    this.initialAtoms = weas.avr.atoms.copy();
  }

  execute() {
    this.weas.avr.atoms.addAtomsToGroup(this.indices, this.group);
  }

  undo() {
    this.weas.avr.atoms = this.initialAtoms.copy();
  }

  adjust(params) {
    this.adjustWithReset(params, () => {
      this.weas.avr.atoms = this.initialAtoms.copy();
    });
  }

  applyParams(params) {
    if ("group" in params) {
      this.group = params.group;
    }
  }

  validateParams(params) {
    return Boolean(params.group && String(params.group).trim());
  }
}

class RemoveAtomsFromGroupOperation extends BaseOperation {
  static description = "Remove atoms from group";
  static category = "Group";
  static ui = {
    title: "Remove from group",
    fields: {
      group: {
        type: "select",
        options: (op) => op.groupOptions,
      },
    },
  };

  constructor({ weas, group = "group", indices = null }) {
    super(weas);
    const selectedIndices = this.stateGet("viewer.selectedAtomsIndices", []) || [];
    this.indices = indices ? indices : Array.from(selectedIndices);
    const groupOptions = new Set();
    const groups = this.weas.avr.atoms.attributes?.atom?.groups;
    if (Array.isArray(groups)) {
      this.indices.forEach((index) => {
        const entry = groups[index];
        if (Array.isArray(entry)) {
          entry.forEach((name) => groupOptions.add(String(name)));
        }
      });
    }
    this.groupOptions = Array.from(groupOptions).sort();
    if (this.groupOptions.length === 0) {
      this.groupOptions = [group];
    }
    this.group = group === "group" && this.groupOptions.length > 0 ? this.groupOptions[0] : group;
    this.initialAtoms = weas.avr.atoms.copy();
  }

  execute() {
    this.weas.avr.atoms.removeAtomsFromGroup(this.indices, this.group);
  }

  undo() {
    this.weas.avr.atoms = this.initialAtoms.copy();
  }

  adjust(params) {
    this.adjustWithReset(params, () => {
      this.weas.avr.atoms = this.initialAtoms.copy();
    });
  }

  applyParams(params) {
    if ("group" in params) {
      this.group = params.group;
    }
  }

  validateParams(params) {
    return Boolean(params.group && String(params.group).trim());
  }
}

class ClearGroupOperation extends BaseOperation {
  static description = "Clear group";
  static category = "Group";
  static ui = {
    title: "Clear group",
    fields: {
      group: { type: "text" },
    },
  };

  constructor({ weas, group = "group" }) {
    super(weas);
    this.group = group;
    this.initialAtoms = weas.avr.atoms.copy();
  }

  execute() {
    this.weas.avr.atoms.clearGroup(this.group);
  }

  undo() {
    this.weas.avr.atoms = this.initialAtoms.copy();
  }

  adjust(params) {
    this.adjustWithReset(params, () => {
      this.weas.avr.atoms = this.initialAtoms.copy();
    });
  }

  applyParams(params) {
    if ("group" in params) {
      this.group = params.group;
    }
  }

  validateParams(params) {
    return Boolean(params.group && String(params.group).trim());
  }
}

class ImportStructureOperation extends BaseOperation {
  static description = "Import structure file";
  static category = "IO";

  constructor({ weas }) {
    super(weas);
    this.previousState = weas.exportState();
    this.nextState = null;
    this.affectsAtoms = true;
  }

  execute() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json,.xyz,.cif";
    fileInput.style.display = "none";
    document.body.appendChild(fileInput);
    fileInput.addEventListener(
      "change",
      async () => {
        const file = fileInput.files && fileInput.files[0];
        document.body.removeChild(fileInput);
        if (!file) {
          return;
        }
        try {
          const text = await file.text();
          const extension = file.name.slice(file.name.lastIndexOf("."));
          const parsed = parseStructureText(text, extension);
          applyStructurePayload(this.weas, parsed.data);
          this.nextState = this.weas.exportState();
        } catch (error) {
          console.error("Failed to import structure:", error);
          alert(`Import failed: ${error.message || error}`);
        }
      },
      { once: true },
    );
    fileInput.click();
  }

  undo() {
    if (this.previousState) {
      this.weas.importState(this.previousState);
    }
  }

  redo() {
    if (this.nextState) {
      this.weas.importState(this.nextState);
      return;
    }
    this.execute();
  }
}

class ExportStructureOperation extends BaseOperation {
  static description = "Export structure file";
  static category = "IO";
  static ui = {
    title: "Export",
    fields: {
      format: { type: "select", options: ["json", "html", "xyz", "cif"] },
      filename: { type: "text" },
    },
  };

  constructor({ weas, format = "json", filename = "" }) {
    super(weas);
    this.affectsAtoms = false;
    this.format = format;
    this.filename = filename;
  }

  execute() {
    const payload = buildExportPayload(this.weas, this.format);
    const filename = this.filename && this.filename.trim().length > 0 ? this.filename.trim() : payload.filename;
    downloadText(payload.text, filename, payload.mimeType);
  }

  undo() {}
}

export { ReplaceOperation, AddAtomOperation, ColorByAttribute, AddAtomsToGroupOperation, RemoveAtomsFromGroupOperation, ClearGroupOperation, ImportStructureOperation, ExportStructureOperation };
