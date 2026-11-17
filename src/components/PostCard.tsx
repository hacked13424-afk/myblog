"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { formatDate, gradientFor } from "@/lib/utils";
import type { PostCardData } from "@/lib/posts";

export default function PostCard({
  post,
  index = 0,
  featured = false,
}: {
  post: PostCardData;
  index?: number;
  featured?: boolean;
}) {
  const href = `/${post.type === "article" ? "articles" : "blogs"}/${post.slug}`;
  const grad = gradientFor(post.id);

  const cover = post.coverImage ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={post.coverImage}
      alt={post.title}
      loading={index < 4 ? "eager" : "lazy"}
      className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
    />
  ) : (
    <div className={`grid h-full w-full place-items-center bg-gradient-to-br ${grad}`}>
      <span className="text-6xl font-black text-white/70">{post.title.charAt(0).toUpperCase()}</span>
    </div>
  );

  const badge = (
    <div className="absolute left-3 top-3 flex gap-2">
      <span className="rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur">
        {post.type}
      </span>
      <span className="rounded-full bg-fuchsia-600/90 px-2.5 py-1 text-[11px] font-semibold text-white">
        {post.category}
      </span>
    </div>
  );

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: Math.min(index, 8) * 0.05 }}
      className={`group relative ${featured ? "sm:col-span-2" : ""}`}
    >
      <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-r from-fuchsia-500 via-indigo-500 to-cyan-400 opacity-0 blur-md transition duration-500 group-hover:opacity-70" />
      <Link
        href={href}
        className="glass relative flex h-full flex-col overflow-hidden rounded-2xl transition duration-300 group-hover:-translate-y-1"
      >
        {featured ? (
          <div className="relative min-h-[300px] flex-1 overflow-hidden sm:min-h-[360px]">
            <div className="absolute inset-0">{cover}</div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            {badge}
            <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7">
              <p className="mb-2 text-xs uppercase tracking-widest text-fuchsia-200">★ Featured · {formatDate(post.date)}</p>
              <h3 className="text-2xl font-extrabold leading-tight sm:text-3xl">{post.title}</h3>
              {post.excerpt && <p className="mt-2 line-clamp-2 max-w-2xl text-sm text-white/80">{post.excerpt}</p>}
            </div>
          </div>
        ) : (
          <>
            <div className="relative aspect-[16/10] overflow-hidden">
              {cover}
              {badge}
            </div>
            <div className="flex flex-1 flex-col p-4 sm:p-5">
              <h3 className="line-clamp-2 text-lg font-bold leading-snug transition group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-300">
                {post.title}
              </h3>
              {post.excerpt && <p className="mt-2 line-clamp-3 text-sm text-muted">{post.excerpt}</p>}
              <div className="mt-auto flex items-center justify-between pt-4 text-xs text-muted">
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                <span className="font-semibold text-fuchsia-600 transition group-hover:translate-x-1 dark:text-fuchsia-300">
                  Read more →
                </span>
              </div>
            </div>
          </>
        )}
      </Link>
    </motion.article>
  );
}
