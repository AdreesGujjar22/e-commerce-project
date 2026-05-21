"use client";

import React from "react";
import { Product } from "../../types";
import { ProductCard } from "./ProductCard";
import { useStore } from "../../store";
import { Inbox } from "lucide-react";

interface ProductGridProps {
  products: Product[];
  bypassClientFiltering?: boolean;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products, bypassClientFiltering = false }) => {
  const { searchQuery, selectedCategory, sortBy } = useStore();

  // Filter and sort products
  const filteredProducts = bypassClientFiltering
    ? products
    : products
        .filter((product) => {
          const matchSearch =
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.designer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.toLowerCase());

          const matchCategory =
            selectedCategory === "all" || product.category === selectedCategory;

          return matchSearch && matchCategory;
        })
        .sort((a, b) => {
          if (sortBy === "price-low") return a.price - b.price;
          if (sortBy === "price-high") return b.price - a.price;
          if (sortBy === "rating") return b.rating - a.rating;
          return 0; // default order
        });

  if (filteredProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 border border-dashed border-gold-200 rounded-3xl bg-neutral-50/50 w-full max-w-lg mx-auto mt-12 text-center">
        <Inbox className="h-10 w-10 text-neutral-300 stroke-[1.5] mb-4.5" />
        <h4 className="font-display text-xs uppercase tracking-widest text-[#151515] font-black">
          No curations match search query
        </h4>
        <p className="font-sans text-xs text-neutral-400 mt-2 max-w-sm">
          Please adjust your selected filters, categories, or inquiry search key to display Arooj items.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 sm:gap-x-6 lg:gap-x-8 gap-y-12 sm:gap-y-16 w-full">
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
