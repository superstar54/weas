/*
This module is responsible for managing the selection of objects and vertices in the 3D viewer.
 */
import * as THREE from "three";
import { createOutline, removeOutline } from "./ObjectManager.js";
import { SelectionBox } from "three/examples/jsm/interactive/SelectionBox.js";
import { SelectionHelper } from "../three/SelectionHelper.js";

export class SelectionManager {
  constructor(weas) {
    this.weas = weas;
    this.tjs = weas.tjs;
    this._selectedObjects = [];
    this.selectedInstances = {}; // {object.uuid: [vertexId1, vertexId2, ...]}

    this.raycaster = new THREE.Raycaster();
    // only interact with layer 0
    this.raycaster.layers.set(0);
    this.mouse = new THREE.Vector2();
    this.init();
  }

  init() {
    this.selectionBox = new SelectionBox(this.tjs.camera, this.tjs.scene);
    this.helper = new SelectionHelper(this.tjs.renderers["MainRenderer"].renderer, "selectBox");
    window.addEventListener("pointerdown", this.onMouseDown.bind(this), false);
  }

  get selectedObjects() {
    return this._selectedObjects;
  }

  set selectedObjects(objects) {
    console.log("Setting selected objects: ", objects);
    // skip nonSelectable objects
    objects = objects.filter((object) => {
      return !object.userData.notSelectable;
    });
    this._selectedObjects = objects;
    this.highlightSelectedObjects();
  }

  onMouseDown(event) {
    let x = ((event.clientX - this.tjs.viewerRect.left) / this.tjs.viewerRect.width) * 2 - 1;
    let y = -((event.clientY - this.tjs.viewerRect.top) / this.tjs.viewerRect.height) * 2 + 1;
    this.selectionBox.startPoint.set(x, y, 0.5);
    this.oldSelectedAtomsIndices = this.weas.avr.selectedAtomsIndices;
    this.oldSelectedObjects = this.selectedObjects;
  }

  pickSelection(event) {
    this.mouse.x = ((event.clientX - this.tjs.viewerRect.left) / this.tjs.viewerRect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - this.tjs.viewerRect.top) / this.tjs.viewerRect.height) * 2 + 1;
    // Update the picking ray
    this.raycaster.setFromCamera(this.mouse, this.tjs.camera);

    // Get the intersections for all meshes in the scene
    const intersects = this.raycaster.intersectObjects(this.tjs.scene.children, true);
    if (intersects.length === 0) {
      this.clearSelection();
      return;
    }

    const object = intersects[0].object;
    const face = intersects[0].face;
    const point = intersects[0].point;
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
        console.log("LineSegments selection not implemented");
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
        console.log("Removing object from selection: ", object);
        removeOutline(object);
        this.selectedObjects = this.selectedObjects.filter((selectedObject) => {
          return selectedObject !== object;
        });
      } else {
        console.log("Adding object to selection: ", object);
        this.selectedObjects.push(object);
        createOutline(object, 1.1);
      }
    }
    this.highlightSelectedVertex();
  }

  dragSelection(event) {
    let x = ((event.clientX - this.tjs.viewerRect.left) / this.tjs.viewerRect.width) * 2 - 1;
    let y = -((event.clientY - this.tjs.viewerRect.top) / this.tjs.viewerRect.height) * 2 + 1;
    this.selectionBox.endPoint.set(x, y, 0.5);

    this.selectionBox.select();
    // add the selected atoms to the selectedAtomsIndices array
    if (this.selectionBox.instances[this.weas.avr.atomsMesh.uuid]) {
      const selectedAtomsIndicesFromBox = this.selectionBox.instances[this.weas.avr.atomsMesh.uuid];
      // merge the selected atoms (array) from the box with the old selected atoms array as a new array
      // avoid duplicates, but keep order
      this.weas.avr.selectedAtomsIndices = [...new Set([...this.oldSelectedAtomsIndices, ...selectedAtomsIndicesFromBox])];
    }
    // add the selected objects to the selectedObjects array
    // this.selectionBox.collection;
    this.selectedObjects = [...new Set([...this.oldSelectedObjects, ...this.selectionBox.collection])];
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
        console.log("Object or vertex points not found");
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
      console.log("Colors updated for object:", objectUuid);
    });
  }

  highlightSelectedObjects() {
    this.selectedObjects.forEach((object) => {
      // clear the outline if it exists
      removeOutline(object);
      createOutline(object, 1.1);
    });
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
