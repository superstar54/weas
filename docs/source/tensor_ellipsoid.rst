Tensor Ellipsoids
=================

Tensor ellipsoids visualize a symmetric rank-2 tensor at each site by turning
its principal values and principal axes into an oriented ellipsoid. In WEAS,
the ellipsoid semi-axes are proportional to ``abs(eigenvalue) * scale`` in
``"absolute"`` mode, or normalized within the setting before applying
``scale`` in ``"setNormalized"`` mode. Orientation comes from the supplied
eigenvectors.

This representation is useful for any property that is naturally described by a
3×3 tensor, especially when the anisotropy matters more than a single scalar.

What WEAS Assumes
-----------------

- Tensors are diagonalized and sorted according to the chosen convention before
  they reach the viewer.
- ``eigenvalues`` and ``eigenvectors`` are matched pairwise for every site.
- ``eigenvectors`` are supplied as a 3×3 principal-axis matrix per site, with
  the principal axes stored as columns so that column ``j`` matches
  ``eigenvalues[i][j]``.
- ``eigenvectors`` are always interpreted in Cartesian space, regardless of the
  ``coordinateSystem`` setting (which only affects ``origins``).
- ``coordinateSystem = "fractional"`` converts only the ``origins`` to
  Cartesian coordinates using the cell.
- Ellipsoid size uses ``abs(eigenvalue)``, so positive and negative principal
  values are not distinguished by the ellipsoid shape alone. Use
  ``showPrincipalAxes`` with per-axis colours to encode sign information where
  needed.
- If the three eigenvectors form a left-handed basis, WEAS flips the third axis
  to build a proper rotation matrix for rendering.

Quick Example
-------------

The snippet below is fully self-contained and shows a two-site shielding layer.

.. code-block:: javascript

   const manager = editor.avr.tensorEllipsoidManager;

   // Two sites: one axially symmetric, one tilted 45° in the xy-plane.
   const shieldingEigenvalues = [
     [210, 165,  95],
     [ 32,  28,  21],
   ];

   const shieldingEigenvectors = [
     [
       [1, 0, 0],
       [0, 1, 0],
       [0, 0, 1],
     ],
     [
       [ 0.71, 0.71, 0],
       [-0.71, 0.71, 0],
       [    0,    0, 1],
     ],
   ];

   // Each site uses a 3x3 matrix with principal axes stored as columns.
   // For the tilted site above, the first two in-plane axes are the first two
   // columns of the second matrix.

   manager.addSetting("shielding", {
     origins: "positions",
     eigenvalues: shieldingEigenvalues,
     eigenvectors: shieldingEigenvectors,
     scale: 0.02,
     color: "#ff6b35",
     opacity: 0.45,
     showPrincipalAxes: true,
     principalAxisLength: 1.2,
   });

   manager.drawTensorEllipsoids();

If your tensor data is naturally stored as three row vectors, transpose each
site matrix before passing it to WEAS:

.. code-block:: javascript

   function transpose3x3(matrix) {
     return matrix[0].map((_, column) => matrix.map((row) => row[column]));
   }

    const weasEigenvectors = rowVectorMatrices.map(transpose3x3);

API
---

The manager lives at ``editor.avr.tensorEllipsoidManager``.

``addSetting(name, setting)``
  Add or replace one tensor-ellipsoid layer identified by *name*.

``setSettings(settings)``
  Replace all tensor-ellipsoid layers at once with an object whose keys are
  layer names and whose values are setting objects.

``drawTensorEllipsoids()``
  Re-render all ellipsoid layers from the current frame's atom positions and
  tensor data. Call this after ``addSetting``/``setSettings`` or whenever the
  structure changes.

``updateTensorMesh(atomIndex, atoms)``
  Update the mesh for a single atom without rebuilding every layer. Prefer this
  over ``drawTensorEllipsoids()`` for lightweight updates such as a slider
  changing the active trajectory frame or a live position update, where
  re-building all meshes would be too expensive.

Setting Fields
--------------

``origins``
  Where to place each ellipsoid. Accepted values:

  - ``"positions"`` — use the atom positions from the current atoms object.
  - An attribute name (string) — look up a per-site array stored in the atoms
    object under that name.
  - An explicit ``[nSites][3]`` array of Cartesian or fractional coordinates
    (see ``coordinateSystem``).

``eigenvalues``
  Principal values as an ``[nSites][3]`` array, or ``[nFrames][nSites][3]``
  when ``trajectory`` is ``true``.

``eigenvectors``
  Principal axes as an ``[nSites][3][3]`` array (one 3×3 matrix per site,
  columns = axes), or ``[nFrames][nSites][3][3]`` for trajectory data. Always
  interpreted in Cartesian space.

``selection``
  Optional array of zero-indexed integer site indices to render. When omitted,
  all sites are rendered. Example: ``[0, 2, 5]`` renders only sites 0, 2, and 5.

``scale``
  Multiplicative factor applied to the absolute eigenvalues to obtain semi-axis
  lengths. Adjust to keep ellipsoids a reasonable fraction of the inter-site
  spacing. Default: ``1``.

``minRadius``
  Lower bound (in Å) for each semi-axis length. Prevents degenerate
  near-zero axes from becoming invisible. Default: ``0.05``.

``coordinateSystem``
  ``"cartesian"`` (default) or ``"fractional"``. Applies only to ``origins``;
  ``eigenvectors`` are always Cartesian.

``color``
  CSS colour string applied to all ellipsoids in this layer. Example:
  ``"#ff6b35"``, ``"steelblue"``. Default: ``"#4f81ff"``.

``opacity``
  Number between ``0`` (transparent) and ``1`` (opaque). Default: ``0.35``.

``renderMode``
  ``"solid"`` (default) or ``"wireframe"``.

``showPrincipalAxes``
  If ``true``, draw cylinders along each principal direction. Useful for
  inspecting orientation and for encoding sign information that is otherwise
  invisible in the ellipsoid shape. Default: ``false``.

``principalAxisLength``
  Length of the principal-axis cylinders in Å. Only used when
  ``showPrincipalAxes`` is ``true``. Default: ``1.0``.

``trajectory``
  Set to ``true`` when ``eigenvalues`` and ``eigenvectors`` are shaped for
  multiple frames (``[nFrames][nSites][…]``). The plugin selects the slice
  corresponding to the viewer's current frame. Default: ``false``.

Scientific Examples
-------------------

Magnetic shielding
^^^^^^^^^^^^^^^^^^

NMR shielding tensors are commonly reported as principal components in ppm.
After diagonalizing the shielding tensor for each nucleus, pass those principal
values and axes directly to the plugin.

.. code-block:: javascript

   manager.addSetting("magnetic-shielding", {
     origins: "positions",
     eigenvalues: [
       [210, 165, 95],
       [ 32,  28, 21],
     ],
     eigenvectors: [
       [
         [1, 0, 0],
         [0, 1, 0],
         [0, 0, 1],
       ],
       [
         [ 0.71, 0.71, 0],
         [-0.71, 0.71, 0],
         [    0,    0, 1],
       ],
     ],
     // Columns of each 3x3 matrix are the principal axes.
     scale: 0.01,
     color: "#cc5a2e",
   });

Electric field gradient
^^^^^^^^^^^^^^^^^^^^^^^

For quadrupolar nuclei, the electric field gradient (EFG) tensor is traceless
and its principal-axis system is often the quantity of interest. The ellipsoid
shows the relative magnitudes and orientations of the principal components.

Because WEAS uses absolute values for the semi-axis lengths, the sign pattern
of the EFG principal components is not visible from the shape alone. Enable
``showPrincipalAxes`` to annotate the axes and distinguish the unique axis
(V\ :sub:`zz`) from the others.

.. code-block:: javascript

   manager.addSetting("efg", {
     origins: "positions",
     eigenvalues: [
       [-8.4, 3.1, 5.3],
       [-2.2, -1.1, 3.3],
     ],
     eigenvectors: efgEigenvectors,
     scale: 0.18,
     color: "#2d6cdf",
     renderMode: "wireframe",
     showPrincipalAxes: true,
     principalAxisLength: 1.0,
   });

Atomic polarizability
^^^^^^^^^^^^^^^^^^^^^

Polarizability tensors are often positive definite, so ellipsoids provide a
direct visual summary of how easily a site or fragment responds to fields along
different directions.

.. code-block:: javascript

   manager.addSetting("polarizability", {
     origins: fragmentCentres,   // explicit [nSites][3] array
     eigenvalues: [
       [12.5,  9.8,  7.4],
       [18.2, 11.4, 10.1],
     ],
     eigenvectors: polarizabilityEigenvectors,
     scale: 0.08,
     color: "#2f9e77",
     opacity: 0.35,
   });

Trajectory data
---------------

If your tensor data changes frame-by-frame, set ``trajectory: true`` and pass
arrays shaped ``[nFrames][nSites][3]`` for ``eigenvalues`` and
``[nFrames][nSites][3][3]`` for ``eigenvectors``. The plugin selects the slice
for the current viewer frame automatically.

Use ``updateTensorMesh`` rather than ``drawTensorEllipsoids`` when scrubbing
through frames to avoid the cost of rebuilding every layer on each step.

.. code-block:: javascript

   manager.addSetting("shielding-traj", {
     origins: "positions",
     eigenvalues: shieldingEigenvaluesByFrame,   // [nFrames][nSites][3]
     eigenvectors: shieldingEigenvectorsByFrame, // [nFrames][nSites][3][3]
     trajectory: true,
     scale: 0.02,
     color: "#ff6b35",
     opacity: 0.5,
   });

   manager.drawTensorEllipsoids();

   // Later, when the frame changes:
   // Pass null as atomIndex to refresh all sites for the new frame.
   viewer.onFrameChange = (frame, atoms) => {
     manager.updateTensorMesh(null, atoms);
   };