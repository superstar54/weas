import * as THREE from "three";
import { covalentRadii } from "./data/atomsData";
import { ReplaceOperation, AddAtomOperation } from "../operation/atoms";
import { MODEL_STYLE_MAP, colorTypes, colorBys, radiusTypes } from "../config";
import { AtomsLegend }  from "./plugins/AtomsLegend";

// TODO: Really think about this and think of a nice way of solving the problems that it looks like this has nicely

/**
 * GUI layer for atom-level controls in the viewer.
 *
 * Responsible for:
 * - Atom rendering style controls (model, radius, labels)
 * - Material and coloring configuration
 * - Atom operations (add/replace)
 * - Boundary editing controls
 * - Timeline playback controls
 * - Legend integration
 * - Syncing UI state with viewer state changes
 *
 * This class acts as a bridge between `dat.gui` controls and the
 * underlying viewer state/operations system.
 *
 * @class
 */
class AtomsGUI {
    /**
   * @param {Object} viewer - Main viewer instance.
   * @param {import("dat.gui").GUI} gui - dat.GUI root instance.
   * @param {Object} guiConfig - Configuration for enabled controls and features.
   */
  constructor(viewer, gui, guiConfig) {
    this.viewer = viewer;
    this.gui = gui;
    this.guiConfig = guiConfig;
    /** @type {Object} */
    this.atomLegendConfig = this.getAtomLegendConfig();
    /** Prevents feedback loops between UI and viewer state */
    this.isSyncing = false;
    /** Local copy of boundary values for staged editing */
    this.tempBoundary = this.viewer.boundary.map((row) => row.slice());
    /** Root DOM container for timeline / legend overlays */
    this.div = document.createElement("div");
    this.viewer.tjs.containerElement.appendChild(this.div);

    // Listen to viewer events
    this.viewer.tjs.containerElement.addEventListener("viewerUpdated", (event) => {
      this.updateViewerControl(event.detail);
    });
    this.viewer.state.subscribe("cell", (next) => {
      if (!next) {
        return;
      }
      this.beginSync();
      if (next.showCell !== undefined) {
        this.updateShowCell(next.showCell);
      }
      if (next.showAxes !== undefined) {
        this.updateShowAxes(next.showAxes);
      }
      this.endSync();
    });

    if (this.guiConfig.controls.atomsControl) {
      this.addAtomsControl();
    }
    if (this.guiConfig.controls.colorControl) {
      this.addColorControl();
    }
    /** Legend overlay controller */
    this.legend = new AtomsLegend(this.viewer, this.guiConfig);
  }

  /**
   * Enables UI→viewer sync lock.
   */
  beginSync() {
    this.isSyncing = true;
  }

  /**
   * Disables UI→viewer sync lock.
   */
  endSync() {
    this.isSyncing = false;
  }

  // TODO MOVE THE TIMELINE TO BE MANAGED BY THE HUDCONTROLLER

  /**
   * Updates timeline state based on trajectory length.
   *
   * @param {Array} trajectory
   */
  update(trajectory) {
    if (this.guiConfig.timeline.enabled && trajectory.length > 1) {
      this.addTimeline();
      this.timeline.max = trajectory.length - 1;
    } else {
      this.removeTimeline();
    }
  }


  /**
   * Creates atom control folder (model style, radius, labels, etc).
   * @private
   */
  addAtomsControl() {
    const atomsFolder = this.gui.addFolder("Atoms");

    // Model Style Control
    this.modelStyleController = atomsFolder
      .add(
        { modelStyle: this.viewer.modelStyle },
        "modelStyle",
        MODEL_STYLE_MAP,
      )
      .onChange((value) => {
        if (this.isSyncing || this.viewer.weas.ops.isRestoring) return;
        this.viewer.setState(
          { modelStyle: value },
          { record: true, redraw: "full" },
        );
      })
      .name("Model Style");

    // Radius Type Control
    const radiusTypeState = { radiusType: this.viewer.radiusType };
    this.radiusTypeController = atomsFolder
      .add(radiusTypeState, "radiusType", radiusTypes)
      .name("Radius Type")
      .onChange((value) => {
        if (this.isSyncing || this.viewer.weas.ops.isRestoring) return;
        this.viewer.setState(
          { radiusType: value },
          { record: true, redraw: "full" },
        );
      });

    // Atom Label Control
    const atomLabelState = { atomLabelType: this.viewer.atomLabelType };
    this.atomLabelTypeController = atomsFolder
      .add(atomLabelState, "atomLabelType", ["None", "Symbol", "Index"])
      .onChange((value) => {
        if (this.isSyncing || this.viewer.weas.ops.isRestoring) return;
        this.viewer.setState(
          { atomLabelType: value },
          { record: true, redraw: "labels" },
        );
      })
      .name("Atom Label");

    // Material Type Control
    const materialTypeState = { materialType: this.viewer.materialType };
    this.materialTypeController = atomsFolder
      .add(materialTypeState, "materialType", ["Standard", "Phong", "Basic"])
      .onChange((value) => {
        if (this.isSyncing || this.viewer.weas.ops.isRestoring) return;
        this.viewer.setState(
          { materialType: value },
          { record: true, redraw: "full" },
        );
      })
      .name("Material Type");

    // Atom Scale Control
    const atomScaleState = { atomScale: this.viewer.atomScale };
    this.atomScaleController = atomsFolder
      .add(atomScaleState, "atomScale", 0.1, 2.0)
      .name("Atom Scale")
      .onChange((value) => {
        if (this.isSyncing || this.viewer.weas.ops.isRestoring) return;
        this.viewer.setState(
          { atomScale: value },
          { record: true, redraw: "render" },
        );
      });

    // Show Cell Control
    const showCellState = { showCell: this.viewer.cellManager.showCell };
    this.showCellController = atomsFolder
      .add(showCellState, "showCell")
      .name("Unit Cell")
      .onChange((value) => {
        if (this.isSyncing || this.viewer.weas.ops.isRestoring) return;
        this.viewer.weas.ops.settings.SetCellSettings({ showCell: value });
      });

    // Show Cell Axes Control
    const showAxesState = { showAxes: this.viewer.cellManager.showAxes };
    this.showCellAxesController = atomsFolder
      .add(showAxesState, "showAxes")
      .name("Crystal Axes")
      .onChange((value) => {
        if (this.isSyncing || this.viewer.weas.ops.isRestoring) return;
        this.viewer.weas.ops.settings.SetCellSettings({ showAxes: value });
      });

    // Show Bonded Atoms Control
    this.showBondedAtomsController = atomsFolder
      .add({ showBondedAtoms: this.viewer.showBondedAtoms }, "showBondedAtoms")
      .name("Bonded Atoms")
      .onChange((value) => {
        if (this.isSyncing || this.viewer.weas.ops.isRestoring) return;
        this.viewer.setState(
          { showBondedAtoms: value },
          { record: true, redraw: "full" },
        );
      });

    // Legend Toggle Control
    this.legendToggleController = atomsFolder
      .add(this.atomLegendConfig, "enabled")
      .name("Show Legend")
      .onChange((value) => {
        this.atomLegendConfig.enabled = value;
        this.updateLegend(); // Toggle legend visibility
      });

    this.addReplaceAtomControl(atomsFolder);

    this.addAddAtomControl(atomsFolder);

    this.addBoundaryControl(atomsFolder);
  }
  /**
   * Adds atom replacement UI.
   * @param {dat.GUI} atomsFolder
   * @private
  */
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
              const replaceOperation = new ReplaceOperation({
                weas: this.viewer.weas,
                symbol: newElementSymbol,
              });
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

  /**
   * Adds atom insertion UI.
   * @param {dat.GUI} atomsFolder
   * @private
   */
  addAddAtomControl(atomsFolder) {
    const addAtomFolder = atomsFolder.addFolder("Add Atom");
    const addElementData = { symbol: "C" };
    this.addAtomController = addAtomFolder.add(addElementData, "symbol").name("New Element Symbol");
    addAtomFolder
      .add(
        {
          addAtoms: () => {
            const addAtomOperation = new AddAtomOperation({
              weas: this.viewer.weas,
              symbol: addElementData.symbol,
            });
            this.viewer.weas.ops.execute(addAtomOperation);
            this.viewer.weas.eventHandlers.dispatchAtomsUpdated();
          },
        },
        "addAtoms",
      )
      .name("Add Selected Atoms");
  }

  /**
   * Boundary editing UI for simulation box.
   * @param {dat.GUI} atomsFolder
   * @private
   */
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
    this.wrapOnMoveController = boundaryFolder
      .add({ wrapOnMove: this.viewer.wrapOnMove }, "wrapOnMove")
      .name("Wrap On Move")
      .onChange((value) => {
        if (this.isSyncing || this.viewer.weas.ops.isRestoring) return;
        this.viewer.setState({ wrapOnMove: value }, { record: true, redraw: "none" });
      });
  }

  /**
   * Color configuration controls.
   * @private
   */
  addColorControl() {
    const colorFolder = this.gui.addFolder("Color");
    // Background Color Control
    this.backgroundColorController = colorFolder
      .addColor(this.viewer, "backgroundColor")
      .name("Background")
      .onChange((color) => {
        if (this.isSyncing || this.viewer.weas.ops.isRestoring) return;
        this.viewer.setState({ backgroundColor: color }, { record: true, redraw: "render" });
      });
    // Color By Control
    this.colorByController = colorFolder
      .add({ colorBy: this.viewer.colorBy }, "colorBy", colorBys)
      .onChange((value) => {
        if (this.isSyncing || this.viewer.weas.ops.isRestoring) return;
        this.viewer.setState({ colorBy: value }, { record: true, redraw: "full" });
      })
      .name("Color By");
    // Color Type Control
    this.colorTypeController = colorFolder
      .add({ colorType: this.viewer.colorType }, "colorType", colorTypes)
      .onChange((value) => {
        if (this.isSyncing || this.viewer.weas.ops.isRestoring) return;
        this.viewer.setState({ colorType: value }, { record: true, redraw: "full" });
      })
      .name("Color Type");
  }

  /**
   * Creates animation timeline controls.
   * @private
   */
  addTimeline() {
    if (this.div.querySelector("#animation-controls")) {
      return;
    }
    const animation_div = document.createElement("div");
    animation_div.id = "animation-controls";
    animation_div.style.backgroundColor = "transparent";
    const stopPropagation = (event) => {
      event.stopPropagation();
    };
    ["click", "pointerdown", "pointerup", "mousedown", "mouseup"].forEach((eventType) => {
      animation_div.addEventListener(eventType, stopPropagation);
    });

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
      // If dragging, prevent unnecessary redraws
      if (this.viewer.weas.eventHandlers.isDragging & !this.viewer.continuousUpdate) {
        this.timelineIsDragging = true;
      } else {
        this.timelineIsDragging = false; // Allow full redraw
        this.viewer.currentFrame = parseInt(this.timeline.value, 10);
      }
    });
    // Ensure full redraw when mouse is released
    this.timeline.addEventListener("mouseup", () => {
      this.timelineIsDragging = false; // Force full redraw
      this.viewer.currentFrame = parseInt(this.timeline.value, 10); // Ensure last frame is applied
    });
  }


  /**
   * Removes animation timeline UI.
   * @private
   */
  removeTimeline() {
    const animation_div = this.div.querySelector("#animation-controls");
    if (animation_div) {
      animation_div.remove();
    }
  }

  /**
   * Updates internal boundary staging buffer.
   *
   * @param {number} dimension
   * @param {number} index
   * @param {number} value
   * @private
   */
  updateBoundaryValue(dimension, index, value) {
    this.tempBoundary[dimension][index] = parseFloat(value);
  }


  /**
   * Applies staged boundary changes to viewer state.
   * @private
   */
  applyBoundaryChanges() {
    if (this.isSyncing || this.viewer.weas.ops.isRestoring) return;
    this.viewer.setState({ boundary: this.tempBoundary }, { record: true, redraw: "full" });
  }



  /**
   * Removes legend overlay.
   * @private
   */
  removeLegend() {
    this.legend.removeLegend()
  }

  /**
   * Updates legend via legend plugin.
   */
  updateLegend() {
    this.legend.updateLegend();
  }

  /**
   * Computes legend config fallback values.
   * @returns {Object}
   * @private
   */
  getAtomLegendConfig() {
    if (!this.guiConfig.atomLegend && this.guiConfig.legend) {
      this.guiConfig.atomLegend = this.guiConfig.legend;
    }
    if (!this.guiConfig.atomLegend) {
      this.guiConfig.atomLegend = { enabled: false, position: "bottom-right" };
    }
    return this.guiConfig.atomLegend;
  }

  /**
   * Positions legend DOM element.
   *
   * @param {HTMLElement} legendContainer
   * @private
   */
  setLegendPosition(legendContainer) {
    const position = this.getAtomLegendConfig().position || "top-right";
    legendContainer.style.top = position.includes("top") ? "10px" : "";
    legendContainer.style.bottom = position.includes("bottom") ? "10px" : "";
    legendContainer.style.left = position.includes("left") ? "10px" : "";
    legendContainer.style.right = position.includes("right") ? "10px" : "";
  }

  /**
   * Handles incoming viewer state updates and syncs GUI.
   *
   * @param {Object} detail
   * @private
   */
  updateViewerControl(detail) {
    // detail is a object containing the updated viewer properties
    // Update the GUI controls with the new values
    this.isSyncing = true;
    Object.entries(detail).forEach(([key, value]) => {
      switch (key) {
        case "modelStyle":
          this.updateModelStyle(value);
          break;
        case "radiusType":
          this.updateRadiusType(value);
          break;
        case "atomLabelType":
          this.updateAtomLabelType(value);
          break;
        case "materialType":
          this.updateMaterialType(value);
          break;
        case "atomScale":
          this.updateAtomScale(value);
          break;
        case "showCell":
          this.updateShowCell(value);
          break;
        case "showBondedAtoms":
          this.updateShowBondedAtoms(value);
          break;
        case "colorBy":
          this.updateColorBy(value);
          break;
        case "colorType":
          this.updateColorType(value);
          break;
        case "backgroundColor":
          this.updateBackgroundColor(value);
          break;
        case "isPlaying":
          // this.updateIsPlaying(value);
          break;
        case "currentFrame":
          // this.updateCurrentFrame(value);
          break;
        case "boundary":
          this.updateBoundary(value);
          break;
        case "wrapOnMove":
          this.updateWrapOnMove(value);
          break;
        default:
          break;
      }
    });
    this.isSyncing = false;
  }


  updateAtomScale(newValue) {
    if (this.atomScaleController && this.atomScaleController.getValue() !== newValue) {
      this.atomScaleController.setValue(newValue);
    }
  }

  updateAtomLabelType(newValue) {
    if (this.atomLabelTypeController && this.atomLabelTypeController.getValue() !== newValue) {
      this.atomLabelTypeController.setValue(newValue);
    }
  }

  updateMaterialType(newValue) {
    if (this.materialTypeController && this.materialTypeController.getValue() !== newValue) {
      this.materialTypeController.setValue(newValue);
    }
  }

  updateModelStyle(newValue) {
    if (this.modelStyleController && this.modelStyleController.getValue() !== newValue) {
      this.modelStyleController.setValue(newValue);
    }
  }

  updateRadiusType(newValue) {
    if (this.radiusTypeController && this.radiusTypeController.getValue() !== newValue) {
      this.radiusTypeController.setValue(newValue);
    }
  }

  updateShowBondedAtoms(newValue) {
    if (this.showBondedAtomsController && this.showBondedAtomsController.getValue() !== newValue) {
      this.showBondedAtomsController.setValue(newValue);
    }
  }

  updateShowCell(newValue) {
    if (this.showCellController && this.showCellController.getValue() !== newValue) {
      this.showCellController.setValue(newValue);
    }
  }

  updateShowAxes(newValue) {
    if (this.showCellAxesController && this.showCellAxesController.getValue() !== newValue) {
      this.showCellAxesController.setValue(newValue);
    }
  }

  updateColorBy(newValue) {
    if (this.colorByController && this.colorByController.getValue() !== newValue) {
      this.colorByController.setValue(newValue);
    }
  }

  updateColorType(newValue) {
    if (this.colorTypeController && this.colorTypeController.getValue() !== newValue) {
      this.colorTypeController.setValue(newValue);
    }
  }

  updateBackgroundColor(newValue) {
    if (this.backgroundColorController && this.backgroundColorController.getValue() !== newValue) {
      this.backgroundColorController.setValue(newValue);
    }
  }

  updateBoundary(newValue) {
    if (!this.boundaryControllers || !Array.isArray(newValue)) {
      return;
    }
    this.tempBoundary = newValue.map((row) => row.slice());
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 2; j++) {
        const controller = this.boundaryControllers[i][j];
        if (controller && controller.getValue() !== newValue[i][j]) {
          controller.setValue(newValue[i][j]);
        }
      }
    }
  }

  updateWrapOnMove(newValue) {
    if (this.wrapOnMoveController && this.wrapOnMoveController.getValue() !== newValue) {
      this.wrapOnMoveController.setValue(newValue);
    }
  }
}

export { AtomsGUI };
