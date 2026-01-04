import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { clearObject } from "../utils.js";
import { cloneValue } from "../state/store.js";
import { materials } from "../tools/materials.js";

class Setting {
  constructor({
    name,
    vertices,
    faces,
    color = [1, 0, 0],
    opacity = 1.0,
    position = [0, 0, 0],
    materialType = "Standard",
    showEdges = false,
    edgeColor = [0, 0, 0, 1],
    depthWrite = true,
    depthTest = true,
    side = "DoubleSide",
    clearDepth = false,
    renderOrder = 0,
    mergeVerticesTolerance = null,
    smoothNormals = true,
    visible = true,
    selectable = true,
    layer = null,
    userData = null,
  }) {
    /* A class to store settings */

    this.name = name;
    this.vertices = vertices;
    this.faces = faces;
    this.color = color;
    this.opacity = opacity;
    this.position = position;
    this.materialType = materialType;
    this.showEdges = showEdges;
    this.edgeColor = edgeColor;
    this.depthWrite = depthWrite;
    this.depthTest = depthTest;
    this.side = side;
    this.clearDepth = clearDepth;
    this.renderOrder = renderOrder;
    this.mergeVerticesTolerance = mergeVerticesTolerance;
    this.smoothNormals = smoothNormals;
    this.visible = visible;
    this.selectable = selectable;
    this.layer = layer;
    this.userData = userData;
  }
}

export class AnyMesh {
  constructor(viewer) {
    this.viewer = viewer;
    this.scene = this.viewer.tjs.scene;
    this.settings = [];
    this.meshes = [];
    this.guiFolder = null;
    this.legendContainer = null;
    this.meshLegendConfig = this.getMeshLegendConfig();
    this.createGui();

    const pluginState = this.viewer.state.get("plugins.anyMesh");
    if (pluginState && Array.isArray(pluginState.settings)) {
      this.applySettings(pluginState.settings);
      this.drawMesh();
    }
    this.viewer.state.subscribe("plugins.anyMesh", (next) => {
      if (!next || !Array.isArray(next.settings)) {
        return;
      }
      this.applySettings(next.settings);
      this.drawMesh();
    });
  }

  setSettings(settings) {
    this.viewer.state.set({ plugins: { anyMesh: { settings: cloneValue(settings) } } });
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
  addSetting({
    name,
    vertices,
    faces,
    color,
    opacity,
    position,
    materialType,
    showEdges,
    edgeColor,
    depthWrite,
    depthTest,
    side,
    clearDepth,
    renderOrder,
    mergeVerticesTolerance,
    smoothNormals,
    visible,
    selectable,
    layer,
    userData,
  }) {
    /* Add a new setting */
    if (!name) {
      name = `mesh-${this.settings.length + 1}`;
    }
    const setting = new Setting({
      name,
      vertices,
      faces,
      color,
      opacity,
      position,
      materialType,
      showEdges,
      edgeColor,
      depthWrite,
      depthTest,
      side,
      clearDepth,
      renderOrder,
      mergeVerticesTolerance,
      smoothNormals,
      visible,
      selectable,
      layer,
      userData,
    });
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
      if (setting.clearDepth && this.viewer?.tjs?.renderer?.clearDepth) {
        this.viewer.tjs.renderer.clearDepth();
      }
      const materialType = setting.materialType || "Standard";
      const material = materials[materialType].clone();
      if (Array.isArray(setting.color)) {
        material.color.setRGB(setting.color[0], setting.color[1], setting.color[2]);
      } else {
        material.color = new THREE.Color(setting.color);
      }
      const opacity = setting.opacity ?? 1;
      material.transparent = true;
      material.opacity = opacity;
      const sideMap = {
        FrontSide: THREE.FrontSide,
        BackSide: THREE.BackSide,
        DoubleSide: THREE.DoubleSide,
      };
      material.side = sideMap[setting.side] ?? THREE.DoubleSide;
      material.depthWrite = setting.depthWrite ?? true;
      material.depthTest = setting.depthTest ?? true;
      const geometry = new THREE.BufferGeometry();
      const vertices = new Float32Array(setting.vertices);
      geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
      const faces = new Uint32Array(setting.faces);
      geometry.setIndex(new THREE.BufferAttribute(faces, 1));
      let finalGeometry = geometry;
      finalGeometry = mergeVertices(geometry, setting.mergeVerticesTolerance);
      if (typeof setting.mergeVerticesTolerance === "number") {
      }
      if (setting.smoothNormals ?? true) {
        finalGeometry.computeVertexNormals();
      }
      const object = new THREE.Mesh(finalGeometry, material);
      const selectable = setting.selectable ?? true;
      const layer = typeof setting.layer === "number" ? setting.layer : selectable ? 0 : 1;
      object.userData.anyMeshName = setting.name;
      object.userData.type = "anyMesh";
      object.userData.uuid = this.viewer.uuid;
      object.userData.notSelectable = !selectable;
      if (setting.userData && typeof setting.userData === "object") {
        Object.assign(object.userData, setting.userData);
      }
      object.layers.set(layer);
      object.visible = setting.visible ?? true;
      // set position
      object.position.set(setting.position[0], setting.position[1], setting.position[2]);
      if (typeof setting.renderOrder === "number") {
        object.renderOrder = setting.renderOrder;
      }
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
        const edgeGeometry = new THREE.EdgesGeometry(finalGeometry);
        const edgeLines = new THREE.LineSegments(edgeGeometry, edgeMaterial);
        edgeLines.userData.anyMeshName = setting.name;
        edgeLines.userData.type = "anyMesh";
        edgeLines.userData.uuid = this.viewer.uuid;
        edgeLines.userData.notSelectable = !selectable;
        if (setting.userData && typeof setting.userData === "object") {
          Object.assign(edgeLines.userData, setting.userData);
        }
        edgeLines.layers.set(layer);
        edgeLines.visible = setting.visible ?? true;
        edgeLines.position.set(0, 0, 0);
        edgeLines.renderOrder = (object.renderOrder ?? 0) + 0.1;
        this.meshes.push(edgeLines);
        object.add(edgeLines);
      }
    });
    this.updateLegend();
    this.viewer.requestRedraw?.("render");
  }

  getMeshLegendConfig() {
    if (!this.viewer?.guiManager?.guiConfig) {
      return { enabled: false, position: "bottom-left" };
    }
    if (!this.viewer.guiManager.guiConfig.meshLegend) {
      this.viewer.guiManager.guiConfig.meshLegend = { enabled: false, position: "bottom-left" };
    }
    return this.viewer.guiManager.guiConfig.meshLegend;
  }

  createGui() {
    const guiConfig = this.viewer?.guiManager?.guiConfig;
    if (!this.viewer?.guiManager?.gui || this.guiFolder) {
      return;
    }
    if (guiConfig && guiConfig.controls && guiConfig.controls.meshControls === false) {
      return;
    }
    this.guiFolder = this.viewer.guiManager.gui.addFolder("Meshes");
    this.legendToggleController = this.guiFolder
      .add(this.meshLegendConfig, "enabled")
      .name("Show Mesh Legend")
      .onChange((value) => {
        this.meshLegendConfig.enabled = value;
        this.updateLegend();
      });
  }

  removeGui() {
    if (!this.guiFolder || !this.viewer?.guiManager?.gui) {
      return;
    }
    this.viewer.guiManager.gui.removeFolder(this.guiFolder);
    this.guiFolder = null;
  }

  addLegend() {
    this.removeLegend();
    if (this.settings.length === 0) {
      return;
    }
    const legendContainer = document.createElement("div");
    legendContainer.id = "mesh-legend-container";
    legendContainer.style.position = "absolute";
    legendContainer.style.backgroundColor = "rgba(255, 255, 255, 0.85)";
    legendContainer.style.padding = "8px 10px";
    legendContainer.style.borderRadius = "6px";
    legendContainer.style.zIndex = "1000";
    legendContainer.style.display = "flex";
    legendContainer.style.flexDirection = "column";
    legendContainer.style.gap = "6px";
    this.setLegendPosition(legendContainer);

    const stopPropagation = (event) => event.stopPropagation();
    ["click", "mousedown", "mouseup", "pointerdown", "pointerup"].forEach((eventType) => {
      legendContainer.addEventListener(eventType, stopPropagation, false);
    });

    this.settings.forEach((setting) => {
      const legendEntry = document.createElement("div");
      legendEntry.style.display = "flex";
      legendEntry.style.alignItems = "center";
      legendEntry.style.cursor = "pointer";
      legendEntry.style.gap = "6px";
      const isVisible = setting.visible ?? true;
      legendEntry.style.opacity = isVisible ? "1" : "0.45";
      legendEntry.style.textDecoration = isVisible ? "none" : "line-through";

      const swatch = document.createElement("span");
      swatch.style.width = "12px";
      swatch.style.height = "12px";
      swatch.style.borderRadius = "3px";
      swatch.style.backgroundColor = resolveLegendColor(setting.color);
      swatch.style.border = "1px solid rgba(0, 0, 0, 0.2)";
      legendEntry.appendChild(swatch);

      const label = document.createElement("span");
      label.textContent = setting.name || "mesh";
      label.style.fontSize = "12px";
      label.style.color = "#1f2933";
      legendEntry.appendChild(label);

      legendEntry.addEventListener("click", () => this.toggleMeshVisibility(setting.name));
      legendContainer.appendChild(legendEntry);
    });

    this.legendContainer = legendContainer;
    this.viewer.tjs.containerElement.appendChild(legendContainer);
  }

  removeLegend() {
    const existingLegend = this.viewer.tjs.containerElement.querySelector("#mesh-legend-container");
    if (existingLegend) {
      existingLegend.remove();
    }
    this.legendContainer = null;
  }

  updateLegend() {
    if (!this.meshLegendConfig?.enabled) {
      this.removeLegend();
      return;
    }
    this.addLegend();
  }

  setLegendPosition(legendContainer) {
    const position = this.meshLegendConfig.position || "bottom-left";
    legendContainer.style.top = position.includes("top") ? "10px" : "";
    legendContainer.style.bottom = position.includes("bottom") ? "10px" : "";
    legendContainer.style.left = position.includes("left") ? "10px" : "";
    legendContainer.style.right = position.includes("right") ? "10px" : "";
  }

  toggleMeshVisibility(name) {
    if (!name) {
      return;
    }
    const nextSettings = this.settings.map((setting) => {
      if (setting.name !== name) {
        return { ...setting };
      }
      const currentVisible = setting.visible ?? true;
      return { ...setting, visible: !currentVisible };
    });
    this.setSettings(nextSettings);
  }
}

function resolveLegendColor(color) {
  const meshColor = new THREE.Color();
  if (Array.isArray(color)) {
    meshColor.setRGB(color[0] ?? 1, color[1] ?? 0, color[2] ?? 0);
  } else if (color) {
    meshColor.set(color);
  } else {
    meshColor.setRGB(1, 0, 0);
  }
  return `#${meshColor.getHexString()}`;
}
