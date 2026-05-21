"use client";

import React from "react";
import Link from "next/link";
import { Product } from "../../types";
import { useStore } from "../../store";
import { MaisonImage } from "../ui/MaisonImage";
import { Eye, Plus } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useStore();

  const formattedPrice = `RS ${product.price.toLocaleString()}`;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group cursor-pointer flex flex-col w-full bg-white border-0 p-0 overflow-hidden relative text-center select-none"
    >
      {/* Product Image Panel with 2:3 Portrait Aspect Ratio */}
      <div className="w-full relative aspect-[2/3] overflow-hidden bg-neutral-50 mb-4 rounded-none">
        <MaisonImage
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center transform scale-100 transition-transform duration-700 ease-out group-hover:scale-102"
        />

        {/* Dynamic Premium Hover Overlay carrying two interactive buttons */}
        <div className="absolute inset-0 bg-neutral-900/10 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center space-x-3.5 z-10">
          {/* Eye Icon Button for View navigation */}
          <div
            className="w-10 h-10 rounded-full bg-white text-neutral-800 shadow-sm flex items-center justify-center hover:bg-neutral-950 hover:text-white transition-all active:scale-95 cursor-pointer"
            title="View Details"
          >
            <Eye className="h-4.5 w-4.5" />
          </div>

          {/* Plus Icon Button for Quick Cart injection */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(product, 1);
            }}
            className="w-10 h-10 rounded-full bg-white text-neutral-800 shadow-sm flex items-center justify-center hover:bg-neutral-950 hover:text-white transition-all active:scale-95 cursor-pointer"
            title="Add to Shopping Bag"
          >
            <Plus className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Info Panel Centered Underneath */}
      <div className="w-full flex flex-col items-center mt-1">
        <h3 className="font-sans text-[10px] sm:text-[11px] tracking-[0.22em] text-neutral-900 font-medium uppercase text-center line-clamp-1 leading-relaxed">
          {product.name}
        </h3>
        
        <p className="font-sans text-[9px] sm:text-[10px] tracking-[0.15em] text-stone-500 font-light text-center mt-1 uppercase">
          {formattedPrice}
        </p>
      </div>
    </Link>
  );
};

