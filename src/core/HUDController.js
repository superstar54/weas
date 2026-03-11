export default class HUDController {
  constructor(container, mainRenderer) {
    this.container = document.createElement("div");
    this.container.style.position = "absolute";
    this.container.style.top = "0";
    this.container.style.left = "0";
    this.container.style.width = "100%";
    this.container.style.height = "100%";
    this.container.style.pointerEvents = "none";

    container.appendChild(this.container);

    this.htmlElements = new Map();
    this.miniScenes = new Map();
    this.renderer = mainRenderer;

    window.addEventListener("resize", () => this.update());
  }

  // defines space cartesian axis
  initCoordScene(mainCamera) {
    const scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0xffffff, 2.0));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    const axes = new THREE.AxesHelper(1.5);
    scene.add(axes);

    const camera = new THREE.OrthographicCamera(-2, 2, 2, -2, 1, 2000);
    camera.position.copy(mainCamera.position);
    camera.lookAt(0, 0, 0);

    this.addMiniScene(
      "coord",
      scene,
      camera,
      { width: 100, height: 100 },
      { bottom: 10, left: 10 },
    );
  }

  addMiniScene(
    key,
    scene,
    camera,
    size = { width: 150, height: 150 },
    position = { top: 10, left: 10 },
  ) {
    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;
    canvas.style.position = "absolute";
    canvas.style.pointerEvents = "none";

    this.container.appendChild(canvas);

    this.miniScenes.set(key, {
      scene,
      camera,
      canvas,
      width: size.width,
      height: size.height,
      position: { ...position },
    });

    // Apply the position using the helper
    this.setMiniScenePosition(key, position);
  }

  render(mainCamera) {
    this.miniScenes.forEach(({ scene, camera, canvas }) => {
      if (!canvas.width || !canvas.height) return;

      if (scene === this.miniScenes.get("coord")?.scene) {
        camera.position.copy(mainCamera.position);
        camera.lookAt(scene.position);
      }

      const rect = canvas.getBoundingClientRect();
      const containerRect = this.container.getBoundingClientRect();

      const x = rect.left - containerRect.left;
      const y =
        containerRect.height - (rect.top - containerRect.top) - canvas.height;

      const renderer = this.renderer;
      const oldViewport = new THREE.Vector4();
      renderer.getViewport(oldViewport);

      renderer.setViewport(x, y, canvas.width, canvas.height);
      renderer.setScissor(x, y, canvas.width, canvas.height);
      renderer.setScissorTest(true);
      renderer.render(scene, camera);

      renderer.setViewport(
        oldViewport.x,
        oldViewport.y,
        oldViewport.z,
        oldViewport.w,
      );
      renderer.setScissorTest(false);
    });
  }

  update() {
    // optional: resize mini-scene canvases
  }

  // List all mini-scenes and HTML elements by key
  list() {
    const miniScenes = Array.from(this.miniScenes.keys());
    const htmlElements = Array.from(this.htmlElements.keys());
    return { miniScenes, htmlElements };
  }

  // Detailed info about each HUD element
  listDetails() {
    const miniScenes = {};
    this.miniScenes.forEach((value, key) => {
      miniScenes[key] = {
        width: value.canvas.width,
        height: value.canvas.height,
        position: value.position || {
          top: parseInt(value.canvas.style.top || 0),
          left: parseInt(value.canvas.style.left || 0),
        },
        scene: value.scene,
        camera: value.camera,
      };
    });

    const htmlElements = {};
    this.htmlElements.forEach((el, key) => {
      htmlElements[key] = {
        width: el.offsetWidth,
        height: el.offsetHeight,
        position: {
          top: parseInt(el.style.top || 0),
          left: parseInt(el.style.left || 0),
        },
        element: el,
      };
    });

    return { miniScenes, htmlElements };
  }

  // Move an existing mini-scene
  setMiniScenePosition(key, newPosition) {
    const mini = this.miniScenes.get(key);
    if (!mini) return;
    mini.position = { ...mini.position, ...newPosition }; // update stored position
    this._applyPosition(mini.canvas, mini.position);
  }

  // Helper to apply CSS from position object
  _applyPosition(el, pos) {
    if (pos.top !== undefined) {
      el.style.top = pos.top + "px";
      el.style.bottom = ""; // reset opposite
    }
    if (pos.left !== undefined) {
      el.style.left = pos.left + "px";
      el.style.right = ""; // reset opposite
    }
    if (pos.bottom !== undefined) {
      el.style.bottom = pos.bottom + "px";
      el.style.top = ""; // reset opposite
    }
    if (pos.right !== undefined) {
      el.style.right = pos.right + "px";
      el.style.left = ""; // reset opposite
    }
  }
}
