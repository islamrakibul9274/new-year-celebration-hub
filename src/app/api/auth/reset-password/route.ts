import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { PasswordResetToken } from "@/models/PasswordResetToken";
import { isSameOrigin } from "@/lib/auth";
import { checkPassword, PASSWORD_MIN_LENGTH } from "@/lib/validators";
import { clientKey, rateLimit, tooManyRequests } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    if (!isSameOrigin(req)) {
      return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    }

    const limit = rateLimit(clientKey(req, "reset-password"), 5, 15 * 60_000);
    if (!limit.success) return tooManyRequests(limit.retryAfterSeconds);

    const body = await req.json().catch(() => null);
    const { token, password } = body ?? {};

    if (typeof token !== "string" || token.length < 20) {
      return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
    }

    const passwordResult = checkPassword(password);
    if (!passwordResult.valid) {
      return NextResponse.json(
        { error: `Password needs at least ${PASSWORD_MIN_LENGTH} characters.` },
        { status: 400 },
      );
    }

    const mongooseConn = await connectToDatabase();
    if (!mongooseConn) {
      return NextResponse.json(
        { error: "Password reset is temporarily unavailable. Please try again later." },
        { status: 503 },
      );
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const resetDoc = await PasswordResetToken.findOne({
      tokenHash,
      usedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    });
    if (!resetDoc) {
      return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedUser = await User.findByIdAndUpdate(resetDoc.userId, { password: hashedPassword });
    if (!updatedUser) {
      return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
    }

    // Invalidate every outstanding token for this user
    await PasswordResetToken.updateMany(
      { userId: resetDoc.userId, usedAt: { $exists: false } },
      { usedAt: new Date() },
    );

    return NextResponse.json({
      success: true,
      message: "Your password has been updated. You can now sign in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Unable to reset password. Please try again." }, { status: 500 });
  }
}
