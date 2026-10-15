"use client";

import React, { useState } from "react";
import { useCart } from "@/components/providers/CartProvider";
import {
  ShoppingCart,
  X,
  Trash2,
  Plus,
  Minus,
  Sparkles,
  Tag,
  ArrowRight,
  CheckCircle2,
  Gift,
} from "lucide-react";
import { triggerFestiveConfetti } from "@/components/effects/ConfettiTrigger";
import { COUPONS } from "@/lib/coupons";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Card";

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQty,
    clearCart,
    subtotal,
    discountAmount,
    total,
    appliedCoupon,
    couponCode,
    applyCoupon,
  } = useCart();

  const [inputCode, setInputCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [orderError, setOrderError] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<{ orderNumber: string; total: number } | null>(null);

  const closeDrawer = () => {
    setIsCartOpen(false);
    setPlacedOrder(null);
    setOrderError("");
    setCouponError("");
    setConfirmOpen(false);
  };

  const requestCheckout = () => {
    setOrderError("");
    setConfirmOpen(true);
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    const success = applyCoupon(inputCode);
    if (!success) {
      setCouponError(`Invalid promo code. Try ${COUPONS.map((c) => c.code).join(" or ")}`);
    } else {
      setInputCode("");
    }
  };

  const handleCheckout = async () => {
    setOrderError("");
    setIsCheckingOut(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, couponCode: appliedCoupon ? couponCode : "" }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.orderNumber) {
        setPlacedOrder({ orderNumber: data.orderNumber, total: data.total });
        clearCart();
        triggerFestiveConfetti(0.5);
      } else {
        setOrderError(data.error || "Unable to place your order. Please try again.");
      }
    } catch {
      setOrderError("Network error. Please check your connection and try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!isCartOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeDrawer();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        className="w-full max-w-md bg-canvas h-full p-6 flex flex-col justify-between border-l border-hairline-strong shadow-2xl relative animate-in slide-in-from-right duration-300"
      >
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-hairline">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-gold flex items-center justify-center text-ink shadow-md shadow-primary/30">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-ink">Your Holiday Bag</h3>
                <p className="text-[10px] text-ink-muted">
                  {items.length} unique item{items.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <button
              onClick={closeDrawer}
              aria-label="Close shopping bag"
              className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/10 text-ink-muted hover:text-ink transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="py-4 space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            {placedOrder ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-success/15 text-success flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-ink">Order Confirmed!</h4>
                <p className="text-xs text-ink-secondary max-w-xs mx-auto leading-relaxed">
                  Your celebration pack is reserved. Keep this order number for your records.
                </p>
                <p className="font-mono text-gold font-bold">{placedOrder.orderNumber}</p>
                <p className="text-sm text-ink font-bold">Total paid: ${placedOrder.total.toFixed(2)}</p>
                <button
                  onClick={closeDrawer}
                  className="px-6 py-2.5 rounded-full bg-primary text-ink font-bold text-xs shadow-lg shadow-primary/30 hover:bg-rose-600 transition"
                >
                  Continue Celebrating
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-14 space-y-3">
                <div className="w-14 h-14 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto text-ink-muted">
                  <Gift className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-ink-secondary">Your bag is empty</h4>
                <p className="text-xs text-ink-muted max-w-xs mx-auto">
                  Explore our Holiday Deals &amp; Awesome Gift Portfolio to add celebration hampers and
                  fireworks!
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04] border border-hairline hover:border-hairline transition"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.img}
                    alt={item.name}
                    width={56}
                    height={56}
                    loading="lazy"
                    decoding="async"
                    className="w-14 h-14 rounded-xl object-cover bg-surface border border-hairline shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-ink truncate">{item.name}</h5>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-black text-primary font-mono">
                        ${(item.price * item.qty).toFixed(2)}
                      </span>
                      {item.discount && (
                        <span className="text-[9px] font-bold text-gold bg-gold/15 px-1.5 py-0.2 rounded">
                          {item.discount}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 bg-white/[0.06] rounded-xl p-1 border border-hairline">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      aria-label={`Decrease quantity of ${item.name}`}
                      className="p-1 rounded-lg hover:bg-white/10 text-ink-secondary hover:text-ink"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-ink font-mono px-1">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      aria-label={`Increase quantity of ${item.name}`}
                      className="p-1 rounded-lg hover:bg-white/10 text-ink-secondary hover:text-ink"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    aria-label={`Remove ${item.name} from bag`}
                    className="p-1.5 rounded-lg text-ink-muted hover:text-primary hover:bg-primary/10 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {items.length > 0 && (
          <div className="border-t border-hairline pt-4 space-y-3">
            <form onSubmit={handleApplyCoupon} className="space-y-1">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    placeholder={`Coupon code (${COUPONS[0].code})`}
                    aria-label="Coupon code"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white/[0.06] border border-hairline text-ink placeholder:text-ink-muted uppercase focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60 focus:border-rose-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/15 text-ink text-xs font-bold transition"
                >
                  Apply
                </button>
              </div>
              {couponError && <p className="text-[10px] text-primary font-semibold">{couponError}</p>}
              {appliedCoupon && (
                <p className="text-[10px] text-success font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Promo code {couponCode} applied successfully!</span>
                </p>
              )}
            </form>

            <div className="space-y-1.5 text-xs text-ink-secondary pt-2 border-t border-hairline">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono font-bold">${subtotal.toFixed(2)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-success">
                  <span>Holiday Promo Discount</span>
                  <span className="font-mono font-bold">-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Festive Express Delivery</span>
                <span className="text-success font-bold uppercase text-[10px]">FREE</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-ink pt-2 border-t border-hairline">
                <span>Grand Total</span>
                <span className="text-gold font-mono text-lg">${total.toFixed(2)}</span>
              </div>
            </div>

            {orderError && (
              <p role="alert" className="text-[11px] text-danger font-semibold">
                {orderError}
              </p>
            )}

            <Button onClick={requestCheckout} fullWidth>
              <span>Complete Holiday Order</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>
        )}
      </div>

      {/* Order confirmation */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm your order"
        className="max-w-sm w-full"
      >
        <div className="px-6 pb-6 space-y-4">
          <p className="text-sm text-ink-secondary">
            You&apos;re about to order{" "}
            <strong className="text-ink">
              {items.length} item{items.length === 1 ? "" : "s"}
            </strong>{" "}
            for a total of <strong className="text-gold font-mono">${total.toFixed(2)}</strong>.
            {appliedCoupon && ` Promo code ${couponCode} is applied.`}
          </p>
          {orderError && <Alert tone="error">{orderError}</Alert>}
          <div className="flex gap-2">
            <Button variant="secondary" fullWidth onClick={() => setConfirmOpen(false)}>
              Keep shopping
            </Button>
            <Button fullWidth loading={isCheckingOut} onClick={handleCheckout}>
              {isCheckingOut ? "Placing..." : "Place order"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
