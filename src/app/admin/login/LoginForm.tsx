"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions";
import { inputCls, labelCls, primaryBtn } from "@/components/admin/ui";

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, null);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label className={labelCls} htmlFor="username">
          Username
        </label>
        <input id="username" name="username" autoComplete="username" required autoFocus className={inputCls} />
      </div>
      <div>
        <label className={labelCls} htmlFor="password">
          Password
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={inputCls} />
      </div>
      {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>}
      <button disabled={pending} className={`${primaryBtn} w-full py-2.5`}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
