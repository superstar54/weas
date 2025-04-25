// Import necessary Three.js components
import * as THREE from "three";
import { OrbitControls } from "../three/OrbitControls.js";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { WeasScene } from "./SceneManager.js";
import { OrthographicCamera } from "./Camera.js";

class BlendJSObject {
  constructor(name, geometry, material) {
    this.name = name;
    this.geometry = geometry;
    this.material = material;
    this.object3D = new THREE.Mesh(geometry, material);
  }
}

class BlendJSMaterial {
  constructor(name, material) {
    this.name = name;
    this.material = material;
  }
}

class BlendJSMesh {
  constructor(name, geometry) {
    this.name = name;
    this.geometry = geometry;
  }
}

class BlendJSLight {
  constructor(name, light) {
    this.name = name;
    this.light = light;
  }
}

class BlendJSRenderer {
  constructor(name, renderer) {
    this.name = name;
    this.renderer = renderer;
  }
}

export class BlendJS {
  constructor(containerElement) {
    this.containerElement = containerElement;
    this.scene = new WeasScene(this);
    this.objects = {};
    this.materials = {};
    this.meshes = {};
    this.lights = {};
    this.renderers = {}; // New property to store renderers
    this._cameraType = "Orthographic"; //"Perspective"
    this.sceneView = { left: 0, bottom: 0, width: 1.0, height: 1.0 };
    this.init();
  }

  createCoordScene() {
    this.coordScene = new THREE.Scene();

    const coordSceneRatio = 0.3;
    this.coordSceneView = {
      left: 0,
      bottom: 0,
      width: this.sceneView.width * coordSceneRatio,
      height: this.sceneView.height * coordSceneRatio,
    };

    this.coordCamera = new THREE.OrthographicCamera(this.orthographicCamera.left, this.orthographicCamera.right, this.orthographicCamera.top, this.orthographicCamera.bottom, 1, 2000);
    this.coordCamera.position.copy(this.camera.position);
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
    this.coordScene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
    directionalLight.position.set(10, 10, 10);
    this.coordScene.add(directionalLight);
  }

  createLegendScene() {
    this.legendScene = new THREE.Scene();

    const legendSceneRatio = 0.3;
    this.legendSceneView = {
      left: 0.8,
      bottom: 0,
      width: this.sceneView.width * legendSceneRatio,
      height: this.sceneView.height * legendSceneRatio,
    };

    this.legendCamera = new THREE.OrthographicCamera(this.orthographicCamera.left, this.orthographicCamera.right, this.orthographicCamera.top, this.orthographicCamera.bottom, 1, 2000);
    this.legendCamera.position.set(0, 0, 100);
  }

  get cameraType() {
    return this._cameraType;
  }

  set cameraType(value) {
    this._cameraType = value;
    this.controls = new OrbitControls(this.camera, this.renderers["MainRenderer"].renderer.domElement);
    this.updateCameraAndControls({});
  }

  get camera() {
    if (this._cameraType === "Orthographic") {
      return this.orthographicCamera;
    }
    return this.perspectiveCamera;
  }

  init() {
    this.scene.background = new THREE.Color(0xffffff); // Set the scene's background to white
    // Create a renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.autoClear = false;
    const { width: clientWidth, height: clientHeight } = getContainerDimensions(this.containerElement);
    renderer.setSize(clientWidth, clientHeight);
    // renderer.shadowMap.enabled = true;
    // renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
    // For high DPI screens
    renderer.setPixelRatio(window.devicePixelRatio);

    this.addRenderer("MainRenderer", renderer);
    // Create a label renderer
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(clientWidth, clientHeight);
    labelRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.top = "0px";
    labelRenderer.domElement.style.pointerEvents = "none";
    this.addRenderer("LabelRenderer", labelRenderer);
    // Create a camera
    this.perspectiveCamera = new THREE.PerspectiveCamera(50, clientWidth / clientHeight, 1, 500);
    this.perspectiveCamera.layers.enable(1);
    const frustumSize = 20; // This can be adjusted based on scene's scale
    const aspect = clientWidth / clientHeight;
    const frustumHalfHeight = frustumSize / 2;
    const frustumHalfWidth = frustumHalfHeight * aspect;

    this.orthographicCamera = new OrthographicCamera(
      -frustumHalfWidth, // left
      frustumHalfWidth, // right
      frustumHalfHeight, // top
      -frustumHalfHeight, // bottom
      1, // near clipping plane
      2000, // far clipping plane
      this,
    );
    this.orthographicCamera.layers.enable(1);
    // Set initial camera position
    this.camera.position.set(0, -100, 0);
    this.camera.lookAt(0, 0, 0);
    // Enable layer 1 for the camera
    // this layer will be used for vertex indicators

    this.scene.add(this.camera);
    // Create a light
    const light = new THREE.DirectionalLight(0xffffff, 2.0);
    light.position.set(50, 50, 100);
    // enabling casting shadows
    // light.castShadow = true;
    this.addLight("MainLight", light);
    // Parent the light to the camera
    this.camera.add(light);
    const ambientLight = new THREE.AmbientLight(0x404040, 20); // Soft white light
    this.addLight("AmbientLight", ambientLight);
    // OrbitControls for camera movement
    // check example here https://threejs.org/examples/?q=control#misc_controls_orbit
    this.controls = new OrbitControls(this.camera, renderer.domElement);
    // Disable shift behavior
    // this.controls.enablePan = true; // This line disables panning
    // this.controls.enableDamping = true; // Enable smooth camera movements
    // Add event listener for window resize
    this.viewerRect = this.containerElement.getBoundingClientRect();
    window.addEventListener("resize", this.onWindowResize.bind(this), false);
    // Add event listeners for mouse events
    this.containerElement.addEventListener("mousemove", this.render.bind(this));
    this.containerElement.addEventListener("pointerup", this.render.bind(this));
    this.containerElement.addEventListener("pointerdown", this.render.bind(this));
    this.containerElement.addEventListener("click", this.render.bind(this));
    this.containerElement.addEventListener("wheel", this.render.bind(this));
    this.containerElement.addEventListener("atomsUpdated", this.render.bind(this));
    this.createCoordScene();
    this.createLegendScene();
  }

  addObject(name, geometry, material) {
    const object = new BlendJSObject(name, geometry, material);
    this.objects[name] = object;
    this.scene.add(object.object3D);
    return object;
  }

  // Methods for managing materials, meshes, lights, cameras
  addMaterial(name, material) {
    const mat = new BlendJSMaterial(name, material);
    this.materials[name] = mat;
    return mat;
  }

  addMesh(name, geometry) {
    const mesh = new BlendJSMesh(name, geometry);
    this.meshes[name] = mesh;
    return mesh;
  }

  addLight(name, light) {
    const lgt = new BlendJSLight(name, light);
    this.lights[name] = lgt;
    this.scene.add(lgt.light);
    return lgt;
  }

  // Method to add a renderer
  addRenderer(name, renderer) {
    this.containerElement.appendChild(renderer.domElement);
    const rndr = new BlendJSRenderer(name, renderer);
    this.renderers[name] = rndr;
    return rndr;
  }

  onWindowResize() {
    const { width: clientWidth, height: clientHeight } = getContainerDimensions(this.containerElement);
    // Update camera and renderer sizes based on the container element
    if (this.camera.isOrthographicCamera) {
      const aspect = clientWidth / clientHeight;
      const frustumHeight = this.camera.top - this.camera.bottom;
      this.camera.left = (-frustumHeight * aspect) / 2;
      this.camera.right = (frustumHeight * aspect) / 2;
      this.coordCamera.left = this.camera.left;
      this.coordCamera.right = this.camera.right;
    } else {
      this.camera.aspect = clientWidth / clientHeight;
      this.coordCamera.aspect = this.camera.aspect;
    }
    this.camera.updateProjectionMatrix();
    this.coordCamera.updateProjectionMatrix();

    // Update legendCamera
    // Compute the aspect ratio for the legendCamera based on the legendSceneView dimensions
    const legendWidth = clientWidth * this.legendSceneView.width;
    const legendHeight = clientHeight * this.legendSceneView.height;
    const legendAspect = legendWidth / legendHeight;
    const frustumHeightLegend = this.legendCamera.top - this.legendCamera.bottom;
    this.legendCamera.left = (-frustumHeightLegend * legendAspect) / 2;
    this.legendCamera.right = (frustumHeightLegend * legendAspect) / 2;
    this.legendCamera.updateProjectionMatrix();

    // Resize all renderers
    Object.values(this.renderers).forEach((rndr) => {
      rndr.renderer.setSize(clientWidth, clientHeight);
    });
    this.viewerRect = this.containerElement.getBoundingClientRect();
    this.render();
  }

  //
  updateCameraAndControls({ lookAt = null, direction = [0, 0, 1], distance = null, zoom = 1, fov = 50 }) {
    /*
    Calculate the camera parameters based on the bounding box of the scene and the camera direction
    The camera to look at the lookAt, and rotate around the lookAt of the atoms.
    Position of the camera is defined by the look_at, direction, and distance attributes.
    */
    const { width: clientWidth, height: clientHeight } = getContainerDimensions(this.containerElement);
    // normalize the camera direction
    direction = new THREE.Vector3(...direction).normalize();
    const sceneBoundingBox = this.getSceneBoundingBox();
    // lookAt of the bounding box
    if (lookAt === null) {
      lookAt = sceneBoundingBox.getCenter(new THREE.Vector3());
    } else {
      lookAt = new THREE.Vector3(...lookAt);
    }

    const size = calculateBoundingBox(sceneBoundingBox, direction);
    let aspect;
    // Determine the aspect ratio of the camera
    if (this.camera.isOrthographicCamera) {
      aspect = clientWidth / clientHeight;
    } else {
      aspect = this.camera.aspect;
    }

    let padding = 10; // Adjust this value as needed for padding around the scene

    // Calculate the camera parameters based on the bounding box
    let cameraWidth = Math.max(size.x, size.y * aspect) + padding;
    let cameraHeight = cameraWidth / aspect;

    this.camera.left = -cameraWidth / 2;
    this.camera.right = cameraWidth / 2;
    this.camera.top = cameraHeight / 2;
    this.camera.bottom = -cameraHeight / 2;
    this.coordCamera.left = this.camera.left;
    this.coordCamera.right = this.camera.right;
    this.coordCamera.top = this.camera.top;
    this.coordCamera.bottom = this.camera.bottom;

    // Adjust camera position based on the lookAt of the bounding box and the camera direction
    if (distance === null) {
      distance = size.z + padding;
    }
    let cameraPosition = lookAt.clone().add(direction.multiplyScalar(distance));
    this.camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);

    this.camera.lookAt(lookAt);
    if (this.camera.isOrthographicCamera) {
      this.camera.updateZoom(zoom);
    } else {
      this.camera.fov = fov; // Set the new field of view
    }
    this.camera.updateProjectionMatrix();
    // Set the camera target to the lookAt of the atoms
    this.controls.target.set(lookAt.x, lookAt.y, lookAt.z);
    this.render();
  }

  getSceneBoundingBox() {
    // Create a bounding box that will include all objects
    let sceneBoundingBox = new THREE.Box3();
    // For each object in the scene, expand the bounding box to include it
    this.scene.traverse(function (object) {
      if (object.isMesh || object.isLineSegments || object.isInstancedMesh) {
        let objectBoundingBox;
        // if it is a instancedMesh
        if (object.isInstancedMesh) {
          if (object.count === 0) {
            return;
          }
          object.computeBoundingBox();
          objectBoundingBox = object.boundingBox;
        } else {
          object.geometry.computeBoundingBox();
          objectBoundingBox = object.geometry.boundingBox;
        }
        // Temporary bounding box to hold the object's world bounding box
        objectBoundingBox = new THREE.Box3().copy(objectBoundingBox).applyMatrix4(object.matrixWorld);
        // if objectBoundingBox is NaN, skip this object
        if (isNaN(objectBoundingBox.min.x) || isNaN(objectBoundingBox.min.y) || isNaN(objectBoundingBox.min.z)) {
          return;
        }
        sceneBoundingBox.union(objectBoundingBox); // Union this with the scene bounding box
      }
    });
    // if the bounding box is empty, return a default bounding box
    if (sceneBoundingBox.isEmpty()) {
      sceneBoundingBox = new THREE.Box3(new THREE.Vector3(-10, -10, -10), new THREE.Vector3(10, 10, 10));
    }
    return sceneBoundingBox;
  }

  renderSceneInfo(scene, camera, left, bottom, width, height, renderer) {
    /*
     */
    // Use renderer size instead of container size, because the pixel ratio is taken into account
    const size = renderer.getSize(new THREE.Vector2());

    var nleft = Math.floor(size.width * left);
    var nbottom = Math.floor(size.height * bottom);
    var nwidth = Math.floor(size.width * width);
    var nheight = Math.floor(size.height * height);

    renderer.setViewport(nleft, nbottom, nwidth, nheight);
    renderer.setScissor(nleft, nbottom, nwidth, nheight);
    renderer.setScissorTest(false);
    renderer.render(scene, camera);
  }

  render() {
    this.renderers["MainRenderer"].renderer.clear();
    // loop through renderers to render the scene
    this.renderers["LabelRenderer"].renderer.render(this.scene, this.camera);
    this.renderSceneInfo(this.scene, this.camera, this.sceneView.left, this.sceneView.bottom, this.sceneView.width, this.sceneView.height, this.renderers["MainRenderer"].renderer);
    this.coordCamera.position.copy(this.camera.position);
    this.coordCamera.position.sub(this.controls.target);
    this.coordCamera.lookAt(this.coordScene.position);
    this.renderSceneInfo(
      this.coordScene,
      this.coordCamera,
      this.coordSceneView.left,
      this.coordSceneView.bottom,
      this.coordSceneView.width,
      this.coordSceneView.height,
      this.renderers["MainRenderer"].renderer,
    );
    // this.legendCamera.position.copy(this.camera.position);
    this.renderSceneInfo(
      this.legendScene,
      this.legendCamera,
      this.legendSceneView.left,
      this.legendSceneView.bottom,
      this.legendSceneView.width,
      this.legendSceneView.height,
      this.renderers["MainRenderer"].renderer,
    );
    // legend

    this.controls.update();
  }

  exportImage(resolution = 2) {
    // Render the scene first if not already rendering
    // increasing the resolution significantly can cause the browser's canvas
    // to exceed the maximum allowable texture size
    // I set max resolution to 3, which works on my laptop
    resolution = Math.min(resolution, 3);
    const renderer = this.renderers["MainRenderer"].renderer;
    const originalPixelRatio = renderer.getPixelRatio();
    const highResPixelRatio = resolution; // Or higher for more resolution

    // Set renderer to high resolution
    renderer.setPixelRatio(highResPixelRatio);

    // Render the scene for high-res output
    this.render();

    // Get the image data URL
    var imgData = renderer.domElement.toDataURL("image/png");

    // Reset the pixel ratio to its original value
    renderer.setPixelRatio(originalPixelRatio);
    this.render();
    return imgData;
  }

  downloadImage(filenmae = "atomistic-model.png") {
    // Create a link and set the URL as the href
    var imgData = this.exportImage();
    var link = document.createElement("a");
    link.href = imgData;
    link.download = filenmae;

    // Append the link to the document and trigger the download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

function calculateBoundingBox(box, direction) {
  // project bounding box in the direction to get the size
  let size = new THREE.Vector3();

  // Create vectors to hold the min and max points of the projected bounding box
  let minProjected = new THREE.Vector3(Infinity, Infinity, Infinity);
  let maxProjected = new THREE.Vector3(-Infinity, -Infinity, -Infinity);

  // Create a matrix that will align the camera's direction with the Z axis
  let alignCameraMatrix = new THREE.Matrix4();
  alignCameraMatrix.lookAt(direction, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0));

  // For each corner of the bounding box
  box.corners = [
    new THREE.Vector3(box.min.x, box.min.y, box.min.z),
    new THREE.Vector3(box.min.x, box.min.y, box.max.z),
    new THREE.Vector3(box.min.x, box.max.y, box.min.z),
    new THREE.Vector3(box.min.x, box.max.y, box.max.z),
    new THREE.Vector3(box.max.x, box.min.y, box.min.z),
    new THREE.Vector3(box.max.x, box.min.y, box.max.z),
    new THREE.Vector3(box.max.x, box.max.y, box.min.z),
    new THREE.Vector3(box.max.x, box.max.y, box.max.z),
  ];

  box.corners.forEach((corner) => {
    // Transform the corner to align with the camera's perspective
    let projectedCorner = corner.clone().applyMatrix4(alignCameraMatrix);

    // Update the min and max projected points
    minProjected.x = Math.min(minProjected.x, projectedCorner.x);
    minProjected.y = Math.min(minProjected.y, projectedCorner.y);
    maxProjected.x = Math.max(maxProjected.x, projectedCorner.x);
    maxProjected.y = Math.max(maxProjected.y, projectedCorner.y);
    minProjected.z = Math.min(minProjected.z, projectedCorner.z);
    maxProjected.z = Math.max(maxProjected.z, projectedCorner.z);
  });

  size.x = maxProjected.x - minProjected.x;
  size.y = maxProjected.y - minProjected.y;
  size.z = maxProjected.z - minProjected.z;
  return size;
}

function getContainerDimensions(element, defaultWidth = 600, defaultHeight = 400) {
  // Get the default width and height if the container is not yet rendered.
  const computedStyle = getComputedStyle(element);
  const width = element.clientWidth || parseInt(computedStyle.width, 10) || defaultWidth;
  const height = element.clientHeight || parseInt(computedStyle.height, 10) || defaultHeight;
  return { width, height };
}
