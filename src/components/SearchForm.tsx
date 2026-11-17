"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function SearchForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  }

  return (
    <form onSubmit={submit} role="search" className="flex items-center">
      <button
        type="button"
        aria-label="Search"
        onClick={() => {
          setOpen((o) => !o);
          setTimeout(() => input.current?.focus(), 50);
        }}
        className="glass grid h-9 w-9 place-items-center rounded-full transition hover:scale-110 hover:shadow-[0_0_18px_rgba(34,211,238,0.55)] md:hidden"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </button>
      <div
        className={`${
          open ? "absolute left-0 right-0 top-full z-50 px-3 pb-3 pt-2 glass" : "hidden"
        } md:static md:block md:p-0 md:!bg-transparent md:!border-0 md:!backdrop-blur-none`}
      >
        <div className="glass flex items-center gap-2 rounded-full px-3 py-1.5 transition focus-within:shadow-[0_0_18px_rgba(139,92,246,0.5)] md:w-44 md:focus-within:w-64 md:transition-[width]">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="hidden shrink-0 text-muted md:block">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search posts…"
            aria-label="Search posts"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
          />
        </div>
      </div>
    </form>
  );
}
