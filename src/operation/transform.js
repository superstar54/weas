import { BaseOperation } from "./baseOperation.js";
import * as THREE from "three";

class TranslateOperation extends BaseOperation {
  static description = "Translate";
  static category = "Edit";
  static ui = {
    title: "Translate",
    fields: {
      x: { type: "number", min: -10, max: 10, step: 0.1, path: "vector.x" },
      y: { type: "number", min: -10, max: 10, step: 0.1, path: "vector.y" },
      z: { type: "number", min: -10, max: 10, step: 0.1, path: "vector.z" },
    },
  };

  constructor({ weas, vector = new THREE.Vector3() }) {
    super(weas);
    // currentFrame
    this.currentFrame = weas.avr.currentFrame;
    // store the selected atoms and the translate vector
    this.selectedAtomsIndices = Array.from(this.stateGet("viewer.selectedAtomsIndices", []) || []);
    this.selectedObjects = weas.selectionManager.selectedObjects;
    // if vector is a normal array [x, y, z], convert it to a THREE.Vector3
    if (Array.isArray(vector)) {
      vector = new THREE.Vector3(vector[0], vector[1], vector[2]);
    }
    this.vector = vector.clone();
  }

  execute() {
    this.weas.avr.currentFrame = this.currentFrame;
    this.weas.selectionManager.selectedObjects = this.selectedObjects;
    this.weas.avr.translateSelectedAtoms({ translateVector: this.vector, indices: this.selectedAtomsIndices });
    this.weas.objectManager.translateSelectedObjects({ translateVector: this.vector });
    this.weas.selectionManager.refreshAxisLine();
  }

  undo() {
    this.weas.avr.currentFrame = this.currentFrame;
    // negative vector
    const negativevector = this.vector.clone().negate();
    this.weas.avr.translateSelectedAtoms({ translateVector: negativevector, indices: this.selectedAtomsIndices });
    this.weas.selectionManager.selectedObjects = this.selectedObjects;
    this.weas.objectManager.translateSelectedObjects({ translateVector: negativevector });
    this.weas.selectionManager.refreshAxisLine();
  }

  adjust(params) {
    this.adjustWithReset(params, () => {
      this.undo();
    });
  }
}

class RotateOperation extends BaseOperation {
  static description = "Rotate";
  static category = "Edit";
  static ui = {
    title: "Rotate",
    fields: {
      angle: { type: "number", min: -360, max: 360, step: 1, path: "angle" },
      x: { type: "number", min: -1, max: 1, step: 0.01, path: "axis.x" },
      y: { type: "number", min: -1, max: 1, step: 0.01, path: "axis.y" },
      z: { type: "number", min: -1, max: 1, step: 0.01, path: "axis.z" },
    },
  };

  constructor({ weas, axis, angle, centroid = null }) {
    super(weas);
    this.currentFrame = weas.avr.currentFrame;
    this.selectedAtomsIndices = Array.from(this.stateGet("viewer.selectedAtomsIndices", []) || []);
    this.selectedObjects = weas.selectionManager.selectedObjects;
    if (Array.isArray(axis)) {
      axis = new THREE.Vector3(axis[0], axis[1], axis[2]);
    }
    this.axis = axis;
    this.angle = angle;
    this.centroid = centroid;
  }

  execute() {
    // Implementation for rotating selected atoms
    this.weas.avr.currentFrame = this.currentFrame;
    this.weas.selectionManager.selectedObjects = this.selectedObjects;
    this.weas.avr.rotateSelectedAtoms({ cameraDirection: this.axis, rotationAngle: this.angle, indices: this.selectedAtomsIndices, centroid: this.centroid });
    this.weas.objectManager.rotateSelectedObjects({ rotationAxis: this.axis, rotationAngle: this.angle });
    this.weas.selectionManager.refreshAxisLine();
  }

  undo() {
    // Undo logic
    this.weas.avr.currentFrame = this.currentFrame;
    this.weas.selectionManager.selectedObjects = this.selectedObjects;
    // rotate the atoms back
    this.weas.avr.rotateSelectedAtoms({ cameraDirection: this.axis, rotationAngle: -this.angle, indices: this.selectedAtomsIndices, centroid: this.centroid });
    // rotate the objects back
    this.weas.objectManager.rotateSelectedObjects({ rotationAxis: this.axis, rotationAngle: -this.angle });
    this.weas.selectionManager.refreshAxisLine();
  }

  adjust(params) {
    this.adjustWithReset(params, () => {
      this.undo();
    });
  }
}

class ScaleOperation extends BaseOperation {
  static description = "Scale";
  static category = "Edit";
  static ui = {
    title: "Scale",
    fields: {
      x: { type: "number", min: 0.001, max: 10, step: 0.01, path: "scale.x" },
      y: { type: "number", min: 0.001, max: 10, step: 0.01, path: "scale.y" },
      z: { type: "number", min: 0.001, max: 10, step: 0.01, path: "scale.z" },
    },
  };

  constructor({ weas, scale = new THREE.Vector3() }) {
    super(weas);
    // currentFrame
    this.currentFrame = weas.avr.currentFrame;
    // store the selected atoms and the scale vector
    this.selectedAtomsIndices = Array.from(this.stateGet("viewer.selectedAtomsIndices", []) || []);
    this.selectedObjects = weas.selectionManager.selectedObjects;
    if (Array.isArray(scale)) {
      scale = new THREE.Vector3(scale[0], scale[1], scale[2]);
    }
    this.scale = scale.clone();
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

  adjust(params) {
    this.adjustWithReset(params, () => {
      this.undo();
    });
  }
}

export { TranslateOperation, RotateOperation, ScaleOperation };
