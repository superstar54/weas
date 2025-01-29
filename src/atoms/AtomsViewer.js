import * as THREE from "three";
import { CellManager } from "./cell.js";
import { AtomManager } from "./plugins/atom.js";
import { BondManager, defaultBondRadius, searchBondedAtoms } from "./plugins/bond.js";
import { clearObjects, clearObject } from "../utils.js";
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
    this.atomManager = new AtomManager(this);
    this.cellManager = new CellManager(this, { showCell: viewerSettings.showCell, showAxes: viewerSettings.showAxes });
    this.highlightManager = new HighlightManager(this);
    this.guiManager = new AtomsGUI(this, this.weas.guiManager.gui, this.weas.guiManager.guiConfig); // Pass guiConfig
    this.bondManager = new BondManager(this, {
      hideLongBonds: viewerSettings.hideLongBonds,
      showHydrogenBonds: viewerSettings.showHydrogenBonds,
      showOutBoundaryBonds: viewerSettings.showOutBoundaryBonds,
    });
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
    this.init(atoms);
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
    this.boundaryList = null;
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
    // update the atoms
    this.atomManager.updateAtomMesh(null, atoms);
    // update the bonds
    this.bondManager.updateBondMesh(null, atoms);
    // update vector fields related to the atoms attribute
    this.VFManager.updateArrowMesh(null, atoms);
    // update cell
    this.cellManager.updateCellMesh(this.originalCell);
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
    this.selectedAtomsIndices = [];
    // set cell
    this.cellManager.cell = this.atoms.cell;
    // initialize the bond settings
    // the following plugins read the atoms attribute, so they need to be updated
    this.atomManager.init();
    this.highlightManager.init();
    this.bondManager.init();
    this.polyhedraManager.init();
    this.VFManager.init();
    // for other plugins, they need to be reset
    this.isosurfaceManager.reset();
    this.volumeSliceManager.reset();
    this.Measurement.reset();
    // if trajectory data is provided, add the trajectory controller
    this.guiManager.update(this.trajectory);
    this.guiManager.updateLegend();
    // this.atoms.uuid = this.uuid;
    this.modelStyle = this._modelStyle;
    this.drawModels();
    this.selectedAtomsIndices = [];
    // udpate camera position and target position based on the atoms
    this.tjs.updateCameraAndControls({ direction: [0, 0, 100] });
    this.logger.debug("Set atoms successfullly");
  }

  // set atoms from phonon trajectory
  fromPhononMode({ atoms, eigenvectors, amplitude = 1, factor = 1, nframes = 30, kpoint = [0, 0, 0], repeat = [1, 1, 1], color = "#ff0000", radius = 0.1 }) {
    this.logger.debug("--------------------------------------From Phonon Mode--------------------------------------");
    const phonon = new Phonon(atoms, kpoint, eigenvectors, true);
    const trajectory = phonon.getTrajectory(amplitude, nframes, null, null, null, repeat);
    this.atoms = trajectory;
    this._cell = atoms.cell;
    this._atoms = atoms.multiply(...repeat);
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
    newValue = parseInt(newValue);
    this.logger.debug("updateModelStyle: ", newValue);
    this.updateModelStyles(newValue);
    this.weas.eventHandlers.dispatchViewerUpdated({ modelStyle: newValue });
  }

  get radiusType() {
    return this._radiusType;
  }

  set radiusType(newValue) {
    if (this._radiusType !== newValue) {
      this._radiusType = newValue;
      this.weas.eventHandlers.dispatchViewerUpdated({ radiusType: newValue });
      this.atomManager.init();
      this.bondManager.init();
      this.polyhedraManager.init();
    }
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
    this.atomManager.init();
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
    this.atomManager.init();
    this.guiManager.updateLegend();
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
    } else if (newValue.toUpperCase() === "SYMBOL") {
      this.ALManager.settings = [{ origins: "positions", texts: "symbols" }];
    } else if (newValue.toLocaleUpperCase() === "INDEX") {
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

  get atomScale() {
    return this._atomScale;
  }

  set atomScale(newValue) {
    if (this._atomScale !== newValue) {
      this._atomScale = newValue;
      this.weas.eventHandlers.dispatchViewerUpdated({ atomScale: newValue });
      this.atomManager.updateAtomScale(newValue);
    }
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
    this.highlightManager.settings["selection"].indices = newValue;
    // get new selected atoms from the difference between newValue and this._selectedAtomsIndices
    const newSelectedAtoms = newValue.filter((value) => !this._selectedAtomsIndices.includes(value));
    // get unselected atoms from the difference between this._selectedAtomsIndices and newValue
    const unselectedAtoms = this._selectedAtomsIndices.filter((value) => !newValue.includes(value));
    this._selectedAtomsIndices = newValue;
    this.weas.eventHandlers.dispatchViewerUpdated({ selectedAtomsIndices: newValue });
    // update the highlight and atom label
    this.highlightManager.updateHighlightAtomsMesh({ indices: newSelectedAtoms, factor: 1.1, type: "sphere" });
    this.highlightManager.updateHighlightAtomsMesh({ indices: unselectedAtoms, factor: 0, type: "sphere" });
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
    this.bondManager.buildNeighborList();
    this.boundaryManager.getBoundaryAtoms();
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
    this.weas.tjs.render();
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

    // Update the bond settings
    this.atomManager.init();
    this.bondManager.init();

    // Update the visualization
    this.drawModels(); // Reapply the visualization
  }

  // Method to add atoms
  addAtom(element, position = { x: 0, y: 0, z: 0 }) {
    // Remove the selected atoms from the scene and data
    const atom = new Atom(element, [position.x, position.y, position.z]);
    // if element is not in the species, add it to the species
    if (!this.atoms.species[element]) {
      this.atoms.addSpecie(element);
    }
    this.atoms.addAtom(atom);
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
  copyAtoms(indices = null) {
    /* Copy the selected atoms and add them to the atoms object
     */
    if (indices === null) {
      indices = this.selectedAtomsIndices;
    }
    const copied_atoms = this.atoms.getAtomsByIndices(indices);
    this.logger.debug("copied_atoms: ", copied_atoms);
    this.atoms.add(copied_atoms);
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
    this.atomManager.meshes["atom"].getMatrixAt(index, matrix);
    matrix.setPosition(position);
    this.atomManager.meshes["atom"].setMatrixAt(index, matrix);
    this.atoms.positions[index] = [position.x, position.y, position.z];
    // update the other meshes
    this.atomManager.updateImageAtomsMesh(index);
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
    this.atomManager.meshes["atom"].instanceMatrix.needsUpdate = true;
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

    this.atomManager.meshes["atom"].instanceMatrix.needsUpdate = true;
    // if imageAtomsMesh has instanceMatrix, update it
    if (this.atomManager.meshes["image"]) {
      this.atomManager.meshes["image"].instanceMatrix.needsUpdate = true;
    }
    if (this.bondManager.bondMesh) {
      this.bondManager.bondMesh.instanceMatrix.needsUpdate = true;
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

    this.atomManager.meshes["atom"].instanceMatrix.needsUpdate = true;
    // if imageAtomsMesh has instanceMatrix, update it
    if (this.atomManager.meshes["image"]) {
      this.atomManager.meshes["image"].instanceMatrix.needsUpdate = true;
    }
  }

  setAttribute(name, values, domain = "atom") {
    // loop all the atoms in the trajectory
    this.trajectory.forEach((atoms) => {
      atoms.newAttribute(name, values, domain);
    });
  }

  updateModelStyles(newValue) {
    if (this.selectedAtomsIndices.length > 0) {
      if (newValue === 0) {
        this.selectedAtomsIndices.forEach((atomIndex) => {
          this.atomScales[atomIndex] = 1;
          this.modelSticks[atomIndex] = newValue;
          this.modelPolyhedras[atomIndex] = 0;
        });
      } else if (newValue === 1) {
        this.selectedAtomsIndices.forEach((atomIndex) => {
          this.atomScales[atomIndex] = 0.4;
          this.modelSticks[atomIndex] = newValue;
          this.modelPolyhedras[atomIndex] = 0;
        });
      } else if (newValue === 2) {
        this.selectedAtomsIndices.forEach((atomIndex) => {
          this.atomScales[atomIndex] = 0.4;
          this.modelSticks[atomIndex] = newValue;
          this.modelPolyhedras[atomIndex] = 1;
        });
      } else if (newValue === 3) {
        this.selectedAtomsIndices.forEach((atomIndex) => {
          this.atomScales[atomIndex] = 0;
          this.modelSticks[atomIndex] = newValue;
          this.modelPolyhedras[atomIndex] = 0;
        });
      } else if (newValue === 4) {
        this.selectedAtomsIndices.forEach((atomIndex) => {
          this.atomScales[atomIndex] = 0;
          this.modelSticks[atomIndex] = newValue;
          this.modelPolyhedras[atomIndex] = 0;
        });
      }
    } else {
      // clear this.models
      this._modelStyle = newValue;
      this.modelSticks = new Array(this.atoms.getAtomsCount()).fill(0);
      this.modelPolyhedras = new Array(this.atoms.getAtomsCount()).fill(0);
      if (newValue === 0) {
        this.atomScales = new Array(this.atoms.getAtomsCount()).fill(1);
      } else if (newValue === 1) {
        this.atomScales = new Array(this.atoms.getAtomsCount()).fill(0.4);
        this.modelSticks = new Array(this.atoms.getAtomsCount()).fill(1);
      } else if (newValue === 2) {
        this.atomScales = new Array(this.atoms.getAtomsCount()).fill(0.4);
        this.modelSticks = new Array(this.atoms.getAtomsCount()).fill(2);
        this.modelPolyhedras = new Array(this.atoms.getAtomsCount()).fill(1);
      } else if (newValue === 3) {
        this.atomScales = new Array(this.atoms.getAtomsCount()).fill(0);
        this.modelSticks = new Array(this.atoms.getAtomsCount()).fill(3);
      } else if (newValue === 4) {
        this.atomScales = new Array(this.atoms.getAtomsCount()).fill(0);
        this.modelSticks = new Array(this.atoms.getAtomsCount()).fill(4);
      }
    }
  }
}

export { AtomsViewer };
