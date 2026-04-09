import { test, expect } from "@playwright/test";

const keyBindConfig = {
  SearchOperation: [["Control", "f"]],
  DeleteOperation: [["x"], ["Delete"]],
  undo: [["Control", "z"]],
  redo: [["Control", "y"]],

  TranslateOperation: [["g"]],
  CopyOperation: [["d"]],
  ReplaceOperation: [["c"]],

  camera1: [["1"]],
  camera2: [["2"]],
  camera3: [["3"]],
  camera4: [["4"]],
  camera5: [["5"]],
  camera6: [["6"]],
};

// --- Helper function for undo and redo with screenshots ---
async function undoRedoAndScreenshot(
  page,
  undoScreenshotName,
  redoScreenshotName,
  delay = 300,
) {
  // Undo
  const viewer = page.locator("#viewer");
  await viewer.click();

  const undoKeys = keyBindConfig.undo[0]; // ["Control", "z"]
  await page.keyboard.down(undoKeys[0]);
  await page.keyboard.press(undoKeys[1]);
  await page.keyboard.up(undoKeys[0]);
  await page.waitForTimeout(delay);
  await viewer.click();

  await expect(page).toHaveScreenshot(undoScreenshotName);

  // Redo
  const redoKeys = keyBindConfig.redo[0]; // ["Control", "y"]
  await page.keyboard.down(redoKeys[0]);
  await page.keyboard.press(redoKeys[1]);
  await page.keyboard.up(redoKeys[0]);
  await page.waitForTimeout(delay);
  await viewer.click();

  await expect(page).toHaveScreenshot(redoScreenshotName);
}

// --- Camera Keybinds Test ---
test("camera keybinds", async ({ page }, testInfo) => {
  const viewer = page.locator("#viewer");
  await page.goto(`http://127.0.0.1:8080/tests/e2e/testDefault.html`);
  await viewer.waitFor({ state: "visible" });

  // click canvas to focus
  await viewer.click();

  for (const cameraKey of [
    "camera1",
    "camera2",
    "camera3",
    "camera4",
    "camera5",
    "camera6",
  ]) {
    const sequence = keyBindConfig[cameraKey][0];
    for (const key of sequence) {
      await page.keyboard.press(key);
    }
    await page.waitForTimeout(50);
    await expect(page).toHaveScreenshot(`camera-${cameraKey}.png`);
  }
});

// --- Search Operation Test ---
test("search operation", async ({ page }, testInfo) => {
  const viewer = page.locator("#viewer");
  await page.goto(`http://127.0.0.1:8080/tests/e2e/testDefault.html`);
  await viewer.waitFor({ state: "visible" });

  await viewer.click();

  const searchKeys = keyBindConfig.SearchOperation[0];
  await page.keyboard.down(searchKeys[0]);
  await page.keyboard.press(searchKeys[1]);
  await page.keyboard.up(searchKeys[0]);
  await page.waitForTimeout(100);

  const searchTerms = ["Sphere", "Cube", "Inv", "Import", "select"];

  for (const term of searchTerms) {
    await page.keyboard.type(term);
    await page.waitForTimeout(200);

    await expect(page).toHaveScreenshot(`search-${term.toLowerCase()}.png`);
    for (let i = 0; i < term.length; i++) {
      await page.keyboard.press("Backspace");
    }
    await page.waitForTimeout(100);
  }
});

// --- Delete operation tests ---
test("delete operation", async ({ page }, testInfo) => {
  const viewer = page.locator("#viewer");
  await page.goto(`http://127.0.0.1:8080/tests/e2e/testDefault.html`);
  await viewer.waitFor({ state: "visible" });

  // loop through all delete keybinds
  for (const keySequence of keyBindConfig.DeleteOperation) {
    // click canvas to focus / select object
    await viewer.click();

    // --- Press the delete keybind ---
    for (const key of keySequence) {
      await page.keyboard.press(key);
    }
    await page.waitForTimeout(100);
    await expect(page).toHaveScreenshot(
      `delete-${keySequence.join("-").toLowerCase()}.png`,
    );

    await undoRedoAndScreenshot(
      page,
      `delete-${keySequence.join("-").toLowerCase()}-undo.png`,
      `delete-${keySequence.join("-").toLowerCase()}-redo.png`,
    );
  }
});

// --- Translate Operation Test ---
test("translate operation", async ({ page }, testInfo) => {
  const viewer = page.locator("#viewer");
  await page.goto(`http://127.0.0.1:8080/tests/e2e/testDefault.html`);
  await viewer.waitFor({ state: "visible" });

  await viewer.click(); // select object

  for (const keySequence of keyBindConfig.TranslateOperation) {
    for (const key of keySequence) await page.keyboard.press(key);

    const box = await viewer.boundingBox();
    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;
    const steps = 4;

    for (let step = 1; step <= steps; step++) {
      const progressX = startX + 40 * step;
      const progressY = startY + 40 * step;
      await page.mouse.move(progressX, progressY, { steps: 5 });
      await expect(page).toHaveScreenshot(
        `translate-${keySequence.join("-").toLowerCase()}-step-${step}.png`,
      );
      await page.waitForTimeout(50);
    }

    // finalize
    await page.mouse.click(startX + 40 * steps, startY + 40 * steps);
    await page.waitForTimeout(100);
    await expect(page).toHaveScreenshot(
      `translate-${keySequence.join("-").toLowerCase()}-final.png`,
    );

    // undo and redo with screenshots
    await undoRedoAndScreenshot(
      page,
      `translate-${keySequence.join("-").toLowerCase()}-undo.png`,
      `translate-${keySequence.join("-").toLowerCase()}-redo.png`,
    );
  }
});

// --- Copy Operation Test ---
test("copy operation", async ({ page }, testInfo) => {
  const viewer = page.locator("#viewer");
  await page.goto(`http://127.0.0.1:8080/tests/e2e/testDefault.html`);
  await viewer.waitFor({ state: "visible" });

  // click canvas to select object
  await viewer.click();

  for (const keySequence of keyBindConfig.CopyOperation) {
    // press copy keybind
    for (const key of keySequence) {
      await page.keyboard.press(key);
    }

    const box = await viewer.boundingBox();
    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;
    const steps = 4;

    for (let step = 1; step <= steps; step++) {
      const progressX = startX + 40 * step;
      const progressY = startY + 40 * step;
      await page.mouse.move(progressX, progressY, { steps: 5 });
      await expect(page).toHaveScreenshot(
        `copy-${keySequence.join("-").toLowerCase()}-step-${step}.png`,
      );
      await page.waitForTimeout(50);
    }

    // click to finalize operation
    await page.mouse.click(startX + 40 * steps, startY + 40 * steps);
    await page.waitForTimeout(100);

    await expect(page).toHaveScreenshot(
      `copy-${keySequence.join("-").toLowerCase()}-final.png`,
    );

    // undo
    await undoRedoAndScreenshot(
      page,
      `copy-${keySequence.join("-").toLowerCase()}-undo.png`,
      `copy-${keySequence.join("-").toLowerCase()}-redo.png`,
    );
  }
});

// --- Replace Operation Test ---
test("replace operation", async ({ page }, testInfo) => {
  const viewer = page.locator("#viewer");
  await page.goto(`http://127.0.0.1:8080/tests/e2e/testDefault.html`);
  await viewer.waitFor({ state: "visible" });

  // click to select object
  await viewer.click();

  for (const keySequence of keyBindConfig.ReplaceOperation) {
    // press Replace keybind
    for (const key of keySequence) {
      await page.keyboard.press(key);
    }

    // screenshot after replace
    await expect(page).toHaveScreenshot(
      `replace-${keySequence.join("-").toLowerCase()}.png`,
    );

    // undo and redo
    await undoRedoAndScreenshot(
      page,
      `replace-${keySequence.join("-").toLowerCase()}-undo.png`,
      `replace-${keySequence.join("-").toLowerCase()}-redo.png`,
    );
  }
});
