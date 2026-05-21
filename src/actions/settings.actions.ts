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
  chatbot_instruction?: string;
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
  chatbot_instruction: "You are Aura, the private AI Styling Concierge for Maison L'Étoile, a high-end ultra-premium e-commerce boutique selling silk apparel, Swiss timepieces, Kyoto clay vases, and rare organic sandalwood perfumes. Speak with extreme sophistication, courtesy, and storytelling style. Tailor recommendations to look editorial and high-prestige."
};

export async function getSettingsAction(): Promise<{ success: boolean; settings: StoreSettings; error?: string }> {
  try {
    const supabase = await getSupabaseServerClient();
    
    // Select from "categories" table where id is "system-store-settings"
    const { data: catData, error: catError } = await supabase
      .from("categories")
      .select("*")
      .eq("id", "system-store-settings")
      .maybeSingle();

    if (catData && catData.banner_url) {
      try {
        const parsed = JSON.parse(catData.banner_url);
        return { success: true, settings: { ...DEFAULT_SETTINGS, ...parsed } };
      } catch (e) {
        // Fallback below
      }
    }

    return { success: true, settings: DEFAULT_SETTINGS };
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

    // Load current settings to perform merge
    const currentRes = await getSettingsAction();
    const mergedSettings = { ...currentRes.settings, ...settings };

    // JSON serialize settings to save inside banner_url column
    const serialized = JSON.stringify(mergedSettings);

    const { error } = await supabase
      .from("categories")
      .upsert({
        id: "system-store-settings",
        name: "System Store Settings Storage",
        banner_url: serialized
      });

    if (error) {
      console.error("Supabase upsert settings error:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed saving configurations" };
  }
}
