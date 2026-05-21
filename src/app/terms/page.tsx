import React from "react";
import { getSettingsAction } from "../../actions/settings.actions";
import { BookOpen, HelpCircle, Sparkles } from "lucide-react";

export const revalidate = 0; // Fresh load

export default async function TermsPage() {
  const { settings } = await getSettingsAction();
  const termsText = settings?.terms_conditions || "All orders placed on Arooj Arts are subject to product availability. We offer standard courier delivery within 3-5 working days across Pakistan. Cash on delivery checkup terms apply.";

  return (
    <div className="bg-neutral-50 min-h-screen py-16 text-left">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white border border-gold-150 p-8 sm:p-12 rounded-3xl shadow-sm">
        
        <div className="border-b border-gold-100 pb-8 mb-8 text-center sm:text-left">
          <div className="inline-flex items-center space-x-1.5 bg-neutral-900 text-gold-300 text-[9px] font-display font-medium uppercase tracking-[0.25em] px-3.5 py-1.5 rounded mb-4">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Store Rules</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-black text-neutral-950 uppercase tracking-tight">
            Terms & Conditions
          </h1>
          <p className="font-sans text-sm text-neutral-500 mt-2">
            Please read our standard e-commerce store policies carefully before making any purchases.
          </p>
        </div>

        {/* Content Box */}
        <div className="prose prose-neutral max-w-none text-neutral-700 space-y-6 text-sm sm:text-base leading-relaxed">
          <p className="font-sans">
            By browsing our showroom website, ordering articles, or registry listing, you fully agree to follow these guidelines and terms of service.
          </p>
          
          <div className="p-5 bg-neutral-50 rounded-2xl border border-gold-100 font-sans italic text-sm text-neutral-600">
            {termsText}
          </div>

          <h2 className="font-display text-lg uppercase font-black text-neutral-900 pt-4">
            1. Order Placing & Verification
          </h2>
          <p className="font-sans">
            When you complete checkout, we will book your order in our backlog. If you select <strong>Cash on Delivery (COD)</strong>, our customer service agent may contact you via WhatsApp or phone call to verify your name, phone, and delivery address to avoid shipping returns. We reserve the right to decline unverified order submissions.
          </p>

          <h2 className="font-display text-lg uppercase font-black text-neutral-900 pt-4">
            2. Customer Delivery Timeframes
          </h2>
          <p className="font-sans">
            We deliver products everywhere in Pakistan. Standard processing takes 1-2 business days, and shipping transit takes 3-5 working days depending on your city. All delivery charges will be clearly displayed during checkout. Please inspect the outer packaging before signing and accepting the shipment.
          </p>

          <h2 className="font-display text-[15px] uppercase font-bold text-neutral-900 pt-4">
            3. Exchange and Refund Policy
          </h2>
          <p className="font-sans">
            We strictly inspect quality before packing items. In case of defects, sizing issues, or incorrect items, you can request an exchange under these criteria:
          </p>
          <ul className="list-disc pl-5 font-sans space-y-2">
            <li>You must file an exchange request within 7 days of receiving the parcel.</li>
            <li>The item must be unused, unwashed, and still in its original packaging with tags intact.</li>
            <li>Custom engraved objects or adjusted suits are not eligible for standard return or refund unless damaged on arrival.</li>
          </ul>

          <h2 className="font-display text-lg uppercase font-black text-neutral-900 pt-4">
            4. Pricing Modifications
          </h2>
          <p className="font-sans">
            Prices for our premium collection can change without any prior notification. However, your completed order bill will be locked and never subject to post-purchase edits.
          </p>
        </div>
      </div>
    </div>
  );
}
