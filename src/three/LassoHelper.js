class LassoHelper {
  constructor(renderer, cssClassName) {
    this.renderer = renderer;
    this.element = document.createElement("canvas");
    this.element.classList.add(cssClassName);
    this.element.style.pointerEvents = "none";
    this.element.style.position = "absolute";
    this.element.style.left = "0";
    this.element.style.top = "0";
    this.element.style.display = "none";
    this.context = this.element.getContext("2d");
  }

  start(points, rect) {
    this.ensureMounted();
    this.resize(rect);
    this.element.style.display = "block";
    this.draw(points);
  }

  update(points, rect) {
    this.resize(rect);
    this.draw(points);
  }

  finish() {
    if (this.element.parentElement) {
      this.element.parentElement.removeChild(this.element);
    }
    this.element.style.display = "none";
  }

  ensureMounted() {
    const parent = this.renderer.domElement.parentElement;
    if (!parent) {
      return;
    }
    if (!this.element.parentElement) {
      parent.appendChild(this.element);
    }
  }

  resize(rect) {
    if (!rect) {
      return;
    }
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    if (this.element.width !== width || this.element.height !== height) {
      this.element.width = width;
      this.element.height = height;
    }
  }

  draw(points) {
    if (!this.context) {
      return;
    }
    this.context.clearRect(0, 0, this.element.width, this.element.height);
    if (!points || points.length < 2) {
      return;
    }
    this.context.beginPath();
    this.context.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      this.context.lineTo(points[i].x, points[i].y);
    }
    this.context.closePath();
    this.context.fillStyle = "rgba(75, 160, 255, 0.15)";
    this.context.strokeStyle = "rgba(85, 170, 255, 0.9)";
    this.context.lineWidth = 1;
    this.context.fill();
    this.context.stroke();
  }
}

export { LassoHelper };
