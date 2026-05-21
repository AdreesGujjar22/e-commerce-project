"use server";

import { getSupabaseServerClient } from "../lib/supabase/server";
import { uploadToCloudinary, deleteFromCloudinary } from "../lib/cloudinary";

async function verifyAdmin() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Authentication required.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Administration permissions required.");
  }
}

export async function uploadImageAction(base64String: string, folder = "Arooj_letoile") {
  try {
    await verifyAdmin();
    const secureUrl = await uploadToCloudinary(base64String, folder);
    return { success: true, url: secureUrl };
  } catch (err: any) {
    console.error("Cloudinary upload action failed:", err);
    return { success: false, error: err.message || "Upload failed." };
  }
}

export async function deleteImageAction(url: string) {
  try {
    await verifyAdmin();
    const deleted = await deleteFromCloudinary(url);
    return { success: true, deleted };
  } catch (err: any) {
    console.error("Cloudinary deletion action failed:", err);
    return { success: false, error: err.message || "Deletion failed." };
  }
}
