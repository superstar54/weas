import { buildExportPayload } from "../../src/io/structure.js";
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

function createMockWeas(atoms) {
  return {
    exportState() {
      return {
        version: "weas_state_v1",
        atoms: atoms.toDict(),
        state: {
          viewer: { modelStyle: 1 },
          bond: {},
          plugins: {},
          camera: { position: [0, 0, 5], target: [0, 0, 0] },
          animation: { currentFrame: 0, isPlaying: false, frameDuration: 100 },
          materials: null,
        },
        currentFrame: 0,
      };
    },
    avr: {
      trajectory: [atoms],
      atoms: atoms,
    },
  };
}

describe("buildExportPayload (json format)", () => {
  it("returns JSON payload with version", () => {
    const atoms = makeWaterAtoms();
    const weas = createMockWeas(atoms);
    const payload = buildExportPayload(weas, "json");
    expect(payload.mimeType).toBe("application/json");
    const parsed = JSON.parse(payload.text);
    expect(parsed.version).toBe("weas_state_v1");
  });

  it("output filename is 'weas-stateon' (missing .json extension)", () => {
    const atoms = makeWaterAtoms();
    const weas = createMockWeas(atoms);
    const payload = buildExportPayload(weas, "json");
    expect(payload.filename).toBe("weas-stateon");
  });
});

describe("buildExportPayload (html format)", () => {
  it("returns HTML with DOCTYPE", () => {
    const atoms = makeWaterAtoms();
    const weas = createMockWeas(atoms);
    const payload = buildExportPayload(weas, "html");
    expect(payload.filename).toBe("weas-viewer.html");
    expect(payload.mimeType).toBe("text/html");
    expect(payload.text).toContain("<!doctype html>");
    expect(payload.text).toContain("weas_state_v1");
  });
});

describe("buildExportPayload (xyz format)", () => {
  it("returns valid XYZ payload", () => {
    const atoms = makeWaterAtoms();
    const weas = createMockWeas(atoms);
    const payload = buildExportPayload(weas, "xyz");
    expect(payload.filename).toBe("structure.xyz");
    expect(payload.mimeType).toBe("chemical/x-xyz");
    expect(payload.text).toContain("3");
  });
});

describe("buildExportPayload (cif format)", () => {
  it("returns valid CIF payload", () => {
    const atoms = makeCrystalAtoms();
    const weas = createMockWeas(atoms);
    const payload = buildExportPayload(weas, "cif");
    expect(payload.filename).toBe("structure.cif");
    expect(payload.mimeType).toBe("chemical/x-cif");
    expect(payload.text).toContain("data_weas");
    expect(payload.text).toContain("_cell_length_a");
  });
});

describe("buildExportPayload (unknown format)", () => {
  it("throws on unknown format", () => {
    const atoms = makeWaterAtoms();
    const weas = createMockWeas(atoms);
    expect(() => buildExportPayload(weas, "txt")).toThrow("Unsupported export format: txt");
  });
});
