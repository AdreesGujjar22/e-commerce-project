import React from "react";
import { getSettingsAction } from "../../actions/settings.actions";
import { ShieldAlert, BookOpen, Clock } from "lucide-react";

export const revalidate = 0; // Fresh load

export default async function PrivacyPage() {
  const { settings } = await getSettingsAction();
  const policyText = settings?.privacy_policy || "We respect your privacy. We collect your email and delivery details only to deliver your orders and improve our customer service. Your data is 100% secure with us.";

  return (
    <div className="bg-neutral-50 min-h-screen py-16 text-left">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white border border-gold-150 p-8 sm:p-12 rounded-3xl shadow-sm">
        
        <div className="border-b border-gold-100 pb-8 mb-8 text-center sm:text-left">
          <div className="inline-flex items-center space-x-1.5 bg-neutral-900 text-gold-300 text-[9px] font-display font-medium uppercase tracking-[0.25em] px-3.5 py-1.5 rounded mb-4">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Customer Security</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-black text-neutral-950 uppercase tracking-tight">
            Privacy Policy
          </h1>
          <p className="font-sans text-sm text-neutral-500 mt-2 flex items-center justify-center sm:justify-start gap-1">
            <Clock className="h-4 w-4" />
            <span>Updated May 2026. Official Privacy and Safety Policy.</span>
          </p>
        </div>

        {/* Content Box */}
        <div className="prose prose-neutral max-w-none text-neutral-700 space-y-6 text-sm sm:text-base leading-relaxed">
          <p className="font-sans">
            Welcome to <strong>Arooj Arts</strong>. We are committed to protecting your personal information and your privacy. This page explains what information we collect, how we use it, and what rights you have in relation to it.
          </p>
          
          <div className="p-5 bg-neutral-50 rounded-2xl border border-gold-100 font-sans italic text-sm text-neutral-600">
            {policyText}
          </div>

          <h2 className="font-display text-lg uppercase font-black text-neutral-900 pt-4">
            1. What Information Do We Collect?
          </h2>
          <p className="font-sans">
            We collect personal information that you voluntarily provide to us when you register on our store, place an order, or contact us. This includes:
          </p>
          <ul className="list-disc pl-5 font-sans space-y-2">
            <li>Your Name, Email Address, and Phone Number.</li>
            <li>Your delivery/shipping address across Pakistan.</li>
            <li>Order history, items purchased, and support chat messages.</li>
          </ul>

          <h2 className="font-display text-lg uppercase font-black text-neutral-900 pt-4">
            2. How Do We Use Your Data?
          </h2>
          <p className="font-sans">
            We use your personal data for clear, professional commercial activities, including:
          </p>
          <ul className="list-disc pl-5 font-sans space-y-2">
            <li>Processing your orders, payments, refunds, and packing.</li>
            <li>Sending shipping notifications, tracking codes, and status updates via SMS or email.</li>
            <li>Responding to customer queries, tailoring clothing fitments, or custom engraving messages.</li>
          </ul>

          <h2 className="font-display text-lg uppercase font-black text-neutral-900 pt-4">
            3. Data Sharing with Courier Partners
          </h2>
          <p className="font-sans">
            We only share your shipping coordinates and phone numbers with our verified third-party courier services (such as TCS, Leopards, or M&P) to deliver your premium apparel or accents safely to your doorstep. We never sell your personal information to third-party advertisers.
          </p>

          <h2 className="font-display text-lg uppercase font-black text-neutral-900 pt-4">
            4. Security and Safety
          </h2>
          <p className="font-sans">
            Your data is stored securely. Our platform operates with SSL encryption to protect data transmission. Your credentials and delivery logs remain fully guarded. If you wish to delete your account or change your addresses, please feel free to reach out to our team at any time.
          </p>
        </div>
      </div>
    </div>
  );
}
