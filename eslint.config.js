import eslint from "@eslint/js";
import prettier from "eslint-config-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist",
      "coverage",
      "node_modules",
      ".playwright-cli",
      "output",
      "public/assets/generated",
      "eslint.config.js",
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ["src/**/*.ts", "vite.config.ts"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-floating-promises": "error",
    },
  },
  {
    files: ["src/**/*.test.ts"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.vitest,
      },
    },
  },
  {
    ...tseslint.configs.disableTypeChecked,
    files: ["scripts/**/*.mjs"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: [
      "src/combat/**/*.ts",
      "src/economy/**/*.ts",
      "src/progression/**/*.ts",
      "src/missions/**/*.ts",
      "src/store/**/*.ts",
      "src/story/**/*.ts",
      "src/tournaments/**/*.ts",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "phaser",
              message:
                "Gameplay domain modules are framework-free; Phaser belongs under src/game.",
            },
          ],
          patterns: [
            {
              group: ["../game/*", "../../game/*", "../../../game/*"],
              message:
                "Gameplay domain modules emit semantic state and events; src/game consumes them.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/ui/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "phaser",
              message:
                "UI renderers stay framework-free; Phaser lifecycle belongs under src/game.",
            },
          ],
          patterns: [
            {
              group: [
                "../app/App",
                "../../app/App",
                "../game/*",
                "../../game/*",
              ],
              message:
                "UI modules render explicit models and must not depend on the application controller or Phaser adapter.",
            },
          ],
        },
      ],
    },
  },
  prettier,
);
