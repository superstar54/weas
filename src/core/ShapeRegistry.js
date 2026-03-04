import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * ShapeRegistry manages a collection of reusable 3D shapes for the scene.
 *
 * Allows external registration of shapes
 * Notifies listeners of all the availible shapes so that they can be inspected and created
 *
 * Example usage:
 * const registry = new ShapeRegistry(materialsRegistry);
 * const cube = registry.create("Cube", { position: [1,2,3], scale: [2,2,2], materialType: "Phong" });
 * scene.add(cube);
 *
 * Creation of shapes this way avoids the operations manager entirely and
 * acts as a way to add shapes to a scene without interacting with history or state (for example initialising atoms)
 * also exposes the ability to override default settings that operations doesnt expose (i.e. shape segments...)
 */
export default class ShapeRegistry {
  constructor(materialRegistry) {
    this.shapes = {};
    this.materials = materialRegistry;
    this._callbacks = new Set();

    this._registerBuiltIns();
  }

  _emitChange() {
    this._callbacks.forEach((cb) => cb());
  }

  onChange(callback) {
    this._callbacks.add(callback);
    return () => this._callbacks.delete(callback);
  }

  _createBaseMesh(
    materialsRegistry,
    geometry,
    { materialType = "Standard", color = "#bd0d87", opacity = 1.0, wireframe = false } = {},
  ) {
    const material = materialsRegistry.getMaterial(materialType, true);
    if ("color" in material) material.color = new THREE.Color(color);
    material.transparent = true;
    material.opacity = opacity;
    material.side = THREE.DoubleSide;
    material.wireframe = wireframe; 
    if (opacity < 1.0) {
      material.depthWrite = false;
    }

    console.log("mat", material)

    return new THREE.Mesh(geometry, material);
  }

  _registerBuiltIns() {
    const s = 1;
    this.register("Cube", (materials, options) =>
      this._createBaseMesh(
        materials,
        new THREE.BoxGeometry(2 * s, 2 * s, 2 * s),
        options,
      ),
    );

    this.register("Sphere", (materials, options) => {
      const widthSegments = options.widthSegments ?? 32;
      const heightSegments = options.heightSegments ?? 32;

      return this._createBaseMesh(
        materials,
        new THREE.SphereGeometry(s, widthSegments, heightSegments),
        options,
      );
    });

    this.register("Plane", (materials, options) =>
      this._createBaseMesh(
        materials,
        new THREE.PlaneGeometry(2 * s, 2 * s),
        options,
      ),
    );

    this.register("Cylinder", (materials, options) => {
      const segments = options.segments ?? 24;

      return this._createBaseMesh(
        materials,
        new THREE.CylinderGeometry(s, s, s, segments),
        options,
      );
    });

    this.register("Cone", (materials, options) =>
      this._createBaseMesh(
        materials,
        new THREE.ConeGeometry(s, 2 * s, 16),
        options,
      ),
    );

    this.register("Torus", (materials, options) =>
      this._createBaseMesh(
        materials,
        new THREE.TorusGeometry(s * 0.75, s * 0.25, 16, 32),
        options,
      ),
    );

    this.register("Arrow", (materials, options) => {
      const shaftRatio = 0.75;
      const totalLength = s;
      const shaftLength = totalLength * shaftRatio;
      const headLength = totalLength - shaftLength;

      const shaftRadius = (options.shaftRadius ?? 0.075) * s;
      const headRadius = (options.headRadius ?? 0.15) * s;

      // Shaft
      const shaft = new THREE.CylinderGeometry(
        shaftRadius,
        shaftRadius,
        shaftLength,
        options.segments ?? 12,
      );
      shaft.translate(0, shaftLength / 2, 0); // anchor at base

      // Cone
      // should sit ontop of shaft irrespective of relative scaling
      const cone = new THREE.ConeGeometry(
        headRadius,
        headLength,
        options.segments ?? 12,
      );
      cone.translate(0, shaftLength + headLength / 2, 0);

      // Merge into a single BaseMesh so scale works uniform
      const geometry = mergeGeometries([shaft, cone], false);

      return this._createBaseMesh(materials, geometry, options);
    });
  }

  // Register a custom shape
  register(name, factoryFn) {
    if (this.shapes[name]) console.warn(`Shape "${name}" is being overwritten`);
    this.shapes[name] = factoryFn;
    this._emitChange();
  }

  // Create a shape (returns a new mesh or group)
  create(name, options = {}) {
    const factory = this.shapes[name];
    if (!factory) throw new Error(`Shape "${name}" not registered`);
    const shape = factory(this.materials, options);

    if (shape instanceof THREE.Object3D) {
      if (options.position) shape.position.set(...options.position);
      if (options.scale) shape.scale.set(...options.scale);

      // rotation in degrees.
      if (options.rotation) {
        const [rx, ry, rz] = options.rotation;
        shape.rotation.set(
          THREE.MathUtils.degToRad(rx),
          THREE.MathUtils.degToRad(ry),
          THREE.MathUtils.degToRad(rz),
        );
      }
    }

    return shape;
  }

  list() {
    return Object.keys(this.shapes);
  }
}
