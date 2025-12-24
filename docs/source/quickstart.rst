Quick Start
======================

Introduction
------------

WEAS is designed to visualize and manipulate the atomistic structures directly in the web browser.


Getting Started
---------------

Create a new HTML file and include the following code, and open the file in a web browser:

.. code-block:: html

    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>WEAS Molecule</title>
      </head>
      <body>
    <div id="viewer" style="position: relative; width: 600px; height: 600px"></div>
        <script type="module">
          import { WEAS, Atoms } from 'https://unpkg.com/weas@0.2.1/dist/index.mjs';
          let domElement = document.getElementById("viewer");
          // create atoms object for H2O
          let atoms = new Atoms({
                                "symbols": ["O", "H", "H"],
                                "positions": [[2.00, 2.76, 2.50],
                                              [2.00, 3.53, 2.00],
                                              [2.00, 2.00, 2.00]],
                                "cell": [5, 5, 5],
          });
          let editor = new WEAS({ domElement });
          // load atoms to atoms viewer (avr)
          editor.avr.atoms = atoms;
          editor.avr.applyState({ modelStyle: 1 }, { redraw: "full" }); // 1: ball and stick, 0: ball only
          editor.render();
        </script>
      </body>
    </html>


.. note::
   The viewer container must have an explicit size (width/height). If you use
   percentage sizing, ensure the parent element has a fixed size so the viewer
   can resolve its layout.


In this example, we import the WEAS library from the url. We then create a `Atoms` object for a water molecule (H2O) and a `WEAS` object to visualize the molecule. Finally, we update the atoms viewer with the water molecule and render the visualization.

Here is the result of the above code:

.. raw:: html

    <!doctype html>
    <html lang="en">
      <body>
        <div id="viewer" style="position: relative; width: 100%; height: 500px"></div>
        <script type="module">
          import { WEAS, Atoms } from 'https://unpkg.com/weas@0.2.1/dist/index.mjs';
          let domElement = document.getElementById("viewer");
          // create atoms object for H2O
          let atoms = new Atoms({
                                "symbols": ["O", "H", "H"],
                                "positions": [[2.00, 2.76, 2.50],
                                              [2.00, 3.53, 2.00],
                                              [2.00, 2.00, 2.00]],
                                "cell": [5, 5, 5],
          });
          let editor = new WEAS({ domElement });
          // load atoms to atoms viewer (avr)
          editor.avr.atoms = atoms;
          editor.avr.applyState({ modelStyle: 1 }, { redraw: "full" }); // 1: ball and stick, 0: ball only
          editor.render();
        </script>
      </body>
    </html>



Features
--------

- **Structure Manipulation**: Enables manipulation of the structure, such as adding, removing, translating, rotating atoms and modifying species, and cell parameters.

- **Customizable Appearance**: Allows customization of atom and bond appearances, including colors, sizes, and visibility, polyhedra, and unit cell.

- **Volumetric Data Visualization**: Supports the visualization of volumetric data (e.g., electron density) with isosurfaces.

- **Measurement Tools**: Provides tools to measure distances, angles, and dihedrals within the structure.
State updates and history
-------------------------

WEAS distinguishes between viewer state updates and operations that record history:

.. code-block:: javascript

    // Update state without history
    editor.avr.applyState({ colorBy: "Element" }, { redraw: "full" });

    // Update state with history (undo/redo)
    editor.avr.setState({ atomLabelType: "Symbol" }, { record: true, redraw: "labels" });

    // Batch multiple state changes into a single redraw
    editor.avr.transaction(() => {
      editor.avr.applyState({ colorType: "JMOL" });
      editor.avr.applyState({ materialType: "Phong" });
    });

    // Undo and redo operations
    editor.ops.undo();
    editor.ops.redo();
