"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteMessage, setMessageRead } from "@/app/actions";

type Row = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export default function MessagesManager({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [open, setOpen] = useState<number | null>(null);
  const [, start] = useTransition();

  const run = (fn: () => Promise<unknown>) =>
    start(async () => {
      await fn();
      router.refresh();
    });

  if (!rows.length) {
    return <p className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">No messages yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {rows.map((m) => {
        const expanded = open === m.id;
        return (
          <li key={m.id} className={`rounded-2xl border bg-white p-4 shadow-sm ${m.isRead ? "border-gray-200" : "border-violet-300 ring-1 ring-violet-200"}`}>
            <button
              className="flex w-full items-start justify-between gap-3 text-left"
              onClick={() => {
                setOpen(expanded ? null : m.id);
                if (!m.isRead) run(() => setMessageRead(m.id, true));
              }}
            >
              <span className="min-w-0">
                <span className="block font-semibold">
                  {!m.isRead && <span className="mr-2 inline-block h-2 w-2 rounded-full bg-rose-500" />}
                  {m.subject || "(no subject)"}
                </span>
                <span className="block truncate text-sm text-gray-500">
                  {m.name} &lt;{m.email}&gt;
                </span>
              </span>
              <span className="shrink-0 text-xs text-gray-400">{new Date(m.createdAt).toLocaleString()}</span>
            </button>
            {expanded && (
              <div className="mt-3 border-t border-gray-100 pt-3">
                <p className="whitespace-pre-wrap text-sm text-gray-800">{m.message}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={`mailto:${m.email}?subject=${encodeURIComponent("Re: " + (m.subject || "your message"))}`}
                    className="rounded-lg bg-violet-600 px-4 py-1.5 text-sm font-semibold text-white"
                  >
                    Reply by email
                  </a>
                  <button
                    onClick={() => run(() => setMessageRead(m.id, !m.isRead))}
                    className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm font-semibold"
                  >
                    Mark as {m.isRead ? "unread" : "read"}
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("Delete this message?")) run(() => deleteMessage(m.id));
                    }}
                    className="rounded-lg border border-rose-200 px-4 py-1.5 text-sm font-semibold text-rose-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
