"use server";

import { getSupabaseServerClient } from "../lib/supabase/server";

export async function getUsersListAction() {
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
      return { success: false, error: "Administration access tier is required." };
    }

    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true, profiles: profiles || [] };
  } catch (err: any) {
    return { success: false, error: err.message, profiles: [] };
  }
}

export async function getAllReviewsAction() {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Forbidden." };

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") return { success: false, error: "Admin only." };

    const { data: reviews, error } = await supabase
      .from("reviews")
      .select("*, products(name)")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true, reviews: reviews || [] };
  } catch (err: any) {
    return { success: false, error: err.message, reviews: [] };
  }
}

export async function adminDeleteReviewAction(id: string) {
  try {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getCouponsAction() {
  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true, coupons: data || [] };
  } catch (err: any) {
    return { success: false, error: err.message, coupons: [] };
  }
}

export async function createCouponAction(code: string, discountPercent: number) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Access Denied." };

    const { data: coupon, error } = await supabase
      .from("coupons")
      .insert({
        code: code.toUpperCase().trim(),
        discount_percent: Number(discountPercent),
        active: true,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, coupon };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function toggleCouponActiveAction(id: string, active: boolean) {
  try {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase
      .from("coupons")
      .update({ active })
      .eq("id", id);

    if (error) throw error;

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
