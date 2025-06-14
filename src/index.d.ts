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
  /** Selection manager */
  readonly selectionManager: any;
  /** Object manager */
  readonly objectManager: any;
  /** The atoms viewer plugin */
  readonly avr: AtomsViewer;
  /** Instanced mesh primitive plugin */
  readonly instancedMeshPrimitive: any;
  /** AnyMesh plugin */
  readonly anyMesh: any;

  constructor(options: WEASOptions);

  /** Initialize state and render once */
  initialize(): void;

  /** Render the current scene */
  render(): void;

  /** Clear all objects from the scene */
  clear(): void;
}

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
  constructor(options: AtomsViewerOptions);
  /** Render the atoms */
  render(): void;
  /** Optional cleanup */
  destroy?(): void;
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
