import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const AUTH_SECRET = process.env.AUTH_SECRET;

if (!AUTH_SECRET) {
  throw new Error(
    "AUTH_SECRET is not set. Add it to .env.local (pull from Netlify with `netlify env:list --json`).",
  );
}

export const SESSION_COOKIE = "auth_token";
export const SESSION_MAX_AGE_DEFAULT = 60 * 60 * 24 * 7; // 7 days
export const SESSION_MAX_AGE_REMEMBER = 60 * 60 * 24 * 30; // 30 days

export interface UserSessionPayload {
  userId: string;
  email: string;
  name: string;
  plan: string;
  avatar?: string;
}

export function signToken(payload: UserSessionPayload, maxAge: number = SESSION_MAX_AGE_DEFAULT): string {
  return jwt.sign(payload, AUTH_SECRET as string, { expiresIn: maxAge });
}

export function verifyToken(token: string): UserSessionPayload | null {
  try {
    return jwt.verify(token, AUTH_SECRET as string) as UserSessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<UserSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Session whose plan is re-checked against the database.
 * A JWT keeps the plan it was issued with, so an account upgraded in
 * another tab/session (or via the Stripe webhook) would keep the stale
 * plan in server-side checks. This resolves it cheaply when needed.
 */
export async function getFreshSession(): Promise<UserSessionPayload | null> {
  const session = await getSession();
  if (!session) return null;
  if (session.plan !== "free") return session;

  try {
    const { connectToDatabase } = await import("@/lib/db");
    const conn = await connectToDatabase();
    if (!conn) return session;
    const { User } = await import("@/models/User");
    const user = await User.findById(session.userId).select("plan").lean();
    if (user && user.plan && user.plan !== "free") {
      return { ...session, plan: user.plan };
    }
  } catch {
    // DB hiccup — fall back to the token's plan
  }
  return session;
}

export function sessionCookieOptions(maxAge: number = SESSION_MAX_AGE_DEFAULT) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge,
    path: "/",
  };
}

/**
 * Lightweight CSRF mitigation: reject cross-origin mutations.
 * Same-origin browser requests always send an Origin header on POST/PUT/DELETE.
 */
export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // non-browser client / same-origin GET
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (!host) return true;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
