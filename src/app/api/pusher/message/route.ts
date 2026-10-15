import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";
import { getSession } from "@/lib/auth";
import { clientKey, rateLimit, tooManyRequests } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const limit = rateLimit(clientKey(req, "pusher-message"), 30, 60_000);
    if (!limit.success) return tooManyRequests(limit.retryAfterSeconds);

    const body = await req.json().catch(() => null);
    const { message, senderName, avatar } = body ?? {};

    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }
    const cleanText = message.trim().slice(0, 300);

    const session = await getSession();
    const payload = {
      id: Date.now().toString(),
      text: cleanText,
      sender:
        (typeof senderName === "string" && senderName.trim().slice(0, 40)) ||
        session?.name ||
        "Party Guest",
      avatar:
        (typeof avatar === "string" && avatar.slice(0, 300)) ||
        session?.avatar ||
        `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent("Guest")}`,
      plan: session?.plan || "free",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    await pusherServer.trigger("live-party-room", "new-message", payload);

    return NextResponse.json({ success: true, message: payload });
  } catch (error) {
    console.error("Pusher message error:", error);
    return NextResponse.json({ error: "Failed to broadcast message" }, { status: 500 });
  }
}
