import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getBlogBySlugAction, getBlogsAction } from "../../../actions/blog.actions";
import { ArrowLeft, Calendar, Clock, User, Share2 } from "lucide-react";
import JoditViewer from "../../../components/blog/JoditViewer";
import ShareButton from "../../../components/blog/ShareButton";
import { DynamicJsonLd } from "../../../components/seo/DynamicJsonLd";

export const revalidate = 60; // Cash individual pages dynamically

interface SingleBlogProps {
  params: Promise<{ slug: string }> | { slug: string };
}

// 1. Next.js Dynamic Metadata generation for Blog Detail Page
export async function generateMetadata({ params }: SingleBlogProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const res = await getBlogBySlugAction(slug, { stateless: true });
  const blog = res.blog;

  if (!blog) {
    return {
      title: "Journal Chronicle Not Found | Arooj Arts",
      description: "The requested editorial chronicle is not active in our archive.",
    };
  }

  const title = `${blog.seoTitle || blog.title} | Arooj Arts`;
  const description = blog.seoDescription || blog.excerpt || `Read "${blog.title}" at Arooj Arts.`;
  const canonicalUrl = `${process.env.NEXT_APP_SITE_URL}/blogs/${blog.slug}`;

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
          url: "/meta-logo.jpg",
          width: 1200,
          height: 630,
          alt: blog.title,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/meta-logo.jpg"],
    },
  };
}

// 2. Generate Static Params for build optimization & lightning fast load speeds
export async function generateStaticParams() {
  const res = await getBlogsAction({ page: 1, limit: 100, stateless: true });
  const blogs = res.blogs || [];
  return blogs.map((blog) => ({
    slug: blog.slug,
  }));
}

export default async function SingleBlogPage({ params }: SingleBlogProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const res = await getBlogBySlugAction(slug, { stateless: true });
  const blog = res.blog;

  if (!blog) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center" id="blog-not-found-container">
        <h1 className="font-display text-2xl uppercase tracking-wider text-neutral-900 font-bold">
          JOURNAL RECORD NOT LOCATED
        </h1>
        <p className="font-sans text-xs text-neutral-500 mt-2 mb-8">
          The curated journal piece is not active or may have been securely filed away.
        </p>
        <Link
          href="/blogs"
          className="inline-flex items-center text-xs font-display uppercase tracking-widest text-gold-600 hover:text-gold-700 underline"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span>return to editorial chronicles</span>
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(blog.publishDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  // Create standard JSON-LD Article/Blog Posting Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.title,
    "image": blog.coverImage || "https://picsum.photos/seed/vibrant/1920/1080",
    "datePublished": blog.publishDate,
    "author": {
      "@type": "Person",
      "name": blog.author,
    },
    "description": blog.excerpt,
    "publisher": {
      "@type": "Organization",
      "name": "Arooj Arts",
      "logo": {
        "@type": "ImageObject",
        "url": "https://ais-dev-cgwlfgq4uevdr35b2ix4qe-922378778819.asia-southeast1.run.app/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://ais-dev-cgwlfgq4uevdr35b2ix4qe-922378778819.asia-southeast1.run.app/blogs/${blog.slug}`
    }
  };

  return (
    <div className="bg-[#faf9f6] min-h-screen py-16 text-left" id={`single-blog-frame-${blog.slug}`}>
      <DynamicJsonLd data={jsonLd} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Back Link */}
        <Link
          href="/blogs"
          className="inline-flex items-center text-xs font-display uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition-colors mb-10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span>back to chronicles journal</span>
        </Link>

        {/* Article Header */}
        <header className="space-y-6 mb-10">
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-neutral-500 font-mono uppercase tracking-widest">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-gold-600" />
              {formattedDate}
            </span>
            <span className="text-neutral-300">•</span>
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-gold-600" />
              {blog.author}
            </span>
            <span className="text-neutral-300">•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-gold-600" />
              {blog.readTime}
            </span>
          </div>

          <h1 className="font-display text-2xl sm:text-3.5xl uppercase tracking-wide text-neutral-950 font-black leading-tight">
            {blog.title}
          </h1>

          <p className="font-serif text-sm sm:text-base text-neutral-600 italic leading-relaxed border-l-2 border-gold-300 pl-4 py-1">
            {blog.excerpt}
          </p>
        </header>

        {/* Featured Aspect Image */}
        {blog.coverImage && (
          <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden mb-12 border border-gold-150 shadow-sm">
            <Image
              src={blog.coverImage}
              alt={blog.title}
              fill
              className="object-cover"
              priority
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* Render blog body with rich HTML content via Jodit React */}
        <div className="bg-white border border-gold-150 rounded-2xl p-6 sm:p-8 shadow-xs mb-12">
          <JoditViewer content={blog.content} />
        </div>

        {/* Bottom Social Action Bar */}
        <div className="border-t border-gold-200 pt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
            published under luxury design reflections
          </div>
          <ShareButton slug={blog.slug} />
        </div>

      </div>
    </div>
  );
}
