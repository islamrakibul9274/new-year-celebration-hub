"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useCart } from "@/components/providers/CartProvider";
import { Eye, ShoppingCart, Check } from "lucide-react";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface PortfolioItem {
  id: number;
  name: string;
  category: string;
  img: string;
  price: number;
  discount: string;
}

const portfolioItems: PortfolioItem[] = [
  { id: 1, name: "Sparkling Fireworks Kit", category: "Fireworks", img: "/images/Rectangle 3.webp", price: 49.99, discount: "30% OFF" },
  { id: 2, name: "Gourmet Party Hamper", category: "Gift Baskets", img: "/images/Rectangle 4.webp", price: 79.99, discount: "50% OFF" },
  { id: 3, name: "Midnight Champagne Set", category: "Drinks", img: "/images/Rectangle 5.webp", price: 65.0, discount: "40% OFF" },
  { id: 4, name: "Festive Neon Decor Pack", category: "Decor", img: "/images/Rectangle 6.webp", price: 34.99, discount: "25% OFF" },
  { id: 5, name: "Luxury Celebration Box", category: "Gift Baskets", img: "/images/Rectangle 7.webp", price: 89.99, discount: "45% OFF" },
  { id: 6, name: "Gold Confetti Cannon", category: "Fireworks", img: "/images/Rectangle 8.webp", price: 29.99, discount: "20% OFF" },
];

export default function GiftPortfolio() {
  const { addToCart, items } = useCart();
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  const filteredItems = activeFilter === "All"
    ? portfolioItems
    : portfolioItems.filter((item) => item.category === activeFilter);

  useEscapeKey(Boolean(selectedItem), () => setSelectedItem(null));

  return (
    <section className="section">
      <div className="gutter">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">THE BEST GIFTS</p>
          <h2 className="text-3xl sm:text-5xl font-black text-ink">Our Awesome Portfolio</h2>
          <p className="text-sm text-ink-muted">
            Discover handpicked festive treasures designed to delight friends, family, and
            celebration guests.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12" role="group" aria-label="Filter gifts by category">
          {["All", "Gift Baskets", "Fireworks", "Decor", "Drinks"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              aria-pressed={activeFilter === cat}
              className={`px-5 py-2 rounded-full text-xs font-semibold transition-colors duration-150 ${
                activeFilter === cat
                  ? "bg-gradient-to-r from-primary to-gold text-white shadow-md"
                  : "bg-white/[0.06] text-ink-secondary hover:bg-white/10 hover:text-ink"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Portfolio Gallery */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const inCart = items.some((i) => i.id === item.id);
            return (
              <div
                key={item.id}
                className="group relative rounded-card glass-card overflow-hidden border border-hairline hover:border-primary/40 transition-colors duration-200 flex flex-col"
              >
                {/* Image Container */}
                <div className="relative h-64 overflow-hidden bg-black/40">
                  <Image
                    src={item.img}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                    {item.discount}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-canvas via-transparent to-transparent opacity-60" aria-hidden="true" />

                  {/* Hover / focus Quick Actions */}
                  <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 bg-black/40 backdrop-blur-xs">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedItem(item)}
                      aria-label={`Quick preview of ${item.name}`}
                      className="!p-3 !rounded-full"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => addToCart(item)}
                      aria-label={`Add ${item.name} to bag`}
                      className="!p-3 !rounded-full"
                    >
                      {inCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 flex items-center justify-between mt-auto">
                  <div>
                    <span className="text-[10px] text-gold font-bold uppercase tracking-wider">
                      {item.category}
                    </span>
                    <h4 className="text-base font-bold text-ink group-hover:text-primary transition-colors duration-150">
                      {item.name}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-ink font-mono">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Item Modal Preview */}
      <Modal
        open={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.name}
        className="max-w-lg w-full overflow-hidden"
      >
        {selectedItem && (
          <div className="p-6 pt-2 space-y-4">
            <div className="h-56 bg-black/60 relative rounded-2xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedItem.img}
                alt={selectedItem.name}
                loading="lazy"
                width={640}
                height={360}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gold font-bold uppercase">{selectedItem.category}</span>
              <span className="text-xl font-black text-primary font-mono">
                ${selectedItem.price.toFixed(2)}
              </span>
            </div>
            <p className="text-sm text-ink-secondary leading-relaxed">
              Premium quality holiday celebration essential. Crafted with high-grade components to
              elevate your New Year party experience.
            </p>
            <Button
              fullWidth
              onClick={() => {
                addToCart(selectedItem);
                setSelectedItem(null);
              }}
            >
              Add To Holiday Bag
            </Button>
          </div>
        )}
      </Modal>
    </section>
  );
}
