"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { triggerFestiveConfetti } from "@/components/effects/ConfettiTrigger";
import { couponRate, findCoupon } from "@/lib/coupons";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  img: string;
  discount?: string;
  qty: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: {
    id: number;
    title?: string;
    name?: string;
    price: number | string;
    originalPrice?: number;
    img: string;
    discount?: string;
  }) => void;
  removeFromCart: (id: number) => void;
  updateQty: (id: number, delta: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalCount: number;
  subtotal: number;
  discountAmount: number;
  total: number;
  couponCode: string;
  appliedCoupon: boolean;
  applyCoupon: (code: string) => boolean;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("nye_cart");
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {}
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("nye_cart", JSON.stringify(items));
    } catch {}
  }, [items]);

  const addToCart = (product: {
    id: number;
    title?: string;
    name?: string;
    price: number | string;
    originalPrice?: number;
    img: string;
    discount?: string;
  }) => {
    const rawPrice = typeof product.price === "string" 
      ? parseFloat(product.price.replace(/[^0-9.]/g, "")) 
      : product.price;

    const itemName = product.name || product.title || "Holiday Item";

    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: itemName,
          price: isNaN(rawPrice) ? 29.99 : rawPrice,
          originalPrice: product.originalPrice,
          img: product.img,
          discount: product.discount,
          qty: 1,
        },
      ];
    });

    triggerFestiveConfetti(0.3);
    setIsCartOpen(true);
  };

  const removeFromCart = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQty = (id: number, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(false);
    setCouponCode("");
  };

  const applyCoupon = (code: string) => {
    const coupon = findCoupon(code);
    if (!coupon) return false;
    setAppliedCoupon(true);
    setCouponCode(coupon.code);
    triggerFestiveConfetti(0.4);
    return true;
  };

  const totalCount = items.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = Math.round(items.reduce((sum, item) => sum + item.price * item.qty, 0) * 100) / 100;
  const discountRate = appliedCoupon ? couponRate(couponCode) : 0;
  const discountAmount = Math.round(subtotal * discountRate * 100) / 100;
  const total = Math.round(Math.max(0, subtotal - discountAmount) * 100) / 100;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        totalCount,
        subtotal,
        discountAmount,
        total,
        couponCode,
        appliedCoupon,
        applyCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
