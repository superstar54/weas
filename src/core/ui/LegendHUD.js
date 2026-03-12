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

    // Create the container as an HTML panel in HUD
    this.container = document.createElement("div");
    this.container.style.display = "flex";
    this.container.style.flexDirection = "column";
    this.container.style.padding = "10px";
    this.container.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
    this.container.style.borderRadius = "8px";
    this.container.style.fontFamily = "sans-serif";
    this.container.style.fontSize = "14px";
    this.container.style.gap = "5px";

    this.hud.addHTMLPanel(this.config.panelKey, this.container, {
      anchor: this.config.position,
      offset: { x: 0, y: 0 },
    });
  }

  addEntry(key, { label, color = "#888", shape = "circle", size = 16 }) {
    if (this.entries.has(key)) {
      this.removeEntry(key);
    }

    const entry = document.createElement("div");
    entry.style.display = "flex";
    entry.style.alignItems = "center";
    entry.style.gap = "5px";

    const shapeEl = document.createElement("div");
    shapeEl.style.width = `${size}px`;
    shapeEl.style.height = `${size}px`;
    shapeEl.style.backgroundColor = color;
    shapeEl.style.borderRadius = shape === "circle" ? "50%" : "4px";
    shapeEl.style.flexShrink = "0";

    const labelEl = document.createElement("span");
    labelEl.textContent = label;

    entry.appendChild(shapeEl);
    entry.appendChild(labelEl);

    this.container.appendChild(entry);
    this.entries.set(key, entry);
  }

  removeEntry(key) {
    const entry = this.entries.get(key);
    if (entry) {
      entry.remove();
      this.entries.delete(key);
    }
  }

  clear() {
    this.entries.forEach((entry) => entry.remove());
    this.entries.clear();
  }
}

export { LegendHUD };
