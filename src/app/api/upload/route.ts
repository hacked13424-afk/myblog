import { NextResponse } from "next/server";
import { db } from "@/db";
import { media } from "@/db/schema";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const files = form.getAll("file").filter((f): f is File => f instanceof File);
  if (!files.length) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const out: { url: string; type: "image" | "video"; name: string }[] = [];
  for (const file of files) {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) {
      return NextResponse.json({ error: `Unsupported file type: ${file.type || file.name}` }, { status: 415 });
    }
    const buf = Buffer.from(await file.arrayBuffer());
    const [row] = await db
      .insert(media)
      .values({ filename: file.name, mime: file.type, size: buf.length, data: buf })
      .returning({ id: media.id });
    out.push({ url: `/api/media/${row.id}`, type: isImage ? "image" : "video", name: file.name });
  }
  return NextResponse.json({ files: out });
}
