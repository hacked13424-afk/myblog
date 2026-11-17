import type { Metadata } from "next";
import StaticPage from "@/components/StaticPage";
import { getSettings, withSite } from "@/lib/settings";

export const metadata: Metadata = { title: "Privacy Policy", alternates: { canonical: "/privacy-policy" } };

export default async function PrivacyPage() {
  const s = await getSettings();
  return <StaticPage title="Privacy Policy" html={withSite(s.privacyContent, s.siteName)} />;
}
