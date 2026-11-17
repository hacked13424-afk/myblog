import { sql } from "drizzle-orm";
import { db } from "@/db";
import { posts } from "@/db/schema";
import PostForm from "@/components/admin/PostForm";

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const cats = await db.selectDistinct({ c: posts.category }).from(posts).orderBy(sql`1`);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">New post</h1>
      <PostForm
        categories={cats.map((c) => c.c)}
        initial={{
          title: "",
          slug: "",
          type: type === "article" ? "article" : "blog",
          status: "draft",
          category: "General",
          excerpt: "",
          content: "",
          coverImage: "",
          metaTitle: "",
          metaDescription: "",
          featured: false,
        }}
      />
    </div>
  );
}
