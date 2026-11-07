// @vitest-environment node
import { afterEach, expect, it, vi } from "vitest";
import { emptyContact } from "./contact-validation";

afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });

it("keeps the same key after notification/network failure and renews it after success", async () => {
  const fetchMock = vi.fn()
    .mockResolvedValueOnce(new Response(null, { status: 503 }))
    .mockRejectedValueOnce(new Error("network"))
    .mockResolvedValueOnce(Response.json({ ok: true }, { status: 201 }))
    .mockResolvedValueOnce(Response.json({ ok: true }, { status: 201 }));
  vi.stubGlobal("fetch", fetchMock);
  const { submitContact } = await import("./contact-transport");
  expect(await submitContact(emptyContact)).toEqual({ ok: false, reason: "failed" });
  await expect(submitContact(emptyContact)).rejects.toThrow("network");
  expect(await submitContact(emptyContact)).toEqual({ ok: true });
  await submitContact(emptyContact);
  const keys = fetchMock.mock.calls.map(([, init]) => JSON.parse(init.body).idempotencyKey);
  expect(keys[0]).toBe(keys[1]);
  expect(keys[0]).toBe(keys[2]);
  expect(keys[2]).not.toBe(keys[3]);
});

it("maps 429 to the form's rate limit guidance and preserves the retry key", async () => {
  const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(new Response(null, { status: 429 })));
  vi.stubGlobal("fetch", fetchMock);
  const { submitContact } = await import("./contact-transport");
  expect(await submitContact(emptyContact)).toEqual({ ok: false, reason: "rate_limited" });
  await submitContact(emptyContact);
  expect(JSON.parse(fetchMock.mock.calls[0][1].body).idempotencyKey)
    .toBe(JSON.parse(fetchMock.mock.calls[1][1].body).idempotencyKey);
});

it("uses a new key for edited content and keeps it for the edited retry", async () => {
  const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(new Response(null, { status: 503 })));
  vi.stubGlobal("fetch", fetchMock);
  const { submitContact } = await import("./contact-transport");
  await submitContact({ ...emptyContact, message: "保存済みの本文" });
  await submitContact({ ...emptyContact, message: "修正後の本文" });
  await submitContact({ ...emptyContact, message: "修正後の本文" });
  const [first, second, third] = fetchMock.mock.calls.map(([, init]) => JSON.parse(init.body));
  expect(first.idempotencyKey).not.toBe(second.idempotencyKey);
  expect(second.idempotencyKey).toBe(third.idempotencyKey);
  expect(first.message).not.toBe(second.message);
});

it("compares normalized sent fields so whitespace and unused corporate values do not change the key", async () => {
  const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(new Response(null, { status: 503 })));
  vi.stubGlobal("fetch", fetchMock);
  const { submitContact } = await import("./contact-transport");
  await submitContact({ ...emptyContact, name: " 検証 ", email: " qa@example.invalid ", message: " 本文 ", company: "法人用の下書き", role: "担当" });
  await submitContact({ ...emptyContact, name: "検証", email: "qa@example.invalid", message: "本文", company: "変更した下書き", role: "別担当" });
  const [first, second] = fetchMock.mock.calls.map(([, init]) => JSON.parse(init.body));
  expect(first).toEqual(second);
  expect(first).toEqual(expect.objectContaining({ name: "検証", email: "qa@example.invalid", message: "本文", company: null, role: null }));
});

it.each(["name", "email", "topic", "message", "applicantType"] as const)("renews the key when %s changes", async field => {
  const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(new Response(null, { status: 503 })));
  vi.stubGlobal("fetch", fetchMock);
  const { submitContact } = await import("./contact-transport");
  await submitContact(emptyContact);
  await submitContact({ ...emptyContact, [field]: field === "applicantType" ? "corporate" : "変更後" });
  const [first, second] = fetchMock.mock.calls.map(([, init]) => JSON.parse(init.body));
  expect(first.idempotencyKey).not.toBe(second.idempotencyKey);
});

it.each(["company", "role"] as const)("renews the key when corporate %s changes", async field => {
  const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(new Response(null, { status: 503 })));
  vi.stubGlobal("fetch", fetchMock);
  const { submitContact } = await import("./contact-transport");
  await submitContact({ ...emptyContact, applicantType: "corporate" });
  await submitContact({ ...emptyContact, applicantType: "corporate", [field]: "変更後" });
  const [first, second] = fetchMock.mock.calls.map(([, init]) => JSON.parse(init.body));
  expect(first.idempotencyKey).not.toBe(second.idempotencyKey);
});

it("does not clear a newer pending submission when an older request completes", async () => {
  let resolveFirst!: (response: Response) => void;
  const fetchMock = vi.fn()
    .mockReturnValueOnce(new Promise<Response>(resolve => { resolveFirst = resolve; }))
    .mockResolvedValueOnce(new Response(null, { status: 503 }))
    .mockResolvedValueOnce(new Response(null, { status: 503 }));
  vi.stubGlobal("fetch", fetchMock);
  const { submitContact } = await import("./contact-transport");
  const first = submitContact({ ...emptyContact, message: "最初の本文" });
  await submitContact({ ...emptyContact, message: "新しい本文" });
  resolveFirst(Response.json({ ok: true }, { status: 201 }));
  await first;
  await submitContact({ ...emptyContact, message: "新しい本文" });
  const [, second, third] = fetchMock.mock.calls.map(([, init]) => JSON.parse(init.body));
  expect(second.idempotencyKey).toBe(third.idempotencyKey);
});
