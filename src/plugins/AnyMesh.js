import * as THREE from "three";
import { clearObject } from "../utils.js";
import { materials } from "../tools/materials.js";

class Setting {
  constructor({ name, vertices, faces, color, materialType = "Standard" }) {
    /* A class to store settings */

    this.name = name;
    this.vertices = vertices;
    this.faces = faces;
    this.color = color;
    this.materialType = materialType;
  }
}

export class AnyMesh {
  constructor(viewer) {
    this.viewer = viewer;
    this.scene = this.viewer.tjs.scene;
    this.settings = [];
    this.meshes = [];
  }

  fromSettings(settings) {
    /* Set the settings */
    this.settings = [];
    this.clearMeshes();
    // loop over settings to add each setting
    settings.forEach((setting) => {
      this.addSetting(setting);
    });
  }

  // Modify addSetting to accept a single object parameter
  addSetting({ name, vertices, faces, color, materialType }) {
    /* Add a new setting */
    const setting = new Setting({ name, vertices, faces, color, materialType });
    this.settings.push(setting);
  }

  clearMeshes() {
    /* Remove highlighted atom meshes from the selectedAtomsMesh group */
    this.meshes.forEach((mesh) => {
      clearObject(this.scene, mesh);
    });
    this.meshes = [];
  }

  drawMesh() {
    /* Draw Mesh*/
    console.log("drawMesh");
    this.clearMeshes();
    // console.log("this.settings: ", this.settings);
    this.settings.forEach((setting) => {
      const materialType = setting.materialType || "Standard";
      const material = materials[materialType].clone();
      material.color.set(setting.color);
      material.side = THREE.DoubleSide;
      const geometry = new THREE.BufferGeometry();
      const vertices = new Float32Array(setting.vertices);
      geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
      const faces = new Uint32Array(setting.faces);
      geometry.setIndex(new THREE.BufferAttribute(faces, 1));
      const object = new THREE.Mesh(geometry, material);
      this.meshes.push(object);
      this.scene.add(object);
    });
    this.viewer.tjs.render();
  }
}
