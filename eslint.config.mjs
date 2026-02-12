import js from "@eslint/js";
import json from "@eslint/json";
import prettier from "eslint-config-prettier";
import astro from "eslint-plugin-astro";
import a11y from "eslint-plugin-jsx-a11y";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import ts from "typescript-eslint";

// see: https://github.com/ota-meshi/eslint-plugin-astro/issues/447#issuecomment-3590892767
export default defineConfig(
  globalIgnores([".astro/", "dist/", "node_modules/"]),
  json.configs.recommended,
  js.configs.recommended,
  ts.configs.strictTypeChecked,
  ts.configs.stylisticTypeChecked,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        // required to enable type-checked rules
        projectService: true,
      },
    },
  },
  astro.configs.recommended,
  // `client-side-ts` extracts <script> tags from astro components
  {
    files: ["**/*.astro"],
    processor: astro.processors["client-side-ts"],
  },

  // disable type-checked rules in astro components
  // https://github.com/ota-meshi/eslint-plugin-astro/issues/447
  {
    files: ["**/*.astro", "**/*.astro/*.ts"],
    extends: [ts.configs.disableTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: false,
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument -- plugin is pure JS
  a11y.flatConfigs.strict,
  prettier,
);
