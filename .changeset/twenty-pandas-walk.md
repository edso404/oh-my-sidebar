---
"@oh-my-sidebar/opencode-context-progress": patch
"@oh-my-sidebar/opencode-session-tokens": patch
---

Fix: use esbuild-plugin-solid for proper Solid.js JSX compilation

Use `esbuild-plugin-solid` in tsup config to compile JSX into Solid
runtime calls (`createComponent`, `template`, `effect`, `memo`)
instead of generic `jsx()` calls. This ensures Solid's reactive
system correctly connects signals and memos, fixing the issue where
plugins rendered but showed no data.
