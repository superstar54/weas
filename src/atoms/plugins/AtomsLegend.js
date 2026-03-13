// Module that interacts with the defined 'Legend' HUD element
// TODO - think on the interface with Legend, maybe some controlled namespaces would be nice
export default class AtomsLegend {
  constructor(viewer, guiConfig) {
    this.viewer = viewer;
    this.guiConfig = guiConfig;

    if (this.getLegendConfig().enabled) {
      this.addLegend();
    }
  }

  addLegend() {
    if (!this.legendHUD) this.legendHUD = this.viewer.tjs.hud.legendHUD;
    const settings = this.viewer.atomManager.settings;

    Object.entries(settings).forEach(([symbol, setting]) => {
      const color =
        typeof setting.color === "string"
          ? setting.color
          : `#${setting.color.getHexString()}`;

      // namespace - atoms
      const key = `atoms:${symbol}`;

      this.legendHUD.addEntry(key, {
        label: symbol,
        color,
        shape: "sphere",
        size: this._radiusToLegendSize(setting.radius),
      });
    });
  }

  removeLegend() {
    if (!this.legendHUD) this.legendHUD = this.viewer.tjs.hud.legendHUD;
    Array.from(this.legendHUD.entries.keys())
      .filter((key) => key.startsWith("atoms:"))
      .forEach((key) => this.legendHUD.removeEntry(key));
  }

  updateLegend() {
    if (this.getLegendConfig().enabled) {
      this.removeLegend();
      this.addLegend();
    } else {
      this.removeLegend();
    }
  }

  getLegendConfig() {
    return (
      this.guiConfig.atomLegend ||
      this.guiConfig.legend || {
        enabled: false,
      }
    );
  }

  _radiusToLegendSize(radius) {
    // map atom radius reasonable pixel size
    // TODO - address issues with SVG and Text alignment
    return Math.min(30, Math.max(18, radius * 24));
  }
}
