import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils";
import { ConvexGeometry } from "three/addons/geometries/ConvexGeometry.js";

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
    {
      materialType = "Standard",
      color = "#bd0d87",
      opacity = 1.0,
      wireframe = false,
    } = {},
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

    this.register("Line", (materials, options) => {
      const color = options.color || "#000000";
      // accepts start and end as simple directions
      const start = options.start || [0, 0, 0];
      const end = options.end || [0, 1, 0]; // default to 'up'

      const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color });

      const line = new THREE.Line(geometry, material);

      // scale and position
      if (options.position) line.position.set(...options.position);
      if (options.scale) line.scale.set(...options.scale);
      if (options.rotation) {
        const [rx, ry, rz] = options.rotation;
        line.rotation.set(
          THREE.MathUtils.degToRad(rx),
          THREE.MathUtils.degToRad(ry),
          THREE.MathUtils.degToRad(rz),
        );
      }
      // FIXME: - investigate highlighting lines well.
      if (options.notSelectable) line.userData.notSelectable = true;
      if (options.type) line.userData.type = options.type;
      return line;
    });

    // --- Somewhat complex built in shapes that require a little bit of thought to use well
    this.register("Arrow", (materials, options) => {
      const shaftRatio = options.shaftRatio ?? 0.75;
      const totalLength = options.length ?? 1;
      const shaftLength = totalLength * shaftRatio;
      const headLength = totalLength - shaftLength;

      const shaftRadius = (options.shaftRadius ?? 0.075) * totalLength;
      const headRadius = (options.headRadius ?? 0.15) * totalLength;

      // Shaft
      const shaft = new THREE.CylinderGeometry(
        shaftRadius,
        shaftRadius,
        shaftLength,
        options.segments ?? 12,
      );
      shaft.translate(0, shaftLength / 2, 0);

      // Cone
      const cone = new THREE.ConeGeometry(
        headRadius,
        headLength,
        options.segments ?? 12,
      );
      cone.translate(0, shaftLength + headLength / 2, 0);

      const geometry = mergeGeometries([shaft, cone], false);
      const arrow = this._createBaseMesh(materials, geometry, options);

      // accepts start and end as simple directions
      if (options.start && options.end) {
        const start = new THREE.Vector3(...options.start);
        const end = new THREE.Vector3(...options.end);
        const dir = new THREE.Vector3().subVectors(end, start);
        const length = dir.length();
        dir.normalize();

        // Scale to actual distance
        arrow.scale.set(1, length / totalLength, 1);

        // Rotate Y-axis to match direction
        const axis = new THREE.Vector3(0, 1, 0).cross(dir);
        const angle = Math.acos(new THREE.Vector3(0, 1, 0).dot(dir));
        if (axis.lengthSq() > 0)
          arrow.quaternion.setFromAxisAngle(axis.normalize(), angle);

        // Position base at start
        arrow.position.copy(start);
      }

      return arrow;
    });

    // draw a generic Convex Shape
    this.register("ConvexShape", (materials, options) => {
      const corners = options.corners.map((c) =>
        c.isVector3 ? c : new THREE.Vector3(...c),
      );
      const geometry = new ConvexGeometry(corners);

      if (options.edges) {
        const edges = new THREE.EdgesGeometry(geometry);
        const mat = new THREE.LineBasicMaterial({
          color: options.color ?? 0xffffff,
        });
        const mesh = new THREE.LineSegments(edges, mat);

        // attach updater directly to the object
        mesh.updateCorners = (newCorners) => {
          const verts = newCorners.map((c) =>
            c.isVector3 ? c : new THREE.Vector3(...c),
          );
          const newGeo = new ConvexGeometry(verts);
          mesh.geometry.dispose();
          mesh.geometry = new THREE.EdgesGeometry(newGeo);
        };

        return mesh;
      }

      // solid case
      const mesh = this._createBaseMesh(materials, geometry, options);
      mesh.updateCorners = (newCorners) => {
        const verts = newCorners.map((c) =>
          c.isVector3 ? c : new THREE.Vector3(...c),
        );
        mesh.geometry.dispose();
        mesh.geometry = new ConvexGeometry(verts);
      };
      return mesh;
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

    if (options.notSelectable) shape.userData.notSelectable = true;
    if (options.type) shape.userData.type = options.type;
    if (options.customData) {
      Object.entries(options.customData).forEach(
        ([k, v]) => (shape.userData[k] = v),
      );
    }

    return shape;
  }

  list() {
    return Object.keys(this.shapes);
  }
}
