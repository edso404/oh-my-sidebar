---
"@oh-my-sidebar/opencode-context-progress": patch
"@oh-my-sidebar/opencode-session-tokens": patch
---

Refactor both plugins to use the new OpenCode TUI plugin API (v2)

- Update TuiPlugin signature to accept 3 params (api, options?, meta?)
- Use ctx.theme.current from slot context instead of api.theme.current
- Replace `<button>` with `<box selectable>` for OpenTUI compatibility
- Remove unnecessary type intersection on TuiPluginModule
- Bump @opencode-ai/plugin catalog to ^1.17.16
