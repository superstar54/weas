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
