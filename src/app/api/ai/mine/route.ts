import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Resolution } from "@/models/Resolution";

/** GET the signed-in user's saved AI resolutions. */
export async function GET() {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ resolutions: [] });
  }
  const mongooseConn = await connectToDatabase();
  if (!mongooseConn) {
    return NextResponse.json({ resolutions: [] });
  }
  try {
    const resolutions = await Resolution.find({ userId: session.userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("goal category motivationalQuote milestones aiPrompt createdAt");
    return NextResponse.json({ resolutions });
  } catch (error) {
    console.error("Failed to load user resolutions", error);
    return NextResponse.json({ resolutions: [] });
  }
}
