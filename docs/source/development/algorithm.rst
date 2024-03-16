Algorithm
=============



The steps to draw the models are as follows:

- find neighbors of each atoms in the original cell; `maxCutoff` will be used to include the pbc image atoms.
- search for the boundary atoms
- search bonded atoms, this need the original cell and the boundary atoms
