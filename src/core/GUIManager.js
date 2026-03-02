import { GUI } from "dat.gui";
import { setupCameraGUI } from "../tools/camera.js";
import { createViewpointButtons } from "../tools/viewpoint.js";
import { defaultGuiConfig } from "../config.js";
import {
  parseStructureText,
  applyStructurePayload,
  buildExportPayload,
  downloadText,
} from "../io/structure.js";

function lockController(controller) {
  // Disable user input for the controller
  controller.__li.style.pointerEvents = "none"; // Prevent any interaction
  controller.__li.style.opacity = 0.85; // Gray it out visually
}

class GUIManager {
  constructor(weas, guiConfig) {
    this.weas = weas;
    const mergedButtons = {
      ...defaultGuiConfig.buttons,
      ...(guiConfig?.buttons || {}),
    };
    const mergedControls = {
      ...defaultGuiConfig.controls,
      ...(guiConfig?.controls || {}),
    };
    const mergedTimeline = {
      ...defaultGuiConfig.timeline,
      ...(guiConfig?.timeline || {}),
    };
    const legendOverride = guiConfig?.atomLegend || guiConfig?.legend || {};
    const mergedLegend = { ...defaultGuiConfig.atomLegend, ...legendOverride };
    const mergedMeshLegend = {
      ...defaultGuiConfig.meshLegend,
      ...(guiConfig?.meshLegend || {}),
    };
    const mergedButtonStyle = {
      ...defaultGuiConfig.buttonStyle,
      ...(guiConfig?.buttonStyle || {}),
    };
    this.guiConfig = {
      ...defaultGuiConfig,
      ...guiConfig,
      buttons: mergedButtons,
      controls: mergedControls,
      timeline: mergedTimeline,
      atomLegend: mergedLegend,
      legend: mergedLegend,
      meshLegend: mergedMeshLegend,
      buttonStyle: mergedButtonStyle,
    };
    this.gui = new GUI();
    this.gui.closed = true;
    if (!this.guiConfig.controls.enabled) {
      this.gui.hide();
    } else {
      this.initGUI();
    }

    if (this.guiConfig.buttons.enabled) {
      this.addButtons();
    }
  }

  initGUI() {
    this.createGUIContainer();
    if (this.guiConfig.controls.cameraControls) {
      this.addCameraControls();
    }

    const debug = true;
    if (debug) {
      if (this.weas.materialsRegistry) this.addMaterialsFolder();
      if (this.weas.shapeRegistry) this.addShapesFolder();
    }
  }

  createGUIContainer() {
    const guiContainer = document.createElement("div");
    guiContainer.style.position = "absolute";
    guiContainer.style.top = "10px";
    guiContainer.style.left = "10px";
    this.weas.tjs.containerElement.appendChild(guiContainer);
    guiContainer.appendChild(this.gui.domElement);
    // Stop propagation of mouse and keyboard events from the GUI container
    // e.g., when user input "r", it will not trigger the rotate event.
    const stopPropagation = (e) => e.stopPropagation();
    ["click", "keydown", "keyup", "keypress"].forEach((eventType) => {
      guiContainer.addEventListener(eventType, stopPropagation, false);
    });
  }

  /* ---------------- Materials Folder ---------------- */
  addMaterialsFolder() {
    const folder = this.gui.addFolder("Materials");
    const registry = this.weas.materialsRegistry;

    const refreshMaterials = () => {
      // Preserve expanded subfolders
      const expanded = Object.entries(folder.__folders)
        .filter(([_, f]) => !f.closed)
        .map(([name]) => name);

      // Remove all existing subfolders
      for (let key in folder.__folders) {
        folder.removeFolder(folder.__folders[key]);
      }

      // Build subfolders from registry
      for (const name of registry.list()) {
        const mat = registry.getMaterial(name, false);
        const displayName = mat.__builtIn ? `${name} (built-in)` : name;
        const subFolder = folder.addFolder(displayName);

        if (expanded.includes(displayName)) subFolder.open();

        const addSlider = (obj, prop, min, max, step = 0.01) => {
          const controller = subFolder.add(obj, prop, min, max);
          if (mat.__builtIn) {
            controller.domElement.querySelector("input").disabled = true;
            controller.domElement.style.opacity = 0.5;
          }
          controller.onChange(() => this.weas.tjs.requestRedraw());
        };

        switch (mat.type) {
          case "MeshPhongMaterial":
            addSlider(mat, "shininess", 0, 300);
            addSlider(mat, "reflectivity", 0, 1);
            const specCtrl = subFolder
              .addColor({ specular: mat.specular.getHex() }, "specular")
              .onChange((val) => mat.specular.setHex(val));
            if (mat.__builtIn) lockController(specCtrl);
            break;

          case "MeshStandardMaterial":
            addSlider(mat, "metalness", 0, 1);
            addSlider(mat, "roughness", 0, 1);
            addSlider(mat, "envMapIntensity", 0, 5);
            break;

          case "MeshBasicMaterial":
            addSlider(mat, "opacity", 0, 1);
            break;
        }

        // Copy button
        subFolder
          .add(
            {
              copy: () => {
                let baseName = name + " Copy";
                let counter = 1;
                let newName = `${baseName} (${counter})`;
                while (registry.list().includes(newName))
                  (counter++, (newName = `${baseName} (${counter})`));
                registry.copyMaterial(name, newName);
              },
            },
            "copy",
          )
          .name("Copy");

        // Rename button for non-built-in materials
        if (!mat.__builtIn) {
          subFolder
            .add(
              {
                rename: () => {
                  const newName = prompt("Rename material to:", name);
                  if (!newName || newName === name) return;
                  if (registry.list().includes(newName)) {
                    alert(`Material "${newName}" already exists.`);
                    return;
                  }
                  registry.renameMaterial(name, newName);
                },
              },
              "rename",
            )
            .name("Rename");
        }
      }
    };

    this.refreshMaterials = () => {
      refreshMaterials();
      if (this.refreshShapes) this.refreshShapes();
    };

    // Hook into registry updates
    if (registry.onChange) registry.onChange(this.refreshMaterials);

    // Initial render
    this.refreshMaterials();
  }

  /* ---------------- Shapes Folder ---------------- */
  addShapesFolder() {
    const folder = this.gui.addFolder("Shapes");
    const registry = this.weas.shapeRegistry;

    const refreshShapes = () => {
      const expanded = Object.entries(folder.__folders)
        .filter(([_, f]) => !f.closed)
        .map(([name]) => name);

      for (let key in folder.__folders) {
        folder.removeFolder(folder.__folders[key]);
      }

      for (const shapeName of registry.list()) {
        const shapeFolder = folder.addFolder(shapeName);
        if (expanded.includes(shapeName)) shapeFolder.open();

        const params = {
          x: 0,
          y: 0,
          z: 0,
          scaleX: 1,
          scaleY: 1,
          scaleZ: 1,
          rotationX: 0,
          rotationY: 0,
          rotationZ: 0,
          color: "#bd0d87",
          opacity: 1,
        };

        // Position
        shapeFolder.add(params, "x", -50, 50).name("X");
        shapeFolder.add(params, "y", -50, 50).name("Y");
        shapeFolder.add(params, "z", -50, 50).name("Z");

        // Scale
        shapeFolder.add(params, "scaleX", 0.1, 10).name("Scale X");
        shapeFolder.add(params, "scaleY", 0.1, 10).name("Scale Y");
        shapeFolder.add(params, "scaleZ", 0.1, 10).name("Scale Z");

        // Rotation
        shapeFolder.add(params, "rotationX", 0, 360).name("Rot X");
        shapeFolder.add(params, "rotationY", 0, 360).name("Rot Y");
        shapeFolder.add(params, "rotationZ", 0, 360).name("Rot Z");

        // Color & opacity
        shapeFolder.addColor(params, "color").name("Color");
        shapeFolder.add(params, "opacity", 0, 1).name("Opacity");

        // Material dropdown dynamically
        const materialNames = this.weas.materialsRegistry.list();
        params.material = materialNames[0] || null;
        shapeFolder.add(params, "material", materialNames).name("Material");

        // Create button
        shapeFolder
          .add(
            {
              create: () => {
                const options = {
                  position: [params.x, params.y, params.z],
                  scale: [params.scaleX, params.scaleY, params.scaleZ],
                  rotation: [
                    params.rotationX,
                    params.rotationY,
                    params.rotationZ,
                  ],
                  materialType: params.material,
                  color: params.color,
                  opacity: params.opacity,
                };
                const shapeObj = registry.create(shapeName, options);
                this.weas.tjs.scene.add(shapeObj); // draw to weas
                this.weas.tjs.requestRedraw(); // redraw using the renderer?
              },
            },
            "create",
          )
          .name("Create");
      }
    };

    this.refreshShapes = refreshShapes;

    // Hook into shape registry updates
    if (registry.onChange) registry.onChange(this.refreshShapes);

    // Also refresh shapes whenever materials change
    if (this.weas.materialsRegistry?.onChange)
      this.weas.materialsRegistry.onChange(this.refreshShapes);

    // Initial render
    this.refreshShapes();
  }

  addCameraControls() {
    createViewpointButtons(this.weas, this.gui);
    setupCameraGUI(this.weas.tjs, this.gui, this.weas.tjs.camera);
  }

  addButtons() {
    this.ensureToolbarStyles();
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "weas-toolbar";
    buttonContainer.style.display = "flex";
    buttonContainer.style.position = "absolute";
    buttonContainer.style.background = "transparent";
    buttonContainer.style.padding = "0";
    buttonContainer.style.borderRadius = "0";
    buttonContainer.style.border = "none";
    buttonContainer.style.boxShadow = "none";
    buttonContainer.style.backdropFilter = "none";
    buttonContainer.style.right = "5px";
    buttonContainer.style.top = "5px";
    buttonContainer.style.gap = "5px";
    // Add event listeners to stop propagation
    const stopPropagation = (event) => event.stopPropagation();
    buttonContainer.addEventListener("click", stopPropagation);
    buttonContainer.addEventListener("mousedown", stopPropagation);
    buttonContainer.addEventListener("mouseup", stopPropagation);
    this.weas.tjs.containerElement.appendChild(buttonContainer);

    // Conditional creation of buttons based on the configuration
    if (this.guiConfig.buttons.fullscreen) {
      const expandSVG = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512">
            <path d="M32 32C14.3 32 0 46.3 0 64v96c0 17.7 14.3 32 32 32s32-14.3 32-32V96h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H32zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7 14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H64V352zM320 32c-17.7 0-32 14.3-32 32s14.3 32 32 32h64v64c0 17.7 14.3 32 32 32s32-14.3 32-32V64c0-17.7-14.3-32-32-32H320zM448 352c0-17.7-14.3-32-32-32s-32 14.3-32 32v64H320c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32V352z"/>
          </svg>
      `;
      const compressSVG = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512">
            <path d="M160 64c0-17.7-14.3-32-32-32s-32 14.3-32 32v64H32c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32V64zM32 320c-17.7 0-32 14.3-32 32s14.3 32 32 32H96v64c0 17.7 14.3 32 32 32s32-14.3 32-32V352c0-17.7-14.3-32-32-32H32zM352 64c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7 14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H352V64zM320 320c-17.7 0-32 14.3-32 32v96c0 17.7 14.3 32 32 32s32-14.3 32-32V384h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H320z"/>
          </svg>
      `;
      const fullscreenButton = this.createButton(expandSVG, "fullscreen");
      buttonContainer.appendChild(fullscreenButton);
      fullscreenButton.addEventListener("click", () => {
        if (!document.fullscreenElement) {
          this.weas.tjs.containerElement.requestFullscreen().catch((err) => {
            alert(
              `Error attempting to enable full-screen mode: ${err.message} (${err.name})`,
            );
          });
          fullscreenButton.innerHTML = compressSVG;
        } else {
          document.exitFullscreen();
          fullscreenButton.innerHTML = expandSVG;
        }
      });
    }

    if (this.guiConfig.buttons.undo) {
      const undoSVG = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512">
            <path d="M125.7 160H176c17.7 0 32 14.3 32 32s-14.3 32-32 32H48c-17.7 0-32-14.3-32-32V64c0-17.7 14.3-32 32-32s32 14.3 32 32v51.2L97.6 97.6c87.5-87.5 229.3-87.5 316.8 0s87.5 229.3 0 316.8s-229.3 87.5-316.8 0c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0c62.5 62.5 163.8 62.5 226.3 0s62.5-163.8 0-226.3s-163.8-62.5-226.3 0L125.7 160z"/>
          </svg>
      `;
      const undoButton = this.createButton(undoSVG, "undo");
      buttonContainer.appendChild(undoButton);

      undoButton.addEventListener("click", () => {
        this.weas.ops.undo();
      });
    }
    if (this.guiConfig.buttons.redo) {
      const redoSVG = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512">
            <path d="M386.3 160H336c-17.7 0-32 14.3-32 32s14.3 32 32 32H464c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32s-32 14.3-32 32v51.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0s-87.5 229.3 0 316.8s229.3 87.5 316.8 0c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0c-62.5 62.5-163.8 62.5-226.3 0s-62.5-163.8 0-226.3s163.8-62.5 226.3 0L386.3 160z"/>
          </svg>
      `;
      const redoButton = this.createButton(redoSVG, "redo");
      buttonContainer.appendChild(redoButton);
      redoButton.addEventListener("click", () => {
        this.weas.ops.redo();
      });
    }
    if (this.guiConfig.buttons.export) {
      const exportSVG = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512">
            <path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V274.7l-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7V32zM64 352c-35.3 0-64 28.7-64 64v32c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V416c0-35.3-28.7-64-64-64H346.5l-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352H64zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/>
          </svg>
      `;
      const exportButton = this.createButton(exportSVG, "export");
      buttonContainer.appendChild(exportButton);
      const exportPopup = document.createElement("div");
      exportPopup.className = "weas-toolbar-popup";
      exportPopup.style.position = "absolute";
      exportPopup.style.top = "38px";
      exportPopup.style.right = "5px";
      exportPopup.style.background =
        "linear-gradient(180deg, #ffffff 0%, #f8f9fb 100%)";
      exportPopup.style.borderRadius = "10px";
      exportPopup.style.border = "1px solid rgba(20, 23, 28, 0.12)";
      exportPopup.style.padding = "6px";
      exportPopup.style.display = "none";
      exportPopup.style.flexDirection = "column";
      exportPopup.style.gap = "4px";
      exportPopup.style.boxShadow = "0 10px 24px rgba(15, 23, 42, 0.18)";
      buttonContainer.appendChild(exportPopup);

      const addDownloadOption = (label, format) => {
        const optionButton = document.createElement("button");
        optionButton.textContent = label;
        optionButton.className = "weas-toolbar-option";
        this.setStyle(optionButton);
        optionButton.style.textAlign = "left";
        optionButton.style.padding = "4px 8px";
        optionButton.addEventListener("click", () => {
          exportPopup.style.display = "none";
          if (format === "image") {
            this.weas.tjs.downloadImage();
            return;
          }
          if (format === "animation") {
            this.weas.downloadAnimation();
            return;
          }
          try {
            const payload = buildExportPayload(this.weas, format);
            downloadText(payload.text, payload.filename, payload.mimeType);
          } catch (error) {
            console.error("Failed to export structure:", error);
            alert(`Export failed: ${error.message || error}`);
          }
        });
        exportPopup.appendChild(optionButton);
        return optionButton;
      };

      addDownloadOption("Image", "image");
      addDownloadOption("State (JSON)", "json");
      addDownloadOption("Standalone HTML", "html");
      addDownloadOption("Structure (XYZ)", "xyz");
      addDownloadOption("Structure (CIF)", "cif");
      const animationOption = addDownloadOption(
        "Animation (WebM)",
        "animation",
      );

      exportButton.addEventListener("click", () => {
        if (animationOption) {
          const hasTrajectory =
            Array.isArray(this.weas.avr?.trajectory) &&
            this.weas.avr.trajectory.length > 1;
          animationOption.style.display = hasTrajectory ? "" : "none";
        }
        exportPopup.style.display =
          exportPopup.style.display === "none" ? "flex" : "none";
      });
      document.addEventListener("click", (event) => {
        if (
          !exportPopup.contains(event.target) &&
          event.target !== exportButton
        ) {
          exportPopup.style.display = "none";
        }
      });
    }
    if (this.guiConfig.buttons.import) {
      const importSVG = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512">
            <path d="M256 496c-17.7 0-32-14.3-32-32V271.3l-73.4 73.4c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l128-128c12.5-12.5 32.8-12.5 45.3 0l128 128c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L288 271.3V464c0 17.7-14.3 32-32 32zM64 96C28.7 96 0 124.7 0 160v32c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V160c0-35.3-28.7-64-64-64H64z"/>
          </svg>
      `;
      const importButton = this.createButton(importSVG, "import");
      buttonContainer.appendChild(importButton);
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.id = "importInput";
      fileInput.accept = ".json,.xyz,.cif";
      fileInput.style.display = "none";
      buttonContainer.appendChild(fileInput);
      importButton.addEventListener("click", () => {
        fileInput.value = "";
        fileInput.click();
      });
      fileInput.addEventListener("change", async () => {
        const file = fileInput.files && fileInput.files[0];
        if (!file) {
          return;
        }
        try {
          const text = await file.text();
          const extension = file.name.slice(file.name.lastIndexOf("."));
          const parsed = parseStructureText(text, extension);
          if (parsed.kind === "json") {
            applyStructurePayload(this.weas, parsed.data);
          } else {
            applyStructurePayload(this.weas, parsed.data);
          }
        } catch (error) {
          console.error("Failed to import structure:", error);
          alert(`Import failed: ${error.message || error}`);
        }
      });
    }
    if (this.guiConfig.buttons.measurement) {
      const measurementSVG = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512">
            <path d="M177.9 494.1c-18.7 18.7-49.1 18.7-67.9 0L17.9 401.9c-18.7-18.7-18.7-49.1 0-67.9l50.7-50.7 48 48c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-48-48 41.4-41.4 48 48c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-48-48 41.4-41.4 48 48c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-48-48 41.4-41.4 48 48c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-48-48 50.7-50.7c18.7-18.7 49.1-18.7 67.9 0l92.1 92.1c18.7 18.7 18.7 49.1 0 67.9L177.9 494.1z"/>
          </svg>
      `;
      const measurementButton = this.createButton(
        measurementSVG,
        "measurement",
      );
      buttonContainer.appendChild(measurementButton);
      measurementButton.addEventListener("click", () => {
        this.weas.avr.Measurement.measure(this.weas.avr.selectedAtomsIndices);
      });
    }
  }

  createButton(html, id = "button") {
    const button = document.createElement("button");
    button.id = id;
    button.innerHTML = html;
    button.className = "weas-toolbar-button";
    this.setStyle(button);
    return button;
  }

  setStyle(button) {
    const styleConfig = this.guiConfig.buttonStyle || {};
    for (const [key, value] of Object.entries(styleConfig)) {
      button.style[key] = value;
    }
    const isIconButton = (button.textContent || "").trim().length === 0;
    if (isIconButton) {
      if (!styleConfig.width) {
        button.style.width = "28px";
      }
      if (!styleConfig.height) {
        button.style.height = "28px";
      }
      if (!styleConfig.display) {
        button.style.display = "inline-flex";
      }
      if (!styleConfig.alignItems) {
        button.style.alignItems = "center";
      }
      if (!styleConfig.justifyContent) {
        button.style.justifyContent = "center";
      }
      if (!styleConfig.lineHeight) {
        button.style.lineHeight = "0";
      }
    }
  }

  ensureToolbarStyles() {
    if (document.getElementById("weas-toolbar-styles")) {
      return;
    }
    const style = document.createElement("style");
    style.id = "weas-toolbar-styles";
    style.textContent = `
      .weas-toolbar button.weas-toolbar-button {
        background: #ffffff;
        border: 1px solid #dfe3eb;
        border-radius: 6px;
        color: #39424e;
        transition: background 120ms ease, border-color 120ms ease, box-shadow 120ms ease;
      }
      .weas-toolbar button.weas-toolbar-button:hover {
        background: #eef3ff;
        border-color: #5b7cfa;
        box-shadow: 0 4px 10px rgba(60, 90, 255, 0.28);
      }
      .weas-toolbar button.weas-toolbar-button:active {
        background: #e2e9ff;
        border-color: #4a6df5;
      }
      .weas-toolbar .weas-toolbar-option {
        background: #ffffff;
        border: 1px solid #e1e6f0;
        border-radius: 6px;
        color: #39424e;
        transition: background 120ms ease, border-color 120ms ease, box-shadow 120ms ease;
      }
      .weas-toolbar .weas-toolbar-option:hover {
        background: #f0f4ff;
        border-color: #5b7cfa;
        box-shadow: 0 3px 8px rgba(60, 90, 255, 0.2);
      }
    `;
    document.head.appendChild(style);
  }
}

export { GUIManager };
