import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { admins } from "@/db/schema";

const COOKIE = "admin_token";
const MAX_AGE = 60 * 60 * 24 * 7;

function secret() {
  const s = process.env.JWT_SECRET || "dev-insecure-secret-change-me-please-32chars";
  return new TextEncoder().encode(s);
}

export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 12);
}

export async function verifyPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}

/** Creates the first admin from env vars (or admin / admin123) when none exists. */
/** Creates or updates the admin with correct bcrypt password hash. */
export async function ensureAdmin() {
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const hashedPassword = await hashPassword(password);
  
  const existing = await db.select().from(admins).where(eq(admins.username, username)).limit(1);
  
  if (existing.length === 0) {
    await db.insert(admins).values({ username, passwordHash: hashedPassword });
  } else {
    await db.update(admins).set({ passwordHash: hashedPassword }).where(eq(admins.username, username));
  }
}

export async function createSession(adminId: number, username: string) {
  const token = await new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(adminId))
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
  const h = await headers();
  const https = h.get("x-forwarded-proto") === "https";
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: https,
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export type Session = { id: number; username: string };

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const id = Number(payload.sub);
    if (!id) return null;
    const [row] = await db.select().from(admins).where(eq(admins.id, id)).limit(1);
    if (!row) return null;
    return { id: row.id, username: row.username };
  } catch {
    return null;
  }
}

/** For server components/pages: redirect to login if unauthenticated. */
export async function requireAdminPage(): Promise<Session> {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  return s;
}

/** For server actions / route handlers: throws if unauthenticated. */
export async function requireAdmin(): Promise<Session> {
  const s = await getSession();
  if (!s) throw new Error("Unauthorized");
  return s;
}
