"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useStore } from "../../store";
import { apiService } from "../../services/api";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { ProductImage } from "../../components/ui/ProductImage";
import { BadgeCheck, Sparkles, AlertCircle, ShoppingBag, Truck, ArrowLeft, Landmark, CheckCircle2 } from "lucide-react";

export default function CheckoutPage() {
  const { cart, clearCart, triggerNotification } = useStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Karachi");
  const [customCity, setCustomCity] = useState("");
  const [province, setProvince] = useState("Punjab");
  const [orderNotes, setOrderNotes] = useState("");

  const [phoneError, setPhoneError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  const totalAmount = cart.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0);

  // List of standard cities in Pakistan
  const pakistanCities = [
    { value: "Karachi", label: "Karachi" },
    { value: "Lahore", label: "Lahore" },
    { value: "Islamabad", label: "Islamabad" },
    { value: "Rawalpindi", label: "Rawalpindi" },
    { value: "Faisalabad", label: "Faisalabad" },
    { value: "Multan", label: "Multan" },
    { value: "Peshawar", label: "Peshawar" },
    { value: "Quetta", label: "Quetta" },
    { value: "Sialkot", label: "Sialkot" },
    { value: "Gujranwala", label: "Gujranwala" },
    { value: "Hyderabad", label: "Hyderabad" },
    { value: "Abbottabad", label: "Abbottabad" },
    { value: "other", label: "Other / Custom City" },
  ];

  // List of Provinces
  const pakistanProvinces = [
    { value: "Punjab", label: "Punjab" },
    { value: "Sindh", label: "Sindh" },
    { value: "Khyber Pakhtunkhwa", label: "Khyber Pakhtunkhwa (KPK)" },
    { value: "Balochistan", label: "Balochistan" },
    { value: "Islamabad Capital Territory", label: "Islamabad Capital Territory (ICT)" },
    { value: "Gilgit-Baltistan", label: "Gilgit-Baltistan" },
    { value: "Azad Jammu & Kashmir", label: "Azad Jammu & Kashmir (AJK)" },
  ];

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      triggerNotification("Your checkout cart holds no artifacts.");
      return;
    }

    // Phone Validation for Pakistani prefix or 11 digit local mobile
    const cleanPhone = phone.trim().replace(/[\s\-()]/g, "");
    const pkPhoneRegex = /^((\+92)|(92)|(0092))?3[0-9]{9}$/;
    const localPhoneRegex = /^03[0-9]{9}$/;

    const isValid = pkPhoneRegex.test(cleanPhone) || localPhoneRegex.test(cleanPhone);

    if (!isValid) {
      setPhoneError("Please enter a valid Pakistani mobile number (e.g., 03001234567 or +923001234567)");
      triggerNotification("Phone number validation failed.");
      return;
    }
    setPhoneError("");
    setIsLoading(true);

    try {
      const finalCity = city === "other" ? customCity.trim() : city;
      if (city === "other" && !finalCity) {
        triggerNotification("Please specify your custom city name.");
        setIsLoading(false);
        return;
      }

      // Format shipping address beautifully with all custom segments
      const formattedAddress = `${address.trim()}\nCity: ${finalCity}\nProvince: ${province}\nPhone: ${phone.trim()}${orderNotes.trim() ? `\nNotes: ${orderNotes.trim()}` : ""}`;

      const orderData = {
        customerName: name.trim(),
        customerEmail: email.trim(),
        shippingAddress: formattedAddress,
        items: cart.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          image: item.product.image,
          price: item.product.price,
          quantity: item.quantity,
        })),
        totalAmount,
        paymentMethod: "Cash on Delivery",
      };

      const registeredOrder = await apiService.createOrder(orderData);
      setPlacedOrder({
        ...registeredOrder,
        city: finalCity,
        province,
        phone,
        notes: orderNotes
      });
      clearCart();
      triggerNotification(`COD Order #${registeredOrder.id} successfully queued!`);
    } catch (error: any) {
      console.error(error);
      triggerNotification("Error finalizing shipping ledger. Please retry.");
    } finally {
      setIsLoading(false);
    }
  };

  if (placedOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center" id="checkout-finished-panel">
        <div className="w-16 h-16 rounded-full bg-gold-500/10 border border-gold-400 mx-auto flex items-center justify-center mb-8">
          <BadgeCheck className="h-8 w-8 text-gold-500 animate-pulse" />
        </div>

        <span className="font-display text-[10px] uppercase tracking-[0.25em] font-black text-gold-600 block mb-1">
          Order Confirmed
        </span>
        <h1 className="font-display text-2xl md:text-3.5xl uppercase tracking-tight text-neutral-950 font-bold mb-4">
          Your order has been placed successfully
        </h1>
        <p className="font-sans text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
          Thank you for your order, <strong>{placedOrder.customerName}</strong>. Your order <span className="font-mono text-[11px] font-bold text-neutral-900 bg-gold-100 rounded px-1.5 py-0.5">#{placedOrder.id}</span> has been confirmed and will be delivered on Cash on Delivery (COD).
        </p>

        <div className="bg-[#faf9f6] border border-gold-150 rounded-2xl p-6.5 my-10 text-left">
          <h4 className="font-display text-[9.5px] uppercase tracking-widest text-neutral-900 font-black border-b border-gold-150 pb-3 mb-4 flex items-center justify-between">
            <span>OFFICIAL ORDER SUMMARY</span>
            <span className="text-gold-600 text-[8.5px] font-mono tracking-normal bg-gold-100/60 px-2 py-0.5 rounded font-bold">Status: Processing</span>
          </h4>
          <div className="space-y-2.5 text-xs">
            <p className="text-neutral-500 flex justify-between">
              <span>Delivery Recipient:</span>
              <span className="text-neutral-950 font-medium">{placedOrder.customerName}</span>
            </p>
            <p className="text-neutral-500 flex justify-between">
              <span>Receipt Contact Email:</span>
              <span className="text-neutral-950 font-medium">{placedOrder.customerEmail}</span>
            </p>
            <p className="text-neutral-500 flex justify-between">
              <span>Recipient Phone:</span>
              <span className="text-neutral-950 font-mono font-medium">{placedOrder.phone || phone}</span>
            </p>
            <p className="text-neutral-500 flex justify-between">
              <span>Delivery Details:</span>
              <span className="text-neutral-950 font-medium text-right font-display text-[11px] uppercase tracking-wider">
                {placedOrder.city || city}, {placedOrder.province || province}
              </span>
            </p>
            <p className="text-neutral-500 flex flex-col pt-1.5">
              <span>Exact Shipping Address:</span>
              <span className="text-neutral-800 font-medium mt-1 bg-white border border-gold-100 p-2.5 rounded-lg text-[11px] leading-relaxed whitespace-pre-line font-mono">
                {address}
              </span>
            </p>
            {placedOrder.notes && (
              <p className="text-neutral-500 flex justify-between pt-1">
                <span>Special Instructions:</span>
                <span className="text-neutral-700 italic font-medium max-w-[200px] text-right truncate">{placedOrder.notes}</span>
              </p>
            )}
            <p className="text-neutral-500 flex justify-between pt-3 border-t border-dashed border-gold-200">
              <span>Payment Type:</span>
              <span className="text-amber-800 bg-amber-50 border border-amber-200 rounded px-2 text-[10px] uppercase font-semibold font-display tracking-widest">
                Cash on Delivery (COD)
              </span>
            </p>
            <p className="text-neutral-500 flex justify-between pt-3 text-sm font-semibold">
              <span>Total Amount:</span>
              <span className="font-serif italic text-neutral-950 font-extrabold text-[#151515]">
                ${placedOrder.totalAmount.toLocaleString()}
              </span>
            </p>
          </div>
        </div>

        <Link
          href="/collections"
          className="inline-flex items-center justify-center bg-neutral-950 hover:bg-neutral-800 text-white font-display text-[10px] uppercase font-bold tracking-[0.2em] px-8 py-4 px-10 rounded-full transition-all"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left" id="checkout-main-frame">
      <Link
        href="/collections"
        className="inline-flex items-center text-xs font-display uppercase tracking-widest text-neutral-500 hover:text-neutral-950 transition-colors mb-10"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        <span>Return to collections showroom</span>
      </Link>

      <div className="max-w-xl">
        <div className="inline-flex items-center space-x-2 bg-neutral-900 text-gold-350 text-[8px] font-display font-medium uppercase tracking-[0.2em] px-3.5 py-1.5 rounded mb-4">
          <Truck className="h-2.5 w-2.5 text-gold-400" />
          <span>Pakistan Cash On Delivery Enabled</span>
        </div>
        <h1 className="font-display text-2.5xl md:text-4.5xl uppercase tracking-tight text-neutral-950 font-black mb-4">
          Checkout <span className="font-serif italic font-light text-gold-600">Cash on Delivery (COD)</span>
        </h1>
        <p className="font-sans text-xs text-neutral-500 leading-relaxed mb-12">
          Fill in your details to place your order.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

        {/* Left Column: Checkout Inputs Form */}
        <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-8 text-left">

          {/* Customer Credentials */}
          <section className="space-y-5 shadow-sm border border-gold-150 rounded-2xl p-6.5 bg-white">
            <h3 className="font-display text-[9.5px] uppercase tracking-[0.2em] text-[#151515] font-black border-b border-gold-150 pb-3 mb-6">
              1. Customer Details
            </h3>
            <Input
              label="Full Name"
              placeholder="Full Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="Email Address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </section>

          {/* Shipping Details */}
          <section className="space-y-5 shadow-sm border border-gold-150 rounded-2xl p-6.5 bg-white">
            <h3 className="font-display text-[9.5px] uppercase tracking-[0.2em] text-[#151515] font-black border-b border-gold-150 pb-3 mb-6">
              2. Shipping Details
            </h3>

            {/* Pakistan Province Select */}
            <div className="flex flex-col space-y-2 text-left">
              <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-700">
                Province / Region
              </label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full bg-white border border-gold-200 rounded-xl px-4 py-3 font-sans text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-gold-450 cursor-pointer"
              >
                {pakistanProvinces.map((prov) => (
                  <option key={prov.value} value={prov.value}>
                    {prov.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Pakistan City Selection */}
            <div className="flex flex-col space-y-2 text-left">
              <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-700">
                City / Settlement
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-white border border-gold-200 rounded-xl px-4 py-3 font-sans text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-gold-450 cursor-pointer"
              >
                {pakistanCities.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom City text input, if "other" is selected */}
            {city === "other" && (
              <Input
                label="Custom City Name"
                placeholder="Type your city/town name here"
                required
                value={customCity}
                onChange={(e) => setCustomCity(e.target.value)}
              />
            )}

            {/* Recipient Phone with direct validation error feedback */}
            <div className="flex flex-col space-y-1">
              <Input
                label="Phone Number"
                type="tel"
                placeholder="0300XXXXXXX"
                required
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (phoneError) setPhoneError("");
                }}
              />
              {phoneError && (
                <span className="text-[10.5px] font-sans text-red-600 flex items-center gap-1.5 font-medium">
                  <AlertCircle className="h-3 w-3" />
                  {phoneError}
                </span>
              )}
            </div>

            {/* Physical home address */}
            <Input
              label="Full Address"
              placeholder="House address, street, area"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            {/* Order notes */}
            <div className="flex flex-col space-y-2 text-left">
              <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-700">
                Order Notes (Optional)
              </label>
              <textarea
                placeholder="e.g. Please deliver by afternoon, ring bell, or leave order with office reception."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                rows={3}
                className="w-full bg-white border border-gold-200 rounded-xl px-4 py-3 font-sans text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-gold-450 transition-all resize-none"
              />
            </div>
          </section>

          {/* COD Terms Info panel */}
          <section className="bg-neutral-50 border border-gold-150 p-6 rounded-2xl flex items-start space-x-4">
            <CheckCircle2 className="h-5 w-5 text-gold-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1.5">
              <h5 className="font-display text-[9.5px] uppercase tracking-widest font-black text-neutral-900">
                Cash on Delivery (COD)
              </h5>
              <p className="font-sans text-[11px] text-neutral-500 leading-relaxed">
                You will pay when your order is delivered. Our courier will contact you before delivery for confirmation. Please ensure your contact details are correct and that you have the total amount ready in cash at the time of delivery. COD orders may take slightly longer to process and deliver compared to prepaid orders. Thank you for choosing our doorstep delivery service!
              </p>
            </div>
          </section>

          <Button type="submit" size="lg" className="w-full h-14" isLoading={isLoading}>
            Confirm Order
          </Button>
        </form>

        {/* Right Column: Checkout Items Summary Panel */}
        <div className="lg:col-span-5 text-left">
          <div className="border border-gold-150 rounded-2xl p-6.5 bg-white/70 backdrop-blur-subtle shadow-sm sticky top-28 space-y-6">
            <h3 className="font-display text-[9.5px] uppercase tracking-[0.2em] text-[#151515] font-black border-b border-gold-150 pb-3">
              Order Summary
            </h3>

            {cart.length === 0 ? (
              <div className="text-center py-12">
                <p className="font-sans text-xs text-neutral-400">Your cart is empty</p>
                <Link
                  href="/collections"
                  className="font-display text-[9px] uppercase tracking-widest font-black text-gold-600 block mt-2 hover:underline"
                >
                  Browse products to add items to your cart
                </Link>
              </div>
            ) : (
              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between space-x-3 text-xs border-b border-neutral-100/50 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div className="w-10 h-13 rounded overflow-hidden flex-shrink-0 border border-gold-100 bg-neutral-50">
                        <ProductImage src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
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

            {/* Calculation summary */}
            <div className="border-t border-gold-150 pt-5 space-y-3.5 text-xs text-neutral-500">
              <p className="flex justify-between">
                <span>Delivery Fee:</span>
                <span className="text-teal-600 font-medium uppercase text-[9px] tracking-widest bg-teal-50 border border-teal-200 px-2 rounded">Free</span>
              </p>
              <p className="flex justify-between">
                <span>Value Added Taxes / Customs:</span>
                <span className="text-[#151515] font-medium">Included</span>
              </p>
              <div className="border-t border-dashed border-gold-200 pt-4.5">
                <p className="flex justify-between text-neutral-950 font-serif italic text-base font-bold">
                  <span>Total Payable (COD):</span>
                  <span>RS {totalAmount.toLocaleString()}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
