import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = await getBaseUrl();
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/admin", "/search"] }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
