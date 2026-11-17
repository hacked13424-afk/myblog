import { headers } from "next/headers";
import { getSettings } from "./settings";

/** Resolves the public base URL (settings → env → request host). */
export async function getBaseUrl(): Promise<string> {
  const s = await getSettings();
  const configured = s.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (configured) return configured.replace(/\/+$/, "");
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    const proto = h.get("x-forwarded-proto") ?? "http";
    if (host) return `${proto}://${host}`;
  } catch {
    /* no request context */
  }
  return "http://localhost:3000";
}
