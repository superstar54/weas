import * as THREE from "three";
import { CellManager } from "./cell.js";
import { AtomManager } from "./plugins/atom.js";
import { BondManager, defaultBondRadius, searchBondedAtoms } from "./plugins/bond.js";
import { clearObjects, clearObject, toIndexArray, toVector3 } from "../utils.js";
import { PolyhedraManager } from "./plugins/polyhedra.js";
import { BoundaryManager } from "./plugins/boundary.js";
import { AtomLabelManager } from "./plugins/atomLabel.js";
import { Atom, Atoms } from "./atoms.js";
import { Isosurface } from "./plugins/isosurface.js";
import { VolumeSlice } from "./plugins/VolumeSlice.js";
import { VectorField } from "./plugins/vectorField.js";
import { Measurement } from "./plugins/measurement.js";
import { HighlightManager } from "./plugins/highlight.js";
import { AtomsGUI } from "./atomsGui.js";
import { defaultViewerSettings } from "../config.js";
import { Phonon } from "./plugins/phonon.js";
import { Logger } from "../logger.js";

class AtomsViewer {
  constructor({ weas, atoms = [new Atoms()], viewerConfig = {} }) {
    this.uuid = THREE.MathUtils.generateUUID();
    this.weas = weas;
    this.tjs = weas.tjs;
    this.state = weas.state;
    // Merge the user-provided settings overrides with the default settings
    const viewerSettings = { ...defaultViewerSettings, ...viewerConfig };
    // Apply merged settings
    this._ready = false;
    this._modelStyle = viewerSettings.modelStyle;
    this._colorBy = viewerSettings.colorBy;
    this._colorType = viewerSettings.colorType;
    this._colorRamp = viewerSettings.colorRamp;
    this._radiusType = viewerSettings.radiusType;
    this._materialType = viewerSettings.materialType;
    this._atomLabelType = viewerSettings.atomLabelType;
    this._showBondedAtoms = viewerSettings.showBondedAtoms;
    this._boundary = viewerSettings.boundary;
    this._atomScale = viewerSettings.atomScale;
    this._backgroundColor = viewerSettings.backgroundColor;
    this.tjs.scene.background = new THREE.Color(this._backgroundColor);
    this._selectedAtomsIndices = new Array(); // Store selected atoms
    this.baseAtomLabelSettings = [];
    this.debug = viewerSettings.debug;
    this._continuousUpdate = viewerSettings.continuousUpdate;
    this._currentFrame = 0;
    this._updateDepth = 0;
    this._pendingRedraw = null;
    this._syncingState = false;
    this._initializingState = false;
    this._atomScales = [];
    this._modelSticks = [];
    this._modelPolyhedras = [];
    this.logger = new Logger(viewerSettings.logLevel || "warn"); // Default log level is "warn"
    this.trajectory = [new Atoms()];
    // animation settings
    this.isPlaying = false;
    this.frameDuration = 100; // Duration in milliseconds between frames
    // Initialize components
    // other plugins
    this.atomManager = new AtomManager(this);
    this.cellManager = new CellManager(this, viewerSettings.cellSettings);
    this.highlightManager = new HighlightManager(this);
    this.guiManager = new AtomsGUI(this, this.weas.guiManager.gui, this.weas.guiManager.guiConfig); // Pass guiConfig
    this.bondManager = new BondManager(this, viewerSettings.bondSettings);
    this.boundaryManager = new BoundaryManager(this);
    this.polyhedraManager = new PolyhedraManager(this);
    this.isosurfaceManager = new Isosurface(this);
    this.volumeSliceManager = new VolumeSlice(this);
    this.ALManager = new AtomLabelManager(this);
    this.Measurement = new Measurement(this);
    this.VFManager = new VectorField(this);
    this.animate = this.animate.bind(this); // Bind once in the constructor
    this._atoms = null;
    this._cell = null;
    this._frameSignature = null;
    this.init(atoms);
    this.initializeStateStore(viewerSettings);
    this.setupStateSubscriptions();
  }

  initializeStateStore(viewerSettings) {
    this.state.transaction(() => {
      this.state.set({
        viewer: {
          ...viewerSettings,
          atomScales: this._atomScales,
          modelSticks: this._modelSticks,
          modelPolyhedras: this._modelPolyhedras,
          selectedAtomsIndices: [],
        },
      });
      if (viewerSettings.cellSettings) {
        this.state.set({ cell: { ...viewerSettings.cellSettings } });
      }
      if (viewerSettings.bondSettings) {
        this.state.set({ bond: { ...viewerSettings.bondSettings } });
      }
    });
  }

  setupStateSubscriptions() {
    this.state.subscribe("viewer", (next, prev) => {
      if (!next) {
        return;
      }
      if (this._syncingState || this._initializingState) {
        return;
      }
      const prevState = prev || {};
      const patch = {};
      Object.keys(next).forEach((key) => {
        if (JSON.stringify(next[key]) !== JSON.stringify(prevState[key])) {
          patch[key] = next[key];
        }
      });
      if (Object.keys(patch).length === 0) {
        return;
      }
      this.applyState(patch, { redraw: "auto", skipStore: true });
    });
  }

  init(atoms) {
    this.volumetricData = null;
    this.lastFrameTime = Date.now();
    this.selectedAtomsLabelElement = document.createElement("div");
    this.selectedAtomsLabelElement.id = "selectedAtomSymbol";
    this.tjs.containerElement.appendChild(this.selectedAtomsLabelElement);
    // only need to update the atoms, without reset the viewer
    this.updateAtoms(atoms);
    this.logger.debug("init AtomsViewer successfully");
  }

  setVolumetricData(data) {
    this.volumetricData = data;
    if (this.isosurfaceManager) {
      this.isosurfaceManager.drawIsosurfaces();
    }
    if (this.volumeSliceManager) {
      this.volumeSliceManager.drawSlices();
    }
    this.requestRedraw("render");
  }

  reset() {
    this.volumetricData = null;
    this.atomLabels = [];
    this.atomArrows = null;
    this.atomColors = new Array();
    this._atomScales = new Array();
    this._modelSticks = new Array();
    this._modelPolyhedras = new Array();

    this.boundary = [
      [0, 1],
      [0, 1],
      [0, 1],
    ];
    this.boundaryList = [];
    this.boundaryMap = {};
    //
  }

  play() {
    this.isPlaying = true;
    this.animate();
    if (this.guiManager.timeline) {
      this.guiManager.playPauseBtn.textContent = "Pause";
    }
  }

  pause() {
    this.isPlaying = false;
    if (this.guiManager.timeline) {
      this.guiManager.playPauseBtn.textContent = "Play";
    }
  }

  animate() {
    const now = Date.now();
    if (this.isPlaying && this.trajectory.length > 0 && now - this.lastFrameTime > this.frameDuration) {
      this.currentFrame = (this.currentFrame + 1) % this.trajectory.length;
      this.lastFrameTime = now;
    }
    if (this.isPlaying) {
      requestAnimationFrame(this.animate);
    }
  }

  updateFrame(frameIndex) {
    if (this.trajectory.length <= 1) {
      return;
    }
    const atoms = this.trajectory[frameIndex % this.trajectory.length];
    if (this.guiManager.timeline) {
      this.guiManager.timeline.value = frameIndex;
      this.guiManager.currentFrameDisplay.textContent = frameIndex;
    }
    const frameSignature = this.getFrameSignature(atoms);
    const atomMesh = this.atomManager.meshes["atom"];
    if (!atomMesh || atomMesh.count !== atoms.getAtomsCount() || this._frameSignature !== frameSignature) {
      this._frameSignature = frameSignature;
      this.rebuildForFrame(atoms);
      return;
    }
    // update the atoms
    this.atomManager.updateAtomMesh(null, atoms);
    // if in playing mode, we only update the mesh to avoid performance issue
    if (this.isPlaying) {
      // update the bonds
      this.bondManager.updateBondMesh(null, atoms);
      // update the polyhedra
      this.polyhedraManager.updatePolyhedraMesh(null, atoms);
    } else {
      // re-draw the models to update the image atoms, bonds and polyhedra
      this.drawModels();
    }
    // update vector fields related to the atoms attribute
    this.VFManager.updateArrowMesh(null, atoms);
    // update cell
    this.cellManager.updateCellMesh(this.originalCell);
    // update the atom labels
    this.updateAtomLabels();
    // update the highlight atoms
    Object.values(this.highlightManager.settings).forEach((setting) => {
      this.highlightManager.updateHighlightAtomsMesh(setting);
    });
  }

  get currentFrame() {
    return this._currentFrame;
  }

  set currentFrame(newValue) {
    if (this.currentFrame === newValue) {
      return;
    }
    this._currentFrame = newValue;
    this.lastFrameTime = Date.now(); // Update the last frame time

    this.updateFrame(newValue);
    this.requestRedraw("render");
  }

  get originalCell() {
    if (this._cell) {
      return this._cell;
    }
    return this.originalAtoms.cell;
  }

  get originalAtoms() {
    if (this._atoms) {
      return this._atoms;
    }
    return this.atoms;
  }

  get atoms() {
    const atoms = this.trajectory[this.currentFrame];
    atoms.uuid = this.uuid;
    return atoms;
  }

  set atoms(atoms) {
    // Set a new atoms object
    // This will dispose the current objects, reset the viewer, and update the new atoms
    this.ready = false;
    this.dispose();
    this.reset();
    this.updateAtoms(atoms);
  }

  updateAtoms(atoms) {
    this._initializingState = true;
    try {
      // Update the trajectory, managers, and draw the models
      // if atoms is a array, which means it is a trajectory data
      // only the first frame is used to initialize the viewer
      // but keep the trajectory data for the future use
      if (Array.isArray(atoms) && atoms.length > 1) {
        this.trajectory = atoms;
      } else if (Array.isArray(atoms) && atoms.length === 1) {
        this.trajectory = atoms;
      } else {
        this.trajectory = [atoms];
      }
      this._cell = null;
      this._atoms = null;
      this._currentFrame = 0;
      this._frameSignature = this.getFrameSignature(this.atoms);
      this.selectedAtomsIndices = [];
      // set cell
      this.cellManager.cell = this.atoms.cell;
      // initialize the bond settings
      // the following plugins read the atoms attribute, so they need to be updated
      this.atomManager.init();
      this.highlightManager.init();
      this.bondManager.init();
      this.state.transaction(() => {
        const highlightState = this.state.get("plugins.highlight") || {};
        if (!highlightState.settings || Object.keys(highlightState.settings).length === 0) {
          this.state.set({ plugins: { highlight: { settings: this.highlightManager.toPlainSettings() } } });
        } else {
          this.highlightManager.fromSettings(highlightState.settings);
        }
        const speciesState = this.state.get("plugins.species") || {};
        const defaultSpeciesSettings = this.atomManager.toPlainSettings();
        if (speciesState.settings && Object.keys(speciesState.settings).length > 0) {
          const mergedSpeciesSettings = { ...defaultSpeciesSettings, ...speciesState.settings };
          this.atomManager.fromSettings(mergedSpeciesSettings);
          this.state.set({ plugins: { species: { settings: mergedSpeciesSettings } } });
        } else {
          this.state.set({ plugins: { species: { settings: defaultSpeciesSettings } } });
        }
        const bondState = this.state.get("bond") || {};
        const defaultBondSettings = this.bondManager.toPlainSettings();
        if (bondState.settings && Object.keys(bondState.settings).length > 0) {
          const mergedBondSettings = { ...defaultBondSettings, ...bondState.settings };
          this.bondManager.fromSettings(mergedBondSettings);
          this.state.set({ bond: { settings: mergedBondSettings } });
        } else {
          this.state.set({ bond: { settings: defaultBondSettings } });
        }
      });
      this.polyhedraManager.init();
      this.state.transaction(() => {
        const polyhedraState = this.state.get("plugins.polyhedra") || {};
        if (Array.isArray(polyhedraState.settings) && polyhedraState.settings.length > 0) {
          this.polyhedraManager.fromSettings(polyhedraState.settings);
        } else {
          this.state.set({ plugins: { polyhedra: { settings: this.polyhedraManager.toPlainSettings() } } });
        }
      });
      this.VFManager.init();
      // for other plugins, they need to be reset
      this.isosurfaceManager.reset();
      this.volumeSliceManager.reset();
      this.Measurement.reset();
      this.state.set({ plugins: { measurement: { settings: null } } });
      // if trajectory data is provided, add the trajectory controller
      this.guiManager.update(this.trajectory);
      this.guiManager.updateLegend();
      if (this.weas.guiManager && this.weas.guiManager.setDownloadAnimationVisible) {
        this.weas.guiManager.setDownloadAnimationVisible(this.trajectory.length > 1);
      }
      // this.atoms.uuid = this.uuid;
      this._syncingState = true;
      try {
        const modelArrays = this.getStateModelArrays(this.atoms.getAtomsCount());
        if (modelArrays) {
          this.atomScales = modelArrays.atomScales;
          this.modelSticks = modelArrays.modelSticks;
          this.modelPolyhedras = modelArrays.modelPolyhedras;
        } else {
          this.updateModelStyles(this._modelStyle);
        }
        this.atomLabelType = this._atomLabelType;
      } finally {
        this._syncingState = false;
      }
      this._syncingState = true;
      try {
        this.state.set({
          viewer: {
            atomScales: this._atomScales,
            modelSticks: this._modelSticks,
            modelPolyhedras: this._modelPolyhedras,
          },
        });
      } finally {
        this._syncingState = false;
      }
      this.baseAtomLabelSettings = this.getAtomLabelSettingsFromType(this._atomLabelType);
      this.updateAtomLabels();
      this.drawModels();
      // udpate camera position and target position based on the atoms
      this.tjs.updateCameraAndControls({ direction: [0, 0, 100] });
      this.logger.debug("Set atoms successfullly");
    } finally {
      this._initializingState = false;
    }
  }

  getStateModelArrays(atomCount) {
    const viewerState = this.state.get("viewer") || {};
    const { atomScales, modelSticks, modelPolyhedras } = viewerState;
    if (
      Array.isArray(atomScales) &&
      Array.isArray(modelSticks) &&
      Array.isArray(modelPolyhedras) &&
      atomScales.length === atomCount &&
      modelSticks.length === atomCount &&
      modelPolyhedras.length === atomCount
    ) {
      return {
        atomScales: atomScales.slice(),
        modelSticks: modelSticks.slice(),
        modelPolyhedras: modelPolyhedras.slice(),
      };
    }
    return null;
  }

  // set atoms from phonon trajectory
  fromPhononMode({ atoms, eigenvectors, amplitude = 1, factor = 1, nframes = 30, kpoint = [0, 0, 0], repeat = [1, 1, 1], color = "#ff0000", radius = 0.1 }) {
    this.logger.debug("--------------------------------------From Phonon Mode--------------------------------------");
    const phonon = new Phonon(atoms, kpoint, eigenvectors, true);
    const trajectory = phonon.getTrajectory(amplitude, nframes, null, null, null, repeat);
    this.atoms = trajectory;
    this._cell = atoms.cell;
    this._atoms = atoms.multiply({ mx: repeat[0], my: repeat[1], mz: repeat[2] });
    this._atoms.uuid = this.uuid;
    this.VFManager.addSetting("phonon", { origins: "positions", vectors: "movement", factor: factor, color: color, radius: radius });
    this.bondManager.hideLongBonds = false;
    this.drawModels();
    this.play();
    // this.logger.debug("this._atoms: ", this._atoms);
  }

  get ready() {
    return this._ready;
  }

  set ready(newValue) {
    this._ready = newValue;
    this.weas.eventHandlers.dispatchViewerUpdated({ ready: newValue });
  }

  get modelStyle() {
    return this._modelStyle;
  }

  set modelStyle(newValue) {
    if (this._syncingState) {
      this._modelStyle = parseInt(newValue);
      this.weas.eventHandlers.dispatchViewerUpdated({ modelStyle: this._modelStyle });
      return;
    }
    this.applyState({ modelStyle: newValue }, { redraw: "full" });
  }

  get radiusType() {
    return this._radiusType;
  }

  set radiusType(newValue) {
    if (this._syncingState) {
      this._radiusType = newValue;
      this.weas.eventHandlers.dispatchViewerUpdated({ radiusType: newValue });
      return;
    }
    this.applyState({ radiusType: newValue }, { redraw: "full" });
  }

  get colorBy() {
    return this._colorBy;
  }

  set colorBy(newValue) {
    if (this._syncingState) {
      this._colorBy = newValue;
      this.weas.eventHandlers.dispatchViewerUpdated({ colorBy: newValue });
      return;
    }
    this.applyState({ colorBy: newValue }, { redraw: "full" });
  }

  get colorType() {
    return this._colorType;
  }

  set colorType(newValue) {
    if (this._syncingState) {
      this._colorType = newValue;
      this.weas.eventHandlers.dispatchViewerUpdated({ colorType: newValue });
      return;
    }
    this.applyState({ colorType: newValue }, { redraw: "full" });
  }

  get materialType() {
    return this._materialType;
  }

  set materialType(newValue) {
    if (this._syncingState) {
      this._materialType = newValue;
      this.weas.eventHandlers.dispatchViewerUpdated({ materialType: newValue });
      return;
    }
    this.applyState({ materialType: newValue }, { redraw: "full" });
  }

  get colorRamp() {
    return this._colorRamp;
  }

  set colorRamp(newValue) {
    if (this._syncingState) {
      this._colorRamp = newValue;
      this.weas.eventHandlers.dispatchViewerUpdated({ colorRamp: newValue });
      return;
    }
    this.applyState({ colorRamp: newValue }, { redraw: "full" });
  }

  get backgroundColor() {
    return this._backgroundColor;
  }

  set backgroundColor(newValue) {
    if (this._syncingState) {
      this._backgroundColor = newValue;
      this.weas.eventHandlers.dispatchViewerUpdated({ backgroundColor: newValue });
      return;
    }
    this.applyState({ backgroundColor: newValue }, { redraw: "render" });
  }

  get atomLabelType() {
    return this._atomLabelType;
  }

  set atomLabelType(newValue) {
    if (this._syncingState) {
      this._atomLabelType = newValue;
      this.weas.eventHandlers.dispatchViewerUpdated({ atomLabelType: newValue });
      return;
    }
    this.applyState({ atomLabelType: newValue }, { redraw: "labels" });
  }

  get boundary() {
    return this._boundary;
  }

  set boundary(newValue) {
    if (this._syncingState) {
      this._boundary = newValue;
      this.weas.eventHandlers.dispatchViewerUpdated({ boundary: newValue });
      return;
    }
    this.applyState({ boundary: newValue }, { redraw: "full" });
  }

  get showBondedAtoms() {
    return this._showBondedAtoms;
  }

  set showBondedAtoms(newValue) {
    if (this._syncingState) {
      this._showBondedAtoms = newValue;
      this.weas.eventHandlers.dispatchViewerUpdated({ showBondedAtoms: newValue });
      return;
    }
    this.applyState({ showBondedAtoms: newValue }, { redraw: "full" });
  }

  get continuousUpdate() {
    return this._continuousUpdate;
  }

  set continuousUpdate(newValue) {
    if (this._syncingState) {
      this._continuousUpdate = newValue;
      this.weas.eventHandlers.dispatchViewerUpdated({ continuousUpdate: newValue });
      return;
    }
    this.applyState({ continuousUpdate: newValue }, { redraw: "render" });
  }

  get atomScale() {
    return this._atomScale;
  }

  set atomScale(newValue) {
    if (this._syncingState) {
      this._atomScale = newValue;
      this.weas.eventHandlers.dispatchViewerUpdated({ atomScale: newValue });
      return;
    }
    this.applyState({ atomScale: newValue }, { redraw: "render" });
  }

  get atomScales() {
    return this._atomScales;
  }

  set atomScales(newValue) {
    if (this._syncingState) {
      this._atomScales = newValue;
      this.weas.eventHandlers.dispatchViewerUpdated({ atomScales: newValue });
      return;
    }
    this.applyState({ atomScales: newValue }, { redraw: "full" });
  }

  get modelSticks() {
    return this._modelSticks;
  }

  set modelSticks(newValue) {
    if (this._syncingState) {
      this._modelSticks = newValue;
      this.weas.eventHandlers.dispatchViewerUpdated({ modelSticks: newValue });
      return;
    }
    this.applyState({ modelSticks: newValue }, { redraw: "full" });
  }

  get modelPolyhedras() {
    return this._modelPolyhedras;
  }

  set modelPolyhedras(newValue) {
    if (this._syncingState) {
      this._modelPolyhedras = newValue;
      this.weas.eventHandlers.dispatchViewerUpdated({ modelPolyhedras: newValue });
      return;
    }
    this.applyState({ modelPolyhedras: newValue }, { redraw: "full" });
  }

  get selectedAtomsIndices() {
    return this._selectedAtomsIndices;
  }

  set selectedAtomsIndices(newValue) {
    if (this._syncingState) {
      this._selectedAtomsIndices = newValue;
      this.weas.eventHandlers.dispatchViewerUpdated({ selectedAtomsIndices: newValue });
      return;
    }
    this.applyState({ selectedAtomsIndices: newValue }, { redraw: "render" });
  }

  beginUpdate() {
    this._updateDepth += 1;
  }

  endUpdate({ redraw = true } = {}) {
    if (this._updateDepth > 0) {
      this._updateDepth -= 1;
    }
    if (this._updateDepth === 0 && redraw) {
      this.flushRedraw();
    }
  }

  transaction(callback, { redraw = true } = {}) {
    this.beginUpdate();
    try {
      callback();
    } finally {
      this.endUpdate({ redraw });
    }
  }

  requestRedraw(kind = "full") {
    const priority = { render: 1, labels: 2, full: 3 };
    if (!kind || !priority[kind]) {
      return;
    }
    if (!this._pendingRedraw || priority[kind] > priority[this._pendingRedraw]) {
      this._pendingRedraw = kind;
    }
    if (this._updateDepth === 0) {
      this.flushRedraw();
    }
  }

  flushRedraw() {
    const kind = this._pendingRedraw;
    this._pendingRedraw = null;
    if (!kind) {
      return;
    }
    if (kind === "full") {
      this.drawModels();
    } else if (kind === "labels") {
      this.updateAtomLabels();
    } else {
      this.tjs.render();
    }
  }

  applyState(patch, { redraw = "auto", skipStore = false } = {}) {
    if (!patch || Object.keys(patch).length === 0) {
      return;
    }
    const autoRedraw = redraw === "auto";
    const manualRedraw = redraw !== "auto" && redraw !== "none";
    const needsModelArraySync = "modelStyle" in patch && !("atomScales" in patch || "modelSticks" in patch || "modelPolyhedras" in patch);
    this.beginUpdate();
    this._syncingState = true;
    try {
      if (!skipStore) {
        this.state.set({ viewer: patch });
      }
      Object.entries(patch).forEach(([key, value]) => {
        if (!(key in this)) {
          this.logger.warn(`Unknown viewer state key: ${key}`);
          return;
        }
        if (key === "selectedAtomsIndices") {
          const prevSelected = this._selectedAtomsIndices;
          const nextSelected = Array.isArray(value) ? value : [];
          const newSelectedAtoms = nextSelected.filter((atomIndex) => !prevSelected.includes(atomIndex));
          const unselectedAtoms = prevSelected.filter((atomIndex) => !nextSelected.includes(atomIndex));
          if (!this.highlightManager.settings || !this.highlightManager.settings["selection"]) {
            this.highlightManager.init();
          }
          if (!this.highlightManager.meshes || !this.highlightManager.meshes["sphere"]) {
            this.highlightManager.drawHighlightAtoms();
          }
          this.highlightManager.settings["selection"].indices = nextSelected;
          this._selectedAtomsIndices = nextSelected;
          this.weas.eventHandlers.dispatchViewerUpdated({ selectedAtomsIndices: nextSelected });
          this.highlightManager.updateHighlightAtomsMesh({ indices: newSelectedAtoms, scale: 1.1, type: "sphere" });
          this.highlightManager.updateHighlightAtomsMesh({ indices: unselectedAtoms, scale: 0, type: "sphere" });
          this.baseAtomLabelSettings = [];
          this.updateAtomLabels();
          if (autoRedraw) {
            const effect = this.getRedrawEffectForKey(key);
            if (effect) {
              this.requestRedraw(effect);
            }
          }
          return;
        }
        this[key] = value;
        if (key === "radiusType") {
          this.atomManager.init();
          this.bondManager.init();
          this.polyhedraManager.init();
        }
        if (key === "colorBy") {
          this.atomManager.init();
          this.bondManager.init();
          this.polyhedraManager.init();
        }
        if (key === "colorType") {
          this.atomManager.init();
          this.guiManager.updateLegend();
          this.bondManager.init();
          this.polyhedraManager.init();
        }
        if (key === "atomScale") {
          this.atomManager.updateAtomScale(value);
        }
        if (key === "backgroundColor") {
          this.tjs.scene.background = new THREE.Color(value);
        }
        if (key === "atomLabelType") {
          this.baseAtomLabelSettings = this.getAtomLabelSettingsFromType(value);
          this.updateAtomLabels();
        }
        if (key === "modelStyle" && needsModelArraySync) {
          this.updateModelStyles(value);
        }
        if (autoRedraw) {
          const effect = this.getRedrawEffectForKey(key);
          if (effect) {
            this.requestRedraw(effect);
          }
        }
      });
      if (manualRedraw) {
        this.requestRedraw(redraw === true ? "full" : redraw);
      }
      if (!skipStore && needsModelArraySync) {
        this.state.set({
          viewer: {
            atomScales: this._atomScales,
            modelSticks: this._modelSticks,
            modelPolyhedras: this._modelPolyhedras,
          },
        });
      }
    } finally {
      this._syncingState = false;
      this.endUpdate({ redraw: true });
    }
  }

  setState(patch, { record = false, redraw = "auto" } = {}) {
    if (record) {
      if (this.weas.ops && this.weas.ops.isRestoring) {
        this.applyState(patch, { redraw });
        return;
      }
      this.weas.ops.viewer.SetViewerState({ patch, redraw });
      return;
    }
    this.applyState(patch, { redraw });
  }

  getRedrawEffectForKey(key) {
    const effectMap = {
      modelStyle: "full",
      radiusType: "full",
      colorBy: "full",
      colorType: "full",
      colorRamp: "full",
      materialType: "full",
      boundary: "full",
      showBondedAtoms: "full",
      atomScales: "full",
      modelSticks: "full",
      modelPolyhedras: "full",
      atomLabelType: "labels",
      atomScale: "render",
      selectedAtomsIndices: "render",
      backgroundColor: "render",
    };
    return effectMap[key] || null;
  }

  getAtomLabelSettingsFromType(labelType) {
    const normalized = String(labelType || "None").toUpperCase();
    if (normalized === "SYMBOL") {
      return [{ origins: "positions", texts: "symbols" }];
    }
    if (normalized === "INDEX") {
      return [{ origins: "positions", texts: "index" }];
    }
    return [];
  }

  updateAtomLabels() {
    const settings = [...this.baseAtomLabelSettings];
    if (this._selectedAtomsIndices.length > 0) {
      settings.push({
        origins: "positions",
        texts: "index",
        selection: this._selectedAtomsIndices,
      });
    }
    this.state.set({ plugins: { atomLabel: { settings } } });
  }

  drawModels() {
    this.logger.debug("-----------------drawModels-----------------");
    this.dispose();
    this.cellManager.draw();
    // Map the symbols to their radii
    this.bondManager.buildNeighborList();
    this.boundaryManager.getBoundaryAtoms();
    // search atoms bonded to atoms, which includes the boundary atoms and the orginal atoms
    const atomsList = this.atoms.positions.map((_, index) => [index, [0, 0, 0]]);
    // merge the atomsList and boundaryList
    const offsets = atomsList.concat(this.boundaryList || []);
    // this.logger.debug("atoms with boundary: ", offsets)
    if (this._showBondedAtoms) {
      this.bondedAtoms = searchBondedAtoms(this.atoms.getSymbols(), offsets, this.neighbors, this.modelSticks);
    } else {
      this.bondedAtoms = { atoms: [], bonds: [] };
    }

    this.logger.debug("bondedAtoms: ", this.bondedAtoms);
    this.atomManager.meshes["atom"] = this.atomManager.drawBalls();
    const bondMesh = this.bondManager.drawBonds();
    this.atomManager.meshes["atom"].add(bondMesh);
    const polyhedraMesh = this.polyhedraManager.drawPolyhedras();
    this.atomManager.meshes["atom"].add(polyhedraMesh);
    this.isosurfaceManager.drawIsosurfaces();
    this.volumeSliceManager.drawSlices();
    this.VFManager.drawVectorFields();
    this.highlightManager.drawHighlightAtoms();
    this.ALManager.drawAtomLabels();
    this.guiManager.updateLegend();
    this.ready = true;
    this.requestRedraw("render");
  }

  dispose() {
    // Remove the selected atom symbol element
    // this.tjs.containerElement.removeChild(this.selectedAtomsLabelElement);
    // Remove the selected atom mesh group
    // this.tjs.scene.remove(this.highlightAtomsMesh);
    // Remove the atom labels
    if (this.atomManager.meshes["atom"]) {
      this.atomManager.meshes["atom"].dispose();
    }
    if (this.atomManager.meshes["image"]) {
      this.atomManager.meshes["image"].dispose();
    }
    // Remove the unit cell
    clearObjects(this.tjs.scene, this.uuid);
  }

  // Method to delete selected atoms
  deleteSelectedAtoms({ indices = null }) {
    if (indices === null) {
      indices = this.selectedAtomsIndices;
    }
    // Remove the selected atoms from the scene and data
    this.atoms.deleteAtoms({ indices });
    // TODO: add modelStyles to Atoms's attributes
    // delete the properties, e.g. modelStyles, that are associated with the deleted atoms
    this.atomScales = this.atomScales.filter((value, index) => !indices.includes(index));
    this.modelSticks = this.modelSticks.filter((value, index) => !indices.includes(index));
    this.modelPolyhedras = this.modelPolyhedras.filter((value, index) => !indices.includes(index));

    // subtract the indices from the selectedAtomsIndices
    this.selectedAtomsIndices = this.selectedAtomsIndices.filter((value) => !indices.includes(value));

    // Update the visualization
    this.drawModels(); // Reapply the visualization
  }

  // Method to replace selected atoms
  replaceSelectedAtoms({ element, indices = null }) {
    if (indices === null) {
      indices = this.selectedAtomsIndices;
    }
    // Remove the selected atoms from the scene and data
    this.atoms.replaceAtoms({ indices: Array.from(indices), newSpecieSymbol: element });

    // Update the bond settings
    this.atomManager.init();
    this.bondManager.init();

    // Update the visualization
    this.drawModels(); // Reapply the visualization
  }

  // Method to add atoms
  addAtom({ element, position = { x: 0, y: 0, z: 0 } }) {
    // Remove the selected atoms from the scene and data
    const atom = new Atom(element, [position.x, position.y, position.z]);
    // if element is not in the species, add it to the species
    if (!this.atoms.species[element]) {
      this.atoms.addSpecie({ symbol: element });
    }
    this.atoms.addAtom({ atom });
    // this.logger.debug("atoms: ", this.atoms);

    // add the properties, e.g. modelStyles, that are associated with the added atoms
    this.atomScales = this.atomScales.concat([this.atomScale]);
    this.modelSticks = this.modelSticks.concat([0]);
    this.modelPolyhedras = this.modelPolyhedras.concat([0]);

    // update bond settings
    this.atomManager.init();
    this.bondManager.init();

    // Update the visualization
    this.drawModels(); // Reapply the visualization
  }

  // Method to copy atoms
  copyAtoms({ indices = null }) {
    /* Copy the selected atoms and add them to the atoms object
     */
    if (indices === null) {
      indices = this.selectedAtomsIndices;
    }
    const copied_atoms = this.atoms.getAtomsByIndices({ indices });
    this.logger.debug("copied_atoms: ", copied_atoms);
    this.atoms.add({ otherAtoms: copied_atoms });
    this.logger.debug("atoms: ", this.atoms);

    // also copy the properties, e.g. modelStyles, that are associated with the copied atoms
    this.atomScales = this.atomScales.concat(indices.map((index) => this.atomScales[index]));
    this.modelSticks = this.modelSticks.concat(indices.map((index) => this.modelSticks[index]));
    this.modelPolyhedras = this.modelPolyhedras.concat(indices.map((index) => this.modelPolyhedras[index]));

    // Update the visualization
    this.drawModels();
    // update the selectedAtomsIndices to the new added atoms
    this.selectedAtomsIndices = Array.from({ length: copied_atoms.getAtomsCount() }, (_, i) => i + this.atoms.getAtomsCount() - copied_atoms.getAtomsCount());
  }

  setAtomPosition({ index, position }) {
    // Update the atom position
    const matrix = new THREE.Matrix4();
    this.atomManager.meshes["atom"].getMatrixAt(index, matrix);
    matrix.setPosition(position);
    this.atomManager.meshes["atom"].setMatrixAt(index, matrix);
    this.atoms.positions[index] = [position.x, position.y, position.z];
    // update the other meshes
    this.atomManager.updateImageAtomsMesh(index);
    this.bondManager.updateBondMesh(index);
    this.polyhedraManager.updatePolyhedraMesh(index);
  }

  resetSelectedAtomsPositions(initialAtomPositionsOrOptions, indices = null) {
    let initialAtomPositions = initialAtomPositionsOrOptions;
    if (initialAtomPositionsOrOptions && typeof initialAtomPositionsOrOptions === "object" && Object.prototype.hasOwnProperty.call(initialAtomPositionsOrOptions, "initialAtomPositions")) {
      ({ initialAtomPositions, indices = null } = initialAtomPositionsOrOptions);
    }
    // Reset the selected atoms to their initial positions
    if (indices === null) {
      indices = this.selectedAtomsIndices;
    }
    if (indices.length === 0) {
      return;
    }
    indices.forEach((atomIndex) => {
      const initialPosition = initialAtomPositions.get(atomIndex);
      // Update the atom position
      this.setAtomPosition({ index: atomIndex, position: initialPosition });
    });
    this.atomManager.meshes["atom"].instanceMatrix.needsUpdate = true;
  }

  translateSelectedAtoms({ translateVector, indices = null }) {
    // translating selected atoms by translateVector
    // if indices is null, translate all selected atoms
    if (indices === null) {
      indices = this.selectedAtomsIndices;
    }
    indices = toIndexArray(indices);
    if (indices.length === 0) {
      return;
    }
    translateVector = toVector3(translateVector, "translateVector");

    indices.forEach((atomIndex) => {
      const initialPosition = new THREE.Vector3(...this.atoms.positions[atomIndex]);
      const newPosition = initialPosition.clone().add(translateVector);
      this.setAtomPosition({ index: atomIndex, position: newPosition });
    });

    this.atomManager.meshes["atom"].instanceMatrix.needsUpdate = true;
    // if imageAtomsMesh has instanceMatrix, update it
    if (this.atomManager.meshes["image"]) {
      this.atomManager.meshes["image"].instanceMatrix.needsUpdate = true;
    }
    if (this.bondManager.bondMesh) {
      this.bondManager.bondMesh.instanceMatrix.needsUpdate = true;
    }
  }

  rotateSelectedAtoms({ cameraDirection, rotationAngle, indices = null, centroid = null }) {
    /* Rotate the selected atoms around the cameraDirection by rotationAngle
    rotationAngle is in degrees
    */
    cameraDirection = toVector3(cameraDirection, "cameraDirection");
    cameraDirection = cameraDirection.normalize();
    rotationAngle = THREE.MathUtils.degToRad(rotationAngle);
    const rotationMatrix = new THREE.Matrix4().makeRotationAxis(cameraDirection, -rotationAngle);
    if (indices === null) {
      indices = this.selectedAtomsIndices;
    }
    indices = toIndexArray(indices);
    if (indices.length === 0) {
      return;
    }
    if (centroid === null) {
      centroid = new THREE.Vector3(0, 0, 0);
      indices.forEach((atomIndex) => {
        centroid.add(new THREE.Vector3(...this.atoms.positions[atomIndex]));
      });
      centroid.divideScalar(indices.length);
    }
    centroid = toVector3(centroid, "centroid");
    indices.forEach((atomIndex) => {
      const newPosition = new THREE.Vector3(...this.atoms.positions[atomIndex]);
      // Translate to the centroid, apply rotation, then translate back
      newPosition
        .sub(centroid) // Translate to centroid
        .applyMatrix4(rotationMatrix) // Apply rotation
        .add(centroid); // Translate back
      this.setAtomPosition({ index: atomIndex, position: newPosition });
    });

    this.atomManager.meshes["atom"].instanceMatrix.needsUpdate = true;
    // if imageAtomsMesh has instanceMatrix, update it
    if (this.atomManager.meshes["image"]) {
      this.atomManager.meshes["image"].instanceMatrix.needsUpdate = true;
    }
  }

  setAttribute(nameOrOptions, values, domain = "atom") {
    let name = nameOrOptions;
    if (nameOrOptions && typeof nameOrOptions === "object" && Object.prototype.hasOwnProperty.call(nameOrOptions, "name")) {
      ({ name, values, domain = "atom" } = nameOrOptions);
    }
    // loop all the atoms in the trajectory
    this.trajectory.forEach((atoms) => {
      atoms.newAttribute({ name, values, domain });
    });
  }

  updateModelStyles(newValue) {
    const { atomScales, modelSticks, modelPolyhedras, appliesToAll } = this.getModelArraysForStyle(newValue);
    if (appliesToAll) {
      this._modelStyle = newValue;
    }
    this.atomScales = atomScales;
    this.modelSticks = modelSticks;
    this.modelPolyhedras = modelPolyhedras;
  }

  getDefaultModelArrays(style, atomCount) {
    const atomScales = new Array(atomCount).fill(0.4);
    const modelSticks = new Array(atomCount).fill(0);
    const modelPolyhedras = new Array(atomCount).fill(0);
    if (style === 0) {
      atomScales.fill(1);
    } else if (style === 1) {
      modelSticks.fill(1);
    } else if (style === 2) {
      modelSticks.fill(2);
      modelPolyhedras.fill(1);
    } else if (style === 3) {
      atomScales.fill(0);
      modelSticks.fill(3);
    } else if (style === 4) {
      atomScales.fill(0);
      modelSticks.fill(4);
    }
    return { atomScales, modelSticks, modelPolyhedras };
  }

  applyModelStyleToArrays(style, atomScales, modelSticks, modelPolyhedras, indices) {
    const applyToIndex = (atomIndex) => {
      if (style === 0) {
        atomScales[atomIndex] = 1;
        modelSticks[atomIndex] = style;
        modelPolyhedras[atomIndex] = 0;
      } else if (style === 1) {
        atomScales[atomIndex] = 0.4;
        modelSticks[atomIndex] = style;
        modelPolyhedras[atomIndex] = 0;
      } else if (style === 2) {
        atomScales[atomIndex] = 0.4;
        modelSticks[atomIndex] = style;
        modelPolyhedras[atomIndex] = 1;
      } else if (style === 3) {
        atomScales[atomIndex] = 0;
        modelSticks[atomIndex] = style;
        modelPolyhedras[atomIndex] = 0;
      } else if (style === 4) {
        atomScales[atomIndex] = 0;
        modelSticks[atomIndex] = style;
        modelPolyhedras[atomIndex] = 0;
      }
    };
    indices.forEach((atomIndex) => applyToIndex(atomIndex));
  }

  getModelArraysForStyle(newValue) {
    const atomCount = this.atoms.getAtomsCount();
    const hasValidArrays =
      Array.isArray(this._atomScales) &&
      Array.isArray(this._modelSticks) &&
      Array.isArray(this._modelPolyhedras) &&
      this._atomScales.length === atomCount &&
      this._modelSticks.length === atomCount &&
      this._modelPolyhedras.length === atomCount;
    let atomScales;
    let modelSticks;
    let modelPolyhedras;
    if (hasValidArrays) {
      atomScales = this._atomScales.slice();
      modelSticks = this._modelSticks.slice();
      modelPolyhedras = this._modelPolyhedras.slice();
    } else {
      const defaults = this.getDefaultModelArrays(this._modelStyle, atomCount);
      atomScales = defaults.atomScales;
      modelSticks = defaults.modelSticks;
      modelPolyhedras = defaults.modelPolyhedras;
    }
    if (this.selectedAtomsIndices.length > 0) {
      this.applyModelStyleToArrays(newValue, atomScales, modelSticks, modelPolyhedras, this.selectedAtomsIndices);
      return { atomScales, modelSticks, modelPolyhedras, appliesToAll: false };
    }
    const defaults = this.getDefaultModelArrays(newValue, atomCount);
    return { ...defaults, appliesToAll: true };
  }

  getFrameSignature(atoms) {
    const atomsCount = atoms.getAtomsCount();
    const symbolsHash = this.hashSymbols(atoms.symbols);
    return `${atomsCount}:${symbolsHash}`;
  }

  hashSymbols(symbols) {
    let hash = 0;
    for (let i = 0; i < symbols.length; i++) {
      const symbol = symbols[i];
      for (let j = 0; j < symbol.length; j++) {
        hash = (hash * 31 + symbol.charCodeAt(j)) | 0;
      }
      hash = (hash * 31 + 124) | 0;
    }
    return hash >>> 0;
  }

  rebuildForFrame(atoms) {
    this._atoms = null;
    this._cell = null;
    this.selectedAtomsIndices = [];
    this.cellManager.cell = atoms.cell;
    this.atomManager.init();
    this.highlightManager.init();
    this.bondManager.init();
    this.polyhedraManager.init();
    this.VFManager.init();
    this.isosurfaceManager.reset();
    this.volumeSliceManager.reset();
    this.Measurement.reset();
    this.updateModelStyles(this._modelStyle);
    this.drawModels();
  }
}

export { AtomsViewer };
