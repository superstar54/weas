import * as THREE from "three";

export default class MaterialsRegistry {
  constructor() {
    // Built-in defaults
    this._builtIn = new Set(["Standard", "Phong", "Basic"]);

    this.materials = {
      Standard: new THREE.MeshStandardMaterial({
        metalness: 0.2,
        roughness: 0.5,
        envMapIntensity: 0.8,
      }),
      Phong: new THREE.MeshPhongMaterial({
        specular: 0x222222,
        shininess: 100,
        reflectivity: 0.9,
      }),
      Basic: new THREE.MeshBasicMaterial({ color: 0xffff00 }),
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

  // get a material by name so that it can be used elsewhere
  getMaterial(name, clone = false) {
    if (!(name in this.materials)) {
      throw new Error(`Material "${name}" not found`);
    }
    return clone ? this.materials[name].clone() : this.materials[name];
  }

  // allow renaming
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

  // allow in spot updating
  updateMaterial(name, overrides) {
    if (!(name in this.materials))
      throw new Error(`Material "${name}" not found`);
    if (this._builtIn.has(name))
      throw new Error(`Cannot modify built-in material "${name}"`);
    Object.assign(this.materials[name], overrides);

    this._emitChange();
  }

  // Allow direct copying (with overrides)
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

  // Access all available material names
  list() {
    // return fresh array of keys every time
    return Object.keys(this.materials);
  }

  listDetails() {
    return Object.entries(this.materials).map(([name, mat]) => ({
      name,
      type: mat.type,
      builtIn: !!mat.__builtIn,
      userDefined: !!mat.__userDefined,
    }));
  }
}
