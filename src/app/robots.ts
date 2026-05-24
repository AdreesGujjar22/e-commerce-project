import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_APP_SITE_URL;
  
  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/collections",
        "/contact",
        "/privacy",
        "/terms",
        "/products/",
      ],
      disallow: [
        "/admin",
        "/admin/*",
        "/api",
        "/api/*",
        "/auth",
        "/auth/*",
        "/checkout",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
