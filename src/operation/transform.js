import { BaseOperation } from "./baseOperation";
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

  constructor({ weas, vector = new THREE.Vector3(), constraintType = null, axis = null, planeNormal = null }) {
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
    this.constraintType = constraintType || null; // null | "axis" | "plane" | "normal"
    this.axis = axis ? axis.clone() : new THREE.Vector3();
    this.normal = new THREE.Vector3();
    this.planeNormal = new THREE.Vector3();
    this.planeU = new THREE.Vector3();
    this.planeV = new THREE.Vector3();
    this.distance = 0;
    this.uDistance = 0;
    this.vDistance = 0;
    if (this.constraintType === "axis" && this.axis.lengthSq() === 0) {
      this.axis.set(1, 0, 0);
    }
    if (this.constraintType === "normal" && planeNormal) {
      this.normal.copy(planeNormal);
    }
    if (this.constraintType === "plane" && planeNormal) {
      this.planeNormal.copy(planeNormal);
    }
    this.refreshConstraintStateFromVector();
    this.uiFields = this.buildUISchema();
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

  buildUISchema() {
    if (this.constraintType === "axis") {
      return {
        title: "Translate (Axis)",
        fields: {
          distance: { type: "number", min: -10, max: 10, step: 0.1 },
          axisX: { type: "number", min: -1, max: 1, step: 0.01, path: "axis.x" },
          axisY: { type: "number", min: -1, max: 1, step: 0.01, path: "axis.y" },
          axisZ: { type: "number", min: -1, max: 1, step: 0.01, path: "axis.z" },
        },
      };
    }
    if (this.constraintType === "normal") {
      return {
        title: "Translate (Normal)",
        fields: {
          distance: { type: "number", min: -10, max: 10, step: 0.1 },
          normalX: { type: "number", min: -1, max: 1, step: 0.01, path: "normal.x" },
          normalY: { type: "number", min: -1, max: 1, step: 0.01, path: "normal.y" },
          normalZ: { type: "number", min: -1, max: 1, step: 0.01, path: "normal.z" },
        },
      };
    }
    if (this.constraintType === "plane") {
      return {
        title: "Translate (Plane)",
        fields: {
          u: { type: "number", min: -10, max: 10, step: 0.1, path: "uDistance" },
          v: { type: "number", min: -10, max: 10, step: 0.1, path: "vDistance" },
          normalX: { type: "number", min: -1, max: 1, step: 0.01, path: "planeNormal.x" },
          normalY: { type: "number", min: -1, max: 1, step: 0.01, path: "planeNormal.y" },
          normalZ: { type: "number", min: -1, max: 1, step: 0.01, path: "planeNormal.z" },
        },
      };
    }
    return this.constructor.ui || null;
  }

  applyParams(params) {
    super.applyParams(params);
    this.refreshVectorFromConstraint();
  }

  refreshConstraintStateFromVector() {
    if (this.constraintType === "axis") {
      this.normalizeAxis(this.axis);
      this.distance = this.vector.dot(this.axis);
      return;
    }
    if (this.constraintType === "normal") {
      this.normalizeAxis(this.normal, new THREE.Vector3(0, 0, 1));
      this.distance = this.vector.dot(this.normal);
      return;
    }
    if (this.constraintType === "plane") {
      this.ensurePlaneBasis();
      this.uDistance = this.vector.dot(this.planeU);
      this.vDistance = this.vector.dot(this.planeV);
      return;
    }
  }

  refreshVectorFromConstraint() {
    if (this.constraintType === "axis") {
      this.normalizeAxis(this.axis);
      this.vector.copy(this.axis).multiplyScalar(this.distance || 0);
      return;
    }
    if (this.constraintType === "normal") {
      this.normalizeAxis(this.normal, new THREE.Vector3(0, 0, 1));
      this.vector.copy(this.normal).multiplyScalar(this.distance || 0);
      return;
    }
    if (this.constraintType === "plane") {
      this.ensurePlaneBasis();
      this.vector
        .copy(this.planeU)
        .multiplyScalar(this.uDistance || 0)
        .add(this.planeV.clone().multiplyScalar(this.vDistance || 0));
    }
  }

  normalizeAxis(axis, fallback = new THREE.Vector3(1, 0, 0)) {
    if (!axis || axis.lengthSq() === 0) {
      axis.copy(fallback);
    }
    axis.normalize();
  }

  ensurePlaneBasis() {
    this.normalizeAxis(this.planeNormal, new THREE.Vector3(0, 0, 1));
    const n = this.planeNormal;
    const ref = Math.abs(n.x) < 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
    const u = new THREE.Vector3().crossVectors(n, ref);
    if (u.lengthSq() === 0) {
      u.crossVectors(n, new THREE.Vector3(0, 0, 1));
    }
    u.normalize();
    const v = new THREE.Vector3().crossVectors(n, u).normalize();
    this.planeU.copy(u);
    this.planeV.copy(v);
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
