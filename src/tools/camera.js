export function setupCameraGUI(gui, camera) {
  // Create a folder for camera parameters
  const cameraFolder = gui.addFolder("Camera");

  // Temp storage for position to use in onChange callbacks
  const position = { x: camera.position.x, y: camera.position.y, z: camera.position.z };

  cameraFolder
    .add(position, "x", -100, 100)
    .name("X Position")
    .onChange((newValue) => {
      camera.updatePosition(newValue, position.y, position.z);
      // Update the temp storage to ensure consistency
      position.x = newValue;
    });
  cameraFolder
    .add(position, "y", -100, 100)
    .name("Y Position")
    .onChange((newValue) => {
      camera.updatePosition(position.x, newValue, position.z);
      // Update the temp storage to ensure consistency
      position.y = newValue;
    });
  cameraFolder
    .add(position, "z", -100, 100)
    .name("Z Position")
    .onChange((newValue) => {
      camera.updatePosition(position.x, position.y, newValue);
      // Update the temp storage to ensure consistency
      position.z = newValue;
    });
}
