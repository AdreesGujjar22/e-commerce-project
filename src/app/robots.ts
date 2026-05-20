import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = "https://ais-dev-cgwlfgq4uevdr35b2ix4qe-922378778819.asia-southeast1.run.app";
  
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
