import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    tui: "src/index.tsx",
  },
  format: ["esm"],
  clean: true,
  external: [
    "@opencode-ai/plugin",
    "@opentui/core",
    "@opentui/solid",
    "solid-js",
  ],
  esbuildOptions(options) {
    options.jsx = "automatic";
    options.jsxImportSource = "@opentui/solid";
  },
});
