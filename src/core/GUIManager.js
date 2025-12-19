import { GUI } from "dat.gui";
import { setupCameraGUI } from "../tools/camera.js";
import { createViewpointButtons } from "../tools/viewpoint.js";
import { defaultGuiConfig } from "../config.js";

class GUIManager {
  constructor(weas, guiConfig) {
    this.weas = weas;
    this.guiConfig = { ...defaultGuiConfig, ...guiConfig };
    this.gui = new GUI();
    this.gui.closed = true;
    this.downloadAnimationButton = null;

    if (!this.guiConfig.controls.enabled) {
      this.gui.hide();
    } else {
      this.initGUI();
    }

    if (this.guiConfig.buttons.enabled) {
      this.addButtons();
    }
  }

  initGUI() {
    this.createGUIContainer();
    if (this.guiConfig.controls.cameraControls) {
      this.addCameraControls();
    }
  }

  createGUIContainer() {
    const guiContainer = document.createElement("div");
    guiContainer.style.position = "absolute";
    guiContainer.style.top = "10px";
    guiContainer.style.left = "10px";
    this.weas.tjs.containerElement.appendChild(guiContainer);
    guiContainer.appendChild(this.gui.domElement);
    // Stop propagation of mouse and keyboard events from the GUI container
    // e.g., when user input "r", it will not trigger the rotate event.
    const stopPropagation = (e) => e.stopPropagation();
    ["click", "keydown", "keyup", "keypress"].forEach((eventType) => {
      guiContainer.addEventListener(eventType, stopPropagation, false);
    });
  }

  addCameraControls() {
    createViewpointButtons(this.weas, this.gui);
    setupCameraGUI(this.weas.tjs, this.gui, this.weas.tjs.camera);
  }

  addButtons() {
    const buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex";
    buttonContainer.style.position = "absolute";
    buttonContainer.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
    buttonContainer.style.padding = "10px";
    buttonContainer.style.borderRadius = "5px";
    buttonContainer.style.right = "5px";
    buttonContainer.style.top = "5px";
    buttonContainer.style.gap = "5px";
    // Add event listeners to stop propagation
    const stopPropagation = (event) => event.stopPropagation();
    buttonContainer.addEventListener("click", stopPropagation);
    buttonContainer.addEventListener("mousedown", stopPropagation);
    buttonContainer.addEventListener("mouseup", stopPropagation);
    this.weas.tjs.containerElement.appendChild(buttonContainer);

    // Conditional creation of buttons based on the configuration
    if (this.guiConfig.buttons.fullscreen) {
      const expandSVG = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512">
            <path d="M32 32C14.3 32 0 46.3 0 64v96c0 17.7 14.3 32 32 32s32-14.3 32-32V96h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H32zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7 14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H64V352zM320 32c-17.7 0-32 14.3-32 32s14.3 32 32 32h64v64c0 17.7 14.3 32 32 32s32-14.3 32-32V64c0-17.7-14.3-32-32-32H320zM448 352c0-17.7-14.3-32-32-32s-32 14.3-32 32v64H320c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32V352z"/>
          </svg>
      `;
      const compressSVG = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512">
            <path d="M160 64c0-17.7-14.3-32-32-32s-32 14.3-32 32v64H32c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32V64zM32 320c-17.7 0-32 14.3-32 32s14.3 32 32 32H96v64c0 17.7 14.3 32 32 32s32-14.3 32-32V352c0-17.7-14.3-32-32-32H32zM352 64c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7 14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H352V64zM320 320c-17.7 0-32 14.3-32 32v96c0 17.7 14.3 32 32 32s32-14.3 32-32V384h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H320z"/>
          </svg>
      `;
      const fullscreenButton = this.createButton(expandSVG, "fullscreen");
      buttonContainer.appendChild(fullscreenButton);
      fullscreenButton.addEventListener("click", () => {
        if (!document.fullscreenElement) {
          this.weas.tjs.containerElement.requestFullscreen().catch((err) => {
            alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
          });
          fullscreenButton.innerHTML = compressSVG;
        } else {
          document.exitFullscreen();
          fullscreenButton.innerHTML = expandSVG;
        }
      });
    }

    if (this.guiConfig.buttons.undo) {
      const undoSVG = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512">
            <path d="M125.7 160H176c17.7 0 32 14.3 32 32s-14.3 32-32 32H48c-17.7 0-32-14.3-32-32V64c0-17.7 14.3-32 32-32s32 14.3 32 32v51.2L97.6 97.6c87.5-87.5 229.3-87.5 316.8 0s87.5 229.3 0 316.8s-229.3 87.5-316.8 0c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0c62.5 62.5 163.8 62.5 226.3 0s62.5-163.8 0-226.3s-163.8-62.5-226.3 0L125.7 160z"/>
          </svg>
      `;
      const undoButton = this.createButton(undoSVG, "undo");
      buttonContainer.appendChild(undoButton);

      undoButton.addEventListener("click", () => {
        this.weas.ops.undo();
      });
    }
    if (this.guiConfig.buttons.redo) {
      const redoSVG = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512">
            <path d="M386.3 160H336c-17.7 0-32 14.3-32 32s14.3 32 32 32H464c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32s-32 14.3-32 32v51.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0s-87.5 229.3 0 316.8s229.3 87.5 316.8 0c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0c-62.5 62.5-163.8 62.5-226.3 0s-62.5-163.8 0-226.3s163.8-62.5 226.3 0L386.3 160z"/>
          </svg>
      `;
      const redoButton = this.createButton(redoSVG, "redo");
      buttonContainer.appendChild(redoButton);
      redoButton.addEventListener("click", () => {
        this.weas.ops.redo();
      });
    }
    if (this.guiConfig.buttons.download) {
      const downloadSVG = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512">
            <path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V274.7l-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7V32zM64 352c-35.3 0-64 28.7-64 64v32c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V416c0-35.3-28.7-64-64-64H346.5l-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352H64zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/>
          </svg>
      `;
      const downloadButton = this.createButton(downloadSVG, "download");
      buttonContainer.appendChild(downloadButton);
      downloadButton.addEventListener("click", () => {
        this.weas.tjs.downloadImage();
      });
    }
    if (this.guiConfig.buttons.downloadAnimation) {
      const filmSVG = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="14" height="14" rx="2"/>
            <path d="M17 7l4-2v14l-4-2z"/>
            <circle cx="10" cy="11" r="3" fill="currentColor" stroke="none"/>
          </svg>
      `;
      const downloadAnimationButton = this.createButton(filmSVG, "downloadAnimation");
      buttonContainer.appendChild(downloadAnimationButton);
      downloadAnimationButton.addEventListener("click", () => {
        this.weas.downloadAnimation();
      });
      downloadAnimationButton.style.display = "none";
      this.downloadAnimationButton = downloadAnimationButton;
    }
    if (this.guiConfig.buttons.measurement) {
      const measurementSVG = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512">
            <path d="M177.9 494.1c-18.7 18.7-49.1 18.7-67.9 0L17.9 401.9c-18.7-18.7-18.7-49.1 0-67.9l50.7-50.7 48 48c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-48-48 41.4-41.4 48 48c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-48-48 41.4-41.4 48 48c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-48-48 41.4-41.4 48 48c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-48-48 50.7-50.7c18.7-18.7 49.1-18.7 67.9 0l92.1 92.1c18.7 18.7 18.7 49.1 0 67.9L177.9 494.1z"/>
          </svg>
      `;
      const measurementButton = this.createButton(measurementSVG, "measurement");
      buttonContainer.appendChild(measurementButton);
      measurementButton.addEventListener("click", () => {
        this.weas.avr.Measurement.measure(this.weas.avr.selectedAtomsIndices);
      });
    }
  }

  createButton(html, id = "button") {
    const button = document.createElement("button");
    button.id = id;
    button.innerHTML = html;
    this.setStyle(button);
    return button;
  }

  setStyle(button) {
    const styleConfig = this.guiConfig.buttonStyle || {};
    for (const [key, value] of Object.entries(styleConfig)) {
      button.style[key] = value;
    }
  }

  setDownloadAnimationVisible(isVisible) {
    if (!this.downloadAnimationButton) {
      return;
    }
    this.downloadAnimationButton.style.display = isVisible ? "" : "none";
  }
}

export { GUIManager };
