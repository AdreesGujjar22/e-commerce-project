"use server";

import { getSupabaseServerClient } from "../lib/supabase/server";
import { CartItem } from "../types";

/**
 * Returns or provisions a database cart record for the active user
 */
async function getOrCreateUserCartId(supabase: any, userId: string): Promise<string> {
  const { data: cart, error } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (cart) return cart.id;

  // Otherwise, create a clean database cart record
  const { data: newCart, error: createError } = await supabase
    .from("carts")
    .insert({ user_id: userId })
    .select("id")
    .single();

  if (createError) {
    throw new Error(`Cart provisioning failed: ${createError.message}`);
  }

  return newCart.id;
}

export async function fetchUserCartAction() {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: true, items: [] as CartItem[] };
    }

    const cartId = await getOrCreateUserCartId(supabase, user.id);

    const { data: dbItems, error: itemsError } = await supabase
      .from("cart_items")
      .select("*, products(*)")
      .eq("cart_id", cartId);

    if (itemsError) {
      return { success: false, error: itemsError.message, items: [] };
    }

    const items: CartItem[] = (dbItems || []).map((item: any) => ({
      product: {
        id: item.products.id,
        name: item.products.name,
        slug: (() => {
          let sl = "";
          const longDesc = item.products.long_description;
          if (longDesc && longDesc.startsWith("{")) {
            try {
              sl = JSON.parse(longDesc).slug || "";
            } catch (_) {}
          }
          if (!sl && item.products.name) {
            sl = item.products.name
              .toLowerCase()
              .trim()
              .replace(/[^a-z0-9-\s]/g, "")
              .replace(/\s+/g, "-")
              .replace(/-+/g, "-")
              .replace(/^-+|-+$/g, "");
          }
          return sl;
        })(),
        designer: item.products.designer,
        category: item.products.category_id || "apparel",
        price: Number(item.products.price),
        image: item.products.image,
        description: item.products.description,
        longDescription: item.products.long_description || item.products.description,
        details: item.products.details || [],
        stock: Number(item.products.stock),
        featured: Boolean(item.products.featured),
        rating: Number(item.products.rating || 5.0),
        reviews: [],
      },
      quantity: Number(item.quantity),
      size: item.size || "M",
      engraving: item.engraving || "",
    }));

    return { success: true, items };
  } catch (err: any) {
    return { success: false, error: err.message, items: [] };
  }
}

export async function addToCartAction(productId: string, quantity = 1, size = "M", engraving = "") {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Anonymous cart persistence not supported on the backend." };
    }

    // Verify stock availability
    const { data: product, error: findError } = await supabase
      .from("products")
      .select("stock, name")
      .eq("id", productId)
      .single();

    if (findError || !product) {
      return { success: false, error: "Product not found." };
    }

    if (product.stock < quantity) {
      return { success: false, error: `Only ${product.stock} units of ${product.name} left in stock.` };
    }

    const cartId = await getOrCreateUserCartId(supabase, user.id);

    // Try finding existing same item
    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("cart_id", cartId)
      .eq("product_id", productId)
      .eq("size", size)
      .maybeSingle();

    if (existingItem) {
      const finalQty = existingItem.quantity + quantity;
      if (finalQty > product.stock) {
        return { success: false, error: `Demanded quantity exceeds stock limit of ${product.stock}.` };
      }

      const { error: updateError } = await supabase
        .from("cart_items")
        .update({ quantity: finalQty, engraving })
        .eq("id", existingItem.id);

      if (updateError) return { success: false, error: updateError.message };
    } else {
      const { error: insertError } = await supabase
        .from("cart_items")
        .insert({
          cart_id: cartId,
          product_id: productId,
          quantity,
          size,
          engraving,
        });

      if (insertError) return { success: false, error: insertError.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateCartQuantityAction(productId: string, size: string, quantity: number) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Authentication required." };

    const cartId = await getOrCreateUserCartId(supabase, user.id);

    // Check stock first
    const { data: product } = await supabase
      .from("products")
      .select("stock")
      .eq("id", productId)
      .single();

    if (product && quantity > product.stock) {
      return { success: false, error: `Only ${product.stock} available.` };
    }

    const { error: updateError } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("cart_id", cartId)
      .eq("product_id", productId)
      .eq("size", size);

    if (updateError) return { success: false, error: updateError.message };

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function removeFromCartAction(productId: string, size: string) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Authentication required." };

    const cartId = await getOrCreateUserCartId(supabase, user.id);

    const { error: deleteError } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", cartId)
      .eq("product_id", productId)
      .eq("size", size);

    if (deleteError) return { success: false, error: deleteError.message };

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function clearCartAction() {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: true };

    const cartId = await getOrCreateUserCartId(supabase, user.id);

    const { error: cleanError } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", cartId);

    if (cleanError) return { success: false, error: cleanError.message };

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function syncGuestCartAction(guestItems: CartItem[]) {
  try {
    if (!guestItems || guestItems.length === 0) return { success: true };

    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: true };

    const cartId = await getOrCreateUserCartId(supabase, user.id);

    for (const item of guestItems) {
      const { data: existing } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("cart_id", cartId)
        .eq("product_id", item.product.id)
        .eq("size", item.size || "M")
        .maybeSingle();

      if (existing) {
        const mergedQty = Math.min(existing.quantity + item.quantity, item.product.stock);
        await supabase
          .from("cart_items")
          .update({ quantity: mergedQty })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("cart_items")
          .insert({
            cart_id: cartId,
            product_id: item.product.id,
            quantity: item.quantity,
            size: item.size || "M",
            engraving: item.engraving || "",
          });
      }
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
