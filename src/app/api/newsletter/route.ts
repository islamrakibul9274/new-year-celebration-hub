import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Newsletter } from "@/models/Newsletter";
import { localDB } from "@/lib/store";
import { isValidEmail, normalizeEmail } from "@/lib/validators";
import { clientKey, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { newsletterEmailHtml, sendEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const limit = rateLimit(clientKey(req, "newsletter"), 5, 60_000);
    if (!limit.success) return tooManyRequests(limit.retryAfterSeconds);

    const body = await req.json().catch(() => null);
    const { email } = body ?? {};

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }

    const cleanEmail = normalizeEmail(email);

    const mongooseConn = await connectToDatabase();
    if (mongooseConn) {
      try {
        await Newsletter.create({ email: cleanEmail, source: "homepage_footer" });
      } catch {
        // Duplicate subscription — the subscriber still gets a confirmation below
      }
    }
    localDB.createNewsletter(cleanEmail);

    await sendEmail(
      cleanEmail,
      "✨ You are Subscribed to 2026 Holiday Specials & Secret Perks!",
      newsletterEmailHtml(),
    );

    return NextResponse.json({
      success: true,
      message: "Thank you for subscribing! Check your inbox for secret holiday perks.",
    });
  } catch (error) {
    console.error("Newsletter error:", error);
    return NextResponse.json({ error: "Subscription failed. Please try again." }, { status: 500 });
  }
}
