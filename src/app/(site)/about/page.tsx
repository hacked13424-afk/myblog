import type { Metadata } from "next";
import StaticPage from "@/components/StaticPage";
import { getSettings, withSite } from "@/lib/settings";

export const metadata: Metadata = { title: "About Us", alternates: { canonical: "/about" } };

export default async function AboutPage() {
  const s = await getSettings();
  return <StaticPage title="About Us" html={withSite(s.aboutContent, s.siteName)} />;
}
