import { desc } from "drizzle-orm";
import { db } from "@/db";
import { messages } from "@/db/schema";
import MessagesManager from "@/components/admin/MessagesManager";

export default async function MessagesPage() {
  const rows = await db.select().from(messages).orderBy(desc(messages.createdAt)).limit(500);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Messages</h1>
      <p className="text-sm text-gray-500">Submissions from the public Contact Us form.</p>
      <MessagesManager rows={rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))} />
    </div>
  );
}
