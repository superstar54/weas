import * as THREE from "three";
import { ConvexHull } from "three/examples/jsm/math/ConvexHull.js";
import { elementColors, elementsWithPolyhedra } from "../atoms_data.js";
import { clearObject, calculateCartesianCoordinates } from "../../utils.js";
import { materials } from "../../tools/materials.js";
import { convertColor } from "../utils.js";

const defaultColor = 0xffffff;

class Setting {
  constructor({ symbol, color = "#3d82ed", show_edge = false }) {
    this.symbol = symbol;
    this.color = convertColor(color);
    this.show_edge = show_edge;
  }

  toDict() {
    return {
      symbol: this.symbol,
      color: this.color,
      show_edge: this.show_edge,
    };
  }
}

export class PolyhedraManager {
  constructor(viewer) {
    this.viewer = viewer;
    this.scene = this.viewer.tjs.scene;
    this.settings = [];
    // create a group to store the polyhedra meshes
    this.mesh = null;
    this.allVertices = [];
    this.allNormals = [];
    this.allColors = [];
    this.init();
  }

  init() {
    /* Initialize the polyhedra settings from the viewer.atoms
    The default max is the sum of two radius of the species.
    The default color is from the elementColors.
    */
    this.viewer.logger.debug("init PolyhedraManager");
    this.settings = [];
    const atoms = this.viewer.atoms;
    Object.entries(this.viewer.originalAtoms.species).forEach(([symbol, specie]) => {
      if (!elementsWithPolyhedra.includes(specie.element)) {
        return;
      }
      const color = elementColors[this.viewer.colorType][specie.element];
      const setting = new Setting({ symbol, color });
      this.settings.push(setting);
    });
  }

  fromSettings(settings) {
    /* Set the polyhedra settings */
    this.settings = [];
    this.clearMeshes();
    // loop over settings to add each setting
    settings.forEach((setting) => {
      this.addSetting(setting);
    });
  }

  // Modify addSetting to accept a single object parameter
  addSetting({ symbol, color = "#3d82ed", show_edge = false }) {
    /* Add a new setting to the polyhedra */
    const setting = new Setting({ symbol, color, show_edge });
    this.settings.push(setting);
  }

  buildPolyhedraDict() {
    /* Build a dictionary of cutoffs */
    const cutoffDict = {};
    this.settings.forEach((setting) => {
      cutoffDict[setting.symbol] = setting.toDict();
    });
    return cutoffDict;
  }

  clearMeshes() {
    /* Remove highlighted atom meshes from the selectedAtomsMesh group */
    this.allVertices = [];
    this.allNormals = [];
    this.allColors = [];
    clearObject(this.scene, this.mesh);
  }

  drawPolyhedras() {
    this.clearMeshes();
    const polyhedras = filterBondMap(this.viewer.bondManager.bondMap["bondMapWithOffset"], this.viewer.atoms.symbols, elementsWithPolyhedra, this.viewer.modelPolyhedras);
    this.viewer.logger.debug("polyhedras: ", polyhedras);
    this.buildPolyhedras(this.viewer.atoms, polyhedras, this.viewer.bondManager.bondList, this.viewer._colorType, this.viewer._materialType);
    const mesh = this.drawPolyhedraMesh(this.viewer.atoms, this.viewer._materialType);
    this.mesh = mesh;
    return mesh;
  }

  buildPolyhedras(atoms, polyhedras, bondList, colorType = "CPK", materialType = "standard") {
    /*
      Draw polyhedra using the ConvexGeometry class from three.js
    */
    const allVertices = [];
    const allNormals = [];
    const allColors = [];
    const vertexAtomMap = {};
    for (const key of Object.keys(polyhedras)) {
      const polyhedra = polyhedras[key];
      const verticesData = [];
      let new_position;
      // Assuming bonds.length is the number of verticesData
      for (const bondData of polyhedra.sticks) {
        const bond = bondList[bondData[0]];
        // if isStart is true, then the second atom is neighbor
        if (bondData[1]) {
          var atomIndex2 = bond[1];
          var offset2 = bond[3];
        } else {
          var atomIndex2 = bond[0];
          var offset2 = bond[2];
        }
        new_position = atoms.positions[atomIndex2].map((value, index) => value + calculateCartesianCoordinates(atoms.cell, offset2)[index]);
        const vertex = new THREE.Vector3(...new_position);
        // record the atomIndex2 and offset2 for each vertex
        vertex.atomIndex = atomIndex2;
        vertex.offset = offset2;
        verticesData.push(vertex);
      }

      // Skip the polyhedron if vertices are not sufficient for ConvexGeometry
      if (verticesData.length < 4) {
        console.warn(`Skipping polyhedron with key "${key}" due to insufficient vertices.`);
        continue;
      }

      try {
        // find convex hull
        const { hull, vertices, normals, indices, offsets } = calculateConvexHull(verticesData);
        allVertices.push(...vertices);
        allNormals.push(...normals);
        const symbol = atoms.symbols[polyhedra.atomIndex];
        const color = elementColors[colorType][symbol] || defaultColor;
        const faceColor = new THREE.Color(color);
        for (let i = 0; i < vertices.length / 3; i++) {
          allColors.push(faceColor.r, faceColor.g, faceColor.b);
        }
        // build the vertexAtomMap
        indices.forEach((vertex, index) => {
          const atomIndex = indices[index];
          const offset = offsets[index];
          if (vertexAtomMap[atomIndex] === undefined) {
            vertexAtomMap[atomIndex] = [];
          }
          vertexAtomMap[atomIndex].push([allVertices.length / 3 - vertices.length / 3 + index, offset]);
        });
      } catch (error) {
        console.warn(`Skipping polyhedron with key "${key}" due to ConvexGeometry error:`, error);
        continue;
      }
    }
    this.allVertices = allVertices;
    this.allNormals = allNormals;
    this.allColors = allColors;
    this.vertexAtomMap = vertexAtomMap;
  }

  drawPolyhedraMesh(atoms, materialType = "standard") {
    const material = materials[materialType].clone();
    material.transparent = true;
    material.opacity = 0.8;
    material.vertexColors = true; // Ensure vertex colors are applied
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(this.allVertices, 3));
    geometry.setAttribute("normal", new THREE.Float32BufferAttribute(this.allNormals, 3));
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(this.allColors, 3)); // Correct color assignment
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData.type = "polyhedra";
    mesh.userData.uuid = atoms.uuid;
    mesh.userData.objectMode = "edit";
    mesh.userData.notSelectable = true;
    mesh.layers.set(1);

    return mesh;
  }

  updatePolyhedraMesh(atomIndex = null, atoms = null) {
    /* When the atom is moved, the polyhedra mesh needs to be updated.
    if atomIndex is null, update all polyhedras
    if atoms is null, use this.atoms, otherwise use the provided atoms to update the bonds, e.g. trajectory data
    */
    var atomIndices = [];
    if (atomIndex === null) {
      atomIndices = Object.keys(this.vertexAtomMap);
    } else {
      atomIndices = [atomIndex];
    }
    if (atoms === null) {
      atoms = this.viewer.atoms;
    }
    atomIndices.forEach((atomIndex) => {
      const verticesData = this.vertexAtomMap[atomIndex];
      if (verticesData === undefined) {
        return;
      }
      verticesData.forEach(([vertexIndex, offset]) => {
        const new_position = atoms.positions[atomIndex].map((value, index) => value + calculateCartesianCoordinates(atoms.cell, offset)[index]);
        this.allVertices[vertexIndex * 3] = new_position[0];
        this.allVertices[vertexIndex * 3 + 1] = new_position[1];
        this.allVertices[vertexIndex * 3 + 2] = new_position[2];
      });
    });
    // update the geometry of the mesh
    this.mesh.geometry.setAttribute("position", new THREE.Float32BufferAttribute(this.allVertices, 3));
    this.mesh.geometry.attributes.position.needsUpdate = true;
    this.mesh.geometry.computeVertexNormals();
  }
}

export function filterBondMap(bondMap, symbols, elements, modelPolyhedras) {
  /*
    loop through bondMap and filter out only those atoms that have
    four or more bonds and whose specie (retrieved from atoms.symbols[atomIndex])
    are in a specified list of elements (elements)
    */
  const filteredMap = {};

  Object.keys(bondMap).forEach((key) => {
    const atomIndex = bondMap[key]["atomIndex"];
    const numBond = bondMap[key]["sticks"].length;
    const specieName = symbols[atomIndex];

    if (modelPolyhedras[atomIndex] && numBond >= 4 && elements.includes(specieName)) {
      filteredMap[key] = bondMap[key];
    }
  });

  return filteredMap;
}

export function calculateConvexHull(points) {
  var faces = [];
  var vertices = [];
  var normals = [];
  var indices = [];
  var offsets = [];
  // generate vertices and normals
  var hull = new ConvexHull().setFromPoints(points);

  var faces = hull.faces;

  for (var i = 0; i < faces.length; i++) {
    var face = faces[i];
    var edge = face.edge;

    // we move along a doubly-connected edge list to access all face points (see HalfEdge docs)

    do {
      var point = edge.head().point;

      vertices.push(point.x, point.y, point.z);
      indices.push(point.atomIndex);
      offsets.push(point.offset);
      normals.push(face.normal.x, face.normal.y, face.normal.z);

      edge = edge.next;
    } while (edge !== face.edge);
  }
  return { hull, vertices, normals, indices, offsets };
}
