"use client";

import React, { useState } from "react";
import { Button } from "../ui/Button";
import { Send, FileCheck, HelpCircle } from "lucide-react";

export const ContactForm: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("general");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate sending message to curator systems
    await new Promise((resolve) => setTimeout(resolve, 1200));
    
    setIsLoading(false);
    setSubmitted(true);
    setName("");
    setEmail("");
    setMessage("");
  };

  if (submitted) {
    return (
      <div className="bg-white border border-gold-200 p-8 rounded-3xl text-center flex flex-col items-center justify-center min-h-[400px] animate-fadeIn">
        <div className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center text-gold-700 mb-6 border border-gold-200">
          <FileCheck className="h-5.5 w-5.5" />
        </div>
        <h3 className="font-display text-[11px] uppercase tracking-[0.25em] font-black text-gold-600 block mb-1">
          Inquiry transmission successfully logged
        </h3>
        <h4 className="font-display text-lg uppercase font-bold text-neutral-950 mb-3">
          TICKET DEPOSIT RECEIVED
        </h4>
        <p className="font-sans text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed">
          Your inquiry has been cataloged in our support ledger. One of our lead curators will inspect the request and respond within 24 working hours.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-8 font-display text-[10px] uppercase tracking-widest font-black text-neutral-950 border-b-2 border-gold-400 hover:border-neutral-950 pb-1 cursor-pointer transition-all"
        >
          send another communication
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gold-150 p-6.5 sm:p-8 rounded-3xl shadow-sm text-left">
      <h3 className="font-display text-lg uppercase font-black text-neutral-950 tracking-wide border-b border-neutral-100 pb-4 mb-6">
        Log an Inquiry Ticket
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col space-y-2">
          <label className="text-[9.5px] uppercase tracking-wider font-bold text-neutral-600">
            Your Full Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Lady Evelyn Sterling"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-neutral-50 border border-gold-200 rounded-xl px-4 py-3 font-sans text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-gold-450 focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-[9.5px] uppercase tracking-wider font-bold text-neutral-600">
            Your Email Address
          </label>
          <input
            type="email"
            required
            placeholder="e.g. evelyn@sterling-hall.co"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-neutral-50 border border-gold-200 rounded-xl px-4 py-3 font-sans text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-gold-450 focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-[9.5px] uppercase tracking-wider font-bold text-neutral-600">
            Inquiry Subject Classification
          </label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="bg-neutral-50 border border-gold-200 rounded-xl px-4 py-3 font-sans text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-gold-450 focus:bg-white cursor-pointer"
          >
            <option value="general">General Showroom Query</option>
            <option value="delivery">COD Delivery Logistics</option>
            <option value="certificate">Masterwork Certificate Verification</option>
            <option value="bespoke">Bespoke Fitting & Tailoring</option>
          </select>
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-[9.5px] uppercase tracking-wider font-bold text-neutral-600">
            Detailed Message Statement
          </label>
          <textarea
            required
            rows={4}
            placeholder="Please write the details of your inquiry here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="bg-neutral-50 border border-gold-200 rounded-xl px-4 py-3 font-sans text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-gold-450 focus:bg-white transition-all resize-none"
          />
        </div>

        <Button type="submit" className="w-full h-12" isLoading={isLoading}>
          <Send className="h-3.5 w-3.5 mr-2" /> Submit Inquiry Statement
        </Button>
      </form>
    </div>
  );
};
