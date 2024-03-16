import * as THREE from "three";
import { clearObject } from "../utils.js";

export class ObjectManager {
  constructor(weas) {
    this.weas = weas;
    this.selectionManager = weas.selectionManager;
    this.sceneManager = weas.tjs.sceneManager;
  }

  translateSelectedObjects(translateVector) {
    this.selectionManager.selectedObjects.forEach((object) => {
      const initialPosition = object.position.clone();
      object.position.copy(initialPosition.add(translateVector));
    });
  }

  rotateSelectedObjects(rotationAxis, rotationAngle) {
    rotationAxis = rotationAxis.normalize();
    rotationAngle = THREE.MathUtils.degToRad(rotationAngle);
    this.selectionManager.selectedObjects.forEach((object) => {
      object.rotateOnAxis(rotationAxis, -rotationAngle);
    });
  }

  deleteSelectedObjects() {
    this.selectionManager.selectedObjects.forEach((object) => {
      clearObject(this.sceneManager.scene, object);
    });
    this.selectionManager.clearSelection();
  }

  scaleSelectedObjects(scale) {
    this.selectionManager.selectedObjects.forEach((object) => {
      object.scale.multiply(scale);
    });
  }

  copySelectedObjects() {
    const newObjects = [];
    this.selectionManager.selectedObjects.forEach((object) => {
      const clone = object.clone();
      clone.position.add(new THREE.Vector3(1, 1, 1));
      this.sceneManager.scene.add(clone);
      newObjects.push(clone);
    });
    this.selectionManager.selectedObjects = newObjects;
    return newObjects;
  }

  enterMode(mode) {
    if (this.weas.activeObject === null) return;
    this.weas.activeObject.userData.objectMode = mode;
    if (mode === "edit") {
      if (!this.weas.activeObject.userData.vertexPoints) {
        initVertexIndicators(this.weas.activeObject);
      }
      this.weas.activeObject.userData.vertexPoints.visible = true;
    } else {
      if (this.weas.activeObject.userData.vertexPoints) {
        this.weas.activeObject.userData.vertexPoints.visible = false;
      }
    }
  }
}

export function createOutline(object, outlineScale = 1.1) {
  const outlineMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.BackSide, transparent: true, opacity: 0.8 });
  const outlineMesh = new THREE.Mesh(object.geometry, outlineMaterial);
  outlineMesh.scale.multiplyScalar(outlineScale);
  outlineMesh.layers.set(1);
  object.add(outlineMesh); // Add as a child of the original mesh
  object.userData.outlineMesh = outlineMesh; // Keep a reference for removal
}

export function removeOutline(object) {
  console.log("removeOutline: ", object);
  if (object.userData.outlineMesh) {
    object.remove(object.userData.outlineMesh);
    object.userData.outlineMesh = undefined;
  }
}

export function initVertexIndicators(object) {
  console.log("initVertexIndicators: ", object);
  const vertices = object.geometry.attributes.position;
  const vertexCount = vertices.count;
  const pointsMaterial = new THREE.PointsMaterial({ vertexColors: true, size: 5, sizeAttenuation: false });
  const pointsGeometry = new THREE.BufferGeometry();

  pointsGeometry.setAttribute("position", vertices);

  // Create a color array and fill it with black colors
  const colors = new Float32Array(vertexCount * 3); // 3 values per vertex (r, g, b)
  for (let i = 0; i < vertexCount; i++) {
    colors[i * 3] = 0; // Red
    colors[i * 3 + 1] = 0; // Green
    colors[i * 3 + 2] = 0; // Blue
  }
  pointsGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const vertexPoints = new THREE.Points(pointsGeometry, pointsMaterial);
  object.add(vertexPoints);
  vertexPoints.layers.set(1);
  object.userData.vertexPoints = vertexPoints;
}
