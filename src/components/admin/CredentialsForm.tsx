"use client";

import { useState, useTransition } from "react";
import { changeCredentials } from "@/app/actions";
import { cardCls, hintCls, inputCls, labelCls, primaryBtn } from "./ui";

export default function CredentialsForm({ username }: { username: string }) {
  const [form, setForm] = useState({ currentPassword: "", newUsername: username, newPassword: "", confirm: "" });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (form.newPassword && form.newPassword !== form.confirm) {
      setMsg({ ok: false, text: "New passwords do not match." });
      return;
    }
    start(async () => {
      const res = await changeCredentials({
        currentPassword: form.currentPassword,
        newUsername: form.newUsername,
        newPassword: form.newPassword,
      });
      if (res.ok) {
        setMsg({ ok: true, text: "Credentials updated. Use them next time you sign in." });
        setForm((f) => ({ ...f, currentPassword: "", newPassword: "", confirm: "" }));
      } else setMsg({ ok: false, text: res.error });
    });
  }

  return (
    <form onSubmit={submit} className={`${cardCls} max-w-xl space-y-4`}>
      <div>
        <label className={labelCls}>Admin username</label>
        <input value={form.newUsername} onChange={(e) => setForm({ ...form, newUsername: e.target.value })} autoComplete="username" required className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>New password</label>
        <input type="password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} autoComplete="new-password" className={inputCls} />
        <p className={hintCls}>At least 8 characters. Leave empty to keep your current password. Stored securely hashed (bcrypt).</p>
      </div>
      <div>
        <label className={labelCls}>Confirm new password</label>
        <input type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} autoComplete="new-password" className={inputCls} />
      </div>
      <hr className="border-gray-200" />
      <div>
        <label className={labelCls}>Current password (required to confirm)</label>
        <input type="password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} autoComplete="current-password" required className={inputCls} />
      </div>
      <div className="flex items-center gap-3">
        <button disabled={pending} className={primaryBtn}>
          {pending ? "Updating…" : "Update credentials"}
        </button>
        {msg && <span className={`text-sm font-medium ${msg.ok ? "text-emerald-600" : "text-red-600"}`}>{msg.text}</span>}
      </div>
    </form>
  );
}
