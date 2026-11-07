import type { Metadata } from "next";
import { Receipt } from "@/components/receipt";
import { pageMetadata } from "@/lib/seo";
export const metadata: Metadata = {
  ...pageMetadata("ご相談の受付", "Matoreへのご相談の受付状況をご案内します。", "/thanks"),
  robots: { index: false, follow: false },
};
export default function ThanksPage() {
  return (
    <main id="main" className="container receipt-page">
      <Receipt />
    </main>
  );
}
