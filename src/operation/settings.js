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

function bondSettingsToPlain(settings) {
  const result = {};
  Object.entries(settings).forEach(([key, setting]) => {
    if (setting && typeof setting.toDict === "function") {
      result[key] = setting.toDict();
    } else {
      result[key] = normalizeValue(setting);
    }
  });
  return result;
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
    this.showCell = showCell !== undefined ? showCell : this.weas.avr.cellManager.showCell;
    this.showAxes = showAxes !== undefined ? showAxes : this.weas.avr.cellManager.showAxes;
    this.previousSettings = cloneSettings(this.weas.avr.cellManager.settings);
    this.previousShowCell = this.weas.avr.cellManager.showCell;
    this.previousShowAxes = this.weas.avr.cellManager.showAxes;
  }

  execute() {
    if (this.settings && Object.keys(this.settings).length > 0) {
      Object.assign(this.weas.avr.cellManager.settings, this.settings);
    }
    if (this.showCell !== undefined) {
      this.weas.avr.cellManager.showCell = this.showCell;
    }
    if (this.showAxes !== undefined) {
      this.weas.avr.cellManager.showAxes = this.showAxes;
    }
    this.weas.avr.cellManager.draw();
    this.weas.tjs.render();
  }

  undo() {
    Object.assign(this.weas.avr.cellManager.settings, this.previousSettings);
    this.weas.avr.cellManager.showCell = this.previousShowCell;
    this.weas.avr.cellManager.showAxes = this.previousShowAxes;
    this.weas.avr.cellManager.draw();
    this.weas.tjs.render();
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
    this.previousSettings = bondSettingsToPlain(this.weas.avr.bondManager.settings);
    this.previousHideLongBonds = this.weas.avr.bondManager.hideLongBonds;
    this.previousShowHydrogenBonds = this.weas.avr.bondManager.showHydrogenBonds;
    this.previousShowOutBoundaryBonds = this.weas.avr.bondManager.showOutBoundaryBonds;
  }

  execute() {
    if (this.settings) {
      this.weas.avr.bondManager.fromSettings(this.settings);
    }
    if (this.hideLongBonds !== undefined) {
      this.weas.avr.bondManager.hideLongBonds = this.hideLongBonds;
    }
    if (this.showHydrogenBonds !== undefined) {
      this.weas.avr.bondManager.showHydrogenBonds = this.showHydrogenBonds;
    }
    if (this.showOutBoundaryBonds !== undefined) {
      this.weas.avr.bondManager.showOutBoundaryBonds = this.showOutBoundaryBonds;
    }
    this.weas.avr.drawModels();
  }

  undo() {
    this.weas.avr.bondManager.fromSettings(this.previousSettings);
    this.weas.avr.bondManager.hideLongBonds = this.previousHideLongBonds;
    this.weas.avr.bondManager.showHydrogenBonds = this.previousShowHydrogenBonds;
    this.weas.avr.bondManager.showOutBoundaryBonds = this.previousShowOutBoundaryBonds;
    this.weas.avr.drawModels();
  }
}

class SetIsosurfaceSettings extends BaseOperation {
  static description = "Isosurface settings";
  static category = "Viewer";

  constructor({ weas, settings = {} }) {
    super(weas);
    this.affectsAtoms = false;
    this.settings = cloneSettings(settings);
    this.previousSettings = cloneSettings(this.weas.avr.isosurfaceManager.settings);
  }

  execute() {
    this.weas.avr.isosurfaceManager.fromSettings(this.settings);
    this.weas.avr.isosurfaceManager.drawIsosurfaces();
  }

  undo() {
    this.weas.avr.isosurfaceManager.fromSettings(this.previousSettings);
    this.weas.avr.isosurfaceManager.drawIsosurfaces();
  }
}

class SetVolumeSliceSettings extends BaseOperation {
  static description = "Volume slice settings";
  static category = "Viewer";

  constructor({ weas, settings = {} }) {
    super(weas);
    this.affectsAtoms = false;
    this.settings = cloneSettings(settings);
    this.previousSettings = cloneSettings(this.weas.avr.volumeSliceManager.settings);
  }

  execute() {
    this.weas.avr.volumeSliceManager.fromSettings(this.settings);
    this.weas.avr.volumeSliceManager.drawSlices();
    this.weas.tjs.render();
  }

  undo() {
    this.weas.avr.volumeSliceManager.fromSettings(this.previousSettings);
    this.weas.avr.volumeSliceManager.drawSlices();
    this.weas.tjs.render();
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
    this.previousSettings = cloneSettings(this.weas.avr.VFManager.settings);
    this.previousShow = this.weas.avr.VFManager.show;
  }

  execute() {
    this.weas.avr.VFManager.fromSettings(this.settings);
    if (this.show !== undefined) {
      this.weas.avr.VFManager.show = this.show;
    }
    this.weas.avr.VFManager.drawVectorFields();
  }

  undo() {
    this.weas.avr.VFManager.fromSettings(this.previousSettings);
    this.weas.avr.VFManager.show = this.previousShow;
    this.weas.avr.VFManager.drawVectorFields();
  }
}

class SetHighlightSettings extends BaseOperation {
  static description = "Highlight settings";
  static category = "Viewer";

  constructor({ weas, settings = {} }) {
    super(weas);
    this.affectsAtoms = false;
    this.settings = cloneSettings(settings);
    this.previousSettings = cloneSettings(this.weas.avr.highlightManager.settings);
  }

  execute() {
    this.weas.avr.highlightManager.fromSettings(this.settings);
    this.weas.avr.highlightManager.drawHighlightAtoms();
    this.weas.tjs.render();
  }

  undo() {
    this.weas.avr.highlightManager.fromSettings(this.previousSettings);
    this.weas.avr.highlightManager.drawHighlightAtoms();
    this.weas.tjs.render();
  }
}

export { SetCellSettings, SetBondSettings, SetIsosurfaceSettings, SetVolumeSliceSettings, SetVectorFieldSettings, SetHighlightSettings };
