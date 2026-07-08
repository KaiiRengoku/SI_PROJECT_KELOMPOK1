import { describe, it, expect } from "vitest";
import {
  pointEntrySchema,
  calculateWage,
  newId,
} from "../lib/validation.js";

describe("WageCalculator — calculate wage", () => {
  it("should_calculate_exact_wage_without_rounding_error", () => {
    const result = calculateWage(15000, 10);
    expect(result).toBe(150000);
    expect(Number.isInteger(result)).toBe(true);
  });

  it("should_multiply_point_by_quantity", () => {
    expect(calculateWage(4000, 3)).toBe(12000);
    expect(calculateWage(5000, 1)).toBe(5000);
    expect(calculateWage(3000, 0)).toBe(0);
  });

  it("should_handle_string_point_values", () => {
    expect(calculateWage("4000", 2)).toBe(8000);
  });

  it("should_return_zero_for_nan_inputs", () => {
    expect(calculateWage(undefined as any, 5)).toBe(0);
    expect(calculateWage(null as any, 5)).toBe(0);
    expect(calculateWage(NaN, 5)).toBe(0);
  });
});

describe("PointEntry — schema validation", () => {
  it("should_validate_correct_point_entry", () => {
    const entry = {
      id: "pt123",
      user_id: "user-1",
      subtask_id: "sub-1",
      order_id: "order-1",
      order_code: "ORD-2607-0001",
      product_name: "Tas Rajut",
      part_name: "Kepala",
      point: 4000,
      date: new Date().toISOString(),
    };
    const parsed = pointEntrySchema.safeParse(entry);
    expect(parsed.success).toBe(true);
  });

  it("should_apply_default_point_value", () => {
    const entry = {
      id: "pt124",
      user_id: "user-1",
      subtask_id: "sub-2",
      order_id: "order-1",
      order_code: "ORD-2607-0001",
      product_name: "Tas Rajut",
      part_name: "Badan",
      date: new Date().toISOString(),
    };
    const parsed = pointEntrySchema.safeParse(entry);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.point).toBe(0);
    }
  });
});

describe("PointEntry — ID generation", () => {
  it("should_generate_id_with_correct_prefix", () => {
    const id = newId("pt");
    expect(id.startsWith("pt")).toBe(true);
  });

  it("should_contain_timestamp_in_id", () => {
    const id = newId("pt");
    expect(id.length).toBeGreaterThan(10);
  });
});

describe("WageCalculator — anti NaN from empty quantity", () => {
  it("should_return_zero_when_quantity_is_missing", () => {
    const result = calculateWage(15000, undefined as any);
    expect(result).toBe(0);
    expect(isNaN(result)).toBe(false);
  });

  it("should_handle_zero_point_value", () => {
    const result = calculateWage(0, 10);
    expect(result).toBe(0);
  });
});
