import SettingsPanel, { type FieldDef } from "@/components/admin/SettingsPanel";
import { getSettings } from "@/lib/settings";

const FIELDS: FieldDef[] = [
  {
    key: "adHead",
    label: "1. Global <head> script (AdSense verification / auto ads)",
    type: "code",
    rows: 5,
    placeholder: '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>',
    hint: "Injected into the <head> of every public page. <script>, <meta> and <link> tags are supported (e.g. Search Console verification meta).",
  },
  { key: "adHeader", label: "2. Header banner ad", type: "code", rows: 5, placeholder: '<ins class="adsbygoogle" …></ins>\n<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>', hint: "Displayed below the navigation bar on all public pages." },
  { key: "adArticle", label: "3. In-article / middle-of-content ad", type: "code", rows: 5, hint: "Automatically injected in the middle of every post's content." },
  { key: "adSidebar", label: "4. Sticky sidebar ad", type: "code", rows: 5, hint: "Shown in the sticky sidebar next to posts." },
  { key: "adFooter", label: "5. Footer ad", type: "code", rows: 5, hint: "Displayed above the footer on all public pages." },
];

export default async function AdsPage() {
  const s = await getSettings();
  const values = Object.fromEntries(FIELDS.map((f) => [f.key, s[f.key]]));
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">AdSense control panel</h1>
      <p className="max-w-3xl text-sm text-gray-600">
        Paste the code provided by Google AdSense for each slot. Leave a field empty to disable that slot. Changes go live immediately.
      </p>
      <SettingsPanel fields={FIELDS} values={values} submitLabel="Save ad codes" successText="Ad codes saved." />
    </div>
  );
}
