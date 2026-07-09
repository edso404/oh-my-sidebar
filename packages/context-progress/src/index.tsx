/** @jsxImportSource @opentui/solid */

import type {
  TuiPlugin,
  TuiPluginApi,
  TuiPluginModule,
  TuiThemeCurrent,
} from "@opencode-ai/plugin/tui";
import { TextAttributes } from "@opentui/core";
import { createMemo } from "solid-js";

const BAR_WIDTH = 24;

function formatInt(value: number): string {
  return new Intl.NumberFormat("en-US").format(Math.max(0, Math.round(value)));
}

function formatMoney(value: number): string {
  return `$${value.toFixed(2)}`;
}

function safeNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function readCost(source: unknown): number {
  const candidates = [
    (source as Record<string, unknown>)?.cost,
    ((source as Record<string, unknown>)?.info as Record<string, unknown> | undefined)?.cost,
    ((source as Record<string, unknown>)?.usage as Record<string, unknown> | undefined)?.cost,
    ((source as Record<string, unknown>)?.metrics as Record<string, unknown> | undefined)?.cost,
  ];
  for (const c of candidates) {
    const n = typeof c === "number" ? c : typeof c === "string" && c !== "" ? Number(c) : NaN;
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 0;
}

function messageTokenCount(message: unknown): number {
  const msg = message as Record<string, unknown> | undefined;
  const tokens = msg?.tokens as Record<string, unknown> | undefined;
  const input = safeNumber(tokens?.input);
  const output = safeNumber(tokens?.output);
  const reasoning = safeNumber(tokens?.reasoning);
  const cache = tokens?.cache as { read?: unknown; write?: unknown } | undefined;
  const cacheRead = safeNumber(cache?.read);
  const cacheWrite = safeNumber(cache?.write);
  return input + output + reasoning + cacheRead + cacheWrite;
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
    const sessionState = (props.api.state as Record<string, unknown>)?.session as
      | Record<string, unknown>
      | undefined;
    const fromState = readCost(
      (sessionState?.get as (id: string) => unknown | undefined)?.(props.sessionID),
    );
    if (fromState > 0) return fromState;

    return (messages() as unknown[])
      .filter((m) => {
        const role =
          ((m as Record<string, unknown>)?.role as string) ??
          ((m as Record<string, unknown>)?.info as Record<string, unknown> | undefined)?.role;
        return role === "assistant";
      })
      .reduce((sum, m) => sum + readCost(m), 0);
  });

  const usage = createMemo(() => {
    const lastAssistant = (messages() as unknown[]).findLast((m) => {
      const role =
        ((m as Record<string, unknown>)?.role as string) ??
        ((m as Record<string, unknown>)?.info as Record<string, unknown> | undefined)?.role;
      const output = safeNumber(
        ((m as Record<string, unknown>)?.tokens as Record<string, unknown> | undefined)?.output,
      );
      return role === "assistant" && output > 0;
    });

    if (!lastAssistant) {
      return { tokens: 0, contextWindow: 0, percent: 0 };
    }

    const tokens = messageTokenCount(lastAssistant);
    const providerID =
      ((lastAssistant as Record<string, unknown>)?.providerID as string) ??
      ((lastAssistant as Record<string, unknown>)?.info as Record<string, unknown> | undefined)
        ?.providerID;
    const modelID =
      ((lastAssistant as Record<string, unknown>)?.modelID as string) ??
      ((lastAssistant as Record<string, unknown>)?.info as Record<string, unknown> | undefined)
        ?.modelID;
    const model = props.api.state.provider.find((item) => item.id === providerID)?.models?.[
      modelID
    ];
    const contextWindow = safeNumber(model?.limit?.context);
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
