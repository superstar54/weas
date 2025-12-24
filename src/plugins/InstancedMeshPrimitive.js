import * as THREE from "three";
import { clearObject } from "../utils.js";
import { cloneValue } from "../state/store.js";
import { materials } from "../tools/materials.js";

class Setting {
  constructor({ type, shape, instances, materialType = "Standard", opacity = 1 }) {
    /* A class to store settings */

    this.type = type;
    this.shape = shape;
    this.instances = instances;
    this.materialType = materialType;
    this.opacity = opacity;
  }
}

export class InstancedMeshPrimitive {
  constructor(viewer) {
    this.viewer = viewer;
    this.scene = this.viewer.tjs.scene;
    this.settings = [];
    this.meshes = [];

    const pluginState = this.viewer.state.get("plugins.instancedMeshPrimitive");
    if (pluginState && Array.isArray(pluginState.settings)) {
      this.applySettings(pluginState.settings);
      this.drawMesh();
    }
    this.viewer.state.subscribe("plugins.instancedMeshPrimitive", (next) => {
      if (!next || !Array.isArray(next.settings)) {
        return;
      }
      this.applySettings(next.settings);
      this.drawMesh();
    });
  }

  setSettings(settings) {
    this.viewer.state.set({ plugins: { instancedMeshPrimitive: { settings: cloneValue(settings) } } });
  }

  applySettings(settings) {
    /* Set the settings */
    this.settings = [];
    this.clearMeshes();
    // loop over settings to add each setting
    settings.forEach((setting) => {
      this.addSetting(setting);
    });
  }

  // Modify addSetting to accept a single object parameter
  addSetting({ type, shape, instances, materialType = "Standard", opacity = 1 }) {
    /* Add a new setting */
    const setting = new Setting({ type, shape, instances, materialType, opacity });
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
      const geometry = this.getGeometry(setting);
      const materialType = setting.materialType || "Standard";
      const material = materials[materialType].clone();
      material.transparent = true; // Enable transparency
      material.opacity = setting.opacity || 1;
      const instancedMesh = new THREE.InstancedMesh(geometry, material, setting.instances.length);
      if (material.opacity < 1) {
        instancedMesh.renderOrder = 2;
      }
      // set position, scale, and color for each instance
      setting.instances.forEach((instance, index) => {
        const dummy = new THREE.Object3D();
        const position = new THREE.Vector3(...instance.position);
        dummy.position.copy(position);
        const scale = instance.scale || [1, 1, 1];
        dummy.scale.set(...scale);
        const rotation = instance.rotation || [0, 0, 0];
        dummy.rotation.set(...rotation);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(index, dummy.matrix);
        const color = instance.color || "#bd0d87";
        instancedMesh.setColorAt(index, new THREE.Color(color));
      });
      instancedMesh.instanceMatrix.needsUpdate = true;
      instancedMesh.instanceColor.needsUpdate = true;
      this.meshes.push(instancedMesh);
      this.scene.add(instancedMesh);
    });
    this.viewer.requestRedraw?.("render");
  }

  getGeometry(setting) {
    let geometry;
    let defaultShape;
    let params;
    switch (setting.type) {
      case "cube":
        defaultShape = { width: 1, height: 1, depth: 1 };
        params = { ...defaultShape, ...setting.shape };
        geometry = new THREE.BoxGeometry(params.width, params.height, params.depth);
        break;
      case "cylinder":
        defaultShape = { radiusTop: 1, radiusBottom: 1, height: 1, radialSegments: 8, heightSegments: 1, openEnded: false };
        params = { ...defaultShape, ...setting.shape };
        geometry = new THREE.CylinderGeometry(params.radiusTop, params.radiusBottom, params.height, params.radialSegments, params.heightSegments, params.openEnded);
        break;
      case "icosahedron":
        defaultShape = { radius: 1, detail: 0 };
        params = { ...defaultShape, ...setting.shape };
        geometry = new THREE.IcosahedronGeometry(params.radius, params.detail);
        break;
      case "cone":
        defaultShape = { radius: 1, height: 1, radialSegments: 8, heightSegments: 1, openEnded: false };
        params = { ...defaultShape, ...setting.shape };
        geometry = new THREE.ConeGeometry(params.radius, params.height, params.radialSegments, params.heightSegments, params.openEnded);
        break;
      case "plane":
        defaultShape = { width: 1, height: 1 };
        params = { ...defaultShape, ...setting.shape };
        geometry = new THREE.PlaneGeometry(params.width, params.height);
        break;
      case "sphere":
        defaultShape = { radius: 1, widthSegments: 8, heightSegments: 6, phiStart: 0, phiLength: Math.PI * 2, thetaStart: 0, thetaLength: Math.PI };
        params = { ...defaultShape, ...setting.shape };
        geometry = new THREE.SphereGeometry(params.radius, params.widthSegments, params.heightSegments, params.phiStart, params.phiLength, params.thetaStart, params.thetaLength);
        break;
      case "torus":
        defaultShape = { radius: 1, tube: 0.4, radialSegments: 8, tubularSegments: 6, arc: Math.PI * 2 };
        params = { ...defaultShape, ...setting.shape };
        geometry = new THREE.TorusGeometry(params.radius, params.tube, params.radialSegments, params.tubularSegments, params.arc);
        break;
      default:
        console.error("Unknown setting type: ", type);
    }
    return geometry;
  }
}
