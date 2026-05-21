"use client";

import React from "react";
import { Product } from "../../types";
import { useStore } from "../../store";
import { ProductImage } from "../ui/ProductImage";

interface ShowcaseSectionProps {
  categories: {
    id: string;
    name: string;
    bannerUrl: string;
  }[];
  products: Product[];
}

export const ShowcaseSection: React.FC<ShowcaseSectionProps> = ({
  categories = [],
  products = [],
}) => {
  const { setActiveProduct } = useStore();

  // Slice first 4 categories from database if available
  const activeCategories = categories.slice(0, 4);

  // Luxury aesthetic fallback categories matching Sana Safinaz / Farasha / Maria B
  const fallbackCategories = [
    {
      id: "formals",
      name: "FORMALS",
      bannerUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&auto=format&fit=crop&q=80",
    },
    {
      id: "summer-essentials",
      name: "SUMMER ESSENTIALS",
      bannerUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200&auto=format&fit=crop&q=80",
    },
    {
      id: "lu-zella-formals",
      name: "LU ZELLA FORMALS",
      bannerUrl: "https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=1200&auto=format&fit=crop&q=80",
    },
    {
      id: "ready-to-wear",
      name: "READY TO WEAR",
      bannerUrl: "https://images.unsplash.com/photo-1608748010899-18f300247112?w=1200&auto=format&fit=crop&q=80",
    },
  ];

  // Merge so we ALWAYS have exactly 4 categories displayed
  const categoriesToShow =
    activeCategories.length >= 4
      ? activeCategories
      : [
          ...activeCategories,
          ...fallbackCategories.slice(activeCategories.length),
        ];

  // Map exactly 4 cards
  const showcaseCards = categoriesToShow.map((cat, idx) => {
    // Find first product of this category
    let associatedProduct = products.find(
      (p) => p.category?.toLowerCase() === cat.name?.toLowerCase() || p.category === cat.id
    );

    // If no direct matching product, bind to any distinct product (1st, 2nd, 3rd, 4th) so shop now modals always open beautifully
    if (!associatedProduct && products.length > 0) {
      associatedProduct = products[idx % products.length];
    }

    // Best premium background image
    const displayImage = cat.bannerUrl || associatedProduct?.image || fallbackCategories[idx % 4].bannerUrl;

    return {
      categoryId: cat.id,
      categoryName: cat.name,
      product: associatedProduct,
      image: displayImage,
    };
  });

  const handleShopNow = (product: Product | undefined) => {
    if (product) {
      window.location.href = `/products/${product.id}`;
    } else {
      console.warn("No functional product available to navigate to.");
    }
  };

  return (
    <section 
      className="w-full bg-white py-24 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 text-center" 
      id="curated-exhibition-showcase"
    >
      {/* 1. Main Premium Heading Area */}
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        <h2 className="font-sans text-2xl sm:text-3xl md:text-4xl uppercase tracking-[0.25em] text-neutral-900 font-light">
          ELEGANCE MEETS TRADITION
        </h2>
        
        <p className="mt-6 font-serif italic text-neutral-500 text-xs sm:text-sm max-w-3xl leading-relaxed mx-auto px-4">
          Discover our exquisite collection of chiffon and lawn dresses, meticulously crafted with embroidered and printed designs to elevate your style. 
          Whether you prefer unstitched, stitched, or ready-to-wear options, we have something special just for you. 
          Step into a world of timeless beauty and sophistication with Farasha.
        </p>
        
        {/* Subtle Horizontal Divider Line stretching nicely */}
        <div className="w-full max-w-[1400px] border-b border-stone-200 mt-12 mb-16" />
      </div>

      {/* 2. Responsive 2-Column Categories Grid */}
      <div className="max-w-[1400px] mx-auto select-none">
        {showcaseCards.length === 0 ? (
          <div className="py-24 border border-dashed border-stone-200 bg-neutral-50/50 rounded-none flex flex-col items-center justify-center p-6 text-center">
            <p className="font-sans text-xs text-neutral-400 font-medium">
              No collections found inside the server database archives.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {showcaseCards.map((card, idx) => (
              <div
                key={card.categoryId || idx}
                className="group relative flex flex-col w-full aspect-[2/3] overflow-hidden bg-neutral-50 shadow-sm hover:shadow-xl transition-all duration-700 hover:-translate-y-2 rounded-none cursor-pointer"
                onClick={() => handleShopNow(card.product)}
                id={`showcase-card-${card.categoryId || idx}`}
              >
                {/* Embedded Large Portrait Image */}
                <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
                  <ProductImage
                    src={card.image}
                    alt={card.categoryName}
                    className="w-full h-full object-cover object-center transform scale-100 group-hover:scale-103 transition-transform duration-1000 ease-out"
                    fallbackSrc={fallbackCategories[idx % 4].bannerUrl}
                  />
                  {/* Gentle shadow gradient base for maximum label legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/20 to-transparent opacity-90 transition-opacity duration-500 group-hover:from-neutral-950/85" />
                </div>

                {/* Bottom Center Floating content */}
                <div className="relative mt-auto z-10 w-full pb-12 px-6 flex flex-col items-center justify-end select-none">
                  {/* Category Title */}
                  <h3 className="font-sans text-lg sm:text-2xl uppercase tracking-[0.2em] font-light text-white text-center leading-normal mb-5 drop-shadow-sm">
                    {card.categoryName}
                  </h3>
                  
                  {/* Mini Luxury Button with seamless inversion animation on hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShopNow(card.product);
                    }}
                    className="inline-flex items-center justify-center min-w-[140px] px-6 py-2.5 bg-white text-neutral-900 border border-white font-sans text-[11px] uppercase tracking-[0.2em] font-medium transition-colors duration-500 group-hover:bg-neutral-950 group-hover:text-white group-hover:border-neutral-950 cursor-pointer shadow-sm"
                  >
                    SHOP NOW
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
