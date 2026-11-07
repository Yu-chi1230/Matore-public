import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { services } from "@/lib/services";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  // Only canonical, indexable pages. Do not claim content was updated at build time.
  return ["/", ...services.map(service => service.path)].map((path) => ({ url: `${site.url}${path}` }));
}
