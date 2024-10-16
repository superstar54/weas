import { elementAtomicNumbers } from "./atoms_data.js";
import { convertToMatrixFromABCAlphaBetaGamma, calculateInverseMatrix } from "../utils.js";

class Species {
  constructor(symbol, element = null) {
    this.symbol = symbol; // Symbol of the species (e.g., 'C', 'C_1' for carbon)
    this._element = null;
    if (element === null) {
      element = symbol;
    }
    this.element = element;
  }

  get element() {
    return this._element;
  }

  set element(value) {
    // if value not in elementAtomicNumbers, raise a error
    if (!elementAtomicNumbers[value]) {
      throw new Error(`Element '${value}' is wrong.`);
    }
    this._element = value;
  }

  get number() {
    return elementAtomicNumbers[this.element];
  }
}

class Atom {
  constructor(species, position) {
    this.species = species; // the species in the species array
    this.position = [...position]; // Position of the atom as a Float32Array
  }
}

class Atoms {
  constructor({
    symbols = [],
    positions = [],
    cell = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ],
    pbc = [true, true, true],
    species = {},
    attributes = { atom: {}, species: {} },
  } = {}) {
    this.uuid = null;
    // length of symbols should be the same with positions
    if (symbols.length !== positions.length) {
      throw new Error("The length of symbols should be the same with positions.");
    }
    this.symbols = symbols;
    this.positions = positions;
    this.setSpecies(species, symbols);
    this.setCell(cell);
    this.setPBC(pbc);
    this.setAttributes(attributes);
  }

  setSpecies(species, symbols = null) {
    /*Initialize the Atoms instance from a dictionary of data.
     */
    this.species = {};
    if (typeof species !== "object") {
      throw new Error("Species should be a dictionary.");
    }
    // Iterate over each key-value pair in the species dictionary
    Object.entries(species).forEach(([symbol, element]) => {
      this.addSpecies(symbol, element);
    });
    // find out species which not added
    if (symbols) {
      const species = new Set(symbols);
      species.forEach((s) => {
        if (!this.species[s]) {
          this.addSpecies(s);
        }
      });
    }
  }

  setAttributes(attributes) {
    /*Set the attributes of the Atoms instance.
     */
    this.attributes = { atom: {}, species: {}, "inter-species": {} };
    for (const domain in attributes) {
      for (const name in attributes[domain]) {
        this.newAttribute(name, attributes[domain][name], domain);
      }
    }
  }

  newAttribute(name, values, domain = "atom") {
    /*Add a new attribute to the Atoms instance.*/
    if (domain === "atom") {
      // Ensure the length of values matches the number of atoms
      if (values.length !== this.positions.length) {
        throw new Error("The number of values does not match the number of atoms.");
      }
      // copy the values, values could be a array of N-d array
      this.attributes["atom"][name] = JSON.parse(JSON.stringify(values));
    } else if (domain === "species") {
      // Ensure that values are provided for each species
      for (const key of Object.keys(this.species)) {
        if (!(key in values)) {
          throw new Error(`Value for species '${key}' is missing.`);
        }
      }
      this.attributes["species"][name] = JSON.parse(JSON.stringify(values));
    } else if (domain === "inter-species") {
      // We don't require the values to be provided for each species
      this.attributes["species"][name] = JSON.parse(JSON.stringify(values));
    } else {
      throw new Error('Invalid domain. Must be either "atom", "species", or "inter-species".');
    }
  }

  getAttribute(name, domain = "atom") {
    /*Get the attribute of the Atoms instance.
    Species attributes read from the atoms directly: positions, species, index
    */
    if (domain === "atom") {
      if (name === "positions") {
        return this.positions;
      } else if (name === "species") {
        return this.symbols;
      } else if (name === "index") {
        return Array.from({ length: this.positions.length }, (_, i) => i);
      }
      if (!this.attributes["atom"][name]) {
        throw new Error(`Attribute '${name}' is not defined. The available attributes are: ${Object.keys(this.attributes["atom"])}`);
      }
      return this.attributes["atom"][name];
    } else if (domain === "species") {
      if (!this.attributes["species"][name]) {
        throw new Error(`Attribute '${name}' is not defined. The available attributes are: ${Object.keys(this.attributes["species"])}`);
      }
      return this.attributes["species"][name];
    } else if (domain === "inter-species") {
      if (!this.attributes[domain][name]) {
        throw new Error(`Attribute '${name}' is not defined in inter-species domain. The available attributes are: ${Object.keys(this.attributes[domain])}`);
      }
      return this.attributes[domain][name];
    } else {
      throw new Error('Invalid domain. Must be either "atom" or "species".');
    }
  }

  setCell(cell) {
    /*Set the unit cell of the Atoms instance.*/
    if (cell.length === 9) {
      // Convert 1x9 array into 3x3 matrix format
      this.cell = [
        [cell[0], cell[1], cell[2]],
        [cell[3], cell[4], cell[5]],
        [cell[6], cell[7], cell[8]],
      ];
    } else if (cell.length === 6) {
      // 1x6 array [a, b, c, alpha, beta, gamma]
      this.cell = convertToMatrixFromABCAlphaBetaGamma(cell);
    } else if (cell.length === 3) {
      // 1x3 array [a, b, c], assuming 90-degree angles
      if (cell[0].length === 3) {
        this.cell = cell;
      } else {
        const [a, b, c] = cell;
        this.cell = convertToMatrixFromABCAlphaBetaGamma([a, b, c, 90, 90, 90]);
      }
    } else {
      throw new Error("Invalid cell dimensions provided. Expected 3x3 matrix, 1x6, or 1x3 array.");
    }
  }

  isUndefinedCell() {
    /*Check if the unit cell is undefined.*/
    return this.cell.some((row) => row.every((cell) => cell === 0));
  }

  // get cell length and angles
  getCellLengthsAndAngles() {
    const [a, b, c] = this.cell.map((row) => Math.sqrt(row[0] ** 2 + row[1] ** 2 + row[2] ** 2));
    const alpha = (Math.acos((this.cell[1][0] * this.cell[2][0] + this.cell[1][1] * this.cell[2][1] + this.cell[1][2] * this.cell[2][2]) / (b * c)) * 180) / Math.PI;
    const beta = (Math.acos((this.cell[0][0] * this.cell[2][0] + this.cell[0][1] * this.cell[2][1] + this.cell[0][2] * this.cell[2][2]) / (a * c)) * 180) / Math.PI;
    const gamma = (Math.acos((this.cell[0][0] * this.cell[1][0] + this.cell[0][1] * this.cell[1][1] + this.cell[0][2] * this.cell[1][2]) / (a * b)) * 180) / Math.PI;
    return [a, b, c, alpha, beta, gamma];
  }

  setPBC(pbc) {
    // if pbc is a boolean, convert it to a 3-element array
    if (typeof pbc === "boolean") {
      pbc = [pbc, pbc, pbc];
    }
    this.pbc = pbc;
  }

  addSpecies(symbol, element = null) {
    // Create a new Species and add it to the species object
    if (!this.species[symbol]) {
      this.species[symbol] = new Species(symbol, element);
    }
  }

  getSymbols() {
    // Get the symbols of the species in the atoms
    return this.symbols.map((key) => this.species[key].symbol);
  }

  addAtom(atom) {
    // Add an atom to the atoms
    if (!this.species[atom.species]) {
      this.addSpecies(atom.species);
    }
    this.positions.push(atom.position);
    this.symbols.push(atom.species);
  }

  removeAtom(index) {
    // Remove an atom from the atoms by its index
    this.positions.splice(index * 4, 4);
  }

  getSpeciesCount() {
    // Get the number of species in the atoms
    return this.species.length;
  }

  getAtomsCount() {
    // Get the number of atoms in the atoms
    return this.positions.length; // Each atom uses 4 values (species index + x, y, z)
  }

  // Overload the "+" operator to concatenate two Atoms objects
  add(otherAtoms) {
    const result = new Atoms();
    // Concatenate species
    result.species = { ...this.species, ...otherAtoms.species };
    // Concatenate positions
    result.positions = [...this.positions, ...otherAtoms.positions];
    // Additional attributes can be handled here if needed
    return result;
  }

  // Overload the "+=" operator to concatenate another Atoms object
  addToSelf(otherAtoms) {
    // Concatenate species
    this.species = { ...this.species, ...otherAtoms.species };
    // Concatenate positions
    this.positions = [...this.positions, ...otherAtoms.positions];
    this.symbols = [...this.symbols, ...otherAtoms.symbols];

    // Additional attributes can be handled here if needed
  }

  multiply(mx, my, mz) {
    // Multiply the atoms in the Atoms object by the given dimensions
    console.time("multiply");
    if (this.isUndefinedCell()) {
      throw new Error("Cell matrix is not defined.");
    }
    const newAtoms = new Atoms();
    // Copy species object
    newAtoms.species = { ...this.species };

    const [[ax, ay, az], [bx, by, bz], [cx, cy, cz]] = this.cell;
    newAtoms.setCell([ax * mx, ay * my, az * mz, bx * mx, by * my, bz * mz, cx * mx, cy * my, cz * mz]);

    // Replicate atoms
    for (let ix = 0; ix < mx; ix++) {
      for (let iy = 0; iy < my; iy++) {
        for (let iz = 0; iz < mz; iz++) {
          for (let i = 0; i < this.positions.length; i++) {
            const [x, y, z] = this.positions[i];
            // Calculate new position considering the unit cell dimensions
            const newX = x + ix * this.cell[0][0] + iy * this.cell[1][0] + iz * this.cell[2][0];
            const newY = y + ix * this.cell[0][1] + iy * this.cell[1][1] + iz * this.cell[2][1];
            const newZ = z + ix * this.cell[0][2] + iy * this.cell[1][2] + iz * this.cell[2][2];

            // Add the new atom to the newAtoms
            newAtoms.symbols.push(this.symbols[i]);
            newAtoms.positions.push([newX, newY, newZ]);
          }
        }
      }
    }
    // repeat attributes for each atom
    for (const name in this.attributes["atom"]) {
      const values = this.attributes["atom"][name];
      const newValues = [];
      for (let ix = 0; ix < mx; ix++) {
        for (let iy = 0; iy < my; iy++) {
          for (let iz = 0; iz < mz; iz++) {
            for (let i = 0; i < values.length; i++) {
              newValues.push(values[i]);
            }
          }
        }
      }
      newAtoms.newAttribute(name, newValues, "atom");
    }
    // console.timeEnd("multiply");
    // Return the new Atoms object
    return newAtoms;
  }

  translate(t) {
    for (let i = 0; i < this.positions.length; i++) {
      this.positions[i][0] += t[0]; // Shift x-coordinate
      this.positions[i][1] += t[1]; // Shift y-coordinate
      this.positions[i][2] += t[2]; // Shift z-coordinate
    }
  }

  rotate(axis, angle, rotate_cell = false) {
    const angleRad = (angle * Math.PI) / 180;
    const norm = Math.sqrt(axis[0] * axis[0] + axis[1] * axis[1] + axis[2] * axis[2]);
    const [u, v, w] = [axis[0] / norm, axis[1] / norm, axis[2] / norm]; // Normalized axis components

    // Rodrigues' rotation formula components
    const cosA = Math.cos(angleRad);
    const sinA = Math.sin(angleRad);
    const matrix = [
      cosA + u * u * (1 - cosA),
      u * v * (1 - cosA) - w * sinA,
      u * w * (1 - cosA) + v * sinA,
      v * u * (1 - cosA) + w * sinA,
      cosA + v * v * (1 - cosA),
      v * w * (1 - cosA) - u * sinA,
      w * u * (1 - cosA) - v * sinA,
      w * v * (1 - cosA) + u * sinA,
      cosA + w * w * (1 - cosA),
    ];

    for (let i = 0; i < this.positions.length; i++) {
      const [x, y, z] = this.positions[i];
      this.positions[i][0] = matrix[0] * x + matrix[1] * y + matrix[2] * z;
      this.positions[i][1] = matrix[3] * x + matrix[4] * y + matrix[5] * z;
      this.positions[i][2] = matrix[6] * x + matrix[7] * y + matrix[8] * z;
    }

    if (rotate_cell && this.cell) {
      const newCell = Array(3)
        .fill(0)
        .map(() => Array(3).fill(0));
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          newCell[i][j] = matrix[0 + j] * this.cell[i][0] + matrix[3 + j] * this.cell[i][1] + matrix[6 + j] * this.cell[i][2];
        }
      }
      this.cell = newCell;
    }
  }

  center(vacuum = 0.0, axis = (0, 1, 2), center = null) {
    if (!this.cell) {
      throw new Error("Cell is not defined.");
    }

    // Calculate current center of mass or geometry
    let centerOfMass = [0, 0, 0];
    for (let i = 0; i < this.positions.length; i++) {
      centerOfMass[0] += this.positions[i][0];
      centerOfMass[1] += this.positions[i][1];
      centerOfMass[2] += this.positions[i][2];
    }
    centerOfMass = centerOfMass.map((x) => x / this.positions.length);

    // Determine target center point
    let targetCenter = [0, 0, 0];
    if (center) {
      targetCenter = center;
    } else {
      for (let i = 0; i < 3; i++) {
        if (axis.includes(i)) {
          targetCenter[i] = this.cell[i][i] / 2;
        }
      }
    }

    // Translate atoms to the target center
    const translationVector = targetCenter.map((x, i) => x - centerOfMass[i]);
    this.translate(...translationVector);

    // Adjust cell size if vacuum padding is specified
    if (vacuum !== null) {
      for (let i = 0; i < 3; i++) {
        if (axis.includes(i)) {
          this.cell[i][i] += 2 * vacuum; // Increase the cell dimension
        }
      }
    }
  }

  deleteAtoms(indices) {
    // Sort the indices in descending order to avoid index shifting
    indices.sort((a, b) => b - a);

    for (const index of indices) {
      if (index >= 0 && index < this.positions.length) {
        this.positions.splice(index, 1); // Remove the atom's position data
        this.symbols.splice(index, 1); // Remove the atom's species index
      }
    }
  }
  replaceAtoms(indices, newSpeciesSymbol) {
    // if newSpeciesSymbol is not in species, add it
    if (!this.species[newSpeciesSymbol]) {
      this.addSpecies(newSpeciesSymbol);
    }
    for (const index of indices) {
      if (index >= 0 && index < this.symbols.length) {
        // Replace the species of the atom at the specified index
        this.symbols[index] = newSpeciesSymbol;
      }
    }
  }
  toDict() {
    const dict = {
      uuid: this.uuid,
      species: {},
      positions: [],
      cell: Array.from(this.cell || []),
      pbc: Array.from(this.pbc),
      symbols: [],
    };

    // Populate species dictionary
    for (const [symbol, specie] of Object.entries(this.species)) {
      dict.species[symbol] = specie.element;
    }

    // Populate positions and symbols
    for (let i = 0; i < this.positions.length; i++) {
      dict.positions.push(Array.from(this.positions[i]));
      dict.symbols.push(this.symbols[i]);
    }

    return dict;
  }
  // Function to calculate fractional coordinates
  calculateFractionalCoordinates() {
    if (this.isUndefinedCell()) {
      throw new Error("Cell matrix is not defined.");
    }
    let matrix = this.cell;
    matrix = matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]));
    const inverseCell = calculateInverseMatrix(matrix);
    return this.positions.map((position) => {
      const fracX = inverseCell[0][0] * position[0] + inverseCell[0][1] * position[1] + inverseCell[0][2] * position[2];
      const fracY = inverseCell[1][0] * position[0] + inverseCell[1][1] * position[1] + inverseCell[1][2] * position[2];
      const fracZ = inverseCell[2][0] * position[0] + inverseCell[2][1] * position[1] + inverseCell[2][2] * position[2];
      return [fracX, fracY, fracZ];
    });
  }

  getAtomsByIndices(indices) {
    const newAtomsData = {
      cell: JSON.parse(JSON.stringify(this.cell)),
      pbc: JSON.parse(JSON.stringify(this.pbc)),
      species: {}, // Shallow copy is usually sufficient for an object of primitives
      symbols: [],
      positions: [],
    };

    // Initialize attributes for the new Atoms instance
    const newAttributes = { atom: {}, species: {} };
    for (const domain in this.attributes) {
      for (const name in this.attributes[domain]) {
        newAttributes[domain][name] = domain === "atom" ? [] : this.attributes[domain][name];
      }
    }

    indices.forEach((index) => {
      if (index < 0 || index >= this.positions.length) {
        throw new Error("Index out of bounds.");
      }
      // Add species and position for each atom
      newAtomsData.symbols.push(this.symbols[index]);
      newAtomsData.positions.push(this.positions[index]);

      // Add attributes for each atom
      for (const name in this.attributes["atom"]) {
        newAttributes["atom"][name].push(this.attributes["atom"][name][index]);
      }
    });
    const species = new Set(newAtomsData.symbols);
    species.forEach((species) => {
      newAtomsData.species[species] = this.species[species].element;
    });

    const newAtoms = new Atoms(newAtomsData);
    newAtoms.attributes = newAttributes;

    return newAtoms;
  }

  getCenterOfGeometry() {
    const center = [0, 0, 0];
    for (let i = 0; i < this.positions.length; i++) {
      center[0] += this.positions[i][0];
      center[1] += this.positions[i][1];
      center[2] += this.positions[i][2];
    }
    center[0] /= this.positions.length;
    center[1] /= this.positions.length;
    center[2] /= this.positions.length;
    return center;
  }

  copy() {
    const newAtomsData = this.toDict();
    const newAtoms = new Atoms(newAtomsData);
    // Copy attributes
    // copy all attributes
    const newAttributes = { atom: {}, species: {} };
    for (const domain in this.attributes) {
      for (const name in this.attributes[domain]) {
        newAttributes[domain][name] = this.attributes[domain][name].slice();
      }
    }
    newAtoms.attributes = newAttributes;
    return newAtoms;
  }
}

export { Species, Atom, Atoms };
