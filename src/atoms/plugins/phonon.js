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

// Helper function to multiply complex numbers
function complexMult(complex, phase) {
  return phase.mult({ real: complex[0], imag: complex[1] });
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
  calculateVibrations() {
    const fractional_positions = this.atoms.calculateFractionalCoordinates();
    const natoms = this.atoms.positions.length;
    let atom_phase = [];

    if (this.addatomphase) {
      atom_phase = fractional_positions.map((position) => vec_dot(this.kpoint, position));
    } else {
      atom_phase = new Array(natoms).fill(0);
    }
    console.log("atom_phase: ", atom_phase);

    for (let i = 0; i < natoms; i++) {
      let sprod = atom_phase[i];
      let phase = complexPolar(1.0, sprod * 2.0 * Math.PI);
      this.vibrations.push(this.eigenvectors[i].map((vector) => complexMult(vector, phase)));
    }
    console.log("vibrations: ", this.vibrations);
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

    this.calculateVibrations();
    const trajectory = [];
    const times = Array.from({ length: nframes }, (_, i) => 2 * Math.PI * (i / nframes));
    times.forEach((t) => {
      const newAtoms = this.atoms.copy();
      let phase = complexPolar(amplitude, t);
      const movement = [];
      for (let i = 0; i < this.atoms.positions.length; i++) {
        let displacement = this.vibrations[i].map((v) => phase.real * v.real);
        newAtoms.positions[i] = this.atoms.positions[i].map((pos, index) => pos + displacement[index] / 5);
        movement.push(displacement);
      }
      newAtoms.newAttribute("movement", movement);
      trajectory.push(newAtoms.multiply(...repeat));
    });
    return trajectory;
  }
}
