"use client";

import React from "react";
import Link from "next/link";
import { useStore } from "../../store";
import { motion, AnimatePresence } from "motion/react";
import { X, Trash2, ShoppingBag, Sparkles, AlertCircle } from "lucide-react";
import { ProductImage } from "../ui/ProductImage";

export const CartDrawer: React.FC = () => {
  const { isCartOpen, setCartOpen, cart, updateCartQuantity, removeFromCart } = useStore();

  const totalAmount = cart.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0);

  const checkoutUrl = "/checkout";

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Faded background layer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="absolute inset-0 bg-neutral-950/60 backdrop-blur-subtle"
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            {/* Sliding cabinet */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
              className="w-screen max-w-md bg-[#faf9f6] shadow-2xl flex flex-col h-full border-l border-gold-200"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-gold-150 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="h-5 w-5 text-neutral-800" />
                  <span className="font-display text-xs uppercase tracking-widest font-black text-neutral-900">
                    Collection bag ({cart.length})
                  </span>
                </div>
                <button
                  onClick={() => setCartOpen(false)}
                  className="text-neutral-400 hover:text-neutral-900 transition-colors p-1 cursor-pointer"
                >
                  <X className="h-5.5 w-5.5" />
                </button>
              </div>

              {/* Items List Content */}
              <div className="flex-1 overflow-y-auto px-6 py-4.5 space-y-4 max-h-[calc(100vh-220px)]">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-20 px-4">
                    <ShoppingBag className="h-10 w-10 text-neutral-200 justify-center mb-4.5" />
                    <h4 className="font-display text-xs uppercase tracking-widest text-neutral-800 font-bold">
                      Your bag is empty
                    </h4>
                    <p className="font-sans text-xs text-neutral-400 mt-2 max-w-xs leading-relaxed">
                      Wander across our gallery showroom catalog to find exceptional masterworks.
                    </p>
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <div
                      key={`${item.product.id}-${item.size}-${idx}`}
                      className="flex items-center space-x-4 border border-gold-100 rounded-xl bg-white p-3.5 relative shadow-sm"
                    >
                      <div className="w-16 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-gold-100 bg-neutral-50">
                        <ProductImage
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 text-left min-w-0">
                        <span className="font-display text-[8px] tracking-widest uppercase text-gold-600 block mb-0.5">
                          {item.product.designer}
                        </span>
                        <h4 className="font-display text-xs uppercase font-bold text-neutral-900 truncate leading-snug">
                          {item.product.name}
                        </h4>
                        
                        {/* Selected options alerts */}
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {item.product.category === "apparel" && (
                            <span className="text-[9px] px-2 bg-neutral-100 text-neutral-700 font-display font-bold uppercase rounded py-0.5 border border-neutral-200">
                              Size {item.size}
                            </span>
                          )}
                          {item.engraving && (
                            <span className="text-[9px] px-2 bg-gold-50 text-gold-800 font-display font-medium rounded py-0.5 border border-gold-200 truncate max-w-[130px]">
                              "✍️ {item.engraving}"
                            </span>
                          )}
                        </div>

                        {/* Quantity and controls */}
                        <div className="flex items-center justify-between mt-3.5">
                          <div className="flex items-center border border-gold-200 rounded-lg overflow-hidden bg-white/50">
                            <button
                              onClick={() => updateCartQuantity(item.product.id, item.size, -1)}
                              className="px-2 py-1 text-neutral-500 hover:bg-neutral-50 text-xs focus:outline-none cursor-pointer"
                            >
                              -
                            </button>
                            <span className="px-3 text-xs font-sans text-neutral-900">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.product.id, item.size, 1)}
                              className="px-2 py-1 text-neutral-500 hover:bg-neutral-50 text-xs focus:outline-none cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                          
                          <span className="font-serif italic text-xs font-semibold text-neutral-950">
                            RS {(item.product.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Remove absolute node */}
                      <button
                        onClick={() => removeFromCart(item.product.id, item.size)}
                        className="absolute top-2 right-2 text-neutral-300 hover:text-red-500 transition-colors p-1 cursor-pointer"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Checkout Footer drawer portion */}
              {cart.length > 0 && (
                <div className="mt-auto px-6 py-5 border-t border-gold-150 bg-white/75 backdrop-blur-subtle space-y-4">
                  <div className="flex items-center justify-between text-left">
                    <div className="flex flex-col">
                      <span className="font-display text-[9px] uppercase tracking-widest text-[#666]">
                        ESTIMATED CART TOTAL
                      </span>
                      <span className="text-[10px] text-teal-600 font-sans mt-0.5 flex items-center leading-none">
                        <Sparkles className="h-2.5 w-2.5 mr-1" /> Custom fees & duty included
                      </span>
                    </div>
                    <span className="font-serif italic text-lg font-black text-neutral-950">
                      RS {totalAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <Link
                      href={checkoutUrl}
                      onClick={() => setCartOpen(false)}
                      className="w-full inline-flex items-center justify-center bg-neutral-950 hover:bg-neutral-900 text-[#faf9f6]/95 text-xs font-display uppercase tracking-widest font-black py-4 rounded-full shadow-lg transition-all active:scale-[0.98]"
                    >
                      proceed to checkout courier
                    </Link>
                    
                    <button
                      onClick={() => setCartOpen(false)}
                      className="w-full text-center text-[10px] font-display uppercase tracking-widest font-semibold text-neutral-500 hover:text-neutral-900 py-1 cursor-pointer"
                    >
                      continue exploring showroom
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
