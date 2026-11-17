import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: { absolute: "Admin" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  const lightVars = {
    "--glass": "rgba(255,255,255,0.95)",
    "--glass-border": "#e5e7eb",
    "--fg": "#111827",
    "--muted": "#6b7280",
  } as React.CSSProperties;
  return (
    <div style={lightVars} className="min-h-screen bg-gray-100 text-gray-900 [color-scheme:light]">
      {children}
    </div>
  );
}
