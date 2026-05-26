"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Facebook, Instagram, Youtube, MessageCircle, Music, Phone, Mail, MapPin } from "lucide-react";
import { getSettingsAction, StoreSettings } from "../../actions/settings.actions";
import Image from "next/image";

export const Footer: React.FC = () => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    getSettingsAction().then((res) => {
      if (res.success) {
        setSettings(res.settings);
      }
    });
  }, []);

  const fbUrl = settings?.facebook_url || "https://facebook.com";
  const igUrl = settings?.instagram_url || "https://instagram.com";
  const ytUrl = settings?.youtube_url || "https://youtube.com";
  const waNum = settings?.whatsapp_number || "+923001234567";
  const ttUrl = settings?.tiktok_url || "https://tiktok.com";

  // Format WhatsApp Link
  const waFormatted = waNum.startsWith("http") ? waNum : `https://wa.me/${waNum.replace(/[^0-9]/g, "")}`;

  return (
    <footer className="bg-neutral-950 text-neutral-300 border-t border-neutral-900 pt-16 pb-12 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 text-left">

        {/* Brand Mission Column */}
        <div className="md:col-span-2">
          <Link href="/" className="group inline-block">
            <div className="relative h-20 w-[140px]">
              <Image
                src="/logo-white.png"
                alt="Logo"
                fill
                className="object-contain"
              />
            </div>
          </Link>
          <p className="mt-5 font-sans text-sm text-neutral-400 leading-relaxed max-w-sm">
            Arooj Arts brings you stylish clothing, perfumes, watches, and fashion accessories with premium quality and fast delivery all across Pakistan.
          </p>

          {/* Social Media Section */}
          <div className="mt-6">
            <h4 className="font-display text-[10px] uppercase tracking-wider font-bold text-white mb-3">
              Follow Us
            </h4>
            <div className="flex space-x-4">
              <a href={fbUrl} target="_blank" rel="noreferrer" className="bg-neutral-900 hover:bg-neutral-800 p-2.5 rounded-full text-neutral-300 hover:text-white transition-all border border-neutral-800" title="Facebook">
                <Facebook className="h-4 w-4" />
              </a>
              <a href={igUrl} target="_blank" rel="noreferrer" className="bg-neutral-900 hover:bg-neutral-800 p-2.5 rounded-full text-neutral-300 hover:text-white transition-all border border-neutral-800" title="Instagram">
                <Instagram className="h-4 w-4" />
              </a>
              <a href={ttUrl} target="_blank" rel="noreferrer" className="bg-neutral-900 hover:bg-neutral-800 p-2.5 rounded-full text-neutral-300 hover:text-white transition-all border border-neutral-800" title="TikTok">
                <Music className="h-4 w-4" />
              </a>
              <a href={waFormatted} target="_blank" rel="noreferrer" className="bg-neutral-900 hover:bg-neutral-800 p-2.5 rounded-full text-neutral-300 hover:text-white transition-all border border-neutral-800" title="WhatsApp">
                <MessageCircle className="h-4 w-4" />
              </a>
              <a href={ytUrl} target="_blank" rel="noreferrer" className="bg-neutral-900 hover:bg-neutral-800 p-2.5 rounded-full text-neutral-300 hover:text-white transition-all border border-neutral-800" title="YouTube">
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Collections Sizing Column */}
        <div>
          <h4 className="font-display text-[11px] uppercase tracking-wider font-bold text-white mb-4">
            Quick Links
          </h4>
          <ul className="space-y-3 text-sm">
            <li>
              <Link href="/collections" className="hover:text-gold-400 transition-colors text-neutral-400">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/blogs" className="hover:text-gold-400 transition-colors text-neutral-400">
                Fashion Blogs
              </Link>
            </li>
            <li>
              <Link href="/collections" className="hover:text-gold-400 transition-colors text-neutral-400">
                Watches & Accessories
              </Link>
            </li>
            <li>
              <Link href="/collections" className="hover:text-gold-400 transition-colors text-neutral-400">
                Perfumes & Sprays
              </Link>
            </li>
          </ul>
        </div>

        {/* Support & Contact Details */}
        <div>
          <h4 className="font-display text-[11px] uppercase tracking-wider font-bold text-white mb-4">
            Customer Help
          </h4>
          <ul className="space-y-3 text-sm">
            <li>
              <Link href="/contact" className="hover:text-gold-400 transition-colors text-neutral-400 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-neutral-500" />
                <span>Contact Us / Support</span>
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-gold-400 transition-colors text-neutral-400">
                Our Privacy Guarantee
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-gold-400 transition-colors text-neutral-400">
                Shipping & Delivery Terms
              </Link>
            </li>
            <li>
              <a href={waFormatted} target="_blank" rel="noreferrer" className="hover:text-gold-400 transition-colors text-neutral-400 flex items-center gap-1.5">
                <MessageCircle className="h-3.5 w-3.5 text-green-500 animate-bounce" />
                <span>Chat on WhatsApp</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between text-neutral-500 text-xs">
        <div>
          <p>© {new Date().getFullYear()} Arooj Arts Store. All rights reserved.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-6 text-xs">
          <Link href="/terms" className="hover:text-neutral-300">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-neutral-300">Privacy Policy</Link>
          <Link href="/contact" className="hover:text-neutral-300">Contact Us</Link>
        </div>
      </div>
    </footer>
  );
};
