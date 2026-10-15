"use client";

import React, { useState, useMemo } from "react";
import { useCart } from "@/components/providers/CartProvider";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Card";
import { Gift, ShoppingCart, Search, Flame, Check, SlidersHorizontal } from "lucide-react";
import { COUPONS } from "@/lib/coupons";
import Image from "next/image";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  img: string;
  discount: string;
  desc: string;
  rating: number;
}

const allProducts: Product[] = [
  { id: 101, name: "65% OFF Deluxe Party Hamper", category: "Baskets", price: 69.99, originalPrice: 199.99, img: "/images/New Year Photo.webp", discount: "65% OFF", desc: "Champagne, truffles, gourmet treats, and festive crackers.", rating: 4.9 },
  { id: 102, name: "Midnight Sparkler & Fireworks Set", category: "Fireworks", price: 39.99, originalPrice: 79.99, img: "/images/Rectangle 3.webp", discount: "50% OFF", desc: "Long-duration golden sparklers and safe celebration fountains.", rating: 4.7 },
  { id: 103, name: "Gourmet Celebration Keepsake Box", category: "Baskets", price: 49.99, originalPrice: 99.99, img: "/images/Rectangle 4.webp", discount: "50% OFF", desc: "Handcrafted wooden keepsake chest packed with festive sweets.", rating: 4.6 },
  { id: 104, name: "Luxury Champagne Twin Pack", category: "Drinks", price: 54.99, originalPrice: 95.0, img: "/images/Rectangle 5.webp", discount: "42% OFF", desc: "Two bottles of vintage French sparkling wine for midnight cheers.", rating: 4.8 },
  { id: 105, name: "Neon LED Party Ambience Pack", category: "Decor", price: 29.99, originalPrice: 59.99, img: "/images/Rectangle 6.webp", discount: "50% OFF", desc: "Glowing 2026 signs, LED balloons, and fairy garlands.", rating: 4.5 },
  { id: 106, name: "Royal Grand Gala Hamper", category: "Baskets", price: 89.99, originalPrice: 160.0, img: "/images/Rectangle 7.webp", discount: "45% OFF", desc: "The supreme holiday package for luxury gifting.", rating: 5.0 },
  { id: 107, name: "Confetti Poppers Cannon (12-pack)", category: "Fireworks", price: 24.99, originalPrice: 45.0, img: "/images/Rectangle 8.webp", discount: "45% OFF", desc: "Biodegradable metallic gold & ruby confetti poppers.", rating: 4.4 },
  { id: 108, name: "Holiday Chic Party Wear Set", category: "Fashion", price: 74.99, originalPrice: 149.99, img: "/images/Rectangle 1.webp", discount: "50% OFF", desc: "Exclusive holiday collection dresses and party outfits.", rating: 4.6 },
];

const CATEGORIES = ["All", "Baskets", "Fireworks", "Drinks", "Decor", "Fashion"];
type SortKey = "featured" | "price-asc" | "price-desc" | "discount";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "price-asc", label: "Price: Low to High" },
  { key: "price-desc", label: "Price: High to Low" },
  { key: "discount", label: "Biggest Discount" },
];

export default function DealsPage() {
  const { addToCart, items, totalCount, setIsCartOpen } = useCart();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sort, setSort] = useState<SortKey>("featured");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = allProducts.filter((p) => {
      const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
      const matchesSearch =
        !query || p.name.toLowerCase().includes(query) || p.desc.toLowerCase().includes(query);
      return matchesCat && matchesSearch;
    });

    switch (sort) {
      case "price-asc":
        return [...result].sort((a, b) => a.price - b.price);
      case "price-desc":
        return [...result].sort((a, b) => b.price - a.price);
      case "discount":
        return [...result].sort(
          (a, b) => b.originalPrice - b.price - (a.originalPrice - a.price),
        );
      default:
        return [...result].sort((a, b) => b.rating - a.rating);
    }
  }, [search, selectedCategory, sort]);

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("All");
    setSort("featured");
  };

  return (
    <div className="pt-32 pb-24 gutter">
      {/* Header Promo Banner */}
      <div className="relative overflow-hidden rounded-card glass-card border border-primary/30 p-8 sm:p-12 mb-10 festive-mesh-bg">
        <div className="max-w-2xl space-y-4">
          <div className="badge badge-primary">
            <Flame className="w-3.5 h-3.5" aria-hidden="true" />
            Holiday Flash Sale Active
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-ink">
            Exclusive <span className="festive-gradient-text">65% OFF Deals</span>
          </h1>
          <p className="text-ink-secondary text-sm sm:text-base">
            Celebrate the season with hand-curated gift baskets, fireworks kits, party decorations,
            and festive essentials.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <span className="text-xs text-ink-muted">Extra discount codes:</span>
            {COUPONS.map((c) => (
              <span
                key={c.code}
                className="font-mono text-gold bg-white/[0.08] px-3 py-1 rounded-lg border border-gold/30 text-xs font-bold"
              >
                {c.code}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by category">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              aria-pressed={selectedCategory === cat}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors duration-150 ${
                selectedCategory === cat
                  ? "bg-gradient-to-r from-primary to-gold text-white shadow-md"
                  : "bg-white/[0.06] text-ink-secondary hover:bg-white/10 hover:text-ink"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search gifts & deals..."
              aria-label="Search gifts and deals"
              className="input pl-9 rounded-full"
            />
          </div>

          <div className="relative">
            <SlidersHorizontal className="w-3.5 h-3.5 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Sort products"
              className="input pl-8 pr-8 rounded-full appearance-none cursor-pointer text-xs"
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <Button onClick={() => setIsCartOpen(true)} size="sm" className="shrink-0">
            <ShoppingCart className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Bag</span> ({totalCount})
            <span className="sr-only"> items</span>
          </Button>
        </div>
      </div>

      {/* Result count */}
      <p className="text-xs text-ink-muted mb-4" role="status">
        {filtered.length} {filtered.length === 1 ? "gift" : "gifts"}
        {selectedCategory !== "All" && ` in ${selectedCategory}`}
        {search && ` matching “${search}”`}
      </p>

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-card border border-hairline">
          <EmptyState
            icon={<Gift className="w-6 h-6" />}
            title="No gifts match your search"
            description="Try a different keyword or browse all categories to find your celebration essentials."
            action={
              <Button variant="secondary" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((item) => {
            const inCart = items.some((i) => i.id === item.id);
            return (
              <div
                key={item.id}
                className="glass-card rounded-card overflow-hidden border border-hairline hover:border-primary/40 transition-colors duration-200 flex flex-col group"
              >
                <div className="h-52 bg-black/40 relative overflow-hidden">
                  <Image
                    src={item.img}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                    {item.discount}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-gold uppercase tracking-wider">
                      {item.category}
                    </span>
                    <h3 className="text-base font-bold text-ink group-hover:text-primary transition-colors duration-150 leading-snug">
                      {item.name}
                    </h3>
                    <p className="text-xs text-ink-muted mt-1 line-clamp-2">{item.desc}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-hairline">
                    <div>
                      <span className="text-base font-black text-ink font-mono">
                        ${item.price.toFixed(2)}
                      </span>
                      {item.originalPrice && (
                        <span className="text-xs text-ink-muted line-through ml-2 font-mono">
                          ${item.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <Button
                      variant={inCart ? "secondary" : "primary"}
                      size="sm"
                      onClick={() => addToCart(item)}
                      aria-label={`Add ${item.name} to bag`}
                      className="!px-3"
                    >
                      {inCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
