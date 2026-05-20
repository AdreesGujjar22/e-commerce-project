"use client";

import React from "react";
import { Product } from "../../types";
import { useStore } from "../../store";
import { ProductGrid } from "./ProductGrid";
import { Grid, Sparkles, SlidersHorizontal, Tag } from "lucide-react";

interface CollectionsFilterProps {
  products: Product[];
}

export const CollectionsFilter: React.FC<CollectionsFilterProps> = ({ products }) => {
  const {
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    searchQuery,
  } = useStore();

  const categories = [
    { id: "all", label: "All Curations" },
    { id: "apparel", label: "Apparel & Outerwear" },
    { id: "decor", label: "Geologic Decors" },
    { id: "watches", label: "Fine Timekeepers" },
    { id: "fragrances", label: "Prestige Fragrances" },
  ];

  return (
    <div className="flex flex-col space-y-8 w-full">
      {/* Filters and Sorting bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4.5 bg-neutral-50 border border-gold-150 rounded-2xl p-5 text-left">
        
        {/* Categories Tab list */}
        <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`font-display text-[9.5px] uppercase tracking-widest px-4.5 py-2.5 rounded-full border transition-all ${
                selectedCategory === cat.id
                  ? "bg-neutral-950 border-neutral-950 text-white font-bold"
                  : "bg-white border-gold-200 text-neutral-600 hover:border-gold-300"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sort select */}
        <div className="flex items-center space-x-3 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 border-gold-200 pt-3 lg:pt-0">
          <div className="flex items-center space-x-1.5 text-neutral-500 font-display text-[10px] uppercase font-bold tracking-widest">
            <SlidersHorizontal className="h-3.5 w-3.5 text-gold-500" />
            <span>Sort by:</span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-gold-200 rounded-xl px-4 py-2.5 font-display text-[10px] uppercase tracking-wider text-neutral-800 focus:outline-none focus:ring-1 focus:ring-gold-400"
          >
            <option value="default">Release Relevance</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated Patrons Choice</option>
          </select>
        </div>
      </div>

      {/* Active filters feedback info */}
      {(selectedCategory !== "all" || searchQuery) && (
        <div className="flex items-center space-x-2.5 text-xs text-neutral-500 font-sans mt-2">
          <span>Actively showing filters for:</span>
          {selectedCategory !== "all" && (
            <span className="bg-gold-100/60 border border-gold-200 text-gold-900 rounded-full px-3 py-1 text-[10px] uppercase font-display font-medium">
              Category: {selectedCategory}
            </span>
          )}
          {searchQuery && (
            <span className="bg-gold-100/60 border border-gold-200 text-gold-900 rounded-full px-3 py-1 text-[10px] uppercase font-display font-medium">
              Inquiry: "{searchQuery}"
            </span>
          )}
          <button
            onClick={() => {
              setSelectedCategory("all");
            }}
            className="text-neutral-500 hover:text-neutral-950 text-xs font-semibold underline decoration-dashed transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Renders the actual grid listing */}
      <ProductGrid products={products} />
    </div>
  );
};
