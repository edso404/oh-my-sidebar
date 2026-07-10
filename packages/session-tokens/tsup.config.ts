import { solidPlugin } from "esbuild-plugin-solid";
import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    tui: "src/index.tsx",
  },
  format: ["esm"],
  clean: true,
  external: ["@opencode-ai/plugin", "@opentui/core", "@opentui/solid", "solid-js"],
  esbuildPlugins: [solidPlugin({ solid: { moduleName: "@opentui/solid" } })],
});
