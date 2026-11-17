"use client";

import { useState, useTransition } from "react";
import { saveSettings } from "@/app/actions";
import type { SettingKey } from "@/lib/settings";
import { cardCls, hintCls, inputCls, labelCls, primaryBtn } from "./ui";

export type FieldDef = {
  key: SettingKey;
  label: string;
  hint?: string;
  type?: "text" | "textarea" | "code";
  rows?: number;
  placeholder?: string;
};

/** Generic form that persists a group of site settings. Used for General settings and AdSense. */
export default function SettingsPanel({
  fields,
  values,
  submitLabel = "Save changes",
  successText = "Saved. Changes are live.",
}: {
  fields: FieldDef[];
  values: Partial<Record<SettingKey, string>>;
  submitLabel?: string;
  successText?: string;
}) {
  const [state, setState] = useState<Partial<Record<SettingKey, string>>>(values);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    start(async () => {
      const res = await saveSettings(state);
      setMsg(res.ok ? { ok: true, text: successText } : { ok: false, text: res.error });
    });
  }

  return (
    <form onSubmit={submit} className={`${cardCls} max-w-3xl space-y-5`}>
      {fields.map((f) => (
        <div key={f.key}>
          <label className={labelCls} htmlFor={f.key}>
            {f.label}
          </label>
          {f.type === "textarea" || f.type === "code" ? (
            <textarea
              id={f.key}
              rows={f.rows ?? 4}
              value={state[f.key] ?? ""}
              onChange={(e) => setState((s) => ({ ...s, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              spellCheck={f.type !== "code"}
              className={`${inputCls} ${f.type === "code" ? "font-mono text-xs" : ""}`}
            />
          ) : (
            <input
              id={f.key}
              value={state[f.key] ?? ""}
              onChange={(e) => setState((s) => ({ ...s, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              className={inputCls}
            />
          )}
          {f.hint && <p className={hintCls}>{f.hint}</p>}
        </div>
      ))}
      <div className="flex items-center gap-3">
        <button disabled={pending} className={primaryBtn}>
          {pending ? "Saving…" : submitLabel}
        </button>
        {msg && <span className={`text-sm font-medium ${msg.ok ? "text-emerald-600" : "text-red-600"}`}>{msg.text}</span>}
      </div>
    </form>
  );
}
