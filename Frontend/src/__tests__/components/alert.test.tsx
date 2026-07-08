import { describe, it, expect } from "vitest";
import { countActiveCustomOrders } from "@/lib/waitingList";
import type { Order } from "@/types";

function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: "test-id",
    code: "ORD-0001",
    type: "custom",
    productId: "prod-1",
    productName: "Produk",
    quantity: 1,
    customerName: "Customer",
    customerPhone: "",
    address: "",
    notes: undefined,
    fastTrack: false,
    status: "Antrean",
    createdAt: new Date().toISOString(),
    deadline: new Date().toISOString(),
    subtasks: [],
    ...overrides,
  };
}

describe("AlertComponent.checkOverload()", () => {
  it("should_trigger_red_alert_when_waiting_list_exceeds_10", () => {
    const orders = Array.from({ length: 11 }, (_, i) =>
      makeOrder({ id: `order-${i}` })
    );

    const overload = countActiveCustomOrders(orders) > 10;

    expect(countActiveCustomOrders(orders)).toBe(11);
    expect(overload).toBe(true);
  });

  it("should_not_trigger_alert_when_waiting_list_is_10_or_less", () => {
    const orders = Array.from({ length: 10 }, (_, i) =>
      makeOrder({ id: `order-${i}` })
    );

    const overload = countActiveCustomOrders(orders) > 10;

    expect(countActiveCustomOrders(orders)).toBe(10);
    expect(overload).toBe(false);
  });

  it("should_exclude_completed_custom_orders_from_count", () => {
    const activeOrders = Array.from({ length: 11 }, (_, i) =>
      makeOrder({ id: `active-${i}`, status: "Antrean" })
    );
    const completedOrders = Array.from({ length: 5 }, (_, i) =>
      makeOrder({ id: `done-${i}`, status: "Selesai" })
    );
    const allOrders = [...activeOrders, ...completedOrders];

    const overload = countActiveCustomOrders(allOrders) > 10;

    expect(countActiveCustomOrders(allOrders)).toBe(11);
    expect(overload).toBe(true);
  });

  it("should_exclude_ready_stock_orders_from_overload_check", () => {
    const customOrders = Array.from({ length: 11 }, (_, i) =>
      makeOrder({ id: `custom-${i}` })
    );
    const readyStockOrders = Array.from({ length: 100 }, (_, i) =>
      makeOrder({ id: `stock-${i}`, type: "ready_stock" })
    );
    const allOrders = [...customOrders, ...readyStockOrders];

    const overload = countActiveCustomOrders(allOrders) > 10;

    expect(countActiveCustomOrders(allOrders)).toBe(11);
    expect(overload).toBe(true);
  });
});
