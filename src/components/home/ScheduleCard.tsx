"use client";

import React, { useState } from "react";
import { MapPin, Calendar, Clock, CheckCircle2 } from "lucide-react";
import { triggerFestiveConfetti } from "@/components/effects/ConfettiTrigger";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";

export default function ScheduleCard() {
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [guestsCount, setGuestsCount] = useState(1);
  const [passType, setPassType] = useState("standard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successTicket, setSuccessTicket] = useState<string | null>(null);

  const closeModal = () => {
    setModalOpen(false);
    setSuccessTicket(null);
    setError("");
  };

  const handleSubmitRSVP = async (e: React.FormEvent) => {
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
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSuccessTicket(data.ticketCode);
        triggerFestiveConfetti(0.4);
        toast("RSVP confirmed — your digital pass is on its way!", "success");
      } else {
        setError(data.error || "Unable to confirm your RSVP. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-12 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-white/15 relative overflow-hidden">
          {/* Top Banner Gradient Strip */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-400 to-rose-500" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            {/* Place */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.04] border border-white/5">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400 font-bold">Place</p>
                <h4 className="text-sm sm:text-base font-bold text-white">New Park Hotel</h4>
                <p className="text-xs text-gray-400">Beach Garden Florida</p>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.04] border border-white/5">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400 font-bold">Date</p>
                <h4 className="text-sm sm:text-base font-bold text-white">31 December Night</h4>
                <p className="text-xs text-gray-400">Grand Gala 2026</p>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.04] border border-white/5">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400 font-bold">Time</p>
                <h4 className="text-sm sm:text-base font-bold text-white">Evening 7:30 PM</h4>
                <p className="text-xs text-gray-400">to 12:30 AM Midnight</p>
              </div>
            </div>

            {/* Action CTA */}
            <div className="flex justify-center md:justify-end">
              <Button onClick={() => setModalOpen(true)} className="w-full md:w-auto">
                JOIN NOW
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* RSVP Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title="Midnight Party RSVP"
        className="max-w-md w-full"
      >
        {successTicket ? (
          <div className="text-center space-y-4 py-4 px-6">
            <div className="w-16 h-16 rounded-full bg-success/20 text-success flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
            </div>
            <h3 className="text-2xl font-bold text-ink">You are Confirmed!</h3>
            <p className="text-sm text-ink-secondary">
              Your reservation is secured. A digital pass has been emailed to{" "}
              <span className="text-gold font-semibold">{email}</span>.
            </p>
            <div className="p-4 rounded-xl bg-white/[0.06] border border-gold/30 font-mono text-gold text-lg font-bold">
              {successTicket}
            </div>
            <Button fullWidth onClick={closeModal}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmitRSVP} className="space-y-4 px-6 pb-6" noValidate>
            <p className="text-xs text-ink-muted text-center">
              Reserve your digital ticket for New Park Hotel
            </p>

            {error && <Alert tone="error">{error}</Alert>}

            <div>
              <label htmlFor="rsvp-name" className="label">
                Full Name
              </label>
              <Input
                id="rsvp-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="rsvp-email" className="label">
                Email Address
              </label>
              <Input
                id="rsvp-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="rsvp-guests" className="label">
                  Guests
                </label>
                <Select
                  id="rsvp-guests"
                  name="guestsCount"
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(Number(e.target.value))}
                >
                  <option value={1}>1 Guest</option>
                  <option value={2}>2 Guests</option>
                  <option value={4}>4 Guests</option>
                  <option value={6}>6 (Table)</option>
                </Select>
              </div>

              <div>
                <label htmlFor="rsvp-pass" className="label">
                  Pass Tier
                </label>
                <Select
                  id="rsvp-pass"
                  name="passType"
                  value={passType}
                  onChange={(e) => setPassType(e.target.value)}
                >
                  <option value="standard">Standard Pass</option>
                  <option value="vip_silver">VIP Silver</option>
                  <option value="diamond_all_access">Diamond VIP</option>
                </Select>
              </div>
            </div>

            <Button type="submit" loading={loading} fullWidth>
              Confirm My RSVP
            </Button>
          </form>
        )}
      </Modal>
    </section>
  );
}
