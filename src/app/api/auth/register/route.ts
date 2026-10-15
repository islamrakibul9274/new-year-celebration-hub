import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { localDB } from "@/lib/store";
import { signToken, sessionCookieOptions, isSameOrigin } from "@/lib/auth";
import { firstPasswordProblem, isValidEmail, isValidName, normalizeEmail } from "@/lib/validators";
import { clientKey, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { sendEmail, welcomeEmailHtml } from "@/lib/mailer";
import type { SessionUser } from "@/types";

export async function POST(req: Request) {
  try {
    if (!isSameOrigin(req)) {
      return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    }

    const limit = rateLimit(clientKey(req, "register"), 5, 15 * 60_000);
    if (!limit.success) return tooManyRequests(limit.retryAfterSeconds);

    const body = await req.json().catch(() => null);
    const { name, email, password } = body ?? {};

    if (!isValidName(name)) {
      return NextResponse.json(
        { error: "Please enter your name (2–60 characters)." },
        { status: 400 },
      );
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    const passwordProblem = firstPasswordProblem(password);
    if (passwordProblem) {
      return NextResponse.json({ error: passwordProblem }, { status: 400 });
    }

    const cleanEmail = normalizeEmail(email);
    const cleanName = name.trim();
    const mongooseConn = await connectToDatabase();
    let createdUser: SessionUser | null = null;

    if (mongooseConn) {
      try {
        const existingUser = await User.findOne({ email: cleanEmail });
        if (existingUser) {
          return NextResponse.json(
            { error: "An account with this email already exists. Please sign in." },
            { status: 409 },
          );
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userDoc = await User.create({
          name: cleanName,
          email: cleanEmail,
          password: hashedPassword,
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanName)}`,
          plan: "free",
        });

        createdUser = {
          userId: userDoc._id.toString(),
          name: userDoc.name,
          email: userDoc.email,
          plan: userDoc.plan,
          avatar: userDoc.avatar ?? "",
        };
      } catch (mongoErr) {
        console.warn("MongoDB write failed, falling back to local DB", mongoErr);
      }
    }

    if (!createdUser) {
      const existingUser = localDB.findUserByEmail(cleanEmail);
      if (existingUser) {
        return NextResponse.json(
          { error: "An account with this email already exists. Please sign in." },
          { status: 409 },
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userDoc = localDB.createUser({
        name: cleanName,
        email: cleanEmail,
        password: hashedPassword,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanName)}`,
        plan: "free",
        themePreference: "festive-crimson",
        confettiSoundsEnabled: true,
        customGreeting: "Happy New Year! Wishing you boundless joy and prosperity!",
        bio: "Ready to celebrate and achieve great milestones this year!",
      });

      createdUser = {
        userId: userDoc._id,
        name: userDoc.name,
        email: userDoc.email,
        plan: userDoc.plan ?? "free",
        avatar: userDoc.avatar ?? "",
      };
    }

    await sendEmail(cleanEmail, "🎉 Welcome to the New Year Celebration Hub!", welcomeEmailHtml(cleanName));

    if (!createdUser) {
      return NextResponse.json({ error: "Unable to create your account. Please try again." }, { status: 500 });
    }
    const token = signToken({ ...createdUser, avatar: createdUser.avatar ?? "" });
    const response = NextResponse.json({
      success: true,
      user: createdUser,
      message: "Account created. Welcome to the celebration!",
    });
    response.cookies.set("auth_token", token, sessionCookieOptions());
    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Unable to create your account. Please try again." }, { status: 500 });
  }
}
