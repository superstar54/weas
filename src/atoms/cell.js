import * as THREE from "three";
import { createLabel } from "../utils.js";
import { drawArrow } from "../tools/primitives.js";

export class CellManager {
  constructor(viewer) {
    this.viewer = viewer;
    this.cellMesh = null;
    this.cellVectors = null;
    this.labels = [];
    this._showCell = viewer._showCell;
  }

  get showCell() {
    return this._showCell;
  }

  set showCell(newValue) {
    this._showCell = newValue;
    if (this.cellMesh) {
      this.cellMesh.visible = newValue;
    }
    if (this.cellVectors) {
      this.cellVectors.visible = newValue;
    }
    this.labels.forEach((label) => {
      label.visible = newValue;
    });
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
    if (this.labels.length > 0) {
      this.labels.forEach((label) => {
        this.viewer.tjs.scene.remove(label);
        label.remove();
      });
      this.labels = [];
    }
  }

  draw() {
    this.clear();
    if (!this.viewer.originalCell.some((row) => row.every((cell) => cell === 0))) {
      this.cellMesh = this.drawUnitCell();
      this.cellVectors = this.drawUnitCellVectors();
    }
  }

  drawUnitCell() {
    const cell = this.viewer.originalCell;
    if (!cell || cell.length !== 3) {
      console.warn("Invalid or missing unit cell data");
      return;
    }

    const cellMatrix = cell;

    const material = new THREE.LineBasicMaterial({ color: 0x000000 });
    const points = [];

    // Origin
    const origin = new THREE.Vector3(0, 0, 0);

    // Cell vertices
    const v0 = origin;
    const v1 = new THREE.Vector3(...cellMatrix[0]);
    const v2 = new THREE.Vector3(...cellMatrix[1]);
    const v3 = new THREE.Vector3().addVectors(v1, v2);
    const v4 = new THREE.Vector3(...cellMatrix[2]);
    const v5 = new THREE.Vector3().addVectors(v1, v4);
    const v6 = new THREE.Vector3().addVectors(v2, v4);
    const v7 = new THREE.Vector3().addVectors(v3, v4);

    // Lines
    // Base
    points.push(v0.clone(), v1.clone(), v1.clone(), v3.clone(), v3.clone(), v2.clone(), v2.clone(), v0.clone());
    // Top
    points.push(v4.clone(), v5.clone(), v5.clone(), v7.clone(), v7.clone(), v6.clone(), v6.clone(), v4.clone());
    // Sides
    points.push(v0.clone(), v4.clone(), v1.clone(), v5.clone(), v2.clone(), v6.clone(), v3.clone(), v7.clone());

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.LineSegments(geometry, material);
    line.userData.type = "cell";
    line.userData.uuid = this.viewer.uuid;
    line.userData.objectMode = "edit";
    line.userData.notSelectable = true;
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

    // Create a group to hold all arrows, labels, and the origin sphere
    const unitCellGroup = new THREE.Group();

    // Define lengths, colors, and other parameters for the arrows
    const arrowLength = 2; // Length of the arrow
    const arrowRadius = 0.1; // Radius of the cylinder
    const coneHeight = 0.5; // Height of the cone
    const coneRadius = 0.2; // Radius of the cone
    const sphereRadius = 0.2; // Radius of the origin sphere
    const colors = { a: 0xff0000, b: 0x00ff00, c: 0x0000ff }; // Red, Green, Blue

    const directions = [new THREE.Vector3(...cell[0]).normalize(), new THREE.Vector3(...cell[1]).normalize(), new THREE.Vector3(...cell[2]).normalize()];

    // Create arrows for each direction
    const aArrow = drawArrow({ position: origin, direction: directions[0], arrowLength, arrowRadius, coneHeight, coneRadius, color: colors.a });
    const bArrow = drawArrow({ position: origin, direction: directions[1], arrowLength, arrowRadius, coneHeight, coneRadius, color: colors.b });
    const cArrow = drawArrow({ position: origin, direction: directions[2], arrowLength, arrowRadius, coneHeight, coneRadius, color: colors.c });

    // Add arrows to the group
    unitCellGroup.add(aArrow);
    unitCellGroup.add(bArrow);
    unitCellGroup.add(cArrow);

    // Add labels for each axis
    const offset = 2.1; // Adjust this to position the labels
    const aLabel = createLabel(directions[0].multiplyScalar(offset), "a", "red", "88px");
    const bLabel = createLabel(directions[1].multiplyScalar(offset), "b", "green", "88px");
    const cLabel = createLabel(directions[2].multiplyScalar(offset), "c", "blue", "88px");

    // Add labels to the group
    this.labels.push(aLabel);
    this.labels.push(bLabel);
    this.labels.push(cLabel);
    this.viewer.tjs.coordScene.add(aLabel);
    this.viewer.tjs.coordScene.add(bLabel);
    this.viewer.tjs.coordScene.add(cLabel);

    // Create the sphere at the origin
    const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 16, 16);
    const sphereMaterial = new THREE.MeshStandardMaterial({ color: "grey" }); // Yellow color for the origin
    const originSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

    // Add the sphere to the group
    unitCellGroup.add(originSphere);

    // Add the group to the scene
    this.viewer.tjs.coordScene.add(unitCellGroup);
    unitCellGroup.visible = this.showCell;

    // Return the group for further control if needed
    return unitCellGroup;
  }
}
