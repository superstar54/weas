import { BaseOperation, renameFolder } from "./baseOperation.js";
import * as THREE from "three";

class TranslateOperation extends BaseOperation {
  static description = "Translate";
  static category = "Edit";

  constructor(weas, translateVector = new THREE.Vector3()) {
    super(weas);
    // currentFrame
    this.currentFrame = weas.currentFrame;
    // store the selected atoms and the translate vector
    this.selectedAtomsIndices = Array.from(weas.avr.selectedAtomsIndices);
    this.selectedObjects = weas.selectedObjects;
    // if translateVector is a normal array [x, y, z], convert it to a THREE.Vector3
    if (Array.isArray(translateVector)) {
      translateVector = new THREE.Vector3(translateVector[0], translateVector[1], translateVector[2]);
    }
    this.translateVector = translateVector.clone();
    this.translateVectorGui = { x: translateVector.x, y: translateVector.y, z: translateVector.z };
  }

  execute() {
    console.log("execute translate");
    this.weas.currentFrame = this.currentFrame;
    this.weas.avr.translateSelectedAtoms(this.translateVector, this.selectedAtomsIndices);
    this.weas.objectManager.translateSelectedObjects(this.translateVector);
  }

  undo() {
    console.log("undo translate");
    this.weas.currentFrame = this.currentFrame;
    // negative translateVector
    const negativeTranslateVector = this.translateVector.clone().negate();
    this.weas.avr.translateSelectedAtoms(negativeTranslateVector, this.selectedAtomsIndices);
    this.weas.objectManager.translateSelectedObjects(negativeTranslateVector);
  }

  adjust() {
    this.undo();
    this.translateVector = new THREE.Vector3(this.translateVectorGui.x, this.translateVectorGui.y, this.translateVectorGui.z);
    this.execute(); // Re-execute with the new translate vector
  }

  setupGUI(guiFolder) {
    //
    renameFolder(guiFolder, "Translate");

    guiFolder
      .add(this.translateVectorGui, "x", -10, 10)
      .name("X-axis")
      .onChange((value) => {
        this.adjust();
      });
    guiFolder
      .add(this.translateVectorGui, "y", -10, 10)
      .name("Y-axis")
      .onChange((value) => {
        this.adjust();
      });
    guiFolder
      .add(this.translateVectorGui, "z", -10, 10)
      .name("Z-axis")
      .onChange((value) => {
        this.adjust();
      });
  }
}

class RotateOperation extends BaseOperation {
  static description = "Rotate";
  static category = "Edit";

  constructor(weas, axis, angle) {
    super(weas);
    this.currentFrame = weas.currentFrame;
    this.selectedAtomsIndices = Array.from(weas.avr.selectedAtomsIndices);
    this.selectedObjects = weas.selectedObjects;
    this.axis = axis;
    this.angle = angle;
    this.axisGui = { x: axis.x, y: axis.y, z: axis.z };
    this.angleGui = angle;
  }

  execute() {
    // Implementation for rotating selected atoms
    this.weas.currentFrame = this.currentFrame;
    this.weas.avr.rotateSelectedAtoms(this.axis, this.angle, this.selectedAtomsIndices);
    this.weas.objectManager.rotateSelectedObjects(this.axis, this.angle);
  }

  undo() {
    // Undo logic
    console.log("undo rotate");
    this.weas.currentFrame = this.currentFrame;
    // rotate the atoms back
    this.weas.avr.rotateSelectedAtoms(this.axis, -this.angle, this.selectedAtomsIndices);
    // rotate the objects back
    this.weas.objectManager.rotateSelectedObjects(this.axis, -this.angle);
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

  constructor(weas, scale = new THREE.Vector3()) {
    super(weas);
    // currentFrame
    this.currentFrame = weas.currentFrame;
    // store the selected atoms and the scale vector
    this.selectedAtomsIndices = Array.from(weas.avr.selectedAtomsIndices);
    this.selectedObjects = weas.selectedObjects;
    this.scale = scale.clone();
    this.scaleGui = { x: scale.x, y: scale.y, z: scale.z };
  }

  execute() {
    console.log("execute scale");
    this.weas.currentFrame = this.currentFrame;
    // this.weas.avr.scaleSelectedAtoms(this.scale, this.selectedAtomsIndices);
    this.weas.objectManager.scaleSelectedObjects(this.scale);
  }

  undo() {
    console.log("undo scale");
    this.weas.currentFrame = this.currentFrame;
    // scale back, by 1/scale
    const scale = new THREE.Vector3(1 / this.scale.x, 1 / this.scale.y, 1 / this.scale.z);
    // this.weas.avr.scaleSelectedAtoms(scale, this.selectedAtomsIndices);
    this.weas.objectManager.scaleSelectedObjects(scale);
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
