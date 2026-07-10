---
"@oh-my-sidebar/opencode-context-progress": patch
"@oh-my-sidebar/opencode-session-tokens": patch
---

Fix: use generate:universal mode in esbuild-plugin-solid

`@opentui/solid` is a universal renderer, not DOM. Explicitly set
`generate: "universal"` so the Solid compiler produces correct runtime
calls (`createComponent`, `effect`, `insert`, `createElement` instead
of `template`, `setAttribute`).
