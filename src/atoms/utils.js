import * as THREE from "three";

export const generatePhononTrajectory = (atoms, eigenvectors, amplitude, nframes) => {
  const trajectory = [];
  const times = Array.from({ length: nframes }, (_, i) => 2 * Math.PI * (i / nframes));
  times.forEach((t) => {
    const vectors = eigenvectors.map((vec) => vec.map((val) => val * amplitude * Math.sin(t)));
    const newAtoms = atoms.copy();
    for (let i = 0; i < newAtoms.positions.length; i++) {
      newAtoms.positions[i] = newAtoms.positions[i].map((pos, j) => pos + vectors[i][j] / 5);
    }
    newAtoms.newAttribute({ name: "movement", values: vectors });
    trajectory.push(newAtoms);
  });
  return trajectory;
};

// convert color to THREE.Color, the color can be a string or an array
export function convertColor(color) {
  if (Array.isArray(color)) {
    color = new THREE.Color(...color);
  } else {
    color = new THREE.Color(color);
  }
  return color;
}

export function drawAtoms({
  atoms,
  atomScales,
  settings,
  colors,
  materialType = "Standard",
  shapeType = "Sphere",
  data_type = "atom",
  shapeRegistry,
}) {
  // quality dial
  const segmentThresholds = [
    [100_000, 12],
    [10_000, 18],
    [1_000, 24],
    [100, 32],
  ];

  const radiusSegments =
    segmentThresholds
      .slice()
      .reverse()
      .find(([limit]) => atoms.symbols.length <= limit)?.[1] ??
    32;

  // Create prototype shape from the registry
  const baseShape = shapeRegistry.create(shapeType, { materialType, widthSegments: radiusSegments, heightSegments: radiusSegments });

  let geometry, material;
  if (baseShape instanceof THREE.Mesh) {
    geometry = baseShape.geometry.clone();
    material = baseShape.material.clone();
  } else if (baseShape instanceof THREE.Group) {
    const firstMesh = baseShape.children.find((c) => c instanceof THREE.Mesh);
    if (!firstMesh) throw new Error("Shape group has no meshes");
    geometry = firstMesh.geometry.clone();
    material = firstMesh.material.clone();
  } else {
    throw new Error("Unsupported shape type for instancing");
  }

  // Material setup
  material = material.clone();
  // reset color to apply new colors properly
  material.color.set(0xffffff);
  material.transparent = true;
  material.side = THREE.DoubleSide;

  // Create instanced mesh
  const count = atoms.symbols.length;
  const instancedMesh = new THREE.InstancedMesh(geometry, material, count);

  // Allocate instanceColor buffer
  instancedMesh.instanceColor = new THREE.InstancedBufferAttribute(
    new Float32Array(count * 3),
    3,
  );

  const position = new THREE.Vector3();
  const rotation = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  const instanceMatrix = new THREE.Matrix4();
  atoms.symbols.forEach((symbol, i) => {
    // Position
    position.set(...atoms.positions[i]);

    // Scale
    const radius = symbol in settings ? settings[symbol].radius : 1;
    const s = radius * atomScales[i];
    scale.set(s, s, s);

    instanceMatrix.compose(position, rotation, scale);
    instancedMesh.setMatrixAt(i, instanceMatrix);

    // Color
    const c =
      colors[i] instanceof THREE.Color ? colors[i] : new THREE.Color(colors[i]);
    instancedMesh.setColorAt(i, c);
  });

  instancedMesh.instanceMatrix.needsUpdate = true;
  instancedMesh.instanceColor.needsUpdate = true;

  instancedMesh.userData = {
    type: data_type,
    uuid: atoms.uuid,
    objectMode: "edit",
  };

  return instancedMesh;
}
