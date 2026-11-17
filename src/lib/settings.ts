import { cache } from "react";
import { inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { posts, settings } from "@/db/schema";
import {
  DEFAULT_ABOUT,
  DEFAULT_CONTACT_INTRO,
  DEFAULT_DISCLAIMER,
  DEFAULT_PRIVACY,
  DEFAULT_TERMS,
} from "./defaults";
import { SEED_POSTS } from "./seed";

export const SETTING_DEFAULTS = {
  siteName: "Inkwell Daily",
  tagline: "Stories, ideas and deep dives worth your time",
  siteUrl: "",
  defaultMetaDescription:
    "Personal blogs and in-depth, research-based articles on technology, life and ideas.",
  contactEmail: "hello@example.com",
  contactPhone: "",
  contactAddress: "",
  footerText: "Independent writing, published with care.",
  aboutContent: DEFAULT_ABOUT,
  contactIntro: DEFAULT_CONTACT_INTRO,
  privacyContent: DEFAULT_PRIVACY,
  termsContent: DEFAULT_TERMS,
  disclaimerContent: DEFAULT_DISCLAIMER,
  adHead: "",
  adHeader: "",
  adArticle: "",
  adSidebar: "",
  adFooter: "",
} as const;

export type SettingKey = keyof typeof SETTING_DEFAULTS;
export type SiteSettings = Record<SettingKey, string>;
export const SETTING_KEYS = Object.keys(SETTING_DEFAULTS) as SettingKey[];

let seedPromise: Promise<void> | null = null;

async function seedOnce() {
  const inserted = await db
    .insert(settings)
    .values({ key: "_seeded", value: "1" })
    .onConflictDoNothing()
    .returning({ key: settings.key });
  if (inserted.length === 0) return;
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(posts);
  if (count > 0) return;
  await db.insert(posts).values(SEED_POSTS).onConflictDoNothing();
}

export function ensureSeeded() {
  if (!seedPromise) {
    seedPromise = seedOnce().catch((e) => {
      seedPromise = null;
      console.error("Seeding failed", e);
    });
  }
  return seedPromise;
}

export const getSettings = cache(async (): Promise<SiteSettings> => {
  await ensureSeeded();
  const rows = await db
    .select()
    .from(settings)
    .where(inArray(settings.key, SETTING_KEYS as string[]));
  const out: SiteSettings = { ...SETTING_DEFAULTS };
  for (const r of rows) {
    // Empty strings are allowed for optional keys; for core text fall back to defaults.
    if (r.key in out) {
      const k = r.key as SettingKey;
      const optional = ["siteUrl", "contactPhone", "contactAddress", "adHead", "adHeader", "adArticle", "adSidebar", "adFooter", "footerText", "contactEmail"];
      out[k] = r.value === "" && !optional.includes(k) ? SETTING_DEFAULTS[k] : r.value;
    }
  }
  return out;
});

export function withSite(html: string, siteName: string) {
  return html.replace(/\{site\}/g, siteName);
}
