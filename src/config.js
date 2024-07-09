// Default settings
const defaultViewerSettings = {
  _modelStyle: 0, // Default viz type
  _colorBy: "Element", // Default color by
  _colorType: "CPK",
  _colorRamp: ["red", "blue"],
  _radiusType: "Covalent",
  _materialType: "Standard",
  _atomLabelType: "None",
  _showBondedAtoms: false,
  _showCell: true, // Default show cell
  _boundary: [
    [0, 1],
    [0, 1],
    [0, 1],
  ],
  atomScale: 0.4, // Default atom scale
  backgroundColor: "#ffffff", // Default background color (white)
  logLevel: "warn", // Default log level
};

const defaultGuiConfig = {
  enabled: true,
  components: {
    atomsControl: true,
    colorControl: true,
    cameraControls: true,
    buttons: true,
  },
  buttons: {
    fullscreen: true,
    undo: true,
    redo: true,
    download: true,
    measurement: true,
  },
};

const MODEL_STYLE_MAP = {
  Ball: 0,
  "Ball + Stick": 1,
  Polyhedra: 2,
  Stick: 3,
};

const colorTypes = {
  CPK: "CPK",
  VESTA: "VESTA",
  JMOL: "JMOL",
};

const colorBys = {
  Element: "Element",
  Index: "Index",
  Random: "Random",
  Uniform: "Uniform",
};

const radiusTypes = {
  Covalent: "Covalent",
  VDW: "VDW",
};

export { defaultViewerSettings, defaultGuiConfig, MODEL_STYLE_MAP, colorTypes, colorBys, radiusTypes };
