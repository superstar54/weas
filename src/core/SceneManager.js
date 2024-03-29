/*
 */
import * as THREE from "three";
import { clearObjects } from "../utils.js";

export class WeasScene extends THREE.Scene {
  constructor(tjs) {
    super();
    this.tjs = tjs;
  }

  add(object) {
    // console.log("add object", object);
    super.add(object);
    this.dispatchObjectEvent({
      data: object.toJSON(),
      action: "add",
      catalog: "object",
    });
  }

  remove(object) {
    // console.log("remove object", object);
    // if object is a string, find it by uuid
    if (typeof object === "string") {
      object = this.getObjectByProperty("uuid", object);
      if (!object) {
        console.warn("Object not found");
        return;
      }
    }
    super.remove(object);
    this.dispatchObjectEvent({
      data: object.toJSON(),
      action: "remove",
      catalog: "object",
    });
  }

  dispatchObjectEvent(data) {
    const event = new CustomEvent("weas", { detail: data });
    this.tjs.containerElement.dispatchEvent(event);
  }

  clear() {
    clearObjects(this);
  }
}
