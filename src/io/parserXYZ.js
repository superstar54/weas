import { Atoms } from "../atoms/atoms.js";

function parseXYZ(xyzString) {
  const lines = xyzString.trim().split("\n");
  let currentLine = 0;
  const frames = [];

  while (currentLine < lines.length) {
    if (lines[currentLine].trim() === "") {
      currentLine++;
      continue; // Skip empty lines between frames
    }

    const atomCount = parseInt(lines[currentLine].trim());
    currentLine++; // Move to the next line (comment line)
    if (isNaN(atomCount) || currentLine + atomCount > lines.length) {
      throw new Error("Invalid XYZ file format");
    }

    currentLine++; // Skip the comment line for this frame

    // Initialize data structure for the current frame
    const data = {
      kinds: {},
      positions: [],
      symbols: [],
    };

    // Parse the atom positions for the current frame
    for (let i = 0; i < atomCount; i++, currentLine++) {
      const parts = lines[currentLine].trim().split(/\s+/);
      if (parts.length !== 4) {
        throw new Error("Invalid line format in XYZ file");
      }

      const [element, x, y, z] = parts;

      // Update kinds data if it's a new kinds
      if (!data.kinds[element]) {
        data.kinds[element] = element;
      }

      // Add kinds and position data for the current atom
      data.symbols.push(element);
      data.positions.push([parseFloat(x), parseFloat(y), parseFloat(z)]);
    }

    // Validate the parsed frame
    if (data.positions.length !== atomCount) {
      throw new Error("Atom count mismatch in XYZ file");
    }

    // Create an Atoms instance for the current frame and add it to frames
    let atoms = new Atoms(data);
    frames.push(atoms);
  }

  return frames; // Return all parsed frames
}

export { parseXYZ };
