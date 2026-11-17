"use client";

import { useEffect, useRef } from "react";

/**
 * Renders pasted ad code (AdSense <ins> + inline scripts) and executes the scripts.
 * `placeholder` shows a neutral box when no code has been configured.
 */
export default function AdSlot({
  html,
  className = "",
  placeholder,
  label = "Advertisement",
}: {
  html: string;
  className?: string;
  placeholder?: boolean;
  label?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !html) return;
    el.innerHTML = "";
    const frag = document.createRange().createContextualFragment(html);
    el.appendChild(frag);
    return () => {
      el.innerHTML = "";
    };
  }, [html]);

  if (!html) {
    if (!placeholder) return null;
    return (
      <div
        className={`glass flex min-h-[250px] items-center justify-center rounded-2xl border-dashed text-xs uppercase tracking-widest text-muted ${className}`}
      >
        {label} space
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`} aria-label={label}>
      <p className="mb-1 text-center text-[10px] uppercase tracking-widest text-muted">{label}</p>
      <div ref={ref} className="ad-slot flex w-full justify-center" />
    </div>
  );
}
