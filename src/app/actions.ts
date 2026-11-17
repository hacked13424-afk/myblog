"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { admins, messages, posts, settings } from "@/db/schema";
import {
  createSession,
  destroySession,
  ensureAdmin,
  hashPassword,
  requireAdmin,
  verifyPassword,
} from "@/lib/auth";
import { SETTING_KEYS, type SettingKey } from "@/lib/settings";
import { excerptFrom, slugify } from "@/lib/utils";

export type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

function refresh() {
  revalidatePath("/", "layout");
}

/* ------------------------------ Auth ------------------------------ */

const attempts = new Map<string, { count: number; until: number }>();

export async function loginAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "local").split(",")[0].trim();
  const rec = attempts.get(ip);
  if (rec && rec.until > Date.now() && rec.count >= 5) {
    return { error: "Too many failed attempts. Please try again in a few minutes." };
  }
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  await ensureAdmin();
  const [row] = await db.select().from(admins).where(eq(admins.username, username)).limit(1);
  const ok = row ? await verifyPassword(password, row.passwordHash) : false;
  if (!ok || !row) {
    const count = (rec && rec.until > Date.now() ? rec.count : 0) + 1;
    attempts.set(ip, { count, until: Date.now() + 10 * 60 * 1000 });
    return { error: "Invalid username or password." };
  }
  attempts.delete(ip);
  await createSession(row.id, row.username);
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

export async function changeCredentials(input: {
  currentPassword: string;
  newUsername: string;
  newPassword: string;
}): Promise<Result> {
  const session = await requireAdmin();
  const [row] = await db.select().from(admins).where(eq(admins.id, session.id)).limit(1);
  if (!row || !(await verifyPassword(input.currentPassword, row.passwordHash))) {
    return { ok: false, error: "Current password is incorrect." };
  }
  const username = input.newUsername.trim();
  if (username.length < 3) return { ok: false, error: "Username must be at least 3 characters." };
  if (input.newPassword && input.newPassword.length < 8) {
    return { ok: false, error: "New password must be at least 8 characters." };
  }
  const clash = await db
    .select({ id: admins.id })
    .from(admins)
    .where(and(eq(admins.username, username), ne(admins.id, row.id)))
    .limit(1);
  if (clash.length) return { ok: false, error: "That username is already taken." };
  await db
    .update(admins)
    .set({
      username,
      passwordHash: input.newPassword ? await hashPassword(input.newPassword) : row.passwordHash,
      updatedAt: new Date(),
    })
    .where(eq(admins.id, row.id));
  await createSession(row.id, username);
  return { ok: true };
}

/* ------------------------------ Posts ------------------------------ */

export type PostInput = {
  id?: number;
  title: string;
  slug: string;
  type: string;
  status: string;
  category: string;
  excerpt: string;
  content: string;
  coverImage: string;
  metaTitle: string;
  metaDescription: string;
  featured: boolean;
};

async function uniqueSlug(base: string, excludeId?: number) {
  let slug = base;
  let n = 1;
  for (;;) {
    const conds = [eq(posts.slug, slug)];
    if (excludeId) conds.push(ne(posts.id, excludeId));
    const hit = await db.select({ id: posts.id }).from(posts).where(and(...conds)).limit(1);
    if (!hit.length) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

export async function savePost(input: PostInput): Promise<Result<{ id: number; slug: string }>> {
  await requireAdmin();
  const title = input.title.trim();
  if (!title) return { ok: false, error: "Title is required." };
  const type = input.type === "article" ? "article" : "blog";
  const status = input.status === "published" ? "published" : "draft";
  const explicit = input.slug.trim();
  let slug: string;
  if (explicit) {
    slug = slugify(explicit);
    const clash = await db
      .select({ id: posts.id })
      .from(posts)
      .where(input.id ? and(eq(posts.slug, slug), ne(posts.id, input.id)) : eq(posts.slug, slug))
      .limit(1);
    if (clash.length) return { ok: false, error: `The slug "${slug}" is already used by another post.` };
  } else {
    slug = await uniqueSlug(slugify(title), input.id);
  }
  const values = {
    title,
    slug,
    type,
    status,
    category: input.category.trim() || "General",
    excerpt: input.excerpt.trim() || excerptFrom(input.content, 180),
    content: input.content,
    coverImage: input.coverImage.trim(),
    metaTitle: input.metaTitle.trim(),
    metaDescription: input.metaDescription.trim(),
    featured: input.featured,
    updatedAt: new Date(),
  };
  try {
    if (input.id) {
      const [prev] = await db.select().from(posts).where(eq(posts.id, input.id)).limit(1);
      if (!prev) return { ok: false, error: "Post not found." };
      const publishedAt =
        status === "published" ? (prev.publishedAt ?? new Date()) : prev.publishedAt;
      await db.update(posts).set({ ...values, publishedAt }).where(eq(posts.id, input.id));
      refresh();
      return { ok: true, id: input.id, slug };
    }
    const [created] = await db
      .insert(posts)
      .values({ ...values, publishedAt: status === "published" ? new Date() : null })
      .returning({ id: posts.id });
    refresh();
    return { ok: true, id: created.id, slug };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not save the post. Please try again." };
  }
}

export async function deletePost(id: number): Promise<Result> {
  await requireAdmin();
  await db.delete(posts).where(eq(posts.id, id));
  refresh();
  return { ok: true };
}

export async function setPostStatus(id: number, status: "draft" | "published"): Promise<Result> {
  await requireAdmin();
  const [prev] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  if (!prev) return { ok: false, error: "Post not found." };
  await db
    .update(posts)
    .set({
      status,
      publishedAt: status === "published" ? (prev.publishedAt ?? new Date()) : prev.publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, id));
  refresh();
  return { ok: true };
}

/* ----------------------------- Settings ---------------------------- */

export async function saveSettings(values: Partial<Record<SettingKey, string>>): Promise<Result> {
  await requireAdmin();
  const entries = Object.entries(values).filter(([k]) => SETTING_KEYS.includes(k as SettingKey));
  for (const [key, value] of entries) {
    const v = String(value ?? "");
    await db
      .insert(settings)
      .values({ key, value: v })
      .onConflictDoUpdate({ target: settings.key, set: { value: v } });
  }
  refresh();
  return { ok: true };
}

/* ----------------------------- Messages ---------------------------- */

export async function setMessageRead(id: number, isRead: boolean): Promise<Result> {
  await requireAdmin();
  await db.update(messages).set({ isRead }).where(eq(messages.id, id));
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function deleteMessage(id: number): Promise<Result> {
  await requireAdmin();
  await db.delete(messages).where(eq(messages.id, id));
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function submitContact(
  _prev: { ok?: boolean; error?: string } | null,
  formData: FormData,
): Promise<{ ok?: boolean; error?: string }> {
  if (String(formData.get("website") ?? "")) return { ok: true }; // honeypot
  const name = String(formData.get("name") ?? "").trim().slice(0, 200);
  const email = String(formData.get("email") ?? "").trim().slice(0, 320);
  const subject = String(formData.get("subject") ?? "").trim().slice(0, 300);
  const message = String(formData.get("message") ?? "").trim().slice(0, 10000);
  if (!name || !email || !message) return { error: "Please fill in your name, email and message." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Please enter a valid email address." };
  await db.insert(messages).values({ name, email, subject, message });
  revalidatePath("/admin", "layout");
  return { ok: true };
}
