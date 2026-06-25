# @zanbo Monorepo

**Generated:** 2026-06-25
**Stack:** pnpm 9+ · Turborepo 2.x · tsup · Biome · Vitest · changesets

## OVERVIEW

pnpm monorepo for publishing scoped npm packages under `@zanbo/xxx`. Each sub-package lives in `packages/` and is independently versioned via changesets.

## STRUCTURE

```
./
├── .changeset/           # changeset config + pending changeset markdown files
├── .github/workflows/    # CI (push+PR) + Release (main branch, OIDC publish)
├── packages/             # @zanbo/* packages (create per sub-project)
├── pnpm-workspace.yaml   # workspace definition + catalog version lock
├── turbo.json            # task pipeline (build/dev/lint/test/typecheck)
├── tsconfig.base.json    # shared TS compiler options
├── biome.json            # lint + format rules
└── package.json          # root: private, scripts, devDeps via catalog
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add new package | `packages/<name>/` | `pnpm add` → `pnpm changeset` |
| Build | `pnpm build` | turbo runs per-package build in dependency order |
| Publish | `.github/workflows/release.yml` | Auto on main merge via changesets/action |
| CI config | `.github/workflows/ci.yml` | lint → typecheck → test → build |

## CONVENTIONS

- **Package names**: `@zanbo/<name>` with `"access": "public"` in changesets config
- **Inter-package deps**: `"@zanbo/other": "workspace:*"` (auto via `.npmrc`)
- **Version lock**: All shared devDeps in `pnpm-workspace.yaml` catalog with `catalogMode: strict`
- **Build**: tsup for each package (ESM+CJS dual output + .d.ts)
- **Type checking**: `tsc --noEmit` (separate from build)
- **Testing**: Vitest per package

## COMMANDS

```bash
pnpm build          # turbo build (all packages)
pnpm dev            # turbo dev (watch mode)
pnpm lint           # biome check .
pnpm format         # biome check --write .
pnpm typecheck      # turbo typecheck
pnpm test           # turbo test
pnpm changeset      # create a changeset
pnpm check          # biome check + turbo typecheck
```

## NOTES

- `packages/` is currently empty — create sub-packages as needed
- `catalogMode: strict` means all dependencies must be defined in the catalog
- OIDC trusted publishing requires npm registry trusted publisher setup
- `bumpVersionsWithWorkspaceProtocolOnly: true` in changesets config
