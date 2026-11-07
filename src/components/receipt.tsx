"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Arrow } from "./site-chrome";

export function Receipt() {
  const [received, setReceived] = useState<boolean | null>(null);
  useEffect(() => {
    let valid = false;
    try {
      const stored = Number(sessionStorage.getItem("consultation-received"));
      const age = Date.now() - stored;
      valid = stored > 0 && age >= 0 && age < 10 * 60 * 1000;
    } catch {
      /* No storage access: don't claim receipt. */
    }
    // Read once after hydration; never expose form data or receipt IDs in the URL.
    const frame = requestAnimationFrame(() => setReceived(valid));
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <div className="receipt" role="status">
      <span className="receipt-mark" aria-hidden="true">
        {received ? "✓" : "—"}
      </span>
      <p className="eyebrow">{received ? "THANK YOU" : "YOUR CONSULTATION"}</p>
      <h1>
        {received === null ? (
          "受付状況を確認しています。"
        ) : received ? (
          <>
            ご相談、
            <br />
            ありがとうございます。
          </>
        ) : (
          <>
            送信はまだ
            <br />
            完了していません。
          </>
        )}
      </h1>
      <p>
        {received ? (
          <>
            内容を確認し、原則2営業日以内にメールで返信します。
            <br />
            平日夜・土日に、順次対応いたします。
          </>
        ) : (
          "相談フォームから受付状況をご確認ください。"
        )}
      </p>
      <Link className="cta" href={received ? "/" : "/#contact"}>
        {received ? "ホームへ戻る" : "相談フォームへ戻る"}
        <Arrow />
      </Link>
    </div>
  );
}
