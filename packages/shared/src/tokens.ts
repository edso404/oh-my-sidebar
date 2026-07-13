import type { AssistantMessage, Message } from "@opencode-ai/sdk/v2";

/**
 * Count "spent" tokens — input, output, reasoning, and cache write.
 * Cache reads are excluded since they don't consume quota.
 */
export function spentTokenCount(tokens: AssistantMessage["tokens"]): number {
  return tokens.input + tokens.output + tokens.reasoning + tokens.cache.write;
}

export function isAssistantMessage(m: Message): m is AssistantMessage {
  return m.role === "assistant";
}
