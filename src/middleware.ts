import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // If Supabase keys are not set yet, skip checking to prevent crash so they can read the warning UI
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        } catch {
          // Safe fallback for edge runtimes
        }
      },
    },
  });

  try {
    const { data: { user } } = await supabase.auth.getUser();

    // Protect administrative console route
    if (request.nextUrl.pathname.startsWith("/admin")) {
      if (!user) {
        return NextResponse.redirect(new URL("/auth", request.url));
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile || profile.role !== "admin") {
        return NextResponse.redirect(new URL("/auth?role_error=true", request.url));
      }
    }
  } catch (err) {
    console.error("Middleware session checkpoint failure:", err);
  }

  return response;
}

export const config = {
  matcher: [
    // Match /admin route exclusively for protection
    "/admin/:path*",
    "/checkout/:path*",
  ],
};
