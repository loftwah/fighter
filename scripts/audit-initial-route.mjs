import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { preview } from "vite";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
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
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  const devtools = await context.newCDPSession(page);
  await devtools.send("Network.enable");
  await devtools.send("Network.setCacheDisabled", { cacheDisabled: true });
  await page.goto(origin, { waitUntil: "networkidle" });

  const landing = await page.evaluate(() => {
    const navigation = performance.getEntriesByType("navigation")[0];
    const resources = performance.getEntriesByType("resource");
    const media = globalThis.document.querySelector(".startup-media");
    return {
      navigationEncodedBytes: navigation?.encodedBodySize ?? 0,
      resources: resources.map((entry) => ({
        name: new URL(entry.name).pathname,
        encodedBytes: entry.encodedBodySize,
        initiator: entry.initiatorType,
      })),
      decodedStartupRgbaBytes:
        media?.tagName === "IMG"
          ? media.naturalWidth * media.naturalHeight * 4
          : 0,
    };
  });
  const landingNames = landing.resources.map((resource) => resource.name);
  const landingEncodedBytes =
    landing.navigationEncodedBytes +
    landing.resources.reduce(
      (total, resource) => total + resource.encodedBytes,
      0,
    );

  assert(
    landingEncodedBytes <= 1_000_000,
    `Cold mobile intro exceeded 1 MB: ${landingEncodedBytes} bytes`,
  );
  assert(
    landingNames.some((name) =>
      name.endsWith("intro-launch-roster-portrait.png"),
    ),
    "Cold mobile intro did not request its portrait artwork",
  );
  for (const forbidden of [
    "intro-launch-roster.png",
    "story.png",
    "tournament.png",
    "create-game",
  ]) {
    assert(
      !landingNames.some((name) =>
        forbidden === "create-game"
          ? name.includes(forbidden)
          : name.endsWith(forbidden),
      ),
      `Cold mobile intro requested deferred asset ${forbidden}`,
    );
  }
  assert(
    !landingNames.some((name) => /\.(?:mp3|m4a|ogg|wav)$/i.test(name)),
    "Cold mobile intro requested music or audio",
  );

  const storyResponse = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname.endsWith("story.png") && response.ok(),
  );
  const tournamentResponse = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname.endsWith("tournament.png") &&
      response.ok(),
  );
  await page.getByRole("button", { name: "Enter LOFTWAH FIGHTER" }).click();
  await page.locator(".main-menu").waitFor();
  await Promise.all([storyResponse, tournamentResponse]);
  const menuResources = await page.evaluate(() =>
    performance.getEntriesByType("resource").map((entry) => ({
      name: new URL(entry.name).pathname,
      encodedBytes: entry.encodedBodySize,
    })),
  );
  assert(
    menuResources.some(
      (resource) =>
        resource.name.endsWith("story.png") && resource.encodedBytes > 0,
    ),
    "Main Menu did not load Story artwork after entry",
  );
  assert(
    menuResources.some(
      (resource) =>
        resource.name.endsWith("tournament.png") && resource.encodedBytes > 0,
    ),
    "Main Menu did not load Tournament artwork after entry",
  );

  process.stdout.write(
    `${JSON.stringify(
      {
        viewport: "390x844",
        landingEncodedBytes,
        decodedStartupRgbaBytes: landing.decodedStartupRgbaBytes,
        landingResources: landing.resources,
        deferredModeArtLoadedAtMenu: true,
      },
      null,
      2,
    )}\n`,
  );
} finally {
  await browser?.close();
  await server.close();
}
