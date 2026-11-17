import PagesEditor from "@/components/admin/PagesEditor";
import { getSettings } from "@/lib/settings";

export default async function PagesAdmin() {
  const s = await getSettings();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Pages</h1>
      <p className="text-sm text-gray-600">Edit the content of the About, Contact and legal pages linked in the footer.</p>
      <PagesEditor
        pages={[
          { key: "aboutContent", label: "About Us", url: "/about", html: s.aboutContent },
          { key: "contactIntro", label: "Contact intro", url: "/contact", html: s.contactIntro },
          { key: "privacyContent", label: "Privacy Policy", url: "/privacy-policy", html: s.privacyContent },
          { key: "termsContent", label: "Terms & Conditions", url: "/terms-and-conditions", html: s.termsContent },
          { key: "disclaimerContent", label: "Disclaimer", url: "/disclaimer", html: s.disclaimerContent },
        ]}
      />
    </div>
  );
}
