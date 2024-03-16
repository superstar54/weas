// src/index.js
import { WEAS } from "./weas.js";
import { Species, Atom, Atoms } from "./atoms/atoms.js";
import { AtomsViewer } from "./atoms/AtomsViewer.js";
import { parseXYZ } from "./io/parserXYZ.js";
import { parseCIF } from "./io/parserCif.js";
import { parseCube } from "./io/parserCube.js";
import { elementAtomicNumbers } from "./atoms/atoms_data.js";

// Export the modules to be publicly available
export { WEAS, Species, Atom, Atoms, AtomsViewer, parseXYZ, parseCIF, parseCube, elementAtomicNumbers };
