import { describe, expect, it } from "vitest";

function shortModelLabel(label: string): string {
  if (label.length <= 28) return label;
  return `${label.slice(0, 25)}...`;
}

describe("shortModelLabel", () => {
  it("returns short labels unchanged", () => {
    expect(shortModelLabel("gpt-4")).toBe("gpt-4");
    expect(shortModelLabel("claude-sonnet-4-20250514")).toBe("claude-sonnet-4-20250514");
  });

  it("truncates labels at exactly 28 chars boundary", () => {
    const label = "a".repeat(28);
    expect(shortModelLabel(label)).toBe(label);
  });

  it("truncates labels longer than 28 chars", () => {
    const label = "a".repeat(40);
    const result = shortModelLabel(label);
    expect(result).toBe(`${"a".repeat(25)}...`);
    expect(result.length).toBe(28);
  });

  it("handles empty string", () => {
    expect(shortModelLabel("")).toBe("");
  });
});
