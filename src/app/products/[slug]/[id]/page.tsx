import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { getProductByIdAction } from "../../../../actions/product.actions";
import { ArrowLeft } from "lucide-react";
import { DynamicJsonLd } from "../../../../components/seo/DynamicJsonLd";
import { ProductDetailClient } from "../../../../components/product/ProductDetailClient";
import ShareButton from "../../../../components/blog/ShareButton";

export const dynamic = 'force-dynamic'; // Force dynamic rendering on Vercel

interface PageProps {
  params: Promise<{ slug: string; id: string }> | { slug: string; id: string };
}

// 1. Next.js Dynamic Metadata generation for Product Page
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const res = await getProductByIdAction(id);
  const product = res.product;

  if (!product) {
    return {
      title: "Curation Not Found | Arooj Arts",
      description: "The requested exhibition piece is not active in our catalog.",
    };
  }

  const title = `${product.name} — ${product.designer} | Arooj Arts`;
  const description = product.description || `Explore the exquisite ${product.name} by designer ${product.designer} at Arooj Arts.`;
  const canonicalUrl = `${process.env.NEXT_APP_SITE_URL}/products/${product.slug}/${product.id}`;

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
      siteName: "Arooj Arts",
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
      "priceCurrency": "PKR",
      "price": product.price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "url": `${process.env.NEXT_APP_SITE_URL}/products/${product.slug}/${product.id}`,
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

      {/* Back button with Share Link */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
        <Link
          href="/collections"
          className="inline-flex items-center text-xs font-display uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span>back to collections showroom</span>
        </Link>
        <ShareButton slug={`${product['slug']}/${product['id']}`} isProduct />
      </div>
      {/* Dynamic Product Client View */}
      <ProductDetailClient product={product} />
    </div>
  );
}
