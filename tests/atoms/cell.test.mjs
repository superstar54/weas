import { Atoms } from "../../dist/index.mjs";

describe("setCell", () => {
  let atoms;
  beforeEach(() => { atoms = new Atoms(); });

  it("setCell with 3x3 matrix", () => {
    const matrix = [
      [1, 0, 0],
      [0, 2, 0],
      [0, 0, 3],
    ];
    atoms.setCell(matrix);
    expect(atoms.cell).toEqual(matrix);
  });

  it("setCell with 6-element abc+angles", () => {
    atoms.setCell([5, 5, 5, 90, 90, 90]);
    expect(atoms.cell[0][0]).toBeCloseTo(5);
    expect(atoms.cell[1][1]).toBeCloseTo(5);
    expect(atoms.cell[2][2]).toBeCloseTo(5);
  });

  it("setCell with 3-element lengths, default 90 angles", () => {
    atoms.setCell([3, 4, 5]);
    expect(atoms.cell[0][0]).toBeCloseTo(3);
    expect(atoms.cell[1][1]).toBeCloseTo(4);
    expect(atoms.cell[2][2]).toBeCloseTo(5);
  });
});

describe("setPBC", () => {
  let atoms;
  beforeEach(() => { atoms = new Atoms(); });

  it("accepts boolean (sets all three axes)", () => {
    atoms.setPBC(true);
    expect(atoms.pbc).toEqual([true, true, true]);
  });

  it("accepts array", () => {
    atoms.setPBC([true, false, true]);
    expect(atoms.pbc).toEqual([true, false, true]);
  });
});

describe("isUndefinedCell", () => {
  let atoms;
  beforeEach(() => { atoms = new Atoms(); });

  it("returns true for zero cell", () => {
    expect(atoms.isUndefinedCell()).toBe(true);
  });

  it("returns false for non-zero cell", () => {
    atoms.setCell([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]);
    expect(atoms.isUndefinedCell()).toBe(false);
  });
});

describe("getCellLengthsAndAngles", () => {
  it("returns correct values for orthorhombic cell", () => {
    const atoms = new Atoms();
    atoms.setCell([
      [10, 0, 0],
      [0, 20, 0],
      [0, 0, 30],
    ]);
    const [a, b, c, alpha, beta, gamma] = atoms.getCellLengthsAndAngles();
    expect(a).toBeCloseTo(10);
    expect(b).toBeCloseTo(20);
    expect(c).toBeCloseTo(30);
    expect(alpha).toBeCloseTo(90);
    expect(beta).toBeCloseTo(90);
    expect(gamma).toBeCloseTo(90);
  });
});

describe("calculateFractionalCoordinates", () => {
  it("returns correct fractional coordinates", () => {
    const atoms = new Atoms();
    const cellMatrix = [
      [10, 4, 0],
      [3, 10, 0],
      [0, 1, 10],
    ];
    atoms.setCell(cellMatrix);
    atoms.positions = [[3, 4, 5]];
    const expected = [[0.22159091, 0.26136364, 0.5]];
    const fractional = atoms.calculateFractionalCoordinates();
    expect(fractional[0][0]).toBeCloseTo(expected[0][0], 3);
  });
});
