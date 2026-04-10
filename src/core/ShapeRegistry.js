import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils";
import { ConvexGeometry } from "three/addons/geometries/ConvexGeometry.js";

/**
 * ShapeRegistry manages a collection of reusable 3D shapes for the scene.
 *
 * Allows external registration of shapes and notifies listeners when the
 * available shapes change, so UIs can reflect the current set.
 *
 * Shapes are created via factory functions that accept (materialsRegistry, options)
 * and return a THREE.Object3D. Built-in shapes cover common primitives; custom
 * shapes can be registered via register().
 *
 * Creation of shapes this way avoids the operations manager entirely and
 * acts as a way to add shapes to a scene without interacting with history or
 * state (for example, initialising atoms). It also exposes the ability to
 * override default settings that operations doesn't expose (e.g. shape segments).
 *
 * Example usage:
 *   const registry = new ShapeRegistry(materialsRegistry);
 *   const cube = registry.create("Cube", { position: [1,2,3], scale: [2,2,2], materialType: "Phong" });
 *   scene.add(cube);
 *
 *   // Programmatic-only shapes (not exposed in GUI):
 *   const cell = registry.create("ConvexShape", { corners: [...], edges: true, color: 0x00ffff });
 *   scene.add(cell);
 *  ShapeRegistry
 * @class
 */
export class ShapeRegistry {
  /**
   * @param {MaterialsRegistry} materialRegistry - The material manager used for creating shapes.
   */
  constructor(materialRegistry) {
    this.shapes = {};
    this.meta = {};
    this.materials = materialRegistry;
    this._callbacks = new Set();
    this._registerBuiltIns();
  }

  /**
   * Notify listeners that the registered shapes have changed.
   * @private
   */
  _emitChange() {
    this._callbacks.forEach((cb) => cb());
  }

  /**
   * Subscribe to changes in the registered shapes (e.g. for refreshing a GUI list).
   * @param {function} callback - Called whenever a shape is registered or overwritten
   * @returns {function} Unsubscribe function
   */
  onChange(callback) {
    this._callbacks.add(callback);
    return () => this._callbacks.delete(callback);
  }

  /**
   * Creates a base THREE.Mesh with a material from the registry.
   * Handles color, opacity, transparency, wireframe, and double-sided rendering.
   *
   * Note: getMaterial is called with clone=true to avoid mutating shared material instances.
   *
   * @param {object} materialsRegistry
   * @param {THREE.BufferGeometry} geometry
   * @param {object} options
   * @returns {THREE.Mesh}
   */
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

    /**
     * Line — a simple two-point line segment.
     *
     * Options:
     *   start:    number[3]  — start point, default [0,0,0]
     *   end:      number[3]  — end point, default [0,1,0]
     *   color:    string     — CSS or hex color, default "#000000"
     *
     * Note: position/scale/rotation are handled inside this factory.
     * FIXME: investigate highlighting lines well.
     */
    this.register("Line", (materials, options) => {
      const color = options.color || "#000000";
      const start = options.start || [0, 0, 0];
      const end = options.end || [0, 1, 0];

      const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color });

      return new THREE.Line(geometry, material);
      // position, scale, rotation and userData all handled by create()
    });

    /**
     * Arrow — a shaft + cone arrow, optionally oriented between two points.
     *
     * Options:
     *   start:       number[3]  — base of arrow
     *   end:         number[3]  — tip of arrow (determines direction and length)
     *   length:      number     — total length (default 1), used when start/end not provided
     *   shaftRatio:  number     — fraction of length used for shaft (default 0.75)
     *   shaftRadius: number     — relative shaft radius (default 0.075)
     *   headRadius:  number     — relative head radius (default 0.15)
     *   segments:    number     — radial segments (default 12)
     */
    this.register("Arrow", (materials, options) => {
      const shaftRatio = options.shaftRatio ?? 0.75;
      const totalLength = options.length ?? 1;
      const shaftLength = totalLength * shaftRatio;
      const headLength = totalLength - shaftLength;
      const shaftRadius = (options.shaftRadius ?? 0.075) * totalLength;
      const headRadius = (options.headRadius ?? 0.15) * totalLength;

      const shaft = new THREE.CylinderGeometry(
        shaftRadius,
        shaftRadius,
        shaftLength,
        options.segments ?? 12,
      );
      shaft.translate(0, shaftLength / 2, 0);

      const cone = new THREE.ConeGeometry(
        headRadius,
        headLength,
        options.segments ?? 12,
      );
      cone.translate(0, shaftLength + headLength / 2, 0);

      const geometry = mergeGeometries([shaft, cone], false);
      const arrow = this._createBaseMesh(materials, geometry, options);

      if (options.start && options.end) {
        const start = new THREE.Vector3(...options.start);
        const end = new THREE.Vector3(...options.end);
        const dir = new THREE.Vector3().subVectors(end, start);
        const length = dir.length();
        dir.normalize();

        arrow.scale.set(1, length / totalLength, 1);

        const axis = new THREE.Vector3(0, 1, 0).cross(dir);
        const angle = Math.acos(new THREE.Vector3(0, 1, 0).dot(dir));
        if (axis.lengthSq() > 0)
          arrow.quaternion.setFromAxisAngle(axis.normalize(), angle);

        arrow.position.copy(start);
      }

      return arrow;
    });

    /**
     * ConvexShape — builds a convex hull from an arbitrary set of 3D corners.
     *
     * This is a programmatic-only shape and should not be exposed in the GUI,
     * as it requires corners to be provided explicitly.
     *
     * Options:
     *   corners: number[][] | THREE.Vector3[]  — required, at least 4 non-coplanar points
     *   edges:   boolean                       — if true, renders only the outline edges
     *                                            (e.g. for unit cell boxes); otherwise
     *                                            renders as a solid mesh
     *
     * The returned object exposes an updateCorners(newCorners) method for efficient
     * in-place geometry updates (e.g. during trajectory playback).
     *
     * Example:
     *   registry.create("ConvexShape", { corners: [[0,0,0],[1,0,0],...], edges: true })
     */
    this.registerProgrammatic("ConvexShape", (materials, options) => {
      if (!options.corners?.length) {
        throw new Error(
          "ConvexShape requires at least 4 corners as [x,y,z] arrays",
        );
      }

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

        mesh.updateCorners = (newCorners) => {
          const verts = newCorners.map((c) =>
            c.isVector3 ? c : new THREE.Vector3(...c),
          );
          mesh.geometry.dispose();
          mesh.geometry = new THREE.EdgesGeometry(new ConvexGeometry(verts));
        };

        return mesh;
      }

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

  /**
   * Register a custom shape factory.
   * The factory receives (materialsRegistry, options) and should return a THREE.Object3D.
   * position, scale, rotation and userData are applied automatically by create() after
   * the factory returns.
   *
   * @param {string} name - Shape name (warns if overwriting an existing shape)
   * @param {function} factoryFn - (materials, options) => THREE.Object3D
   */
  register(name, factoryFn) {
    if (this.shapes[name]) console.warn(`Shape "${name}" is being overwritten`);
    this.shapes[name] = factoryFn;
    this._emitChange();
  }

  /**
   * Register a shape that requires programmatic input and should not appear in the GUI.
   * Use this for shapes that cannot be meaningfully configured through standard GUI fields
   * (e.g. ConvexShape which requires explicit corner coordinates).
   *
   * The shape is still fully accessible via create() for programmatic use.
   *
   * @param {string} name - Shape name
   * @param {function} factoryFn - (materials, options) => THREE.Object3D
   */
  registerProgrammatic(name, factoryFn) {
    this.register(name, factoryFn);
    this.meta[name] = { programmatic: true };
  }

  /**
   * Returns whether a shape should be shown in the GUI.
   * Shapes registered via registerProgrammatic() return false.
   *
   * @param {string} name - Shape name
   * @returns {boolean}
   */
  isGUIVisible(name) {
    return !this.meta[name]?.programmatic;
  }

  /**
   * Creates and returns a new instance of a registered shape.
   * Automatically applies position, scale, rotation (in degrees), and userData
   * from options after the factory returns.
   *
   * @param {string} name - Registered shape name
   * @param {object} options - Shape options passed to the factory, plus:
   *   position:   number[3]  — world position
   *   scale:      number[3]  — scale
   *   rotation:   number[3]  — euler rotation in degrees
   *   notSelectable: boolean — marks object as non-selectable
   *   type:       string     — stored in userData.type
   *   customData: object     — arbitrary key/values merged into userData
   * @returns {THREE.Object3D}
   */
  create(name, options = {}) {
    const factory = this.shapes[name];
    if (!factory) throw new Error(`Shape "${name}" not registered`);
    const shape = factory(this.materials, options);

    if (shape instanceof THREE.Object3D) {
      if (options.position) shape.position.set(...options.position);
      if (options.scale) shape.scale.set(...options.scale);
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

  /**
   * Returns the names of all currently registered shapes.
   * @returns {string[]}
   */
  list() {
    return Object.keys(this.shapes);
  }
}
