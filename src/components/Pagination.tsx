import Link from "next/link";

export default function Pagination({
  page,
  pages,
  basePath,
  params = {},
}: {
  page: number;
  pages: number;
  basePath: string;
  params?: Record<string, string | undefined>;
}) {
  if (pages <= 1) return null;
  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
  const nums: number[] = [];
  for (let i = Math.max(1, page - 2); i <= Math.min(pages, page + 2); i++) nums.push(i);
  const cls = "glass rounded-full px-4 py-2 text-sm font-semibold transition hover:shadow-[0_0_16px_rgba(168,85,247,0.5)]";
  return (
    <nav aria-label="Pagination" className="mt-8 flex flex-wrap items-center justify-center gap-2">
      {page > 1 && (
        <Link href={href(page - 1)} className={cls}>
          ← Prev
        </Link>
      )}
      {nums.map((n) => (
        <Link
          key={n}
          href={href(n)}
          aria-current={n === page ? "page" : undefined}
          className={`${cls} ${n === page ? "!bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white" : ""}`}
        >
          {n}
        </Link>
      ))}
      {page < pages && (
        <Link href={href(page + 1)} className={cls}>
          Next →
        </Link>
      )}
    </nav>
  );
}
