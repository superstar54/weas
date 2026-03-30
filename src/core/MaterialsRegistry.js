import * as THREE from "three";

/**
 * Registry for THREE.js materials.
 * Supports built-in and user-defined materials, cloning, renaming, copying,
 * and exposes editable properties for GUI generation.
 * @module MaterialsRegistry
 * @class
 */
export default class MaterialsRegistry {
  constructor() {
    // Built-in default names
    this._builtIn = new Set(["Standard", "Phong", "Basic"]);

    // Material instances
    this.materials = {
      Standard: new THREE.MeshStandardMaterial({
        metalness: 0.2,
        roughness: 0.5,
      }),
      Phong: new THREE.MeshPhongMaterial({
        specular: 0x222222,
        shininess: 100,
        reflectivity: 0.9,
      }),
      Basic: new THREE.MeshBasicMaterial({ color: 0xffff00 }),
    };

    // Attach schema definitions to built-in materials
    this.materialSchemas = {
      MeshStandardMaterial: {
        metalness: {
          type: "number",
          min: 0,
          max: 1,
          step: 0.01,
          label: "Metalness",
          hide: false,
        },
        roughness: {
          type: "number",
          min: 0,
          max: 1,
          step: 0.01,
          label: "Roughness",
          hide: false,
        },
      },
      MeshPhongMaterial: {
        shininess: {
          type: "number",
          min: 0,
          max: 300,
          step: 1,
          label: "Shininess",
          hide: false,
        },
        reflectivity: {
          type: "number",
          min: 0,
          max: 1,
          step: 0.01,
          label: "Reflectivity",
          hide: true,
        },
      },
      MeshBasicMaterial: {
        // empty
      },
    };

    // Mark built-in materials as read-only
    Object.values(this.materials).forEach((mat) => (mat.__builtIn = true));

    this._callbacks = new Set();
  }

  _emitChange() {
    this._callbacks.forEach((cb) => cb());
  }

  onChange(callback) {
    this._callbacks.add(callback);
    return () => this._callbacks.delete(callback); // unsubscribe
  }

  /** Get a material instance by name. Optionally clone it. */
  getMaterial(name, clone = false) {
    if (!(name in this.materials))
      throw new Error(`Material "${name}" not found`);
    return clone ? this.materials[name].clone() : this.materials[name];
  }

  /** Get the schema (editable properties) for a material */
  getSchema(name) {
    const mat = this.getMaterial(name);
    return this.materialSchemas[mat.type] || [];
  }

  /** Rename a user-defined material */
  renameMaterial(oldName, newName) {
    if (!(oldName in this.materials))
      throw new Error(`Material "${oldName}" not found`);
    if (this._builtIn.has(oldName))
      throw new Error(`Cannot rename built-in material "${oldName}"`);
    if (newName in this.materials)
      console.warn(`Material "${newName}" will overwrite existing`);
    this.materials[newName] = this.materials[oldName];
    delete this.materials[oldName];
    this._emitChange();
  }

  /** Update user-defined material in place */
  updateMaterial(name, overrides) {
    if (!(name in this.materials))
      throw new Error(`Material "${name}" not found`);
    if (this._builtIn.has(name))
      throw new Error(`Cannot modify built-in material "${name}"`);
    Object.assign(this.materials[name], overrides);
    this._emitChange();
  }

  /** Copy a material (built-in or user-defined) */
  copyMaterial(existingName, newName, overrides = {}) {
    if (!(existingName in this.materials))
      throw new Error(`Material "${existingName}" not found`);
    if (newName in this.materials)
      console.warn(`Material "${newName}" will overwrite existing`);
    const matCopy = this.materials[existingName].clone();
    Object.assign(matCopy, overrides);
    matCopy.__userDefined = true;
    this.materials[newName] = matCopy;
    this._emitChange();
  }

  /** List material names */
  list() {
    return Object.keys(this.materials);
  }

  /** List detailed info for all materials */
  listDetails() {
    return Object.entries(this.materials).map(([name, mat]) => ({
      name,
      type: mat.type,
      builtIn: !!mat.__builtIn,
      userDefined: !!mat.__userDefined,
      schema: this.getSchema(name),
    }));
  }
}
