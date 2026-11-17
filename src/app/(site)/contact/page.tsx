import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import ContactForm from "@/components/ContactForm";
import { getSettings, withSite } from "@/lib/settings";

export const metadata: Metadata = { title: "Contact Us", alternates: { canonical: "/contact" } };

export default async function ContactPage() {
  const s = await getSettings();
  const details = [
    { label: "Email", value: s.contactEmail, href: s.contactEmail ? `mailto:${s.contactEmail}` : "" },
    { label: "Phone", value: s.contactPhone, href: s.contactPhone ? `tel:${s.contactPhone.replace(/\s+/g, "")}` : "" },
    { label: "Address", value: s.contactAddress, href: "" },
  ].filter((d) => d.value);
  return (
    <section className="w-full">
      <PageHero eyebrow="Get in touch" title="Contact Us" />
      <div className="mx-auto grid w-full max-w-6xl gap-4 lg:grid-cols-5">
        <div className="glass rounded-3xl p-6 sm:p-8 lg:col-span-2">
          <div
            className="post-content prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: withSite(s.contactIntro, s.siteName) }}
          />
          <dl className="mt-6 space-y-4">
            {details.map((d) => (
              <div key={d.label}>
                <dt className="text-xs font-bold uppercase tracking-widest text-fuchsia-600 dark:text-fuchsia-300">{d.label}</dt>
                <dd className="mt-1 whitespace-pre-line">
                  {d.href ? (
                    <a href={d.href} className="hover:text-fuchsia-500">
                      {d.value}
                    </a>
                  ) : (
                    d.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="glass rounded-3xl p-6 sm:p-8 lg:col-span-3">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
