# @zanbo — OpenCode TUI Plugins

Monorepo for OpenCode TUI sidebar plugins, published as scoped npm packages under `@zanbo/`.

## Packages

| Package | Description |
|---------|-------------|
| [@zanbo/opencode-context-progress](./packages/context-progress) | Context usage progress bar for OpenCode sidebar |

## Getting Started

```bash
pnpm install
pnpm build
```

## Development

```bash
pnpm dev       # watch mode
pnpm lint      # biome check
pnpm typecheck # tsc --noEmit
pnpm test      # vitest
```

## Publishing

```bash
pnpm changeset        # record version changes
# merge PR → auto publish via GitHub Actions
```

## License

MIT
