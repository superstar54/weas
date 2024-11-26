import * as THREE from "three";

export default class AtomsLegend {
  constructor(viewer, guiConfig) {
    this.viewer = viewer;
    this.guiConfig = guiConfig;
    this.legendSprites = [];

    if (this.guiConfig.legend && this.guiConfig.legend.enabled) {
      this.addLegend();
    }
  }

  addLegend() {
    // Remove existing legend if any
    this.removeLegend();

    // Starting coordinates for legend entries in normalized device coordinates (NDC)
    let xStart, yStart;
    const xOffset = 2; // Adjust spacing
    const yOffset = -2; // Adjust spacing

    // Determine position based on configuration
    const position = this.guiConfig.legend.position || "top-right";
    switch (position) {
      case "top-left":
        xStart = -0.9;
        yStart = 0.9;
        break;
      case "top-right":
        xStart = 0.7;
        yStart = 0.9;
        break;
      case "bottom-left":
        xStart = -0.9;
        yStart = -0.7;
        break;
      case "bottom-right":
        xStart = -5;
        yStart = -2;
        break;
      default:
        xStart = 0.7;
        yStart = 0.9;
        break;
    }

    // Create legend entries
    let entryIndex = 0;
    // max radius of settings
    const maxRadius = this.viewer.atomManager.getMaxRadius();
    const minRadius = this.viewer.atomManager.getMinRadius();
    console.log("maxRadius: ", maxRadius);
    console.log("minRadius: ", minRadius);

    Object.entries(this.viewer.atomManager.settings).forEach(([symbol, setting]) => {
      const message = `${symbol}`;

      // Create text sprite
      const textSprite = createTextSprite(message, {
        fontsize: 96, // Adjust as needed
        fontface: "Arial",
        textColor: { r: 0, g: 0, b: 0, a: 1.0 },
        backgroundColor: { r: 255, g: 255, b: 255, a: 0.0 },
        scale: 1.5,
      });

      // Create circle sprite
      const color = typeof setting.color === "string" ? new THREE.Color(setting.color) : setting.color;

      const scale = Math.min(2.0, Math.max(1, setting.radius));
      console.log("scale: ", scale);
      const circleSprite = createCircleSprite(color, { scale: scale });

      // Position sprites
      const yPosition = yStart - entryIndex * yOffset;
      circleSprite.position.set(xStart, yPosition, -1);
      textSprite.position.set(xStart + xOffset, yPosition, -1);

      // Add sprites to the camera
      this.viewer.tjs.legendScene.add(circleSprite);
      this.viewer.tjs.legendScene.add(textSprite);

      this.legendSprites.push(circleSprite, textSprite);

      entryIndex += 1;
    });
  }

  removeLegend() {
    if (this.legendSprites.length > 0) {
      this.legendSprites.forEach((sprite) => {
        this.viewer.tjs.legendScene.remove(sprite);
        sprite.material.map.dispose();
        sprite.material.dispose();
        // No geometry to dispose for sprites
      });
      this.legendSprites = [];
    }
  }

  updateLegend() {
    if (this.guiConfig.legend && this.guiConfig.legend.enabled) {
      this.addLegend();
    } else {
      this.removeLegend();
    }
  }
}

function createCircleSprite(color, parameters = {}) {
  const radius = parameters.radius || 32;

  const canvas = document.createElement("canvas");
  const size = radius * 2;
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d");
  context.beginPath();
  context.arc(radius, radius, radius - 2, 0, 2 * Math.PI, false);
  context.fillStyle = `#${color.getHexString()}`;
  context.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(spriteMaterial);

  // Scale the sprite
  const scaleFactor = parameters.scale || 0.1; // Adjust based on desired size
  sprite.scale.set(scaleFactor, scaleFactor, 1);

  return sprite;
}

function createTextSprite(message, parameters = {}) {
  const fontface = parameters.fontface || "Arial";
  const fontsize = parameters.fontsize || 96;
  const borderThickness = parameters.borderThickness || 0;
  const borderColor = parameters.borderColor || { r: 0, g: 0, b: 0, a: 1.0 };
  const backgroundColor = parameters.backgroundColor || { r: 255, g: 255, b: 255, a: 0.0 };
  const textColor = parameters.textColor || { r: 0, g: 0, b: 0, a: 1.0 };

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  context.font = `${fontsize}px ${fontface}`;

  // Measure the text size
  const metrics = context.measureText(message);
  const textWidth = metrics.width;
  const textHeight = fontsize;

  // Adjust canvas size based on text
  canvas.width = textWidth + borderThickness * 2;
  canvas.height = textHeight + borderThickness * 2;

  // Background
  context.fillStyle = `rgba(${backgroundColor.r},${backgroundColor.g},${backgroundColor.b},${backgroundColor.a})`;
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Border
  if (borderThickness > 0) {
    context.strokeStyle = `rgba(${borderColor.r},${borderColor.g},${borderColor.b},${borderColor.a})`;
    context.lineWidth = borderThickness;
    context.strokeRect(0, 0, canvas.width, canvas.height);
  }

  // Text
  context.fillStyle = `rgba(${textColor.r},${textColor.g},${textColor.b},${textColor.a})`;
  context.font = `${fontsize}px ${fontface}`;
  context.textBaseline = "top";
  context.fillText(message, borderThickness, borderThickness);

  // Create texture
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  // Create sprite material
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture });

  // Create sprite
  const sprite = new THREE.Sprite(spriteMaterial);

  // Scale the sprite
  const scaleFactor = parameters.scale || 1;
  sprite.scale.set((scaleFactor * canvas.width) / canvas.height, scaleFactor, 1);

  return sprite;
}
