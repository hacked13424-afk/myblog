import { listPublished } from "@/lib/posts";
import PageHero from "./PageHero";
import PostGrid from "./PostGrid";
import Pagination from "./Pagination";

export default async function TypeListing({
  type,
  pageParam,
}: {
  type: "blog" | "article";
  pageParam?: string;
}) {
  const page = Number(pageParam) || 1;
  const data = await listPublished({ type, page });
  const isBlog = type === "blog";
  return (
    <section className="w-full">
      <PageHero
        eyebrow={isBlog ? "Personal · Updates · Stories" : "Research · Guides · Deep dives"}
        title={isBlog ? "Blogs" : "Articles"}
        subtitle={
          isBlog
            ? "Casual, personal and update-style posts from behind the scenes."
            : "In-depth, research-based pieces that explain a subject thoroughly."
        }
      />
      <PostGrid posts={data.posts} emptyText={`No ${isBlog ? "blogs" : "articles"} published yet.`} />
      <Pagination page={data.page} pages={data.pages} basePath={isBlog ? "/blogs" : "/articles"} />
    </section>
  );
}
