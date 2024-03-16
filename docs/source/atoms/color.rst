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


Color by attribute
-----------------------
Coloring based on the attribute of the atoms. The attribute can be: charge, magmom, or any other attribute in the structure.

Here we show how to color the atoms by their forces.


.. code-block:: javascript


    weas.avr.colorBy = "Force"
    weas.avr._colorRamp = ["red", "yellow", "blue"]



.. image:: ../_static/images/example_color_by_force.png
   :width: 10cm
