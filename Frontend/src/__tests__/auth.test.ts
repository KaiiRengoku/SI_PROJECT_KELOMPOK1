import { describe, it, expect } from "vitest";
import { simpleHash, getDashboardRoute } from "@/lib/utils";
import type { AuthUser } from "@/lib/utils";

describe("AuthService.hashPassword()", () => {
  it("should_hash_password_on_save", () => {
    const plainPassword = "Rahasia123";
    const hashedPassword = simpleHash(plainPassword);

    expect(hashedPassword).not.toBe(plainPassword);
    expect(typeof hashedPassword).toBe("string");
    expect(hashedPassword.startsWith("hashed_")).toBe(true);
  });

  it("should_produce_different_hash_for_different_passwords", () => {
    const hash1 = simpleHash("Rahasia123");
    const hash2 = simpleHash("Rahasia456");

    expect(hash1).not.toBe(hash2);
  });

  it("should_produce_consistent_hash_for_same_password", () => {
    const hash1 = simpleHash("Rahasia123");
    const hash2 = simpleHash("Rahasia123");

    expect(hash1).toBe(hash2);
  });
});

describe("AuthService.redirectByRole()", () => {
  it("should_route_owner_to_readonly_dashboard", () => {
    const owner: AuthUser = {
      id: "user-1",
      role: "owner",
      name: "Owner",
    };

    const route = getDashboardRoute(owner);

    expect(route).toBe("/dashboard/owner-read-only");
  });

  it("should_route_admin_to_admin_dashboard", () => {
    const admin: AuthUser = {
      id: "user-2",
      role: "admin",
      name: "Admin",
    };

    const route = getDashboardRoute(admin);

    expect(route).toBe("/admin/dashboard");
  });

  it("should_route_pengrajin_to_tasks_page", () => {
    const pengrajin: AuthUser = {
      id: "user-3",
      role: "pengrajin",
      name: "Pengrajin",
    };

    const route = getDashboardRoute(pengrajin);

    expect(route).toBe("/pengrajin/tasks");
  });

  it("should_redirect_unknown_role_to_login", () => {
    const unknown: AuthUser = {
      id: "user-4",
      role: "unknown",
      name: "Unknown",
    };

    const route = getDashboardRoute(unknown);

    expect(route).toBe("/login");
  });
});
