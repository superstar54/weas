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
      const controller = addController(guiFolder, state, key, field, options);
      if (!controller) {
        return;
      }
      if (field.step !== undefined && controller.step) {
        controller.step(field.step);
      }
      controller.onChange(() => {
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

function normalizeUISchema(schema) {
  if (schema.fields) {
    return { title: schema.title || null, fields: schema.fields };
  }
  return { title: schema.title || null, fields: schema };
}

function resolveOptions(options, op) {
  if (!options) {
    return null;
  }
  if (typeof options === "function") {
    return options(op);
  }
  return options;
}

function addController(guiFolder, state, key, field, options) {
  if (field.type === "color") {
    return guiFolder.addColor(state, key);
  }
  if (field.type === "boolean") {
    return guiFolder.add(state, key);
  }
  if (field.type === "number" && field.min !== undefined && field.max !== undefined) {
    return guiFolder.add(state, key, field.min, field.max);
  }
  if (field.type === "select" && options) {
    return guiFolder.add(state, key, options);
  }
  if (options) {
    return guiFolder.add(state, key, options);
  }
  return guiFolder.add(state, key);
}

function getByPath(target, path) {
  const parts = path.split(".");
  let current = target;
  for (const part of parts) {
    if (!current) {
      return undefined;
    }
    current = current[part];
  }
  return current;
}

function setByPath(target, path, value) {
  const parts = path.split(".");
  let current = target;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!current[part]) {
      current[part] = {};
    }
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
}

function cloneValue(value) {
  if (value === undefined) {
    return value;
  }
  return JSON.parse(JSON.stringify(value));
}

function buildStatePatch(path, patch) {
  if (!path) {
    return patch;
  }
  const parts = path.split(".");
  const root = {};
  let current = root;
  for (let i = 0; i < parts.length - 1; i++) {
    current[parts[i]] = {};
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = patch;
  return root;
}
