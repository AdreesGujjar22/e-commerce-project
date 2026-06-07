import { MetadataRoute } from "next";
import { getProductsAction } from "../actions/product.actions";
import { getBlogsAction } from "../actions/blog.actions";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_APP_SITE_URL;;

  // Static pages core list
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/collections`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/blogs`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  try {
    const res = await getProductsAction();
    const products = res.products || [];

    const dynamicProductRoutes: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${siteUrl}/products/${product.slug}/${product.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const blogRes = await getBlogsAction({ page: 1, limit: 100 });
    const blogs = blogRes.blogs || [];

    const dynamicBlogRoutes: MetadataRoute.Sitemap = blogs.map((blog) => ({
      url: `${siteUrl}/blogs/${blog.slug}`,
      lastModified: new Date(blog.publishDate),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticPages, ...dynamicProductRoutes, ...dynamicBlogRoutes];
  } catch (err) {
    console.error("Failed mapping database records onto sitemap indices, fallback to statics:", err);
    return staticPages;
  }
}
