import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { RSVP } from "@/models/RSVP";
import { localDB } from "@/lib/store";
import { getFreshSession } from "@/lib/auth";
import { isValidEmail, isValidName } from "@/lib/validators";
import { clientKey, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { planAllowsPassType, getPlan, bestPassTier } from "@/lib/plans";
import { sendEmail, ticketEmailHtml } from "@/lib/mailer";
import type { StoredRSVP } from "@/lib/store";

const VALID_PASS_TYPES = ["standard", "vip_silver", "diamond_all_access"];

export async function POST(req: Request) {
  try {
    const limit = rateLimit(clientKey(req, "rsvp"), 10, 60_000);
    if (!limit.success) return tooManyRequests(limit.retryAfterSeconds);

    const body = await req.json().catch(() => null);
    const { guestName, guestEmail, guestsCount, passType, celebrationWish } = body ?? {};

    if (!isValidName(guestName)) {
      return NextResponse.json({ error: "Please enter your full name (2–60 characters)." }, { status: 400 });
    }
    if (!isValidEmail(guestEmail)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const partySize = Number(guestsCount) || 1;
    if (partySize < 1 || partySize > 10) {
      return NextResponse.json({ error: "Party size must be between 1 and 10 guests." }, { status: 400 });
    }
    if (typeof passType === "string" && !VALID_PASS_TYPES.includes(passType)) {
      return NextResponse.json({ error: "Please choose a valid pass type." }, { status: 400 });
    }

    const session = await getFreshSession();
    const userPlan = getPlan(session?.plan);

    // Premium tiers are a membership benefit — never issued without the pass
    const entitledPassType =
      session && passType && planAllowsPassType(session.plan, passType)
        ? passType
        : bestPassTier(session?.plan);
    const wasDowngraded = Boolean(passType && passType !== entitledPassType);

    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const ticketCode = `NYE-2026-${randomSuffix}`;

    const rsvpData = {
      userId: session?.userId || null,
      guestName: guestName.trim(),
      guestEmail: guestEmail.toLowerCase().trim(),
      guestsCount: partySize,
      passType: entitledPassType,
      celebrationWish:
        typeof celebrationWish === "string" && celebrationWish.trim()
          ? celebrationWish.trim().slice(0, 300)
          : "Looking forward to an amazing year!",
      ticketCode,
      status: "confirmed",
    };

    const mongooseConn = await connectToDatabase();
    if (mongooseConn) {
      try {
        await RSVP.create(rsvpData);
      } catch {
        localDB.createRSVP(rsvpData);
      }
    } else {
      localDB.createRSVP(rsvpData);
    }

    await sendEmail(
      rsvpData.guestEmail,
      `🎟️ Your Midnight Party Pass [${ticketCode}] Confirmed!`,
      ticketEmailHtml({
        guestName: rsvpData.guestName,
        ticketCode,
        passType: rsvpData.passType,
        guestsCount: partySize,
      }),
    );

    return NextResponse.json({
      success: true,
      ticketCode,
      passType: entitledPassType,
      downgraded: wasDowngraded,
      message: wasDowngraded
        ? `RSVP confirmed! Your ${userPlan.name} pass includes the Standard tier — upgrade to unlock VIP passes.`
        : "RSVP successfully confirmed! Check your email for your digital ticket.",
    });
  } catch (error) {
    console.error("RSVP error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Unable to confirm RSVP. Please try again." }, { status: 500 });
  }
}

export async function GET() {
  try {
    let totalCount = 240;
    let latestGuests: StoredRSVP[] = [];

    const mongooseConn = await connectToDatabase();
    if (mongooseConn) {
      try {
        const count = await RSVP.countDocuments({ status: "confirmed" });
        totalCount += count;
        latestGuests = await RSVP.find({ status: "confirmed" })
          .sort({ createdAt: -1 })
          .limit(8)
          .select("guestName passType celebrationWish createdAt");
      } catch {}
    }

    if (latestGuests.length === 0) {
      const localRsvps = localDB.getRSVPs();
      totalCount += localRsvps.length;
      latestGuests = localRsvps.slice(-8).reverse();
    }

    return NextResponse.json({ totalCount, latestGuests });
  } catch (error) {
    console.error("RSVP list error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Unable to load the guest list." }, { status: 500 });
  }
}
