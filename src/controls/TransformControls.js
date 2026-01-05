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
    this.translateAxisLock = null;
    this.translateAxis = new THREE.Vector3();
    this.rotationAxisLock = null;
    this.rotationAxis = new THREE.Vector3();
    this.rotationAxisLockKey = null;
    this.rotationMatrix = new THREE.Matrix4();
    this.centroid = new THREE.Vector3();
    this.centroidNDC = new THREE.Vector2();
    this.rotationAxis = new THREE.Vector3();
    this.rotationCentroid = new THREE.Vector3();
    this.initialAtomPositions = new Map(); // To store initial positions of selected atoms
    this.initialObjectState = new Map(); // To store initial state of selected objects
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
    if (this.weas.avr.selectedAtomsIndices.length === 0 && this.weas.selectionManager.selectedObjects.length === 0) {
      this.mode = null;
      this.weas.selectionManager.hideAxisVisuals();
      this.weas.selectionManager.setModeHint("Select atoms (or objects) first");
      return;
    }
    this.cameraDirection = new THREE.Vector3(0, 0, -1);
    this.cameraDirection.applyQuaternion(this.tjs.camera.quaternion);
    if (this.mode === "translate") {
      // Get the camera's forward direction (negative z-axis in world space)
      // Update the plane's normal
      this.translatePlane.normal.copy(this.cameraDirection);
      this.translateAxisLock = null;
      this.weas.selectionManager.hideTranslateAxisLine();
      this.weas.selectionManager.setModeHint("Translate mode: move mouse to translate, press X/Y/Z to lock");
    } else if (this.mode === "rotate") {
      this.weas.selectionManager.showAxisVisuals();
      this.rotationAxisLock = null;
      this.rotationAxisLockKey = null;
      this.weas.selectionManager.hideRotateAxisLine();
      this.refreshRotationPivot();
      if (!this.mode) {
        this.weas.selectionManager.hideAxisVisuals();
        this.weas.selectionManager.setModeHint("");
        return;
      }
      this.weas.selectionManager.setModeHint("Rotate mode: move mouse to rotate, press A to set axis, X/Y/Z to lock");
    } else if (this.mode === "scale") {
      this.getCentroidNDC();
      this.weas.selectionManager.setModeHint("Scale mode: move mouse to scale, click to confirm");
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
    }
  }

  confirmOperation() {
    // Handle mouse click to confirm the operation and exit the current transform mode.
    // Create a translate operation
    const mode = this.mode;
    if (this.mode === "translate") {
      const translateVector = this.getTranslateVector(this.eventHandler.currentMousePosition, this.initialMousePosition);
      const translateOperation = new TranslateOperation({ weas: this.weas, vector: translateVector });
      this.weas.ops.execute(translateOperation, false);
    } else if (this.mode === "rotate") {
      const rotationAngle = this.getRotationAngle(this.eventHandler.currentMousePosition, this.initialMousePosition);
      const rotateOperation = new RotateOperation({ weas: this.weas, axis: this.rotationAxis, angle: rotationAngle, centroid: this.rotationCentroid });
      this.weas.ops.execute(rotateOperation, false);
    } else if (this.mode === "scale") {
      const scaleVector = this.getScaleVector(this.eventHandler.currentMousePosition, this.initialMousePosition);
      const scaleOperation = new ScaleOperation({ weas: this.weas, scale: scaleVector });
      this.weas.ops.execute(scaleOperation, false);
    } else {
    }
    this.mode = null;
    if (mode === "rotate") {
      this.weas.selectionManager.hideAxisVisuals();
      this.weas.selectionManager.stopAxisPicking();
      this.weas.selectionManager.hideRotateAxisLine();
      this.rotationAxisLock = null;
      this.rotationAxisLockKey = null;
    }
    if (mode === "translate") {
      this.weas.selectionManager.hideTranslateAxisLine();
      this.translateAxisLock = null;
    }
    this.weas.selectionManager.setModeHint("");
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
    this.weas.avr.resetSelectedAtomsPositions({ initialAtomPositions: this.initialAtomPositions });
    this.weas.ops.hideGUI();
    if (mode === "rotate") {
      this.weas.selectionManager.hideAxisVisuals();
      this.weas.selectionManager.stopAxisPicking();
      this.weas.selectionManager.hideRotateAxisLine();
      this.rotationAxisLock = null;
      this.rotationAxisLockKey = null;
    }
    if (mode === "translate") {
      this.weas.selectionManager.hideTranslateAxisLine();
      this.translateAxisLock = null;
    }
    this.weas.selectionManager.setModeHint("");
    // reset the selected objects positions, scales, and rotations
    this.weas.selectionManager.selectedObjects.forEach((object) => {
      const initialObjectState = this.initialObjectState.get(object.uuid);
      object.position.copy(initialObjectState.position);
      object.scale.copy(initialObjectState.scale);
      object.rotation.copy(initialObjectState.rotation);
    });
  }

  getCentroidNDC(centroid = null) {
    if (this.weas.avr.selectedAtomsIndices.length > 0) {
      // Calculate the centroid of the selected atoms
      if (!centroid) {
        centroid = new THREE.Vector3(0, 0, 0);
        this.weas.avr.selectedAtomsIndices.forEach((atomIndex) => {
          centroid.add(new THREE.Vector3(...this.weas.avr.atoms.positions[atomIndex]));
        });
        centroid.divideScalar(this.weas.avr.selectedAtomsIndices.length);
      }
    } else if (this.weas.selectionManager.selectedObjects.length > 0) {
      // Calculate the centroid of the selected objects
      if (!centroid) {
        centroid = new THREE.Vector3(0, 0, 0);
        this.weas.selectionManager.selectedObjects.forEach((object) => {
          centroid.add(object.position);
        });
        centroid.divideScalar(this.weas.selectionManager.selectedObjects.length);
      }
    } else {
      this.mode = null;
      return;
    }
    // Project the centroid to 2D screen space
    const centroidScreen = centroid.clone().project(this.tjs.camera);

    // Calculate normalized device coordinates of centroid, initial, and new mouse positions
    this.centroidNDC = new THREE.Vector2(centroidScreen.x, centroidScreen.y);
  }

  refreshRotationPivot() {
    this.updateRotationReference();
    this.getCentroidNDC(this.rotationCentroid);
  }

  updateRotationReference() {
    this.rotationAxis.copy(this.cameraDirection);
    this.rotationCentroid.set(0, 0, 0);
    if (this.rotationAxisLock) {
      this.rotationAxis.copy(this.rotationAxisLock);
      const pivot = this.getSelectionCentroid();
      this.rotationCentroid.copy(pivot);
      return;
    }
    const axisAtoms = this.weas.selectionManager.axisAtomIndices || [];
    const selectedAtoms = this.weas.avr.selectedAtomsIndices;
    if (axisAtoms.length === 2) {
      const first = new THREE.Vector3(...this.weas.avr.atoms.positions[axisAtoms[0]]);
      const second = new THREE.Vector3(...this.weas.avr.atoms.positions[axisAtoms[1]]);
      const axis = second.clone().sub(first);
      if (axis.lengthSq() > 0) {
        this.rotationAxis.copy(axis.normalize());
        this.rotationCentroid.copy(first.clone().add(second).multiplyScalar(0.5));
        return;
      }
    } else if (axisAtoms.length === 1) {
      this.rotationCentroid.copy(new THREE.Vector3(...this.weas.avr.atoms.positions[axisAtoms[0]]));
      return;
    }
    if (selectedAtoms.length > 0) {
      selectedAtoms.forEach((atomIndex) => {
        this.rotationCentroid.add(new THREE.Vector3(...this.weas.avr.atoms.positions[atomIndex]));
      });
      this.rotationCentroid.divideScalar(selectedAtoms.length);
    } else if (this.weas.selectionManager.selectedObjects.length > 0) {
      this.weas.selectionManager.selectedObjects.forEach((object) => {
        this.rotationCentroid.add(object.position);
      });
      this.rotationCentroid.divideScalar(this.weas.selectionManager.selectedObjects.length);
    }
  }

  storeInitialObjectState() {
    // Store the initial positions of the selected atoms
    this.weas.avr.selectedAtomsIndices.forEach((atomIndex) => {
      const matrix = new THREE.Matrix4();
      this.weas.avr.atomManager.meshes["atom"].getMatrixAt(atomIndex, matrix);
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
    this.weas.avr.translateSelectedAtoms({ translateVector });
    // Apply translateVector to objects
    this.weas.objectManager.translateSelectedObjects({ translateVector });
    this.weas.selectionManager.refreshAxisLine();
  }

  getNDC(mousePosition) {
    return new THREE.Vector2(((mousePosition.x - this.tjs.viewerRect.left) / this.tjs.viewerRect.width) * 2 - 1, -((mousePosition.y - this.tjs.viewerRect.top) / this.tjs.viewerRect.height) * 2 + 1);
  }

  getTranslateVector(currentMousePosition, previousMousePosition) {
    const newNDC = this.getNDC(currentMousePosition);
    const currentWorldPosition = getWorldPositionFromScreen(this.tjs.camera, newNDC, this.translatePlane);
    const initialNDC = this.getNDC(previousMousePosition);
    const previousWorldPosition = getWorldPositionFromScreen(this.tjs.camera, initialNDC, this.translatePlane);
    const delta = currentWorldPosition.sub(previousWorldPosition);
    if (!this.translateAxisLock) {
      return delta;
    }
    const projected = this.translateAxis.clone().multiplyScalar(delta.dot(this.translateAxis));
    return projected;
  }

  rotateSelectedObjects(event) {
    const rotationAngle = this.getRotationAngle(this.eventHandler.currentMousePosition, this.eventHandler.previousMousePosition);
    const minRotationAngle = 0.0001;
    if (Math.abs(rotationAngle) > minRotationAngle) {
      // atoms
      this.weas.avr.rotateSelectedAtoms({ cameraDirection: this.rotationAxis, rotationAngle, centroid: this.rotationCentroid });
      // objects
      this.weas.objectManager.rotateSelectedObjects({ rotationAxis: this.rotationAxis, rotationAngle });
      this.weas.selectionManager.refreshAxisLine();
    }
  }

  scaleSelectedObjects(event) {
    const scaleVector = this.getScaleVector(this.eventHandler.currentMousePosition, this.eventHandler.previousMousePosition);
    if (scaleVector) {
      this.weas.objectManager.scaleSelectedObjects({ scale: scaleVector });
      this.weas.selectionManager.refreshAxisLine();
    }
  }

  setTranslateAxisLock(axisKey) {
    if (!axisKey) {
      this.translateAxisLock = null;
      this.weas.selectionManager.hideTranslateAxisLine();
      this.weas.selectionManager.setModeHint("Translate mode: move mouse to translate, press X/Y/Z to lock");
      return;
    }
    this.translateAxisLock = axisKey;
    if (axisKey === "x") {
      this.translateAxis.set(1, 0, 0);
    } else if (axisKey === "y") {
      this.translateAxis.set(0, 1, 0);
    } else {
      this.translateAxis.set(0, 0, 1);
    }
    const centroid = this.getSelectionCentroid();
    this.weas.selectionManager.showTranslateAxisLine(centroid, this.translateAxis);
    this.weas.selectionManager.setModeHint(`Translate mode: locked to ${axisKey.toUpperCase()} axis`);
  }

  setRotateAxisLock(axisKey) {
    if (!axisKey) {
      this.rotationAxisLock = null;
      this.rotationAxisLockKey = null;
      this.weas.selectionManager.hideRotateAxisLine();
      this.weas.selectionManager.setModeHint("Rotate mode: move mouse to rotate, press A to set axis, X/Y/Z to lock");
      this.refreshRotationPivot();
      if (this.eventHandler?.currentMousePosition) {
        this.initialMousePosition = this.eventHandler.currentMousePosition.clone();
      }
      return;
    }
    this.rotationAxisLockKey = axisKey;
    if (axisKey === "x") {
      this.rotationAxisLock = new THREE.Vector3(1, 0, 0);
    } else if (axisKey === "y") {
      this.rotationAxisLock = new THREE.Vector3(0, 1, 0);
    } else {
      this.rotationAxisLock = new THREE.Vector3(0, 0, 1);
    }
    const centroid = this.getSelectionCentroid();
    this.weas.selectionManager.showRotateAxisLine(centroid, this.rotationAxisLock);
    this.weas.selectionManager.setModeHint(`Rotate mode: locked to ${axisKey.toUpperCase()} axis`);
    this.refreshRotationPivot();
    if (this.eventHandler?.currentMousePosition) {
      this.initialMousePosition = this.eventHandler.currentMousePosition.clone();
    }
  }

  getSelectionCentroid() {
    const centroid = new THREE.Vector3(0, 0, 0);
    if (this.weas.avr.selectedAtomsIndices.length > 0) {
      this.weas.avr.selectedAtomsIndices.forEach((atomIndex) => {
        centroid.add(new THREE.Vector3(...this.weas.avr.atoms.positions[atomIndex]));
      });
      centroid.divideScalar(this.weas.avr.selectedAtomsIndices.length);
      return centroid;
    }
    if (this.weas.selectionManager.selectedObjects.length > 0) {
      this.weas.selectionManager.selectedObjects.forEach((object) => {
        centroid.add(object.position);
      });
      centroid.divideScalar(this.weas.selectionManager.selectedObjects.length);
    }
    return centroid;
  }

  getScaleVector(currentMousePosition, previousMousePosition) {
    const initialNDC = this.getNDC(previousMousePosition);
    const newNDC = this.getNDC(currentMousePosition);
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
    const initialNDC = this.getNDC(previousMousePosition);
    const newNDC = this.getNDC(currentMousePosition);
    if (initialNDC.equals(newNDC)) {
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
