import * as THREE from "three";

// TODO - investigate whether this is being cleaned up properly between swapping of structures etc.
export class CellManager {
  constructor(viewer, settings = {}) {
    this.viewer = viewer;
    this.cellMesh = null;
    this.cellVectors = null;
    this.shapeRegistry = viewer.weas.shapeRegistry;

    // Default settings with user overrides
    this.settings = {
      showCell: settings.showCell ?? true,
      showAxes: settings.showAxes ?? true,
      cellColor: settings.cellColor ?? 0x000000, // Default black
      cellLineWidth: settings.cellLineWidth ?? 2, // Default width
      axisColors: settings.axisColors ?? {
        a: 0xff0000,
        b: 0x00ff00,
        c: 0x0000ff,
      }, // RGB
    };

    this._showCell = this.settings.showCell;
    this._showAxes = this.settings.showAxes;

    const cellState = this.viewer.state.get("cell") || {};
    Object.assign(this.settings, cellState);
    if (cellState.showCell !== undefined) {
      this._showCell = cellState.showCell;
    }
    if (cellState.showAxes !== undefined) {
      this._showAxes = cellState.showAxes;
    }
    this.viewer.state.subscribe("cell", (next, prev) => {
      if (!next) {
        return;
      }
      const prevState = prev || {};
      const {
        showCell: nextShowCell,
        showAxes: nextShowAxes,
        ...nextSettings
      } = next;
      const prevSettings = { ...prevState };
      delete prevSettings.showCell;
      delete prevSettings.showAxes;
      Object.assign(this.settings, nextSettings);
      if (nextShowCell !== undefined) {
        this.showCell = nextShowCell;
      }
      if (nextShowAxes !== undefined) {
        this.showAxes = nextShowAxes;
      }
      const settingsChanged =
        JSON.stringify(nextSettings) !== JSON.stringify(prevSettings);
      if (settingsChanged) {
        this.draw();
        this.viewer.requestRedraw?.("render");
      }
    });
  }

  get showCell() {
    return this._showCell;
  }

  set showCell(newValue) {
    this._showCell = newValue;
    if (this.cellMesh) this.cellMesh.visible = newValue;
    if (this.cellVectors) this.cellVectors.visible = newValue;
    this.viewer.requestRedraw?.("render");
  }

  get showAxes() {
    return this._showAxes;
  }

  set showAxes(newValue) {
    this._showAxes = newValue;
    if (this.cellVectors) this.cellVectors.visible = newValue;
    this.viewer.requestRedraw?.("render");
  }

  clear() {
    if (this.cellMesh) {
      this.viewer.tjs.scene.remove(this.cellMesh);
      this.cellMesh.geometry.dispose();
      this.cellMesh.material.dispose();
      this.cellMesh = null;
    }
    if (this.cellVectors) {
      const coordMini = this.viewer.tjs.hud.miniScenes.get("coord");
      if (coordMini) {
        coordMini.scene.remove(this.cellVectors);
      }
      this.cellVectors = null;
    }
  }

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

  drawUnitCell() {
    const cell = this.viewer.originalCell;
    if (!cell || cell.length !== 3) {
      console.warn("Invalid or missing unit cell data");
      return;
    }

    const [a, b, c] = cell;
    const o = [0, 0, 0];

    const corners = [
      o,
      a,
      b,
      c,
      [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
      [a[0] + c[0], a[1] + c[1], a[2] + c[2]],
      [b[0] + c[0], b[1] + c[1], b[2] + c[2]],
      [a[0] + b[0] + c[0], a[1] + b[1] + c[1], a[2] + b[2] + c[2]],
    ];

    // make a unitcell using the weas builtin in the shapeRegistry
    const unitcell = this.shapeRegistry.create("ConvexShape", {
      corners,
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
    const axisColors = this.settings.axisColors;
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

  updateCellMesh(cell) {
    const CHANGE_TOL = 1e-5;
    if (!cell || cell.length !== 3) return;
    if (!this.cellMesh || !this.currentCell) return;

    const unchanged = cell.every((row, i) =>
      row.every((v, j) => Math.abs(v - this.currentCell[i][j]) < CHANGE_TOL),
    );
    if (unchanged) return;

    this.currentCell = cell.map((row) => row.slice());
    const [a, b, c] = cell;
    const o = [0, 0, 0];
    const add = (x, y) => [x[0] + y[0], x[1] + y[1], x[2] + y[2]];

    this.cellMesh.updateCorners([
      o,
      a,
      b,
      c,
      add(a, b),
      add(a, c),
      add(b, c),
      add(add(a, b), c),
    ]);
  }
}

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
