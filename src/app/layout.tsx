import type { Metadata } from "next";
import Script from "next/script";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { site } from "@/lib/site";
import { BackToTop } from "@/components/back-to-top";
import { StructuredData } from "@/components/structured-data";
import "./globals.css";
import "./enhancements.css";
import "./pricing.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s｜${site.name}` },
  description: site.description,
  icons: { icon: { url: "/favicon.png?v=20261021-white", type: "image/png", sizes: "96x96" } },
  openGraph: {
    title: site.title,
    description: site.description,
    locale: "ja_JP",
    type: "website",
    siteName: site.name,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>
        <StructuredData data={{
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "WebSite", "@id": `${site.url}/#website`, url: `${site.url}/`, name: site.name, inLanguage: "ja", publisher: { "@id": `${site.url}/#organization` } },
            { "@type": "Organization", "@id": `${site.url}/#organization`, name: site.name, url: `${site.url}/`, description: site.description, founder: { "@id": `${site.url}/#operator` } },
            { "@type": "Person", "@id": `${site.url}/#operator`, name: "Yu-chi", url: `${site.url}/#about` },
          ],
        }} />
        <a className="skip-link" href="#main">
          本文へ移動
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
        <BackToTop />
        {process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN && (
          <Script
            id="cloudflare-web-analytics"
            type="module"
            src="https://static.cloudflareinsights.com/beacon.min.js"
            strategy="afterInteractive"
            data-cf-beacon={JSON.stringify({ token: process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN })}
          />
        )}
      </body>
    </html>
  );
}
