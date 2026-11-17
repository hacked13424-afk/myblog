import type { ReactNode } from "react";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { requireAdminPage } from "@/lib/auth";
import AdminNav from "@/components/admin/AdminNav";

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const session = await requireAdminPage();
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(messages)
    .where(eq(messages.isRead, false));
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AdminNav unread={count} username={session.username} />
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
