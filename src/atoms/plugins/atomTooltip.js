import * as THREE from "three";

/**
 * AtomTooltipManager - Shows a tooltip when hovering over atoms.
 *
 * Displays element symbol, atom index, and Cartesian coordinates
 * in a floating DOM element near the mouse cursor.
 *
 * Lifecycle:
 *  - Construction does NOT create DOM or register events unless enabled.
 *  - enable() lazily creates DOM + attaches listeners.
 *  - disable() removes DOM + detaches listeners (full teardown of side effects).
 *  - reset() clears transient state (e.g. cached atom index) without tearing down DOM.
 *  - dispose() is the final destructor — removes all resources permanently.
 */
export class AtomTooltipManager {
  constructor(viewer, { enabled = true } = {}) {
    this.viewer = viewer;
    this.tjs = viewer.tjs;
    this.raycaster = new THREE.Raycaster();
    this.raycaster.layers.set(0);
    this.mouse = new THREE.Vector2();
    this.tooltipElement = null;
    this.currentAtomIndex = null;
    this._enabled = false;
    this._initialized = false;
    this._disposed = false;
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseLeave = this._onMouseLeave.bind(this);
    // Only initialize if enabled at construction time
    if (enabled) {
      this.enable();
    }
  }

  get enabled() {
    return this._enabled;
  }

  set enabled(value) {
    if (value) {
      this.enable();
    } else {
      this.disable();
    }
  }

  /**
   * Enable the tooltip feature: lazily creates DOM and registers events.
   */
  enable() {
    if (this._disposed) {
      return;
    }
    if (this._enabled && this._initialized) {
      return; // already active
    }
    this._enabled = true;
    if (!this._initialized) {
      this._init();
    }
  }

  /**
   * Disable the tooltip feature: hides tooltip, removes DOM and event listeners.
   * Can be re-enabled later via enable().
   */
  disable() {
    if (!this._enabled) {
      return;
    }
    this._enabled = false;
    this._hideTooltipImmediate();
    this._teardown();
  }

  _init() {
    if (this._initialized || this._disposed) {
      return;
    }
    // Create the tooltip DOM element
    this.tooltipElement = document.createElement("div");
    this.tooltipElement.className = "weas-atom-tooltip";
    this.tooltipElement.style.display = "none";
    // Append to the container so it can float above the canvas
    const container = this.tjs.containerElement;
    container.appendChild(this.tooltipElement);

    // Attach mousemove and mouseleave listeners
    container.addEventListener("mousemove", this._onMouseMove, false);
    container.addEventListener("mouseleave", this._onMouseLeave, false);
    this._initialized = true;
  }

  /**
   * Remove DOM and event listeners (reversible — enable() can re-init).
   */
  _teardown() {
    if (!this._initialized) {
      return;
    }
    const container = this.tjs.containerElement;
    container.removeEventListener("mousemove", this._onMouseMove, false);
    container.removeEventListener("mouseleave", this._onMouseLeave, false);
    if (this.tooltipElement && this.tooltipElement.parentNode) {
      this.tooltipElement.parentNode.removeChild(this.tooltipElement);
    }
    this.tooltipElement = null;
    this.currentAtomIndex = null;
    this._initialized = false;
  }

  _onMouseMove(event) {
    if (!this._enabled) {
      return;
    }
    const atomMesh = this.viewer.atomManager?.meshes?.["atom"];
    if (!atomMesh) {
      this._hideTooltip();
      return;
    }

    // Convert mouse coordinates to normalized device coordinates
    const rect = this.tjs.updateViewerRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Cast ray
    this.raycaster.setFromCamera(this.mouse, this.tjs.camera);
    const intersects = this.raycaster.intersectObject(atomMesh, false);

    if (intersects.length > 0) {
      const hit = intersects.find((i) => Number.isInteger(i.instanceId));
      if (hit) {
        const atomIndex = hit.instanceId;
        this._showTooltip(atomIndex, event.clientX - rect.left, event.clientY - rect.top);
        return;
      }
    }

    // No atom hit
    this._hideTooltip();
  }

  _onMouseLeave() {
    this._hideTooltip();
  }

  _showTooltip(atomIndex, mouseX, mouseY) {
    const atoms = this.viewer.atoms;
    if (!atoms || atomIndex >= atoms.symbols.length) {
      this._hideTooltip();
      return;
    }

    // Only update content when the hovered atom changes
    if (this.currentAtomIndex !== atomIndex) {
      this.currentAtomIndex = atomIndex;
      const symbol = atoms.symbols[atomIndex];
      const pos = atoms.positions[atomIndex];
      const x = pos[0].toFixed(2);
      const y = pos[1].toFixed(2);
      const z = pos[2].toFixed(2);
      this.tooltipElement.textContent = `${symbol} #${atomIndex} (${x}, ${y}, ${z})`;
    }

    // Position the tooltip near the cursor with a small offset
    const offsetX = 12;
    const offsetY = 12;
    this.tooltipElement.style.left = `${mouseX + offsetX}px`;
    this.tooltipElement.style.top = `${mouseY + offsetY}px`;
    this.tooltipElement.style.display = "block";
  }

  _hideTooltip() {
    if (this.currentAtomIndex !== null) {
      this.currentAtomIndex = null;
      if (this.tooltipElement) {
        this.tooltipElement.style.display = "none";
      }
    }
  }

  /**
   * Unconditionally hide the tooltip (used during disable).
   */
  _hideTooltipImmediate() {
    this.currentAtomIndex = null;
    if (this.tooltipElement) {
      this.tooltipElement.style.display = "none";
    }
  }

  /**
   * Reset transient state without tearing down DOM/events.
   * Called during drawModels() to clear stale cached atom index.
   */
  reset() {
    this.currentAtomIndex = null;
    if (this.tooltipElement) {
      this.tooltipElement.style.display = "none";
    }
  }

  /**
   * Final destructor — permanently removes all resources.
   * After dispose(), the manager cannot be re-enabled.
   */
  dispose() {
    if (this._disposed) {
      return;
    }
    this._disposed = true;
    this._enabled = false;
    this._teardown();
  }
}
