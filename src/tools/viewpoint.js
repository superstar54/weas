export function createViewpointButtons(viewer, gui) {
  // Create a folder for the viewpoint buttons
  console.log("viewer", viewer);
  const viewpointFolder = gui.addFolder("Viewpoint");

  // Create buttons for different viewpoints
  const viewpoints = {
    Top: () => {
      viewer.tjs.updateCameraAndControls(viewer.atoms.getCenterOfGeometry(), [0, 0, 100]);
    },
    Bottom: () => {
      viewer.tjs.updateCameraAndControls(viewer.atoms.getCenterOfGeometry(), [0, 0, -100]);
    },
    Left: () => {
      viewer.tjs.updateCameraAndControls(viewer.atoms.getCenterOfGeometry(), [-100, 0, 0]);
    },
    Right: () => {
      viewer.tjs.updateCameraAndControls(viewer.atoms.getCenterOfGeometry(), [100, 0, 0]);
    },
    Front: () => {
      viewer.tjs.updateCameraAndControls(viewer.atoms.getCenterOfGeometry(), [0, -100, 0]);
    },
    Back: () => {
      viewer.tjs.updateCameraAndControls(viewer.atoms.getCenterOfGeometry(), [0, 100, 0]);
    },
  };

  // Add a button for each viewpoint

  for (const viewpoint in viewpoints) {
    viewpointFolder.add(viewpoints, viewpoint).name(viewpoint);
  }
}
