import { test, expect } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function snapshotName(testInfo, name,) {
  return `${testInfo.title.replace(/\s+/g, "-").toLowerCase()}${name}`;
}

// we export iife and mjs
// IIFE is fully bundled with three.js and dat.gui and thus doesnt need an import map. (just a single script invocation)
const builds = [
  { name: "IIFE", html: "testBuildIIFE.html" },
  { name: "MJS", html: "testBuildMJS.html" },
];

for (const build of builds) {
  test(`test viewer using ${build.name}`, async ({ page }, testInfo) => {
    await page.goto(`http://127.0.0.1:8080/tests/e2e/${build.html}`);

    const viewer = page.locator("#viewer");
    await viewer.waitFor({ state: "visible" });
    await viewer.focus();

    for (const cameraView of ["1"]) {
      await page.keyboard.press(cameraView);
      await page.waitForTimeout(50);
      await expect(page).toHaveScreenshot(
        snapshotName(testInfo, `.png`),
      );
    }
  });
}
