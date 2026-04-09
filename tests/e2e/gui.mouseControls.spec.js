import { test, expect } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function snapshotName(testInfo, name) {
  return `${testInfo.title.replace(/\s+/g, "-").toLowerCase()}${name}`;
}

test.beforeEach(async ({ page }) => {
  await page.goto(`http://127.0.0.1:8080/tests/e2e/testDefault.html`);
  const viewer = page.locator("#viewer");
  await viewer.waitFor({ state: "visible" });
  await viewer.focus();
});

// --- 1. Simple Click ---
test("click action", async ({ page }, testInfo) => {
  const viewer = page.locator("#viewer");
  const box = await viewer.boundingBox();

  // click center
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;
  await page.mouse.click(centerX, centerY);
  await expect(page).toHaveScreenshot(
    snapshotName(testInfo, "-click-center.png"),
  );

  // click one other point (e.g., offset 50px right and 50px down)
  const offsetX = centerX + 50;
  const offsetY = centerY + 50;
  await page.mouse.click(offsetX, offsetY);
  await expect(page).toHaveScreenshot(
    snapshotName(testInfo, "-click-offset.png"),
  );
});

// --- 2. Left-Click Drag ---
test("drag action", async ({ page }, testInfo) => {
  const viewer = page.locator("#viewer");
  const box = await viewer.boundingBox();

  for (let i = 1; i <= 4; i++) {
    // move to start point
    await page.mouse.move(box.x + 100, box.y + 100);
    await page.mouse.down();
    // drag down
    await page.mouse.move(box.x + 100, box.y + 500, { steps: 15 });
    await page.mouse.up();

    await expect(page).toHaveScreenshot(
      snapshotName(testInfo, `-drag-${i}.png`),
    );
    await page.waitForTimeout(100); // small pause between drags
  }
});

// --- 2. Left-Click Drag with Shift from Top-Left to Bottom-Right ---
test("shift drag action", async ({ page }, testInfo) => {
  const viewer = page.locator("#viewer");
  const box = await viewer.boundingBox();

  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;

  const startX = centerX - 100; // top-left from center
  const startY = centerY - 100;
  const endX = centerX + 100; // bottom-right from center
  const endY = centerY + 100;

  const steps = 4;

  // hold Shift
  await page.keyboard.down("Shift");

  // move to start and press mouse down
  await page.mouse.move(startX, startY);
  await page.mouse.down();

  // move in steps, taking screenshot after each step
  for (let step = 1; step <= steps; step++) {
    const progressX = startX + ((endX - startX) * step) / steps;
    const progressY = startY + ((endY - startY) * step) / steps;
    await page.mouse.move(progressX, progressY, { steps: 5 });
    await expect(page).toHaveScreenshot(
      snapshotName(testInfo, `-drag-shift-step-${step}.png`),
    );
    await page.waitForTimeout(50);
  }

  // release mouse and Shift
  await page.mouse.up();
  await page.keyboard.up("Shift");
  await page.waitForTimeout(100);
});

// --- 3. Right-Click Drag Out and Back ---
test("right click drag", async ({ page }, testInfo) => {
  const viewer = page.locator("#viewer");
  const box = await viewer.boundingBox();

  const startX = box.x + 100;
  const startY = box.y + 100;

  for (let i = 1; i <= 4; i++) {
    const dragDistance = 50 * i;

    // drag out
    await page.mouse.move(startX, startY);
    await page.mouse.down({ button: "right" });
    await page.mouse.move(startX + dragDistance, startY + dragDistance, {
      steps: 15,
    });
    await page.mouse.up({ button: "right" });
    await expect(page).toHaveScreenshot(
      snapshotName(testInfo, `-right-drag-out-${i}.png`),
    );
    await page.waitForTimeout(100);

    // drag back
    await page.mouse.move(startX + dragDistance, startY + dragDistance);
    await page.mouse.down({ button: "right" });
    await page.mouse.move(startX, startY, { steps: 15 });
    await page.mouse.up({ button: "right" });
    await expect(page).toHaveScreenshot(
      snapshotName(testInfo, `-right-drag-back-${i}.png`),
    );
    await page.waitForTimeout(100);
  }
});

// --- 4. Scroll Repeated ---
test("scroll", async ({ page }, testInfo) => {
  const viewer = page.locator("#viewer");
  const box = await viewer.boundingBox();

  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;

  await page.mouse.move(centerX, centerY);

  // Scroll outwards 4 times
  for (let i = 1; i <= 4; i++) {
    await page.mouse.wheel(0, 300 * i); // scroll out more each iteration
    await page.waitForTimeout(100);
    await expect(page).toHaveScreenshot(
      snapshotName(testInfo, `-scroll-out-${i}.png`),
    );
  }

  // Scroll back inwards 4 times
  for (let i = 1; i <= 4; i++) {
    await page.mouse.wheel(0, -300 * i); // scroll in
    await page.waitForTimeout(100);
    await expect(page).toHaveScreenshot(
      snapshotName(testInfo, `-scroll-in-${i}.png`),
    );
  }
});
