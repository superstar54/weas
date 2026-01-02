Site Labels
===========

Site labels are 2D, screen-aligned markers you can attach to atoms or arbitrary
positions (for example, adsorption sites). They do not rotate with the 3D
scene.

Quick example
-------------

.. code-block:: javascript

   const fixedIndices = [0, 1];
   const adsorptionSites = [
     [1.25, 0.0, 3.1],
     [2.6, 0.8, 3.1],
   ];

   editor.avr.siteLabelManager.setSettings([
     {
       indices: fixedIndices,
       texts: "+",
       color: "#111111",
       fontSize: "18px",
       className: "site-label site-label-cross",
       sizeMode: "atom",
       shift: [0, 0, 0.2],
     },
     {
       positions: adsorptionSites,
       texts: "+",
       color: "#111111",
       fontSize: "18px",
       className: "site-label site-label-cross",
       sizeMode: "screen",
     },
   ]);

Full HTML example
-----------------

.. literalinclude:: ../_examples/site_labels.html
   :language: html

Here is the result of the above code:

.. raw:: html
   :file: ../_examples/site_labels.html

API
---

The manager lives at ``editor.avr.siteLabelManager``.

``setSettings(settings)``
  Replace all site labels with the provided settings array.

``addSetting(setting)``
  Add a single setting to the current list.

Setting fields
--------------

- ``indices``: list of atom indices to label.
- ``positions``: list of positions ``[x, y, z]`` for non-atom sites.
- ``texts``: label text (string) or array of strings.
- ``color``: CSS color string.
- ``fontSize``: CSS font size (e.g., ``"16px"``).
- ``className``: CSS class for styling (default ``"site-label site-label-cross"``).
- ``shift``: vector added to each position, in world units.
- ``sizeMode``:
  - ``"atom"``: cross size matches the atom radius on screen (for ``indices``).
  - ``"screen"``: fixed pixel size, independent of zoom.

Styling
-------

The default cross style is defined in ``weas-js/src/style.css`` under
``.site-label`` and ``.site-label-cross``. You can override these classes in
your own styles if needed.
