import { Specie, Atom, Atoms } from "../dist/weas.mjs";

describe("Specie class", () => {
  it("creates a new Specie instance correctly", () => {
    const species = new Specie("C");
    expect(species.element).toBe("C");
    expect(species.number).toBe(6);
  });
  it("creates a new Specie use only symbol", () => {
    const species = new Specie("C");
    expect(species.element).toBe("C");
    expect(species.number).toBe(6);
  });
  it("throws an error when adding an unknown species", () => {
    const value = "Unknown";
    expect(() => {
      const species = new Specie("Unknown"); // This species does not exist in the atoms instance
    }).toThrowError(`Element '${value}' is invalid.`);
  });
});

describe("Atom class", () => {
  it("creates a new Atom instance correctly", () => {
    const symbol = "H"; // Assuming this refers to an existing symbol
    const position = [1.0, 2.0, 3.0];
    const atom = new Atom(symbol, position);
    expect(atom.symbol).toBe(symbol);
    expect(atom.position).toEqual(position);
  });
});

describe("Atoms class", () => {
  let atoms;

  beforeEach(() => {
    atoms = new Atoms();
  });

  it("initializes an empty Atoms instance", () => {
    expect(atoms.species).toEqual({});
    expect(atoms.symbols).toEqual([]);
    expect(atoms.positions).toEqual([]);
    expect(atoms.cell).toEqual([
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]);
    expect(atoms.pbc).toEqual([true, true, true]);
  });

  it("adds a species correctly", () => {
    atoms.addSpecie("H");
    expect(atoms.species).toHaveProperty("H");
    expect(atoms.species["H"]).toEqual(new Specie("H"));
  });

  // Add more tests for other methods like setCell, addAtom, removeAtom, etc.
  it("calculateFractionalCoordinates returns correct fractional coordinates", () => {
    // Define a cell matrix (use a non-orthorhombic cell for this test)
    const cellMatrix = [
      [10, 4, 0],
      [3, 10, 0],
      [0, 1, 10],
    ];
    // Set the cell matrix
    atoms.setCell(cellMatrix);
    // Add a Cartesian position
    atoms.positions = [[3, 4, 5]];
    // Expected fractional coordinates
    const expectedFractionalCoordinates = [[0.22159091, 0.26136364, 0.5]];
    // Calculate fractional coordinates
    const fractionalCoordinates = atoms.calculateFractionalCoordinates();
    // Check if the calculated fractional coordinates match the expected ones
    expect(fractionalCoordinates[0][0]).toBeCloseTo(expectedFractionalCoordinates[0][0], 3);
  });
});
