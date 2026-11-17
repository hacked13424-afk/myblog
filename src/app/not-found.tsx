import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <p className="site-title text-8xl">404</p>
        <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
        <p className="mt-2 text-muted">The page you are looking for does not exist or has been moved.</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-gradient-to-r from-fuchsia-600 to-indigo-600 px-6 py-3 font-semibold text-white"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
