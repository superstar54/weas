Isosurface Module
=================

This module contains classes for creating and managing isosurfaces within a 3D scene using Three.js and a GUI for interaction.

Usage Example
-------------

.. code-block:: javascript

   let domElement = document.getElementById("viewer");
   // read atoms from file
   const filename = "h2o-homo.cube";
   fetchFile(filename).then((fileContent) => {
      const cubeData = weas.parseCube(fileContent);
      const editor = new weas.WEAS({ domElement });
      editor.avr.atoms = cubeData.atoms;
      editor.avr.volumetricData = cubeData.volumetricData;
      editor.avr.isosurfaceManager.fromSettings([
         { isovalue: 0.0002, mode: 1, step_size: 1 },
         { isovalue: -0.0002, color: "#ff0000", mode: 1 },
      ]);
      editor.avr.drawModels();
      editor.render();
   });

.. image:: ../_static/images/example-isosurface.png
   :width: 10cm



Setting
~~~~~~~

Holds configuration for isosurface generation, including isovalue, color, and mode.

.. code-block:: javascript

   constructor(isovalue = null, color = "#3d82ed", mode = 0)

- **isovalue**: The value used to generate the isosurface. If null, it will be computed as the average of the data range.
- **color**: The color of the isosurface.
- **mode**: The mode of isosurface generation. mode=0: Positive and negative isosurfaces are drawn. In this case, the color of the positive is the given color, and the color of the negative is the complementary color of the given color- mode=other: Only the given isosurface is drawn.

Features
--------

- Dynamic isosurface generation based on user-defined settings.
- Support for multiple isosurfaces with individual properties (isovalue and color).
- Integration with dat.GUI for interactive control and visualization parameters adjustment.
