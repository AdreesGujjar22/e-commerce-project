import React from "react";
import { getProductsAction } from "../../actions/product.actions";
import { getCategoriesAction } from "../../actions/category.actions";
import { ProductGrid } from "../../components/product/ProductGrid";
import { Sparkles, Tag, Layers, Compass } from "lucide-react";
import { CollectionsFilter } from "../../components/product/CollectionsFilter";
import { Metadata } from "next";

export const revalidate = 0;

// 1. Next.js  Metadata  for collections Page
export async function generateMetadata(): Promise<Metadata> {
  const title = `Collections | Arooj Arts`;
  const description =
  "Explore Arooj Arts for beautiful lawn suits, pret wear, and stylish women's clothing. Shop the latest fashion collections with quality designs and nationwide delivery in Pakistan.";
  const canonicalUrl = `${process.env.NEXT_APP_SITE_URL}/collections`;

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
          url: `${process.env.NEXT_APP_SITE_URL}/logo.png`,
          width: 1200,
          height: 630,
          alt: "Arooj Arts Collection",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${process.env.NEXT_APP_SITE_URL}/logo.png`],
    },
  };
}

export default async function CollectionsPage() {
  const res = await getProductsAction({ page: 1, limit: 8 });
  const initialProducts = res.products || [];
  const initialTotalCount = res.totalCount || 0;
  const initialTotalPages = res.totalPages || 1;

  const catRes = await getCategoriesAction();
  const initialCategories = catRes.categories || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left" id="collections-showroom-root">

      {/* 1. Header Hero Segment */}
      <div className="border-b border-gold-200 pb-10 mb-12.5 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-left">
        <div className="max-w-xl">
          <div className="inline-flex items-center space-x-2 bg-neutral-900 text-gold-300 text-[8px] font-display font-medium uppercase tracking-[0.2em] px-3.5 py-1.5 rounded mb-4">
            <Compass className="h-2.5 w-2.5" />
            <span>New Season Collection</span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl uppercase tracking-tight font-black text-neutral-950">
            THE GALLERY <span className="font-serif italic text-gold-600 font-light">Showroom</span>
          </h1>
          <p className="font-sans text-xs text-neutral-500 leading-relaxed mt-4">
            Explore our latest collection. Each item is carefully selected for quality and style.
          </p>
        </div>
      </div>

      {/* 2. Interactive Filtering controls and Product Grid */}
      <CollectionsFilter
        initialProducts={initialProducts}
        initialCategories={initialCategories}
        initialTotalCount={initialTotalCount}
        initialTotalPages={initialTotalPages}
      />
    </div>
  );
}
