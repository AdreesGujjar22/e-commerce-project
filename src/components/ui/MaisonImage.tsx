"use client";

import React, { useState, useEffect } from "react";

export function optimizeCloudinaryUrl(url: string | undefined): string {
  if (!url) return "";
  const isCloudinary = url.includes("cloudinary.com");
  if (!isCloudinary) return url;
  
  if (url.includes("f_auto") || url.includes("q_auto") || url.includes("w_auto")) {
    return url; 
  }
  
  if (url.includes("/image/upload/")) {
    return url.replace("/image/upload/", "/image/upload/f_auto,q_auto,w_auto/");
  }
  
  return url;
}

interface MaisonImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export const MaisonImage: React.FC<MaisonImageProps> = ({
  src,
  alt = "Maison Item",
  className = "",
  fallbackSrc = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=40",
  onLoad,
  onError,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentSrc, setCurrentSrc] = useState<string>("");
  const [, setHasError] = useState(false);

  useEffect(() => {
    if (src && typeof src === "string") {
      setIsLoading(true);
      setHasError(false);
      setCurrentSrc(optimizeCloudinaryUrl(src));
    } else {
      setIsLoading(false);
      setHasError(true);
      setCurrentSrc(fallbackSrc);
    }
  }, [src, fallbackSrc]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoading(false);
    if (onLoad) onLoad(e);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoading(false);
    setHasError(true);
    setCurrentSrc(fallbackSrc);
    if (onError) onError(e);
  };

  return (
    <div className="relative w-full h-full min-h-[inherit] overflow-hidden" id="maison-image-container">
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gradient-to-r from-stone-100 via-stone-200/50 to-stone-100 bg-[length:200%_100%] animate-pulse"
          style={{
            animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          }}
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={currentSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`${className} ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
        {...props}
      />
    </div>
  );
};
