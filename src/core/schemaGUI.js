export function createGUIFromSchema(folder, target, schema, globalOnChange) {
  for (const [key, meta] of Object.entries(schema)) {
    if (meta.hidden || meta.gui === false) continue;

    const state = {};
    if (meta.path) {
      state[key] = getByPath(target, meta.path);
    } else {
      state[key] = target[key];
    }

    const options = resolveOptions(meta.options, target);
    const controller = addController(folder, state, key, meta, options);
    if (!controller) continue;

    const displayName = meta.label ?? key;
    controller.name(displayName);

    if (typeof meta.onChange === "function") {
      controller.onChange(() => {
        if (meta.path) setByPath(target, meta.path, state[key]);
        meta.onChange(key, state[key]);
      });
    } else if (typeof globalOnChange === "function") {
      controller.onChange(() => globalOnChange(key, state[key]));
    }
  }
  return folder;
}

function addController(guiFolder, state, key, field, options) {
  switch (field.type) {
    case "color":
      return guiFolder.addColor(state, key);
    case "boolean":
      return guiFolder.add(state, key);
    case "number": {
      const min = field.min ?? 0;
      const max = field.max ?? 100;
      if (field.step !== undefined) {
        return guiFolder.add(state, key, min, max, field.step);
      }
      return guiFolder.add(state, key, min, max);
    }
    case "select":
      if (options) return guiFolder.add(state, key, options);
      return null;
    default:
      return guiFolder.add(state, key);
  }
}

export function addControllerFromSchema(guiFolder, state, key, field, options) {
  return addController(guiFolder, state, key, field, options);
}

export function normalizeUISchema(schema) {
  if (schema.fields) {
    return { title: schema.title || null, fields: schema.fields };
  }
  return { title: schema.title || null, fields: schema };
}

export function resolveOptions(options, context) {
  if (!options) return null;
  if (typeof options === "function") return options(context);
  return options;
}

export function getByPath(target, path) {
  const parts = path.split(".");
  let current = target;
  for (const part of parts) {
    if (!current) return undefined;
    current = current[part];
  }
  return current;
}

export function setByPath(target, path, value) {
  const parts = path.split(".");
  let current = target;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!current[part]) current[part] = {};
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
}

export function cloneValue(value) {
  if (value === undefined) return value;
  return JSON.parse(JSON.stringify(value));
}

function buildStatePatch(path, patch) {
  if (!path) return patch;
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
export { buildStatePatch };
