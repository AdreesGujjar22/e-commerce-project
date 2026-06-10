export const RESPONSIVE_IMAGE_SIZES = {
  // Product cards (2:3 aspect ratio) - used in grid view
  productCard:
    "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw",

  // Hero/banner images - full width slider
  hero: "100vw",

  // Product detail main image (2:3 aspect) - half width on desktop
  productDetail:
    "(max-width: 768px) 100vw, 50vw",

  // Product detail thumbnails - small fixed size
  productThumbnail: "80px",

  // Cart items - fixed 64px width
  cartItem: "64px",

  // Showcase/category cards (2:3 aspect) - 2 per row desktop
  showcase:
    "(max-width: 768px) 100vw, 50vw",

  // Footer/logo - fixed width
  logo: "140px",

  // Navigation items - small fixed
  navItem: "48px",

  // Blog cover images - full width
  blogCover: "100vw",

  // Blog thumbnail - square small
  blogThumbnail: "200px",
} as const;

export const PRODUCT_IMAGE_QUALITY = {
  // Hero (LCP element) - highest quality
  hero: 90,
  // Product detail main - high quality
  productDetail: 90,
  // Product cards - good quality
  productCard: 80,
  // Thumbnails - lower quality (smaller)
  thumbnail: 75,
  // Cart preview - lower quality
  cartPreview: 75,
  // Background/showcase - good quality
  showcase: 80,
} as const;

export const PRODUCT_IMAGE_WIDTHS = {
  // Mobile sizes
  mobileSmall: 360,
  mobile: 640,
  // Tablet sizes
  tabletSmall: 768,
  tablet: 1024,
  // Desktop sizes
  desktop: 1440,
  desktopLarge: 1920,
} as const;
