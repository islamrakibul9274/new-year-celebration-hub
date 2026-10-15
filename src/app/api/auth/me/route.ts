import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession, SESSION_COOKIE, verifyToken } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { localDB } from "@/lib/store";
import type { UserLike } from "@/types";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    // Cookie present but token invalid/expired → tell the client so it can show a notice
    if (token && !verifyToken(token)) {
      return NextResponse.json(
        { user: null, error: "Your session has expired. Please sign in again.", code: "session_expired" },
        { status: 401 },
      );
    }

    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ user: null });
    }

    let user: UserLike | null = null;
    const mongooseConn = await connectToDatabase();
    if (mongooseConn) {
      try {
        user = await User.findById(session.userId).select("-password");
      } catch {}
    }

    if (!user) {
      user = localDB.findUserById(session.userId) ?? null;
    }

    if (!user) {
      return NextResponse.json({
        user: {
          userId: session.userId,
          name: session.name,
          email: session.email,
          avatar: session.avatar,
          plan: session.plan || "free",
        },
      });
    }

    return NextResponse.json({
      user: {
        userId: user._id?.toString() || user.userId,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        plan: user.plan || "free",
        themePreference: user.themePreference || "festive-crimson",
        confettiSoundsEnabled: user.confettiSoundsEnabled ?? true,
        customGreeting: user.customGreeting || "Happy New Year!",
        bio: user.bio || "",
        createdAt: user.createdAt,
      },
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}
