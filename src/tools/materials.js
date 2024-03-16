import * as THREE from "three";

const defaultColor = 0xffffff;

const phongMaterial = new THREE.MeshPhongMaterial({
  color: defaultColor,
  specular: 0x222222,
  shininess: 100,
  reflectivity: 0.9, // Reflectivity strength for the environment map
});
const standarMaterial = new THREE.MeshStandardMaterial({
  metalness: 0.1,
  roughness: 0.01,
  envMapIntensity: 1.0,
});

const basicMaterial = new THREE.MeshBasicMaterial({
  color: new THREE.Color(0xffff00), // Yellow color
  transparent: true, // Make it transparent
  opacity: 1, // Set the transparency level (0.0 to 1.0)
});

export const materials = { Phong: phongMaterial, Standard: standarMaterial, Basic: basicMaterial };
