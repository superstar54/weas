import { Vector2 } from "three";

class SelectionHelper {
  constructor(renderer, cssClassName) {
    this.element = document.createElement("div");
    this.element.classList.add(cssClassName);
    this.element.style.pointerEvents = "none";
    this.element.style.position = "absolute";

    this.renderer = renderer;

    this.startPoint = new Vector2();
    this.pointTopLeft = new Vector2();
    this.pointBottomRight = new Vector2();

    this.isDown = false;
    this.enabled = true;

    this.onPointerDown = function (event) {
      if (this.enabled === false) return;

      this.isDown = true;
      this.onSelectStart(event);
    }.bind(this);

    this.onPointerMove = function (event) {
      // if shift key is not pressed or lasso mode is active, return
      if (!event.shiftKey || event.altKey) {
        return;
      }

      if (this.enabled === false) return;

      if (this.isDown) {
        this.onSelectMove(event);
      }
    }.bind(this);

    this.onPointerUp = function () {
      if (this.enabled === false) return;

      this.isDown = false;
      this.onSelectOver();
    }.bind(this);

    this.renderer.domElement.addEventListener("pointerdown", this.onPointerDown);
    this.renderer.domElement.addEventListener("pointermove", this.onPointerMove);
    this.renderer.domElement.addEventListener("pointerup", this.onPointerUp);
  }

  dispose() {
    this.renderer.domElement.removeEventListener("pointerdown", this.onPointerDown);
    this.renderer.domElement.removeEventListener("pointermove", this.onPointerMove);
    this.renderer.domElement.removeEventListener("pointerup", this.onPointerUp);
  }

  onSelectStart(event) {
    this.element.style.display = "none";

    this.renderer.domElement.parentElement.appendChild(this.element);
    const viewerRect = this.renderer.domElement.parentElement.getBoundingClientRect();
    let x = event.clientX - viewerRect.left;
    let y = event.clientY - viewerRect.top;

    this.element.style.left = x + "px";
    this.element.style.top = y + "px";
    this.element.style.width = "0px";
    this.element.style.height = "0px";

    this.startPoint.x = x;
    this.startPoint.y = y;
  }

  onSelectMove(event) {
    this.element.style.display = "block";
    const viewerRect = this.renderer.domElement.parentElement.getBoundingClientRect();
    let x = event.clientX - viewerRect.left;
    let y = event.clientY - viewerRect.top;

    this.pointBottomRight.x = Math.max(this.startPoint.x, x);
    this.pointBottomRight.y = Math.max(this.startPoint.y, y);
    this.pointTopLeft.x = Math.min(this.startPoint.x, x);
    this.pointTopLeft.y = Math.min(this.startPoint.y, y);

    this.element.style.left = this.pointTopLeft.x + "px";
    this.element.style.top = this.pointTopLeft.y + "px";
    this.element.style.width = this.pointBottomRight.x - this.pointTopLeft.x + "px";
    this.element.style.height = this.pointBottomRight.y - this.pointTopLeft.y + "px";
  }

  onSelectOver() {
    this.element.parentElement.removeChild(this.element);
  }
}

export { SelectionHelper };
