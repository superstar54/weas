import * as THREE from "three";
import { marchingCubes } from "../../geometry/marchingCubes.js";
import { cloneValue } from "../../state/store.js";

function normalizeHexColor(color) {
  const threeColor = color instanceof THREE.Color ? color : new THREE.Color(color);
  return "#" + threeColor.getHexString();
}

class Setting {
  constructor({ isovalue = null, color = "#3d82ed", mode = 1, step_size = 1, opacity = 0.8 }) {
    /* The setting of isosurface
    isovalue: The value to search for the isosurface. If isovalue is not set,
              the average value of the min and max values is used.
    color: The color of the isosurface.
    mode: The mode of isosurface generation. mode=0: Positive and negative isosurfaces are drawn.
          In this case, the color of the positive is the given color, and the color of
          the negative is the complementary color of the given color.
          mode=other: Only the given isosurface is drawn.
    step_size: The step size of the isosurface generation. Must be a positive integer.
                Larger steps yield faster but coarser results.
    opacity: Material opacity applied to generated meshes.
    */
    this.isovalue = isovalue;
    this.color = normalizeHexColor(color);
    this.mode = mode;
    this.step_size = step_size;
    this.opacity = Math.min(1, Math.max(0, opacity ?? 0.8));
  }
}

export class Isosurface {
  constructor(viewer) {
    this.viewer = viewer;
    this.scene = viewer.tjs.scene;
    this.settings = {};
    this.guiFolder = null;
    this.meshes = {};

    const pluginState = this.viewer.state.get("plugins.isosurface");
    if (pluginState && pluginState.settings) {
      this.settings = {};
      this.applySettings(pluginState.settings);
      if (this.viewer.volumetricData) {
        this.drawIsosurfaces();
      }
    }
    this.viewer.state.subscribe("plugins.isosurface", (next) => {
      if (!next || !next.settings) {
        return;
      }
      this.applySettings(next.settings);
      if (this.viewer.volumetricData) {
        this.drawIsosurfaces();
      }
    });
  }

  getIsovalueRange() {
    const values = this.viewer?.volumetricData?.values;
    if (!values || values.length === 0) {
      return { minValue: -1, maxValue: 1 };
    }
    const minValue = values.reduce((acc, val) => Math.min(acc, val), Infinity);
    const maxValue = values.reduce((acc, val) => Math.max(acc, val), -Infinity);
    if (!isFinite(minValue) || !isFinite(maxValue)) {
      return { minValue: -1, maxValue: 1 };
    }
    if (Math.abs(maxValue - minValue) < 1e-9) {
      const epsilon = Math.max(Math.abs(minValue), 1) * 1e-3;
      return { minValue: minValue - epsilon, maxValue: maxValue + epsilon };
    }
    return { minValue, maxValue };
  }

  createGui() {
    if (this.viewer.guiManager.gui && !this.guiFolder) {
      this.guiFolder = this.viewer.guiManager.gui.addFolder("Isosurface");
    }
  }

  removeGui() {
    // remote the gui folder
    if (this.guiFolder) {
      this.viewer.guiManager.gui.removeFolder(this.guiFolder);
      this.guiFolder = null;
    }
  }

  reset() {
    /* Reset the isosurface */
    this.removeGui();
    this.meshes = {};
    this.settings = {};
  }
  setSettings(settings) {
    this.viewer.state.set({ plugins: { isosurface: { settings: cloneValue(settings) } } });
  }

  applySettings(settings) {
    /* Set the isosurface settings */
    // clear
    this.settings = {};
    // remove gui folder and create a new one
    this.removeGui();
    this.createGui();
    this.clearIossurfaces();
    // loop over settings to add each setting
    Object.entries(settings).forEach(([name, setting]) => {
      this.addSetting(name, setting);
    });
  }

  addSetting(name, { isovalue = null, color = "#3d82ed", mode = 1, step_size = 1, opacity = 0.8 }) {
    /* Add a new setting to the isosurface */
    const { minValue, maxValue } = this.getIsovalueRange();
    // if isoValue is not set, use the average value if the volumetric data is set
    if (isovalue === null) {
      isovalue = (minValue + maxValue) / 2;
    }
    const setting = new Setting({ isovalue, color, mode, step_size, opacity });
    // if name is not set, use the length of the settings
    if (name === undefined) {
      name = "iso-" + Object.keys(this.settings).length;
    }
    this.settings[name] = setting;
    // create the gui if it is not exist
    this.createGui();
    const isoFolder = this.guiFolder.addFolder(name);
    isoFolder.add(setting, "isovalue", minValue, maxValue).name("Level").onFinishChange(this.drawIsosurfaces.bind(this));
    isoFolder.addColor(setting, "color").name("Color").onFinishChange(this.drawIsosurfaces.bind(this));
    isoFolder.add(setting, "opacity", 0, 1, 0.01).name("Opacity").onFinishChange(this.drawIsosurfaces.bind(this));
  }

  clearIossurfaces() {
    /* Remove isosurface entries from AnyMesh settings */
    this.meshes = {};
    this.updateAnyMeshSettings([]);
  }

  drawIsosurfaces() {
    /* Draw isosurfaces */
    if (this.viewer.volumetricData === null) {
      this.viewer.logger.debug("No volumetric data is set");
      return;
    }
    this.viewer.logger.debug("drawIsosurfaces");
    this.clearIossurfaces();
    const volumetricData = this.viewer.volumetricData;
    const data = volumetricData.values;
    const dims = volumetricData.dims;
    const cell = volumetricData.cell;
    const origin = volumetricData.origin;
    const stepSize = [
      [cell[0][0] / dims[0], cell[0][1] / dims[0], cell[0][2] / dims[0]],
      [cell[1][0] / dims[1], cell[1][1] / dims[1], cell[1][2] / dims[1]],
      [cell[2][0] / dims[2], cell[2][1] / dims[2], cell[2][2] / dims[2]],
    ];

    const nextAnyMeshSettings = [];
    Object.entries(this.settings).forEach(([name, setting]) => {
      // Generate isosurface geometry
      this.viewer.logger.debug("setting: ", setting);
      let isovalues;
      let colors;

      const baseColor = normalizeHexColor(setting.color);
      if (setting.mode === 0) {
        isovalues = [-setting.isovalue, setting.isovalue];
        // generate two different colors: baseColor and its complementary color
        const complementaryColor = (0xffffff - parseInt(baseColor.substring(1), 16)).toString(16).padStart(6, "0");
        colors = [baseColor, "#" + complementaryColor];
      } else {
        isovalues = [setting.isovalue];
        colors = [baseColor];
      }
      // loop over isovalues to generate multiple isosurfaces
      for (let i = 0; i < isovalues.length; i++) {
        const isovalue = isovalues[i];
        this.viewer.logger.debug("isovalue: ", isovalue);
        var isoData = marchingCubes(dims, data, null, isovalue, setting.step_size);

        //
        // Convert positions to real positions
        isoData.positions = isoData.positions.map(function (pos) {
          var x = pos[0] * stepSize[0][0] + pos[1] * stepSize[1][0] + pos[2] * stepSize[2][0] + origin[0];
          var y = pos[0] * stepSize[0][1] + pos[1] * stepSize[1][1] + pos[2] * stepSize[2][1] + origin[1];
          var z = pos[0] * stepSize[0][2] + pos[1] * stepSize[1][2] + pos[2] * stepSize[2][2] + origin[2];
          return [x, y, z];
        });

        const vertices = isoData.positions.reduce((acc, pos) => {
          acc.push(pos[0], pos[1], pos[2]);
          return acc;
        }, []);
        const faces = Array.isArray(isoData.cells) ? isoData.cells : Array.from(isoData.cells || []);
        const faceMaterials = Array.isArray(isoData.faceMaterials) ? isoData.faceMaterials : [];
        const facesByMaterial = splitFacesByMaterial(faces, faceMaterials);
        const meshName = `${name}-${i}`;
        const opacity = setting.opacity ?? 0.8;
        const primaryFaces = facesByMaterial[0].length ? facesByMaterial[0] : faces;
        nextAnyMeshSettings.push({
          name: `${meshName}`,
          vertices,
          faces: primaryFaces,
          color: colors[i],
          opacity,
          materialType: "Standard",
          side: "DoubleSide",
          depthWrite: true,
          depthTest: true,
          mergeVerticesTolerance: 1e-5,
          smoothNormals: true,
          selectable: false,
          layer: 1,
          userData: {
            source: "isosurface",
            isosurface: name,
            modeIndex: i,
            materialIndex: 0,
          },
        });
        if (facesByMaterial[1].length) {
          nextAnyMeshSettings.push({
            name: `${meshName}-cap`,
            vertices,
            faces: facesByMaterial[1],
            color: "#c2f542",
            opacity,
            materialType: "Standard",
            side: "DoubleSide",
            depthWrite: true,
            depthTest: true,
            mergeVerticesTolerance: 1e-5,
            smoothNormals: true,
            selectable: false,
            layer: 1,
            userData: {
              source: "isosurface",
              isosurface: name,
              modeIndex: i,
              materialIndex: 1,
            },
          });
        }
        this.meshes[meshName] = meshName;
      }
    });
    this.updateAnyMeshSettings(nextAnyMeshSettings);
  }

  updateAnyMeshSettings(nextIsosurfaceSettings) {
    const anyMesh = this.viewer?.weas?.anyMesh;
    if (!anyMesh || typeof anyMesh.setSettings !== "function") {
      return;
    }
    const currentSettings = Array.isArray(anyMesh.settings) ? anyMesh.settings : [];
    const preserved = currentSettings.filter((setting) => setting?.userData?.source !== "isosurface");
    anyMesh.setSettings([...preserved, ...nextIsosurfaceSettings]);
  }
}

function splitFacesByMaterial(cells, faceMaterials) {
  const facesByMaterial = [[], []];
  if (!Array.isArray(cells) || cells.length === 0) {
    return facesByMaterial;
  }
  if (!Array.isArray(faceMaterials) || faceMaterials.length === 0) {
    facesByMaterial[0] = cells.slice();
    return facesByMaterial;
  }
  for (let i = 0; i < cells.length; i += 3) {
    const materialIndex = faceMaterials[i / 3] === 1 ? 1 : 0;
    facesByMaterial[materialIndex].push(cells[i], cells[i + 1], cells[i + 2]);
  }
  return facesByMaterial;
}
