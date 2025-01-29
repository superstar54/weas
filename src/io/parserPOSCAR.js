import { Atoms } from "../atoms/atoms.js";

function parsePOSCAR(poscarString) {
  const lines = poscarString.trim().split("\n");

  if (lines.length < 8) {
    throw new Error("Invalid POSCAR file format");
  }

  // Parse lattice vectors (lines 3-5)
  const latticeVectors = lines.slice(2, 5).map((line) => line.trim().split(/\s+/).map(Number));

  // Parse atom types (line 6) and atom counts (line 7)
  const atomTypes = lines[5].trim().split(/\s+/);
  const atomCounts = lines[6].trim().split(/\s+/).map(Number);

  // Check if positions are in direct or Cartesian coordinates
  const isDirect = lines[7].trim().toLowerCase().startsWith("d");

  // Start reading atom positions from line 8
  const positions = [];
  let lineIndex = 8;
  atomTypes.forEach((type, idx) => {
    for (let i = 0; i < atomCounts[idx]; i++) {
      const position = lines[lineIndex++].trim().split(/\s+/).map(Number);
      if (isDirect) {
        // Convert direct to Cartesian coordinates
        positions.push([
          position[0] * latticeVectors[0][0] + position[1] * latticeVectors[1][0] + position[2] * latticeVectors[2][0],
          position[0] * latticeVectors[0][1] + position[1] * latticeVectors[1][1] + position[2] * latticeVectors[2][1],
          position[0] * latticeVectors[0][2] + position[1] * latticeVectors[1][2] + position[2] * latticeVectors[2][2],
        ]);
      } else {
        positions.push(position);
      }
    }
  });

  // Create a data object for Atoms
  const data = {
    cell: latticeVectors.flat(),
    pbc: [true, true, true],
    species: {},
    positions: positions,
    symbols: atomTypes.flatMap((type, idx) => Array(atomCounts[idx]).fill(type)),
  };

  let atoms = new Atoms(data);
  return atoms;
}

export { parsePOSCAR };
