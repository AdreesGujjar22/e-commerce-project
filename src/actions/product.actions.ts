"use server";

import { getSupabaseServerClient, getSupabaseStatelessClient } from "../lib/supabase/server";
import { ProductSchema } from "../validations";
import { Product, Review } from "../types";
import { deleteFromCloudinary } from "../lib/cloudinary";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Maps a database product entry into the clean Product frontend type
 */
function mapProductDbToType(dbProduct: any): Product {
  let parsedDesc = dbProduct.long_description || dbProduct.description;
  let seoTitle = "";
  let seoDescription = "";
  let slug = dbProduct.slug || "";

  if (parsedDesc && parsedDesc.startsWith("{")) {
    try {
      const parsed = JSON.parse(parsedDesc);
      parsedDesc = parsed.description || "";
      seoTitle = parsed.seoTitle || "";
      seoDescription = parsed.seoDescription || "";
    } catch (_) {
      // safe fallback
    }
  }

  if (!slug && dbProduct.name) {
    slug = generateSlug(dbProduct.name);
  }

  // extract product gallery images if returned in product_images
  const galleryImages = dbProduct.product_images
    ? dbProduct.product_images.map((img: any) => img.image_url)
    : [];

  return {
    id: dbProduct.id,
    name: dbProduct.name,
    slug: slug,
    designer: dbProduct.designer,
    category: dbProduct.category_id || dbProduct.category || "apparel",
    price: Number(dbProduct.price),
    image: dbProduct.image,
    images: galleryImages.length > 0 ? galleryImages : [dbProduct.image],
    description: dbProduct.description,
    longDescription: parsedDesc,
    details: dbProduct.details || [],
    stock: Number(dbProduct.stock),
    featured: Boolean(dbProduct.featured),
    rating: Number(dbProduct.rating || 5.0),
    reviews: dbProduct.reviews || [],
    seoTitle,
    seoDescription,
  };
}

export async function getProductsAction(options?: {
  category?: string;
  featuredOnly?: boolean;
  searchQuery?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const supabase = getSupabaseStatelessClient();
    
    let query = supabase.from("products").select("*, reviews(*), product_images(*)", { count: "exact" });

    if (options?.category && options.category !== "all") {
      query = query.eq("category_id", options.category);
    }

    if (options?.featuredOnly) {
      query = query.eq("featured", true);
    }

    // Add search query support on server side
    if (options?.searchQuery) {
      const search = `%${options.searchQuery}%`;
      query = query.or(`name.ilike.${search},description.ilike.${search},designer.ilike.${search}`);
    }

    // Add sort support on server side
    if (options?.sortBy) {
      if (options.sortBy === "price-low") {
        query = query.order("price", { ascending: true });
      } else if (options.sortBy === "price-high") {
        query = query.order("price", { ascending: false });
      } else if (options.sortBy === "rating") {
        query = query.order("rating", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const limit = options?.limit || 8;
    const page = options?.page;
    if (page !== undefined) {
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);
    }

    const { data: dbProducts, error, count } = await query;

    if (error) {
      console.error("Supabase getProductsAction error:", error);
      return { success: false, error: error.message, products: [], totalCount: 0, totalPages: 0 };
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

    const finalCount = count !== null ? count : products.length;
    const finalPages = page !== undefined ? Math.ceil(finalCount / limit) : 1;

    return { 
      success: true, 
      products, 
      totalCount: finalCount, 
      totalPages: finalPages 
    };
  } catch (err: any) {
    return { 
      success: false, 
      error: err.message || "Failed reading storefront catalogs", 
      products: [], 
      totalCount: 0, 
      totalPages: 0 
    };
  }
}

export async function getProductByIdAction(id: string) {
  try {
    const supabase = getSupabaseStatelessClient();
    
    const { data: p, error } = await supabase
      .from("products")
      .select("*, reviews(*), product_images(*)")
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

export async function getProductBySlugAction(slug: string) {
  try {
    const supabase = getSupabaseStatelessClient();
    
    const { data: dbProducts, error } = await supabase
      .from("products")
      .select("*, reviews(*), product_images(*)");

    if (error) {
      return { success: false, error: error.message, product: null };
    }

    const products: Product[] = (dbProducts || []).map((p: any) => {
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

    const product = products.find((p) => p.slug === slug);
    if (!product) {
      return { success: false, error: "Artifact curation not found.", product: null };
    }

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

    // Enforce title/slug uniqueness on product creation in Supabase
    const { data: existingProducts, error: selectErr } = await supabase
      .from("products")
      .select("name, slug");

    if (!selectErr && existingProducts) {
      const normalizedName = parsed.name.trim().toLowerCase();
      const newSlug = parsed.slug ? generateSlug(parsed.slug) : generateSlug(parsed.name);

      for (const p of existingProducts) {
        if (p.name.trim().toLowerCase() === normalizedName) {
          return { success: false, error: `Product title "${parsed.name}" already exists on an exhibiting SKU. Product titles must be unique.` };
        }
        
        const pSlug = p.slug || generateSlug(p.name);

        if (pSlug === newSlug) {
          return { success: false, error: `Product slug collision. A similar URL slug "${newSlug}" already exists.` };
        }
      }
    }

    const finalSlug = parsed.slug ? generateSlug(parsed.slug) : generateSlug(parsed.name);

    const longDescSerialized = JSON.stringify({
      description: parsed.longDescription,
      seoTitle: parsed.seoTitle || "",
      seoDescription: parsed.seoDescription || "",
    });

    // 3. Insert product record
    const { data: newP, error: insertError } = await supabase
      .from("products")
      .insert({
        name: parsed.name,
        slug: finalSlug,
        designer: parsed.designer,
        category_id: parsed.category,
        price: parsed.price,
        image: parsed.image,
        description: parsed.description,
        long_description: longDescSerialized,
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

    // 4. Save supplementary gallery product image records
    if (parsed.images && parsed.images.length > 0) {
      const imageRows = parsed.images.map((imgUrl: string) => ({
        product_id: newP.id,
        image_url: imgUrl,
        is_primary: imgUrl === parsed.image,
      }));
      await supabase.from("product_images").insert(imageRows);
    }

    return { success: true, product: mapProductDbToType({ ...newP, product_images: (parsed.images || []).map(url => ({ image_url: url })) }) };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to publish curated artifact." };
  }
}

export async function updateProductAction(id: string, formData: any) {
  try {
    const supabase = await getSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Access Denied." };

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return { success: false, error: "Administration authorization needed." };
    }

    const parsed = ProductSchema.parse(formData);

    // Enforce title/slug uniqueness on update in Supabase
    const { data: existingProducts, error: selectErr } = await supabase
      .from("products")
      .select("id, name, slug");

    if (!selectErr && existingProducts) {
      const normalizedName = parsed.name.trim().toLowerCase();
      const newSlug = parsed.slug ? generateSlug(parsed.slug) : generateSlug(parsed.name);

      for (const p of existingProducts) {
        if (p.id === id) continue; // skip current product

        if (p.name.trim().toLowerCase() === normalizedName) {
          return { success: false, error: `Product title "${parsed.name}" already exists on another exhibiting SKU. Product titles must be unique.` };
        }
        
        const pSlug = p.slug || generateSlug(p.name);

        if (pSlug === newSlug) {
          return { success: false, error: `Product slug collision. Another product uses URL slug "${newSlug}".` };
        }
      }
    }

    const finalSlug = parsed.slug ? generateSlug(parsed.slug) : generateSlug(parsed.name);

    const longDescSerialized = JSON.stringify({
      description: parsed.longDescription,
      seoTitle: parsed.seoTitle || "",
      seoDescription: parsed.seoDescription || "",
    });

    const { data: updatedP, error: updateError } = await supabase
      .from("products")
      .update({
        name: parsed.name,
        slug: finalSlug,
        designer: parsed.designer,
        category_id: parsed.category,
        price: parsed.price,
        image: parsed.image,
        description: parsed.description,
        long_description: longDescSerialized,
        details: parsed.details,
        stock: parsed.stock,
        featured: parsed.featured,
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Get old images to detect unused and deleted from Cloudinary
    const { data: oldImages } = await supabase
      .from("product_images")
      .select("image_url")
      .eq("product_id", id);

    const oldUrls = (oldImages || []).map((img: any) => img.image_url);
    const newUrls = parsed.images || [];

    const removedUrls = oldUrls.filter((url: string) => !newUrls.includes(url));
    if (updatedP.image && !newUrls.includes(updatedP.image) && updatedP.image !== parsed.image) {
      removedUrls.push(updatedP.image);
    }

    for (const url of removedUrls) {
      await deleteFromCloudinary(url);
    }

    // Sync product images table
    await supabase.from("product_images").delete().eq("product_id", id);

    if (newUrls.length > 0) {
      const imageRows = newUrls.map((imgUrl: string) => ({
        product_id: id,
        image_url: imgUrl,
        is_primary: imgUrl === parsed.image,
      }));
      await supabase.from("product_images").insert(imageRows);
    }

    return { success: true, product: mapProductDbToType({ ...updatedP, product_images: newUrls.map(url => ({ image_url: url })) }) };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update curated product." };
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

    // Fetch product display photo & its other images records for automatic deletion from Cloudinary
    const { data: dbProd } = await supabase
      .from("products")
      .select("image, product_images(image_url)")
      .eq("id", id)
      .maybeSingle();

    if (dbProd) {
      const imagesToDelete = new Set<string>();
      if (dbProd.image) {
        imagesToDelete.add(dbProd.image);
      }
      if (dbProd.product_images) {
        dbProd.product_images.forEach((img: any) => imagesToDelete.add(img.image_url));
      }
      for (const url of Array.from(imagesToDelete)) {
        await deleteFromCloudinary(url);
      }
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
