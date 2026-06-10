export interface ImageOptimizeOptions {
  width?: number;
  height?: number;
  quality?: 'auto' | 'auto:good' | 'good' | 'best' | number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  fit?: 'fill' | 'cover' | 'contain' | 'crop' | 'scale';
  gravity?: 'auto' | 'face' | 'center' | string;
  dpr?: string;
}

export function buildCloudinaryUrl(
  url: string | undefined,
  options: ImageOptimizeOptions = {}
): string {
  if (!url) return "";
  const isCloudinary = url.includes("cloudinary.com");
  if (!isCloudinary) return url;

  const {
    width,
    height,
    quality = 'auto:good',
    format = 'auto',
    fit = 'fill',
    gravity = 'auto',
    dpr = '1.0',
  } = options;

  const transforms = [
    width && `w_${width}`,
    height && `h_${height}`,
    fit && `c_${fit}`,
    gravity && `g_${gravity}`,
    `q_${quality}`,
    `f_${format}`,
    `dpr_${dpr}`,
  ]
    .filter(Boolean)
    .join(",");

  if (url.includes("/image/upload/")) {
    return url.replace("/image/upload/", `/image/upload/${transforms}/`);
  }

  return url;
}

export function optimizeCloudinaryUrl(url: string | undefined): string {
  return buildCloudinaryUrl(url, { quality: 'auto:good', format: 'auto' });
}
