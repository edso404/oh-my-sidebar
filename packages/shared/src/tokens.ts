import type { AssistantMessage, Message } from "@opencode-ai/sdk/v2";

/**
 * Count "spent" tokens — prefers `tokens.total` when available (authoritative),
 * otherwise falls back to summing input + output + reasoning + cache.write.
 * Cache reads are excluded since they don't consume quota.
 * Accepts undefined/null for runtime safety (streaming messages, partial data).
 */
export function spentTokenCount(tokens: AssistantMessage["tokens"] | undefined | null): number {
  if (!tokens) return 0;
  if (typeof tokens.total === "number" && Number.isFinite(tokens.total) && tokens.total > 0) {
    return tokens.total;
  }
  return tokens.input + tokens.output + tokens.reasoning + tokens.cache.write;
}

export function isAssistantMessage(m: Message): m is AssistantMessage {
  return m.role === "assistant";
}
