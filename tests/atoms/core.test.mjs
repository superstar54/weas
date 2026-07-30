import { Specie, Atom, Atoms } from "../../dist/index.mjs";

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
    expect(() => {
      new Specie("Unknown");
    }).toThrowError("Element 'Unknown' is invalid.");
  });
});

describe("Atom class", () => {
  it("creates a new Atom instance correctly", () => {
    const symbol = "H";
    const position = [1.0, 2.0, 3.0];
    const atom = new Atom(symbol, position);
    expect(atom.symbol).toBe(symbol);
    expect(atom.position).toEqual(position);
  });

  it("copies position array (does not share reference)", () => {
    const pos = [1, 2, 3];
    const atom = new Atom("H", pos);
    pos[0] = 99;
    expect(atom.position[0]).toBe(1);
  });
});

describe("Atoms construction", () => {
  it("initializes an empty Atoms instance", () => {
    const atoms = new Atoms();
    expect(atoms.species).toEqual({});
    expect(atoms.symbols).toEqual([]);
    expect(atoms.positions).toEqual([]);
    expect(atoms.cell).toEqual([
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]);
    expect(atoms.pbc).toEqual([false, false, false]);
  });
});

describe("Atoms toDict", () => {
  it("toDict produces correct dictionary", () => {
    const atoms = makeWaterAtoms();
    const dict = atoms.toDict();
    expect(dict.symbols).toEqual(["O", "H", "H"]);
    expect(dict.positions).toHaveLength(3);
    expect(dict.species).toEqual({ O: "O", H: "H" });
    expect(dict.cell).toEqual([
      [10, 0, 0],
      [0, 10, 0],
      [0, 0, 10],
    ]);
    expect(dict.pbc).toEqual([false, false, false]);
  });

  it("toDict round-trips via new Atoms()", () => {
    const atoms = makeWaterAtoms();
    const dict = atoms.toDict();
    const restored = new Atoms(dict);
    expect(restored.symbols).toEqual(atoms.symbols);
    expect(restored.positions).toEqual(atoms.positions);
    expect(restored.cell).toEqual(atoms.cell);
    expect(restored.pbc).toEqual(atoms.pbc);
    expect(restored.species).toEqual(atoms.species);
  });
});

describe("Atoms accessors", () => {
  it("getSymbols returns symbols array", () => {
    const atoms = makeWaterAtoms();
    expect(atoms.getSymbols()).toEqual(["O", "H", "H"]);
  });

  it("getElements returns element names", () => {
    const atoms = makeWaterAtoms();
    expect(atoms.getElements()).toEqual(["O", "H", "H"]);
  });

  it("getAtomsCount returns correct count", () => {
    const atoms = makeWaterAtoms();
    expect(atoms.getAtomsCount()).toBe(3);
  });

  it("getSpeciesCount returns correct count", () => {
    const atoms = makeWaterAtoms();
    expect(atoms.getSpeciesCount()).toBe(2);
  });
});
