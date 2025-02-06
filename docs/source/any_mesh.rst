Any Mesh
=================
The `anyMesh` module is used to draw any custom geometry using vertices and faces. The module also provides methods to set the position, color, and material of the mesh.

The following example shows how to draw mesh using vertices and faces.

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
          import { WEAS, Atoms } from 'https://unpkg.com/weas/dist/weas.mjs';
          let domElement = document.getElementById("viewer");
          let data = [
              {
                  "name": "mesh1",
                  "color": [0.0, 1.0, 0.0, 1.0],
                  "material": "Standard",
                  "position": [-5.0, 0.0, 0.0],
                  "vertices": [0.0, 1.0, 0.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0],
                  "faces": [0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 1, 1, 4, 3, 3, 2, 1]
              },
              {
                  "name": "mesh2",
                  "color": [1.0, 0.0, 0.0, 0.5],
                  "material": "Standard",
                  "vertices": [-3.0, -3.0, -3.0, -3.0, -3.0, 3.0, -3.0, 3.0, -3.0, -3.0, 3.0, 3.0, 3.0, -3.0, -3.0, 3.0, -3.0, 3.0, 3.0, 3.0, -3.0, 3.0, 3.0, 3.0],
                  "faces": [0, 1, 2, 1, 3, 2, 4, 6, 5, 6, 7, 5, 4, 5, 0, 5, 1, 0, 6, 2, 7, 2, 3, 7, 0, 2, 4, 2, 6, 4, 1, 5, 3, 5, 7, 3]
              }
          ]

          let editor = new WEAS({ domElement });
          editor.anyMesh.fromSettings(data);
          editor.anyMesh.drawMesh();
          editor.render();
        </script>
      </body>
    </html>


Here is the result of the above code:

.. raw:: html

    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>WEAS Molecule</title>
      </head>
      <body>
        <div id="viewer" style="position: relative; width: 600px; height: 600px"></div>
        <script type="module">
          import { WEAS, Atoms } from 'https://unpkg.com/weas/dist/weas.mjs';
          let domElement = document.getElementById("viewer");
          let data = [
              {
                  "name": "mesh1",
                  "color": [0.0, 1.0, 0.0, 1.0],
                  "material": "Standard",
                  "position": [-5.0, 0.0, 0.0],
                  "vertices": [0.0, 1.0, 0.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0],
                  "faces": [0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 1, 1, 4, 3, 3, 2, 1]
              },
              {
                  "name": "mesh2",
                  "color": [1.0, 0.0, 0.0, 0.5],
                  "material": "Standard",
                  "vertices": [-3.0, -3.0, -3.0, -3.0, -3.0, 3.0, -3.0, 3.0, -3.0, -3.0, 3.0, 3.0, 3.0, -3.0, -3.0, 3.0, -3.0, 3.0, 3.0, 3.0, -3.0, 3.0, 3.0, 3.0],
                  "faces": [0, 1, 2, 1, 3, 2, 4, 6, 5, 6, 7, 5, 4, 5, 0, 5, 1, 0, 6, 2, 7, 2, 3, 7, 0, 2, 4, 2, 6, 4, 1, 5, 3, 5, 7, 3]
              }
          ]

          let editor = new WEAS({ domElement });
          editor.anyMesh.fromSettings(data);
          editor.anyMesh.drawMesh();
          editor.render();
        </script>
      </body>
    </html>
