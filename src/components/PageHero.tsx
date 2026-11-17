"use client";

import { motion } from "framer-motion";

export default function PageHero({
  title,
  subtitle,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="px-1 pb-4 pt-2"
    >
      {eyebrow && (
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-fuchsia-600 dark:text-fuchsia-300">{eyebrow}</p>
      )}
      <h1 className="mt-1 bg-gradient-to-r from-fuchsia-600 via-indigo-500 to-cyan-500 bg-clip-text text-3xl font-black text-transparent sm:text-5xl">
        {title}
      </h1>
      {subtitle && <p className="mt-2 max-w-3xl text-sm text-muted sm:text-base">{subtitle}</p>}
    </motion.div>
  );
}
