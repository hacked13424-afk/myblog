import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { getPublishedBySlug, incrementViews, relatedPosts, postHref } from "@/lib/posts";
import { getSettings } from "@/lib/settings";
import { getBaseUrl } from "@/lib/site";
import { formatDate, gradientFor, readingTime, splitMiddle } from "@/lib/utils";
import AdSlot from "./AdSlot";
import PostGrid from "./PostGrid";
import Sidebar from "./Sidebar";

export async function postMetadata(slug: string, section: "blogs" | "articles"): Promise<Metadata> {
  const post = await getPublishedBySlug(slug);
  if (!post) return { title: "Not found", robots: { index: false } };
  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt;
  const canonical = postHref(post);
  void section;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonical,
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      images: post.coverImage ? [post.coverImage] : undefined,
    },
    twitter: {
      card: post.coverImage ? "summary_large_image" : "summary",
      title,
      description,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function PostView({
  slug,
  section,
}: {
  slug: string;
  section: "blogs" | "articles";
}) {
  const post = await getPublishedBySlug(slug);
  if (!post) notFound();
  const correct = postHref(post);
  if (!correct.startsWith(`/${section}/`)) permanentRedirect(correct);

  const [s, base, related] = await Promise.all([
    getSettings(),
    getBaseUrl(),
    relatedPosts(post.category, post.id),
  ]);
  incrementViews(post.id).catch(() => {});

  const parts = s.adArticle ? splitMiddle(post.content) : null;
  const proseClass =
    "post-content prose prose-lg dark:prose-invert max-w-none prose-headings:font-extrabold prose-a:text-fuchsia-600 dark:prose-a:text-fuchsia-300 prose-img:rounded-2xl";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": post.type === "article" ? "Article" : "BlogPosting",
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    image: post.coverImage ? [post.coverImage] : undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    mainEntityOfPage: `${base}${correct}`,
    publisher: { "@type": "Organization", name: s.siteName },
  };

  return (
    <div className="grid w-full gap-4 lg:grid-cols-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* 75% – article */}
      <article className="glass min-w-0 overflow-hidden rounded-3xl lg:col-span-3">
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverImage} alt={post.title} className="max-h-[520px] w-full object-cover" />
        ) : (
          <div className={`h-40 w-full bg-gradient-to-br ${gradientFor(post.id)} sm:h-56`} />
        )}
        <div className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-10 lg:px-14">
          <nav className="mb-4 text-xs text-muted" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-fuchsia-500">Home</Link>
            {" / "}
            <Link href={`/${section}`} className="hover:text-fuchsia-500 capitalize">{section}</Link>
            {" / "}
            <span>{post.category}</span>
          </nav>
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="rounded-full bg-gradient-to-r from-fuchsia-600 to-indigo-600 px-3 py-1 uppercase tracking-wider text-white">
              {post.type}
            </span>
            <Link
              href={`/search?category=${encodeURIComponent(post.category)}`}
              className="rounded-full border border-[var(--glass-border)] px-3 py-1 hover:border-fuchsia-500"
            >
              {post.category}
            </Link>
          </div>
          <h1 className="text-3xl font-black leading-tight sm:text-5xl">{post.title}</h1>
          <p className="mt-4 flex flex-wrap gap-x-4 text-sm text-muted">
            <time dateTime={(post.publishedAt ?? post.createdAt).toISOString()}>
              {formatDate(post.publishedAt ?? post.createdAt)}
            </time>
            <span>{readingTime(post.content)} min read</span>
            <span>{post.views.toLocaleString()} views</span>
          </p>
          <hr className="my-6 border-[var(--glass-border)]" />

          {parts ? (
            <>
              <div className={proseClass} dangerouslySetInnerHTML={{ __html: parts[0] }} />
              <AdSlot html={s.adArticle} className="my-8" />
              <div className={proseClass} dangerouslySetInnerHTML={{ __html: parts[1] }} />
            </>
          ) : (
            <div className={proseClass} dangerouslySetInnerHTML={{ __html: post.content }} />
          )}
        </div>
      </article>

      {/* 25% – sticky sidebar */}
      <div className="min-w-0 lg:col-span-1">
        <Sidebar excludeId={post.id} />
      </div>

      {related.length > 0 && (
        <section className="lg:col-span-4">
          <h2 className="mb-3 mt-4 text-2xl font-extrabold">Related posts</h2>
          <PostGrid posts={related} />
        </section>
      )}
    </div>
  );
}
