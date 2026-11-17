import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { messages, posts } from "@/db/schema";
import { cardCls } from "@/components/admin/ui";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const [stats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      published: sql<number>`count(*) filter (where ${posts.status} = 'published')::int`,
      drafts: sql<number>`count(*) filter (where ${posts.status} = 'draft')::int`,
      blogs: sql<number>`count(*) filter (where ${posts.type} = 'blog')::int`,
      articles: sql<number>`count(*) filter (where ${posts.type} = 'article')::int`,
      views: sql<number>`coalesce(sum(${posts.views}),0)::int`,
    })
    .from(posts);
  const [{ unread }] = await db
    .select({ unread: sql<number>`count(*)::int` })
    .from(messages)
    .where(eq(messages.isRead, false));
  const recent = await db
    .select({ id: posts.id, title: posts.title, status: posts.status, type: posts.type, updatedAt: posts.updatedAt })
    .from(posts)
    .orderBy(desc(posts.updatedAt))
    .limit(6);
  const msgs = await db.select().from(messages).orderBy(desc(messages.createdAt)).limit(5);

  const cards = [
    { label: "Total posts", value: stats.total, color: "from-violet-500 to-indigo-600" },
    { label: "Published", value: stats.published, color: "from-emerald-500 to-teal-600" },
    { label: "Drafts", value: stats.drafts, color: "from-amber-500 to-orange-600" },
    { label: "Blogs", value: stats.blogs, color: "from-sky-500 to-blue-600" },
    { label: "Articles", value: stats.articles, color: "from-fuchsia-500 to-pink-600" },
    { label: "Total views", value: stats.views, color: "from-rose-500 to-red-600" },
    { label: "Unread messages", value: unread, color: "from-cyan-500 to-sky-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Dashboard</h1>
        <Link href="/admin/posts/new" className="rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700">
          + New post
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        {cards.map((c) => (
          <div key={c.label} className={`rounded-2xl bg-gradient-to-br ${c.color} p-4 text-white shadow`}>
            <p className="text-3xl font-black">{c.value.toLocaleString()}</p>
            <p className="text-xs font-medium opacity-90">{c.label}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className={cardCls}>
          <h2 className="mb-3 font-bold">Recently updated</h2>
          <ul className="divide-y divide-gray-100">
            {recent.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <Link href={`/admin/posts/${p.id}`} className="min-w-0 truncate font-medium hover:text-violet-600">
                  {p.title}
                </Link>
                <span className="shrink-0 text-xs text-gray-500">
                  {p.type} · {p.status} · {formatDate(p.updatedAt)}
                </span>
              </li>
            ))}
            {!recent.length && <li className="py-2 text-sm text-gray-500">No posts yet.</li>}
          </ul>
        </section>
        <section className={cardCls}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">Latest messages</h2>
            <Link href="/admin/messages" className="text-sm text-violet-600 hover:underline">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-gray-100">
            {msgs.map((m) => (
              <li key={m.id} className="py-2 text-sm">
                <p className="font-medium">
                  {!m.isRead && <span className="mr-1 inline-block h-2 w-2 rounded-full bg-rose-500" />}
                  {m.name} <span className="font-normal text-gray-500">· {m.email}</span>
                </p>
                <p className="truncate text-gray-600">{m.subject || m.message}</p>
              </li>
            ))}
            {!msgs.length && <li className="py-2 text-sm text-gray-500">No messages yet.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
