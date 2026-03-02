import * as THREE from "three";

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
    { materialType = "Standard", color = "#bd0d87", opacity = 1.0 } = {},
  ) {
    console.log("called with", materialType);
    const material = materialsRegistry.getMaterial(materialType, true);
    if ("color" in material) material.color = new THREE.Color(color);
    material.transparent = true;
    material.opacity = opacity;
    material.side = THREE.DoubleSide;

    return new THREE.Mesh(geometry, material);
  }

  // Register built-in primitives
  _registerBuiltIns() {
    this.register("Cube", (materials, options) =>
      this._createBaseMesh(materials, new THREE.BoxGeometry(1, 1, 1), options),
    );

    this.register("Sphere", (materials, options) =>
      this._createBaseMesh(
        materials,
        new THREE.SphereGeometry(0.5, 16, 16),
        options,
      ),
    );

    this.register("Plane", (materials, options) =>
      this._createBaseMesh(materials, new THREE.PlaneGeometry(1, 1), options),
    );

    this.register("Cylinder", (materials, options) =>
      this._createBaseMesh(
        materials,
        new THREE.CylinderGeometry(0.5, 0.5, 1, 16),
        options,
      ),
    );

    this.register("Cone", (materials, options) =>
      this._createBaseMesh(
        materials,
        new THREE.ConeGeometry(0.5, 1, 16),
        options,
      ),
    );

    this.register("Torus", (materials, options) =>
      this._createBaseMesh(
        materials,
        new THREE.TorusGeometry(0.5, 0.2, 16, 32),
        options,
      ),
    );

    this.register("Arrow", (materials, options) => {
      const group = new THREE.Group();
      const shaft = this._createBaseMesh(
        materials,
        new THREE.CylinderGeometry(0.05, 0.05, 1, 12),
        options,
      );
      shaft.position.set(0, 0.5, 0);

      const cone = this._createBaseMesh(
        materials,
        new THREE.ConeGeometry(0.1, 0.2, 12),
        options,
      );
      cone.position.set(0, 1.1, 0);

      group.add(shaft);
      group.add(cone);

      return group;
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
