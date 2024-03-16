import { BaseOperation, renameFolder } from "./baseOperation.js";
import { elementAtomicNumbers } from "../atoms/atoms_data.js";
import { colorBys } from "../config.js";

class ReplaceOperation extends BaseOperation {
  static description = "Replace atoms";
  static category = "Edit";

  constructor({ weas, element = "C", indices = null }) {
    super(weas);
    this.indices = indices ? indices : Array.from(this.weas.avr.selectedAtomsIndices);
    this.element = element;
    // .copy() provides a fresh instance for restoration
    this.initialAtoms = weas.avr.atoms.copy();
  }

  execute() {
    this.weas.avr.replaceSelectedAtoms(this.element, this.indices);
  }

  undo() {
    console.log("undo replace");
    this.weas.avr.atoms = this.initialAtoms.copy();
  }

  adjust(newElement) {
    if (!(newElement in elementAtomicNumbers)) {
      return;
    }
    this.element = newElement;
    this.execute(); // Re-execute with the new element
  }

  setupGUI(guiFolder) {
    //
    renameFolder(guiFolder, "Replace");

    guiFolder
      .add(this, "element", "H")
      .name("Element")
      .onChange((value) => {
        this.adjust(this.element);
      });
  }
}

class AddAtomOperation extends BaseOperation {
  static description = "Add atom";
  static category = "Edit";

  constructor({ weas, element = "C", position = { x: 0, y: 0, z: 0 } }) {
    super(weas);
    // this.weas.avr.selectedAtomsIndices is a set
    this.position = position;
    this.element = element;
    this.initialAtoms = weas.avr.atoms.copy();
  }

  execute() {
    this.weas.avr.addAtom(this.element, this.position);
  }

  undo() {
    console.log("undo add atom");
    this.weas.avr.atoms = this.initialAtoms.copy();
  }

  adjust(newElement, newPosition) {
    // if newElement in elementAtomicNumbers, ship the adjustment
    if (!(newElement in elementAtomicNumbers)) {
      return;
    }
    this.weas.avr.atoms = this.initialAtoms.copy();
    this.element = newElement;
    this.position = newPosition;
    this.execute(); // Re-execute with the new element
  }

  setupGUI(guiFolder) {
    //
    renameFolder(guiFolder, "Add");

    guiFolder
      .add(this, "element", "C")
      .name("Element")
      .onChange((value) => {
        this.adjust(value, this.position);
      });
    guiFolder
      .add(this.position, "x", -10, 10)
      .name("X-axis")
      .onChange((value) => {
        this.adjust(this.element, { ...this.position, x: value });
      });
    guiFolder
      .add(this.position, "y", -10, 10)
      .name("Y-axis")
      .onChange((value) => {
        this.adjust(this.element, { ...this.position, y: value });
      });
    guiFolder
      .add(this.position, "z", -10, 10)
      .name("Z-axis")
      .onChange((value) => {
        this.adjust(this.element, { ...this.position, z: value });
      });
  }
}

class ColorByAttribute extends BaseOperation {
  static description = "Color by attribute";
  static category = "Color";

  constructor({ weas, attribute = "Element", color1 = "#ff0000", color2 = "#0000ff" }) {
    super(weas);
    // weas.meshPrimitive.settings is a array of objects
    // deep copy it to avoid modifying the original settings
    this.attribute = attribute;
    this.color1 = color1;
    this.color2 = color2;
    // store previous colorBy attribute, and colorRamp
    this.previousAttribute = weas.colorBy;
    this.previousColorRamp = weas.colorRamp;
    // key of this.weas.avr.atoms.attributues['atom'] + colorBys
    this.attributeKeys = Object.keys(this.weas.avr.atoms.attributes["atom"]).concat(Object.keys(colorBys));
  }

  execute() {
    // add cube to settings
    this.weas._colorRamp = [this.color1, this.color2];
    this.weas.colorBy = this.attribute;
    this.weas.drawModels();
  }

  undo() {
    console.log("undo color by attribute");
    this.weas._colorRamp = this.previousColorRamp;
    this.weas.colorBy = this.previousAttribute;
    this.weas.drawModels();
  }

  adjust() {
    // if colorBy not in colorBys, and colorBy not in the atoms.attributes["atom"], return
    if (!(this.attribute in colorBys) && !(this.attribute in this.weas.avr.atoms.attributes["atom"])) {
      return;
    }
    this.execute();
  }

  setupGUI(guiFolder) {
    //
    renameFolder(guiFolder, "Color by attribute");

    guiFolder.add({ attribute: this.attribute }, "attribute", this.attributeKeys).onChange((value) => {
      this.attribute = value;
      this.adjust();
    });
    guiFolder
      .addColor(this, "color1")
      .name("Color1")
      .onChange((value) => {
        this.color1 = value;
        this.adjust();
      });
    guiFolder
      .addColor(this, "color2")
      .name("Color2")
      .onChange((value) => {
        this.color2 = value;
        this.adjust();
      });
  }
}

export { ReplaceOperation, AddAtomOperation, ColorByAttribute };
