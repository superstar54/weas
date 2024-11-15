import * as THREE from "three";
import { clearObject } from "../../utils.js";
import { convertColor } from "../utils.js";

class SliceSetting {
  constructor({
    method = "miller", // 'miller' or 'bestFit'
    h = 0,
    k = 0,
    l = 1,
    distance = 0,
    selectedAtoms = [],
    colorMap = "viridis",
    opacity = 1.0,
  }) {
    /*
      method: 'miller' or 'bestFit'
      h, k, l: Miller indices for method 'miller'
      distance: Distance from the origin along the plane normal
      selectedAtoms: Array of atom indices or positions for method 'bestFit'
      colorMap: The color map to use for mapping data values to colors.
      opacity: The opacity of the slice (between 0 and 1).
    */
    this.method = method;
    this.h = h;
    this.k = k;
    this.l = l;
    this.distance = distance;
    this.selectedAtoms = selectedAtoms;
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

  addSetting(name, { method = "miller", h = 0, k = 0, l = 1, distance = 0, selectedAtoms = [], colorMap = "viridis", opacity = 1.0 }) {
    /* Add a new setting to the slices */
    const setting = new SliceSetting({
      method,
      h,
      k,
      l,
      distance,
      selectedAtoms,
      colorMap,
      opacity,
    });
    if (name === undefined) {
      name = "slice-" + Object.keys(this.settings).length;
    }
    this.settings[name] = setting;
    this.createGui();
    const sliceFolder = this.guiFolder.addFolder(name);
    sliceFolder.add(setting, "method", ["miller", "bestFit"]).name("Method").onChange(this.drawSlices.bind(this));

    if (setting.method === "miller") {
      sliceFolder.add(setting, "h").name("Miller h").onChange(this.drawSlices.bind(this));
      sliceFolder.add(setting, "k").name("Miller k").onChange(this.drawSlices.bind(this));
      sliceFolder.add(setting, "l").name("Miller l").onChange(this.drawSlices.bind(this));
      sliceFolder.add(setting, "distance").name("Distance").onChange(this.drawSlices.bind(this));
    } else if (setting.method === "bestFit") {
      // For bestFit method, you might need to provide a UI to select atoms
      // For simplicity, we assume selectedAtoms is already set
    }

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
    const origin = new THREE.Vector3(...volumetricData.origin);

    Object.entries(this.settings).forEach(([name, setting]) => {
      let planeNormal, planePoint;

      if (setting.method === "miller") {
        // Compute plane normal and point from Miller indices
        planeNormal = computePlaneNormalFromMillerIndices(setting.h, setting.k, setting.l, cell);
        // Compute a point on the plane at the specified distance from origin
        planePoint = planeNormal.clone().multiplyScalar(setting.distance).add(origin);
      } else if (setting.method === "bestFit") {
        // Compute best-fit plane from selected atoms
        const atomPositions = setting.selectedAtoms.map((atom) => {
          return new THREE.Vector3(atom.x, atom.y, atom.z);
        });
        const plane = computeBestFitPlane(atomPositions);
        planeNormal = plane.normal;
        planePoint = plane.point;
      } else {
        this.viewer.logger.error(`Unknown method: ${setting.method}`);
        return;
      }

      // Extract the slice data along the arbitrary plane
      const sliceData = extractSliceArbitrary(data, dims, cell, origin, planeNormal, planePoint);

      // Determine min and max sliceData values for color mapping
      const maxValue = Math.max(...sliceData.flat());
      const minValue = Math.min(...sliceData.flat());

      // Create a texture from the slice data
      const texture = createTextureFromSlice(sliceData, minValue, maxValue, setting.colorMap);

      // Create plane geometry and apply the texture
      const planeMesh = createSlicePlaneArbitrary(planeNormal, planePoint, texture, setting.opacity);

      planeMesh.userData.type = "slice";
      planeMesh.userData.uuid = this.viewer.uuid;
      planeMesh.userData.notSelectable = true;
      planeMesh.layers.set(1);

      // Add the plane to the scene
      this.scene.add(planeMesh);
      this.slices[name] = planeMesh;
    });
    // Update the scene
    this.viewer.tjs.render();
  }
}

function computePlaneNormalFromMillerIndices(h, k, l, cell) {
  /*
    Compute the plane normal in direct space given Miller indices (h, k, l) and cell parameters.
    Returns a THREE.Vector3 representing the plane normal.
  */
  // Compute reciprocal lattice vectors
  const a1 = new THREE.Vector3(...cell[0]);
  const a2 = new THREE.Vector3(...cell[1]);
  const a3 = new THREE.Vector3(...cell[2]);

  const volume = a1.dot(a2.clone().cross(a3));
  const b1 = a2
    .clone()
    .cross(a3)
    .multiplyScalar((2 * Math.PI) / volume);
  const b2 = a3
    .clone()
    .cross(a1)
    .multiplyScalar((2 * Math.PI) / volume);
  const b3 = a1
    .clone()
    .cross(a2)
    .multiplyScalar((2 * Math.PI) / volume);

  // Plane normal in direct space is perpendicular to (hkl) planes
  const normal = b1.clone().multiplyScalar(h).add(b2.clone().multiplyScalar(k)).add(b3.clone().multiplyScalar(l)).normalize();

  return normal;
}

function computeBestFitPlane(points) {
  /*
    Compute the best-fit plane from an array of THREE.Vector3 points.
    Returns an object with normal (THREE.Vector3) and point (THREE.Vector3).
  */
  // Calculate the centroid of the points
  const centroid = new THREE.Vector3(0, 0, 0);
  points.forEach((point) => {
    centroid.add(point);
  });
  centroid.divideScalar(points.length);

  // Calculate the covariance matrix components
  let xx = 0,
    xy = 0,
    xz = 0,
    yy = 0,
    yz = 0,
    zz = 0;

  points.forEach((point) => {
    const x = point.x - centroid.x;
    const y = point.y - centroid.y;
    const z = point.z - centroid.z;

    xx += x * x;
    xy += x * y;
    xz += x * z;
    yy += y * y;
    yz += y * z;
    zz += z * z;
  });

  const covarianceMatrix = [
    [xx, xy, xz],
    [xy, yy, yz],
    [xz, yz, zz],
  ];

  // Compute eigenvalues and eigenvectors of the covariance matrix
  const { eigenvalues, eigenvectors } = numeric.eig(covarianceMatrix);

  // The normal of the plane is the eigenvector corresponding to the smallest eigenvalue
  const minIndex = eigenvalues.findIndex((val) => val === Math.min(...eigenvalues));
  const normalArray = eigenvectors[minIndex];
  const normal = new THREE.Vector3(...normalArray).normalize();

  return { normal: normal, point: centroid };
}

function extractSliceArbitrary(data, dims, cell, origin, planeNormal, planePoint) {
  /*
    Extract a 2D slice from the 3D data array along an arbitrary plane.
    This function resamples the volumetric data onto the plane.
    Returns a 2D array of data values.
  */
  // Implementing this requires sampling the data grid along the plane
  // For simplicity, let's assume we create a grid on the plane and sample the data
  const [nx, ny, nz] = dims;
  const planeSize = 100; // Adjust as needed
  const resolution = 256; // Number of samples along each axis
  const sliceData = [];

  // Generate two vectors on the plane
  const u = new THREE.Vector3().random().cross(planeNormal).normalize();
  const v = planeNormal.clone().cross(u).normalize();

  // Define the grid on the plane
  for (let i = 0; i < resolution; i++) {
    const row = [];
    for (let j = 0; j < resolution; j++) {
      const du = (i / (resolution - 1) - 0.5) * planeSize;
      const dv = (j / (resolution - 1) - 0.5) * planeSize;
      const samplePoint = planePoint.clone().add(u.clone().multiplyScalar(du)).add(v.clone().multiplyScalar(dv));

      // Map samplePoint to grid indices
      const localPos = samplePoint.clone().sub(origin);
      const gridCoords = cellToGridCoordinates(localPos, cell, dims);

      // Interpolate data value at gridCoords
      const value = trilinearInterpolation(data, gridCoords, dims);
      row.push(value);
    }
    sliceData.push(row);
  }

  return sliceData;
}

function cellToGridCoordinates(position, cell, dims) {
  /*
    Converts a position in space to grid coordinates based on the cell parameters.
  */
  const a1 = new THREE.Vector3(...cell[0]);
  const a2 = new THREE.Vector3(...cell[1]);
  const a3 = new THREE.Vector3(...cell[2]);

  const matrix = new THREE.Matrix3();
  matrix.set(a1.x, a2.x, a3.x, a1.y, a2.y, a3.y, a1.z, a2.z, a3.z);
  const invMatrix = matrix.clone().invert();

  const fractionalCoords = position.clone().applyMatrix3(invMatrix);

  // Scale fractional coordinates to grid indices
  const gridX = fractionalCoords.x * dims[0];
  const gridY = fractionalCoords.y * dims[1];
  const gridZ = fractionalCoords.z * dims[2];

  return { x: gridX, y: gridY, z: gridZ };
}

function trilinearInterpolation(data, coords, dims) {
  /*
    Performs trilinear interpolation of the data at the given fractional grid coordinates.
  */
  const { x, y, z } = coords;
  const x0 = Math.floor(x);
  const x1 = x0 + 1;
  const y0 = Math.floor(y);
  const y1 = y0 + 1;
  const z0 = Math.floor(z);
  const z1 = z0 + 1;

  const xd = x - x0;
  const yd = y - y0;
  const zd = z - z0;

  const c000 = getDataValue(data, x0, y0, z0, dims);
  const c100 = getDataValue(data, x1, y0, z0, dims);
  const c010 = getDataValue(data, x0, y1, z0, dims);
  const c001 = getDataValue(data, x0, y0, z1, dims);
  const c101 = getDataValue(data, x1, y0, z1, dims);
  const c011 = getDataValue(data, x0, y1, z1, dims);
  const c110 = getDataValue(data, x1, y1, z0, dims);
  const c111 = getDataValue(data, x1, y1, z1, dims);

  const c00 = c000 * (1 - xd) + c100 * xd;
  const c01 = c001 * (1 - xd) + c101 * xd;
  const c10 = c010 * (1 - xd) + c110 * xd;
  const c11 = c011 * (1 - xd) + c111 * xd;

  const c0 = c00 * (1 - yd) + c10 * yd;
  const c1 = c01 * (1 - yd) + c11 * yd;

  const c = c0 * (1 - zd) + c1 * zd;

  return c;
}

function getDataValue(data, x, y, z, dims) {
  /*
    Retrieves the data value at the specified grid indices, handling boundary conditions.
  */
  const [nx, ny, nz] = dims;
  if (x < 0 || x >= nx || y < 0 || y >= ny || z < 0 || z >= nz) {
    return 0; // or some appropriate background value
  }
  const index = x + y * nx + z * nx * ny;
  return data[index];
}

function createTextureFromSlice(sliceData, minValue, maxValue, colorMap) {
  /*
    Create a THREE.DataTexture from the slice data, mapping data values to colors using the specified color map.
  */
  const width = sliceData[0].length;
  const height = sliceData.length;
  const dataArray = new Uint8Array(width * height * 4); // RGBA

  const colormap = getColorMapFunction(colorMap);

  let idx = 0;
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      const value = sliceData[j][i];
      const normalizedValue = (value - minValue) / (maxValue - minValue);
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

function createSlicePlaneArbitrary(normal, point, texture, opacity) {
  /*
    Create a plane geometry at the correct position and orientation, and apply the texture.
  */
  // Create a plane geometry
  const planeSize = 100; // Adjust size as needed
  const planeGeometry = new THREE.PlaneGeometry(planeSize, planeSize);

  // Align the plane geometry so that it's perpendicular to the normal
  const up = new THREE.Vector3(0, 0, 1); // Default up direction
  const quaternion = new THREE.Quaternion().setFromUnitVectors(up, normal);
  planeGeometry.applyQuaternion(quaternion);

  // Position the plane at the correct point
  planeGeometry.translate(point.x, point.y, point.z);

  // Create material with the texture
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
    transparent: opacity < 1.0,
    opacity: opacity,
  });

  // Create mesh
  const planeMesh = new THREE.Mesh(planeGeometry, material);

  return planeMesh;
}

function getColorMapFunction(colorMapName) {
  /*
    Returns a function that maps a normalized value (between 0 and 1) to an RGB color array.
  */
  if (colorMapName === "grayscale") {
    return function (t) {
      return [t, t, t];
    };
  } else if (colorMapName === "viridis") {
    return function (t) {
      t = Math.max(0, Math.min(1, t));
      return viridisColorMap(t);
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
