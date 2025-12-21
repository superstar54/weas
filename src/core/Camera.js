import * as THREE from "three";

export class OrthographicCamera extends THREE.OrthographicCamera {
  constructor(left, right, top, bottom, near, far, tjs = null) {
    super(left, right, top, bottom, near, far);
    this.tjs = tjs;
  }

  // Custom method to update zoom
  updateZoom(value) {
    if (this.zoom !== value) {
      this.zoom = value;
      this.updateProjectionMatrix(); // Required to apply the zoom change
      this.dispatchObjectEvent({
        data: value,
        action: "zoom",
        catalog: "camera",
      });
    }
  }

  // Custom method to update position
  updatePosition(x, y, z) {
    const newPos = new THREE.Vector3(x, y, z);
    if (!this.position.equals(newPos)) {
      this.position.copy(newPos);
      this.updateProjectionMatrix(); // Required to apply the zoom change
      this.dispatchObjectEvent({
        data: [x, y, z],
        action: "position",
        catalog: "camera",
      });
    }
  }

  dispatchObjectEvent(data) {
    const event = new CustomEvent("weas", { detail: data });
    this.tjs.containerElement.dispatchEvent(event);
    if (this.tjs && typeof this.tjs.requestRedraw === "function") {
      this.tjs.requestRedraw("render");
    } else {
      this.tjs.render();
    }
  }
}
