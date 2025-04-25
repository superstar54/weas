import { calculateCartesianCoordinates } from "../../utils.js";
import { radiiData, elementColors } from "../atoms_data.js";
import { Atoms } from "../atoms.js";

class Setting {
  constructor({ element, symbol, radius = 2.0, color = "#3d82ed" }) {
    this.element = element;
    this.symbol = symbol;
    this.color = convertColor(color);
    this.radius = radius;
  }

  toDict() {
    return {
      element: this.element,
      symbol: this.symbol,
      color: this.color,
      radius: this.radius,
    };
  }
}

export class BoundaryManager {
  constructor(viewer) {
    this.viewer = viewer;
    this.scene = this.viewer.tjs.scene;
    this.settings = {};
    this.meshes = {};
    this.init();
  }

  init() {
    /* Initialize the settings from the viewer.atoms
     */
    this.viewer.logger.debug("init atom settings");
    this.settings = {};
    Object.entries(this.viewer.originalAtoms.species).forEach(([symbol, specie]) => {
      this.settings[symbol] = this.getDefaultSetting(symbol, specie);
    });
  }

  getDefaultSetting(symbol, specie) {
    /* Get the default bond setting for the specie1 and specie2 */
    const color = elementColors[this.viewer.colorType][specie.element];
    const radius = radiiData[this.viewer.radiusType][specie.element];
    const setting = new Setting({ element: specie.element, symbol: symbol, radius, color });
    return setting;
  }

  fromSettings(settings) {
    /* Set the bond settings */
    this.settings = {};
    this.clearMeshes();
    // loop over settings to add each setting
    Object.values(settings).forEach((setting) => {
      this.addSetting(setting);
    });
  }

  addSetting({ specie1, specie2, radius, min = 0.0, max = 3.0, color1 = "#3d82ed", color2 = "#3d82ed", order = 1 }) {
    /* Add a new setting to the bond */
    const setting = new Setting({ specie1, specie2, radius, min, max, color1, color2, order });
    const key = specie1 + "-" + specie2;
    this.settings[key] = setting;
  }

  getBoundaryAtoms() {
    // search boundary atoms
    this.viewer.boundaryList = searchBoundary(this.viewer.atoms, this.viewer._boundary);
    this.viewer.logger.debug("boundaryList: ", this.viewer.boundaryList);
    this.viewer.boundaryMap = createBoundaryMapping(this.viewer.boundaryList);
    this.viewer.logger.debug("boundaryMap: ", this.viewer.boundaryMap);
  }
}

export function getImageAtoms(atoms, offsets) {
  // create a new atoms with the boundary atoms
  const imageAtoms = new Atoms();
  imageAtoms.cell = atoms.cell;
  imageAtoms.species = atoms.species;
  const positions = offsets.map((offset) => {
    // Get original position
    const originalPosition = atoms.positions[offset[0]];

    // Calculate matrix-vector product
    const cellOffset = calculateCartesianCoordinates(atoms.cell, [offset[1][0], offset[1][1], offset[1][2]]);

    // Add the original position and the cell offset
    return originalPosition.map((value, index) => value + cellOffset[index]);
  });
  imageAtoms.positions = positions;
  // change fractional positions to cartesian positions
  imageAtoms.symbols = offsets.map((offset) => atoms.symbols[offset[0]]);
  imageAtoms.uuid = atoms.uuid;
  return imageAtoms;
}

export function searchBoundary(
  atoms,
  boundary = [
    [-0.01, 1.01],
    [-0.01, 1.01],
    [-0.01, 1.01],
  ],
) {
  if (atoms.isUndefinedCell()) {
    return [];
  }
  let positions = atoms.positions;
  let species = atoms.species; // Assuming species is a property of atoms

  if (typeof boundary === "number") {
    boundary = [
      [-boundary, 1 + boundary],
      [-boundary, 1 + boundary],
      [-boundary, 1 + boundary],
    ];
  }

  boundary = boundary.map((pair) => pair.map(Number));
  const f = boundary.map((pair) => Math.floor(pair[0]));
  const c = boundary.map((pair) => Math.ceil(pair[1]));
  const ib = [f, c.map((val, i) => val)];
  const M = ib[0].reduce((acc, val, i) => acc * (ib[1][i] - val), 1);

  // Assuming a function to solve matrix (similar to np.linalg.solve)
  positions = atoms.calculateFractionalCoordinates();
  const n = positions.length;
  let npositions = repeatPositions(positions, M - 1);
  let i0 = 0;

  let offsets = [];
  let speciesExtended = [];

  for (let m0 = ib[0][0]; m0 < ib[1][0]; m0++) {
    for (let m1 = ib[0][1]; m1 < ib[1][1]; m1++) {
      for (let m2 = ib[0][2]; m2 < ib[1][2]; m2++) {
        if (m0 === 0 && m1 === 0 && m2 === 0) {
          continue;
        }
        let i1 = i0 + n;
        for (let i = i0; i < i1; i++) {
          npositions[i] = npositions[i].map((val, idx) => val + (idx === 0 ? m0 : idx === 1 ? m1 : m2));
          offsets.push([i % n, [m0, m1, m2]]);
        }
        speciesExtended = speciesExtended.concat(species);
        i0 = i1;
      }
    }
  }

  let ind1 = [];
  for (let i = 0; i < npositions.length; i++) {
    if (
      npositions[i][0] > boundary[0][0] &&
      npositions[i][0] < boundary[0][1] &&
      npositions[i][1] > boundary[1][0] &&
      npositions[i][1] < boundary[1][1] &&
      npositions[i][2] > boundary[2][0] &&
      npositions[i][2] < boundary[2][1]
    ) {
      ind1.push(i);
    }
  }

  let offsets_b = ind1.map((index) => offsets[index]);
  return offsets_b;
}

export function createBoundaryMapping(boundaryList) {
  /*
    include both the index and the boundary offset in the boundaryMap.
    */
  const boundaryMap = {};

  boundaryList.forEach((boundary, index) => {
    const atomIndex = boundary[0];
    const offset = boundary[1];

    if (boundaryMap[atomIndex]) {
      boundaryMap[atomIndex].push({ index: index, offset: offset });
    } else {
      boundaryMap[atomIndex] = [{ index: index, offset: offset }];
    }
  });

  return boundaryMap;
}

function repeatPositions(positions, repeats) {
  let result = [];
  for (let i = 0; i < repeats; i++) {
    for (let j = 0; j < positions.length; j++) {
      result.push([...positions[j]]); // Clone the array to avoid modifying the original
    }
  }
  return result;
}
