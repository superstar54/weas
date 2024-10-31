import { elementAtomicNumbers } from "./atoms_data.js";
import { convertToMatrixFromABCAlphaBetaGamma, calculateInverseMatrix } from "../utils.js";

class Specie {
  constructor(element) {
    if (!element) {
      throw new Error("Element is required for Specie.");
    }
    this.element = element;
  }

  get element() {
    return this._element;
  }

  set element(value) {
    if (!elementAtomicNumbers[value]) {
      throw new Error(`Element '${value}' is invalid.`);
    }
    this._element = value;
  }

  get number() {
    return elementAtomicNumbers[this.element];
  }
}

class Atom {
  constructor(symbol, position) {
    this.symbol = symbol; // the symbol in the symbols array
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
    attributes = { atom: {}, specie: {} },
  } = {}) {
    this.uuid = null;
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
    this.species = {};
    if (typeof species !== "object") {
      throw new Error("Species should be a dictionary.");
    }
    Object.entries(species).forEach(([symbol, element]) => {
      this.addSpecie(symbol, element);
    });
    if (symbols) {
      const speciesSet = new Set(symbols);
      speciesSet.forEach((s) => {
        if (!this.species[s]) {
          this.addSpecie(s);
        }
      });
    }
  }

  setAttributes(attributes) {
    this.attributes = { atom: {}, specie: {}, "inter-specie": {} };
    for (const domain in attributes) {
      for (const name in attributes[domain]) {
        this.newAttribute(name, attributes[domain][name], domain);
      }
    }
  }

  newAttribute(name, values, domain = "atom") {
    if (domain === "atom") {
      if (values.length !== this.positions.length) {
        throw new Error("The number of values does not match the number of atoms.");
      }
      this.attributes["atom"][name] = JSON.parse(JSON.stringify(values));
    } else if (domain === "specie") {
      for (const key of Object.keys(this.species)) {
        if (!(key in values)) {
          throw new Error(`Value for specie '${key}' is missing.`);
        }
      }
      this.attributes["specie"][name] = JSON.parse(JSON.stringify(values));
    } else if (domain === "inter-specie") {
      this.attributes["inter-specie"][name] = JSON.parse(JSON.stringify(values));
    } else {
      throw new Error('Invalid domain. Must be either "atom", "specie", or "inter-specie".');
    }
  }

  getAttribute(name, domain = "atom") {
    if (domain === "atom") {
      if (name === "positions") {
        return this.positions;
      } else if (name === "symbols") {
        return this.symbols;
      } else if (name === "index") {
        return Array.from({ length: this.positions.length }, (_, i) => i);
      }
      if (!this.attributes["atom"][name]) {
        throw new Error(`Attribute '${name}' is not defined. The available attributes are: ${Object.keys(this.attributes["atom"])}`);
      }
      return this.attributes["atom"][name];
    } else if (domain === "specie") {
      if (!this.attributes["specie"][name]) {
        throw new Error(`Attribute '${name}' is not defined. The available attributes are: ${Object.keys(this.attributes["specie"])}`);
      }
      return this.attributes["specie"][name];
    } else if (domain === "inter-specie") {
      if (!this.attributes[domain][name]) {
        throw new Error(`Attribute '${name}' is not defined in inter-specie domain. The available attributes are: ${Object.keys(this.attributes[domain])}`);
      }
      return this.attributes[domain][name];
    } else {
      throw new Error('Invalid domain. Must be either "atom", "specie", or "inter-specie".');
    }
  }

  setCell(cell) {
    if (cell.length === 9) {
      this.cell = [
        [cell[0], cell[1], cell[2]],
        [cell[3], cell[4], cell[5]],
        [cell[6], cell[7], cell[8]],
      ];
    } else if (cell.length === 6) {
      this.cell = convertToMatrixFromABCAlphaBetaGamma(cell);
    } else if (cell.length === 3) {
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
    return this.cell.some((row) => row.every((cell) => cell === 0));
  }

  getCellLengthsAndAngles() {
    const [a, b, c] = this.cell.map((row) => Math.sqrt(row[0] ** 2 + row[1] ** 2 + row[2] ** 2));
    const alpha = (Math.acos((this.cell[1][0] * this.cell[2][0] + this.cell[1][1] * this.cell[2][1] + this.cell[1][2] * this.cell[2][2]) / (b * c)) * 180) / Math.PI;
    const beta = (Math.acos((this.cell[0][0] * this.cell[2][0] + this.cell[0][1] * this.cell[2][1] + this.cell[0][2] * this.cell[2][2]) / (a * c)) * 180) / Math.PI;
    const gamma = (Math.acos((this.cell[0][0] * this.cell[1][0] + this.cell[0][1] * this.cell[1][1] + this.cell[0][2] * this.cell[1][2]) / (a * b)) * 180) / Math.PI;
    return [a, b, c, alpha, beta, gamma];
  }

  setPBC(pbc) {
    if (typeof pbc === "boolean") {
      pbc = [pbc, pbc, pbc];
    }
    this.pbc = pbc;
  }

  addSpecie(symbol, element = null) {
    // if the specie is already defined, raise an error
    if (this.species[symbol]) {
      throw new Error(`Specie '${symbol}' is already defined.`);
    } else {
      if (!element) {
        element = symbol;
      }
      // if element is a Specie, add it directly
      if (element instanceof Specie) {
        this.species[symbol] = element;
      } else {
        this.species[symbol] = new Specie(element);
      }
    }
  }

  getSymbols() {
    return this.symbols;
  }

  getElements() {
    return this.symbols.map((symbol) => this.species[symbol].element);
  }

  addAtom(atom) {
    if (!this.species[atom.symbol]) {
      throw new Error(`Specie '${atom.symbol}' is not defined.`);
    }
    this.positions.push(atom.position);
    this.symbols.push(atom.symbol);
  }

  removeAtom(index) {
    this.positions.splice(index, 1);
    this.symbols.splice(index, 1);
    // Remove attributes in atom domain
    for (const domain in this.attributes) {
      for (const name in this.attributes["atom"]) {
        this.attributes[domain][name].splice(index, 1);
      }
    }
  }

  getSpeciesCount() {
    return Object.keys(this.species).length;
  }

  getAtomsCount() {
    return this.positions.length;
  }

  add(otherAtoms) {
    // if there same specie symbol, check if the element is the same
    for (const symbol in otherAtoms.species) {
      if (this.species[symbol] && this.species[symbol].element !== otherAtoms.species[symbol].element) {
        throw new Error(`Specie '${symbol}' is defined in both Atoms objects with different elements.`);
      }
    }
    this.species = { ...this.species, ...otherAtoms.species };
    this.positions = [...this.positions, ...otherAtoms.positions];
    this.symbols = [...this.symbols, ...otherAtoms.symbols];
    // Merge attributes in atom domain
    for (const name in this.attributes["atom"]) {
      this.attributes["atom"][name] = [...this.attributes["atom"][name], ...otherAtoms.attributes["atom"][name]];
    }
    // Merge attributes in specie domain
    for (const name in this.attributes["specie"]) {
      this.attributes["specie"][name] = {
        // the order is important, the attributes of the added atoms should not overwrite the original ones
        ...otherAtoms.attributes["specie"][name],
        ...this.attributes["specie"][name],
      };
    }
    return result;
  }

  multiply(mx, my, mz) {
    if (this.isUndefinedCell()) {
      throw new Error("Cell matrix is not defined.");
    }
    const newAtoms = new Atoms();
    newAtoms.species = { ...this.species };

    const [[ax, ay, az], [bx, by, bz], [cx, cy, cz]] = this.cell;
    newAtoms.setCell([
      [ax * mx, ay * mx, az * mx],
      [bx * my, by * my, bz * my],
      [cx * mz, cy * mz, cz * mz],
    ]);

    for (let ix = 0; ix < mx; ix++) {
      for (let iy = 0; iy < my; iy++) {
        for (let iz = 0; iz < mz; iz++) {
          for (let i = 0; i < this.positions.length; i++) {
            const [x, y, z] = this.positions[i];
            const newX = x + ix * this.cell[0][0] + iy * this.cell[1][0] + iz * this.cell[2][0];
            const newY = y + ix * this.cell[0][1] + iy * this.cell[1][1] + iz * this.cell[2][1];
            const newZ = z + ix * this.cell[0][2] + iy * this.cell[1][2] + iz * this.cell[2][2];

            newAtoms.symbols.push(this.symbols[i]);
            newAtoms.positions.push([newX, newY, newZ]);
          }
        }
      }
    }

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
    // copy attributes in specie domain, copy is necessary because the attributes of the added atoms should not overwrite the original ones
    for (const name in this.attributes["specie"]) {
      newAtoms.newAttribute(name, JSON.parse(JSON.stringify(this.attributes["specie"][name])), "specie");
    }
    return newAtoms;
  }

  translate(t) {
    this.positions = this.positions.map(([x, y, z]) => [x + t[0], y + t[1], z + t[2]]);
  }

  rotate(axis, angle, rotate_cell = false) {
    const angleRad = (angle * Math.PI) / 180;
    const norm = Math.sqrt(axis[0] ** 2 + axis[1] ** 2 + axis[2] ** 2);
    const [u, v, w] = [axis[0] / norm, axis[1] / norm, axis[2] / norm];

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

  center(vacuum = 0.0, axis = [0, 1, 2], center = null) {
    if (!this.cell) {
      throw new Error("Cell is not defined.");
    }

    let centerOfMass = [0, 0, 0];
    for (let i = 0; i < this.positions.length; i++) {
      centerOfMass[0] += this.positions[i][0];
      centerOfMass[1] += this.positions[i][1];
      centerOfMass[2] += this.positions[i][2];
    }
    centerOfMass = centerOfMass.map((x) => x / this.positions.length);

    let targetCenter = [0, 0, 0];
    if (center) {
      targetCenter = center;
    } else {
      for (let i = 0; i < 3; i++) {
        if (axis.includes(i)) {
          targetCenter[i] = (this.cell[0][i] + this.cell[1][i] + this.cell[2][i]) / 2;
        }
      }
    }

    const translationVector = targetCenter.map((x, i) => x - centerOfMass[i]);
    this.translate(translationVector);

    if (vacuum !== null) {
      for (let i = 0; i < 3; i++) {
        if (axis.includes(i)) {
          this.cell[i][i] += 2 * vacuum;
        }
      }
    }
  }

  deleteAtoms(indices) {
    if (!Array.isArray(indices)) {
      indices = [indices];
    }
    const indexSet = new Set(indices);
    this.positions = this.positions.filter((_, i) => !indexSet.has(i));
    this.symbols = this.symbols.filter((_, i) => !indexSet.has(i));
    // Remove attributes in atom domain
    for (const domain in this.attributes) {
      for (const name in this.attributes["atom"]) {
        this.attributes[domain][name] = this.attributes[domain][name].filter((_, i) => !indexSet.has(i));
      }
    }
    // Remove specie symbols that are not used anymore and their attributes
    const usedSymbols = new Set(this.symbols);
    for (const symbol in this.species) {
      if (!usedSymbols.has(symbol)) {
        delete this.species[symbol];
        for (const name in this.attributes["specie"]) {
          delete this.attributes["specie"][name][symbol];
        }
      }
    }
  }

  replaceAtoms(indices, newSpecieSymbol, newSpecieElement = null) {
    if (!this.species[newSpecieSymbol]) {
      this.addSpecie(newSpecieSymbol, newSpecieElement);
    }
    for (const index of indices) {
      if (index >= 0 && index < this.symbols.length) {
        this.symbols[index] = newSpecieSymbol;
      } else {
        throw new Error("Index out of bounds.");
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

    for (const [symbol, specie] of Object.entries(this.species)) {
      dict.species[symbol] = specie.element;
    }

    dict.positions = this.positions.map((position) => [...position]);
    dict.symbols = [...this.symbols];

    return dict;
  }

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
      species: {},
      symbols: [],
      positions: [],
    };

    const newAttributes = { atom: {}, specie: {} };
    for (const domain in this.attributes) {
      for (const name in this.attributes[domain]) {
        newAttributes[domain][name] = domain === "atom" ? [] : this.attributes[domain][name];
      }
    }

    indices.forEach((index) => {
      if (index < 0 || index >= this.positions.length) {
        throw new Error("Index out of bounds.");
      }
      newAtomsData.symbols.push(this.symbols[index]);
      newAtomsData.positions.push(this.positions[index]);

      for (const name in this.attributes["atom"]) {
        newAttributes["atom"][name].push(this.attributes["atom"][name][index]);
      }
    });
    const speciesSet = new Set(newAtomsData.symbols);
    speciesSet.forEach((specie) => {
      newAtomsData.species[specie] = this.species[specie].element;
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
    const newAttributes = { atom: {}, specie: {}, "inter-specie": {} };
    for (const domain in this.attributes) {
      for (const name in this.attributes[domain]) {
        newAttributes[domain][name] = JSON.parse(JSON.stringify(this.attributes[domain][name]));
      }
    }
    newAtoms.attributes = newAttributes;
    return newAtoms;
  }
}

export { Specie, Atom, Atoms };
