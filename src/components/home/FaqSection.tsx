"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Minus, HelpCircle, MessageCircle, ExternalLink } from "lucide-react";

interface FaqItem {
  id: string;
  question: string;
  answer: React.ReactNode;
}

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqData: FaqItem[] = [
    {
      id: "place-order",
      question: "How do I place a Cash on Delivery order?",
      answer: (
        <div className="space-y-2">
          <p className="font-sans text-xs sm:text-sm text-neutral-600 leading-relaxed">
            It is simple! Browse through our curated catalogs, such as <Link href="/collections" className="text-gold-700 font-bold hover:underline">Apparel & Outerwear</Link> or <Link href="/collections" className="text-gold-700 font-bold hover:underline">Geologic Decors</Link>, configure your adjustments, and add the artifacts to your bag. Run checkout inside our checkout station, define your Pakistan dynamic delivery metrics (province, city, telephone contact), and submit.
          </p>
          <p className="font-sans text-xs text-neutral-500 flex items-center gap-1.5">
            <span>Featured item highlight:</span>
            <Link href="/products/leternel-silk-trench-coat/550e8400-e29b-41d4-a716-446655440001" className="text-gold-650 font-medium hover:underline inline-flex items-center gap-0.5">
              L'Éternel Silk Trench Coat <ExternalLink className="h-2.5 w-2.5" />
            </Link>
          </p>
        </div>
      ),
    },
    {
      id: "shipping-speed",
      question: "How long does shipping delivery take across Pakistan?",
      answer: (
        <p className="font-sans text-xs sm:text-sm text-neutral-600 leading-relaxed">
          Orders are validated and processed from our headquarters within 24 to 48 hours. Secure transit routes through premium national courier links (TCS, Leopards) deliver packages directly to major centers (Karachi, Lahore, Islamabad, Faisalabad) in 2 to 3 corporate working days. Custom out-of-boundary regions may require 4 to 5 working days.
        </p>
      ),
    },
    {
      id: "cod-system",
      question: "Are payment card transactions required, or is Cash on Delivery free?",
      answer: (
        <div className="space-y-2">
          <p className="font-sans text-xs sm:text-sm text-neutral-600 leading-relaxed">
            Arooj operations are entirely centered around **Cash on Delivery (COD)**. No advance payment or escrow cards are required during checkout. Simply remit the cash sum directly to our courier agent upon door-station handoff.
          </p>
          <p className="font-sans text-xs text-neutral-500">
            For premium timepiece details, view our <Link href="/products/arooj-chronosphere-wristwatch/550e8400-e29b-41d4-a716-446655440007" className="text-gold-650 font-bold hover:underline">Arooj Chronosphere Wristwatch</Link>.
          </p>
        </div>
      ),
    },
    {
      id: "returns-policy",
      question: "What is your return and authenticity guarantee policy?",
      answer: (
        <div className="space-y-2">
          <p className="font-sans text-xs sm:text-sm text-neutral-600 leading-relaxed">
            All fine items are accompanied by an authenticated masterwork registry certificate. We respect customer satisfaction as our highest virtue, extending a <strong>7-day exchange and returns coverage window</strong> for undamaged, unwashed, tagging-intact items.
          </p>
          <p className="font-sans text-xs text-neutral-500">
            Read complete details in our <Link href="/terms" className="text-gold-700 font-bold hover:underline">Bespoke Terms Sheet</Link>.
          </p>
        </div>
      ),
    },
    {
      id: "curators",
      question: "Do you offer premium fragrances and home accessories?",
      answer: (
        <div className="space-y-2">
          <p className="font-sans text-xs sm:text-sm text-neutral-600 leading-relaxed">
            Yes, our collection includes olfactory scents and structural room-accent travertine blocks crafted in small batches. Explore our dedicated curation sections:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Link href="/collections" className="bg-gold-50 border border-gold-200 text-gold-900 rounded-md px-2.5 py-1 text-[10px] uppercase font-display font-black hover:bg-gold-100 transition-all">
              Prestige Fragrances
            </Link>
            <Link href="/collections" className="bg-gold-50 border border-gold-200 text-gold-900 rounded-md px-2.5 py-1 text-[10px] uppercase font-display font-black hover:bg-gold-100 transition-all">
              Geologic Accents
            </Link>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section 
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 mb-16 text-left animate-fadeIn" 
      id="homepage-faq-deck"
      itemScope 
      itemType="https://schema.org/FAQPage"
    >
      <div className="text-center sm:text-left mb-10 border-b border-gold-150 pb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="font-display text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-bold mb-2 flex items-center justify-center sm:justify-start">
            <HelpCircle className="h-4 w-4 mr-1.5 text-gold-500" />
            Curator Knowledge Base
          </h2>
          <h3 className="font-display text-2xl uppercase tracking-tight text-neutral-950 font-black">
            Frequently Asked Questions
          </h3>
        </div>
        <Link
          href="/contact"
          className="inline-flex items-center space-x-2 bg-neutral-900 hover:bg-neutral-800 text-gold-300 px-4 py-2.5 rounded-full text-[10px] uppercase tracking-wider font-bold transition-all shadow-sm"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          <span>Inquire Spec Desk</span>
        </Link>
      </div>

      <div className="space-y-4 bg-white border border-gold-150 p-6 sm:p-8 rounded-3xl shadow-sm">
        {faqData.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className={`border-b border-neutral-100 last:border-b-0 pb-4 last:pb-0 transition-all ${
                isOpen ? "bg-[#faf9f6]/40 rounded-2xl border-none" : ""
              }`}
              itemProp="mainEntity"
              itemScope
              itemType="https://schema.org/Question"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full flex justify-between items-center py-3 text-left focus:outline-none focus:ring-1 focus:ring-gold-300 rounded-lg px-2 group cursor-pointer"
                aria-expanded={isOpen}
              >
                <span 
                  className="font-display text-sm sm:text-base font-black text-neutral-950 group-hover:text-gold-700 transition-colors"
                  itemProp="name"
                >
                  {faq.question}
                </span>
                <span className="flex-shrink-0 ml-4 p-1.5 bg-neutral-100 rounded-full group-hover:bg-gold-50 transition-all">
                  {isOpen ? (
                    <Minus className="h-3.5 w-3.5 text-gold-700" />
                  ) : (
                    <Plus className="h-3.5 w-3.5 text-neutral-600" />
                  )}
                </span>
              </button>
              
              <div
                className={`transition-all duration-300 overflow-hidden ${
                  isOpen ? "max-h-56 mt-2 px-2 pb-2 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
                }`}
                itemProp="acceptedAnswer"
                itemScope
                itemType="https://schema.org/Answer"
              >
                <div itemProp="text">
                  {faq.answer}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
