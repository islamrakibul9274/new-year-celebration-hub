import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { localDB } from "@/lib/store";
import { signToken, sessionCookieOptions, SESSION_MAX_AGE_REMEMBER, isSameOrigin } from "@/lib/auth";
import { isValidEmail, normalizeEmail } from "@/lib/validators";
import { clientKey, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import type { UserLike } from "@/types";

// Pre-computed hash so a missing account costs the same as a wrong password
const DECOY_HASH = bcrypt.hashSync("decoy-password-for-timing", 10);

export async function POST(req: Request) {
  try {
    if (!isSameOrigin(req)) {
      return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    const { email, password, remember } = body ?? {};

    if (!isValidEmail(email) || typeof password !== "string" || password.length === 0) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const limit = rateLimit(clientKey(req, `login:${normalizeEmail(email)}`), 8, 15 * 60_000);
    if (!limit.success) return tooManyRequests(limit.retryAfterSeconds);

    const cleanEmail = normalizeEmail(email);
    let foundUser: UserLike | null = null;

    const mongooseConn = await connectToDatabase();
    if (mongooseConn) {
      try {
        foundUser = await User.findOne({ email: cleanEmail });
      } catch (e) {
        console.warn("Mongo find failed, checking local DB", e);
      }
    }
    if (!foundUser) {
      foundUser = localDB.findUserByEmail(cleanEmail) ?? null;
    }

    const hash = foundUser?.password || DECOY_HASH;
    const isMatch = await bcrypt.compare(password, hash);

    if (!foundUser || !foundUser.password || !isMatch) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const sessionPayload = {
      userId: foundUser._id?.toString() || foundUser.userId || "",
      email: foundUser.email,
      name: foundUser.name,
      plan: foundUser.plan || "free",
      avatar: foundUser.avatar || "",
    };

    const token = signToken(sessionPayload, remember ? SESSION_MAX_AGE_REMEMBER : undefined);
    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
      message: "Signed in successfully!",
    });
    response.cookies.set("auth_token", token, sessionCookieOptions(remember ? SESSION_MAX_AGE_REMEMBER : undefined));
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Unable to sign in. Please try again." }, { status: 500 });
  }
}
