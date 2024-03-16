/*
mode:
- "translate": translate selected
- "rotate": rotate selected
- "scale": scale selected

*/
import { getWorldPositionFromScreen } from "../utils.js";
import { TranslateOperation, RotateOperation, ScaleOperation } from "../operation/transform.js";
import * as THREE from "three";

export class TransformControls {
  constructor(weas, eventHandler) {
    this.weas = weas;
    this.eventHandler = eventHandler;
    this.tjs = weas.tjs;
    this.objectMode = "edit"; // "edit" or "object"
    this.mode = null;
    this.init();
  }

  init() {
    this.translatePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    this.translateVector = new THREE.Vector3();
    this.rotationMatrix = new THREE.Matrix4();
    this.centroid = new THREE.Vector3();
    this.centroidNDC = new THREE.Vector2();
    this.initialAtomPositions = new Map(); // To store initial positions of selected atoms
    this.initialObjectState = new Map(); // To store initial state of selected objects
    this.viewerRect = this.tjs.containerElement.getBoundingClientRect();
    // Get the camera's forward direction (negative z-axis in world space)
    this.cameraDirection = new THREE.Vector3(0, 0, -1);
  }

  attach(object) {
    this.controls.attach(object);
  }

  detach() {
    this.controls.detach();
  }

  enterMode(mode, mousePosition) {
    this.mode = mode;
    console.log("Enter mode: ", this.mode);
    this.cameraDirection.applyQuaternion(this.tjs.camera.quaternion);
    if (this.mode === "translate") {
      // Get the camera's forward direction (negative z-axis in world space)
      // Update the plane's normal
      this.translatePlane.normal.copy(this.cameraDirection);
    } else if (this.mode === "rotate") {
      this.getCentroidNDC();
    } else if (this.mode === "scale") {
      this.getCentroidNDC();
    }
    this.initialMousePosition = mousePosition.clone();
    this.storeInitialObjectState();
  }

  onMouseMove(event) {
    if (this.mode === "translate") {
      this.translateSelectedObjects(event);
    } else if (this.mode === "rotate") {
      this.rotateSelectedObjects(event);
    } else if (this.mode === "scale") {
      this.scaleSelectedObjects(event);
    } else {
      console.log("Invalid mode");
    }
  }

  confirmOperation() {
    // Handle mouse click to confirm the operation and exit the current transform mode.
    // Create a translate operation
    if (this.mode === "translate") {
      const translateVector = this.getTranslateVector(this.eventHandler.currentMousePosition, this.initialMousePosition);
      console.log("Translate vector: ", translateVector);
      const translateOperation = new TranslateOperation(this.weas, translateVector);
      this.weas.ops.execute(translateOperation, false);
    } else if (this.mode === "rotate") {
      const rotationAngle = this.getRotationAngle(this.eventHandler.currentMousePosition, this.initialMousePosition);
      const rotateOperation = new RotateOperation(this.weas, this.cameraDirection, rotationAngle);
      this.weas.ops.execute(rotateOperation, false);
    } else if (this.mode === "scale") {
      const scaleVector = this.getScaleVector(this.eventHandler.currentMousePosition, this.initialMousePosition);
      console.log("Scale vector: ", scaleVector);
      const scaleOperation = new ScaleOperation(this.weas, scaleVector);
      this.weas.ops.execute(scaleOperation, false);
    } else {
      console.log("Invalid mode");
    }
    // console.log("confirm and exit transform mode");
    this.mode = null;
    this.initialAtomPositions.clear();
    // TODO: This is a temporary solution to fix the issue of intersection not working after moving atoms
    // after moving the atoms, the intersection does not work anymore
    // redraw the model to make it work
    // this is a temporary solution
    // it can also update the bonds, etc
    if (this.weas.avr.selectedAtomsIndices.length > 0) {
      this.weas.avr.drawModels();
      // set selectedAtomsIndicesto tiger to update selected atoms label
      this.weas.avr.selectedAtomsIndices = this.weas.avr.selectedAtomsIndices;
    }
  }

  exitMode() {
    if (!this.mode) {
      return;
    }
    const mode = this.mode;
    this.mode = null;
    console.log("Exit mode: ", mode);
    this.weas.avr.resetSelectedAtomsPositions(this.initialAtomPositions);
    this.weas.ops.hideGUI();
    // reset the selected objects positions, scales, and rotations
    this.weas.selectionManager.selectedObjects.forEach((object) => {
      const initialObjectState = this.initialObjectState.get(object.uuid);
      object.position.copy(initialObjectState.position);
      object.scale.copy(initialObjectState.scale);
      object.rotation.copy(initialObjectState.rotation);
    });
  }

  getCentroidNDC() {
    this.centroid = new THREE.Vector3(0, 0, 0);
    if (this.weas.avr.selectedAtomsIndices.length > 0) {
      // Calculate the centroid of the selected atoms
      this.weas.avr.selectedAtomsIndices.forEach((atomIndex) => {
        this.centroid.add(new THREE.Vector3(...this.weas.avr.atoms.positions[atomIndex]));
      });
      this.centroid.divideScalar(this.weas.avr.selectedAtomsIndices.length);
    } else if (this.weas.selectionManager.selectedObjects.length > 0) {
      // Calculate the centroid of the selected objects
      this.weas.selectionManager.selectedObjects.forEach((object) => {
        this.centroid.add(object.position);
      });
      this.centroid.divideScalar(this.weas.selectionManager.selectedObjects.length);
    } else {
      console.log("No selected atoms or objects");
      this.mode = null;
      return;
    }
    // Project the centroid to 2D screen space
    const centroidScreen = this.centroid.clone().project(this.tjs.camera);

    // Calculate normalized device coordinates of centroid, initial, and new mouse positions
    this.centroidNDC = new THREE.Vector2(centroidScreen.x, centroidScreen.y);
  }

  storeInitialObjectState() {
    // Store the initial positions of the selected atoms
    this.weas.avr.selectedAtomsIndices.forEach((atomIndex) => {
      const matrix = new THREE.Matrix4();
      this.weas.avr.atomsMesh.getMatrixAt(atomIndex, matrix);
      const position = new THREE.Vector3();
      matrix.decompose(position, new THREE.Quaternion(), new THREE.Vector3());
      this.initialAtomPositions.set(atomIndex, position.clone());
    });
    // Store the initial positions, scales, and rotations of the selected objects
    this.weas.selectionManager.selectedObjects.forEach((object) => {
      this.initialObjectState.set(object.uuid, {
        position: object.position.clone(),
        scale: object.scale.clone(),
        rotation: object.rotation.clone(),
      });
    });
  }

  translateSelectedObjects(event) {
    const translateVector = this.getTranslateVector(this.eventHandler.currentMousePosition, this.eventHandler.previousMousePosition);
    // Apply translateVector to atoms
    this.weas.avr.translateSelectedAtoms(translateVector);
    // Apply translateVector to objects
    this.weas.objectManager.translateSelectedObjects(translateVector);
  }

  getTranslateVector(currentMousePosition, previousMousePosition) {
    const currentWorldPosition = getWorldPositionFromScreen(currentMousePosition.x, currentMousePosition.y, this.tjs.camera, this.translatePlane);
    const previousWorldPosition = getWorldPositionFromScreen(previousMousePosition.x, previousMousePosition.y, this.tjs.camera, this.translatePlane);
    return currentWorldPosition.sub(previousWorldPosition);
  }

  rotateSelectedObjects(event) {
    const rotationAngle = this.getRotationAngle(this.eventHandler.currentMousePosition, this.eventHandler.previousMousePosition);
    const minRotationAngle = 0.0001;
    if (Math.abs(rotationAngle) > minRotationAngle) {
      // atoms
      this.weas.avr.rotateSelectedAtoms(this.cameraDirection, rotationAngle);
      // objects
      this.weas.objectManager.rotateSelectedObjects(this.cameraDirection, rotationAngle);
    }
  }

  scaleSelectedObjects(event) {
    const scaleVector = this.getScaleVector(this.eventHandler.currentMousePosition, this.eventHandler.previousMousePosition);
    if (scaleVector) {
      this.weas.objectManager.scaleSelectedObjects(scaleVector);
    }
  }

  getScaleVector(currentMousePosition, previousMousePosition) {
    const initialNDC = new THREE.Vector2(
      ((previousMousePosition.x - this.viewerRect.left) / this.viewerRect.width) * 2 - 1,
      -((previousMousePosition.y - this.viewerRect.top) / this.viewerRect.height) * 2 + 1,
    );

    const newNDC = new THREE.Vector2(
      ((currentMousePosition.x - this.viewerRect.left) / this.viewerRect.width) * 2 - 1,
      -((currentMousePosition.y - this.viewerRect.top) / this.viewerRect.height) * 2 + 1,
    );
    if (initialNDC.equals(newNDC)) {
      return; // Skip further processing
    }
    // Calculate vectors from centroidNDC to initialNDC and newNDC
    const vectorToInitial = new THREE.Vector2().subVectors(initialNDC, this.centroidNDC);
    const vectorToNew = new THREE.Vector2().subVectors(newNDC, this.centroidNDC);
    // Calculate the angle between the vectors
    let scale = vectorToNew.length() / vectorToInitial.length();
    return new THREE.Vector3(scale, scale, scale);
  }

  getRotationAngle(currentMousePosition, previousMousePosition) {
    const initialNDC = new THREE.Vector2(
      ((previousMousePosition.x - this.viewerRect.left) / this.viewerRect.width) * 2 - 1,
      -((previousMousePosition.y - this.viewerRect.top) / this.viewerRect.height) * 2 + 1,
    );

    const newNDC = new THREE.Vector2(
      ((currentMousePosition.x - this.viewerRect.left) / this.viewerRect.width) * 2 - 1,
      -((currentMousePosition.y - this.viewerRect.top) / this.viewerRect.height) * 2 + 1,
    );
    if (initialNDC.equals(newNDC)) {
      console.log("No mouse movement detected, skipping rotation.");
      return; // Skip further processing
    }
    // Calculate vectors from centroidNDC to initialNDC and newNDC
    const vectorToInitial = new THREE.Vector2().subVectors(initialNDC, this.centroidNDC);
    const vectorToNew = new THREE.Vector2().subVectors(newNDC, this.centroidNDC);
    // Normalize the vectors
    vectorToInitial.normalize();
    vectorToNew.normalize();
    // Calculate the angle between the vectors
    let rotationAngle = Math.acos(vectorToInitial.dot(vectorToNew));

    // Determine the direction of rotation (clockwise or counterclockwise)
    // Use the cross product (in 2D space, this is essentially the z-component of the cross product)
    const crossProductZ = vectorToInitial.x * vectorToNew.y - vectorToInitial.y * vectorToNew.x;
    if (crossProductZ < 0) {
      rotationAngle = -rotationAngle; // Rotate in the opposite direction
    }
    // radians to degrees
    rotationAngle = THREE.MathUtils.radToDeg(rotationAngle);
    // Create a rotation matrix around the camera direction
    return rotationAngle;
  }
}
