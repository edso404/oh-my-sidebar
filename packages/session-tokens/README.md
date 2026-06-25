# @oh-my-sidebar/opencode-session-tokens

OpenCode TUI sidebar plugin that displays the current session's token usage breakdown by model.

## Features

- Total session token count
- Per-model token breakdown
- Expandable/collapsible details view
- Supports input, output, reasoning, and cache write tokens

## Installation

```bash
npm install @oh-my-sidebar/opencode-session-tokens
```

## Usage

Add the plugin to your OpenCode TUI configuration (`tui.jsonc`):

```jsonc
{
  "plugin": [
    "@oh-my-sidebar/opencode-session-tokens"
  ]
}
```

## License

MIT
