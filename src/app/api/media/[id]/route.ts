import { eq } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const numeric = Number(id);
  if (!Number.isInteger(numeric)) return new Response("Not found", { status: 404 });
  const [row] = await db.select().from(media).where(eq(media.id, numeric)).limit(1);
  if (!row) return new Response("Not found", { status: 404 });

  const data = row.data;
  const total = data.length;
  const headers: Record<string, string> = {
    "Content-Type": row.mime,
    "Cache-Control": "public, max-age=31536000, immutable",
    "Accept-Ranges": "bytes",
  };

  // Range support so videos can seek.
  const range = req.headers.get("range");
  if (range) {
    const m = /bytes=(\d*)-(\d*)/.exec(range);
    if (m) {
      const start = m[1] ? parseInt(m[1], 10) : 0;
      const end = m[2] ? Math.min(parseInt(m[2], 10), total - 1) : total - 1;
      if (start <= end && start < total) {
        const chunk = data.subarray(start, end + 1);
        return new Response(new Uint8Array(chunk), {
          status: 206,
          headers: {
            ...headers,
            "Content-Range": `bytes ${start}-${end}/${total}`,
            "Content-Length": String(chunk.length),
          },
        });
      }
    }
  }
  return new Response(new Uint8Array(data), {
    headers: { ...headers, "Content-Length": String(total) },
  });
}
