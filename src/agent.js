import { ops } from "./operation/operation";
import { normalizeUISchema } from "./core/schemaGUI";

const HELP = `WEAS agent API — drive the editor from the console or a browser-automation agent.

  weas.list(filter?)        -> [{ name, description, category }]   every operation, e.g. "atoms.AddAtomOperation"
  weas.describe(name)       -> { name, description, params }       params are the fields run() accepts
  weas.run(name, params)    -> state()                             executes the op (undoable), returns the new state
  weas.state()              -> { natoms, symbols, positions, cell, pbc, selected }
  weas.select(indices)      -> state()                             set the atom selection (many ops act on it)
  weas.undo() / weas.redo() -> state()
  weas.editor               the raw WEAS instance (escape hatch: editor.avr.atoms, editor.exportState(), ...)

Workflow: list() -> describe(name) -> run(name, params) -> check the returned state.
Positions are Cartesian, in Angstrom. Indices are 0-based.

Example — add a platinum atom 1.5 A along x from atom 0:
  const p = weas.state().positions[0];
  weas.run("atoms.AddAtomOperation", { symbol: "Pt", x: p[0] + 1.5, y: p[1], z: p[2] });`;

function describeField(field) {
  const out = { type: field.type || typeof field.default };
  for (const key of ["min", "max", "step", "default", "label"]) {
    if (field[key] !== undefined) out[key] = field[key];
  }
  if (Array.isArray(field.options)) out.options = field.options;
  else if (field.options && typeof field.options === "object" && typeof field.options !== "function") out.options = field.options;
  else if (field.options) out.options = "dynamic (computed from the current structure)";
  return out;
}

function lookup(name) {
  const [category, opName] = String(name).split(".");
  const OpClass = ops[category]?.[opName];
  if (!OpClass) {
    throw new Error(`Unknown operation '${name}'. Call weas.list() for valid names.`);
  }
  return { category, opName, OpClass };
}

export class AgentAPI {
  constructor(weas) {
    this.editor = weas;
  }

  help() {
    return HELP;
  }

  list(filter = "") {
    const needle = String(filter).toLowerCase();
    const result = [];
    for (const category in ops) {
      for (const opName in ops[category]) {
        const OpClass = ops[category][opName];
        const entry = { name: `${category}.${opName}`, description: OpClass.description || "", category: OpClass.category || category };
        if (!needle || `${entry.name} ${entry.description} ${entry.category}`.toLowerCase().includes(needle)) {
          result.push(entry);
        }
      }
    }
    return result;
  }

  describe(name) {
    const { category, opName, OpClass } = lookup(name);
    const params = {};
    if (OpClass.ui) {
      const { fields } = normalizeUISchema(OpClass.ui);
      for (const key in fields) params[key] = describeField(fields[key]);
    }
    return { name: `${category}.${opName}`, description: OpClass.description || "", params };
  }

  run(name, params = {}) {
    const { category, opName, OpClass } = lookup(name);
    if (category === "Shapes") {
      this.editor.ops.Shapes[opName](params);
      return this.state();
    }
    const op = new OpClass({ ...params, weas: this.editor });
    // Constructor args and UI fields can differ (e.g. AddAtom takes position{} but exposes x/y/z), so apply both.
    const fields = op.getUISchema() ? normalizeUISchema(op.getUISchema()).fields : {};
    const uiParams = Object.fromEntries(Object.entries(params).filter(([key]) => key in fields));
    if (op.validateParams && !op.validateParams({ ...op, ...uiParams })) {
      throw new Error(`Invalid params for '${name}': ${JSON.stringify(params)}. See weas.describe("${name}").`);
    }
    op.applyParams(uiParams);
    this.editor.ops.execute(op);
    return this.state();
  }

  state() {
    const avr = this.editor.avr;
    const atoms = avr.atoms;
    return {
      natoms: atoms.getAtomsCount(),
      symbols: [...atoms.symbols],
      positions: atoms.positions.map((p) => Array.from(p)),
      cell: Array.from(atoms.cell, (row) => Array.from(row)),
      pbc: Array.from(atoms.pbc),
      selected: [...(avr.selectedAtomsIndices || [])],
    };
  }

  select(indices) {
    this.editor.avr.selectedAtomsIndices = [...indices];
    return this.state();
  }

  undo() {
    this.editor.ops.undo();
    return this.state();
  }

  redo() {
    this.editor.ops.redo();
    return this.state();
  }
}
