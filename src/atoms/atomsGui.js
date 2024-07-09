import * as THREE from "three";
import { covalentRadii } from "./atoms_data.js";
import { ReplaceOperation, AddAtomOperation } from "../operation/atoms.js";
import { MODEL_STYLE_MAP, colorTypes, colorBys, radiusTypes } from "../config.js";

class AtomsGUI {
  constructor(viewer, gui) {
    this.viewer = viewer;
    this.gui = gui;
    this.tempBoundary = [
      [0, 0],
      [0, 0],
      [0, 0],
    ]; // Initialize with default values
    this.addAtomsControl();
  }

  // update the GUI when setting a new atoms
  update(trajectory) {
    if (trajectory.length > 1) {
      this.addTimeline();
      this.timeline.max = trajectory.length - 1;
    } else {
      // remove the timeline controller
      this.removeTimeline();
    }
  }

  addAtomsControl() {
    const atomsFolder = this.gui.addFolder("Atoms");
    // -----------------------------------------------------------------------------------------
    this.modelStyleController = atomsFolder
      .add({ modelStyle: this.viewer.modelStyle }, "modelStyle", MODEL_STYLE_MAP)
      .onChange((value) => {
        this.viewer.modelStyle = value;
        this.viewer.drawModels();
      })
      .name("Model Style");
    // -----------------------------------------------------------------------------------------
    this.radiusTypeController = atomsFolder
      .add({ radiusType: this.viewer.radiusType }, "radiusType", radiusTypes)
      .onChange((value) => {
        this.viewer.radiusType = value;
        this.viewer.drawModels();
      })
      .name("Radius Type");
    // -----------------------------------------------------------------------------------------
    this.atomLabelTypeController = atomsFolder
      .add(this.viewer, "atomLabelType", ["None", "Symbol", "Index"])
      .onChange((value) => {
        this.viewer.atomLabelType = value;
      })
      .name("Atom Label");
    // -----------------------------------------------------------------------------------------
    this.materialTypeController = atomsFolder
      .add(this.viewer, "materialType", ["Standard", "Phong", "Basic"])
      .onChange((value) => {
        this.viewer.materialType = value;
        this.viewer.drawModels();
      })
      .name("Material Type");
    atomsFolder.add(this.viewer, "atomScale", 0.1, 2.0).onChange(this.updateAtomScale.bind(this)).name("Atom Scale");
    // Add control to toggle the visibility of the unit cell
    this.showCellController = atomsFolder
      .add(this.viewer, "showCell")
      .name("Unit Cell")
      .onChange((value) => {
        this.viewer.showCell = value;
      });
    this.showBondedAtomsController = atomsFolder
      .add(this.viewer, "showBondedAtoms")
      .name("Bonded Atoms")
      .onChange((value) => {
        this.viewer.showBondedAtoms = value;
        this.viewer.drawModels();
      });
    // -----------------------------------------------------------------------------------------
    // Add a folder for replacing atoms
    const replaceAtomFolder = atomsFolder.addFolder("Replace Atom");
    // Add a controller for inputting the new element symbol
    const newElementData = { symbol: "C" }; // Default to Carbon
    this.replaceAtomController = replaceAtomFolder.add(newElementData, "symbol").name("New Element Symbol");

    // Add a button to perform the replacement
    replaceAtomFolder
      .add(
        {
          replaceSelectedAtoms: () => {
            const newElementSymbol = newElementData.symbol;
            // this.viewer.selectedAtomsIndices is a set
            if (this.viewer.selectedAtomsIndices && this.viewer.selectedAtomsIndices.length > 0) {
              const replaceOperation = new ReplaceOperation(this.viewer.weas, newElementSymbol);
              this.viewer.weas.ops.execute(replaceOperation);
              this.viewer.weas.eventHandlers.dispatchAtomsUpdated();
            } else {
              alert("No atoms selected for replacement."); // Feedback for no selection
            }
          },
        },
        "replaceSelectedAtoms",
      )
      .name("Replace Selected Atoms");
    // -----------------------------------------------------------------------------------------
    const addAtomFolder = atomsFolder.addFolder("Add Atom");
    // Add a controller for inputting the new element symbol
    const addElementData = { symbol: "C" }; // Default to Carbon
    this.addAtomController = addAtomFolder.add(addElementData, "symbol").name("New Element Symbol");
    // Add a button to perform the addment
    addAtomFolder
      .add(
        {
          addAtoms: () => {
            const addAtomOperation = new AddAtomOperation(this.viewer.weas, addElementData.symbol);
            this.viewer.weas.ops.execute(addAtomOperation);
            this.viewer.weas.eventHandlers.dispatchAtomsUpdated();
          },
        },
        "addAtoms",
      )
      .name("Add Selected Atoms");
    // -----------------------------------------------------------------------------------------
    // Add boundary field to GUI
    const boundaryFolder = atomsFolder.addFolder("Boundary");
    this.boundaryControllers = [[], [], []];
    let control;
    // Add fields for each boundary value
    control = boundaryFolder
      .add({ minX: this.viewer.boundary[0][0] }, "minX", -10.0, 10.0)
      .onChange((newValue) => this.updateBoundaryValue(0, 0, newValue))
      .name("Min X");
    this.boundaryControllers[0].push(control);
    control = boundaryFolder
      .add({ maxX: this.viewer.boundary[0][1] }, "maxX", -10.0, 10.0)
      .onChange((newValue) => this.updateBoundaryValue(0, 1, newValue))
      .name("Max X");
    this.boundaryControllers[0].push(control);
    control = boundaryFolder
      .add({ minY: this.viewer.boundary[1][0] }, "minY", -10.0, 10.0)
      .onChange((newValue) => this.updateBoundaryValue(1, 0, newValue))
      .name("Min Y");
    this.boundaryControllers[1].push(control);
    control = boundaryFolder
      .add({ maxY: this.viewer.boundary[1][1] }, "maxY", -10.0, 10.0)
      .onChange((newValue) => this.updateBoundaryValue(1, 1, newValue))
      .name("Max Y");
    this.boundaryControllers[1].push(control);
    control = boundaryFolder
      .add({ minZ: this.viewer.boundary[2][0] }, "minZ", -10.0, 10.0)
      .onChange((newValue) => this.updateBoundaryValue(2, 0, newValue))
      .name("Min Z");
    this.boundaryControllers[2].push(control);
    control = boundaryFolder
      .add({ maxZ: this.viewer.boundary[2][1] }, "maxZ", -10.0, 10.0)
      .onChange((newValue) => this.updateBoundaryValue(2, 1, newValue))
      .name("Max Z");
    this.boundaryControllers[2].push(control);
    // Add Apply Button
    boundaryFolder.add({ apply: () => this.applyBoundaryChanges() }, "apply").name("Apply Changes");
  }

  addColorControl() {
    const colorFolder = this.gui.addFolder("Color");
    colorFolder
      .addColor(this.viewer, "backgroundColor")
      .onChange((color) => {
        this.viewer.tjs.scene.background = new THREE.Color(color);
      })
      .name("Background");
    // -----------------------------------------------------------------------------------------
    this.colorByController = colorFolder
      .add({ colorBy: this.viewer.colorBy }, "colorBy", colorBys)
      .onChange((value) => {
        this.viewer.colorBy = value;
        this.viewer.drawModels();
      })
      .name("Color By");
    // -----------------------------------------------------------------------------------------
    this.colorTypeController = colorFolder
      .add({ colorType: this.viewer.colorType }, "colorType", colorTypes)
      .onChange((value) => {
        this.viewer.colorType = value;
        this.viewer.drawModels();
      })
      .name("Color Type");
  }

  addTimeline() {
    // Check if timeline already exists
    if (document.getElementById("animation-controls")) {
      return; // Exit if timeline already added
    }
    // create a div to hold the timeline controls with id "animation-controls"
    const animation_div = document.createElement("div");
    animation_div.id = "animation-controls";
    animation_div.innerHTML =
      '<button id="play-pause-btn">Play</button><button id="reset-btn">Reset</button><input type="range" id="timeline" min="0" max="100" value="0"><span id="current-frame">0</span>';
    this.viewer.tjs.containerElement.appendChild(animation_div);
    //
    this.playPauseBtn = document.getElementById("play-pause-btn");
    this.resetBtn = document.getElementById("reset-btn");
    this.timeline = document.getElementById("timeline");
    this.currentFrameDisplay = document.getElementById("current-frame");

    this.isPlaying = false;
    const maxFrame = 100; // Set this to the animation's total frames
    this.timeline.max = maxFrame;

    this.playPauseBtn.addEventListener("click", () => {
      this.viewer.isPlaying = !this.viewer.isPlaying;
      this.playPauseBtn.textContent = this.viewer.isPlaying ? "Pause" : "Play";
      if (this.viewer.isPlaying) {
        this.viewer.play();
      }
    });

    this.resetBtn.addEventListener("click", () => {
      this.viewer.currentFrame = 0;
    });

    this.timeline.addEventListener("input", () => {
      this.viewer.currentFrame = parseInt(this.timeline.value, 10);
    });
  }

  removeTimeline() {
    const animation_div = document.getElementById("animation-controls");
    if (animation_div) {
      animation_div.remove();
    }
  }

  // Method to update the scale of atoms
  updateAtomScale() {
    const position = new THREE.Vector3();
    const rotation = new THREE.Quaternion();
    const scale = new THREE.Vector3();

    let mesh = this.viewer.atomsMesh;
    for (let i = 0; i < mesh.count; i++) {
      const instanceMatrix = new THREE.Matrix4();
      const radius = covalentRadii[this.viewer.atoms.symbols[i]] || 1;
      mesh.getMatrixAt(i, instanceMatrix); // Get the original matrix of the instance
      // Decompose the original matrix into its components
      instanceMatrix.decompose(position, rotation, scale);
      // Set the scale to the new value
      scale.set(radius * this.viewer.atomScale, radius * this.viewer.atomScale, radius * this.viewer.atomScale);
      // Recompose the matrix with the new scale
      instanceMatrix.compose(position, rotation, scale);
      mesh.setMatrixAt(i, instanceMatrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    // update the boundary atoms
    mesh = this.viewer.boundaryAtomsMesh;
    for (let i = 0; i < mesh.count; i++) {
      const instanceMatrix = new THREE.Matrix4();
      const atomIndex = this.viewer.boundaryList[i][0];
      const radius = covalentRadii[this.viewer.atoms.symbols[atomIndex]] || 1;
      mesh.getMatrixAt(i, instanceMatrix); // Get the original matrix of the instance
      // Decompose the original matrix into its components
      instanceMatrix.decompose(position, rotation, scale);
      // Set the scale to the new value
      scale.set(radius * this.viewer.atomScale, radius * this.viewer.atomScale, radius * this.viewer.atomScale);
      // Recompose the matrix with the new scale
      instanceMatrix.compose(position, rotation, scale);
      mesh.setMatrixAt(i, instanceMatrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }

  // Function to update boundary values
  updateBoundaryValue(dimension, index, value) {
    this.tempBoundary[dimension][index] = parseFloat(value);
  }

  applyBoundaryChanges() {
    this.viewer.boundary = this.tempBoundary; // Update the actual boundary
    // Call any necessary update functions here
    this.viewer.drawModels();
  }
}

export { AtomsGUI };
