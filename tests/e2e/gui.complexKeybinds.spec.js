import { test, expect } from "@playwright/test";

const keyBindConfig = {
  RotateOperation: [["r"]],
  TranslateOperation: [["g"]],
  undo: [["Control", "z"]],
  redo: [["Control", "y"]],
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

// --- Rotation Keybinds Test ---
test("two atom rotation operation", async ({ page }, testInfo) => {
  const viewer = page.locator("#viewer");
  await page.goto(`http://127.0.0.1:8080/tests/e2e/testDefault.html`);
  await viewer.waitFor({ state: "visible" });

  // click canvas to focus
  await viewer.click();

  // --- Select atoms via editor ---
  await page.evaluate(() => {
    window.editor.avr.modelStyle = 2;
    window.editor.avr.selectedAtomsIndices = [0, 3]; // select atoms
  });

  // small wait to let selection visually update
  await page.waitForTimeout(20);

  // --- Press rotation keybind ---
  const rotateKeys = keyBindConfig.RotateOperation[0];
  for (const key of rotateKeys) {
    await page.keyboard.press(key);
  }

  // multi-step rotation
  const box = await viewer.boundingBox();

  // start at center
  const steps = 8; // number of rotation screenshots
  const radius = 300; // how far from center the mouse moves
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;

  for (let step = 1; step <= steps; step++) {
    const angle = (Math.PI * 2 * step) / steps; // full circle divided into steps
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    await page.mouse.move(x, y, { steps: 5 });
    await expect(page).toHaveScreenshot(`rotation-two-step-${step}.png`);
    await page.waitForTimeout(20);
  }

  // finalize rotation with a click at center
  await page.mouse.click(centerX + 100, centerY + 100);
  await page.waitForTimeout(20);
  await expect(page).toHaveScreenshot(`rotation-two-final.png`);
});

test("three atom rotation operation", async ({ page }, testInfo) => {
  const viewer = page.locator("#viewer");
  await page.goto(`http://127.0.0.1:8080/tests/e2e/testDefault.html`);
  await viewer.waitFor({ state: "visible" });

  // click canvas to focus
  await viewer.click();

  // --- Select atoms via editor ---
  await page.evaluate(() => {
    window.editor.avr.modelStyle = 2;
    window.editor.avr.selectedAtomsIndices = [0, 3, 6]; // select atoms
  });

  // small wait to let selection visually update
  await page.waitForTimeout(20);

  // --- Press rotation keybind ---
  const rotateKeys = keyBindConfig.RotateOperation[0];
  for (const key of rotateKeys) {
    await page.keyboard.press(key);
  }

  // multi-step rotation
  const box = await viewer.boundingBox();

  // start at center
  const steps = 8; // number of rotation screenshots
  const radius = 300; // how far from center the mouse moves
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;

  for (let step = 1; step <= steps; step++) {
    const angle = (Math.PI * 2 * step) / steps; // full circle divided into steps
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    await page.mouse.move(x, y, { steps: 5 });
    await expect(page).toHaveScreenshot(`rotation-three-step-${step}.png`);
    await page.waitForTimeout(20);
  }

  await page.mouse.click(centerX + 100, centerY + 100);
  await page.waitForTimeout(20);
  await expect(page).toHaveScreenshot(`rotation-three-final.png`);
});

test("four atom rotation operation", async ({ page }, testInfo) => {
  const viewer = page.locator("#viewer");
  await page.goto(`http://127.0.0.1:8080/tests/e2e/testDefault.html`);
  await viewer.waitFor({ state: "visible" });

  // click canvas to focus
  await viewer.click();

  // --- Select atoms via editor ---
  await page.evaluate(() => {
    window.editor.avr.modelStyle = 2;
    window.editor.avr.selectedAtomsIndices = [0, 3, 6, 2]; // select atoms
  });

  // small wait to let selection visually update
  await page.waitForTimeout(20);

  // --- Press rotation keybind ---
  const rotateKeys = keyBindConfig.RotateOperation[0];
  for (const key of rotateKeys) {
    await page.keyboard.press(key);
  }

  // multi-step rotation
  const box = await viewer.boundingBox();

  // start at center
  const steps = 8; // number of rotation screenshots
  const radius = 300; // how far from center the mouse moves
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;

  for (let step = 1; step <= steps; step++) {
    const angle = (Math.PI * 2 * step) / steps; // full circle divided into steps
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    await page.mouse.move(x, y, { steps: 5 });
    await expect(page).toHaveScreenshot(`rotation-four-step-${step}.png`);
    await page.waitForTimeout(20);
  }

  await page.mouse.click(centerX + 100, centerY + 100);
  await page.waitForTimeout(20);
  await expect(page).toHaveScreenshot(`rotation-final.png`);
});

test("rotation about atom", async ({ page }, testInfo) => {
  const viewer = page.locator("#viewer");
  await page.goto(`http://127.0.0.1:8080/tests/e2e/testDefault.html`);
  await viewer.waitFor({ state: "visible" });

  // click canvas to focus
  await viewer.click();

  // --- Select atoms via editor ---
  await page.evaluate(() => {
    window.editor.avr.modelStyle = 0;
    window.editor.avr.selectedAtomsIndices = [0, 1];
  });

  // small wait to let selection visually update
  await page.waitForTimeout(20);

  // --- Press rotation keybind ---
  const rotateKeys = keyBindConfig.RotateOperation[0];
  for (const key of rotateKeys) {
    await page.keyboard.press(key);
  }

  const box = await viewer.boundingBox();
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;

  await page.keyboard.press("a");
  await viewer.click();
  await page.keyboard.press("a");

  await expect(page).toHaveScreenshot(`rotation-via-axis-atom-select.png`);

  // start at center
  const steps = 8; // number of rotation screenshots
  const radius = 300; // how far from center the mouse moves

  for (let step = 1; step <= steps; step++) {
    const angle = (Math.PI * 2 * step) / steps; // full circle divided into steps
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    await page.mouse.move(x, y, { steps: 5 });
    await expect(page).toHaveScreenshot(
      `rotation-via-axis-atom-step-${step}.png`,
    );
    await page.waitForTimeout(20);
  }

  await page.mouse.click(centerX + 100, centerY + 100);
  await page.waitForTimeout(20);
  await expect(page).toHaveScreenshot(`rotation-via-axis-atom-final.png`);
});

test("rotation about twoatom", async ({ page }, testInfo) => {
  const viewer = page.locator("#viewer");
  await page.goto(`http://127.0.0.1:8080/tests/e2e/testDefault.html`);
  await viewer.waitFor({ state: "visible" });

  // click canvas to focus
  await viewer.click();

  // --- Select atoms via editor ---
  await page.evaluate(() => {
    window.editor.avr.modelStyle = 0;
    window.editor.avr.selectedAtomsIndices = [0, 1];
  });

  // small wait to let selection visually update
  await page.waitForTimeout(20);

  // --- Press rotation keybind ---
  const rotateKeys = keyBindConfig.RotateOperation[0];
  for (const key of rotateKeys) {
    await page.keyboard.press(key);
  }

  const box = await viewer.boundingBox();
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;

  await page.keyboard.press("a");
  await page.evaluate(() => {
    editor.selectionManager.axisAtomIndices = [2, 7];
  });

  await page.keyboard.press("a");

  await expect(page).toHaveScreenshot(`rotation-via-axis-two-atom-select.png`);

  // start at center
  const steps = 8; // number of rotation screenshots
  const radius = 300; // how far from center the mouse moves

  for (let step = 1; step <= steps; step++) {
    const angle = (Math.PI * 2 * step) / steps; // full circle divided into steps
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    await page.mouse.move(x, y, { steps: 5 });
    await expect(page).toHaveScreenshot(
      `rotation-via-axis-two-atom-step-${step}.png`,
    );
    await page.waitForTimeout(20);
  }

  await page.mouse.click(centerX + 100, centerY + 100);
  await page.waitForTimeout(20);
  await expect(page).toHaveScreenshot(`rotation-via-axis-two-atom-final.png`);
});

test("rotation about threeatom", async ({ page }, testInfo) => {
  const viewer = page.locator("#viewer");
  await page.goto(`http://127.0.0.1:8080/tests/e2e/testDefault.html`);
  await viewer.waitFor({ state: "visible" });

  // click canvas to focus
  await viewer.click();

  // --- Select atoms via editor ---
  await page.evaluate(() => {
    window.editor.avr.modelStyle = 0;
    window.editor.avr.selectedAtomsIndices = [0, 1];
  });

  // small wait to let selection visually update
  await page.waitForTimeout(20);

  // --- Press rotation keybind ---
  const rotateKeys = keyBindConfig.RotateOperation[0];
  for (const key of rotateKeys) {
    await page.keyboard.press(key);
  }

  const box = await viewer.boundingBox();
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;

  await page.waitForTimeout(100);

  await page.keyboard.press("a");
  await page.evaluate(() => {
    editor.selectionManager.axisAtomIndices = [2, 7, 6];
  });

  await page.keyboard.press("a");

  await expect(page).toHaveScreenshot(
    `rotation-via-axis-three-atom-select.png`,
  );

  // start at center
  const steps = 8; // number of rotation screenshots
  const radius = 300; // how far from center the mouse moves

  for (let step = 1; step <= steps; step++) {
    const angle = (Math.PI * 2 * step) / steps; // full circle divided into steps
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    await page.mouse.move(x, y, { steps: 5 });
    await expect(page).toHaveScreenshot(
      `rotation-via-axis-three-atom-step-${step}.png`,
    );
    await page.waitForTimeout(20);
  }

  await page.mouse.click(centerX + 100, centerY + 100);
  await page.waitForTimeout(20);
  await expect(page).toHaveScreenshot(`rotation-via-axis-three-atom-final.png`);
});

test("translation about one atom", async ({ page }, testInfo) => {
  const viewer = page.locator("#viewer");
  await page.goto(`http://127.0.0.1:8080/tests/e2e/testDefault.html`);
  await viewer.waitFor({ state: "visible" });

  // click canvas to focus
  await viewer.click();

  // --- Select atoms via editor ---
  await page.evaluate(() => {
    window.editor.avr.modelStyle = 0;
    window.editor.avr.selectedAtomsIndices = [0, 1];
  });

  // small wait to let selection visually update
  await page.waitForTimeout(100);

  const box = await viewer.boundingBox();
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;

  // --- Press rotation keybind ---
  const translateKey = keyBindConfig.TranslateOperation[0];
  for (const key of translateKey) {
    await page.keyboard.press(key);
  }

  await page.keyboard.press("a");

  await viewer.click();

  await page.keyboard.press("a");

  await expect(page).toHaveScreenshot(`translate-via-axis-one-atom-select.png`);

  // start at center
  const steps = 8; // number of rotation screenshots
  const radius = 300; // how far from center the mouse moves

  for (let step = 1; step <= steps; step++) {
    const angle = (Math.PI * 2 * step) / steps; // full circle divided into steps
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    await page.mouse.move(x, y, { steps: 5 });
    await expect(page).toHaveScreenshot(
      `translate-via-axis-one-atom-step-${step}.png`,
    );
    await page.waitForTimeout(20);
  }

  await page.mouse.click(centerX + 100, centerY + 100);
  await page.waitForTimeout(20);
  await expect(page).toHaveScreenshot(`translate-via-axis-one-atom-final.png`);
});

// --- Translate Keybinds Test ---
test("translation about two atoms", async ({ page }, testInfo) => {
  const viewer = page.locator("#viewer");
  await page.goto(`http://127.0.0.1:8080/tests/e2e/testDefault.html`);
  await viewer.waitFor({ state: "visible" });

  // click canvas to focus
  await viewer.click();

  // --- Select atoms via editor ---
  await page.evaluate(() => {
    window.editor.avr.modelStyle = 0;
    window.editor.avr.selectedAtomsIndices = [0, 1];
  });

  // small wait to let selection visually update
  await page.waitForTimeout(100);

  const box = await viewer.boundingBox();
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;

  // --- Press rotation keybind ---
  const translateKey = keyBindConfig.TranslateOperation[0];
  for (const key of translateKey) {
    await page.keyboard.press(key);
  }

  await page.keyboard.press("a");
  await page.evaluate(() => {
    editor.selectionManager.axisAtomIndices = [2, 6];
  });

  await page.keyboard.press("a");

  await expect(page).toHaveScreenshot(`translate-via-axis-two-atom-select.png`);

  // start at center
  const steps = 8; // number of rotation screenshots
  const radius = 300; // how far from center the mouse moves

  for (let step = 1; step <= steps; step++) {
    const angle = (Math.PI * 2 * step) / steps; // full circle divided into steps
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    await page.mouse.move(x, y, { steps: 5 });
    await expect(page).toHaveScreenshot(
      `translate-via-axis-two-atom-step-${step}.png`,
    );
    await page.waitForTimeout(20);
  }

  await page.mouse.click(centerX + 100, centerY + 100);
  await page.waitForTimeout(20);
  await expect(page).toHaveScreenshot(`translate-via-axis-two-atom-final.png`);
});

// --- Translate Keybinds Test ---
test("translation about three atoms", async ({ page }, testInfo) => {
  const viewer = page.locator("#viewer");
  await page.goto(`http://127.0.0.1:8080/tests/e2e/testDefault.html`);
  await viewer.waitFor({ state: "visible" });

  // click canvas to focus
  await viewer.click();

  // --- Select atoms via editor ---
  await page.evaluate(() => {
    window.editor.avr.modelStyle = 0;
    window.editor.avr.selectedAtomsIndices = [0, 1];
  });

  // small wait to let selection visually update
  await page.waitForTimeout(100);

  const box = await viewer.boundingBox();
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;

  // --- Press rotation keybind ---
  const translateKey = keyBindConfig.TranslateOperation[0];
  for (const key of translateKey) {
    await page.keyboard.press(key);
  }

  await page.keyboard.press("a");
  await page.evaluate(() => {
    editor.selectionManager.axisAtomIndices = [2, 6, 7];
  });

  await page.keyboard.press("a");
  await page.keyboard.press("p"); // plane


  await expect(page).toHaveScreenshot(`translate-via-axis-three-atom-select.png`);

  // start at center
  const steps = 8; // number of rotation screenshots
  const radius = 300; // how far from center the mouse moves

  for (let step = 1; step <= steps; step++) {
    const angle = (Math.PI * 2 * step) / steps; // full circle divided into steps
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    await page.mouse.move(x, y, { steps: 5 });
    await expect(page).toHaveScreenshot(
      `translate-via-axis-three-atom-step-${step}.png`,
    );
    await page.waitForTimeout(20);
  }

  await page.mouse.click(centerX + 100, centerY + 100);
  await page.waitForTimeout(20);
  await expect(page).toHaveScreenshot(`translate-via-axis-three-atom-final.png`);
});
