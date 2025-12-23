import { createDefaultState } from "./defaultState.js";
import { cloneValue } from "./store.js";

function applyDefined(target, source, keys) {
  if (!source) {
    return;
  }
  keys.forEach((key) => {
    if (source[key] !== undefined) {
      target[key] = cloneValue(source[key]);
    }
  });
}

function fromWidgetSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== "object") {
    throw new Error("Invalid widget snapshot payload.");
  }
  const state = createDefaultState();
  const viewer = snapshot.viewer || {};
  const plugins = snapshot.plugins || {};
  const camera = snapshot.camera || {};
  const measurement = snapshot.measurement || {};
  const animation = snapshot.animation || {};

  applyDefined(state.viewer, viewer, [
    "modelStyle",
    "colorBy",
    "colorType",
    "colorRamp",
    "radiusType",
    "materialType",
    "atomLabelType",
    "showBondedAtoms",
    "boundary",
    "atomScale",
    "atomScales",
    "modelSticks",
    "modelPolyhedras",
    "continuousUpdate",
    "selectedAtomsIndices",
    "backgroundColor",
  ]);

  applyDefined(state.bond, viewer, ["hideLongBonds", "showHydrogenBonds", "showOutBoundaryBonds"]);

  if (plugins.cellSettings) {
    state.cell = cloneValue(plugins.cellSettings);
  }
  if (plugins.bondSettings) {
    state.bond.settings = cloneValue(plugins.bondSettings);
  }
  if (plugins.isoSettings) {
    state.plugins.isosurface.settings = cloneValue(plugins.isoSettings);
  }
  if (plugins.sliceSettings) {
    state.plugins.volumeSlice.settings = cloneValue(plugins.sliceSettings);
  }
  if (plugins.vectorField) {
    state.plugins.vectorField.settings = cloneValue(plugins.vectorField);
  }
  if (typeof plugins.showVectorField === "boolean") {
    state.plugins.vectorField.show = plugins.showVectorField;
  }
  if (plugins.highlightSettings) {
    state.plugins.highlight.settings = cloneValue(plugins.highlightSettings);
  }
  if (plugins.speciesSettings) {
    state.plugins.species.settings = cloneValue(plugins.speciesSettings);
  }
  if (plugins.anyMesh) {
    state.plugins.anyMesh.settings = cloneValue(plugins.anyMesh);
  }
  if (plugins.instancedMeshPrimitive) {
    state.plugins.instancedMeshPrimitive.settings = cloneValue(plugins.instancedMeshPrimitive);
  }

  if (measurement && typeof measurement === "object") {
    const measurementSettings = measurement.settings && typeof measurement.settings === "object" ? measurement.settings : measurement;
    state.plugins.measurement.settings = cloneValue(measurementSettings);
  }

  if (animation && typeof animation === "object") {
    applyDefined(state.animation, animation, ["currentFrame", "isPlaying", "frameDuration"]);
  }

  if (camera.cameraSetting) {
    applyDefined(state.camera, camera.cameraSetting, ["direction", "distance", "zoom"]);
    if (camera.cameraSetting.lookAt) {
      state.camera.target = cloneValue(camera.cameraSetting.lookAt);
    }
  }
  applyDefined(state.camera, camera, ["cameraType"]);
  if (camera.cameraType) {
    state.camera.type = camera.cameraType;
  }
  if (camera.cameraZoom !== undefined) {
    state.camera.zoom = camera.cameraZoom;
  }
  if (camera.cameraPosition) {
    state.camera.position = cloneValue(camera.cameraPosition);
  }
  if (camera.cameraLookAt) {
    state.camera.target = cloneValue(camera.cameraLookAt);
  }

  const currentFrame = typeof animation.currentFrame === "number" ? animation.currentFrame : typeof viewer.currentFrame === "number" ? viewer.currentFrame : undefined;

  return {
    version: "weas_state_v1",
    atoms: cloneValue(snapshot.atoms),
    state,
    camera: cloneValue(state.camera),
    currentFrame,
  };
}

export { fromWidgetSnapshot };
