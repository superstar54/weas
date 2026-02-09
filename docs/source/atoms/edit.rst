

=======================
Edit
=======================

Selection
=======================

- `Click` an atom to select it. Click again to deselect.
- `Shift + drag` to box-select multiple atoms (selection accumulates).
- `Shift + Alt + drag` to lasso-select multiple atoms (selection accumulates).

Advanced Selection
-------------------
Draw a mesh primitive and select atoms inside it.

Group-based Selection
----------------------
Tag atoms into named groups and select them later by group name. Each atom can
belong to multiple groups.

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

Move, Rotate, Scale
=======================

Select atoms and use keyboard shortcuts to transform them, then move the mouse
to apply the transform and click to confirm.

- ``g`` translate
- ``r`` rotate
- ``s`` scale

Rotation defaults to the camera axis through the selection center.
To rotate around a custom axis, press ``r`` to enter rotate mode, then press ``a`` and click one, two, or three atoms, then press ``a`` again to exit axis picking.
One atom sets the rotation center (camera axis), two atoms define the bond axis, and three atoms define the plane normal through their centroid.
If exactly three atoms are selected, the rotation axis is the normal of the plane through those atoms, centered at their centroid.
The axis is shown with orange crosses and a long orange line (for two atoms), and stays active until you redefine it.
Press ``a`` again to exit axis picking and rotate; click an axis atom again to deselect it.
Press ``r`` then ``x``, ``y``, or ``z`` to lock rotation to a world axis (press the same key again to unlock).

Translate Axis Lock
=======================
Press ``g`` to translate, then press ``x``, ``y``, or ``z`` to lock movement to that axis.
To translate along an atom-defined axis, press ``g`` then ``a`` and click two atoms, then press ``a`` again to exit axis picking.
To translate in an atom-defined plane, press ``g`` then ``a`` and click three atoms, press ``a`` again to exit axis picking, then press ``p`` for plane or ``n`` for normal.

- ``g``, move
- ``r``, rotate
- ``d``, copy and move
- ``Delete`` or ``x``, delete the selected atoms
