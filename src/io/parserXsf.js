import { Atoms } from "../atoms/atoms.js";
import { elementAtomicNumbers } from "../atoms/atoms_data.js";

export function parseXSF(xsfContent) {
  const lines = xsfContent.trim().split(/\r?\n/);

  // Data structure for Atoms
  const data = {
    species: {},
    pbc: [true, true, true],
    positions: [],
    symbols: [],
  };

  let cell = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  let atomCount = 0;
  let volumetricData = null;

  // Indices of important sections
  let primvecIndex = -1;
  let primcoordIndex = -1;
  let beginDataIndex = -1;
  let endDataIndex = -1;

  // Locate key sections in the file
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim().toUpperCase();

    if (line.startsWith("PRIMVEC")) {
      primvecIndex = i;
    }
    if (line.startsWith("PRIMCOORD")) {
      primcoordIndex = i;
    }
    if (line.startsWith("BEGIN_BLOCK_DATAGRID_3D")) {
      beginDataIndex = i;
    }
    if (line.startsWith("END_BLOCK_DATAGRID_3D")) {
      endDataIndex = i;
    }
  }

  // --- Parse the cell vectors (PRIMVEC) ---
  if (primvecIndex >= 0) {
    for (let i = 1; i <= 3; i++) {
      cell[i - 1] = lines[primvecIndex + i].trim().split(/\s+/).map(Number);
    }
  }

  // --- Parse the atomic positions (PRIMCOORD) ---
  if (primcoordIndex >= 0) {
    const coordInfo = lines[primcoordIndex + 1].trim().split(/\s+/).map(Number);
    atomCount = coordInfo[0];

    for (let i = 0; i < atomCount; i++) {
      const atomLine = lines[primcoordIndex + 2 + i].trim().split(/\s+/);
      const atomIdentifier = atomLine[0]; // Can be atomic number or symbol
      let elementSymbol;

      // Check if identifier is a number (atomic number) or a string (symbol)
      if (!isNaN(parseFloat(atomIdentifier))) {
        // Convert atomic number to symbol
        elementSymbol = Object.keys(elementAtomicNumbers).find((key) => elementAtomicNumbers[key] === parseInt(atomIdentifier, 10)) || `X${atomIdentifier}`;
      } else {
        // Use the element symbol directly (normalize case)
        elementSymbol = atomIdentifier.charAt(0).toUpperCase() + atomIdentifier.slice(1).toLowerCase();
      }

      // x, y, z positions in Angstroms (no conversion needed)
      const position = atomLine.slice(1, 4).map(Number);

      // Store data
      if (!data.species[elementSymbol]) {
        data.species[elementSymbol] = elementSymbol;
      }
      data.symbols.push(elementSymbol);
      data.positions.push(position);
    }
  }

  // --- Construct the Atoms object ---
  let atoms = new Atoms({
    ...data,
    cell,
  });

  // --- Parse volumetric data (if present) ---
  if (beginDataIndex >= 0 && endDataIndex > beginDataIndex) {
    let dataHeaderLineIndex = beginDataIndex + 1;

    while (dataHeaderLineIndex < endDataIndex && !lines[dataHeaderLineIndex].toUpperCase().includes("DATAGRID_3D")) {
      dataHeaderLineIndex++;
    }

    const dimLine = lines[dataHeaderLineIndex + 1].trim().split(/\s+/).map(Number);
    const [nx, ny, nz] = dimLine;

    // Parse origin and grid vectors
    const origin = lines[dataHeaderLineIndex + 2].trim().split(/\s+/).map(Number);
    const gridCell = [
      lines[dataHeaderLineIndex + 3].trim().split(/\s+/).map(Number),
      lines[dataHeaderLineIndex + 4].trim().split(/\s+/).map(Number),
      lines[dataHeaderLineIndex + 5].trim().split(/\s+/).map(Number),
    ];

    // Read volumetric data
    const values = [];
    const dataStartIndex = dataHeaderLineIndex + 6;
    for (let i = dataStartIndex; i < endDataIndex; i++) {
      const lineVals = lines[i].trim().split(/\s+/).map(Number);
      if (lineVals.some((v) => !isNaN(v))) {
        values.push(...lineVals);
      }
    }

    // Sanity check
    if (values.length < nx * ny * nz) {
      console.warn(`Volumetric data mismatch: got ${values.length}, expected ${nx * ny * nz}`);
    }

    volumetricData = {
      dims: [nx, ny, nz],
      values,
      origin,
      cell: gridCell,
    };
  }

  // Return the parsed data
  return {
    atoms,
    volumetricData,
  };
}
