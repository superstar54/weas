import { Specie, Atoms } from "../../dist/index.mjs";

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

describe("addSpecie", () => {
  let atoms;
  beforeEach(() => { atoms = new Atoms(); });

  it("adds a species correctly", () => {
    atoms.addSpecie("H");
    expect(atoms.species).toHaveProperty("H");
    expect(atoms.species["H"]).toEqual(new Specie("H"));
  });

  it("addSpecie with element parameter", () => {
    atoms.addSpecie("C1", "C");
    expect(atoms.species["C1"].element).toBe("C");
  });

  it("addSpecie re-uses symbol as element if not provided", () => {
    atoms.addSpecie("Fe");
    expect(atoms.species["Fe"].element).toBe("Fe");
  });

  it("addSpecie throws if symbol already defined", () => {
    atoms.addSpecie("H");
    expect(() => atoms.addSpecie("H")).toThrow();
  });
});

describe("addAtom", () => {
  let atoms;
  beforeEach(() => { atoms = new Atoms(); });

  it("addAtom appends atom", () => {
    atoms.addSpecie("H");
    atoms.addAtom({ symbol: "H", position: [1, 2, 3] });
    expect(atoms.positions).toHaveLength(1);
    expect(atoms.symbols).toEqual(["H"]);
    expect(atoms.positions[0]).toEqual([1, 2, 3]);
  });

  it("addAtom throws if species not defined", () => {
    expect(() => atoms.addAtom({ symbol: "X", position: [0, 0, 0] })).toThrow();
  });
});

describe("removeAtom / deleteAtoms", () => {
  it("removeAtom removes by index", () => {
    const atoms = makeWaterAtoms();
    atoms.removeAtom(1);
    expect(atoms.positions).toHaveLength(2);
    expect(atoms.symbols).toEqual(["O", "H"]);
  });

  it("deleteAtoms removes multiple by indices", () => {
    const atoms = makeWaterAtoms();
    atoms.deleteAtoms({ indices: [0, 2] });
    expect(atoms.positions).toHaveLength(1);
    expect(atoms.symbols).toEqual(["H"]);
  });

  it("deleteAtoms cleans up unused species", () => {
    const atoms = new Atoms({
      symbols: ["O", "H"],
      positions: [[0, 0, 0], [1, 0, 0]],
      species: { O: "O", H: "H" },
    });
    atoms.deleteAtoms({ indices: [1] });
    expect(atoms.species).not.toHaveProperty("H");
  });
});

describe("replaceAtoms", () => {
  it("replaces symbol for given indices", () => {
    const atoms = makeWaterAtoms();
    atoms.replaceAtoms({ indices: [1, 2], newSpecieSymbol: "N" });
    expect(atoms.symbols).toEqual(["O", "N", "N"]);
  });

  it("auto-adds new species if needed", () => {
    const atoms = makeWaterAtoms();
    atoms.replaceAtoms({ indices: [1], newSpecieSymbol: "D", newSpecieElement: "H" });
    expect(atoms.species).toHaveProperty("D");
    expect(atoms.symbols[1]).toBe("D");
  });
});
