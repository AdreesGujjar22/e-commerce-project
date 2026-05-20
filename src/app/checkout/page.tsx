"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useStore } from "../../store";
import { apiService } from "../../services/api";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { BadgeCheck, Sparkles, AlertCircle, ShoppingBag, Landmark, ArrowLeft, Loader } from "lucide-react";

export default function CheckoutPage() {
  const { cart, clearCart, triggerNotification } = useStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  const totalAmount = cart.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      triggerNotification("Your checkout cart holds no artifacts.");
      return;
    }

    setIsLoading(true);

    try {
      const orderData = {
        customerName: name,
        customerEmail: email,
        shippingAddress: address,
        items: cart.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          image: item.product.image,
          price: item.product.price,
          quantity: item.quantity,
        })),
        totalAmount,
      };

      const registeredOrder = await apiService.createOrder(orderData);
      setPlacedOrder(registeredOrder);
      clearCart();
      triggerNotification(`Certificate order #${registeredOrder.id} generated!`);
    } catch (error) {
      console.error(error);
      triggerNotification("Error finalizing shipping ledger. Please retry.");
    } finally {
      setIsLoading(false);
    }
  };

  if (placedOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-gold-500/10 border border-gold-400 mx-auto flex items-center justify-center mb-8">
          <BadgeCheck className="h-8 w-8 text-gold-500 animate-bounce" />
        </div>
        
        <span className="font-display text-[10px] uppercase tracking-[0.25em] font-black text-gold-600 block mb-1">
          order finalized successfully
        </span>
        <h1 className="font-display text-2xl md:text-3.5xl uppercase tracking-tight text-neutral-950 font-bold mb-4">
          PATRON REGISTER GENERATED
        </h1>
        <p className="font-sans text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
          Stewardship congratulations, <strong>{placedOrder.customerName}</strong>. Your custom shipping ledger for order <span className="font-mono text-[11px] font-bold text-neutral-900 bg-gold-100 rounded px-1.5 py-0.5">#{placedOrder.id}</span> is generated.
        </p>

        <div className="bg-[#faf9f6] border border-gold-150 rounded-2xl p-6 my-10 text-left">
          <h4 className="font-display text-[9px] uppercase tracking-widest text-[#151515] font-black border-b border-gold-150 pb-3 mb-4">
            REGISTRY SHIPPMENT LEDGER INFO
          </h4>
          <div className="space-y-2 text-xs">
            <p className="text-neutral-500 flex justify-between">
              <span>Delivery Recipient:</span>
              <span className="text-neutral-950 font-medium">{placedOrder.customerName}</span>
            </p>
            <p className="text-neutral-500 flex justify-between">
              <span>Receipt Contact Email:</span>
              <span className="text-neutral-950 font-medium">{placedOrder.customerEmail}</span>
            </p>
            <p className="text-neutral-500 flex justify-between">
              <span>Secured Courier Address:</span>
              <span className="text-neutral-950 font-medium text-right truncate max-w-[220px]">{placedOrder.shippingAddress}</span>
            </p>
            <p className="text-neutral-500 flex justify-between pt-3 border-t border-dashed border-gold-200">
              <span>Vouchsafed Total Remitted:</span>
              <span className="font-serif italic text-neutral-950 font-bold">${placedOrder.totalAmount.toLocaleString()}</span>
            </p>
          </div>
        </div>

        <Link
          href="/collections"
          className="inline-flex items-center justify-center bg-neutral-950 hover:bg-neutral-800 text-white font-display text-[10px] uppercase font-bold tracking-[0.2em] px-8 py-4 px-10 rounded-full transition-all"
        >
          return to showroom gallery
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left">
      <Link
        href="/collections"
        className="inline-flex items-center text-xs font-display uppercase tracking-widest text-neutral-500 hover:text-neutral-950 transition-colors mb-10"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        <span>Return to collections</span>
      </Link>

      <h1 className="font-display text-2.5xl md:text-4.5xl uppercase tracking-tight text-neutral-950 font-black mb-12 border-b border-gold-150 pb-6">
        BESPOKE CHECKOUT <span className="font-serif italic font-light text-gold-600">Secure Courier</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Checkout Inputs Form */}
        <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-8 text-left">
          
          {/* Customer Credentials */}
          <section className="space-y-5 shadow-sm border border-gold-150 rounded-2xl p-6.5 bg-white">
            <h3 className="font-display text-[9.5px] uppercase tracking-[0.2em] text-[#151515] font-black border-b border-gold-150 pb-3 mb-6">
              1. PATRON COURIER PARTICULARS
            </h3>
            <Input
              label="Recipient Full Name"
              placeholder="e.g. Lady Evelyn Sterling"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Recipient Alert Email"
              type="email"
              placeholder="e.g. evelyn@sterling-hall.co"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Insured Courier Shipping Address"
              placeholder="e.g. 14 Mayfair Gardens, London, UK"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </section>

          {/* Secure Payment details placeholder */}
          <section className="space-y-5 shadow-sm border border-gold-150 rounded-2xl p-6.5 bg-white">
            <h3 className="font-display text-[9.5px] uppercase tracking-[0.2em] text-[#151515] font-black border-b border-gold-150 pb-3 mb-6 flex items-center justify-between">
              <span>2. ESCROW GUARANTEED SETTLEMENT</span>
              <Landmark className="h-4 w-4 text-gold-500" />
            </h3>
            
            <Input
              label="Guaranteed Credit Card Number"
              placeholder="4111 2222 3333 4444"
              required
              maxLength={19}
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="MM / YY"
                placeholder="12/28"
                required
                maxLength={5}
                value={cardExpiry}
                onChange={(e) => setCardExpiry(e.target.value)}
              />
              <Input
                label="CVV Code"
                type="password"
                placeholder="***"
                required
                maxLength={4}
                value={cardCvc}
                onChange={(e) => setCardCvc(e.target.value)}
              />
            </div>
          </section>

          <Button type="submit" size="lg" className="w-full h-14" isLoading={isLoading}>
            Submit Vault Order Remittance
          </Button>
        </form>

        {/* Right Column: Checkout Items Summary Panel */}
        <div className="lg:col-span-5 text-left">
          <div className="border border-gold-150 rounded-2xl p-6.5 bg-white/70 backdrop-blur-subtle shadow-sm sticky top-28 space-y-6">
            <h3 className="font-display text-[9.5px] uppercase tracking-[0.2em] text-[#151515] font-black border-b border-gold-150 pb-3">
              YOUR INQUIRED LEDGER
            </h3>

            {cart.length === 0 ? (
              <div className="text-center py-12">
                <p className="font-sans text-xs text-neutral-400">Your collection bag is empty.</p>
                <Link
                  href="/collections"
                  className="font-display text-[9px] uppercase tracking-widest font-black text-gold-600 block mt-2 hover:underline"
                >
                  go back to catalog
                </Link>
              </div>
            ) : (
              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between space-x-3 text-xs">
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div className="w-10 h-13 rounded overflow-hidden flex-shrink-0 border border-gold-100 bg-neutral-50">
                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="text-left min-w-0">
                        <h4 className="font-display text-[11px] uppercase font-bold text-neutral-900 truncate">{item.product.name}</h4>
                        <p className="text-[10px] text-neutral-400 font-sans mt-0.5">Qty {item.quantity} · Size {item.size}</p>
                      </div>
                    </div>
                    <span className="font-serif italic font-semibold text-neutral-900">
                      ${(item.product.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Calculations summaries */}
            <div className="border-t border-gold-150 pt-5 space-y-3.5 text-xs text-neutral-500">
              <p className="flex justify-between">
                <span>Insured Courier Delivery fee:</span>
                <span className="text-teal-600 font-medium uppercase text-[9px] tracking-widest bg-teal-50 border border-teal-200 px-2 rounded">Complimentary</span>
              </p>
              <p className="flex justify-between">
                <span>Value Added Taxes & Customs Duties:</span>
                <span className="text-[#151515] font-medium">Included</span>
              </p>
              <p className="flex justify-between text-neutral-950 font-serif italic text-base font-bold pt-4.5 border-t border-dashed border-gold-200">
                <span>Estimated aggregate total:</span>
                <span>${totalAmount.toLocaleString()}</span>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
