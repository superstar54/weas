// Default settings
const defaultViewerSettings = {
  modelStyle: 0, // Default viz type
  colorBy: "Element", // Default color by
  colorType: "JMOL",
  colorRamp: ["red", "blue"],
  radiusType: "Covalent",
  materialType: "Standard",
  atomLabelType: "None",
  showBondedAtoms: false,
  bondSettings: {
    hideLongBonds: true,
    showHydrogenBonds: false,
    showOutBoundaryBonds: false,
  },
  cellSettings: {
    showCell: true, // Show unit cell
    showAxes: true, // Show cell axes
    cellColor: 0x000000, // Default cell line color (black)
    cellLineWidth: 2, // Default line width
    axisColors: { a: 0xff0000, b: 0x00ff00, c: 0x0000ff }, // RGB colors for axes
    axisRadius: 0.15, // Default axis cylinder radius
    axisConeHeight: 0.8, // Cone height for axis arrows
    axisConeRadius: 0.3, // Cone radius for axis arrows
    axisSphereRadius: 0.3, // Sphere radius at the cell origin
  },
  boundary: [
    [0, 1],
    [0, 1],
    [0, 1],
  ],
  atomScale: 0.4, // Default atom scale
  backgroundColor: "#ffffff", // Default background color (white)
  logLevel: "warn", // Default log level
  continuousUpdate: true, // Default continuous update
};

const defaultGuiConfig = {
  controls: {
    enabled: true,
    atomsControl: true,
    colorControl: true,
    cameraControls: true,
  },
  timeline: {
    enabled: true, // Added this line to control timeline visibility
  },
  legend: {
    enabled: false,
    position: "bottom-right", // Options: 'top-right', 'top-left', 'bottom-right', 'bottom-left'
  },
  buttons: {
    enabled: true,
    fullscreen: true,
    undo: true,
    redo: true,
    download: true,
    measurement: true,
  },
  buttonStyle: {
    // Added this object to allow button style customization
    fontSize: "12px",
    color: "black",
    backgroundColor: "transparent",
    border: "none",
    padding: "1px",
    cursor: "pointer",
    borderRadius: "1px",
  },
};

const MODEL_STYLE_MAP = {
  Ball: 0,
  "Ball + Stick": 1,
  Polyhedra: 2,
  Stick: 3,
  Line: 4,
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
