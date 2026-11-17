import type { Metadata } from "next";
import StaticPage from "@/components/StaticPage";
import { getSettings, withSite } from "@/lib/settings";

export const metadata: Metadata = { title: "Disclaimer", alternates: { canonical: "/disclaimer" } };

export default async function DisclaimerPage() {
  const s = await getSettings();
  return <StaticPage title="Disclaimer" html={withSite(s.disclaimerContent, s.siteName)} />;
}
