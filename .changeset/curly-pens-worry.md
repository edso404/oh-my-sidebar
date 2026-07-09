---
"@oh-my-sidebar/opencode-context-progress": patch
"@oh-my-sidebar/opencode-session-tokens": patch
---

Fix: change peerDependencies back to dependencies

OpenCode TUI plugin loader expects runtime deps in `dependencies`,
not `peerDependencies`. Using `peerDependencies` caused Solid.js
multi-instance conflicts (different @opentui/core versions), breaking
reactivity for plugins installed via npm.
