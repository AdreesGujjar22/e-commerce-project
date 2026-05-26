import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getBlogsAction } from "../../actions/blog.actions";
import { Calendar, User, Clock, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";

export const revalidate = 60; // Cash pages dynamically every minute

export const metadata: Metadata = {
  title: "Fashion Blog | Arooj Arts Pakistan",
  description:
    "Explore the latest Pakistani fashion trends, lawn collections, Eid dresses, wedding wear inspiration, styling tips, and luxury women's clothing guides by Arooj Arts.",

  keywords: [
    "Pakistani fashion",
    "lawn dresses",
    "Eid dresses",
    "women clothing Pakistan",
    "wedding dresses",
    "fashion blog Pakistan",
    "Arooj Arts",
  ],
};

interface BlogsPageProps {
  searchParams: Promise<{ page?: string }> | { page?: string };
}

export default async function BlogsPage({ searchParams }: BlogsPageProps) {
  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams?.page || "1");
  const limit = 6;

  const result = await getBlogsAction({ page: currentPage, limit });
  const blogs = result.blogs || [];
  const total = result.total || 0;
  const pageCount = result.pageCount || 1;

  return (
    <div className="bg-[#faf9f6] min-h-screen py-16 text-left" id="blogs-index-frame">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Editorial Journal Head Banner */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gold-50 border border-gold-200 text-[10px] font-display uppercase tracking-widest text-[#7c633a] font-extrabold">
            <BookOpen className="h-3 w-3" />
            <span>Arooj Arts Fashion Blog</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-wider text-neutral-900 font-black leading-tight">
            Latest Fashion Trends & Style Guides
          </h1>
          <p className="font-sans text-xs sm:text-sm text-neutral-500 leading-relaxed font-normal">
            Discover the latest Pakistani fashion trends, luxury lawn collections, Eid outfit ideas, wedding wear inspiration, and styling tips for modern women across Pakistan.
          </p>
        </div>

        {blogs.length === 0 ? (
          <div className="bg-white border border-gold-150 rounded-2xl p-12 text-center max-w-md mx-auto shadow-xs" id="empty-journal-notice">
            <BookOpen className="h-10 w-10 text-gold-300 mx-auto mb-3" />
            <h3 className="font-display text-xs uppercase tracking-widest font-bold text-neutral-800">
              No Fashion Articles Yet
            </h3>
            <p className="font-sans text-xs text-neutral-400 mt-2">
              New fashion trends, styling tips, and collection updates will be published soon. Please check back soon.
            </p>
          </div>
        ) : (
          <>
            {/* Grid display layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="blogs-grid-display">
              {blogs.map((post) => {
                const formattedDate = new Date(post.publishDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric"
                });

                return (
                  <article
                    key={post.id}
                    className="group bg-white border border-gold-150 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col h-full"
                    id={`blog-card-${post.slug}`}
                  >
                    {/* Cover Image Panel */}
                    <div className="relative aspect-[16/10] bg-neutral-100 overflow-hidden">
                      {post.coverImage ? (
                        <Image
                          src={post.coverImage}
                          alt={`${post.title} - Arooj Arts Fashion Blog`}
                          fill
                          sizes="(max-w-768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-neutral-950 text-gold-400 font-display font-black text-[10px] uppercase tracking-widest">
                          Arooj Arts
                        </div>
                      )}

                      {/* Read Time Tag */}
                      <span className="absolute bottom-3 right-3 bg-neutral-950/85 backdrop-blur-xs text-[9px] font-display font-extrabold uppercase tracking-wide text-gold-400 px-2.5 py-1 rounded-sm border border-gold-800/25">
                        {post.readTime}
                      </span>
                    </div>

                    {/* Metadata Content */}
                    <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        {/* Meta lines */}
                        <div className="flex items-center gap-4 text-[10px] text-neutral-400 font-mono uppercase tracking-wide">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-gold-600" />
                            {formattedDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {post.author}
                          </span>
                        </div>

                        {/* Title & Excerpt */}
                        <h2 className="font-display text-sm uppercase tracking-wide text-neutral-900 font-black group-hover:text-gold-700 transition-colors line-clamp-2 leading-snug">
                          <Link
                            href={`/blogs/${post.slug}`}
                            className="hover:underline"
                            prefetch={true}
                          >
                            {post.title}
                          </Link>
                        </h2>

                        <p className="font-sans text-xs text-neutral-500 line-clamp-3 leading-relaxed">
                          {post.excerpt}
                        </p>
                      </div>

                      {/* Read Button */}
                      <div className="pt-2 border-t border-gold-100 flex justify-between items-center">
                        <Link
                          href={`/blogs/${post.slug}`}
                          className="text-[10px] font-display uppercase tracking-widest text-[#7c633a] font-extrabold group-hover:text-neutral-950 transition-colors flex items-center gap-1.5"
                        >
                          <span>Read More</span>
                          <Clock className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Premium Pagination Section */}
            {pageCount > 1 && (
              <div className="mt-16 flex justify-center items-center gap-2" id="blogs-pagination-panel">
                {currentPage > 1 ? (
                  <Link
                    href={`/blogs?page=${currentPage - 1}`}
                    className="flex items-center justify-center p-2.5 border border-gold-150 rounded-xl bg-white hover:bg-neutral-50 text-neutral-700 transition"
                    title="Previous Page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Link>
                ) : (
                  <button
                    disabled
                    className="flex items-center justify-center p-2.5 border border-gold-100 rounded-xl bg-neutral-100 text-neutral-300 cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                )}

                <span className="font-mono text-xs text-neutral-500 uppercase tracking-widest px-4 py-2 border border-gold-150 rounded-xl bg-white">
                  Page {currentPage} of {pageCount}
                </span>

                {currentPage < pageCount ? (
                  <Link
                    href={`/blogs?page=${currentPage + 1}`}
                    className="flex items-center justify-center p-2.5 border border-gold-150 rounded-xl bg-white hover:bg-neutral-50 text-neutral-700 transition"
                    title="Next Page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <button
                    disabled
                    className="flex items-center justify-center p-2.5 border border-gold-100 rounded-xl bg-neutral-100 text-neutral-300 cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
