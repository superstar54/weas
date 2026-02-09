/*
This module is responsible for managing the selection of objects and vertices in the 3D viewer.
 */
import * as THREE from "three";
import { createOutline, removeOutline } from "./ObjectManager.js";
import { SelectionBox } from "three/examples/jsm/interactive/SelectionBox.js";
import { SelectionHelper } from "../three/SelectionHelper.js";
import { LassoHelper } from "../three/LassoHelper.js";

export class SelectionManager {
  constructor(weas) {
    this.weas = weas;
    this.tjs = weas.tjs;
    this._selectedObjects = [];
    this.selectedInstances = {}; // {object.uuid: [vertexId1, vertexId2, ...]}
    this.lassoPoints = [];
    this.isLassoing = false;
    this.oldSelectedAtomsIndices = [];
    this.oldSelectedObjects = [];
    this.axisAtomIndices = [];
    this.axisLineExtendFactor = 3;
    this.axisLine = null;
    this.isAxisPicking = false;
    this.axisPickMode = null;
    this.axisVisible = false;
    this.modeHint = null;
    this.translateAxisLine = null;
    this.translateAxisLength = 20;
    this.translatePlaneMesh = null;
    this.translateNormalLine = null;
    this.translatePlaneSize = 30;
    this.rotateAxisLine = null;
    this.rotateAxisLength = 20;
    this.rotatePlaneMesh = null;
    this.rotateNormalLine = null;
    this.rotatePlaneSize = 30;

    this.raycaster = new THREE.Raycaster();
    // only interact with layer 0
    this.raycaster.layers.set(0);
    this.mouse = new THREE.Vector2();
    this.init();
  }

  init() {
    this.selectionBox = new SelectionBox(this.tjs.camera, this.tjs.scene);
    this.helper = new SelectionHelper(this.tjs.renderers["MainRenderer"].renderer, "selectBox");
    this.lassoHelper = new LassoHelper(this.tjs.renderers["MainRenderer"].renderer, "lassoSelect");
    this.initModeHint();
    window.addEventListener("pointerdown", this.onMouseDown.bind(this), false);
  }

  get selectedObjects() {
    return this._selectedObjects;
  }

  set selectedObjects(objects) {
    // skip nonSelectable objects
    objects = objects.filter((object) => {
      return !object.userData.notSelectable;
    });
    this._selectedObjects = objects;
    this.highlightSelectedObjects();
    if (objects.length > 0 && !this.weas.eventHandlers?.transformControls?.mode) {
      this.setModeHint("");
    }
  }

  onMouseDown(event) {
    const rect = this.tjs.updateViewerRect();
    let x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    let y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.selectionBox.startPoint.set(x, y, 0.5);
    this.oldSelectedAtomsIndices = this.weas.avr.selectedAtomsIndices;
    this.oldSelectedObjects = this.selectedObjects;
  }

  pickSelection(event) {
    const rect = this.tjs.updateViewerRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    // Update the picking ray
    this.raycaster.setFromCamera(this.mouse, this.tjs.camera);

    // Get the intersections for all meshes in the scene
    const intersects = this.raycaster.intersectObjects(this.tjs.scene.children, true);
    if (intersects.length === 0) {
      this.clearSelection();
      return;
    }

    let object = intersects[0].object;
    const face = intersects[0].face;
    const point = intersects[0].point;
    const parentMesh = object.parent?.isMesh ? object.parent : null;
    if (object.isLineSegments && object.userData?.type === "anyMesh" && parentMesh) {
      if (parentMesh.userData?.objectMode === "edit") {
        return;
      }
      object = parentMesh;
    }
    this.weas.activeObject = object;
    // object.userData.notSelectable is a flag to prevent selection of certain objects
    if (object.userData.notSelectable) {
      return;
    }
    //---------------------------Object Mode: "edit"--------------------------------
    if (object.userData.objectMode === "edit") {
      let selectionInfo;
      if (object.isInstancedMesh) {
        selectionInfo = {
          object: object,
          vertexId: intersects[0].instanceId,
        };
      }
      // if the object is lineSegments, return
      else if (object.isLineSegments) {
        return;
      } else {
        // Handle normal mesh
        // Find the closest vertex among vertices a, b, and c
        const closestVertex = getClosestVertex(object, face, point);
        selectionInfo = {
          object: object,
          vertexId: closestVertex.vertexId,
          faceId: intersects[0].faceIndex,
        };
      }
      if (this.selectedInstances[object.uuid]) {
        const isSelected = this.selectedInstances[object.uuid].some((vertexId) => {
          return vertexId === selectionInfo.vertexId;
        });
        // if selected vertex is already in the selection, remove it
        if (isSelected) {
          this.selectedInstances[object.uuid] = this.selectedInstances[object.uuid].filter((vertexId) => {
            return vertexId !== selectionInfo.vertexId;
          });
        } else {
          this.selectedInstances[object.uuid].push(selectionInfo.vertexId);
        }
      } else {
        this.selectedInstances[object.uuid] = [selectionInfo.vertexId];
      }
      // if object is a atom, add the object to the selection
      if (object.userData.type === "atom") {
        this.weas.avr.selectedAtomsIndices = [...this.selectedInstances[object.uuid]];
      }
      //---------------------------Object Mode: "object"--------------------------------
    } else {
      // Check if the selected object is already in the selection
      const isSelected = this.selectedObjects.some((selectedObject) => {
        return selectedObject === object;
      });
      if (isSelected) {
        // If the object is already selected, remove it from the selection
        removeOutline(object);
        this.selectedObjects = this.selectedObjects.filter((selectedObject) => {
          return selectedObject !== object;
        });
      } else {
        this.selectedObjects.push(object);
        createOutline(object, 1.1);
      }
    }
    this.highlightSelectedVertex();
  }

  dragSelection(event) {
    const rect = this.tjs.updateViewerRect();
    let x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    let y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.selectionBox.endPoint.set(x, y, 0.5);

    this.selectionBox.select();
    // add the selected atoms to the selectedAtomsIndices array
    if (this.selectionBox.instances[this.weas.avr.atomManager.meshes["atom"].uuid]) {
      const selectedAtomsIndicesFromBox = this.selectionBox.instances[this.weas.avr.atomManager.meshes["atom"].uuid];
      // merge the selected atoms (array) from the box with the old selected atoms array as a new array
      // avoid duplicates, but keep order
      this.weas.avr.selectedAtomsIndices = [...new Set([...this.oldSelectedAtomsIndices, ...selectedAtomsIndicesFromBox])];
    }
    // add the selected objects to the selectedObjects array
    // this.selectionBox.collection;
    this.selectedObjects = [...new Set([...this.oldSelectedObjects, ...this.selectionBox.collection])];
  }

  startLasso(event) {
    const { point, rect } = this.getViewerPoint(event);
    this.lassoPoints = [point];
    this.isLassoing = true;
    this.lassoHelper.start(this.lassoPoints, rect);
  }

  dragLasso(event) {
    if (!this.isLassoing) {
      return;
    }
    const { point, rect } = this.getViewerPoint(event);
    const lastPoint = this.lassoPoints[this.lassoPoints.length - 1];
    const dx = point.x - lastPoint.x;
    const dy = point.y - lastPoint.y;
    if (dx * dx + dy * dy < 4) {
      return;
    }
    this.lassoPoints.push(point);
    this.lassoHelper.update(this.lassoPoints, rect);
  }

  finishLasso() {
    if (!this.isLassoing) {
      return;
    }
    this.isLassoing = false;
    this.lassoHelper.finish();
    const points = this.lassoPoints;
    this.lassoPoints = [];
    if (points.length < 3) {
      return;
    }
    const selectedIndices = this.getAtomsInsideLasso(points);
    this.weas.avr.selectedAtomsIndices = [...new Set([...this.oldSelectedAtomsIndices, ...selectedIndices])];
  }

  startAxisPicking(mode = "rotate") {
    this.isAxisPicking = true;
    this.axisPickMode = mode;
    this.axisVisible = true;
    this.updateAxisHighlight();
    this.updateAxisLine();
    if (mode === "translate") {
      this.setModeHint("Axis pick: click 2 or 3 atoms, press A to exit");
    } else {
      this.setModeHint("Axis pick: click 1, 2, or 3 atoms, press A to exit");
    }
  }

  stopAxisPicking(modeHint = "Rotate mode: move mouse to rotate, click to confirm") {
    this.isAxisPicking = false;
    this.axisPickMode = null;
    this.setModeHint(modeHint);
  }

  clearAxis() {
    this.axisAtomIndices = [];
    this.axisVisible = false;
    this.updateAxisHighlight();
    this.updateAxisLine();
    this.hideRotatePlane();
  }

  pickAxisAtom(event) {
    const atomIndex = this.getAtomIndexFromEvent(event);
    if (atomIndex === null || atomIndex === undefined) {
      return false;
    }
    if (this.axisAtomIndices.includes(atomIndex)) {
      this.axisAtomIndices = this.axisAtomIndices.filter((index) => index !== atomIndex);
    } else if (this.axisAtomIndices.length >= (this.axisPickMode === "translate" ? 3 : 3)) {
      this.axisAtomIndices = [atomIndex];
    } else {
      this.axisAtomIndices.push(atomIndex);
    }
    this.updateAxisHighlight();
    this.updateAxisLine();
    return true;
  }

  clearSelection() {
    // remove outlines
    this.selectedObjects.forEach((object) => {
      removeOutline(object);
    });
    this.selectedObjects = [];
    this.selectedInstances = {};
    this.weas.avr.selectedAtomsIndices = [];
    this.highlightSelectedVertex(); // Clear the highlights
  }

  highlightSelectedVertex() {
    Object.keys(this.selectedInstances).forEach((objectUuid) => {
      const object = this.tjs.scene.getObjectByProperty("uuid", objectUuid);
      if (!object || !object.userData.vertexPoints) {
        return;
      }

      const vertexPoints = object.userData.vertexPoints;
      const selectedVertices = this.selectedInstances[objectUuid];
      const vertexCount = object.geometry.attributes.position.count;

      // Create a color array and fill it with black colors
      const colors = new Float32Array(vertexCount * 3); // 3 values per vertex (r, g, b)
      for (let i = 0; i < vertexCount; i++) {
        colors[i * 3] = 0; // Red
        colors[i * 3 + 1] = 0; // Green
        colors[i * 3 + 2] = 0; // Blue
      }

      selectedVertices.forEach((vertexId) => {
        colors[vertexId * 3] = 1; // Red
        colors[vertexId * 3 + 1] = 0; // Green
        colors[vertexId * 3 + 2] = 0; // Blue
      });
      vertexPoints.geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      vertexPoints.geometry.attributes.color.needsUpdate = true;
    });
  }

  highlightSelectedObjects() {
    this.selectedObjects.forEach((object) => {
      // clear the outline if it exists
      removeOutline(object);
      createOutline(object, 1.1);
    });
  }

  getAtomIndexFromEvent(event) {
    const rect = this.tjs.updateViewerRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.tjs.camera);
    const atomMesh = this.weas.avr?.atomManager?.meshes?.["atom"];
    if (!atomMesh) {
      return null;
    }
    const intersects = this.raycaster.intersectObject(atomMesh, true);
    if (intersects.length === 0) {
      return null;
    }
    const hit = intersects.find((intersection) => Number.isInteger(intersection.instanceId));
    return hit ? hit.instanceId : null;
  }

  updateAxisHighlight() {
    const highlightManager = this.weas?.avr?.highlightManager;
    if (!highlightManager) {
      return;
    }
    if (!highlightManager.settings || !highlightManager.settings["axis"]) {
      highlightManager.addSetting("axis", {
        indices: [],
        scale: 1.0,
        type: "crossView",
        color: "#ff8800",
        opacity: 1.0,
        occlude: false,
        offset: 1.0,
        thickness: 0.08,
      });
      highlightManager.drawHighlightAtoms();
    }
    if (!highlightManager.settings["axisCenter"]) {
      highlightManager.addSetting("axisCenter", {
        indices: [],
        scale: 0.8,
        type: "cross",
        color: "#ff8800",
        opacity: 0.9,
      });
      highlightManager.drawHighlightAtoms();
    }
    const indices = this.axisVisible ? this.axisAtomIndices : [];
    highlightManager.settings["axis"].indices = [...indices];
    const centerIndices = this.axisVisible && this.axisAtomIndices.length === 1 ? [...this.axisAtomIndices] : [];
    highlightManager.settings["axisCenter"].indices = [...centerIndices];
    highlightManager.updateHighlightAtomsMesh(
      {
        indices,
        scale: 1.0,
        type: "crossView",
        color: "#ff8800",
        opacity: 1.0,
        occlude: false,
        offset: 1.0,
        thickness: 0.08,
      },
      "axis",
    );
    highlightManager.updateHighlightAtomsMesh(
      {
        indices: centerIndices,
        scale: 0.8,
        type: "cross",
        color: "#ff8800",
        opacity: 0.9,
      },
      "axisCenter",
    );
    highlightManager.updateLabelSizes?.(this.tjs.camera, this.tjs.renderers?.MainRenderer?.renderer);
    this.weas?.avr?.requestRedraw?.("render");
  }

  updateAxisLine() {
    if (!this.axisVisible) {
      if (this.axisLine) {
        this.tjs.scene.remove(this.axisLine);
        this.axisLine.geometry.dispose();
        this.axisLine.material.dispose();
        this.axisLine = null;
      }
      this.hideRotatePlane();
      return;
    }
    if (this.axisAtomIndices.length === 3) {
      if (this.axisLine) {
        this.tjs.scene.remove(this.axisLine);
        this.axisLine.geometry.dispose();
        this.axisLine.material.dispose();
        this.axisLine = null;
      }
      this.showRotatePlaneFromAxisAtoms();
      return;
    }
    this.hideRotatePlane();
    if (this.axisAtomIndices.length !== 2) {
      if (this.axisLine) {
        this.tjs.scene.remove(this.axisLine);
        this.axisLine.geometry.dispose();
        this.axisLine.material.dispose();
        this.axisLine = null;
      }
      return;
    }
    const positions = this.weas?.avr?.atoms?.positions;
    if (!positions) {
      return;
    }
    const firstIndex = this.axisAtomIndices[0];
    const secondIndex = this.axisAtomIndices[1];
    if (!positions[firstIndex] || !positions[secondIndex]) {
      return;
    }
    const start = new THREE.Vector3(...positions[firstIndex]);
    const end = new THREE.Vector3(...positions[secondIndex]);
    const axis = end.clone().sub(start);
    const axisLength = axis.length();
    if (axisLength === 0) {
      return;
    }
    const direction = axis.normalize();
    const midpoint = start.clone().add(end).multiplyScalar(0.5);
    const extend = axisLength * this.axisLineExtendFactor;
    const longStart = midpoint.clone().addScaledVector(direction, -extend);
    const longEnd = midpoint.clone().addScaledVector(direction, extend);
    if (!this.axisLine) {
      const geometry = new THREE.BufferGeometry().setFromPoints([longStart, longEnd]);
      const material = new THREE.LineBasicMaterial({ color: 0xff8800, transparent: true, opacity: 0.9, depthTest: false });
      this.axisLine = new THREE.Line(geometry, material);
      this.axisLine.userData.notSelectable = true;
      this.axisLine.layers.set(1);
      this.axisLine.renderOrder = 999;
      this.tjs.scene.add(this.axisLine);
    } else {
      this.axisLine.geometry.setFromPoints([longStart, longEnd]);
      this.axisLine.geometry.attributes.position.needsUpdate = true;
      this.axisLine.geometry.computeBoundingSphere();
    }
  }

  refreshAxisLine() {
    this.updateAxisLine();
  }

  showAxisVisuals() {
    this.axisVisible = true;
    this.updateAxisHighlight();
    this.updateAxisLine();
    this.weas?.avr?.requestRedraw?.("render");
  }

  hideAxisVisuals() {
    this.axisVisible = false;
    this.updateAxisHighlight();
    this.updateAxisLine();
    this.hideRotatePlane();
    this.weas?.avr?.requestRedraw?.("render");
  }

  showTranslateAxisLine(center, axis) {
    this.showAxisLine({
      center,
      axis,
      length: this.translateAxisLength,
      color: 0x55aaff,
      lineKey: "translateAxisLine",
    });
  }

  hideTranslateAxisLine() {
    this.hideAxisLine({ lineKey: "translateAxisLine" });
  }

  showTranslatePlane(center, normal) {
    this.showPlaneWithNormal({
      center,
      normal,
      size: this.translatePlaneSize,
      color: 0x55aaff,
      lineLength: this.translateAxisLength,
      meshKey: "translatePlaneMesh",
      lineKey: "translateNormalLine",
    });
  }

  hideTranslatePlane() {
    this.hidePlaneWithNormal({
      meshKey: "translatePlaneMesh",
      lineKey: "translateNormalLine",
    });
  }

  showRotateAxisLine(center, axis) {
    this.hideRotatePlane();
    this.showAxisLine({
      center,
      axis,
      length: this.rotateAxisLength,
      color: 0xffaa55,
      lineKey: "rotateAxisLine",
    });
  }

  hideRotateAxisLine() {
    this.hideAxisLine({ lineKey: "rotateAxisLine" });
    this.hideRotatePlane();
  }

  showRotatePlaneFromAxisAtoms() {
    const positions = this.weas?.avr?.atoms?.positions;
    if (!positions || this.axisAtomIndices.length !== 3) {
      this.hidePlaneWithNormal({
        meshKey: "rotatePlaneMesh",
        lineKey: "rotateNormalLine",
      });
      return;
    }
    const [i0, i1, i2] = this.axisAtomIndices;
    if (!positions[i0] || !positions[i1] || !positions[i2]) {
      this.hidePlaneWithNormal({
        meshKey: "rotatePlaneMesh",
        lineKey: "rotateNormalLine",
      });
      return;
    }
    const a = new THREE.Vector3(...positions[i0]);
    const b = new THREE.Vector3(...positions[i1]);
    const c = new THREE.Vector3(...positions[i2]);
    const normal = b.clone().sub(a).cross(c.clone().sub(a));
    if (normal.lengthSq() === 0) {
      this.hidePlaneWithNormal({
        meshKey: "rotatePlaneMesh",
        lineKey: "rotateNormalLine",
      });
      return;
    }
    const center = a
      .clone()
      .add(b)
      .add(c)
      .multiplyScalar(1 / 3);
    this.showPlaneWithNormal({
      center,
      normal,
      size: this.rotatePlaneSize,
      color: 0xffaa55,
      lineLength: this.rotateAxisLength,
      meshKey: "rotatePlaneMesh",
      lineKey: "rotateNormalLine",
    });
  }

  hideRotatePlane() {
    this.hidePlaneWithNormal({
      meshKey: "rotatePlaneMesh",
      lineKey: "rotateNormalLine",
    });
  }

  showPlaneWithNormal({ center, normal, size, color, lineLength, meshKey, lineKey }) {
    if (!center || !normal) {
      return;
    }
    const unitNormal = normal.clone().normalize();
    if (unitNormal.lengthSq() === 0) {
      return;
    }
    if (!this[meshKey]) {
      const geometry = new THREE.PlaneGeometry(size, size);
      const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide,
        depthTest: false,
      });
      this[meshKey] = new THREE.Mesh(geometry, material);
      this[meshKey].userData.notSelectable = true;
      this[meshKey].layers.set(1);
      this[meshKey].renderOrder = 998;
      this.tjs.scene.add(this[meshKey]);
    }
    const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), unitNormal);
    this[meshKey].position.copy(center);
    this[meshKey].quaternion.copy(quaternion);
    const start = center.clone();
    const end = center.clone().addScaledVector(unitNormal, lineLength);
    if (!this[lineKey]) {
      const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
      const material = new THREE.LineDashedMaterial({
        color,
        dashSize: 0.6,
        gapSize: 0.4,
        transparent: true,
        opacity: 0.9,
        depthTest: false,
      });
      this[lineKey] = new THREE.Line(geometry, material);
      this[lineKey].computeLineDistances();
      this[lineKey].userData.notSelectable = true;
      this[lineKey].layers.set(1);
      this[lineKey].renderOrder = 999;
      this.tjs.scene.add(this[lineKey]);
    } else {
      this[lineKey].geometry.setFromPoints([start, end]);
      this[lineKey].geometry.attributes.position.needsUpdate = true;
      this[lineKey].geometry.computeBoundingSphere();
      this[lineKey].computeLineDistances();
    }
    this.weas?.avr?.requestRedraw?.("render");
  }

  hidePlaneWithNormal({ meshKey, lineKey }) {
    if (this[meshKey]) {
      this.tjs.scene.remove(this[meshKey]);
      this[meshKey].geometry.dispose();
      this[meshKey].material.dispose();
      this[meshKey] = null;
    }
    if (this[lineKey]) {
      this.tjs.scene.remove(this[lineKey]);
      this[lineKey].geometry.dispose();
      this[lineKey].material.dispose();
      this[lineKey] = null;
    }
    this.weas?.avr?.requestRedraw?.("render");
  }

  showAxisLine({ center, axis, length, color, lineKey }) {
    if (!center || !axis) {
      return;
    }
    const direction = axis.clone().normalize();
    if (direction.lengthSq() === 0) {
      return;
    }
    const start = center.clone().addScaledVector(direction, -length);
    const end = center.clone().addScaledVector(direction, length);
    if (!this[lineKey]) {
      const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
      const material = new THREE.LineDashedMaterial({
        color,
        dashSize: 0.6,
        gapSize: 0.4,
        transparent: true,
        opacity: 0.9,
        depthTest: false,
      });
      this[lineKey] = new THREE.Line(geometry, material);
      this[lineKey].computeLineDistances();
      this[lineKey].userData.notSelectable = true;
      this[lineKey].layers.set(1);
      this[lineKey].renderOrder = 999;
      this.tjs.scene.add(this[lineKey]);
    } else {
      this[lineKey].geometry.setFromPoints([start, end]);
      this[lineKey].geometry.attributes.position.needsUpdate = true;
      this[lineKey].geometry.computeBoundingSphere();
      this[lineKey].computeLineDistances();
    }
    this.weas?.avr?.requestRedraw?.("render");
  }

  hideAxisLine({ lineKey }) {
    if (!this[lineKey]) {
      return;
    }
    this.tjs.scene.remove(this[lineKey]);
    this[lineKey].geometry.dispose();
    this[lineKey].material.dispose();
    this[lineKey] = null;
    this.weas?.avr?.requestRedraw?.("render");
  }

  initModeHint() {
    const parent = this.tjs.renderers?.MainRenderer?.renderer?.domElement?.parentElement;
    if (!parent || this.modeHint) {
      return;
    }
    this.modeHint = document.createElement("div");
    this.modeHint.className = "weas-mode-hint";
    this.modeHint.style.display = "none";
    parent.appendChild(this.modeHint);
  }

  setModeHint(text) {
    if (!this.modeHint) {
      this.initModeHint();
    }
    if (!this.modeHint) {
      return;
    }
    if (!text) {
      this.modeHint.style.display = "none";
      this.modeHint.textContent = "";
      return;
    }
    this.modeHint.textContent = text;
    this.modeHint.style.display = "block";
  }

  getViewerPoint(event) {
    const rect = this.tjs.updateViewerRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return { point: { x, y }, rect };
  }

  getAtomsInsideLasso(points) {
    const atoms = this.weas.avr.atoms;
    if (!atoms || !Array.isArray(atoms.positions)) {
      return [];
    }
    const rect = this.tjs.updateViewerRect();
    const camera = this.tjs.camera;
    const selected = [];
    const projected = new THREE.Vector3();

    for (let i = 0; i < atoms.positions.length; i++) {
      projected.set(...atoms.positions[i]).project(camera);
      if (projected.z < -1 || projected.z > 1) {
        continue;
      }
      const screenX = (projected.x + 1) * 0.5 * rect.width;
      const screenY = (-projected.y + 1) * 0.5 * rect.height;
      if (pointInPolygon(screenX, screenY, points)) {
        selected.push(i);
      }
    }
    return selected;
  }
}

function getClosestVertex(object, face, point) {
  // Find the closest vertex to the intersection point
  const positionAttribute = object.geometry.getAttribute("position");
  const vertexA = new THREE.Vector3();
  const vertexB = new THREE.Vector3();
  const vertexC = new THREE.Vector3();
  vertexA.fromBufferAttribute(positionAttribute, face.a).applyMatrix4(object.matrixWorld);
  vertexB.fromBufferAttribute(positionAttribute, face.b).applyMatrix4(object.matrixWorld);
  vertexC.fromBufferAttribute(positionAttribute, face.c).applyMatrix4(object.matrixWorld);
  const distances = [
    { vertexId: face.a, distance: vertexA.distanceTo(point) },
    { vertexId: face.b, distance: vertexB.distanceTo(point) },
    { vertexId: face.c, distance: vertexC.distanceTo(point) },
  ];
  // find the closest vertex
  const closestVertex = distances.reduce((a, b) => {
    return a.distance < b.distance ? a : b;
  });

  return closestVertex;
}

function pointInPolygon(x, y, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) {
      inside = !inside;
    }
  }
  return inside;
}
