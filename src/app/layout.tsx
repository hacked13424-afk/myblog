import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { getSettings } from "@/lib/settings";
import { getBaseUrl } from "@/lib/site";
import { parseHeadHtml } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const base = await getBaseUrl();
  return {
    metadataBase: new URL(base),
    title: { default: `${s.siteName} – ${s.tagline}`, template: `%s | ${s.siteName}` },
    description: s.defaultMetaDescription,
    openGraph: { siteName: s.siteName, type: "website" },
    alternates: { canonical: "/" },
  };
}

const THEME_SCRIPT = `try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark')}catch(e){}`;

const ATTR_MAP: Record<string, string> = {
  crossorigin: "crossOrigin",
  class: "className",
  charset: "charSet",
  referrerpolicy: "referrerPolicy",
  nonce: "nonce",
};

function mapAttrs<T extends Record<string, string | boolean>>(attrs: T) {
  const out: Record<string, string | boolean> = {};
  for (const [k, v] of Object.entries(attrs)) out[ATTR_MAP[k.toLowerCase()] ?? k] = v;
  return out;
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const s = await getSettings();
  const headNodes = s.adHead ? parseHeadHtml(s.adHead) : [];
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        {/* Global <head> slot: AdSense verification / site-verification scripts & meta tags */}
        {headNodes.map((n, i) => {
          if (n.kind === "script") {
            const { async: isAsync, ...rest } = mapAttrs(n.attrs);
            return n.content.trim() ? (
              <script key={i} {...rest} async={Boolean(isAsync)} dangerouslySetInnerHTML={{ __html: n.content }} />
            ) : (
              <script key={i} {...rest} async={Boolean(isAsync)} />
            );
          }
          if (n.kind === "meta") return <meta key={i} {...mapAttrs(n.attrs)} />;
          return <link key={i} {...(mapAttrs(n.attrs) as { rel: string; href: string })} />;
        })}
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
