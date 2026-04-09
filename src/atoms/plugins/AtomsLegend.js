// Module that interacts with the defined 'Legend' HUD element
// TODO - think on the interface with Legend, maybe some controlled namespaces would be nice
export default class AtomsLegend {
  constructor(viewer, guiConfig) {
    this.viewer = viewer;
    this.legendHUD = this.viewer.tjs.hud.legendHUD;
    this.guiConfig = guiConfig;

    this.addLegend();
  }

  // TODO - this seems to fire alot of times. figure out why and stop since it might be expensive
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

  // TODO wire in the abilty to disable the atoms from appearing in the legend
  updateLegend() {
    this.removeLegend();
    this.addLegend();
  }

  getLegendConfig() {
    return {
      enabled: true,
      ...this.guiConfig.legend,
      ...this.guiConfig.atomLegend,
    };
  }

  _radiusToLegendSize(radius) {
    // map atom radius reasonable pixel size
    // TODO - address issues with SVG and Text alignment
    return Math.min(30, Math.max(12, radius * 24));
  }
}
