import { notFound } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { posts } from "@/db/schema";
import PostForm from "@/components/admin/PostForm";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numeric = Number(id);
  if (!Number.isInteger(numeric)) notFound();
  const [post] = await db.select().from(posts).where(eq(posts.id, numeric)).limit(1);
  if (!post) notFound();
  const cats = await db.selectDistinct({ c: posts.category }).from(posts).orderBy(sql`1`);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Edit post</h1>
      <PostForm
        categories={cats.map((c) => c.c)}
        initial={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          type: post.type,
          status: post.status,
          category: post.category,
          excerpt: post.excerpt,
          content: post.content,
          coverImage: post.coverImage,
          metaTitle: post.metaTitle,
          metaDescription: post.metaDescription,
          featured: post.featured,
        }}
      />
    </div>
  );
}
