"use client";

import React, { useState, useEffect, useRef } from "react";
import { Product } from "../../types";
import { useStore } from "../../store";
import { ProductGrid } from "./ProductGrid";
import { SlidersHorizontal } from "lucide-react";
import { getProductsAction } from "../../actions/product.actions";
import GlobalLoading from "../ui/GlobalLoading";

interface CollectionsFilterProps {
  initialProducts: Product[];
  initialCategories?: any[];
  initialTotalCount: number;
  initialTotalPages: number;
}

export const CollectionsFilter: React.FC<CollectionsFilterProps> = ({
  initialProducts,
  initialCategories,
  initialTotalCount,
  initialTotalPages,
}) => {
  const {
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    searchQuery,
  } = useStore();

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(initialTotalCount);
  const [totalPages, setTotalPages] = useState<number>(initialTotalPages);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Dynamic state keys reference to check updates and adjust pagination
  const prevFiltersRef = useRef({ selectedCategory, sortBy, searchQuery });
  const isFirstLoad = useRef(true);

  useEffect(() => {
    // Detect if filters changed: reset page index automatically
    const filtersChanged =
      prevFiltersRef.current.selectedCategory !== selectedCategory ||
      prevFiltersRef.current.sortBy !== sortBy ||
      prevFiltersRef.current.searchQuery !== searchQuery;

    let targetPage = currentPage;
    if (filtersChanged) {
      targetPage = 1;
      setCurrentPage(1);
    }
    prevFiltersRef.current = { selectedCategory, sortBy, searchQuery };

    // Prevent redundant call on server-rendered page mount under default states
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      if (
        selectedCategory === "all" &&
        sortBy === "default" &&
        searchQuery === ""
      ) {
        return;
      }
    }

    const fetchFilteredAndPaginatedProducts = async () => {
      setIsLoading(true);
      try {
        const res = await getProductsAction({
          category: selectedCategory,
          searchQuery: searchQuery,
          sortBy: sortBy,
          page: targetPage,
          limit: 8,
        });
        if (res.success) {
          setProducts(res.products || []);
          setTotalCount(res.totalCount || 0);
          setTotalPages(res.totalPages || 1);
        } else {
          console.error("Backend failed fetching curations:", res.error);
        }
      } catch (err) {
        console.error("Error calling getProductsAction client-side:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilteredAndPaginatedProducts();
  }, [selectedCategory, sortBy, searchQuery, currentPage]);

  // Dynamically map categories from database, fallback to built-in presets if none loaded
  const categoriesList = [
    { id: "all", label: "All Products" },
    ...(initialCategories && initialCategories.length > 0
      ? initialCategories.map((cat) => ({
          id: cat.id,
          label: cat.name,
        }))
      : [
          { id: "apparel", label: "Clothing" },
          { id: "decor", label: "Geologic Decors" },
          { id: "watches", label: "Fine Timekeepers" },
          { id: "fragrances", label: "Prestige Fragrances" },
        ]),
  ];

  return (
    <div className="flex flex-col space-y-8 w-full" id="collections-filter-deck">
      {/* Filters and Sorting bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4.5 bg-neutral-50 border border-gold-150 rounded-2xl p-5 text-left">
        
        {/* Categories Tab list */}
        <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
          {categoriesList.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`font-display text-[9.5px] uppercase tracking-widest px-4.5 py-2.5 rounded-full border transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-neutral-950 border-neutral-950 text-white font-extrabold shadow-sm scale-102"
                  : "bg-white border-gold-200 text-neutral-600 hover:border-gold-300"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sort select */}
        <div className="flex items-center space-x-3 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 border-gold-200 pt-3 lg:pt-0">
          <div className="flex items-center space-x-1.5 text-neutral-500 font-display text-[10px] uppercase font-bold tracking-widest">
            <SlidersHorizontal className="h-3.5 w-3.5 text-gold-500" />
            <span>Sort by:</span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-gold-200 rounded-xl px-4 py-2.5 font-display text-[10px] uppercase tracking-wider text-neutral-800 focus:outline-none focus:ring-1 focus:ring-gold-450 cursor-pointer"
          >
            <option value="default">Default</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated </option>
          </select>
        </div>
      </div>

      {/* Active filters feedback info */}
      {(selectedCategory !== "all" || searchQuery) && (
        <div className="flex items-center space-x-2.5 text-xs text-neutral-500 font-sans mt-2">
          <span>Filters</span>
          {selectedCategory !== "all" && (
            <span className="bg-gold-100/60 border border-gold-200 text-gold-900 rounded-full px-3 py-1 text-[10px] uppercase font-display font-medium">
              Category: {selectedCategory}
            </span>
          )}
          {searchQuery && (
            <span className="bg-gold-100/60 border border-gold-200 text-gold-900 rounded-full px-3 py-1 text-[10px] uppercase font-display font-medium">
              Applied: "{searchQuery}"
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("all");
            }}
            className="text-neutral-500 hover:text-neutral-950 text-xs font-semibold underline decoration-dashed transition-colors cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Renders the actual grid listing with pre-filtered server values */}
      <div className={`transition-all duration-300 relative ${isLoading ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
        <ProductGrid products={products} bypassClientFiltering={true} />
        
        {isLoading && (
          <GlobalLoading content="Loading products..." />
        )}
      </div>

      {/* Premium Minimalist Luxury Pagination controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gold-200 pt-8 mt-12 gap-4" id="gallery-showroom-pagination-curator">
          {/* Status count indicator */}
          <p className="font-sans text-xs text-neutral-500">
            Showing <span className="font-semibold text-neutral-900">{products.length}</span> of <span className="font-semibold text-neutral-900">{totalCount}</span> products
          </p>

          {/* Nav buttons */}
          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              disabled={currentPage === 1 || isLoading}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className={`font-display text-[9.5px] uppercase tracking-[0.2em] px-4.5 py-2.5 border transition-all cursor-pointer ${
                currentPage === 1
                  ? "border-neutral-100 text-neutral-350 cursor-not-allowed bg-stone-50"
                  : "border-gold-200 text-neutral-700 bg-white hover:border-neutral-950 hover:text-neutral-950 focus:outline-none"
              }`}
            >
              PREVIOUS
            </button>

            {/* Numeric Indicators */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                <button
                  key={pNum}
                  type="button"
                  disabled={isLoading}
                  onClick={() => setCurrentPage(pNum)}
                  className={`font-display w-9 h-9 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest border transition-all rounded-full cursor-pointer ${
                    currentPage === pNum
                      ? "bg-neutral-950 border-neutral-950 text-white shadow-sm"
                      : "border-gold-150 text-neutral-500 bg-white hover:border-gold-300 hover:text-neutral-900"
                  }`}
                >
                  {pNum}
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={currentPage === totalPages || isLoading}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className={`font-display text-[9.5px] uppercase tracking-[0.2em] px-4.5 py-2.5 border transition-all cursor-pointer ${
                currentPage === totalPages
                  ? "border-neutral-100 text-neutral-350 cursor-not-allowed bg-stone-50"
                  : "border-gold-200 text-neutral-700 bg-white hover:border-neutral-950 hover:text-neutral-950 focus:outline-none"
              }`}
            >
              NEXT
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
