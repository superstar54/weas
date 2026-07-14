# WEAS Codebase Audit & Improvement Plan

Generated: July 2026

---

## Critical Bugs & Vulnerabilities

### 1. `eval()` in CIF parser — `src/io/parserCif.js:195`
Uses `eval()` on untrusted CIF file input to parse fraction strings. Replace with a safe fraction parser.

### 2. `convertColor` missing import — `src/atoms/plugins/boundary.js:9`
`Setting` class calls `convertColor()` which is never imported. Constructing a boundary Setting throws `ReferenceError`.

### 3. Double `updateLegend()` call — `src/atoms/AtomsViewer.js:973-984`
`updateLegend()` fires twice when species change (once inside an `if` block, once after it).

### 4. `getSpaceGroupName` not invoked — `src/io/parserCif.js:211`
`if (this.getSpaceGroupName && ...)` checks method truthiness (always true), not return value.

### 5. `findNeighbors` uses uninitialized `offsets1` — `src/atoms/plugins/bond.js`
When PBC is `false`, `offsets1` is never assigned but used in `offsets.concat(offsets1)`.

### 6. `fnv1aHash` fails on non-strings — `src/utils.js:329`
Calls `val.charCodeAt(j)` on elements that may be numbers, producing unreliable hashes.

### 7. `adjust()` bypasses `OperationManager` — `src/operation/baseOperation.js`
Calls `this.execute()` directly instead of `this.weas.ops.execute()`, so adjusted ops never update undo/redo stacks.

### 8. Missing bounds check in `applyState` — `src/atoms/AtomsViewer.js`
`selectedAtomsIndices` handler returns early, skipping the bounds check; camera may jump to `NaN`.

---

## Structural & Design Improvements

### A. Eliminate God Object (WEAS) and bidirectional coupling
WEAS holds refs to every subsystem; every subsystem holds `this.weas`. Nothing testable in isolation. Introduce dependency injection / event bus.

### B. Add lifecycle management (dispose())
No cleanup anywhere. Event listeners use `.bind(this)` creating unremovable refs. `window`-level listeners never removed. Memory leaks in SPAs.

### C. Factor out 17 identical property setters — `AtomsViewer.js`
200+ lines of identical getter/setter boilerplate for 17 properties. Use a property descriptor factory.

### D. Fix state store cloning — `src/state/store.js`
`cloneValue` uses JSON-stringify-parse on every state emission. Lossy and slow. Use `structuredClone()`.

### E. Unify the 9+ Setting classes
atom.js, bond.js, boundary.js, isosurface.js, polyhedra.js, vectorField.js, highlight.js, AnyMesh.js, InstancedMeshPrimitive.js each define their own Setting class. Single base class needed.

### F. Eliminate `isRestoring` timing hack — `src/operation/operation.js`
queueMicrotask/setTimeout guard with fragile timing. Checked by 15+ call sites. Replace with proper state machine.

### G. Remove duplicate `toPlainSettings`
atom.js and bond.js have identical methods. Merge into shared utility.

### H. Merge the two hash functions
`hashSymbols()` in AtomsViewer and `fnv1aHash()` from utils serve the same purpose. Pick one.

### I. Clean up dead code

| Location | Dead Code |
|----------|-----------|
| AtomsViewer.reset() | atomLabels, atomArrows, atomColors |
| EventHandlers.init() | dragMode, boxselect |
| atoms.js Atom class | Never instantiated by the data model |
| parserCif.js | data.species = {} never populated |
| utils.js | Deprecated wrappers |
| drawModels | positionsHash, sysmbolsHash computed but never read |

### J. Fix naming inconsistencies

| Problem | Location |
|---------|----------|
| ALManager, VFManager, Measurement | AtomsViewer |
| Specie class (should be Species) | atoms.js |
| clearIossurfaces typo | isosurface.js |
| calculateFructionalCoordinates (computes Cartesian!) | utils.js |
| Shaves PascalCase vs others lowercase | operation.js |

### K. Encapsulate implicit cross-object contracts
- `this.neighbors` set by BondManager on AtomsViewer
- `this.activeObject` set by SelectionManger on WEAS
- trajectory.uuid mutated inside dispatchAtomsUpdated

### L. Remove prompt()/alert() from GUIManager
Blocking browser dialogs in a WebGL app. Replace with in-panel UI.

### M. Remove console.log from production code
src/utils.js:21, src/core/blendjs.js:191,212

### N. Use try/finally for isSyncing guard in atomsGui.js
If callback throws, isSyncing stays true permanently.

### O. var -> const/let
blendjs.js, bond.js, polyhedra.js, isosurface.js

### P. Fix CIF symmetry coefficient handling
parserCif.js only handles +1/-1. Operations like 2x produce wrong matrices.

### Q. atomsToCIF always writes P1
Silently discards symmetry information.

### R. atomsToXYZ incorrect for multi-frame
Concatenates frames without proper delimiters. Produces invalid XYZ.

### S. color.getColorsFromArray
Division by zero when all values identical. Missing "Element" case in colorBy.

### T. Duplicate test in atoms.test.mjs
Tests lines 4-8 and 9-13 are identical.

### U. Magic numbers
- 5 px drag threshold (duplicated in EventHandlers)
- 1.1 outline scale, 0.8/1.0 highlight scales
- 10 to 10 for bounary control
- camera1/camera2/... numbering is non-sequential

### V. Double cameraController.update() in blendjs.render()
Called at both beginning and end. One is redundant.

### W. clear() is a no-op alias for reset()
Either give it meaning or remove.

### X. Simplify trajectory branching in AtomsViewer
Two idenctical branches in Array.isArray check; replace with ternary.

### Y. 21 copies of options-detection boilerplate in atoms.js
if (xOrOptions && typeof === "object" && call.call(xOrOptions, "key")). Use a helper.

### Z. Tests import from dist/ instead of src
Requires a build step before running. Import from source for faster iteration.

---

## Test Coverage Gaps

| Area | Coverage |
|------|----------|
| src/utils.js (15+ functions) | 0% |
| src/atoms/color.js | 0% |
| Atoms class (30+ methods) | ~5% |
| parserCube.js, parserXsf.js | 0% |
| Edge cases | none |
