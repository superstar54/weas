import { toolbarIcons } from "./Icons";

// TODO / FIXME, build the buttons from the operations maybe,
//  or at the very least improve the pattern for registration of buttons
// This will not scale well and enforces two way coupling
class ToolbarHUD {
  constructor(weas, hudController, config = {}) {
    this.weas = weas;
    this.hud = hudController;

    this.settings = Object.assign(
      {
        height: 40,
        panelBackground: "rgba(255, 255, 255, 0)",
        panelBorderRadius: 20,
        gap: 6,
        paddingX: "0px",
        paddingY: "0px",
        anchor: "top-right",
        offset: { x: 50, y: 0 },
      },
      config.settings || {},
    );

    this.config = Object.assign({ panelKey: "toolbar" }, config);
    this.buttons = new Map();

    this.container = document.createElement("div");
    Object.assign(this.container.style, {
      height: `${this.settings.height}px`,
      backgroundColor: this.settings.panelBackground,
      borderRadius: `${this.settings.panelBorderRadius}px`,
      display: "flex",
      alignItems: "center",
      padding: `${this.settings.paddingY} ${this.settings.paddingX}`,
      gap: `${this.settings.gap}px`,
      userSelect: "none",
      pointerEvents: "auto",
      zIndex: "200",
    });

    this.hud.addHTMLPanel(this.config.panelKey, this.container, {
      anchor: this.settings.anchor,
      offset: this.settings.offset,
    });

    // ---- Default Buttons ----
    this._initDefaultButtons();
  }

  _initDefaultButtons() {
    this.addButton("undo", {
      label: "Undo",
      hint: "Undo last action",
      onClick: () => {
        if (this.weas?.ops?.undo) this.weas.ops.undo();
      },
    });

    this.addButton("redo", {
      label: "Redo",
      hint: "Redo last action",
      onClick: () => {
        if (this.weas?.ops?.redo) this.weas.ops.redo();
      },
    });

    this.addButton("fullscreen", {
      label: "Full",
      hint: "Toggle fullscreen",
      onClick: () => {
        const el = this.weas.tjs.containerElement;

        if (!el) return;

        if (!document.fullscreenElement) {
          el.requestFullscreen().catch((err) => {
            console.error("Fullscreen failed:", err);
          });
        } else {
          document.exitFullscreen().catch((err) => {
            console.error("Exit fullscreen failed:", err);
          });
        }
      },
    });

    this.addButton("measure", {
      hint: "Measure selection",
      onClick: () => {
        // little strange that this is not at the operation level, feels like a fundamental concept
        // or atleast should be injected into the toolbar through some external method
        // TODO - discuss with xing?
        this.weas.avr.Measurement.measure(this.weas.avr.selectedAtomsIndices);
      },
    });
  }

  addButton(key, { label = "", hint = "", onClick } = {}) {
    if (this.buttons.has(key)) this.removeButton(key);

    const btn = document.createElement("button");
    btn.classList.add("weas-toolbar-button");

    if (toolbarIcons[key]) {
      const wrapper = document.createElement("span");
      wrapper.innerHTML = toolbarIcons[key];
      btn.appendChild(wrapper);
    } else {
      btn.textContent = label || key;
    }

    if (hint) btn.title = hint;

    Object.assign(btn.style, {
      border: "solid 1px rgba(205, 205, 205, 0.75)",
      background: "rgba(239, 239, 239, 0.5)",
      borderRadius: "4px",
      padding: "4px 8px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    });

    if (onClick) btn.addEventListener("click", onClick);

    btn.addEventListener("pointerdown", (e) => e.stopPropagation());
    btn.addEventListener("pointerup", (e) => e.stopPropagation());

    this.container.appendChild(btn);
    this.buttons.set(key, btn);
  }

  removeButton(key) {
    const btn = this.buttons.get(key);
    if (!btn) return;
    btn.remove();
    this.buttons.delete(key);
  }

  clear() {
    this.buttons.forEach((btn) => btn.remove());
    this.buttons.clear();
  }

  setVisible(visible) {
    this.container.style.display = visible ? "flex" : "none";
  }
}

export { ToolbarHUD };
