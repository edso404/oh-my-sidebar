# @oh-my-sidebar/opencode-session-tokens

## 1.0.0

### Major Changes

- 7da4851: Release v1.0.0 - initial stable release

## 0.1.7

### Patch Changes

- e49de81: Fix: use generate:universal mode in esbuild-plugin-solid

  `@opentui/solid` is a universal renderer, not DOM. Explicitly set
  `generate: "universal"` so the Solid compiler produces correct runtime
  calls (`createComponent`, `effect`, `insert`, `createElement` instead
  of `template`, `setAttribute`).

## 0.1.6

### Patch Changes

- 72f9f0b: Fix: use esbuild-plugin-solid for proper Solid.js JSX compilation

  Use `esbuild-plugin-solid` in tsup config to compile JSX into Solid
  runtime calls (`createComponent`, `template`, `effect`, `memo`)
  instead of generic `jsx()` calls. This ensures Solid's reactive
  system correctly connects signals and memos, fixing the issue where
  plugins rendered but showed no data.

## 0.1.5

### Patch Changes

- 93a042e: Fix: build TSX to JS with tsup, use peerDependencies like other plugins

  Align with OpenCode TUI plugin conventions (e.g. opencode-visual-cache):

  - Build TSX → JS via tsup with peer deps externalized
  - Export `./tui` as `dist/tui.js` instead of raw `dist/tui.tsx`
  - Use `peerDependencies` for all runtime deps

## 0.1.4

### Patch Changes

- 18bc2d2: Fix: remove runtime deps that cause Solid.js multi-instance conflicts

  Remove `@opentui/core`, `@opentui/solid`, and `solid-js` from
  dependencies. These are provided by the OpenCode host at runtime.
  Including them caused npm to install separate copies with slightly
  different versions (0.4.3 vs host's 0.4.2), creating Solid.js
  multi-instance conflicts that broke reactivity.

## 0.1.3

### Patch Changes

- c67196a: Fix: change peerDependencies back to dependencies

  OpenCode TUI plugin loader expects runtime deps in `dependencies`,
  not `peerDependencies`. Using `peerDependencies` caused Solid.js
  multi-instance conflicts (different @opentui/core versions), breaking
  reactivity for plugins installed via npm.

## 0.1.2

### Patch Changes

- 02e222c: Refactor both plugins to use the new OpenCode TUI plugin API (v2)

  - Update TuiPlugin signature to accept 3 params (api, options?, meta?)
  - Use ctx.theme.current from slot context instead of api.theme.current
  - Replace `<button>` with `<box selectable>` for OpenTUI compatibility
  - Remove unnecessary type intersection on TuiPluginModule
  - Bump @opencode-ai/plugin catalog to ^1.17.16

## 0.1.1

### Patch Changes

- f959039: fix: replace any with inline types for type safety
