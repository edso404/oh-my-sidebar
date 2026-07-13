import { describe, expect, it } from "vitest";
import { formatInt, formatMoney, safeNumber } from "./numbers.js";

describe("safeNumber", () => {
  it("returns the number for finite numbers", () => {
    expect(safeNumber(42)).toBe(42);
    expect(safeNumber(0)).toBe(0);
    expect(safeNumber(-1)).toBe(-1);
    expect(safeNumber(3.14)).toBe(3.14);
  });

  it("returns 0 for NaN", () => {
    expect(safeNumber(NaN)).toBe(0);
  });

  it("returns 0 for Infinity", () => {
    expect(safeNumber(Infinity)).toBe(0);
    expect(safeNumber(-Infinity)).toBe(0);
  });

  it("returns 0 for non-number types", () => {
    expect(safeNumber("42")).toBe(0);
    expect(safeNumber(null)).toBe(0);
    expect(safeNumber(undefined)).toBe(0);
    expect(safeNumber({})).toBe(0);
    expect(safeNumber([])).toBe(0);
  });
});

describe("formatInt", () => {
  it("formats positive integers with locale separators", () => {
    expect(formatInt(0)).toBe("0");
    expect(formatInt(123)).toBe("123");
    expect(formatInt(1234)).toBe("1,234");
    expect(formatInt(1234567)).toBe("1,234,567");
  });

  it("rounds to nearest integer", () => {
    expect(formatInt(12.7)).toBe("13");
    expect(formatInt(12.3)).toBe("12");
  });

  it("clamps negative values to 0", () => {
    expect(formatInt(-5)).toBe("0");
    expect(formatInt(-100)).toBe("0");
  });
});

describe("formatMoney", () => {
  it("formats with two decimal places", () => {
    expect(formatMoney(0)).toBe("$0.00");
    expect(formatMoney(1.5)).toBe("$1.50");
    expect(formatMoney(0.42)).toBe("$0.42");
  });

  it("formats large values", () => {
    expect(formatMoney(1234.56)).toBe("$1234.56");
    expect(formatMoney(1000000)).toBe("$1000000.00");
  });
});
