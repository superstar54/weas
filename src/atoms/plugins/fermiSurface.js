import { marchingCubes, clipMeshToPlanes } from "../../geometry/marchingCubes.js";
import { cloneValue } from "../../state/store.js";

class FermiSurfaceSetting {
  constructor({
    isovalue = null,
    color = "#00ff00",
    step_size = 1,
    opacity = 0.6,
    periodic = false,
    clipToBZ = true,
    clipPlanes = null,
    clipEps = 1e-10,
    datasets = null,
    dataset = null,
    materialType = "Standard",
    mergeVerticesTolerance = 1e-1,
    smoothNormals = true,
    wrapFractional = false,
    tile = 1,
    bzCropMargin = 1,
  }) {
    this.isovalue = isovalue;
    this.color = color;
    this.step_size = step_size;
    this.opacity = Math.min(1, Math.max(0, opacity ?? 0.6));
    this.periodic = Boolean(periodic);
    this.clipToBZ = Boolean(clipToBZ);
    this.clipPlanes = Array.isArray(clipPlanes) ? clipPlanes : null;
    this.clipEps = typeof clipEps === "number" ? clipEps : 1e-10;
    this.datasets = Array.isArray(datasets) ? datasets : null;
    this.dataset = typeof dataset === "string" ? dataset : null;
    this.materialType = materialType || "Standard";
    this.mergeVerticesTolerance = mergeVerticesTolerance;
    this.smoothNormals = smoothNormals;
    this.wrapFractional = wrapFractional !== false;
    this.tile = typeof tile === "number" ? tile : 1;
    this.bzCropMargin = Math.max(0, Math.floor(typeof bzCropMargin === "number" ? bzCropMargin : 1));
  }
}

function normalizeColor(color) {
  if (Array.isArray(color)) {
    const r = Math.max(0, Math.min(1, color[0] ?? 0));
    const g = Math.max(0, Math.min(1, color[1] ?? 0));
    const b = Math.max(0, Math.min(1, color[2] ?? 0));
    const toHex = (v) =>
      Math.round(v * 255)
        .toString(16)
        .padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
  return color;
}

function normalizeDatasets(data) {
  if (!data) return null;
  if (Array.isArray(data.datasets)) {
    const map = new Map();
    data.datasets.forEach((item, idx) => {
      if (!item) return;
      const key = typeof item.name === "string" ? item.name : `dataset-${idx}`;
      map.set(key, item);
    });
    return { map, meta: data };
  }
  if (Array.isArray(data.dims) && Array.isArray(data.values)) {
    const map = new Map();
    map.set("default", data);
    return { map, meta: data };
  }
  return null;
}

function tileVolume(values, dims, sc) {
  const nx = dims[0];
  const ny = dims[1];
  const nz = dims[2];
  const sx = nx * sc;
  const sy = ny * sc;
  const sz = nz * sc;
  const out = new Array(sx * sy * sz);
  for (let x = 0; x < sx; x++) {
    const x0 = x % nx;
    for (let y = 0; y < sy; y++) {
      const y0 = y % ny;
      for (let z = 0; z < sz; z++) {
        const z0 = z % nz;
        const src = (x0 * ny + y0) * nz + z0;
        const dst = (x * sy + y) * sz + z;
        out[dst] = values[src];
      }
    }
  }
  return out;
}

function invert3x3(m) {
  const a00 = m[0][0],
    a01 = m[0][1],
    a02 = m[0][2];
  const a10 = m[1][0],
    a11 = m[1][1],
    a12 = m[1][2];
  const a20 = m[2][0],
    a21 = m[2][1],
    a22 = m[2][2];
  const b01 = a22 * a11 - a12 * a21;
  const b11 = -a22 * a10 + a12 * a20;
  const b21 = a21 * a10 - a11 * a20;
  let det = a00 * b01 + a01 * b11 + a02 * b21;
  if (!det) return null;
  det = 1.0 / det;
  return [
    [b01 * det, (-a22 * a01 + a02 * a21) * det, (a12 * a01 - a02 * a11) * det],
    [b11 * det, (a22 * a00 - a02 * a20) * det, (-a12 * a00 + a02 * a10) * det],
    [b21 * det, (-a21 * a00 + a01 * a20) * det, (a11 * a00 - a01 * a10) * det],
  ];
}

function mulMatVec(m, v) {
  return [m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2], m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2], m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2]];
}

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

export class FermiSurface {
  constructor(viewer) {
    this.viewer = viewer;
    this.settings = {};
    this.meshes = {};
    this.guiFolder = null;
    this.globalFolder = null;
    this.globalIsovalue = null;
    this.cache = new Map();

    const pluginState = this.viewer.state.get("plugins.fermiSurface");
    if (pluginState && pluginState.settings) {
      this.settings = {};
      this.applySettings(pluginState.settings);
      if (this.viewer.fermiSurfaceData) {
        this.drawFermiSurfaces();
      }
    }
    this.viewer.state.subscribe("plugins.fermiSurface", (next) => {
      if (!next || !next.settings) return;
      this.applySettings(next.settings);
      if (this.viewer.fermiSurfaceData) {
        this.drawFermiSurfaces();
      }
    });
  }

  getIsovalueRange() {
    const data = this.viewer?.fermiSurfaceData;
    if (!data) {
      return { minValue: -1, maxValue: 1 };
    }
    const datasets = Array.isArray(data.datasets) ? data.datasets : [];
    if (!datasets.length) {
      return { minValue: -1, maxValue: 1 };
    }
    let minValue = Infinity;
    let maxValue = -Infinity;
    for (let i = 0; i < datasets.length; i++) {
      const values = datasets[i]?.values;
      if (!Array.isArray(values)) continue;
      for (let j = 0; j < values.length; j++) {
        const v = values[j];
        if (v < minValue) minValue = v;
        if (v > maxValue) maxValue = v;
      }
    }
    if (!isFinite(minValue) || !isFinite(maxValue)) {
      return { minValue: -1, maxValue: 1 };
    }
    if (Math.abs(maxValue - minValue) < 1e-9) {
      const epsilon = Math.max(Math.abs(minValue), 1) * 1e-1;
      return { minValue: minValue - epsilon, maxValue: maxValue + epsilon };
    }
    return { minValue, maxValue };
  }

  createGui() {
    if (!this.viewer.fermiSurfaceData) {
      return;
    }
    if (this.viewer.guiManager.gui && !this.guiFolder) {
      this.guiFolder = this.viewer.guiManager.gui.addFolder("FermiSurface");
    }
  }

  removeGui() {
    if (this.guiFolder) {
      this.viewer.guiManager.gui.removeFolder(this.guiFolder);
      this.guiFolder = null;
    }
  }

  reset() {
    this.meshes = {};
    this.settings = {};
    this.removeGui();
    this.cache.clear();
  }

  setSettings(settings) {
    this.viewer.state.set({ plugins: { fermiSurface: { settings: cloneValue(settings) } } });
  }

  applySettings(settings) {
    this.settings = {};
    this.clearFermiSurfaces();
    this.removeGui();
    if (!this.viewer.fermiSurfaceData) {
      return;
    }
    this.createGui();
    Object.entries(settings).forEach(([name, setting]) => {
      this.addSetting(name, setting);
    });
    this.addGlobalControls();
  }

  addGlobalControls() {
    if (!this.guiFolder) return;
    if (this.globalFolder) {
      this.guiFolder.removeFolder(this.globalFolder);
      this.globalFolder = null;
    }
    const { minValue, maxValue } = this.getIsovalueRange();
    if (this.globalIsovalue === null || typeof this.globalIsovalue !== "number") {
      this.globalIsovalue = (minValue + maxValue) / 2;
    }
    const range = Math.abs(maxValue - minValue);
    const step = Math.min(0.1, Math.max(range / 2000, 1e-3));
    const folder = this.guiFolder.addFolder("Global");
    this.globalFolder = folder;
    folder
      .add(this, "globalIsovalue", minValue, maxValue, step)
      .name("Fermi Energy")
      .onFinishChange(() => {
        Object.values(this.settings).forEach((setting) => {
          setting.isovalue = this.globalIsovalue;
        });
        this.drawFermiSurfaces();
      });
  }

  addSetting(
    name,
    {
      isovalue = null,
      color = "#00ff00",
      step_size = 1,
      opacity = 0.6,
      periodic = false,
      clipToBZ = true,
      clipPlanes = null,
      clipEps = 1e-10,
      datasets = null,
      dataset = null,
      materialType = "Standard",
      mergeVerticesTolerance = 1e-1,
      smoothNormals = true,
      wrapFractional = false,
      tile = 1,
      bzCropMargin = 1,
    },
  ) {
    const setting = new FermiSurfaceSetting({
      isovalue,
      color: normalizeColor(color),
      step_size,
      opacity,
      periodic,
      clipToBZ,
      clipPlanes,
      clipEps,
      datasets,
      dataset,
      materialType,
      mergeVerticesTolerance,
      smoothNormals,
      wrapFractional,
      tile,
      bzCropMargin,
    });
    if (name === undefined) {
      name = "fermi-" + Object.keys(this.settings).length;
    }
    this.settings[name] = setting;

    this.createGui();
    const { minValue, maxValue } = this.getIsovalueRange();
    if (setting.isovalue === null || typeof setting.isovalue !== "number") {
      setting.isovalue = (minValue + maxValue) / 2;
    }
    const folder = this.guiFolder.addFolder(name);
    folder.addColor(setting, "color").name("Color").onFinishChange(this.drawFermiSurfaces.bind(this));
    folder.add(setting, "opacity", 0, 1, 0.01).name("Opacity").onFinishChange(this.drawFermiSurfaces.bind(this));
    folder.add(setting, "clipToBZ").name("Clip BZ").onFinishChange(this.drawFermiSurfaces.bind(this));
    folder.add(setting, "step_size", 1, 4, 1).name("Step").onFinishChange(this.drawFermiSurfaces.bind(this));
  }

  clearFermiSurfaces() {
    this.meshes = {};
    this.updateAnyMeshSettings([]);
  }

  drawFermiSurfaces() {
    const data = this.viewer.fermiSurfaceData;
    if (!data) {
      this.removeGui();
      return;
    }
    if (this.lastDataRef !== data) {
      this.cache.clear();
      this.lastDataRef = data;
    }

    const resolved = normalizeDatasets(data);
    if (!resolved) return;

    const datasets = resolved.map;
    const nextAnyMeshSettings = [];
    const dataVersion = data?.version || 0;

    if (data.bzMesh && data.bzMesh.vertices && data.bzMesh.faces) {
      const bzSetting = {
        name: data.bzMesh.name || "Brillouin-zone",
        vertices: data.bzMesh.vertices,
        faces: data.bzMesh.faces,
        color: data.bzMesh.color || [0.0, 0.0, 0.5],
        opacity: typeof data.bzMesh.opacity === "number" ? data.bzMesh.opacity : 0.1,
        position: data.bzMesh.position || [0.0, 0.0, 0.0],
        materialType: data.bzMesh.materialType || "Standard",
        showEdges: Boolean(data.bzMesh.showEdges),
        edgeColor: data.bzMesh.edgeColor || [0.0, 0.0, 0.0, 1.0],
        depthWrite: data.bzMesh.depthWrite !== false ? Boolean(data.bzMesh.depthWrite) : false,
        depthTest: data.bzMesh.depthTest !== false ? Boolean(data.bzMesh.depthTest) : false,
        side: data.bzMesh.side || "DoubleSide",
        clearDepth: Boolean(data.bzMesh.clearDepth),
        renderOrder: typeof data.bzMesh.renderOrder === "number" ? data.bzMesh.renderOrder : 10,
        mergeVerticesTolerance: data.bzMesh.mergeVerticesTolerance ?? null,
        smoothNormals: data.bzMesh.smoothNormals ?? false,
        selectable: false,
        userData: { source: "brillouinZone" },
      };
      nextAnyMeshSettings.push(bzSetting);
    }

    Object.entries(this.settings).forEach(([name, setting]) => {
      const keys = setting.dataset ? [setting.dataset] : Array.isArray(setting.datasets) && setting.datasets.length ? setting.datasets : Array.from(datasets.keys());
      const mergedPositions = [];
      const mergedFaces = [];
      let vertOffset = 0;

      keys.forEach((key) => {
        const dataset = datasets.get(key);
        if (!dataset) return;
        const dims = dataset.dims;
        const values = dataset.values;
        if (!Array.isArray(dims) || !Array.isArray(values)) return;
        const cell = dataset.cell || data.cell;
        const origin = dataset.origin || data.origin || [0, 0, 0];
        if (!cell || cell.length !== 3) return;

        const baseDims = dims;
        const supercell = 2;
        const dimsMC = [baseDims[0] * supercell, baseDims[1] * supercell, baseDims[2] * supercell];
        const cacheKey = `${key}|${values.length}|${supercell}|${setting.clipToBZ ? 1 : 0}|${setting.bzCropMargin}|${dataVersion}`;
        let cached = this.cache.get(cacheKey);
        let valuesMC;
        let cropOffset = [0, 0, 0];
        let cropDims = dimsMC;
        if (cached) {
          valuesMC = cached.values;
          cropOffset = cached.offset;
          cropDims = cached.dims;
        } else {
          valuesMC = tileVolume(values, baseDims, supercell);

          if (setting.clipToBZ && data.bzMesh && data.bzMesh.vertices) {
            const inv = invert3x3(cell);
            if (inv) {
              let minF = [Infinity, Infinity, Infinity];
              let maxF = [-Infinity, -Infinity, -Infinity];
              const verts = data.bzMesh.vertices;
              for (let i = 0; i < verts.length; i += 3) {
                const f = mulMatVec(inv, [verts[i], verts[i + 1], verts[i + 2]]);
                for (let a = 0; a < 3; a++) {
                  if (f[a] < minF[a]) minF[a] = f[a];
                  if (f[a] > maxF[a]) maxF[a] = f[a];
                }
              }
              const margin = setting.bzCropMargin || 1;
              const minI = [0, 0, 0];
              const maxI = [0, 0, 0];
              for (let a = 0; a < 3; a++) {
                const lo = Math.floor((minF[a] + supercell / 2) * baseDims[a]) - margin;
                const hi = Math.ceil((maxF[a] + supercell / 2) * baseDims[a]) + margin;
                minI[a] = clamp(lo, 0, dimsMC[a] - 1);
                maxI[a] = clamp(hi, 0, dimsMC[a] - 1);
              }
              cropOffset = [minI[0], minI[1], minI[2]];
              cropDims = [maxI[0] - minI[0] + 1, maxI[1] - minI[1] + 1, maxI[2] - minI[2] + 1];
              if (cropDims[0] > 0 && cropDims[1] > 0 && cropDims[2] > 0) {
                const out = new Array(cropDims[0] * cropDims[1] * cropDims[2]);
                for (let x = 0; x < cropDims[0]; x++) {
                  for (let y = 0; y < cropDims[1]; y++) {
                    for (let z = 0; z < cropDims[2]; z++) {
                      const srcX = x + cropOffset[0];
                      const srcY = y + cropOffset[1];
                      const srcZ = z + cropOffset[2];
                      const src = (srcX * dimsMC[1] + srcY) * dimsMC[2] + srcZ;
                      const dst = (x * cropDims[1] + y) * cropDims[2] + z;
                      out[dst] = valuesMC[src];
                    }
                  }
                }
                valuesMC = out;
              } else {
                cropOffset = [0, 0, 0];
                cropDims = dimsMC;
              }
            }
          }
          this.cache.set(cacheKey, { values: valuesMC, offset: cropOffset, dims: cropDims });
        }

        const isovalue = setting.isovalue !== null ? setting.isovalue : 0.0;
        const isoData = marchingCubes(cropDims, valuesMC, null, isovalue, setting.step_size, { periodic: false });
        const faces = Array.isArray(isoData.cells) ? isoData.cells : Array.from(isoData.cells || []);

        let positions = [];
        let localFaces = [];
        if (setting.wrapFractional) {
          const frac = isoData.positions.map((pos) => [
            (pos[0] + cropOffset[0]) / baseDims[0] - supercell / 2,
            (pos[1] + cropOffset[1]) / baseDims[1] - supercell / 2,
            (pos[2] + cropOffset[2]) / baseDims[2] - supercell / 2,
          ]);
          for (let i = 0; i < faces.length; i += 3) {
            const i0 = faces[i];
            const i1 = faces[i + 1];
            const i2 = faces[i + 2];
            const f0 = frac[i0];
            const f1 = frac[i1].slice();
            const f2 = frac[i2].slice();
            for (let a = 0; a < 3; a++) {
              let d1 = f1[a] - f0[a];
              if (d1 > 0.5) f1[a] -= 1;
              else if (d1 < -0.5) f1[a] += 1;
              let d2 = f2[a] - f0[a];
              if (d2 > 0.5) f2[a] -= 1;
              else if (d2 < -0.5) f2[a] += 1;
            }
            const base = positions.length;
            const p0 = [
              f0[0] * cell[0][0] + f0[1] * cell[1][0] + f0[2] * cell[2][0] + origin[0],
              f0[0] * cell[0][1] + f0[1] * cell[1][1] + f0[2] * cell[2][1] + origin[1],
              f0[0] * cell[0][2] + f0[1] * cell[1][2] + f0[2] * cell[2][2] + origin[2],
            ];
            const p1 = [
              f1[0] * cell[0][0] + f1[1] * cell[1][0] + f1[2] * cell[2][0] + origin[0],
              f1[0] * cell[0][1] + f1[1] * cell[1][1] + f1[2] * cell[2][1] + origin[1],
              f1[0] * cell[0][2] + f1[1] * cell[1][2] + f1[2] * cell[2][2] + origin[2],
            ];
            const p2 = [
              f2[0] * cell[0][0] + f2[1] * cell[1][0] + f2[2] * cell[2][0] + origin[0],
              f2[0] * cell[0][1] + f2[1] * cell[1][1] + f2[2] * cell[2][1] + origin[1],
              f2[0] * cell[0][2] + f2[1] * cell[1][2] + f2[2] * cell[2][2] + origin[2],
            ];
            positions.push(p0, p1, p2);
            localFaces.push(base, base + 1, base + 2);
          }
        } else {
          positions = isoData.positions.map((pos) => {
            const fx = (pos[0] + cropOffset[0]) / baseDims[0] - supercell / 2;
            const fy = (pos[1] + cropOffset[1]) / baseDims[1] - supercell / 2;
            const fz = (pos[2] + cropOffset[2]) / baseDims[2] - supercell / 2;
            const x = fx * cell[0][0] + fy * cell[1][0] + fz * cell[2][0] + origin[0];
            const y = fx * cell[0][1] + fy * cell[1][1] + fz * cell[2][1] + origin[1];
            const z = fx * cell[0][2] + fy * cell[1][2] + fz * cell[2][2] + origin[2];
            return [x, y, z];
          });
          localFaces = faces;
        }

        const tileCount = Math.max(1, Math.floor(typeof setting.tile === "number" ? setting.tile : 1));
        const tileX = tileCount;
        const tileY = tileCount;
        const tileZ = tileCount;
        let tiledPositions = positions;
        let tiledFaces = localFaces;
        if (tileX > 1 || tileY > 1 || tileZ > 1) {
          tiledPositions = [];
          tiledFaces = [];
          const shifts = [];
          const sx0 = -Math.floor(tileX / 2);
          const sy0 = -Math.floor(tileY / 2);
          const sz0 = -Math.floor(tileZ / 2);
          for (let sx = sx0; sx < sx0 + tileX; sx++) {
            for (let sy = sy0; sy < sy0 + tileY; sy++) {
              for (let sz = sz0; sz < sz0 + tileZ; sz++) {
                shifts.push([sx, sy, sz]);
              }
            }
          }
          let offset = 0;
          for (let s = 0; s < shifts.length; s++) {
            const [sx, sy, sz] = shifts[s];
            const dx = sx * cell[0][0] + sy * cell[1][0] + sz * cell[2][0];
            const dy = sx * cell[0][1] + sy * cell[1][1] + sz * cell[2][1];
            const dz = sx * cell[0][2] + sy * cell[1][2] + sz * cell[2][2];
            for (let i = 0; i < positions.length; i++) {
              const p = positions[i];
              tiledPositions.push([p[0] + dx, p[1] + dy, p[2] + dz]);
            }
            for (let i = 0; i < localFaces.length; i += 3) {
              tiledFaces.push(localFaces[i] + offset, localFaces[i + 1] + offset, localFaces[i + 2] + offset);
            }
            offset += positions.length;
          }
        }

        if (setting.clipToBZ) {
          const planes = setting.clipPlanes || dataset.bzPlanes || data.bzPlanes || null;
          if (planes && planes.length && tiledFaces.length) {
            const clipped = clipMeshToPlanes(tiledPositions, tiledFaces, planes, setting.clipEps);
            positions = clipped.positions;
            localFaces = clipped.faces;
          } else {
            positions = tiledPositions;
            localFaces = tiledFaces;
          }
        } else {
          positions = tiledPositions;
          localFaces = tiledFaces;
        }

        if (positions.length && localFaces.length) {
          for (let i = 0; i < positions.length; i++) {
            mergedPositions.push(positions[i]);
          }
          for (let i = 0; i < localFaces.length; i += 3) {
            mergedFaces.push(localFaces[i] + vertOffset, localFaces[i + 1] + vertOffset, localFaces[i + 2] + vertOffset);
          }
          vertOffset += positions.length;
        }
      });

      if (!mergedPositions.length || !mergedFaces.length) return;

      const vertices = mergedPositions.reduce((acc, pos) => {
        acc.push(pos[0], pos[1], pos[2]);
        return acc;
      }, []);

      nextAnyMeshSettings.push({
        name,
        vertices,
        faces: mergedFaces,
        color: setting.color,
        opacity: setting.opacity,
        materialType: setting.materialType,
        side: "DoubleSide",
        depthWrite: true,
        depthTest: true,
        mergeVerticesTolerance: setting.mergeVerticesTolerance,
        smoothNormals: setting.smoothNormals,
        selectable: false,
        layer: 1,
        userData: {
          source: "fermiSurface",
          fermiSurface: name,
        },
      });

      this.meshes[name] = name;
    });

    this.updateAnyMeshSettings(nextAnyMeshSettings);
  }

  updateAnyMeshSettings(nextFermiSettings) {
    const anyMesh = this.viewer?.weas?.anyMesh;
    if (!anyMesh || typeof anyMesh.setSettings !== "function") return;
    const currentSettings = Array.isArray(anyMesh.settings) ? anyMesh.settings : [];
    const preserved = currentSettings.filter((setting) => setting?.userData?.source !== "fermiSurface" && setting?.userData?.source !== "brillouinZone");
    const previous = new Map();
    currentSettings.forEach((setting) => {
      if (setting?.name && (setting?.userData?.source === "fermiSurface" || setting?.userData?.source === "brillouinZone")) {
        previous.set(setting.name, setting);
      }
    });
    const merged = nextFermiSettings.map((setting) => {
      const prior = previous.get(setting.name);
      if (prior && typeof prior.visible === "boolean") {
        return { ...setting, visible: prior.visible };
      }
      return setting;
    });
    anyMesh.setSettings([...preserved, ...merged]);
  }
}
