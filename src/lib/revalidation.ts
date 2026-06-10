"use server";

import { revalidateTag, revalidatePath } from "next/cache";

/**
 * Revalidates all product-related caches
 * Call this after creating/updating/deleting a product
 */
export async function revalidateProducts() {
  await revalidateTag("products");
}

/**
 * Revalidates a specific product page
 * Call after updating a product to update its detail page
 */
export async function revalidateProductPage(slug: string, id: string) {
  await revalidatePath(`/products/${slug}/${id}`);
  await revalidateTag("products");
}

/**
 * Revalidates category caches
 * Call after creating/updating/deleting a category
 */
export async function revalidateCategories() {
  await revalidateTag("categories");
}

/**
 * Revalidates hero slide caches
 * Call after updating hero slides in admin
 */
export async function revalidateHeroSlides() {
  await revalidateTag("hero-slides");
}

/**
 * Revalidates blog caches
 * Call after creating/updating/deleting a blog post
 */
export async function revalidateBlogs() {
  await revalidateTag("blogs");
}

/**
 * Revalidates a specific blog page
 */
export async function revalidateBlogPage(slug: string) {
  await revalidatePath(`/blogs/${slug}`);
  await revalidateTag("blogs");
}

/**
 * Revalidates static pages that depend on dynamic data
 */
export async function revalidateHomepage() {
  await revalidatePath("/");
  await revalidateTag("products");
  await revalidateTag("hero-slides");
  await revalidateTag("categories");
}

/**
 * Revalidates collections page
 */
export async function revalidateCollections() {
  await revalidatePath("/collections");
  await revalidateTag("products");
  await revalidateTag("categories");
}

/**
 * Revalidates all caches at once
 * Use sparingly - only during major updates
 */
export async function revalidateAllCaches() {
  await revalidateTag("products");
  await revalidateTag("categories");
  await revalidateTag("hero-slides");
  await revalidateTag("blogs");
  await revalidatePath("/");
  await revalidatePath("/collections");
  await revalidatePath("/blogs");
}
