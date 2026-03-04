import { BaseOperation } from "./baseOperation.js";

class ShapeOperation extends BaseOperation {
  static category = "Shapes";

  /**
   * @param {Object} weas - main WEAS instance
   * @param {string} shapeName - name of the shape registered in ShapeRegistry
   * @param {Object} options - { position, scale, rotation, color, materialType, etc. }
   */
  constructor(weas, shapeName, options = {}) {
    super(weas);

    this.shapeName = shapeName;
    this.options = options;
    this.object = null;

    // Optional: basic UI schema
    this.uiFields = {
      title: `Add ${shapeName}`,
      fields: {
        positionX: { type: "number", path: "options.position.0" },
        positionY: { type: "number", path: "options.position.1" },
        positionZ: { type: "number", path: "options.position.2" },
      },
    };
  }

  execute() {
    const registry = this.weas.shapeRegistry;
    if (!registry) throw new Error("ShapeRegistry not found");

    // Create the shape
    this.object = registry.create(this.shapeName, this.options);

    // Add to scene
    this.weas.tjs.scene.add(this.object);
    this.weas.tjs.requestRedraw?.();
  }

  undo() {
    if (this.object) {
      this.weas.tjs.scene.remove(this.object);
      this.object = null;
      this.weas.tjs.requestRedraw?.();
    }
  }

  adjust(params) {
    this.adjustWithReset(params, () => this.undo());
  }
}

export { ShapeOperation };
