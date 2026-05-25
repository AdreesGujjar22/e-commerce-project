"use server";

import { getSupabaseServerClient } from "../lib/supabase/server";
import { getSupabaseAdminClient } from "../lib/supabase/admin";
import { AuthInputSchema } from "../validations";
import { cookies } from "next/headers";

/**
 * Ensures the single administrative account is synchronized with Supabase Auth & Profiles on-demand
 */
async function ensureAdminSeeded(email: string) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword || email.toLowerCase() !== adminEmail.toLowerCase()) {
    return;
  }

  const adminClient = getSupabaseAdminClient();
  if (!adminClient) return;

  try {
    // 1. Check if the user exists in profiles with admin role or auth
    const { data: existingUser, error: findError } = await adminClient.auth.admin.listUsers();
    
    if (findError) {
      console.error("Admin user list check failed during seeding:", findError);
      return;
    }

    const adminUserRecord = (existingUser?.users as any[] || [])?.find(
      (u) => u.email?.toLowerCase() === adminEmail.toLowerCase()
    );

    let adminId = adminUserRecord?.id;

    if (!adminUserRecord) {
      console.log(`Admin account not found. Seeding admin: ${adminEmail}`);
      // 2. Programmatically create admin user in auth
      const { data: newAdmin, error: createError } = await adminClient.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: { full_name: "Grand Steward Admin" },
      });

      if (createError) {
        console.error("Failed to programmatically seed auth admin:", createError);
        return;
      }

      adminId = newAdmin.user?.id;
    } else {
      // Admin exists, let's make sure password is synchronized
      await adminClient.auth.admin.updateUserById(adminId!, {
        password: adminPassword,
      });
    }

    if (adminId) {
      // 3. Upsert admin profile inside profiles table
      const { error: profileError } = await adminClient
        .from("profiles")
        .upsert({
          id: adminId,
          full_name: "Grand Steward Admin",
          role: "admin"
        });

      if (profileError) {
        console.error("Failed syncing profile role for admin user:", profileError);
      } else {
        console.log(`Admin role synchronized inside profiles table for ${adminEmail}`);
      }
    }
  } catch (err) {
    console.error("Friction seeding admin accounts:", err);
  }
}

export async function loginAction(formData: any) {
  try {
    const validated = AuthInputSchema.parse(formData);
    
    // Auto-seed admin user if matching credentials
    await ensureAdminSeeded(validated.email);

    const supabase = await getSupabaseServerClient();
    
    // Auth login in Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validated.email,
      password: validated.password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Double check user profile exists
    if (data.user) {
      // If it is the admin email, double verify they are flagged as admin in profiling
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail && data.user.email?.toLowerCase() === adminEmail.toLowerCase()) {
        const adminClient = getSupabaseAdminClient();
        if (adminClient) {
          await adminClient.from("profiles").upsert({
            id: data.user.id,
            full_name: "Grand Steward Admin",
            role: "admin",
          });
        }
      } else {
        // Enforce customer profile exists
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", data.user.id)
          .single();

        if (!profile) {
          await supabase.from("profiles").insert({
            id: data.user.id,
            full_name: validated.fullName || "Arooj Arts",
            role: "customer"
          });
        }
      }
    }

    // Retrieve user profile to determine role
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: profile?.full_name || "Arooj Arts",
        role: profile?.role || "customer",
      },
      session: data.session,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Credential authentication failure" };
  }
}

export async function signupAction(formData: any) {
  try {
    const validated = AuthInputSchema.parse(formData);
    const supabase = await getSupabaseServerClient();

    // Block manual registration of the admin email through public signup
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail && validated.email.toLowerCase() === adminEmail.toLowerCase()) {
      return { success: false, error: "Administrative email restricted. Please sign in directly." };
    }

    const { data, error } = await supabase.auth.signUp({
      email: validated.email,
      password: validated.password,
      options: {
        data: {
          full_name: validated.fullName || "Bespoke Patron",
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user) {
      // Manual trigger setup check
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: validated.fullName || "Bespoke Patron",
        role: "customer",
      });
      if (profileError) console.error("Profile creation delay:", profileError);
    }

    return {
      success: true,
      user: {
        id: data.user?.id,
        email: data.user?.email,
        fullName: validated.fullName || "Bespoke Patron",
        role: "customer",
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Registration failure" };
  }
}

export async function logoutAction() {
  try {
    const supabase = await getSupabaseServerClient();
    await supabase.auth.signOut();
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Signout failed" };
  }
}

export async function getSessionUserAction() {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: true, user: null };
    }

    // Ensure profile is synced
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: profile?.full_name || user.user_metadata?.full_name || "Arooj Arts",
        role: profile?.role || "customer",
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Context extraction failure", user: null };
  }
}
