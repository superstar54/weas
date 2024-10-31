import { Atoms } from "../atoms/atoms.js";
import { elementAtomicNumbers } from "../atoms/atoms_data.js";

const Bohr = 0.52917721092; // Bohr in Angstrom

export function parseCube(cubeContent) {
  const lines = cubeContent.trim().split("\n");

  if (lines.length < 6) {
    throw new Error("Invalid cube file format");
  }

  // Parse the header
  const atomCount = parseInt(lines[2].trim().split(/\s+/)[0]); // Number of atoms
  const origin = lines[2].trim().split(/\s+/).slice(1).map(Number); // Origin

  // Number of voxels along each axis and step sizes (unit cell vectors)
  const voxelInfo = [lines[3].trim().split(/\s+/).map(Number), lines[4].trim().split(/\s+/).map(Number), lines[5].trim().split(/\s+/).map(Number)];
  const dims = voxelInfo.map((v) => Math.abs(v[0])); // Absolute value for number of voxels (ignoring sign)
  const unitCellVectors = voxelInfo.map((v, i) => ({
    cell: v.slice(1).map((value) => value * dims[i] * Bohr), // Calculate the actual cell lengths
    stepSize: v.slice(1),
  }));

  // Initialize data structure for Atoms
  const data = {
    kinds: {},
    positions: [],
    symbols: [],
  };

  for (let i = 6; i < 6 + atomCount; i++) {
    const atomData = lines[i].trim().split(/\s+/).map(Number);
    const atomicNumber = atomData[0];
    const position = atomData.slice(2); // Position (x, y, z)

    // Find the element symbol by atomic number
    const elementSymbol = Object.keys(elementAtomicNumbers).find((key) => elementAtomicNumbers[key] === atomicNumber);

    // Update kinds data if it's a new element
    if (!data.kinds[elementSymbol]) {
      data.kinds[elementSymbol] = elementSymbol;
    }

    // Add kinds and position data for the current atom
    data.symbols.push(elementSymbol);
    data.positions.push(position);
  }

  // Validate the parsed data
  if (data.positions.length !== atomCount) {
    throw new Error("Atom count mismatch in cube file");
  }

  // Create an Atoms instance for the current data
  const cell = unitCellVectors.map((v) => v.cell); // Use the calculated unit cell
  let atoms = new Atoms({
    ...data,
    cell: cell,
  });

  // Parse the volumetric data
  const values = [];
  for (let i = 6 + atomCount; i < lines.length; i++) {
    const dataPoints = lines[i].trim().split(/\s+/).map(Number);
    values.push(...dataPoints);
  }

  // convert the atoms positions to Angstrom
  atoms.positions = atoms.positions.map((v) => v.map((value) => value * Bohr));

  return {
    atoms,
    volumetricData: { dims, values, origin, cell },
  };
}
