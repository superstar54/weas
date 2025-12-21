import * as THREE from "three";
import { clearObject } from "../utils.js";
import { materials } from "../tools/materials.js";

class Setting {
  constructor({ name, vertices, faces, color = [1, 0, 0, 1], position = [0, 0, 0], materialType = "Standard", showEdges = false, edgeColor = [0, 0, 0, 1] }) {
    /* A class to store settings */

    this.name = name;
    this.vertices = vertices;
    this.faces = faces;
    this.color = color;
    this.position = position;
    this.materialType = materialType;
    this.showEdges = showEdges;
    this.edgeColor = edgeColor;
  }
}

export class AnyMesh {
  constructor(viewer) {
    this.viewer = viewer;
    this.scene = this.viewer.tjs.scene;
    this.settings = [];
    this.meshes = [];

    const pluginState = this.viewer.state.get("plugins.anyMesh");
    if (pluginState && Array.isArray(pluginState.settings)) {
      this.fromSettings(pluginState.settings);
      this.drawMesh();
    }
    this.viewer.state.subscribe("plugins.anyMesh", (next) => {
      if (!next || !Array.isArray(next.settings)) {
        return;
      }
      this.fromSettings(next.settings);
      this.drawMesh();
    });
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
  addSetting({ name, vertices, faces, color, position, materialType, showEdges, edgeColor }) {
    /* Add a new setting */
    const setting = new Setting({ name, vertices, faces, color, position, materialType, showEdges, edgeColor });
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
    this.clearMeshes();
    this.settings.forEach((setting) => {
      const materialType = setting.materialType || "Standard";
      const material = materials[materialType].clone();
      // color is a 1x4 array with RGBA values
      material.color.setRGB(setting.color[0], setting.color[1], setting.color[2]);
      material.transparent = true; // Enable transparency
      material.opacity = setting.color[3];
      material.side = THREE.DoubleSide;
      const geometry = new THREE.BufferGeometry();
      const vertices = new Float32Array(setting.vertices);
      geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
      const faces = new Uint32Array(setting.faces);
      geometry.setIndex(new THREE.BufferAttribute(faces, 1));
      geometry.computeVertexNormals();
      const object = new THREE.Mesh(geometry, material);
      // set position
      object.position.set(setting.position[0], setting.position[1], setting.position[2]);
      this.meshes.push(object);
      this.scene.add(object);

      if (setting.showEdges) {
        const edgeColor = setting.edgeColor || [0, 0, 0, 1];
        const edgeOpacity = edgeColor.length === 4 ? edgeColor[3] : 1;
        const edgeMaterial = new THREE.LineBasicMaterial({
          color: new THREE.Color(edgeColor[0], edgeColor[1], edgeColor[2]),
          transparent: edgeOpacity < 1,
          opacity: edgeOpacity,
        });
        const edgeGeometry = new THREE.EdgesGeometry(geometry);
        const edgeLines = new THREE.LineSegments(edgeGeometry, edgeMaterial);
        edgeLines.position.copy(object.position);
        edgeLines.renderOrder = 3;
        this.meshes.push(edgeLines);
        this.scene.add(edgeLines);
      }
    });
    this.viewer.requestRedraw?.("render");
  }
}
