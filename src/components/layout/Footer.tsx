import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-950 text-neutral-300 border-t border-gold-950/20 pt-16 pb-12 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 text-left">
        
        {/* Brand Mission Column */}
        <div className="md:col-span-2">
          <span className="font-display text-xs tracking-[0.3em] uppercase font-bold text-white block">
            MAISON L'ÉTOILE
          </span>
          <span className="font-serif text-[8px] italic tracking-[0.3em] text-gold-400 uppercase mt-1 block">
            high-end atelier & gallery
          </span>
          <p className="mt-6 font-sans text-xs text-neutral-400 leading-relaxed max-w-sm">
            Curating state-of-the-art hand looms, organic perfumes, celestial timekeepers, and custom sculptural home accents. Every curation is tailored to celebrate the eternal geometry of life.
          </p>
        </div>

        {/* Collections Sizing Column */}
        <div>
          <h4 className="font-display text-[9px] uppercase tracking-widest font-bold text-white mb-4">
            Showroom Categories
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/collections" className="hover:text-gold-400 transition-colors">
                Apparel & Textiles
              </Link>
            </li>
            <li>
              <Link href="/collections" className="hover:text-gold-400 transition-colors">
                Timepieces & Watches
              </Link>
            </li>
            <li>
              <Link href="/collections" className="hover:text-gold-400 transition-colors">
                Fine Scents & Aromas
              </Link>
            </li>
            <li>
              <Link href="/collections" className="hover:text-gold-400 transition-colors">
                Sculptures & Accents
              </Link>
            </li>
          </ul>
        </div>

        {/* Concierge & Support Columns */}
        <div>
          <h4 className="font-display text-[9px] uppercase tracking-widest font-bold text-white mb-4">
            Assistance
          </h4>
          <ul className="space-y-2 text-xs text-neutral-400">
            <li className="flex items-center space-x-1.5 cursor-pointer text-gold-300">
              <Sparkles className="h-3 w-3 text-gold-400 animate-pulse" />
              <span>AI Aura Styling Concierge</span>
            </li>
            <li>Atelier Private Consultations</li>
            <li>Bespoke Tailoring Inquiries</li>
            <li>Returns & Courier Insurance</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between text-left text-neutral-500 text-[10px]">
        <div>
          <p>© {new Date().getFullYear()} Maison L'Étoile Atelier. All rights reserved globally.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-6">
          <p className="cursor-pointer hover:text-neutral-300 text-[10px]">Terms of Stewardship</p>
          <p className="cursor-pointer hover:text-neutral-300 text-[10px]">Privacy Protocols</p>
        </div>
      </div>
    </footer>
  );
};
