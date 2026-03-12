const LEGEND_CONTAINER_STYLE = {
  display: "grid",
  gridTemplateColumns: "22px auto",
  rowGap: "6px",
  columnGap: "20px",
  padding: "10px 12px",
  backgroundColor: "rgba(0, 0, 0, 0.09)",
  borderRadius: "8px",
  fontFamily: "sans-serif",
  fontSize: "20px",
  alignItems: "center",
  justifyItems: "center",
};

const LEGEND_SHAPE_BASE_STYLE = {
  display: "block",
};

function applyStyle(el, styleObj) {
  Object.assign(el.style, styleObj);
}

class LegendHUD {
  constructor(hudController, config = {}) {
    this.hud = hudController;

    this.config = Object.assign(
      {
        position: "bottom-right",
        panelKey: "legend",
      },
      config,
    );

    this.entries = new Map();

    this.container = document.createElement("div");
    applyStyle(this.container, LEGEND_CONTAINER_STYLE);

    this.hud.addHTMLPanel(this.config.panelKey, this.container, {
      anchor: this.config.position,
      offset: { x: 0, y: 0 },
    });
  }

  addEntry(key, { label, color = "#888", shape = "circle", size = 14 }) {
    if (this.entries.has(key)) {
      this.removeEntry(key);
    }

    const icon = this._createShape(shape, color, size);

    const labelEl = document.createElement("span");
    labelEl.textContent = label;
    labelEl.style.textAlign = "left";
    labelEl.style.justifySelf = "start";

    this.container.appendChild(icon);
    this.container.appendChild(labelEl);

    this.entries.set(key, [icon, labelEl]);
  }

  _createShape(shape, color, size) {
    const el = document.createElement("div");

    applyStyle(el, LEGEND_SHAPE_BASE_STYLE);

    el.style.width = `${size}px`;
    el.style.height = `${size}px`;

    switch (shape) {
      case "circle":
        el.style.background = color;
        el.style.borderRadius = "50%";
        break;

      case "square":
        el.style.background = color;
        el.style.borderRadius = "2px";
        break;

      case "sphere":
        el.style.borderRadius = "50%";
        el.style.background = `radial-gradient(circle at 30% 30%, #ffffffaa, ${color} 65%, #00000044)`;
        break;

      case "cube":
        el.style.background = `linear-gradient(145deg, #ffffff55, ${color})`;
        el.style.boxShadow = "inset -2px -2px 3px rgba(0,0,0,0.4)";
        break;

      default:
        el.style.background = color;
        el.style.borderRadius = "50%";
    }

    return el;
  }

  removeEntry(key) {
    const entry = this.entries.get(key);
    if (!entry) return;

    entry[0].remove();
    entry[1].remove();

    this.entries.delete(key);
  }

  clear() {
    this.entries.forEach(([icon, label]) => {
      icon.remove();
      label.remove();
    });

    this.entries.clear();
  }
}

export { LegendHUD };
