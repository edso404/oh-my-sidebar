# @oh-my-sidebar Monorepo

**Generated:** 2026-06-26
**Stack:** pnpm 11+ · Turborepo 2.x · tsup · Biome · Vitest · changesets

## OVERVIEW

pnpm monorepo for publishing scoped npm packages under `@oh-my-sidebar/xxx`. Each sub-package lives in `packages/` and is independently versioned via changesets.

## STRUCTURE

```
./
├── .changeset/           # changeset config + pending changeset markdown files
├── .github/workflows/    # CI (push+PR) + Release (main branch, OIDC publish)
├── packages/             # @oh-my-sidebar/* packages (create per sub-project)
├── pnpm-workspace.yaml   # workspace definition + catalog version lock
├── turbo.json            # task pipeline (build/dev/lint/test/typecheck)
├── tsconfig.base.json    # shared TS compiler options
├── biome.json            # lint + format rules
└── package.json          # root: private, scripts, devDeps via catalog
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add new package | `packages/<name>/` | Copy `context-progress` as template (package.json, tsconfig.json, tsup.config.ts, README.md) |
| Build | `pnpm build` | turbo runs per-package build in dependency order |
| CI config | `.github/workflows/ci.yml` | lint → typecheck → test → build |
| Release pipeline | `.github/workflows/release.yml` | Auto-publishes on main merge via changesets/action |

## TUI PLUGIN DEVELOPMENT GUIDE

### 产物格式

**npm 包只支持 `.js`（编译后的 JS），不支持 `.tsx` 源码。**

虽然本地路径可以用 `.tsx`（Bun 现场编译），但 npm 包必须发编译后的 JS。OpenCode 加载插件的流程是：

```
tui.json → resolvePluginEntrypoint() → 读 package.json exports → import() 加载
```

`import()` 在 Bun 中虽然能加载 TSX，但模块解析路径会指向插件自己的 `node_modules`，造成多实例问题。所以 npm 包必须发 JS。

### package.json 标准模板

```json
{
  "name": "@oh-my-sidebar/opencode-<name>",
  "type": "module",
  "exports": {
    "./tui": {
      "import": "./dist/tui.js"
    }
  },
  "files": ["dist", "README.md"],
  "scripts": {
    "build": "tsup",
    "prepublishOnly": "pnpm build"
  },
  "peerDependencies": {
    "@opencode-ai/plugin": "catalog:",
    "@opentui/core": "catalog:",
    "@opentui/solid": "catalog:",
    "solid-js": "catalog:"
  }
}
```

**关键规则：**
- `exports["./tui"]` 指向 `dist/tui.js`（**必须**）
- 运行时依赖用 `peerDependencies`（**必须**，不能放 `dependencies`）
- `files` 包含 `dist`（**必须**）

### tsup 配置标准模板

```ts
import { defineConfig } from "tsup";
import { solidPlugin } from "esbuild-plugin-solid";

export default defineConfig({
  entry: { tui: "src/index.tsx" },
  format: ["esm"],
  clean: true,
  external: ["@opencode-ai/plugin", "@opentui/core", "@opentui/solid", "solid-js"],
  esbuildPlugins: [solidPlugin({ solid: { moduleName: "@opentui/solid", generate: "universal" } })],
});
```

**关键规则：**
- `external` 列出所有 peer dep（**必须**）
- `solidPlugin` 的 `generate: "universal"`（**必须**，因为 `@opentui/solid` 是 universal 渲染器）
- 不输出 `dts`（类型声明非必需，且可能因类型错误导致构建失败）

### 源码编写规范

```tsx
/** @jsxImportSource @opentui/solid */

import type { TuiPlugin, TuiPluginApi, TuiPluginModule, TuiThemeCurrent } from "@opencode-ai/plugin/tui";
import { createMemo, createSignal, For, Show } from "solid-js";

// View 组件接收 theme 作为 prop（从 slot context 传入）
function View(props: { api: TuiPluginApi; sessionID: string; theme: TuiThemeCurrent }) {
  return <text fg={props.theme.text}>Hello</text>;
}

const tui: TuiPlugin = async (api) => {
  api.slots.register({
    order: 100,
    slots: {
      sidebar_content(ctx, props) {
        return <View api={api} sessionID={props.session_id} theme={ctx.theme.current} />;
      },
    },
  });
};

const plugin: TuiPluginModule = {
  id: "oh-my-sidebar.<name>",
  tui,
};

export default plugin;
```

**关键规则：**
- 主题从 `ctx.theme.current` 获取（不是 `api.theme.current`）
- `TuiPlugin` 签名是 `(api, options?, meta?) => void`
- `TuiPluginModule` 不需要 `& { id: string }` 交叉类型
- 可点击元素用 `<box selectable={true} onMouseDown={...}>`（没有 `<button>` 元素）
- `@opentui/core` 的 `TextAttributes` 等可以直接 import

### 可用 Slot

| Slot 名 | Props | 用途 |
|---------|-------|------|
| `sidebar_content` | `{ session_id: string }` | 侧边栏内容 |
| `sidebar_title` | `{ session_id, title, share_url? }` | 侧边栏标题 |
| `sidebar_footer` | `{ session_id: string }` | 侧边栏底部 |
| `home_logo` | `{}` | 首页 Logo |
| `home_prompt` | `{ ref? }` | 首页输入框 |
| `home_prompt_right` | `{}` | 首页输入框右侧 |
| `home_bottom` | `{}` | 首页底部 |
| `home_footer` | `{}` | 首页页脚 |
| `session_prompt` | `{ session_id, visible?, disabled?, on_submit?, ref? }` | 会话输入框 |
| `session_prompt_right` | `{ session_id }` | 会话输入框右侧 |
| `app` | `{}` | 应用级 |
| `app_bottom` | `{}` | 应用底部 |

### 可用 API

| API | 说明 |
|-----|------|
| `api.state.session.messages(id)` | 获取会话消息列表 |
| `api.state.session.get(id)` | 获取会话元数据 |
| `api.state.session.diff(id)` | 获取文件变更 |
| `api.state.session.todo(id)` | 获取待办事项 |
| `api.state.session.status(id)` | 获取会话状态 |
| `api.state.session.permission(id)` | 获取权限请求 |
| `api.state.session.question(id)` | 获取问题请求 |
| `api.state.provider` | 获取 provider/model 信息 |
| `api.state.config` | 获取配置 |
| `api.state.path` | 获取路径信息 |
| `api.state.vcs` | 获取 VCS 信息 |
| `api.state.lsp()` | 获取 LSP 状态 |
| `api.state.mcp()` | 获取 MCP 状态 |
| `api.state.part(messageID)` | 获取消息的 parts |
| `api.theme.current` | 当前主题（主机用） |
| `ctx.theme.current` | 当前主题（slot 中用） |
| `api.kv.get/set` | 插件 KV 存储 |
| `api.route.navigate/register` | 路由 |
| `api.ui.Dialog/Alert/Confirm/Prompt/Select` | UI 组件 |
| `api.ui.toast` | Toast 通知 |
| `api.ui.Slot` | 嵌套 slot |
| `api.event.on` | 事件监听 |
| `api.keymap` | 快捷键 |
| `api.client` | OpenCode API 客户端 |
| `api.lifecycle` | 生命周期（AbortSignal + onDispose） |

### 完整开发流程

```
1. 从 main 开分支
2. 复制 context-progress 作为模板
3. 修改 package.json（name, id, 描述）
4. 修改 src/index.tsx（插件逻辑）
5. pnpm build 验证构建
6. 本地路径测试（改 tui.json 为本地路径）
7. 确认正常后创建 changeset
8. 提交 → PR → 合并 → 自动发布
```

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
pnpm ci:publish     # build + changeset publish (used by CI only)
```

## NEW WORK PREREQUISITES

Before starting any new feature, fix, or task:

1. **Branch check** — Must be on `main`. If not, stash/commit changes and switch to `main`.
2. **Remote sync** — `git pull origin main` to ensure local `main` is up to date.
3. **Clean working tree** — `git status` must show no uncommitted changes. If dirty, ask user how to handle.
4. **New branch** — Create a feature/fix branch from latest `main`: `git checkout -b <type>/<description>`.
5. **Push** — Push branch to remote and set upstream: `git push -u origin <branch>`.

> **Never start implementation directly on `main`.** Always use a feature branch.

## RELEASE WORKFLOW

1. **Create changeset** — `pnpm changeset` (or manually create `.changeset/*.md`)
   - Select affected packages and bump type (patch/minor/major)
   - Commit and push to a feature branch
2. **Open PR** — merge feature branch into `main` (main is protected, no direct pushes)
3. **CI runs** — `lint → typecheck → test → build` on every push/PR
4. **Release pipeline** (`.github/workflows/release.yml`) triggers on push to `main`:
   - `changesets/action` bumps versions, updates changelogs, creates a release PR or publishes directly
   - Publishes to npm via `pnpm ci:publish` (build + `changeset publish`)
   - Uses OIDC trusted publishing (no npm token needed)

> **Never `npm publish` manually.** Always go through the changesets → PR → main → release pipeline.

## NOTES

- `packages/` contains `context-progress` and `session-tokens` — copy `context-progress` as template for new packages
- `catalogMode: strict` means all dependencies must be defined in the catalog
- OIDC trusted publishing requires npm registry trusted publisher setup
- `bumpVersionsWithWorkspaceProtocolOnly: true` in changesets config
