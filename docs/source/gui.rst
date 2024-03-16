GUIManager Module
==================

Configuration
-------------
To support configurable GUI components in AtomsViewer, one can use a configuration object that allows users to specify their GUI preferences, such as enabling/disabling the GUI entirely or choosing specific components to display.

The default configuration is:

.. code-block:: javascript

   const defaultGuiConfig = {
   enabled: true,
   components: {
      atomsControl: true,
      colorControl: true,
      cameraControls: true,
      buttons: true,
   },
   buttons: {
      fullscreen: true,
      undo: true,
      redo: true,
      download: true,
      measurement: true,
   }
   };
