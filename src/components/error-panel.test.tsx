import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ErrorPanel } from "./error-panel";

describe("recoverable error pages", () => {
  it("offers a home route for a missing page", () => {
    render(<ErrorPanel kind="not-found" />);
    expect(
      screen.getByRole("heading", { name: /ちょっと迷子です/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ホームへ戻る/ })).toHaveAttribute(
      "href",
      "/",
    );
    expect(
      screen.queryByRole("button", { name: /もう一度試す/ }),
    ).not.toBeInTheDocument();
  });
  it("invokes recovery when the retry button is clicked", async () => {
    const retry = vi.fn();
    render(<ErrorPanel kind="error" onRetry={retry} />);
    await userEvent.click(screen.getByRole("button", { name: /もう一度試す/ }));
    expect(retry).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole("link", { name: /ホームへ戻る/ }),
    ).toBeInTheDocument();
  });
});
