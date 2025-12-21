import * as THREE from "three";
import { createLabel } from "../utils.js";
import { drawArrow } from "../tools/primitives.js";

export class CellManager {
  constructor(viewer, settings = {}) {
    this.viewer = viewer;
    this.cellMesh = null;
    this.cellVectors = null;

    // Default settings with user overrides
    this.settings = {
      showCell: settings.showCell ?? true,
      showAxes: settings.showAxes ?? true,
      cellColor: settings.cellColor ?? 0x000000, // Default black
      cellLineWidth: settings.cellLineWidth ?? 2, // Default width
      axisColors: settings.axisColors ?? { a: 0xff0000, b: 0x00ff00, c: 0x0000ff }, // RGB
      axisRadius: settings.axisRadius ?? 0.15,
      axisConeHeight: settings.axisConeHeight ?? 0.8,
      axisConeRadius: settings.axisConeRadius ?? 0.3,
      axisSphereRadius: settings.axisSphereRadius ?? 0.3,
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
      const { showCell: nextShowCell, showAxes: nextShowAxes, ...nextSettings } = next;
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
      const settingsChanged = JSON.stringify(nextSettings) !== JSON.stringify(prevSettings);
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
      this.viewer.tjs.coordScene.remove(this.cellVectors);
      this.cellVectors = null;
    }
  }

  draw() {
    this.clear();
    if (!this.viewer.originalCell.some((row) => row.every((cell) => cell === 0))) {
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

    const material = new THREE.LineBasicMaterial({
      color: this.settings.cellColor,
      linewidth: this.settings.cellLineWidth,
    });

    const points = [];

    const origin = new THREE.Vector3(0, 0, 0);
    const v1 = new THREE.Vector3(...cell[0]);
    const v2 = new THREE.Vector3(...cell[1]);
    const v3 = new THREE.Vector3().addVectors(v1, v2);
    const v4 = new THREE.Vector3(...cell[2]);
    const v5 = new THREE.Vector3().addVectors(v1, v4);
    const v6 = new THREE.Vector3().addVectors(v2, v4);
    const v7 = new THREE.Vector3().addVectors(v3, v4);

    // Base
    points.push(origin, v1, v1, v3, v3, v2, v2, origin);
    // Top
    points.push(v4, v5, v5, v7, v7, v6, v6, v4);
    // Sides
    points.push(origin, v4, v1, v5, v2, v6, v3, v7);

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.LineSegments(geometry, material);
    line.userData = { type: "cell", uuid: this.viewer.uuid, objectMode: "edit", notSelectable: true };
    line.layers.set(1);
    this.viewer.tjs.scene.add(line);
    line.visible = this.showCell;
    return line;
  }

  drawUnitCellVectors() {
    const origin = new THREE.Vector3(0, 0, 0);
    const cell = this.viewer.originalCell;
    if (!cell || cell.length !== 3) {
      console.warn("Invalid or missing unit cell data for vectors");
      return;
    }

    const unitCellGroup = new THREE.Group();
    const directions = [new THREE.Vector3(...cell[0]).normalize(), new THREE.Vector3(...cell[1]).normalize(), new THREE.Vector3(...cell[2]).normalize()];

    // Draw arrows
    const aArrow = drawArrow({
      position: origin,
      direction: directions[0],
      arrowLength: 3,
      arrowRadius: this.settings.axisRadius,
      coneHeight: this.settings.axisConeHeight,
      coneRadius: this.settings.axisConeRadius,
      color: this.settings.axisColors.a,
    });

    const bArrow = drawArrow({
      position: origin,
      direction: directions[1],
      arrowLength: 3,
      arrowRadius: this.settings.axisRadius,
      coneHeight: this.settings.axisConeHeight,
      coneRadius: this.settings.axisConeRadius,
      color: this.settings.axisColors.b,
    });

    const cArrow = drawArrow({
      position: origin,
      direction: directions[2],
      arrowLength: 3,
      arrowRadius: this.settings.axisRadius,
      coneHeight: this.settings.axisConeHeight,
      coneRadius: this.settings.axisConeRadius,
      color: this.settings.axisColors.c,
    });

    unitCellGroup.add(aArrow, bArrow, cArrow);

    // Add axis labels
    const offset = 3.3;
    unitCellGroup.add(createSpriteLabel(directions[0].multiplyScalar(offset), "a", "black", "80px"));
    unitCellGroup.add(createSpriteLabel(directions[1].multiplyScalar(offset), "b", "black", "80px"));
    unitCellGroup.add(createSpriteLabel(directions[2].multiplyScalar(offset), "c", "black", "80px"));

    // Create sphere at origin
    const sphereGeometry = new THREE.SphereGeometry(this.settings.axisSphereRadius, 16, 16);
    const sphereMaterial = new THREE.MeshStandardMaterial({ color: "grey" });
    unitCellGroup.add(new THREE.Mesh(sphereGeometry, sphereMaterial));

    this.viewer.tjs.coordScene.add(unitCellGroup);
    unitCellGroup.visible = this.showCell;
    return unitCellGroup;
  }

  updateCellMesh(cell) {
    if (!cell || cell.length !== 3) {
      console.warn("Invalid cell data for updating cell mesh");
      return;
    }
    if (!this.cellMesh && !this.currentCell) return;

    const eps = 1e-5;
    if (cell.every((row, i) => row.every((cellValue, j) => Math.abs(cellValue - this.currentCell[i][j]) < eps))) {
      return;
    }

    if (this.cellMesh) {
      const material = new THREE.LineBasicMaterial({
        color: this.settings.cellColor,
        linewidth: this.settings.cellLineWidth,
      });

      const points = [];
      const origin = new THREE.Vector3(0, 0, 0);
      const v1 = new THREE.Vector3(...cell[0]);
      const v2 = new THREE.Vector3(...cell[1]);
      const v3 = new THREE.Vector3().addVectors(v1, v2);
      const v4 = new THREE.Vector3(...cell[2]);
      const v5 = new THREE.Vector3().addVectors(v1, v4);
      const v6 = new THREE.Vector3().addVectors(v2, v4);
      const v7 = new THREE.Vector3().addVectors(v3, v4);

      points.push(origin, v1, v1, v3, v3, v2, v2, origin);
      points.push(v4, v5, v5, v7, v7, v6, v6, v4);
      points.push(origin, v4, v1, v5, v2, v6, v3, v7);

      this.cellMesh.geometry.setFromPoints(points);
      this.cellMesh.material = material;
    }

    if (this.cellVectors) {
      const directions = [new THREE.Vector3(...cell[0]).normalize(), new THREE.Vector3(...cell[1]).normalize(), new THREE.Vector3(...cell[2]).normalize()];

      const axis = new THREE.Vector3(0, 1, 0);
      for (let i = 0; i < 3; i++) {
        const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, directions[i]);
        this.cellVectors.children[i].setRotationFromQuaternion(quaternion);
      }

      const offset = 3.3;
      this.cellVectors.children[3].position.copy(directions[0].multiplyScalar(offset));
      this.cellVectors.children[4].position.copy(directions[1].multiplyScalar(offset));
      this.cellVectors.children[5].position.copy(directions[2].multiplyScalar(offset));
    }
  }
}

function createSpriteLabel(position, text, color, size) {
  const canvas = document.createElement("canvas");
  canvas.width = 120;
  canvas.height = 120;
  const context = canvas.getContext("2d");
  context.font = `${size} Arial`;
  context.fillStyle = color;
  context.textAlign = "center";
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture }));
  sprite.position.copy(position);
  sprite.scale.set(1.5, 1.5, 1);
  return sprite;
}
