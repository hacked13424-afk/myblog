"use client";

import { useActionState } from "react";
import { submitContact } from "@/app/actions";

const field =
  "w-full rounded-xl border border-[var(--glass-border)] bg-transparent px-4 py-3 text-sm outline-none transition focus:border-fuchsia-500 focus:shadow-[0_0_16px_rgba(217,70,239,0.35)]";

export default function ContactForm() {
  const [state, action, pending] = useActionState(submitContact, null);

  if (state?.ok) {
    return (
      <div className="grid min-h-[300px] place-items-center text-center">
        <div>
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-emerald-500/15 text-3xl text-emerald-500">✓</div>
          <h2 className="text-2xl font-extrabold">Message sent!</h2>
          <p className="mt-2 text-muted">Thank you for reaching out. We will reply as soon as we can.</p>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold">
          Name
          <input name="name" required maxLength={200} className={`${field} mt-1 font-normal`} />
        </label>
        <label className="block text-sm font-semibold">
          Email
          <input name="email" type="email" required maxLength={320} className={`${field} mt-1 font-normal`} />
        </label>
      </div>
      <label className="block text-sm font-semibold">
        Subject
        <input name="subject" maxLength={300} className={`${field} mt-1 font-normal`} />
      </label>
      <label className="block text-sm font-semibold">
        Message
        <textarea name="message" required rows={7} maxLength={10000} className={`${field} mt-1 font-normal`} />
      </label>
      {/* honeypot */}
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {state?.error && <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-500">{state.error}</p>}
      <button
        disabled={pending}
        className="rounded-full bg-gradient-to-r from-fuchsia-600 to-indigo-600 px-8 py-3 font-bold text-white shadow-lg transition hover:shadow-[0_0_24px_rgba(168,85,247,0.6)] disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
