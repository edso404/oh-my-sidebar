/** @jsxImportSource @opentui/solid */

import type {
  TuiPlugin,
  TuiPluginApi,
  TuiPluginModule,
  TuiThemeCurrent,
} from "@opencode-ai/plugin/tui";
import { createMemo, createSignal, For, Show } from "solid-js";

const MAX_MODEL_ROWS = 10;
const INT_FORMATTER = new Intl.NumberFormat("en-US");

function safeNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function spentTokenCount(tokens: {
  input?: unknown;
  output?: unknown;
  reasoning?: unknown;
  cache?: { write?: unknown };
}): number {
  const input = safeNumber(tokens?.input);
  const output = safeNumber(tokens?.output);
  const reasoning = safeNumber(tokens?.reasoning);
  const cacheWrite = safeNumber(tokens?.cache?.write);
  return input + output + reasoning + cacheWrite;
}

function formatInt(value: number): string {
  return INT_FORMATTER.format(Math.max(0, Math.round(value)));
}

function shortModelLabel(label: string): string {
  if (label.length <= 28) return label;
  return `${label.slice(0, 25)}...`;
}

function View(props: { api: TuiPluginApi; sessionID: string; theme: TuiThemeCurrent }) {
  const [open, setOpen] = createSignal(false);
  const messages = createMemo(() => props.api.state.session.messages(props.sessionID));
  const session = createMemo(() => props.api.state.session.get(props.sessionID));

  const data = createMemo(() => {
    const totals = new Map<string, number>();
    let breakdownTotal = 0;
    const seen = new Set<string>();

    for (const message of messages()) {
      const role = message?.role ?? message?.info?.role;
      if (role !== "assistant") continue;

      const messageID = message?.id;
      if (typeof messageID === "string" && seen.has(messageID)) continue;
      if (typeof messageID === "string") seen.add(messageID);

      const count = spentTokenCount(message?.tokens);
      if (count <= 0) continue;

      const modelID = message?.modelID ?? message?.info?.modelID ?? "unknown";

      breakdownTotal += count;
      totals.set(modelID, (totals.get(modelID) ?? 0) + count);
    }

    const perModel = [...totals.entries()]
      .map(([model, tokens]) => ({ model, tokens }))
      .sort((a, b) => b.tokens - a.tokens);

    const sessionTotal = spentTokenCount(session()?.tokens);
    const total = breakdownTotal > 0 ? breakdownTotal : sessionTotal;

    return { total, perModel };
  });

  const show = createMemo(() => data().total > 0);
  const canExpand = createMemo(() => data().perModel.length > 0);

  return (
    <Show when={show()}>
      <box>
        <box
          flexDirection="row"
          gap={1}
          selectable={true}
          onMouseDown={() => canExpand() && setOpen((x) => !x)}
        >
          <Show when={canExpand()}>
            <text fg={props.theme.text}>{open() ? "▼" : "▶"}</text>
          </Show>
          <text fg={props.theme.text}>
            <b>Session Tokens</b>
          </text>
          <text fg={props.theme.textMuted}>{formatInt(data().total)}</text>
        </box>

        <Show when={canExpand() && open()}>
          <For each={data().perModel.slice(0, MAX_MODEL_ROWS)}>
            {(row) => (
              <box flexDirection="row">
                <text fg={props.theme.textMuted}>{shortModelLabel(row.model)}</text>
                <box flexGrow={1} />
                <text fg={props.theme.textMuted}>{formatInt(row.tokens)}</text>
              </box>
            )}
          </For>
          <Show when={data().perModel.length > MAX_MODEL_ROWS}>
            <text fg={props.theme.textMuted}>+{data().perModel.length - MAX_MODEL_ROWS} more</text>
          </Show>
        </Show>
      </box>
    </Show>
  );
}

const tui: TuiPlugin = async (api) => {
  api.slots.register({
    order: 120,
    slots: {
      sidebar_content(ctx, props) {
        return <View api={api} sessionID={props.session_id} theme={ctx.theme.current} />;
      },
    },
  });
};

const plugin: TuiPluginModule = {
  id: "oh-my-sidebar.session-tokens",
  tui,
};

export default plugin;
