import type { ContactValues } from "./contact-validation";

export type SubmissionResult =
  { ok: true } | { ok: false; reason: "invalid" | "rate_limited" | "failed" };
export type ContactTransport = (
  values: ContactValues,
) => Promise<SubmissionResult>;

let pendingSubmission: { content: string; idempotencyKey: string } | undefined;

export const submitContact: ContactTransport = async (values) => {
  const payload = {
    applicantType: values.applicantType,
    company: values.applicantType === "corporate" ? values.company.trim() : null,
    name: values.name.trim(),
    email: values.email.trim(),
    role: values.applicantType === "corporate" ? values.role.trim() : null,
    topic: values.topic,
    message: values.message.trim(),
    consent: values.consent,
  };
  const content = JSON.stringify(payload);
  if (pendingSubmission?.content !== content) {
    pendingSubmission = { content, idempotencyKey: crypto.randomUUID() };
  }
  const submission = pendingSubmission;
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      ...payload,
      idempotencyKey: submission.idempotencyKey,
    }),
  });
  if (response.ok) {
    if (pendingSubmission === submission) pendingSubmission = undefined;
    return { ok: true };
  }
  if (response.status === 400 || response.status === 413 || response.status === 415)
    return { ok: false, reason: "invalid" };
  if (response.status === 429) return { ok: false, reason: "rate_limited" };
  return { ok: false, reason: "failed" };
};
export const contactIsAvailable = true;
