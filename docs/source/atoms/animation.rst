=======================
Animation
=======================

Frame Update Behavior
---------------------

- **Playing mode**: Only updates atom positions, no full re-draw for smooth performance.
- **Paused mode**:
  - **`continuousUpdate = True`** (Default): Re-draws models automatically when selecting a frame.
  - **`continuousUpdate = False`**: Updates mesh only; full re-draw occurs **on confirmation**.
