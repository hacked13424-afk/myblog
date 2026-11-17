import { listPublished } from "@/lib/posts";
import PageHero from "@/components/PageHero";
import PostCard from "@/components/PostCard";
import PostGrid, { GRID_CLASS } from "@/components/PostGrid";
import Pagination from "@/components/Pagination";
import { getSettings } from "@/lib/settings";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam) || 1;
  const [s, featured, latest] = await Promise.all([
    getSettings(),
    page === 1 ? listPublished({ featuredOnly: true, limit: 5 }) : Promise.resolve(null),
    listPublished({ page, excludeFeatured: false }),
  ]);

  return (
    <div className="w-full space-y-8">
      {featured && featured.posts.length > 0 && (
        <section aria-labelledby="featured-heading" className="w-full">
          <h2 id="featured-heading" className="sr-only">
            Featured posts
          </h2>
          <PageHero eyebrow="Editor's picks" title="Featured" subtitle={s.tagline} />
          <div className={GRID_CLASS}>
            {featured.posts.map((p, i) => (
              <PostCard key={p.id} post={p} index={i} featured={i === 0} />
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="latest-heading" className="w-full">
        <PageHero eyebrow="Fresh off the press" title="Latest Posts" />
        <span id="latest-heading" className="sr-only">
          Latest posts
        </span>
        <PostGrid posts={latest.posts} />
        <Pagination page={latest.page} pages={latest.pages} basePath="/" />
      </section>
    </div>
  );
}
