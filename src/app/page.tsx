import React, { Suspense } from "react";
import { getCachedProducts, getCachedCategories, getCachedHeroSlides } from "../lib/cacheConfig";
import { HeroSection } from "../components/hero/HeroSection";
import { ProductGrid } from "../components/product/ProductGrid";
import { ShowcaseSection } from "../components/home/ShowcaseSection";
import { HeroImagePreloader } from "../components/hero/HeroImagePreloader";
import Link from "next/link";
import { ArrowLeftRight, Sparkles, Shield, Award, Sparkle } from "lucide-react";
import { FaqSection } from "../components/home/FaqSection";

function optimizeImageUrl(url: string): string {
  if (!url || !url.includes("cloudinary.com")) return url;
  if (url.includes("/image/upload/")) {
    return url.replace("/image/upload/", "/image/upload/f_auto,q_auto/");
  }
  return url;
}

export const revalidate = 300; // Cache for 5 minutes

export default async function HomePage() {
  const res = await getCachedProducts();
  const products = res.products || [];
  const featuredProducts = products.filter((p) => p.featured);

  const catRes = await getCachedCategories();
  const categories = catRes.categories || [];

  const heroRes = await getCachedHeroSlides();
  const heroSlides = heroRes.slides || [];
  const firstHeroImage = heroSlides[0]?.image ? optimizeImageUrl(heroSlides[0].image) : "";

  return (
    <div className="flex flex-col w-full pb-20">
      {firstHeroImage && <HeroImagePreloader imageUrl={firstHeroImage} />}

      {/* 1. Dramatic Brand Hero */}
      <HeroSection />

      {/* 2. Premium Grid Banner features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 text-left">
        <h2 className="font-display text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-bold mb-4 flex items-center">
          <Sparkle className="h-3 w-3 mr-2 text-gold-500 fill-gold-500/20" />
          Featured Collections
        </h2>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12.5 text-left">
          <h3 className="font-serif text-3xl md:text-4.5xl text-neutral-950 font-normal leading-tight max-w-xl">
            Discover elegant dresses, <span className="font-sans font-bold tracking-tight text-gold-700">premium fabrics,</span> and stylish collections designed for modern fashion lovers.
          </h3>
          <Link
            href="/collections"
            className="mt-4 md:mt-0 font-display text-[11px] uppercase tracking-widest font-black text-neutral-900 border-b-2 border-gold-400 hover:border-neutral-900 pb-1 transition-colors"
          >
            browse all products →
          </Link>
        </div>

        {/* Dynamic product list matching user filters */}
        <ProductGrid products={featuredProducts} />
      </section>

      {/* 3. Editorial Split Pane Segment */}
      <section className="bg-neutral-950 text-white mt-28 py-20 border-y border-gold-950/20 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Decorative frame with multiple overlapped images */}
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-neutral-900 border border-gold-900/10">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&auto=format&fit=crop&q=80"
              alt="Honed raw travertine in a minimalist villa"
              className="w-full h-full object-cover opacity-60"
            />
            {/* Dark gradient veil */}
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 to-transparent" />
            <div className="absolute bottom-10 left-10 max-w-sm">
              <span className="font-display text-[8.5px] uppercase tracking-widest text-gold-400 font-bold">
                Premium Fashion
              </span>
              <h4 className="font-display text-lg uppercase font-black text-white mt-2 leading-snug">
                Elegant Women's Collection
              </h4>
              <p className="font-sans text-xs text-neutral-400 mt-2 leading-relaxed">
                Premium dresses and fashion pieces designed with comfort, elegance, and modern trends in mind.
              </p>
            </div>
          </div>

          {/* Value propositions */}
          <div className="flex flex-col space-y-8">
            <h3 className="font-serif text-3.5xl md:text-5xl text-white font-light leading-none">
              Why Customers Choose <span className="font-sans font-bold text-gold-400 tracking-tight">Arooj Arts</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-neutral-900 border border-gold-900/30 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-gold-400" />
                </div>
                <h4 className="font-display text-[11px] uppercase tracking-wider font-bold text-neutral-150">
                  Guaranteed Quality
                </h4>
                <p className="font-sans text-xs text-neutral-400 leading-relaxed">
                  Every product is carefully checked before delivery to ensure premium quality, comfort, and customer satisfaction.
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-neutral-900 border border-gold-900/30 flex items-center justify-center">
                  <Award className="h-4 w-4 text-gold-400" />
                </div>
                <h4 className="font-display text-[11px] uppercase tracking-wider font-bold text-neutral-150">
                  Trusted Fashion Store
                </h4>
                <p className="font-sans text-xs text-neutral-400 leading-relaxed">
                  We focus on stylish fashion, trusted quality, and designs that match modern trends and everyday elegance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Luxury Curated Exhibition Showcase */}
      <Suspense fallback={<div className="h-96 bg-neutral-100 animate-pulse" />}>
        <ShowcaseSection categories={categories} products={products} />
      </Suspense>

      {/* 5. Interactive Details Modal loader */}
      <Suspense fallback={<div className="h-96 bg-neutral-100 animate-pulse" />}>
        <FaqSection />
      </Suspense>
    </div>
  );
}
