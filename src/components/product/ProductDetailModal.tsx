"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "../../store";
import { Modal } from "../ui/Modal";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { OptimizedImage } from "../ui/OptimizedImage";
import { RESPONSIVE_IMAGE_SIZES, PRODUCT_IMAGE_QUALITY } from "../../lib/imageConfig";
import { Star, ShieldAlert, BadgeCheck, MessageSquarePlus, Award, Zap } from "lucide-react";
import { createReviewAction } from "../../actions/product.actions";

const ProductDetailModal: React.FC = () => {
  const { activeProduct, setActiveProduct, addToCart, triggerNotification } = useStore();
  const [selectedSize, setSelectedSize] = useState("M");
  const [engravingText, setEngravingText] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  // Gallery Active Image state
  const [activeImage, setActiveImage] = useState("");

  // Form states for leaving a review
  const [reviewAuthor, setReviewAuthor] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [localReviews, setLocalReviews] = useState<any[]>([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (activeProduct) {
      setSelectedSize("M");
      setEngravingText("");
      setQuantity(1);
      setLocalReviews(activeProduct.reviews || []);
      setActiveImage(activeProduct.image);
    }
  }, [activeProduct]);

  if (!activeProduct) return null;

  const handleAddToCart = (silent = false) => {
    addToCart(activeProduct, quantity, selectedSize, engravingText);
    if (!silent) {
      setActiveProduct(null); // close modal on add to bag
    }
  };

  const handleDirectCheckout = () => {
    setIsBuying(true);
    // Add to cart silently
    handleAddToCart(true);
    // Redirect immediately to checkout ledger
    setTimeout(() => {
      window.location.href = "/checkout";
    }, 300);
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewAuthor || !reviewText) return;

    setIsSubmittingReview(true);
    try {
      const res = await createReviewAction(activeProduct.id, {
        authorName: reviewAuthor,
        rating: reviewRating,
        text: reviewText,
      });

      if (res.success && res.review) {
        setLocalReviews([res.review, ...localReviews]);
        setReviewAuthor("");
        setReviewText("");
        triggerNotification("Your patron review has been verified and cataloged.");
      } else {
        triggerNotification(res.error || "Failed to submit review.");
      }
    } catch (err: any) {
      triggerNotification(err.message || "Could not publish your feedback.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Get list of images (primary image + product gallery)
  const productImagesList = activeProduct.images && activeProduct.images.length > 0
    ? activeProduct.images
    : [activeProduct.image];

  return (
    <Modal
      isOpen={activeProduct !== null}
      onClose={() => setActiveProduct(null)}
      title={`${activeProduct.designer}`}
      maxWidth="max-w-4xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
        {/* Left Column: Premium Zoom Image & Miniature Gallery */}
        <div className="flex flex-col space-y-4">
          <div className="w-full rounded-xl overflow-hidden bg-neutral-100 border border-gold-150 relative group" style={{ aspectRatio: "4/5" }}>
            <OptimizedImage
              src={activeImage}
              alt={activeProduct.name}
              fill
              sizes={RESPONSIVE_IMAGE_SIZES.productDetail}
              quality={PRODUCT_IMAGE_QUALITY.productDetail}
              loading="eager"
              className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.22] cursor-zoom-in"
            />
            <div className="absolute bottom-3 right-3 bg-black/60 text-white font-mono text-[9px] px-2.5 py-1 rounded-md backdrop-blur-xs uppercase tracking-wider select-none pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              Hover to Zoom
            </div>
          </div>

          {/* Gallery Thumbnails List - Fixed Height for No CLS */}
          {productImagesList.length > 1 && (
            <div className="flex space-x-2.5 overflow-x-auto py-1 scrollbar-thin">
              {productImagesList.map((url, idx) => (
                <button
                  key={idx + url}
                  type="button"
                  onClick={() => setActiveImage(url)}
                  className={`rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                    activeImage === url
                      ? "border-gold-550 ring-1 ring-gold-450"
                      : "border-gold-100 opacity-60 hover:opacity-100 hover:border-gold-250"
                  }`}
                  style={{ width: "58px", height: "72px" }}
                >
                  <OptimizedImage
                    src={url}
                    alt={`Product thumbnail ${idx + 1}`}
                    fill
                    sizes={RESPONSIVE_IMAGE_SIZES.productThumbnail}
                    quality={PRODUCT_IMAGE_QUALITY.thumbnail}
                    loading="lazy"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Materials and Fine Details list */}
          <div className="border-t border-gold-100/60 pt-6">
            <h4 className="font-display text-[9px] uppercase tracking-widest font-black text-neutral-800 mb-3 flex items-center">
              <Award className="h-3.5 w-3.5 text-gold-600 mr-2" />
              ATELIER CRAFTSMANSHIP SPECIFICATION
            </h4>
            <ul className="space-y-2">
              {activeProduct.details && activeProduct.details.length > 0 ? (
                activeProduct.details.map((detail, idx) => (
                  <li key={idx} className="font-sans text-xs text-neutral-500 flex items-start leading-relaxed">
                    <span className="text-gold-550 mr-2 select-none">•</span>
                    <span>{detail}</span>
                  </li>
                ))
              ) : (
                <li className="font-sans text-xs text-neutral-400 italic">Authentic craft details dynamically certified by designer.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Right Column: Descriptions & Operations form */}
        <div className="flex flex-col h-full justify-between">
          <div>
            <div className="flex items-center space-x-2.5 mb-2.5">
              <Badge variant="gold" className="capitalize">{activeProduct.category}</Badge>
              <div className="flex items-center space-x-0.5 text-gold-500">
                <Star className="h-3 w-3 fill-gold-500" />
                <span className="font-display text-[10px] uppercase font-bold text-neutral-800 font-mono">
                  {activeProduct.rating.toFixed(1)} / 5
                </span>
              </div>
            </div>

            <h2 className="font-display text-xl md:text-2xl uppercase tracking-tight text-neutral-950 font-black leading-tight">
              {activeProduct.name}
            </h2>

            <div className="font-serif italic text-lg text-neutral-800 mt-2 font-bold">
              ${activeProduct.price.toLocaleString()}
            </div>

            {/* Warehouse Stock Availability Indicator badge */}
            <div className="mt-3.5 flex items-center space-x-2 text-left bg-neutral-50 px-3 py-1.5 rounded-lg border border-gold-100/50 w-fit">
              <span className={`h-2 w-2 rounded-full ${
                activeProduct.stock > 3 ? "bg-teal-500" : activeProduct.stock > 0 ? "bg-amber-500 animate-pulse" : "bg-red-500"
              }`} />
              <span className="text-[10px] font-mono tracking-wider uppercase font-bold text-neutral-500">
                {activeProduct.stock > 3 ? `${activeProduct.stock} units available in showroom` : activeProduct.stock > 0 ? `Atelier limitation: ${activeProduct.stock} items available` : "Out Of Stock"}
              </span>
            </div>

            <p className="font-sans text-xs text-neutral-500 mt-4 leading-relaxed border-t border-neutral-100 pt-4">
              {activeProduct.longDescription}
            </p>

            {/* Sizing choosing options for cloth types */}
            {activeProduct.category === "apparel" && (
              <div className="mt-5.5">
                <label className="block text-[10px] font-display font-bold uppercase tracking-widest text-[#555] mb-2">
                  Atelier Fitting Size
                </label>
                <div className="flex space-x-2">
                  {["XS", "S", "M", "L", "XL"].map((size) => (
                    <button
                      type="button"
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-9.5 h-9.5 rounded-full border text-xs font-display font-bold transition-all cursor-pointer ${
                        selectedSize === size
                          ? "bg-neutral-950 border-neutral-950 text-white shadow-md scale-105"
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
              <div className="mt-5.5">
                <label className="block text-[10px] font-display font-semibold uppercase tracking-widest text-neutral-500 mb-2">
                  Bespoke Monogram / Brass Engraving (Complimentary)
                </label>
                <input
                  type="text"
                  placeholder="Enter initials, e.g. A.S. (Max 15 characters)"
                  maxLength={15}
                  value={engravingText}
                  onChange={(e) => setEngravingText(e.target.value)}
                  className="w-full bg-white text-neutral-950 placeholder-neutral-400 font-sans text-xs px-4 py-3 border border-gold-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-450 transition-all text-left"
                />
              </div>
            )}

            {/* Quantity control */}
            <div className="mt-5.5">
              <label className="block text-[10px] font-display font-semibold uppercase tracking-wide text-neutral-500 mb-2">
                Quantity Count
              </label>
              <div className="inline-flex items-center border border-gold-200 rounded-xl overflow-hidden bg-white">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity(quantity - 1)}
                  className="px-3.5 py-2 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 border-r border-gold-150 text-xs focus:outline-none disabled:opacity-30 cursor-pointer"
                >
                  -
                </button>
                <span className="px-5 font-sans font-medium text-xs text-neutral-900 font-mono">{quantity}</span>
                <button
                  type="button"
                  disabled={quantity >= activeProduct.stock}
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3.5 py-2 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 border-l border-gold-150 text-xs focus:outline-none disabled:opacity-30 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Action buttons with Checkout improvements */}
          <div className="mt-8 pt-6 border-t border-gold-100/60 flex flex-col space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Button
                variant="outline"
                size="lg"
                className="w-full border-neutral-950 h-10 hover:bg-neutral-50 text-[11px] font-bold py-2 px-4 cursor-pointer"
                isLoading={isAdding}
                disabled={activeProduct.stock <= 0}
                onClick={() => {
                  setIsAdding(true);
                  setTimeout(() => {
                    handleAddToCart();
                    setIsAdding(false);
                  }, 400);
                }}
              >
                add to collection bag
              </Button>
              <Button
                variant="primary"
                size="lg"
                className="w-full bg-gold-600 border-gold-650 hover:bg-[#80632a] text-white h-10 flex items-center justify-center space-x-2 text-[11px] font-bold py-2 px-4 cursor-pointer"
                isLoading={isBuying}
                disabled={activeProduct.stock <= 0}
                onClick={handleDirectCheckout}
              >
                <Zap className="h-3.5 w-3.5 fill-white text-white mr-1" />
                <span>buy it now (checkout)</span>
              </Button>
            </div>
            
            <div className="text-center pt-1">
              <span className="inline-flex items-center text-[9px] font-sans text-neutral-400 leading-none">
                <BadgeCheck className="h-3 w-3 text-gold-500 mr-1.5" />
                Complimentary luxury signature gift boxing & tracked courier delivery
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
        <form onSubmit={handleAddReview} className="bg-[#faf9f6]/80 border border-gold-150 rounded-2xl p-5 mb-8">
          <h4 className="font-display text-[10px] uppercase tracking-wider font-bold text-neutral-800 mb-4 flex items-center">
            <MessageSquarePlus className="h-3.5 w-3.5 text-gold-500 mr-2" />
            LEAVE AN ATELIER TESTIMONIAL
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
                className="w-full bg-white text-neutral-900 placeholder-neutral-400 font-sans text-xs px-3.5 py-2.5 border border-gold-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold-450 text-left"
              />
            </div>
            <div>
              <label className="block text-[8px] font-display uppercase tracking-widest text-neutral-400 mb-1.5">
                Rating score
              </label>
              <select
                value={reviewRating}
                onChange={(e) => setReviewRating(Number(e.target.value))}
                className="w-full bg-white text-neutral-900 font-sans text-xs px-3.5 py-2.5 border border-gold-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold-450"
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
              rows={2}
              placeholder="Describe your tactile observation of this curated artifact..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full bg-white text-neutral-950 placeholder-neutral-400 font-sans text-xs px-3.5 py-2.5 border border-gold-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold-450 text-left"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmittingReview}
            className="bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-[#faf9f6]/95 font-display text-[9px] uppercase tracking-widest font-black px-5.5 py-3 rounded-full transition-all focus:outline-none shadow-xs active:scale-95 flex items-center gap-1 cursor-pointer"
          >
            {isSubmittingReview ? "publishing feedback..." : "publish review to registry"}
          </button>
        </form>

        {/* Existing reviews */}
        <div className="space-y-5 max-h-64 overflow-y-auto pr-2 scrollbar-thin">
          {localReviews.length === 0 ? (
            <p className="font-sans text-xs italic text-neutral-400">Be the first patron to share a feedback on this curation.</p>
          ) : (
            localReviews.map((review, rIdx) => (
              <div key={rIdx} className="border-b border-neutral-100 last:border-b-0 pb-4.5 last:pb-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-display text-[10px] uppercase font-bold text-[#151515]">{review.author}</span>
                  <span className="font-sans text-[10px] text-neutral-400 font-mono">{review.date}</span>
                </div>
                <div className="flex text-gold-500 mb-2">
                  {Array.from({ length: 5 }).map((_, sIdx) => (
                    <Star
                      key={sIdx}
                      className={`h-3 w-3 ${sIdx < review.rating ? "fill-gold-500 text-gold-500" : "text-neutral-200"}`}
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

export default ProductDetailModal;
