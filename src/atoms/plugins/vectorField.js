import * as THREE from "three";
import { clearObject, calculateQuaternion } from "../../utils";
import { convertColor } from "../utils";
import { cloneValue } from "../../state/store";

class Setting {
  constructor({ origins = [], vectors = [], factor = 1, color = "#3d82ed", radius = 0.05, centerOnAtoms = false }) {
    /* A class to store vectorfield settings */

    this.origins = origins;
    this.vectors = vectors;
    this.color = convertColor(color);
    this.radius = radius;
    this.factor = factor;
    this.centerOnAtoms = centerOnAtoms;
  }
}

export class VectorField {
  constructor(viewer) {
    this.viewer = viewer;
    this.scene = this.viewer.tjs.scene;
    this.shapeRegistry = this.viewer.weas.shapeRegistry;
    this._show = true;
    this.init();

    const pluginState = this.viewer.state.get("plugins.vectorField");
    if (pluginState) {
      if (pluginState.settings) {
        this.applySettings(pluginState.settings);
      }
      if (pluginState.show !== undefined) {
        this.show = pluginState.show;
      }
    }
    this.viewer.state.subscribe("plugins.vectorField", (next) => {
      if (!next) return;
      if (next.settings) {
        this.applySettings(next.settings);
      }
      if (next.show !== undefined) {
        this.show = next.show;
      }
      this.drawVectorFields();
    });
  }

  get show() {
    return this._show;
  }

  set show(value) {
    this._show = value;
    Object.values(this.meshes).forEach((data) => {
      Object.values(data).forEach((mesh) => {
        mesh.visible = value;
      });
    });
    this.viewer.requestRedraw?.("render");
  }

  init() {
    this.settings = {};
    this.meshes = {};
    this.viewer.logger.debug("init VectorField");
    // addMagneticMoments
    // generate vectors for the each atom
    if (this.viewer.atoms.attributes["atom"]["moment"] === undefined) {
      return;
    }
    // convert the magnetic moment to two vector fields: moment > 0 and moment <= 0
    // for >0, color blue, for <=0, color red
    let origins1 = [];
    let vectors1 = [];
    let origins2 = [];
    let vectors2 = [];
    for (let i = 0; i < this.viewer.atoms.getAtomsCount(); i++) {
      if (this.viewer.atoms.attributes["atom"]["moment"][i] > 0) {
        // origin is the atom position - vector/2
        const vector = [0, 0, this.viewer.atoms.attributes["atom"]["moment"][i] * 1.5];
        const origin = this.viewer.atoms.positions[i].map((value, index) => value - vector[index] / 2);
        origins1.push(origin);
        vectors1.push(vector);
      } else {
        const vector = [0, 0, this.viewer.atoms.attributes["atom"]["moment"][i] * 1.5];
        const origin = this.viewer.atoms.positions[i].map((value, index) => value - vector[index] / 2);
        origins2.push(origin);
        vectors2.push(vector);
      }
    }
    this.addSetting("up", { origins: origins1, vectors: vectors1, color: "#3d82ed" });
    this.addSetting("down", { origins: origins2, vectors: vectors2, color: "#ff0000" });
  }

  setSettings(settings) {
    this.viewer.state.set({ plugins: { vectorField: { settings: cloneValue(settings) } } });
  }

  applySettings(settings) {
    /* Set the vectorfield settings */
    this.settings = [];
    this.clearMeshes();
    // loop over settings to add each setting
    Object.entries(settings).forEach(([name, setting]) => {
      this.addSetting(name, setting);
    });
  }

  // Modify addSetting to accept a single object parameter
  addSetting(name, { origins, vectors, factor = 1, color = "#3d82ed", radius = 0.05, centerOnAtoms = false }) {
    /* Add a new setting to the vectorfield */
    if (typeof origins === "string") {
      if (!this.viewer.atoms.getAttribute(origins)) {
        throw new Error(`Attribute '${origins}' is not defined. The available attributes are: ${Object.keys(this.viewer.atoms.attributes["atom"])}`);
      }
    }
    const setting = new Setting({ origins, vectors, factor, color, radius, centerOnAtoms });
    // if name is not set, use the length of the settings
    if (name === undefined) {
      name = "vf-" + Object.keys(this.settings).length;
    }
    this.settings[name] = setting;
  }

  clearMeshes() {
    /* Remove highlighted atom meshes from the selectedAtomsMesh group */
    Object.values(this.meshes).forEach((data) => {
      Object.values(data).forEach((mesh) => {
        clearObject(this.scene, mesh);
      });
    });
    this.meshes = {};
  }

  getData(setting) {
    let origins;
    let vectors;
    if (typeof setting.origins === "string") {
      origins = this.viewer.atoms.getAttribute(setting.origins);
    } else {
      origins = setting.origins;
    }
    if (typeof setting.vectors === "string") {
      vectors = this.viewer.atoms.getAttribute(setting.vectors);
    } else {
      vectors = setting.vectors;
    }
    return [origins, vectors];
  }

  // simple method that just loops over all vectors and renders an arrow for them
  drawVectorFields() {
    this.viewer.logger.debug("drawVectorFields");
    this.clearMeshes();

    Object.entries(this.settings).forEach(([name, setting]) => {
      const [origins, vectors] = this.getData(setting);

      // we use the arrow geometry builtin from the shapeRegistry
      const arrowMesh = drawAtomArrows({
        length: vectors.length,
        color: setting.color,
        materialType: "Standard",
        shapeRegistry: this.shapeRegistry,
      });

      // set its state
      arrowMesh.visible = this.show;

      this.scene.add(arrowMesh);
      this.meshes[name] = { arrow: arrowMesh };
    });

    this.updateArrowMesh();
    this.viewer.requestRedraw?.("render");
  }

  updateArrowMesh(atomIndex = null, atoms = null) {
    if (atoms === null) atoms = this.viewer.atoms;

    Object.entries(this.settings).forEach(([name, setting]) => {
      const [origins, vectors] = this.getData(setting);
      const arrowMesh = this.meshes[name].arrow; // single instanced mesh
      if (!arrowMesh) return;

      const count = origins.length;
      const indices =
        atomIndex !== null ? [atomIndex] : [...Array(count).keys()];

      indices.forEach((i) => {
        const start = new THREE.Vector3(...origins[i]);
        const vec = new THREE.Vector3(...vectors[i]).multiplyScalar(
          setting.factor,
        );
        const end = start.clone().add(vec);

        // Arrow geometry is designed along Y-axis; scale Y = length of vector
        const mid = new THREE.Vector3().lerpVectors(start, end, 0.0);
        const quaternion = calculateQuaternion(start, end);

        // somehow arrow geometry is pointing completely the wrong way?
        // using a flipQuart we can fix this.
        const flipQuat = new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(1, 0, 0),
          Math.PI,
        );
        quaternion.multiply(flipQuat);

        const scale = new THREE.Vector3(
          10 * setting.radius,
          start.distanceTo(end),
          10 * setting.radius,
        );

        const matrix = new THREE.Matrix4().compose(mid, quaternion, scale);
        arrowMesh.setMatrixAt(i, matrix);
      });

      arrowMesh.instanceMatrix.needsUpdate = true;
    });
  }
}

// basic create arrow wrapper
export function drawAtomArrows({
  length = 0,
  color = 0x000000,
  materialType = "Standard",
  shapeRegistry,
}) {
  // Get the base arrow mesh (merged shaft + cone)
  const baseArrow = shapeRegistry.create("Arrow", { materialType });

  if (!(baseArrow instanceof THREE.Mesh)) {
    throw new Error("Arrow must return a THREE.Mesh");
  }

  const geometry = baseArrow.geometry.clone();
  const material = baseArrow.material.clone();

  material.color.set(color);

  const instanced = new THREE.InstancedMesh(geometry, material, length);
  instanced.userData.type = "arrow";

  return instanced;
}
