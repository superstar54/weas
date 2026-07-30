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

describe("newAttribute", () => {
  it("on atom domain", () => {
    const atoms = makeWaterAtoms();
    atoms.newAttribute("charge", [0, 1, 1], "atom");
    expect(atoms.attributes["atom"]["charge"]).toEqual([0, 1, 1]);
  });

  it("on specie domain", () => {
    const atoms = makeWaterAtoms();
    atoms.newAttribute("color", { O: "#ff0000", H: "#00ff00" }, "specie");
    expect(atoms.attributes["specie"]["color"]).toEqual({ O: "#ff0000", H: "#00ff00" });
  });

  it("sets atom-scope radii", () => {
    const atoms = makeWaterAtoms();
    atoms.newAttribute("radii", [1, 2, 3], "atom");
    expect(atoms.attributes["atom"]["radii"]).toEqual([1, 2, 3]);
  });
});

describe("setSpecies", () => {
  it("with custom symbols", () => {
    const atoms = new Atoms();
    atoms.setSpecies({
      species: { C1: "C", C2: "C" },
      symbols: ["C1", "C1", "C2"],
    });
    expect(atoms.species["C1"].element).toBe("C");
    expect(atoms.species["C2"].element).toBe("C");
  });
});
