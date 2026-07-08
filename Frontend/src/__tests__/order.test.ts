import { describe, it, expect } from "vitest";
import { z } from "zod";
import { validateStock } from "@/lib/utils";

const orderCreateSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().min(1),
  customerName: z.string().min(1),
});

describe("OrderService.validateRetailStock()", () => {
  it("should_block_retail_order_when_stock_insufficient", () => {
    const payload = {
      productId: "prod-1",
      quantity: 5,
      customerName: "Test",
    };

    const parsed = orderCreateSchema.safeParse(payload);
    expect(parsed.success).toBe(true);

    const result = validateStock(5, 3, "ready_stock");

    expect(result.valid).toBe(false);
    expect(result.error).toBe("Kuantitas melebihi saldo stok aktual");
    expect(result.type).toBe("custom");
  });

  it("should_allow_order_when_stock_is_sufficient", () => {
    const result = validateStock(5, 10, "ready_stock");

    expect(result.valid).toBe(true);
    expect(result.type).toBe("ready_stock");
  });

  it("should_skip_stock_check_for_custom_orders", () => {
    const result = validateStock(5, 0, "custom");

    expect(result.valid).toBe(true);
    expect(result.type).toBe("custom");
  });

  it("should_reject_order_with_zero_quantity", () => {
    const payload = {
      productId: "prod-1",
      quantity: 0,
      customerName: "Test",
    };

    const parsed = orderCreateSchema.safeParse(payload);
    expect(parsed.success).toBe(false);
  });

  it("should_reject_order_without_product_id", () => {
    const payload = {
      quantity: 5,
      customerName: "Test",
    };

    const parsed = orderCreateSchema.safeParse(payload);
    expect(parsed.success).toBe(false);
  });
});
