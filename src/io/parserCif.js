import { Atoms } from "../atoms/atoms.js";
import { convertToMatrixFromABCAlphaBetaGamma, calculateCartesianCoordinates } from "../utils.js";

export function parseCIF(cifString) {
  const data = {
    cell: [],
    pbc: [true, true, true],
    species: {},
    positions: [],
    symbols: [],
  };

  const cifData = CIFData.parseCIFBlock(cifString);
  cifData.applySymmetryOperations();
  data.cell = convertToMatrixFromABCAlphaBetaGamma([...cifData.unitCell.lengths, ...cifData.unitCell.angles]);
  console.log("cifData: ", cifData);
  data.symbols = cifData.atoms.map((atom) => {
    // e.g., Fe2 to Fe
    console.log(atom.type_symbol);
    const match = atom.type_symbol.match(/[A-Z][a-z]?/);
    return match ? match[0] : null;
  });
  // transform fractional coordinates to cartesian coordinates
  data.positions = cifData.atoms.map((atom) => {
    const position = [atom.fract_x, atom.fract_y, atom.fract_z];
    return calculateCartesianCoordinates(data.cell, position);
  });
  let atoms = new Atoms(data);
  return atoms;
}

class CIFData {
  constructor() {
    this.tags = {};
    this.loops = [];
    this.unitCell = null;
    this.atoms = [];
  }

  static parseCIFBlock(blockString) {
    const cifBlock = new CIFData();
    const lines = blockString.split("\n").map((line) => line.trim());
    let currentLoop = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line === "" || line.startsWith("#")) {
        continue; // Skip to the next iteration of the loop
      }
      if (line.startsWith("_")) {
        if (currentLoop) {
          cifBlock.loops.push(currentLoop);
          currentLoop = null;
        }
        const [key, value] = CIFData.parseTag(line, lines, i);
        cifBlock.tags[key.toLowerCase()] = CIFData.convertValue(value);
      } else if (line.toLowerCase() === "loop_") {
        if (currentLoop) cifBlock.loops.push(currentLoop);
        currentLoop = { headers: [], rows: [] };
        i++;
        while (lines[i] && lines[i].startsWith("_")) {
          currentLoop.headers.push(lines[i].split(" ")[0].toLowerCase());
          i++;
        }
        i--;
      } else if (currentLoop && !line.startsWith("#")) {
        const values = CIFData.parseLoopRow(line);
        if (values.length > 0) currentLoop.rows.push(values);
      }
    }
    if (currentLoop) cifBlock.loops.push(currentLoop);
    cifBlock.parseUnitCell();
    cifBlock.parseAtoms();

    return cifBlock;
  }

  static parseTag(line, lines, index) {
    let [key, ...valueParts] = line.split(" ");
    let value = valueParts.join(" ");
    if (value.startsWith(";")) {
      value = value.substring(1).trim();
      index++;
      while (index < lines.length && !lines[index].startsWith(";")) {
        value += "\n" + lines[index];
        index++;
      }
    }
    return [key, value];
  }

  getTagValue(tag) {
    return this.tags[tag] || null;
  }

  getAnyTagValue(keys) {
    for (let key of keys) {
      const value = this.getTagValue(key);
      if (value !== null) {
        return value;
      }
    }
    return null; // Return null if none of the keys are found
  }

  getSpaceGroupNumber() {
    return this.getAnyTagValue(["_space_group.it_number", "_space_group_it_number", "_symmetry_int_tables_number"]);
  }

  getSpaceGroupName() {
    const name = this.getAnyTagValue(["_space_group_name_h-m_alt", "_symmetry_space_group_name_h-m", "_space_group.Patterson_name_h-m", "_space_group.patterson_name_h-m"]);

    const oldSpaceGroupNames = { Abm2: "Aem2", Aba2: "Aea2", Cmca: "Cmce", Cmma: "Cmme", Ccca: "Ccc1" };

    return oldSpaceGroupNames[name] || name; // Return the updated symbol if it exists, otherwise return the original
  }

  static parseLoopRow(line) {
    let values = [];

    // Use a regular expression to match quoted strings or non-space sequences
    const regex = /'([^']*)'|"([^"]*)"|(\S+)/g;
    let match;

    while ((match = regex.exec(line)) !== null) {
      // If the match is a quoted string, it will be in one of the first two capturing groups
      // If it's a non-quoted value, it will be in the third capturing group
      values.push(match[1] || match[2] || match[3]);
    }

    // Convert values if they are numerical, using CIFData.convertValue
    return values.map((value) => CIFData.convertValue(value));
  }

  static convertValue(value) {
    // Try to convert the value to a number if possible
    let numValue = Number(value);
    // Return the number if it's a valid number; otherwise, return the original string
    return isNaN(numValue) ? value : numValue;
  }

  parseUnitCell() {
    const cellLengthKeys = ["_cell_length_a", "_cell_length_b", "_cell_length_c"];
    const cellAngleKeys = ["_cell_angle_alpha", "_cell_angle_beta", "_cell_angle_gamma"];
    if (cellLengthKeys.every((key) => key in this.tags) && cellAngleKeys.every((key) => key in this.tags)) {
      this.unitCell = {
        lengths: cellLengthKeys.map((key) => parseFloat(this.tags[key])),
        angles: cellAngleKeys.map((key) => parseFloat(this.tags[key])),
      };
    }
  }

  parseAtoms() {
    const atomLoop = this.loops.find((loop) => loop.headers.includes("_atom_site_fract_x") || loop.headers.includes("_atom_site_cartn_x"));
    if (atomLoop) {
      atomLoop.rows.forEach((row) => {
        const atom = {};
        atomLoop.headers.forEach((header, index) => {
          const cleanHeader = header.replace("_atom_site_", "");
          atom[cleanHeader] = CIFData.convertValue(row[index]);
        });
        this.atoms.push(atom);
      });
    }
  }

  parseSymmetryOperations() {
    // Updated to check for either of the two possible headers
    const symmLoop = this.loops.find((loop) => loop.headers.includes("_symmetry_equiv_pos_as_xyz") || loop.headers.includes("_space_group_symop_operation_xyz"));

    if (!symmLoop) return [];

    // Determine the correct header to use based on what's available in the found loop
    const symOpHeader = symmLoop.headers.includes("_symmetry_equiv_pos_as_xyz") ? "_symmetry_equiv_pos_as_xyz" : "_space_group_symop_operation_xyz";

    return symmLoop.rows.map((row) => {
      const opString = row[symmLoop.headers.indexOf(symOpHeader)];
      return this.parseSymmetryOperation(opString);
    });
  }

  parseSymmetryOperation(opString) {
    let matrix = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];
    let vector = [0, 0, 0];

    const components = opString.split(",").map((part) => part.trim());

    components.forEach((component, index) => {
      const translationMatch = component.match(/[+-]\s*(\d+\/\d+|\d*\.\d+|\d+)$/);

      if (translationMatch) {
        // Calculate the translation considering fractions
        const translationValue = eval(translationMatch[1]);
        vector[index] = translationValue;
      }

      if (component.includes("x")) matrix[index][0] = component.startsWith("-") ? -1 : 1;
      if (component.includes("y")) matrix[index][1] = component.startsWith("-") ? -1 : 1;
      if (component.includes("z")) matrix[index][2] = component.startsWith("-") ? -1 : 1;
    });
    return { matrix, vector };
  }

  applySymmetryOperations(symprec = 0.001, wrapAtoms = true) {
    this.symmetryOps = this.parseSymmetryOperations();
    // if getSpaceGroupName is defined, but no symmetry operations are found,
    // In principle, we need to use the space group to generate symmetry operations
    // but for now, we'll just throw an error
    if (this.getSpaceGroupName && this.symmetryOps.length === 0) {
      throw new Error("The space group is defined, but no symmetry operations are found. We cannot handle this case yet.");
    }
    // at least one symmetry operation is required, use identity if none are found
    if (this.symmetryOps.length === 0) {
      this.symmetryOps.push({
        matrix: [
          [1, 0, 0],
          [0, 1, 0],
          [0, 0, 1],
        ],
        vector: [0, 0, 0],
      });
    }
    let newAtoms = [];

    this.atoms.forEach((atom) => {
      this.symmetryOps.forEach(({ matrix, vector }) => {
        const newAtom = this.applySymmetryOperation(atom, matrix, vector);
        if (this.isUniqueSite(newAtom, newAtoms, symprec)) {
          if (wrapAtoms) {
            newAtom.fract_x = (newAtom.fract_x + 1) % 1;
            newAtom.fract_y = (newAtom.fract_y + 1) % 1;
            newAtom.fract_z = (newAtom.fract_z + 1) % 1;
          }
          newAtoms.push(newAtom);
        }
      });
    });

    this.atoms = newAtoms;
  }

  applySymmetryOperation(atom, matrix, vector) {
    const pos = [atom.fract_x, atom.fract_y, atom.fract_z];
    const newPos = [0, 0, 0];

    for (let i = 0; i < 3; i++) {
      newPos[i] = pos.reduce((acc, val, j) => acc + matrix[i][j] * val, 0);
    }

    const finalPos = newPos.map((val, i) => val + vector[i]);

    return {
      ...atom,
      fract_x: finalPos[0],
      fract_y: finalPos[1],
      fract_z: finalPos[2],
    };
  }

  isUniqueSite(newAtom, existingAtoms, symprec) {
    for (const existingAtom of existingAtoms) {
      const dist = this.calculateDistance(newAtom, existingAtom);
      if (dist < symprec) {
        return false;
      }
    }
    return true;
  }

  calculateDistance(atom1, atom2) {
    const diff = [0, 1, 2].map((i) => atom1[`fract_${"xyz"[i]}`] - atom2[`fract_${"xyz"[i]}`]);
    const correctedDiff = diff.map((d) => d - Math.round(d));
    return Math.sqrt(correctedDiff.reduce((acc, val) => acc + val * val, 0));
  }
}
