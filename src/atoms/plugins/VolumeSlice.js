import * as THREE from "three";
import { clearObject } from "../../utils.js";
import { convertColor } from "../utils.js";

class SliceSetting {
  constructor({ axis = "z", index = null, colorMap = "viridis", opacity = 1.0 }) {
    /*
      axis: The axis along which to take the slice ('x', 'y', or 'z')
      index: The index of the slice along that axis. If null, the middle index is used.
      colorMap: The color map to use for mapping data values to colors.
      opacity: The opacity of the slice (between 0 and 1).
    */
    this.axis = axis;
    this.index = index;
    this.colorMap = colorMap;
    this.opacity = opacity;
  }
}

export class VolumeSlice {
  constructor(viewer) {
    this.viewer = viewer;
    this.scene = viewer.tjs.scene;
    this.settings = {};
    this.volumetricData = null;
    this.guiFolder = null;
    this.slices = {};
  }

  createGui() {
    if (this.viewer.guiManager.gui && !this.guiFolder) {
      this.guiFolder = this.viewer.guiManager.gui.addFolder("Slices");
    }
  }

  removeGui() {
    if (this.guiFolder) {
      this.viewer.guiManager.gui.removeFolder(this.guiFolder);
      this.guiFolder = null;
    }
  }

  reset() {
    /* Reset the slices */
    this.removeGui();
    this.clearSlices();
    this.settings = {};
    this.volumetricData = null;
  }

  fromSettings(settings) {
    /* Set the slice settings */
    // Clear existing settings
    this.settings = {};
    // Remove and recreate the GUI folder
    this.removeGui();
    this.createGui();
    this.clearSlices();
    // Add each setting
    Object.entries(settings).forEach(([name, setting]) => {
      this.addSetting(name, setting);
    });
  }

  addSetting(name, { axis = "z", index = null, colorMap = "viridis", opacity = 1.0 }) {
    /* Add a new setting to the slices */
    const setting = new SliceSetting({ axis, index, colorMap, opacity });
    if (name === undefined) {
      name = "slice-" + Object.keys(this.settings).length;
    }
    this.settings[name] = setting;
    this.createGui();
    const sliceFolder = this.guiFolder.addFolder(name);
    sliceFolder.add(setting, "axis", ["x", "y", "z"]).name("Axis").onChange(this.drawSlices.bind(this));
    // Determine index range based on data dimensions
    const dims = this.volumetricData ? this.volumetricData.dims : [1, 1, 1];
    const axisIndex = { x: 0, y: 1, z: 2 }[setting.axis];
    const maxIndex = dims[axisIndex] - 1;
    if (setting.index === null) {
      setting.index = Math.floor(maxIndex / 2);
    }
    sliceFolder.add(setting, "index", 0, maxIndex, 1).name("Index").onChange(this.drawSlices.bind(this));
    sliceFolder.add(setting, "opacity", 0, 1).name("Opacity").onChange(this.drawSlices.bind(this));
  }

  clearSlices() {
    /* Remove slice meshes from the scene */
    Object.values(this.slices).forEach((slice) => {
      clearObject(this.scene, slice);
    });
  }

  drawSlices() {
    /* Draw slices */
    if (this.volumetricData === null) {
      this.viewer.logger.debug("No volumetric data is set");
      return;
    }
    this.viewer.logger.debug("drawSlices");
    this.clearSlices();
    const volumetricData = this.volumetricData;
    const data = volumetricData.values;
    const dims = volumetricData.dims;
    const cell = volumetricData.cell;
    const origin = volumetricData.origin;

    Object.entries(this.settings).forEach(([name, setting]) => {
      // Extract the slice data
      const axis = setting.axis;
      const axisIndex = { x: 0, y: 1, z: 2 }[axis];
      const index = setting.index !== null ? setting.index : Math.floor(dims[axisIndex] / 2);
      const sliceData = extractSlice(data, dims, axisIndex, index);
      // Determine min and max sliceData values for color mapping
      const maxValue = Math.max(...sliceData.flat());
      const minValue = Math.min(...sliceData.flat());

      // Create a texture from the slice data
      const texture = createTextureFromSlice(sliceData, dims, axisIndex, minValue, maxValue, setting.colorMap);

      // Create a plane geometry and apply the texture
      const plane = createSlicePlane(dims, cell, origin, axisIndex, index, texture, setting.opacity);

      plane.userData.type = "slice";
      plane.userData.uuid = this.viewer.uuid;
      plane.userData.notSelectable = true;
      plane.layers.set(1);

      // Add the plane to the scene
      this.scene.add(plane);
      this.slices[name] = plane;
    });
    // Update the scene
    this.viewer.tjs.render();
  }
}

function extractSlice(data, dims, axisIndex, index) {
  /*
    Extract a 2D slice from the 3D data array along the given axis at the specified index.
    Returns a 2D array of data values.
  */
  const [nx, ny, nz] = dims;
  let slice = [];
  if (axisIndex === 0) {
    // Slice along x-axis (constant x)
    for (let k = 0; k < nz; k++) {
      let row = [];
      for (let j = 0; j < ny; j++) {
        const idx = index + j * nx + k * nx * ny;
        row.push(data[idx]);
      }
      slice.push(row);
    }
  } else if (axisIndex === 1) {
    // Slice along y-axis (constant y)
    for (let k = 0; k < nz; k++) {
      let row = [];
      for (let i = 0; i < nx; i++) {
        const idx = i + index * nx + k * nx * ny;
        row.push(data[idx]);
      }
      slice.push(row);
    }
  } else if (axisIndex === 2) {
    // Slice along z-axis (constant z)
    for (let j = 0; j < ny; j++) {
      let row = [];
      for (let i = 0; i < nx; i++) {
        const idx = i + j * nx + index * nx * ny;
        row.push(data[idx]);
      }
      slice.push(row);
    }
  }
  return slice;
}

function createTextureFromSlice(sliceData, dims, axisIndex, minValue, maxValue, colorMap) {
  /*
    Create a THREE.DataTexture from the slice data, mapping data values to colors using the specified color map.
  */
  // Flatten the slice data and map values to colors
  const colormap = getColorMapFunction(colorMap);
  const width = axisIndex === 0 ? dims[2] : dims[0];
  const height = axisIndex === 0 ? dims[1] : axisIndex === 1 ? dims[2] : dims[1];
  const dataArray = new Uint8Array(width * height * 4); // RGBA

  let idx = 0;
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      const value = sliceData[j][i];
      const normalizedValue = (value - minValue) / (maxValue - minValue);
      console.log("normalizedValue", normalizedValue);
      const [r, g, b] = colormap(normalizedValue);
      dataArray[idx++] = r * 255;
      dataArray[idx++] = g * 255;
      dataArray[idx++] = b * 255;
      dataArray[idx++] = 255; // Alpha channel
    }
  }

  const texture = new THREE.DataTexture(dataArray, width, height, THREE.RGBAFormat);
  texture.needsUpdate = true;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

function createSlicePlane(dims, cell, origin, axisIndex, index, texture, opacity) {
  /*
    Create a plane geometry at the correct position and orientation, and apply the texture.
  */
  // Compute the plane size and position
  const [nx, ny, nz] = dims;
  const stepSize = [
    [cell[0][0] / nx, cell[0][1] / nx, cell[0][2] / nx],
    [cell[1][0] / ny, cell[1][1] / ny, cell[1][2] / ny],
    [cell[2][0] / nz, cell[2][1] / nz, cell[2][2] / nz],
  ];

  let width, height;
  let planeGeometry;
  let position = new THREE.Vector3();
  let rotation = new THREE.Euler();

  if (axisIndex === 0) {
    // Plane perpendicular to x-axis
    width = cell[1][0] + cell[1][1] + cell[1][2];
    height = cell[2][0] + cell[2][1] + cell[2][2];
    planeGeometry = new THREE.PlaneGeometry(width, height);
    // Position the plane at the correct x
    const x = index * stepSize[0][0] + origin[0];
    position.set(x, origin[1] + cell[1][1] / 2, origin[2] + cell[2][2] / 2);
    rotation.set(0, Math.PI / 2, 0);
  } else if (axisIndex === 1) {
    // Plane perpendicular to y-axis
    width = cell[0][0] + cell[0][1] + cell[0][2];
    height = cell[2][0] + cell[2][1] + cell[2][2];
    planeGeometry = new THREE.PlaneGeometry(width, height);
    const y = index * stepSize[1][1] + origin[1];
    position.set(origin[0] + cell[0][0] / 2, y, origin[2] + cell[2][2] / 2);
    rotation.set(Math.PI / 2, 0, 0);
  } else if (axisIndex === 2) {
    // Plane perpendicular to z-axis
    width = cell[0][0] + cell[0][1] + cell[0][2];
    height = cell[1][0] + cell[1][1] + cell[1][2];
    planeGeometry = new THREE.PlaneGeometry(width, height);
    const z = index * stepSize[2][2] + origin[2];
    position.set(origin[0] + cell[0][0] / 2, origin[1] + cell[1][1] / 2, z);
    // No rotation needed
  }

  // Create material
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
    transparent: opacity < 1.0,
    opacity: opacity,
  });

  // Create mesh
  const plane = new THREE.Mesh(planeGeometry, material);
  plane.position.copy(position);
  plane.rotation.copy(rotation);

  return plane;
}

function getColorMapFunction(colorMapName) {
  /*
    Returns a function that maps a normalized value (between 0 and 1) to an RGB color array.
    For simplicity, we can use a predefined color map or create our own.
  */
  // Implementing a simple grayscale and a basic viridis-like colormap
  if (colorMapName === "grayscale") {
    return function (t) {
      return [t, t, t];
    };
  } else if (colorMapName === "viridis") {
    return function (t) {
      t = Math.max(0, Math.min(1, t));
      const c = viridisColorMap(t);
      return c;
    };
  } else {
    // Default to grayscale
    return function (t) {
      return [t, t, t];
    };
  }
}

function viridisColorMap(t) {
  /*
    Simplified version of the viridis colormap.
    Returns an array [r, g, b] where each component is between 0 and 1.
  */
  // Approximate viridis colormap using piecewise linear segments
  console.assert(t >= 0 && t <= 1, "t is " + t, "t must be between 0 and 1");
  const data = [
    [0.267004, 0.004874, 0.329415],
    [0.282327, 0.094955, 0.417331],
    [0.253935, 0.265254, 0.529983],
    [0.206756, 0.371758, 0.553117],
    [0.163625, 0.471133, 0.558148],
    [0.127568, 0.566949, 0.550556],
    [0.134692, 0.658636, 0.517649],
    [0.266941, 0.748751, 0.440573],
    [0.477504, 0.821444, 0.318195],
    [0.741388, 0.873449, 0.149561],
    [0.993248, 0.906157, 0.143936],
  ];
  const n = data.length - 1;
  const i = Math.floor(t * n);
  const f = t * n - i;
  const c0 = data[i];
  const c1 = data[Math.min(i + 1, n)];
  return [c0[0] + (c1[0] - c0[0]) * f, c0[1] + (c1[1] - c0[1]) * f, c0[2] + (c1[2] - c0[2]) * f];
}
