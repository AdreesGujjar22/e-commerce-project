"use client";

import React, { useState } from "react";
import { Share2, Check } from "lucide-react";

interface ShareButtonProps {
  slug: string;
  isProduct?: boolean;
}

export default function ShareButton({ slug, isProduct = false }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      const path = isProduct ? "products" : "blogs";
      const shareUrl = `${window.location.origin}/${path}/${slug}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-neutral-950 text-gold-400 hover:bg-neutral-900 border border-gold-800/15 rounded-xl text-xs font-display uppercase tracking-widest font-extrabold transition duration-300 cursor-pointer whitespace-nowrap"
      id={isProduct ? "product-share-button" : "blog-share-button"}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
          <span className="text-emerald-400">Copied!</span>
        </>
      ) : (
        <>
          <Share2 className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{isProduct ? "Product" : "Blog"} Share Link</span>
        </>
      )}
    </button>
  );
}
