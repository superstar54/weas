export default class AtomsLegend {
  constructor(viewer, guiConfig) {
    this.viewer = viewer;
    this.guiConfig = guiConfig;
    this.legendContainer = null;

    if (this.guiConfig.legend && this.guiConfig.legend.enabled) {
      this.addLegend();
    }
  }

  addLegend() {
    // Remove existing legend if any
    this.removeLegend();

    // Create legend container
    this.legendContainer = document.createElement("div");
    this.legendContainer.id = "legend-container";
    this.legendContainer.style.position = "absolute";
    this.legendContainer.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
    this.legendContainer.style.padding = "10px";
    // bottom margin to avoid overlapping with other GUI elements
    this.legendContainer.style.marginBottom = "30px";
    this.legendContainer.style.borderRadius = "5px";
    this.legendContainer.style.zIndex = "1000";

    // Positioning based on configuration
    this.setLegendPosition(this.legendContainer);

    // Add entries for each unique element
    Object.entries(this.viewer.atomManager.settings).forEach(([symbol, setting]) => {
      const legendEntry = document.createElement("div");
      legendEntry.style.display = "flex";
      legendEntry.style.alignItems = "center";
      legendEntry.style.marginBottom = "5px";

      // Sphere representation
      const sphereCanvas = document.createElement("canvas");
      sphereCanvas.width = 20;
      sphereCanvas.height = 20;
      const context = sphereCanvas.getContext("2d");
      if (typeof setting.color === "string") {
        context.fillStyle = setting.color;
      } else {
        context.fillStyle = `#${setting.color.getHexString()}`;
      }
      const radius = Math.min(setting.radius * 10, 8); // Cap radius to maintain a spherical look
      context.beginPath();
      context.arc(10, 10, radius, 0, Math.PI * 2);
      context.fill();

      legendEntry.appendChild(sphereCanvas);

      // Symbol label
      const elementLabel = document.createElement("span");
      elementLabel.textContent = ` ${symbol}`;
      elementLabel.style.marginLeft = "5px";
      elementLabel.style.fontSize = "14px";
      legendEntry.appendChild(elementLabel);

      this.legendContainer.appendChild(legendEntry);
    });

    // Append legend to viewer container
    this.viewer.tjs.containerElement.appendChild(this.legendContainer);
  }

  removeLegend() {
    if (this.legendContainer) {
      this.legendContainer.remove();
      this.legendContainer = null;
    }
  }

  updateLegend() {
    if (this.guiConfig.legend && this.guiConfig.legend.enabled) {
      this.addLegend();
    } else {
      this.removeLegend();
    }
  }

  setLegendPosition(legendContainer) {
    const position = this.guiConfig.legend.position || "top-right";
    legendContainer.style.top = position.includes("top") ? "10px" : "";
    legendContainer.style.bottom = position.includes("bottom") ? "10px" : "";
    legendContainer.style.left = position.includes("left") ? "10px" : "";
    legendContainer.style.right = position.includes("right") ? "10px" : "";
  }
}
