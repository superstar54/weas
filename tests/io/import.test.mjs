import { parseStructureText, parseXYZ, atomsToXYZ, Atoms } from "../../dist/index.mjs";

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

describe("parseStructureText", () => {
  it("parses .xyz extension", () => {
    const text = "3\ncomment\nO 0 0 0\nH 0 0 1\nH 0 1 0\n";
    const result = parseStructureText(text, ".xyz");
    expect(result.kind).toBe("atoms");
    expect(result.data[0].symbols).toHaveLength(3);
  });

  it("parses .cif extension", () => {
    const text = `data_test
_cell_length_a 10
_cell_length_b 10
_cell_length_c 10
_cell_angle_alpha 90
_cell_angle_beta 90
_cell_angle_gamma 90
_symmetry_space_group_name_H-M 'P 1'
loop_
_symmetry_equiv_pos_site_id
_symmetry_equiv_pos_as_xyz
1 'x, y, z'
loop_
_atom_site_type_symbol
_atom_site_label
_atom_site_fract_x
_atom_site_fract_y
_atom_site_fract_z
_atom_site_occupancy
H H1 1 0 0 0 1
`;
    const result = parseStructureText(text, ".cif");
    expect(result.kind).toBe("atoms");
    expect(result.data.symbols).toHaveLength(1);
  });

  it("parses .on extension as JSON", () => {
    const atoms = makeWaterAtoms();
    const snapshot = { version: "weas_state_v1", atoms: atoms.toDict(), state: {}, currentFrame: 0 };
    const json = JSON.stringify(snapshot);
    const result = parseStructureText(json, "on");
    expect(result.kind).toBe("json");
  });

  it("throws on unsupported extension", () => {
    expect(() => parseStructureText("content", ".txt")).toThrow();
  });
});

describe("XYZ round-trip", () => {
  it("atomsToXYZ -> parseXYZ produces equivalent atoms", () => {
    const original = makeWaterAtoms();
    const xyz = atomsToXYZ(original);
    const parsed = parseXYZ(xyz)[0];
    expect(parsed.symbols).toEqual(original.symbols);
    expect(parsed.positions[0]).toEqual(original.positions[0]);
    expect(parsed.positions[1][0]).toBeCloseTo(original.positions[1][0], 5);
    expect(parsed.positions[1][1]).toBeCloseTo(original.positions[1][1], 5);
    expect(parsed.positions[1][2]).toBeCloseTo(original.positions[1][2], 5);
  });

  it("preserves lattice and pbc through XYZ round-trip", () => {
    const original = makeWaterAtoms();
    const xyz = atomsToXYZ(original);
    const parsed = parseXYZ(xyz)[0];
    expect(parsed.cell).toEqual(original.cell);
    expect(parsed.pbc).toEqual(original.pbc);
  });
});
