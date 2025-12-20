import { BaseOperation, renameFolder } from "./baseOperation.js";
import * as THREE from "three";

class TranslateOperation extends BaseOperation {
  static description = "Translate";
  static category = "Edit";

  constructor({ weas, vector = new THREE.Vector3() }) {
    super(weas);
    // currentFrame
    this.currentFrame = weas.avr.currentFrame;
    // store the selected atoms and the translate vector
    this.selectedAtomsIndices = Array.from(weas.avr.selectedAtomsIndices);
    this.selectedObjects = weas.selectionManager.selectedObjects;
    // if vector is a normal array [x, y, z], convert it to a THREE.Vector3
    if (Array.isArray(vector)) {
      vector = new THREE.Vector3(vector[0], vector[1], vector[2]);
    }
    this.vector = vector.clone();
    this.vectorGui = { x: vector.x, y: vector.y, z: vector.z };
  }

  execute() {
    this.weas.avr.currentFrame = this.currentFrame;
    this.weas.selectionManager.selectedObjects = this.selectedObjects;
    this.weas.avr.translateSelectedAtoms({ translateVector: this.vector, indices: this.selectedAtomsIndices });
    this.weas.objectManager.translateSelectedObjects({ translateVector: this.vector });
  }

  undo() {
    this.weas.avr.currentFrame = this.currentFrame;
    // negative vector
    const negativevector = this.vector.clone().negate();
    this.weas.avr.translateSelectedAtoms({ translateVector: negativevector, indices: this.selectedAtomsIndices });
    this.weas.selectionManager.selectedObjects = this.selectedObjects;
    this.weas.objectManager.translateSelectedObjects({ translateVector: negativevector });
  }

  adjust() {
    this.undo();
    this.vector = new THREE.Vector3(this.vectorGui.x, this.vectorGui.y, this.vectorGui.z);
    this.execute(); // Re-execute with the new translate vector
  }

  setupGUI(guiFolder) {
    //
    renameFolder(guiFolder, "Translate");

    guiFolder
      .add(this.vectorGui, "x", -10, 10)
      .name("X-axis")
      .onChange((value) => {
        this.adjust();
      });
    guiFolder
      .add(this.vectorGui, "y", -10, 10)
      .name("Y-axis")
      .onChange((value) => {
        this.adjust();
      });
    guiFolder
      .add(this.vectorGui, "z", -10, 10)
      .name("Z-axis")
      .onChange((value) => {
        this.adjust();
      });
  }
}

class RotateOperation extends BaseOperation {
  static description = "Rotate";
  static category = "Edit";

  constructor({ weas, axis, angle }) {
    super(weas);
    this.currentFrame = weas.avr.currentFrame;
    this.selectedAtomsIndices = Array.from(weas.avr.selectedAtomsIndices);
    this.selectedObjects = weas.selectionManager.selectedObjects;
    if (Array.isArray(axis)) {
      axis = new THREE.Vector3(axis[0], axis[1], axis[2]);
    }
    this.axis = axis;
    this.angle = angle;
    this.axisGui = { x: axis.x, y: axis.y, z: axis.z };
    this.angleGui = angle;
  }

  execute() {
    // Implementation for rotating selected atoms
    this.weas.avr.currentFrame = this.currentFrame;
    this.weas.selectionManager.selectedObjects = this.selectedObjects;
    this.weas.avr.rotateSelectedAtoms({ cameraDirection: this.axis, rotationAngle: this.angle, indices: this.selectedAtomsIndices });
    this.weas.objectManager.rotateSelectedObjects({ rotationAxis: this.axis, rotationAngle: this.angle });
  }

  undo() {
    // Undo logic
    this.weas.avr.currentFrame = this.currentFrame;
    this.weas.selectionManager.selectedObjects = this.selectedObjects;
    // rotate the atoms back
    this.weas.avr.rotateSelectedAtoms({ cameraDirection: this.axis, rotationAngle: -this.angle, indices: this.selectedAtomsIndices });
    // rotate the objects back
    this.weas.objectManager.rotateSelectedObjects({ rotationAxis: this.axis, rotationAngle: -this.angle });
  }

  adjust() {
    // Adjust angle and update rotation
    this.undo();
    this.axis = new THREE.Vector3(this.axisGui.x, this.axisGui.y, this.axisGui.z);
    this.angle = this.angleGui;
    this.execute();
  }

  setupGUI(guiFolder) {
    renameFolder(guiFolder, "Rotate");
    // GUI for rotation angle
    guiFolder
      .add(this, "angleGui", -360, 360)
      .name("Angle")
      .onChange(() => {
        this.adjust();
      });
    // GUI for rotation axis
    guiFolder
      .add(this.axisGui, "x", -1, 1)
      .name("X-axis")
      .onChange(() => {
        this.adjust();
      });
    guiFolder
      .add(this.axisGui, "y", -1, 1)
      .name("Y-axis")
      .onChange(() => {
        this.adjust();
      });
    guiFolder
      .add(this.axisGui, "z", -1, 1)
      .name("Z-axis")
      .onChange(() => {
        this.adjust();
      });
  }
}

class ScaleOperation extends BaseOperation {
  static description = "Scale";
  static category = "Edit";

  constructor({ weas, scale = new THREE.Vector3() }) {
    super(weas);
    // currentFrame
    this.currentFrame = weas.avr.currentFrame;
    // store the selected atoms and the scale vector
    this.selectedAtomsIndices = Array.from(weas.avr.selectedAtomsIndices);
    this.selectedObjects = weas.selectionManager.selectedObjects;
    if (Array.isArray(scale)) {
      scale = new THREE.Vector3(scale[0], scale[1], scale[2]);
    }
    this.scale = scale.clone();
    this.scaleGui = { x: scale.x, y: scale.y, z: scale.z };
  }

  execute() {
    this.weas.avr.currentFrame = this.currentFrame;
    this.weas.selectionManager.selectedObjects = this.selectedObjects;
    // this.weas.avr.scaleSelectedAtoms(this.scale, this.selectedAtomsIndices);
    this.weas.objectManager.scaleSelectedObjects({ scale: this.scale });
  }

  undo() {
    this.weas.avr.currentFrame = this.currentFrame;
    this.weas.selectionManager.selectedObjects = this.selectedObjects;
    // scale back, by 1/scale
    const scale = new THREE.Vector3(1 / this.scale.x, 1 / this.scale.y, 1 / this.scale.z);
    // this.weas.avr.scaleSelectedAtoms(scale, this.selectedAtomsIndices);
    this.weas.objectManager.scaleSelectedObjects({ scale });
  }

  adjust() {
    this.undo();
    this.scale = new THREE.Vector3(this.scaleGui.x, this.scaleGui.y, this.scaleGui.z);
    this.execute(); // Re-execute with the new scale vector
  }

  setupGUI(guiFolder) {
    //
    renameFolder(guiFolder, "Scale");

    guiFolder
      .add(this.scaleGui, "x", 0.001, 10)
      .name("X-axis")
      .onChange((value) => {
        this.adjust();
      });
    guiFolder
      .add(this.scaleGui, "y", 0.001, 10)
      .name("Y-axis")
      .onChange((value) => {
        this.adjust();
      });
    guiFolder
      .add(this.scaleGui, "z", 0.001, 10)
      .name("Z-axis")
      .onChange((value) => {
        this.adjust();
      });
  }
}

export { TranslateOperation, RotateOperation, ScaleOperation };
