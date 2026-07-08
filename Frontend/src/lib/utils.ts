import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatRupiah = (value: number | string) => {
  const numeric = typeof value === "number" ? value : parseFloat(value) || 0;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(numeric);
};

export function simpleHash(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    const char = value.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `hashed_${Math.abs(hash).toString(36)}`;
}

export interface AuthUser {
  id: string;
  role: string;
  name: string;
}

export function getDashboardRoute(user: AuthUser): string {
  const routes: Record<string, string> = {
    owner: "/dashboard/owner-read-only",
    admin: "/admin/dashboard",
    pengrajin: "/pengrajin/tasks",
  };
  return routes[user.role] ?? "/login";
}

export function validateStock(
  quantity: number,
  availableStock: number,
  orderType: string
): { valid: boolean; error?: string; type: string } {
  if (orderType === "ready_stock" && quantity > availableStock) {
    return {
      valid: false,
      error: "Kuantitas melebihi saldo stok aktual",
      type: "custom",
    };
  }
  return { valid: true, type: orderType };
}

export function isValidUUID(str: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export const allowedTransitions: Record<string, string[]> = {
  Antrean: ["Sedang Dikerjakan"],
  "Sedang Dikerjakan": ["Selesai"],
  Selesai: [],
};

export function isValidTransition(from: string, to: string): boolean {
  return allowedTransitions[from]?.includes(to) ?? false;
}
