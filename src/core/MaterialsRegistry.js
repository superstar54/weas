import * as THREE from "three";

/**
 * Registry for THREE.js materials.
 * Supports built-in and user-defined materials, cloning, renaming, copying,
 * and exposes editable properties for GUI generation.
 * @class
 */
export class MaterialsRegistry {
  constructor(serializedData = null) {
    // Built-in default names
    this._builtIn = new Set(["Standard", "Phong", "Basic"]);

    // Material instances
    this.materials = {};
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
        color: {
          type: "color",
          label: "Color",
          hide: false,
        },
      },
    };

    // Initialize built-in materials
    this._initBuiltInMaterials();

    this._callbacks = new Set();

    // Load serialized data if provided
    if (serializedData) {
      this.fromJSON(serializedData);
    }
  }

  _initBuiltInMaterials() {
    // Built-in materials
    this.materials.Standard = new THREE.MeshStandardMaterial({
      metalness: 0.2,
      roughness: 0.5,
    });

    this.materials.Phong = new THREE.MeshPhongMaterial({
      specular: 0x222222,
      shininess: 100,
      reflectivity: 0.9,
    });

    this.materials.Basic = new THREE.MeshBasicMaterial({ color: 0xffff00 });

    // Mark built-in materials
    Object.values(this.materials).forEach((mat) => (mat.__builtIn = true));
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
    return this.materialSchemas[mat.type] || {};
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

  /**
   * Serialize materials registry to JSON-compatible format
   * Only serializes user-defined materials (built-ins are recreated on load)
   */
  toJSON() {
    const userMaterials = {};

    for (const [name, material] of Object.entries(this.materials)) {
      // Skip built-in materials - they'll be recreated on load
      if (material.__builtIn) continue;

      userMaterials[name] = this._serializeMaterial(material);
    }

    return {
      version: "1.0",
      userMaterials,
      // Store any custom schemas added by users
      customSchemas: this._getCustomSchemas(),
    };
  }

  /**
   * Restore registry from serialized data
   */
  fromJSON(data) {
    if (!data || typeof data !== "object") return;

    // Reset to built-in state first
    this._initBuiltInMaterials();

    // Restore user materials
    if (data.userMaterials && typeof data.userMaterials === "object") {
      for (const [name, serialized] of Object.entries(data.userMaterials)) {
        try {
          const material = this._deserializeMaterial(serialized);
          if (material) {
            material.__userDefined = true;
            delete material.__builtIn;
            this.materials[name] = material;
          }
        } catch (error) {
          console.warn(`Failed to restore material "${name}":`, error);
        }
      }
    }

    // Restore custom schemas if any
    if (data.customSchemas) {
      this._restoreCustomSchemas(data.customSchemas);
    }

    this._emitChange();
  }

  /**
   * Serialize a single material to plain object
   * @private
   */
  _serializeMaterial(material) {
    const serialized = {
      type: material.type,
      properties: {},
    };

    // Extract relevant properties based on material type
    switch (material.type) {
      case "MeshStandardMaterial":
        serialized.properties = {
          color: material.color.getHex(),
          metalness: material.metalness,
          roughness: material.roughness,
          emissive: material.emissive?.getHex() || 0x000000,
          emissiveIntensity: material.emissiveIntensity || 0,
          transparent: material.transparent || false,
          opacity: material.opacity || 1,
        };
        break;

      case "MeshPhongMaterial":
        serialized.properties = {
          color: material.color.getHex(),
          specular: material.specular?.getHex() || 0x111111,
          shininess: material.shininess,
          reflectivity: material.reflectivity || 0,
          emissive: material.emissive?.getHex() || 0x000000,
          transparent: material.transparent || false,
          opacity: material.opacity || 1,
        };
        break;

      case "MeshBasicMaterial":
        serialized.properties = {
          color: material.color.getHex(),
          transparent: material.transparent || false,
          opacity: material.opacity || 1,
        };
        break;

      case "MeshLambertMaterial":
        serialized.properties = {
          color: material.color.getHex(),
          emissive: material.emissive?.getHex() || 0x000000,
          transparent: material.transparent || false,
          opacity: material.opacity || 1,
        };
        break;

      default:
        // Generic fallback for custom materials
        serialized.properties = {
          color: material.color?.getHex?.() || 0xffffff,
          transparent: material.transparent || false,
          opacity: material.opacity || 1,
        };
        // Add any numeric properties that exist
        if (typeof material.metalness === "number")
          serialized.properties.metalness = material.metalness;
        if (typeof material.roughness === "number")
          serialized.properties.roughness = material.roughness;
        if (typeof material.shininess === "number")
          serialized.properties.shininess = material.shininess;
    }

    return serialized;
  }

  /**
   * Deserialize a material from plain object
   * @private
   */
  _deserializeMaterial(serialized) {
    let material;
    const props = serialized.properties;

    switch (serialized.type) {
      case "MeshStandardMaterial":
        material = new THREE.MeshStandardMaterial({
          color: props.color,
          metalness: props.metalness,
          roughness: props.roughness,
          emissive: props.emissive,
          emissiveIntensity: props.emissiveIntensity,
          transparent: props.transparent,
          opacity: props.opacity,
        });
        break;

      case "MeshPhongMaterial":
        material = new THREE.MeshPhongMaterial({
          color: props.color,
          specular: props.specular,
          shininess: props.shininess,
          reflectivity: props.reflectivity,
          emissive: props.emissive,
          transparent: props.transparent,
          opacity: props.opacity,
        });
        break;

      case "MeshBasicMaterial":
        material = new THREE.MeshBasicMaterial({
          color: props.color,
          transparent: props.transparent,
          opacity: props.opacity,
        });
        break;

      case "MeshLambertMaterial":
        material = new THREE.MeshLambertMaterial({
          color: props.color,
          emissive: props.emissive,
          transparent: props.transparent,
          opacity: props.opacity,
        });
        break;

      default:
        console.warn(
          `Unknown material type: ${serialized.type}, falling back to Standard`,
        );
        material = new THREE.MeshStandardMaterial({
          color: props.color,
          metalness: props.metalness || 0.5,
          roughness: props.roughness || 0.5,
        });
    }

    return material;
  }

  /**
   * Get schemas that were added by users (not built-in)
   * @private
   */
  _getCustomSchemas() {
    const custom = {};
    const builtInTypes = new Set([
      "MeshStandardMaterial",
      "MeshPhongMaterial",
      "MeshBasicMaterial",
    ]);

    for (const [materialType, schema] of Object.entries(this.materialSchemas)) {
      if (!builtInTypes.has(materialType)) {
        custom[materialType] = schema;
      }
    }

    return custom;
  }

  /**
   * Restore custom schemas from serialized data
   * @private
   */
  _restoreCustomSchemas(customSchemas) {
    for (const [materialType, schema] of Object.entries(customSchemas)) {
      this.materialSchemas[materialType] = schema;
    }
  }

  /**
   * Helper: Create a deep copy of the registry
   */
  clone() {
    const cloned = new MaterialsRegistry();
    cloned.fromJSON(this.toJSON());
    return cloned;
  }
}
