"use server";

import { getSupabaseServerClient } from "../lib/supabase/server";
import { ProductSchema } from "../validations";
import { Product, Review } from "../types";

/**
 * Maps a database product entry into the clean Product frontend type
 */
function mapProductDbToType(dbProduct: any): Product {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    designer: dbProduct.designer,
    category: dbProduct.category_id || dbProduct.category || "apparel",
    price: Number(dbProduct.price),
    image: dbProduct.image,
    description: dbProduct.description,
    longDescription: dbProduct.long_description || dbProduct.description,
    details: dbProduct.details || [],
    stock: Number(dbProduct.stock),
    featured: Boolean(dbProduct.featured),
    rating: Number(dbProduct.rating || 5.0),
    reviews: dbProduct.reviews || [],
  };
}

export async function getProductsAction(options?: {
  category?: string;
  featuredOnly?: boolean;
}) {
  try {
    const supabase = await getSupabaseServerClient();
    
    let query = supabase.from("products").select("*, reviews(*)");

    if (options?.category && options.category !== "all") {
      query = query.eq("category_id", options.category);
    }

    if (options?.featuredOnly) {
      query = query.eq("featured", true);
    }

    // Sort newer products first
    query = query.order("created_at", { ascending: false });

    const { data: dbProducts, error } = await query;

    if (error) {
      console.error("Supabase getProductsAction error:", error);
      return { success: false, error: error.message, products: [] };
    }

    const products: Product[] = (dbProducts || []).map((p: any) => {
      // Map reviews
      const reviews: Review[] = (p.reviews || []).map((r: any) => ({
        author: r.author_name,
        rating: r.rating,
        text: r.text,
        date: new Date(r.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        }),
      }));
      return mapProductDbToType({ ...p, reviews });
    });

    return { success: true, products };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed reading storefront catalogs", products: [] };
  }
}

export async function getProductByIdAction(id: string) {
  try {
    const supabase = await getSupabaseServerClient();
    
    const { data: p, error } = await supabase
      .from("products")
      .select("*, reviews(*)")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message, product: null };
    }

    if (!p) {
      return { success: false, error: "Artifact curation not found.", product: null };
    }

    const reviews: Review[] = (p.reviews || []).map((r: any) => ({
      author: r.author_name,
      rating: r.rating,
      text: r.text,
      date: new Date(r.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      }),
    }));

    const product = mapProductDbToType({ ...p, reviews });
    return { success: true, product };
  } catch (err: any) {
    return { success: false, error: err.message, product: null };
  }
}

export async function createProductAction(formData: any) {
  try {
    const supabase = await getSupabaseServerClient();

    // 1. Verify and enforce authentication & admin permissions
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Authentication credentials required for curation actions." };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return { success: false, error: "Atelier access restricted to administration." };
    }

    // 2. Validate using Zod schemas
    const parsed = ProductSchema.parse(formData);

    // 3. Insert product record
    const { data: newP, error: insertError } = await supabase
      .from("products")
      .insert({
        name: parsed.name,
        designer: parsed.designer,
        category_id: parsed.category,
        price: parsed.price,
        image: parsed.image,
        description: parsed.description,
        long_description: parsed.longDescription,
        details: parsed.details,
        stock: parsed.stock,
        featured: parsed.featured,
        rating: 5.0,
      })
      .select()
      .single();

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    return { success: true, product: mapProductDbToType(newP) };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to publish curated artifact." };
  }
}

export async function deleteProductAction(id: string) {
  try {
    const supabase = await getSupabaseServerClient();

    // Enforce admin permission tier
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required." };

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return { success: false, error: "Atelier admin permission required." };
    }

    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createReviewAction(productId: string, formData: { authorName: string; rating: number; text: string }) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: newReview, error: reviewError } = await supabase
      .from("reviews")
      .insert({
        product_id: productId,
        user_id: user?.id || null, // Optional authenticated connection
        author_name: formData.authorName,
        rating: formData.rating,
        text: formData.text,
      })
      .select()
      .single();

    if (reviewError) {
      return { success: false, error: reviewError.message };
    }

    // Dynamically recalculate product total average rating
    const { data: reviewsAll } = await supabase
      .from("reviews")
      .select("rating")
      .eq("product_id", productId);

    if (reviewsAll && reviewsAll.length > 0) {
      const avg = reviewsAll.reduce((acc, curr) => acc + curr.rating, 0) / reviewsAll.length;
      await supabase
        .from("products")
        .update({ rating: parseFloat(avg.toFixed(1)) })
        .eq("id", productId);
    }

    return {
      success: true,
      review: {
        author: newReview.author_name,
        rating: newReview.rating,
        text: newReview.text,
        date: new Date(newReview.created_at).toLocaleDateString(),
      }
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
