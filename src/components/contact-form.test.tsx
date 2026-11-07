import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ContactForm } from "./contact-form";
import { topics } from "@/lib/site";

const { push, submitContact } = vi.hoisted(() => ({ push: vi.fn(), submitContact: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/lib/contact-transport", () => ({ contactIsAvailable: true, submitContact }));

afterEach(() => { vi.clearAllMocks(); sessionStorage.clear(); });

function fill() {
  render(<ContactForm />);
  fireEvent.change(screen.getByLabelText(/氏名/), { target: { value: "検証用" } });
  fireEvent.change(screen.getByLabelText(/メールアドレス/), { target: { value: "qa@example.invalid" } });
  fireEvent.click(screen.getByLabelText(topics[0]));
  fireEvent.change(screen.getByLabelText(/相談内容/), { target: { value: "異常系の架空データ" } });
  fireEvent.click(screen.getByRole("checkbox"));
  return screen.getByRole("form", { name: "相談フォーム" });
}

it("preselects the service topic while allowing the visitor to change it", () => {
  render(<ContactForm initialTopic={topics[1]} />);
  expect(screen.getByLabelText(topics[1])).toBeChecked();
  fireEvent.click(screen.getByLabelText(topics[0]));
  expect(screen.getByLabelText(topics[0])).toBeChecked();
  expect(screen.getByLabelText(topics[1])).not.toBeChecked();
});

it("blocks repeated submit events while an inquiry is in flight", async () => {
  let resolve!: (value: { ok: true }) => void;
  submitContact.mockReturnValue(new Promise(r => { resolve = r; }));
  const form = fill();
  fireEvent.submit(form);
  fireEvent.submit(form);
  expect(submitContact).toHaveBeenCalledOnce();
  expect(screen.getByRole("button", { name: /確認しています/ })).toBeDisabled();
  await act(async () => { resolve({ ok: true }); });
  expect(push).toHaveBeenCalledWith("/thanks");
});

it.each([
  ["rate_limited", "送信回数が上限に達しました"],
  ["failed", "送信できませんでした"],
])("shows %s guidance without clearing inputs or showing success", async (reason, text) => {
  submitContact.mockResolvedValue({ ok: false, reason });
  const form = fill();
  await act(async () => { fireEvent.submit(form); });
  expect(screen.getByRole("status")).toHaveTextContent(text);
  expect(screen.getByLabelText(/相談内容/)).toHaveValue("異常系の架空データ");
  expect(screen.getByRole("button", { name: /この内容で相談する/ })).toBeEnabled();
  expect(push).not.toHaveBeenCalled();
  expect(sessionStorage.getItem("consultation-received")).toBeNull();
});

it("allows the same form to retry after a notification failure", async () => {
  submitContact.mockResolvedValueOnce({ ok: false, reason: "failed" }).mockResolvedValueOnce({ ok: true });
  const form = fill();
  await act(async () => { fireEvent.submit(form); });
  await act(async () => { fireEvent.submit(form); });
  expect(submitContact).toHaveBeenCalledTimes(2);
  expect(push).toHaveBeenCalledOnce();
  expect(push).toHaveBeenCalledWith("/thanks");
});
