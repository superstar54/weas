export const materialSchemas = {
  MeshBasicMaterial: [
    { prop: "opacity", type: "number", min: 0, max: 1, step: 0.01, level: "editable" },
  ],
  MeshStandardMaterial: [
    { prop: "metalness", type: "number", min: 0, max: 1, step: 0.01, level: "editable" },
    { prop: "roughness", type: "number", min: 0, max: 1, step: 0.01, level: "editable" },
    { prop: "envMapIntensity", type: "number", min: 0, max: 5, step: 0.01, level: "advanced" },
  ],
  MeshPhongMaterial: [
    { prop: "shininess", type: "number", min: 0, max: 300, step: 1, level: "editable" },
    { prop: "reflectivity", type: "number", min: 0, max: 1, step: 0.01, level: "advanced" },
    { prop: "specular", type: "color", level: "advanced" },
  ],
};