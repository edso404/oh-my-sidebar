import { describe, expect, it } from "vitest";
import { spentTokenCount } from "./tokens.js";

describe("spentTokenCount", () => {
  it("sums input + output + reasoning + cache.write", () => {
    const tokens = {
      input: 100,
      output: 200,
      reasoning: 50,
      cache: { read: 999, write: 30 },
    };
    expect(spentTokenCount(tokens)).toBe(380); // 100 + 200 + 50 + 30
  });

  it("handles zero values", () => {
    const tokens = {
      input: 0,
      output: 0,
      reasoning: 0,
      cache: { read: 0, write: 0 },
    };
    expect(spentTokenCount(tokens)).toBe(0);
  });

  it("excludes cache.read from total", () => {
    const tokens = {
      input: 100,
      output: 100,
      reasoning: 0,
      cache: { read: 500, write: 0 },
    };
    expect(spentTokenCount(tokens)).toBe(200);
  });

  it("handles undefined tokens", () => {
    expect(spentTokenCount(undefined)).toBe(0);
  });

  it("handles null tokens", () => {
    expect(spentTokenCount(null)).toBe(0);
  });

  it("prefers tokens.total when available", () => {
    const tokens = {
      total: 30000,
      input: 0,
      output: 1500,
      reasoning: 0,
      cache: { read: 0, write: 0 },
    };
    expect(spentTokenCount(tokens)).toBe(30000);
  });

  it("falls back to sum when tokens.total is 0", () => {
    const tokens = {
      total: 0,
      input: 100,
      output: 200,
      reasoning: 50,
      cache: { read: 0, write: 30 },
    };
    expect(spentTokenCount(tokens)).toBe(380);
  });

  it("falls back to sum when tokens.total is undefined", () => {
    const tokens = {
      input: 100,
      output: 200,
      reasoning: 50,
      cache: { read: 0, write: 30 },
    };
    expect(spentTokenCount(tokens)).toBe(380);
  });
});
