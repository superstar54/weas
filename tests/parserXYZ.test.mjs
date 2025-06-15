import { parseXYZ, Specie } from "../dist/index.mjs";

describe("parseXYZ", () => {
  it("parses valid XYZ data correctly", () => {
    const xyzString = `3
H2O molecule
O 0.000000 0.000000 0.000000
H 0.000000 0.000000 0.957200
H 0.000000 0.757160 0.482080
`;

    const atoms = parseXYZ(xyzString)[0];

    expect(atoms).toBeDefined();
    expect(atoms.species).toHaveProperty("H");
    expect(atoms.species).toHaveProperty("O");
    expect(atoms.species["H"]).toEqual(new Specie("H"));
    expect(atoms.species["O"]).toEqual(new Specie("O"));
    expect(atoms.positions.length).toBe(3);
    expect(atoms.symbols).toEqual(["O", "H", "H"]);
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
