import { Atoms } from "../../dist/index.mjs";

function makeWaterAtoms() {
  return new Atoms({
    symbols: ["O", "H", "H"],
    positions: [
      [0, 0, 0],
      [0, 0, 0.9572],
      [0, 0.7572, 0.4821],
    ],
    species: { O: "O", H: "H" },
    cell: [
      [10, 0, 0],
      [0, 10, 0],
      [0, 0, 10],
    ],
    pbc: [false, false, false],
  });
}

describe("translate", () => {
  it("translates all positions", () => {
    const atoms = makeWaterAtoms();
    atoms.translate({ vector: [1, 2, 3] });
    expect(atoms.positions[0]).toEqual([1, 2, 3]);
    expect(atoms.positions[1][0]).toBeCloseTo(1);
    expect(atoms.positions[1][1]).toBeCloseTo(2);
    expect(atoms.positions[1][2]).toBeCloseTo(3.9572, 4);
  });
});

describe("rotate", () => {
  it("rotates positions around Z axis", () => {
    const atoms = new Atoms({
      symbols: ["H"],
      positions: [[1, 0, 0]],
      species: { H: "H" },
    });
    atoms.rotate([0, 0, 1], 90);
    expect(atoms.positions[0][0]).toBeCloseTo(0, 5);
    expect(atoms.positions[0][1]).toBeCloseTo(1, 5);
  });
});

describe("multiply", () => {
  it("creates a supercell", () => {
    const atoms = makeWaterAtoms();
    const supercell = atoms.multiply(2, 1, 1);
    expect(supercell.positions).toHaveLength(6);
    expect(supercell.cell[0][0]).toBeCloseTo(20);
  });

  it("throws for undefined cell", () => {
    const atoms = new Atoms();
    expect(() => atoms.multiply(2, 1, 1)).toThrow();
  });
});

describe("copy", () => {
  it("produces an independent clone", () => {
    const atoms = makeWaterAtoms();
    const copied = atoms.copy();
    expect(copied.symbols).toEqual(atoms.symbols);
    copied.symbols[0] = "C";
    expect(atoms.symbols[0]).toBe("O");
  });

  it("preserves attributes", () => {
    const atoms = makeWaterAtoms();
    atoms.newAttribute("charge", [0, 1, 1], "atom");
    const copied = atoms.copy();
    expect(copied.attributes["atom"]["charge"]).toEqual([0, 1, 1]);
  });
});

describe("add (merge)", () => {
  it("merges two Atoms objects", () => {
    const atoms = makeWaterAtoms();
    const other = new Atoms({
      symbols: ["He"],
      positions: [[5, 5, 5]],
      species: { He: "He" },
    });
    atoms.add(other);
    expect(atoms.positions).toHaveLength(4);
    expect(atoms.symbols).toEqual(["O", "H", "H", "He"]);
  });
});

describe("getAtomsByIndices", () => {
  it("returns subset as new Atoms", () => {
    const atoms = makeWaterAtoms();
    const subset = atoms.getAtomsByIndices({ indices: [1, 2] });
    expect(subset.positions).toHaveLength(2);
    expect(subset.symbols).toEqual(["H", "H"]);
  });

  it("throws for out of range", () => {
    const atoms = makeWaterAtoms();
    expect(() => atoms.getAtomsByIndices({ indices: [0, 99] })).toThrow();
  });
});

describe("getCenterOfGeometry", () => {
  it("returns center for symmetric atoms", () => {
    const atoms = new Atoms({
      symbols: ["H", "H"],
      positions: [[-1, 0, 0], [1, 0, 0]],
      species: { H: "H" },
    });
    const center = atoms.getCenterOfGeometry();
    expect(center[0]).toBeCloseTo(0);
    expect(center[1]).toBeCloseTo(0);
    expect(center[2]).toBeCloseTo(0);
  });
});
