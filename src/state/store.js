function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function getByPath(target, path) {
  if (!path) {
    return target;
  }
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

function mergeDeep(target, source) {
  Object.entries(source || {}).forEach(([key, value]) => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      if (!target[key] || typeof target[key] !== "object") {
        target[key] = {};
      }
      mergeDeep(target[key], value);
    } else {
      target[key] = value;
    }
  });
  return target;
}

class StateStore {
  constructor(initialState = {}) {
    this.state = cloneValue(initialState);
    this.subscribers = new Set();
    this.depth = 0;
    this.pending = false;
  }

  get(path = "") {
    return getByPath(this.state, path);
  }

  set(patch) {
    mergeDeep(this.state, patch);
    if (this.depth > 0) {
      this.pending = true;
      return;
    }
    this.emit();
  }

  reset(nextState = {}) {
    this.state = cloneValue(nextState);
    if (this.depth > 0) {
      this.pending = true;
      return;
    }
    this.emit();
  }

  transaction(callback) {
    this.depth += 1;
    try {
      callback();
    } finally {
      this.depth -= 1;
      if (this.depth === 0 && this.pending) {
        this.pending = false;
        this.emit();
      }
    }
  }

  subscribe(path, callback) {
    const subscriber = {
      path,
      callback,
      last: cloneValue(getByPath(this.state, path)),
    };
    this.subscribers.add(subscriber);
    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  emit() {
    this.subscribers.forEach((subscriber) => {
      const next = cloneValue(getByPath(this.state, subscriber.path));
      const prev = subscriber.last;
      const changed = JSON.stringify(prev) !== JSON.stringify(next);
      if (changed) {
        subscriber.last = next;
        subscriber.callback(next, prev);
      }
    });
  }
}

export { StateStore, cloneValue };
