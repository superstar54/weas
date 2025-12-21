import { BaseOperation } from "./baseOperation.js";
import { MODEL_STYLE_MAP } from "../config.js";

function cloneValue(value) {
  if (value === undefined) {
    return value;
  }
  return JSON.parse(JSON.stringify(value));
}

class SetViewerState extends BaseOperation {
  static description = "Set viewer state";
  static category = "Viewer";

  constructor({ weas, patch = {}, redraw = "auto" }) {
    super(weas);
    this.affectsAtoms = false;
    this.patch = cloneValue(patch);
    this.redraw = redraw;
    this.colorByOptions = Object.keys(this.weas.avr.atoms.attributes["atom"] || {}).concat(["Element", "Index", "Random", "Uniform"]);
    this.colorTypeOptions = ["CPK", "VESTA", "JMOL"];
    this.radiusTypeOptions = ["Covalent", "VDW"];
    if (Object.keys(this.patch).length === 0) {
      this.patch = this.buildDefaultPatch();
    }
    this.uiFields = {
      title: "Viewer state",
      fields: this.buildFieldsFromPatch(this.patch),
    };
    Object.keys(this.uiFields.fields).forEach((key) => {
      this[key] = cloneValue(this.patch[key]);
    });
  }

  execute() {
    this.ensureStateStore();
    this.applyStatePatchWithHistory("viewer", this.patch, (key) => this.weas.avr[key]);
  }

  undo() {
    this.ensureStateStore();
    this.undoStatePatch();
  }

  redo() {
    this.ensureStateStore();
    this.redoStatePatch();
  }

  applyParams(params) {
    Object.entries(params).forEach(([key, value]) => {
      if (key in this) {
        this[key] = value;
      }
    });
    this.patch = { ...this.patch };
    Object.keys(this.uiFields.fields).forEach((key) => {
      this.patch[key] = cloneValue(this[key]);
    });
  }

  buildFieldsFromPatch(patch) {
    const baseFields = {
      modelStyle: { type: "select", options: MODEL_STYLE_MAP },
      colorBy: { type: "select", options: (op) => op.colorByOptions },
      colorType: { type: "select", options: (op) => op.colorTypeOptions },
      radiusType: { type: "select", options: (op) => op.radiusTypeOptions },
      materialType: { type: "select", options: ["Standard", "Phong", "Basic"] },
      atomLabelType: { type: "select", options: ["None", "Symbol", "Index"] },
      showBondedAtoms: { type: "boolean" },
      atomScale: { type: "number", min: 0.1, max: 2.0, step: 0.01 },
      backgroundColor: { type: "color" },
    };
    const fields = {};
    Object.entries(patch).forEach(([key, value]) => {
      if (baseFields[key]) {
        fields[key] = baseFields[key];
        return;
      }
      if (typeof value === "boolean") {
        fields[key] = { type: "boolean" };
      } else if (typeof value === "number") {
        fields[key] = { type: "number" };
      } else if (typeof value === "string") {
        fields[key] = { type: "text" };
      }
    });
    return fields;
  }

  buildDefaultPatch() {
    const keys = ["modelStyle", "colorBy", "colorType", "radiusType", "materialType", "atomLabelType", "showBondedAtoms", "atomScale", "backgroundColor"];
    const patch = {};
    const viewerState = this.stateGet("viewer", {});
    keys.forEach((key) => {
      if (key in viewerState) {
        patch[key] = cloneValue(viewerState[key]);
      } else {
        patch[key] = cloneValue(this.weas.avr[key]);
      }
    });
    return patch;
  }
}

export { SetViewerState };
