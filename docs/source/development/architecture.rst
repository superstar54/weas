Architecture
============

State Store
-----------

WEAS has a global state store. The store owns all viewer and plugin
settings. Operations mutate the store; renderers react to store changes.
The store is always created by ``WEAS`` and assumed to exist throughout the
viewer, plugins, and operations.

.. code-block:: javascript

    const store = editor.state;
    const viewerState = store.get("viewer");
    store.set({ viewer: { modelStyle: 1 } });
    store.transaction(() => {
        store.set({ bond: { hideLongBonds: true } });
        store.set({ plugins: { highlight: { settings: {} } } });
    });

Core State Slices
-----------------

- ``viewer``: modelStyle, colorBy, colorType, radiusType, materialType, labels, selection, etc.
- ``viewer`` also owns per-atom style arrays: ``atomScales``, ``modelSticks``, ``modelPolyhedras``.
- ``cell``: showCell, showAxes, cell style settings.
- ``bond``: bond settings + flags.
- ``plugins``: per-plugin settings (isosurface, volumeSlice, vectorField, highlight, atomLabel, polyhedra, measurement, anyMesh, instancedMeshPrimitive, species).

Operations
----------

Operations mutate the store and are recorded in history. Rendering is triggered
after state changes, not inside setters.

.. code-block:: javascript

    editor.ops.settings.SetCellSettings({ showCell: false });
    editor.ops.undo();

History Model
-------------

Undo/redo stores state patches (diffs) rather than live references. When state
exists, operations apply patches via the store, and undo replays the previous
patch. This keeps history deterministic and avoids side effects from setters.

``applyStatePatchWithHistory`` captures the pre-mutation values for the keys
being changed, so operations no longer need to manually store ``previous`` for
state-backed updates.

Operations now assume the state store is present (``WEAS`` always creates it in
0.2.0), so direct viewer/plugin mutations have been removed from operation
implementations. Rendering and plugin updates happen via store subscriptions.

Operation Refactor
------------------

Operations now use shared helpers to read/write state slices. This keeps
operations small and makes it obvious when state is involved.

Shared Helpers
--------------

- ``stateGet(path)`` / ``stateSet(path, patch)`` for consistent store access
- ``captureStatePatch(path, patch)`` for deterministic undo snapshots

Plugins
-------

Each plugin should expose:

- ``defaultState()``
- ``apply(state, patch)`` or ``reduce(state, action)``
- ``render(state, context)``

Viewer State Application
------------------------

Viewer setters now funnel through a single ``applyState`` path. This keeps
side effects (model rebuilds, label updates, redraw scheduling) in one place
and ensures state updates behave the same whether they come from direct
property sets or store patches.

.. code-block:: javascript

    // same path, same side effects
    viewer.modelStyle = 1;
    viewer.applyState({ modelStyle: 1 });
    store.set({ viewer: { modelStyle: 1 } });

Render Scheduling
-----------------

Rendering is scheduled through ``requestRedraw`` rather than immediate calls to
``tjs.render()``. This allows batched updates and consistent redraw behavior.

.. code-block:: javascript

    editor.requestRedraw("render");  // lightweight render
    editor.requestRedraw("full");    // full redraw (models)

Initialization
--------------

During ``updateAtoms``, the viewer suppresses state-driven redraws to avoid
extra render work. Initialization emits state snapshots for species/bonds and
then performs a single draw.
