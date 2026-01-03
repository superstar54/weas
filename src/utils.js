import * as THREE from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";

export function toVector3(value, name = "value") {
  console.log("toVector3 called with value:", value);
  if (value instanceof THREE.Vector3) {
    return value;
  }
  if (Array.isArray(value) && value.length === 3) {
    return new THREE.Vector3(value[0], value[1], value[2]);
  }
  if (value && typeof value === "object" && "length" in value && value.length === 3) {
    return new THREE.Vector3(...value);
  }
  if (value && typeof value === "object" && "x" in value && "y" in value && "z" in value) {
    return new THREE.Vector3(value.x, value.y, value.z);
  }
  throw new Error(`${name} must be a THREE.Vector3, an [x,y,z] array, or an {x,y,z} object, got ${typeof value}`);
}

export function toIndexArray(indices, name = "indices") {
  if (indices === null) {
    throw new Error(`${name} must not be null`);
  }
  return Array.isArray(indices) ? indices : [indices];
}

export function clearObjects(scene, uuid = null) {
  // Clone the children array since we'll be modifying it as we go
  const children = [...scene.children];

  children.forEach((child) => {
    // If uuid is specified, only remove objects with matching uuid
    if (uuid !== null && (!child.userData || child.userData.uuid !== uuid)) {
      return; // Skip this object
    }
    // if child is a group, remove all children
    // show type of child
    if (child instanceof THREE.Group) {
      clearGroup(scene, child);
    } else if (!(child instanceof THREE.Camera) && !(child instanceof THREE.Light)) {
      clearObject(scene, child);
    }
  });
}

export function clearGroup(scene, group) {
  group.children.forEach((child) => {
    if (child instanceof THREE.Group) {
      clearGroup(scene, child);
    } else {
      clearObject(scene, child);
    }
  });
}

export function clearObject(scene, obj) {
  if (obj === null) {
    return;
  }
  // remove all children
  if (obj.children) {
    obj.remove(...obj.children);
  }
  if (obj.geometry) {
    obj.geometry.dispose();
  }
  if (obj.material) {
    if (Array.isArray(obj.material)) {
      obj.material.forEach((material) => material.dispose());
    } else {
      obj.material.dispose();
    }
  }
  scene.remove(obj);
}

export function getWorldPositionFromScreen(camera, ndc, plane) {
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(ndc, camera);

  const worldPosition = new THREE.Vector3();
  raycaster.ray.intersectPlane(plane, worldPosition);
  return worldPosition;
}

export function convertToMatrixFromABCAlphaBetaGamma(abcAlphaBetaGamma) {
  const [a, b, c, alpha, beta, gamma] = abcAlphaBetaGamma;
  // Convert angles to radians
  const alphaRad = (alpha * Math.PI) / 180;
  const betaRad = (beta * Math.PI) / 180;
  const gammaRad = (gamma * Math.PI) / 180;

  // Calculate components of the cell matrix
  // Assuming orthorhombic cell (right angles) for simplicity
  // For triclinic or other cell types, the calculation will be more complex
  const ax = a;
  const ay = 0;
  const az = 0;
  const bx = b * Math.cos(gammaRad);
  const by = b * Math.sin(gammaRad);
  const bz = 0;
  const cx = c * Math.cos(betaRad);
  const cy = (c * (Math.cos(alphaRad) - Math.cos(betaRad) * Math.cos(gammaRad))) / Math.sin(gammaRad);
  const cz = Math.sqrt(c * c - cx * cx - cy * cy);

  return [
    [ax, ay, az],
    [bx, by, bz],
    [cx, cy, cz],
  ];
}

// calculate the cartesian coordinates of a point in the unit cell
export function calculateCartesianCoordinates(matrix, fractionalCoordinates) {
  // transpose the matrix
  matrix = matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]));
  return multiplyMatrixVector(matrix, fractionalCoordinates);
}

export function multiplyMatrixVector(matrix, vector) {
  const result = [];
  for (let i = 0; i < matrix.length; i++) {
    let sum = 0;
    for (let j = 0; j < matrix[i].length; j++) {
      sum += matrix[i][j] * vector[j];
    }
    result.push(sum);
  }

  return result;
}

// Function to calculate the inverse of a 3x3 matrix
export function calculateInverseMatrix(matrix) {
  const det =
    matrix[0][0] * (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1]) -
    matrix[0][1] * (matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]) +
    matrix[0][2] * (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0]);

  if (det === 0) {
    throw new Error("Matrix has zero determinant, cannot calculate inverse.");
  }

  const invDet = 1 / det;
  const inverseMatrix = [
    [
      (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1]) * invDet,
      (matrix[0][2] * matrix[2][1] - matrix[0][1] * matrix[2][2]) * invDet,
      (matrix[0][1] * matrix[1][2] - matrix[0][2] * matrix[1][1]) * invDet,
    ],
    [
      (matrix[1][2] * matrix[2][0] - matrix[1][0] * matrix[2][2]) * invDet,
      (matrix[0][0] * matrix[2][2] - matrix[0][2] * matrix[2][0]) * invDet,
      (matrix[0][2] * matrix[1][0] - matrix[0][0] * matrix[1][2]) * invDet,
    ],
    [
      (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0]) * invDet,
      (matrix[0][1] * matrix[2][0] - matrix[0][0] * matrix[2][1]) * invDet,
      (matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]) * invDet,
    ],
  ];

  return inverseMatrix;
}

// Function to calculate the angle and axis of rotation from a rotation matrix
export function angleAxisFromRotationMatrix(rotationMatrix) {
  // Convert the rotation matrix to a quaternion
  const quaternion = new THREE.Quaternion().setFromRotationMatrix(rotationMatrix);

  // Extract the rotation axis and angle from the quaternion
  const angle = 2 * Math.acos(quaternion.w); // Angle in radians
  let axis = new THREE.Vector3(quaternion.x, quaternion.y, quaternion.z);

  // If the quaternion is normalized, the axis can be directly used, but if it's not,
  //  need to normalize the axis vector
  if (axis.length() > 0) {
    axis.normalize();
  } else {
    // Default axis if the angle is 0
    axis = new THREE.Vector3(1, 0, 0);
  }

  // Convert angle to degrees for GUI
  return {
    angle: THREE.MathUtils.radToDeg(angle),
    axis: { x: axis.x, y: axis.y, z: axis.z },
  };
}

export function calculateQuaternion(position1, position2) {
  /* Calculate quaternion for the transformation
  position1: position of the first atom
  position2: position of the second atom

  Returns:
  quaternion: quaternion for the transformation
  */

  // Calculate transformation for the cylinder
  const orientation = new THREE.Matrix4().lookAt(position1, position2, new THREE.Object3D().up);
  const quaternion = new THREE.Quaternion().setFromRotationMatrix(orientation);

  // Adjusting rotation to align with the bond direction
  const adjustmentQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
  quaternion.multiply(adjustmentQuaternion);
  return quaternion;
}

export function createLabel(position, text, color = "black", fontSize = "14px", className = "axis-label") {
  const labelDiv = document.createElement("div");
  labelDiv.className = className;
  labelDiv.textContent = text;
  labelDiv.style.color = color;
  labelDiv.style.fontSize = fontSize;

  const label = new CSS2DObject(labelDiv);
  label.position.copy(position);

  return label;
}
