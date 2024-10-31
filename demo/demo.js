import { WEAS, Atoms, Specie, parseXYZ, parseCIF, parseCube } from "../src/index.js"; // Adjust the path as necessary
import * as THREE from "three";

window.THREE = THREE;
window.WEAS = WEAS;
window.Atoms = Atoms;
window.Specie = Specie;

async function fetchFile(filename) {
  const response = await fetch(`datas/${filename}`);
  if (!response.ok) {
    throw new Error(`Failed to load file for structure: ${filename}`);
  }
  return await response.text();
}

const domElement = document.getElementById("weas");
const viewerConfig = { _modelStyle: 1, logLevel: "debug" }; // debug, warn
const guiConfig = {
  controls: {
    enabled: true,
    atomsControl: true,
    colorControl: true, // Disable color control
    cameraControls: true,
  },
  buttons: {
    enabled: true,
    // New section for button visibility
    fullscreen: true,
    undo: true,
    redo: true,
    download: true,
    measurement: true,
  },
};
const editor = new WEAS({ domElement, viewerConfig, guiConfig });
window.editor = editor;
document.getElementById("structure-selector").addEventListener("change", async (event) => {
  const filename = event.target.value;
  // console.log("filename: ", filename);
  await updateAtoms(filename);
});

document.getElementById("file-upload").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (file) {
    const filename = file.name;
    console.log("Uploaded file: ", filename);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const fileContent = e.target.result;
      await drawAtoms(filename, fileContent);
    };
    reader.readAsText(file);
  }
});

async function updateAtoms(filename, fileContent = null) {
  console.log(filename);
  // console.log("structureData: ", structureData);
  let atoms;
  let structureData;
  switch (filename) {
    case "molecule":
      editor.clear();
      filename = "c2h6so.xyz";
      structureData = fileContent || (await fetchFile(filename));
      const atomsList = parseXYZ(structureData);
      console.log("atomsList: ", atomsList);
      // atomsList[0].newAttribute("moment", [1, 1, 1, 1, 1, -1, -1, -1, -1, -1], "atom");
      // atomsList[0].newAttribute("charge", [-1, 0.5, 1, 0.5, 0.3, 0.2, 2, 1, 0, -0.5], "atom");
      // atomsList[0].newAttribute("color", { C: "##eb4034", H: "#b434eb", O: "#34eb77", S: "#FFFF00" }, "specie");
      // atomsList[0].newAttribute("radii", { C: 1.5, H: 1.0, O: 1.5, S: 1.5 }, "specie");
      editor.avr.atoms = atomsList;
      // editor.avr.bondManager.settings[1].color1 = "blue";
      // editor.avr.VFManager.addSetting({ origins: "positions", vectors: "movement", color: "#ff0000", radius: 0.1 });
      // editor.avr.colorType = "CPK";
      editor.avr.modelStyle = 1;
      editor.instancedMeshPrimitive.fromSettings([]); // Clear mesh primitives
      break;
    case "urea.cif":
      editor.clear();
      structureData = fileContent || (await fetchFile(filename));
      atoms = parseCIF(structureData);
      editor.avr.atoms = atoms;
      editor.avr.showBondedAtoms = true;
      editor.avr.modelStyle = 1;
      editor.avr.boundary = [
        [-0.01, 1.01],
        [-0.01, 1.01],
        [-0.01, 1.01],
      ];
      editor.avr.bondManager.showHydrogenBonds = true;
      editor.instancedMeshPrimitive.fromSettings([]); // Clear mesh primitives
      editor.avr.drawModels();
      break;
    case "au.cif":
      editor.clear();
      structureData = fileContent || (await fetchFile(filename));
      atoms = parseCIF(structureData);
      atoms = atoms.multiply(8, 8, 8);
      editor.avr.modelStyle = 0;
      editor.avr.atoms = atoms;
      editor.ops.mesh.AddSphereOperation({ position: [15, 15, 10], scale: [8, 8, 8], color: "#bd0d87", opacity: 0.5 });
      // select the last object in the scene
      editor.selectionManager.selectedObjects = [editor.tjs.scene.children[editor.tjs.scene.children.length - 1]];
      // select atoms inside the sphere
      // editor.ops.selection.InsideSelection();
      editor.ops.hideGUI();
      break;
    case "catio3.cif":
      editor.clear();
      structureData = fileContent || (await fetchFile(filename));
      atoms = parseCIF(structureData);
      // atoms = atoms.multiply(1, 1, 1);
      editor.avr.atoms = atoms;
      editor.avr.showBondedAtoms = true;
      editor.avr.colorType = "VESTA";
      editor.avr.boundary = [
        [-0.01, 1.01],
        [-0.01, 1.01],
        [-0.01, 1.01],
      ];
      editor.instancedMeshPrimitive.fromSettings([]); // Clear mesh primitives
      editor.avr.modelStyle = 2;
      break;
    case "CoO.cif":
      editor.clear();
      structureData = fileContent || (await fetchFile(filename));
      atoms = parseCIF(structureData);
      // atoms = atoms.multiply(1, 1, 1);
      editor.avr.atoms = atoms;
      editor.avr.showBondedAtoms = true;
      editor.avr.colorType = "VESTA";
      editor.avr.boundary = [
        [-0.01, 1.01],
        [-0.01, 1.01],
        [-0.01, 1.01],
      ];
      editor.instancedMeshPrimitive.fromSettings([]); // Clear mesh primitives
      editor.avr.modelStyle = 2;
      break;
    case "h2o-homo.cube":
      editor.clear();
      structureData = fileContent || (await fetchFile(filename));
      let cubeData = parseCube(structureData);
      editor.avr.atoms = cubeData.atoms;
      editor.avr.isosurfaceManager.volumetricData = cubeData.volumetricData;
      // editor.avr.isosurfaceManager.addSetting(0.0002);
      editor.avr.isosurfaceManager.fromSettings({
        positive: { isovalue: 0.0002, mode: 1, step_size: 1 },
        negative: { isovalue: -0.0002, color: "#ff0000", mode: 1 },
      });
      editor.avr.isosurfaceManager.drawIsosurfaces();
      editor.instancedMeshPrimitive.fromSettings([]); // Clear mesh primitives
      break;
    case "deca_ala_md.xyz":
      editor.clear();
      structureData = fileContent || (await fetchFile(filename));
      const trajectory = parseXYZ(structureData);
      // atomsList[0].newAttribute("moment", [1, 1, 1, 1, 1, -1, -1, -1, -1, -1], "atom");
      // atomsList[0].newAttribute("charge", [-1, 0.5, 1, 0.5, 0.3, 0.2, 2, 1, 0, -0.5], "atom");
      editor.avr.atoms = trajectory;
      console.log("bond settings: ", editor.avr.bondManager.settings);
      console.log("polyhedra settings: ", editor.avr.polyhedraManager.settings);
      // editor.avr.bondManager.settings[1].color1 = "blue";
      // editor.avr.VFManager.addSetting({ origins: "positions", vectors: "movement", color: "#ff0000", radius: 0.1 });
      editor.avr.modelStyle = 1;
      editor.instancedMeshPrimitive.fromSettings([]); // Clear mesh primitives
      break;
    case "phonon":
      editor.clear();
      filename = "graphene.cif";
      structureData = fileContent || (await fetchFile(filename));
      atoms = parseCIF(structureData);
      const eigenvectors = [
        [
          [-0.31, 0.47],
          [-0.16, -0.38],
          [0, 0],
        ],
        [
          [0.54, -0.15],
          [-0.31, -0.27],
          [0, 0],
        ],
      ];
      const kpoint = [0.31, 0.31, 0];
      editor.avr.fromPhononMode({
        atoms: atoms,
        eigenvectors: eigenvectors,
        amplitude: 2,
        nframes: 50,
        kpoint: kpoint,
        // repeat: [1, 1, 1],
        repeat: [4, 4, 1],
        color: "#ff0000",
        radius: 0.1,
      });

      // control the speed of the animation
      editor.avr.boundary = [
        [-0.01, 1.01],
        [-0.01, 1.01],
        [-0.01, 1.01],
      ];
      editor.avr.frameDuration = 50;
      editor.avr.showBondedAtoms = false;
      editor.avr.modelStyle = 1;
      break;
    case "Primitives":
      editor.clear();
      editor.ops.mesh.AddSphereOperation({ position: [-5, 0, 0], scale: [1, 1, 1], color: "#00FF00", opacity: 0.5 });
      editor.ops.mesh.AddCylinderOperation({ position: [0, 0, 0], scale: [1, 1, 1], color: "#bd0d87", opacity: 0.5 });
      editor.ops.mesh.AddCubeOperation({ position: [5, 0, 0], scale: [1, 1, 1], color: "#0000FF", opacity: 0.5 });
      editor.ops.hideGUI();
      break;
    case "mesh_primitives_settings.json":
      structureData = fileContent || (await fetchFile(filename));
      var data = JSON.parse(structureData);
      // draw mesh primitives
      editor.clear();
      editor.avr.guiManager.removeTimeline();
      editor.instancedMeshPrimitive.fromSettings(data);
      editor.instancedMeshPrimitive.drawMesh();
      break;
    case "any_mesh_settings.json":
      structureData = fileContent || (await fetchFile(filename));
      var data = JSON.parse(structureData);
      // draw mesh primitives
      editor.clear();
      editor.avr.guiManager.removeTimeline();
      editor.anyMesh.fromSettings(data);
      editor.anyMesh.drawMesh();
      break;
    case "species":
      editor.clear();
      filename = "c2h6so.xyz";
      structureData = fileContent || (await fetchFile(filename));
      atoms = parseXYZ(structureData);
      atoms[0].addSpecie("C1", "C");
      atoms[0].symbols[3] = "C1";
      editor.avr.atoms = atoms;
      // editor.avr.bondManager.settings[1].color1 = "blue";
      // editor.avr.VFManager.addSetting({ origins: "positions", vectors: "movement", color: "#ff0000", radius: 0.1 });
      // editor.avr.colorType = "CPK";
      editor.avr.modelStyle = 1;
      editor.avr.atomManager.settings["C1"].color = "blue";
      editor.avr.atomManager.settings["C1"].radius = 1.5;
      editor.avr.bondManager.init();
      editor.instancedMeshPrimitive.fromSettings([]); // Clear mesh primitives
      editor.avr.drawModels();
      break;
  }
}

async function drawAtoms(filename, fileContent) {
  if (filename.endsWith(".xyz")) {
    editor.clear();
    const atomsList = parseXYZ(fileContent);
    editor.avr.atoms = atomsList;
    editor.avr.modelStyle = 1;
  } else if (filename.endsWith(".cif")) {
    editor.clear();
    const atoms = parseCIF(fileContent);
    editor.avr.showBondedAtoms = true;
    editor.avr.colorType = "VESTA";
    editor.avr.boundary = [
      [-0.01, 1.01],
      [-0.01, 1.01],
      [-0.01, 1.01],
    ];
    editor.instancedMeshPrimitive.fromSettings([]); // Clear mesh primitives
    editor.avr.modelStyle = 2;
    editor.avr.atoms = atoms;
  } else if (filename.endsWith(".cube")) {
    editor.clear();
    const cubeData = parseCube(fileContent);
    editor.avr.atoms = cubeData.atoms;
    editor.avr.isosurfaceManager.volumetricData = cubeData.volumetricData;
    editor.avr.isosurfaceManager.fromSettings([{ isovalue: 0.0002, mode: 1, step_size: 1 }]);
    editor.avr.isosurfaceManager.drawIsosurfaces();
  }
}

updateAtoms("molecule");
// updateAtoms("catio3.cif");
// updateAtoms("au.cif");
// updateAtoms("c2h6so.xyz");
// updateAtoms("h2o-homo.cube");
// updateAtoms("phonon")
