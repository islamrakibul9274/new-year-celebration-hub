import { NextResponse } from "next/server";
import { getSession, signToken, sessionCookieOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { localDB } from "@/lib/store";
import { getPlan } from "@/lib/plans";
import { sendEmail, vipWelcomeEmailHtml } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const { planId } = await req.json().catch(() => ({}));
    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json({ error: "Please sign in or create an account to upgrade your VIP pass." }, { status: 401 });
    }

    const validPlan = ["free", "silver", "diamond"].includes(planId) ? planId : "silver";
    const plan = getPlan(validPlan);
    const alreadyActive = session.plan === validPlan;

    const mongooseConn = await connectToDatabase();
    if (mongooseConn) {
      try {
        await User.findByIdAndUpdate(session.userId, { plan: validPlan });
      } catch {}
    } else {
      localDB.updateUser(session.userId, { plan: validPlan });
    }

    if (!alreadyActive && validPlan !== "free") {
      await sendEmail(
        session.email,
        `👑 Welcome to ${plan.name}!`,
        vipWelcomeEmailHtml(session.name, plan.name),
      );
    }

    const response = NextResponse.json({
      success: true,
      plan: validPlan,
      alreadyActive,
      message: `Congratulations! Your account has been upgraded to ${plan.name} Pass!`,
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
        plan: validPlan,
        avatar: (session as { avatar?: string }).avatar,
      }),
      sessionCookieOptions(),
    );
    return response;
  } catch (error) {
    console.error("Upgrade error:", error);
    return NextResponse.json({ error: "Upgrade failed. Please try again." }, { status: 500 });
  }
}
