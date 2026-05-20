"use client";

import React from "react";
import Link from "next/link";
import { useStore } from "../../store";
import { Sparkles, Compass } from "lucide-react";
import { motion } from "motion/react";

export const HeroSection: React.FC = () => {
  const { setChatOpen } = useStore();

  return (
    <div className="relative h-[90vh] min-h-[500px] w-full bg-neutral-900 overflow-hidden flex items-center justify-center">
      
      {/* Editorial Ambient Photo Backdrop */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop&q=82"
          alt="High fashion models lounging in neutral fabrics"
          className="w-full h-full object-cover opacity-35 object-center scale-105"
        />
        {/* Deep atmospheric shadows overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/45 to-neutral-900/10" />
      </div>

      {/* Main Hero Elements wrapper */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
        
        {/* Animated micro banner */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center space-x-2 bg-gold-500/15 border border-gold-300/40 px-4 py-2 rounded-full mb-8 backdrop-blur-subtle shadow-sm"
        >
          <Sparkles className="h-3 w-3 text-gold-400 animate-pulse" />
          <span className="font-display text-[9px] uppercase tracking-[0.22em] font-semibold text-gold-300">
            introducing our spring collection
          </span>
        </motion.div>

        {/* Brand Display Main Title */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.15 }}
          className="font-display text-4xl sm:text-7xl uppercase tracking-[0.16em] font-black leading-none text-white block"
        >
          L'ÉCORCE <span className="font-serif italic font-normal text-gold-400">Silencieuse</span>
        </motion.h1>

        {/* Elite description subline */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-6 font-serif italic text-base sm:text-xl text-neutral-300 tracking-wide max-w-2xl leading-relaxed"
        >
          An extraordinary collection pairing structured silk outerwear with hand-thrown mineral earth ceramics. Designed to transcend the seasons.
        </motion.p>

        {/* Brand Core Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55 }}
          className="mt-12 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-5"
        >
          {/* Main call to browse */}
          <Link
            href="/collections"
            className="inline-flex items-center justify-center bg-[#faf9f6] hover:bg-[#eae8e4] text-neutral-950 font-display text-[10px] uppercase font-bold tracking-[0.2em] px-8 py-4.5 rounded-full transition-all duration-300 shadow-lg active:scale-95"
          >
            <Compass className="h-3.5 w-3.5 mr-2" />
            <span>inquire showroom</span>
          </Link>

          {/* AI Styling Concierge trigger */}
          <button
            onClick={() => setChatOpen(true)}
            className="inline-flex items-center justify-center bg-neutral-950/40 hover:bg-neutral-950/70 border border-gold-400/35 hover:border-gold-400/75 text-[#faf9f6] font-display text-[10px] uppercase font-bold tracking-[0.2em] px-8 py-4.5 rounded-full backdrop-blur-subtle transition-all duration-300 shadow-md active:scale-95"
          >
            <Sparkles className="h-3.5 w-3.5 mr-2 text-gold-400" />
            <span>ai styling chatbot</span>
          </button>
        </motion.div>

      </div>
    </div>
  );
};
