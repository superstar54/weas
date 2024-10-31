import * as THREE from "three";
import { convertColor, drawAtoms } from "../utils.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js"; // Import BufferGeometryUtils

class Setting {
  constructor({ indices, scale = 1.1, type = "sphere", color = "yellow" }) {
    // type: sphere, box, cross
    this.indices = indices;
    this.color = convertColor(color);
    this.scale = scale;
    this.type = type;
  }

  toDict() {
    return {
      indices: this.indices,
      color: this.color,
      scale: this.scale,
      type: this.type,
    };
  }
}

export class HighlightManager {
  constructor(viewer) {
    this.viewer = viewer;
    this.scene = this.viewer.tjs.scene;
    this.settings = {};
    this.meshes = {};
    this.init();
  }

  init() {
    /* Initialize the kind settings from the viewer.atoms */
    this.viewer.logger.debug("init highlight settings");
    this.settings = {
      selection: new Setting({ indices: [], scale: 1.1, color: "#ffff00" }),
    };
  }

  fromSettings(settings) {
    /* Set the highlight settings */
    this.settings = {};
    this.clearMeshes();
    // Loop over settings to add each setting
    Object.entries(settings).forEach(([name, setting]) => {
      this.addSetting(name, setting);
    });
  }

  addSetting(name, { indices, scale = 1.1, type = "sphere", color = "#3d82ed" }) {
    /* Add a new setting to the highlights */
    const setting = new Setting({ indices, scale, type, color });
    this.settings[name] = setting;
  }

  clearMeshes() {
    /* Remove highlight meshes from the scene */
    Object.values(this.meshes).forEach((mesh) => {
      if (mesh.parent) {
        mesh.parent.remove(mesh);
      }
    });
    this.meshes = {};
  }

  drawHighlightAtoms() {
    this.clearMeshes();
    const material = new THREE.MeshBasicMaterial({
      color: "yellow",
      opacity: 0.6,
      transparent: true,
    });
    // sphere
    const geometry = new THREE.SphereGeometry(1, 16, 16);
    this.drawHighlightMesh("sphere", geometry, material);
    //box
    const material1 = material.clone();
    material1.color = "green";
    const boxGeometry = new THREE.BoxGeometry(2, 2, 2);
    this.drawHighlightMesh("box", boxGeometry, material1);
    // cross
    const material2 = material.clone();
    material2.color = "black";
    material2.opacity = 1.0;
    const crossGeometry = this.createCrossGeometry(1);
    this.drawHighlightMesh("cross", crossGeometry, material2);
  }

  drawHighlightMesh(name, geometry, material) {
    /* Draw the highlight mesh based on the setting type */
    const baseMesh = this.viewer.atomManager.meshes["atom"];

    const mesh = new THREE.InstancedMesh(geometry, material, baseMesh.count);

    const position = new THREE.Vector3();
    const rotation = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    const matrix = new THREE.Matrix4();
    const instanceMatrix = new THREE.Matrix4();

    for (let i = 0; i < baseMesh.count; i++) {
      baseMesh.getMatrixAt(i, matrix);
      matrix.decompose(position, rotation, scale);
      scale.multiplyScalar(0);
      instanceMatrix.compose(position, rotation, scale);
      mesh.setMatrixAt(i, instanceMatrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    // Add mesh to the scene
    baseMesh.add(mesh);
    mesh.layers.set(1); // Set the layer to 1 to make it not selectable
    this.meshes[name] = mesh;
    Object.values(this.settings).forEach((setting) => {
      this.updateHighlightAtomsMesh(setting);
    });
  }

  createCrossGeometry(size = 1) {
    /* Create a cross geometry for the highlight */
    const geometry1 = new THREE.TorusGeometry(size, 0.1, 16, 20);
    const geometry2 = new THREE.TorusGeometry(size, 0.1, 16, 20);
    // rotate the second torus
    geometry2.rotateX(Math.PI / 2);
    const geometry3 = new THREE.TorusGeometry(size, 0.1, 16, 20);
    geometry3.rotateY(Math.PI / 2);
    // Merge the two geometries
    const crossGeometry = mergeGeometries([geometry1, geometry2, geometry3]);

    return crossGeometry;
  }

  updateHighlightAtomsMesh({ indices = [], factor = 1.1, color = "yellow", type = "sphere" }) {
    /* When the atom is moved, the boundary atoms should be moved as well.
     */
    if (this.viewer.atoms.symbols.length > 0 && this.meshes[type]) {
      const position = new THREE.Vector3();
      const rotation = new THREE.Quaternion();
      const scale = new THREE.Vector3();
      indices.forEach((index) => {
        // Update the atom position
        const matrix = new THREE.Matrix4();
        this.viewer.atomManager.meshes["atom"].getMatrixAt(index, matrix);
        // Decompose the original matrix into its components
        matrix.decompose(position, rotation, scale);
        // scale by factor
        scale.multiplyScalar(factor);
        // Recompose the matrix with the new scale
        matrix.compose(position, rotation, scale);
        this.meshes[type].setMatrixAt(index, matrix);
        this.meshes[type].setColorAt(index, convertColor(color));
      });
      this.meshes[type].instanceMatrix.needsUpdate = true;
    }
  }
}
