"use client";
import { ErrorPanel } from "@/components/error-panel";
import "./globals.css";
import "./enhancements.css";
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ja">
      <body>
        <ErrorPanel kind="error" onRetry={reset} />
      </body>
    </html>
  );
}
