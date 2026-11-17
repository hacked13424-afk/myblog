"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/blogs", label: "Blogs" },
  { href: "/articles", label: "Articles" },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <ul className="flex items-center gap-1">
      {LINKS.map((l) => {
        const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
        return (
          <li key={l.href}>
            <Link
              href={l.href}
              className={`relative rounded-full px-3.5 py-1.5 text-sm font-semibold transition sm:px-5 ${
                active
                  ? "bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.55)]"
                  : "hover:bg-fuchsia-500/10 hover:text-fuchsia-600 dark:hover:text-fuchsia-300"
              }`}
            >
              {l.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
