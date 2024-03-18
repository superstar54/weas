import * as THREE from "three";
import { marchingCubes } from "../../geometry/marchingCubes.js";
import { clearObject } from "../../utils.js";

class Setting {
  constructor({ isovalue = null, color = "#3d82ed", mode = 0, step_size = 1 }) {
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
    */
    this.isovalue = isovalue;
    this.color = color;
    this.mode = mode;
    this.step_size = step_size;
  }
}

export class Isosurface {
  constructor(viewer) {
    this.viewer = viewer;
    this.scene = viewer.tjs.scene;
    this.settings = [];
    this.volumetricData = null;
    this.guiFolder = null;
    this.createGui();
    this.meshes = [];
  }

  createGui() {
    if (this.guiFolder) {
      this.viewer.guiManager.gui.removeFolder(this.guiFolder);
    }
    if (this.viewer.guiManager.gui) {
      this.guiFolder = this.viewer.guiManager.gui.addFolder("Isosurface");
    }
  }

  reset() {
    /* Reset the isosurface */
    this.clearIossurfaces();
    this.settings = [];
    this.volumetricData = null;
  }
  fromSettings(settings) {
    /* Set the isosurface settings */
    // clear
    this.settings = [];
    // remove gui folder and create a new one
    this.createGui();
    this.clearIossurfaces();
    // loop over settings to add each setting
    settings.forEach((setting) => {
      this.addSetting(setting);
    });
  }

  addSetting({ isovalue = null, color = "#3d82ed", mode = 0, step_size = 1 }) {
    /* Add a new setting to the isosurface */
    // if isoValue is not set, use the average value if the volumetric data is set
    if (isovalue === null) {
      if (this.volumetricData === null) {
        isovalue = 0;
      } else {
        const max = this.volumetricData.values.reduce((acc, val) => Math.max(acc, val), -Infinity);
        const min = this.volumetricData.values.reduce((acc, val) => Math.min(acc, val), Infinity);
        const average = (max + min) / 2;
        isovalue = average;
      }
    }
    const setting = new Setting({ isovalue, color, mode, step_size });
    this.settings.push(setting);
    // number of isosurfaces
    if (this.guiFolder) {
      const isoFolder = this.guiFolder.addFolder("iso" + this.settings.length);
      isoFolder.add(setting, "isovalue", -1, 1).name("Level").onChange(this.drawIsosurfaces.bind(this));
      isoFolder.addColor(setting, "color").name("Color").onChange(this.drawIsosurfaces.bind(this));
    }
  }

  clearIossurfaces() {
    /* Remove highlighted atom meshes from the selectedAtomsMesh group */
    this.meshes.forEach((mesh) => {
      clearObject(this.scene, mesh);
    });
  }

  drawIsosurfaces() {
    /* Draw isosurfaces */
    if (this.volumetricData === null) {
      console.log("No volumetric data is set");
      return;
    }
    console.log("drawIsosurfaces");
    this.clearIossurfaces();
    const volumetricData = this.volumetricData;
    const data = volumetricData.values;
    const dims = volumetricData.dims;
    const cell = volumetricData.cell;
    const origin = volumetricData.origin;
    const stepSize = [
      [cell[0][0] / dims[0], cell[0][1] / dims[0], cell[0][2] / dims[0]],
      [cell[1][0] / dims[1], cell[1][1] / dims[1], cell[1][2] / dims[1]],
      [cell[2][0] / dims[2], cell[2][1] / dims[2], cell[2][2] / dims[2]],
    ];

    this.settings.forEach((setting) => {
      // Generate isosurface geometry
      console.log("setting: ", setting);
      let isovalues;
      let colors;

      if (setting.mode === 0) {
        isovalues = [-setting.isovalue, setting.isovalue];
        // generate two different colors: setting.color and its complementary color
        const complementaryColor = (0xffffff - parseInt(setting.color.substring(1), 16)).toString(16);
        colors = [setting.color, "#" + complementaryColor];
      } else {
        isovalues = [setting.isovalue];
        colors = [setting.color];
      }
      // loop over isovalues to generate multiple isosurfaces
      for (let i = 0; i < isovalues.length; i++) {
        const isovalue = isovalues[i];
        console.log("isovalue: ", isovalue);
        console.time("marchingCubes Time");
        var isoData = marchingCubes(dims, data, null, isovalue, setting.step_size);
        console.timeEnd("marchingCubes Time");

        //
        // Convert positions to real positions
        isoData.positions = isoData.positions.map(function (pos) {
          var x = pos[0] * stepSize[0][0] + pos[1] * stepSize[1][0] + pos[2] * stepSize[2][0] + origin[0];
          var y = pos[0] * stepSize[0][1] + pos[1] * stepSize[1][1] + pos[2] * stepSize[2][1] + origin[1];
          var z = pos[0] * stepSize[0][2] + pos[1] * stepSize[1][2] + pos[2] * stepSize[2][2] + origin[2];
          return [x, y, z];
        });

        let geometry = createGeometryFromMarchingCubesOutput(isoData.positions, isoData.cells);
        // Create material
        // const material = new THREE.MeshBasicMaterial({
        //     color: setting.color,
        //     transparent: true, // Make it transparent
        //     opacity: 0.8, // Set the transparency level (0.0 to 1.0)
        // side: THREE.DoubleSide, // Render both sides
        // });
        const material = new THREE.MeshStandardMaterial({
          color: colors[i],
          metalness: 0.1,
          roughness: 0.01,
          transparent: true, // Make it transparent
          opacity: 0.8,
          side: THREE.DoubleSide, // Render both sides
        });

        // Create mesh
        var mesh = new THREE.Mesh(geometry, material);
        mesh.geometry.computeVertexNormals();
        mesh.material.flatShading = false;
        // mesh.position.copy(setting.center);
        mesh.userData.type = "isosurface";
        mesh.userData.uuid = this.viewer.uuid;
        mesh.userData.notSelectable = true;
        mesh.layers.set(1);

        // Add mesh to the scene
        this.scene.add(mesh);
        this.meshes.push(mesh);
      }
    });
  }
}

function createGeometryFromMarchingCubesOutput(positions, cells) {
  /* Create a geometry from the output of the marching cubes algorithm */
  var geometry = new THREE.BufferGeometry();
  var vertices = [];
  console.log("cells: ", cells);

  // Convert positions and cells to vertices and indices arrays
  positions.forEach(function (pos) {
    vertices.push(pos[0], pos[1], pos[2]);
  });

  // Add vertices and indices to the geometry
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(cells);

  // Compute normals for the lighting
  geometry.computeVertexNormals();

  return geometry;
}
