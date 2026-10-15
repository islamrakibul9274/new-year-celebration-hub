import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { planId, interval } = await req.json();
    const session = await getSession();

    const origin = req.headers.get("origin") || process.env.AUTH_URL || "http://localhost:3000";

    const priceAmount = interval === "year" 
      ? (planId === "diamond" ? 14900 : 7900) 
      : (planId === "diamond" ? 1900 : 900);

    const planName = planId === "diamond" ? "Diamond Gala All-Access Pass" : "Silver Celebration Pass";

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: planName,
              description: `Full VIP New Year experience with exclusive events & unlimited AI resolutions (${interval === "year" ? "Annual" : "Monthly"})`,
            },
            unit_amount: priceAmount,
            recurring: {
              interval: interval === "year" ? "year" : "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      customer_email: session?.email,
      metadata: {
        userId: session?.userId || "guest",
        planId,
        interval,
      },
      success_url: `${origin}/profile?session_id={CHECKOUT_SESSION_ID}&upgraded=true`,
      cancel_url: `${origin}/pricing?canceled=true`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
