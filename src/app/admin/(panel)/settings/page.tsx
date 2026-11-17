import SettingsPanel, { type FieldDef } from "@/components/admin/SettingsPanel";
import { getSettings } from "@/lib/settings";

const FIELDS: FieldDef[] = [
  { key: "siteName", label: "Website name", hint: "Shown at the top center of every page, in the footer and in browser titles. Updates instantly." },
  { key: "tagline", label: "Tagline", hint: "Small line shown under the website name." },
  { key: "siteUrl", label: "Public site URL", placeholder: "https://yourdomain.com", hint: "Used for sitemap.xml, robots.txt and canonical links. Leave empty to auto-detect." },
  { key: "defaultMetaDescription", label: "Default meta description", type: "textarea", rows: 3, hint: "Used on pages without their own description." },
  { key: "contactEmail", label: "Contact email" },
  { key: "contactPhone", label: "Contact phone" },
  { key: "contactAddress", label: "Contact address", type: "textarea", rows: 3 },
  { key: "footerText", label: "Footer text", type: "textarea", rows: 2, hint: "A short line displayed in the footer." },
];

export default async function SettingsPage() {
  const s = await getSettings();
  const values = Object.fromEntries(FIELDS.map((f) => [f.key, s[f.key]]));
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Site settings</h1>
      <SettingsPanel fields={FIELDS} values={values} successText="Saved. Your website is updated." />
    </div>
  );
}
