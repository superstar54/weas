import { BaseOperation } from "./baseOperation";
import { clearObject } from "../utils";

// common shape operation with GUI schema for position, material, color, and opacity
export class ShapeOperation extends BaseOperation {
  static category = "Shapes";
  static abstract = true;

  constructor(weas, shapeName, options = {}) {
    super(weas);

    this.shapeName = shapeName;
    this.options = options;

    // Ensure default values
    this.options.position = this.options.position || [0, 0, 0];
    this.options.materialType = this.options.materialType || "Standard";
    this.options.color = this.options.color || "#bfbfbf";
    this.options.opacity = this.options.opacity ?? 1;
    this.options.scale = this.options.scale || [1, 1, 1];
    this.options.rotation = this.options.rotation || [0, 0, 0];
    this.options.wireframe = this.options.wireframe || false;

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
        wireframe: {
          type: "boolean",
          path: "options.wireframe",
        },
        opacity: {
          type: "number",
          path: "options.opacity",
          min: 0,
          max: 1,
          step: 0.01,
        },
        scaleX: {
          type: "number",
          path: "options.scale.0",
          min: 0.01,
          max: 10,
          step: 0.01,
        },
        scaleY: {
          type: "number",
          path: "options.scale.1",
          min: 0.01,
          max: 10,
          step: 0.01,
        },
        scaleZ: {
          type: "number",
          path: "options.scale.2",
          min: 0.01,
          max: 10,
          step: 0.01,
        },
        rotationX: {
          type: "number",
          path: "options.rotation.0",
          min: 0,
          max: 360,
          step: 1,
        },
        rotationY: {
          type: "number",
          path: "options.rotation.1",
          min: 0,
          max: 360,
          step: 0.01,
        },
        rotationZ: {
          type: "number",
          path: "options.rotation.2",
          min: 0,
          max: 360,
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

    // Apply scale
    if (this.object) {
      this.object.scale.set(
        this.options.scale[0],
        this.options.scale[1],
        this.options.scale[2],
      );

      // Apply rotation
      this.object.rotation.set(
        this.options.rotation[0] / (360 / Math.PI),
        this.options.rotation[1] / (360 / Math.PI),
        this.options.rotation[2] / (360 / Math.PI),
      );
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
