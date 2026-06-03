"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useStore } from "../../store";
import { Sparkles, Compass, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getHeroSlidesAction, HeroSlide } from "../../actions/hero.actions";
import { ProductImage, optimizeCloudinaryUrl } from "../ui/ProductImage";

export const HeroSection: React.FC = () => {
  const { setChatOpen } = useStore();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load dynamic slides from admin configurations
  useEffect(() => {
    let active = true;
    async function fetchSlides() {
      const res = await getHeroSlidesAction();
      if (res.success && res.slides && active) {
        setSlides(res.slides);
      }
    }
    fetchSlides();
    return () => {
      active = false;
    };
  }, []);

  // Preload remaining slide images in the background sequentially to avoid network congestion
  useEffect(() => {
    if (slides.length <= 1) return;

    let isCancelled = false;

    const preloadNextSlides = async () => {
      // Start preloading from index 1, since index 0 is immediately requested by active render
      for (let i = 1; i < slides.length; i++) {
        if (isCancelled) break;
        const rawUrl = slides[i].image;
        if (!rawUrl) continue;

        const optimizedUrl = optimizeCloudinaryUrl(rawUrl);

        await new Promise<void>((resolve) => {
          const img = new Image();
          img.src = optimizedUrl;
          img.onload = () => {
            // Use 400ms interval cooldown to keep bandwidth fully clear for critical interactions
            setTimeout(() => {
              resolve();
            }, 400);
          };
          img.onerror = () => {
            resolve();
          };
        });
      }
    };

    preloadNextSlides();

    return () => {
      isCancelled = true;
    };
  }, [slides]);

  // Manage Autoplay cycling
  useEffect(() => {
    if (slides.length <= 1) return;

    // Reset previous timer
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      handleNext();
    }, 7000); // 7 seconds per slide

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, slides]);

  const handlePrev = () => {
    if (slides.length === 0) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (slides.length === 0) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const handleSelectDot = (idx: number) => {
    if (idx === currentIndex) return;
    setDirection(idx > currentIndex ? 1 : -1);
    setCurrentIndex(idx);
  };

  if (slides.length === 0) {
    // Show premium Loading state prior to rendering
    return (
      <div className="relative h-[90vh] min-h-[500px] w-full bg-neutral-950 flex items-center justify-center text-center">
        <div className="space-y-4 animate-pulse">
          <div className="h-6 w-32 bg-stone-800 rounded mx-auto" />
          <div className="h-12 w-64 bg-stone-800 rounded mx-auto" />
          <div className="h-6 w-48 bg-stone-800 rounded mx-auto" />
        </div>
      </div>
    );
  }

  const activeSlide = slides[currentIndex];

  // Motion variants for slider transitions
  const slideVariants: any = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 1.02,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.5 },
        scale: { duration: 0.8 },
      },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 0.98,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.5 },
      },
    }),
  };

  return (
    <div 
      className="relative h-[90vh] min-h-[500px] w-full bg-neutral-950 overflow-hidden flex items-center justify-center group" 
      id="hero-slider-mainframe"
    >
      {/* Background Image Container with interactive animation */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 w-full h-full"
          >
            <ProductImage
              src={activeSlide.image}
              alt={activeSlide.title}
              className="w-full h-full object-cover object-center transform scale-103"
            />
            {/* Deep atmospheric overlay customizable by the dynamic slide configuration */}
            <div 
              className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/45 to-neutral-900/10 transition-all duration-500"
              style={{
                opacity: (activeSlide.overlay_opacity ?? 35) / 100,
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Main Hero texts and controls frame */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center select-none">
        
        {/* Animated micro banner */}
        <motion.div
          key={`pill-${currentIndex}`}
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center space-x-2 bg-gold-500/15 border border-gold-300/40 px-4 py-2 rounded-full mb-8 backdrop-blur-subtle shadow-sm"
        >
          <Sparkles className="h-3 w-3 text-gold-400 animate-pulse" />
          <span className="font-display text-[9px] uppercase tracking-[0.22em] font-semibold text-gold-300">
            Latest Collection
          </span>
        </motion.div>

        {/* Brand Display Main Title */}
        <motion.h1
          key={`title-${currentIndex}`}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display text-3xl sm:text-6xl uppercase tracking-[0.16em] font-black leading-tight text-white block max-w-3xl"
        >
          {activeSlide.title}
        </motion.h1>

        {/* Elite description subline */}
        <motion.p
          key={`subtitle-${currentIndex}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="mt-6 font-serif italic text-sm sm:text-lg text-neutral-300 tracking-wide max-w-2xl leading-relaxed"
        >
          {activeSlide.subtitle}
        </motion.p>

        {/* Brand Core Buttons */}
        <motion.div
          key={`buttons-${currentIndex}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mt-10 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-5"
        >
          <Link
            href="/collections"
            className="inline-flex items-center justify-center bg-[#faf9f6]/95 hover:bg-[#eae8e4] text-neutral-950 font-display text-[10px] uppercase font-bold tracking-[0.2em] px-8 py-4 rounded-full transition-all duration-300 shadow-lg active:scale-97"
          >
            <Compass className="h-3.5 w-3.5 mr-2" />
            <span>View Products</span>
          </Link>

          <button
            onClick={() => setChatOpen(true)}
            className="inline-flex items-center justify-center bg-neutral-950/40 hover:bg-neutral-950/70 border border-gold-400/35 hover:border-gold-400/75 text-[#faf9f6] font-display text-[10px] uppercase font-bold tracking-[0.2em] px-8 py-4 rounded-full backdrop-blur-subtle transition-all duration-300 shadow-md active:scale-97 cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 mr-2 text-gold-400" />
            <span>Ask Stylist AI</span>
          </button>
        </motion.div>

      </div>

      {/* Slide Navigation Arrows (visible on hover) */}
      {slides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full border border-white/10 bg-black/20 hover:bg-black/45 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all active:scale-90 cursor-pointer hover:border-gold-400/30 backdrop-blur-subtle"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5 text-neutral-200 hover:text-white" />
          </button>
          
          <button
            onClick={handleNext}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full border border-white/10 bg-black/20 hover:bg-black/45 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all active:scale-90 cursor-pointer hover:border-gold-400/30 backdrop-blur-subtle"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5 text-neutral-200 hover:text-white" />
          </button>
        </>
      )}

      {/* Micro indicator dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-2.5">
          {slides.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => handleSelectDot(idx)}
              className={`h-2 transition-all duration-300 cursor-pointer ${
                idx === currentIndex ? "w-7 bg-gold-400 rounded-full" : "w-2 bg-stone-500/50 hover:bg-stone-400 rounded-full"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
