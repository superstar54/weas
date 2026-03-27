import ATOMIC_NUMBERS from "./ATOMIC_NUMBERS.json";

import COVALENT_RADII from "./COVALENT_RADII.json";
import VDW_RADII from "./VDW_RADII.json";

import DEFAULT_BOND_PAIRS from "./DEFAULT_BOND_PAIRS.json";
import DEFAULT_POLYHEDRA_ATOMS from "./POLYHEDRA.json";

import VESTA_COLORS from "./colors/VESTA.json";
import CPK_COLORS from "./colors/CPK.json";
import JMOL_COLORS from "./colors/JMOL.json";

// map element symbols to atomic numbers
export const elementAtomicNumbers = ATOMIC_NUMBERS;

// atomic radii in covalent and vdw
export const covalentRadii = COVALENT_RADII;
export const vdwRadii = VDW_RADII;

// default atoms that will be rendered as polyhedra
export const elementsWithPolyhedra = DEFAULT_POLYHEDRA_ATOMS;

/**
 * Default bond pair settings derived from VESTA.
 *
 * Keys are element pairs in the format "Element1-Element2" (e.g. "Ag-O").
 * Values are tuples of [searchMode, polyhedra, type]:
 *   - searchMode: 1 = search for bonds between the two elements
 *   - polyhedra:  1 = include in polyhedra rendering, 0 = exclude
 *   - type:       bond type identifier (0 = default, 1 = Hydrogen-bond)
 *
 * @type {Object.<string, [number, number, number]>}
 */
export const default_bond_pairs = DEFAULT_BOND_PAIRS;

// colors for common visualisation libraries
export const cpkColors = CPK_COLORS;
export const vestaColors = VESTA_COLORS;
export const jmolColors = JMOL_COLORS;

// bundled as a singular object for easy access
export const elementColors = {
  CPK: cpkColors,
  VESTA: vestaColors,
  JMOL: jmolColors,
};

export const radiiData = { Covalent: covalentRadii, VDW: vdwRadii };
