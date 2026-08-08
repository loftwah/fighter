import type { Plugin } from "vite";

interface BundleChunk {
  type: "chunk";
  fileName: string;
  isEntry: boolean;
  imports: readonly string[];
  modules: Readonly<Record<string, unknown>>;
}

interface BundleAsset {
  type: "asset";
}

type BundleItem = BundleChunk | BundleAsset;

function staticEntryModules(
  bundle: Readonly<Record<string, BundleItem>>,
): Set<string> {
  const entries = Object.values(bundle).filter(
    (item): item is BundleChunk => item.type === "chunk" && item.isEntry,
  );
  if (entries.length === 0) {
    throw new Error("Production bundle has no JavaScript entry chunk");
  }

  const visited = new Set<string>();
  const modules = new Set<string>();
  const visit = (chunk: BundleChunk): void => {
    if (visited.has(chunk.fileName)) return;
    visited.add(chunk.fileName);
    Object.keys(chunk.modules).forEach((moduleId) => modules.add(moduleId));
    chunk.imports.forEach((importedFile) => {
      const imported = bundle[importedFile];
      if (imported?.type === "chunk") visit(imported);
    });
  };
  entries.forEach(visit);
  return modules;
}

export function productionBundleGuard(): Plugin {
  return {
    name: "loftwah-production-bundle-guard",
    apply: "build",
    generateBundle(_options, bundle) {
      const eagerModules = staticEntryModules(bundle);
      const eagerBattleModule = Array.from(eagerModules).find((moduleId) => {
        const normalised = moduleId.replaceAll("\\", "/");
        return (
          normalised.includes("/node_modules/phaser/") ||
          normalised.endsWith("/src/game/create-game.ts")
        );
      });
      if (eagerBattleModule) {
        throw new Error(
          `Initial JavaScript eagerly includes the battle renderer: ${eagerBattleModule}`,
        );
      }
    },
  };
}
