import * as THREE from "three";
import { createLabel } from "../../utils.js";

class Setting {
  constructor({ indices = [], color = "black", fontSize = 16 }) {
    /* A class to store label settings.
    indices: the indices of the atoms to measure
      no atoms: clear the previous measurements
      single atom: xyz position and atomic symbol
      two atoms: interatomic distance
      three atoms: the angle between bonds 12 and 23
      four atoms: the dihedral angle between bonds 12 and 34
    */

    this.indices = indices;
    this.color = color;
    this.fontSize = fontSize;
  }
}

export class Measurement {
  constructor(viewer) {
    this.viewer = viewer;
    this.scene = this.viewer.tjs.scene;
    this.settings = [];
    this.meshes = [];
  }

  reset() {
    /* Reset the measurements */
    this.settings = [];
    this.meshes.forEach((mesh) => {
      this.scene.remove(mesh);
    });
    this.meshes = [];
  }

  measure(indices = null) {
    /* Measures the distance, angle, or dihedral angle between atoms.*/

    if (indices.length === 0) {
      // Clear the previous measurements
      this.meshes.forEach((mesh) => {
        this.scene.remove(mesh);
      });
      this.settings = [];
      this.meshes = [];
    } else {
      this.settings.push(new Setting({ indices: indices }));
    }
    this.drawMeasurements();
  }

  drawMeasurements() {
    /* Draw the measurements */
    this.settings.forEach((setting) => {
      const indices = setting.indices;
      if (indices.length === 1) {
        this.showPosition(indices);
      } else if (indices.length === 2) {
        this.showDistance(indices);
      } else if (indices.length === 3) {
        this.showAngle(indices);
      } else if (indices.length === 4) {
        this.showDihedralAngle(indices);
      } else {
        console.log("Invalid number of atoms for measurement");
      }
    });
    // call the render function to update the scene
    this.viewer.tjs.render();
  }

  showPosition(indices) {
    const atomIndex = indices[0];
    const position = this.viewer.atoms.positions[atomIndex];
    const symbol = this.viewer.atoms.symbols[atomIndex];
    console.log(position, symbol);
    // Construct and return the formatted string
    const text = `${symbol} [${position[0].toFixed(3)}, ${position[1].toFixed(3)}, ${position[2].toFixed(3)}]`;
    // lable shift by 1.0 in x direction
    const label = createLabel(new THREE.Vector3(...position).add(new THREE.Vector3(1, 0, 0)), text, "black", "18px");
    this.scene.add(label);
    this.meshes.push(label);
  }
  showDistance(indices) {
    const position1 = new THREE.Vector3(...this.viewer.atoms.positions[indices[0]]);
    const position2 = new THREE.Vector3(...this.viewer.atoms.positions[indices[1]]);
    const distance = position1.distanceTo(position2);
    const points = [position1, position2];
    // create a line between the two atoms, and display the distance
    const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.LineSegments(geometry, material);
    this.scene.add(line);
    this.meshes.push(line);
    // add distance to the line
    const label = createLabel(position1.add(position2).multiplyScalar(0.5), distance.toFixed(3), "black", "18px");
    this.scene.add(label);
    this.meshes.push(label);
  }
  showAngle(indices) {
    const position1 = new THREE.Vector3(...this.viewer.atoms.positions[indices[0]]);
    const position2 = new THREE.Vector3(...this.viewer.atoms.positions[indices[1]]);
    const position3 = new THREE.Vector3(...this.viewer.atoms.positions[indices[2]]);
    const vector1 = position1.clone().sub(position2).normalize();
    const vector2 = position3.clone().sub(position2).normalize();
    const angle = (vector1.angleTo(vector2) * 180) / Math.PI;
    // create a line between the two atoms, and display the distance
    const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
    const geometry = new THREE.BufferGeometry().setFromPoints([position1, position2]);
    const line1 = new THREE.LineSegments(geometry, material);
    this.scene.add(line1);
    this.meshes.push(line1);
    const geometry2 = new THREE.BufferGeometry().setFromPoints([position2, position3]);
    const line2 = new THREE.LineSegments(geometry2, material);
    this.scene.add(line2);
    this.meshes.push(line2);
    // add angle to the angle
    const position = position2.add(vector1.add(vector2).multiplyScalar(0.3));
    const label = createLabel(position, angle.toFixed(3), "black", "18px");
    this.scene.add(label);
    this.meshes.push(label);
  }
  showDihedralAngle(indices) {
    const position1 = new THREE.Vector3(...this.viewer.atoms.positions[indices[0]]);
    const position2 = new THREE.Vector3(...this.viewer.atoms.positions[indices[1]]);
    const position3 = new THREE.Vector3(...this.viewer.atoms.positions[indices[2]]);
    const position4 = new THREE.Vector3(...this.viewer.atoms.positions[indices[3]]);
    const vector1 = position1.clone().sub(position2).normalize();
    const vector2 = position3.clone().sub(position2).normalize();
    const vector3 = position4.clone().sub(position3).normalize();
    const normal1 = vector1.clone().cross(vector2).normalize();
    const normal2 = vector2.clone().cross(vector3).normalize();
    const angle = Math.acos(normal1.dot(normal2));
    // create mesh with two planes and display the angle
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    vertices.push(position1.x, position1.y, position1.z);
    vertices.push(position2.x, position2.y, position2.z);
    vertices.push(position3.x, position3.y, position3.z);
    vertices.push(position2.x, position2.y, position2.z);
    vertices.push(position3.x, position3.y, position3.z);
    vertices.push(position4.x, position4.y, position4.z);
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex([0, 1, 2, 3, 4, 5]);
    const material = new THREE.MeshBasicMaterial({
      color: 0x0000ff,
      opacity: 0.9,
      side: THREE.DoubleSide, // Render both sides
      transparent: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);
    this.meshes.push(mesh);
    const position = position2.add(position3).multiplyScalar(0.3).sub(normal1.add(normal2).multiplyScalar(0.3));
    const label = createLabel(position, angle.toFixed(3), "black", "18px");
    this.scene.add(label);
    this.meshes.push(label);
  }
}
