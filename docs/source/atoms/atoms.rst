Atoms
=========
The Atoms object represents a collection of atoms. It is used to store the positions, symbols, and other properties of the atoms. The sytax is very similar to ASE `Atoms <https://wiki.fysik.dtu.dk/ase/ase/atoms.html#module-ase.atoms>`_ object. However, there are also some key differences regarding the species and attributes.


Example:

.. code-block:: javascript

    const myAtoms = new Atoms({
        symbols: ['O', 'H', 'H'], // symbols of the atoms
        positions: [[5, 5, 5], [6, 5, 5], [4, 5, 5]] // Positions of the atoms
        cell: [[10, 0, 0], [0, 10, 0], [0, 0, 10]], // Defining a cubic unit cell
        pbc: [true, true, true], // Periodic boundary conditions in all directions
    });

In this example, an Atoms object is created to represent a water molecule within a cubic unit cell with periodic boundaries. The object includes definitions for the symbols, positions of the atoms.

Specie
-------
Why do we use species instead of elements? Because of we want to store different properties for the same element:

- such as: colors, bonds, etc.
- In DFT calculation, different potentials, basis sets, charge, magnetic moment, etc.

A specie has:

- symbol: the name of the specie, e.g. 'O', 'H1', 'Fe_up', etc.
- element: the element symbol, e.g. 'O', 'H', 'Fe', etc.
- number: the atomic number of the element, e.g. 8, 1, 26, etc.

One can define the species explicitly using the `species` attribute.

.. code-block:: javascript

    const myAtoms = new Atoms({
        symbols: ['O', 'H1', 'H2'], // symbols of the atoms
        species: {'H1': 'H', 'H2': 'H'}, // Defining the species
    });

Attributes and domain
----------------------
One can store additional data in the Atoms object using the `attributes`. The `attributes` has two domains:

- `atom`: store data that is specific to each atom, such as the charge or force.
- `specie`: store data that is specific to each specie, such as the mass, color, or radius.


.. code-block:: javascript

    attributes: {'atom': {'charge': [0, 0, 0],
                            'force': [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
                            },
                'specie': {'mass': {'O': 15.999, 'H': 1.008},
                            "color", {C: "red", H: "#b434eb", O: "#34eb77", S: "#FFFF00" },
                            "radius", {C: 0.77, H: 0.37, O: 0.66, S: 1.04},
                            },
                }


Methods
-------
The Atoms object has a number of methods that can be used to manipulate the data. These include methods to:


Atomic and Specie Manipulation
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

- addSpecie(symbol, element = null)
- addAtom(atom)
- replaceAtoms(indices, newSpecieSymbol)

Cell and Boundary Conditions
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

- setCell(cell)
- setPBC(pbc)

Attributes and Properties
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

- newAttribute(name, values, domain = "atom")
- getAttribute(name, domain = "atom")

Geometric Transformations
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

- translate(t)
- rotate(axis, angle, rotate_cell = false)
- center(vacuum = 0.0, axis = [0, 1, 2], center = null)

Advanced Manipulations
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

- multiply(mx, my, mz)
- deleteAtoms(indices)

Information and Export
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

- getAtomsCount()
- getSpeciesCount()
- getCellLengthsAndAngles()
- calculateFractionalCoordinates()
- toDict()
- copy()
- getCenterOfGeometry()
- getAtomsByIndices(indices)
