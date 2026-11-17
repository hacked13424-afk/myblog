"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions";

const ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "📊", exact: true },
  { href: "/admin/posts", label: "Posts", icon: "📝" },
  { href: "/admin/posts/new", label: "New Post", icon: "➕", exact: true },
  { href: "/admin/pages", label: "Pages", icon: "📄" },
  { href: "/admin/messages", label: "Messages", icon: "✉️" },
  { href: "/admin/ads", label: "AdSense", icon: "💰" },
  { href: "/admin/settings", label: "Site Settings", icon: "⚙️" },
  { href: "/admin/credentials", label: "Credentials", icon: "🔑" },
];

export default function AdminNav({ unread, username }: { unread: number; username: string }) {
  const pathname = usePathname();
  return (
    <aside className="flex w-full shrink-0 flex-col bg-slate-900 text-slate-200 md:sticky md:top-0 md:h-screen md:w-60">
      <div className="px-5 py-4">
        <p className="text-lg font-extrabold text-white">Control Panel</p>
        <p className="truncate text-xs text-slate-400">Signed in as {username}</p>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-1 md:flex-col md:overflow-y-auto">
        {ITEMS.map((i) => {
          const active = i.exact
            ? pathname === i.href
            : pathname.startsWith(i.href) && !(i.href === "/admin/posts" && pathname === "/admin/posts/new");
          return (
            <Link
              key={i.href}
              href={i.href}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                active ? "bg-violet-600 text-white" : "hover:bg-slate-800"
              }`}
            >
              <span aria-hidden>{i.icon}</span>
              {i.label}
              {i.label === "Messages" && unread > 0 && (
                <span className="ml-auto rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold text-white">{unread}</span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="flex gap-2 border-t border-slate-800 p-3">
        <a href="/" target="_blank" className="flex-1 rounded-lg bg-slate-800 px-3 py-2 text-center text-xs font-semibold hover:bg-slate-700">
          View site ↗
        </a>
        <form action={logoutAction} className="flex-1">
          <button className="w-full rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700">
            Log out
          </button>
        </form>
      </div>
    </aside>
  );
}
