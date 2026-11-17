import Link from "next/link";
import { getSettings } from "@/lib/settings";
import NavLinks from "./NavLinks";
import SearchForm from "./SearchForm";
import ThemeToggle from "./ThemeToggle";
import AdSlot from "./AdSlot";

export default async function Header() {
  const s = await getSettings();
  return (
    <header>
      <div className="px-3 pb-3 pt-6 text-center sm:pt-8">
        <Link href="/" aria-label={`${s.siteName} home`} className="inline-block">
          <span className="site-title block px-2 text-4xl sm:text-6xl lg:text-7xl">{s.siteName}</span>
        </Link>
        {s.tagline && <p className="mt-2 text-xs tracking-wide text-muted sm:text-sm">{s.tagline}</p>}
      </div>
      <nav aria-label="Main" className="glass sticky top-0 z-40 w-full border-x-0">
        <div className="relative flex w-full items-center justify-between px-3 py-2 sm:px-5 md:justify-center">
          <NavLinks />
          <div className="flex items-center gap-2 md:absolute md:right-5">
            <SearchForm />
            <ThemeToggle />
          </div>
        </div>
      </nav>
      <AdSlot html={s.adHeader} className="px-3 pt-3" />
    </header>
  );
}
