const LEGEND_SHAPE_BASE_STYLE = {
  display: "block",
};

function applyStyle(el, styleObj) {
  Object.assign(el.style, styleObj);
}

class LegendHUD {
  constructor(hudController, config = {}) {
    this.hud = hudController;

    // Default settings (can be overridden via GUIManager)
    this.settings = Object.assign(
      {
        fontFamily: "Lucida Grande, sans-serif",
        fontSize: 20,
        headingFontSize: 24,
        iconSize: 16,
        rowGap: 6,
        columnGap: 10,
        panelPadding: 6,
        panelBackground: "rgba(0, 0, 0, 0.09)",
        panelBorderRadius: 5,
        heading: "Legend",
      },
      config.settings || {},
    );

    this.config = Object.assign(
      {
        position: "bottom-right",
        panelKey: "legend",
      },
      config,
    );

    this.entries = new Map();

    // Main container
    this.container = document.createElement("div");
    this._applyContainerStyle();

    // Optional heading
    if (this.settings.heading) {
      this.headingEl = document.createElement("div");
      this.headingEl.textContent = this.settings.heading;
      this.headingEl.style.fontSize = `${this.settings.headingFontSize}px`;
      this.headingEl.style.marginBottom = `${this.settings.rowGap}px`;
      this.container.appendChild(this.headingEl);
    }

    this.hud.addHTMLPanel(this.config.panelKey, this.container, {
      anchor: this.config.position,
      offset: { x: 0, y: 0 },
    });
  }

  _applyContainerStyle() {
    Object.assign(this.container.style, {
      display: "flex",
      flexDirection: "column",
      gap: `${this.settings.rowGap}px`,
      padding: `${this.settings.panelPadding}px`,
      backgroundColor: this.settings.panelBackground,
      borderRadius: `${this.settings.panelBorderRadius}px`,
      fontFamily: this.settings.fontFamily,
      fontSize: `${this.settings.fontSize}px`,
    });
  }

  addEntry(key, { label, color = "#888", shape = "circle", size = 16 }) {
    if (this.entries.has(key)) this.removeEntry(key);

    const scaledSize = size * (this.settings.iconSize / 16);
    const icon = this._createShape(shape, color, scaledSize);

    const labelEl = document.createElement("span");
    labelEl.textContent = label;

    const row = document.createElement("div");
    Object.assign(row.style, {
      display: "flex",
      alignItems: "center",
      gap: `${this.settings.columnGap}px`,
    });

    row.appendChild(icon);
    row.appendChild(labelEl);

    this.container.appendChild(row);
    this.entries.set(key, row);
  }

  _createShape(shape, color, size) {
    const el = document.createElement("div");
    applyStyle(el, LEGEND_SHAPE_BASE_STYLE);
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;

    switch (shape) {
      case "sphere":
        el.style.borderRadius = "50%";
        el.style.background = `radial-gradient(circle at 30% 30%, #ffffffaa, ${color} 65%, #00000044)`;
        break;
      case "cube":
        el.style.background = `linear-gradient(145deg, #ffffff55, ${color})`;
        el.style.boxShadow = "inset -2px -2px 3px rgba(0,0,0,0.4)";
        break;
      case "square":
        el.style.background = color;
        el.style.borderRadius = "2px";
        break;
      default:
        el.style.background = color;
        el.style.borderRadius = "50%";
    }

    return el;
  }

  removeEntry(key) {
    const row = this.entries.get(key);
    if (!row) return;
    row.remove();
    this.entries.delete(key);
  }

  clear() {
    this.entries.forEach((row) => row.remove());
    this.entries.clear();
  }

  updateSettings(newSettings) {
    Object.assign(this.settings, newSettings);
    this._applyContainerStyle();

    this.entries.forEach((row) => {
      row.style.gap = `${this.settings.columnGap}px`;
      row.querySelector("span").style.fontSize = `${this.settings.fontSize}px`;
      const icon = row.querySelector("div");
      if (icon) {
        const baseSize = parseFloat(icon.dataset.baseSize || icon.offsetWidth);
        const scaled = baseSize * (this.settings.iconSize / 16);
        icon.style.width = icon.style.height = `${scaled}px`;
      }
    });

    if (this.headingEl)
      this.headingEl.style.fontSize = `${this.settings.headingFontSize}px`;
  }
}

export { LegendHUD };
