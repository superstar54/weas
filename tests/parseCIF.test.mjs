import { parseCIF } from "../dist/index.mjs";

describe("parseCIF with TiO2 CIF data", () => {
  test("correctly parses TiO2 CIF data and returns an Atoms instance with correct properties", () => {
    const mockCifString = `
            # TiO2
            data_TiO2
            _symmetry_space_group_name_H-M   P4_2/mnm
            _cell_length_a   4.65327231
            _cell_length_b   4.65327231
            _cell_length_c   2.96920288
            _cell_angle_alpha   90.00000000
            _cell_angle_beta   90.00000000
            _cell_angle_gamma   90.00000000
            _symmetry_Int_Tables_number   136
            _chemical_formula_structural   TiO2
            _chemical_formula_sum   'Ti2 O4'
            _cell_volume   64.29198128
            _cell_formula_units_Z   2
            loop_
             _symmetry_equiv_pos_site_id
             _symmetry_equiv_pos_as_xyz
              1  'x, y, z'
              2  '-x, -y, -z'
              3  '-y+1/2, x+1/2, z+1/2'
              4  'y+1/2, -x+1/2, -z+1/2'
              5  '-x, -y, z'
              6  'x, y, -z'
              7  'y+1/2, -x+1/2, z+1/2'
              8  '-y+1/2, x+1/2, -z+1/2'
              9  'x+1/2, -y+1/2, -z+1/2'
              10  '-x+1/2, y+1/2, z+1/2'
              11  '-y, -x, -z'
              12  'y, x, z'
              13  '-x+1/2, y+1/2, -z+1/2'
              14  'x+1/2, -y+1/2, z+1/2'
              15  'y, x, -z'
              16  '-y, -x, z'
            loop_
             _atom_site_type_symbol
             _atom_site_label
             _atom_site_symmetry_multiplicity
             _atom_site_fract_x
             _atom_site_fract_y
             _atom_site_fract_z
             _atom_site_occupancy
              Ti  Ti1  2  0.000000  0.000000  0.000000  1
              O  O2  4  0.195420  0.804580  0.500000  1
        `;

    const atoms = parseCIF(mockCifString);
    // number of atoms is 6
    expect(atoms.symbols.length).toBe(6);
    // the unit cell is correctly parsed
    expect(atoms.cell).toEqual([
      [4.65327231, 0, 0],
      [2.849307520001255e-16, 4.65327231, 0],
      [1.8181124015055515e-16, 1.8181124015055515e-16, 2.96920288],
    ]);
    // the atom positions are correctly parsed
    expect(atoms.positions).toEqual([
      [0, 0, 0],
      [2.326636155, 2.326636155, 1.48460144],
      [0.9093424748202, 3.7439298351798005, 1.48460144],
      [3.7439298351798, 0.9093424748202004, 1.48460144],
      [3.2359786298202002, 3.2359786298202, 0],
      [1.4172936801798004, 1.4172936801798004, 0],
    ]);
    // the atom symbols are correctly parsed
    expect(atoms.symbols).toEqual(["Ti", "Ti", "O", "O", "O", "O"]);
  });
});
