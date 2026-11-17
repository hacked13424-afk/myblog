import Link from "next/link";
import { categoryCounts, postHref, recentPosts } from "@/lib/posts";
import { getSettings } from "@/lib/settings";
import { formatDate } from "@/lib/utils";
import AdSlot from "./AdSlot";

export default async function Sidebar({ excludeId }: { excludeId?: number }) {
  const [s, recent, cats] = await Promise.all([getSettings(), recentPosts(5, excludeId), categoryCounts()]);
  const card = "glass rounded-2xl p-4";
  const heading = "mb-3 text-sm font-extrabold uppercase tracking-widest text-fuchsia-600 dark:text-fuchsia-300";
  return (
    <aside className="space-y-4 lg:sticky lg:top-16 lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto lg:pb-2 lg:[scrollbar-width:none]">
      <form action="/search" role="search" className={card}>
        <h2 className={heading}>Search</h2>
        <div className="flex gap-2">
          <input
            name="q"
            required
            placeholder="Search posts…"
            aria-label="Search posts"
            className="w-full min-w-0 rounded-full border border-[var(--glass-border)] bg-transparent px-4 py-2 text-sm outline-none focus:border-fuchsia-500"
          />
          <button className="rounded-full bg-gradient-to-r from-fuchsia-600 to-indigo-600 px-4 text-sm font-semibold text-white">
            Go
          </button>
        </div>
      </form>

      <div className={card}>
        <h2 className={heading}>Recent Posts</h2>
        <ul className="space-y-3">
          {recent.map((p) => (
            <li key={p.id}>
              <Link href={postHref(p)} className="group flex gap-3">
                {p.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.coverImage} alt="" loading="lazy" className="h-14 w-20 shrink-0 rounded-lg object-cover" />
                ) : (
                  <div className="h-14 w-20 shrink-0 rounded-lg bg-gradient-to-br from-fuchsia-600 to-indigo-600" />
                )}
                <span className="min-w-0">
                  <span className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-fuchsia-500">{p.title}</span>
                  <span className="text-xs text-muted">{formatDate(p.date)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className={card}>
        <h2 className={heading}>Categories</h2>
        <ul className="flex flex-wrap gap-2">
          {cats.map((c) => (
            <li key={c.category}>
              <Link
                href={`/search?category=${encodeURIComponent(c.category)}`}
                className="inline-block rounded-full border border-[var(--glass-border)] px-3 py-1 text-xs font-semibold transition hover:border-fuchsia-500 hover:text-fuchsia-500 hover:shadow-[0_0_12px_rgba(217,70,239,0.4)]"
              >
                {c.category} <span className="text-muted">({c.count})</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <AdSlot html={s.adSidebar} placeholder />
    </aside>
  );
}
