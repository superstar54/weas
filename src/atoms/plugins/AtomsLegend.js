// TODO - think on the interface with Legend, maybe some controlled namespaces would be nice

/**
 * Manages the atom legend displayed in the HUD.
 *
 * The legend is derived from atom rendering settings and is responsible
 * for showing a visual mapping between atom symbols, colors, and sizes.
 *
 * It interacts with the HUD layer (`legendHUD`) and is fully regenerated
 * when atom styles change.
 *
 * @class
 */
export class AtomsLegend {
  /**
   * @param {Object} viewer - Main viewer instance.
   * @param {Object} guiConfig - Configuration object for GUI/legend behavior.
   */
  constructor(viewer, guiConfig) {
    this.viewer = viewer;
    this.legendHUD = this.viewer.tjs.hud.legendHUD;
    this.guiConfig = guiConfig;

    this.addLegend();
  }

  /**
   * Builds legend entries from current atom settings.
   *
   * Iterates over atom styles and creates HUD entries for each unique symbol.
   * Each entry is namespaced under `"atoms:"`.
   *
   * @returns {void}
   */
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

  /**
   * Removes all atom-related legend entries from the HUD.
   *
   * Only entries prefixed with `"atoms:"` are removed.
   *
   * @returns {void}
   */
  removeLegend() {
    if (!this.legendHUD) this.legendHUD = this.viewer.tjs.hud.legendHUD;
    Array.from(this.legendHUD.entries.keys())
      .filter((key) => key.startsWith("atoms:"))
      .forEach((key) => this.legendHUD.removeEntry(key));
  }

  /**
   * Rebuilds the legend from scratch.
   *
   * This is a full reset: existing atom legend entries are removed first,
   * then recreated from current atom settings.
   *
   * @returns {void}
   */
  updateLegend() {
    this.removeLegend();
    this.addLegend();
  }

  // TODO: wire this in in a nicer way

  /**
   * Returns conjoined legend configuration state to determine whether to add atoms to legend
   * enabbled : true || false
   * @returns {Object} Legend configuration object.
   */
  getLegendConfig() {
    return {
      enabled: true,
      ...this.guiConfig.legend,
      ...this.guiConfig.atomLegend,
    };
  }

  /**
   * Converts atomic radius into a visual legend size.
   *
   * Used to normalize atom scale into a reasonable pixel size
   * for UI display.
   *
   * @param {number} radius - Atomic radius value.
   * @returns {number} Clamped pixel size for legend rendering.
   * @private
   */
  _radiusToLegendSize(radius) {
    // map atom radius reasonable pixel size
    // TODO - address issues with SVG and Text alignment
    return Math.min(30, Math.max(12, radius * 24));
  }
}
