Fermi Surface
=================
The Fermi-surface plugin renders isosurfaces from volumetric band data in the
frontend (JavaScript marching cubes). This makes Fermi-energy updates fast
because the mesh is generated on the client.

Quick start
-----------

.. code-block:: javascript

   // 1) Provide volumetric data
   const fermiData = {
     datasets: [
       {
         name: "Band-1",
         dims: [nx, ny, nz],
         values: bandValues, // length = nx * ny * nz, z-fastest
         cell: [
           [b1x, b1y, b1z],
           [b2x, b2y, b2z],
           [b3x, b3y, b3z],
         ],
         origin: [0, 0, 0],
       },
     ],
     // Optional: Brillouin-zone planes and/or mesh
     // bzPlanes: [{ normal: [x, y, z], constant: d }, ...],
     // bzMesh: { vertices: [...], faces: [...], color: [0, 0, 0.5], opacity: 0.1 },
   };
   viewer.setFermiSurfaceData(fermiData);

   // 2) Configure Fermi-surface settings
   viewer.state.set({
     plugins: {
       fermiSurface: {
         settings: {
           "Band-1": {
             isovalue: 0.0,
             color: "#00ff00",
             opacity: 0.6,
             step_size: 1,
             clipToBZ: true,
             bzCropMargin: 1,
           },
         },
       },
     },
   });

Data format
-----------
- ``datasets``: array of volumetric grids. Each dataset includes:
  - ``name``: dataset key referenced by settings.
  - ``dims``: ``[nx, ny, nz]`` grid dimensions.
  - ``values``: flat array of length ``nx * ny * nz`` in x-major order with z fastest.
  - ``cell``: 3x3 reciprocal lattice vectors.
  - ``origin``: lattice origin (usually ``[0, 0, 0]``).
- ``bzPlanes`` (optional): clipping planes for the first Brillouin zone.
- ``bzMesh`` (optional): mesh data for displaying the Brillouin zone.

Settings
--------
Each entry in ``plugins.fermiSurface.settings`` defines a mesh:

- ``dataset`` or ``datasets``: dataset key(s) to use.
- ``isovalue``: Fermi energy for the isosurface.
- ``color``: hex color or ``[r, g, b]`` in 0–1 range.
- ``opacity``: 0–1.
- ``step_size``: marching-cubes stride (integer).
- ``clipToBZ``: clip to Brillouin-zone planes (if provided) and crop to the BZ bounding box (if ``bzMesh`` is provided).
- ``bzCropMargin``: padding in grid points around the BZ bounding box (default 1).
- ``materialType``: ``"Standard"`` or other supported material type.

Notes
-----
- The marching-cubes supercell is fixed to ``2`` in the current implementation.
- Clipping does not add caps on the Brillouin-zone boundary.
