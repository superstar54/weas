import * as THREE from "three";
import { covalentRadii } from "./atoms_data.js";
import { ReplaceOperation, AddAtomOperation } from "../operation/atoms.js";
import { MODEL_STYLE_MAP, colorTypes, colorBys, radiusTypes } from "../config.js";
import AtomsLegend from "./plugins/AtomsLegend.js";

class AtomsGUI {
  constructor(viewer, gui, guiConfig) {
    this.viewer = viewer;
    this.gui = gui;
    this.guiConfig = guiConfig;
    this.tempBoundary = [
      [0, 0],
      [0, 0],
      [0, 0],
    ];
    this.div = document.createElement("div");
    this.viewer.tjs.containerElement.appendChild(this.div);

    if (this.guiConfig.controls.atomsControl) {
      this.addAtomsControl();
    }
    if (this.guiConfig.controls.colorControl) {
      this.addColorControl();
    }
    // Initialize legend
    this.legend = new AtomsLegend(this.viewer, this.guiConfig);
  }

  update(trajectory) {
    if (this.guiConfig.timeline.enabled && trajectory.length > 1) {
      this.addTimeline();
      this.timeline.max = trajectory.length - 1;
    } else {
      this.removeTimeline();
    }
  }

  addAtomsControl() {
    const atomsFolder = this.gui.addFolder("Atoms");
    // Model Style Control
    this.modelStyleController = atomsFolder
      .add({ modelStyle: this.viewer.modelStyle }, "modelStyle", MODEL_STYLE_MAP)
      .onChange((value) => {
        this.viewer.modelStyle = value;
        this.viewer.drawModels();
      })
      .name("Model Style");
    // Radius Type Control
    this.radiusTypeController = atomsFolder
      .add({ radiusType: this.viewer.radiusType }, "radiusType", radiusTypes)
      .onChange((value) => {
        this.viewer.radiusType = value;
        this.viewer.drawModels();
      })
      .name("Radius Type");
    // Atom Label Control
    this.atomLabelTypeController = atomsFolder
      .add(this.viewer, "atomLabelType", ["None", "Symbol", "Index"])
      .onChange((value) => {
        this.viewer.atomLabelType = value;
      })
      .name("Atom Label");
    // Material Type Control
    this.materialTypeController = atomsFolder
      .add(this.viewer, "materialType", ["Standard", "Phong", "Basic"])
      .onChange((value) => {
        this.viewer.materialType = value;
        this.viewer.drawModels();
      })
      .name("Material Type");
    // Atom Scale Control
    atomsFolder.add(this.viewer, "atomScale", 0.1, 2.0).onChange(this.viewer.atomManager.updateAtomScale.bind(this.viewer.atomManager)).name("Atom Scale");
    // Show Cell Control
    this.showCellController = atomsFolder
      .add(this.viewer, "showCell")
      .name("Unit Cell")
      .onChange((value) => {
        this.viewer.showCell = value;
      });
    // Show Bonded Atoms Control
    this.showBondedAtomsController = atomsFolder
      .add(this.viewer, "showBondedAtoms")
      .name("Bonded Atoms")
      .onChange((value) => {
        this.viewer.showBondedAtoms = value;
        this.viewer.drawModels();
      });
    // Replace Atom Folder
    this.addReplaceAtomControl(atomsFolder);
    // Add Atom Folder
    this.addAddAtomControl(atomsFolder);
    // Boundary Controls
    this.addBoundaryControl(atomsFolder);
  }

  addReplaceAtomControl(atomsFolder) {
    const replaceAtomFolder = atomsFolder.addFolder("Replace Atom");
    const newElementData = { symbol: "C" };
    this.replaceAtomController = replaceAtomFolder.add(newElementData, "symbol").name("New Element Symbol");
    replaceAtomFolder
      .add(
        {
          replaceSelectedAtoms: () => {
            const newElementSymbol = newElementData.symbol;
            if (this.viewer.selectedAtomsIndices && this.viewer.selectedAtomsIndices.length > 0) {
              const replaceOperation = new ReplaceOperation(this.viewer.weas, newElementSymbol);
              this.viewer.weas.ops.execute(replaceOperation);
              this.viewer.weas.eventHandlers.dispatchAtomsUpdated();
            } else {
              alert("No atoms selected for replacement.");
            }
          },
        },
        "replaceSelectedAtoms",
      )
      .name("Replace Selected Atoms");
  }

  addAddAtomControl(atomsFolder) {
    const addAtomFolder = atomsFolder.addFolder("Add Atom");
    const addElementData = { symbol: "C" };
    this.addAtomController = addAtomFolder.add(addElementData, "symbol").name("New Element Symbol");
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
  }

  addBoundaryControl(atomsFolder) {
    const boundaryFolder = atomsFolder.addFolder("Boundary");
    this.boundaryControllers = [[], [], []];
    const dimensions = ["X", "Y", "Z"];
    dimensions.forEach((dim, i) => {
      this.boundaryControllers[i].push(
        boundaryFolder
          .add({ [`min${dim}`]: this.viewer.boundary[i][0] }, `min${dim}`, -10.0, 10.0)
          .onChange((newValue) => this.updateBoundaryValue(i, 0, newValue))
          .name(`Min ${dim}`),
      );
      this.boundaryControllers[i].push(
        boundaryFolder
          .add({ [`max${dim}`]: this.viewer.boundary[i][1] }, `max${dim}`, -10.0, 10.0)
          .onChange((newValue) => this.updateBoundaryValue(i, 1, newValue))
          .name(`Max ${dim}`),
      );
    });
    boundaryFolder.add({ apply: () => this.applyBoundaryChanges() }, "apply").name("Apply Changes");
  }

  addColorControl() {
    const colorFolder = this.gui.addFolder("Color");
    // Background Color Control
    colorFolder
      .addColor(this.viewer, "backgroundColor")
      .onChange((color) => {
        this.viewer.tjs.scene.background = new THREE.Color(color);
      })
      .name("Background");
    // Color By Control
    this.colorByController = colorFolder
      .add({ colorBy: this.viewer.colorBy }, "colorBy", colorBys)
      .onChange((value) => {
        this.viewer.colorBy = value;
        this.viewer.drawModels();
      })
      .name("Color By");
    // Color Type Control
    this.colorTypeController = colorFolder
      .add({ colorType: this.viewer.colorType }, "colorType", colorTypes)
      .onChange((value) => {
        this.viewer.colorType = value;
        this.viewer.drawModels();
      })
      .name("Color Type");
  }

  addTimeline() {
    if (this.div.querySelector("#animation-controls")) {
      return;
    }
    const animation_div = document.createElement("div");
    animation_div.id = "animation-controls";
    animation_div.innerHTML =
      '<button id="play-pause-btn">Play</button><button id="reset-btn">Reset</button><input type="range" id="timeline" min="0" max="100" value="0"><span id="current-frame">0</span>';
    this.div.appendChild(animation_div);

    this.playPauseBtn = this.div.querySelector("#play-pause-btn");
    this.resetBtn = this.div.querySelector("#reset-btn");
    this.timeline = this.div.querySelector("#timeline");
    this.currentFrameDisplay = this.div.querySelector("#current-frame");

    this.isPlaying = false;
    const maxFrame = 100;
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
    const animation_div = this.div.querySelector("#animation-controls");
    if (animation_div) {
      animation_div.remove();
    }
  }

  updateBoundaryValue(dimension, index, value) {
    this.tempBoundary[dimension][index] = parseFloat(value);
  }

  applyBoundaryChanges() {
    this.viewer.boundary = this.tempBoundary;
    this.viewer.drawModels();
  }

  addLegend() {
    // Remove existing legend if any
    this.removeLegend();

    // Create legend container
    const legendContainer = document.createElement("div");
    legendContainer.id = "legend-container";
    legendContainer.style.position = "absolute";
    legendContainer.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
    legendContainer.style.padding = "10px";
    legendContainer.style.borderRadius = "5px";
    legendContainer.style.zIndex = "1000";
    // Positioning based on configuration
    this.setLegendPosition(legendContainer);

    console.log("settings: ", this.viewer.atomManager.settings);

    // Add entries for each unique element
    Object.entries(this.viewer.atomManager.settings).forEach(([symbol, setting]) => {
      const legendEntry = document.createElement("div");
      legendEntry.style.display = "flex";
      legendEntry.style.alignItems = "center";
      legendEntry.style.marginBottom = "5px";

      // Sphere representation
      const sphereCanvas = document.createElement("canvas");
      sphereCanvas.width = 20;
      sphereCanvas.height = 20;
      const context = sphereCanvas.getContext("2d");
      context.fillStyle = `#${setting.color.getHexString()}`;
      const radius = setting.radius * 10;
      console.log("color: ", context.fillStyle);
      console.log("radius: ", radius);
      context.beginPath();
      context.arc(10, 10, radius, 0, Math.PI * 2);
      context.fill();

      legendEntry.appendChild(sphereCanvas);

      // Symbol label
      const elementLabel = document.createElement("span");
      elementLabel.textContent = ` ${symbol}`;
      elementLabel.style.marginLeft = "5px";
      elementLabel.style.fontSize = "14px";
      legendEntry.appendChild(elementLabel);

      legendContainer.appendChild(legendEntry);
    });

    // Append legend to viewer container
    this.viewer.tjs.containerElement.appendChild(legendContainer);
  }

  removeLegend() {
    const existingLegend = this.viewer.tjs.containerElement.querySelector("#legend-container");
    if (existingLegend) {
      existingLegend.remove();
    }
  }

  updateLegend() {
    this.legend.updateLegend();
  }

  setLegendPosition(legendContainer) {
    const position = this.guiConfig.legend.position || "top-right";
    legendContainer.style.top = position.includes("top") ? "10px" : "";
    legendContainer.style.bottom = position.includes("bottom") ? "10px" : "";
    legendContainer.style.left = position.includes("left") ? "10px" : "";
    legendContainer.style.right = position.includes("right") ? "10px" : "";
  }
}

export { AtomsGUI };
