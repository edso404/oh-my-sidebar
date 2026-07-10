---
"@oh-my-sidebar/opencode-context-progress": patch
"@oh-my-sidebar/opencode-session-tokens": patch
---

Fix: remove runtime deps that cause Solid.js multi-instance conflicts

Remove `@opentui/core`, `@opentui/solid`, and `solid-js` from
dependencies. These are provided by the OpenCode host at runtime.
Including them caused npm to install separate copies with slightly
different versions (0.4.3 vs host's 0.4.2), creating Solid.js
multi-instance conflicts that broke reactivity.
