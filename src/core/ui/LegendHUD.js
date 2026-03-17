const LEGEND_SHAPE_BASE_STYLE = {
  display: "block",
};

function applyStyle(el, styleObj) {
  Object.assign(el.style, styleObj);
}

// TODO - investigate bad alignment due to svgs
class LegendHUD {
  constructor(hudController, config = {}) {
    this.hud = hudController;

    this.paramsSchema = {
      fontFamily: {
        type: "string",
        default: "sans-serif",
        label: "Font Family",
      },
      fontSize: {
        type: "number",
        min: 8,
        max: 36,
        step: 1,
        default: 20,
        label: "Label Font Size",
      },
      headingFontSize: {
        type: "number",
        min: 10,
        max: 48,
        step: 1,
        default: 24,
        label: "Heading Font Size",
      },
      iconSize: {
        type: "number",
        min: 4,
        max: 48,
        step: 1,
        default: 16,
        label: "Icon Size",
      },
      rowGap: {
        type: "number",
        min: 0,
        max: 20,
        step: 1,
        default: 6,
        label: "Row Gap",
      },
      columnGap: {
        type: "number",
        min: 0,
        max: 30,
        step: 1,
        default: 10,
        label: "Column Gap",
      },
      panelPadding: {
        type: "number",
        min: 0,
        max: 20,
        step: 1,
        default: 6,
        label: "Panel Padding",
      },
      panelBackground: {
        type: "color",
        default: "rgba(0,0,0,0.1)",
        label: "Background",
      },
      panelBorderRadius: {
        type: "number",
        min: 0,
        max: 20,
        step: 1,
        default: 5,
        label: "Border radius",
      },
      heading: {
        type: "string",
        default: "Legend",
        label: "Heading Text",
      },
    };

    // --- initialize defaults
    this.initDefaults();

    // Merge user settings
    if (config.settings) this.setParams(config.settings);

    this.config = Object.assign(
      { position: "bottom-right", panelKey: "legend" },
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

  // --- initialize defaults from paramsSchema
  initDefaults() {
    this.settings = {};
    for (const [key, meta] of Object.entries(this.paramsSchema)) {
      this.settings[key] = meta.default;
    }
  }

  setParams(params = {}) {
    Object.assign(this.settings, params);
    this.updateSettings({});
  }

  getParams() {
    const params = {};
    for (const key of Object.keys(this.paramsSchema)) {
      params[key] = this.settings[key];
    }
    return params;
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
    icon.dataset.baseSize = size; // used in scale

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
      const label = row.querySelector("span");
      if (label) label.style.fontSize = `${this.settings.fontSize}px`;

      const icon = row.querySelector("div");
      if (icon && icon.dataset.baseSize) {
        const baseSize = parseFloat(icon.dataset.baseSize);
        const scaled = baseSize * (this.settings.iconSize / 16);
        icon.style.width = icon.style.height = `${scaled}px`;
      }
    });

    if (this.headingEl) {
      this.headingEl.style.fontSize = `${this.settings.headingFontSize}px`;
      if ("heading" in newSettings) {
        this.headingEl.textContent = this.settings.heading;
      }
    }
  }

  getSchema() {
    return this.paramsSchema;
  }
}

export { LegendHUD };
