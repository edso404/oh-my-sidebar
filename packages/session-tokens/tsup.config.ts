import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    tui: "src/index.tsx",
  },
  format: ["esm"],
  dts: true,
  clean: true,
  esbuildOptions(options) {
    options.jsx = "automatic";
    options.jsxImportSource = "@opentui/solid";
  },
});
