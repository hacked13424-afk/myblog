import type { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="w-full px-3 pt-4 sm:px-4">{children}</main>
      <Footer />
    </>
  );
}
