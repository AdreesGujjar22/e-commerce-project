import React, { ReactNode } from "react";
import "../index.css";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { CartDrawer } from "../components/cart/CartDrawer";
import { AuraChat } from "../components/chat/AuraChat";
import { ProductDetailModal } from "../components/product/ProductDetailModal";
import WhatsAppChatWidget from "../components/WhatsAppChatWidget";

import { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_APP_SITE_URL,
  title: {
    default: "Arooj Arts — Premium Showroom & Curations",
    template: "%s | Arooj Arts",
  },
  description: "Curators of fine Italian silk trench coats, surgical steel timepieces, raw travertines, and exotic sandalwood extraits.",
  openGraph: {
    title: "Arooj Arts — Showroom & Curations",
    description: "Curators of fine Italian silk trench coats, surgical steel timepieces, raw travertines, and exotic sandalwood extraits.",
    siteName: "Arooj Arts",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: '/meta-logo.jpg',
        width: 1200,
        height: 630,
        alt: `arooj arts web logo`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Arooj Arts — Showroom & Curations",
    description: "Curators of fine Italian silk trench coats, surgical steel timepieces, raw travertines, and exotic sandalwood extraits.",
    images: ['/meta-logo.jpg'],
  },
  icons: {
    icon: "/fav-icon.png",
  },
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,100..900;1,100..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Space+Grotesk:wght@300..700&display=swap"
        />
      </head>
      <body className="bg-[#faf9f6] text-neutral-900 font-sans min-h-screen flex flex-col antialiased selection:bg-gold-500/20 selection:text-neutral-900">
        <WhatsAppChatWidget />
        {/* Dynamic Navigations bar */}
        <Navbar />

        {/* Global Slideout Cabinets for Shopping & AI Client interaction */}
        <CartDrawer />
        <AuraChat />
        <ProductDetailModal />

        {/* Primary Page viewport */}
        <main className="flex-grow flex flex-col">{children}</main>

        {/* Dynamic footholds page footer */}
        <Footer />
      </body>
    </html>
  );
}
