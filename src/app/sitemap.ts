import type { MetadataRoute } from "next";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { getBaseUrl } from "@/lib/site";
import { ensureSeeded } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await ensureSeeded();
  const base = await getBaseUrl();
  const rows = await db
    .select({ slug: posts.slug, type: posts.type, updatedAt: posts.updatedAt })
    .from(posts)
    .where(eq(posts.status, "published"))
    .orderBy(desc(posts.publishedAt));
  const staticPages = ["", "/blogs", "/articles", "/about", "/contact", "/privacy-policy", "/terms-and-conditions", "/disclaimer"];
  return [
    ...staticPages.map((p) => ({
      url: `${base}${p}`,
      lastModified: new Date(),
      changeFrequency: (p === "" ? "daily" : "monthly") as "daily" | "monthly",
      priority: p === "" ? 1 : 0.6,
    })),
    ...rows.map((r) => ({
      url: `${base}/${r.type === "article" ? "articles" : "blogs"}/${r.slug}`,
      lastModified: r.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
