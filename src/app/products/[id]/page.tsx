import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { getProductByIdAction, getProductsAction } from "../../../actions/product.actions";
import { ArrowLeft, Compass, Sparkles, ShieldCheck, Check, Star } from "lucide-react";
import { DynamicJsonLd } from "../../../components/seo/DynamicJsonLd";
import { MaisonImage } from "../../../components/ui/MaisonImage";

export const revalidate = 60; // Cache product pages for 60 seconds

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

// 1. Next.js Dynamic Metadata generation for Product Page
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const res = await getProductByIdAction(id);
  const product = res.product;

  if (!product) {
    return {
      title: "Curation Not Found | Maison l'Étoile",
      description: "The requested exhibition piece is not active in our catalog.",
    };
  }

  const title = `${product.name} — ${product.designer} | Maison l'Étoile`;
  const description = product.description || `Explore the exquisite ${product.name} by designer ${product.designer} at Maison l'Étoile.`;
  const canonicalUrl = `https://ais-dev-cgwlfgq4uevdr35b2ix4qe-922378778819.asia-southeast1.run.app/products/${product.id}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Maison l'Étoile",
      images: [
        {
          url: product.image,
          width: 1200,
          height: 630,
          alt: `${product.name} by ${product.designer}`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [product.image],
    },
  };
}

// 2. Generate Static Params for build optimization & fast load times
export async function generateStaticParams() {
  const res = await getProductsAction();
  const products = res.products || [];
  return products.map((product) => ({
    id: product.id,
  }));
}

export default async function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const res = await getProductByIdAction(id);
  const product = res.product;

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center" id="product-not-found-container">
        <h1 className="font-display text-2xl uppercase tracking-wider text-neutral-900 font-bold">
          EXHIBIT ITEM NOT SPECIFIED
        </h1>
        <p className="font-sans text-xs text-neutral-500 mt-2 mb-8">
          The curated artifact is not present in our vaults or may have been securely transferred.
        </p>
        <Link
          href="/collections"
          className="inline-flex items-center text-xs font-display uppercase tracking-widest text-gold-600 hover:text-gold-700 underline"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span>return to complete catalog</span>
        </Link>
      </div>
    );
  }

  // Create JSON-LD Product schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.image,
    "description": product.description,
    "brand": {
      "@type": "Brand",
      "name": product.designer,
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "price": product.price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "url": `https://ais-dev-cgwlfgq4uevdr35b2ix4qe-922378778819.asia-southeast1.run.app/products/${product.id}`,
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.rating || 5.0,
      "reviewCount": product.reviews?.length || 1,
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left" id={`product-detail-frame-${product.id}`}>
      {/* Inject Structured Metadata schema via dynamic helper component */}
      <DynamicJsonLd data={jsonLd} />

      {/* Back button */}
      <Link
        href="/collections"
        className="inline-flex items-center text-xs font-display uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition-colors mb-10"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        <span>back to collections showroom</span>
      </Link>

      {/* Core Dynamic Product Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        
        {/* Left Aspect: High-Definition Curation Photo Frame */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-gold-150 bg-neutral-50 shadow-sm group">
            <MaisonImage
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-103"
            />
            <span className="absolute bottom-5 right-5 bg-neutral-950/90 text-white font-mono text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-md border border-white/10">
              verified authentic
            </span>
          </div>
        </div>

        {/* Right Aspect: Detailed Spec & Curation Sheet */}
        <div className="lg:col-span-6 space-y-8">
          
          {/* Header metadata */}
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-neutral-900 text-gold-300 text-[8.5px] font-display font-black uppercase tracking-[0.25em] px-3.5 py-1.5 rounded mb-4.5">
              <Compass className="h-3 w-3" />
              <span>{product.category} · curation index</span>
            </div>
            
            <h1 className="font-display text-3.5xl md:text-5xl uppercase tracking-tight text-neutral-950 font-black">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-1.5 mt-2">
              <span className="font-sans text-[11px] text-neutral-400 capitalize">curated designer:</span>
              <span className="font-display text-xs uppercase tracking-widest text-stone-800 font-bold">
                {product.designer}
              </span>
            </div>
          </div>

          {/* Pricing ledger */}
          <div className="border-t border-b border-gold-150 py-5.5 flex justify-between items-center bg-[#faf9f6]/40 px-4 rounded-xl">
            <div className="space-y-0.5">
              <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold block">remittance value</span>
              <span className="font-serif italic text-2.5xl md:text-3xl font-black text-neutral-950">
                ${product.price.toLocaleString()}
              </span>
            </div>
            
            <div className="text-right">
              {product.stock > 0 ? (
                <div className="flex flex-col items-end">
                  <span className="bg-teal-50 border border-teal-200 text-teal-800 text-[9.5px] font-display uppercase tracking-widest font-black px-3 py-1 rounded-full flex items-center">
                    <Sparkles className="h-2.5 w-2.5 mr-1" /> available to dispatch
                  </span>
                  <span className="text-[10px] text-neutral-400 mt-1 font-sans">{product.stock} units secured in vault</span>
                </div>
              ) : (
                <span className="bg-neutral-100 border border-neutral-200 text-neutral-400 text-[9.5px] font-display uppercase tracking-widest font-bold px-3 py-1 rounded-full">
                  entirely sold out
                </span>
              )}
            </div>
          </div>

          {/* Descriptive Content */}
          <div className="space-y-4">
            <h3 className="font-display text-[10px] uppercase tracking-widest font-black text-neutral-950">
              exhibition synopsis
            </h3>
            <p className="font-sans text-xs text-neutral-500 leading-relaxed font-normal">
              {product.description}
            </p>
            <p className="font-sans text-xs text-neutral-600 leading-relaxed bg-stone-50 p-4 rounded-xl border border-neutral-100 italic">
              {product.longDescription}
            </p>
          </div>

          {/* Tailored specs / details */}
          {product.details && product.details.length > 0 && (
            <div className="space-y-3.5">
              <h3 className="font-display text-[10px] uppercase tracking-widest font-black text-neutral-950">
                Material & masterwork certificate
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {product.details.map((detail, idx) => (
                  <li key={idx} className="flex items-start text-xs text-neutral-500">
                    <Check className="h-4 w-4 text-gold-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Back guarantees */}
          <div className="border border-gold-150 rounded-2xl p-5 border-dashed space-y-3 bg-white/50">
            <h4 className="font-display text-[9px] uppercase tracking-widest font-bold text-neutral-900 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-gold-600" />
              <span>maison protection program</span>
            </h4>
            <p className="font-sans text-[11px] text-neutral-400 leading-relaxed">
              Every curated item delivery comes standard with a leather authenticity folder, private masterwork certificate, and standard 3-year mechanical or design insurance.
            </p>
          </div>

          {/* Action Call for collections */}
          <div className="pt-4">
            <Link
              href="/collections"
              className="w-full inline-flex items-center justify-center bg-neutral-950 text-white font-display text-[10px] uppercase tracking-[0.25em] font-black h-13 rounded-full hover:bg-neutral-800 transition-all active:scale-99 shadow-sm"
            >
              inquire & purchase via gallery card
            </Link>
          </div>

        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="border-t border-gold-200 mt-20 pt-16">
        <h3 className="font-display text-xl uppercase tracking-tight text-neutral-950 font-black mb-10">
          PROPRIETARY AUDITS <span className="font-serif italic text-gold-600 font-light">Patron feedback</span>
        </h3>

        {product.reviews && product.reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {product.reviews.map((rev, index) => (
              <div key={index} className="border border-gold-150 bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-gold-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < rev.rating ? "fill-gold-500 text-gold-500" : "text-neutral-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="font-sans text-xs text-neutral-600 leading-relaxed italic">
                    "{rev.text}"
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-neutral-100 flex justify-between items-center text-[10px] font-mono text-neutral-400 uppercase">
                  <span>{rev.author}</span>
                  <span>{rev.date}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-gold-100 rounded-2xl bg-[#faf9f6]/30">
            <p className="font-sans text-xs text-neutral-400">No public ledger audits registered for this item yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
