import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  validateToken,
  hasActiveSubtasks,
} from "../lib/validation.js";

describe("AuthService — requireAuth", () => {
  it("should_reject_missing_auth_header", () => {
    const result = validateToken(undefined);
    expect(result.valid).toBe(false);
  });

  it("should_reject_invalid_auth_header_format", () => {
    const result = validateToken("Basic token123");
    expect(result.valid).toBe(false);
  });

  it("should_reject_empty_token", () => {
    const result = validateToken("Bearer ");
    expect(result.valid).toBe(false);
  });

  it("should_accept_valid_bearer_token", () => {
    const result = validateToken("Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.validtoken");
    expect(result.valid).toBe(true);
    expect(result.token).toBe("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.validtoken");
  });
});

describe("AuthService — login validation", () => {
  it("should_require_username_and_password", () => {
    const payload = {};
    const parsed = loginSchema.safeParse(payload);
    expect(parsed.success).toBe(false);
  });

  it("should_reject_empty_username", () => {
    const parsed = loginSchema.safeParse({ username: "", password: "123456" });
    expect(parsed.success).toBe(false);
  });

  it("should_accept_valid_login_payload", () => {
    const parsed = loginSchema.safeParse({ username: "admin", password: "123456" });
    expect(parsed.success).toBe(true);
  });
});

describe("AuthService — register validation", () => {
  it("should_reject_short_password", () => {
    const parsed = registerSchema.safeParse({
      username: "newuser",
      password: "ab",
      name: "New User",
    });
    expect(parsed.success).toBe(false);
  });

  it("should_transform_username_to_lowercase", () => {
    const parsed = registerSchema.safeParse({
      username: "NewUser",
      password: "123456",
      name: "New User",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.username).toBe("newuser");
    }
  });

  it("should_reject_empty_name", () => {
    const parsed = registerSchema.safeParse({
      username: "newuser",
      password: "123456",
      name: "",
    });
    expect(parsed.success).toBe(false);
  });
});

describe("WorkerService — unregister safety check", () => {
  it("should_reject_worker_deletion_with_active_subtask", () => {
    const subtasks = [
      { assignedTo: "user-1", status: "Sedang Dikerjakan" },
      { assignedTo: "user-1", status: "Selesai" },
    ];

    const result = hasActiveSubtasks(subtasks, "user-1");
    expect(result.hasActive).toBe(true);
    expect(result.count).toBe(1);
  });

  it("should_allow_deletion_when_no_active_subtasks", () => {
    const subtasks = [
      { assignedTo: "user-1", status: "Selesai" },
      { assignedTo: "user-1", status: "Selesai" },
    ];

    const result = hasActiveSubtasks(subtasks, "user-1");
    expect(result.hasActive).toBe(false);
    expect(result.count).toBe(0);
  });

  it("should_ignore_subtasks_assigned_to_other_users", () => {
    const subtasks = [
      { assignedTo: "user-2", status: "Sedang Dikerjakan" },
    ];

    const result = hasActiveSubtasks(subtasks, "user-1");
    expect(result.hasActive).toBe(false);
    expect(result.count).toBe(0);
  });
});
