// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { handleContactRequest, retryPendingNotifications } from "./contact-api.mjs";
import worker from "./index.mjs";

const payload = {
  applicantType: "individual", name: "検証用", email: "qa@example.invalid",
  topic: "退職後のアクセスを残さない", message: "異常系検証用の架空データ",
  consent: true, idempotencyKey: "123e4567-e89b-42d3-a456-426614174000",
};
const env = {
  NEXT_PUBLIC_SUPABASE_URL: "https://db.example.invalid",
  SUPABASE_SERVICE_ROLE_KEY: "test-service-role", CONTACT_RATE_LIMIT_SECRET: "test-secret",
  RESEND_API_KEY: "test-resend", CONTACT_NOTIFICATION_TO: "owner@example.invalid",
  CONTACT_NOTIFICATION_FROM: "qa@example.invalid",
};
const inquiry = (extra = {}) => ({
  id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", applicant_type: "individual",
  company: null, role: null, name: payload.name, email: payload.email,
  topic: payload.topic, message: payload.message, idempotency_key: payload.idempotencyKey,
  notification_sent_at: null, created_at: "2026-10-13T00:00:00Z", ...extra,
});
const request = (extra = {}, ip = "192.0.2.1") => new Request("https://matore.jp/api/contact", {
  method: "POST", headers: { "content-type": "application/json", "cf-connecting-ip": ip },
  body: JSON.stringify({ ...payload, ...extra }),
});

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("contact duplicate submissions", () => {
  it("reuses a notified inquiry without sending another email", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json(true))
      .mockResolvedValueOnce(Response.json([]))
      .mockResolvedValueOnce(Response.json([inquiry({ notification_sent_at: "2026-10-13T00:01:00Z" })]));
    vi.stubGlobal("fetch", fetchMock);
    const response = await handleContactRequest(request(), env);
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1][1].headers.prefer).toContain("resolution=ignore-duplicates");
    expect(fetchMock.mock.calls.some(([url]) => url.includes("resend.com"))).toBe(false);
  });

  it("retries an unnotified inquiry using the existing record and email idempotency key", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json(true))
      .mockResolvedValueOnce(Response.json([]))
      .mockResolvedValueOnce(Response.json([inquiry()]))
      .mockResolvedValueOnce(Response.json({ id: "mail" }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    expect((await handleContactRequest(request(), env)).status).toBe(201);
    expect(fetchMock.mock.calls[3][1].headers["idempotency-key"]).toBe(`contact-${inquiry().id}`);
    expect(fetchMock.mock.calls[4][1].method).toBe("PATCH");
  });

  it("refuses a reused key with changed content without overwriting or notifying", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json(true))
      .mockResolvedValueOnce(Response.json([]))
      .mockResolvedValueOnce(Response.json([inquiry()]));
    vi.stubGlobal("fetch", fetchMock);
    const response = await handleContactRequest(request({ message: "変更した相談内容" }), env);
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ ok: false, code: "temporarily_unavailable" });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(log).toHaveBeenCalledWith("contact_request_failed", "idempotency-conflict");
  });
});

describe("contact rate limit boundary", () => {
  it("returns 429 without saving or notifying when the database rejects an attempt", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json(false));
    vi.stubGlobal("fetch", fetchMock);
    const response = await handleContactRequest(request(), env);
    expect(response.status).toBe(429);
    expect(await response.json()).toEqual({ ok: false, code: "rate_limited" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("fails closed when the rate limit RPC is unavailable", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 500 }));
    vi.stubGlobal("fetch", fetchMock);
    expect((await handleContactRequest(request(), env)).status).toBe(503);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("sends a stable keyed IP hash to the privileged RPC instead of the IP itself", async () => {
    const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(Response.json(false)));
    vi.stubGlobal("fetch", fetchMock);
    await handleContactRequest(request(), env);
    await handleContactRequest(request(), env);
    await handleContactRequest(request({}, "192.0.2.2"), env);
    const hashes = fetchMock.mock.calls.map(([, init]) => JSON.parse(init.body).p_ip_hash);
    expect(hashes[0]).toMatch(/^[0-9a-f]{64}$/);
    expect(hashes[0]).toBe(hashes[1]);
    expect(hashes[0]).not.toBe(hashes[2]);
    expect(fetchMock.mock.calls[0][1].body).not.toContain("192.0.2.1");
    expect(fetchMock.mock.calls[0][1].headers.authorization).toBe("Bearer test-service-role");
  });
});

describe("contact notification recovery", () => {
  it("keeps saved data and returns a non-personal 503 when Resend rejects a notification", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json(true))
      .mockResolvedValueOnce(Response.json([inquiry()]))
      .mockResolvedValueOnce(new Response(null, { status: 500 }));
    vi.stubGlobal("fetch", fetchMock);
    const response = await handleContactRequest(request(), env);
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ ok: false, code: "temporarily_unavailable" });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls.some(([, init]) => ["PATCH", "DELETE"].includes(init.method))).toBe(false);
    expect(log).toHaveBeenCalledWith("contact_request_failed", "notification");
  });

  it("leaves the inquiry pending when delivery succeeds but marking fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json(true))
      .mockResolvedValueOnce(Response.json([inquiry()]))
      .mockResolvedValueOnce(Response.json({ id: "mail" }))
      .mockResolvedValueOnce(new Response(null, { status: 500 }));
    vi.stubGlobal("fetch", fetchMock);
    expect((await handleContactRequest(request(), env)).status).toBe(503);
    expect(fetchMock.mock.calls[2][1].headers["idempotency-key"]).toBe(`contact-${inquiry().id}`);
  });

  it("scheduled recovery notifies and marks pending data with the same email key", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json([inquiry()]))
      .mockResolvedValueOnce(Response.json({ id: "mail" }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    await retryPendingNotifications(env);
    expect(fetchMock.mock.calls[0][0]).toContain("notification_sent_at=is.null&order=created_at.asc&limit=50");
    expect(fetchMock.mock.calls[1][1].headers["idempotency-key"]).toBe(`contact-${inquiry().id}`);
    expect(JSON.parse(fetchMock.mock.calls[2][1].body).notification_sent_at).toBeTruthy();
  });

  it("continues to the next pending inquiry after one notification fails", async () => {
    const second = inquiry({ id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb" });
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json([inquiry(), second]))
      .mockResolvedValueOnce(new Response(null, { status: 500 }))
      .mockResolvedValueOnce(Response.json({ id: "mail" }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    await retryPendingNotifications(env);
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(fetchMock.mock.calls[3][0]).toContain(second.id);
  });

  it("does nothing when there are no pending notifications", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json([]));
    vi.stubGlobal("fetch", fetchMock);
    await retryPendingNotifications(env);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("reports a pending lookup failure to the scheduler", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 500 })));
    await expect(retryPendingNotifications(env)).rejects.toThrow("pending-lookup");
  });

  it("connects the actual Worker scheduled handler to recovery", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json([]));
    vi.stubGlobal("fetch", fetchMock);
    const waitUntil = vi.fn();
    await worker.scheduled({}, env, { waitUntil });
    expect(waitUntil).toHaveBeenCalledOnce();
    await waitUntil.mock.calls[0][0];
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
