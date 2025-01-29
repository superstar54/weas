Color
===============

One can color the atoms using the following scheme:

- Element
- Random
- Uniform
- Index
- Attribute


Color by element
----------------

Supported style are:

#. **JMOL**: http://jmol.sourceforge.net/jscolors/#color_U
#. **VESTA**: https://jp-minerals.org/vesta/en/
#. **CPK**: https://en.wikipedia.org/wiki/CPK_coloring


-----------------------------
Custom color for each species
-----------------------------
Use can set custom color for each species. The color can be in the form of hex code or color name.


.. code-block:: javascript

    editor.avr.atomManager.settings["C"].color = "red";
    editor.avr.atomManager.settings["H"].color = "#b434eb";
    editor.avr.atomManager.settings["O"].color = "#34eb77";
    editor.avr.atomManager.settings["S"].color = "#FFFF00";
    editor.avr.drawModels()


.. image:: ../_static/images/example_color_by_species.png
   :width: 6cm


Color by attribute
-----------------------
Coloring based on the attribute of the atoms. The attribute can be: charge, magmom, or any other attribute in the structure.

Here we show how to color the atoms by their forces.


.. code-block:: javascript


    editor.avr.colorBy = "Force"
    editor.avr._colorRamp = ["red", "yellow", "blue"]



.. image:: ../_static/images/example_color_by_force.png
   :width: 10cm
