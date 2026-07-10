import * as THREE from "three";

const _rayDirections = [
  new THREE.Vector3(0.23184, 0.413, 0.879),
  new THREE.Vector3(-0.754, 0.285, -0.592),
  new THREE.Vector3(0.124, -0.812, 0.570),
];

/* Return indices of points inside a mesh */
export function pointsInsideMesh(positions, mesh) {
  const raycaster = new THREE.Raycaster();
  const indices = [];
  for (let i = 0; i < positions.length; i++) {
    const pos = new THREE.Vector3(...positions[i]);
    let insideCount = 0;
    for (const dir of _rayDirections) {
      raycaster.set(pos, dir);
      const intersects = raycaster.intersectObject(mesh);
      if (intersects.length % 2 === 1) {
        insideCount++;
      }
    }
    // majority vote across 3 non-coplanar directions
    if (insideCount >= 2) {
      indices.push(i);
    }
  }
  return indices;
}
