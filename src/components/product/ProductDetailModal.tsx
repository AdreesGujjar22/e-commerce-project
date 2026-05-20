"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "../../store";
import { Modal } from "../ui/Modal";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Star, ShieldAlert, BadgeCheck, MessageSquarePlus } from "lucide-react";

export const ProductDetailModal: React.FC = () => {
  const { activeProduct, setActiveProduct, addToCart } = useStore();
  const [selectedSize, setSelectedSize] = useState("M");
  const [engravingText, setEngravingText] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  // Form states for leaving a review
  const [reviewAuthor, setReviewAuthor] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [localReviews, setLocalReviews] = useState<any[]>([]);

  useEffect(() => {
    if (activeProduct) {
      setSelectedSize("M");
      setEngravingText("");
      setQuantity(1);
      setLocalReviews(activeProduct.reviews || []);
    }
  }, [activeProduct]);

  if (!activeProduct) return null;

  const handleAddToCart = () => {
    setIsAdding(true);
    setTimeout(() => {
      addToCart(activeProduct, quantity, selectedSize, engravingText);
      setIsAdding(false);
      setActiveProduct(null); // close modal on add
    }, 600);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewAuthor || !reviewText) return;

    const newReview = {
      author: reviewAuthor,
      rating: reviewRating,
      text: reviewText,
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    };

    setLocalReviews([newReview, ...localReviews]);
    setReviewAuthor("");
    setReviewText("");
  };

  return (
    <Modal
      isOpen={activeProduct !== null}
      onClose={() => setActiveProduct(null)}
      title={`${activeProduct.designer}`}
      maxWidth="max-w-4xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
        {/* Left Column: Premium Zoom Image */}
        <div className="flex flex-col">
          <div className="aspect-[4/5] w-full rounded-xl overflow-hidden bg-neutral-100 border border-gold-150">
            <img
              src={activeProduct.image}
              alt={activeProduct.name}
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Materials and Fine Details list */}
          <div className="mt-6 border-t border-gold-100/60 pt-6">
            <h4 className="font-display text-[9px] uppercase tracking-widest font-black text-neutral-800 mb-3 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-500 mr-2" />
              ATELIER CRAFTSMANSHIP DETAILS
            </h4>
            <ul className="space-y-2">
              {activeProduct.details?.map((detail, idx) => (
                <li key={idx} className="font-sans text-xs text-neutral-500 flex items-start leading-relaxed">
                  <span className="text-gold-500 mr-2 select-none">•</span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Descriptions & Operations form */}
        <div className="flex flex-col h-full justify-between">
          <div>
            <div className="flex items-center space-x-2.5 mb-2.5">
              <Badge variant="gold">{activeProduct.category}</Badge>
              <div className="flex items-center space-x-0.5 text-gold-500">
                <Star className="h-3 w-3 fill-gold-500" />
                <span className="font-display text-[10px] uppercase font-bold text-neutral-800">
                  {activeProduct.rating.toFixed(1)} / 5
                </span>
              </div>
            </div>

            <h2 className="font-display text-xl md:text-2xl uppercase tracking-tight text-neutral-950 font-black leading-tight">
              {activeProduct.name}
            </h2>

            <div className="font-serif italic text-lg text-neutral-800 mt-2">
              ${activeProduct.price.toLocaleString()}
            </div>

            <p className="font-sans text-xs text-neutral-500 mt-4 leading-relaxed">
              {activeProduct.longDescription}
            </p>

            {/* Sizing choosing options for cloth types */}
            {activeProduct.category === "apparel" && (
              <div className="mt-6">
                <label className="block text-[10px] font-display font-bold uppercase tracking-widest text-[#555] mb-2">
                  Atelier Fitting Size
                </label>
                <div className="flex space-x-2">
                  {["XS", "S", "M", "L", "XL"].map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-9.5 h-9.5 rounded-full border text-xs font-display font-bold transition-all ${
                        selectedSize === size
                          ? "bg-neutral-950 border-neutral-950 text-white"
                          : "border-gold-200 text-neutral-700 bg-white/70 hover:border-gold-300"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Monograms options for premium gears */}
            {["watches", "fragrances", "decor"].includes(activeProduct.category) && (
              <div className="mt-6">
                <label className="block text-[10px] font-display font-semibold uppercase tracking-widest text-neutral-500 mb-2">
                  Bespoke Monogram / Brass Engraving (Complimentary)
                </label>
                <input
                  type="text"
                  placeholder="Enter initials, e.g. A.S. (Max 15 characters)"
                  maxLength={15}
                  value={engravingText}
                  onChange={(e) => setEngravingText(e.target.value)}
                  className="w-full bg-white text-neutral-950 placeholder-neutral-400 font-sans text-xs px-4 py-3 border border-gold-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-400/90 transition-all text-left"
                />
              </div>
            )}

            {/* Quantity control */}
            <div className="mt-6">
              <label className="block text-[10px] font-display font-semibold uppercase tracking-wide text-neutral-500 mb-2">
                Quantity Count
              </label>
              <div className="inline-flex items-center border border-gold-200 rounded-xl overflow-hidden bg-white">
                <button
                  disabled={quantity <= 1}
                  onClick={() => setQuantity(quantity - 1)}
                  className="px-3.5 py-2 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 border-r border-gold-150 text-xs focus:outline-none"
                >
                  -
                </button>
                <span className="px-5 font-sans font-medium text-xs text-neutral-900">{quantity}</span>
                <button
                  disabled={quantity >= activeProduct.stock}
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3.5 py-2 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 border-l border-gold-150 text-xs focus:outline-none"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gold-100/60 flex flex-col space-y-3">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isAdding}
              onClick={handleAddToCart}
            >
              add to collection bag
            </Button>
            <div className="text-center">
              <span className="inline-flex items-center text-[9px] font-sans text-neutral-400 leading-none">
                <BadgeCheck className="h-3 w-3 text-gold-500 mr-1.5" />
                Complimentary tracked signature courier shipping included
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Review Section */}
      <div className="border-t border-gold-150 mt-12 pt-8 text-left">
        <h3 className="font-display text-xs uppercase tracking-widest text-[#151515] font-black mb-6">
          PATRON SATISFACTION REVIEW LOGS ({localReviews.length})
        </h3>

        {/* Form to leave a review */}
        <form onSubmit={handleAddReview} className="bg-[#faf9f6] border border-gold-150 rounded-2xl p-5 mb-8">
          <h4 className="font-display text-[10px] uppercase tracking-wider font-bold text-neutral-800 mb-4 flex items-center">
            <MessageSquarePlus className="h-3.5 w-3.5 text-gold-500 mr-2" />
            LEAVE AN ATELIER FEEDBACK
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[8px] font-display uppercase tracking-widest text-neutral-400 mb-1.5">
                Patron/Guest Name
              </label>
              <input
                type="text"
                required
                placeholder="Enter your name"
                value={reviewAuthor}
                onChange={(e) => setReviewAuthor(e.target.value)}
                className="w-full bg-white text-neutral-900 placeholder-neutral-400 font-sans text-xs px-3.5 py-2.5 border border-gold-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold-400 text-left"
              />
            </div>
            <div>
              <label className="block text-[8px] font-display uppercase tracking-widest text-neutral-400 mb-1.5">
                Rating score
              </label>
              <select
                value={reviewRating}
                onChange={(e) => setReviewRating(Number(e.target.value))}
                className="w-full bg-white text-neutral-900 font-sans text-xs px-3.5 py-2.5 border border-gold-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold-400"
              >
                <option value={5}>5 Stars - Pure Perfection</option>
                <option value={4}>4 Stars - Very Luxury</option>
                <option value={3}>3 Stars - Satisfactory</option>
                <option value={2}>2 Stars - Subpar</option>
                <option value={1}>1 Star - Flawed</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-[8px] font-display uppercase tracking-widest text-neutral-400 mb-1.5">
              Patron Testimonial
            </label>
            <textarea
              required
              rows={3}
              placeholder="Inquire or describe your tactile observation of this artifact..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full bg-white text-neutral-950 placeholder-neutral-400 font-sans text-xs px-3.5 py-2.5 border border-gold-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold-400 text-left"
            />
          </div>
          <button
            type="submit"
            className="bg-neutral-900 hover:bg-neutral-800 text-[#faf9f6] font-display text-[9px] uppercase tracking-widest font-black px-5 py-2.5 rounded-full transition-colors focus:outline-none shadow-sm"
          >
            publish review to registry
          </button>
        </form>

        {/* Existing reviews */}
        <div className="space-y-5 max-h-64 overflow-y-auto pr-2">
          {localReviews.length === 0 ? (
            <p className="font-sans text-xs italic text-neutral-400">Be the first patron to share a feedback on this curation.</p>
          ) : (
            localReviews.map((review, rIdx) => (
              <div key={rIdx} className="border-b border-neutral-100 last:border-b-0 pb-4.5 last:pb-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-display text-[10px] uppercase font-bold text-[#151515]">{review.author}</span>
                  <span className="font-sans text-[10px] text-neutral-400">{review.date}</span>
                </div>
                <div className="flex text-gold-500 mb-2">
                  {Array.from({ length: 5 }).map((_, sIdx) => (
                    <Star
                      key={sIdx}
                      className={`h-3 w-3 ${sIdx < review.rating ? "fill-gold-500" : "text-neutral-200"}`}
                    />
                  ))}
                </div>
                <p className="font-sans text-xs text-neutral-500 leading-normal italic">
                  "{review.text}"
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};
