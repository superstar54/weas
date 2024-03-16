import * as THREE from "three";

export function pointsInsideMesh(positions, mesh) {
  /* Return indices of points inside a mesh */
  let raycaster = new THREE.Raycaster();
  // random direction
  let direction = new THREE.Vector3(0.23184, 0.413, 0.879);
  let position;
  const indices = [];
  for (let i = 0; i < positions.length; i++) {
    position = new THREE.Vector3(...positions[i]);
    raycaster.set(position, direction);
    let intersects = raycaster.intersectObject(mesh);
    if (intersects.length % 2 === 1) {
      // Using odd-even rule
      indices.push(i);
    }
  }
  return indices;
}
