// Helper function to perform vector dot product
function vec_dot(a, b) {
  return a.reduce((sum, value, index) => sum + value * b[index], 0);
}

// Helper function to create a complex number in polar form
function complexPolar(magnitude, angle) {
  return {
    real: magnitude * Math.cos(angle),
    imag: magnitude * Math.sin(angle),
    mult(other) {
      return {
        real: this.real * other.real - this.imag * other.imag,
        imag: this.real * other.imag + this.imag * other.real,
      };
    },
  };
}

export class Phonon {
  constructor(atoms, kpoint = null, eigenvectors = null, addatomphase = true) {
    this.atoms = atoms;
    this.kpoint = kpoint;
    this.eigenvectors = eigenvectors;
    this.addatomphase = addatomphase;
    this.vibrations = [];
  }

  // Compute initial phases and vibrations
  calculateVibrations(repeat = [1, 1, 1]) {
    const [nx, ny, nz] = repeat;
    const fractional_positions = this.atoms.calculateFractionalCoordinates();
    const natoms = this.atoms.positions.length;
    let atom_phase = [];

    if (this.addatomphase) {
      atom_phase = fractional_positions.map((position) => vec_dot(this.kpoint, position));
    } else {
      atom_phase = new Array(natoms).fill(0);
    }
    for (let ix = 0; ix < nx; ix++) {
      for (let iy = 0; iy < ny; iy++) {
        for (let iz = 0; iz < nz; iz++) {
          for (let i = 0; i < natoms; i++) {
            let sprod = vec_dot(this.kpoint, [ix, iy, iz]) + atom_phase[i];
            let phase = complexPolar(1.0, sprod * 2.0 * Math.PI);
            this.vibrations.push(this.eigenvectors[i].map((vector) => phase.mult({ real: vector[0], imag: vector[1] })));
          }
        }
      }
    }
  }

  // Get the trajectory of the phonon mode
  getTrajectory(amplitude, nframes, kpoint = null, eigenvectors = null, atoms = null, repeat = [1, 1, 1], addatomphase = null) {
    if (atoms) {
      this.atoms = atoms;
    }
    if (kpoint) {
      this.kpoint = kpoint;
    }
    if (eigenvectors) {
      this.eigenvectors = eigenvectors;
    }
    if (this.kpoint === null || this.eigenvectors === null) {
      throw new Error("kpoint and eigenvectors must be provided");
    }
    if (addatomphase !== null) {
      this.addatomphase = addatomphase;
    }

    this.calculateVibrations(repeat);
    const trajectory = [];
    const times = Array.from({ length: nframes }, (_, i) => 2 * Math.PI * (i / nframes));
    times.forEach((t) => {
      const newAtoms = this.atoms.multiply(...repeat);
      let phase = complexPolar(amplitude, t);
      const movement = [];
      for (let i = 0; i < newAtoms.positions.length; i++) {
        let displacement = this.vibrations[i].map((v) => phase.mult(v).real);
        newAtoms.positions[i] = newAtoms.positions[i].map((pos, index) => pos + displacement[index] / 5);
        movement.push(displacement);
      }
      newAtoms.newAttribute("movement", movement);
      // update the movement attribute by kpoint

      trajectory.push(newAtoms);
    });
    return trajectory;
  }
}
