import { GUI } from "dat.gui";
import { defaultGuiConfig } from "../config";

function lockController(controller) {
  // Disable user input for the controller
  controller.__li.style.pointerEvents = "none"; // Prevent any interaction
  controller.__li.style.opacity = 0.95; // Gray it out visually
}

/**
GUIManager that allows registration of UI elements ontop of the weas scene
 * @module GUIManager
 * @class
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
    hud.addHTMLPanel("controls", this.gui.domElement, {
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
        this.addFolderFromSchema(subFolder, mat, registry.getSchema(name), {});

        if (mat.__builtIn) {
          Object.values(subFolder.__controllers).forEach(lockController);
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
        if (!registry.isGUIVisible(shapeName)) continue; // hide shapes designed to be hidden
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
      while (folder.__controllers.length > 0) {
        folder.remove(folder.__controllers[0]);
      }

      cameraController.list().forEach((viewName) => {
        folder
          .add({ load: () => cameraController.view(viewName) }, "load")
          .name(`View ${viewName}`);
      });

      folder
        .add(
          {
            save: () => {
              const name = prompt("Name of new camera view:");
              if (!name) return;
              cameraController.saveView(name);
            },
          },
          "save",
        )
        .name("Save Current View");
    };

    // initial render
    refreshViews();
    // listen for changes
    cameraController.onChange(refreshViews);
  }

  addCameraSettingsFolder() {
    const folder = this.gui.addFolder("Camera Settings");
    const controller = this.weas.tjs.cameraController;
    if (!controller) return;

    // Add all GUI-able params from the schema
    this.addFolderFromSchema(
      folder,
      controller,
      controller.paramSchema,
      (key, value) => {
        controller[key] = value;
        controller.update();
        controller._emitChange();
      },
    );

    folder.add(
      {
        reset: () => {
          controller.resetSettings();

          folder.__controllers.forEach((c) => c.updateDisplay());
          Object.values(folder.__folders).forEach((f) =>
            f.__controllers.forEach((c) => c.updateDisplay()),
          );
        },
      },
      "reset",
    );
  }

  // TODO - move this into the HUD Controller in a similar pattern to Camera
  // The GUI shouldn't know about hte details of the HUDController
  addHUDSettingsFolder() {
    const folder = this.gui.addFolder("HUD Settings");
    const hud = this.weas.tjs.hud;
    if (!hud) return;

    const refreshHUDFolder = () => {
      // remove old controllers
      while (folder.__controllers.length)
        folder.remove(folder.__controllers[0]);

      // remove old subfolders
      for (const f in folder.__folders) {
        folder.removeFolder(folder.__folders[f]);
      }

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
      // Skip anything that shouldn't appear in the GUI
      if (meta.gui === false) continue;

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
        case "boolean":
          controller = folder.add(settingsObj, key);
          break;
        case "select":
          if (meta.options)
            controller = folder.add(settingsObj, key, meta.options);
          break;
        default:
          continue;
      }

      const displayName = meta.label ?? key;

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
