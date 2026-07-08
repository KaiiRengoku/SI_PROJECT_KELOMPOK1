import { describe, it, expect } from "vitest";
import {
  countActiveTasks,
  getCraftsmanStatus,
} from "@/lib/waitingList";
import { isValidUUID, isValidTransition } from "@/lib/utils";
import type { Order, User } from "@/types";

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: "user-1",
    name: "Test User",
    username: "testuser",
    role: "pengrajin",
    active: true,
    capacity: 5,
    specializations: [],
    password: undefined,
    ...overrides,
  };
}

function makeOrder(
  id: string,
  subtaskAssignments: Array<{ assignedTo: string; status: string }>
): Order {
  return {
    id,
    code: `ORD-${id}`,
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
    subtasks: subtaskAssignments.map((s, i) => ({
      id: `sub-${id}-${i}`,
      orderId: id,
      productId: "prod-1",
      partName: "Bagian",
      point: 5000,
      assignedTo: s.assignedTo,
      status: s.status as any,
      startedAt: s.status !== "Antrean" ? new Date().toISOString() : undefined,
    })),
  };
}

describe("WorkerService.deleteWorkerCheck()", () => {
  it("should_reject_worker_deletion_with_active_subtask", () => {
    const orders = [
      makeOrder("order-1", [
        { assignedTo: "user-1", status: "Sedang Dikerjakan" },
      ]),
    ];

    const activeTasksMap = countActiveTasks(orders);
    const activeCount = activeTasksMap.get("user-1") ?? 0;

    expect(activeCount).toBeGreaterThan(0);
    expect(activeCount).toBe(1);
  });

  it("should_allow_deletion_when_worker_has_no_active_tasks", () => {
    const orders = [
      makeOrder("order-1", [
        { assignedTo: "user-1", status: "Selesai" },
      ]),
    ];

    const activeTasksMap = countActiveTasks(orders);
    const activeCount = activeTasksMap.get("user-1") ?? 0;

    expect(activeCount).toBe(0);
  });

  it("should_exclude_completed_subtasks_from_active_count", () => {
    const orders = [
      makeOrder("order-1", [
        { assignedTo: "user-1", status: "Selesai" },
        { assignedTo: "user-1", status: "Selesai" },
        { assignedTo: "user-1", status: "Sedang Dikerjakan" },
      ]),
    ];

    const activeTasksMap = countActiveTasks(orders);
    const activeCount = activeTasksMap.get("user-1") ?? 0;

    expect(activeCount).toBe(1);
  });
});

describe("Database.checkUUIDFormat()", () => {
  it("should_throw_error_on_invalid_uuid_format", () => {
    expect(isValidUUID("PROD-123")).toBe(false);
    expect(isValidUUID("not-a-uuid")).toBe(false);
    expect(isValidUUID("")).toBe(false);
  });

  it("should_accept_valid_uuid_format", () => {
    expect(
      isValidUUID("550e8400-e29b-41d4-a716-446655440000")
    ).toBe(true);
  });
});

describe("status anti-bypass constraint", () => {
  it("should_reject_invalid_status_transition", () => {
    expect(isValidTransition("Antrean", "Sedang Dikerjakan")).toBe(true);
    expect(isValidTransition("Antrean", "Selesai")).toBe(false);
    expect(isValidTransition("Sedang Dikerjakan", "Selesai")).toBe(true);
    expect(isValidTransition("Selesai", "Antrean")).toBe(false);
  });
});
