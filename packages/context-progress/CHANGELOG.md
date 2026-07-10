# @oh-my-sidebar/opencode-context-progress

## 0.2.5

### Patch Changes

- 18bc2d2: Fix: remove runtime deps that cause Solid.js multi-instance conflicts

  Remove `@opentui/core`, `@opentui/solid`, and `solid-js` from
  dependencies. These are provided by the OpenCode host at runtime.
  Including them caused npm to install separate copies with slightly
  different versions (0.4.3 vs host's 0.4.2), creating Solid.js
  multi-instance conflicts that broke reactivity.

## 0.2.4

### Patch Changes

- c67196a: Fix: change peerDependencies back to dependencies

  OpenCode TUI plugin loader expects runtime deps in `dependencies`,
  not `peerDependencies`. Using `peerDependencies` caused Solid.js
  multi-instance conflicts (different @opentui/core versions), breaking
  reactivity for plugins installed via npm.

## 0.2.3

### Patch Changes

- 02e222c: Refactor both plugins to use the new OpenCode TUI plugin API (v2)

  - Update TuiPlugin signature to accept 3 params (api, options?, meta?)
  - Use ctx.theme.current from slot context instead of api.theme.current
  - Replace `<button>` with `<box selectable>` for OpenTUI compatibility
  - Remove unnecessary type intersection on TuiPluginModule
  - Bump @opencode-ai/plugin catalog to ^1.17.16

## 0.2.2

### Patch Changes

- f959039: fix: replace any with inline types for type safety

## 0.2.1

### Patch Changes

- 4c96607: Fix: use oh-my-sidebar.context-progress plugin ID instead of streetturtle.context-progress

## 0.2.0

### Minor Changes

- c62646d: Rewrite context-progress plugin: reactively display last assistant message's context usage, simplify reactivity model

## 0.1.0

### Minor Changes

- 1e056da: Initial release: context usage progress TUI sidebar plugin
