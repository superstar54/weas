import { Atoms } from "../atoms/atoms.js";

// Regex helpers for extxyz key=value parsing
const KV_PAIR = /([A-Za-z_][A-Za-z0-9_-]*)\s*=\s*("[^"]*"|'[^']*'|\{[^}]*\}|\S+)/g;

function unquote(value) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  } else if (value.startsWith("{") && value.endsWith("}")) {
    return value.slice(1, -1);
  }
  return value;
}

function parseExtHeader(header) {
  const info = {};
  let match;
  while ((match = KV_PAIR.exec(header)) !== null) {
    const key = match[1];
    let val = unquote(match[2]);
    // parse numbers or arrays
    if (/^[\d.+\-eE,\s]+$/.test(val)) {
      const parts = val.split(/[ ,]+/).map(Number);
      val = parts.length > 1 ? parts : parts[0];
    }
    info[key] = val;
  }
  return info;
}

function parseXYZ(xyzString) {
  const lines = xyzString.trim().split("\n");
  let currentLine = 0;
  const frames = [];

  while (currentLine < lines.length) {
    const line = lines[currentLine].trim();
    if (!line) {
      currentLine++;
      continue;
    }
    const atomCount = parseInt(line);
    currentLine++;
    if (isNaN(atomCount) || currentLine + atomCount > lines.length) {
      throw new Error("Invalid XYZ file format");
    }
    // comment or extended header
    const header = lines[currentLine++].trim();
    const info = header.includes("=") ? parseExtHeader(header) : {};

    // init frame data
    const frameData = { symbols: [], positions: [], attributes: { atom: {} } };

    // handle lattice and pbc
    let cell = null;
    if (info.Lattice) {
      const arr = Array.isArray(info.Lattice) ? info.Lattice : info.Lattice.split(/[ ,]+/).map(Number);
      cell = [
        [arr[0], arr[1], arr[2]],
        [arr[3], arr[4], arr[5]],
        [arr[6], arr[7], arr[8]],
      ];
    }
    if (cell) frameData.cell = cell;
    if (info.pbc) {
      const pbcArr = Array.isArray(info.pbc) ? info.pbc : typeof info.pbc === "string" ? info.pbc.split(/[ ,]+/).map((v) => v === "T" || v === "true") : [!!info.pbc];
      frameData.pbc = pbcArr;
    }

    // determine properties order for per-atom columns
    let propsOrder = ["species", "pos"];
    if (info.Properties) {
      // parse Properties string: e.g. species:S:1:pos:R:3:vel:R:3
      const fields = info.Properties.split(":");
      propsOrder = [];
      for (let i = 0; i < fields.length; i += 3) {
        const name = fields[i];
        const ncol = parseInt(fields[i + 2], 10);
        propsOrder.push({ name, ncol });
      }
    } else {
      propsOrder = [
        { name: "species", ncol: 1 },
        { name: "pos", ncol: 3 },
      ];
    }

    // prepare storage for other per-atom props
    propsOrder.forEach((prop) => {
      if (!["species", "pos"].includes(prop.name)) {
        frameData.attributes.atom[prop.name] = Array(atomCount)
          .fill(null)
          .map(() => []);
      }
    });

    // parse atoms
    for (let i = 0; i < atomCount; i++, currentLine++) {
      const parts = lines[currentLine].trim().split(/\s+/);
      let idx = 0;
      let symbol;
      let x, y, z;
      propsOrder.forEach((prop) => {
        const vals = parts.slice(idx, idx + prop.ncol);
        idx += prop.ncol;
        if (prop.name === "species") {
          symbol = vals[0];
        } else if (prop.name === "pos") {
          [x, y, z] = vals.map(parseFloat);
        } else {
          // other per-atom property
          const parsed = vals.map((v) => (isNaN(v) ? v : +v));
          frameData.attributes.atom[prop.name][i] = prop.ncol === 1 ? parsed[0] : parsed;
        }
      });
      frameData.symbols.push(symbol);
      frameData.positions.push([x, y, z]);
    }

    // Create an Atoms instance for the current frame and add it to frames
    const atoms = new Atoms(frameData);
    frames.push(atoms);
  }
  return frames;
}

export { parseXYZ };
