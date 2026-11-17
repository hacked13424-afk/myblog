import type { Metadata } from "next";
import TypeListing from "@/components/TypeListing";

export const metadata: Metadata = {
  title: "Articles",
  description: "In-depth, research-based articles.",
  alternates: { canonical: "/articles" },
};

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams;
  return <TypeListing type="article" pageParam={page} />;
}
