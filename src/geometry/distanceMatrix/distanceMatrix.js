import init, {
  calculate_pairwise_distances,
} from "./wasm/pairwise_distances.js";

/**
 * SquaredDistanceMatrix
 *
 * Maintains a distance matrix of squared Euclidean distances between 3D points.
 * Uses a WebAssembly (WASM) module for efficient pairwise distance computation.
 *
 * Properties:
 *  - points: flat Float32Array storing all point coordinates [x0,y0,z0,x1,y1,z1,...]
 *  - n: number of points
 *  - distances: flat Float32Array of pairwise squared distances
 *  - lastCalcTime: time in milliseconds taken for the last distance matrix computation
 *
 * Static Properties:
 *  - wasmReady: boolean indicating whether the WASM module is initialized
 *  - wasmInitPromise: Promise resolving when WASM is initialized
 */
export class SquaredDistanceMatrix {
  static wasmReady = false;
  static wasmInitPromise = null;

  /**
   * Create a new SquaredDistanceMatrix instance.
   * Automatically initializes the WASM module on the first instance.
   *
   * @param {Array|Float32Array} points - initial point coordinates (flat array or nested arrays)
   */
  constructor(points = []) {
    this.points = Float32Array.from(points);
    this.n = this.points.length / 3;
    this.distances = new Float32Array(0);
    this.lastCalcTime = 0;

    // Initialize WASM module if not already done
    if (!SquaredDistanceMatrix.wasmReady) {
      if (!SquaredDistanceMatrix.wasmInitPromise) {
        SquaredDistanceMatrix.wasmInitPromise = init().then(() => {
          SquaredDistanceMatrix.wasmReady = true;
        });
      }
    }

    // Recompute distances after WASM is ready
    if (this.n > 0) {
      this._recomputeAll();
    }
  }

  /**
   * Ensure the WASM module is initialized.
   * @private
   */
  async _ensureWasmReady() {
    if (!SquaredDistanceMatrix.wasmReady) {
      await SquaredDistanceMatrix.wasmInitPromise;
    }
  }

  /**
   * Recompute the full pairwise squared distance matrix.
   * Updates `this.distances` and records `this.lastCalcTime`.
   * @private
   */
  async _recomputeAll() {
    const t0 = performance.now();
    await this._ensureWasmReady();
    this.distances = calculate_pairwise_distances(this.points);
    const t1 = performance.now();
    this.lastCalcTime = t1 - t0;
  }

  /**
   * Add multiple points to the matrix.
   * Automatically recalculates the full distance matrix.
   *
   * @param {Array|Float32Array} newPoints - array of points to add. Can be:
   *   - nested array [[x,y,z],[x,y,z],...]
   *   - flat array [x0,y0,z0,x1,y1,z1,...]
   *   - Float32Array
   */
  async addPoints(newPoints) {
    let flatPoints;

    if (newPoints instanceof Float32Array) {
      flatPoints = newPoints;
    } else if (Array.isArray(newPoints) && Array.isArray(newPoints[0])) {
      flatPoints = new Float32Array(newPoints.length * 3);
      for (let i = 0; i < newPoints.length; i++) {
        flatPoints.set(newPoints[i], i * 3);
      }
    } else if (Array.isArray(newPoints)) {
      flatPoints = new Float32Array(newPoints);
    } else {
      throw new Error("Invalid input for addPoints");
    }

    const combined = new Float32Array(this.points.length + flatPoints.length);
    combined.set(this.points);
    combined.set(flatPoints, this.points.length);
    this.points = combined;
    this.n = this.points.length / 3;

    await this._recomputeAll();
  }

  /**
   * Update a single point by index.
   * Automatically recalculates the full distance matrix.
   *
   * @param {number} i - index of the point to update
   * @param {Array<number>} coords - new coordinates for the point
   */
  async updatePoint(i, coords) {
    this.points.set(coords, i * 3);
    await this._recomputeAll();
  }

  /**
   * Add a single point to the matrix.
   *
   * @param {Array<number>} coords - coordinates of the point
   */
  async addPoint(coords) {
    await this.addPoints([coords]);
  }

  /**
   * Remove a point by index.
   * Automatically recalculates the full distance matrix.
   *
   * @param {number} index - index of the point to remove
   */
  async removePoint(index) {
    const newPoints = new Float32Array((this.n - 1) * 3);
    let p = 0;
    for (let i = 0; i < this.n; i++) {
      if (i === index) continue;
      newPoints.set(this.points.subarray(i * 3, i * 3 + 3), p);
      p += 3;
    }
    this.points = newPoints;
    this.n -= 1;
    await this._recomputeAll();
  }

  /**
   * Get the squared distance between two points by index.
   *
   * @param {number} i - index of the first point
   * @param {number} j - index of the second point
   * @returns {number} squared distance
   */
  get(i, j) {
    return this.distances[i * this.n + j];
  }
}
