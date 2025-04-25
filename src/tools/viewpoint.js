export function createViewpointButtons(weas, gui) {
  // Create a folder for the viewpoint buttons
  const viewpointFolder = gui.addFolder("Viewpoint");

  // Create buttons for different viewpoints
  const viewpoints = {
    Top: () => {
      weas.tjs.updateCameraAndControls({ direction: [0, 0, 100] });
    },
    Bottom: () => {
      weas.tjs.updateCameraAndControls({ direction: [0, 0, -100] });
    },
    Left: () => {
      weas.tjs.updateCameraAndControls({ direction: [-100, 0, 0] });
    },
    Right: () => {
      weas.tjs.updateCameraAndControls({ direction: [100, 0, 0] });
    },
    Front: () => {
      weas.tjs.updateCameraAndControls({ direction: [0, -100, 0] });
    },
    Back: () => {
      weas.tjs.updateCameraAndControls({ direction: [0, 100, 0] });
    },
  };

  // Add a button for each viewpoint

  for (const viewpoint in viewpoints) {
    viewpointFolder.add(viewpoints, viewpoint).name(viewpoint);
  }
}
