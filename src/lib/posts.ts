import { and, desc, eq, ilike, ne, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { ensureSeeded } from "./settings";

export const PAGE_SIZE = 20;

/** Lightweight shape used by cards/lists (no heavy `content` column). */
const cardColumns = {
  id: posts.id,
  title: posts.title,
  slug: posts.slug,
  type: posts.type,
  category: posts.category,
  excerpt: posts.excerpt,
  coverImage: posts.coverImage,
  featured: posts.featured,
  publishedAt: posts.publishedAt,
  createdAt: posts.createdAt,
};

export type CardPost = {
  id: number;
  title: string;
  slug: string;
  type: string;
  category: string;
  excerpt: string;
  coverImage: string;
  featured: boolean;
  publishedAt: Date | null;
  createdAt: Date;
};

export type PostCardData = Omit<CardPost, "publishedAt" | "createdAt"> & { date: string };

export function toCardData(p: CardPost): PostCardData {
  const { publishedAt, createdAt, ...rest } = p;
  return { ...rest, date: (publishedAt ?? createdAt).toISOString() };
}

export function postHref(p: { type: string; slug: string }) {
  return `/${p.type === "article" ? "articles" : "blogs"}/${p.slug}`;
}

const published = eq(posts.status, "published");

export async function listPublished(opts: {
  type?: "blog" | "article";
  page?: number;
  q?: string;
  category?: string;
  featuredOnly?: boolean;
  excludeFeatured?: boolean;
  limit?: number;
}) {
  await ensureSeeded();
  const page = Math.max(1, opts.page ?? 1);
  const limit = opts.limit ?? PAGE_SIZE;
  const conds = [published];
  if (opts.type) conds.push(eq(posts.type, opts.type));
  if (opts.category) conds.push(eq(posts.category, opts.category));
  if (opts.featuredOnly) conds.push(eq(posts.featured, true));
  if (opts.excludeFeatured) conds.push(eq(posts.featured, false));
  if (opts.q) {
    const like = `%${opts.q.replace(/[%_\\]/g, "\\$&")}%`;
    conds.push(
      or(ilike(posts.title, like), ilike(posts.excerpt, like), ilike(posts.content, like), ilike(posts.category, like))!,
    );
  }
  const where = and(...conds);
  const [rows, [{ count }]] = await Promise.all([
    db
      .select(cardColumns)
      .from(posts)
      .where(where)
      .orderBy(desc(posts.publishedAt), desc(posts.id))
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ count: sql<number>`count(*)::int` }).from(posts).where(where),
  ]);
  return { posts: rows.map(toCardData), total: count, pages: Math.max(1, Math.ceil(count / limit)), page };
}

export async function recentPosts(limit = 5, excludeId?: number) {
  await ensureSeeded();
  const conds = [published];
  if (excludeId) conds.push(ne(posts.id, excludeId));
  const rows = await db
    .select(cardColumns)
    .from(posts)
    .where(and(...conds))
    .orderBy(desc(posts.publishedAt), desc(posts.id))
    .limit(limit);
  return rows.map(toCardData);
}

export async function categoryCounts() {
  await ensureSeeded();
  return db
    .select({ category: posts.category, count: sql<number>`count(*)::int` })
    .from(posts)
    .where(published)
    .groupBy(posts.category)
    .orderBy(desc(sql`count(*)`));
}

export async function getPublishedBySlug(slug: string) {
  await ensureSeeded();
  const [row] = await db
    .select()
    .from(posts)
    .where(and(eq(posts.slug, slug), published))
    .limit(1);
  return row ?? null;
}

export async function relatedPosts(category: string, excludeId: number, limit = 3) {
  const rows = await db
    .select(cardColumns)
    .from(posts)
    .where(and(published, eq(posts.category, category), ne(posts.id, excludeId)))
    .orderBy(desc(posts.publishedAt))
    .limit(limit);
  return rows.map(toCardData);
}

export async function incrementViews(id: number) {
  await db.update(posts).set({ views: sql`${posts.views} + 1` }).where(eq(posts.id, id));
}
