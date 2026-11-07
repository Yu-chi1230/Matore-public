"use client";

import Link from "next/link";
import { Arrow } from "./site-chrome";
import { Button } from "./ui/button";

export function ErrorIllustration({ lost = true }: { lost?: boolean }) {
  return (
    <svg
      className="error-illustration"
      viewBox="0 0 360 235"
      fill="none"
      aria-hidden="true"
    >
      <ellipse cx="178" cy="213" rx="96" ry="7" fill="#e8dfd2" />
      <g className="error-paper">
        <path
          d="M107 64V30l27 24M222 54l26-24v39"
          fill="#f3e4d3"
          stroke="#9b735b"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M105 62h144v120a15 15 0 0 1-15 15H120a15 15 0 0 1-15-15V62Z"
          fill="#fffaf1"
          stroke="#9b735b"
          strokeWidth="2"
        />
        <path
          d="M105 62h112l32 32h-32V62Z"
          fill="#eddfce"
          stroke="#9b735b"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <g
          className="error-eyes"
          stroke="#715843"
          strokeWidth="3"
          strokeLinecap="round"
        >
          <path d="M147 103v6m39-6v6" />
        </g>
        <path
          d="m161 115 5 4 5-4m-5 4v5m0 0q-7 7-13 0m13 0q7 7 13 0"
          stroke="#9b735b"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <ellipse cx="135" cy="117" rx="8" ry="4" fill="#e5baa4" />
        <ellipse cx="197" cy="117" rx="8" ry="4" fill="#e5baa4" />
        <path
          d="M141 144h39m-39 12h59"
          stroke="#cbb69f"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M130 197v12h16m61-12v12h-16"
          stroke="#9b735b"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M105 145q-24-3-28-19m172 22q17-3 21-17"
          stroke="#9b735b"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
      <g className="error-search" stroke="#a24c36" strokeWidth="2">
        <circle cx="280" cy="108" r="23" fill="#f3eadc" />
        <path d="m263 125-17 18" strokeWidth="5" strokeLinecap="round" />
        {lost ? (
          <path
            d="M274 101a6 6 0 0 1 12 0c0 6-6 5-6 10m0 6v1"
            strokeLinecap="round"
          />
        ) : (
          <path d="m270 108 7 7 13-15" strokeLinecap="round" />
        )}
      </g>
      <path
        d="m64 79 4 4m-17 5 7 1m235-45-3 7m14 1-6 4"
        stroke="#b99578"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ErrorPanel({
  kind,
  onRetry,
}: {
  kind: "not-found" | "error";
  onRetry?: () => void;
}) {
  const lost = kind === "not-found";
  return (
    <main id="main" className="container error-page">
      <div className="error-panel">
        <p className="eyebrow">
          {lost ? "404 / LOST IN THE FILES" : "SOMETHING WENT WRONG"}
        </p>
        <ErrorIllustration lost={lost} />
        <h1>
          {lost ? (
            <>
              ページが、
              <br className="mobile-break" />
              ちょっと迷子です。
            </>
          ) : (
            <>
              うまく開けず、
              <br className="mobile-break" />
              ひと休み中です。
            </>
          )}
        </h1>
        <p>
          {lost ? (
            <>
              お探しのページが見つかりませんでした。
              <br />
              ホームから、もう一度ご案内します。
            </>
          ) : (
            <>
              一時的な問題が起きたようです。
              <br />
              少し時間をおいて、もう一度お試しください。
            </>
          )}
        </p>
        <div className="error-actions">
          {onRetry && (
            <Button className="cta" onClick={onRetry}>
              もう一度試す
              <Arrow />
            </Button>
          )}
          <Link href="/" className={onRetry ? "text-link" : "cta"}>
            ホームへ戻る
            <Arrow />
          </Link>
        </div>
        <p className="error-caption">
          大丈夫。ひとつずつ、整えていきましょう。
        </p>
      </div>
    </main>
  );
}
