VolumeSlice Module
==================

This module provides functionality for creating and managing volumetric slices within a 3D scene using Three.js. It includes interactive controls via a GUI to allow customization of slice parameters.

Usage Example
-------------

.. code-block:: javascript

   let domElement = document.getElementById("viewer");
   // Read atoms and volumetric data from a file
   const filename = "h2o-homo.cube";
   fetchFile(filename).then((fileContent) => {
      const cubeData = weas.parseCube(fileContent);
      const editor = new weas.WEAS({ domElement });
      editor.avr.atoms = cubeData.atoms;
      editor.avr.volumetricData = cubeData.volumetricData;
      editor.avr.volumeSliceManager.addSetting("Slice 1", {
          h: 0, k: 1, l: 0,
          distance: 5.5,
          colorMap: "viridis",
          opacity: 0.8,
          samplingDistance: 0.1
      });
      editor.avr.volumeSliceManager.addSetting("Slice 2", {
          h: 1, k: 1, l: 0,
          distance: 4.5,
          colorMap: "grayscale",
          opacity: 0.6,
          samplingDistance: 0.2
      });
      editor.avr.drawModels();
      editor.render();
   });

.. image:: ../_static/images/example-volume-slice.png
   :width: 10cm

Setting
~~~~~~~

Holds configuration for volumetric slice generation, including slicing method, plane parameters, color mapping, and opacity.

.. code-block:: javascript

   constructor({
       method = "miller",
       h = 0,
       k = 0,
       l = 1,
       distance = 0,
       selectedAtoms = [],
       colorMap = "viridis",
       opacity = 1.0,
       samplingDistance = 0.1
   })

- **method**: Specifies the slicing method. Can be `"miller"` (uses Miller indices) or `"bestFit"` (fits a plane to selected atoms).
- **h, k, l**: Miller indices for the slicing plane. Relevant when `method = "miller"`.
- **distance**: Distance from the origin along the plane normal.
- **selectedAtoms**: Array of atom indices or positions for `method = "bestFit"`.
- **colorMap**: The colormap used for mapping data values to colors (e.g., `"viridis"`, `"grayscale"`).
- **opacity**: Opacity of the slice (value between 0 and 1).
- **samplingDistance**: Spacing of sampling points for rendering the slice.

Features
--------

- **Dynamic Slicing**: Generate slices dynamically based on user-defined settings.
- **Miller or Best Fit Plane**: Supports slicing using Miller indices or by fitting a plane to selected atoms.
- **Interactive GUI**: Integration with dat.GUI for real-time adjustment of slicing parameters.
- **Customizable Appearance**: Adjust colormap, opacity, and sampling distance for each slice.
- **Multiple Slices**: Support for defining multiple slices with individual properties.

Methods
-------

**`addSetting(name, settings)`**
   Adds a new volumetric slice with the given name and settings.

   - **name**: Name for the slice (e.g., `"Slice 1"`).
   - **settings**: Configuration object for the slice (see `Setting` for details).

**`setSettings(settings)`**
   Replaces existing slices with a new set of settings.

   - **settings**: Object containing multiple slice settings keyed by their names.

**`drawSlices()`**
   Generates and renders all defined slices in the scene.

**`clearSlices()`**
   Removes all slice meshes from the scene.

**`reset()`**
   Resets the module, clearing all slices and settings.

---

The `VolumeSlice` module is designed for easy integration into 3D visualization applications, offering flexibility and interactivity for exploring volumetric data.
