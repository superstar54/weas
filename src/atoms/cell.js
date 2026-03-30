import * as THREE from "three";
import merge from "lodash.merge";

/**
 * Default settings for the CellManager.
 * These can be overridden by passing a settings object to the constructor,
 * state on the cell manager
 **/
const DEFAULT_CELL_SETTINGS = {
  showCell: true,
  showAxes: true,
  cellColor: 0x000000,
  cellLineWidth: 2,
  hudAxisColors: {
    a: 0xff0000,
    b: 0x00ff00,
    c: 0x0000ff,
  },
};

/**
 * CellManager is responsible for rendering and managing the unit cell visualisation
 * in a crystal structure viewer. This includes:
 *
 * - The unit cell bounding box (drawn as edges of a convex hull)
 * - The HUD axis vectors (a, b, c arrows with labels in the mini coord scene)
 *
 * It listens to the viewer's "cell" state for live setting updates, and exposes
 * `updateCellMesh` for efficient per-frame updates during trajectory playback
 * where the cell may change between frames.
 *
 *
 * This module is typically fully controlled by the atoms viewer but could be invoked manually.
 *
 * Example usage:
 *   const cellManager = new CellManager(viewer, { cellColor: 0xff0000 });
 *   cellManager.draw();
 *
 * @module atoms/CellManager
 * @class
 */
export class CellManager {
  /**
   * @param {object} viewer - The parent viewer instance, expected to expose:
   *   viewer.weas.shapeRegistry, viewer.tjs.scene, viewer.tjs.hud,
   *   viewer.state, viewer.originalCell, viewer.uuid, viewer.requestRedraw
   * @param {object} settings - Optional setting overrides (see DEFAULT_CELL_SETTINGS)
   */
  constructor(viewer, settings = {}) {
    this.viewer = viewer;
    this.shapeRegistry = viewer.weas.shapeRegistry;

    this.settings = merge({}, DEFAULT_CELL_SETTINGS, settings);

    this._showCell = this.settings.showCell;
    this._showAxes = this.settings.showAxes;

    // Apply any persisted state on top of defaults
    const cellState = this.viewer.state.get("cell") || {};
    merge(this.settings, cellState);

    if (cellState.showCell !== undefined) this._showCell = cellState.showCell;
    if (cellState.showAxes !== undefined) this._showAxes = cellState.showAxes;

    // Listen for changes to cell state
    this.viewer.state.subscribe("cell", (next, prev) =>
      this._onCellStateChange(next, prev),
    );
  }

  /** Whether the unit cell bounding box is visible. */
  get showCell() {
    return this._showCell;
  }

  set showCell(newValue) {
    this._showCell = newValue;
    if (this.cellMesh) this.cellMesh.visible = newValue;
    if (this.cellVectors) this.cellVectors.visible = newValue;
    this.viewer.requestRedraw?.("render");
  }

  /** Whether the HUD axis vectors (a, b, c) are visible. */
  get showAxes() {
    return this._showAxes;
  }

  set showAxes(newValue) {
    this._showAxes = newValue;
    if (this.cellVectors) this.cellVectors.visible = newValue;
    this.viewer.requestRedraw?.("render");
  }

  /**
   * Removes all CellManager objects from the scene and disposes their resources.
   * Called automatically by draw() before redrawing.
   */
  clear() {
    if (this.cellMesh) {
      this.viewer.tjs.scene.remove(this.cellMesh);
      this.cellMesh.geometry.dispose();
      this.cellMesh.material.dispose();
      this.cellMesh = null;
    }
    if (this.cellVectors) {
      const axesGroup = this.viewer.tjs.hud.coordAxesGroup;
      if (axesGroup) {
        axesGroup.remove(this.cellVectors);
      }
      this.cellVectors = null;
    }
  }

  /**
   * Clears and redraws the unit cell and axis vectors from the current viewer state.
   * Skips drawing if the cell is all zeros (i.e. no cell defined).
   */
  draw() {
    this.clear();
    if (
      !this.viewer.originalCell.some((row) => row.every((cell) => cell === 0))
    ) {
      this.currentCell = this.viewer.originalCell.map((row) => row.slice());
      this.cellMesh = this.drawUnitCell();
      this.cellVectors = this.drawUnitCellVectors();
      this.cellVectors.visible = this.showAxes;
    }
  }

  /**
   * Draws the unit cell as an edge outline of a convex hull built from the 8 lattice corners.
   * Works for any crystal system including triclinic (non-orthogonal) cells.
   *
   * @returns {THREE.LineSegments | undefined}
   */
  drawUnitCell() {
    const cell = this.viewer.originalCell;
    if (!cell || cell.length !== 3) {
      console.warn("Invalid or missing unit cell data");
      return;
    }

    const unitcell = this.shapeRegistry.create("ConvexShape", {
      corners: getCellCorners(cell),
      edges: true,
      color: this.settings.cellColor,
    });

    unitcell.userData = {
      type: "cell",
      uuid: this.viewer.uuid,
      objectMode: "edit",
      notSelectable: true,
    };
    unitcell.layers.set(1);
    unitcell.visible = this.showCell;
    this.viewer.tjs.scene.add(unitcell);
    return unitcell;
  }

  /**
   * Uses the weas builtin hud coord-miniscene to draw the a, b, c lattice vectors as arrows with labels
   * Arrow directions are normalised so length is consistent regardless of cell size.
   *
   * @returns {THREE.Group | undefined}
   */
  drawUnitCellVectors() {
    const origin = new THREE.Vector3(0, 0, 0);
    const cell = this.viewer.originalCell;
    const arrowLength = 1.5;

    if (!cell || cell.length !== 3) {
      console.warn("Invalid or missing unit cell data for vectors");
      return;
    }

    // draw it ontop of the weas coord scene
    const coordMini = this.viewer.tjs.hud.miniScenes.get("coord");
    if (!coordMini) return;
    const axesGroup = this.viewer.tjs.hud.coordAxesGroup;

    const unitCellGroup = new THREE.Group();
    const axisNames = ["a", "b", "c"];
    const axisColors = this.settings.hudAxisColors;
    const offset = 0.5;

    // Target arrow length in mini scene units
    cell.forEach((vec, i) => {
      const rawVec = new THREE.Vector3(...vec);
      const dir = rawVec.clone().normalize(); // direction
      const end = dir.clone().multiplyScalar(arrowLength); // normalized length

      const arrow = this.shapeRegistry.create("Arrow", {
        color: axisColors[axisNames[i]],
        start: origin.clone(),
        end: end.clone(),
        shaftRadius: 0.06,
        headRadius: 0.12,
        shaftRatio: 0.75,
      });
      unitCellGroup.add(arrow);

      // Label slightly beyond tip
      const labelPos = end.clone().multiplyScalar(1 + offset / arrowLength);
      unitCellGroup.add(
        createSpriteLabel(labelPos, axisNames[i], "black", "36px"),
      );

      const sphere = this.shapeRegistry.create("Sphere", {
        color: "grey",
        position: origin.clone(),
        scale: [0.22, 0.22, 0.22],
      });
      unitCellGroup.add(sphere);
    });

    axesGroup.add(unitCellGroup);
    unitCellGroup.visible = this.showCell;

    return unitCellGroup;
  }

  /**
   * Updates the unit cell mesh in-place when the cell changes between
   * trajectory frames. Skips the update if the cell is unchanged within CHANGE_TOL.
   * Avoids a full clear/redraw for performance during playback.
   *
   * @param {number[][]} cell - 3x3 array of lattice vectors [[ax,ay,az], [bx,by,bz], [cx,cy,cz]]
   */
  updateCellMesh(cell) {
    const CHANGE_TOL = 1e-5;
    if (!cell || cell.length !== 3) return;
    if (!this.cellMesh || !this.currentCell) return;

    const unchanged = cell.every((row, i) =>
      row.every((v, j) => Math.abs(v - this.currentCell[i][j]) < CHANGE_TOL),
    );
    if (unchanged) return;

    this.currentCell = cell.map((row) => row.slice());
    this.cellMesh.updateCorners(getCellCorners(this.currentCell));
  }

  /**
   * Handles live updates to the "cell" state slice.
   * Merges visual settings and triggers a redraw if anything changed.
   * showCell and showAxes are handled via their setters to immediately
   * update scene visibility without a full redraw.
   *
   * @param {object} next - Incoming state
   * @param {object} prev - Previous state
   */
  _onCellStateChange(next, prev) {
    if (!next) return;

    const { showCell, showAxes, ...visualSettings } = next;
    const { showCell: _, showAxes: __, ...prevVisualSettings } = prev || {};

    merge(this.settings, visualSettings);

    if (showCell !== undefined) this.showCell = showCell;
    if (showAxes !== undefined) this.showAxes = showAxes;

    const settingsChanged =
      JSON.stringify(visualSettings) !== JSON.stringify(prevVisualSettings);
    if (settingsChanged) {
      this.draw();
      this.viewer.requestRedraw?.("render");
    }
  }
}

/**
 * Computes the 8 corner points of a parallelepiped unit cell from its 3 lattice vectors.
 * Works for any crystal system including triclinic cells with non-orthogonal vectors.
 *
 * @param {number[][]} cell - 3x3 array [[ax,ay,az], [bx,by,bz], [cx,cy,cz]]
 * @returns {number[][]} Array of 8 [x,y,z] corner positions
 */
export function getCellCorners(cell) {
  const [a, b, c] = cell;
  const o = [0, 0, 0];
  const add = (x, y) => [x[0] + y[0], x[1] + y[1], x[2] + y[2]];
  return [o, a, b, c, add(a, b), add(a, c), add(b, c), add(add(a, b), c)];
}

/**
 * Creates a canvas-based sprite label for use in the HUD scene.
 *
 * @param {THREE.Vector3} position
 * @param {string} text
 * @param {string} color - CSS color string
 * @param {string} size - Font size e.g. "36px"
 * @returns {THREE.Sprite}
 */
function createSpriteLabel(position, text, color, size) {
  const canvasSize = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  const context = canvas.getContext("2d");

  context.font = `${parseInt(size) * (canvasSize / 180)}px Arial`;
  context.fillStyle = color;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.encoding = THREE.sRGBEncoding;
  texture.anisotropy = 16;

  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture }));
  sprite.position.copy(position);

  const scale = 2.25;
  sprite.scale.set(scale, scale, 1);

  return sprite;
}
