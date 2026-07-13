/** @jsxImportSource @opentui/solid */

import {
  formatInt,
  formatMoney,
  isAssistantMessage,
  safeNumber,
} from "@oh-my-sidebar/opencode-shared";
import type {
  TuiPlugin,
  TuiPluginApi,
  TuiPluginModule,
  TuiThemeCurrent,
} from "@opencode-ai/plugin/tui";
import type { AssistantMessage, Message } from "@opencode-ai/sdk/v2";
import { TextAttributes } from "@opentui/core";
import { createMemo } from "solid-js";

const BAR_WIDTH = 24;

function readCost(m: Message): number {
  if (!isAssistantMessage(m)) return 0;
  const n = m.cost;
  return typeof n === "number" && Number.isFinite(n) && n > 0 ? n : 0;
}

function buildBar(percent: number): { bar: string; clamped: number } {
  const clamped = Math.max(0, Math.min(100, percent));
  const filled = Math.max(0, Math.min(BAR_WIDTH, Math.round((clamped / 100) * BAR_WIDTH)));
  return {
    bar: `${"█".repeat(filled)}${"░".repeat(BAR_WIDTH - filled)}`,
    clamped,
  };
}

function View(props: { api: TuiPluginApi; sessionID: string; theme: TuiThemeCurrent }) {
  const messages = createMemo(() => props.api.state.session.messages(props.sessionID));

  const sessionCost = createMemo(() => {
    const sessionState = props.api.state.session.get(props.sessionID);
    const fromCost = (sessionState as { cost?: unknown })?.cost;
    if (typeof fromCost === "number" && Number.isFinite(fromCost) && fromCost > 0) return fromCost;

    return messages()
      .filter(isAssistantMessage)
      .reduce<number>((sum, m) => sum + readCost(m), 0);
  });

  const lastAssistant = createMemo(() => {
    return messages().findLast(
      (m): m is AssistantMessage => isAssistantMessage(m) && m.tokens.output > 0,
    );
  });

  const modelInfo = createMemo(() => {
    const last = lastAssistant();
    if (!last) return null;
    return (
      props.api.state.provider.find((item) => item.id === last.providerID)?.models?.[
        last.modelID
      ] ?? null
    );
  });

  const usage = createMemo(() => {
    const last = lastAssistant();
    if (!last) return { tokens: 0, contextWindow: 0, percent: 0 };

    const tokens =
      last.tokens.input +
      last.tokens.output +
      last.tokens.reasoning +
      last.tokens.cache.read +
      last.tokens.cache.write;
    const contextWindow = safeNumber(modelInfo()?.limit?.context);
    const percent = contextWindow > 0 ? Math.round((tokens / contextWindow) * 100) : 0;

    return { tokens, contextWindow, percent };
  });

  const detailLine = createMemo(() => {
    const state = usage();
    const limitText = state.contextWindow > 0 ? formatInt(state.contextWindow) : "--";
    return `${formatInt(state.tokens)} / ${limitText} / ${formatMoney(sessionCost())}`;
  });

  const progress = createMemo(() => {
    const percent = usage().percent;
    const bar = buildBar(percent);
    const color =
      percent >= 90 ? props.theme.error : percent >= 70 ? props.theme.warning : props.theme.accent;
    return { bar: bar.bar, color, percent: bar.clamped };
  });

  return (
    <box>
      <text fg={props.theme.text} attributes={TextAttributes.BOLD}>
        Context
      </text>
      <box flexDirection="row" gap={1}>
        <text fg={progress().color}>{progress().bar}</text>
        <text fg={progress().color}> {progress().percent}%</text>
      </box>
      <text fg={props.theme.textMuted}>{detailLine()}</text>
    </box>
  );
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
  id: "oh-my-sidebar.context-progress",
  tui,
};

export default plugin;
