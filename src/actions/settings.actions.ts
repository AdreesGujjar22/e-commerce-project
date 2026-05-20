"use server";

import { getSupabaseServerClient } from "../lib/supabase/server";

export interface StoreSettings {
  facebook_url: string;
  instagram_url: string;
  tiktok_url: string;
  whatsapp_number: string;
  youtube_url: string;
  privacy_policy: string;
  terms_conditions: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
}

const DEFAULT_SETTINGS: StoreSettings = {
  facebook_url: "https://facebook.com/maisonletoile",
  instagram_url: "https://instagram.com/maisonletoile",
  tiktok_url: "https://tiktok.com/@maisonletoile",
  whatsapp_number: "+923001234567",
  youtube_url: "https://youtube.com/c/maisonletoile",
  privacy_policy: "We respect your privacy. We collect your email and delivery details only to deliver your orders and improve our customer service. Your data is 100% secure with us.",
  terms_conditions: "All orders placed on Maison L'Étoile are subject to product availability. We offer standard courier delivery within 3-5 working days across Pakistan. Cash on delivery checkup terms apply.",
  contact_email: "support@maisonletoile.com",
  contact_phone: "+92 300 1234567",
  contact_address: "Maison Outlet Building, M.M. Alam Road, Gulberg III, Lahore, Pakistan",
};

export async function getSettingsAction(): Promise<{ success: boolean; settings: StoreSettings; error?: string }> {
  try {
    const supabase = await getSupabaseServerClient();
    
    // Attempt to select from "settings" table
    const { data, error } = await supabase
      .from("store_settings")
      .select("*")
      .eq("id", "global")
      .maybeSingle();

    if (error) {
      // If table doesn't exist, return default settings gracefully
      console.warn("store_settings view or table missing, falling back to defaults:", error.message);
      return { success: true, settings: DEFAULT_SETTINGS };
    }

    if (!data) {
      // Table exists but no record, try to insert defaults
      const { data: inserted, error: insertError } = await supabase
        .from("store_settings")
        .insert({ id: "global", ...DEFAULT_SETTINGS })
        .select()
        .maybeSingle();
        
      if (insertError) {
        return { success: true, settings: DEFAULT_SETTINGS };
      }
      return { success: true, settings: inserted || DEFAULT_SETTINGS };
    }

    return { success: true, settings: data };
  } catch (err: any) {
    console.error("Failed to load settings from Supabase:", err);
    return { success: true, settings: DEFAULT_SETTINGS };
  }
}

export async function updateSettingsAction(settings: Partial<StoreSettings>) {
  try {
    const supabase = await getSupabaseServerClient();

    // Verify user is administrator
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication status required." };

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return { success: false, error: "Only admin can update store settings." };
    }

    // Attempt to upsert/update
    const { error } = await supabase
      .from("store_settings")
      .upsert({ id: "global", ...settings });

    if (error) {
      console.error("Supabase upsert settings error:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed saving configurations" };
  }
}
