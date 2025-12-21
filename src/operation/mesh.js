import { BaseOperation } from "./baseOperation.js";
import { drawCube, drawPlane, drawCylinder, drawIcosahedron, drawCone, drawSphere, drawTorus, drawArrow } from "../tools/primitives.js";
import { clearObject } from "../utils.js";

class BaseMeshOperation extends BaseOperation {
  constructor(weas, data, drawFunction) {
    super(weas);
    this.data = arrayToVector3(data);
    this.drawFunction = drawFunction;
    this.object = null;
    this.uiFields = {
      title: this.constructor.description,
      fields: buildMeshFields(this.data),
    };
  }

  execute() {
    const data = vector3ToArray(this.data);
    this.object = this.drawFunction(data);
    this.weas.tjs.scene.add(this.object);
  }

  undo() {
    clearObject(this.weas.tjs.scene, this.object);
  }

  adjust(params) {
    if (!this.validateParams(params)) {
      return;
    }
    this.undo();
    this.applyParams(params);
    this.execute();
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

  constructor({
    weas,
    position = { x: 0, y: 0, z: 0 },
    direction = { x: 0, y: 0, z: 1 },
    arrowLength = 1,
    arrowRadius = 0.05,
    coneHeight = 0.2,
    coneRadius = 0.1,
    color = "#bd0d87",
    materialType = "Standard",
  }) {
    super(weas, { position, direction, arrowLength, arrowRadius, coneHeight, color, coneRadius, materialType }, drawArrow);
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

function buildMeshFields(data) {
  const fields = {
    positionX: { type: "number", min: -10, max: 10, step: 0.1, path: "data.position.x" },
    positionY: { type: "number", min: -10, max: 10, step: 0.1, path: "data.position.y" },
    positionZ: { type: "number", min: -10, max: 10, step: 0.1, path: "data.position.z" },
  };
  if (data.size !== undefined) {
    fields.size = { type: "number", min: 0.1, max: 10, step: 0.1, path: "data.size" };
  }
  if (data.radius !== undefined) {
    fields.radius = { type: "number", min: 0.1, max: 10, step: 0.1, path: "data.radius" };
  }
  if (data.depth !== undefined) {
    fields.depth = { type: "number", min: 0.1, max: 10, step: 0.1, path: "data.depth" };
  }
  if (data.height !== undefined) {
    fields.height = { type: "number", min: 0.1, max: 10, step: 0.1, path: "data.height" };
  }
  if (data.segments !== undefined) {
    fields.segments = { type: "number", min: 3, max: 32, step: 1, path: "data.segments" };
  }
  if (data.detail !== undefined) {
    fields.detail = { type: "number", min: 0, max: 5, step: 1, path: "data.detail" };
  }
  if (data.direction !== undefined) {
    fields.directionX = { type: "number", min: -1, max: 1, step: 0.01, path: "data.direction.x" };
    fields.directionY = { type: "number", min: -1, max: 1, step: 0.01, path: "data.direction.y" };
    fields.directionZ = { type: "number", min: -1, max: 1, step: 0.01, path: "data.direction.z" };
  }
  if (data.length !== undefined) {
    fields.length = { type: "number", min: 0.1, max: 10, step: 0.1, path: "data.length" };
  }
  if (data.arrowLength !== undefined) {
    fields.arrowLength = { type: "number", min: 0.1, max: 10, step: 0.1, path: "data.arrowLength" };
  }
  if (data.arrowRadius !== undefined) {
    fields.arrowRadius = { type: "number", min: 0.01, max: 2, step: 0.01, path: "data.arrowRadius" };
  }
  if (data.coneHeight !== undefined) {
    fields.coneHeight = { type: "number", min: 0.1, max: 10, step: 0.1, path: "data.coneHeight" };
  }
  if (data.coneRadius !== undefined) {
    fields.coneRadius = { type: "number", min: 0.1, max: 10, step: 0.1, path: "data.coneRadius" };
  }
  if (data.tube !== undefined) {
    fields.tube = { type: "number", min: 0.1, max: 10, step: 0.1, path: "data.tube" };
  }
  if (data.radialSegments !== undefined) {
    fields.radialSegments = { type: "number", min: 3, max: 32, step: 1, path: "data.radialSegments" };
  }
  if (data.tubularSegments !== undefined) {
    fields.tubularSegments = { type: "number", min: 3, max: 32, step: 1, path: "data.tubularSegments" };
  }
  if (data.widthSegments !== undefined) {
    fields.widthSegments = { type: "number", min: 3, max: 32, step: 1, path: "data.widthSegments" };
  }
  if (data.heightSegments !== undefined) {
    fields.heightSegments = { type: "number", min: 3, max: 32, step: 1, path: "data.heightSegments" };
  }
  if (data.scale !== undefined) {
    fields.scaleX = { type: "number", min: 0.1, max: 10, step: 0.1, path: "data.scale.x" };
    fields.scaleY = { type: "number", min: 0.1, max: 10, step: 0.1, path: "data.scale.y" };
    fields.scaleZ = { type: "number", min: 0.1, max: 10, step: 0.1, path: "data.scale.z" };
  }
  if (data.color !== undefined) {
    fields.color = { type: "color", path: "data.color" };
  }
  if (data.materialType !== undefined) {
    fields.materialType = { type: "select", options: ["Standard", "Phong", "Basic"], path: "data.materialType" };
  }
  return fields;
}

export { AddCubeOperation, AddPlaneOperation, AddCylinderOperation, AddIcosahedronOperation, AddConeOperation, AddSphereOperation, AddTorusOperation, AddArrowOperation };
