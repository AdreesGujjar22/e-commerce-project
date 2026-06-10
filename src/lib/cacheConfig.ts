import { unstable_cache } from "next/cache";
import {
  getProductsAction as getProductsActionRaw,
  getProductByIdAction as getProductByIdActionRaw,
  getProductBySlugAction as getProductBySlugActionRaw,
} from "../actions/product.actions";
import {
  getCategoriesAction as getCategoriesActionRaw,
} from "../actions/category.actions";
import {
  getHeroSlidesAction as getHeroSlidesActionRaw,
} from "../actions/hero.actions";
import {
  getBlogsAction as getBlogsActionRaw,
  getBlogBySlugAction as getBlogBySlugActionRaw,
} from "../actions/blog.actions";

export const getCachedProducts = unstable_cache(
  async (options?: Parameters<typeof getProductsActionRaw>[0]) =>
    getProductsActionRaw(options),
  ["products"],
  {
    revalidate: 300, // 5 minutes
    tags: ["products"],
  }
);

export const getCachedProductById = unstable_cache(
  async (id: string) => getProductByIdActionRaw(id),
  ["product-by-id"],
  {
    revalidate: 3600, // 1 hour
    tags: ["products"],
  }
);

export const getCachedProductBySlug = unstable_cache(
  async (slug: string) => getProductBySlugActionRaw(slug),
  ["product-by-slug"],
  {
    revalidate: 3600, // 1 hour
    tags: ["products"],
  }
);

export const getCachedCategories = unstable_cache(
  async () => getCategoriesActionRaw(),
  ["categories"],
  {
    revalidate: 86400, // 24 hours
    tags: ["categories"],
  }
);

export const getCachedHeroSlides = unstable_cache(
  async () => getHeroSlidesActionRaw(),
  ["hero-slides"],
  {
    revalidate: 3600, // 1 hour
    tags: ["hero-slides"],
  }
);

export const getCachedBlogs = unstable_cache(
  async (options?: Parameters<typeof getBlogsActionRaw>[0]) =>
    getBlogsActionRaw(options),
  ["blogs"],
  {
    revalidate: 1800, // 30 minutes
    tags: ["blogs"],
  }
);

export const getCachedBlogBySlug = unstable_cache(
  async (slug: string) => getBlogBySlugActionRaw(slug),
  ["blog-by-slug"],
  {
    revalidate: 3600, // 1 hour
    tags: ["blogs"],
  }
);
