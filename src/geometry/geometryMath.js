import { sqrt, acos, dot, cross, norm, subtract, divide } from "mathjs";

/**
 * Get position vector (simply returns the input for now)
 * @param {Object} options - { site1: [x,y,z] }
 * @returns {number[]}
 */
export function getPosition(a) {
  return a.slice();
}

/**
 * Get distance between two points
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number}
 */
export function getDistance(a, b) {
  const diff = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  return sqrt(dot(diff, diff));
}

/**
 * Get angle (in degrees) between three points: a-b-c, vertex at b
 * @param {number[]} a
 * @param {number[]} b
 * @param {number[]} c
 * @returns {number} angle in degrees
 */
export function getAngle(a, b, c) {
  const v1 = [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const v2 = [c[0] - b[0], c[1] - b[1], c[2] - b[2]];
  const cosTheta = dot(v1, v2) / (norm(v1) * norm(v2));
  return (acos(Math.min(Math.max(cosTheta, -1), 1)) * 180) / Math.PI;
}

/**
 * Get dihedral angle (in degrees) between four points: a-b-c-d
 * @param {number[]} a
 * @param {number[]} b
 * @param {number[]} c
 * @param {number[]} d
 * @returns {number} dihedral angle in degrees
 */
export function getDihedral(a, b, c, d) {
  // vectors between points
  const b1 = subtract(b, a); // b - a
  const b2 = subtract(c, b); // c - b
  const b3 = subtract(d, c); // d - c

  // normalize b2
  const b2Unit = divide(b2, norm(b2));

  // normal vectors to planes
  const n1 = cross(b1, b2);
  const n2 = cross(b2, b3);

  // vector perpendicular to n1 in plane of b2
  const m1 = cross(n1, b2Unit);

  // compute dihedral angle
  const x = dot(n1, n2);
  const y = dot(m1, n2);

  return (Math.atan2(y, x) * 180) / Math.PI;
}

// // helper functions
// function subtract(u, v) {
//   return [u[0] - v[0], u[1] - v[1], u[2] - v[2]];
// }

// function normalize(v) {
//   const n = norm(v);
//   if (n === 0) return [0, 0, 0];
//   return v.map((x) => x / n);
// }
