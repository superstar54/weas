Text Labels
===========

Text labels are 2D, screen-aligned markers you can attach to arbitrary
positions (for example, adsorption sites). They do not rotate with the 3D
scene.

The ``texts`` field can be any string (not only "+").

Quick example
-------------

.. code-block:: javascript

   const adsorptionSites = [
     [1.25, 0.0, 3.1],
     [2.6, 0.8, 3.1],
   ];

   editor.textManager.setSettings([
     {
       positions: adsorptionSites,
       texts: "+",
       color: "#111111",
       fontSize: "18px",
       className: "text-label text-label-cross",
       renderMode: "shape",
     },
   ]);

Full HTML example
-----------------

.. literalinclude:: _examples/text_labels.html
   :language: html

Here is the result of the above code:

.. raw:: html
   :file: _examples/text_labels.html

API
---

The manager lives at ``editor.textManager``.

``setSettings(settings)``
  Replace all text labels with the provided settings array.

``addSetting(setting)``
  Add a single setting to the current list.

Setting fields
--------------

- ``positions``: list of positions ``[x, y, z]`` for non-atom sites.
- ``texts``: label text (string) or array of strings.
- ``color``: CSS color string.
- ``fontSize``: CSS font size (e.g., ``"16px"``).
- ``className``: CSS class for styling (default ``"text-label text-label-cross"``).
- ``renderMode``:
  - ``"glyph"``: render text normally (default).
  - ``"shape"``: use CSS shapes for special labels like ``"+"`` with ``text-label-cross``.
- ``shift``: vector added to each position, in world units.

Styling
-------

The default cross style is defined in ``weas-js/src/style.css`` under
``.text-label`` and ``.text-label-cross``. You can override these classes in
your own styles if needed.
