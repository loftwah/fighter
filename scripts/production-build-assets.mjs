export function initialCodeAssets(indexHtml) {
  const assets = [...indexHtml.matchAll(/(?:src|href)=["']([^"']+)["']/g)]
    .map((match) => match[1])
    .filter(Boolean)
    .map((reference) => new URL(reference, "https://build.local/").pathname)
    .filter((asset) => asset.endsWith(".js") || asset.endsWith(".css"))
    .map((asset) => asset.replace(/^\//, ""));
  if (!assets.some((asset) => asset.endsWith(".js"))) {
    throw new Error(
      "Production HTML has no resolvable initial JavaScript asset",
    );
  }
  return assets;
}
