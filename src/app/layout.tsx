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
  metadataBase: new URL(
    process.env.NEXT_APP_SITE_URL || "https://www.aroojarts.store"
  ),
  verification: {
    google: "ndUTc0wNMZMCJ9MHWLlT4rTxjezpfe-W2RYu2GWpKVs",
  },
  title: {
    default: "Arooj Arts | Premium Online Clothing Store in Pakistan",
    template: "%s | Arooj Arts",
  },

  description:
    "Arooj Arts is a premium online clothing store in Pakistan offering trendy women's fashion, designer lawn suits, pret wear, embroidered dresses & more styles.",

  openGraph: {
    title: "Arooj Arts | Premium Online Clothing Store in Pakistan",
    description:
      "Arooj Arts is a premium online clothing store in Pakistan offering trendy women's fashion, designer lawn suits, pret wear, embroidered dresses & more styles.",
    siteName: "Arooj Arts",
    locale: "en_US",
    type: "website",

    images: [
      {
        url: "/meta-logo.jpg",
        width: 1200,
        height: 630,
        alt: "Arooj Arts Logo",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Arooj Arts | Premium Online Clothing Store in Pakistan",
    description:
      "Arooj Arts is a premium online clothing store in Pakistan offering trendy women's fashion, designer lawn suits, pret wear, embroidered dresses & more styles.",
    images: ["/meta-logo.jpg"],
  },
  alternates: {
    canonical: "/",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Arooj Arts",
              url: process.env.NEXT_APP_SITE_URL,
              logo: `${process.env.NEXT_APP_SITE_URL}/meta-logo.jpg`,
              sameAs: [
                "https://instagram.com/yourpage",
                "https://facebook.com/yourpage",
                "https://pinterest.com/yourpage"
              ],
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+92xxxxxxxxxx",
                contactType: "customer service",
                areaServed: "PK",
                availableLanguage: ["English", "Urdu"]
              }
            }),
          }}
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
        <main className="flex-grow flex flex-col min-h-[calc(100vh-120px)]">
          {children}
        </main>

        {/* Dynamic footholds page footer */}
        <Footer />
      </body>
    </html>
  );
}
