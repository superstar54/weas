Save and Restore State
======================

WEAS can export the full viewer state (atoms, viewer settings, plugins, camera,
measurement, and animation) as JSON so you can persist it and load it later.

Example (JS)
------------

.. code-block:: javascript

   // export
   const snapshot = viewer.exportState();
   const payload = JSON.stringify(snapshot);

   // import
   viewer.importState(JSON.parse(payload));

Simple GUI helpers
------------------

.. code-block:: javascript

   // export to a downloaded JSON file
   const exportBtn = document.querySelector("#export");
   exportBtn.onclick = () => {
     const snapshot = viewer.exportState();
     const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
     const url = URL.createObjectURL(blob);
     const link = document.createElement("a");
     link.href = url;
     link.download = "weas_state.json";
     link.click();
     URL.revokeObjectURL(url);
   };

   // import from a file input
   const importInput = document.querySelector("#import");
   importInput.onchange = async (e) => {
     const file = e.target.files[0];
     if (!file) return;
     const text = await file.text();
     viewer.importState(JSON.parse(text));
   };

GUI buttons (built-in)
----------------------

The default GUI now includes import/export buttons that support JSON, XYZ, and
CIF files.

- Import: JSON (state snapshot), XYZ, CIF
- Export: JSON (full state), XYZ, CIF

Operation helper
----------------

The operations panel also includes IO operations:

- Import structure file
- Export structure file

These are available in the operation search overlay (Ctrl+F).

Programmatic helpers
--------------------

For apps that need custom file inputs or downloads, use the IO helpers:

.. code-block:: javascript

   import { parseStructureText, applyStructurePayload, buildExportPayload, downloadText } from "weas";

   // import text content
   const parsed = parseStructureText(text, ".xyz");
   applyStructurePayload(viewer, parsed.data);

   // export
   const payload = buildExportPayload(viewer, "json");
   downloadText(payload.text, payload.filename, payload.mimeType);
