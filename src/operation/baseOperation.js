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
