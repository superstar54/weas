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
Custom color for each kind
-----------------------------
Use can set custom color for each kind. The color can be in the form of hex code or color name.


.. code-block:: javascript

    weas.avr.atomManager.settings["C"].color = "red";
    weas.avr.atomManager.settings["H"].color = "#b434eb";
    weas.avr.atomManager.settings["O"].color = "#34eb77";
    weas.avr.atomManager.settings["S"].color = "#FFFF00";
    weas.avr.drawModels()


.. image:: ../_static/images/example_color_by_kind.png
   :width: 6cm


Color by attribute
-----------------------
Coloring based on the attribute of the atoms. The attribute can be: charge, magmom, or any other attribute in the structure.

Here we show how to color the atoms by their forces.


.. code-block:: javascript


    weas.avr.colorBy = "Force"
    weas.avr._colorRamp = ["red", "yellow", "blue"]



.. image:: ../_static/images/example_color_by_force.png
   :width: 10cm
