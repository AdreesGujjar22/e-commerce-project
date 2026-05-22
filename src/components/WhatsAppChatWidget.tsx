"use client";

import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import Image from "next/image";

export default function WhatsAppChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        const timer = setTimeout(() => {
            setIsOpen(true);
        }, 3500);

        return () => clearTimeout(timer);
    }, []);

    // Prevent hydration mismatch
    if (!mounted) return null;

    const whatsappNumber = "+923038084601";

    const message = encodeURIComponent(
        "Hi! I’m interested in your products. Can you help me?"
    );

    return (
        <>
            {/* Chat Popup */}
            <div
                className={`fixed bottom-24 right-4 z-[9999] transition-all duration-500 ${isOpen
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4 pointer-events-none"
                    }`}
            >
                <div className="w-[290px] rounded-2xl overflow-hidden shadow-2xl border border-neutral-200 bg-white">
                    {/* Header */}
                    <div className="bg-[#075E54] px-4 py-3 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <Image
                                    src="/whatsapp-icon.png"
                                    alt="WhatsApp"
                                    width={35}
                                    height={35}
                                    className="object-contain"
                                    priority
                                />
                            </div>

                            <div>
                                <h3 className="text-white text-sm font-bold tracking-wide">
                                    Store Support
                                </h3>

                                <p className="text-white/90 text-[11px]">
                                    Usually replies within minutes
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/80 hover:text-white transition cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Message */}
                    <div className="bg-[#f7f5f2] px-4 py-5">
                        <div className="bg-white rounded-xl px-3 py-2 shadow-sm max-w-[85%]">
                            <p className="text-[13px] text-neutral-700 leading-relaxed">
                                👋 Welcome to our store! Need help with products, orders, or
                                sizing?
                            </p>
                        </div>
                    </div>

                    {/* Action */}
                    <div className="p-4 bg-white">
                        <a
                            href={`https://wa.me/${whatsappNumber}?text=${message}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full h-11 rounded-xl bg-[#075E54] hover:bg-[#097467] transition-all text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm"
                        >
                            <MessageCircle className="w-4 h-4 fill-white" />
                            Start WhatsApp Chat
                        </a>

                        <p className="text-center text-[10px] text-neutral-400 mt-2">
                            Powered by your support team
                        </p>
                    </div>
                </div>
            </div>

            {/* Floating Button */}
            <button
                onClick={() => setIsOpen((prev) => !prev)}
                className="fixed bottom-5 right-4 z-[9999] w-14 h-14 rounded-full bg-[#075E54] hover:bg-[#097467] shadow-2xl flex items-center justify-center transition-all active:scale-95"
            >
                <Image
                    src="/whatsapp-icon.png"
                    alt="WhatsApp"
                    width={35}
                    height={35}
                    className="object-contain"
                    priority
                />
            </button>
        </>
    );
}