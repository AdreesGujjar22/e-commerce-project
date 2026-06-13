"use server";

import { getSupabaseServerClient, getSupabaseStatelessClient } from "../lib/supabase/server";
import { deleteFromCloudinary } from "../lib/cloudinary";
import { BlogPost } from "../types";

// Helper to sanitize & generate a unique slug
function computeSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function verifyAdminRole(profile: any) {
  if (profile?.role !== "admin") {
    throw new Error("Administration credentials are required to design blogs.");
  }
}

/**
  Map Supabase public.categories system-blog record down to BlogPost frontend type
*/
function mapCategoryToBlogPost(cat: any): BlogPost {
  let fields: Partial<BlogPost> = {};
  try {
    fields = JSON.parse(cat.banner_url || "{}");
  } catch (_) {
    // safe fallback
  }

  const slug = cat.id.replace("system-blog-", "");

  return {
    id: cat.id,
    title: cat.name || fields.title || "Untitled Blog Post",
    slug: slug,
    excerpt: fields.excerpt || "",
    content: fields.content || "",
    coverImage: fields.coverImage || "",
    author: fields.author || "Maison Editor",
    publishDate: fields.publishDate || cat.created_at || new Date().toISOString(),
    readTime: fields.readTime || "3 min read",
    seoTitle: fields.seoTitle || "",
    seoDescription: fields.seoDescription || "",
  };
}

/**
 * Fetch all publication pieces with server-side pagination
 */
export async function getBlogsAction(options?: { page?: number; limit?: number; stateless?: boolean }) {
  try {
    const page = options?.page || 1;
    const limit = options?.limit || 6;
    const offset = (page - 1) * limit;

    let supabase;
    if (options?.stateless) {
      supabase = getSupabaseStatelessClient();
    } else {
      try {
        supabase = await getSupabaseServerClient();
      } catch (_) {
        supabase = getSupabaseStatelessClient();
      }
    }
    
    // First let's query a select count or just retrieve system blogs
    const { data: rawBlogs, error } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    const filtered = (rawBlogs || [])
      .filter((cat: any) => cat.id.startsWith("system-blog-"))
      .map(mapCategoryToBlogPost);

    const total = filtered.length;
    const paginatedBlogs = filtered.slice(offset, offset + limit);
    const pageCount = Math.ceil(total / limit);

    return {
      success: true,
      blogs: paginatedBlogs,
      total,
      pageCount,
      currentPage: page,
    };
  } catch (err: any) {
    console.error("getBlogsAction error:", err);
    return { success: false, error: err.message || "Failed to load publication journal blogs.", blogs: [], total: 0, pageCount: 0 };
  }
}

/**
 * Retrieve a single Blog by its direct unique string slug
 */
export async function getBlogBySlugAction(slug: string, options?: { stateless?: boolean }) {
  try {
    let supabase;
    if (options?.stateless) {
      supabase = getSupabaseStatelessClient();
    } else {
      try {
        supabase = await getSupabaseServerClient();
      } catch (_) {
        supabase = getSupabaseStatelessClient();
      }
    }
    const systemBlogId = `system-blog-${computeSlug(slug)}`;

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", systemBlogId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return { success: false, error: "Blog post not found.", blog: null };
    }

    return { success: true, blog: mapCategoryToBlogPost(data) };
  } catch (err: any) {
    console.error("getBlogBySlugAction error:", err);
    return { success: false, error: err.message || "Error reading blog post.", blog: null };
  }
}

/**
 * Curate and add an active blog publication
 */
export async function createBlogAction(blogData: Omit<BlogPost, "id">) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Access Denied." };
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    verifyAdminRole(profile);

    const slug = computeSlug(blogData.slug || blogData.title);
    const systemBlogId = `system-blog-${slug}`;

    // Verify uniqueness of title and slug
    const { data: existing, error: checkErr } = await supabase
      .from("categories")
      .select("id, name")
      .eq("id", systemBlogId)
      .maybeSingle();

    if (existing) {
      return { success: false, error: `A blog piece with slug/title similar to "${slug}" already exists in the curation vault.` };
    }

    const payload = {
      title: blogData.title,
      slug: slug,
      excerpt: blogData.excerpt,
      content: blogData.content,
      coverImage: blogData.coverImage,
      author: blogData.author,
      publishDate: blogData.publishDate || new Date().toISOString(),
      readTime: blogData.readTime || "5 min read",
      seoTitle: blogData.seoTitle || "",
      seoDescription: blogData.seoDescription || "",
    };

    const { data, error } = await supabase
      .from("categories")
      .insert({
        id: systemBlogId,
        name: blogData.title,
        banner_url: JSON.stringify(payload),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { success: true, blog: mapCategoryToBlogPost(data) };
  } catch (err: any) {
    console.error("createBlogAction error:", err);
    return { success: false, error: err.message || "Failed to catalog blog piece." };
  }
}

/**
 * Update editorial attributes on a listed blog publication
 */
export async function updateBlogAction(id: string, blogData: Partial<BlogPost>) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Access Denied." };
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    verifyAdminRole(profile);

    const currentSlug = id.replace("system-blog-", "");
    const requestedSlug = computeSlug(blogData.slug || blogData.title || currentSlug);
    const nextSystemBlogId = `system-blog-${requestedSlug}`;

    // If changing slug/ID, ensure target slug/ID is not taken by another blog
    if (nextSystemBlogId !== id) {
      const { data: existing } = await supabase
        .from("categories")
        .select("id")
        .eq("id", nextSystemBlogId)
        .maybeSingle();

      if (existing) {
        return { success: false, error: `The custom URL path "/blogs/${requestedSlug}" matches another active publication piece.` };
      }
    }

    const payload = {
      title: blogData.title,
      slug: requestedSlug,
      excerpt: blogData.excerpt,
      content: blogData.content,
      coverImage: blogData.coverImage,
      author: blogData.author,
      publishDate: blogData.publishDate,
      readTime: blogData.readTime,
      seoTitle: blogData.seoTitle || "",
      seoDescription: blogData.seoDescription || "",
    };

    let updatedRecord;
    if (nextSystemBlogId !== id) {
      // Create new record with updated ID, copy created_at, then delete old record (Atomic transaction replacement)
      const { data: original } = await supabase.from("categories").select("created_at").eq("id", id).single();
      const createdAt = original?.created_at || new Date().toISOString();

      const { data: inserted, error: insErr } = await supabase
        .from("categories")
        .insert({
          id: nextSystemBlogId,
          name: blogData.title,
          banner_url: JSON.stringify({ ...payload, publishDate: createdAt }),
          created_at: createdAt,
        })
        .select()
        .single();

      if (insErr) throw insErr;

      // Delete old record
      await supabase.from("categories").delete().eq("id", id);
      updatedRecord = inserted;
    } else {
      // Simple update on same ID
      const { data: updated, error: updErr } = await supabase
        .from("categories")
        .update({
          name: blogData.title,
          banner_url: JSON.stringify(payload),
        })
        .eq("id", id)
        .select()
        .single();

      if (updErr) throw updErr;
      updatedRecord = updated;
    }

    return { success: true, blog: mapCategoryToBlogPost(updatedRecord) };
  } catch (err: any) {
    console.error("updateBlogAction error:", err);
    return { success: false, error: err.message || "Failed to save blog post." };
  }
}

/**
 * Remove blog publication piece permanently
 */
export async function deleteBlogAction(id: string) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Access Denied." };
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    verifyAdminRole(profile);

    // Fetch details to clean Cloudinary assets if needed
    const { data: original } = await supabase.from("categories").select("*").eq("id", id).single();
    if (original) {
      const mapped = mapCategoryToBlogPost(original);
      if (mapped.coverImage) {
        await deleteFromCloudinary(mapped.coverImage);
      }
    }

    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      throw error;
    }

    return { success: true };
  } catch (err: any) {
    console.error("deleteBlogAction error:", err);
    return { success: false, error: err.message || "Failed to delete blog." };
  }
}
