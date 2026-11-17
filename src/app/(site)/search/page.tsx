import type { Metadata } from "next";
import { listPublished } from "@/lib/posts";
import PageHero from "@/components/PageHero";
import PostGrid from "@/components/PostGrid";
import Pagination from "@/components/Pagination";

export const metadata: Metadata = { title: "Search", robots: { index: false, follow: true } };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const { q = "", category = "", page } = await searchParams;
  const term = q.trim().slice(0, 100);
  const data =
    term || category
      ? await listPublished({ q: term || undefined, category: category || undefined, page: Number(page) || 1 })
      : null;
  const title = category && !term ? `Category: ${category}` : term ? `Results for “${term}”` : "Search";
  return (
    <section className="w-full">
      <PageHero
        eyebrow="Search"
        title={title}
        subtitle={data ? `${data.total} post${data.total === 1 ? "" : "s"} found` : "Type something in the search bar to find posts."}
      />
      {data && (
        <>
          <PostGrid posts={data.posts} emptyText="Nothing matched your search. Try different keywords." />
          <Pagination
            page={data.page}
            pages={data.pages}
            basePath="/search"
            params={{ q: term || undefined, category: category || undefined }}
          />
        </>
      )}
    </section>
  );
}
