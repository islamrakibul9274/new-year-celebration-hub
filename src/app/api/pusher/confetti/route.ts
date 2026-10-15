import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { intensity, triggerBy } = await req.json();
    const session = await getSession();

    const payload = {
      triggerBy: triggerBy || session?.name || "A festive friend",
      intensity: intensity || "huge",
      timestamp: Date.now(),
    };

    await pusherServer.trigger("live-party-room", "confetti-blast", payload);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to trigger confetti" }, { status: 500 });
  }
}
