import { BaseOperation, renameFolder } from "./baseOperation.js";
import { drawCube, drawPlane, drawCylinder, drawIcosahedron, drawCone, drawSphere, drawTorus, drawArrow } from "../tools/primitives.js";
import { clearObject } from "../utils.js";

class BaseMeshOperation extends BaseOperation {
  constructor(weas, data, drawFunction) {
    super(weas);
    this.data = arrayToVector3(data);
    this.drawFunction = drawFunction;
    this.object = null;
  }

  execute() {
    const data = vector3ToArray(this.data);
    console.log("data: ", data);
    this.object = this.drawFunction(data);
    console.log("object: ", this.object);
    this.weas.tjs.scene.add(this.object);
  }

  undo() {
    clearObject(this.weas.tjs.scene, this.object);
  }

  adjust() {
    this.undo();
    this.execute();
  }

  setupGUI(guiFolder) {
    renameFolder(guiFolder, this.constructor.description);
    guiFolder
      .add(this.data.position, "x", -10, 10)
      .name("X-axis")
      .onChange(() => this.adjust());
    guiFolder
      .add(this.data.position, "y", -10, 10)
      .name("Y-axis")
      .onChange(() => this.adjust());
    guiFolder
      .add(this.data.position, "z", -10, 10)
      .name("Z-axis")
      .onChange(() => this.adjust());
    if (this.data.size !== undefined) {
      guiFolder
        .add(this.data, "size", 0.1, 10)
        .name("Size")
        .onChange(() => this.adjust());
    }
    if (this.data.radius !== undefined) {
      guiFolder
        .add(this.data, "radius", 0.1, 10)
        .name("Radius")
        .onChange(() => this.adjust());
    }
    if (this.data.depth !== undefined) {
      guiFolder
        .add(this.data, "depth", 0.1, 10)
        .name("Depth")
        .onChange(() => this.adjust());
    }
    if (this.data.segments !== undefined) {
      guiFolder
        .add(this.data, "segments", 3, 32)
        .name("Segments")
        .onChange(() => this.adjust());
    }
    if (this.data.detail !== undefined) {
      guiFolder
        .add(this.data, "detail", 0, 5)
        .name("Detail")
        .onChange(() => this.adjust());
    }
    if (this.data.direction !== undefined) {
      guiFolder
        .add(this.data.direction, "x", -1, 1)
        .name("X-direction")
        .onChange(() => this.adjust());
      guiFolder
        .add(this.data.direction, "y", -1, 1)
        .name("Y-direction")
        .onChange(() => this.adjust());
      guiFolder
        .add(this.data.direction, "z", -1, 1)
        .name("Z-direction")
        .onChange(() => this.adjust());
    }
    if (this.data.length !== undefined) {
      guiFolder
        .add(this.data, "length", 0.1, 10)
        .name("Length")
        .onChange(() => this.adjust());
    }
    if (this.data.tube !== undefined) {
      guiFolder
        .add(this.data, "tube", 0.1, 10)
        .name("Tube")
        .onChange(() => this.adjust());
    }
    if (this.data.radialSegments !== undefined) {
      guiFolder
        .add(this.data, "radialSegments", 3, 32)
        .name("Radial segments")
        .onChange(() => this.adjust());
    }
    if (this.data.tubularSegments !== undefined) {
      guiFolder
        .add(this.data, "tubularSegments", 3, 32)
        .name("Tubular segments")
        .onChange(() => this.adjust());
    }
    if (this.data.widthSegments !== undefined) {
      guiFolder
        .add(this.data, "widthSegments", 3, 32)
        .name("Width segments")
        .onChange(() => this.adjust());
    }
    if (this.data.heightSegments !== undefined) {
      guiFolder
        .add(this.data, "heightSegments", 3, 32)
        .name("Height segments")
        .onChange(() => this.adjust());
    }
    if (this.data.scale !== undefined) {
      guiFolder
        .add(this.data.scale, "x", 0.1, 10)
        .name("X-scale")
        .onChange(() => this.adjust());
      guiFolder
        .add(this.data.scale, "y", 0.1, 10)
        .name("Y-scale")
        .onChange(() => this.adjust());
      guiFolder
        .add(this.data.scale, "z", 0.1, 10)
        .name("Z-scale")
        .onChange(() => this.adjust());
    }
    guiFolder
      .addColor(this.data, "color")
      .name("Color")
      .onChange(() => this.adjust());
  }
}

class AddCubeOperation extends BaseMeshOperation {
  static description = "Add cube";
  static category = "Mesh";

  constructor({ weas, position = { x: 0, y: 0, z: 0 }, size = 2, scale = { x: 1, y: 1, z: 1 }, rotation = { x: 0, y: 0, z: 0 }, color = "#bd0d87", materialType = "Standard" }) {
    super(weas, { position, size, scale, rotation, color, materialType }, drawCube);
  }
}

class AddPlaneOperation extends BaseMeshOperation {
  static description = "Add plane";
  static category = "Mesh";

  constructor({ weas, position = { x: 0, y: 0, z: 0 }, size = 2, scale = { x: 1, y: 1, z: 1 }, rotation = { x: 0, y: 0, z: 0 }, color = "#bd0d87", materialType = "Standard" }) {
    super(weas, { position, size, scale, rotation, color, materialType }, drawPlane);
  }
}

class AddCylinderOperation extends BaseMeshOperation {
  static description = "Add cylinder";
  static category = "Mesh";

  constructor({
    weas,
    position = { x: 0, y: 0, z: 0 },
    radius = 1,
    depth = 2,
    segments = 8,
    scale = { x: 1, y: 1, z: 1 },
    rotation = { x: 0, y: 0, z: 0 },
    color = "#bd0d87",
    materialType = "Standard",
  }) {
    super(weas, { position, radius, depth, segments, scale, rotation, color, materialType }, drawCylinder);
  }
}

class AddIcosahedronOperation extends BaseMeshOperation {
  static description = "Add icosahedron";
  static category = "Mesh";

  constructor({ weas, position = { x: 0, y: 0, z: 0 }, radius = 1, detail = 2, scale = { x: 1, y: 1, z: 1 }, rotation = { x: 0, y: 0, z: 0 }, color = "#bd0d87", materialType = "Standard" }) {
    super(weas, { position, radius, detail, scale, rotation, color, materialType }, drawIcosahedron);
  }
}

class AddConeOperation extends BaseMeshOperation {
  static description = "Add cone";
  static category = "Mesh";

  constructor({
    weas,
    position = { x: 0, y: 0, z: 0 },
    segments = 8,
    radius = 1,
    height = 2,
    scale = { x: 1, y: 1, z: 1 },
    rotation = { x: 0, y: 0, z: 0 },
    color = "#bd0d87",
    materialType = "Standard",
  }) {
    super(weas, { position, segments, radius, height, scale, rotation, color, materialType }, drawCone);
  }
}

class AddSphereOperation extends BaseMeshOperation {
  static description = "Add sphere";
  static category = "Mesh";

  constructor({
    weas,
    position = { x: 0, y: 0, z: 0 },
    widthSegments = 16,
    heightSegments = 12,
    radius = 1,
    scale = { x: 1, y: 1, z: 1 },
    rotation = { x: 0, y: 0, z: 0 },
    color = "#bd0d87",
    materialType = "Standard",
  }) {
    super(weas, { position, widthSegments, heightSegments, radius, scale, rotation, color, materialType }, drawSphere);
  }
}

class AddTorusOperation extends BaseMeshOperation {
  static description = "Add torus";
  static category = "Mesh";

  constructor({
    weas,
    position = { x: 0, y: 0, z: 0 },
    radius = 1,
    tube = 0.4,
    radialSegments = 8,
    tubularSegments = 24,
    scale = { x: 1, y: 1, z: 1 },
    rotation = { x: 0, y: 0, z: 0 },
    color = "#bd0d87",
    materialType = "Standard",
  }) {
    super(weas, { position, radius, tube, radialSegments, tubularSegments, scale, rotation, color, materialType }, drawTorus);
  }
}

class AddArrowOperation extends BaseMeshOperation {
  static description = "Add arrow";
  static category = "Mesh";

  constructor({ weas, position = { x: 0, y: 0, z: 0 }, direction = { x: 0, y: 0, z: 1 }, length = 4, radius = 0.2, color = "#bd0d87", materialType = "Standard" }) {
    super(weas, { position, direction, length, radius, color, materialType }, drawArrow);
  }
}

function arrayToVector3(data) {
  // change all arrays (position, scale, rotation) inside the data form [0, 0, 0] to {x: 0, y: 0, z: 0}
  // if position exists and is an array, convert it to object
  if (data.position && Array.isArray(data.position)) {
    data.position = { x: data.position[0], y: data.position[1], z: data.position[2] };
  }
  if (data.scale && Array.isArray(data.scale)) {
    data.scale = { x: data.scale[0], y: data.scale[1], z: data.scale[2] };
  }
  if (data.rotation && Array.isArray(data.rotation)) {
    data.rotation = { x: data.rotation[0], y: data.rotation[1], z: data.rotation[2] };
  }
  if (data.direction && Array.isArray(data.direction)) {
    data.direction = { x: data.direction[0], y: data.direction[1], z: data.direction[2] };
  }
  return data;
}

function vector3ToArray(data) {
  // change all objects (position, scale, rotation) inside the data form {x: 0, y: 0, z: 0} to [0, 0, 0]
  // if position exists and is an object, convert it to array
  const newdata = { ...data };
  if (data.position && !Array.isArray(data.position)) {
    newdata.position = [data.position.x, data.position.y, data.position.z];
  }
  if (data.scale && !Array.isArray(data.scale)) {
    newdata.scale = [data.scale.x, data.scale.y, data.scale.z];
  }
  if (data.rotation && !Array.isArray(data.rotation)) {
    newdata.rotation = [data.rotation.x, data.rotation.y, data.rotation.z];
  }
  if (data.direction && !Array.isArray(data.direction)) {
    newdata.direction = [data.direction.x, data.direction.y, data.direction.z];
  }
  return newdata;
}

export { AddCubeOperation, AddPlaneOperation, AddCylinderOperation, AddIcosahedronOperation, AddConeOperation, AddSphereOperation, AddTorusOperation, AddArrowOperation };
