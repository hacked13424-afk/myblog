"use client";

import { useRef, useState, useTransition } from "react";
import { saveSettings } from "@/app/actions";
import type { SettingKey } from "@/lib/settings";
import RichEditor from "./RichEditor";
import { cardCls, primaryBtn } from "./ui";

export type PageDef = { key: SettingKey; label: string; url: string; html: string };

export default function PagesEditor({ pages }: { pages: PageDef[] }) {
  const [active, setActive] = useState(pages[0].key);
  const store = useRef<Record<string, string>>(Object.fromEntries(pages.map((p) => [p.key, p.html])));
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const page = pages.find((p) => p.key === active)!;

  function save() {
    setMsg(null);
    start(async () => {
      const res = await saveSettings({ [active]: store.current[active] });
      setMsg(res.ok ? { ok: true, text: `${page.label} saved.` } : { ok: false, text: res.error });
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {pages.map((p) => (
          <button
            key={p.key}
            onClick={() => {
              setActive(p.key);
              setMsg(null);
            }}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              active === p.key ? "bg-violet-600 text-white" : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className={cardCls}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-bold">
            {page.label} <span className="text-sm font-normal text-gray-500">({page.url})</span>
          </h2>
          <div className="flex items-center gap-3">
            {msg && <span className={`text-sm font-medium ${msg.ok ? "text-emerald-600" : "text-red-600"}`}>{msg.text}</span>}
            <a href={page.url} target="_blank" className="text-sm font-semibold text-violet-700 hover:underline">
              View ↗
            </a>
            <button onClick={save} disabled={pending} className={primaryBtn}>
              {pending ? "Saving…" : "Save page"}
            </button>
          </div>
        </div>
        <p className="mb-3 text-xs text-gray-500">
          Tip: use <code>{"{site}"}</code> anywhere in the text — it is replaced with your website name automatically.
        </p>
        <RichEditor
          key={active}
          value={store.current[active]}
          onChange={(html) => {
            store.current[active] = html;
          }}
        />
      </div>
    </div>
  );
}
