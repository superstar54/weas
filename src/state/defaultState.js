import { defaultViewerSettings } from "../config.js";
import { cloneValue } from "./store.js";

function createDefaultState() {
  const viewerDefaults = cloneValue(defaultViewerSettings);
  return {
    viewer: {
      modelStyle: viewerDefaults.modelStyle,
      colorBy: viewerDefaults.colorBy,
      colorType: viewerDefaults.colorType,
      colorRamp: viewerDefaults.colorRamp,
      radiusType: viewerDefaults.radiusType,
      materialType: viewerDefaults.materialType,
      atomLabelType: viewerDefaults.atomLabelType,
      showBondedAtoms: viewerDefaults.showBondedAtoms,
      boundary: viewerDefaults.boundary,
      atomScale: viewerDefaults.atomScale,
      atomScales: [],
      modelSticks: [],
      modelPolyhedras: [],
      backgroundColor: viewerDefaults.backgroundColor,
      continuousUpdate: viewerDefaults.continuousUpdate,
      selectedAtomsIndices: [],
    },
    cell: cloneValue(viewerDefaults.cellSettings),
    bond: {
      settings: {},
      hideLongBonds: viewerDefaults.bondSettings.hideLongBonds,
      showHydrogenBonds: viewerDefaults.bondSettings.showHydrogenBonds,
      showOutBoundaryBonds: viewerDefaults.bondSettings.showOutBoundaryBonds,
    },
    plugins: {
      isosurface: { settings: {} },
      volumeSlice: { settings: {} },
      vectorField: { settings: {}, show: true },
      highlight: {
        settings: {
          selection: { indices: [], scale: 1.1, type: "sphere", color: "#ffff00" },
        },
      },
      atomLabel: { settings: [] },
      polyhedra: { settings: [] },
      measurement: { settings: {} },
      species: { settings: {} },
      anyMesh: { settings: [] },
      instancedMeshPrimitive: { settings: [] },
    },
    camera: {
      type: "Orthographic",
      position: null,
      target: null,
      direction: null,
      distance: null,
      zoom: 1,
      fov: 50,
    },
    animation: {
      currentFrame: 0,
      isPlaying: false,
      frameDuration: 100,
    },
  };
}

export { createDefaultState };
