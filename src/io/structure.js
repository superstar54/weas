import { Atoms } from "../atoms/atoms.js";
import { parseXYZ } from "./parserXYZ.js";
import { parseCIF } from "./parserCif.js";

function formatNumber(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "0";
  }
  return value.toFixed(6);
}

function atomsToXYZ(atomsOrTrajectory) {
  const frames = Array.isArray(atomsOrTrajectory) ? atomsOrTrajectory : [atomsOrTrajectory];
  const lines = [];
  frames.forEach((atoms) => {
    const count = atoms.positions.length;
    lines.push(String(count));
    const header = [];
    if (!atoms.isUndefinedCell()) {
      const lattice = atoms.cell
        .flat()
        .map((v) => formatNumber(v))
        .join(" ");
      header.push(`Lattice="${lattice}"`);
    }
    if (Array.isArray(atoms.pbc)) {
      const pbc = atoms.pbc.map((v) => (v ? "T" : "F")).join(" ");
      header.push(`pbc="${pbc}"`);
    }
    header.push("Properties=species:S:1:pos:R:3");
    lines.push(header.join(" "));
    for (let i = 0; i < count; i += 1) {
      const symbol = atoms.symbols[i];
      const [x, y, z] = atoms.positions[i];
      lines.push(`${symbol} ${formatNumber(x)} ${formatNumber(y)} ${formatNumber(z)}`);
    }
  });
  return lines.join("\n");
}

function atomsToCIF(atoms) {
  const useFractional = !atoms.isUndefinedCell();
  const [a, b, c, alpha, beta, gamma] = useFractional ? atoms.getCellLengthsAndAngles() : [1, 1, 1, 90, 90, 90];
  const coords = useFractional ? atoms.calculateFractionalCoordinates() : atoms.positions;
  const lines = [
    "data_weas",
    "_symmetry_space_group_name_H-M 'P 1'",
    "_symmetry_Int_Tables_number 1",
    `_cell_length_a ${formatNumber(a)}`,
    `_cell_length_b ${formatNumber(b)}`,
    `_cell_length_c ${formatNumber(c)}`,
    `_cell_angle_alpha ${formatNumber(alpha)}`,
    `_cell_angle_beta ${formatNumber(beta)}`,
    `_cell_angle_gamma ${formatNumber(gamma)}`,
    "loop_",
    "_atom_site_label",
    "_atom_site_type_symbol",
  ];
  if (useFractional) {
    lines.push("_atom_site_fract_x", "_atom_site_fract_y", "_atom_site_fract_z");
  } else {
    lines.push("_atom_site_Cartn_x", "_atom_site_Cartn_y", "_atom_site_Cartn_z");
  }
  for (let i = 0; i < atoms.symbols.length; i += 1) {
    const symbol = atoms.symbols[i];
    const [x, y, z] = coords[i];
    const label = `${symbol}${i + 1}`;
    lines.push(`${label} ${symbol} ${formatNumber(x)} ${formatNumber(y)} ${formatNumber(z)}`);
  }
  return lines.join("\n");
}

function downloadText(text, filename, mimeType = "text/plain") {
  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function parseStructureText(text, extension) {
  const ext = extension.toLowerCase();
  if (ext === ".xyz") {
    return { kind: "atoms", data: parseXYZ(text) };
  }
  if (ext === ".cif") {
    return { kind: "atoms", data: parseCIF(text) };
  }
  if (ext === ".json") {
    return { kind: "json", data: JSON.parse(text) };
  }
  throw new Error(`Unsupported file extension: ${extension}`);
}

function applyStructurePayload(weas, payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid structure payload.");
  }
  if (payload.version || payload.atoms) {
    weas.importState(payload);
    return;
  }
  if (Array.isArray(payload)) {
    const frames = payload.map((item) => (item instanceof Atoms ? item : new Atoms(item)));
    weas.avr.atoms = frames;
    return;
  }
  if (payload instanceof Atoms) {
    weas.avr.atoms = payload;
    return;
  }
  if (payload.symbols && payload.positions) {
    weas.avr.atoms = new Atoms(payload);
    return;
  }
  throw new Error("Unrecognized structure payload.");
}

function buildExportPayload(weas, format) {
  const normalized = String(format || "").toLowerCase();
  if (normalized === "html") {
    const snapshot = weas.exportState();
    const json = JSON.stringify(snapshot, null, 2);
    const safeJson = json.replace(/<\/(script)/gi, "<\\/$1");
    const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>WEAS Viewer</title>
  </head>
  <body>
    <div id="viewer" style="position: relative; width: 100%; height: 800px"></div>
    <script type="module">
      import { WEAS } from "https://unpkg.com/weas@0.2.8/dist/index.mjs";
      const domElement = document.getElementById("viewer");
      const editor = new WEAS({ domElement });
      const snapshot = ${safeJson};
      editor.importState(snapshot);
      editor.render();
    </script>
  </body>
</html>
`;
    return {
      text: html,
      filename: "weas-viewer.html",
      mimeType: "text/html",
    };
  }
  if (normalized === "json") {
    return {
      text: JSON.stringify(weas.exportState(), null, 2),
      filename: "weas-state.json",
      mimeType: "application/json",
    };
  }
  if (normalized === "xyz") {
    const atoms = Array.isArray(weas.avr.trajectory) && weas.avr.trajectory.length > 1 ? weas.avr.trajectory : weas.avr.atoms;
    return {
      text: atomsToXYZ(atoms),
      filename: "structure.xyz",
      mimeType: "chemical/x-xyz",
    };
  }
  if (normalized === "cif") {
    return {
      text: atomsToCIF(weas.avr.atoms),
      filename: "structure.cif",
      mimeType: "chemical/x-cif",
    };
  }
  throw new Error(`Unsupported export format: ${format}`);
}

export { atomsToXYZ, atomsToCIF, parseStructureText, applyStructurePayload, buildExportPayload, downloadText };
