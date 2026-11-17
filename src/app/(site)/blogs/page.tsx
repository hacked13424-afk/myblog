import type { Metadata } from "next";
import TypeListing from "@/components/TypeListing";

export const metadata: Metadata = {
  title: "Blogs",
  description: "Casual, personal and update-style blog posts.",
  alternates: { canonical: "/blogs" },
};

export default async function BlogsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams;
  return <TypeListing type="blog" pageParam={page} />;
}
