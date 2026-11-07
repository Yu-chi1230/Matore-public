import { contactTopics, legacyContactTopics } from "../src/lib/contact-topics.mjs";

export const MAX_CONTACT_BODY_BYTES = 12 * 1024;
const TOPICS = [...contactTopics, ...legacyContactTopics];

const json = (status, code) => new Response(JSON.stringify({ ok: false, code }), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
});

const textValue = (value, max) =>
  typeof value === "string" && value.trim().length > 0 && value.length <= max;

async function readLimitedBody(request) {
  if (!request.body) return new Uint8Array();
  const reader = request.body.getReader();
  const chunks = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > MAX_CONTACT_BODY_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const body = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

export function validateContactPayload(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  if (value.applicantType !== "individual" && value.applicantType !== "corporate") return null;
  if (!textValue(value.name, 80) || !textValue(value.email, 254) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email.trim()) ||
      !TOPICS.includes(value.topic) || !textValue(value.message, 3000) ||
      value.consent !== true ||
      typeof value.idempotencyKey !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.idempotencyKey)) return null;
  if (value.applicantType === "corporate" &&
      (!textValue(value.company, 120) || !textValue(value.role, 200))) return null;
  return {
    applicant_type: value.applicantType,
    company: value.applicantType === "corporate" ? value.company.trim() : null,
    name: value.name.trim(),
    email: value.email.trim(),
    role: value.applicantType === "corporate" ? value.role.trim() : null,
    topic: value.topic,
    message: value.message.trim(),
    idempotency_key: value.idempotencyKey,
    consent_at: new Date().toISOString(),
  };
}

function supabaseHeaders(env, prefer) {
  return {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    "content-type": "application/json",
    ...(prefer ? { prefer } : {}),
  };
}

async function supabase(env, path, init = {}) {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("configuration");
  return fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: { ...supabaseHeaders(env, init.prefer), ...init.headers },
  });
}

async function ipHash(request, secret) {
  if (!secret) throw new Error("configuration");
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(ip));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function consumeRateLimit(request, env) {
  const response = await supabase(env, "rpc/consume_contact_rate_limit", {
    method: "POST",
    body: JSON.stringify({ p_ip_hash: await ipHash(request, env.CONTACT_RATE_LIMIT_SECRET) }),
  });
  if (!response.ok) throw new Error(`rate-limit:${response.status}`);
  return response.json();
}

async function saveInquiry(payload, env) {
  const inserted = await supabase(env, "contact_inquiries?on_conflict=idempotency_key", {
    method: "POST",
    prefer: "resolution=ignore-duplicates,return=representation",
    body: JSON.stringify(payload),
  });
  if (!inserted.ok) throw new Error("save");
  const rows = await inserted.json();
  if (rows[0]) return rows[0];
  const existing = await supabase(env, `contact_inquiries?idempotency_key=eq.${encodeURIComponent(payload.idempotency_key)}&select=*`, { method: "GET" });
  if (!existing.ok) throw new Error("lookup");
  const inquiry = (await existing.json())[0];
  if (!inquiry || ["applicant_type", "company", "name", "email", "role", "topic", "message"]
    .some((field) => inquiry[field] !== payload[field])) throw new Error("idempotency-conflict");
  return inquiry;
}

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

async function notify(inquiry, env) {
  if (!env.RESEND_API_KEY || !env.CONTACT_NOTIFICATION_TO || !env.CONTACT_NOTIFICATION_FROM) throw new Error("configuration");
  const corporate = inquiry.applicant_type === "corporate";
  const lines = [
    ["申込区分", corporate ? "法人" : "個人"],
    ...(corporate ? [["会社名", inquiry.company], ["立場・担当業務", inquiry.role]] : []),
    ["氏名", inquiry.name], ["メール", inquiry.email], ["相談種類", inquiry.topic],
    ["相談内容", inquiry.message], ["受付日時", inquiry.created_at],
  ];
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json", "idempotency-key": `contact-${inquiry.id}` },
    body: JSON.stringify({
      from: env.CONTACT_NOTIFICATION_FROM,
      to: [env.CONTACT_NOTIFICATION_TO],
      subject: "【Matore】新しいご相談が届きました",
      html: `<h1>新しいご相談</h1>${lines.map(([label, value]) => `<p><strong>${escapeHtml(label)}</strong><br>${escapeHtml(value).replace(/\n/g, "<br>")}</p>`).join("")}<p>対応状況はSupabase Dashboardで更新してください。</p>`,
    }),
  });
  if (!response.ok) throw new Error("notification");
  const marked = await supabase(env, `contact_inquiries?id=eq.${inquiry.id}&notification_sent_at=is.null`, {
    method: "PATCH", prefer: "return=minimal", body: JSON.stringify({ notification_sent_at: new Date().toISOString() }),
  });
  if (!marked.ok) throw new Error("notification-mark");
}

export async function handleContactRequest(request, env) {
  if (request.method !== "POST") return json(405, "method_not_allowed");
  if (!(request.headers.get("content-type") || "").toLowerCase().startsWith("application/json")) return json(415, "unsupported_media_type");
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_CONTACT_BODY_BYTES) return json(413, "payload_too_large");
  const bytes = await readLimitedBody(request);
  if (!bytes) return json(413, "payload_too_large");
  let value;
  try { value = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)); }
  catch { return json(400, "invalid_request"); }
  const payload = validateContactPayload(value);
  if (!payload) return json(400, "invalid_request");
  try {
    if (!(await consumeRateLimit(request, env))) return json(429, "rate_limited");
    const inquiry = await saveInquiry(payload, env);
    if (!inquiry) throw new Error("save");
    if (!inquiry.notification_sent_at) await notify(inquiry, env);
    return new Response(JSON.stringify({ ok: true }), { status: 201, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
  } catch (error) {
    console.error("contact_request_failed", error instanceof Error ? error.message : "unknown");
    return json(503, "temporarily_unavailable");
  }
}

export async function retryPendingNotifications(env) {
  const response = await supabase(env, "contact_inquiries?notification_sent_at=is.null&order=created_at.asc&limit=50&select=*", { method: "GET" });
  if (!response.ok) throw new Error("pending-lookup");
  for (const inquiry of await response.json()) {
    try { await notify(inquiry, env); } catch { /* Retry on the next scheduled run without logging personal data. */ }
  }
}
