import { test, expect } from "@playwright/test";

test("Gui config", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/tests/e2e/testGui.html");

  await expect(page).toHaveScreenshot();
});

test("Crystal", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/tests/e2e/testCrystal.html");
  await expect(page).toHaveScreenshot();
});

test("Isosurface", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/tests/e2e/testIsosurface.html");
  await expect(page).toHaveScreenshot();
});

test("VectorField", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/tests/e2e/testVectorField.html");
  await expect(page).toHaveScreenshot();
});

test("ColorBy", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/tests/e2e/testColorBy.html");
  await expect(page).toHaveScreenshot();
});

test("Highlight Atoms", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/tests/e2e/testHighlightAtoms.html");
  await expect(page).toHaveScreenshot();
});

test("Instanced Primitive", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/tests/e2e/testInstancedPrimitive.html");
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
