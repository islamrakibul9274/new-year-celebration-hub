"use client";

import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Sparkles, 
  PartyPopper, 
  CheckCircle2, 
  Music, 
  Flame, 
  Users, 
  Utensils 
} from "lucide-react";
import { triggerFestiveConfetti } from "@/components/effects/ConfettiTrigger";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/providers/AuthProvider";
import Link from "next/link";
import { getPlan, planAllowsPassType } from "@/lib/plans";
import type { Attendee, ConfirmedTicket } from "@/types";

export default function EventsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const plan = getPlan(user?.plan).id;
  const canUse = (tier: string) => planAllowsPassType(user?.plan, tier);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [guestsCount, setGuestsCount] = useState(1);
  const [passType, setPassType] = useState("standard");

  // Snap to an entitled tier when the membership changes
  useEffect(() => {
    setPassType((current) => (planAllowsPassType(user?.plan, current) ? current : "standard"));
  }, [user?.plan]);
  const [celebrationWish, setCelebrationWish] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmedTicket, setConfirmedTicket] = useState<ConfirmedTicket | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [totalCount, setTotalCount] = useState(250);

  useEffect(() => {
    fetch("/api/rsvp")
      .then((res) => res.json())
      .then((data) => {
        if (data.latestGuests) setAttendees(data.latestGuests);
        if (data.totalCount) setTotalCount(data.totalCount);
      })
      .catch(() => {});
  }, []);

  const handleRSVP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: name,
          guestEmail: email,
          guestsCount,
          passType,
          celebrationWish,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setConfirmedTicket({
          code: data.ticketCode,
          name,
          email,
          passType: data.passType || passType,
          guestsCount,
          downgraded: data.downgraded,
        });
        setTotalCount((prev) => prev + Number(guestsCount));
        triggerFestiveConfetti(0.5);
        toast("Gala ticket confirmed! Check your email for the barcode pass.", "success");
      } else {
        setError(data.error || "Unable to confirm your ticket. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const itinerary = [
    { time: "07:30 PM", title: "Red Carpet & Welcome Drinks", desc: "Acoustic lounge music, champagne welcome wall, and photo booths.", icon: Utensils },
    { time: "09:00 PM", title: "Live Concert & Gourmet Gala", desc: "International band performance and luxury holiday multi-course dining.", icon: Music },
    { time: "11:30 PM", title: "Grand Midnight Countdown", desc: "Synchronized global countdown with 10,000+ balloon drop and champagne toast.", icon: PartyPopper },
    { time: "12:00 AM", title: "360° Rooftop Fireworks Spectacle", desc: "Dazzling pyro-musical fireworks over Beach Garden skyline.", icon: Flame },
    { time: "12:30 AM", title: "Afterhours Electronic DJ Set", desc: "VIP lounge party dancing until late morning.", icon: Sparkles },
  ];

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 border border-rose-500/30 text-primary text-xs font-bold uppercase tracking-wider">
          <Calendar className="w-4 h-4" />
          <span>Official Event Itinerary</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-ink">
          Midnight Gala & <br />
          <span className="festive-gradient-text">Party Schedule</span>
        </h1>
        <p className="text-ink-secondary text-base sm:text-lg">
          Join hundreds of celebrators at New Park Hotel. Experience unforgettable music, culinary delights, and the grandest midnight fireworks in Florida.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Itinerary & Schedule (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <h2 className="text-2xl font-bold text-ink flex items-center gap-2">
            <Clock className="w-5 h-5 text-gold" />
            <span>Event Timeline</span>
          </h2>

          <div className="space-y-4">
            {itinerary.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="glass-card rounded-2xl p-5 border border-hairline flex items-start gap-4 hover:border-rose-500/40 transition duration-300"
                >
                  <div className="p-3 rounded-xl bg-gradient-to-tr from-primary/20 to-gold/20 text-primary border border-rose-500/30 shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <h4 className="text-base font-bold text-ink">{item.title}</h4>
                      <span className="text-xs font-bold text-gold bg-gold/10 px-2.5 py-1 rounded-full border border-amber-500/20 font-mono">
                        {item.time}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Venue Details */}
          <div className="glass-card rounded-2xl p-6 border border-hairline mt-8 space-y-3">
            <h3 className="text-lg font-bold text-ink flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <span>Venue Information</span>
            </h3>
            <p className="text-sm text-ink-secondary">
              <strong className="text-ink">New Park Hotel Ballroom & Rooftop Deck</strong><br />
              44, Big Building Roosevelt Street, Beach Garden Florida 33410
            </p>
            <div className="flex flex-wrap gap-3 pt-2 text-xs text-ink-muted">
              <span className="bg-white/[0.05] px-3 py-1.5 rounded-lg border border-hairline">Valet Parking Available</span>
              <span className="bg-white/[0.05] px-3 py-1.5 rounded-lg border border-hairline">Black Tie / Festive Chic</span>
              <span className="bg-white/[0.05] px-3 py-1.5 rounded-lg border border-hairline">Age 21+ Required</span>
            </div>
          </div>
        </div>

        {/* Right RSVP Reservation Card (5 Cols) */}
        <div className="lg:col-span-5">
          <div className="glass-card rounded-card p-6 sm:p-8 border border-hairline-strong sticky top-28 space-y-6">
            {confirmedTicket ? (
              <div className="space-y-6 text-center">
                <div className="w-16 h-16 rounded-full bg-success/15 text-success flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-extrabold text-ink">Your Pass is Booked!</h3>
                <p className="text-xs text-ink-secondary">
                  We sent your digital barcode pass and itinerary to <strong className="text-ink">{confirmedTicket.email}</strong>.
                </p>

                {/* Digital Pass Mockup */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-950/40 via-[#181c2e] to-amber-950/30 border border-amber-400/40 text-left space-y-3 relative overflow-hidden">
                  <div className="flex justify-between items-center border-b border-hairline pb-2">
                    <span className="text-[10px] uppercase tracking-widest text-gold font-bold">New Year Midnight Gala</span>
                    <span className="text-xs font-mono font-bold text-primary uppercase">{confirmedTicket.passType}</span>
                  </div>
                  <div>
                    <p className="text-xs text-ink-muted">Guest Name</p>
                    <p className="text-sm font-bold text-ink">{confirmedTicket.name}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-ink-muted">Guests</p>
                      <p className="text-sm font-bold text-ink">{confirmedTicket.guestsCount} Person(s)</p>
                    </div>
                    <div>
                      <p className="text-xs text-ink-muted">Pass Code</p>
                      <p className="text-sm font-mono font-bold text-gold">{confirmedTicket.code}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setConfirmedTicket(null)}
                  className="w-full py-3 rounded-xl bg-white/[0.08] hover:bg-white/15 text-ink font-semibold text-xs transition"
                >
                  Book Another Pass
                </button>
              </div>
            ) : (
              <form onSubmit={handleRSVP} className="space-y-4" noValidate>
                <div className="border-b border-hairline pb-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xl font-bold text-ink">Reserve Gala Spot</h3>
                    <span className="text-xs text-primary font-bold flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {totalCount} Confirmed
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted">Instant digital pass confirmation</p>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="p-3 rounded-xl bg-primary/15 border border-rose-500/40 text-primary text-xs font-semibold"
                  >
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="rsvp-name" className="text-xs font-semibold text-ink-secondary block mb-1">Your Full Name</label>
                  <input
                    id="rsvp-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-hairline text-ink placeholder:text-ink-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60 focus:border-rose-500 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="rsvp-email" className="text-xs font-semibold text-ink-secondary block mb-1">Email for Digital Ticket</label>
                  <input
                    id="rsvp-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-hairline text-ink placeholder:text-ink-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60 focus:border-rose-500 text-xs sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="rsvp-guests" className="text-xs font-semibold text-ink-secondary block mb-1">Party Size</label>
                    <select
                      id="rsvp-guests"
                      value={guestsCount}
                      onChange={(e) => setGuestsCount(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl bg-surface border border-hairline text-ink text-xs sm:text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60 focus:border-rose-500"
                    >
                      <option value={1}>1 Person</option>
                      <option value={2}>2 (Couple)</option>
                      <option value={4}>4 (Group)</option>
                      <option value={6}>6 (VIP Booth)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="rsvp-pass" className="text-xs font-semibold text-ink-secondary block mb-1">Access Level</label>
                    <select
                      id="rsvp-pass"
                      value={passType}
                      onChange={(e) => setPassType(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-surface border border-hairline text-ink text-xs sm:text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60 focus:border-rose-500"
                    >
                      <option value="standard">Standard Free</option>
                      <option value="vip_silver" disabled={!canUse("vip_silver")}>
                        {canUse("vip_silver") ? "Silver VIP" : "Silver VIP — requires Silver pass"}
                      </option>
                      <option value="diamond_all_access" disabled={!canUse("diamond_all_access")}>
                        {canUse("diamond_all_access") ? "Diamond Gala" : "Diamond Gala — requires Diamond pass"}
                      </option>
                    </select>
                    {!user && (
                      <p className="text-[10px] text-ink-muted mt-1">
                        <Link href="/signup?redirect=/events" className="text-primary hover:underline font-semibold">
                          Create an account
                        </Link>{" "}
                        or sign in to use your VIP pass tier.
                      </p>
                    )}
                    {user && plan !== "diamond" && (
                      <p className="text-[10px] text-ink-muted mt-1">
                        <Link href="/pricing" className="text-gold hover:underline font-semibold">
                          Upgrade your pass
                        </Link>{" "}
                        to unlock premium VIP tiers.
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="event-wish" className="text-xs font-semibold text-ink-secondary block mb-1">Your 2026 Celebration Wish</label>
                  <input
                    id="event-wish"
                    type="text"
                    value={celebrationWish}
                    onChange={(e) => setCelebrationWish(e.target.value)}
                    placeholder="Wishing health and unstoppable success!"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-hairline text-ink placeholder:text-ink-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60 focus:border-rose-500 text-xs sm:text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-gold text-ink font-bold text-sm shadow-xl shadow-primary/30 hover:opacity-95 transition disabled:opacity-50 mt-2"
                >
                  {loading ? "Generating Ticket..." : "Confirm My Gala Ticket"}
                </button>
              </form>
            )}

            {/* Recent Attendees List */}
            {attendees.length > 0 && (
              <div className="border-t border-hairline pt-4 space-y-2">
                <p className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">Recently Joined</p>
                <div className="flex flex-wrap gap-1.5">
                  {attendees.slice(0, 5).map((guest, i) => (
                    <span key={i} className="text-[11px] bg-white/[0.06] px-2.5 py-1 rounded-full text-ink-secondary border border-hairline">
                      🎉 {guest.guestName}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
