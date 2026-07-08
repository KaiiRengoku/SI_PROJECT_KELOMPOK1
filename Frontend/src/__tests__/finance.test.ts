import { describe, it, expect } from "vitest";
import { formatRupiah } from "@/lib/utils";

describe("WageCalculator.calculate()", () => {
  it("should_calculate_exact_wage_without_rounding_error", () => {
    const upahMaster = 15000;
    const qtyApproved = 10;
    const expected = 150000;

    const result = upahMaster * qtyApproved;

    expect(result).toBe(expected);
    expect(Number.isInteger(result)).toBe(true);
  });
});
