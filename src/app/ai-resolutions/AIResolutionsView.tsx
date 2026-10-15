"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  BrainCircuit, 
  Sparkles, 
  CheckCircle2, 
  Copy, 
  Flame, 
  Quote,
  Crown
} from "lucide-react";
import { triggerFestiveConfetti } from "@/components/effects/ConfettiTrigger";
import { useToast } from "@/components/ui/Toast";
import type { GeneratedResult, PublicResolution } from "@/types";

export default function AIResolutionsPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<"resolution" | "card">("resolution");
  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState("Career & Tech");
  const [authorName, setAuthorName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [error, setError] = useState("");
  const [upgradeRequired, setUpgradeRequired] = useState(false);
  const [publicFeed, setPublicFeed] = useState<PublicResolution[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/ai/generate")
      .then((res) => res.json())
      .then((data) => {
        if (data.resolutions) setPublicFeed(data.resolutions);
      })
      .catch(() => {});
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;
    setError("");
    setUpgradeRequired(false);
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          type: tab,
          category,
          authorName,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.data) {
        setResult(data.data);
        triggerFestiveConfetti(0.5);
        toast(tab === "resolution" ? "Your AI resolution plan is ready!" : "Your greeting card is ready!", "success");
        if (tab === "resolution") {
          fetch("/api/ai/generate")
            .then((r) => r.json())
            .then((d) => d.resolutions && setPublicFeed(d.resolutions));
        }
      } else if (res.status === 403 && data.upgradeRequired) {
        setUpgradeRequired(true);
        setError(data.error || "Daily free limit reached.");
      } else {
        setError(data.error || "Unable to generate content. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-bold uppercase tracking-wider">
          <BrainCircuit className="w-4 h-4" />
          <span>Powered by Groq AI</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-ink">
          AI Resolution Coach & <br />
          <span className="festive-gradient-text">Festive Greeting Studio</span>
        </h1>
        <p className="text-ink-secondary text-base sm:text-lg">
          Transform your raw ambitions into structured quarterly milestones, or create poetic New Year greeting cards to share with loved ones.
        </p>

        {/* Tab Toggle */}
        <div className="inline-flex p-1.5 rounded-full bg-white/[0.06] border border-hairline mt-4">
          <button
            onClick={() => { setTab("resolution"); setResult(null); }}
            className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition ${
              tab === "resolution"
                ? "bg-gradient-to-r from-primary to-gold text-ink shadow-lg"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            🎯 AI Resolution Architect
          </button>
          <button
            onClick={() => { setTab("card"); setResult(null); }}
            className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition ${
              tab === "card"
                ? "bg-gradient-to-r from-primary to-gold text-ink shadow-lg"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            💌 Festive Greeting Card Maker
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Form (5 Cols) */}
        <div className="lg:col-span-5">
          <div className="glass-card rounded-card p-6 sm:p-8 border border-hairline-strong space-y-5">
            <h3 className="text-xl font-bold text-ink flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gold" />
              <span>{tab === "resolution" ? "Craft Your 2026 Blueprint" : "Generate Custom Card"}</span>
            </h3>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label htmlFor="ai-author" className="text-xs font-semibold text-ink-secondary block mb-1.5">
                  Your Name / Signature
                </label>
                <input
                  id="ai-author"
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. Alex"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-hairline text-ink placeholder:text-ink-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60 focus:border-rose-500 text-sm"
                />
              </div>

              {tab === "resolution" && (
                <div>
                  <label htmlFor="ai-category" className="text-xs font-semibold text-ink-secondary block mb-1.5">
                    Category
                  </label>
                  <select
                    id="ai-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface border border-hairline text-ink text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60 focus:border-rose-500"
                  >
                    <option value="Career & Tech">💻 Career & Tech</option>
                    <option value="Health & Fitness">💪 Health & Fitness</option>
                    <option value="Mindfulness">🧘 Mindfulness & Peace</option>
                    <option value="Financial Freedom">💰 Financial Freedom</option>
                    <option value="Travel & Fun">✈️ Travel & Adventure</option>
                  </select>
                </div>
              )}

              <div>
                <label htmlFor="ai-prompt" className="text-xs font-semibold text-ink-secondary block mb-1.5">
                  {tab === "resolution" ? "What is your main ambition or dream?" : "Who is this card for & what tone?"}
                </label>
                <textarea
                  id="ai-prompt"
                  rows={4}
                  required
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    tab === "resolution"
                      ? "e.g. Master fullstack AI development, run a half-marathon, and build a profitable SaaS..."
                      : "e.g. For my best friend Sarah who is launching her startup this year, make it heartwarming and energetic..."
                  }
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-hairline text-ink placeholder:text-ink-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60 focus:border-rose-500 text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary via-rose-600 to-gold text-ink font-bold text-sm shadow-xl shadow-primary/30 hover:opacity-95 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <BrainCircuit className="w-4 h-4 animate-spin" />
                    <span>Architecting with Groq AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate AI {tab === "resolution" ? "Resolution Plan" : "Greeting Card"}</span>
                  </>
                )}
              </button>

              {error && (
                <div
                  role="alert"
                  className="p-3 rounded-xl bg-danger-soft border border-danger/40 text-danger text-xs font-semibold space-y-2"
                >
                  <p>{error}</p>
                  {upgradeRequired && (
                    <Link
                      href="/pricing"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary to-gold text-ink font-bold text-[11px]"
                    >
                      <Crown className="w-3 h-3" aria-hidden="true" />
                      Unlock unlimited AI — see VIP passes
                    </Link>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right Output View (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="glass-card rounded-card p-6 sm:p-8 border border-amber-400/40 relative overflow-hidden animate-in fade-in zoom-in-95">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-amber-400 to-rose-500" />

              {/* Action Buttons */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-bold uppercase tracking-widest text-gold">
                  {tab === "resolution" ? "2026 Master Resolution" : "Personalized Greeting Card"}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(result, null, 2))}
                    className="p-2 rounded-xl bg-white/[0.08] hover:bg-white/15 text-ink text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
              </div>

              {tab === "resolution" ? (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-ink">{result.title}</h2>
                    {result.motivationalQuote && (
                      <p className="text-primary font-medium italic mt-1 text-sm">
                        &ldquo;{result.motivationalQuote}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Milestones */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted">Quarterly Milestones:</h4>
                    <div className="grid grid-cols-1 gap-2.5">
                      {result.milestones?.map((m: string, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.04] border border-hairline">
                          <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                          <span className="text-xs sm:text-sm text-ink">{m}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {result.actionTip && (
                    <div className="p-4 rounded-2xl bg-gold/10 border border-amber-500/30">
                      <p className="text-xs text-gold font-bold uppercase tracking-wider mb-1">Coach&apos;s Daily Execution Rule</p>
                      <p className="text-xs sm:text-sm text-ink">{result.actionTip}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6 text-center py-4">
                  <Quote className="w-10 h-10 text-primary/50 mx-auto" />
                  <h3 className="text-2xl sm:text-3xl font-black festive-gradient-text">{result.title}</h3>
                  <p className="text-base sm:text-lg text-ink leading-relaxed italic max-w-xl mx-auto">
                    &ldquo;{result.quote}&rdquo;
                  </p>

                  <div className="space-y-2 max-w-md mx-auto text-left pt-2">
                    {result.wishes?.map((wish: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-xs sm:text-sm text-ink-secondary">
                        <Sparkles className="w-4 h-4 text-gold shrink-0" />
                        <span>{wish}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs font-bold text-primary uppercase tracking-widest pt-4">
                    {result.signature || "Happy New Year!"}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card rounded-card p-12 text-center border border-hairline space-y-4">
              <BrainCircuit className="w-16 h-16 text-primary/40 mx-auto" />
              <h3 className="text-xl font-bold text-ink">Your AI Blueprint Appears Here</h3>
              <p className="text-xs text-ink-muted max-w-sm mx-auto">
                Fill out the prompt on the left to generate your custom AI plan or festive card in seconds.
              </p>
            </div>
          )}

          {/* Community Public Resolutions Feed */}
          {publicFeed.length > 0 && (
            <div className="glass-card rounded-card p-6 border border-hairline space-y-4">
              <h4 className="text-sm font-bold text-ink flex items-center gap-2">
                <Flame className="w-4 h-4 text-primary" />
                <span>Community New Year Aspirations</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {publicFeed.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-white/[0.03] border border-hairline space-y-1">
                    <span className="text-[10px] text-gold font-bold uppercase">{item.category}</span>
                    <h5 className="text-xs font-bold text-ink line-clamp-1">{item.goal}</h5>
                    <p className="text-[11px] text-ink-muted line-clamp-2 italic">{item.motivationalQuote}</p>
                    <p className="text-[10px] text-primary font-medium pt-1">— {item.authorName}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
