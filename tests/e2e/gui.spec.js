import { test, expect } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test("Gui config", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/tests/e2e/testGui.html");

  await expect.soft(page).toHaveScreenshot();
});

test("Atom label", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/tests/e2e/testAtomLabel.html");

  await expect.soft(page).toHaveScreenshot();
});

test("Camera", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/tests/e2e/testCrystal.html");
  // open gui
  await page.evaluate(() => {
    window.editor.tjs.cameraType = "perspective";
  });
  await expect.soft(page).toHaveScreenshot("Camera-perspective.png");
});

test("Crystal", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/tests/e2e/testCrystal.html");
  await expect.soft(page).toHaveScreenshot();
});

test("Isosurface", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/tests/e2e/testIsosurface.html");
  await expect.soft(page).toHaveScreenshot();
  // open gui
  await page.evaluate(() => {
    window.editor.guiManager.gui.closed = false;
    window.editor.avr.isosurfaceManager.guiFolder.closed = false;
  });
  await expect.soft(page).toHaveScreenshot("Isosurface-gui.png");
  // reset isosurface
  await page.evaluate(() => {
    window.editor.avr.isosurfaceManager.reset();
    window.editor.tjs.render();
  });
  await expect.soft(page).toHaveScreenshot("Isosurface-reset.png");
});

test("VolumeSlice", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/tests/e2e/testVolumeSlice.html");
  await expect.soft(page).toHaveScreenshot();
  // reset slice
  await page.evaluate(() => {
    window.editor.avr.volumeSliceManager.reset();
    window.editor.tjs.render();
  });
  await expect.soft(page).toHaveScreenshot("VolumeSlice-reset.png");
});

test("VectorField", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/tests/e2e/testVectorField.html");
  await expect.soft(page).toHaveScreenshot();
  // hide vector field
  await page.evaluate(() => {
    window.editor.avr.VFManager.show = false;
    window.editor.tjs.render();
  });
  await expect.soft(page).toHaveScreenshot("VectorField-hide-vector.png");
});

test("ColorBy", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/tests/e2e/testColorBy.html");
  await expect.soft(page).toHaveScreenshot();
  // color by species
  await page.evaluate(() => {
    window.editor.avr.colorBy = "Element";
    window.editor.avr.atomManager.settings["C"].color = "##eb4034";
    window.editor.avr.atomManager.settings["H"].color = "#b434eb";
    window.editor.avr.atomManager.settings["O"].color = "#34eb77";
    window.editor.avr.atomManager.settings["S"].color = "#FFFF00";
    window.editor.avr.drawModels();
  });
  await expect.soft(page).toHaveScreenshot("Color-species.png");
});

test("Highlight Atoms", async ({ page }) => {
  // highlight selected atoms
  await page.goto("http://127.0.0.1:8080/tests/e2e/testHighlightAtoms.html");
  await expect.soft(page).toHaveScreenshot();
  // add another highlight
  await page.evaluate(() => {
    window.editor.avr.highlightManager.addSetting("sphere", { indices: [0, 1], color: "red", scale: 1.2 });
    window.editor.avr.drawModels();
  });
  await expect.soft(page).toHaveScreenshot("Highlight-sphere.png");
  // highlight using cross
  await page.evaluate(() => {
    window.editor.avr.highlightManager.addSetting("sphere", { indices: [0, 1], color: "red", scale: 1.3, type: "cross" });
    window.editor.avr.drawModels();
  });
  await expect.soft(page).toHaveScreenshot("Highlight-cross.png");
});

test("Highlight CrossView", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/tests/e2e/testHighlightCross2d.html");
  await expect.soft(page).toHaveScreenshot("Highlight-crossView.png");
});

test("Transform Axis", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/tests/e2e/testHighlightAtoms.html");
  await page.waitForFunction(() => window.editor);
  // focus the element
  const element = await page.$("#viewer");
  await element.focus();
  const boundingBox = await element.boundingBox();
  // Calculate the center of the element
  const centerX = boundingBox.x + boundingBox.width / 2;
  const centerY = boundingBox.y + boundingBox.height / 2;
  page.centerX = centerX;
  page.centerY = centerY;
  // Move the mouse to the center of the element
  await page.mouse.move(centerX, centerY);
  await page.evaluate(() => {
    const editor = window.editor;
    editor.avr.selectedAtomsIndices = [2, 4, 6, 7];
    editor.eventHandlers.currentMousePosition.set(300, 200);
    editor.eventHandlers.transformControls.enterMode("rotate", editor.eventHandlers.currentMousePosition);
    editor.selectionManager.axisAtomIndices = [0, 1];
    editor.selectionManager.showAxisVisuals();
    editor.selectionManager.updateAxisLine();
    editor.tjs.render();
  });
  await expect.soft(page).toHaveScreenshot("Transform-rotate-axis-pick.png");
  // mouse move to the center of the canvas element
  await page.mouse.move(page.centerX + 100, page.centerY);
  await page.mouse.click(page.centerX + 100, page.centerY);
  await expect.soft(page).toHaveScreenshot("Transform-rotate-axis-pick-move.png");

  await page.evaluate(() => {
    const editor = window.editor;
    editor.selectionManager.axisAtomIndices = [];
    editor.selectionManager.hideAxisVisuals();
    editor.eventHandlers.transformControls.setRotateAxisLock("x");
    editor.tjs.render();
  });
  await expect.soft(page).toHaveScreenshot("Transform-rotate-axis-lock.png");

  await page.evaluate(() => {
    const editor = window.editor;
    editor.eventHandlers.transformControls.exitMode();
    editor.eventHandlers.currentMousePosition.set(300, 200);
    editor.eventHandlers.transformControls.enterMode("translate", editor.eventHandlers.currentMousePosition);
    editor.eventHandlers.transformControls.setTranslateAxisLock("x");
    editor.tjs.render();
  });
  await expect.soft(page).toHaveScreenshot("Transform-translate-axis-lock.png");
  // mouse move to the center of the canvas element
  await page.mouse.move(page.centerX + 100, page.centerY);
  await page.mouse.click(page.centerX + 100, page.centerY);
  await expect.soft(page).toHaveScreenshot("Transform-translate-axis-lock-move.png");
});

test("Text Manager", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/tests/e2e/testTextManager.html");
  await expect.soft(page).toHaveScreenshot("TextManager.png");
});

test("Instanced Primitive", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/tests/e2e/testInstancedPrimitive.html");
  await expect.soft(page).toHaveScreenshot();
});

test("Any Mesh", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/tests/e2e/testAnyMesh.html");
  await expect.soft(page).toHaveScreenshot();
});

test("Viewer State Undo Redo", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/tests/e2e/testGui.html");
  await page.evaluate(() => {
    window.editor.avr.setState({ atomLabelType: "Symbol" }, { record: true, redraw: "labels" });
  });
  await expect(await page.evaluate(() => window.editor.ops.undoStack.length)).toBe(1);
  await expect(await page.evaluate(() => window.editor.ops.redoStack.length)).toBe(0);

  await page.evaluate(() => {
    window.editor.ops.undo();
  });
  await expect(await page.evaluate(() => window.editor.ops.undoStack.length)).toBe(0);
  await expect(await page.evaluate(() => window.editor.ops.redoStack.length)).toBe(1);

  await page.evaluate(() => {
    window.editor.ops.redo();
  });
  await expect(await page.evaluate(() => window.editor.ops.undoStack.length)).toBe(1);
  await expect(await page.evaluate(() => window.editor.ops.redoStack.length)).toBe(0);
});

test.describe("Edit", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://127.0.0.1:8080/tests/e2e/testHighlightAtoms.html");

    // focus the element
    const element = await page.$("#viewer");
    await element.focus();
    const boundingBox = await element.boundingBox();
    // Calculate the center of the element
    const centerX = boundingBox.x + boundingBox.width / 2;
    const centerY = boundingBox.y + boundingBox.height / 2;
    page.centerX = centerX;
    page.centerY = centerY;
    // Move the mouse to the center of the element
    await page.mouse.move(centerX, centerY);
  });

  test("Move Atoms", async ({ page }) => {
    // simulate keydown event
    await page.keyboard.press("g");
    // mouse move to the center of the canvas element
    await page.mouse.move(page.centerX + 100, page.centerY);
    await page.mouse.click(page.centerX + 100, page.centerY);
    await expect.soft(page).toHaveScreenshot();
  });

  test("Rotate Atoms", async ({ page }) => {
    await page.mouse.move(page.centerX + 100, page.centerY);
    await page.keyboard.press("r");
    // mouse move to the center of the canvas element
    await page.mouse.move(page.centerX + 100, page.centerY - 200);
    await page.mouse.click(page.centerX + 100, page.centerY - 200);
    await expect.soft(page).toHaveScreenshot();
  });

  test("Delete Atoms", async ({ page }) => {
    await page.keyboard.press("Delete");
    await expect.soft(page).toHaveScreenshot();
  });

  test("Duplicate Atoms", async ({ page }) => {
    await page.keyboard.press("d");
    await page.keyboard.press("g");
    // mouse move to the center of the canvas element
    await page.mouse.move(page.centerX + 100, page.centerY);
    await page.mouse.click(page.centerX + 100, page.centerY);
    await expect.soft(page).toHaveScreenshot();
  });

  test("Undo Redos", async ({ page }) => {
    // simulate keydown event
    await page.keyboard.press("g");
    // mouse move to the center of the canvas element
    await page.mouse.move(page.centerX + 100, page.centerY);
    await page.mouse.click(page.centerX + 100, page.centerY);
    await expect.soft(page).toHaveScreenshot();
    // delete
    await page.keyboard.press("Delete");
    await expect.soft(page).toHaveScreenshot();
    // undo
    await page.keyboard.down("Control");
    await page.keyboard.press("z");
    await expect.soft(page).toHaveScreenshot();
    // undo
    const element = await page.$("#undo");
    await element.click();
    await expect.soft(page).toHaveScreenshot();
    // redo
    await page.keyboard.down("Control");
    await page.keyboard.press("y");
    await expect.soft(page).toHaveScreenshot();
    // redo
    const element2 = await page.$("#redo");
    await element2.click();
    await expect.soft(page).toHaveScreenshot();
  });

  test("Escape", async ({ page }) => {
    // simulate keydown event
    await page.keyboard.press("g");
    // mouse move to the center of the canvas element
    await page.mouse.move(page.centerX + 100, page.centerY);
    await page.keyboard.press("Escape");
    await expect.soft(page).toHaveScreenshot();
  });
});

test.describe("Edit Object", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://127.0.0.1:8080/tests/e2e/testPrimitive.html");
    // focus the element
    const element = await page.$("#viewer");
    await element.focus();
    const boundingBox = await element.boundingBox();
    // Calculate the center of the element
    const centerX = boundingBox.x + boundingBox.width / 2;
    const centerY = boundingBox.y + boundingBox.height / 2;
    page.centerX = centerX;
    page.centerY = centerY;
    // Move the mouse to the center of the element
    await page.mouse.move(centerX, centerY);
  });

  test("Mesh Primitive", async ({ page }) => {
    await expect.soft(page).toHaveScreenshot();
  });

  test("Move Object", async ({ page }) => {
    // simulate keydown event
    await page.keyboard.press("g");
    // mouse move to the center of the canvas element
    await page.mouse.move(page.centerX + 100, page.centerY);
    await page.mouse.click(page.centerX + 100, page.centerY);
    await expect.soft(page).toHaveScreenshot();
  });

  test("Rotate Object", async ({ page }) => {
    await page.mouse.move(page.centerX + 100, page.centerY);
    await page.keyboard.press("r");
    // mouse move to the center of the canvas element
    await page.mouse.move(page.centerX + 100, page.centerY - 200);
    await page.mouse.click(page.centerX + 100, page.centerY - 200);
    await expect.soft(page).toHaveScreenshot();
  });

  test("Delete Object", async ({ page }) => {
    await page.keyboard.press("Delete");
    await expect.soft(page).toHaveScreenshot();
  });

  test("Scale Object", async ({ page }) => {
    await page.mouse.move(page.centerX + 100, page.centerY);
    await page.keyboard.press("s");
    // mouse move to the center of the canvas element
    await page.mouse.move(page.centerX + 100, page.centerY - 200);
    await page.mouse.click(page.centerX + 100, page.centerY - 200);
    await expect.soft(page).toHaveScreenshot();
  });

  test("Duplicate Object", async ({ page }) => {
    await page.keyboard.press("d");
    await page.keyboard.press("g");
    // mouse move to the center of the canvas element
    await page.mouse.move(page.centerX + 100, page.centerY);
    await page.mouse.click(page.centerX + 100, page.centerY);
    await expect.soft(page).toHaveScreenshot();
  });
});

test.describe("Selection", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://127.0.0.1:8080/tests/e2e/testSelection.html");

    // focus the element
    const element = await page.$("#viewer");
    await element.focus();
    const boundingBox = await element.boundingBox();
    // Calculate the center of the element
    const centerX = boundingBox.x + boundingBox.width / 2;
    const centerY = boundingBox.y + boundingBox.height / 2;
    page.centerX = centerX;
    page.centerY = centerY;
    // Move the mouse to the center of the element
    await page.mouse.move(centerX, centerY);
  });

  test("Inside Selection", async ({ page }) => {
    await expect.soft(page).toHaveScreenshot();
  });

  test("Move Selected", async ({ page }) => {
    // simulate keydown event
    await page.keyboard.press("g");
    // mouse move to the center of the canvas element
    await page.mouse.move(page.centerX - 100, page.centerY);
    await page.mouse.click(page.centerX - 100, page.centerY);
    await expect.soft(page).toHaveScreenshot();
  });
});

test.describe("Animation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://127.0.0.1:8080/tests/e2e/testAnimation.html");

    // focus the element
    const element = await page.$("#viewer");
    await element.focus();
    const boundingBox = await element.boundingBox();
    // Calculate the center of the element
    const centerX = boundingBox.x + boundingBox.width / 2;
    const centerY = boundingBox.y + boundingBox.height / 2;
    page.centerX = centerX;
    page.centerY = centerY;
    // Move the mouse to the center of the element
    await page.mouse.move(centerX, centerY);
  });

  test("Undo Redos", async ({ page }) => {
    await expect.soft(page).toHaveScreenshot("Animation-frame-0.png");
    // simulate keydown event
    await page.keyboard.press("g");
    // mouse move to the center of the canvas element
    await page.mouse.move(page.centerX + 100, page.centerY);
    await page.mouse.click(page.centerX + 100, page.centerY);
    // current frame is 0, add name toHaveScreenshot
    await expect.soft(page).toHaveScreenshot("Animation-frame-0-move.png");
    // set frame 10
    await page.evaluate(() => {
      const timeline = document.getElementById("timeline");
      timeline.value = 10;
      // Creating and dispatching the event must happen within the page context
      const event = new Event("input", {
        bubbles: true,
        cancelable: true,
      });
      timeline.dispatchEvent(event);
    });
    await expect.soft(page).toHaveScreenshot("Animation-frame-10.png");
    //move atoms
    await page.keyboard.press("g");
    // mouse move to the center of the canvas element
    await page.mouse.move(page.centerX + 200, page.centerY);
    await page.mouse.click(page.centerX + 200, page.centerY);
    await expect.soft(page).toHaveScreenshot("Animation-frame-10-move.png");
    // undo
    await page.keyboard.down("Control");
    await page.keyboard.press("z");
    await expect.soft(page).toHaveScreenshot("Animation-frame-10-undo.png");
    // undo, should go back to frame 0
    const element = await page.$("#undo");
    await element.click();
    await expect.soft(page).toHaveScreenshot("Animation-frame-0-undo.png");
    // redo
    await page.keyboard.down("Control");
    await page.keyboard.press("y");
    await expect.soft(page).toHaveScreenshot("Animation-frame-0-redo.png");
    // redo
    await page.waitForSelector("#redo", { state: "attached" });
    const element2 = await page.$("#redo");
    await element2.click();
    await expect.soft(page).toHaveScreenshot("Animation-frame-10-redo.png");
  });
});

test.describe("Measurement", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://127.0.0.1:8080/tests/e2e/testMeasurement.html");

    // focus the element
    const element = await page.$("#viewer");
    await element.focus();
    const boundingBox = await element.boundingBox();
    // Calculate the center of the element
    const centerX = boundingBox.x + boundingBox.width / 2;
    const centerY = boundingBox.y + boundingBox.height / 2;
    page.centerX = centerX;
    page.centerY = centerY;
    // Move the mouse to the center of the element
    await page.mouse.move(centerX, centerY);
  });

  test("Measurement", async ({ page }) => {
    // simulate keydown event
    await page.keyboard.press("m");
    await expect.soft(page).toHaveScreenshot("Measurement-bond-length.png");
    // select atoms
    await page.evaluate(() => {
      window.editor.avr.selectedAtomsIndices = [0, 1, 7];
    });
    await page.keyboard.press("m");
    await expect.soft(page).toHaveScreenshot("Measurement-bond-angle.png");
    // select atoms
    await page.evaluate(() => {
      window.editor.avr.selectedAtomsIndices = [0, 1, 2, 7];
    });
    await page.keyboard.press("m");
    await expect.soft(page).toHaveScreenshot("Measurement-dihedral-angle.png");
    // select no atoms
    await page.evaluate(() => {
      window.editor.avr.selectedAtomsIndices = [];
    });
    await page.keyboard.press("m");
    await expect.soft(page).toHaveScreenshot("Measurement-no-measurement.png");
  });
});

test.describe("Phonon", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://127.0.0.1:8080/tests/e2e/testPhonon.html");

    // focus the element
    const element = await page.$("#viewer");
    await element.focus();
    const boundingBox = await element.boundingBox();
    // Calculate the center of the element
    const centerX = boundingBox.x + boundingBox.width / 2;
    const centerY = boundingBox.y + boundingBox.height / 2;
    page.centerX = centerX;
    page.centerY = centerY;
    // Move the mouse to the center of the element
    await page.mouse.move(centerX, centerY);
  });

  test("Frame", async ({ page }) => {
    await page.evaluate(() => {
      window.editor.avr.pause();
      const timeline = document.getElementById("timeline");
      timeline.value = 0;
      // Creating and dispatching the event must happen within the page context
      const event = new Event("input", {
        bubbles: true,
        cancelable: true,
      });
      timeline.dispatchEvent(event);
    });
    await expect.soft(page).toHaveScreenshot("Phonon-frame-0.png");
    // change model style
    await page.evaluate(() => {
      window.editor.avr.modelStyle = 0;
      window.editor.avr.drawModels();
    });
    await expect.soft(page).toHaveScreenshot("Phonon-change-modelStyle.png");
    // set frame 10
    await page.evaluate(() => {
      const timeline = document.getElementById("timeline");
      timeline.value = 10;
      // Creating and dispatching the event must happen within the page context
      const event = new Event("input", {
        bubbles: true,
        cancelable: true,
      });
      timeline.dispatchEvent(event);
    });
    await expect.soft(page).toHaveScreenshot("Phonon-frame-10.png");
  });
});

test("Cell", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/tests/e2e/testCell.html");
  await expect.soft(page).toHaveScreenshot("Cell-frame-0.png");
  // animation cell
  await page.evaluate(() => {
    const timeline = document.getElementById("timeline");
    timeline.value = 10;
    // Creating and dispatching the event must happen within the page context
    const event = new Event("input", {
      bubbles: true,
      cancelable: true,
    });
    timeline.dispatchEvent(event);
  });
  await expect.soft(page).toHaveScreenshot("Cell-frame-10.png");
  // hide cell
  await page.evaluate(() => {
    window.editor.avr.cellManager.showCell = false;
    window.editor.tjs.render();
  });
  await expect.soft(page).toHaveScreenshot("Cell-hide.png");
});

test("Polyhedra", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/tests/e2e/testPolyhedra.html");
  await expect.soft(page).toHaveScreenshot("Polyhedra-frame-0.png");
  // animation Polyhedra
  await page.evaluate(() => {
    const timeline = document.getElementById("timeline");
    timeline.value = 10;
    // Creating and dispatching the event must happen within the page context
    const event = new Event("input", {
      bubbles: true,
      cancelable: true,
    });
    timeline.dispatchEvent(event);
  });
  await expect.soft(page).toHaveScreenshot("Polyhedra-frame-10.png");
});

test("Ops", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/tests/e2e/testOps.html");
  await expect.soft(page).toHaveScreenshot("Ops-replace.png");
  // invert selection
  await page.evaluate(() => {
    window.editor.ops.selection.InvertSelection();
  });
  await expect.soft(page).toHaveScreenshot("Ops-invert-selection.png");
  // translate
  await page.evaluate(() => {
    window.editor.ops.transform.TranslateOperation({ vector: [1, 0, 0] });
  });
  await expect.soft(page).toHaveScreenshot("Ops-translate.png");
  // add atom
  await page.evaluate(() => {
    window.editor.ops.atoms.AddAtomOperation({ symbol: "Pt", position: { x: -1, y: 1, z: 1 } });
  });
  await expect.soft(page).toHaveScreenshot("Ops-add-atom.png");
  // color by index
  await page.evaluate(() => {
    window.editor.ops.atoms.ColorByAttribute({ attribute: "Index", color1: "#00ff00", color2: "#0000ff" });
  });
  await expect.soft(page).toHaveScreenshot("Ops-color-by-index.png");
});

test("Groups", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/tests/e2e/testOps.html");
  await page.waitForFunction(() => window.editor);
  const result = await page.evaluate(() => {
    window.editor.ops.atoms.AddAtomsToGroupOperation({ group: "mol", indices: [0, 1, 2] });
    window.editor.ops.selection.SelectByGroup({ group: "mol" });
    const selected = window.editor.state.get("viewer.selectedAtomsIndices") || [];
    return {
      selected: selected.slice().sort((a, b) => a - b),
      groups: window.editor.avr.atoms.listGroups(),
    };
  });
  expect(result.groups).toContain("mol");
  expect(result.selected).toEqual([0, 1, 2]);
});

test("Download and import", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/tests/e2e/testIO.html");
  await page.waitForFunction(() => window.editor);

  const downloadPromise = page.waitForEvent("download");
  await page.click("#export");
  await page.getByRole("button", { name: "State (JSON)" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("weas-state.json");

  const filePath = path.resolve(__dirname, "../../demo/datas/c2h6so.xyz");
  const [chooser] = await Promise.all([page.waitForEvent("filechooser"), page.click("#import")]);
  await chooser.setFiles(filePath);
  await page.waitForFunction(() => window.editor.avr?.atoms?.symbols?.length > 0);
  const atomCount = await page.evaluate(() => window.editor.avr.atoms.symbols.length);
  expect(atomCount).toBeGreaterThan(0);
});

test("Species", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/tests/e2e/testSpecies.html");
  await expect.soft(page).toHaveScreenshot("Species.png");
});

test("Bond", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/tests/e2e/testBond.html");
  await expect.soft(page).toHaveScreenshot("Bond-frame-0.png");
  // hydrogen bond
  await page.evaluate(() => {
    window.editor.avr.bondManager.showHydrogenBonds = true;
    window.editor.avr.drawModels();
  });
  await expect.soft(page).toHaveScreenshot("Bond-hydrogen-bond.png");
  // bond settings
  await page.evaluate(() => {
    delete window.editor.avr.bondManager.settings["N-H"];
    window.editor.avr.drawModels();
  });
  await expect.soft(page).toHaveScreenshot("Bond-delete-bond-pair.png");
  // bond outside boundary
  await page.evaluate(() => {
    window.editor.avr.bondManager.showOutBoundaryBonds = true;
    window.editor.avr.drawModels();
  });
  await expect.soft(page).toHaveScreenshot("Bond-outside-boundary.png");
});

test("ModelStyle", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/tests/e2e/testModelStyle.html");
  await expect.soft(page).toHaveScreenshot("ModelStyle.png");
});
