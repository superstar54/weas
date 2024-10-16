import * as THREE from "three";

export function getAtomColors(atoms, colorBy, params) {
  /*Get the color array for atoms based on the colorBy and colorType
    Args:
        atoms: Object, the atoms object
        colorBy: String, the colorBy option
        params: Object, the parameters for colorBy
    Returns:
        colors: Float32Array, the color array for atoms
  */

  let colors = [];
  let color;
  // console.log("colorBy: ", colorBy);
  // console.log("params: ", params);
  if (colorBy === "Random") {
    colors = [];
    atoms.symbols.forEach((symbol, globalIndex) => {
      color = new THREE.Color(Math.random() * 0xffffff);
      colors.push(color);
    });
  } else if (colorBy === "Uniform") {
    colors = [];
    atoms.symbols.forEach((symbol, globalIndex) => {
      color = new THREE.Color(params.colorRamp[0]);
      colors.push(color);
    });
  } else if (colorBy === "Index") {
    colors = [];
    // indices is an array of integers from 0 to atoms.symbols.length
    const indices = atoms.symbols.map((_, index) => index);
    return getColorsFromArray(indices, params.colorRamp);
  }
  // other attributes
  else if (colorBy in atoms.attributes["atom"]) {
    const values = atoms.attributes["atom"][colorBy];
    // if values is an array of arrays, then it is a vector, and we need to calculate the magnitude
    if (values.length > 0 && values[0].length) {
      const magnitudes = values.map((value) => Math.sqrt(value.reduce((acc, val) => acc + val ** 2, 0)));
      return getColorsFromArray(magnitudes, params.colorRamp);
    }
    return getColorsFromArray(values, params.colorRamp);
  }
  return colors;
}

function getColorsFromArray(values, colorRamp) {
  const colors = [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  // Calculate the number of segments based on the colorRamp length
  const segments = colorRamp.length - 1;

  values.forEach((value) => {
    const normalizedValue = (value - min) / range;
    // Determine which segment the value falls into
    const segmentIndex = Math.min(Math.floor(normalizedValue * segments), segments - 1);
    // Calculate how far along the segment the value is
    const segmentProgress = (normalizedValue - segmentIndex / segments) * segments;

    // Interpolate colors within the segment
    const color1 = new THREE.Color(colorRamp[segmentIndex]);
    const color2 = new THREE.Color(colorRamp[segmentIndex + 1]);
    const color = new THREE.Color(color1.r, color1.g, color1.b).lerp(color2, segmentProgress);

    colors.push(color);
  });

  return colors;
}
