import * as THREE from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";

import { multiply, inv, transpose } from "mathjs";

/**
 * Normalises a value into a THREE.Vector3, accepting multiple input formats.
 *
 * Accepts:
 *   - THREE.Vector3 (returned as-is)
 *   - [x, y, z] array
 *   - Array-like with .length === 3 (e.g. Float32Array)
 *   - { x, y, z } object
 *
 * @param {THREE.Vector3|number[]|{x:number,y:number,z:number}} value
 * @param {string} [name="value"] - Name used in error messages for easier debugging
 * @returns {THREE.Vector3}
 * @throws {Error} If the value cannot be converted
 */
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

/**
 * Normalises an index or array of indices into a plain array.
 * Allows callers to pass either a single index or an array.
 *
 * @param {number|number[]} indices
 * @param {string} [name="indices"] - Name used in error messages
 * @returns {number[]}
 * @throws {Error} If indices is null
 */
export function toIndexArray(indices, name = "indices") {
  if (indices === null) {
    throw new Error(`${name} must not be null`);
  }
  return Array.isArray(indices) ? indices : [indices];
}

/**
 * Removes all objects from a scene, optionally filtered by userData.uuid.
 * Skips cameras and lights. Disposes geometry and materials of removed objects.
 *
 * @param {THREE.Scene} scene
 * @param {string|null} [uuid=null] - If provided, only removes objects with matching userData.uuid
 */
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
    } else if (
      !(child instanceof THREE.Camera) &&
      !(child instanceof THREE.Light)
    ) {
      clearObject(scene, child);
    }
  });
}

/**
 * Recursively removes and disposes all objects within a group.
 *
 * @param {THREE.Scene} scene
 * @param {THREE.Group} group
 */
export function clearGroup(scene, group) {
  group.children.forEach((child) => {
    if (child instanceof THREE.Group) {
      clearGroup(scene, child);
    } else {
      clearObject(scene, child);
    }
  });
}

/**
 * Removes a single object from the scene and disposes its geometry and materials.
 * Handles both single and array materials.
 *
 * @param {THREE.Scene} scene
 * @param {THREE.Object3D|null} obj
 */
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

/**
 * Converts normalised device coordinates (NDC) to a world position on a given plane.
 * Useful for mapping mouse/pointer position to a 3D scene position.
 *
 * @param {THREE.Camera} camera
 * @param {THREE.Vector2} ndc - Normalised device coordinates (-1 to 1)
 * @param {THREE.Plane} plane - The plane to intersect with
 * @returns {THREE.Vector3} World position on the plane
 */
export function getWorldPositionFromScreen(camera, ndc, plane) {
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(ndc, camera);

  const worldPosition = new THREE.Vector3();
  raycaster.ray.intersectPlane(plane, worldPosition);
  return worldPosition;
}

/**
 * Converts crystallographic cell parameters (a, b, c, α, β, γ) to a 3x3 lattice matrix
 * where each row is a lattice vector in Cartesian coordinates.
 *
 * Uses the standard crystallographic convention:
 *   - a along the x-axis
 *   - b in the xy-plane
 *   - c in the general direction
 *
 * @param {number[]} abcAlphaBetaGamma - [a, b, c, alpha, beta, gamma] where
 *   a, b, c are lattice lengths in Angstroms and alpha, beta, gamma are angles in degrees
 * @returns {number[][]} 3x3 matrix [[ax,ay,az], [bx,by,bz], [cx,cy,cz]]
 */
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
  const cy =
    (c * (Math.cos(alphaRad) - Math.cos(betaRad) * Math.cos(gammaRad))) /
    Math.sin(gammaRad);
  const cz = Math.sqrt(c * c - cx * cx - cy * cy);

  return [
    [ax, ay, az],
    [bx, by, bz],
    [cx, cy, cz],
  ];
}

/**
 * Converts fractional coordinates to Cartesian coordinates in the unit cell.
 *
 * @param {number[][]} matrix - 3x3 lattice matrix where each row is a lattice vector (a, b, c)
 * @param {number[]} fractionalCoordinates - [u, v, w] fractional coordinates
 * @returns {number[]} [x, y, z] Cartesian coordinates
 */
export function calculateCartesianCoordinates(matrix, fractionalCoordinates) {
  return multiply(transpose(matrix), fractionalCoordinates);
}

/** @deprecated Use mathjs multiply() directly */
export function multiplyMatrixVector(matrix, vector) {
  return multiply(matrix, vector);
}

/** @deprecated Use mathjs inv() directly */
export function calculateInverseMatrix(matrix) {
  return inv(matrix);
}

/**
 * Extracts the rotation axis and angle from a rotation matrix.
 * @param {THREE.Matrix4} rotationMatrix
 * @returns {{ angle: number, axis: { x: number, y: number, z: number } }}
 *   angle in degrees, axis as a normalized {x, y, z} vector.
 *   If the rotation angle is 0, defaults to axis {1, 0, 0}.
 */
export function angleAxisFromRotationMatrix(rotationMatrix) {
  // Convert the rotation matrix to a quaternion
  const quaternion = new THREE.Quaternion().setFromRotationMatrix(
    rotationMatrix,
  );

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

/**
 * Calculates the quaternion needed to orient a cylinder (or bond) between two atom positions.
 * Applies a 90° adjustment around the x-axis to align with Three.js cylinder orientation,
 * which points along the y-axis by default.
 *
 * @param {THREE.Vector3} position1 - Start position (base of the bond)
 * @param {THREE.Vector3} position2 - End position (tip of the bond)
 * @returns {THREE.Quaternion}
 */
export function calculateQuaternion(position1, position2) {
  // Calculate transformation for the cylinder
  const orientation = new THREE.Matrix4().lookAt(
    position1,
    position2,
    new THREE.Vector3(0, 1, 0),
  );
  const quaternion = new THREE.Quaternion().setFromRotationMatrix(orientation);

  // Adjusting rotation to align with the bond direction
  const adjustmentQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
  quaternion.multiply(adjustmentQuaternion);
  return quaternion;
}

// TODO: consolidate with createSpriteLabel in CellManager - investigate which one is better.
/**
 * Creates a CSS2D label attached to a position in 3D space.
 * Uses Three.js CSS2DObject for rendering, which requires a CSS2DRenderer
 * to be present in the scene.
 *
 * Note: avoid calling this in hot loops as it creates a DOM element per call.
 *
 * @param {THREE.Vector3} position - World position of the label
 * @param {string} text - Label text content
 * @param {string} [color="black"] - CSS color string
 * @param {string} [fontSize="14px"] - CSS font size string
 * @param {string} [className="axis-label"] - CSS class applied to the label div
 * @returns {CSS2DObject}
 */
export function createLabel(
  position,
  text,
  color = "black",
  fontSize = "14px",
  className = "axis-label",
) {
  const labelDiv = document.createElement("div");
  labelDiv.className = className;
  labelDiv.textContent = text;
  labelDiv.style.color = color;
  labelDiv.style.fontSize = fontSize;

  const label = new CSS2DObject(labelDiv);
  label.position.copy(position);

  return label;
}
