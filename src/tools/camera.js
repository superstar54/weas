export function setupCameraGUI(tjs, gui, camera) {
  // Create a folder for camera parameters
  const cameraFolder = gui.addFolder("Camera");

  // Temp storage for position to use in onChange callbacks
  const position = { x: camera.position.x, y: camera.position.y, z: camera.position.z };

  // Dropdown for selecting camera type
  const cameraType = { type: camera instanceof THREE.PerspectiveCamera ? "Perspective" : "Orthographic" };
  cameraFolder
    .add(cameraType, "type", ["Perspective", "Orthographic"])
    .name("Camera Type")
    .onChange((newType) => {
      tjs.cameraType = newType;
      tjs.updateCameraAndControls({});
    });

  function updateCameraPosition(x, y, z) {
    camera.position.set(x, y, z);
    position.x = x;
    position.y = y;
    position.z = z;
  }

  // Add GUI controllers for position
  cameraFolder
    .add(position, "x", -100, 100)
    .name("X Position")
    .onChange((newValue) => updateCameraPosition(newValue, position.y, position.z));
  cameraFolder
    .add(position, "y", -100, 100)
    .name("Y Position")
    .onChange((newValue) => updateCameraPosition(position.x, newValue, position.z));
  cameraFolder
    .add(position, "z", -100, 100)
    .name("Z Position")
    .onChange((newValue) => updateCameraPosition(position.x, position.y, newValue));

  function updateCameraType(type) {
    if (type === "Perspective") {
      camera.fov = camera.fov || 50; // Default fov if not set
      camera.updateProjectionMatrix();
    } else if (type === "Orthographic") {
      // Specific adjustments for Orthographic camera can be made here
      // camera.left, camera.right, camera.top, camera.bottom, etc.
      camera.updateProjectionMatrix();
    }
  }
}
