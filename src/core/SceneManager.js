/*
 */
import * as THREE from "three";
import { clearObjects } from "../utils.js";

export class SceneManager {
  constructor() {
    this.scene = new THREE.Scene();
  }
  add(object) {
    this.scene.add(object);
  }
  remove(object) {
    this.scene.remove(object);
  }
  get children() {
    return this.scene.children;
  }
  // Call this method after updating atoms
  dispatchViewerUpdated(data) {
    // create a list of picked atoms from the selectedAtomsIndices set
    const event = new CustomEvent("viewerUpdated", { detail: data });
    this.tjs.containerElement.dispatchEvent(event);
    console.log("Dispatch viewerUpdated");
  }

  clear() {
    clearObjects(this.scene);
  }
}
