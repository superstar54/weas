import { parseXYZ, Species } from "../dist/weas.mjs";

describe("parseXYZ", () => {
  it("parses valid XYZ data correctly", () => {
    const xyzString = `3
H2O molecule
O 0.000000 0.000000 0.000000
H 0.000000 0.000000 0.957200
H 0.000000 0.757160 0.482080
`;

    const atoms = parseXYZ(xyzString)[0];
    console.log("atoms: ", atoms);

    expect(atoms).toBeDefined();
    expect(atoms.kinds).toHaveProperty("H");
    expect(atoms.kinds).toHaveProperty("O");
    expect(atoms.kinds["H"]).toEqual(new Species("H"));
    expect(atoms.kinds["O"]).toEqual(new Species("O"));
    expect(atoms.positions.length).toBe(3);
    expect(atoms.symbols).toEqual(["O", "H", "H"]);
    console.log(atoms.positions[0]);
    expect(Array.from(atoms.positions[0])).toEqual([0, 0, 0]);
    expect(atoms.positions[1]).toEqual([0, 0, 0.9572]);
  });

  it("throws error for invalid XYZ format", () => {
    const invalidXYZString = `Not a valid XYZ file`;

    expect(() => {
      parseXYZ(invalidXYZString);
    }).toThrow("Invalid XYZ file format");
  });
});
