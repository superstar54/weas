Bond
===============

One can see the bond setting:

.. code-block:: javascript

    // Bond settings
    weas.avr.bondManager.settings

Delete one bond pair
----------------
One can delete one bond pair by:

.. code-block:: javascript

    delete editor.avr.bondManager.settings['C-H']


Hydrogen bond
----------------
One can see the hydrogen bond setting:

.. code-block:: javascript

    // Hydrogen bond settings
    editor.avr.bondManager.settings['H-O'].min = 1.5;
    editor.avr.bondManager.settings['H-O'].max = 2.5;
    editor.avr.bondManager.showHydrogenBonds = true;
    editor.avr.drawModels();
