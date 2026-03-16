import { GUI } from "dat.gui";
import { defaultGuiConfig } from "../config";
import {
  parseStructureText,
  applyStructurePayload,
  buildExportPayload,
  downloadText,
} from "../io/structure";

function lockController(controller) {
  // Disable user input for the controller
  controller.__li.style.pointerEvents = "none"; // Prevent any interaction
  controller.__li.style.opacity = 0.95; // Gray it out visually
}

/*
GUIManager that allows UI elements that can tune weas scene.
Should in theory know NOTHING about individual folders, with tunable params being derived 
from the schema of the controller

-- TODO: uphold the above statement
*/
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
  }

  initGUI() {
    this.createGUIContainer();

    const debug = true;

    if (debug) {
      this.addMaterialsFolder();
      this.addShapeOperationsFolder();
      this.addCameraControlsFolder();
      this.addCameraSettingsFolder();
      this.addHUDSettingsFolder();
      this.addLegendHUDFolder();
    }
  }

  createGUIContainer() {
    const hud = this.weas.tjs.hud;

    // Remove from any previous parent
    if (this.gui.domElement.parentElement) {
      this.gui.domElement.parentElement.removeChild(this.gui.domElement);
    }

    this.gui.domElement.style.pointerEvents = "auto";

    // HACK: pad ul to be below controls
    const ul = this.gui.domElement.querySelector("ul");
    if (ul) ul.style.paddingTop = "25px";

    // Add to HUD using the panel system
    hud.addPanel("controls", this.gui.domElement, {
      anchor: "top-left",
      offset: { x: 1, y: 1 }, // 1% offset from top left
    });

    // stop propagation for GUI input
    const stopPropagation = (e) => e.stopPropagation();
    ["click", "keydown", "keyup", "keypress"].forEach((evt) => {
      this.gui.domElement.addEventListener(evt, stopPropagation, false);
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

      // Clear existing subfolders
      for (let key in folder.__folders) {
        folder.removeFolder(folder.__folders[key]);
      }

      for (const name of registry.list()) {
        const mat = registry.getMaterial(name, false);
        const displayName = mat.__builtIn ? `${name} (built-in)` : name;
        const subFolder = folder.addFolder(displayName);
        if (expanded.includes(displayName)) subFolder.open();

        // Use reusable schema-based folder builder
        this.addFolderFromSchema(subFolder, mat, registry.getSchema(name), {
          lockBuiltIn: mat.__builtIn,
        });

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

        // Rename button for non-built-in
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

  /* ---------------- Shapes Folder (Operation-based) ---------------- */
  addShapeOperationsFolder() {
    const folder = this.gui.addFolder("Shapes");
    const registry = this.weas.shapeRegistry;

    const refreshShapes = () => {
      // Remove old controllers
      while (folder.__controllers.length > 0) {
        folder.remove(folder.__controllers[0]);
      }

      // Add a button per shape
      for (const shapeName of registry.list()) {
        folder
          .add(
            {
              create: () => {
                this.weas.ops.Shapes.ShapeOperation({ shapeName, options: {} });
              },
            },
            "create",
          )
          .name(shapeName);
      }
    };

    this.refreshShapeOperations = refreshShapes;

    if (registry.onChange) registry.onChange(this.refreshShapeOperations);
    if (this.weas.materialsRegistry?.onChange)
      this.weas.materialsRegistry.onChange(this.refreshShapeOperations);

    this.refreshShapeOperations();
  }

  /* ---------------- Camera Folder (Camera-manager based) ---------------- */
  addCameraControlsFolder() {
    const folder = this.gui.addFolder("Camera Views");
    const cameraController = this.weas.tjs.cameraController;

    const refreshViews = () => {
      // Remove old controllers
      while (folder.__controllers.length > 0) {
        folder.remove(folder.__controllers[0]);
      }

      cameraController.list().forEach((viewName) => {
        const isBuiltIn = cameraController._builtInViews.has(viewName);

        folder
          .add({ load: () => cameraController.view(viewName) }, "load")
          .name(`View ${viewName}`);
      });

      // Button to save current camera state
      folder
        .add(
          {
            save: () => {
              const name = prompt("Name of new camera view:");
              if (!name) return;
              cameraController.saveView(name);
              refreshViews();
            },
          },
          "save",
        )
        .name("Save Current View");
    };

    refreshViews();
  }

  addCameraSettingsFolder() {
    const folder = this.gui.addFolder("Camera Settings");
    const controller = this.weas.tjs.cameraController;
    if (!controller) return;

    const refreshCameraFolder = () => {
      while (folder.__controllers.length)
        folder.remove(folder.__controllers[0]);

      for (const [key, info] of Object.entries(controller.paramSchema)) {
        if (!info.gui) continue;

        if (info.type === "select") {
          folder.add(controller, key, info.options).onChange((v) => {
            if (typeof controller.setCameraType === "function")
              controller.setCameraType(v);
          });
        } else if (typeof controller[key] === "boolean") {
          folder.add(controller, key);
        } else {
          folder.add(controller, key, info.min, info.max, info.step);
        }
      }

      folder.add({ reset: () => controller.resetSettings() }, "reset");
    };

    controller.onChange(refreshCameraFolder);
    refreshCameraFolder();
  }

  // TODO - move this into the HUD Controller in a similar pattern to Camera
  addHUDSettingsFolder() {
    const folder = this.gui.addFolder("HUD Settings");
    const hud = this.weas.tjs.hud;
    if (!hud) return;

    const refreshHUDFolder = () => {
      // remove old controllers
      while (folder.__controllers.length)
        folder.remove(folder.__controllers[0]);

      hud.miniScenes.forEach((mini, key) => {
        const sceneFolder = folder.addFolder(key);

        // Iterate over each defined position property in mini.position
        for (const posKey of ["top", "bottom", "left", "right"]) {
          if (mini.position[posKey] != null) {
            sceneFolder
              .add(mini.position, posKey, 0, 2500, 1)
              .onChange((v) => hud.setMiniScenePosition(key, { [posKey]: v }));
          }
        }

        // Size controls
        sceneFolder.add(mini, "width", 50, 500, 1).onChange((v) => {
          mini.width = v;
          mini.canvas.width = v;
        });
        sceneFolder.add(mini, "height", 50, 500, 1).onChange((v) => {
          mini.height = v;
          mini.canvas.height = v;
        });

        // Rotation
        sceneFolder.add(mini, "rotation").onChange((v) => (mini.rotation = v));
        // Visible
        sceneFolder.add(mini, "visible").onChange((v) => (mini.visible = v));
      });

      for (const [key, panel] of hud.htmlElements) {
        const htmlFolder = folder.addFolder(key + " (HTML)");

        // Anchor dropdown
        htmlFolder
          .add(panel, "anchor", hud.ANCHORS)
          .onChange(() => hud._updateHTMLPosition(key));

        // X/Y offsets
        htmlFolder
          .add(panel.offset, "x", -51, 150, 1)
          .name("Offset % X")
          .onChange(() => hud._updateHTMLPosition(key));

        htmlFolder
          .add(panel.offset, "y", -51, 151, 1)
          .name("Offset % Y")
          .onChange(() => hud._updateHTMLPosition(key));

        htmlFolder
          .add(panel, "visible")
          .name("Visible")
          .onChange((v) => hud.setHTMLPanelVisible(key, v));
      }
    };

    hud.onChange?.(refreshHUDFolder);
    refreshHUDFolder();
  }

  addLegendHUDFolder() {
    const folder = this.gui.addFolder("Legend Appearance");
    const legendHUD = this.weas.tjs.hud.legendHUD;
    if (!legendHUD) return;

    this.addFolderFromSchema(
      folder,
      legendHUD.settings,
      legendHUD.getSchema(),
      (key, value) => legendHUD.updateSettings({ [key]: value }),
    );
  }

  // generic method to add a gui folder from a schema and
  // a callback function (if updates are required)
  addFolderFromSchema(folder, settingsObj, schema, onChange) {
    for (const [key, meta] of Object.entries(schema)) {
      let controller;

      switch (meta.type) {
        case "number":
          controller = folder.add(
            settingsObj,
            key,
            meta.min,
            meta.max,
            meta.step,
          );
          break;
        case "color":
          controller = folder.addColor(settingsObj, key);
          break;
        case "string":
          controller = folder.add(settingsObj, key);
          break;
        default:
          continue;
      }

      const displayName = meta.label ?? key;

      // Only call onChange if it’s a function
      if (typeof onChange === "function") {
        controller?.name(displayName).onChange(() => {
          onChange(key, settingsObj[key]);
        });
      } else {
        controller?.name(displayName);
      }
    }
  }
}

export { GUIManager };
