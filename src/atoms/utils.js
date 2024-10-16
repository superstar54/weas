import * as THREE from "three";

export const generatePhononTrajectory = (atoms, eigenvectors, amplitude, nframes) => {
  const trajectory = [];
  const times = Array.from({ length: nframes }, (_, i) => 2 * Math.PI * (i / nframes));
  times.forEach((t) => {
    const vectors = eigenvectors.map((vec) => vec.map((val) => val * amplitude * Math.sin(t)));
    const newAtoms = atoms.copy();
    for (let i = 0; i < newAtoms.positions.length; i++) {
      newAtoms.positions[i] = newAtoms.positions[i].map((pos, j) => pos + vectors[i][j] / 5);
    }
    newAtoms.newAttribute("movement", vectors);
    trajectory.push(newAtoms);
  });
  return trajectory;
};

// convert color to THREE.Color, the color can be a string or an array
export function convertColor(color) {
  if (Array.isArray(color)) {
    color = new THREE.Color(...color);
  } else {
    color = new THREE.Color(color);
  }
  return color;
}
