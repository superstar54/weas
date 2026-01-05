

=======================
Edit
=======================

Selection
=======================

- `Click` the atom to select it. Click again to deselect.
- `Shift + drag` to select multiple atoms with a box. Support accumulation of selection.
- `Shift + Alt + drag` to select multiple atoms with a lasso. Support accumulation of selection.


Advanced Selection
-------------------
Draw a mesh primitive to select atoms inside the mesh.

Group-based Selection
----------------------
You can tag atoms into named groups and select them later by group name. Each atom
can belong to multiple groups.

Example (JS):

.. code-block:: javascript

   // add selected atoms to a group
   editor.ops.atoms.AddAtomsToGroupOperation({ group: "molecule" });
   // remove selected atoms from a group
   editor.ops.atoms.RemoveAtomsFromGroupOperation({ group: "molecule" });
   // clear a group from all atoms
   editor.ops.atoms.ClearGroupOperation({ group: "molecule" });
   // select atoms by group
   editor.ops.selection.SelectByGroup({ group: "molecule" });

You can also manage groups directly on the Atoms object:

.. code-block:: javascript

   atoms.addAtomsToGroup([0, 1, 2], "surface");
   const indices = atoms.getGroupIndices("surface");


Move, Rotate
=======================

Select the atoms, and press the transform Shortcut, and move your mouse

- ``g``, move
- ``r``, rotate
- ``d``, copy and move
- ``Delete`` or ``x``, delete the selected atoms
