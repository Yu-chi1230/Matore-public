import { afterEach, describe, expect, it, vi } from "vitest";
import { handleContactRequest, MAX_CONTACT_BODY_BYTES, validateContactPayload } from "./contact-api.mjs";
import { topics } from "../src/lib/site";

const valid = {
  applicantType: "corporate",
  company: "テスト株式会社",
  name: "山田太郎",
  email: "test@example.com",
  role: "総務",
  topic: "退職後のアクセスを残さない",
  message: "相談内容です。",
  consent: true,
  idempotencyKey: "123e4567-e89b-42d3-a456-426614174000",
};

describe("contact Worker boundary", () => {
  afterEach(() => vi.unstubAllGlobals());
  it.each(topics)("accepts the website's topic: %s", (topic) => {
    expect(validateContactPayload({ ...valid, topic }))
      .toEqual(expect.objectContaining({ topic }));
  });

  it("rejects a topic that is not offered by the website", () => {
    expect(validateContactPayload({ ...valid, topic: "unknown-service" })).toBeNull();
  });
  it("normalizes individual applications without corporate details", () => {
    expect(validateContactPayload({ ...valid, applicantType: "individual", company: "残さない", role: "残さない" }))
      .toEqual(expect.objectContaining({ applicant_type: "individual", company: null, role: null }));
  });

  it("requires corporate details", () => {
    expect(validateContactPayload({ ...valid, company: "" })).toBeNull();
  });

  it("rejects a body larger than 12KB before external calls", async () => {
    const response = await handleContactRequest(new Request("https://matore.jp/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "x".repeat(MAX_CONTACT_BODY_BYTES + 1),
    }), {});
    expect(response.status).toBe(413);
  });

  it("rejects unsupported content types", async () => {
    const response = await handleContactRequest(new Request("https://matore.jp/api/contact", { method: "POST", body: "{}" }), {});
    expect(response.status).toBe(415);
  });

  it("saves, notifies and marks a valid inquiry", async () => {
    const inquiry = {
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      applicant_type: "corporate",
      company: valid.company,
      name: valid.name,
      email: valid.email,
      role: valid.role,
      topic: valid.topic,
      message: valid.message,
      notification_sent_at: null,
      created_at: "2026-09-24T00:00:00.000Z",
    };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response("true"))
      .mockResolvedValueOnce(Response.json([inquiry]))
      .mockResolvedValueOnce(Response.json({ id: "mail-id" }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    const response = await handleContactRequest(new Request("https://matore.jp/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json", "cf-connecting-ip": "192.0.2.1" },
      body: JSON.stringify(valid),
    }), {
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "service-key",
      CONTACT_RATE_LIMIT_SECRET: "test-secret",
      RESEND_API_KEY: "resend-key",
      CONTACT_NOTIFICATION_TO: "owner@example.com",
      CONTACT_NOTIFICATION_FROM: "Matore <contact@example.com>",
    });
    expect(response.status).toBe(201);
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(fetchMock.mock.calls[2][1].headers["idempotency-key"]).toBe(`contact-${inquiry.id}`);
  });
});
