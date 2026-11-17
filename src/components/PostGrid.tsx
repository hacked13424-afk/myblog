import type { PostCardData } from "@/lib/posts";
import PostCard from "./PostCard";

export const GRID_CLASS =
  "grid w-full grid-flow-dense grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 min-[1900px]:grid-cols-5 min-[2500px]:grid-cols-6";

export default function PostGrid({
  posts,
  emptyText = "No posts yet. Check back soon!",
}: {
  posts: PostCardData[];
  emptyText?: string;
}) {
  if (!posts.length) {
    return <p className="glass rounded-2xl p-10 text-center text-muted">{emptyText}</p>;
  }
  return (
    <div className={GRID_CLASS}>
      {posts.map((p, i) => (
        <PostCard key={p.id} post={p} index={i} />
      ))}
    </div>
  );
}
