import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  if (await getSession()) redirect("/admin");
  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-slate-900 via-indigo-950 to-fuchsia-950 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-violet-600 text-xl text-white">🔐</div>
          <h1 className="text-2xl font-extrabold text-gray-900">Admin sign in</h1>
          <p className="mt-1 text-sm text-gray-500">Authorized access only.</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
