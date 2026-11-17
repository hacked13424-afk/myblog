import Link from "next/link";
import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { db } from "@/db";
import { posts } from "@/db/schema";
import PostsTable from "@/components/admin/PostsTable";
import Pagination from "@/components/Pagination";
import { inputCls } from "@/components/admin/ui";

const PER_PAGE = 30;

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string; q?: string; page?: string }>;
}) {
  const { type, status, q, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const conds = [];
  if (type === "blog" || type === "article") conds.push(eq(posts.type, type));
  if (status === "draft" || status === "published") conds.push(eq(posts.status, status));
  if (q) conds.push(ilike(posts.title, `%${q}%`));
  const where = conds.length ? and(...conds) : undefined;

  const [rows, [{ count }]] = await Promise.all([
    db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        type: posts.type,
        status: posts.status,
        category: posts.category,
        featured: posts.featured,
        views: posts.views,
        updatedAt: posts.updatedAt,
      })
      .from(posts)
      .where(where)
      .orderBy(desc(posts.updatedAt))
      .limit(PER_PAGE)
      .offset((page - 1) * PER_PAGE),
    db.select({ count: sql<number>`count(*)::int` }).from(posts).where(where),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Posts ({count})</h1>
        <Link href="/admin/posts/new" className="rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700">
          + New post
        </Link>
      </div>
      <form className="flex flex-wrap gap-2">
        <input name="q" defaultValue={q} placeholder="Search title…" className={`${inputCls} !w-56`} />
        <select name="type" defaultValue={type ?? ""} className={`${inputCls} !w-36`}>
          <option value="">All types</option>
          <option value="blog">Blogs</option>
          <option value="article">Articles</option>
        </select>
        <select name="status" defaultValue={status ?? ""} className={`${inputCls} !w-36`}>
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <button className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white">Filter</button>
      </form>
      <PostsTable
        rows={rows.map((r) => ({ ...r, updatedAt: r.updatedAt.toISOString() }))}
      />
      <Pagination
        page={page}
        pages={Math.max(1, Math.ceil(count / PER_PAGE))}
        basePath="/admin/posts"
        params={{ type, status, q }}
      />
    </div>
  );
}
