import React from "react";

interface SkeletonLoaderProps {
  variant?: "card" | "text" | "image" | "thumbnail" | "footer-item";
  count?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = "card",
  count = 1,
  className = "",
}) => {
  if (variant === "card") {
    return (
      <>
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className={`bg-neutral-100 rounded-xl animate-pulse ${className}`}>
            <div className="aspect-[2/3] bg-stone-200 rounded-lg mb-4" />
            <div className="px-4">
              <div className="h-4 bg-stone-200 rounded mb-2 w-3/4" />
              <div className="h-3 bg-stone-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </>
    );
  }

  if (variant === "image") {
    return (
      <div className={`bg-gradient-to-r from-stone-100 via-stone-200 to-stone-100 bg-[length:200%_100%] animate-pulse rounded-lg ${className}`} />
    );
  }

  if (variant === "thumbnail") {
    return (
      <div className={`bg-stone-200 rounded-lg animate-pulse ${className}`} style={{ width: "58px", height: "72px" }} />
    );
  }

  if (variant === "footer-item") {
    return (
      <>
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="space-y-3">
            <div className="h-4 bg-stone-700 rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-stone-700 rounded w-full animate-pulse" />
            <div className="h-3 bg-stone-700 rounded w-5/6 animate-pulse" />
          </div>
        ))}
      </>
    );
  }

  return (
    <div className={`h-4 bg-stone-200 rounded w-full animate-pulse ${className}`} />
  );
};
