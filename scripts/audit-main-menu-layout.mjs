import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { preview } from "vite";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const references = [
  { name: "iPhone portrait", width: 390, height: 844 },
  { name: "iPhone landscape", width: 844, height: 390 },
  { name: "MacBook desktop", width: 1728, height: 1117 },
];
const server = await preview({
  root: repoRoot,
  preview: { host: "127.0.0.1", port: 0, strictPort: true },
});
const address = server.httpServer.address();
assert(address && typeof address === "object", "Preview server did not bind");
const origin = `http://127.0.0.1:${address.port}`;
let browser;

try {
  browser = await chromium.launch({ headless: true });
  const results = [];
  const violations = [];

  for (const reference of references) {
    const context = await browser.newContext({
      viewport: { width: reference.width, height: reference.height },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await page.goto(origin, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Enter LOFTWAH FIGHTER" }).click();
    await page.locator(".main-menu").waitFor();

    const geometry = await page.evaluate(() => {
      const actions = Array.from(
        globalThis.document.querySelectorAll(".mode-launcher button"),
      );
      return {
        documentHeight: globalThis.document.documentElement.scrollHeight,
        viewportHeight: globalThis.document.documentElement.clientHeight,
        documentWidth: globalThis.document.documentElement.scrollWidth,
        viewportWidth: globalThis.document.documentElement.clientWidth,
        actions: actions.map((action) => {
          const bounds = action.getBoundingClientRect();
          return {
            label: action.textContent?.replace(/\s+/g, " ").trim() ?? "",
            top: bounds.top,
            bottom: bounds.bottom,
            left: bounds.left,
            right: bounds.right,
            height: bounds.height,
          };
        }),
      };
    });

    if (geometry.documentHeight !== geometry.viewportHeight) {
      violations.push(
        `${reference.name} Main Menu scrolls (${geometry.documentHeight}px document in ${geometry.viewportHeight}px viewport)`,
      );
    }
    if (geometry.documentWidth !== geometry.viewportWidth) {
      violations.push(
        `${reference.name} Main Menu scrolls horizontally (${geometry.documentWidth}px document in ${geometry.viewportWidth}px viewport)`,
      );
    }
    if (geometry.actions.length !== 3) {
      violations.push(
        `${reference.name} does not expose all three mode actions`,
      );
    }
    for (const action of geometry.actions) {
      if (action.top < 0 || action.bottom > reference.height) {
        violations.push(
          `${reference.name} hides ${action.label} outside the first viewport`,
        );
      }
      if (action.left < 0 || action.right > reference.width) {
        violations.push(
          `${reference.name} hides ${action.label} outside the horizontal viewport`,
        );
      }
      if (action.height < 44) {
        violations.push(`${reference.name} shrinks ${action.label} below 44px`);
      }
    }

    results.push({ ...reference, ...geometry });
    await context.close();
  }

  assert.equal(violations.length, 0, violations.join("\n"));

  process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
} finally {
  await browser?.close();
  await server.close();
}
