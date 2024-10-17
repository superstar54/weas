import * as THREE from "three";
import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry.js";
import { elementColors, elementsWithPolyhedra } from "../atoms_data.js";
import { clearObject, calculateCartesianCoordinates } from "../../utils.js";
import { materials } from "../../tools/materials.js";
import { convertColor } from "../utils.js";

const defaultColor = 0xffffff;

class Setting {
  constructor({ species, color = "#3d82ed", show_edge = false }) {
    this.species = species;
    this.color = convertColor(color);
    this.show_edge = show_edge;
  }

  toDict() {
    return {
      species: this.species,
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
    this.meshes = new THREE.Group();
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
    const symbols = atoms.symbols;
    const speciesSet = new Set(symbols);
    const speciesList = Array.from(speciesSet);
    for (let i = 0; i < speciesList.length; i++) {
      if (!elementsWithPolyhedra.includes(speciesList[i])) {
        continue;
      }
      const species = speciesList[i];
      const color = elementColors[this.viewer.colorType][species];
      const setting = new Setting({ species, color });
      this.settings.push(setting);
    }
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
  addSetting({ species, color = "#3d82ed", show_edge = false }) {
    /* Add a new setting to the polyhedra */
    const setting = new Setting({ species, color, show_edge });
    this.settings.push(setting);
  }

  buildPolyhedraDict() {
    /* Build a dictionary of cutoffs */
    const cutoffDict = {};
    this.settings.forEach((setting) => {
      cutoffDict[setting.species] = setting.toDict();
    });
    return cutoffDict;
  }

  clearMeshes() {
    /* Remove highlighted atom meshes from the selectedAtomsMesh group */
    clearObject(this.scene, this.meshes);
  }

  drawPolyhedras() {
    this.clearMeshes();
    const polyhedras = filterBondMap(this.viewer.bondManager.bondMap["bondMapWithOffset"], this.viewer.atoms.symbols, elementsWithPolyhedra, this.viewer.modelPolyhedras);
    this.viewer.logger.debug("polyhedras: ", polyhedras);
    const meshes = drawPolyhedras(this.viewer.atoms, polyhedras, this.viewer.bondManager.bondList, this.viewer._colorType, this.viewer._materialType);
    meshes.forEach((mesh) => {
      this.meshes.add(mesh);
    });
    return this.meshes;
  }

  updatePolyhedraMesh(atomIndex = null, atoms = null) {
    /* When the atom is moved, the bonds should be moved as well.
    if atomIndex is null, update all bonds
    if atoms is null, use this.atoms, otherwise use the provided atoms to update the bonds, e.g. trajectory data
    */
    // console.log("updateBondsMesh: ", atomIndex);
  }
}

export function drawPolyhedras(atoms, polyhedras, bondList, colorType = "CPK", materialType = "standard") {
  /*
    Draw polyhedra using the ConvexGeometry class from three.js
  */
  // console.log("bondList: ", bondList);
  // console.log("polyhedras: ", polyhedras);
  const meshes = [];
  for (const key of Object.keys(polyhedras)) {
    const polyhedra = polyhedras[key];
    const vertices = [];
    let new_position;
    // console.log("key: ", key);
    // console.log("polyhedra: ", polyhedra);
    // Assuming bonds.length is the number of vertices
    for (const bondData of polyhedra.bonds) {
      const bond = bondList[bondData[0]];
      // if isStart is true, then the second atom is neighbor
      if (bondData[1]) {
        var position = atoms.positions[bond[1]];
        var offset = bond[3];
      } else {
        var position = atoms.positions[bond[0]];
        var offset = bond[2];
      }
      new_position = position.map((value, index) => value + calculateCartesianCoordinates(atoms.cell, offset)[index]);
      const vertex = new THREE.Vector3(...new_position);
      vertices.push(vertex);
    }
    // console.log("vertices: ", vertices);

    // Skip the polyhedron if vertices are not sufficient for ConvexGeometry
    if (vertices.length < 4) {
      console.warn(`Skipping polyhedron with key "${key}" due to insufficient vertices.`);
      continue;
    }

    let geometry;
    try {
      geometry = new ConvexGeometry(vertices);
    } catch (error) {
      console.warn(`Skipping polyhedron with key "${key}" due to ConvexGeometry error:`, error);
      continue;
    }
    // Set up color and material for the polyhedron
    const symbol = atoms.symbols[polyhedra.atomIndex];
    const color = elementColors[colorType][symbol] || defaultColor;

    const material = materials[materialType].clone();
    material.color = new THREE.Color(color);
    material.transparent = true; // Enable transparency
    material.opacity = 0.8; // Set the opacity value (0.0 to 1.0, where 0.0 is fully transparent and 1.0 is fully opaque)

    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData.type = "polyhedra";
    mesh.userData.symbol = symbol;
    mesh.userData.uuid = atoms.uuid;
    mesh.userData.objectMode = "edit";
    mesh.userData.notSelectable = true;
    mesh.layers.set(1);

    meshes.push(mesh);
  }
  return meshes;
}

export function filterBondMap(bondMap, symbols, elements, modelPolyhedras) {
  /*
    loop through bondMap and filter out only those atoms that have
    four or more bonds and whose species (retrieved from atoms.symbols[atomIndex])
    are in a specified list of elements (elements)
    */
  const filteredMap = {};
  // console.log("bondMap: ", bondMap);

  Object.keys(bondMap).forEach((key) => {
    const atomIndex = bondMap[key]["atomIndex"];
    const numBond = bondMap[key]["bonds"].length;
    const speciesName = symbols[atomIndex];

    if (modelPolyhedras[atomIndex] && numBond >= 4 && elements.includes(speciesName)) {
      filteredMap[key] = bondMap[key];
    }
  });

  return filteredMap;
}
