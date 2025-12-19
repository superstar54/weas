GUIManager Module
==================

Configuration
-------------
To support configurable GUI components in AtomsViewer, one can use a configuration object that allows users to specify their GUI preferences, such as enabling/disabling the GUI entirely or choosing specific components to display.

The default configuration is:

.. code-block:: javascript

   const defaultGuiConfig = {
   controls: {
      enabled: true,
      atomsControl: true,
      colorControl: true,
      cameraControls: true,
   },
   timeline: {
      enabled: true, // Added this line to control timeline visibility
   },
   legend: { // atoms legend
      enabled: false,
      position: "bottom-right", // Options: 'top-right', 'top-left', 'bottom-right', 'bottom-left'
   },
   buttons: {
      enabled: true,
      fullscreen: true,
      undo: true,
      redo: true,
      download: true,
      downloadAnimation: false,
      measurement: true,
   }
   };

Notes:
- The downloadAnimation button is only shown when a trajectory has more than one frame.
