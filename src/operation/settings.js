import { BaseOperation } from "./baseOperation.js";

function normalizeValue(value) {
  if (value && typeof value.getHexString === "function") {
    return `#${value.getHexString()}`;
  }
  if (Array.isArray(value)) {
    return value.map((item) => normalizeValue(item));
  }
  if (value && typeof value === "object") {
    const result = {};
    Object.entries(value).forEach(([key, item]) => {
      result[key] = normalizeValue(item);
    });
    return result;
  }
  return value;
}

function cloneSettings(value) {
  return normalizeValue(value);
}

function addDefined(target, key, value) {
  if (value !== undefined) {
    target[key] = value;
  }
}

function addSettings(target, key, value) {
  if (value !== undefined && value !== null) {
    target[key] = value;
  }
}

class SetCellSettings extends BaseOperation {
  static description = "Cell settings";
  static category = "Viewer";
  static ui = {
    title: "Cell",
    fields: {
      showCell: { type: "boolean" },
      showAxes: { type: "boolean" },
    },
  };

  constructor({ weas, settings = {}, showCell = undefined, showAxes = undefined }) {
    super(weas);
    this.affectsAtoms = false;
    this.settings = cloneSettings(settings);
    const cellState = this.stateGet("cell", {});
    this.showCell = showCell !== undefined ? showCell : (cellState.showCell ?? this.weas.avr.cellManager.showCell);
    this.showAxes = showAxes !== undefined ? showAxes : (cellState.showAxes ?? this.weas.avr.cellManager.showAxes);
  }

  execute() {
    this.ensureStateStore();
    const cellPatch = { ...this.settings };
    addDefined(cellPatch, "showCell", this.showCell);
    addDefined(cellPatch, "showAxes", this.showAxes);
    this.applyStatePatchWithHistory("cell", cellPatch, (key) => this.weas.avr.cellManager[key]);
  }

  undo() {
    this.ensureStateStore();
    this.undoStatePatch();
  }

  redo() {
    this.ensureStateStore();
    this.redoStatePatch();
  }
}

class SetBondSettings extends BaseOperation {
  static description = "Bond settings";
  static category = "Viewer";
  static ui = {
    title: "Bond",
    fields: {
      hideLongBonds: { type: "boolean" },
      showHydrogenBonds: { type: "boolean" },
      showOutBoundaryBonds: { type: "boolean" },
    },
  };

  constructor({ weas, settings = null, hideLongBonds = undefined, showHydrogenBonds = undefined, showOutBoundaryBonds = undefined }) {
    super(weas);
    this.affectsAtoms = false;
    this.settings = settings ? cloneSettings(settings) : null;
    this.hideLongBonds = hideLongBonds;
    this.showHydrogenBonds = showHydrogenBonds;
    this.showOutBoundaryBonds = showOutBoundaryBonds;
  }

  execute() {
    this.ensureStateStore();
    const bondPatch = {};
    addSettings(bondPatch, "settings", this.settings);
    addDefined(bondPatch, "hideLongBonds", this.hideLongBonds);
    addDefined(bondPatch, "showHydrogenBonds", this.showHydrogenBonds);
    addDefined(bondPatch, "showOutBoundaryBonds", this.showOutBoundaryBonds);
    this.applyStatePatchWithHistory("bond", bondPatch, (key) => this.weas.avr.bondManager[key]);
  }

  undo() {
    this.ensureStateStore();
    this.undoStatePatch();
  }

  redo() {
    this.ensureStateStore();
    this.redoStatePatch();
  }
}

class SetIsosurfaceSettings extends BaseOperation {
  static description = "Isosurface settings";
  static category = "Viewer";

  constructor({ weas, settings = {} }) {
    super(weas);
    this.affectsAtoms = false;
    this.settings = cloneSettings(settings);
  }

  execute() {
    this.ensureStateStore();
    this.applyStatePatchWithHistory("plugins.isosurface", { settings: this.settings }, () => this.weas.avr.isosurfaceManager.settings);
  }

  undo() {
    this.ensureStateStore();
    this.undoStatePatch();
  }

  redo() {
    this.ensureStateStore();
    this.redoStatePatch();
  }
}

class SetVolumeSliceSettings extends BaseOperation {
  static description = "Volume slice settings";
  static category = "Viewer";

  constructor({ weas, settings = {} }) {
    super(weas);
    this.affectsAtoms = false;
    this.settings = cloneSettings(settings);
  }

  execute() {
    this.ensureStateStore();
    this.applyStatePatchWithHistory("plugins.volumeSlice", { settings: this.settings }, () => this.weas.avr.volumeSliceManager.settings);
  }

  undo() {
    this.ensureStateStore();
    this.undoStatePatch();
  }

  redo() {
    this.ensureStateStore();
    this.redoStatePatch();
  }
}

class SetVectorFieldSettings extends BaseOperation {
  static description = "Vector field settings";
  static category = "Viewer";
  static ui = {
    title: "Vector field",
    fields: {
      show: { type: "boolean" },
    },
  };

  constructor({ weas, settings = {}, show = undefined }) {
    super(weas);
    this.affectsAtoms = false;
    this.settings = cloneSettings(settings);
    this.show = show;
  }

  execute() {
    this.ensureStateStore();
    const vectorPatch = {};
    addSettings(vectorPatch, "settings", this.settings);
    addDefined(vectorPatch, "show", this.show);
    this.applyStatePatchWithHistory("plugins.vectorField", vectorPatch, (key) => (key === "settings" ? this.weas.avr.VFManager.settings : this.weas.avr.VFManager.show));
  }

  undo() {
    this.ensureStateStore();
    this.undoStatePatch();
  }

  redo() {
    this.ensureStateStore();
    this.redoStatePatch();
  }
}

class SetHighlightSettings extends BaseOperation {
  static description = "Highlight settings";
  static category = "Viewer";

  constructor({ weas, settings = {} }) {
    super(weas);
    this.affectsAtoms = false;
    this.settings = cloneSettings(settings);
  }

  execute() {
    this.ensureStateStore();
    this.applyStatePatchWithHistory("plugins.highlight", { settings: this.settings }, () => this.weas.avr.highlightManager.settings);
  }

  undo() {
    this.ensureStateStore();
    this.undoStatePatch();
  }

  redo() {
    this.ensureStateStore();
    this.redoStatePatch();
  }
}

export { SetCellSettings, SetBondSettings, SetIsosurfaceSettings, SetVolumeSliceSettings, SetVectorFieldSettings, SetHighlightSettings };
