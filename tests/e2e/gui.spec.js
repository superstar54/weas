import { test, expect } from "@playwright/test";

test("Gui config", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/tests/e2e/testGui.html");

  await expect(page).toHaveScreenshot();
});

test("Camera", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/tests/e2e/testCrystal.html");
  // open gui
  await page.evaluate(() => {
    window.editor.tjs.cameraType = "perspective";
  });
  await expect(page).toHaveScreenshot("Camera-perspective.png");
});

test("Crystal", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/tests/e2e/testCrystal.html");
  await expect(page).toHaveScreenshot();
});

test("Isosurface", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/tests/e2e/testIsosurface.html");
  await expect(page).toHaveScreenshot();
  // open gui
  await page.evaluate(() => {
    window.editor.guiManager.gui.closed = false;
    window.editor.avr.isosurfaceManager.guiFolder.closed = false;
  });
  await expect(page).toHaveScreenshot("Isosurface-gui.png");
  // reset isosurface
  await page.evaluate(() => {
    window.editor.avr.isosurfaceManager.reset();
    window.editor.tjs.render();
  });
  await expect(page).toHaveScreenshot("Isosurface-reset.png");
});

test("VolumeSlice", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/tests/e2e/testVolumeSlice.html");
  await expect(page).toHaveScreenshot();
  // reset slice
  await page.evaluate(() => {
    window.editor.avr.volumeSliceManager.reset();
    window.editor.tjs.render();
  });
  await expect(page).toHaveScreenshot("VolumeSlice-reset.png");
});

test("VectorField", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/tests/e2e/testVectorField.html");
  await expect(page).toHaveScreenshot();
  // hide vector field
  await page.evaluate(() => {
    window.editor.avr.VFManager.show = false;
    window.editor.tjs.render();
  });
  await expect(page).toHaveScreenshot("VectorField-hide-vector.png");
});

test("ColorBy", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/tests/e2e/testColorBy.html");
  await expect(page).toHaveScreenshot();
  // color by species
  await page.evaluate(() => {
    window.editor.avr.colorBy = "Element";
    window.editor.avr.atomManager.settings["C"].color = "##eb4034";
    window.editor.avr.atomManager.settings["H"].color = "#b434eb";
    window.editor.avr.atomManager.settings["O"].color = "#34eb77";
    window.editor.avr.atomManager.settings["S"].color = "#FFFF00";
    window.editor.avr.drawModels();
  });
  await expect(page).toHaveScreenshot("Color-species.png");
});

test("Highlight Atoms", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/tests/e2e/testHighlightAtoms.html");
  await expect(page).toHaveScreenshot();
});

test("Instanced Primitive", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/tests/e2e/testInstancedPrimitive.html");
  await expect(page).toHaveScreenshot();
});

test("Any Mesh", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/tests/e2e/testAnyMesh.html");
  await expect(page).toHaveScreenshot();
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
    await expect(page).toHaveScreenshot();
  });

  test("Rotate Atoms", async ({ page }) => {
    await page.mouse.move(page.centerX + 100, page.centerY);
    await page.keyboard.press("r");
    // mouse move to the center of the canvas element
    await page.mouse.move(page.centerX + 100, page.centerY - 200);
    await page.mouse.click(page.centerX + 100, page.centerY - 200);
    await expect(page).toHaveScreenshot();
  });

  test("Delete Atoms", async ({ page }) => {
    await page.keyboard.press("Delete");
    await expect(page).toHaveScreenshot();
  });

  test("Duplicate Atoms", async ({ page }) => {
    await page.keyboard.press("d");
    await page.keyboard.press("g");
    // mouse move to the center of the canvas element
    await page.mouse.move(page.centerX + 100, page.centerY);
    await page.mouse.click(page.centerX + 100, page.centerY);
    await expect(page).toHaveScreenshot();
  });

  test("Undo Redos", async ({ page }) => {
    // simulate keydown event
    await page.keyboard.press("g");
    // mouse move to the center of the canvas element
    await page.mouse.move(page.centerX + 100, page.centerY);
    await page.mouse.click(page.centerX + 100, page.centerY);
    await expect(page).toHaveScreenshot();
    // delete
    await page.keyboard.press("Delete");
    await expect(page).toHaveScreenshot();
    // undo
    await page.keyboard.down("Control");
    await page.keyboard.press("z");
    await expect(page).toHaveScreenshot();
    // undo
    const element = await page.$("#undo");
    await element.click();
    await expect(page).toHaveScreenshot();
    // redo
    await page.keyboard.down("Control");
    await page.keyboard.press("y");
    await expect(page).toHaveScreenshot();
    // redo
    const element2 = await page.$("#redo");
    await element2.click();
    await expect(page).toHaveScreenshot();
  });

  test("Escape", async ({ page }) => {
    // simulate keydown event
    await page.keyboard.press("g");
    // mouse move to the center of the canvas element
    await page.mouse.move(page.centerX + 100, page.centerY);
    await page.keyboard.press("Escape");
    await expect(page).toHaveScreenshot();
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
    await expect(page).toHaveScreenshot();
  });

  test("Move Object", async ({ page }) => {
    // simulate keydown event
    await page.keyboard.press("g");
    // mouse move to the center of the canvas element
    await page.mouse.move(page.centerX + 100, page.centerY);
    await page.mouse.click(page.centerX + 100, page.centerY);
    await expect(page).toHaveScreenshot();
  });

  test("Rotate Object", async ({ page }) => {
    await page.mouse.move(page.centerX + 100, page.centerY);
    await page.keyboard.press("r");
    // mouse move to the center of the canvas element
    await page.mouse.move(page.centerX + 100, page.centerY - 200);
    await page.mouse.click(page.centerX + 100, page.centerY - 200);
    await expect(page).toHaveScreenshot();
  });

  test("Delete Object", async ({ page }) => {
    await page.keyboard.press("Delete");
    await expect(page).toHaveScreenshot();
  });

  test("Scale Object", async ({ page }) => {
    await page.mouse.move(page.centerX + 100, page.centerY);
    await page.keyboard.press("s");
    // mouse move to the center of the canvas element
    await page.mouse.move(page.centerX + 100, page.centerY - 200);
    await page.mouse.click(page.centerX + 100, page.centerY - 200);
    await expect(page).toHaveScreenshot();
  });

  test("Duplicate Object", async ({ page }) => {
    await page.keyboard.press("d");
    await page.keyboard.press("g");
    // mouse move to the center of the canvas element
    await page.mouse.move(page.centerX + 100, page.centerY);
    await page.mouse.click(page.centerX + 100, page.centerY);
    await expect(page).toHaveScreenshot();
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
    await expect(page).toHaveScreenshot();
  });

  test("Move Selected", async ({ page }) => {
    // simulate keydown event
    await page.keyboard.press("g");
    // mouse move to the center of the canvas element
    await page.mouse.move(page.centerX - 100, page.centerY);
    await page.mouse.click(page.centerX - 100, page.centerY);
    await expect(page).toHaveScreenshot();
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
    await expect(page).toHaveScreenshot("Animation-frame-0.png");
    // simulate keydown event
    await page.keyboard.press("g");
    // mouse move to the center of the canvas element
    await page.mouse.move(page.centerX + 100, page.centerY);
    await page.mouse.click(page.centerX + 100, page.centerY);
    // current frame is 0, add name toHaveScreenshot
    await expect(page).toHaveScreenshot("Animation-frame-0-move.png");
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
    await expect(page).toHaveScreenshot("Animation-frame-10.png");
    //move atoms
    await page.keyboard.press("g");
    // mouse move to the center of the canvas element
    await page.mouse.move(page.centerX + 200, page.centerY);
    await page.mouse.click(page.centerX + 200, page.centerY);
    await expect(page).toHaveScreenshot("Animation-frame-10-move.png");
    // undo
    await page.keyboard.down("Control");
    await page.keyboard.press("z");
    await expect(page).toHaveScreenshot("Animation-frame-10-undo.png");
    // undo, should go back to frame 0
    const element = await page.$("#undo");
    await element.click();
    await expect(page).toHaveScreenshot("Animation-frame-0-undo.png");
    // redo
    await page.keyboard.down("Control");
    await page.keyboard.press("y");
    await expect(page).toHaveScreenshot("Animation-frame-0-redo.png");
    // redo
    await page.waitForSelector("#redo", { state: "attached" });
    const element2 = await page.$("#redo");
    await element2.click();
    await expect(page).toHaveScreenshot("Animation-frame-10-redo.png");
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
    await expect(page).toHaveScreenshot("Measurement-bond-length.png");
    // select atoms
    await page.evaluate(() => {
      window.editor.avr.selectedAtomsIndices = [0, 1, 7];
    });
    await page.keyboard.press("m");
    await expect(page).toHaveScreenshot("Measurement-bond-angle.png");
    // select atoms
    await page.evaluate(() => {
      window.editor.avr.selectedAtomsIndices = [0, 1, 2, 7];
    });
    await page.keyboard.press("m");
    await expect(page).toHaveScreenshot("Measurement-dihedral-angle.png");
    // select no atoms
    await page.evaluate(() => {
      window.editor.avr.selectedAtomsIndices = [];
    });
    await page.keyboard.press("m");
    await expect(page).toHaveScreenshot("Measurement-no-measurement.png");
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
    await expect(page).toHaveScreenshot("Phonon-frame-0.png");
    // change model style
    await page.evaluate(() => {
      window.editor.avr.modelStyle = 0;
      window.editor.avr.drawModels();
    });
    await expect(page).toHaveScreenshot("Phonon-change-modelStyle.png");
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
    await expect(page).toHaveScreenshot("Phonon-frame-10.png");
  });
});

test("Cell", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/tests/e2e/testCell.html");
  await expect(page).toHaveScreenshot("Cell-frame-0.png");
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
  await expect(page).toHaveScreenshot("Cell-frame-10.png");
  // hide cell
  await page.evaluate(() => {
    window.editor.avr.showCell = false;
    window.editor.tjs.render();
  });
  await expect(page).toHaveScreenshot("Cell-hide.png");
});

test("Ops", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/tests/e2e/testOps.html");
  await expect(page).toHaveScreenshot("Ops-replace.png");
  // invert selection
  await page.evaluate(() => {
    window.editor.ops.selection.InvertSelection();
  });
  await expect(page).toHaveScreenshot("Ops-invert-selection.png");
  // translate
  await page.evaluate(() => {
    window.editor.ops.transform.TranslateOperation({ vector: [1, 0, 0] });
  });
  await expect(page).toHaveScreenshot("Ops-translate.png");
  // add atom
  await page.evaluate(() => {
    window.editor.ops.atoms.AddAtomOperation({ symbol: "Pt", position: { x: -1, y: 1, z: 1 } });
  });
  await expect(page).toHaveScreenshot("Ops-add-atom.png");
});

test("Species", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/tests/e2e/testSpecies.html");
  await expect(page).toHaveScreenshot("Species.png");
});

test("Bond", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/tests/e2e/testBond.html");
  await expect(page).toHaveScreenshot("Bond-frame-0.png");
  // hydrogen bond
  await page.evaluate(() => {
    window.editor.avr.bondManager.showHydrogenBonds = true;
    window.editor.avr.drawModels();
  });
  await expect(page).toHaveScreenshot("Bond-hydrogen-bond.png");
  // bond settings
  await page.evaluate(() => {
    delete window.editor.avr.bondManager.settings["N-H"];
    window.editor.avr.drawModels();
  });
  await expect(page).toHaveScreenshot("Bond-delete-bond-pair.png");
});

test("ModelStyle", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/tests/e2e/testModelStyle.html");
  await expect(page).toHaveScreenshot("ModelStyle.png");
});
