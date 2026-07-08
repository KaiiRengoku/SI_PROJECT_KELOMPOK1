import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

function TaskButton({
  status,
  onClick,
}: {
  status: string;
  onClick?: () => void;
}) {
  const isDisabled = status === "Pending" || status === "Antrean";
  return (
    <button
      data-testid="task-button"
      disabled={isDisabled}
      onClick={onClick}
      className={isDisabled ? "opacity-50 cursor-not-allowed" : ""}
    >
      {status === "Selesai" ? "Selesai" : isDisabled ? "Terkunci" : "Kerjakan"}
    </button>
  );
}

describe("<TaskButton />", () => {
  it("should_disable_finish_button_if_status_is_pending", () => {
    render(<TaskButton status="Pending" />);

    const button = screen.getByTestId("task-button");
    expect(button).toBeDisabled();
    expect(button).toHaveClass("opacity-50");
    expect(button).toHaveClass("cursor-not-allowed");
  });

  it("should_disable_button_if_status_is_antrean", () => {
    render(<TaskButton status="Antrean" />);

    const button = screen.getByTestId("task-button");
    expect(button).toBeDisabled();
  });

  it("should_enable_button_if_status_is_selesai", () => {
    render(<TaskButton status="Selesai" />);

    const button = screen.getByTestId("task-button");
    expect(button).not.toBeDisabled();
  });

  it("should_render_correct_label_based_on_status", () => {
    render(<TaskButton status="Pending" />);
    expect(screen.getByTestId("task-button")).toHaveTextContent("Terkunci");
  });

  it("should_render_selesai_label_when_status_is_complete", () => {
    render(<TaskButton status="Selesai" />);
    expect(screen.getByTestId("task-button")).toHaveTextContent("Selesai");
  });
});
