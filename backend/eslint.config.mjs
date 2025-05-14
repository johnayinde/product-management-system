// eslint.config.js
import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: globals.node,
    },
    plugins: {
      js,
    },
    rules: {
      ...js.configs.recommended.rules,
    },
  },
  {
    files: ["**/tests/**/*.test.js", "**/tests/setup.js"],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
]);
