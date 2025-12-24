// src/index.d.ts

/**
 * Options for constructing the WEAS viewer.
 */
export interface WEASOptions {
  /** The container DOM element to render into */
  domElement: HTMLElement;
  /** Initial atoms to display */
  atoms?: Atoms[];
  /** Configuration passed to the AtomsViewer */
  viewerConfig?: Record<string, any>;
  /** Configuration for the GUIManager */
  guiConfig?: Record<string, any>;
}

/**
 * Main entrypoint for the WEAS 3D structure viewer.
 */
export declare class WEAS {
  /** Unique identifier for this instance */
  readonly uuid: string;
  /** Internal Three.js wrapper */
  readonly tjs: any;
  /** GUI manager */
  readonly guiManager: any;
  /** Event handler manager */
  readonly eventHandlers: any;
  /** Core operation manager */
  readonly ops: any;
  /** Global state store */
  readonly state: any;
  /** Selection manager */
  readonly selectionManager: any;
  /** Object manager */
  readonly objectManager: any;
  /** The atoms viewer plugin */
  readonly avr: AtomsViewer;
  /** Instanced mesh primitive plugin */
  readonly instancedMeshPrimitive: InstancedMeshPrimitive;
  /** AnyMesh plugin */
  readonly anyMesh: AnyMesh;

  constructor(options: WEASOptions);

  /** Initialize state and render once */
  initialize(): void;

  /** Render the current scene */
  render(): void;

  /** Clear all objects from the scene */
  clear(): void;

  /** Reset viewer state, plugins, and atoms to defaults */
  reset(): void;

  /**
   * Export a trajectory animation to a video Blob.
   */
  exportAnimation(options?: { format?: string; fps?: number; startFrame?: number; endFrame?: number | null; mimeType?: string | null; resolution?: number }): Promise<Blob>;

  /**
   * Export and download a trajectory animation.
   */
  downloadAnimation(options?: { filename?: string; format?: string; fps?: number; startFrame?: number; endFrame?: number | null; mimeType?: string | null; resolution?: number }): Promise<void>;

  /** Export the current viewer + atoms + plugins state as JSON */
  exportState(): Record<string, any>;
  /** Import a previously exported state snapshot */
  importState(snapshot: Record<string, any>): void;
}

/** Convert a weas-widget snapshot to a WEAS state payload */
export declare function fromWidgetSnapshot(snapshot: Record<string, any>): Record<string, any>;

export declare class SetCellSettings {}
export declare class SetBondSettings {}
export declare class SetIsosurfaceSettings {}
export declare class SetVolumeSliceSettings {}
export declare class SetVectorFieldSettings {}
export declare class SetHighlightSettings {}

/**
 * Options for constructing an AtomsViewer.
 */
export interface AtomsViewerOptions {
  /** The owning WEAS instance */
  weas: WEAS;
  /** Array of Atoms structures to display */
  atoms: Atoms[];
  /** Viewer configuration */
  viewerConfig?: Record<string, any>;
}

/**
 * 3D viewer for an Atoms structure.
 */
export declare class AtomsViewer {
  /**
   * @param options.weas        The owning WEAS instance
   * @param options.atoms       Initial Atoms array
   * @param options.viewerConfig Viewer configuration overrides
   */
  constructor(options: AtomsViewerOptions);

  /** Unique identifier for this viewer */
  readonly uuid: string;

  /** Back-reference to the parent WEAS instance */
  readonly weas: WEAS;

  /** Underlying Three.js wrapper */
  readonly tjs: any;

  /** Manager for atom rendering */
  readonly atomManager: any;
  /** Manager for cell rendering */
  readonly cellManager: CellManager;
  /** Manager for bonded-atom highlighting */
  readonly highlightManager: HighlightManager;
  /** GUI integration manager */
  readonly guiManager: any;
  /** Manager for bonds */
  readonly bondManager: BondManager;
  /** Manager for boundary rendering */
  readonly boundaryManager: BoundaryManager;
  /** Manager for polyhedra rendering */
  readonly polyhedraManager: any;
  /** Manager for isosurface plugin */
  readonly isosurfaceManager: Isosurface;
  /** Manager for volume slicing */
  readonly volumeSliceManager: any;
  /** Manager for atom labels */
  readonly ALManager: any;
  /** Measurement helper */
  readonly Measurement: any;
  /** Vector-field helper */
  readonly VFManager: VectorField;

  /** The currently displayed Atoms object */
  atoms: Atoms;
  /** Render style/model index */
  modelStyle: number;

  /** Color‐by mode */
  colorBy: string;
  /** Color type */
  colorType: string;
  /** Color ramp settings */
  colorRamp: any;
  /** Radius type for atoms */
  radiusType: string;
  /** Material type for atoms */
  materialType: string;
  /** Atom label style */
  atomLabelType: string;
  /** Whether to show bonded atoms */
  showBondedAtoms: boolean;
  /** Boundary configuration */
  boundary: any;
  /** Atom scale factor */
  atomScale: number;
  /** Per-atom scale overrides */
  atomScales: number[];
  /** Per-atom stick style overrides */
  modelSticks: number[];
  /** Per-atom polyhedra style overrides */
  modelPolyhedras: number[];
  /** Background color */
  backgroundColor: string;
  /** Whether to update continuously while dragging */
  continuousUpdate: boolean;
  /** Indices of selected atoms */
  selectedAtomsIndices: number[];
  /** Trajectory frames */
  trajectory: Atoms[];
  /** Is animation playing */
  isPlaying: boolean;
  /** Frame duration (ms) */
  frameDuration: number;
  /** DOM element for selected‐atom labels */
  selectedAtomsLabelElement: HTMLElement;
  /** Any loaded volumetric data */
  volumetricData: any;
  /** Set volumetric data and redraw dependent plugins */
  setVolumetricData(data: any): void;

  /** Begin a batched update to defer redraws */
  beginUpdate(): void;

  /** End a batched update and optionally redraw */
  endUpdate(options?: { redraw?: boolean }): void;

  /** Run a batched update with automatic begin/end */
  transaction(callback: () => void, options?: { redraw?: boolean }): void;

  /** Apply a patch to viewer state without history */
  applyState(patch: Record<string, any>, options?: { redraw?: "auto" | "full" | "labels" | "render" | "none" | boolean }): void;

  /** Apply a patch to viewer state, optionally recording history */
  setState(patch: Record<string, any>, options?: { record?: boolean; redraw?: "auto" | "full" | "labels" | "render" | "none" | boolean }): void;

  /**
   * Initialize the viewer with a set of Atoms.
   */
  init(atoms: Atoms[]): void;

  /**
   * Update the displayed Atoms (without full re‐init).
   */
  updateAtoms(atoms: Atoms[]): void;

  /**
   * Reset all viewer state (clears meshes, labels, etc).
   */
  reset(): void;

  /**
   * Perform a single render pass.
   */
  render(): void;

  /**
   * Request a redraw pass via the viewer scheduler.
   */
  requestRedraw(kind?: "full" | "labels" | "render"): void;

  /**
   * Remove all objects from the scene.
   */
  clear(): void;

  /**
   * Clean up WebGL contexts, event listeners, etc.
   */
  destroy?(): void;

  /**
   * Bound animation loop callback.
   */
  animate: () => void;
}

/**
 * Plugin for generating and rendering isosurfaces in the viewer.
 */
export declare class Isosurface {
  /**
   * @param viewer  The AtomsViewer instance this plugin attaches to
   */
  constructor(viewer: AtomsViewer);

  /** Reference back to the viewer */
  readonly viewer: AtomsViewer;

  /** Three.js Scene where the meshes get added */
  readonly scene: any;

  /** Current isosurface settings (isovalue, color, mode, step_size) */
  settings: Record<string, any>;

  /** GUI folder for this plugin (if any) */
  guiFolder: any;

  /** Map from frame or key → generated Mesh objects */
  meshes: Record<string, any>;
}

export declare class Phonon {
  /**
   * @param atoms          The Atoms object or collection to operate on
   * @param kpoint         Optional k-point coordinates or data
   * @param eigenvectors   Optional eigenvector data
   * @param addatomphase   Whether to apply atomic phase to vibrations (default: true)
   */
  constructor(atoms: Atoms, kpoint?: any, eigenvectors?: any, addatomphase?: boolean);

  /** The Atoms instance this plugin is bound to */
  readonly atoms: Atoms;

  /** K-point data (if provided) */
  readonly kpoint: any;

  /** Eigenvector data (if provided) */
  readonly eigenvectors: any;

  /** Whether atomic phase is added to the vibrations */
  readonly addatomphase: boolean;

  /** Computed vibration modes or geometry objects */
  vibrations: any[];
}
/**
 * Plugin for drawing vector fields in the viewer.
 */
export declare class VectorField {
  /**
   * @param viewer  The AtomsViewer instance this plugin attaches to
   */
  constructor(viewer: AtomsViewer);

  /** Back‐reference to the viewer */
  readonly viewer: AtomsViewer;

  /** Three.js scene where the vectors are rendered */
  readonly scene: any;

  /** Internal “show” flag */
  private _show: boolean;

  /** Initialize the vector‐field plugin */
  init(): void;
}

/**
 * Plugin for managing bond rendering.
 */
export declare class BondManager {
  /**
   * @param viewer    The AtomsViewer instance
   * @param settings  Optional settings object
   */
  constructor(
    viewer: AtomsViewer,
    settings?: {
      hideLongBonds?: boolean;
      showHydrogenBonds?: boolean;
      showOutBoundaryBonds?: boolean;
    },
  );

  readonly viewer: AtomsViewer;
  readonly scene: any;
  /** Runtime settings for bonds */
  settings: Record<string, any>;
  /** Map of bond‐meshes */
  meshes: Record<string, any>;

  /** Whether to hide overly long bonds */
  hideLongBonds: boolean;
  /** Whether to show hydrogen bonds */
  showHydrogenBonds: boolean;
  /** Whether to show bonds outside the boundary */
  showOutBoundaryBonds: boolean;
  /** Default bond radius */
  bondRadius: number;

  /** Initialize bond‐drawing routines */
  init(): void;
}

/**
 * Plugin for rendering periodic‐boundary cell outlines.
 */
export declare class BoundaryManager {
  constructor(viewer: AtomsViewer);

  readonly viewer: AtomsViewer;
  readonly scene: any;
  settings: Record<string, any>;
  meshes: Record<string, any>;

  /** Initialize boundary rendering */
  init(): void;
}

/**
 * Plugin for highlighting selected atoms.
 */
export declare class HighlightManager {
  constructor(viewer: AtomsViewer);

  readonly viewer: AtomsViewer;
  readonly scene: any;
  settings: Record<string, any>;
  meshes: Record<string, any>;

  /** Initialize highlighting routines */
  init(): void;
}

/**
 * Plugin for instanced‐mesh primitives (fast atom rendering).
 */
export declare class InstancedMeshPrimitive {
  constructor(viewer: AtomsViewer);

  readonly viewer: AtomsViewer;
  readonly scene: any;
  /** Settings arrays */
  settings: any[];
  /** Mesh instances */
  meshes: any[];
}

/**
 * Plugin for arbitrary mesh objects.
 */
export declare class AnyMesh {
  constructor(viewer: AtomsViewer);

  readonly viewer: AtomsViewer;
  readonly scene: any;
  settings: any[];
  meshes: any[];
}
/**
 * Plugin for rendering the unit‐cell and axes.
 */
export declare class CellManager {
  /**
   * @param viewer   The AtomsViewer instance this plugin attaches to
   * @param settings Optional overrides for cell/axis display
   */
  constructor(
    viewer: AtomsViewer,
    settings?: {
      showCell?: boolean;
      showAxes?: boolean;
      cellColor?: number;
      cellLineWidth?: number;
      axisColors?: { a: number; b: number; c: number };
      axisRadius?: number;
      axisConeHeight?: number;
      axisConeRadius?: number;
      axisSphereRadius?: number;
    },
  );

  /** Back‐reference to the viewer */
  readonly viewer: AtomsViewer;

  /** The Three.js mesh representing the cell */
  cellMesh: any | null;

  /** The vectors (lines/cones) for each cell axis */
  cellVectors: any | null;

  /** Runtime settings for cell display */
  settings: {
    showCell: boolean;
    showAxes: boolean;
    cellColor: number;
    cellLineWidth: number;
    axisColors: { a: number; b: number; c: number };
    axisRadius: number;
    axisConeHeight: number;
    axisConeRadius: number;
    axisSphereRadius: number;
  };

  /** Internal flag for whether the cell is shown */
  private _showCell: boolean;

  /** Internal flag for whether the axes are shown */
  private _showAxes: boolean;
}
/**
 * A single chemical specie.
 */
export declare class Specie {
  /**
   * @param element The chemical symbol, e.g. 'H' or 'O'
   */
  constructor(element: string);
  /** The element symbol */
  get element(): string;
  set element(value: string);
  /** The atomic number, as looked up from elementAtomicNumbers */
  get number(): number;
}

/**
 * A single atom in space.
 */
export declare class Atom {
  /**
   * @param symbol   The element symbol (must appear in Atoms.symbols)
   * @param position A tuple [x, y, z] of coordinates
   */
  constructor(symbol: string, position: [number, number, number]);
  /** The element symbol */
  symbol: string;
  /** The XYZ coordinates */
  position: [number, number, number];
}

/**
 * Parameters for creating an Atoms collection.
 */
export interface AtomsConstructorParams {
  symbols?: string[];
  positions?: [number, number, number][];
  cell?: [number, number, number][];
  pbc?: boolean[];
  species?: Record<string, string>;
  attributes?: Record<string, any>;
}

/**
 * A collection of atoms (a structure).
 */
export declare class Atoms {
  constructor(params?: AtomsConstructorParams);

  /** Unique identifier (if used) */
  uuid: any;
  /** Element symbols for each atom */
  symbols: string[];
  /** Positions for each atom */
  positions: [number, number, number][];
  /** Unit cell vectors */
  cell: [number, number, number][];
  /** Periodic boundary flags */
  pbc: boolean[];
  /** Map symbol→default element */
  species: Record<string, string>;
  /** Additional attributes */
  attributes: Record<string, any>;

  /** Set the cell vectors */
  setCell(cell: [number, number, number][]): void;
  /** Set the periodic boundary conditions */
  setPBC(pbc: boolean[]): void;
  /** True if cell is all zeros */
  isUndefinedCell(): boolean;
  /**
   * Initialize species map, filling missing symbols
   * @param species Map symbol→element
   * @param symbols List of symbols to ensure exist
   */
  setSpecies(species: Record<string, string>, symbols?: string[]): void;
  /**
   * Add or override a single specie entry
   * @param symbol  The element symbol
   * @param element The element (defaults to symbol)
   */
  addSpecie(symbol: string, element?: string): void;

  /** List all group names used by atom-level groups */
  listGroups(): string[];
  /** Get atom indices that belong to a group */
  getGroupIndices(group: string): number[];
  /** Add atoms to a group */
  addAtomsToGroup(indices: number[] | number, group: string): void;
  /** Remove atoms from a group */
  removeAtomsFromGroup(indices: number[] | number, group: string): void;
  /** Remove a group from all atoms, returns removed count */
  clearGroup(group: string): number;
}

/**
 * Parse an XYZ-format string into an Atoms object.
 */
export declare function parseXYZ(text: string): Atoms;

/**
 * Parse a CIF-format string into an Atoms object.
 */
export declare function parseCIF(text: string): Atoms;

/**
 * Parse a Cube-format string into an Atoms object.
 */
export declare function parseCube(text: string): Atoms;

/**
 * Parse an XSF-format string into an Atoms object.
 */
export declare function parseXSF(text: string): Atoms;

/**
 * Lookup table: element symbol → atomic number.
 */
export declare const elementAtomicNumbers: Record<string, number>;

/** Serialize atoms (or trajectory) to XYZ text */
export declare function atomsToXYZ(atoms: Atoms | Atoms[]): string;

/** Serialize atoms to CIF text */
export declare function atomsToCIF(atoms: Atoms): string;

/** Parse text into a structure payload based on extension */
export declare function parseStructureText(text: string, extension: string): { kind: string; data: any };

/** Apply a structure payload to a WEAS instance */
export declare function applyStructurePayload(weas: WEAS, payload: any): void;

/** Build a downloadable structure export payload */
export declare function buildExportPayload(weas: WEAS, format: string): { text: string; filename: string; mimeType: string };

/** Download a text blob */
export declare function downloadText(text: string, filename: string, mimeType?: string): void;
