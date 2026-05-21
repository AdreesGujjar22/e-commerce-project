"use client";

import React, { useState, useRef, useEffect } from "react";
import { useStore } from "../../store";
import { apiService } from "../../services/api";
import { ChatMessage } from "../../types";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, X, Send, ArrowRight, User, Compass, HelpCircle } from "lucide-react";

export const AuraChat: React.FC = () => {
  const { isChatOpen, setChatOpen, triggerNotification } = useStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Welcome to Maison L'Étoile, patron. I am Aura, your private AI Styling Concierge. I am expert in our silk garments, bespoke timepieces, luxury fragrances, and custom home stones. How may I tailormake your design experience today?",
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const prompts = [
    "Recommend a fragrance overlay for a formal gala",
    "Describe the material density of the silk trench",
    "What home accents pair well with travertine pedestals",
    "Tell me about Atelier Chronos craftsmanship",
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputVal("");
    setIsLoading(true);

    try {
      const reply = await apiService.sendMessageToConcierge(updatedMessages);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (error) {
      console.error("AI Concierge error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Deeply sorry, patron, I encountered a temporary friction while consulting our atelier records. Please retry your inquiry shortly.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend(inputVal);
    }
  };

  return (
    <AnimatePresence>
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 z-55 w-full max-w-md h-[580px] px-4 sm:px-0">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="w-full h-full bg-[#faf9f6] border border-gold-300 shadow-2xl rounded-2xl overflow-hidden flex flex-col"
          >
            {/* Elegant Header */}
            <div className="bg-neutral-950 px-5.5 py-4.5 flex items-center justify-between text-left">
              <div className="flex items-center space-x-2.5">
                <div className="w-8.5 h-8.5 rounded-full bg-gold-500/10 border border-gold-400 flex items-center justify-center">
                  <Sparkles className="h-4.5 w-4.5 text-gold-400 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-display text-[10px] uppercase tracking-widest text-[#faf9f6]/95 font-bold">
                    Aura Styling Concierge
                  </h4>
                  <p className="font-serif text-[8.5px] italic text-gold-300">
                    Live server-side AI stylist powered by Gemini
                  </p>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="text-neutral-400 hover:text-white transition-colors p-1"
                aria-label="Minimise AI dialogue"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Suggestions / Prompt helpers scroll */}
            {messages.length === 1 && (
              <div className="px-5 py-3 border-b border-gold-150 bg-gold-50/30 text-left">
                <span className="font-display text-[8.5px] uppercase tracking-wider text-neutral-400 font-bold block mb-2 leading-none">
                  PATRON SELECT SUGGESTED PROMPTS
                </span>
                <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth">
                  {prompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(p)}
                      className="text-[9.5px] font-sans text-neutral-600 hover:text-neutral-950 bg-white hover:bg-gold-50 border border-gold-200 hover:border-gold-300 px-3.5 py-1.5 rounded-full text-left whitespace-nowrap transition-all focus:outline-none flex-shrink-0"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Dialogue Bubble viewport */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-white/70 backdrop-blur-subtle scroll-smooth text-left"
            >
              {messages.map((msg, i) => {
                const isAssistant = msg.role === "assistant";
                return (
                  <div
                    key={i}
                    className={`flex items-start ${isAssistant ? "justify-start" : "justify-end"}`}
                  >
                    {isAssistant && (
                      <div className="w-7.5 h-7.5 rounded-full bg-neutral-950 text-gold-400 flex items-center justify-center mr-2.5 flex-shrink-0 border border-gold-400/20">
                        <Sparkles className="h-3.5 w-3.5" />
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${isAssistant
                          ? "bg-[#faf9f6] text-neutral-950 border border-gold-150 rounded-tl-none font-sans"
                          : "bg-neutral-900 text-[#faf9f6] rounded-tr-none font-sans font-medium shadow-sm"
                        }`}
                    >
                      {msg.content.split("\n").map((line, idx) => {
                        const productMatch = line.match(/•\s(.+)\s-\s\$(\d+)\s\((\/products\/.+)\)/);

                        if (productMatch) {
                          const [, name, price, url] = productMatch;

                          return (
                            <div key={idx} className="mb-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-medium text-neutral-900">
                                  {name}
                                </span>

                                <span className="text-gold-500 font-semibold">
                                  ${price}
                                </span>
                              </div>

                              <a
                                href={url}
                                className="text-[11px] text-blue-600 underline mt-0.5 inline-block"
                              >
                                View Product →
                              </a>
                            </div>
                          );
                        }

                        return (
                          <p key={idx} className="mb-1">
                            {line}
                          </p>
                        );
                      })}
                    </div>

                    {!isAssistant && (
                      <div className="w-7.5 h-7.5 rounded-full bg-gold-500 text-neutral-950 flex items-center justify-center ml-2.5 flex-shrink-0 font-display text-[10px] uppercase font-bold">
                        me
                      </div>
                    )}
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-start justify-start">
                  <div className="w-7.5 h-7.5 rounded-full bg-neutral-950 text-gold-400 flex items-center justify-center mr-2.5 flex-shrink-0 animate-pulse">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <div className="bg-[#faf9f6] text-neutral-500 border border-gold-150 rounded-2xl rounded-tl-none px-4 py-3 text-xs flex items-center space-x-2">
                    <span className="dot animate-bounce bg-gold-500 w-1.5 h-1.5 rounded-full" />
                    <span className="dot animate-bounce delay-100 bg-gold-500 w-1.5 h-1.5 rounded-full" style={{ animationDelay: "0.2s" }} />
                    <span className="dot animate-bounce delay-200 bg-gold-500 w-1.5 h-1.5 rounded-full" style={{ animationDelay: "0.4s" }} />
                  </div>
                </div>
              )}
            </div>

            {/* Message input segment */}
            <div className="px-5 py-4.5 border-t border-gold-150 bg-[#faf9f6]/90 flex items-center space-x-3.5">
              <input
                type="text"
                placeholder="Inquire about high-end couture..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="flex-1 bg-white text-neutral-950 placeholder-neutral-400 font-sans text-xs px-4.5 py-3 border border-gold-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-400/80 transition-all text-left disabled:bg-neutral-50"
              />
              <button
                onClick={() => handleSend(inputVal)}
                disabled={isLoading || !inputVal.trim()}
                className="w-10 h-10 rounded-full bg-neutral-900 hover:bg-gold-500 text-white hover:text-neutral-950 flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-90 flex-shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
