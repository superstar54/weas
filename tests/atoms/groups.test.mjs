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

describe("groups", () => {
  it("listGroups returns empty for no groups", () => {
    const atoms = makeWaterAtoms();
    expect(atoms.listGroups()).toEqual([]);
  });

  it("addAtomsToGroup creates groups attribute", () => {
    const atoms = makeWaterAtoms();
    atoms.addAtomsToGroup([0, 1], "core");
    const groups = atoms.attributes["atom"].groups;
    expect(groups[0]).toContain("core");
    expect(groups[1]).toContain("core");
    expect(groups[2]).toEqual([]);
  });

  it("listGroups returns sorted group names", () => {
    const atoms = makeWaterAtoms();
    atoms.addAtomsToGroup([0], "zeta");
    atoms.addAtomsToGroup([1], "alpha");
    expect(atoms.listGroups()).toEqual(["alpha", "zeta"]);
  });

  it("removeAtomsFromGroup removes the group", () => {
    const atoms = makeWaterAtoms();
    atoms.addAtomsToGroup([0], "core");
    atoms.removeAtomsFromGroup([0], "core");
    expect(atoms.attributes["atom"].groups[0]).toEqual([]);
  });

  it("getGroupIndices returns correct indices", () => {
    const atoms = makeWaterAtoms();
    atoms.addAtomsToGroup([0, 2], "selected");
    expect(atoms.getGroupIndices("selected")).toEqual([0, 2]);
  });

  it("clearGroup removes all atoms from a group", () => {
    const atoms = makeWaterAtoms();
    atoms.addAtomsToGroup([0], "g1");
    atoms.addAtomsToGroup([1], "g1");
    atoms.clearGroup("g1");
    expect(atoms.attributes["atom"].groups[0]).toEqual([]);
    expect(atoms.attributes["atom"].groups[1]).toEqual([]);
  });
});
