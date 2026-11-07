import type { Metadata } from "next";
import { site } from "./site";

export { csvService } from "./services";

export function pageMetadata(title: string, description: string, path: string): Metadata {
  const url = `${site.url}${path}`;
  const fullTitle = title === site.title ? title : `${title}｜${site.name}`;
  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle, description, url,
      siteName: site.name, locale: "ja_JP", type: "website",
      images: [{ url: `${site.url}/og-matore.png`, width: 1200, height: 630, alt: "Matore｜Excel改善・データ集計・Googleサービスの自動化支援" }],
    },
    twitter: {
      card: "summary_large_image", title: fullTitle, description,
      images: [`${site.url}/og-matore.png`],
    },
  };
}
