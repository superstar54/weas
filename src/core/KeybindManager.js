import { defaultKeyBindConfig } from "../config";

class KeybindManager {
  constructor({ container, keybindConfig } = {}) {
    this._container = container;
    this._config = keybindConfig || defaultKeyBindConfig;

    this._actions = new Map();
    this._heldActions = new Set();
    this._keyDownHandler = this._onKeyDown.bind(this);
    this._keyUpHandler = this._onKeyUp.bind(this);

    if (this._container) {
      this._container.addEventListener("keydown", this._keyDownHandler);
      this._container.addEventListener("keyup", this._keyUpHandler);
    }
  }

  beforeDispatch = null;

  register(actionName, handler, combos = null) {
    this._actions.set(actionName, { handler, combos, isHold: false });
  }

  registerHold(actionName, { onPress, onRelease }, combos = null) {
    this._actions.set(actionName, { onPress, onRelease, combos, isHold: true });
  }

  unregister(actionName) {
    this._actions.delete(actionName);
    this._heldActions.delete(actionName);
  }

  isHeld(actionName) {
    return this._heldActions.has(actionName);
  }

  getCombos(actionName) {
    return this._actions.get(actionName)?.combos ?? null;
  }

  getConfig() {
    return this._config;
  }

  listActions() {
    return Array.from(this._actions.entries()).map(([name, a]) => ({
      name,
      combos: a.combos,
      isHold: a.isHold,
    }));
  }

  destroy() {
    if (this._container) {
      this._container.removeEventListener("keydown", this._keyDownHandler);
      this._container.removeEventListener("keyup", this._keyUpHandler);
    }
    this._actions.clear();
    this._heldActions.clear();
  }

  _onKeyDown(event) {
    if (this.beforeDispatch?.(event)) return;

    for (const [name, action] of this._actions) {
      if (!action.combos) continue;
      if (this._matchesAnyCombo(event, action.combos)) {
        if (action.isHold) {
          if (!this._heldActions.has(name)) {
            this._heldActions.add(name);
            action.onPress?.(event);
          }
        } else {
          action.handler?.(event);
        }
        event.preventDefault();
        return;
      }
    }
  }

  _onKeyUp(event) {
    for (const name of this._heldActions) {
      const action = this._actions.get(name);
      if (!action?.isHold || !action.combos) continue;
      if (this._matchesAnyCombo(event, action.combos)) {
        this._heldActions.delete(name);
        action.onRelease?.(event);
        return;
      }
    }
  }

  _matchesAnyCombo(event, combos) {
    return combos.some((combo) => this._matchCombo(event, combo));
  }

  _matchCombo(event, combo) {
    const key = combo[combo.length - 1].toLowerCase();
    if (event.key.toLowerCase() !== key) return false;

    const mods = combo.slice(0, -1);
    for (const mod of ["ctrl", "shift", "alt", "meta"]) {
      if (mod === key) continue;
      if (mods.includes(mod) !== event[mod + "Key"]) return false;
    }
    return true;
  }
}

export { KeybindManager, defaultKeyBindConfig };
