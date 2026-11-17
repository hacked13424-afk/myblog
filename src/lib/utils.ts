export function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\u0600-\u06ff\u0900-\u097f]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 200) || "post"
  );
}

export function stripHtml(html: string): string {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function readingTime(html: string): number {
  const words = stripHtml(html).split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function excerptFrom(html: string, length = 160): string {
  const text = stripHtml(html);
  return text.length > length ? text.slice(0, length - 1).trimEnd() + "…" : text;
}

export function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const GRADIENTS = [
  "from-fuchsia-600 via-purple-600 to-indigo-600",
  "from-cyan-500 via-sky-500 to-blue-600",
  "from-amber-500 via-orange-500 to-rose-600",
  "from-emerald-500 via-teal-500 to-cyan-600",
  "from-pink-500 via-rose-500 to-red-500",
  "from-violet-600 via-indigo-500 to-sky-500",
];

export function gradientFor(id: number): string {
  return GRADIENTS[Math.abs(id) % GRADIENTS.length];
}

/** Split HTML roughly in the middle (after a closing paragraph) for in-article ads. */
export function splitMiddle(html: string): [string, string] | null {
  const marker = /<\/p>/gi;
  const positions: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = marker.exec(html))) positions.push(m.index + m[0].length);
  if (positions.length < 2) return null;
  const at = positions[Math.floor((positions.length - 1) / 2)];
  return [html.slice(0, at), html.slice(at)];
}

export type HeadNode =
  | { kind: "script"; attrs: Record<string, string | boolean>; content: string }
  | { kind: "meta"; attrs: Record<string, string> }
  | { kind: "link"; attrs: Record<string, string> };

function parseAttrs(raw: string): Record<string, string | boolean> {
  const attrs: Record<string, string | boolean> = {};
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) {
    attrs[m[1]] = m[2] ?? m[3] ?? m[4] ?? true;
  }
  return attrs;
}

/** Parses pasted <script>/<meta>/<link> tags so they can be rendered inside <head>. */
export function parseHeadHtml(html: string): HeadNode[] {
  const nodes: HeadNode[] = [];
  const scriptRe = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = scriptRe.exec(html))) {
    nodes.push({ kind: "script", attrs: parseAttrs(m[1]), content: m[2] });
  }
  const tagRe = /<(meta|link)\b([^>]*?)\/?>/gi;
  while ((m = tagRe.exec(html))) {
    const attrs = parseAttrs(m[2]) as Record<string, string>;
    nodes.push({ kind: m[1].toLowerCase() as "meta" | "link", attrs });
  }
  return nodes;
}
