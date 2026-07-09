# @oh-my-sidebar/opencode-session-tokens

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
