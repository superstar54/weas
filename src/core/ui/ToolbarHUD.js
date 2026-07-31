import { toolbarIcons } from "./Icons";

const DEFAULT_ORDER = [
  "undo",
  "redo",
  "measure",
  "camera",
  "fullscreen",
  "export",
  "import",
  "keybinds",
];

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
        anchor: "top-center",
      },
      config.settings || {},
    );

    this.config = Object.assign({ panelKey: "toolbar" }, config);
    this.buttons = new Map();
    this._order = Array.isArray(config.order)
      ? config.order.slice()
      : DEFAULT_ORDER.slice();
    this._reorderScheduled = false;

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

    if (config.defaultButtons !== false) {
      this._initDefaultButtons();
    }
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

    this.addButton("export", {
      label: "Export",
      hint: "Export state as JSON",
      onClick: () => {
        const snapshot = this.weas.exportState();
        const text = JSON.stringify(snapshot, null, 2);
        const blob = new Blob([text], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "weas-state.json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      },
    });

    this.addButton("import", {
      label: "Import",
      hint: "Import state from JSON",
      onClick: () => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = ".json,.on";
        fileInput.style.display = "none";
        document.body.appendChild(fileInput);
        fileInput.addEventListener(
          "change",
          async () => {
            const file = fileInput.files && fileInput.files[0];
            document.body.removeChild(fileInput);
            if (!file) return;
            try {
              const text = await file.text();
              const data = JSON.parse(text);
              this.weas.importState(data);
            } catch (error) {
              console.error("Import failed:", error);
              alert(`Import failed: ${error.message || error}`);
            }
          },
          { once: true },
        );
        fileInput.click();
      },
    });
  }

  addButton(
    key,
    { label = "", hint = "", icon, onClick, fontSize = "15px" } = {},
  ) {
    if (this.buttons.has(key)) this.removeButton(key);

    const btn = document.createElement("button");
    btn.classList.add("weas-toolbar-button");

    const iconSvg = icon || toolbarIcons[key];
    if (iconSvg) {
      const wrapper = document.createElement("span");
      wrapper.innerHTML = iconSvg;
      btn.appendChild(wrapper);
    } else {
      btn.textContent = label || key;
    }

    if (hint) btn.title = hint;

    Object.assign(btn.style, {
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      border: "1px solid rgba(255,255,255,0.25)",
      background: "rgba(30,30,40,0.65)",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "rgba(255,255,255,0.85)",
      transition: "background 0.15s",
      padding: "0",
      fontSize: fontSize,
    });

    btn.addEventListener("mouseenter", () => {
      btn.style.background = "rgba(60,60,80,0.85)";
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.background = "rgba(30,30,40,0.65)";
    });

    const svg = btn.querySelector("svg");
    if (svg) {
      svg.style.display = "block";
      svg.style.width = "18px";
      svg.style.height = "18px";
    }

    if (onClick) btn.addEventListener("click", onClick);

    btn.addEventListener("click", (e) => e.stopPropagation());
    btn.addEventListener("pointerdown", (e) => e.stopPropagation());
    btn.addEventListener("pointerup", (e) => e.stopPropagation());

    this.container.appendChild(btn);
    this.buttons.set(key, btn);
    btn.dataset.key = key;
    this._scheduleReorder();
    return btn;
  }

  setOrder(order) {
    this._order = Array.isArray(order) ? order.slice() : [];
    this._reorder();
  }

  _scheduleReorder() {
    if (this._reorderScheduled) return;
    this._reorderScheduled = true;
    queueMicrotask(() => {
      this._reorderScheduled = false;
      this._reorder();
    });
  }

  _reorder() {
    if (!this._order || this._order.length === 0) return;
    const children = Array.from(this.container.children);
    const rank = (child) => {
      const btn = child.dataset?.key
        ? child
        : child.querySelector("[data-key]");
      const key = btn?.dataset?.key;
      if (!key) return Number.MAX_SAFE_INTEGER;
      const pos = this._order.indexOf(key);
      return pos === -1 ? Number.MAX_SAFE_INTEGER : pos;
    };
    children.sort((a, b) => rank(a) - rank(b));
    children.forEach((child) => this.container.appendChild(child));
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
