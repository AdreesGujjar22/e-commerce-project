"use client";

import React from "react";
import { Product } from "../../types";
import { useStore } from "../../store";
import { Plus, Eye, Sparkles } from "lucide-react";
import { Badge } from "../ui/Badge";
import { MaisonImage } from "../ui/MaisonImage";

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { setActiveProduct, addToCart } = useStore();

  return (
    <div
      onClick={() => setActiveProduct(product)}
      className="group cursor-pointer flex flex-col items-start bg-white border border-gold-150 rounded-2xl p-4.5 overflow-hidden transition-all duration-300 hover:shadow-card hover:-translate-y-1 hover:border-gold-300 relative text-left"
    >
      {/* Category Float Indicator Accent */}
      <span className="absolute top-7 left-7 z-10 bg-white/90 backdrop-blur-subtle font-display text-[8px] font-black uppercase tracking-widest text-neutral-800 px-2.5 py-1 rounded shadow-sm border border-gold-100">
        {product.category}
      </span>

      {/* Product Image Frame */}
      <div className="w-full relative aspect-[4/5] overflow-hidden rounded-xl bg-neutral-50 mb-4.5">
        <MaisonImage
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />
        {/* Quick Interaction Overlay */}
        <div className="absolute inset-0 bg-neutral-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveProduct(product);
            }}
            className="w-10 h-10 rounded-full bg-white text-neutral-900 shadow-md flex items-center justify-center hover:bg-gold-500 hover:text-neutral-950 transition-all active:scale-90"
            title="Inquire details"
          >
            <Eye className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product, 1);
            }}
            className="w-10 h-10 rounded-full bg-neutral-900 text-[#faf9f6]/95 shadow-md flex items-center justify-center hover:bg-gold-500 hover:text-neutral-950 transition-all active:scale-90"
            title="Add to shopping bag"
          >
            <Plus className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Info Panel block */}
      <div className="w-full flex flex-col mt-0.5">
        <span className="font-display text-[9px] uppercase tracking-widest text-gold-600 font-semibold mb-1">
          {product.designer}
        </span>
        <h3 className="font-display text-sm tracking-tight text-neutral-950 font-bold leading-snug line-clamp-1">
          {product.name}
        </h3>
        <p className="font-sans text-neutral-400 text-xs leading-normal line-clamp-2 mt-1.5 leading-relaxed">
          {product.description}
        </p>

        {/* Pricing Segment */}
        <div className="flex items-center justify-between w-full mt-5 pt-3 border-t border-gold-100/60">
          <span className="font-serif italic text-base font-medium text-neutral-900">
            ${product.price.toLocaleString()}
          </span>
          {product.stock <= 3 && product.stock > 0 ? (
            <span className="text-[9px] text-red-500 font-display uppercase tracking-widest font-black">
              only {product.stock} left
            </span>
          ) : product.stock === 0 ? (
            <span className="text-[9px] text-neutral-400 font-display uppercase tracking-widest font-bold">
              Archived
            </span>
          ) : (
            <span className="text-[9px] text-teal-600 font-display uppercase tracking-bold tracking-widest font-semibold flex items-center">
              <Sparkles className="h-2.5 w-2.5 mr-1" /> Ready to dispatch
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
