import * as THREE from "three";
import { clearObject, calculateQuaternion } from "../../utils.js";
import { materials } from "../../tools/materials.js";
import { convertColor } from "../utils.js";

class Setting {
  constructor({ origins = [], vectors = [], color = "#3d82ed", radius = 0.05, centerOnAtoms = false }) {
    /* A class to store vectorfield settings */

    this.origins = origins;
    this.vectors = vectors;
    this.color = convertColor(color);
    this.radius = radius;
    this.centerOnAtoms = centerOnAtoms;
  }
}

export class VectorField {
  constructor(viewer) {
    this.viewer = viewer;
    this.scene = this.viewer.tjs.scene;
    this._show = true;
    this.init();
  }

  get show() {
    return this._show;
  }

  set show(value) {
    this._show = value;
    Object.values(this.meshes).forEach((data) => {
      data.forEach((mesh) => {
        mesh.visible = value;
      });
    });
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

  fromSettings(settings) {
    /* Set the vectorfield settings */
    this.settings = [];
    this.clearMeshes();
    // loop over settings to add each setting
    Object.entries(settings).forEach(([name, setting]) => {
      this.addSetting(name, setting);
    });
  }

  // Modify addSetting to accept a single object parameter
  addSetting(name, { origins, vectors, color = "#3d82ed", radius = 0.05, centerOnAtoms = false }) {
    /* Add a new setting to the vectorfield */
    if (typeof origins === "string") {
      if (!this.viewer.atoms.getAttribute(origins)) {
        throw new Error(`Attribute '${origins}' is not defined. The available attributes are: ${Object.keys(this.viewer.atoms.attributes["atom"])}`);
      }
    }
    const setting = new Setting({ origins, vectors, color, radius, centerOnAtoms });
    // if name is not set, use the length of the settings
    if (name === undefined) {
      name = "vf-" + Object.keys(this.settings).length;
    }
    this.settings[name] = setting;
  }

  clearMeshes() {
    /* Remove highlighted atom meshes from the selectedAtomsMesh group */
    Object.values(this.meshes).forEach((data) => {
      data.forEach((mesh) => {
        clearObject(this.scene, mesh);
      });
    });
    this.meshes = {};
  }

  drawVectorFields(showVectorField = true) {
    /* Draw vectorfields */
    this.viewer.logger.debug("drawVectorFields");
    this.clearMeshes();
    // loop over settings by key and value
    Object.entries(this.settings).forEach(([name, setting]) => {
      // Generate vectorfield geometry
      // if origin and vector are string, which means they are from atoms attributes
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
      console.log("origins: ", origins);
      console.log("vectors: ", vectors);
      const [shaftMesh, headMesh] = drawAtomArrows(origins, vectors, setting.radius, setting.color, "Standard");
      // Add mesh to the scene
      this.scene.add(shaftMesh);
      this.scene.add(headMesh);
      this.meshes[name] = [shaftMesh, headMesh];
      shaftMesh.visible = this.show;
      headMesh.visible = this.show;
    });
  }

  updateArrowMesh(atomIndex = null, atoms = null) {
    /* When the atom is moved, the vectorfield created from the atom attribute will be updated.
    if atomIndex is null, update all bonds
    if atoms is null, use this.viewer.atoms, otherwise use the provided atoms to update the bonds, e.g. trajectory data
    */
    // console.log("updateArrowMesh: ", atomIndex);
    if (atoms === null) {
      atoms = this.viewer.atoms;
    }
    let atomIndices = [];
    if (atomIndex) {
      atomIndices[atomIndex];
    } else {
      // use all atoms
      atomIndices = [...Array(atoms.positions.length).keys()];
    }
    // console.log("atomIndices: ", atomIndices);
    // loop all settings with index
    Object.entries(this.settings).forEach(([name, setting]) => {
      if (typeof setting.origins !== "string") {
        return;
      }
      const origins = atoms.getAttribute(setting.origins);
      const vectors = atoms.getAttribute(setting.vectors);
      const shaftMesh = this.meshes[name][0];
      const headMesh = this.meshes[name][1];
      atomIndices.forEach((i) => {
        const position1 = new THREE.Vector3(...origins[i]);
        const position2 = position1.clone().add(new THREE.Vector3(...vectors[i]));
        const midpoint = new THREE.Vector3().lerpVectors(position1, position2, 0.5);
        const quaternion = calculateQuaternion(position1, position2);
        const scale = new THREE.Vector3(setting.radius, position1.distanceTo(position2), setting.radius);
        const shaftMatrix = new THREE.Matrix4().compose(midpoint, quaternion, scale);
        const coneMatrix = new THREE.Matrix4().compose(position2, quaternion, new THREE.Vector3(1, 1, 1));
        shaftMesh.setMatrixAt(i, shaftMatrix);
        headMesh.setMatrixAt(i, coneMatrix);
      });
      shaftMesh.instanceMatrix.needsUpdate = true;
      headMesh.instanceMatrix.needsUpdate = true;
    });
  }
}

export function drawAtomArrows(origins, vectors, radius, color = "0x000000", materialType = "Standard") {
  // Arrow Shaft (Cylinder)
  const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 1, 8, 1); // Adjust segment count as needed
  const material = materials[materialType].clone();
  // Arrowhead (Cone)
  const coneGeometry = new THREE.ConeGeometry(radius * 2, 6 * radius, 8); // 0.5 is the base radius, 2 is the height
  // align cone to point up
  coneGeometry.rotateX(Math.PI);

  const shaftMesh = new THREE.InstancedMesh(cylinderGeometry, material, vectors.length);
  const headMesh = new THREE.InstancedMesh(coneGeometry, material, vectors.length);
  color = new THREE.Color(color);

  // Iterate over atoms and update arrows
  for (let i = 0; i < origins.length; i++) {
    const position1 = new THREE.Vector3(...origins[i]);
    const position2 = position1.clone().add(new THREE.Vector3(...vectors[i]));
    const midpoint = new THREE.Vector3().lerpVectors(position1, position2, 0.5);
    const quaternion = calculateQuaternion(position1, position2);
    const scale = new THREE.Vector3(radius, position1.distanceTo(position2), radius);
    const shaftMatrix = new THREE.Matrix4().compose(midpoint, quaternion, scale);
    const coneMatrix = new THREE.Matrix4().compose(position2, quaternion, new THREE.Vector3(1, 1, 1));
    shaftMesh.setMatrixAt(i, shaftMatrix);
    shaftMesh.setColorAt(i, color);
    headMesh.setMatrixAt(i, coneMatrix);
    headMesh.setColorAt(i, color);
  }
  shaftMesh.userData.type = "arrow";
  headMesh.userData.type = "arrow";
  return [shaftMesh, headMesh];
}
