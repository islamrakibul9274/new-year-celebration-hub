import { NextResponse } from "next/server";
import { groq } from "@/lib/groq";
import { connectToDatabase } from "@/lib/db";
import { Resolution } from "@/models/Resolution";
import { getFreshSession } from "@/lib/auth";
import { clientKey, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { getPlan } from "@/lib/plans";
import { currentUsage, incrementUsage } from "@/lib/usage";

const AI_MODEL = "openai/gpt-oss-120b";

const RESOLUTION_SYSTEM_PROMPT = `You are a world-class New Year Resolution Strategist and Life Coach.
It is the lead-up to New Year 2026 — all plans, milestones, and references must be for the year 2026.
Turn the user's goal/theme into an inspiring, actionable, step-by-step New Year Resolution plan.
Format your response as strict JSON with this shape:
{
  "title": "Inspiring goal title",
  "category": "Health & Fitness" | "Career & Tech" | "Mindfulness" | "Financial Freedom" | "Travel & Fun",
  "motivationalQuote": "A punchy, memorable motto for the year (must reference 2026)",
  "milestones": [
    "Q1 (Jan-Mar) milestone with concrete habit",
    "Q2 (Apr-Jun) milestone with progress metric",
    "Q3 (Jul-Sep) milestone with expansion",
    "Q4 (Oct-Dec) celebration & mastery target"
  ],
  "actionTip": "A golden rule for daily execution"
}`;

const CARD_SYSTEM_PROMPT = `You are a festive, poetic, and heartwarming New Year Greeting Card Writer.
It is the lead-up to New Year 2026 — greetings must be for the year 2026.
Generate a beautifully styled New Year Card message based on the user's prompt.
Format your response as strict JSON with this shape:
{
  "title": "A catchy title for the greeting card",
  "quote": "A poetic 2-4 sentence festive greeting message full of warmth and celebration (must reference 2026)",
  "wishes": ["3 distinct bullet-point wishes for health, prosperity, and joy"],
  "signature": "A warm festive sign-off"
}`;

function parseJsonContent(content: string | null | undefined): Record<string, unknown> | null {
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const { prompt, type, category, authorName } = body ?? {};

    if (typeof prompt !== "string" || prompt.trim().length < 3) {
      return NextResponse.json(
        { error: "Please describe what you'd like to generate (a few words is enough)." },
        { status: 400 },
      );
    }
    if (prompt.length > 1000) {
      return NextResponse.json({ error: "Please keep your description under 1000 characters." }, { status: 400 });
    }

    const limit = rateLimit(clientKey(req, "ai-generate"), 10, 60_000);
    if (!limit.success) return tooManyRequests(limit.retryAfterSeconds);

    const session = await getFreshSession();
    const plan = getPlan(session?.plan);

    // Enforce the free-plan daily quota so the pricing page stays honest
    if (plan.aiGenerationsPerDay !== Infinity) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const identifier = session?.userId ? `ai:${session.userId}` : `ai-guest:${clientKey(req, "guest")}`;

      let usedToday = currentUsage(identifier);
      if (session?.userId) {
        const mongooseConn = await connectToDatabase();
        if (mongooseConn) {
          try {
            usedToday = Math.max(
              usedToday,
              await Resolution.countDocuments({
                userId: session.userId,
                createdAt: { $gte: startOfDay },
              }),
            );
          } catch {}
        }
      }

      if (usedToday >= plan.aiGenerationsPerDay) {
        return NextResponse.json(
          {
            error: `Free explorers get ${plan.aiGenerationsPerDay} AI generations per day. Upgrade to a VIP pass for unlimited resolutions and greeting cards.`,
            upgradeRequired: true,
          },
          { status: 403 },
        );
      }
      incrementUsage(identifier);
    }

    const isCard = type === "card";

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: isCard ? CARD_SYSTEM_PROMPT : RESOLUTION_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Generate for: ${prompt.trim()}. Category: ${category || "Career & Tech"}`,
        },
      ],
      model: AI_MODEL,
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const parsedData = parseJsonContent(completion.choices[0]?.message?.content);
    if (!parsedData) {
      return NextResponse.json(
        { error: "The AI returned an unexpected response. Please try again." },
        { status: 502 },
      );
    }

    if (!isCard) {
      const mongooseConn = await connectToDatabase();
      if (mongooseConn) {
        try {
          await Resolution.create({
            userId: session?.userId || null,
            userEmail: session?.email || "guest@celebration.app",
            authorName: authorName || session?.name || "Festive Dreamer",
            goal: parsedData.title || prompt.trim(),
            category: category || "Career & Tech",
            milestones: Array.isArray(parsedData.milestones) ? parsedData.milestones.slice(0, 8) : [],
            motivationalQuote: parsedData.motivationalQuote || "",
            aiPrompt: prompt.trim(),
          });
        } catch (err) {
          console.error("Failed to persist resolution", err);
        }
      }
    }

    return NextResponse.json({ success: true, data: parsedData });
  } catch (error: unknown) {
    console.error("Groq AI generation error:", error);
    const status = (error as { status?: number })?.status === 429 ? 429 : 500;
    const message =
      status === 429
        ? "The AI is busy right now. Please try again in a moment."
        : "Failed to generate AI content. Please try again.";
    return NextResponse.json({ error: message }, { status });
  }
}

export async function GET() {
  try {
    const mongooseConn = await connectToDatabase();
    if (!mongooseConn) {
      return NextResponse.json({ resolutions: [] });
    }
    const resolutions = await Resolution.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .limit(12)
      .select("goal category motivationalQuote authorName createdAt");
    return NextResponse.json({ resolutions });
  } catch (error) {
    console.error("Failed to load resolutions", error);
    return NextResponse.json({ resolutions: [] });
  }
}
