/** @jsxImportSource @opentui/solid */

import { formatInt, isAssistantMessage, spentTokenCount } from "@oh-my-sidebar/opencode-shared";
import type {
  TuiPlugin,
  TuiPluginApi,
  TuiPluginModule,
  TuiThemeCurrent,
} from "@opencode-ai/plugin/tui";
import { createMemo, createSignal, For, Show } from "solid-js";

const MAX_MODEL_ROWS = 10;

function shortModelLabel(label: string): string {
  if (label.length <= 28) return label;
  return `${label.slice(0, 25)}...`;
}

function View(props: { api: TuiPluginApi; sessionID: string; theme: TuiThemeCurrent }) {
  const [open, setOpen] = createSignal(false);
  const messages = createMemo(() => props.api.state.session.messages(props.sessionID));

  const data = createMemo(() => {
    const totals = new Map<string, number>();
    const seen = new Set<string>();
    let total = 0;

    for (const message of messages()) {
      if (!isAssistantMessage(message)) continue;
      if (seen.has(message.id)) continue;
      seen.add(message.id);

      const count = spentTokenCount(message.tokens);
      if (count <= 0) continue;

      total += count;
      totals.set(message.modelID, (totals.get(message.modelID) ?? 0) + count);
    }

    const perModel = [...totals.entries()]
      .map(([model, tokens]) => ({ model, tokens }))
      .sort((a, b) => b.tokens - a.tokens);

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
          // @ts-expect-error - selectable is a runtime Renderable property, not in BoxProps type
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
