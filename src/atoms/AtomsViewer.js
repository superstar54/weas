import * as THREE from "three";
import { CellManager } from "./cell.js";
import { BondManager, searchBondedAtoms } from "./plugins/bond.js";
import { drawAtoms } from "./draw_atoms.js";
import { clearObjects, clearObject, calculateCartesianCoordinates } from "../utils.js";
import { PolyhedraManager } from "./plugins/polyhedra.js";
import { getImageAtoms, searchBoundary, createBoundaryMapping } from "./boundary.js";
import { findNeighbors } from "./neighbor.js";
import { AtomLabelManager } from "./plugins/atomLabel.js";
import { Atom, Atoms } from "./atoms.js";
import { Isosurface } from "./plugins/isosurface.js";
import { VectorField } from "./plugins/vectorField.js";
import { Measurement } from "./plugins/measurement.js";
import { getAtomColors } from "./color.js";
import { AtomsGUI } from "./atomsGui.js";
import { defaultViewerSettings } from "../config.js";
import { Phonon } from "./plugins/phonon.js";
import { Logger } from "../logger.js";

class AtomsViewer {
  constructor({ weas, atoms = [new Atoms()], viewerConfig = {} }) {
    this.uuid = THREE.MathUtils.generateUUID();
    this.weas = weas;
    this.tjs = weas.tjs;
    // Merge the user-provided settings overrides with the default settings
    const viewerSettings = { ...defaultViewerSettings, ...viewerConfig };
    // Apply merged settings
    this._ready = false;
    this._modelStyle = viewerSettings._modelStyle;
    this._colorBy = viewerSettings._colorBy;
    this._colorType = viewerSettings._colorType;
    this._colorRamp = viewerSettings._colorRamp;
    this._radiusType = viewerSettings._radiusType;
    this._materialType = viewerSettings._materialType;
    this._atomLabelType = viewerSettings._atomLabelType;
    this._showBondedAtoms = viewerSettings._showBondedAtoms;
    this._showCell = viewerSettings._showCell;
    this._boundary = viewerSettings._boundary;
    this.atomScale = viewerSettings.atomScale;
    this.backgroundColor = viewerSettings.backgroundColor;
    this._selectedAtomsIndices = new Array(); // Store selected atoms
    this.debug = viewerSettings.debug;
    this._currentFrame = 0;
    this.logger = new Logger(viewerSettings.logLevel || "warn"); // Default log level is "warn"
    this.trajectory = [new Atoms()];
    // animation settings
    this.isPlaying = false;
    this.frameDuration = 100; // Duration in milliseconds between frames
    // Initialize components
    // other plugins
    this.cellManager = new CellManager(this);
    this.guiManager = new AtomsGUI(this, this.weas.guiManager.gui);
    this.bondManager = new BondManager(this);
    this.polyhedraManager = new PolyhedraManager(this);
    this.isosurfaceManager = new Isosurface(this);
    this.ALManager = new AtomLabelManager(this);
    this.Measurement = new Measurement(this);
    this.VFManager = new VectorField(this);
    this.animate = this.animate.bind(this); // Bind once in the constructor
    this._atoms = null;
    this._cell = null;
    this.init(atoms);
  }

  init(atoms) {
    this.selectedAtomsLabelElement = document.createElement("div");
    this.selectedAtomsLabelElement.id = "selectedAtomSymbol";
    this.tjs.containerElement.appendChild(this.selectedAtomsLabelElement);
    // only need to update the atoms, without reset the viewer
    this.updateAtoms(atoms);
    this.logger.debug("init AtomsViewer successfully");
  }

  reset() {
    this.atomLabels = [];
    this.atomArrows = null;
    this.atomColors = new Array();
    this._atomScales = new Array();
    this._modelSticks = new Array();
    this._modelPolyhedras = new Array();
    this.lastFrameTime = Date.now();
    this.boundary = [
      [0, 1],
      [0, 1],
      [0, 1],
    ];
    this.boundaryList = null;
    this.bondRadius = 0.1; // Default bond radius
    //
    this.highlightAtomsMesh = null;
  }

  play() {
    this.isPlaying = true;
    this.animate();
    this.guiManager.playPauseBtn.textContent = "Pause";
  }

  pause() {
    this.isPlaying = false;
    this.guiManager.playPauseBtn.textContent = "Play";
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
    var matrix = new THREE.Matrix4();
    for (let i = 0; i < atoms.positions.length; i++) {
      this.atomsMesh.getMatrixAt(i, matrix);
      matrix.setPosition(new THREE.Vector3(...atoms.positions[i]));
      this.atomsMesh.setMatrixAt(i, matrix);
      this.updateBoundaryAtomsMesh(i);
    }
    this.atomsMesh.instanceMatrix.needsUpdate = true;
    this.guiManager.timeline.value = frameIndex;
    this.guiManager.currentFrameDisplay.textContent = frameIndex;
    // update the bonds
    this.bondManager.updateBondMesh(null, atoms);
    // update vector fields related to the atoms attribute
    this.VFManager.updateArrowMesh(null, atoms);
    // if boundaryAtomsMesh has instanceMatrix, update it
    if (this.boundaryAtomsMesh) {
      this.boundaryAtomsMesh.instanceMatrix.needsUpdate = true;
    }
    // update cell
    this.cellManager.cell = this.atoms.cell;
    this.cellManager.draw();
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
    this.tjs.render();
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
    // set cell
    this.cellManager.cell = this.atoms.cell;
    // initialize the bond settings
    // the following plugins read the atoms attribute, so they need to be updated
    this.bondManager.init();
    this.polyhedraManager.init();
    this.VFManager.init();
    // for other plugins, they need to be reset
    this.isosurfaceManager.reset();
    this.Measurement.reset();
    // if trajectory data is provided, add the trajectory controller
    this.guiManager.update(this.trajectory);
    // this.atoms.uuid = this.uuid;
    this.modelStyle = this._modelStyle;
    this.drawModels();
    this.selectedAtomsIndices = [];
    // udpate camera position and target position based on the atoms
    this.tjs.updateCameraAndControls({ direction: [0, 0, 100] });
    this.logger.debug("Set atoms successfullly");
  }

  // set atoms from phonon trajectory
  fromPhononMode({ atoms, eigenvectors, amplitude = 1, nframes = 30, kpoint = [0, 0, 0], repeat = [1, 1, 1] }) {
    this.logger.debug("--------------------------------------From Phonon Mode--------------------------------------");
    const phonon = new Phonon(atoms, kpoint, eigenvectors, true);
    const trajectory = phonon.getTrajectory(amplitude, nframes, null, null, null, repeat);
    this.atoms = trajectory;
    this._cell = atoms.cell;
    this._atoms = atoms.multiply(...repeat);
    this._atoms.uuid = this.uuid;
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
    this.logger.debug("updateModelStyle: ", newValue);
    newValue = parseInt(newValue);
    if (this.selectedAtomsIndices.length > 0) {
      if (newValue === 0) {
        this.logger.debug("newValue: ", newValue);
        this.selectedAtomsIndices.forEach((atomIndex) => {
          this.atomScales[atomIndex] = 1;
          this.modelSticks[atomIndex] = 0;
          this.modelPolyhedras[atomIndex] = 0;
        });
      } else if (newValue === 1) {
        this.selectedAtomsIndices.forEach((atomIndex) => {
          this.atomScales[atomIndex] = 0.4;
          this.modelSticks[atomIndex] = 1;
          this.modelPolyhedras[atomIndex] = 0;
        });
      } else if (newValue === 2) {
        this.selectedAtomsIndices.forEach((atomIndex) => {
          this.atomScales[atomIndex] = 0.4;
          this.modelSticks[atomIndex] = 1;
          this.modelPolyhedras[atomIndex] = 1;
        });
      } else if (newValue === 3) {
        this.selectedAtomsIndices.forEach((atomIndex) => {
          this.atomScales[atomIndex] = 0;
          this.modelSticks[atomIndex] = 1;
          this.modelPolyhedras[atomIndex] = 0;
        });
      }
    } else {
      this._modelStyle = parseInt(newValue);
      // clear this.models
      this.modelSticks = new Array(this.atoms.getAtomsCount()).fill(0);
      this.modelPolyhedras = new Array(this.atoms.getAtomsCount()).fill(0);
      if (this._modelStyle === 0) {
        this.atomScales = new Array(this.atoms.getAtomsCount()).fill(1);
      } else if (this._modelStyle === 1) {
        this.atomScales = new Array(this.atoms.getAtomsCount()).fill(0.4);
        this.modelSticks = new Array(this.atoms.getAtomsCount()).fill(1);
      } else if (this._modelStyle === 2) {
        this.atomScales = new Array(this.atoms.getAtomsCount()).fill(0.4);
        this.modelSticks = new Array(this.atoms.getAtomsCount()).fill(1);
        this.modelPolyhedras = new Array(this.atoms.getAtomsCount()).fill(1);
      } else if (this._modelStyle === 3) {
        this.atomScales = new Array(this.atoms.getAtomsCount()).fill(0.0);
        this.modelSticks = new Array(this.atoms.getAtomsCount()).fill(1);
      }
    }
    // avoid the recursive loop
    if (this.guiManager.modelStyleController && this.guiManager.modelStyleController.getValue() !== newValue) {
      this.guiManager.modelStyleController.setValue(newValue); // Update the GUI
    }
    this.weas.eventHandlers.dispatchViewerUpdated({ modelStyle: newValue });
  }

  get radiusType() {
    return this._radiusType;
  }

  set radiusType(newValue) {
    this._radiusType = newValue;
    if (this.guiManager.radiusTypeController && this.guiManager.radiusTypeController.getValue() !== newValue) {
      this.guiManager.radiusTypeController.setValue(newValue); // Update the GUI
    }
    this.weas.eventHandlers.dispatchViewerUpdated({ radiusType: newValue });
    this.bondManager.init();
    this.polyhedraManager.init();
  }

  get colorBy() {
    return this._colorBy;
  }

  set colorBy(newValue) {
    this._colorBy = newValue;
    // avoid the recursive loop
    if (this.guiManager.colorByController && this.guiManager.colorByController.getValue() !== newValue) {
      this.guiManager.colorByController.setValue(newValue); // Update the GUI
    }
    this.weas.eventHandlers.dispatchViewerUpdated({ colorBy: newValue });
    // update the bondManager settings
    this.bondManager.init();
    this.polyhedraManager.init();
  }

  get colorType() {
    return this._colorType;
  }

  set colorType(newValue) {
    this._colorType = newValue;
    // avoid the recursive loop
    if (this.guiManager.colorTypeController && this.guiManager.colorTypeController.getValue() !== newValue) {
      this.guiManager.colorTypeController.setValue(newValue); // Update the GUI
    }
    this.weas.eventHandlers.dispatchViewerUpdated({ colorType: newValue });
    // update the bondManager settings
    this.bondManager.init();
    this.polyhedraManager.init();
  }

  get materialType() {
    return this._materialType;
  }

  set materialType(newValue) {
    this._materialType = newValue;
    // avoid the recursive loop
    if (this.guiManager.materialTypeController && this.guiManager.materialTypeController.getValue() !== newValue) {
      this.guiManager.materialTypeController.setValue(newValue); // Update the GUI
    }
    this.weas.eventHandlers.dispatchViewerUpdated({ materialType: newValue });
  }

  get atomLabelType() {
    return this._atomLabelType;
  }

  set atomLabelType(newValue) {
    this.logger.debug("updateAtomLabelType: ", newValue);
    this._atomLabelType = newValue;
    if (newValue === "None") {
      // Remove labels
      this.ALManager.settings = [];
    } else if (newValue === "Symbol") {
      this.ALManager.settings = [{ origins: "positions", texts: "species" }];
    } else if (newValue === "Index") {
      this.ALManager.settings = [{ origins: "positions", texts: "index" }];
    }
    this.ALManager.drawAtomLabels();
    // avoid the recursive loop
    if (this.guiManager.atomLabelTypeController && this.guiManager.atomLabelTypeController.getValue() !== newValue) {
      this.guiManager.atomLabelTypeController.setValue(newValue); // Update the GUI
    }
    this.weas.eventHandlers.dispatchViewerUpdated({ atomLabelType: newValue });
  }

  get boundary() {
    return this._boundary;
  }

  set boundary(newValue) {
    this._boundary = newValue;
    // avoid the recursive loop
    // this.guiManager.boundaryControllers is a 2x3 array
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 2; j++) {
        if (this.guiManager.boundaryControllers && this.guiManager.boundaryControllers[i][j].getValue() !== newValue[i][j]) {
          this.guiManager.boundaryControllers[i][j].setValue(newValue[i][j]); // Update the GUI
        }
      }
    }
    this.weas.eventHandlers.dispatchViewerUpdated({ boundary: newValue });
  }

  get showCell() {
    return this._showCell;
  }

  set showCell(newValue) {
    this._showCell = newValue;
    this.cellManager.showCell = newValue;
    // avoid the recursive loop
    if (this.guiManager.showCellController && this.guiManager.showCellController.getValue() !== newValue) {
      this.guiManager.showCellController.setValue(newValue); // Update the GUI
    }
    this.weas.eventHandlers.dispatchViewerUpdated({ showCell: newValue });
    this.weas.tjs.render();
  }

  get showBondedAtoms() {
    return this._showBondedAtoms;
  }

  set showBondedAtoms(newValue) {
    this._showBondedAtoms = newValue;
    // avoid the recursive loop
    if (this.guiManager.showBondedAtomsController && this.guiManager.showBondedAtomsController.getValue() !== newValue) {
      this.guiManager.showBondedAtomsController.setValue(newValue); // Update the GUI
    }
    this.weas.eventHandlers.dispatchViewerUpdated({ showBondedAtoms: newValue });
  }

  get atomScales() {
    return this._atomScales;
  }

  set atomScales(newValue) {
    this._atomScales = newValue;
    this.weas.eventHandlers.dispatchViewerUpdated({ atomScales: newValue });
  }

  get modelSticks() {
    return this._modelSticks;
  }

  set modelSticks(newValue) {
    this._modelSticks = newValue;
    this.weas.eventHandlers.dispatchViewerUpdated({ modelSticks: newValue });
  }

  get modelPolyhedras() {
    return this._modelPolyhedras;
  }

  set modelPolyhedras(newValue) {
    this._modelPolyhedras = newValue;
    this.weas.eventHandlers.dispatchViewerUpdated({ modelPolyhedras: newValue });
  }

  get selectedAtomsIndices() {
    return this._selectedAtomsIndices;
  }

  set selectedAtomsIndices(newValue) {
    // if the same atoms are selected, do nothing
    if (JSON.stringify(this._selectedAtomsIndices) === JSON.stringify(newValue)) {
      return;
    }
    // get new selected atoms from the difference between newValue and this._selectedAtomsIndices
    const newSelectedAtoms = newValue.filter((value) => !this._selectedAtomsIndices.includes(value));
    // get unselected atoms from the difference between this._selectedAtomsIndices and newValue
    const unselectedAtoms = this._selectedAtomsIndices.filter((value) => !newValue.includes(value));
    this._selectedAtomsIndices = newValue;
    this.weas.eventHandlers.dispatchViewerUpdated({ selectedAtomsIndices: newValue });
    // update the highlight and atom label
    this.updateHighlightAtomsMesh(newSelectedAtoms);
    this.updateHighlightAtomsMesh(unselectedAtoms, 0);
    // draw atom label
    // const texts = this.selectedAtomsIndices.map(index => this.atoms.symbols[index]);
    this.ALManager.settings = [{ origins: "positions", texts: this.selectedAtomsIndices, selection: this.selectedAtomsIndices }];
    this.ALManager.drawAtomLabels();
  }

  drawModels() {
    this.logger.debug("-----------------drawModels-----------------");
    this.dispose();
    this.cellManager.draw();
    // Map the symbols to their radii
    this.cutoffs = this.bondManager.buildBondDict();
    // find neighbor atoms in the original cell
    this.neighbors = findNeighbors(this.originalAtoms, this.cutoffs);
    this.logger.debug("neighbors: ", this.neighbors);
    // search boundary atoms
    this.boundaryList = searchBoundary(this.atoms, this._boundary);
    this.logger.debug("boundaryList: ", this.boundaryList);
    this.boundaryMap = createBoundaryMapping(this.boundaryList);
    this.logger.debug("boundaryMap: ", this.boundaryMap);
    // search atoms bonded to atoms, which includes the boundary atoms and the orginal atoms
    const atomsList = this.atoms.positions.map((_, index) => [index, [0, 0, 0]]);
    // merge the atomsList and boundaryList
    const offsets = atomsList.concat(this.boundaryList);
    // this.logger.debug("atoms with boundary: ", offsets)
    if (this._showBondedAtoms) {
      this.bondedAtoms = searchBondedAtoms(this.atoms.getSymbols(), offsets, this.neighbors, this.modelSticks);
    } else {
      this.bondedAtoms = { atoms: [], bonds: [] };
    }

    this.logger.debug("bondedAtoms: ", this.bondedAtoms);
    this.atomColors = getAtomColors(this.atoms, this.colorBy, { colorType: this.colorType, colorRamp: this._colorRamp });
    this.drawBalls();
    const bondMesh = this.bondManager.drawBonds();
    this.atomsMesh.add(bondMesh);
    const polyhedraMesh = this.polyhedraManager.drawPolyhedras();
    this.atomsMesh.add(polyhedraMesh);
    this.isosurfaceManager.drawIsosurfaces();
    this.VFManager.drawVectorFields();
    this.drawHighlightAtoms();
    this.ALManager.drawAtomLabels();
    this.ready = true;
    this.weas.tjs.render();
  }

  drawBalls() {
    // draw atoms
    this.atomsMesh = drawAtoms({ scene: this.tjs.scene, atoms: this.atoms, atomScales: this.atomScales, colors: this.atomColors, radiusType: this.radiusType, materialType: this._materialType });
    this.tjs.scene.add(this.atomsMesh);
    // atoms to be drawn, boundary atoms, and the bonded atoms
    // merge the boundaryList and the bondedAtoms
    this.imageAtomsList = this.bondedAtoms["atoms"].concat(this.boundaryList);
    // if boundaryList length > 0, draw boundary atoms
    if (this.imageAtomsList.length > 0) {
      // draw boundary atoms
      const imageAtomsList = getImageAtoms(this.atoms, this.imageAtomsList);
      // get the models, the indices and scales should read from this.atomScales
      let atomScales = new Array(imageAtomsList.getAtomsCount()).fill(1);
      // update the models indices and scales
      for (let i = 0; i < imageAtomsList.getAtomsCount(); i++) {
        atomScales[i] = this.atomScales[this.imageAtomsList[i][0]];
      }
      const atomColors = getAtomColors(imageAtomsList, this.colorBy, { colorType: this.colorType, defaultColor: "#0xffffff", colorRamp: this._colorRamp });
      this.boundaryAtomsMesh = drawAtoms({
        scene: this.tjs.scene,
        atoms: imageAtomsList,
        atomScales: atomScales,
        colors: atomColors,
        radiusType: this.radiusType,
        materialType: this._materialType,
        data_type: "boundary",
      });
      this.atomsMesh.add(this.boundaryAtomsMesh);
    }
  }

  drawHighlightAtoms() {
    // set all the atomScales to 0 to hide the atoms
    const atomScales = new Array(this.atoms.getAtomsCount()).fill(0);
    // use yellow color to highlight the selected atoms
    const atomColors = new Array(this.atoms.getAtomsCount()).fill(new THREE.Color(0xffff00));
    this.highlightAtomsMesh = drawAtoms({
      scene: this.tjs.scene,
      atoms: this.atoms,
      atomScales: atomScales,
      colors: atomColors,
      radiusType: this.radiusType,
      materialType: "Basic",
      data_type: "highlight",
    });
    this.atomsMesh.add(this.highlightAtomsMesh);
    this.highlightAtomsMesh.material.opacity = 0.6;
    this.highlightAtomsMesh.layers.set(1); // Set the layer to 1 to make it not selectable
    this.updateHighlightAtomsMesh(this.selectedAtomsIndices);
  }

  clearHighlightAtoms() {
    // Remove highlighted atom meshes from the highlightAtomsMesh group
    if (this.highlightAtomsMesh) {
      this.logger.debug("clearHighlightAtoms: ");
      clearObject(this.tjs.scene, this.highlightAtomsMesh);
    }
  }

  dispose() {
    // Remove the selected atom symbol element
    // this.tjs.containerElement.removeChild(this.selectedAtomsLabelElement);
    // Remove the selected atom mesh group
    // this.tjs.scene.remove(this.highlightAtomsMesh);
    // Remove the atom labels
    if (this.atomsMesh) {
      this.atomsMesh.dispose();
    }
    if (this.boundaryAtomsMesh) {
      this.boundaryAtomsMesh.dispose();
    }
    // Remove the unit cell
    clearObjects(this.tjs.scene, this.uuid);
  }

  // Method to delete selected atoms
  deleteSelectedAtoms(indices = null) {
    if (indices === null) {
      indices = this.selectedAtomsIndices;
    }
    // Remove the selected atoms from the scene and data
    this.atoms.deleteAtoms(indices);
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
  replaceSelectedAtoms(element, indices = null) {
    if (indices === null) {
      indices = this.selectedAtomsIndices;
    }
    // Remove the selected atoms from the scene and data
    this.atoms.replaceAtoms(Array.from(indices), element);

    // Update the visualization
    this.drawModels(); // Reapply the visualization
  }

  // Method to add atoms
  addAtom(element, position = { x: 0, y: 0, z: 0 }) {
    // Remove the selected atoms from the scene and data
    const atom = new Atom(element, [position.x, position.y, position.z]);
    this.atoms.addSpecies(element);
    this.atoms.addAtom(atom);
    // this.logger.debug("atoms: ", this.atoms);

    // add the properties, e.g. modelStyles, that are associated with the added atoms
    this.atomScales = this.atomScales.concat([this.atomScale]);
    this.modelSticks = this.modelSticks.concat([0]);
    this.modelPolyhedras = this.modelPolyhedras.concat([0]);

    // update bond settings
    this.bondManager.init();

    // Update the visualization
    this.drawModels(); // Reapply the visualization
  }

  // Method to copy atoms
  copyAtoms(indices = null) {
    /* Copy the selected atoms and add them to the atoms object
     */
    if (indices === null) {
      indices = this.selectedAtomsIndices;
    }
    const copied_atoms = this.atoms.getAtomsByIndices(indices);
    this.logger.debug("copied_atoms: ", copied_atoms);
    this.atoms.addToSelf(copied_atoms);
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

  setAtomPosition(index, position) {
    // Update the atom position
    const matrix = new THREE.Matrix4();
    this.atomsMesh.getMatrixAt(index, matrix);
    matrix.setPosition(position);
    this.atomsMesh.setMatrixAt(index, matrix);
    this.atoms.positions[index] = [position.x, position.y, position.z];
    // update the other meshes
    this.updateBoundaryAtomsMesh(index);
    this.bondManager.updateBondMesh(index);
  }

  resetSelectedAtomsPositions(initialAtomPositions, indices = null) {
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
      this.setAtomPosition(atomIndex, initialPosition);
    });
    this.atomsMesh.instanceMatrix.needsUpdate = true;
  }

  translateSelectedAtoms(translateVector, indices = null) {
    // translating selected atoms by translateVector
    // if indices is null, translate all selected atoms
    if (indices === null) {
      indices = this.selectedAtomsIndices;
    }
    if (indices.length === 0) {
      return;
    }
    indices.forEach((atomIndex) => {
      const initialPosition = new THREE.Vector3(...this.atoms.positions[atomIndex]);
      const newPosition = initialPosition.clone().add(translateVector);
      this.setAtomPosition(atomIndex, newPosition);
    });

    this.atomsMesh.instanceMatrix.needsUpdate = true;
    // if boundaryAtomsMesh has instanceMatrix, update it
    if (this.boundaryAtomsMesh) {
      this.boundaryAtomsMesh.instanceMatrix.needsUpdate = true;
    }
    if (this.bondsMesh) {
      this.bondsMesh.instanceMatrix.needsUpdate = true;
    }
  }

  rotateSelectedAtoms(cameraDirection, rotationAngle, indices = null, centroid = null) {
    /* Rotate the selected atoms around the cameraDirection by rotationAngle
    rotationAngle is in degrees
    */
    // normalize the cameraDirection
    cameraDirection = cameraDirection.normalize();
    rotationAngle = THREE.MathUtils.degToRad(rotationAngle);
    const rotationMatrix = new THREE.Matrix4().makeRotationAxis(cameraDirection, -rotationAngle);
    if (indices === null) {
      indices = this.selectedAtomsIndices;
    }
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
    indices.forEach((atomIndex) => {
      const newPosition = new THREE.Vector3(...this.atoms.positions[atomIndex]);
      // Translate to the centroid, apply rotation, then translate back
      newPosition
        .sub(centroid) // Translate to centroid
        .applyMatrix4(rotationMatrix) // Apply rotation
        .add(centroid); // Translate back
      this.setAtomPosition(atomIndex, newPosition);
    });

    this.atomsMesh.instanceMatrix.needsUpdate = true;
    // if boundaryAtomsMesh has instanceMatrix, update it
    if (this.boundaryAtomsMesh) {
      this.boundaryAtomsMesh.instanceMatrix.needsUpdate = true;
    }
  }

  updateBoundaryAtomsMesh(atomIndex) {
    /* When the atom is moved, the boundary atoms should be moved as well.
     */
    // this.logger.debug("this.boundaryList: ", this.boundaryList);
    // this.logger.debug("updateBoundaryAtomsMesh: ", atomIndex);
    // this.logger.debug("this.boundaryMap[atomIndex]:", this.boundaryMap[atomIndex]);
    if (this.boundaryList.length > 0 && this.boundaryMap[atomIndex]) {
      // this.logger.debug("updateBoundaryAtomsMesh: ", atomIndex);
      const atomList = this.boundaryMap[atomIndex];
      // loop all atomList and update the boundary atoms
      atomList.forEach((atom) => {
        const boundaryAtomIndex = atom.index;
        const newPosition = this.atoms.positions[atomIndex].map((value, index) => value + calculateCartesianCoordinates(this.atoms.cell, atom.offset)[index]);
        // Update the atom position
        const matrix = new THREE.Matrix4();
        this.boundaryAtomsMesh.getMatrixAt(boundaryAtomIndex, matrix);
        matrix.setPosition(new THREE.Vector3(...newPosition));
        this.boundaryAtomsMesh.setMatrixAt(boundaryAtomIndex, matrix);
      });
    }
  }

  updateHighlightAtomsMesh(indices, factor = 1.1) {
    /* When the atom is moved, the boundary atoms should be moved as well.
     */
    if (this.atoms.symbols.length > 0) {
      const position = new THREE.Vector3();
      const rotation = new THREE.Quaternion();
      const scale = new THREE.Vector3();
      indices.forEach((index) => {
        // Update the atom position
        const matrix = new THREE.Matrix4();
        this.atomsMesh.getMatrixAt(index, matrix);
        // Decompose the original matrix into its components
        matrix.decompose(position, rotation, scale);
        // scale by factor
        scale.multiplyScalar(factor);
        // Recompose the matrix with the new scale
        matrix.compose(position, rotation, scale);
        this.highlightAtomsMesh.setMatrixAt(index, matrix);
      });
      this.highlightAtomsMesh.instanceMatrix.needsUpdate = true;
    }
  }
}

export { AtomsViewer };
