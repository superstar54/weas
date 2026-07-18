import * as THREE from "three";
import { clearObject } from "../utils";
import { cloneValue } from "../state/store";

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
    this.materialsRegistry = this.viewer.materialsRegistry
    this.shapeRegistry = this.viewer.shapeRegistry
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
      const material = this.materialsRegistry.getMaterial(materialType, true);
      // const material = materials[materialType].clone();
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
    const nameMap = {
      cube: "Cube", sphere: "Sphere", cylinder: "Cylinder",
      cone: "Cone", plane: "Plane", torus: "Torus", icosahedron: "Icosahedron",
    };
    const defaults = {
      cube: { width: 1, height: 1, depth: 1 },
      sphere: { radius: 1, widthSegments: 8, heightSegments: 6, phiStart: 0, phiLength: Math.PI * 2, thetaStart: 0, thetaLength: Math.PI },
      cylinder: { radiusTop: 1, radiusBottom: 1, height: 1, radialSegments: 8, heightSegments: 1, openEnded: false },
      cone: { radius: 1, height: 1, radialSegments: 8, heightSegments: 1, openEnded: false },
      plane: { width: 1, height: 1 },
      torus: { radius: 1, tube: 0.4, radialSegments: 8, tubularSegments: 6, arc: Math.PI * 2 },
      icosahedron: { radius: 1, detail: 0 },
    };
    const name = nameMap[setting.type];
    if (!name) {
      console.error("Unknown setting type: ", setting.type);
      return null;
    }
    const params = { ...defaults[setting.type], ...setting.shape };
    return this.shapeRegistry.getGeometry(name, params);
  }
}
