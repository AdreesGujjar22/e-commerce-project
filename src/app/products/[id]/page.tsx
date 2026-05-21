import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { getProductByIdAction, getProductsAction } from "../../../actions/product.actions";
import { ArrowLeft } from "lucide-react";
import { DynamicJsonLd } from "../../../components/seo/DynamicJsonLd";
import { ProductDetailClient } from "../../../components/product/ProductDetailClient";

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

      {/* Dynamic Product Client View */}
      <ProductDetailClient product={product} />
    </div>
  );
}
