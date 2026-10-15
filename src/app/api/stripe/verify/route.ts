import { NextResponse } from "next/server";
import { getSession, signToken, sessionCookieOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { localDB } from "@/lib/store";
import { getPlan } from "@/lib/plans";
import { sendEmail, vipWelcomeEmailHtml } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json().catch(() => ({}));
    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!sessionId) {
      return NextResponse.json({ error: "Missing checkout session." }, { status: 400 });
    }

    // Verify against Stripe when it is configured — never trust the client's claim
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        const { stripe } = await import("@/lib/stripe");
        const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

        const paid =
          checkoutSession.payment_status === "paid" ||
          (checkoutSession.status === "complete" && checkoutSession.payment_status !== "unpaid");

        // The checkout session must belong to the signed-in user
        const ownsSession =
          checkoutSession.metadata?.userId === session.userId ||
          (checkoutSession.customer_email || "").toLowerCase() ===
            (session.email || "").toLowerCase();

        if (!ownsSession) {
          return NextResponse.json(
            { error: "This checkout session doesn't belong to your account." },
            { status: 403 },
          );
        }
        if (!paid) {
          return NextResponse.json({ error: "Your payment hasn't completed yet." }, { status: 402 });
        }

        return finishUpgrade(session, checkoutSession.metadata?.planId || "silver");
      } catch (e) {
        console.error("Stripe session verify failed:", e instanceof Error ? e.message : e);
        return NextResponse.json(
          { error: "Could not verify your payment. Please try again in a moment." },
          { status: 502 },
        );
      }
    }

    // No Stripe key configured (demo environment): honour the requested plan
    return finishUpgrade(session, "silver");
  } catch (error) {
    console.error("Verify route error:", error);
    return NextResponse.json({ error: "Unable to verify upgrade." }, { status: 500 });
  }
}

async function finishUpgrade(
  session: { userId: string; email: string; name: string; plan: string },
  planToSet: string,
) {
  const alreadyUpgraded = session.plan === planToSet;

  const mongooseConn = await connectToDatabase();
  if (mongooseConn) {
    try {
      await User.findByIdAndUpdate(session.userId, { plan: planToSet });
    } catch {}
  } else {
    localDB.updateUser(session.userId, { plan: planToSet });
  }

  if (!alreadyUpgraded) {
    await sendEmail(
      session.email,
      `👑 Welcome to ${getPlan(planToSet).name}!`,
      vipWelcomeEmailHtml(session.name, getPlan(planToSet).name),
    );
  }

  const plan = getPlan(planToSet);
  const response = NextResponse.json({
    success: true,
    plan: plan.id,
    alreadyUpgraded,
    perks: plan.perks,
    passTiers: plan.passTiers,
  });
  // Re-issue the session cookie so the new plan applies immediately
  response.cookies.set(
    "auth_token",
    signToken({
      userId: session.userId,
      email: session.email,
      name: session.name,
      plan: plan.id,
      avatar: (session as { avatar?: string }).avatar,
    }),
    sessionCookieOptions(),
  );
  return response;
}

/** GET helper so the client can check what a plan unlocks. */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const plan = getPlan(searchParams.get("plan"));
  return NextResponse.json({
    plan: plan.id,
    name: plan.name,
    perks: plan.perks,
    passTiers: plan.passTiers,
    aiGenerationsPerDay: plan.aiGenerationsPerDay === Infinity ? "unlimited" : plan.aiGenerationsPerDay,
  });
}
