import type { AssistantMessage, Message } from "@opencode-ai/sdk/v2";
import { describe, expect, it } from "vitest";

// Inline the functions we need to test (they're not exported from the plugin)
function readCost(m: Message): number {
  if (m.role !== "assistant") return 0;
  const n = m.cost;
  return typeof n === "number" && Number.isFinite(n) && n > 0 ? n : 0;
}

function buildBar(percent: number): { bar: string; clamped: number } {
  const BAR_WIDTH = 24;
  const clamped = Math.max(0, Math.min(100, percent));
  const filled = Math.max(0, Math.min(BAR_WIDTH, Math.round((clamped / 100) * BAR_WIDTH)));
  return {
    bar: `${"█".repeat(filled)}${"░".repeat(BAR_WIDTH - filled)}`,
    clamped,
  };
}

function makeAssistant(overrides?: Partial<AssistantMessage>): AssistantMessage {
  return {
    id: "msg-1",
    sessionID: "ses-1",
    role: "assistant",
    time: { created: Date.now() },
    parentID: "parent-1",
    modelID: "claude-sonnet-4",
    providerID: "anthropic",
    mode: "normal",
    path: { cwd: "/", root: "/" },
    cost: 0.42,
    tokens: { input: 100, output: 200, reasoning: 50, cache: { read: 30, write: 20 } },
    finish: "end",
    ...overrides,
  } as AssistantMessage;
}

describe("readCost", () => {
  it("returns cost for assistant messages", () => {
    expect(readCost(makeAssistant())).toBe(0.42);
  });

  it("returns 0 for user messages", () => {
    const userMsg: Message = {
      id: "msg-2",
      sessionID: "ses-1",
      role: "user",
      time: { created: Date.now() },
      agent: "default",
      model: { providerID: "anthropic", modelID: "claude-sonnet-4" },
    };
    expect(readCost(userMsg)).toBe(0);
  });

  it("returns 0 for zero cost", () => {
    expect(readCost(makeAssistant({ cost: 0 }))).toBe(0);
  });

  it("returns 0 for negative cost", () => {
    expect(readCost(makeAssistant({ cost: -1 }))).toBe(0);
  });
});

describe("buildBar", () => {
  it("renders empty bar at 0%", () => {
    const result = buildBar(0);
    expect(result.clamped).toBe(0);
    expect(result.bar).toBe("░".repeat(24));
  });

  it("renders full bar at 100%", () => {
    const result = buildBar(100);
    expect(result.clamped).toBe(100);
    expect(result.bar).toBe("█".repeat(24));
  });

  it("renders partial bar at 50%", () => {
    const result = buildBar(50);
    expect(result.clamped).toBe(50);
    expect(result.bar).toBe("█".repeat(12) + "░".repeat(12));
  });

  it("clamps values above 100", () => {
    const result = buildBar(150);
    expect(result.clamped).toBe(100);
    expect(result.bar).toBe("█".repeat(24));
  });

  it("clamps negative values to 0", () => {
    const result = buildBar(-10);
    expect(result.clamped).toBe(0);
    expect(result.bar).toBe("░".repeat(24));
  });
});
