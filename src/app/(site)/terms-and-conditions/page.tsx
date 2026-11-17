import type { Metadata } from "next";
import StaticPage from "@/components/StaticPage";
import { getSettings, withSite } from "@/lib/settings";

export const metadata: Metadata = { title: "Terms & Conditions", alternates: { canonical: "/terms-and-conditions" } };

export default async function TermsPage() {
  const s = await getSettings();
  return <StaticPage title="Terms & Conditions" html={withSite(s.termsContent, s.siteName)} />;
}
