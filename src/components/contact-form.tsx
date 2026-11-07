"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Arrow } from "./site-chrome";
import { topics } from "@/lib/site";
import {
  emptyContact,
  validateContact,
  type ContactErrors,
  type ContactValues,
} from "@/lib/contact-validation";
import { contactIsAvailable, submitContact } from "@/lib/contact-transport";

const subscribe = () => () => {};

export function ContactForm({ initialTopic = "" }: { initialTopic?: string }) {
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const [values, setValues] = useState<ContactValues>(() => ({
    ...emptyContact,
    topic: (topics as readonly string[]).includes(initialTopic) ? initialTopic : "",
  }));
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const inFlight = useRef(false);
  const router = useRouter();

  useEffect(() => {
    const chooseTopic = (event: Event) => {
      const topic: unknown = (event as CustomEvent).detail;
      if (
        typeof topic !== "string" ||
        !(topics as readonly string[]).includes(topic)
      )
        return;
      setValues((current) => ({ ...current, topic }));
      setErrors((current) => ({ ...current, topic: undefined }));
      setStatus("相談したい内容を選択しました。");
    };
    window.addEventListener("consultation-topic", chooseTopic);
    return () => window.removeEventListener("consultation-topic", chooseTopic);
  }, []);

  function update<K extends keyof ContactValues>(
    key: K,
    value: ContactValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setStatus("");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (inFlight.current) return;
    const nextErrors = validateContact(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setStatus(
        "入力内容をご確認ください。未入力または確認が必要な項目があります。",
      );
      const first = Object.keys(nextErrors)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    inFlight.current = true;
    setBusy(true);
    setStatus("");
    try {
      const result = await submitContact({
        ...values,
        company: values.applicantType === "corporate" ? values.company.trim() : "",
        name: values.name.trim(),
        email: values.email.trim(),
        role: values.applicantType === "corporate" ? values.role.trim() : "",
        message: values.message.trim(),
      });
      if (result.ok) {
        // A non-personal, short-lived receipt flag. The form itself is never stored.
        try {
          sessionStorage.setItem("consultation-received", String(Date.now()));
        } catch {
          /* Receipt display can fall back safely. */
        }
        router.push("/thanks");
      } else {
        setStatus(
          result.reason === "rate_limited"
            ? "送信回数が上限に達しました。1時間ほど時間をおいて、もう一度お試しください。"
            : result.reason === "invalid"
              ? "入力内容を確認できませんでした。内容を確認して、もう一度お試しください。"
              : "送信できませんでした。入力内容はこの画面に残っています。時間をおいて、もう一度お試しください。",
        );
      }
    } catch {
      setStatus(
        "送信できませんでした。入力内容はこの画面に残っています。時間をおいて、もう一度お試しください。",
      );
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  function errorFor(field: keyof ContactValues) {
    return errors[field] ? (
      <p className="field-error" id={`${field}-error`}>
        {errors[field]}
      </p>
    ) : null;
  }

  return (
    <form
      ref={formRef}
      className="contact-form"
      noValidate
      onSubmit={handleSubmit}
      aria-label="相談フォーム"
      aria-busy={busy}
    >
      <div className="form-heading">
        <h3>ご相談フォーム</h3>
        <span>
          <b>*</b> 必須項目
        </span>
      </div>
      <fieldset className="applicant-type" aria-describedby={errors.applicantType ? "applicantType-error" : undefined}>
        <legend>申込区分<b>*</b></legend>
        <div className="applicant-type-options">
          {([['individual', '個人'], ['corporate', '法人']] as const).map(([value, label]) => (
            <label key={value}>
              <input type="radio" name="applicantType" value={value} checked={values.applicantType === value} onChange={() => update("applicantType", value)} required />
              <span>{label}</span>
            </label>
          ))}
        </div>
        {errorFor("applicantType")}
      </fieldset>
      <noscript>
        <p className="form-warning">
          入力内容の確認にはJavaScriptが必要です。現在、このフォームからの送信はできません。
        </p>
      </noscript>
      <div className="form-row">
        {([
          ...(values.applicantType === "corporate" ? [["company", "会社名", "例：株式会社〇〇", "organization", 120] as const] : []),
          ["name", "氏名", "例：山田 太郎", "name", 80] as const,
        ]).map(([field, label, placeholder, autoComplete, maxLength]) => (
          <div className="field" key={field}>
            <Label htmlFor={field}>
              {label}
              <b>*</b>
            </Label>
            <input
              id={field}
              name={field}
              required
              autoComplete={autoComplete}
              maxLength={maxLength}
              placeholder={placeholder}
              value={values[field]}
              onChange={(e) => update(field, e.target.value)}
              aria-invalid={!!errors[field]}
              aria-describedby={errors[field] ? `${field}-error` : undefined}
            />
            {errorFor(field)}
          </div>
        ))}
      </div>
      <div className="field">
        <Label htmlFor="email">
          メールアドレス<b>*</b>
        </Label>
        <input
          type="email"
          inputMode="email"
          id="email"
          name="email"
          required
          autoComplete="email"
          maxLength={254}
          placeholder="例：yourname@example.jp"
          value={values.email}
          onChange={(e) => update("email", e.target.value)}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errorFor("email")}
      </div>
      {values.applicantType === "corporate" && <div className="field">
        <Label htmlFor="role">
          立場・担当業務<b>*</b>
        </Label>
        <input
          id="role"
          name="role"
          required
          maxLength={200}
          placeholder="例：総務と社内ITを兼任しています"
          value={values.role}
          onChange={(e) => update("role", e.target.value)}
          aria-invalid={!!errors.role}
          aria-describedby={errors.role ? "role-error" : undefined}
        />
        {errorFor("role")}
      </div>}
      <fieldset
        className="topic-field"
        aria-describedby={errors.topic ? "topic-error" : undefined}
      >
        <legend>
          相談したい内容<b>*</b>
        </legend>
        <div className="topic-options">
          {topics.map((topic) => (
            <label className="topic-option" key={topic}>
              <input
                type="radio"
                name="topic"
                value={topic}
                checked={values.topic === topic}
                onChange={() => update("topic", topic)}
                required
              />
              <span>{topic}</span>
            </label>
          ))}
        </div>
        {errorFor("topic")}
      </fieldset>
      <div className="field">
        <Label htmlFor="message">
          相談内容<b>*</b>
        </Label>
        <p className="field-hint" id="message-hint">
          困っている作業を、まずは短くお聞かせください。詳しい内容は、返信後にヒアリングシートで確認します。
        </p>
        <Textarea
          id="message"
          name="message"
          required
          rows={5}
          maxLength={3000}
          placeholder="例：毎月、複数のCSVをExcelに貼り付けて売上を集計しています。この作業を自動化できるか相談したいです。"
          value={values.message}
          onChange={(e) => update("message", e.target.value)}
          aria-invalid={!!errors.message}
          aria-describedby={`message-hint message-warning${errors.message ? " message-error" : ""}`}
        />
        <div className="message-meta">
          <span>まとまっていなくても、大丈夫です。</span>
          <span>{values.message.length.toLocaleString()} / 3,000</span>
        </div>
        {errorFor("message")}
      </div>
      <p className="form-warning" id="message-warning">
        機密情報、個人情報、ログイン情報、ファイルは記載・添付しないでください。
        <span>
          ※連絡に必要な会社名・氏名・メールアドレスは、上の専用欄へご入力ください。
        </span>
      </p>
      <p className="data-purpose">
        ご入力いただいた情報は、ご相談への返信・内容確認・支援のご案内に使用します。
      </p>
      <div className="consent-field">
        <input
          type="checkbox"
          id="consent"
          name="consent"
          checked={values.consent}
          onChange={(e) => update("consent", e.target.checked)}
          required
          aria-invalid={!!errors.consent}
          aria-describedby={errors.consent ? "consent-error" : undefined}
        />
        <label htmlFor="consent">
          <Link href="/privacy" target="_blank" rel="noopener">
            プライバシーポリシー
            <span className="sr-only">（新しいタブで開きます）</span>
          </Link>
          に同意します<b>*</b>
        </label>
      </div>
      {errorFor("consent")}
      <Button
        type="submit"
        className="cta form-submit"
        disabled={!hydrated || busy}
      >
        {busy
          ? "確認しています…"
          : contactIsAvailable
            ? "この内容で相談する"
            : "入力内容を確認する"}
        <Arrow diagonal />
      </Button>
      <p
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={`form-status${status ? " has-status" : ""}`}
      >
        {status}
      </p>
      <p className="form-bottom-note">まずはメールで、状況をお聞きします。</p>
    </form>
  );
}
