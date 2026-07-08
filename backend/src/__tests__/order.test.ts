import { describe, it, expect } from "vitest";
import {
  orderCreateSchema,
  generateCode,
  determineOrderType,
  getInitialStatus,
  handleStockDeduction,
} from "../lib/validation";

describe("OrderService — Zod schema validation", () => {
  it("should_reject_order_without_product_id", () => {
    const parsed = orderCreateSchema.safeParse({
      quantity: 5,
      customerName: "Test",
    });
    expect(parsed.success).toBe(false);
  });

  it("should_reject_order_with_zero_quantity", () => {
    const parsed = orderCreateSchema.safeParse({
      productId: "prod-1",
      quantity: 0,
      customerName: "Test",
    });
    expect(parsed.success).toBe(false);
  });

  it("should_apply_defaults_for_optional_fields", () => {
    const parsed = orderCreateSchema.safeParse({
      productId: "prod-1",
      quantity: 5,
      customerName: "Test",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.customerPhone).toBe("");
      expect(parsed.data.fastTrack).toBe(false);
    }
  });
});

describe("OrderService — code generation", () => {
  it("should_generate_valid_order_code_format", () => {
    const code = generateCode(1);
    expect(code).toMatch(/^ORD-\d{4}-\d{4}$/);
  });

  it("should_pad_number_to_4_digits", () => {
    const code = generateCode(1);
    expect(code).toMatch(/0001$/);
  });

  it("should_pad_large_number_correctly", () => {
    const code = generateCode(9999);
    expect(code).toMatch(/9999$/);
  });
});

describe("OrderService — anti stok minus", () => {
  it("should_downgrade_ready_stock_to_custom_when_stock_insufficient", () => {
    const result = determineOrderType("ready_stock", 5, 3);
    expect(result.type).toBe("custom");
    expect(result.fastTrack).toBe(true);
  });

  it("should_keep_ready_stock_when_stock_is_sufficient", () => {
    const result = determineOrderType("ready_stock", 5, 10);
    expect(result.type).toBe("ready_stock");
    expect(result.fastTrack).toBe(false);
  });

  it("should_allow_custom_order_regardless_of_stock", () => {
    const result = determineOrderType("custom", 100, 0);
    expect(result.type).toBe("custom");
  });

  it("should_default_to_custom_when_no_type_specified", () => {
    const result = determineOrderType(undefined, 5, 10);
    expect(result.type).toBe("custom");
  });
});

describe("OrderService — stock deduction (Math.max(0, ...))", () => {
  it("should_deduct_stock_normally", () => {
    const result = handleStockDeduction(10, 3);
    expect(result).toBe(7);
  });

  it("should_not_go_below_zero", () => {
    const result = handleStockDeduction(3, 5);
    expect(result).toBe(0);
  });

  it("should_handle_exact_stock", () => {
    const result = handleStockDeduction(5, 5);
    expect(result).toBe(0);
  });
});

describe("OrderService — initial status", () => {
  it("should_set_ready_stock_to_Siap_Kirim", () => {
    expect(getInitialStatus("ready_stock")).toBe("Siap Kirim");
  });

  it("should_set_custom_to_Antrean", () => {
    expect(getInitialStatus("custom")).toBe("Antrean");
  });
});
