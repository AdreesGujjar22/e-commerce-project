"use client";

import React, { useState } from "react";
import { Product } from "../../types";
import { useStore } from "../../store";
import { Star, ShieldAlert, Award, MessageSquarePlus, ChevronDown, ChevronUp } from "lucide-react";
import { createReviewAction } from "../../actions/product.actions";
import { OptimizedImage } from "../ui/OptimizedImage";
import { RESPONSIVE_IMAGE_SIZES, PRODUCT_IMAGE_QUALITY } from "../../lib/imageConfig";

interface ProductDetailClientProps {
  product: Product;
}

export const ProductDetailClient: React.FC<ProductDetailClientProps> = ({ product }) => {
  const { addToCart, triggerNotification } = useStore();

  // Selected state management matching Pakistan apparel specs
  const [selectedType, setSelectedType] = useState<"Unstitched" | "Stitched">("Unstitched");
  const [selectedLining, setSelectedLining] = useState<"Without Lining" | "With Lining">("Without Lining");
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [engravingText, setEngravingText] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isBuying, setIsBuying] = useState<boolean>(false);

  // Active image state
  const [activeImage, setActiveImage] = useState<string>(product.image);

  // Accordion Expand/Collapse states
  const [accordions, setAccordions] = useState({
    description: true,
    modelSize: false,
    pleaseNote: false,
    delivery: false,
    exchange: false,
  });

  // Size Chart Popup state
  const [isSizeChartOpen, setIsSizeChartOpen] = useState<boolean>(false);

  // Review states
  const [reviewAuthor, setReviewAuthor] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [localReviews, setLocalReviews] = useState<any[]>(product.reviews || []);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const toggleAccordion = (key: keyof typeof accordions) => {
    setAccordions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const formattedPrice = `RS ${product.price.toLocaleString()}`;

  // Get full image list containing original product image and supplementary images from database
  const productImagesList = product.images && product.images.length > 0 
    ? product.images 
    : [product.image];

  const handleAddToCart = (silent = false) => {
    // Compile custom parameters to pass safely as cart tags
    const bespokeTag = product.category === "apparel" 
      ? `Type: ${selectedType} | Lining: ${selectedLining}` 
      : engravingText;

    addToCart(product, quantity, selectedSize, bespokeTag);
  };

  const handleDirectCheckout = () => {
    setIsBuying(true);
    handleAddToCart(true);
    setTimeout(() => {
      window.location.href = "/checkout";
    }, 500);
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewAuthor || !reviewText) return;

    setIsSubmittingReview(true);
    try {
      const res = await createReviewAction(product.id, {
        authorName: reviewAuthor,
        rating: reviewRating,
        text: reviewText,
      });

      if (res.success && res.review) {
        setLocalReviews([res.review, ...localReviews]);
        setReviewAuthor("");
        setReviewText("");
        triggerNotification("Your patron review has been verified and registered.");
      } else {
        triggerNotification(res.error || "Failed to submit review.");
      }
    } catch (err: any) {
      triggerNotification(err.message || "Failed to Submit Review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="w-full text-left" id={`productDetailClient-root-${product.id}`}>
      
      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start select-none">
        
        {/* Left Column: Vertical Thumbnails Strip + Central portrait frame */}
        <div className="lg:col-span-7 flex flex-row space-x-4 h-full">
          
          {/* Vertical thumbnails strip - Fixed Height to Prevent CLS */}
          {productImagesList.length > 1 && (
            <div className="flex flex-col space-y-3 overflow-y-auto max-h-[500px] sm:max-h-[600px] pr-1 flex-shrink-0 scrollbar-none" style={{ width: "64px" }}>
              {productImagesList.map((url, idx) => (
                <button
                  key={idx + url}
                  type="button"
                  onClick={() => setActiveImage(url)}
                  className={`relative overflow-hidden border transition-all duration-300 flex-shrink-0 cursor-pointer rounded-none bg-neutral-50 ${
                    activeImage === url
                      ? "border-stone-900 ring-1 ring-stone-900"
                      : "border-stone-200 hover:border-stone-400"
                  }`}
                  style={{ width: "64px", height: "96px" }}
                >
                  <OptimizedImage
                    src={url}
                    alt={`Gallery ${idx + 1}`}
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

          {/* Large portrait focused image - Fixed Aspect Ratio to Prevent CLS */}
          <div className="flex-1 relative overflow-hidden bg-[#fbfbfb]" style={{ aspectRatio: "2/3" }}>
            <OptimizedImage
              src={activeImage}
              alt={product.name}
              fill
              sizes={RESPONSIVE_IMAGE_SIZES.productDetail}
              quality={PRODUCT_IMAGE_QUALITY.productDetail}
              loading="eager"
              className="object-cover object-center transition-all duration-700 ease-out"
            />
          </div>
        </div>

        {/* Right Column: Premium parameters, options & Collapsible cards */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          
          {/* Heading parameters */}
          <div className="border-b border-stone-200 pb-5">
            <h1 className="font-sans text-xl sm:text-2xl uppercase tracking-[0.22em] text-neutral-900 font-medium">
              {product.name}
            </h1>
            <p className="font-sans text-xs sm:text-sm tracking-[0.16em] text-stone-500 font-light uppercase mt-2.5">
              {formattedPrice}
            </p>
          </div>

          {/* Interactive variables choosing segment */}
          <div className="space-y-6">
            
            {/* Custom attributes for Pakistan Apparel products */}
                {/* 1. SUIT TYPE SELECTION */}
                <div className="space-y-2">
                  <span className="block font-sans text-[11px] tracking-wider text-neutral-600 font-light select-none">
                    Choose Fabric Type:
                  </span>
                  <div className="flex gap-3">
                    {["Unstitched", "Stitched"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSelectedType(type as any)}
                        className={`px-6 py-2 border transition-all text-xs tracking-wider cursor-pointer rounded-none ${
                          selectedType === type
                            ? "bg-neutral-950 border-neutral-950 text-white font-medium"
                            : "bg-white border-stone-300 text-neutral-700 hover:border-neutral-500"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. LINING SELECTION */}
                <div className="space-y-2">
                  <span className="block font-sans text-[11px] tracking-wider text-neutral-600 font-light select-none">
                    Lining Option:
                  </span>
                  <div className="flex gap-3">
                    {["Without Lining", "With Lining"].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setSelectedLining(val as any)}
                        className={`px-6 py-2 border transition-all text-xs tracking-wider cursor-pointer rounded-none ${
                          selectedLining === val
                            ? "bg-neutral-950 border-neutral-950 text-white font-medium"
                            : "bg-white border-stone-300 text-neutral-700 hover:border-neutral-500"
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. ATELIER SIZING */}
                {selectedType === "Stitched" && (
                  <div className="space-y-2 pt-1 animate-fadeIn">
                    <span className="block font-sans text-[11px] tracking-wider text-neutral-600 font-light select-none">
                      Select Your Size:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {["XS", "S", "M", "L", "XL"].map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setSelectedSize(sz)}
                          className={`w-10 h-10 border text-xs font-display font-medium tracking-widest transition-all cursor-pointer rounded-full ${
                            selectedSize === sz
                              ? "bg-neutral-950 border-neutral-950 text-white"
                              : "border-stone-200 text-neutral-600 bg-white hover:border-stone-400"
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* SIZE CHART TOGGLING BUTTON */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSizeChartOpen(!isSizeChartOpen)}
                    className="inline-flex tracking-[0.16em] text-[10px] font-sans font-medium hover:text-neutral-500 border-b border-stone-900 pb-0.5 uppercase cursor-pointer"
                  >
                    SIZE CHART
                  </button>

                  {isSizeChartOpen && (
                    <div className="mt-3 p-4 border border-stone-200 bg-neutral-50 text-[11px] font-sans text-neutral-600 leading-relaxed max-w-sm animate-fadeIn">
                      <p className="font-bold text-neutral-800 mb-1.5 uppercase tracking-wider">Standard Size Guide</p>
                      <ul className="space-y-1 font-mono">
                        <li>XS: Chest 34" | Waist 26" | Hips 36"</li>
                        <li>S: Chest 36" | Waist 28" | Hips 38"</li>
                        <li>M: Chest 38" | Waist 30" | Hips 40"</li>
                        <li>L: Chest 40" | Waist 32" | Hips 42"</li>
                        <li>XL: Chest 42" | Waist 34" | Hips 44"</li>
                      </ul>
                      <p className="mt-2 text-[10px] italic">Length varies between 42" to 44" based on pattern designs.</p>
                    </div>
                  )}
                </div>


            {/* Custom Monograms options for watches, fragrances, decor */}
            {!["apparel"].includes(product.category) && (
              <div className="space-y-2">
                <span className="block font-sans text-[11px] tracking-wider text-neutral-600 font-light select-none">
                  Custom Text (Optional)
                </span>
                <input
                  type="text"
                  placeholder="Enter initials or name (max 15 characters)"
                  maxLength={15}
                  value={engravingText}
                  onChange={(e) => setEngravingText(e.target.value)}
                  className="w-full bg-white text-neutral-950 placeholder-stone-400 font-sans text-xs px-4 py-3 border border-stone-200 rounded-none focus:outline-none focus:border-neutral-900"
                />
              </div>
            )}

            {/* QUANTITY PICKER ELEMENT */}
            <div className="space-y-2 pt-1">
              <span className="block font-sans text-[11px] tracking-wider text-neutral-600 font-light select-none">
                Quantity
              </span>
              <div className="inline-flex items-center border border-stone-200 rounded-none bg-white">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity(quantity - 1)}
                  className="w-10 h-10 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950 text-sm focus:outline-none disabled:opacity-30 cursor-pointer"
                >
                  -
                </button>
                <span className="w-12 text-center font-sans font-light text-xs text-neutral-900">{quantity}</span>
                <button
                  type="button"
                  disabled={quantity >= product.stock}
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950 text-sm focus:outline-none disabled:opacity-30 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* ACTION TRIGGERS IN RECTANGULAR BLOCK DESIGNS */}
            <div className="pt-4 flex flex-col space-y-3.5">
              <button
                type="button"
                disabled={product.stock <= 0 || isAdding}
                onClick={() => {
                  setIsAdding(true);
                  setTimeout(() => {
                    handleAddToCart();
                    setIsAdding(false);
                  }, 400);
                }}
                className="w-full h-12 border border-neutral-950 text-neutral-950 hover:bg-stone-50 transition-colors uppercase tracking-[0.2em] text-[11px] font-sans font-medium cursor-pointer rounded-none disabled:opacity-40"
              >
                {isAdding ? "ADDING..." : "ADD TO CART"}
              </button>

              <button
                type="button"
                disabled={product.stock <= 0 || isBuying}
                onClick={handleDirectCheckout}
                className="w-full h-12 bg-neutral-950 hover:bg-neutral-900 text-white transition-colors uppercase tracking-[0.2em] text-[11px] font-sans font-medium cursor-pointer rounded-none disabled:opacity-40"
              >
                {isBuying ? "PROCEEDING..." : "BUY IT NOW"}
              </button>
            </div>

            {/* Gentle alert stock alert */}
            {product.stock <= 3 && product.stock > 0 && (
              <div className="flex items-center gap-1.5 text-amber-600 font-sans text-[11px] font-light mt-1">
                <ShieldAlert className="h-4 w-4" />
                <span>Only {product.stock} items left in stock.</span>
              </div>
            )}
            {product.stock === 0 && (
              <div className="inline-flex items-center gap-1.5 text-red-600 font-sans text-[11px] font-light mt-1">
                <ShieldAlert className="h-4 w-4" />
                <span>This product is currently sold out.</span>
              </div>
            )}

          </div>

          {/* Accordion List Segment */}
          <div className="border-t border-stone-200 mt-8 pt-2">
            
            {/* 1. Product Details */}
            <div className="border-b border-stone-200">
              <button
                type="button"
                className="w-full py-4.5 flex items-center justify-between font-sans text-[11px] tracking-[0.18em] text-neutral-900 font-medium uppercase focus:outline-none cursor-pointer"
                onClick={() => toggleAccordion("description")}
              >
                <span>Product Details</span>
                {accordions.description ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
              {accordions.description && (
                <div className="pb-5 font-sans text-xs text-neutral-500 leading-relaxed space-y-2">
                  <p>{product.description}</p>
                  <p className="italic text-neutral-600 bg-stone-50 p-3.5 border-l-2 border-stone-400 mt-2">
                    {product.longDescription}
                  </p>
                  {product.details && product.details.length > 0 && (
                    <ul className="list-disc pl-4 space-y-1.5 pt-2">
                      {product.details.map((dt, i) => (
                        <li key={i}>{dt}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* 2. Model Info */}
            <div className="border-b border-stone-200">
              <button
                type="button"
                className="w-full py-4.5 flex items-center justify-between font-sans text-[11px] tracking-[0.18em] text-neutral-900 font-medium uppercase focus:outline-none cursor-pointer"
                onClick={() => toggleAccordion("modelSize")}
              >
                <span>Model Info</span>
                {accordions.modelSize ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
              {accordions.modelSize && (
                <div className="pb-5 font-sans text-xs text-neutral-500 leading-relaxed">
                  <p>Our model stands at 5'8" wearing custom Stitching size option Small (S).</p>
                  <p className="mt-1">Standard length for apparel finishes around 43 inches.</p>
                </div>
              )}
            </div>

            {/* 3. Important Information */}
            <div className="border-b border-stone-200">
              <button
                type="button"
                className="w-full py-4.5 flex items-center justify-between font-sans text-[11px] tracking-[0.18em] text-neutral-900 font-medium uppercase focus:outline-none cursor-pointer"
                onClick={() => toggleAccordion("pleaseNote")}
              >
                <span>Important Information</span>
                {accordions.pleaseNote ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
              {accordions.pleaseNote && (
                <div className="pb-5 font-sans text-xs text-neutral-500 leading-relaxed">
                  <p>Colors of threads, pearls or sequins might appear slightly different due to visual screen configurations or professional studio camera lighting.</p>
                  <p className="mt-1">Hand washing using safe laundry detergents or professional dry clean is strongly suggested for embroidered products.</p>
                </div>
              )}
            </div>

            {/* 4. Delivery Details */}
            <div className="border-b border-stone-200">
              <button
                type="button"
                className="w-full py-4.5 flex items-center justify-between font-sans text-[11px] tracking-[0.18em] text-neutral-900 font-medium uppercase focus:outline-none cursor-pointer"
                onClick={() => toggleAccordion("delivery")}
              >
                <span>Delivery Details</span>
                {accordions.delivery ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
              {accordions.delivery && (
                <div className="pb-5 font-sans text-xs text-neutral-500 leading-relaxed">
                  <p>Secure premium packaging. Cash on Delivery (COD) services available for orders all over Pakistan: delivered inside 3 to 5 business days.</p>
                  <p className="mt-1">Tracked courier shipping of unstitched and stitched dresses with signature gift box wrapping included.</p>
                </div>
              )}
            </div>

            {/* 5. Returns & Exchange */}
            <div className="border-b border-stone-200">
              <button
                type="button"
                className="w-full py-4.5 flex items-center justify-between font-sans text-[11px] tracking-[0.18em] text-neutral-900 font-medium uppercase focus:outline-none cursor-pointer"
                onClick={() => toggleAccordion("exchange")}
              >
                <span>Returns & Exchange</span>
                {accordions.exchange ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
              {accordions.exchange && (
                <div className="pb-5 font-sans text-xs text-neutral-500 leading-relaxed">
                  <p>Exchanges are allowed within seven (7) days of delivery date on unopened, unworn items with security seals undamaged.</p>
                  <p className="mt-1">Custom tailormade stitched orders cannot be returned or exchanged due to distinct sizing designs.</p>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Dynamic Patron Reviews Logs (Database data unchanged) */}
      <div className="border-t border-stone-200 mt-20 pt-16" id={`productDetailClient-reviews-${product.id}`}>
        <h3 className="font-sans text-base sm:text-lg uppercase tracking-[0.2em] text-neutral-900 font-normal mb-8 text-center sm:text-left">
          Customer Reviews <span className="font-serif italic text-stone-500 font-light">Customer feedback</span>
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Submit Testimonial Column */}
          <div className="lg:col-span-4">
            <form onSubmit={handleAddReview} className="bg-neutral-50 border border-stone-200 p-6">
              <h4 className="font-sans text-[11px] uppercase tracking-wider font-medium text-neutral-800 mb-4 flex items-center">
                <MessageSquarePlus className="h-4 w-4 text-stone-700 mr-2" />
                Write a review
              </h4>
              
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-[9px] font-sans uppercase tracking-widest text-neutral-400 mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={reviewAuthor}
                    onChange={(e) => setReviewAuthor(e.target.value)}
                    className="w-full bg-white text-neutral-900 placeholder-stone-400 font-sans text-xs px-3.5 py-2.5 border border-stone-200 focus:outline-none focus:border-stone-550"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-sans uppercase tracking-widest text-[#999] mb-1.5">
                    Rating score
                  </label>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="w-full bg-white text-neutral-900 font-sans text-xs px-3.5 py-2.5 border border-stone-200 focus:outline-none cursor-pointer"
                  >
                    <option value={5}>5 Stars - Pure Perfection</option>
                    <option value={4}>4 Stars - Very Luxury</option>
                    <option value={3}>3 Stars - Satisfactory</option>
                    <option value={2}>2 Stars - Subpar</option>
                    <option value={1}>1 Star - Flawed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-sans uppercase tracking-widest text-[#999] mb-1.5">
                    Patron Testimonial
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Write your honest experience with this product..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full bg-white text-neutral-950 placeholder-stone-400 font-sans text-xs px-3.5 py-2.5 border border-stone-200 focus:outline-none focus:border-stone-550"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingReview}
                className="w-full bg-neutral-950 hover:bg-neutral-900 disabled:opacity-40 text-white font-sans text-[10px] uppercase tracking-widest font-medium py-3 border border-neutral-950 transition-colors cursor-pointer"
              >
                {isSubmittingReview ? "PUBLISHING..." : "Submit Review"}
              </button>
            </form>
          </div>

          {/* Testimonials List Column */}
          <div className="lg:col-span-8 space-y-6 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
            {localReviews.length === 0 ? (
              <div className="py-12 border border-dashed border-stone-200 bg-[#fbfbfb] flex flex-col items-center justify-center p-6 text-center">
                <p className="font-sans text-xs italic text-neutral-400">No reviews yet. Be the first to review this product.</p>
              </div>
            ) : (
              localReviews.map((review, rIdx) => (
                <div key={rIdx} className="border-b border-stone-200 pb-5 last:border-b-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-sans text-[11px] uppercase tracking-wider font-semibold text-neutral-900">{review.author}</span>
                    <span className="font-mono text-[9px] text-neutral-400">{review.date}</span>
                  </div>
                  <div className="flex text-neutral-800 mb-2">
                    {Array.from({ length: 5 }).map((_, sIdx) => (
                      <Star
                        key={sIdx}
                        className={`h-3 w-3 ${sIdx < review.rating ? "fill-stone-900 text-stone-900" : "text-stone-200"}`}
                      />
                    ))}
                  </div>
                  <p className="font-sans text-xs text-neutral-500 leading-relaxed italic">
                    "{review.text}"
                  </p>
                </div>
              ))
            )}
          </div>

        </div>
      </div>

    </div>
  );
};
