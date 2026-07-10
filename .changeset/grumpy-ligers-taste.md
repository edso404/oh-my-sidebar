---
"@oh-my-sidebar/opencode-context-progress": patch
"@oh-my-sidebar/opencode-session-tokens": patch
---

Fix: build TSX to JS with tsup, use peerDependencies like other plugins

Align with OpenCode TUI plugin conventions (e.g. opencode-visual-cache):

- Build TSX → JS via tsup with peer deps externalized
- Export `./tui` as `dist/tui.js` instead of raw `dist/tui.tsx`
- Use `peerDependencies` for all runtime deps
