import { BaseOperation } from "./baseOperation.js";
import { clearObject } from "../utils.js";

// common shape operation with GUI schema for position, material, color, and opacity
export class ShapeOperation extends BaseOperation {
  static category = "Shapes";

  constructor(weas, shapeName, options = {}) {
    super(weas);

    this.shapeName = shapeName;
    this.options = options;

    // Ensure default values
    this.options.position = this.options.position || [0, 0, 0];
    this.options.materialType = this.options.materialType || "Standard";
    this.options.color = this.options.color || "#ffffff"; // default white
    this.options.opacity = this.options.opacity ?? 1; // default fully opaque

    this.object = null;

    // GUI schema
    this.uiFields = {
      title: `Add ${shapeName}`,
      fields: {
        positionX: { type: "number", path: "options.position.0" },
        positionY: { type: "number", path: "options.position.1" },
        positionZ: { type: "number", path: "options.position.2" },
        material: {
          type: "select",
          path: "options.materialType",
          options: Object.keys(this.weas.materialsRegistry.materials),
        },
        color: {
          type: "color",
          path: "options.color",
        },
        opacity: {
          type: "number",
          path: "options.opacity",
          min: 0,
          max: 1,
          step: 0.01,
        },
      },
    };
  }

  execute() {
    const registry = this.weas.shapeRegistry;
    if (!registry) throw new Error("ShapeRegistry not found");

    this.object = registry.create(this.shapeName, this.options);

    // Apply transparent rendering settings if needed
    if (this.options.transparent || this.options.opacity < 1) {
      this.object.traverse((child) => {
        if (child.isMesh) {
          child.material.transparent = true;
          child.renderOrder = this.options.renderOrder ?? 400;
          child.material.depthWrite = false;
        }
      });
    }

    this.weas.tjs.scene.add(this.object);
    this.weas.tjs.requestRedraw?.();
  }

  supportsAdjustGUI() {
    return !!this.object;
  }

  undo() {
    clearObject(this.weas.tjs.scene, this.object);
  }

  adjust(params) {
    this.adjustWithReset(params, () => this.undo());
  }
}
