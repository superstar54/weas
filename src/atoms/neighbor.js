import { covalentRadii } from "./atoms_data.js";
import { kdTree } from "../geometry/kdTree.js";
import { searchBoundary } from "./boundary.js";
import { calculateCartesianCoordinates } from "../utils.js";

export function findNeighbors(atoms, cutoffs, include_self = false, pbc = true) {
  /* Function to find neighbors within a certain cutoff
  Args:
    atoms: Atoms object
    cutoffs: Dictionary of cutoffs for each species pair, has min and max
    include_self: Include self in the neighbors list
    pbc: Periodic boundary conditions
  */
  console.time("findNeighbors Time");
  // Create offsets for each atom
  let offsets = atoms.positions.map((_, index) => [index, [0, 0, 0]]);
  let offsets1;
  const maxCutoff = Math.max(...Object.values(cutoffs).map((cutoff) => cutoff.max));
  // console.log("maxCutoff: ", maxCutoff);
  // if pbc is true, include the atoms just outside the boundary with maxCutoff
  if (pbc) {
    // calculate the boundary using max cutoff
    // scaled the maxCutoff by unit cell
    const cellData = atoms.getCellLengthsAndAngles();
    const boundary = [
      [-maxCutoff / cellData[0], 1 + maxCutoff / cellData[0]],
      [-maxCutoff / cellData[1], 1 + maxCutoff / cellData[1]],
      [-maxCutoff / cellData[2], 1 + maxCutoff / cellData[2]],
    ];
    offsets1 = searchBoundary(atoms, boundary);
  }
  // merge the offsets
  offsets = offsets.concat(offsets1);

  // Initialize neighbors array and map
  const neighborsList = [];
  const neighborsMap = {};

  // Function to calculate distance
  var distance = function (a, b) {
    return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2);
  };

  // Calculate positions with offsets
  const positions = offsets.map((offset) => {
    const originalPos = atoms.positions[offset[0]];
    const shift = calculateCartesianCoordinates(atoms.cell, offset[1]);

    return [originalPos[0] + shift[0], originalPos[1] + shift[1], originalPos[2] + shift[2]];
  });
  // Create k-d tree from adjusted positions
  const points = positions.map((position, index) => {
    return {
      x: position[0],
      y: position[1],
      z: position[2],
      index: index,
    };
  });
  const tree = new kdTree(points, distance, ["x", "y", "z"]);
  // Iterate over each atom with offset
  offsets.forEach(([atomIndex1, offset1], idx1) => {
    // skip the atoms not in the original cell
    if (offset1[0] != 0 || offset1[1] != 0 || offset1[2] != 0) return;
    const species1 = atoms.species[atoms.symbols[atomIndex1]].symbol;
    const radius1 = covalentRadii[species1] * 1.1 || 1;
    const pos1 = positions[idx1];
    const point = { x: positions[idx1][0], y: positions[idx1][1], z: positions[idx1][2] };

    // Find potential neighbors within the sum of radius1 and maximum possible radius2
    // max neighbors is 12*2, 12 is the number of nearest neighbors in a face-centered cubic lattice
    // the closest packed structure. We consider the nearest and second nearest neighbors
    const potentialNeighbors = tree.nearest(point, 24, maxCutoff ** 2);

    potentialNeighbors.forEach((neighbor) => {
      const idx2 = neighbor[0].index;
      if (idx1 == idx2) return;
      const atomIndex2 = offsets[idx2][0];
      if (!include_self && atomIndex1 == atomIndex2) return;
      const key = species1 + "-" + atoms.species[atoms.symbols[atomIndex2]].symbol;
      // if key is not in cutoffs, skip
      if (!cutoffs[key]) return;
      const pos2 = positions[idx2];
      const distance = calculateDistance(pos1, pos2);
      // console.log(atomIndex1, atomIndex2, distance, cutoff);
      if (distance < cutoffs[key].max && distance > cutoffs[key].min) {
        neighborsList.push([atomIndex1, atomIndex2, offsets[idx2][1]]);
        if (!neighborsMap[atomIndex1]) {
          neighborsMap[atomIndex1] = [[atomIndex2, offsets[idx2][1]]];
        } else {
          neighborsMap[atomIndex1].push([atomIndex2, offsets[idx2][1]]);
        }
      }
    });
  });

  console.timeEnd("findNeighbors Time");
  return { list: neighborsList, map: neighborsMap };
}

// Helper function to calculate distance between two points
function calculateDistance(point1, point2) {
  return Math.sqrt(Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2) + Math.pow(point1[2] - point2[2], 2));
}
