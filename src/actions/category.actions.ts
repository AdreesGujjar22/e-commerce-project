"use server";

import { getSupabaseServerClient, getSupabaseStatelessClient } from "../lib/supabase/server";
import { deleteFromCloudinary } from "../lib/cloudinary";

// Helpers to parse SEO metadata stored inside the banner_url column
interface CategoryMeta {
  url: string;
  seo_title: string;
  seo_description: string;
}

function parseCategoryMeta(bannerField: string | null): CategoryMeta {
  const defaultMeta = { url: "", seo_title: "", seo_description: "" };
  if (!bannerField) return defaultMeta;
  if (bannerField.startsWith("{")) {
    try {
      return { ...defaultMeta, ...JSON.parse(bannerField) };
    } catch (_) {
      return { ...defaultMeta, url: bannerField };
    }
  }
  return { ...defaultMeta, url: bannerField };
}

function serializeCategoryMeta(url: string, seo_title = "", seo_description = ""): string {
  return JSON.stringify({
    url: url || "",
    seo_title: seo_title || "",
    seo_description: seo_description || "",
  });
}

function verifyAdminRole(profile: any) {
  if (profile?.role !== "admin") {
    throw new Error("Administration credentials are required.");
  }
}

export async function getCategoriesAction() {
  try {
    const supabase = getSupabaseStatelessClient();
    const { data: categories, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      throw error;
    }

    const formatted = (categories || [])
      .filter((cat: any) => !cat.id.startsWith("system-"))
      .map((cat: any) => {
        const meta = parseCategoryMeta(cat.banner_url);
        return {
          id: cat.id,
          name: cat.name,
          bannerUrl: meta.url,
          seoTitle: meta.seo_title,
          seoDescription: meta.seo_description,
          createdAt: cat.created_at,
        };
      });

    return { success: true, categories: formatted };
  } catch (err: any) {
    console.error("getCategoriesAction error:", err);
    return { success: false, error: err.message || "Failed to load categories.", categories: [] };
  }
}

export async function createCategoryAction(name: string, bannerUrl = "", seoTitle = "", seoDescription = "") {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Access Denied." };
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    verifyAdminRole(profile);

    // Generate unique slug
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const bannerSerialized = serializeCategoryMeta(bannerUrl, seoTitle, seoDescription);

    const { data, error } = await supabase
      .from("categories")
      .insert({
        id: slug,
        name,
        banner_url: bannerSerialized,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    const meta = parseCategoryMeta(data.banner_url);
    return {
      success: true,
      category: {
        id: data.id,
        name: data.name,
        bannerUrl: meta.url,
        seoTitle: meta.seo_title,
        seoDescription: meta.seo_description,
        createdAt: data.created_at,
      }
    };
  } catch (err: any) {
    console.error("createCategoryAction error:", err);
    return { success: false, error: err.message || "Failed to curate category." };
  }
}

export async function updateCategoryAction(id: string, name: string, bannerUrl = "", seoTitle = "", seoDescription = "") {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Access Denied." };
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    verifyAdminRole(profile);

    const bannerSerialized = serializeCategoryMeta(bannerUrl, seoTitle, seoDescription);

    const { data, error } = await supabase
      .from("categories")
      .update({
        name,
        banner_url: bannerSerialized,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    const meta = parseCategoryMeta(data.banner_url);
    return {
      success: true,
      category: {
        id: data.id,
        name: data.name,
        bannerUrl: meta.url,
        seoTitle: meta.seo_title,
        seoDescription: meta.seo_description,
        createdAt: data.created_at,
      }
    };
  } catch (err: any) {
    console.error("updateCategoryAction error:", err);
    return { success: false, error: err.message || "Failed to update category." };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Access Denied." };
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    verifyAdminRole(profile);

    // Fetch category to delete its banner_url image from Cloudinary if applicable
    const { data: cat } = await supabase.from("categories").select("banner_url").eq("id", id).single();
    if (cat?.banner_url) {
      const meta = parseCategoryMeta(cat.banner_url);
      if (meta.url) {
        await deleteFromCloudinary(meta.url);
      }
    }

    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      throw error;
    }

    return { success: true };
  } catch (err: any) {
    console.error("deleteCategoryAction error:", err);
    return { success: false, error: err.message || "Failed to delete category." };
  }
}
