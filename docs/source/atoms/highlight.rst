Highlight atoms
===============

One can highlight the atoms using the following shapes:

- sphere
- box
- cross
- cross2d (2D cross overlay)

One can see the highlight setting:

.. code-block:: javascript

    editor.avr.highlightManager.settings

The default settings has a `selection` item, which is used to highlight the selected atoms.

Add highlight item
-------------------
One can add one highlight item:

.. code-block:: javascript

    // highlight the first two atoms with a cross, e.g., show the atoms which are fixed
    editor.avr.highlightManager.settings['fixed'] = {indices: [0, 1], type: 'cross'};
    editor.avr.highlightManager.drawHighlightAtoms()

2D cross overlay
----------------

Use ``cross2d`` to draw a screen-aligned cross that scales to the atom radius.

.. code-block:: javascript

    const highlightSettings = editor.avr.state.get("plugins.highlight")?.settings || {};
    highlightSettings.cross2d = { indices: [0, 1], type: "cross2d", color: "#111111", scale: 1.0 };
    editor.avr.highlightManager.setSettings(highlightSettings);



Full HTML example
-----------------

.. literalinclude:: ../_examples/highlight.html
   :language: html

Here is the result of the above code:

.. raw:: html
   :file: ../_examples/highlight.html
