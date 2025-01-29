Cell
===============

One can see the cell setting:

.. code-block:: javascript

    // Cell settings
    editor.avr.cellManager.settings

Update the cell width and color:

.. code-block:: javascript

    // Cell settings
    editor.avr.cellManager.settings.cellLineWidth = 5
    editor.avr.cellManager.settings.cellColor = "red"
    editor.avr.cellManager.draw()


One can hide the cell by:

.. code-block:: javascript

    // hide the cell
    editor.avr.cellManager.show = false;
    // hide the axes
    editor.avr.cellManager.showAxes = false;
