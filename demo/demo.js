import { WEAS, Atoms, Specie, parseXYZ, parseCIF, parseCube, parseXSF } from "../src/index.js"; // Adjust the path as necessary
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

const DEMO_SHIELDING_EIGENVALUES = [
  [430, 382, 315],
  [278, 214, 148],
  [188, 156, 118],
  [188, 156, 118],
  [32.5, 29.0, 24.5],
  [32.5, 29.0, 24.5],
  [32.5, 29.0, 24.5],
  [32.5, 29.0, 24.5],
  [32.5, 29.0, 24.5],
  [32.5, 29.0, 24.5],
];

// These principal axes were generated once from the local S=O, C-S, and C-H directions in demo/datas/c2h6so.xyz.
// Each 3x3 matrix stores the three principal axes in its columns.
const DEMO_SHIELDING_EIGENVECTORS = [
  [
    [0.000011920797992275902, 0.840352680866159, 0.5420400092418955],
    [-0.000005140023100114701, -0.5420400092217575, 0.8403526809479798],
    [0.9999999999157374, -0.000012803772720538078, -0.000002142117261768563],
  ],
  [
    [-0.000011920797992275902, -0.840352680866159, -0.5420400092418955],
    [0.7771639419796572, -0.34111258008333445, 0.5288273962225586],
    [-0.629298186191995, -0.42124764624855815, 0.6530958684492767],
  ],
  [
    [-0.7417439698627648, 0.5763618089319336, -0.34296202177053825],
    [0.6258427178979323, 0.7786504885698446, -0.04499232272367818],
    [0.2411156892994628, -0.2480130679110512, -0.9382711455219079],
  ],
  [
    [0.7417569086077413, 0.5763449241806543, -0.3429624132523603],
    [-0.6258243380553148, 0.7786654327488887, -0.04498935140244705],
    [0.24112359160877223, 0.24800538746805822, 0.9382711449024235],
  ],
  [
    [0.07658405307045604, 0.07994232048551549, -0.9938531622984821],
    [0.8390463361220121, -0.5436574216113086, 0.020924955607389727],
    [-0.5386428581681271, -0.8354913723805502, -0.10871079993329119],
  ],
  [
    [0.8613409543321363, -0.45371029559773207, 0.22855793151589193],
    [-0.5069558693684271, -0.7384224061763104, 0.4446662755029781],
    [-0.03297736956015352, -0.49887805897374027, -0.8660445573822899],
  ],
  [
    [0.032139935338037, 0.9007573546569445, 0.433131865126419],
    [0.8212084762752347, -0.27081891190395974, 0.5022686088626904],
    [0.5697224438708501, 0.33954867837554437, -0.7484136770284515],
  ],
  [
    [-0.861350899444212, -0.4536918947766634, 0.2285569789803147],
    [0.5069396543042697, -0.7384340171194242, 0.44466548016991103],
    [-0.0329668761109482, 0.4988776072092543, 0.8660452171247496],
  ],
  [
    [-0.03212163807856197, 0.9007584140211667, 0.4331310193662218],
    [-0.8212143550138908, -0.2708015337620074, 0.5022683669426772],
    [0.5697150019845618, -0.3395597280040978, 0.7484143288523503],
  ],
  [
    [-0.07658223368545053, 0.079942331689931, -0.9938533015932102],
    [-0.8390578984486379, -0.5436395464688754, 0.02092573931957464],
    [-0.5386251057411847, 0.8355030024596517, 0.10870937561316922],
  ],
];

const domElement = document.getElementById("weas");
const viewerConfig = {
  _modelStyle: 1,
  logLevel: "debug",
  // backgroundColor: "#d3d3d3",
  // atomLabelType: "index", // "element" | "index" | "none"
}; // debug, warn
const guiConfig = {
  controls: {
    enabled: true,
    atomsControl: true,
    colorControl: true, // Disable color control
    cameraControls: true,
  },
  legend: {
    enabled: true,
    position: "bottom-right", // Options: 'top-right', 'top-left', 'bottom-right', 'bottom-left'
  },
  timeline: {
    enabled: true, // Added this line to control timeline visibility
  },
  buttons: {
    enabled: true,
    // New section for button visibility
    fullscreen: true,
    undo: true,
    redo: true,
    export: true,
    import: true,
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
      // editor.avr.bondManager.settings[1].color1 = "blue";
      // editor.avr.VFManager.addSetting({ origins: "positions", vectors: "movement", color: "#ff0000", radius: 0.1 });
      // editor.avr.colorType = "CPK";
      editor.avr.modelStyle = 1;
      editor.instancedMeshPrimitive.setSettings([]); // Clear mesh primitives
      editor.avr.atoms = atomsList;
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
      editor.instancedMeshPrimitive.setSettings([]); // Clear mesh primitives
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
    case "highlight":
      editor.clear();
      filename = "au.cif";
      structureData = fileContent || (await fetchFile(filename));
      atoms = parseCIF(structureData);
      atoms = atoms.multiply(6, 6, 6);
      editor.avr.atoms = atoms;
      editor.avr.modelStyle = 1;
      const p0 = atoms.positions[0];
      const p1 = atoms.positions[1];
      const p2 = atoms.positions[2];
      const ontop = [p0[0], p0[1], p0[2] + 1.8];
      const bridge = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, (p0[2] + p1[2]) / 2 + 1.8];
      const hollow = [(p0[0] + p1[0] + p2[0]) / 3, (p0[1] + p1[1] + p2[1]) / 3, (p0[2] + p1[2] + p2[2]) / 3 + 1.8];
      const highlightSettings = editor.avr.state.get("plugins.highlight")?.settings || {};
      highlightSettings.crossView = { indices: Array.from({ length: 100 }, (_, i) => i), type: "crossView", color: "#111111", scale: 1.0 };
      highlightSettings.cross = { indices: [2, 3], type: "cross", color: "#111111", scale: 1.0 };
      highlightSettings.box = { indices: [4, 5], type: "box", color: "#111111", scale: 1.0, opacity: 0.3 };
      editor.avr.highlightManager.setSettings(highlightSettings);
      editor.textManager.setSettings([
        {
          positions: [ontop, bridge, hollow],
          texts: "+",
          color: "#111111",
          fontSize: "18px",
          className: "text-label text-label-cross",
          renderMode: "shape",
        },
      ]);
      editor.avr.tjs.updateCameraAndControls({ direction: [0, 0, 30] });
      break;
    case "text-labels":
      editor.clear();
      filename = "au.cif";
      structureData = fileContent || (await fetchFile(filename));
      atoms = parseCIF(structureData);
      atoms = atoms.multiply(2, 2, 2);
      editor.avr.atoms = atoms;
      editor.avr.modelStyle = 1;
      editor.avr.atomLabelType = "index";
      if (atoms.positions.length >= 3) {
        const p0 = atoms.positions[0];
        const p1 = atoms.positions[1];
        const p2 = atoms.positions[2];
        const ontop = [p0[0], p0[1], p0[2] + 1.8];
        const bridge = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, (p0[2] + p1[2]) / 2 + 1.8];
        const hollow = [(p0[0] + p1[0] + p2[0]) / 3, (p0[1] + p1[1] + p2[1]) / 3, (p0[2] + p1[2] + p2[2]) / 3 + 1.8];
        editor.textManager.setSettings([
          {
            positions: [ontop],
            texts: "here!",
            color: "#ff0000",
            fontSize: "24px",
            className: "text-label text-label-dot",
          },
          {
            positions: [bridge, hollow],
            texts: "+",
            color: "#111111",
            fontSize: "18px",
            className: "text-label text-label-cross",
          },
        ]);
      }
      editor.avr.tjs.updateCameraAndControls({ direction: [0, 0, 30] });
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
      editor.instancedMeshPrimitive.setSettings([]); // Clear mesh primitives
      editor.avr.modelStyle = 2;
      break;
    case "GaAs.xsf":
      editor.clear();
      structureData = fileContent || (await fetchFile(filename));
      let xsfData = parseXSF(structureData);
      editor.avr.atoms = xsfData.atoms;
      editor.avr.volumetricData = xsfData.volumetricData;
      editor.avr.isosurfaceManager.setSettings({
        positive: { isovalue: 0.15, mode: 1, step_size: 1 },
        negative: { isovalue: -0.15, color: "#ff0000", mode: 1 },
      });
      // editor.avr.showBondedAtoms = true;
      editor.avr.colorType = "VESTA";
      editor.avr.modelStyle = 1;
      editor.avr.boundary = [
        [-0.05, 1.05],
        [-0.05, 1.05],
        [-0.05, 1.05],
      ];
      editor.avr.drawModels();
      break;
    case "h2o-homo.cube":
      editor.clear();
      structureData = fileContent || (await fetchFile(filename));
      let cubeData = parseCube(structureData);
      editor.avr.atoms = cubeData.atoms;
      editor.avr.volumetricData = cubeData.volumetricData;
      editor.avr.isosurfaceManager.setSettings({
        positive: { isovalue: 0.00002, mode: 1, step_size: 1 },
        negative: { isovalue: -0.00002, color: "#ff0000", mode: 1 },
      });
      editor.avr.isosurfaceManager.drawIsosurfaces();
      editor.instancedMeshPrimitive.setSettings([]); // Clear mesh primitives
      break;
    case "2d-slice":
      editor.clear();

      structureData = fileContent || (await fetchFile("h2o-homo.cube"));
      let cubeData1 = parseCube(structureData);
      editor.avr.atoms = cubeData1.atoms;
      editor.avr.volumetricData = cubeData1.volumetricData;
      // editor.avr.volumeSliceManager.addSetting(0.0002);
      editor.avr.volumeSliceManager.addSetting("Slice 1", { h: 0, k: 1, l: 0, distance: 5.5, colorMap: "viridis", opacity: 0.8, samplingDistance: 0.1 });
      editor.avr.volumeSliceManager.addSetting("Slice 2", { method: "bestFit", selectedAtomIndices: [0, 1, 2], colorMap: "viridis", opacity: 0.8, samplingDistance: 0.1 });
      editor.avr.volumeSliceManager.drawSlices();
      editor.avr.tjs.updateCameraAndControls({ direction: [0.5, 1, 2] });
      editor.instancedMeshPrimitive.setSettings([]); // Clear mesh primitives
      break;
    case "deca_ala_md.xyz":
      editor.clear();
      structureData = fileContent || (await fetchFile(filename));
      const trajectory = parseXYZ(structureData);
      // atomsList[0].newAttribute("moment", [1, 1, 1, 1, 1, -1, -1, -1, -1, -1], "atom");
      // atomsList[0].newAttribute("charge", [-1, 0.5, 1, 0.5, 0.3, 0.2, 2, 1, 0, -0.5], "atom");
      editor.avr.atoms = trajectory;
      // editor.avr.bondManager.settings[1].color1 = "blue";
      // editor.avr.VFManager.addSetting({ origins: "positions", vectors: "movement", color: "#ff0000", radius: 0.1 });
      editor.avr.modelStyle = 1;
      editor.instancedMeshPrimitive.setSettings([]); // Clear mesh primitives
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
        factor: 1,
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
      editor.instancedMeshPrimitive.setSettings(data);
      break;
    case "any_mesh_settings.json":
      structureData = fileContent || (await fetchFile(filename));
      var data = JSON.parse(structureData);
      // draw mesh primitives
      editor.clear();
      editor.avr.guiManager.removeTimeline();
      editor.anyMesh.setSettings(data);
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
      editor.avr.guiManager.updateLegend();
      editor.avr.bondManager.init();
      editor.avr.drawModels();
      break;
    case "tensor-ellipsoid": {
      editor.clear();
      filename = "c2h6so.xyz";
      structureData = fileContent || (await fetchFile(filename));
      const teAtoms = parseXYZ(structureData);
      editor.avr.atoms = teAtoms;
      editor.avr.modelStyle = 1;

      editor.avr.tensorEllipsoidManager.setSettings({
        "magnetic shielding (illustrative)": {
          origins: "positions",
          eigenvalues: DEMO_SHIELDING_EIGENVALUES,
          eigenvectors: DEMO_SHIELDING_EIGENVECTORS,
          // Normalize within this tensor set so scale controls the largest ellipsoid radius.
          scaleMode: "setNormalized",
          scale: 1.2,
          color: "#ff6b35",
          opacity: 0.45,
          resolution: 32,
          renderMode: "solid",
          showPrincipalAxes: true,
          principalAxisLength: 1.2,
          principalAxisRadius: 0.02,
        },
      });

      editor.avr.tensorEllipsoidManager.drawTensorEllipsoids();
      editor.avr.tjs.updateCameraAndControls({ direction: [0, 1, 0] });
      editor.avr.drawModels();
      break;
    }
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
    editor.instancedMeshPrimitive.setSettings([]); // Clear mesh primitives
    editor.avr.modelStyle = 2;
    editor.avr.atoms = atoms;
  } else if (filename.endsWith(".cube")) {
    editor.clear();
    const cubeData = parseCube(fileContent);
    editor.avr.atoms = cubeData.atoms;
    editor.avr.isosurfaceManager.volumetricData = cubeData.volumetricData;
    editor.avr.isosurfaceManager.setSettings([{ isovalue: 0.0002, mode: 1, step_size: 1 }]);
  }
}

updateAtoms("molecule");
// updateAtoms("catio3.cif");
// updateAtoms("au.cif");
// updateAtoms("c2h6so.xyz");
// updateAtoms("h2o-homo.cube");
// updateAtoms("phonon")
