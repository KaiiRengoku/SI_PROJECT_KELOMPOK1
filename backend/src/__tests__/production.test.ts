import { describe, it, expect } from "vitest";
import {
  isValidOrderTransition,
  isValidSubTaskTransition,
  autoTransitionOrderOnSubtaskStart,
  autoTransitionOrderOnAllDone,
  hasActiveSubtasks,
} from "../lib/validation";

describe("Anti-Bypass — order status transitions", () => {
  it("should_allow_forward_transition_from_antrean", () => {
    expect(isValidOrderTransition("Antrean", "Sedang Dikerjakan")).toBe(true);
  });

  it("should_reject_skipping_status_antrean_to_selesai", () => {
    expect(isValidOrderTransition("Antrean", "Selesai")).toBe(false);
  });

  it("should_reject_backwards_transition", () => {
    expect(isValidOrderTransition("Selesai", "Antrean")).toBe(false);
  });

  it("should_allow_consecutive_transitions", () => {
    expect(isValidOrderTransition("Sedang Dikerjakan", "Penyusunan")).toBe(true);
    expect(isValidOrderTransition("Penyusunan", "Siap Kirim")).toBe(true);
    expect(isValidOrderTransition("Siap Kirim", "Selesai")).toBe(true);
  });

  it("should_keep_same_status_as_valid", () => {
    expect(isValidOrderTransition("Antrean", "Antrean")).toBe(true);
  });
});

describe("Anti-Bypass — subtask status transitions", () => {
  it("should_allow_antrean_to_sedang_dikerjakan", () => {
    expect(isValidSubTaskTransition("Antrean", "Sedang Dikerjakan")).toBe(true);
  });

  it("should_reject_antrean_to_selesai_skip", () => {
    expect(isValidSubTaskTransition("Antrean", "Selesai")).toBe(false);
  });

  it("should_reject_backwards_transition", () => {
    expect(isValidSubTaskTransition("Selesai", "Antrean")).toBe(false);
  });
});

describe("Auto-transition — order when subtask starts", () => {
  it("should_upgrade_antrean_to_sedang_dikerjakan", () => {
    const result = autoTransitionOrderOnSubtaskStart("Antrean");
    expect(result).toBe("Sedang Dikerjakan");
  });

  it("should_keep_existing_status_if_not_antrean", () => {
    const result = autoTransitionOrderOnSubtaskStart("Sedang Dikerjakan");
    expect(result).toBe("Sedang Dikerjakan");
  });
});

describe("Auto-transition — order when all subtasks done", () => {
  it("should_transition_to_penyusunan_when_all_done", () => {
    const result = autoTransitionOrderOnAllDone("Sedang Dikerjakan", true);
    expect(result).toBe("Penyusunan");
  });

  it("should_not_transition_if_not_all_done", () => {
    const result = autoTransitionOrderOnAllDone("Sedang Dikerjakan", false);
    expect(result).toBe("Sedang Dikerjakan");
  });

  it("should_not_transition_if_already_selesai", () => {
    const result = autoTransitionOrderOnAllDone("Selesai", true);
    expect(result).toBe("Selesai");
  });
});

describe("WorkerService — delete worker with active subtask", () => {
  it("should_reject_deletion_with_active_subtask", () => {
    const subtasks = [
      { assignedTo: "worker-1", status: "Sedang Dikerjakan" },
    ];
    const result = hasActiveSubtasks(subtasks, "worker-1");
    expect(result.hasActive).toBe(true);
    expect(result.count).toBe(1);
  });

  it("should_allow_deletion_with_no_active_subtasks", () => {
    const subtasks = [
      { assignedTo: "worker-1", status: "Selesai" },
    ];
    const result = hasActiveSubtasks(subtasks, "worker-1");
    expect(result.hasActive).toBe(false);
    expect(result.count).toBe(0);
  });
});
