import { atomsToXYZ, atomsToCIF, Atoms } from "../../dist/index.mjs";

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

function makeCrystalAtoms() {
  return new Atoms({
    symbols: ["Ti", "O", "O"],
    positions: [
      [0, 0, 0],
      [1.5, 1.5, 1.5],
      [2.5, 2.5, 2.5],
    ],
    species: { Ti: "Ti", O: "O" },
    cell: [
      [4.653, 0, 0],
      [0, 4.653, 0],
      [0, 0, 2.969],
    ],
    pbc: [true, true, true],
  });
}

describe("atomsToXYZ", () => {
  it("produces correctly formatted XYZ string", () => {
    const atoms = makeWaterAtoms();
    const xyz = atomsToXYZ(atoms);
    const lines = xyz.split("\n");
    expect(lines[0]).toBe("3");
    expect(lines[1]).toMatch(/Lattice=/);
    expect(lines[1]).toMatch(/pbc=/);
    expect(lines[2]).toMatch(/^O /);
    expect(lines[3]).toMatch(/^H /);
    expect(lines[4]).toMatch(/^H /);
    expect(lines).toHaveLength(5);
  });

  it("includes Lattice and pbc in comment line", () => {
    const atoms = makeWaterAtoms();
    const xyz = atomsToXYZ(atoms);
    const comment = xyz.split("\n")[1];
    expect(comment).toMatch(/Lattice="10\.000000 0\.000000 0\.000000 0\.000000 10\.000000 0\.000000 0\.000000 0\.000000 10\.000000"/);
    expect(comment).toContain('pbc="F F F"');
  });

  it("handles single atoms without cell", () => {
    const atoms = new Atoms({
      symbols: ["He"],
      positions: [[0, 0, 0]],
      species: { He: "He" },
    });
    const xyz = atomsToXYZ(atoms);
    const lines = xyz.split("\n");
    expect(lines[0]).toBe("1");
    expect(lines[2]).toMatch(/^He /);
  });

  it("handles trajectory (array of Atoms)", () => {
    const a1 = makeWaterAtoms();
    const a2 = makeWaterAtoms();
    const xyz = atomsToXYZ([a1, a2]);
    const lines = xyz.split("\n");
    expect(lines[0]).toBe("3");
    expect(lines[5]).toBe("3");
  });

  it("formats numbers with 6 decimal places", () => {
    const atoms = makeWaterAtoms();
    const xyz = atomsToXYZ(atoms);
    expect(xyz).toContain("0.000000");
    expect(xyz).toContain("0.957200");
    expect(xyz).toContain("0.757200");
  });
});

describe("atomsToCIF", () => {
  it("produces correctly formatted CIF string", () => {
    const atoms = makeCrystalAtoms();
    const cif = atomsToCIF(atoms);
    expect(cif).toContain("data_weas");
    expect(cif).toContain("_cell_length_a");
    expect(cif).toContain("_cell_length_b");
    expect(cif).toContain("_cell_length_c");
    expect(cif).toContain("_atom_site_label");
    expect(cif).toContain("_atom_site_type_symbol");
  });

  it("includes correct cell parameters", () => {
    const atoms = makeCrystalAtoms();
    const cif = atomsToCIF(atoms);
    expect(cif).toContain("_cell_length_a 4.653000");
    expect(cif).toContain("_cell_length_b 4.653000");
    expect(cif).toContain("_cell_length_c 2.969000");
    expect(cif).toContain("_cell_angle_alpha 90.000000");
    expect(cif).toContain("_cell_angle_beta 90.000000");
    expect(cif).toContain("_cell_angle_gamma 90.000000");
  });

  it("writes fractional coordinates for structures with cell", () => {
    const atoms = makeCrystalAtoms();
    const cif = atomsToCIF(atoms);
    expect(cif).toContain("_atom_site_fract_x");
    expect(cif).not.toContain("_atom_site_Cartn_x");
  });

  it("writes Cartesian coordinates for structures without cell", () => {
    const atoms = new Atoms({
      symbols: ["He"],
      positions: [[0, 0, 0]],
      species: { He: "He" },
    });
    const cif = atomsToCIF(atoms);
    expect(cif).toContain("_atom_site_Cartn_x");
    expect(cif).not.toContain("_atom_site_fract_x");
  });
});
