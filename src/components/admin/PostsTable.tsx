"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deletePost, setPostStatus } from "@/app/actions";
import { formatDate } from "@/lib/utils";

type Row = {
  id: number;
  title: string;
  slug: string;
  type: string;
  status: string;
  category: string;
  featured: boolean;
  views: number;
  updatedAt: string;
};

export default function PostsTable({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [busyId, setBusyId] = useState<number | null>(null);

  function toggle(r: Row) {
    setBusyId(r.id);
    start(async () => {
      await setPostStatus(r.id, r.status === "published" ? "draft" : "published");
      router.refresh();
      setBusyId(null);
    });
  }

  function remove(r: Row) {
    if (!window.confirm(`Delete "${r.title}"? This cannot be undone.`)) return;
    setBusyId(r.id);
    start(async () => {
      await deletePost(r.id);
      router.refresh();
      setBusyId(null);
    });
  }

  if (!rows.length) {
    return <p className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">No posts found.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
          <tr>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Views</th>
            <th className="px-4 py-3">Updated</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((r) => (
            <tr key={r.id} className={busyId === r.id && pending ? "opacity-50" : ""}>
              <td className="max-w-xs px-4 py-3 font-medium">
                <Link href={`/admin/posts/${r.id}`} className="hover:text-violet-600">
                  {r.featured && <span title="Featured">⭐ </span>}
                  {r.title}
                </Link>
                <p className="truncate text-xs font-normal text-gray-400">/{r.slug}</p>
              </td>
              <td className="px-4 py-3 capitalize">{r.type}</td>
              <td className="px-4 py-3">{r.category}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    r.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {r.status}
                </span>
              </td>
              <td className="px-4 py-3">{r.views.toLocaleString()}</td>
              <td className="px-4 py-3 text-gray-500">{formatDate(r.updatedAt)}</td>
              <td className="whitespace-nowrap px-4 py-3 text-right">
                {r.status === "published" && (
                  <a
                    href={`/${r.type === "article" ? "articles" : "blogs"}/${r.slug}`}
                    target="_blank"
                    className="mr-1 rounded-md px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                  >
                    View
                  </a>
                )}
                <Link href={`/admin/posts/${r.id}`} className="mr-1 rounded-md px-2 py-1 text-xs font-semibold text-violet-700 hover:bg-violet-50">
                  Edit
                </Link>
                <button onClick={() => toggle(r)} className="mr-1 rounded-md px-2 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-50">
                  {r.status === "published" ? "Unpublish" : "Publish"}
                </button>
                <button onClick={() => remove(r)} className="rounded-md px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
