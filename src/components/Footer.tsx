import Link from "next/link";
import { getSettings } from "@/lib/settings";
import AdSlot from "./AdSlot";

const LINKS = [
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-and-conditions", label: "Terms & Conditions" },
  { href: "/disclaimer", label: "Disclaimer" },
];

export default async function Footer() {
  const s = await getSettings();
  return (
    <footer className="mt-12 w-full">
      <AdSlot html={s.adFooter} className="px-3 pb-4" />
      <div className="glass w-full border-x-0 border-b-0 px-4 py-8 text-center sm:px-8">
        <p className="site-title text-3xl">{s.siteName}</p>
        {s.footerText && <p className="mx-auto mt-2 max-w-xl text-sm text-muted">{s.footerText}</p>}
        <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="transition hover:text-fuchsia-500">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        {(s.contactEmail || s.contactPhone || s.contactAddress) && (
          <p className="mt-4 text-xs text-muted">
            {[s.contactEmail, s.contactPhone, s.contactAddress].filter(Boolean).join("  •  ")}
          </p>
        )}
        <p className="mt-4 text-xs text-muted">
          © {new Date().getFullYear()} {s.siteName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
