import type { TuiPlugin, TuiPluginApi, TuiPluginModule } from "@opencode-ai/plugin/tui";
import { TextAttributes } from "@opentui/core";
/** @jsxImportSource @opentui/solid */
import { createMemo, createSignal, onCleanup } from "solid-js";

const BAR_WIDTH = 24;

function formatInt(value: number): string {
  return new Intl.NumberFormat("en-US").format(Math.max(0, Math.round(value)));
}

function formatLimit(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
  return formatInt(value);
}

function formatMoney(value: number): string {
  return `$${value.toFixed(2)}`;
}

function safeNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function buildBar(percent: number): { bar: string; clamped: number } {
  const clamped = Math.max(0, Math.min(100, percent));
  const filled = Math.max(0, Math.min(BAR_WIDTH, Math.round((clamped / 100) * BAR_WIDTH)));
  return {
    bar: `${"█".repeat(filled)}${"░".repeat(BAR_WIDTH - filled)}`,
    clamped,
  };
}

function View(props: { api: TuiPluginApi; sessionID: string }) {
  const [bump, setBump] = createSignal(0);

  // Re-read state when session data changes (SolidJS createMemo doesn't track
  // plain function calls like session.messages() / session.get())
  onCleanup(
    props.api.event.on("message.updated", (ev) => {
      if (ev.properties.sessionID === props.sessionID) setBump((v) => v + 1);
    }),
  );
  onCleanup(
    props.api.event.on("session.updated", (ev) => {
      if (ev.properties.sessionID === props.sessionID) setBump((v) => v + 1);
    }),
  );

  // Context window limit — from the last assistant message's model
  const contextWindow = createMemo(() => {
    bump();
    // biome-ignore lint/suspicious/noExplicitAny: plugin API types don't expose message internals
    const msgs = props.api.state.session.messages(props.sessionID) as any[];
    const last = msgs.findLast(
      // biome-ignore lint/suspicious/noExplicitAny: message union discriminator
      (m: any) => (m?.role ?? m?.info?.role) === "assistant",
    );
    if (!last) return 0;

    const providerID = last?.providerID ?? last?.info?.providerID;
    const modelID = last?.modelID ?? last?.info?.modelID;
    return safeNumber(
      props.api.state.provider.find((p) => p.id === providerID)?.models?.[modelID]?.limit?.context,
    );
  });

  // Session-level token totals (covers all messages, not just the last)
  const sessionTokens = createMemo(() => {
    bump();
    const t = props.api.state.session.get(props.sessionID)?.tokens;
    return (
      safeNumber(t?.input) +
      safeNumber(t?.output) +
      safeNumber(t?.reasoning) +
      safeNumber(t?.cache?.read) +
      safeNumber(t?.cache?.write)
    );
  });

  // Session cost — prefer session cost, fall back to summing message costs
  const sessionCost = createMemo(() => {
    bump();
    const cost = safeNumber(props.api.state.session.get(props.sessionID)?.cost);
    if (cost > 0) return cost;
    // biome-ignore lint/suspicious/noExplicitAny: plugin API types don't expose cost
    const msgs = props.api.state.session.messages(props.sessionID) as any[];
    return msgs
      .filter((m) => (m?.role ?? m?.info?.role) === "assistant")
      .reduce((sum, m) => sum + safeNumber(m?.cost), 0);
  });

  const theme = () => props.api.theme.current;

  const progress = createMemo(() => {
    const limit = contextWindow();
    const tokens = sessionTokens();
    const pct = limit > 0 ? Math.round((tokens / limit) * 100) : 0;
    const bar = buildBar(pct);
    const color = pct >= 90 ? theme().error : pct >= 70 ? theme().warning : theme().accent;
    return { bar: bar.bar, color, percent: bar.clamped };
  });

  const detailLine = createMemo(() => {
    const limit = contextWindow();
    const tokens = sessionTokens();
    const limitText = limit > 0 ? formatLimit(limit) : "--";
    return `${formatInt(tokens)} / ${limitText} / ${formatMoney(sessionCost())}`;
  });

  return (
    <box>
      <text fg={theme().text} attributes={TextAttributes.BOLD}>
        Context
      </text>
      <box flexDirection="row" gap={1}>
        <text fg={progress().color}>{progress().bar}</text>
        <text fg={progress().color}> {progress().percent}%</text>
      </box>
      <text fg={theme().textMuted}>{detailLine()}</text>
    </box>
  );
}

const tui: TuiPlugin = async (api) => {
  const { slots } = api;

  slots.register({
    order: 100,
    slots: {
      sidebar_content(_ctx, props) {
        return <View api={api} sessionID={props.session_id} />;
      },
    },
  });
};

const plugin: TuiPluginModule & { id: string } = {
  id: "oh-my-sidebar.context-progress",
  tui,
};

export default plugin;
