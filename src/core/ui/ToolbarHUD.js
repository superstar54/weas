class ToolbarHUD {
  constructor(hudController, config = {}) {
    this.hud = hudController;

    this.settings = Object.assign(
      {
        width: 200,
        height: 40,
        panelBackground: "rgba(128,128,128,0.5)",
        panelBorderRadius: 6,
        anchor: "top-right",
        offset: { x: 5, y: 5 },
      },
      config.settings || {},
    );

    this.config = Object.assign({ panelKey: "toolbar" }, config);

    // Create the container element
    this.container = document.createElement("div");
    Object.assign(this.container.style, {
      width: `${this.settings.width}px`,
      height: `${this.settings.height}px`,
      backgroundColor: this.settings.panelBackground,
      borderRadius: `${this.settings.panelBorderRadius}px`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontFamily: "sans-serif",
      fontSize: "14px",
      userSelect: "none",
    });

    this.container.textContent = "Toolbar (placeholder)";

    // Add it to the HUDController
    this.hud.addHTMLPanel(this.config.panelKey, this.container, {
      anchor: this.settings.anchor,
      offset: this.settings.offset,
    });
  }

  setVisible(visible) {
    this.container.style.display = visible ? "flex" : "none";
  }
}

export { ToolbarHUD };
