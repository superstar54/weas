/*
 */
import * as THREE from "three";
import { clearObjects } from "../utils";

export class WeasScene extends THREE.Scene {
  constructor(tjs) {
    super();
    this.tjs = tjs;

    // Scene-wide caches
    this._boundingBox = new THREE.Box3();
    this._center = new THREE.Vector3();
    this._size = new THREE.Vector3();

    this.objectGroups = {};
  }

  // --- Object management ---
  addObject(object, group = null) {
    super.add(object);

    if (group && this.objectGroups[group]) {
      this.objectGroups[group].push(object);
    }

    this.dispatchObjectEvent({
      data: object.toJSON(),
      action: "add",
      catalog: "object",
      group,
    });

    this.updateBoundingBox();
    return object;
  }

  removeObject(object, group = null) {
    if (typeof object === "string") {
      object = this.getObjectByProperty("uuid", object);
      if (!object) {
        console.warn("Object not found");
        return;
      }
    }

    super.remove(object);

    if (group && this.objectGroups[group]) {
      const index = this.objectGroups[group].indexOf(object);
      if (index > -1) this.objectGroups[group].splice(index, 1);
    }

    this.dispatchObjectEvent({
      data: object.toJSON(),
      action: "remove",
      catalog: "object",
      group,
    });

    this.updateBoundingBox();
    return object;
  }

  removeGroup(groupName) {
    if (!groupName) return;

    // Find all objects with this group
    const objectsToRemove = [];
    this.traverse((obj) => {
      if (obj.group === groupName) {
        objectsToRemove.push(obj);
      }
    });

    // Remove each object
    objectsToRemove.forEach((obj) => this.remove(obj));
  }

  dispatchObjectEvent(data) {
    const event = new CustomEvent("weas", { detail: data });
    this.tjs.containerElement.dispatchEvent(event);
  }

  clear() {
    clearObjects(this);
    Object.keys(this.objectGroups).forEach(
      (key) => (this.objectGroups[key] = []),
    );
    this.updateBoundingBox();
  }

  dispatchObjectEvent(detail) {
    const event = new CustomEvent("weas", { detail });
    this.tjs.containerElement.dispatchEvent(event);
  }

  // --- Bounding box helpers ---
  updateBoundingBox() {
    this._boundingBox.makeEmpty();
    this.traverse((obj) => {
      if (obj.isMesh || obj.isLineSegments || obj.isInstancedMesh) {
        let box = new THREE.Box3();
        if (obj.isInstancedMesh) {
          if (obj.count === 0) return;
          obj.computeBoundingBox();
          box.copy(obj.boundingBox);
        } else {
          obj.geometry.computeBoundingBox();
          box.copy(obj.geometry.boundingBox);
        }
        box.applyMatrix4(obj.matrixWorld);
        this._boundingBox.union(box);
      }
    });
    this._center.copy(this._boundingBox.getCenter(new THREE.Vector3()));
    this._size.copy(this._boundingBox.getSize(new THREE.Vector3()));
  }

  getBoundingBox() {
    return this._boundingBox.clone();
  }

  getCenter() {
    return this._center.clone();
  }

  getSize() {
    return this._size.clone();
  }

  getProjectedBoundingBox(direction = [0, 0, 1]) {
    direction = new THREE.Vector3(...direction).normalize();

    // Compute the scene bounding box
    const box = new THREE.Box3();
    this.traverse((obj) => {
      if (obj.isMesh || obj.isLineSegments || obj.isInstancedMesh) {
        obj.geometry.computeBoundingBox();
        const objBox = obj.geometry.boundingBox
          .clone()
          .applyMatrix4(obj.matrixWorld);
        box.union(objBox);
      }
    });

    if (box.isEmpty()) return new THREE.Vector3(0, 0, 0);

    // Project corners along direction
    const corners = [
      new THREE.Vector3(box.min.x, box.min.y, box.min.z),
      new THREE.Vector3(box.min.x, box.min.y, box.max.z),
      new THREE.Vector3(box.min.x, box.max.y, box.min.z),
      new THREE.Vector3(box.min.x, box.max.y, box.max.z),
      new THREE.Vector3(box.max.x, box.min.y, box.min.z),
      new THREE.Vector3(box.max.x, box.min.y, box.max.z),
      new THREE.Vector3(box.max.x, box.max.y, box.min.z),
      new THREE.Vector3(box.max.x, box.max.y, box.max.z),
    ];

    const alignMatrix = new THREE.Matrix4().lookAt(
      direction,
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 1, 0),
    );
    let minProjected = new THREE.Vector3(Infinity, Infinity, Infinity);
    let maxProjected = new THREE.Vector3(-Infinity, -Infinity, -Infinity);

    corners.forEach((corner) => {
      const projected = corner.clone().applyMatrix4(alignMatrix);
      minProjected.min(projected);
      maxProjected.max(projected);
    });

    const size = new THREE.Vector3();
    size.subVectors(maxProjected, minProjected);
    return size;
  }
}
