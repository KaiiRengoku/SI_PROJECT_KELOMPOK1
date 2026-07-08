import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const registerSchema = z.object({
  username: z.string().min(1).transform((v) => v.trim().toLowerCase()),
  password: z.string().min(3, "Password minimal 3 karakter"),
  name: z.string().min(1),
});

export const orderCreateSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().min(1),
  customerName: z.string().min(1),
  customerPhone: z.string().optional().default(""),
  address: z.string().optional().default(""),
  notes: z.string().optional(),
  fastTrack: z.boolean().optional().default(false),
  type: z.enum(["custom", "ready_stock"]).optional(),
  source: z.string().optional(),
  deadline: z.string().optional(),
  locationName: z.string().optional(),
  isOnline: z.boolean().optional(),
});

export const pointEntrySchema = z.object({
  id: z.string(),
  user_id: z.string(),
  subtask_id: z.string(),
  order_id: z.string(),
  order_code: z.string(),
  product_name: z.string(),
  part_name: z.string(),
  point: z.number().int().default(0),
  date: z.string(),
  description: z.string().optional(),
});

export type OrderStatus =
  | "Antrean"
  | "Sedang Dikerjakan"
  | "Penyusunan"
  | "Siap Kirim"
  | "Selesai";

export type SubTaskStatus = "Antrean" | "Sedang Dikerjakan" | "Selesai";

export const orderStatusFlow: OrderStatus[] = [
  "Antrean",
  "Sedang Dikerjakan",
  "Penyusunan",
  "Siap Kirim",
  "Selesai",
];

export const subtaskStatusFlow: SubTaskStatus[] = [
  "Antrean",
  "Sedang Dikerjakan",
  "Selesai",
];

export function validateToken(authHeader?: string): { valid: boolean; token?: string } {
  if (!authHeader?.startsWith("Bearer ")) {
    return { valid: false };
  }
  const token = authHeader.slice(7);
  if (!token || token.length < 10) {
    return { valid: false };
  }
  return { valid: true, token };
}

export function hasActiveSubtasks(
  subtasks: Array<{ assignedTo?: string; status: string }>,
  userId: string
): { hasActive: boolean; count: number } {
  const active = subtasks.filter(
    (s) => s.assignedTo === userId && s.status !== "Selesai"
  );
  return { hasActive: active.length > 0, count: active.length };
}

export function generateCode(n: number): string {
  const now = new Date();
  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `ORD-${year}${month}-${String(n).padStart(4, "0")}`;
}

export function determineOrderType(
  type: string | undefined,
  quantity: number,
  totalStock: number
): { type: string; fastTrack: boolean } {
  let effType = type || "custom";
  if (effType === "ready_stock" && totalStock < quantity) {
    effType = "custom";
  }
  const effFastTrack = effType === "ready_stock" ? false : true;
  return { type: effType, fastTrack: effFastTrack };
}

export function getInitialStatus(effType: string): string {
  return effType === "ready_stock" ? "Siap Kirim" : "Antrean";
}

export function handleStockDeduction(currentStock: number, quantity: number): number {
  return Math.max(0, currentStock - quantity);
}

export function isValidOrderTransition(from: OrderStatus, to: OrderStatus): boolean {
  const fromIdx = orderStatusFlow.indexOf(from);
  const toIdx = orderStatusFlow.indexOf(to);
  if (fromIdx === -1 || toIdx === -1) return false;
  if (toIdx === fromIdx) return true;
  if (toIdx === fromIdx + 1) return true;
  return false;
}

export function isValidSubTaskTransition(from: SubTaskStatus, to: SubTaskStatus): boolean {
  const fromIdx = subtaskStatusFlow.indexOf(from);
  const toIdx = subtaskStatusFlow.indexOf(to);
  return fromIdx !== -1 && toIdx !== -1 && toIdx === fromIdx + 1;
}

export function autoTransitionOrderOnSubtaskStart(orderStatus: OrderStatus): OrderStatus {
  return orderStatus === "Antrean" ? "Sedang Dikerjakan" : orderStatus;
}

export function autoTransitionOrderOnAllDone(
  orderStatus: OrderStatus,
  allSubtasksDone: boolean
): OrderStatus {
  if (allSubtasksDone && orderStatus !== "Penyusunan" && orderStatus !== "Selesai") {
    return "Penyusunan";
  }
  return orderStatus;
}

export function calculateWage(point: number | string, quantity: number): number {
  const basePoint = typeof point === "string" ? parseFloat(point) || 0 : point;
  const result = basePoint * quantity;
  if (isNaN(result) || !isFinite(result)) return 0;
  return result;
}

export function newId(prefix: string): string {
  return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;
}
