import {
  addControllerFromSchema,
  getByPath,
  setByPath,
  normalizeUISchema,
  resolveOptions,
  cloneValue,
  buildStatePatch,
} from "../core/schemaGUI";

export class BaseOperation {
  constructor(weas) {
    this.weas = weas;
    this.affectsAtoms = true;
  }

  execute() {
    throw new Error("Method 'execute()' must be implemented.");
  }

  undo() {
    throw new Error("Method 'undo()' must be implemented.");
  }

  redo() {
    if (this.redoStatePatch()) {
      return;
    }
    this.execute();
  }

  setupGUI(guiFolder) {
    const schema = this.getUISchema();
    if (!schema) {
      return;
    }
    const { title, fields } = normalizeUISchema(schema);
    if (title) {
      renameFolder(guiFolder, title);
    }
    const state = {};
    Object.keys(fields).forEach((key) => {
      const field = fields[key];
      if (field.path) {
        state[key] = getByPath(this, field.path);
      } else {
        state[key] = this[key];
      }
    });
    Object.entries(fields).forEach(([key, field]) => {
      const options = resolveOptions(field.options, this);
      const controller = addControllerFromSchema(guiFolder, state, key, field, options);
      if (!controller) {
        return;
      }
      if (field.step !== undefined && controller.step) {
        controller.step(field.step);
      }
      const onChange = field.type === "text" && typeof controller.onFinishChange === "function" ? controller.onFinishChange : controller.onChange;
      onChange.call(controller, () => {
        this.adjust({ ...state });
      });
    });
  }

  validateParams() {
    return true;
  }

  /*
   * Use adjustWithReset() when execute() is non-idempotent (e.g., add/remove/transform),
   * so GUI tweaks don't accumulate side-effects on each adjustment.
   */
  adjustWithReset(params, resetFn) {
    if (!this.validateParams(params)) {
      return;
    }
    resetFn();
    this.applyParams(params);
    this.execute();
    if (this.weas && this.weas.ops && typeof this.weas.ops.onOperationAdjusted === "function") {
      this.weas.ops.onOperationAdjusted(this);
    }
  }

  applyParams(params) {
    const schema = this.getUISchema();
    if (schema) {
      const { fields } = normalizeUISchema(schema);
      Object.entries(params).forEach(([key, value]) => {
        const field = fields[key];
        if (field && field.path) {
          setByPath(this, field.path, value);
          return;
        }
        if (key in this) {
          this[key] = value;
        }
      });
      return;
    }
    Object.entries(params).forEach(([key, value]) => {
      if (key in this) {
        this[key] = value;
      }
    });
  }

  adjust(params) {
    if (!this.validateParams(params)) {
      return;
    }
    this.applyParams(params);
    this.execute();
    if (this.weas && this.weas.ops && typeof this.weas.ops.onOperationAdjusted === "function") {
      this.weas.ops.onOperationAdjusted(this);
    }
  }

  getUISchema() {
    return this.uiFields || this.constructor.ui || null;
  }

  supportsAdjustGUI() {
    const schema = this.getUISchema();
    if (!schema) {
      return false;
    }
    const { fields } = normalizeUISchema(schema);
    return fields && Object.keys(fields).length > 0;
  }

  ensureStateStore() {
    if (!this.weas || !this.weas.state) {
      throw new Error("State store is required for this operation.");
    }
  }

  stateGet(path, fallback = undefined) {
    this.ensureStateStore();
    const value = this.weas.state.get(path);
    return value === undefined ? fallback : value;
  }

  stateSet(path, patch) {
    this.ensureStateStore();
    const payload = buildStatePatch(path, patch);
    this.weas.state.set(payload);
    return true;
  }

  captureStatePatch(path, patch, fallback) {
    const current = this.stateGet(path, {});
    const previous = {};
    Object.keys(patch || {}).forEach((key) => {
      if (current && Object.prototype.hasOwnProperty.call(current, key)) {
        previous[key] = cloneValue(current[key]);
      } else if (fallback) {
        previous[key] = cloneValue(fallback(key));
      }
    });
    return previous;
  }

  applyStatePatch(path, patch) {
    return this.stateSet(path, patch);
  }

  applyStatePatchWithHistory(path, patch, fallback) {
    this.ensureStateStore();
    const previous = this.captureStatePatch(path, patch, fallback);
    this._stateHistory = { path, previous, next: cloneValue(patch) };
    this.stateSet(path, patch);
    return true;
  }

  undoStatePatch() {
    if (!this._stateHistory) {
      return false;
    }
    this.ensureStateStore();
    this.stateSet(this._stateHistory.path, this._stateHistory.previous);
    return true;
  }

  redoStatePatch() {
    if (!this._stateHistory) {
      return false;
    }
    this.ensureStateStore();
    this.stateSet(this._stateHistory.path, this._stateHistory.next);
    return true;
  }
}

export function renameFolder(folder, newName) {
  // dat.GUI stores the name of the folder in the DOM, inside an element with class 'title'
  const folderTitleElement = folder.domElement.querySelector(".title");
  if (folderTitleElement) {
    folderTitleElement.textContent = newName;
  }
}


