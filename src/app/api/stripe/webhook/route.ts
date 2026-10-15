import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // Never trust unauthenticated webhook payloads
  if (!webhookSecret || !signature) {
    console.error("Webhook rejected: missing signature or STRIPE_WEBHOOK_SECRET");
    return NextResponse.json({ error: "Webhook signature required" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    await connectToDatabase();

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as unknown as { customer?: string; subscription?: string; metadata?: Record<string, string> };
      const userId = session.metadata?.userId;
      const planId = session.metadata?.planId || "silver";

      if (userId && userId !== "guest") {
        await User.findByIdAndUpdate(userId, {
          plan: planId,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handling error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Webhook handling failed" }, { status: 500 });
  }
}
