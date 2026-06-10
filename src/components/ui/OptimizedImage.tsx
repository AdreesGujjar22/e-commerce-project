import React, { useState } from "react";
import Image from "next/image";
import { buildCloudinaryUrl } from "../../lib/cloudinaryUrl";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
  quality?: number;
  className?: string;
  loading?: "lazy" | "eager";
  onLoad?: () => void;
  fallbackSrc?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  sizes,
  priority = false,
  fill = false,
  quality = 85,
  className = "",
  loading = "lazy",
  onLoad,
  fallbackSrc = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=40",
}) => {
  const [imageError, setImageError] = useState(false);

  const imageSrc = imageError && fallbackSrc ? fallbackSrc : src;

  const isCloudinary = imageSrc.includes("cloudinary.com");

  const optimizedSrc = isCloudinary
    ? buildCloudinaryUrl(imageSrc, {
        width,
        height,
        quality: quality === 85 ? "auto:good" : quality,
        format: "auto",
        fit: "cover",
      })
    : imageSrc;

  return (
    <Image
      src={optimizedSrc}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      quality={quality}
      priority={priority}
      fill={fill}
      loading={loading}
      className={className}
      onError={() => setImageError(true)}
      onLoad={onLoad}
      unoptimized={false}
    />
  );
};
